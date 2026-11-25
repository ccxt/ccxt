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
    const control: VenueControl = { 'calls': [], 'loads': [], 'latencyMs': 0, 'loadLatencyMs': {}, 'failLoad': new Set (), 'failWith': undefined, 'held': [], 'hold': false, 'noBatch': new Set () };
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
        if (self.markets?.[args[0]] === undefined && typeof args[0] === 'string') {
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

            async loadMarkets (reload = false): Promise<any> {
                if (this.markets !== undefined && !reload) {
                    return this.markets;
                }
                control.loads.push ({ 'exchange': id, reload });
                await wait (control.loadLatencyMs[id] ?? 0);
                if (control.failLoad.has (id)) {
                    throw new ExchangeNotAvailable (id + ' GET https://api.' + id + '.example/markets 503 Service Unavailable <html>down</html>');
                }
                this.markets = markets ();
                return this.markets;
            }

            setMarketsFromExchange (source: any): void {
                this.markets = source.markets;
            }

            async fetchTicker (symbol: string): Promise<any> {
                return upstream (this, 'fetchTicker', [ symbol ], () => ({ symbol, 'last': 100, 'bid': 99, 'ask': 101, 'timestamp': 1700000000000, 'datetime': '2023-11-14T22:13:20.000Z' }));
            }

            async fetchTickers (symbols: string[]): Promise<any> {
                return upstream (this, 'fetchTickers', [ symbols ], () => Object.fromEntries (symbols.map ((symbol) => [ symbol, { symbol, 'last': 100, 'timestamp': 1700000000000 } ])));
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
