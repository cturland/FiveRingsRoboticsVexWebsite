import { teamSite } from '@/lib/teamSite';
import { redirect } from 'next/navigation';
import Card from '@/components/Card';
import { getAllowedDomains } from '@/lib/uploadAccess';
import { getSafeLoginRedirect } from '@/lib/loginRedirect';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import LoginForm from './LoginForm';

type LoginPageProps = {
  searchParams: Promise<{
    next?: string;
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const configured = isSupabaseConfigured();
  const { next, error } = await searchParams;
  const redirectTo = getSafeLoginRedirect(next);

  if (configured) {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user?.email && !error) {
      redirect(redirectTo);
    }
  }

  return (
    <section className="mx-auto max-w-3xl py-8">
      <Card className="space-y-6">
        <div>
          <p className="eyebrow">Team Members</p>
          <h1 className="heading-display mt-4 text-4xl font-black text-white">Sign in to {teamSite.shortName}</h1>
          <p className="mt-4 max-w-2xl text-lg text-[var(--color-muted)]">
            Use your approved school email to request a magic link and manage your team profile.
          </p>
        </div>

        <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-5">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-brand-300">Current Rules</p>
          <p className="mt-3 text-sm text-[var(--color-muted)]">
            Allowed domain: {getAllowedDomains().map((domain) => `@${domain}`).join(', ') || 'none configured'}
          </p>
        </div>

        {error ? (
          <div className="rounded-[1.4rem] border border-red-500/30 bg-red-950/20 p-4 text-sm text-red-200">
            {error === 'not_school_email'
              ? 'That account is not a school email address.'
              : error === 'not_allowed'
                ? 'That school email is not on the approved member list yet.'
                : 'Sign-in could not be completed.'}
          </div>
        ) : null}

        {!configured ? (
          <div className="rounded-[1.4rem] border border-yellow-500/30 bg-yellow-950/20 p-5 text-sm text-yellow-100">
            Member sign-in is not available yet. Contact your team adviser for roster changes.
          </div>
        ) : null}

        <LoginForm redirectTo={redirectTo} allowedDomains={getAllowedDomains()} configured={configured} />
      </Card>
    </section>
  );
}
