import Exchange from './abstract/poloniex.js';
import { Int, OrderSide, OrderType, OHLCV, Trade, OrderBook, Order, Balances, Str, Transaction, Ticker, Tickers, Market, Strings, Currency } from './base/types.js';
/**
 * @class poloniex
 * @extends Exchange
 */
export default class poloniex extends Exchange {
    describe(): any;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    loadMarkets(reload?: boolean, params?: {}): Promise<import("./base/types.js").Dictionary<import("./base/types.js").MarketInterface>>;
    fetchMarkets(params?: {}): Promise<import("./base/types.js").MarketInterface[]>;
    parseMarket(market: any): Market;
    fetchTime(params?: {}): Promise<number>;
    parseTicker(ticker: any, market?: Market): Ticker;
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    fetchCurrencies(params?: {}): Promise<{}>;
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    parseTrade(trade: any, market?: Market): Trade;
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseOrderStatus(status: any): string;
    parseOrder(order: any, market?: Market): Order;
    parseOrderType(status: any): string;
    parseOpenOrders(orders: any, market: any, result: any): any;
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: any, price?: any, params?: {}): Promise<Order>;
    orderRequest(symbol: any, type: any, side: any, amount: any, request: any, price?: any, params?: {}): any[];
    editOrder(id: string, symbol: any, type: any, side: any, amount?: any, price?: any, params?: {}): Promise<Order>;
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
        address: string;
        tag: string;
        network: string;
        info: any;
    }>;
    fetchDepositAddress(code: string, params?: {}): Promise<{
        currency: string;
        address: string;
        tag: string;
        network: string;
        info: any;
    }>;
    transfer(code: string, amount: any, fromAccount: any, toAccount: any, params?: {}): Promise<{
        info: any;
        id: string;
        timestamp: any;
        datetime: any;
        currency: string;
        amount: any;
        fromAccount: any;
        toAccount: any;
        status: any;
    }>;
    parseTransfer(transfer: any, currency?: Currency): {
        info: any;
        id: string;
        timestamp: any;
        datetime: any;
        currency: string;
        amount: any;
        fromAccount: any;
        toAccount: any;
        status: any;
    };
    withdraw(code: string, amount: any, address: any, tag?: any, params?: {}): Promise<Transaction>;
    fetchTransactionsHelper(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<any>;
    fetchDepositsWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    fetchDepositWithdrawFees(codes?: Strings, params?: {}): Promise<{}>;
    parseDepositWithdrawFees(response: any, codes?: any, currencyIdKey?: any): {};
    parseDepositWithdrawFee(fee: any, currency?: Currency): any;
    fetchDeposits(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    parseTransactionStatus(status: any): string;
    parseTransaction(transaction: any, currency?: Currency): Transaction;
    nonce(): number;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: any;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(code: any, reason: any, url: any, method: any, headers: any, body: any, response: any, requestHeaders: any, requestBody: any): any;
}
