export const SAVED_HOMES_STORAGE_KEY = 'proppd.saved-homes';
export const SAVED_HOMES_CHANGE_EVENT = 'proppd:saved-homes-change';

export function readSavedHomeSlugs(): string[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(SAVED_HOMES_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0) : [];
  } catch {
    return [];
  }
}

export function writeSavedHomeSlugs(slugs: string[]) {
  if (typeof window === 'undefined') return;

  window.localStorage.setItem(SAVED_HOMES_STORAGE_KEY, JSON.stringify(slugs));
  window.dispatchEvent(new Event(SAVED_HOMES_CHANGE_EVENT));
}

export function subscribeSavedHomes(onChange: () => void) {
  if (typeof window === 'undefined') return () => {};

  const handler = () => onChange();
  window.addEventListener('storage', handler);
  window.addEventListener(SAVED_HOMES_CHANGE_EVENT, handler);

  return () => {
    window.removeEventListener('storage', handler);
    window.removeEventListener(SAVED_HOMES_CHANGE_EVENT, handler);
  };
}
