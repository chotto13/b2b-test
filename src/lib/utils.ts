import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format currency in Moroccan format (MAD / DH)
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-MA', {
    style: 'currency',
    currency: 'MAD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount).replace('MAD', 'DH')
}

// Format date in French (Morocco)
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}

// Format short date
export function formatDateShort(date: Date | string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date))
}

// Format number with French locale
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('fr-FR').format(num)
}

// Generate order number
export function generateOrderNumber(): string {
  const date = new Date()
  const year = date.getFullYear().toString().slice(-2)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const random = Math.floor(1000 + Math.random() * 9000)
  return `CMD-${year}${month}-${random}`
}

// Generate invoice number
export function generateInvoiceNumber(): string {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const random = Math.floor(1000 + Math.random() * 9000)
  return `FAC-${year}-${month}-${random}`
}

// Generate ticket number
export function generateTicketNumber(): string {
  const date = new Date()
  const year = date.getFullYear().toString().slice(-2)
  const random = Math.floor(10000 + Math.random() * 90000)
  return `TICK-${year}-${random}`
}

// Generate import job number
export function generateImportJobNumber(): string {
  const date = new Date()
  const timestamp = date.getTime().toString().slice(-8)
  return `IMP-${timestamp}`
}

// Format payment terms
export function formatPaymentTerms(terms: string): string {
  const termsMap: Record<string, string> = {
    'CASH': 'Paiement comptant',
    'TRANSFER_30': 'Virement 30 jours',
    'TRANSFER_45': 'Virement 45 jours',
    'TRANSFER_60': 'Virement 60 jours',
    'CHEQUE_30': 'Chèque 30 jours',
    'CHEQUE_45': 'Chèque 45 jours',
  }
  return termsMap[terms] || terms
}

// Format order status
export function formatOrderStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'CREATED': 'Créée',
    'CONFIRMED': 'Confirmée',
    'PREPARING': 'En préparation',
    'PREPARED': 'Préparée',
    'SHIPPED': 'Expédiée',
    'DELIVERED': 'Livrée',
    'CANCELLED': 'Annulée',
    'REFUNDED': 'Remboursée',
  }
  return statusMap[status] || status
}

// Get order status color
export function getOrderStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    'CREATED': 'bg-gray-100 text-gray-800',
    'CONFIRMED': 'bg-blue-100 text-blue-800',
    'PREPARING': 'bg-yellow-100 text-yellow-800',
    'PREPARED': 'bg-indigo-100 text-indigo-800',
    'SHIPPED': 'bg-purple-100 text-purple-800',
    'DELIVERED': 'bg-green-100 text-green-800',
    'CANCELLED': 'bg-red-100 text-red-800',
    'REFUNDED': 'bg-orange-100 text-orange-800',
  }
  return colorMap[status] || 'bg-gray-100 text-gray-800'
}

// Format ticket status
export function formatTicketStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'OPEN': 'Ouvert',
    'IN_PROGRESS': 'En cours',
    'WAITING_CUSTOMER': 'En attente client',
    'RESOLVED': 'Résolu',
    'CLOSED': 'Fermé',
  }
  return statusMap[status] || status
}

// Format ticket priority
export function formatTicketPriority(priority: string): string {
  const priorityMap: Record<string, string> = {
    'LOW': 'Basse',
    'MEDIUM': 'Moyenne',
    'HIGH': 'Haute',
    'URGENT': 'Urgente',
  }
  return priorityMap[priority] || priority
}

// Format unit type
export function formatUnitType(unit: string): string {
  const unitMap: Record<string, string> = {
    'UNIT': 'Unité',
    'CARTON': 'Carton',
    'BOX': 'Boîte',
    'PALLET': 'Palette',
  }
  return unitMap[unit] || unit
}

// Parse Excel/CSV file (helper)
export function parseImportFile(buffer: Buffer, mimeType: string): any[] {
  // This will be implemented with the xlsx library
  // Placeholder for now
  return []
}

// Validate SKU format
export function isValidSKU(sku: string): boolean {
  return /^[A-Z0-9_-]+$/i.test(sku) && sku.length >= 3
}

// Validate barcode
export function isValidBarcode(barcode: string): boolean {
  return /^[0-9]{8,13}$/.test(barcode)
}
