// Server-side loader for the exchange-changelogs feed files (see
// exchange-changelogs/collector/src/types.ts for the contract: LatestFeed, VenueFeed,
// HealthFeed). Pure helpers live in ./exchange-changelogs-core.ts (client-safe) and are
// re-exported from here.
//
// Source of the files:
//   - EXCHANGE_CHANGELOGS_DIR set   -> read <dir>/latest.json, <dir>/health.json,
//                                      <dir>/<kind>/<id>.json from disk (local preview)
//   - otherwise                     -> fetch from EXCHANGE_CHANGELOGS_URL (default: the
//                                      changelog-data branch on raw.githubusercontent.com),
//                                      cached for 1h and tagged 'exchange-changelogs' so
//                                      POST /api/revalidate/changelog can refresh it.
//
// Fallbacks when a file can't be fetched or parsed, in order:
//   1. the last good copy this process saw (memory; empty after a deploy/restart)
//   2. the build-time snapshot in src/data/changelog-snapshot/ (written by the prebuild step,
//      scripts/fetch-changelog-snapshot.mjs; EXCHANGE_CHANGELOGS_SNAPSHOT_DIR overrides the dir)
//   3. nothing: getChangelogData() throws ChangelogUnavailableError. The page lets it propagate
//      (Next keeps serving the previous ISR render and retries on the next request); the feed
//      routes answer 503 + no-store. An empty page or feed is never cached.
// Unknown fields are tolerated (zod strips them); a malformed entry is dropped instead of
// failing the whole feed.
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { isAbsolute, join } from 'node:path';
import { z } from 'zod';
import { basePath, siteUrl } from './shared';
import {
  EMPTY_HEALTH,
  isIsoDate,
  isVenueId,
  utcDay,
  venueDocPath,
  venueKey,
  venueDomainsFrom,
  type ChangelogEntry,
  type FeedEntry,
  type HealthFeed,
  type LatestFeed,
  type SourceHealth,
  type VenueFeed,
  type VenueInfo,
  type VenueKind,
  type VenueSummary,
} from './exchange-changelogs-core';

export * from './exchange-changelogs-core';

export const CHANGELOG_CACHE_TAG = 'exchange-changelogs';
export const CHANGELOG_REVALIDATE_SECONDS = 3600;
const DEFAULT_URL = 'https://raw.githubusercontent.com/ccxt/ccxt/changelog-data/feed';

// ---------------------------------------------------------------------------
// zod schemas (mirror of the contract; lenient on values that may grow)
// ---------------------------------------------------------------------------

// a real calendar day: a malformed date would otherwise reach `new Date()` in the feed routes
const isoDay = z.string().refine(isIsoDate);
const kind = z.enum(['exchange', 'prediction']);
const text = (max: number) => z.string().transform((s) => s.slice(0, max));

const feedEntrySchema = z.object({
  schemaVersion: z.number(),
  id: z.string().min(1).max(128),
  kind,
  exchange: z.string().min(1).max(64),
  affects: z.array(z.string()).catch([]),
  source: z.string(),
  sourceType: z.string(),
  sourceLink: z.string(),
  scope: z.string().optional().catch(undefined),
  title: text(300),
  excerpt: text(600).catch(''),
  url: z.string(),
  publishedAt: isoDay.nullable().catch(null),
  effectiveDate: isoDay.optional().catch(undefined),
  dateKind: z.string().catch('firstSeen'),
  firstSeen: z.string(),
  lastSeen: z.string().catch(''),
  hash: z.string().catch(''),
  removedAt: z.string().optional().catch(undefined),
  backfill: z.boolean().catch(false),
  tags: z.array(z.string()).catch([]),
  ccxt: z.object({
    status: z.string(),
    issue: z.number().optional().catch(undefined),
    pr: z.number().optional().catch(undefined),
  }).catch({ status: 'new' }),
});

const changelogEntrySchema = feedEntrySchema.extend({
  body: text(8000).optional().catch(undefined),
  revisions: z.array(z.object({ at: z.string(), hash: z.string() })).optional().catch(undefined),
});

const venueSummarySchema = z.object({
  id: z.string().min(1),
  kind,
  name: z.string(),
  subclasses: z.array(z.string()).catch([]),
  domains: z.array(z.string()).catch([]),
  sources: z.number().catch(0),
  healthy: z.number().catch(0),
  latestDate: z.string().nullable().catch(null),
  entryCount: z.number().catch(0),
  // registry venues with no monitorable source: the reason (third-party-free registry text)
  unmonitored: z.string().transform((s) => s.slice(0, 300)).optional().catch(undefined),
});

const sourceHealthSchema = z.object({
  id: z.string(),
  venue: z.string(),
  kind,
  type: z.string(),
  link: z.string(),
  role: z.enum(['primary', 'secondary']).catch('primary'),
  ok: z.boolean(),
  expectBlocked: z.string().optional().catch(undefined),
  lastRunAt: z.string().catch(''),
  lastOkAt: z.string().nullable().catch(null),
  lastError: z.string().nullable().catch(null),
  consecutiveFailures: z.number().catch(0),
  entryCount: z.number().catch(0),
  latestDate: z.string().nullable().catch(null),
});

