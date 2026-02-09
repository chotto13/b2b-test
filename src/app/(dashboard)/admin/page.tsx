"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Package,
  ShoppingBag,
  Users,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface AdminStats {
  totalProducts: number
  lowStockProducts: number
  totalOrders: number
  pendingOrders: number
  totalCustomers: number
  pendingApprovals: number
  todayRevenue: number
  monthlyRevenue: number
  recentOrders: Array<{
    id: string
    orderNumber: string
    companyName: string
    status: string
    total: number
    createdAt: string
  }>
  lowStockItems: Array<{
    id: string
    sku: string
    name: string
    stockQuantity: number
    threshold: number
  }>
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAdminStats()
  }, [])

  const fetchAdminStats = async () => {
    try {
      const response = await fetch("/api/admin/stats")
      if (!response.ok) throw new Error("Failed to fetch")
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error("Error fetching admin stats:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <AdminDashboardSkeleton />
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Produits"
          value={stats?.totalProducts || 0}
          icon={Package}
          href="/admin/produits"
          alert={stats?.lowStockProducts || 0}
        />
        <StatCard
          title="Commandes"
          value={stats?.totalOrders || 0}
          icon={ShoppingBag}
          href="/admin/commandes"
          alert={stats?.pendingOrders || 0}
        />
        <StatCard
          title="Clients"
          value={stats?.totalCustomers || 0}
          icon={Users}
          href="/admin/clients"
          alert={stats?.pendingApprovals || 0}
        />
        <StatCard
          title="CA du mois"
          value={formatCurrency(stats?.monthlyRevenue || 0)}
          icon={TrendingUp}
          href="/admin/rapports"
        />
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
          <CardContent>
            {stats?.recentOrders && stats.recentOrders.length > 0 ? (
              <div className="space-y-3">
                {stats.recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="font-medium">{order.orderNumber}</p>
                      <p className="text-sm text-slate-500">{order.companyName}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={order.status === "CREATED" ? "warning" : "default"}>
                        {order.status}
                      </Badge>
                      <p className="mt-1 font-medium">{formatCurrency(order.total)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-slate-500 py-8">Aucune commande récente</p>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Alertes stock faible
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/stock">Gérer</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {stats?.lowStockItems && stats.lowStockItems.length > 0 ? (
              <div className="space-y-3">
                {stats.lowStockItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-slate-500">SKU: {item.sku}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-red-600 font-medium">{item.stockQuantity}</span>
                      <span className="text-sm text-slate-400"> / {item.threshold}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-slate-500 py-8">Aucun produit en stock faible</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <QuickActionCard
          title="Produits"
          description="Ajouter ou modifier des produits"
          icon={Package}
          href="/admin/produits"
        />
        <QuickActionCard
          title="Import/Export"
          description="Importer des produits via Excel"
          icon={TrendingUp}
          href="/admin/import-export"
        />
        <QuickActionCard
          title="Clients"
          description="Approuver les nouveaux clients"
          icon={Users}
          href="/admin/clients"
        />
        <QuickActionCard
          title="Stock"
          description="Mettre à jour les quantités"
          icon={AlertCircle}
          href="/admin/stock"
        />
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon: Icon,
  href,
  alert,
}: {
  title: string
  value: string | number
  icon: React.ElementType
  href: string
  alert?: number
}) {
  return (
    <Link href={href}>
      <Card className="transition-all hover:border-blue-200 hover:shadow-md">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">{title}</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
              {alert !== undefined && alert > 0 && (
                <p className="mt-1 text-sm text-amber-600">{alert} en attente</p>
              )}
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
              <Icon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function QuickActionCard({
  title,
  description,
  icon: Icon,
  href,
}: {
  title: string
  description: string
  icon: React.ElementType
  href: string
}) {
  return (
    <Link href={href}>
      <Card className="transition-all hover:bg-slate-50">
        <CardContent className="flex items-center gap-4 p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
            <Icon className="h-6 w-6 text-slate-600" />
          </div>
          <div>
            <p className="font-medium text-slate-900">{title}</p>
            <p className="text-sm text-slate-500">{description}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function AdminDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
      </div>
    </div>
  )
}
