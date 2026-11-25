import { ToolError, isBenignStreamClose } from '../errors.js';
import { fetchTickerList } from '../tools/common.js';
import { cleanCandles } from '../tools/ui.js';

// The market-data hub behind live views. A view on screen polls the app-only live_update
// tool every few seconds; without the hub every poll would be a REST request to the
// exchange. The hub keeps ONE ccxt.pro stream per (exchange, market type, channel, symbol
// [, timeframe]) and answers every caller's poll from it, so a hundred open charts of
// BTC/USDT 1m cost one WebSocket subscription and no REST requests at all.
//
// - Lease-based: each poll renews its stream's lease; a stream nobody polled for idleMs is
//   closed (unWatch where ccxt supports it; the ccxt.pro instance is closed once it holds no
//   streams). There is no subscribe/unsubscribe API: a view that goes away simply stops
//   renewing.
// - Bounded: at most maxStreams streams in total and maxStreamsPerExchange per exchange. At a
//   cap a poll is answered from REST (through the deployment's own guarded path) instead of
//   opening a stream, and the next poll is pushed further out.
// - Never a side door: stream instances are public (no keys) and separate from the REST
//   instances; REST fallback calls the REST instance the deployment hands in (the hosted
//   server's guarded instance: cache, coalescing, bounded queue, breaker); opening a stream
//   asks the deployment first (admitStream) and stream errors are reported back to it.
// - Self-healing: a stream reconnects with backoff; repeated WebSocket failures on one
//   exchange disable streaming there for a cooldown (polls are served from REST meanwhile).
// - Never fatal: nothing here makes a server unready, and close () stops everything.

export type LiveView = 'chart' | 'orderbook' | 'tickers';
export type LiveSource = 'stream' | 'cache' | 'rest';
export type LiveChannel = 'ohlcv' | 'orderbook' | 'ticker';
export type LiveLogLevel = 'debug' | 'info' | 'warn' | 'error';

export const LIVE_CHART_MAX_UPDATE = 50; // candles returned for an incremental update
export const LIVE_CHART_LATEST = 200; // candles returned when since is missing or too old
// what a REST fallback asks for, whatever the view's depth: 100 is a limit every allowlisted
// venue accepts (some take only fixed values, e.g. 25 or 100), and one value means one shared
// cache entry per symbol on the hosted server instead of one per depth
export const LIVE_BOOK_REST_LIMIT = 100;
export const LIVE_MIN_POLL_MS = 1000;
export const LIVE_MAX_POLL_MS = 30000;

export interface LiveOptions {
    enabled: boolean; // false: never open a stream, every poll is served from REST
    idleMs: number; // a stream with no poll for this long is closed
    maxStreams: number;
    maxStreamsPerExchange: number;
    staleMs: number; // stream data older than this is not served (REST instead)
    streamPollMs: number; // nextPollMs when served from a stream
    restPollMs: number; // nextPollMs when served from REST or the cache (at least)
    maxStreamErrors: number; // consecutive errors after which one stream is given up
    wsFailureThreshold: number; // stream failures on one exchange within wsFailureWindowMs ...
    wsFailureWindowMs: number;
    wsCooldownMs: number; // ... that disable streaming on it for this long
    unsupportedCooldownMs: number; // how long a channel the exchange refused stays on REST
    statsIntervalMs: number; // 0 = no periodic stats line
    sweepIntervalMs: number; // 0 = no timer (tests call sweep ())
}

export const DEFAULT_LIVE_OPTIONS: Readonly<LiveOptions> = Object.freeze ({
    'enabled': true,
    'idleMs': 60000,
    'maxStreams': 200,
    'maxStreamsPerExchange': 50,
    'staleMs': 30000,
    'streamPollMs': 2000,
    'restPollMs': 5000,
    'maxStreamErrors': 5,
    'wsFailureThreshold': 5,
    'wsFailureWindowMs': 120000,
    'wsCooldownMs': 300000,
    'unsupportedCooldownMs': 600000,
    'statsIntervalMs': 60000,
    'sweepIntervalMs': 5000,
});

