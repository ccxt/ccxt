// Development preview for the MCP Apps views: writes one self-contained HTML page that hosts
// every view in an iframe and plays the HOST side of the protocol (ui/initialize, tool-input,
// tool-result, tools/call, size-changed) with canned data — no exchange, no MCP client.
//
// Usage:  node scripts/preview-ui.mjs [outfile]      (default: <tmpdir>/ccxt-mcp-ui-preview.html)
//         then open the file in a browser; add #dark to the URL for the dark theme.
//
// The canned payloads mirror what show_chart / show_orderbook / show_tickers (ts/tools/ui.ts)
// and show_balance / show_orders / show_positions (ts/tools/ui-account.ts) put in
// structuredContent — keep them in step when those shapes change. The account views are
// previewed twice, a LIVE and a SANDBOX example, because the environment badge is the one
// thing a user must never misread; every account, id and amount here is made up.
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
        // the account overlay (show_chart with `account`): that account's open orders on this
        // symbol, priced ones only — one is far from the candle range, one is partly filled
        'account': 'main',
        'environment': 'live',
        'orders': [
            { 'id': '48211930077', 'side': 'buy', 'type': 'limit', 'price': 92800, 'amount': 0.015, 'filled': 0, 'status': 'open' },
            { 'id': '48211930412', 'side': 'buy', 'type': 'limit', 'price': 90500, 'amount': 0.03, 'filled': 0.01, 'status': 'open' },
            { 'id': '48211931156', 'side': 'sell', 'type': 'limit', 'price': 96400, 'amount': 0.02, 'filled': 0, 'status': 'open' },
            { 'id': '48211931890', 'side': 'sell', 'type': 'limit', 'price': 120000, 'amount': 0.05, 'filled': 0, 'status': 'open' },
        ],
    };
}

const NOW = Date.UTC (2026, 10, 23, 12, 0, 0);
const NOW_ISO = '2026-11-23T12:00:00.000Z';
const iso = (ms) => new Date (ms).toISOString ();
// JSON round trip: an absent field is absent in a real payload (undefined never reaches the view)
const plain = (value) => JSON.parse (JSON.stringify (value));

function balancePayload (environment = 'live') {
    if (environment !== 'live') {
        // a testnet account on an exchange without fetchTickers: no valuation at all, and
        // no timestamp — rows keep the server's fallback order (total desc)
        return plain ({
            'view': 'balance',
            'account': 'testnet',
            'exchange': 'bybit',
            'exchangeName': 'Bybit',
            environment,
            'balances': [
                { 'code': 'USDT', 'free': 100000, 'used': 0, 'total': 100000 },
                { 'code': 'BTC', 'free': 1, 'used': 0, 'total': 1 },
                { 'code': 'ETH', 'free': 0.5, 'used': 0.5, 'total': 1 },
                { 'code': 'USDC', 'used': 0, 'total': 0 },
            ],
            'hiddenZeroBalances': 0,
        });
    }
    const rows = [
        // [ code, free, used, total, price ]
        [ 'BTC', 0.41250000, 0.03, 0.4425, 94250.12 ],
        [ 'USDT', 12840.55, 2784, 15624.55, 1 ],
        [ 'ETH', 3.2, 0, 3.2, 3312.45 ],
        [ 'SOL', 41.7, 12, 53.7, 187.33 ],
        [ 'PEPE', 1250000000, 0, 1250000000, 0.00001234 ],
        [ 'DOGE', 1500.5, 0, 1500.5, 0.08412 ],
        // held but not valued: no market against the quote currency, or the ticker had no price
        [ '1000000MOGCOINLONGNAME', 7300000.123456, 0, 7300000.123456, undefined ],
        [ 'LDBNB', 0.00004213, 0, 0.00004213, undefined ],
        // free/used unknown — some venues report a total only
        [ 'XRP', undefined, undefined, 250, 0.6123 ],
    ];
    const balances = rows.map (([ code, free, used, total, price ]) => ({
        code, free, used, total, price,
        'value': (price === undefined) ? undefined : Number ((total * price).toPrecision (12)),
    })).sort ((a, b) => (b.value ?? -1) - (a.value ?? -1) || b.total - a.total);
    return plain ({
        'view': 'balance',
        'account': 'main',
        'exchange': 'binance',
        'exchangeName': 'Binance',
        environment,
        'timestamp': NOW,
        'datetime': NOW_ISO,
        balances,
        'quote': 'USDT',
        'totalValue': Number (balances.reduce ((sum, row) => sum + (row.value ?? 0), 0).toFixed (2)),
        'hiddenZeroBalances': 412,
    });
}

