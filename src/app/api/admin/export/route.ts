import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

// GET /api/admin/export - Export data as CSV/JSON
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = request.nextUrl
    const type = searchParams.get("type") || "products"
    const format = searchParams.get("format") || "json"

    let data: any[] = []

    switch (type) {
      case "products":
        data = await prisma.product.findMany({
          include: {
            category: { select: { name: true } },
            stock: { select: { quantity: true, minQuantity: true } },
          },
        })
        break
      case "orders":
        data = await prisma.order.findMany({
          include: {
            company: { select: { name: true, ice: true } },
            items: {
              include: {
                product: { select: { sku: true, name: true } },
              },
            },
          },
        })
        break
      case "companies":
        data = await prisma.company.findMany({
          include: {
            _count: {
              select: {
                orders: true,
                users: true,
              },
            },
          },
        })
        break
      default:
        return NextResponse.json(
          { error: "Invalid export type" },
          { status: 400 }
        )
    }

    if (format === "csv") {
      // Simple CSV conversion
      if (data.length === 0) {
        return NextResponse.json({ error: "No data to export" }, { status: 400 })
      }

      const headers = Object.keys(data[0]).join(",")
      const rows = data.map((row) =>
        Object.values(row)
          .map((val) => {
            if (typeof val === "string") {
              return `"${val.replace(/"/g, '""')}"`
            }
            return val
          })
          .join(",")
      )
      const csv = [headers, ...rows].join("\n")

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${type}_export_${new Date().toISOString().split("T")[0]}.csv"`,
        },
      })
    }

    return NextResponse.json({
      type,
      count: data.length,
      data,
    })
  } catch (error) {
    console.error("Error exporting data:", error)
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 }
    )
  }
}
