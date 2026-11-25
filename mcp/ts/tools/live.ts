import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/server';
import type { ServerContext } from '../types.js';
import { ok } from '../format.js';
import { ToolError } from '../errors.js';
import { redact } from '../redact.js';
import { redactDeep } from '../ui.js';
import { run, badTimeframe, hasOwn, ArgError, exchangeParam, symbolParam, marketTypeParam, MAX_CODE_LENGTH, type ToolResult } from './common.js';
import type { LiveServed, LiveView } from '../live/hub.js';

// live_update: the app-only refresh tool of the three views. A view on screen calls it every
// nextPollMs through the host's proxied tools/call (MCP Apps app.callServerTool, or
// window.openai.callTool in ChatGPT); it is answered by the shared market-data hub
// (../live/hub.ts) from one ccxt.pro stream per market, or from REST when no stream can serve.
//
// It is hidden from the model where the host supports that (_meta.ui.visibility ["app"]; ChatGPT:
// openai/visibility "private") and stays callable from a view (openai/widgetAccessible). It is
// listed for every caller like any tool — the tool list never varies per caller — so its name,
// description and schema are kept constant (a change makes Claude ask for approval again).
// The result's text is one short line; the data is in structuredContent.

export const LIVE_TOOL = 'live_update';
export const LIVE_VIEWS = [ 'chart', 'orderbook', 'tickers' ] as const;
export const LIVE_MAX_SYMBOLS = 20;
export const LIVE_MAX_DEPTH = 100;
export const LIVE_DEFAULT_DEPTH = 50;
export const LIVE_DEFAULT_TIMEFRAME = '1h';

// the tools whose views call live_update; they carry openai/widgetAccessible too (./ui.ts)
export const LIVE_VIEW_TOOLS: readonly string[] = [ 'show_chart', 'show_orderbook', 'show_tickers' ];

// hidden from the model (MCP Apps; ChatGPT's own key), callable from a view (ChatGPT). No
// ui.resourceUri / openai/outputTemplate: a data tool with a template re-renders the iframe
export function liveToolMeta (): Record<string, any> {
    return {
        'ui': { 'visibility': [ 'app' ] },
        'openai/visibility': 'private',
        'openai/widgetAccessible': true,
    };
}

const level = z.array (z.number ());
const nullableNumber = z.number ().nullable ();

export const LIVE_INPUT = z.object ({
    'view': z.enum (LIVE_VIEWS),
    'exchange': exchangeParam,
    'symbol': symbolParam ('chart, orderbook').optional (),
    'symbols': z.array (symbolParam ('symbol')).min (1).max (LIVE_MAX_SYMBOLS).optional ().describe ('tickers'),
    'timeframe': z.string ().min (1).max (MAX_CODE_LENGTH).optional ().describe ('chart, default "' + LIVE_DEFAULT_TIMEFRAME + '"'),
    'since': z.number ().int ().min (0).optional ().describe ('chart: ms timestamp of the last candle the view holds'),
    'depth': z.number ().int ().min (1).max (LIVE_MAX_DEPTH).optional ().describe ('orderbook levels per side, default ' + LIVE_DEFAULT_DEPTH),
    'marketType': marketTypeParam,
});

export const LIVE_OUTPUT = z.object ({
    'ok': z.literal (true),
    'view': z.enum (LIVE_VIEWS),
    'exchange': z.string (),
    'source': z.enum ([ 'stream', 'cache', 'rest' ]),
    'asOf': z.number (),
    'nextPollMs': z.number ().int ().min (1000).max (30000),
    'chart': z.object ({ 'symbol': z.string (), 'timeframe': z.string (), 'candles': z.array (level) }).optional (),
    'orderbook': z.object ({ 'symbol': z.string (), 'bids': z.array (level), 'asks': z.array (level), 'timestamp': nullableNumber }).optional (),
    'tickers': z.record (z.string (), z.object ({
        'last': nullableNumber,
        'bid': nullableNumber,
        'ask': nullableNumber,
        'percentage': nullableNumber,
        'baseVolume': nullableNumber,
        'quoteVolume': nullableNumber,
        'timestamp': nullableNumber,
    })).optional (),
});

// names only the views, which every profile that lists this tool lists too (./profile.ts)
const DESCRIPTION = 'App-only: the show_chart, show_orderbook and show_tickers views call this to refresh themselves. Not meant to be called by the model.';

function finite (value: any): value is number {
    return typeof value === 'number' && Number.isFinite (value);
}

function numberOrNull (value: any): number | null {
    return finite (value) ? value : null;
}

// a level is drawn only when both numbers are real
function levels (side: any[]): number[][] {
    const out: number[][] = [];
    for (const entry of side ?? []) {
        if (Array.isArray (entry) && finite (entry[0]) && finite (entry[1])) {
            out.push ([ entry[0], entry[1] ]);
        }
    }
    return out;
}

const PRICE_DIGITS = 10;
const VOLUME_DIGITS = 8;

function round (value: number, digits: number): number {
    return Number (value.toPrecision (digits));
}

