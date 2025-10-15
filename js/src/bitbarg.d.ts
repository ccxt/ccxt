import Exchange from './abstract/bitbarg.js';
import { Market, Strings, Ticker, Tickers } from './base/types.js';
/**
 * @class bitbarg
 * @augments Exchange
 * @description Set rateLimit to 1000 if fully verified
 */
export default class bitbarg extends Exchange {
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
