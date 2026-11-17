import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { HealthFeed, LatestFeed, VenueConfig, VenueFeed } from '../src/types.ts';
import { collect, type Fetcher } from '../src/collect.ts';
import { buildFeed } from '../src/build-feed.ts';
import { FetchError, type FetchResult } from '../src/fetch.ts';
import { makeRegistry, type Registry } from '../src/registry.ts';
import { Store } from '../src/store.ts';
import { BYBIT, fixture, KALSHI, OKX } from './helpers.ts';

const venues: VenueConfig[] = [
    { id: 'bybit', kind: 'exchange', name: 'Bybit', subclasses: [ 'bybiteu' ], domains: [ 'bybit.com', 'bybit-exchange.github.io' ], sources: [ BYBIT ] },
    { id: 'kalshi', kind: 'prediction', name: 'Kalshi', domains: [ 'kalshi.com' ], sources: [ KALSHI ] },
    { id: 'okx', kind: 'exchange', name: 'OKX', subclasses: [ 'myokx' ], domains: [ 'okx.com' ], sources: [ OKX, { id: 'okx-api', type: 'hash', url: 'https://www.okx.com/docs-v5/en/', minChange: 0 } ] },
];
const registry: Registry = makeRegistry (venues);

type Responder = (url: string, etag?: string) => FetchResult;
function fakeFetcher (respond: Responder): Fetcher {
    return async (url, opts) => respond (url, opts.etag);
}
const ok = (body: string, etag?: string): FetchResult => ({ status: 'ok', httpStatus: 200, body, contentType: 'text/html', etag });

const bodies: Record<string, string> = {
    [BYBIT.url]: fixture ('bybit-v5.mdx'),
    [KALSHI.url]: fixture ('kalshi-rss.xml'),
    [OKX.url]: fixture ('okx-log.html'),
    'https://www.okx.com/docs-v5/en/': '<h1>API</h1><p>GET /api/v5/market/ticker</p>',
};

const API_V2 = '<h1>API</h1><p>GET /api/v5/market/ticker</p><p>GET /api/v5/market/tickers-v2</p>';

