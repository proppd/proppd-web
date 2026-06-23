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

## Modules

- `lib/import/csv.ts` — RFC 4180 CSV reader.
- `lib/import/xml.ts` — dependency-free XML reader + record extraction.
- `lib/import/feed.ts` — format detection + unified record parsing.
- `lib/import/mapping.ts` — field aliases + value normalisation.
- `lib/import/pipeline.ts` — parse → map → validate, with a dry-run preview.

The parse/map/validate pipeline is pure and covered by `tests/feed-import.test.ts`.
