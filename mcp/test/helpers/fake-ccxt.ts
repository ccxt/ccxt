// A minimal in-memory ccxt stand-in for tests: one exchange ("fakex") with one market,
// deterministic prices, recorded writes, and a couple of implicit endpoints. Markets are
// set in the constructor so the pools' ensureMarketsLoaded never touches the disk cache.
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
        'createOrder': true,
        'cancelOrder': true,
        'cancelAllOrders': true,
        'withdraw': true,
        'transfer': true,
        'fetchDepositAddress': true,
        'setLeverage': true,
        'closePosition': true,
    };
    markets: Record<string, any> = { 'BTC/USDT': MARKET };
    config: Record<string, any>;
    sandboxMode = false;
    createdOrders: any[] = [];
    canceled: any[] = [];
    withdrawals: any[] = [];
    implicitCalls: any[] = [];
    log = (..._args: any[]) => {};

    constructor (config: Record<string, any> = {}) {
        this.config = config;
        this.options = { ...(config['options'] ?? {}) };
        // implicit endpoints as own properties, like ccxt's defineRestApi
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

    async fetchOpenOrders (symbol?: string): Promise<any> {
        return [ { 'id': 'open-1', 'symbol': symbol ?? 'BTC/USDT', 'type': 'limit', 'side': 'buy', 'amount': 0.001, 'remaining': 0.001, 'price': 40000, 'status': 'open', 'info': { 'raw': true } } ];
    }

    async fetchOrder (id: string, symbol?: string): Promise<any> {
        return { id, 'symbol': symbol ?? 'BTC/USDT', 'type': 'limit', 'side': 'buy', 'amount': 0.001, 'remaining': 0.001, 'price': 40000, 'status': 'open', 'info': { 'raw': true } };
    }

    async fetchMyTrades (symbol?: string, _since?: number, limit = 50): Promise<any> {
        return Array.from ({ 'length': Math.min (limit, 3) }, (_, i) => ({ 'id': 'mt' + i, 'symbol': symbol ?? 'BTC/USDT', 'side': 'sell', 'price': 50000, 'amount': 0.001, 'info': { 'raw': true } }));
    }

    async createOrder (symbol: string, type: string, side: string, amount: number, price?: number, params: any = {}): Promise<any> {
        const order = { 'id': 'order-' + (this.createdOrders.length + 1), symbol, type, side, amount, price, 'status': 'open', 'clientOrderId': params['clientOrderId'], 'info': { 'raw': true } };
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

    async close (): Promise<void> {}
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

export function makeConfig (accounts: Record<string, Partial<AccountConfig>> = {}): ResolvedConfig {
    const resolved: Record<string, AccountConfig> = {};
    for (const [ name, account ] of Object.entries (accounts)) {
        resolved[name] = { name, 'exchange': 'fakex', ...account } as AccountConfig;
    }
    return {
        'accounts': resolved,
        'settings': { 'refreshMarketsTimeout': 86400000, 'maxResults': 100, 'strictPermissions': false, 'exchangeOptions': {} },
        'problems': [],
        'configPath': undefined,
    };
}
