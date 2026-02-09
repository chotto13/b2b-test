import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format currency in Moroccan format (DH)
export function formatCurrency(amount: number | Decimal | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : Number(amount)
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num) + ' DH'
}

// Format date in French
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
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

// Format date with time
export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

// Format number
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('fr-FR').format(num)
}

// Generate order number: CMD-YYMM-XXXX
export function generateOrderNumber(): string {
  const date = new Date()
  const year = date.getFullYear().toString().slice(-2)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const random = Math.floor(1000 + Math.random() * 9000)
  return `CMD-${year}${month}-${random}`
}

// Generate invoice number: FAC-YYYY-MM-XXXX
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

// Get order status color class
export function getOrderStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    'CREATED': 'bg-slate-100 text-slate-700 border-slate-200',
    'CONFIRMED': 'bg-blue-50 text-blue-700 border-blue-200',
    'PREPARING': 'bg-yellow-50 text-yellow-700 border-yellow-200',
    'PREPARED': 'bg-indigo-50 text-indigo-700 border-indigo-200',
    'SHIPPED': 'bg-purple-50 text-purple-700 border-purple-200',
    'DELIVERED': 'bg-green-50 text-green-700 border-green-200',
    'CANCELLED': 'bg-red-50 text-red-700 border-red-200',
    'REFUNDED': 'bg-orange-50 text-orange-700 border-orange-200',
  }
  return colorMap[status] || 'bg-slate-100 text-slate-700'
}

// Format invoice status
export function formatInvoiceStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'UNPAID': 'Non payée',
    'PARTIAL': 'Partiellement payée',
    'PAID': 'Payée',
    'OVERDUE': 'En retard',
    'CANCELLED': 'Annulée',
  }
  return statusMap[status] || status
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

// Truncate text
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

// Sleep function for delays
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Type for Decimal from Prisma
type Decimal = {
  toNumber(): number
  toString(): string
}
