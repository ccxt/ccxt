import probitRest from '../probit.js';
import { Int } from '../base/types.js';
export default class probit extends probitRest {
    describe(): any;
    watchBalance(params?: {}): Promise<any>;
    handleBalance(client: any, message: any): void;
    parseWSBalance(message: any): void;
    watchTicker(symbol: string, params?: {}): Promise<any>;
    handleTicker(client: any, message: any): void;
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    handleTrades(client: any, message: any): void;
    watchMyTrades(symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    handleMyTrades(client: any, message: any): void;
    watchOrders(symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    handleOrders(client: any, message: any): void;
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<any>;
    subscribeOrderBook(symbol: string, messageHash: any, filter: any, params?: {}): Promise<any>;
    handleOrderBook(client: any, message: any, orderBook: any): void;
    handleBidAsks(bookSide: any, bidAsks: any): void;
    handleDelta(orderbook: any, delta: any): void;
    handleErrorMessage(client: any, message: any): void;
    handleAuthenticate(client: any, message: any): void;
    handleMarketData(client: any, message: any): void;
    handleMessage(client: any, message: any): any;
    authenticate(params?: {}): Promise<any>;
}
