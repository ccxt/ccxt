import Exchange from './abstract/mexc.js';
import type { TransferEntry, IndexType, Int, OrderSide, Balances, OrderType, OHLCV, FundingRateHistory, Position, OrderBook, OrderRequest, FundingHistory, Order, Str, Trade, Transaction, Ticker, Tickers, Strings, Market, Currency, Leverage, Num, Account, MarginModification, Currencies, Dict, LeverageTier, LeverageTiers, int, FundingRate, DepositAddress, TradingFeeInterface } from './base/types.js';
/**
 * @class mexc
 * @augments Exchange
 */
export default class mexc extends Exchange {
    describe(): any;
    /**
     * @method
     * @name mexc#fetchStatus
     * @description the latest known information on the availability of the exchange API
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#test-connectivity
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#get-the-server-time
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [status structure]{@link https://docs.ccxt.com/#/?id=exchange-status-structure}
     */
    fetchStatus(params?: {}): Promise<{
        status: any;
        updated: any;
        url: any;
        eta: any;
        info: any;
    }>;
    /**
     * @method
     * @name mexc#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#check-server-time
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#get-the-server-time
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    fetchTime(params?: {}): Promise<Int>;
    /**
     * @method
     * @name mexc#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#query-the-currency-information
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    fetchCurrencies(params?: {}): Promise<Currencies>;
    /**
     * @method
     * @name mexc#fetchMarkets
     * @description retrieves data on all markets for mexc
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#exchange-information
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#get-the-contract-information
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    fetchMarkets(params?: {}): Promise<Market[]>;
    /**
     * @ignore
     * @method
     * @name mexc#fetchMarkets
     * @description retrieves data on all spot markets for mexc
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#exchange-information
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    fetchSpotMarkets(params?: {}): Promise<any[]>;
    /**
     * @ignore
     * @method
     * @name mexc#fetchMarkets
     * @description retrieves data on all swap markets for mexc
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#get-the-contract-information
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    fetchSwapMarkets(params?: {}): Promise<any[]>;
    /**
     * @method
     * @name mexc#fetchOrderBook
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#order-book
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#get-the-contract-s-depth-information
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    parseBidAsk(bidask: any, priceKey?: IndexType, amountKey?: IndexType, countOrIdKey?: IndexType): number[];
    /**
     * @method
     * @name mexc#fetchTrades
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#recent-trades-list
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#compressed-aggregate-trades-list
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#get-contract-transaction-data
     * @description get the list of most recent trades for a particular symbol
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] *spot only* *since must be defined* the latest time in ms to fetch entries for
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseTrade(trade: Dict, market?: Market): Trade;
    syntheticTradeId(market?: any, timestamp?: any, side?: any, amount?: any, price?: any, orderType?: any, takerOrMaker?: any): string;
    /**
     * @method
     * @name mexc#fetchOHLCV
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#kline-candlestick-data
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#k-line-data
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest candle to fetch
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    /**
     * @method
     * @name mexc#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#24hr-ticker-price-change-statistics
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#get-contract-trend-data
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    /**
     * @method
     * @name mexc#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#24hr-ticker-price-change-statistics
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#get-contract-trend-data
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    parseTicker(ticker: Dict, market?: Market): Ticker;
    /**
     * @method
     * @name mexc#fetchBidsAsks
     * @description fetches the bid and ask price and volume for multiple markets
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#symbol-order-book-ticker
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the bids and asks for, all markets are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchBidsAsks(symbols?: Strings, params?: {}): Promise<Tickers>;
    /**
     * @method
     * @name mexc#createMarketBuyOrderWithCost
     * @description create a market buy order by providing the symbol and cost
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#new-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {float} cost how much you want to trade in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createMarketBuyOrderWithCost(symbol: string, cost: number, params?: {}): Promise<Order>;
    /**
     * @method
     * @name mexc#createMarketSellOrderWithCost
     * @description create a market sell order by providing the symbol and cost
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#new-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {float} cost how much you want to trade in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createMarketSellOrderWithCost(symbol: string, cost: number, params?: {}): Promise<Order>;
    /**
     * @method
     * @name mexc#createOrder
     * @description create a trade order
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#new-order
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#order-under-maintenance
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#trigger-order-under-maintenance
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] only 'isolated' is supported for spot-margin trading
     * @param {float} [params.triggerPrice] The price at which a trigger order is triggered at
     * @param {bool} [params.postOnly] if true, the order will only be posted if it will be a maker order
     * @param {bool} [params.reduceOnly] *contract only* indicates if this order is to reduce the size of a position
     * @param {bool} [params.hedged] *swap only* true for hedged mode, false for one way mode, default is false
     * @param {string} [params.timeInForce] 'IOC' or 'FOK', default is 'GTC'
     * EXCHANGE SPECIFIC PARAMETERS
     * @param {int} [params.leverage] *contract only* leverage is necessary on isolated margin
     * @param {long} [params.positionId] *contract only* it is recommended to fill in this parameter when closing a position
     * @param {string} [params.externalOid] *contract only* external order ID
     * @param {int} [params.positionMode] *contract only*  1:hedge, 2:one-way, default: the user's current config
     * @param {boolean} [params.test] *spot only* whether to use the test endpoint or not, default is false
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    createSpotOrderRequest(market: any, type: any, side: any, amount: any, price?: any, marginMode?: any, params?: {}): any;
    /**
     * @ignore
     * @method
     * @name mexc#createSpotOrder
     * @description create a trade order
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#new-order
     * @param {string} market unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {string} [marginMode] only 'isolated' is supported for spot-margin trading
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {bool} [params.postOnly] if true, the order will only be posted if it will be a maker order
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createSpotOrder(market: any, type: any, side: any, amount: any, price?: any, marginMode?: any, params?: {}): Promise<Order>;
    /**
     * @ignore
     * @method
     * @name mexc#createSwapOrder
     * @description create a trade order
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#new-order
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#order-under-maintenance
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#trigger-order-under-maintenance
     * @param {string} market unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {string} [marginMode] only 'isolated' is supported for spot-margin trading
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} [params.triggerPrice] The price at which a trigger order is triggered at
     * @param {bool} [params.postOnly] if true, the order will only be posted if it will be a maker order
     * @param {bool} [params.reduceOnly] indicates if this order is to reduce the size of a position
     * @param {bool} [params.hedged] *swap only* true for hedged mode, false for one way mode, default is false
     *
     * EXCHANGE SPECIFIC PARAMETERS
     * @param {int} [params.leverage] leverage is necessary on isolated margin
     * @param {long} [params.positionId] it is recommended to fill in this parameter when closing a position
     * @param {string} [params.externalOid] external order ID
     * @param {int} [params.positionMode] 1:hedge, 2:one-way, default: the user's current config
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createSwapOrder(market: any, type: any, side: any, amount: any, price?: any, marginMode?: any, params?: {}): Promise<Order>;
    /**
     * @method
     * @name mexc#createOrders
     * @description *spot only*  *all orders must have the same symbol* create a list of trade orders
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#batch-orders
     * @param {Array} orders list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
     * @param {object} [params] extra parameters specific to api endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createOrders(orders: OrderRequest[], params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name mexc#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#query-order
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#query-the-order-based-on-the-order-number
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] only 'isolated' is supported, for spot-margin trading
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name mexc#fetchOrders
     * @description fetches information on multiple orders made by the user
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#all-orders
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#get-all-of-the-user-39-s-historical-orders
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#gets-the-trigger-order-list
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch orders for
     * @param {string} [params.marginMode] only 'isolated' is supported, for spot-margin trading
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchOrdersByIds(ids: any, symbol?: Str, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name mexc#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#current-open-orders
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#get-all-of-the-user-39-s-historical-orders
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#gets-the-trigger-order-list
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of  open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] only 'isolated' is supported, for spot-margin trading
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name mexc#fetchClosedOrders
     * @description fetches information on multiple closed orders made by the user
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#all-orders
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#get-all-of-the-user-39-s-historical-orders
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#gets-the-trigger-order-list
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name mexc#fetchCanceledOrders
     * @description fetches information on multiple canceled orders made by the user
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#all-orders
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#get-all-of-the-user-39-s-historical-orders
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#gets-the-trigger-order-list
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] timestamp in ms of the earliest order, default is undefined
     * @param {int} [limit] max number of orders to return, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchCanceledOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchOrdersByState(state: any, symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name mexc#cancelOrder
     * @description cancels an open order
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#cancel-order
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#cancel-the-order-under-maintenance
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#cancel-the-stop-limit-trigger-order-under-maintenance
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] only 'isolated' is supported for spot-margin trading
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name mexc#cancelOrders
     * @description cancel multiple orders
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#cancel-the-order-under-maintenance
     * @param {string[]} ids order ids
     * @param {string} symbol unified market symbol, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrders(ids: any, symbol?: Str, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name mexc#cancelAllOrders
     * @description cancel all open orders
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#cancel-all-open-orders-on-a-symbol
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#cancel-all-orders-under-a-contract-under-maintenance
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#cancel-all-trigger-orders-under-maintenance
     * @param {string} symbol unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] only 'isolated' is supported for spot-margin trading
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelAllOrders(symbol?: Str, params?: {}): Promise<Order[]>;
    parseOrder(order: Dict, market?: Market): Order;
    parseOrderSide(status: any): string;
    parseOrderType(status: any): string;
    parseOrderStatus(status: Str): string;
    parseOrderTimeInForce(status: any): string;
    getTifFromRawOrderType(orderType?: Str): string;
    fetchAccountHelper(type: any, params: any): Promise<any>;
    /**
     * @method
     * @name mexc#fetchAccounts
     * @description fetch all the accounts associated with a profile
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#account-information
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#get-all-informations-of-user-39-s-asset
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [account structures]{@link https://docs.ccxt.com/#/?id=account-structure} indexed by the account type
     */
    fetchAccounts(params?: {}): Promise<Account[]>;
    /**
     * @method
     * @name mexc#fetchTradingFee
     * @description fetch the trading fees for a market
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#query-mx-deduct-status
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [fee structure]{@link https://docs.ccxt.com/#/?id=fee-structure}
     */
    fetchTradingFee(symbol: string, params?: {}): Promise<TradingFeeInterface>;
    customParseBalance(response: any, marketType: any): Balances;
    parseBalanceHelper(entry: any): import("./base/types.js").BalanceAccount;
    /**
     * @method
     * @name mexc#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#account-information
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#get-all-informations-of-user-39-s-asset
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#isolated-account
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.symbols] // required for margin, market id's separated by commas
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    fetchBalance(params?: {}): Promise<Balances>;
    /**
     * @method
     * @name mexc#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#account-trade-list
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#get-all-transaction-details-of-the-user-s-order
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch trades for
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name mexc#fetchOrderTrades
     * @description fetch all the trades made from a single order
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#account-trade-list
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#query-the-order-based-on-the-order-number
     * @param {string} id order id
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    fetchOrderTrades(id: string, symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    modifyMarginHelper(symbol: string, amount: any, addOrReduce: any, params?: {}): Promise<any>;
    /**
     * @method
     * @name mexc#reduceMargin
     * @description remove margin from a position
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#increase-or-decrease-margin
     * @param {string} symbol unified market symbol
     * @param {float} amount the amount of margin to remove
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [margin structure]{@link https://docs.ccxt.com/#/?id=reduce-margin-structure}
     */
    reduceMargin(symbol: string, amount: number, params?: {}): Promise<MarginModification>;
    /**
     * @method
     * @name mexc#addMargin
     * @description add margin
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#increase-or-decrease-margin
     * @param {string} symbol unified market symbol
     * @param {float} amount amount of margin to add
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [margin structure]{@link https://docs.ccxt.com/#/?id=add-margin-structure}
     */
    addMargin(symbol: string, amount: number, params?: {}): Promise<MarginModification>;
    /**
     * @method
     * @name mexc#setLeverage
     * @description set the level of leverage for a market
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#switch-leverage
     * @param {float} leverage the rate of leverage
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} response from the exchange
     */
    setLeverage(leverage: Int, symbol?: Str, params?: {}): Promise<any>;
    /**
     * @method
     * @name mexc#fetchFundingHistory
     * @description fetch the history of funding payments paid and received on this account
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#get-details-of-user-s-funding-rate
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch funding history for
     * @param {int} [limit] the maximum number of funding history structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding history structure]{@link https://docs.ccxt.com/#/?id=funding-history-structure}
     */
    fetchFundingHistory(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<FundingHistory[]>;
    parseFundingRate(contract: any, market?: Market): FundingRate;
    /**
     * @method
     * @name mexc#fetchFundingInterval
     * @description fetch the current funding rate interval
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#get-contract-funding-rate
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
     */
    fetchFundingInterval(symbol: string, params?: {}): Promise<FundingRate>;
    /**
     * @method
     * @name mexc#fetchFundingRate
     * @description fetch the current funding rate
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#get-contract-funding-rate
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
     */
    fetchFundingRate(symbol: string, params?: {}): Promise<FundingRate>;
    /**
     * @method
     * @name mexc#fetchFundingRateHistory
     * @description fetches historical funding rate prices
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#get-contract-funding-rate-history
     * @param {string} symbol unified symbol of the market to fetch the funding rate history for
     * @param {int} [since] not used by mexc, but filtered internally by ccxt
     * @param {int} [limit] mexc limit is page_size default 20, maximum is 100
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure}
     */
    fetchFundingRateHistory(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<FundingRateHistory[]>;
    /**
     * @method
     * @name mexc#fetchLeverageTiers
     * @description retrieve information on the maximum leverage, and maintenance margin for trades of varying trade sizes, if a market has a leverage tier of 0, then the leverage tiers cannot be obtained for this market
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#get-the-contract-information
     * @param {string[]} [symbols] list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [leverage tiers structures]{@link https://docs.ccxt.com/#/?id=leverage-tiers-structure}, indexed by market symbols
     */
    fetchLeverageTiers(symbols?: Strings, params?: {}): Promise<LeverageTiers>;
    parseMarketLeverageTiers(info: any, market?: Market): LeverageTier[];
    parseDepositAddress(depositAddress: any, currency?: Currency): DepositAddress;
    /**
     * @method
     * @name mexc#fetchDepositAddressesByNetwork
     * @description fetch a dictionary of addresses for a currency, indexed by network
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#deposit-address-supporting-network
     * @param {string} code unified currency code of the currency for the deposit address
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [address structures]{@link https://docs.ccxt.com/#/?id=address-structure} indexed by the network
     */
    fetchDepositAddressesByNetwork(code: string, params?: {}): Promise<DepositAddress[]>;
    /**
     * @method
     * @name mexc#createDepositAddress
     * @description create a currency deposit address
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#generate-deposit-address-supporting-network
     * @param {string} code unified currency code of the currency for the deposit address
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.network] the blockchain network name
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    createDepositAddress(code: string, params?: {}): Promise<DepositAddress>;
    /**
     * @method
     * @name mexc#fetchDepositAddress
     * @description fetch the deposit address for a currency associated with this account
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#deposit-address-supporting-network
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.network] the chain of currency, this only apply for multi-chain currency, and there is no need for single chain currency
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    fetchDepositAddress(code: string, params?: {}): Promise<DepositAddress>;
    /**
     * @method
     * @name mexc#fetchDeposits
     * @description fetch all deposits made to an account
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#deposit-history-supporting-network
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch deposits for
     * @param {int} [limit] the maximum number of deposits structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchDeposits(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    /**
     * @method
     * @name mexc#fetchWithdrawals
     * @description fetch all withdrawals made from an account
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#withdraw-history-supporting-network
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of withdrawals structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    parseTransaction(transaction: Dict, currency?: Currency): Transaction;
    parseTransactionStatusByType(status: any, type?: any): string;
    /**
     * @method
     * @name mexc#fetchPosition
     * @description fetch data on a single open contract trade position
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#get-the-user-s-history-position-information
     * @param {string} symbol unified market symbol of the market the position is held in, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    fetchPosition(symbol: string, params?: {}): Promise<Position>;
    /**
     * @method
     * @name mexc#fetchPositions
     * @description fetch all open positions
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#get-the-user-s-history-position-information
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    fetchPositions(symbols?: Strings, params?: {}): Promise<Position[]>;
    parsePosition(position: Dict, market?: Market): Position;
    /**
     * @method
     * @name mexc#fetchTransfer
     * @description fetches a transfer
     * @see https://mexcdevelop.github.io/apidocs/spot_v2_en/#internal-assets-transfer-order-inquiry
     * @param {string} id transfer id
     * @param {string} [code] not used by mexc fetchTransfer
     * @param {object} params extra parameters specific to the exchange api endpoint
     * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/#/?id=transfer-structure}
     */
    fetchTransfer(id: string, code?: Str, params?: {}): Promise<TransferEntry>;
    /**
     * @method
     * @name mexc#fetchTransfers
     * @description fetch a history of internal transfers made on an account
     * @see https://mexcdevelop.github.io/apidocs/spot_v2_en/#get-internal-assets-transfer-records
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#get-the-user-39-s-asset-transfer-records
     * @param {string} code unified currency code of the currency transferred
     * @param {int} [since] the earliest time in ms to fetch transfers for
     * @param {int} [limit] the maximum number of  transfers structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transfer structures]{@link https://docs.ccxt.com/#/?id=transfer-structure}
     */
    fetchTransfers(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<TransferEntry[]>;
    /**
     * @method
     * @name mexc#transfer
     * @description transfer currency internally between wallets on the same account
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#user-universal-transfer
     * @param {string} code unified currency code
     * @param {float} amount amount to transfer
     * @param {string} fromAccount account to transfer from
     * @param {string} toAccount account to transfer to
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.symbol] market symbol required for margin account transfers eg:BTCUSDT
     * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/#/?id=transfer-structure}
     */
    transfer(code: string, amount: number, fromAccount: string, toAccount: string, params?: {}): Promise<TransferEntry>;
    parseTransfer(transfer: Dict, currency?: Currency): TransferEntry;
    parseAccountId(status: any): string;
    parseTransferStatus(status: Str): Str;
    /**
     * @method
     * @name mexc#withdraw
     * @description make a withdrawal
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#withdraw-new
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} tag
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    withdraw(code: string, amount: number, address: string, tag?: any, params?: {}): Promise<Transaction>;
    /**
     * @method
     * @name mexc#setPositionMode
     * @description set hedged to true or false for a market
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#change-position-mode
     * @param {bool} hedged set to true to use dualSidePosition
     * @param {string} symbol not used by mexc setPositionMode ()
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} response from the exchange
     */
    setPositionMode(hedged: boolean, symbol?: Str, params?: {}): Promise<any>;
    /**
     * @method
     * @name mexc#fetchPositionMode
     * @description fetchs the position mode, hedged or one way, hedged for binance is set identically for all linear markets or all inverse markets
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#get-position-mode
     * @param {string} symbol not used by mexc fetchPositionMode
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an object detailing whether the market is in hedged or one-way mode
     */
    fetchPositionMode(symbol?: Str, params?: {}): Promise<{
        info: any;
        hedged: boolean;
    }>;
    /**
     * @method
     * @name mexc#fetchTransactionFees
     * @description fetch deposit and withdrawal fees
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#query-the-currency-information
     * @param {string[]|undefined} codes returns fees for all currencies if undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure}
     */
    fetchTransactionFees(codes?: Strings, params?: {}): Promise<{
        withdraw: Dict;
        deposit: {};
        info: any;
    }>;
    parseTransactionFees(response: any, codes?: any): {
        withdraw: Dict;
        deposit: {};
        info: any;
    };
    parseTransactionFee(transaction: any, currency?: Currency): Dict;
    /**
     * @method
     * @name mexc#fetchDepositWithdrawFees
     * @description fetch deposit and withdrawal fees
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#query-the-currency-information
     * @param {string[]|undefined} codes returns fees for all currencies if undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure}
     */
    fetchDepositWithdrawFees(codes?: Strings, params?: {}): Promise<any>;
    parseDepositWithdrawFee(fee: any, currency?: Currency): any;
    /**
     * @method
     * @name mexc#fetchLeverage
     * @description fetch the set leverage for a market
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#get-leverage
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [leverage structure]{@link https://docs.ccxt.com/#/?id=leverage-structure}
     */
    fetchLeverage(symbol: string, params?: {}): Promise<Leverage>;
    parseLeverage(leverage: Dict, market?: Market): Leverage;
    handleMarginModeAndParams(methodName: any, params?: {}, defaultValue?: any): any[];
    /**
     * @method
     * @name mexc#fetchPositionsHistory
     * @description fetches historical positions
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#get-the-user-s-history-position-information
     * @param {string[]} [symbols] unified contract symbols
     * @param {int} [since] not used by mexc fetchPositionsHistory
     * @param {int} [limit] the maximum amount of candles to fetch, default=1000
     * @param {object} [params] extra parameters specific to the exchange api endpoint
     *
     * EXCHANGE SPECIFIC PARAMETERS
     * @param {int} [params.type] position type，1: long, 2: short
     * @param {int} [params.page_num] current page number, default is 1
     * @returns {object[]} a list of [position structures]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    fetchPositionsHistory(symbols?: Strings, since?: Int, limit?: Int, params?: {}): Promise<Position[]>;
    /**
     * @method
     * @name mexc#setMarginMode
     * @description set margin mode to 'cross' or 'isolated'
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#switch-leverage
     * @param {string} marginMode 'cross' or 'isolated'
     * @param {string} [symbol] required when there is no position, else provide params["positionId"]
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.positionId] required when a position is set
     * @param {string} [params.direction] "long" or "short" required when there is no position
     * @returns {object} response from the exchange
     */
    setMarginMode(marginMode: string, symbol?: Str, params?: {}): Promise<Leverage>;
    nonce(): number;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: any;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(code: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): any;
}
