import { describe, expect, it } from 'vitest';
import { LEAD_CSV_COLUMNS, buildLeadsCsv, buildLeadsCsvFilename, escapeCsvCell } from '@/lib/leads/export';
import type { LeadRecord } from '@/lib/leads/pipeline';

function makeLead(overrides: Partial<LeadRecord> = {}): LeadRecord {
  return {
    id: 'lead-1',
    name: 'Lerato Mokoena',
    email: 'lerato@example.com',
    phone: '+27 82 123 4567',
    intent: 'viewing',
    status: 'new',
    quality: 'clean',
    listingTitle: 'Modern 3-bedroom house in Sandton',
    listingSlug: 'modern-3-bedroom-house-in-sandton',
    agent: 'Marc Chait',
    agency: 'Sakstons',
    sourcePage: '/property/modern-3-bedroom-house-in-sandton',
    createdAt: '2026-06-30T08:00:00.000Z',
    message: 'Is this still available?',
    flags: [],
    ...overrides,
  };
}

describe('escapeCsvCell', () => {
  it('quotes cells containing commas, quotes, or newlines', () => {
    expect(escapeCsvCell('plain')).toBe('plain');
    expect(escapeCsvCell('a,b')).toBe('"a,b"');
    expect(escapeCsvCell('say "hi"')).toBe('"say ""hi"""');
    expect(escapeCsvCell('line1\nline2')).toBe('"line1\nline2"');
  });

  it('neutralises spreadsheet formula prefixes (CSV injection)', () => {
    expect(escapeCsvCell('=HYPERLINK("http://evil")')).toBe('"\'=HYPERLINK(""http://evil"")"');
    expect(escapeCsvCell('+27 82 123 4567')).toBe("'+27 82 123 4567");
    expect(escapeCsvCell('@sum')).toBe("'@sum");
    expect(escapeCsvCell('-2')).toBe("'-2");
  });
});

describe('buildLeadsCsv', () => {
  it('writes a header row and one CRLF-separated row per lead', () => {
    const csv = buildLeadsCsv([makeLead(), makeLead({ id: 'lead-2', name: 'Aiden Naidoo' })]);
    const lines = csv.split('\r\n');
    expect(lines).toHaveLength(3);
    expect(lines[0]).toBe(LEAD_CSV_COLUMNS.join(','));
    expect(lines[1]).toContain('lead-1');
    expect(lines[1]).toContain('Lerato Mokoena');
    expect(lines[1]).toContain('Viewing');
    expect(lines[1]).toContain('Property enquiry');
    expect(lines[2]).toContain('Aiden Naidoo');
  });

  it('keeps hostile lead input contained in its cell', () => {
    const csv = buildLeadsCsv([
      makeLead({ name: 'Evil, "Lead"', message: '=cmd|/c calc\nsecond line' }),
    ]);
    const lines = csv.split('\r\n');
    // The embedded newline is quoted, so the record count stays header + 1 logical row split across 2 physical lines.
    expect(lines[1]).toContain('"Evil, ""Lead"""');
    expect(csv).toContain('"\'=cmd|/c calc\nsecond line"');
  });

  it('handles an empty queue and missing optional fields', () => {
    expect(buildLeadsCsv([])).toBe(LEAD_CSV_COLUMNS.join(','));
    const csv = buildLeadsCsv([makeLead({ viewingAt: undefined, sourcePage: undefined })]);
    expect(csv.split('\r\n')[1]).toContain('General enquiry');
  });
});

describe('buildLeadsCsvFilename', () => {
  it('stamps the current date', () => {
    expect(buildLeadsCsvFilename(new Date('2026-07-01T12:00:00Z'))).toBe('proppd-leads-2026-07-01.csv');
  });
});
