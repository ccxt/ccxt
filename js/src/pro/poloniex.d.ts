import poloniexRest from '../poloniex.js';
import { Int } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class poloniex extends poloniexRest {
    describe(): any;
    authenticate(params?: {}): Promise<any>;
    subscribe(name: string, messageHash: string, isPrivate: boolean, symbols?: string[], params?: {}): Promise<any>;
    watchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    watchTicker(symbol: string, params?: {}): Promise<any>;
    watchTickers(symbols?: any, params?: {}): Promise<any>;
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<any>;
    watchOrders(symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    watchMyTrades(symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    watchBalance(params?: {}): Promise<any>;
    parseWsOHLCV(ohlcv: any, market?: any): number[];
    handleOHLCV(client: Client, message: any): any;
    handleTrade(client: Client, message: any): any;
    parseWsTrade(trade: any, market?: any): import("../base/types.js").Trade;
    parseStatus(status: any): string;
    parseWsOrderTrade(trade: any, market?: any): import("../base/types.js").Trade;
    handleOrder(client: Client, message: any): any;
    parseWsOrder(order: any, market?: any): any;
    handleTicker(client: Client, message: any): any;
    handleOrderBook(client: Client, message: any): void;
    handleBalance(client: Client, message: any): void;
    parseWsBalance(response: any): import("../base/types.js").Balances;
    handleMyTrades(client: Client, parsedTrade: any): void;
    handleMessage(client: Client, message: any): any;
    handleErrorMessage(client: Client, message: any): boolean;
    handleAuthenticate(client: Client, message: any): any;
    ping(client: any): {
        event: string;
    };
}
