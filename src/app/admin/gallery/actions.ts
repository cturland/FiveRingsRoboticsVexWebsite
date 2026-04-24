'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { getAdminAccess } from '@/lib/adminAccess';
import { GALLERY_ITEMS_CACHE_TAG } from '@/lib/gallery';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getSupabaseGalleryBucket } from '@/lib/supabase/env';
import { parseYouTubeUrl } from '@/lib/youtube';

async function requireAdminUser() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const access = await getAdminAccess(user?.email);

  if (!user?.email || !access.isAdmin) {
    throw new Error('Only gallery admins can manage submissions.');
  }

  return { supabase, user };
}

function revalidateGalleryPaths() {
  revalidatePath('/admin');
  revalidatePath('/admin/gallery');
  revalidatePath('/gallery');
  revalidatePath('/');
  revalidatePath('/worlds-live');
  revalidateTag(GALLERY_ITEMS_CACHE_TAG);
}

export async function setGallerySubmissionStatus(formData: FormData) {
  const submissionId = Number(formData.get('submissionId'));
  const requestedStatus = String(formData.get('status') ?? '').trim().toLowerCase();

  if (!Number.isFinite(submissionId)) {
    throw new Error('Missing submission id.');
  }

  if (!['approved', 'rejected', 'pending'].includes(requestedStatus)) {
    throw new Error('Invalid submission status.');
  }

  const { supabase } = await requireAdminUser();
  const { error } = await supabase
    .from('gallery_submissions')
    .update({ status: requestedStatus })
    .eq('id', submissionId);

  if (error) {
    throw new Error(error.message);
  }

  revalidateGalleryPaths();
}

export async function updateGallerySubmissionAsAdmin(formData: FormData) {
  const submissionId = Number(formData.get('submissionId'));
  const mediaType = String(formData.get('mediaType') ?? '').trim().toLowerCase();
  const title = String(formData.get('title') ?? '').trim();
  const category = String(formData.get('category') ?? '').trim();
  const date = String(formData.get('date') ?? '').trim();
  const youtubeUrlInput = String(formData.get('youtubeUrl') ?? '').trim();

  if (!Number.isFinite(submissionId)) {
    throw new Error('Missing submission id.');
  }

  if (!title || !category || !date) {
    throw new Error('Title, category, and date are required.');
  }

  if (Number.isNaN(new Date(`${date}T00:00:00`).getTime())) {
    throw new Error('Enter a valid date.');
  }

  const { supabase } = await requireAdminUser();
  const payload: {
    title: string;
    category: string;
    date: string;
    youtube_url?: string;
    youtube_video_id?: string;
  } = {
    title,
    category,
    date,
  };

  if (mediaType === 'youtube') {
    const video = parseYouTubeUrl(youtubeUrlInput);

    if (!video) {
      throw new Error('Enter a valid YouTube link for video updates.');
    }

    payload.youtube_url = video.url;
    payload.youtube_video_id = video.videoId;
  }

  const { error } = await supabase
    .from('gallery_submissions')
    .update(payload)
    .eq('id', submissionId);

  if (error) {
    throw new Error(error.message);
  }

  revalidateGalleryPaths();
}

export async function deleteGallerySubmissionAsAdmin(formData: FormData) {
  const submissionId = Number(formData.get('submissionId'));
  const imagePath = String(formData.get('imagePath') ?? '').trim() || null;

  if (!Number.isFinite(submissionId)) {
    throw new Error('Missing submission id.');
  }

  const { supabase } = await requireAdminUser();
  const { error } = await supabase
    .from('gallery_submissions')
    .delete()
    .eq('id', submissionId);

  if (error) {
    throw new Error(error.message);
  }

  if (imagePath) {
    const bucket = getSupabaseGalleryBucket();
    const { error: storageError } = await supabase.storage.from(bucket).remove([imagePath]);

    if (storageError) {
      console.error('Failed to delete gallery image from storage:', storageError);
    }
  }

  revalidateGalleryPaths();
}
