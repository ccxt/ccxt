import Exchange from '../abstract/prediction/kalshi.js';
import type { Int, int, Str, Num, Dict, Strings, Market, PredictionOrderBook, OHLCV, Balances, PredictionOpenInterest, PredictionEvent, PredictionTicker, PredictionTickers, PredictionOrder, PredictionTrade, PredictionPosition, PredictionSettlement, fetchEventsParams } from '../base/types.js';
/**
 * @class kalshi
 * @augments Exchange
 */
export default class kalshi extends Exchange {
    describe(): any;
    /**
     * @method
     * @name kalshi#fetchMarkets
     * @description fetches kalshi markets; with a query it resolves the query via the events endpoint and returns the matched events' markets, otherwise it pages the markets listing
     * @see https://trading-api.readme.io/reference/getmarkets
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.query] a single search query; resolved against the events endpoint (event title/ticker), then the matched events' markets are returned
     * @param {string[]} [params.queries] multiple search queries (alternative to query); markets from any matching event are returned
     * @param {int} [params.limit] for an unscoped listing (no query), the max number of markets to collect (defaults to options.maxFetchMarketsLimit, 1000)
     * @returns {object[]} an array of objects representing market data
     */
    fetchMarkets(params?: {}): Promise<Market[]>;
    parseBinaryMarketToOutcomes(raw: Dict): Market[];
    /**
     * @ignore
     * @method
     * @name kalshi#fetchOutcome
     * @description resolves a single outcome on demand instead of bulk-loading. kalshi has tens of
     * thousands of markets, so an id-form miss fetches just the requested market by ticker, and a
     * handle-form miss resolves through the series-scoped events listing (a handle's first token is
     * its series ticker); both merge into the cache so repeat lookups are free
     * @param {string} outcomeSymbol an outcome id — a kalshi ticker, or a ticker with a '-NO' suffix — or a unified handle like KXBTCD_26JUL1417_53_000_ABOVE:YES
     * @returns {object} the resolved outcome object
     */
    fetchOutcome(outcomeSymbol: string): Promise<any>;
    /**
     * @ignore
     * @method
     * @name kalshi#fetchOutcomes
     * @description resolves several uncached outcomes at once — ticker-shaped ids are batched through the markets listing's tickers filter (100 per request); anything left unresolved (handle-shaped symbols, unknown tickers) falls back to the single fetch and its guidance-rich BadSymbol
     * @see https://docs.kalshi.com/api-reference/market/get-markets
     * @param {string[]} outcomeSymbols kalshi tickers (optionally with a '-NO' suffix) or outcome handles
     * @returns {object} the outcome cache
     */
    fetchOutcomes(outcomeSymbols: string[]): Promise<any>;
    handleErrors(code: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): any;
    calculateFee(symbol: string, type: string, side: string, amount: number, price: number, takerOrMaker?: string, params?: {}): {
        type: string;
        currency: string;
        rate: number;
        cost: number;
    };
    parseMarket(raw: Dict): Market;
    /**
     * @method
     * @name kalshi#fetchTicker
     * @description fetches the current market price and bid/ask for a single kalshi outcome
     * @see https://docs.kalshi.com/api-reference/market/get-market
     * @param {string} outcome the unified outcome like TRUMP_BRING_BACK_MANUFACTURING:YES or outcomeId like KXGDPSHAREMANU-29
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [prediction ticker structure](https://docs.ccxt.com/#/?id=prediction-ticker-structure)
     */
    fetchTicker(outcome: Str, params?: {}): Promise<PredictionTicker>;
    /**
     * @method
     * @name kalshi#fetchStatus
     * @description fetches the kalshi exchange status
     * @see https://docs.kalshi.com/api-reference/exchange/get-exchange-status
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [status structure](https://docs.ccxt.com/#/?id=exchange-status-structure)
     */
    fetchStatus(params?: {}): Promise<any>;
    /**
     * @method
     * @name kalshi#fetchOpenInterest
     * @description fetches the open interest of a prediction market outcome
     * @see https://docs.kalshi.com/api-reference/market/get-market
     * @param {string} outcome unified outcome or outcome id
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [open interest structure](https://docs.ccxt.com/#/?id=open-interest-structure)
     */
    fetchOpenInterest(outcome: string, params?: {}): Promise<PredictionOpenInterest>;
    parsePredictionOpenInterest(interest: any, market?: Market): PredictionOpenInterest;
    /**
     * @ignore
     * @method
     * @name kalshi#parsePredictionTicker
     * @description parses a raw kalshi market object into a unified ticker object
     * @param {object} raw the raw market object
     * @param {object} [market] the outcome object the ticker belongs to
     * @returns {object} a [prediction ticker structure](https://docs.ccxt.com/#/?id=prediction-ticker-structure)
     */
    parsePredictionTicker(raw: Dict, market?: Market): PredictionTicker;
    /**
     * @method
     * @name kalshi#fetchTickers
     * @description fetches tickers for multiple outcomes at once, batching their market tickers through the markets endpoint (100 per request)
     * @see https://docs.kalshi.com/api-reference/market/get-markets
     * @param {string[]} outcomes unified outcomes — required: kalshi has tens of thousands of markets and no endpoint returning all tickers at once, so an unscoped call is not supported
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [prediction ticker structures](https://docs.ccxt.com/#/?id=prediction-ticker-structure) indexed by outcome
     */
    fetchTickers(outcomes?: Strings, params?: {}): Promise<PredictionTickers>;
    /**
     * @method
     * @name kalshi#fetchOrderBook
     * @description fetches the order book for a single kalshi outcome
     * @see https://docs.kalshi.com/api-reference/market/get-market-orderbook
     * @param {string} outcome unified outcome or outcome id
     * @param {int} [limit] the maximum number of bids/asks to return (not enforced by kalshis API, reserved for future client-side trimming)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [prediction order book structure](https://docs.ccxt.com/#/?id=prediction-order-book-structure)
     */
    fetchOrderBook(outcome: Str, limit?: Int, params?: {}): Promise<PredictionOrderBook>;
    /**
     * @ignore
     * @method
     * @name kalshi#sortedOrders
     * @description sorts bids descending and asks ascending, then returns a CCXT-shaped order book object
     * @param {string} outcome unified outcome
     * @param {int} timestamp timestamp in ms
     * @param {object[]} bids array of [price, size] bid levels
     * @param {object[]} asks array of [price, size] ask levels
     * @returns {object} a [prediction order book structure](https://docs.ccxt.com/#/?id=prediction-order-book-structure)
     */
    sortedOrders(outcome: Str, timestamp: Int, bids: any[], asks: any[]): PredictionOrderBook;
    /**
     * @method
     * @name kalshi#fetchOHLCV
     * @description fetches OHLCV candlesticks for a single kalshi outcome from the candlesticks endpoint
     * @see https://docs.kalshi.com/api-reference/market/get-market-candlesticks
     * @param {string} outcome unified outcome
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum number of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} a list of candles ordered as timestamp, open, high, low, close, volume
     */
    fetchOHLCV(outcome: Str, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    /**
     * @ignore
     * @method
     * @name kalshi#parseOHLCV
     * @description parses a single kalshi candlestick object into a CCXT OHLCV tuple, converting cent prices to decimals
     * @param {object} ohlcv the raw candlestick object
     * @param {object} [market] the outcome object the candle belongs to
     * @returns {int[]} a candle ordered as timestamp, open, high, low, close, volume
     */
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    /**
     * @method
     * @name kalshi#fetchTrades
     * @description fetches public trade history for a single kalshi market ticker
     * @see https://docs.kalshi.com/api-reference/market/get-trades
     * @param {string} outcome unified outcome
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum number of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [prediction trade structures](https://docs.ccxt.com/#/?id=prediction-trade-structure)
     */
    fetchTrades(outcome: Str, since?: Int, limit?: Int, params?: {}): Promise<PredictionTrade[]>;
    /**
     * @ignore
     * @method
     * @name kalshi#parsePredictionTrade
     * @description parses a raw kalshi trade object into a unified trade object
     * @param {object} trade the raw trade object
     * @param {object} [market] the outcome object the trade belongs to
     * @returns {object} a [prediction trade structure](https://docs.ccxt.com/#/?id=prediction-trade-structure)
     */
    parsePredictionTrade(trade: Dict, market?: Market): PredictionTrade;
    /**
     * @method
     * @name kalshi#fetchMyTrades
     * @description fetch the fills (executed trades) of the authenticated kalshi user
     * @see https://trading-api.readme.io/reference/getfills
     * @param {string} [outcome] filter to a single unified outcome
     * @param {int} [since] the earliest fill timestamp (ms) to fetch
     * @param {int} [limit] the maximum number of fills to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [prediction trade structures](https://docs.ccxt.com/#/?id=prediction-trade-structure)
     */
    fetchMyTrades(outcome?: Str, since?: Int, limit?: Int, params?: {}): Promise<PredictionTrade[]>;
    /**
     * @ignore
     * @method
     * @name kalshi#parseMyTrade
     * @description parses one raw kalshi fill into the unified trade shape
     * @param {object} fill the raw kalshi fill
     * @param {object} [market] a resolved outcome/market hint
     * @returns {object} a unified trade structure
     */
    parseMyTrade(fill: Dict, market?: Market): PredictionTrade;
    /**
     * @method
     * @name kalshi#fetchBalance
     * @description fetches the authenticated user's USD portfolio balance from kalshi
     * @see https://trading-api.readme.io/reference/getbalance
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)
     */
    fetchBalance(params?: {}): Promise<Balances>;
    /**
     * @ignore
     * @method
     * @name kalshi#parseBalance
     * @description parses a kalshi balance response (cents) into a unified balances object with a USD entry
     * @param {object} response the raw balance response
     * @returns {object} a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)
     */
    parseBalance(response: any): Balances;
    /**
     * @method
     * @name kalshi#fetchPositions
     * @description fetches open market positions for the authenticated kalshi user
     * @see https://trading-api.readme.io/reference/getportfoliopositions
     * @param {string[]} [outcomes] filter by outcome ids or outcomes
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [prediction position structures](https://docs.ccxt.com/#/?id=prediction-position-structure)
     */
    fetchPositions(outcomes?: Strings, params?: {}): Promise<PredictionPosition[]>;
    /**
     * @method
     * @name kalshi#fetchSettlements
     * @description fetches the user's settled (resolved) positions, with the collateral paid out and realized pnl
     * @see https://trading-api.readme.io/reference/getportfoliosettlements
     * @param {string} [outcome] filter to a single unified outcome
     * @param {int} [since] timestamp in ms of the earliest settlement to fetch
     * @param {int} [limit] the maximum number of settlements to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of prediction settlement structures
     */
    fetchSettlements(outcome?: Str, since?: Int, limit?: Int, params?: {}): Promise<PredictionSettlement[]>;
    /**
     * @ignore
     * @method
     * @name kalshi#parseSettlement
     * @description parses one raw kalshi settlement into the unified prediction settlement shape
     * @param {object} settlement the raw kalshi settlement
     * @param {object} [market] a resolved outcome/market hint
     * @returns {object} a prediction settlement structure
     */
    parseSettlement(settlement: Dict, market?: Market): any;
    /**
     * @ignore
     * @method
     * @name kalshi#parsePredictionPosition
     * @description parses a raw kalshi portfolio position into a unified position object
     * @param {object} position the raw position object
     * @param {object} [market] the outcome object the position belongs to
     * @returns {object} a [prediction position structure](https://docs.ccxt.com/#/?id=prediction-position-structure)
     */
    parsePredictionPosition(position: Dict, market?: Market): PredictionPosition;
    /**
     * @method
     * @name kalshi#fetchOpenOrders
     * @description fetches resting (open) orders for the authenticated kalshi user, optionally filtered by ticker
     * @see https://trading-api.readme.io/reference/getorders
     * @param {string} [outcome] filter by unified outcome
     * @param {int} [since] timestamp in ms of the earliest order to fetch
     * @param {int} [limit] the maximum number of orders to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [prediction order structures](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    fetchOpenOrders(outcome?: Str, since?: Int, limit?: Int, params?: {}): Promise<PredictionOrder[]>;
    /**
     * @method
     * @name kalshi#fetchOrders
     * @description fetches all orders (resting, executed and canceled) for the authenticated kalshi user
     * @see https://trading-api.readme.io/reference/getorders
     * @param {string} [outcome] filter by unified outcome
     * @param {int} [since] timestamp in ms of the earliest order to fetch
     * @param {int} [limit] the maximum number of orders to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [prediction order structures](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    fetchOrders(outcome?: Str, since?: Int, limit?: Int, params?: {}): Promise<PredictionOrder[]>;
    /**
     * @method
     * @name kalshi#fetchClosedOrders
     * @description fetches the closed (executed or canceled) orders for the authenticated kalshi user
     * @see https://trading-api.readme.io/reference/getorders
     * @param {string} [outcome] filter by unified outcome
     * @param {int} [since] timestamp in ms of the earliest order to fetch
     * @param {int} [limit] the maximum number of orders to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [prediction order structures](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    fetchClosedOrders(outcome?: Str, since?: Int, limit?: Int, params?: {}): Promise<PredictionOrder[]>;
    /**
     * @method
     * @name kalshi#fetchOrder
     * @description fetches a single order by id from the kalshi portfolio endpoint
     * @see https://trading-api.readme.io/reference/getorder
     * @param {string} id order id
     * @param {string} [outcome] unified outcome
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [prediction order structure](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    fetchOrder(id: Str, outcome?: Str, params?: {}): Promise<PredictionOrder>;
    /**
     * @ignore
     * @method
     * @name kalshi#parsePredictionOrder
     * @description parses a raw kalshi order object into a unified order object
     * @param {object} order the raw order object
     * @param {object} [market] the outcome object the order belongs to
     * @returns {object} a [prediction order structure](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    parsePredictionOrder(order: Dict, market?: Market): PredictionOrder;
    /**
     * @ignore
     * @method
     * @name kalshi#parseOrderStatus
     * @description maps a kalshi order status string to the CCXT unified status vocabulary
     * @param {string} status the raw kalshi order status
     * @returns {string} the unified order status
     */
    parseOrderStatus(status: Str): Str;
    /**
     * @method
     * @name kalshi#createOrder
     * @description places a limit or market order on kalshi for the given outcome token
     * @see https://trading-api.readme.io/reference/createorder
     * @param {string} outcome unified outcome
     * @param {string} type 'limit' or 'market'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount number of contracts
     * @param {float} [price] limit price in dollars (0–1 range)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [prediction order structure](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    createOrder(outcome: Str, type: Str, side: Str, amount: Num, price?: Num, params?: {}): Promise<PredictionOrder>;
    /**
     * @method
     * @name kalshi#editOrder
     * @description edits a resting order by cancelling it and placing a new one with the updated terms
     * @see https://trading-api.readme.io/reference/createorder
     * @param {string} id the id of the order to edit
     * @param {string} outcome unified outcome
     * @param {string} type 'limit' (kalshi has only limit orders)
     * @param {string} side 'buy' or 'sell'
     * @param {float} [amount] the new number of contracts
     * @param {float} [price] the new price (0..1)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [prediction order structure](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    editOrder(id: string, outcome: string, type: Str, side: Str, amount?: Num, price?: Num, params?: {}): Promise<PredictionOrder>;
    /**
     * @method
     * @name kalshi#cancelOrder
     * @description cancels a single open order by id on kalshi
     * @see https://trading-api.readme.io/reference/cancelorder
     * @param {string} id order id
     * @param {string} [outcome] unified outcome
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [prediction order structure](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    cancelOrder(id: Str, outcome?: Str, params?: {}): Promise<PredictionOrder>;
    /**
     * @method
     * @name kalshi#cancelAllOrders
     * @description cancels all open orders on kalshi, optionally scoped to one outcome ticker
     * @see https://trading-api.readme.io/reference/cancelorders
     * @param {string} [outcome] unified outcome to scope the cancellation to
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [prediction order structures](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    cancelAllOrders(outcome?: Str, params?: {}): Promise<PredictionOrder[]>;
    /**
     * @method
     * @name kalshi#fetchEvents
     * @description fetches kalshi events scoped by a search query, tag, category or series ticker — always live from the API, never from the local cache (it POPULATES the cache for later event()/outcome lookups). the scope decides the endpoint: a free-text `query` hits kalshi's ranked search endpoint and the top `limit` matches are fetched canonically; `tags`/`category` resolve to series via the /series listing then fetch their events; `series_ticker` is used verbatim. `limit` bounds how many events are actually fetched (broad scopes stop early), and any other param is forwarded straight to the /events endpoint.
     * @see https://docs.kalshi.com/api-reference/events/get-events
     * @param {object} [params] extra parameters specific to the exchange API endpoint (unrecognised keys are forwarded to GET /events)
     * @param {string} [params.query] free-text search resolved server-side via kalshi's series search endpoint
     * @param {string[]} [params.queries] multiple free-text searches (alternative to query, unioned)
     * @param {string} [params.series_ticker] one or more comma-separated kalshi series tickers (e.g. 'KXBTC') — used verbatim, no search
     * @param {string[]} [params.tags] kalshi series tags (e.g. ['BTC']) — resolved to series via the /series listing
     * @param {string} [params.category] a kalshi series category (e.g. 'Crypto') — resolved to series via the /series listing
     * @param {string} [params.status] 'active' | 'inactive' | 'closed', defaults to options.defaultEventStatus
     * @param {int} [params.limit] max number of events to return
     * @returns {object[]} an array of event structures
     */
    fetchEvents(params?: fetchEventsParams): Promise<PredictionEvent[]>;
    /**
     * @ignore
     * @method
     * @name kalshi#fetchEventsByQuery
     * @description resolves free-text queries to ranked event tickers via kalshi's search endpoint, then fetches the top `limit` events canonically (with nested markets)
     * @param {string[]} queries free-text search strings
     * @param {int} [limit] max number of events to fetch
     * @param {object} [rest] extra params forwarded verbatim to the events endpoint
     * @returns {object[]} raw kalshi event objects with nested markets
     */
    fetchEventsByQuery(queries: string[], limit: Int, rest?: {}): Promise<any[]>;
    /**
     * @ignore
     * @method
     * @name kalshi#fetchRawEventByTicker
     * @description fetches a single raw kalshi event object (with nested markets) by its event ticker
     * @param {string} ticker the kalshi event ticker
     * @param {object} [params] extra params forwarded verbatim to the events endpoint
     * @returns {object} the raw kalshi event object with nested markets
     */
    fetchRawEventByTicker(ticker: string, params?: {}): Promise<any>;
    /**
     * @ignore
     * @method
     * @name kalshi#resolveEventSeriesTickers
     * @description resolves a fetchEvents scope (tags, category or series_ticker) to a deduplicated list of kalshi series tickers, preserving discovery order
     * @param {object} [params] the fetchEvents params carrying tags / category / series_ticker
     * @returns {string[]} deduplicated series tickers
     */
    resolveEventSeriesTickers(params?: {}): Promise<string[]>;
    /**
     * @ignore
     * @method
     * @name kalshi#fetchSeriesEvents
     * @description fetches the canonical events (with nested markets) of the given kalshi series, cursor-paginated per series and stopping once `limit` events are gathered
     * @param {string[]} seriesTickers the series to fetch events for
     * @param {string} status the kalshi event status ('open' | 'closed')
     * @param {int} [limit] stop fetching once this many events are gathered
     * @param {object} [rest] extra params forwarded verbatim to the events endpoint
     * @returns {object[]} raw kalshi event objects with nested markets
     */
    fetchSeriesEvents(seriesTickers: string[], status: Str, limit: Int, rest?: {}): Promise<any[]>;
    /**
     * @method
     * @name kalshi#fetchEvent
     * @description fetches a single prediction-market event by its event ticker
     * @see https://trading-api.readme.io/reference/getevent
     * @param {string} id the event ticker
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [prediction event structure](https://docs.ccxt.com/#/?id=prediction-event-structure)
     */
    fetchEvent(id: string, params?: {}): Promise<PredictionEvent>;
    /**
     * @ignore
     * @method
     * @name kalshi#parseEvent
     * @description parses a raw kalshi event object (with nested markets) into the unified CCXT event shape
     * @param {object} rawEvent the raw event object
     * @returns {object} an event structure
     */
    parseEvent(rawEvent: Dict): any;
    /**
     * @ignore
     * @method
     * @name kalshi#sign
     * @description builds the request URL and attaches RSA-PSS SHA-256 authentication headers for private endpoints
     * @param {string} path the endpoint path
     * @param {string|string[]} [api] the api group and access level
     * @param {string} [method] HTTP method
     * @param {object} [params] request parameters
     * @param {object} [headers] request headers
     * @param {object} [body] request body
     * @returns {object} a dictionary with url, method, body and headers
     */
    sign(path: any, api?: any, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
}
