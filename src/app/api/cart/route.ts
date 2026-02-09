import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db"
import { authOptions } from "@/lib/auth"

// GET /api/cart - Get current user's cart
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const cart = await prisma.cart.findUnique({
      where: { companyId: session.user.companyId },
      include: {
        items: {
          include: {
            product: {
              include: {
                brand: true,
                images: {
                  take: 1,
                  select: { url: true }
                }
              }
            }
          }
        }
      }
    })

    if (!cart) {
      return NextResponse.json({ items: [], subtotal: 0, total: 0 })
    }

    // Calculate totals
    const items = cart.items.map(item => ({
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      product: {
        id: item.product.id,
        sku: item.product.sku,
        name: item.product.name,
        basePrice: Number(item.product.basePrice),
        promoPrice: item.product.promoPrice ? Number(item.product.promoPrice) : null,
        vatRate: Number(item.product.vatRate),
        stockQuantity: item.product.stockQuantity,
        moq: item.product.moq,
        packSize: item.product.packSize,
        brand: item.product.brand?.name,
        image: item.product.images[0]?.url,
      }
    }))

    const subtotal = items.reduce((sum, item) => {
      const price = item.product.promoPrice || item.product.basePrice
      return sum + (price * item.quantity)
    }, 0)

    const vatAmount = items.reduce((sum, item) => {
      const price = item.product.promoPrice || item.product.basePrice
      return sum + (price * item.quantity * Number(item.product.vatRate))
    }, 0)

    return NextResponse.json({
      id: cart.id,
      items,
      subtotal,
      vatAmount,
      total: subtotal + vatAmount,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0)
    })

  } catch (error) {
    console.error("Cart GET error:", error)
    return NextResponse.json({ error: "Failed to fetch cart" }, { status: 500 })
  }
}

// POST /api/cart - Add or update item
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { productId, quantity } = await request.json()

    if (!productId || typeof quantity !== 'number') {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 })
    }

    // Get product details for validation
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return NextResponse.json({ error: "Produit non trouvé" }, { status: 404 })
    }

    if (!product.isActive) {
      return NextResponse.json({ error: "Produit non disponible" }, { status: 400 })
    }

    // Validate quantity against MOQ and pack size
    if (quantity > 0) {
      if (quantity < product.moq) {
        return NextResponse.json({ 
          error: `La quantité minimum est de ${product.moq} unités` 
        }, { status: 400 })
      }

      if (quantity % product.packSize !== 0) {
        return NextResponse.json({ 
          error: `La quantité doit être un multiple de ${product.packSize}` 
        }, { status: 400 })
      }

      if (quantity > product.stockQuantity) {
        return NextResponse.json({ 
          error: `Stock insuffisant. Disponible: ${product.stockQuantity} unités` 
        }, { status: 400 })
      }
    }

    // Get or create cart
    let cart = await prisma.cart.findUnique({
      where: { companyId: session.user.companyId }
    })

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          companyId: session.user.companyId,
          userId: session.user.id,
        }
      })
    }

    // Check if item already exists
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId
      }
    })

    if (quantity <= 0) {
      // Remove item
      if (existingItem) {
        await prisma.cartItem.delete({
          where: { id: existingItem.id }
        })
      }
    } else if (existingItem) {
      // Update quantity
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity }
      })
    } else {
      // Add new item
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity
        }
      })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error("Cart POST error:", error)
    return NextResponse.json({ error: "Failed to update cart" }, { status: 500 })
  }
}

// DELETE /api/cart - Clear cart or remove specific item
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get("itemId")

    const cart = await prisma.cart.findUnique({
      where: { companyId: session.user.companyId }
    })

    if (!cart) {
      return NextResponse.json({ success: true })
    }

    if (itemId) {
      // Remove specific item
      await prisma.cartItem.deleteMany({
        where: {
          cartId: cart.id,
          id: itemId
        }
      })
    } else {
      // Clear entire cart
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id }
      })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error("Cart DELETE error:", error)
    return NextResponse.json({ error: "Failed to remove item" }, { status: 500 })
  }
}
