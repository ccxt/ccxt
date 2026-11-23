import { test, mock } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { cleanCandles, summarizeCandles, summarizeBook, amountUnitOf } from '../../ts/tools/ui.js';
import { joinNotices, missingTickersNotice } from '../../ts/tools/market.js';
import { UI_VIEWS, UI_MIME_TYPE, UI_EXTENSION_ID, renderView, uiToolMeta, isUiPayload, toUiContent, uiNotice, uiMode, uiStatus, uiResult } from '../../ts/ui.js';
import { registerSecret, clearSecrets } from '../../ts/redact.js';
import { waitForViewFiles } from '../helpers/fake-ccxt.js';

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
    assert.deepEqual (summarizeBook ([], []), { 'bestBid': undefined, 'bestAsk': undefined, 'bidLevels': 0, 'askLevels': 0, 'bidDepth': 0, 'askDepth': 0 });
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
// ui.ts

test ('UI_VIEWS: six ui:// views with distinct names/uris and an existing file each', async () => {
    assert.deepEqual (Object.keys (UI_VIEWS).sort (), [ 'balance', 'chart', 'orderbook', 'orders', 'positions', 'tickers' ]);
    const views = Object.values (UI_VIEWS);
    await waitForViewFiles (views.map ((view) => view.file));
    assert.equal (new Set (views.map ((view) => view.uri)).size, 6);
    assert.equal (new Set (views.map ((view) => view.name)).size, 6);
    for (const view of views) {
        assert.match (view.uri, /^ui:\/\/ccxt\/[a-z]+\.html$/);
        assert.ok (view.uri.endsWith ('/' + view.file));
        assert.ok (fs.existsSync (path.join (uiDir, view.file)), view.file + ' must exist in ts/ui');
    }
    assert.equal (UI_MIME_TYPE, 'text/html;profile=mcp-app');
    assert.equal (UI_EXTENSION_ID, 'io.modelcontextprotocol/ui');
});

test ('uiToolMeta: standard nested key plus the legacy flat key and the openai alias', () => {
    for (const view of Object.values (UI_VIEWS)) {
        assert.deepEqual (uiToolMeta (view), {
            'ui': { 'resourceUri': view.uri },
            'ui/resourceUri': view.uri,
            'openai/outputTemplate': view.uri,
        });
    }
    // a fresh object per call — one tool's registration can never mutate another's
    assert.notEqual (uiToolMeta (UI_VIEWS['chart']), uiToolMeta (UI_VIEWS['chart']));
});

test ('renderView resolves every @include with the fragment verbatim', async () => {
    await waitForViewFiles (Object.values (UI_VIEWS).map ((view) => view.file));
    const css = fs.readFileSync (path.join (uiDir, 'shared.css'), 'utf8');
    const bridge = fs.readFileSync (path.join (uiDir, 'bridge.js'), 'utf8');
    for (const view of Object.values (UI_VIEWS)) {
        const template = fs.readFileSync (path.join (uiDir, view.file), 'utf8');
        assert.ok (template.includes ('/* @include shared.css */'), view.file + ' template includes shared.css');
        assert.ok (template.includes ('/* @include bridge.js */'), view.file + ' template includes bridge.js');
        const html = renderView (view);
        assert.ok (!html.includes ('@include'), view.file + ' has an unresolved @include');
        // verbatim: "$&", "$1", "$$" … inside a fragment must not be read as replace patterns
        assert.ok (html.includes (css), view.file + ' must inline shared.css verbatim');
        assert.ok (html.includes (bridge), view.file + ' must inline bridge.js verbatim');
        assert.equal (html.length, template.length - '/* @include shared.css */'.length - '/* @include bridge.js */'.length + css.length + bridge.length);
    }
});

test ('renderView caches: a second render does not touch the filesystem', () => {
    const view = UI_VIEWS['chart'];
    const first = renderView (view); // warm (another test may already have)
    const spy = mock.method (fs, 'readFileSync');
    try {
        const second = renderView (view);
        assert.equal (spy.mock.callCount (), 0);
        assert.equal (second, first);
    } finally {
        spy.mock.restore ();
    }
});

test ('renderView reads template + fragments exactly once for an uncached view file', () => {
    // the cache is keyed by file name, so a name no real view uses gives a cold entry; the
    // template is served from memory (nothing is written into ts/ui) and the fragments
    // fall through to the real files
    const file = 'zz-cache-probe.html';
    const view = { 'name': 'probe', 'uri': 'ui://ccxt/' + file, file, 'title': 'probe', 'description': 'probe' };
    const realRead = fs.readFileSync;
    const spy = mock.method (fs, 'readFileSync', (target: any, ...rest: any[]) => {
        if (path.basename (String (target)) === file) {
            return '<style>/* @include shared.css */</style><script>/*  @include   bridge.js  */</script>';
        }
        return (realRead as any) (target, ...rest);
    });
    try {
        const html = renderView (view);
        assert.equal (spy.mock.callCount (), 3);
        assert.equal (renderView (view), html);
        assert.equal (spy.mock.callCount (), 3);
        // whitespace inside the marker is tolerated
        assert.ok (!html.includes ('@include'));
        assert.ok (html.includes ('window.ccxtApp'));
        assert.ok (html.startsWith ('<style>') && html.endsWith ('</script>'));
    } finally {
        spy.mock.restore ();
    }
});

test ('isUiPayload tells a UI payload from a plain envelope', () => {
    assert.equal (isUiPayload ({ 'envelope': { 'ok': true, 'data': 1 }, 'view': { 'view': 'chart' } }), true);
    assert.equal (isUiPayload ({ 'ok': true, 'data': { 'view': 'chart' } }), false);
    assert.equal (isUiPayload ({ 'envelope': { 'ok': true, 'data': 1 } }), false);
    assert.equal (isUiPayload (null), false);
    assert.equal (isUiPayload (undefined), false);
    assert.equal (isUiPayload ('view'), false);
});

