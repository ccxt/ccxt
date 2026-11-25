// A controllable ccxt.pro stand-in for the live hub tests: each watch* call resolves with the
// current value of its channel after a short unref'd delay (like a socket tick), a failure
// hook makes it throw, and every open, unWatch and close is recorded. No network.

export class NetworkError extends Error {}
export class RateLimitExceeded extends NetworkError {}
export class NotSupported extends Error {}

export interface WsControl {
    instances: FakeWs[];
    // the data each channel answers with, keyed 'ohlcv|SYMBOL|TF', 'orderbook|SYMBOL', 'ticker|SYMBOL'
    data: Map<string, any>;
    fail: ((method: string, args: any[]) => Error | undefined) | undefined;
    tickMs: number;
    unwatched: string[];
    watchCalls: number;
}

export function wsControl (): WsControl {
    return { 'instances': [], 'data': new Map (), 'fail': undefined, 'tickMs': 3, 'unwatched': [], 'watchCalls': 0 };
}

export class FakeWs {
    id: string;
    markets: any;
    has: Record<string, any>;
    closed = false;
    control: WsControl;
    marketType: string | undefined;

    constructor (control: WsControl, id = 'fakex', marketType?: string, has: Record<string, any> = {}) {
        this.control = control;
        this.id = id;
        this.marketType = marketType;
        this.has = { 'watchOHLCV': true, 'watchOrderBook': true, 'watchTicker': true, 'unWatchOHLCV': true, 'unWatchOrderBook': true, 'unWatchTicker': true, ...has };
        control.instances.push (this);
    }

    private async tick (method: string, key: string, args: any[]): Promise<any> {
        this.control.watchCalls += 1;
        await new Promise<void> ((resolve) => {
            const timer = setTimeout (resolve, this.control.tickMs);
            timer.unref?.();
        });
        if (this.closed) {
            const error = new Error ('connection closed by user');
            error.name = 'ExchangeClosedByUser';
            throw error;
        }
        const failure = this.control.fail?.(method, args);
        if (failure !== undefined) {
            throw failure;
        }
        const value = this.control.data.get (key);
        if (value === undefined) {
            // no data yet: behave like a quiet socket (wait for the next tick)
            return this.tick (method, key, args);
        }
        return value;
    }

    watchOHLCV (symbol: string, timeframe: string): Promise<any> {
        return this.tick ('watchOHLCV', 'ohlcv|' + symbol + '|' + timeframe, [ symbol, timeframe ]);
    }

    watchOrderBook (symbol: string): Promise<any> {
        return this.tick ('watchOrderBook', 'orderbook|' + symbol, [ symbol ]);
    }

    watchTicker (symbol: string): Promise<any> {
        return this.tick ('watchTicker', 'ticker|' + symbol, [ symbol ]);
    }

    async unWatchOHLCV (symbol: string, timeframe: string): Promise<void> {
        this.control.unwatched.push ('ohlcv|' + symbol + '|' + timeframe);
    }

    async unWatchOrderBook (symbol: string): Promise<void> {
        this.control.unwatched.push ('orderbook|' + symbol);
    }

    async unWatchTicker (symbol: string): Promise<void> {
        this.control.unwatched.push ('ticker|' + symbol);
    }

    async close (): Promise<void> {
        this.closed = true;
    }
}

export const MINUTE = 60000;
export const T0 = 1700000040000 - (1700000040000 % MINUTE);

export function candle (index: number, close = 100 + index): number[] {
    return [ T0 + index * MINUTE, 100, Math.max (110, close), 90, close, 5 ];
}

export function candles (from: number, to: number): number[][] {
    const rows: number[][] = [];
    for (let i = from; i <= to; i++) {
        rows.push (candle (i));
    }
    return rows;
}

// the REST side the hub falls back to: counts every call
export class FakeRest {
    id = 'fakex';
    markets: Record<string, any> = { 'BTC/USDT': { 'symbol': 'BTC/USDT' }, 'ETH/USDT': { 'symbol': 'ETH/USDT' }, 'SOL/USDT': { 'symbol': 'SOL/USDT' } };
    timeframes = { '1m': '1m', '1h': '1h' };
    has: Record<string, any> = { 'fetchTickers': true };
    calls: { method: string, args: any[] }[] = [];
    fail: ((method: string) => Error | undefined) | undefined;
    ohlcv: number[][] = candles (0, 299);

    private record (method: string, args: any[]): void {
        this.calls.push ({ method, args });
        const failure = this.fail?.(method);
        if (failure !== undefined) {
            throw failure;
        }
    }

    async fetchOHLCV (symbol: string, timeframe: string, since?: number, limit?: number): Promise<any> {
        this.record ('fetchOHLCV', [ symbol, timeframe, since, limit ]);
        const rows = (since === undefined) ? this.ohlcv : this.ohlcv.filter ((row) => row[0] >= since);
        return (since === undefined) ? rows.slice (-(limit ?? 100)) : rows.slice (0, limit ?? 100);
    }

    async fetchOrderBook (symbol: string, limit?: number): Promise<any> {
        this.record ('fetchOrderBook', [ symbol, limit ]);
        const side = (sign: number) => Array.from ({ 'length': 200 }, (_, i) => [ 100 + sign * (i + 1), 1 ]);
        return { symbol, 'bids': side (-1), 'asks': side (1), 'timestamp': 1700000000000 };
    }

    async fetchTickers (symbols: string[]): Promise<any> {
        this.record ('fetchTickers', [ symbols ]);
        const out: Record<string, any> = {};
        for (const symbol of symbols) {
            out[symbol] = { symbol, 'last': 1, 'bid': 0.9, 'ask': 1.1, 'percentage': 2, 'baseVolume': 10, 'quoteVolume': 10, 'timestamp': 1700000000000 };
        }
        return out;
    }

    async fetchTicker (symbol: string): Promise<any> {
        this.record ('fetchTicker', [ symbol ]);
        return { symbol, 'last': 1 };
    }

    restCalls (): number {
        return this.calls.length;
    }
}

export async function until (predicate: () => boolean, timeoutMs = 2000): Promise<void> {
    const started = Date.now ();
    while (!predicate ()) {
        if (Date.now () - started > timeoutMs) {
            throw new Error ('condition not met within ' + timeoutMs + ' ms');
        }
        await new Promise ((resolve) => setTimeout (resolve, 5));
    }
}
