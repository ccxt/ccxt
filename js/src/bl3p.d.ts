import Exchange from './abstract/bl3p.js';
import type { Balances, Int, Market, OrderBook, OrderSide, OrderType, Str, Ticker, Trade, IndexType, Currency, Num, TradingFees, Dict } from './base/types.js';
/**
 * @class bl3p
 * @augments Exchange
 */
export default class bl3p extends Exchange {
    describe(): any;
    parseBalance(response: any): Balances;
    /**
     * @method
     * @name bl3p#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://github.com/BitonicNL/bl3p-api/blob/master/docs/authenticated_api/http.md#35---get-account-info--balance
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    fetchBalance(params?: {}): Promise<Balances>;
    parseBidAsk(bidask: any, priceKey?: IndexType, amountKey?: IndexType, countOrIdKey?: IndexType): number[];
    /**
     * @method
     * @name bl3p#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://github.com/BitonicNL/bl3p-api/blob/master/docs/public_api/http.md#22---orderbook
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    parseTicker(ticker: Dict, market?: Market): Ticker;
    /**
     * @method
     * @name bl3p#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://github.com/BitonicNL/bl3p-api/blob/master/docs/public_api/http.md#21---ticker
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    parseTrade(trade: Dict, market?: Market): Trade;
    /**
     * @method
     * @name bl3p#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://github.com/BitonicNL/bl3p-api/blob/master/docs/public_api/http.md#23---last-1000-trades
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name bl3p#fetchTradingFees
     * @description fetch the trading fees for multiple markets
     * @see https://github.com/BitonicNL/bl3p-api/blob/master/docs/authenticated_api/http.md#35---get-account-info--balance
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure} indexed by market symbols
     */
    fetchTradingFees(params?: {}): Promise<TradingFees>;
    /**
     * @method
     * @name bl3p#createOrder
     * @description create a trade order
     * @see https://github.com/BitonicNL/bl3p-api/blob/master/examples/nodejs/example.md#21---create-an-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     *
     * EXCHANGE SPECIFIC PARAMETERS
     * @param {int} [params.amount_funds] maximal EUR amount to spend (*1e5)
     * @param {string} [params.fee_currency] 'EUR' or 'BTC'
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<import("./base/types.js").Order>;
    /**
     * @method
     * @name bl3p#cancelOrder
     * @description cancels an open order
     * @see https://github.com/BitonicNL/bl3p-api/blob/master/docs/authenticated_api/http.md#22---cancel-an-order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<import("./base/types.js").Order>;
    /**
     * @method
     * @name bl3p#createDepositAddress
     * @description create a currency deposit address
     * @see https://github.com/BitonicNL/bl3p-api/blob/master/docs/authenticated_api/http.md#32---create-a-new-deposit-address
     * @param {string} code unified currency code of the currency for the deposit address
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    createDepositAddress(code: string, params?: {}): Promise<{
        info: any;
        currency: string;
        address: string;
        tag: any;
        network: any;
    }>;
    parseDepositAddress(depositAddress: any, currency?: Currency): {
        info: any;
        currency: string;
        address: string;
        tag: any;
        network: any;
    };
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
}
