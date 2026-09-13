import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ServerContext } from '../types.js';
import { ok } from '../format.js';
import { run, exchangeParam, predictionParam, paramsParam } from './common.js';
import { StreamArgError } from '../subscriptions.js';

const marketTypeParam = z.string ().optional ().describe ('market type routing for exchanges with several (e.g. "spot", "swap")');

export function registerWatchTools (server: McpServer, ctx: ServerContext): void {
    server.registerTool ('watch_subscribe', {
        'title': 'Start a live WebSocket stream',
        'description': 'Open a background WebSocket subscription to a ccxt.pro watch* method so the agent can pull fresh data on demand. Returns a subscriptionId and a "streamKind". STATE streams are snapshots of "what is X right now" — watchTicker(s), watchOrderBook(ForSymbols), watchOHLCV(ForSymbols), watchBalance, watchPositions, watchBidsAsks, watchMarkPrice(s), watchFundingRate(s): watch_read returns the COMPLETE current set in "latest" (the server merges live updates into a full snapshot, so a multi-symbol stream always shows every subscribed symbol, not just the one that just ticked). EVENT streams are logs of discrete events — watchTrades and the private watchOrders/watchMyTrades/watch(My)Liquidations (private ones need an account): watch_read returns each new item oldest-first in "events" with a cursor. Call watch_unsubscribe to stop; streams auto-stop after 10 minutes with no read. Not every exchange streams every method — check describe_exchange.',
        'inputSchema': {
            'exchange': exchangeParam,
            'method': z.string ().describe ('a ccxt.pro watch* method, e.g. "watchOHLCV", "watchTicker", "watchOrderBook", "watchTrades"'),
            'args': z.array (z.union ([ z.string (), z.number (), z.boolean (), z.null (), z.array (z.union ([ z.string (), z.number (), z.boolean (), z.null () ])) ])).optional ().describe ('positional arguments — they differ per method (get the exact signature with describe_method): e.g. watchTicker ["BTC/USDT"], watchOHLCV ["BTC/USDT","1m"], watchOrderBook ["BTC/USDT", depthLimit], watchTrades ["BTC/USDT"]. Methods that take a symbol LIST take a nested array, e.g. watchTickers [["BTC/USDT","ETH/USDT"]]. Resolve symbols with search_markets.'),
            'symbol': z.string ().optional ().describe ('convenience alias for a single-symbol stream (watchTicker/watchOrderBook/watchTrades/watchOHLCV) — equivalent to passing it as args[0]; ignored if args is given'),
            'symbols': z.array (z.string ()).optional ().describe ('convenience alias for a multi-symbol stream (watchTickers/watchOrderBookForSymbols/…) — equivalent to passing the list as args[0]; ignored if args is given'),
            'account': z.string ().optional ().describe ('configured account name — required for private streams (watchOrders, watchMyTrades, watchBalance, watchPositions, watchMyLiquidations)'),
            'marketType': marketTypeParam,
            'prediction': predictionParam,
            'params': paramsParam,
        },
        'annotations': { 'readOnlyHint': true, 'openWorldHint': true },
    }, async ({ exchange: exchangeId, method, args, symbol, symbols, account, marketType, prediction, params }) => run ({ 'tool': 'watch_subscribe', 'exchange': exchangeId, account }, async () => {
        try {
            const sub = await ctx.subscriptions.subscribe ({ exchangeId, method, 'args': args ?? undefined, symbol, symbols, account, marketType, 'prediction': prediction, params });
            return ok (sub, { 'notice': 'stream started — call watch_read with this subscriptionId (and the returned cursor on later reads) to get new updates; watch_unsubscribe to stop' });
        } catch (error: any) {
            if (error instanceof StreamArgError) {
                return { 'ok': false, 'error': { 'code': 'BAD_STREAM_REQUEST', 'message': error.message, 'retryable': false, 'hint': error.hint } };
            }
            throw error;
        }
    }));

    server.registerTool ('watch_read', {
        'title': 'Read from a live stream',
        'description': 'Get the latest data from a stream. For a STATE stream (streamKind "state": ticker(s), order book(s), ohlcv, balance, positions, ...) it returns the COMPLETE current snapshot in "latest" — the full merged set, so call it whenever you need the current value; "updatesSinceRead" tells you how much changed since you last read. The shape of "latest" mirrors the fetch* method: a single object for watchTicker/watchOrderBook/watchBalance, keyed by symbol for watchTickers/watchBidsAsks ({"BTC/USDT": {...}}), an array for watchPositions, and nested by symbol then timeframe for watchOHLCV ("latest"["BTC/USDT"]["1m"] = [[ts,o,h,l,c,v], ...]). For an EVENT stream (streamKind "events": trades, orders, my trades, liquidations) it returns new updates oldest-first in "events" plus a "nextCursor" — thread that back as "cursor" on each poll so you do not re-receive (double-count) old items. Each "events" element is a wrapper {seq, timestamp, datetime, data} where "data" holds the record(s) for that tick (an array — ccxt delivers a batch per update, e.g. events[i].data is the trades from that tick). "moreBuffered": true means call again with nextCursor for more, and "missedBeforeBuffer" > 0 means older updates were evicted before you read them. Set waitForChange:true to BLOCK until the next update arrives (or timeout) instead of returning immediately — the efficient way to wait for a slow event like an order fill or a position change ("timedOut": true means the wait elapsed with nothing new).',
        'inputSchema': {
            'subscriptionId': z.string ().describe ('id from watch_subscribe'),
            'cursor': z.number ().int ().optional ().describe ('EVENT streams only: the nextCursor from your previous watch_read (omit on the first read). Ignored for state streams.'),
            'waitForChange': z.boolean ().optional ().describe ('block until the next update lands (or timeoutMs elapses) instead of returning right away — use to wait for a fill/position change without polling. If something new is already available it returns immediately.'),
            'timeoutMs': z.number ().int ().positive ().optional ().describe ('max time to block when waitForChange is set (default 25000, clamped to 1000–55000 — sub-second values are raised to ~1s, larger stay under host tool-call timeouts)'),
            'depth': z.number ().int ().positive ().optional ().describe ('order-book streams only: levels per side to return in "latest" (default 20, max 100). Use depth:1 for just top-of-book (best bid/ask) — much cheaper when comparing many venues.'),
        },
        'annotations': { 'readOnlyHint': true, 'openWorldHint': false },
    }, async ({ subscriptionId, cursor, waitForChange, timeoutMs, depth }) => run ({ 'tool': 'watch_read' }, async () => {
        const result = await ctx.subscriptions.readWaiting (subscriptionId, cursor, waitForChange ?? false, timeoutMs, depth);
        if (result.failed) {
            // the stream DIED (error), not idle/unsubscribed — surface the real cause honestly
            const e = result.error ?? {};
            return { 'ok': false, 'error': { 'code': 'SUBSCRIPTION_FAILED', 'message': e.message ?? 'the stream failed and was stopped', 'retryable': false, 'hint': e.hint ?? 'the stream errored and is no longer running — fix the cause and watch_subscribe again' } };
        }
        if (!result.found) {
            return { 'ok': false, 'error': { 'code': 'SUBSCRIPTION_NOT_FOUND', 'message': 'no active subscription ' + JSON.stringify (subscriptionId), 'retryable': false, 'hint': 'it may have been unsubscribed or idle-expired (10 min) — start a new one with watch_subscribe; watch_list shows active streams' } };
        }
        const { found, ...data } = result;
        return ok (data);
    }));

    server.registerTool ('watch_unsubscribe', {
        'title': 'Stop a live stream',
        'description': 'Stop a WebSocket subscription and release its socket. Always stop streams you no longer need.',
        'inputSchema': {
            'subscriptionId': z.string ().describe ('id from watch_subscribe'),
        },
        'annotations': { 'readOnlyHint': false, 'destructiveHint': false, 'idempotentHint': true, 'openWorldHint': false },
    }, async ({ subscriptionId }) => run ({ 'tool': 'watch_unsubscribe' }, async () => {
        const stopped = ctx.subscriptions.unsubscribe (subscriptionId);
        return ok ({ subscriptionId, stopped }, stopped ? undefined : { 'notice': 'no such active subscription (already stopped or expired)' });
    }));

    server.registerTool ('watch_list', {
        'title': 'List active streams',
        'description': 'List the currently active WebSocket subscriptions (id, exchange, method, streamKind, account and environment for private streams, args, active flag, age, seconds since last read, update count, and last error).',
        'inputSchema': {},
        'annotations': { 'readOnlyHint': true, 'idempotentHint': true, 'openWorldHint': false },
    }, async () => run ({ 'tool': 'watch_list' }, async () => {
        const subs = ctx.subscriptions.list ();
        return ok (subs, { 'count': subs.length });
    }));
}