test ('end to end: first run, 304 run, page change, failure, feed', async () => {
    const dir = await mkdtemp (join (tmpdir (), 'changelog-data-'));
    const store = new Store (dir);
    const day1 = new Date ('2026-11-08T05:23:00Z');
    // run 1: everything new, backfill
    let rows = await collect ({ store, registry, now: day1, venues: [], sources: [], fetcher: fakeFetcher ((url) => ok (bodies[url], `"${url.length}"`)) });
    const byId = Object.fromEntries (rows.map ((r) => [ r.source, r ]));
    assert.equal (byId['bybit-v5'].added, 8);
    assert.equal (byId['kalshi-changelog'].added, 5);
    assert.equal (byId['okx-log'].added, 9);
    assert.equal (byId['okx-api'].added, 0, 'hash source: snapshot only on first run');
    assert.ok (rows.every ((r) => r.ok && r.backfill));
    // run 2: 304 everywhere except the hash page, which changed
    const day2 = new Date ('2026-11-09T05:23:00Z');
    const fetch2 = fakeFetcher ((url, etag) => {
        if (url === 'https://www.okx.com/docs-v5/en/') {
            return ok (API_V2);
        }
        assert.ok (etag, `conditional GET for ${url}`);
        return { status: 'unchanged', httpStatus: 304 };
    });
    rows = await collect ({ store, registry, now: day2, venues: [], sources: [], fetcher: fetch2 });
    assert.deepEqual (rows.map ((r) => r.status), [ 'unchanged', 'unchanged', 'unchanged', 'ok' ]);
    const okxEntries = await store.loadEntries ('exchange', 'okx');
    const docChange = [ ...okxEntries.values () ].find ((e) => e.source === 'okx-api')!;
    assert.equal (docChange.title, 'Docs changed: /docs-v5/en/');
    assert.equal (docChange.backfill, false);
    assert.equal (docChange.dateKind, 'firstSeen');
    assert.match (docChange.body!, /\+ GET \/api\/v5\/market\/tickers-v2/);
    assert.equal ([ ...okxEntries.values () ].find ((e) => e.source === 'okx-log')!.lastSeen, day2.toISOString ());
    // run 3: okx parser drift (selector gone) and kalshi blocked -> failures keep data
    const day3 = new Date ('2026-11-10T05:23:00Z');
    rows = await collect ({ store, registry, now: day3, venues: [ 'okx', 'kalshi' ], sources: [], fetcher: fakeFetcher ((url) => {
        if (url === KALSHI.url) {
            throw new FetchError ('challenge: Cloudflare challenge (HTTP 403)', 403);
        }
        if (url === OKX.url) {
            return ok ('<html><body><div class="content"><h1>Moved</h1></div></body></html>');
        }
        return ok (API_V2);
    }) });
    const r3 = Object.fromEntries (rows.map ((r) => [ r.source, r ]));
    assert.equal (r3['okx-log'].ok, false);
    assert.match (r3['okx-log'].error!, /parser drift: 0 entries/);
    assert.match (r3['kalshi-changelog'].error!, /challenge/);
    assert.equal ((await store.loadEntries ('exchange', 'okx')).size, 10, 'entries kept on failure');
    const st = await store.loadState ('okx-log');
    assert.equal (st!.health.consecutiveFailures, 1);
    assert.equal (st!.successfulRuns, 2, 'the 304 run counts as successful');
    // run 4: a >50% drop is parser drift too
    const fewer = fixture ('okx-log.html').replace (/<h1 id='2026-09-30'>[\s\S]*$/, '</div></body></html>');
    rows = await collect ({ store, registry, now: new Date ('2026-11-11T05:23:00Z'), venues: [], sources: [ 'okx-log' ], fetcher: fakeFetcher (() => ok (fewer)) });
    assert.match (rows[0].error!, /entry count dropped from 9 to 4/);
    // feed
    const feedNow = new Date ('2026-11-11T05:30:00Z');
    await buildFeed (store, registry, feedNow);
    const latest = JSON.parse (await readFile (store.feedPath ('latest.json'), 'utf8')) as LatestFeed;
    assert.equal (latest.schemaVersion, 1);
    assert.ok (latest.entries.length > 0);
    assert.ok (latest.entries.every ((e) => !('body' in e)));
    const sortKey = (e: LatestFeed['entries'][number]) => e.effectiveDate ?? e.publishedAt ?? e.firstSeen.slice (0, 10);
    assert.deepEqual (latest.entries.map (sortKey), [ ...latest.entries.map (sortKey) ].sort ().reverse ());
    assert.ok (!latest.entries.some ((e) => e.source === 'okx-log' && e.publishedAt === null && !e.effectiveDate), 'undated backfill entries stay out of latest.json');
    assert.ok (latest.entries.some ((e) => e.source === 'okx-log' && e.effectiveDate === '2026-10-31'), 'a scheduled change ("- Public internet: October 31, 2026") is dated by its effective date');
    assert.ok (latest.entries.some ((e) => e.title === 'Docs changed: /docs-v5/en/'));
    assert.deepEqual (latest.venues.map ((v) => [ v.id, v.sources, v.healthy ]), [ [ 'bybit', 1, 1 ], [ 'kalshi', 1, 0 ], [ 'okx', 2, 1 ] ]);
    assert.deepEqual (latest.venues[2].domains, [ 'okx.com' ]);
    const okxFeed = JSON.parse (await readFile (store.feedPath ('exchange', 'okx.json'), 'utf8')) as VenueFeed;
    // 10 stored: 2 of the 3 "Upcoming Changes" entries stay undated and out of the venue feed as they
    // do of latest.json (the docs page would file them under "today"); the port 8443 one has an
    // effective date from its rollout lines
    assert.equal (okxFeed.entries.length, 8);
    assert.ok (okxFeed.entries.every ((e) => !(e.backfill && !e.publishedAt && !e.effectiveDate)));
    assert.ok (okxFeed.entries.every ((e) => typeof e.body === 'string'));
    assert.deepEqual (okxFeed.entries[0].affects, [ 'okx', 'myokx' ]);
    const kalshiFeed = JSON.parse (await readFile (store.feedPath ('prediction', 'kalshi.json'), 'utf8')) as VenueFeed;
    assert.equal (kalshiFeed.entries.length, 5);
    const health = JSON.parse (await readFile (store.feedPath ('health.json'), 'utf8')) as HealthFeed;
    const kh = health.sources.find ((s) => s.id === 'kalshi-changelog')!;
    assert.equal (kh.ok, false);
    assert.equal (kh.consecutiveFailures, 1);
    assert.equal (kh.lastOkAt, day2.toISOString ());
    assert.equal (kh.latestDate, '2026-11-12', 'the scheduled date from the kalshi link fragment');
    const sources = JSON.parse (await readFile (store.feedPath ('sources.json'), 'utf8'));
    assert.equal (sources.venues.length, 3);
});

