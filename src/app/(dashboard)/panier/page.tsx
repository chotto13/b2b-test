"use client"

import { useState } from "react"
import Link from "next/link"
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
import {
  ShoppingBag,
  Package,
  Trash2,
  ArrowLeft,
  Plus,
  Minus,
  Heart,
} from "lucide-react"
import { formatCurrency, formatPaymentTerms } from "@/lib/utils"

interface CartItem {
  id: string
  productId: string
  sku: string
  name: string
  brand: string
  unitPrice: number
  quantity: number
  packSize: number
  moq: number
  maxStock: number
  image?: string
}

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([
    {
      id: "1",
      productId: "p1",
      sku: "LP-001",
      name: "Effaclar Gel Moussant Purifiant 400ml",
      brand: "La Roche-Posay",
      unitPrice: 125.5,
      quantity: 24,
      packSize: 12,
      moq: 12,
      maxStock: 45,
    },
    {
      id: "2",
      productId: "p2",
      sku: "AV-001",
      name: "Eau Thermale Avène 300ml",
      brand: "Avène",
      unitPrice: 89,
      quantity: 36,
      packSize: 12,
      moq: 12,
      maxStock: 120,
    },
  ])

  const [savedCarts, setSavedCarts] = useState([
    { id: "1", name: "Commande mensuelle", itemCount: 12, total: 15420 },
    { id: "2", name: "Urgence stock", itemCount: 5, total: 5600 },
  ])

  const handleQuantityChange = (id: string, delta: number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.quantity + delta)
        // Round to nearest multiple of MOQ
        const roundedQty = Math.round(newQty / item.moq) * item.moq
        return { ...item, quantity: Math.max(0, Math.min(roundedQty, item.maxStock)) }
      }
      return item
    }))
  }

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(item => item.id !== id))
  }

  const subtotal = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0)
  const taxAmount = subtotal * 0.2
  const total = subtotal + taxAmount

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
          <h1 className="text-2xl font-bold text-gray-900">Mon Panier</h1>
          <p className="text-gray-500">{items.length} article(s) • {items.reduce((s, i) => s + i.quantity, 0)} unités</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          {items.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <ShoppingBag className="h-16 w-16 text-gray-300" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">Votre panier est vide</h3>
                <p className="mt-2 text-gray-500">Ajoutez des produits depuis le catalogue</p>
                <Button className="mt-6" asChild>
                  <Link href="/catalogue">Parcourir le catalogue</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
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
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex items-center gap-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-100">
                              <Package className="h-8 w-8 text-gray-400" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{item.name}</p>
                              <p className="text-sm text-gray-500">{item.brand}</p>
                              <p className="text-xs text-gray-400">
                                SKU: {item.sku} • Carton de {item.packSize}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.unitPrice)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleQuantityChange(item.id, -item.moq)}
                              disabled={item.quantity <= item.moq}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <Input
                              type="number"
                              className="h-8 w-16 text-center"
                              value={item.quantity}
                              readOnly
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleQuantityChange(item.id, item.moq)}
                              disabled={item.quantity >= item.maxStock}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="mt-1 text-center text-xs text-gray-500">
                            MOQ: {item.moq}
                          </p>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(item.unitPrice * item.quantity)}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Heart className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-600"
                              onClick={() => handleRemoveItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Saved Carts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Paniers sauvegardés</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {savedCarts.map((cart) => (
                  <div
                    key={cart.id}
                    className="flex items-center justify-between rounded-lg border p-3 hover:bg-gray-50"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{cart.name}</p>
                      <p className="text-sm text-gray-500">{cart.itemCount} articles</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{formatCurrency(cart.total)}</span>
                      <Button size="sm" variant="outline">Charger</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Récapitulatif</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Sous-total HT</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">TVA (20%)</span>
                  <span>{formatCurrency(taxAmount)}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total TTC</span>
                    <span className="text-blue-600">{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Conditions de paiement</label>
                <select className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm">
                  <option>{formatPaymentTerms("TRANSFER_30")}</option>
                  <option>{formatPaymentTerms("TRANSFER_45")}</option>
                  <option>{formatPaymentTerms("CASH")}</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Adresse de livraison</label>
                <select className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm">
                  <option>Pharmacie Centrale - Casablanca</option>
                  <option>+ Ajouter une adresse</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Notes (optionnel)</label>
                <textarea
                  className="h-20 w-full rounded-lg border border-gray-200 p-3 text-sm"
                  placeholder="Instructions particulières..."
                />
              </div>

              <Button
                className="w-full"
                disabled={items.length === 0}
              >
                Valider la commande
              </Button>

              <Button
                variant="outline"
                className="w-full"
                disabled={items.length === 0}
              >
                Sauvegarder le panier
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
