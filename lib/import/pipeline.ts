/**
 * Listing import pipeline.
 *
 * Pure orchestration: raw feed content -> parsed records -> mapped + normalised
 * listing inputs -> validation. Produces a structured, side-effect-free result
 * that the admin import endpoint can preview (dry run) or commit to the
 * database. Keeping this pure makes the whole import path unit-testable.
 */

import { validatePortalListingInput, type ValidPortalListingInput } from '@/lib/proppd/listing-editor';
import { parseFeed, type ParseFeedOptions, type RawRecord } from './feed';
import { mapRecord, type MapRecordOptions } from './mapping';

export type ImportRowStatus = 'valid' | 'invalid';

export type ImportRow = {
  index: number;
  status: ImportRowStatus;
  externalRef: string | null;
  title: string;
  errors: string[];
  data?: ValidPortalListingInput;
  raw: RawRecord;
};

export type ImportSummary = {
  format: string;
  total: number;
  valid: number;
  invalid: number;
  duplicateRefs: string[];
};

export type ImportResult = {
  summary: ImportSummary;
  rows: ImportRow[];
};

export type RunImportOptions = ParseFeedOptions & MapRecordOptions;

export function runListingImport(content: string, options: RunImportOptions = {}): ImportResult {
  const { format, records } = parseFeed(content, options);
  return buildResult(format, records, options);
}

/** Same as runListingImport but for already-parsed records (e.g. JSON body). */
export function importFromRecords(records: RawRecord[], options: MapRecordOptions = {}): ImportResult {
  return buildResult('records', records, options);
}

function buildResult(format: string, records: RawRecord[], options: MapRecordOptions): ImportResult {
  const rows: ImportRow[] = [];
  const seenRefs = new Map<string, number>();
  const duplicateRefs = new Set<string>();

  records.forEach((raw, index) => {
    const mapped = mapRecord(raw, options);
    const validation = validatePortalListingInput(mapped.input);
    const title = typeof mapped.input.title === 'string' ? mapped.input.title : '';

    if (mapped.externalRef) {
      const previous = seenRefs.get(mapped.externalRef);
      if (previous !== undefined) duplicateRefs.add(mapped.externalRef);
      else seenRefs.set(mapped.externalRef, index);
    }

    if (validation.success) {
      rows.push({
        index,
        status: 'valid',
        externalRef: mapped.externalRef,
        title,
        errors: [],
        data: validation.data,
        raw,
      });
    } else {
      rows.push({
        index,
        status: 'invalid',
        externalRef: mapped.externalRef,
        title,
        errors: validation.errors,
        raw,
      });
    }
  });

  const valid = rows.filter((row) => row.status === 'valid').length;

  return {
    summary: {
      format,
      total: rows.length,
      valid,
      invalid: rows.length - valid,
      duplicateRefs: [...duplicateRefs],
    },
    rows,
  };
}
