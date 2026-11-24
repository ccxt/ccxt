import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ServerContext } from '../types.js';
import { ok, project, TICKER_FIELDS } from '../format.js';
import { run, clampLimit, parseSince, marketTypeMismatchNotice, fetchTickerList, normalizeBookSide, badTimeframe, exchangeParam, predictionParam, paramsParam, sinceParam, ArgError } from './common.js';
import type { Envelope } from '../format.js';
import { marketTypeParam, joinNotices, missingTickersNotice } from './market.js';
import { UI_VIEWS, uiToolMeta, uiMode, uiStatus, uiNotice, uiResult, registerUiResources, type UiPayload } from '../ui.js';
import { accountEnvironment } from '../types.js';
import { redact } from '../redact.js';

// Render tools: each one pairs a public market-data fetch with a ui:// view (MCP Apps). The
// model receives a compact summary as text; the view receives the full dataset as
// structuredContent — but only on a host that renders it (CCXT_MCP_UI, see ../ui.ts): every
// other host gets the text summary alone. They sit in the market tier — public data, no
// account, read-only — and the data tools (get_ohlcv, get_orderbook, get_tickers) remain the
// way to get raw rows. The one exception is show_chart's optional `account`: it overlays that
// account's own open orders on the chart, a read-tier fetch gated exactly like get_orders (the
// account must be configured) — and for a sandbox or demo account the candles then come from
// that account's environment, so both halves of the chart are one market. The account views
// proper live in ./ui-account.ts.

const CHART_DEFAULT_LIMIT = 200;
const CHART_MAX_LIMIT = 500;
const BOOK_DEFAULT_LEVELS = 50;
const BOOK_MAX_LEVELS = 100;
const CHART_MAX_ORDERS = 50;

