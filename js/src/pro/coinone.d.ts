import coinoneRest from '../coinone.js';
import type { Int, Market, OrderBook, Ticker, Trade } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class coinone extends coinoneRest {
    describe(): any;
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    handleOrderBook(client: any, message: any): void;
    handleDelta(bookside: any, delta: any): void;
    watchTicker(symbol: string, params?: {}): Promise<Ticker>;
    handleTicker(client: Client, message: any): void;
    parseWsTicker(ticker: any, market?: Market): Ticker;
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    handleTrades(client: Client, message: any): void;
    parseWsTrade(trade: any, market?: Market): Trade;
    handleErrorMessage(client: Client, message: any): boolean;
    handleMessage(client: Client, message: any): void;
    ping(client: any): {
        request_type: string;
    };
    handlePong(client: Client, message: any): any;
}
