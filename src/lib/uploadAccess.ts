import 'server-only';

import { teamTables } from '@/lib/supabase/teamTables';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getEmailDomain } from './emailDomain';

export function getAllowedDomains() {
  return ['isl.ch', 'islstudent.ch'];
}

export async function getUploadAccess(supabase: SupabaseClient, email: string | null | undefined) {
  const domain = getEmailDomain((email ?? '').trim().toLowerCase());
  if (!getAllowedDomains().includes(domain)) {
    return { isSchoolEmail: false, isAllowedUploader: false };
  }

  const { data, error } = await supabase.rpc(teamTables.accessCheck);
  if (error) console.error('Failed to check team site access:', error);
  return { isSchoolEmail: true, isAllowedUploader: data === true };
}
