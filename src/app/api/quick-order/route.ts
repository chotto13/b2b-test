import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { generateOrderNumber } from "@/lib/utils"

// POST /api/quick-order - Create order from quick order items
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { items, shippingAddressId, notes } = body

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Items are required" },
        { status: 400 }
      )
    }

    const companyId = session.user.companyId

    // Verify all products and get their details
    const productIds = items.map((item) => item.productId)
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        isActive: true,
      },
      include: {
        stock: true,
        customerPrices: {
          where: { companyId },
          select: { price: true },
          take: 1,
        },
      },
    })

    const productMap = new Map(products.map((p) => [p.id, p]))

    // Validate each item
    const orderItems = []
    let totalHt = 0
    let totalVat = 0

    for (const item of items) {
      const product = productMap.get(item.productId)
      if (!product) {
        return NextResponse.json(
          { error: `Product ${item.productId} not found` },
          { status: 400 }
        )
      }

      // Check stock
      if (!product.stock || product.stock.quantity < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product.name}` },
          { status: 400 }
        )
      }

      // Get price
      const customerPrice = product.customerPrices[0]?.price
      const basePrice = product.basePrice
      const unitPrice = customerPrice !== undefined && customerPrice !== null
        ? Number(customerPrice)
        : Number(basePrice)

      const vatRate = Number(product.vatRate) / 100
      const itemTotal = unitPrice * item.quantity
      const itemVat = itemTotal * vatRate

      orderItems.push({
        productId: product.id,
        quantity: item.quantity,
        unitPrice: unitPrice,
        vatRate: Number(product.vatRate),
        totalPrice: itemTotal + itemVat,
      })

      totalHt += itemTotal
      totalVat += itemVat

      // Reserve stock
      await prisma.stock.update({
        where: { productId: product.id },
        data: {
          quantity: { decrement: item.quantity },
          reserved: { increment: item.quantity },
        },
      })
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        companyId,
        userId: session.user.id,
        status: "CREATED",
        totalHt,
        totalVat: totalVat,
        totalTtc: totalHt + totalVat,
        shippingAddressId,
        notes,
        items: {
          create: orderItems,
        },
        statusHistory: {
          create: {
            status: "CREATED",
            previousStatus: null,
            note: "Commande créée via Commande Rapide",
            changedBy: session.user.id,
          },
        },
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                sku: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json({ order }, { status: 201 })
  } catch (error) {
    console.error("Error creating quick order:", error)
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    )
  }
}
