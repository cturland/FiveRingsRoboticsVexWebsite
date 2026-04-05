import { redirect } from 'next/navigation';
import Card from '@/components/Card';
import { getAllowedDomains, getAllowedEmails } from '@/lib/uploadAccess';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import LoginForm from './LoginForm';

type LoginPageProps = {
  searchParams?: {
    next?: string;
    error?: string;
  };
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const configured = isSupabaseConfigured();
  const redirectTo = searchParams?.next?.startsWith('/') ? searchParams.next : '/upload';
  const error = searchParams?.error;

  if (configured) {
    const supabase = createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user?.email) {
      redirect(redirectTo);
    }
  }

  return (
    <section className="mx-auto max-w-3xl py-8">
      <Card className="space-y-6">
        <div>
          <p className="eyebrow">Student Upload Access</p>
          <h1 className="heading-display mt-4 text-4xl font-black text-white">Sign In To Upload</h1>
          <p className="mt-4 max-w-2xl text-lg text-[var(--color-muted)]">
            Use your school email to request a magic link. Only approved student accounts listed in the upload access file can continue to the mobile upload area.
          </p>
        </div>

        <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-5">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-red-300">Current Rules</p>
          <p className="mt-3 text-sm text-[var(--color-muted)]">
            Allowed domain: {getAllowedDomains().map((domain) => `@${domain}`).join(', ') || 'none configured'}
          </p>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            Approved uploaders: {getAllowedEmails().join(', ') || 'none configured'}
          </p>
        </div>

        {error ? (
          <div className="rounded-[1.4rem] border border-red-500/30 bg-red-950/20 p-4 text-sm text-red-200">
            {error === 'not_school_email'
              ? 'That account is not a school email address.'
              : error === 'not_allowed'
                ? 'That school email is not on the approved uploader list yet.'
                : 'Sign-in could not be completed.'}
          </div>
        ) : null}

        {!configured ? (
          <div className="rounded-[1.4rem] border border-yellow-500/30 bg-yellow-950/20 p-5 text-sm text-yellow-100">
            Supabase is not configured yet. Add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `NEXT_PUBLIC_SITE_URL` before testing magic-link sign-in.
          </div>
        ) : null}

        <LoginForm redirectTo={redirectTo} allowedDomains={getAllowedDomains()} configured={configured} />
      </Card>
    </section>
  );
}
