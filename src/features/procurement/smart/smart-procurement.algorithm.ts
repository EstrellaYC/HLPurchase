import type {
  InventoryWithProduct,
  ProductSupplier,
  Supplier,
} from '@/shared/types/database'

export type SmartProductSupplier = Pick<
  ProductSupplier,
  'product_id' | 'supplier_id' | 'unit_price' | 'is_preferred' | 'package_size'
>

export type SmartSuggestion = {
  product_id: string
  supplier_id: string
  product_name_zh: string
  product_name_en: string
  unit: string
  current_quantity: number
  min_stock: number
  suggested_quantity: number
  unit_price: number
  package_size: number
  is_preferred_supplier: boolean
  supplier: Supplier
}

export type GenerateSmartSuggestionsInput = {
  inventory: InventoryWithProduct[]
  productSuppliers: SmartProductSupplier[]
  suppliers: Supplier[]
}

function selectSupplier(
  productId: string,
  productSuppliers: SmartProductSupplier[],
): SmartProductSupplier | null {
  const candidates = productSuppliers.filter((supplier) => supplier.product_id === productId)
  if (candidates.length === 0) {
    return null
  }

  const preferred = candidates.find((supplier) => supplier.is_preferred)
  if (preferred) {
    return preferred
  }

  const firstCandidate = candidates[0]
  if (!firstCandidate) {
    return null
  }

  return candidates.slice(1).reduce<SmartProductSupplier>((cheapest, candidate) =>
    candidate.unit_price < cheapest.unit_price ? candidate : cheapest,
    firstCandidate,
  )
}

export function generateSmartSuggestions(
  input: GenerateSmartSuggestionsInput,
): SmartSuggestion[] {
  return input.inventory.flatMap((item) => {
    const product = item.products
    if (item.quantity >= product.min_stock) {
      return []
    }

    const supplierChoice = selectSupplier(product.id, input.productSuppliers)
    if (!supplierChoice) {
      return []
    }

    const supplier = input.suppliers.find(
      (currentSupplier) => currentSupplier.id === supplierChoice.supplier_id,
    )
    if (!supplier) {
      return []
    }

    const replenishmentQuantity = Number(
      (product.min_stock * 2 - item.quantity).toFixed(2),
    )
    const suggestedQuantity = Math.max(
      replenishmentQuantity,
      supplierChoice.package_size,
    )

    return [
      {
        product_id: product.id,
        supplier_id: supplierChoice.supplier_id,
        product_name_zh: product.name_zh,
        product_name_en: product.name_en,
        unit: product.unit,
        current_quantity: item.quantity,
        min_stock: product.min_stock,
        suggested_quantity: suggestedQuantity,
        unit_price: supplierChoice.unit_price,
        package_size: supplierChoice.package_size,
        is_preferred_supplier: supplierChoice.is_preferred,
        supplier,
      },
    ]
  })
}