export function finite (value: any): value is number {
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

// keys left undefined would serialize as null — drop them so an absent fact stays absent
// (used for envelope meta and for the summary objects of the account views)
export function compactMeta (meta: Record<string, any>): Record<string, any> {
    const out: Record<string, any> = {};
    for (const [ key, value ] of Object.entries (meta)) {
        if (value !== undefined) {
            out[key] = value;
        }
    }
    return out;
}

// with views switched off the ui:// link is not advertised either: an MCP Apps host would
// otherwise open the view for a result that carries no payload for it
export function viewToolMeta (view: string): Record<string, any> | undefined {
    return (uiMode () === 'off') ? undefined : uiToolMeta (UI_VIEWS[view]);
}

export type UiRespond = (fallbackTool: string, data: any, meta: Record<string, any>, notices: (string | undefined)[], view: Record<string, any>) => Envelope | UiPayload;

// every show_* result is assembled here: meta.ui and the trailing notice always say what
// happened to the view, and the view payload is attached only when a host will render it
export function uiResponder (server: McpServer): UiRespond {
    return (fallbackTool, data, meta, notices, view) => {
        const status = uiStatus (server);
        const envelope = ok (data, compactMeta ({ ...meta, 'ui': status, 'notice': joinNotices ([ ...notices, uiNotice (status, fallbackTool) ]) }));
        return uiResult (status, envelope, view);
    };
}

// What the chart draws for one of the account's open orders: a horizontal line at its price.
// An order without a finite price (a market or trigger-only order) has no line to draw, so it
// is left out here — show_orders is the complete list.
export function chartOrders (orders: any[]): Record<string, any>[] {
    const lines: Record<string, any>[] = [];
    for (const order of orders ?? []) {
        if (order === undefined || order === null || !finite (order.price)) {
            continue;
        }
        lines.push (project (order, [ 'id', 'side', 'type', 'price', 'amount', 'filled', 'status' ]));
        if (lines.length >= CHART_MAX_ORDERS) {
            break;
        }
    }
    return lines;
}

export function registerUiTools (server: McpServer, ctx: ServerContext): void {
    registerUiResources (server);
    const toolMeta = viewToolMeta;
    const respond = uiResponder (server);

    server.registerTool ('show_chart', {
        'title': 'Show candlestick chart',
        'description': 'Render an interactive candlestick + volume chart. Use whenever the user asks to see, show, plot or chart a price. The result is a compact summary (range, open/close, change %, high/low, volume), not the candles — get_ohlcv returns the rows. "account" also draws that account\'s open orders for the symbol (meta.openOrders, meta.drawnOrders); for a sandbox/demo account the candles then come from that environment (meta.candlesEnvironment), not the live market.',
        'inputSchema': {
            'exchange': exchangeParam,
            'symbol': z.string ().describe ('unified symbol, e.g. "BTC/USDT" (search_markets)'),
            'timeframe': z.string ().optional ().describe ('candle interval, default "1h" (describe_exchange .timeframes)'),
            'since': sinceParam,
            'limit': z.number ().int ().optional ().describe ('number of candles (default ' + CHART_DEFAULT_LIMIT + ', max ' + CHART_MAX_LIMIT + ')'),
            'marketType': marketTypeParam,
            'prediction': predictionParam,
            'account': z.string ().optional ().describe ('account name on this same exchange — overlays its open orders for the symbol'),
            'params': paramsParam,
        },
        'annotations': { 'readOnlyHint': true, 'openWorldHint': true },
        '_meta': toolMeta ('chart'),
    }, async ({ exchange: exchangeId, symbol, timeframe, since, limit, marketType, prediction, account: accountName, params }) => run ({ 'tool': 'show_chart', 'exchange': exchangeId, 'account': accountName }, async () => {
        // resolved before any market data is fetched: an unknown account or one on another
        // exchange is a mistake in the call, not something to draw a chart around
        const auth = (accountName !== undefined) ? await ctx.pools.getAuthenticated (accountName) : undefined;
        if (auth !== undefined && auth.account.exchange !== exchangeId) {
            throw new ArgError ('account ' + JSON.stringify (auth.account.name) + ' is on ' + auth.account.exchange + ', not ' + exchangeId, 'pass exchange: "' + auth.account.exchange + '" to chart this account\'s orders, or omit "account"');
        }
        // an id that exists in both namespaces is two different venues' worth of markets: the
        // account's orders belong on the chart of the one it trades on (compared by class, so
        // a prediction-only id needs no flag on either side)
        if (auth !== undefined && ctx.pools.getBare (exchangeId, prediction ?? false).constructor !== auth.exchange.constructor) {
            const accountSide = auth.account.prediction ? 'prediction' : 'non-prediction';
            throw new ArgError ('account ' + JSON.stringify (auth.account.name) + ' is a ' + accountSide + ' account on ' + exchangeId + ', but the chart was requested with prediction: ' + (prediction ?? false), 'pass prediction: ' + (auth.account.prediction ? 'true' : 'false') + ' to chart this account\'s orders, or omit "account"');
        }
        // Candles and order lines must describe the same market. A sandbox or demo account
        // trades in its own environment, whose prices are not the live market's (a testnet
        // routinely sits thousands away), while the public pool only holds live instances —
        // so for such an account the candles are read through the account's own instance:
        // fetchOHLCV is a public call there too, and it resolves the symbol exactly as the
        // order fetch below does. A live account keeps the shared public instance.
        const environment = (auth !== undefined) ? accountEnvironment (auth.account) : 'live';
        const publicExchange = () => ctx.pools.getPublic (exchangeId, marketType, prediction ?? false);
        let exchange = (auth !== undefined && environment !== 'live') ? auth.exchange : await publicExchange ();
        let candlesEnvironment = environment;
        const frame = timeframe ?? '1h';
        const timeframeError = badTimeframe (exchange, frame);
        if (timeframeError !== undefined) {
            return timeframeError;
        }
        const rowLimit = clampLimit (limit, CHART_DEFAULT_LIMIT, CHART_MAX_LIMIT);
        const sinceMs = parseSince (exchange, since);
        let rows: any[];
        let environmentNotice: string | undefined = undefined;
        try {
            rows = await exchange.fetchOHLCV (symbol, frame, sinceMs, rowLimit, params ?? {});
        } catch (e: any) {
            if (auth === undefined || environment === 'live') {
                throw e;
            }
            // not every practice environment serves candles (or lists the symbol). The live
            // chart is still worth showing, but then the two halves are NOT the same market,
            // and the model and the user are both told so; if live fails too, that is the error
            exchange = await publicExchange ();
            rows = await exchange.fetchOHLCV (symbol, frame, sinceMs, rowLimit, params ?? {});
            candlesEnvironment = 'live';
            environmentNotice = 'the candles are LIVE market data (the ' + environment + ' environment of ' + exchange.id + ' could not serve them: ' + redact (String (e?.message ?? e)).slice (0, 200) + ') while the order lines are from the ' + environment + ' account ' + JSON.stringify (auth.account.name) + ' — ' + environment + ' prices differ from the live market, so the lines are not comparable to these candles';
        }
        if (auth !== undefined && environment !== 'live' && environmentNotice === undefined) {
            environmentNotice = 'candles and order lines are both from the ' + environment + ' environment of ' + exchange.id + ' (account ' + JSON.stringify (auth.account.name) + '), not the live market — its prices can differ from live ones';
        }
        // some exchanges ignore the API-level limit — keep rowLimit candles: the first ones
        // from `since` when a start was requested (what get_ohlcv returns for the same
        // arguments), otherwise the most recent
        const cleaned = cleanCandles (rows);
        const candles = (sinceMs !== undefined) ? cleaned.slice (0, rowLimit) : cleaned.slice (-rowLimit);
        const timeframes = (exchange.timeframes !== null && exchange.timeframes !== undefined) ? Object.keys (exchange.timeframes) : [];
        const notices = [
            (candles.length === 0) ? 'the exchange returned no candles for this symbol/timeframe/since' : undefined,
            marketTypeMismatchNotice (exchange, [ symbol ], marketType),
            environmentNotice,
        ];
        // The overlay is decoration on the chart: the candles above never depend on the order
        // fetch, and a venue that cannot list open orders (or fails to) costs the user the
        // lines, not the chart.
        const overlay: Record<string, any> = {};
        const overlayMeta: Record<string, any> = {};
        if (auth !== undefined) {
            overlay['account'] = auth.account.name;
            overlay['environment'] = environment;
            // where the candles came from, next to where the orders did: the view names a
            // difference in its legend
            overlay['candlesEnvironment'] = candlesEnvironment;
            overlay['orders'] = [];
            overlayMeta['account'] = auth.account.name;
            overlayMeta['environment'] = environment;
            overlayMeta['candlesEnvironment'] = candlesEnvironment;
            if (!auth.exchange.has?.['fetchOpenOrders']) {
                notices.push ('open orders are not drawn: ' + auth.exchange.id + ' has no fetchOpenOrders');
            } else {
                try {
                    const openOrders = await auth.exchange.fetchOpenOrders (symbol, undefined, undefined, {});
                    const count = Array.isArray (openOrders) ? openOrders.length : 0;
                    overlay['orders'] = chartOrders (openOrders);
                    // two counts, so neither is mistaken for the other: what the account has
                    // open on the symbol, and how many of those have a line on the chart
                    overlayMeta['openOrders'] = count;
                    overlayMeta['drawnOrders'] = overlay['orders'].length;
                    const unpriced = count - overlay['orders'].length;
                    if (unpriced > 0) {
                        notices.push (unpriced + ' open order(s) are not drawn (no limit price, or more than ' + CHART_MAX_ORDERS + ') — get_orders lists them all');
                    }
                } catch (e: any) {
                    notices.push ('open orders are not drawn: fetching them failed (' + redact (String (e?.message ?? e)).slice (0, 200) + ')');
                }
            }
        }
        return respond ('get_ohlcv', summarizeCandles (exchange, candles), {
            'exchange': exchange.id,
            symbol,
            'timeframe': frame,
            ...overlayMeta,
        }, notices, {
            'view': 'chart',
            'exchange': exchange.id,
            'exchangeName': exchange.name ?? exchange.id,
            symbol,
            'timeframe': frame,
            timeframes,
            'limit': rowLimit,
            candles,
            ...overlay,
        });
    }));

    server.registerTool ('show_orderbook', {
        'title': 'Show order book',
        'description': 'Render an interactive order book (cumulative depth chart + bid/ask ladder) for one symbol. Use when the user asks to see the order book, depth or liquidity. The result is a compact summary (best bid/ask, spread, depth totals) — get_orderbook returns the levels.',
        'inputSchema': {
            'exchange': exchangeParam,
            'symbol': z.string ().describe ('unified symbol (search_markets)'),
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
        'description': 'Render a sortable 24h price board (last, change, high/low, volume) for up to 50 symbols on one exchange. Use when the user asks to see or compare prices of several markets. The result is a compact per-symbol summary — get_tickers returns every field.',
        'inputSchema': {
            'exchange': exchangeParam,
            'symbols': z.array (z.string ()).min (1).max (50).describe ('unified symbols, e.g. ["BTC/USDT", "ETH/USDT"] (search_markets)'),
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
