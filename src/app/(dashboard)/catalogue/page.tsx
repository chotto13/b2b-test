"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  Filter,
  ShoppingCart,
  Package,
  ChevronDown,
  Grid3X3,
  List,
  Minus,
  Plus,
} from "lucide-react"
import { formatCurrency, formatNumber } from "@/lib/utils"

// Mock data
const categories = [
  { id: "all", name: "Tous les produits", count: 1250 },
  { id: "dermocosmetique", name: "Dermocosmétique", count: 350 },
  { id: "hygiene", name: "Hygiène", count: 280 },
  { id: "bebe", name: "Bébé & Maman", count: 195 },
  { id: "complements", name: "Compléments alimentaires", count: 245 },
  { id: "medical", name: "Matériel médical", count: 180 },
]

const brands = [
  { id: "all", name: "Toutes les marques" },
  { id: "laroche", name: "La Roche-Posay" },
  { id: "avene", name: "Avène" },
  { id: "bioderma", name: "Bioderma" },
  { id: "vichy", name: "Vichy" },
  { id: "mustela", name: "Mustela" },
]

const products = [
  {
    id: "1",
    sku: "LP-001",
    nameFr: "Effaclar Gel Moussant Purifiant",
    brand: { name: "La Roche-Posay" },
    category: { nameFr: "Dermocosmétique" },
    basePrice: 125.5,
    finalPrice: 112.95,
    stockQuantity: 45,
    unit: "UNIT",
    packSize: 1,
    moq: 6,
    image: null,
    isPromotion: true,
  },
  {
    id: "2",
    sku: "AV-002",
    nameFr: "Eau Thermale Avène 300ml",
    brand: { name: "Avène" },
    category: { nameFr: "Dermocosmétique" },
    basePrice: 89.0,
    finalPrice: 89.0,
    stockQuantity: 120,
    unit: "UNIT",
    packSize: 12,
    moq: 12,
    image: null,
    isPromotion: false,
  },
  {
    id: "3",
    sku: "BI-003",
    nameFr: "Sensibio H2O 500ml",
    brand: { name: "Bioderma" },
    category: { nameFr: "Hygiène" },
    basePrice: 145.0,
    finalPrice: 123.25,
    stockQuantity: 8,
    unit: "UNIT",
    packSize: 12,
    moq: 12,
    image: null,
    isPromotion: true,
  },
  {
    id: "4",
    sku: "VI-004",
    nameFr: "Minéral 89 50ml",
    brand: { name: "Vichy" },
    category: { nameFr: "Dermocosmétique" },
    basePrice: 235.0,
    finalPrice: 235.0,
    stockQuantity: 0,
    unit: "UNIT",
    packSize: 6,
    moq: 6,
    image: null,
    isPromotion: false,
  },
  {
    id: "5",
    sku: "MU-005",
    nameFr: "Hydra Bébé Crème Visage",
    brand: { name: "Mustela" },
    category: { nameFr: "Bébé & Maman" },
    basePrice: 98.5,
    finalPrice: 88.65,
    stockQuantity: 67,
    unit: "UNIT",
    packSize: 12,
    moq: 12,
    image: null,
    isPromotion: true,
  },
  {
    id: "6",
    sku: "LP-006",
    nameFr: "Cicaplast Baume B5+",
    brand: { name: "La Roche-Posay" },
    category: { nameFr: "Dermocosmétique" },
    basePrice: 156.0,
    finalPrice: 156.0,
    stockQuantity: 34,
    unit: "UNIT",
    packSize: 6,
    moq: 6,
    image: null,
    isPromotion: false,
  },
]

