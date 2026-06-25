// Client wrappers for the account-synced saved homes shortlist. Each call
// returns the authoritative slug list from the server, or null when the user is
// not signed in / accounts are unavailable (so callers can stay local-only).

type SavedHomesResponse = { ok: boolean; slugs?: string[]; error?: string };

async function readSlugs(response: Response): Promise<string[] | null> {
  // 401 (unauthed) and 503 (accounts disabled) mean "no cloud" — degrade to local.
  if (response.status === 401 || response.status === 503) return null;
  const data = (await response.json().catch(() => null)) as SavedHomesResponse | null;
  if (!response.ok || !data?.ok || !data.slugs) {
    throw new Error(data?.error ?? 'Could not sync your saved homes.');
  }
  return data.slugs;
}

export async function cloudListHomes(): Promise<string[] | null> {
  return readSlugs(await fetch('/api/saved-homes', { cache: 'no-store' }));
}

export async function cloudSaveHome(slug: string): Promise<string[] | null> {
  return readSlugs(
    await fetch('/api/saved-homes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug }),
    }),
  );
}

export async function cloudRemoveHome(slug: string): Promise<string[] | null> {
  return readSlugs(await fetch(`/api/saved-homes?slug=${encodeURIComponent(slug)}`, { method: 'DELETE' }));
}
