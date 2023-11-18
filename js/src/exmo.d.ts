import Exchange from './abstract/exmo.js';
import { Dictionary, Int, Order, OrderSide, OrderType, Trade, OrderBook, OHLCV, Balances, Str, Transaction, Ticker, Tickers, Strings, Market, Currency } from './base/types.js';
/**
 * @class exmo
 * @extends Exchange
 */
export default class exmo extends Exchange {
    describe(): undefined;
    modifyMarginHelper(symbol: string, amount: any, type: any, params?: {}): Promise<{
        info: any;
        type: undefined;
        amount: undefined;
        code: any;
        symbol: string;
        total: undefined;
        status: string;
    }>;
    parseMarginModification(data: any, market?: Market): {
        info: any;
        type: undefined;
        amount: undefined;
        code: any;
        symbol: string;
        total: undefined;
        status: string;
    };
    reduceMargin(symbol: string, amount: any, params?: {}): Promise<{
        info: any;
        type: undefined;
        amount: undefined;
        code: any;
        symbol: string;
        total: undefined;
        status: string;
    }>;
    addMargin(symbol: string, amount: any, params?: {}): Promise<{
        info: any;
        type: undefined;
        amount: undefined;
        code: any;
        symbol: string;
        total: undefined;
        status: string;
    }>;
    fetchTradingFees(params?: {}): Promise<any>;
    fetchPrivateTradingFees(params?: {}): Promise<{}>;
    fetchPublicTradingFees(params?: {}): Promise<{}>;
    parseFixedFloatValue(input: any): number | undefined;
    fetchTransactionFees(codes?: undefined, params?: {}): Promise<{}>;
    fetchDepositWithdrawFees(codes?: Strings, params?: {}): Promise<any>;
    parseDepositWithdrawFee(fee: any, currency?: Currency): any;
    fetchCurrencies(params?: {}): Promise<{}>;
    fetchMarkets(params?: {}): Promise<never[]>;
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
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: any, price?: undefined, params?: {}): Promise<Order>;
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    fetchOrderTrades(id: string, symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    parseStatus(status: any): Str;
    parseSide(orderType: any): Str;
    parseOrder(order: any, market?: Market): Order;
    fetchCanceledOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    editOrder(id: string, symbol: any, type: any, side: any, amount?: undefined, price?: undefined, params?: {}): Promise<Order>;
    fetchDepositAddress(code: string, params?: {}): Promise<{
        currency: string;
        address: undefined;
        tag: undefined;
        network: undefined;
        info: any;
    }>;
    getMarketFromTrades(trades: any): any;
    withdraw(code: string, amount: any, address: any, tag?: undefined, params?: {}): Promise<Transaction>;
    parseTransactionStatus(status: any): Str;
    parseTransaction(transaction: any, currency?: Currency): Transaction;
    fetchDepositsWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    fetchWithdrawal(id: string, code?: Str, params?: {}): Promise<Transaction>;
    fetchDeposit(id?: undefined, code?: Str, params?: {}): Promise<Transaction>;
    fetchDeposits(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: undefined, body?: undefined): {
        url: string;
        method: string;
        body: undefined;
        headers: undefined;
    };
    nonce(): number;
    handleErrors(httpCode: any, reason: any, url: any, method: any, headers: any, body: any, response: any, requestHeaders: any, requestBody: any): undefined;
}
