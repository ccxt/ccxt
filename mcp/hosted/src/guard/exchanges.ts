import { ToolError, sanitizeUpstreamError } from '../../../ts/errors.js';
import { UnknownExchangeError, UnknownAccountError } from '../../../ts/pools.js';
import { UpstreamGuard } from './upstream.js';
import { stableKey } from './cache.js';

// The hosted server's exchange pools: what ServerContext.pools is on hosted, in place of
// ExchangePools. Same surface the market tools use (getPublic, getBare), different rules:
// - only the configured allowlist exists; markets are loaded at start-up, kept in memory
//   only (never a disk cache) and refreshed in the background — a caller cannot load or
//   reload markets;
// - one ccxt instance per (exchange, market type), and therefore one throttler each; the
//   per-type instances borrow the default instance's markets instead of loading their own;
// - tools get a guarded view of an instance: the few REST reads the hosted tools make go
//   through UpstreamGuard (cache, coalescing, bounded queue, breaker), and every other
//   network method is refused.
// Accounts and streams do not exist here; asking for one is a bug in the hosted profile.

export const MARKET_TYPE_KEYS = [ 'spot', 'margin', 'swap', 'future', 'option', 'delivery', 'index', 'prediction' ] as const;

export interface HostedExchangesOptions {
    ccxt: any; // the real ccxt module (or a test fake with the same shape)
    exchanges: string[];
    guard: UpstreamGuard;
    exchangeTimeoutMs: number;
    marketsRefreshMs: number; // 0 disables the background refresh
    marketsLoadTimeoutMs: number;
    prewarmConcurrency: number;
    exchangeOptions?: Record<string, Record<string, any>>;
    log?: (level: 'debug' | 'info' | 'warn' | 'error', message: string, attributes?: Record<string, unknown>) => void;
    now?: () => number;
    random?: () => number;
}

export type WarmState = 'cold' | 'loading' | 'warm' | 'failed';

interface Venue {
    id: string;
    base: any; // the default-type instance: it owns the markets
    typed: Map<string, any>; // marketType -> instance sharing base's markets
    guarded: Map<string, any>; // instance key -> its guarded proxy
    state: WarmState;
    lastError?: string;
    loadedAt?: number;
    loading?: Promise<void>;
    refreshTimer?: ReturnType<typeof setTimeout>;
}

// The tool-facing method names that may reach the network, with their cache lifetime.
// Short TTLs (1-2 s) still collapse a burst of identical calls (a popular ticker asked by
// many users at once) into one upstream request
export const TICKER_TTL_MS = 2000;
const TRADES_TTL_MS = 2000;
export const ORDERBOOK_TTL_MS = 1000;
const OHLCV_MIN_TTL_MS = 2000;
const OHLCV_MAX_TTL_MS = 60000;

// a method name that would make a request: anything else on the instance (markets, has,
// timeframes, market (), parse8601 (), precision helpers) is local and passes through
const NETWORK_METHOD = /^(fetch|load|watch|create|cancel|edit|set|withdraw|transfer|close|un[A-Z]|request$|sign$)/;
const GUARDED_METHODS = new Set ([ 'fetchTicker', 'fetchTickers', 'fetchOrderBook', 'fetchOHLCV', 'fetchTrades', 'loadMarkets' ]);

// ccxt's market () also resolves expired option symbols it has no market for; none of
// those spellings can be a prototype member name
const EXPIRED_OPTION = /(^[CP]-)|(-[CP]$)/;

function hasOwn (object: any, key: string): boolean {
    return object !== null && typeof object === 'object' && Object.prototype.hasOwnProperty.call (object, key);
}

export function ohlcvTtlMs (exchange: any, timeframe: string): number {
    let seconds = 0;
    try {
        seconds = Number (exchange.parseTimeframe?.(timeframe)) || 0;
    } catch (e) {
        seconds = 0;
    }
    // a tenth of the candle: a 1m chart refreshes every 6 s, anything 10m or longer every minute
    return Math.min (OHLCV_MAX_TTL_MS, Math.max (OHLCV_MIN_TTL_MS, Math.floor (seconds * 1000 / 10)));
}

