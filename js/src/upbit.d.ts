import Exchange from './abstract/upbit.js';
import { Balances, Currency, Dictionary, Int, Market, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, Transaction } from './base/types.js';
/**
 * @class upbit
 * @extends Exchange
 */
export default class upbit extends Exchange {
    describe(): undefined;
    fetchCurrency(code: string, params?: {}): Promise<{
        info: any;
        id: Str;
        code: string;
        name: string;
        active: boolean;
        fee: import("./base/types.js").Num;
        precision: undefined;
        limits: {
            withdraw: {
                min: import("./base/types.js").Num;
                max: undefined;
            };
        };
    }>;
    fetchCurrencyById(id: string, params?: {}): Promise<{
        info: any;
        id: Str;
        code: string;
        name: string;
        active: boolean;
        fee: import("./base/types.js").Num;
        precision: undefined;
        limits: {
            withdraw: {
                min: import("./base/types.js").Num;
                max: undefined;
            };
        };
    }>;
    fetchMarket(symbol: string, params?: {}): Promise<{
        id: Str;
        symbol: string;
        base: string;
        quote: string;
        settle: undefined;
        baseId: Str;
        quoteId: Str;
        settleId: undefined;
        type: string;
        spot: boolean;
        margin: boolean;
        swap: boolean;
        future: boolean;
        option: boolean;
        active: boolean;
        contract: boolean;
        linear: undefined;
        inverse: undefined;
        taker: number;
        maker: number;
        contractSize: undefined;
        expiry: undefined;
        expiryDatetime: undefined;
        strike: undefined;
        optionType: undefined;
        precision: {
            amount: number;
            price: number;
        };
        limits: {
            leverage: {
                min: undefined;
                max: undefined;
            };
            amount: {
                min: import("./base/types.js").Num;
                max: undefined;
            };
            price: {
                min: undefined;
                max: undefined;
            };
            cost: {
                min: import("./base/types.js").Num;
                max: import("./base/types.js").Num;
            };
            info: any;
        };
    }>;
    fetchMarketById(id: string, params?: {}): Promise<{
        id: Str;
        symbol: string;
        base: string;
        quote: string;
        settle: undefined;
        baseId: Str;
        quoteId: Str;
        settleId: undefined;
        type: string;
        spot: boolean;
        margin: boolean;
        swap: boolean;
        future: boolean;
        option: boolean;
        active: boolean;
        contract: boolean;
        linear: undefined;
        inverse: undefined;
        taker: number;
        maker: number;
        contractSize: undefined;
        expiry: undefined;
        expiryDatetime: undefined;
        strike: undefined;
        optionType: undefined;
        precision: {
            amount: number;
            price: number;
        };
        limits: {
            leverage: {
                min: undefined;
                max: undefined;
            };
            amount: {
                min: import("./base/types.js").Num;
                max: undefined;
            };
            price: {
                min: undefined;
                max: undefined;
            };
            cost: {
                min: import("./base/types.js").Num;
                max: import("./base/types.js").Num;
            };
            info: any;
        };
    }>;
    fetchMarkets(params?: {}): Promise<Market[]>;
    parseMarket(market: any): Market;
    parseBalance(response: any): Balances;
    fetchBalance(params?: {}): Promise<Balances>;
    fetchOrderBooks(symbols?: Strings, limit?: Int, params?: {}): Promise<Dictionary<OrderBook>>;
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    parseTicker(ticker: any, market?: Market): Ticker;
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    parseTrade(trade: any, market?: Market): Trade;
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchTradingFee(symbol: string, params?: {}): Promise<{
        info: any;
        symbol: string;
        maker: number;
        taker: number;
        percentage: boolean;
        tierBased: boolean;
    }>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: any, price?: undefined, params?: {}): Promise<Order>;
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    fetchDeposits(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    parseTransactionStatus(status: any): Str;
    parseTransaction(transaction: any, currency?: Currency): Transaction;
    parseOrderStatus(status: any): Str;
    parseOrder(order: any, market?: Market): Order;
    fetchOrdersByState(state: any, symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchCanceledOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    fetchDepositAddresses(codes?: undefined, params?: {}): Promise<{}>;
    parseDepositAddress(depositAddress: any, currency?: Currency): {
        currency: string;
        address: Str;
        tag: Str;
        network: undefined;
        info: any;
    };
    fetchDepositAddress(code: string, params?: {}): Promise<{
        currency: string;
        address: Str;
        tag: Str;
        network: undefined;
        info: any;
    }>;
    createDepositAddress(code: string, params?: {}): Promise<{
        currency: string;
        address: Str;
        tag: Str;
        network: undefined;
        info: any;
    }>;
    withdraw(code: string, amount: any, address: any, tag?: undefined, params?: {}): Promise<Transaction>;
    nonce(): number;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: undefined, body?: undefined): {
        url: any;
        method: string;
        body: undefined;
        headers: undefined;
    };
    handleErrors(httpCode: any, reason: any, url: any, method: any, headers: any, body: any, response: any, requestHeaders: any, requestBody: any): undefined;
}
