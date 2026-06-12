export type ReportableListing = {
  slug: string;
  title: string;
  agent: string;
  agency: string;
};

export function buildReportListingSummary(listing: ReportableListing, sourcePath: string): string {
  return [
    'Hi Proppd,',
    '',
    'I would like to report this listing for review:',
    `Listing: ${listing.title}`,
    `Agent: ${listing.agent}`,
    `Agency: ${listing.agency}`,
    `Listing URL: https://proppd.com/property/${listing.slug}`,
    `Reported from: ${sourcePath}`,
    '',
    'Reason for the report (incorrect details, no longer available, suspected scam, duplicate, other):',
    '',
    'Additional details:',
  ].join('\n');
}

export function buildReportListingMailto(listing: ReportableListing, sourcePath: string): string {
  const subject = `Report listing: ${listing.title}`;
  const body = buildReportListingSummary(listing, sourcePath);
  return `mailto:info@proppd.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
