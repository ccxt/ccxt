import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ServerContext } from '../types.js';
import { accountSummary } from '../types.js';
import { ok, project, stripInfo, TICKER_FIELDS, MARKET_FIELDS, TRADE_FIELDS, EVENT_FIELDS } from '../format.js';
import { run, clampLimit, parseSince, marketTypeMismatchNotice, exchangeParam, predictionParam, paramsParam, sinceParam } from './common.js';
import { methodSignature, methodDocs, featuresSlice, unifiedMethods, implicitVerb, isImplicitMethod, listImplicitMethods } from '../introspect.js';
import { requireTier } from '../safety.js';

const marketTypeParam = z.string ().optional ().describe ('market type routing for exchanges with several (e.g. "spot", "swap", "future", "option") — sets options.defaultType on a dedicated instance');

const READ_METHOD_PATTERN = /^(fetch|load)[A-Z]/;
// pattern, not an allowlist: ccxt grows address-returning methods over time
// (fetchDepositAddress*, fetchNetworkDepositAddress, fetchWithdrawAddresses*,
// fetchWithdrawalWhitelist, …) and an enumeration would silently fall behind
const ADDRESS_METHOD_PATTERN = /deposit.?address|withdraw.?address|withdrawal.?whitelist/i;

export function registerMarketTools (server: McpServer, ctx: ServerContext): void {
    server.registerTool ('list_exchanges', {
        'title': 'List supported exchanges',
        'description': 'List every exchange this server supports (built from ccxt.exchanges at runtime), with name, websocket and prediction-market availability. Filter by a name query or by support for a unified method.',
        'inputSchema': {
            'query': z.string ().optional ().describe ('case-insensitive substring match on the exchange id or name'),
            'supports': z.string ().optional ().describe ('keep only exchanges supporting this unified method, e.g. "fetchOHLCV"'),
            'prediction': z.boolean ().optional ().describe ('true: only prediction-market exchanges; false: exclude them'),
        },
        'annotations': { 'readOnlyHint': true, 'idempotentHint': true, 'openWorldHint': false },
    }, async ({ query, supports, prediction }) => run ({ 'tool': 'list_exchanges' }, async () => {
        const predictionIds = new Set (ctx.ccxt.prediction !== undefined ? ctx.ccxt.prediction.exchanges : []);
        const wsIds = new Set (ctx.ccxt.pro !== undefined ? ctx.ccxt.pro.exchanges : []);
        const ids: string[] = (ctx.ccxt.exchanges as string[]).concat ([ ...predictionIds ].filter ((id) => !(ctx.ccxt.exchanges as string[]).includes (id as string)) as string[]).sort ();
        const rows = [];
        for (const id of ids) {
            const isPrediction = predictionIds.has (id);
            if (prediction !== undefined && prediction !== isPrediction) {
                continue;
            }
            const exchange = ctx.pools.getBare (id, isPrediction && ctx.ccxt.exchanges.includes (id) === false);
            if (query !== undefined) {
                const haystack = (id + ' ' + String (exchange.name ?? '')).toLowerCase ();
                if (!haystack.includes (query.toLowerCase ())) {
                    continue;
                }
            }
            if (supports !== undefined && !exchange.has?.[supports]) {
                continue;
            }
            rows.push ({
                id,
                'name': exchange.name,
                'certified': exchange.certified === true,
                'ws': wsIds.has (id),
                'prediction': isPrediction,
            });
        }
        return ok (rows, { 'count': rows.length });
    }));

    server.registerTool ('describe_exchange', {
        'title': "Describe an exchange's capabilities",
        'description': "One exchange's supported unified methods, market types, timeframes, required credential fields, sandbox availability and documentation URLs. Per-method detail lives in describe_method.",
        'inputSchema': {
            'exchange': exchangeParam,
            'prediction': predictionParam,
        },
        'annotations': { 'readOnlyHint': true, 'idempotentHint': true, 'openWorldHint': false },
    }, async ({ exchange: exchangeId, prediction }) => run ({ 'tool': 'describe_exchange', 'exchange': exchangeId }, async () => {
        const exchange = ctx.pools.getBare (exchangeId, prediction ?? false);
        const urls = exchange.urls ?? {};
        const requiredCredentials = Object.entries (exchange.requiredCredentials ?? {}).filter (([ , required ]) => required).map (([ name ]) => name);
        const data = {
            'id': exchange.id,
            'name': exchange.name,
            'certified': exchange.certified === true,
            'prediction': (ctx.ccxt.prediction !== undefined) && ctx.ccxt.prediction.exchanges.includes (exchangeId),
            'urls': { 'www': urls.www, 'doc': urls.doc },
            'ccxtDocs': 'https://docs.ccxt.com/',
            'rateLimit': exchange.rateLimit,
            'sandboxSupported': urls.test !== undefined,
            'marketTypes': (exchange.features !== null && exchange.features !== undefined) ? Object.keys (exchange.features) : undefined,
            'timeframes': (exchange.timeframes !== null && exchange.timeframes !== undefined) ? Object.keys (exchange.timeframes) : undefined,
            requiredCredentials,
            'methods': unifiedMethods (exchange),
        };
        return ok (data);
    }));

    server.registerTool ('describe_method', {
        'title': 'Search or describe unified ccxt methods',
        'description': 'Search unified method names by keyword, or get one method\'s signature and parameter documentation. With "exchange" it adds that exchange\'s own docs (including supported params.* keys and links to the exchange API reference), per-market-type feature support, and searches its implicit (exchange-specific) endpoints too. Full ccxt manual: https://docs.ccxt.com/',
        'inputSchema': {
            'method': z.string ().optional ().describe ('exact method name to describe, e.g. "fetchOHLCV" (or an implicit endpoint name when "exchange" is set)'),
            'query': z.string ().optional ().describe ('keyword search over method names, e.g. "funding"'),
            'exchange': z.string ().optional ().describe ('exchange id for per-exchange docs, feature support and implicit endpoints'),
            'prediction': predictionParam,
        },
        'annotations': { 'readOnlyHint': true, 'idempotentHint': true, 'openWorldHint': false },
    }, async ({ method, query, exchange: exchangeId, prediction }) => run ({ 'tool': 'describe_method', 'exchange': exchangeId }, async () => {
        if (method === undefined && query === undefined) {
            return { 'ok': false, 'error': { 'code': 'BAD_REQUEST', 'message': 'pass either "method" (exact) or "query" (search)', 'retryable': false, 'hint': 'e.g. {"query": "funding"} or {"method": "fetchFundingRate"}' } };
        }
        // with no exchange, search against binance — it implements essentially the whole
        // unified API, so the discovery index isn't blind to the long tail (an arbitrary
        // exchange like ccxt.exchanges[0] lacks funding/openInterest/ledger/…)
        const referenceId = exchangeId ?? (ctx.ccxt.exchanges.includes ('binance') ? 'binance' : ctx.ccxt.exchanges[0]);
        const exchange = ctx.pools.getBare (referenceId, prediction ?? false);
        if (query !== undefined) {
            // match on whitespace-split tokens so "open interest" / "funding rate" hit the
            // camelCase names (a single substring never would)
            const tokens = query.toLowerCase ().split (/\s+/).filter (Boolean);
            const nameMatches = (name: string) => {
                const lower = name.toLowerCase ();
                return tokens.every ((token) => lower.includes (token));
            };
            const unified = unifiedMethods (exchange).filter (nameMatches).slice (0, 25).map ((name) => ({
                name,
                'kind': 'unified',
                'description': methodDocs (exchangeId, name)?.description,
            }));
            const implicit = (exchangeId !== undefined)
                ? listImplicitMethods (exchange).filter (nameMatches).slice (0, 25).map ((name) => ({ name, 'kind': 'implicit', 'verb': implicitVerb (name) }))
                : [];
            return ok ({ unified, implicit }, {
                'searchedExchange': referenceId,
                'notice': (unified.length === 25 || implicit.length === 25) ? 'results capped at 25 per kind — refine the query' : undefined,
            });
        }
        const methodName = method as string;
        if (isImplicitMethod (exchange, methodName)) {
            return ok ({
                'method': methodName,
                'kind': 'implicit',
                'verb': implicitVerb (methodName),
                'callableVia': (implicitVerb (methodName) === 'Get') ? 'call_implicit_get' : 'call_implicit_write (requires implicitWrites on the account)',
                'notice': 'implicit endpoints take a single flat params object and return the raw exchange payload — consult the exchange API reference',
                'docsUrl': exchange.urls?.doc,
            });
        }
        if (typeof exchange[methodName] !== 'function') {
            return { 'ok': false, 'error': { 'code': 'UNKNOWN_METHOD', 'message': methodName + ' is not a known method', 'retryable': false, 'hint': 'search with {"query": "..."} to find the right name' } };
        }
        const signature = methodSignature (exchange, methodName);
        const docs = methodDocs (exchangeId, methodName);
        const data: Record<string, any> = {
            'method': methodName,
            'usage': signature.usage,
            'args': signature.args,
            'description': docs?.description,
            'paramsKeys': docs?.params?.filter ((param) => param.name.startsWith ('params.')),
            'returns': docs?.returns,
            'see': docs?.see,
        };
        if (exchangeId !== undefined) {
            data['supported'] = exchange.has?.[methodName] ?? false;
            data['features'] = featuresSlice (exchange, methodName);
            data['docsUrl'] = exchange.urls?.doc;
        }
        return ok (data);
    }));

    server.registerTool ('search_markets', {
        'title': 'Search markets on an exchange',
        'description': 'Search and filter the markets of one exchange (by text, base, quote, settle currency, market type), paginated. Use this to resolve unified symbols — there is deliberately no list-all-markets tool. On prediction exchanges use search_events instead.',
        'inputSchema': {
            'exchange': exchangeParam,
            'query': z.string ().optional ().describe ('case-insensitive substring match on the symbol or market id'),
            'type': z.string ().optional ().describe ('market type filter: "spot", "swap", "future", "option", …'),
            'base': z.string ().optional ().describe ('base currency filter, e.g. "BTC"'),
            'quote': z.string ().optional ().describe ('quote currency filter, e.g. "USDT"'),
            'settle': z.string ().optional ().describe ('settle currency filter (derivatives)'),
            'activeOnly': z.boolean ().optional ().describe ('only active markets (default true)'),
            'limit': z.number ().int ().optional ().describe ('max results (default 50, max 200)'),
            'offset': z.number ().int ().optional ().describe ('pagination offset'),
            'reload': z.boolean ().optional ().describe ('force-refresh the markets cache'),
            'prediction': predictionParam,
        },
        'annotations': { 'readOnlyHint': true, 'openWorldHint': true },
    }, async (args) => run ({ 'tool': 'search_markets', 'exchange': args.exchange }, async () => {
        const exchange = await ctx.pools.getPublic (args.exchange, undefined, args.prediction ?? false);
        if (args.reload === true) {
            await exchange.loadMarkets (true);
        }
        const limit = clampLimit (args.limit, 50, 200);
        const offset = Math.max (0, args.offset ?? 0);
        const activeOnly = args.activeOnly !== false;
        const query = args.query?.toLowerCase ();
        const matches = [];
        for (const market of Object.values (exchange.markets ?? {}) as any[]) {
            if (market === undefined || market === null) {
                continue;
            }
            if (activeOnly && market.active === false) {
                continue;
            }
            if (args.type !== undefined && market.type !== args.type) {
                continue;
            }
            if (args.base !== undefined && market.base !== args.base.toUpperCase ()) {
                continue;
            }
            if (args.quote !== undefined && market.quote !== args.quote.toUpperCase ()) {
                continue;
            }
            if (args.settle !== undefined && market.settle !== args.settle.toUpperCase ()) {
                continue;
            }
            if (query !== undefined && !(market.symbol + ' ' + market.id).toLowerCase ().includes (query)) {
                continue;
            }
            matches.push (market);
        }
        const page = matches.slice (offset, offset + limit).map ((market) => project (market, MARKET_FIELDS));
        let notice: string | undefined;
        if (matches.length === 0 && exchange.has?.['fetchEvents']) {
            notice = exchange.id + ' is a prediction-market exchange with no unified spot/derivatives markets here — use search_events to find events and outcome handles';
        } else if (matches.length > offset + page.length) {
            notice = 'more matches available — increase offset or narrow the filters';
        }
        return ok (page, {
            'exchange': exchange.id,
            'returned': page.length,
            'available': matches.length,
            'offset': offset,
            notice,
        });
    }));

    server.registerTool ('get_tickers', {
        'title': 'Get price tickers',
        'description': '24h price tickers for one or more unified symbols on an exchange (outcome handles on prediction exchanges).',
        'inputSchema': {
            'exchange': exchangeParam,
            'symbols': z.array (z.string ()).min (1).max (50).describe ('unified symbols, e.g. ["BTC/USDT"] — resolve with search_markets'),
            'includeInfo': z.boolean ().optional ().describe ('include the raw exchange payload (single symbol only)'),
            'marketType': marketTypeParam,
            'prediction': predictionParam,
            'params': paramsParam,
        },
        'annotations': { 'readOnlyHint': true, 'openWorldHint': true },
    }, async ({ exchange: exchangeId, symbols, includeInfo, marketType, prediction, params }) => run ({ 'tool': 'get_tickers', 'exchange': exchangeId }, async () => {
        const exchange = await ctx.pools.getPublic (exchangeId, marketType, prediction ?? false);
        let tickers: any[];
        if (exchange.has['fetchTickers'] && symbols.length > 1) {
            const result = await exchange.fetchTickers (symbols, params ?? {});
            // backfill symbol so callers can match rows to the handles they requested
            // (some prediction/outcome tickers omit it) and preserve request order
            tickers = symbols.map ((symbol: string) => {
                const ticker = result[symbol];
                if (ticker !== undefined && ticker.symbol === undefined) {
                    ticker.symbol = symbol;
                }
                return ticker;
            }).filter ((ticker: any) => ticker !== undefined);
        } else {
            tickers = [];
            for (const symbol of symbols) {
                const ticker = await exchange.fetchTicker (symbol, params ?? {});
                if (ticker !== undefined && ticker.symbol === undefined) {
                    ticker.symbol = symbol;
                }
                tickers.push (ticker);
            }
        }
        const keepInfo = includeInfo === true && symbols.length === 1;
        const data = keepInfo ? tickers : tickers.map ((ticker) => project (ticker, TICKER_FIELDS));
        const notices: string[] = [];
        const typeNotice = marketTypeMismatchNotice (exchange, symbols, marketType);
        if (typeNotice !== undefined) {
            notices.push (typeNotice);
        }
        if (includeInfo === true && symbols.length > 1) {
            notices.push ('includeInfo applies to single-symbol calls only — raw info was omitted; request one symbol at a time to include it');
        }
        return ok (data, { 'exchange': exchange.id, 'count': data.length, 'notice': notices.length ? notices.join (' ') : undefined });
    }));

    server.registerTool ('get_orderbook', {
        'title': 'Get order book',
        'description': 'Current order book (bids and asks) for one unified symbol.',
        'inputSchema': {
            'exchange': exchangeParam,
            'symbol': z.string ().describe ('unified symbol — resolve with search_markets'),
            'depth': z.number ().int ().optional ().describe ('price levels per side (default 20, max 100)'),
            'marketType': marketTypeParam,
            'prediction': predictionParam,
            'params': paramsParam,
        },
        'annotations': { 'readOnlyHint': true, 'openWorldHint': true },
    }, async ({ exchange: exchangeId, symbol, depth, marketType, prediction, params }) => run ({ 'tool': 'get_orderbook', 'exchange': exchangeId }, async () => {
        const exchange = await ctx.pools.getPublic (exchangeId, marketType, prediction ?? false);
        const levels = clampLimit (depth, 20, 100);
        const book = await exchange.fetchOrderBook (symbol, levels, params ?? {});
        // some exchanges ignore the API-level limit — slice server-side; and normalize each
        // level to the unified [price, amount] (some venues, e.g. kraken, append a per-level
        // timestamp as a third element that an agent could misread as an order count)
        const normalize = (side: any[]) => (side ?? []).slice (0, levels).map ((level: any[]) => [ level[0], level[1] ]);
        const data = {
            'symbol': book.symbol ?? symbol,
            'timestamp': book.timestamp,
            'datetime': book.datetime,
            'nonce': book.nonce,
            'bids': normalize (book.bids),
            'asks': normalize (book.asks),
        };
        return ok (data, { 'exchange': exchange.id, 'depth': levels, 'notice': marketTypeMismatchNotice (exchange, [ symbol ], marketType) });
    }));

    server.registerTool ('get_ohlcv', {
        'title': 'Get OHLCV candles',
        'description': 'Historical OHLCV candlestick data for a symbol and timeframe. Rows are [timestampMs, open, high, low, close, volume]. Page back with "since"; "params.until" bounds the end.',
        'inputSchema': {
            'exchange': exchangeParam,
            'symbol': z.string ().describe ('unified symbol'),
            'timeframe': z.string ().optional ().describe ('candle interval (default "1h") — valid values come from describe_exchange .timeframes'),
            'since': sinceParam,
            'limit': z.number ().int ().optional ().describe ('number of candles (default 100, max 500)'),
            'marketType': marketTypeParam,
            'prediction': predictionParam,
            'params': paramsParam,
        },
        'annotations': { 'readOnlyHint': true, 'openWorldHint': true },
    }, async ({ exchange: exchangeId, symbol, timeframe, since, limit, marketType, prediction, params }) => run ({ 'tool': 'get_ohlcv', 'exchange': exchangeId }, async () => {
        const exchange = await ctx.pools.getPublic (exchangeId, marketType, prediction ?? false);
        const frame = timeframe ?? '1h';
        const timeframes = exchange.timeframes;
        if (timeframes !== null && timeframes !== undefined && timeframes[frame] === undefined) {
            return { 'ok': false, 'error': { 'code': 'BAD_TIMEFRAME', 'message': frame + ' is not a supported timeframe on ' + exchange.id, 'retryable': false, 'hint': 'supported: ' + Object.keys (timeframes).join (', ') } };
        }
        const rowLimit = clampLimit (limit, 100, 500);
        const rows = await exchange.fetchOHLCV (symbol, frame, parseSince (exchange, since), rowLimit, params ?? {});
        const hasMore = rows.length >= rowLimit;
        const typeNotice = marketTypeMismatchNotice (exchange, [ symbol ], marketType);
        const pageNotice = hasMore ? 'count hit the limit — page with since/params.until for more' : undefined;
        return ok (rows, {
            'exchange': exchange.id,
            symbol,
            'timeframe': frame,
            'columns': [ 'timestamp', 'open', 'high', 'low', 'close', 'volume' ],
            'count': rows.length,
            hasMore,
            'notice': [ typeNotice, pageNotice ].filter (Boolean).join (' ') || undefined,
        });
    }));

    server.registerTool ('get_trades', {
        'title': 'Get recent public trades',
        'description': 'Recent public trades for one unified symbol.',
        'inputSchema': {
            'exchange': exchangeParam,
            'symbol': z.string ().describe ('unified symbol'),
            'since': sinceParam,
            'limit': z.number ().int ().optional ().describe ('number of trades (default 50, max 200)'),
            'marketType': marketTypeParam,
            'prediction': predictionParam,
            'params': paramsParam,
        },
        'annotations': { 'readOnlyHint': true, 'openWorldHint': true },
    }, async ({ exchange: exchangeId, symbol, since, limit, marketType, prediction, params }) => run ({ 'tool': 'get_trades', 'exchange': exchangeId }, async () => {
        const exchange = await ctx.pools.getPublic (exchangeId, marketType, prediction ?? false);
        const tradeLimit = clampLimit (limit, 50, 200);
        const trades = await exchange.fetchTrades (symbol, parseSince (exchange, since), tradeLimit, params ?? {});
        return ok (trades.map ((trade: any) => project (trade, TRADE_FIELDS)), {
            'exchange': exchange.id,
            symbol,
            'count': trades.length,
            'hasMore': trades.length >= tradeLimit,
            'notice': marketTypeMismatchNotice (exchange, [ symbol ], marketType),
        });
    }));

    server.registerTool ('search_events', {
        'title': 'Search prediction-market events',
        'description': 'Search events on a prediction-market exchange (polymarket, kalshi, limitless, myriad, hyperliquid with prediction=true). A scoping filter is required: query, tags, or params.eventId/params.slug. Returns events with their markets and outcome handles — outcome handles are what you pass as the symbol to get_tickers/get_orderbook/create_order on prediction exchanges.',
        'inputSchema': {
            'exchange': exchangeParam,
            'query': z.string ().optional ().describe ('keyword search (required unless tags or params.eventId/params.slug are given)'),
            'tags': z.array (z.string ()).optional ().describe ('filter by tags/categories'),
            'status': z.string ().optional ().describe ('"active" (default), "closed" or "all"'),
            'sort': z.string ().optional ().describe ('"volume", "liquidity" or "newest"'),
            'limit': z.number ().int ().optional ().describe ('max events (default 25, max 100)'),
            'offset': z.number ().int ().optional ().describe ('pagination offset'),
            'params': paramsParam,
        },
        'annotations': { 'readOnlyHint': true, 'openWorldHint': true },
    }, async ({ exchange: exchangeId, query, tags, status, sort, limit, offset, params }) => run ({ 'tool': 'search_events', 'exchange': exchangeId }, async () => {
        const exchange = await ctx.pools.getPublic (exchangeId, undefined, true);
        if (!exchange.has?.['fetchEvents']) {
            return { 'ok': false, 'error': { 'code': 'NOT_SUPPORTED', 'message': exchangeId + ' is not a prediction-market exchange', 'retryable': false, 'hint': 'prediction exchanges: ' + (ctx.ccxt.prediction?.exchanges ?? []).join (', ') } };
        }
        const scoping = [ query, tags, params?.['queries'], params?.['eventId'], params?.['slug'] ];
        if (scoping.every ((value) => value === undefined)) {
            return { 'ok': false, 'error': { 'code': 'BAD_REQUEST', 'message': 'search_events requires a scoping filter: query, tags, or params.eventId/params.slug', 'retryable': false, 'hint': 'e.g. {"exchange": "' + exchangeId + '", "query": "bitcoin"}' } };
        }
        const max = clampLimit (limit, 25, 100);
        const from = Math.max (0, offset ?? 0);
        const requestParams: Record<string, any> = { ...(params ?? {}) };
        if (query !== undefined) {
            requestParams['query'] = query;
        }
        if (tags !== undefined) {
            requestParams['tags'] = tags;
        }
        if (status !== undefined) {
            requestParams['status'] = status;
        }
        if (sort !== undefined) {
            requestParams['sort'] = sort;
        }
        // over-fetch by one so hasMore is a real signal, not a guess
        requestParams['limit'] = from + max + 1;
        const events = await exchange.fetchEvents (requestParams);
        const hasMore = events.length > from + max;
        // when the caller wants active events (the default), don't bloat the response with
        // resolved/settled sub-markets and outcomes
        const wantActive = status === undefined || status === 'active';
        const outcomeActive = (outcome: any) => !wantActive || outcome.active !== false;
        const page = events.slice (from, from + max).map ((event: any) => ({
            ...project (event, EVENT_FIELDS),
            'event': event.event,
            'end': event.end,
            'endDatetime': event.endDatetime,
            'markets': (event.markets ?? [])
                .map ((market: any) => ({
                    'market': market.market,
                    'title': market.title,
                    'marketType': market.marketType,
                    'outcomes': (market.outcomes ?? []).filter (outcomeActive).map ((outcome: any) => project (outcome, [ 'outcome', 'label', 'price', 'bid', 'ask', 'active', 'winner' ])),
                }))
                .filter ((market: any) => market.outcomes.length > 0),
        }));
        return ok (page, {
            'exchange': exchange.id,
            'returned': page.length,
            'offset': from,
            'hasMore': hasMore,
            'notice': (hasMore ? 'more events available — increase offset or narrow the query. ' : '')
                + 'pass an outcome handle (events[].markets[].outcomes[].outcome) as the symbol to other tools on this exchange',
        });
    }));

    server.registerTool ('call_read_method', {
        'title': 'Call any read-only unified ccxt method',
        'description': 'Escape hatch covering every unified read method not served by a dedicated tool (fetchFundingRate, fetchLedger, fetchOpenInterest, fetchLiquidations, fetchEvent, fetchSettlements, …). Only fetch*/load* methods are accepted — writes are structurally rejected. Get the signature first with describe_method. Docs: https://docs.ccxt.com/',
        'inputSchema': {
            'exchange': exchangeParam,
            'method': z.string ().describe ('unified method name matching ^(fetch|load), e.g. "fetchFundingRate"'),
            'args': z.array (z.union ([ z.string (), z.number (), z.boolean (), z.null () ])).optional ().describe ('positional arguments per the describe_method usage line; ISO8601 strings become ms timestamps; null skips an optional argument'),
            'account': z.string ().optional ().describe ('configured account name — required for private reads like fetchLedger'),
            'includeInfo': z.boolean ().optional ().describe ('keep the raw exchange payload inside unified structures'),
            'marketType': marketTypeParam,
            'prediction': predictionParam,
            'params': paramsParam,
        },
        'annotations': { 'readOnlyHint': true, 'openWorldHint': true },
    }, async ({ exchange: exchangeId, method, args, account: accountName, includeInfo, marketType, prediction, params }) => run ({ 'tool': 'call_read_method', 'exchange': exchangeId, 'account': accountName }, async () => {
        if (method.startsWith ('watch') || method.endsWith ('Ws') || method.startsWith ('un')) {
            return { 'ok': false, 'error': { 'code': 'STREAMING_NOT_SUPPORTED', 'message': method + ' is a WebSocket/streaming method — this server is request/response only', 'retryable': false, 'hint': 'use the fetch* equivalent to get a snapshot (e.g. fetchTicker instead of watchTicker, fetchOrderBook instead of watchOrderBook)' } };
        }
        if (!READ_METHOD_PATTERN.test (method)) {
            return { 'ok': false, 'error': { 'code': 'NOT_A_READ_METHOD', 'message': method + ' is not callable here — only fetch*/load* unified methods are', 'retryable': false, 'hint': 'this tool is read-only; order placement uses create_order, other writes use their dedicated tools (create/edit/cancel order, set_leverage, call_write_method)' } };
        }
        let exchange: any;
        let account: any;
        if (accountName !== undefined) {
            ({ exchange, account } = await ctx.pools.getAuthenticated (accountName));
        } else {
            exchange = await ctx.pools.getPublic (exchangeId, marketType, prediction ?? false);
        }
        if (ADDRESS_METHOD_PATTERN.test (method)) {
            if (account === undefined) {
                return { 'ok': false, 'error': { 'code': 'TIER_DISABLED', 'message': 'address-returning methods need an account with the funds tier enabled', 'retryable': false, 'hint': 'transcript-visible deposit/withdrawal addresses invite address-substitution scams, so they are gated behind "funds" on the account' } };
            }
            requireTier (account, 'funds');
        }
        if (!exchange.has?.[method]) {
            const related = unifiedMethods (exchange).filter ((name) => name.toLowerCase ().includes (method.toLowerCase ().replace (/^(fetch|load)/, ''))).slice (0, 5);
            return { 'ok': false, 'error': { 'code': 'NOT_SUPPORTED', 'message': method + ' is not supported by ' + exchange.id, 'retryable': false, 'hint': related.length ? 'related methods it does support: ' + related.join (', ') : 'see describe_exchange for the supported method list' } };
        }
        const callArgs = buildArgs (exchange, method, args ?? [], params);
        const result = await exchange[method] (...callArgs);
        const data = includeInfo === true ? result : stripInfo (result);
        return ok (data, { 'exchange': exchange.id, method });
    }));

    server.registerTool ('call_implicit_get', {
        'title': 'Call a raw GET endpoint (implicit API)',
        'description': 'Call an exchange-specific implicit REST endpoint over HTTP GET, for data the unified API does not cover. Endpoint names are exchange-specific (find them with describe_method {"query": ..., "exchange": ...}); the response is the raw exchange payload. Consult the exchange API reference (describe_exchange .urls.doc) and the ccxt manual: https://docs.ccxt.com/',
        'inputSchema': {
            'exchange': exchangeParam,
            'method': z.string ().describe ('implicit method name whose HTTP verb is GET, e.g. "publicGetTickerPrice"'),
            'account': z.string ().optional ().describe ('configured account name for authenticated (private/signed) GET endpoints'),
            'prediction': predictionParam,
            'params': paramsParam,
        },
        'annotations': { 'readOnlyHint': true, 'openWorldHint': true },
    }, async ({ exchange: exchangeId, method, account: accountName, prediction, params }) => run ({ 'tool': 'call_implicit_get', 'exchange': exchangeId, 'account': accountName }, async () => {
        let exchange: any;
        if (accountName !== undefined) {
            ({ exchange } = await ctx.pools.getAuthenticated (accountName));
        } else {
            exchange = await ctx.pools.getPublic (exchangeId, undefined, prediction ?? false);
        }
        if (!isImplicitMethod (exchange, method)) {
            return { 'ok': false, 'error': { 'code': 'UNKNOWN_ENDPOINT', 'message': method + ' is not an implicit endpoint of ' + exchange.id, 'retryable': false, 'hint': 'search endpoint names with describe_method {"query": "...", "exchange": "' + exchange.id + '"}' } };
        }
        const verb = implicitVerb (method);
        if (verb !== 'Get') {
            return { 'ok': false, 'error': { 'code': 'NOT_A_GET_ENDPOINT', 'message': method + ' uses HTTP ' + (verb ?? 'unknown').toUpperCase () + ' — only GET endpoints are callable here', 'retryable': false, 'hint': 'non-GET endpoints require the implicitWrites account flag and go through call_implicit_write' } };
        }
        // the funds-tier gate on address material applies to raw endpoints too
        // (e.g. sapiGetCapitalDepositAddress) — otherwise it would trivially bypass
        // the unified-method gate
        if (ADDRESS_METHOD_PATTERN.test (method)) {
            const targeted = (accountName !== undefined) ? ctx.pools.account (accountName) : undefined;
            if (targeted === undefined) {
                return { 'ok': false, 'error': { 'code': 'TIER_DISABLED', 'message': 'address-returning endpoints need an account with the funds tier enabled', 'retryable': false, 'hint': 'see get_deposit_address' } };
            }
            requireTier (targeted, 'funds');
        }
        const result = await exchange[method] (params ?? {});
        return ok (result, { 'exchange': exchange.id, method, 'docsUrl': exchange.urls?.doc });
    }));

    server.registerTool ('get_safety_status', {
        'title': 'Show safety and configuration status',
        'description': 'What this server is currently allowed to do: configured accounts (names only — never credentials), enabled capability tiers, caps, sandbox/live environments, journal location, unresolved order intents, and any configuration problems.',
        'inputSchema': {},
        'annotations': { 'readOnlyHint': true, 'idempotentHint': true, 'openWorldHint': false },
    }, async () => run ({ 'tool': 'get_safety_status' }, async () => {
        const accounts = Object.values (ctx.config.accounts).map ((account) => accountSummary (account as any));
        const unresolved = ctx.journal.unresolvedIntents ();
        return ok ({
            'version': ctx.version,
            'ccxtVersion': String (ctx.ccxt.version ?? 'unknown'),
            accounts,
            'tiers': {
                'market': true,
                'read': accounts.length > 0,
                'trading': accounts.some ((account) => account.trading !== false),
                'funds': accounts.some ((account) => account.funds !== false),
                'implicitWrites': accounts.some ((account) => account.implicitWrites),
            },
            'elicitationSupported': ctx.elicitationSupported (),
            'configPath': ctx.config.configPath ?? '(no config file found — public market tier only)',
            'journal': ctx.journal.location (),
            'unresolvedIntents': unresolved.map ((record: any) => ({ 'intentId': record.intentId, 'ts': record.ts, 'account': record.account, 'method': record.method, 'clientOrderId': record.clientOrderId })),
            'configProblems': ctx.config.problems,
        });
    }));
}

