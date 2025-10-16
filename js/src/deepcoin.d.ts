import Exchange from './abstract/deepcoin.js';
import { OrderSide, OrderType, Num, Dict, int, Market, Order, Strings, Tickers, Ticker, Int, OrderBook, Str, OHLCV, Balances, Trade } from './base/types.js';
/**
 * @class deepcoin
 * @augments Exchange
 */
export default class deepcoin extends Exchange {
    describe(): any;
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchBalance(params?: {}): Promise<Balances>;
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    fetchMarkets(params?: {}): Promise<Market[]>;
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    cancelOrder(id: string, symbol?: string, params?: {}): Promise<Order>;
    parseTrade(trade: Dict, market?: Market): Trade;
    parseBalance(response: any): Balances;
    parseTicker(ticker: Dict, market?: Market): Ticker;
    parseMarket(market: Dict): Market;
    parseStatus(state: string): string;
    parseOrder(order: Dict, market?: Market): Order;
    marketTypeToInstType(type: string): string;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(code: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): any;
}
