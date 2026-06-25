// Shared helpers for account-synced saved homes (the buyer/renter shortlist).

export type SavedHomeRow = {
  slug: string | null;
};

// Listing slugs are lowercase alphanumerics, hyphens, and a trailing id, e.g.
// "modern-3-bedroom-house-in-sandton-12345". Validate untrusted input before it
// touches the database.
const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]{1,118}[a-z0-9]$/;

export function normaliseSavedHomeSlug(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const slug = value.trim().toLowerCase();
  return SLUG_PATTERN.test(slug) ? slug : null;
}

export function savedHomeSlugsFromRows(rows: SavedHomeRow[] | null | undefined): string[] {
  return (rows ?? [])
    .map((row) => row.slug)
    .filter((slug): slug is string => typeof slug === 'string' && slug.length > 0);
}
