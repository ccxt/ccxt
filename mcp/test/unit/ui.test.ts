import { test, mock } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { cleanCandles, summarizeCandles, summarizeBook, amountUnitOf, tickerRow, CHART_OUTPUT, ORDERBOOK_OUTPUT, TICKERS_OUTPUT } from '../../ts/tools/ui.js';
import { joinNotices, missingTickersNotice } from '../../ts/tools/common.js';
import { VIEW_SOURCES, UI_MIME_TYPE, UI_EXTENSION_ID, UI_STATUSES, renderView, readUiAsset, viewUri, buildViewCatalog, defaultViewCatalog, uiToolMeta, isUiPayload, toUiContent, uiNotice, uiModeFromEnv, parseUiMode, parseUiWhenUnknown, uiSupport, decideUiStatus, attachesView, requestClientCapabilities, type UiMode, type UiSupport, type UiWhenUnknown } from '../../ts/ui.js';
import { CLIENT_CAPABILITIES_META_KEY } from '@modelcontextprotocol/server';
import { registerSecret, clearSecrets } from '../../ts/redact.js';
// @ts-ignore - a plain .mjs module shared with the preview script
import { chartPayload, bookPayload, tickersPayload } from '../../scripts/preview-payloads.mjs';

const uiDir = path.join (path.dirname (fileURLToPath (import.meta.url)), '..', '..', 'ts', 'ui');
// summarizeCandles only needs iso8601 from the exchange
const clock = { 'iso8601': (timestamp: number) => new Date (timestamp).toISOString () };
const T0 = 1700000000000;
const HOUR = 3600000;

// ---------------------------------------------------------------------------------------
// cleanCandles

test ('cleanCandles drops malformed and null rows', () => {
    const good = [ T0, 1, 2, 0.5, 1.5, 100 ];
    const rows: any[] = [
        good,
        null,
        undefined,
        'not-a-row',
        { '0': T0, '1': 1 },
        [],
        [ T0 + HOUR ],
        [ T0 + HOUR, null, null, null, null, null ], // the "empty interval" candle some venues emit
        [ null, 1, 2, 0.5, 1.5, 100 ],
        [ T0 + HOUR, 1, 2, 0.5, undefined, 100 ],
        [ T0 + HOUR, '1', '2', '0.5', '1.5', '100' ], // strings are not numbers
        [ T0 + HOUR, 1, NaN, 0.5, 1.5, 100 ],
        [ T0 + HOUR, 1, 2, Infinity, 1.5, 100 ],
    ];
    assert.deepEqual (cleanCandles (rows), [ good ]);
});

test ('cleanCandles tolerates a missing/empty input', () => {
    assert.deepEqual (cleanCandles ([]), []);
    assert.deepEqual (cleanCandles (undefined as any), []);
    assert.deepEqual (cleanCandles (null as any), []);
});

test ('cleanCandles sorts by timestamp ascending', () => {
    const rows = [ [ T0 + 2 * HOUR, 3, 3, 3, 3, 3 ], [ T0, 1, 1, 1, 1, 1 ], [ T0 + HOUR, 2, 2, 2, 2, 2 ] ];
    assert.deepEqual (cleanCandles (rows).map ((row) => row[0]), [ T0, T0 + HOUR, T0 + 2 * HOUR ]);
    // the input is not mutated
    assert.equal (rows[0][0], T0 + 2 * HOUR);
});

test ('cleanCandles defaults a missing or non-numeric volume to 0 and trims extra columns', () => {
    const rows: any[] = [
        [ T0, 1, 2, 0.5, 1.5 ],
        [ T0 + HOUR, 1, 2, 0.5, 1.5, null ],
        [ T0 + 2 * HOUR, 1, 2, 0.5, 1.5, 'x' ],
        [ T0 + 3 * HOUR, 1, 2, 0.5, 1.5, 7, 'extra', 'columns' ],
    ];
    assert.deepEqual (cleanCandles (rows), [
        [ T0, 1, 2, 0.5, 1.5, 0 ],
        [ T0 + HOUR, 1, 2, 0.5, 1.5, 0 ],
        [ T0 + 2 * HOUR, 1, 2, 0.5, 1.5, 0 ],
        [ T0 + 3 * HOUR, 1, 2, 0.5, 1.5, 7 ],
    ]);
});

