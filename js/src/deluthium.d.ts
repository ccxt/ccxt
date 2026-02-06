import Exchange from './abstract/deluthium.js';
import type { Dict, Int, Num, Market, Currency, Ticker, OHLCV, Order, OrderSide, OrderType } from './base/types.js';
/**
 * @class deluthium
 * @augments Exchange
 * @description Deluthium (DarkPool) DEX - RFQ-based swap system supporting BSC, Base, and Ethereum chains.
 * Note: All amounts sent to the API must be in wei (integer strings). This class handles the conversion.
 */
export default class deluthium extends Exchange {
    describe(): any;
    /**
     * @method
     * @name deluthium#toWei
     * @description Converts a human-readable amount to wei (integer string) based on token decimals
     * @param {number|string} amount the amount to convert
     * @param {number} decimals the token decimals (default 18)
     * @returns {string} the amount in wei as a string
     */
    toWei(amount: number | string, decimals?: number): string;
    /**
     * @method
     * @name deluthium#fromWei
     * @description Converts wei (integer string) to human-readable amount based on token decimals
     * @param {string} wei the wei amount to convert
     * @param {number} decimals the token decimals (default 18)
     * @returns {string} the human-readable amount as a string
     */
    fromWei(wei: string, decimals?: number): string;
    /**
     * @method
     * @name deluthium#fetchMarkets
     * @description retrieves data on all markets for deluthium
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {number} [params.chainId] filter by chain ID (56=BSC, 8453=Base, 1=ETH)
     * @returns {Market[]} an array of objects representing market data
     */
    fetchMarkets(params?: {}): Promise<Market[]>;
    parseMarket(market: Dict): Market;
    /**
     * @method
     * @name deluthium#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {number} [params.chainId] filter by chain ID (56=BSC, 8453=Base, 1=ETH)
     * @returns {object} an associative dictionary of currencies
     */
    fetchCurrencies(params?: {}): Promise<Dict>;
    parseCurrency(token: Dict): Currency;
    /**
     * @method
     * @name deluthium#getTokenDecimals
     * @description Gets the decimals for a token address from cache or defaults to 18
     * @param {string} tokenAddress the token contract address
     * @returns {number} the token decimals
     */
    getTokenDecimals(tokenAddress: string): number;
    /**
     * @method
     * @name deluthium#fetchTicker
     * @description fetches a price ticker for a specific market
     * @param {string} symbol unified symbol of the market to fetch ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {number} [params.chainId] chain ID override (56=BSC, 8453=Base, 1=ETH)
     * @param {string} [params.interval] interval for price data (default '1h')
     * @returns {Ticker} a ticker structure
     */
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    parseTicker(ticker: Dict, market?: Market): Ticker;
    /**
     * @method
     * @name deluthium#fetchOHLCV
     * @description fetches historical candlestick data containing OHLCV
     * @param {string} symbol unified symbol of the market to fetch OHLCV for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {number} [params.chainId] chain ID override (56=BSC, 8453=Base, 1=ETH)
     * @returns {int[][]} a list of candles ordered as [timestamp, open, high, low, close, volume]
     */
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    /**
     * @method
     * @name deluthium#fetchQuote
     * @description fetches an indicative quote for a swap without executing it.
     * Note: The amount parameter should be in human-readable format (e.g., 1.5 for 1.5 tokens).
     * The method automatically converts to wei before sending to the API.
     * @param {string} symbol unified symbol of the market
     * @param {number} amount the amount to quote for (in human-readable format)
     * @param {string} side 'buy' or 'sell'
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {number} [params.chainId] chain ID (56=BSC, 8453=Base, 1=ETH)
     * @returns {object} a quote structure with estimated output amount (in wei)
     */
    fetchQuote(symbol: string, amount: number, side?: string, params?: {}): Promise<Dict>;
    parseQuote(quote: Dict, market?: Market): Dict;
    /**
     * @method
     * @name deluthium#createOrder
     * @description Creates a firm quote and returns calldata for on-chain execution.
     * IMPORTANT: CCXT does NOT broadcast the transaction. The user must submit
     * the returned calldata to the blockchain using their own wallet/signer.
     * Note: The amount parameter should be in human-readable format. It is automatically converted to wei.
     * @param {string} symbol unified symbol of the market
     * @param {string} type order type (only 'market' supported for RFQ)
     * @param {string} side 'buy' or 'sell'
     * @param {number} amount the amount to trade (in human-readable format)
     * @param {number} [price] not used for RFQ
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {number} [params.chainId] chain ID (56=BSC, 8453=Base, 1=ETH)
     * @param {number} [params.dstChainId] destination chain for cross-chain swaps
     * @param {number} [params.slippage] slippage tolerance in percentage (default 0.5)
     * @param {string} [params.walletAddress] user's wallet address (required)
     * @param {string} [params.toAddress] recipient address (defaults to walletAddress)
     * @param {string} [params.indicative_amount_out] optional for slippage pre-validation
     * @param {number} [params.expiryTimeSec] quote expiry time in seconds (default 60)
     * @returns {Order} an order structure with calldata in order.info.calldata
     */
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    parseOrder(order: Dict, market?: Market, side?: OrderSide): Order;
    sign(path: string, api?: string, method?: string, params?: Dict, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(httpCode: Int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): any;
}
