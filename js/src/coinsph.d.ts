import Exchange from './abstract/coinsph.js';
import type { Balances, Currency, Dict, Int, Market, Num, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, TradingFeeInterface, TradingFees, Transaction, int, DepositAddress } from './base/types.js';
/**
 * @class coinsph
 * @augments Exchange
 */
export default class coinsph extends Exchange {
    describe(): any;
    calculateRateLimiterCost(api: any, method: any, path: any, params: any, config?: {}): any;
    /**
     * @method
     * @name coinsph#fetchStatus
     * @description the latest known information on the availability of the exchange API
     * @see https://coins-docs.github.io/rest-api/#test-connectivity
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [status structure]{@link https://docs.ccxt.com/#/?id=exchange-status-structure}
     */
    fetchStatus(params?: {}): Promise<{
        status: string;
        updated: any;
        eta: any;
        url: any;
        info: any;
    }>;
    /**
     * @method
     * @name coinsph#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @see https://coins-docs.github.io/rest-api/#check-server-time
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    fetchTime(params?: {}): Promise<number>;
    /**
     * @method
     * @name coinsph#fetchMarkets
     * @description retrieves data on all markets for coinsph
     * @see https://coins-docs.github.io/rest-api/#exchange-information
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    fetchMarkets(params?: {}): Promise<Market[]>;
    /**
     * @method
     * @name coinsph#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://coins-docs.github.io/rest-api/#24hr-ticker-price-change-statistics
     * @see https://coins-docs.github.io/rest-api/#symbol-price-ticker
     * @see https://coins-docs.github.io/rest-api/#symbol-order-book-ticker
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    /**
     * @method
     * @name coinsph#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://coins-docs.github.io/rest-api/#24hr-ticker-price-change-statistics
     * @see https://coins-docs.github.io/rest-api/#symbol-price-ticker
     * @see https://coins-docs.github.io/rest-api/#symbol-order-book-ticker
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    parseTicker(ticker: Dict, market?: Market): Ticker;
    /**
     * @method
     * @name coinsph#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://coins-docs.github.io/rest-api/#order-book
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return (default 100, max 200)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    /**
     * @method
     * @name coinsph#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://coins-docs.github.io/rest-api/#klinecandlestick-data
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch (default 500, max 1000)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest candle to fetch
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    /**
     * @method
     * @name coinsph#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://coins-docs.github.io/rest-api/#recent-trades-list
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch (default 500, max 1000)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name coinsph#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://coins-docs.github.io/rest-api/#account-trade-list-user_data
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve (default 500, max 1000)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name coinsph#fetchOrderTrades
     * @description fetch all the trades made from a single order
     * @see https://coins-docs.github.io/rest-api/#account-trade-list-user_data
     * @param {string} id order id
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    fetchOrderTrades(id: string, symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseTrade(trade: Dict, market?: Market): Trade;
    /**
     * @method
     * @name coinsph#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://coins-docs.github.io/rest-api/#accept-the-quote
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    fetchBalance(params?: {}): Promise<Balances>;
    parseBalance(response: any): Balances;
    /**
     * @method
     * @name coinsph#createOrder
     * @description create a trade order
     * @see https://coins-docs.github.io/rest-api/#new-order--trade
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market', 'limit', 'stop_loss', 'take_profit', 'stop_loss_limit', 'take_profit_limit' or 'limit_maker'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} [params.cost] the quote quantity that can be used as an alternative for the amount for market buy orders
     * @param {bool} [params.test] set to true to test an order, no order will be created but the request will be validated
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name coinsph#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://coins-docs.github.io/rest-api/#query-order-user_data
     * @param {int|string} id order id
     * @param {string} symbol not used by coinsph fetchOrder ()
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name coinsph#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://coins-docs.github.io/rest-api/#current-open-orders-user_data
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of  open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name coinsph#fetchClosedOrders
     * @description fetches information on multiple closed orders made by the user
     * @see https://coins-docs.github.io/rest-api/#history-orders-user_data
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve (default 500, max 1000)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name coinsph#cancelOrder
     * @description cancels an open order
     * @see https://coins-docs.github.io/rest-api/#cancel-order-trade
     * @param {string} id order id
     * @param {string} symbol not used by coinsph cancelOrder ()
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name coinsph#cancelAllOrders
     * @description cancel open orders of market
     * @see https://coins-docs.github.io/rest-api/#cancel-all-open-orders-on-a-symbol-trade
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelAllOrders(symbol?: Str, params?: {}): Promise<Order[]>;
    parseOrder(order: Dict, market?: Market): Order;
    parseOrderSide(status: any): string;
    encodeOrderSide(status: any): string;
    parseOrderType(status: any): string;
    encodeOrderType(status: any): string;
    parseOrderStatus(status: Str): string;
    parseOrderTimeInForce(status: any): string;
    /**
     * @method
     * @name coinsph#fetchTradingFee
     * @description fetch the trading fees for a market
     * @see https://coins-docs.github.io/rest-api/#trade-fee-user_data
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [fee structure]{@link https://docs.ccxt.com/#/?id=fee-structure}
     */
    fetchTradingFee(symbol: string, params?: {}): Promise<TradingFeeInterface>;
    /**
     * @method
     * @name coinsph#fetchTradingFees
     * @description fetch the trading fees for multiple markets
     * @see https://coins-docs.github.io/rest-api/#trade-fee-user_data
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure} indexed by market symbols
     */
    fetchTradingFees(params?: {}): Promise<TradingFees>;
    parseTradingFee(fee: Dict, market?: Market): TradingFeeInterface;
    /**
     * @method
     * @name coinsph#withdraw
     * @description make a withdrawal to coins_ph account
     * @see https://coins-docs.github.io/rest-api/#withdrawuser_data
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address not used by coinsph withdraw ()
     * @param {string} tag
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    withdraw(code: string, amount: number, address: string, tag?: any, params?: {}): Promise<Transaction>;
    /**
     * @method
     * @name coinsph#fetchDeposits
     * @description fetch all deposits made to an account
     * @see https://coins-docs.github.io/rest-api/#deposit-history-user_data
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch deposits for
     * @param {int} [limit] the maximum number of deposits structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchDeposits(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    /**
     * @method
     * @name coinsph#fetchWithdrawals
     * @description fetch all withdrawals made from an account
     * @see https://coins-docs.github.io/rest-api/#withdraw-history-user_data
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of withdrawals structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    parseTransaction(transaction: Dict, currency?: Currency): Transaction;
    parseTransactionStatus(status: Str): string;
    /**
     * @method
     * @name coinsph#fetchDepositAddress
     * @description fetch the deposit address for a currency associated with this account
     * @see https://coins-docs.github.io/rest-api/#deposit-address-user_data
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.network] network for fetch deposit address
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    fetchDepositAddress(code: string, params?: {}): Promise<DepositAddress>;
    parseDepositAddress(depositAddress: any, currency?: Currency): DepositAddress;
    urlEncodeQuery(query?: {}): string;
    parseArrayParam(array: any, key: any): string;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: any;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(code: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): any;
}
