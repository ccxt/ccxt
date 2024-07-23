import bitgetRest from '../bitget.js';
import type { Int, OHLCV, Str, Strings, OrderBook, Order, Trade, Ticker, Tickers, Position, Balances } from '../base/types.js';
import Client from '../base/ws/Client.js';
/**
 * @class bitget
 * @augments Exchange
 * @description watching delivery future markets is not yet implemented (perpertual future / swap is implemented)
 */
export default class bitget extends bitgetRest {
    describe(): any;
    getInstType(market: any, params?: {}): any[];
    watchTicker(symbol: string, params?: {}): Promise<Ticker>;
    watchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    handleTicker(client: Client, message: any): void;
    parseWsTicker(message: any, market?: any): Ticker;
    watchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    handleOHLCV(client: Client, message: any): void;
    parseWsOHLCV(ohlcv: any, market?: any): OHLCV;
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    watchOrderBookForSymbols(symbols: string[], limit?: Int, params?: {}): Promise<OrderBook>;
    handleOrderBook(client: Client, message: any): void;
    handleDelta(bookside: any, delta: any): void;
    handleDeltas(bookside: any, deltas: any): void;
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    watchTradesForSymbols(symbols: string[], since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    handleTrades(client: Client, message: any): void;
    parseWsTrade(trade: any, market?: any): Trade;
    watchPositions(symbols?: Strings, since?: Int, limit?: Int, params?: {}): Promise<Position[]>;
    handlePositions(client: Client, message: any): void;
    parseWsPosition(position: any, market?: any): Position;
    watchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    handleOrder(client: Client, message: any): void;
    parseWsOrder(order: any, market?: any): Order;
    parseWsOrderStatus(status: any): string;
    watchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    handleMyTrades(client: Client, message: any): void;
    watchBalance(params?: {}): Promise<Balances>;
    handleBalance(client: Client, message: any): void;
    watchPublic(messageHash: any, args: any, params?: {}): Promise<any>;
    watchPublicMultiple(messageHashes: any, argsArray: any, params?: {}): Promise<any>;
    authenticate(params?: {}): Promise<any>;
    watchPrivate(messageHash: any, subscriptionHash: any, args: any, params?: {}): Promise<any>;
    handleAuthenticate(client: Client, message: any): void;
    handleErrorMessage(client: Client, message: any): boolean;
    handleMessage(client: Client, message: any): void;
    ping(client: Client): string;
    handlePong(client: Client, message: any): any;
    handleSubscriptionStatus(client: Client, message: any): any;
}
