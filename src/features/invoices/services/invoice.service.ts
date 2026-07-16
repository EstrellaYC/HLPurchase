import { supabase } from '@/lib/supabase/client'
import { AppError } from '@/shared/lib/errors'
import type { InvoiceFormValues } from '@/features/invoices/schemas/invoice.schema'
import type { InvoiceStatus } from '@/shared/constants/status'
import type { InvoiceWithDetails } from '@/shared/types/database'

export async function listInvoices(): Promise<InvoiceWithDetails[]> {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select(
        `
        *,
        suppliers:supplier_id ( id, name ),
        invoice_items ( * )
      `,
      )
      .order('invoice_date', { ascending: false })

    if (error) {
      throw new AppError(error.message, 'INVOICE_LIST_FAILED')
    }

    return (data ?? []) as InvoiceWithDetails[]
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }
    throw new AppError('Failed to list invoices', 'INVOICE_LIST_FAILED')
  }
}

export async function createInvoice(
  values: InvoiceFormValues,
  userId: string,
): Promise<InvoiceWithDetails> {
  try {
    const items = values.items ?? []
    const computedTotal =
      items.length > 0
        ? items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0)
        : values.total_amount

    const { data: invoice, error } = await supabase
      .from('invoices')
      .insert({
        supplier_id: values.supplier_id,
        purchase_order_id: values.purchase_order_id ?? null,
        invoice_number: values.invoice_number || null,
        invoice_date: values.invoice_date,
        total_amount: Number(computedTotal.toFixed(2)),
        status: values.status,
        image_url: values.image_url ?? null,
        note: values.note || null,
        created_by: userId,
      })
      .select('id')
      .single()

    if (error || !invoice) {
      throw new AppError(error?.message ?? 'Create failed', 'INVOICE_CREATE_FAILED')
    }

    if (items.length > 0) {
      const { error: itemsError } = await supabase.from('invoice_items').insert(
        items.map((item) => ({
          invoice_id: invoice.id,
          product_id: item.product_id ?? null,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          amount: Number((item.quantity * item.unit_price).toFixed(2)),
        })),
      )

      if (itemsError) {
        throw new AppError(itemsError.message, 'INVOICE_ITEMS_FAILED')
      }
    }

    return getInvoice(invoice.id)
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }
    throw new AppError('Failed to create invoice', 'INVOICE_CREATE_FAILED')
  }
}

export async function getInvoice(id: string): Promise<InvoiceWithDetails> {
  const { data, error } = await supabase
    .from('invoices')
    .select(
      `
      *,
      suppliers:supplier_id ( id, name ),
      invoice_items ( * )
    `,
    )
    .eq('id', id)
    .single()

  if (error || !data) {
    throw new AppError(error?.message ?? 'Invoice not found', 'INVOICE_NOT_FOUND')
  }

  return data as InvoiceWithDetails
}

export async function updateInvoiceStatus(
  id: string,
  status: InvoiceStatus,
): Promise<void> {
  try {
    const { error } = await supabase.from('invoices').update({ status }).eq('id', id)
    if (error) {
      throw new AppError(error.message, 'INVOICE_UPDATE_FAILED')
    }
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }
    throw new AppError('Failed to update invoice', 'INVOICE_UPDATE_FAILED')
  }
}
