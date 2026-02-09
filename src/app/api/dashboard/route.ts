import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const companyId = session.user.companyId

    // Get current year for statistics
    const currentYear = new Date().getFullYear()
    const yearStart = new Date(currentYear, 0, 1)

    // Fetch all stats in parallel
    const [
      totalOrders,
      pendingOrders,
      totalSpent,
      cartItems,
      recentOrders,
    ] = await Promise.all([
      // Total orders
      prisma.order.count({
        where: { companyId }
      }),

      // Pending orders (not delivered or cancelled)
      prisma.order.count({
        where: {
          companyId,
          status: {
            in: ["CREATED", "CONFIRMED", "PREPARING", "PREPARED", "SHIPPED"]
          }
        }
      }),

      // Total spent this year
      prisma.order.aggregate({
        where: {
          companyId,
          createdAt: { gte: yearStart },
          status: { not: "CANCELLED" }
        },
        _sum: { total: true }
      }),

      // Cart items count
      prisma.cart.findUnique({
        where: { companyId },
        include: {
          _count: { select: { items: true } }
        }
      }),

      // Recent orders
      prisma.order.findMany({
        where: { companyId },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          _count: { select: { items: true } }
        }
      }),
    ])

    return NextResponse.json({
      totalOrders,
      pendingOrders,
      totalSpent: totalSpent._sum.total || 0,
      cartItems: cartItems?._count.items || 0,
      recentOrders: recentOrders.map(order => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        total: Number(order.total),
        createdAt: order.createdAt,
        itemCount: order._count.items,
      })),
    })

  } catch (error) {
    console.error("Dashboard API error:", error)
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    )
  }
}