export class HostedExchanges {
    private options: HostedExchangesOptions;
    private venues = new Map<string, Venue> ();
    private bare = new Map<string, any> ();
    private now: () => number;
    private random: () => number;
    private closed = false;
    readonly allowlist: readonly string[];

    constructor (options: HostedExchangesOptions) {
        this.options = options;
        this.now = options.now ?? Date.now;
        this.random = options.random ?? Math.random;
        const unknown = options.exchanges.filter ((id) => typeof options.ccxt[id] !== 'function');
        if (unknown.length > 0) {
            throw new Error ('EXCHANGES names exchange ids ccxt does not have: ' + unknown.join (', '));
        }
        this.allowlist = Object.freeze ([ ...new Set (options.exchanges) ].sort ());
        for (const id of this.allowlist) {
            const base = this.construct (id, undefined);
            this.venues.set (id, { id, base, 'typed': new Map (), 'guarded': new Map (), 'state': 'cold' });
            options.guard.register (id, Number (base.rateLimit) || 1000);
        }
    }

    // ---- the pools surface the shared tools call ----

    async getPublic (exchangeId: string, marketType?: string, prediction = false): Promise<any> {
        const venue = this.venue (exchangeId, prediction);
        if (venue.state !== 'warm') {
            throw new ToolError ('EXCHANGE_WARMING', exchangeId + ' is still loading its markets on this server', {
                'retryable': true,
                'hint': 'retry in a few seconds',
                'retryAfterSeconds': 5,
            });
        }
        const instance = this.instanceFor (venue, marketType);
        const cacheKey = (marketType === undefined) ? 'default' : marketType;
        let guarded = venue.guarded.get (cacheKey);
        if (guarded === undefined) {
            guarded = this.guard (venue, instance, cacheKey);
            venue.guarded.set (cacheKey, guarded);
        }
        return guarded;
    }

    // metadata only (describe () fields), no markets, never any network use
    getBare (exchangeId: string, prediction = false): any {
        this.venue (exchangeId, prediction);
        let exchange = this.bare.get (exchangeId);
        if (exchange === undefined) {
            exchange = this.construct (exchangeId, undefined);
            this.bare.set (exchangeId, exchange);
        }
        return exchange;
    }

    account (name: string): never {
        throw new UnknownAccountError (name, [], 'this hosted server has no accounts');
    }

    async getAuthenticated (name: string): Promise<never> {
        return this.account (name);
    }

    // A public ccxt.pro instance for the live hub (mcp/ts/live/hub.ts), separate from the REST
    // instances: no keys, its own throttler and sockets, newUpdates off (the hub reads whole
    // caches), and the venue's warm markets shared in, so it never loads markets itself.
    // undefined when ccxt has no WebSocket class for the exchange. The watch_* tools do not
    // exist here; this instance is only ever driven by the hub
    streamInstance (exchangeId: string, marketType: string | undefined): any | undefined {
        const venue = this.venue (exchangeId, false);
        if (venue.state !== 'warm') {
            throw new ToolError ('EXCHANGE_WARMING', exchangeId + ' is still loading its markets on this server', { 'retryable': true, 'retryAfterSeconds': 5 });
        }
        if (marketType !== undefined && !(MARKET_TYPE_KEYS as readonly string[]).includes (marketType)) {
            throw new ToolError ('BAD_REQUEST', 'unknown market type ' + JSON.stringify (String (marketType).slice (0, 32)));
        }
        const cls = this.options.ccxt.pro?.[exchangeId];
        if (typeof cls !== 'function' || this.closed) {
            return undefined;
        }
        const exchangeOptions = this.options.exchangeOptions?.[exchangeId];
        const exchange = new cls ({
            'timeout': this.options.exchangeTimeoutMs,
            'enableRateLimit': true,
            'options': { ...(exchangeOptions ?? {}), 'newUpdates': false },
        });
        exchange.verbose = false;
        exchange.log = () => {};
        exchange.newUpdates = false;
        if (exchange.options) {
            exchange.options['newUpdates'] = false;
            if (marketType !== undefined) {
                exchange.options['defaultType'] = marketType;
            }
        }
        shareMarkets (venue.base, exchange);
        return exchange;
    }

