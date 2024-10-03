import bithumbRest from '../bithumb.js';
import type { Int, OrderBook, Ticker, Trade, Strings, Tickers } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class bithumb extends bithumbRest {
    describe(): any;
    watchTicker(symbol: string, params?: {}): Promise<Ticker>;
    watchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    handleTicker(client: Client, message: any): void;
    parseWsTicker(ticker: any, market?: any): Ticker;
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    handleOrderBook(client: Client, message: any): void;
    handleDelta(orderbook: any, delta: any): void;
    handleDeltas(orderbook: any, deltas: any): void;
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    handleTrades(client: any, message: any): void;
    parseWsTrade(trade: any, market?: any): Trade;
    handleErrorMessage(client: Client, message: any): boolean;
    handleMessage(client: Client, message: any): void;
}
