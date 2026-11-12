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
          <h1 className="heading-display mt-4 text-4xl font-black text-white">Sign in to Five Rings</h1>
          <p className="mt-4 max-w-2xl text-lg text-[var(--color-muted)]">
            Use your approved ISL Google account to sign in.
          </p>
        </div>

        <p className="text-sm text-[var(--color-muted)]">
          School accounts: {getAllowedDomains().map((domain) => '@' + domain).join(' or ')}
        </p>

        {error ? (
          <div className="rounded-[1.4rem] border border-red-500/30 bg-red-950/20 p-4 text-sm text-red-200">
            {error === 'not_school_email'
              ? 'That account is not a school email address.'
              : error === 'not_allowed'
                ? 'This school account is not approved for this team. Ask your team adviser for access.'
                : 'Sign-in could not be completed. Please try again with your school account.'}
          </div>
        ) : null}

        {!configured ? (
          <div className="rounded-[1.4rem] border border-yellow-500/30 bg-yellow-950/20 p-5 text-sm text-yellow-100">
            Member sign-in is not available yet. Contact your team adviser for roster changes.
          </div>
        ) : null}

        {configured ? <LoginForm redirectTo={redirectTo} /> : null}
      </Card>
    </section>
  );
}
