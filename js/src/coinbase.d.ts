import Exchange from './abstract/coinbase.js';
import type { Int, OrderSide, OrderType, Order, Trade, OHLCV, Ticker, OrderBook, Str, Transaction, Balances, Tickers, Strings, Market, Currency, Num, Account, Currencies, MarketInterface, Conversion, Dict, int, TradingFees, LedgerEntry, DepositAddress, Position } from './base/types.js';
/**
 * @class coinbase
 * @augments Exchange
 */
export default class coinbase extends Exchange {
    describe(): any;
    /**
     * @method
     * @name coinbase#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @see https://docs.cloud.coinbase.com/sign-in-with-coinbase/docs/api-time#http-request
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.method] 'v2PublicGetTime' or 'v3PublicGetBrokerageTime' default is 'v2PublicGetTime'
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    fetchTime(params?: {}): Promise<Int>;
    /**
     * @method
     * @name coinbase#fetchAccounts
     * @description fetch all the accounts associated with a profile
     * @see https://docs.cloud.coinbase.com/advanced-trade/reference/retailbrokerageapi_getaccounts
     * @see https://docs.cloud.coinbase.com/sign-in-with-coinbase/docs/api-accounts#list-accounts
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object} a dictionary of [account structures]{@link https://docs.ccxt.com/?id=account-structure} indexed by the account type
     */
    fetchAccounts(params?: {}): Promise<Account[]>;
    fetchAccountsV2(params?: {}): Promise<Account[]>;
    fetchAccountsV3(params?: {}): Promise<Account[]>;
    /**
     * @method
     * @name coinbase#fetchPortfolios
     * @description fetch all the portfolios
     * @see https://docs.cloud.coinbase.com/advanced-trade/reference/retailbrokerageapi_getportfolios
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [account structures]{@link https://docs.ccxt.com/?id=account-structure} indexed by the account type
     */
    fetchPortfolios(params?: {}): Promise<Account[]>;
    parseAccount(account: any): {
        id: string;
        type: string;
        code: string;
        info: any;
    };
    /**
     * @method
     * @name coinbase#createDepositAddress
     * @description create a currency deposit address
     * @see https://docs.cloud.coinbase.com/sign-in-with-coinbase/docs/api-addresses#create-address
     * @param {string} code unified currency code of the currency for the deposit address
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
     */
    createDepositAddress(code: string, params?: {}): Promise<DepositAddress>;
    /**
     * @method
     * @name coinbase#fetchMySells
     * @ignore
     * @description fetch sells
     * @see https://docs.cloud.coinbase.com/sign-in-with-coinbase/docs/api-sells#list-sells
     * @param {string} symbol not used by coinbase fetchMySells ()
     * @param {int} [since] timestamp in ms of the earliest sell, default is undefined
     * @param {int} [limit] max number of sells to return, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [list of order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchMySells(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name coinbase#fetchMyBuys
     * @ignore
     * @description fetch buys
     * @see https://docs.cloud.coinbase.com/sign-in-with-coinbase/docs/api-buys#list-buys
     * @param {string} symbol not used by coinbase fetchMyBuys ()
     * @param {int} [since] timestamp in ms of the earliest buy, default is undefined
     * @param {int} [limit] max number of buys to return, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of  [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchMyBuys(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchTransactionsWithMethod(method: any, code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    /**
     * @method
     * @name coinbase#fetchWithdrawals
     * @description Fetch all withdrawals made from an account. Won't return crypto withdrawals. Use fetchLedger for those.
     * @see https://docs.cdp.coinbase.com/coinbase-app/docs/api-withdrawals#list-withdrawals
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of withdrawals structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.currencyType] "fiat" or "crypto"
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    /**
     * @method
     * @name coinbase#fetchDeposits
     * @description Fetch all fiat deposits made to an account. Won't return crypto deposits or staking rewards. Use fetchLedger for those.
     * @see https://docs.cdp.coinbase.com/coinbase-app/docs/api-deposits#list-deposits
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch deposits for
     * @param {int} [limit] the maximum number of deposits structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.currencyType] "fiat" or "crypto"
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    fetchDeposits(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    /**
     * @method
     * @name coinbase#fetchDepositsWithdrawals
     * @description fetch history of deposits and withdrawals
     * @see https://docs.cdp.coinbase.com/coinbase-app/docs/api-transactions
     * @param {string} [code] unified currency code for the currency of the deposit/withdrawals, default is undefined
     * @param {int} [since] timestamp in ms of the earliest deposit/withdrawal, default is undefined
     * @param {int} [limit] max number of deposit/withdrawals to return, default = 50, Min: 1, Max: 100
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    fetchDepositsWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    parseTransactionStatus(status: Str): string;
    parseTransaction(transaction: Dict, currency?: Currency): Transaction;
    parseTrade(trade: Dict, market?: Market): Trade;
    /**
     * @method
     * @name coinbase#fetchMarkets
     * @see https://docs.cloud.coinbase.com/advanced-trade/reference/retailbrokerageapi_getpublicproducts
     * @see https://docs.cloud.coinbase.com/sign-in-with-coinbase/docs/api-currencies#get-fiat-currencies
     * @see https://docs.cloud.coinbase.com/sign-in-with-coinbase/docs/api-exchange-rates#get-exchange-rates
     * @description retrieves data on all markets for coinbase
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.usePrivate] use private endpoint for fetching markets
     * @returns {object[]} an array of objects representing market data
     */
    fetchMarkets(params?: {}): Promise<Market[]>;
    fetchMarketsV2(params?: {}): Promise<Market[]>;
    fetchMarketsV3(params?: {}): Promise<Market[]>;
    parseSpotMarket(market: any, feeTier: any): MarketInterface;
    parseContractMarket(market: any, feeTier: any): MarketInterface;
    fetchCurrenciesFromCache(params?: {}): Promise<import("./base/types.js").Dictionary<any>>;
    /**
     * @method
     * @name coinbase#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://docs.cloud.coinbase.com/sign-in-with-coinbase/docs/api-currencies#get-fiat-currencies
     * @see https://docs.cloud.coinbase.com/sign-in-with-coinbase/docs/api-exchange-rates#get-exchange-rates
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    fetchCurrencies(params?: {}): Promise<Currencies>;
    /**
     * @method
     * @name coinbase#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://docs.cloud.coinbase.com/advanced-trade/reference/retailbrokerageapi_getproducts
     * @see https://docs.cloud.coinbase.com/sign-in-with-coinbase/docs/api-exchange-rates#get-exchange-rates
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.usePrivate] use private endpoint for fetching tickers
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    fetchTickersV2(symbols?: Strings, params?: {}): Promise<Tickers>;
    fetchTickersV3(symbols?: Strings, params?: {}): Promise<Tickers>;
    /**
     * @method
     * @name coinbase#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://docs.cloud.coinbase.com/advanced-trade/reference/retailbrokerageapi_getmarkettrades
     * @see https://docs.cloud.coinbase.com/sign-in-with-coinbase/docs/api-prices#get-spot-price
     * @see https://docs.cloud.coinbase.com/sign-in-with-coinbase/docs/api-prices#get-buy-price
     * @see https://docs.cloud.coinbase.com/sign-in-with-coinbase/docs/api-prices#get-sell-price
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.usePrivate] whether to use the private endpoint for fetching the ticker
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    fetchTickerV2(symbol: string, params?: {}): Promise<Ticker>;
    fetchTickerV3(symbol: string, params?: {}): Promise<Ticker>;
    parseTicker(ticker: Dict, market?: Market): Ticker;
    parseCustomBalance(response: any, params?: {}): Balances;
    /**
     * @method
     * @name coinbase#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://docs.cloud.coinbase.com/advanced-trade/reference/retailbrokerageapi_getaccounts
     * @see https://docs.cloud.coinbase.com/sign-in-with-coinbase/docs/api-accounts#list-accounts
     * @see https://docs.cloud.coinbase.com/advanced-trade/reference/retailbrokerageapi_getfcmbalancesummary
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.v3] default false, set true to use v3 api endpoint
     * @param {string} [params.type] "spot" (default) or "swap" or "future"
     * @param {int} [params.limit] default 250, maximum number of accounts to return
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
     */
    fetchBalance(params?: {}): Promise<Balances>;
    /**
     * @method
     * @name coinbase#fetchLedger
     * @description Fetch the history of changes, i.e. actions done by the user or operations that altered the balance. Will return staking rewards, and crypto deposits or withdrawals.
     * @see https://docs.cdp.coinbase.com/coinbase-app/docs/api-transactions#list-transactions
     * @param {string} [code] unified currency code, default is undefined
     * @param {int} [since] timestamp in ms of the earliest ledger entry, default is undefined
     * @param {int} [limit] max number of ledger entries to return, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object} a [ledger structure]{@link https://docs.ccxt.com/?id=ledger-entry-structure}
     */
    fetchLedger(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<LedgerEntry[]>;
    parseLedgerEntryStatus(status: any): string;
    parseLedgerEntryType(type: any): string;
    parseLedgerEntry(item: Dict, currency?: Currency): LedgerEntry;
    findAccountId(code: any, params?: {}): Promise<string>;
    prepareAccountRequest(limit?: Int, params?: {}): Dict;
    prepareAccountRequestWithCurrencyCode(code?: Str, limit?: Int, params?: {}): Promise<Dict[]>;
    /**
     * @method
     * @name coinbase#createMarketBuyOrderWithCost
     * @description create a market buy order by providing the symbol and cost
     * @see https://docs.cloud.coinbase.com/advanced-trade/reference/retailbrokerageapi_postorder
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {float} cost how much you want to trade in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    createMarketBuyOrderWithCost(symbol: string, cost: number, params?: {}): Promise<Order>;
    /**
     * @method
     * @name coinbase#createOrder
     * @description create a trade order
     * @see https://docs.cloud.coinbase.com/advanced-trade/reference/retailbrokerageapi_postorder
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much you want to trade in units of the base currency, quote currency for 'market' 'buy' orders
     * @param {float} [price] the price to fulfill the order, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} [params.stopPrice] price to trigger stop orders
     * @param {float} [params.triggerPrice] price to trigger stop orders
     * @param {float} [params.stopLossPrice] price to trigger stop-loss orders
     * @param {float} [params.takeProfitPrice] price to trigger take-profit orders
     * @param {bool} [params.postOnly] true or false
     * @param {string} [params.timeInForce] 'GTC', 'IOC', 'GTD' or 'PO', 'FOK'
     * @param {string} [params.stop_direction] 'UNKNOWN_STOP_DIRECTION', 'STOP_DIRECTION_STOP_UP', 'STOP_DIRECTION_STOP_DOWN' the direction the stopPrice is triggered from
     * @param {string} [params.end_time] '2023-05-25T17:01:05.092Z' for 'GTD' orders
     * @param {float} [params.cost] *spot market buy only* the quote quantity that can be used as an alternative for the amount
     * @param {boolean} [params.preview] default to false, wether to use the test/preview endpoint or not
     * @param {float} [params.leverage] default to 1, the leverage to use for the order
     * @param {string} [params.marginMode] 'cross' or 'isolated'
     * @param {string} [params.retail_portfolio_id] portfolio uid
     * @param {boolean} [params.is_max] Used in conjunction with tradable_balance to indicate the user wants to use their entire tradable balance
     * @param {string} [params.tradable_balance] amount of tradable balance
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    parseOrder(order: Dict, market?: Market): Order;
    parseOrderStatus(status: Str): string;
    parseOrderType(type: Str): string;
    parseTimeInForce(timeInForce: Str): string;
    /**
     * @method
     * @name coinbase#cancelOrder
     * @description cancels an open order
     * @see https://docs.cloud.coinbase.com/advanced-trade/reference/retailbrokerageapi_cancelorders
     * @param {string} id order id
     * @param {string} symbol not used by coinbase cancelOrder()
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name coinbase#cancelOrders
     * @description cancel multiple orders
     * @see https://docs.cloud.coinbase.com/advanced-trade/reference/retailbrokerageapi_cancelorders
     * @param {string[]} ids order ids
     * @param {string} symbol not used by coinbase cancelOrders()
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    cancelOrders(ids: string[], symbol?: Str, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name coinbase#editOrder
     * @description edit a trade order
     * @see https://docs.cloud.coinbase.com/advanced-trade/reference/retailbrokerageapi_editorder
     * @param {string} id cancel order id
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.preview] default to false, wether to use the test/preview endpoint or not
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    editOrder(id: string, symbol: string, type: OrderType, side: OrderSide, amount?: Num, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name coinbase#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://docs.cloud.coinbase.com/advanced-trade/reference/retailbrokerageapi_gethistoricalorder
     * @param {string} id the order id
     * @param {string} symbol unified market symbol that the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name coinbase#fetchOrders
     * @description fetches information on multiple orders made by the user
     * @see https://docs.cloud.coinbase.com/advanced-trade/reference/retailbrokerageapi_gethistoricalorders
     * @param {string} symbol unified market symbol that the orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch trades for
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchOrdersByStatus(status: any, symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name coinbase#fetchOpenOrders
     * @description fetches information on all currently open orders
     * @see https://docs.cloud.coinbase.com/advanced-trade/reference/retailbrokerageapi_gethistoricalorders
     * @param {string} symbol unified market symbol of the orders
     * @param {int} [since] timestamp in ms of the earliest order, default is undefined
     * @param {int} [limit] the maximum number of open order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @param {int} [params.until] the latest time in ms to fetch trades for
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name coinbase#fetchClosedOrders
     * @description fetches information on multiple closed orders made by the user
     * @see https://docs.cloud.coinbase.com/advanced-trade/reference/retailbrokerageapi_gethistoricalorders
     * @param {string} symbol unified market symbol of the orders
     * @param {int} [since] timestamp in ms of the earliest order, default is undefined
     * @param {int} [limit] the maximum number of closed order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @param {int} [params.until] the latest time in ms to fetch trades for
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name coinbase#fetchCanceledOrders
     * @description fetches information on multiple canceled orders made by the user
     * @see https://docs.cloud.coinbase.com/advanced-trade/reference/retailbrokerageapi_gethistoricalorders
     * @param {string} symbol unified market symbol of the orders
     * @param {int} [since] timestamp in ms of the earliest order, default is undefined
     * @param {int} [limit] the maximum number of canceled order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchCanceledOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name coinbase#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://docs.cloud.coinbase.com/advanced-trade/reference/retailbrokerageapi_getpubliccandles
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch, not used by coinbase
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch trades for
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @param {boolean} [params.usePrivate] default false, when true will use the private endpoint to fetch the candles
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    /**
     * @method
     * @name coinbase#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://docs.cloud.coinbase.com/advanced-trade/reference/retailbrokerageapi_getpublicmarkettrades
     * @param {string} symbol unified market symbol of the trades
     * @param {int} [since] not used by coinbase fetchTrades
     * @param {int} [limit] the maximum number of trade structures to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.usePrivate] default false, when true will use the private endpoint to fetch the trades
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name coinbase#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://docs.cloud.coinbase.com/advanced-trade/reference/retailbrokerageapi_getfills
     * @param {string} symbol unified market symbol of the trades
     * @param {int} [since] timestamp in ms of the earliest order, default is undefined
     * @param {int} [limit] the maximum number of trade structures to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch trades for
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name coinbase#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.cloud.coinbase.com/advanced-trade/reference/retailbrokerageapi_getpublicproductbook
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.usePrivate] default false, when true will use the private endpoint to fetch the order book
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure} indexed by market symbols
     */
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    /**
     * @method
     * @name coinbase#fetchBidsAsks
     * @description fetches the bid and ask price and volume for multiple markets
     * @see https://docs.cloud.coinbase.com/advanced-trade/reference/retailbrokerageapi_getbestbidask
     * @param {string[]} [symbols] unified symbols of the markets to fetch the bids and asks for, all markets are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    fetchBidsAsks(symbols?: Strings, params?: {}): Promise<Tickers>;
    /**
     * @method
     * @name coinbase#withdraw
     * @description make a withdrawal
     * @see https://docs.cdp.coinbase.com/coinbase-app/transfer-apis/send-crypto
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} [tag] an optional tag for the withdrawal
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.network] the cryptocurrency network to use for the withdrawal using the lowercase name like bitcoin, ethereum, solana, etc.
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    withdraw(code: string, amount: number, address: string, tag?: Str, params?: {}): Promise<Transaction>;
    /**
     * @method
     * @name coinbase#fetchDepositAddress
     * @description fetch the deposit address for a currency associated with this account
     * @see https://docs.cloud.coinbase.com/exchange/reference/exchangerestapi_postcoinbaseaccountaddresses
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
     */
    fetchDepositAddressesByNetwork(code: string, params?: {}): Promise<DepositAddress[]>;
    parseDepositAddress(depositAddress: any, currency?: Currency): DepositAddress;
    /**
     * @method
     * @name coinbase#deposit
     * @description make a deposit
     * @see https://docs.cloud.coinbase.com/sign-in-with-coinbase/docs/api-deposits#deposit-funds
     * @param {string} code unified currency code
     * @param {float} amount the amount to deposit
     * @param {string} id the payment method id to be used for the deposit, can be retrieved from v2PrivateGetPaymentMethods
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.accountId] the id of the account to deposit into
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    deposit(code: string, amount: number, id: string, params?: {}): Promise<Transaction>;
    /**
     * @method
     * @name coinbase#fetchDeposit
     * @description fetch information on a deposit, fiat only, for crypto transactions use fetchLedger
     * @see https://docs.cloud.coinbase.com/sign-in-with-coinbase/docs/api-deposits#show-deposit
     * @param {string} id deposit id
     * @param {string} [code] unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.accountId] the id of the account that the funds were deposited into
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    fetchDeposit(id: string, code?: Str, params?: {}): Promise<Transaction>;
    /**
     * @method
     * @name coinbase#fetchDepositMethodIds
     * @description fetch the deposit id for a fiat currency associated with this account
     * @see https://docs.cdp.coinbase.com/advanced-trade/reference/retailbrokerageapi_getpaymentmethods
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an array of [deposit id structures]{@link https://docs.ccxt.com/?id=deposit-id-structure}
     */
    fetchDepositMethodIds(params?: {}): Promise<any[]>;
    /**
     * @method
     * @name coinbase#fetchDepositMethodId
     * @description fetch the deposit id for a fiat currency associated with this account
     * @see https://docs.cdp.coinbase.com/advanced-trade/reference/retailbrokerageapi_getpaymentmethod
     * @param {string} id the deposit payment method id
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [deposit id structure]{@link https://docs.ccxt.com/?id=deposit-id-structure}
     */
    fetchDepositMethodId(id: string, params?: {}): Promise<{
        info: any;
        id: string;
        currency: string;
        verified: boolean;
        tag: string;
    }>;
    parseDepositMethodIds(ids: any, params?: {}): any[];
    parseDepositMethodId(depositId: any): {
        info: any;
        id: string;
        currency: string;
        verified: boolean;
        tag: string;
    };
    /**
     * @method
     * @name coinbase#fetchConvertQuote
     * @description fetch a quote for converting from one currency to another
     * @see https://docs.cloud.coinbase.com/advanced-trade/reference/retailbrokerageapi_createconvertquote
     * @param {string} fromCode the currency that you want to sell and convert from
     * @param {string} toCode the currency that you want to buy and convert into
     * @param {float} [amount] how much you want to trade in units of the from currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {object} [params.trade_incentive_metadata] an object to fill in user incentive data
     * @param {string} [params.trade_incentive_metadata.user_incentive_id] the id of the incentive
     * @param {string} [params.trade_incentive_metadata.code_val] the code value of the incentive
     * @returns {object} a [conversion structure]{@link https://docs.ccxt.com/?id=conversion-structure}
     */
    fetchConvertQuote(fromCode: string, toCode: string, amount?: Num, params?: {}): Promise<Conversion>;
    /**
     * @method
     * @name coinbase#createConvertTrade
     * @description convert from one currency to another
     * @see https://docs.cloud.coinbase.com/advanced-trade/reference/retailbrokerageapi_commitconverttrade
     * @param {string} id the id of the trade that you want to make
     * @param {string} fromCode the currency that you want to sell and convert from
     * @param {string} toCode the currency that you want to buy and convert into
     * @param {float} [amount] how much you want to trade in units of the from currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [conversion structure]{@link https://docs.ccxt.com/?id=conversion-structure}
     */
    createConvertTrade(id: string, fromCode: string, toCode: string, amount?: Num, params?: {}): Promise<Conversion>;
    /**
     * @method
     * @name coinbase#fetchConvertTrade
     * @description fetch the data for a conversion trade
     * @see https://docs.cloud.coinbase.com/advanced-trade/reference/retailbrokerageapi_getconverttrade
     * @param {string} id the id of the trade that you want to commit
     * @param {string} code the unified currency code that was converted from
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {strng} params.toCode the unified currency code that was converted into
     * @returns {object} a [conversion structure]{@link https://docs.ccxt.com/?id=conversion-structure}
     */
    fetchConvertTrade(id: string, code?: Str, params?: {}): Promise<Conversion>;
    parseConversion(conversion: Dict, fromCurrency?: Currency, toCurrency?: Currency): Conversion;
    /**
     * @method
     * @name coinbase#closePosition
     * @description *futures only* closes open positions for a market
     * @see https://docs.cdp.coinbase.com/coinbase-app/trade/reference/retailbrokerageapi_closeposition
     * @param {string} symbol Unified CCXT market symbol
     * @param {string} [side] not used by coinbase
     * @param {object} [params] extra parameters specific to the coinbase api endpoint
     * @param {string}  params.clientOrderId *mandatory* the client order id of the position to close
     * @param {float} [params.size] the size of the position to close, optional
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    closePosition(symbol: string, side?: OrderSide, params?: {}): Promise<Order>;
    /**
     * @method
     * @name coinbase#fetchPositions
     * @description fetch all open positions
     * @see https://docs.cloud.coinbase.com/advanced-trade/reference/retailbrokerageapi_getfcmpositions
     * @see https://docs.cloud.coinbase.com/advanced-trade/reference/retailbrokerageapi_getintxpositions
     * @param {string[]} [symbols] list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.portfolio] the portfolio UUID to fetch positions for
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/?id=position-structure}
     */
    fetchPositions(symbols?: Strings, params?: {}): Promise<Position[]>;
    /**
     * @method
     * @name coinbase#fetchPosition
     * @description fetch data on a single open contract trade position
     * @see https://docs.cloud.coinbase.com/advanced-trade/reference/retailbrokerageapi_getintxposition
     * @see https://docs.cloud.coinbase.com/advanced-trade/reference/retailbrokerageapi_getfcmposition
     * @param {string} symbol unified market symbol of the market the position is held in, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.product_id] *futures only* the product id of the position to fetch, required for futures markets only
     * @param {string} [params.portfolio] *perpetual/swaps only* the portfolio UUID to fetch the position for, required for perpetual/swaps markets only
     * @returns {object} a [position structure]{@link https://docs.ccxt.com/?id=position-structure}
     */
    fetchPosition(symbol: string, params?: {}): Promise<Position>;
    parsePosition(position: Dict, market?: Market): Position;
    /**
     * @method
     * @name coinbase#fetchTradingFees
     * @see https://docs.cdp.coinbase.com/advanced-trade/reference/retailbrokerageapi_gettransactionsummary/
     * @description fetch the trading fees for multiple markets
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] 'spot' or 'swap'
     * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure} indexed by market symbols
     */
    fetchTradingFees(params?: {}): Promise<TradingFees>;
    /**
     * @method
     * @name coinbase#fetchPortfolioDetails
     * @description Fetch details for a specific portfolio by UUID
     * @see https://docs.cloud.coinbase.com/advanced-trade/reference/retailbrokerageapi_getportfolios
     * @param {string} portfolioUuid The unique identifier of the portfolio to fetch
     * @param {Dict} [params] Extra parameters specific to the exchange API endpoint
     * @returns {any[]} An account structure <https://docs.ccxt.com/?id=account-structure>
     */
    fetchPortfolioDetails(portfolioUuid: string, params?: {}): Promise<any[]>;
    parsePortfolioDetails(portfolioData: Dict): any[];
    createAuthToken(seconds: Int, method?: Str, url?: Str, useEddsa?: boolean): string;
    nonce(): number;
    sign(path: any, api?: any[], method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(code: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): any;
    /**
     * @method
     * @name coinbase#fetchDepositAddresses
     * @description fetch deposit addresses for multiple currencies (when available)
     * @see https://coinbase-migration.mintlify.app/coinbase-app/transfer-apis/onchain-addresses
     * @param {string[]} [codes] list of unified currency codes, default is undefined (all currencies)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.accountId] account ID to fetch deposit addresses for
     * @returns {object} a dictionary of [address structures]{@link https://docs.ccxt.com/#/?id=address-structure} indexed by currency code
     */
    fetchDepositAddresses(codes?: Strings, params?: {}): Promise<DepositAddress[]>;
}
