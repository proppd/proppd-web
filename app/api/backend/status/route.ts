import { NextResponse } from 'next/server';
import { loadPortalDiagnostics } from '../../../../lib/proppd/backend';

export const runtime = 'nodejs';

export async function GET() {
  const diagnostics = await loadPortalDiagnostics();
  return NextResponse.json({ ok: true, diagnostics }, { status: 200, headers: { 'cache-control': 'no-store' } });
}