// Regression: venues occasionally emit an open or close outside [low, high]; drawn as is, the
// candle body pokes past its own wick and the summary's high/low miss the real extremes.
test ('cleanCandles widens high/low to cover open and close', () => {
    const rows = [
        [ T0, 10, 9, 8, 7, 1 ], // open above high, close below low
        [ T0 + HOUR, 5, 6, 5.5, 7, 1 ], // close above high, open below low
        [ T0 + 2 * HOUR, 5, 4, 6, 5, 1 ], // high and low swapped
        [ T0 + 3 * HOUR, 1, 2, 0.5, 1.5, 1 ], // already consistent — untouched
    ];
    assert.deepEqual (cleanCandles (rows), [
        [ T0, 10, 10, 7, 7, 1 ],
        [ T0 + HOUR, 5, 7, 5, 7, 1 ],
        [ T0 + 2 * HOUR, 5, 6, 4, 5, 1 ],
        [ T0 + 3 * HOUR, 1, 2, 0.5, 1.5, 1 ],
    ]);
    // the input rows are not rewritten in place
    assert.deepEqual (rows[0], [ T0, 10, 9, 8, 7, 1 ]);
    const summary = summarizeCandles (clock, cleanCandles (rows));
    assert.equal (summary.high, 10);
    assert.equal (summary.low, 0.5);
});

// ---------------------------------------------------------------------------------------
// summarizeCandles

test ('summarizeCandles: range, open/close, change %, extremes and total volume', () => {
    const candles = [
        [ T0, 100, 110, 95, 105, 10 ],
        [ T0 + HOUR, 105, 130, 104, 120, 20.5 ],
        [ T0 + 2 * HOUR, 120, 125, 90, 110, 0.1 ],
    ];
    assert.deepEqual (summarizeCandles (clock, candles), {
        'count': 3,
        'from': '2023-11-14T22:13:20.000Z',
        'to': '2023-11-15T00:13:20.000Z',
        'open': 100,
        'close': 110,
        'changePercent': 10,
        'high': 130,
        'low': 90,
        'volume': 30.6, // 10 + 20.5 + 0.1 without the float tail
    });
});

test ('summarizeCandles: a single candle and a negative change', () => {
    const summary = summarizeCandles (clock, [ [ T0, 200, 210, 150, 150, 1 ] ]);
    assert.equal (summary.count, 1);
    assert.equal (summary.from, summary.to);
    assert.equal (summary.changePercent, -25);
});

test ('summarizeCandles: empty input is just a zero count', () => {
    assert.deepEqual (summarizeCandles (clock, []), { 'count': 0 });
});

test ('summarizeCandles: a zero open yields no changePercent instead of Infinity/NaN', () => {
    const summary = summarizeCandles (clock, [ [ T0, 0, 2, 0, 1, 5 ] ]);
    assert.equal (summary.open, 0);
    assert.equal (summary.close, 1);
    assert.equal (summary.changePercent, undefined);
    // and it serializes cleanly — nothing non-finite reaches the model
    assert.ok (!JSON.stringify (summary).includes ('null'));
});

// ---------------------------------------------------------------------------------------
// summarizeBook

test ('summarizeBook: best prices, mid, spread and depth totals', () => {
    const summary = summarizeBook ([ [ 99, 1 ], [ 98, 2.5 ] ], [ [ 101, 0.1 ], [ 102, 0.2 ], [ 103, 4 ] ]);
    assert.deepEqual (summary, {
        'bestBid': 99,
        'bestAsk': 101,
        'bidLevels': 2,
        'askLevels': 3,
        'bidDepth': 3.5,
        'askDepth': 4.3, // 0.1 + 0.2 + 4 without the float tail
        'mid': 100,
        'spread': 2,
        'spreadPercent': 2,
    });
});

