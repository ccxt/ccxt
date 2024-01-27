import coinbaseRest from '../coinbase.js';
import { Strings, Tickers, Ticker, Int, Trade, OrderBook, Order } from '../base/types.js';
export default class coinbase extends coinbaseRest {
    describe(): any;
    subscribe(name: any, symbol?: any, params?: {}): Promise<any>;
    watchTicker(symbol: any, params?: {}): Promise<Ticker>;
    watchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    handleTickers(client: any, message: any): any;
    parseWsTicker(ticker: any, market?: any): Ticker;
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    watchOrders(symbol?: any, since?: any, limit?: any, params?: {}): Promise<Order[]>;
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    handleTrade(client: any, message: any): any;
    handleOrder(client: any, message: any): any;
    parseWsOrder(order: any, market?: any): Order;
    handleOrderBookHelper(orderbook: any, updates: any): void;
    handleOrderBook(client: any, message: any): any;
    handleSubscriptionStatus(client: any, message: any): any;
    handleMessage(client: any, message: any): any;
}
