import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db"
import { authOptions } from "@/lib/auth"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const order = await prisma.order.findFirst({
      where: {
        id: params.id,
        companyId: session.user.companyId,
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                sku: true,
                images: { take: 1, select: { url: true } }
              }
            }
          }
        },
        statusHistory: {
          orderBy: { createdAt: "asc" }
        },
        invoice: true,
      }
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      subtotal: Number(order.subtotal),
      vatAmount: Number(order.vatAmount),
      total: Number(order.total),
      paymentTerms: order.paymentTerms,
      paymentStatus: order.paymentStatus,
      shippingAddress: order.shippingAddress,
      customerNote: order.customerNote,
      createdAt: order.createdAt,
      items: order.items.map(item => ({
        id: item.id,
        name: item.name,
        sku: item.sku,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        vatRate: Number(item.vatRate),
        totalPrice: Number(item.totalPrice),
        image: item.product?.images[0]?.url,
      })),
      statusHistory: order.statusHistory.map(h => ({
        status: h.status,
        note: h.note,
        createdAt: h.createdAt,
      })),
      invoice: order.invoice ? {
        id: order.invoice.id,
        invoiceNumber: order.invoice.invoiceNumber,
        status: order.invoice.status,
        total: Number(order.invoice.total),
        pdfUrl: order.invoice.pdfUrl,
      } : null,
    })

  } catch (error) {
    console.error("Order detail API error:", error)
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 })
  }
}
