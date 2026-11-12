'use server';

import { revalidatePath, updateTag } from 'next/cache';
import { getAdminAccess } from '@/lib/adminAccess';
import { PUBLIC_TEAM_PROFILES_CACHE_TAG } from '@/lib/teamProfiles';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { buildTeamProfilePayload, deleteTeamProfilePhoto, parseTeamProfileFormData, uploadTeamProfilePhoto } from '@/lib/teamProfileMutations';
import { getUploadAccess } from '@/lib/uploadAccess';

export type TeamProfileFormState = {
  status: 'idle' | 'success' | 'error';
  message: string;
};

export async function saveTeamProfile(
  _prevState: TeamProfileFormState,
  formData: FormData,
): Promise<TeamProfileFormState> {
  if (!isSupabaseConfigured()) {
    return {
      status: 'error',
      message: 'Supabase is not configured yet. Add the auth environment variables before saving a profile.',
    };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return {
      status: 'error',
      message: 'Your session has expired. Sign in again and then retry saving your profile.',
    };
  }

  const access = await getUploadAccess(supabase, user.email);
  if (!access.isSchoolEmail || !access.isAllowedUploader) {
    return {
      status: 'error',
      message: 'This account is not allowed to edit member profiles. Sign in with an approved school email.',
    };
  }
  const { data: existing, error: lookupError } = await supabase
    .from('team_profiles')
    .select('id, photo_path')
    .eq('email', user.email.toLowerCase())
    .maybeSingle();
  if (lookupError) {
    return { status: 'error', message: 'Could not read your current profile. Please try again.' };
  }

  const oldPhoto = existing?.photo_path ?? null;
  const parsed = parseTeamProfileFormData(formData, user.email, oldPhoto);

  if (!parsed.ok) {
    return {
      status: 'error',
      message: parsed.message,
    };
  }

  const uploaded = await uploadTeamProfilePhoto(supabase, parsed.values, user.id);

  if (!uploaded.ok) {
    return {
      status: 'error',
      message: uploaded.message,
    };
  }

  const payload = buildTeamProfilePayload(parsed.values, uploaded.photoPath);

  const profiles = supabase.from('team_profiles');
  const save = existing ? profiles.update(payload).eq('id', existing.id) : profiles.insert(payload);
  if (existing) {
    if (oldPhoto) save.eq('photo_path', oldPhoto);
    else save.is('photo_path', null);
  }
  const { error } = await save.select('id').single();

  if (error) {
    console.error('Failed to save team profile:', error);
    return {
      status: 'error',
      message: `Saving your profile failed: ${error.message}.`,
    };
  }

  if (oldPhoto !== uploaded.photoPath) await deleteTeamProfilePhoto(supabase, oldPhoto);

  revalidatePath('/profile');
  revalidatePath('/upload');
  revalidatePath('/team');
  updateTag(PUBLIC_TEAM_PROFILES_CACHE_TAG);

  const adminAccess = await getAdminAccess(user.email);

  return {
    status: 'success',
    message: adminAccess.isAdmin
      ? 'Your team profile has been updated. Admin controls for editing other profiles can be added next.'
      : 'Your team profile has been saved successfully.',
  };
}
