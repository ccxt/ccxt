// CLI: data/entries + data/state -> data/feed/ (what docs.ccxt.com reads).
//   feed/latest.json            LatestFeed, 90-day window, no bodies, <= 1.5 MB (oldest trimmed)
//   feed/<kind>/<id>.json       VenueFeed, 365 days (same undated and removedAt rules as latest), with bodies, <= 1.5 MB
//                               (oldest trimmed); includes entries of other venues' sources shared with it (sharedWith),
//                               grouped by (kind, id)
// Entries of venues or sources no longer in the registry are left out of every feed file.
//   feed/health.json            HealthFeed
//   feed/sources.json           registry summary for the UI
// Unmonitored venues (VenueConfig.unmonitored, no sources) get a venue file with no entries and carry
// `unmonitored` in their VenueSummary, so the docs coverage table can list them with the reason.
import { pathToFileURL } from 'node:url';
import { SCHEMA_VERSION } from './types.ts';
import type { ChangelogEntry, FeedEntry, HealthFeed, LatestFeed, SourceConfig, SourceHealth, VenueConfig, VenueFeed, VenueSummary } from './types.ts';
import { isoDay } from './dates.ts';
import { currentSource, loadRegistry, sharedTargets, venueKey, type Registry } from './registry.ts';
import { emptyState, type SourceState } from './state.ts';
import { sortEntries, Store, writeText } from './store.ts';
import { parseCliArgs } from './args.ts';

export const LATEST_WINDOW_DAYS = 90;
export const VENUE_WINDOW_DAYS = 365;
export const LATEST_BUDGET_BYTES = 1.5 * 1024 * 1024;
// docs.ccxt.com fetches venue files through Next's data cache, which skips anything over 2 MB
export const VENUE_BUDGET_BYTES = 1.5 * 1024 * 1024;

export interface SourcesFeed {
    schemaVersion: typeof SCHEMA_VERSION;
    generatedAt: string;
    venues: {
        id: string;
        kind: VenueConfig['kind'];
        name: string;
        subclasses: string[];
        domains: string[];
        unmonitored?: string;
        sources: { id: string; type: string; link: string; role: 'primary' | 'secondary'; scope?: string; sharedWith?: string[]; expectBlocked?: string }[];
    }[];
}

function daysAgo (now: Date, days: number): string {
    return isoDay (new Date (now.getTime () - days * 86_400_000));
}

// types.ts LatestFeed rule: dated entries by coalesce(effectiveDate, publishedAt) within the window;
// undated entries by firstSeen within the window and only when not backfill.
export function inWindow (e: ChangelogEntry, cutoff: string): boolean {
    const dated = e.effectiveDate ?? e.publishedAt;
    if (dated) {
        return dated >= cutoff;
    }
    return !e.backfill && e.firstSeen.slice (0, 10) >= cutoff;
}

export function toFeedEntry (e: ChangelogEntry): FeedEntry {
    const { body: _body, revisions: _revisions, ...rest } = e;
    return rest;
}

export function buildLatest (entries: ChangelogEntry[], venues: VenueSummary[], now: Date, budget = LATEST_BUDGET_BYTES): { feed: LatestFeed; trimmed: number } {
    const cutoff = daysAgo (now, LATEST_WINDOW_DAYS);
    const selected = sortEntries (entries.filter ((e) => !e.removedAt && inWindow (e, cutoff)).map (toFeedEntry));
    const feed: LatestFeed = { schemaVersion: SCHEMA_VERSION, generatedAt: now.toISOString (), windowDays: LATEST_WINDOW_DAYS, entries: selected, venues };
    return { feed, trimmed: trimToBudget (feed, budget) };
}

// Drops the oldest entries (the list is sorted newest first) until the JSON fits; returns how many.
export function trimToBudget (feed: { entries: unknown[] }, budget: number): number {
    let size = Buffer.byteLength (JSON.stringify (feed));
    let trimmed = 0;
    while (size > budget && feed.entries.length) {
        const dropped = feed.entries.pop ()!;
        size -= Buffer.byteLength (JSON.stringify (dropped)) + 1;
        trimmed++;
    }
    return trimmed;
}

