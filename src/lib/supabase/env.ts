const publicUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publicAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const publicGalleryBucket = process.env.NEXT_PUBLIC_SUPABASE_GALLERY_BUCKET || 'gallery-uploads';

export function isSupabaseConfigured() {
  return Boolean(publicUrl && publicAnonKey);
}

export function getSupabaseUrl() {
  if (!publicUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
  }

  return publicUrl;
}

export function getSupabaseAnonKey() {
  if (!publicAnonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  return publicAnonKey;
}

export function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
}

export function getSupabaseGalleryBucket() {
  return publicGalleryBucket;
}
