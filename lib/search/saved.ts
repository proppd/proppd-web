// Account-synced saved searches for buyers/renters.

export type SavedSearchPath = '/properties' | '/properties/for-sale' | '/properties/to-rent';

export type SavedSearch = {
  id: string;
  label: string;
  path: SavedSearchPath;
  queryString: string;
  createdAt: string;
};

export type SavedSearchRow = {
  id: string;
  label: string | null;
  path: string | null;
  query_string: string | null;
  created_at: string;
};

const PATHS: SavedSearchPath[] = ['/properties', '/properties/for-sale', '/properties/to-rent'];

function coercePath(value: unknown): SavedSearchPath {
  return PATHS.includes(value as SavedSearchPath) ? (value as SavedSearchPath) : '/properties';
}

export function savedSearchHref(search: Pick<SavedSearch, 'path' | 'queryString'>): string {
  return search.queryString ? `${search.path}?${search.queryString}` : search.path;
}

export function savedSearchFromRow(row: SavedSearchRow): SavedSearch {
  return {
    id: row.id,
    label: row.label ?? '',
    path: coercePath(row.path),
    queryString: row.query_string ?? '',
    createdAt: row.created_at,
  };
}

// Validates an incoming (untrusted) save payload into row-ready columns.
export function savedSearchRowFromPayload(value: unknown): { label: string; path: SavedSearchPath; query_string: string } | null {
  if (!value || typeof value !== 'object') return null;
  const raw = value as Record<string, unknown>;
  const label = typeof raw.label === 'string' ? raw.label.trim().slice(0, 200) : '';
  const queryString = typeof raw.queryString === 'string' ? raw.queryString.replace(/^\?/, '').slice(0, 1000) : '';
  if (!label) return null;
  return { label, path: coercePath(raw.path), query_string: queryString };
}
