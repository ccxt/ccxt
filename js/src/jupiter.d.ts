import Exchange from './abstract/jupiter.js';
import type { Dict, Int, Market, Num, NullableDict, Order, OrderBook, OrderSide, OrderType, Str, Ticker, int } from './base/types.js';
/**
 * @class jupiter
 * @augments Exchange
 * @description
 * Jupiter is a swap aggregator on Solana: there are no pairs, any token routes to any token.
 * Markets are synthesized as <verified token>/USDC, the deepest token wins when symbols collide.
 * createOrder returns an UNSIGNED base64 VersionedTransaction in order['info'], the caller signs and sends it.
 */
export default class jupiter extends Exchange {
    describe(): any;
    /**
     * @method
     * @name jupiter#fetchMarkets
     * @description maps the most liquid verified solana tokens to TOKEN/USDC spot markets
     * @see https://dev.jup.ag/docs
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    fetchMarkets(params?: {}): Promise<Market[]>;
    parseMarket(token: Dict): Market;
    /**
     * @method
     * @name jupiter#fetchTicker
     * @description fetches the aggregated usd price of a token, only last and percentage are available
     * @see https://dev.jup.ag/docs
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    parseTicker(ticker: Dict, market?: Market): Ticker;
    /**
     * @method
     * @name jupiter#createOrder
     * @description builds an unsigned swap transaction, it does NOT execute anything
     * @see https://dev.jup.ag/docs
     * @param {string} symbol unified symbol of the market
     * @param {string} type must be 'market'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount amount of the base currency to buy or sell
     * @param {float} [price] ignored
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.userPublicKey] signer address, defaults to this.walletAddress
     * @param {int} [params.slippageBps] defaults to this.options.slippageBps
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure} with status undefined and the unsigned tx in info.swapTransaction
     */
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name jupiter#fetchOrderBook
     * @description not supported, jupiter aggregates AMMs and has no resting orders
     * @param {string} symbol unified symbol of the market
     * @param {int} [limit] ignored
     * @param {object} [params] ignored
     * @returns {object} never returns
     */
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    sign(path: any, api?: any, method?: string, params?: {}, headers?: NullableDict, body?: Str): {
        url: string;
        method: string;
        body: Str;
        headers: Dict;
    };
    handleErrors(httpCode: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): undefined;
}
