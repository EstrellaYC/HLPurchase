import imageCompression from 'browser-image-compression'
import {
  IMAGE_UPLOAD,
  type AcceptedImageMimeType,
} from '@/shared/constants/storage'
import { AppError } from '@/shared/lib/errors'

function isAcceptedMimeType(type: string): type is AcceptedImageMimeType {
  return (IMAGE_UPLOAD.ACCEPTED_MIME_TYPES as readonly string[]).includes(type)
}

export async function compressImageFile(file: File): Promise<File> {
  if (!isAcceptedMimeType(file.type)) {
    throw new AppError('Unsupported image format', 'INVALID_IMAGE_TYPE')
  }

  if (file.size > IMAGE_UPLOAD.MAX_SIZE_BYTES) {
    throw new AppError('Image is too large', 'IMAGE_TOO_LARGE')
  }

  const compressed = await imageCompression(file, {
    maxWidthOrHeight: IMAGE_UPLOAD.MAX_WIDTH,
    maxSizeMB: IMAGE_UPLOAD.MAX_SIZE_BYTES / (1024 * 1024),
    useWebWorker: true,
    initialQuality: IMAGE_UPLOAD.QUALITY,
    fileType: file.type,
  })

  return new File([compressed], file.name, {
    type: compressed.type || file.type,
    lastModified: Date.now(),
  })
}
