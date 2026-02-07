"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Download, FileText, Search, Eye } from "lucide-react"
import { formatCurrency, formatDateShort } from "@/lib/utils"

const invoices = [
  { id: "1", number: "FAC-2024-0123", orderNumber: "CMD-2401-1234", amount: 15420, date: "2024-01-15", dueDate: "2024-02-15", status: "PAID" },
  { id: "2", number: "FAC-2024-0124", orderNumber: "CMD-2401-1235", amount: 8750, date: "2024-01-18", dueDate: "2024-02-18", status: "PAID" },
  { id: "3", number: "FAC-2024-0125", orderNumber: "CMD-2401-1236", amount: 23100, date: "2024-01-20", dueDate: "2024-02-20", status: "PENDING" },
  { id: "4", number: "FAC-2024-0126", orderNumber: "CMD-2401-1237", amount: 5600, date: "2024-01-22", dueDate: "2024-02-22", status: "PENDING" },
]

export default function InvoicesPage() {
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
            <p className="text-sm font-medium text-gray-500">Total facturé (année)</p>
            <p className="mt-2 text-2xl font-bold">{formatCurrency(156000)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-gray-500">En attente de paiement</p>
            <p className="mt-2 text-2xl font-bold text-orange-600">{formatCurrency(28700)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-gray-500">Dernier paiement</p>
            <p className="mt-2 text-2xl font-bold text-green-600">{formatCurrency(24170)}</p>
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
                className="h-10 w-full rounded-lg border border-gray-200 pl-10 pr-4 text-sm"
              />
            </div>
            <select className="h-10 rounded-lg border border-gray-200 px-3 text-sm">
              <option>Tous les statuts</option>
              <option>Payées</option>
              <option>En attente</option>
              <option>En retard</option>
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
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.number}</TableCell>
                  <TableCell>{invoice.orderNumber}</TableCell>
                  <TableCell>{formatDateShort(invoice.date)}</TableCell>
                  <TableCell>{formatDateShort(invoice.dueDate)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={invoice.status === "PAID" ? "success" : "warning"}
                    >
                      {invoice.status === "PAID" ? "Payée" : "En attente"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(invoice.amount)}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
