import lbankRest from '../lbank.js';
import type { Int, Str, Trade, OrderBook, Order, OHLCV, Ticker } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class lbank extends lbankRest {
    describe(): any;
    requestId(): any;
    fetchOHLCVWs(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    watchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    handleOHLCV(client: any, message: any): void;
    fetchTickerWs(symbol: string, params?: {}): Promise<Ticker>;
    watchTicker(symbol: string, params?: {}): Promise<Ticker>;
    handleTicker(client: any, message: any): void;
    parseWsTicker(ticker: any, market?: any): Ticker;
    fetchTradesWs(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    handleTrades(client: any, message: any): void;
    parseWsTrade(trade: any, market?: any): Trade;
    watchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    handleOrders(client: any, message: any): void;
    parseWsOrder(order: any, market?: any): Order;
    parseWsOrderStatus(status: any): string;
    fetchOrderBookWs(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    handleOrderBook(client: any, message: any): void;
    handleErrorMessage(client: any, message: any): void;
    handlePing(client: Client, message: any): Promise<void>;
    handleMessage(client: any, message: any): void;
    authenticate(params?: {}): Promise<any>;
}
