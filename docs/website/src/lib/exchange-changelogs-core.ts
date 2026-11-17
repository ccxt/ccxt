// Client-safe half of the exchange-changelogs data layer: types, URL-filter parsing,
// filtering, link sanitizing and view shaping. No node APIs and no zod here, so the
// client explorer (components/changelog-explorer.tsx) can import it. The server loader
// (fetch / disk, zod validation) lives in ./exchange-changelogs.ts and re-exports this.
//
// The types mirror exchange-changelogs/collector/src/types.ts (a separate package that
// must not be imported here). Keep them in sync when SCHEMA_VERSION changes.
//
// Everything in a feed was scraped from third-party sites: render it as text only and
// send every link through safeHref().

export const SCHEMA_VERSION = 1 as const;

export type VenueKind = 'exchange' | 'prediction';

export interface FeedEntry {
  schemaVersion: number;
  id: string;
  kind: VenueKind;
  exchange: string;
  affects: string[];
  source: string;
  sourceType: string;
  sourceLink: string;
  scope?: string;
  title: string;
  excerpt: string;
  url: string;
  publishedAt: string | null;
  effectiveDate?: string;
  dateKind: string;
  firstSeen: string;
  lastSeen: string;
  hash: string;
  removedAt?: string;
  backfill: boolean;
  tags: string[];
  ccxt: { status: string; issue?: number; pr?: number };
}

export interface ChangelogEntry extends FeedEntry {
  body?: string;
  revisions?: { at: string; hash: string }[];
}

export interface VenueSummary {
  id: string;
  kind: VenueKind;
  name: string;
  subclasses: string[];
  domains: string[];        // registry domains (hosts entry links may point to); [] in older feeds
  sources: number;
  healthy: number;
  latestDate: string | null;
  entryCount: number;
  unmonitored?: string;     // reason the venue has no monitorable source (no sources, shown muted)
}

export interface LatestFeed {
  schemaVersion: number;
  generatedAt: string;
  windowDays: number;
  entries: FeedEntry[];
  venues: VenueSummary[];
}

export interface VenueFeed {
  schemaVersion: number;
  generatedAt: string;
  venue: VenueSummary;
  entries: ChangelogEntry[];
}

export interface SourceHealth {
  id: string;
  venue: string;
  kind: VenueKind;
  type: string;
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
  schemaVersion: number;
  generatedAt: string;
  sources: SourceHealth[];
}

export const EMPTY_LATEST: LatestFeed = { schemaVersion: SCHEMA_VERSION, generatedAt: '', windowDays: 0, entries: [], venues: [] };
export const EMPTY_HEALTH: HealthFeed = { schemaVersion: SCHEMA_VERSION, generatedAt: '', sources: [] };

// Tag vocabulary of the collector (src/tags.ts). Unknown tags still render, these are
// just the ones offered as filter chips, in display order.
export const CHANGELOG_TAGS = [
  'deprecation', 'breaking', 'new-endpoint', 'rate-limit', 'websocket', 'auth', 'param-change', 'market', 'maintenance',
] as const;
export const WARNING_TAGS = new Set(['deprecation', 'breaking']);
export const DAY_RANGES = [7, 30, 90] as const;
export const DEFAULT_DAYS = 30;

// Light mode: fumadocs' muted foreground (#737373) is ~4.2:1 on cards; this darker shade keeps
// labels, excerpts and chips at WCAG AA (>= 4.5:1). Dark mode keeps the theme value. Lives here
// (not in the 'use client' explorer) so the server page can use it too.
export const CHANGELOG_CONTRAST = '[:root:not(.dark)_&]:[--color-fd-muted-foreground:hsl(0_0%_34%)]';