test ('summarizeBook: a one-sided book has no mid/spread', () => {
    const bidsOnly = summarizeBook ([ [ 99, 1 ] ], []);
    assert.equal (bidsOnly.bestBid, 99);
    assert.equal (bidsOnly.bestAsk, undefined);
    assert.equal (bidsOnly.bidLevels, 1);
    assert.equal (bidsOnly.askLevels, 0);
    assert.equal (bidsOnly.bidDepth, 1);
    assert.equal (bidsOnly.askDepth, 0);
    for (const key of [ 'mid', 'spread', 'spreadPercent' ]) {
        assert.ok (!(key in bidsOnly), key + ' must be absent');
    }
    const asksOnly = summarizeBook ([], [ [ 101, 2 ] ]);
    assert.equal (asksOnly.bestBid, undefined);
    assert.equal (asksOnly.bestAsk, 101);
    assert.equal (asksOnly.askDepth, 2);
    assert.ok (!('mid' in asksOnly));
});

test ('summarizeBook: an empty book is all zeros and no prices', () => {
    // absent prices stay absent (compactMeta), they are never serialized as null
    assert.deepEqual (summarizeBook ([], []), { 'bidLevels': 0, 'askLevels': 0, 'bidDepth': 0, 'askDepth': 0 });
});

test ('summarizeBook: non-numeric amounts count as zero depth; a zero mid has no spreadPercent', () => {
    const summary = summarizeBook ([ [ 99, undefined as any ], [ 98, 2 ] ], [ [ 101, null as any ] ]);
    assert.equal (summary.bidDepth, 2);
    assert.equal (summary.askDepth, 0);
    const zeroMid = summarizeBook ([ [ -1, 1 ] ], [ [ 1, 1 ] ]);
    assert.equal (zeroMid.mid, 0);
    assert.equal (zeroMid.spread, 2);
    assert.equal (zeroMid.spreadPercent, undefined);
});

// Regression: the spread kept the binary subtraction error (62137.5 - 62137.4 came out as
// 0.0999999999985) and spreadPercent was cut to 4 decimals, i.e. 0 for a one-tick BTC spread.
test ('summarizeBook: spread has no float noise and spreadPercent keeps significant digits', () => {
    const cases: [ number, number, number, number ][] = [
        [ 62137.4, 62137.5, 0.1, 0.000161 ],
        [ 62137.40, 62137.41, 0.01, 0.0000161 ],
        [ 0.99984, 0.99985, 0.00001, 0.001 ],
        [ 1.08412, 1.08414, 0.00002, 0.00184 ],
        [ 0.0000041231, 0.0000041232, 1e-10, 0.00243 ],
        [ 100, 101, 1, 0.995 ],
        [ 50000, 50000, 0, 0 ],
        [ 3, 2, -1, -40 ], // a crossed book stays visible as a negative spread
    ];
    for (const [ bid, ask, spread, spreadPercent ] of cases) {
        const summary = summarizeBook ([ [ bid, 1 ] ], [ [ ask, 1 ] ]);
        assert.equal (summary.spread, spread, bid + ' / ' + ask + ' spread');
        assert.equal (summary.spreadPercent, spreadPercent, bid + ' / ' + ask + ' spreadPercent');
    }
});

