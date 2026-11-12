import 'server-only';

import { teamSite } from '@/lib/teamSite';
import { isSupabaseConfigured } from './env';

export function isRosterConfigured() {
  return isSupabaseConfigured() && (
    teamSite.slug === 'five-rings' ||
    (process.env.COOL_RUNNINGS_ROSTER_ENABLED === 'true' && Boolean(process.env.SUPABASE_SECRET_KEY))
  );
}
