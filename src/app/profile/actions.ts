'use server';

import { revalidatePath } from 'next/cache';
import { getAdminAccess } from '@/lib/adminAccess';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { buildTeamProfilePayload, parseTeamProfileFormData, uploadTeamProfilePhoto } from '@/lib/teamProfileMutations';
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

  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return {
      status: 'error',
      message: 'Your session has expired. Sign in again and then retry saving your profile.',
    };
  }

  const access = getUploadAccess(user.email);
  if (!access.isSchoolEmail || !access.isAllowedUploader) {
    return {
      status: 'error',
      message: 'This account is not allowed to edit member profiles. Sign in with an approved school email.',
    };
  }
  const parsed = parseTeamProfileFormData(formData, user.email);

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

  const { error } = await supabase
    .from('team_profiles')
    .upsert(payload, { onConflict: 'email' });

  if (error) {
    console.error('Failed to save team profile:', error);
    return {
      status: 'error',
      message: `Saving your profile failed: ${error.message}.`,
    };
  }

  revalidatePath('/profile');
  revalidatePath('/upload');
  revalidatePath('/team');

  const adminAccess = await getAdminAccess(user.email);

  return {
    status: 'success',
    message: adminAccess.isAdmin
      ? 'Your team profile has been updated. Admin controls for editing other profiles can be added next.'
      : 'Your team profile has been saved successfully.',
  };
}
