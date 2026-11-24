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
        'description': 'Open a background WebSocket subscription to a ccxt.pro watch* method; returns a subscriptionId and a "streamKind". STATE streams (watchTicker(s), watchOrderBook(ForSymbols), watchOHLCV(ForSymbols), watchBalance, watchPositions, watchBidsAsks, watchMarkPrice(s), watchFundingRate(s)): watch_read returns the COMPLETE current snapshot in "latest" — live updates are merged into it, so a multi-symbol stream always shows every subscribed symbol. EVENT streams (watchTrades, and with an account watchOrders/watchMyTrades/watch(My)Liquidations): watch_read returns each new item oldest-first in "events" with a cursor. Stop with watch_unsubscribe; streams auto-stop after 10 minutes with no read. Not every exchange streams every method — check describe_exchange.',
        'inputSchema': {
            'exchange': exchangeParam,
            'method': z.string ().describe ('a ccxt.pro watch* method, e.g. "watchOHLCV", "watchTicker", "watchOrderBook", "watchTrades"'),
            'args': z.array (z.union ([ z.string (), z.number (), z.boolean (), z.null (), z.array (z.union ([ z.string (), z.number (), z.boolean (), z.null () ])) ])).optional ().describe ('positional arguments, per method (signature: describe_method): e.g. watchTicker ["BTC/USDT"], watchOHLCV ["BTC/USDT","1m"], watchOrderBook ["BTC/USDT", depthLimit]. A symbol LIST is a nested array: watchTickers [["BTC/USDT","ETH/USDT"]]. Resolve symbols with search_markets.'),
            'symbol': z.string ().optional ().describe ('alias for args[0] of a single-symbol stream (watchTicker/watchOrderBook/watchTrades/watchOHLCV); ignored if args is given'),
            'symbols': z.array (z.string ()).optional ().describe ('alias for args[0] of a multi-symbol stream (watchTickers/watchOrderBookForSymbols/…); ignored if args is given'),
            'account': z.string ().optional ().describe ('account name — required for private streams (watchOrders, watchMyTrades, watchBalance, watchPositions, watchMyLiquidations)'),
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
        'description': 'Read a stream. STATE stream (streamKind "state"): returns the COMPLETE current snapshot in "latest", shaped like the fetch* method — one object for watchTicker/watchOrderBook/watchBalance, keyed by symbol for watchTickers/watchBidsAsks, an array for watchPositions, and "latest"[symbol][timeframe] = [[ts,o,h,l,c,v], ...] for watchOHLCV; "updatesSinceRead" counts the changes since your last read. EVENT stream (streamKind "events"): returns new updates oldest-first in "events" plus "nextCursor" — pass it back as "cursor" on each poll so nothing is received twice. Each element is {seq, timestamp, datetime, data}, "data" being that tick\'s batch of records (an array). "moreBuffered": true = call again with nextCursor; "missedBeforeBuffer" > 0 = older updates were evicted unread. waitForChange: true BLOCKS until the next update or the timeout ("timedOut": true = nothing new) — the efficient way to wait for a fill or a position change.',
        'inputSchema': {
            'subscriptionId': z.string ().describe ('id from watch_subscribe'),
            'cursor': z.number ().int ().optional ().describe ('EVENT streams only: nextCursor from your previous watch_read (omit on the first read)'),
            'waitForChange': z.boolean ().optional ().describe ('block until the next update (or timeoutMs) instead of returning at once; returns immediately when something new is already available'),
            'timeoutMs': z.number ().int ().positive ().optional ().describe ('max block time with waitForChange (default 25000, clamped to 1000–55000)'),
            'depth': z.number ().int ().positive ().optional ().describe ('order-book streams only: levels per side in "latest" (default 20, max 100); depth: 1 = top of book, much cheaper across many venues'),
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
