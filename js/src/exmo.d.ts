import Exchange from './abstract/exmo.js';
import { Dictionary, Int, Order, OrderSide, OrderType, Trade, OrderBook, OHLCV, Balances, Str, Transaction, Ticker, Tickers, Strings, Market, Currency } from './base/types.js';
/**
 * @class exmo
 * @extends Exchange
 */
export default class exmo extends Exchange {
    describe(): any;
    modifyMarginHelper(symbol: string, amount: any, type: any, params?: {}): Promise<{
        info: any;
        type: any;
        amount: any;
        code: any;
        symbol: string;
        total: any;
        status: string;
    }>;
    parseMarginModification(data: any, market?: Market): {
        info: any;
        type: any;
        amount: any;
        code: any;
        symbol: string;
        total: any;
        status: string;
    };
    reduceMargin(symbol: string, amount: any, params?: {}): Promise<{
        info: any;
        type: any;
        amount: any;
        code: any;
        symbol: string;
        total: any;
        status: string;
    }>;
    addMargin(symbol: string, amount: any, params?: {}): Promise<{
        info: any;
        type: any;
        amount: any;
        code: any;
        symbol: string;
        total: any;
        status: string;
    }>;
    fetchTradingFees(params?: {}): Promise<{}>;
    fetchPrivateTradingFees(params?: {}): Promise<{}>;
    fetchPublicTradingFees(params?: {}): Promise<{}>;
    parseFixedFloatValue(input: any): number;
    fetchTransactionFees(codes?: any, params?: {}): Promise<{}>;
    fetchDepositWithdrawFees(codes?: Strings, params?: {}): Promise<any>;
    parseDepositWithdrawFee(fee: any, currency?: Currency): any;
    fetchCurrencies(params?: {}): Promise<{}>;
    fetchMarkets(params?: {}): Promise<any[]>;
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    parseBalance(response: any): Balances;
    fetchBalance(params?: {}): Promise<Balances>;
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    fetchOrderBooks(symbols?: Strings, limit?: Int, params?: {}): Promise<Dictionary<OrderBook>>;
    parseTicker(ticker: any, market?: Market): Ticker;
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    parseTrade(trade: any, market?: Market): Trade;
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: any, price?: any, params?: {}): Promise<Order>;
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    fetchOrderTrades(id: string, symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    parseStatus(status: any): string;
    parseSide(orderType: any): string;
    parseOrder(order: any, market?: Market): Order;
    fetchCanceledOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<any[]>;
    editOrder(id: string, symbol: any, type: any, side: any, amount?: any, price?: any, params?: {}): Promise<Order>;
    fetchDepositAddress(code: string, params?: {}): Promise<{
        currency: string;
        address: any;
        tag: any;
        network: any;
        info: any;
    }>;
    getMarketFromTrades(trades: any): any;
<<<<<<< HEAD
    withdraw(code: string, amount: any, address: any, tag?: any, params?: {}): Promise<{
        info: any;
        id: string;
        txid: string;
        type: string;
        currency: any;
        network: string;
        amount: number;
        status: string;
        timestamp: number;
        datetime: string;
        address: any;
        addressFrom: any;
        addressTo: any;
        tag: any;
        tagFrom: any;
        tagTo: any;
        updated: number;
        comment: any;
        fee: {
            currency: any;
            cost: any;
            rate: any;
        };
    }>;
    parseTransactionStatus(status: any): string;
    parseTransaction(transaction: any, currency?: any): {
        info: any;
        id: string;
        txid: string;
        type: string;
        currency: any;
        network: string;
        amount: number;
        status: string;
        timestamp: number;
        datetime: string;
        address: any;
        addressFrom: any;
        addressTo: any;
        tag: any;
        tagFrom: any;
        tagTo: any;
        updated: number;
        comment: any;
        fee: {
            currency: any;
            cost: any;
            rate: any;
        };
    };
    fetchDepositsWithdrawals(code?: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    fetchWithdrawals(code?: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    fetchWithdrawal(id: string, code?: string, params?: {}): Promise<{
        info: any;
        id: string;
        txid: string;
        type: string;
        currency: any;
        network: string;
        amount: number;
        status: string;
        timestamp: number;
        datetime: string;
        address: any;
        addressFrom: any;
        addressTo: any;
        tag: any;
        tagFrom: any;
        tagTo: any;
        updated: number;
        comment: any;
        fee: {
            currency: any;
            cost: any;
            rate: any;
        };
    }>;
    fetchDeposit(id?: any, code?: string, params?: {}): Promise<{
        info: any;
        id: string;
        txid: string;
        type: string;
        currency: any;
        network: string;
        amount: number;
        status: string;
        timestamp: number;
        datetime: string;
        address: any;
        addressFrom: any;
        addressTo: any;
        tag: any;
        tagFrom: any;
        tagTo: any;
        updated: number;
        comment: any;
        fee: {
            currency: any;
            cost: any;
            rate: any;
        };
    }>;
    fetchDeposits(code?: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
=======
    withdraw(code: string, amount: any, address: any, tag?: any, params?: {}): Promise<Transaction>;
    parseTransactionStatus(status: any): string;
<<<<<<< HEAD
    parseTransaction(transaction: any, currency?: any): Transaction;
<<<<<<< HEAD
    fetchDepositsWithdrawals(code?: string, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    fetchWithdrawals(code?: string, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    fetchWithdrawal(id: string, code?: string, params?: {}): Promise<Transaction>;
    fetchDeposit(id?: any, code?: string, params?: {}): Promise<Transaction>;
    fetchDeposits(code?: string, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
>>>>>>> 1a5931741ea069834b52aa71871d9b8ccba70afe
=======
=======
    parseTransaction(transaction: any, currency?: Currency): Transaction;
>>>>>>> 055794d8789e08535c7d6feb0b1c77db77c1f0ea
    fetchDepositsWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    fetchWithdrawal(id: string, code?: Str, params?: {}): Promise<Transaction>;
    fetchDeposit(id?: any, code?: Str, params?: {}): Promise<Transaction>;
    fetchDeposits(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
>>>>>>> 5a483c50bd8a5c4ae57e5d31a9de8caed1148cc1
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    nonce(): number;
    handleErrors(httpCode: any, reason: any, url: any, method: any, headers: any, body: any, response: any, requestHeaders: any, requestBody: any): any;
}