export const PAGE_PATH = '/docs/changelog-exchanges';
export const JSON_FEED_PATH = '/changelog-exchanges.json';
export const XML_FEED_PATH = '/changelog-exchanges.xml';
export const MD_PATH = '/docs/changelog-exchanges.md';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const ID_RE = /^[a-z0-9][a-z0-9_-]{0,63}$/;
// filter token: "binance" (every kind with that id) or "prediction/binance" (one venue)
const VENUE_TOKEN_RE = /^(?:(?:exchange|prediction)\/)?[a-z0-9][a-z0-9_-]{0,63}$/;

export function isVenueId(id: string): boolean {
  return ID_RE.test(id);
}

export function isVenueToken(token: string): boolean {
  return VENUE_TOKEN_RE.test(token);
}

// Venues are identified by kind + id: exchange/binance and prediction/binance are two venues.
export function venueKey(kind: VenueKind, id: string): string {
  return `${kind}/${id}`;
}

export function parseVenueToken(token: string): { kind?: VenueKind; id: string } {
  const i = token.indexOf('/');
  return i === -1 ? { id: token } : { kind: token.slice(0, i) as VenueKind, id: token.slice(i + 1) };
}

// Does an entry belong to the venue a filter token names? A bare id matches every kind (and
// entries shared with that id via `affects`); "kind/id" only that kind. Callers that know the
// venue list resolve bare ids first (resolveVenueToken), so this bare-id fallback only applies
// when no venue list is available.
export function matchesVenue(e: Pick<FeedEntry, 'kind' | 'exchange' | 'affects'>, token: string): boolean {
  const { kind, id } = parseVenueToken(token);
  if (kind && e.kind !== kind) return false;
  return e.exchange === id || e.affects.includes(id);
}

export interface VenueRef {
  kind: VenueKind;
  id: string;
  subclasses?: readonly string[];
}

/**
 * Canonical "kind/id" key of the venue a filter token names, or undefined when no venue matches.
 *   - "prediction/binance" / "exchange/okx": that kind only
 *   - a bare id: the exchange venue first, the prediction venue only when no exchange has the id
 *   - a subclass id (VenueSummary.subclasses, e.g. binanceusdm, okxus): its parent venue
 */
export function resolveVenueToken(token: string, venues: readonly VenueRef[]): string | undefined {
  const { kind, id } = parseVenueToken(token);
  const kinds: VenueKind[] = kind ? [kind] : ['exchange', 'prediction'];
  for (const k of kinds) {
    if (venues.some((v) => v.kind === k && v.id === id)) return venueKey(k, id);
  }
  for (const k of kinds) {
    const parent = venues.find((v) => v.kind === k && v.subclasses?.includes(id));
    if (parent) return venueKey(k, parent.id);
  }
  return undefined;
}

// Resolve every token of a filter: known ones become "kind/id" keys, unknown ones are reported.
// Without a venue list (feed not loaded) the tokens are kept as given.
export function resolveVenueTokens(tokens: readonly string[], venues: readonly VenueRef[]): { tokens: string[]; unknown: string[] } {
  if (venues.length === 0) return { tokens: [...tokens], unknown: [] };
  const out = new Set<string>();
  const unknown: string[] = [];
  for (const t of tokens) {
    const key = resolveVenueToken(t, venues);
    if (key) out.add(key);
    else unknown.push(t);
  }
  return { tokens: [...out], unknown };
}

// A real calendar day (rejects 2026-13-45 and 2026-02-31).
export function isIsoDate(s: unknown): s is string {
  if (typeof s !== 'string' || !DATE_RE.test(s)) return false;
  const t = Date.parse(`${s}T00:00:00Z`);
  return !Number.isNaN(t) && new Date(t).toISOString().slice(0, 10) === s;
}

const TIMESTAMP_RE = /^(\d{4}-\d{2}-\d{2})T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,9})?)?(?:Z|[+-]\d{2}:?\d{2})$/i;

// A day (YYYY-MM-DD, read as 00:00 UTC) or a full ISO 8601 timestamp with a zone, normalized to
// UTC ("2026-11-08T16:30:16.870Z"); undefined when malformed.
export function normalizeIsoTime(s: unknown): string | undefined {
  if (typeof s !== 'string') return undefined;
  if (isIsoDate(s)) return `${s}T00:00:00.000Z`;
  const m = TIMESTAMP_RE.exec(s);
  if (!m || !isIsoDate(m[1])) return undefined;
  const t = Date.parse(s);
  return Number.isNaN(t) ? undefined : new Date(t).toISOString();
}

