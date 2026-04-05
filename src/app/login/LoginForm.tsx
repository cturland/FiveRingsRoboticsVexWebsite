'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

type LoginFormProps = {
  redirectTo: string;
  allowedDomains: string[];
  configured: boolean;
};

const RESEND_COOLDOWN_SECONDS = 60;

export default function LoginForm({ redirectTo, allowedDomains, configured }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const supabase = useMemo(() => (configured ? createSupabaseBrowserClient() : null), [configured]);

  useEffect(() => {
    if (cooldownSeconds <= 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      setCooldownSeconds((current) => Math.max(current - 1, 0));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [cooldownSeconds]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (status === 'submitting' || cooldownSeconds > 0) {
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const domain = normalizedEmail.includes('@') ? normalizedEmail.split('@').at(-1) ?? '' : '';

    if (!normalizedEmail) {
      setStatus('error');
      setMessage('Enter your school email to continue.');
      return;
    }

    if (!allowedDomains.includes(domain)) {
      setStatus('error');
      setMessage(`Only ${allowedDomains.map((item) => `@${item}`).join(', ')} addresses can sign in.`);
      return;
    }

    if (!supabase) {
      setStatus('error');
      setMessage('Supabase is not configured yet. Add the environment variables first.');
      return;
    }

    setStatus('submitting');
    setMessage('');

    const callbackUrl = new URL('/auth/callback', window.location.origin);
    callbackUrl.searchParams.set('next', redirectTo);

    const { error } = await supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        emailRedirectTo: callbackUrl.toString(),
      },
    });

    if (error) {
      setStatus('error');
      setMessage(error.message);
      return;
    }

    setStatus('success');
    setCooldownSeconds(RESEND_COOLDOWN_SECONDS);
    setMessage(`Check your email. You can request another link in ${RESEND_COOLDOWN_SECONDS} seconds.`);
  }

  useEffect(() => {
    if (status !== 'success' || cooldownSeconds <= 0) {
      return;
    }

    setMessage(`Check your email. You can request another link in ${cooldownSeconds} seconds.`);
  }, [cooldownSeconds, status]);

  const isDisabled = status === 'submitting' || cooldownSeconds > 0 || !configured;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
          School Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="name@isl.ch"
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white outline-none transition focus:border-[var(--color-primary-accent)]"
          autoComplete="email"
          inputMode="email"
          required
        />
      </div>

      <button type="submit" className="btn btn-primary w-full sm:w-auto disabled:cursor-not-allowed disabled:opacity-70" disabled={isDisabled}>
        {status === 'submitting'
          ? 'Sending Link...'
          : cooldownSeconds > 0
            ? `Try Again In ${cooldownSeconds}s`
            : 'Send Magic Link'}
      </button>

      {message ? (
        <p className={`text-sm ${status === 'error' ? 'text-red-300' : 'text-[var(--color-muted)]'}`}>
          {message}
        </p>
      ) : null}
    </form>
  );
}
