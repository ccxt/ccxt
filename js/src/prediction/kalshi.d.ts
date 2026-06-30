import Exchange from '../abstract/prediction/kalshi.js';
import type { Int, Str, Num, Dict, Strings, Market, PredictionOrderBook, OHLCV, Balances, PredictionOpenInterest, PredictionEvent, PredictionTicker, PredictionTickers, PredictionOrder, PredictionTrade, PredictionPosition, fetchEventsParams } from '../base/types.js';
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
    parseMarket(raw: Dict): Market;
    /**
     * @method
     * @name kalshi#fetchTicker
     * @description fetches the current market price and bid/ask for a single kalshi outcome
     * @see https://docs.kalshi.com/api-reference/market/get-market
     * @param {string} outcome the unified outcome like TRUMP_BRING_BACK_MANUFACTURING:YES or outcomeId like KXGDPSHAREMANU-29
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)
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
    parseOpenInterest(interest: any, market?: Market): PredictionOpenInterest;
    /**
     * @ignore
     * @method
     * @name kalshi#parseTicker
     * @description parses a raw kalshi market object into a unified ticker object
     * @param {object} raw the raw market object
     * @param {object} [market] the outcome object the ticker belongs to
     * @returns {object} a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)
     */
    parseTicker(raw: Dict, market?: Market): PredictionTicker;
    /**
     * @method
     * @name kalshi#fetchTickers
     * @description fetches tickers for multiple outcomes at once, batching their market tickers through the markets endpoint
     * @see https://docs.kalshi.com/api-reference/market/get-markets
     * @param {string[]} [outcomes] unified outcomes, fetches tickers for all loaded outcomes when omitted
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures](https://docs.ccxt.com/#/?id=ticker-structure) indexed by outcome
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
     * @returns {object} an [order book structure](https://docs.ccxt.com/#/?id=order-book-structure)
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
     * @returns {object} an [order book structure](https://docs.ccxt.com/#/?id=order-book-structure)
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
     * @returns {object[]} a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)
     */
    fetchTrades(outcome: Str, since?: Int, limit?: Int, params?: {}): Promise<PredictionTrade[]>;
    /**
     * @ignore
     * @method
     * @name kalshi#parseTrade
     * @description parses a raw kalshi trade object into a unified trade object
     * @param {object} trade the raw trade object
     * @param {object} [market] the outcome object the trade belongs to
     * @returns {object} a [trade structure](https://docs.ccxt.com/#/?id=public-trades)
     */
    parseTrade(trade: Dict, market?: Market): PredictionTrade;
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
     * @returns {object[]} a list of [position structures](https://docs.ccxt.com/#/?id=position-structure)
     */
    fetchPositions(outcomes?: Strings, params?: {}): Promise<PredictionPosition[]>;
    /**
     * @ignore
     * @method
     * @name kalshi#parsePosition
     * @description parses a raw kalshi portfolio position into a unified position object
     * @param {object} position the raw position object
     * @param {object} [market] the outcome object the position belongs to
     * @returns {object} a [position structure](https://docs.ccxt.com/#/?id=position-structure)
     */
    parsePosition(position: Dict, market?: Market): PredictionPosition;
    /**
     * @method
     * @name kalshi#fetchOpenOrders
     * @description fetches resting (open) orders for the authenticated kalshi user, optionally filtered by ticker
     * @see https://trading-api.readme.io/reference/getorders
     * @param {string} [outcome] filter by unified outcome
     * @param {int} [since] timestamp in ms of the earliest order to fetch
     * @param {int} [limit] the maximum number of orders to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)
     */
    fetchOpenOrders(outcome?: Str, since?: Int, limit?: Int, params?: {}): Promise<PredictionOrder[]>;
    /**
     * @method
     * @name kalshi#fetchOrder
     * @description fetches a single order by id from the kalshi portfolio endpoint
     * @see https://trading-api.readme.io/reference/getorder
     * @param {string} id order id
     * @param {string} [outcome] unified outcome
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure](https://docs.ccxt.com/#/?id=order-structure)
     */
    fetchOrder(id: Str, outcome?: Str, params?: {}): Promise<PredictionOrder>;
    /**
     * @ignore
     * @method
     * @name kalshi#parseOrder
     * @description parses a raw kalshi order object into a unified order object
     * @param {object} order the raw order object
     * @param {object} [market] the outcome object the order belongs to
     * @returns {object} an [order structure](https://docs.ccxt.com/#/?id=order-structure)
     */
    parseOrder(order: Dict, market?: Market): PredictionOrder;
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
     * @returns {object} an [order structure](https://docs.ccxt.com/#/?id=order-structure)
     */
    createOrder(outcome: Str, type: Str, side: Str, amount: Num, price?: Num, params?: {}): Promise<PredictionOrder>;
    /**
     * @method
     * @name kalshi#cancelOrder
     * @description cancels a single open order by id on kalshi
     * @see https://trading-api.readme.io/reference/cancelorder
     * @param {string} id order id
     * @param {string} [outcome] unified outcome
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure](https://docs.ccxt.com/#/?id=order-structure)
     */
    cancelOrder(id: Str, outcome?: Str, params?: {}): Promise<PredictionOrder>;
    /**
     * @method
     * @name kalshi#cancelAllOrders
     * @description cancels all open orders on kalshi, optionally scoped to one outcome ticker
     * @see https://trading-api.readme.io/reference/cancelorders
     * @param {string} [outcome] unified outcome to scope the cancellation to
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)
     */
    cancelAllOrders(outcome?: Str, params?: {}): Promise<PredictionOrder[]>;
    /**
     * @method
     * @name kalshi#fetchEvents
     * @description fetches kalshi events via cursor-paginated /events, filters client-side by query strings, then fetches full event details with nested markets in parallel and caches in this.events
     * @see https://trading-api.readme.io/reference/getevents
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.query] a single query string to filter events by (matches event ticker/title)
     * @param {string[]} [params.queries] multiple query strings (alternative to query)
     * @param {string} [params.status] 'open' | 'closed' | 'settled', defaults to options.defaultEventStatus
     * @param {int} [params.limit] page size per request, defaults to 200
     * @param {int} [params.maxPages] maximum number of event pages to scan, defaults to 50
     * @returns {object[]} an array of event structures
     */
    fetchEvents(params?: fetchEventsParams): Promise<PredictionEvent[]>;
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
