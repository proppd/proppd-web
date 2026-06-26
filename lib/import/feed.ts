/**
 * Feed format detection and parsing.
 *
 * Turns a raw agency feed (CSV, XML, or JSON) into a uniform list of raw
 * records (`Record<string, string | string[]>`) that the mapping layer
 * normalises into listing inputs.
 */

import { parseCsv } from './csv';
import { extractXmlRecords, parseXml } from './xml';

export type FeedFormat = 'csv' | 'xml' | 'json';
export type RawValue = string | string[];
export type RawRecord = Record<string, RawValue>;

export type ParseFeedOptions = {
  /** Override auto-detection. */
  format?: FeedFormat;
  /** XML record element tag (e.g. "property"). Auto-detected when omitted. */
  recordTag?: string;
};

export type ParseFeedResult = {
  format: FeedFormat;
  records: RawRecord[];
};

export function detectFeedFormat(content: string): FeedFormat {
  const trimmed = content.trimStart();
  if (trimmed.startsWith('<')) return 'xml';
  if (trimmed.startsWith('[') || trimmed.startsWith('{')) return 'json';
  return 'csv';
}

export function parseFeed(content: string, options: ParseFeedOptions = {}): ParseFeedResult {
  const format = options.format ?? detectFeedFormat(content);

  switch (format) {
    case 'csv':
      return { format, records: parseCsv(content) };
    case 'xml':
      return { format, records: extractXmlRecords(parseXml(content), options.recordTag) };
    case 'json':
      return { format, records: parseJsonRecords(content) };
    default:
      return { format: 'csv', records: [] };
  }
}

function parseJsonRecords(content: string): RawRecord[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    return [];
  }

  const list = Array.isArray(parsed)
    ? parsed
    : isRecord(parsed)
      ? findRecordArray(parsed)
      : [];

  return list.filter(isRecord).map(flattenJsonRecord);
}

/** Pick the first array of objects from a wrapper object (e.g. { listings: [...] }). */
function findRecordArray(wrapper: Record<string, unknown>): unknown[] {
  for (const value of Object.values(wrapper)) {
    if (Array.isArray(value) && value.some(isRecord)) return value;
  }
  return [wrapper];
}

function flattenJsonRecord(record: Record<string, unknown>): RawRecord {
  const flat: RawRecord = {};
  for (const [key, value] of Object.entries(record)) {
    if (value === null || value === undefined) continue;
    if (Array.isArray(value)) {
      flat[key] = value.map((item) => (isRecord(item) ? firstStringValue(item) : String(item)));
    } else if (isRecord(value)) {
      flat[key] = firstStringValue(value);
    } else {
      flat[key] = String(value);
    }
  }
  return flat;
}

function firstStringValue(record: Record<string, unknown>): string {
  // Image objects often look like { url: "..." } or { src: "..." }.
  for (const preferred of ['url', 'src', 'href', 'value']) {
    const candidate = record[preferred];
    if (typeof candidate === 'string') return candidate;
  }
  const first = Object.values(record).find((value) => typeof value === 'string');
  return typeof first === 'string' ? first : '';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