// What a deployment plugs in. The hub never builds an exchange instance itself.
export interface LiveBackend {
    // a NEW public ccxt.pro instance for (exchange, market type): no keys, markets already set
    // (shared from `rest`, never loaded over the network), newUpdates off. undefined when the
    // exchange has no WebSocket implementation
    openStreamInstance: (exchangeId: string, marketType: string | undefined, rest: any) => Promise<any | undefined> | any | undefined;
    // asked before every stream open; a string is the reason it is refused (breaker open,
    // too many opens on this exchange). Stream opens are upstream work too
    admitStream?: (exchangeId: string) => string | undefined;
    // every stream error, so the deployment can feed its breaker
    reportStreamError?: (exchangeId: string, error: any) => void;
    // after a REST fallback answered: whether it came from the deployment's response cache
    restSource?: () => LiveSource;
    // the poll interval a REST-served view should not go below (e.g. the cache TTL)
    restPollMs?: (view: LiveView, exchangeId: string, timeframe: string | undefined, rest: any) => number;
    // >= 1 when the exchange is under pressure (queued upstream work, breaker), stretching polls
    loadFactor?: (exchangeId: string) => number;
    log?: (level: LiveLogLevel, message: string, attributes?: Record<string, unknown>) => void;
}

export interface LiveRequest {
    view: LiveView;
    exchangeId: string;
    marketType?: string;
    symbol?: string;
    symbols?: string[];
    timeframe?: string;
    since?: number;
    depth?: number;
}

export interface LiveServed {
    source: LiveSource;
    asOf: number;
    nextPollMs: number;
    candles?: number[][];
    book?: { bids: any[][], asks: any[][], timestamp: number | undefined, symbol: string };
    tickers?: Record<string, any>;
}

type FallbackReason = 'off' | 'opening' | 'cap' | 'disabled' | 'unsupported' | 'refused' | 'stale' | 'uncovered' | 'nows' | 'closed';

interface Instance {
    key: string;
    exchangeId: string;
    marketType: string | undefined;
    promise: Promise<any | undefined>;
    exchange: any;
    streams: Set<string>;
    closing: boolean;
}

interface Stream {
    key: string;
    exchangeId: string;
    marketType: string | undefined;
    channel: LiveChannel;
    symbol: string;
    timeframe: string | undefined;
    instance: Instance;
    active: boolean;
    data: any;
    updatedAt: number | undefined;
    openedAt: number;
    leaseUntil: number;
    errors: number;
    wake: (() => void) | undefined;
    stopped: Promise<void>;
    stop: () => void;
}

export interface LiveStats {
    streams: number;
    streamsByExchange: Record<string, number>;
    instances: number;
    polls: Record<LiveSource, number>;
    fallbacks: Partial<Record<FallbackReason, number>>;
    opened: number;
    closedIdle: number;
    streamErrors: number;
    disabledExchanges: string[];
}

const WATCH_METHODS: Record<LiveChannel, string> = { 'ohlcv': 'watchOHLCV', 'orderbook': 'watchOrderBook', 'ticker': 'watchTicker' };
const UNWATCH_METHODS: Record<LiveChannel, string> = { 'ohlcv': 'unWatchOHLCV', 'orderbook': 'unWatchOrderBook', 'ticker': 'unWatchTicker' };

// errors that say "this exchange will not stream this channel/symbol/timeframe this way":
// coinbase streams 5m candles only, some venues want credentials for a channel. They are not
// WebSocket failures — the channel goes to REST for a while, the exchange keeps streaming
const UNSUPPORTED = /NotSupported|BadSymbol|BadRequest|ArgumentsRequired|AuthenticationError|PermissionDenied|InvalidOrder/;

export function timeframeMs (timeframe: string | undefined): number | undefined {
    const match = /^([1-9][0-9]{0,3})([smhdwMy])$/.exec (String (timeframe ?? ''));
    if (match === null) {
        return undefined;
    }
    const units: Record<string, number> = { 's': 1000, 'm': 60000, 'h': 3600000, 'd': 86400000, 'w': 604800000, 'M': 2592000000, 'y': 31536000000 };
    return Number (match[1]) * units[match[2]];
}

function errorName (error: any): string {
    return String (error?.constructor?.name ?? error?.name ?? 'Error');
}

function clamp (value: number, min: number, max: number): number {
    return Math.min (max, Math.max (min, value));
}

