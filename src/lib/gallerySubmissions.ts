import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';

export type GallerySubmissionInsert = {
  email: string;
  image_path: string;
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
