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
const DEAD_TOMBSTONES_MAX = 100;    // cap on retained failure records for reaped streams
const MAX_CONSECUTIVE_ERRORS = 5;   // give up a stream after this many back-to-back errors
const WAIT_DEFAULT_MS = 25 * 1000;  // default block for waitForChange
const WAIT_MAX_MS = 55 * 1000;      // clamp — stay under typical host tool-call timeouts

const PRIVATE_STREAM_RE = /^watch(Orders|MyTrades|MyLiquidations|Balance|Positions)/;
// STATE = a watch* whose value is the CURRENT STATE of something (a snapshot the agent reads
// on demand), as opposed to a log of discrete events. All snapshot streams keep a merged
// accumulator so watch_read always returns the full current set; see accumulate() for how
// each shape (single object / symbol-keyed dict / positions array / candle window) is merged.
const STATE_STREAM_RE = /^watch(Ticker|Tickers|OrderBook|OrderBookForSymbols|OHLCV|OHLCVForSymbols|Balance|Positions|BidsAsks|MarkPrice|MarkPrices|FundingRate|FundingRates)$/;
// watch methods that MUST get a single symbol as their first arg — subscribing one without a
// symbol produces a stream that can never yield data (a silent zombie), so we reject it up front
const SYMBOL_REQUIRED_RE = /^watch(Ticker|OrderBook|Trades|OHLCV)$/;
// watch methods whose first arg is a LIST of symbols rather than a single symbol
const SYMBOL_LIST_RE = /^watch(.+ForSymbols|Tickers|BidsAsks|MarkPrices|FundingRates|Positions)$/;

