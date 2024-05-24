import probitRest from '../probit.js';
import type { Int, Str, OrderBook, Order, Trade, Ticker, Balances } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class probit extends probitRest {
    describe(): any;
    watchBalance(params?: {}): Promise<Balances>;
    handleBalance(client: Client, message: any): void;
    parseWSBalance(message: any): void;
    watchTicker(symbol: string, params?: {}): Promise<Ticker>;
    handleTicker(client: Client, message: any): void;
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    handleTrades(client: Client, message: any): void;
    watchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    handleMyTrades(client: Client, message: any): void;
    watchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    handleOrders(client: Client, message: any): void;
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    subscribeOrderBook(symbol: string, messageHash: any, filter: any, params?: {}): Promise<any>;
    handleOrderBook(client: Client, message: any, orderBook: any): void;
    handleBidAsks(bookSide: any, bidAsks: any): void;
    handleDelta(orderbook: any, delta: any): void;
    handleErrorMessage(client: Client, message: any): void;
    handleAuthenticate(client: Client, message: any): void;
    handleMarketData(client: Client, message: any): void;
    handleMessage(client: Client, message: any): void;
    authenticate(params?: {}): Promise<any>;
}
