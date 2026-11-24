'use server';

import { teamTables } from '@/lib/supabase/teamTables';

import { revalidatePath, updateTag } from 'next/cache';
import { PUBLIC_TEAM_PROFILES_CACHE_TAG } from '@/lib/teamProfiles';
import { isRosterConfigured } from '@/lib/supabase/rosterReady';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { buildTeamProfilePayload, deleteTeamProfilePhoto, parseTeamProfileFormData, uploadTeamProfilePhoto } from '@/lib/teamProfileMutations';
import { getUploadAccess, isStudentEmail } from '@/lib/uploadAccess';

export type TeamProfileFormState = {
  status: 'idle' | 'success' | 'error';
  message: string;
};

export async function saveTeamProfile(
  _prevState: TeamProfileFormState,
  formData: FormData,
): Promise<TeamProfileFormState> {
  if (!isRosterConfigured()) {
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
  if (!access.isAllowedUploader && !isStudentEmail(user.email)) {
    return {
      status: 'error',
      message: 'This account is not allowed to edit member profiles. Sign in with an approved school email.',
    };
  }
  const { data: existing, error: lookupError } = await supabase
    .from(teamTables.profiles)
    .select('id, photo_path, updated_at')
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

  const profiles = supabase.from(teamTables.profiles);
  const save = existing ? profiles.update(payload).eq('id', existing.id) : profiles.insert(payload);
  if (existing) save.eq('updated_at', existing.updated_at);
  const { data: saved, error } = await save.select('is_approved').single();

  if (error) {
    if (oldPhoto !== uploaded.photoPath) await deleteTeamProfilePhoto(supabase, uploaded.photoPath);
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

  return {
    status: 'success',
    message: saved.is_approved ? 'Your team profile has been updated.' : 'Your team profile is awaiting admin approval.',
  };
}