test ('amountUnitOf: contracts only when a contract market has a contractSize other than 1', () => {
    assert.deepEqual (amountUnitOf ({ 'base': 'BTC', 'quote': 'USDT', 'contract': false }), { 'contractSize': 1, 'inverse': false, 'inContracts': false, 'amountUnit': 'BTC' });
    assert.deepEqual (amountUnitOf ({ 'base': 'BTC', 'contract': true, 'contractSize': 0.01, 'inverse': false }), { 'contractSize': 0.01, 'inverse': false, 'inContracts': true, 'amountUnit': 'contracts' });
    assert.deepEqual (amountUnitOf ({ 'base': 'BTC', 'contract': true, 'contractSize': 100, 'inverse': true }), { 'contractSize': 100, 'inverse': true, 'inContracts': true, 'amountUnit': 'contracts' });
    assert.deepEqual (amountUnitOf ({ 'base': 'ETH', 'contract': true, 'contractSize': 1 }), { 'contractSize': 1, 'inverse': false, 'inContracts': false, 'amountUnit': 'ETH' });
    // a contractSize on a spot market, or a missing/unusable one, never counts
    for (const market of [ { 'base': 'BTC', 'contractSize': 0.01 }, { 'base': 'BTC', 'contract': true }, { 'base': 'BTC', 'contract': true, 'contractSize': 0 }, { 'base': 'BTC', 'contract': true, 'contractSize': '0.01' }, { 'base': 'BTC', 'contract': true, 'contractSize': NaN } ]) {
        assert.equal (amountUnitOf (market).inContracts, false, JSON.stringify (market));
        assert.equal (amountUnitOf (market).contractSize, 1, JSON.stringify (market));
        assert.equal (amountUnitOf (market).amountUnit, 'BTC', JSON.stringify (market));
    }
    assert.deepEqual (amountUnitOf (undefined), { 'contractSize': 1, 'inverse': false, 'inContracts': false, 'amountUnit': undefined });
});

test ('summarizeBook: the depth unit is named, and contract counts come with base/quote totals', () => {
    const bids = [ [ 50000, 600 ], [ 40000, 100 ] ];
    const asks = [ [ 50010, 300 ] ];
    const spot = summarizeBook (bids, asks, amountUnitOf ({ 'base': 'BTC', 'quote': 'USDT' }));
    assert.equal (spot.depthUnit, 'BTC');
    assert.equal (spot.bidDepth, 700);
    assert.ok (!('bidDepthBase' in spot) && !('bidDepthQuote' in spot));
    // linear: one contract is contractSize of base
    const linear = summarizeBook (bids, asks, amountUnitOf ({ 'base': 'BTC', 'quote': 'USDT', 'contract': true, 'contractSize': 0.01 }));
    assert.equal (linear.depthUnit, 'contracts');
    assert.equal (linear.bidDepth, 700);
    assert.equal (linear.bidDepthBase, 7);
    assert.equal (linear.askDepthBase, 3);
    assert.equal (linear.bidDepthQuote, 340000);
    assert.equal (linear.askDepthQuote, 150030);
    // inverse: one contract is contractSize of quote
    const inverse = summarizeBook (bids, asks, amountUnitOf ({ 'base': 'BTC', 'quote': 'USD', 'contract': true, 'contractSize': 100, 'inverse': true }));
    assert.equal (inverse.depthUnit, 'contracts');
    assert.equal (inverse.bidDepthQuote, 70000);
    assert.equal (inverse.bidDepthBase, 1.45);
    assert.equal (inverse.askDepthQuote, 30000);
    // a level without a usable price or amount adds nothing instead of poisoning the totals
    const holes = summarizeBook ([ [ 0, 5 ], [ 50000, undefined as any ], [ 50000, 100 ] ], [], amountUnitOf ({ 'base': 'BTC', 'contract': true, 'contractSize': 100, 'inverse': true }));
    assert.equal (holes.bidDepthBase, 0.2);
    assert.equal (holes.bidDepthQuote, 10500);
    // without a known market nothing is claimed about the unit
    assert.ok (!('depthUnit' in summarizeBook (bids, asks, amountUnitOf (undefined))));
});

// ---------------------------------------------------------------------------------------
// notices

test ('joinNotices keeps each notice apart and yields undefined for none', () => {
    assert.equal (joinNotices ([ 'first — with a dash; and a semicolon', undefined, '', 'second' ]), 'first — with a dash; and a semicolon | second');
    assert.equal (joinNotices ([ 'only' ]), 'only');
    assert.equal (joinNotices ([ undefined, '' ]), undefined);
    assert.equal (joinNotices ([]), undefined);
});

