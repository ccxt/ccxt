// The canned payloads of the view preview (scripts/preview-ui.mjs), in a module of their own so
// the DOM tests (test/unit/dom.*.test.ts) render the very same data: what show_chart /
// show_orderbook / show_tickers (ts/tools/ui.ts) put in structuredContent when a view is
// displayed. test/unit/ui.test.ts validates every one against the tools' outputSchema, so
// they cannot drift from the real shapes. Every amount here is made up.

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

export const NOW = Date.UTC (2026, 10, 23, 12, 0, 0);

export const plain = (value) => JSON.parse (JSON.stringify (value));

// the summary the server computes from the candles (summarizeCandles in ts/tools/ui.ts)
function candleSummary (candles) {
    const first = candles[0];
    const last = candles[candles.length - 1];
    return {
        'count': candles.length,
        'from': new Date (first[0]).toISOString (),
        'to': new Date (last[0]).toISOString (),
        'open': first[1],
        'close': last[4],
        'changePercent': Number ((((last[4] - first[1]) / first[1]) * 100).toFixed (4)),
        'high': Math.max (...candles.map ((candle) => candle[2])),
        'low': Math.min (...candles.map ((candle) => candle[3])),
        'volume': Number (candles.reduce ((sum, candle) => sum + candle[5], 0).toPrecision (12)),
    };
}

export function chartPayload (timeframe = '1h', limit = 200) {
    const candles = makeCandles (limit, STEP[timeframe] ?? STEP['1h'], 94000, 7 + limit + (STEP[timeframe] ?? 1) % 97);
    return {
        'view': 'chart',
        'ui': 'displayed',
        'exchange': 'binance',
        'exchangeName': 'Binance',
        'symbol': 'BTC/USDT',
        timeframe,
        limit,
        'summary': candleSummary (candles),
        'timeframes': Object.keys (STEP),
        candles,
    };
}

export function bookPayload (limit = 50) {
    const mid = 94250;
    const side = (direction) => Array.from ({ 'length': limit }, (_, i) => [ round (mid + direction * (0.5 + i * 1.5 + (i % 3) * 0.4)), round (0.05 + ((i * 37) % 11) * 0.21 + (i % 7 === 0 ? 2.4 : 0)) ]);
    const bids = side (-1);
    const asks = side (1);
    const depth = (levels) => Number (levels.reduce ((sum, level) => sum + level[1], 0).toPrecision (12));
    return {
        'view': 'orderbook',
        'ui': 'displayed',
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
        'summary': {
            'bestBid': bids[0][0],
            'bestAsk': asks[0][0],
            'bidLevels': bids.length,
            'askLevels': asks.length,
            'bidDepth': depth (bids),
            'askDepth': depth (asks),
            'depthUnit': 'BTC',
            'mid': (bids[0][0] + asks[0][0]) / 2,
            'spread': Number ((asks[0][0] - bids[0][0]).toFixed (8)),
            'spreadPercent': Number ((((asks[0][0] - bids[0][0]) / ((bids[0][0] + asks[0][0]) / 2)) * 100).toPrecision (3)),
        },
        bids,
        asks,
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
    const tickers = rows.map (([ symbol, last, percentage, high, low, baseVolume, quoteVolume ]) => JSON.parse (JSON.stringify ({
            symbol, last, percentage, high, low, baseVolume, quoteVolume,
            'bid': last * 0.9999, 'ask': last * 1.0001,
            'timestamp': Date.UTC (2026, 10, 23, 12, 0, 0), 'datetime': '2026-11-23T12:00:00.000Z',
        })));
    return {
        'view': 'tickers',
        'ui': 'displayed',
        'exchange': 'binance',
        'exchangeName': 'Binance',
        'symbols': rows.map ((row) => row[0]),
        'summary': tickers.map (({ symbol, last, percentage, quoteVolume }) => plain ({ symbol, last, percentage, quoteVolume })),
        tickers,
    };
}
