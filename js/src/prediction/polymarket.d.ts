import Exchange from '../abstract/prediction/polymarket.js';
import type { Int, Str, Num, Dict, Market, PredictionTickers, PredictionOrderBook, OHLCV, PredictionOrderRequest, Balances, Strings, PredictionOpenInterest, PredictionTradingFee, PredictionEvent, PredictionTicker, PredictionOrder, PredictionTrade, PredictionPosition, fetchEventsParams } from '../base/types.js';
/**
 * @class polymarket
 * @augments Exchange
 */
export default class polymarket extends Exchange {
    describe(): any;
    /**
     * @method
     * @name polymarket#fetchMarkets
     * @description retrieves data on all markets for polymarket, each prediction market becomes one market with its outcome tokens listed under the outcomes key
     * @see https://docs.polymarket.com/api-reference/events/list-events
     * @see https://docs.polymarket.com/api-reference/search/search-markets-events-and-profiles
     * @param {object} [params] extra exchange-specific parameters
     * @param {string} [params.query] a single search term used to filter the fetched events
     * @param {string[]} [params.queries] multiple search terms (alternative to query)
     * @param {string[]} [params.tags] filter events by tag — human-readable labels ("Fed Rates") or slugs ("fed-rates") both work; multiple tags match ANY (one gamma listing per tag, unioned)
     * @param {string} [params.status] 'active', 'closed' or 'all', the status of the events to fetch, defaults to 'active'
     * @param {int} [params.limit] max number of events to fetch when no query is given (defaults to options.fetchMarketsLimit, 200); the listing is ordered by 24h volume so the most active markets come first — outcomes on lower-volume markets are resolvable on demand by their token id (fetchOutcome)
     * @returns {object[]} an array of objects representing market data
     */
    fetchMarkets(params?: {}): Promise<Market[]>;
    /**
     * @ignore
     * @method
     * @name polymarket#fetchRawEventsBySearch
     * @description fetches raw gamma event objects matching the given search terms, paginating through all result pages
     * @see https://docs.polymarket.com/api-reference/search/search-markets-events-and-profiles
     * @param {string[]} queries search terms
     * @param {object} [params] extra exchange-specific parameters
     * @param {int} [params.limit] page size per search query, defaults to 50
     * @returns {object[]} an array of raw gamma event objects
     */
    fetchRawEventsBySearch(queries: any[], params?: {}): Promise<any[]>;
    /**
     * @ignore
     * @method
     * @name polymarket#tagToSlug
     * @description converts a human-readable tag label into gamma's slug form, "Fed Rates" -> "fed-rates"; lowercase alphanumeric runs joined by single dashes, so a tag already in slug form passes through unchanged
     * @param {string} tag the tag label or slug
     * @returns {string} the gamma tag slug
     */
    tagToSlug(tag: string): string;
    /**
     * @ignore
     * @method
     * @name polymarket#fetchRawEventsList
     * @description fetches raw gamma event objects from the events listing endpoint, paginating in parallel
     * @see https://docs.polymarket.com/api-reference/events/list-events
     * @param {object} [params] extra exchange-specific parameters
     * @param {string} [params.status] 'active', 'closed' or 'all', defaults to options.defaultEventStatus
     * @param {int} [params.limit] max number of events to fetch (default options.fetchMarketsLimit); the listing is ordered by 24h volume so the most active markets come first
     * @returns {object[]} an array of raw gamma event objects
     */
    fetchRawEventsList(params?: {}): Promise<any[]>;
    parseEventToMarkets(event: Dict): Market[];
    /**
     * @ignore
     * @method
     * @name polymarket#fetchOutcome
     * @description resolves a single outcome by its CLOB token id in one request, so a cache miss
     * (a bare token id, or a valid outcome on a market outside the top-volume cold cache) recovers
     * instead of throwing BadSymbol. an outcome HANDLE ("MARKET:LABEL") carries no token id, so it
     * falls back to the base bulk load
     * @param {string} outcomeSymbol the outcome token id or handle
     * @returns {object} the resolved outcome object
     */
    fetchOutcome(outcomeSymbol: string): Promise<any>;
    /**
     * @ignore
     * @method
     * @name polymarket#fetchOutcomes
     * @description resolves several uncached outcomes at once — bare CLOB token ids are batched into gamma markets requests (repeated clob_token_ids params, 50 per request to keep the URL bounded); handle-shaped symbols fall back to the single fetch and its search path
     * @see https://docs.polymarket.com/api-reference/markets/list-markets
     * @param {string[]} outcomeSymbols outcome token ids or handles
     * @returns {object} the outcome cache
     */
    fetchOutcomes(outcomeSymbols: string[]): Promise<any>;
    /**
     * @method
     * @name polymarket#fetchTicker
     * @description fetches the current mid-price and best bid/ask for a single outcome token
     * @see https://docs.polymarket.com/api-reference/data/get-midpoint-price
     * @see https://docs.polymarket.com/api-reference/market-data/get-order-book
     * @see https://docs.polymarket.com/api-reference/data/get-last-trade-price
     * @param {string} outcome unified outcome like TRUMP_DANCE_TODAY_997:YES or an outcome token id
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [prediction ticker structure](https://docs.ccxt.com/#/?id=prediction-ticker-structure)
     */
    fetchTicker(outcome: string, params?: {}): Promise<PredictionTicker>;
    /**
     * @method
     * @name polymarket#fetchTickers
     * @description fetches tickers for multiple outcome tokens at once using the batched CLOB book, midpoint and last-trade-price endpoints (200 per request trio)
     * @see https://docs.polymarket.com/api-reference/market-data/get-order-books-request-body
     * @see https://docs.polymarket.com/api-reference/market-data/get-midpoint-prices-request-body
     * @see https://docs.polymarket.com/api-reference/data/get-last-trades-prices
     * @param {string[]} outcomes unified outcomes or outcome token ids — required: polymarket has no endpoint returning all tickers at once, so an unscoped call is not supported
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [prediction ticker structures](https://docs.ccxt.com/#/?id=prediction-ticker-structure) indexed by outcome
     */
    fetchTickers(outcomes?: Strings, params?: {}): Promise<PredictionTickers>;
    /**
     * @ignore
     * @method
     * @name polymarket#parsePredictionTicker
     * @description parses a combined midpoint + order book response into a unified ticker object
     * @param {object} ticker a dict with midpoint and book entries
     * @param {object} [market] the outcome object the ticker belongs to
     * @returns {object} a [prediction ticker structure](https://docs.ccxt.com/#/?id=prediction-ticker-structure)
     */
    parsePredictionTicker(ticker: Dict, market?: Market): PredictionTicker;
    /**
     * @method
     * @name polymarket#fetchOrderBook
     * @description fetches the CLOB order book for a single outcome token
     * @see https://docs.polymarket.com/api-reference/market-data/get-order-book
     * @param {string} outcome unified outcome or outcome token id
     * @param {int} [limit] not used by polymarket fetchOrderBook
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [prediction order book structure](https://docs.ccxt.com/#/?id=prediction-order-book-structure)
     */
    fetchOrderBook(outcome: string, limit?: Int, params?: {}): Promise<PredictionOrderBook>;
    /**
     * @method
     * @name polymarket#fetchOHLCV
     * @description fetches price history ticks for a single outcome token and buckets them client-side into OHLCV candles, snapping tick timestamps to the candle boundary
     * @see https://docs.polymarket.com/api-reference/markets/get-prices-history
     * @param {string} outcome unified outcome or outcome token id
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum number of candles to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} a list of candles ordered as timestamp, open, high, low, close, volume
     */
    fetchOHLCV(outcome: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    /**
     * @method
     * @name polymarket#fetchTime
     * @description fetches the current timestamp from the CLOB server
     * @see https://docs.polymarket.com/api-reference/data/get-server-time
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current server time in milliseconds
     */
    fetchTime(params?: {}): Promise<Int>;
    /**
     * @method
     * @name polymarket#fetchStatus
     * @description fetches the gamma API health status
     * @see https://docs.polymarket.com/api-reference/events/list-events
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [status structure](https://docs.ccxt.com/#/?id=exchange-status-structure)
     */
    fetchStatus(params?: {}): Promise<any>;
    /**
     * @method
     * @name polymarket#fetchOpenInterest
     * @description fetches the open interest of a prediction market outcome
     * @see https://docs.polymarket.com/api-reference/misc/get-open-interest
     * @param {string} outcome unified outcome or outcome token id
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [open interest structure](https://docs.ccxt.com/#/?id=open-interest-structure)
     */
    fetchOpenInterest(outcome: string, params?: {}): Promise<PredictionOpenInterest>;
    parsePredictionOpenInterest(interest: any, market?: Market): PredictionOpenInterest;
    /**
     * @method
     * @name polymarket#fetchTradingFee
     * @description fetches the base fee rate for a prediction market outcome token
     * @see https://docs.polymarket.com/api-reference/market-data/get-fee-rate
     * @param {string} outcome unified outcome or outcome token id
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [fee structure](https://docs.ccxt.com/#/?id=fee-structure)
     */
    fetchTradingFee(outcome: string, params?: {}): Promise<PredictionTradingFee>;
    /**
     * @method
     * @name polymarket#fetchTrades
     * @description fetches public trade history for a single outcome token from the data API
     * @see https://docs.polymarket.com/api-reference/core/get-trades-for-a-user-or-markets
     * @param {string} outcome unified outcome or outcome token id
     * @param {int} [since] not used by polymarket fetchTrades
     * @param {int} [limit] the maximum number of trades to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [prediction trade structures](https://docs.ccxt.com/#/?id=prediction-trade-structure)
     */
    fetchTrades(outcome: string, since?: Int, limit?: Int, params?: {}): Promise<PredictionTrade[]>;
    /**
     * @method
     * @name polymarket#fetchMyTrades
     * @description fetches the authenticated user's trade history from the CLOB, optionally filtered by outcome token
     * @see https://docs.polymarket.com/api-reference/trade/get-trades
     * @param {string} [outcome] unified outcome or outcome token id
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [prediction trade structures](https://docs.ccxt.com/#/?id=prediction-trade-structure)
     */
    fetchMyTrades(outcome?: Str, since?: Int, limit?: Int, params?: {}): Promise<PredictionTrade[]>;
    /**
     * @method
     * @name polymarket#fetchOrderTrades
     * @description fetches all the trades made from a single order
     * @see https://docs.polymarket.com/api-reference/trade/get-trades
     * @param {string} id the order id
     * @param {string} [outcome] unified outcome or outcome token id to narrow the lookup
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [prediction trade structures](https://docs.ccxt.com/#/?id=prediction-trade-structure)
     */
    fetchOrderTrades(id: string, outcome?: Str, since?: Int, limit?: Int, params?: {}): Promise<PredictionTrade[]>;
    /**
     * @ignore
     * @method
     * @name polymarket#parsePredictionTrade
     * @description parses a raw data API trade object into a unified trade object
     * @param {object} trade the raw trade object
     * @param {object} [market] the outcome object the trade belongs to
     * @returns {object} a [prediction trade structure](https://docs.ccxt.com/#/?id=prediction-trade-structure)
     */
    parsePredictionTrade(trade: Dict, market?: Market): PredictionTrade;
    /**
     * @method
     * @name polymarket#fetchBalance
     * @description fetches the USDC collateral balance available for trading on the CLOB
     * @see https://docs.polymarket.com/api-reference/trade/get-balance-allowance
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.signatureType] 0=EOA, 1=POLY_PROXY, 2=GNOSIS_SAFE, 3=POLY_1271 (deposit wallet); defaults to options.signatureType
     * @returns {object} a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)
     */
    fetchBalance(params?: {}): Promise<Balances>;
    /**
     * @ignore
     * @method
     * @name polymarket#parseBalance
     * @description parses a balance-allowance response into a balances object with a USDC entry
     * @param {object} response the raw balance-allowance response
     * @returns {object} a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)
     */
    parseBalance(response: any): Balances;
    /**
     * @method
     * @name polymarket#fetchPositions
     * @description fetches open outcome token positions for the wallet from the data API
     * @see https://docs.polymarket.com/api-reference/core/get-current-positions-for-a-user
     * @param {string[]} [outcomes] unified outcomes to filter by
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [prediction position structures](https://docs.ccxt.com/#/?id=prediction-position-structure)
     */
    fetchPositions(outcomes?: Strings, params?: {}): Promise<PredictionPosition[]>;
    /**
     * @method
     * @name polymarket#fetchPosition
     * @description fetches the open position for a single outcome token
     * @see https://docs.polymarket.com/api-reference/core/get-current-positions-for-a-user
     * @param {string} outcome unified outcome or outcome token id
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [prediction position structure](https://docs.ccxt.com/#/?id=prediction-position-structure)
     */
    fetchPosition(outcome: string, params?: {}): Promise<PredictionPosition>;
    /**
     * @ignore
     * @method
     * @name polymarket#parsePredictionPosition
     * @description parses a raw data API position object into a unified position object
     * @param {object} position the raw position object
     * @param {object} [market] the outcome object the position belongs to
     * @returns {object} a [prediction position structure](https://docs.ccxt.com/#/?id=prediction-position-structure)
     */
    parsePredictionPosition(position: Dict, market?: Market): PredictionPosition;
    /**
     * @method
     * @name polymarket#fetchOpenOrders
     * @description fetches open resting orders for the authenticated user, optionally filtered by outcome token
     * @see https://docs.polymarket.com/api-reference/trade/get-user-orders
     * @param {string} [outcome] unified outcome or outcome token id
     * @param {int} [since] not used by polymarket fetchOpenOrders
     * @param {int} [limit] the maximum number of orders to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [prediction order structures](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    fetchOpenOrders(outcome?: Str, since?: Int, limit?: Int, params?: {}): Promise<PredictionOrder[]>;
    /**
     * @method
     * @name polymarket#fetchOrder
     * @description fetches a single order by id from the CLOB private data endpoint
     * @see https://docs.polymarket.com/api-reference/trade/get-single-order-by-id
     * @param {string} id the order id
     * @param {string} [outcome] unified outcome or outcome token id
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [prediction order structure](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    fetchOrder(id: Str, outcome?: Str, params?: {}): Promise<PredictionOrder>;
    /**
     * @ignore
     * @method
     * @name polymarket#parsePredictionOrder
     * @description parses a raw CLOB order object into a unified order object
     * @param {object} order the raw order object
     * @param {object} [market] the outcome object the order belongs to
     * @returns {object} a [prediction order structure](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    parsePredictionOrder(order: Dict, market?: Market): PredictionOrder;
    /**
     * @ignore
     * @method
     * @name polymarket#parseOrderStatus
     * @description maps a polymarket order status string to the unified status vocabulary
     * @param {string} status the raw polymarket order status
     * @returns {string} a unified order status
     */
    parseOrderStatus(status: Str): Str;
    /**
     * @method
     * @name polymarket#createOrder
     * @description places a limit or market order on the CLOB for the given outcome token
     * @see https://docs.polymarket.com/api-reference/trade/post-a-new-order
     * @param {string} outcome unified outcome or outcome token id
     * @param {string} type 'market' or 'limit'; market orders default to FOK and, when no price is given, use the outcome's current price as the marketable reference
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how many outcome tokens to trade
     * @param {float} [price] the price per outcome token between 0 and 1; required for limit orders, defaults to the outcome's current price for market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.orderType] time-in-force override: 'GTC' (default for limit), 'FOK' (default for market), 'GTD' or 'FAK'
     * @param {int} [params.signatureType] 0=EOA, 1=POLY_PROXY, 2=GNOSIS_SAFE, 3=POLY_1271 (deposit wallet); defaults to options.signatureType
     * @param {string} [params.funder] the wallet that holds the USDC collateral; defaults to options.funder or the signing address
     * @param {string} [params.tickSize] the market tick size ('0.1'/'0.01'/'0.001'/'0.0001'); read from the outcome when omitted
     * @param {bool} [params.negRisk] whether the market is a neg-risk market; read from the outcome when omitted
     * @param {string} [params.salt] order salt; defaults to the current time in ms (pin it for idempotent retries)
     * @param {string} [params.timestamp] order timestamp; defaults to the current time in ms
     * @param {string} [params.expiration] unix-seconds expiration for GTD orders; defaults to '0' (no expiry)
     * @returns {object} a [prediction order structure](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    createOrder(outcome: string, type: Str, side: Str, amount: Num, price?: Num, params?: {}): Promise<PredictionOrder>;
    /**
     * @method
     * @name polymarket#createOrders
     * @description places multiple orders on the CLOB in a single batched request
     * @see https://docs.polymarket.com/api-reference/trade/post-orders
     * @param {object[]} orders a list of order requests, each an object with outcome, type, side, amount, price and optional params (same params as createOrder)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [prediction order structures](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    createOrders(orders: PredictionOrderRequest[], params?: {}): Promise<PredictionOrder[]>;
    /**
     * @ignore
     * @method
     * @name polymarket#buildClobOrderBody
     * @description builds and signs a single CLOB order request body (shared by createOrder and createOrders)
     * @returns {object} an object with 'body' (the signed order request) and 'outcome' (the resolved outcome)
     */
    buildClobOrderBody(outcome: string, type: Str, side: Str, amount: Num, price?: Num, params?: {}): Dict;
    /**
     * @method
     * @name polymarket#createMarketBuyOrderWithCost
     * @description places a market buy order sized by USDC cost (how much to spend) rather than shares
     * @see https://docs.polymarket.com/api-reference/trade/post-a-new-order
     * @param {string} outcome unified outcome or outcome token id
     * @param {float} cost the amount of USDC to spend
     * @param {object} [params] extra parameters specific to the exchange API endpoint (see createOrder)
     * @returns {object} a [prediction order structure](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    createMarketBuyOrderWithCost(outcome: string, cost: number, params?: {}): Promise<PredictionOrder>;
    polymarketOrderRawAmounts(side: string, size: number, price: number, tickSize: string, cost?: Num): Dict;
    signClobOrder(message: Dict, exchangeAddress: string, domainVersion: string, sigType: number): string;
    /**
     * @method
     * @name polymarket#cancelOrder
     * @description cancels a single open order by id on the CLOB
     * @see https://docs.polymarket.com/api-reference/trade/cancel-single-order
     * @param {string} id the order id
     * @param {string} [outcome] unified outcome or outcome token id
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [prediction order structure](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    cancelOrder(id: Str, outcome?: Str, params?: {}): Promise<PredictionOrder>;
    /**
     * @method
     * @name polymarket#cancelOrders
     * @description cancels multiple open orders by id on the CLOB in a single request
     * @see https://docs.polymarket.com/api-reference/trade/cancel-orders
     * @param {string[]} ids the order ids to cancel
     * @param {string} [outcome] not used by polymarket cancelOrders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [prediction order structures](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    cancelOrders(ids: string[], outcome?: Str, params?: {}): Promise<PredictionOrder[]>;
    /**
     * @method
     * @name polymarket#cancelAllOrders
     * @description cancels all open orders on the CLOB, optionally scoped to one outcome token
     * @see https://docs.polymarket.com/api-reference/trade/cancel-all-orders
     * @see https://docs.polymarket.com/api-reference/trade/cancel-market-orders
     * @param {string} [outcome] unified outcome or outcome token id; when given only that outcome's orders are cancelled
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [prediction order structures](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    cancelAllOrders(outcome?: Str, params?: {}): Promise<PredictionOrder[]>;
    /**
     * @method
     * @name polymarket#fetchEvents
     * @description fetches prediction-market events matching the given scope (query/queries/tags/eventId/slug — required) and caches their markets and outcomes on the instance; for an unscoped top-volume browse use fetchMarkets ()
     * @see https://docs.polymarket.com/api-reference/search/search-markets-events-and-profiles
     * @see https://docs.polymarket.com/api-reference/events/list-events
     * @param {object} [params] extra exchange-specific parameters
     * @param {string} [params.query] a single keyword search term
     * @param {string[]} [params.queries] multiple search terms (alternative to query)
     * @param {string[]} [params.tags] filter events by tag — human-readable labels ("Fed Rates") or slugs ("fed-rates") both work; multiple tags match ANY (one gamma listing per tag, unioned and deduped)
     * @param {int} [params.limit] max number of events to return
     * @param {string} [params.sort] 'volume' (default), 'liquidity' or 'newest' — mapped to the gamma order field
     * @param {string} [params.status] 'active' (default), 'inactive', 'closed' or 'all' ('inactive' and 'closed' are interchangeable)
     * @param {string} [params.searchIn] when searching, restrict the match to 'title' (default), 'description' or 'both'
     * @param {string} [params.eventId] direct lookup by event id (short-circuits the listing/search)
     * @param {string} [params.slug] direct lookup by event slug
     * @param {int} [params.searchPageSize] search page size (gamma limit_per_type, default 100); lower it to shrink the download when a small limit is enough, higher to over-fetch before client-side status/title filtering
     * @param {int} [params.maxSearchPages] max search pages to fetch when no limit is given (default 5), bounding a broad query
     * @returns {object[]} an array of event structures
     */
    fetchEvents(params?: fetchEventsParams): Promise<PredictionEvent[]>;
    /**
     * @method
     * @name polymarket#fetchEvent
     * @description fetches a single prediction-market event by its id or slug
     * @see https://docs.polymarket.com/api-reference/events/get-event-by-id
     * @see https://docs.polymarket.com/api-reference/events/get-event-by-slug
     * @param {string} id the event id (numeric) or slug
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [prediction event structure](https://docs.ccxt.com/#/?id=prediction-event-structure)
     */
    fetchEvent(id: string, params?: {}): Promise<PredictionEvent>;
    parseEvent(rawEvent: Dict): Dict;
    /**
     * @ignore
     * @method
     * @name polymarket#parseEvents
     * @description parses an array of raw gamma event objects into unified event objects
     * @param {object[]} rawEvents the raw gamma event objects
     * @returns {object[]} a list of event structures
     */
    parseEvents(rawEvents: any[]): any[];
    handleErrors(code: Int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): any;
    /**
     * @ignore
     * @method
     * @name polymarket#sign
     * @description builds the request url and attaches HMAC-SHA256 authentication headers for private endpoints
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
    hashMessage(message: any): string;
    ethChecksumAddress(address: string): string;
    signHash(hash: string, privateKey: string): Dict;
    signMessage(message: any, privateKey: string): Dict;
    signClobAuth(address: string, timestamp: string, nonce: number): string;
    /**
     * @method
     * @name polymarket#deriveApiKey
     * @description derives the L2 api credentials (apiKey, secret, passphrase) deterministically from the wallet private key
     * @see https://docs.polymarket.com/developers/CLOB/authentication
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.nonce] the nonce used to derive the credentials, defaults to 0
     * @returns {object} the api credentials { apiKey, secret, passphrase }
     */
    deriveApiKey(params?: {}): Promise<Dict>;
    /**
     * @method
     * @name polymarket#createApiKey
     * @description creates new L2 api credentials (apiKey, secret, passphrase) for the wallet private key
     * @see https://docs.polymarket.com/developers/CLOB/authentication
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.nonce] the nonce used to create the credentials, defaults to 0
     * @returns {object} the api credentials { apiKey, secret, passphrase }
     */
    createApiKey(params?: {}): Promise<Dict>;
    /**
     * @method
     * @name polymarket#createOrDeriveApiKey
     * @description derives the existing L2 api credentials for the wallet private key, creating them if none exist yet
     * @see https://docs.polymarket.com/developers/CLOB/authentication
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} the api credentials { apiKey, secret, passphrase }
     */
    createOrDeriveApiKey(params?: {}): Promise<Dict>;
    setApiCredentials(response: Dict): Dict;
    /**
     * @ignore
     * @method
     * @name polymarket#loadApiCredentials
     * @description ensures L2 api credentials are available for private requests — uses the provided apiKey/secret/password when present, otherwise derives them from the privateKey
     */
    loadApiCredentials(): Promise<void>;
    ping(client: any): string;
    handleMessage(client: any, message: any): void;
    handleOrderBookSnapshot(client: any, event: any): void;
    handleOrderBookDelta(client: any, event: any): void;
    handleTrade(client: any, event: any): void;
    /**
     * @method
     * @name polymarket#watchOrderBook
     * @description streams live order-book updates for a single Polymarket outcome token
     * @param {string} outcome unified outcome (e.g. "TRUMP_WINS_2028:YES") or an outcome token id
     * @param {int} [limit] optional depth limit applied after resolving
     * @param {object} [params] extra params (currently unused)
     * @returns {object} a [prediction order book structure]{@link https://docs.ccxt.com/#/?id=prediction-order-book-structure}
     */
    watchOrderBook(outcome: Str, limit?: Int, params?: {}): Promise<PredictionOrderBook>;
    /**
     * @method
     * @name polymarket#watchTrades
     * @description streams live fills for a single Polymarket outcome token
     * @param {string} outcome unified outcome
     * @param {int} [since] optional unix timestamp (ms) lower bound
     * @param {int} [limit] optional max number of trades to return
     * @param {object} [params] extra params (unused)
     * @returns {object[]} a list of [prediction trade structures]{@link https://docs.ccxt.com/#/?id=prediction-trade-structure}
     */
    watchTrades(outcome: Str, since?: Int, limit?: Int, params?: {}): Promise<PredictionTrade[]>;
    /**
     * @method
     * @name polymarket#watchTicker
     * @description streams a synthetic ticker derived from order-book snapshots and deltas (mid = (bid + ask) / 2)
     * @param {string} outcome unified outcome
     * @param {object} [params] extra params (unused)
     * @returns {object} a [prediction ticker structure]{@link https://docs.ccxt.com/#/?id=prediction-ticker-structure}
     */
    watchTicker(outcome: Str, params?: {}): Promise<PredictionTicker>;
    /**
     * @method
     * @name polymarket#watchOrders
     * @description watches the authenticated user's order updates over the CLOB user websocket channel
     * @see https://docs.polymarket.com/developers/CLOB/websocket/user-channel
     * @param {string} [outcome] unified outcome to filter the stream to one market
     * @param {int} [since] the earliest time in ms to return orders for
     * @param {int} [limit] the maximum number of orders to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [prediction order structures](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    watchOrders(outcome?: Str, since?: Int, limit?: Int, params?: {}): Promise<PredictionOrder[]>;
    /**
     * @method
     * @name polymarket#watchMyTrades
     * @description watches the authenticated user's trade fills over the CLOB user websocket channel
     * @see https://docs.polymarket.com/developers/CLOB/websocket/user-channel
     * @param {string} [outcome] unified outcome to filter the stream to one market
     * @param {int} [since] the earliest time in ms to return trades for
     * @param {int} [limit] the maximum number of trades to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [prediction trade structures](https://docs.ccxt.com/#/?id=prediction-trade-structure)
     */
    watchMyTrades(outcome?: Str, since?: Int, limit?: Int, params?: {}): Promise<PredictionTrade[]>;
    subscribeUserChannel(messageHash: string, params?: {}): Promise<any>;
    handleOrder(client: any, event: any): void;
    handleMyTrade(client: any, event: any): void;
    tokenIdToSymbol(tokenId: string): Str;
    parsePolyTimestamp(raw: Str): number;
}
