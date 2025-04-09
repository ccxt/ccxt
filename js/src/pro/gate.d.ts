import gateRest from '../gate.js';
import type { Int, Str, Strings, OrderBook, Order, Trade, Ticker, Tickers, OHLCV, Position, Balances, Dict, Liquidation, OrderType, OrderSide, Num, Market, MarketType, OrderRequest } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class gate extends gateRest {
    describe(): any;
    /**
     * @method
     * @name gate#createOrderWs
     * @see https://www.gate.io/docs/developers/apiv4/ws/en/#order-place
     * @see https://www.gate.io/docs/developers/futures/ws/en/#order-place
     * @description Create an order on the exchange
     * @param {string} symbol Unified CCXT market symbol
     * @param {string} type 'limit' or 'market' *"market" is contract only*
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount the amount of currency to trade
     * @param {float} [price] *ignored in "market" orders* the price at which the order is to be fulfilled at in units of the quote currency
     * @param {object} [params]  extra parameters specific to the exchange API endpoint
     * @param {float} [params.stopPrice] The price at which a trigger order is triggered at
     * @param {string} [params.timeInForce] "GTC", "IOC", or "PO"
     * @param {float} [params.stopLossPrice] The price at which a stop loss order is triggered at
     * @param {float} [params.takeProfitPrice] The price at which a take profit order is triggered at
     * @param {string} [params.marginMode] 'cross' or 'isolated' - marginMode for margin trading if not provided this.options['defaultMarginMode'] is used
     * @param {int} [params.iceberg] Amount to display for the iceberg order, Null or 0 for normal orders, Set to -1 to hide the order completely
     * @param {string} [params.text] User defined information
     * @param {string} [params.account] *spot and margin only* "spot", "margin" or "cross_margin"
     * @param {bool} [params.auto_borrow] *margin only* Used in margin or cross margin trading to allow automatic loan of insufficient amount if balance is not enough
     * @param {string} [params.settle] *contract only* Unified Currency Code for settle currency
     * @param {bool} [params.reduceOnly] *contract only* Indicates if this order is to reduce the size of a position
     * @param {bool} [params.close] *contract only* Set as true to close the position, with size set to 0
     * @param {bool} [params.auto_size] *contract only* Set side to close dual-mode position, close_long closes the long side, while close_short the short one, size also needs to be set to 0
     * @param {int} [params.price_type] *contract only* 0 latest deal price, 1 mark price, 2 index price
     * @param {float} [params.cost] *spot market buy only* the quote quantity that can be used as an alternative for the amount
     * @returns {object|undefined} [An order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createOrderWs(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name gate#createOrdersWs
     * @description create a list of trade orders
     * @see https://www.gate.io/docs/developers/futures/ws/en/#order-batch-place
     * @param {Array} orders list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createOrdersWs(orders: OrderRequest[], params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name gate#cancelAllOrdersWs
     * @description cancel all open orders
     * @see https://www.gate.io/docs/developers/futures/ws/en/#cancel-all-open-orders-matched
     * @see https://www.gate.io/docs/developers/apiv4/ws/en/#order-cancel-all-with-specified-currency-pair
     * @param {string} symbol unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.channel] the channel to use, defaults to spot.order_cancel_cp or futures.order_cancel_cp
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelAllOrdersWs(symbol?: Str, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name gate#cancelOrderWs
     * @description Cancels an open order
     * @see https://www.gate.io/docs/developers/apiv4/ws/en/#order-cancel
     * @see https://www.gate.io/docs/developers/futures/ws/en/#order-cancel
     * @param {string} id Order id
     * @param {string} symbol Unified market symbol
     * @param {object} [params] Parameters specified by the exchange api
     * @param {bool} [params.trigger] True if the order to be cancelled is a trigger order
     * @returns An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrderWs(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name gate#editOrderWs
     * @description edit a trade order, gate currently only supports the modification of the price or amount fields
     * @see https://www.gate.io/docs/developers/apiv4/ws/en/#order-amend
     * @see https://www.gate.io/docs/developers/futures/ws/en/#order-amend
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of the currency you want to trade in units of the base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    editOrderWs(id: string, symbol: string, type: OrderType, side: OrderSide, amount?: Num, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name gate#fetchOrderWs
     * @description Retrieves information on an order
     * @see https://www.gate.io/docs/developers/apiv4/ws/en/#order-status
     * @see https://www.gate.io/docs/developers/futures/ws/en/#order-status
     * @param {string} id Order id
     * @param {string} symbol Unified market symbol, *required for spot and margin*
     * @param {object} [params] Parameters specified by the exchange api
     * @param {bool} [params.trigger] True if the order being fetched is a trigger order
     * @param {string} [params.marginMode] 'cross' or 'isolated' - marginMode for margin trading if not provided this.options['defaultMarginMode'] is used
     * @param {string} [params.type] 'spot', 'swap', or 'future', if not provided this.options['defaultMarginMode'] is used
     * @param {string} [params.settle] 'btc' or 'usdt' - settle currency for perpetual swap and future - market settle currency is used if symbol !== undefined, default="usdt" for swap and "btc" for future
     * @returns An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOrderWs(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name gate#fetchOpenOrdersWs
     * @description fetch all unfilled currently open orders
     * @see https://www.gate.io/docs/developers/futures/ws/en/#order-list
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of  open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOpenOrdersWs(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name gate#fetchClosedOrdersWs
     * @description fetches information on multiple closed orders made by the user
     * @see https://www.gate.io/docs/developers/futures/ws/en/#order-list
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchClosedOrdersWs(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name gate#fetchOrdersWs
     * @see https://www.gate.io/docs/developers/futures/ws/en/#order-list
     * @description fetches information on multiple orders made by the user by status
     * @param {string} status requested order status
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int|undefined} [since] the earliest time in ms to fetch orders for
     * @param {int|undefined} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.orderId] order id to begin at
     * @param {int} [params.limit] the maximum number of order structures to retrieve
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOrdersByStatusWs(status: string, symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<any>;
    /**
     * @method
     * @name gate#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    /**
     * @method
     * @name gate#unWatchOrderBook
     * @description unWatches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    unWatchOrderBook(symbol: string, params?: {}): Promise<any>;
    handleOrderBookSubscription(client: Client, message: any, subscription: any): void;
    handleOrderBook(client: Client, message: any): void;
    getCacheIndex(orderBook: any, cache: any): any;
    handleBidAsks(bookSide: any, bidAsks: any): void;
    handleDelta(orderbook: any, delta: any): void;
    /**
     * @method
     * @name gate#watchTicker
     * @see https://www.gate.io/docs/developers/apiv4/ws/en/#tickers-channel
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchTicker(symbol: string, params?: {}): Promise<Ticker>;
    /**
     * @method
     * @name gate#watchTickers
     * @see https://www.gate.io/docs/developers/apiv4/ws/en/#tickers-channel
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    handleTicker(client: Client, message: any): void;
    /**
     * @method
     * @name gate#watchBidsAsks
     * @see https://www.gate.io/docs/developers/apiv4/ws/en/#best-bid-or-ask-price
     * @see https://www.gate.io/docs/developers/apiv4/ws/en/#order-book-channel
     * @description watches best bid & ask for symbols
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchBidsAsks(symbols?: Strings, params?: {}): Promise<Tickers>;
    handleBidAsk(client: Client, message: any): void;
    subscribeWatchTickersAndBidsAsks(symbols?: Strings, callerMethodName?: Str, params?: {}): Promise<Tickers>;
    handleTickerAndBidAsk(objectName: string, client: Client, message: any): void;
    /**
     * @method
     * @name gate#watchTrades
     * @description get the list of most recent trades for a particular symbol
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name gate#watchTradesForSymbols
     * @description get the list of most recent trades for a particular symbol
     * @param {string[]} symbols unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    watchTradesForSymbols(symbols: string[], since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name gate#unWatchTradesForSymbols
     * @description get the list of most recent trades for a particular symbol
     * @param {string[]} symbols unified symbol of the market to fetch trades for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    unWatchTradesForSymbols(symbols: string[], params?: {}): Promise<any>;
    /**
     * @method
     * @name gate#unWatchTrades
     * @description get the list of most recent trades for a particular symbol
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    unWatchTrades(symbol: string, params?: {}): Promise<any>;
    handleTrades(client: Client, message: any): void;
    /**
     * @method
     * @name gate#watchOHLCV
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    watchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    handleOHLCV(client: Client, message: any): void;
    /**
     * @method
     * @name gate#watchMyTrades
     * @description watches information on multiple trades made by the user
     * @param {string} symbol unified market symbol of the market trades were made in
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    watchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    handleMyTrades(client: Client, message: any): void;
    /**
     * @method
     * @name gate#watchBalance
     * @description watch balance and get the amount of funds available for trading or funds locked in orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    watchBalance(params?: {}): Promise<Balances>;
    handleBalance(client: Client, message: any): void;
    /**
     * @method
     * @name gate#watchPositions
     * @see https://www.gate.io/docs/developers/futures/ws/en/#positions-subscription
     * @see https://www.gate.io/docs/developers/delivery/ws/en/#positions-subscription
     * @see https://www.gate.io/docs/developers/options/ws/en/#positions-channel
     * @description watch all open positions
     * @param {string[]} [symbols] list of unified market symbols to watch positions for
     * @param {int} [since] the earliest time in ms to fetch positions for
     * @param {int} [limit] the maximum number of positions to retrieve
     * @param {object} params extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/en/latest/manual.html#position-structure}
     */
    watchPositions(symbols?: Strings, since?: Int, limit?: Int, params?: {}): Promise<Position[]>;
    setPositionsCache(client: Client, type: any, symbols?: Strings): void;
    loadPositionsSnapshot(client: any, messageHash: any, type: any): Promise<void>;
    handlePositions(client: any, message: any): void;
    /**
     * @method
     * @name gate#watchOrders
     * @description watches information on multiple orders made by the user
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] spot, margin, swap, future, or option. Required if listening to all symbols.
     * @param {boolean} [params.isInverse] if future, listen to inverse or linear contracts
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    watchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    handleOrder(client: Client, message: any): void;
    /**
     * @method
     * @name gate#watchMyLiquidations
     * @description watch the public liquidations of a trading pair
     * @see https://www.gate.io/docs/developers/futures/ws/en/#liquidates-api
     * @see https://www.gate.io/docs/developers/delivery/ws/en/#liquidates-api
     * @see https://www.gate.io/docs/developers/options/ws/en/#liquidates-channel
     * @param {string} symbol unified CCXT market symbol
     * @param {int} [since] the earliest time in ms to fetch liquidations for
     * @param {int} [limit] the maximum number of liquidation structures to retrieve
     * @param {object} [params] exchange specific parameters for the bitmex api endpoint
     * @returns {object} an array of [liquidation structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#liquidation-structure}
     */
    watchMyLiquidations(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Liquidation[]>;
    /**
     * @method
     * @name gate#watchMyLiquidationsForSymbols
     * @description watch the private liquidations of a trading pair
     * @see https://www.gate.io/docs/developers/futures/ws/en/#liquidates-api
     * @see https://www.gate.io/docs/developers/delivery/ws/en/#liquidates-api
     * @see https://www.gate.io/docs/developers/options/ws/en/#liquidates-channel
     * @param {string[]} symbols unified CCXT market symbols
     * @param {int} [since] the earliest time in ms to fetch liquidations for
     * @param {int} [limit] the maximum number of liquidation structures to retrieve
     * @param {object} [params] exchange specific parameters for the gate api endpoint
     * @returns {object} an array of [liquidation structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#liquidation-structure}
     */
    watchMyLiquidationsForSymbols(symbols?: string[], since?: Int, limit?: Int, params?: {}): Promise<Liquidation[]>;
    handleLiquidation(client: Client, message: any): void;
    parseWsLiquidation(liquidation: any, market?: any): Liquidation;
    handleErrorMessage(client: Client, message: any): boolean;
    handleBalanceSubscription(client: Client, message: any, subscription?: any): void;
    handleSubscriptionStatus(client: Client, message: any): void;
    handleUnSubscribe(client: Client, message: any): void;
    cleanCache(subscription: Dict): void;
    handleMessage(client: Client, message: any): void;
    getUrlByMarket(market: any): any;
    getTypeByMarket(market: Market): "spot" | "futures" | "options";
    getUrlByMarketType(type: MarketType, isInverse?: boolean): any;
    getMarketTypeByUrl(url: string): any;
    requestId(): any;
    subscribePublic(url: any, messageHash: any, payload: any, channel: any, params?: {}, subscription?: any): Promise<any>;
    subscribePublicMultiple(url: any, messageHashes: any, payload: any, channel: any, params?: {}): Promise<any>;
    unSubscribePublicMultiple(url: any, topic: any, symbols: any, messageHashes: any, subMessageHashes: any, payload: any, channel: any, params?: {}): Promise<any>;
    authenticate(url: any, messageType: any): Promise<any>;
    handleAuthenticationMessage(client: Client, message: any): void;
    requestPrivate(url: any, reqParams: any, channel: any, requestId?: Str): Promise<any>;
    subscribePrivate(url: any, messageHash: any, payload: any, channel: any, params: any, requiresUid?: boolean): Promise<any>;
}
