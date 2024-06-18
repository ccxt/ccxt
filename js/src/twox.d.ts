import Exchange from './abstract/twox.js';
import { Market, Strings, Ticker, Tickers } from './base/types.js';
/**
 * @class twox
 * @augments Exchange
 * @description Set rateLimit to 1000 if fully verified
 */
export default class twox extends Exchange {
    describe(): any;
    fetchMarkets(symbols?: Strings, params?: {}): Promise<Market[]>;
    parseMarket(market: any): Market;
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    parseTicker(ticker: any, market?: Market): Ticker;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
}
