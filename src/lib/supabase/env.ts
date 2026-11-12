import { teamSite } from '@/lib/teamSite';
const connections = {
  'five-rings': {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    galleryBucket: process.env.NEXT_PUBLIC_SUPABASE_GALLERY_BUCKET || 'gallery-uploads',
    profileBucket: process.env.NEXT_PUBLIC_SUPABASE_TEAM_PROFILE_BUCKET || 'team-profile-photos',
  },
  'cool-runnings': {
    url: process.env.NEXT_PUBLIC_COOL_RUNNINGS_SUPABASE_URL,
    key: process.env.NEXT_PUBLIC_COOL_RUNNINGS_SUPABASE_ANON_KEY,
    galleryBucket: 'cool-runnings-gallery',
    profileBucket: 'cool-runnings-profile-photos',
  },
  'byte-me': {
    url: process.env.NEXT_PUBLIC_BYTE_ME_SUPABASE_URL,
    key: process.env.NEXT_PUBLIC_BYTE_ME_SUPABASE_ANON_KEY,
    galleryBucket: 'byte-me-gallery',
    profileBucket: 'byte-me-profile-photos',
  },
};

const { url: publicUrl, key: publicAnonKey, galleryBucket, profileBucket } = connections[teamSite.slug];

export const supabaseCacheScope = teamSite.slug + ':' + (publicUrl ?? 'unconfigured');

export function isSupabaseConfigured() {
  return Boolean(publicUrl && publicAnonKey);
}

export function getSupabaseUrl() {
  if (!publicUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
  }

  return publicUrl;
}

export function getSupabaseAnonKey() {
  if (!publicAnonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  return publicAnonKey;
}

export function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
}

export function getSupabaseGalleryBucket() {
  return galleryBucket;
}

export function getSupabaseTeamProfileBucket() {
  return profileBucket;
}
