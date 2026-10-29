import Exchange from './abstract/coinbaseinternational.js';
import type { Int, Num, OrderSide, OrderType, Order, Trade, Ticker, Str, Transaction, Balances, Tickers, Strings, Market, MarketInterface, Currency, CurrencyInterface, TransferEntry, Position, FundingRateHistory, Currencies, Dict, NullableDict, int, OHLCV, Leverage } from './base/types.js';
/**
 * @class coinbaseinternational
 * @augments Exchange
 */
export default class coinbaseinternational extends Exchange {
    describe(): Dict;
    /**
     * @method
     * @name coinbaseinternational#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @see https://docs.cdp.coinbase.com/api-reference/supporting/public-get_time
     * @see https://docs.deribit.com/api-reference/supporting/public-get_time
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    fetchTime(params?: Dict): Promise<Int>;
    /**
     * @method
     * @name coinbaseinternational#fetchMarkets
     * @description retrieves data on all markets for coinbaseinternational
     * @see https://docs.cdp.coinbase.com/api-reference/market-data/public-get_instruments
     * @see https://docs.deribit.com/api-reference/market-data/public-get_instruments
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @param {string} [params.currency] settlement currency filter, defaults to any on Deribit
     * @returns {object[]} an array of objects representing market data
     */
    fetchMarkets(params?: Dict): Promise<Market[]>;
    parseMarket(market: Dict): Market;
    /**
     * @method
     * @name coinbaseinternational#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://docs.cdp.coinbase.com/api-reference/market-data/public-get_currencies
     * @see https://docs.deribit.com/api-reference/market-data/public-get_currencies
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @returns {object} an associative dictionary of currencies
     */
    fetchCurrencies(params?: Dict): Promise<Currencies>;
    parseCurrency(currency: Dict): CurrencyInterface;
    /**
     * @method
     * @name coinbaseinternational#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://docs.cdp.coinbase.com/api-reference/market-data/public-get_tradingview_chart_data
     * @see https://docs.deribit.com/api-reference/market-data/public-get_tradingview_chart_data
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch, default 100 max 10000
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @param {int} [params.until] timestamp in ms of the latest candle to fetch
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: Dict): Promise<OHLCV[]>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    /**
     * @method
     * @name coinbaseinternational#fetchFundingRateHistory
     * @description fetches historical funding rate prices
     * @see https://docs.cdp.coinbase.com/api-reference/market-data/public-get_funding_rate_history
     * @see https://docs.deribit.com/api-reference/market-data/public-get_funding_rate_history
     * @param {string} symbol unified symbol of the market to fetch the funding rate history for
     * @param {int} [since] timestamp in ms of the earliest funding rate to fetch
     * @param {int} [limit] the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure} to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @param {int} [params.until] timestamp in ms of the latest funding rate
     * @param {boolean} [params.paginate] native Deribit automatic pagination is not supported
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure}
     */
    fetchFundingRateHistory(symbol?: Str, since?: Int, limit?: Int, params?: Dict): Promise<FundingRateHistory[]>;
    parseFundingRateHistory(info: any, market?: Market): FundingRateHistory;
    parseFundingRate(contract: any, market?: Market): {
        info: any;
        symbol: string;
        markPrice: undefined;
        indexPrice: Num;
        interestRate: undefined;
        estimatedSettlePrice: undefined;
        timestamp: Int;
        datetime: string | undefined;
        fundingRate: Num;
        fundingTimestamp: Int;
        fundingDatetime: string | undefined;
        nextFundingRate: undefined;
        nextFundingTimestamp: undefined;
        nextFundingDatetime: undefined;
        previousFundingRate: undefined;
        previousFundingTimestamp: undefined;
        previousFundingDatetime: undefined;
    };
    /**
     * @method
     * @name coinbaseinternational#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://docs.cdp.coinbase.com/api-reference/market-data/public-ticker
     * @see https://docs.deribit.com/api-reference/market-data/public-ticker
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    fetchTickers(symbols?: Strings, params?: Dict): Promise<Tickers>;
    /**
     * @method
     * @name coinbaseinternational#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://docs.cdp.coinbase.com/api-reference/market-data/public-ticker
     * @see https://docs.deribit.com/api-reference/market-data/public-ticker
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    fetchTicker(symbol: string, params?: Dict): Promise<Ticker>;
    parseTicker(ticker: object, market?: Market): Ticker;
    /**
     * @method
     * @name coinbaseinternational#fetchOrderBook
     * @description fetches a market order book
     * @see https://docs.cdp.coinbase.com/api-reference/market-data/public-get_order_book
     * @see https://docs.deribit.com/api-reference/market-data/public-get_order_book
     * @param {string} symbol unified market symbol
     * @param {int} [limit] the maximum number of bids and asks to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @returns {object} an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
     */
    fetchOrderBook(symbol: string, limit?: Int, params?: Dict): Promise<import("./base/types.js").OrderBook>;
    /**
     * @method
     * @name coinbaseinternational#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://docs.cdp.coinbase.com/api-reference/account-management/private-get_account_summaries
     * @see https://docs.deribit.com/api-reference/account-management/private-get_account_summaries
     * @see https://docs.deribit.com/api-reference/account-management/private-get_account_summary
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @param {string} [params.code] unified currency code for a native Deribit single account summary
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
     */
    fetchBalance(params?: Dict): Promise<Balances>;
    parseBalanceList(response: any): Balances;
    /**
     * @method
     * @name coinbaseinternational#fetchTransfers
     * @description fetch a history of internal transfers made on an account
     * @see https://docs.cdp.coinbase.com/api-reference/account-management/private-get_transaction_log
     * @see https://docs.deribit.com/api-reference/account-management/private-get_transaction_log
     * @param {string} code unified currency code of the currency transferred
     * @param {int} [since] the earliest time in ms to fetch transfers for
     * @param {int} [limit] the maximum number of transfers structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @param {int} [params.until] timestamp in ms of the latest transfer to fetch
     * @param {string} [params.continuation] continuation token for pagination
     * @returns {object[]} a list of [transfer structures]{@link https://docs.ccxt.com/?id=transfer-structure}
     */
    fetchTransfers(code?: Str, since?: Int, limit?: Int, params?: Dict): Promise<TransferEntry[]>;
    parseTransfer(transfer: Dict, currency?: Currency): TransferEntry;
    /**
     * @method
     * @name coinbaseinternational#fetchPosition
     * @description fetch data on an open position
     * @see https://docs.cdp.coinbase.com/api-reference/account-management/private-get_position
     * @see https://docs.deribit.com/api-reference/account-management/private-get_position
     * @param {string} symbol unified market symbol of the market the position is held in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @returns {object} a [position structure]{@link https://docs.ccxt.com/?id=position-structure}
     */
    fetchPosition(symbol: string, params?: Dict): Promise<Position>;
    parsePosition(position: Dict, market?: Market): Position;
    /**
     * @method
     * @name coinbaseinternational#fetchPositions
     * @description fetch all open positions
     * @see https://docs.cdp.coinbase.com/api-reference/account-management/private-get_positions
     * @see https://docs.deribit.com/api-reference/account-management/private-get_positions
     * @param {string[]} [symbols] list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @param {string} [params.currency] settlement currency filter
     * @param {string} [params.kind] instrument kind filter
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/?id=position-structure}
     */
    fetchPositions(symbols?: Strings, params?: Dict): Promise<Position[]>;
    /**
     * @method
     * @name coinbaseinternational#fetchDepositsWithdrawals
     * @description fetch history of deposits and withdrawals
     * @see https://docs.cdp.coinbase.com/api-reference/account-management/private-get_transaction_log
     * @see https://docs.deribit.com/api-reference/account-management/private-get_transaction_log
     * @param {string} code unified currency code
     * @param {int} [since] timestamp in ms of the earliest transaction to fetch
     * @param {int} [limit] the maximum number of transactions to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @param {int} [params.until] timestamp in ms of the latest transaction to fetch
     * @param {string} [params.query] transaction-log query filter
     * @param {string} [params.continuation] continuation token for pagination
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    fetchDepositsWithdrawals(code?: Str, since?: Int, limit?: Int, params?: Dict): Promise<Transaction[]>;
    /**
     * @method
     * @name coinbaseinternational#fetchWithdrawals
     * @description fetch all withdrawals made from an account
     * @see https://docs.cdp.coinbase.com/api-reference/account-management/private-get_transaction_log
     * @see https://docs.deribit.com/api-reference/account-management/private-get_transaction_log
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of withdrawals structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @param {int} [params.until] timestamp in ms of the latest transaction to fetch
     * @param {string} [params.continuation] continuation token for pagination
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: Dict): Promise<Transaction[]>;
    /**
     * @method
     * @name coinbaseinternational#fetchDeposits
     * @description fetch all deposits made to an account
     * @see https://docs.cdp.coinbase.com/api-reference/account-management/private-get_transaction_log
     * @see https://docs.deribit.com/api-reference/account-management/private-get_transaction_log
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch deposits for
     * @param {int} [limit] the maximum number of deposits structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @param {int} [params.until] timestamp in ms of the latest transaction to fetch
     * @param {string} [params.continuation] continuation token for pagination
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    fetchDeposits(code?: Str, since?: Int, limit?: Int, params?: Dict): Promise<Transaction[]>;
    parseTransaction(transaction: Dict, currency?: Currency): Transaction;
    /**
     * @ignore
     * @method
     * @name coinbaseinternational#getOrderAmount
     * @description converts unified native Deribit contract quantities to exchange amount units
     * @param {object} market unified market
     * @param {float} amount unified order quantity
     * @returns {string} precision-formatted exchange order amount
     */
    getOrderAmount(market: MarketInterface, amount: Num): Str;
    /**
     * @method
     * @name coinbaseinternational#createOrder
     * @description create a trade order
     * @see https://docs.cdp.coinbase.com/api-reference/trading/private-buy
     * @see https://docs.cdp.coinbase.com/api-reference/trading/private-sell
     * @see https://docs.deribit.com/api-reference/trading/private-buy
     * @see https://docs.deribit.com/api-reference/trading/private-sell
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount number of contracts for native Deribit derivatives, otherwise the exchange order amount (base currency for spot)
     * @param {float} [price] the price to fulfill the order, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @param {float} [params.stopPrice] alias for triggerPrice
     * @param {float} [params.triggerPrice] price to trigger stop orders
     * @param {float} [params.stopLossPrice] price to trigger stop-loss orders
     * @param {bool} [params.postOnly] true or false
     * @param {string} [params.tif] 'GTC', 'IOC', 'GTD' default is 'GTC' for limit orders and 'IOC' for market orders
     * @param {string} [params.expire_time] The expiration time required for orders with the time in force set to GTT. Must not go beyond 30 days of the current time. Uses ISO-8601 format (e.g., 2023-03-16T23:59:53Z)
     * @param {string} [params.stp_mode] Possible values: [NONE, AGGRESSING, BOTH] Specifies the behavior for self match handling. None disables the functionality, new cancels the newest order, and both cancels both orders.
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: Dict): Promise<Order>;
    parseOrder(order: Dict, market?: Market): Order;
    parseTimeInForce(timeInForce: Str): Str;
    parseOrderStatus(status: Str): Str;
    parseOrderType(type: Str): Str;
    /**
     * @method
     * @name coinbaseinternational#cancelOrder
     * @description cancels an open order
     * @see https://docs.cdp.coinbase.com/api-reference/trading/private-cancel
     * @see https://docs.deribit.com/api-reference/trading/private-cancel
     * @param {string} id order id
     * @param {string} symbol not used by cancelOrder()
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    cancelOrder(id: string, symbol?: Str, params?: Dict): Promise<Order>;
    /**
     * @method
     * @name coinbaseinternational#cancelAllOrders
     * @description cancel all open orders
     * @see https://docs.cdp.coinbase.com/api-reference/trading/private-cancel_all
     * @see https://docs.cdp.coinbase.com/api-reference/trading/private-cancel_all_by_instrument
     * @see https://docs.deribit.com/api-reference/trading/private-cancel_all
     * @see https://docs.deribit.com/api-reference/trading/private-cancel_all_by_instrument
     * @param {string} [symbol] unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    cancelAllOrders(symbol?: Str, params?: Dict): Promise<Order[]>;
    /**
     * @method
     * @name coinbaseinternational#editOrder
     * @description edit a trade order
     * @see https://docs.cdp.coinbase.com/api-reference/trading/private-edit
     * @see https://docs.deribit.com/api-reference/trading/private-edit
     * @param {string} id cancel order id
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount number of contracts for native Deribit derivatives, otherwise the exchange order amount (base currency for spot)
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @param {float} [params.triggerPrice] price to trigger stop orders
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    editOrder(id: string, symbol: string, type: OrderType, side: OrderSide, amount?: Num, price?: Num, params?: Dict): Promise<Order>;
    /**
     * @method
     * @name coinbaseinternational#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://docs.cdp.coinbase.com/api-reference/trading/private-get_order_state
     * @see https://docs.deribit.com/api-reference/trading/private-get_order_state
     * @param {string} id the order id
     * @param {string} symbol unified market symbol that the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchOrder(id: string, symbol?: Str, params?: Dict): Promise<Order>;
    /**
     * @method
     * @name coinbaseinternational#fetchOpenOrders
     * @description fetches information on all currently open orders
     * @see https://docs.cdp.coinbase.com/api-reference/trading/private-get_open_orders_by_instrument
     * @see https://docs.deribit.com/api-reference/trading/private-get_open_orders_by_instrument
     * @param {string} symbol unified market symbol of the orders
     * @param {int} [since] timestamp in ms of the earliest order, default is undefined
     * @param {int} [limit] the maximum number of open order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @param {boolean} [params.paginate] native Deribit pagination is not supported
     * @param {int} [params.offset] offset
     * @param {string} [params.event_type] The most recent type of event that happened to the order. Allowed values: NEW, TRADE, REPLACED
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: Dict): Promise<Order[]>;
    /**
     * @method
     * @name coinbaseinternational#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://docs.cdp.coinbase.com/api-reference/trading/private-get_user_trades_by-instrument
     * @see https://docs.deribit.com/api-reference/trading/private-get_user_trades_by_instrument
     * @see https://docs.deribit.com/api-reference/trading/private-get_user_trades_by_instrument_and_time
     * @param {string} symbol unified market symbol of the trades
     * @param {int} [since] timestamp in ms of the earliest order, default is undefined
     * @param {int} [limit] the maximum number of trade structures to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @param {boolean} [params.historical] native Deribit indexed history, excludes recent trades
     * @param {int} [params.until] native Deribit latest time in ms to fetch trades for
     * @param {boolean} [params.paginate] native Deribit automatic pagination is not supported
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: Dict): Promise<Trade[]>;
    parseTrade(trade: Dict, market?: Market): Trade;
    /**
     * @method
     * @name coinbaseinternational#fetchLeverage
     * @description fetch the set leverage for a market
     * @see https://docs.cdp.coinbase.com/api-reference/account-management/private-get_leverage
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route; native route throws NotSupported; get_leverage is gateway-only
     * @param {boolean} [params.isolated] set to true for isolated margin
     * @param {int} [params.subaccount_id] The user id for the subaccount, available to retail broker callers, defaults to the authenticated account
     * @returns {object} a [leverage structure]{@link https://docs.ccxt.com/?id=leverage-structure}
     */
    fetchLeverage(symbol: string, params?: Dict): Promise<Leverage>;
    parseLeverage(leverage: Dict, market?: Market): Leverage;
    /**
     * @method
     * @name coinbaseinternational#setLeverage
     * @description set the level of leverage for a market
     * @see https://docs.cdp.coinbase.com/api-reference/trading/private-set_leverage
     * @param {int} leverage the rate of leverage
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route; native route throws NotSupported; set_leverage is gateway-only
     * @param {boolean} [params.isolated] set to true for isolated margin
     * @param {int} [params.subaccount_id] The user id for the subaccount, available to retail broker callers, defaults to the authenticated account
     * @returns {object} response from the exchange
     */
    setLeverage(leverage: int, symbol?: Str, params?: Dict): Promise<Dict>;
    /**
     * @ignore
     * @method
     * @description signs a short-lived CDP JWT that public/auth exchanges for a gateway access token
     * @see https://docs.cdp.coinbase.com/api-reference/v2/authentication
     * @see https://docs.cdp.coinbase.com/get-started/authentication/jwt-authentication
     * @see https://docs.cdp.coinbase.com/coinbase-app/authentication-authorization/api-key-authentication
     * @see https://docs.cdp.coinbase.com/coinbase-app/authentication-authorization/api-key-authentication#generating-a-jwt
     * @see https://docs.cdp.coinbase.com/coinbase-app/oauth2-integration/access-and-refresh-tokens
     * @see https://docs.cdp.coinbase.com/api-reference/coinbase-deribit-app-api/rest-api/authentication/post-publicauth
     * @see https://docs.cdp.coinbase.com/coinbase-app/advanced-trade-apis/guides/derivatives/technical#authentication
     * @see https://docs.cdp.coinbase.com/coinbase-app/advanced-trade-apis/guides/derivatives/deribit-partners#authentication
     * @see https://docs.cdp.coinbase.com/coinbase-app/advanced-trade-apis/guides/derivatives/intx-partners#authentication
     * @param {int} seconds current timestamp in seconds
     * @param {string} [method] request method
     * @param {string} [url] request URL
     * @param {boolean} [useEddsa] true for Ed25519 keys, false for ECDSA PEM keys
     * @returns {string} signed JWT
     */
    createAuthToken(seconds: Int, method?: Str, url?: Str, useEddsa?: boolean): string;
    /**
     * @ignore
     * @method
     * @description exchanges a CDP JWT for a Deribit gateway access token
     * @see https://docs.cdp.coinbase.com/coinbase-app/advanced-trade-apis/guides/derivatives/technical#authentication
     * @see https://docs.cdp.coinbase.com/coinbase-app/advanced-trade-apis/guides/derivatives/overview
     * @see https://docs.cdp.coinbase.com/coinbase-app/oauth2-integration/access-and-refresh-tokens
     * @see https://docs.cdp.coinbase.com/api-reference/v2/authentication#generate-bearer-token
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.forceRefresh] ignore the cached token and request a new one
     * @returns {string} a Deribit gateway access token
     */
    authenticateV2(params?: Dict): Promise<Str>;
    /**
     * @ignore
     * @method
     * @description the cached gateway access token, options.v2AccessToken takes precedence over exchange.token
     * @returns {string|undefined} the access token
     */
    getV2AccessToken(): Str;
    sign(path: string, api?: string[], method?: string, params?: Dict): Dict;
    /**
     * @ignore
     * @method
     * @description whether the configured secret is an Ed25519 (EdDSA) CDP key rather than an ECDSA PEM key
     * @returns {boolean} true for Ed25519 keys
     */
    isEddsaSecret(): boolean;
    /**
     * @ignore
     * @method
     * @name coinbaseinternational#handleRouteAndParams
     * @description selects a backend before market loading or authentication and removes routing parameters
     * @param {string} methodName unified REST or Pro method name
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @returns {object} cleaned parameters; options.route persists the selection for nested calls and Pro
     */
    handleRouteAndParams(methodName: string, params?: Dict): Dict;
    /**
     * @ignore
     * @method
     * @name coinbaseinternational#isNativeDeribitCredentials
     * @description reads the selected backend or resolves the configured automatic or explicit route
     * @returns {boolean} true for the native Deribit route
     */
    isNativeDeribitCredentials(): boolean;
    /**
     * @ignore
     * @method
     * @name coinbaseinternational#resolveRoute
     * @description resolves a backend override or conservatively detects the known native Deribit credential format
     * @param {string} [route] auto (default), deribit, or coinbase
     * @returns {boolean} true for native Deribit, false for Coinbase
     */
    resolveRoute(route?: any): boolean;
    handleErrors(code: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: NullableDict, requestBody: Str): undefined;
}
