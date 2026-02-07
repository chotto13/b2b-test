"use client"

import { useSession } from "next-auth/react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ShoppingBag,
  Package,
  FileText,
  TrendingUp,
  Clock,
  ChevronRight,
  AlertCircle,
} from "lucide-react"
import { formatCurrency, formatDateShort, getOrderStatusColor, formatOrderStatus } from "@/lib/utils"

// Mock data for demonstration
const recentOrders = [
  { id: "1", orderNumber: "CMD-2401-1234", status: "DELIVERED", total: 15420, date: "2024-01-15" },
  { id: "2", orderNumber: "CMD-2401-1235", status: "SHIPPED", total: 8750, date: "2024-01-18" },
  { id: "3", orderNumber: "CMD-2401-1236", status: "PREPARING", total: 23100, date: "2024-01-20" },
]

const stats = [
  { label: "Commandes en cours", value: "5", icon: ShoppingBag, trend: "+2 cette semaine" },
  { label: "Produits favoris", value: "12", icon: Package, trend: "3 en promotion" },
  { label: "Total des achats", value: formatCurrency(156000), icon: TrendingUp, trend: "+15% ce mois" },
  { label: "Factures en attente", value: "2", icon: FileText, trend: "4500 DH à payer" },
]

export default function DashboardPage() {
  const { data: session } = useSession()

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Bonjour, {session?.user?.firstName || "Client"} !
        </h1>
        <p className="text-gray-500">
          Bienvenue dans votre espace professionnel Deux A Para
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="mt-1 text-xs text-gray-500">{stat.trend}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50">
                  <stat.icon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/catalogue">
            <Package className="mr-2 h-4 w-4" />
            Parcourir le catalogue
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/commande-rapide">
            <ShoppingBag className="mr-2 h-4 w-4" />
            Commande rapide
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/commandes">
            <Clock className="mr-2 h-4 w-4" />
            Voir mes commandes
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Commandes récentes</CardTitle>
              <CardDescription>Vos 3 dernières commandes</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/commandes">
                Voir tout
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between rounded-lg border p-4 hover:bg-gray-50"
                >
                  <div>
                    <p className="font-medium text-gray-900">{order.orderNumber}</p>
                    <p className="text-sm text-gray-500">{formatDateShort(order.date)}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="default" className={getOrderStatusColor(order.status)}>
                      {formatOrderStatus(order.status)}
                    </Badge>
                    <p className="mt-1 text-sm font-medium">{formatCurrency(order.total)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alerts & Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Alertes et informations importantes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-lg bg-yellow-50 p-4">
                <AlertCircle className="mt-0.5 h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-900">Promotion en cours</p>
                  <p className="text-sm text-yellow-700">
                    Profitez de -15% sur tous les produits de la marque La Roche-Posay jusqu'au 31 janvier.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg bg-blue-50 p-4">
                <Clock className="mt-0.5 h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">Nouveau catalogue</p>
                  <p className="text-sm text-blue-700">
                    Le nouveau catalogue 2024 est maintenant disponible. Découvrez nos nouveautés !
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg bg-green-50 p-4">
                <FileText className="mt-0.5 h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">Facture disponible</p>
                  <p className="text-sm text-green-700">
                    Votre facture FAC-2024-0123 est disponible au téléchargement.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Reorder */}
      <Card>
        <CardHeader>
          <CardTitle>Commander à nouveau</CardTitle>
          <CardDescription>Produits fréquemment commandés</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="group relative rounded-lg border p-4 hover:border-blue-300 hover:shadow-md transition-all"
              >
                <div className="aspect-square rounded-lg bg-gray-100 mb-3 flex items-center justify-center">
                  <Package className="h-12 w-12 text-gray-400" />
                </div>
                <p className="font-medium text-gray-900 line-clamp-1">Produit {i}</p>
                <p className="text-sm text-gray-500">Marque {i}</p>
                <p className="mt-2 font-semibold text-blue-600">{formatCurrency(150 * i)}</p>
                <Button size="sm" className="mt-3 w-full opacity-0 group-hover:opacity-100 transition-opacity">
                  Ajouter
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
