// Development preview for the MCP Apps views: writes one self-contained HTML page that hosts
// every view in an iframe and plays the HOST side of the protocol (ui/initialize, tool-input,
// tool-result, tools/call, size-changed) with canned data — no exchange, no MCP client.
//
// Usage:  node scripts/preview-ui.mjs [outfile]      (default: <tmpdir>/ccxt-mcp-ui-preview.html)
//         then open the file in a browser; add #dark to the URL for the dark theme.
//
// The canned payloads mirror what show_chart / show_orderbook / show_tickers put in
// structuredContent (see ts/tools/ui.ts) — keep them in step when those shapes change.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname (fileURLToPath (import.meta.url));
const uiDir = path.resolve (here, '..', 'ts', 'ui');
const out = path.resolve (process.argv[2] ?? path.join (os.tmpdir (), 'ccxt-mcp-ui-preview.html'));

function renderView (file) {
    const template = fs.readFileSync (path.join (uiDir, file), 'utf8');
    return template.replace (/\/\*\s*@include\s+([a-z0-9.-]+)\s*\*\//g, (_match, name) => fs.readFileSync (path.join (uiDir, name), 'utf8'));
}

// deterministic pseudo-random walk so screenshots are stable between runs
function makeCandles (count, stepMs, start, seed) {
    let state = seed;
    const random = () => {
        state = (state * 1664525 + 1013904223) % 4294967296;
        return state / 4294967296;
    };
    const candles = [];
    let price = start;
    const end = Date.UTC (2026, 10, 23, 12, 0, 0);
    for (let i = 0; i < count; i++) {
        const open = price;
        const close = open * (1 + (random () - 0.48) * 0.012);
        const high = Math.max (open, close) * (1 + random () * 0.004);
        const low = Math.min (open, close) * (1 - random () * 0.004);
        candles.push ([ end - (count - 1 - i) * stepMs, round (open), round (high), round (low), round (close), round (40 + random () * 400) ]);
        price = close;
    }
    return candles;
}

function round (value) {
    return Number (value.toPrecision (7));
}

const STEP = { '1m': 60000, '5m': 300000, '15m': 900000, '1h': 3600000, '4h': 14400000, '1d': 86400000, '1w': 604800000 };

function chartPayload (timeframe = '1h', limit = 200) {
    return {
        'view': 'chart',
        'exchange': 'binance',
        'exchangeName': 'Binance',
        'symbol': 'BTC/USDT',
        timeframe,
        'timeframes': Object.keys (STEP),
        limit,
        'candles': makeCandles (limit, STEP[timeframe] ?? STEP['1h'], 94000, 7 + limit + (STEP[timeframe] ?? 1) % 97),
    };
}

function bookPayload (limit = 50) {
    const mid = 94250;
    const side = (direction) => Array.from ({ 'length': limit }, (_, i) => [ round (mid + direction * (0.5 + i * 1.5 + (i % 3) * 0.4)), round (0.05 + ((i * 37) % 11) * 0.21 + (i % 7 === 0 ? 2.4 : 0)) ]);
    return {
        'view': 'orderbook',
        'exchange': 'binance',
        'exchangeName': 'Binance',
        'symbol': 'BTC/USDT',
        'base': 'BTC',
        'quote': 'USDT',
        limit,
        'timestamp': Date.UTC (2026, 10, 23, 12, 0, 0),
        'datetime': '2026-11-23T12:00:00.000Z',
        'bids': side (-1),
        'asks': side (1),
    };
}

function tickersPayload () {
    const rows = [
        [ 'BTC/USDT', 94250.12, 2.31, 95100, 91800, 18234.5, 1712345678 ],
        [ 'ETH/USDT', 3312.45, -1.12, 3390, 3270, 254321.1, 842345678 ],
        [ 'SOL/USDT', 187.33, 5.87, 189.9, 175.2, 3254321, 602345678 ],
        [ 'XRP/USDT', 0.6123, -0.42, 0.622, 0.604, 812345678, 497345678 ],
        [ 'DOGE/USDT', 0.08412, 0, 0.0851, 0.0832, 2912345678, 244345678 ],
        [ 'PEPE/USDT', 0.00001234, -7.9, 0.0000135, 0.0000121, 9812345678901, 121345678 ],
        [ 'NEW/USDT', 1.02, undefined, undefined, undefined, undefined, undefined ],
    ];
    return {
        'view': 'tickers',
        'exchange': 'binance',
        'exchangeName': 'Binance',
        'symbols': rows.map ((row) => row[0]),
        'tickers': rows.map (([ symbol, last, percentage, high, low, baseVolume, quoteVolume ]) => JSON.parse (JSON.stringify ({
            symbol, last, percentage, high, low, baseVolume, quoteVolume,
            'bid': last * 0.9999, 'ask': last * 1.0001,
            'timestamp': Date.UTC (2026, 10, 23, 12, 0, 0), 'datetime': '2026-11-23T12:00:00.000Z',
        }))),
    };
}

const views = [
    { 'id': 'chart', 'file': 'chart.html', 'tool': 'show_chart', 'args': { 'exchange': 'binance', 'symbol': 'BTC/USDT', 'timeframe': '1h', 'limit': 200 }, 'payload': chartPayload () },
    { 'id': 'orderbook', 'file': 'orderbook.html', 'tool': 'show_orderbook', 'args': { 'exchange': 'binance', 'symbol': 'BTC/USDT', 'limit': 50 }, 'payload': bookPayload () },
    { 'id': 'tickers', 'file': 'tickers.html', 'tool': 'show_tickers', 'args': { 'exchange': 'binance', 'symbols': tickersPayload ().symbols }, 'payload': tickersPayload () },
].filter ((view) => fs.existsSync (path.join (uiDir, view.file))).map ((view) => ({ ...view, 'html': renderView (view.file) }));

// "</script" inside the embedded JSON would end the host page's script block early
const embed = (value) => JSON.stringify (value).replace (/</g, '\\u003c');

const page = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>ccxt-mcp view preview</title>
<style>
    body { margin: 0; padding: 24px; font: 14px system-ui, sans-serif; background: #e9e8e4; color: #111; }
    body.dark { background: #0e0e0d; color: #eee; }
    h2 { font-size: 13px; font-weight: 600; margin: 24px 0 8px; }
    iframe { display: block; width: 100%; max-width: 760px; height: 120px; border: 1px solid #c9c8c2; border-radius: 12px; background: transparent; }
    body.dark iframe { border-color: #3a3a37; }
</style>
</head>
<body>
<script>
// Minimal MCP Apps host: enough of the protocol for the views to run exactly as they do in
// a real host. tools/call is answered locally from a payload factory.
var VIEWS = ${embed (views.map (({ id, tool, args, payload, html }) => ({ id, tool, args, payload, html })))};
var STEP = ${embed (STEP)};
var dark = location.hash.indexOf ('dark') !== -1;
var narrow = location.hash.indexOf ('narrow') !== -1;
if (dark) { document.body.className = 'dark'; }
window.previewLog = [];
${makeCandles.toString ()}
${round.toString ()}
function answer (view, name, args) {
    if (name === 'show_chart') {
        var payload = JSON.parse (JSON.stringify (view.payload));
        payload.timeframe = args.timeframe || payload.timeframe;
        payload.limit = args.limit || payload.limit;
        payload.candles = makeCandles (payload.limit, STEP[payload.timeframe] || STEP['1h'], 94000, 11 + (STEP[payload.timeframe] || 1) % 97);
        return payload;
    }
    return view.payload;
}
VIEWS.forEach (function (view) {
    var title = document.createElement ('h2');
    title.textContent = view.tool;
    document.body.appendChild (title);
    var frame = document.createElement ('iframe');
    frame.id = 'view-' + view.id;
    frame.setAttribute ('sandbox', 'allow-scripts');
    if (narrow) { frame.style.maxWidth = '360px'; }
    frame.srcdoc = view.html;
    document.body.appendChild (frame);
    window.addEventListener ('message', function (event) {
        if (event.source !== frame.contentWindow) { return; }
        var message = event.data || {};
        window.previewLog.push ({ view: view.id, method: message.method, id: message.id });
        var reply = function (result) { frame.contentWindow.postMessage ({ jsonrpc: '2.0', id: message.id, result: result }, '*'); };
        var send = function (method, params) { frame.contentWindow.postMessage ({ jsonrpc: '2.0', method: method, params: params }, '*'); };
        if (message.method === 'ui/initialize') {
            reply ({
                protocolVersion: '2026-01-26',
                hostInfo: { name: 'ccxt-preview', version: '0.0.0' },
                hostCapabilities: { serverTools: {}, openLinks: {} },
                hostContext: { theme: dark ? 'dark' : 'light', displayMode: 'inline', locale: 'en-US', timeZone: 'UTC', platform: 'web' }
            });
        } else if (message.method === 'ui/notifications/initialized') {
            send ('ui/notifications/tool-input', { arguments: view.args });
            send ('ui/notifications/tool-result', { content: [ { type: 'text', text: '{}' } ], structuredContent: view.payload });
        } else if (message.method === 'ui/notifications/size-changed') {
            if (message.params && message.params.height) { frame.style.height = message.params.height + 'px'; }
        } else if (message.method === 'tools/call') {
            var params = message.params || {};
            setTimeout (function () {
                reply ({ content: [ { type: 'text', text: '{}' } ], structuredContent: answer (view, params.name, params.arguments || {}) });
            }, 150);
        } else if (message.id !== undefined) {
            reply ({});
        }
    });
});
</script>
</body>
</html>
`;

fs.mkdirSync (path.dirname (out), { 'recursive': true });
fs.writeFileSync (out, page);
process.stderr.write ('[preview-ui] wrote ' + out + ' (' + views.map ((view) => view.id).join (', ') + ')\n');
