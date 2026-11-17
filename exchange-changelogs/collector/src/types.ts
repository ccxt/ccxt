// Shared contract for the exchange-changelogs collector, its registry files and the
// feed files consumed by docs.ccxt.com (docs/website/src/lib/exchange-changelogs.ts).
// Changing anything here is a schema change: bump SCHEMA_VERSION and update both sides.

export const SCHEMA_VERSION = 1 as const;

export type VenueKind = 'exchange' | 'prediction';

// ---------------------------------------------------------------------------
// Registry: one JSON file per venue under registry/<kind>/<id>.json
// ---------------------------------------------------------------------------

export interface VenueConfig {
    id: string;                 // ccxt id, e.g. "bybit" (prediction: ts/src/prediction/<id>.ts)
    kind: VenueKind;
    name: string;               // display name, e.g. "Bybit"
    subclasses?: string[];      // ccxt ids that inherit this venue's changes (bybiteu, bybitid)
    domains: string[];          // hostnames entry links may point to; anything else is rewritten to the source link
    sources: SourceConfig[];    // may be empty only with `unmonitored`, or when another venue's source is sharedWith this one
    unmonitored?: string;       // reason the venue has no monitorable source ("no public changelog, docs behind login");
                                // requires "sources": []; shown on docs.ccxt.com as "not monitored: <reason>"
}

export type SourceType = 'rss' | 'md' | 'html' | 'json' | 'hash' | 'spec' | 'gh-commits';

export type SpecFormat = 'openapi' | 'postman' | 'asyncapi' | 'redoc';

export interface SourceConfig {
    id: string;                 // globally unique, "<venue>-<slug>", e.g. "bybit-v5"
    type: SourceType;
    url: string;                // what the collector fetches (raw.githubusercontent.com for GitHub files);
                                // may contain {yyyy} and {mm} (UTC month) for month-partitioned changelogs.
                                // gh-commits: optional in the registry file, filled from repo/ref/path on load
    link?: string;              // human-facing page for this source (defaults to url; same placeholders)
    months?: number;            // url with {yyyy}/{mm}: fetch the current month and the previous months-1 (default 2)
    discover?: {                // url changes per deploy (hashed bundle): fetch discover.url, take the first
        url: string;            // capture group of `pattern` as the (absolute or relative) url and fetch that
        pattern: string;        // instead of `url` (then `url` only records the last known value; not fetched)
    };
    role?: 'primary' | 'secondary';   // default primary
    scope?: string;             // free text shown in the UI: "spot", "derivatives", "websocket", "all"
    headers?: Record<string, string>;
    sharedWith?: string[];      // other venues whose changelog this also is (kraken -> krakenfutures):
                                // "id" (same kind first, then the other kind) or "kind/id"
    expectBlocked?: string;     // known reason this source cannot be fetched from a datacenter (shown as degraded, not alerted)
    // ---- extraction ----
    slice?: {
        from?: string;          // md: regex; content starts at the first matching line (inclusive)
        to?: string;            // md: regex; content ends before the first matching line after `from`
        selector?: string;      // html/hash: CSS selector of the container holding the changelog
    };
    split?: {
        heading?: string;       // md: regex matched against heading lines (e.g. "^#{2,3}\\s+"); html: CSS selector list of entry headings (e.g. "h2, h3")
        item?: string;          // html: CSS selector for row-style changelogs (each match is one entry, e.g. "table tbody tr")
    };
    date?: {
        from?: 'title' | 'body' | 'pubDate' | 'anchor';   // where the entry date lives (rss default pubDate, others default title then body)
        pattern?: string;       // regex with one capture group holding the date text
        order?: 'ymd' | 'mdy' | 'dmy';                     // disambiguates numeric dates like 03/04/2026
    };
    titleFilter?: string;       // regex: keep only entries whose title (or rss category) matches
    excludeFilter?: string;     // regex: drop entries whose title matches
    section?: string;           // regex (case-insensitive) on the text of headings inside an entry body: the body is
                                // cut to the matching sections and entries without one are dropped ("^API$")
    mapper?: string;            // json: name of a mapper in src/mappers/<name>.ts turning the response into RawEntry[]
                                // (receives the parsed JSON, or undefined when the body is not JSON, plus the raw text)
    strip?: string[];           // html/hash: CSS selectors removed before extraction/hashing
    minEntries?: number;        // fewer parsed entries than this = parser drift -> source failure
                                // (default 1; 0 for hash, spec and gh-commits)
    minChange?: number;         // hash: an entry needs at least this many characters of added (or removed) text
                                // (default 40); smaller changes only update the snapshot
    specFormat?: SpecFormat;    // spec: document format (default: auto-detect openapi/swagger, postman, asyncapi,
                                // redoc HTML with __redoc_state)
    repo?: string;              // gh-commits: "owner/name"
    ref?: string;               // gh-commits: branch, tag or sha (default: the repository's default branch)
    path?: string;              // gh-commits: only commits touching this file or directory
}

