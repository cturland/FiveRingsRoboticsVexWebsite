import 'server-only';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getSupabaseGalleryBucket } from '@/lib/supabase/env';

export type PendingGallerySubmission = {
  id: number;
  email: string;
  imagePath: string;
  imageUrl: string;
  title: string;
  category: string;
  date: string;
  status: string;
  createdAt: string;
};

export async function getPendingGallerySubmissions(): Promise<PendingGallerySubmission[]> {
  const supabase = createSupabaseServerClient();
  const bucket = getSupabaseGalleryBucket();

  const { data, error } = await supabase
    .from('gallery_submissions')
    .select('id, email, image_path, title, category, date, status, created_at')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to load pending gallery submissions:', error);
    return [];
  }

  return (data ?? []).map((item) => ({
    id: item.id,
    email: item.email,
    imagePath: item.image_path,
    imageUrl: supabase.storage.from(bucket).getPublicUrl(item.image_path).data.publicUrl,
    title: item.title,
    category: item.category,
    date: item.date,
    status: item.status,
    createdAt: item.created_at,
  }));
}
