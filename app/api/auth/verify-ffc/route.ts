import { NextResponse, type NextRequest } from 'next/server';
import { rateLimitPolicies, rateLimitRequest } from '@/lib/security/rate-limit';
import { rejectCrossOriginMutation } from '@/lib/security/request-guards';
import { verifyWithPPRA, normaliseFFC } from '@/lib/ppra/verification';

export const runtime = 'nodejs';

type VerifyFFCBody = {
  ffcNumber?: unknown;
  firstName?: unknown;
  lastName?: unknown;
  submittedName?: unknown;
};

export async function POST(request: NextRequest) {
  const rejected = rejectCrossOriginMutation(request);
  if (rejected) return rejected;

  const limited = rateLimitRequest(request, rateLimitPolicies.auth);
  if (limited) return limited;

  const body = (await request.json().catch(() => null)) as VerifyFFCBody | null;
  if (!body) {
    return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 });
  }

  const ffcNumber =
    typeof body.ffcNumber === 'string' ? body.ffcNumber.trim() : '';
  if (!ffcNumber || normaliseFFC(ffcNumber).length < 3) {
    return NextResponse.json(
      { ok: false, error: 'Enter a valid Fidelity Fund Certificate number.' },
      { status: 400 },
    );
  }

  const firstName =
    typeof body.firstName === 'string' ? body.firstName.trim() : undefined;
  const lastName =
    typeof body.lastName === 'string' ? body.lastName.trim() : undefined;
  const submittedName =
    typeof body.submittedName === 'string' ? body.submittedName.trim() : undefined;

  const result = await verifyWithPPRA({
    ffcNumber,
    firstName,
    lastName,
    submittedName,
  });

  return NextResponse.json({ ok: true, verification: result });
}