// The day an entry is filed under in the timeline: coalesce(publishedAt, firstSeen day). An
// announced effectiveDate is shown as a chip and in the "upcoming" list, never used for filing,
// so a note published today about a change next year sits under today.
export function entryDate(e: Pick<FeedEntry, 'publishedAt' | 'firstSeen'>): string {
  if (isIsoDate(e.publishedAt)) return e.publishedAt;
  const d = typeof e.firstSeen === 'string' ? e.firstSeen.slice(0, 10) : '';
  return isIsoDate(d) ? d : '1970-01-01';
}

// firstSeen as epoch ms (0 when malformed), for ordering and seenSince.
export function seenTime(e: Pick<FeedEntry, 'firstSeen'>): number {
  const t = typeof e.firstSeen === 'string' ? Date.parse(e.firstSeen) : Number.NaN;
  return Number.isNaN(t) ? 0 : t;
}

// Entries with an announced effective date on or after `today`, soonest first.
export function upcomingEntries<T extends Pick<FeedEntry, 'effectiveDate' | 'firstSeen'>>(entries: readonly T[], today: string = utcDay()): T[] {
  return entries
    .filter((e) => isIsoDate(e.effectiveDate) && e.effectiveDate >= today)
    .sort((a, b) => a.effectiveDate!.localeCompare(b.effectiveDate!) || a.firstSeen.localeCompare(b.firstSeen));
}

export function utcDay(d: Date = new Date()): string {
  return d.toISOString().slice(0, 10);
}

export function addDays(day: string, n: number): string {
  const t = Date.parse(`${day}T00:00:00Z`) + n * 86_400_000;
  return new Date(t).toISOString().slice(0, 10);
}

// ---------------------------------------------------------------------------
// links
// ---------------------------------------------------------------------------

// Pass as `domains` to safeHref for links that come from our own registry (source pages).
export const ANY_HOST = 'any' as const;

function hostAllowed(host: string, domains: readonly string[] | typeof ANY_HOST): boolean {
  if (domains === ANY_HOST) return true;
  return domains.some((d) => host === d || host.endsWith(`.${d}`));
}

/**
 * Returns `url` only when it is an absolute https: URL whose host is one of `domains`
 * (or a subdomain of one; an empty list allows nothing, ANY_HOST allows any https host).
 * Anything else (javascript:, data:, http:, relative, off-domain, credentials in the URL)
 * yields `fallback`.
 */
export function safeHref(url: unknown, domains: readonly string[] | typeof ANY_HOST, fallback: string | null = null): string | null {
  if (typeof url !== 'string' || url.length > 2048) return fallback;
  let u: URL;
  try {
    u = new URL(url.trim());
  } catch {
    return fallback;
  }
  if (u.protocol !== 'https:' || u.username || u.password) return fallback;
  if (!hostAllowed(u.hostname.toLowerCase(), domains === ANY_HOST ? ANY_HOST : domains.map((d) => d.toLowerCase()))) return fallback;
  return u.toString();
}

export function hostOf(url: string | null | undefined): string {
  if (!url) return '';
  try {
    return new URL(url).hostname;
  } catch {
    return '';
  }
}

// Registry-ish domain of a trusted link (source pages come from our registry), minus www.
export function baseDomain(url: string | null | undefined): string {
  return hostOf(url).toLowerCase().replace(/^www\./, '');
}

// Hosts that serve many unrelated owners: never derived as a venue's allowed link domain (a
// raw.githubusercontent.com source link must not allow links to any repository).
const SHARED_HOST_RE = /(?:^|\.)(?:githubusercontent\.com|github\.com|github\.io|gitlab\.com|gitlab\.io|gitbook\.io|notion\.site|medium\.com|pypi\.org|npmjs\.com)$/;