test ('validators are dropped when the registry entry changes (url fix, new filter)', async () => {
    const store = new Store (await mkdtemp (join (tmpdir (), 'changelog-cfg-')));
    const src = { id: 'x-log', type: 'md' as const, url: 'https://example.com/old.md' };
    const reg = (s: typeof src & { titleFilter?: string }) => makeRegistry ([ { id: 'x', kind: 'exchange', name: 'X', domains: [ 'example.com' ], sources: [ s ] } ]);
    const sent: string[] = [];
    const fetcher: Fetcher = async (url, opts) => {
        sent.push (`${url} ${opts.etag ?? '-'}`);
        if (opts.etag) {
            return { status: 'unchanged', httpStatus: 304 };
        }
        return { status: 'ok', httpStatus: 200, body: '## 2026-11-01 Old page\ntext\n\n## 2026-10-30 Page A\ntext\n', contentType: 'text/markdown', etag: '"v1"' };
    };
    const run = (s: typeof src & { titleFilter?: string }, day: string) => collect ({ store, registry: reg (s), now: new Date (`2026-11-${day}T05:00:00Z`), venues: [], sources: [], fetcher });
    await run (src, '06');
    await run (src, '07');
    const fixed = { ...src, url: 'https://example.com/new.md' };
    let rows = await run (fixed, '08');
    assert.equal (rows[0].status, 'ok', 'a new url is fetched without the old validators');
    rows = await run (fixed, '09');
    assert.equal (rows[0].status, 'unchanged');
    rows = await run ({ ...fixed, titleFilter: 'Page A' }, '10');
    assert.equal (rows[0].status, 'ok', 'a new filter re-parses the page');
    assert.equal (rows[0].entries, 1);
    assert.deepEqual (sent, [
        'https://example.com/old.md -', 'https://example.com/old.md "v1"', 'https://example.com/new.md -', 'https://example.com/new.md "v1"', 'https://example.com/new.md -',
    ]);
});

test ('rss: items rolling off a fixed-size feed are not removed; deletions inside it are', async () => {
    const store = new Store (await mkdtemp (join (tmpdir (), 'changelog-rss-')));
    const src = { id: 'x-pypi', type: 'rss' as const, url: 'https://pypi.org/rss/project/x/releases.xml' };
    const reg = makeRegistry ([ { id: 'x', kind: 'exchange', name: 'X', domains: [ 'pypi.org' ], sources: [ src ] } ]);
    const item = (n: number) => `<item><title>0.${n}.0</title><link>https://pypi.org/project/x/0.${n}.0/</link><guid>https://pypi.org/project/x/0.${n}.0/</guid><pubDate>${String (n).padStart (2, '0')} Oct 2026 00:00:00 GMT</pubDate><description>release ${n}</description></item>`;
    const feed = (ns: number[]) => `<rss><channel>${ns.map (item).join ('')}</channel></rss>`;
    for (let run = 0; run < 5; run++) {
        // newest 5 releases; release 5 (inside the window) is deleted upstream from run 1 on
        const ns = [ 5 + run, 4 + run, 3 + run, 2 + run, 1 + run ].filter ((n) => run < 1 || n !== 5);
        const rows = await collect ({ store, registry: reg, now: new Date (Date.UTC (2026, 9, 20 + run, 5)), venues: [], sources: [], fetcher: async () => ({ status: 'ok', httpStatus: 200, body: feed (ns), contentType: 'application/rss+xml' }) });
        assert.equal (rows[0].ok, true, rows[0].error ?? '');
    }
    const entries = [ ...(await store.loadEntries ('exchange', 'x')).values () ];
    assert.deepEqual (entries.filter ((e) => e.removedAt).map ((e) => e.title.split (':')[0]), [ '0.5.0' ]);
    await buildFeed (store, reg, new Date ('2026-10-25T06:00:00Z'));
    const latest = JSON.parse (await readFile (store.feedPath ('latest.json'), 'utf8')) as LatestFeed;
    const venueFeed = JSON.parse (await readFile (store.feedPath ('exchange', 'x.json'), 'utf8')) as VenueFeed;
    assert.deepEqual (latest.entries.map ((e) => e.title.split (':')[0]), [ '0.9.0', '0.8.0', '0.7.0', '0.6.0', '0.4.0', '0.3.0', '0.2.0', '0.1.0' ]);
    assert.deepEqual (venueFeed.entries.map ((e) => e.title), latest.entries.map ((e) => e.title), 'venue feeds drop removed entries too');
});

