# Proppd Property Portal MVP Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Build Proppd Phase 1 as a fast, mobile-first South African property portal with listings, search, agent/agency profiles, enquiry capture, and admin/agent workflows.

**Architecture:** Use a portal-first architecture with strong data foundations for future AgentOS features. Start with a Next.js App Router application backed by Supabase Auth, Postgres, Row Level Security, and Storage. Keep AI/CRM/subscription features out of Phase 1 UI, but model the core objects cleanly so they can be added later.

**Tech Stack:** Next.js, TypeScript, React, Tailwind CSS, Supabase Auth/Postgres/Storage, PostgreSQL full-text search, server actions/API routes, email provider to be selected.

---

## Phase 0: Bootstrap and Repo Hygiene

### Task 1: Scaffold the Next.js app

**Objective:** Create the base Next.js application in `/home/voxi/proppd`.

**Files:**
- Create: `package.json`
- Create: `next.config.ts`
- Create: `tsconfig.json`
- Create: `app/layout.tsx`
- Create: `app/page.tsx`
- Create: `app/globals.css`

**Steps:**
1. Run `npx create-next-app@latest . --ts --tailwind --eslint --app --src-dir false --import-alias "@/*"` from `/home/voxi/proppd`.
2. Confirm it does not overwrite `docs/product-brief.md` or this plan.
3. Run `npm run lint`.
4. Run `npm run build`.
5. Commit: `chore: scaffold proppd next app`.

### Task 2: Add baseline environment and secret hygiene

**Objective:** Prepare environment files without committing secrets.

**Files:**
- Create: `.env.example`
- Create: `.gitignore` if not generated
- Modify: `README.md`

**Steps:**
1. Add public Supabase URL/key placeholders to `.env.example`.
2. Add server-only placeholders for service role key, email provider key, and app URL.
3. Ensure `.env.local` is ignored.
4. Document local setup in `README.md`.
5. Commit: `docs: add environment setup`.

## Phase 1: Data Model and Supabase Foundation

### Task 3: Create database schema migration

**Objective:** Define core portal tables with future-ready fields.

**Files:**
- Create: `supabase/migrations/001_initial_schema.sql`

**Tables:**
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

**Steps:**
1. Define enums for listing purpose, listing status, role, lead status, lead quality, property type category.
2. Create tables with UUID primary keys.
3. Add foreign keys for agents/agencies/listings/leads.
4. Add created_at/updated_at timestamps.
5. Add indexes for location, price, bedrooms, bathrooms, property type, status, agency, agent, slug.
6. Add `search_vector` generated column or trigger for listings.
7. Commit: `feat: add initial property portal schema`.

### Task 4: Add RLS policies

**Objective:** Secure data access for public visitors, agents, agency admins, and super admins.

**Files:**
- Create: `supabase/migrations/002_rls_policies.sql`

**Steps:**
1. Public can read approved/available public listings, public agent profiles, public agency profiles.
2. Agents can manage their own profile and draft listings.
3. Agency admins can manage their agency agents/listings.
4. Super admins can manage all records.
5. Leads are insertable by public forms but readable only by assigned agent/agency/admin.
6. Commit: `feat: add portal rls policies`.

### Task 5: Add seed data

**Objective:** Provide realistic South African demo content for local and preview testing.

**Files:**
- Create: `supabase/seed.sql`

**Steps:**
1. Add initial property types.
2. Add sample Cape Town/Johannesburg/Pretoria/Durban locations.
3. Add demo agency, demo agents, and sample listings.
4. Add sample listing images with placeholder URLs.
5. Commit: `chore: add demo portal seed data`.

## Phase 2: Design System and Public Shell

### Task 6: Define brand tokens and layout primitives

**Objective:** Establish a premium, clean, tech-forward UI foundation.

**Files:**
- Modify: `app/globals.css`
- Modify: `tailwind.config.ts`
- Create: `components/ui/button.tsx`
- Create: `components/ui/input.tsx`
- Create: `components/ui/card.tsx`
- Create: `components/site/header.tsx`
- Create: `components/site/footer.tsx`

**Design direction:** Airbnb clarity, Linear polish, Stripe trust. Avoid clutter, cheesy house logos, and old-school property portal styling.

**Steps:**
1. Add neutral palette with a distinctive Proppd accent.
2. Add reusable Button/Input/Card primitives.
3. Add responsive header with nav links.
4. Add footer with trust/compliance links.
5. Verify mobile layout.
6. Commit: `feat: add proppd design foundation`.

### Task 7: Build homepage

**Objective:** Create a conversion-focused public homepage.

**Files:**
- Modify: `app/page.tsx`
- Create: `components/home/hero-search.tsx`
- Create: `components/home/featured-listings.tsx`
- Create: `components/home/featured-agents.tsx`
- Create: `components/home/value-props.tsx`
- Create: `components/home/agent-cta.tsx`

