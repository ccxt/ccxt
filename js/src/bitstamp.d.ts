import Exchange from './abstract/bitstamp.js';
import type { Balances, Currency, Int, Market, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, Transaction } from './base/types.js';
/**
 * @class bitstamp
 * @augments Exchange
 */
export default class bitstamp extends Exchange {
    describe(): any;
    fetchMarkets(params?: {}): Promise<any[]>;
    constructCurrencyObject(id: any, code: any, name: any, precision: any, minCost: any, originalPayload: any): {
        id: any;
        code: any;
        info: any;
        type: string;
        name: any;
        active: boolean;
        deposit: any;
        withdraw: any;
        fee: number;
        precision: number;
        limits: {
            amount: {
                min: number;
                max: any;
            };
            price: {
                min: number;
                max: any;
            };
            cost: {
                min: any;
                max: any;
            };
            withdraw: {
                min: any;
                max: any;
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
    getCurrencyIdFromTransaction(transaction: any): string;
    getMarketFromTrade(trade: any): import("./base/types.js").MarketInterface;
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
    fetchTransactionFees(codes?: any, params?: {}): Promise<{}>;
    parseTransactionFees(response: any, codes?: any): {};
    fetchDepositWithdrawFees(codes?: Strings, params?: {}): Promise<{}>;
    parseDepositWithdrawFees(response: any, codes?: any, currencyIdKey?: any): {};
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: any, price?: any, params?: {}): Promise<Order>;
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<any>;
    cancelAllOrders(symbol?: Str, params?: {}): Promise<any>;
    parseOrderStatus(status: any): string;
    fetchOrderStatus(id: string, symbol?: Str, params?: {}): Promise<string>;
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchDepositsWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    parseTransaction(transaction: any, currency?: Currency): Transaction;
    parseTransactionStatus(status: any): string;
    parseOrder(order: any, market?: Market): Order;
    parseLedgerEntryType(type: any): string;
    parseLedgerEntry(item: any, currency?: Currency): {
        id: string;
        info: any;
        timestamp: number;
        datetime: string;
        direction: string;
        account: any;
        referenceId: string;
        referenceAccount: any;
        type: string;
        currency: any;
        amount: number;
        before: any;
        after: any;
        status: string;
        fee: import("./base/types.js").FeeInterface;
    } | {
        id: string;
        info: any;
        timestamp: number;
        datetime: string;
        direction: any;
        account: any;
        referenceId: string;
        referenceAccount: any;
        type: string;
        currency: string;
        amount: number;
        before: any;
        after: any;
        status: string;
        fee: import("./base/types.js").FeeInterface;
    };
    fetchLedger(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<any>;
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    getCurrencyName(code: any): any;
    isFiat(code: any): boolean;
    fetchDepositAddress(code: string, params?: {}): Promise<{
        currency: string;
        address: string;
        tag: string;
        network: any;
        info: any;
    }>;
    withdraw(code: string, amount: any, address: any, tag?: any, params?: {}): Promise<Transaction>;
    nonce(): number;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(httpCode: any, reason: any, url: any, method: any, headers: any, body: any, response: any, requestHeaders: any, requestBody: any): any;
}
