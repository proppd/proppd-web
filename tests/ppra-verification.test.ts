import { describe, expect, it } from 'vitest';
import {
  normaliseFFC,
  namesMatch,
  parseSearchResults,
  parseStatusResponse,
  verifyWithPPRA,
  isAutoApprovable,
  verificationStatusLabel,
  _resetGFormSession,
} from '@/lib/ppra/verification';

describe('normaliseFFC', () => {
  it('strips spaces, dashes, and the FFC prefix', () => {
    expect(normaliseFFC('FFC 1234567')).toBe('1234567');
    expect(normaliseFFC('ffc-1234567')).toBe('1234567');
    expect(normaliseFFC('FFC. 1234567')).toBe('1234567');
    expect(normaliseFFC('  1234567  ')).toBe('1234567');
    expect(normaliseFFC('FFC1234567')).toBe('1234567');
  });

  it('handles lowercase', () => {
    expect(normaliseFFC('ffc 1234567')).toBe('1234567');
  });

  it('preserves long FFC numbers', () => {
    expect(normaliseFFC('202623026100000')).toBe('202623026100000');
  });
});

describe('namesMatch', () => {
  it('matches identical names in different casing', () => {
    expect(namesMatch('John Smith', 'JOHN SMITH')).toBe(true);
  });

  it('matches when submitted name is a subset of record name', () => {
    expect(namesMatch('John Smith', 'John David Smith')).toBe(true);
  });

  it('does not match different names', () => {
    expect(namesMatch('John Smith', 'Sarah Jones')).toBe(false);
  });

  it('returns false for empty input', () => {
    expect(namesMatch('', 'John Smith')).toBe(false);
    expect(namesMatch('John Smith', '')).toBe(false);
  });
});

describe('parseSearchResults', () => {
  it('extracts practitioner rows from Gravity Forms HTML', () => {
    const html = `
      <table>
        <tr>
          <td>John Henry Smith</td>
          <td><button class="check-status-btn" data-id="SMITHJH6" data-type="agent">Check Status</button></td>
        </tr>
        <tr>
          <td>John David Smith</td>
          <td><button class="check-status-btn" data-id="SMITHJD2" data-type="agent">Check Status</button></td>
        </tr>
      </table>`;
    const results = parseSearchResults(html);
    expect(results).toHaveLength(2);
    expect(results[0]).toEqual({
      name: 'John Henry Smith',
      cardcode: 'SMITHJH6',
      type: 'agent',
    });
    expect(results[1]).toEqual({
      name: 'John David Smith',
      cardcode: 'SMITHJD2',
      type: 'agent',
    });
  });

  it('returns empty array for no results', () => {
    const html = '<div>No results found matching your criteria.</div>';
    expect(parseSearchResults(html)).toEqual([]);
  });

  it('handles firm results', () => {
    const html = `
      <tr>
        <td>Seeff Independent Agency (pty) Ltd</td>
        <td>Seeff</td>
        <td><button data-id="SEEFF.I01" data-type="firm">Check Status</button></td>
      </tr>`;
    const results = parseSearchResults(html);
    expect(results).toHaveLength(1);
    expect(results[0].type).toBe('firm');
    expect(results[0].cardcode).toBe('SEEFF.I01');
  });
});

