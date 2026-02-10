"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Search,
  Eye,
  Package,
} from "lucide-react"
import { formatCurrency, formatDateShort, getOrderStatusColor, formatOrderStatus } from "@/lib/utils"
import { useToast } from "@/components/ui/toast"

const statusOptions = [
  { value: "CREATED", label: "Créée" },
  { value: "CONFIRMED", label: "Confirmée" },
  { value: "PREPARING", label: "En préparation" },
  { value: "PREPARED", label: "Préparée" },
  { value: "SHIPPED", label: "Expédiée" },
  { value: "DELIVERED", label: "Livrée" },
  { value: "CANCELLED", label: "Annulée" },
]

interface Order {
  id: string
  orderNumber: string
  status: string
  total: number
  createdAt: string
  company: {
    name: string
  }
  user: {
    firstName: string
    lastName: string
  }
  items: Array<{
    id: string
    name: string
    quantity: number
  }>
}

export default function AdminOrdersPage() {
  const { addToast } = useToast()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [statusFilter, fetchOrders])

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== "all") params.append("status", statusFilter)
      
      const response = await fetch(`/api/admin/orders?${params.toString()}`)
      if (!response.ok) throw new Error("Failed to fetch")
      const data = await response.json()
      setOrders(data.orders)
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingStatus(true)
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) throw new Error("Failed to update")

      addToast({ title: "Statut mis à jour", variant: "success" })
      fetchOrders()
      setIsModalOpen(false)
    } catch {
      addToast({ title: "Erreur", description: "Impossible de mettre à jour", variant: "error" })
    } finally {
      setUpdatingStatus(false)
    }
  }

  const filteredOrders = orders.filter(order =>
    order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.company.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold">Gestion des commandes</h2>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                type="search"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tous les statuts</option>
              {statusOptions.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>N° Commande</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={6}><div className="h-12 bg-slate-100 animate-pulse rounded" /></TableCell>
                  </TableRow>
                ))
              ) : filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center">
                    <Package className="mx-auto h-12 w-12 text-slate-300" />
                    <p className="mt-4 text-slate-500">Aucune commande trouvée</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.orderNumber}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.company.name}</p>
                        <p className="text-sm text-slate-500">{order.user.firstName} {order.user.lastName}</p>
                      </div>
                    </TableCell>
                    <TableCell>{formatDateShort(order.createdAt)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getOrderStatusColor(order.status)}>
                        {formatOrderStatus(order.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(order.total)}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { setSelectedOrder(order); setIsModalOpen(true); }}
                        >
                          Mettre à jour
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/commandes/${order.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Update Status Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mettre à jour le statut</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 mt-4">
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="font-medium">{selectedOrder.orderNumber}</p>
                <p className="text-sm text-slate-500">{selectedOrder.company.name}</p>
                <p className="text-lg font-bold mt-2">{formatCurrency(selectedOrder.total)}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Nouveau statut</label>
                <Select
                  defaultValue={selectedOrder.status}
                  onValueChange={(value) => handleUpdateStatus(selectedOrder.id, value)}
                  disabled={updatingStatus}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un statut" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  Annuler
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
