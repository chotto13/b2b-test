"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Download, FileText, Search, Eye, Loader2 } from "lucide-react"
import { formatCurrency, formatDateShort, formatInvoiceStatus } from "@/lib/utils"

interface Invoice {
  id: string
  invoiceNumber: string
  order: { orderNumber: string }
  total: number
  issueDate: string
  dueDate: string
  status: string
  _count: { payments: number }
}

interface InvoiceStats {
  totalInvoiced: number
  pendingAmount: number
  lastPayment: number
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [stats, setStats] = useState<InvoiceStats>({
    totalInvoiced: 0,
    pendingAmount: 0,
    lastPayment: 0,
  })
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("")

  useEffect(() => {
    fetchInvoices()
  }, [statusFilter])

  async function fetchInvoices() {
    try {
      setLoading(true)
      const url = new URL("/api/invoices", window.location.origin)
      if (statusFilter) url.searchParams.set("status", statusFilter)

      const res = await fetch(url)
      if (!res.ok) throw new Error("Failed to fetch invoices")

      const data = await res.json()
      setInvoices(data.invoices)

      // Calculate stats from invoices
      const totalInvoiced = data.invoices.reduce(
        (sum: number, inv: Invoice) => sum + Number(inv.total),
        0
      )
      const pendingAmount = data.invoices
        .filter((inv: Invoice) => inv.status === "UNPAID" || inv.status === "OVERDUE")
        .reduce((sum: number, inv: Invoice) => sum + Number(inv.total), 0)

      setStats({
        totalInvoiced,
        pendingAmount,
        lastPayment: 0, // Would need payment history
      })
    } catch (error) {
      console.error("Error fetching invoices:", error)
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

  const filteredInvoices = invoices.filter(
    (inv) =>
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Factures & Documents</h1>
        <p className="text-gray-500">Téléchargez vos factures, bons de livraison et avoirs</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-gray-500">Total facturé</p>
            <p className="mt-2 text-2xl font-bold">{formatCurrency(stats.totalInvoiced)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-gray-500">En attente de paiement</p>
            <p className="mt-2 text-2xl font-bold text-orange-600">
              {formatCurrency(stats.pendingAmount)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-gray-500">Nombre de factures</p>
            <p className="mt-2 text-2xl font-bold text-blue-600">{invoices.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                placeholder="Rechercher une facture..."
                className="h-10 w-full rounded-lg border border-gray-200 pl-10 pr-4 text-sm text-slate-900"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              className="h-10 rounded-lg border border-gray-200 px-3 text-sm text-slate-900"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Tous les statuts</option>
              <option value="PAID">Payées</option>
              <option value="UNPAID">Non payées</option>
              <option value="PARTIAL">Partiellement payées</option>
              <option value="OVERDUE">En retard</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des factures</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N° Facture</TableHead>
                  <TableHead>N° Commande</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Échéance</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      Aucune facture trouvée
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                      <TableCell>{invoice.order.orderNumber}</TableCell>
                      <TableCell>{formatDateShort(invoice.issueDate)}</TableCell>
                      <TableCell>{formatDateShort(invoice.dueDate)}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(invoice.status)}>
                          {formatInvoiceStatus(invoice.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(invoice.total)}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/factures/${invoice.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/api/invoices/${invoice.id}/pdf`} target="_blank">
                              <Download className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