// Map the convenience symbol/symbols fields to the positional args ccxt expects. Single-symbol
// methods take a string first arg; list methods take an array first arg.
function foldSymbolArgs (method: string, symbol: string | undefined, symbols: string[] | undefined): any[] {
    // watchOHLCVForSymbols takes [[symbol, timeframe], …] pairs, not a flat symbol list — the
    // symbol/symbols shortcut can't express that shape, so require explicit args for it
    if (/^watchOHLCVForSymbols$/.test (method)) {
        return [];
    }
    const isList = SYMBOL_LIST_RE.test (method);
    if (symbols !== undefined && symbols.length > 0) {
        return isList ? [ symbols ] : [ symbols[0] ];
    }
    if (symbol !== undefined && symbol !== '') {
        return isList ? [ [ symbol ] ] : [ symbol ];
    }
    return [];
}

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
    private deadRetentionMs: number;
    private subs = new Map<string, Subscription> ();
    // tombstones for streams reaped AFTER their retention window, so a late watch_read still
    // gets the real failure (SUBSCRIPTION_FAILED) instead of a misleading "not found / idle" —
    // bounded so it can't grow without bound
    private deadErrors = new Map<string, StreamError> ();
    // reserved counts in-flight subscribe() calls that passed the cap check but aren't yet
    // in `subs` — closes the check-then-act gap across the acquire await
    private reserved = 0;

    constructor (pools: any, maxSubscriptions = 0, deadRetentionMs = IDLE_TTL_MS) {
        this.pools = pools;
        // 0 = no limit (the default); a positive value is an optional runaway backstop
        this.maxSubscriptions = maxSubscriptions;
        // how long an errored stream is retained (listable, readable with its error) before it
        // is reaped — defaults to the idle TTL so a dead stream doesn't vanish minutes after it
        // died and confuse watch_read into reporting "idle-expired"
        this.deadRetentionMs = deadRetentionMs;
    }

    async subscribe (opts: { exchangeId: string, method: string, args?: (string | number | boolean | null)[], symbol?: string, symbols?: string[], account?: string, marketType?: string, prediction?: boolean, params?: Record<string, any> }): Promise<any> {
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
            // accept the natural symbol/symbols fields as aliases for the positional args when
            // no args were given, so a mis-named symbol key can't create a no-data stream
            let rawArgs: any[] = opts.args ?? [];
            if (rawArgs.length === 0) {
                rawArgs = foldSymbolArgs (method, opts.symbol, opts.symbols);
            }
            let args: any[];
            try {
                args = this.buildWatchArgs (exchange, method, rawArgs, params);
            } catch (e) {
                release ();
                throw e;
            }
            // fail fast: a symbol-required stream with no symbol would poll empty forever
            if (SYMBOL_REQUIRED_RE.test (method) && (typeof args[0] !== 'string' || args[0] === '')) {
                release ();
                throw new StreamArgError (method + ' needs a symbol', 'pass the unified symbol in args, e.g. args: ["BTC/USDT"] (or set the "symbol" field); resolve it with search_markets');
            }
            const argsKey = JSON.stringify (args);
            // idempotent: an identical active stream already exists — reuse it instead of
            // opening a duplicate socket (a fresh cursor still works, the buffer is shared)
            const existing = this.findActive (exchange.id, method, argsKey, opts.account, streamKey);
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

    read (id: string, cursor?: number, depth?: number): any {
        const sub = this.subs.get (id);
        if (sub === undefined) {
            // reaped long after it failed — surface the real error, not a "not found / idle" guess
            const tombstone = this.deadErrors.get (id);
            if (tombstone !== undefined) {
                return { 'found': false, 'failed': true, 'error': tombstone };
            }
            return { 'found': false };
        }
        return this.readSub (sub, cursor, depth);
    }

    // reads a subscription record directly — works even after it has been removed from the
    // map (a waitForChange parked reader woken by unsubscribe/idle still gets a terminal read)
    private readSub (sub: Subscription, cursor?: number, depth?: number): any {
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
            // materialize the current snapshot lazily (projection/sort paid at read, not per tick)
            const updatesSinceRead = sub.seq - sub.lastReadSeq;
            sub.lastReadSeq = sub.seq;
            common['updatesSinceRead'] = updatesSinceRead;
            common['latest'] = buildSnapshot (sub, depth ?? 20);
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
    async readWaiting (id: string, cursor?: number, waitForChange = false, timeoutMs?: number, depth?: number): Promise<any> {
        const sub = this.subs.get (id);
        if (sub === undefined) {
            return this.read (id, cursor, depth); // tombstone-aware (SUBSCRIPTION_FAILED vs not-found)
        }
        let timedOut = false;
        if (waitForChange && sub.active && !this.hasNewSince (sub, cursor)) {
            timedOut = !(await this.waitForUpdate (sub, timeoutMs));
        }
        // read the captured sub directly: if it was stopped (unsubscribe/idle) while we were
        // parked, the agent still gets a terminal read (active:false + last state) not "not found"
        const result = this.readSub (sub, cursor, depth);
        if (waitForChange) {
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
            const waiter = () => done (true);
            const done = (changed: boolean) => {
                if (settled) {
                    return;
                }
                settled = true;
                clearTimeout (timer);
                // drop our own waiter so a quiet-but-polled stream doesn't accumulate dead
                // closures between ticks (notifyWaiters only drains on an actual update/stop)
                const i = sub.waiters.indexOf (waiter);
                if (i !== -1) {
                    sub.waiters.splice (i, 1);
                }
                resolve (changed);
            };
            sub.waiters.push (waiter);
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

    private findActive (exchangeId: string, method: string, argsKey: string, account: string | undefined, streamKey: string | undefined): Subscription | undefined {
        for (const sub of this.subs.values ()) {
            // streamKey encodes the pool namespace (exchange|marketType|prediction) for public
            // streams, so it distinguishes spot vs swap and prediction vs regular — which are
            // NOT reflected in args; without it an identical-args re-subscribe on a different
            // marketType/prediction would wrongly reuse the first stream
            if (sub.active && sub.exchangeId === exchangeId && sub.method === method && sub.argsKey === argsKey && sub.account === account && sub.streamKey === streamKey) {
                return sub;
            }
        }
        return undefined;
    }

    private otherActiveSharesStream (sub: Subscription): boolean {
        for (const other of this.subs.values ()) {
            // match on account+method only (ignore args): unWatch<Method> on a shared account
            // instance can tear down the whole channel, disrupting a sibling subscription on the
            // same method with different args — so skip unWatch while any such sibling is active
            if (other.id !== sub.id && other.active && other.account === sub.account && other.method === sub.method) {
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
        // leave a tombstone for an errored stream so a later read is honest about WHY it's gone
        if (sub.error !== undefined) {
            if (this.deadErrors.size >= DEAD_TOMBSTONES_MAX) {
                this.deadErrors.delete (this.deadErrors.keys ().next ().value as string);
            }
            this.deadErrors.set (sub.id, sub.error);
        }
        this.subs.delete (sub.id);
        if (wasActive) {
            this.releaseTransport (sub);
        }
    }

    private async runLoop (sub: Subscription): Promise<void> {
        // Attach exactly ONE reaction to the persistent stopPromise for the whole loop and let
        // it wake whichever per-iteration wait is in flight. Racing stopPromise on every tick
        // would append a reaction to it per tick — an O(ticks) closure leak on a long-lived
        // high-frequency stream (the biggest per-subscription memory sink otherwise).
        let wake: (() => void) | undefined;
        void sub.stopPromise.then (() => { if (wake !== undefined) { wake (); } });
        while (sub.active) {
            let result: any;
            try {
                const tick = Promise.resolve (sub.exchange[sub.method] (...sub.args));
                result = await new Promise ((resolve, reject) => {
                    wake = () => resolve (sub.stopSentinel);
                    tick.then (resolve, reject);
                });
                wake = undefined;
            } catch (e: any) {
                wake = undefined;
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
                    sub.timer = this.armTimer (() => this.stopSub (sub), this.deadRetentionMs);
                    break;
                }
                // interruptible backoff — a stop wakes it immediately instead of blocking up to 30s
                await new Promise<void> ((resolve) => {
                    wake = resolve;
                    const t = setTimeout (resolve, Math.min (30000, 500 * Math.pow (2, sub.consecutiveErrors)));
                    if (typeof (t as any).unref === 'function') {
                        (t as any).unref ();
                    }
                });
                wake = undefined;
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
                // O(delta) merge only; the full snapshot is materialized lazily at read time
                mergeDelta (sub, result);
                sub.latest = { 'seq': sub.seq, 'ts': sub.lastUpdateAt, 'data': undefined };
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
        if (sub.waiters.length === 0) {
            return; // hot path: no allocation when nobody is blocked (the common case)
        }
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

// bidsAsks tickers carry the top-of-book SIZES too — the whole point of the stream — which
// TICKER_FIELDS omits, so add them for that method.
const BIDSASKS_FIELDS = [ ...TICKER_FIELDS, 'bidVolume', 'askVolume' ];

// Merge a state stream's latest delta into its accumulator. CHEAP — runs on every socket
// tick. Stores raw ccxt objects BY REFERENCE (ccxt.pro already retains them in its own
// cache), so per-tick cost is O(delta), not O(full snapshot). The expensive projection/sort
// happens lazily in buildSnapshot() at read time, which is far rarer than ticks on a fast
// stream. Never overwrites the accumulator with a partial subset — that was the blocker.
function mergeDelta (sub: Subscription, result: any): void {
    const strategy = sub.strategy;
    if (strategy === 'replace' || strategy === undefined) {
        // the watch* return is already the whole object (single ticker/book/balance)
        sub.accumulator = result;
        return;
    }
    if (sub.accumulator === undefined) {
        sub.accumulator = {};
    }
    if (strategy === 'mergeDict') {
        // { symbol: item } delta — keep every subscribed symbol, refresh the ones that ticked
        const entries = Array.isArray (result) ? result.map ((t: any) => [ t?.symbol, t ]) : Object.entries (result ?? {});
        for (const [ symbol, item ] of entries) {
            if (symbol !== undefined && symbol !== null) {
                sub.accumulator[symbol] = item;
            }
        }
        return;
    }
    if (strategy === 'mergeBook') {
        // one order book per tick (…ForSymbols) — key by its own symbol
        const books = Array.isArray (result) ? result : [ result ];
        for (const book of books) {
            if (book !== null && book !== undefined && book.symbol !== undefined) {
                sub.accumulator[book.symbol] = book;
            }
        }
        return;
    }
    if (strategy === 'upsertArray') {
        // positions array delta — upsert by symbol+side (a closed position arrives with
        // contracts=0, which is correct to keep; the agent sees it flatten, not vanish)
        const items = Array.isArray (result) ? result : ((result === null || result === undefined) ? [] : [ result ]);
        for (const item of items) {
            const key = String (item?.symbol ?? '') + '|' + String (item?.side ?? '');
            sub.accumulator[key] = item;
        }
        return;
    }
    // window: merge candles by timestamp into a bounded recent window per (symbol, timeframe)
    // so closed candles are never lost. watchOHLCV returns a flat candle array (keyed here by
    // the subscription's own symbol/timeframe args); watchOHLCVForSymbols returns a nested
    // { symbol: { timeframe: candles } } object.
    mergeOhlcvWindow (sub.accumulator, result, sub.args);
}

// Project the accumulator into the full snapshot returned by watch_read. Runs at READ time
// only, so the projection/sort cost is paid at read frequency, not tick frequency.
function buildSnapshot (sub: Subscription, depth = 20): any {
    const strategy = sub.strategy;
    const acc = sub.accumulator;
    if (acc === undefined) {
        return undefined;
    }
    if (strategy === 'replace' || strategy === undefined) {
        return trimWatchUpdate (sub.method, acc, depth);
    }
    if (strategy === 'mergeDict') {
        const out: Record<string, any> = {};
        for (const [ symbol, item ] of Object.entries (acc)) {
            out[symbol] = projectSnapshotItem (sub.method, item);
        }
        return out;
    }
    if (strategy === 'mergeBook') {
        const out: Record<string, any> = {};
        for (const [ symbol, book ] of Object.entries (acc)) {
            out[symbol] = trimOrderBook (book, depth);
        }
        return out;
    }
    if (strategy === 'upsertArray') {
        return Object.values (acc).map ((p: any) => project (p, POSITION_FIELDS));
    }
    return buildOhlcvSnapshot (acc);
}

// mergeDict serves tickers, bidsAsks, markPrices and fundingRates, whose essential data
// lives in different fields — so project per method rather than forcing every item through
// TICKER_FIELDS (which has no markPrice/fundingRate/bidVolume and would silently blank them).
function projectSnapshotItem (method: string, item: any): any {
    const m = method.toLowerCase ();
    if (m.includes ('bidsask')) {
        return project (item, BIDSASKS_FIELDS);
    }
    if (m.includes ('markprice') || m.includes ('fundingrate')) {
        return stripInfo (item); // value is markPrice/indexPrice/fundingRate/… — keep all unified fields
    }
    return project (item, TICKER_FIELDS);
}

function trimOrderBook (data: any, depth = 20): any {
    const n = Math.max (1, Math.min (100, depth));
    return {
        'symbol': data.symbol,
        'timestamp': data.timestamp,
        'datetime': data.datetime,
        'nonce': data.nonce,
        'bids': (data.bids ?? []).slice (0, n).map ((l: any[]) => [ l[0], l[1] ]),
        'asks': (data.asks ?? []).slice (0, n).map ((l: any[]) => [ l[0], l[1] ]),
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
        // bound the retained window (candles arrive in timestamp order, so the oldest-inserted
        // key is the oldest candle) — the Map, not just the emitted slice, must stay capped
        while (byTs.size > OHLCV_WINDOW) {
            const oldest = byTs.keys ().next ().value;
            if (oldest === undefined) {
                break;
            }
            byTs.delete (oldest);
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
function trimWatchUpdate (method: string, data: any, depth = 20): any {
    if (data === null || data === undefined) {
        return data;
    }
    const m = method.toLowerCase ();
    if (m.includes ('orderbook')) {
        return trimOrderBook (data, depth);
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
