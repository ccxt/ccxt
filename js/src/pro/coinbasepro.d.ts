import coinbaseproRest from '../coinbasepro.js';
import { Int, Ticker, Str, Strings } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class coinbasepro extends coinbaseproRest {
    describe(): any;
    authenticate(): {
        timestamp: number;
        key: string;
        signature: any;
        passphrase: string;
    };
    subscribe(name: any, symbol?: any, messageHashStart?: any, params?: {}): Promise<any>;
    subscribeMultiple(name: any, symbols?: any[], messageHashStart?: any, params?: {}): Promise<any>;
    watchTicker(symbol: string, params?: {}): Promise<any>;
    watchTickers(symbols?: Strings, params?: {}): Promise<any>;
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    watchTradesForSymbols(symbols: string[], since?: Int, limit?: Int, params?: {}): Promise<any>;
    watchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<any>;
    watchMyTradesForSymbols(symbols?: Strings, since?: Int, limit?: Int, params?: {}): Promise<any>;
    watchOrdersForSymbols(symbols?: Strings, since?: Int, limit?: Int, params?: {}): Promise<any>;
    watchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<any>;
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<any>;
    watchOrderBookForSymbols(symbols: string[], limit?: Int, params?: {}): Promise<any>;
    handleTrade(client: Client, message: any): any;
    handleMyTrade(client: Client, message: any): any;
    parseWsTrade(trade: any, market?: any): import("../base/types.js").Trade;
    parseWsOrderStatus(status: any): string;
    handleOrder(client: Client, message: any): void;
    parseWsOrder(order: any, market?: any): import("../base/types.js").Order;
    handleTicker(client: Client, message: any): any;
    parseTicker(ticker: any, market?: any): Ticker;
    handleDelta(bookside: any, delta: any): void;
    handleDeltas(bookside: any, deltas: any): void;
    handleOrderBook(client: Client, message: any): void;
    handleSubscriptionStatus(client: Client, message: any): any;
    handleErrorMessage(client: Client, message: any): boolean;
    handleMessage(client: Client, message: any): any;
}