// the candles a chart that holds everything up to `since` needs next: every candle from
// `since` on (its open candle is replaced, newer ones appended), at most LIVE_CHART_MAX_UPDATE.
// undefined when `rows` cannot answer that (a gap before `since`, or not enough history)
export function selectCandles (rows: number[][], since: number | undefined, frameMs: number | undefined, now: number): number[][] | undefined {
    const latest = (): number[][] | undefined => ((rows.length >= LIVE_CHART_LATEST) ? rows.slice (-LIVE_CHART_LATEST) : undefined);
    if (since === undefined || sinceTooOld (since, frameMs, now)) {
        return latest ();
    }
    if (rows.length === 0 || rows[0][0] > since) {
        return undefined; // the rows start after the view's last candle: a gap only REST can fill
    }
    const fresh = rows.filter ((row) => row[0] >= since);
    if (fresh.length > LIVE_CHART_MAX_UPDATE) {
        return latest ();
    }
    return fresh;
}

export function sinceTooOld (since: number, frameMs: number | undefined, now: number): boolean {
    return frameMs !== undefined && (now - since) >= LIVE_CHART_MAX_UPDATE * frameMs;
}

export class LiveHub {
    private options: LiveOptions;
    private backend: LiveBackend;
    private now: () => number;
    private streams = new Map<string, Stream> ();
    private instances = new Map<string, Instance> ();
    private disabledUntil = new Map<string, number> ();
    private failures = new Map<string, number[]> ();
    private unsupported = new Map<string, number> ();
    private sweepTimer: ReturnType<typeof setInterval> | undefined;
    private statsTimer: ReturnType<typeof setInterval> | undefined;
    private closed = false;
    private counters = {
        'polls': { 'stream': 0, 'cache': 0, 'rest': 0 } as Record<LiveSource, number>,
        'fallbacks': {} as Partial<Record<FallbackReason, number>>,
        'opened': 0,
        'closedIdle': 0,
        'streamErrors': 0,
    };
    private reported = 0; // polls counted by the last stats line

    constructor (backend: LiveBackend, options: Partial<LiveOptions> = {}, now: () => number = Date.now) {
        this.backend = backend;
        this.options = { ...DEFAULT_LIVE_OPTIONS, ...options };
        this.now = now;
        if (this.options.sweepIntervalMs > 0) {
            this.sweepTimer = setInterval (() => this.sweep (), this.options.sweepIntervalMs);
            this.sweepTimer.unref?.();
        }
        if (this.options.statsIntervalMs > 0) {
            this.statsTimer = setInterval (() => this.logStats (), this.options.statsIntervalMs);
            this.statsTimer.unref?.();
        }
    }

    get settings (): Readonly<LiveOptions> {
        return this.options;
    }

    // ---- the one entry point: answer a poll ----

    // `rest` is the deployment's REST instance for (exchange, market type), already resolved
    // and validated by the caller (allowlist, warm markets, symbol, timeframe)
    async serve (request: LiveRequest, rest: any): Promise<LiveServed> {
        if (request.view === 'chart') {
            return this.serveChart (request, rest);
        }
        if (request.view === 'orderbook') {
            return this.serveBook (request, rest);
        }
        return this.serveTickers (request, rest);
    }

    private async serveChart (request: LiveRequest, rest: any): Promise<LiveServed> {
        const symbol = String (request.symbol);
        const timeframe = String (request.timeframe);
        const frameMs = timeframeMs (timeframe) ?? safeParseTimeframe (rest, timeframe);
        const lease = this.lease (request, 'ohlcv', symbol, timeframe, rest);
        const now = this.now ();
        if (lease.stream !== undefined) {
            const rows = cleanCandles (Array.isArray (lease.stream.data) ? lease.stream.data : []);
            const selected = selectCandles (rows, request.since, frameMs, now);
            if (selected !== undefined) {
                return this.served ('stream', lease.stream.updatedAt ?? now, request, timeframe, rest, false, { 'candles': selected });
            }
            this.countFallback ('uncovered');
        }
        const latest = request.since === undefined || sinceTooOld (request.since, frameMs, now);
        const pick = (data: any): number[][] => {
            const cleaned = cleanCandles (Array.isArray (data) ? data : []);
            return latest ? cleaned.slice (-LIVE_CHART_LATEST) : cleaned.filter ((row) => row[0] >= (request.since as number)).slice (-LIVE_CHART_MAX_UPDATE);
        };
        const rows = await this.rest<any[]> (() => rest.fetchOHLCV (symbol, timeframe, latest ? undefined : request.since, latest ? LIVE_CHART_LATEST : LIVE_CHART_MAX_UPDATE), lease, request.exchangeId);
        if (rows === undefined) {
            return this.servedStale (lease, request, timeframe, rest, (data) => ({ 'candles': pick (data) }));
        }
        const candles = pick (rows);
        return this.served (this.restSource (), this.now (), request, timeframe, rest, lease.atCap, { candles });
    }