**Steps:**
1. Add hero: “Find property without the noise.”
2. Add subtext and buy/rent location search.
3. Add featured listings section.
4. Add featured agents/agencies section.
5. Add “Why Proppd is different” trust section.
6. Add CTAs for Search Properties, List With Proppd, and Request Valuation.
7. Commit: `feat: build homepage`.

## Phase 3: Listing Search and Listing Pages

### Task 8: Implement listing query layer

**Objective:** Add typed server-side data access for property search.

**Files:**
- Create: `lib/supabase/server.ts`
- Create: `lib/listings/types.ts`
- Create: `lib/listings/queries.ts`
- Create: `lib/listings/filters.ts`

**Steps:**
1. Create Supabase server client helper.
2. Define TypeScript types for listing cards and listing details.
3. Implement filter parser for URL search params.
4. Implement listing search query with pagination.
5. Commit: `feat: add listing query layer`.

### Task 9: Build property search pages

**Objective:** Let users browse and filter listings.

**Files:**
- Create: `app/properties/page.tsx`
- Create: `app/properties/for-sale/page.tsx`
- Create: `app/properties/to-rent/page.tsx`
- Create: `components/properties/search-filters.tsx`
- Create: `components/properties/listing-card.tsx`
- Create: `components/properties/listing-grid.tsx`
- Create: `components/properties/view-toggle.tsx`

**Steps:**
1. Add grid/list-ready results layout.
2. Add filters for purpose, location, type, price, bedrooms, bathrooms, parking, size, agency, agent, status.
3. Preserve filters in SEO-friendly URLs/search params.
4. Add empty state and loading state.
5. Commit: `feat: build property search pages`.

### Task 10: Build listing detail page

**Objective:** Show complete listing information and enquiry options.

**Files:**
- Create: `app/property/[slug]/page.tsx`
- Create: `components/property/image-gallery.tsx`
- Create: `components/property/property-facts.tsx`
- Create: `components/property/agent-card.tsx`
- Create: `components/property/enquiry-form.tsx`
- Create: `components/property/share-save-actions.tsx`

**Steps:**
1. Fetch listing by slug.
2. Render gallery, title, price, location, facts, description, features, fees, availability.
3. Add map-ready location section.
4. Add agent card and WhatsApp link.
5. Add enquiry form with POPIA consent.
6. Add listing schema markup and metadata.
7. Commit: `feat: build listing detail page`.

## Phase 4: Leads and Lead Quality

### Task 11: Implement enquiry submission

**Objective:** Capture listing enquiries with validation and metadata.

**Files:**
- Create: `app/actions/create-lead.ts`
- Create: `lib/leads/validation.ts`
- Create: `lib/leads/spam.ts`
- Modify: `components/property/enquiry-form.tsx`

**Steps:**
1. Validate name, surname, email, phone, message, intent, POPIA consent.
2. Capture listing_id, agent_id, agency_id, source page, timestamp, IP/device/browser, enquiry type.
3. Add duplicate detection for same listing/email/phone window.
4. Add basic spam keyword detection.
5. Store lead status and lead quality flag.
6. Return clear success/error states.
7. Commit: `feat: capture verified listing enquiries`.

### Task 12: Add lead notification hooks

**Objective:** Prepare email notifications for agents and users.

**Files:**
- Create: `lib/notifications/email.ts`
- Create: `lib/notifications/templates/lead-agent.ts`
- Create: `lib/notifications/templates/lead-user.ts`

**Steps:**
1. Define provider-neutral email function.
2. Add templates for agent alert and user confirmation.
3. Keep provider implementation behind env vars.
4. Log notification events for now if provider not configured.
5. Commit: `feat: add lead notification layer`.

## Phase 5: Agent and Agency Public Pages

### Task 13: Build agent directory and profiles

**Objective:** Let users browse agents and view agent listings.

**Files:**
- Create: `app/agents/page.tsx`
- Create: `app/agents/[slug]/page.tsx`
- Create: `components/agents/agent-card.tsx`
- Create: `components/agents/agent-profile-header.tsx`

**Steps:**
1. Add agent directory with search/filter by area/agency.
2. Add profile page with photo, bio, contact, areas, verification badge.
3. Show active listings and sold/rented if available.
4. Add metadata and canonical URLs.
5. Commit: `feat: build agent profiles`.

### Task 14: Build agency directory and profiles

**Objective:** Let users browse agencies and branch profiles.

**Files:**
- Create: `app/agencies/page.tsx`
- Create: `app/agencies/[slug]/page.tsx`
- Create: `components/agencies/agency-card.tsx`
- Create: `components/agencies/agency-profile-header.tsx`