export function isSharedHost(host: string): boolean {
  return SHARED_HOST_RE.test(host.toLowerCase());
}

// Docs route for a venue — same rule as build/wiki-to-fumadocs.ts.
export function venueDocPath(kind: VenueKind, id: string): string {
  return kind === 'prediction' ? `/docs/prediction/${id}` : `/docs/exchanges/${id}`;
}

// ---------------------------------------------------------------------------
// filters (shared by the explorer URL state and the .json/.xml/.md routes)
// ---------------------------------------------------------------------------

export interface ChangelogFilter {
  exchanges: string[];
  tags: string[];
  since?: string;      // YYYY-MM-DD, or a UTC ISO timestamp (day precision: compared with entryDate)
  seenSince?: string;  // UTC ISO timestamp: only entries with firstSeen > seenSince
  days?: number;
  status: string[];
  q: string;
  limit?: number;
}

export const MAX_LIMIT = 1000;
export const MAX_DAYS = 3650;
const TAG_RE = /^[a-z0-9-]{1,40}$/;

function list(params: URLSearchParams, key: string, re: RegExp, bad?: (v: string) => void): string[] {
  const out = new Set<string>();
  for (const raw of params.getAll(key)) {
    for (const part of raw.split(',')) {
      const v = part.trim().toLowerCase();
      if (!v) continue;
      if (re.test(v)) out.add(v);
      else bad?.(v);
    }
  }
  return [...out].slice(0, 200);
}

// Quote a user-supplied value inside an error message (bounded, no control characters).
function shown(v: string): string {
  return JSON.stringify(v.length > 60 ? `${v.slice(0, 60)}…` : v);
}

/**
 * Parse the feed query string. `problems` lists every malformed parameter (bad dates, malformed
 * tags, out-of-range numbers, malformed venue ids); the feed routes answer those with 400.
 * `knownTags`, when given, is the tag vocabulary: a well-formed tag outside it stays in the filter
 * (it matches nothing) and is reported in `warnings`, like an unknown venue id, so a feed reader
 * subscribed to it gets an empty feed instead of an error it cannot show.
 */
export function parseFilterParams(params: URLSearchParams, opts: { knownTags?: Iterable<string> } = {}): { filter: ChangelogFilter; problems: string[]; warnings: string[] } {
  const problems: string[] = [];
  const warnings: string[] = [];
  const known = opts.knownTags ? new Set(opts.knownTags) : undefined;

  const time = (key: string, dayOk: boolean): string | undefined => {
    // an unencoded "+" of a zone offset arrives as a space ("...T12:00:00 05:00")
    const raw = params.get(key)?.trim().replace(/ (\d{2}:?\d{2})$/, '+$1');
    if (!raw) return undefined;
    const t = normalizeIsoTime(raw);
    if (!t) {
      problems.push(`${key}: expected ${dayOk ? 'YYYY-MM-DD or ' : ''}an ISO 8601 timestamp such as 2026-11-08T16:30:16Z, got ${shown(raw)}`);
      return undefined;
    }
    return dayOk && isIsoDate(raw) ? raw : t;
  };
  const int = (key: string, min: number, max: number): number | undefined => {
    const raw = params.get(key)?.trim();
    if (!raw) return undefined;
    const n = /^\d{1,9}$/.test(raw) ? Number(raw) : Number.NaN;
    if (!Number.isInteger(n) || n < min || n > max) {
      problems.push(`${key}: expected an integer from ${min} to ${max}, got ${shown(raw)}`);
      return undefined;
    }
    return n;
  };

  const exchanges = list(params, 'exchange', VENUE_TOKEN_RE, (v) => problems.push(`exchange: malformed venue id ${shown(v)} (use an id such as binance, or kind/id such as prediction/polymarket)`));
  const tags = list(params, 'tag', TAG_RE, (v) => problems.push(`tag: malformed tag ${shown(v)}`));
  if (known) {
    for (const t of tags) if (!known.has(t)) warnings.push(`unknown tag ${shown(t)}: no entry carries it (known: ${[...known].sort().join(', ')})`);
  }
  const filter: ChangelogFilter = {
    exchanges,
    tags,
    since: time('since', true),
    seenSince: time('seenSince', false),
    days: int('days', 1, MAX_DAYS),
    status: list(params, 'status', /^[a-z-]{1,20}$/, (v) => problems.push(`status: malformed status ${shown(v)}`)),
    q: (params.get('q') ?? '').trim().slice(0, 200),
    limit: int('limit', 1, MAX_LIMIT),
  };
  return { filter, problems, warnings };
}

