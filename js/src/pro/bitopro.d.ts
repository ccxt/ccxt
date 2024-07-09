import bitoproRest from '../bitopro.js';
import type { Int, OrderBook, Trade, Ticker, Balances, Market, Str, Dict } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class bitopro extends bitoproRest {
    describe(): any;
    watchPublic(path: any, messageHash: any, marketId: any): Promise<any>;
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    handleOrderBook(client: Client, message: any): void;
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    handleTrade(client: Client, message: any): void;
    watchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    handleMyTrade(client: Client, message: any): void;
    parseWsTrade(trade: Dict, market?: Market): Trade;
    watchTicker(symbol: string, params?: {}): Promise<Ticker>;
    handleTicker(client: Client, message: any): void;
    authenticate(url: any): void;
    watchBalance(params?: {}): Promise<Balances>;
    handleBalance(client: Client, message: any): void;
    handleMessage(client: Client, message: any): void;
}
