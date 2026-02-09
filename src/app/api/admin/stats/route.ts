import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    const [
      totalProducts,
      lowStockProducts,
      totalOrders,
      pendingOrders,
      totalCustomers,
      pendingApprovals,
      todayRevenue,
      monthlyRevenue,
      recentOrders,
      lowStockItems,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({
        where: {
          stockQuantity: { lte: prisma.product.fields.lowStockThreshold }
        }
      }),
      prisma.order.count(),
      prisma.order.count({
        where: {
          status: { in: ["CREATED", "CONFIRMED", "PREPARING", "PREPARED", "SHIPPED"] }
        }
      }),
      prisma.company.count({ where: { isApproved: true } }),
      prisma.company.count({ where: { approvalStatus: "PENDING" } }),
      prisma.order.aggregate({
        where: {
          createdAt: { gte: startOfDay },
          status: { not: "CANCELLED" }
        },
        _sum: { total: true }
      }),
      prisma.order.aggregate({
        where: {
          createdAt: { gte: startOfMonth },
          status: { not: "CANCELLED" }
        },
        _sum: { total: true }
      }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          company: { select: { name: true } }
        }
      }),
      prisma.product.findMany({
        where: {
          stockQuantity: { lte: prisma.product.fields.lowStockThreshold }
        },
        take: 5,
        orderBy: { stockQuantity: "asc" },
        select: {
          id: true,
          sku: true,
          name: true,
          stockQuantity: true,
          lowStockThreshold: true,
        }
      }),
    ])

    return NextResponse.json({
      totalProducts,
      lowStockProducts,
      totalOrders,
      pendingOrders,
      totalCustomers,
      pendingApprovals,
      todayRevenue: todayRevenue._sum.total || 0,
      monthlyRevenue: monthlyRevenue._sum.total || 0,
      recentOrders: recentOrders.map(order => ({
        id: order.id,
        orderNumber: order.orderNumber,
        companyName: order.company.name,
        status: order.status,
        total: Number(order.total),
        createdAt: order.createdAt,
      })),
      lowStockItems: lowStockItems.map(item => ({
        id: item.id,
        sku: item.sku,
        name: item.name,
        stockQuantity: item.stockQuantity,
        threshold: item.lowStockThreshold,
      })),
    })

  } catch (error) {
    console.error("Admin stats error:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
