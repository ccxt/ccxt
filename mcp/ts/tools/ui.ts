import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ServerContext } from '../types.js';
import { ok, project, TICKER_FIELDS } from '../format.js';
import { run, clampLimit, parseSince, marketTypeMismatchNotice, fetchTickerList, normalizeBookSide, badTimeframe, exchangeParam, predictionParam, paramsParam, sinceParam } from './common.js';
import type { Envelope } from '../format.js';
import { marketTypeParam, joinNotices, missingTickersNotice } from './market.js';
import { UI_VIEWS, uiToolMeta, uiMode, uiStatus, uiNotice, uiResult, registerUiResources, type UiPayload } from '../ui.js';

// Render tools: each one pairs a public market-data fetch with a ui:// view (MCP Apps). The
// model receives a compact summary as text; the view receives the full dataset as
// structuredContent — but only on a host that renders it (CCXT_MCP_UI, see ../ui.ts): every
// other host gets the text summary alone. They sit in the market tier — public data, no
// account, read-only — and the data tools (get_ohlcv, get_orderbook, get_tickers) remain the
// way to get raw rows.

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
// drop them here (a few venues emit null candles for empty intervals) and keep time order.
// Venues also occasionally emit an open or close outside [low, high]; the wick is widened to
// cover the body so a candle never draws (or summarizes) with its body past its own range.
export function cleanCandles (rows: any[]): number[][] {
    const candles: number[][] = [];
    for (const row of rows ?? []) {
        if (!Array.isArray (row) || !finite (row[0]) || !finite (row[1]) || !finite (row[2]) || !finite (row[3]) || !finite (row[4])) {
            continue;
        }
        const high = Math.max (row[1], row[2], row[3], row[4]);
        const low = Math.min (row[1], row[2], row[3], row[4]);
        candles.push ([ row[0], row[1], high, low, row[4], finite (row[5]) ? row[5] : 0 ]);
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

// How the amounts of a market's order book are denominated. ccxt reports contract-market
// amounts in CONTRACTS, so with a contractSize other than 1 a level's amount is neither base
// nor quote currency. Same convention as the notional math in ../safety.ts: a linear contract
// is contractSize of BASE, an inverse (coin-margined) one is contractSize of QUOTE.
export interface AmountUnit {
    contractSize: number; // 1 for spot and for contracts quoted one-to-one in base
    inverse: boolean;
    inContracts: boolean;
    amountUnit: string | undefined; // 'contracts', else the base currency code (when known)
}

export function amountUnitOf (market: any): AmountUnit {
    const contractSize = (market?.contract === true && finite (market.contractSize) && market.contractSize > 0) ? market.contractSize : 1;
    const inContracts = contractSize !== 1;
    return {
        contractSize,
        'inverse': market?.inverse === true,
        inContracts,
        'amountUnit': inContracts ? 'contracts' : market?.base,
    };
}

// bidDepth/askDepth are sums of the raw level amounts, in `depthUnit` when the market is
// known. For a market traded in contracts those sums are a contract count, so the base- and
// quote-currency equivalents are added — the model must never have to guess the conversion.
export function summarizeBook (bids: number[][], asks: number[][], unit?: AmountUnit): Record<string, any> {
    const bestBid = bids.length ? bids[0][0] : undefined;
    const bestAsk = asks.length ? asks[0][0] : undefined;
    const total = (side: number[][], value: (price: number, amount: number) => number) => Number (side.reduce ((sum, level) => {
        const worth = (finite (level[0]) && finite (level[1])) ? value (level[0], level[1]) : 0;
        return sum + (finite (worth) ? worth : 0);
    }, 0).toPrecision (12));
    const sum = (side: number[][]) => Number (side.reduce ((sum, level) => sum + (finite (level[1]) ? level[1] : 0), 0).toPrecision (12));
    const summary: Record<string, any> = {
        bestBid,
        bestAsk,
        'bidLevels': bids.length,
        'askLevels': asks.length,
        'bidDepth': sum (bids),
        'askDepth': sum (asks),
    };
    if (unit?.amountUnit !== undefined) {
        summary['depthUnit'] = unit.amountUnit;
    }
    if (unit !== undefined && unit.inContracts) {
        const size = unit.contractSize;
        const base = unit.inverse ? ((price: number, amount: number) => (amount * size) / price) : ((_price: number, amount: number) => amount * size);
        const quote = unit.inverse ? ((_price: number, amount: number) => amount * size) : ((price: number, amount: number) => amount * size * price);
        summary['bidDepthBase'] = total (bids, base);
        summary['askDepthBase'] = total (asks, base);
        summary['bidDepthQuote'] = total (bids, quote);
        summary['askDepthQuote'] = total (asks, quote);
    }
    if (finite (bestBid) && finite (bestAsk)) {
        const mid = (bestBid + bestAsk) / 2;
        summary['mid'] = Number (mid.toPrecision (12));
        // the subtraction error is absolute at the operands' magnitude (62137.5 - 62137.4 is
        // 0.0999999999985), so it is rounded away there — rounding relative to the tiny
        // difference keeps it. The percent keeps significant digits instead of fixed decimals:
        // a one-tick spread on a 5-digit price is ~0.00002 %, which toFixed (4) reports as 0.
        const magnitude = Math.max (Math.abs (bestBid), Math.abs (bestAsk));
        const decimals = (magnitude > 0) ? Math.min (100, Math.max (0, 14 - Math.ceil (Math.log10 (magnitude)))) : 0;
        const spread = Number ((bestAsk - bestBid).toFixed (decimals));
        summary['spread'] = spread;
        summary['spreadPercent'] = (mid !== 0) ? Number (((spread / mid) * 100).toPrecision (3)) : undefined;
    }
    return summary;
}

// meta keys left undefined would serialize as null — drop them so an absent fact stays absent
function compactMeta (meta: Record<string, any>): Record<string, any> {
    const out: Record<string, any> = {};
    for (const [ key, value ] of Object.entries (meta)) {
        if (value !== undefined) {
            out[key] = value;
        }
    }
    return out;
}

export function registerUiTools (server: McpServer, ctx: ServerContext): void {
    registerUiResources (server);
    // with views switched off the ui:// link is not advertised either: an MCP Apps host would
    // otherwise open the view for a result that carries no payload for it
    const toolMeta = (view: string) => ((uiMode () === 'off') ? undefined : uiToolMeta (UI_VIEWS[view]));
    // every show_* result is assembled here: meta.ui and the trailing notice always say what
    // happened to the view, and the view payload is attached only when a host will render it
    const respond = (fallbackTool: string, data: any, meta: Record<string, any>, notices: (string | undefined)[], view: Record<string, any>): Envelope | UiPayload => {
        const status = uiStatus (server);
        const envelope = ok (data, compactMeta ({ ...meta, 'ui': status, 'notice': joinNotices ([ ...notices, uiNotice (status, fallbackTool) ]) }));
        return uiResult (status, envelope, view);
    };

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
        '_meta': toolMeta ('chart'),
    }, async ({ exchange: exchangeId, symbol, timeframe, since, limit, marketType, prediction, params }) => run ({ 'tool': 'show_chart', 'exchange': exchangeId }, async () => {
        const exchange = await ctx.pools.getPublic (exchangeId, marketType, prediction ?? false);
        const frame = timeframe ?? '1h';
        const timeframeError = badTimeframe (exchange, frame);
        if (timeframeError !== undefined) {
            return timeframeError;
        }
        const rowLimit = clampLimit (limit, CHART_DEFAULT_LIMIT, CHART_MAX_LIMIT);
        const sinceMs = parseSince (exchange, since);
        const rows = await exchange.fetchOHLCV (symbol, frame, sinceMs, rowLimit, params ?? {});
        // some exchanges ignore the API-level limit — keep rowLimit candles: the first ones
        // from `since` when a start was requested (what get_ohlcv returns for the same
        // arguments), otherwise the most recent
        const cleaned = cleanCandles (rows);
        const candles = (sinceMs !== undefined) ? cleaned.slice (0, rowLimit) : cleaned.slice (-rowLimit);
        const timeframes = (exchange.timeframes !== null && exchange.timeframes !== undefined) ? Object.keys (exchange.timeframes) : [];
        const notices = [
            (candles.length === 0) ? 'the exchange returned no candles for this symbol/timeframe/since' : undefined,
            marketTypeMismatchNotice (exchange, [ symbol ], marketType),
        ];
        return respond ('get_ohlcv', summarizeCandles (exchange, candles), {
            'exchange': exchange.id,
            symbol,
            'timeframe': frame,
        }, notices, {
            'view': 'chart',
            'exchange': exchange.id,
            'exchangeName': exchange.name ?? exchange.id,
            symbol,
            'timeframe': frame,
            timeframes,
            'limit': rowLimit,
            candles,
        });
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
        '_meta': toolMeta ('orderbook'),
    }, async ({ exchange: exchangeId, symbol, limit, marketType, prediction, params }) => run ({ 'tool': 'show_orderbook', 'exchange': exchangeId }, async () => {
        const exchange = await ctx.pools.getPublic (exchangeId, marketType, prediction ?? false);
        const levels = clampLimit (limit, BOOK_DEFAULT_LEVELS, BOOK_MAX_LEVELS);
        const book = await exchange.fetchOrderBook (symbol, levels, params ?? {});
        const bids = normalizeBookSide (book.bids, levels);
        const asks = normalizeBookSide (book.asks, levels);
        const market = exchange.markets?.[symbol];
        const unit = amountUnitOf (market);
        const unitNotice = unit.inContracts
            ? 'amounts are in contracts (1 contract = ' + unit.contractSize + ' ' + ((unit.inverse ? market?.quote : market?.base) ?? (unit.inverse ? 'quote' : 'base')) + '), not in base currency — bidDepth/askDepth count contracts; use the *DepthBase / *DepthQuote totals for currency amounts'
            : undefined;
        return respond ('get_orderbook', summarizeBook (bids, asks, unit), {
            'exchange': exchange.id,
            'symbol': book.symbol ?? symbol,
            'timestamp': book.timestamp,
            'datetime': book.datetime,
            'amountUnit': unit.amountUnit,
            'contractSize': unit.inContracts ? unit.contractSize : undefined,
            'inverse': (unit.inContracts && unit.inverse) ? true : undefined,
        }, [ marketTypeMismatchNotice (exchange, [ symbol ], marketType), unitNotice ], {
            'view': 'orderbook',
            'exchange': exchange.id,
            'exchangeName': exchange.name ?? exchange.id,
            'symbol': book.symbol ?? symbol,
            'base': market?.base,
            'quote': market?.quote,
            // amounts of a contract market are in contracts: the view converts with these
            'contractSize': unit.contractSize,
            'inverse': unit.inverse,
            'amountUnit': unit.amountUnit,
            'limit': levels,
            'timestamp': book.timestamp,
            'datetime': book.datetime,
            bids,
            asks,
        });
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
        '_meta': toolMeta ('tickers'),
    }, async ({ exchange: exchangeId, symbols, marketType, prediction, params }) => run ({ 'tool': 'show_tickers', 'exchange': exchangeId }, async () => {
        const exchange = await ctx.pools.getPublic (exchangeId, marketType, prediction ?? false);
        const tickers = (await fetchTickerList (exchange, symbols, params ?? {})).filter ((ticker) => ticker !== undefined && ticker !== null).map ((ticker) => project (ticker, TICKER_FIELDS));
        const returned = new Set (tickers.map ((ticker) => ticker.symbol));
        const missing = symbols.filter ((symbol) => !returned.has (symbol));
        // Markets whose amounts are in contracts (contractSize other than 1). ccxt passes a
        // contract market's 24h volume through as the venue reports it — on many venues that
        // is a contract count, not base currency — so the view must not label it as base.
        const contracts: Record<string, any> = {};
        for (const ticker of tickers) {
            const unit = amountUnitOf (exchange.markets?.[ticker.symbol]);
            if (unit.inContracts) {
                contracts[ticker.symbol] = { 'contractSize': unit.contractSize, 'inverse': unit.inverse };
            }
        }
        const contractSymbols = Object.keys (contracts);
        const hasContracts = contractSymbols.length > 0;
        const contractNotice = hasContracts
            ? contractSymbols.join (', ') + ' trade in contracts (see meta.contracts for the contractSize) — their 24h volume may be a contract count rather than a currency amount'
            : undefined;
        const SUMMARY_FIELDS = [ 'symbol', 'last', 'percentage', 'quoteVolume' ];
        return respond ('get_tickers', tickers.map ((ticker) => project (ticker, SUMMARY_FIELDS)), {
            'exchange': exchange.id,
            'count': tickers.length,
            'missing': missing.length ? missing : undefined,
            'contracts': hasContracts ? contracts : undefined,
        }, [ missingTickersNotice (missing), marketTypeMismatchNotice (exchange, symbols, marketType), contractNotice ], {
            'view': 'tickers',
            'exchange': exchange.id,
            'exchangeName': exchange.name ?? exchange.id,
            symbols,
            tickers,
            ...(hasContracts ? { contracts } : {}),
        });
    }));
}
