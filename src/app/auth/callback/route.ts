import { NextRequest, NextResponse } from 'next/server';
import { getSafeLoginRedirect } from '@/lib/loginRedirect';
import { getUploadAccess } from '@/lib/uploadAccess';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/env';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next');
  const safeNext = getSafeLoginRedirect(next);

  if (!isSupabaseConfigured()) {
    return NextResponse.redirect(new URL('/login?error=not_configured', request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=missing_code', request.url));
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(new URL('/login?error=exchange_failed', request.url));
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const access = await getUploadAccess(supabase, user?.email);
  if (!access.isSchoolEmail) {
    await supabase.auth.signOut();
    return NextResponse.redirect(new URL('/login?error=not_school_email', request.url));
  }

  if (!access.isAllowedUploader) {
    await supabase.auth.signOut();
    return NextResponse.redirect(new URL('/login?error=not_allowed', request.url));
  }

  return NextResponse.redirect(new URL(safeNext, request.url));
}