    private async serveBook (request: LiveRequest, rest: any): Promise<LiveServed> {
        const symbol = String (request.symbol);
        const depth = request.depth as number;
        const lease = this.lease (request, 'orderbook', symbol, undefined, rest);
        const shape = (book: any) => ({
            'book': {
                symbol,
                'bids': (book?.bids ?? []).slice (0, depth),
                'asks': (book?.asks ?? []).slice (0, depth),
                'timestamp': (typeof book?.timestamp === 'number') ? book.timestamp : undefined,
            },
        });
        if (lease.stream !== undefined) {
            return this.served ('stream', lease.stream.updatedAt ?? this.now (), request, undefined, rest, false, shape (lease.stream.data));
        }
        const book = await this.rest (() => rest.fetchOrderBook (symbol, LIVE_BOOK_REST_LIMIT), lease, request.exchangeId);
        if (book === undefined) {
            return this.servedStale (lease, request, undefined, rest, shape);
        }
        return this.served (this.restSource (), this.now (), request, undefined, rest, lease.atCap, shape (book));
    }

    private async serveTickers (request: LiveRequest, rest: any): Promise<LiveServed> {
        const symbols = [ ...new Set (request.symbols ?? []) ];
        const tickers: Record<string, any> = {};
        const missing: string[] = [];
        let atCap = false;
        let oldest: number | undefined;
        let failure: any;
        const leases = symbols.map ((symbol) => [ symbol, this.lease (request, 'ticker', symbol, undefined, rest) ] as const);
        for (const [ symbol, lease ] of leases) {
            atCap = atCap || lease.atCap;
            if (lease.stream !== undefined) {
                tickers[symbol] = lease.stream.data;
                const at = lease.stream.updatedAt ?? this.now ();
                oldest = (oldest === undefined) ? at : Math.min (oldest, at);
            } else {
                missing.push (symbol);
            }
        }
        let source: LiveSource = 'stream';
        if (missing.length > 0) {
            try {
                const fetched = await fetchTickerList (rest, missing, {});
                for (const ticker of fetched) {
                    if (typeof ticker?.symbol === 'string' && missing.includes (ticker.symbol)) {
                        tickers[ticker.symbol] = ticker;
                    }
                }
                source = this.restSource ();
                oldest = this.now ();
            } catch (error) {
                failure = error;
                // whatever a stream still holds (stale) is better than nothing
                for (const [ symbol, lease ] of leases) {
                    if (missing.includes (symbol) && lease.stale !== undefined) {
                        tickers[symbol] = lease.stale.data;
                    }
                }
                if (Object.keys (tickers).length === 0) {
                    throw liveError (error, request.exchangeId);
                }
                source = 'stream';
            }
        }
        const served = this.served (source, oldest ?? this.now (), request, undefined, rest, atCap, { tickers });
        if (failure !== undefined) {
            served.nextPollMs = clamp (served.nextPollMs * 2, LIVE_MIN_POLL_MS, LIVE_MAX_POLL_MS);
        }
        return served;
    }

    // a REST call that failed: a stream's last (stale) data is served when there is any,
    // otherwise the error goes to the caller
    private async rest<T> (fetch: () => Promise<T>, lease: Lease, exchangeId: string): Promise<T | undefined> {
        try {
            return await fetch ();
        } catch (error) {
            if (lease.stale !== undefined) {
                return undefined;
            }
            throw liveError (error, exchangeId);
        }
    }

