import bybitRest from '../bybit.js';
import type { Int, OHLCV, Str, Strings, Ticker, OrderBook, Order, Trade, Tickers, Position, Balances, OrderType, OrderSide, Num, Liquidation } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class bybit extends bybitRest {
    describe(): any;
    requestId(): any;
    getUrlByMarketType(symbol?: Str, isPrivate?: boolean, method?: Str, params?: {}): Promise<any>;
    cleanParams(params: any): any;
    /**
     * @method
     * @name bybit#createOrderWs
     * @description create a trade order
     * @see https://bybit-exchange.github.io/docs/v5/order/create-order
     * @see https://bybit-exchange.github.io/docs/v5/websocket/trade/guideline#createamendcancel-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.timeInForce] "GTC", "IOC", "FOK"
     * @param {bool} [params.postOnly] true or false whether the order is post-only
     * @param {bool} [params.reduceOnly] true or false whether the order is reduce-only
     * @param {string} [params.positionIdx] *contracts only*  0 for one-way mode, 1 buy side  of hedged mode, 2 sell side of hedged mode
     * @param {boolean} [params.isLeverage] *unified spot only* false then spot trading true then margin trading
     * @param {string} [params.tpslMode] *contract only* 'full' or 'partial'
     * @param {string} [params.mmp] *option only* market maker protection
     * @param {string} [params.triggerDirection] *contract only* the direction for trigger orders, 'above' or 'below'
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
    createOrderWs(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name bybit#editOrderWs
     * @description edit a trade order
     * @see https://bybit-exchange.github.io/docs/v5/order/amend-order
     * @see https://bybit-exchange.github.io/docs/v5/websocket/trade/guideline#createamendcancel-order
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
    editOrderWs(id: string, symbol: string, type: OrderType, side: OrderSide, amount?: Num, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name bybit#cancelOrderWs
     * @description cancels an open order
     * @see https://bybit-exchange.github.io/docs/v5/order/cancel-order
     * @see https://bybit-exchange.github.io/docs/v5/websocket/trade/guideline#createamendcancel-order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.trigger] *spot only* whether the order is a trigger order
     * @param {string} [params.orderFilter] *spot only* 'Order' or 'StopOrder' or 'tpslOrder'
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrderWs(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name bybit#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://bybit-exchange.github.io/docs/v5/websocket/public/ticker
     * @see https://bybit-exchange.github.io/docs/v5/websocket/public/etp-ticker
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchTicker(symbol: string, params?: {}): Promise<Ticker>;
    /**
     * @method
     * @name bybit#watchTickers
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @see https://bybit-exchange.github.io/docs/v5/websocket/public/ticker
     * @see https://bybit-exchange.github.io/docs/v5/websocket/public/etp-ticker
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    /**
     * @method
     * @name bybit#unWatchTickers
     * @description unWatches a price ticker
     * @see https://bybit-exchange.github.io/docs/v5/websocket/public/ticker
     * @see https://bybit-exchange.github.io/docs/v5/websocket/public/etp-ticker
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    unWatchTickers(symbols?: Strings, params?: {}): Promise<any>;
    /**
     * @method
     * @name bybit#unWatchTicker
     * @description unWatches a price ticker
     * @see https://bybit-exchange.github.io/docs/v5/websocket/public/ticker
     * @see https://bybit-exchange.github.io/docs/v5/websocket/public/etp-ticker
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    unWatchTicker(symbols: string, params?: {}): Promise<any>;
    handleTicker(client: Client, message: any): void;
    /**
     * @method
     * @name bybit#watchBidsAsks
     * @description watches best bid & ask for symbols
     * @see https://bybit-exchange.github.io/docs/v5/websocket/public/orderbook
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchBidsAsks(symbols?: Strings, params?: {}): Promise<Tickers>;
    parseWsBidAsk(orderbook: any, market?: any): Ticker;
    /**
     * @method
     * @name bybit#watchOHLCV
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://bybit-exchange.github.io/docs/v5/websocket/public/kline
     * @see https://bybit-exchange.github.io/docs/v5/websocket/public/etp-kline
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
     * @name bybit#watchOHLCVForSymbols
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://bybit-exchange.github.io/docs/v5/websocket/public/kline
     * @see https://bybit-exchange.github.io/docs/v5/websocket/public/etp-kline
     * @param {string[][]} symbolsAndTimeframes array of arrays containing unified symbols and timeframes to fetch OHLCV data for, example [['BTC/USDT', '1m'], ['LTC/USDT', '5m']]
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    watchOHLCVForSymbols(symbolsAndTimeframes: string[][], since?: Int, limit?: Int, params?: {}): Promise<import("../base/types.js").Dictionary<import("../base/types.js").Dictionary<OHLCV[]>>>;
    /**
     * @method
     * @name bybit#unWatchOHLCVForSymbols
     * @description unWatches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://bybit-exchange.github.io/docs/v5/websocket/public/kline
     * @see https://bybit-exchange.github.io/docs/v5/websocket/public/etp-kline
     * @param {string[][]} symbolsAndTimeframes array of arrays containing unified symbols and timeframes to fetch OHLCV data for, example [['BTC/USDT', '1m'], ['LTC/USDT', '5m']]
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    unWatchOHLCVForSymbols(symbolsAndTimeframes: string[][], params?: {}): Promise<any>;
    /**
     * @method
     * @name bybit#unWatchOHLCV
     * @description unWatches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://bybit-exchange.github.io/docs/v5/websocket/public/kline
     * @see https://bybit-exchange.github.io/docs/v5/websocket/public/etp-kline
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    unWatchOHLCV(symbol: string, timeframe?: string, params?: {}): Promise<any>;
    handleOHLCV(client: Client, message: any): void;
    parseWsOHLCV(ohlcv: any, market?: any): OHLCV;
    /**
     * @method
     * @name bybit#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://bybit-exchange.github.io/docs/v5/websocket/public/orderbook
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return.
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    /**
     * @method
     * @name bybit#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://bybit-exchange.github.io/docs/v5/websocket/public/orderbook
     * @param {string[]} symbols unified array of symbols
     * @param {int} [limit] the maximum amount of order book entries to return.
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    watchOrderBookForSymbols(symbols: string[], limit?: Int, params?: {}): Promise<OrderBook>;
    /**
     * @method
     * @name bybit#unWatchOrderBookForSymbols
     * @description unsubscribe from the orderbook channel
     * @see https://bybit-exchange.github.io/docs/v5/websocket/public/orderbook
     * @param {string[]} symbols unified symbol of the market to unwatch the trades for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.limit] orderbook limit, default is undefined
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    unWatchOrderBookForSymbols(symbols: Strings, params?: {}): Promise<any>;
    /**
     * @method
     * @name bybit#unWatchOrderBook
     * @description unsubscribe from the orderbook channel
     * @see https://bybit-exchange.github.io/docs/v5/websocket/public/orderbook
     * @param {string} symbol symbol of the market to unwatch the trades for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.limit] orderbook limit, default is undefined
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    unWatchOrderBook(symbol: string, params?: {}): Promise<any>;
    handleOrderBook(client: Client, message: any): void;
    handleDelta(bookside: any, delta: any): void;
    handleDeltas(bookside: any, deltas: any): void;
    /**
     * @method
     * @name bybit#watchTrades
     * @description watches information on multiple trades made in a market
     * @see https://bybit-exchange.github.io/docs/v5/websocket/public/trade
     * @param {string} symbol unified market symbol of the market trades were made in
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name bybit#watchTradesForSymbols
     * @description get the list of most recent trades for a list of symbols
     * @see https://bybit-exchange.github.io/docs/v5/websocket/public/trade
     * @param {string[]} symbols unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    watchTradesForSymbols(symbols: string[], since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name bybit#unWatchTradesForSymbols
     * @description unsubscribe from the trades channel
     * @see https://bybit-exchange.github.io/docs/v5/websocket/public/trade
     * @param {string[]} symbols unified symbol of the market to unwatch the trades for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {any} status of the unwatch request
     */
    unWatchTradesForSymbols(symbols: Strings, params?: {}): Promise<any>;
    /**
     * @method
     * @name bybit#unWatchTrades
     * @description unsubscribe from the trades channel
     * @see https://bybit-exchange.github.io/docs/v5/websocket/public/trade
     * @param {string} symbol unified symbol of the market to unwatch the trades for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {any} status of the unwatch request
     */
    unWatchTrades(symbol: string, params?: {}): Promise<any>;
    handleTrades(client: Client, message: any): void;
    parseWsTrade(trade: any, market?: any): Trade;
    getPrivateType(url: any): "spot" | "unified" | "usdc";
    /**
     * @method
     * @name bybit#watchMyTrades
     * @description watches information on multiple trades made by the user
     * @see https://bybit-exchange.github.io/docs/v5/websocket/private/execution
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.unifiedMargin] use unified margin account
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    watchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name bybit#unWatchMyTrades
     * @description unWatches information on multiple trades made by the user
     * @see https://bybit-exchange.github.io/docs/v5/websocket/private/execution
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.unifiedMargin] use unified margin account
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    unWatchMyTrades(symbol?: Str, params?: {}): Promise<any>;
    handleMyTrades(client: Client, message: any): void;
    /**
     * @method
     * @name bybit#watchPositions
     * @see https://bybit-exchange.github.io/docs/v5/websocket/private/position
     * @description watch all open positions
     * @param {string[]} [symbols] list of unified market symbols
     * @param {int} [since] the earliest time in ms to fetch positions for
     * @param {int} [limit] the maximum number of positions to retrieve
     * @param {object} params extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/en/latest/manual.html#position-structure}
     */
    watchPositions(symbols?: Strings, since?: Int, limit?: Int, params?: {}): Promise<Position[]>;
    setPositionsCache(client: Client, symbols?: Strings): void;
    loadPositionsSnapshot(client: any, messageHash: any): Promise<void>;
    handlePositions(client: any, message: any): void;
    /**
     * @method
     * @name bybit#watchLiquidations
     * @description watch the public liquidations of a trading pair
     * @see https://bybit-exchange.github.io/docs/v5/websocket/public/liquidation
     * @param {string} symbol unified CCXT market symbol
     * @param {int} [since] the earliest time in ms to fetch liquidations for
     * @param {int} [limit] the maximum number of liquidation structures to retrieve
     * @param {object} [params] exchange specific parameters for the bitmex api endpoint
     * @returns {object} an array of [liquidation structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#liquidation-structure}
     */
    watchLiquidations(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Liquidation[]>;
    handleLiquidation(client: Client, message: any): void;
    parseWsLiquidation(liquidation: any, market?: any): Liquidation;
    /**
     * @method
     * @name bybit#watchOrders
     * @description watches information on multiple orders made by the user
     * @see https://bybit-exchange.github.io/docs/v5/websocket/private/order
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    watchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name bybit#unWatchOrders
     * @description unWatches information on multiple orders made by the user
     * @see https://bybit-exchange.github.io/docs/v5/websocket/private/order
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.unifiedMargin] use unified margin account
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    unWatchOrders(symbol?: Str, params?: {}): Promise<any>;
    handleOrderWs(client: Client, message: any): void;
    handleOrder(client: Client, message: any): void;
    parseWsSpotOrder(order: any, market?: any): Order;
    /**
     * @method
     * @name bybit#watchBalance
     * @description watch balance and get the amount of funds available for trading or funds locked in orders
     * @see https://bybit-exchange.github.io/docs/v5/websocket/private/wallet
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    watchBalance(params?: {}): Promise<Balances>;
    handleBalance(client: Client, message: any): void;
    parseWsBalance(balance: any, accountType?: any): void;
    watchTopics(url: any, messageHashes: any, topics: any, params?: {}): Promise<any>;
    unWatchTopics(url: string, topic: string, symbols: string[], messageHashes: string[], subMessageHashes: string[], topics: any, params?: {}, subExtension?: {}): Promise<any>;
    authenticate(url: any, params?: {}): Promise<any>;
    handleErrorMessage(client: Client, message: any): boolean;
    handleMessage(client: Client, message: any): void;
    ping(client: Client): {
        req_id: any;
        op: string;
    };
    handlePong(client: Client, message: any): any;
    handleAuthenticate(client: Client, message: any): any;
    handleSubscriptionStatus(client: Client, message: any): any;
    handleUnSubscribe(client: Client, message: any): any;
}
