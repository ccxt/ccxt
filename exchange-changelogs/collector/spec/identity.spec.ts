// Venue identity is kind + id (exchange/binance and prediction/binance are two venues),
// sharedWith resolution, --venue selection and build-feed grouping.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { ChangelogEntry, LatestFeed, SourceConfig, VenueConfig, VenueFeed } from '../src/types.ts';
import { findVenues, loadRegistry, makeRegistry, resolveShared, selectSources } from '../src/registry.ts';
import { affectsFor } from '../src/entries.ts';
import { buildFeed, groupEntries } from '../src/build-feed.ts';
import { Store } from '../src/store.ts';

const src = (id: string, extra: Partial<SourceConfig> = {}): SourceConfig => ({ id, type: 'md', url: `https://docs.example.com/${id}.md`, ...extra });
const venue = (kind: VenueConfig['kind'], id: string, sources: SourceConfig[], extra: Partial<VenueConfig> = {}): VenueConfig =>
    ({ id, kind, name: `${id} (${kind})`, domains: [ 'example.com' ], sources, ...extra });

const venues: VenueConfig[] = [
    venue ('exchange', 'binance', [ src ('binance-spot') ], { subclasses: [ 'binanceusdm' ] }),
    venue ('prediction', 'binance', [ src ('binance-prediction') ], { domains: [ 'binance.com', 'example.com' ] }),
    venue ('exchange', 'kraken', [ src ('kraken-changelog', { sharedWith: [ 'krakenfutures' ] }) ]),
    venue ('exchange', 'krakenfutures', []),
    venue ('prediction', 'hyperliquid', [ src ('hyperliquid-hip4', { sharedWith: [ 'exchange/hyperliquid' ] }) ]),
    venue ('exchange', 'hyperliquid', [ src ('hyperliquid-info') ], { subclasses: [ 'hl' ] }),
];

test ('loadRegistry: the same id under both kinds is two venues; duplicates are per kind', async () => {
    const dir = await mkdtemp (join (tmpdir (), 'registry-'));
    await mkdir (join (dir, 'exchange'));
    await mkdir (join (dir, 'prediction'));
    for (const v of venues) {
        await writeFile (join (dir, v.kind, `${v.id}.json`), JSON.stringify (v));
    }
    let r = await loadRegistry (dir);
    assert.deepEqual (r.errors, []);
    assert.deepEqual (r.registry.venues.map ((v) => `${v.kind}/${v.id}`), [
        'exchange/binance', 'prediction/binance', 'exchange/hyperliquid', 'prediction/hyperliquid', 'exchange/kraken', 'exchange/krakenfutures',
    ]);
    // a source id is still globally unique
    await writeFile (join (dir, 'prediction', 'binance.json'), JSON.stringify (venue ('prediction', 'binance', [ src ('binance-spot') ])));
    r = await loadRegistry (dir);
    assert.match (r.errors.join ('\n'), /duplicate source id "binance-spot" \(exchange\/binance and prediction\/binance\)/);
    // unknown and self sharedWith
    await writeFile (join (dir, 'prediction', 'binance.json'), JSON.stringify (venue ('prediction', 'binance', [ src ('binance-p', { sharedWith: [ 'prediction/kraken', 'prediction/binance' ] }) ])));
    r = await loadRegistry (dir);
    assert.match (r.errors.join ('\n'), /sharedWith unknown venue "prediction\/kraken"/);
    assert.match (r.errors.join ('\n'), /sharedWith its own venue "prediction\/binance"/);
});

test ('venue refs: "id" means every kind, "kind/id" one venue; sharedWith prefers the same kind', () => {
    const registry = makeRegistry (venues);
    assert.deepEqual (findVenues (registry, 'binance').map ((v) => v.kind), [ 'exchange', 'prediction' ]);
    assert.deepEqual (findVenues (registry, 'binance', 'prediction').map ((v) => v.kind), [ 'prediction', 'exchange' ]);
    assert.deepEqual (findVenues (registry, 'prediction/binance').map ((v) => v.kind), [ 'prediction' ]);
    assert.deepEqual (findVenues (registry, 'prediction/kraken'), []);
    const kraken = venues[2];
    assert.equal (resolveShared (registry, kraken, 'krakenfutures')?.kind, 'exchange');
    // "krakenfutures" only exists as an exchange: a prediction owner falls back to the other kind
    assert.equal (resolveShared (registry, venues[1], 'krakenfutures')?.kind, 'exchange');
    assert.equal (resolveShared (registry, venues[1], 'binance')?.kind, 'prediction', 'same kind first');
    assert.deepEqual (affectsFor (kraken, kraken.sources[0], registry), [ 'kraken', 'krakenfutures' ]);
    assert.deepEqual (affectsFor (venues[4], venues[4].sources[0], registry), [ 'hyperliquid', 'hl' ]);
});

