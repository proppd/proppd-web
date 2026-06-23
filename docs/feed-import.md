# Agency feed import

Bulk-import listings from an agency's existing feed (CSV, XML, or JSON) instead
of re-keying them by hand. This is how the portal scales inventory across many
agencies — the listing supply that makes a property marketplace viable.

## Endpoint

`POST /api/admin/listings/import` — super admins and agency admins only.

### Body

| Field            | Type      | Notes                                                                 |
| ---------------- | --------- | --------------------------------------------------------------------- |
| `content`        | string    | Raw feed text (CSV / XML / JSON). Use this **or** `records`.           |
| `records`        | object[]  | Pre-parsed records, if you parsed the feed elsewhere.                  |
| `format`         | string    | `csv` \| `xml` \| `json`. Auto-detected from `content` when omitted.   |
| `recordTag`      | string    | XML record element (e.g. `property`). Auto-detected when omitted.      |
| `source`         | string    | Feed name stored on each listing (e.g. `sakstons-propdata`).          |
| `defaultStatus`  | string    | Status when the feed has none. Defaults to `pending_review`.           |
| `targetAgencyId` | string    | Required when a super admin imports on behalf of an agency.            |
| `targetAgentId`  | string    | Optional agent assignment.                                             |
| `dryRun`         | boolean   | **Defaults to `true`** — preview without writing.                      |

### Flow

1. **Preview** with `dryRun: true` (the default). The response reports
   `summary` (`total` / `valid` / `invalid` / `duplicateRefs`) and per-row
   status + validation errors. Nothing is written.
2. **Commit** with `dryRun: false`. Valid rows are upserted; the response
   reports `created`, `updated`, `failed`, and per-row `errors`.

## Idempotent re-imports

Each listing's origin is tracked via `listings.source` and
`listings.external_ref` (migration `009_listing_import_sources.sql`). Rows that
carry an external reference are upserted by `(agency_id, external_ref)`, so
re-running a feed **updates** existing listings instead of duplicating them.
Rows without a reference are always inserted.

## Field mapping

Feeds use inconsistent names and value formats. The mapper
(`lib/import/mapping.ts`) resolves each listing field from a set of aliases and
normalises values:

- **Purpose** — `For Sale`, `To Let`, `Rental`, … → `sale` / `rent`.
- **Property type** — `Flat` → `apartment`, `Vacant Land` → `vacant-land`, etc.
- **Status** — `Active` → `available`, `Under Offer` → `under_offer`, etc.
- **Price** — `R 1 250 000`, `R1,250,000`, `1250000` → `1250000`.
- **Photos** — array or delimited string of image URLs (http(s) only).

Default aliases live in `DEFAULT_FIELD_ALIASES`; extend them there as new feed
shapes appear.

## Scheduled remote pulls

Instead of POSTing feed content each time, register an agency's feed **URL**
once and a cron re-syncs it on a cadence.

### Manage feeds — `/api/admin/feeds` (admins only)

- `GET /api/admin/feeds` — list feed sources (scoped to your agency; super
  admins see all).
- `POST /api/admin/feeds` — create one. Body: `name`, `url`, optional `format`,
  `recordTag`, `defaultStatus`, `frequencyMinutes` (15 min–30 days, default
  1440), `isActive`, and `agencyId` (required for super admins).
- `PATCH /api/admin/feeds/{id}` / `DELETE /api/admin/feeds/{id}` — update or
  remove.

Feed URLs must be public `http(s)` — localhost and private IP ranges are
rejected (SSRF guard in `lib/import/fetch.ts`).

### The cron — `/api/admin/feeds/sync`

Runs on the Vercel cron in `vercel.json` (`30 * * * *`) and is guarded by the
`CRON_SECRET` Authorization header (same scheme as saved-search alerts). Each
run:

1. loads active feed sources and selects those **due** by their
   `frequencyMinutes` (`isFeedSourceDue` in `lib/import/schedule.ts`);
2. fetches each due URL (timeout + 5MB cap), runs the import pipeline, and
   upserts valid rows via `importPortalListings`;
3. records `last_run_at` / `last_status` / `last_summary` on the feed source.

Pass `?force=1` to ignore intervals and pull every active feed immediately.

The cron runs hourly but each feed only pulls when its own interval has elapsed,
so daily feeds stay daily. Requires `CRON_SECRET`, `DATABASE_URL`, and (for the
feed table) migration `010_feed_sources.sql`.

## Modules

- `lib/import/csv.ts` — RFC 4180 CSV reader.
- `lib/import/xml.ts` — dependency-free XML reader + record extraction.
- `lib/import/feed.ts` — format detection + unified record parsing.
- `lib/import/mapping.ts` — field aliases + value normalisation.
- `lib/import/pipeline.ts` — parse → map → validate, with a dry-run preview.
- `lib/import/schedule.ts` — pure "is this feed due?" logic for the cron.
- `lib/import/fetch.ts` — safe remote feed fetch (SSRF guard, timeout, size cap).

The parse/map/validate pipeline is pure and covered by `tests/feed-import.test.ts`.
