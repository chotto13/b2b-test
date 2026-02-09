"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/toast"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ShoppingBag,
  Package,
  Trash2,
  ArrowLeft,
  Plus,
  Minus,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { formatCurrency, formatPaymentTerms } from "@/lib/utils"

interface CartItem {
  id: string
  productId: string
  quantity: number
  product: {
    id: string
    sku: string
    name: string
    basePrice: number
    promoPrice: number | null
    finalPrice: number
    vatRate: number
    stockQuantity: number
    moq: number
    packSize: number
    brand: string | null
    image: string | null
  }
}

interface Cart {
  id: string
  items: CartItem[]
  subtotal: number
  vatAmount: number
  total: number
  itemCount: number
}

interface Address {
  id: string
  name: string
  address: string
  city: string
  isDefault: boolean
}

export default function CartPage() {
  const router = useRouter()
  const { addToast } = useToast()
  const [cart, setCart] = useState<Cart | null>(null)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [placingOrder, setPlacingOrder] = useState(false)
  const [selectedAddressId, setSelectedAddressId] = useState("")
  const [customerNote, setCustomerNote] = useState("")

  const fetchCart = async () => {
    try {
      const response = await fetch("/api/cart")
      if (!response.ok) throw new Error("Failed to fetch cart")
      const data = await response.json()
      setCart(data)
    } catch {
      addToast({
        title: "Erreur",
        description: "Impossible de charger le panier",
        variant: "error",
      })
    }
  }

  const fetchAddresses = async () => {
    try {
      const response = await fetch("/api/addresses")
      if (!response.ok) throw new Error("Failed to fetch addresses")
      const data = await response.json()
      setAddresses(data)
      const defaultAddress = data.find((a: Address) => a.isDefault)
      if (defaultAddress) setSelectedAddressId(defaultAddress.id)
    } catch {
      // Silent fail
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([fetchCart(), fetchAddresses()])
      setLoading(false)
    }
    loadData()
  }, [])

  const handleUpdateQuantity = async (item: CartItem, delta: number) => {
    const newQty = item.quantity + delta
    if (newQty < 0) return
    if (newQty > 0 && newQty < item.product.moq) {
      addToast({
        title: "Quantité minimum",
        description: `La quantité minimum est de ${item.product.moq} unités`,
        variant: "warning",
      })
      return
    }
    if (newQty > 0 && newQty % item.product.packSize !== 0) {
      addToast({
        title: "Conditionnement",
        description: `Veuillez commander par multiple de ${item.product.packSize}`,
        variant: "warning",
      })
      return
    }

    setUpdating(item.id)
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: item.productId, quantity: newQty }),
      })

      if (!response.ok) {
        const error = await response.json()
        addToast({
          title: "Erreur",
          description: error.error || "Impossible de mettre à jour",
          variant: "error",
        })
        return
      }

      await fetchCart()
    } catch {
      addToast({
        title: "Erreur",
        description: "Impossible de mettre à jour la quantité",
        variant: "error",
      })
    } finally {
      setUpdating(null)
    }
  }

  const handleRemoveItem = async (itemId: string) => {
    setUpdating(itemId)
    try {
      await fetch(`/api/cart?itemId=${itemId}`, { method: "DELETE" })
      await fetchCart()
      addToast({
        title: "Produit retiré",
        variant: "success",
      })
    } catch {
      addToast({
        title: "Erreur",
        description: "Impossible de retirer le produit",
        variant: "error",
      })
    } finally {
      setUpdating(null)
    }
  }

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      addToast({
        title: "Adresse requise",
        description: "Veuillez sélectionner une adresse de livraison",
        variant: "warning",
      })
      return
    }

    setPlacingOrder(true)
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shippingAddressId: selectedAddressId,
          customerNote: customerNote || undefined,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        addToast({
          title: "Erreur",
          description: error.error || "Impossible de créer la commande",
          variant: "error",
        })
        return
      }

      const data = await response.json()
      addToast({
        title: "Commande créée",
        description: `N° ${data.order.orderNumber}`,
        variant: "success",
      })
      router.push(`/commandes/${data.order.id}`)
    } catch {
      addToast({
        title: "Erreur",
        description: "Impossible de créer la commande",
        variant: "error",
      })
    } finally {
      setPlacingOrder(false)
    }
  }

  if (loading) {
    return <CartSkeleton />
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/catalogue">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-slate-900">Mon Panier</h1>
        </div>

        <Card className="py-20">
          <CardContent className="flex flex-col items-center justify-center text-center">
            <ShoppingBag className="h-20 w-20 text-slate-200" />
            <h3 className="mt-6 text-xl font-semibold text-slate-900">Votre panier est vide</h3>
            <p className="mt-2 text-slate-500">Ajoutez des produits depuis le catalogue pour commencer</p>
            <Button className="mt-6" asChild>
              <Link href="/catalogue">Parcourir le catalogue</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/catalogue">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mon Panier</h1>
          <p className="text-slate-500">{cart.itemCount} article{cart.itemCount > 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produit</TableHead>
                    <TableHead className="text-right">Prix unit.</TableHead>
                    <TableHead className="text-center">Quantité</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cart.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-4">
                          <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-slate-100">
                            {item.product.image ? (
                              <img src={item.product.image} alt={item.product.name} className="h-full w-full rounded-lg object-cover" />
                            ) : (
                              <Package className="h-8 w-8 text-slate-300" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{item.product.name}</p>
                            <p className="text-sm text-slate-500">{item.product.brand}</p>
                            <p className="text-xs text-slate-400">SKU: {item.product.sku} • Carton: {item.product.packSize}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div>
                          <span className="font-medium">{formatCurrency(item.product.finalPrice)}</span>
                          {item.product.promoPrice && (
                            <span className="ml-2 text-sm text-slate-400 line-through">
                              {formatCurrency(item.product.basePrice)}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            disabled={updating === item.id || item.quantity <= item.product.moq}
                            onClick={() => handleUpdateQuantity(item, -item.product.packSize)}
                          >
                            {updating === item.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Minus className="h-3 w-3" />}
                          </Button>
                          <Input
                            type="number"
                            className="h-8 w-20 text-center"
                            value={item.quantity}
                            readOnly
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            disabled={updating === item.id || item.quantity + item.product.packSize > item.product.stockQuantity}
                            onClick={() => handleUpdateQuantity(item, item.product.packSize)}
                          >
                            {updating === item.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
                          </Button>
                        </div>
                        <p className="mt-1 text-center text-xs text-slate-400">MOQ: {item.product.moq}</p>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(item.product.finalPrice * item.quantity)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={updating === item.id}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Récapitulatif</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Totals */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Sous-total HT</span>
                  <span>{formatCurrency(cart.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">TVA (20%)</span>
                  <span>{formatCurrency(cart.vatAmount)}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total TTC</span>
                    <span className="text-blue-600">{formatCurrency(cart.total)}</span>
                  </div>
                </div>
              </div>

              {/* Address Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Adresse de livraison <span className="text-red-500">*</span>
                </label>
                {addresses.length === 0 ? (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="mt-0.5 h-4 w-4 text-amber-600" />
                      <p className="text-sm text-amber-700">
                        Aucune adresse enregistrée. <Link href="/compte" className="underline">Ajouter une adresse</Link>
                      </p>
                    </div>
                  </div>
                ) : (
                  <select
                    className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500"
                    value={selectedAddressId}
                    onChange={(e) => setSelectedAddressId(e.target.value)}
                  >
                    <option value="">Sélectionner une adresse</option>
                    {addresses.map((addr) => (
                      <option key={addr.id} value={addr.id}>
                        {addr.name} - {addr.city}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Notes (optionnel)</label>
                <textarea
                  className="h-20 w-full rounded-lg border border-slate-200 p-3 text-sm outline-none focus:border-blue-500"
                  placeholder="Instructions particulières..."
                  value={customerNote}
                  onChange={(e) => setCustomerNote(e.target.value)}
                />
              </div>

              <Button
                className="w-full h-11"
                disabled={placingOrder || !selectedAddressId}
                onClick={handlePlaceOrder}
              >
                {placingOrder ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Traitement...
                  </>
                ) : (
                  "Valider la commande"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function CartSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10" />
        <Skeleton className="h-8 w-48" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Skeleton className="h-96" />
        </div>
        <Skeleton className="h-96" />
      </div>
    </div>
  )
}
