// Entry ids (entries.ts assignKeys / buildEntries): stable across inserts and body edits; hash
// sources are never dated from the lines they list.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { ChangelogEntry, SourceConfig } from '../src/types.ts';
import { assignKeys, buildEntries, displayTitle, keepsVersion } from '../src/entries.ts';
import { cutSummary } from '../src/normalize.ts';
import { entryHash, entryKey, sha256 } from '../src/ids.ts';
import { mergeEntries } from '../src/merge.ts';
import { NOW, parse, venueOf } from './helpers.ts';

const MD: SourceConfig = { id: 'x-log', type: 'md', url: 'https://example.com/log.md' };

async function build (source: SourceConfig, body: string, previousSnapshot: string | null = null): Promise<ChangelogEntry[]> {
    const out = await parse (source, body, previousSnapshot);
    return buildEntries (out.entries, { venue: venueOf ('x', [ 'example.com' ], [ source ]), source, affects: [ 'x' ], now: NOW, firstRun: false });
}

test ('assignKeys: the bottom-most duplicate keeps the plain key, others are told apart by body', () => {
    const keys = assignKeys ([ { base: 'k', body: 'c' }, { base: 'k', body: 'a' }, { base: 'k', body: 'a' }, { base: 'j', body: 'z' }, { base: 'k', body: 'b' } ]);
    assert.equal (keys[4], 'k');
    assert.equal (keys[3], 'j');
    assert.match (keys[0], /^k\|b:[0-9a-f]{16}$/);
    assert.match (keys[2], /^k\|b:[0-9a-f]{16}$/);
    assert.equal (keys[1], keys[2] + '|#2', 'identical bodies fall back to a position counted from the bottom');
    assert.equal (new Set (keys).size, keys.length);
});

test ('a new item on top with a repeated title does not take over older ids', async () => {
    const v1 = '## API update\nAdded GET /a\n\n## API update\nAdded GET /b\n';
    const v2 = '## API update\nAdded GET /c\n\n' + v1;
    const store = new Map<string, ChangelogEntry> ();
    mergeEntries (store, await build (MD, v1), { sourceId: MD.id, firstRun: true, trackRemovals: true, missingRuns: {}, now: 't1' });
    const r = mergeEntries (store, await build (MD, v2), { sourceId: MD.id, firstRun: false, trackRemovals: true, missingRuns: {}, now: 't2' });
    assert.deepEqual (r.added.map ((e) => e.body), [ 'Added GET /c' ]);
    assert.deepEqual (r.revised, []);
    assert.equal (r.added[0].backfill, false);
});

test ('a date found only in the body is not part of the id', async () => {
    const before = await build (MD, '## New order endpoint\nWe added POST /order/v2 on 2026-11-01.\n');
    const after = await build (MD, '## New order endpoint\nTestnet: 2026-10-25\nWe added POST /order/v2 on 2026-11-01.\n');
    assert.equal (before[0].publishedAt, '2026-11-01', 'the body date still dates the entry');
    assert.equal (after[0].id, before[0].id);
    assert.notEqual (after[0].hash, before[0].hash, 'the edit is a revision');
    const titled = await build (MD, '## 2026-11-02 New order endpoint\nWe added POST /order/v2 on 2026-11-01.\n');
    assert.notEqual (titled[0].id, before[0].id, 'title dates still key the entry');
});

test ('hash sources: dates inside the added lines are not the change date', async () => {
    const source: SourceConfig = { id: 'x-api', type: 'hash', url: 'https://example.com/api' };
    const [ e ] = await build (source, '<p>GET /a</p><p>New: GET /Order/OrderHistory (available since 2019-06-01)</p><p>Effective date: 2027-01-05</p>', '<p>GET /a</p>');
    assert.equal (e.publishedAt, null);
    assert.equal (e.effectiveDate, undefined);
    assert.equal (e.dateKind, 'firstSeen');
});

test ('displayTitle: a date title ending in a colon does not double it', () => {
    assert.equal (displayTitle ('2026-10-21:', 'Added UNAVAILABLE as a trading status.'), '2026-10-21: Added UNAVAILABLE as a trading status.');
    assert.equal (displayTitle ('2026-10-21', 'Added a field.'), '2026-10-21: Added a field.');
});