    private servedStale (lease: Lease, request: LiveRequest, timeframe: string | undefined, rest: any, shape: (data: any) => Partial<LiveServed>): LiveServed {
        const stream = lease.stale as Stream;
        const served = this.served ('stream', stream.updatedAt ?? this.now (), request, timeframe, rest, lease.atCap, shape (stream.data));
        served.nextPollMs = clamp (served.nextPollMs * 2, LIVE_MIN_POLL_MS, LIVE_MAX_POLL_MS);
        return served;
    }

    private restSource (): LiveSource {
        return this.backend.restSource?.() ?? 'rest';
    }

    private served (source: LiveSource, asOf: number, request: LiveRequest, timeframe: string | undefined, rest: any, atCap: boolean, body: Partial<LiveServed>): LiveServed {
        this.counters.polls[source] += 1;
        return { source, asOf, 'nextPollMs': this.pollMs (source, request, timeframe, rest, atCap), ...body };
    }

    // the cadence the view is told to keep. Streams: the stream default. REST/cache: at
    // least the deployment's floor (its cache TTL), so a poll never forces an exchange call.
    // Longer at a cap, as the caps fill up and while the exchange is under pressure
    private pollMs (source: LiveSource, request: LiveRequest, timeframe: string | undefined, rest: any, atCap: boolean): number {
        let base = (source === 'stream') ? this.options.streamPollMs : Math.max (this.options.restPollMs, this.backend.restPollMs?.(request.view, request.exchangeId, timeframe, rest) ?? 0);
        if (atCap) {
            base *= 2;
        }
        const fill = Math.max (this.streams.size / Math.max (1, this.options.maxStreams), this.countFor (request.exchangeId) / Math.max (1, this.options.maxStreamsPerExchange));
        if (fill >= 0.8) {
            base *= 1.5;
        }
        const load = this.backend.loadFactor?.(request.exchangeId) ?? 1;
        base *= (Number.isFinite (load) && load >= 1) ? load : 1;
        return Math.round (clamp (base, LIVE_MIN_POLL_MS, LIVE_MAX_POLL_MS));
    }

    // ---- streams: lease, open, run, close ----

    private lease (request: LiveRequest, channel: LiveChannel, symbol: string, timeframe: string | undefined, rest: any): Lease {
        const marketType = request.marketType;
        const key = streamKey (request.exchangeId, marketType, channel, symbol, timeframe);
        const now = this.now ();
        const existing = this.streams.get (key);
        if (existing !== undefined) {
            existing.leaseUntil = now + this.options.idleMs;
            if (existing.data !== undefined && existing.updatedAt !== undefined) {
                if (now - existing.updatedAt <= this.options.staleMs) {
                    return { 'stream': existing, 'atCap': false };
                }
                this.countFallback ('stale');
                return { 'stale': existing, 'atCap': false };
            }
            this.countFallback ('opening');
            return { 'atCap': false };
        }
        const refusal = this.refusal (request.exchangeId, marketType, channel, timeframe);
        if (refusal !== undefined) {
            this.countFallback (refusal);
            return { 'atCap': refusal === 'cap' };
        }
        const admitted = this.backend.admitStream?.(request.exchangeId);
        if (admitted !== undefined) {
            this.countFallback ('refused');
            return { 'atCap': true };
        }
        this.open (key, request.exchangeId, marketType, channel, symbol, timeframe, rest);
        this.countFallback ('opening');
        return { 'atCap': false };
    }

    private refusal (exchangeId: string, marketType: string | undefined, channel: LiveChannel, timeframe: string | undefined): FallbackReason | undefined {
        if (this.closed) {
            return 'closed';
        }
        if (!this.options.enabled) {
            return 'off';
        }
        const now = this.now ();
        const disabled = this.disabledUntil.get (exchangeId);
        if (disabled !== undefined) {
            if (disabled > now) {
                return 'disabled';
            }
            this.disabledUntil.delete (exchangeId);
        }
        const unsupportedKey = channelKey (exchangeId, marketType, channel, timeframe);
        const until = this.unsupported.get (unsupportedKey);
        if (until !== undefined) {
            if (until > now) {
                return 'unsupported';
            }
            this.unsupported.delete (unsupportedKey);
        }
        if (this.streams.size >= this.options.maxStreams || this.countFor (exchangeId) >= this.options.maxStreamsPerExchange) {
            return 'cap';
        }
        return undefined;
    }