export default function CataloguePage() {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedBrand, setSelectedBrand] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [cart, setCart] = useState<Record<string, number>>({})

  const handleQuantityChange = (productId: string, delta: number) => {
    setCart((prev) => {
      const current = prev[productId] || 0
      const newQty = Math.max(0, current + delta)
      if (newQty === 0) {
        const { [productId]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [productId]: newQty }
    })
  }

  const cartItemsCount = Object.values(cart).reduce((a, b) => a + b, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Catalogue</h1>
          <p className="text-gray-500">{formatNumber(1250)} produits disponibles</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" asChild>
            <Link href="/panier">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Panier ({cartItemsCount})
            </Link>
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                placeholder="Rechercher par nom, SKU, marque..."
                className="h-10 w-full rounded-lg border border-gray-200 pl-10 pr-4 text-sm outline-none focus:border-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                className="h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-blue-500"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} ({cat.count})
                  </option>
                ))}
              </select>
            </div>

            {/* Brand Filter */}
            <div className="flex items-center gap-2">
              <select
                className="h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-blue-500"
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
              >
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 rounded-lg border border-gray-200 p-1">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products */}
      {viewMode === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => {
            const qty = cart[product.id] || 0
            const isLowStock = product.stockQuantity <= 10
            const isOutOfStock = product.stockQuantity === 0

            return (
              <Card
                key={product.id}
                className="group overflow-hidden transition-shadow hover:shadow-lg"
              >
                <CardContent className="p-0">
                  {/* Image */}
                  <div className="relative aspect-square bg-gray-100">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.nameFr}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Package className="h-16 w-16 text-gray-300" />
                      </div>
                    )}
                    {product.isPromotion && (
                      <Badge className="absolute left-2 top-2 bg-red-500 text-white">
                        Promo
                      </Badge>
                    )}
                    {isLowStock && !isOutOfStock && (
                      <Badge className="absolute right-2 top-2 bg-yellow-500 text-white">
                        Stock faible
                      </Badge>
                    )}
                    {isOutOfStock && (
                      <Badge className="absolute right-2 top-2 bg-gray-500 text-white">
                        Rupture
                      </Badge>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <p className="text-xs text-gray-500">{product.brand.name}</p>
                    <h3 className="mt-1 font-medium text-gray-900 line-clamp-2">
                      {product.nameFr}
                    </h3>
                    <p className="mt-1 text-xs text-gray-500">
                      SKU: {product.sku} | Carton de {product.packSize}
                    </p>

                    {/* Price */}
                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-lg font-bold text-blue-600">
                        {formatCurrency(product.finalPrice)}
                      </span>
                      {product.isPromotion && (
                        <span className="text-sm text-gray-400 line-through">
                          {formatCurrency(product.basePrice)}
                        </span>
                      )}
                    </div>

                    {/* MOQ */}
                    <p className="text-xs text-gray-500">
                      MOQ: {product.moq} unités
                    </p>

                    {/* Add to Cart */}
                    <div className="mt-4">
                      {qty === 0 ? (
                        <Button
                          className="w-full"
                          disabled={isOutOfStock}
                          onClick={() => handleQuantityChange(product.id, product.moq)}
                        >
                          {isOutOfStock ? "Rupture de stock" : "Ajouter"}
                        </Button>
                      ) : (
                        <div className="flex items-center justify-between rounded-lg border p-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleQuantityChange(product.id, -product.moq)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="font-medium">{qty}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleQuantityChange(product.id, product.moq)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        /* List View */
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Produit</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">SKU</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Stock</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">MOQ</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Prix unitaire</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">Quantité</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const qty = cart[product.id] || 0
                  const isOutOfStock = product.stockQuantity === 0

                  return (
                    <tr key={product.id} className="border-b last:border-0">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded bg-gray-100">
                            <Package className="h-6 w-6 text-gray-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{product.nameFr}</p>
                            <p className="text-sm text-gray-500">{product.brand.name}</p>
                            {product.isPromotion && (
                              <Badge className="mt-1 bg-red-500 text-white">Promo</Badge>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">{product.sku}</td>
                      <td className="px-4 py-4 text-sm">
                        <span className={product.stockQuantity === 0 ? "text-red-600" : "text-green-600"}>
                          {product.stockQuantity} unités
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">{product.moq}</td>
                      <td className="px-4 py-4 text-right">
                        <span className="font-medium text-gray-900">
                          {formatCurrency(product.finalPrice)}
                        </span>
                        {product.isPromotion && (
                          <span className="ml-2 text-sm text-gray-400 line-through">
                            {formatCurrency(product.basePrice)}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-2">
                          {qty === 0 ? (
                            <Button
                              size="sm"
                              disabled={isOutOfStock}
                              onClick={() => handleQuantityChange(product.id, product.moq)}
                            >
                              {isOutOfStock ? "Rupture" : "Ajouter"}
                            </Button>
                          ) : (
                            <div className="flex items-center gap-2 rounded-lg border p-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleQuantityChange(product.id, -product.moq)}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="w-8 text-center font-medium">{qty}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleQuantityChange(product.id, product.moq)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