    async acquirePublicStream (): Promise<never> {
        throw new ToolError ('NOT_SUPPORTED', 'streams are not available on the hosted server');
    }

    releasePublicStream (): void {
        // nothing is ever acquired
    }

    prewarm (): void {
        void this.warmAll ();
    }

    // ---- warm-up, refresh, readiness ----

    // loads every allowlisted exchange's markets, a few at a time; failures are retried in
    // the background (with backoff) so a venue that was down at start-up joins later
    async warmAll (): Promise<void> {
        const pending = [ ...this.allowlist ];
        const workers = Array.from ({ 'length': Math.max (1, Math.min (this.options.prewarmConcurrency, pending.length)) }, async () => {
            while (pending.length > 0 && !this.closed) {
                const id = pending.shift () as string;
                await this.load (this.venues.get (id) as Venue, false);
            }
        });
        await Promise.all (workers);
    }

    status (): Record<string, { state: WarmState, markets: number, loadedAt?: string, error?: string, breaker?: string }> {
        const result: Record<string, any> = {};
        for (const venue of this.venues.values ()) {
            result[venue.id] = {
                'state': venue.state,
                'markets': Object.keys (venue.base.markets ?? {}).length,
                'loadedAt': (venue.loadedAt !== undefined) ? new Date (venue.loadedAt).toISOString () : undefined,
                'error': venue.lastError,
                'breaker': this.options.guard.breakerState (venue.id),
            };
        }
        return result;
    }

    warmCount (): number {
        return [ ...this.venues.values () ].filter ((venue) => venue.state === 'warm').length;
    }

    async closeAll (): Promise<void> {
        this.closed = true;
        for (const venue of this.venues.values ()) {
            if (venue.refreshTimer !== undefined) {
                clearTimeout (venue.refreshTimer);
            }
        }
    }

    // ---- internals ----

    private venue (exchangeId: string, prediction: boolean): Venue {
        const venue = this.venues.get (exchangeId);
        if (venue === undefined || prediction) {
            throw new UnknownExchangeError (exchangeId, closest (exchangeId, [ ...this.allowlist ]));
        }
        return venue;
    }

    private construct (exchangeId: string, marketType: string | undefined): any {
        const cls = this.options.ccxt[exchangeId];
        const exchangeOptions = this.options.exchangeOptions?.[exchangeId];
        const exchange = new cls ({
            'timeout': this.options.exchangeTimeoutMs,
            'enableRateLimit': true,
            ...(exchangeOptions ? { 'options': { ...exchangeOptions } } : {}),
        });
        // same hardening as ExchangePools: no verbose request dumps, no stray stdout
        exchange.verbose = false;
        exchange.log = () => {};
        if (marketType !== undefined && exchange.options) {
            exchange.options['defaultType'] = marketType;
        }
        return exchange;
    }

    private instanceFor (venue: Venue, marketType: string | undefined): any {
        if (marketType === undefined) {
            return venue.base;
        }
        if (!(MARKET_TYPE_KEYS as readonly string[]).includes (marketType)) {
            // the tool schemas already restrict this; a second line in case one does not
            throw new ToolError ('BAD_REQUEST', 'unknown market type ' + JSON.stringify (String (marketType).slice (0, 32)));
        }
        let instance = venue.typed.get (marketType);
        if (instance === undefined) {
            instance = this.construct (venue.id, marketType);
            shareMarkets (venue.base, instance);
            venue.typed.set (marketType, instance);
        }
        return instance;
    }

