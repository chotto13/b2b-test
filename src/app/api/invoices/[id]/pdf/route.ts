import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

// GET /api/invoices/[id]/pdf - Download invoice PDF
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const invoice = await prisma.invoice.findUnique({
      where: {
        id,
        companyId: session.user.companyId,
      },
      include: {
        order: {
          include: {
            items: {
              include: {
                product: {
                  select: {
                    sku: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        company: true,
      },
    })

    if (!invoice) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      )
    }

    // For now, return JSON with invoice data that can be used to generate PDF on client
    // In production, you would generate a PDF here using a library like puppeteer or @react-pdf/renderer
    return NextResponse.json({
      invoice,
      downloadUrl: invoice.pdfUrl,
      // If no PDF URL exists, client can generate one
      generateClientSide: !invoice.pdfUrl,
    })
  } catch (error) {
    console.error("Error fetching invoice PDF:", error)
    return NextResponse.json(
      { error: "Failed to fetch invoice PDF" },
      { status: 500 }
    )
  }
}