// every field of ORDER_FIELDS (ts/format.ts) that a venue would realistically fill in
function order (id, ageMinutes, symbol, type, side, price, amount, filled, status, extra = {}) {
    const timestamp = NOW - ageMinutes * 60000;
    const average = (filled > 0) ? (extra.average ?? price) : undefined;
    return {
        id,
        'clientOrderId': extra.clientOrderId,
        timestamp,
        'datetime': iso (timestamp),
        'lastTradeTimestamp': (filled > 0) ? timestamp + 42000 : undefined,
        symbol, type, side, price,
        'triggerPrice': extra.triggerPrice,
        'stopLossPrice': extra.stopLossPrice,
        'takeProfitPrice': extra.takeProfitPrice,
        amount,
        'cost': (average !== undefined) ? Number ((filled * average).toPrecision (10)) : 0,
        filled,
        'remaining': (amount !== undefined) ? Number ((amount - filled).toPrecision (10)) : undefined,
        average, status,
        'timeInForce': extra.timeInForce ?? ((type === 'limit') ? 'GTC' : 'IOC'),
        'postOnly': extra.postOnly ?? false,
        'reduceOnly': extra.reduceOnly,
        'fee': extra.fee,
    };
}

const ORDERS = [
    order ('48211931890', 3, 'BTC/USDT', 'limit', 'sell', 120000, 0.05, 0, 'open', { 'clientOrderId': 'ccxt-mcp-7f3a91', 'postOnly': true }),
    order ('48211931156', 18, 'BTC/USDT', 'limit', 'sell', 96400, 0.02, 0, 'open'),
    order ('48211930412', 95, 'BTC/USDT', 'limit', 'buy', 90500, 0.03, 0.01, 'open', { 'fee': { 'cost': 0.00001, 'currency': 'BTC' } }),
    // a stop order has no limit price, only a trigger
    order ('7719004411', 240, 'ETH/USDT:USDT', 'market', 'sell', undefined, 1.5, 0, 'open', { 'triggerPrice': 3050, 'stopLossPrice': 3050, 'reduceOnly': true }),
    order ('9f1c2e7a-55d0-4b6e-9a31-0c5d8e2f7b44', 1500, '1000000MOGCOINLONGNAME/USDT:USDT', 'limit', 'buy', 0.00000123, 81000000, 0, 'open'),
    // a filled market order: price is absent, the fill is in average/cost
    order ('48211800321', 2900, 'SOL/USDT', 'market', 'buy', undefined, 12, 12, 'closed', { 'average': 184.92, 'fee': { 'cost': 2.21904, 'currency': 'USDT' } }),
    order ('48211700555', 4400, 'ETH/USDT', 'limit', 'sell', 3390, 0.8, 0.8, 'closed', { 'fee': { 'cost': 2.712, 'currency': 'USDT' } }),
    order ('48211600777', 5900, 'DOGE/USDT', 'limit', 'buy', 0.0791, 5000, 0, 'canceled'),
    // sparse row: some venues return almost nothing for old orders
    { 'id': '48211500999', 'symbol': 'XRP/USDT', 'side': 'buy', 'status': 'canceled' },
];

function ordersPayload (environment = 'live', status = 'open', symbol = undefined) {
    const live = environment === 'live';
    const orders = ORDERS.filter ((row) => (status === 'all' || row.status === status) && (symbol === undefined || row.symbol === symbol));
    return plain ({
        'view': 'orders',
        'account': live ? 'main' : 'testnet',
        'exchange': live ? 'binance' : 'bybit',
        'exchangeName': live ? 'Binance' : 'Bybit',
        environment, status, symbol, orders,
        'hasMore': status === 'all',
    });
}

