import Exchange from './abstract/apex.js';
import { MarketInterface, Account, Balances, Currencies, Currency, Dict, FundingRateHistory, Int, Market, Num, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, TransferEntry, Position, int } from './base/types';
/**
 * @class apex
 * @augments Exchange
 */
export default class apex extends Exchange {
    describe(): any;
    /**
     * @method
     * @name apex#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @see https://api-docs.pro.apex.exchange/#publicapi-v3-for-omni-get-system-time-v3
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    fetchTime(params?: {}): Promise<number>;
    parseBalance(response: any): Balances;
    /**
     * @method
     * @name apex#fetchBalance
     * @description query for account info
     * @see https://api-docs.pro.apex.exchange/#privateapi-v3-for-omni-get-retrieve-user-account-balance
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    fetchBalance(params?: {}): Promise<Balances>;
    parseAccount(account: Dict): Account;
    /**
     * @method
     * @name apex#fetchAccount
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://api-docs.pro.apex.exchange/#privateapi-v3-for-omni-get-retrieve-user-account-data
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    fetchAccount(params?: {}): Promise<Account>;
    /**
     * @method
     * @name apex#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://api-docs.pro.apex.exchange/#publicapi-v3-for-omni-get-all-config-data-v3
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    fetchCurrencies(params?: {}): Promise<Currencies>;
    /**
     * @method
     * @name apex#fetchMarkets
     * @description retrieves data on all markets for apex
     * @see https://api-docs.pro.apex.exchange/#publicapi-v3-for-omni-get-all-config-data-v3
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    fetchMarkets(params?: {}): Promise<Market[]>;
    parseMarket(market: Dict): Market;
    parseTicker(ticker: Dict, market?: Market): Ticker;
    /**
     * @method
     * @name apex#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://api-docs.pro.apex.exchange/#publicapi-v3-for-omni-get-ticker-data-v3
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    /**
     * @method
     * @name apex#fetchTickers
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://api-docs.pro.apex.exchange/#publicapi-v3-for-omni-get-ticker-data-v3
     * @param {string} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    /**
     * @method
     * @name apex#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://api-docs.pro.apex.exchange/#publicapi-v3-for-omni-get-candlestick-chart-data-v3
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest candle to fetch
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    /**
     * @method
     * @name apex#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://api-docs.pro.apex.exchange/#publicapi-v3-for-omni-get-market-depth-v3
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    /**
     * @method
     * @name apex#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://api-docs.pro.apex.exchange/#publicapi-v3-for-omni-get-newest-trading-data-v3
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch trades for
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseTrade(trade: Dict, market?: Market): Trade;
    /**
     * @method
     * @name apex#fetchOpenInterest
     * @description retrieves the open interest of a contract trading pair
     * @see https://api-docs.pro.apex.exchange/#publicapi-v3-for-omni-get-ticker-data-v3
     * @param {string} symbol unified CCXT market symbol
     * @param {object} [params] exchange specific parameters
     * @returns {object} an open interest structure{@link https://docs.ccxt.com/#/?id=open-interest-structure}
     */
    fetchOpenInterest(symbol: string, params?: {}): Promise<import("./base/types").OpenInterest>;
    parseOpenInterest(interest: any, market?: Market): import("./base/types").OpenInterest;
    /**
     * @method
     * @name apex#fetchFundingRateHistory
     * @description fetches historical funding rate prices
     * @see https://api-docs.pro.apex.exchange/#publicapi-v3-for-omni-get-funding-rate-history-v3
     * @param {string} symbol unified symbol of the market to fetch the funding rate history for
     * @param {int} [since] timestamp in ms of the earliest funding rate to fetch
     * @param {int} [limit] the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure} to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest funding rate
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure}
     */
    fetchFundingRateHistory(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<FundingRateHistory[]>;
    parseOrder(order: Dict, market?: Market): Order;
    parseTimeInForce(timeInForce: Str): string;
    parseOrderStatus(status: Str): string;
    parseOrderType(type: Str): string;
    safeMarket(marketId?: Str, market?: Market, delimiter?: Str, marketType?: Str): MarketInterface;
    generateRandomClientIdOmni(_accountId: string): string;
    addHyphenBeforeUsdt(symbol: string): string;
    getSeeds(): string;
    getAccountId(): Promise<any>;
    /**
     * @method
     * @name apex#createOrder
     * @description create a trade order
     * @see https://api-docs.pro.apex.exchange/#privateapi-v3-for-omni-post-creating-orders
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} [params.triggerPrice] The price a trigger order is triggered at
     * @param {string} [params.timeInForce] "GTC", "IOC", or "POST_ONLY"
     * @param {bool} [params.postOnly] true or false
     * @param {bool} [params.reduceOnly] Ensures that the executed order does not flip the opened position.
     * @param {string} [params.clientOrderId] a unique id for the order
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name apex#transfer
     * @description transfer currency internally between wallets on the same account
     * @param {string} code unified currency code
     * @param {float} amount amount to transfer
     * @param {string} fromAccount account to transfer from
     * @param {string} toAccount account to transfer to
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.transferId] UUID, which is unique across the platform
     * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/#/?id=transfer-structure}
     */
    transfer(code: string, amount: number, fromAccount: string, toAccount: string, params?: {}): Promise<TransferEntry>;
    parseTransfer(transfer: Dict, currency?: Currency): TransferEntry;
    /**
     * @method
     * @name apex#cancelAllOrders
     * @description cancel all open orders in a market
     * @see https://api-docs.pro.apex.exchange/#privateapi-v3-for-omni-post-cancel-all-open-orders
     * @param {string} symbol unified market symbol of the market to cancel orders in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelAllOrders(symbol?: Str, params?: {}): Promise<import("./base/types").Dictionary<any>>;
    /**
     * @method
     * @name apex#cancelOrder
     * @description cancels an open order
     * @see https://api-docs.pro.apex.exchange/#privateapi-v3-for-omni-post-cancel-order
     * @param {string} id order id
     * @param symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<import("./base/types").Dictionary<any>>;
    /**
     * @method
     * @name apex#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://api-docs.pro.apex.exchange/#privateapi-v3-for-omni-get-order-id
     * @see https://api-docs.pro.apex.exchange/#privateapi-v3-for-omni-get-order-by-clientorderid
     * @param {string} id the order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] a unique id for the order
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name apex#fetchOpenOrders
     * @description fetches information on multiple orders made by the user
     * @see https://api-docs.pro.apex.exchange/#privateapi-v3-for-omni-get-open-orders
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name apex#fetchOrders
     * @description fetches information on multiple orders made by the user *classic accounts only*
     * @see https://api-docs.pro.apex.exchange/#privateapi-v3-for-omni-get-all-order-history
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve, default 100
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {object} [params.until] end time, ms
     * @param {boolean} [params.status] "PENDING", "OPEN", "FILLED", "CANCELED", "EXPIRED", "UNTRIGGERED"
     * @param {boolean} [params.side] BUY or SELL
     * @param {string} [params.type] "LIMIT", "MARKET","STOP_LIMIT", "STOP_MARKET", "TAKE_PROFIT_LIMIT","TAKE_PROFIT_MARKET"
     * @param {string} [params.orderType] "ACTIVE","CONDITION","HISTORY"
     * @param {boolean} [params.page] Page numbers start from 0
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name apex#fetchOrderTrades
     * @description fetch all the trades made from a single order
     * @see https://api-docs.pro.apex.exchange/#privateapi-v3-for-omni-get-trade-history
     * @param {string} id order id
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    fetchOrderTrades(id: string, symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name apex#fetchMyTrades
     * @description fetches information on multiple orders made by the user *classic accounts only*
     * @see https://api-docs.pro.apex.exchange/#privateapi-v3-for-omni-get-trade-history
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve, default 100
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {object} [params.until] end time
     * @param {boolean} [params.side] BUY or SELL
     * @param {string} [params.orderType] "LIMIT", "MARKET","STOP_LIMIT", "STOP_MARKET", "TAKE_PROFIT_LIMIT","TAKE_PROFIT_MARKET"
     * @param {boolean} [params.page] Page numbers start from 0
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name apex#fetchFundingHistory
     * @description fetches information on multiple orders made by the user *classic accounts only*
     * @see https://api-docs.pro.apex.exchange/#privateapi-v3-for-omni-get-funding-rate
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve, default 100
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {object} [params.until] end time, ms
     * @param {boolean} [params.side] BUY or SELL
     * @param {boolean} [params.page] Page numbers start from 0
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=funding-history-structure}
     */
    fetchFundingHistory(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<import("./base/types").FundingHistory[]>;
    parseIncome(income: any, market?: Market): {
        info: any;
        symbol: string;
        code: string;
        timestamp: number;
        datetime: string;
        id: string;
        amount: number;
        rate: number;
    };
    /**
     * @method
     * @name apex#setLeverage
     * @description set the level of leverage for a market
     * @see https://api-docs.pro.apex.exchange/#privateapi-v3-for-omni-post-sets-the-initial-margin-rate-of-a-contract
     * @param {float} leverage the rate of leverage
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} response from the exchange
     */
    setLeverage(leverage: Int, symbol?: Str, params?: {}): Promise<import("./base/types").Dictionary<any>>;
    /**
     * @method
     * @name apex#fetchPositions
     * @description fetch all open positions
     * @see https://api-docs.pro.apex.exchange/#privateapi-v3-for-omni-get-retrieve-user-account-data
     * @param {string[]} [symbols] list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    fetchPositions(symbols?: Strings, params?: {}): Promise<Position[]>;
    parsePosition(position: Dict, market?: Market): Position;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(code: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): any;
}
