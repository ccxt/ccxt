import Exchange from './abstract/exmo.js';
import { Dictionary, Int, Order, OrderSide, OrderType, Trade, OrderBook, OHLCV, Balances, Transaction, Ticker } from './base/types.js';
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
        symbol: any;
        total: any;
        status: string;
    }>;
    parseMarginModification(data: any, market?: any): {
        info: any;
        type: any;
        amount: any;
        code: any;
        symbol: any;
        total: any;
        status: string;
    };
    reduceMargin(symbol: string, amount: any, params?: {}): Promise<{
        info: any;
        type: any;
        amount: any;
        code: any;
        symbol: any;
        total: any;
        status: string;
    }>;
    addMargin(symbol: string, amount: any, params?: {}): Promise<{
        info: any;
        type: any;
        amount: any;
        code: any;
        symbol: any;
        total: any;
        status: string;
    }>;
    fetchTradingFees(params?: {}): Promise<any>;
    fetchPrivateTradingFees(params?: {}): Promise<{}>;
    fetchPublicTradingFees(params?: {}): Promise<{}>;
    parseFixedFloatValue(input: any): number;
    fetchTransactionFees(codes?: any, params?: {}): Promise<{}>;
    fetchDepositWithdrawFees(codes?: string[], params?: {}): Promise<any>;
    parseDepositWithdrawFee(fee: any, currency?: any): any;
    fetchCurrencies(params?: {}): Promise<{}>;
    fetchMarkets(params?: {}): Promise<any[]>;
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    parseOHLCV(ohlcv: any, market?: any): OHLCV;
    parseBalance(response: any): Balances;
    fetchBalance(params?: {}): Promise<Balances>;
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    fetchOrderBooks(symbols?: string[], limit?: Int, params?: {}): Promise<Dictionary<OrderBook>>;
    parseTicker(ticker: any, market?: any): Ticker;
    fetchTickers(symbols?: string[], params?: {}): Promise<Dictionary<Ticker>>;
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    parseTrade(trade: any, market?: any): Trade;
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchMyTrades(symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: any, price?: any, params?: {}): Promise<Order>;
    cancelOrder(id: string, symbol?: string, params?: {}): Promise<Order>;
    fetchOrder(id: string, symbol?: string, params?: {}): Promise<Order>;
    fetchOrderTrades(id: string, symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchOpenOrders(symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    parseStatus(status: any): string;
    parseSide(orderType: any): string;
    parseOrder(order: any, market?: any): Order;
    fetchCanceledOrders(symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<any[]>;
    editOrder(id: string, symbol: any, type: any, side: any, amount?: any, price?: any, params?: {}): Promise<Order>;
    fetchDepositAddress(code: string, params?: {}): Promise<{
        currency: string;
        address: any;
        tag: any;
        network: any;
        info: any;
    }>;
    getMarketFromTrades(trades: any): any;
    withdraw(code: string, amount: any, address: any, tag?: any, params?: {}): Promise<Transaction>;
    parseTransactionStatus(status: any): string;
    parseTransaction(transaction: any, currency?: any): Transaction;
    fetchDepositsWithdrawals(code?: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    fetchWithdrawals(code?: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    fetchWithdrawal(id: string, code?: string, params?: {}): Promise<Transaction>;
    fetchDeposit(id?: any, code?: string, params?: {}): Promise<Transaction>;
    fetchDeposits(code?: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    nonce(): number;
    handleErrors(httpCode: any, reason: any, url: any, method: any, headers: any, body: any, response: any, requestHeaders: any, requestBody: any): any;
}
