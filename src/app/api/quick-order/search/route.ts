import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

// GET /api/quick-order/search - Search products for quick order
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = request.nextUrl
    const query = searchParams.get("q")

    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: "Search query must be at least 2 characters" },
        { status: 400 }
      )
    }

    const companyId = session.user.companyId

    // Search products by name, SKU, or brand
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { sku: { contains: query, mode: "insensitive" } },
          { brand: { contains: query, mode: "insensitive" } },
        ],
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
      take: 10,
    })

    // Format products with proper pricing
    const formattedProducts = products.map((product) => {
      const customerPrice = product.customerPrices[0]?.price
      const basePrice = product.basePrice
      const price = customerPrice !== undefined && customerPrice !== null
        ? customerPrice
        : basePrice

      return {
        id: product.id,
        sku: product.sku,
        name: product.name,
        brand: product.brand || "",
        price: Number(price),
        stock: product.stock?.quantity || 0,
        packSize: product.packSize,
        moq: product.moq,
      }
    })

    return NextResponse.json({ products: formattedProducts })
  } catch (error) {
    console.error("Error searching products:", error)
    return NextResponse.json(
      { error: "Failed to search products" },
      { status: 500 }
    )
  }
}