// Lenient variant: malformed values are dropped.
export function parseFilter(params: URLSearchParams): ChangelogFilter {
  return parseFilterParams(params).filter;
}

// Stable query string (same filter -> same string), used for URLs and ETags.
export function filterToSearchParams(f: Partial<ChangelogFilter>): URLSearchParams {
  const p = new URLSearchParams();
  if (f.exchanges?.length) p.set('exchange', [...f.exchanges].sort().join(','));
  if (f.tags?.length) p.set('tag', [...f.tags].sort().join(','));
  if (f.since) p.set('since', f.since);
  if (f.seenSince) p.set('seenSince', f.seenSince);
  if (f.days) p.set('days', String(f.days));
  if (f.status?.length) p.set('status', [...f.status].sort().join(','));
  if (f.q) p.set('q', f.q);
  if (f.limit) p.set('limit', String(f.limit));
  return p;
}

// Earliest day included by a filter (since and days combine to the later bound).
export function filterStartDay(f: Pick<ChangelogFilter, 'since' | 'days'>, today: string = utcDay()): string | undefined {
  const fromDays = f.days ? addDays(today, -f.days) : undefined;
  const since = f.since ? f.since.slice(0, 10) : undefined;   // a timestamp counts by its UTC day
  if (since && fromDays) return since > fromDays ? since : fromDays;
  return since ?? fromDays;
}

// Timeline order: filing day desc, then most recently seen first.
export function byDateDesc(a: Pick<FeedEntry, 'publishedAt' | 'firstSeen'>, b: Pick<FeedEntry, 'publishedAt' | 'firstSeen'>): number {
  return entryDate(b).localeCompare(entryDate(a)) || seenTime(b) - seenTime(a);
}

// When a feed reader should date an entry (epoch ms): when CCXT first saw it, so an entry published
// days before it was collected still reaches readers as new; except backfilled entries (seeded when
// their source was first collected, up to 90 days old), which keep their filing day, so adding a
// source does not push months of old notes to readers dated "today".
export function readerTime(e: Pick<FeedEntry, 'publishedAt' | 'firstSeen' | 'backfill'>): number {
  if (e.backfill) {
    const t = Date.parse(`${entryDate(e)}T00:00:00Z`);
    if (Number.isFinite(t)) return t;
  }
  return seenTime(e);
}

// RSS / Atom / JSON Feed order: readerTime desc, then filing day.
export function byReaderDesc(a: Pick<FeedEntry, 'publishedAt' | 'firstSeen' | 'backfill'>, b: Pick<FeedEntry, 'publishedAt' | 'firstSeen' | 'backfill'>): number {
  return readerTime(b) - readerTime(a) || entryDate(b).localeCompare(entryDate(a)) || seenTime(b) - seenTime(a);
}

// Most recently seen first, then filing day.
export function bySeenDesc(a: Pick<FeedEntry, 'publishedAt' | 'firstSeen'>, b: Pick<FeedEntry, 'publishedAt' | 'firstSeen'>): number {
  return seenTime(b) - seenTime(a) || entryDate(b).localeCompare(entryDate(a));
}

