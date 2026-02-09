import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db"
import { authOptions } from "@/lib/auth"
import { generateOrderNumber } from "@/lib/utils"

// GET /api/orders - Get user's orders
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const status = searchParams.get("status")

    const where: any = {
      companyId: session.user.companyId
    }

    if (status && status !== "all") {
      where.status = status
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  sku: true,
                }
              }
            }
          },
          _count: {
            select: { items: true }
          }
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where })
    ])

    return NextResponse.json({
      orders: orders.map(order => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        total: Number(order.total),
        itemCount: order._count.items,
        createdAt: order.createdAt,
        items: order.items.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice),
        }))
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error("Orders GET error:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}

// POST /api/orders - Create new order from cart
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { shippingAddressId, customerNote, paymentTerms } = await request.json()

    // Get cart
    const cart = await prisma.cart.findUnique({
      where: { companyId: session.user.companyId },
      include: {
        items: {
          include: {
            product: true
          }
        },
        company: {
          include: {
            addresses: true
          }
        }
      }
    })

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: "Panier vide" }, { status: 400 })
    }

    // Get shipping address
    let shippingAddress
    if (shippingAddressId) {
      shippingAddress = await prisma.address.findFirst({
        where: {
          id: shippingAddressId,
          companyId: session.user.companyId
        }
      })
    }

    if (!shippingAddress) {
      shippingAddress = cart.company.addresses.find(a => a.isDefault && a.isShipping) || 
                       cart.company.addresses[0]
    }

    if (!shippingAddress) {
      return NextResponse.json({ error: "Adresse de livraison requise" }, { status: 400 })
    }

    // Validate stock for all items
    for (const item of cart.items) {
      if (item.quantity > item.product.stockQuantity) {
        return NextResponse.json({
          error: `Stock insuffisant pour ${item.product.name}. Disponible: ${item.product.stockQuantity}`
        }, { status: 400 })
      }
    }

    // Calculate totals
    let subtotal = 0
    let vatAmount = 0

    const orderItems = cart.items.map(item => {
      const unitPrice = item.product.promoPrice 
        ? Number(item.product.promoPrice) 
        : Number(item.product.basePrice)
      const itemSubtotal = unitPrice * item.quantity
      const itemVat = itemSubtotal * Number(item.product.vatRate)
      
      subtotal += itemSubtotal
      vatAmount += itemVat

      return {
        productId: item.productId,
        sku: item.product.sku,
        name: item.product.name,
        quantity: item.quantity,
        unitPrice,
        vatRate: Number(item.product.vatRate),
        totalPrice: itemSubtotal + itemVat,
      }
    })

    const total = subtotal + vatAmount

    // Create order with transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const order = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          companyId: session.user.companyId,
          userId: session.user.id,
          status: "CREATED",
          subtotal,
          vatAmount,
          total,
          paymentTerms: paymentTerms || cart.company.paymentTerms,
          paymentStatus: "PENDING",
          shippingAddress: {
            name: shippingAddress.name,
            address: shippingAddress.address,
            city: shippingAddress.city,
            postalCode: shippingAddress.postalCode,
            country: shippingAddress.country,
          },
          customerNote: customerNote || null,
          items: {
            create: orderItems
          }
        },
        include: {
          items: true
        }
      })

      // Create status history
      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          status: "CREATED",
          note: "Commande créée",
          changedBy: session.user.id,
        }
      })

      // Update stock
      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: {
              decrement: item.quantity
            },
            reservedStock: {
              increment: item.quantity
            }
          }
        })
      }

      // Clear cart
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id }
      })

      return order
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: "ORDER_CREATED",
        entityType: "Order",
        entityId: order.id,
        metadata: {
          orderNumber: order.orderNumber,
          total: Number(order.total),
          itemCount: orderItems.length,
        },
        userId: session.user.id,
      }
    })

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        total: Number(order.total),
        status: order.status,
      }
    }, { status: 201 })

  } catch (error) {
    console.error("Order POST error:", error)
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}
