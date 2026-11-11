import Exchange from './abstract/vexora.js';
import type { Dict, OrderBook, Ticker, Trade, OHLCV, Int, Market } from './base/types.js';
/**
 * @class vexora
 * @augments Exchange
 */
export default class vexora extends Exchange {
    describe(): any;
    sign(path: string, api?: string[], method?: string, params?: Dict): Dict;
    /**
     * @method fetchMarkets
     * @description retrieves the list of markets from the public products endpoint
     * @see https://trade.smartcore.su/api/products
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of unified market structures
     */
    fetchMarkets(params?: Dict): Promise<Market[]>;
    parseMarket(product: Dict): Market;
    /**
     * @method fetchOrderBook
     * @description fetches information on open orders with bid buy and sell ask prices, volumes and other orderbook details
     * @see https://trade.smartcore.su/api/products/{id}/book
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of order-book structures
     */
    fetchOrderBook(symbol: string, limit?: Int, params?: Dict): Promise<OrderBook>;
    /**
     * @method fetchTrades
     * @description get the list of most recent trades for a currency or symbol
     * @see https://trade.smartcore.su/api/products/{id}/trades
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to report — not supported by the endpoint, filtered locally
     * @param {int} [limit] the maximum amount of trades to report, capped by the exchange at 50
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of trade structures
     */
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: Dict): Promise<Trade[]>;
    parseTrade(trade: Dict, market?: Market): any;
    /**
     * @method fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://trade.smartcore.su/api/products/{id}/candles
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to report — filtered locally, the endpoint only returns the most recent window
     * @param {int} [limit] the maximum amount of candles to report
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    /**
     * @method fetchTicker
     * @description fetches information on price, a 24-hour trading stats for a specific market; note that the exchange exposes only the most recent 50 trades, so aggregates are computed over that window
     * @see https://trade.smartcore.su/api/products/{id}/book
     * @param {string} symbol unified symbol of the market to fetch a ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a ticker structure
     */
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    handleErrors(statusCode: number, statusText: string, url: string, method: string, responseHeaders: Dict, responseBody: string, response: any, requestHeaders: any, requestBody: any): undefined;
}
