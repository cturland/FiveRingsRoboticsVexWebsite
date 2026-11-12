'use server';

import { teamTables } from '@/lib/supabase/teamTables';
import { revalidatePath, updateTag } from 'next/cache';
import { getAdminAccess } from '@/lib/adminAccess';
import { PUBLIC_TEAM_PROFILES_CACHE_TAG } from '@/lib/teamProfiles';
import { buildTeamProfilePayload, deleteTeamProfilePhoto, parseTeamProfileFormData, uploadTeamProfilePhoto } from '@/lib/teamProfileMutations';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { isRosterConfigured } from '@/lib/supabase/rosterReady';

async function requireAdminUser() {
  if (!isRosterConfigured()) throw new Error('Member sign-in is not available.');
  const supabase = await createSupabaseServerClient();
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

  if (!targetEmail) {
    throw new Error('Missing team profile metadata.');
  }

  const { supabase, user } = await requireAdminUser();
  const { data: existing, error: lookupError } = await supabase
    .from(teamTables.profiles)
    .select('id, photo_path')
    .eq('email', targetEmail)
    .single();
  if (lookupError) throw new Error('Could not read the current team profile.');

  const oldPhoto = existing.photo_path;
  const parsed = parseTeamProfileFormData(formData, targetEmail, oldPhoto);

  if (!parsed.ok) {
    throw new Error(parsed.message);
  }

  const uploaded = await uploadTeamProfilePhoto(supabase, parsed.values, user.id);

  if (!uploaded.ok) {
    throw new Error(uploaded.message);
  }

  const payload = buildTeamProfilePayload(parsed.values, uploaded.photoPath);

  const save = supabase.from(teamTables.profiles).update(payload).eq('id', existing.id);
  if (oldPhoto) save.eq('photo_path', oldPhoto);
  else save.is('photo_path', null);
  const { error } = await save.select('id').single();

  if (error) {
    throw new Error(error.message);
  }

  if (oldPhoto !== uploaded.photoPath) await deleteTeamProfilePhoto(supabase, oldPhoto);

  revalidatePath('/admin/team');
  revalidatePath('/team');
  updateTag(PUBLIC_TEAM_PROFILES_CACHE_TAG);
}

export async function deleteTeamProfileAsAdmin(formData: FormData) {
  const targetEmail = String(formData.get('email') ?? '').trim().toLowerCase();

  if (!targetEmail) {
    throw new Error('Missing team profile email.');
  }

  const { supabase } = await requireAdminUser();

  const { data, error } = await supabase
    .from(teamTables.profiles)
    .delete()
    .eq('email', targetEmail)
    .select('photo_path')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  await deleteTeamProfilePhoto(supabase, data.photo_path);

  revalidatePath('/admin/team');
  revalidatePath('/team');
  revalidatePath('/profile');
  updateTag(PUBLIC_TEAM_PROFILES_CACHE_TAG);
}
