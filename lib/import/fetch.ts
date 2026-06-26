/**
 * Safe server-side fetch for admin-supplied feed URLs.
 *
 * Feed URLs are operator-supplied and fetched from the server, so this guards
 * against obvious SSRF (only http/https, no localhost/private-range hosts),
 * enforces a timeout, and caps the response size.
 */

export type FetchFeedResult =
  | { ok: true; content: string; status: number; contentType: string | null }
  | { ok: false; error: string; status?: number };

export type FetchFeedOptions = {
  timeoutMs?: number;
  maxBytes?: number;
  fetchImpl?: typeof fetch;
  authorizationHeader?: string;
};

const DEFAULT_TIMEOUT_MS = 20_000;
const DEFAULT_MAX_BYTES = 5_000_000; // ~5MB

export function isSafeFeedUrl(rawUrl: string): boolean {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return false;
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;

  const host = url.hostname.toLowerCase();
  if (host === 'localhost' || host.endsWith('.localhost') || host === '0.0.0.0' || host === '::1' || host === '[::1]') {
    return false;
  }

  // Block direct private/link-local/loopback IPv4 literals.
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) {
    const parts = host.split('.').map(Number);
    const [a, b] = parts;
    if (a === 127 || a === 10 || a === 0) return false;
    if (a === 192 && b === 168) return false;
    if (a === 169 && b === 254) return false;
    if (a === 172 && b >= 16 && b <= 31) return false;
  }

  return true;
}

export async function fetchFeedContent(rawUrl: string, options: FetchFeedOptions = {}): Promise<FetchFeedResult> {
  if (!isSafeFeedUrl(rawUrl)) {
    return { ok: false, error: 'Feed URL is not allowed.' };
  }

  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const maxBytes = options.maxBytes ?? DEFAULT_MAX_BYTES;
  const fetchImpl = options.fetchImpl ?? fetch;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const headers: Record<string, string> = {
    accept: 'text/csv, application/xml, text/xml, application/json, text/plain, */*',
  };
  if (options.authorizationHeader) {
    headers['authorization'] = options.authorizationHeader;
  }

  try {
    const response = await fetchImpl(rawUrl, {
      signal: controller.signal,
      redirect: 'follow',
      headers,
    });

    if (!response.ok) {
      return { ok: false, error: `Feed responded ${response.status}.`, status: response.status };
    }

    const declaredLength = Number(response.headers.get('content-length') ?? '');
    if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
      return { ok: false, error: 'Feed exceeds the maximum supported size.', status: response.status };
    }

    const content = await readCapped(response, maxBytes);
    if (content === null) {
      return { ok: false, error: 'Feed exceeds the maximum supported size.', status: response.status };
    }

    return { ok: true, content, status: response.status, contentType: response.headers.get('content-type') };
  } catch (error) {
    const message = error instanceof Error && error.name === 'AbortError' ? 'Feed request timed out.' : 'Could not fetch feed.';
    return { ok: false, error: message };
  } finally {
    clearTimeout(timer);
  }
}

/** Stream the body and abort if it exceeds the byte cap; falls back to text(). */
async function readCapped(response: Response, maxBytes: number): Promise<string | null> {
  const body = response.body;
  if (!body) {
    const text = await response.text();
    return Buffer.byteLength(text, 'utf8') > maxBytes ? null : text;
  }

  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel();
        return null;
      }
      chunks.push(value);
    }
  }

  return Buffer.concat(chunks.map((chunk) => Buffer.from(chunk))).toString('utf8');
}
