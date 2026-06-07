# Proppd Redesign — Zoopla + Zillow Alignment

## Shared Commercial Platform DNA

### What both Zoopla and Zillow do identically:
1. **Search-first hero** — White/clean background, prominent search bar is THE focal point
2. **Flat, utilitarian cards** — Thin borders, no heavy shadows, no rounded corners past 12px
3. **Minimal decoration** — Zero glassmorphism, zero gradient blobs, zero sparkle icons
4. **Professional color restraint** — One primary + one accent, everything else neutral
5. **White/near-white backgrounds** — No colored hero sections, no gradient overlays
6. **Tab-based property type selector** — Buy | Rent | Sell tabs above search
7. **Clear price display** — Bold price, subtle location, bed/bath/parking icons
8. **Organized footer** — Column-based link groups, clean copyright

### Color System Alignment

#### Zillow palette:
- Primary: `#006AFF` (bright blue)
- Supporting: `#111116` (near-black), white, grays
- Accent: Purple for saved/rental differentiation

#### Zoopla palette:
- Primary: `#6B3FA0` (signature purple)
- Supporting: `#3D2066` (dark purple), white, grays
- Accent: Bright purple for CTAs

#### Proposed Proppd palette (blended):
- **Primary:** `#4A3AFF` — A rich indigo that bridges Zoopla's purple warmth + Zillow's blue trust
- **Dark:** `#1A1A2E` — Softer than current navy, more modern
- **Accent:** `#00C9A7` — Clean teal retained for verified/trust signals
- **Background:** `#FFFFFF` — Pure white, no gradients
- **Surface:** `#F7F8FA` — Subtle off-white for sections
- **Text:** `#1A1A2E` primary, `#6B7280` secondary
- **Border:** `#E5E7EB` — Light, subtle

### Component Changes

#### 1. Hero (biggest change)
**Before:** Gradient background with radial blobs, glassmorphism search card, decorative elements
**After:** Clean white section, large headline, prominent search bar on white card, minimal tabs

#### 2. Header
**Before:** Sticky with heavy borders, multiple CTAs, complex mobile layout
**After:** Clean white, logo left, nav center/right, minimal CTAs — Zoopla style

#### 3. Listing Cards
**Before:** Rounded-2xl, heavy shadows, gradient overlays, glassmorphism save button
**After:** Rounded-lg, thin border, flat layout, clear price/beds/baths — Zillow style

#### 4. Trust/Stats Section
**Before:** Complex grid with stat cards, sidebar CTA, nested sub-cards
**After:** Simple horizontal strip with 3-4 key metrics — Zoopla style

#### 5. Featured Agents
**Before:** Complex dual-panel with card grid + sidebar
**After:** Clean horizontal scroll or simple grid — Zillow agent cards style

#### 6. Support/Value Props
**Before:** Glassmorphism container, multiple nested cards, gradient backgrounds
**After:** Simple section with clean cards or icon grid — either platform style

#### 7. Footer
**Before:** Over-styled with gradient text, complex grid
**After:** Clean column layout matching both platforms

### Files to modify:
1. `app/globals.css` — Color system, remove decorative utilities
2. `app/page.tsx` — Page structure
3. `components/site/header.tsx` — Header redesign
4. `components/site/footer.tsx` — Footer cleanup
5. `components/home/hero-search.tsx` — Major hero overhaul
6. `components/home/featured-listings.tsx` — Section cleanup
7. `components/home/featured-agents.tsx` — Simplify
8. `components/home/home-trust-strip.tsx` — Simplify
9. `components/home/support-strip.tsx` — Simplify
10. `components/home/value-props.tsx` — Simplify
11. `components/home/market-pulse.tsx` — Simplify
12. `components/properties/listing-card.tsx` — Card redesign
13. `components/site/logo.tsx` — Potentially update
14. `app/layout.tsx` — Minor cleanup