**Steps:**
1. Add agency directory.
2. Add profile page with logo, branch details, contact, office, about.
3. Show agents and active listings.
4. Add metadata and canonical URLs.
5. Commit: `feat: build agency profiles`.

## Phase 6: Auth, Admin, and Agent Dashboard

### Task 15: Add authentication shell

**Objective:** Enable login and protected dashboard areas.

**Files:**
- Create: `app/login/page.tsx`
- Create: `app/auth/callback/route.ts`
- Create: `middleware.ts`
- Create: `lib/auth/roles.ts`

**Steps:**
1. Add Supabase auth login page.
2. Add auth callback route.
3. Add middleware for dashboard/admin route protection.
4. Add role helpers for Super Admin, Agency Admin, Agent.
5. Commit: `feat: add auth shell`.

### Task 16: Build admin listing management

**Objective:** Allow admins to create, edit, approve, feature, and remove listings.

**Files:**
- Create: `app/admin/page.tsx`
- Create: `app/admin/listings/page.tsx`
- Create: `app/admin/listings/new/page.tsx`
- Create: `app/admin/listings/[id]/edit/page.tsx`
- Create: `components/admin/listing-form.tsx`
- Create: `app/actions/admin-listings.ts`

**Steps:**
1. Add admin listings table.
2. Add listing create/edit form.
3. Support assignment to agent/agency.
4. Support listing images, cover image, ordering metadata.
5. Support approve/remove/feature/status actions.
6. Log admin activity.
7. Commit: `feat: add admin listing management`.

### Task 17: Build agent dashboard

**Objective:** Let agents manage profile, listings, and leads.

**Files:**
- Create: `app/dashboard/page.tsx`
- Create: `app/dashboard/profile/page.tsx`
- Create: `app/dashboard/listings/page.tsx`
- Create: `app/dashboard/leads/page.tsx`
- Create: `components/dashboard/lead-table.tsx`
- Create: `app/actions/agent-dashboard.ts`

**Steps:**
1. Add dashboard overview.
2. Add profile editor.
3. Add listings table with status update actions.
4. Add leads table with status, notes, quality flag.
5. Restrict data to the logged-in agent/agency.
6. Commit: `feat: add agent dashboard`.

## Phase 7: SEO, Compliance, and Trust

### Task 18: Add SEO landing pages

**Objective:** Create indexable location landing pages.

**Files:**
- Create: `app/properties/for-sale/[location]/page.tsx`
- Create: `app/properties/to-rent/[location]/page.tsx`
- Create: `app/estate-agents/[location]/page.tsx`

**Steps:**
1. Generate metadata for sale/rent/agents pages.
2. Reuse listing and agent query layers.
3. Add internal links to major city pages.
4. Commit: `feat: add seo property landing pages`.

### Task 19: Add legal and trust pages

**Objective:** Include required POPIA and platform trust content.

**Files:**
- Create: `app/privacy/page.tsx`
- Create: `app/terms/page.tsx`
- Create: `app/cookies/page.tsx`
- Create: `components/site/cookie-notice.tsx`
- Create: `components/property/report-listing.tsx`

**Steps:**
1. Add Privacy Policy page with POPIA language.
2. Add Terms of Use.
3. Add cookie notice.
4. Add report listing action stub.
5. Commit: `feat: add compliance and trust pages`.

## Phase 8: Quality Gates and Launch Prep

### Task 20: Add tests for core flows

**Objective:** Protect search, listing detail, and lead capture.

**Files:**
- Create: `tests/listing-filters.test.ts`
- Create: `tests/lead-validation.test.ts`
- Create: `tests/spam-detection.test.ts`

**Steps:**
1. Add unit tests for filter parsing.
2. Add unit tests for lead validation.
3. Add unit tests for duplicate/spam flags.
4. Run `npm test`.
5. Commit: `test: cover listing filters and lead validation`.

### Task 21: Add launch checklist

**Objective:** Make production deployment safe and rollback-friendly.

**Files:**
- Create: `docs/launch-checklist.md`

**Steps:**
1. Add environment variable checklist.
2. Add Supabase migration checklist.
3. Add DNS/domain checklist for proppd.com.
4. Add cPanel/static bridge note if needed.
5. Add rollback plan.
6. Commit: `docs: add launch checklist`.

## Acceptance Criteria

The MVP is ready when:

- users can search sale/rental listings quickly on mobile
- listing pages render rich data, images, agent card, enquiry form, WhatsApp link, and SEO metadata
- leads are stored with listing/agent/agency/source/device metadata
- duplicate/spam/suspicious leads are flagged
- agents and agencies have public profiles
- admins can create/edit/approve/remove/feature listings
- agents can manage their profile, listings, and leads
- legal pages and POPIA consent are present
- the codebase has a clean path to future CRM, AI tools, subscriptions, and WhatsApp automation
