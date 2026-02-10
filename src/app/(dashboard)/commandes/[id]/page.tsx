"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ArrowLeft,
  Package,
  FileText,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  Printer,
} from "lucide-react"
import { formatCurrency, formatDate, formatOrderStatus, formatPaymentTerms } from "@/lib/utils"

interface ShippingAddress {
  name: string
  address: string
  city: string
  postalCode: string
  country: string
}

interface Order {
  id: string
  orderNumber: string
  status: string
  subtotal: number
  vatAmount: number
  total: number
  paymentTerms: string
  paymentStatus: string
  shippingAddress: ShippingAddress | null
  customerNote: string | null
  createdAt: string
  items: Array<{
    id: string
    name: string
    sku: string
    quantity: number
    unitPrice: number
    vatRate: number
    totalPrice: number
    image: string | null
  }>
  statusHistory: Array<{
    status: string
    note: string | null
    createdAt: string
  }>
  invoice: {
    id: string
    invoiceNumber: string
    status: string
    total: number
    pdfUrl: string | null
  } | null
}

const statusSteps = [
  { status: "CREATED", label: "Créée", icon: Clock },
  { status: "CONFIRMED", label: "Confirmée", icon: CheckCircle },
  { status: "PREPARING", label: "Préparation", icon: Package },
  { status: "SHIPPED", label: "Expédiée", icon: Truck },
  { status: "DELIVERED", label: "Livrée", icon: CheckCircle },
]

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrder()
  }, [params.id])

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${params.id}`)
      if (!response.ok) {
        if (response.status === 404) {
          router.push("/commandes")
          return
        }
        throw new Error("Failed to fetch")
      }
      const data = await response.json()
      setOrder(data)
    } catch (error) {
      console.error("Error fetching order:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusStepIndex = (status: string) => {
    return statusSteps.findIndex(s => s.status === status)
  }

  if (loading) {
    return <OrderDetailSkeleton />
  }

  if (!order) {
    return null
  }

  const currentStepIndex = getStatusStepIndex(order.status)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/commandes">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{order.orderNumber}</h1>
            <p className="text-slate-500">Passée le {formatDate(order.createdAt)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {order.invoice?.pdfUrl && (
            <Button variant="outline" asChild>
              <a href={order.invoice.pdfUrl} target="_blank" rel="noopener noreferrer">
                <FileText className="mr-2 h-4 w-4" />
                Facture
              </a>
            </Button>
          )}
          <Button variant="outline">
            <Printer className="mr-2 h-4 w-4" />
            Imprimer
          </Button>
        </div>
      </div>

      {/* Status Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Statut de la commande</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div className="absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 bg-slate-200" />
            <div className="relative flex justify-between">
              {statusSteps.map((step, index) => {
                const Icon = step.icon
                const isCompleted = index <= currentStepIndex
                const isCurrent = index === currentStepIndex

                return (
                  <div key={step.status} className="flex flex-col items-center gap-2">
                    <div className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                      isCompleted
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-slate-200 bg-white text-slate-400"
                    } ${isCurrent ? "ring-4 ring-blue-100" : ""}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className={`text-xs font-medium ${isCompleted ? "text-slate-900" : "text-slate-400"}`}>
                      {step.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Articles commandés</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produit</TableHead>
                    <TableHead className="text-right">Prix unit.</TableHead>
                    <TableHead className="text-center">Qté</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded bg-slate-100">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="h-full w-full rounded object-cover" />
                            ) : (
                              <Package className="h-6 w-6 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{item.name}</p>
                            <p className="text-xs text-slate-500 font-mono">{item.sku}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                      <TableCell className="text-center">{item.quantity}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(item.totalPrice)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Status History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Historique</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.statusHistory.map((history, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50">
                      <Clock className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{formatOrderStatus(history.status)}</p>
                      {history.note && (
                        <p className="text-sm text-slate-500">{history.note}</p>
                      )}
                      <p className="text-xs text-slate-400">{formatDate(history.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Récapitulatif</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Sous-total HT</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">TVA ({(order.items[0]?.vatRate || 0.2) * 100}%)</span>
                  <span>{formatCurrency(order.vatAmount)}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total TTC</span>
                    <span className="text-blue-600">{formatCurrency(order.total)}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-sm font-medium text-slate-700">Conditions de paiement</p>
                <p className="text-sm text-slate-500">{formatPaymentTerms(order.paymentTerms)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Adresse de livraison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                <p className="font-medium">{order.shippingAddress.name}</p>
                <p className="text-slate-500">{order.shippingAddress.address}</p>
                <p className="text-slate-500">{order.shippingAddress.postalCode} {order.shippingAddress.city}</p>
                <p className="text-slate-500">{order.shippingAddress.country}</p>
              </div>
            </CardContent>
          </Card>

          {/* Invoice Info */}
          {order.invoice && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Facture
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{order.invoice.invoiceNumber}</p>
                    <Badge variant={order.invoice.status === "PAID" ? "success" : "warning"}>
                      {order.invoice.status === "PAID" ? "Payée" : "En attente"}
                    </Badge>
                  </div>
                  <p className="font-bold">{formatCurrency(order.invoice.total)}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

function OrderDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10" />
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32 mt-2" />
        </div>
      </div>
      <Skeleton className="h-32" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-48" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-48" />
          <Skeleton className="h-32" />
        </div>
      </div>
    </div>
  )
}
