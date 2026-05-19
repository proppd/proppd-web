import { describe, expect, it } from 'vitest';
import { getSupabaseBrowserConfig, isSupabaseBrowserConfigured } from '@/lib/supabase/env';

describe('Supabase browser env config', () => {
  it('uses the Supabase publishable key preferred by new Supabase projects', () => {
    const config = getSupabaseBrowserConfig({
      NEXT_PUBLIC_SUPABASE_URL: 'https://rjbunitqbroxxboxhfij.supabase.co',
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_test',
    });

    expect(config).toEqual({
      url: 'https://rjbunitqbroxxboxhfij.supabase.co',
      publishableKey: 'sb_publishable_test',
    });
  });

  it('falls back to the older anon key env name for compatibility', () => {
    const config = getSupabaseBrowserConfig({
      NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon_test',
    });

    expect(config?.publishableKey).toBe('anon_test');
  });

  it('reports missing config safely', () => {
    expect(getSupabaseBrowserConfig({ NEXT_PUBLIC_SUPABASE_URL: ' ' })).toBeNull();
    expect(isSupabaseBrowserConfigured({ NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co' })).toBe(false);
  });
});
