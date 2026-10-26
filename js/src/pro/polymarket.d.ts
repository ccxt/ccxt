import polymarketRest from '../polymarket.js';
import Client from '../base/ws/Client.js';
import type { Int, Str, Market, OrderBook, Trade, OHLCV, Dict, Strings, Ticker, Tickers, Order, Position, Balances } from '../base/types.js';
export default class polymarket extends polymarketRest {
    describe(): any;
    requestId(): number;
    /**
     * @method
     * @ignore
     * @name polymarket#sendSubscription
     * @description sends a subscribe or unsubscribe request and records the request id so the ack can be matched back
     * @param {string} action either 'sub' or 'unsub'
     * @param {string[]} channels venue channel names to subscribe to
     * @param {string[]} messageHashes message hashes the caller awaits
     * @param {string[]} subMessageHashes the underlying subscription hashes, used to reject or clean them when the ack fails
     * @param {object} [context] extra fields stored with the pending request, e.g. the symbol and topic for cache cleanup
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} the raw request frame to send
     */
    sendSubscription(action: string, channels: string[], messageHashes: string[], subMessageHashes: string[], context?: Dict, params?: Dict, checkHashes?: Strings): Dict;
    /**
     * @method
     * @name polymarket#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.polymarket.com/perps/realtime-updates
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] not used by polymarket watchOrderBook, the channel always carries the top twenty levels
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure}
     */
    watchOrderBook(symbol: string, limit?: Int, params?: Dict): Promise<OrderBook>;
    /**
     * @method
     * @name polymarket#unWatchOrderBook
     * @description unWatches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.polymarket.com/perps/realtime-updates
     * @param {string} symbol unified symbol of the market to unwatch the order book for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} status of the unwatch request
     */
    unWatchOrderBook(symbol: string, params?: Dict): Promise<any>;
    handleOrderBook(client: Client, message: Dict): void;
    /**
     * @method
     * @name polymarket#watchTicker
     * @description watches a price ticker, which carries the last, mark and index prices, the mid price, the open interest and the funding rate stay available on the raw frame under the info field
     * @see https://docs.polymarket.com/perps/realtime-updates
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchTicker(symbol: string, params?: Dict): Promise<Ticker>;
    /**
     * @method
     * @name polymarket#unWatchTicker
     * @description unWatches the price ticker
     * @see https://docs.polymarket.com/perps/realtime-updates
     * @param {string} symbol unified symbol of the market to unwatch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} status of the unwatch request
     */
    unWatchTicker(symbol: string, params?: Dict): Promise<any>;
    /**
     * @method
     * @name polymarket#watchTickers
     * @description watches price tickers for multiple markets, the venue fans the all-instruments channel out into one frame per instrument
     * @see https://docs.polymarket.com/perps/realtime-updates
     * @param {string[]} [symbols] unified symbols of the markets to fetch the ticker for, all market tickers are streamed if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchTickers(symbols?: Strings, params?: Dict): Promise<Tickers>;
    handleTicker(client: Client, message: Dict): void;
    /**
     * @method
     * @name polymarket#watchBidsAsks
     * @description watches best bids and asks for multiple markets
     * @see https://docs.polymarket.com/perps/realtime-updates
     * @param {string[]} symbols unified symbols of the markets to fetch the best bids and asks for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchBidsAsks(symbols?: Strings, params?: Dict): Promise<Tickers>;
    handleBidAsk(client: Client, message: Dict): void;
    /**
     * @method
     * @name polymarket#watchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://docs.polymarket.com/perps/realtime-updates
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: Dict): Promise<Trade[]>;
    /**
     * @method
     * @name polymarket#unWatchTrades
     * @description unWatches the trades stream
     * @see https://docs.polymarket.com/perps/realtime-updates
     * @param {string} symbol unified symbol of the market to unwatch the trades for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} status of the unwatch request
     */
    unWatchTrades(symbol: string, params?: Dict): Promise<any>;
    handleTrades(client: Client, message: Dict): void;
    parseWsTrade(trade: Dict, market?: Market): Trade;
    /**
     * @method
     * @name polymarket#watchOHLCV
     * @description watches historical candlestick data containing the open, high, low, close price, and the volume of a market
     * @see https://docs.polymarket.com/perps/realtime-updates
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents, the 1s timeframe is not available over the websocket
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    watchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: Dict): Promise<OHLCV[]>;
    /**
     * @method
     * @name polymarket#unWatchOHLCV
     * @description unWatches the candlestick stream
     * @see https://docs.polymarket.com/perps/realtime-updates
     * @param {string} symbol unified symbol of the market to unwatch the candles for
     * @param {string} timeframe the length of time each candle represents
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} status of the unwatch request
     */
    unWatchOHLCV(symbol: string, timeframe?: string, params?: Dict): Promise<any>;
    handleOHLCV(client: Client, message: Dict): void;
    /**
     * @method
     * @ignore
     * @name polymarket#authenticate
     * @description authenticates the websocket connection with the session proxy credentials, provisioning them first when needed
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} resolves once the connection is authenticated
     */
    authenticate(params?: Dict): Promise<any>;
    /**
     * @method
     * @name polymarket#watchOrders
     * @description watches information on the orders made by the user
     * @see https://docs.polymarket.com/perps/realtime-updates
     * @param {string} [symbol] unified market symbol of the market the orders were made in
     * @param {int} [since] timestamp in ms of the earliest order
     * @param {int} [limit] the maximum number of order structures to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    watchOrders(symbol?: Str, since?: Int, limit?: Int, params?: Dict): Promise<Order[]>;
    handleOrder(client: Client, message: Dict): void;
    /**
     * @method
     * @name polymarket#watchMyTrades
     * @description watches information on the trades made by the user
     * @see https://docs.polymarket.com/perps/realtime-updates
     * @param {string} [symbol] unified market symbol of the market the trades were made in
     * @param {int} [since] timestamp in ms of the earliest trade
     * @param {int} [limit] the maximum number of trade structures to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    watchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: Dict): Promise<Trade[]>;
    handleMyTrades(client: Client, message: Dict): void;
    /**
     * @method
     * @name polymarket#watchPositions
     * @description watches information on the open positions of the account, the venue pushes a full portfolio snapshot roughly every five seconds
     * @see https://docs.polymarket.com/perps/realtime-updates
     * @param {string[]} [symbols] list of unified market symbols
     * @param {int} [since] not used by polymarket watchPositions
     * @param {int} [limit] not used by polymarket watchPositions
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structures]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    watchPositions(symbols?: Strings, since?: Int, limit?: Int, params?: Dict): Promise<Position[]>;
    setPositionsCache(client: Client, symbols?: Strings): void;
    loadPositionsSnapshot(client: Client, messageHash: string): Promise<void>;
    /**
     * @method
     * @name polymarket#watchBalance
     * @description watches the account margin summary, the venue pushes a full portfolio snapshot roughly every five seconds
     * @see https://docs.polymarket.com/perps/realtime-updates
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    watchBalance(params?: Dict): Promise<Balances>;
    setBalanceCache(client: Client): void;
    loadBalanceSnapshot(client: Client, messageHash: string): Promise<void>;
    handlePortfolio(client: Client, message: Dict): void;
    handleAck(client: Client, message: any): void;
    handleMessage(client: Client, message: any): void;
    ping(client: Client): {
        id: number;
        req: string;
        op: {
            type: string;
        };
    };
}
