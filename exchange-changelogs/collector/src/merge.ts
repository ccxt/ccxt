// Merge one successful source run into the venue's entry store (pure, no I/O).
//
//   new id                      -> added (backfill when it is the source's first successful run)
//   known id, different hash    -> revisions[] += { at, hash }, title/body/tags refreshed
//   known id, seen again        -> lastSeen = now, removedAt cleared
//   known id, absent            -> missingRuns[id]++; at REMOVAL_RUNS -> removedAt = now (never deleted)
//                                  (only ids in removalScope when it is given: month-partitioned sources)
//   > MASS_NEW_LIMIT new ids on a non-first run -> all of them backfill (parser re-keyed), and the
//                                  absent ids they replace get removedAt right away (no 3-run overlap)
//   reparse (the source's registry entry or PARSER_VERSION changed since its last parsed run):
//                                  hash changes refresh the entry without a revisions[] item (the
//                                  parser changed, not the page), new ids are backfill and absent
//                                  ids get removedAt right away (a re-keyed or re-filtered parse)
//   known id, same hash             -> derived fields (display title, excerpt, tags, dates) are still
//                                  refreshed from the candidate, so a display/date rule fix applies
import type { ChangelogEntry } from './types.ts';

export const REMOVAL_RUNS = 3;
export const MASS_NEW_LIMIT = 25;

export interface MergeOptions {
    sourceId: string;
    firstRun: boolean;
    trackRemovals: boolean;                 // false for hash sources (synthetic entries are one-off)
    reparse?: boolean;                      // registry entry or PARSER_VERSION changed since the last parsed run
    removalScope?: Set<string>;             // when set, only these ids can go missing (month sources: ids of fetched
                                            // months; rss: ids dated after the oldest item still in the feed)
    missingRuns: Record<string, number>;    // mutated copy is returned
    now: string;
}

export interface MergeResult {
    added: ChangelogEntry[];
    revised: ChangelogEntry[];
    removed: ChangelogEntry[];
    massNew: boolean;
    missingRuns: Record<string, number>;
}

export function mergeEntries (store: Map<string, ChangelogEntry>, candidates: ChangelogEntry[], opts: MergeOptions): MergeResult {
    const added: ChangelogEntry[] = [];
    const revised: ChangelogEntry[] = [];
    const removed: ChangelogEntry[] = [];
    const missingRuns: Record<string, number> = { ...opts.missingRuns };
    const present = new Set<string> ();
    for (const cand of candidates) {
        present.add (cand.id);
        delete missingRuns[cand.id];
        const old = store.get (cand.id);
        if (!old) {
            const entry = { ...cand, backfill: opts.firstRun || Boolean (opts.reparse) };
            store.set (cand.id, entry);
            added.push (entry);
            continue;
        }
        const next: ChangelogEntry = { ...old, lastSeen: opts.now, affects: cand.affects, url: cand.url, sourceLink: cand.sourceLink, scope: cand.scope };
        delete next.removedAt;
        Object.assign (next, {
            hash: cand.hash,
            title: cand.title,
            excerpt: cand.excerpt,
            body: cand.body,
            tags: cand.tags,
            publishedAt: cand.publishedAt,
            effectiveDate: cand.effectiveDate,
            dateKind: cand.dateKind,
        });
        if (next.effectiveDate === undefined) {
            delete next.effectiveDate;
        }
        if (next.body === undefined) {
            delete next.body;
        }
        if (old.hash !== cand.hash && !opts.reparse) {
            next.revisions = [ ...(old.revisions ?? []), { at: opts.now, hash: cand.hash } ];
            revised.push (next);
        }
        if (next.scope === undefined) {
            delete next.scope;
        }
        store.set (cand.id, next);
    }
    const massNew = !opts.firstRun && added.length > MASS_NEW_LIMIT;
    if (massNew) {
        for (const entry of added) {
            entry.backfill = true;
        }
    }
    if (opts.trackRemovals) {
        for (const entry of store.values ()) {
            if (entry.source !== opts.sourceId || present.has (entry.id) || entry.removedAt) {
                continue;
            }
            if (opts.removalScope && !opts.removalScope.has (entry.id)) {
                delete missingRuns[entry.id];
                continue;
            }
            const n = (missingRuns[entry.id] ?? 0) + 1;
            missingRuns[entry.id] = n;
            if (n >= REMOVAL_RUNS || massNew || opts.reparse) {
                entry.removedAt = opts.now;
                delete missingRuns[entry.id];
                removed.push (entry);
            }
        }
    }
    return { added, revised, removed, massNew, missingRuns };
}

// Unchanged source (HTTP 304): everything from the last run is still there.
export function touchEntries (store: Map<string, ChangelogEntry>, ids: string[], now: string): void {
    for (const id of ids) {
        const entry = store.get (id);
        if (entry) {
            entry.lastSeen = now;
        }
    }
}
