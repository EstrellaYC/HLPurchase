export const STORAGE_BUCKETS = {
  IMAGES: 'images',
} as const

export const IMAGE_UPLOAD = {
  MAX_SIZE_BYTES: 5 * 1024 * 1024,
  MAX_WIDTH: 1280,
  MAX_HEIGHT: 1280,
  QUALITY: 0.8,
  ACCEPTED_MIME_TYPES: ['image/jpeg', 'image/png', 'image/webp'] as const,
} as const

export type AcceptedImageMimeType =
  (typeof IMAGE_UPLOAD.ACCEPTED_MIME_TYPES)[number]
