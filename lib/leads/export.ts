import type { LeadRecord } from './pipeline';
import { formatLeadIntent, formatLeadStatus, getLeadSourceLabel } from './pipeline';

/**
 * CSV export of the agent CRM lead queue, for agency reporting and import
 * into external tools (Excel, Google Sheets, another CRM).
 *
 * Escaping rules matter here: lead names and messages are untrusted public
 * input, so values are RFC 4180-quoted and cells that a spreadsheet would
 * evaluate as a formula (=, +, -, @ prefixes) are neutralised with a leading
 * apostrophe to prevent CSV injection when the file is opened in Excel.
 */

export const LEAD_CSV_COLUMNS = [
  'Lead ID',
  'Created',
  'Name',
  'Email',
  'Phone',
  'Intent',
  'Status',
  'Quality',
  'Listing',
  'Agent',
  'Agency',
  'Source',
  'Viewing at',
  'Message',
] as const;

export function escapeCsvCell(value: string): string {
  let cell = value;
  // Neutralise spreadsheet formula prefixes (CSV injection).
  if (/^[=+\-@\t\r]/.test(cell)) {
    cell = `'${cell}`;
  }
  if (/[",\n\r]/.test(cell)) {
    cell = `"${cell.replace(/"/g, '""')}"`;
  }
  return cell;
}

export function buildLeadsCsv(leads: LeadRecord[]): string {
  const rows = leads.map((lead) => [
    lead.id,
    lead.createdAt,
    lead.name,
    lead.email,
    lead.phone,
    formatLeadIntent(lead.intent),
    formatLeadStatus(lead.status),
    lead.quality,
    lead.listingTitle,
    lead.agent,
    lead.agency,
    getLeadSourceLabel(lead.sourcePage),
    lead.viewingAt ?? '',
    lead.message,
  ]);

  return [
    LEAD_CSV_COLUMNS.join(','),
    ...rows.map((row) => row.map((cell) => escapeCsvCell(String(cell ?? ''))).join(',')),
  ].join('\r\n');
}

export function buildLeadsCsvFilename(now: Date = new Date()): string {
  const stamp = now.toISOString().slice(0, 10);
  return `proppd-leads-${stamp}.csv`;
}
