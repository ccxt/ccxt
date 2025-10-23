import Exchange from './abstract/websea.js';
import type { Int, OHLCV, Order, OrderSide, OrderType, Str, Trade, Balances, Ticker, OrderBook, Tickers, Strings, Num, Market, Currencies, Dict, int, Position, MarketInterface } from './base/types.js';
/**
 * @class websea
 * @augments Exchange
 */
export default class websea extends Exchange {
    describe(): any;
    setLeverage(leverage: int, symbol?: Str, params?: {}): Promise<any>;
    parseOrder(order: any, market?: Market): Order;
    parseOrderStatus(status: any): any;
    market(symbol: string): MarketInterface;
    nonce(): number;
    fetchMarkets(params?: {}): Promise<Market[]>;
    fetchMarketsByType(type: string, params?: {}): Promise<Market[]>;
    parseMarket(market: any): Market;
    fetchCurrencies(params?: {}): Promise<Currencies>;
    parseCurrency(currency: any, code?: any): {
        id: string;
        code: string;
        name: string;
        type: string;
        active: boolean;
        deposit: boolean;
        withdraw: boolean;
        fee: any;
        precision: number;
        limits: {
            amount: {
                min: any;
                max: any;
            };
            deposit: {
                min: any;
                max: any;
            };
            withdraw: {
                min: number;
                max: number;
            };
        };
        networks: {};
        info: any;
    };
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    parseTicker(ticker: any, market?: Market): Ticker;
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseTrade(trade: any, market?: Market): Trade;
    fetchBalance(params?: {}): Promise<Balances>;
    fetchPositions(symbols?: Strings, params?: {}): Promise<Position[]>;
    parsePosition(position: any, market?: Market): Position;
    parseBalance(response: any): Balances;
    aggregateOrderBookSide(orderBookSide: any[]): any[];
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: any;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(code: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): any;
    isStringAllDigits(str: string): boolean;
    isStringDateFormat(str: string): boolean;
}
