import { describe, expect, it } from 'vitest';
import {
  normaliseFFC,
  namesMatch,
  parsePPRAResponse,
  evaluateVerification,
  verifyWithPPRA,
  isAutoApprovable,
  verificationStatusLabel,
  type PPRAVerificationInput,
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

  it('ignores single-char tokens', () => {
    expect(namesMatch('A Smith', 'Adam Smith')).toBe(true);
  });
});

describe('parsePPRAResponse', () => {
  it('parses a valid agent record', () => {
    const body = {
      success: true,
      data: {
        FFCNum: '1234567',
        ISVALID: '1',
        CardFName: 'John',
        CardName: 'Smith',
        RoleName: 'Agent',
        FirmName: 'Example Estates',
        TradeName: 'Example',
        Category: 'Estate Agent',
      },
    };

    const result = parsePPRAResponse(body);
    expect(result).not.toBe('not_found');
    expect(result).not.toBe('unparseable');
    expect(result).toEqual(
      expect.objectContaining({
        ffcNumber: '1234567',
        isValid: true,
        cardFirstName: 'John',
        cardLastName: 'Smith',
        fullName: 'John Smith',
        roleName: 'Agent',
        firmName: 'Example Estates',
      }),
    );
  });

  it('detects the no-records sentinel', () => {
    const body = {
      success: true,
      data: { NO_VAL: 'GET_VALID_AGENT:No Records' },
    };
    expect(parsePPRAResponse(body)).toBe('not_found');
  });

  it('returns unparseable when data is missing', () => {
    expect(parsePPRAResponse({ success: true })).toBe('unparseable');
    expect(parsePPRAResponse({ success: true, data: {} })).toBe('unparseable');
  });

  it('accepts ISVALID as boolean-like', () => {
    const body = {
      success: true,
      data: { FFCNum: '1234567', ISVALID: 'true', CardFName: 'Jane', CardName: 'Doe' },
    };
    const result = parsePPRAResponse(body);
    expect(result).not.toBe('not_found');
    if (result !== 'not_found' && result !== 'unparseable') {
      expect(result.isValid).toBe(true);
    }
  });
});

describe('evaluateVerification', () => {
  const baseInput: PPRAVerificationInput = {
    ffcNumber: 'FFC 1234567',
    submittedName: 'John Smith',
    submittedAgency: 'Example Estates',
  };

  it('returns verified when everything matches', () => {
    const record = {
      ffcNumber: '1234567',
      isValid: true,
      fullName: 'John Smith',
      firmName: 'Example Estates',
    };
    const result = evaluateVerification(baseInput, record, 'verified');
    expect(result.status).toBe('verified');
    expect(result.record).toEqual(record);
  });

  it('returns invalid_certificate when ISVALID is false', () => {
    const record = {
      ffcNumber: '1234567',
      isValid: false,
      fullName: 'John Smith',
    };
    const result = evaluateVerification(baseInput, record, 'verified');
    expect(result.status).toBe('invalid_certificate');
  });

  it('returns name_mismatch when the FFC numbers differ', () => {
    const record = {
      ffcNumber: '9999999',
      isValid: true,
      fullName: 'John Smith',
    };
    const result = evaluateVerification(baseInput, record, 'verified');
    expect(result.status).toBe('name_mismatch');
  });

  it('returns name_mismatch when names do not match', () => {
    const record = {
      ffcNumber: '1234567',
      isValid: true,
      fullName: 'Sarah Jones',
    };
    const result = evaluateVerification(baseInput, record, 'verified');
    expect(result.status).toBe('name_mismatch');
  });

  it('returns not_found when record is null and status is not_found', () => {
    const result = evaluateVerification(baseInput, null, 'not_found');
    expect(result.status).toBe('not_found');
  });

  it('returns endpoint_error when status is endpoint_error', () => {
    const result = evaluateVerification(baseInput, null, 'endpoint_error');
    expect(result.status).toBe('endpoint_error');
    expect(result.reason).toContain('did not respond');
  });

  it('skips name match when no submitted name', () => {
    const record = {
      ffcNumber: '1234567',
      isValid: true,
      fullName: 'Completely Different',
    };
    const result = evaluateVerification(
      { ffcNumber: 'FFC 1234567' },
      record,
      'verified',
    );
    expect(result.status).toBe('verified');
  });
});

