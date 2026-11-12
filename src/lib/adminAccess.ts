import 'server-only';

import { teamTables } from '@/lib/supabase/teamTables';
import { teamSite } from '@/lib/teamSite';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function getAdminAccess(email: string | null | undefined) {
  const normalizedEmail = (email ?? '').trim().toLowerCase();

  if (!normalizedEmail) {
    return {
      isAdmin: false,
      canModerateGallery: false,
      normalizedEmail,
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from(teamTables.admins)
    .select(teamSite.slug === 'cool-runnings' ? 'email, can_moderate_gallery' : 'email')
    .eq('email', normalizedEmail)
    .maybeSingle<{ email: string; can_moderate_gallery?: boolean }>();

  if (error) {
    console.error('Failed to check gallery admin access:', error);
    return {
      isAdmin: false,
      canModerateGallery: false,
      normalizedEmail,
    };
  }

  return {
    isAdmin: Boolean(data?.email),
    canModerateGallery: Boolean(data?.email && (teamSite.slug === 'five-rings' || data.can_moderate_gallery)),
    normalizedEmail,
  };
}
