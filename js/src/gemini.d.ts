import Exchange from './abstract/gemini.js';
import type { Balances, Currencies, Currency, Dict, Int, Market, Num, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, TradingFees, Transaction, int, DepositAddress } from './base/types.js';
/**
 * @class gemini
 * @augments Exchange
 */
export default class gemini extends Exchange {
    describe(): any;
    /**
     * @method
     * @name gemini#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @param {object} [params] extra parameters specific to the endpoint
     * @returns {object} an associative dictionary of currencies
     */
    fetchCurrencies(params?: {}): Promise<Currencies>;
    /**
     * @method
     * @name gemini#fetchCurrenciesFromWeb
     * @ignore
     * @description fetches all available currencies on an exchange
     * @param {object} [params] extra parameters specific to the endpoint
     * @returns {object} an associative dictionary of currencies
     */
    fetchCurrenciesFromWeb(params?: {}): Promise<Dict>;
    /**
     * @method
     * @name gemini#fetchMarkets
     * @description retrieves data on all markets for gemini
     * @see https://docs.gemini.com/rest-api/#symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    fetchMarkets(params?: {}): Promise<Market[]>;
    fetchMarketsFromWeb(params?: {}): Promise<any[]>;
    parseMarketActive(status: any): boolean;
    fetchUSDTMarkets(params?: {}): Promise<any[]>;
    fetchMarketsFromAPI(params?: {}): Promise<any[]>;
    parseMarket(response: any): Market;
    /**
     * @method
     * @name gemini#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.gemini.com/rest-api/#current-order-book
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    fetchTickerV1(symbol: string, params?: {}): Promise<Ticker>;
    fetchTickerV2(symbol: string, params?: {}): Promise<Ticker>;
    fetchTickerV1AndV2(symbol: string, params?: {}): Promise<Ticker>;
    /**
     * @method
     * @name gemini#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://docs.gemini.com/rest-api/#ticker
     * @see https://docs.gemini.com/rest-api/#ticker-v2
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {object} [params.fetchTickerMethod] 'fetchTickerV2', 'fetchTickerV1' or 'fetchTickerV1AndV2' - 'fetchTickerV1' for original ccxt.gemini.fetchTicker - 'fetchTickerV1AndV2' for 2 api calls to get the result of both fetchTicker methods - default = 'fetchTickerV1'
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    parseTicker(ticker: Dict, market?: Market): Ticker;
    /**
     * @method
     * @name gemini#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://docs.gemini.com/rest-api/#price-feed
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    parseTrade(trade: Dict, market?: Market): Trade;
    /**
     * @method
     * @name gemini#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://docs.gemini.com/rest-api/#trade-history
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseBalance(response: any): Balances;
    /**
     * @method
     * @name gemini#fetchTradingFees
     * @description fetch the trading fees for multiple markets
     * @see https://docs.gemini.com/rest-api/#get-notional-volume
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure} indexed by market symbols
     */
    fetchTradingFees(params?: {}): Promise<TradingFees>;
    /**
     * @method
     * @name gemini#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://docs.gemini.com/rest-api/#get-available-balances
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    fetchBalance(params?: {}): Promise<Balances>;
    parseOrder(order: Dict, market?: Market): Order;
    /**
     * @method
     * @name gemini#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://docs.gemini.com/rest-api/#order-status
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name gemini#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://docs.gemini.com/rest-api/#get-active-orders
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of  open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name gemini#createOrder
     * @description create a trade order
     * @see https://docs.gemini.com/rest-api/#new-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type must be 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name gemini#cancelOrder
     * @description cancels an open order
     * @see https://docs.gemini.com/rest-api/#cancel-order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name gemini#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://docs.gemini.com/rest-api/#get-past-trades
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name gemini#withdraw
     * @description make a withdrawal
     * @see https://docs.gemini.com/rest-api/#withdraw-crypto-funds
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} tag
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    withdraw(code: string, amount: number, address: string, tag?: any, params?: {}): Promise<Transaction>;
    nonce(): number;
    /**
     * @method
     * @name gemini#fetchDepositsWithdrawals
     * @description fetch history of deposits and withdrawals
     * @see https://docs.gemini.com/rest-api/#transfers
     * @param {string} [code] unified currency code for the currency of the deposit/withdrawals, default is undefined
     * @param {int} [since] timestamp in ms of the earliest deposit/withdrawal, default is undefined
     * @param {int} [limit] max number of deposit/withdrawals to return, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchDepositsWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    parseTransaction(transaction: Dict, currency?: Currency): Transaction;
    parseTransactionStatus(status: Str): string;
    parseDepositAddress(depositAddress: any, currency?: Currency): {
        currency: string;
        network: any;
        address: string;
        tag: any;
        info: any;
    };
    /**
     * @method
     * @name gemini#fetchDepositAddress
     * @see https://docs.gemini.com/rest-api/#get-deposit-addresses
     * @description fetch the deposit address for a currency associated with this account
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the endpoint
     * @param {string} [params.network]  *required* The chain of currency
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    fetchDepositAddress(code: string, params?: {}): Promise<DepositAddress>;
    /**
     * @method
     * @name gemini#fetchDepositAddressesByNetwork
     * @description fetch a dictionary of addresses for a currency, indexed by network
     * @see https://docs.gemini.com/rest-api/#get-deposit-addresses
     * @param {string} code unified currency code of the currency for the deposit address
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.network]  *required* The chain of currency
     * @returns {object} a dictionary of [address structures]{@link https://docs.ccxt.com/#/?id=address-structure} indexed by the network
     */
    fetchDepositAddressesByNetwork(code: string, params?: {}): Promise<DepositAddress[]>;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(httpCode: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): any;
    /**
     * @method
     * @name gemini#createDepositAddress
     * @description create a currency deposit address
     * @see https://docs.gemini.com/rest-api/#new-deposit-address
     * @param {string} code unified currency code of the currency for the deposit address
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    createDepositAddress(code: string, params?: {}): Promise<DepositAddress>;
    /**
     * @method
     * @name gemini#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://docs.gemini.com/rest-api/#candles
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
}
