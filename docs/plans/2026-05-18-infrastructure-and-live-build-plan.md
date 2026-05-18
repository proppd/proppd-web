# Proppd Infrastructure and Live Build Plan

## Current verified state

- Domain: proppd.com
- A record: 148.251.55.130
- Nameservers: ns3.za-dns.com, ns5.za-dns.com
- Current HTTPS response: HTTP 200 from LiteSpeed/PHP 7.2.34
- Current public site content: directory index at `/`
- Local project workspace: `/home/voxi/proppd`
- Local git branch: `main`
- GitHub CLI installed but not authenticated on this machine
- Node/npm available locally
- Vercel CLI and Supabase CLI are not currently installed globally

## Build principle

Build live, but not recklessly. The public domain should never point at broken development work. Use a three-layer flow:

1. Local repo and commits for every meaningful change.
2. Vercel preview deployments for branch verification.
3. Production domain only after build/lint/smoke checks pass.

Because proppd.com currently shows a directory index, the first live action should be a reversible holding page or Vercel placeholder, then the full MVP.

## Recommended stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase Auth, Postgres, Storage
- PostgreSQL full-text search for MVP search
- Vercel for hosting and preview deployments
- Existing DNS provider/nameservers initially retained
- Existing cPanel hosting retained for email/DNS unless a better mail provider is chosen

## Accounts and ownership

Use `info@proppd.com` for Proppd-owned service accounts where possible:

- GitHub: preferably create a Proppd organization or repo under the existing Metavestor account with `info@proppd.com` as billing/contact email.
- Supabase: create a Proppd project/workspace using `info@proppd.com`.
- Vercel: create or use a Proppd team/account using `info@proppd.com`.
- Email provider: use `info@proppd.com` as the sender identity once DNS records are verified.

Human verification caveat:

- GitHub, Supabase, Vercel, and email providers may require OTP, CAPTCHA, or inbox confirmation.
- The agent can perform the setup steps, but any one-time verification code from `info@proppd.com` must be accessible during setup.
- Credentials and recovery details must be stored outside the repo.

## Infrastructure setup order

### Step 1: Secure the current live surface

Objective: remove the public directory index quickly and reversibly.

Actions:

1. Verify cPanel access.
2. Identify document root for proppd.com, likely `/home/proppd/public_html`.
3. Back up existing public root if any real files exist.
4. Deploy a temporary branded holding page:
   - headline: `Proppd is coming soon`
   - subtext: `Real listings. Real leads. Fair property technology.`
   - contact: `info@proppd.com`
5. Verify HTTPS loads the holding page.

This prevents the empty hosting account from looking abandoned while the full stack is built.

### Step 2: Create the source-of-truth GitHub repo

Preferred repo:

- `Metavestor/proppd` or `Metavestor/app.proppd.com`

Alternative if using a new organization:

- Org/account: `Proppd`
- Repo: `proppd-web`

Actions:

1. Authenticate GitHub CLI or browser session.
2. Create private repo first.
3. Push `/home/voxi/proppd` initial docs commit.
4. Add branch protection once CI exists.
5. Add deploy keys/tokens only where required.

Rules:

- No direct risky pushes to production without preview verification.
- Keep `main` deployable.
- Use feature branches for larger changes.

### Step 3: Scaffold and commit the app

Actions:

1. Scaffold Next.js in `/home/voxi/proppd`.
2. Add design system foundation.
3. Add placeholder pages for all public routes.
4. Add `.env.example` only; no real secrets.
5. Run lint/build locally.
6. Commit and push.

Initial route skeleton:

- `/`
- `/properties`
- `/properties/for-sale`
- `/properties/to-rent`
- `/property/[slug]`
- `/agents`
- `/agents/[slug]`
- `/agencies`
- `/agencies/[slug]`
- `/list-with-us`
- `/request-valuation`
- `/login`
- `/dashboard`
- `/admin`
- `/privacy`
- `/terms`
- `/cookies`

### Step 4: Set up Supabase

Actions:

1. Create Proppd Supabase project in the closest suitable region.
2. Save project URL and anon key into Vercel env vars and local `.env.local`.
3. Keep service role key server-only.
4. Create migrations for:
   - profiles
   - agencies
   - agents
   - property_types
   - locations
   - listings
   - listing_images
   - listing_features
   - leads
   - lead_events
   - saved_properties
   - admin_activity_logs
5. Add RLS policies before exposing dashboards.
6. Add seed data for demo listings and agents.
7. Verify schema live before wiring UI.

### Step 5: Set up Vercel

Actions:

1. Create Vercel project from GitHub repo.
2. Set framework to Next.js.
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL`
   - email provider vars when chosen
4. Deploy preview.
5. Run smoke tests against preview.
6. Only then attach `proppd.com` and `www.proppd.com`.

### Step 6: DNS cutover

Recommended production DNS:

- Apex `proppd.com`: Vercel A record, usually `76.76.21.21`
- `www.proppd.com`: CNAME to Vercel target, usually `cname.vercel-dns.com`

Email warning:

- Preserve MX, SPF, DKIM, and DMARC records for `info@proppd.com`.
- Do not replace nameservers unless mail/DNS is fully migrated.
- If cPanel hosts mailbox, only change web A/CNAME records, not MX.

### Step 7: Email and notifications

MVP needs:

- agent lead alert
- user enquiry confirmation
- suspicious lead admin notification

Recommended providers:

- Resend for transactional email if available and domain verification succeeds
- Postmark as a premium alternative
- SMTP from cPanel as temporary fallback only

DNS records needed:

- SPF
- DKIM
- DMARC
- provider-specific verification records

### Step 8: Build MVP in safe slices

Slice 1: Public marketing shell

- homepage
- header/footer
- trust/value sections
- list-with-us
- request-valuation
- legal pages

Slice 2: Listing foundation

- schema
- seed data
- listing cards
- search page
- listing detail page

Slice 3: Lead capture

- enquiry form
- POPIA consent
- metadata capture
- duplicate/spam flags
- lead notification stubs

Slice 4: Agent/agency public profiles

- directories
- profile pages
- active listings
- contact CTAs

Slice 5: Admin MVP

- login
- roles
- create/edit/approve listings
- image upload
- lead table
- export leads

Slice 6: Agent MVP

- agent dashboard
- profile editor
- listing management
- lead status/notes/quality flags

Slice 7: SEO launch layer

- listing metadata
- schema markup
- city landing pages
- sitemap
- robots.txt
- Open Graph images

### Step 9: Launch checklist

Before production cutover:

- `npm run lint` passes
- `npm run build` passes
- Supabase migrations applied
- RLS verified
- no service role key exposed client-side
- Vercel preview smoke-tested on mobile
- lead form creates a lead with metadata
- email notification path tested or safely logged
- legal pages live
- cookie notice live
- domain SSL active
- MX/email still working
- rollback deployment identified in Vercel

## What still needs to be set up

Critical:

- Access to `info@proppd.com` inbox for verification codes
- GitHub authentication or permission to create/use repo under Metavestor
- Supabase project/account
- Vercel project/account
- DNS edit access through cPanel/ZA-DNS
- Email provider decision

Recommended:

- Cloudflare account later for DNS/WAF/CDN, not required for MVP
- Monitoring/logging after first production deployment
- Analytics after public pages are stable

## Immediate next actions

1. Verify cPanel login and document root.
2. Replace the current directory index with a temporary holding page.
3. Authenticate GitHub and create the repo.
4. Scaffold Next.js and push to GitHub.
5. Create Supabase project and apply schema.
6. Create Vercel project and deploy preview.
7. Attach domain after preview verification.
