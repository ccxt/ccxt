import coinbaseRest from '../coinbase.js';
import { Strings, Tickers, Ticker, Int, Trade, OrderBook, Order, Str, Dict } from '../base/types.js';
export default class coinbase extends coinbaseRest {
    describe(): any;
    subscribe(name: string, isPrivate: boolean, symbol?: any, params?: {}): Promise<any>;
    subscribeMultiple(name: string, isPrivate: boolean, symbols?: Strings, params?: {}): Promise<any>;
    createWSAuth(name: string, productIds: string[]): Dict;
    watchTicker(symbol: string, params?: {}): Promise<Ticker>;
    watchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    handleTickers(client: any, message: any): any;
    parseWsTicker(ticker: any, market?: any): Ticker;
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    watchTradesForSymbols(symbols: string[], since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    watchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    watchOrderBookForSymbols(symbols: string[], limit?: Int, params?: {}): Promise<OrderBook>;
    handleTrade(client: any, message: any): any;
    handleOrder(client: any, message: any): any;
    parseWsOrder(order: any, market?: any): Order;
    handleOrderBookHelper(orderbook: any, updates: any): void;
    handleOrderBook(client: any, message: any): void;
    handleSubscriptionStatus(client: any, message: any): any;
    handleHeartbeats(client: any, message: any): any;
    handleMessage(client: any, message: any): void;
}