test ('missingTickersNotice names the symbols, and is silent when none is missing', () => {
    assert.equal (missingTickersNotice ([]), undefined);
    assert.match (missingTickersNotice ([ 'BTC/USDT:USDT', 'ETH/USDT:USDT' ]) as string, /^no ticker was returned for: BTC\/USDT:USDT, ETH\/USDT:USDT — /);
});

// ---------------------------------------------------------------------------------------
// ui.ts — views and versioned URIs

test ('VIEW_SOURCES: three views with distinct names and an existing template each', () => {
    assert.deepEqual (Object.keys (VIEW_SOURCES).sort (), [ 'chart', 'orderbook', 'tickers' ]);
    const views = Object.values (VIEW_SOURCES);
    assert.equal (new Set (views.map ((view) => view.name)).size, 3);
    assert.equal (new Set (views.map ((view) => view.slug)).size, 3);
    for (const view of views) {
        assert.ok (fs.existsSync (path.join (uiDir, view.file)), view.file + ' must exist in ts/ui');
    }
    assert.equal (UI_MIME_TYPE, 'text/html;profile=mcp-app');
    assert.equal (UI_EXTENSION_ID, 'io.modelcontextprotocol/ui');
});

test ('viewUri: ui://ccxt/<view>.<12 hex of sha256>.html, a function of the content only', () => {
    const uri = viewUri ('chart', '<!doctype html>a');
    assert.match (uri, /^ui:\/\/ccxt\/chart\.[0-9a-f]{12}\.html$/);
    assert.equal (viewUri ('chart', '<!doctype html>a'), uri, 'deterministic');
    assert.notEqual (viewUri ('chart', '<!doctype html>b'), uri, 'any content change is a new URI');
    assert.notEqual (viewUri ('orderbook', '<!doctype html>a'), uri);
});

test ('defaultViewCatalog: rendered once, each URI hashes its own document', () => {
    const catalog = defaultViewCatalog ();
    assert.equal (defaultViewCatalog (), catalog, 'memoized per process');
    for (const [ key, view ] of Object.entries (catalog)) {
        assert.equal (view.uri, viewUri (view.slug, view.html), key);
        assert.equal (view.html, renderView (view.file), key);
    }
    assert.equal (new Set (Object.values (catalog).map ((view) => view.uri)).size, 3);
    // building again from the same files gives the same URIs (hosts cache by URI across restarts)
    const again = buildViewCatalog ();
    for (const key of Object.keys (catalog) as ('chart' | 'orderbook' | 'tickers')[]) {
        assert.equal (again[key].uri, catalog[key].uri, key);
    }
});

test ('readUiAsset refuses anything but a plain file name', () => {
    for (const name of [ '../package.json', 'ui/../../x', '/etc/passwd', '.hidden', '' ]) {
        assert.throws (() => readUiAsset (name), /invalid view asset name/, JSON.stringify (name));
    }
});

test ('uiToolMeta: standard nested key plus the legacy flat key and the openai alias', () => {
    for (const view of Object.values (defaultViewCatalog ())) {
        assert.deepEqual (uiToolMeta (view), {
            'ui': { 'resourceUri': view.uri },
            'ui/resourceUri': view.uri,
            'openai/outputTemplate': view.uri,
        });
    }
    // a fresh object per call — one tool's registration can never mutate another's
    const chart = defaultViewCatalog ().chart;
    assert.notEqual (uiToolMeta (chart), uiToolMeta (chart));
});