// positional-arg coercion, ported from cli/ts/helpers.ts parseMethodArgs/injectMissingUndefined:
// ISO8601 strings -> ms, null -> undefined, then pad with undefined so the trailing params
// object lands in the method's params slot
export function buildArgs (exchange: any, method: string, args: (string | number | boolean | null)[], params: Record<string, any> | undefined): any[] {
    const coerced: any[] = args.map ((arg) => {
        if (arg === null) {
            return undefined;
        }
        if (typeof arg === 'string' && /^[0-9]{4}-[0-9]{2}-[0-9]{2}[T\s]?[0-9]{2}:[0-9]{2}/.test (arg)) {
            const parsed = exchange.parse8601 (arg);
            if (parsed !== undefined && parsed !== null) {
                return parsed;
            }
        }
        return arg;
    });
    if (params !== undefined && Object.keys (params).length > 0) {
        const fn = exchange[method];
        const expected = countParams (fn);
        while (expected > 0 && coerced.length < expected - 1) {
            coerced.push (undefined);
        }
        coerced.push (params);
    }
    return coerced;
}

function countParams (fn: any): number {
    const fnStr = fn.toString ().replace (/\/\/.*$/gm, '').replace (/\/\*[\s\S]*?\*\//gm, '').replace (/\s+/g, '');
    const match = fnStr.match (/^[^(]*\(([^)]*)\)/);
    if (!match) {
        return 0;
    }
    return match[1].split (',').filter ((param: string) => param).length;
}