    private countFor (exchangeId: string): number {
        let count = 0;
        for (const stream of this.streams.values ()) {
            if (stream.exchangeId === exchangeId) {
                count += 1;
            }
        }
        return count;
    }

    private instanceFor (exchangeId: string, marketType: string | undefined, rest: any): Instance {
        const key = exchangeId + '|' + (marketType ?? 'default');
        let instance = this.instances.get (key);
        if (instance === undefined || instance.closing) {
            const created: Instance = { key, exchangeId, marketType, 'promise': Promise.resolve (undefined), 'exchange': undefined, 'streams': new Set (), 'closing': false };
            created.promise = (async () => {
                const exchange = await this.backend.openStreamInstance (exchangeId, marketType, rest);
                created.exchange = exchange;
                if (created.closing && exchange !== undefined) {
                    void closeQuietly (exchange);
                }
                return exchange;
            }) ();
            created.promise.catch (() => undefined);
            this.instances.set (key, created);
            instance = created;
        }
        return instance;
    }

    private open (key: string, exchangeId: string, marketType: string | undefined, channel: LiveChannel, symbol: string, timeframe: string | undefined, rest: any): void {
        const instance = this.instanceFor (exchangeId, marketType, rest);
        let stop!: () => void;
        const stopped = new Promise<void> ((resolve) => {
            stop = resolve;
        });
        const now = this.now ();
        const stream: Stream = {
            key, exchangeId, marketType, channel, symbol, timeframe, instance,
            'active': true,
            'data': undefined,
            'updatedAt': undefined,
            'openedAt': now,
            'leaseUntil': now + this.options.idleMs,
            'errors': 0,
            'wake': undefined,
            stopped,
            stop,
        };
        this.streams.set (key, stream);
        instance.streams.add (key);
        this.counters.opened += 1;
        this.log ('debug', 'live stream opened', { 'exchange': exchangeId, channel, 'streams': this.streams.size });
        void this.run (stream);
    }

    private async run (stream: Stream): Promise<void> {
        let exchange: any;
        try {
            exchange = await stream.instance.promise;
        } catch (error) {
            this.onStreamError (stream, error, true);
            this.closeStream (stream, 'failed');
            return;
        }
        const method = WATCH_METHODS[stream.channel];
        if (exchange === undefined || exchange.has?.[method] !== true || typeof exchange[method] !== 'function') {
            this.markUnsupported (stream);
            this.countFallback ('nows');
            this.closeStream (stream, 'unsupported');
            return;
        }
        void stream.stopped.then (() => stream.wake?.());
        while (stream.active) {
            let value: any;
            try {
                const tick = Promise.resolve ((stream.channel === 'ohlcv') ? exchange[method] (stream.symbol, stream.timeframe) : exchange[method] (stream.symbol));
                // a stop wins the race; the abandoned watch future may reject later (socket closed)
                tick.catch (() => undefined);
                value = await new Promise ((resolve, reject) => {
                    stream.wake = () => resolve (STOPPED);
                    tick.then (resolve, reject);
                });
                stream.wake = undefined;
            } catch (error) {
                stream.wake = undefined;
                if (!stream.active) {
                    break;
                }
                if (UNSUPPORTED.test (errorName (error))) {
                    this.markUnsupported (stream);
                    this.closeStream (stream, 'unsupported');
                    break;
                }
                this.onStreamError (stream, error, false);
                if (!stream.active) {
                    break; // the failure disabled the exchange and closed this stream
                }
                stream.errors += 1;
                if (stream.errors >= this.options.maxStreamErrors) {
                    this.closeStream (stream, 'failed');
                    break;
                }
                // reconnect with backoff; a stop wakes it at once
                await new Promise<void> ((resolve) => {
                    stream.wake = resolve;
                    const timer = setTimeout (resolve, Math.min (30000, 500 * Math.pow (2, stream.errors)));
                    timer.unref?.();
                });
                stream.wake = undefined;
                continue;
            }
            if (value === STOPPED || !stream.active) {
                break;
            }
            stream.data = value;
            stream.updatedAt = this.now ();
            stream.errors = 0;
        }
    }

