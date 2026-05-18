# Proppd Dedicated Account Setup Plan

## Decision

Proppd infrastructure must be fully separated from existing projects.

Use project-owned accounts with `info@proppd.com` wherever possible:

- Dedicated GitHub account or organization
- Dedicated Vercel account/team
- Dedicated Supabase account/organization/project
- Dedicated transactional email sender/domain verification

Do not mix Proppd with CannaBuy, Sakstons, Dextier, OpenClaw, or any other existing project infrastructure.

## Important operating rule

The agent can perform the setup flow, but most providers require one or more human verification steps:

- inbox verification link/code
- CAPTCHA
- phone verification
- two-factor setup
- terms-of-service confirmation
- recovery email/phone setup

When those appear, pause and ask Voxi for the code/action. Do not invent recovery information or use another project’s identity.

## Account model

### GitHub

Preferred setup:

1. Create a dedicated GitHub user using `info@proppd.com`, for example `Proppd` or `proppd-sa` if available.
2. Create a private repo under that account:
   - `proppd-web` or `proppd`
3. Later, if needed, create a GitHub organization under the same email and transfer the repo into it.

Why this order:

- A direct user account is faster to create than an organization.
- The repo can still be transferred later.
- Keeps Proppd separate from Metavestor while avoiding early org/billing complexity.

Minimum repo settings:

- Private repo during build
- Default branch: `main`
- Issues enabled
- Wiki disabled
- Branch protection after CI exists
- No secrets committed

### Vercel

Preferred setup:

1. Create/sign into Vercel with `info@proppd.com`.
2. Connect the dedicated Proppd GitHub account/repo.
3. Create Vercel project: `proppd-web`.
4. Add environment variables per environment:
   - Production
   - Preview
   - Development
5. Keep `proppd.com` and `www.proppd.com` unassigned until preview passes.

Production domain attach only after:

- build passes
- preview smoke test passes
- Supabase env vars are present
- legal pages exist
- lead form path is safe

### Supabase

Preferred setup:

1. Create/sign into Supabase with `info@proppd.com`.
2. Create organization/workspace: `Proppd`.
3. Create project: `proppd-prod`.
4. Use a strong generated database password stored outside git.
5. Apply migrations from repo.
6. Enable RLS before exposing dashboards.

Recommended later environments:

- `proppd-prod`
- `proppd-staging` once MVP stabilizes

For MVP speed, one Supabase project plus local development is acceptable, as long as production keys are isolated and protected.

### Email

`info@proppd.com` is needed for:

- provider account verification
- transactional sender verification
- user/admin notifications
- recovery contact

Before account creation, verify inbox access. If the mailbox does not exist yet, create it in cPanel.

Recommended transactional provider:

1. Resend if signup/domain verification is available.
2. Postmark if higher deliverability is needed.
3. cPanel SMTP as temporary fallback only.

DNS records to preserve/add:

- Preserve existing MX records for `info@proppd.com`.
- Add SPF/DKIM/DMARC records required by email provider.
- Do not switch nameservers until email is confirmed safe.

## Live setup sequence

### Step 1: Verify mailbox

- Log into cPanel.
- Confirm `info@proppd.com` mailbox exists.
- If not, create it.
- Confirm webmail access.

### Step 2: Replace directory index

- Deploy temporary holding page to current cPanel web root.
- Verify https://proppd.com no longer shows `Index of /`.

### Step 3: Create GitHub account/repo

- Register with `info@proppd.com`.
- Complete email verification.
- Create private repo.
- Push `/home/voxi/proppd`.

### Step 4: Create Supabase account/project

- Register with `info@proppd.com`.
- Complete verification.
- Create `Proppd` workspace/project.
- Store env vars locally and in Vercel only.

### Step 5: Create Vercel account/project

- Register with `info@proppd.com`.
- Complete verification.
- Connect GitHub repo.
- Deploy preview.

### Step 6: DNS/domain cutover

- Keep DNS hosted where it is for now.
- Preserve mail records.
- Point only web records to Vercel once preview passes:
  - `proppd.com`
  - `www.proppd.com`

## What must not happen

- Do not use Metavestor GitHub unless explicitly used only as temporary admin access.
- Do not use an existing Vercel team from another project.
- Do not use an existing Supabase project from another product.
- Do not put cPanel, GitHub, Supabase, Vercel, or email credentials in the repo.
- Do not point production DNS at Vercel before preview verification.
