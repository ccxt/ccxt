import Exchange from './abstract/poloniex.js';
import { Int, OrderSide, OrderType, OHLCV, Trade, OrderBook, Order, Balances, Str, Transaction, Ticker, Tickers, Market, Strings, Currency } from './base/types.js';
/**
 * @class poloniex
 * @extends Exchange
 */
export default class poloniex extends Exchange {
    describe(): undefined;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    loadMarkets(reload?: boolean, params?: {}): Promise<import("./base/types.js").Dictionary<Market>>;
    fetchMarkets(params?: {}): Promise<Market[]>;
    parseMarket(market: any): Market;
    fetchTime(params?: {}): Promise<Int>;
    parseTicker(ticker: any, market?: Market): Ticker;
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    fetchCurrencies(params?: {}): Promise<{}>;
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    parseTrade(trade: any, market?: Market): Trade;
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseOrderStatus(status: any): Str;
    parseOrder(order: any, market?: Market): Order;
    parseOrderType(status: any): Str;
    parseOpenOrders(orders: any, market: any, result: any): any;
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: any, price?: undefined, params?: {}): Promise<Order>;
    orderRequest(symbol: any, type: any, side: any, amount: any, request: any, price?: undefined, params?: {}): any[];
    editOrder(id: string, symbol: any, type: any, side: any, amount?: undefined, price?: undefined, params?: {}): Promise<Order>;
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    cancelAllOrders(symbol?: Str, params?: {}): Promise<Order[]>;
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    fetchOrderStatus(id: string, symbol?: Str, params?: {}): Promise<"open" | "closed">;
    fetchOrderTrades(id: string, symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseBalance(response: any): Balances;
    fetchBalance(params?: {}): Promise<Balances>;
    fetchTradingFees(params?: {}): Promise<{}>;
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    createDepositAddress(code: string, params?: {}): Promise<{
        currency: string;
        address: Str;
        tag: Str;
        network: Str;
        info: any;
    }>;
    fetchDepositAddress(code: string, params?: {}): Promise<{
        currency: string;
        address: Str;
        tag: Str;
        network: Str;
        info: any;
    }>;
    transfer(code: string, amount: any, fromAccount: any, toAccount: any, params?: {}): Promise<{
        info: any;
        id: Str;
        timestamp: undefined;
        datetime: undefined;
        currency: Str;
        amount: undefined;
        fromAccount: undefined;
        toAccount: undefined;
        status: undefined;
    }>;
    parseTransfer(transfer: any, currency?: Currency): {
        info: any;
        id: Str;
        timestamp: undefined;
        datetime: undefined;
        currency: Str;
        amount: undefined;
        fromAccount: undefined;
        toAccount: undefined;
        status: undefined;
    };
    withdraw(code: string, amount: any, address: any, tag?: undefined, params?: {}): Promise<Transaction>;
    fetchTransactionsHelper(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<any>;
    fetchDepositsWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    fetchDepositWithdrawFees(codes?: Strings, params?: {}): Promise<{}>;
    parseDepositWithdrawFees(response: any, codes?: undefined, currencyIdKey?: undefined): {};
    parseDepositWithdrawFee(fee: any, currency?: Currency): any;
    fetchDeposits(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    parseTransactionStatus(status: any): Str;
    parseTransaction(transaction: any, currency?: Currency): Transaction;
    nonce(): number;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: undefined, body?: undefined): {
        url: string;
        method: string;
        body: undefined;
        headers: undefined;
    };
    handleErrors(code: any, reason: any, url: any, method: any, headers: any, body: any, response: any, requestHeaders: any, requestBody: any): undefined;
}