    private onStreamError (stream: Stream, error: any, opening: boolean): void {
        if (this.closed || (isBenignStreamClose (error) && !stream.active)) {
            return;
        }
        this.counters.streamErrors += 1;
        try {
            this.backend.reportStreamError?.(stream.exchangeId, error);
        } catch (e) {
            // the deployment's bookkeeping must not break the stream loop
        }
        this.log ('debug', 'live stream error', { 'exchange': stream.exchangeId, 'channel': stream.channel, 'error': errorName (error), opening });
        const now = this.now ();
        const recent = (this.failures.get (stream.exchangeId) ?? []).filter ((at) => at > now - this.options.wsFailureWindowMs);
        recent.push (now);
        this.failures.set (stream.exchangeId, recent);
        if (recent.length >= this.options.wsFailureThreshold) {
            this.disable (stream.exchangeId);
        }
    }

    // repeated WebSocket failures: no streams on this exchange for a cooldown; polls go to REST
    private disable (exchangeId: string): void {
        this.disabledUntil.set (exchangeId, this.now () + this.options.wsCooldownMs);
        this.failures.delete (exchangeId);
        this.log ('warn', 'live streaming paused for an exchange after repeated WebSocket failures', { 'exchange': exchangeId, 'cooldownMs': this.options.wsCooldownMs });
        for (const stream of [ ...this.streams.values () ]) {
            if (stream.exchangeId === exchangeId) {
                this.closeStream (stream, 'disabled');
            }
        }
    }

    private markUnsupported (stream: Stream): void {
        this.unsupported.set (channelKey (stream.exchangeId, stream.marketType, stream.channel, stream.timeframe), this.now () + this.options.unsupportedCooldownMs);
    }

    private closeStream (stream: Stream, reason: string): void {
        if (!stream.active) {
            return;
        }
        stream.active = false;
        stream.stop ();
        if (this.streams.get (stream.key) === stream) {
            this.streams.delete (stream.key);
        }
        const instance = stream.instance;
        instance.streams.delete (stream.key);
        this.log ('debug', 'live stream closed', { 'exchange': stream.exchangeId, 'channel': stream.channel, reason, 'streams': this.streams.size });
        const exchange = instance.exchange;
        if (instance.streams.size === 0) {
            // nothing left on this instance: closing it ends every subscription and socket
            instance.closing = true;
            if (this.instances.get (instance.key) === instance) {
                this.instances.delete (instance.key);
            }
            if (exchange !== undefined) {
                void closeQuietly (exchange);
            }
            return;
        }
        // others still use the instance: unsubscribe this one channel where ccxt can
        const unwatch = UNWATCH_METHODS[stream.channel];
        if (exchange !== undefined && exchange.has?.[unwatch] === true && typeof exchange[unwatch] === 'function') {
            try {
                const args = (stream.channel === 'ohlcv') ? [ stream.symbol, stream.timeframe ] : [ stream.symbol ];
                void Promise.resolve (exchange[unwatch] (...args)).catch (() => undefined);
            } catch (e) {
                // best effort
            }
        }
    }

    // closes every stream whose lease ran out; the timer calls it, tests call it directly
    sweep (): number {
        const now = this.now ();
        let closed = 0;
        for (const stream of [ ...this.streams.values () ]) {
            if (stream.leaseUntil <= now) {
                this.closeStream (stream, 'idle');
                this.counters.closedIdle += 1;
                closed += 1;
            }
        }
        return closed;
    }

    // ---- reporting and shutdown ----

    stats (): LiveStats {
        const byExchange: Record<string, number> = {};
        for (const stream of this.streams.values ()) {
            byExchange[stream.exchangeId] = (byExchange[stream.exchangeId] ?? 0) + 1;
        }
        const now = this.now ();
        return {
            'streams': this.streams.size,
            'streamsByExchange': byExchange,
            'instances': this.instances.size,
            'polls': { ...this.counters.polls },
            'fallbacks': { ...this.counters.fallbacks },
            'opened': this.counters.opened,
            'closedIdle': this.counters.closedIdle,
            'streamErrors': this.counters.streamErrors,
            'disabledExchanges': [ ...this.disabledUntil.entries () ].filter (([ , until ]) => until > now).map (([ id ]) => id).sort (),
        };
    }

