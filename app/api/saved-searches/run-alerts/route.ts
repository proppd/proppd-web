import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Listing } from '@/lib/demo-data';
import { loadPortalListings } from '@/lib/proppd/backend';
import { findNewMatches } from '@/lib/search/match';
import { savedSearchHref, type SavedSearchPath } from '@/lib/search/saved';
import { sendEmail } from '@/lib/notifications/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Triggered by a scheduler (e.g. Vercel Cron). Guarded by CRON_SECRET — Vercel
// sends `Authorization: Bearer <CRON_SECRET>` automatically when it's set.
export async function GET(request: NextRequest) {
  return runAlerts(request);
}
export async function POST(request: NextRequest) {
  return runAlerts(request);
}

async function runAlerts(request: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    return NextResponse.json({ ok: false, error: 'Alerts are not configured (set CRON_SECRET).' }, { status: 503 });
  }
  const header = request.headers.get('authorization');
  const query = request.nextUrl.searchParams.get('secret');
  if (header !== `Bearer ${secret}` && query !== secret) {
    return NextResponse.json({ ok: false, error: 'Unauthorized.' }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return NextResponse.json({ ok: false, error: 'Service role not configured.' }, { status: 503 });
  }
  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

  const { items: listings } = await loadPortalListings();

  const { data: rows, error } = await admin
    .from('saved_searches')
    .select('id, email, label, path, query_string, last_alerted_at, created_at')
    .not('email', 'is', null);
  if (error) {
    return NextResponse.json({ ok: false, error: 'Could not load saved searches.' }, { status: 500 });
  }

  const now = new Date();
  let emailed = 0;
  let totalMatches = 0;

  for (const row of rows ?? []) {
    const since = new Date(row.last_alerted_at ?? row.created_at);
    const matches = findNewMatches(
      { queryString: row.query_string ?? '', path: (row.path as SavedSearchPath) ?? '/properties' },
      listings,
      since,
    );
    // Advance the cursor every run so windows don't overlap; only email on matches.
    await admin.from('saved_searches').update({ last_alerted_at: now.toISOString() }).eq('id', row.id);
    if (matches.length === 0 || !row.email) continue;

    totalMatches += matches.length;
    const result = await sendEmail(buildAlertEmail(row.email, row.label ?? '', row.path ?? '/properties', row.query_string ?? '', matches));
    if (result.delivered) emailed += 1;
  }

  return NextResponse.json({ ok: true, searches: (rows ?? []).length, matches: totalMatches, emailed });
}

function appBase(): string {
  return (process.env.NEXT_PUBLIC_APP_URL || 'https://proppd.com').replace(/\/$/, '');
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function buildAlertEmail(to: string, label: string, path: string, queryString: string, matches: Listing[]) {
  const base = appBase();
  const searchUrl = `${base}${savedSearchHref({ path: path as SavedSearchPath, queryString })}`;
  const top = matches.slice(0, 10);
  const count = matches.length;
  const noun = count === 1 ? 'home' : 'homes';

  const text = [
    'Hi,',
    '',
    `${count} new ${noun} match your saved Proppd search${label ? ` (${label})` : ''}:`,
    '',
    ...top.map((m) => `• ${m.title} — ${m.price} · ${m.suburb} — ${base}/property/${m.slug}`),
    '',
    `View your search: ${searchUrl}`,
    '',
    '— Proppd',
  ].join('\n');

  const items = top
    .map(
      (m) =>
        `<li style="margin:0 0 10px"><a href="${base}/property/${m.slug}" style="color:#4A3AFF;font-weight:700;text-decoration:none">${escapeHtml(m.title)}</a> — ${escapeHtml(m.price)} · ${escapeHtml(m.suburb)}</li>`,
    )
    .join('');

  const html = `
    <div style="font-family:Inter,Arial,sans-serif;color:#1A1A2E">
      <p>Hi,</p>
      <p><strong>${count} new ${noun}</strong> match your saved Proppd search${label ? ` (${escapeHtml(label)})` : ''}:</p>
      <ul style="padding-left:18px">${items}</ul>
      <p><a href="${searchUrl}" style="display:inline-block;background:#4A3AFF;color:#fff;font-weight:700;padding:10px 18px;border-radius:999px;text-decoration:none">View your search</a></p>
      <p style="color:#6B7280;font-size:12px">You're receiving this because you saved a search on Proppd.</p>
    </div>`;

  return { to, subject: `${count} new ${noun} for your Proppd search`, html, text };
}
