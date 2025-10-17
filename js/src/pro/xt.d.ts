import xtRest from '../xt.js';
import { Balances, Dict, Int, Market, OHLCV, Order, OrderBook, Position, Str, Strings, Ticker, Tickers, Trade } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class xt extends xtRest {
    describe(): any;
    /**
     * @ignore
     * @method
     * @description required for private endpoints
     * @param {string} isContract true for contract trades
     * @see https://doc.xt.com/#websocket_privategetToken
     * @see https://doc.xt.com/#futures_user_websocket_v2base
     * @returns {string} listen key / access token
     */
    getListenKey(isContract: boolean): Promise<any>;
    getCacheIndex(orderbook: any, cache: any): any;
    handleDelta(orderbook: any, delta: any): void;
    /**
     * @ignore
     * @method
     * @description Connects to a websocket channel
     * @see https://doc.xt.com/#websocket_privaterequestFormat
     * @see https://doc.xt.com/#futures_market_websocket_v2base
     * @param {string} name name of the channel
     * @param {string} access public or private
     * @param {string} methodName the name of the CCXT class method
     * @param {object} [market] CCXT market
     * @param {string[]} [symbols] unified market symbols
     * @param {object} params extra parameters specific to the xt api
     * @returns {object} data from the websocket stream
     */
    subscribe(name: string, access: string, methodName: string, market?: Market, symbols?: string[], params?: {}): Promise<any>;
    /**
     * @method
     * @name xt#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://doc.xt.com/#websocket_publictickerRealTime
     * @see https://doc.xt.com/#futures_market_websocket_v2tickerRealTime
     * @see https://doc.xt.com/#futures_market_websocket_v2aggTickerRealTime
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} params extra parameters specific to the xt api endpoint
     * @param {string} [params.method] 'agg_ticker' (contract only) or 'ticker', default = 'ticker' - the endpoint that will be streamed
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
     */
    watchTicker(symbol: string, params?: {}): Promise<Ticker>;
    /**
     * @method
     * @name xt#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://doc.xt.com/#websocket_publicallTicker
     * @see https://doc.xt.com/#futures_market_websocket_v2allTicker
     * @see https://doc.xt.com/#futures_market_websocket_v2allAggTicker
     * @param {string} [symbols] unified market symbols
     * @param {object} params extra parameters specific to the xt api endpoint
     * @param {string} [params.method] 'agg_tickers' (contract only) or 'tickers', default = 'tickers' - the endpoint that will be streamed
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
     */
    watchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    /**
     * @method
     * @name hitbtc#watchOHLCV
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://doc.xt.com/#websocket_publicsymbolKline
     * @see https://doc.xt.com/#futures_market_websocket_v2symbolKline
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe 1m, 3m, 5m, 15m, 30m, 1h, 2h, 4h, 6h, 8h, 12h, 1d, 3d, 1w, or 1M
     * @param {int} [since] not used by xt watchOHLCV
     * @param {int} [limit] not used by xt watchOHLCV
     * @param {object} params extra parameters specific to the xt api endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    watchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    /**
     * @method
     * @name xt#watchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://doc.xt.com/#websocket_publicdealRecord
     * @see https://doc.xt.com/#futures_market_websocket_v2dealRecord
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} params extra parameters specific to the xt api endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
     */
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name xt#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://doc.xt.com/#websocket_publiclimitDepth
     * @see https://doc.xt.com/#websocket_publicincreDepth
     * @see https://doc.xt.com/#futures_market_websocket_v2limitDepth
     * @see https://doc.xt.com/#futures_market_websocket_v2increDepth
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] not used by xt watchOrderBook
     * @param {object} params extra parameters specific to the xt api endpoint
     * @param {int} [params.levels] 5, 10, 20, or 50
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
     */
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    /**
     * @method
     * @name xt#watchOrders
     * @description watches information on multiple orders made by the user
     * @see https://doc.xt.com/#websocket_privateorderChange
     * @see https://doc.xt.com/#futures_user_websocket_v2order
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] not used by xt watchOrders
     * @param {int} [limit] the maximum number of orders to return
     * @param {object} params extra parameters specific to the xt api endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
     */
    watchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name xt#watchMyTrades
     * @description watches information on multiple trades made by the user
     * @see https://doc.xt.com/#websocket_privateorderDeal
     * @see https://doc.xt.com/#futures_user_websocket_v2trade
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of  orde structures to retrieve
     * @param {object} params extra parameters specific to the kucoin api endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    watchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name xt#watchOrders
     * @description watches information on multiple orders made by the user
     * @see https://doc.xt.com/#websocket_privatebalanceChange
     * @see https://doc.xt.com/#futures_user_websocket_v2balance
     * @param {object} params extra parameters specific to the xt api endpoint
     * @returns {object[]} a list of [balance structures]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    watchBalance(params?: {}): Promise<Balances>;
    /**
     * @method
     * @name xt#watchPositions
     * @see https://doc.xt.com/#futures_user_websocket_v2position
     * @description watch all open positions
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param {number} [since] since timestamp
     * @param {number} [limit] limit
     * @param {object} params extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/en/latest/manual.html#position-structure}
     */
    watchPositions(symbols?: Strings, since?: Int, limit?: Int, params?: {}): Promise<Position[]>;
    setPositionsCache(client: Client): void;
    loadPositionsSnapshot(client: any, messageHash: any): Promise<void>;
    handlePosition(client: any, message: any): void;
    handleTicker(client: Client, message: Dict): Dict;
    handleTickers(client: Client, message: Dict): Dict;
    handleOHLCV(client: Client, message: Dict): Dict;
    handleTrade(client: Client, message: Dict): Dict;
    handleOrderBook(client: Client, message: Dict): void;
    parseWsOrderTrade(trade: Dict, market?: Market): Trade;
    parseWsOrder(order: Dict, market?: Market): Order;
    handleOrder(client: Client, message: Dict): Dict;
    handleBalance(client: Client, message: Dict): void;
    handleMyTrades(client: Client, message: Dict): void;
    handleMessage(client: Client, message: any): void;
    ping(client: Client): string;
    handleErrorMessage(client: Client, message: Dict): void;
}
