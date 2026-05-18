# Proppd Property Portal MVP Brief

## Project

Proppd is a modern South African real estate portal for agents, agencies, buyers, tenants, landlords, and sellers.

Domain: proppd.com

## Product Vision

Build a fairer property experience with real listings, verified enquiries, and modern property professionals.

Long term, Proppd becomes an AI-powered operating system for real estate agents: CRM, verified leads, marketing automation, WhatsApp tools, valuations, and workflow automation.

## Phase 1 MVP Goal

Build a clean, fast, mobile-first property portal where users can:

- search properties for sale and rent
- view detailed listing pages
- enquire directly with agents
- browse agents and agencies
- submit property listing requests
- allow agents/admins to upload and manage listings
- capture verified, high-quality leads

The MVP must be structured so future agent tools can be added without rebuilding the platform.

## Target Users

1. Property seekers: buyers and tenants looking for homes, apartments, land, commercial property, or rentals.
2. Estate agents: agents wanting affordable exposure, quality leads, and future AI tools.
3. Agencies: companies needing multiple agent profiles and listings.
4. Sellers and landlords: owners wanting valuation, listing, or agent connection.

## Positioning

Core line:

> Real listings. Real leads. Fair property technology.

Hero copy:

> Find property without the noise.

Subtext:

> Proppd connects South Africans with real listings, verified enquiries, and modern property professionals.

Primary CTA: Search Properties
Secondary CTA: List With Proppd

Values:

- no fake leads
- fair pricing
- modern tools
- agent-first
- buyer-friendly
- simple, fast, trustworthy

## MVP Scope

### Public Homepage

- hero section
- location search
- buy/rent toggle
- featured listings
- featured agents/agencies
- agent list CTA
- seller valuation CTA
- explanation of why Proppd is different

### Property Search

Filters:

- buy or rent
- location
- property type
- minimum price
- maximum price
- bedrooms
- bathrooms
- parking
- erf size
- floor size
- listing date
- agency
- agent
- status: available, under offer, sold, rented

Property types:

- house
- apartment
- townhouse
- vacant land
- farm
- commercial
- industrial
- office
- retail
- development
- room/share

Search requirements:

- grid view
- list view
- map-ready structure
- pagination or infinite scroll
- SEO-friendly URLs

URL examples:

- /properties/for-sale/cape-town
- /properties/to-rent/johannesburg
- /property/modern-3-bedroom-house-in-sandton-12345

### Property Listing Page

Each listing includes:

- title
- location
- price
- image gallery
- description
- bedrooms
- bathrooms
- garages/parking
- erf size
- floor size
- rates and taxes
- levies
- availability date for rentals
- pet-friendly indicator
- furnished indicator
- property features
- map/location section
- agent profile card
- enquiry form
- WhatsApp enquiry button
- share button
- save/favourite button if accounts are included

Lead form fields:

- name
- surname
- email
- phone number
- message
- enquiry intent: viewing, more info, valuation, finance
- POPIA/privacy consent checkbox

Lead metadata:

- listing ID
- agent ID
- agency ID
- source page
- timestamp
- IP/device/browser
- enquiry type

### Agent Profiles

- photo
- name
- agency
- phone
- WhatsApp button
- email/contact form
- bio
- areas served
- active listings
- sold/rented listings if available
- verification badge if approved

URL example: /agents/john-smith

### Agency Profiles

- logo
- agency name
- branch details
- contact details
- office location
- agent list
- active listings
- about section

URL example: /agencies/sakstons-property

### Admin Dashboard

Admin users can:

- create/edit/approve/remove listings
- upload images
- assign listings to agents/agencies
- manage agents
- manage agencies
- view enquiries
- export leads
- mark leads as spam/fake/valid
- manage featured listings
- manage homepage content
- view basic analytics

Roles:

- Super Admin
- Agency Admin
- Agent

### Agent Dashboard

Agents can:

- log in
- manage profile
- add/edit listings subject to approval
- view leads
- update listing status
- view basic listing performance

Lead statuses:

- new
- contacted
- viewing booked
- qualified
- not interested
- fake/spam
- converted

### Lead Verification MVP

Minimum:

- phone validation
- email validation
- duplicate enquiry detection
- spam keyword detection
- suspicious enquiry flagging
- admin fake-lead marking
- agent lead quality feedback

Future-ready:

- OTP verification
- AI lead scoring
- WhatsApp verification
- buyer intent scoring
- duplicate cross-platform detection

## Technical Direction

Recommended stack:

- Next.js App Router
- React
- Tailwind CSS
- Supabase Auth/Postgres/Storage
- PostgreSQL full-text search for MVP
- future upgrade path to Meilisearch, Typesense, Algolia, or Elasticsearch

Core pages:

- /
- /properties
- /properties/for-sale
- /properties/to-rent
- /property/[slug]
- /agents
- /agents/[slug]
- /agencies
- /agencies/[slug]
- /list-with-us
- /request-valuation
- /login
- /dashboard
- /admin

Core data objects:

- users
- agents
- agencies
- listings
- listing_images
- listing_features
- property_types
- locations
- leads
- lead_statuses
- saved_properties
- enquiries
- admin_activity_logs
- subscriptions, future
- ai_tasks, future

## SEO Requirements

Each listing generates:

- SEO title
- meta description
- Open Graph image
- canonical URL
- structured data/schema markup

Important landing pages:

- Property for sale in Cape Town
- Property to rent in Cape Town
- Property for sale in Johannesburg
- Property to rent in Johannesburg
- Estate agents in Cape Town
- Estate agents in Johannesburg

## Compliance and Trust

Include:

- Privacy Policy
- Terms of Use
- POPIA consent checkbox
- cookie notice
- agent verification process
- report listing button
- listing moderation

## Future Phases

Phase 2: CRM, AI listing writer, AI social generator, brochures, seller reports, lead scoring, WhatsApp inbox, follow-up automation.

Phase 3: subscriptions, agency plans, featured listings, verified leads, AI subscriptions, developer listings, mortgage/bond referrals, attorney/referral marketplace.

Phase 4: AI assistant for agents, automated lead qualification, valuation assistant, smart seller updates, market reports, call/WhatsApp summaries, workflow automation.

## MVP Success Criteria

- listings can be uploaded and searched easily
- agents can receive and manage enquiries
- users can find properties quickly
- site feels trustworthy and modern
- leads are captured cleanly
- admin can control listings and users
- architecture can support future agent tools
