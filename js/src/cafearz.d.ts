import Exchange from './abstract/cafearz.js';
import { Market, Strings, Ticker, Tickers } from './base/types.js';
/**
 * @class cafearz
 * @augments Exchange
 * @description Set rateLimit to 1000 if fully verified
 */
export default class cafearz extends Exchange {
    describe(): any;
    parseMarket(market: any): Market;
    fetchMarkets(params?: {}): Promise<Market[]>;
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    parseTicker(ticker: any, market?: Market): Ticker;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: any;
        method: string;
        body: any;
        headers: any;
    };
}
