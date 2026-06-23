import { NextResponse, type NextRequest } from 'next/server';
import { getPortalServerUser } from '@/lib/supabase/server';
import {
  importPortalListings,
  loadPortalUserAccess,
  type ImportListingItem,
} from '@/lib/proppd/backend';
import { runListingImport, importFromRecords, type ImportResult } from '@/lib/import/pipeline';
import type { FeedFormat, RawRecord } from '@/lib/import/feed';
import { isListingStatus, type PortalListingStatus } from '@/lib/proppd/listing-editor';
import { rejectCrossOriginMutation } from '@/lib/security/request-guards';
import { rateLimitPolicies, rateLimitRequest } from '@/lib/security/rate-limit';

export const runtime = 'nodejs';

const MAX_CONTENT_LENGTH = 5_000_000; // ~5MB feed cap.

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Admin feed import.
 *
 * Body:
 *  - content: raw feed text (CSV / XML / JSON)   OR  records: RawRecord[]
 *  - format?: "csv" | "xml" | "json"             (auto-detected from content)
 *  - recordTag?: string                          (XML record element override)
 *  - source: string                              (feed name stored on listings)
 *  - defaultStatus?: PortalListingStatus         (status when feed has none)
 *  - targetAgencyId? / targetAgentId?: string    (super admin assignment)
 *  - dryRun?: boolean                            (default true — preview only)
 */
export async function POST(request: NextRequest) {
  const rejectedOrigin = rejectCrossOriginMutation(request);
  if (rejectedOrigin) return rejectedOrigin;

  const limited = rateLimitRequest(request, rateLimitPolicies.adminMutation);
  if (limited) return limited;

  const user = await getPortalServerUser();
  if (!user) return jsonError('Unauthorized', 401);

  const access = await loadPortalUserAccess(user.id, user.email ?? undefined);
  if (!access) return jsonError('Access profile not found', 403);
  if (access.role !== 'super_admin' && access.role !== 'agency_admin') {
    return jsonError('Only admins can import listings.', 403);
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') return jsonError('Invalid JSON body');

  const content = typeof body.content === 'string' ? body.content : null;
  const records = Array.isArray(body.records) ? (body.records as RawRecord[]) : null;
  if (!content && !records) {
    return jsonError('Provide feed "content" or parsed "records".');
  }
  if (content && content.length > MAX_CONTENT_LENGTH) {
    return jsonError('Feed exceeds the maximum supported size.', 413);
  }

  const source = typeof body.source === 'string' && body.source.trim() ? body.source.trim() : 'feed-import';
  const defaultStatus: PortalListingStatus = isListingStatus(body.defaultStatus) ? body.defaultStatus : 'pending_review';
  const format = isFeedFormat(body.format) ? body.format : undefined;
  const recordTag = typeof body.recordTag === 'string' ? body.recordTag : undefined;
  const dryRun = body.dryRun !== false; // default to preview

  const result: ImportResult = content
    ? runListingImport(content, { format, recordTag, defaultStatus })
    : importFromRecords(records ?? [], { defaultStatus });

  if (dryRun) {
    return NextResponse.json({
      dryRun: true,
      summary: result.summary,
      rows: result.rows.map((row) => ({
        index: row.index,
        status: row.status,
        externalRef: row.externalRef,
        title: row.title,
        errors: row.errors,
      })),
    });
  }

  const items: ImportListingItem[] = result.rows
    .filter((row) => row.status === 'valid' && row.data)
    .map((row) => ({ externalRef: row.externalRef, listing: row.data! }));

  if (items.length === 0) {
    return NextResponse.json(
      { dryRun: false, summary: result.summary, imported: { created: 0, updated: 0, failed: 0, errors: [] }, error: 'No valid listings to import.' },
      { status: 400 },
    );
  }

  const imported = await importPortalListings(access, {
    source,
    targetAgencyId: typeof body.targetAgencyId === 'string' ? body.targetAgencyId : null,
    targetAgentId: typeof body.targetAgentId === 'string' ? body.targetAgentId : null,
    items,
  });

  if (imported.source === 'error') {
    return jsonError(imported.error ?? 'Import failed.', 400);
  }

  return NextResponse.json({
    dryRun: false,
    summary: result.summary,
    imported: {
      created: imported.created,
      updated: imported.updated,
      failed: imported.failed,
      errors: imported.errors,
    },
  });
}

function isFeedFormat(value: unknown): value is FeedFormat {
  return value === 'csv' || value === 'xml' || value === 'json';
}