describe('verifyWithPPRA (mocked fetch)', () => {
  it('returns verified on a valid PPRA response', async () => {
    const mockFetch = (() =>
      Promise.resolve(
        new Response(
          JSON.stringify({
            success: true,
            data: {
              FFCNum: '1234567',
              ISVALID: '1',
              CardFName: 'John',
              CardName: 'Smith',
              FirmName: 'Example Estates',
            },
          }),
          { status: 200, headers: { 'content-type': 'application/json' } },
        ),
      )) as typeof fetch;

    const result = await verifyWithPPRA(
      { ffcNumber: 'FFC 1234567', submittedName: 'John Smith' },
      mockFetch,
    );
    expect(result.status).toBe('verified');
    expect(result.record?.fullName).toBe('John Smith');
  });

  it('returns not_found when PPRA says no records', async () => {
    const mockFetch = (() =>
      Promise.resolve(
        new Response(
          JSON.stringify({
            success: true,
            data: { NO_VAL: 'GET_VALID_AGENT:No Records' },
          }),
          { status: 200, headers: { 'content-type': 'application/json' } },
        ),
      )) as typeof fetch;

    const result = await verifyWithPPRA(
      { ffcNumber: '9999999' },
      mockFetch,
    );
    expect(result.status).toBe('not_found');
  });

  it('returns endpoint_error on network failure', async () => {
    const mockFetch = (() => Promise.reject(new Error('network down'))) as typeof fetch;
    const result = await verifyWithPPRA(
      { ffcNumber: '1234567' },
      mockFetch,
    );
    expect(result.status).toBe('endpoint_error');
  });

  it('returns endpoint_error on non-200 status', async () => {
    const mockFetch = (() =>
      Promise.resolve(new Response('Server Error', { status: 500 }))) as typeof fetch;
    const result = await verifyWithPPRA(
      { ffcNumber: '1234567' },
      mockFetch,
    );
    expect(result.status).toBe('endpoint_error');
  });

  it('returns endpoint_error when FFC is empty', async () => {
    const result = await verifyWithPPRA({ ffcNumber: '' });
    expect(result.status).toBe('endpoint_error');
  });

  it('returns invalid_certificate when PPRA shows not valid', async () => {
    const mockFetch = (() =>
      Promise.resolve(
        new Response(
          JSON.stringify({
            success: true,
            data: {
              FFCNum: '1234567',
              ISVALID: '0',
              CardFName: 'John',
              CardName: 'Smith',
            },
          }),
          { status: 200, headers: { 'content-type': 'application/json' } },
        ),
      )) as typeof fetch;

    const result = await verifyWithPPRA(
      { ffcNumber: 'FFC 1234567', submittedName: 'John Smith' },
      mockFetch,
    );
    expect(result.status).toBe('invalid_certificate');
  });

  it('returns name_mismatch when names differ', async () => {
    const mockFetch = (() =>
      Promise.resolve(
        new Response(
          JSON.stringify({
            success: true,
            data: {
              FFCNum: '1234567',
              ISVALID: '1',
              CardFName: 'Sarah',
              CardName: 'Jones',
            },
          }),
          { status: 200, headers: { 'content-type': 'application/json' } },
        ),
      )) as typeof fetch;

    const result = await verifyWithPPRA(
      { ffcNumber: 'FFC 1234567', submittedName: 'John Smith' },
      mockFetch,
    );
    expect(result.status).toBe('name_mismatch');
  });
});

describe('isAutoApprovable', () => {
  it('only auto-approves verified status', () => {
    expect(
      isAutoApprovable({
        status: 'verified',
        ffcNumber: '1234567',
        queryType: 'agent',
        record: null,
        checkedAt: '2026-06-23T00:00:00Z',
      }),
    ).toBe(true);

    expect(
      isAutoApprovable({
        status: 'not_found',
        ffcNumber: '1234567',
        queryType: 'agent',
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
    expect(verificationStatusLabel('name_mismatch')).toBe('Details do not match PPRA');
    expect(verificationStatusLabel('endpoint_error')).toBe('PPRA check unavailable');
  });
});
