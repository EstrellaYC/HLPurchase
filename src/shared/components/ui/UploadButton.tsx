import { useRef, type ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/components/ui/Button'
import { IMAGE_UPLOAD } from '@/shared/constants/storage'
import { compressImageFile } from '@/shared/utils/image'
import { getErrorMessage } from '@/shared/lib/errors'
import { toast } from 'sonner'

type UploadButtonProps = {
  onUploaded: (file: File) => void | Promise<void>
  label?: string
  loading?: boolean
  disabled?: boolean
}

export function UploadButton({
  onUploaded,
  label,
  loading = false,
  disabled = false,
}: UploadButtonProps) {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)

  const handleClick = () => {
    inputRef.current?.click()
  }

  const handleChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) {
      return
    }

    try {
      const compressed = await compressImageFile(file)
      await onUploaded(compressed)
    } catch (error) {
      toast.error(getErrorMessage(error, t('errors.uploadFailed')))
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={IMAGE_UPLOAD.ACCEPTED_MIME_TYPES.join(',')}
        className="sr-only"
        onChange={handleChange}
      />
      <Button
        type="button"
        variant="secondary"
        onClick={handleClick}
        loading={loading}
        disabled={disabled}
      >
        {label ?? t('common.uploadImage')}
      </Button>
    </>
  )
}
