// The canned payloads of the view preview (scripts/preview-ui.mjs), in a module of their own so
// the DOM tests (test/dom/) render the very same data: what show_chart / show_orderbook /
// show_tickers (ts/tools/ui.ts) and show_balance / show_orders / show_positions
// (ts/tools/ui-account.ts) put in structuredContent — keep them in step when those shapes
// change. Every account, id and amount here is made up.

// deterministic pseudo-random walk so screenshots are stable between runs
export function makeCandles (count, stepMs, start, seed) {
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

export function round (value) {
    return Number (value.toPrecision (7));
}

export const STEP = { '1m': 60000, '5m': 300000, '15m': 900000, '1h': 3600000, '4h': 14400000, '1d': 86400000, '1w': 604800000 };

// `environment` is the account's, `candlesEnvironment` where the candles were read: the same
// for a live account and normally for a practice one too — 'live' under a sandbox account is
// the fallback when its testnet served no candles, which the legend must call out
export function chartPayload (timeframe = '1h', limit = 200, environment = 'live', candlesEnvironment = environment) {
    const live = environment === 'live';
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
        'account': live ? 'main' : 'testnet',
        environment,
        candlesEnvironment,
        'orders': [
            { 'id': '48211930077', 'side': 'buy', 'type': 'limit', 'price': 92800, 'amount': 0.015, 'filled': 0, 'status': 'open' },
            { 'id': '48211930412', 'side': 'buy', 'type': 'limit', 'price': 90500, 'amount': 0.03, 'filled': 0.01, 'status': 'open' },
            { 'id': '48211931156', 'side': 'sell', 'type': 'limit', 'price': 96400, 'amount': 0.02, 'filled': 0, 'status': 'open' },
            { 'id': '48211931890', 'side': 'sell', 'type': 'limit', 'price': 120000, 'amount': 0.05, 'filled': 0, 'status': 'open' },
        ],
    };
}

export const NOW = Date.UTC (2026, 10, 23, 12, 0, 0);
export const NOW_ISO = '2026-11-23T12:00:00.000Z';
const iso = (ms) => new Date (ms).toISOString ();
// JSON round trip: an absent field is absent in a real payload (undefined never reaches the view)
export const plain = (value) => JSON.parse (JSON.stringify (value));

export function balancePayload (environment = 'live') {
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
        // a dollar currency with no market against the quote here: counted 1:1 and flagged
        [ 'USD', 1200, 0, 1200, 1, true ],
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
    const balances = rows.map (([ code, free, used, total, price, par ]) => ({
        code, free, used, total, price,
        'value': (price === undefined) ? undefined : Number ((total * price).toPrecision (12)),
        par,
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
        // a partial total: two holdings could not be priced
        'unpricedCurrencies': balances.filter ((row) => row.value === undefined).length,
        'valuedAtPar': balances.filter ((row) => row.par).map ((row) => row.code),
        'hiddenZeroBalances': 412,
    });
}

// every field of ORDER_FIELDS (ts/format.ts) that a venue would realistically fill in
export function order (id, ageMinutes, symbol, type, side, price, amount, filled, status, extra = {}) {
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

export const ORDERS = [
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

export function ordersPayload (environment = 'live', status = 'open', symbol = undefined) {
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

// variant 'mixed': every position reports its PnL, in two settle currencies — the hero shows
// one total per currency
export function positionsPayload (environment = 'live', variant = 'default') {
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
    ].filter ((row) => variant !== 'mixed' || row.unrealizedPnl !== undefined).map ((row) => ((variant === 'mixed' && row.symbol.startsWith ('BTC/USD:')) ? { ...row, 'unrealizedPnl': -0.0213, 'percentage': -2.84 } : row)) : [
        position ('BTC/USDT:USDT', 'long', 1, 1, 95010, 94250.1, 2, 'cross', { 'liquidationPrice': 48100 }),
    ];
    // what the server adds (pnlTotals in ts/tools/ui-account.ts): one total per settle
    // currency, without a figure where a position of that currency reports no PnL — the live
    // example mixes USDT with a coin-margined BTC future, and its sparse SOL row silences USDT
    const totals = [];
    for (const row of positions) {
        const currency = /^[^/:]+\/([^/:]+)(?::([^-:]+))?/.exec (row.symbol).slice (1).reverse ().find ((code) => code !== undefined);
        let total = totals.find ((entry) => entry.currency === currency);
        if (total === undefined) {
            total = { currency, 'positions': 0, 'sum': 0, 'known': true };
            totals.push (total);
        }
        total.positions += 1;
        total.known = total.known && row.unrealizedPnl !== undefined;
        total.sum += row.unrealizedPnl ?? 0;
    }
    return plain ({
        'view': 'positions',
        'account': live ? 'main' : 'testnet',
        'exchange': live ? 'binance' : 'bybit',
        'exchangeName': live ? 'Binance' : 'Bybit',
        environment, positions,
        'pnlTotals': totals.map (({ currency, positions: count, sum, known }) => ({ currency, 'positions': count, 'unrealizedPnl': known ? Number (sum.toPrecision (12)) : undefined })),
    });
}

export function bookPayload (limit = 50) {
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

export function tickersPayload () {
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