// Filtered entries in timeline order (byDateDesc), cut to f.limit. With f.seenSince use
// pageSince() instead of the limit cut, so a poller never skips entries.
export function filterEntries<T extends FeedEntry>(entries: readonly T[], f: ChangelogFilter, today: string = utcDay()): T[] {
  const start = filterStartDay(f, today);
  const seenAfter = f.seenSince ? Date.parse(f.seenSince) : undefined;
  const tags = new Set(f.tags);
  const status = new Set(f.status);
  const q = f.q.toLowerCase();
  const out = entries.filter((e) => {
    if (f.exchanges.length && !f.exchanges.some((t) => matchesVenue(e, t))) return false;
    if (tags.size && !e.tags.some((t) => tags.has(t))) return false;
    if (status.size && !status.has(e.ccxt.status)) return false;
    if (start && entryDate(e) < start) return false;
    if (seenAfter !== undefined && !(seenTime(e) > seenAfter)) return false;
    if (q && !`${e.title}\n${e.excerpt}`.toLowerCase().includes(q)) return false;
    return true;
  });
  out.sort(byDateDesc);
  return f.limit ? out.slice(0, f.limit) : out;
}

// Largest firstSeen among `entries` as a UTC ISO timestamp, or `fallback` when there are none.
export function maxSeen(entries: readonly Pick<FeedEntry, 'firstSeen'>[], fallback: string | null = null): string | null {
  let max = 0;
  for (const e of entries) max = Math.max(max, seenTime(e));
  return max ? new Date(max).toISOString() : fallback;
}

/**
 * Incremental polling page: the `limit` oldest-seen entries (whole firstSeen groups, since one
 * collector run stamps many entries with the same firstSeen and seenSince is exclusive), returned
 * in timeline order, plus nextSince = the largest firstSeen on the page (or `seenSince` when the
 * page is empty) and whether more entries remain. A single firstSeen group larger than `limit`
 * is returned whole.
 */
export function pageSince<T extends FeedEntry>(entries: readonly T[], limit: number | undefined, seenSince: string | undefined): { entries: T[]; nextSince: string | null; hasMore: boolean } {
  const asc = [...entries].sort((a, b) => seenTime(a) - seenTime(b));
  let page = asc;
  if (limit && asc.length > limit) {
    const cut = seenTime(asc[limit - 1]);
    let end = limit;
    if (seenTime(asc[limit]) === cut) {
      // the cut splits a firstSeen group: drop that group, or take all of it when it is the first
      let start = limit - 1;
      while (start > 0 && seenTime(asc[start - 1]) === cut) start--;
      end = start;
      if (end === 0) while (end < asc.length && seenTime(asc[end]) === cut) end++;
    }
    page = asc.slice(0, end);
  }
  const last = page.at(-1);
  return {
    entries: [...page].sort(byDateDesc),
    nextSince: last ? new Date(seenTime(last)).toISOString() : (seenSince ?? null),
    hasMore: page.length < asc.length,
  };
}

// ---------------------------------------------------------------------------
// view shaping: what the explorer actually renders (links already sanitized)
// ---------------------------------------------------------------------------

export interface VenueInfo {
  key: string;              // venueKey(kind, id)
  id: string;
  name: string;
  kind: VenueKind;
  docPath: string | null;   // null when the docs site has no page for this venue
  domains: string[];        // hosts entry links may point to
  subclasses?: string[];    // ccxt subclass ids filed under this venue (binanceusdm -> binance)
}

export interface ViewEntry {
  id: string;
  kind: VenueKind;
  exchange: string;
  affects: string[];
  title: string;
  excerpt: string;
  body?: string;
  href: string | null;       // entry link (sanitized), null = render title as text
  sourceHref: string | null; // source page (sanitized)
  sourceHost: string;
  scope?: string;
  date: string;              // grouping day: entryDate() = coalesce(publishedAt, firstSeen day)
  publishedAt: string | null;
  effectiveDate?: string;
  firstSeen: string;
  tags: string[];
}

const str = (v: unknown, max = 4000): string => (typeof v === 'string' ? v.slice(0, max) : '');
const strArr = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string').slice(0, 50) : []);

