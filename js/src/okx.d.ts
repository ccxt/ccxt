import Exchange from './abstract/okx.js';
import type { TransferEntry, Int, OrderSide, OrderType, Trade, OHLCV, Order, FundingRateHistory, OrderRequest, FundingHistory, Str, Transaction, Ticker, OrderBook, Balances, Tickers, Market, Greeks, Strings, MarketInterface, Currency, Leverage, Num, Account, OptionChain, Option, MarginModification, TradingFeeInterface, Currencies, Conversion, CancellationRequest, Dict, Position, CrossBorrowRate, CrossBorrowRates, LeverageTier, int, LedgerEntry, FundingRate, DepositAddress, LongShortRatio, BorrowInterest } from './base/types.js';
/**
 * @class okx
 * @augments Exchange
 */
export default class okx extends Exchange {
    describe(): any;
    handleMarketTypeAndParams(methodName: string, market?: Market, params?: {}, defaultValue?: any): any;
    convertToInstrumentType(type: any): string;
    createExpiredOptionMarket(symbol: string): MarketInterface;
    safeMarket(marketId?: Str, market?: Market, delimiter?: Str, marketType?: Str): MarketInterface;
    /**
     * @method
     * @name okx#fetchStatus
     * @description the latest known information on the availability of the exchange API
     * @see https://www.okx.com/docs-v5/en/#status-get-status
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [status structure]{@link https://docs.ccxt.com/#/?id=exchange-status-structure}
     */
    fetchStatus(params?: {}): Promise<Dict>;
    /**
     * @method
     * @name okx#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @see https://www.okx.com/docs-v5/en/#public-data-rest-api-get-system-time
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    fetchTime(params?: {}): Promise<number>;
    /**
     * @method
     * @name okx#fetchAccounts
     * @description fetch all the accounts associated with a profile
     * @see https://www.okx.com/docs-v5/en/#trading-account-rest-api-get-account-configuration
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [account structures]{@link https://docs.ccxt.com/#/?id=account-structure} indexed by the account type
     */
    fetchAccounts(params?: {}): Promise<Account[]>;
    nonce(): number;
    /**
     * @method
     * @name okx#fetchMarkets
     * @description retrieves data on all markets for okx
     * @see https://www.okx.com/docs-v5/en/#rest-api-public-data-get-instruments
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    fetchMarkets(params?: {}): Promise<Market[]>;
    parseMarket(market: Dict): Market;
    fetchMarketsByType(type: any, params?: {}): Promise<MarketInterface[]>;
    /**
     * @method
     * @name okx#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://www.okx.com/docs-v5/en/#rest-api-funding-get-currencies
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    fetchCurrencies(params?: {}): Promise<Currencies>;
    /**
     * @method
     * @name okx#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://www.okx.com/docs-v5/en/#order-book-trading-market-data-get-order-book
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.method] 'publicGetMarketBooksFull' or 'publicGetMarketBooks' default is 'publicGetMarketBooks'
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    parseTicker(ticker: Dict, market?: Market): Ticker;
    /**
     * @method
     * @name okx#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://www.okx.com/docs-v5/en/#order-book-trading-market-data-get-ticker
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    /**
     * @method
     * @name okx#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://www.okx.com/docs-v5/en/#order-book-trading-market-data-get-tickers
     * @param {string[]} [symbols] unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    /**
     * @method
     * @name okx#fetchMarkPrice
     * @description fetches mark price for the market
     * @see https://www.okx.com/docs-v5/en/#public-data-rest-api-get-mark-price
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchMarkPrice(symbol: string, params?: {}): Promise<Ticker>;
    /**
     * @method
     * @name okx#fetchMarkPrices
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://www.okx.com/docs-v5/en/#public-data-rest-api-get-mark-price
     * @param {string[]} [symbols] unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchMarkPrices(symbols?: Strings, params?: {}): Promise<Tickers>;
    parseTrade(trade: Dict, market?: Market): Trade;
    /**
     * @method
     * @name okx#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://www.okx.com/docs-v5/en/#rest-api-market-data-get-trades
     * @see https://www.okx.com/docs-v5/en/#rest-api-public-data-get-option-trades
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.method] 'publicGetMarketTrades' or 'publicGetMarketHistoryTrades' default is 'publicGetMarketTrades'
     * @param {boolean} [params.paginate] *only applies to publicGetMarketHistoryTrades* default false, when true will automatically paginate by calling this endpoint multiple times
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    /**
     * @method
     * @name okx#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://www.okx.com/docs-v5/en/#rest-api-market-data-get-candlesticks
     * @see https://www.okx.com/docs-v5/en/#rest-api-market-data-get-candlesticks-history
     * @see https://www.okx.com/docs-v5/en/#rest-api-market-data-get-mark-price-candlesticks
     * @see https://www.okx.com/docs-v5/en/#rest-api-market-data-get-mark-price-candlesticks-history
     * @see https://www.okx.com/docs-v5/en/#rest-api-market-data-get-index-candlesticks
     * @see https://www.okx.com/docs-v5/en/#rest-api-market-data-get-index-candlesticks-history
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.price] "mark" or "index" for mark price and index price candles
     * @param {int} [params.until] timestamp in ms of the latest candle to fetch
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    /**
     * @method
     * @name okx#fetchFundingRateHistory
     * @description fetches historical funding rate prices
     * @see https://www.okx.com/docs-v5/en/#public-data-rest-api-get-funding-rate-history
     * @param {string} symbol unified symbol of the market to fetch the funding rate history for
     * @param {int} [since] timestamp in ms of the earliest funding rate to fetch
     * @param {int} [limit] the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure} to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure}
     */
    fetchFundingRateHistory(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<FundingRateHistory[]>;
    parseBalanceByType(type: any, response: any): Balances;
    parseTradingBalance(response: any): Balances;
    parseFundingBalance(response: any): Balances;
    parseTradingFee(fee: Dict, market?: Market): TradingFeeInterface;
    /**
     * @method
     * @name okx#fetchTradingFee
     * @description fetch the trading fees for a market
     * @see https://www.okx.com/docs-v5/en/#trading-account-rest-api-get-fee-rates
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [fee structure]{@link https://docs.ccxt.com/#/?id=fee-structure}
     */
    fetchTradingFee(symbol: string, params?: {}): Promise<TradingFeeInterface>;
    /**
     * @method
     * @name okx#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://www.okx.com/docs-v5/en/#funding-account-rest-api-get-balance
     * @see https://www.okx.com/docs-v5/en/#trading-account-rest-api-get-balance
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] wallet type, ['funding' or 'trading'] default is 'trading'
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    fetchBalance(params?: {}): Promise<Balances>;
    /**
     * @method
     * @name okx#createMarketBuyOrderWithCost
     * @see https://www.okx.com/docs-v5/en/#order-book-trading-trade-post-place-order
     * @description create a market buy order by providing the symbol and cost
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {float} cost how much you want to trade in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createMarketBuyOrderWithCost(symbol: string, cost: number, params?: {}): Promise<Order>;
    /**
     * @method
     * @name okx#createMarketSellOrderWithCost
     * @see https://www.okx.com/docs-v5/en/#order-book-trading-trade-post-place-order
     * @description create a market buy order by providing the symbol and cost
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {float} cost how much you want to trade in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createMarketSellOrderWithCost(symbol: string, cost: number, params?: {}): Promise<Order>;
    createOrderRequest(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): any;
    /**
     * @method
     * @name okx#createOrder
     * @description create a trade order
     * @see https://www.okx.com/docs-v5/en/#order-book-trading-trade-post-place-order
     * @see https://www.okx.com/docs-v5/en/#order-book-trading-trade-post-place-multiple-orders
     * @see https://www.okx.com/docs-v5/en/#order-book-trading-algo-trading-post-place-algo-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {bool} [params.reduceOnly] a mark to reduce the position size for margin, swap and future orders
     * @param {bool} [params.postOnly] true to place a post only order
     * @param {object} [params.takeProfit] *takeProfit object in params* containing the triggerPrice at which the attached take profit order will be triggered (perpetual swap markets only)
     * @param {float} [params.takeProfit.triggerPrice] take profit trigger price
     * @param {float} [params.takeProfit.price] used for take profit limit orders, not used for take profit market price orders
     * @param {string} [params.takeProfit.type] 'market' or 'limit' used to specify the take profit price type
     * @param {object} [params.stopLoss] *stopLoss object in params* containing the triggerPrice at which the attached stop loss order will be triggered (perpetual swap markets only)
     * @param {float} [params.stopLoss.triggerPrice] stop loss trigger price
     * @param {float} [params.stopLoss.price] used for stop loss limit orders, not used for stop loss market price orders
     * @param {string} [params.stopLoss.type] 'market' or 'limit' used to specify the stop loss price type
     * @param {string} [params.positionSide] if position mode is one-way: set to 'net', if position mode is hedge-mode: set to 'long' or 'short'
     * @param {string} [params.trailingPercent] the percent to trail away from the current market price
     * @param {string} [params.tpOrdKind] 'condition' or 'limit', the default is 'condition'
     * @param {bool} [params.hedged] *swap and future only* true for hedged mode, false for one way mode
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name okx#createOrders
     * @description create a list of trade orders
     * @see https://www.okx.com/docs-v5/en/#order-book-trading-trade-post-place-multiple-orders
     * @param {Array} orders list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createOrders(orders: OrderRequest[], params?: {}): Promise<Order[]>;
    editOrderRequest(id: string, symbol: any, type: any, side: any, amount?: any, price?: any, params?: {}): any;
    /**
     * @method
     * @name okx#editOrder
     * @description edit a trade order
     * @see https://www.okx.com/docs-v5/en/#order-book-trading-trade-post-amend-order
     * @see https://www.okx.com/docs-v5/en/#order-book-trading-algo-trading-post-amend-algo-order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of the currency you want to trade in units of the base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] client order id, uses id if not passed
     * @param {float} [params.stopLossPrice] stop loss trigger price
     * @param {float} [params.newSlOrdPx] the stop loss order price, set to stopLossPrice if the type is market
     * @param {string} [params.newSlTriggerPxType] 'last', 'index' or 'mark' used to specify the stop loss trigger price type, default is 'last'
     * @param {float} [params.takeProfitPrice] take profit trigger price
     * @param {float} [params.newTpOrdPx] the take profit order price, set to takeProfitPrice if the type is market
     * @param {string} [params.newTpTriggerPxType] 'last', 'index' or 'mark' used to specify the take profit trigger price type, default is 'last'
     * @param {object} [params.stopLoss] *stopLoss object in params* containing the triggerPrice at which the attached stop loss order will be triggered
     * @param {float} [params.stopLoss.triggerPrice] stop loss trigger price
     * @param {float} [params.stopLoss.price] used for stop loss limit orders, not used for stop loss market price orders
     * @param {string} [params.stopLoss.type] 'market' or 'limit' used to specify the stop loss price type
     * @param {object} [params.takeProfit] *takeProfit object in params* containing the triggerPrice at which the attached take profit order will be triggered
     * @param {float} [params.takeProfit.triggerPrice] take profit trigger price
     * @param {float} [params.takeProfit.price] used for take profit limit orders, not used for take profit market price orders
     * @param {string} [params.takeProfit.type] 'market' or 'limit' used to specify the take profit price type
     * @param {string} [params.newTpOrdKind] 'condition' or 'limit', the default is 'condition'
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    editOrder(id: string, symbol: string, type: OrderType, side: OrderSide, amount?: Num, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name okx#cancelOrder
     * @description cancels an open order
     * @see https://www.okx.com/docs-v5/en/#order-book-trading-trade-post-cancel-order
     * @see https://www.okx.com/docs-v5/en/#order-book-trading-algo-trading-post-cancel-algo-order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.trigger] true if trigger orders
     * @param {boolean} [params.trailing] set to true if you want to cancel a trailing order
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<any>;
    parseIds(ids: any): any;
    /**
     * @method
     * @name okx#cancelOrders
     * @description cancel multiple orders
     * @see https://www.okx.com/docs-v5/en/#order-book-trading-trade-post-cancel-multiple-orders
     * @see https://www.okx.com/docs-v5/en/#order-book-trading-algo-trading-post-cancel-algo-order
     * @param {string[]} ids order ids
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.trigger] whether the order is a stop/trigger order
     * @param {boolean} [params.trailing] set to true if you want to cancel trailing orders
     * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrders(ids: any, symbol?: Str, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name okx#cancelOrdersForSymbols
     * @description cancel multiple orders for multiple symbols
     * @see https://www.okx.com/docs-v5/en/#order-book-trading-trade-post-cancel-multiple-orders
     * @see https://www.okx.com/docs-v5/en/#order-book-trading-algo-trading-post-cancel-algo-order
     * @param {CancellationRequest[]} orders each order should contain the parameters required by cancelOrder namely id and symbol, example [{"id": "a", "symbol": "BTC/USDT"}, {"id": "b", "symbol": "ETH/USDT"}]
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.trigger] whether the order is a stop/trigger order
     * @param {boolean} [params.trailing] set to true if you want to cancel trailing orders
     * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrdersForSymbols(orders: CancellationRequest[], params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name okx#cancelAllOrdersAfter
     * @description dead man's switch, cancel all orders after the given timeout
     * @see https://www.okx.com/docs-v5/en/#order-book-trading-trade-post-cancel-all-after
     * @param {number} timeout time in milliseconds, 0 represents cancel the timer
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} the api result
     */
    cancelAllOrdersAfter(timeout: Int, params?: {}): Promise<any>;
    parseOrderStatus(status: Str): string;
    parseOrder(order: Dict, market?: Market): Order;
    /**
     * @method
     * @name okx#fetchOrder
     * @description fetch an order by the id
     * @see https://www.okx.com/docs-v5/en/#order-book-trading-trade-get-order-details
     * @see https://www.okx.com/docs-v5/en/#order-book-trading-algo-trading-get-algo-order-details
     * @param {string} id the order id
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra and exchange specific parameters
     * @param {boolean} [params.trigger] true if fetching trigger orders
     * @returns [an order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name okx#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://www.okx.com/docs-v5/en/#order-book-trading-trade-get-order-list
     * @see https://www.okx.com/docs-v5/en/#order-book-trading-algo-trading-get-algo-order-list
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of  open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {bool} [params.trigger] True if fetching trigger or conditional orders
     * @param {string} [params.ordType] "conditional", "oco", "trigger", "move_order_stop", "iceberg", or "twap"
     * @param {string} [params.algoId] Algo ID "'433845797218942976'"
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @param {boolean} [params.trailing] set to true if you want to fetch trailing orders
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name okx#fetchCanceledOrders
     * @description fetches information on multiple canceled orders made by the user
     * @see https://www.okx.com/docs-v5/en/#order-book-trading-trade-get-order-history-last-7-days
     * @see https://www.okx.com/docs-v5/en/#order-book-trading-algo-trading-get-algo-order-history
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] timestamp in ms of the earliest order, default is undefined
     * @param {int} [limit] max number of orders to return, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {bool} [params.trigger] True if fetching trigger or conditional orders
     * @param {string} [params.ordType] "conditional", "oco", "trigger", "move_order_stop", "iceberg", or "twap"
     * @param {string} [params.algoId] Algo ID "'433845797218942976'"
     * @param {int} [params.until] timestamp in ms to fetch orders for
     * @param {boolean} [params.trailing] set to true if you want to fetch trailing orders
     * @returns {object} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchCanceledOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name okx#fetchClosedOrders
     * @description fetches information on multiple closed orders made by the user
     * @see https://www.okx.com/docs-v5/en/#order-book-trading-trade-get-order-history-last-7-days
     * @see https://www.okx.com/docs-v5/en/#order-book-trading-algo-trading-get-algo-order-history
     * @see https://www.okx.com/docs-v5/en/#order-book-trading-trade-get-order-history-last-3-months
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {bool} [params.trigger] True if fetching trigger or conditional orders
     * @param {string} [params.ordType] "conditional", "oco", "trigger", "move_order_stop", "iceberg", or "twap"
     * @param {string} [params.algoId] Algo ID "'433845797218942976'"
     * @param {int} [params.until] timestamp in ms to fetch orders for
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @param {string} [params.method] method to be used, either 'privateGetTradeOrdersHistory', 'privateGetTradeOrdersHistoryArchive' or 'privateGetTradeOrdersAlgoHistory' default is 'privateGetTradeOrdersHistory'
     * @param {boolean} [params.trailing] set to true if you want to fetch trailing orders
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name okx#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://www.okx.com/docs-v5/en/#order-book-trading-trade-get-transaction-details-last-3-months
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] Timestamp in ms of the latest time to retrieve trades for
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name okx#fetchOrderTrades
     * @description fetch all the trades made from a single order
     * @see https://www.okx.com/docs-v5/en/#order-book-trading-trade-get-transaction-details-last-3-months
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
     * @name okx#fetchLedger
     * @description fetch the history of changes, actions done by the user or operations that altered balance of the user
     * @see https://www.okx.com/docs-v5/en/#rest-api-account-get-bills-details-last-7-days
     * @see https://www.okx.com/docs-v5/en/#rest-api-account-get-bills-details-last-3-months
     * @see https://www.okx.com/docs-v5/en/#rest-api-funding-asset-bills-details
     * @param {string} [code] unified currency code, default is undefined
     * @param {int} [since] timestamp in ms of the earliest ledger entry, default is undefined
     * @param {int} [limit] max number of ledger entries to return, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] 'cross' or 'isolated'
     * @param {int} [params.until] the latest time in ms to fetch entries for
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object} a [ledger structure]{@link https://docs.ccxt.com/#/?id=ledger}
     */
    fetchLedger(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<LedgerEntry[]>;
    parseLedgerEntryType(type: any): string;
    parseLedgerEntry(item: Dict, currency?: Currency): LedgerEntry;
    parseDepositAddress(depositAddress: any, currency?: Currency): DepositAddress;
    /**
     * @method
     * @name okx#fetchDepositAddressesByNetwork
     * @description fetch a dictionary of addresses for a currency, indexed by network
     * @see https://www.okx.com/docs-v5/en/#funding-account-rest-api-get-deposit-address
     * @param {string} code unified currency code of the currency for the deposit address
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [address structures]{@link https://docs.ccxt.com/#/?id=address-structure} indexed by the network
     */
    fetchDepositAddressesByNetwork(code: string, params?: {}): Promise<DepositAddress[]>;
    /**
     * @method
     * @name okx#fetchDepositAddress
     * @description fetch the deposit address for a currency associated with this account
     * @see https://www.okx.com/docs-v5/en/#funding-account-rest-api-get-deposit-address
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.network] the network name for the deposit address
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    fetchDepositAddress(code: string, params?: {}): Promise<DepositAddress>;
    /**
     * @method
     * @name okx#withdraw
     * @description make a withdrawal
     * @see https://www.okx.com/docs-v5/en/#funding-account-rest-api-withdrawal
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
     * @name okx#fetchDeposits
     * @description fetch all deposits made to an account
     * @see https://www.okx.com/docs-v5/en/#rest-api-funding-get-deposit-history
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch deposits for
     * @param {int} [limit] the maximum number of deposits structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch entries for
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchDeposits(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    /**
     * @method
     * @name okx#fetchDeposit
     * @description fetch data on a currency deposit via the deposit id
     * @see https://www.okx.com/docs-v5/en/#rest-api-funding-get-deposit-history
     * @param {string} id deposit id
     * @param {string} code filter by currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchDeposit(id: string, code?: Str, params?: {}): Promise<Transaction>;
    /**
     * @method
     * @name okx#fetchWithdrawals
     * @description fetch all withdrawals made from an account
     * @see https://www.okx.com/docs-v5/en/#rest-api-funding-get-withdrawal-history
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of withdrawals structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch entries for
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    /**
     * @method
     * @name okx#fetchWithdrawal
     * @description fetch data on a currency withdrawal via the withdrawal id
     * @see https://www.okx.com/docs-v5/en/#rest-api-funding-get-withdrawal-history
     * @param {string} id withdrawal id
     * @param {string} code unified currency code of the currency withdrawn, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchWithdrawal(id: string, code?: Str, params?: {}): Promise<Transaction>;
    parseTransactionStatus(status: Str): string;
    parseTransaction(transaction: Dict, currency?: Currency): Transaction;
    /**
     * @method
     * @name okx#fetchLeverage
     * @description fetch the set leverage for a market
     * @see https://www.okx.com/docs-v5/en/#rest-api-account-get-leverage
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] 'cross' or 'isolated'
     * @returns {object} a [leverage structure]{@link https://docs.ccxt.com/#/?id=leverage-structure}
     */
    fetchLeverage(symbol: string, params?: {}): Promise<Leverage>;
    parseLeverage(leverage: Dict, market?: Market): Leverage;
    /**
     * @method
     * @name okx#fetchPosition
     * @description fetch data on a single open contract trade position
     * @see https://www.okx.com/docs-v5/en/#rest-api-account-get-positions
     * @param {string} symbol unified market symbol of the market the position is held in, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.instType] MARGIN, SWAP, FUTURES, OPTION
     * @returns {object} a [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    fetchPosition(symbol: string, params?: {}): Promise<Position>;
    /**
     * @method
     * @name okx#fetchPositions
     * @see https://www.okx.com/docs-v5/en/#rest-api-account-get-positions
     * @see https://www.okx.com/docs-v5/en/#trading-account-rest-api-get-positions-history history
     * @description fetch all open positions
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.instType] MARGIN, SWAP, FUTURES, OPTION
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    fetchPositions(symbols?: Strings, params?: {}): Promise<Position[]>;
    /**
     * @method
     * @name okx#fetchPositions
     * @see https://www.okx.com/docs-v5/en/#rest-api-account-get-positions
     * @description fetch all open positions for specific symbol
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.instType] MARGIN (if needed)
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    fetchPositionsForSymbol(symbol: string, params?: {}): Promise<Position[]>;
    parsePosition(position: Dict, market?: Market): Position;
    /**
     * @method
     * @name okx#transfer
     * @description transfer currency internally between wallets on the same account
     * @see https://www.okx.com/docs-v5/en/#rest-api-funding-funds-transfer
     * @param {string} code unified currency code
     * @param {float} amount amount to transfer
     * @param {string} fromAccount account to transfer from
     * @param {string} toAccount account to transfer to
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/#/?id=transfer-structure}
     */
    transfer(code: string, amount: number, fromAccount: string, toAccount: string, params?: {}): Promise<TransferEntry>;
    parseTransfer(transfer: Dict, currency?: Currency): TransferEntry;
    parseTransferStatus(status: Str): Str;
    fetchTransfer(id: string, code?: Str, params?: {}): Promise<TransferEntry>;
    /**
     * @method
     * @name okx#fetchTransfers
     * @description fetch a history of internal transfers made on an account
     * @see https://www.okx.com/docs-v5/en/#trading-account-rest-api-get-bills-details-last-3-months
     * @param {string} code unified currency code of the currency transferred
     * @param {int} [since] the earliest time in ms to fetch transfers for
     * @param {int} [limit] the maximum number of transfers structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transfer structures]{@link https://docs.ccxt.com/#/?id=transfer-structure}
     */
    fetchTransfers(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<TransferEntry[]>;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    parseFundingRate(contract: any, market?: Market): FundingRate;
    parseFundingInterval(interval: any): string;
    /**
     * @method
     * @name okx#fetchFundingInterval
     * @description fetch the current funding rate interval
     * @see https://www.okx.com/docs-v5/en/#public-data-rest-api-get-funding-rate
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
     */
    fetchFundingInterval(symbol: string, params?: {}): Promise<FundingRate>;
    /**
     * @method
     * @name okx#fetchFundingRate
     * @description fetch the current funding rate
     * @see https://www.okx.com/docs-v5/en/#public-data-rest-api-get-funding-rate
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
     */
    fetchFundingRate(symbol: string, params?: {}): Promise<FundingRate>;
    /**
     * @method
     * @name okx#fetchFundingHistory
     * @description fetch the history of funding payments paid and received on this account
     * @see https://www.okx.com/docs-v5/en/#trading-account-rest-api-get-bills-details-last-3-months
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch funding history for
     * @param {int} [limit] the maximum number of funding history structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding history structure]{@link https://docs.ccxt.com/#/?id=funding-history-structure}
     */
    fetchFundingHistory(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<FundingHistory[]>;
    /**
     * @method
     * @name okx#setLeverage
     * @description set the level of leverage for a market
     * @see https://www.okx.com/docs-v5/en/#rest-api-account-set-leverage
     * @param {float} leverage the rate of leverage
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] 'cross' or 'isolated'
     * @param {string} [params.posSide] 'long' or 'short' or 'net' for isolated margin long/short mode on futures and swap markets, default is 'net'
     * @returns {object} response from the exchange
     */
    setLeverage(leverage: Int, symbol?: Str, params?: {}): Promise<any>;
    /**
     * @method
     * @name okx#fetchPositionMode
     * @see https://www.okx.com/docs-v5/en/#trading-account-rest-api-get-account-configuration
     * @description fetchs the position mode, hedged or one way, hedged for binance is set identically for all linear markets or all inverse markets
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.accountId] if you have multiple accounts, you must specify the account id to fetch the position mode
     * @returns {object} an object detailing whether the market is in hedged or one-way mode
     */
    fetchPositionMode(symbol?: Str, params?: {}): Promise<{
        info: any;
        hedged: boolean;
    }>;
    /**
     * @method
     * @name okx#setPositionMode
     * @description set hedged to true or false for a market
     * @see https://www.okx.com/docs-v5/en/#trading-account-rest-api-set-position-mode
     * @param {bool} hedged set to true to use long_short_mode, false for net_mode
     * @param {string} symbol not used by okx setPositionMode
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} response from the exchange
     */
    setPositionMode(hedged: boolean, symbol?: Str, params?: {}): Promise<any>;
    /**
     * @method
     * @name okx#setMarginMode
     * @description set margin mode to 'cross' or 'isolated'
     * @see https://www.okx.com/docs-v5/en/#trading-account-rest-api-set-leverage
     * @param {string} marginMode 'cross' or 'isolated'
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.leverage] leverage
     * @returns {object} response from the exchange
     */
    setMarginMode(marginMode: string, symbol?: Str, params?: {}): Promise<any>;
    /**
     * @method
     * @name okx#fetchCrossBorrowRates
     * @description fetch the borrow interest rates of all currencies
     * @see https://www.okx.com/docs-v5/en/#trading-account-rest-api-get-interest-rate
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [borrow rate structures]{@link https://docs.ccxt.com/#/?id=borrow-rate-structure}
     */
    fetchCrossBorrowRates(params?: {}): Promise<CrossBorrowRates>;
    /**
     * @method
     * @name okx#fetchCrossBorrowRate
     * @description fetch the rate of interest to borrow a currency for margin trading
     * @see https://www.okx.com/docs-v5/en/#trading-account-rest-api-get-interest-rate
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [borrow rate structure]{@link https://docs.ccxt.com/#/?id=borrow-rate-structure}
     */
    fetchCrossBorrowRate(code: string, params?: {}): Promise<CrossBorrowRate>;
    parseBorrowRate(info: any, currency?: Currency): {
        currency: string;
        rate: number;
        period: number;
        timestamp: number;
        datetime: string;
        info: any;
    };
    parseBorrowRateHistories(response: any, codes: any, since: any, limit: any): Dict;
    /**
     * @method
     * @name okx#fetchBorrowRateHistories
     * @description retrieves a history of a multiple currencies borrow interest rate at specific time slots, returns all currencies if no symbols passed, default is undefined
     * @see https://www.okx.com/docs-v5/en/#financial-product-savings-get-public-borrow-history-public
     * @param {string[]|undefined} codes list of unified currency codes, default is undefined
     * @param {int} [since] timestamp in ms of the earliest borrowRate, default is undefined
     * @param {int} [limit] max number of borrow rate prices to return, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [borrow rate structures]{@link https://docs.ccxt.com/#/?id=borrow-rate-structure} indexed by the market symbol
     */
    fetchBorrowRateHistories(codes?: any, since?: Int, limit?: Int, params?: {}): Promise<Dict>;
    /**
     * @method
     * @name okx#fetchBorrowRateHistory
     * @description retrieves a history of a currencies borrow interest rate at specific time slots
     * @see https://www.okx.com/docs-v5/en/#financial-product-savings-get-public-borrow-history-public
     * @param {string} code unified currency code
     * @param {int} [since] timestamp for the earliest borrow rate
     * @param {int} [limit] the maximum number of [borrow rate structures]{@link https://docs.ccxt.com/#/?id=borrow-rate-structure} to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of [borrow rate structures]{@link https://docs.ccxt.com/#/?id=borrow-rate-structure}
     */
    fetchBorrowRateHistory(code: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    modifyMarginHelper(symbol: string, amount: any, type: any, params?: {}): Promise<MarginModification>;
    parseMarginModification(data: Dict, market?: Market): MarginModification;
    /**
     * @method
     * @name okx#reduceMargin
     * @description remove margin from a position
     * @see https://www.okx.com/docs-v5/en/#trading-account-rest-api-increase-decrease-margin
     * @param {string} symbol unified market symbol
     * @param {float} amount the amount of margin to remove
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [margin structure]{@link https://docs.ccxt.com/#/?id=reduce-margin-structure}
     */
    reduceMargin(symbol: string, amount: number, params?: {}): Promise<MarginModification>;
    /**
     * @method
     * @name okx#addMargin
     * @description add margin
     * @see https://www.okx.com/docs-v5/en/#trading-account-rest-api-increase-decrease-margin
     * @param {string} symbol unified market symbol
     * @param {float} amount amount of margin to add
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [margin structure]{@link https://docs.ccxt.com/#/?id=add-margin-structure}
     */
    addMargin(symbol: string, amount: number, params?: {}): Promise<MarginModification>;
    /**
     * @method
     * @name okx#fetchMarketLeverageTiers
     * @description retrieve information on the maximum leverage, and maintenance margin for trades of varying trade sizes for a single market
     * @see https://www.okx.com/docs-v5/en/#rest-api-public-data-get-position-tiers
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] 'cross' or 'isolated'
     * @returns {object} a [leverage tiers structure]{@link https://docs.ccxt.com/#/?id=leverage-tiers-structure}
     */
    fetchMarketLeverageTiers(symbol: string, params?: {}): Promise<LeverageTier[]>;
    parseMarketLeverageTiers(info: any, market?: Market): LeverageTier[];
    /**
     * @method
     * @name okx#fetchBorrowInterest
     * @description fetch the interest owed by the user for borrowing currency for margin trading
     * @see https://www.okx.com/docs-v5/en/#rest-api-account-get-interest-accrued-data
     * @param {string} code the unified currency code for the currency of the interest
     * @param {string} symbol the market symbol of an isolated margin market, if undefined, the interest for cross margin markets is returned
     * @param {int} [since] timestamp in ms of the earliest time to receive interest records for
     * @param {int} [limit] the number of [borrow interest structures]{@link https://docs.ccxt.com/#/?id=borrow-interest-structure} to retrieve
     * @param {object} [params] exchange specific parameters
     * @param {int} [params.type] Loan type 1 - VIP loans 2 - Market loans *Default is Market loans*
     * @param {string} [params.marginMode] 'cross' or 'isolated'
     * @returns {object[]} An list of [borrow interest structures]{@link https://docs.ccxt.com/#/?id=borrow-interest-structure}
     */
    fetchBorrowInterest(code?: Str, symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<BorrowInterest[]>;
    parseBorrowInterest(info: Dict, market?: Market): BorrowInterest;
    /**
     * @method
     * @name okx#borrowCrossMargin
     * @description create a loan to borrow margin (need to be VIP 5 and above)
     * @see https://www.okx.com/docs-v5/en/#trading-account-rest-api-vip-loans-borrow-and-repay
     * @param {string} code unified currency code of the currency to borrow
     * @param {float} amount the amount to borrow
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [margin loan structure]{@link https://docs.ccxt.com/#/?id=margin-loan-structure}
     */
    borrowCrossMargin(code: string, amount: number, params?: {}): Promise<{
        id: any;
        currency: string;
        amount: number;
        symbol: any;
        timestamp: any;
        datetime: any;
        info: any;
    }>;
    /**
     * @method
     * @name okx#repayCrossMargin
     * @description repay borrowed margin and interest
     * @see https://www.okx.com/docs-v5/en/#trading-account-rest-api-vip-loans-borrow-and-repay
     * @param {string} code unified currency code of the currency to repay
     * @param {float} amount the amount to repay
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.id] the order ID of borrowing, it is necessary while repaying
     * @returns {object} a [margin loan structure]{@link https://docs.ccxt.com/#/?id=margin-loan-structure}
     */
    repayCrossMargin(code: string, amount: any, params?: {}): Promise<{
        id: any;
        currency: string;
        amount: number;
        symbol: any;
        timestamp: any;
        datetime: any;
        info: any;
    }>;
    parseMarginLoan(info: any, currency?: Currency): {
        id: any;
        currency: string;
        amount: number;
        symbol: any;
        timestamp: any;
        datetime: any;
        info: any;
    };
    /**
     * @method
     * @name okx#fetchOpenInterest
     * @description Retrieves the open interest of a currency
     * @see https://www.okx.com/docs-v5/en/#rest-api-public-data-get-open-interest
     * @param {string} symbol Unified CCXT market symbol
     * @param {object} [params] exchange specific parameters
     * @returns {object} an open interest structure{@link https://docs.ccxt.com/#/?id=open-interest-structure}
     */
    fetchOpenInterest(symbol: string, params?: {}): Promise<import("./base/types.js").OpenInterest>;
    /**
     * @method
     * @name okx#fetchOpenInterestHistory
     * @description Retrieves the open interest history of a currency
     * @see https://www.okx.com/docs-v5/en/#rest-api-trading-data-get-contracts-open-interest-and-volume
     * @see https://www.okx.com/docs-v5/en/#rest-api-trading-data-get-options-open-interest-and-volume
     * @param {string} symbol Unified CCXT currency code or unified symbol
     * @param {string} timeframe "5m", "1h", or "1d" for option only "1d" or "8h"
     * @param {int} [since] The time in ms of the earliest record to retrieve as a unix timestamp
     * @param {int} [limit] Not used by okx, but parsed internally by CCXT
     * @param {object} [params] Exchange specific parameters
     * @param {int} [params.until] The time in ms of the latest record to retrieve as a unix timestamp
     * @returns An array of [open interest structures]{@link https://docs.ccxt.com/#/?id=open-interest-structure}
     */
    fetchOpenInterestHistory(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<import("./base/types.js").OpenInterest[]>;
    parseOpenInterest(interest: any, market?: Market): import("./base/types.js").OpenInterest;
    setSandboxMode(enable: boolean): void;
    /**
     * @method
     * @name okx#fetchDepositWithdrawFees
     * @description fetch deposit and withdraw fees
     * @see https://www.okx.com/docs-v5/en/#rest-api-funding-get-currencies
     * @param {string[]|undefined} codes list of unified currency codes
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [fees structures]{@link https://docs.ccxt.com/#/?id=fee-structure}
     */
    fetchDepositWithdrawFees(codes?: Strings, params?: {}): Promise<Dict>;
    parseDepositWithdrawFees(response: any, codes?: any, currencyIdKey?: any): Dict;
    /**
     * @method
     * @name okx#fetchSettlementHistory
     * @description fetches historical settlement records
     * @see https://www.okx.com/docs-v5/en/#rest-api-public-data-get-delivery-exercise-history
     * @param {string} symbol unified market symbol to fetch the settlement history for
     * @param {int} [since] timestamp in ms
     * @param {int} [limit] number of records
     * @param {object} [params] exchange specific params
     * @returns {object[]} a list of [settlement history objects]{@link https://docs.ccxt.com/#/?id=settlement-history-structure}
     */
    fetchSettlementHistory(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<any>;
    parseSettlement(settlement: any, market: any): {
        info: any;
        symbol: string;
        price: number;
        timestamp: any;
        datetime: any;
    };
    parseSettlements(settlements: any, market: any): any[];
    /**
     * @method
     * @name okx#fetchUnderlyingAssets
     * @description fetches the market ids of underlying assets for a specific contract market type
     * @see https://www.okx.com/docs-v5/en/#public-data-rest-api-get-underlying
     * @param {object} [params] exchange specific params
     * @param {string} [params.type] the contract market type, 'option', 'swap' or 'future', the default is 'option'
     * @returns {object[]} a list of [underlying assets]{@link https://docs.ccxt.com/#/?id=underlying-assets-structure}
     */
    fetchUnderlyingAssets(params?: {}): Promise<any>;
    /**
     * @method
     * @name okx#fetchGreeks
     * @description fetches an option contracts greeks, financial metrics used to measure the factors that affect the price of an options contract
     * @see https://www.okx.com/docs-v5/en/#public-data-rest-api-get-option-market-data
     * @param {string} symbol unified symbol of the market to fetch greeks for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [greeks structure]{@link https://docs.ccxt.com/#/?id=greeks-structure}
     */
    fetchGreeks(symbol: string, params?: {}): Promise<Greeks>;
    parseGreeks(greeks: Dict, market?: Market): Greeks;
    /**
     * @method
     * @name okx#closePosition
     * @description closes open positions for a market
     * @see https://www.okx.com/docs-v5/en/#order-book-trading-trade-post-close-positions
     * @param {string} symbol Unified CCXT market symbol
     * @param {string} [side] 'buy' or 'sell', leave as undefined in net mode
     * @param {object} [params] extra parameters specific to the okx api endpoint
     * @param {string} [params.clientOrderId] a unique identifier for the order
     * @param {string} [params.marginMode] 'cross' or 'isolated', default is 'cross;
     * @param {string} [params.code] *required in the case of closing cross MARGIN position for Single-currency margin* margin currency
     *
     * EXCHANGE SPECIFIC PARAMETERS
     * @param {boolean} [params.autoCxl] whether any pending orders for closing out needs to be automatically canceled when close position via a market order. false or true, the default is false
     * @param {string} [params.tag] order tag a combination of case-sensitive alphanumerics, all numbers, or all letters of up to 16 characters
     * @returns {object[]} [A list of position structures]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    closePosition(symbol: string, side?: OrderSide, params?: {}): Promise<Order>;
    /**
     * @method
     * @name okx#fetchOption
     * @description fetches option data that is commonly found in an option chain
     * @see https://www.okx.com/docs-v5/en/#order-book-trading-market-data-get-ticker
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [option chain structure]{@link https://docs.ccxt.com/#/?id=option-chain-structure}
     */
    fetchOption(symbol: string, params?: {}): Promise<Option>;
    /**
     * @method
     * @name okx#fetchOptionChain
     * @description fetches data for an underlying asset that is commonly found in an option chain
     * @see https://www.okx.com/docs-v5/en/#order-book-trading-market-data-get-tickers
     * @param {string} code base currency to fetch an option chain for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.uly] the underlying asset, can be obtained from fetchUnderlyingAssets ()
     * @returns {object} a list of [option chain structures]{@link https://docs.ccxt.com/#/?id=option-chain-structure}
     */
    fetchOptionChain(code: string, params?: {}): Promise<OptionChain>;
    parseOption(chain: Dict, currency?: Currency, market?: Market): Option;
    /**
     * @method
     * @name okx#fetchConvertQuote
     * @description fetch a quote for converting from one currency to another
     * @see https://www.okx.com/docs-v5/en/#funding-account-rest-api-estimate-quote
     * @param {string} fromCode the currency that you want to sell and convert from
     * @param {string} toCode the currency that you want to buy and convert into
     * @param {float} [amount] how much you want to trade in units of the from currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [conversion structure]{@link https://docs.ccxt.com/#/?id=conversion-structure}
     */
    fetchConvertQuote(fromCode: string, toCode: string, amount?: Num, params?: {}): Promise<Conversion>;
    /**
     * @method
     * @name okx#createConvertTrade
     * @description convert from one currency to another
     * @see https://www.okx.com/docs-v5/en/#funding-account-rest-api-convert-trade
     * @param {string} id the id of the trade that you want to make
     * @param {string} fromCode the currency that you want to sell and convert from
     * @param {string} toCode the currency that you want to buy and convert into
     * @param {float} [amount] how much you want to trade in units of the from currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [conversion structure]{@link https://docs.ccxt.com/#/?id=conversion-structure}
     */
    createConvertTrade(id: string, fromCode: string, toCode: string, amount?: Num, params?: {}): Promise<Conversion>;
    /**
     * @method
     * @name okx#fetchConvertTrade
     * @description fetch the data for a conversion trade
     * @see https://www.okx.com/docs-v5/en/#funding-account-rest-api-get-convert-history
     * @param {string} id the id of the trade that you want to fetch
     * @param {string} [code] the unified currency code of the conversion trade
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [conversion structure]{@link https://docs.ccxt.com/#/?id=conversion-structure}
     */
    fetchConvertTrade(id: string, code?: Str, params?: {}): Promise<Conversion>;
    /**
     * @method
     * @name okx#fetchConvertTradeHistory
     * @description fetch the users history of conversion trades
     * @see https://www.okx.com/docs-v5/en/#funding-account-rest-api-get-convert-history
     * @param {string} [code] the unified currency code
     * @param {int} [since] the earliest time in ms to fetch conversions for
     * @param {int} [limit] the maximum number of conversion structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest conversion to fetch
     * @returns {object[]} a list of [conversion structures]{@link https://docs.ccxt.com/#/?id=conversion-structure}
     */
    fetchConvertTradeHistory(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Conversion[]>;
    parseConversion(conversion: Dict, fromCurrency?: Currency, toCurrency?: Currency): Conversion;
    /**
     * @method
     * @name okx#fetchConvertCurrencies
     * @description fetches all available currencies that can be converted
     * @see https://www.okx.com/docs-v5/en/#funding-account-rest-api-get-convert-currencies
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    fetchConvertCurrencies(params?: {}): Promise<Currencies>;
    handleErrors(httpCode: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): any;
    /**
     * @method
     * @name okx#fetchMarginAdjustmentHistory
     * @description fetches the history of margin added or reduced from contract isolated positions
     * @see https://www.okx.com/docs-v5/en/#trading-account-rest-api-get-bills-details-last-7-days
     * @see https://www.okx.com/docs-v5/en/#trading-account-rest-api-get-bills-details-last-3-months
     * @param {string} [symbol] not used by okx fetchMarginAdjustmentHistory
     * @param {string} [type] "add" or "reduce"
     * @param {int} [since] the earliest time in ms to fetch margin adjustment history for
     * @param {int} [limit] the maximum number of entries to retrieve
     * @param {object} params extra parameters specific to the exchange api endpoint
     * @param {boolean} [params.auto] true if fetching auto margin increases
     * @returns {object[]} a list of [margin structures]{@link https://docs.ccxt.com/#/?id=margin-loan-structure}
     */
    fetchMarginAdjustmentHistory(symbol?: Str, type?: Str, since?: Num, limit?: Num, params?: {}): Promise<MarginModification[]>;
    /**
     * @method
     * @name okx#fetchPositionsHistory
     * @description fetches historical positions
     * @see https://www.okx.com/docs-v5/en/#trading-account-rest-api-get-positions-history
     * @param {string} [symbols] unified market symbols
     * @param {int} [since] timestamp in ms of the earliest position to fetch
     * @param {int} [limit] the maximum amount of records to fetch, default=100, max=100
     * @param {object} params extra parameters specific to the exchange api endpoint
     * @param {string} [params.marginMode] "cross" or "isolated"
     *
     * EXCHANGE SPECIFIC PARAMETERS
     * @param {string} [params.instType] margin, swap, futures or option
     * @param {string} [params.type] the type of latest close position 1: close position partially, 2：close all, 3：liquidation, 4：partial liquidation; 5：adl, is it is the latest type if there are several types for the same position
     * @param {string} [params.posId] position id, there is attribute expiration, the posid will be expired if it is more than 30 days after the last full close position, then position will use new posid
     * @param {string} [params.before] timestamp in ms of the earliest position to fetch based on the last update time of the position
     * @param {string} [params.after] timestamp in ms of the latest position to fetch based on the last update time of the position
     * @returns {object[]} a list of [position structures]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    fetchPositionsHistory(symbols?: Strings, since?: Int, limit?: Int, params?: {}): Promise<Position[]>;
    /**
     * @method
     * @name okx#fetchLongShortRatioHistory
     * @description fetches the long short ratio history for a unified market symbol
     * @see https://www.okx.com/docs-v5/en/#trading-statistics-rest-api-get-contract-long-short-ratio
     * @param {string} symbol unified symbol of the market to fetch the long short ratio for
     * @param {string} [timeframe] the period for the ratio
     * @param {int} [since] the earliest time in ms to fetch ratios for
     * @param {int} [limit] the maximum number of long short ratio structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest ratio to fetch
     * @returns {object[]} an array of [long short ratio structures]{@link https://docs.ccxt.com/#/?id=long-short-ratio-structure}
     */
    fetchLongShortRatioHistory(symbol?: Str, timeframe?: Str, since?: Int, limit?: Int, params?: {}): Promise<LongShortRatio[]>;
    parseLongShortRatio(info: Dict, market?: Market): LongShortRatio;
}
