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
    .select('id, media_type, image_path, youtube_url, youtube_video_id, title, category, date')
    .eq('status', 'approved')
    .order('date', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to read approved gallery submissions:', error);
    return [];
  }

  return (data ?? []).map((item) => {
    const mediaType = item.media_type === 'youtube' ? 'youtube' : 'image';
    const youtubeVideoId = item.youtube_video_id ?? '';

    return {
      id: item.id,
      mediaType,
      image: item.image_path ? supabase.storage.from(bucket).getPublicUrl(item.image_path).data.publicUrl : '',
      youtubeUrl: item.youtube_url ?? '',
      youtubeVideoId,
      youtubeEmbedUrl: youtubeVideoId ? `https://www.youtube.com/embed/${youtubeVideoId}` : '',
      youtubeThumbnailUrl: youtubeVideoId ? `https://img.youtube.com/vi/${youtubeVideoId}/hqdefault.jpg` : '',
      title: item.title,
      category: item.category,
      date: item.date,
    } satisfies PublicGalleryItem;
  });
}
