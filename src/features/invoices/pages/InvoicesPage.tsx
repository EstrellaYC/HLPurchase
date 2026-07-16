import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/Button'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { Modal } from '@/shared/components/ui/Modal'
import { Spinner } from '@/shared/components/ui/Spinner'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { InvoiceCard } from '@/features/invoices/components/InvoiceCard'
import { InvoiceForm } from '@/features/invoices/components/InvoiceForm'
import {
  useCreateInvoice,
  useInvoices,
  useUpdateInvoiceStatus,
} from '@/features/invoices/hooks/useInvoices'
import { useSuppliers } from '@/features/suppliers/hooks/useSuppliers'
import { getErrorMessage } from '@/shared/lib/errors'
import type { InvoiceFormValues } from '@/features/invoices/schemas/invoice.schema'
import type { InvoiceStatus } from '@/shared/constants/status'

export function InvoicesPage() {
  const { t } = useTranslation()
  const { canManage, profile } = useAuth()
  const [open, setOpen] = useState(false)
  const invoicesQuery = useInvoices()
  const suppliersQuery = useSuppliers()
  const createInvoice = useCreateInvoice()
  const updateStatus = useUpdateInvoiceStatus()

  const invoices = invoicesQuery.data ?? []
  const suppliers = (suppliersQuery.data ?? []).filter((supplier) => supplier.is_active)

  const handleCreate = async (values: InvoiceFormValues) => {
    if (!profile) {
      return
    }

    try {
      await createInvoice.mutateAsync({ values, userId: profile.id })
      toast.success(t('invoices.saved'))
      setOpen(false)
    } catch (error) {
      toast.error(getErrorMessage(error, t('errors.generic')))
    }
  }

  const handleStatus = async (id: string, status: InvoiceStatus) => {
    try {
      await updateStatus.mutateAsync({ id, status })
      toast.success(t('invoices.saved'))
    } catch (error) {
      toast.error(getErrorMessage(error, t('errors.generic')))
    }
  }

  if (invoicesQuery.isLoading || suppliersQuery.isLoading) {
    return <Spinner label={t('common.loading')} />
  }

  return (
    <section>
      <header className="page-header">
        <h1>{t('invoices.title')}</h1>
        <p>{t('invoices.subtitle')}</p>
      </header>

      {canManage ? (
        <div className="toolbar">
          <div />
          <Button type="button" onClick={() => setOpen(true)}>
            {t('invoices.create')}
          </Button>
        </div>
      ) : (
        <p className="muted">{t('permissions.managerOnly')}</p>
      )}

      {invoices.length === 0 ? (
        <EmptyState title={t('invoices.empty')} />
      ) : (
        <div className="list-panel">
          {invoices.map((invoice) => (
            <InvoiceCard
              key={invoice.id}
              invoice={invoice}
              canManage={canManage}
              onStatusChange={(status) => {
                void handleStatus(invoice.id, status)
              }}
            />
          ))}
        </div>
      )}

      <Modal
        open={open}
        title={t('invoices.create')}
        onClose={() => setOpen(false)}
      >
        <InvoiceForm
          suppliers={suppliers}
          onSubmit={handleCreate}
          onCancel={() => setOpen(false)}
          submitting={createInvoice.isPending}
        />
      </Modal>
    </section>
  )
}
