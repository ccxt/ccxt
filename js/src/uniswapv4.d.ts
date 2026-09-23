import Exchange from './abstract/uniswapv4.js';
import type { Dict, Int, Market, Num, NullableDict, Order, OrderBook, OrderSide, OrderType, Str, int } from './base/types.js';
/**
 * @class uniswapv4
 * @augments Exchange
 * @description
 * Architecture: a read/quote-only wrapper, the library never holds keys.
 *  - markets come from the Uniswap v4 subgraph (The Graph), the only source that enumerates pools with TVL
 *  - prices/quotes and swap calldata come from the Uniswap Trading API, which routes across pools and handles Permit2
 *  - no direct Ethereum RPC: the Trading API already simulates the route and estimates gas, and ccxt has no RPC client
 * createOrder returns an UNSIGNED transaction in order['info'], the caller signs and broadcasts it with their own wallet.
 */
export default class uniswapv4 extends Exchange {
    describe(): any;
    /**
     * @method
     * @name uniswapv4#fetchMarkets
     * @description maps the top uniswap v4 pools by TVL to ccxt spot markets, one market per token pair
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    fetchMarkets(params?: {}): Promise<Market[]>;
    parseMarket(pool: Dict): Market;
    /**
     * @method
     * @name uniswapv4#createOrder
     * @description builds an unsigned swap transaction, it does NOT execute anything
     * @see https://api-docs.uniswap.org/introduction
     * @param {string} symbol unified symbol of the market
     * @param {string} type must be 'market', v4 has no native limit orders
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount amount of the base currency to buy or sell
     * @param {float} [price] ignored
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.swapper] address that will sign and send the tx, defaults to this.walletAddress
     * @param {float} [params.slippageTolerance] percent, defaults to this.options.slippageTolerance
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure} with status undefined and the unsigned tx in info.swap
     */
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name uniswapv4#fetchOrderBook
     * @description not supported, an AMM has a continuous price curve, not discrete resting orders
     * @param {string} symbol unified symbol of the market
     * @param {int} [limit] ignored
     * @param {object} [params] ignored
     * @returns {object} never returns
     */
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    sign(path: any, api?: any, method?: string, params?: {}, headers?: NullableDict, body?: Str): {
        url: string;
        method: string;
        body: string;
        headers: Dict;
    };
    handleErrors(httpCode: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): undefined;
}
