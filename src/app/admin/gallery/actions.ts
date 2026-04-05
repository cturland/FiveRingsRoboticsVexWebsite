'use server';

import { revalidatePath } from 'next/cache';
import { getAdminAccess } from '@/lib/adminAccess';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function approveGallerySubmission(formData: FormData) {
  const submissionId = Number(formData.get('submissionId'));

  if (!Number.isFinite(submissionId)) {
    return;
  }

  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const access = await getAdminAccess(user?.email);

  if (!user?.email || !access.isAdmin) {
    throw new Error('Only gallery admins can approve submissions.');
  }

  const { error } = await supabase
    .from('gallery_submissions')
    .update({ status: 'approved' })
    .eq('id', submissionId)
    .eq('status', 'pending');

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/admin/gallery');
  revalidatePath('/gallery');
  revalidatePath('/');
  revalidatePath('/worlds-live');
}
