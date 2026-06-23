/**
 * PPRA (Property Practitioners Regulatory Authority) FFC verification.
 *
 * The PPRA practitioner search is a TWO-STEP process:
 *
 *   1. SEARCH via Gravity Forms AJAX (action=gravityforms, form_id=3)
 *      Search by Practitioner Name or Reference Number.
 *      Returns a list of practitioners with short "cardcodes" (e.g. SMITHJH6).
 *
 *   2. STATUS CHECK via admin AJAX (action=check_agent_status)
 *      Takes a cardcode + query_type (agent|firm).
 *      Returns the full record including FFCNum, ISVALID, name, firm, etc.
 *
 * The FFC number is NOT a search parameter — it only appears in the step 2
 * response. So verification must search by name first, then match FFC.
 */

const PPRA_AJAX_ENDPOINT = 'https://theppra.org.za/wp-admin/admin-ajax.php';
const PPRA_REFERER = 'https://theppra.org.za/practitioner-search/';
const REQUEST_TIMEOUT_MS = 15_000;

// Gravity Forms hidden fields fetched once per session
type GFormSession = {
  state: string;
  currency: string;
  hash: string;
  fetchedAt: number;
};

let cachedSession: GFormSession | null = null;
const SESSION_TTL_MS = 10 * 60 * 1000; // 10 minutes

export type PPRAQueryType = 'agent' | 'firm';

export type PPRAPractitionerRecord = {
  cardcode: string;
  ffcNumber: string;
  isValid: boolean;
  cardFirstName?: string;
  cardLastName?: string;
  fullName?: string;
  roleName?: string;
  firmName?: string;
  tradeName?: string;
  category?: string;
};

export type PPRAVerificationStatus =
  | 'verified'
  | 'not_found'
  | 'invalid_certificate'
  | 'name_mismatch'
  | 'endpoint_error';

export type PPRAVerificationResult = {
  status: PPRAVerificationStatus;
  ffcNumber: string;
  record: PPRAPractitionerRecord | null;
  checkedAt: string;
  reason?: string;
};

export type PPRAVerificationInput = {
  ffcNumber: string;
  /** Submitted first name for PPRA search. */
  firstName?: string;
  /** Submitted last name for PPRA search. */
  lastName?: string;
  /** Full submitted name (alternative to firstName/lastName). */
  submittedName?: string;
};

/**
 * Normalise an FFC number by stripping spaces, dashes, and common prefixes
 * like "FFC" so we can compare raw digits.
 */
export function normaliseFFC(value: string): string {
  return value
    .toUpperCase()
    .replace(/^FFC\.?\s*/i, '')
    .replace(/[\s-]/g, '')
    .trim();
}

/**
 * Lightweight name similarity — tokenises both strings, lowercases them,
 * and checks whether every token in the submitted name appears in the
 * PPRA record name.
 */
export function namesMatch(submitted: string, record: string): boolean {
  const submittedTokens = normaliseNameTokens(submitted);
  const recordTokens = normaliseNameTokens(record);
  if (submittedTokens.length === 0 || recordTokens.length === 0) return false;
  return submittedTokens.every((token) => recordTokens.includes(token));
}

function normaliseNameTokens(value: string): string[] {
  return value
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter((t) => t.length >= 2);
}

// ─── Gravity Forms session helpers ─────────────────────────────────────

async function fetchGFormSession(fetcher: typeof fetch): Promise<GFormSession | null> {
  if (cachedSession && Date.now() - cachedSession.fetchedAt < SESSION_TTL_MS) {
    return cachedSession;
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    const response = await fetcher(PPRA_REFERER, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    clearTimeout(timer);

    if (!response.ok) return null;
    const html = await response.text();

    const stateMatch = html.match(/name='state_3'[^>]*value='([^']*)'/);
    const currencyMatch = html.match(/name='gform_currency'[^>]*value='([^']*)'/);
    const hashMatch = html.match(/hash=([a-f0-9]+)/);

    if (!stateMatch || !currencyMatch || !hashMatch) return null;

    cachedSession = {
      state: stateMatch[1],
      currency: currencyMatch[1],
      hash: hashMatch[1],
      fetchedAt: Date.now(),
    };
    return cachedSession;
  } catch {
    return null;
  }
}

// ─── Step 1: Search PPRA register by name ─────────────────────────────

