"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ShoppingBag,
  Package,
  FileText,
  TrendingUp,
  Clock,
  ChevronRight,
  AlertCircle,
  Loader2,
} from "lucide-react"
import { formatCurrency, formatDateShort, getOrderStatusColor, formatOrderStatus } from "@/lib/utils"

interface DashboardStats {
  totalOrders: number
  pendingOrders: number
  totalSpent: number
  cartItems: number
  recentOrders: Array<{
    id: string
    orderNumber: string
    status: string
    total: number
    createdAt: string
    itemCount: number
  }>
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/dashboard")
      if (!response.ok) throw new Error("Failed to fetch")
      const data = await response.json()
      setStats(data)
    } catch {
      setError("Impossible de charger les données")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Bonjour, {session?.user?.firstName} !
          </h1>
          <p className="text-slate-500">
            Bienvenue dans votre espace professionnel
          </p>
        </div>
        {session?.user?.companyName && (
          <div className="rounded-lg bg-blue-50 px-4 py-2">
            <p className="text-sm font-medium text-blue-900">{session.user.companyName}</p>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Commandes"
          value={stats?.totalOrders || 0}
          icon={ShoppingBag}
          trend="Total"
          href="/commandes"
          loading={loading}
        />
        <StatCard
          label="En cours"
          value={stats?.pendingOrders || 0}
          icon={Clock}
          trend="À traiter"
          href="/commandes"
          loading={loading}
        />
        <StatCard
          label="Total achats"
          value={formatCurrency(stats?.totalSpent || 0)}
          icon={TrendingUp}
          trend="Cette année"
          href="/factures"
          loading={loading}
        />
        <StatCard
          label="Panier"
          value={`${stats?.cartItems || 0} articles`}
          icon={Package}
          trend="En cours"
          href="/panier"
          loading={loading}
        />
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Button asChild className="h-11">
          <Link href="/catalogue">
            <Package className="mr-2 h-4 w-4" />
            Parcourir le catalogue
          </Link>
        </Button>
        <Button variant="outline" asChild className="h-11">
          <Link href="/commande-rapide">
            <ShoppingBag className="mr-2 h-4 w-4" />
            Commande rapide
          </Link>
        </Button>
        <Button variant="outline" asChild className="h-11">
          <Link href="/panier">
            <TrendingUp className="mr-2 h-4 w-4" />
            Voir mon panier
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Commandes récentes</CardTitle>
              <CardDescription>Vos dernières commandes</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/commandes">
                Voir tout
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {stats?.recentOrders && stats.recentOrders.length > 0 ? (
              <div className="space-y-3">
                {stats.recentOrders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/commandes/${order.id}`}
                    className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-slate-50"
                  >
                    <div>
                      <p className="font-medium text-slate-900">{order.orderNumber}</p>
                      <p className="text-sm text-slate-500">
                        {formatDateShort(order.createdAt)} • {order.itemCount} article{order.itemCount > 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className={getOrderStatusColor(order.status)}>
                        {formatOrderStatus(order.status)}
                      </Badge>
                      <p className="mt-1 text-sm font-medium">{formatCurrency(order.total)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <ShoppingBag className="h-12 w-12 text-slate-300" />
                <p className="mt-4 text-slate-500">Aucune commande pour le moment</p>
                <Button className="mt-4" asChild>
                  <Link href="/catalogue">Passer une commande</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle>Accès rapide</CardTitle>
            <CardDescription>Actions fréquentes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <QuickLink
              href="/catalogue"
              icon={Package}
              title="Catalogue produits"
              description="Parcourir et commander"
            />
            <QuickLink
              href="/commande-rapide"
              icon={ShoppingBag}
              title="Commande rapide"
              description="Importer une liste de produits"
            />
            <QuickLink
              href="/factures"
              icon={FileText}
              title="Mes factures"
              description="Consulter et télécharger"
            />
            <QuickLink
              href="/support"
              icon={AlertCircle}
              title="Support"
              description="Contacter le service client"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatCard({ 
  label, 
  value, 
  icon: Icon, 
  trend, 
  href,
  loading 
}: { 
  label: string
  value: string | number
  icon: React.ElementType
  trend: string
  href: string
  loading: boolean
}) {
  return (
    <Link href={href}>
      <Card className="transition-all hover:border-blue-200 hover:shadow-md">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">{label}</p>
              {loading ? (
                <Skeleton className="mt-2 h-8 w-24" />
              ) : (
                <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
              )}
              <p className="mt-1 text-xs text-slate-400">{trend}</p>
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

function QuickLink({ 
  href, 
  icon: Icon, 
  title, 
  description 
}: { 
  href: string
  icon: React.ElementType
  title: string
  description: string
}) {
  return (
    <Link 
      href={href}
      className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-slate-50"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
        <Icon className="h-5 w-5 text-slate-600" />
      </div>
      <div className="flex-1">
        <p className="font-medium text-slate-900">{title}</p>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
      <ChevronRight className="h-5 w-5 text-slate-400" />
    </Link>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>
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
