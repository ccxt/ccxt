import Exchange from './abstract/huobijp.js';
import { Balances, Int, OHLCV, Order, OrderSide, OrderType, Ticker, Trade, Transaction } from './base/types.js';
/**
 * @class huobijp
 * @extends Exchange
 */
export default class huobijp extends Exchange {
    describe(): any;
    fetchTime(params?: {}): Promise<number>;
    fetchTradingLimits(symbols?: string[], params?: {}): Promise<{}>;
    fetchTradingLimitsById(id: string, params?: {}): Promise<{
        info: any;
        limits: {
            amount: {
                min: number;
                max: number;
            };
        };
    }>;
    parseTradingLimits(limits: any, symbol?: string, params?: {}): {
        info: any;
        limits: {
            amount: {
                min: number;
                max: number;
            };
        };
    };
    costToPrecision(symbol: any, cost: any): any;
    fetchMarkets(params?: {}): Promise<any[]>;
    parseTicker(ticker: any, market?: any): Ticker;
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<import("./base/types.js").OrderBook>;
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    fetchTickers(symbols?: string[], params?: {}): Promise<import("./base/types.js").Dictionary<Ticker>>;
    parseTrade(trade: any, market?: any): Trade;
    fetchOrderTrades(id: string, symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchMyTrades(symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchTrades(symbol: string, since?: Int, limit?: number, params?: {}): Promise<Trade[]>;
    parseOHLCV(ohlcv: any, market?: any): OHLCV;
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: number, params?: {}): Promise<OHLCV[]>;
    fetchAccounts(params?: {}): Promise<any>;
    fetchCurrencies(params?: {}): Promise<{}>;
    parseBalance(response: any): Balances;
    fetchBalance(params?: {}): Promise<Balances>;
    fetchOrdersByStates(states: any, symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchOrder(id: string, symbol?: string, params?: {}): Promise<Order>;
    fetchOrders(symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchOpenOrders(symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchOpenOrdersV1(symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchClosedOrders(symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchOpenOrdersV2(symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    parseOrderStatus(status: any): string;
    parseOrder(order: any, market?: any): Order;
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: any, price?: any, params?: {}): Promise<Order>;
    cancelOrder(id: string, symbol?: string, params?: {}): Promise<any>;
    cancelOrders(ids: any, symbol?: string, params?: {}): Promise<any>;
    cancelAllOrders(symbol?: string, params?: {}): Promise<any>;
    currencyToPrecision(code: any, fee: any, networkCode?: any): any;
    safeNetwork(networkId: any): string;
    parseDepositAddress(depositAddress: any, currency?: any): {
        currency: any;
        address: string;
        tag: string;
        network: string;
        info: any;
    };
    fetchDeposits(code?: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    fetchWithdrawals(code?: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    parseTransaction(transaction: any, currency?: any): Transaction;
    parseTransactionStatus(status: any): string;
    withdraw(code: string, amount: any, address: any, tag?: any, params?: {}): Promise<Transaction>;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(httpCode: any, reason: any, url: any, method: any, headers: any, body: any, response: any, requestHeaders: any, requestBody: any): any;
}
