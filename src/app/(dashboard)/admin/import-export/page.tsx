"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  FileText,
  Trash2,
  Eye,
  X,
} from "lucide-react"
import { formatDate } from "@/lib/utils"

// Import types
const importTypes = [
  { value: "PRODUCT_FULL", label: "Import complet produits", description: "Créer ou mettre à jour tous les champs produits" },
  { value: "PRODUCT_STOCK", label: "Mise à jour stock uniquement", description: "Mettre à jour uniquement les quantités en stock" },
  { value: "PRODUCT_PRICE", label: "Mise à jour prix uniquement", description: "Mettre à jour les prix de base et promotionnels" },
]

const importModes = [
  { value: "UPSERT", label: "Upsert (Créer + Mettre à jour)", description: "Créer les nouveaux SKU, mettre à jour les existants" },
  { value: "UPDATE_ONLY", label: "Mettre à jour uniquement", description: "Ignorer les nouveaux SKU, mettre à jour les existants" },
  { value: "CREATE_ONLY", label: "Créer uniquement", description: "Créer uniquement les nouveaux SKU, ignorer les existants" },
]

// Mock import jobs
const mockImportJobs = [
  { id: "1", type: "PRODUCT_FULL", fileName: "produits_janvier.xlsx", status: "COMPLETED", totalRows: 150, successRows: 148, errorRows: 2, createdAt: "2024-01-15T10:30:00Z" },
  { id: "2", type: "PRODUCT_STOCK", fileName: "stock_update.csv", status: "COMPLETED", totalRows: 500, successRows: 500, errorRows: 0, createdAt: "2024-01-14T16:45:00Z" },
  { id: "3", type: "PRODUCT_PRICE", fileName: "prix_promo.xlsx", status: "FAILED", totalRows: 50, successRows: 0, errorRows: 50, createdAt: "2024-01-13T09:20:00Z" },
]

// Mock preview data
const mockPreviewData = [
  { rowNumber: 1, sku: "LP-001", nameFr: "Effaclar Gel", action: "UPDATE", changes: { price_base: { old: 120, new: 125.5 }, stock_quantity: { old: 40, new: 45 } }, errors: [] },
  { rowNumber: 2, sku: "AV-999", nameFr: "Nouveau Produit", action: "CREATE", changes: {}, errors: [] },
  { rowNumber: 3, sku: "INVALID", nameFr: "", action: "ERROR", changes: {}, errors: ["SKU invalide", "Nom requis"] },
]