type SearchResult = {
  name: string;
  cardcode: string;
  type: PPRAQueryType;
};

/**
 * Parse the Gravity Forms AJAX HTML response to extract practitioner results.
 */
export function parseSearchResults(html: string): SearchResult[] {
  const results: SearchResult[] = [];
  // Each result row has a button with data-id and data-type
  const rowRegex = /<td[^>]*>([^<]+)<\/td>[\s\S]*?data-id="([^"]+)"[\s\S]*?data-type="(agent|firm)"/g;
  let match;
  while ((match = rowRegex.exec(html)) !== null) {
    results.push({
      name: match[1].trim(),
      cardcode: match[2].trim(),
      type: match[3] as PPRAQueryType,
    });
  }
  return results;
}

/**
 * Search the PPRA register by practitioner name.
 * Returns a list of matching practitioners with their cardcodes.
 */
export async function searchByName(
  firstName: string,
  lastName: string,
  fetcher: typeof fetch = fetch,
): Promise<SearchResult[]> {
  const session = await fetchGFormSession(fetcher);
  if (!session) return [];

  const payload = new URLSearchParams({
    action: 'gravityforms',
    'gform_ajax': `form_id=3&title=&description=&tabindex=0&theme=gravity-theme&hash=${session.hash}`,
    'is_submit_3': '1',
    'gform_submit': '3',
    'gform_currency': session.currency,
    'gform_unique_id': '',
    'state_3': session.state,
    'gform_target_page_number_3': '0',
    'gform_source_page_number_3': '1',
    'gform_field_values': '',
    'gform_theme': 'gravity-theme',
    'gform_submission_method': 'iframe',
    'input_4': 'Practitioner Name',
    'input_3.3': firstName,
    'input_3.6': lastName,
  });

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    const response = await fetcher(PPRA_AJAX_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Referer': PPRA_REFERER,
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: payload.toString(),
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!response.ok) return [];
    const html = await response.text();
    return parseSearchResults(html);
  } catch {
    return [];
  }
}

// ─── Step 2: Check status for a specific cardcode ─────────────────────

type PPRAStatusResponse = {
  success?: boolean;
  data?: {
    NO_VAL?: string;
    FFCNum?: string | number;
    ISVALID?: string | number;
    CardFName?: string;
    CardName?: string;
    RoleName?: string;
    FirmName?: string;
    TradeName?: string;
    Category?: string;
  };
};

export type PPRAStatusRecord =
  | PPRAPractitionerRecord
  | 'not_found'
  | 'unparseable';

function buildFullName(cardFName?: string, cardName?: string): string | undefined {
  const parts = [cardFName, cardName].filter(Boolean).map((s) => s!.trim());
  return parts.length > 0 ? parts.join(' ') : undefined;
}

function coerceString(value: unknown): string | undefined {
  if (value == null) return undefined;
  if (typeof value === 'string') return value.trim() || undefined;
  // PPRA sometimes returns empty arrays [] for missing string fields
  if (Array.isArray(value)) return value.length > 0 ? String(value[0]).trim() || undefined : undefined;
  return String(value).trim() || undefined;
}

/**
 * Parse the check_agent_status response into a structured record.
 */
export function parseStatusResponse(
  body: PPRAStatusResponse,
  cardcode: string,
): PPRAStatusRecord {
  const data = body?.data;
  if (!data || typeof data !== 'object') return 'unparseable';

  if (data.NO_VAL && String(data.NO_VAL).includes('No Records')) {
    return 'not_found';
  }

  const ffcNumber = data.FFCNum != null ? String(data.FFCNum) : '';
  if (!ffcNumber) return 'unparseable';

  return {
    cardcode,
    ffcNumber: normaliseFFC(ffcNumber),
    isValid: String(data.ISVALID ?? '') === '1' || String(data.ISVALID ?? '').toLowerCase() === 'true',
    cardFirstName: coerceString(data.CardFName),
    cardLastName: coerceString(data.CardName),
    fullName: buildFullName(coerceString(data.CardFName), coerceString(data.CardName)),
    roleName: coerceString(data.RoleName),
    firmName: coerceString(data.FirmName),
    tradeName: coerceString(data.TradeName),
    category: coerceString(data.Category),
  };
}

/**
 * Query the PPRA status endpoint for a specific practitioner cardcode.
 */
