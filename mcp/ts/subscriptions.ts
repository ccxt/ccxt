import crypto from 'crypto';
import { redact } from './redact.js';
import { project, stripInfo, TICKER_FIELDS, TRADE_FIELDS, ORDER_FIELDS, POSITION_FIELDS } from './format.js';
import { log } from './logging.js';

// MCP over stdio is request/response, but the server process is long-lived — so streaming
// is modelled as "subscribe + poll": watch_subscribe starts a background ccxt.pro watch*
// loop that accumulates incremental updates into a bounded ring buffer; watch_read drains
// the buffer since a cursor; watch_unsubscribe (or an idle timeout) stops the loop and
// releases the socket. This gives an agent fresh data without a host-side push channel.

const MAX_SUBSCRIPTIONS = 25;       // hard cap on concurrent open streams
const BUFFER_MAX = 200;             // updates retained per subscription (ring buffer)
const READ_MAX = 50;                // updates returned per watch_read
const IDLE_TTL_MS = 10 * 60 * 1000; // stop a stream with no watch_read for 10 minutes
const MAX_CONSECUTIVE_ERRORS = 5;   // give up a stream after this many back-to-back errors

interface Update {
    seq: number;
    ts: number;
    data: any;
}

interface Subscription {
    id: string;
    exchangeId: string;
    method: string;
    args: any[];
    account: string | undefined;
    streamKey: string | undefined;
    exchange: any;
    buffer: Update[];
    seq: number;
    totalUpdates: number;
    active: boolean;
    consecutiveErrors: number;
    createdAt: number;
    lastReadAt: number;
    lastUpdateAt: number | undefined;
    error: { code: string, message: string } | undefined;
    stopResolve: (value: symbol) => void;
    stopPromise: Promise<symbol>;
    stopSentinel: symbol;
    timer: ReturnType<typeof setTimeout> | undefined;
}

export class StreamArgError extends Error {
    hint: string;
    constructor (message: string, hint = '') {
        super (message);
        this.hint = hint;
    }
}

export class SubscriptionRegistry {
    private pools: any;
    private subs = new Map<string, Subscription> ();

    constructor (pools: any) {
        this.pools = pools;
    }

    async subscribe (opts: { exchangeId: string, method: string, args?: (string | number | boolean | null)[], account?: string, marketType?: string, prediction?: boolean, params?: Record<string, any> }): Promise<{ subscriptionId: string, exchange: string, method: string, args: any[] }> {
        const method = opts.method;
        if (!/^watch[A-Z]/.test (method)) {
            throw new StreamArgError (JSON.stringify (method) + ' is not a streaming method', 'use a watch* method, e.g. watchTicker, watchOHLCV, watchOrderBook, watchTrades, watchOrders (with an account)');
        }
        if (this.subs.size >= MAX_SUBSCRIPTIONS) {
            throw new StreamArgError ('too many active subscriptions (max ' + MAX_SUBSCRIPTIONS + ')', 'watch_unsubscribe some first — watch_list shows them');
        }
        let exchange: any;
        let streamKey: string | undefined;
        if (opts.account !== undefined) {
            const auth = await this.pools.getAuthenticated (opts.account);
            exchange = auth.exchange;
        } else {
            const acquired = await this.pools.acquirePublicStream (opts.exchangeId, opts.marketType, opts.prediction ?? false);
            exchange = acquired.exchange;
            streamKey = acquired.streamKey;
        }
        if (!exchange.has?.[method]) {
            if (streamKey !== undefined) {
                this.pools.releasePublicStream (streamKey);
            }
            throw new StreamArgError (exchange.id + ' does not stream ' + method + ' (no WebSocket support for it)', 'check describe_exchange — not every exchange streams every method; the fetch* equivalent still works');
        }
        const args = this.buildWatchArgs (exchange, method, opts.args ?? [], opts.params);
        const sentinel = Symbol ('stop');
        let stopResolve!: (value: symbol) => void;
        const stopPromise = new Promise<symbol> ((resolve) => {
            stopResolve = resolve;
        });
        const sub: Subscription = {
            'id': 'sub-' + crypto.randomUUID ().slice (0, 12),
            'exchangeId': exchange.id,
            method,
            args,
            'account': opts.account,
            streamKey,
            exchange,
            'buffer': [],
            'seq': 0,
            'totalUpdates': 0,
            'active': true,
            'consecutiveErrors': 0,
            'createdAt': Date.now (),
            'lastReadAt': Date.now (),
            'lastUpdateAt': undefined,
            'error': undefined,
            stopResolve,
            stopPromise,
            'stopSentinel': sentinel,
            'timer': undefined,
        };
        this.subs.set (sub.id, sub);
        this.resetIdle (sub);
        void this.runLoop (sub);
        return { 'subscriptionId': sub.id, 'exchange': exchange.id, method, args };
    }