// What an adapter returns, before ids/dates/merging.
export interface RawEntry {
    title: string;
    body: string;               // plain text / light markdown, no raw HTML
    dateText?: string;          // date as found on the page
    anchor?: string;            // in-page anchor id, if any
    link?: string;              // absolute URL for the entry, if the source has one
    guid?: string;              // stable id from the source (rss guid), if any
}

// ---------------------------------------------------------------------------
// Entries (data/entries/<kind>/<id>.jsonl and the feed files)
// ---------------------------------------------------------------------------

export type CcxtStatus = 'new' | 'issue-open' | 'pr' | 'no-action' | 'fixed';

export interface ChangelogEntry {
    schemaVersion: typeof SCHEMA_VERSION;
    id: string;                 // sha256 hex of `${sourceId}|${guid ?? (date + '|' + normalizedTitle)}`; date is never
                                // read from the body; keys shared within a run get `|b:<hash of body start>` except
                                // the bottom-most one (see entries.ts assignKeys)
    kind: VenueKind;
    exchange: string;           // venue id
    affects: string[];          // exchange + subclasses + sharedWith venues (+ their subclasses)
    source: string;             // SourceConfig.id
    sourceType: SourceType;
    sourceLink: string;         // SourceConfig.link ?? url
    scope?: string;
    title: string;              // plain text, <= 200 chars
    excerpt: string;            // plain text, <= 500 chars
    body?: string;              // light markdown, <= 4000 chars (per-venue files only, never latest.json)
    url: string;                // https link on a registry domain (else sourceLink)
    publishedAt: string | null; // YYYY-MM-DD the venue dated the entry
    effectiveDate?: string;     // YYYY-MM-DD when a "effective"/"release"/future date is stated
    dateKind: 'published' | 'effective' | 'firstSeen';
    firstSeen: string;          // ISO timestamp the collector first saw it
    lastSeen: string;
    hash: string;               // sha256 of normalized title+body; changes -> revisions[]
    revisions?: { at: string; hash: string }[];
    removedAt?: string;         // gone from the source for >= 3 successful runs
    backfill: boolean;          // seen on the source's first run (or mass-new guard)
    tags: string[];             // rule tags, see src/tags.ts
    ccxt: { status: CcxtStatus; issue?: number; pr?: number };
}

// ---------------------------------------------------------------------------
// Feed files written to data/feed/ (this is what docs.ccxt.com reads)
// ---------------------------------------------------------------------------

export interface FeedEntry extends Omit<ChangelogEntry, 'body' | 'revisions'> {}

export interface VenueSummary {
    id: string;
    kind: VenueKind;
    name: string;
    subclasses: string[];
    domains: string[];          // registry domains: hosts entry links may point to
    sources: number;            // own sources + other venues' sources shared with this venue
    healthy: number;            // of those, sources whose last run succeeded
    latestDate: string | null;  // newest publishedAt/effectiveDate across its entries
    entryCount: number;         // entries in the per-venue file
    unmonitored?: string;       // VenueConfig.unmonitored: reason nothing is watched for this venue
}

// feed/latest.json — entries whose coalesce(effectiveDate, publishedAt) is within windowDays
// (or, for undated entries, whose firstSeen is within windowDays and backfill === false).
// Sorted newest first. Must stay under 1.5 MB.
export interface LatestFeed {
    schemaVersion: typeof SCHEMA_VERSION;
    generatedAt: string;
    windowDays: number;
    entries: FeedEntry[];
    venues: VenueSummary[];
}

// feed/<kind>/<id>.json — one venue, entries from the last 365 days (same undated rule as latest.json, no
// removedAt entries), with bodies, oldest trimmed beyond 1.5 MB. Includes the
// entries of other venues' sources whose sharedWith resolves to this venue (kraken -> krakenfutures).
export interface VenueFeed {
    schemaVersion: typeof SCHEMA_VERSION;
    generatedAt: string;
    venue: VenueSummary;
    entries: ChangelogEntry[];
}

// feed/health.json
export interface SourceHealth {
    id: string;
    venue: string;
    kind: VenueKind;
    type: SourceType;
    link: string;
    role: 'primary' | 'secondary';
    ok: boolean;
    expectBlocked?: string;
    lastRunAt: string;
    lastOkAt: string | null;
    lastError: string | null;
    consecutiveFailures: number;
    entryCount: number;
    latestDate: string | null;
}

export interface HealthFeed {
    schemaVersion: typeof SCHEMA_VERSION;
    generatedAt: string;
    sources: SourceHealth[];
}
