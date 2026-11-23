// A minimal in-memory ccxt stand-in for tests: one exchange ("fakex") with one market,
// deterministic prices, recorded writes, and a couple of implicit endpoints. Markets are
// set in the constructor so the pools' ensureMarketsLoaded never touches the disk cache.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { ResolvedConfig, AccountConfig } from '../../ts/types.js';
import type { PoolsDeps } from '../../ts/pools.js';

export const MARKET = {
    'symbol': 'BTC/USDT',
    'id': 'BTCUSDT',
    'type': 'spot',
    'base': 'BTC',
    'quote': 'USDT',
    'settle': undefined,
    'active': true,
    'spot': true,
    'contract': false,
    'precision': { 'amount': 0.0001, 'price': 0.01 },
    'limits': { 'amount': { 'min': 0.0001, 'max': 1000 }, 'price': { 'min': 1, 'max': 1000000 }, 'cost': { 'min': 5, 'max': undefined } },
    'taker': 0.001,
    'maker': 0.001,
    'info': { 'raw': 'exchange-payload' },
};

export class FakeExchange {
    id = 'fakex';
    name = 'Fakex';
    certified = false;
    version = 'fake';
    rateLimit = 100;
    verbose = false;
    options: Record<string, any> = {};
    urls = { 'www': 'https://fakex.example', 'doc': 'https://docs.fakex.example', 'test': 'https://testnet.fakex.example' };
    requiredCredentials = { 'apiKey': true, 'secret': true };
    timeframes = { '1m': '1m', '1h': '1h', '1d': '1d' };
    features = { 'spot': { 'fetchOHLCV': { 'limit': 500, 'symbolRequired': true } } };
    has: Record<string, any> = {
        'fetchTicker': true,
        'fetchTickers': true,
        'fetchOrderBook': true,
        'fetchOHLCV': true,
        'fetchTrades': true,
        'fetchBalance': true,
        'fetchOpenOrders': true,
        'fetchOrder': true,
        'fetchMyTrades': true,
        'fetchPositions': false,
        'fetchFundingRate': true,
        'watchTicker': true,
        'watchOHLCV': true,
        'watchTrades': true,
        'watchOrderBook': false,
        'watchTickers': true, // multi-symbol STATE stream — used to test snapshot merging
        'watchMarkPrices': true, // STATE stream whose data lives in markPrice, not TICKER_FIELDS
        'watchOrderBookForSymbols': true, // order-book STATE stream (25 levels) — for watch_read depth
        'watchFundingRate': true, // single STATE stream that never ticks (parks waitForChange)
        'watchBidsAsks': true, // used to exercise the fatal-error path (always throws)
        'watchOrders': true,  // private — used to test the account-required guard
        'createOrder': true,
        'cancelOrder': true,
        'cancelAllOrders': true,
        'withdraw': true,
        'transfer': true,
        'fetchDepositAddress': true,
        'setLeverage': true,
        'closePosition': true,
        // non-method capability flags — truthy in `has` but NOT callable methods; they must
        // never leak into the unified-method surface (describe_method / describe_exchange)
        'spot': true,
        'swap': false,
        'publicAPI': true,
        'ws': true,
        'fetchGreeks': true, // a method flag with no corresponding function on this instance
    };
    markets: Record<string, any> = { 'BTC/USDT': MARKET };
    config: Record<string, any>;
    sandboxMode = false;
    createdOrders: any[] = [];
    canceled: any[] = [];
    withdrawals: any[] = [];
    implicitCalls: any[] = [];
    api: Record<string, any> = { 'public': { 'get': { 'time': 1 } }, 'private': { 'post': { 'order/cancel': 1 } } };
    log = (..._args: any[]) => {};

    constructor (config: Record<string, any> = {}) {
        this.config = config;
        this.options = { ...(config['options'] ?? {}) };
        // implicit endpoints, like ccxt's generated abstract methods
        (this as any)['publicGetTime'] = async (params: any = {}) => {
            this.implicitCalls.push ([ 'publicGetTime', params ]);
            return { 'serverTime': 1234567890 };
        };
        (this as any)['privatePostOrderCancel'] = async (params: any = {}) => {
            this.implicitCalls.push ([ 'privatePostOrderCancel', params ]);
            return { 'ok': 1 };
        };
    }