    read (id: string, cursor?: number): any {
        const sub = this.subs.get (id);
        if (sub === undefined) {
            return { 'found': false };
        }
        sub.lastReadAt = Date.now ();
        this.resetIdle (sub);
        const from = cursor ?? 0;
        const fresh = sub.buffer.filter ((u) => u.seq > from);
        const returned = fresh.slice (-READ_MAX);
        const oldestBuffered = sub.buffer.length > 0 ? sub.buffer[0].seq : sub.seq;
        return {
            'found': true,
            'updates': returned.map ((u) => ({ 'seq': u.seq, 'timestamp': u.ts, 'datetime': new Date (u.ts).toISOString (), 'data': u.data })),
            'cursor': sub.seq,
            'returnedUpdates': returned.length,
            'updatesSinceSubscribe': sub.totalUpdates,
            'missedBeforeBuffer': from > 0 && from < oldestBuffered - 1 ? (oldestBuffered - 1 - from) : 0,
            'truncated': fresh.length > returned.length,
            'lastUpdate': sub.lastUpdateAt,
            'active': sub.active,
            'error': sub.error,
        };
    }

    unsubscribe (id: string): boolean {
        const sub = this.subs.get (id);
        if (sub === undefined) {
            return false;
        }
        this.stopSub (sub);
        return true;
    }

    list (): any[] {
        const now = Date.now ();
        return [ ...this.subs.values () ].map ((sub) => ({
            'subscriptionId': sub.id,
            'exchange': sub.exchangeId,
            'method': sub.method,
            'args': sub.args,
            'account': sub.account,
            'active': sub.active,
            'updates': sub.totalUpdates,
            'ageSeconds': Math.round ((now - sub.createdAt) / 1000),
            'lastReadSecondsAgo': Math.round ((now - sub.lastReadAt) / 1000),
            'error': sub.error,
        }));
    }

    async closeAll (): Promise<void> {
        for (const sub of [ ...this.subs.values () ]) {
            this.stopSub (sub);
        }
    }

    private resetIdle (sub: Subscription): void {
        if (sub.timer !== undefined) {
            clearTimeout (sub.timer);
        }
        sub.timer = setTimeout (() => {
            log ('info', 'stream ' + sub.id + ' idle-expired after ' + (IDLE_TTL_MS / 60000) + ' min with no read');
            this.stopSub (sub);
        }, IDLE_TTL_MS);
        // never let the idle timer keep the process alive
        if (typeof (sub.timer as any).unref === 'function') {
            (sub.timer as any).unref ();
        }
    }

    private stopSub (sub: Subscription): void {
        if (!this.subs.has (sub.id) && !sub.active) {
            return;
        }
        sub.active = false;
        if (sub.timer !== undefined) {
            clearTimeout (sub.timer);
            sub.timer = undefined;
        }
        sub.stopResolve (sub.stopSentinel); // unblock the loop's race so it exits promptly
        this.subs.delete (sub.id);
        if (sub.streamKey !== undefined) {
            // closes the public stream instance once the last subscriber releases it
            this.pools.releasePublicStream (sub.streamKey);
        } else if (sub.account !== undefined) {
            // shared per-account instance stays open for REST; best-effort unsubscribe
            const unMethod = 'unWatch' + sub.method.slice ('watch'.length);
            try {
                if (typeof sub.exchange[unMethod] === 'function') {
                    void Promise.resolve (sub.exchange[unMethod] (...sub.args)).catch (() => undefined);
                }
            } catch (e) {
                // best-effort only
            }
        }
    }

