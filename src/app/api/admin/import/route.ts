import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import * as XLSX from "xlsx"
import { prisma } from "@/lib/db"
import { authOptions } from "@/lib/auth"
import { generateImportJobNumber } from "@/lib/utils"

// Validation functions
function isValidSKU(sku: string): boolean {
  return /^[A-Z0-9_-]+$/i.test(sku) && sku.length >= 3
}

function isValidPrice(price: any): boolean {
  const num = Number(price)
  return !isNaN(num) && num >= 0
}

function isValidStock(stock: any): boolean {
  const num = Number(stock)
  return !isNaN(num) && num >= 0 && Number.isInteger(num)
}

// Parse file (CSV or Excel)
async function parseFile(file: File): Promise<any[]> {
  const buffer = await file.arrayBuffer()
  const fileName = file.name.toLowerCase()
  
  if (fileName.endsWith('.csv')) {
    const text = new TextDecoder().decode(buffer)
    const lines = text.split('\n').filter(line => line.trim())
    const headers = lines[0].split(',').map(h => h.trim())
    
    return lines.slice(1).map((line, index) => {
      const values = line.split(',').map(v => v.trim())
      const row: Record<string, any> = { _rowNumber: index + 2 }
      headers.forEach((header, i) => {
        row[header] = values[i] || ''
      })
      return row
    })
  } else {
    // Excel
    const workbook = XLSX.read(buffer, { type: 'array' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]
    
    if (data.length < 2) return []
    
    const headers = data[0].map(h => String(h).trim())
    return data.slice(1).map((row, index) => {
      const obj: Record<string, any> = { _rowNumber: index + 2 }
      headers.forEach((header, i) => {
        obj[header] = row[i] ?? ''
      })
      return obj
    })
  }
}

// POST - Upload and validate
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const importType = formData.get("type") as string || "PRODUCT_FULL"
    const importMode = formData.get("mode") as string || "UPSERT"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    const validTypes = ['.csv', '.xlsx', '.xls']
    const fileExt = file.name.toLowerCase().slice(file.name.lastIndexOf('.'))
    if (!validTypes.includes(fileExt)) {
      return NextResponse.json(
        { error: "Invalid file type. Only CSV and Excel files are allowed." },
        { status: 400 }
      )
    }

    // Parse file
    const rows = await parseFile(file)

    // Validate rows based on import type
    const errors: any[] = []
    const preview: any[] = []

    for (const row of rows) {
      const rowErrors: string[] = []
      const sku = String(row.sku || '').trim()
      
      // Validate SKU
      if (!sku) {
        rowErrors.push("SKU est requis")
      } else if (!isValidSKU(sku)) {
        rowErrors.push("Format de SKU invalide")
      }

      // Type-specific validation
      if (importType === "PRODUCT_FULL") {
        if (!row.name_fr) {
          rowErrors.push("Nom (name_fr) est requis")
        }
        if (row.price_base && !isValidPrice(row.price_base)) {
          rowErrors.push("Prix de base invalide")
        }
      } else if (importType === "PRODUCT_STOCK") {
        if (row.stock_quantity !== undefined && !isValidStock(row.stock_quantity)) {
          rowErrors.push("Quantité de stock invalide")
        }
      } else if (importType === "PRODUCT_PRICE") {
        if (row.price_base !== undefined && !isValidPrice(row.price_base)) {
          rowErrors.push("Prix de base invalide")
        }
        if (row.promo_price !== undefined && !isValidPrice(row.promo_price)) {
          rowErrors.push("Prix promo invalide")
        }
      }

      // Check if product exists
      const existingProduct = sku ? await prisma.product.findUnique({
        where: { sku },
      }) : null

      // Determine action based on mode
      let action: "CREATE" | "UPDATE" | "SKIP" | "ERROR" = "ERROR"
      if (rowErrors.length > 0) {
        action = "ERROR"
      } else if (existingProduct) {
        if (importMode === "CREATE_ONLY") {
          action = "SKIP"
        } else {
          action = "UPDATE"
        }
      } else {
        if (importMode === "UPDATE_ONLY") {
          action = "SKIP"
        } else if (importType !== "PRODUCT_STOCK" && importType !== "PRODUCT_PRICE") {
          action = "CREATE"
        } else {
          action = "ERROR"
          rowErrors.push("Produit inexistant (création non autorisée)")
        }
      }

      const previewRow = {
        rowNumber: row._rowNumber,
        sku,
        nameFr: row.name_fr,
        action,
        errors: rowErrors,
        changes: {},
      }

      // Calculate changes for updates
      if (action === "UPDATE" && existingProduct) {
        const changes: Record<string, { old: any; new: any }> = {}
        
        if (importType === "PRODUCT_FULL" || importType === "PRODUCT_PRICE") {
          if (row.price_base && Number(row.price_base) !== Number(existingProduct.basePrice)) {
            changes.price_base = {
              old: Number(existingProduct.basePrice),
              new: Number(row.price_base),
            }
          }
        }
        
        if (importType === "PRODUCT_FULL" || importType === "PRODUCT_STOCK") {
          if (row.stock_quantity !== undefined && Number(row.stock_quantity) !== existingProduct.stockQuantity) {
            changes.stock_quantity = {
              old: existingProduct.stockQuantity,
              new: Number(row.stock_quantity),
            }
          }
        }
        
        previewRow.changes = changes
      }

      preview.push(previewRow)

      if (rowErrors.length > 0) {
        errors.push({
          rowNumber: row._rowNumber,
          sku,
          errors: rowErrors,
        })
      }
    }

    // Create import job
    const importJob = await prisma.importJob.create({
      data: {
        type: importType as any,
        fileName: file.name,
        status: "VALIDATED",
        totalRows: rows.length,
        successRows: preview.filter(p => p.action !== "ERROR" && p.action !== "SKIP").length,
        errorRows: errors.length,
        previewData: preview,
        errors: errors,
        userId: session.user.id,
      },
    })

    return NextResponse.json({
      jobId: importJob.id,
      preview,
      summary: {
        total: rows.length,
        toCreate: preview.filter(p => p.action === "CREATE").length,
        toUpdate: preview.filter(p => p.action === "UPDATE").length,
        skipped: preview.filter(p => p.action === "SKIP").length,
        errors: errors.length,
      },
    })
  } catch (error) {
    console.error("Import validation error:", error)
    return NextResponse.json(
      { error: "Failed to process import file" },
      { status: 500 }
    )
  }
}

