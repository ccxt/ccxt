import Exchange from './abstract/nado.js';
import type { Balances, Currencies, Currency, Dict, FundingHistory, FundingRate, FundingRates, Int, Market, Num, OHLCV, Order, OrderBook, OrderSide, OrderType, Position, Str, Strings, Ticker, Tickers, Trade, Transaction, Status } from './base/types.js';
/**
 * @class nado
 * @augments Exchange
 */
export default class nado extends Exchange {
    describe(): any;
    /**
     * @method
     * @name nado#createOrder
     * @description create a trade order
     * @see https://docs.nado.xyz/developer-resources/api/gateway/executes/place-order
     * @see https://docs.nado.xyz/developer-resources/api/trigger/executes/place-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type must be 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subaccount] the 12-byte subaccount identifier, defaults to 'default'
     * @param {string|int} [params.expiration] order expiration timestamp in seconds, defaults to 4294967295
     * @param {string|int} [params.appendix] pre-encoded order appendix
     * @param {boolean} [params.reduceOnly] true if the order should only reduce position
     * @param {boolean} [params.postOnly] true to create a post-only order
     * @param {string} [params.timeInForce] 'GTC', 'IOC', 'FOK', or 'PO'
     * @param {boolean} [params.spotLeverage] whether leverage should be used for spot, defaults to true, exchange-specific alias params.spot_leverage
     * @param {float} [params.triggerPrice] *swap only* The price at which a trigger order is triggered at
     * @param {float} [params.stopLossPrice] *swap only* The price at which a stop loss order is triggered at
     * @param {float} [params.takeProfitPrice] *swap only* The price at which a take profit order is triggered at
     * @param {string} [params.triggerDirection] trigger direction, above, below
     * @param {int} [params.id] client-provided request id, returned by the exchange in the response
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @ignore
     * @name nado#createOrderRequest
     * @description build and sign the place_order execute payload
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type must be 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} the request payload for the place_order execute
     */
    createOrderRequest(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Dict>;
    /**
     * @method
     * @name nado#editOrder
     * @description edit a trade order
     * @see https://docs.nado.xyz/developer-resources/api/gateway/executes/cancel-and-place
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market to edit an order in
     * @param {string} type must be 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subaccount] the 12-byte subaccount identifier, defaults to 'default'
     * @param {string|int} [params.expiration] order expiration timestamp in seconds, defaults to 4294967295
     * @param {string|int} [params.appendix] pre-encoded order appendix
     * @param {boolean} [params.reduceOnly] true if the order should only reduce position
     * @param {boolean} [params.postOnly] true to create a post-only order
     * @param {string} [params.timeInForce] 'GTC', 'IOC', 'FOK', or 'PO'
     * @param {boolean} [params.spotLeverage] whether leverage should be used for spot, defaults to true, exchange-specific alias params.spot_leverage
     * @param {boolean} [params.placeRequiresUnfilled] when true, aborts the new order if the canceled order had partial fills or the cancel failed, exchange-specific alias params.place_requires_unfilled, defaults to true
     * @param {int} [params.id] client-provided request id, returned by the exchange in the response
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    editOrder(id: string, symbol: string, type: OrderType, side: OrderSide, amount?: Num, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @ignore
     * @name nado#editOrderRequest
     * @description build and sign the cancel_and_place execute payload
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market to edit an order in
     * @param {string} type must be 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} the request payload for the cancel_and_place execute
     */
    editOrderRequest(id: string, symbol: string, type: OrderType, side: OrderSide, amount?: Num, price?: Num, params?: {}): Promise<Dict>;
    /**
     * @method
     * @name nado#cancelOrder
     * @description cancels an open order
     * @see https://docs.nado.xyz/developer-resources/api/gateway/executes/cancel-orders
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subaccount] the 12-byte subaccount identifier, defaults to 'default'
     * @param {string} [params.requiredUnfilledAmount] cancel only if the order's absolute remaining unfilled amount matches this amount, exchange-specific raw x18 alias params.required_unfilled_amount
     * @param {int} [params.id] client-provided request id, returned by the exchange in the response
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name nado#cancelAllOrders
     * @description cancel all open orders
     * @see https://docs.nado.xyz/developer-resources/api/gateway/executes/cancel-product-orders
     * @param {string} [symbol] unified market symbol, when undefined all orders for all products are canceled
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subaccount] the 12-byte subaccount identifier, defaults to 'default'
     * @param {int} [params.id] client-provided request id, returned by the exchange in the response
     * @param {boolean} [params.trigger] set to true if you would like to fetch portfolio margin account trigger or conditional orders
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    cancelAllOrders(symbol?: Str, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @ignore
     * @name nado#cancelAllOrdersRequest
     * @description build and sign the cancel_product_orders execute payload
     * @param {string} [symbol] unified market symbol, when undefined all orders for all products are canceled
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} the request payload for the cancel_product_orders execute
     */
    cancelAllOrdersRequest(symbol?: Str, params?: {}): Promise<Dict>;
    /**
     * @method
     * @name nado#cancelOrders
     * @description cancel multiple orders
     * @see https://docs.nado.xyz/developer-resources/api/gateway/executes/cancel-orders
     * @param {string[]} ids order ids
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subaccount] the 12-byte subaccount identifier, defaults to 'default'
     * @param {string} [params.requiredUnfilledAmount] cancel only if the order's absolute remaining unfilled amount matches this amount, exchange-specific raw x18 alias params.required_unfilled_amount
     * @param {int} [params.id] client-provided request id, returned by the exchange in the response
     * @param {boolean} [params.trigger] set to true if you would like to fetch portfolio margin account trigger or conditional orders
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    cancelOrders(ids: string[], symbol?: Str, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @ignore
     * @name nado#cancelOrdersRequest
     * @description build and sign the cancel_orders execute payload
     * @param {string[]} ids order ids
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} the request payload for the cancel_orders execute
     */
    cancelOrdersRequest(ids: string[], symbol?: Str, params?: {}): Promise<Dict>;
    /**
     * @method
     * @name nado#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://docs.nado.xyz/developer-resources/api/gateway/queries/order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name nado#fetchOrders
     * @description fetches information on multiple orders made by the user
     * @see https://docs.nado.xyz/developer-resources/api/archive-indexer/orders
     * @see https://docs.nado.xyz/developer-resources/api/trigger/queries/list-trigger-orders
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.trigger] set to true if you would like to fetch portfolio margin account trigger or conditional orders
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name nado#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://docs.nado.xyz/developer-resources/api/gateway/queries/orders
     * @see https://docs.nado.xyz/developer-resources/api/trigger/queries/list-trigger-orders
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of open order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subaccount] the 12-byte subaccount identifier, defaults to 'default'
     * @param {boolean} [params.trigger] whether the order is a trigger order
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name nado#fetchClosedOrders
     * @description fetches information on multiple closed orders made by the user
     * @see https://docs.nado.xyz/developer-resources/api/archive-indexer/orders
     * @see https://docs.nado.xyz/developer-resources/api/trigger/queries/list-trigger-orders
     * @param {string} [symbol] unified market symbol of the market orders were made in
     * @param {int} [since] timestamp in ms of the earliest order
     * @param {int} [limit] the maximum number of orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subaccount] the 12-byte subaccount identifier, defaults to 'default'
     * @param {int} [params.until] timestamp in ms of the latest order to fetch
     * @param {boolean} [params.trigger] whether the order is a trigger order
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name nado#fetchCanceledOrders
     * @description fetches information on multiple canceled orders made by the user
     * @see https://docs.nado.xyz/developer-resources/api/trigger/queries/list-trigger-orders
     * @param {string} symbol unified market symbol of the market the orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.trigger] set to true if you would like to fetch portfolio margin account trigger or conditional orders
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchCanceledOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name nado#fetchCanceledAndClosedOrders
     * @description fetches information on multiple canceled orders made by the user
     * @see https://docs.nado.xyz/developer-resources/api/trigger/queries/list-trigger-orders
     * @param {string} symbol unified market symbol of the market the orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.trigger] set to true if you would like to fetch portfolio margin account trigger or conditional orders
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchCanceledAndClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name nado#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://docs.nado.xyz/developer-resources/api/archive-indexer/matches
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] timestamp in ms of the earliest trade
     * @param {int} [limit] the maximum number of trades to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subaccount] the 12-byte subaccount identifier, defaults to 'default'
     * @param {int} [params.until] timestamp in ms of the latest trade to fetch
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name nado#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://docs.nado.xyz/developer-resources/api/gateway/queries/subaccount-info
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subaccount] the 12-byte subaccount identifier, defaults to 'default'
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
     */
    fetchBalance(params?: {}): Promise<Balances>;
    /**
     * @method
     * @name nado#fetchDeposits
     * @description fetch all deposits made to an account
     * @see https://docs.nado.xyz/developer-resources/api/archive-indexer/events
     * @param {string} [code] unified currency code
     * @param {int} [since] the earliest time in ms to fetch deposits for
     * @param {int} [limit] the maximum number of deposits structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subaccount] the 12-byte subaccount identifier, defaults to 'default'
     * @param {int} [params.until] timestamp in ms of the latest deposit to fetch
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchDeposits(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    /**
     * @method
     * @name nado#fetchWithdrawals
     * @description fetch all withdrawals made from an account
     * @see https://docs.nado.xyz/developer-resources/api/archive-indexer/events
     * @param {string} [code] unified currency code
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of withdrawals structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subaccount] the 12-byte subaccount identifier, defaults to 'default'
     * @param {int} [params.until] timestamp in ms of the latest withdrawal to fetch
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    queryTransactionsByEventType(eventType: string, transactionType: string, methodName: string, code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    /**
     * @method
     * @name nado#fetchPositions
     * @description fetch all open positions
     * @see https://docs.nado.xyz/developer-resources/api/gateway/queries/subaccount-info
     * @param {string[]} [symbols] list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subaccount] the 12-byte subaccount identifier, defaults to 'default'
     * @returns {Position[]} a list of [position structures]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    fetchPositions(symbols?: Strings, params?: {}): Promise<Position[]>;
    /**
     * @method
     * @name nado#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @see https://docs.nado.xyz/developer-resources/api/gateway/edge#control-messages
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    fetchTime(params?: {}): Promise<Int>;
    /**
     * @method
     * @name nado#fetchStatus
     * @description the latest known information on the availability of the exchange API
     * @see https://docs.nado.xyz/developer-resources/api/gateway/queries/status
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [status structure]{@link https://docs.ccxt.com/?id=exchange-status-structure}
     */
    fetchStatus(params?: {}): Promise<Status>;
    /**
     * @method
     * @name nado#fetchMarkets
     * @description retrieves data on all markets for nado
     * @see https://docs.nado.xyz/developer-resources/api/gateway/queries/symbols
     * @see https://docs.nado.xyz/developer-resources/api/v2/pairs
     * @see https://docs.nado.xyz/developer-resources/api/v2/assets
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    fetchMarkets(params?: {}): Promise<Market[]>;
    /**
     * @method
     * @name nado#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://docs.nado.xyz/developer-resources/api/v2/assets
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    fetchCurrencies(params?: {}): Promise<Currencies>;
    /**
     * @method
     * @name nado#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://docs.nado.xyz/developer-resources/api/v2/tickers
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    /**
     * @method
     * @name nado#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://docs.nado.xyz/developer-resources/api/v2/tickers
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    /**
     * @method
     * @name nado#fetchFundingRate
     * @description fetch the current funding rate
     * @see https://docs.nado.xyz/developer-resources/api/v2/contracts
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.edge] whether to retrieve volume and open interest metrics for all chains, defaults to true
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/?id=funding-rate-structure}
     */
    fetchFundingRate(symbol: string, params?: {}): Promise<FundingRate>;
    /**
     * @method
     * @name nado#fetchFundingHistory
     * @description fetch the history of funding payments paid and received on this account
     * @see https://docs.nado.xyz/developer-resources/api/archive-indexer/interest-and-funding-payments
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch funding history for
     * @param {int} [limit] the maximum number of funding history structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subaccount] the 12-byte subaccount identifier, defaults to 'default'
     * @returns {object[]} a list of [funding history structures]{@link https://docs.ccxt.com/?id=funding-history-structure}
     */
    fetchFundingHistory(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<FundingHistory[]>;
    /**
     * @method
     * @name nado#fetchFundingRates
     * @description fetch the funding rate for multiple markets
     * @see https://docs.nado.xyz/developer-resources/api/v2/contracts
     * @param {string[]} [symbols] list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.edge] whether to retrieve volume and open interest metrics for all chains, defaults to true
     * @returns {object} a dictionary of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rates-structure}, indexed by market symbols
     */
    fetchFundingRates(symbols?: Strings, params?: {}): Promise<FundingRates>;
    /**
     * @method
     * @name nado#fetchOpenInterest
     * @description retrieves the open interest of a contract trading pair
     * @see https://docs.nado.xyz/developer-resources/api/v2/contracts
     * @param {string} symbol unified CCXT market symbol
     * @param {object} [params] exchange specific parameters
     * @param {boolean} [params.edge] whether to retrieve volume and open interest metrics for all chains, defaults to true
     * @returns {object} an [open interest structure]{@link https://docs.ccxt.com/?id=open-interest-structure}
     */
    fetchOpenInterest(symbol: string, params?: {}): Promise<import("./base/types.js").OpenInterest>;
    /**
     * @method
     * @name nado#fetchOpenInterests
     * @description retrieves the open interests of some currencies
     * @see https://docs.nado.xyz/developer-resources/api/v2/contracts
     * @param {string[]} [symbols] unified CCXT market symbols
     * @param {object} [params] exchange specific parameters
     * @param {boolean} [params.edge] whether to retrieve volume and open interest metrics for all chains, defaults to true
     * @returns {object} a dictionary of [open interest structures]{@link https://docs.ccxt.com/?id=open-interest-structure}
     */
    fetchOpenInterests(symbols?: Strings, params?: {}): Promise<import("./base/types.js").OpenInterests>;
    /**
     * @method
     * @name nado#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.nado.xyz/developer-resources/api/v2/orderbook
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
     */
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    /**
     * @method
     * @name nado#fetchTrades
     * @description get the list of the most recent trades for a particular symbol
     * @see https://docs.nado.xyz/developer-resources/api/v2/trades
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.max_trade_id] max trade id to include in the result for pagination
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name nado#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://docs.nado.xyz/developer-resources/api/archive-indexer/candlesticks
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
    parseTrade(trade: Dict, market?: Market): Trade;
    parseFundingRate(contract: any, market?: Market): FundingRate;
    parseFundingHistory(funding: Dict, market?: Market): {
        info: Dict;
        symbol: string;
        code: Str;
        timestamp: Int;
        datetime: string | undefined;
        id: Str;
        amount: number | undefined;
    };
    parseOpenInterest(interest: any, market?: Market): import("./base/types.js").OpenInterest;
    parseTicker(ticker: Dict, market?: Market): Ticker;
    parseCurrency(rawCurrency: Dict): Currency;
    parseBalance(response: any): Balances;
    parseTransaction(transaction: Dict, currency?: Currency): Transaction;
    parsePosition(position: Dict, market?: Market): Position;
    isArchiveOrderClosed(order: Dict): boolean;
    parseOrder(order: Dict, market?: Market): Order;
    parseOrderTimeInForce(timeInForce: Str): Str;
    convertToX18(value: Str): string | undefined;
    parseX18(value: any): number | undefined;
    createOrderNonce(recvWindow: any): string | undefined;
    createOrderAppendix(isTriggerOrder: any, params?: {}): Str;
    createSubaccount(walletAddress: Str, subaccount?: Str): string;
    queryContracts(params?: {}): Promise<import("./base/types.js").Dictionary<any>>;
    orderVerifyingContract(productId: Int): string;
    padHex(value: string, length: Int, left?: boolean): string;
    signOrder(order: any, productId: Int, chainId: any): string;
    signCancellation(cancellation: any, chainId: any, endpointAddress: string): string;
    signCancellationProducts(cancellation: any, chainId: any, endpointAddress: string): string;
    signFetchTriggerOrders(tx: any, chainId: any, endpointAddress: any): string;
    signHash(hash: string, privateKey: Str): string;
    removeMarketSuffix(marketId: any): any;
    sign(path: any, api?: any, method?: string, params?: {}, headers?: any, body?: any): {
        url: any;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(httpCode: Int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): undefined;
}
