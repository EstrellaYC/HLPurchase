import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/components/ui/Button'
import { Modal } from '@/shared/components/ui/Modal'

type ConfirmDialogProps = {
  open: boolean
  title: string
  description?: string
  confirming?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirming = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { t } = useTranslation()

  return (
    <Modal
      open={open}
      title={title}
      onClose={onCancel}
      footer={
        <>
          <Button type="button" variant="ghost" onClick={onCancel}>
            {t('common.cancel')}
          </Button>
          <Button type="button" variant="danger" loading={confirming} onClick={onConfirm}>
            {t('common.confirm')}
          </Button>
        </>
      }
    >
      {description ? <p className="muted">{description}</p> : null}
    </Modal>
  )
}
