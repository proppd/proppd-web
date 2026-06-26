import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getSupabaseBrowserConfig } from './env';

const DEV_ADMIN_COOKIE = 'proppd-dev-admin';
const DEV_ADMIN_EMAIL = 'info@proppd.com';

type PortalUser = {
  id: string;
  email: string | null;
};

export async function createPortalSupabaseServerClient() {
  const config = getSupabaseBrowserConfig();
  if (!config) return null;

  const cookieStore = await cookies();

  return createServerClient(config.url, config.publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server components can read cookies but not always write them.
        }
      },
    },
  });
}

export async function getPortalServerUser(): Promise<PortalUser | null> {
  const config = getSupabaseBrowserConfig();
  const cookieStore = await cookies();

  if (!config) {
    // The dev-admin cookie is a localhost-only convenience for when Supabase is
    // not configured. Never honour it in production, even if env is misconfigured
    // — otherwise a missing config would silently grant admin to anyone who sets
    // the (unsigned) cookie.
    if (process.env.NODE_ENV === 'production') return null;
    const email = cookieStore.get(DEV_ADMIN_COOKIE)?.value?.trim().toLowerCase();
    if (email === DEV_ADMIN_EMAIL) {
      return { id: 'dev-admin', email };
    }
    return null;
  }

  const supabase = await createPortalSupabaseServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;

  return { id: data.user.id, email: data.user.email ?? null };
}

export function isDevAdminEmail(email: string | null | undefined) {
  return email?.trim().toLowerCase() === DEV_ADMIN_EMAIL;
}