test ('renderView resolves every @include with the fragment verbatim', () => {
    const css = fs.readFileSync (path.join (uiDir, 'shared.css'), 'utf8');
    const bridge = fs.readFileSync (path.join (uiDir, 'bridge.js'), 'utf8');
    for (const view of Object.values (VIEW_SOURCES)) {
        const template = fs.readFileSync (path.join (uiDir, view.file), 'utf8');
        assert.ok (template.includes ('/* @include shared.css */'), view.file + ' template includes shared.css');
        assert.ok (template.includes ('/* @include bridge.js */'), view.file + ' template includes bridge.js');
        const html = renderView (view.file);
        assert.ok (!html.includes ('@include'), view.file + ' has an unresolved @include');
        // verbatim: "$&", "$1", "$$" … inside a fragment must not be read as replace patterns
        assert.ok (html.includes (css), view.file + ' must inline shared.css verbatim');
        assert.ok (html.includes (bridge), view.file + ' must inline bridge.js verbatim');
        // a view may include further fragments (table.js): each one verbatim, and nothing but
        // the markers is replaced
        let expectedLength = template.length;
        for (const marker of template.matchAll (/\/\*\s*@include\s+([a-z0-9.-]+)\s*\*\//g)) {
            const fragment = fs.readFileSync (path.join (uiDir, marker[1]), 'utf8');
            assert.ok (html.includes (fragment), view.file + ' must inline ' + marker[1] + ' verbatim');
            expectedLength += fragment.length - marker[0].length;
        }
        assert.equal (html.length, expectedLength);
    }
});

test ('renderView reads through the given reader, tolerating whitespace inside the marker', () => {
    const reads: string[] = [];
    const reader = (file: string) => {
        reads.push (file);
        return (file === 'probe.html') ? '<style>/* @include a.css */</style><script>/*  @include   b.js  */</script>' : ('[' + file + ' $& $1 $$]');
    };
    const html = renderView ('probe.html', reader);
    assert.deepEqual (reads, [ 'probe.html', 'a.css', 'b.js' ]);
    assert.equal (html, '<style>[a.css $& $1 $$]</style><script>[b.js $& $1 $$]</script>');
});

test ('the serving path never touches the filesystem after the catalog is built', () => {
    defaultViewCatalog ();
    const spy = mock.method (fs, 'readFileSync');
    try {
        const catalog = defaultViewCatalog ();
        assert.ok (catalog.chart.html.length > 1000);
        assert.equal (spy.mock.callCount (), 0);
    } finally {
        spy.mock.restore ();
    }
});

// ---------------------------------------------------------------------------------------
// ui.ts — results

test ('isUiPayload tells a UI payload from a plain envelope', () => {
    assert.equal (isUiPayload ({ 'envelope': { 'ok': true, 'data': 1 }, 'structured': { 'view': 'chart' } }), true);
    assert.equal (isUiPayload ({ 'ok': true, 'data': { 'view': 'chart' } }), false);
    assert.equal (isUiPayload ({ 'envelope': { 'ok': true, 'data': 1 } }), false);
    assert.equal (isUiPayload (null), false);
    assert.equal (isUiPayload (undefined), false);
    assert.equal (isUiPayload ('view'), false);
});

test ('toUiContent: text is the envelope, structuredContent is the view payload, both redacted', () => {
    clearSecrets ();
    registerSecret ('SUPERSECRETVALUE', 'secret');
    try {
        const result: any = toUiContent ({
            'envelope': { 'ok': true, 'data': { 'count': 1, 'note': 'sig SUPERSECRETVALUE' } },
            'structured': { 'view': 'chart', 'symbol': 'BTC/USDT', 'exchangeName': 'x SUPERSECRETVALUE y', 'candles': [ [ T0, 1, 2, 0.5, 1.5, 100 ] ], 'gone': undefined, 'nan': NaN },
        });
        assert.equal (result.isError, undefined);
        assert.equal (result.content.length, 1);
        assert.ok (!JSON.stringify (result).includes ('SUPERSECRETVALUE'));
        assert.deepEqual (JSON.parse (result.content[0].text), { 'ok': true, 'data': { 'count': 1, 'note': 'sig [redacted:secret]' } });
        assert.deepEqual (result.structuredContent, { 'view': 'chart', 'symbol': 'BTC/USDT', 'exchangeName': 'x [redacted:secret] y', 'candles': [ [ T0, 1, 2, 0.5, 1.5, 100 ] ], 'nan': null });
    } finally {
        clearSecrets ();
    }
});

// ---------------------------------------------------------------------------------------
// ui.ts — capability detection and the attach decision

const APPS = { 'extensions': { [UI_EXTENSION_ID]: { 'mimeTypes': [ UI_MIME_TYPE ] } } };

// requestClientCapabilities only asks the server for its connection-level capabilities
function fakeServer (capabilities: any): any {
    return { 'server': { 'getClientCapabilities': () => capabilities } };
}

test ('requestClientCapabilities: the per-request envelope first, then the connection, else unknown', () => {
    const request = (capabilities: any): any => ({ 'mcpReq': { 'envelope': { [CLIENT_CAPABILITIES_META_KEY]: capabilities } } });
    // 2026-07-28: the envelope wins even over what the connection says
    assert.deepEqual (requestClientCapabilities (fakeServer ({}), request (APPS)), APPS);
    assert.deepEqual (requestClientCapabilities (fakeServer (APPS), request ({})), {});
    // 2025-era long-lived connection: initialize declared them
    assert.deepEqual (requestClientCapabilities (fakeServer (APPS), { 'mcpReq': {} } as any), APPS);
    assert.deepEqual (requestClientCapabilities (fakeServer (APPS), undefined), APPS);
    // 2025-era stateless request: nobody knows
    assert.equal (requestClientCapabilities (fakeServer (undefined), { 'mcpReq': {} } as any), undefined);
    assert.equal (requestClientCapabilities (fakeServer (null), undefined), undefined);
});

test ('uiSupport: supported only for the extension with our mime type; undefined is unknown', () => {
    assert.equal (uiSupport (APPS as any), 'supported');
    assert.equal (uiSupport (undefined), 'unknown');
    for (const extension of [ undefined, {}, { 'mimeTypes': [] }, { 'mimeTypes': [ 'text/html' ] }, { 'mimeTypes': UI_MIME_TYPE } ]) {
        const capabilities: any = (extension === undefined) ? {} : { 'extensions': { [UI_EXTENSION_ID]: extension } };
        assert.equal (uiSupport (capabilities), 'unsupported', JSON.stringify (extension));
    }
    assert.equal (uiSupport ({ 'extensions': { 'com.example/other': { 'mimeTypes': [ UI_MIME_TYPE ] } } } as any), 'unsupported');
});

test ('decideUiStatus: every mode x support x whenUnknown combination', () => {
    const expected: Record<UiMode, Record<UiSupport, Record<UiWhenUnknown, string>>> = {
        'auto': {
            'supported': { 'attach': 'displayed', 'omit': 'displayed' },
            'unsupported': { 'attach': 'unsupported', 'omit': 'unsupported' },
            'unknown': { 'attach': 'attached', 'omit': 'unknown' },
        },
        'always': {
            'supported': { 'attach': 'displayed', 'omit': 'displayed' },
            'unsupported': { 'attach': 'displayed', 'omit': 'displayed' },
            'unknown': { 'attach': 'displayed', 'omit': 'displayed' },
        },
        'off': {
            'supported': { 'attach': 'off', 'omit': 'off' },
            'unsupported': { 'attach': 'off', 'omit': 'off' },
            'unknown': { 'attach': 'off', 'omit': 'off' },
        },
    };
    for (const [ mode, bySupport ] of Object.entries (expected) as [ UiMode, any ][]) {
        for (const [ support, byWhen ] of Object.entries (bySupport) as [ UiSupport, any ][]) {
            for (const [ whenUnknown, status ] of Object.entries (byWhen) as [ UiWhenUnknown, string ][]) {
                assert.equal (decideUiStatus ({ mode, whenUnknown }, support), status, mode + '/' + support + '/' + whenUnknown);
            }
        }
    }
    assert.deepEqual (UI_STATUSES.filter (attachesView), [ 'displayed', 'attached' ]);
});

test ('uiModeFromEnv reads CCXT_MCP_UI: auto by default and for anything unknown', () => {
    const cases: [ string | undefined, string ][] = [
        [ undefined, 'auto' ], [ '', 'auto' ], [ 'auto', 'auto' ], [ 'AUTO', 'auto' ],
        [ 'always', 'always' ], [ ' Always ', 'always' ], [ 'off', 'off' ], [ 'OFF', 'off' ],
        [ 'on', 'auto' ], [ 'true', 'auto' ], [ '0', 'auto' ], [ 'never', 'auto' ], [ '${user_config.ui}', 'auto' ],
    ];
    for (const [ value, expected ] of cases) {
        const env: any = (value === undefined) ? {} : { 'CCXT_MCP_UI': value };
        assert.equal (uiModeFromEnv (env), expected, JSON.stringify (value));
    }
    assert.equal (parseUiMode ('bogus'), undefined);
    assert.equal (parseUiWhenUnknown (' Attach '), 'attach');
    assert.equal (parseUiWhenUnknown ('OMIT'), 'omit');
    assert.equal (parseUiWhenUnknown ('yes'), undefined);
    assert.equal (parseUiWhenUnknown (undefined), undefined);
});

test ('uiNotice says what happened to the view and names the fallback tool when it may not be seen', () => {
    for (const hosted of [ false, true ]) {
        assert.match (uiNotice ('displayed', 'get_ohlcv', hosted), /displayed to the user/);
        assert.ok (!uiNotice ('displayed', 'get_ohlcv', hosted).includes ('get_ohlcv'));
        assert.match (uiNotice ('attached', 'get_ohlcv', hosted), /did not declare whether it renders/);
        assert.match (uiNotice ('attached', 'get_ohlcv', hosted), /key figures/);
        assert.ok (uiNotice ('attached', 'get_ohlcv', hosted).includes ('get_ohlcv'));
        assert.match (uiNotice ('unsupported', 'get_ohlcv', hosted), /did not advertise MCP Apps/);
        assert.match (uiNotice ('unsupported', 'get_ohlcv', hosted), /no interactive view was sent/);
        assert.match (uiNotice ('unknown', 'get_ohlcv', hosted), /did not declare its capabilities/);
        assert.match (uiNotice ('off', 'get_ohlcv', hosted), /disabled on this server/);
        for (const status of [ 'unsupported', 'unknown', 'off' ] as const) {
            assert.ok (uiNotice (status, 'get_ohlcv', hosted).includes ('get_ohlcv'), status);
        }
    }
    // the local escape hatch is only named where the user can set it
    assert.match (uiNotice ('unsupported', 'get_ohlcv', false), /CCXT_MCP_UI=always/);
    for (const status of UI_STATUSES) {
        assert.ok (!uiNotice (status, 'get_ohlcv', true).includes ('CCXT_MCP_UI'), status + ' (hosted) must not name a local env var');
    }
});

// ---------------------------------------------------------------------------------------
// output schemas

test ('tickerRow: every numeric field is a number or null, absent fields stay absent', () => {
    const row = tickerRow ({ 'symbol': 'BTC/USDT', 'last': '123' as any, 'bid': NaN, 'ask': 5, 'datetime': 42 as any, 'info': { 'x': 1 } }, 'X');
    assert.deepEqual (row, { 'symbol': 'BTC/USDT', 'datetime': null, 'last': null, 'bid': null, 'ask': 5 });
    assert.deepEqual (tickerRow ({ 'last': 1 }, 'ETH/USDT'), { 'symbol': 'ETH/USDT', 'last': 1 });
});

// the preview and DOM-test payloads are what the views are developed against: they must be
// exactly what the tools may return
test ('preview payloads satisfy the tools\' outputSchema', () => {
    const cases: [ string, any, any ][] = [
        [ 'chart', CHART_OUTPUT, chartPayload () ],
        [ 'orderbook', ORDERBOOK_OUTPUT, bookPayload () ],
        [ 'tickers', TICKERS_OUTPUT, tickersPayload () ],
    ];
    for (const [ name, schema, payload ] of cases) {
        const parsed = schema.safeParse (payload);
        assert.ok (parsed.success, name + ': ' + JSON.stringify (parsed.error?.issues));
        // and nothing the schema does not know about (the listed JSON Schema forbids extras)
        assert.deepEqual (Object.keys (parsed.data).sort (), Object.keys (payload).sort (), name);
    }
});
