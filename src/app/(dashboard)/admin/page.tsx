"use client"

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
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react"
import { formatCurrency, formatDateShort, getOrderStatusColor, formatOrderStatus } from "@/lib/utils"

// Mock stats
const stats = [
  { label: "Commandes aujourd'hui", value: 12, trend: "+20%", trendUp: true, icon: ShoppingBag },
  { label: "Ventes du mois", value: formatCurrency(156000), trend: "+15%", trendUp: true, icon: DollarSign },
  { label: "Nouveaux clients", value: 8, trend: "+33%", trendUp: true, icon: Users },
  { label: "Stock faible", value: 5, trend: "-2", trendUp: false, icon: AlertCircle },
]

// Mock recent orders
const recentOrders = [
  { id: "1", orderNumber: "CMD-2401-1240", customer: "Pharmacie Centrale", status: "CONFIRMED", total: 8750, date: "2024-01-24 10:30" },
  { id: "2", orderNumber: "CMD-2401-1241", customer: "Parapharmacie Anfa", status: "PREPARING", total: 12300, date: "2024-01-24 11:15" },
  { id: "3", orderNumber: "CMD-2401-1242", customer: "Clinique Les Orangers", status: "CREATED", total: 23400, date: "2024-01-24 12:00" },
  { id: "4", orderNumber: "CMD-2401-1243", customer: "Pharmacie Maarif", status: "SHIPPED", total: 5600, date: "2024-01-24 09:45" },
]

// Mock pending approvals
const pendingApprovals = [
  { id: "1", name: "Pharmacie Al Ahd", ice: "001234567000098", city: "Rabat", date: "2024-01-23" },
  { id: "2", name: "Parapharmacie Hay Riad", ice: "001234567000145", city: "Rabat", date: "2024-01-22" },
]

// Mock low stock products
const lowStockProducts = [
  { id: "1", sku: "LP-003", name: "Anthelios SPF50+", stock: 5, threshold: 10 },
  { id: "2", sku: "AV-002", name: "Cicalfate+ Crème", stock: 3, threshold: 10 },
  { id: "3", sku: "BI-002", name: "Photoderm Max SPF100", stock: 2, threshold: 5 },
]

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord Admin</h1>
          <p className="text-gray-500">Vue d'ensemble de l'activité</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/import-export">
              Import/Export
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/produits/nouveau">
              + Nouveau produit
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">{stat.value}</p>
                  <div className={`mt-1 flex items-center gap-1 text-sm ${stat.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.trendUp ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4" />
                    )}
                    <span>{stat.trend} vs hier</span>
                  </div>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50">
                  <stat.icon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Commandes récentes</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/commandes">Voir tout</Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N°</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      <Link href={`/admin/commandes/${order.id}`} className="text-blue-600 hover:underline">
                        {order.orderNumber}
                      </Link>
                    </TableCell>
                    <TableCell>{order.customer}</TableCell>
                    <TableCell>
                      <Badge className={getOrderStatusColor(order.status)}>
                        {formatOrderStatus(order.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(order.total)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Pending Approvals */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Comptes en attente</CardTitle>
            <Badge variant="warning">{pendingApprovals.length} en attente</Badge>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Ville</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingApprovals.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{client.name}</p>
                        <p className="text-xs text-gray-500">ICE: {client.ice}</p>
                      </div>
                    </TableCell>
                    <TableCell>{client.city}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="h-8 text-green-600">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Approuver
                        </Button>
                        <Button size="sm" variant="outline" className="h-8 text-red-600">
                          Refuser
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

      {/* Low Stock Alert */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            Alertes stock faible
          </CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/stock">Gérer le stock</Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Produit</TableHead>
                <TableHead>Stock actuel</TableHead>
                <TableHead>Seuil alerte</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lowStockProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>
                    <span className="font-medium text-red-600">{product.stock}</span> unités
                  </TableCell>
                  <TableCell>{product.threshold} unités</TableCell>
                  <TableCell>
                    <Badge variant="danger">Stock critique</Badge>
                  </TableCell>
                  <TableCell>
                    <Button size="sm">Réapprovisionner</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/admin/produits">
          <Card className="transition-colors hover:bg-gray-50">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Produits</p>
                <p className="text-sm text-gray-500">1,250 produits</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/clients">
          <Card className="transition-colors hover:bg-gray-50">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="font-medium">Clients</p>
                <p className="text-sm text-gray-500">156 comptes actifs</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/commandes">
          <Card className="transition-colors hover:bg-gray-50">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                <ShoppingBag className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="font-medium">Commandes</p>
                <p className="text-sm text-gray-500">24 en attente</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/rapports">
          <Card className="transition-colors hover:bg-gray-50">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="font-medium">Rapports</p>
                <p className="text-sm text-gray-500">Voir les statistiques</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
