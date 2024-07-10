import upbitRest from '../upbit.js';
import type { Int, Str, Order, OrderBook, Trade, Ticker, Balances } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class upbit extends upbitRest {
    describe(): any;
    watchPublic(symbol: string, channel: any, params?: {}): Promise<any>;
    watchTicker(symbol: string, params?: {}): Promise<Ticker>;
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    handleTicker(client: Client, message: any): void;
    handleOrderBook(client: Client, message: any): void;
    handleTrades(client: Client, message: any): void;
    authenticate(params?: {}): Promise<import("../base/ws/WsClient.js").default>;
    watchPrivate(symbol: any, channel: any, messageHash: any, params?: {}): Promise<any>;
    watchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    watchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseWsOrderStatus(status: Str): string;
    parseWsOrder(order: any, market?: any): Order;
    parseWsTrade(trade: any, market?: any): Trade;
    handleMyOrder(client: Client, message: any): void;
    handleMyTrade(client: Client, message: any): void;
    handleOrder(client: Client, message: any): void;
    watchBalance(params?: {}): Promise<Balances>;
    handleBalance(client: Client, message: any): void;
    handleMessage(client: Client, message: any): void;
}
