import { createHash } from 'node:crypto';

// Window during which repeat views from the same visitor on the same listing
// are not counted again, so a refresh or quick re-open isn't double-counted.
export const VIEW_DEDUPE_WINDOW_MS = 30 * 60 * 1000;

export function buildVisitorHash(ip: string | null | undefined, userAgent: string | null | undefined): string {
  const basis = `${(ip ?? '').trim()}|${(userAgent ?? '').trim()}`;
  return createHash('sha256').update(basis).digest('hex').slice(0, 32);
}

export function isWithinDedupeWindow(lastViewedAt: string | Date | null | undefined, now: Date = new Date()): boolean {
  if (!lastViewedAt) return false;
  const last = lastViewedAt instanceof Date ? lastViewedAt : new Date(lastViewedAt);
  if (Number.isNaN(last.getTime())) return false;
  return now.getTime() - last.getTime() < VIEW_DEDUPE_WINDOW_MS;
}

export function normaliseViewSource(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim().slice(0, 80);
  return trimmed || null;
}
