import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ServerContext } from '../types.js';
import { ok, project, TICKER_FIELDS } from '../format.js';
import { run, clampLimit, parseSince, marketTypeMismatchNotice, fetchTickerList, normalizeBookSide, badTimeframe, exchangeParam, predictionParam, paramsParam, sinceParam } from './common.js';
import { marketTypeParam } from './market.js';
import { UI_VIEWS, uiToolMeta, uiSupported, uiNotice, registerUiResources } from '../ui.js';

// Render tools: each one pairs a public market-data fetch with a ui:// view (MCP Apps). The
// model receives a compact summary as text; the view receives the full dataset as
// structuredContent. They sit in the market tier — public data, no account, read-only — and
// the data tools (get_ohlcv, get_orderbook, get_tickers) remain the way to get raw rows.

const CHART_DEFAULT_LIMIT = 200;
const CHART_MAX_LIMIT = 500;
const BOOK_DEFAULT_LEVELS = 50;
const BOOK_MAX_LEVELS = 100;

function finite (value: any): value is number {
    return typeof value === 'number' && Number.isFinite (value);
}

function percent (fromValue: number, toValue: number): number | undefined {
    if (!finite (fromValue) || !finite (toValue) || fromValue === 0) {
        return undefined;
    }
    return Number ((((toValue - fromValue) / fromValue) * 100).toFixed (4));
}

// rows that are not a well-formed [ts, o, h, l, c, v] would break the scales in the view —
// drop them here (a few venues emit null candles for empty intervals) and keep time order
export function cleanCandles (rows: any[]): number[][] {
    const candles: number[][] = [];
    for (const row of rows ?? []) {
        if (!Array.isArray (row) || !finite (row[0]) || !finite (row[1]) || !finite (row[2]) || !finite (row[3]) || !finite (row[4])) {
            continue;
        }
        candles.push ([ row[0], row[1], row[2], row[3], row[4], finite (row[5]) ? row[5] : 0 ]);
    }
    candles.sort ((a, b) => a[0] - b[0]);
    return candles;
}

export function summarizeCandles (exchange: any, candles: number[][]): Record<string, any> {
    if (candles.length === 0) {
        return { 'count': 0 };
    }
    const first = candles[0];
    const last = candles[candles.length - 1];
    let high = -Infinity;
    let low = Infinity;
    let volume = 0;
    for (const candle of candles) {
        high = Math.max (high, candle[2]);
        low = Math.min (low, candle[3]);
        volume += candle[5];
    }
    return {
        'count': candles.length,
        'from': exchange.iso8601 (first[0]),
        'to': exchange.iso8601 (last[0]),
        'open': first[1],
        'close': last[4],
        'changePercent': percent (first[1], last[4]),
        high,
        low,
        'volume': Number (volume.toPrecision (12)),
    };
}

export function summarizeBook (bids: number[][], asks: number[][]): Record<string, any> {
    const bestBid = bids.length ? bids[0][0] : undefined;
    const bestAsk = asks.length ? asks[0][0] : undefined;
    const sum = (side: number[][]) => Number (side.reduce ((total, level) => total + (finite (level[1]) ? level[1] : 0), 0).toPrecision (12));
    const summary: Record<string, any> = {
        bestBid,
        bestAsk,
        'bidLevels': bids.length,
        'askLevels': asks.length,
        'bidDepth': sum (bids),
        'askDepth': sum (asks),
    };
    if (finite (bestBid) && finite (bestAsk)) {
        const mid = (bestBid + bestAsk) / 2;
        summary['mid'] = Number (mid.toPrecision (12));
        summary['spread'] = Number ((bestAsk - bestBid).toPrecision (12));
        summary['spreadPercent'] = (mid !== 0) ? Number ((((bestAsk - bestBid) / mid) * 100).toFixed (4)) : undefined;
    }
    return summary;
}