// PUT - Confirm and execute import
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { jobId } = await request.json()

    const importJob = await prisma.importJob.findUnique({
      where: { id: jobId },
    })

    if (!importJob) {
      return NextResponse.json({ error: "Import job not found" }, { status: 404 })
    }

    if (importJob.status !== "VALIDATED") {
      return NextResponse.json(
        { error: "Import job already processed" },
        { status: 400 }
      )
    }

    // Update status to processing
    await prisma.importJob.update({
      where: { id: jobId },
      data: { status: "PROCESSING" },
    })

    const preview = importJob.previewData as any[]
    let successCount = 0
    let errorCount = 0

    // Process each row
    for (const row of preview) {
      if (row.action === "ERROR" || row.action === "SKIP") continue

      try {
        const data: any = {}

        if (importJob.type === "PRODUCT_FULL" || importJob.type === "PRODUCT_PRICE") {
          if (Object.keys(row.changes).includes("price_base")) {
            data.basePrice = row.changes.price_base.new
          }
        }

        if (importJob.type === "PRODUCT_FULL" || importJob.type === "PRODUCT_STOCK") {
          if (Object.keys(row.changes).includes("stock_quantity")) {
            data.stockQuantity = row.changes.stock_quantity.new
          }
        }

        if (row.action === "CREATE") {
          // Create new product
          await prisma.product.create({
            data: {
              sku: row.sku,
              nameFr: row.nameFr || row.name_fr,
              slug: row.sku.toLowerCase().replace(/[^a-z0-9]/g, "-"),
              basePrice: Number(row.price_base) || 0,
              stockQuantity: Number(row.stock_quantity) || 0,
              unit: "UNIT",
              packSize: Number(row.pack_size) || 1,
              moq: Number(row.moq) || 1,
              taxRate: Number(row.tax_rate) || 0.20,
              isActive: row.is_active !== "false",
            },
          })
        } else if (row.action === "UPDATE") {
          // Update existing product
          await prisma.product.update({
            where: { sku: row.sku },
            data,
          })
        }

        successCount++
      } catch (error) {
        console.error(`Error processing row ${row.rowNumber}:`, error)
        errorCount++
      }
    }

    // Update import job
    await prisma.importJob.update({
      where: { id: jobId },
      data: {
        status: errorCount > 0 ? "FAILED" : "COMPLETED",
        successRows: successCount,
        errorRows: errorCount,
        executedAt: new Date(),
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: "PRODUCT_IMPORT",
        entityType: "ImportJob",
        entityId: jobId,
        metadata: {
          type: importJob.type,
          successCount,
          errorCount,
        },
        userId: session.user.id,
      },
    })

    return NextResponse.json({
      success: true,
      summary: {
        success: successCount,
        errors: errorCount,
      },
    })
  } catch (error) {
    console.error("Import execution error:", error)
    return NextResponse.json(
      { error: "Failed to execute import" },
      { status: 500 }
    )
  }
}