    setSandboxMode (enabled: boolean) {
        this.sandboxMode = enabled;
    }

    enableDemoTrading (_enabled: boolean) {}

    parse8601 (value: string): number | undefined {
        const parsed = Date.parse (value);
        return Number.isNaN (parsed) ? undefined : parsed;
    }

    iso8601 (timestamp: number): string | undefined {
        return Number.isFinite (timestamp) ? new Date (timestamp).toISOString () : undefined;
    }

    market (symbol: string): any {
        const market = this.markets[symbol];
        if (market === undefined) {
            throw new Error ('fakex does not have market symbol ' + symbol);
        }
        return market;
    }

    amountToPrecision (_symbol: string, amount: number): string {
        return String (amount);
    }

    priceToPrecision (_symbol: string, price: number): string {
        return String (price);
    }

    async loadMarkets (_reload = false): Promise<any> {
        return this.markets;
    }

    async fetchTicker (symbol: string): Promise<any> {
        return { symbol, 'last': 50000, 'bid': 49999, 'ask': 50001, 'timestamp': 1700000000000, 'datetime': '2023-11-14T22:13:20.000Z', 'info': { 'raw': true } };
    }

    async fetchTickers (symbols: string[]): Promise<any> {
        const result: Record<string, any> = {};
        for (const symbol of symbols) {
            result[symbol] = await this.fetchTicker (symbol);
        }
        return result;
    }

    async fetchOrderBook (symbol: string, limit = 20): Promise<any> {
        const level = (index: number) => [ 50000 - index, 1 ];
        return { symbol, 'timestamp': 1700000000000, 'datetime': null, 'nonce': 1, 'bids': Array.from ({ 'length': 200 }, (_, i) => level (i)), 'asks': Array.from ({ 'length': 200 }, (_, i) => level (-i)) };
    }

    async fetchOHLCV (_symbol: string, _timeframe = '1h', _since?: number, limit = 100): Promise<any> {
        return Array.from ({ 'length': Math.min (limit, 500) }, (_, i) => [ 1700000000000 + i * 3600000, 1, 2, 0.5, 1.5, 100 ]);
    }

    async fetchTrades (symbol: string, _since?: number, limit = 50): Promise<any> {
        return Array.from ({ 'length': Math.min (limit, 200) }, (_, i) => ({ 'id': 't' + i, symbol, 'side': 'buy', 'price': 50000, 'amount': 0.01, 'cost': 500, 'timestamp': 1700000000000, 'info': { 'raw': true } }));
    }

    async fetchBalance (): Promise<any> {
        return {
            'info': { 'raw': true },
            'timestamp': 1700000000000,
            'datetime': '2023-11-14T22:13:20.000Z',
            'free': {},
            'used': {},
            'total': {},
            'USDT': { 'free': 1000, 'used': 0, 'total': 1000 },
            'BTC': { 'free': 0, 'used': 0, 'total': 0 },
        };
    }

    async fetchFundingRate (symbol: string): Promise<any> {
        return { symbol, 'fundingRate': 0.0001, 'info': { 'raw': true } };
    }

    openOrdersFetches = 0;

    async fetchOpenOrders (symbol?: string): Promise<any> {
        this.openOrdersFetches += 1;
        return [ { 'id': 'open-1', 'symbol': symbol ?? 'BTC/USDT', 'type': 'limit', 'side': 'buy', 'amount': 0.001, 'remaining': 0.001, 'price': 40000, 'status': 'open', 'info': { 'raw': true } } ];
    }

    async fetchOrder (id: string, symbol?: string): Promise<any> {
        return { id, 'symbol': symbol ?? 'BTC/USDT', 'type': 'limit', 'side': 'buy', 'amount': 0.001, 'remaining': 0.001, 'price': 40000, 'status': 'open', 'info': { 'raw': true } };
    }

