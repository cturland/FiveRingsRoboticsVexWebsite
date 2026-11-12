import { teamTables } from '@/lib/supabase/teamTables';
import { galleryEnabled } from '@/lib/galleryFeature';
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

  if (kind !== 'gallery' && kind !== 'profile' && kind !== 'submission') {
    return new Response(null, { status: 404, headers });
  }

  if (kind !== 'profile' && !galleryEnabled) {
    return new Response(null, { status: 404, headers });
  }

  // Private previews use the caller's session and row-level permissions.
  const supabase = kind === 'submission'
    ? await createSupabaseServerClient()
    : createSupabaseMediaClient();
  if (!supabase) return new Response(null, { status: 503, headers });

  const profile = kind === 'profile';
  const lookup = supabase
    .from(profile ? teamTables.profiles : teamTables.submissions)
    .select(profile ? 'photo_path' : 'image_path')
    .eq('id', recordId);

  // Check current approval on every public request, including after moderation changes.
  if (kind === 'gallery') lookup.eq('status', 'approved');

  const { data, error } = await lookup.maybeSingle<{ photo_path?: string; image_path?: string }>();
  if (error) {
    console.error('Photo lookup failed:', error.code);
    return new Response(null, { status: kind === 'submission' ? 404 : 502, headers });
  }

  const path = profile ? data?.photo_path : data?.image_path;
  if (!path) return new Response(null, { status: 404, headers });

  const bucket = profile ? getSupabaseTeamProfileBucket() : getSupabaseGalleryBucket();
  const { data: image, error: downloadError } = await supabase.storage.from(bucket).download(path);
  if (downloadError || !image || !imageTypes.has(image.type)) {
    return new Response(null, { status: 404, headers });
  }

  return new Response(image.stream(), {
    headers: { ...headers, 'Content-Type': image.type },
  });
}
