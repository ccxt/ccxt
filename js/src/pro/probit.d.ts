import probitRest from '../probit.js';
import { Int } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class probit extends probitRest {
    describe(): any;
    watchBalance(params?: {}): Promise<any>;
    handleBalance(client: Client, message: any): void;
    parseWSBalance(message: any): void;
    watchTicker(symbol: string, params?: {}): Promise<any>;
    handleTicker(client: Client, message: any): void;
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    handleTrades(client: Client, message: any): void;
    watchMyTrades(symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    handleMyTrades(client: Client, message: any): void;
    watchOrders(symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    handleOrders(client: Client, message: any): void;
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<any>;
    subscribeOrderBook(symbol: string, messageHash: any, filter: any, params?: {}): Promise<any>;
    handleOrderBook(client: Client, message: any, orderBook: any): void;
    handleBidAsks(bookSide: any, bidAsks: any): void;
    handleDelta(orderbook: any, delta: any): void;
    handleErrorMessage(client: Client, message: any): void;
    handleAuthenticate(client: Client, message: any): void;
    handleMarketData(client: Client, message: any): void;
    handleMessage(client: Client, message: any): any;
    authenticate(params?: {}): Promise<any>;
}
