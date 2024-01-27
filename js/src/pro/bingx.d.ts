import bingxRest from '../bingx.js';
import type { Int, OHLCV, Str, OrderBook, Order, Trade, Balances } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class bingx extends bingxRest {
    describe(): any;
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    handleTrades(client: Client, message: any): void;
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    handleDelta(bookside: any, delta: any): void;
    handleOrderBook(client: Client, message: any): void;
    parseWsOHLCV(ohlcv: any, market?: any): OHLCV;
    handleOHLCV(client: Client, message: any): void;
    watchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    watchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    watchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    watchBalance(params?: {}): Promise<Balances>;
    setBalanceCache(client: Client, type: any, subscriptionHash: any, params: any): any;
    loadBalanceSnapshot(client: any, messageHash: any, type: any): Promise<void>;
    handleErrorMessage(client: any, message: any): boolean;
    authenticate(params?: {}): Promise<void>;
    pong(client: any, message: any): Promise<void>;
    handleOrder(client: any, message: any): void;
    handleMyTrades(client: Client, message: any): void;
    handleBalance(client: Client, message: any): void;
    handleMessage(client: Client, message: any): void;
}
