import coinbaseexchangeRest from '../coinbaseexchange.js';
import type { Tickers, Int, Ticker, Str, Strings, OrderBook, Trade, Order } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class coinbaseexchange extends coinbaseexchangeRest {
    describe(): any;
    authenticate(): {
        timestamp: number;
        key: string;
        signature: any;
        passphrase: string;
    };
    subscribe(name: any, symbol?: any, messageHashStart?: any, params?: {}): Promise<any>;
    subscribeMultiple(name: any, symbols?: any[], messageHashStart?: any, params?: {}): Promise<any>;
    watchTicker(symbol: string, params?: {}): Promise<Ticker>;
    watchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    watchTradesForSymbols(symbols: string[], since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    watchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    watchMyTradesForSymbols(symbols?: Strings, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    watchOrdersForSymbols(symbols?: Strings, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    watchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    watchOrderBookForSymbols(symbols: string[], limit?: Int, params?: {}): Promise<OrderBook>;
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    handleTrade(client: Client, message: any): any;
    handleMyTrade(client: Client, message: any): any;
    parseWsTrade(trade: any, market?: any): Trade;
    parseWsOrderStatus(status: any): string;
    handleOrder(client: Client, message: any): void;
    parseWsOrder(order: any, market?: any): Order;
    handleTicker(client: Client, message: any): any;
    parseTicker(ticker: any, market?: any): Ticker;
    handleDelta(bookside: any, delta: any): void;
    handleDeltas(bookside: any, deltas: any): void;
    handleOrderBook(client: Client, message: any): void;
    handleSubscriptionStatus(client: Client, message: any): any;
    handleErrorMessage(client: Client, message: any): boolean;
    handleMessage(client: Client, message: any): void;
}
