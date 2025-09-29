import Exchange from './abstract/bybit.js';
import type { Int, OrderSide, OrderType, Trade, Order, OHLCV, FundingRateHistory, OpenInterest, OrderRequest, Balances, Str, Transaction, Ticker, OrderBook, Tickers, Greeks, Strings, Market, Currency, MarketInterface, TransferEntry, Liquidation, Leverage, Num, FundingHistory, Option, OptionChain, TradingFeeInterface, Currencies, TradingFees, CancellationRequest, Position, CrossBorrowRate, Dict, LeverageTier, LeverageTiers, int, LedgerEntry, Conversion, FundingRate, FundingRates, DepositAddress, LongShortRatio, BorrowInterest } from './base/types.js';
/**
 * @class bybit
 * @augments Exchange
 */
export default class bybit extends Exchange {
    describe(): any;
    /**
     * @method
     * @name bybit#enableDemoTrading
     * @description enables or disables demo trading mode
     * @see https://bybit-exchange.github.io/docs/v5/demo
     * @param {boolean} [enable] true if demo trading should be enabled, false otherwise
     */
    enableDemoTrading(enable: boolean): void;
    nonce(): number;
    addPaginationCursorToResult(response: any): any[];
    /**
     * @method
     * @name bybit#isUnifiedEnabled
     * @see https://bybit-exchange.github.io/docs/v5/user/apikey-info#http-request
     * @see https://bybit-exchange.github.io/docs/v5/account/account-info
     * @description returns [enableUnifiedMargin, enableUnifiedAccount] so the user can check if unified account is enabled
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {any} [enableUnifiedMargin, enableUnifiedAccount]
     */
    isUnifiedEnabled(params?: {}): Promise<any[]>;
    /**
     * @method
     * @name bybit#upgradeUnifiedTradeAccount
     * @description upgrades the account to unified trade account *warning* this is irreversible
     * @see https://bybit-exchange.github.io/docs/v5/account/upgrade-unified-account
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {any} nothing
     */
    upgradeUnifiedTradeAccount(params?: {}): Promise<any>;
    createExpiredOptionMarket(symbol: string): MarketInterface;
    safeMarket(marketId?: Str, market?: Market, delimiter?: Str, marketType?: Str): MarketInterface;
    getBybitType(method: any, market: any, params?: {}): any[];
    getAmount(symbol: string, amount: number): string;
    getPrice(symbol: string, price: string): string;
    getCost(symbol: string, cost: string): string;
    /**
     * @method
     * @name bybit#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @see https://bybit-exchange.github.io/docs/v5/market/time
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    fetchTime(params?: {}): Promise<Int>;
    /**
     * @method
     * @name bybit#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://bybit-exchange.github.io/docs/v5/asset/coin-info
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    fetchCurrencies(params?: {}): Promise<Currencies>;
    /**
     * @method
     * @name bybit#fetchMarkets
     * @description retrieves data on all markets for bybit
     * @see https://bybit-exchange.github.io/docs/v5/market/instrument
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    fetchMarkets(params?: {}): Promise<Market[]>;
    fetchSpotMarkets(params: any): Promise<Market[]>;
    fetchFutureMarkets(params: any): Promise<Market[]>;
    fetchOptionMarkets(params: any): Promise<Market[]>;
    parseTicker(ticker: Dict, market?: Market): Ticker;
    /**
     * @method
     * @name bybit#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://bybit-exchange.github.io/docs/v5/market/tickers
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    /**
     * @method
     * @name bybit#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://bybit-exchange.github.io/docs/v5/market/tickers
     * @param {string[]} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subType] *contract only* 'linear', 'inverse'
     * @param {string} [params.baseCoin] *option only* base coin, default is 'BTC'
     * @returns {object} an array of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    /**
     * @method
     * @name bybit#fetchBidsAsks
     * @description fetches the bid and ask price and volume for multiple markets
     * @see https://bybit-exchange.github.io/docs/v5/market/tickers
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the bids and asks for, all markets are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subType] *contract only* 'linear', 'inverse'
     * @param {string} [params.baseCoin] *option only* base coin, default is 'BTC'
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchBidsAsks(symbols?: Strings, params?: {}): Promise<Tickers>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    /**
     * @method
     * @name bybit#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://bybit-exchange.github.io/docs/v5/market/kline
     * @see https://bybit-exchange.github.io/docs/v5/market/mark-kline
     * @see https://bybit-exchange.github.io/docs/v5/market/index-kline
     * @see https://bybit-exchange.github.io/docs/v5/market/preimum-index-kline
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch orders for
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    parseFundingRate(ticker: any, market?: Market): FundingRate;
    /**
     * @method
     * @name bybit#fetchFundingRates
     * @description fetches funding rates for multiple markets
     * @see https://bybit-exchange.github.io/docs/v5/market/tickers
     * @param {string[]} symbols unified symbols of the markets to fetch the funding rates for, all market funding rates are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
     */
    fetchFundingRates(symbols?: Strings, params?: {}): Promise<FundingRates>;
    /**
     * @method
     * @name bybit#fetchFundingRateHistory
     * @description fetches historical funding rate prices
     * @see https://bybit-exchange.github.io/docs/v5/market/history-fund-rate
     * @param {string} symbol unified symbol of the market to fetch the funding rate history for
     * @param {int} [since] timestamp in ms of the earliest funding rate to fetch
     * @param {int} [limit] the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure} to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest funding rate
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure}
     */
    fetchFundingRateHistory(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<FundingRateHistory[]>;
    parseTrade(trade: Dict, market?: Market): Trade;
    /**
     * @method
     * @name bybit#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://bybit-exchange.github.io/docs/v5/market/recent-trade
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] market type, ['swap', 'option', 'spot']
     * @param {string} [params.subType] market subType, ['linear', 'inverse']
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name bybit#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://bybit-exchange.github.io/docs/v5/market/orderbook
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    parseBalance(response: any): Balances;
    /**
     * @method
     * @name bybit#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://bybit-exchange.github.io/docs/v5/spot-margin-normal/account-info
     * @see https://bybit-exchange.github.io/docs/v5/asset/all-balance
     * @see https://bybit-exchange.github.io/docs/v5/account/wallet-balance
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] wallet type, ['spot', 'swap', 'funding']
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    fetchBalance(params?: {}): Promise<Balances>;
    parseOrderStatus(status: Str): string;
    parseTimeInForce(timeInForce: Str): string;
    parseOrder(order: Dict, market?: Market): Order;
    /**
     * @method
     * @name bybit#createMarketBuyOrderWithCost
     * @description create a market buy order by providing the symbol and cost
     * @see https://bybit-exchange.github.io/docs/v5/order/create-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {float} cost how much you want to trade in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createMarketBuyOrderWithCost(symbol: string, cost: number, params?: {}): Promise<Order>;
    /**
     * @method
     * @name bybit#createMarkeSellOrderWithCost
     * @description create a market sell order by providing the symbol and cost
     * @see https://bybit-exchange.github.io/docs/v5/order/create-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {float} cost how much you want to trade in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createMarketSellOrderWithCost(symbol: string, cost: number, params?: {}): Promise<Order>;
    /**
     * @method
     * @name bybit#createOrder
     * @description create a trade order
     * @see https://bybit-exchange.github.io/docs/v5/order/create-order
     * @see https://bybit-exchange.github.io/docs/v5/position/trading-stop
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.timeInForce] "GTC", "IOC", "FOK"
     * @param {bool} [params.postOnly] true or false whether the order is post-only
     * @param {bool} [params.reduceOnly] true or false whether the order is reduce-only
     * @param {string} [params.positionIdx] *contracts only* 0 for one-way mode, 1 buy side of hedged mode, 2 sell side of hedged mode
     * @param {bool} [params.hedged] *contracts only* true for hedged mode, false for one way mode, default is false
     * @param {int} [params.isLeverage] *unified spot only* false then spot trading true then margin trading
     * @param {string} [params.tpslMode] *contract only* 'full' or 'partial'
     * @param {string} [params.mmp] *option only* market maker protection
     * @param {string} [params.triggerDirection] *contract only* the direction for trigger orders, 'ascending' or 'descending'
     * @param {float} [params.triggerPrice] The price at which a trigger order is triggered at
     * @param {float} [params.stopLossPrice] The price at which a stop loss order is triggered at
     * @param {float} [params.takeProfitPrice] The price at which a take profit order is triggered at
     * @param {object} [params.takeProfit] *takeProfit object in params* containing the triggerPrice at which the attached take profit order will be triggered
     * @param {float} [params.takeProfit.triggerPrice] take profit trigger price
     * @param {object} [params.stopLoss] *stopLoss object in params* containing the triggerPrice at which the attached stop loss order will be triggered
     * @param {float} [params.stopLoss.triggerPrice] stop loss trigger price
     * @param {string} [params.trailingAmount] the quote amount to trail away from the current market price
     * @param {string} [params.trailingTriggerPrice] the price to trigger a trailing order, default uses the price argument
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    createOrderRequest(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}, isUTA?: boolean): any;
    /**
     * @method
     * @name bybit#createOrders
     * @description create a list of trade orders
     * @see https://bybit-exchange.github.io/docs/v5/order/batch-place
     * @param {Array} orders list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createOrders(orders: OrderRequest[], params?: {}): Promise<Order[]>;
    editOrderRequest(id: string, symbol: string, type: OrderType, side: OrderSide, amount?: Num, price?: Num, params?: {}): Dict;
    /**
     * @method
     * @name bybit#editOrder
     * @description edit a trade order
     * @see https://bybit-exchange.github.io/docs/v5/order/amend-order
     * @see https://bybit-exchange.github.io/docs/derivatives/unified/replace-order
     * @see https://bybit-exchange.github.io/docs/api-explorer/derivatives/trade/contract/replace-order
     * @param {string} id cancel order id
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} price the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} [params.triggerPrice] The price that a trigger order is triggered at
     * @param {float} [params.stopLossPrice] The price that a stop loss order is triggered at
     * @param {float} [params.takeProfitPrice] The price that a take profit order is triggered at
     * @param {object} [params.takeProfit] *takeProfit object in params* containing the triggerPrice that the attached take profit order will be triggered
     * @param {float} [params.takeProfit.triggerPrice] take profit trigger price
     * @param {object} [params.stopLoss] *stopLoss object in params* containing the triggerPrice that the attached stop loss order will be triggered
     * @param {float} [params.stopLoss.triggerPrice] stop loss trigger price
     * @param {string} [params.triggerBy] 'IndexPrice', 'MarkPrice' or 'LastPrice', default is 'LastPrice', required if no initial value for triggerPrice
     * @param {string} [params.slTriggerBy] 'IndexPrice', 'MarkPrice' or 'LastPrice', default is 'LastPrice', required if no initial value for stopLoss
     * @param {string} [params.tpTriggerby] 'IndexPrice', 'MarkPrice' or 'LastPrice', default is 'LastPrice', required if no initial value for takeProfit
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    editOrder(id: string, symbol: string, type: OrderType, side: OrderSide, amount?: Num, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name bybit#editOrders
     * @description edit a list of trade orders
     * @see https://bybit-exchange.github.io/docs/v5/order/batch-amend
     * @param {Array} orders list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    editOrders(orders: OrderRequest[], params?: {}): Promise<Order[]>;
    cancelOrderRequest(id: string, symbol?: Str, params?: {}): any;
    /**
     * @method
     * @name bybit#cancelOrder
     * @description cancels an open order
     * @see https://bybit-exchange.github.io/docs/v5/order/cancel-order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.trigger] *spot only* whether the order is a trigger order
     * @param {boolean} [params.stop] alias for trigger
     * @param {string} [params.orderFilter] *spot only* 'Order' or 'StopOrder' or 'tpslOrder'
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name bybit#cancelOrders
     * @description cancel multiple orders
     * @see https://bybit-exchange.github.io/docs/v5/order/batch-cancel
     * @param {string[]} ids order ids
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string[]} [params.clientOrderIds] client order ids
     * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrders(ids: any, symbol?: Str, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name bybit#cancelAllOrdersAfter
     * @description dead man's switch, cancel all orders after the given timeout
     * @see https://bybit-exchange.github.io/docs/v5/order/dcp
     * @param {number} timeout time in milliseconds
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.product] OPTIONS, DERIVATIVES, SPOT, default is 'DERIVATIVES'
     * @returns {object} the api result
     */
    cancelAllOrdersAfter(timeout: Int, params?: {}): Promise<any>;
    /**
     * @method
     * @name bybit#cancelOrdersForSymbols
     * @description cancel multiple orders for multiple symbols
     * @see https://bybit-exchange.github.io/docs/v5/order/batch-cancel
     * @param {CancellationRequest[]} orders list of order ids with symbol, example [{"id": "a", "symbol": "BTC/USDT"}, {"id": "b", "symbol": "ETH/USDT"}]
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrdersForSymbols(orders: CancellationRequest[], params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name bybit#cancelAllOrders
     * @description cancel all open orders
     * @see https://bybit-exchange.github.io/docs/v5/order/cancel-all
     * @param {string} symbol unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.trigger] true if trigger order
     * @param {boolean} [params.stop] alias for trigger
     * @param {string} [params.type] market type, ['swap', 'option', 'spot']
     * @param {string} [params.subType] market subType, ['linear', 'inverse']
     * @param {string} [params.baseCoin] Base coin. Supports linear, inverse & option
     * @param {string} [params.settleCoin] Settle coin. Supports linear, inverse & option
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelAllOrders(symbol?: Str, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name bybit#fetchOrderClassic
     * @description fetches information on an order made by the user *classic accounts only*
     * @see https://bybit-exchange.github.io/docs/v5/order/order-list
     * @param {string} id the order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOrderClassic(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name bybit#fetchOrder
     * @description  *classic accounts only/ spot not supported*  fetches information on an order made by the user *classic accounts only*
     * @see https://bybit-exchange.github.io/docs/v5/order/order-list
     * @param {string} id the order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {object} [params.acknowledged] to suppress the warning, set to true
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    fetchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name bybit#fetchOrdersClassic
     * @description fetches information on multiple orders made by the user *classic accounts only*
     * @see https://bybit-exchange.github.io/docs/v5/order/order-list
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.trigger] true if trigger order
     * @param {boolean} [params.stop] alias for trigger
     * @param {string} [params.type] market type, ['swap', 'option', 'spot']
     * @param {string} [params.subType] market subType, ['linear', 'inverse']
     * @param {string} [params.orderFilter] 'Order' or 'StopOrder' or 'tpslOrder'
     * @param {int} [params.until] the latest time in ms to fetch entries for
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOrdersClassic(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name bybit#fetchClosedOrder
     * @description fetches information on a closed order made by the user
     * @see https://bybit-exchange.github.io/docs/v5/order/order-list
     * @param {string} id order id
     * @param {string} [symbol] unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.trigger] set to true for fetching a closed trigger order
     * @param {boolean} [params.stop] alias for trigger
     * @param {string} [params.type] market type, ['swap', 'option', 'spot']
     * @param {string} [params.subType] market subType, ['linear', 'inverse']
     * @param {string} [params.orderFilter] 'Order' or 'StopOrder' or 'tpslOrder'
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchClosedOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name bybit#fetchOpenOrder
     * @description fetches information on an open order made by the user
     * @see https://bybit-exchange.github.io/docs/v5/order/open-order
     * @param {string} id order id
     * @param {string} [symbol] unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.trigger] set to true for fetching an open trigger order
     * @param {boolean} [params.stop] alias for trigger
     * @param {string} [params.type] market type, ['swap', 'option', 'spot']
     * @param {string} [params.subType] market subType, ['linear', 'inverse']
     * @param {string} [params.baseCoin] Base coin. Supports linear, inverse & option
     * @param {string} [params.settleCoin] Settle coin. Supports linear, inverse & option
     * @param {string} [params.orderFilter] 'Order' or 'StopOrder' or 'tpslOrder'
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOpenOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name bybit#fetchCanceledAndClosedOrders
     * @description fetches information on multiple canceled and closed orders made by the user
     * @see https://bybit-exchange.github.io/docs/v5/order/order-list
     * @param {string} [symbol] unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.trigger] set to true for fetching trigger orders
     * @param {boolean} [params.stop] alias for trigger
     * @param {string} [params.type] market type, ['swap', 'option', 'spot']
     * @param {string} [params.subType] market subType, ['linear', 'inverse']
     * @param {string} [params.orderFilter] 'Order' or 'StopOrder' or 'tpslOrder'
     * @param {int} [params.until] the latest time in ms to fetch entries for
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchCanceledAndClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name bybit#fetchClosedOrders
     * @description fetches information on multiple closed orders made by the user
     * @see https://bybit-exchange.github.io/docs/v5/order/order-list
     * @param {string} [symbol] unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.trigger] set to true for fetching closed trigger orders
     * @param {boolean} [params.stop] alias for trigger
     * @param {string} [params.type] market type, ['swap', 'option', 'spot']
     * @param {string} [params.subType] market subType, ['linear', 'inverse']
     * @param {string} [params.orderFilter] 'Order' or 'StopOrder' or 'tpslOrder'
     * @param {int} [params.until] the latest time in ms to fetch entries for
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name bybit#fetchCanceledOrders
     * @description fetches information on multiple canceled orders made by the user
     * @see https://bybit-exchange.github.io/docs/v5/order/order-list
     * @param {string} [symbol] unified market symbol of the market orders were made in
     * @param {int} [since] timestamp in ms of the earliest order, default is undefined
     * @param {int} [limit] max number of orders to return, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.trigger] true if trigger order
     * @param {boolean} [params.stop] alias for trigger
     * @param {string} [params.type] market type, ['swap', 'option', 'spot']
     * @param {string} [params.subType] market subType, ['linear', 'inverse']
     * @param {string} [params.orderFilter] 'Order' or 'StopOrder' or 'tpslOrder'
     * @param {int} [params.until] the latest time in ms to fetch entries for
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchCanceledOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name bybit#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://bybit-exchange.github.io/docs/v5/order/open-order
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.trigger] set to true for fetching open trigger orders
     * @param {boolean} [params.stop] alias for trigger
     * @param {string} [params.type] market type, ['swap', 'option', 'spot']
     * @param {string} [params.subType] market subType, ['linear', 'inverse']
     * @param {string} [params.baseCoin] Base coin. Supports linear, inverse & option
     * @param {string} [params.settleCoin] Settle coin. Supports linear, inverse & option
     * @param {string} [params.orderFilter] 'Order' or 'StopOrder' or 'tpslOrder'
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name bybit#fetchOrderTrades
     * @description fetch all the trades made from a single order
     * @see https://bybit-exchange.github.io/docs/v5/position/execution
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
     * @name bybit#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://bybit-exchange.github.io/docs/api-explorer/v5/position/execution
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] market type, ['swap', 'option', 'spot']
     * @param {string} [params.subType] market subType, ['linear', 'inverse']
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseDepositAddress(depositAddress: any, currency?: Currency): DepositAddress;
    /**
     * @method
     * @name bybit#fetchDepositAddressesByNetwork
     * @description fetch a dictionary of addresses for a currency, indexed by network
     * @see https://bybit-exchange.github.io/docs/v5/asset/master-deposit-addr
     * @param {string} code unified currency code of the currency for the deposit address
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [address structures]{@link https://docs.ccxt.com/#/?id=address-structure} indexed by the network
     */
    fetchDepositAddressesByNetwork(code: string, params?: {}): Promise<DepositAddress[]>;
    /**
     * @method
     * @name bybit#fetchDepositAddress
     * @description fetch the deposit address for a currency associated with this account
     * @see https://bybit-exchange.github.io/docs/v5/asset/master-deposit-addr
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    fetchDepositAddress(code: string, params?: {}): Promise<DepositAddress>;
    /**
     * @method
     * @name bybit#fetchDeposits
     * @description fetch all deposits made to an account
     * @see https://bybit-exchange.github.io/docs/v5/asset/deposit-record
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch deposits for, default = 30 days before the current time
     * @param {int} [limit] the maximum number of deposits structures to retrieve, default = 50, max = 50
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch deposits for, default = 30 days after since
     * EXCHANGE SPECIFIC PARAMETERS
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @param {string} [params.cursor] used for pagination
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchDeposits(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    /**
     * @method
     * @name bybit#fetchWithdrawals
     * @description fetch all withdrawals made from an account
     * @see https://bybit-exchange.github.io/docs/v5/asset/withdraw-record
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of withdrawals structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch entries for
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    parseTransactionStatus(status: Str): string;
    parseTransaction(transaction: Dict, currency?: Currency): Transaction;
    /**
     * @method
     * @name bybit#fetchLedger
     * @description fetch the history of changes, actions done by the user or operations that altered the balance of the user
     * @see https://bybit-exchange.github.io/docs/v5/account/transaction-log
     * @see https://bybit-exchange.github.io/docs/v5/account/contract-transaction-log
     * @param {string} [code] unified currency code, default is undefined
     * @param {int} [since] timestamp in ms of the earliest ledger entry, default is undefined
     * @param {int} [limit] max number of ledger entries to return, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @param {string} [params.subType] if inverse will use v5/account/contract-transaction-log
     * @returns {object} a [ledger structure]{@link https://docs.ccxt.com/#/?id=ledger}
     */
    fetchLedger(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<LedgerEntry[]>;
    parseLedgerEntry(item: Dict, currency?: Currency): LedgerEntry;
    parseLedgerEntryType(type: any): string;
    /**
     * @method
     * @name bybit#withdraw
     * @description make a withdrawal
     * @see https://bybit-exchange.github.io/docs/v5/asset/withdraw
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} tag
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.accountType] 'UTA', 'FUND', 'FUND,UTA', and 'SPOT (for classic accounts only)
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    withdraw(code: string, amount: number, address: string, tag?: Str, params?: {}): Promise<Transaction>;
    /**
     * @method
     * @name bybit#fetchPosition
     * @description fetch data on a single open contract trade position
     * @see https://bybit-exchange.github.io/docs/v5/position
     * @param {string} symbol unified market symbol of the market the position is held in, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    fetchPosition(symbol: string, params?: {}): Promise<Position>;
    /**
     * @method
     * @name bybit#fetchPositions
     * @description fetch all open positions
     * @see https://bybit-exchange.github.io/docs/v5/position
     * @param {string[]} symbols list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] market type, ['swap', 'option', 'spot']
     * @param {string} [params.subType] market subType, ['linear', 'inverse']
     * @param {string} [params.baseCoin] Base coin. Supports linear, inverse & option
     * @param {string} [params.settleCoin] Settle coin. Supports linear, inverse & option
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    fetchPositions(symbols?: Strings, params?: {}): Promise<Position[]>;
    parsePosition(position: Dict, market?: Market): Position;
    /**
     * @method
     * @name bybit#fetchLeverage
     * @description fetch the set leverage for a market
     * @see https://bybit-exchange.github.io/docs/v5/position
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [leverage structure]{@link https://docs.ccxt.com/#/?id=leverage-structure}
     */
    fetchLeverage(symbol: string, params?: {}): Promise<Leverage>;
    parseLeverage(leverage: Dict, market?: Market): Leverage;
    /**
     * @method
     * @name bybit#setMarginMode
     * @description set margin mode (account) or trade mode (symbol)
     * @see https://bybit-exchange.github.io/docs/v5/account/set-margin-mode
     * @see https://bybit-exchange.github.io/docs/v5/position/cross-isolate
     * @param {string} marginMode account mode must be either [isolated, cross, portfolio], trade mode must be either [isolated, cross]
     * @param {string} symbol unified market symbol of the market the position is held in, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.leverage] the rate of leverage, is required if setting trade mode (symbol)
     * @returns {object} response from the exchange
     */
    setMarginMode(marginMode: string, symbol?: Str, params?: {}): Promise<any>;
    /**
     * @method
     * @name bybit#setLeverage
     * @description set the level of leverage for a market
     * @see https://bybit-exchange.github.io/docs/v5/position/leverage
     * @param {float} leverage the rate of leverage
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.buyLeverage] leverage for buy side
     * @param {string} [params.sellLeverage] leverage for sell side
     * @returns {object} response from the exchange
     */
    setLeverage(leverage: int, symbol?: Str, params?: {}): Promise<any>;
    /**
     * @method
     * @name bybit#setPositionMode
     * @description set hedged to true or false for a market
     * @see https://bybit-exchange.github.io/docs/v5/position/position-mode
     * @param {bool} hedged
     * @param {string} symbol used for unified account with inverse market
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} response from the exchange
     */
    setPositionMode(hedged: boolean, symbol?: Str, params?: {}): Promise<any>;
    fetchDerivativesOpenInterestHistory(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OpenInterest[]>;
    /**
     * @method
     * @name bybit#fetchOpenInterest
     * @description Retrieves the open interest of a derivative trading pair
     * @see https://bybit-exchange.github.io/docs/v5/market/open-interest
     * @param {string} symbol Unified CCXT market symbol
     * @param {object} [params] exchange specific parameters
     * @param {string} [params.interval] 5m, 15m, 30m, 1h, 4h, 1d
     * @param {string} [params.category] "linear" or "inverse"
     * @returns {object} an open interest structure{@link https://docs.ccxt.com/#/?id=open-interest-structure}
     */
    fetchOpenInterest(symbol: string, params?: {}): Promise<OpenInterest>;
    /**
     * @method
     * @name bybit#fetchOpenInterestHistory
     * @description Gets the total amount of unsettled contracts. In other words, the total number of contracts held in open positions
     * @see https://bybit-exchange.github.io/docs/v5/market/open-interest
     * @param {string} symbol Unified market symbol
     * @param {string} timeframe "5m", 15m, 30m, 1h, 4h, 1d
     * @param {int} [since] Not used by Bybit
     * @param {int} [limit] The number of open interest structures to return. Max 200, default 50
     * @param {object} [params] Exchange specific parameters
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns An array of open interest structures
     */
    fetchOpenInterestHistory(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OpenInterest[]>;
    parseOpenInterest(interest: any, market?: Market): OpenInterest;
    /**
     * @method
     * @name bybit#fetchCrossBorrowRate
     * @description fetch the rate of interest to borrow a currency for margin trading
     * @see https://bybit-exchange.github.io/docs/zh-TW/v5/spot-margin-normal/interest-quota
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
    /**
     * @method
     * @name bybit#fetchBorrowInterest
     * @description fetch the interest owed by the user for borrowing currency for margin trading
     * @see https://bybit-exchange.github.io/docs/zh-TW/v5/spot-margin-normal/account-info
     * @param {string} code unified currency code
     * @param {string} symbol unified market symbol when fetch interest in isolated markets
     * @param {number} [since] the earliest time in ms to fetch borrrow interest for
     * @param {number} [limit] the maximum number of structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [borrow interest structures]{@link https://docs.ccxt.com/#/?id=borrow-interest-structure}
     */
    fetchBorrowInterest(code?: Str, symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<BorrowInterest[]>;
    /**
     * @method
     * @name bybit#fetchBorrowRateHistory
     * @description retrieves a history of a currencies borrow interest rate at specific time slots
     * @see https://bybit-exchange.github.io/docs/v5/spot-margin-uta/historical-interest
     * @param {string} code unified currency code
     * @param {int} [since] timestamp for the earliest borrow rate
     * @param {int} [limit] the maximum number of [borrow rate structures]{@link https://docs.ccxt.com/#/?id=borrow-rate-structure} to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch entries for
     * @returns {object[]} an array of [borrow rate structures]{@link https://docs.ccxt.com/#/?id=borrow-rate-structure}
     */
    fetchBorrowRateHistory(code: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    parseBorrowInterest(info: Dict, market?: Market): BorrowInterest;
    /**
     * @method
     * @name bybit#transfer
     * @description transfer currency internally between wallets on the same account
     * @see https://bybit-exchange.github.io/docs/v5/asset/create-inter-transfer
     * @param {string} code unified currency code
     * @param {float} amount amount to transfer
     * @param {string} fromAccount account to transfer from
     * @param {string} toAccount account to transfer to
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.transferId] UUID, which is unique across the platform
     * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/#/?id=transfer-structure}
     */
    transfer(code: string, amount: number, fromAccount: string, toAccount: string, params?: {}): Promise<TransferEntry>;
    /**
     * @method
     * @name bybit#fetchTransfers
     * @description fetch a history of internal transfers made on an account
     * @see https://bybit-exchange.github.io/docs/v5/asset/inter-transfer-list
     * @param {string} code unified currency code of the currency transferred
     * @param {int} [since] the earliest time in ms to fetch transfers for
     * @param {int} [limit] the maximum number of transfer structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch entries for
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object[]} a list of [transfer structures]{@link https://docs.ccxt.com/#/?id=transfer-structure}
     */
    fetchTransfers(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<TransferEntry[]>;
    /**
     * @method
     * @name bybit#borrowCrossMargin
     * @description create a loan to borrow margin
     * @see https://bybit-exchange.github.io/docs/v5/spot-margin-normal/borrow
     * @param {string} code unified currency code of the currency to borrow
     * @param {float} amount the amount to borrow
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [margin loan structure]{@link https://docs.ccxt.com/#/?id=margin-loan-structure}
     */
    borrowCrossMargin(code: string, amount: number, params?: {}): Promise<any>;
    /**
     * @method
     * @name bybit#repayCrossMargin
     * @description repay borrowed margin and interest
     * @see https://bybit-exchange.github.io/docs/v5/spot-margin-normal/repay
     * @param {string} code unified currency code of the currency to repay
     * @param {float} amount the amount to repay
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [margin loan structure]{@link https://docs.ccxt.com/#/?id=margin-loan-structure}
     */
    repayCrossMargin(code: string, amount: any, params?: {}): Promise<any>;
    parseMarginLoan(info: any, currency?: Currency): Dict;
    parseTransferStatus(status: Str): Str;
    parseTransfer(transfer: Dict, currency?: Currency): TransferEntry;
    fetchDerivativesMarketLeverageTiers(symbol: string, params?: {}): Promise<LeverageTier[]>;
    /**
     * @method
     * @name bybit#fetchMarketLeverageTiers
     * @description retrieve information on the maximum leverage, and maintenance margin for trades of varying trade sizes for a single market
     * @see https://bybit-exchange.github.io/docs/v5/market/risk-limit
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [leverage tiers structure]{@link https://docs.ccxt.com/#/?id=leverage-tiers-structure}
     */
    fetchMarketLeverageTiers(symbol: string, params?: {}): Promise<LeverageTier[]>;
    parseTradingFee(fee: Dict, market?: Market): TradingFeeInterface;
    /**
     * @method
     * @name bybit#fetchTradingFee
     * @description fetch the trading fees for a market
     * @see https://bybit-exchange.github.io/docs/v5/account/fee-rate
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [fee structure]{@link https://docs.ccxt.com/#/?id=fee-structure}
     */
    fetchTradingFee(symbol: string, params?: {}): Promise<TradingFeeInterface>;
    /**
     * @method
     * @name bybit#fetchTradingFees
     * @description fetch the trading fees for multiple markets
     * @see https://bybit-exchange.github.io/docs/v5/account/fee-rate
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] market type, ['swap', 'option', 'spot']
     * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure} indexed by market symbols
     */
    fetchTradingFees(params?: {}): Promise<TradingFees>;
    parseDepositWithdrawFee(fee: any, currency?: Currency): any;
    /**
     * @method
     * @name bybit#fetchDepositWithdrawFees
     * @description fetch deposit and withdraw fees
     * @see https://bybit-exchange.github.io/docs/v5/asset/coin-info
     * @param {string[]} codes list of unified currency codes
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure}
     */
    fetchDepositWithdrawFees(codes?: Strings, params?: {}): Promise<any>;
    /**
     * @method
     * @name bybit#fetchSettlementHistory
     * @description fetches historical settlement records
     * @see https://bybit-exchange.github.io/docs/v5/market/delivery-price
     * @param {string} symbol unified market symbol of the settlement history
     * @param {int} [since] timestamp in ms
     * @param {int} [limit] number of records
     * @param {object} [params] exchange specific params
     * @param {string} [params.type] market type, ['swap', 'option', 'spot']
     * @param {string} [params.subType] market subType, ['linear', 'inverse']
     * @returns {object[]} a list of [settlement history objects]
     */
    fetchSettlementHistory(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<any>;
    /**
     * @method
     * @name bybit#fetchMySettlementHistory
     * @description fetches historical settlement records of the user
     * @see https://bybit-exchange.github.io/docs/v5/asset/delivery
     * @param {string} symbol unified market symbol of the settlement history
     * @param {int} [since] timestamp in ms
     * @param {int} [limit] number of records
     * @param {object} [params] exchange specific params
     * @param {string} [params.type] market type, ['swap', 'option', 'spot']
     * @param {string} [params.subType] market subType, ['linear', 'inverse']
     * @returns {object[]} a list of [settlement history objects]
     */
    fetchMySettlementHistory(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<any>;
    parseSettlement(settlement: any, market: any): {
        info: any;
        symbol: string;
        price: number;
        timestamp: number;
        datetime: string;
    };
    parseSettlements(settlements: any, market: any): any[];
    /**
     * @method
     * @name bybit#fetchVolatilityHistory
     * @description fetch the historical volatility of an option market based on an underlying asset
     * @see https://bybit-exchange.github.io/docs/v5/market/iv
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.period] the period in days to fetch the volatility for: 7,14,21,30,60,90,180,270
     * @returns {object[]} a list of [volatility history objects]{@link https://docs.ccxt.com/#/?id=volatility-structure}
     */
    fetchVolatilityHistory(code: string, params?: {}): Promise<any[]>;
    parseVolatilityHistory(volatility: any): any[];
    /**
     * @method
     * @name bybit#fetchGreeks
     * @description fetches an option contracts greeks, financial metrics used to measure the factors that affect the price of an options contract
     * @see https://bybit-exchange.github.io/docs/api-explorer/v5/market/tickers
     * @param {string} symbol unified symbol of the market to fetch greeks for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [greeks structure]{@link https://docs.ccxt.com/#/?id=greeks-structure}
     */
    fetchGreeks(symbol: string, params?: {}): Promise<Greeks>;
    /**
     * @method
     * @name bybit#fetchAllGreeks
     * @description fetches all option contracts greeks, financial metrics used to measure the factors that affect the price of an options contract
     * @see https://bybit-exchange.github.io/docs/api-explorer/v5/market/tickers
     * @param {string[]} [symbols] unified symbols of the markets to fetch greeks for, all markets are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.baseCoin] the baseCoin of the symbol, default is BTC
     * @returns {object} a [greeks structure]{@link https://docs.ccxt.com/#/?id=greeks-structure}
     */
    fetchAllGreeks(symbols?: Strings, params?: {}): Promise<Greeks[]>;
    parseGreeks(greeks: Dict, market?: Market): Greeks;
    /**
     * @method
     * @name bybit#fetchMyLiquidations
     * @description retrieves the users liquidated positions
     * @see https://bybit-exchange.github.io/docs/api-explorer/v5/position/execution
     * @param {string} [symbol] unified CCXT market symbol
     * @param {int} [since] the earliest time in ms to fetch liquidations for
     * @param {int} [limit] the maximum number of liquidation structures to retrieve
     * @param {object} [params] exchange specific parameters for the exchange API endpoint
     * @param {string} [params.type] market type, ['swap', 'option', 'spot']
     * @param {string} [params.subType] market subType, ['linear', 'inverse']
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object} an array of [liquidation structures]{@link https://docs.ccxt.com/#/?id=liquidation-structure}
     */
    fetchMyLiquidations(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Liquidation[]>;
    parseLiquidation(liquidation: any, market?: Market): Liquidation;
    getLeverageTiersPaginated(symbol?: Str, params?: {}): Promise<any>;
    /**
     * @method
     * @name bybit#fetchLeverageTiers
     * @description retrieve information on the maximum leverage, for different trade sizes
     * @see https://bybit-exchange.github.io/docs/v5/market/risk-limit
     * @param {string[]} [symbols] a list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subType] market subType, ['linear', 'inverse'], default is 'linear'
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object} a dictionary of [leverage tiers structures]{@link https://docs.ccxt.com/#/?id=leverage-tiers-structure}, indexed by market symbols
     */
    fetchLeverageTiers(symbols?: Strings, params?: {}): Promise<LeverageTiers>;
    parseLeverageTiers(response: any, symbols?: Strings, marketIdKey?: any): LeverageTiers;
    parseMarketLeverageTiers(info: any, market?: Market): LeverageTier[];
    /**
     * @method
     * @name bybit#fetchFundingHistory
     * @description fetch the history of funding payments paid and received on this account
     * @see https://bybit-exchange.github.io/docs/api-explorer/v5/position/execution
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch funding history for
     * @param {int} [limit] the maximum number of funding history structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object} a [funding history structure]{@link https://docs.ccxt.com/#/?id=funding-history-structure}
     */
    fetchFundingHistory(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<FundingHistory[]>;
    parseIncome(income: any, market?: Market): object;
    /**
     * @method
     * @name bybit#fetchOption
     * @description fetches option data that is commonly found in an option chain
     * @see https://bybit-exchange.github.io/docs/v5/market/tickers
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [option chain structure]{@link https://docs.ccxt.com/#/?id=option-chain-structure}
     */
    fetchOption(symbol: string, params?: {}): Promise<Option>;
    /**
     * @method
     * @name bybit#fetchOptionChain
     * @description fetches data for an underlying asset that is commonly found in an option chain
     * @see https://bybit-exchange.github.io/docs/v5/market/tickers
     * @param {string} code base currency to fetch an option chain for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [option chain structures]{@link https://docs.ccxt.com/#/?id=option-chain-structure}
     */
    fetchOptionChain(code: string, params?: {}): Promise<OptionChain>;
    parseOption(chain: Dict, currency?: Currency, market?: Market): Option;
    /**
     * @method
     * @name bybit#fetchPositionsHistory
     * @description fetches historical positions
     * @see https://bybit-exchange.github.io/docs/v5/position/close-pnl
     * @param {string[]} symbols a list of unified market symbols
     * @param {int} [since] timestamp in ms of the earliest position to fetch, params["until"] - since <= 7 days
     * @param {int} [limit] the maximum amount of records to fetch, default=50, max=100
     * @param {object} params extra parameters specific to the exchange api endpoint
     * @param {int} [params.until] timestamp in ms of the latest position to fetch, params["until"] - since <= 7 days
     * @param {string} [params.subType] 'linear' or 'inverse'
     * @returns {object[]} a list of [position structures]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    fetchPositionsHistory(symbols?: Strings, since?: Int, limit?: Int, params?: {}): Promise<Position[]>;
    /**
     * @method
     * @name bybit#fetchConvertCurrencies
     * @description fetches all available currencies that can be converted
     * @see https://bybit-exchange.github.io/docs/v5/asset/convert/convert-coin-list
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.accountType] eb_convert_uta, eb_convert_spot, eb_convert_funding, eb_convert_inverse, or eb_convert_contract
     * @returns {object} an associative dictionary of currencies
     */
    fetchConvertCurrencies(params?: {}): Promise<Currencies>;
    /**
     * @method
     * @name bybit#fetchConvertQuote
     * @description fetch a quote for converting from one currency to another
     * @see https://bybit-exchange.github.io/docs/v5/asset/convert/apply-quote
     * @param {string} fromCode the currency that you want to sell and convert from
     * @param {string} toCode the currency that you want to buy and convert into
     * @param {float} [amount] how much you want to trade in units of the from currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.accountType] eb_convert_uta, eb_convert_spot, eb_convert_funding, eb_convert_inverse, or eb_convert_contract
     * @returns {object} a [conversion structure]{@link https://docs.ccxt.com/#/?id=conversion-structure}
     */
    fetchConvertQuote(fromCode: string, toCode: string, amount?: Num, params?: {}): Promise<Conversion>;
    /**
     * @method
     * @name bybit#createConvertTrade
     * @description convert from one currency to another
     * @see https://bybit-exchange.github.io/docs/v5/asset/convert/confirm-quote
     * @param {string} id the id of the trade that you want to make
     * @param {string} fromCode the currency that you want to sell and convert from
     * @param {string} toCode the currency that you want to buy and convert into
     * @param {float} amount how much you want to trade in units of the from currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [conversion structure]{@link https://docs.ccxt.com/#/?id=conversion-structure}
     */
    createConvertTrade(id: string, fromCode: string, toCode: string, amount?: Num, params?: {}): Promise<Conversion>;
    /**
     * @method
     * @name bybit#fetchConvertTrade
     * @description fetch the data for a conversion trade
     * @see https://bybit-exchange.github.io/docs/v5/asset/convert/get-convert-result
     * @param {string} id the id of the trade that you want to fetch
     * @param {string} [code] the unified currency code of the conversion trade
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.accountType] eb_convert_uta, eb_convert_spot, eb_convert_funding, eb_convert_inverse, or eb_convert_contract
     * @returns {object} a [conversion structure]{@link https://docs.ccxt.com/#/?id=conversion-structure}
     */
    fetchConvertTrade(id: string, code?: Str, params?: {}): Promise<Conversion>;
    /**
     * @method
     * @name bybit#fetchConvertTradeHistory
     * @description fetch the users history of conversion trades
     * @see https://bybit-exchange.github.io/docs/v5/asset/convert/get-convert-history
     * @param {string} [code] the unified currency code
     * @param {int} [since] the earliest time in ms to fetch conversions for
     * @param {int} [limit] the maximum number of conversion structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.accountType] eb_convert_uta, eb_convert_spot, eb_convert_funding, eb_convert_inverse, or eb_convert_contract
     * @returns {object[]} a list of [conversion structures]{@link https://docs.ccxt.com/#/?id=conversion-structure}
     */
    fetchConvertTradeHistory(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Conversion[]>;
    parseConversion(conversion: Dict, fromCurrency?: Currency, toCurrency?: Currency): Conversion;
    /**
     * @method
     * @name bybit#fetchLongShortRatioHistory
     * @description fetches the long short ratio history for a unified market symbol
     * @see https://bybit-exchange.github.io/docs/v5/market/long-short-ratio
     * @param {string} symbol unified symbol of the market to fetch the long short ratio for
     * @param {string} [timeframe] the period for the ratio, default is 24 hours
     * @param {int} [since] the earliest time in ms to fetch ratios for
     * @param {int} [limit] the maximum number of long short ratio structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of [long short ratio structures]{@link https://docs.ccxt.com/#/?id=long-short-ratio-structure}
     */
    fetchLongShortRatioHistory(symbol?: Str, timeframe?: Str, since?: Int, limit?: Int, params?: {}): Promise<LongShortRatio[]>;
    parseLongShortRatio(info: Dict, market?: Market): LongShortRatio;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(httpCode: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): any;
}