    // one line per interval while there is anything to report (open streams or new polls)
    logStats (): void {
        const stats = this.stats ();
        const polls = stats.polls.stream + stats.polls.cache + stats.polls.rest;
        if (stats.streams === 0 && polls === this.reported) {
            return;
        }
        this.reported = polls;
        this.log ('info', 'live hub stats', {
            'streams': stats.streams,
            'streams_by_exchange': Object.entries (stats.streamsByExchange).map (([ id, count ]) => id + ':' + count).join (','),
            'instances': stats.instances,
            'polls_stream': stats.polls.stream,
            'polls_cache': stats.polls.cache,
            'polls_rest': stats.polls.rest,
            'fallbacks': Object.entries (stats.fallbacks).map (([ reason, count ]) => reason + ':' + count).join (','),
            'opened': stats.opened,
            'closed_idle': stats.closedIdle,
            'stream_errors': stats.streamErrors,
            'disabled_exchanges': stats.disabledExchanges.join (','),
        });
    }

    async close (): Promise<void> {
        if (this.closed) {
            return;
        }
        this.closed = true;
        if (this.sweepTimer !== undefined) {
            clearInterval (this.sweepTimer);
        }
        if (this.statsTimer !== undefined) {
            clearInterval (this.statsTimer);
        }
        for (const stream of [ ...this.streams.values () ]) {
            this.closeStream (stream, 'shutdown');
        }
        const pending = [ ...this.instances.values () ];
        this.instances.clear ();
        await Promise.race ([
            Promise.allSettled (pending.map (async (instance) => {
                instance.closing = true;
                const exchange = await instance.promise.catch (() => undefined);
                if (exchange !== undefined) {
                    await closeQuietly (exchange);
                }
            })),
            new Promise ((resolve) => setTimeout (resolve, 5000).unref?.()),
        ]);
    }

    private countFallback (reason: FallbackReason): void {
        this.counters.fallbacks[reason] = (this.counters.fallbacks[reason] ?? 0) + 1;
    }

    private log (level: LiveLogLevel, message: string, attributes?: Record<string, unknown>): void {
        try {
            this.backend.log?.(level, message, attributes);
        } catch (e) {
            // logging never breaks the hub
        }
    }
}

interface Lease {
    stream?: Stream; // fresh data to serve
    stale?: Stream; // a stream whose data is old: served only when REST fails too
    atCap: boolean; // a stream could not be opened for capacity reasons
}

const STOPPED = Symbol ('stopped');

function streamKey (exchangeId: string, marketType: string | undefined, channel: LiveChannel, symbol: string, timeframe: string | undefined): string {
    return JSON.stringify ([ exchangeId, marketType ?? 'default', channel, symbol, timeframe ?? '' ]);
}

function channelKey (exchangeId: string, marketType: string | undefined, channel: LiveChannel, timeframe: string | undefined): string {
    return JSON.stringify ([ exchangeId, marketType ?? 'default', channel, timeframe ?? '' ]);
}

function safeParseTimeframe (exchange: any, timeframe: string): number | undefined {
    try {
        const seconds = Number (exchange?.parseTimeframe?.(timeframe));
        return (Number.isFinite (seconds) && seconds > 0) ? seconds * 1000 : undefined;
    } catch (e) {
        return undefined;
    }
}

// A REST fallback that failed. Errors that already say what to do (the hosted guard's
// RATE_LIMITED / EXCHANGE_UNAVAILABLE / TIMEOUT, BAD_SYMBOL, ...) pass through; anything else
// means neither a stream nor REST could serve this poll
export function liveError (error: any, exchangeId: string): any {
    if (error instanceof ToolError) {
        return error;
    }
    const name = errorName (error);
    if (/BadSymbol|RateLimitExceeded|DDoSProtection|RequestTimeout/.test (name)) {
        return error; // mapped by the tool wrapper (BAD_SYMBOL, RATE_LIMITED, TIMEOUT)
    }
    return new ToolError ('LIVE_UNAVAILABLE', 'no live data for this view right now: ' + exchangeId + ' could be reached neither over its WebSocket stream nor over REST', {
        'retryable': true,
        'hint': 'the view keeps its last data and retries; nothing for the model to do',
        'retryAfterSeconds': 10,
    });
}

async function closeQuietly (exchange: any): Promise<void> {
    try {
        if (exchange && typeof exchange.close === 'function') {
            await exchange.close ();
        }
    } catch (e) {
        // shutdown path
    }
}

