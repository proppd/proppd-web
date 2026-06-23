'use server';

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { createPortalSupabaseServerClient } from '@/lib/supabase/server';
import { validatePassword } from '@/lib/auth/validation';
import { logServerError } from '@/lib/security/logging';
import { rateLimitHeaders, rateLimitPolicies } from '@/lib/security/rate-limit';

export type ResetPasswordState = { error?: string };

// Server-side password update: reads the recovery session from cookies (set by
// /auth/callback) and updates the password. Runs server-side so it does not
// depend on client hydration or the browser client reading the session.
export async function updatePasswordAction(_prev: ResetPasswordState, formData: FormData): Promise<ResetPasswordState> {
  const limited = rateLimitHeaders(await headers(), rateLimitPolicies.auth, 'reset-password');
  if (limited) return { error: 'Too many requests. Please wait a moment and try again.' };

  const password = String(formData.get('password') ?? '');
  const confirm = String(formData.get('confirm') ?? '');

  const passwordErrors = validatePassword(password);
  if (passwordErrors.length > 0) return { error: passwordErrors[0] };
  if (password !== confirm) return { error: 'Passwords do not match.' };

  const supabase = await createPortalSupabaseServerClient();
  if (!supabase) return { error: 'Password reset is not available on this deployment.' };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Your reset link has expired or was opened in a different browser. Request a new one from the sign-in screen.' };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    logServerError('[auth] password update failed', error);
    return { error: 'Could not update your password. Please request a fresh reset link and try again.' };
  }

  redirect('/dashboard');
}
