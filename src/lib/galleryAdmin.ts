import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getSupabaseGalleryBucket } from '@/lib/supabase/env';

export type AdminGallerySubmission = {
  id: number;
  email: string;
  mediaType: 'image' | 'youtube';
  imagePath: string | null;
  imageUrl: string;
  youtubeUrl: string;
  youtubeVideoId: string;
  youtubeEmbedUrl: string;
  youtubeThumbnailUrl: string;
  title: string;
  category: string;
  date: string;
  status: string;
  createdAt: string;
};

function mapAdminGallerySubmission(
  supabase: SupabaseClient,
  item: {
    id: number;
    email: string;
    media_type: string;
    image_path: string | null;
    youtube_url: string | null;
    youtube_video_id: string | null;
    title: string;
    category: string;
    date: string;
    status: string;
    created_at: string;
  },
  bucket: string,
) {
  const mediaType = item.media_type === 'youtube' ? 'youtube' : 'image';
  const youtubeVideoId = item.youtube_video_id ?? '';

  return {
    id: item.id,
    email: item.email,
    mediaType,
    imagePath: item.image_path,
    imageUrl: item.image_path ? supabase.storage.from(bucket).getPublicUrl(item.image_path).data.publicUrl : '',
    youtubeUrl: item.youtube_url ?? '',
    youtubeVideoId,
    youtubeEmbedUrl: youtubeVideoId ? `https://www.youtube.com/embed/${youtubeVideoId}` : '',
    youtubeThumbnailUrl: youtubeVideoId ? `https://img.youtube.com/vi/${youtubeVideoId}/hqdefault.jpg` : '',
    title: item.title,
    category: item.category,
    date: item.date,
    status: item.status,
    createdAt: item.created_at,
  } satisfies AdminGallerySubmission;
}

export async function getPendingGallerySubmissions(): Promise<AdminGallerySubmission[]> {
  const supabase = createSupabaseServerClient();
  const bucket = getSupabaseGalleryBucket();

  const { data, error } = await supabase
    .from('gallery_submissions')
    .select('id, email, media_type, image_path, youtube_url, youtube_video_id, title, category, date, status, created_at')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to load pending gallery submissions:', error);
    return [];
  }

  return (data ?? []).map((item) => mapAdminGallerySubmission(supabase, item, bucket));
}

export async function getAllGallerySubmissionsForAdmin(): Promise<AdminGallerySubmission[]> {
  const supabase = createSupabaseServerClient();
  const bucket = getSupabaseGalleryBucket();

  const { data, error } = await supabase
    .from('gallery_submissions')
    .select('id, email, media_type, image_path, youtube_url, youtube_video_id, title, category, date, status, created_at')
    .order('date', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to load admin gallery submissions:', error);
    return [];
  }

  return (data ?? []).map((item) => mapAdminGallerySubmission(supabase, item, bucket));
}
