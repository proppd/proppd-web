import type { OwnerProperty } from './properties';

// Client wrappers for the account-synced owner workspace. Each call returns the
// authoritative list from the server (already mapped to OwnerProperty).

async function readList(response: Response): Promise<OwnerProperty[]> {
  const data = (await response.json()) as { ok: boolean; properties?: OwnerProperty[]; error?: string };
  if (!response.ok || !data.ok || !data.properties) {
    throw new Error(data.error ?? 'Could not sync your properties.');
  }
  return data.properties;
}

export async function cloudListProperties(): Promise<OwnerProperty[]> {
  return readList(await fetch('/api/owner/properties', { cache: 'no-store' }));
}

export async function cloudCreateProperty(property: OwnerProperty): Promise<OwnerProperty[]> {
  return readList(
    await fetch('/api/owner/properties', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ property }),
    }),
  );
}

export async function cloudImportProperties(properties: OwnerProperty[]): Promise<OwnerProperty[]> {
  return readList(
    await fetch('/api/owner/properties', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ properties }),
    }),
  );
}

export async function cloudUpdateProperty(id: string, changes: Partial<OwnerProperty>): Promise<OwnerProperty[]> {
  return readList(
    await fetch('/api/owner/properties', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, changes }),
    }),
  );
}

export async function cloudRemoveProperty(id: string): Promise<OwnerProperty[]> {
  return readList(await fetch(`/api/owner/properties?id=${encodeURIComponent(id)}`, { method: 'DELETE' }));
}