// Defensive: also used on JSON fetched by the browser, so it never trusts field types.
export function toViewEntry(raw: Partial<ChangelogEntry>, venue: VenueInfo | undefined): ViewEntry {
  const sourceLink = str(raw.sourceLink, 2048);
  const sourceHref = safeHref(sourceLink, ANY_HOST);
  // registry domains; else the source link's own domain unless it is a shared host; else only
  // the source link itself (fail closed)
  const fallback = baseDomain(sourceHref);
  const domains = venue?.domains.length ? venue.domains : (fallback && !isSharedHost(fallback) ? [fallback] : []);
  const effectiveDate = isIsoDate(raw.effectiveDate) ? raw.effectiveDate : undefined;
  const publishedAt = isIsoDate(raw.publishedAt) ? raw.publishedAt : null;
  const firstSeen = str(raw.firstSeen, 40);
  const body = str(raw.body);
  return {
    id: str(raw.id, 128),
    kind: raw.kind === 'prediction' ? 'prediction' : 'exchange',
    exchange: str(raw.exchange, 64),
    affects: strArr(raw.affects),
    title: str(raw.title, 300),
    excerpt: str(raw.excerpt, 600),
    ...(body ? { body } : {}),
    href: safeHref(raw.url, domains, sourceHref),
    sourceHref,
    sourceHost: hostOf(sourceHref),
    scope: str(raw.scope, 80) || undefined,
    date: entryDate({ publishedAt, firstSeen }),
    publishedAt,
    effectiveDate,
    firstSeen,
    tags: strArr(raw.tags),
  };
}

// Hosts each venue's entries may link to: the registry `domains` from VenueSummary.domains.
// Feeds written before VenueSummary carried `domains` fall back to the base domains of the
// source links in health.json + entries (never shared hosts like raw.githubusercontent.com).
// Keyed by venueKey(kind, id): exchange/binance and prediction/binance keep their own lists.
export function venueDomainsFrom(
  entries: readonly Pick<FeedEntry, 'kind' | 'exchange' | 'sourceLink'>[],
  health: HealthFeed,
  venues: readonly Pick<VenueSummary, 'kind' | 'id' | 'domains'>[] = [],
): Map<string, string[]> {
  const m = new Map<string, Set<string>>();
  const put = (venue: string, d: string) => {
    if (!m.has(venue)) m.set(venue, new Set());
    m.get(venue)!.add(d);
  };
  const isHost = (d: string) => /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/.test(d);
  for (const v of venues) for (const d of v.domains ?? []) if (isHost(d.toLowerCase())) put(venueKey(v.kind, v.id), d.toLowerCase());
  const fromRegistry = new Set(m.keys());
  const add = (key: string, link: string) => {
    if (fromRegistry.has(key)) return;
    const d = baseDomain(safeHref(link, ANY_HOST));
    if (d && !isSharedHost(d)) put(key, d);
  };
  for (const s of health.sources) add(venueKey(s.kind, s.venue), s.link);
  for (const e of entries) add(venueKey(e.kind, e.exchange), e.sourceLink);
  return new Map([...m].map(([k, v]) => [k, [...v]]));
}

export function groupByDay<T extends { date: string }>(entries: readonly T[]): { day: string; entries: T[] }[] {
  const groups: { day: string; entries: T[] }[] = [];
  for (const e of entries) {
    const last = groups.at(-1);
    if (last && last.day === e.date) last.entries.push(e);
    else groups.push({ day: e.date, entries: [e] });
  }
  return groups;
}

export function formatDay(day: string, opts: Intl.DateTimeFormatOptions = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }): string {
  const t = Date.parse(`${day}T00:00:00Z`);
  if (Number.isNaN(t)) return day;
  return new Intl.DateTimeFormat('en-US', { ...opts, timeZone: 'UTC' }).format(t);
}

export function formatTimestamp(iso: string): string {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return 'unknown';
  return `${new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: 'UTC' }).format(t)} UTC`;
}
