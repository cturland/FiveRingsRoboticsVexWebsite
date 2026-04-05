import 'server-only';

import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function getAdminAccess(email: string | null | undefined) {
  const normalizedEmail = (email ?? '').trim().toLowerCase();

  if (!normalizedEmail) {
    return {
      isAdmin: false,
      normalizedEmail,
    };
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('gallery_admins')
    .select('email')
    .eq('email', normalizedEmail)
    .maybeSingle();

  if (error) {
    console.error('Failed to check gallery admin access:', error);
    return {
      isAdmin: false,
      normalizedEmail,
    };
  }

  return {
    isAdmin: Boolean(data?.email),
    normalizedEmail,
  };
}