const envelope = z.object({ schemaVersion: z.number(), generatedAt: z.string() });

// Parse an array item-by-item, keeping only the valid ones.
function each<T>(schema: z.ZodType<T>, items: unknown): T[] {
  if (!Array.isArray(items)) return [];
  const out: T[] = [];
  for (const it of items) {
    const r = schema.safeParse(it);
    if (r.success) out.push(r.data);
  }
  return out;
}

function parseLatest(raw: unknown): LatestFeed | null {
  const env = envelope.extend({ windowDays: z.number().catch(0), entries: z.unknown(), venues: z.unknown() }).safeParse(raw);
  if (!env.success) return null;
  const feed: LatestFeed = {
    schemaVersion: env.data.schemaVersion,
    generatedAt: env.data.generatedAt,
    windowDays: env.data.windowDays,
    entries: each<FeedEntry>(feedEntrySchema, env.data.entries),
    venues: each<VenueSummary>(venueSummarySchema, env.data.venues),
  };
  // a feed listing no venue is a broken publish, not "no news": fall back instead of caching it
  return feed.venues.length || feed.entries.length ? feed : null;
}

function parseHealth(raw: unknown): HealthFeed | null {
  const env = envelope.extend({ sources: z.unknown() }).safeParse(raw);
  if (!env.success) return null;
  const sources = each<SourceHealth>(sourceHealthSchema, env.data.sources);
  return sources.length ? { schemaVersion: env.data.schemaVersion, generatedAt: env.data.generatedAt, sources } : null;
}

function parseVenue(raw: unknown): VenueFeed | null {
  const env = envelope.extend({ venue: venueSummarySchema, entries: z.unknown() }).safeParse(raw);
  if (!env.success) return null;
  return {
    schemaVersion: env.data.schemaVersion,
    generatedAt: env.data.generatedAt,
    venue: env.data.venue,
    entries: each<ChangelogEntry>(changelogEntrySchema, env.data.entries),
  };
}

// ---------------------------------------------------------------------------
// transport
// ---------------------------------------------------------------------------

// Thrown when a feed file is unavailable from every source (live, memory, snapshot).
export class ChangelogUnavailableError extends Error {
  constructor(file: string) {
    super(`exchange-changelogs: ${file} is unavailable (fetch failed and no last-good copy)`);
    this.name = 'ChangelogUnavailableError';
  }
}

export function isChangelogUnavailable(err: unknown): err is ChangelogUnavailableError {
  return err instanceof ChangelogUnavailableError;
}

// Last successfully parsed copy per file, so a transient fetch failure during an ISR
// regeneration doesn't replace a good page with an empty one for an hour.
const lastGood = new Map<string, unknown>();
// Parsed build-time snapshot files (null = not in the snapshot), read at most once per process.
const snapshotCache = new Map<string, unknown>();

function snapshotDir(): string {
  const dir = process.env.EXCHANGE_CHANGELOGS_SNAPSHOT_DIR;
  if (dir) return isAbsolute(dir) ? dir : join(/* turbopackIgnore: true */ process.cwd(), dir);
  return join(/* turbopackIgnore: true */ process.cwd(), 'src', 'data', 'changelog-snapshot');
}

