import coincheckRest from '../coincheck.js';
import type { Int, Market, OrderBook, Trade, Dict } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class coincheck extends coincheckRest {
    describe(): any;
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    handleOrderBook(client: any, message: any): void;
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    handleTrades(client: Client, message: any): void;
    parseWsTrade(trade: Dict, market?: Market): Trade;
    handleMessage(client: Client, message: any): void;
}
