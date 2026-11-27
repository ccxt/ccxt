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
//   Failures are counted per event on an instance, not per stream: one dropped socket rejects
//   every stream on it with the same error, and that is one failure, not one per stream.
// - Refusals are scoped: a symbol the exchange will not stream (BadSymbol, BadRequest) is
//   banned for that stream only; a channel it does not stream at all (NotSupported, no watch
//   method) for the channel. An instance-wide rejection (ccxt rejects every future on the
//   socket when it cannot tell which subscription an error answers) bans only the stream the
//   error names, and the others resubscribe.
// - Channels without unWatch* (kraken tickers, coinbase books ...) cannot unsubscribe one
//   stream: a closed one stays subscribed on the socket. Those abandoned subscriptions count
//   against the caps, and an instance that collects too many is recycled (its live streams
//   move to a fresh instance, the old one is closed with every subscription on it).
// - Per client: where the deployment names the caller (hosted: the rate-limit identity), one
//   client can hold at most maxStreamsPerClient streams alive and open maxOpensPerClientPerMinute;
//   past that its polls are answered from existing streams or REST and renew nothing.
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
    maxStreamsPerClient: number; // streams one named client keeps alive (0 = no per-client quota)
    maxOpensPerClientPerMinute: number; // stream opens one named client may cause per minute
    maxAbandonedPerInstance: number; // subscriptions closed without unWatch before the instance is recycled
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
    'maxStreamsPerClient': 30,
    'maxOpensPerClientPerMinute': 20,
    'maxAbandonedPerInstance': 8,
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
    // a NEW public ccxt.pro instance for (exchange, market type[, prediction class]): no keys,
    // markets already set (shared from `rest`, never loaded over the network), newUpdates off.
    // undefined when the exchange has no WebSocket implementation
    openStreamInstance: (exchangeId: string, marketType: string | undefined, rest: any, prediction: boolean) => Promise<any | undefined> | any | undefined;
    // the caller of the poll being served (hosted: its rate-limit identity), for the
    // per-client quota; undefined = not counted per client (the local server's one user)
    client?: () => string | undefined;
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
    prediction?: boolean; // the prediction-market class of the exchange (local server only)
    client?: string; // overrides backend.client ()
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
    stale?: boolean; // a stream's last data, served because nothing fresher could be had
    candles?: number[][];
    book?: { bids: any[][], asks: any[][], timestamp: number | undefined, symbol: string };
    tickers?: Record<string, any>;
}

type FallbackReason = 'off' | 'opening' | 'cap' | 'disabled' | 'unsupported' | 'banned' | 'inactive' | 'quota' | 'refused' | 'stale' | 'uncovered' | 'shallow' | 'nows' | 'closed';

interface Instance {
    key: string;
    exchangeId: string;
    marketType: string | undefined;
    prediction: boolean;
    rest: any; // what openStreamInstance shared the markets from (a recycle opens from it again)
    promise: Promise<any | undefined>;
    exchange: any;
    streams: Set<string>;
    closing: boolean;
    retired: boolean; // being recycled: no new streams, closed with its last one
    abandoned: number; // streams closed without unWatch: their subscriptions still run on it
    failureOpen: boolean; // a failure of this instance was counted in the current tick
    batches: Map<any, Stream[]>; // per-stream refusals of the current tick, by error object
}

interface Stream {
    key: string;
    exchangeId: string;
    marketType: string | undefined;
    channel: LiveChannel;
    symbol: string;
    timeframe: string | undefined;
    prediction: boolean;
    marketId: string | undefined; // the exchange's id for the symbol (errors name it)
    instance: Instance;
    active: boolean;
    bookLevels: number | undefined; // levels per side of the last REST book of this symbol
    data: any;
    updatedAt: number | undefined;
    openedAt: number;
    sequence: number; // open order (openedAt can tie)
    leaseUntil: number;
    errors: number;
    wake: (() => void) | undefined;
    stopped: Promise<void>;
    stop: () => void;
}