async function readJson(rel: string): Promise<unknown> {
  const dir = process.env.EXCHANGE_CHANGELOGS_DIR;
  if (dir) {
    return JSON.parse(await readFile(/* turbopackIgnore: true */ join(dir, rel), 'utf8'));
  }
  const base = (process.env.EXCHANGE_CHANGELOGS_URL ?? DEFAULT_URL).replace(/\/$/, '');
  const res = await fetch(`${base}/${rel}`, {
    next: { revalidate: CHANGELOG_REVALIDATE_SECONDS, tags: [CHANGELOG_CACHE_TAG] },
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${rel}`);
  return res.json();
}

async function readSnapshot<T>(rel: string, parse: (raw: unknown) => T | null): Promise<T | null> {
  if (!snapshotCache.has(rel)) {
    let parsed: T | null = null;
    try {
      parsed = parse(JSON.parse(await readFile(/* turbopackIgnore: true */ join(snapshotDir(), rel), 'utf8')));
    } catch {
      // no snapshot (prebuild fetch failed or skipped): nothing to fall back to
    }
    snapshotCache.set(rel, parsed);
  }
  return snapshotCache.get(rel) as T | null;
}

async function load<T>(rel: string, parse: (raw: unknown) => T | null): Promise<T | null> {
  try {
    const parsed = parse(await readJson(rel));
    if (parsed) {
      lastGood.set(rel, parsed);
      return parsed;
    }
    console.warn(`[exchange-changelogs] ${rel}: unexpected shape`);
  } catch (err) {
    console.warn(`[exchange-changelogs] ${rel}: ${err instanceof Error ? err.message : String(err)}`);
  }
  const fallback = (lastGood.get(rel) as T | undefined) ?? (await readSnapshot(rel, parse));
  if (fallback) console.warn(`[exchange-changelogs] ${rel}: serving the ${lastGood.has(rel) ? 'last good copy' : 'build-time snapshot'}`);
  return fallback ?? null;
}

// latest.json; throws ChangelogUnavailableError when no copy is available at all.
export async function getLatestFeed(): Promise<LatestFeed> {
  const feed = await load('latest.json', parseLatest);
  if (!feed) throw new ChangelogUnavailableError('latest.json');
  return feed;
}

// health.json; throws ChangelogUnavailableError when no copy is available at all.
export async function getHealthFeed(): Promise<HealthFeed> {
  const feed = await load('health.json', parseHealth);
  if (!feed) throw new ChangelogUnavailableError('health.json');
  return feed;
}

// One venue with bodies (last 365 days), by its canonical kind + id (see resolveVenueToken).
// Returns null for a venue latest.json does not list (no origin request); throws
// ChangelogUnavailableError when the venue is listed but its file can't be loaded.
export async function getVenueFeed(id: string, venueKind: VenueKind): Promise<VenueFeed | null> {
  if (!isVenueId(id)) return null;
  const latest = await getLatestFeed();
  if (!latest.venues.some((v) => v.id === id && v.kind === venueKind)) return null;
  const rel = `${venueKind}/${id}.json`;
  const feed = await load(rel, parseVenue);
  if (!feed) throw new ChangelogUnavailableError(rel);
  return feed;
}

export interface ChangelogData {
  latest: LatestFeed;
  health: HealthFeed;
  venues: Map<string, VenueInfo>;
}

// latest + health, plus per-venue display info (name, kind, docs path, link domains,
// subclasses) for every venue that appears in either file, keyed by venueKey(kind, id).
// Throws ChangelogUnavailableError when latest.json is unavailable, and when health.json is
// unavailable unless `optionalHealth` (the feeds only use health for link-domain fallbacks).
export async function getChangelogData(opts: { optionalHealth?: boolean } = {}): Promise<ChangelogData> {
  const [latest, health] = await Promise.all([
    getLatestFeed(),
    getHealthFeed().catch((err: unknown) => {
      if (opts.optionalHealth && isChangelogUnavailable(err)) return EMPTY_HEALTH;
      throw err;
    }),
  ]);
  const domains = venueDomainsFrom(latest.entries, health, latest.venues);
  const venues = new Map<string, VenueInfo>();
  const add = (id: string, name: string, k: VenueKind, subclasses: string[] = []) => {
    const key = venueKey(k, id);
    if (!venues.has(key) && isVenueId(id)) venues.set(key, { key, id, name: name || id, kind: k, docPath: venueDocPath(k, id), domains: domains.get(key) ?? [], subclasses });
  };
  for (const v of latest.venues) add(v.id, v.name, v.kind, v.subclasses.filter(isVenueId));
  for (const e of latest.entries) add(e.exchange, e.exchange, e.kind);
  for (const s of health.sources) add(s.venue, s.venue, s.kind);
  return { latest, health, venues };
}

// ---------------------------------------------------------------------------
// helpers for the machine-readable outputs (.json / .xml / .md routes)
// ---------------------------------------------------------------------------

export const FEED_CACHE_CONTROL = 'public, s-maxage=3600, stale-while-revalidate=86400';
// error responses (bad query, venue file missing or failing to load) must not be cached
export const ERROR_CACHE_CONTROL = 'no-store';

// 503 for a feed route when the data is unavailable (never cached, so the next poll retries).
export function unavailableResponse(err: ChangelogUnavailableError): Response {
  return new Response(JSON.stringify({ error: 'changelog data is temporarily unavailable, retry later', detail: err.message }), {
    status: 503,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': ERROR_CACHE_CONTROL,
      'Retry-After': '300',
      'Access-Control-Allow-Origin': '*',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

// Weak ETag over the data version + the request shape. A `days=` window moves at UTC midnight,
// so `relativeDays` adds the current day (else pollers would get 304 with yesterday's window).
export function feedEtag(generatedAt: string, variant: string, relativeDays = false): string {
  const day = relativeDays ? `|${utcDay()}` : '';
  return `W/"${createHash('sha256').update(`${generatedAt}|${variant}${day}`).digest('hex').slice(0, 32)}"`;
}

// The venue a feed entry belongs to.
export function venueOf(venues: Map<string, VenueInfo>, e: { kind: VenueKind; exchange: string }): VenueInfo | undefined {
  return venues.get(venueKey(e.kind, e.exchange));
}

export function etagMatches(req: Request, etag: string): boolean {
  const inm = req.headers.get('if-none-match');
  if (!inm) return false;
  return inm.split(',').some((t) => {
    const v = t.trim();
    return v === '*' || v === etag || v.replace(/^W\//, '') === etag.replace(/^W\//, '');
  });
}

export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c);
}

// Inline markdown: escape what could form a link/image ([ ]), HTML (< >), code or emphasis.
export function escapeMarkdownInline(s: string): string {
  return s.replace(/\s+/g, ' ').trim().replace(/([\\`*_[\]<>])/g, '\\$1');
}

// Absolute URL of a docs-app path (feeds must not use relative links).
export function absoluteUrl(path: string): string {
  return `${siteUrl}${basePath}${path}`;
}