function positionsPayload (environment = 'live') {
    const live = environment === 'live';
    // POSITION_FIELDS (ts/format.ts)
    const position = (symbol, side, contracts, contractSize, entryPrice, markPrice, leverage, marginMode, extra = {}) => {
        const notional = Number ((contracts * contractSize * markPrice).toPrecision (10));
        const unrealizedPnl = Number (((markPrice - entryPrice) * contracts * contractSize * ((side === 'long') ? 1 : -1)).toPrecision (8));
        const initialMargin = Number ((notional / leverage).toPrecision (8));
        return {
            symbol, side, contracts, contractSize, notional, entryPrice, markPrice,
            'liquidationPrice': extra.liquidationPrice,
            unrealizedPnl,
            'realizedPnl': extra.realizedPnl,
            'percentage': Number (((unrealizedPnl / initialMargin) * 100).toFixed (2)),
            leverage, marginMode,
            'collateral': initialMargin,
            initialMargin,
            'maintenanceMargin': Number ((notional * 0.005).toPrecision (6)),
            'hedged': false,
            'timestamp': NOW,
            'datetime': NOW_ISO,
        };
    };
    const positions = live ? [
        position ('BTC/USDT:USDT', 'long', 0.25, 1, 91200, 94250.1, 10, 'cross', { 'liquidationPrice': 83410.5, 'realizedPnl': 12.4 }),
        // a losing short
        position ('ETH/USDT:USDT', 'short', 4, 1, 3180, 3312.45, 5, 'isolated', { 'liquidationPrice': 3795.2, 'realizedPnl': -3.15 }),
        // contracts with a contractSize other than 1, and a symbol that will not fit a narrow column
        position ('1000000MOGCOINLONGNAME/USDT:USDT', 'long', 12000, 1000, 0.00000118, 0.00000123, 3, 'isolated'),
        // an inverse dated future, flat PnL, no liquidation price under cross margin
        position ('BTC/USD:BTC-261225', 'short', 15, 100, 94250, 94250, 20, 'cross'),
        // sparse row: only what the venue reported
        { 'symbol': 'SOL/USDT:USDT', 'side': 'long', 'contracts': 30, 'entryPrice': 181.4 },
    ] : [
        position ('BTC/USDT:USDT', 'long', 1, 1, 95010, 94250.1, 2, 'cross', { 'liquidationPrice': 48100 }),
    ];
    return plain ({
        'view': 'positions',
        'account': live ? 'main' : 'testnet',
        'exchange': live ? 'binance' : 'bybit',
        'exchangeName': live ? 'Binance' : 'Bybit',
        environment, positions,
    });
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
        // a spot book: amounts are base currency (a contract market sends its contractSize,
        // inverse flag and 'amountUnit': 'contracts' here)
        'contractSize': 1,
        'inverse': false,
        'amountUnit': 'BTC',
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
    { 'id': 'balance', 'file': 'balance.html', 'tool': 'show_balance', 'args': { 'account': 'main' }, 'payload': balancePayload ('live') },
    { 'id': 'balance-sandbox', 'file': 'balance.html', 'tool': 'show_balance', 'args': { 'account': 'testnet', 'nonzeroOnly': false }, 'payload': balancePayload ('sandbox') },
    { 'id': 'orders', 'file': 'orders.html', 'tool': 'show_orders', 'args': { 'account': 'main' }, 'payload': ordersPayload ('live', 'open') },
    { 'id': 'orders-sandbox', 'file': 'orders.html', 'tool': 'show_orders', 'args': { 'account': 'testnet', 'status': 'all' }, 'payload': ordersPayload ('sandbox', 'all') },
    { 'id': 'orders-empty', 'file': 'orders.html', 'tool': 'show_orders', 'args': { 'account': 'main', 'symbol': 'LTC/USDT' }, 'payload': ordersPayload ('live', 'open', 'LTC/USDT') },
    { 'id': 'positions', 'file': 'positions.html', 'tool': 'show_positions', 'args': { 'account': 'main' }, 'payload': positionsPayload ('live') },
    { 'id': 'positions-sandbox', 'file': 'positions.html', 'tool': 'show_positions', 'args': { 'account': 'testnet' }, 'payload': positionsPayload ('sandbox') },
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
var ORDERS = ${embed (plain (ORDERS))};
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
        // like the server: the overlay is only present when the call carries an account
        if (args.account === undefined) {
            delete payload.account;
            delete payload.environment;
            delete payload.orders;
        }
        return payload;
    }
    if (name === 'show_orders') {
        // a view that switches the status filter gets the matching slice of the canned orders
        var status = args.status || 'open';
        var orders = JSON.parse (JSON.stringify (view.payload));
        orders.status = status;
        orders.symbol = args.symbol;
        orders.orders = ORDERS.filter (function (row) {
            return (status === 'all' || row.status === status) && (args.symbol === undefined || row.symbol === args.symbol);
        });
        orders.hasMore = status === 'all';
        return orders;
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
