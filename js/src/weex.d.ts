import Exchange from './abstract/weex.js';
import type { Balances, Currencies, Currency, Dict, FundingRate, FundingRateHistory, FundingRates, LedgerEntry, Int, int, Market, Num, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, TransferEntry, Position, TradingFeeInterface, MarginMode, MarginModes, Leverage, Leverages, MarginModification } from './base/types.js';
/**
 * @class weex
 * @augments Exchange
 */
export default class weex extends Exchange {
    describe(): any;
    nonce(): number;
    /**
     * @method
     * @name weex#fetchStatus
     * @description the latest known information on the availability of the exchange API
     * @see https://www.weex.com/api-doc/spot/ConfigAPI/Ping
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [status structure]{@link https://docs.ccxt.com/?id=exchange-status-structure}
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
     * @name weex#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @see https://www.weex.com/api-doc/spot/ConfigAPI/GetServerTime
     * @see https://www.weex.com/api-doc/contract/Market_API/GetServerTime
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] 'spot' or 'swap', default is 'spot'
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    fetchTime(params?: {}): Promise<Int>;
    /**
     * @method
     * @name weex#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://www.weex.com/api-doc/spot/ConfigAPI/CurrencyInfo
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    fetchCurrencies(params?: {}): Promise<Currencies>;
    /**
     * @method
     * @name weex#fetchMarkets
     * @description retrieves data on all markets for exchagne
     * @see https://www.weex.com/api-doc/spot/ConfigAPI/GetProductInfo // spot
     * @see https://www.weex.com/api-doc/contract/Market_API/GetContractInfo // contract
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    fetchMarkets(params?: {}): Promise<Market[]>;
    parseMarket(market: Dict): Market;
    /**
     * @method
     * @name weex#fetchTickers
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://www.weex.com/api-doc/spot/MarketDataAPI/GetAllTickerInfo // spot
     * @see https://www.weex.com/api-doc/contract/Market_API/GetTicker24h // contract
     * @param {string} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] 'spot' or 'swap', default is 'spot' (used if symbols are not provided)
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    /**
     * @method
     * @name weex#fetchBidsAsks
     * @description fetches the bid and ask price and volume for multiple markets
     * @see https://www.weex.com/api-doc/spot/MarketDataAPI/GetBookTicker // spot
     * @see https://www.weex.com/api-doc/contract/Market_API/GetBookTicker // contract
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the bids and asks for, all markets are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] 'spot' or 'swap', default is 'spot' (used if symbols are not provided)
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    fetchBidsAsks(symbols?: Strings, params?: {}): Promise<Tickers>;
    parseTicker(ticker: Dict, market?: Market): Ticker;
    /**
     * @method
     * @name weex#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://www.weex.com/api-doc/spot/MarketDataAPI/GetDepthData // spot
     * @see https://www.weex.com/api-doc/contract/Market_API/GetDepthData // contract
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return (default 15, max 200)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure} indexed by market symbols
     */
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    /**
     * @method
     * @name weex#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://www.weex.com/api-doc/spot/MarketDataAPI/GetKLineData // spot
     * @see https://www.weex.com/api-doc/contract/Market_API/GetKlines // contract last price
     * @see https://www.weex.com/api-doc/contract/Market_API/GetIndexPriceKlines // contract index price
     * @see https://www.weex.com/api-doc/contract/Market_API/GetMarkPriceKlines // contract mark price
     * @see https://www.weex.com/api-doc/contract/Market_API/GetHistoryKlines // contract historical klines
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch (default 100, max 300)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * Check fetchSpotOHLCV() and fetchContractOHLCV() for more details on the extra parameters that can be used in params
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    /**
     * @method
     * @ignore
     * @name weex#fetchSpotOHLCV
     * @description helper method for fetchOHLCV
     * @see https://www.weex.com/api-doc/spot/MarketDataAPI/GetKLineData
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    fetchSpotOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    /**
     * @method
     * @ignore
     * @name weex#fetchContractOHLCV
     * @description helper method for fetchOHLCV
     * @see https://www.weex.com/api-doc/contract/Market_API/GetKlines // contract last price
     * @see https://www.weex.com/api-doc/contract/Market_API/GetIndexPriceKlines // contract index price
     * @see https://www.weex.com/api-doc/contract/Market_API/GetMarkPriceKlines // contract mark price
     * @see https://www.weex.com/api-doc/contract/Market_API/GetHistoryKlines // contract historical klines
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch (default 100, max 100 for historical klines, max 1000 for other contract klines)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest candle to fetch
     * @param {boolean} [params.paginate] whether to automatically paginate requests until the required number of candles is returned
     * @param {boolean} [params.historical] whether to fetch historical klines (default is false). If false, will fetch last price klines
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    fetchContractOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    /**
     * @method
     * @name weex#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://www.weex.com/api-doc/spot/MarketDataAPI/GetTradeData // spot
     * @see https://www.weex.com/api-doc/contract/Market_API/GetRecentTrades // contract
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch (default 100, max 1000)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseTrade(trade: Dict, market?: Market): Trade;
    /**
     * @method
     * @name weex#fetchOpenInterest
     * @description retrieves the open interest of a contract trading pair
     * @see https://www.weex.com/api-doc/contract/Market_API/GetOpenInterest
     * @param {string} symbol unified CCXT market symbol
     * @param {object} [params] exchange specific parameters
     * @returns {object} an open interest structure{@link https://docs.ccxt.com/?id=open-interest-structure}
     */
    fetchOpenInterest(symbol: string, params?: {}): Promise<import("./base/types.js").OpenInterest>;
    parseOpenInterest(interest: any, market?: Market): import("./base/types.js").OpenInterest;
    /**
     * @method
     * @name weex#fetchFundingRates
     * @description fetch the funding rate for multiple markets
     * @see https://www.weex.com/api-doc/contract/Market_API/GetCurrentFundingRate
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subType] "linear" or "inverse"
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rates-structure}, indexed by market symbols
     */
    fetchFundingRates(symbols?: Strings, params?: {}): Promise<FundingRates>;
    parseFundingRate(contract: any, market?: Market): FundingRate;
    /**
     * @method
     * @name weex#fetchFundingRateHistory
     * @description fetches historical funding rate prices
     * @see https://www.weex.com/api-doc/contract/Market_API/GetFundingRateHistory
     * @param {string} symbol unified symbol of the market to fetch the funding rate history for
     * @param {int} [since] timestamp in ms of the earliest funding rate to fetch
     * @param {int} [limit] the maximum amount of funding rate records to fetch (default 100, max 1000)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest funding rate
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure}
     */
    fetchFundingRateHistory(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<FundingRateHistory[]>;
    parseFundingRateHistory(contract: any, market?: Market): {
        info: any;
        symbol: string;
        fundingRate: number;
        timestamp: number;
        datetime: string;
    };
    /**
     * @method
     * @name weex#fetchBalance
     * @see https://www.weex.com/api-doc/spot/AccountAPI/GetAccountBalance // spot
     * @see https://www.weex.com/api-doc/contract/Account_API/GetAccountBalance // contract
     * @description query for balance and get the amount of funds available for trading or funds locked in positions
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] 'spot' or 'swap' (default is 'spot')
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    fetchBalance(params?: {}): Promise<Balances>;
    parseBalance(response: any): Balances;
    /**
     * @method
     * @name weex#fetchTransfers
     * @description fetch a history of internal transfers made on an account
     * @see https://www.weex.com/api-doc/spot/AccountAPI/TransferRecords
     * @param {string} [code] unified currency code of the currency transferred
     * @param {int} [since] the earliest time in ms to fetch transfers for
     * @param {int} [limit] the maximum number of transfers structures to retrieve (default 10, max 100)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object[]} a list of [transfer structures]{@link https://docs.ccxt.com/?id=transfer-structure}
     */
    fetchTransfers(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<TransferEntry[]>;
    parseTransfer(transfer: Dict, currency?: Currency): TransferEntry;
    parseTransferStatus(status: Str): string;
    /**
     * @method
     * @name weex#createOrder
     * @description Create an order on the exchange
     * @see https://www.weex.com/api-doc/spot/orderApi/PlaceOrder // spot
     * @see https://www.weex.com/api-doc/contract/Transaction_API/PlaceOrder // contract
     * @see https://www.weex.com/api-doc/contract/Transaction_API/PlacePendingOrder // contract trigger
     * @see https://www.weex.com/api-doc/contract/Transaction_API/PlaceTpSlOrder // contract take profit / stop loss
     * @param {string} symbol Unified CCXT market symbol
     * @param {string} type 'limit' or 'market'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount the amount of currency to trade
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params]  extra parameters specific to the exchange API endpoint
     * Check createSpotOrder() and createContractOrder() for more details on the extra parameters that can be used in params
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name weex#createSpotOrder
     * @description helper method for creating spot orders
     * @see https://www.weex.com/api-doc/spot/orderApi/PlaceOrder
     * @param {string} symbol Unified CCXT market symbol
     * @param {string} type 'limit' or 'market'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount the amount of currency to trade
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params]  extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] client order id
     * @param {string} [params.timeInForce] 'GTC', 'IOC', or 'FOK'
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    createSpotOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    createSpotOrderRequest(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Dict;
    /**
     * @method
     * @name weex#createContractOrder
     * @description helper method for creating contract orders
     * @see https://www.weex.com/api-doc/contract/Transaction_API/PlaceOrder
     * @see https://www.weex.com/api-doc/contract/Transaction_API/PlacePendingOrder
     * @param {string} symbol Unified CCXT market symbol
     * @param {string} type 'limit' or 'market'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount the amount of currency to trade
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] client order id
     * @param {object} [params.takeProfit] *takeProfit object in params* containing the triggerPrice at which the attached take profit order will be triggered and the triggerPriceType
     * @param {float} [params.takeProfit.triggerPrice] The price at which the take profit order will be triggered
     * @param {string} [params.takeProfit.triggerPriceType] The type of the trigger price for the take profit order, either 'last' or 'mark' (default is 'last')
     * @param {object} [params.stopLoss] *stopLoss object in params* containing the triggerPrice at which the attached stop loss order will be triggered and the triggerPriceType
     * @param {float} [params.stopLoss.triggerPrice] The price at which the stop loss order will be triggered
     * @param {string} [params.stopLoss.triggerPriceType] The type of the trigger price for the stop loss order, either 'last' or 'mark' (default is 'last')
     * @param {float} [params.stopLossPrice] price to trigger stop-loss orders
     * @param {string} [params.stopLossPriceType] The type of the trigger price for the stop loss order, either 'last' or 'mark' (default is 'last')
     * @param {float} [params.takeProfitPrice] price to trigger take-profit orders
     * @param {string} [params.takeProfitPriceType] The type of the trigger price for the take profit order, either 'last' or 'mark' (default is 'last')
     * @param {bool} [params.reduceOnly] A mark to reduce the position size only. Set to false by default. Need to set the position size when reduceOnly is true.
     * @param {string} [params.timeInForce] GTC, IOC, or FOK (default is GTC for limit orders)
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    createContractOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    createContractOrderRequest(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): any;
    encodeTriggerPriceType(triggerPriceType: Str): string;
    /**
     * @method
     * @name weex#cancelOrder
     * @description cancels an open order
     * @see https://www.weex.com/api-doc/spot/orderApi/CancelOrder // spot
     * @see https://www.weex.com/api-doc/contract/Transaction_API/CancelOrder // contract
     * @param {string} id order id
     * @param {string} [symbol] unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] 'spot' or 'swap' (default is 'spot')
     * @param {boolean} [params.trigger] *contract orders only* whether the order to cancel is a trigger order
     * @param {string} [params.clientOrderId] *non-trigger orders only* a unique id for the order
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name weex#cancelAllOrders
     * @description cancel all open orders
     * @see https://www.weex.com/api-doc/spot/orderApi/Cancel-Symbol-Orders // spot
     * @see https://www.weex.com/api-doc/contract/Transaction_API/CancelAllOrders // contract
     * @see https://www.weex.com/api-doc/contract/Transaction_API/CancelAllPendingOrders // contract trigger
     * @param {string} symbol unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] 'spot' or 'swap', used if symbol is not provided (default is 'spot')
     * @param {boolean} [params.trigger] *swap only* true for cancelling trigger orders (default is false)
     * @returns Response from the exchange
     */
    cancelAllOrders(symbol?: Str, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name weex#cancelOrders
     * @description cancel multiple orders
     * @see https://www.weex.com/api-doc/spot/orderApi/BulkCancel // spot
     * @see https://www.weex.com/api-doc/contract/Transaction_API/CancelOrdersBatch // contract
     * @param {string[]} ids order ids
     * @param {string} [symbol] unified market symbol, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string[]} [params.clientOrderIds] client order ids (could be an alternative to ids)
     * @param {string} [params.type] 'spot' or 'swap', used if symbol is not provided (default is 'spot')
     * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    cancelOrders(ids: string[], symbol?: Str, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name weex#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://www.weex.com/api-doc/spot/orderApi/OrderDetails // spot
     * @see https://www.weex.com/api-doc/contract/Transaction_API/GetSingleOrderInfo // contract
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] 'spot' or 'swap', used if symbol is not provided (default is 'spot')
     * @param {string} [params.clientOrderId] *spot only* a unique id for the order, used if id is not provided
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchOrder(id: Str, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name weex#fetchOpenOrders
     * @see https://www.weex.com/api-doc/spot/orderApi/UnfinishedOrders // spot
     * @see https://www.weex.com/api-doc/contract/Transaction_API/GetCurrentOrderStatus // contract
     * @see https://www.weex.com/api-doc/contract/Transaction_API/GetCurrentPendingOrders // contract trigger
     * @description fetch all unfilled currently open orders
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of  open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] 'spot' or 'swap', used if symbol is not provided (default is 'spot')
     * @param {boolean} [params.trigger] *swap only* whether to fetch trigger orders (default is false)
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name weex#fetchClosedOrders
     * @description fetches information on multiple closed orders made by the user
     * @see https://www.weex.com/api-doc/spot/orderApi/HistoryOrders // spot
     * @see https://www.weex.com/api-doc/contract/Transaction_API/GetOrderHistory // contract
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch orders for
     * @param {string} [params.type] 'spot' or 'swap', used if symbol is not provided (default is 'spot')
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name weex#fetchCanceledOrders
     * @description fetches information on multiple canceled orders made by the user
     * @see https://www.weex.com/api-doc/spot/orderApi/HistoryOrders // spot
     * @see https://www.weex.com/api-doc/contract/Transaction_API/GetOrderHistory // contract
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch orders for
     * @param {string} [params.type] 'spot' or 'swap', used if symbol is not provided (default is 'spot')
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchCanceledOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name weex#fetchOrders
     * @description fetches information on multiple spot orders made by the user
     * @see https://www.weex.com/api-doc/spot/orderApi/HistoryOrders // spot
     * @param {string} symbol unified market symbol of the market orders were made in (required for spot orders)
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {object} [params.until] end time, ms
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name weex#fetchCanceledAndClosedOrders
     * @description fetches information on multiple closed and canceled orders made by the user
     * @see https://www.weex.com/api-doc/contract/Transaction_API/GetOrderHistory // contract
     * @param {string} [symbol] unified market symbol of the market orders were made in (required for spot orders)
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {object} [params.until] end time, ms
     * @param {string} [params.type] 'spot' or 'swap', used if symbol is not provided (default is 'spot')
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchCanceledAndClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    parseOrder(order: Dict, market?: Market): Order;
    parseOrderStatus(status: Str): string;
    parseOrderType(type: Str): string;
    handleOrderOrPositionError(errorCode: Str, errorMessage: Str, order: Dict): void;
    /**
     * @method
     * @name weex#fetchOrderTrades
     * @description fetch all the trades made from a single order
     * @see https://www.weex.com/api-doc/spot/orderApi/TransactionDetails // spot
     * @see https://www.weex.com/api-doc/contract/Transaction_API/GetTradeDetails // contract
     * @param {string} id order id
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    fetchOrderTrades(id: string, symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name weex#fetchMyTrades
     * @see https://www.weex.com/api-doc/spot/orderApi/TransactionDetails // spot
     * @see https://www.weex.com/api-doc/contract/Transaction_API/GetTradeDetails // contract
     * @description fetch all trades made by the user
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @param {string} [params.type] 'spot' or 'swap', used if symbol is not provided (default is 'spot')
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name weex#fetchLedger
     * @description fetch the history of changes, actions done by the user or operations that altered the balance of the user
     * @see https://www.weex.com/api-doc/spot/AccountAPI/GetBillRecords // spot
     * @see https://www.weex.com/api-doc/spot/AccountAPI/GetFundBillRecords // funding
     * @see https://www.weex.com/api-doc/contract/Account_API/GetContractBills // contract
     * @param {string} [code] unified currency code, default is undefined
     * @param {int} [since] timestamp in ms of the earliest ledger entry, default is undefined
     * @param {int} [limit] max number of ledger entries to return, default is undefined, max is 100
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest ledger entry
     * @param {string} [params.type] 'spot', 'funding' or 'swap' (default is 'spot')
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object} a [ledger structure]{@link https://docs.ccxt.com/?id=ledger-entry-structure}
     */
    fetchLedger(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<LedgerEntry[]>;
    parseLedgerEntry(item: Dict, currency?: Currency): LedgerEntry;
    parseLedgerType(type: Str): string;
    /**
     * @method
     * @name weex#fetchPositions
     * @description fetch all open positions
     * @see https://www.weex.com/api-doc/contract/Account_API/GetAllPositions
     * @param {string[]} [symbols] list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/?id=position-structure}
     */
    fetchPositions(symbols?: Strings, params?: {}): Promise<Position[]>;
    /**
     * @method
     * @name weex#fetchPosition
     * @description fetch data on an open position
     * @see https://www.weex.com/api-doc/contract/Account_API/GetSinglePosition
     * @param {string} symbol unified market symbol of the market the position is held in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [position structure]{@link https://docs.ccxt.com/?id=position-structure}
     */
    fetchPosition(symbol: string, params?: {}): Promise<Position>;
    /**
     * @method
     * @description fetch open positions for a single market
     * @name weex#fetchPositionsForSymbol
     * @see https://www.weex.com/api-doc/contract/Account_API/GetSinglePosition
     * @description fetch all open positions for specific symbol
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/?id=position-structure}
     */
    fetchPositionsForSymbol(symbol: string, params?: {}): Promise<Position[]>;
    parsePosition(position: Dict, market?: Market): Position;
    /**
     * @method
     * @name weex#closeAllPositions
     * @description closes all open positions for a market type
     * @see https://www.weex.com/api-doc/contract/Transaction_API/ClosePositions
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} A list of [position structures]{@link https://docs.ccxt.com/?id=position-structure}
     */
    closeAllPositions(params?: {}): Promise<Position[]>;
    /**
     * @method
     * @name weex#closePosition
     * @description closes open positions for a market
     * @see https://www.weex.com/api-doc/contract/Transaction_API/ClosePositions
     * @param {string} symbol Unified CCXT market symbol
     * @param {string} [side] not used by current exchange
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    closePosition(symbol: string, side?: OrderSide, params?: {}): Promise<Order>;
    /**
     * @method
     * @name weex#fetchTradingFee
     * @see https://www.weex.com/api-doc/contract/Account_API/GetCommissionRate // contract
     * @description fetch the trading fees for a contract market
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [fee structure]{@link https://docs.ccxt.com/#/?id=fee-structure}
     */
    fetchTradingFee(symbol: string, params?: {}): Promise<TradingFeeInterface>;
    parseTradingFee(fee: Dict, market?: Market): TradingFeeInterface;
    /**
     * @method
     * @name weex#fetchMarginMode
     * @description fetches the margin mode of a specific symbol
     * @see https://www.weex.com/api-doc/contract/Account_API/GetSymbolConfig
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [margin mode structure]{@link https://docs.ccxt.com/?id=margin-mode-structure}
     */
    fetchMarginMode(symbol: string, params?: {}): Promise<MarginMode>;
    /**
     * @method
     * @name weex#fetchMarginModes
     * @description fetches margin modes the symbols, with symbols=undefined all markets are returned
     * @see https://www.weex.com/api-doc/contract/Account_API/GetSymbolConfig
     * @param {string[]} symbols unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [margin mode structures]{@link https://docs.ccxt.com/?id=margin-mode-structure}
     */
    fetchMarginModes(symbols?: Strings, params?: {}): Promise<MarginModes>;
    parseMarginMode(marginMode: Dict, market?: any): MarginMode;
    parseMarginType(marginType: Str): string;
    /**
     * @method
     * @name weex#setMarginMode
     * @description set margin mode to 'cross' or 'isolated'
     * @see https://www.weex.com/api-doc/contract/Account_API/ChangeMarginModeTRADE
     * @param {string} marginMode 'cross' or 'isolated'
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} response from the exchange
     */
    setMarginMode(marginMode: string, symbol?: Str, params?: {}): Promise<any>;
    encodeMarginMode(marginMode: Str): string;
    /**
     * @method
     * @name weex#fetchLeverage
     * @description fetch the set leverage for a market
     * @see https://www.weex.com/api-doc/contract/Account_API/GetSymbolConfig
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [leverage structure]{@link https://docs.ccxt.com/?id=leverage-structure}
     */
    fetchLeverage(symbol: string, params?: {}): Promise<Leverage>;
    /**
     * @method
     * @name weex#fetchLeverages
     * @description fetch the set leverage for all markets
     * @see https://www.weex.com/api-doc/contract/Account_API/GetSymbolConfig
     * @param {string[]} [symbols] a list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [leverage structures]{@link https://docs.ccxt.com/#/?id=leverage-structure}
     */
    fetchLeverages(symbols?: Strings, params?: {}): Promise<Leverages>;
    parseLeverage(leverage: Dict, market?: Market): Leverage;
    /**
     * @method
     * @name weex#setLeverage
     * @description set the level of leverage for a market
     * @see https://www.weex.com/api-doc/contract/Account_API/UpdateLeverageTRADE
     * @param {float} leverage the rate of leverage
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] 'cross' or 'isolated' (default is 'cross' if specific leverage parameters are not provided)
     * @param {number} [params.crossLeverage] *cross margin mode only* leverage for cross margin mode when marginMode is 'cross'
     * @param {number} [params.isolatedLongLeverage] *isolated margin mode only* leverage for long positions when marginMode is 'isolated'
     * @param {number} [params.isolatedShortLeverage] *isolated margin mode only* leverage for short positions when marginMode is 'isolated'
     * If specific leverage parameters are not provided
     * the leverage value will be applied to both long and short positions if marginMode is 'isolated'
     * or to cross margin mode if marginMode is 'cross'
     * If marginMode is not provided and specific leverage parameters are not provided too
     * the leverage value will be applied to cross leverage
     * @returns {object} response from the exchange
     */
    setLeverage(leverage: int, symbol?: Str, params?: {}): Promise<any>;
    /**
     * @method
     * @name weex#fetchPositionMode
     * @description fetchs the position mode, hedged or one way
     * @see https://www.weex.com/api-doc/contract/Account_API/GetSymbolConfig
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an object detailing whether the market is in hedged or one-way mode
     */
    fetchPositionMode(symbol?: Str, params?: {}): Promise<{
        info: any;
        hedged: boolean;
    }>;
    /**
     * @method
     * @name weex#setPositionMode
     * @description set hedged to true or false for a market
     * @see https://www.weex.com/api-doc/contract/Account_API/ChangeMarginModeTRADE
     * @param {bool} hedged set to true to use dualSidePosition
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} params.marginMode 'cross' or 'isolated' (default is 'cross')
     * @returns {object} response from the exchange
     */
    setPositionMode(hedged: boolean, symbol?: Str, params?: {}): Promise<any>;
    modifyMarginHelper(symbol: string, amount: any, type: any, params?: {}): Promise<MarginModification>;
    parseMarginModification(data: Dict, market?: Market): MarginModification;
    /**
     * @method
     * @name weex#reduceMargin
     * @description remove margin from a position
     * @see https://www.weex.com/api-doc/contract/Account_API/AdjustPositionMarginTRADE
     * @param {string} symbol unified market symbol
     * @param {float} amount the amount of margin to remove
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} params.positionId the id of the position to reduce margin from, required
     * @returns {object} a [margin structure]{@link https://docs.ccxt.com/?id=margin-structure}
     */
    reduceMargin(symbol: string, amount: number, params?: {}): Promise<MarginModification>;
    /**
     * @method
     * @name weex#addMargin
     * @description add margin
     * @see https://www.weex.com/api-doc/contract/Account_API/AdjustPositionMarginTRADE
     * @param {string} symbol unified market symbol
     * @param {float} amount amount of margin to add
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} params.positionId the id of the position to add margin to, required
     * @returns {object} a [margin structure]{@link https://docs.ccxt.com/?id=margin-structure}
     */
    addMargin(symbol: string, amount: number, params?: {}): Promise<MarginModification>;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(code: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): any;
}
