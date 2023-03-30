import bitoproRest from '../bitopro.js';
import { Int } from '../base/types.js';
export default class bitopro extends bitoproRest {
    describe(): any;
    watchPublic(path: any, messageHash: any, marketId: any): Promise<any>;
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<any>;
    handleOrderBook(client: any, message: any): void;
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    handleTrade(client: any, message: any): void;
    watchTicker(symbol: string, params?: {}): Promise<any>;
    handleTicker(client: any, message: any): void;
    authenticate(url: any): void;
    watchBalance(params?: {}): Promise<any>;
    handleBalance(client: any, message: any): void;
    handleMessage(client: any, message: any): any;
}
