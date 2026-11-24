import { getSupabaseGalleryBucket, getSupabaseTeamProfileBucket, isSupabaseConfigured } from '@/lib/supabase/env';
import { createSupabaseMediaClient } from '@/lib/supabase/media';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const imageTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']);
const headers = { 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' };

export async function GET(_request: Request, context: RouteContext<'/api/media/[kind]/[id]'>) {
  const { kind, id } = await context.params;
  const recordId = Number(id);
  if (!/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(recordId) || !isSupabaseConfigured()) {
    return new Response(null, { status: 404, headers });
  }

  if (kind !== 'gallery' && kind !== 'profile' && kind !== 'submission' && kind !== 'profile-preview') {
    return new Response(null, { status: 404, headers });
  }

  // Private previews use the caller's session and row-level permissions.
  const privatePreview = kind === 'submission' || kind === 'profile-preview';
  const supabase = privatePreview
    ? await createSupabaseServerClient()
    : createSupabaseMediaClient();
  if (!supabase) return new Response(null, { status: 503, headers });

  const profile = kind === 'profile' || kind === 'profile-preview';
  const table = kind === 'profile' ? 'published_team_profile_photos'
    : profile ? 'team_profiles' : 'gallery_submissions';
  const lookup = supabase
    .from(table)
    .select(profile ? 'photo_path' : 'image_path')
    .eq('id', recordId);

  // Check current approval on every public request, including after moderation changes.
  if (kind === 'gallery') lookup.eq('status', 'approved');

  const { data, error } = await lookup.maybeSingle<{ photo_path?: string; image_path?: string }>();
  if (error) {
    console.error('Photo lookup failed:', error.code);
    return new Response(null, { status: privatePreview ? 404 : 502, headers });
  }

  const path = profile ? data?.photo_path : data?.image_path;
  if (!path) return new Response(null, { status: 404, headers });

  const bucket = profile ? getSupabaseTeamProfileBucket() : getSupabaseGalleryBucket();
  // A profile owner can preview a photo added by an admin. The row lookup above
  // has already checked that the caller owns the profile or is an admin.
  const storage = kind === 'profile-preview' ? createSupabaseMediaClient()?.storage : supabase.storage;
  if (!storage) return new Response(null, { status: 503, headers });
  const { data: image, error: downloadError } = await storage.from(bucket).download(path);
  if (downloadError || !image || !imageTypes.has(image.type)) {
    return new Response(null, { status: 404, headers });
  }

  return new Response(image.stream(), {
    headers: { ...headers, 'Content-Type': image.type },
  });
}