test ('displayTitle: a leading date that repeats the entry date goes, a different one stays', () => {
    const on = (date: string) => ({ date });
    assert.equal (displayTitle ('2026-10-30', 'Added UNAVAILABLE as a trading status.', on ('2026-10-30')), 'Added UNAVAILABLE as a trading status.');
    assert.equal (displayTitle ('2026-10-30:', '- Added a field.', on ('2026-10-30')), 'Added a field.');
    assert.equal (displayTitle ('October 5, 2026: TP/SL legs can be modified over WebSocket', '', on ('2026-10-05')), 'TP/SL legs can be modified over WebSocket');
    assert.equal (displayTitle ('[November 4, 2026] New Affiliate and Broker APIs', '', on ('2026-11-04')), 'New Affiliate and Broker APIs');
    assert.equal (displayTitle ('September 1, 2026 — Spot REST', '* Added `GET /x`', on ('2026-09-01')), 'Spot REST: Added GET /x', 'a product label left alone gets a summary');
    assert.equal (displayTitle ('20 August 2026 — Derivatives REST v1', '* Added `/rfq-assignment/max-leverage` endpoints', on ('2026-08-20')), 'Derivatives REST v1: Added /rfq-assignment/max-leverage endpoints');
    assert.equal (displayTitle ('Release 11.08.2026: ELP deprecation', '', on ('2026-08-21')), 'Release 11.08.2026: ELP deprecation', 'a scheduled date is information');
    assert.equal (displayTitle ('2026-10-30', '', on ('2026-10-30')), '2026-10-30', 'nothing else to show');
});

test ('displayTitle: versions go, except for SDK/release sources', () => {
    assert.equal (displayTitle ('v4.106.138', '2026-09-10\n\n- Add the optional integer field `leverage`.', { date: '2026-09-10' }), 'Add the optional integer field leverage.');
    assert.equal (displayTitle ('1.6.1 - 2026-10-09', '### Changed (2)\n\n- Modified response for `get_market_detail()`', { date: '2026-10-09', keepVersion: true }), '1.6.1: Modified response for get_market_detail()');
    assert.equal (displayTitle ('0.5.0', 'release 5', { date: '2026-10-05', keepVersion: true }), '0.5.0: release 5');
    assert.ok (keepsVersion ({ id: 'lighter-pypi-sdk', type: 'rss', url: 'https://pypi.org/rss/project/lighter-sdk/releases.xml' }));
    assert.ok (keepsVersion ({ id: 'x', type: 'md', url: 'https://example.com/x.md', scope: 'prediction SDK (Python)' }));
    assert.ok (keepsVersion ({ id: 'x-gh', type: 'rss', url: 'https://github.com/x/y/releases.atom' }));
    assert.ok (!keepsVersion ({ id: 'gate-v4', type: 'md', url: 'https://example.com/gate.md', scope: 'REST v4' }));
    assert.ok (!keepsVersion ({ id: 'woo-v3-release-notes', type: 'md', url: 'https://example.com/x.md', scope: 'all (REST + websocket; upcoming and released changes)' }));
    assert.ok (!keepsVersion ({ id: 'limitless-changelog', type: 'md', url: 'https://example.com/x.md', scope: 'all (REST, WebSocket, SDKs, platform)' }));
    assert.ok (!keepsVersion ({ id: 'x-types', type: 'md', url: 'https://example.com/x.md', scope: 'request/response types and enums (generated Python SDK types)' }));
});

