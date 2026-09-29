import Exchange from '../abstract/prediction/opinion.js';
import type { Balances, Dict, Int, Market, Num, OHLCV, PredictionEvent, PredictionOrder, PredictionOrderBook, PredictionPosition, PredictionTicker, PredictionTickers, PredictionTrade, Str, Strings, fetchEventsParams } from '../base/types.js';
/**
 * @class opinion
 * @augments Exchange
 */
export default class opinion extends Exchange {
    describe(): any;
    /**
     * @method
     * @name opinion#fetchMarkets
     * @description fetches every kind of opinion market
     * categorical parents double as our unified "events" and are cached into this.events as a side effect
     * @see https://docs.opinion.trade/developer-guide/opinion-open-api/market
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.limit] max number of markets to collect (defaults to options.marketsPageLimit * options.maxMarketsPages, 1000)
     * @returns {object[]} an array of objects representing market data
     */
    fetchMarkets(params?: {}): Promise<Market[]>;
    /**
     * @ignore
     * @method
     * @name opinion#fetchOutcome
     * @description resolves a single outcome; a bare numeric token id carries no search text for
     * the base's fetchEvents-driven resolution (opinion has no per-id lookup endpoint, unlike
     * kalshi/polymarket), so bulk-warm the outcome cache via loadOutcomes() first for id-form input
     * @param {string} outcomeSymbol the outcome handle or token id
     * @returns {object} the outcome cache
     */
    fetchOutcome(outcomeSymbol: string): Promise<any>;
    /**
     * @ignore
     * @method
     * @name opinion#parseOpinionMarket
     * @description converts a single raw opinion market into one ccxt market with yes/no outcomes
     * @param {object} raw the raw opinion market object
     * @param {string} [eventSlug] the slug of the parent event
     * @returns {object} a [market structure](https://docs.ccxt.com/#/?id=market-structure)
     */
    parseOpinionMarket(raw: Dict, eventSlug?: Str): Market;
    /**
     * @method
     * @name opinion#fetchEvents
     * @description fetches Opinion's categorical markets - scope required via query/queries/tags/eventId/slug/labelId
     * @see https://docs.opinion.trade/developer-guide/opinion-open-api/market
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.labelId] filter by opinion category label id
     * @param {int} [params.limit] max number of events to fetch (paginated server-side; defaults to options.maxFetchEventsResults, 100)
     * @returns {object[]} an array of event structures
     */
    fetchEvents(params?: fetchEventsParams): Promise<PredictionEvent[]>;
    /**
     * @method
     * @name opinion#fetchEvent
     * @description fetches a single prediction-market event by its market id, or slug
     * @see https://docs.opinion.trade/developer-guide/opinion-open-api/market
     * @param {string} id the numeric marketId, or the market slug
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [prediction event structure](https://docs.ccxt.com/#/?id=prediction-event-structure)
     */
    fetchEvent(id: string, params?: {}): Promise<PredictionEvent>;
    /**
     * @ignore
     * @method
     * @name opinion#parseEvent
     * @description parses a raw opinion categorical market (with nested childMarkets) into the unified event shape
     * @param {object} rawEvent the raw opinion categorical market object
     * @returns {object} an event structure
     */
    parseEvent(rawEvent: Dict): any;
    /**
     * @method
     * @name opinion#fetchTicker
     * @description fetches the latest trade price and top of book for a single outcome token
     * @see https://docs.opinion.trade/developer-guide/opinion-open-api/token
     * @param {string} outcome unified outcome or outcome token id
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [prediction ticker structure](https://docs.ccxt.com/#/?id=prediction-ticker-structure)
     */
    fetchTicker(outcome: string, params?: {}): Promise<PredictionTicker>;
    /**
     * @ignore
     * @method
     * @name opinion#parsePredictionTicker
     * @description parses a raw opinion latest-price + orderbook pair into a unified ticker object
     * @param {object} ticker a { price, book } dict of the two raw responses
     * @param {object} [market] the outcome object the ticker belongs to
     * @returns {object} a [prediction ticker structure](https://docs.ccxt.com/#/?id=prediction-ticker-structure)
     */
    parsePredictionTicker(ticker: Dict, market?: Market): PredictionTicker;
    /**
     * @method
     * @name opinion#fetchTickers
     * @description fetches tickers for multiple outcome tokens - opinion has no all-tickers endpoint, each token needs its own latest-price + orderbook request
     * @see https://docs.opinion.trade/developer-guide/opinion-open-api/token
     * @param {string[]} outcomes unified outcomes or outcome token ids - required, opinion has no all-tickers endpoint
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [prediction ticker structures](https://docs.ccxt.com/#/?id=prediction-ticker-structure) indexed by outcome
     */
    fetchTickers(outcomes?: Strings, params?: {}): Promise<PredictionTickers>;
    /**
     * @method
     * @name opinion#fetchOrderBook
     * @description fetches the order book for a single outcome token
     * @see https://docs.opinion.trade/developer-guide/opinion-open-api/token
     * @param {string} outcome unified outcome or outcome token id
     * @param {int} [limit] not used by opinion fetchOrderBook
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [prediction order book structure](https://docs.ccxt.com/#/?id=prediction-order-book-structure)
     */
    fetchOrderBook(outcome: Str, limit?: Int, params?: {}): Promise<PredictionOrderBook>;
    /**
     * @method
     * @name opinion#fetchOHLCV
     * @description fetches historical candlestick data for an outcome token
     * @see https://docs.opinion.trade/developer-guide/opinion-open-api/token
     * @param {string} outcome unified outcome or outcome token id
     * @param {string} timeframe the length of time each candle represents - only '1h' and '1d' are supported live
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum number of candles to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} a list of candles ordered as timestamp, open, high, low, close, volume
     */
    fetchOHLCV(outcome: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    /**
     * @method
     * @name opinion#parseOHLCV
     * @description parses a single opinion price-history point into a unified OHLCV candle
     * @param {object} ohlcv the raw { p, t } point
     * @param {object} [market] the outcome object the candle belongs to
     * @returns {int[]} a candle ordered as timestamp, open, high, low, close, volume
     */
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    /**
     * @ignore
     * @method
     * @name opinion#loadQuoteToken
     * @description fetches and caches quote-token metadata needed to sign orders
     * @param {string} quoteTokenAddress the on-chain quote-token contract address, read from a 'quoteToken' field
     * @returns {object} the matching quote-token entry
     */
    loadQuoteToken(quoteTokenAddress: Str): Promise<Dict>;
    /**
     * @ignore
     * @method
     * @name opinion#loadMultiSignAddress
     * @description fetches and caches the per-wallet multi-signature address that owns order assets
     * @returns {string} the multi-sig wallet address for this.walletAddress on chain 56, or this.walletAddress itself if none exists yet
     */
    loadMultiSignAddress(): Promise<string>;
    signOpinionOrder(order: Dict, exchangeAddress: string): string;
    opinionOrderRawAmounts(isMarket: boolean, side: string, amount: Num, price: Num, decimals: number): Dict;
    /**
     * @method
     * @name opinion#createOrder
     * @description places a limit or market order on the CLOB for the given outcome token
     * @see https://docs.opinion.trade/developer-guide/opinion-open-api/order
     * @param {string} outcome unified outcome or outcome token id
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount for limit orders, the number of outcome shares to trade; for market orders, the quote (USDT) to spend on a BUY or the shares to sell on a SELL
     * @param {float} [price] the price per outcome token between 0 and 1; required for limit orders and market SELL orders (where it acts as the reference / worst acceptable price for the taker amount); ignored for market BUY orders (amount is already the quote to spend)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {bool} [params.postOnly] limit orders only - reject the order if it would cross the spread
     * @returns {object} a [prediction order structure](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    createOrder(outcome: string, type: Str, side: Str, amount: Num, price?: Num, params?: {}): Promise<PredictionOrder>;
    /**
     * @method
     * @name opinion#cancelOrder
     * @description cancels a single open order by id
     * @see https://docs.opinion.trade/developer-guide/opinion-open-api/order
     * @param {string} id the order id
     * @param {string} [outcome] not used by opinion cancelOrder
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [prediction order structure](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    cancelOrder(id: Str, outcome?: Str, params?: {}): Promise<PredictionOrder>;
    /**
     * @ignore
     * @method
     * @name opinion#parseOrderStatus
     * @description maps an opinion order statusEnum string to the unified status vocabulary
     * @param {string} status the raw opinion order statusEnum
     * @returns {string} a unified order status
     */
    parseOrderStatus(status: Str): Str;
    /**
     * @method
     * @name opinion#parsePredictionOrder
     * @description parses a raw opinion order object into a unified prediction order structure
     * @param {object} order the raw opinion OrderData object
     * @param {object} [market] the outcome object the order belongs to
     * @returns {object} a [prediction order structure](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    parsePredictionOrder(order: Dict, market?: Market): PredictionOrder;
    /**
     * @method
     * @name opinion#fetchOrders
     * @description fetches all of the authenticated user's orders
     * @see https://docs.opinion.trade/developer-guide/opinion-open-api/order
     * @param {string} [outcome] filter by unified outcome or outcome token id
     * @param {int} [since] timestamp in ms of the earliest order to fetch
     * @param {int} [limit] the maximum number of orders to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [prediction order structures](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    fetchOrders(outcome?: Str, since?: Int, limit?: Int, params?: {}): Promise<PredictionOrder[]>;
    /**
     * @method
     * @name opinion#fetchOrder
     * @description fetches a single order by id
     * @see https://docs.opinion.trade/developer-guide/opinion-open-api/order
     * @param {string} id the order id
     * @param {string} [outcome] unified outcome or outcome token id
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [prediction order structure](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    fetchOrder(id: Str, outcome?: Str, params?: {}): Promise<PredictionOrder>;
    /**
     * @method
     * @name opinion#fetchOpenOrders
     * @description fetches the authenticated user's open orders
     * @see https://docs.opinion.trade/developer-guide/opinion-open-api/order
     * @param {string} [outcome] filter by unified outcome or outcome token id
     * @param {int} [since] timestamp in ms of the earliest order to fetch
     * @param {int} [limit] the maximum number of orders to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [prediction order structures](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    fetchOpenOrders(outcome?: Str, since?: Int, limit?: Int, params?: {}): Promise<PredictionOrder[]>;
    /**
     * @method
     * @name opinion#fetchClosedOrders
     * @description fetches the authenticated user's closed orders
     * @see https://docs.opinion.trade/developer-guide/opinion-open-api/order
     * @param {string} [outcome] filter by unified outcome or outcome token id
     * @param {int} [since] timestamp in ms of the earliest order to fetch
     * @param {int} [limit] the maximum number of orders to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [prediction order structures](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    fetchClosedOrders(outcome?: Str, since?: Int, limit?: Int, params?: {}): Promise<PredictionOrder[]>;
    /**
     * @method
     * @name opinion#fetchMyTrades
     * @description fetches the authenticated user's trades
     * @see https://docs.opinion.trade/developer-guide/opinion-open-api/trade
     * @param {string} [outcome] filter by unified outcome or outcome token id
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum number of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [prediction trade structures](https://docs.ccxt.com/#/?id=prediction-trade-structure)
     */
    fetchMyTrades(outcome?: Str, since?: Int, limit?: Int, params?: {}): Promise<PredictionTrade[]>;
    /**
     * @ignore
     * @method
     * @name opinion#loadTradeMarket
     * @description fetches and caches a single market by its numeric marketId, and indexes its outcomes
     * @param {int} marketId the numeric market id
     * @returns {object} the parsed market
     */
    loadTradeMarket(marketId: Int): Promise<Market>;
    /**
     * @ignore
     * @method
     * @name opinion#parsePredictionTrade
     * @description parses a raw opinion trade object into a unified trade object
     * @param {object} trade the raw opinion TradeData object
     * @param {object} [market] the outcome object the trade belongs to
     * @returns {object} a [prediction trade structure](https://docs.ccxt.com/#/?id=prediction-trade-structure)
     */
    parsePredictionTrade(trade: Dict, market?: Market): PredictionTrade;
    /**
     * @method
     * @name opinion#fetchBalance
     * @description fetches the authenticated user's quote-token balances
     * @see https://docs.opinion.trade/developer-guide/opinion-open-api/quote-token
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)
     */
    fetchBalance(params?: {}): Promise<Balances>;
    /**
     * @ignore
     * @method
     * @name opinion#parseBalance
     * @description parses an opinion user-balance response into a unified balances object
     * @param {object} response the raw user-balance response
     * @returns {object} a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)
     */
    parseBalance(response: any): Balances;
    /**
     * @method
     * @name opinion#fetchPositions
     * @description fetches the authenticated user's open positions
     * @see https://docs.opinion.trade/developer-guide/opinion-open-api/position
     * @param {string[]} [outcomes] filter by unified outcomes or outcome token ids
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [prediction position structures](https://docs.ccxt.com/#/?id=prediction-position-structure)
     */
    fetchPositions(outcomes?: Strings, params?: {}): Promise<PredictionPosition[]>;
    /**
     * @ignore
     * @method
     * @name opinion#parsePredictionPosition
     * @description parses a raw opinion position object into a unified position object
     * @param {object} position the raw opinion PositionData object
     * @param {object} [market] the outcome object the position belongs to
     * @returns {object} a [prediction position structure](https://docs.ccxt.com/#/?id=prediction-position-structure)
     */
    parsePredictionPosition(position: Dict, market?: Market): PredictionPosition;
    hashMessage(message: any): string;
    signHash(hash: string, privateKey: string): Dict;
    signMessage(message: any, privateKey: string): Dict;
    signApiKeyAuth(walletAddress: string, action: string, timestamp: string): string;
    /**
     * @method
     * @name opinion#createApiKey
     * @description self-service creation of an Open API key linked to this.walletAddress via
     * an EIP-712-signed request - there is no "generate key" button in the Opinion GUI, this is
     * the only documented way to obtain a wallet-linked key
     * @see https://docs.opinion.trade/developer-guide/opinion-open-api/authentication
     * @param {object} [params] extra parameters
     * @returns {object} the api credentials { apiKey, walletAddress }
     */
    createApiKey(params?: {}): Promise<Dict>;
    /**
     * @method
     * @name opinion#fetchApiKey
     * @description fetches the currently active Open API key for this.walletAddress
     * @see https://docs.opinion.trade/developer-guide/opinion-open-api/authentication
     * @param {object} [params] extra parameters
     * @returns {object} the api credentials { apiKey, walletAddress }
     */
    fetchApiKey(params?: {}): Promise<Dict>;
    /**
     * @method
     * @name opinion#deleteApiKey
     * @description revokes the Open API key for this.walletAddress
     * @see https://docs.opinion.trade/developer-guide/opinion-open-api/authentication
     * @param {object} [params] extra parameters
     * @returns {object} raw response, result.deleted confirms revocation
     */
    deleteApiKey(params?: {}): Promise<Dict>;
    /**
     * @ignore
     * @method
     * @name opinion#loadApiKey
     * @description ensures an apiKey is available before a private call - reuses a directly-set key, otherwise
     * self-issues one from the walletAddress/privateKey via fetchApiKey(), falling back to createApiKey() when
     * the wallet has no key yet; freshly created keys can take ~15 seconds to activate venue-side
     * @returns {string} the apiKey
     */
    loadApiKey(): Promise<Str>;
    setApiCredentials(response: Dict): Dict;
    /**
     * @ignore
     * @method
     * @name opinion#opinionWsUrl
     * @description builds the websocket url - the venue authenticates the whole connection with the apiKey passed as a query parameter, for public and private channels alike
     * @returns {string} the websocket url
     */
    opinionWsUrl(): string;
    ping(client: any): {
        action: string;
    };
    /**
     * @ignore
     * @method
     * @name opinion#subscribeOpinionChannel
     * @description subscribes to one venue channel scoped by the binary marketId and waits on the given message hash
     * @param {string} messageHash the internal hash the awaited payload resolves on
     * @param {string} channel the venue channel name (e.g. 'market.depth.diff')
     * @param {int} marketId the numeric binary market id
     * @returns {any} the first resolved payload
     */
    subscribeOpinionChannel(messageHash: string, channel: string, marketId: Int): Promise<any>;
    handleMessage(client: any, message: any): void;
    /**
     * @ignore
     * @method
     * @name opinion#opinionOutcomeByMarketIdSide
     * @description resolves a cached outcome object from the numeric marketId + outcomeSide (1 yes / 2 no) the user channels report instead of a tokenId - cache-only, returns undefined on a cold cache
     * @param {int} marketId the numeric binary market id
     * @param {int} outcomeSide 1 for the yes token, 2 for the no token
     * @returns {object} the outcome object, or undefined
     */
    opinionOutcomeByMarketIdSide(marketId: Int, outcomeSide: Int): any;
    /**
     * @method
     * @name opinion#watchOrderBook
     * @description streams the order book of an outcome token; the channel is delta-only so the live book is seeded from the REST snapshot
     * @see https://docs.opinion.trade/developer-guide/opinion-websocket/market-channels
     * @param {string} outcome unified outcome or outcome token id
     * @param {int} [limit] the maximum number of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [prediction order book structure](https://docs.ccxt.com/#/?id=prediction-order-book-structure)
     */
    watchOrderBook(outcome: string, limit?: Int, params?: {}): Promise<PredictionOrderBook>;
    seedOrderBook(outcome: Str, sym: Str, limit?: Int): Promise<void>;
    handleOrderBook(client: any, message: any): void;
    /**
     * @method
     * @name opinion#watchTicker
     * @description streams last-price updates of an outcome token
     * @see https://docs.opinion.trade/developer-guide/opinion-websocket/market-channels
     * @param {string} outcome unified outcome or outcome token id
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [prediction ticker structure](https://docs.ccxt.com/#/?id=prediction-ticker-structure)
     */
    watchTicker(outcome: string, params?: {}): Promise<PredictionTicker>;
    handleTicker(client: any, message: any): void;
    /**
     * @method
     * @name opinion#watchTrades
     * @description streams public trades of an outcome token
     * @see https://docs.opinion.trade/developer-guide/opinion-websocket/market-channels
     * @param {string} outcome unified outcome or outcome token id
     * @param {int} [since] timestamp in ms of the earliest trade to return
     * @param {int} [limit] the maximum number of trades to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [prediction trade structures](https://docs.ccxt.com/#/?id=prediction-trade-structure)
     */
    watchTrades(outcome: string, since?: Int, limit?: Int, params?: {}): Promise<PredictionTrade[]>;
    handleTrades(client: any, message: any): void;
    /**
     * @method
     * @name opinion#watchOrders
     * @description streams the authenticated user's order updates of one market - the venue channel is per-market, so the outcome argument is required
     * @see https://docs.opinion.trade/developer-guide/opinion-websocket/user-channels
     * @param {string} outcome unified outcome or outcome token id whose market to watch
     * @param {int} [since] timestamp in ms of the earliest order to return
     * @param {int} [limit] the maximum number of orders to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [prediction order structures](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    watchOrders(outcome?: Str, since?: Int, limit?: Int, params?: {}): Promise<PredictionOrder[]>;
    /**
     * @ignore
     * @method
     * @name opinion#parseWsOrderStatus
     * @description maps the numeric order status of the websocket order channel onto the unified vocabulary
     * @param {int} status the numeric order status
     * @returns {string} a unified order status, or undefined
     */
    parseWsOrderStatus(status: Int): Str;
    handleOrder(client: any, message: any): void;
    /**
     * @method
     * @name opinion#watchMyTrades
     * @description streams the authenticated user's executed trades of one market - the venue channel is per-market, so the outcome argument is required
     * @see https://docs.opinion.trade/developer-guide/opinion-websocket/user-channels
     * @param {string} outcome unified outcome or outcome token id whose market to watch
     * @param {int} [since] timestamp in ms of the earliest trade to return
     * @param {int} [limit] the maximum number of trades to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [prediction trade structures](https://docs.ccxt.com/#/?id=prediction-trade-structure)
     */
    watchMyTrades(outcome?: Str, since?: Int, limit?: Int, params?: {}): Promise<PredictionTrade[]>;
    handleMyTrade(client: any, message: any): void;
    handleErrors(code: Int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): undefined;
    /**
     * @ignore
     * @method
     * @name opinion#sign
     * @description builds the request url and attaches the apikey/EIP-712 authentication headers for private endpoints
     * @param {string} path the endpoint path
     * @param {string|string[]} api the api group and access level
     * @param {string} method the http method
     * @param {object} params the request parameters
     * @param {object} [headers] request headers
     * @param {string} [body] the request body
     * @returns {object} a dict with url, method, body and headers
     */
    sign(path: any, api?: any, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
}
