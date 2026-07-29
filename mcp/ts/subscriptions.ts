import crypto from 'crypto';
import { redact } from './redact.js';
import { project, stripInfo, TICKER_FIELDS, TRADE_FIELDS, ORDER_FIELDS, POSITION_FIELDS } from './format.js';
import { accountEnvironment } from './types.js';
import { log } from './logging.js';

// MCP over stdio is request/response, but the server process is long-lived — so streaming
// is modelled as "subscribe + poll". ccxt.pro maintains a live cache per channel, and two
// access patterns fall out of that:
//   - STATE streams (ticker(s), order book(s), ohlcv, balance, positions, ...): the agent
//     wants "what is it right now". ccxt.pro keeps the FULL current state in the instance,
//     but with newUpdates=true each watch* returns only the CHANGED subset, so we merge each
//     delta into a per-subscription accumulator (by symbol / by candle timestamp) and
//     watch_read returns the coherent full snapshot in `latest` — never a partial delta
//     mistaken for the whole set. No cursor, no history.
//   - EVENT streams (trades, my trades, orders, liquidations): each watch* yields NEW items;
//     the agent wants every one, so they accumulate in a bounded ring buffer that watch_read
//     drains oldest-first via a cursor (no skipping, no replay).
// watch_read can also block (waitForChange) until the next update lands — the closest thing
// to a push in a request/response protocol, and the right fit for slow event streams (fills).

const BUFFER_MAX = 200;             // updates retained per EVENT subscription (ring buffer)
const READ_MAX = 50;                // event updates returned per watch_read
const OHLCV_WINDOW = 200;           // candles retained per (symbol, timeframe) in a snapshot
const IDLE_TTL_MS = 10 * 60 * 1000; // stop a stream with no watch_read for 10 minutes
const DEAD_TTL_MS = 30 * 1000;      // purge a dead (errored) subscription after 30s
const MAX_CONSECUTIVE_ERRORS = 5;   // give up a stream after this many back-to-back errors
const WAIT_DEFAULT_MS = 25 * 1000;  // default block for waitForChange
const WAIT_MAX_MS = 55 * 1000;      // clamp — stay under typical host tool-call timeouts

const PRIVATE_STREAM_RE = /^watch(Orders|MyTrades|MyLiquidations|Balance|Positions)/;
// STATE = a watch* whose value is the CURRENT STATE of something (a snapshot the agent reads
// on demand), as opposed to a log of discrete events. All snapshot streams keep a merged
// accumulator so watch_read always returns the full current set; see accumulate() for how
// each shape (single object / symbol-keyed dict / positions array / candle window) is merged.
const STATE_STREAM_RE = /^watch(Ticker|Tickers|OrderBook|OrderBookForSymbols|OHLCV|OHLCVForSymbols|Balance|Positions|BidsAsks|MarkPrice|MarkPrices|FundingRate|FundingRates)$/;

type SnapshotStrategy = 'replace' | 'mergeDict' | 'upsertArray' | 'mergeBook' | 'window';

// how each snapshot method's delta merges into the accumulator:
//  - replace:     the watch* return IS the whole object (single ticker/book/balance) — store it
//  - mergeDict:   a { symbol: item } delta — merge keys so all subscribed symbols persist
//  - upsertArray: a positions array delta — upsert by symbol+side, emit the full array
//  - mergeBook:   one order book per tick (…ForSymbols) — key by its own symbol
//  - window:      a { symbol: { timeframe: candles } } delta — merge candles by timestamp
function snapshotStrategy (method: string): SnapshotStrategy {
    if (/^watch(Tickers|BidsAsks|MarkPrices|FundingRates)$/.test (method)) {
        return 'mergeDict';
    }
    if (/^watchPositions$/.test (method)) {
        return 'upsertArray';
    }
    if (/^watchOrderBookForSymbols$/.test (method)) {
        return 'mergeBook';
    }
    if (/^watch(OHLCV|OHLCVForSymbols)$/.test (method)) {
        return 'window';
    }
    return 'replace';
}

