'use server';

import { redirect } from 'next/navigation';
import { createPortalSupabaseServerClient } from '@/lib/supabase/server';
import { validatePassword } from '@/lib/auth/validation';

export type ResetPasswordState = { error?: string };

// Server-side password update: reads the recovery session from cookies (set by
// /auth/callback) and updates the password. Runs server-side so it does not
// depend on client hydration or the browser client reading the session.
export async function updatePasswordAction(_prev: ResetPasswordState, formData: FormData): Promise<ResetPasswordState> {
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
    return { error: error.message || 'Could not update your password.' };
  }

  redirect('/dashboard');
}
