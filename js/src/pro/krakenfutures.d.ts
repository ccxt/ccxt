import krakenfuturesRest from '../krakenfutures.js';
import type { Int, Str, Strings, OrderBook, Order, Trade, Ticker, Tickers, Position, Balances } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class krakenfutures extends krakenfuturesRest {
    describe(): any;
    /**
     * @ignore
     * @method
     * @description authenticates the user to access private web socket channels
     * @see https://docs.futures.kraken.com/#websocket-api-public-feeds-challenge
     * @returns {object} response from exchange
     */
    authenticate(params?: {}): Promise<any>;
    /**
     * @method
     * @name krakenfutures#watchOrderBookForSymbols
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.futures.kraken.com/#websocket-api-public-feeds-challenge
     * @param {string[]} symbols unified array of symbols
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    watchOrderBookForSymbols(symbols: string[], limit?: Int, params?: {}): Promise<OrderBook>;
    /**
     * @ignore
     * @method
     * @description Connects to a websocket channel
     * @param {string} name name of the channel
     * @param {string[]} symbols CCXT market symbols
     * @param {object} [params] extra parameters specific to the krakenfutures api
     * @returns {object} data from the websocket stream
     */
    subscribePublic(name: string, symbols: string[], params?: {}): Promise<any>;
    /**
     * @ignore
     * @method
     * @description Connects to a websocket channel
     * @param {string} name name of the channel
     * @param {string} messageHash unique identifier for the message
     * @param {object} [params] extra parameters specific to the krakenfutures api
     * @returns {object} data from the websocket stream
     */
    subscribePrivate(name: string, messageHash: string, params?: {}): Promise<any>;
    /**
     * @method
     * @name krakenfutures#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://docs.futures.kraken.com/#websocket-api-public-feeds-ticker
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchTicker(symbol: string, params?: {}): Promise<Ticker>;
    /**
     * @method
     * @name krakenfutures#watchTickers
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://docs.futures.kraken.com/#websocket-api-public-feeds-ticker
     * @param {string[]} symbols unified symbols of the markets to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    /**
     * @method
     * @name krakenfutures#watchBidsAsks
     * @see https://docs.futures.kraken.com/#websocket-api-public-feeds-ticker-lite
     * @description watches best bid & ask for symbols
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchBidsAsks(symbols?: Strings, params?: {}): Promise<Tickers>;
    /**
     * @method
     * @name krakenfutures#watchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://docs.futures.kraken.com/#websocket-api-public-feeds-trade
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    watchTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name krakenfutures#watchTradesForSymbols
     * @see https://docs.futures.kraken.com/#websocket-api-public-feeds-trade
     * @description get the list of most recent trades for a list of symbols
     * @param {string[]} symbols unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    watchTradesForSymbols(symbols: string[], since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name krakenfutures#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.futures.kraken.com/#websocket-api-public-feeds-book
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] not used by krakenfutures watchOrderBook
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    /**
     * @method
     * @name krakenfutures#watchPositions
     * @see https://docs.futures.kraken.com/#websocket-api-private-feeds-open-positions
     * @description watch all open positions
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param since
     * @param limit
     * @param {object} params extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/en/latest/manual.html#position-structure}
     */
    watchPositions(symbols?: Strings, since?: Int, limit?: Int, params?: {}): Promise<Position[]>;
    handlePositions(client: any, message: any): void;
    parseWsPosition(position: any, market?: any): Position;
    /**
     * @method
     * @name krakenfutures#watchOrders
     * @description watches information on multiple orders made by the user
     * @see https://docs.futures.kraken.com/#websocket-api-private-feeds-open-orders
     * @see https://docs.futures.kraken.com/#websocket-api-private-feeds-open-orders-verbose
     * @param {string} symbol not used by krakenfutures watchOrders
     * @param {int} [since] not used by krakenfutures watchOrders
     * @param {int} [limit] not used by krakenfutures watchOrders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    watchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name krakenfutures#watchMyTrades
     * @description watches information on multiple trades made by the user
     * @see https://docs.futures.kraken.com/#websocket-api-private-feeds-fills
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    watchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name krakenfutures#watchBalance
     * @description watches information on the user's account balance
     * @see https://docs.futures.kraken.com/#websocket-api-private-feeds-balances
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.account] can be either 'futures' or 'flex_futures'
     * @returns {object} a object of wallet types each with a balance structure {@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    watchBalance(params?: {}): Promise<Balances>;
    handleTrade(client: Client, message: any): void;
    parseWsTrade(trade: any, market?: any): Trade;
    parseWsOrderTrade(trade: any, market?: any): Trade;
    handleOrder(client: Client, message: any): any;
    handleOrderSnapshot(client: Client, message: any): void;
    parseWsOrder(order: any, market?: any): Order;
    handleTicker(client: Client, message: any): void;
    handleBidAsk(client: Client, message: any): void;
    parseWsTicker(ticker: any, market?: any): Ticker;
    handleOrderBookSnapshot(client: Client, message: any): void;
    handleOrderBook(client: Client, message: any): void;
    handleBalance(client: Client, message: any): void;
    handleMyTrades(client: Client, message: any): void;
    parseWsMyTrade(trade: any, market?: any): Trade;
    watchMultiHelper(unifiedName: string, channelName: string, symbols?: Strings, subscriptionArgs?: any, params?: {}): Promise<any>;
    getMessageHash(unifiedElementName: string, subChannelName?: Str, symbol?: Str): string;
    handleErrorMessage(client: Client, message: any): void;
    handleMessage(client: any, message: any): void;
    handleAuthenticate(client: Client, message: any): any;
}
