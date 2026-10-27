import paradexRest from '../paradex.js';
import type { Int, int, Str, Trade, Order, Dict, NullableDict, OrderBook, Ticker, Strings, Tickers, Bool, Market, FundingRate, FundingRates, Position, Balances } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class paradex extends paradexRest {
    describe(): Dict;
    getWsUrl(): string;
    getOrderBookChannel(marketId: Str): string;
    requestId(): number;
    /**
     * @ignore
     * @method
     * @name paradex#subscribeRequest
     * @description builds a json-rpc subscribe request, its id is kept in the subscription passed to watch, so an error reply reaches only the watchers of that request
     * @param {string} channel the channel to subscribe to
     * @returns {object} the subscribe request
     */
    subscribeRequest(channel: string): Dict;
    authenticate(params?: Dict): Promise<any>;
    handleAuthenticationMessage(client: Client, message: Dict): void;
    handleRequestReply(client: Client, message: Dict): void;
    /**
     * @method
     * @name paradex#watchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://docs.paradex.trade/ws/web-socket-channels/trades-market-symbol/trades-market-symbol
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: Dict): Promise<Trade[]>;
    handleTrade(client: Client, message: Dict): Dict;
    /**
     * @method
     * @name paradex#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.paradex.trade/ws/web-socket-channels/order-book-market-symbol-feed-type-15-refresh-rate-price-tick/order-book-market-symbol-feed-type-15-refresh-rate-price-tick
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
     */
    watchOrderBook(symbol: string, limit?: Int, params?: Dict): Promise<OrderBook>;
    handleOrderBook(client: Client, message: Dict): void;
    /**
     * @method
     * @name paradex#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://docs.paradex.trade/ws/web-socket-channels/markets-summary-market-symbol/markets-summary-market-symbol
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    watchTicker(symbol: string, params?: Dict): Promise<Ticker>;
    /**
     * @method
     * @name paradex#watchTickers
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @see https://docs.paradex.trade/ws/web-socket-channels/markets-summary-market-symbol/markets-summary-market-symbol
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    watchTickers(symbols?: Strings, params?: Dict): Promise<Tickers>;
    /**
     * @method
     * @name paradex#watchOrders
     * @description watches information on multiple orders made by the user
     * @see https://docs.paradex.trade/ws/web-socket-channels/orders-market-symbol/orders-market-symbol
     * @param {string} [symbol] unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    watchOrders(symbol?: Str, since?: Int, limit?: Int, params?: Dict): Promise<Order[]>;
    handleOrder(client: Client, message: Dict): void;
    /**
     * @method
     * @name paradex#watchMyTrades
     * @description watches information on multiple trades made by the user
     * @see https://docs.paradex.trade/ws/web-socket-channels/fills-market-symbol/fills-market-symbol
     * @param {string} [symbol] unified market symbol of the market trades were made in
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    watchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: Dict): Promise<Trade[]>;
    handleMyTrade(client: Client, message: Dict): void;
    /**
     * @method
     * @name paradex#watchPositions
     * @description watch all open positions
     * @see https://docs.paradex.trade/ws/web-socket-channels/positions/positions
     * @param {string[]} [symbols] list of unified market symbols
     * @param {int} [since] the earliest time in ms to fetch positions for
     * @param {int} [limit] the maximum number of positions to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structures]{@link https://docs.ccxt.com/?id=position-structure}
     */
    watchPositions(symbols?: Strings, since?: Int, limit?: Int, params?: Dict): Promise<Position[]>;
    handlePositions(client: Client, message: Dict): void;
    /**
     * @method
     * @name paradex#watchBalance
     * @description watch the margin balance of the account in its settlement asset: total is the account
     * value, free the free collateral and used the initial margin requirement
     * @see https://docs.paradex.trade/ws/web-socket-channels/account/account
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
     */
    watchBalance(params?: Dict): Promise<Balances>;
    handleBalance(client: Client, message: Dict): void;
    parseWsBalance(data: Dict): Balances;
    handleTicker(client: Client, message: Dict): Dict;
    /**
     * @method
     * @name paradex#watchFundingRate
     * @description watch the current funding rate for a symbol
     * @see https://docs.paradex.trade/ws/web-socket-channels/funding-data-market-symbol/funding-data-market-symbol
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/?id=funding-rate-structure}
     */
    watchFundingRate(symbol: string, params?: Dict): Promise<FundingRate>;
    /**
     * @method
     * @name paradex#watchFundingRates
     * @description watch the funding rate for multiple markets
     * @see https://docs.paradex.trade/ws/web-socket-channels/markets-summary-market-symbol/markets-summary-market-symbol
     * @param {string[]} [symbols] a list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/?id=funding-rate-structure}
     */
    watchFundingRates(symbols?: Strings, params?: Dict): Promise<FundingRates>;
    handleFundingRate(client: Client, message: Dict): void;
    parseFundingRateWs(contract: Dict, market?: Market): FundingRate;
    parseSbeMessage(message: any): any;
    sbeReadUint(frameHex: string, offset: number, length: number): int;
    sbeReadInt64(frameHex: string, offset: number): Str;
    sbeReadDecimal(frameHex: string, offset: number): Str;
    sbeReadTimestamp(frameHex: string, offset: number): Int;
    sbeReadEnum(frameHex: string, offset: number, values: Dict): Str;
    sbeReadString(frameHex: string, offset: number, length: number): string;
    sbeReadAddress(frameHex: string, offset: number): string;
    sbeReadVarStrings(frameHex: string, offset: number, count: number, frameLength: number): string[];
    parseSbeTrade(frameHex: string, blockLength: number, frameLength: number): NullableDict;
    parseSbeOrderBook(frameHex: string, blockLength: number, frameLength: number): NullableDict;
    parseSbeMarketSummary(frameHex: string, blockLength: number, frameLength: number): NullableDict;
    parseSbeFundingData(frameHex: string, blockLength: number, frameLength: number): NullableDict;
    parseSbeOrder(frameHex: string, blockLength: number, frameLength: number): NullableDict;
    sbeReadFlags(frameHex: string, offset: number, names: string[]): string[];
    parseSbeFill(frameHex: string, blockLength: number, frameLength: number): NullableDict;
    parseSbePosition(frameHex: string, blockLength: number, frameLength: number): NullableDict;
    parseSbeAccount(frameHex: string, blockLength: number, frameLength: number): NullableDict;
    handleErrorMessage(client: Client, message: Dict): Bool;
    handleMessage(client: Client, message: any): void;
}