    async fetchMyTrades (symbol?: string, _since?: number, limit = 50): Promise<any> {
        return Array.from ({ 'length': Math.min (limit, 3) }, (_, i) => ({ 'id': 'mt' + i, 'symbol': symbol ?? 'BTC/USDT', 'side': 'sell', 'price': 50000, 'amount': 0.001, 'info': { 'raw': true } }));
    }

    async createOrder (symbol: string, type: string, side: string, amount: number, price?: number, params: any = {}): Promise<any> {
        // computed key so this method's SOURCE has no literal client-order-id token for the server's
        // injection source-inspection to match — the server does NOT inject, the order carries a
        // venue-assigned id instead, which exercises the meta fallback
        const cidKey = [ 'client', 'OrderId' ].join (''); // .join so the bundler can't fold it to a literal
        const n = this.createdOrders.length + 1;
        const order = { 'id': 'order-' + n, symbol, type, side, amount, price, 'status': 'open', [cidKey]: params[cidKey] ?? ('venue-cid-' + n), 'info': { 'raw': true } };
        this.createdOrders.push (order);
        return order;
    }

    async cancelOrder (id: string, symbol?: string): Promise<any> {
        this.canceled.push (id);
        return { id, symbol, 'status': 'canceled', 'info': { 'raw': true } };
    }

    async cancelAllOrders (symbol?: string): Promise<any> {
        return [ { 'id': 'open-1', symbol, 'status': 'canceled' } ];
    }

    async withdraw (code: string, amount: number, address: string): Promise<any> {
        this.withdrawals.push ({ code, amount, address });
        return { 'id': 'w-1', code, amount, address, 'status': 'pending', 'info': { 'raw': true } };
    }

    async transfer (code: string, amount: number, fromAccount: string, toAccount: string): Promise<any> {
        return { 'id': 'tr-1', code, amount, fromAccount, toAccount, 'info': { 'raw': true } };
    }

    async fetchDepositAddress (code: string): Promise<any> {
        return { 'currency': code, 'address': 'FAKEADDRESS123', 'tag': undefined, 'info': { 'raw': true } };
    }

    async setLeverage (leverage: number, symbol?: string): Promise<any> {
        return { leverage, symbol };
    }

    private watchTick = 0;
    closed = false;
    // rejecters for in-flight watch ticks, rejected on close() — mirrors ccxt.pro throwing
    // ExchangeClosedByUser at every pending watch future when the socket is closed
    private pendingTickRejecters: Array<(e: any) => void> = [];

    // ccxt.pro-style watch* methods: each awaited call resolves with the next incremental
    // update. A tiny UNREF'd delay keeps the registry's loop from hot-spinning and never
    // keeps the test process alive.
    async watchTicker (symbol: string): Promise<any> {
        await this.nextTick ();
        this.watchTick += 1;
        return { symbol, 'last': 50000 + this.watchTick, 'bid': 49999, 'ask': 50001, 'timestamp': 1700000000000 + this.watchTick, 'datetime': '2023-11-14T22:13:20.000Z', 'info': { 'raw': true } };
    }

    async watchOHLCV (_symbol: string, _timeframe = '1m'): Promise<any> {
        await this.nextTick ();
        this.watchTick += 1;
        return [ [ 1700000000000 + this.watchTick * 60000, 1, 2, 0.5, 1 + this.watchTick, 100 ] ];
    }

    async watchTrades (symbol: string): Promise<any> {
        await this.nextTick ();
        this.watchTick += 1;
        return [ { 'id': 'wt' + this.watchTick, symbol, 'side': 'buy', 'price': 50000, 'amount': 0.01, 'cost': 500, 'info': { 'raw': true } } ];
    }

    private tickerToggle = 0;

