import 'server-only';

import { supabaseCacheScope } from '@/lib/supabase/env';

import { unstable_cache } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabasePublicClient } from '@/lib/supabase/public';
import { TEAM_PROFILE_ROLE_OPTIONS, type TeamProfileRole } from './teamProfileConstants';

export type TeamProfileRecord = {
  id: number;
  email: string;
  name: string;
  photoPath: string | null;
  photoUrl: string | null;
  roles: TeamProfileRole[];
  bio: string;
  isCurrentMember: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PublicTeamProfile = Pick<TeamProfileRecord, 'id' | 'name' | 'photoUrl' | 'roles' | 'bio' | 'isCurrentMember'>;

export const PUBLIC_TEAM_PROFILES_CACHE_TAG = 'public-team-profiles';

export async function getTeamProfileByEmail(email: string | null | undefined): Promise<TeamProfileRecord | null> {
  const normalizedEmail = (email ?? '').trim().toLowerCase();

  if (!normalizedEmail) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('team_profiles')
    .select('id, email, name, photo_path, roles, bio, is_current_member, created_at, updated_at')
    .eq('email', normalizedEmail)
    .maybeSingle();

  if (error) {
    console.error('Failed to load team profile:', error);
    return null;
  }

  if (!data) {
    return null;
  }

  return {
    id: data.id,
    email: data.email,
    name: data.name,
    photoPath: data.photo_path,
    photoUrl: data.photo_path ? '/api/media/profile/' + data.id : null,
    roles: normalizeRoles(data.roles),
    bio: data.bio,
    isCurrentMember: data.is_current_member,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

async function loadPublicTeamProfiles(): Promise<PublicTeamProfile[]> {
  const supabase = createSupabasePublicClient();
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from('published_team_profiles')
    .select('id, name, has_photo, roles, bio, is_current_member')
    .order('id');

  if (error) {
    console.error('Failed to load public team profiles:', error);
    return [];
  }

  return (data ?? []).map((item) => ({
    id: item.id,
    name: item.name,
    photoUrl: item.has_photo ? '/api/media/profile/' + item.id : null,
    roles: normalizeRoles(item.roles),
    bio: item.bio,
    isCurrentMember: item.is_current_member,
  }));
}

export const getPublicTeamProfiles = unstable_cache(loadPublicTeamProfiles, ['published-team-profiles', supabaseCacheScope], {
  revalidate: 3600,
  tags: [PUBLIC_TEAM_PROFILES_CACHE_TAG],
});

export async function getAllTeamProfilesForAdmin(): Promise<TeamProfileRecord[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('team_profiles')
    .select('id, email, name, photo_path, roles, bio, is_current_member, created_at, updated_at')
    .order('is_current_member', { ascending: false })
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Failed to load admin team profiles:', error);
    return [];
  }

  return (data ?? []).map((item) => ({
    id: item.id,
    email: item.email,
    name: item.name,
    photoPath: item.photo_path,
    photoUrl: item.photo_path ? '/api/media/profile/' + item.id : null,
    roles: normalizeRoles(item.roles),
    bio: item.bio,
    isCurrentMember: item.is_current_member,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  }));
}

export function normalizeRoles(value: unknown): TeamProfileRole[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((role): role is TeamProfileRole =>
    typeof role === 'string' && TEAM_PROFILE_ROLE_OPTIONS.includes(role as TeamProfileRole),
  );
}