export async function checkStatus(
  cardcode: string,
  queryType: PPRAQueryType,
  fetcher: typeof fetch = fetch,
): Promise<PPRAStatusRecord> {
  const params = new URLSearchParams({
    action: 'check_agent_status',
    agent_cardcode: cardcode,
    query_type: queryType,
  });

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    const response = await fetcher(PPRA_AJAX_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Referer': PPRA_REFERER,
      },
      body: params.toString(),
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!response.ok) return 'unparseable';
    const body = (await response.json()) as PPRAStatusResponse;
    return parseStatusResponse(body, cardcode);
  } catch {
    return 'unparseable';
  }
}

// ─── Full verification flow ───────────────────────────────────────────

/**
 * Verify a fidelity fund certificate against the PPRA register.
 *
 * Flow:
 *   1. Search PPRA by the agent's name
 *   2. For each match, check their status to get the FFC number
 *   3. Find the one whose FFC matches what was submitted
 *   4. Verify the certificate is valid
 *
 * In tests, inject a mock `fetcher` to avoid network calls.
 */
export async function verifyWithPPRA(
  input: PPRAVerificationInput,
  fetcher: typeof fetch = fetch,
): Promise<PPRAVerificationResult> {
  const targetFFC = normaliseFFC(input.ffcNumber);
  if (!targetFFC) {
    return {
      status: 'endpoint_error',
      ffcNumber: input.ffcNumber,
      record: null,
      checkedAt: new Date().toISOString(),
      reason: 'No FFC number was provided.',
    };
  }

  // Resolve first/last name
  let firstName = input.firstName?.trim() || '';
  let lastName = input.lastName?.trim() || '';
  if ((!firstName || !lastName) && input.submittedName) {
    const parts = input.submittedName.trim().split(/\s+/);
    firstName = firstName || parts[0] || '';
    lastName = lastName || parts.slice(1).join(' ') || '';
  }

  if (!firstName || !lastName) {
    return {
      status: 'endpoint_error',
      ffcNumber: input.ffcNumber,
      record: null,
      checkedAt: new Date().toISOString(),
      reason: 'Agent name is required to search the PPRA register.',
    };
  }

  // Step 1: Search by name
  const searchResults = await searchByName(firstName, lastName, fetcher);
  if (searchResults.length === 0) {
    return {
      status: 'not_found',
      ffcNumber: input.ffcNumber,
      record: null,
      checkedAt: new Date().toISOString(),
      reason: 'No practitioner found with that name on the PPRA register.',
    };
  }

  // Step 2: Check status for each result, looking for matching FFC
  for (const result of searchResults) {
    const status = await checkStatus(result.cardcode, result.type, fetcher);
    if (status === 'not_found' || status === 'unparseable') continue;

    // Check if FFC number matches
    if (normaliseFFC(status.ffcNumber) === targetFFC) {
      // FFC matches — now check validity
      if (!status.isValid) {
        return {
          status: 'invalid_certificate',
          ffcNumber: input.ffcNumber,
          record: status,
          checkedAt: new Date().toISOString(),
          reason: 'The PPRA record shows this certificate is not currently valid.',
        };
      }

      // Verified!
      return {
        status: 'verified',
        ffcNumber: input.ffcNumber,
        record: status,
        checkedAt: new Date().toISOString(),
      };
    }
  }

  // Name found but no FFC match
  return {
    status: 'name_mismatch',
    ffcNumber: input.ffcNumber,
    record: null,
    checkedAt: new Date().toISOString(),
    reason: `Found ${searchResults.length} practitioner(s) with that name, but none have FFC number ${input.ffcNumber}.`,
  };
}

/**
 * Whether a verification result is strong enough to auto-approve agency access.
 */
export function isAutoApprovable(result: PPRAVerificationResult): boolean {
  return result.status === 'verified';
}

/**
 * Human-readable label for each verification status.
 */
export function verificationStatusLabel(status: PPRAVerificationStatus): string {
  switch (status) {
    case 'verified':
      return 'PPRA verified';
    case 'not_found':
      return 'Not found on PPRA register';
    case 'invalid_certificate':
      return 'Certificate not valid';
    case 'name_mismatch':
      return 'FFC does not match PPRA record';
    case 'endpoint_error':
      return 'PPRA check unavailable';
  }
}

// ─── Test helper: reset cached session ────────────────────────────────

export function _resetGFormSession(): void {
  cachedSession = null;
}
