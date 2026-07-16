export const PROCUREMENT_NEED_STATUS = {
  OPEN: 'open',
  CONVERTED: 'converted',
  CANCELLED: 'cancelled',
} as const

export type ProcurementNeedStatus =
  (typeof PROCUREMENT_NEED_STATUS)[keyof typeof PROCUREMENT_NEED_STATUS]

export const PURCHASE_ORDER_STATUS = {
  DRAFT: 'draft',
  CONFIRMED: 'confirmed',
  ORDERED: 'ordered',
  RECEIVED: 'received',
  CANCELLED: 'cancelled',
} as const

export type PurchaseOrderStatus =
  (typeof PURCHASE_ORDER_STATUS)[keyof typeof PURCHASE_ORDER_STATUS]

export const INVOICE_STATUS = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  DISPUTED: 'disputed',
} as const

export type InvoiceStatus =
  (typeof INVOICE_STATUS)[keyof typeof INVOICE_STATUS]

export const INVENTORY_CHANGE_TYPE = {
  COUNT: 'count',
  RECEIVE: 'receive',
  ADJUST: 'adjust',
  WASTE: 'waste',
} as const

export type InventoryChangeType =
  (typeof INVENTORY_CHANGE_TYPE)[keyof typeof INVENTORY_CHANGE_TYPE]

export const PRODUCT_UNITS = {
  KG: 'kg',
  G: 'g',
  L: 'L',
  ML: 'ml',
  PCS: 'pcs',
  BOX: 'box',
  BAG: 'bag',
  CASE: 'case',
} as const

export type ProductUnit = (typeof PRODUCT_UNITS)[keyof typeof PRODUCT_UNITS]

export const PRODUCT_UNIT_LIST: readonly ProductUnit[] = [
  PRODUCT_UNITS.KG,
  PRODUCT_UNITS.G,
  PRODUCT_UNITS.L,
  PRODUCT_UNITS.ML,
  PRODUCT_UNITS.PCS,
  PRODUCT_UNITS.BOX,
  PRODUCT_UNITS.BAG,
  PRODUCT_UNITS.CASE,
]
