'use client';

import Image from 'next/image';
import { useState } from 'react';
import { loginCallbackPath, loginDestinationCookie } from '@/lib/loginRedirect';

type LoginFormProps = {
  redirectTo: string;
};

export default function LoginForm({ redirectTo }: LoginFormProps) {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState('');

  async function signIn() {
    if (pending) return;
    setPending(true);
    setMessage('');

    const callbackUrl = new URL(loginCallbackPath, window.location.origin);
    const secure = callbackUrl.protocol === 'https:' ? '; Secure' : '';
    // Supabase's allowed redirect URL is the callback path without a query string.
    document.cookie = loginDestinationCookie + '=' + encodeURIComponent(redirectTo) +
      '; Path=' + loginCallbackPath + '; Max-Age=3600; SameSite=Lax' + secure;

    try {
      const { createSupabaseBrowserClient } = await import('@/lib/supabase/client');
      const { error } = await createSupabaseBrowserClient().auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: callbackUrl.toString(),
          queryParams: { prompt: 'select_account' },
        },
      });

      if (!error) return;
    } catch {
      // A network error is safe to retry.
    }

    setPending(false);
    setMessage('Google sign-in could not start. Please try again.');
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        aria-label="Sign in with Google"
        aria-busy={pending}
        disabled={pending}
        onClick={signIn}
        className="inline-flex rounded-md outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white disabled:opacity-60"
      >
        <Image src="/images/google-sign-in.png" alt="" width={177} height={40} unoptimized />
      </button>
      {message ? <p className="text-sm text-red-300" role="alert">{message}</p> : null}
    </div>
  );
}
