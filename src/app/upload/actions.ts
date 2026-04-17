'use server';

import { revalidatePath } from 'next/cache';
import { getUploadAccess } from '@/lib/uploadAccess';
import { createPendingGallerySubmission } from '@/lib/gallerySubmissions';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getSupabaseGalleryBucket, isSupabaseConfigured } from '@/lib/supabase/env';
import { parseYouTubeUrl } from '@/lib/youtube';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const DEFAULT_IMAGE_EXTENSION = 'jpg';

export type UploadFormState = {
  status: 'idle' | 'success' | 'error';
  message: string;
};

export async function submitUpload(
  _prevState: UploadFormState,
  formData: FormData,
): Promise<UploadFormState> {
  if (!isSupabaseConfigured()) {
    return {
      status: 'error',
      message: 'Supabase is not configured yet. Add the auth environment variables before uploading.',
    };
  }

  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return {
      status: 'error',
      message: 'Your session has expired. Sign in again and then retry the upload.',
    };
  }

  const access = getUploadAccess(user.email);

  if (!access.isSchoolEmail || !access.isAllowedUploader) {
    return {
      status: 'error',
      message: 'This account is no longer allowed to upload. Sign in with an approved school email.',
    };
  }

  const title = String(formData.get('title') ?? '').trim();
  const category = String(formData.get('category') ?? '').trim();
  const date = String(formData.get('date') ?? '').trim();
  const mediaType = String(formData.get('mediaType') ?? 'image') === 'youtube' ? 'youtube' : 'image';
  const youtubeUrl = String(formData.get('youtubeUrl') ?? '').trim();
  const image = formData.get('image');

  if (!title || !category || !date) {
    return {
      status: 'error',
      message: 'Please complete the title, category, and date fields before submitting.',
    };
  }

  const parsedDate = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return {
      status: 'error',
      message: 'Enter a valid date before uploading.',
    };
  }

  if (mediaType === 'youtube') {
    const video = parseYouTubeUrl(youtubeUrl);

    if (!video) {
      return {
        status: 'error',
        message: 'Enter a valid YouTube link before submitting. Supported formats include youtube.com/watch, youtu.be, and YouTube Shorts links.',
      };
    }

    const { error: submissionError } = await createPendingGallerySubmission(supabase, {
      email: user.email,
      media_type: 'youtube',
      image_path: null,
      youtube_url: video.url,
      youtube_video_id: video.videoId,
      title,
      category,
      date,
    });

    if (submissionError) {
      console.error('YouTube submission insert failed:', submissionError);

      return {
        status: 'error',
        message: `Creating the YouTube submission record failed: ${submissionError.message}.`,
      };
    }

    revalidatePath('/upload');

    return {
      status: 'success',
      message: 'YouTube video submitted for review. It will appear in Updates once approved.',
    };
  }

  if (!(image instanceof File) || image.size === 0) {
    return {
      status: 'error',
      message: 'Choose an image file before submitting the form.',
    };
  }

  if (!image.type.startsWith('image/')) {
    return {
      status: 'error',
      message: 'The selected file is not an image. Please upload a photo instead.',
    };
  }

  if (image.size > MAX_FILE_SIZE) {
    return {
      status: 'error',
      message: 'This image is larger than 10 MB. Choose a smaller file and try again.',
    };
  }

  const extension = getSafeExtension(image);
  const bucket = getSupabaseGalleryBucket();
  const userFolder = slugify(user.email);
  const baseName = slugify(title);
  const timestamp = Date.now();
  const fileName = `${baseName || 'upload'}-${timestamp}.${extension}`;
  const storagePath = `${userFolder}/${date}/${fileName}`;

  try {
    const bytes = Buffer.from(await image.arrayBuffer());
    const { error: uploadError } = await supabase.storage.from(bucket).upload(storagePath, bytes, {
      contentType: image.type,
      upsert: false,
    });

    if (uploadError) {
      console.error('Storage upload failed:', uploadError);
      return {
        status: 'error',
        message: `Supabase Storage upload failed: ${uploadError.message}. Make sure the bucket and storage policies are set up.`,
      };
    }

    const { error: submissionError } = await createPendingGallerySubmission(supabase, {
      email: user.email,
      media_type: 'image',
      image_path: storagePath,
      youtube_url: null,
      youtube_video_id: null,
      title,
      category,
      date,
    });

    if (submissionError) {
      console.error('Submission insert failed:', submissionError);
      await supabase.storage.from(bucket).remove([storagePath]);

      return {
        status: 'error',
        message: `Upload saved to storage, but creating the submission record failed: ${submissionError.message}.`,
      };
    }

    revalidatePath('/upload');

    return {
      status: 'success',
      message: `Photo uploaded successfully and submitted for review. It is stored securely and marked as pending until approved.`,
    };
  } catch (error) {
    console.error('Upload failed:', error);
    return {
      status: 'error',
      message: 'Upload failed while saving the image or submission record. Please try again.',
    };
  }
}

function getSafeExtension(file: File) {
  const fileNameParts = file.name.split('.');
  const originalExtension = fileNameParts.length > 1 ? fileNameParts[fileNameParts.length - 1] : '';
  const cleanedOriginal = originalExtension.toLowerCase().replace(/[^a-z0-9]/g, '');

  if (cleanedOriginal) {
    return cleanedOriginal;
  }

  const mimeSubtype = file.type.split('/')[1] ?? DEFAULT_IMAGE_EXTENSION;
  const cleanedSubtype = mimeSubtype.toLowerCase().replace(/[^a-z0-9]/g, '');
  return cleanedSubtype || DEFAULT_IMAGE_EXTENSION;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}
