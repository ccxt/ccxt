import Exchange from '../abstract/prediction/binance.js';
import type { Int, int, Str, Dict, Strings, Market, PredictionOrderBook, PredictionEvent, PredictionTicker, PredictionTickers, fetchEventsParams } from '../base/types.js';
/**
 * @class binance
 * @augments Exchange
 * @description Binance Web3 Wallet prediction trading. Binance aggregates prediction markets from
 * on-chain vendors (predict.fun on BNB Chain) behind its standard signed SAPI — every endpoint,
 * including market data, requires apiKey/secret credentials
 */
export default class binance extends Exchange {
    describe(): any;
    nonce(): Int;
    /**
     * @method
     * @name binance#fetchMarkets
     * @description fetches binance prediction markets; with a query it resolves the query via the search endpoint and returns the matched topics' markets, otherwise it pages the market listing
     * @see https://developers.binance.com/en/docs/catalog/web3-wallet-prediction-trading/api/rest-api/market-data
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.query] a single search query resolved against the market search endpoint
     * @param {string[]} [params.queries] multiple search queries (alternative to query)
     * @param {string} [params.l1Category] filter the listing by a level-1 category id (see the category/list endpoint)
     * @param {string} [params.l2Category] filter the listing by a level-2 category id
     * @param {int} [params.limit] for an unscoped listing (no query), the max number of topics to collect (defaults to options.maxFetchMarketsLimit, 200)
     * @returns {object[]} an array of objects representing market data
     */
    fetchMarkets(params?: {}): Promise<Market[]>;
    /**
     * @ignore
     * @method
     * @name binance#fetchRawTopics
     * @description pages the market/list endpoint and returns up to `maxTopics` raw market topics
     * @param {int} maxTopics stop collecting once this many topics are gathered
     * @param {object} [rest] extra params forwarded verbatim to the listing endpoint (l1Category, l2Category, sortBy, orderBy)
     * @returns {object[]} raw market topic objects
     */
    fetchRawTopics(maxTopics: Int, rest?: {}): Promise<any[]>;
    /**
     * @ignore
     * @method
     * @name binance#fetchRawTopicDetail
     * @description fetches a single raw market topic (with nested markets and outcome tokens) by its id
     * @param {string} topicId the marketTopicId
     * @param {object} [params] extra params forwarded verbatim to the detail endpoint
     * @returns {object} the raw market topic object
     */
    fetchRawTopicDetail(topicId: string, params?: {}): Promise<any>;
    /**
     * @ignore
     * @method
     * @name binance#completeRawTopics
     * @description ensures each raw topic carries fully-populated nested markets (with outcome token ids), fetching the topic detail when the listing/search payload omitted them
     * @param {object[]} rawTopics raw market topic objects
     * @returns {object[]} raw market topic objects with usable nested markets
     */
    completeRawTopics(rawTopics: any[]): Promise<any[]>;
    /**
     * @method
     * @name binance#fetchEvents
     * @description fetches prediction-market events (market topics); the call must be scoped by query/queries/tags, eventId, or an l1Category/l2Category listing filter
     * @see https://developers.binance.com/en/docs/catalog/web3-wallet-prediction-trading/api/rest-api/market-data
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.query] a free-text search resolved against the semantic market search endpoint
     * @param {string[]} [params.queries] multiple free-text searches (alternative to query)
     * @param {string[]} [params.tags] treated as additional free-text searches (binance has no tag taxonomy)
     * @param {string} [params.eventId] a marketTopicId, fetched directly via the detail endpoint
     * @param {string} [params.l1Category] scope the listing server-side by a level-1 category id
     * @param {string} [params.l2Category] scope the listing server-side by a level-2 category id
     * @param {int} [params.limit] the maximum number of events to return
     * @param {string} [params.sort] 'volume' | 'liquidity' | 'newest' (client-side)
     * @param {string} [params.status] 'active' | 'closed' | 'all' (client-side)
     * @returns {object[]} a list of [prediction event structures](https://docs.ccxt.com/#/?id=prediction-event-structure)
     */
    fetchEvents(params?: fetchEventsParams): Promise<PredictionEvent[]>;
    /**
     * @ignore
     * @method
     * @name binance#fetchEventsByQuery
     * @description resolves free-text queries through the semantic market search endpoint, then completes the matched topics with their outcome tokens
     * @param {string[]} queries free-text search strings
     * @param {int} [limit] max number of topics to fetch
     * @param {object} [rest] extra params forwarded verbatim to the search endpoint
     * @returns {object[]} raw market topic objects with usable nested markets
     */
    fetchEventsByQuery(queries: string[], limit: Int, rest?: {}): Promise<any[]>;
    /**
     * @method
     * @name binance#fetchEvent
     * @description fetches a single prediction-market event (market topic) by its marketTopicId
     * @see https://developers.binance.com/en/docs/catalog/web3-wallet-prediction-trading/api/rest-api/market-data
     * @param {string} id the marketTopicId
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [prediction event structure](https://docs.ccxt.com/#/?id=prediction-event-structure)
     */
    fetchEvent(id: string, params?: {}): Promise<PredictionEvent>;
    /**
     * @ignore
     * @method
     * @name binance#parseEvent
     * @description parses a raw binance market topic (with nested markets) into the unified event shape
     * @param {object} rawTopic the raw market topic object
     * @returns {object} an event structure
     */
    parseEvent(rawTopic: Dict): any;
    /**
     * @ignore
     * @method
     * @name binance#parseTopicMarket
     * @description parses one nested market of a market topic into the unified market shape, building its outcome tokens
     * @param {object} rawMarket the nested market object
     * @param {object} rawTopic the enclosing raw market topic (carries slug/vendor/fees/dates)
     * @returns {object} a market structure
     */
    parseTopicMarket(rawMarket: Dict, rawTopic: Dict): Market;
    /**
     * @method
     * @name binance#fetchTicker
     * @description fetches the last trade price for a single prediction outcome
     * @see https://developers.binance.com/en/docs/catalog/web3-wallet-prediction-trading/api/rest-api/market-data
     * @param {string} outcome unified outcome handle like BTC_PRICE_1H_UP_DOWN_UP:YES, or an outcome token id
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a prediction [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)
     */
    fetchTicker(outcome: Str, params?: {}): Promise<PredictionTicker>;
    /**
     * @ignore
     * @method
     * @name binance#parsePredictionTicker
     * @description parses a last-trade-price response into a unified ticker object; the venue quotes the market's primary (YES) token, so a NO outcome mirrors as 1 - price
     * @param {object} raw the raw last-trade-price object
     * @param {object} [market] the outcome object the ticker belongs to
     * @returns {object} a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)
     */
    parsePredictionTicker(raw: Dict, market?: Market): PredictionTicker;
    /**
     * @method
     * @name binance#fetchTickers
     * @description fetches last trade prices for multiple outcomes, one request per distinct underlying market
     * @see https://developers.binance.com/en/docs/catalog/web3-wallet-prediction-trading/api/rest-api/market-data
     * @param {string[]} outcomes unified outcomes — required: the venue has no all-tickers endpoint
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of prediction [ticker structures](https://docs.ccxt.com/#/?id=ticker-structure)
     */
    fetchTickers(outcomes?: Strings, params?: {}): Promise<PredictionTickers>;
    /**
     * @method
     * @name binance#fetchOrderBook
     * @description fetches the order book for a single prediction outcome token
     * @see https://developers.binance.com/en/docs/catalog/web3-wallet-prediction-trading/api/rest-api/market-data
     * @param {string} outcome unified outcome handle, or an outcome token id
     * @param {int} [limit] not used by binance fetchOrderBook
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a prediction [order book structure](https://docs.ccxt.com/#/?id=order-book-structure)
     */
    fetchOrderBook(outcome: Str, limit?: Int, params?: {}): Promise<PredictionOrderBook>;
    handleErrors(code: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): any;
    /**
     * @ignore
     * @method
     * @name binance#sign
     * @description builds the request URL and attaches the standard binance SAPI HMAC-SHA256 signature — every prediction endpoint is signed
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
