'use client';

import { createBrowserClient } from '@supabase/ssr';
import { useEffect, useState } from 'react';

export default function AuthCallbackPage() {
  const [status, setStatus] = useState('Completing sign-in…');

  useEffect(() => {
    (async () => {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
          window.location.replace('/login?message=Login+is+not+configured.');
          return;
        }

        const supabase = createBrowserClient(supabaseUrl, supabaseKey);

        const searchParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const next = searchParams.get('next') || hashParams.get('next') || '/dashboard';

        // PKCE flow: ?code=...
        const code = searchParams.get('code');
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          window.location.replace(next);
          return;
        }

        // Implicit flow: #access_token=...&refresh_token=...
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error) throw error;
          window.location.replace(next);
          return;
        }

        window.location.replace('/login?message=Missing+login+code.');
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Sign-in failed.';
        setStatus(`Error: ${message}`);
        setTimeout(() => window.location.replace(`/login?message=${encodeURIComponent(message)}`), 2000);
      }
    })();
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F7F8FA]">
      <p className="text-sm font-bold text-[#6B7280]">{status}</p>
    </main>
  );
}
