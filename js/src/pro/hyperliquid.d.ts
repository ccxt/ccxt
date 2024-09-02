import hyperliquidRest from '../hyperliquid.js';
import Client from '../base/ws/Client.js';
import { Int, Str, Market, OrderBook, Trade, OHLCV, Order, Dict, Strings, Ticker, Tickers, type Num, OrderType, OrderSide, type OrderRequest } from '../base/types.js';
export default class hyperliquid extends hyperliquidRest {
    describe(): any;
    createOrdersWs(orders: OrderRequest[], params?: {}): Promise<Order[]>;
    createOrderWs(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    editOrderWs(id: string, symbol: string, type: string, side: string, amount?: Num, price?: Num, params?: {}): Promise<Order>;
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    handleOrderBook(client: any, message: any): void;
    watchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    watchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    handleWsTickers(client: Client, message: any): void;
    parseWsTicker(rawTicker: any, market?: Market): Ticker;
    handleMyTrades(client: Client, message: any): void;
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    handleTrades(client: Client, message: any): void;
    parseWsTrade(trade: Dict, market?: Market): Trade;
    watchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    handleOHLCV(client: Client, message: any): void;
    handleWsPost(client: Client, message: any): void;
    watchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    handleOrder(client: Client, message: any): void;
    handleErrorMessage(client: Client, message: any): boolean;
    handleMessage(client: Client, message: any): void;
    ping(client: Client): {
        method: string;
    };
    handlePong(client: Client, message: any): any;
    requestId(): number;
    wrapAsPostAction(request: Dict): Dict;
}
