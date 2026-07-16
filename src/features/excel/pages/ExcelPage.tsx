import { useRef, type ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/Button'
import { useAuth } from '@/features/auth/hooks/useAuth'
import {
  exportProductsExcel,
  exportSuppliersExcel,
  importProductsExcel,
  importSuppliersExcel,
} from '@/features/excel/services/excel.service'
import { getErrorMessage } from '@/shared/lib/errors'

export function ExcelPage() {
  const { t } = useTranslation()
  const { canManage } = useAuth()
  const productInputRef = useRef<HTMLInputElement>(null)
  const supplierInputRef = useRef<HTMLInputElement>(null)

  const run = async (action: () => Promise<unknown>, successKey: string) => {
    try {
      await action()
      toast.success(t(successKey))
    } catch (error) {
      toast.error(getErrorMessage(error, t('errors.generic')))
    }
  }

  const onImportProducts = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    await run(async () => {
      const count = await importProductsExcel(file)
      return count
    }, 'excel.imported')
  }

  const onImportSuppliers = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    await run(async () => {
      await importSuppliersExcel(file)
    }, 'excel.imported')
  }

  if (!canManage) {
    return (
      <section>
        <header className="page-header">
          <h1>{t('excel.title')}</h1>
          <p>{t('permissions.managerOnly')}</p>
        </header>
      </section>
    )
  }

  return (
    <section>
      <header className="page-header">
        <h1>{t('excel.title')}</h1>
        <p>{t('excel.subtitle')}</p>
      </header>

      <p className="muted" style={{ marginBottom: 16 }}>
        {t('excel.templateHint')}
      </p>

      <div className="stack-lg">
        <div className="stack">
          <Button
            type="button"
            onClick={() => void run(exportProductsExcel, 'excel.exported')}
          >
            {t('excel.exportProducts')}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => productInputRef.current?.click()}
          >
            {t('excel.importProducts')}
          </Button>
        </div>

        <div className="stack">
          <Button
            type="button"
            onClick={() => void run(exportSuppliersExcel, 'excel.exported')}
          >
            {t('excel.exportSuppliers')}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => supplierInputRef.current?.click()}
          >
            {t('excel.importSuppliers')}
          </Button>
        </div>
      </div>

      <input
        ref={productInputRef}
        type="file"
        accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        className="sr-only"
        onChange={(event) => {
          void onImportProducts(event)
        }}
      />
      <input
        ref={supplierInputRef}
        type="file"
        accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        className="sr-only"
        onChange={(event) => {
          void onImportSuppliers(event)
        }}
      />
    </section>
  )
}
