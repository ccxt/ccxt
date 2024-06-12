import Exchange from './abstract/yobit.js';
import type { Transaction, Balances, Dict, Int, Market, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, Num, TradingFees, Dictionary, int } from './base/types.js';
/**
 * @class yobit
 * @augments Exchange
 */
export default class yobit extends Exchange {
    describe(): any;
    parseBalance(response: any): Balances;
    fetchBalance(params?: {}): Promise<Balances>;
    fetchMarkets(params?: {}): Promise<Market[]>;
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    fetchOrderBooks(symbols?: Strings, limit?: Int, params?: {}): Promise<Dictionary<OrderBook>>;
    parseTicker(ticker: Dict, market?: Market): Ticker;
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    parseTrade(trade: Dict, market?: Market): Trade;
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchTradingFees(params?: {}): Promise<TradingFees>;
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    parseOrderStatus(status: Str): string;
    parseOrder(order: Dict, market?: Market): Order;
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    createDepositAddress(code: string, params?: {}): Promise<{
        currency: string;
        address: string;
        tag: any;
        info: any;
    }>;
    fetchDepositAddress(code: string, params?: {}): Promise<{
        id: any;
        currency: string;
        address: string;
        tag: any;
        network: any;
        info: any;
        txid: any;
        type: any;
        amount: any;
        status: any;
        timestamp: any;
        datetime: any;
        addressFrom: any;
        addressTo: any;
        tagFrom: any;
        tagTo: any;
        updated: any;
        comment: any;
        fee: {
            currency: any;
            cost: any;
            rate: any;
        };
    }>;
    withdraw(code: string, amount: number, address: string, tag?: any, params?: {}): Promise<Transaction>;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: any;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(httpCode: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): any;
}
