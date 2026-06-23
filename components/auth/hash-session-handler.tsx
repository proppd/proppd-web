'use client';

import { useEffect } from 'react';
import { getBrowserSupabaseClient } from '@/lib/supabase/client';
import { safeAuthRedirectPath } from '@/lib/auth/redirects';

// Completes sign-in when a magic link returns the session as URL hash tokens
// (the implicit flow), which the server callback at /auth/callback cannot read.
// Supabase redirects those to /login#access_token=...; here we persist the
// session into cookies and forward to the intended destination. The PKCE flow
// (?code=) is handled server-side and never reaches this component.
export function HashSessionHandler() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const hash = window.location.hash;
    if (!hash.includes('access_token')) return;

    const params = new URLSearchParams(hash.replace(/^#/, ''));
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    if (!accessToken || !refreshToken) return;

    const supabase = getBrowserSupabaseClient();
    if (!supabase) return;

    supabase.auth
      .setSession({ access_token: accessToken, refresh_token: refreshToken })
      .then(({ error }) => {
        if (error) return;
        const next = safeAuthRedirectPath(
          new URL(window.location.href).searchParams.get('next'),
          '/dashboard',
        );
        // Hard navigation so the server re-evaluates the now-authenticated session.
        window.location.replace(next);
      });
  }, []);

  return null;
}
