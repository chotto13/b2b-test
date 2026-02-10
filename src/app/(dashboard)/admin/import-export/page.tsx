"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Upload,
  Download,
  FileSpreadsheet,
  X,
  FileText,
} from "lucide-react"
import { formatDate } from "@/lib/utils"

const importTypes = [
  { value: "PRODUCT_FULL", label: "Import complet produits", description: "Créer ou mettre à jour tous les champs" },
  { value: "PRODUCT_STOCK", label: "Mise à jour stock", description: "Mettre à jour uniquement les quantités" },
  { value: "PRODUCT_PRICE", label: "Mise à jour prix", description: "Mettre à jour les prix" },
]

const importModes = [
  { value: "UPSERT", label: "Upsert (Créer + Mettre à jour)" },
  { value: "UPDATE_ONLY", label: "Mettre à jour uniquement" },
  { value: "CREATE_ONLY", label: "Créer uniquement" },
]

// Mock import history
const mockImportJobs = [
  { id: "1", type: "PRODUCT_FULL", fileName: "produits_janvier.xlsx", status: "COMPLETED", totalRows: 150, successRows: 148, errorRows: 2, createdAt: "2024-01-15T10:30:00Z" },
  { id: "2", type: "PRODUCT_STOCK", fileName: "stock_update.csv", status: "COMPLETED", totalRows: 500, successRows: 500, errorRows: 0, createdAt: "2024-01-14T16:45:00Z" },
]

interface PreviewChange {
  old: string | number | boolean;
  new: string | number | boolean;
}

interface PreviewRow {
  rowNumber: number;
  sku: string;
  name: string;
  action: string;
  changes: Record<string, PreviewChange>;
  errors: string[];
}

