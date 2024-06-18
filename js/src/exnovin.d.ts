import Exchange from './abstract/exnovin.js';
import { Int, Market, OrderBook, Strings, Ticker, Tickers } from './base/types.js';
/**
 * @class exnovin
 * @augments Exchange
 * @description Set rateLimit to 1000 if fully verified
 */
export default class exnovin extends Exchange {
    describe(): any;
    fetchMarkets(symbols?: Strings, params?: {}): Promise<Market[]>;
    parseMarket(market: any): Market;
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    parseTicker(ticker: any, market?: Market): Ticker;
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
}
