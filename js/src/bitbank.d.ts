import Exchange from './abstract/bitbank.js';
import type { Balances, Currency, Dict, Int, Market, Num, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Ticker, Trade, TradingFees, Transaction, int, DepositAddress } from './base/types.js';
/**
 * @class bitbank
 * @augments Exchange
 */
export default class bitbank extends Exchange {
    describe(): any;
    /**
     * @method
     * @name bitbank#fetchMarkets
     * @description retrieves data on all markets for bitbank
     * @see https://github.com/bitbankinc/bitbank-api-docs/blob/38d6d7c6f486c793872fd4b4087a0d090a04cd0a/rest-api.md#get-all-pairs-info
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    fetchMarkets(params?: {}): Promise<Market[]>;
    parseMarket(entry: any): Market;
    parseTicker(ticker: Dict, market?: Market): Ticker;
    /**
     * @method
     * @name bitbank#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://github.com/bitbankinc/bitbank-api-docs/blob/38d6d7c6f486c793872fd4b4087a0d090a04cd0a/public-api.md#ticker
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    /**
     * @method
     * @name bitbank#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://github.com/bitbankinc/bitbank-api-docs/blob/38d6d7c6f486c793872fd4b4087a0d090a04cd0a/public-api.md#depth
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    parseTrade(trade: Dict, market?: Market): Trade;
    /**
     * @method
     * @name bitbank#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://github.com/bitbankinc/bitbank-api-docs/blob/38d6d7c6f486c793872fd4b4087a0d090a04cd0a/public-api.md#transactions
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name bitbank#fetchTradingFees
     * @description fetch the trading fees for multiple markets
     * @see https://github.com/bitbankinc/bitbank-api-docs/blob/38d6d7c6f486c793872fd4b4087a0d090a04cd0a/rest-api.md#get-all-pairs-info
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure} indexed by market symbols
     */
    fetchTradingFees(params?: {}): Promise<TradingFees>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    /**
     * @method
     * @name bitbank#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://github.com/bitbankinc/bitbank-api-docs/blob/38d6d7c6f486c793872fd4b4087a0d090a04cd0a/public-api.md#candlestick
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    parseBalance(response: any): Balances;
    /**
     * @method
     * @name bitbank#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://github.com/bitbankinc/bitbank-api-docs/blob/38d6d7c6f486c793872fd4b4087a0d090a04cd0a/rest-api.md#assets
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    fetchBalance(params?: {}): Promise<Balances>;
    parseOrderStatus(status: Str): string;
    parseOrder(order: Dict, market?: Market): Order;
    /**
     * @method
     * @name bitbank#createOrder
     * @description create a trade order
     * @see https://github.com/bitbankinc/bitbank-api-docs/blob/38d6d7c6f486c793872fd4b4087a0d090a04cd0a/rest-api.md#create-new-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name bitbank#cancelOrder
     * @description cancels an open order
     * @see https://github.com/bitbankinc/bitbank-api-docs/blob/38d6d7c6f486c793872fd4b4087a0d090a04cd0a/rest-api.md#cancel-order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name bitbank#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://github.com/bitbankinc/bitbank-api-docs/blob/38d6d7c6f486c793872fd4b4087a0d090a04cd0a/rest-api.md#fetch-order-information
     * @param {string} id the order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name bitbank#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://github.com/bitbankinc/bitbank-api-docs/blob/38d6d7c6f486c793872fd4b4087a0d090a04cd0a/rest-api.md#fetch-active-orders
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of  open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name bitbank#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://github.com/bitbankinc/bitbank-api-docs/blob/38d6d7c6f486c793872fd4b4087a0d090a04cd0a/rest-api.md#fetch-trade-history
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name bitbank#fetchDepositAddress
     * @description fetch the deposit address for a currency associated with this account
     * @see https://github.com/bitbankinc/bitbank-api-docs/blob/38d6d7c6f486c793872fd4b4087a0d090a04cd0a/rest-api.md#get-withdrawal-accounts
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    fetchDepositAddress(code: string, params?: {}): Promise<DepositAddress>;
    /**
     * @method
     * @name bitbank#withdraw
     * @description make a withdrawal
     * @see https://github.com/bitbankinc/bitbank-api-docs/blob/38d6d7c6f486c793872fd4b4087a0d090a04cd0a/rest-api.md#new-withdrawal-request
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} tag
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    withdraw(code: string, amount: number, address: string, tag?: any, params?: {}): Promise<Transaction>;
    parseTransaction(transaction: Dict, currency?: Currency): Transaction;
    nonce(): number;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(httpCode: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): any;
}
