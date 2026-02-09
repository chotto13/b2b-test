"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ArrowLeft, Download, FileText, Loader2, Printer } from "lucide-react"
import { formatCurrency, formatDate, formatInvoiceStatus } from "@/lib/utils"

interface Invoice {
  id: string
  invoiceNumber: string
  status: string
  issueDate: string
  dueDate: string
  subtotal: number
  vatAmount: number
  total: number
  pdfUrl: string | null
  order: {
    orderNumber: string
    items: {
      id: string
      quantity: number
      unitPrice: number
      vatRate: number
      totalPrice: number
      product: {
        sku: string
        name: string
      }
    }[]
  }
  payments: {
    id: string
    amount: number
    method: string
    reference: string | null
    createdAt: string
  }[]
}

export default function InvoiceDetailPage() {
  const params = useParams()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchInvoice()
    }
  }, [params.id])

  async function fetchInvoice() {
    try {
      setLoading(true)
      const res = await fetch(`/api/invoices/${params.id}`)
      if (!res.ok) throw new Error("Failed to fetch invoice")

      const data = await res.json()
      setInvoice(data.invoice)
    } catch (error) {
      console.error("Error fetching invoice:", error)
    } finally {
      setLoading(false)
    }
  }

  function getStatusBadgeVariant(status: string) {
    switch (status) {
      case "PAID":
        return "success"
      case "PARTIAL":
        return "warning"
      case "UNPAID":
        return "secondary"
      case "OVERDUE":
        return "destructive"
      default:
        return "secondary"
    }
  }

  function getPaymentMethodLabel(method: string) {
    const labels: Record<string, string> = {
      BANK_TRANSFER: "Virement bancaire",
      CHEQUE: "Chèque",
      CASH: "Espèces",
      CREDIT_CARD: "Carte bancaire",
    }
    return labels[method] || method
  }

  const paidAmount = invoice?.payments.reduce((sum, p) => sum + Number(p.amount), 0) || 0
  const remainingAmount = invoice ? Number(invoice.total) - paidAmount : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Facture non trouvée</p>
        <Button asChild className="mt-4">
          <Link href="/factures">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux factures
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-2">
            <Link href="/factures">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">{invoice.invoiceNumber}</h1>
          <p className="text-gray-500">
            Commande: {invoice.order.orderNumber}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Printer className="mr-2 h-4 w-4" />
            Imprimer
          </Button>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Télécharger PDF
          </Button>
        </div>
      </div>

      {/* Invoice Info Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Statut</p>
            <Badge variant={getStatusBadgeVariant(invoice.status)} className="mt-1">
              {formatInvoiceStatus(invoice.status)}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Date d&apos;émission</p>
            <p className="font-medium">{formatDate(invoice.issueDate)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Date d&apos;échéance</p>
            <p className="font-medium">{formatDate(invoice.dueDate)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Montant total</p>
            <p className="font-medium text-lg">{formatCurrency(invoice.total)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Invoice Items */}
      <Card>
        <CardHeader>
          <CardTitle>Détails de la facture</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Référence</TableHead>
                <TableHead>Produit</TableHead>
                <TableHead className="text-right">Qté</TableHead>
                <TableHead className="text-right">Prix unit.</TableHead>
                <TableHead className="text-right">TVA</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.order.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono text-sm">{item.product.sku}</TableCell>
                  <TableCell>{item.product.name}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                  <TableCell className="text-right">{item.vatRate}%</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(item.totalPrice)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Totals */}
          <div className="border-t p-6">
            <div className="ml-auto max-w-xs space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Sous-total HT</span>
                <span>{formatCurrency(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">TVA</span>
                <span>{formatCurrency(invoice.vatAmount)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-medium text-lg">
                <span>Total TTC</span>
                <span>{formatCurrency(invoice.total)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments */}
      <Card>
        <CardHeader>
          <CardTitle>Paiements</CardTitle>
        </CardHeader>
        <CardContent>
          {invoice.payments.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Aucun paiement reçu</p>
          ) : (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Méthode</TableHead>
                    <TableHead>Référence</TableHead>
                    <TableHead className="text-right">Montant</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{formatDate(payment.createdAt)}</TableCell>
                      <TableCell>{getPaymentMethodLabel(payment.method)}</TableCell>
                      <TableCell>{payment.reference || "-"}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(payment.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Payment Summary */}
              <div className="border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Montant payé</span>
                  <span className="font-medium text-green-600">{formatCurrency(paidAmount)}</span>
                </div>
                {remainingAmount > 0 && (
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-gray-500">Reste à payer</span>
                    <span className="font-medium text-orange-600">
                      {formatCurrency(remainingAmount)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
