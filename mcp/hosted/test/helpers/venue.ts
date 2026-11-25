import { FakeExchange, MARKET } from '../../../test/helpers/fake-ccxt.js';

// A fake ccxt module for the hosted tests: several exchanges built on the stdio tests'
// FakeExchange, with a shared, inspectable record of every "upstream" call and knobs for
// latency, failures and markets loading. No network anywhere.

export interface VenueControl {
    calls: { exchange: string, method: string, args: any[], defaultType?: string }[];
    loads: { exchange: string, reload: boolean }[];
    latencyMs: number; // per upstream call
    loadLatencyMs: Record<string, number>; // per exchange markets load
    failLoad: Set<string>; // exchanges whose markets load fails
    failWith: ((exchange: string, method: string) => Error | undefined) | undefined;
    held: Array<() => void>; // when holding, calls wait here until released
    hold: boolean;
    noBatch: Set<string>; // exchanges without fetchTickers (one request per symbol)
    // the ccxt.pro side (module.pro), driven only by the live hub
    ws: {
        instances: any[]; // every stream instance constructed
        watches: { exchange: string, method: string, args: any[] }[];
        fail: ((exchange: string, method: string) => Error | undefined) | undefined;
        noWs: Set<string>; // exchanges without a ccxt.pro class
    };
}

// ccxt-shaped error classes: the breaker and the error mapping read class names
export class NetworkError extends Error {}
export class DDoSProtection extends NetworkError {}
export class RateLimitExceeded extends DDoSProtection {}
export class ExchangeNotAvailable extends NetworkError {}
export class BadSymbol extends Error {}

export const ETH = { ...MARKET, 'symbol': 'ETH/USDT', 'id': 'ETHUSDT', 'base': 'ETH' };
export const PERP = { ...MARKET, 'symbol': 'BTC/USDT:USDT', 'id': 'BTCUSDTPERP', 'type': 'swap', 'spot': false, 'swap': true, 'contract': true, 'settle': 'USDT' };

export function symbolsFor (count: number): string[] {
    return Array.from ({ 'length': count }, (_, i) => 'C' + i + '/USDT');
}