export default function ImportExportPage() {
  const { addToast } = useToast()
  const [activeTab, setActiveTab] = useState<"import" | "export" | "history">("import")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [importType, setImportType] = useState("PRODUCT_FULL")
  const [importMode, setImportMode] = useState("UPSERT")
  const [isUploading, setIsUploading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [previewData, setPreviewData] = useState<typeof mockPreviewData>([])

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && (file.name.endsWith('.csv') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
      setSelectedFile(file)
    } else {
      addToast({
        title: "Format non supporté",
        description: "Veuillez déposer un fichier CSV ou Excel (.xlsx)",
        variant: "error",
      })
    }
  }, [addToast])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleValidate = async () => {
    if (!selectedFile) return
    
    setIsUploading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setPreviewData(mockPreviewData)
    setShowPreview(true)
    setIsUploading(false)
  }

  const handleConfirmImport = async () => {
    setIsUploading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    addToast({
      title: "Import terminé",
      description: "148 produits mis à jour, 2 erreurs",
      variant: "success",
    })
    
    setShowPreview(false)
    setSelectedFile(null)
    setIsUploading(false)
    setActiveTab("history")
  }

  const downloadTemplate = (type: string) => {
    const templates: Record<string, { headers: string[]; filename: string }> = {
      PRODUCT_FULL: {
        headers: ["sku", "barcode", "name_fr", "brand", "category", "description_fr", "unit", "pack_size", "moq", "price_base", "promo_price", "promo_start", "promo_end", "tax_rate", "stock_quantity", "is_active", "images"],
        filename: "template_ajout_produits.csv",
      },
      PRODUCT_STOCK: {
        headers: ["sku", "stock_quantity", "warehouse_code"],
        filename: "template_mise_a_jour_stock.csv",
      },
      PRODUCT_PRICE: {
        headers: ["sku", "price_base", "promo_price", "promo_start", "promo_end"],
        filename: "template_mise_a_jour_prix.csv",
      },
    }

    const template = templates[type]
    if (template) {
      const csvContent = template.headers.join(",") + "\n"
      const blob = new Blob([csvContent], { type: "text/csv" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = template.filename
      a.click()
      window.URL.revokeObjectURL(url)
      
      addToast({
        title: "Template téléchargé",
        description: template.filename,
        variant: "success",
      })
    }
  }

  const handleExport = async (format: "csv" | "xlsx") => {
    addToast({
      title: "Export en cours",
      description: `Export en format ${format.toUpperCase()}...`,
      variant: "info",
    })
    
    // Simulate export
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    addToast({
      title: "Export terminé",
      description: `1250 produits exportés en ${format.toUpperCase()}`,
      variant: "success",
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Import / Export</h1>
        <p className="text-gray-500">
          Importez et exportez vos produits en masse via Excel ou CSV
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {[
          { id: "import", label: "Importer", icon: Upload },
          { id: "export", label: "Exporter", icon: Download },
          { id: "history", label: "Historique", icon: FileText },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Import Tab */}
      {activeTab === "import" && (
        <div className="space-y-6">
          {/* Import Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Type d'import</CardTitle>
              <CardDescription>Sélectionnez le type de données à importer</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                {importTypes.map((type) => (
                  <div
                    key={type.value}
                    onClick={() => setImportType(type.value)}
                    className={`cursor-pointer rounded-lg border p-4 transition-all ${
                      importType === type.value
                        ? "border-blue-500 bg-blue-50"
                        : "hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`h-4 w-4 rounded-full border-2 ${
                        importType === type.value
                          ? "border-blue-500 bg-blue-500"
                          : "border-gray-300"
                      }`}>
                        {importType === type.value && (
                          <CheckCircle className="h-3 w-3 text-white" />
                        )}
                      </div>
                      <span className="font-medium">{type.label}</span>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">{type.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Import Mode */}
          <Card>
            <CardHeader>
              <CardTitle>Mode d'import</CardTitle>
              <CardDescription>Choisissez comment traiter les données</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                {importModes.map((mode) => (
                  <div
                    key={mode.value}
                    onClick={() => setImportMode(mode.value)}
                    className={`cursor-pointer rounded-lg border p-4 transition-all ${
                      importMode === mode.value
                        ? "border-blue-500 bg-blue-50"
                        : "hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`h-4 w-4 rounded-full border-2 ${
                        importMode === mode.value
                          ? "border-blue-500 bg-blue-500"
                          : "border-gray-300"
                      }`} />
                      <span className="font-medium">{mode.label}</span>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">{mode.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Fichier à importer</CardTitle>
              <CardDescription>
                Glissez-déposez votre fichier ou cliquez pour sélectionner
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleFileDrop}
                className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center hover:border-gray-400"
              >
                {selectedFile ? (
                  <div className="flex items-center justify-center gap-3">
                    <FileSpreadsheet className="h-8 w-8 text-green-500" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900">{selectedFile.name}</p>
                      <p className="text-sm text-gray-500">
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedFile(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-4 text-sm text-gray-600">
                      <span className="font-medium text-blue-600">Cliquez pour uploader</span> ou glissez-déposez
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      CSV, XLSX jusqu'à 10MB
                    </p>
                    <input
                      type="file"
                      className="hidden"
                      accept=".csv,.xlsx,.xls"
                      onChange={handleFileSelect}
                    />
                  </label>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={() => downloadTemplate(importType)}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Télécharger le template
                </Button>
                <Button
                  onClick={handleValidate}
                  disabled={!selectedFile || isUploading}
                  isLoading={isUploading}
                >
                  Valider et prévisualiser
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Export Tab */}
      {activeTab === "export" && (
        <div className="grid gap-6 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Export CSV</CardTitle>
              <CardDescription>Format compatible avec tous les tableurs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Filtres</label>
                <select className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm">
                  <option>Tous les produits (1250)</option>
                  <option>Produits actifs uniquement</option>
                  <option>Produits en rupture</option>
                  <option>Produits modifiés récemment</option>
                </select>
              </div>
              <Button onClick={() => handleExport("csv")} className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Exporter en CSV
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Export Excel</CardTitle>
              <CardDescription>Format Excel avec mise en forme</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Filtres</label>
                <select className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm">
                  <option>Tous les produits (1250)</option>
                  <option>Par catégorie</option>
                  <option>Par marque</option>
                </select>
              </div>
              <Button onClick={() => handleExport("xlsx")} className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Exporter en Excel
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* History Tab */}
      {activeTab === "history" && (
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Fichier</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Résultat</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockImportJobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell>{formatDate(job.createdAt)}</TableCell>
                    <TableCell>
                      {importTypes.find(t => t.value === job.type)?.label || job.type}
                    </TableCell>
                    <TableCell>{job.fileName}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          job.status === "COMPLETED"
                            ? "success"
                            : job.status === "FAILED"
                            ? "danger"
                            : "warning"
                        }
                      >
                        {job.status === "COMPLETED" ? "Terminé" : job.status === "FAILED" ? "Échec" : "En cours"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-green-600">{job.successRows} OK</span>
                      {job.errorRows > 0 && (
                        <span className="ml-2 text-red-600">{job.errorRows} erreurs</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {job.errorRows > 0 && (
                          <Button variant="ghost" size="icon" className="text-red-600">
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Prévisualisation de l'import</DialogTitle>
            <DialogDescription>
              Vérifiez les modifications avant de confirmer l'import
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Summary */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg bg-blue-50 p-4 text-center">
                <p className="text-2xl font-bold text-blue-600">1</p>
                <p className="text-sm text-blue-700">Nouveaux produits</p>
              </div>
              <div className="rounded-lg bg-yellow-50 p-4 text-center">
                <p className="text-2xl font-bold text-yellow-600">1</p>
                <p className="text-sm text-yellow-700">Produits à mettre à jour</p>
              </div>
              <div className="rounded-lg bg-red-50 p-4 text-center">
                <p className="text-2xl font-bold text-red-600">1</p>
                <p className="text-sm text-red-700">Erreurs à corriger</p>
              </div>
            </div>

            {/* Preview Table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ligne</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Détails</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {previewData.map((row) => (
                  <TableRow key={row.rowNumber}>
                    <TableCell>{row.rowNumber}</TableCell>
                    <TableCell className="font-mono">{row.sku}</TableCell>
                    <TableCell>{row.nameFr || "-"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          row.action === "CREATE"
                            ? "success"
                            : row.action === "UPDATE"
                            ? "warning"
                            : "danger"
                        }
                      >
                        {row.action === "CREATE" ? "Créer" : row.action === "UPDATE" ? "Mettre à jour" : "Erreur"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {row.action === "UPDATE" && (
                        <div className="text-sm">
                          {Object.entries(row.changes).map(([field, change]: [string, any]) => (
                            <div key={field}>
                              {field}: {change.old} → {change.new}
                            </div>
                          ))}
                        </div>
                      )}
                      {row.errors.length > 0 && (
                        <div className="text-sm text-red-600">
                          {row.errors.join(", ")}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleConfirmImport}
              disabled={isUploading}
              isLoading={isUploading}
            >
              Confirmer l'import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