function requireSymbol (exchange: any, symbol: string | undefined, view: LiveView): string {
    if (symbol === undefined) {
        throw new ArgError ('the ' + view + ' view needs "symbol"');
    }
    if (!hasOwn (exchange.markets, symbol)) {
        throw new ToolError ('BAD_SYMBOL', String (exchange.id) + ' does not have market symbol ' + JSON.stringify (symbol.slice (0, 64)), { 'hint': 'resolve symbols with search_markets' });
    }
    return symbol;
}

function oneLine (view: LiveView, exchangeId: string, served: LiveServed): string {
    let detail = '';
    if (view === 'chart') {
        detail = (served.candles?.length ?? 0) + ' candles';
    } else if (view === 'orderbook') {
        detail = (served.book?.bids.length ?? 0) + '/' + (served.book?.asks.length ?? 0) + ' levels';
    } else {
        detail = Object.keys (served.tickers ?? {}).length + ' tickers';
    }
    return LIVE_TOOL + ' ' + view + ' ' + exchangeId + ': ' + detail + ' from ' + served.source + ', next in ' + served.nextPollMs + ' ms';
}

export function shapeLive (view: LiveView, exchangeId: string, served: LiveServed, request: { symbol?: string, timeframe?: string }): Record<string, any> {
    const out: Record<string, any> = {
        'ok': true,
        view,
        'exchange': exchangeId,
        'source': served.source,
        'asOf': Math.round (served.asOf),
        'nextPollMs': Math.round (served.nextPollMs),
    };
    if (view === 'chart') {
        out['chart'] = {
            'symbol': request.symbol,
            'timeframe': request.timeframe,
            'candles': (served.candles ?? []).map ((c) => [ c[0], round (c[1], PRICE_DIGITS), round (c[2], PRICE_DIGITS), round (c[3], PRICE_DIGITS), round (c[4], PRICE_DIGITS), round (c[5], VOLUME_DIGITS) ]),
        };
    } else if (view === 'orderbook') {
        const book = served.book;
        out['orderbook'] = {
            'symbol': request.symbol,
            'bids': levels (book?.bids ?? []),
            'asks': levels (book?.asks ?? []),
            'timestamp': numberOrNull (book?.timestamp),
        };
    } else {
        const tickers: Record<string, any> = {};
        for (const [ symbol, ticker ] of Object.entries (served.tickers ?? {})) {
            tickers[symbol] = {
                'last': numberOrNull (ticker?.last),
                'bid': numberOrNull (ticker?.bid),
                'ask': numberOrNull (ticker?.ask),
                'percentage': numberOrNull (ticker?.percentage),
                'baseVolume': numberOrNull (ticker?.baseVolume),
                'quoteVolume': numberOrNull (ticker?.quoteVolume),
                'timestamp': numberOrNull (ticker?.timestamp),
            };
        }
        out['tickers'] = tickers;
    }
    return out;
}

export function registerLiveTool (server: McpServer, ctx: ServerContext): void {
    server.registerTool (LIVE_TOOL, {
        'title': 'Live update',
        'description': DESCRIPTION,
        'inputSchema': LIVE_INPUT,
        'outputSchema': LIVE_OUTPUT,
        'annotations': { 'readOnlyHint': true, 'destructiveHint': false, 'openWorldHint': true, 'idempotentHint': true },
        '_meta': liveToolMeta (),
    }, async (args) => {
        let result: ToolResult | undefined;
        const failure = await run ({ 'tool': LIVE_TOOL, 'exchange': args.exchange }, async () => {
            const exchange = await ctx.pools.getPublic (args.exchange, args.marketType, false);
            const exchangeId = String (exchange.id);
            const view = args.view as LiveView;
            const request: any = { view, exchangeId, 'marketType': args.marketType };
            if (view === 'chart') {
                request.symbol = requireSymbol (exchange, args.symbol, view);
                request.timeframe = args.timeframe ?? LIVE_DEFAULT_TIMEFRAME;
                const bad = badTimeframe (exchange, request.timeframe);
                if (bad !== undefined) {
                    throw new ToolError ('BAD_TIMEFRAME', String (bad.error?.message), { 'hint': String (bad.error?.hint ?? '') });
                }
                request.since = args.since;
            } else if (view === 'orderbook') {
                request.symbol = requireSymbol (exchange, args.symbol, view);
                request.depth = args.depth ?? LIVE_DEFAULT_DEPTH;
            } else {
                if (args.symbols === undefined) {
                    throw new ArgError ('the tickers view needs "symbols"');
                }
                // a board keeps updating the symbols the exchange has; only an all-unknown
                // list is an error
                const known = [ ...new Set (args.symbols) ].filter ((symbol) => hasOwn (exchange.markets, symbol));
                if (known.length === 0) {
                    requireSymbol (exchange, args.symbols[0], view);
                }
                request.symbols = known;
            }
            const served: LiveServed = await ctx.live.serve (request, exchange);
            const structured = shapeLive (view, exchangeId, served, request);
            result = {
                'content': [ { 'type': 'text', 'text': redact (oneLine (view, exchangeId, served)) } ],
                'structuredContent': redactDeep (structured),
            };
            return ok (null);
        });
        return result ?? failure;
    });
}