// The sources whose entries belong to a venue: its own plus other venues' sources shared with it.
export function venueSources (registry: Registry): Map<string, { owner: VenueConfig; source: SourceConfig }[]> {
    const out = new Map<string, { owner: VenueConfig; source: SourceConfig }[]> (registry.venues.map ((v) => [ venueKey (v), [] ]));
    for (const owner of registry.venues) {
        for (const source of owner.sources) {
            out.get (venueKey (owner))!.push ({ owner, source });
            for (const target of sharedTargets (registry, owner, source)) {
                out.get (venueKey (target))!.push ({ owner, source });
            }
        }
    }
    return out;
}

// Entries still backed by the registry, grouped by venue key ("kind/id"): each entry lands in its
// own venue and in every venue its source is shared with.
export function groupEntries (registry: Registry, entries: ChangelogEntry[]): { kept: ChangelogEntry[]; byVenue: Map<string, ChangelogEntry[]> } {
    const owners = new Map<string, string> ();          // source id -> owning venue key
    const targets = new Map<string, string[]> ();       // source id -> venue keys it feeds
    for (const [ key, list ] of venueSources (registry)) {
        for (const { owner, source } of list) {
            owners.set (source.id, venueKey (owner));
            targets.set (source.id, [ ...(targets.get (source.id) ?? []), key ]);
        }
    }
    const kept: ChangelogEntry[] = [];
    const byVenue = new Map<string, ChangelogEntry[]> (registry.venues.map ((v) => [ venueKey (v), [] ]));
    for (const e of entries) {
        if (owners.get (e.source) !== `${e.kind}/${e.exchange}`) {
            continue;   // venue or source no longer in the registry (or the source moved venues)
        }
        kept.push (e);
        for (const key of targets.get (e.source)!) {
            byVenue.get (key)!.push (e);
        }
    }
    return { kept, byVenue };
}

function venueSummary (venue: VenueConfig, sources: SourceConfig[], entries: ChangelogEntry[], states: Map<string, SourceState>): VenueSummary {
    let latest: string | null = null;
    for (const e of entries) {
        const d = e.effectiveDate ?? e.publishedAt;
        if (d && !e.removedAt && (!latest || d > latest)) {
            latest = d;
        }
    }
    return {
        id: venue.id,
        kind: venue.kind,
        name: venue.name,
        subclasses: venue.subclasses ?? [],
        domains: venue.domains,
        sources: sources.length,
        healthy: sources.filter ((s) => states.get (s.id)?.health.ok).length,
        latestDate: latest,
        entryCount: entries.length,
        ...(venue.unmonitored ? { unmonitored: venue.unmonitored } : {}),
    };
}

export function buildHealth (registry: Registry, states: Map<string, SourceState>, now: Date): HealthFeed {
    const sources: SourceHealth[] = [];
    for (const venue of registry.venues) {
        for (const s of venue.sources.map ((x) => currentSource (x, now))) {
            const st = states.get (s.id) ?? emptyState (venue, s);
            sources.push ({
                id: s.id,
                venue: venue.id,
                kind: venue.kind,
                type: s.type,
                link: s.link ?? s.url,
                role: s.role ?? 'primary',
                ok: st.health.ok,
                ...(s.expectBlocked ? { expectBlocked: s.expectBlocked } : {}),
                lastRunAt: st.health.lastRunAt,
                lastOkAt: st.health.lastOkAt,
                lastError: st.health.lastRunAt ? st.health.lastError : 'never run',
                consecutiveFailures: st.health.consecutiveFailures,
                entryCount: st.health.entryCount,
                latestDate: st.health.latestDate,
            });
        }
    }
    return { schemaVersion: SCHEMA_VERSION, generatedAt: now.toISOString (), sources };
}