    // multi-symbol snapshot stream that, like ccxt.pro with newUpdates=true, returns only the
    // ONE symbol that changed this cycle — the server must merge these into a full snapshot
    async watchTickers (symbols?: string[]): Promise<any> {
        await this.nextTick ();
        this.watchTick += 1;
        const list = (Array.isArray (symbols) && symbols.length > 0) ? symbols : [ 'BTC/USDT' ];
        const symbol = list[this.tickerToggle % list.length];
        this.tickerToggle += 1;
        return { [symbol]: { symbol, 'last': 50000 + this.watchTick, 'bid': 49999, 'ask': 50001, 'info': { 'raw': true } } };
    }

    // multi-symbol STATE stream whose real data (markPrice) is NOT in TICKER_FIELDS — the
    // snapshot must not blank it (mergeDict blocker fix)
    async watchMarkPrices (symbols?: string[]): Promise<any> {
        await this.nextTick ();
        this.watchTick += 1;
        const list = (Array.isArray (symbols) && symbols.length > 0) ? symbols : [ 'BTC/USDT' ];
        const symbol = list[this.tickerToggle % list.length];
        this.tickerToggle += 1;
        return { [symbol]: { symbol, 'markPrice': 60000 + this.watchTick, 'indexPrice': 60001, 'last': undefined, 'timestamp': 1700000000000, 'info': { 'raw': true } } };
    }

    // a silent stream that never resolves, so a waitForChange read genuinely parks
    async watchFundingRate (): Promise<any> {
        return new Promise (() => undefined);
    }

    // order-book state stream returning 25 levels/side, to test watch_read's depth trimming
    async watchOrderBookForSymbols (symbols?: string[]): Promise<any> {
        await this.nextTick ();
        this.watchTick += 1;
        const symbol = (Array.isArray (symbols) && symbols.length > 0) ? symbols[0] : 'BTC/USDT';
        return {
            symbol, 'timestamp': 1700000000000, 'datetime': null, 'nonce': this.watchTick,
            'bids': Array.from ({ 'length': 25 }, (_, i) => [ 50000 - i, 1 ]),
            'asks': Array.from ({ 'length': 25 }, (_, i) => [ 50001 + i, 1 ]),
        };
    }

    // always throws a fatal-class error, to exercise the terminal-error socket release
    async watchBidsAsks (): Promise<any> {
        throw new BadSymbol ('fakex has no bidsAsks stream for this symbol');
    }

    private nextTick (): Promise<void> {
        return new Promise ((resolve, reject) => {
            this.pendingTickRejecters.push (reject);
            const t = setTimeout (resolve, 3);
            if (typeof (t as any).unref === 'function') {
                (t as any).unref ();
            }
        });
    }

    async close (): Promise<void> {
        this.closed = true;
        const rejecters = this.pendingTickRejecters.splice (0);
        for (const reject of rejecters) {
            reject (new ExchangeClosedByUser ('fakex closedByUser'));
        }
    }
}

// constructor.name === 'BadSymbol' matches the registry's fatal-error regex
class BadSymbol extends Error {}

// ccxt.pro rejects pending watch futures with this when a socket is closed
class ExchangeClosedByUser extends Error {}

// An account with something in it, for the account views (show_balance / show_orders /
// show_positions and the show_chart overlay): several holdings, orders in every state and
// derivatives positions. Calls are recorded on the class because the server builds its own
// instances; tests reset `calls` before use. Every id and amount is invented.
const spotMarket = (base: string, quote: string) => ({ ...MARKET, 'symbol': base + '/' + quote, 'id': base + quote, base, quote });

export class AccountExchange extends FakeExchange {
    static calls: [ string, any[] ][] = [];

    constructor (config: Record<string, any> = {}) {
        super (config);
        this.has = { ...this.has, 'fetchPositions': true, 'fetchClosedOrders': true, 'fetchCanceledAndClosedOrders': true, 'fetchOrders': true };
        this.markets = {
            'BTC/USDT': MARKET,
            'ETH/USDT': spotMarket ('ETH', 'USDT'),
            'SOL/USDT': spotMarket ('SOL', 'USDT'),
            'DOGE/USDT': { ...spotMarket ('DOGE', 'USDT'), 'active': false }, // delisted: not priced
            'XRP/USD': spotMarket ('XRP', 'USD'), // a USD market must not be mixed into a USDT valuation
        };
    }

