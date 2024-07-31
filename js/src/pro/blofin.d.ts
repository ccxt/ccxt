import blofinRest from '../blofin.js';
import type { Int, Market, Trade, OrderBook, Strings, Ticker, Tickers, OHLCV, Balances, Str, Order, Position } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class blofin extends blofinRest {
    describe(): any;
    ping(client: any): string;
    handlePong(client: Client, message: any): void;
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    watchTradesForSymbols(symbols: string[], since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    handleTrades(client: Client, message: any): void;
    parseWsTrade(trade: any, market?: Market): Trade;
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    watchOrderBookForSymbols(symbols: string[], limit?: Int, params?: {}): Promise<OrderBook>;
    handleOrderBook(client: Client, message: any): void;
    watchTicker(symbol: string, params?: {}): Promise<Ticker>;
    watchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    handleTicker(client: Client, message: any): void;
    parseWsTicker(ticker: any, market?: Market): Ticker;
    watchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    watchOHLCVForSymbols(symbolsAndTimeframes: string[][], since?: Int, limit?: Int, params?: {}): Promise<import("../base/types.js").Dictionary<import("../base/types.js").Dictionary<OHLCV[]>>>;
    handleOHLCV(client: Client, message: any): void;
    watchBalance(params?: {}): Promise<Balances>;
    handleBalance(client: Client, message: any): void;
    parseWsBalance(message: any): Balances;
    watchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    watchOrdersForSymbols(symbols: string[], since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    handleOrders(client: Client, message: any): void;
    parseWsOrder(order: any, market?: Market): Order;
    watchPositions(symbols?: Strings, since?: Int, limit?: Int, params?: {}): Promise<Position[]>;
    handlePositions(client: Client, message: any): void;
    parseWsPosition(position: any, market?: Market): Position;
    watchMultipleWrapper(isPublic: boolean, channelName: string, callerMethodName: string, symbolsArray?: any[], params?: {}): Promise<any>;
    getSubscriptionRequest(args: any): {
        op: string;
        args: any;
    };
    handleMessage(client: Client, message: any): void;
    authenticate(params?: {}): Promise<void>;
}