export function buildSources (registry: Registry, now: Date): SourcesFeed {
    return {
        schemaVersion: SCHEMA_VERSION,
        generatedAt: now.toISOString (),
        venues: registry.venues.map ((v) => ({
            id: v.id,
            kind: v.kind,
            name: v.name,
            subclasses: v.subclasses ?? [],
            domains: v.domains,
            ...(v.unmonitored ? { unmonitored: v.unmonitored } : {}),
            sources: v.sources.map ((x) => currentSource (x, now)).map ((s) => ({
                id: s.id,
                type: s.type,
                link: s.link ?? s.url,
                role: s.role ?? 'primary',
                ...(s.scope ? { scope: s.scope } : {}),
                ...(s.sharedWith?.length ? { sharedWith: s.sharedWith } : {}),
                ...(s.expectBlocked ? { expectBlocked: s.expectBlocked } : {}),
            })),
        })),
    };
}

export async function buildFeed (store: Store, registry: Registry, now: Date): Promise<{ latestCount: number; trimmed: number; bytes: number }> {
    const states = new Map<string, SourceState> ();
    for (const venue of registry.venues) {
        for (const s of venue.sources) {
            const st = await store.loadState (s.id);
            if (st) {
                states.set (s.id, st);
            }
        }
    }
    const { kept: all, byVenue } = groupEntries (registry, await store.loadAllEntries ());
    const shared = venueSources (registry);
    const venueCutoff = daysAgo (now, VENUE_WINDOW_DAYS);
    const summaries: VenueSummary[] = [];
    for (const venue of registry.venues) {
        // same window rule as latest.json: undated entries from a first (backfill) run have no
        // known date and would otherwise sort as "today" above every dated entry (Gate's older
        // undated versions); they stay in entries/, and later undated entries count from firstSeen
        // removed entries are left out like in latest.json, so the overview and the venue view agree
        const recent = sortEntries ((byVenue.get (venueKey (venue)) ?? []).filter ((e) => !e.removedAt && inWindow (e, venueCutoff)));
        const summary = venueSummary (venue, (shared.get (venueKey (venue)) ?? []).map ((x) => x.source), recent, states);
        summaries.push (summary);
        const vf: VenueFeed = { schemaVersion: SCHEMA_VERSION, generatedAt: now.toISOString (), venue: summary, entries: recent };
        const venueTrimmed = trimToBudget (vf, VENUE_BUDGET_BYTES);
        if (venueTrimmed) {
            console.warn (`${venueKey (venue)}.json over ${VENUE_BUDGET_BYTES} bytes: trimmed ${venueTrimmed} oldest entries`);
        }
        summary.entryCount = vf.entries.length;
        await writeText (store.feedPath (venue.kind, `${venue.id}.json`), JSON.stringify (vf) + '\n');
    }
    const { feed, trimmed } = buildLatest (all, summaries, now);
    if (trimmed) {
        console.warn (`latest.json over ${LATEST_BUDGET_BYTES} bytes: trimmed ${trimmed} oldest entries`);
    }
    const latestJson = JSON.stringify (feed) + '\n';
    await writeText (store.feedPath ('latest.json'), latestJson);
    await writeText (store.feedPath ('health.json'), JSON.stringify (buildHealth (registry, states, now), null, 1) + '\n');
    await writeText (store.feedPath ('sources.json'), JSON.stringify (buildSources (registry, now), null, 1) + '\n');
    return { latestCount: feed.entries.length, trimmed, bytes: Buffer.byteLength (latestJson) };
}

export async function main (argv: string[]): Promise<number> {
    const args = parseCliArgs (argv);
    const { registry, errors } = await loadRegistry (args.registry);
    if (errors.length) {
        console.error (`registry errors (${args.registry}):\n  ` + errors.join ('\n  '));
        return 1;
    }
    const store = new Store (args.data);
    const result = await buildFeed (store, registry, new Date ());
    console.log (`feed written to ${store.feedPath ()}: latest.json ${result.latestCount} entries, ${(result.bytes / 1024).toFixed (1)} KiB` + (result.trimmed ? `, ${result.trimmed} trimmed` : ''));
    return 0;
}

if (import.meta.url === pathToFileURL (process.argv[1] ?? '').href) {
    process.exitCode = await main (process.argv.slice (2));
}