    private async runLoop (sub: Subscription): Promise<void> {
        while (sub.active) {
            let result: any;
            try {
                result = await Promise.race ([ sub.exchange[sub.method] (...sub.args), sub.stopPromise ]);
            } catch (e: any) {
                if (!sub.active) {
                    break;
                }
                sub.consecutiveErrors += 1;
                const name = String (e?.constructor?.name ?? '');
                const fatal = /NotSupported|AuthenticationError|PermissionDenied|BadSymbol|ArgumentsRequired/.test (name);
                if (fatal || sub.consecutiveErrors > MAX_CONSECUTIVE_ERRORS) {
                    sub.error = { 'code': fatal ? 'STREAM_UNSUPPORTED' : 'STREAM_FAILED', 'message': redact (String (e?.message ?? e)) };
                    sub.active = false;
                    break;
                }
                await sleep (Math.min (30000, 500 * Math.pow (2, sub.consecutiveErrors)));
                continue;
            }
            if (result === sub.stopSentinel || !sub.active) {
                break;
            }
            sub.consecutiveErrors = 0;
            sub.seq += 1;
            sub.totalUpdates += 1;
            sub.lastUpdateAt = Date.now ();
            sub.buffer.push ({ 'seq': sub.seq, 'ts': sub.lastUpdateAt, 'data': trimWatchUpdate (sub.method, result) });
            if (sub.buffer.length > BUFFER_MAX) {
                sub.buffer.splice (0, sub.buffer.length - BUFFER_MAX);
            }
        }
    }

    // positional-arg coercion, same rules as call_read_method (ISO8601 -> ms, null ->
    // undefined, trailing params object placed in the method's params slot)
    private buildWatchArgs (exchange: any, method: string, args: (string | number | boolean | null)[], params: Record<string, any> | undefined): any[] {
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
            coerced.push (params);
        }
        return coerced;
    }
}

// keep buffered updates small: project to the same fields the fetch* tools return, and cap
// array-valued streams (order book depth, trade/order batches, ohlcv candles)
function trimWatchUpdate (method: string, data: any): any {
    if (data === null || data === undefined) {
        return data;
    }
    const m = method.toLowerCase ();
    if (m.includes ('orderbook')) {
        return {
            'symbol': data.symbol,
            'timestamp': data.timestamp,
            'datetime': data.datetime,
            'nonce': data.nonce,
            'bids': (data.bids ?? []).slice (0, 20).map ((l: any[]) => [ l[0], l[1] ]),
            'asks': (data.asks ?? []).slice (0, 20).map ((l: any[]) => [ l[0], l[1] ]),
        };
    }
    if (m.includes ('ohlcv')) {
        return Array.isArray (data) ? data.slice (-5) : data;
    }
    if (m.includes ('ticker')) {
        if (Array.isArray (data)) {
            return data.map ((t) => project (t, TICKER_FIELDS));
        }
        if (data.last !== undefined || data.bid !== undefined || data.symbol !== undefined) {
            return project (data, TICKER_FIELDS);
        }
        const out: Record<string, any> = {};
        for (const [ key, value ] of Object.entries (data)) {
            out[key] = project (value, TICKER_FIELDS);
        }
        return out;
    }
    if (m.includes ('trade')) {
        return Array.isArray (data) ? data.slice (-READ_MAX).map ((t: any) => project (t, TRADE_FIELDS)) : data;
    }
    if (m.includes ('order')) {
        return Array.isArray (data) ? data.slice (-READ_MAX).map ((o: any) => project (o, ORDER_FIELDS)) : project (data, ORDER_FIELDS);
    }
    if (m.includes ('position')) {
        return Array.isArray (data) ? data.map ((p: any) => project (p, POSITION_FIELDS)) : project (data, POSITION_FIELDS);
    }
    return stripInfo (data);
}

function sleep (ms: number): Promise<void> {
    return new Promise ((resolve) => {
        const t = setTimeout (resolve, ms);
        if (typeof (t as any).unref === 'function') {
            (t as any).unref ();
        }
    });
}