interface Update {
    seq: number;
    ts: number;
    data: any;
}

interface StreamError {
    code: string;
    message: string;
    retryable: boolean;
    hint: string;
}

interface Subscription {
    id: string;
    exchangeId: string;
    method: string;
    kind: 'state' | 'events';
    strategy: SnapshotStrategy | undefined; // state streams only
    args: any[];
    argsKey: string;
    account: string | undefined;
    environment: string | undefined;
    streamKey: string | undefined;
    exchange: any;
    latest: Update | undefined;   // state streams: the current merged snapshot
    accumulator: any;             // state streams: merge target (shape depends on strategy)
    buffer: Update[];             // event streams: the ring buffer
    waiters: Array<() => void>;   // waitForChange callbacks, resolved on the next update
    seq: number;
    totalUpdates: number;
    lastReadSeq: number;
    active: boolean;
    consecutiveErrors: number;
    createdAt: number;
    lastReadAt: number;
    lastUpdateAt: number | undefined;
    error: StreamError | undefined;
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
    private maxSubscriptions: number;
    private subs = new Map<string, Subscription> ();
    // reserved counts in-flight subscribe() calls that passed the cap check but aren't yet
    // in `subs` — closes the check-then-act gap across the acquire await
    private reserved = 0;

    constructor (pools: any, maxSubscriptions = 0) {
        this.pools = pools;
        // 0 = no limit (the default); a positive value is an optional runaway backstop
        this.maxSubscriptions = maxSubscriptions;
    }

