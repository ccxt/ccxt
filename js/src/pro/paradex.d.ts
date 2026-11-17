import paradexRest from '../paradex.js';
import type { Int, int, Str, Trade, Order, Dict, NullableDict, OrderBook, Ticker, Strings, Tickers, Bool, Market, FundingRate, FundingRates, Position, Balances, Liquidation } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class paradex extends paradexRest {
    describe(): Dict;
    getWsUrl(): string;
    getOrderBookChannel(marketId: Str, deltas?: boolean): string;
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
    /**
     * @ignore
     * @method
     * @name paradex#unsubscribeRequest
     * @description builds a json-rpc unsubscribe request
     * @param {string} channel the channel to unsubscribe from
     * @returns {object} the unsubscribe request
     */
    unsubscribeRequest(channel: string): Dict;
    /**
     * @ignore
     * @method
     * @name paradex#sendRequest
     * @description sends a json-rpc request and waits for its reply, the reply or an error with its id settles it
     * @param {string} url the websocket url
     * @param {object} request the json-rpc request
     * @param {string} [subscribeHash] the subscription the request opens, the request id when undefined
     * @returns {object} the reply
     */
    sendRequest(url: string, request: Dict, subscribeHash?: Str): Promise<any>;
    /**
     * @ignore
     * @method
     * @name paradex#subscribeChannels
     * @description subscribes to the channels not subscribed yet on the connection, one request per channel as the server takes one channel per request, and waits for an update on any of the message hashes
     * @param {string} url the websocket url
     * @param {string[]} messageHashes the message hashes to wait on
     * @param {string[]} channels the channels to subscribe to
     * @param {object} [params] extra parameters merged into each subscribe request
     * @returns {object} the first update
     */
    subscribeChannels(url: string, messageHashes: string[], channels: string[], params?: Dict): Promise<any>;
    unsubscribedChannels(url: string, channels: string[]): number[];
    /**
     * @ignore
     * @method
     * @name paradex#sendUnsubscribe
     * @description sends an unsubscribe or modify request and waits for its reply, which forgets the subscriptions it ends and rejects their watchers
     * @param {string} url the websocket url
     * @param {string} unsubHash the message hash the reply resolves
     * @param {object} request the json-rpc request
     * @param {object} subscription what the reply cleans up: subscribeHashes, subMessageHashes, prefix, topic and symbols
     * @param {object} [params] extra parameters merged into the request
     * @returns {boolean} true once the reply is in
     */
    sendUnsubscribe(url: string, unsubHash: string, request: Dict, subscription: Dict, params?: Dict): Promise<any>;
    /**
     * @ignore
     * @method
     * @name paradex#unsubscribeChannels
     * @description unsubscribes from a list of channels, one request per channel as the server takes one channel per request, each sent once the previous one is acknowledged, a refused channel does not stop the others
     * @param {string} url the websocket url
     * @param {string} topic the cache the replies clear, see cleanCache
     * @param {string[]} channels the channels to unsubscribe from
     * @param {string[]} subMessageHashes the message hash the watchers of each channel wait on
     * @param {string[]} symbols the unified symbol of each channel, empty for an all-markets channel
     * @param {object} [params] extra parameters merged into each unsubscribe request
     * @returns {boolean} true once every channel is unsubscribed
     */
    unsubscribeChannels(url: string, topic: string, channels: string[], subMessageHashes: string[], symbols: string[], params?: Dict): Promise<any>;
    /**
     * @ignore
     * @method
     * @name paradex#unsubscribeChannelsFrom
     * @description unsubscribes from the channels from an index on, after one was refused, their errors are dropped as the first one is thrown
     * @param {string} url the websocket url
     * @param {string} topic the cache the replies clear, see cleanCache
     * @param {string[]} channels the channels to unsubscribe from
     * @param {string[]} subMessageHashes the message hash the watchers of each channel wait on
     * @param {string[]} symbols the unified symbol of each channel, empty for an all-markets channel
     * @param {int} start the index of the first channel to unsubscribe from
     * @param {object} [params] extra parameters merged into each unsubscribe request
     * @returns {int} the number of channels refused
     */
    unsubscribeChannelsFrom(url: string, topic: string, channels: string[], subMessageHashes: string[], symbols: string[], start: number, params?: Dict): Promise<any>;
    /**
     * @ignore
     * @method
     * @name paradex#unsubscribeChannelAt
     * @description unsubscribes from one channel of a list, the reply forgets its subscription and rejects its watchers, the liquidations of a market with its trades
     * @param {string} url the websocket url
     * @param {string} topic the cache the reply clears, see cleanCache
     * @param {string[]} channels the channels of the list
     * @param {string[]} subMessageHashes the message hash the watchers of each channel wait on
     * @param {string[]} symbols the unified symbol of each channel, empty for an all-markets channel
     * @param {int} index the index of the channel to unsubscribe from
     * @param {object} [params] extra parameters merged into the unsubscribe request
     * @returns {boolean} true once unsubscribed
     */
    unsubscribeChannelAt(url: string, topic: string, channels: string[], subMessageHashes: string[], symbols: string[], index: number, params?: Dict): Promise<any>;
    /**
     * @ignore
     * @method
     * @name paradex#waitForPendingUnsubscribe
     * @description waits for the unsubscribes in flight of any of these subscriptions, a watch made meanwhile would find the subscription still there, send nothing, and be rejected by the reply
     * @param {string} url the websocket url
     * @param {string[]} subscribeHashes the subscriptions the watch relies on
     * @returns {undefined}
     */
    waitForPendingUnsubscribe(url: string, subscribeHashes: string[]): Promise<any>;
    expirePendingUnsubscribe(client: Client, unsubHash: string, requestId: string): Promise<void>;
    authenticate(params?: Dict): Promise<any>;
    handleAuthenticationMessage(client: Client, message: Dict): void;
    handleRequestReply(client: Client, message: Dict): void;
    handleUnsubscribeReply(client: Client, requestId: string): void;
    cleanUnsubscribed(client: Client, unsubHash: string, subscription: Dict): void;
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
    /**
     * @method
     * @name paradex#watchTradesForSymbols
     * @description get the list of most recent trades for a list of symbols
     * @see https://docs.paradex.trade/ws/web-socket-channels/trades-market-symbol/trades-market-symbol
     * @param {string[]} symbols unified symbols of the markets to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    watchTradesForSymbols(symbols: string[], since?: Int, limit?: Int, params?: Dict): Promise<Trade[]>;
    /**
     * @method
     * @name paradex#unWatchTrades
     * @description unsubscribes from the trades channel of a market
     * @see https://docs.paradex.trade/ws/web-socket-channels/trades-market-symbol/trades-market-symbol
     * @param {string} symbol unified symbol of the market, the all-markets channel when undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {boolean} true once unsubscribed
     */
    unWatchTrades(symbol: string, params?: Dict): Promise<any>;
    /**
     * @method
     * @name paradex#unWatchTradesForSymbols
     * @description unsubscribes from the trades channels of a list of markets, the liquidations of those markets end with them
     * @see https://docs.paradex.trade/ws/web-socket-channels/trades-market-symbol/trades-market-symbol
     * @param {string[]} symbols unified symbols of the markets
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {boolean} true once unsubscribed
     */
    unWatchTradesForSymbols(symbols: string[], params?: Dict): Promise<any>;
    /**
     * @method
     * @name paradex#watchLiquidations
     * @description watch the public liquidations of a trading pair, from the liquidation trades of the trades channel
     * @see https://docs.paradex.trade/ws/web-socket-channels/trades-market-symbol/trades-market-symbol
     * @param {string} symbol unified CCXT market symbol
     * @param {int} [since] the earliest time in ms to fetch liquidations for
     * @param {int} [limit] the maximum number of liquidation structures to retrieve
     * @param {object} [params] exchange specific parameters
     * @returns {object[]} an array of [liquidation structures]{@link https://docs.ccxt.com/?id=liquidation-structure}
     */
    watchLiquidations(symbol: string, since?: Int, limit?: Int, params?: Dict): Promise<Liquidation[]>;
    parseWsLiquidation(liquidation: Dict, market?: Market): Liquidation;
    handleTrade(client: Client, message: Dict): Dict;
    /**
     * @method
     * @name paradex#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.paradex.trade/ws/web-socket-channels/order-book-market-symbol-feed-type-15-refresh-rate-price-tick/order-book-market-symbol-feed-type-15-refresh-rate-price-tick
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] above 15 the full-depth deltas feed is used and the whole book is returned, otherwise the 15-level snapshots
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.deltas] true for the full-depth deltas feed, default false (the 15-level snapshots)
     * @returns {object} an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
     */
    watchOrderBook(symbol: string, limit?: Int, params?: Dict): Promise<OrderBook>;
    /**
     * @method
     * @name paradex#watchOrderBookForSymbols
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.paradex.trade/ws/web-socket-channels/order-book-market-symbol-feed-type-15-refresh-rate-price-tick/order-book-market-symbol-feed-type-15-refresh-rate-price-tick
     * @param {string[]} symbols unified array of symbols
     * @param {int} [limit] above 15 the full-depth deltas feed is used and the whole book is returned, otherwise the 15-level snapshots
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.deltas] true for the full-depth deltas feed, default false (the 15-level snapshots)
     * @returns {object} an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
     */
    watchOrderBookForSymbols(symbols: string[], limit?: Int, params?: Dict): Promise<OrderBook>;
    /**
     * @method
     * @name paradex#unWatchOrderBook
     * @description unsubscribes from the order book feed of a market
     * @see https://docs.paradex.trade/ws/web-socket-channels/order-book-market-symbol-feed-type-15-refresh-rate-price-tick/order-book-market-symbol-feed-type-15-refresh-rate-price-tick
     * @param {string} symbol unified symbol of the market
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.deltas] the feed to unsubscribe from when the market is not watched on this connection, true for the full-depth deltas, default false
     * @returns {boolean} true once unsubscribed
     */
    unWatchOrderBook(symbol: string, params?: Dict): Promise<any>;
    /**
     * @method
     * @name paradex#unWatchOrderBookForSymbols
     * @description unsubscribes from the order book feeds of a list of markets
     * @see https://docs.paradex.trade/ws/web-socket-channels/order-book-market-symbol-feed-type-15-refresh-rate-price-tick/order-book-market-symbol-feed-type-15-refresh-rate-price-tick
     * @param {string[]} symbols unified symbols of the markets
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.deltas] the feed to unsubscribe from when a market is not watched on this connection, true for the full-depth deltas, default false
     * @returns {boolean} true once unsubscribed
     */
    unWatchOrderBookForSymbols(symbols: string[], params?: Dict): Promise<any>;
    handleOrderBook(client: Client, message: Dict): void;
    handleBookSideDeltas(bookside: any, deltas: any[]): void;
    /**
     * @ignore
     * @method
     * @name paradex#resubscribeOrderBook
     * @description subscribes to an order book deltas feed again, the server sends a fresh full-depth snapshot on subscribe
     * @param {object} client the websocket client
     * @param {string} channel the deltas channel
     * @param {string} messageHash the message hash the book watchers wait on
     * @returns {boolean} true once both requests are sent
     */
    resubscribeOrderBook(client: Client, channel: string, messageHash: string): Promise<boolean>;
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
     * @param {string[]} [symbols] unified symbols of the markets to fetch the tickers for, all markets when undefined, which is thousands of updates a second
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    watchTickers(symbols?: Strings, params?: Dict): Promise<Tickers>;
    /**
     * @method
     * @name paradex#unWatchTicker
     * @description stops watching the market summary of a market
     * @see https://docs.paradex.trade/ws/web-socket-channels/markets-summary-market-symbol/markets-summary-market-symbol
     * @param {string} symbol unified symbol of the market
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {boolean} true once unsubscribed
     */
    unWatchTicker(symbol: string, params?: Dict): Promise<any>;
    /**
     * @method
     * @name paradex#unWatchTickers
     * @description stops watching the market summaries of a list of markets, they are removed from the scoped subscription in place, the last ones unsubscribe it
     * @see https://docs.paradex.trade/ws/web-socket-channels/markets-summary-market-symbol/markets-summary-market-symbol
     * @param {string[]} [symbols] unified symbols of the markets, the whole channel when undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {boolean} true once unsubscribed
     */
    unWatchTickers(symbols?: Strings, params?: Dict): Promise<any>;
    /**
     * @ignore
     * @method
     * @name paradex#subscribeMarketsSummary
     * @description watches the market summaries of a list of markets over one scoped subscription, the markets not in it yet are added in place
     * @see https://docs.paradex.trade/ws/web-socket-channels/markets-summary-market-symbol/markets-summary-market-symbol
     * @param {string[]} symbols unified symbols of the markets
     * @param {string[]} messageHashes the message hashes to wait on
     * @param {object} [params] extra parameters merged into the request
     * @returns {object} the first [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure} updated
     */
    subscribeMarketsSummary(symbols: string[], messageHashes: string[], params?: Dict): Promise<any>;
    /**
     * @method
     * @name paradex#watchMarkPrice
     * @description watches a mark price for a specific market
     * @see https://docs.paradex.trade/ws/web-socket-channels/markets-summary-market-symbol/markets-summary-market-symbol
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    watchMarkPrice(symbol: string, params?: Dict): Promise<Ticker>;
    /**
     * @method
     * @name paradex#watchMarkPrices
     * @description watches the mark prices for all markets of a list
     * @see https://docs.paradex.trade/ws/web-socket-channels/markets-summary-market-symbol/markets-summary-market-symbol
     * @param {string[]} [symbols] unified symbols of the markets to fetch the tickers for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    watchMarkPrices(symbols?: Strings, params?: Dict): Promise<Tickers>;
    /**
     * @method
     * @name paradex#watchBidsAsks
     * @description watches best bid & ask for symbols
     * @see https://docs.paradex.trade/ws/web-socket-channels/bbo-market-symbol/bbo-market-symbol
     * @param {string[]} [symbols] unified symbols of the markets to fetch the best bid and ask for, all markets when undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    watchBidsAsks(symbols?: Strings, params?: Dict): Promise<Tickers>;
    /**
     * @method
     * @name paradex#unWatchBidsAsks
     * @description unsubscribes from the best bid & ask channels of a list of markets
     * @see https://docs.paradex.trade/ws/web-socket-channels/bbo-market-symbol/bbo-market-symbol
     * @param {string[]} [symbols] unified symbols of the markets, the all-markets channel when undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {boolean} true once unsubscribed
     */
    unWatchBidsAsks(symbols?: Strings, params?: Dict): Promise<any>;
    handleBidAsk(client: Client, message: Dict): void;
    parseWsBidAsk(data: Dict, market?: Market): Ticker;
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
     * @name paradex#unWatchFundingRate
     * @description unsubscribes from the funding data channel of a market
     * @see https://docs.paradex.trade/ws/web-socket-channels/funding-data-market-symbol/funding-data-market-symbol
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {boolean} true once unsubscribed
     */
    unWatchFundingRate(symbol: string, params?: Dict): Promise<any>;
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
    parseSbeMessage(client: Client, message: any): any;
    sbeReadUint(frameHex: string, offset: number, length: number): int;
    sbeReadInt64(frameHex: string, offset: number): Str;
    sbeReadDecimal(frameHex: string, offset: number): Str;
    sbeReadTimestamp(frameHex: string, offset: number): Int;
    sbeReadEnum(frameHex: string, offset: number, values: Dict): Str;
    sbeReadString(frameHex: string, offset: number, length: number): string;
    sbeReadAddress(frameHex: string, offset: number): string;
    sbeReadVarStrings(frameHex: string, offset: number, count: number, frameLength: number): string[];
    parseSbeTrade(frameHex: string, blockLength: number, frameLength: number): NullableDict;
    parseSbeBbo(frameHex: string, blockLength: number, frameLength: number): NullableDict;
    parseSbeOrderBook(frameHex: string, blockLength: number, frameLength: number): NullableDict;
    parseSbeMarketSummary(client: Client, frameHex: string, blockLength: number, frameLength: number): NullableDict;
    parseSbeFundingData(frameHex: string, blockLength: number, frameLength: number): NullableDict;
    parseSbeOrder(frameHex: string, blockLength: number, frameLength: number): NullableDict;
    sbeReadFlags(frameHex: string, offset: number, names: string[]): string[];
    parseSbeFill(frameHex: string, blockLength: number, frameLength: number): NullableDict;
    parseSbePosition(frameHex: string, blockLength: number, frameLength: number): NullableDict;
    parseSbeAccount(frameHex: string, blockLength: number, frameLength: number): NullableDict;
    handleErrorMessage(client: Client, message: Dict): Bool;
    handleBinaryMessage(client: Client, message: unknown): void;
    handleMessage(client: Client, message: Dict): void;
    handleStreamMessage(client: Client, message: Dict): void;
}