test ('--venue selection by id or kind/id', () => {
    const registry = makeRegistry (venues);
    assert.deepEqual (selectSources (registry, [ 'binance' ], []).map ((x) => x.sources[0].id), [ 'binance-spot', 'binance-prediction' ]);
    assert.deepEqual (selectSources (registry, [ 'prediction/binance' ], []).map ((x) => x.sources[0].id), [ 'binance-prediction' ]);
    assert.deepEqual (selectSources (registry, [ 'exchange/binance', 'kraken' ], []).map ((x) => x.venue.id), [ 'binance', 'kraken' ]);
    assert.throws (() => selectSources (registry, [ 'prediction/okx' ], []), /unknown venue\(s\): prediction\/okx/);
});

function entry (kind: VenueConfig['kind'], exchange: string, source: string, id: string, extra: Partial<ChangelogEntry> = {}): ChangelogEntry {
    return {
        schemaVersion: 1, id, kind, exchange, affects: [ exchange ], source, sourceType: 'md', sourceLink: 'https://example.com', title: id, excerpt: id,
        body: id, url: 'https://example.com', publishedAt: '2026-11-01', dateKind: 'published', firstSeen: '2026-11-02T00:00:00.000Z',
        lastSeen: '2026-11-02T00:00:00.000Z', hash: 'h', backfill: true, tags: [], ccxt: { status: 'new' }, ...extra,
    };
}

test ('build-feed groups by (kind, id), adds shared entries, drops removed sources', async () => {
    const registry = makeRegistry (venues);
    const entries = [
        entry ('exchange', 'binance', 'binance-spot', 'e1'),
        entry ('prediction', 'binance', 'binance-prediction', 'p1'),
        entry ('exchange', 'kraken', 'kraken-changelog', 'k1', { affects: [ 'kraken', 'krakenfutures' ] }),
        entry ('exchange', 'binance', 'binance-dropped-source', 'gone'),
        entry ('exchange', 'okx', 'okx-log', 'no-venue'),
        entry ('prediction', 'hyperliquid', 'hyperliquid-hip4', 'h1'),
    ];
    const { kept, byVenue } = groupEntries (registry, entries);
    assert.deepEqual (kept.map ((e) => e.id), [ 'e1', 'p1', 'k1', 'h1' ]);
    assert.deepEqual (byVenue.get ('exchange/binance')!.map ((e) => e.id), [ 'e1' ]);
    assert.deepEqual (byVenue.get ('prediction/binance')!.map ((e) => e.id), [ 'p1' ]);
    assert.deepEqual (byVenue.get ('exchange/krakenfutures')!.map ((e) => e.id), [ 'k1' ]);
    assert.deepEqual (byVenue.get ('exchange/hyperliquid')!.map ((e) => e.id), [ 'h1' ], 'kind/id sharedWith across kinds');
    // end to end through the store
    const dir = await mkdtemp (join (tmpdir (), 'feed-'));
    const store = new Store (dir);
    // an undated backfill entry (no known date) stays out of the venue feed, like latest.json
    const undated = entry ('exchange', 'binance', 'binance-spot', 'undated', { publishedAt: null, dateKind: 'firstSeen' });
    await store.saveEntries ('exchange', 'binance', [ ...entries.filter ((e) => e.kind === 'exchange' && e.exchange === 'binance'), undated ]);
    await store.saveEntries ('prediction', 'binance', [ entries[1] ]);
    await store.saveEntries ('exchange', 'kraken', [ entries[2] ]);
    await store.saveEntries ('exchange', 'okx', [ entries[4] ]);
    await buildFeed (store, registry, new Date ('2026-11-08T00:00:00Z'));
    const ex = JSON.parse (await readFile (store.feedPath ('exchange', 'binance.json'), 'utf8')) as VenueFeed;
    const pr = JSON.parse (await readFile (store.feedPath ('prediction', 'binance.json'), 'utf8')) as VenueFeed;
    const kf = JSON.parse (await readFile (store.feedPath ('exchange', 'krakenfutures.json'), 'utf8')) as VenueFeed;
    assert.deepEqual (ex.entries.map ((e) => e.id), [ 'e1' ]);
    assert.deepEqual (pr.entries.map ((e) => e.id), [ 'p1' ]);
    assert.deepEqual ([ ex.venue.entryCount, pr.venue.entryCount ], [ 1, 1 ]);
    assert.deepEqual (pr.venue.domains, [ 'binance.com', 'example.com' ]);
    assert.deepEqual ([ kf.entries.length, kf.venue.sources, kf.venue.latestDate ], [ 1, 1, '2026-11-01' ], 'shared source counted for krakenfutures');
    const latest = JSON.parse (await readFile (store.feedPath ('latest.json'), 'utf8')) as LatestFeed;
    assert.deepEqual (latest.entries.map ((e) => e.id).sort (), [ 'e1', 'k1', 'p1' ], 'removed sources and venues are left out');
    assert.ok (latest.venues.every ((v) => Array.isArray (v.domains) && v.domains.length > 0));
});