    async fetchBalance (params: any = {}): Promise<any> {
        AccountExchange.calls.push ([ 'fetchBalance', [ params ] ]);
        return {
            'info': { 'raw': 'balance-payload' },
            'timestamp': 1700000000000,
            'datetime': '2023-11-14T22:13:20.000Z',
            'free': {},
            'used': {},
            'total': {},
            'SOL': { 'free': 10, 'used': 0, 'total': 10 },
            'USDT': { 'free': 900, 'used': 100, 'total': 1000 },
            'BTC': { 'free': 0.4, 'used': 0.1, 'total': 0.5 },
            'ETH': { 'free': 1.5, 'used': 0.5, 'total': undefined }, // a venue that omits totals
            'XRP': { 'free': 300, 'used': 0, 'total': 300 },
            'DOGE': { 'free': 5000, 'used': 0, 'total': 5000 },
            'ZERO': { 'free': 0, 'used': 0, 'total': 0 },
        };
    }

    async fetchTickers (symbols: string[]): Promise<any> {
        AccountExchange.calls.push ([ 'fetchTickers', [ symbols ] ]);
        const tickers: Record<string, any> = {
            'BTC/USDT': { 'symbol': 'BTC/USDT', 'last': 50000, 'info': { 'raw': true } },
            'ETH/USDT': { 'symbol': 'ETH/USDT', 'close': 2000 }, // no last
            'SOL/USDT': { 'symbol': 'SOL/USDT', 'bid': 99, 'ask': 101 }, // book only
        };
        const result: Record<string, any> = {};
        for (const symbol of symbols) {
            if (tickers[symbol] !== undefined) {
                result[symbol] = tickers[symbol];
            }
        }
        return result;
    }

    static order (id: string, timestamp: number | undefined, side: string, type: string, price: number | undefined, status: string, symbol = 'BTC/USDT'): any {
        return { id, timestamp, 'datetime': (timestamp === undefined) ? undefined : new Date (timestamp).toISOString (), symbol, type, side, price, 'amount': 0.01, 'filled': (status === 'closed') ? 0.01 : 0, 'remaining': (status === 'closed') ? 0 : 0.01, status, 'info': { 'raw': 'order-payload' } };
    }

    // deliberately not in time order, with a market order (no price) in the middle
    async fetchOpenOrders (symbol?: string, since?: number, limit?: number, params: any = {}): Promise<any> {
        AccountExchange.calls.push ([ 'fetchOpenOrders', [ symbol, since, limit, params ] ]);
        this.openOrdersFetches += 1;
        const orders = [
            AccountExchange.order ('o-2', 1700000002000, 'sell', 'limit', 52000, 'open'),
            AccountExchange.order ('o-market', 1700000001000, 'sell', 'market', undefined, 'open'),
            AccountExchange.order ('o-3', 1700000003000, 'buy', 'limit', 48000, 'open'),
            AccountExchange.order ('o-undated', undefined, 'buy', 'limit', 47000, 'open'),
            AccountExchange.order ('o-eth', 1700000000500, 'buy', 'limit', 1900, 'open', 'ETH/USDT'),
        ];
        return orders.filter ((order) => symbol === undefined || order.symbol === symbol);
    }

    async fetchClosedOrders (symbol?: string, since?: number, limit?: number, params: any = {}): Promise<any> {
        AccountExchange.calls.push ([ 'fetchClosedOrders', [ symbol, since, limit, params ] ]);
        return [ AccountExchange.order ('c-1', 1699990000000, 'buy', 'market', undefined, 'closed') ];
    }

    async fetchCanceledAndClosedOrders (symbol?: string, since?: number, limit?: number, params: any = {}): Promise<any> {
        AccountExchange.calls.push ([ 'fetchCanceledAndClosedOrders', [ symbol, since, limit, params ] ]);
        return [
            AccountExchange.order ('c-1', 1699990000000, 'buy', 'market', undefined, 'closed'),
            AccountExchange.order ('x-1', 1699980000000, 'sell', 'limit', 60000, 'canceled'),
        ];
    }