describe('parseStatusResponse', () => {
  it('parses a valid agent record', () => {
    const body = {
      success: true,
      data: {
        FFCNum: '202623026100000',
        ISVALID: '1',
        CardFName: 'John',
        CardName: 'Smith',
        RoleName: 'Agent',
        FirmName: 'Example Estates',
        TradeName: 'Example',
        Category: 'Estate Agency',
      },
    };
    const result = parseStatusResponse(body, 'SMITHJH6');
    expect(result).not.toBe('not_found');
    expect(result).not.toBe('unparseable');
    expect(result).toEqual(
      expect.objectContaining({
        cardcode: 'SMITHJH6',
        ffcNumber: '202623026100000',
        isValid: true,
        fullName: 'John Smith',
        firmName: 'Example Estates',
      }),
    );
  });

  it('detects the no-records sentinel', () => {
    expect(
      parseStatusResponse({ success: true, data: { NO_VAL: 'GET_VALID_AGENT:No Records' } }, 'TEST'),
    ).toBe('not_found');
  });

  it('returns unparseable when data is missing', () => {
    expect(parseStatusResponse({ success: true }, 'TEST')).toBe('unparseable');
    expect(parseStatusResponse({ success: true, data: {} }, 'TEST')).toBe('unparseable');
  });

  it('accepts ISVALID as boolean-like string', () => {
    const body = {
      success: true,
      data: { FFCNum: '123', ISVALID: 'true', CardFName: 'Jane', CardName: 'Doe' },
    };
    const result = parseStatusResponse(body, 'DOEJ1');
    expect(result).not.toBe('not_found');
    if (result !== 'not_found' && result !== 'unparseable') {
      expect(result.isValid).toBe(true);
    }
  });
});

// ─── verifyWithPPRA with mocked fetch ──────────────────────────────────

/**
 * Build a mock fetch that simulates the two-step PPRA flow:
 *   1. GET to practitioner-search page → returns HTML with gform hidden fields
 *   2. POST to admin-ajax with action=gravityforms → returns search results HTML
 *   3. POST to admin-ajax with action=check_agent_status → returns JSON status
 */
function buildMockFetch(opts: {
  searchHtml?: string;
  statusResponses?: Record<string, object>;
}): typeof fetch {
  const defaultSearchHtml = `
    <input type='hidden' name='state_3' value='FAKE_STATE_VALUE' />
    <input type='hidden' name='gform_currency' value='FAKE_CURRENCY' />
    hash=abc123def456
  `;

  return ((input: string | URL | Request, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input.toString();

    // Step 0: Fetch the search page (GET)
    if (!init?.method || init.method === 'GET') {
      return Promise.resolve(
        new Response(opts.searchHtml ?? defaultSearchHtml, {
          status: 200,
          headers: { 'content-type': 'text/html' },
        }),
      );
    }

    const bodyStr = typeof init.body === 'string' ? init.body : '';

    // Step 1: Gravity Forms search
    if (bodyStr.includes('action=gravityforms')) {
      const searchResultHtml = opts.searchHtml?.includes('data-id')
        ? opts.searchHtml
        : `
          <tr><td>John Henry Smith</td>
          <td><button data-id="SMITHJH6" data-type="agent">Check Status</button></td></tr>`;
      return Promise.resolve(
        new Response(searchResultHtml, {
          status: 200,
          headers: { 'content-type': 'text/html' },
        }),
      );
    }

    // Step 2: check_agent_status
    if (bodyStr.includes('action=check_agent_status')) {
      const cardcodeMatch = bodyStr.match(/agent_cardcode=([^&]+)/);
      const cardcode = cardcodeMatch ? decodeURIComponent(cardcodeMatch[1]) : '';
      const statusData = opts.statusResponses?.[cardcode];

      if (statusData) {
        return Promise.resolve(
          new Response(JSON.stringify(statusData), {
            status: 200,
            headers: { 'content-type': 'application/json' },
          }),
        );
      }

      // Default: no records
      return Promise.resolve(
        new Response(
          JSON.stringify({ success: true, data: { NO_VAL: 'GET_VALID_AGENT:No Records' } }),
          { status: 200, headers: { 'content-type': 'application/json' } },
        ),
      );
    }

    return Promise.resolve(new Response('', { status: 404 }));
  }) as typeof fetch;
}

