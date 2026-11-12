import 'server-only';

import { teamSite } from '@/lib/teamSite';
import { isSupabaseConfigured } from './env';

const rosterEnabled = {
  'five-rings': true,
  'cool-runnings': process.env.COOL_RUNNINGS_ROSTER_ENABLED === 'true',
  'byte-me': process.env.BYTE_ME_ROSTER_ENABLED === 'true',
};

export function isRosterConfigured() {
  return isSupabaseConfigured() && rosterEnabled[teamSite.slug] && (
    teamSite.slug === 'five-rings' || Boolean(process.env.SUPABASE_SECRET_KEY)
  );
}
