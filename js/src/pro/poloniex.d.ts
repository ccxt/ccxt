import poloniexRest from '../poloniex.js';
import type { Tickers, Int, OHLCV, OrderSide, OrderType, Str, Strings, OrderBook, Order, Trade, Ticker, Balances, Num } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class poloniex extends poloniexRest {
    describe(): any;
    /**
     * @ignore
     * @method
     * @description authenticates the user to access private web socket channels
     * @see https://api-docs.poloniex.com/spot/websocket/authentication
     * @returns {object} response from exchange
     */
    authenticate(params?: {}): Promise<any>;
    /**
     * @ignore
     * @method
     * @description Connects to a websocket channel
     * @param {string} name name of the channel
     * @param {string} messageHash unique identifier for the message
     * @param {boolean} isPrivate true for the authenticated url, false for the public url
     * @param {string[]} [symbols] CCXT market symbols
     * @param {object} [params] extra parameters specific to the poloniex api
     * @returns {object} data from the websocket stream
     */
    subscribe(name: string, messageHash: string, isPrivate: boolean, symbols?: Strings, params?: {}): Promise<any>;
    /**
     * @ignore
     * @method
     * @description Connects to a websocket channel
     * @param {string} name name of the channel
     * @param {object} [params] extra parameters specific to the poloniex api
     * @returns {object} data from the websocket stream
     */
    tradeRequest(name: string, params?: {}): Promise<any>;
    /**
     * @method
     * @name poloniex#createOrderWs
     * @see https://api-docs.poloniex.com/spot/websocket/trade-request#create-order
     * @description create a trade order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the poloniex api endpoint
     * @param {string} [params.timeInForce] GTC (default), IOC, FOK
     * @param {string} [params.clientOrderId] Maximum 64-character length.*
     * @param {float} [params.cost] *spot market buy only* the quote quantity that can be used as an alternative for the amount
     *
     * EXCHANGE SPECIFIC PARAMETERS
     * @param {string} [params.amount] quote units for the order
     * @param {boolean} [params.allowBorrow] allow order to be placed by borrowing funds (Default: false)
     * @param {string} [params.stpMode] self-trade prevention, defaults to expire_taker, none: enable self-trade; expire_taker: taker order will be canceled when self-trade happens
     * @param {string} [params.slippageTolerance] used to control the maximum slippage ratio, the value range is greater than 0 and less than 1
     * @returns {object} an [order structure]{@link https://github.com/ccxt/ccxt/wiki/Manual#order-structure}
     */
    createOrderWs(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name poloniex#cancelOrderWs
     * @see https://api-docs.poloniex.com/spot/websocket/trade-request#cancel-multiple-orders
     * @description cancel multiple orders
     * @param {string} id order id
     * @param {string} [symbol] unified market symbol
     * @param {object} [params] extra parameters specific to the poloniex api endpoint
     * @param {string} [params.clientOrderId] client order id
     * @returns {object} an list of [order structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#order-structure}
     */
    cancelOrderWs(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name poloniex#cancelOrdersWs
     * @see https://api-docs.poloniex.com/spot/websocket/trade-request#cancel-multiple-orders
     * @description cancel multiple orders
     * @param {string[]} ids order ids
     * @param {string} symbol unified market symbol, default is undefined
     * @param {object} [params] extra parameters specific to the poloniex api endpoint
     * @param {string[]} [params.clientOrderIds] client order ids
     * @returns {object} an list of [order structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#order-structure}
     */
    cancelOrdersWs(ids: string[], symbol?: Str, params?: {}): Promise<any>;
    /**
     * @method
     * @name poloniex#cancelAllOrdersWs
     * @see https://api-docs.poloniex.com/spot/websocket/trade-request#cancel-all-orders
     * @description cancel all open orders of a type. Only applicable to Option in Portfolio Margin mode, and MMP privilege is required.
     * @param {string} symbol unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
     * @param {object} [params] extra parameters specific to the poloniex api endpoint
     * @returns {object[]} a list of [order structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#order-structure}
     */
    cancelAllOrdersWs(symbol?: Str, params?: {}): Promise<any>;
    handleOrderRequest(client: Client, message: any): void;
    /**
     * @method
     * @name poloniex#watchOHLCV
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://api-docs.poloniex.com/spot/websocket/market-data#candlesticks
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
     * @name poloniex#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://api-docs.poloniex.com/spot/websocket/market-data#ticker
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchTicker(symbol: string, params?: {}): Promise<Ticker>;
    /**
     * @method
     * @name poloniex#watchTickers
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://api-docs.poloniex.com/spot/websocket/market-data#ticker
     * @param {string[]} symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    /**
     * @method
     * @name poloniex#watchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://api-docs.poloniex.com/spot/websocket/market-data#trades
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name poloniex#watchTradesForSymbols
     * @description get the list of most recent trades for a list of symbols
     * @see https://api-docs.poloniex.com/spot/websocket/market-data#trades
     * @param {string[]} symbols unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    watchTradesForSymbols(symbols: string[], since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name poloniex#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://api-docs.poloniex.com/spot/websocket/market-data#book-level-2
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] not used by poloniex watchOrderBook
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    /**
     * @method
     * @name poloniex#watchOrders
     * @description watches information on multiple orders made by the user
     * @see https://api-docs.poloniex.com/spot/websocket/order
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] not used by poloniex watchOrders
     * @param {int} [limit] not used by poloniex watchOrders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    watchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name poloniex#watchMyTrades
     * @description watches information on multiple trades made by the user using orders stream
     * @see https://api-docs.poloniex.com/spot/websocket/order
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] not used by poloniex watchMyTrades
     * @param {int} [limit] not used by poloniex watchMyTrades
     * @param {object} [params] extra parameters specific to the poloniex strean
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    watchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name poloniex#watchBalance
     * @description watch balance and get the amount of funds available for trading or funds locked in orders
     * @see https://api-docs.poloniex.com/spot/websocket/balance
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    watchBalance(params?: {}): Promise<Balances>;
    parseWsOHLCV(ohlcv: any, market?: any): OHLCV;
    handleOHLCV(client: Client, message: any): any;
    handleTrade(client: Client, message: any): any;
    parseWsTrade(trade: any, market?: any): Trade;
    parseStatus(status: any): string;
    parseWsOrderTrade(trade: any, market?: any): Trade;
    handleOrder(client: Client, message: any): any;
    parseWsOrder(order: any, market?: any): Order;
    handleTicker(client: Client, message: any): any;
    handleOrderBook(client: Client, message: any): void;
    handleBalance(client: Client, message: any): void;
    parseWsBalance(response: any): Balances;
    handleMyTrades(client: Client, parsedTrade: any): void;
    handlePong(client: Client): void;
    handleMessage(client: Client, message: any): void;
    handleErrorMessage(client: Client, message: any): boolean;
    handleAuthenticate(client: Client, message: any): any;
    ping(client: Client): {
        event: string;
    };
}
