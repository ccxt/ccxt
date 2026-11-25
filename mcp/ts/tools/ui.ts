import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/server';
import type { ServerContext } from '../types.js';
import { ok, TICKER_FIELDS } from '../format.js';
import { run, clampLimit, parseSince, marketTypeMismatchNotice, fetchTickerList, normalizeBookSide, badTimeframe, joinNotices, missingTickersNotice, exchangeParam, predictionParam, paramsParam, sinceParam, symbolParam, marketTypeParam, MAX_CODE_LENGTH, MAX_SYMBOLS } from './common.js';
import { UI_STATUSES, uiToolMeta, uiNotice, decideUiStatus, uiSupport, requestClientCapabilities, attachesView, registerUiResources, type UiPayload, type ViewName } from '../ui.js';
import { currentRequestScope } from '../request-scope.js';
import { registerLiveTool } from './live.js';

// Render tools: each one pairs a public market-data fetch with a ui:// view (MCP Apps).
// The model receives a compact summary as text. structuredContent always carries the same
// summary plus the view's identity; the dataset the view draws (candles, levels, tickers) is
// added only when the server decided a view will render it (meta.ui "displayed" or
// "attached", see ../ui.ts). They are public, read-only and need no account; the data tools
// (get_ohlcv, get_orderbook, get_tickers) remain the way to get raw rows.

export const CHART_DEFAULT_LIMIT = 200;
export const CHART_MAX_LIMIT = 500;
export const BOOK_DEFAULT_LEVELS = 50;
export const BOOK_MAX_LEVELS = 100;
export const TICKERS_MAX_SYMBOLS = MAX_SYMBOLS;

export function finite (value: any): value is number {
    return typeof value === 'number' && Number.isFinite (value);
}

// Exchange data is not trusted to have its type: every number the payload carries passes
// through here, so a venue that returns a string or NaN can never fail the outputSchema
// (which would turn a usable result into a protocol error) — it becomes null, as JSON would.
function numberOrNull (value: any): number | null {
    return finite (value) ? value : null;
}

function stringOrUndefined (value: any): string | undefined {
    return (typeof value === 'string' && value.length > 0) ? value : undefined;
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

// What the chart view receives, per candle. It is drawn, never re-computed, so digits beyond
// what a pixel or a formatted label can show are dropped: prices keep 10 significant digits
// (exchange ticks rarely need more than 8; this mostly strips float noise), volume keeps 8
// (the view prints it compactly). That keeps 500 candles of long-decimal data under ~40 KB
// instead of ~50 KB, which matters because a host that does not render the view may hand the
// payload to the model. The summary is computed from the unrounded candles, and get_ohlcv
// returns them untouched.
const PRICE_DIGITS = 10;
const VOLUME_DIGITS = 8;

export function viewCandles (candles: number[][]): number[][] {
    const round = (value: number, digits: number) => Number (value.toPrecision (digits));
    return candles.map ((candle) => [ candle[0], round (candle[1], PRICE_DIGITS), round (candle[2], PRICE_DIGITS), round (candle[3], PRICE_DIGITS), round (candle[4], PRICE_DIGITS), round (candle[5], VOLUME_DIGITS) ]);
}

function iso (exchange: any, timestamp: number): string | undefined {
    const value = (typeof exchange?.iso8601 === 'function') ? exchange.iso8601 (timestamp) : new Date (timestamp).toISOString ();
    return stringOrUndefined (value);
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
    return compactMeta ({
        'count': candles.length,
        'from': iso (exchange, first[0]),
        'to': iso (exchange, last[0]),
        'open': first[1],
        'close': last[4],
        'changePercent': percent (first[1], last[4]),
        high,
        low,
        'volume': Number (volume.toPrecision (12)),
    });
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
        'amountUnit': inContracts ? 'contracts' : stringOrUndefined (market?.base),
    };
}