// counters are cumulative since the hub started (the stats line adds per-interval deltas)
export interface LiveStats {
    streams: number;
    streamsByExchange: Record<string, number>;
    abandoned: number; // subscriptions still running on a socket after their stream closed
    instances: number;
    polls: Record<LiveSource, number>;
    pollsFailed: Record<string, number>; // polls answered with an error, by code
    refused: Record<string, number>; // polls the deployment refused before the hub (countRefused)
    fallbacks: Partial<Record<FallbackReason, number>>;
    opened: number;
    closedIdle: number;
    recycled: number;
    unrenewed: number; // polls served from a stream that did not renew it (client over its quota)
    streamErrors: number; // failure events (one per instance and tick, not one per stream)
    disabledExchanges: string[];
}

const WATCH_METHODS: Record<LiveChannel, string> = { 'ohlcv': 'watchOHLCV', 'orderbook': 'watchOrderBook', 'ticker': 'watchTicker' };
const UNWATCH_METHODS: Record<LiveChannel, string> = { 'ohlcv': 'unWatchOHLCV', 'orderbook': 'unWatchOrderBook', 'ticker': 'unWatchTicker' };

// errors that say "this exchange will not stream this way". They are not WebSocket failures.
// The channel ones (coinbase streams 5m candles only, a channel that wants credentials) put
// the whole channel on REST for a while; the stream ones (a listed symbol the WebSocket API
// does not know, an argument it rejects) only that one stream
const CHANNEL_REFUSAL = /NotSupported|ArgumentsRequired|AuthenticationError|PermissionDenied/;
const STREAM_REFUSAL = /BadSymbol|BadRequest|InvalidOrder/;
// REST order-book limits some venues refuse (htx spot takes only 5/10/20/150): asked again
// without a limit
const BOOK_LIMIT_REFUSAL = /^(BadRequest|NotSupported|ArgumentsRequired)$/;

