import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { ChangelogEntry } from '../src/types.ts';
import { buildLatest, inWindow, toFeedEntry } from '../src/build-feed.ts';
import { sortEntries } from '../src/store.ts';

const NOW = new Date ('2026-11-08T05:30:00Z');

function entry (id: string, fields: Partial<ChangelogEntry>): ChangelogEntry {
    return {
        schemaVersion: 1, id, kind: 'exchange', exchange: 'ex', affects: [ 'ex' ], source: 'ex-src', sourceType: 'md', sourceLink: 'https://example.com',
        title: id, excerpt: 'x', body: 'long body', url: 'https://example.com', publishedAt: null, dateKind: 'firstSeen',
        firstSeen: '2026-11-08T05:23:00.000Z', lastSeen: '2026-11-08T05:23:00.000Z', hash: 'h', backfill: false, tags: [], ccxt: { status: 'new' },
        ...fields,
    };
}

test ('window rules from types.ts', () => {
    const cutoff = '2026-08-10';
    assert.equal (inWindow (entry ('a', { publishedAt: '2026-10-01', backfill: true }), cutoff), true, 'dated backfill entries count by their date');
    assert.equal (inWindow (entry ('b', { publishedAt: '2026-01-01' }), cutoff), false);
    assert.equal (inWindow (entry ('c', { publishedAt: '2026-01-01', effectiveDate: '2026-12-01' }), cutoff), true, 'effectiveDate wins');
    assert.equal (inWindow (entry ('d', { backfill: true }), cutoff), false, 'undated backfill is excluded');
    assert.equal (inWindow (entry ('e', {}), cutoff), true, 'undated, recently first seen');
    assert.equal (inWindow (entry ('f', { firstSeen: '2026-01-01T00:00:00Z' }), cutoff), false);
});

test ('latest.json: windowed, newest first, no bodies, removed entries dropped', () => {
    const entries = [
        entry ('old', { publishedAt: '2025-12-01' }),
        entry ('mid', { publishedAt: '2026-10-01', revisions: [ { at: 'x', hash: 'y' } ] }),
        entry ('future', { effectiveDate: '2026-11-20', dateKind: 'effective' }),
        entry ('undated', {}),
        entry ('gone', { publishedAt: '2026-11-01', removedAt: '2026-11-07T00:00:00Z' }),
    ];
    const { feed, trimmed } = buildLatest (entries, [], NOW);
    assert.equal (trimmed, 0);
    assert.equal (feed.windowDays, 90);
    assert.deepEqual (feed.entries.map ((e) => e.id), [ 'future', 'undated', 'mid' ]);
    assert.ok (feed.entries.every ((e) => !('body' in e) && !('revisions' in e)));
});

test ('latest.json budget trims the oldest entries', () => {
    const entries = Array.from ({ length: 200 }, (_v, i) => entry ('e' + String (i).padStart (3, '0'), { publishedAt: `2026-${String (9 + Math.floor (i / 100)).padStart (2, '0')}-${String (1 + (i % 28)).padStart (2, '0')}`, excerpt: 'x'.repeat (400) }));
    const full = JSON.stringify (buildLatest (entries, [], NOW).feed).length;
    const budget = Math.floor (full / 2);
    const { feed, trimmed } = buildLatest (entries, [], NOW, budget);
    assert.ok (trimmed > 0);
    assert.ok (Buffer.byteLength (JSON.stringify (feed)) <= budget);
    const kept = sortEntries (entries.map (toFeedEntry)).slice (0, feed.entries.length).map ((e) => e.id);
    assert.deepEqual (feed.entries.map ((e) => e.id), kept, 'the newest entries survive');
});