test ('spec source: first run snapshot only, then firstSeen entries per change; unmonitored venues reach the feed', async () => {
    const store = new Store (await mkdtemp (join (tmpdir (), 'changelog-spec-')));
    const src = { id: 'ex-openapi', type: 'spec' as const, url: 'https://raw.githubusercontent.com/ex/docs/main/openapi.json', link: 'https://docs.ex.com/api', scope: 'REST' };
    const reg = makeRegistry ([
        { id: 'ex', kind: 'exchange', name: 'Ex', domains: [ 'ex.com' ], sources: [ src ] },
        { id: 'quiet', kind: 'exchange', name: 'Quiet', domains: [ 'quiet.com' ], sources: [], unmonitored: 'API docs behind a login' },
    ]);
    const doc = (paths: Record<string, unknown>) => JSON.stringify ({ openapi: '3.0.0', info: { title: 'x', version: '1' }, paths });
    const v1 = doc ({ '/v1/ticker': { get: { parameters: [ { name: 'symbol', in: 'query' } ] } }, '/v1/old': { get: {} } });
    const v2 = doc ({ '/v1/ticker': { get: { parameters: [ { name: 'symbol', in: 'query' }, { name: 'window', in: 'query' } ] } }, '/v1/orders': { post: {} } });
    let body = v1;
    const fetcher: Fetcher = async () => ({ status: 'ok', httpStatus: 200, body, contentType: 'application/json' });
    let rows = await collect ({ store, registry: reg, now: new Date ('2026-11-07T05:00:00Z'), venues: [], sources: [], fetcher });
    assert.deepEqual (rows.map ((r) => [ r.source, r.status, r.added ]), [ [ 'ex-openapi', 'ok', 0 ] ], 'unmonitored venues are not collected');
    assert.equal (await store.loadSnapshot ('ex-openapi'), 'GET /v1/old\nGET /v1/ticker (symbol)');
    body = v2;
    rows = await collect ({ store, registry: reg, now: new Date ('2026-11-08T05:00:00Z'), venues: [], sources: [], fetcher });
    assert.equal (rows[0].added, 3);
    const entries = [ ...(await store.loadEntries ('exchange', 'ex')).values () ];
    assert.deepEqual (entries.map ((e) => [ e.title, e.dateKind, e.publishedAt, e.backfill, e.tags.join (','), e.url ]).sort (), [
        [ 'Endpoint added: POST /v1/orders', 'firstSeen', null, false, 'new-endpoint', 'https://docs.ex.com/api' ],
        [ 'Endpoint removed: GET /v1/old', 'firstSeen', null, false, 'breaking', 'https://docs.ex.com/api' ],
        [ 'Parameters changed: GET /v1/ticker (+window)', 'firstSeen', null, false, 'param-change', 'https://docs.ex.com/api' ],
    ]);
    // the same document again: no new entries, old ones are kept (synthetic entries are never removed)
    for (let i = 0; i < 4; i++) {
        rows = await collect ({ store, registry: reg, now: new Date (Date.UTC (2026, 10, 9 + i, 5)), venues: [], sources: [], fetcher });
        assert.equal (rows[0].added, 0);
    }
    assert.ok ([ ...(await store.loadEntries ('exchange', 'ex')).values () ].every ((e) => !e.removedAt));
    await buildFeed (store, reg, new Date ('2026-11-12T06:00:00Z'));
    const latest = JSON.parse (await readFile (store.feedPath ('latest.json'), 'utf8')) as LatestFeed;
    assert.equal (latest.entries.length, 3);
    assert.deepEqual (latest.venues.map ((v) => [ v.id, v.sources, v.unmonitored ?? null ]), [ [ 'ex', 1, null ], [ 'quiet', 0, 'API docs behind a login' ] ]);
});

test ('expectBlocked sources are fetched without retries', async () => {
    const dir = await mkdtemp (join (tmpdir (), 'changelog-data-'));
    const blocked = { ...KALSHI, id: 'kalshi-blocked', expectBlocked: 'Cloudflare challenge from datacenter IPs' };
    const reg = makeRegistry ([ { id: 'kalshi', kind: 'prediction', name: 'Kalshi', domains: [ 'kalshi.com' ], sources: [ KALSHI, blocked ] } ]);
    const seen: Record<string, number | undefined> = {};
    const fetcher: Fetcher = async (url, opts) => {
        seen[(opts.retries === 0) ? 'blocked' : 'normal'] = opts.retries;
        return ok (bodies[KALSHI.url]);
    };
    await collect ({ store: new Store (dir), registry: reg, now: new Date ('2026-11-08T05:23:00Z'), venues: [], sources: [], fetcher });
    assert.deepEqual (seen, { blocked: 0, normal: undefined });
});