// watchOrderBook limits for venues whose stream otherwise holds fewer levels than a view may
// ask for (kraken: 10 by default, valid 10/25/100/500/1000; bitfinex: 25, valid 25/100).
// Each is a value the venue accepts and at least LIVE_MAX_DEPTH (100). Venues not listed keep
// their default (a full or diff-depth book); some reject any other value (bybit, okx)
export const STREAM_BOOK_LIMITS: Readonly<Record<string, number>> = Object.freeze ({
    'kraken': 100,
    'krakenfutures': 100,
    'bitfinex': 100,
});

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
    private unsupported = new Map<string, number> (); // channelKey -> until
    private banned = new Map<string, number> (); // streamKey -> until
    private counted = new WeakSet<object> (); // error objects already counted as a failure
    private holds = new Map<string, Map<string, number>> (); // client -> streamKey -> until
    private clientOpens = new Map<string, number[]> (); // client -> open times (last minute)
    private sweepTimer: ReturnType<typeof setInterval> | undefined;
    private statsTimer: ReturnType<typeof setInterval> | undefined;
    private closed = false;
    private sequence = 0;
    private counters = {
        'polls': { 'stream': 0, 'cache': 0, 'rest': 0 } as Record<LiveSource, number>,
        'pollsFailed': {} as Record<string, number>,
        'refused': {} as Record<string, number>,
        'fallbacks': {} as Partial<Record<FallbackReason, number>>,
        'opened': 0,
        'closedIdle': 0,
        'recycled': 0,
        'unrenewed': 0,
        'streamErrors': 0,
    };
    private reported = { 'stream': 0, 'cache': 0, 'rest': 0, 'failed': 0, 'refused': 0 }; // totals at the last stats line

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
        let client = request.client;
        if (client === undefined) {
            try {
                client = this.backend.client?.();
            } catch (e) {
                client = undefined;
            }
        }
        const scoped: LiveRequest = { ...request, client };
        try {
            if (scoped.view === 'chart') {
                return await this.serveChart (scoped, rest);
            }
            if (scoped.view === 'orderbook') {
                return await this.serveBook (scoped, rest);
            }
            return await this.serveTickers (scoped, rest);
        } catch (error: any) {
            const code = (error instanceof ToolError) ? error.code : errorName (error);
            this.counters.pollsFailed[code] = (this.counters.pollsFailed[code] ?? 0) + 1;
            throw error;
        }
    }

    // a poll the deployment refused before it reached the hub (its own rate limits), so the
    // stats line accounts for every poll
    countRefused (reason: string): void {
        this.counters.refused[reason] = (this.counters.refused[reason] ?? 0) + 1;
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
        // always the same arguments (the latest LIVE_CHART_LATEST candles), filtered here: a
        // since within LIVE_CHART_MAX_UPDATE frames is inside them, and every caller of one
        // (symbol, timeframe) then shares one cache entry on the hosted server, whatever since
        // it sends — a caller-chosen since would make every poll a distinct upstream request
        const rows = await this.rest<any[]> (() => rest.fetchOHLCV (symbol, timeframe, undefined, LIVE_CHART_LATEST), lease, request.exchangeId);
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
            // a stream book shallower than the book itself (a venue streaming fewer levels than
            // were asked for) would shrink the ladder: REST serves the depth it cannot
            const data = lease.stream.data;
            const held = Math.max (data?.bids?.length ?? 0, data?.asks?.length ?? 0);
            if (held >= Math.min (depth, lease.stream.bookLevels ?? 0)) {
                return this.served ('stream', lease.stream.updatedAt ?? this.now (), request, undefined, rest, false, shape (data));
            }
            this.countFallback ('shallow');
        }
        const book = await this.rest (async () => {
            try {
                return await rest.fetchOrderBook (symbol, LIVE_BOOK_REST_LIMIT);
            } catch (error) {
                if (error instanceof ToolError || !BOOK_LIMIT_REFUSAL.test (errorName (error))) {
                    throw error;
                }
                // a venue with fixed depths: its default, sliced below
                return rest.fetchOrderBook (symbol);
            }
        }, lease, request.exchangeId);
        if (book === undefined) {
            return this.servedStale (lease, request, undefined, rest, shape);
        }
        const target = lease.stream ?? lease.pending;
        if (target !== undefined) {
            target.bookLevels = Math.max (book?.bids?.length ?? 0, book?.asks?.length ?? 0);
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
        let stale = false;
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
                // whatever a stream still holds (stale) is better than nothing, but it is
                // reported as such: as of when it was streamed, and marked stale
                for (const [ symbol, lease ] of leases) {
                    if (missing.includes (symbol) && lease.stale !== undefined) {
                        tickers[symbol] = lease.stale.data;
                        const at = lease.stale.updatedAt ?? this.now ();
                        oldest = (oldest === undefined) ? at : Math.min (oldest, at);
                        stale = true;
                    }
                }
                if (Object.keys (tickers).length === 0) {
                    throw liveError (error, request.exchangeId);
                }
                source = 'stream';
            }
        }
        const served = this.served (source, oldest ?? this.now (), request, undefined, rest, atCap, { tickers });
        if (stale) {
            served.stale = true;
        }
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
        served.stale = true;
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
        const fill = Math.max (this.totalCount () / Math.max (1, this.options.maxStreams), this.countFor (request.exchangeId) / Math.max (1, this.options.maxStreamsPerExchange));
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
        const prediction = request.prediction === true;
        const key = streamKey (request.exchangeId, marketType, prediction, channel, symbol, timeframe);
        const now = this.now ();
        const client = request.client;
        const existing = this.streams.get (key);
        if (existing !== undefined) {
            // only a client within its quota keeps a stream alive; one past it still reads it
            if (this.mayHold (client, key, now)) {
                existing.leaseUntil = Math.max (existing.leaseUntil, now + this.options.idleMs);
                this.hold (client, key, now);
            } else {
                this.counters.unrenewed += 1;
            }
            if (existing.data !== undefined && existing.updatedAt !== undefined) {
                if (now - existing.updatedAt <= this.options.staleMs) {
                    return { 'stream': existing, 'atCap': false };
                }
                this.countFallback ('stale');
                return { 'stale': existing, 'atCap': false };
            }
            this.countFallback ('opening');
            return { 'pending': existing, 'atCap': false };
        }
        // a listed market the exchange marks inactive (delisted, suspended): its WebSocket
        // API often refuses the symbol, and a refusal there can reject the socket's other
        // subscriptions too. REST answers it (or says what is wrong)
        if (rest?.markets?.[symbol]?.active === false) {
            this.countFallback ('inactive');
            return { 'atCap': false };
        }
        const refusal = this.refusal (request.exchangeId, marketType, channel, timeframe, key) ?? this.clientRefusal (client, key, now);
        if (refusal !== undefined) {
            this.countFallback (refusal);
            return { 'atCap': refusal === 'cap' || refusal === 'quota' };
        }
        const admitted = this.backend.admitStream?.(request.exchangeId);
        if (admitted !== undefined) {
            this.countFallback ('refused');
            return { 'atCap': true };
        }
        if (client !== undefined) {
            const opens = this.clientOpens.get (client) ?? [];
            opens.push (now);
            this.clientOpens.set (client, opens);
        }
        const stream = this.open (key, request.exchangeId, marketType, prediction, channel, symbol, timeframe, rest);
        this.hold (client, key, now);
        this.countFallback ('opening');
        return { 'pending': stream, 'atCap': false };
    }

    // ---- per-client quota (only for callers the deployment names) ----

    private heldBy (client: string, now: number): Map<string, number> {
        const held = this.holds.get (client) ?? new Map<string, number> ();
        for (const [ key, until ] of held) {
            if (until <= now || !this.streams.has (key)) {
                held.delete (key);
            }
        }
        return held;
    }

    private mayHold (client: string | undefined, key: string, now: number): boolean {
        if (client === undefined || !(this.options.maxStreamsPerClient > 0)) {
            return true;
        }
        const held = this.heldBy (client, now);
        return held.has (key) || held.size < this.options.maxStreamsPerClient;
    }

    private hold (client: string | undefined, key: string, now: number): void {
        if (client === undefined || !(this.options.maxStreamsPerClient > 0)) {
            return;
        }
        const held = this.heldBy (client, now);
        held.set (key, now + this.options.idleMs);
        this.holds.set (client, held);
    }

    private clientRefusal (client: string | undefined, key: string, now: number): FallbackReason | undefined {
        if (client === undefined) {
            return undefined;
        }
        if (!this.mayHold (client, key, now)) {
            return 'quota';
        }
        if (this.options.maxOpensPerClientPerMinute > 0) {
            const opens = (this.clientOpens.get (client) ?? []).filter ((at) => at > now - 60000);
            this.clientOpens.set (client, opens);
            if (opens.length >= this.options.maxOpensPerClientPerMinute) {
                return 'quota';
            }
        }
        return undefined;
    }

    private refusal (exchangeId: string, marketType: string | undefined, channel: LiveChannel, timeframe: string | undefined, key: string): FallbackReason | undefined {
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
        const bannedUntil = this.banned.get (key);
        if (bannedUntil !== undefined) {
            if (bannedUntil > now) {
                return 'banned';
            }
            this.banned.delete (key);
        }
        if (this.totalCount () >= this.options.maxStreams || this.countFor (exchangeId) >= this.options.maxStreamsPerExchange) {
            return 'cap';
        }
        return undefined;
    }

    // streams plus the abandoned subscriptions still running on their sockets: both are
    // upstream subscriptions, so both count against the caps
    private totalCount (): number {
        let abandoned = 0;
        for (const instance of this.instances.values ()) {
            abandoned += instance.abandoned;
        }
        return this.streams.size + abandoned;
    }

    private countFor (exchangeId: string): number {
        let count = 0;
        for (const stream of this.streams.values ()) {
            if (stream.exchangeId === exchangeId) {
                count += 1;
            }
        }
        for (const instance of this.instances.values ()) {
            if (instance.exchangeId === exchangeId) {
                count += instance.abandoned;
            }
        }
        return count;
    }

    private instanceFor (exchangeId: string, marketType: string | undefined, prediction: boolean, rest: any): Instance {
        const key = exchangeId + '|' + (marketType ?? 'default') + '|' + (prediction ? 'p' : 'c');
        let instance = this.instances.get (key);
        if (instance === undefined || instance.closing || instance.retired) {
            const created: Instance = { key, exchangeId, marketType, prediction, rest, 'promise': Promise.resolve (undefined), 'exchange': undefined, 'streams': new Set (), 'closing': false, 'retired': false, 'abandoned': 0, 'failureOpen': false, 'batches': new Map () };
            created.promise = (async () => {
                const exchange = await this.backend.openStreamInstance (exchangeId, marketType, rest, prediction);
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

    private open (key: string, exchangeId: string, marketType: string | undefined, prediction: boolean, channel: LiveChannel, symbol: string, timeframe: string | undefined, rest: any): Stream {
        const instance = this.instanceFor (exchangeId, marketType, prediction, rest);
        let stop!: () => void;
        const stopped = new Promise<void> ((resolve) => {
            stop = resolve;
        });
        const now = this.now ();
        const marketId = rest?.markets?.[symbol]?.id;
        const stream: Stream = {
            key, exchangeId, marketType, channel, symbol, timeframe, prediction, instance,
            'marketId': (typeof marketId === 'string') ? marketId : undefined,
            'bookLevels': undefined,
            'active': true,
            'data': undefined,
            'updatedAt': undefined,
            'openedAt': now,
            'sequence': ++this.sequence,
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
        return stream;
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
                const args: any[] = (stream.channel === 'ohlcv') ? [ stream.symbol, stream.timeframe ] : [ stream.symbol ];
                const bookLimit = STREAM_BOOK_LIMITS[String (exchange.id ?? stream.exchangeId)];
                if (stream.channel === 'orderbook' && bookLimit !== undefined) {
                    args.push (bookLimit);
                }
                const tick = Promise.resolve (exchange[method] (...args));
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
                const name = errorName (error);
                if (CHANNEL_REFUSAL.test (name)) {
                    this.markUnsupported (stream);
                    this.closeStream (stream, 'unsupported');
                    break;
                }
                if (STREAM_REFUSAL.test (name)) {
                    const verdict = await this.judge (stream, error);
                    if (!stream.active) {
                        break;
                    }
                    if (verdict === 'ban') {
                        this.banned.set (stream.key, this.now () + this.options.unsupportedCooldownMs);
                        this.closeStream (stream, 'unsupported');
                        break;
                    }
                    // a refusal of another subscription that ccxt rejected on every stream of
                    // the socket: this one resubscribes; it is not a WebSocket failure
                    stream.errors += 1;
                    if (stream.errors >= this.options.maxStreamErrors) {
                        this.closeStream (stream, 'failed');
                        break;
                    }
                    await this.backoff (stream);
                    continue;
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
                await this.backoff (stream);
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

    // reconnect with backoff; a stop wakes it at once
    private async backoff (stream: Stream): Promise<void> {
        await new Promise<void> ((resolve) => {
            stream.wake = resolve;
            const timer = setTimeout (resolve, Math.min (30000, 500 * Math.pow (2, stream.errors)));
            timer.unref?.();
        });
        stream.wake = undefined;
    }

    // A per-stream refusal. When ccxt cannot tell which subscription an error answers it
    // rejects every future on the socket with that one error object (gate does for an unknown
    // currency pair): all of them arrive in the same tick. Alone, the error is this stream's.
    // Shared, only the stream the error names is banned (or, when it names none, the newest
    // subscription, the one that most likely caused it); the others resubscribe
    private async judge (stream: Stream, error: any): Promise<'ban' | 'retry'> {
        const instance = stream.instance;
        let batch = instance.batches.get (error);
        let done: Promise<void> | undefined = (batch as any)?.done;
        if (batch === undefined) {
            batch = [];
            done = new Promise<void> ((resolve) => {
                const timer = setTimeout (resolve, 0);
                timer.unref?.();
            });
            (batch as any).done = done;
            instance.batches.set (error, batch);
            void done.then (() => instance.batches.delete (error));
        }
        batch.push (stream);
        await done;
        if (batch.length === 1) {
            return 'ban';
        }
        const message = String (error?.message ?? error ?? '');
        const named = batch.filter ((candidate) => namesStream (message, candidate));
        if (named.length > 0) {
            return named.includes (stream) ? 'ban' : 'retry';
        }
        const newest = batch.reduce ((a, b) => ((b.sequence > a.sequence) ? b : a));
        return (newest === stream) ? 'ban' : 'retry';
    }

    private onStreamError (stream: Stream, error: any, opening: boolean): void {
        if (this.closed || (isBenignStreamClose (error) && !stream.active)) {
            return;
        }
        // one failure per instance event: a dropped socket rejects every stream on it with the
        // same error object, in the same tick, and ccxt reconnects on the next watch
        const instance = stream.instance;
        const isObject = error !== null && (typeof error === 'object' || typeof error === 'function');
        if ((isObject && this.counted.has (error)) || instance.failureOpen) {
            return;
        }
        if (isObject) {
            this.counted.add (error);
        }
        instance.failureOpen = true;
        const timer = setTimeout (() => {
            instance.failureOpen = false;
        }, 0);
        timer.unref?.();
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
            instance.abandoned = 0;
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
        if (reason === 'recycle' || exchange === undefined) {
            return; // the instance is closed with its last stream (or never had a subscription)
        }
        // others still use the instance: unsubscribe this one channel where ccxt can
        const unwatch = UNWATCH_METHODS[stream.channel];
        if (exchange.has?.[unwatch] === true && typeof exchange[unwatch] === 'function') {
            try {
                const args = (stream.channel === 'ohlcv') ? [ stream.symbol, stream.timeframe ] : [ stream.symbol ];
                void Promise.resolve (exchange[unwatch] (...args)).catch (() => undefined);
                return;
            } catch (e) {
                // counted as abandoned below
            }
        }
        // no unWatch: the subscription keeps running on the socket until the instance closes
        instance.abandoned += 1;
        if (instance.abandoned >= this.options.maxAbandonedPerInstance) {
            this.recycle (instance);
        }
    }

    // An instance holding too many abandoned subscriptions: its live streams move to a fresh
    // instance (keeping their data and leases, so polls go on being served meanwhile) and the
    // old one, with every subscription on it, is closed with its last stream
    private recycle (instance: Instance): void {
        if (instance.retired || instance.closing || this.closed) {
            return;
        }
        instance.retired = true;
        if (this.instances.get (instance.key) === instance) {
            this.instances.delete (instance.key);
        }
        this.counters.recycled += 1;
        this.log ('info', 'live stream instance recycled', { 'exchange': instance.exchangeId, 'abandoned': instance.abandoned, 'moved': instance.streams.size });
        const moving = [ ...instance.streams ].map ((key) => this.streams.get (key)).filter ((stream): stream is Stream => stream !== undefined);
        for (const old of moving) {
            this.closeStream (old, 'recycle');
            const fresh = this.open (old.key, old.exchangeId, old.marketType, old.prediction, old.channel, old.symbol, old.timeframe, instance.rest);
            this.counters.opened -= 1; // a move, not a new stream
            fresh.data = old.data;
            fresh.updatedAt = old.updatedAt;
            fresh.leaseUntil = old.leaseUntil;
            fresh.bookLevels = old.bookLevels;
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
        for (const client of [ ...this.holds.keys () ]) {
            if (this.heldBy (client, now).size === 0) {
                this.holds.delete (client);
            }
        }
        for (const [ client, opens ] of [ ...this.clientOpens ]) {
            const recent = opens.filter ((at) => at > now - 60000);
            if (recent.length === 0) {
                this.clientOpens.delete (client);
            } else {
                this.clientOpens.set (client, recent);
            }
        }
        for (const map of [ this.banned, this.unsupported, this.disabledUntil ]) {
            for (const [ key, until ] of [ ...map ]) {
                if (until <= now) {
                    map.delete (key);
                }
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
        let abandoned = 0;
        for (const instance of this.instances.values ()) {
            abandoned += instance.abandoned;
        }
        return {
            'streams': this.streams.size,
            'streamsByExchange': byExchange,
            abandoned,
            'instances': this.instances.size,
            'polls': { ...this.counters.polls },
            'pollsFailed': { ...this.counters.pollsFailed },
            'refused': { ...this.counters.refused },
            'fallbacks': { ...this.counters.fallbacks },
            'opened': this.counters.opened,
            'closedIdle': this.counters.closedIdle,
            'recycled': this.counters.recycled,
            'unrenewed': this.counters.unrenewed,
            'streamErrors': this.counters.streamErrors,
            'disabledExchanges': [ ...this.disabledUntil.entries () ].filter (([ , until ]) => until > now).map (([ id ]) => id).sort (),
        };
    }

    // One line per interval while there is anything to report (open streams or new polls).
    // Counters are totals since the hub started; the *_delta fields are since the last line
    logStats (): void {
        const stats = this.stats ();
        const sum = (counts: Record<string, number>) => Object.values (counts).reduce ((total, count) => total + count, 0);
        const totals = { 'stream': stats.polls.stream, 'cache': stats.polls.cache, 'rest': stats.polls.rest, 'failed': sum (stats.pollsFailed), 'refused': sum (stats.refused) };
        const unchanged = (Object.keys (totals) as (keyof typeof totals)[]).every ((key) => totals[key] === this.reported[key]);
        if (stats.streams === 0 && stats.abandoned === 0 && unchanged) {
            return;
        }
        const before = this.reported;
        this.reported = totals;
        const list = (counts: Record<string, number>) => Object.entries (counts).map (([ key, count ]) => key + ':' + count).join (',');
        this.log ('info', 'live hub stats', {
            'streams': stats.streams,
            'streams_by_exchange': list (stats.streamsByExchange),
            'abandoned': stats.abandoned,
            'instances': stats.instances,
            'polls_stream': stats.polls.stream,
            'polls_cache': stats.polls.cache,
            'polls_rest': stats.polls.rest,
            'polls_failed': totals.failed,
            'polls_failed_by_code': list (stats.pollsFailed),
            'refused': totals.refused,
            'refused_by_reason': list (stats.refused),
            'polls_stream_delta': totals.stream - before.stream,
            'polls_cache_delta': totals.cache - before.cache,
            'polls_rest_delta': totals.rest - before.rest,
            'polls_failed_delta': totals.failed - before.failed,
            'refused_delta': totals.refused - before.refused,
            'fallbacks': list (stats.fallbacks),
            'opened': stats.opened,
            'closed_idle': stats.closedIdle,
            'recycled': stats.recycled,
            'unrenewed': stats.unrenewed,
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
    pending?: Stream; // a stream that has no data yet (just opened)
    atCap: boolean; // a stream could not be opened for capacity reasons
}

const STOPPED = Symbol ('stopped');

function streamKey (exchangeId: string, marketType: string | undefined, prediction: boolean, channel: LiveChannel, symbol: string, timeframe: string | undefined): string {
    return JSON.stringify ([ exchangeId, marketType ?? 'default', prediction ? 'p' : 'c', channel, symbol, timeframe ?? '' ]);
}

// whether an error message names this stream's market: its unified symbol or the exchange's
// id for it, as a whole token ("BTC_USD" is not named by "BTC_USDT")
function namesStream (message: string, stream: Stream): boolean {
    for (const name of [ stream.symbol, stream.marketId ]) {
        if (typeof name !== 'string' || name.length === 0) {
            continue;
        }
        const escaped = name.replace (/[.*+?^${}()|[\]\\]/g, '\\$&');
        if (new RegExp ('(^|[^A-Za-z0-9])' + escaped + '($|[^A-Za-z0-9])').test (message)) {
            return true;
        }
    }
    return false;
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
    // mapped by the tool wrapper (BAD_SYMBOL, RATE_LIMITED, TIMEOUT, BAD_REQUEST, NOT_SUPPORTED):
    // a request the exchange refuses whatever the moment is not masked as a retryable outage
    if (/BadSymbol|BadRequest|NotSupported|ArgumentsRequired|RateLimitExceeded|DDoSProtection|RequestTimeout/.test (name)) {
        return error;
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

