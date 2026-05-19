export type SupabaseBrowserConfig = {
  url: string;
  publishableKey: string;
};

type SupabaseEnv = Record<string, string | undefined>;

export function getSupabaseBrowserConfig(env: SupabaseEnv = process.env): SupabaseBrowserConfig | null {
  const url = normaliseEnvValue(env.NEXT_PUBLIC_SUPABASE_URL);
  const publishableKey = normaliseEnvValue(env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  if (!url || !publishableKey) {
    return null;
  }

  return { url, publishableKey };
}

export function isSupabaseBrowserConfigured(env: SupabaseEnv = process.env): boolean {
  return getSupabaseBrowserConfig(env) !== null;
}

function normaliseEnvValue(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : undefined;
}
