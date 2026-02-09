"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/toast"
import {
  Search,
  Filter,
  ShoppingCart,
  Package,
  Grid3X3,
  List,
  Minus,
  Plus,
  ChevronDown,
  Check,
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface Product {
  id: string
  sku: string
  name: string
  slug: string
  description: string | null
  basePrice: number
  finalPrice: number
  promoPrice: number | null
  hasDiscount: boolean
  stockQuantity: number
  moq: number
  packSize: number
  unit: string
  category: { id: string; name: string; slug: string } | null
  brand: { id: string; name: string; slug: string } | null
  image: string | null
  isLowStock: boolean
  isOutOfStock: boolean
}

interface CartItem {
  productId: string
  quantity: number
}

export default function CataloguePage() {
  const { addToast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Array<{ id: string; name: string; slug: string; productCount: number }>>([])
  const [brands, setBrands] = useState<Array<{ id: string; name: string; slug: string }>>([])
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState<Record<string, number>>({})
  const [addingToCart, setAddingToCart] = useState<string | null>(null)
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedBrand, setSelectedBrand] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showFilters, setShowFilters] = useState(false)

  // Fetch products
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchQuery) params.append("search", searchQuery)
      if (selectedCategory !== "all") params.append("category", selectedCategory)
      if (selectedBrand !== "all") params.append("brand", selectedBrand)
      
      const response = await fetch(`/api/products?${params.toString()}`)
      if (!response.ok) throw new Error("Failed to fetch")
      
      const data = await response.json()
      setProducts(data.products)
      setCategories(data.categories)
      setBrands(data.brands)
    } catch (error) {
      addToast({
        title: "Erreur",
        description: "Impossible de charger les produits",
        variant: "error",
      })
    } finally {
      setLoading(false)
    }
  }, [searchQuery, selectedCategory, selectedBrand, addToast])

  // Fetch cart
  const fetchCart = useCallback(async () => {
    try {
      const response = await fetch("/api/cart")
      if (!response.ok) return
      const data = await response.json()
      const cartMap: Record<string, number> = {}
      data.items?.forEach((item: CartItem) => {
        cartMap[item.productId] = item.quantity
      })
      setCart(cartMap)
    } catch {
      // Silent fail - cart not critical
    }
  }, [])

  useEffect(() => {
    fetchProducts()
    fetchCart()
  }, [fetchProducts, fetchCart])

  const handleUpdateCart = async (product: Product, delta: number) => {
    const currentQty = cart[product.id] || 0
    const newQty = currentQty + delta
    
    if (newQty < 0) return
    if (newQty > 0 && newQty < product.moq) {
      addToast({
        title: "Quantité minimum",
        description: `La quantité minimum est de ${product.moq} unités`,
        variant: "warning",
      })
      return
    }
    if (newQty > 0 && newQty % product.packSize !== 0) {
      addToast({
        title: "Conditionnement",
        description: `Veuillez commander par multiple de ${product.packSize}`,
        variant: "warning",
      })
      return
    }

    setAddingToCart(product.id)
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, quantity: newQty }),
      })

      if (!response.ok) {
        const error = await response.json()
        addToast({
          title: "Erreur",
          description: error.error || "Impossible de mettre à jour le panier",
          variant: "error",
        })
        return
      }

      setCart(prev => {
        if (newQty === 0) {
          const { [product.id]: _, ...rest } = prev
          return rest
        }
        return { ...prev, [product.id]: newQty }
      })

      if (delta > 0 && newQty === delta) {
        addToast({
          title: "Ajouté au panier",
          description: `${product.name} (${newQty} unités)`,
          variant: "success",
        })
      }
    } catch {
      addToast({
        title: "Erreur",
        description: "Impossible de mettre à jour le panier",
        variant: "error",
      })
    } finally {
      setAddingToCart(null)
    }
  }

  const cartItemsCount = Object.values(cart).reduce((a, b) => a + b, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Catalogue</h1>
          <p className="text-slate-500">
            {loading ? "Chargement..." : `${products.length} produits disponibles`}
          </p>
        </div>
        <Button asChild variant="outline" className="w-full sm:w-auto">
          <Link href="/panier">
            <ShoppingCart className="mr-2 h-4 w-4" />
            Panier ({cartItemsCount})
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                type="search"
                placeholder="Rechercher par nom, SKU, marque..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11 pl-10"
              />
            </div>

            {/* Filter Row */}
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className={showFilters ? "bg-slate-100" : ""}
              >
                <Filter className="mr-2 h-4 w-4" />
                Filtres
                <ChevronDown className={`ml-2 h-3 w-3 transition-transform ${showFilters ? "rotate-180" : ""}`} />
              </Button>

              {showFilters && (
                <>
                  <select
                    className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="all">Toutes les catégories</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.slug}>
                        {cat.name} ({cat.productCount})
                      </option>
                    ))}
                  </select>

                  <select
                    className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500"
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                  >
                    <option value="all">Toutes les marques</option>
                    {brands.map((brand) => (
                      <option key={brand.id} value={brand.slug}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                </>
              )}

              <div className="ml-auto flex items-center gap-1 rounded-lg border border-slate-200 p-1">
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
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      {loading ? (
        <ProductSkeleton viewMode={viewMode} />
      ) : products.length === 0 ? (
        <EmptyState />
      ) : viewMode === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              quantity={cart[product.id] || 0}
              onUpdate={handleUpdateCart}
              isAdding={addingToCart === product.id}
            />
          ))}
        </div>
      ) : (
        <ProductList
          products={products}
          cart={cart}
          onUpdate={handleUpdateCart}
          addingToCart={addingToCart}
        />
      )}
    </div>
  )
}

