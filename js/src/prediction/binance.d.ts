import Exchange from '../abstract/prediction/binance.js';
import type { Int, int, Str, Dict, Strings, Num, Market, PredictionOrderBook, PredictionEvent, PredictionTicker, PredictionTickers, PredictionOrder, fetchEventsParams, Balances, PredictionPosition, PredictionTrade } from '../base/types.js';
/**
 * @class binance
 * @augments Exchange
 * @description Binance Web3 Wallet prediction trading. Binance aggregates prediction markets from
 * on-chain vendors (predict.fun on BNB Chain) behind its standard signed SAPI — every endpoint,
 * including market data, requires apiKey/secret credentials
 */
export default class binance extends Exchange {
    describe(): any;
    nonce(): number;
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
     * @see https://developers.binance.com/en/docs/catalog/web3-wallet-prediction-trading/api/rest-api/market-data#list-prediction-markets
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
     * @param {string} [params.sortBy] sort events by server side ('RECOMMENDED' | 'VOLUME' | 'PARTICIPANTS' | 'CREATED_TIME' | 'END_DATE'), works when no queries and eventId provided
     * @param {string} [params.orderBy] order events by server side ('ASC' | 'DESC'), works when no queries and eveitId provided
     * @returns {object[]} a list of [prediction event structures](https://docs.ccxt.com/#/?id=prediction-event-structure)
     */
    fetchEvents(params?: fetchEventsParams): Promise<PredictionEvent[]>;
    /**
     * @ignore
     * @method
     * @name binance#fetchEventsByQuery
     * @description resolves free-text queries through the semantic market search endpoint, then completes the matched topics with their outcome tokens
     * @see https://developers.binance.com/en/docs/catalog/web3-wallet-prediction-trading/api/rest-api/market-data#market-search
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
     * @see https://developers.binance.com/en/docs/catalog/web3-wallet-prediction-trading/api/rest-api/market-data#query-last-trade-price
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
     * @see https://developers.binance.com/en/docs/catalog/web3-wallet-prediction-trading/api/rest-api/market-data#query-last-trade-price
     * @param {string[]} outcomes unified outcomes — required: the venue has no all-tickers endpoint
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of prediction [ticker structures](https://docs.ccxt.com/#/?id=ticker-structure)
     */
    fetchTickers(outcomes?: Strings, params?: {}): Promise<PredictionTickers>;
    /**
     * @method
     * @name binance#fetchOrderBook
     * @description fetches the order book for a single prediction outcome token
     * @see https://developers.binance.com/en/docs/catalog/web3-wallet-prediction-trading/api/rest-api/market-data#query-order-book
     * @param {string} outcome unified outcome handle, or an outcome token id
     * @param {int} [limit] not used by binance fetchOrderBook
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a prediction [order book structure](https://docs.ccxt.com/#/?id=order-book-structure)
     */
    fetchOrderBook(outcome: Str, limit?: Int, params?: {}): Promise<PredictionOrderBook>;
    /**
     * @method
     * @name binance#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://developers.binance.com/en/docs/catalog/web3-wallet-prediction-trading/api/rest-api/wallet#query-payment-option-balances
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] 'CeDefi', 'FUNDING', or 'SPOT'
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
     */
    fetchBalance(params?: {}): Promise<Balances>;
    /**
     * @ignore
     * @method
     * @name binance#parsePredictionOrder
     * @description parses a raw binance prediction order object into a unified order object
     * @param {object} order the raw order object
     * @param {object} [outcomeObj] the ourtome the order belongs to
     * @returns {object} a [prediction order structure](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    parsePredictionOrder(order: Dict, outcomeObj?: Market): PredictionOrder;
    parseOrderStatus(status: Str): Str;
    /**
     * @method
     * @name binance#fetchOpenOrders
     * @description fetches currently open orders for the user
     * @see https://developers.binance.com/en/docs/catalog/web3-wallet-prediction-trading/api/rest-api/trade#query-active-orders
     * @param {string} [outcome] filter by outcome
     * @param {int} [since] only return orders updated since this timestamp in ms
     * @param {int} [limit] max number of orders to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.tradeSide] Filter by trade side. Enum: BUY, SELL
     * @param {string} [params.l1Category] Filter by level-1 category
     * @param {boolean} [params.paginate] *spot only* default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object[]} a list of [prediction order structures](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    fetchOpenOrders(outcome?: Str, since?: Int, limit?: Int, params?: {}): Promise<PredictionOrder[]>;
    /**
     * @method
     * @name binance#fetchOrders
     * @description fetches all historical orders for the user
     * @see https://developers.binance.com/en/docs/catalog/web3-wallet-prediction-trading/api/rest-api/trade#query-order-history
     * @param {string} [outcome] filter by outcome
     * @param {int} [since] only return orders updated since this timestamp in ms
     * @param {int} [limit] max number of orders to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.orderType] Filter by order type. Enum: MARKET, LIMIT
     * @param {string} [params.l1Category] Filter by level-1 category
     * @param {string} [params.status] Filter by order status
     * @param {string} [params.until] end timestamp in ms
     * @param {boolean} [params.paginate] *spot only* default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object[]} a list of [prediction order structures](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    fetchOrders(outcome?: Str, since?: Int, limit?: Int, params?: {}): Promise<PredictionOrder[]>;
    /**
     * @method
     * @name binance#fetchPositions
     * @description fetches the user's outcome positions; outcome positions are spot token balances under the "+<encoding>" coin form (size and entry notional), the value/entry/mark price/pnl are computed from the current mid prices
     * @see https://developers.binance.com/en/docs/catalog/web3-wallet-prediction-trading/api/rest-api/position#query-positions
     * @param {string[]} [outcomes] filter by outcome ids or outcomes
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.tab] Position status tab. Values from PositionQueryType. Default ONGOING
     * @returns {object[]} a list of [prediction position structures](https://docs.ccxt.com/#/?id=prediction-position-structure)
     */
    fetchPositions(outcomes?: Strings, params?: {}): Promise<PredictionPosition[]>;
    /**
     * @method
     * @name binance#fetchPosition
     * @description fetch data on an open position
     * @see https://developers.binance.com/en/docs/catalog/web3-wallet-prediction-trading/api/rest-api/position#query-positions-by-filter
     * @param {string} [outcome] filter by outcome
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [prediction position structures](https://docs.ccxt.com/#/?id=prediction-position-structure)
     */
    fetchPosition(outcome: string, params?: {}): Promise<PredictionPosition>;
    /**
     * @ignore
     * @method
     * @name binance#parsePredictionPosition
     * @description parses a spot balance entry for an outcome token into a unified position object
     * @param {object} position the raw balance entry
     * @param {object} [outcomeObj] the ourtome the position belongs to
     * @returns {object} a [prediction position structure](https://docs.ccxt.com/#/?id=prediction-position-structure)
     */
    parsePredictionPosition(position: Dict, outcomeObj?: Market): PredictionPosition;
    /**
     * @method
     * @name binance#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://developers.binance.com/en/docs/catalog/web3-wallet-prediction-trading/api/rest-api/trade#query-order-history
     * @param {string} [outcome] filter by outcome
     * @param {int} [since] only return orders updated since this timestamp in ms
     * @param {int} [limit] max number of orders to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.orderType] Filter by order type. Enum: MARKET, LIMIT
     * @param {string} [params.l1Category] Filter by level-1 category
     * @param {string} [params.status] Filter by order status
     * @param {string} [params.until] end timestamp in ms
     * @param {boolean} [params.paginate] *spot only* default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object[]} a list of [prediction order structures](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    fetchMyTrades(outcome?: Str, since?: Int, limit?: Int, params?: {}): Promise<PredictionTrade[]>;
    /**
     * @ignore
     * @method
     * @name binance#parsePredictionTrade
     * @description parses a single binance fill into a unified trade object
     * @param {object} trade the raw fill object
     * @param {object} [outcomeObj] the outcome the trade belongs to
     * @returns {object} a [prediction trade structure](https://docs.ccxt.com/#/?id=prediction-trade-structure)
     */
    parsePredictionTrade(trade: Dict, outcomeObj?: Market): PredictionTrade;
    /**
     * @method
     * @name binance#fetchWallet
     * @description fetch wallet for user and save the one match the walletAddress user provided
     * @see https://developers.binance.com/en/docs/catalog/web3-wallet-prediction-trading/api/rest-api/wallet#list-prediction-wallets
     * @param {string} [methodName] method name
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a wallet
     */
    fetchWallet(methodName: string, params?: {}): Promise<any>;
    /**
     * @method
     * @name binance#fetchQuote
     * @description request for quote from binance server
     * @see https://developers.binance.com/en/docs/catalog/web3-wallet-prediction-trading/api/rest-api/trade#get-quote
     * @param {object} [request] request to the exchange API endpoint
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.chainId] Chain ID. Default 56 (BSC)
     * @param {integer} [params.feeRateBps] Fee rate in basis points. Default 200, range 1–10000
     * @param {string} [params.fundingSource] Funding source. Enum: MPC, CEX. Default MPC
     * @param {string} [params.fundTransferAmount] Auto-transfer amount before order (wei). Must be > 0 if provided
     * @returns {object} a quote
     */
    fetchQuote(request: Dict, params?: {}): Promise<any>;
    priceToPrecision(outcome: Str, price: any): string;
    amountToPrecision(outcome: Str, amount: any): string;
    /**
     * @method
     * @name binance#createOrder
     * @description creates a limit or market order for an outcome market
     * @see https://developers.binance.com/en/docs/catalog/web3-wallet-prediction-trading/api/rest-api/trade#place-order
     * @param {string} outcome unified outcome
     * @param {string} type 'limit' or 'market'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount quantity of outcome tokens
     * @param {float} [price] limit price (0–1 range for prediction markets)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.timeInForce] Must match orderType: FOK for MARKET, GTC for LIMIT
     * @param {string} [params.slippage] slippage for market orders (default 5%)
     * @param {string} [params.fundingSource] Funding source. Enum: MPC, CEX. Default MPC
     * @param {string} [params.fundTransferAmount] Auto-transfer amount before order (wei). Must be > 0 if provided
     * @param {string} [params.accountType] Payment account type. Enum: SPOT, FUNDING
     * @param {string} [params.feeRateBps] Payment account type. Enum: SPOT, FUNDING
     * @param {string} [params.cost] Buy prediction market with USDT cost, only for buy side
     * @returns {object} a [prediction order structure](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    createOrder(outcome: string, type: string, side: string, amount: number, price?: Num, params?: {}): Promise<PredictionOrder>;
    /**
     * @method
     * @name binance#createMarketOrderWithCost
     * @description create a market order by providing the symbol, side and cost
     * @see https://developers.binance.com/en/docs/catalog/web3-wallet-prediction-trading/api/rest-api/trade#place-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} side 'buy' or 'sell'
     * @param {float} cost how much you want to trade in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    createMarketOrderWithCost(symbol: string, side: string, cost: number, params?: {}): Promise<PredictionOrder>;
    /**
     * @method
     * @name binance#cancelOrder
     * @description cancels a single open order
     * @see https://developers.binance.com/en/docs/catalog/web3-wallet-prediction-trading/api/rest-api/trade#batch-cancel-orders
     * @param {string} id order id
     * @param {string} [outcome] unified outcome
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [prediction order structure](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    cancelOrder(id: string, outcome?: Str, params?: {}): Promise<PredictionOrder>;
    /**
     * @method
     * @name binance#cancelOrders
     * @description cancels multiple open orders
     * @see https://developers.binance.com/en/docs/catalog/web3-wallet-prediction-trading/api/rest-api/trade#batch-cancel-orders
     * @param {string[]} ids order ids
     * @param {string} [outcome] unified outcome (required)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [prediction order structures](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    cancelOrders(ids: string[], outcome?: Str, params?: {}): Promise<PredictionOrder[]>;
    handleErrors(code: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): undefined;
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
