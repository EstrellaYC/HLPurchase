import type {
  InventoryChangeType,
  InvoiceStatus,
  ProcurementNeedStatus,
  ProductUnit,
  PurchaseOrderStatus,
} from '@/shared/constants/status'
import type { UserRole } from '@/shared/constants/roles'

export type Profile = {
  id: string
  email: string
  display_name: string
  role: UserRole
  is_active: boolean
  created_at: string
  updated_at: string
}

export type Category = {
  id: string
  name_zh: string
  name_en: string
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export type Supplier = {
  id: string
  name: string
  contact_name: string | null
  phone: string | null
  email: string | null
  wechat: string | null
  notes: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export type Product = {
  id: string
  category_id: string | null
  name_zh: string
  name_en: string
  sku: string | null
  unit: ProductUnit | string
  image_url: string | null
  min_stock: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export type ProductWithCategory = Product & {
  categories: Pick<Category, 'id' | 'name_zh' | 'name_en'> | null
}

export type ProductSupplier = {
  id: string
  product_id: string
  supplier_id: string
  unit_price: number
  package_size: number
  is_preferred: boolean
  lead_days: number
  created_at: string
  updated_at: string
}

export type InventoryItem = {
  id: string
  product_id: string
  quantity: number
  updated_by: string | null
  updated_at: string
}

export type InventoryWithProduct = InventoryItem & {
  products: ProductWithCategory
}

export type InventoryLog = {
  id: string
  product_id: string
  change_type: InventoryChangeType
  quantity_before: number
  quantity_after: number
  delta: number
  note: string | null
  created_by: string | null
  created_at: string
}

export type ProcurementNeed = {
  id: string
  title: string
  status: ProcurementNeedStatus
  needed_date: string | null
  note: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export type ProcurementNeedItem = {
  id: string
  need_id: string
  product_id: string
  quantity: number
  note: string | null
  created_at: string
}

export type ProcurementNeedWithItems = ProcurementNeed & {
  procurement_need_items: Array<
    ProcurementNeedItem & {
      products: Pick<Product, 'id' | 'name_zh' | 'name_en' | 'unit'>
    }
  >
}

export type PurchaseOrder = {
  id: string
  supplier_id: string
  status: PurchaseOrderStatus
  order_date: string
  note: string | null
  source_need_id: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export type PurchaseOrderItem = {
  id: string
  order_id: string
  product_id: string
  quantity: number
  unit_price: number
  note: string | null
  created_at: string
}

export type PurchaseOrderWithDetails = PurchaseOrder & {
  suppliers: Pick<Supplier, 'id' | 'name' | 'phone' | 'contact_name'>
  purchase_order_items: Array<
    PurchaseOrderItem & {
      products: Pick<Product, 'id' | 'name_zh' | 'name_en' | 'unit'>
    }
  >
}

export type Invoice = {
  id: string
  supplier_id: string
  purchase_order_id: string | null
  invoice_number: string | null
  invoice_date: string
  total_amount: number
  status: InvoiceStatus
  image_url: string | null
  note: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export type InvoiceItem = {
  id: string
  invoice_id: string
  product_id: string | null
  description: string
  quantity: number
  unit_price: number
  amount: number
  created_at: string
}

export type InvoiceWithDetails = Invoice & {
  suppliers: Pick<Supplier, 'id' | 'name'>
  invoice_items: InvoiceItem[]
}
