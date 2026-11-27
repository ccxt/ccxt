// CLI: fetch every selected source, parse it, merge entries and record health.
//   node --import tsx src/collect.ts [--venue bybit,prediction/binance] [--source okx-log] [--data dir] [--registry dir]
// --venue takes "id" (every kind with that id) or "kind/id".
// Month sources ({yyyy}/{mm} in url) fetch `months` files, newest first, with no conditional GET;
// `discover` sources fetch the discovery page first and send validators only for the same url.
// Validators are only sent while the source's registry entry and PARSER_VERSION are unchanged, so
// a url, filter or parser fix is applied on the next run instead of waiting for an upstream change.
// gh-commits sources send `Authorization: Bearer $GITHUB_TOKEN` (when set) to api.github.com only.
// Exit code: 0 even when sources fail (health records it); 1 on registry/validation errors.
import { pathToFileURL } from 'node:url';
import type { ChangelogEntry, SourceConfig, VenueConfig } from './types.ts';
import { ADAPTERS, type ParsedEntry } from './adapters/index.ts';
import { absoluteUrl } from './adapters/types.ts';
import { githubHeaders } from './adapters/ghcommits.ts';
import { affectsFor, anchorFragment, buildEntries, isSynthetic } from './entries.ts';
import { fetchSource, type FetchError, type FetchOptions, type FetchResult } from './fetch.ts';
import { sha256 } from './ids.ts';
import { extractDate } from './dates.ts';
import { mergeEntries, touchEntries } from './merge.ts';
import { currentSource, expandMonth, hasMonthPlaceholders, loadRegistry, selectSources, sourceMonths, type Registry } from './registry.ts';
import { emptyState, recordFailure, type SourceState } from './state.ts';
import { Store } from './store.ts';
import { parseCliArgs } from './args.ts';

export type Fetcher = (url: string, options: FetchOptions) => Promise<FetchResult>;

// Sources the registry marks expectBlocked (datacenter IPs get a 403 or a challenge page) are tried
// once: retrying only adds load on a host that has already said no.
function noRetry (source: SourceConfig): Pick<FetchOptions, 'retries'> {
    return source.expectBlocked ? { retries: 0 } : {};
}

// Bump when a parser change should re-parse every source on the next run (drops HTTP validators).
// A run after a bump (or after the source's registry entry changed) is a "reparse": see reparseOf.
export const PARSER_VERSION = 8;

function stableJson (v: unknown): string {
    if (Array.isArray (v)) {
        return '[' + v.map (stableJson).join (',') + ']';
    }
    if (v && typeof v === 'object') {
        const o = v as Record<string, unknown>;
        return '{' + Object.keys (o).sort ().filter ((k) => o[k] !== undefined).map ((k) => JSON.stringify (k) + ':' + stableJson (o[k])).join (',') + '}';
    }
    return JSON.stringify (v);
}

export function sourceConfigHash (source: SourceConfig, parserVersion: number = PARSER_VERSION): string {
    return sha256 (`${parserVersion}|${stableJson (source)}`);
}

// What changed on our side since the source's last parsed run. Either one makes the run a reparse:
// hash/spec sources re-baseline (the new snapshot is stored, no "Docs changed" entry, since a
// strip/slice/parser change alters the text without the page changing), hash differences are not
// revisions, new ids are backfill and absent ids are removed at once (mergeEntries). A registry
// change also skips the entry-count drift check (a new filter may drop most entries on purpose).
export function reparseOf (source: SourceConfig, state: SourceState, hasHistory: boolean): { registryChanged: boolean; parserChanged: boolean } {
    if (!hasHistory) {
        return { registryChanged: false, parserChanged: false };
    }
    const version = state.parserVersion ?? 1;
    return {
        registryChanged: state.configHash !== undefined && state.configHash !== sourceConfigHash (source, version),
        parserChanged: version !== PARSER_VERSION,
    };
}

// Sources whose entry count may legitimately drop or be zero: page/spec diffs (one-off synthetic
// entries) and commit lists (noise commits are filtered out of a fixed-size page).
function countIsStable (source: SourceConfig): boolean {
    return !isSynthetic (source) && source.type !== 'gh-commits';
}

