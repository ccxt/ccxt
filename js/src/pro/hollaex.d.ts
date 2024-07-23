import hollaexRest from '../hollaex.js';
import type { Int, Str, OrderBook, Order, Trade, Balances } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class hollaex extends hollaexRest {
    describe(): any;
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    handleOrderBook(client: Client, message: any): void;
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    handleTrades(client: Client, message: any): void;
    watchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    handleMyTrades(client: Client, message: any, subscription?: any): void;
    watchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    handleOrder(client: Client, message: any, subscription?: any): void;
    watchBalance(params?: {}): Promise<Balances>;
    handleBalance(client: Client, message: any): void;
    watchPublic(messageHash: any, params?: {}): Promise<any>;
    watchPrivate(messageHash: any, params?: {}): Promise<any>;
    handleErrorMessage(client: Client, message: any): any;
    handleMessage(client: Client, message: any): void;
    ping(client: Client): {
        op: string;
    };
    handlePong(client: Client, message: any): any;
    onError(client: Client, error: any): void;
    onClose(client: Client, error: any): void;
}
