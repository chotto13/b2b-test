import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Allow public access to products for browsing, but pricing requires auth
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "12")
    const category = searchParams.get("category")
    const brand = searchParams.get("brand")
    const search = searchParams.get("search")
    const inStock = searchParams.get("inStock") === "true"
    const sortBy = searchParams.get("sortBy") || "createdAt"
    const sortOrder = searchParams.get("sortOrder") || "desc"

    const where: any = { isActive: true }

    if (category && category !== "all") {
      where.category = { slug: category }
    }

    if (brand && brand !== "all") {
      where.brand = { slug: brand }
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
        { barcode: { contains: search, mode: "insensitive" } },
      ]
    }

    if (inStock) {
      where.stockQuantity = { gt: 0 }
    }

    // Get user's company pricing if authenticated
    let customerPriceMap: Record<string, number> = {}
    
    if (session?.user?.companyId) {
      const customerPrices = await prisma.customerPrice.findMany({
        where: {
          OR: [
            { companyId: session.user.companyId },
            { priceList: { companies: { some: { id: session.user.companyId } } } }
          ]
        },
        select: {
          productId: true,
          price: true,
        }
      })
      
      customerPrices.forEach(cp => {
        customerPriceMap[cp.productId] = Number(cp.price)
      })
    }

    const skip = (page - 1) * limit

    const [products, total, categories, brands] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          brand: { select: { id: true, name: true, slug: true } },
          images: {
            take: 1,
            select: { url: true, isPrimary: true },
            orderBy: { sortOrder: 'asc' }
          },
        },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.product.count({ where }),
      prisma.category.findMany({
        where: { isActive: true },
        select: { id: true, name: true, slug: true, _count: { select: { products: true } } },
        orderBy: { name: 'asc' }
      }),
      prisma.brand.findMany({
        where: { isActive: true },
        select: { id: true, name: true, slug: true },
        orderBy: { name: 'asc' }
      }),
    ])

    // Calculate final price for each product
    const productsWithPricing = products.map((product) => {
      const customerPrice = customerPriceMap[product.id]
      const basePrice = Number(product.basePrice)
      const promoPrice = product.promoPrice ? Number(product.promoPrice) : null
      
      // Use customer price if available, otherwise use promo or base
      const finalPrice = customerPrice || promoPrice || basePrice
      const hasDiscount = finalPrice < basePrice

      return {
        id: product.id,
        sku: product.sku,
        name: product.name,
        slug: product.slug,
        description: product.description,
        shortDescription: product.shortDescription,
        basePrice,
        finalPrice,
        promoPrice,
        hasDiscount,
        vatRate: Number(product.vatRate),
        stockQuantity: product.stockQuantity,
        moq: product.moq,
        packSize: product.packSize,
        unit: product.unit,
        isActive: product.isActive,
        category: product.category,
        brand: product.brand,
        image: product.images[0]?.url || null,
        isLowStock: product.stockQuantity <= product.lowStockThreshold,
        isOutOfStock: product.stockQuantity === 0,
      }
    })

    return NextResponse.json({
      products: productsWithPricing,
      categories: categories.map(c => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        productCount: c._count.products,
      })),
      brands,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })

  } catch (error) {
    console.error("Products API error:", error)
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    )
  }
}
