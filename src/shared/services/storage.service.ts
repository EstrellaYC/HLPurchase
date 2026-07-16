import { STORAGE_BUCKETS } from '@/shared/constants/storage'
import { supabase } from '@/lib/supabase/client'
import { AppError } from '@/shared/lib/errors'

function buildObjectPath(folder: string, fileName: string): string {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_')
  return `${folder}/${Date.now()}-${safeName}`
}

export async function uploadImage(folder: string, file: File): Promise<string> {
  const path = buildObjectPath(folder, file.name)
  const { error } = await supabase.storage
    .from(STORAGE_BUCKETS.IMAGES)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    })

  if (error) {
    throw new AppError(error.message, 'STORAGE_UPLOAD_FAILED')
  }

  const { data } = supabase.storage.from(STORAGE_BUCKETS.IMAGES).getPublicUrl(path)
  return data.publicUrl
}
