import type { SupabaseClient } from '@supabase/supabase-js';
import { getBrowserSupabaseClient } from '@/lib/supabase/client';

export const LISTING_PHOTO_BUCKET = 'listing-photos';
export const MAX_PHOTO_BYTES = 10 * 1024 * 1024; // 10MB
export const ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

const PHOTO_EXTENSIONS: Record<(typeof ALLOWED_PHOTO_TYPES)[number], string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export function getListingPhotoClient(): SupabaseClient | null {
  return getBrowserSupabaseClient();
}

export function isUploadableImage(file: File): boolean {
  return ALLOWED_PHOTO_TYPES.includes(file.type as (typeof ALLOWED_PHOTO_TYPES)[number]) && file.size <= MAX_PHOTO_BYTES;
}

export function buildPhotoPath(userId: string, fileName: string, contentType?: string): string {
  const safeUserId = userId.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 80);
  const ext = (contentType ? PHOTO_EXTENSIONS[contentType as (typeof ALLOWED_PHOTO_TYPES)[number]] : undefined) ?? safeExtension(fileName);
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  return `${safeUserId}/${unique}.${ext}`;
}

export type UploadResult =
  | { success: true; url: string }
  | { success: false; error: string };

export async function uploadListingPhoto(client: SupabaseClient, userId: string, file: File): Promise<UploadResult> {
  if (!isUploadableImage(file)) {
    return { success: false, error: `${file.name} must be a JPG, PNG, or WebP image under 10MB.` };
  }

  const path = buildPhotoPath(userId, file.name, file.type);
  const { error } = await client.storage.from(LISTING_PHOTO_BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type,
  });

  if (error) {
    return { success: false, error: 'Photo upload failed. Please try again.' };
  }

  const { data } = client.storage.from(LISTING_PHOTO_BUCKET).getPublicUrl(path);
  return { success: true, url: data.publicUrl };
}

function safeExtension(fileName: string): string {
  const extMatch = fileName.match(/\.([a-zA-Z0-9]+)$/);
  const ext = (extMatch?.[1] ?? 'jpg').toLowerCase();
  return ['jpg', 'jpeg', 'png', 'webp'].includes(ext) ? (ext === 'jpeg' ? 'jpg' : ext) : 'jpg';
}
