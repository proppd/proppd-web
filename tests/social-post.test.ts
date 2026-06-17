import { describe, expect, it } from 'vitest';
import { generateListingSocialPost } from '@/lib/ai/social-post';

describe('generateListingSocialPost guards', () => {
  it('reports not-configured when no API key is present (no network call)', async () => {
    const result = await generateListingSocialPost({ title: 'Modern 3-bed' }, {});
    expect(result).toEqual({ ok: false, error: 'AI social posts are not configured on this deployment.' });
  });

  it('requires enough facts before calling the model', async () => {
    const result = await generateListingSocialPost({ suburb: 'Sandton' }, { ANTHROPIC_API_KEY: 'sk-ant-test' });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/property type or title/i);
    }
  });
});
