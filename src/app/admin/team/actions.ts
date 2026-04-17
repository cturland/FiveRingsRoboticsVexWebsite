'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { getAdminAccess } from '@/lib/adminAccess';
import { PUBLIC_TEAM_PROFILES_CACHE_TAG } from '@/lib/teamProfiles';
import { buildTeamProfilePayload, deleteTeamProfilePhoto, parseTeamProfileFormData, uploadTeamProfilePhoto } from '@/lib/teamProfileMutations';
import { createSupabaseServerClient } from '@/lib/supabase/server';

async function requireAdminUser() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const access = await getAdminAccess(user?.email);

  if (!user?.email || !access.isAdmin) {
    throw new Error('Only gallery admins can manage team profiles.');
  }

  return { supabase, user };
}

export async function updateTeamProfileAsAdmin(formData: FormData) {
  const targetEmail = String(formData.get('email') ?? '').trim().toLowerCase();
  const ownerKey = String(formData.get('ownerKey') ?? '').trim();

  if (!targetEmail || !ownerKey) {
    throw new Error('Missing team profile metadata.');
  }

  const { supabase } = await requireAdminUser();
  const parsed = parseTeamProfileFormData(formData, targetEmail);

  if (!parsed.ok) {
    throw new Error(parsed.message);
  }

  const uploaded = await uploadTeamProfilePhoto(supabase, parsed.values, ownerKey);

  if (!uploaded.ok) {
    throw new Error(uploaded.message);
  }

  const payload = buildTeamProfilePayload(parsed.values, uploaded.photoPath);

  const { error } = await supabase
    .from('team_profiles')
    .update(payload)
    .eq('email', targetEmail);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/admin/team');
  revalidatePath('/team');
  revalidateTag(PUBLIC_TEAM_PROFILES_CACHE_TAG);
}

export async function deleteTeamProfileAsAdmin(formData: FormData) {
  const targetEmail = String(formData.get('email') ?? '').trim().toLowerCase();
  const photoPath = String(formData.get('photoPath') ?? '').trim() || null;

  if (!targetEmail) {
    throw new Error('Missing team profile email.');
  }

  const { supabase } = await requireAdminUser();

  const { error } = await supabase
    .from('team_profiles')
    .delete()
    .eq('email', targetEmail);

  if (error) {
    throw new Error(error.message);
  }

  await deleteTeamProfilePhoto(supabase, photoPath);

  revalidatePath('/admin/team');
  revalidatePath('/team');
  revalidatePath('/profile');
  revalidateTag(PUBLIC_TEAM_PROFILES_CACHE_TAG);
}
