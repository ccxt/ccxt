import oxfunRest from '../oxfun.js';
import type { Balances, Int, Market, Num, OHLCV, Order, OrderBook, OrderSide, OrderType, Position, Str, Strings, Ticker, Tickers, Trade } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class oxfun extends oxfunRest {
    describe(): any;
    subscribeMultiple(messageHashes: any, argsArray: any, params?: {}): Promise<any>;
    /**
     * @method
     * @name oxfun#watchTrades
     * @description watches information on multiple trades made in a market
     * @see https://docs.ox.fun/?json#trade
     * @param {string} symbol unified market symbol of the market trades were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int|string} [params.tag] If given it will be echoed in the reply and the max size of tag is 32
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name oxfun#watchTradesForSymbols
     * @description get the list of most recent trades for a particular symbol
     * @see https://docs.ox.fun/?json#trade
     * @param {string[]} symbols
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int|string} [params.tag] If given it will be echoed in the reply and the max size of tag is 32
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    watchTradesForSymbols(symbols: string[], since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    handleTrades(client: Client, message: any): void;
    parseWsTrade(trade: any, market?: any): Trade;
    /**
     * @method
     * @name oxfun#watchOHLCV
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://docs.ox.fun/?json#candles
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int|string} [params.tag] If given it will be echoed in the reply and the max size of tag is 32
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    watchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    /**
     * @method
     * @name oxfun#watchOHLCVForSymbols
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://docs.ox.fun/?json#candles
     * @param {string[][]} symbolsAndTimeframes array of arrays containing unified symbols and timeframes to fetch OHLCV data for, example [['BTC/USDT', '1m'], ['LTC/USDT', '5m']]
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int|string} [params.tag] If given it will be echoed in the reply and the max size of tag is 32
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    watchOHLCVForSymbols(symbolsAndTimeframes: string[][], since?: Int, limit?: Int, params?: {}): Promise<import("../base/types.js").Dictionary<import("../base/types.js").Dictionary<OHLCV[]>>>;
    handleOHLCV(client: Client, message: any): void;
    parseWsOHLCV(ohlcv: any, market?: Market): OHLCV;
    /**
     * @method
     * @name oxfun#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.ox.fun/?json#fixed-size-order-book
     * @see https://docs.ox.fun/?json#full-order-book
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    /**
     * @method
     * @name oxfun#watchOrderBookForSymbols
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.ox.fun/?json#fixed-size-order-book
     * @see https://docs.ox.fun/?json#full-order-book
     * @param {string[]} symbols unified array of symbols
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int|string} [params.tag] If given it will be echoed in the reply and the max size of tag is 32
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    watchOrderBookForSymbols(symbols: string[], limit?: Int, params?: {}): Promise<OrderBook>;
    handleOrderBook(client: Client, message: any): void;
    /**
     * @method
     * @name oxfun#watchTicker
     * @see https://docs.ox.fun/?json#ticker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int|string} [params.tag] If given it will be echoed in the reply and the max size of tag is 32
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchTicker(symbol: string, params?: {}): Promise<Ticker>;
    /**
     * @method
     * @name oxfun#watchTickers
     * @see https://docs.ox.fun/?json#ticker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @param {string[]} [symbols] unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int|string} [params.tag] If given it will be echoed in the reply and the max size of tag is 32
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    handleTicker(client: Client, message: any): void;
    /**
     * @method
     * @name oxfun#watchBidsAsks
     * @see https://docs.ox.fun/?json#best-bid-ask
     * @description watches best bid & ask for symbols
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchBidsAsks(symbols?: Strings, params?: {}): Promise<Tickers>;
    handleBidAsk(client: Client, message: any): void;
    parseWsBidAsk(ticker: any, market?: any): Ticker;
    /**
     * @method
     * @name oxfun#watchBalance
     * @see https://docs.ox.fun/?json#balance-channel
     * @description watch balance and get the amount of funds available for trading or funds locked in orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int|string} [params.tag] If given it will be echoed in the reply and the max size of tag is 32
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    watchBalance(params?: {}): Promise<Balances>;
    handleBalance(client: any, message: any): void;
    /**
     * @method
     * @name oxfun#watchPositions
     * @see https://docs.ox.fun/?json#position-channel
     * @description watch all open positions
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param since
     * @param limit
     * @param {object} params extra parameters specific to the exchange API endpoint
     * @param {int|string} [params.tag] If given it will be echoed in the reply and the max size of tag is 32
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/en/latest/manual.html#position-structure}
     */
    watchPositions(symbols?: Strings, since?: Int, limit?: Int, params?: {}): Promise<Position[]>;
    handlePositions(client: Client, message: any): void;
    parseWsPosition(position: any, market?: Market): Position;
    /**
     * @method
     * @name oxfun#watchOrders
     * @description watches information on multiple orders made by the user
     * @see https://docs.ox.fun/?json#order-channel
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int|string} [params.tag] If given it will be echoed in the reply and the max size of tag is 32
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    watchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    handleOrders(client: Client, message: any): void;
    /**
     * @method
     * @name oxfun#createOrderWs
     * @see https://docs.ox.fun/?json#order-commands
     * @description create a trade order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market', 'limit', 'STOP_LIMIT' or 'STOP_MARKET'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.clientOrderId] a unique id for the order
     * @param {int} [params.timestamp] in milliseconds. If an order reaches the matching engine and the current timestamp exceeds timestamp + recvWindow, then the order will be rejected.
     * @param {int} [params.recvWindow] in milliseconds. If an order reaches the matching engine and the current timestamp exceeds timestamp + recvWindow, then the order will be rejected. If timestamp is provided without recvWindow, then a default recvWindow of 1000ms is used.
     * @param {float} [params.cost] the quote quantity that can be used as an alternative for the amount for market buy orders
     * @param {float} [params.triggerPrice] The price at which a trigger order is triggered at
     * @param {float} [params.limitPrice] Limit price for the STOP_LIMIT order
     * @param {bool} [params.postOnly] if true, the order will only be posted if it will be a maker order
     * @param {string} [params.timeInForce] GTC (default), IOC, FOK, PO, MAKER_ONLY or MAKER_ONLY_REPRICE (reprices order to the best maker only price if the specified price were to lead to a taker trade)
     * @param {string} [params.selfTradePreventionMode] NONE, EXPIRE_MAKER, EXPIRE_TAKER or EXPIRE_BOTH for more info check here {@link https://docs.ox.fun/?json#self-trade-prevention-modes}
     * @param {string} [params.displayQuantity] for an iceberg order, pass both quantity and displayQuantity fields in the order request
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createOrderWs(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name oxfun#editOrderWs
     * @description edit a trade order
     * @see https://docs.ox.fun/?json#modify-order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of the currency you want to trade in units of the base currency
     * @param {float|undefined} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.timestamp] in milliseconds. If an order reaches the matching engine and the current timestamp exceeds timestamp + recvWindow, then the order will be rejected.
     * @param {int} [params.recvWindow] in milliseconds. If an order reaches the matching engine and the current timestamp exceeds timestamp + recvWindow, then the order will be rejected. If timestamp is provided without recvWindow, then a default recvWindow of 1000ms is used.
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    editOrderWs(id: string, symbol: string, type: OrderType, side: OrderSide, amount?: Num, price?: Num, params?: {}): Promise<Order>;
    handlePlaceOrders(client: Client, message: any): void;
    /**
     * @method
     * @name oxfun#cancelOrderWs
     * @see https://docs.ox.fun/?json#cancel-order
     * @description cancels an open order
     * @param {string} id order id
     * @param {string} symbol unified market symbol, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrderWs(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name okx#cancelOrdersWs
     * @see https://www.okx.com/docs-v5/en/#order-book-trading-trade-ws-mass-cancel-order
     * @description cancel multiple orders
     * @param {string[]} ids order ids
     * @param {string} symbol unified market symbol, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrdersWs(ids: string[], symbol?: Str, params?: {}): Promise<any>;
    authenticate(params?: {}): Promise<any>;
    handleAuthenticationMessage(client: Client, message: any): void;
    ping(client: Client): string;
    handlePong(client: Client, message: any): any;
    handleMessage(client: Client, message: any): void;
}