// Request headers for a source: registry headers, plus GitHub API headers for gh-commits.
export function requestHeaders (source: SourceConfig, url: string): Record<string, string> | undefined {
    if (source.type !== 'gh-commits') {
        return source.headers;
    }
    return { ...(source.headers ?? {}), ...githubHeaders (url) };
}

export interface SourceSummary {
    source: string;
    venue: string;
    ok: boolean;
    status: 'ok' | 'unchanged' | 'failed';
    entries: number;
    added: number;
    revised: number;
    removed: number;
    backfill: boolean;
    latestDate: string | null;
    error: string | null;
}

type Outcome =
    | { kind: 'failed'; error: string }
    | { kind: 'unchanged' }
    | {
        kind: 'parsed';
        candidates: ChangelogEntry[];
        snapshot: string;
        reparse: boolean;
        feedDates: string[];                    // dates of every parsed item before filters (rss removal scope)
        etag?: string;
        lastModified?: string;
        resolvedUrl?: string;                   // discover: the url that was fetched
        months?: Record<string, string[]>;      // month sources: ids per fetched month (union over runs)
        removalScope?: Set<string>;             // month sources: only these ids can be marked removed
    };

interface CollectOptions {
    store: Store;
    registry: Registry;
    now: Date;
    fetcher?: Fetcher;
}

interface Part {
    url: string;
    link: string;
    month?: string;             // "YYYY-MM" for month-partitioned sources
    body: string;
    contentType: string;
    etag?: string;
    lastModified?: string;
}

type Fetched = { kind: 'unchanged' } | { kind: 'fetched'; parts: Part[]; resolvedUrl?: string };

// discover: fetch the index page and take the first capture group of the pattern as the url.
export async function discoverUrl (source: SourceConfig, fetcher: Fetcher): Promise<string> {
    const d = source.discover!;
    const res = await fetcher (d.url, { headers: source.headers, ...noRetry (source) });
    if (res.status !== 'ok') {
        throw new Error (`discover: unexpected HTTP 304 from ${d.url}`);
    }
    const m = new RegExp (d.pattern).exec (res.body);
    if (!m || !m[1]) {
        throw new Error (`discover: pattern /${d.pattern}/ not found in ${d.url}`);
    }
    const url = new URL (m[1].replace (/&amp;/g, '&'), d.url);
    if (url.protocol !== 'https:') {
        throw new Error (`discover: ${url} is not https`);
    }
    return url.toString ();
}

async function fetchParts (source: SourceConfig, state: SourceState, hasHistory: boolean, opts: CollectOptions): Promise<Fetched> {
    const fetcher = opts.fetcher ?? fetchSource;
    if (hasMonthPlaceholders (source.url)) {
        // newest month first, like the files themselves; no conditional GET (several urls)
        const parts: Part[] = [];
        for (const [ i, m ] of sourceMonths (source, opts.now).entries ()) {
            const url = expandMonth (source.url, m.year, m.month);
            const link = expandMonth (source.link ?? source.url, m.year, m.month);
            try {
                const res = await fetcher (url, { headers: source.headers, ...noRetry (source) });
                if (res.status === 'ok') {
                    parts.push ({ url, link, month: m.key, body: res.body, contentType: res.contentType });
                }
            } catch (e) {
                // the current month's file may not exist yet on the 1st
                if (i === 0 && (e as FetchError).httpStatus === 404) {
                    parts.push ({ url, link, month: m.key, body: '', contentType: '' });
                    continue;
                }
                throw new Error (`${m.key}: ${(e as Error).message}`);
            }
        }
        return { kind: 'fetched', parts };
    }
    let url = source.url;
    if (source.discover) {
        url = await discoverUrl (source, fetcher);
    }
    // validators only belong to the url and the source config they came from
    const sameUrl = !source.discover || state.resolvedUrl === url;
    const reuse = hasHistory && sameUrl && state.configHash === sourceConfigHash (source);
    const res = await fetcher (url, {
        headers: requestHeaders (source, url),
        etag: reuse ? state.etag : undefined,
        lastModified: reuse ? state.lastModified : undefined,
        ...noRetry (source),
    });
    if (res.status === 'unchanged') {
        return { kind: 'unchanged' };
    }
    const part: Part = { url, link: source.link ?? source.url, body: res.body, contentType: res.contentType, etag: res.etag, lastModified: res.lastModified };
    return { kind: 'fetched', parts: [ part ], ...(source.discover ? { resolvedUrl: url } : {}) };
}

