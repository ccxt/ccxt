import hyperliquidRest from '../hyperliquid.js';
import Client from '../base/ws/Client.js';
import { Int, Str, Market, OrderBook, Trade, OHLCV, Order } from '../base/types.js';
export default class hyperliquid extends hyperliquidRest {
    describe(): any;
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    handleOrderBook(client: any, message: any): void;
    watchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    handleMyTrades(client: Client, message: any): void;
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    handleTrades(client: Client, message: any): void;
    parseWsTrade(trade: any, market?: Market): Trade;
    watchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    handleOHLCV(client: Client, message: any): void;
    watchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    handleOrder(client: Client, message: any): void;
    handleErrorMessage(client: Client, message: any): boolean;
    handleMessage(client: Client, message: any): void;
    ping(client: any): {
        method: string;
    };
    handlePong(client: Client, message: any): any;
}
