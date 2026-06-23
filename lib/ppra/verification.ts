/**
 * PPRA (Property Practitioners Regulatory Authority) FFC verification.
 *
 * Queries the public PPRA practitioner-search AJAX endpoint to verify that a
 * submitted Fidelity Fund Certificate number belongs to a real, currently
 * registered property practitioner.
 *
 * Endpoint: https://theppra.org.za/wp-admin/admin-ajax.php
 * Payload:  action=check_agent_status&agent_cardcode=<FFC>&query_type=agent|firm
 *
 * This is an official-site public AJAX endpoint, not a documented partner API.
 * We treat it as best-effort and fall back to manual review on any ambiguity.
 */

const PPRA_ENDPOINT = 'https://theppra.org.za/wp-admin/admin-ajax.php';
const PPRA_REFERER = 'https://theppra.org.za/practitioner-search/';
const REQUEST_TIMEOUT_MS = 12_000;

export type PPRAQueryType = 'agent' | 'firm';

export type PPRAPractitionerRecord = {
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
  queryType: PPRAQueryType;
  record: PPRAPractitionerRecord | null;
  checkedAt: string;
  reason?: string;
};

export type PPRAVerificationInput = {
  ffcNumber: string;
  /** Submitted first + last name for matching against the PPRA record. */
  submittedName?: string;
  /** Submitted agency/firm name for matching against the PPRA record. */
  submittedAgency?: string;
  queryType?: PPRAQueryType;
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
 * PPRA record name. Handles "John Smith" vs "JOHN  SMITH" and missing
 * middle names gracefully.
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

function buildFullName(record: PPRAAgentResponseData): string | undefined {
  const parts = [record.CardFName, record.CardName].filter(Boolean).map(String);
  return parts.length > 0 ? parts.join(' ').trim() : undefined;
}

type PPRAAgentResponseData = {
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

type PPRAEnvelope = {
  success?: boolean;
  data?: PPRAAgentResponseData;
};

/**
 * Parse the raw PPRA AJAX response into a structured practitioner record.
 * Returns null when no matching practitioner was found.
 */
export function parsePPRAResponse(
  body: PPRAEnvelope,
): PPRAPractitionerRecord | 'not_found' | 'unparseable' {
  const data = body?.data;
  if (!data || typeof data !== 'object') return 'unparseable';

  // No-records sentinel
  if (data.NO_VAL && String(data.NO_VAL).includes('No Records')) {
    return 'not_found';
  }

  const ffcNumber = data.FFCNum != null ? String(data.FFCNum) : '';
  if (!ffcNumber) return 'unparseable';

  return {
    ffcNumber: normaliseFFC(ffcNumber),
    isValid: String(data.ISVALID ?? '') === '1' || String(data.ISVALID ?? '').toLowerCase() === 'true',
    cardFirstName: data.CardFName?.trim() || undefined,
    cardLastName: data.CardName?.trim() || undefined,
    fullName: buildFullName(data),
    roleName: data.RoleName?.trim() || undefined,
    firmName: data.FirmName?.trim() || undefined,
    tradeName: data.TradeName?.trim() || undefined,
    category: data.Category?.trim() || undefined,
  };
}

/**
 * Core verification logic — given a parsed PPRA record and the submitted
 * details, determine the verification status.
 *
 * Auto-approve (verified) only when ALL of:
 *   - FFC number matches the returned FFCNum
 *   - ISVALID === 1/true
 *   - Submitted name matches the PPRA record name
 *
 * Any ambiguity falls through to manual review (name_mismatch /
 * invalid_certificate / not_found / endpoint_error).
 */
export function evaluateVerification(
  input: PPRAVerificationInput,
  record: PPRAPractitionerRecord | null,
  status: PPRAVerificationStatus,
): PPRAVerificationResult {
  const ffcNumber = normaliseFFC(input.ffcNumber);
  const checkedAt = new Date().toISOString();

  if (status === 'endpoint_error' || !record) {
    return {
      status,
      ffcNumber: input.ffcNumber,
      queryType: input.queryType ?? 'agent',
      record,
      checkedAt,
      reason: status === 'not_found'
        ? 'No practitioner found for this FFC number on the PPRA register.'
        : status === 'endpoint_error'
          ? 'The PPRA verification service did not respond. This request has been queued for manual review.'
          : undefined,
    };
  }

  // FFC number mismatch
  if (normaliseFFC(record.ffcNumber) !== ffcNumber) {
    return {
      status: 'name_mismatch',
      ffcNumber: input.ffcNumber,
      queryType: input.queryType ?? 'agent',
      record,
      checkedAt,
      reason: 'The FFC number returned by PPRA does not match the submitted number.',
    };
  }

  // Certificate not valid / lapsed
  if (!record.isValid) {
    return {
      status: 'invalid_certificate',
      ffcNumber: input.ffcNumber,
      queryType: input.queryType ?? 'agent',
      record,
      checkedAt,
      reason: 'The PPRA record shows this certificate is not currently valid.',
    };
  }

  // Name match (only fail if a name was submitted and it doesn't match)
  if (input.submittedName && record.fullName && !namesMatch(input.submittedName, record.fullName)) {
    return {
      status: 'name_mismatch',
      ffcNumber: input.ffcNumber,
      queryType: input.queryType ?? 'agent',
      record,
      checkedAt,
      reason: `The name on the PPRA register (${record.fullName}) does not match the submitted name (${input.submittedName}).`,
    };
  }

  return {
    status: 'verified',
    ffcNumber: input.ffcNumber,
    queryType: input.queryType ?? 'agent',
    record,
    checkedAt,
  };
}

/**
 * Verify a fidelity fund certificate against the PPRA register.
 *
 * This function makes a live HTTP call to the PPRA website. In tests, inject
 * a mock `fetcher` to avoid network calls.
 */
export async function verifyWithPPRA(
  input: PPRAVerificationInput,
  fetcher: typeof fetch = fetch,
): Promise<PPRAVerificationResult> {
  const ffcNumber = normaliseFFC(input.ffcNumber);
  if (!ffcNumber) {
    return {
      status: 'endpoint_error',
      ffcNumber: input.ffcNumber,
      queryType: input.queryType ?? 'agent',
      record: null,
      checkedAt: new Date().toISOString(),
      reason: 'No FFC number was provided.',
    };
  }

  const queryType: PPRAQueryType = input.queryType ?? 'agent';
  const params = new URLSearchParams({
    action: 'check_agent_status',
    agent_cardcode: ffcNumber,
    query_type: queryType,
  });

  let body: PPRAEnvelope;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    const response = await fetcher(PPRA_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Referer: PPRA_REFERER,
      },
      body: params.toString(),
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!response.ok) {
      return evaluateVerification(input, null, 'endpoint_error');
    }

    body = (await response.json()) as PPRAEnvelope;
  } catch {
    return evaluateVerification(input, null, 'endpoint_error');
  }

  const parsed = parsePPRAResponse(body);
  if (parsed === 'not_found') {
    return evaluateVerification(input, null, 'not_found');
  }
  if (parsed === 'unparseable') {
    return evaluateVerification(input, null, 'endpoint_error');
  }

  return evaluateVerification(input, parsed, 'verified');
}

/**
 * Whether a verification result is strong enough to auto-approve agency access.
 */
export function isAutoApprovable(result: PPRAVerificationResult): boolean {
  return result.status === 'verified';
}

/**
 * Human-readable label for each verification status, suitable for showing
 * to users and admins.
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
      return 'Details do not match PPRA';
    case 'endpoint_error':
      return 'PPRA check unavailable';
  }
}
