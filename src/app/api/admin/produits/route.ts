import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db"
import { authOptions } from "@/lib/auth"
import { z } from "zod"

const productSchema = z.object({
  sku: z.string().min(3),
  name: z.string().min(2),
  description: z.string().optional(),
  basePrice: z.number().positive(),
  promoPrice: z.number().optional().nullable(),
  stockQuantity: z.number().int().min(0),
  moq: z.number().int().min(1),
  packSize: z.number().int().min(1),
  vatRate: z.number().default(0.20),
  categoryId: z.string().optional(),
  brandId: z.string().optional(),
  isActive: z.boolean().default(true),
})

// GET /api/admin/produits
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const search = searchParams.get("search")
    const category = searchParams.get("category")
    const lowStock = searchParams.get("lowStock") === "true"

    const where: any = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
      ]
    }

    if (category && category !== "all") {
      where.categoryId = category
    }

    if (lowStock) {
      where.stockQuantity = { lte: { lowStockThreshold: true } }
    }

    const [products, total, categories, brands] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: { select: { id: true, name: true } },
          brand: { select: { id: true, name: true } },
          images: { take: 1, select: { url: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { updatedAt: "desc" },
      }),
      prisma.product.count({ where }),
      prisma.category.findMany({ where: { isActive: true }, select: { id: true, name: true } }),
      prisma.brand.findMany({ where: { isActive: true }, select: { id: true, name: true } }),
    ])

    return NextResponse.json({
      products: products.map(p => ({
        id: p.id,
        sku: p.sku,
        name: p.name,
        basePrice: Number(p.basePrice),
        promoPrice: p.promoPrice ? Number(p.promoPrice) : null,
        stockQuantity: p.stockQuantity,
        moq: p.moq,
        packSize: p.packSize,
        isActive: p.isActive,
        category: p.category,
        brand: p.brand,
        image: p.images[0]?.url,
      })),
      categories,
      brands,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })

  } catch (error) {
    console.error("Admin products GET error:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

// POST /api/admin/produits - Create product
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validated = productSchema.parse(body)

    // Check SKU uniqueness
    const existing = await prisma.product.findUnique({
      where: { sku: validated.sku }
    })

    if (existing) {
      return NextResponse.json({ error: "SKU déjà utilisé" }, { status: 409 })
    }

    const product = await prisma.product.create({
      data: {
        ...validated,
        slug: validated.sku.toLowerCase().replace(/[^a-z0-9]/g, "-"),
      }
    })

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: "PRODUCT_CREATED",
        entityType: "Product",
        entityId: product.id,
        userId: session.user.id,
        newValues: validated,
      }
    })

    return NextResponse.json({ success: true, product }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error("Admin products POST error:", error)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}
