import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { ChangelogEntry } from '../src/types.ts';
import { MASS_NEW_LIMIT, mergeEntries } from '../src/merge.ts';
import { entryHash, entryId } from '../src/ids.ts';

function cand (n: number, body = 'body', now = '2026-11-08T05:23:00.000Z'): ChangelogEntry {
    return {
        schemaVersion: 1, id: entryId ('src|' + n), kind: 'exchange', exchange: 'ex', affects: [ 'ex' ], source: 'ex-src', sourceType: 'md',
        sourceLink: 'https://example.com/c', title: `Entry ${n}`, excerpt: body, body, url: 'https://example.com/c', publishedAt: '2026-11-01',
        dateKind: 'published', firstSeen: now, lastSeen: now, hash: entryHash (`Entry ${n}`, body), backfill: false, tags: [], ccxt: { status: 'new' },
    };
}

const opts = (now: string, firstRun = false, missingRuns: Record<string, number> = {}) => ({ sourceId: 'ex-src', firstRun, trackRemovals: true, missingRuns, now });

test ('first run marks everything backfill; later new ids are not backfill', () => {
    const store = new Map<string, ChangelogEntry> ();
    const r1 = mergeEntries (store, [ cand (1), cand (2) ], opts ('t1', true));
    assert.equal (r1.added.length, 2);
    assert.ok ([ ...store.values () ].every ((e) => e.backfill));
    const r2 = mergeEntries (store, [ cand (1), cand (2), cand (3) ], opts ('t2'));
    assert.equal (r2.added.length, 1);
    assert.equal (store.get (cand (3).id)!.backfill, false);
    assert.equal (store.get (cand (1).id)!.lastSeen, 't2');
    assert.equal (store.get (cand (1).id)!.firstSeen, '2026-11-08T05:23:00.000Z');
});

test ('changed hash adds a revision and refreshes the content', () => {
    const store = new Map<string, ChangelogEntry> ();
    mergeEntries (store, [ cand (1) ], opts ('t1', true));
    const r = mergeEntries (store, [ cand (1, 'edited body') ], opts ('t2'));
    assert.equal (r.revised.length, 1);
    const e = store.get (cand (1).id)!;
    assert.deepEqual (e.revisions, [ { at: 't2', hash: entryHash ('Entry 1', 'edited body') } ]);
    assert.equal (e.body, 'edited body');
    assert.equal (e.backfill, true, 'backfill flag is kept');
    const again = mergeEntries (store, [ cand (1, 'edited body') ], opts ('t3'));
    assert.equal (again.revised.length, 0);
});

test ('ids missing for 3 consecutive successful runs get removedAt; reappearing clears it', () => {
    const store = new Map<string, ChangelogEntry> ();
    let missing = mergeEntries (store, [ cand (1), cand (2) ], opts ('t1', true)).missingRuns;
    for (const t of [ 't2', 't3' ]) {
        const r = mergeEntries (store, [ cand (1) ], opts (t, false, missing));
        missing = r.missingRuns;
        assert.equal (r.removed.length, 0);
    }
    assert.equal (missing[cand (2).id], 2);
    const r4 = mergeEntries (store, [ cand (1) ], opts ('t4', false, missing));
    assert.equal (r4.removed.length, 1);
    assert.equal (store.get (cand (2).id)!.removedAt, 't4');
    assert.equal (store.size, 2, 'never hard-deleted');
    mergeEntries (store, [ cand (1), cand (2) ], opts ('t5', false, r4.missingRuns));
    assert.equal (store.get (cand (2).id)!.removedAt, undefined);
});

test ('a missing id resets its counter when seen again', () => {
    const store = new Map<string, ChangelogEntry> ();
    let missing = mergeEntries (store, [ cand (1), cand (2) ], opts ('t1', true)).missingRuns;
    missing = mergeEntries (store, [ cand (1) ], opts ('t2', false, missing)).missingRuns;
    missing = mergeEntries (store, [ cand (1), cand (2) ], opts ('t3', false, missing)).missingRuns;
    assert.equal (missing[cand (2).id], undefined);
});

test ('mass-new guard: > 25 new ids on a non-first run are backfill', () => {
    const store = new Map<string, ChangelogEntry> ();
    mergeEntries (store, [ cand (0) ], opts ('t1', true));
    const many = Array.from ({ length: MASS_NEW_LIMIT + 1 }, (_v, i) => cand (i + 1));
    const r = mergeEntries (store, [ cand (0), ...many ], opts ('t2'));
    assert.equal (r.massNew, true);
    assert.ok (r.added.every ((e) => e.backfill));
    const store2 = new Map<string, ChangelogEntry> ();
    mergeEntries (store2, [ cand (0) ], opts ('t1', true));
    const few = Array.from ({ length: MASS_NEW_LIMIT }, (_v, i) => cand (i + 1));
    const r2 = mergeEntries (store2, [ cand (0), ...few ], opts ('t2'));
    assert.equal (r2.massNew, false);
    assert.ok (r2.added.every ((e) => !e.backfill));
});

test ('mass-new guard: the absent ids the new ones replace are removed right away', () => {
    const store = new Map<string, ChangelogEntry> ();
    const old = Array.from ({ length: MASS_NEW_LIMIT + 1 }, (_v, i) => cand (i));
    mergeEntries (store, old, opts ('t1', true));
    const rekeyed = Array.from ({ length: MASS_NEW_LIMIT + 1 }, (_v, i) => cand (100 + i));
    const r = mergeEntries (store, rekeyed, { ...opts ('t2'), removalScope: new Set (old.slice (1).map ((e) => e.id)) });
    assert.equal (r.massNew, true);
    assert.equal (r.removed.length, MASS_NEW_LIMIT, 'only ids in the removal scope');
    assert.ok (old.slice (1).every ((e) => store.get (e.id)!.removedAt === 't2'));
    assert.equal (store.get (old[0].id)!.removedAt, undefined);
});

test ('hash sources do not track removals', () => {
    const store = new Map<string, ChangelogEntry> ();
    mergeEntries (store, [ cand (1) ], { ...opts ('t1'), trackRemovals: false });
    for (const t of [ 't2', 't3', 't4', 't5' ]) {
        mergeEntries (store, [], { ...opts (t), trackRemovals: false });
    }
    assert.equal (store.get (cand (1).id)!.removedAt, undefined);
});
