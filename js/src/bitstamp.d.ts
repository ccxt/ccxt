import Exchange from './abstract/bitstamp.js';
import { Balances, Currency, Int, Market, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, Transaction } from './base/types.js';
/**
 * @class bitstamp
 * @extends Exchange
 */
export default class bitstamp extends Exchange {
    describe(): undefined;
    fetchMarkets(params?: {}): Promise<never[]>;
    constructCurrencyObject(id: any, code: any, name: any, precision: any, minCost: any, originalPayload: any): {
        id: any;
        code: any;
        info: any;
        type: string;
        name: any;
        active: boolean;
        deposit: undefined;
        withdraw: undefined;
        fee: import("./base/types.js").Num;
        precision: number;
        limits: {
            amount: {
                min: number;
                max: undefined;
            };
            price: {
                min: number;
                max: undefined;
            };
            cost: {
                min: any;
                max: undefined;
            };
            withdraw: {
                min: undefined;
                max: undefined;
            };
        };
        networks: {};
    };
    fetchMarketsFromCache(params?: {}): Promise<any>;
    fetchCurrencies(params?: {}): Promise<{}>;
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    parseTicker(ticker: any, market?: Market): Ticker;
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    getCurrencyIdFromTransaction(transaction: any): string | undefined;
    getMarketFromTrade(trade: any): import("./base/types.js").MarketInterface | undefined;
    parseTrade(trade: any, market?: Market): Trade;
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    parseBalance(response: any): Balances;
    fetchBalance(params?: {}): Promise<Balances>;
    fetchTradingFee(symbol: string, params?: {}): Promise<{
        info: any;
        symbol: string;
        maker: number;
        taker: number;
    }>;
    parseTradingFee(fee: any, market?: Market): {
        info: any;
        symbol: string;
        maker: number;
        taker: number;
    };
    parseTradingFees(fees: any): {
        info: any;
    };
    fetchTradingFees(params?: {}): Promise<{
        info: any;
    }>;
    fetchTransactionFees(codes?: undefined, params?: {}): Promise<{}>;
    parseTransactionFees(response: any, codes?: undefined): {};
    fetchDepositWithdrawFees(codes?: Strings, params?: {}): Promise<{}>;
    parseDepositWithdrawFees(response: any, codes?: undefined, currencyIdKey?: undefined): {};
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: any, price?: undefined, params?: {}): Promise<Order>;
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<any>;
    cancelAllOrders(symbol?: Str, params?: {}): Promise<any>;
    parseOrderStatus(status: any): Str;
    fetchOrderStatus(id: string, symbol?: Str, params?: {}): Promise<Str>;
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchDepositsWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    parseTransaction(transaction: any, currency?: Currency): Transaction;
    parseTransactionStatus(status: any): Str;
    parseOrder(order: any, market?: Market): Order;
    parseLedgerEntryType(type: any): Str;
    parseLedgerEntry(item: any, currency?: Currency): {
        id: Str;
        info: any;
        timestamp: Int;
        datetime: Str;
        direction: string;
        account: undefined;
        referenceId: Str;
        referenceAccount: undefined;
        type: string;
        currency: any;
        amount: import("./base/types.js").Num;
        before: undefined;
        after: undefined;
        status: string;
        fee: import("./base/types.js").Fee;
    } | {
        id: Str;
        info: any;
        timestamp: Int;
        datetime: Str;
        direction: undefined;
        account: undefined;
        referenceId: Str;
        referenceAccount: undefined;
        type: Str;
        currency: Str;
        amount: import("./base/types.js").Num;
        before: undefined;
        after: undefined;
        status: string;
        fee: import("./base/types.js").Fee;
    };
    fetchLedger(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<any>;
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    getCurrencyName(code: any): any;
    isFiat(code: any): boolean;
    fetchDepositAddress(code: string, params?: {}): Promise<{
        currency: string;
        address: Str;
        tag: Str;
        network: undefined;
        info: any;
    }>;
    withdraw(code: string, amount: any, address: any, tag?: undefined, params?: {}): Promise<Transaction>;
    nonce(): number;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: undefined, body?: undefined): {
        url: string;
        method: string;
        body: undefined;
        headers: undefined;
    };
    handleErrors(httpCode: any, reason: any, url: any, method: any, headers: any, body: any, response: any, requestHeaders: any, requestBody: any): undefined;
}
