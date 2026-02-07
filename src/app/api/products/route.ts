import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const category = searchParams.get("category")
    const brand = searchParams.get("brand")
    const search = searchParams.get("search")
    const inStock = searchParams.get("inStock") === "true"

    const where: any = { isActive: true }

    if (category && category !== "all") {
      where.category = { slug: category }
    }

    if (brand && brand !== "all") {
      where.brand = { slug: brand }
    }

    if (search) {
      where.OR = [
        { nameFr: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
        { barcode: { contains: search, mode: "insensitive" } },
      ]
    }

    if (inStock) {
      where.stockQuantity = { gt: 0 }
    }

    // Get user's company for pricing
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { company: { include: { priceList: true } } },
    })

    const skip = (page - 1) * limit

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          brand: true,
          images: { take: 1 },
          customerPrices: {
            where: {
              OR: [
                { companyId: user?.companyId },
                { priceListId: user?.company?.priceListId },
              ],
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.count({ where }),
    ])

    // Calculate final price for each product
    const productsWithPricing = products.map((product) => {
      const customerPrice = product.customerPrices[0]?.price
      const finalPrice = customerPrice || product.basePrice

      return {
        ...product,
        finalPrice: Number(finalPrice),
        customerPrice: customerPrice ? Number(customerPrice) : null,
        customerPrices: undefined,
      }
    })

    return NextResponse.json({
      data: productsWithPricing,
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
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