    async fetchOrders (symbol?: string, since?: number, limit = 50, params: any = {}): Promise<any> {
        AccountExchange.calls.push ([ 'fetchOrders', [ symbol, since, limit, params ] ]);
        return Array.from ({ 'length': limit }, (_, i) => AccountExchange.order ('all-' + i, 1700000000000 + i * 1000, (i % 3 === 0) ? 'sell' : 'buy', 'limit', 40000 + i, (i % 2 === 0) ? 'open' : 'closed'));
    }

    async fetchPositions (symbols?: string[], params: any = {}): Promise<any> {
        AccountExchange.calls.push ([ 'fetchPositions', [ symbols, params ] ]);
        const position = (symbol: string, side: string, contracts: any, unrealizedPnl: any, extra: any = {}) => ({ symbol, side, contracts, 'contractSize': 1, 'entryPrice': 100, 'markPrice': 110, unrealizedPnl, 'leverage': 5, 'marginMode': 'cross', 'info': { 'raw': 'position-payload' }, ...extra });
        const positions = [
            position ('BTC/USDT:USDT', 'long', 2, 20.5),
            position ('ETH/USDT:USDT', 'short', 3, -30.25),
            position ('SOL/USDT:USDT', 'long', 0, 0), // closed: zero contracts
            null,
            position ('XRP/USDT:USDT', 'long', undefined, 1, { 'notional': 0 }), // closed: zero notional
            position ('DOGE/USDT:USDT', 'long', '7', 0.5), // contracts as a string
        ];
        return positions.filter ((entry: any) => entry === null || symbols === undefined || symbols.includes (entry.symbol));
    }
}

// The view files (ts/ui/<view>.html) are authored separately from the tools that feed them,
// so a test that reads one waits for it to appear instead of failing on an unlucky ordering;
// once the file exists this returns at once. CCXT_MCP_TEST_VIEW_WAIT_MS shortens the wait.
export async function waitForViewFiles (files: string[]): Promise<void> {
    const uiDir = path.join (path.dirname (fileURLToPath (import.meta.url)), '..', '..', 'ts', 'ui');
    const budget = Number (process.env['CCXT_MCP_TEST_VIEW_WAIT_MS'] ?? 600000);
    const deadline = Date.now () + (Number.isFinite (budget) ? budget : 600000);
    const missing = () => files.filter ((file) => !fs.existsSync (path.join (uiDir, file)));
    while (missing ().length > 0 && Date.now () < deadline) {
        await new Promise ((resolve) => setTimeout (resolve, 2000));
    }
    if (missing ().length > 0) {
        throw new Error ('view file(s) missing from ts/ui: ' + missing ().join (', '));
    }
}

export const fakeCcxtModule = {
    'version': 'fake-1.0',
    'exchanges': [ 'fakex' ],
    'pro': { 'exchanges': [] },
    'prediction': undefined,
    'Exchange': FakeExchange,
    'fakex': FakeExchange,
};

export const fakePoolsDeps: PoolsDeps = {
    'exchangeClass': () => FakeExchange,
    'isKnownExchange': (id: string) => id === 'fakex',
    'allExchangeIds': () => [ 'fakex' ],
    'closestMatches': () => [ 'fakex' ],
};

export function makeConfig (accounts: Record<string, Partial<AccountConfig>> = {}, settings: Record<string, any> = {}): ResolvedConfig {
    const resolved: Record<string, AccountConfig> = {};
    for (const [ name, account ] of Object.entries (accounts)) {
        resolved[name] = { name, 'exchange': 'fakex', ...account } as AccountConfig;
    }
    return {
        'accounts': resolved,
        'settings': { 'refreshMarketsTimeout': 86400000, 'maxResults': 100, 'strictPermissions': false, 'exchangeOptions': {}, ...settings } as any,
        'problems': [],
        'configPath': undefined,
    };
}
