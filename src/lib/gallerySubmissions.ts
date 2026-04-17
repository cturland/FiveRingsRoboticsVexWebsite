import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';

export type GallerySubmissionInsert = {
  email: string;
  media_type: 'image' | 'youtube';
  image_path?: string | null;
  youtube_url?: string | null;
  youtube_video_id?: string | null;
  title: string;
  category: string;
  date: string;
};

export async function createPendingGallerySubmission(
  supabase: SupabaseClient,
  submission: GallerySubmissionInsert,
) {
  return supabase
    .from('gallery_submissions')
    .insert({
      ...submission,
      status: 'pending',
    })
    .select('id')
    .single();
}
