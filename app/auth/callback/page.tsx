'use client';

import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

export default function AuthCallbackPage() {
  const [status, setStatus] = useState('Completing sign-in…');

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!url || !key) {
      window.location.replace('/login?message=Login+is+not+configured.');
      return;
    }

    const supabase = createClient(url, key);
    const sp = new URLSearchParams(window.location.search);
    const code = sp.get('code');
    const next = sp.get('next') || '/dashboard';

    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (error) {
          window.location.replace(`/login?message=${encodeURIComponent(error.message)}`);
        } else {
          window.location.replace(next);
        }
      });
      return;
    }

    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');

      if (accessToken && refreshToken) {
        supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken }).then(({ error }) => {
          if (error) {
            window.location.replace(`/login?message=${encodeURIComponent(error.message)}`);
          } else {
            window.location.replace(next);
          }
        });
        return;
      }
    }

    window.location.replace('/login?message=Missing+login+code.');
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F7F8FA]">
      <p className="text-sm font-bold text-[#6B7280]">{status}</p>
    </main>
  );
}