test ('toUiContent: text is the envelope, structuredContent is the view, both redacted', () => {
    clearSecrets ();
    registerSecret ('SUPERSECRETVALUE', 'secret');
    try {
        const result = toUiContent ({
            'envelope': { 'ok': true, 'data': { 'count': 1, 'note': 'sig SUPERSECRETVALUE' } },
            'view': { 'view': 'chart', 'symbol': 'BTC/USDT', 'exchangeName': 'x SUPERSECRETVALUE y', 'candles': [ [ T0, 1, 2, 0.5, 1.5, 100 ] ] },
        });
        assert.equal (result.isError, undefined);
        assert.equal (result.content.length, 1);
        assert.ok (!JSON.stringify (result).includes ('SUPERSECRETVALUE'));
        assert.deepEqual (JSON.parse (result.content[0].text), { 'ok': true, 'data': { 'count': 1, 'note': 'sig [redacted:secret]' } });
        assert.deepEqual (result.structuredContent, { 'view': 'chart', 'symbol': 'BTC/USDT', 'exchangeName': 'x [redacted:secret] y', 'candles': [ [ T0, 1, 2, 0.5, 1.5, 100 ] ] });
    } finally {
        clearSecrets ();
    }
});

test ('uiNotice says what happened to the view and names the fallback tool when none was sent', () => {
    assert.match (uiNotice ('displayed', 'get_ohlcv'), /displayed to the user/);
    assert.ok (!uiNotice ('displayed', 'get_ohlcv').includes ('get_ohlcv'));
    assert.match (uiNotice ('unsupported', 'get_ohlcv'), /did not advertise MCP Apps/);
    assert.match (uiNotice ('unsupported', 'get_ohlcv'), /no interactive view was sent/);
    assert.match (uiNotice ('unsupported', 'get_ohlcv'), /CCXT_MCP_UI=always/);
    assert.ok (uiNotice ('unsupported', 'get_ohlcv').includes ('get_ohlcv'));
    assert.match (uiNotice ('off', 'get_ohlcv'), /disabled on this server \(CCXT_MCP_UI=off\)/);
    assert.ok (uiNotice ('off', 'get_ohlcv').includes ('get_ohlcv'));
    assert.ok (!uiNotice ('off', 'get_ohlcv').includes ('did not advertise'));
});

function withUiEnv (value: string | undefined, fn: () => void): void {
    const saved = process.env['CCXT_MCP_UI'];
    if (value === undefined) {
        delete process.env['CCXT_MCP_UI'];
    } else {
        process.env['CCXT_MCP_UI'] = value;
    }
    try {
        fn ();
    } finally {
        if (saved === undefined) {
            delete process.env['CCXT_MCP_UI'];
        } else {
            process.env['CCXT_MCP_UI'] = saved;
        }
    }
}

// uiStatus only asks the server for the client capabilities
function fakeServer (capabilities: any): any {
    return { 'server': { 'getClientCapabilities': () => capabilities } };
}

test ('uiMode reads CCXT_MCP_UI: auto by default and for anything unknown', () => {
    const cases: [ string | undefined, string ][] = [
        [ undefined, 'auto' ], [ '', 'auto' ], [ 'auto', 'auto' ], [ 'AUTO', 'auto' ],
        [ 'always', 'always' ], [ ' Always ', 'always' ], [ 'off', 'off' ], [ 'OFF', 'off' ],
        [ 'on', 'auto' ], [ 'true', 'auto' ], [ '0', 'auto' ], [ 'never', 'auto' ], [ '${user_config.ui}', 'auto' ],
    ];
    for (const [ value, expected ] of cases) {
        withUiEnv (value, () => assert.equal (uiMode (), expected, JSON.stringify (value)));
    }
});

test ('uiStatus: the mode decides, and only auto asks what the host advertised', () => {
    const apps = fakeServer ({ 'extensions': { [UI_EXTENSION_ID]: { 'mimeTypes': [ UI_MIME_TYPE ] } } });
    const plain = fakeServer ({});
    const unknown = fakeServer (undefined); // capabilities are undefined before initialize completes
    withUiEnv (undefined, () => {
        assert.equal (uiStatus (apps), 'displayed');
        assert.equal (uiStatus (plain), 'unsupported');
        assert.equal (uiStatus (unknown), 'unsupported');
    });
    withUiEnv ('always', () => {
        assert.equal (uiStatus (apps), 'displayed');
        assert.equal (uiStatus (plain), 'displayed');
        assert.equal (uiStatus (unknown), 'displayed');
    });
    withUiEnv ('off', () => {
        assert.equal (uiStatus (apps), 'off');
        assert.equal (uiStatus (plain), 'off');
    });
});

test ('uiResult attaches the view only for a displayed status', () => {
    const envelope = { 'ok': true, 'data': { 'count': 1 } } as any;
    const view = { 'view': 'chart', 'candles': [ [ T0, 1, 2, 0.5, 1.5, 100 ] ] };
    const displayed = uiResult ('displayed', envelope, view);
    assert.equal (isUiPayload (displayed), true);
    assert.deepEqual (displayed, { envelope, view });
    for (const status of [ 'unsupported', 'off' ] as const) {
        const result = uiResult (status, envelope, view);
        // the plain envelope itself: run () sends it as ordinary text content
        assert.equal (result, envelope, status);
        assert.equal (isUiPayload (result), false, status);
    }
});
