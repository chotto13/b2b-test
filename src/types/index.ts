// User types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: Role;
  isActive: boolean;
  companyId?: string;
  company?: Company;
  createdAt: Date;
  updatedAt: Date;
}

export type Role = 'CLIENT_PRO' | 'SALES_REP' | 'ADMIN' | 'SUPER_ADMIN';

// Company types
export interface Company {
  id: string;
  name: string;
  ice?: string;
  ifField?: string;
  rc?: string;
  cnss?: string;
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
  isApproved: boolean;
  approvalStatus: ApprovalStatus;
  paymentTerms: PaymentTerms;
  priceListId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type PaymentTerms = 'CASH' | 'TRANSFER_30' | 'TRANSFER_45' | 'TRANSFER_60' | 'CHEQUE_30' | 'CHEQUE_45';

// Address types
export interface Address {
  id: string;
  name: string;
  address: string;
  city: string;
  postalCode?: string;
  country: string;
  isDefault: boolean;
  companyId: string;
}

// Category types
export interface Category {
  id: string;
  nameFr: string;
  nameAr?: string;
  nameEn?: string;
  slug: string;
  descriptionFr?: string;
  image?: string;
  isActive: boolean;
  parentId?: string;
  parent?: Category;
  children?: Category[];
}

// Brand types
export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  isActive: boolean;
}

// Product types
export interface Product {
  id: string;
  sku: string;
  barcode?: string;
  nameFr: string;
  nameAr?: string;
  nameEn?: string;
  slug: string;
  descriptionFr?: string;
  unit: UnitType;
  packSize: number;
  moq: number;
  basePrice: number;
  taxRate: number;
  stockQuantity: number;
  lowStockThreshold: number;
  isActive: boolean;
  categoryId?: string;
  category?: Category;
  brandId?: string;
  brand?: Brand;
  images: ProductImage[];
  variants?: ProductVariant[];
  customerPrice?: number; // Customer-specific price
  finalPrice?: number; // After promotions
  createdAt: Date;
  updatedAt: Date;
}

export type UnitType = 'UNIT' | 'CARTON' | 'BOX' | 'PALLET';

export interface ProductImage {
  id: string;
  url: string;
  alt?: string;
  sortOrder: number;
  isPrimary: boolean;
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  price: number;
  stockQuantity: number;
}

// Cart types
export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  onBehalfOfCompanyId?: string;
  subtotal?: number;
  taxAmount?: number;
  total?: number;
}

export interface CartItem {
  id: string;
  quantity: number;
  productId: string;
  product: Product;
  variantId?: string;
  variant?: ProductVariant;
  unitPrice?: number;
  totalPrice?: number;
}

export interface SavedCart {
  id: string;
  name: string;
  items: SavedCartItem[];
  userId: string;
  createdAt: Date;
}

export interface SavedCartItem {
  productId: string;
  quantity: number;
  variantId?: string;
}

// Order types
export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  statusHistory: StatusHistory[];
  subtotal: number;
  taxAmount: number;
  total: number;
  paymentTerms: PaymentTerms;
  paymentStatus: PaymentStatus;
  userId: string;
  user?: User;
  companyId: string;
  company?: Company;
  shippingAddress: Address;
  placedBySalesRep: boolean;
  items: OrderItem[];
  invoices: Invoice[];
  deliveryNotes: DeliveryNote[];
  customerNote?: string;
  internalNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type OrderStatus = 'CREATED' | 'CONFIRMED' | 'PREPARING' | 'PREPARED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
export type PaymentStatus = 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE' | 'CANCELLED';

export interface StatusHistory {
  id: string;
  status: OrderStatus;
  note?: string;
  createdBy?: string;
  createdAt: Date;
}

export interface OrderItem {
  id: string;
  productId: string;
  product: Product;
  variantId?: string;
  variant?: ProductVariant;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

// Invoice types
export interface Invoice {
  id: string;
  number: string;
  amount: number;
  pdfUrl?: string;
  orderId: string;
  companyId: string;
  issueDate: Date;
  dueDate?: Date;
  paidAt?: Date;
}

export interface DeliveryNote {
  id: string;
  number: string;
  pdfUrl?: string;
  orderId: string;
  trackingNumber?: string;
  shippedAt?: Date;
  deliveredAt?: Date;
}

// Ticket types
export interface Ticket {
  id: string;
  number: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  userId: string;
  user?: User;
  messages: TicketMessage[];
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'WAITING_CUSTOMER' | 'RESOLVED' | 'CLOSED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TicketCategory = 'ORDER_ISSUE' | 'PRODUCT_QUESTION' | 'SHIPPING' | 'INVOICING' | 'ACCOUNT' | 'TECHNICAL' | 'OTHER';

export interface TicketMessage {
  id: string;
  content: string;
  isInternal: boolean;
  ticketId: string;
  userId: string;
  user?: User;
  attachments?: string[];
  createdAt: Date;
}

// Import/Export types
export interface ImportJob {
  id: string;
  type: ImportType;
  fileName: string;
  fileUrl?: string;
  status: ImportStatus;
  totalRows: number;
  successRows: number;
  errorRows: number;
  previewData?: ImportPreviewRow[];
  errors?: ImportError[];
  userId: string;
  executedAt?: Date;
  createdAt: Date;
}

export type ImportType = 'PRODUCT_FULL' | 'PRODUCT_STOCK' | 'PRODUCT_PRICE' | 'CUSTOMER';
export type ImportStatus = 'PENDING' | 'VALIDATING' | 'VALIDATED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface ImportPreviewRow {
  rowNumber: number;
  sku: string;
  nameFr?: string;
  action: 'CREATE' | 'UPDATE' | 'ERROR';
  changes?: Record<string, { old: any; new: any }>;
  errors?: string[];
}

export interface ImportError {
  rowNumber: number;
  field: string;
  message: string;
}

// Product import row structure
export interface ProductImportRow {
  sku: string;
  barcode?: string;
  name_fr: string;
  brand?: string;
  category?: string;
  description_fr?: string;
  unit?: string;
  pack_size?: number;
  moq?: number;
  price_base?: number;
  promo_price?: number;
  promo_start?: string;
  promo_end?: string;
  tax_rate?: number;
  stock_quantity?: number;
  is_active?: boolean;
  images?: string;
}

// Filter types
export interface ProductFilter {
  category?: string;
  brand?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sortBy?: 'name' | 'price' | 'created' | 'stock';
  sortOrder?: 'asc' | 'desc';
}

export interface OrderFilter {
  status?: OrderStatus;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

// Dashboard stats
export interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  totalSpent: number;
  favoriteProducts: number;
  recentOrders: Order[];
  lowStockAlerts?: Product[];
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