    private async load (venue: Venue, reload: boolean): Promise<void> {
        if (venue.loading !== undefined) {
            return venue.loading;
        }
        const started = this.now ();
        if (!reload) {
            venue.state = 'loading';
        }
        const task = async () => {
            const loadMarkets = venue.base.loadMarkets.bind (venue.base);
            let timer: ReturnType<typeof setTimeout> | undefined;
            const timeout = new Promise<never> ((_, reject) => {
                timer = setTimeout (() => reject (new Error ('markets load timed out after ' + this.options.marketsLoadTimeoutMs + ' ms')), this.options.marketsLoadTimeoutMs);
                (timer as any).unref?.();
            });
            if (!reload) {
                // ccxt caches its markets promise, a rejected or still-pending (timed-out) one
                // included, and hands it to every later loadMarkets (): a cold retry after a
                // failure would get the old rejection back without asking the exchange again
                venue.base.marketsLoading = undefined;
                venue.base.reloadingMarkets = false;
            }
            try {
                // a reload goes through the guard like any request (queue, breaker), but
                // under a key no tool can produce, so it is never answered from the cache
                await Promise.race ([
                    reload ? this.options.guard.call (venue.id, venue.id + '|markets-refresh|' + started, 0, () => loadMarkets (true)) : loadMarkets (false),
                    timeout,
                ]);
            } finally {
                clearTimeout (timer);
            }
        };
        venue.loading = task ().then (() => {
            venue.state = 'warm';
            venue.lastError = undefined;
            venue.loadedAt = this.now ();
            for (const instance of venue.typed.values ()) {
                shareMarkets (venue.base, instance);
            }
            this.options.log?.('info', 'markets ' + (reload ? 'refreshed' : 'loaded'), { 'exchange': venue.id, 'markets': Object.keys (venue.base.markets ?? {}).length, 'durationMs': this.now () - started });
            this.schedule (venue, this.options.marketsRefreshMs, true);
        }, (error) => {
            // readiness output and logs get the same treatment as tool errors: no URLs, no bodies
            venue.lastError = String (error?.constructor?.name ?? 'Error') + ': ' + sanitizeUpstreamError (error, { 'hosted': true }).slice (0, 200);
            if (venue.state !== 'warm') {
                venue.state = 'failed';
            }
            this.options.log?.('warn', 'markets ' + (reload ? 'refresh' : 'load') + ' failed', { 'exchange': venue.id, 'error': venue.lastError });
            // keep serving the markets we have; retry sooner than a full refresh period
            const retryMs = (venue.state === 'warm') ? Math.min (this.options.marketsRefreshMs || 600000, 600000) : 60000;
            this.schedule (venue, retryMs, venue.state === 'warm');
        }).finally (() => {
            venue.loading = undefined;
        });
        return venue.loading;
    }

    private schedule (venue: Venue, delayMs: number, reload: boolean): void {
        if (this.closed || !(delayMs > 0)) {
            return;
        }
        if (venue.refreshTimer !== undefined) {
            clearTimeout (venue.refreshTimer);
        }
        // +-10% jitter so the allowlist never refreshes in lockstep
        const jittered = Math.round (delayMs * (0.9 + 0.2 * this.random ()));
        venue.refreshTimer = setTimeout (() => {
            venue.refreshTimer = undefined;
            void this.load (venue, reload);
        }, jittered);
        (venue.refreshTimer as any).unref?.();
    }