async function parseParts (source: SourceConfig, parts: Part[], previousSnapshot: string | null, now: Date): Promise<{ entries: ParsedEntry[]; snapshot: string }> {
    const adapter = ADAPTERS[source.type];
    const run = (part: Part, body: string) => adapter ({ source: { ...source, url: part.url, link: part.link }, body, contentType: part.contentType, url: part.url, previousSnapshot, now });
    if (parts.length === 1 && !parts[0].month) {
        return run (parts[0], parts[0].body);
    }
    if (source.type === 'hash') {
        return run (parts[0], parts.map ((p) => p.body).join ('\n\n'));
    }
    const entries: ParsedEntry[] = [];
    const snapshots: string[] = [];
    for (const part of parts) {
        if (!part.body.trim ()) {
            continue;
        }
        const out = await run (part, part.body);
        for (const e of out.entries) {
            entries.push ({
                ...e,
                partition: part.month,
                link: e.link ?? (e.anchor ? absoluteUrl ('#' + anchorFragment (e.anchor), part.link) : undefined),
            });
        }
        snapshots.push (out.snapshot);
    }
    return { entries, snapshot: snapshots.join ('\n\n') };
}

async function runSource (venue: VenueConfig, source: SourceConfig, state: SourceState, previousSnapshot: string | null, opts: CollectOptions): Promise<Outcome> {
    const hasHistory = state.successfulRuns > 0 && previousSnapshot !== null;
    const { registryChanged, parserChanged } = reparseOf (source, state, hasHistory);
    const reparse = registryChanged || parserChanged;
    let fetched: Fetched;
    try {
        fetched = await fetchParts (source, state, hasHistory, opts);
    } catch (e) {
        return { kind: 'failed', error: (e as Error).message };
    }
    if (fetched.kind === 'unchanged') {
        return { kind: 'unchanged' };
    }
    const monthly = hasMonthPlaceholders (source.url);
    const partitions = new Map<string, string> ();
    let candidates: ChangelogEntry[];
    let snapshot: string;
    let feedDates: string[] = [];
    try {
        const out = await parseParts (source, fetched.parts, (reparse && isSynthetic (source)) ? null : previousSnapshot, opts.now);
        snapshot = out.snapshot;
        feedDates = out.entries.map ((e) => extractDate (e.dateText, undefined, source.date?.order, opts.now)).filter ((d): d is string => d !== null);
        candidates = buildEntries (out.entries, {
            venue,
            source: currentSource (source, opts.now),
            affects: affectsFor (venue, source, opts.registry),
            now: opts.now,
            firstRun: state.successfulRuns === 0,
            partitions,
        });
    } catch (e) {
        return { kind: 'failed', error: `parse error: ${(e as Error).message}` };
    }
    const minEntries = source.minEntries ?? (countIsStable (source) ? 1 : 0);
    // months: 1 on the 1st of a month: the only fetched file is the current month's 404 (empty)
    const only404 = monthly && fetched.parts.every ((p) => !p.body.trim ());
    if (candidates.length < minEntries && !only404) {
        return { kind: 'failed', error: `parser drift: ${candidates.length} entries (minEntries ${minEntries})` };
    }
    // month sources: compare with what the last run saw in the months fetched now, so a month
    // rolling out of the window is not drift; only ids of fetched months can be marked removed
    let previousCount = state.health.entryCount;
    let months: Record<string, string[]> | undefined;
    let removalScope: Set<string> | undefined;
    if (monthly) {
        const fetchedMonths = fetched.parts.map ((p) => p.month!);
        const oldIds = new Set (fetchedMonths.flatMap ((m) => state.months?.[m] ?? []));
        if (state.months) {
            previousCount = state.lastIds.filter ((id) => oldIds.has (id)).length;
        }
        months = {};
        for (const m of fetchedMonths) {
            const now = candidates.filter ((c) => partitions.get (c.id) === m).map ((c) => c.id);
            months[m] = [ ...new Set ([ ...(state.months?.[m] ?? []), ...now ]) ];
        }
        removalScope = new Set (Object.values (months).flat ());
    }
    if (countIsStable (source) && !registryChanged && state.successfulRuns > 0 && previousCount > 0 && candidates.length < previousCount * 0.5) {
        return { kind: 'failed', error: `parser drift: entry count dropped from ${previousCount} to ${candidates.length} (>50%)` };
    }
    const part = fetched.parts[0];
    return {
        kind: 'parsed',
        candidates,
        snapshot,
        reparse,
        feedDates,
        ...(monthly ? {} : { etag: part.etag, lastModified: part.lastModified }),
        ...(fetched.resolvedUrl ? { resolvedUrl: fetched.resolvedUrl } : {}),
        ...(months ? { months, removalScope } : {}),
    };
}