test ('displayTitle: a version beside the date stays for SDK sources, times stay, the date order applies', () => {
    assert.equal (displayTitle ('2025-06-11(1.3.0): Update the latest APIs, documentation, etc', 'x', { date: '2025-06-11', keepVersion: true }), '1.3.0: Update the latest APIs, documentation, etc');
    assert.equal (displayTitle ('2025-06-11(GO 1.2.1): Update the latest APIs', 'x', { date: '2025-06-11', keepVersion: true }), 'GO 1.2.1: Update the latest APIs');
    assert.equal (displayTitle ('1.6.1 (2026-10-09): Fix login', 'x', { date: '2026-10-09', keepVersion: true }), '1.6.1: Fix login');
    assert.equal (displayTitle ('1.6.1 (2026-10-09): Fix login', 'x', { date: '2026-10-09' }), 'Fix login');
    for (const title of [ '2026-11-05 10:00 UTC: System maintenance', 'Nov 12, 2026 02:00 UTC — X happens', '2026-11-05 08:00 (UTC) - X happens', '2026-11-05 08:00 - X happens' ]) {
        assert.equal (displayTitle (title, 'x', { date: title.startsWith ('Nov') ? '2026-11-12' : '2026-11-05' }), title, 'a time is not cut in half');
    }
    assert.equal (displayTitle ('8/11/2022: GET /viewer/trading_fees added', 'x', { date: '2022-11-08', order: 'dmy' }), 'GET /viewer/trading_fees added');
});

test ('displayTitle: "Add:" / "[Modify]" labels read as past tense', () => {
    assert.equal (displayTitle ('Add: /api/v6/tradingBot/grid/order (General)', 'x', { date: '2026-11-02' }), 'Added: /api/v6/tradingBot/grid/order (General)');
    assert.equal (displayTitle ('Update: Public market data APIs (Market Data)', 'x', { date: '2026-10-20' }), 'Updated: Public market data APIs (Market Data)');
    assert.equal (displayTitle ('2026.11.02: [Modify] UTA REST Get Orderbook API Access Adjustment', 'x', { date: '2026-11-02' }), 'Modified: UTA REST Get Orderbook API Access Adjustment');
    assert.equal (displayTitle ('Additional fields', 'x', { date: '2026-11-02' }), 'Additional fields');
});

test ('summary titles end at a sentence or a whole word, never on "the/in/of"', () => {
    const s = 'Final deprecation notice of old websocket endpoint’s l1_orderbook, l2_orderbook, l2_update channels. These will be fully deprecated on 31th Oct 2026.';
    assert.equal (cutSummary (s, 140), 'Final deprecation notice of old websocket endpoint’s l1_orderbook, l2_orderbook, l2_update channels.');
    const long = 'Add the optional integer field leverage to the TradFiOrderRequest request body of POST /tradfi/orders (createTradFiOrder) to specify the order leverage in the account';
    const cut = cutSummary (long, 140);
    assert.ok (cut.length <= 140 && cut.endsWith ('…'), cut);
    assert.ok (!/\b(?:the|in|of|to)…$/.test (cut), cut);
    assert.ok (long.startsWith (cut.slice (0, -1)), 'cut at a word boundary');
    assert.equal (cutSummary ('Set e.g. the price. Then more text follows here to make this long enough for a cut at forty.', 60), 'Set e.g. the price. Then more text follows here to make…');
    assert.equal (cutSummary ('short', 140), 'short');
});

test ('display title changes do not change ids or hashes', async () => {
    const body = '## 2026-10-30\n\n- Added `foo` to `GET /x`. It returns the bar of the baz.\n';
    const [ e ] = await build (MD, body);
    assert.equal (e.title, 'Added foo to GET /x. It returns the bar of the baz.');
    assert.equal (e.id, sha256 (entryKey (MD.id, undefined, '2026-10-30', '2026-10-30')), 'the id keys on the raw heading');
    assert.equal (e.hash, entryHash ('2026-10-30', e.body ?? ''), 'the hash too');
});

test ('summary titles do not end on an unclosed "(" group', () => {
    const s = 'POST /api/v1/rfq rejects a stock limit order whose price is outside the price band with 400, and the message gives the current bound (for buys the ask)';
    assert.equal (cutSummary (s, 140), 'POST /api/v1/rfq rejects a stock limit order whose price is outside the price band with 400, and the message gives the current bound…');
});

test ('summary titles close a long unclosed group after the ellipsis', () => {
    const s = 'Some change to the endpoint (applies to all spot and margin accounts and some other things that go on for a long time beyond the limit here) more';
    const cut = cutSummary (s, 80);
    assert.ok (cut.endsWith ('…)') && cut.length <= 80, cut);
});
