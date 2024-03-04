import whitebitRest from '../whitebit.js';
import type { Int, Str, OrderBook, Order, Trade, Ticker, OHLCV, Balances } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class whitebit extends whitebitRest {
    describe(): any;
    watchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    handleOHLCV(client: Client, message: any): any;
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    handleOrderBook(client: Client, message: any): void;
    handleDelta(bookside: any, delta: any): void;
    handleDeltas(bookside: any, deltas: any): void;
    watchTicker(symbol: string, params?: {}): Promise<Ticker>;
    handleTicker(client: Client, message: any): any;
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    handleTrades(client: Client, message: any): void;
    watchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    handleMyTrades(client: Client, message: any, subscription?: any): void;
    parseWsTrade(trade: any, market?: any): Trade;
    watchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    handleOrder(client: Client, message: any, subscription?: any): void;
    parseWsOrder(order: any, market?: any): Order;
    parseWsOrderType(status: any): string;
    watchBalance(params?: {}): Promise<Balances>;
    handleBalance(client: Client, message: any): void;
    watchPublic(messageHash: any, method: any, reqParams?: any[], params?: {}): Promise<any>;
    watchMultipleSubscription(messageHash: any, method: any, symbol: any, isNested?: boolean, params?: {}): Promise<any>;
    watchPrivate(messageHash: any, method: any, reqParams?: any[], params?: {}): Promise<any>;
    authenticate(params?: {}): Promise<any>;
    handleAuthenticate(client: Client, message: any): any;
    handleErrorMessage(client: Client, message: any): any;
    handleMessage(client: Client, message: any): void;
    handleSubscriptionStatus(client: Client, message: any, id: any): void;
    handlePong(client: Client, message: any): any;
    ping(client: any): {
        id: number;
        method: string;
        params: any[];
    };
}
