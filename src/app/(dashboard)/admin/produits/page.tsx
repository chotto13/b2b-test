"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Package,
  Filter,
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { useToast } from "@/components/ui/toast"

interface Product {
  id: string
  sku: string
  name: string
  basePrice: number
  promoPrice: number | null
  stockQuantity: number
  moq: number
  packSize: number
  isActive: boolean
  category: { id: string; name: string } | null
  brand: { id: string; name: string } | null
  image: string | null
}

interface Category {
  id: string
  name: string
}

interface Brand {
  id: string
  name: string
}

export default function AdminProductsPage() {
  const { addToast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    sku: "",
    name: "",
    description: "",
    basePrice: "",
    promoPrice: "",
    stockQuantity: "",
    moq: "1",
    packSize: "1",
    vatRate: "0.20",
    categoryId: "",
    brandId: "",
    isActive: true,
  })

  useEffect(() => {
    fetchProducts()
  }, [searchQuery, selectedCategory])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchQuery) params.append("search", searchQuery)
      if (selectedCategory !== "all") params.append("category", selectedCategory)
      
      const response = await fetch(`/api/admin/produits?${params.toString()}`)
      if (!response.ok) throw new Error("Failed to fetch")
      
      const data = await response.json()
      setProducts(data.products)
      setCategories(data.categories)
      setBrands(data.brands)
    } catch {
      addToast({
        title: "Erreur",
        description: "Impossible de charger les produits",
        variant: "error",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const payload = {
        ...formData,
        basePrice: parseFloat(formData.basePrice),
        promoPrice: formData.promoPrice ? parseFloat(formData.promoPrice) : null,
        stockQuantity: parseInt(formData.stockQuantity),
        moq: parseInt(formData.moq),
        packSize: parseInt(formData.packSize),
        vatRate: parseFloat(formData.vatRate),
      }

      const response = await fetch("/api/admin/produits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error)
      }

      addToast({
        title: "Succès",
        description: "Produit créé avec succès",
        variant: "success",
      })
      
      setIsModalOpen(false)
      fetchProducts()
      resetForm()
    } catch (error: any) {
      addToast({
        title: "Erreur",
        description: error.message || "Impossible de créer le produit",
        variant: "error",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      sku: "",
      name: "",
      description: "",
      basePrice: "",
      promoPrice: "",
      stockQuantity: "",
      moq: "1",
      packSize: "1",
      vatRate: "0.20",
      categoryId: "",
      brandId: "",
      isActive: true,
    })
    setEditingProduct(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold">Gestion des produits</h2>
        <Button onClick={() => { resetForm(); setIsModalOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau produit
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                type="search"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">Toutes les catégories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Produit</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead className="text-right">Prix</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-12 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-48 text-center">
                    <Package className="mx-auto h-12 w-12 text-slate-300" />
                    <p className="mt-4 text-slate-500">Aucun produit trouvé</p>
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded bg-slate-100">
                          {product.image ? (
                            <img src={product.image} alt={product.name} className="h-full w-full rounded object-cover" />
                          ) : (
                            <Package className="h-6 w-6 text-slate-400" />
                          )}
                        </div>
                        <span className="font-medium">{product.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                    <TableCell>{product.category?.name || "-"}</TableCell>
                    <TableCell>
                      <span className={product.stockQuantity < 10 ? "text-red-600 font-medium" : ""}>
                        {product.stockQuantity}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div>
                        <span className="font-medium">{formatCurrency(product.basePrice)}</span>
                        {product.promoPrice && (
                          <span className="ml-2 text-sm text-red-600">
                            Promo: {formatCurrency(product.promoPrice)}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={product.isActive ? "success" : "secondary"}>
                        {product.isActive ? "Actif" : "Inactif"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Modifier" : "Nouveau"} produit</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">SKU *</label>
                <Input
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="LP-001"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Nom *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nom du produit"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <textarea
                className="w-full rounded-lg border border-slate-200 p-3 text-sm min-h-[80px]"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description du produit..."
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Prix HT *</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.basePrice}
                  onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                  placeholder="125.50"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Prix promo</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.promoPrice}
                  onChange={(e) => setFormData({ ...formData, promoPrice: e.target.value })}
                  placeholder="Optionnel"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">TVA %</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.vatRate}
                  onChange={(e) => setFormData({ ...formData, vatRate: e.target.value })}
                  placeholder="0.20"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Stock *</label>
                <Input
                  type="number"
                  value={formData.stockQuantity}
                  onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                  placeholder="0"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">MOQ *</label>
                <Input
                  type="number"
                  value={formData.moq}
                  onChange={(e) => setFormData({ ...formData, moq: e.target.value })}
                  placeholder="1"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Pack size *</label>
                <Input
                  type="number"
                  value={formData.packSize}
                  onChange={(e) => setFormData({ ...formData, packSize: e.target.value })}
                  placeholder="1"
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Catégorie</label>
                <select
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                >
                  <option value="">Sélectionner...</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Marque</label>
                <select
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
                  value={formData.brandId}
                  onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
                >
                  <option value="">Sélectionner...</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300"
              />
              <label htmlFor="isActive" className="text-sm">Produit actif</label>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Annuler
              </Button>
              <Button type="submit">
                {editingProduct ? "Enregistrer" : "Créer"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