const mockPreviewData: PreviewRow[] = [
  { rowNumber: 1, sku: "LP-001", name: "Effaclar Gel", action: "UPDATE", changes: { stock: { old: 40, new: 45 } }, errors: [] },
  { rowNumber: 2, sku: "AV-999", name: "Nouveau Produit", action: "CREATE", changes: {}, errors: [] },
  { rowNumber: 3, sku: "INVALID", name: "", action: "ERROR", changes: {}, errors: ["SKU invalide", "Nom requis"] },
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
    if (file && (file.name.endsWith('.csv') || file.name.endsWith('.xlsx'))) {
      setSelectedFile(file)
    } else {
      addToast({ title: "Format non supporté", description: "Veuillez utiliser CSV ou Excel", variant: "error" })
    }
  }, [addToast])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setSelectedFile(file)
  }

  const handleValidate = async () => {
    if (!selectedFile) return
    setIsUploading(true)
    await new Promise(r => setTimeout(r, 1500))
    setPreviewData(mockPreviewData)
    setShowPreview(true)
    setIsUploading(false)
  }

  const handleConfirmImport = async () => {
    setIsUploading(true)
    await new Promise(r => setTimeout(r, 2000))
    addToast({ title: "Import terminé", description: "148 produits mis à jour", variant: "success" })
    setShowPreview(false)
    setSelectedFile(null)
    setIsUploading(false)
    setActiveTab("history")
  }

  const downloadTemplate = (type: string) => {
    const templates: Record<string, string[]> = {
      PRODUCT_FULL: ["sku", "name", "description", "basePrice", "promoPrice", "stockQuantity", "moq", "packSize", "vatRate", "category", "brand", "isActive"],
      PRODUCT_STOCK: ["sku", "stockQuantity"],
      PRODUCT_PRICE: ["sku", "basePrice", "promoPrice"],
    }
    const headers = templates[type] || templates.PRODUCT_FULL
    const csv = headers.join(",") + "\n"
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `template_${type.toLowerCase()}.csv`
    a.click()
    URL.revokeObjectURL(url)
    addToast({ title: "Template téléchargé", variant: "success" })
  }

  const handleExport = async (format: "csv" | "xlsx") => {
    addToast({ title: "Export en cours", description: `Export ${format.toUpperCase()}...`, variant: "info" })
    await new Promise(r => setTimeout(r, 1000))
    addToast({ title: "Export terminé", description: "1250 produits exportés", variant: "success" })
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {([
          { id: "import" as const, label: "Importer", icon: Upload },
          { id: "export" as const, label: "Exporter", icon: Download },
          { id: "history" as const, label: "Historique", icon: FileText },
        ] as const).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"
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
          <Card>
            <CardHeader>
              <CardTitle>Type d&apos;import</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                {importTypes.map((type) => (
                  <div
                    key={type.value}
                    onClick={() => setImportType(type.value)}
                    className={`cursor-pointer rounded-lg border p-4 ${importType === type.value ? "border-blue-500 bg-blue-50" : ""}`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`h-4 w-4 rounded-full border-2 ${importType === type.value ? "border-blue-500 bg-blue-500" : "border-slate-300"}`} />
                      <span className="font-medium">{type.label}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-500">{type.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mode d&apos;import</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                {importModes.map((mode) => (
                  <label key={mode.value} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="importMode"
                      value={mode.value}
                      checked={importMode === mode.value}
                      onChange={(e) => setImportMode(e.target.value)}
                      className="h-4 w-4"
                    />
                    <span className="text-sm">{mode.label}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fichier à importer</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleFileDrop}
                className="rounded-lg border-2 border-dashed border-slate-300 p-8 text-center hover:border-slate-400"
              >
                {selectedFile ? (
                  <div className="flex items-center justify-center gap-3">
                    <FileSpreadsheet className="h-8 w-8 text-green-500" />
                    <div className="text-left">
                      <p className="font-medium">{selectedFile.name}</p>
                      <p className="text-sm text-slate-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setSelectedFile(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <Upload className="mx-auto h-12 w-12 text-slate-400" />
                    <p className="mt-4 text-sm text-slate-600">
                      <span className="font-medium text-blue-600">Cliquez pour uploader</span> ou glissez-déposez
                    </p>
                    <p className="mt-1 text-xs text-slate-500">CSV, XLSX jusqu&apos;à 10MB</p>
                    <input type="file" className="hidden" accept=".csv,.xlsx" onChange={handleFileSelect} />
                  </label>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between">
                <Button variant="outline" onClick={() => downloadTemplate(importType)}>
                  <Download className="mr-2 h-4 w-4" />
                  Télécharger le template
                </Button>
                <Button onClick={handleValidate} disabled={!selectedFile || isUploading}>
                  {isUploading ? "Validation..." : "Valider et prévisualiser"}
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
            </CardHeader>
            <CardContent className="space-y-4">
              <select className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm">
                <option>Tous les produits</option>
                <option>Produits actifs</option>
                <option>Stock faible</option>
              </select>
              <Button onClick={() => handleExport("csv")} className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Exporter CSV
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Export Excel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <select className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm">
                <option>Tous les produits</option>
                <option>Par catégorie</option>
                <option>Par marque</option>
              </select>
              <Button onClick={() => handleExport("xlsx")} className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Exporter Excel
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* History Tab */}
      {activeTab === "history" && (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Fichier</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Résultat</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockImportJobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>{formatDate(job.createdAt)}</TableCell>
                  <TableCell>{job.type}</TableCell>
                  <TableCell>{job.fileName}</TableCell>
                  <TableCell>
                    <Badge variant={job.status === "COMPLETED" ? "success" : "danger"}>
                      {job.status === "COMPLETED" ? "Terminé" : "Échec"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-green-600">{job.successRows} OK</span>
                    {job.errorRows > 0 && <span className="ml-2 text-red-600">{job.errorRows} erreurs</span>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Prévisualisation de l&apos;import</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 sm:grid-cols-3 my-4">
            <div className="rounded-lg bg-blue-50 p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">1</p>
              <p className="text-sm text-blue-700">Nouveaux produits</p>
            </div>
            <div className="rounded-lg bg-yellow-50 p-4 text-center">
              <p className="text-2xl font-bold text-yellow-600">1</p>
              <p className="text-sm text-yellow-700">À mettre à jour</p>
            </div>
            <div className="rounded-lg bg-red-50 p-4 text-center">
              <p className="text-2xl font-bold text-red-600">1</p>
              <p className="text-sm text-red-700">Erreurs</p>
            </div>
          </div>

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
                  <TableCell>{row.name || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={row.action === "CREATE" ? "success" : row.action === "UPDATE" ? "warning" : "danger"}>
                      {row.action}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {row.errors.length > 0 && (
                      <span className="text-sm text-red-600">{row.errors.join(", ")}</span>
                    )}
                    {row.action === "UPDATE" && Object.keys(row.changes).length > 0 && (
                      <div className="text-sm">
                        {Object.entries(row.changes).map(([field, change]: [string, PreviewChange]) => (
                          <div key={field}>{field}: {change.old} → {change.new}</div>
                        ))}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreview(false)}>Annuler</Button>
            <Button onClick={handleConfirmImport} disabled={isUploading}>
              {isUploading ? "Import..." : "Confirmer l'import"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
