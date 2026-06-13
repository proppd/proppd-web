import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export const LISTING_PHOTO_BUCKET = 'listing-photos';
export const MAX_PHOTO_BYTES = 10 * 1024 * 1024; // 10MB

let cachedClient: SupabaseClient | null = null;

export function getListingPhotoClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  if (!cachedClient) {
    cachedClient = createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true } });
  }
  return cachedClient;
}

export function isUploadableImage(file: File): boolean {
  return file.type.startsWith('image/') && file.size <= MAX_PHOTO_BYTES;
}

export function buildPhotoPath(userId: string, fileName: string): string {
  const extMatch = fileName.match(/\.([a-zA-Z0-9]+)$/);
  const ext = (extMatch?.[1] ?? 'jpg').toLowerCase();
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  return `${userId}/${unique}.${ext}`;
}

export type UploadResult =
  | { success: true; url: string }
  | { success: false; error: string };

export async function uploadListingPhoto(client: SupabaseClient, userId: string, file: File): Promise<UploadResult> {
  if (!isUploadableImage(file)) {
    return { success: false, error: `${file.name} must be an image under 10MB.` };
  }

  const path = buildPhotoPath(userId, file.name);
  const { error } = await client.storage.from(LISTING_PHOTO_BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  const { data } = client.storage.from(LISTING_PHOTO_BUCKET).getPublicUrl(path);
  return { success: true, url: data.publicUrl };
}
