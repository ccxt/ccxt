import Exchange from './abstract/kifpoolme.js';
import { Int, Market, OHLCV, Strings, Ticker, Tickers } from './base/types.js';
/**
 * @class kifpoolme
 * @augments Exchange
 * @description Set rateLimit to 1000 if fully verified
 */
export default class kifpoolme extends Exchange {
    describe(): any;
    parseMarket(market: any): Market;
    fetchMarkets(params?: {}): Promise<Market[]>;
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    parseTicker(ticker: any, market?: Market): Ticker;
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
}