export function registerUiTools (server: McpServer, ctx: ServerContext): void {
    registerUiResources (server);

    server.registerTool ('show_chart', {
        'title': 'Show candlestick chart',
        'description': 'Render an interactive candlestick + volume chart for a symbol on an exchange. Use this whenever the user asks to see, show, plot or chart a price. In hosts with MCP Apps support the chart is displayed to the user; the tool result is a compact summary (range, open/close, change %, high/low, volume), not the candles — use get_ohlcv when you need the raw rows.',
        'inputSchema': {
            'exchange': exchangeParam,
            'symbol': z.string ().describe ('unified symbol, e.g. "BTC/USDT" — resolve with search_markets'),
            'timeframe': z.string ().optional ().describe ('candle interval (default "1h") — valid values come from describe_exchange .timeframes'),
            'since': sinceParam,
            'limit': z.number ().int ().optional ().describe ('number of candles (default ' + CHART_DEFAULT_LIMIT + ', max ' + CHART_MAX_LIMIT + ')'),
            'marketType': marketTypeParam,
            'prediction': predictionParam,
            'params': paramsParam,
        },
        'annotations': { 'readOnlyHint': true, 'openWorldHint': true },
        '_meta': uiToolMeta (UI_VIEWS['chart']),
    }, async ({ exchange: exchangeId, symbol, timeframe, since, limit, marketType, prediction, params }) => run ({ 'tool': 'show_chart', 'exchange': exchangeId }, async () => {
        const exchange = await ctx.pools.getPublic (exchangeId, marketType, prediction ?? false);
        const frame = timeframe ?? '1h';
        const timeframeError = badTimeframe (exchange, frame);
        if (timeframeError !== undefined) {
            return timeframeError;
        }
        const rowLimit = clampLimit (limit, CHART_DEFAULT_LIMIT, CHART_MAX_LIMIT);
        const rows = await exchange.fetchOHLCV (symbol, frame, parseSince (exchange, since), rowLimit, params ?? {});
        // some exchanges ignore the API-level limit — keep the most recent rowLimit candles
        const candles = cleanCandles (rows).slice (-rowLimit);
        const timeframes = (exchange.timeframes !== null && exchange.timeframes !== undefined) ? Object.keys (exchange.timeframes) : [];
        const supported = uiSupported (server);
        const notices = [ marketTypeMismatchNotice (exchange, [ symbol ], marketType), uiNotice (supported, 'get_ohlcv') ];
        if (candles.length === 0) {
            notices.unshift ('the exchange returned no candles for this symbol/timeframe/since');
        }
        return {
            'envelope': ok (summarizeCandles (exchange, candles), {
                'exchange': exchange.id,
                symbol,
                'timeframe': frame,
                'ui': supported ? 'displayed' : 'unsupported',
                'notice': notices.filter (Boolean).join (' '),
            }),
            'view': {
                'view': 'chart',
                'exchange': exchange.id,
                'exchangeName': exchange.name ?? exchange.id,
                symbol,
                'timeframe': frame,
                timeframes,
                'limit': rowLimit,
                candles,
            },
        };
    }));

    server.registerTool ('show_orderbook', {
        'title': 'Show order book',
        'description': 'Render an interactive order-book view (cumulative depth chart + bid/ask ladder) for one symbol. Use this when the user asks to see or visualize the order book, depth or liquidity. The tool result is a compact summary (best bid/ask, spread, depth totals) — use get_orderbook when you need the raw levels.',
        'inputSchema': {
            'exchange': exchangeParam,
            'symbol': z.string ().describe ('unified symbol — resolve with search_markets'),
            'limit': z.number ().int ().optional ().describe ('price levels per side (default ' + BOOK_DEFAULT_LEVELS + ', max ' + BOOK_MAX_LEVELS + ')'),
            'marketType': marketTypeParam,
            'prediction': predictionParam,
            'params': paramsParam,
        },
        'annotations': { 'readOnlyHint': true, 'openWorldHint': true },
        '_meta': uiToolMeta (UI_VIEWS['orderbook']),
    }, async ({ exchange: exchangeId, symbol, limit, marketType, prediction, params }) => run ({ 'tool': 'show_orderbook', 'exchange': exchangeId }, async () => {
        const exchange = await ctx.pools.getPublic (exchangeId, marketType, prediction ?? false);
        const levels = clampLimit (limit, BOOK_DEFAULT_LEVELS, BOOK_MAX_LEVELS);
        const book = await exchange.fetchOrderBook (symbol, levels, params ?? {});
        const bids = normalizeBookSide (book.bids, levels);
        const asks = normalizeBookSide (book.asks, levels);
        const supported = uiSupported (server);
        const market = exchange.markets?.[symbol];
        return {
            'envelope': ok (summarizeBook (bids, asks), {
                'exchange': exchange.id,
                'symbol': book.symbol ?? symbol,
                'timestamp': book.timestamp,
                'datetime': book.datetime,
                'ui': supported ? 'displayed' : 'unsupported',
                'notice': [ marketTypeMismatchNotice (exchange, [ symbol ], marketType), uiNotice (supported, 'get_orderbook') ].filter (Boolean).join (' '),
            }),
            'view': {
                'view': 'orderbook',
                'exchange': exchange.id,
                'exchangeName': exchange.name ?? exchange.id,
                'symbol': book.symbol ?? symbol,
                'base': market?.base,
                'quote': market?.quote,
                'limit': levels,
                'timestamp': book.timestamp,
                'datetime': book.datetime,
                bids,
                asks,
            },
        };
    }));

    server.registerTool ('show_tickers', {
        'title': 'Show price board',
        'description': 'Render a sortable 24h price board (last, 24h change, high/low, volume) for up to 50 symbols on one exchange. Use this when the user asks to see or compare current prices for several markets. The tool result is a compact per-symbol summary — use get_tickers when you need every ticker field.',
        'inputSchema': {
            'exchange': exchangeParam,
            'symbols': z.array (z.string ()).min (1).max (50).describe ('unified symbols, e.g. ["BTC/USDT", "ETH/USDT"] — resolve with search_markets'),
            'marketType': marketTypeParam,
            'prediction': predictionParam,
            'params': paramsParam,
        },
        'annotations': { 'readOnlyHint': true, 'openWorldHint': true },
        '_meta': uiToolMeta (UI_VIEWS['tickers']),
    }, async ({ exchange: exchangeId, symbols, marketType, prediction, params }) => run ({ 'tool': 'show_tickers', 'exchange': exchangeId }, async () => {
        const exchange = await ctx.pools.getPublic (exchangeId, marketType, prediction ?? false);
        const tickers = (await fetchTickerList (exchange, symbols, params ?? {})).map ((ticker) => project (ticker, TICKER_FIELDS));
        const supported = uiSupported (server);
        const SUMMARY_FIELDS = [ 'symbol', 'last', 'percentage', 'quoteVolume' ];
        return {
            'envelope': ok (tickers.map ((ticker) => project (ticker, SUMMARY_FIELDS)), {
                'exchange': exchange.id,
                'count': tickers.length,
                'ui': supported ? 'displayed' : 'unsupported',
                'notice': [ marketTypeMismatchNotice (exchange, symbols, marketType), uiNotice (supported, 'get_tickers') ].filter (Boolean).join (' '),
            }),
            'view': {
                'view': 'tickers',
                'exchange': exchange.id,
                'exchangeName': exchange.name ?? exchange.id,
                symbols,
                tickers,
            },
        };
    }));
}
