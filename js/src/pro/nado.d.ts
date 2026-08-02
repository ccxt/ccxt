import nadoRest from '../nado.js';
import type { Bool, Dict, Int, Market, Num, OHLCV, Order, OrderBook, OrderSide, OrderType, Position, Str, Strings, Ticker, Tickers, Trade } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class nado extends nadoRest {
    describe(): any;
    requestId(): Int;
    /**
     * @method
     * @name nado#watchTrades
     * @see https://docs.nado.xyz/developer-resources/api/subscriptions/streams
     * @description watches information on multiple trades made in a market
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum number of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name nado#unWatchTrades
     * @see https://docs.nado.xyz/developer-resources/api/subscriptions/streams
     * @description unWatches information on multiple trades made in a market
     * @param {string} symbol unified symbol of the market to unwatch trades for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} the exchange response
     */
    unWatchTrades(symbol: string, params?: {}): Promise<any>;
    /**
     * @method
     * @name nado#watchTradesForSymbols
     * @see https://docs.nado.xyz/developer-resources/api/subscriptions/streams
     * @description get the list of most recent trades for a list of symbols
     * @param {string[]} symbols unified symbols of the markets to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum number of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    watchTradesForSymbols(symbols: string[], since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name nado#unWatchTradesForSymbols
     * @see https://docs.nado.xyz/developer-resources/api/subscriptions/streams
     * @description unWatches information on multiple trades made in a list of markets
     * @param {string[]} symbols unified symbols of the markets to unwatch trades for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} the exchange response
     */
    unWatchTradesForSymbols(symbols: string[], params?: {}): Promise<any>;
    /**
     * @method
     * @name nado#watchOrderBook
     * @see https://docs.nado.xyz/developer-resources/api/subscriptions/streams
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {OrderBook} an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
     */
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    /**
     * @method
     * @name nado#unWatchOrderBook
     * @see https://docs.nado.xyz/developer-resources/api/subscriptions/streams
     * @description unWatches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @param {string} symbol unified symbol of the market to unwatch the order book for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} the exchange response
     */
    unWatchOrderBook(symbol: string, params?: {}): Promise<any>;
    /**
     * @method
     * @name nado#watchOrderBookForSymbols
     * @see https://docs.nado.xyz/developer-resources/api/subscriptions/streams
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data for a list of symbols
     * @param {string[]} symbols unified symbols of the markets to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {OrderBook} an [order book structure]{@link https://docs.ccxt.com/#/?id=order-book-structure}
     */
    watchOrderBookForSymbols(symbols: string[], limit?: Int, params?: {}): Promise<OrderBook>;
    /**
     * @method
     * @name nado#unWatchOrderBookForSymbols
     * @see https://docs.nado.xyz/developer-resources/api/subscriptions/streams
     * @description unWatches information on open orders with bid (buy) and ask (sell) prices, volumes and other data for a list of symbols
     * @param {string[]} symbols unified symbols of the markets to unwatch the order book for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} the exchange response
     */
    unWatchOrderBookForSymbols(symbols: string[], params?: {}): Promise<any>;
    /**
     * @method
     * @name nado#watchOHLCV
     * @see https://docs.nado.xyz/developer-resources/api/subscriptions/streams
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    watchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    /**
     * @method
     * @name nado#watchOHLCVForSymbols
     * @see https://docs.nado.xyz/developer-resources/api/subscriptions/streams
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of multiple markets
     * @param {string[][]} symbolsAndTimeframes array of arrays containing unified symbols and timeframes to watch OHLCV data for, example [['BTC/USDT0:USDT0', '1m'], ['ETH/USDT0:USDT0', '5m']]
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of {@link https://docs.ccxt.com/#/?id=ohlcv-structure OHLCV} structures indexed by market symbols
     */
    watchOHLCVForSymbols(symbolsAndTimeframes: string[][], since?: Int, limit?: Int, params?: {}): Promise<import("../base/types.js").Dictionary<import("../base/types.js").Dictionary<OHLCV[]>>>;
    /**
     * @method
     * @name nado#unWatchOHLCV
     * @see https://docs.nado.xyz/developer-resources/api/subscriptions/streams
     * @description unWatches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @param {string} symbol unified symbol of the market to unwatch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} the exchange response
     */
    unWatchOHLCV(symbol: string, timeframe?: string, params?: {}): Promise<any>;
    /**
     * @method
     * @name nado#unWatchOHLCVForSymbols
     * @see https://docs.nado.xyz/developer-resources/api/subscriptions/streams
     * @description unWatches historical candlestick data containing the open, high, low, and close price, and the volume of multiple markets
     * @param {string[][]} symbolsAndTimeframes array of arrays containing unified symbols and timeframes to unwatch OHLCV data for, example [['BTC/USDT0:USDT0', '1m'], ['ETH/USDT0:USDT0', '5m']]
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} the exchange response
     */
    unWatchOHLCVForSymbols(symbolsAndTimeframes: string[][], params?: {}): Promise<any>;
    /**
     * @method
     * @name nado#watchTicker
     * @see https://docs.nado.xyz/developer-resources/api/subscriptions/streams
     * @description watches a price ticker with the best bid and ask for a specific market
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchTicker(symbol: string, params?: {}): Promise<Ticker>;
    /**
     * @method
     * @name nado#unWatchTicker
     * @see https://docs.nado.xyz/developer-resources/api/subscriptions/streams
     * @description unWatches a price ticker with the best bid and ask for a specific market
     * @param {string} symbol unified symbol of the market to unwatch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} the exchange response
     */
    unWatchTicker(symbol: string, params?: {}): Promise<any>;
    /**
     * @method
     * @name nado#watchTickers
     * @see https://docs.nado.xyz/developer-resources/api/subscriptions/streams
     * @description watches price tickers with the best bid and ask for all markets of a specific list
     * @param {string[]} [symbols] unified symbols of the markets to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    /**
     * @method
     * @name nado#unWatchTickers
     * @see https://docs.nado.xyz/developer-resources/api/subscriptions/streams
     * @description unWatches price tickers with the best bid and ask for all markets of a specific list
     * @param {string[]} [symbols] unified symbols of the markets to unwatch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} the exchange response
     */
    unWatchTickers(symbols?: Strings, params?: {}): Promise<any>;
    /**
     * @method
     * @name nado#watchBidsAsks
     * @see https://docs.nado.xyz/developer-resources/api/subscriptions/streams
     * @description watches best bid & ask for symbols
     * @param {string[]} symbols unified symbols of the markets to fetch the bids and asks for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchBidsAsks(symbols?: Strings, params?: {}): Promise<Tickers>;
    /**
     * @method
     * @name nado#unWatchBidsAsks
     * @see https://docs.nado.xyz/developer-resources/api/subscriptions/streams
     * @description unWatches best bid & ask for symbols
     * @param {string[]} symbols unified symbols of the markets to unwatch the bids and asks for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} the exchange response
     */
    unWatchBidsAsks(symbols?: Strings, params?: {}): Promise<any>;
    /**
     * @method
     * @name nado#watchOrders
     * @see https://docs.nado.xyz/developer-resources/api/subscriptions/authentication
     * @see https://docs.nado.xyz/developer-resources/api/subscriptions/streams
     * @see https://docs.nado.xyz/developer-resources/api/subscriptions/events
     * @description watches information on multiple orders made by the user
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    watchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name nado#unWatchOrders
     * @see https://docs.nado.xyz/developer-resources/api/subscriptions/authentication
     * @see https://docs.nado.xyz/developer-resources/api/subscriptions/streams
     * @description unWatches information on multiple orders made by the user
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} the exchange response
     */
    unWatchOrders(symbol?: Str, params?: {}): Promise<any>;
    /**
     * @method
     * @name nado#watchMyTrades
     * @see https://docs.nado.xyz/developer-resources/api/subscriptions/authentication
     * @see https://docs.nado.xyz/developer-resources/api/subscriptions/streams
     * @see https://docs.nado.xyz/developer-resources/api/subscriptions/events
     * @description watches information on multiple trades made by the user
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    watchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name nado#unWatchMyTrades
     * @see https://docs.nado.xyz/developer-resources/api/subscriptions/authentication
     * @see https://docs.nado.xyz/developer-resources/api/subscriptions/streams
     * @description unWatches information on multiple trades made by the user
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} the exchange response
     */
    unWatchMyTrades(symbol?: Str, params?: {}): Promise<any>;
    /**
     * @method
     * @name nado#watchPositions
     * @see https://docs.nado.xyz/developer-resources/api/subscriptions/authentication
     * @see https://docs.nado.xyz/developer-resources/api/subscriptions/streams
     * @see https://docs.nado.xyz/developer-resources/api/subscriptions/events
     * @description watches information on user positions
     * @param {string[]} [symbols] unified market symbols
     * @param {int} [since] the earliest time in ms to fetch positions for
     * @param {int} [limit] the maximum number of position structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structures]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    watchPositions(symbols?: Strings, since?: Int, limit?: Int, params?: {}): Promise<Position[]>;
    /**
     * @method
     * @name nado#unWatchPositions
     * @see https://docs.nado.xyz/developer-resources/api/subscriptions/authentication
     * @see https://docs.nado.xyz/developer-resources/api/subscriptions/streams
     * @description unWatches information on user positions
     * @param {string[]} [symbols] unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} the exchange response
     */
    unWatchPositions(symbols?: Strings, params?: {}): Promise<any>;
    /**
     * @method
     * @name nado#createOrderWs
     * @description create a trade order over the v2 gateway WebSocket
     * @see https://docs.nado.xyz/developer-resources/api/gateway/websocket-v2
     * @see https://docs.nado.xyz/developer-resources/api/gateway/executes/place-order
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
     * @param {int} [params.id] client-provided request id used to correlate the out-of-order v2 response, autogenerated when omitted
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createOrderWs(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name nado#editOrderWs
     * @description edit a trade order over the v2 gateway WebSocket
     * @see https://docs.nado.xyz/developer-resources/api/gateway/websocket-v2
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
     * @param {int} [params.id] client-provided request id used to correlate the out-of-order v2 response, autogenerated when omitted
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    editOrderWs(id: string, symbol: string, type: OrderType, side: OrderSide, amount?: Num, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name nado#cancelOrderWs
     * @description cancels an open order over the v2 gateway WebSocket
     * @see https://docs.nado.xyz/developer-resources/api/gateway/websocket-v2
     * @see https://docs.nado.xyz/developer-resources/api/gateway/executes/cancel-orders
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subaccount] the 12-byte subaccount identifier, defaults to 'default'
     * @param {string} [params.requiredUnfilledAmount] cancel only if the order's absolute remaining unfilled amount matches this amount, exchange-specific raw x18 alias params.required_unfilled_amount
     * @param {int} [params.id] client-provided request id used to correlate the out-of-order v2 response, autogenerated when omitted
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    cancelOrderWs(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name nado#cancelOrdersWs
     * @description cancel multiple orders over the v2 gateway WebSocket
     * @see https://docs.nado.xyz/developer-resources/api/gateway/websocket-v2
     * @see https://docs.nado.xyz/developer-resources/api/gateway/executes/cancel-orders
     * @param {string[]} ids order ids
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subaccount] the 12-byte subaccount identifier, defaults to 'default'
     * @param {string} [params.requiredUnfilledAmount] cancel only if the order's absolute remaining unfilled amount matches this amount, exchange-specific raw x18 alias params.required_unfilled_amount
     * @param {int} [params.id] client-provided request id used to correlate the out-of-order v2 response, autogenerated when omitted
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    cancelOrdersWs(ids: string[], symbol?: Str, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name nado#cancelAllOrdersWs
     * @description cancel all open orders over the v2 gateway WebSocket
     * @see https://docs.nado.xyz/developer-resources/api/gateway/websocket-v2
     * @see https://docs.nado.xyz/developer-resources/api/gateway/executes/cancel-product-orders
     * @param {string} [symbol] unified market symbol, when undefined all orders for all products are canceled
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subaccount] the 12-byte subaccount identifier, defaults to 'default'
     * @param {int} [params.id] client-provided request id used to correlate the out-of-order v2 response, autogenerated when omitted
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    cancelAllOrdersWs(symbol?: Str, params?: {}): Promise<Order[]>;
    watchExecuteRequest(requestIdString: Str, request: any): Promise<any>;
    watchPublic(streamType: any, market: any, messageHash: string, params?: {}): Promise<any>;
    watchPrivate(streamType: any, stream: any, messageHash: string, params?: {}): Promise<any>;
    unWatchPrivate(stream: any, messageHash: string, params?: {}): Promise<any>;
    authenticate(params?: {}): Promise<any>;
    signStreamAuthentication(tx: any, chainId: any, endpointAddress: string): string;
    createPublicSubscriptionRequest(method: string, streamType: any, market?: undefined, id?: Int, params?: {}): {
        method: string;
        stream: any;
        id: Int;
    };
    watchPublicMultiple(streamType: any, markets: any, messageHashes: string[], params?: {}, subscriptionParams?: any): Promise<any>;
    unWatchPublic(streamType: any, market: any, messageHash: string, params?: {}): Promise<any>;
    unWatchPublicMultiple(streamType: any, markets: any, messageHashes: string[], params?: {}, subscriptionParams?: any): Promise<any[]>;
    parseWsTimestamp(message: Dict, key: string): Int;
    parseWsTrade(trade: Dict, market?: Market): Trade;
    parseWsMyTrade(trade: Dict, market?: Market): Trade;
    handleTrade(client: Client, message: any): void;
    handleMyTrade(client: Client, message: any): void;
    handleOHLCV(client: Client, message: any): void;
    parseWsOrder(order: Dict, market?: Market): Order;
    handleOrder(client: Client, message: any): void;
    parseWsPosition(position: Dict, market?: Market): Position;
    handlePosition(client: Client, message: any): void;
    parseWsBidAsk(bidask: Dict, market?: Market): Ticker;
    handleBidAsk(client: Client, message: any): void;
    parseWsAllBidsAsks(message: Dict): Tickers;
    handleAllBidsAsks(client: Client, message: any): void;
    handleDelta(bookside: any, delta: any): void;
    handleOrderBook(client: Client, message: any): void;
    handleExecuteResponse(client: Client, message: any): void;
    handleSubscription(client: Client, message: any): void;
    handleAuthentication(client: Client, message: any): void;
    handleUnsubscription(client: Client, message: any): void;
    handleUnsubscriptionCache(messageHash: Str): void;
    ping(client: Client): {
        method: string;
        id: Int;
        client_time: string;
    } | undefined;
    handlePong(client: Client, message: any): any;
    handleErrorMessage(client: Client, message: any): Bool;
    handleMessage(client: Client, message: any): void;
}
