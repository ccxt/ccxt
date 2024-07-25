import blockchaincomRest from '../blockchaincom.js';
import type { Int, Str, OrderBook, Order, Trade, Ticker, OHLCV, Balances } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class blockchaincom extends blockchaincomRest {
    describe(): any;
    watchBalance(params?: {}): Promise<Balances>;
    handleBalance(client: Client, message: any): void;
    watchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    handleOHLCV(client: Client, message: any): void;
    watchTicker(symbol: string, params?: {}): Promise<Ticker>;
    handleTicker(client: Client, message: any): void;
    parseWsUpdatedTicker(ticker: any, lastTicker?: any, market?: any): Ticker;
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    handleTrades(client: Client, message: any): void;
    parseWsTrade(trade: any, market?: any): Trade;
    watchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    handleOrders(client: Client, message: any): void;
    parseWsOrder(order: any, market?: any): Order;
    parseWsOrderStatus(status: any): string;
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    handleOrderBook(client: Client, message: any): void;
    handleDelta(bookside: any, delta: any): void;
    handleDeltas(bookside: any, deltas: any): void;
    handleMessage(client: Client, message: any): void;
    handleAuthenticationMessage(client: Client, message: any): void;
    authenticate(params?: {}): Promise<any>;
}