// RSS feeds (and PyPI releases.xml) carry only the newest N items: an item rolling off the end is
// not a deletion. Only stored items dated after the oldest item still in the feed can go missing.
// `feedDates` (the pubDates of every item, filtered out or not) also count, so items a new
// titleFilter drops can go missing even when no item passes the filter.
export function rssRemovalScope (store: Map<string, ChangelogEntry>, sourceId: string, candidates: ChangelogEntry[], feedDates: string[] = []): Set<string> {
    const dateOf = (e: ChangelogEntry) => e.publishedAt ?? e.effectiveDate ?? null;
    const dates = [ ...candidates.map (dateOf), ...feedDates ].filter ((d): d is string => d !== null).sort ();
    const scope = new Set<string> ();
    if (!dates.length) {
        return scope;
    }
    for (const e of store.values ()) {
        const d = dateOf (e);
        if (e.source === sourceId && d !== null && d > dates[0]) {
            scope.add (e.id);
        }
    }
    return scope;
}

function latestDateOf (store: Map<string, ChangelogEntry>, sourceId: string): string | null {
    let latest: string | null = null;
    for (const e of store.values ()) {
        if (e.source !== sourceId || e.removedAt) {
            continue;
        }
        for (const d of [ e.publishedAt, e.effectiveDate ]) {
            if (d && (!latest || d > latest)) {
                latest = d;
            }
        }
    }
    return latest;
}

