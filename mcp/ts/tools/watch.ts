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
        'description': 'Open a background WebSocket subscription to a ccxt.pro watch* method so the agent can pull fresh data on demand. Returns a subscriptionId and a "streamKind": STATE streams (watchTicker/watchOrderBook/watchOHLCV/watchBalance/watchPositions) keep only the current snapshot — watch_read returns it in "latest"; EVENT streams (watchTrades/watchMyTrades/watchOrders — the last three private, needing an account) accumulate every item — watch_read returns them in "events" with a cursor. Call watch_unsubscribe to stop; streams auto-stop after 10 minutes with no read. Not every exchange streams every method — check describe_exchange.',
        'inputSchema': {
            'exchange': exchangeParam,
            'method': z.string ().describe ('a ccxt.pro watch* method, e.g. "watchOHLCV", "watchTicker", "watchOrderBook", "watchTrades"'),
            'args': z.array (z.union ([ z.string (), z.number (), z.boolean (), z.null () ])).optional ().describe ('positional arguments — they differ per method (get the exact signature with describe_method): e.g. watchTicker ["BTC/USDT"], watchOHLCV ["BTC/USDT","1m"], watchOrderBook ["BTC/USDT", depthLimit], watchTrades ["BTC/USDT"]. Resolve symbols with search_markets.'),
            'account': z.string ().optional ().describe ('configured account name — required for private streams (watchOrders, watchMyTrades, watchBalance, watchPositions)'),
            'marketType': marketTypeParam,
            'prediction': predictionParam,
            'params': paramsParam,
        },
        'annotations': { 'readOnlyHint': true, 'openWorldHint': true },
    }, async ({ exchange: exchangeId, method, args, account, marketType, prediction, params }) => run ({ 'tool': 'watch_subscribe', 'exchange': exchangeId, account }, async () => {
        try {
            const sub = await ctx.subscriptions.subscribe ({ exchangeId, method, 'args': args ?? undefined, account, marketType, 'prediction': prediction, params });
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
        'description': 'Get the latest data from a stream. For a STATE stream (streamKind "state": ticker, order book, ohlcv, balance, positions) it returns the CURRENT snapshot in "latest" — just call it whenever you need the current value; "updatesSinceRead" tells you how much changed since you last read. For an EVENT stream (streamKind "events": trades, my trades, orders) it returns new items oldest-first in "events" plus a "nextCursor" — thread that back as "cursor" on each poll so you do not re-receive (double-count) old items; "moreBuffered": true means call again with nextCursor for more.',
        'inputSchema': {
            'subscriptionId': z.string ().describe ('id from watch_subscribe'),
            'cursor': z.number ().int ().optional ().describe ('EVENT streams only: the nextCursor from your previous watch_read (omit on the first read). Ignored for state streams.'),
        },
        'annotations': { 'readOnlyHint': true, 'openWorldHint': false },
    }, async ({ subscriptionId, cursor }) => run ({ 'tool': 'watch_read' }, async () => {
        const result = ctx.subscriptions.read (subscriptionId, cursor);
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
        'description': 'List the currently active WebSocket subscriptions (id, exchange, method, age, last read, update count).',
        'inputSchema': {},
        'annotations': { 'readOnlyHint': true, 'idempotentHint': true, 'openWorldHint': false },
    }, async () => run ({ 'tool': 'watch_list' }, async () => {
        const subs = ctx.subscriptions.list ();
        return ok (subs, { 'count': subs.length });
    }));
}