    private guard (venue: Venue, instance: any, typeKey: string): any {
        const guard = this.options.guard;
        const prefix = venue.id + '|' + typeKey + '|';
        const call = (method: string, args: any[], ttlMs: number) => guard.call (venue.id, prefix + method + '|' + stableKey (args), ttlMs, () => instance[method] (...args));
        // Checked here, before the guard: ccxt resolves symbols (market ()) and timeframes
        // with plain property lookups, so "__proto__", "constructor" or "toString" pass as
        // valid and go upstream as nonsense requests. Their 403/404 answers counted against
        // the shared breaker, which let one anonymous caller pause a venue for everyone.
        const symbolOk = (symbol: unknown) => {
            if (typeof symbol !== 'string') {
                return; // ccxt's own ArgumentsRequired path; nothing to look up
            }
            if (hasOwn (instance.markets, symbol) || hasOwn (instance.markets_by_id, symbol) || EXPIRED_OPTION.test (symbol)) {
                return;
            }
            throw new ToolError ('BAD_SYMBOL', venue.id + ' does not have market symbol ' + JSON.stringify (symbol.slice (0, 64)), {
                'retryable': false,
                'hint': 'resolve symbols with search_markets',
            });
        };
        const timeframeOk = (timeframe: unknown) => {
            const timeframes = instance.timeframes;
            if (timeframes !== undefined && timeframes !== null && !hasOwn (timeframes, String (timeframe))) {
                throw new ToolError ('BAD_TIMEFRAME', String (timeframe).slice (0, 16) + ' is not a supported timeframe on ' + venue.id, {
                    'retryable': false,
                    'hint': 'supported: ' + Object.keys (timeframes).join (', '),
                });
            }
        };
        const methods: Record<string, (...args: any[]) => Promise<any>> = {
            'fetchTicker': async (symbol: string, params = {}) => {
                symbolOk (symbol);
                return call ('fetchTicker', [ symbol, params ], TICKER_TTL_MS);
            },
            'fetchTickers': async (symbols: string[] | undefined, params = {}) => {
                if (symbols !== undefined) {
                    for (const symbol of symbols) {
                        symbolOk (symbol);
                    }
                }
                return call ('fetchTickers', [ (symbols === undefined) ? undefined : [ ...new Set (symbols) ].sort (), params ], TICKER_TTL_MS);
            },
            'fetchOrderBook': async (symbol: string, limit?: number, params = {}) => {
                symbolOk (symbol);
                return call ('fetchOrderBook', [ symbol, limit, params ], ORDERBOOK_TTL_MS);
            },
            'fetchOHLCV': async (symbol: string, timeframe = '1m', since?: number, limit?: number, params = {}) => {
                symbolOk (symbol);
                timeframeOk (timeframe);
                return call ('fetchOHLCV', [ symbol, timeframe, since, limit, params ], ohlcvTtlMs (instance, timeframe));
            },
            'fetchTrades': async (symbol: string, since?: number, limit?: number, params = {}) => {
                symbolOk (symbol);
                return call ('fetchTrades', [ symbol, since, limit, params ], TRADES_TTL_MS);
            },
            // markets are the server's business: a "reload" from a tool is answered from memory
            'loadMarkets': async () => instance.markets,
        };
        return new Proxy (instance, {
            get (target, property, receiver) {
                if (typeof property === 'string' && GUARDED_METHODS.has (property)) {
                    return methods[property];
                }
                const value = Reflect.get (target, property, receiver);
                if (typeof property === 'string' && typeof value === 'function') {
                    if (NETWORK_METHOD.test (property)) {
                        return () => Promise.reject (new ToolError ('NOT_SUPPORTED', property + ' is not available on the hosted server'));
                    }
                    return value.bind (target);
                }
                return value;
            },
            set () {
                // tools never configure an instance; a shared instance must not be changed by one caller
                return false;
            },
        });
    }
}

// the default instance owns the markets; typed instances point at the same objects
function shareMarkets (source: any, target: any): void {
    if (typeof target.setMarketsFromExchange === 'function') {
        target.setMarketsFromExchange (source);
        return;
    }
    for (const key of [ 'markets', 'markets_by_id', 'symbols', 'ids', 'currencies', 'currencies_by_id', 'baseCurrencies', 'quoteCurrencies', 'codes' ]) {
        target[key] = source[key];
    }
}

// "binanse" -> binance, "coinbse" -> coinbase: edit distance over the allowlist only
function closest (needle: string, haystack: string[]): string[] {
    const lower = needle.toLowerCase ();
    const distance = (a: string, b: string): number => {
        let previous = Array.from ({ 'length': b.length + 1 }, (_, i) => i);
        for (let i = 1; i <= a.length; i++) {
            const current = [ i ];
            for (let j = 1; j <= b.length; j++) {
                current.push (Math.min (previous[j] + 1, current[j - 1] + 1, previous[j - 1] + ((a[i - 1] === b[j - 1]) ? 0 : 1)));
            }
            previous = current;
        }
        return previous[b.length];
    };
    const score = (candidate: string): number => ((candidate.includes (lower) || lower.includes (candidate)) ? 0 : distance (lower, candidate));
    return [ ...haystack ].sort ((a, b) => score (a) - score (b)).slice (0, 5);
}
