"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  Search,
  Upload,
  Plus,
  Trash2,
  FileSpreadsheet,
  Package,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface QuickOrderItem {
  id: string
  productId: string
  sku: string
  name: string
  brand: string
  unitPrice: number
  quantity: number
  packSize: number
  moq: number
  stockQuantity: number
}

export default function QuickOrderPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)
  const [items, setItems] = useState<QuickOrderItem[]>([])
  const [pasteData, setPasteData] = useState("")
  const [importing, setImporting] = useState(false)
  const [importErrors, setImportErrors] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)

  // Debounce search
  async function handleSearch(value: string) {
    setSearchQuery(value)
    if (value.length < 2) {
      setSearchResults([])
      return
    }

    try {
      setSearching(true)
      const res = await fetch(`/api/quick-order/search?q=${encodeURIComponent(value)}`)
      if (!res.ok) throw new Error("Search failed")
      
      const data = await res.json()
      setSearchResults(data.products)
    } catch (error) {
      console.error("Search error:", error)
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }

  const handleAddItem = (product: any) => {
    const existing = items.find((item) => item.productId === product.id)
    if (existing) {
      setItems(items.map((item) =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + product.moq }
          : item
      ))
    } else {
      setItems([...items, {
        id: Math.random().toString(36).substr(2, 9),
        productId: product.id,
        sku: product.sku,
        name: product.name,
        brand: product.brand,
        unitPrice: product.price,
        quantity: product.moq,
        packSize: product.packSize,
        moq: product.moq,
        stockQuantity: product.stock,
      }])
    }
    setSearchQuery("")
    setSearchResults([])
  }

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id))
  }

  const handleQuantityChange = (id: string, newQty: number) => {
    const item = items.find((i) => i.id === id)
    if (!item) return
    
    // Round to nearest multiple of MOQ
    const roundedQty = Math.max(0, Math.round(newQty / item.moq) * item.moq)
    
    if (roundedQty === 0) {
      handleRemoveItem(id)
    } else {
      setItems(items.map((i) =>
        i.id === id ? { ...i, quantity: roundedQty } : i
      ))
    }
  }

  const handlePasteImport = async () => {
    if (!pasteData.trim()) return

    // Parse paste data (format: SKU,Qty or SKU Qty)
    const lines = pasteData.trim().split('\n')
    const parsedItems = lines
      .map((line) => {
        const parts = line.split(/[,\t]/).map(p => p.trim())
        if (parts.length >= 1) {
          const sku = parts[0]
          const qty = parseInt(parts[1]) || 1
          return { sku, quantity: qty }
        }
        return null
      })
      .filter(Boolean) as { sku: string; quantity: number }[]

    if (parsedItems.length === 0) return

    try {
      setImporting(true)
      setImportErrors([])

      const res = await fetch("/api/quick-order/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: parsedItems }),
      })

      if (!res.ok) throw new Error("Import failed")

      const data = await res.json()

      // Add found items
      const newItems = data.items.map((product: any) => ({
        id: Math.random().toString(36).substr(2, 9),
        productId: product.id,
        sku: product.sku,
        name: product.name,
        brand: product.brand,
        unitPrice: product.unitPrice,
        quantity: product.quantity,
        packSize: product.packSize,
        moq: product.moq,
        stockQuantity: product.stockQuantity,
      }))

      setItems([...items, ...newItems])

      // Show errors
      const errors = [
        ...data.notFound.map((sku: string) => `Produit non trouvé: ${sku}`),
        ...data.invalidQuantity,
      ]
      setImportErrors(errors)
      setPasteData("")
    } catch (error) {
      console.error("Import error:", error)
      setImportErrors(["Erreur lors de l'importation"])
    } finally {
      setImporting(false)
    }
  }

  const handleSubmitOrder = async () => {
    if (items.length === 0) return

    try {
      setSubmitting(true)
      const res = await fetch("/api/quick-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to create order")
      }

      const data = await res.json()
      router.push(`/commandes/${data.order.id}`)
    } catch (error) {
      console.error("Order error:", error)
      alert(error instanceof Error ? error.message : "Erreur lors de la création de la commande")
    } finally {
      setSubmitting(false)
    }
  }

  const subtotal = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0)
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Commande rapide</h1>
        <p className="text-gray-500">
          Commandez rapidement en recherchant des produits ou en important une liste
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Product Search & Paste */}
        <div className="space-y-6 lg:col-span-2">
          {/* Search Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Rechercher des produits
              </CardTitle>
              <CardDescription>
                Tapez au moins 2 caractères pour rechercher par nom, SKU ou marque
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="search"
                  placeholder="Rechercher un produit..."
                  className="h-10 w-full rounded-lg border border-gray-200 pl-10 pr-4 text-sm text-slate-900 outline-none focus:border-blue-500"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                />
                {searching && (
                  <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-gray-400" />
                )}
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="mt-4 rounded-lg border">
                  {searchResults.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between border-b p-3 last:border-0 hover:bg-gray-50"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-500">
                          {product.brand} • SKU: {product.sku}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(product.price)}</p>
                          <p className="text-xs text-gray-500">Stock: {product.stock}</p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleAddItem(product)}
                        >
                          <Plus className="mr-1 h-4 w-4" />
                          Ajouter
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {searchQuery.length >= 2 && !searching && searchResults.length === 0 && (
                <p className="mt-4 text-sm text-gray-500 text-center">
                  Aucun produit trouvé
                </p>
              )}
            </CardContent>
          </Card>

          {/* Paste/Import Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                Importer une liste
              </CardTitle>
              <CardDescription>
                Collez une liste au format: SKU,Quantité (une par ligne)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <textarea
                className="h-32 w-full rounded-lg border border-gray-200 p-3 text-sm text-slate-900 outline-none focus:border-blue-500"
                placeholder="LP-001,24&#10;AV-002,12&#10;BI-003,36"
                value={pasteData}
                onChange={(e) => setPasteData(e.target.value)}
              />
              <Button
                onClick={handlePasteImport}
                disabled={!pasteData.trim() || importing}
              >
                {importing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                Importer la liste
              </Button>

              {/* Import Results */}
              {importErrors.length > 0 && (
                <div className="rounded-lg bg-yellow-50 p-3 space-y-1">
                  <div className="flex items-center gap-2 text-yellow-800">
                    <AlertCircle className="h-4 w-4" />
                    <span className="font-medium">Problèmes lors de l&apos;import:</span>
                  </div>
                  <ul className="text-sm text-yellow-700 list-disc list-inside">
                    {importErrors.map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Articles de la commande</CardTitle>
              <CardDescription>
                {items.length === 0
                  ? "Votre commande est vide"
                  : `${items.length} article(s), ${totalItems} unités au total`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Package className="h-12 w-12 text-gray-300" />
                  <p className="mt-4 text-gray-500">
                    Votre commande est vide. Ajoutez des produits pour commencer.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produit</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead className="text-right">Prix unit.</TableHead>
                      <TableHead className="text-center">Qté</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-gray-900">{item.name}</p>
                            <p className="text-sm text-gray-500">{item.brand}</p>
                            <p className="text-xs text-gray-400">
                              Carton de {item.packSize} • MOQ: {item.moq}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.unitPrice)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleQuantityChange(item.id, item.quantity - item.moq)}
                            >
                              -
                            </Button>
                            <Input
                              type="number"
                              className="h-8 w-16 text-center text-slate-900"
                              value={item.quantity}
                              onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 0)}
                              min={item.moq}
                              step={item.moq}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleQuantityChange(item.id, item.quantity + item.moq)}
                            >
                              +
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(item.unitPrice * item.quantity)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Order Summary */}
        <div>
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Récapitulatif</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Articles</span>
                <span>{items.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total unités</span>
                <span>{totalItems}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Sous-total HT</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">TVA (20%)</span>
                <span>{formatCurrency(subtotal * 0.2)}</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total TTC</span>
                  <span className="text-blue-600">{formatCurrency(subtotal * 1.2)}</span>
                </div>
              </div>
              <Button
                className="w-full"
                disabled={items.length === 0 || submitting}
                onClick={handleSubmitOrder}
              >
                {submitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="mr-2 h-4 w-4" />
                )}
                Passer la commande
              </Button>
              <Button
                variant="outline"
                className="w-full"
                disabled={items.length === 0 || submitting}
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
