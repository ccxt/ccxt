import { test, mock } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { cleanCandles, summarizeCandles, summarizeBook } from '../../ts/tools/ui.js';
import { UI_VIEWS, UI_MIME_TYPE, UI_EXTENSION_ID, renderView, uiToolMeta, isUiPayload, toUiContent, uiNotice } from '../../ts/ui.js';
import { registerSecret, clearSecrets } from '../../ts/redact.js';

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

// ---------------------------------------------------------------------------------------
// ui.ts

test ('UI_VIEWS: three ui:// views with distinct names/uris and an existing file each', () => {
    assert.deepEqual (Object.keys (UI_VIEWS).sort (), [ 'chart', 'orderbook', 'tickers' ]);
    const views = Object.values (UI_VIEWS);
    assert.equal (new Set (views.map ((view) => view.uri)).size, 3);
    assert.equal (new Set (views.map ((view) => view.name)).size, 3);
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

test ('renderView resolves every @include with the fragment verbatim', () => {
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

test ('uiNotice names the fallback tool only when the view may be invisible', () => {
    assert.match (uiNotice (true, 'get_ohlcv'), /displayed to the user/);
    assert.ok (!uiNotice (true, 'get_ohlcv').includes ('get_ohlcv'));
    assert.match (uiNotice (false, 'get_ohlcv'), /did not advertise MCP Apps/);
    assert.ok (uiNotice (false, 'get_ohlcv').includes ('get_ohlcv'));
});