// bidDepth/askDepth are sums of the raw level amounts, in `depthUnit` when the market is
// known. For a market traded in contracts those sums are a contract count, so the base- and
// quote-currency equivalents are added — the model must never have to guess the conversion.
export function summarizeBook (bids: any[][], asks: any[][], unit?: AmountUnit): Record<string, any> {
    const bestBid = bids.length ? numberOrNull (bids[0][0]) : undefined;
    const bestAsk = asks.length ? numberOrNull (asks[0][0]) : undefined;
    const total = (side: any[][], value: (price: number, amount: number) => number) => Number (side.reduce ((sum, level) => {
        const worth = (finite (level[0]) && finite (level[1])) ? value (level[0], level[1]) : 0;
        return sum + (finite (worth) ? worth : 0);
    }, 0).toPrecision (12));
    const sum = (side: any[][]) => Number (side.reduce ((sum, level) => sum + (finite (level[1]) ? level[1] : 0), 0).toPrecision (12));
    const summary: Record<string, any> = {
        'bestBid': bestBid ?? undefined,
        'bestAsk': bestAsk ?? undefined,
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
    return compactMeta (summary);
}

// keys left undefined would serialize as null — drop them so an absent fact stays absent
export function compactMeta (meta: Record<string, any>): Record<string, any> {
    const out: Record<string, any> = {};
    for (const [ key, value ] of Object.entries (meta)) {
        if (value !== undefined) {
            out[key] = value;
        }
    }
    return out;
}

const TICKER_NUMBER_FIELDS = TICKER_FIELDS.filter ((field) => field !== 'symbol' && field !== 'datetime');
const TICKER_SUMMARY_FIELDS = [ 'symbol', 'last', 'percentage', 'quoteVolume' ];

// one board row per ticker, typed field by field (see numberOrNull); an absent field stays absent
export function tickerRow (ticker: any, fallbackSymbol: string): Record<string, any> {
    const row: Record<string, any> = { 'symbol': stringOrUndefined (ticker?.symbol) ?? fallbackSymbol };
    if (ticker?.datetime !== undefined) {
        row['datetime'] = stringOrUndefined (ticker.datetime) ?? null;
    }
    for (const field of TICKER_NUMBER_FIELDS) {
        if (ticker?.[field] !== undefined) {
            row[field] = numberOrNull (ticker[field]);
        }
    }
    return row;
}

// ---- output schemas ---------------------------------------------------------------------------
// What structuredContent holds, per tool. Declared because ChatGPT requires an outputSchema
// for structured results and the SDK validates every non-error result against it. The
// dataset fields are optional: they are present only when meta.ui is "displayed" or
// "attached". The top level names every key; the summaries and rows are described by their
// value types only — a host injects tool definitions into the model's context (the core
// profile has a size budget, see ./profile.ts), and per-field detail there buys nothing.

const scalar = z.union ([ z.number (), z.string (), z.null () ]);
const numberRow = z.array (z.number ().nullable ());
const viewBase = {
    'ui': z.enum (UI_STATUSES),
    'exchange': z.string (),
    'exchangeName': z.string (),
    'notice': z.string ().optional (),
};

export const CHART_OUTPUT = z.object ({
    'view': z.literal ('chart'),
    ...viewBase,
    'symbol': z.string (),
    'timeframe': z.string (),
    'limit': z.number ().int (),
    'summary': z.record (z.string (), z.union ([ z.number (), z.string () ])),
    'timeframes': z.array (z.string ()).optional (),
    'candles': z.array (z.array (z.number ())).optional (),
});

export const ORDERBOOK_OUTPUT = z.object ({
    'view': z.literal ('orderbook'),
    ...viewBase,
    'symbol': z.string (),
    'base': z.string ().optional (),
    'quote': z.string ().optional (),
    'contractSize': z.number (),
    'inverse': z.boolean (),
    'amountUnit': z.string ().optional (),
    'limit': z.number ().int (),
    'timestamp': z.number ().optional (),
    'datetime': z.string ().optional (),
    'summary': z.record (z.string (), z.union ([ z.number (), z.string () ])),
    'bids': z.array (numberRow).optional (),
    'asks': z.array (numberRow).optional (),
});

// a ticker row: its symbol, and every other field a number, a datetime string or null
const tickerRowSchema = z.object ({ 'symbol': z.string () }).catchall (scalar);

export const TICKERS_OUTPUT = z.object ({
    'view': z.literal ('tickers'),
    ...viewBase,
    'symbols': z.array (z.string ()),
    'missing': z.array (z.string ()).optional (),
    'contracts': z.record (z.string (), z.object ({ 'contractSize': z.number (), 'inverse': z.boolean () })).optional (),
    'summary': z.array (tickerRowSchema),
    'tickers': z.array (tickerRowSchema).optional (),
});

// ---- registration -----------------------------------------------------------------------------

interface Render {
    view: ViewName;
    fallbackTool: string; // the get_* tool that returns the full dataset
    summary: any; // the model's data: envelope.data and structuredContent.summary
    meta: Record<string, any>; // envelope.meta (ui and notice are added here)
    notices: (string | undefined)[];
    base: Record<string, any>; // always in structuredContent: what the view is of
    dataset: Record<string, any>; // in structuredContent only when the view will render it
}

// every show_* result is assembled here: meta.ui and the trailing notice always say what
// happened to the view, and the dataset is attached only when a view will render it. The
// client's capabilities are read per call — on the 2026-07-28 revision they travel with
// each request, not with the connection
export function uiResponder (server: McpServer, ctx: ServerContext): (render: Render) => UiPayload {
    return (render) => {
        const capabilities = requestClientCapabilities (server, currentRequestScope ()?.request);
        const status = decideUiStatus (ctx.ui.policy, uiSupport (capabilities));
        const notice = joinNotices ([ ...render.notices, uiNotice (status, render.fallbackTool, ctx.hosted) ]);
        const envelope = ok (render.summary, compactMeta ({ ...render.meta, 'ui': status, notice }));
        const structured = compactMeta ({
            'view': render.view,
            'ui': status,
            ...render.base,
            'summary': render.summary,
            notice,
            ...(attachesView (status) ? render.dataset : {}),
        });
        return { envelope, structured };
    };
}

// with views switched off the ui:// link is not advertised either: an MCP Apps host would
// otherwise open a view for a result that never carries its dataset
// openai/widgetAccessible: the view may call tools itself in ChatGPT (its Refresh button and
// timeframe switch re-call the render tool, live updates call live_update)
export function viewToolMeta (ctx: ServerContext, view: ViewName): Record<string, any> | undefined {
    return (ctx.ui.policy.mode === 'off') ? undefined : { ...uiToolMeta (ctx.ui.views[view]), 'openai/widgetAccessible': true };
}

const READ_ONLY = { 'readOnlyHint': true, 'destructiveHint': false, 'openWorldHint': true };

export function registerUiTools (server: McpServer, ctx: ServerContext): void {
    registerUiResources (server, ctx.ui.views, { 'publicCache': ctx.hosted });
    const respond = uiResponder (server, ctx);

    server.registerTool ('show_chart', {
        'title': 'Show candlestick chart',
        'description': 'Render an interactive candlestick + volume chart whenever the user asks to see, show, plot or chart a price. Returns a compact summary (range, open/close, change %, high/low, volume); get_ohlcv returns the candles.',
        'inputSchema': z.object ({
            'exchange': exchangeParam,
            'symbol': symbolParam ('unified symbol, e.g. "BTC/USDT" (search_markets)'),
            'timeframe': z.string ().min (1).max (MAX_CODE_LENGTH).optional ().describe ('candle interval, default "1h" (describe_exchange .timeframes)'),
            'since': sinceParam,
            'limit': z.number ().int ().optional ().describe ('number of candles (default ' + CHART_DEFAULT_LIMIT + ', max ' + CHART_MAX_LIMIT + ')'),
            'marketType': marketTypeParam,
            'prediction': predictionParam,
            'params': paramsParam,
        }),
        'outputSchema': CHART_OUTPUT,
        'annotations': READ_ONLY,
        '_meta': viewToolMeta (ctx, 'chart'),
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
        const timeframes = (exchange.timeframes !== null && exchange.timeframes !== undefined) ? Object.keys (exchange.timeframes).map (String) : [];
        return respond ({
            'view': 'chart',
            'fallbackTool': 'get_ohlcv',
            'summary': summarizeCandles (exchange, candles),
            'meta': { 'exchange': exchange.id, symbol, 'timeframe': frame },
            'notices': [
                (candles.length === 0) ? 'the exchange returned no candles for this symbol/timeframe/since' : undefined,
                marketTypeMismatchNotice (exchange, [ symbol ], marketType),
            ],
            'base': { 'exchange': String (exchange.id), 'exchangeName': String (exchange.name ?? exchange.id), symbol, 'timeframe': frame, 'limit': rowLimit },
            'dataset': { timeframes, 'candles': viewCandles (candles) },
        });
    }));

    server.registerTool ('show_orderbook', {
        'title': 'Show order book',
        'description': 'Render an interactive order book (depth chart + bid/ask ladder) when the user asks to see the order book, depth or liquidity. Returns a compact summary (best bid/ask, spread, depth totals); get_orderbook returns the levels.',
        'inputSchema': z.object ({
            'exchange': exchangeParam,
            'symbol': symbolParam ('unified symbol (search_markets)'),
            'limit': z.number ().int ().optional ().describe ('price levels per side (default ' + BOOK_DEFAULT_LEVELS + ', max ' + BOOK_MAX_LEVELS + ')'),
            'marketType': marketTypeParam,
            'prediction': predictionParam,
            'params': paramsParam,
        }),
        'outputSchema': ORDERBOOK_OUTPUT,
        'annotations': READ_ONLY,
        '_meta': viewToolMeta (ctx, 'orderbook'),
    }, async ({ exchange: exchangeId, symbol, limit, marketType, prediction, params }) => run ({ 'tool': 'show_orderbook', 'exchange': exchangeId }, async () => {
        const exchange = await ctx.pools.getPublic (exchangeId, marketType, prediction ?? false);
        const levels = clampLimit (limit, BOOK_DEFAULT_LEVELS, BOOK_MAX_LEVELS);
        const book = await exchange.fetchOrderBook (symbol, levels, params ?? {});
        const typed = (side: any[]) => normalizeBookSide (side, levels).map ((level) => [ numberOrNull (level[0]), numberOrNull (level[1]) ]);
        const bids = typed (book?.bids);
        const asks = typed (book?.asks);
        const bookSymbol = stringOrUndefined (book?.symbol) ?? symbol;
        const market = exchange.markets?.[symbol];
        const unit = amountUnitOf (market);
        const unitNotice = unit.inContracts
            ? 'amounts are in contracts (1 contract = ' + unit.contractSize + ' ' + ((unit.inverse ? market?.quote : market?.base) ?? (unit.inverse ? 'quote' : 'base')) + '), not in base currency — bidDepth/askDepth count contracts; use the *DepthBase / *DepthQuote totals for currency amounts'
            : undefined;
        const timestamp = finite (book?.timestamp) ? book.timestamp : undefined;
        const datetime = stringOrUndefined (book?.datetime);
        return respond ({
            'view': 'orderbook',
            'fallbackTool': 'get_orderbook',
            'summary': summarizeBook (bids, asks, unit),
            'meta': {
                'exchange': exchange.id,
                'symbol': bookSymbol,
                timestamp,
                datetime,
                'amountUnit': unit.amountUnit,
                'contractSize': unit.inContracts ? unit.contractSize : undefined,
                'inverse': (unit.inContracts && unit.inverse) ? true : undefined,
            },
            'notices': [ marketTypeMismatchNotice (exchange, [ symbol ], marketType), unitNotice ],
            'base': {
                'exchange': String (exchange.id),
                'exchangeName': String (exchange.name ?? exchange.id),
                'symbol': bookSymbol,
                'base': stringOrUndefined (market?.base),
                'quote': stringOrUndefined (market?.quote),
                // amounts of a contract market are in contracts: the view converts with these
                'contractSize': unit.contractSize,
                'inverse': unit.inverse,
                'amountUnit': unit.amountUnit,
                'limit': levels,
                timestamp,
                datetime,
            },
            'dataset': { bids, asks },
        });
    }));

    server.registerTool ('show_tickers', {
        'title': 'Show price board',
        'description': 'Render a sortable 24h price board (last, change, high/low, volume) of up to ' + TICKERS_MAX_SYMBOLS + ' symbols on one exchange, to see or compare prices. Returns a compact per-symbol summary; get_tickers returns every field.',
        'inputSchema': z.object ({
            'exchange': exchangeParam,
            'symbols': z.array (symbolParam ('unified symbol')).min (1).max (TICKERS_MAX_SYMBOLS).describe ('unified symbols, e.g. ["BTC/USDT", "ETH/USDT"] (search_markets)'),
            'marketType': marketTypeParam,
            'prediction': predictionParam,
            'params': paramsParam,
        }),
        'outputSchema': TICKERS_OUTPUT,
        'annotations': READ_ONLY,
        '_meta': viewToolMeta (ctx, 'tickers'),
    }, async ({ exchange: exchangeId, symbols, marketType, prediction, params }) => run ({ 'tool': 'show_tickers', 'exchange': exchangeId }, async () => {
        const exchange = await ctx.pools.getPublic (exchangeId, marketType, prediction ?? false);
        const fetched = await fetchTickerList (exchange, symbols, params ?? {});
        const tickers = fetched.map ((ticker) => tickerRow (ticker, String (ticker?.symbol ?? '')));
        const returned = new Set (tickers.map ((ticker) => ticker['symbol']));
        const missing = symbols.filter ((symbol) => !returned.has (symbol));
        // Markets whose amounts are in contracts (contractSize other than 1). ccxt passes a
        // contract market's 24h volume through as the venue reports it — on many venues that
        // is a contract count, not base currency — so the view must not label it as base.
        const contracts: Record<string, { contractSize: number, inverse: boolean }> = {};
        for (const ticker of tickers) {
            const unit = amountUnitOf (exchange.markets?.[ticker['symbol']]);
            if (unit.inContracts) {
                contracts[ticker['symbol']] = { 'contractSize': unit.contractSize, 'inverse': unit.inverse };
            }
        }
        const contractSymbols = Object.keys (contracts);
        const hasContracts = contractSymbols.length > 0;
        const contractNotice = hasContracts
            ? contractSymbols.join (', ') + ' trade in contracts (see meta.contracts for the contractSize) — their 24h volume may be a contract count rather than a currency amount'
            : undefined;
        const summary = tickers.map ((ticker) => compactMeta (Object.fromEntries (TICKER_SUMMARY_FIELDS.map ((field) => [ field, ticker[field] ]))));
        return respond ({
            'view': 'tickers',
            'fallbackTool': 'get_tickers',
            summary,
            'meta': {
                'exchange': exchange.id,
                'count': tickers.length,
                'missing': missing.length ? missing : undefined,
                'contracts': hasContracts ? contracts : undefined,
            },
            'notices': [ missingTickersNotice (missing), marketTypeMismatchNotice (exchange, symbols, marketType), contractNotice ],
            'base': {
                'exchange': String (exchange.id),
                'exchangeName': String (exchange.name ?? exchange.id),
                symbols,
                'missing': missing.length ? missing : undefined,
                'contracts': hasContracts ? contracts : undefined,
            },
            'dataset': { tickers },
        });
    }));

    // the views' app-only refresh tool (./live.ts), served by the shared market-data hub
    registerLiveTool (server, ctx);
}
