import type { SavedSearch, SavedSearchPath } from './saved';

// Client wrappers for the account-synced saved searches. Each call returns the
// authoritative list from the server.

async function readList(response: Response): Promise<SavedSearch[]> {
  const data = (await response.json()) as { ok: boolean; searches?: SavedSearch[]; error?: string };
  if (!response.ok || !data.ok || !data.searches) {
    throw new Error(data.error ?? 'Could not load your saved searches.');
  }
  return data.searches;
}

export async function cloudListSearches(): Promise<SavedSearch[]> {
  return readList(await fetch('/api/saved-searches', { cache: 'no-store' }));
}

export async function cloudSaveSearch(input: { label: string; path: SavedSearchPath; queryString: string }): Promise<SavedSearch[]> {
  return readList(
    await fetch('/api/saved-searches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    }),
  );
}

export async function cloudRemoveSearch(id: string): Promise<SavedSearch[]> {
  return readList(await fetch(`/api/saved-searches?id=${encodeURIComponent(id)}`, { method: 'DELETE' }));
}