describe('verifyWithPPRA (mocked fetch)', () => {
  it('returns verified when name search + FFC match + valid', async () => {
    _resetGFormSession();
    const mockFetch = buildMockFetch({
      statusResponses: {
        SMITHJH6: {
          success: true,
          data: {
            FFCNum: '202623026100000',
            ISVALID: '1',
            CardFName: 'John',
            CardName: 'Smith',
            FirmName: 'Example Estates',
          },
        },
      },
    });

    const result = await verifyWithPPRA(
      { ffcNumber: '202623026100000', firstName: 'John', lastName: 'Smith' },
      mockFetch,
    );
    expect(result.status).toBe('verified');
    expect(result.record?.fullName).toBe('John Smith');
    expect(result.record?.ffcNumber).toBe('202623026100000');
  });

  it('returns not_found when name search returns no results', async () => {
    _resetGFormSession();
    const mockFetch = buildMockFetch({
      searchHtml: '<div>No results found matching your criteria.</div>',
    });

    const result = await verifyWithPPRA(
      { ffcNumber: '202623026100000', firstName: 'Nobody', lastName: 'Here' },
      mockFetch,
    );
    expect(result.status).toBe('not_found');
  });

  it('returns name_mismatch when FFC does not match any search result', async () => {
    _resetGFormSession();
    const mockFetch = buildMockFetch({
      statusResponses: {
        SMITHJH6: {
          success: true,
          data: {
            FFCNum: '9999999',
            ISVALID: '1',
            CardFName: 'John',
            CardName: 'Smith',
          },
        },
      },
    });

    const result = await verifyWithPPRA(
      { ffcNumber: '202623026100000', firstName: 'John', lastName: 'Smith' },
      mockFetch,
    );
    expect(result.status).toBe('name_mismatch');
  });

  it('returns invalid_certificate when FFC matches but ISVALID is 0', async () => {
    _resetGFormSession();
    const mockFetch = buildMockFetch({
      statusResponses: {
        SMITHJH6: {
          success: true,
          data: {
            FFCNum: '202623026100000',
            ISVALID: '0',
            CardFName: 'John',
            CardName: 'Smith',
          },
        },
      },
    });

    const result = await verifyWithPPRA(
      { ffcNumber: '202623026100000', firstName: 'John', lastName: 'Smith' },
      mockFetch,
    );
    expect(result.status).toBe('invalid_certificate');
  });

  it('returns endpoint_error on empty FFC', async () => {
    const result = await verifyWithPPRA({ ffcNumber: '' });
    expect(result.status).toBe('endpoint_error');
  });

  it('returns endpoint_error when name is missing', async () => {
    const result = await verifyWithPPRA({ ffcNumber: '1234567' });
    expect(result.status).toBe('endpoint_error');
  });

  it('handles submittedName as fallback for first/last', async () => {
    _resetGFormSession();
    const mockFetch = buildMockFetch({
      statusResponses: {
        SMITHJH6: {
          success: true,
          data: {
            FFCNum: '202623026100000',
            ISVALID: '1',
            CardFName: 'John',
            CardName: 'Smith',
          },
        },
      },
    });

    const result = await verifyWithPPRA(
      { ffcNumber: '202623026100000', submittedName: 'John Smith' },
      mockFetch,
    );
    expect(result.status).toBe('verified');
  });
});

describe('isAutoApprovable', () => {
  it('only auto-approves verified status', () => {
    expect(
      isAutoApprovable({
        status: 'verified',
        ffcNumber: '123',
        record: null,
        checkedAt: '2026-06-23T00:00:00Z',
      }),
    ).toBe(true);

    expect(
      isAutoApprovable({
        status: 'not_found',
        ffcNumber: '123',
        record: null,
        checkedAt: '2026-06-23T00:00:00Z',
      }),
    ).toBe(false);
  });
});

describe('verificationStatusLabel', () => {
  it('returns human-readable labels', () => {
    expect(verificationStatusLabel('verified')).toBe('PPRA verified');
    expect(verificationStatusLabel('not_found')).toBe('Not found on PPRA register');
    expect(verificationStatusLabel('invalid_certificate')).toBe('Certificate not valid');
    expect(verificationStatusLabel('name_mismatch')).toBe('FFC does not match PPRA record');
    expect(verificationStatusLabel('endpoint_error')).toBe('PPRA check unavailable');
  });
});
