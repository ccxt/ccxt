import bitoproRest from '../bitopro.js';
import { Int } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class bitopro extends bitoproRest {
    describe(): any;
    watchPublic(path: any, messageHash: any, marketId: any): Promise<any>;
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<any>;
    handleOrderBook(client: Client, message: any): void;
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    handleTrade(client: Client, message: any): void;
    watchTicker(symbol: string, params?: {}): Promise<any>;
    handleTicker(client: Client, message: any): void;
    authenticate(url: any): void;
    watchBalance(params?: {}): Promise<any>;
    handleBalance(client: Client, message: any): void;
    handleMessage(client: Client, message: any): any;
}