export async function collectVenue (venue: VenueConfig, sources: SourceConfig[], opts: CollectOptions): Promise<SourceSummary[]> {
    const { store } = opts;
    const nowIso = opts.now.toISOString ();
    const entries = await store.loadEntries (venue.kind, venue.id);
    const prepared = await Promise.all (sources.map (async (source) => {
        const state = (await store.loadState (source.id)) ?? emptyState (venue, source);
        const previousSnapshot = await store.loadSnapshot (source.id);
        const outcome = await runSource (venue, source, state, previousSnapshot, opts);
        return { source, state, outcome };
    }));
    const summaries: SourceSummary[] = [];
    // merge serially: all sources of a venue share one entries file
    for (const { source, state, outcome } of prepared) {
        const summary: SourceSummary = { source: source.id, venue: venue.id, ok: false, status: 'failed', entries: 0, added: 0, revised: 0, removed: 0, backfill: false, latestDate: null, error: null };
        let next: SourceState;
        if (outcome.kind === 'failed') {
            next = recordFailure (state, outcome.error, nowIso);
            summary.error = outcome.error;
            summary.entries = state.health.entryCount;
        } else {
            next = { ...state, health: { ...state.health, ok: true, lastRunAt: nowIso, lastOkAt: nowIso, lastError: null, consecutiveFailures: 0 } };
            if (outcome.kind === 'unchanged') {
                touchEntries (entries, state.lastIds, nowIso);
                next.successfulRuns = state.successfulRuns + 1;
                summary.status = 'unchanged';
                summary.entries = state.health.entryCount;
            } else {
                const firstRun = state.successfulRuns === 0;
                const merged = mergeEntries (entries, outcome.candidates, {
                    sourceId: source.id,
                    firstRun,
                    trackRemovals: !isSynthetic (source),
                    reparse: outcome.reparse,
                    // rss feeds and commit lists are the newest N items: rolling off the end is not a removal
                    removalScope: outcome.removalScope ?? ((source.type === 'rss' || source.type === 'gh-commits') ? rssRemovalScope (entries, source.id, outcome.candidates, outcome.feedDates) : undefined),
                    missingRuns: state.missingRuns,
                    now: nowIso,
                });
                const contentHash = sha256 (outcome.snapshot);
                next = {
                    ...next,
                    configHash: sourceConfigHash (source),
                    parserVersion: PARSER_VERSION,
                    etag: outcome.etag,
                    lastModified: outcome.lastModified,
                    contentHash,
                    lastPageChangeAt: (contentHash !== state.contentHash) ? nowIso : state.lastPageChangeAt,
                    successfulRuns: state.successfulRuns + 1,
                    lastIds: outcome.candidates.map ((c) => c.id),
                    missingRuns: merged.missingRuns,
                    health: { ...next.health, entryCount: outcome.candidates.length },
                };
                if (outcome.resolvedUrl) {
                    next.resolvedUrl = outcome.resolvedUrl;
                }
                if (outcome.months) {
                    next.months = outcome.months;
                }
                await store.saveSnapshot (source.id, outcome.snapshot);
                summary.status = 'ok';
                summary.entries = outcome.candidates.length;
                summary.added = merged.added.length;
                summary.revised = merged.revised.length;
                summary.removed = merged.removed.length;
                summary.backfill = firstRun || merged.massNew;
                if (merged.massNew) {
                    console.warn (`[${source.id}] mass-new guard: ${merged.added.length} new ids on a non-first run, marked as backfill`);
                }
            }
            summary.ok = true;
        }
        next.health.latestDate = latestDateOf (entries, source.id) ?? state.health.latestDate;
        summary.latestDate = next.health.latestDate;
        await store.saveState (next);
        summaries.push (summary);
    }
    await store.saveEntries (venue.kind, venue.id, entries.values ());
    return summaries;
}

export async function collect (opts: CollectOptions & { venues: string[]; sources: string[] }): Promise<SourceSummary[]> {
    const selected = selectSources (opts.registry, opts.venues, opts.sources);
    const results = await Promise.all (selected.map (({ venue, sources }) => collectVenue (venue, sources, opts)));
    return results.flat ();
}

export function formatSummary (rows: SourceSummary[]): string {
    const header = [ 'source', 'status', 'entries', 'new', 'rev', 'gone', 'latest', 'error' ];
    const table = rows.map ((r) => [
        r.source,
        r.status + (r.backfill ? ' (backfill)' : ''),
        String (r.entries),
        String (r.added),
        String (r.revised),
        String (r.removed),
        r.latestDate ?? '-',
        (r.error ?? '').slice (0, 80),
    ]);
    const widths = header.map ((h, i) => Math.max (h.length, ...table.map ((row) => row[i].length)));
    const fmt = (row: string[]) => row.map ((c, i) => c.padEnd (widths[i])).join ('  ').trimEnd ();
    const ok = rows.filter ((r) => r.ok).length;
    return [ fmt (header), fmt (widths.map ((w) => '-'.repeat (w))), ...table.map (fmt), '', `${ok}/${rows.length} sources ok` ].join ('\n');
}

export async function main (argv: string[]): Promise<number> {
    const args = parseCliArgs (argv);
    const { registry, errors } = await loadRegistry (args.registry);
    if (errors.length) {
        console.error (`registry errors (${args.registry}):\n  ` + errors.join ('\n  '));
        return 1;
    }
    if (registry.venues.length === 0) {
        console.error (`no venues found in ${args.registry}/{exchange,prediction}/*.json`);
        return 1;
    }
    let rows: SourceSummary[];
    try {
        rows = await collect ({ store: new Store (args.data), registry, now: new Date (), venues: args.venues, sources: args.sources });
    } catch (e) {
        console.error ((e as Error).message);
        return 1;
    }
    console.log (formatSummary (rows));
    return 0;
}

if (import.meta.url === pathToFileURL (process.argv[1] ?? '').href) {
    process.exitCode = await main (process.argv.slice (2));
}
