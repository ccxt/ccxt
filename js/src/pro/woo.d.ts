import wooRest from '../woo.js';
import type { Int, Str, Strings, OrderBook, Order, Trade, Ticker, Tickers, OHLCV, Balances, Position } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class woo extends wooRest {
    describe(): any;
    requestId(url: any): any;
    watchPublic(messageHash: any, message: any): Promise<any>;
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    handleOrderBook(client: Client, message: any): void;
    watchTicker(symbol: string, params?: {}): Promise<Ticker>;
    parseWsTicker(ticker: any, market?: any): Ticker;
    handleTicker(client: Client, message: any): any;
    watchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    handleTickers(client: Client, message: any): void;
    watchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    handleOHLCV(client: Client, message: any): void;
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    handleTrade(client: Client, message: any): void;
    parseWsTrade(trade: any, market?: any): Trade;
    checkRequiredUid(error?: boolean): boolean;
    authenticate(params?: {}): any;
    watchPrivate(messageHash: any, message: any, params?: {}): Promise<any>;
    watchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    parseWsOrder(order: any, market?: any): Order;
    handleOrderUpdate(client: Client, message: any): void;
    handleOrder(client: Client, message: any): void;
    watchPositions(symbols?: Strings, since?: Int, limit?: Int, params?: {}): Promise<Position[]>;
    setPositionsCache(client: Client, type: any, symbols?: Strings): void;
    loadPositionsSnapshot(client: any, messageHash: any): Promise<void>;
    handlePositions(client: any, message: any): void;
    watchBalance(params?: {}): Promise<Balances>;
    handleBalance(client: any, message: any): void;
    handleMessage(client: Client, message: any): any;
    ping(client: any): {
        event: string;
    };
    handlePing(client: Client, message: any): {
        event: string;
    };
    handlePong(client: Client, message: any): any;
    handleSubscribe(client: Client, message: any): any;
    handleAuth(client: Client, message: any): void;
}
