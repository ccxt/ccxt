// ---------------------------------------------------------------------------

import Exchange from './abstract/gmx.js';
import {
    ArgumentsRequired,
    AuthenticationError,
    BadRequest,
    BadResponse,
    ExchangeError,
    ExchangeNotAvailable,
    InsufficientFunds,
    InvalidAddress,
    InvalidOrder,
    NetworkError,
    NotSupported,
    NullResponse,
    OperationFailed,
    OrderNotFound,
    PermissionDenied,
    RateLimitExceeded,
    RequestTimeout,
} from './base/errors.js';
import type {
    Balances,
    Currencies,
    FundingHistory,
    FundingRate,
    FundingRateHistory,
    Int,
    Leverage,
    LeverageTiers,
    LeverageTier,
    Market,
    MarginModification,
    Num,
    OHLCV,
    OpenInterest,
    OpenInterests,
    Order,
    OrderBook,
    OrderSide,
    OrderType,
    Position,
    Str,
    Strings,
    Ticker,
    Tickers,
    Trade,
} from './base/types.js';

// ---------------------------------------------------------------------------

export default class gmx extends Exchange {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'gmx',
            'name': 'GMX',
            'countries': undefined,
            'rateLimit': 2000,
            'certified': false,
            'pro': false,
            'dex': true,
            'has': {
                'CORS': undefined,
                'spot': false,
                'margin': true,
                'swap': true,
                'future': true,
                'option': false,
                'addMargin': true,
                'cancelAllOrders': false,
                'cancelOrder': true,
                'cancelOrders': true,
                'createLimitBuyOrder': true,
                'createLimitOrder': true,
                'createLimitSellOrder': true,
                'createMarketBuyOrder': true,
                'createMarketOrder': true,
                'createMarketSellOrder': true,
                'createOrder': true,
                'editOrder': false,
                'fetchBalance': true,
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchFundingHistory': true,
                'fetchFundingRate': true,
                'fetchFundingRateHistory': true,
                'fetchL2OrderBook': false,
                'fetchLeverage': true,
                'fetchLeverageTiers': true,
                'fetchMarketLeverageTiers': true,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterest': true,
                'fetchOpenInterestHistory': true,
                'fetchOpenInterests': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchPositions': true,
                'fetchStatus': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'reduceMargin': true,
                'setLeverage': true,
                'ws': false,
            },
            'urls': {
                'logo': undefined,
                'api': {
                    'rest': 'http://127.0.0.1:8000',
                },
                'www': 'https://gmx.io',
                'doc': [
                    'https://docs.gmx.io/',
                ],
            },
            'api': {
                'public': {
                    'get': {
                        'healthz': 1,
                        'describe': 1,
                    },
                },
                'private': {
                    'post': {
                        'call': 1,
                    },
                },
            },
            'requiredCredentials': {
                'apiKey': false,
                'secret': false,
                'uid': false,
                'accountId': false,
                'login': false,
                'password': false,
                'twofa': false,
                'privateKey': false,
                'walletAddress': false,
                'token': false,
            },
            'httpExceptions': {
                '401': AuthenticationError,
                '403': AuthenticationError,
                '408': RequestTimeout,
                '429': RateLimitExceeded,
                '500': ExchangeNotAvailable,
                '503': ExchangeNotAvailable,
            },
            'options': {
                'bridgeUrl': 'http://127.0.0.1:8000',
                'token': undefined,
            },
        });
    }

    getBridgeUrl (): string {
        const fromInstance = this.safeString2 (this, 'bridgeUrl', 'bridgeURL');
        const fromOptions = this.safeString2 (this.options, 'bridgeUrl', 'bridgeURL');
        const fromUrls = this.safeString (this.safeDict (this.urls, 'api'), 'rest');
        const url = fromInstance || fromOptions || fromUrls;
        if (url === undefined) {
            throw new ArgumentsRequired (this.id + ' requires bridgeUrl in the constructor');
        }
        return url.replace (/\/+$/, '');
    }

    getBridgeToken (): Str {
        const fromInstance = this.safeString2 (this, 'token', 'authToken');
        if (fromInstance !== undefined) {
            return fromInstance;
        }
        const token = this.safeString2 (this.options, 'token', 'authToken');
        if (token !== undefined) {
            return token;
        }
        return undefined;
    }

    bridgeMethodName (methodName: string): string {
        return methodName.replace (/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase ();
    }

    bridgeErrorToException (error): Error {
        const errorType = this.safeString (error, 'ccxt_error') || this.safeString (error, 'type') || 'ExchangeError';
        const message = this.safeString (error, 'message') || (this.id + ' bridge request failed');
        const exceptions = {
            'AuthenticationError': AuthenticationError,
            'BadRequest': BadRequest,
            'BadResponse': BadResponse,
            'ExchangeError': ExchangeError,
            'ExchangeNotAvailable': ExchangeNotAvailable,
            'InsufficientFunds': InsufficientFunds,
            'InvalidAddress': InvalidAddress,
            'InvalidOrder': InvalidOrder,
            'NetworkError': NetworkError,
            'NotSupported': NotSupported,
            'NullResponse': NullResponse,
            'OperationFailed': OperationFailed,
            'OrderNotFound': OrderNotFound,
            'PermissionDenied': PermissionDenied,
            'RateLimitExceeded': RateLimitExceeded,
            'RequestTimeout': RequestTimeout,
        };
        const ExceptionClass = this.safeValue (exceptions, errorType, ExchangeError);
        return new ExceptionClass (message);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const url = this.getBridgeUrl () + '/' + path;
        headers = headers || {};
        if (api === 'private') {
            const token = this.getBridgeToken ();
            if (token !== undefined) {
                headers['Authorization'] = 'Bearer ' + token;
            }
        }
        if (method === 'POST') {
            headers['Content-Type'] = 'application/json';
            body = this.json (params);
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async requestBridge (localMethod: string, args = [], kwargs = {}) {
        const request = {
            'id': this.numberToString (this.milliseconds ()) + '-' + localMethod,
            'method': this.bridgeMethodName (localMethod),
            'args': args,
            'kwargs': kwargs,
        };
        const response = await this.privatePostCall (request);
        const ok = this.safeBool (response, 'ok');
        if (!ok) {
            const error = this.safeDict (response, 'error', {});
            throw this.bridgeErrorToException (error);
        }
        return this.safeValue (response, 'result');
    }

    async fetchMarkets (params = {}): Promise<Market[]> {
        return await this.requestBridge ('fetchMarkets', [], { 'params': params });
    }

    async fetchCurrencies (params = {}): Promise<Currencies> {
        return await this.requestBridge ('fetchCurrencies', [], { 'params': params });
    }

    async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        return await this.requestBridge ('fetchTicker', [ symbol ], { 'params': params });
    }

    async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        return await this.requestBridge ('fetchTickers', [ symbols ], { 'params': params });
    }

    async fetchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        return await this.requestBridge ('fetchOHLCV', [ symbol, timeframe, since, limit ], { 'params': params });
    }

    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        return await this.requestBridge ('fetchTrades', [ symbol, since, limit ], { 'params': params });
    }

    async fetchTime (params = {}): Promise<number> {
        return await this.requestBridge ('fetchTime', [], { 'params': params });
    }

    async fetchStatus (params = {}): Promise<any> {
        return await this.requestBridge ('fetchStatus', [], { 'params': params });
    }

    async fetchOpenInterest (symbol: string, params = {}): Promise<OpenInterest> {
        return await this.requestBridge ('fetchOpenInterest', [ symbol ], { 'params': params });
    }

    async fetchOpenInterestHistory (symbol: string, timeframe = '1h', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OpenInterest[]> {
        return await this.requestBridge ('fetchOpenInterestHistory', [ symbol, timeframe, since, limit ], { 'params': params });
    }

    async fetchFundingRate (symbol: string, params = {}): Promise<FundingRate> {
        return await this.requestBridge ('fetchFundingRate', [ symbol ], { 'params': params });
    }

    async fetchFundingRateHistory (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<FundingRateHistory[]> {
        return await this.requestBridge ('fetchFundingRateHistory', [ symbol, since, limit ], { 'params': params });
    }

    async fetchFundingHistory (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<FundingHistory[]> {
        return await this.requestBridge ('fetchFundingHistory', [ symbol, since, limit ], { 'params': params });
    }

    async fetchBalance (params = {}): Promise<Balances> {
        return await this.requestBridge ('fetchBalance', [], { 'params': params });
    }

    async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        return await this.requestBridge ('fetchOpenOrders', [ symbol, since, limit ], { 'params': params });
    }

    async fetchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        return await this.requestBridge ('fetchMyTrades', [ symbol, since, limit ], { 'params': params });
    }

    async fetchPositions (symbols: Strings = undefined, params = {}): Promise<Position[]> {
        return await this.requestBridge ('fetchPositions', [ symbols ], { 'params': params });
    }

    async fetchMarketLeverageTiers (symbol: string, params = {}): Promise<LeverageTier[]> {
        return await this.requestBridge ('fetchMarketLeverageTiers', [ symbol ], { 'params': params });
    }

    async fetchLeverageTiers (symbols: Strings = undefined, params = {}): Promise<LeverageTiers> {
        return await this.requestBridge ('fetchLeverageTiers', [ symbols ], { 'params': params });
    }

    async setLeverage (leverage: number, symbol: Str = undefined, params = {}): Promise<Leverage> {
        return await this.requestBridge ('setLeverage', [ leverage, symbol ], { 'params': params });
    }

    async fetchLeverage (symbol: Str = undefined, params = {}): Promise<Leverage> {
        return await this.requestBridge ('fetchLeverage', [ symbol ], { 'params': params });
    }

    async addMargin (symbol: string, amount: number, params = {}): Promise<MarginModification> {
        return await this.requestBridge ('addMargin', [ symbol, amount ], { 'params': params });
    }

    async reduceMargin (symbol: string, amount: number, params = {}): Promise<MarginModification> {
        return await this.requestBridge ('reduceMargin', [ symbol, amount ], { 'params': params });
    }

    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}): Promise<Order> {
        return await this.requestBridge ('createOrder', [ symbol, type, side, amount, price ], { 'params': params });
    }

    async createMarketBuyOrder (symbol: string, amount: number, params = {}): Promise<Order> {
        return await this.requestBridge ('createMarketBuyOrder', [ symbol, amount ], { 'params': params });
    }

    async createMarketSellOrder (symbol: string, amount: number, params = {}): Promise<Order> {
        return await this.requestBridge ('createMarketSellOrder', [ symbol, amount ], { 'params': params });
    }

    async createLimitOrder (symbol: string, side: OrderSide, amount: number, price: number, params = {}): Promise<Order> {
        return await this.requestBridge ('createLimitOrder', [ symbol, side, amount, price ], { 'params': params });
    }

    async cancelOrder (id: string, symbol: Str = undefined, params = {}): Promise<Order> {
        return await this.requestBridge ('cancelOrder', [ id, symbol ], { 'params': params });
    }

    async cancelOrders (ids: Strings = undefined, symbol: Str = undefined, params = {}): Promise<Order[]> {
        return await this.requestBridge ('cancelOrders', [ ids, symbol ], { 'params': params });
    }

    async fetchOrder (id: string, symbol: Str = undefined, params = {}): Promise<Order> {
        return await this.requestBridge ('fetchOrder', [ id, symbol ], { 'params': params });
    }

    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        return await this.requestBridge ('fetchOrderBook', [ symbol, limit ], { 'params': params });
    }

    async fetchClosedOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        return await this.requestBridge ('fetchClosedOrders', [ symbol, since, limit ], { 'params': params });
    }

    async fetchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        return await this.requestBridge ('fetchOrders', [ symbol, since, limit ], { 'params': params });
    }

    async fetchOpenInterests (symbols: Strings = undefined, params = {}): Promise<OpenInterests> {
        return await this.requestBridge ('fetchOpenInterests', [ symbols ], { 'params': params });
    }
}
