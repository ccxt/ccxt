// Development preview for the MCP Apps views: writes one self-contained HTML page that hosts
// every view in an iframe and plays the HOST side of the protocol (ui/initialize, tool-input,
// tool-result, tools/call, size-changed) with canned data — no exchange, no MCP client.
//
// Usage:  node scripts/preview-ui.mjs [outfile]      (default: <tmpdir>/ccxt-mcp-ui-preview.html)
//         then open the file in a browser; add #dark to the URL for the dark theme.
//
// The canned payloads live in scripts/preview-payloads.mjs (the DOM tests render the same
// ones); they are what the show_* tools put in structuredContent, validated against the
// tools' outputSchema by test/unit/ui.test.ts. Every amount here is made up.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { STEP, makeCandles, round, chartPayload, bookPayload, tickersPayload } from './preview-payloads.mjs';

const here = path.dirname (fileURLToPath (import.meta.url));
const uiDir = path.resolve (here, '..', 'ts', 'ui');
const out = path.resolve (process.argv[2] ?? path.join (os.tmpdir (), 'ccxt-mcp-ui-preview.html'));

function renderView (file) {
    const template = fs.readFileSync (path.join (uiDir, file), 'utf8');
    return template.replace (/\/\*\s*@include\s+([a-z0-9.-]+)\s*\*\//g, (_match, name) => fs.readFileSync (path.join (uiDir, name), 'utf8'));
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
    title.textContent = view.tool + ((view.id.indexOf ('-') !== -1) ? ' — ' + view.id : '');
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
