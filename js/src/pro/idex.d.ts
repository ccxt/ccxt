import idexRest from '../idex.js';
import type { Int, Str, OrderBook, Order, Trade, Ticker, OHLCV } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class idex extends idexRest {
    describe(): any;
    subscribe(subscribeObject: any, messageHash: any, subscription?: boolean): Promise<any>;
    subscribePrivate(subscribeObject: any, messageHash: any): Promise<any>;
    watchTicker(symbol: string, params?: {}): Promise<Ticker>;
    handleTicker(client: Client, message: any): void;
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    handleTrade(client: Client, message: any): void;
    parseWsTrade(trade: any, market?: any): Trade;
    watchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    handleOHLCV(client: Client, message: any): void;
    handleSubscribeMessage(client: Client, message: any): void;
    fetchOrderBookSnapshot(client: any, symbol: any, params?: {}): Promise<void>;
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    handleOrderBook(client: Client, message: any): void;
    handleOrderBookMessage(client: Client, message: any, orderbook: any): void;
    handleDelta(bookside: any, delta: any): void;
    handleDeltas(bookside: any, deltas: any): void;
    authenticate(params?: {}): Promise<any>;
    watchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    handleOrder(client: Client, message: any): void;
    watchTransactions(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<any>;
    handleTransaction(client: Client, message: any): void;
    handleMessage(client: Client, message: any): void;
}
