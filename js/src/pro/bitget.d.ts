import bitgetRest from '../bitget.js';
import { Int, OHLCV, Str, Strings } from '../base/types.js';
import Client from '../base/ws/Client.js';
/**
 * @class bitget
 * @extends Exchange
 * @description watching delivery future markets is not yet implemented (perpertual future / swap is implemented)
 */
export default class bitget extends bitgetRest {
    describe(): any;
    getWsMarketId(market: any): any;
    getMarketIdFromArg(arg: any): string;
    watchTicker(symbol: string, params?: {}): Promise<any>;
    watchTickers(symbols?: Strings, params?: {}): Promise<any>;
    handleTicker(client: Client, message: any): any;
    parseWsTicker(message: any, market?: any): import("../base/types.js").Ticker;
    watchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    watchOHLCVForSymbols(symbolsAndTimeframes: string[][], since?: Int, limit?: Int, params?: {}): Promise<import("../base/types.js").Dictionary<import("../base/types.js").Dictionary<OHLCV[]>>>;
    handleOHLCV(client: Client, message: any): void;
    parseWsOHLCV(ohlcv: any, market?: any): OHLCV;
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<any>;
    watchOrderBookForSymbols(symbols: string[], limit?: Int, params?: {}): Promise<any>;
    handleOrderBook(client: Client, message: any): void;
    handleDelta(bookside: any, delta: any): void;
    handleDeltas(bookside: any, deltas: any): void;
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    watchTradesForSymbols(symbols: string[], since?: Int, limit?: Int, params?: {}): Promise<any>;
    handleTrades(client: Client, message: any): void;
    parseWsTrade(trade: any, market?: any): import("../base/types.js").Trade;
    watchPositions(symbols?: Strings, since?: Int, limit?: Int, params?: {}): Promise<any>;
    handlePositions(client: Client, message: any): void;
    parseWsPosition(position: any, market?: any): import("../base/types.js").Position;
    watchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<any>;
    handleOrder(client: Client, message: any, subscription?: any): void;
    parseWsOrder(order: any, market?: any): import("../base/types.js").Order;
    parseWsOrderStatus(status: any): string;
    watchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<any>;
    handleMyTrades(client: Client, message: any): void;
    parseWsMyTrade(trade: any, market?: any): import("../base/types.js").Trade;
    watchBalance(params?: {}): Promise<any>;
    handleBalance(client: Client, message: any): void;
    watchPublic(messageHash: any, args: any, params?: {}): Promise<any>;
    watchPublicMultiple(messageHash: any, argsArray: any, params?: {}): Promise<any>;
    authenticate(params?: {}): Promise<any>;
    watchPrivate(messageHash: any, subscriptionHash: any, args: any, params?: {}): Promise<any>;
    handleAuthenticate(client: Client, message: any): void;
    handleErrorMessage(client: Client, message: any): boolean;
    handleMessage(client: Client, message: any): void;
    ping(client: any): string;
    handlePong(client: Client, message: any): any;
    handleSubscriptionStatus(client: Client, message: any): any;
}