function ProductCard({
  product,
  quantity,
  onUpdate,
  isAdding,
}: {
  product: Product
  quantity: number
  onUpdate: (p: Product, delta: number) => void
  isAdding: boolean
}) {
  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg">
      <CardContent className="p-0">
        {/* Image */}
        <div className="relative aspect-square bg-slate-100">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Package className="h-16 w-16 text-slate-300" />
            </div>
          )}
          
          {/* Badges */}
          <div className="absolute left-2 top-2 flex flex-col gap-1">
            {product.hasDiscount && (
              <Badge className="bg-red-500 text-white border-0">Promo</Badge>
            )}
            {product.isOutOfStock && (
              <Badge variant="secondary" className="bg-slate-700 text-white border-0">Rupture</Badge>
            )}
            {product.isLowStock && !product.isOutOfStock && (
              <Badge variant="secondary" className="bg-amber-500 text-white border-0">Stock faible</Badge>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            {product.brand?.name}
          </p>
          <h3 className="mt-1 font-semibold text-slate-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
          <p className="mt-1 text-xs text-slate-400 font-mono">SKU: {product.sku}</p>
          
          {/* Price */}
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-lg font-bold text-slate-900">
              {formatCurrency(product.finalPrice)}
            </span>
            {product.hasDiscount && product.promoPrice && (
              <span className="text-sm text-slate-400 line-through">
                {formatCurrency(product.basePrice)}
              </span>
            )}
          </div>

          {/* MOQ & Stock */}
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>MOQ: {product.moq} • Carton: {product.packSize}</span>
            <span className={product.isOutOfStock ? "text-red-500" : product.isLowStock ? "text-amber-500" : "text-green-600"}>
              {product.isOutOfStock ? "Rupture" : `${product.stockQuantity} dispo`}
            </span>
          </div>

          {/* Add to Cart */}
          <div className="mt-4">
            {quantity === 0 ? (
              <Button
                className="w-full"
                disabled={product.isOutOfStock || isAdding}
                onClick={() => onUpdate(product, product.moq)}
              >
                {isAdding ? (
                  <span className="animate-pulse">Ajout...</span>
                ) : product.isOutOfStock ? (
                  "Rupture de stock"
                ) : (
                  `Ajouter (${product.moq})`
                )}
              </Button>
            ) : (
              <div className="flex items-center justify-between rounded-lg border border-slate-200 p-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  disabled={isAdding}
                  onClick={() => onUpdate(product, -product.packSize)}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="font-medium text-slate-900">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  disabled={isAdding || quantity + product.packSize > product.stockQuantity}
                  onClick={() => onUpdate(product, product.packSize)}
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
}

function ProductList({
  products,
  cart,
  onUpdate,
  addingToCart,
}: {
  products: Product[]
  cart: Record<string, number>
  onUpdate: (p: Product, delta: number) => void
  addingToCart: string | null
}) {
  return (
    <Card className="border-0 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">Produit</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">SKU</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">Stock</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-slate-500">Prix unit.</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-slate-500">Qté</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {products.map((product) => {
              const qty = cart[product.id] || 0
              const isAdding = addingToCart === product.id
              
              return (
                <tr key={product.id} className="hover:bg-slate-50">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded bg-slate-100">
                        <Package className="h-6 w-6 text-slate-400" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{product.name}</p>
                        <p className="text-sm text-slate-500">{product.brand?.name}</p>
                        {product.hasDiscount && (
                          <Badge className="mt-1 bg-red-500 text-white">Promo</Badge>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm font-mono text-slate-500">{product.sku}</td>
                  <td className="px-4 py-4 text-sm">
                    <span className={product.isOutOfStock ? "text-red-600" : product.isLowStock ? "text-amber-600" : "text-green-600"}>
                      {product.stockQuantity} unités
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className="font-medium">{formatCurrency(product.finalPrice)}</span>
                    {product.hasDiscount && product.promoPrice && (
                      <span className="ml-2 text-sm text-slate-400 line-through">
                        {formatCurrency(product.basePrice)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center">
                      {qty === 0 ? (
                        <Button
                          size="sm"
                          disabled={product.isOutOfStock || isAdding}
                          onClick={() => onUpdate(product, product.moq)}
                        >
                          {isAdding ? "..." : product.isOutOfStock ? "Rupture" : "Ajouter"}
                        </Button>
                      ) : (
                        <div className="flex items-center gap-2 rounded-lg border p-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            disabled={isAdding}
                            onClick={() => onUpdate(product, -product.packSize)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-10 text-center font-medium">{qty}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            disabled={isAdding || qty + product.packSize > product.stockQuantity}
                            onClick={() => onUpdate(product, product.packSize)}
                          >
                            <Plus className="h-3 w-3" />
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
  )
}

function ProductSkeleton({ viewMode }: { viewMode: "grid" | "list" }) {
  if (viewMode === "grid") {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="aspect-square" />
            <CardContent className="p-4 space-y-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <Card className="border-0 shadow-sm">
      <div className="p-4 space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    </Card>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <Package className="h-16 w-16 text-slate-300" />
      <h3 className="mt-4 text-lg font-medium text-slate-900">Aucun produit trouvé</h3>
      <p className="mt-2 text-slate-500">Essayez de modifier vos critères de recherche</p>
    </div>
  )
}
