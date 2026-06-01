import Exchange from './abstract/pacifica.js';
import type { Market, TransferEntry, Balances, Int, OrderBook, OHLCV, Str, FundingRateHistory, Order, OrderType, OrderSide, Trade, Strings, Position, OrderRequest, Dict, Num, int, Transaction, Currency, TradingFeeInterface, LedgerEntry, FundingRates, FundingRate, OpenInterests, Leverage, MarginMode, Tickers, Ticker, FundingHistory } from './base/types.js';
/**
 * @class pacifica
 * @augments Exchange
 */
export default class pacifica extends Exchange {
    describe(): any;
    initializeClient(): Promise<boolean>;
    handleBuilderFeeApproval(): Promise<boolean>;
    /**
     * @method
     * @name pacifica#fetchMarkets
     * @description retrieves data on all markets for pacifica
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    fetchMarkets(params?: {}): Promise<Market[]>;
    /**
     * @method
     * @name pacifica#fetchSwapMarkets
     * @description retrieves data on all swap markets for pacifica
     * @see https://docs.pacifica.fi/api-documentation/api/rest-api/markets/get-market-info
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    fetchSwapMarkets(params?: {}): Promise<Market[]>;
    parseMarket(market: Dict): Market;
    /**
     * @method
     * @name pacifica#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://docs.pacifica.fi/api-documentation/api/rest-api/account/get-account-info
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.account] will default to walletAddress if not provided
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
     */
    fetchBalance(params?: {}): Promise<Balances>;
    /**
     * @method
     * @name pacifica#fetchLeverage
     * @description fetch the set leverage for a market
     * @param {string} symbol  unified symbol of the market
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.account] will default to walletAddress if not provided
     * @returns {object} a [leverage structure]{@link https://docs.ccxt.com/?id=leverage-structure}
     */
    fetchLeverage(symbol: string, params?: {}): Promise<Leverage>;
    parseLeverageFromSetting(symbol: Str, setting: Dict): Leverage;
    parseLeverageFromMarket(market: Market): Leverage;
    /**
     * @method
     * @name pacifica#fetchAccountSettings
     * @description fetch account's market settings. Settings are cached for walletAddress. To refresh the cache, call loadAccountSettings with refresh=true
     * @see https://docs.pacifica.fi/api-documentation/api/rest-api/account/get-account-settings
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.account] will default to walletAddress if not provided
     * @returns {object} Dict repacked from list by symbol key
     */
    fetchAccountSettings(params?: {}): Promise<Dict>;
    loadAccountSettings(refresh?: boolean, params?: {}): Promise<void>;
    parseAccountSettings(settings: any[]): Dict;
    /**
     * @method
     * @name pacifica#fetchMarginMode
     * @description fetches the margin mode of the trading pair
     * @param {string} symbol unified symbol of the market to fetch the margin mode for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.account] will default to walletAddress if not provided
     * @returns {object} a [margin mode structure]{@link https://docs.ccxt.com/?id=margin-mode-structure}
     */
    fetchMarginMode(symbol: string, params?: {}): Promise<MarginMode>;
    parseMarginModeFromSetting(symbol: Str, setting: Dict): MarginMode;
    /**
     * @method
     * @name pacifica#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.pacifica.fi/api-documentation/api/rest-api/markets/get-orderbook
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.aggLevel] aggregation level for price grouping. Defaults to 1. Can be 1, 10, 100, 1000, 10000
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure} indexed by market symbols
     */
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    /**
     * @method
     * @name pacifica#fetchFundingRates
     * @description retrieves data on all swap markets for pacifica
     * @param {string[]} [symbols] list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    fetchFundingRates(symbols?: Strings, params?: {}): Promise<FundingRates>;
    parseFundingRate(info: any, market?: Market): FundingRate;
    /**
     * @method
     * @name pacifica#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://docs.pacifica.fi/api-documentation/api/rest-api/markets/get-candle-data
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents, support '1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '8h', '12h', '1d'
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest candle to fetch. 'limit' is priority
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    /**
     * @method
     * @name pacifica#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://docs.pacifica.fi/api-documentation/api/rest-api/markets/get-recent-trades
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    fetchTrades(symbol: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name pacifica#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://docs.pacifica.fi/api-documentation/api/rest-api/account/get-trade-history
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest trade
     * @param {string} [params.account] will default to walletAddress if not provided
     * @param {string} [params.cursor] pagination cursor from prev request (manual use)
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseTrade(trade: Dict, market?: Market): Trade;
    /**
     * @method
     * @name pacifica#createOrder
     * @description create a trade order
     * @see https://docs.pacifica.fi/api-documentation/api/rest-api/orders/create-limit-order
     * @see https://docs.pacifica.fi/api-documentation/api/rest-api/orders/create-market-order
     * @see https://docs.pacifica.fi/api-documentation/api/rest-api/orders/create-stop-order
     * @see https://docs.pacifica.fi/api-documentation/api/rest-api/orders/create-position-tp-sl
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency. Not used for set tpsl order!
     * @param {float} [price] the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} [params.triggerPrice] The price a trigger order is triggered at
     * @param {float} [params.stopLossPrice] the price that a stop loss order is triggered at (optional provide stopLossCloid)
     * @param {float} [params.takeProfitPrice] the price that a take profit order is triggered at (optional provide takeProfitCloid)
     * @param {string} [params.timeInForce] "GTC", "IOC", or "PO" or "ALO" or "PO_TOB" (or "TOB" - PO by top of book)
     * @param {boolean} [params.reduceOnly] Ensures that the executed order does not flip the opened position.
     * @param {string} [params.clientOrderId] client order id, (optional uuid v4 e.g.: f47ac10b-58cc-4372-a567-0e02b2c3d479)
     * @param {int} [params.expiryWindow] time to live in milliseconds
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    createOrderRequest(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): any[];
    batchOrdersRequest(actions: any[]): {
        actions: any[];
    };
    createOrdersRequest(orders: OrderRequest[], params?: {}): {
        actions: any[];
    };
    /**
     * @method
     * @name pacifica#createOrders
     * @description create a list of trade orders. It is supports only limit orders and have a random jitter ~100-300ms!
     * @see https://docs.pacifica.fi/api-documentation/api/rest-api/orders/batch-order
     * @param {Array} orders list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type (optional or 'limit'), side, amount, price and params
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    createOrders(orders: OrderRequest[], params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name pacifica#cancelOrders
     * @description cancel multiple orders
     * @see https://docs.pacifica.fi/api-documentation/api/rest-api/orders/batch-order
     * @param {string[]} ids order ids. An ids list is always required (can be empty). Both ids and clientOrderIds can be passed simultaneously.
     * @param {string} [symbol] unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string|string[]} [params.clientOrderIds] client order ids, (optional uuid v4 e.g.: f47ac10b-58cc-4372-a567-0e02b2c3d479)
     * @param {int} [params.expiryWindow] time to live in milliseconds
     * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    cancelOrders(ids: string[], symbol?: Str, params?: {}): Promise<Order[]>;
    cancelOrdersRequest(ids: Str[], symbol?: Str, params?: {}): {
        actions: any[];
    };
    /**
     * @method
     * @name pacifica#cancelAllOrders
     * @description cancel all open orders in a market
     * @see https://docs.pacifica.fi/api-documentation/api/rest-api/orders/cancel-all-orders
     * @param {string} symbol (optional) unified market symbol of the market to cancel orders in.
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.excludeReduceOnly] whether to exclude reduce-only orders
     * @param {int} [params.expiryWindow] time to live in milliseconds
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    cancelAllOrders(symbol?: Str, params?: {}): Promise<Order[]>;
    cancelAllOrdersRequest(symbol: Str, params?: {}): Dict;
    /**
     * @method
     * @name pacifica#cancelOrder
     * @description cancels an open order
     * @see https://docs.pacifica.fi/api-documentation/api/rest-api/orders/cancel-stop-order#response
     * @see https://docs.pacifica.fi/api-documentation/api/rest-api/orders/cancel-order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.stop] necessary if this is to cancel a stop order.
     * @param {string} [params.clientOrderId] client order id, (optional uuid v4 e.g.: f47ac10b-58cc-4372-a567-0e02b2c3d479)
     * @param {int} [params.expiryWindow] time to live in milliseconds
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    cancelOrderRequest(id: Str, symbol?: Str, params?: {}): Dict;
    /**
     * @method
     * @name pacifica#editOrder
     * @description edit a trade order
     * @see https://docs.pacifica.fi/api-documentation/api/rest-api/orders/edit-order
     * @param {string} id edit order id
     * @param {string} symbol unified symbol of the market to edit an order in
     * @param {string} type 'market' or 'limit' WARN is not usable!
     * @param {string} side 'buy' or 'sell' WARN is not usable!
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} price the price at which the order is to be fulfilled, in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] client order id, (optional uuid v4 e.g.: f47ac10b-58cc-4372-a567-0e02b2c3d479)
     * @param {int} [params.expiryWindow] time to live in milliseconds
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    editOrder(id: string, symbol: string, type: OrderType, side: OrderSide, amount?: Num, price?: Num, params?: {}): Promise<Order>;
    editOrderRequest(id: string, symbol: string, type: string, side: string, amount: Num, price: Num, market: Market, params?: {}): Dict;
    /**
     * @method
     * @name pacifica#fetchFundingRateHistory
     * @description fetches historical funding rate prices
     * @see https://docs.pacifica.fi/api-documentation/api/rest-api/markets/get-historical-funding
     * @param {string} symbol unified symbol of the market to fetch the funding rate history for
     * @param {int} [since] timestamp in ms of the earliest funding rate to fetch
     * @param {int} [limit] the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure} to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.cursor] pagination cursor from prev request (manual use)
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure}
     */
    fetchFundingRateHistory(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<FundingRateHistory[]>;
    /**
     * @method
     * @name pacifica#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://docs.pacifica.fi/api-documentation/api/rest-api/markets/get-prices
     * @param {string[]} [symbols] unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    parseTicker(ticker: Dict, market?: Market): Ticker;
    /**
     * @method
     * @name pacifica#fetchClosedOrders
     * @description fetch all unfilled currently closed orders
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.account] will default to walletAddress if not provided
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name pacifica#fetchCanceledOrders
     * @description fetch all canceled orders
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.account] will default to walletAddress if not provided
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchCanceledOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name pacifica#fetchCanceledAndClosedOrders
     * @description fetch all closed and canceled orders
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.account] will default to walletAddress if not provided
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchCanceledAndClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name pacifica#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://docs.pacifica.fi/api-documentation/api/rest-api/orders/get-open-orders
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.account] will default to walletAddress if not provided
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name pacifica#fetchOrders
     * @description fetch all orders
     * @see https://docs.pacifica.fi/api-documentation/api/rest-api/orders/get-order-history
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.account] will default to walletAddress if not provided
     * @param {string} [params.cursor] pagination cursor from prev request (manual use)
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    addPaginationCursorToResult(response: any): any[];
    /**
     * @method
     * @name pacifica#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://docs.pacifica.fi/api-documentation/api/rest-api/orders/get-order-history-by-id
     * @param {string} id order id
     * @param {string} symbol (optional) unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    parseOrderStatus(status: Str): string;
    mapTimeInForce(tifRaw: Str): string;
    mapSide(sideRaw: string): string;
    parseOrderType(status: string): string;
    parseOrder(order: Dict, market?: Market): Order;
    /**
     * @method
     * @name pacifica#fetchPosition
     * @description fetch data on an open position
     * @see https://docs.pacifica.fi/api-documentation/api/rest-api/account/get-positions
     * @param {string} symbol unified market symbol of the market the position is held in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.account] will default to walletAddress if not provided
     * @returns {object} a [position structure]{@link https://docs.ccxt.com/?id=position-structure}
     */
    fetchPosition(symbol: string, params?: {}): Promise<Position>;
    /**
     * @method
     * @name pacifica#fetchPositions
     * @description fetch all open positions
     * @see https://docs.pacifica.fi/api-documentation/api/rest-api/account/get-positions
     * @param {string[]} [symbols] list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.account] will default to walletAddress if not provided
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/?id=position-structure}
     */
    fetchPositions(symbols?: Strings, params?: {}): Promise<Position[]>;
    parsePosition(position: Dict, market?: Market): Position;
    /**
     * @method
     * @name pacifica#setMarginMode
     * @description set margin mode (symbol)
     * @see https://docs.pacifica.fi/api-documentation/api/rest-api/account/update-margin-mode
     * @param {string} marginMode margin mode must be either [isolated, cross]
     * @param {string} symbol unified market symbol of the market the position is held in, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.expiryWindow] time to live in milliseconds
     * @returns {object} response from the exchange
     */
    setMarginMode(marginMode: string, symbol?: Str, params?: {}): Promise<any>;
    /**
     * @method
     * @name pacifica#setLeverage
     * @description set the level of leverage for a market
     * @see https://docs.pacifica.fi/api-documentation/api/rest-api/account/update-leverage
     * @param {float} leverage the rate of leverage
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.expiryWindow] time to live in milliseconds
     * @returns {object} response from the exchange
     */
    setLeverage(leverage: int, symbol?: Str, params?: {}): Promise<any>;
    /**
     * @method
     * @name pacifica#withdraw
     * @description make a withdrawal (only support native USDC)
     * @see https://docs.pacifica.fi/api-documentation/api/rest-api/account/request-withdrawal
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} tag
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.expiryWindow] time to live in milliseconds
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    withdraw(code: string, amount: number, address: string, tag?: Str, params?: {}): Promise<Transaction>;
    /**
     * @method
     * @name pacifica#fetchTradingFee
     * @description fetch the trading fees for a market
     * @see https://docs.pacifica.fi/api-documentation/api/rest-api/account/get-account-info
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.account] will default to walletAddress if not provided
     * @returns {object} a [fee structure]{@link https://docs.ccxt.com/?id=fee-structure}
     */
    fetchTradingFee(symbol: string, params?: {}): Promise<TradingFeeInterface>;
    parseTradingFee(fee: Dict, market?: Market): TradingFeeInterface;
    /**
     * @method
     * @name pacifica#fetchOpenInterests
     * @description Retrieves the open interest for a list of symbols
     * @param {string[]} [symbols] Unified CCXT market symbol
     * @param {object} [params] exchange specific parameters
     * @returns {object} an open interest structure{@link https://docs.ccxt.com/?id=open-interest-structure}
     */
    fetchOpenInterests(symbols?: Strings, params?: {}): Promise<OpenInterests>;
    /**
     * @method
     * @name pacifica#fetchOpenInterest
     * @description retrieves the open interest of a contract trading pair
     * @param {string} symbol unified CCXT market symbol
     * @param {object} [params] exchange specific parameters
     * @returns {object} an [open interest structure]{@link https://docs.ccxt.com/?id=open-interest-structure}
     */
    fetchOpenInterest(symbol: string, params?: {}): Promise<import("./base/types.js").OpenInterest>;
    parseOpenInterest(interest: any, market?: Market): import("./base/types.js").OpenInterest;
    /**
     * @method
     * @name pacifica#fetchLedger
     * @description fetch the history of changes, actions done by the user or operations that altered the balance of the user
     * @see https://docs.pacifica.fi/api-documentation/api/rest-api/account/get-account-balance-history
     * @param {string} [code] unified currency code
     * @param {int} [since] timestamp in ms of the earliest ledger entry
     * @param {int} [limit] max number of ledger entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.account] will default to walletAddress if not provided
     * @param {string} [params.cursor] pagination cursor from prev request (manual use)
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object} a [ledger structure]{@link https://docs.ccxt.com/?id=ledger-entry-structure}
     */
    fetchLedger(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<LedgerEntry[]>;
    parseLedgerEntry(item: Dict, currency?: Currency): LedgerEntry;
    parseLedgerEntryType(type: any): string;
    /**
     * @method
     * @name pacifica#fetchFundingHistory
     * @description fetch the history of funding payments paid and received on this account
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch funding history for
     * @param {int} [limit] the maximum number of funding history structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.account] will default to walletAddress if not provided
     * @param {string} [params.cursor] pagination cursor from prev request
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object} a [funding history structure]{@link https://docs.ccxt.com/?id=funding-history-structure}
     */
    fetchFundingHistory(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<FundingHistory[]>;
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
     * @name pacifica#transfer
     * @description transfer currency internally between wallets on the same account
     * @see https://docs.pacifica.fi/api-documentation/api/rest-api/subaccounts/subaccount-fund-transfer
     * @param {string} code unified currency code
     * @param {float} amount amount to transfer
     * @param {string} fromAccount account to transfer from *spot, swap*
     * @param {string} toAccount account to transfer to *swap, spot or address*
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.expiryWindow] time to live in milliseconds
     * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/?id=transfer-structure}
     */
    transfer(code: string, amount: number, fromAccount: string, toAccount: string, params?: {}): Promise<TransferEntry>;
    parseTransfer(transfer: Dict, currency?: Currency): TransferEntry;
    /**
     * @method
     * @name pacifica#createSubAccount
     * @description creates a sub-account under the main account
     * @param {string} name unused argument
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.expiryWindow] time to live in milliseconds
     * @param {string} [params.subAccountAddress] - The public key (address) of the sub-account to use for creation
     * @param {string} [params.subAccountPrivateKey] - The private key of the sub-account to use for creation
     * @returns {object} a response object
     */
    createSubAccount(name: string, params?: {}): Promise<any>;
    bindAgentWallet(agentAddress: string, params?: {}): Promise<any>;
    createApiKey(params?: {}): Promise<any>;
    revokeApiKey(apiKey: string, params?: {}): Promise<any>;
    fetchApiKeys(params?: {}): Promise<any>;
    approveBuilderCode(builderCode: string, maxFeeRate: string, params?: {}): Promise<any>;
    fetchBuilderApprovals(address: string): Promise<any>;
    revokeBuilderCode(builderCode: string, params?: {}): Promise<any>;
    handleOriginAndSingleAddress(methodName: string, params: Dict): any[];
    handleErrors(code: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): any;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    calculateRateLimiterCost(api: any, method: any, path: any, params: any, config?: {}): any;
    sortJsonKeys(value: any): any;
    prepareMessage(header: Dict, payload: Dict): string;
    signMessage(header: Dict, payload: Dict, privateKey: string): string;
    postActionRequest(operationType: Str, sigPayload: Dict, params: Dict): Dict;
}
