import 'server-only';

import { teamTables } from '@/lib/supabase/teamTables';
import { supabaseCacheScope } from '@/lib/supabase/env';

import { unstable_cache } from 'next/cache';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import { createSupabasePublicClient } from '@/lib/supabase/public';
import type { PublicGalleryItem } from './gallery.types';

export const GALLERY_ITEMS_CACHE_TAG = 'gallery-items';

async function loadGalleryItems(): Promise<PublicGalleryItem[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = createSupabasePublicClient();
  if (!supabase) {
    return [];
  }


  const { data, error } = await supabase
    .from(teamTables.publicSubmissions)
    .select('id, media_type, youtube_url, youtube_video_id, title, category, date')
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
      image: mediaType === 'image' ? '/api/media/gallery/' + item.id : '',
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

export const getGalleryItems = unstable_cache(loadGalleryItems, ['published-gallery-items', supabaseCacheScope], {
  revalidate: 300,
  tags: [GALLERY_ITEMS_CACHE_TAG],
});