export function createVenue (ids: string[] = [ 'alpha', 'beta' ], extraSymbols = 300) {
    const control: VenueControl = { 'calls': [], 'loads': [], 'latencyMs': 0, 'loadLatencyMs': {}, 'failLoad': new Set (), 'failWith': undefined, 'held': [], 'hold': false, 'noBatch': new Set (), 'ws': { 'instances': [], 'watches': [], 'fail': undefined, 'noWs': new Set () } };
    const wait = (ms: number) => new Promise<void> ((resolve) => setTimeout (resolve, ms));
    const markets = (): Record<string, any> => {
        const result: Record<string, any> = { 'BTC/USDT': MARKET, 'ETH/USDT': ETH, 'BTC/USDT:USDT': PERP };
        for (const symbol of symbolsFor (extraSymbols)) {
            result[symbol] = { ...MARKET, symbol, 'id': symbol.replace ('/', ''), 'base': symbol.split ('/')[0] };
        }
        return result;
    };
    const upstream = async (self: any, method: string, args: any[], answer: () => any) => {
        control.calls.push ({ 'exchange': self.id, method, args, 'defaultType': self.options?.defaultType });
        if (control.hold) {
            await new Promise<void> ((resolve) => control.held.push (resolve));
        }
        if (control.latencyMs > 0) {
            await wait (control.latencyMs);
        }
        const failure = control.failWith?.(self.id, method);
        if (failure !== undefined) {
            throw failure;
        }
        // ccxt's market () uses `symbol in markets`: a prototype member name passes, as it does there
        if (typeof args[0] === 'string' && !(args[0] in (self.markets ?? {}))) {
            throw new BadSymbol (self.id + ' does not have market symbol ' + args[0]);
        }
        return answer ();
    };
    const module: Record<string, any> = { 'version': 'fake-hosted', 'exchanges': ids };
    for (const id of ids) {
        module[id] = class extends FakeExchange {
            constructor (config: Record<string, any> = {}) {
                super (config);
                this.id = id;
                this.name = id.toUpperCase ();
                this.rateLimit = 200;
                this.markets = undefined as any;
                if (control.noBatch.has (id)) {
                    this.has = { ...this.has, 'fetchTickers': false };
                }
            }

            parseTimeframe (timeframe: string): number {
                const units: Record<string, number> = { 'm': 60, 'h': 3600, 'd': 86400 };
                return Number (timeframe.slice (0, -1)) * units[timeframe.slice (-1)];
            }

            marketsLoading: Promise<any> | undefined;
            reloadingMarkets: boolean | undefined;

            // the same promise caching as ccxt's Exchange.loadMarkets: one promise, rejected
            // ones included, handed to every later non-reload call
            loadMarkets (reload = false): Promise<any> {
                if ((reload && this.reloadingMarkets !== true) || this.marketsLoading === undefined) {
                    this.reloadingMarkets = true;
                    this.marketsLoading = (async () => {
                        control.loads.push ({ 'exchange': id, reload });
                        await wait (control.loadLatencyMs[id] ?? 0);
                        if (control.failLoad.has (id)) {
                            throw new ExchangeNotAvailable (id + ' GET https://api.' + id + '.example/markets 503 Service Unavailable <html>down</html>');
                        }
                        this.markets = markets ();
                        return this.markets;
                    }) ().then ((resolved) => {
                        this.reloadingMarkets = false;
                        return resolved;
                    }, (error) => {
                        this.reloadingMarkets = false;
                        throw error;
                    });
                }
                return this.marketsLoading as Promise<any>;
            }

            setMarketsFromExchange (source: any): void {
                this.markets = source.markets;
            }

            async fetchTicker (symbol: string): Promise<any> {
                return upstream (this, 'fetchTicker', [ symbol ], () => ({ symbol, 'last': 100, 'bid': 99, 'ask': 101, 'timestamp': 1700000000000, 'datetime': '2023-11-14T22:13:20.000Z' }));
            }

            async fetchTickers (symbols: string[]): Promise<any> {
                // like ccxt: a plain object holding only the symbols the exchange answered for
                return upstream (this, 'fetchTickers', [ symbols ], () => {
                    const result: Record<string, any> = {};
                    for (const symbol of symbols) {
                        if (Object.prototype.hasOwnProperty.call (this.markets ?? {}, symbol)) {
                            result[symbol] = { symbol, 'last': 100, 'timestamp': 1700000000000 };
                        }
                    }
                    return result;
                });
            }

            async fetchOrderBook (symbol: string, limit = 20): Promise<any> {
                return upstream (this, 'fetchOrderBook', [ symbol, limit ], () => ({ symbol, 'timestamp': 1700000000000, 'datetime': null, 'nonce': 1, 'bids': [ [ 99, 1 ], [ 98, 2 ] ], 'asks': [ [ 101, 1 ], [ 102, 2 ] ] }));
            }

            async fetchOHLCV (symbol: string, timeframe = '1h', since?: number, limit = 100): Promise<any> {
                return upstream (this, 'fetchOHLCV', [ symbol, timeframe, since, limit ], () => Array.from ({ 'length': Math.min (limit, 500) }, (_, i) => [ 1700000000000 + i * 3600000, 1, 2, 0.5, 1.5, 100 ]));
            }

            async fetchTrades (symbol: string, since?: number, limit = 50): Promise<any> {
                return upstream (this, 'fetchTrades', [ symbol, since, limit ], () => [ { 'id': 't1', symbol, 'side': 'buy', 'price': 100, 'amount': 1, 'cost': 100, 'timestamp': 1700000000000 } ]);
            }

            async fetchFundingRate (symbol: string): Promise<any> {
                return upstream (this, 'fetchFundingRate', [ symbol ], () => ({ symbol }));
            }
        };
    }
    // ccxt.pro classes: a watch* call resolves after a short unref'd tick with fresh data
    // (prices move with every tick) and never touches the REST side
    const pro: Record<string, any> = { 'exchanges': ids.filter ((id) => !control.ws.noWs.has (id)) };
    for (const id of ids) {
        pro[id] = class extends module[id] {
            closedWs = false;
            ticks = 0;
            constructor (config: Record<string, any> = {}) {
                super (config);
                this.has = { ...this.has, 'watchTicker': true, 'watchOrderBook': true, 'watchOHLCV': true, 'unWatchTicker': true, 'unWatchOrderBook': true, 'unWatchOHLCV': true };
                control.ws.instances.push (this);
            }

            private async wsTick (method: string, args: any[]): Promise<void> {
                control.ws.watches.push ({ 'exchange': id, method, args });
                await new Promise<void> ((resolve) => {
                    const timer = setTimeout (resolve, 3);
                    timer.unref?.();
                });
                if (this.closedWs) {
                    const error = new Error ('connection closed by user');
                    error.name = 'ExchangeClosedByUser';
                    throw error;
                }
                const failure = control.ws.fail?.(id, method);
                if (failure !== undefined) {
                    throw failure;
                }
                this.ticks += 1;
            }

            async watchTicker (symbol: string): Promise<any> {
                await this.wsTick ('watchTicker', [ symbol ]);
                return { symbol, 'last': 200 + this.ticks, 'bid': 199, 'ask': 201, 'percentage': 1, 'baseVolume': 3, 'quoteVolume': 600, 'timestamp': Date.now () };
            }

            async watchOrderBook (symbol: string): Promise<any> {
                await this.wsTick ('watchOrderBook', [ symbol ]);
                return { symbol, 'bids': Array.from ({ 'length': 30 }, (_, i) => [ 199 - i, 1 ]), 'asks': Array.from ({ 'length': 30 }, (_, i) => [ 201 + i, 1 ]), 'timestamp': Date.now () };
            }

            async watchOHLCV (symbol: string, timeframe: string): Promise<any> {
                await this.wsTick ('watchOHLCV', [ symbol, timeframe ]);
                const frame = this.parseTimeframe (timeframe) * 1000;
                const open = Math.floor (Date.now () / frame) * frame;
                return Array.from ({ 'length': 10 }, (_, i) => [ open - (9 - i) * frame, 1, 2, 0.5, 1.5 + this.ticks, 100 ]);
            }

            async unWatchTicker (): Promise<void> {}
            async unWatchOrderBook (): Promise<void> {}
            async unWatchOHLCV (): Promise<void> {}

            async close (): Promise<void> {
                this.closedWs = true;
            }
        };
    }
    module['pro'] = new Proxy (pro, {
        // an exchange in noWs has no ccxt.pro class, decided when the hub asks
        get: (target, property) => ((typeof property === 'string' && control.ws.noWs.has (property)) ? undefined : target[property as string]),
    });
    // ids without fetchTickers, to exercise the per-symbol fan-out
    return {
        module,
        control,
        'release': () => {
            control.hold = false;
            for (const resolve of control.held.splice (0)) {
                resolve ();
            }
        },
        'upstreamCalls': (method?: string) => control.calls.filter ((call) => method === undefined || call.method === method).length,
    };
}
