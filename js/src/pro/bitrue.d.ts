import bitrueRest from '../bitrue.js';
import type { Balances, Dict, Int, Market, OHLCV, Order, OrderBook, Str, Ticker, Trade, List } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class bitrue extends bitrueRest {
    describe(): any;
    /**
     * @method
     * @name bitrue#watchBalance
     * @description watch balance and get the amount of funds available for trading or funds locked in orders
     * @see https://github.com/Bitrue-exchange/Spot-official-api-docs#balance-update
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
     */
    watchBalance(params?: Dict): Promise<Balances>;
    handleBalance(client: Client, message: Dict): void;
    parseWSBalances(balances: any[]): void;
    /**
     * @method
     * @name bitrue#watchOrders
     * @description watches information on user orders
     * @see https://github.com/Bitrue-exchange/Spot-official-api-docs#order-update
     * @param {string} symbol
     * @param {int} [since] timestamp in ms of the earliest order
     * @param {int} [limit] the maximum amount of orders to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order structure]{@link https://docs.ccxt.com/?id=order-structure} indexed by market symbols
     */
    watchOrders(symbol?: Str, since?: Int, limit?: Int, params?: Dict): Promise<Order[]>;
    handleOrder(client: Client, message: Dict): void;
    parseWsOrder(order: Dict, market?: Market): Order;
    watchOrderBook(symbol: string, limit?: Int, params?: Dict): Promise<OrderBook>;
    handleOrderBook(client: Client, message: Dict): void;
    findSwapMarketByWsBaseQuote(wsBaseQuote: string): any;
    parseContractBidsAsks(bidsAsks: any[], symbol: string): List;
    convertFromRawQuantity(symbol: string, rawQuantity: any): any;
    /**
     * @method
     * @name bitrue#watchTrades
     * @description watches public trades for a swap (futures) market
     * @see https://www.bitrue.com/api_docs_includes_file/futures/index.html#websocket-market-data
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: Dict): Promise<Trade[]>;
    handleTrades(client: Client, message: Dict): void;
    parseWsTrade(trade: Dict, market?: Market): Trade;
    /**
     * @method
     * @name bitrue#watchOHLCV
     * @description watches OHLCV candles for a swap (futures) market
     * @see https://www.bitrue.com/api_docs_includes_file/futures/index.html#websocket-market-data
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    watchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: Dict): Promise<OHLCV[]>;
    handleOHLCV(client: Client, message: Dict): void;
    parseWsOHLCV(tick: any, market?: Market): OHLCV;
    /**
     * @method
     * @name bitrue#watchTicker
     * @description watches a 24h ticker for a swap (futures) market
     * @see https://www.bitrue.com/api_docs_includes_file/futures/index.html#websocket-market-data
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    watchTicker(symbol: string, params?: Dict): Promise<Ticker>;
    handleTicker(client: Client, message: Dict): void;
    parseWsTicker(tick: Dict, market: any, timestamp?: Int): Ticker;
    parseWsOrderType(typeId: Str): Str;
    parseWsOrderStatus(status: Str): Str;
    handlePing(client: Client, message: Dict): void;
    pong(client: Client, message: Dict): Promise<void>;
    handleMessage(client: Client, message: Dict): void;
    authenticate(params?: Dict): Promise<any>;
    keepAliveListenKey(params?: Dict): Promise<void>;
}
