import { supabase } from '@/lib/supabase/client'
import { AppError } from '@/shared/lib/errors'
import type { Supplier } from '@/shared/types/database'
import type { SupplierFormValues } from '@/features/suppliers/schemas/supplier.schema'

type SupplierPayload = {
  name: string
  contact_name: string | null
  phone: string | null
  email: string | null
  wechat: string | null
  notes: string | null
  is_active: boolean
}

function normalizeOptionalText(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? ''
  return trimmed.length > 0 ? trimmed : null
}

function normalizeSupplierPayload(values: SupplierFormValues): SupplierPayload {
  return {
    name: values.name.trim(),
    contact_name: normalizeOptionalText(values.contact_name),
    phone: normalizeOptionalText(values.phone),
    email: normalizeOptionalText(values.email),
    wechat: normalizeOptionalText(values.wechat),
    notes: normalizeOptionalText(values.notes),
    is_active: values.is_active,
  }
}

function searchPattern(search: string): string {
  return `%${search.trim().replace(/[,%]/g, '')}%`
}

export async function listSuppliers(search?: string): Promise<Supplier[]> {
  let query = supabase
    .from('suppliers')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true })

  const trimmedSearch = search?.trim()
  if (trimmedSearch) {
    const pattern = searchPattern(trimmedSearch)
    query = query.or(
      `name.ilike.${pattern},contact_name.ilike.${pattern},phone.ilike.${pattern},email.ilike.${pattern},wechat.ilike.${pattern}`,
    )
  }

  const { data, error } = await query

  if (error) {
    throw new AppError(error.message, 'SUPPLIERS_LIST_FAILED')
  }

  return (data ?? []) as Supplier[]
}

export async function createSupplier(
  values: SupplierFormValues,
): Promise<Supplier> {
  const { data, error } = await supabase
    .from('suppliers')
    .insert(normalizeSupplierPayload(values))
    .select('*')
    .single()

  if (error || !data) {
    throw new AppError(
      error?.message ?? 'Supplier not created',
      'SUPPLIER_CREATE_FAILED',
    )
  }

  return data as Supplier
}

export async function updateSupplier(
  id: string,
  values: SupplierFormValues,
): Promise<Supplier> {
  const { data, error } = await supabase
    .from('suppliers')
    .update(normalizeSupplierPayload(values))
    .eq('id', id)
    .select('*')
    .single()

  if (error || !data) {
    throw new AppError(
      error?.message ?? 'Supplier not updated',
      'SUPPLIER_UPDATE_FAILED',
    )
  }

  return data as Supplier
}

export async function deactivateSupplier(id: string): Promise<void> {
  const { error } = await supabase
    .from('suppliers')
    .update({ is_active: false })
    .eq('id', id)

  if (error) {
    throw new AppError(error.message, 'SUPPLIER_DEACTIVATE_FAILED')
  }
}
