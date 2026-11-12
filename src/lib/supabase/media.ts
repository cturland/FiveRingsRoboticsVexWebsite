import 'server-only';

import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl, isSupabaseConfigured } from './env';

export function createSupabaseMediaClient() {
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!key || !isSupabaseConfigured()) return null;

  return createClient(getSupabaseUrl(), key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
