import 'server-only';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getSupabaseGalleryBucket, isSupabaseConfigured } from '@/lib/supabase/env';
import type { PublicGalleryItem } from './gallery.types';

export async function getGalleryItems(): Promise<PublicGalleryItem[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = createSupabaseServerClient();
  const bucket = getSupabaseGalleryBucket();

  const { data, error } = await supabase
    .from('gallery_submissions')
    .select('id, image_path, title, category, date')
    .eq('status', 'approved')
    .order('date', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to read approved gallery submissions:', error);
    return [];
  }

  return (data ?? []).map((item) => ({
    id: item.id,
    image: supabase.storage.from(bucket).getPublicUrl(item.image_path).data.publicUrl,
    title: item.title,
    category: item.category,
    date: item.date,
  }));
}
