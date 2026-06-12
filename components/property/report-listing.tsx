import { Flag } from 'lucide-react';
import { buildReportListingMailto, type ReportableListing } from '@/lib/listings/report';

export function ReportListingButton({ listing }: { listing: ReportableListing }) {
  return (
    <a
      href={buildReportListingMailto(listing, `/property/${listing.slug}`)}
      className="inline-flex items-center gap-2 text-sm font-bold text-[#9CA3AF] transition hover:text-[#4A3AFF]"
    >
      <Flag size={14} /> Report this listing
    </a>
  );
}
