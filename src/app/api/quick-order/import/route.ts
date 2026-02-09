import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

// POST /api/quick-order/import - Import products by SKU list
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { items } = body as { items: { sku: string; quantity: number }[] }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Items array is required" },
        { status: 400 }
      )
    }

    const companyId = session.user.companyId
    const results = {
      found: [] as any[],
      notFound: [] as string[],
      invalidQuantity: [] as string[],
    }

    // Find all products by SKU
    const skus = items.map((item) => item.sku.toUpperCase())
    const products = await prisma.product.findMany({
      where: {
        sku: {
          in: skus,
        },
        isActive: true,
      },
      include: {
        stock: {
          select: {
            quantity: true,
          },
        },
        customerPrices: {
          where: {
            companyId: companyId,
          },
          select: {
            price: true,
          },
          take: 1,
        },
      },
    })

    // Create a map for quick lookup
    const productMap = new Map(products.map((p) => [p.sku.toUpperCase(), p]))

    // Process each item
    for (const item of items) {
      const sku = item.sku.toUpperCase()
      const product = productMap.get(sku)

      if (!product) {
        results.notFound.push(item.sku)
        continue
      }

      // Validate quantity against MOQ and pack size
      const requestedQty = item.quantity || product.moq
      if (requestedQty < product.moq) {
        results.invalidQuantity.push(`${item.sku} (MOQ: ${product.moq})`)
        continue
      }
      if (requestedQty % product.packSize !== 0) {
        results.invalidQuantity.push(`${item.sku} (multiple de ${product.packSize})`)
        continue
      }

      const customerPrice = product.customerPrices[0]?.price
      const basePrice = product.basePrice
      const price = customerPrice !== undefined && customerPrice !== null
        ? customerPrice
        : basePrice

      results.found.push({
        id: product.id,
        sku: product.sku,
        name: product.name,
        brand: product.brand || "",
        unitPrice: Number(price),
        quantity: requestedQty,
        packSize: product.packSize,
        moq: product.moq,
        stockQuantity: product.stock?.quantity || 0,
      })
    }

    return NextResponse.json({
      success: true,
      items: results.found,
      notFound: results.notFound,
      invalidQuantity: results.invalidQuantity,
      totalRequested: items.length,
      totalFound: results.found.length,
    })
  } catch (error) {
    console.error("Error importing products:", error)
    return NextResponse.json(
      { error: "Failed to import products" },
      { status: 500 }
    )
  }
}