    async subscribe (opts: { exchangeId: string, method: string, args?: (string | number | boolean | null)[], account?: string, marketType?: string, prediction?: boolean, params?: Record<string, any> }): Promise<any> {
        const method = opts.method;
        if (!/^watch[A-Z]/.test (method)) {
            throw new StreamArgError (JSON.stringify (method) + ' is not a streaming method', 'use a watch* method, e.g. watchTicker, watchOHLCV, watchOrderBook, watchTrades, watchOrders (with an account)');
        }
        if (opts.account === undefined && PRIVATE_STREAM_RE.test (method)) {
            throw new StreamArgError (method + ' is a private stream and needs an account', 'configure an account and pass its name as "account"');
        }
        if (this.maxSubscriptions > 0 && this.subs.size + this.reserved >= this.maxSubscriptions) {
            throw new StreamArgError ('reached the configured subscription limit (settings.maxSubscriptions = ' + this.maxSubscriptions + ')', 'watch_unsubscribe some first — watch_list shows them; or raise/remove the limit in settings');
        }
        this.reserved += 1;
        try {
            let exchange: any;
            let streamKey: string | undefined;
            let environment: string | undefined;
            const params = { ...(opts.params ?? {}) };
            if (opts.account !== undefined) {
                const auth = await this.pools.getAuthenticated (opts.account);
                exchange = auth.exchange;
                environment = accountEnvironment (auth.account);
                if (opts.marketType !== undefined) {
                    params['type'] = opts.marketType;
                }
            } else {
                const acquired = await this.pools.acquirePublicStream (opts.exchangeId, opts.marketType, opts.prediction ?? false);
                exchange = acquired.exchange;
                streamKey = acquired.streamKey;
            }
            const release = () => {
                if (streamKey !== undefined) {
                    this.pools.releasePublicStream (streamKey);
                }
            };
            if (!exchange.has?.[method]) {
                release ();
                throw new StreamArgError (exchange.id + ' does not stream ' + method + ' (no WebSocket support for it)', 'check describe_exchange — not every exchange streams every method; the fetch* equivalent still works');
            }
            let args: any[];
            try {
                args = this.buildWatchArgs (exchange, method, opts.args ?? [], params);
            } catch (e) {
                release ();
                throw e;
            }
            const argsKey = JSON.stringify (args);
            // idempotent: an identical active stream already exists — reuse it instead of
            // opening a duplicate socket (a fresh cursor still works, the buffer is shared)
            const existing = this.findActive (exchange.id, method, argsKey, opts.account);
            if (existing !== undefined) {
                release ();
                const info: Record<string, any> = { 'subscriptionId': existing.id, 'exchange': existing.exchangeId, 'method': existing.method, 'streamKind': existing.kind, 'args': existing.args, 'reused': true, 'note': 'reusing the existing identical subscription — watch_read it (watch_list shows all active streams; watch_unsubscribe to stop)' };
                if (existing.account !== undefined) {
                    info['account'] = existing.account;
                    info['environment'] = existing.environment;
                }
                return info;
            }
            const sentinel = Symbol ('stop');
            let stopResolve!: (value: symbol) => void;
            const stopPromise = new Promise<symbol> ((resolve) => {
                stopResolve = resolve;
            });
            const kind: 'state' | 'events' = STATE_STREAM_RE.test (method) ? 'state' : 'events';
            const sub: Subscription = {
                'id': 'sub-' + crypto.randomUUID ().slice (0, 12),
                'exchangeId': exchange.id,
                method,
                kind,
                'strategy': (kind === 'state') ? snapshotStrategy (method) : undefined,
                args,
                argsKey,
                'account': opts.account,
                environment,
                streamKey,
                exchange,
                'latest': undefined,
                'accumulator': undefined,
                'buffer': [],
                'waiters': [],
                'seq': 0,
                'totalUpdates': 0,
                'lastReadSeq': 0,
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
            const result: Record<string, any> = { 'subscriptionId': sub.id, 'exchange': exchange.id, method, 'streamKind': kind, args };
            if (kind === 'state') {
                result['note'] = 'state stream — watch_read returns the current snapshot in "latest"';
            } else {
                result['note'] = 'event stream — watch_read returns new items in "events"; thread "nextCursor" back on each poll';
            }
            if (opts.account !== undefined) {
                result['account'] = opts.account;
                result['environment'] = environment;
            }
            return result;
        } finally {
            this.reserved -= 1;
        }
    }

    read (id: string, cursor?: number): any {
        const sub = this.subs.get (id);
        if (sub === undefined) {
            return { 'found': false };
        }
        sub.lastReadAt = Date.now ();
        if (sub.active) {
            this.resetIdle (sub);
        }
        const common: Record<string, any> = {
            'found': true,
            'streamKind': sub.kind,
            'updatesSinceSubscribe': sub.totalUpdates,
            'lastUpdate': sub.lastUpdateAt,
            'active': sub.active,
            'error': sub.error,
        };
        if (sub.account !== undefined) {
            common['account'] = sub.account;
            common['environment'] = sub.environment;
        }
        if (sub.kind === 'state') {
            // the current snapshot ccxt has built up — no cursor, no history
            const updatesSinceRead = sub.seq - sub.lastReadSeq;
            sub.lastReadSeq = sub.seq;
            common['updatesSinceRead'] = updatesSinceRead;
            common['latest'] = sub.latest?.data;
            common['latestSeq'] = sub.latest?.seq;
            return common;
        }
        // event stream: drain OLDEST-first since the cursor, so repeated reads walk the
        // buffer without skipping or replaying
        const from = cursor ?? 0;
        const fresh = sub.buffer.filter ((u) => u.seq > from);
        const returned = fresh.slice (0, READ_MAX);
        const nextCursor = returned.length > 0 ? returned[returned.length - 1].seq : (cursor ?? sub.seq);
        const oldestBuffered = sub.buffer.length > 0 ? sub.buffer[0].seq : sub.seq;
        common['events'] = returned.map ((u) => ({ 'seq': u.seq, 'timestamp': u.ts, 'datetime': new Date (u.ts).toISOString (), 'data': u.data }));
        common['nextCursor'] = nextCursor;
        // still-unread events past this cursor (not reset by seq bookkeeping mid-pagination)
        common['updatesSinceRead'] = fresh.length;
        // updates evicted from the ring buffer before this cursor could reach them; on the
        // first read (no cursor) the floor is the buffer size vs everything seen so far
        common['missedBeforeBuffer'] = (cursor === undefined)
            ? Math.max (0, sub.totalUpdates - sub.buffer.length)
            : ((from < oldestBuffered - 1) ? (oldestBuffered - 1 - from) : 0);
        // true = more buffered updates remain beyond this window; call again with nextCursor
        common['moreBuffered'] = fresh.length > returned.length;
        return common;
    }

    // watch_read with optional blocking: if waitForChange and there is nothing new yet, park
    // until the next update lands (or the stream stops, or the timeout elapses), then read.
    // This is the "notify me on the next fill" pattern — one long request instead of polling.
    async readWaiting (id: string, cursor?: number, waitForChange = false, timeoutMs?: number): Promise<any> {
        const sub = this.subs.get (id);
        if (sub === undefined) {
            return { 'found': false };
        }
        let timedOut = false;
        if (waitForChange && sub.active && !this.hasNewSince (sub, cursor)) {
            timedOut = !(await this.waitForUpdate (sub, timeoutMs));
        }
        const result = this.read (id, cursor);
        if (waitForChange && result.found !== false) {
            result.waited = true;
            result.timedOut = timedOut;
        }
        return result;
    }

    private hasNewSince (sub: Subscription, cursor?: number): boolean {
        if (sub.kind === 'state') {
            return sub.seq > sub.lastReadSeq;
        }
        const from = cursor ?? 0;
        return sub.buffer.some ((u) => u.seq > from);
    }

    // resolves true when a fresh update arrives, false on timeout; also resolves on stop/error
    private waitForUpdate (sub: Subscription, timeoutMs?: number): Promise<boolean> {
        const ms = Math.min (WAIT_MAX_MS, Math.max (1000, timeoutMs ?? WAIT_DEFAULT_MS));
        return new Promise<boolean> ((resolve) => {
            let settled = false;
            let timer: ReturnType<typeof setTimeout>;
            const done = (changed: boolean) => {
                if (settled) {
                    return;
                }
                settled = true;
                clearTimeout (timer);
                resolve (changed);
            };
            sub.waiters.push (() => done (true));
            timer = this.armTimer (() => done (false), ms);
        });
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
            'streamKind': sub.kind,
            'args': sub.args,
            'account': sub.account,
            'environment': sub.environment,
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
        sub.timer = this.armTimer (() => {
            log ('info', 'stream ' + sub.id + ' idle-expired after ' + (IDLE_TTL_MS / 60000) + ' min with no read');
            this.stopSub (sub);
        }, IDLE_TTL_MS);
    }

    private armTimer (fn: () => void, ms: number): ReturnType<typeof setTimeout> {
        const t = setTimeout (fn, ms);
        if (typeof (t as any).unref === 'function') {
            (t as any).unref ();
        }
        return t;
    }

    // release the transport (socket) for a subscription, idempotently
    private releaseTransport (sub: Subscription): void {
        if (sub.streamKey !== undefined) {
            this.pools.releasePublicStream (sub.streamKey);
            sub.streamKey = undefined;
            return;
        }
        // shared per-account instance: best-effort unWatch, but only if no other active
        // subscription still depends on the same account+method+args stream
        if (sub.account !== undefined && !this.otherActiveSharesStream (sub)) {
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

    private findActive (exchangeId: string, method: string, argsKey: string, account: string | undefined): Subscription | undefined {
        for (const sub of this.subs.values ()) {
            if (sub.active && sub.exchangeId === exchangeId && sub.method === method && sub.argsKey === argsKey && sub.account === account) {
                return sub;
            }
        }
        return undefined;
    }

    private otherActiveSharesStream (sub: Subscription): boolean {
        for (const other of this.subs.values ()) {
            if (other.id !== sub.id && other.active && other.account === sub.account && other.method === sub.method && other.argsKey === sub.argsKey) {
                return true;
            }
        }
        return false;
    }

    private stopSub (sub: Subscription): void {
        const wasActive = sub.active;
        sub.active = false;
        if (sub.timer !== undefined) {
            clearTimeout (sub.timer);
            sub.timer = undefined;
        }
        sub.stopResolve (sub.stopSentinel);
        this.notifyWaiters (sub); // unblock any waitForChange
        this.subs.delete (sub.id);
        if (wasActive) {
            this.releaseTransport (sub);
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
                    sub.error = {
                        'code': fatal ? 'STREAM_UNSUPPORTED' : 'STREAM_FAILED',
                        'message': redact (String (e?.message ?? e)),
                        'retryable': false,
                        'hint': 'the stream stopped and will not resume — fix the cause (e.g. credentials/permissions for a private stream, or the symbol) and call watch_subscribe again; do not keep polling watch_read',
                    };
                    sub.active = false;
                    this.notifyWaiters (sub); // unblock any waitForChange with the error
                    // free the socket now, keep the record readable, then reap it so it
                    // stops occupying a subscription slot
                    this.releaseTransport (sub);
                    if (sub.timer !== undefined) {
                        clearTimeout (sub.timer);
                    }
                    sub.timer = this.armTimer (() => this.stopSub (sub), DEAD_TTL_MS);
                    break;
                }
                await Promise.race ([ sleep (Math.min (30000, 500 * Math.pow (2, sub.consecutiveErrors))), sub.stopPromise ]);
                continue;
            }
            if (result === sub.stopSentinel || !sub.active) {
                break;
            }
            sub.consecutiveErrors = 0;
            sub.seq += 1;
            sub.totalUpdates += 1;
            sub.lastUpdateAt = Date.now ();
            if (sub.kind === 'state') {
                // merge this delta into the running snapshot (never overwrite with a subset)
                sub.latest = { 'seq': sub.seq, 'ts': sub.lastUpdateAt, 'data': accumulate (sub, result) };
            } else {
                const update: Update = { 'seq': sub.seq, 'ts': sub.lastUpdateAt, 'data': trimWatchUpdate (sub.method, result) };
                sub.buffer.push (update);
                if (sub.buffer.length > BUFFER_MAX) {
                    sub.buffer.splice (0, sub.buffer.length - BUFFER_MAX);
                }
            }
            this.notifyWaiters (sub);
        }
    }

    // wake every waitForChange caller parked on this subscription (new update, or it stopped)
    private notifyWaiters (sub: Subscription): void {
        const waiters = sub.waiters.splice (0);
        for (const wake of waiters) {
            wake ();
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

// merge a state stream's latest delta into its running snapshot and return the full snapshot.
// Never overwrites the accumulator with a partial subset — that was the blocker this fixes.
function accumulate (sub: Subscription, result: any): any {
    const strategy = sub.strategy;
    if (strategy === 'replace' || strategy === undefined) {
        // the watch* return is already the whole object (single ticker/book/balance)
        sub.accumulator = trimWatchUpdate (sub.method, result);
        return sub.accumulator;
    }
    if (sub.accumulator === undefined) {
        sub.accumulator = {};
    }
    if (strategy === 'mergeDict') {
        // { symbol: ticker } delta — keep every subscribed symbol, refresh the ones that ticked
        const entries = Array.isArray (result) ? result.map ((t: any) => [ t?.symbol, t ]) : Object.entries (result ?? {});
        for (const [ symbol, ticker ] of entries) {
            if (symbol !== undefined && symbol !== null) {
                sub.accumulator[symbol] = project (ticker, TICKER_FIELDS);
            }
        }
        return sub.accumulator;
    }
    if (strategy === 'mergeBook') {
        // one order book per tick (…ForSymbols) — key by its own symbol
        const books = Array.isArray (result) ? result : [ result ];
        for (const book of books) {
            if (book !== null && book !== undefined && book.symbol !== undefined) {
                sub.accumulator[book.symbol] = trimOrderBook (book);
            }
        }
        return sub.accumulator;
    }
    if (strategy === 'upsertArray') {
        // positions array delta — upsert by symbol+side (a closed position arrives with
        // contracts=0, which is correct to keep; the agent sees it flatten, not vanish)
        const items = Array.isArray (result) ? result : ((result === null || result === undefined) ? [] : [ result ]);
        for (const item of items) {
            const key = String (item?.symbol ?? '') + '|' + String (item?.side ?? '');
            sub.accumulator[key] = project (item, POSITION_FIELDS);
        }
        return Object.values (sub.accumulator);
    }
    // window: merge candles by timestamp into a bounded recent window per (symbol, timeframe)
    // so closed candles are never lost. watchOHLCV returns a flat candle array (keyed here by
    // the subscription's own symbol/timeframe args); watchOHLCVForSymbols returns a nested
    // { symbol: { timeframe: candles } } object.
    mergeOhlcvWindow (sub.accumulator, result, sub.args);
    return buildOhlcvSnapshot (sub.accumulator);
}

function trimOrderBook (data: any): any {
    return {
        'symbol': data.symbol,
        'timestamp': data.timestamp,
        'datetime': data.datetime,
        'nonce': data.nonce,
        'bids': (data.bids ?? []).slice (0, 20).map ((l: any[]) => [ l[0], l[1] ]),
        'asks': (data.asks ?? []).slice (0, 20).map ((l: any[]) => [ l[0], l[1] ]),
    };
}

function mergeOhlcvWindow (acc: Record<string, Record<string, Map<number, any>>>, result: any, args: any[]): void {
    const add = (symbol: string, timeframe: string, candles: any) => {
        if (!Array.isArray (candles)) {
            return;
        }
        acc[symbol] = acc[symbol] ?? {};
        const byTs = acc[symbol][timeframe] ?? new Map<number, any> ();
        acc[symbol][timeframe] = byTs;
        for (const candle of candles) {
            if (Array.isArray (candle) && candle[0] !== undefined) {
                byTs.set (candle[0], candle);
            }
        }
    };
    if (Array.isArray (result)) {
        // watchOHLCV: a flat candle array — key it by this subscription's symbol/timeframe
        const symbol = (typeof args[0] === 'string') ? args[0] : 'symbol';
        const timeframe = (typeof args[1] === 'string') ? args[1] : 'default';
        add (symbol, timeframe, result);
        return;
    }
    // watchOHLCVForSymbols: nested { symbol: { timeframe: candles } }
    for (const [ symbol, byTimeframe ] of Object.entries (result ?? {})) {
        if (byTimeframe !== null && typeof byTimeframe === 'object' && !Array.isArray (byTimeframe)) {
            for (const [ timeframe, candles ] of Object.entries (byTimeframe as Record<string, any>)) {
                add (symbol, timeframe, candles);
            }
        }
    }
}

function buildOhlcvSnapshot (acc: Record<string, Record<string, Map<number, any>>>): any {
    const out: Record<string, any> = {};
    for (const [ symbol, byTimeframe ] of Object.entries (acc)) {
        out[symbol] = {};
        for (const [ timeframe, byTs ] of Object.entries (byTimeframe)) {
            const sorted = [ ...byTs.values () ].sort ((a, b) => a[0] - b[0]);
            out[symbol][timeframe] = sorted.slice (-OHLCV_WINDOW);
        }
    }
    return out;
}

// keep updates small: project to the same fields the fetch* tools return, and cap
// array-valued streams (order book depth, trade/order batches, ohlcv candles)
function trimWatchUpdate (method: string, data: any): any {
    if (data === null || data === undefined) {
        return data;
    }
    const m = method.toLowerCase ();
    if (m.includes ('orderbook')) {
        return trimOrderBook (data);
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
