import Exchange from './abstract/krakenfutures.js';
import type { TransferEntry, Int, OrderSide, OrderType, OHLCV, Trade, FundingRateHistory, OrderRequest, Order, Balances, Str, Dict, Ticker, OrderBook, Tickers, Strings, Market, Currency, Leverage, Leverages, Num, LeverageTier, LeverageTiers, int, FundingRate, FundingRates, Position } from './base/types.js';
/**
 * @class krakenfutures
 * @augments Exchange
 */
export default class krakenfutures extends Exchange {
    describe(): any;
    /**
     * @method
     * @name krakenfutures#fetchMarkets
     * @description Fetches the available trading markets from the exchange, Multi-collateral markets are returned as linear markets, but can be settled in multiple currencies
     * @see https://docs.kraken.com/api/docs/futures-api/trading/get-instruments
     * @param {object} [params] exchange specific params
     * @returns An array of market structures
     */
    fetchMarkets(params?: {}): Promise<Market[]>;
    /**
     * @method
     * @name krakenfutures#fetchOrderBook
     * @see https://docs.kraken.com/api/docs/futures-api/trading/get-orderbook
     * @description Fetches a list of open orders in a market
     * @param {string} symbol Unified market symbol
     * @param {int} [limit] Not used by krakenfutures
     * @param {object} [params] exchange specific params
     * @returns An [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
     */
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    /**
     * @method
     * @name krakenfutures#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://docs.kraken.com/api/docs/futures-api/trading/get-tickers
     * @param {string[]} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an array of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    parseTicker(ticker: Dict, market?: Market): Ticker;
    /**
     * @method
     * @name krakenfutures#fetchOHLCV
     * @see https://docs.kraken.com/api/docs/futures-api/charts/candles
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    /**
     * @method
     * @name krakenfutures#fetchTrades
     * @see https://docs.kraken.com/api/docs/futures-api/trading/get-history
     * @see https://docs.kraken.com/api/docs/futures-api/history/get-public-execution-events
     * @description Fetch a history of filled trades that this account has made
     * @param {string} symbol Unified CCXT market symbol
     * @param {int} [since] Timestamp in ms of earliest trade. Not used by krakenfutures except in combination with params.until
     * @param {int} [limit] Total number of trades, cannot exceed 100
     * @param {object} [params] Exchange specific params
     * @param {int} [params.until] Timestamp in ms of latest trade
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @param {string} [params.method] The method to use to fetch trades. Can be 'historyGetMarketSymbolExecutions' or 'publicGetHistory' default is 'historyGetMarketSymbolExecutions'
     * @returns An array of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseTrade(trade: Dict, market?: Market): Trade;
    createOrderRequest(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): any;
    /**
     * @method
     * @name krakenfutures#createOrder
     * @description Create an order on the exchange
     * @see https://docs.kraken.com/api/docs/futures-api/trading/send-order
     * @param {string} symbol unified market symbol
     * @param {string} type 'limit' or 'market'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount number of contracts
     * @param {float} [price] limit order price
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {bool} [params.reduceOnly] set as true if you wish the order to only reduce an existing position, any order which increases an existing position will be rejected, default is false
     * @param {bool} [params.postOnly] set as true if you wish to make a postOnly order, default is false
     * @param {string} [params.clientOrderId] UUID The order identity that is specified from the user, It must be globally unique
     * @param {float} [params.triggerPrice] the price that a stop order is triggered at
     * @param {float} [params.stopLossPrice] the price that a stop loss order is triggered at
     * @param {float} [params.takeProfitPrice] the price that a take profit order is triggered at
     * @param {string} [params.triggerSignal] for triggerPrice, stopLossPrice and takeProfitPrice orders, the trigger price type, 'last', 'mark' or 'index', default is 'last'
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name krakenfutures#createOrders
     * @description create a list of trade orders
     * @see https://docs.kraken.com/api/docs/futures-api/trading/send-batch-order
     * @param {Array} orders list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    createOrders(orders: OrderRequest[], params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name krakenfutures#editOrder
     * @see https://docs.kraken.com/api/docs/futures-api/trading/edit-order-spring
     * @description Edit an open order on the exchange
     * @param {string} id order id
     * @param {string} symbol Not used by Krakenfutures
     * @param {string} type Not used by Krakenfutures
     * @param {string} side Not used by Krakenfutures
     * @param {float} amount Order size
     * @param {float} [price] Price to fill order at
     * @param {object} [params] Exchange specific params
     * @returns An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    editOrder(id: string, symbol: string, type: OrderType, side: OrderSide, amount?: Num, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name krakenfutures#cancelOrder
     * @see https://docs.kraken.com/api/docs/futures-api/trading/cancel-order
     * @description Cancel an open order on the exchange
     * @param {string} id Order id
     * @param {string} symbol Not used by Krakenfutures
     * @param {object} [params] Exchange specific params
     * @returns An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name krakenfutures#cancelOrders
     * @description cancel multiple orders
     * @see https://docs.kraken.com/api/docs/futures-api/trading/send-batch-order
     * @param {string[]} ids order ids
     * @param {string} [symbol] unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     *
     * EXCHANGE SPECIFIC PARAMETERS
     * @param {string[]} [params.clientOrderIds] max length 10 e.g. ["my_id_1","my_id_2"]
     * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    cancelOrders(ids: string[], symbol?: Str, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name krakenfutures#cancelAllOrders
     * @see https://docs.kraken.com/api/docs/futures-api/trading/cancel-all-orders
     * @description Cancels all orders on the exchange, including trigger orders
     * @param {str} symbol Unified market symbol
     * @param {dict} [params] Exchange specific params
     * @returns Response from exchange api
     */
    cancelAllOrders(symbol?: Str, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name krakenfutures#cancelAllOrdersAfter
     * @description dead man's switch, cancel all orders after the given timeout
     * @see https://docs.kraken.com/api/docs/futures-api/trading/cancel-all-orders-after
     * @param {number} timeout time in milliseconds, 0 represents cancel the timer
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} the api result
     */
    cancelAllOrdersAfter(timeout: Int, params?: {}): Promise<any>;
    /**
     * @method
     * @name krakenfutures#fetchOpenOrders
     * @see https://docs.kraken.com/api/docs/futures-api/trading/get-open-orders
     * @description Gets all open orders, including trigger orders, for an account from the exchange api
     * @param {string} symbol Unified market symbol
     * @param {int} [since] Timestamp (ms) of earliest order. (Not used by kraken api but filtered internally by CCXT)
     * @param {int} [limit] How many orders to return. (Not used by kraken api but filtered internally by CCXT)
     * @param {object} [params] Exchange specific parameters
     * @returns An array of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name krakenfutures#fetchOrders
     * @see https://docs.kraken.com/api/docs/futures-api/trading/get-order-status/
     * @description Gets all orders for an account from the exchange api
     * @param {string} symbol Unified market symbol
     * @param {int} [since] Timestamp (ms) of earliest order. (Not used by kraken api but filtered internally by CCXT)
     * @param {int} [limit] How many orders to return. (Not used by kraken api but filtered internally by CCXT)
     * @param {object} [params] Exchange specific parameters
     * @returns An array of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name krakenfutures#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://docs.kraken.com/api/docs/futures-api/trading/get-order-status/
     * @param {string} id the order id
     * @param {string} symbol unified market symbol that the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name krakenfutures#fetchClosedOrders
     * @see https://docs.futures.kraken.com/#http-api-history-account-history-get-order-events
     * @description Gets all closed orders, including trigger orders, for an account from the exchange api
     * @param {string} symbol Unified market symbol
     * @param {int} [since] Timestamp (ms) of earliest order.
     * @param {int} [limit] How many orders to return.
     * @param {object} [params] Exchange specific parameters
     * @param {bool} [params.trigger] set to true if you wish to fetch only trigger orders
     * @returns An array of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name krakenfutures#fetchCanceledOrders
     * @see https://docs.kraken.com/api/docs/futures-api/history/get-order-events
     * @description Gets all canceled orders, including trigger orders, for an account from the exchange api
     * @param {string} symbol Unified market symbol
     * @param {int} [since] Timestamp (ms) of earliest order.
     * @param {int} [limit] How many orders to return.
     * @param {object} [params] Exchange specific parameters
     * @param {bool} [params.trigger] set to true if you wish to fetch only trigger orders
     * @returns An array of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchCanceledOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    parseOrderType(orderType: any): string;
    verifyOrderActionSuccess(status: any, method: any, omit?: any[]): void;
    parseOrderStatus(status: Str): string;
    parseOrder(order: Dict, market?: Market): Order;
    /**
     * @method
     * @name krakenfutures#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://docs.kraken.com/api/docs/futures-api/trading/get-fills
     * @param {string} symbol unified market symbol
     * @param {int} [since] *not used by the  api* the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch entries for
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name krakenfutures#fetchBalance
     * @see https://docs.kraken.com/api/docs/futures-api/trading/get-accounts
     * @description Fetch the balance for a sub-account, all sub-account balances are inside 'info' in the response
     * @param {object} [params] Exchange specific parameters
     * @param {string} [params.type] The sub-account type to query the balance of, possible values include 'flex', 'cash'/'main'/'funding', or a market symbol * defaults to 'flex' *
     * @param {string} [params.symbol] A unified market symbol, when assigned the balance for a trading market that matches the symbol is returned
     * @returns A [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
     */
    fetchBalance(params?: {}): Promise<Balances>;
    parseBalance(response: any): Balances;
    /**
     * @method
     * @name krakenfutures#fetchFundingRates
     * @description fetch the current funding rates for multiple markets
     * @see https://docs.kraken.com/api/docs/futures-api/trading/get-tickers
     * @param {string[]} symbols unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} an array of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-structure}
     */
    fetchFundingRates(symbols?: Strings, params?: {}): Promise<FundingRates>;
    parseFundingRate(ticker: any, market?: Market): FundingRate;
    /**
     * @method
     * @name krakenfutures#fetchFundingRateHistory
     * @description fetches historical funding rate prices
     * @see https://docs.kraken.com/api/docs/futures-api/trading/historical-funding-rates
     * @param {string} symbol unified symbol of the market to fetch the funding rate history for
     * @param {int} [since] timestamp in ms of the earliest funding rate to fetch
     * @param {int} [limit] the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure} to fetch
     * @param {object} [params] extra parameters specific to the api endpoint
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure}
     */
    fetchFundingRateHistory(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<FundingRateHistory[]>;
    /**
     * @method
     * @name krakenfutures#fetchPositions
     * @see https://docs.kraken.com/api/docs/futures-api/trading/get-open-positions
     * @description Fetches current contract trading positions
     * @param {string[]} symbols List of unified symbols
     * @param {object} [params] Not used by krakenfutures
     * @returns Parsed exchange response for positions
     */
    fetchPositions(symbols?: Strings, params?: {}): Promise<Position[]>;
    parsePositions(response: any, symbols?: Strings, params?: {}): any[];
    parsePosition(position: Dict, market?: Market): {
        info: Dict;
        symbol: string;
        timestamp: number;
        datetime: string;
        initialMargin: any;
        initialMarginPercentage: any;
        maintenanceMargin: any;
        maintenanceMarginPercentage: any;
        entryPrice: number;
        notional: any;
        leverage: number;
        unrealizedPnl: any;
        contracts: number;
        contractSize: number;
        marginRatio: any;
        liquidationPrice: any;
        markPrice: any;
        collateral: any;
        marginType: string;
        side: string;
        percentage: any;
    };
    /**
     * @method
     * @name krakenfutures#fetchLeverageTiers
     * @description retrieve information on the maximum leverage, and maintenance margin for trades of varying trade sizes
     * @see https://docs.kraken.com/api/docs/futures-api/trading/get-instruments
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [leverage tiers structures]{@link https://docs.ccxt.com/?id=leverage-tiers-structure}, indexed by market symbols
     */
    fetchLeverageTiers(symbols?: Strings, params?: {}): Promise<LeverageTiers>;
    parseMarketLeverageTiers(info: any, market?: Market): LeverageTier[];
    parseTransfer(transfer: Dict, currency?: Currency): TransferEntry;
    parseAccount(account: any): any;
    /**
     * @method
     * @name krakenfutures#transferOut
     * @description transfer from futures wallet to spot wallet
     * @param {str} code Unified currency code
     * @param {float} amount Size of the transfer
     * @param {dict} [params] Exchange specific parameters
     * @returns a [transfer structure]{@link https://docs.ccxt.com/?id=transfer-structure}
     */
    transferOut(code: string, amount: any, params?: {}): Promise<TransferEntry>;
    /**
     * @method
     * @name krakenfutures#transfer
     * @see https://docs.kraken.com/api/docs/futures-api/trading/transfer
     * @see https://docs.kraken.com/api/docs/futures-api/trading/sub-account-transfer
     * @description transfers currencies between sub-accounts
     * @param {string} code Unified currency code
     * @param {float} amount Size of the transfer
     * @param {string} fromAccount 'main'/'funding'/'future', 'flex', or a unified market symbol
     * @param {string} toAccount 'main'/'funding', 'flex', 'spot' or a unified market symbol
     * @param {object} [params] Exchange specific parameters
     * @returns a [transfer structure]{@link https://docs.ccxt.com/?id=transfer-structure}
     */
    transfer(code: string, amount: number, fromAccount: string, toAccount: string, params?: {}): Promise<TransferEntry>;
    /**
     * @method
     * @name krakenfutures#setLeverage
     * @description set the level of leverage for a market
     * @see https://docs.kraken.com/api/docs/futures-api/trading/set-leverage-setting
     * @param {float} leverage the rate of leverage
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} response from the exchange
     */
    setLeverage(leverage: int, symbol?: Str, params?: {}): Promise<any>;
    /**
     * @method
     * @name krakenfutures#fetchLeverages
     * @description fetch the set leverage for all contract and margin markets
     * @see https://docs.kraken.com/api/docs/futures-api/trading/get-leverage-setting
     * @param {string[]} [symbols] a list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [leverage structures]{@link https://docs.ccxt.com/?id=leverage-structure}
     */
    fetchLeverages(symbols?: Strings, params?: {}): Promise<Leverages>;
    /**
     * @method
     * @name krakenfutures#fetchLeverage
     * @description fetch the set leverage for a market
     * @see https://docs.kraken.com/api/docs/futures-api/trading/get-leverage-setting
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [leverage structure]{@link https://docs.ccxt.com/?id=leverage-structure}
     */
    fetchLeverage(symbol: string, params?: {}): Promise<Leverage>;
    parseLeverage(leverage: Dict, market?: Market): Leverage;
    handleErrors(code: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): any;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
}
