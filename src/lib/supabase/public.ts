import 'server-only';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseAnonKey, getSupabaseUrl, isSupabaseConfigured } from './env';

let supabasePublicClient: SupabaseClient | null = null;

export function createSupabasePublicClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!supabasePublicClient) {
    supabasePublicClient = createClient(getSupabaseUrl(), getSupabaseAnonKey(), {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return supabasePublicClient;
}
