import Exchange from '../abstract/prediction/binance.js';
import { Precise } from '../base/Precise.js';
import { TRUNCATE, ROUND, DECIMAL_PLACES } from '../base/functions/number.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { ArgumentsRequired, AuthenticationError, BadRequest, BadSymbol, ExchangeError, InvalidNonce, PermissionDenied, RateLimitExceeded, InsufficientFunds, InvalidOrder, NotSupported, OrderNotFound } from '../base/errors.js';
import type { Int, int, Str, Dict, List, Strings, Num, Market, PredictionOrderBook, PredictionEvent, PredictionTicker, PredictionTickers, PredictionOrder, fetchEventsParams, Balances, PredictionPosition, PredictionTrade, Endpoint } from '../base/types.js';

// ---------------------------------------------------------------------------

/**
 * @class binance
 * @augments Exchange
 * @description Binance Web3 Wallet prediction trading. Binance aggregates prediction markets from
 * on-chain vendors (predict.fun on BNB Chain) behind its standard signed SAPI — every endpoint,
 * including market data, requires apiKey/secret credentials
 */
export default class binance extends Exchange {
    override describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'binance',
            'name': 'Binance',
            'countries': [],
            // all prediction endpoints weigh 200 against the 12000/min SAPI IP budget (5 ms per weight unit)
            'rateLimit': 5,
            'version': 'v1',
            'certified': false,
            'pro': false,
            'has': {
                'CORS': undefined,
                'spot': false,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'cancelOrder': true,
                'cancelOrders': true,
                'createMarketOrderWithCost': true,
                'createOrder': true,
                'fetchBalance': true,
                'fetchEvent': true,
                'fetchEvents': true,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOpenOrders': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchPosition': true,
                'fetchPositions': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'prediction': true,
            },
            'urls': {
                'logo': 'https://github.com/user-attachments/assets/e9419b93-ccb0-46aa-9bff-c883f096274b',
                'api': {
                    'sapi': 'https://api.binance.com/sapi/v1/w3w/wallet/prediction',
                },
                'www': 'https://www.binance.com/en/markets/prediction',
                'doc': [
                    'https://developers.binance.com/en/docs/catalog/web3-wallet-prediction-trading',
                ],
            },
            'api': {
                'sapi': {
                    'private': {
                        'get': {
                            'category/list': { 'cost': 200 } as Endpoint<Dict>,
                            'market/list': { 'cost': 200 } as Endpoint<Dict>,
                            'market/search': { 'cost': 200 } as Endpoint<List>,
                            'market/detail': { 'cost': 200 } as Endpoint<Dict>,
                            'order-book': { 'cost': 200 } as Endpoint<Dict>,
                            'order-book/last-trade-price': { 'cost': 200 } as Endpoint<Dict>,
                            'wallet/list': { 'cost': 200 } as Endpoint<Dict>,
                            'balance/payment-options': { 'cost': 200 } as Endpoint<Dict>,
                            'quota/limit/status': { 'cost': 200 } as Endpoint<Dict>,
                            'pnl/portfolio': { 'cost': 200 } as Endpoint<Dict>,
                            'pnl/query': { 'cost': 200 } as Endpoint<Dict>,
                            'position/list': { 'cost': 200 } as Endpoint<Dict>,
                            'position/filter': { 'cost': 200 } as Endpoint<Dict>,
                            'position/token': { 'cost': 200 } as Endpoint<Dict>,
                            'position/settled-history': { 'cost': 200 } as Endpoint<Dict>,
                            'order/list': { 'cost': 200 } as Endpoint<Dict>,
                            'order/history': { 'cost': 200 } as Endpoint<Dict>,
                        },
                        'post': {
                            'trade/get-quote': { 'cost': 200 } as Endpoint<Dict>,
                            'trade/place-order-bundle': { 'cost': 200 } as Endpoint<Dict>,
                            'trade/batch-cancel': { 'cost': 200 } as Endpoint<Dict>,
                        },
                    },
                },
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': 0,
                    'taker': 0.02,  // default feeRateBps of 200 applied per order
                },
            },
            'exceptions': {
                'exact': {
                    '-1003': RateLimitExceeded,
                    '-1021': InvalidNonce, // timestamp outside recvWindow
                    '-1022': AuthenticationError, // invalid signature
                    '-1102': BadRequest, // mandatory parameter missing
                    '-1121': BadSymbol,
                    '-2008': AuthenticationError, // invalid api-key id
                    '-2014': AuthenticationError, // api-key format invalid
                    '-2015': PermissionDenied, // invalid key, ip or permissions
                    '-2010': InsufficientFunds,
                },
                'broad': {
                    'insufficient balance': InsufficientFunds,
                    'Order does not exist': InvalidOrder,
                },
            },
            'options': {
                'defaultVendor': 'PREDICT_FUN',
                'fetchOutcomeSearchLimit': 10,
                'maxFetchEventsResults': 25,   // cap on topics fetched canonically when the caller gives no limit
                'marketsPageLimit': 100,       // market/list page size
                'maxFetchMarketsLimit': 200,   // cap on topics collected by an unscoped fetchMarkets
                'loadAllOutcomes': false,
                // the market listing is bounded (maxFetchEventsResults), so an unscoped
                // fetchEvents pages a capped listing instead of requiring a search scope
                'allowUnscopedFetchEvents': true,
                // venue-specific fetchEvents scope params accepted by requireEventQuery in
                // addition to the unified query/queries/tags/eventId/slug
                'eventScopeParams': [ 'l1Category', 'l2Category' ],
            },
        });
    }

    override nonce (): number {
        return this.milliseconds ();
    }

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
    override async fetchMarkets (params = {}): Promise<Market[]> {
        const queries = this.parseSearchQueries (params) as any[];
        const queriesLength = queries.length;
        if (queriesLength > 0) {
            const eventParams = this.omit (params, [ 'limit' ]);
            const events = await this.fetchEvents (eventParams);
            const eventsLength = events.length;
            const queryMarkets: Market[] = [];
            for (let ei = 0; ei < eventsLength; ei++) {
                const eventMarkets = this.safeList (events[ei], 'markets', []) as any[];
                const eventMarketsLength = eventMarkets.length;
                for (let mi = 0; mi < eventMarketsLength; mi++) {
                    queryMarkets.push (eventMarkets[mi]);
                }
            }
            return queryMarkets;
        }
        const maxMarkets = this.safeInteger (params, 'limit', this.safeInteger (this.options, 'maxFetchMarketsLimit', 200));
        const rest = this.omit (params, [ 'query', 'queries', 'limit' ]);
        const rawTopics = await this.fetchRawTopics (maxMarkets, rest);
        const parsedEvents: any[] = [];
        const flatMarkets: Market[] = [];
        const rawTopicsLength = rawTopics.length;
        for (let i = 0; i < rawTopicsLength; i++) {
            const parsedEvent = this.parseEvent (rawTopics[i]);
            parsedEvents.push (parsedEvent);
            const eventMarkets = this.safeList (parsedEvent, 'markets', []) as any[];
            const eventMarketsLength = eventMarkets.length;
            for (let mi = 0; mi < eventMarketsLength; mi++) {
                flatMarkets.push (eventMarkets[mi]);
            }
        }
        this.setEvents (parsedEvents);
        return flatMarkets;
    }

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
    async fetchRawTopics (maxTopics: Int, rest = {}): Promise<any[]> {
        if (maxTopics === undefined) {
            maxTopics = this.safeInteger (this.options, 'maxFetchMarketsLimit', 200);
        }
        let pageLimit = this.safeInteger (this.options, 'marketsPageLimit', 100);
        if (pageLimit > 100) {
            pageLimit = 100;
        }
        const collected: any[] = [];
        let offset = 0;
        while (true) {
            let reqLimit = pageLimit;
            const collectedLength = collected.length;
            const remaining = maxTopics - collectedLength;
            if (remaining < reqLimit) {
                reqLimit = remaining;
            }
            if (reqLimit <= 0) {
                break;
            }
            const request: Dict = {
                'offset': offset,
                'limit': reqLimit,
            };
            const response = await this.sapiPrivateGetMarketList (this.extend (request, rest));
            //
            //     {
            //         "marketTopics": [
            //             {
            //                 "marketTopicId": 4229564,
            //                 "vendor": "PREDICT_FUN",
            //                 "chainId": "56",
            //                 "slug": "btc-price-1h-up-or-down",
            //                 "title": "BTC Price 1h Up or Down?",
            //                 "question": "Will BTC price go UP?",
            //                 "topicType": "FLAT",
            //                 "chartType": "CRYPTO_UP_DOWN",
            //                 "symbol": "BTCUSDT",
            //                 "participantCount": 3420,
            //                 "collateral": "USDT",
            //                 "feeRateBps": 200,
            //                 "slippageBps": 1200,
            //                 "tradeVolume": "158234.56",
            //                 "liquidity": "45000.00",
            //                 "publishedAt": 1748100000000,
            //                 "startDate": 1748131200000,
            //                 "endDate": 1748134800000,
            //                 "status": "REGISTERED",
            //                 "markets": []
            //             }
            //         ],
            //         "total": 128,
            //         "offset": 0,
            //         "limit": 20,
            //         "hasMore": true
            //     }
            //
            const pageTopics = this.safeList (response, 'marketTopics', []) as any[];
            const pageTopicsLength = pageTopics.length;
            for (let i = 0; i < pageTopicsLength; i++) {
                collected.push (pageTopics[i]);
            }
            const hasMore = this.safeBool (response, 'hasMore', false);
            if (!hasMore || (pageTopicsLength < reqLimit)) {
                break;
            }
            offset = this.sum (offset, pageTopicsLength);
        }
        return collected;
    }

    /**
     * @ignore
     * @method
     * @name binance#fetchRawTopicDetail
     * @description fetches a single raw market topic (with nested markets and outcome tokens) by its id
     * @param {string} topicId the marketTopicId
     * @param {object} [params] extra params forwarded verbatim to the detail endpoint
     * @returns {object} the raw market topic object
     */
    async fetchRawTopicDetail (topicId: string, params = {}): Promise<any> {
        const request: Dict = {
            'marketTopicId': topicId,
        };
        return await this.sapiPrivateGetMarketDetail (this.extend (request, params));
    }

    /**
     * @ignore
     * @method
     * @name binance#completeRawTopics
     * @description ensures each raw topic carries fully-populated nested markets (with outcome token ids), fetching the topic detail when the listing/search payload omitted them
     * @param {object[]} rawTopics raw market topic objects
     * @returns {object[]} raw market topic objects with usable nested markets
     */
    async completeRawTopics (rawTopics: any[]): Promise<any[]> {
        const result: any[] = [];
        const rawTopicsLength = rawTopics.length;
        for (let i = 0; i < rawTopicsLength; i++) {
            const rawTopic = rawTopics[i];
            const rawMarkets = this.safeList (rawTopic, 'markets', []) as any[];
            const rawMarketsLength = rawMarkets.length;
            let hasOutcomes = false;
            if (rawMarketsLength > 0) {
                const firstMarket = this.safeDict (rawMarkets, 0, {});
                const firstOutcomes = this.safeList (firstMarket, 'outcomes', []) as any[];
                const firstOutcomesLength = firstOutcomes.length;
                hasOutcomes = (firstOutcomesLength > 0);
            }
            if (hasOutcomes) {
                result.push (rawTopic);
            } else {
                const topicId = this.safeString (rawTopic, 'marketTopicId');
                if (topicId !== undefined) {
                    const detail = await this.fetchRawTopicDetail (topicId);
                    result.push (detail);
                }
            }
        }
        return result;
    }

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
    override async fetchEvents (params: fetchEventsParams = {}): Promise<PredictionEvent[]> {
        const allowUnscopedFetchEvents = this.safeBool (this.options, 'allowUnscopedFetchEvents', false);
        if (!allowUnscopedFetchEvents) {
            this.requireEventQuery (params);
        }
        const queries = this.parseSearchQueries (params);
        // binance has no tag taxonomy — resolve requested tags through the semantic search too
        const tags = this.safeList (params, 'tags', []);
        const tagsLength = tags.length;
        const allQueries: string[] = [];
        for (let i = 0; i < queries.length; i++) {
            allQueries.push (queries[i]);
        }
        for (let i = 0; i < tagsLength; i++) {
            allQueries.push (tags[i]);
        }
        const allQueriesLength = allQueries.length;
        params = this.omit (params, [ 'query', 'queries' ]);
        const userLimit = this.safeInteger (params, 'limit');
        let fetchCap = this.safeInteger (this.options, 'maxFetchEventsResults', 100);
        if (userLimit !== undefined) {
            fetchCap = userLimit;
        }
        const rest = this.omit (params, [ 'status', 'limit', 'sort', 'searchIn', 'eventId', 'slug', 'tags', 'l1Category', 'l2Category' ]);
        const eventId = this.safeString (params, 'eventId');
        const l1Category = this.safeString (params, 'l1Category');
        const l2Category = this.safeString (params, 'l2Category');
        if (!this.markets) {
            this.markets = this.createSafeDictionary ();
        }
        let rawTopics: any[] = [];
        if (allQueriesLength > 0) {
            rawTopics = await this.fetchEventsByQuery (allQueries, fetchCap, rest);
        } else if (eventId !== undefined) {
            const detail = await this.fetchRawTopicDetail (eventId, rest);
            rawTopics = [ detail ];
        } else {
            const listingRequest: Dict = {};
            if (l1Category !== undefined) {
                listingRequest['l1Category'] = l1Category;
            }
            if (l2Category !== undefined) {
                listingRequest['l2Category'] = l2Category;
            }
            let sortBy = this.safeStringUpper2 (params, 'sortBy', 'sort');
            if (sortBy !== undefined) {
                // map the unified sort values onto the server enum, one of RECOMMENDED,
                // VOLUME, PARTICIPANTS, CREATED_TIME or END_DATE — 'liquidity' has no
                // server-side equivalent and stays in params so the base
                // applyEventFetchParams sorts it client-side instead
                if (sortBy === 'NEWEST') {
                    sortBy = 'CREATED_TIME';
                } else if (sortBy === 'LIQUIDITY') {
                    sortBy = undefined;
                }
                if (sortBy !== undefined) {
                    listingRequest['sortBy'] = sortBy;
                    params = this.omit (params, [ 'sort', 'sortBy' ]);
                }
            }
            const listed = await this.fetchRawTopics (fetchCap, this.extend (listingRequest, rest));
            rawTopics = await this.completeRawTopics (listed);
        }
        const rawTopicsLength = rawTopics.length;
        const result: any[] = [];
        for (let i = 0; i < rawTopicsLength; i++) {
            const parsedEvent = this.parseEvent (rawTopics[i]);
            result.push (parsedEvent);
            const parsedMarkets = this.safeList (parsedEvent, 'markets', []) as any[];
            const parsedMarketsLength = parsedMarkets.length;
            for (let mi = 0; mi < parsedMarketsLength; mi++) {
                const m = parsedMarkets[mi];
                // prediction market rows are keyed by the unified 'market' handle
                const handle = this.safeString (m, 'market');
                if (handle !== undefined) {
                    this.markets[handle] = m;
                }
            }
        }
        this.populateOutcomes ();
        // scoping already happened server-side: the tag filter needs an event-level tags field
        // binance topics lack, and the query filter would drop semantic-search matches whose
        // title uses different words than the query
        const postParams = this.omit (params, [ 'tags', 'l1Category', 'l2Category' ]);
        return this.applyEventFetchParams (result, postParams, []);
    }

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
    async fetchEventsByQuery (queries: string[], limit: Int, rest = {}): Promise<any[]> {
        const seen: Dict = {};
        const collected: any[] = [];
        const queriesLength = queries.length;
        if (limit === undefined) {
            limit = 20;
        } else if (limit > 50) {
            limit = 50;
        }
        for (let qi = 0; qi < queriesLength; qi++) {
            const request: Dict = {
                'query': queries[qi],
            };
            request['topK'] = limit;
            const response = await this.sapiPrivateGetMarketSearch (this.extend (request, rest));
            //
            //     [
            //         {
            //             "marketTopicId": 4229564,
            //             "vendor": "PREDICT_FUN",
            //             "slug": "btc-price-1h-up-or-down",
            //             "title": "BTC Price 1h Up or Down?",
            //             ...
            //             "markets": []
            //         }
            //     ]
            //
            const responseLength = response.length;
            for (let i = 0; i < responseLength; i++) {
                const rawTopic = response[i];
                const topicId = this.safeString (rawTopic, 'marketTopicId');
                if (topicId !== undefined) {
                    const already = this.safeString (seen, topicId);
                    if (already === undefined) {
                        seen[topicId] = topicId;
                        collected.push (rawTopic);
                    }
                }
            }
        }
        let capped = collected;
        const collectedLength = collected.length;
        if ((limit !== undefined) && (collectedLength > limit)) {
            capped = this.arraySlice (collected, 0, limit);
        }
        return await this.completeRawTopics (capped);
    }

    /**
     * @method
     * @name binance#fetchEvent
     * @description fetches a single prediction-market event (market topic) by its marketTopicId
     * @see https://developers.binance.com/en/docs/catalog/web3-wallet-prediction-trading/api/rest-api/market-data
     * @param {string} id the marketTopicId
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [prediction event structure](https://docs.ccxt.com/#/?id=prediction-event-structure)
     */
    override async fetchEvent (id: string, params = {}): Promise<PredictionEvent> {
        const events = await this.fetchEvents (this.extend ({ 'eventId': id }, params));
        return this.safeDict (events, 0) as PredictionEvent;
    }

    /**
     * @ignore
     * @method
     * @name binance#parseEvent
     * @description parses a raw binance market topic (with nested markets) into the unified event shape
     * @param {object} rawTopic the raw market topic object
     * @returns {object} an event structure
     */
    parseEvent (rawTopic: Dict): any {
        //
        //     {
        //         "marketTopicId": 4229564,
        //         "vendor": "PREDICT_FUN",
        //         "chainId": "56",
        //         "slug": "btc-price-1h-up-or-down",
        //         "title": "BTC Price 1h Up or Down?",
        //         "question": "Will BTC price go UP?",
        //         "description": "Resolves YES if BTC spot price is higher than the starting price.",
        //         "imageUrl": "https://...",
        //         "topicType": "FLAT",
        //         "chartType": "CRYPTO_UP_DOWN",
        //         "symbol": "BTCUSDT",
        //         "variantData": { "type": "CRYPTO_UP_DOWN", "startPrice": "67890.12", "endPrice": null },
        //         "participantCount": 3420,
        //         "collateral": "USDT",
        //         "feeRateBps": 200,
        //         "slippageBps": 1200,
        //         "tradeVolume": "158234.56",
        //         "liquidity": "45000.00",
        //         "publishedAt": 1748100000000,
        //         "startDate": 1748131200000,
        //         "endDate": 1748134800000,
        //         "status": "REGISTERED",
        //         "timeline": [ ... ],
        //         "markets": [ { "marketId": 5567895, "title": "UP", "outcomes": [ ... ] } ]
        //     }
        //
        const rawMarkets = this.safeList (rawTopic, 'markets', []) as any[];
        const marketsList: any[] = [];
        let anyActive = false;
        const rawMarketsLength = rawMarkets.length;
        for (let i = 0; i < rawMarketsLength; i++) {
            const parsed = this.parseTopicMarket (rawMarkets[i], rawTopic);
            marketsList.push (parsed);
            if (this.safeBool (parsed, 'active', false)) {
                anyActive = true;
            }
        }
        const topicId = this.safeString (rawTopic, 'marketTopicId');
        const slug = this.safeString (rawTopic, 'slug');
        const title = this.safeString (rawTopic, 'title');
        const endDate = this.safeInteger (rawTopic, 'endDate');
        const created = this.safeInteger2 (rawTopic, 'publishedAt', 'startDate');
        const status = this.safeString (rawTopic, 'status');
        let active = anyActive;
        if (rawMarketsLength === 0) {
            active = (status === 'REGISTERED') || (status === 'OPEN');
        }
        let resolved = undefined;
        if (status !== undefined) {
            resolved = (status === 'RESOLVED') || (status === 'SETTLED');
        }
        return {
            'id': topicId,
            'slug': slug,
            'event': (slug !== undefined) ? this.shortenSlug (slug) : undefined,
            'title': title,
            'description': this.safeString (rawTopic, 'description'),
            'markets': marketsList,
            'active': active,
            'volume': this.safeNumber (rawTopic, 'tradeVolume'),
            'liquidity': this.safeNumber (rawTopic, 'liquidity'),
            'url': undefined,
            'image': this.safeString (rawTopic, 'imageUrl'),
            'created': created,
            'createdDatetime': this.iso8601 (created),
            'end': endDate,
            'endDatetime': this.iso8601 (endDate),
            'category': this.safeString (rawTopic, 'chartType'),
            'resolved': resolved,
            'info': rawTopic,
        };
    }

    /**
     * @ignore
     * @method
     * @name binance#parseTopicMarket
     * @description parses one nested market of a market topic into the unified market shape, building its outcome tokens
     * @param {object} rawMarket the nested market object
     * @param {object} rawTopic the enclosing raw market topic (carries slug/vendor/fees/dates)
     * @returns {object} a market structure
     */
    parseTopicMarket (rawMarket: Dict, rawTopic: Dict): Market {
        //
        //     {
        //         "marketId": 5567895,
        //         "externalId": "ext_001",
        //         "title": "UP",
        //         "question": "Will BTC go UP?",
        //         "description": "Resolves YES if BTC price increases.",
        //         "conditionId": "0xabc123",
        //         "status": "REGISTERED",
        //         "tradingStatus": "OPEN",
        //         "tradeVolume": "90000.00",
        //         "liquidity": "25000.00",
        //         "decimalPrecision": 2,
        //         "outcomes": [
        //             { "name": "YES", "price": "0.52", "chance": "0.52", "index": 0, "tokenId": "112233" }
        //         ]
        //     }
        //
        const marketId = this.safeString (rawMarket, 'marketId');
        const topicId = this.safeString (rawTopic, 'marketTopicId');
        const topicSlug = this.safeString (rawTopic, 'slug');
        const vendor = this.safeString (rawTopic, 'vendor');
        const collateral = this.safeString (rawTopic, 'collateral', 'USDT');
        const title = this.safeString (rawMarket, 'title', marketId);
        const marketSymbol = this.slugToMarketSymbol (topicSlug, title);
        const tradingStatus = this.safeString (rawMarket, 'tradingStatus');
        const status = this.safeString (rawMarket, 'status');
        let active = (tradingStatus === 'OPEN');
        if (tradingStatus === undefined) {
            active = (status === 'REGISTERED') || (status === 'OPEN');
        }
        const resolved = (status === 'RESOLVED') || (status === 'SETTLED');
        const endDate = this.safeInteger (rawTopic, 'endDate');
        const feeRateBps = this.safeString (rawTopic, 'feeRateBps', '200');
        const feeRate = this.parseNumber (Precise.stringDiv (feeRateBps, '10000'));
        const decimalPrecision = this.safeString (rawMarket, 'decimalPrecision', '2');
        const pricePrecision = this.parseNumber (this.parsePrecision (decimalPrecision));
        const precision = {
            'amount': 0.01, // always be 2
            'price': pricePrecision,
        };
        const volume = this.safeNumber (rawMarket, 'tradeVolume');
        const liquidity = this.safeNumber (rawMarket, 'liquidity');
        const rawOutcomes = this.safeList (rawMarket, 'outcomes', []) as any[];
        const outcomes: any[] = [];
        let resolvedOutcomeRaw = undefined;
        const rawOutcomesLength = rawOutcomes.length;
        for (let oi = 0; oi < rawOutcomesLength; oi++) {
            const rawOutcome = rawOutcomes[oi];
            const label = this.safeStringUpper (rawOutcome, 'name');
            const tokenId = this.safeString (rawOutcome, 'tokenId');
            const outcomeHandle = marketSymbol + ':' + label;
            const price = this.safeString (rawOutcome, 'price');
            let winnerRaw = undefined;
            let settleFractionRaw = undefined;
            if (resolved && (price !== undefined)) {
                winnerRaw = Precise.stringEq (price, '1');
                settleFractionRaw = (winnerRaw) ? 1 : 0;
                if (winnerRaw) {
                    resolvedOutcomeRaw = outcomeHandle;
                }
            }
            const winner = winnerRaw;
            const settleFraction = settleFractionRaw;
            outcomes.push ({
                'id': tokenId,
                'outcomeId': tokenId,
                'outcome': outcomeHandle,
                'market': marketSymbol,
                'label': label,
                'price': this.parseNumber (price),
                'active': active,
                'winner': winner,
                'settleFraction': settleFraction,
                'precision': precision,
                'info': {
                    'tokenId': tokenId,
                    'marketId': marketId,
                    'marketTopicId': topicId,
                    'vendor': vendor,
                    'chainId': this.safeString (rawTopic, 'chainId'),
                    'slug': topicSlug,
                    'marketTitle': title,
                    'outcomeLabel': label,
                    'index': this.safeString (rawOutcome, 'index'),
                    'price': price,
                    'chance': this.safeString (rawOutcome, 'chance'),
                    'collateral': collateral,
                    'feeRateBps': feeRateBps,
                    'slippageBps': this.safeString (rawTopic, 'slippageBps'),
                    'conditionId': this.safeString (rawMarket, 'conditionId'),
                    'externalId': this.safeString (rawMarket, 'externalId'),
                },
            });
        }
        const resolvedOutcome = resolvedOutcomeRaw;
        return {
            'id': marketId,
            'market': marketSymbol,
            'base': collateral,
            'quote': collateral,
            'settle': undefined,
            'baseId': marketId,
            'quoteId': collateral,
            'settleId': undefined,
            'type': 'prediction',
            'marketType': 'binary',
            'executionModel': 'clob',
            'collateral': collateral,
            'spot': false,
            'margin': false,
            'swap': false,
            'future': false,
            'option': false,
            'prediction': true,
            'active': active,
            'resolved': resolved,
            'resolvedOutcome': resolvedOutcome,
            'contract': false,
            'linear': undefined,
            'inverse': undefined,
            'contractSize': undefined,
            'expiry': endDate,
            'expiryDatetime': this.iso8601 (endDate),
            'strike': undefined,
            'optionType': undefined,
            'taker': feeRate,
            'maker': 0,
            'percentage': true,
            'tierBased': false,
            'feeSide': 'get',
            'precision': precision,
            'limits': {
                'leverage': { 'min': 1, 'max': 1 },
                'amount': { 'min': undefined, 'max': undefined },
                'price': { 'min': 0.01, 'max': 0.99 },
                'cost': { 'min': 1.5, 'max': undefined },  // MARKET quotes require amountIn of at least ~1.5 USDT
            },
            'outcomes': outcomes,
            'info': this.extend (rawMarket, {
                'marketTopicId': topicId,
                'vendor': vendor,
                'slug': topicSlug,
                'volume': volume,
                'liquidity': liquidity,
            }),
            'created': this.safeInteger (rawTopic, 'publishedAt'),
        } as unknown as Market;
    }

    /**
     * @method
     * @name binance#fetchTicker
     * @description fetches the last trade price for a single prediction outcome
     * @see https://developers.binance.com/en/docs/catalog/web3-wallet-prediction-trading/api/rest-api/market-data#query-last-trade-price
     * @param {string} outcome unified outcome handle like BTC_PRICE_1H_UP_DOWN_UP:YES, or an outcome token id
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a prediction [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)
     */
    override async fetchTicker (outcome: Str, params = {}): Promise<PredictionTicker> {
        await this.loadOutcome (outcome);
        const outcomeObj = this.outcome (outcome);
        const info = this.safeDict (outcomeObj, 'info', {});
        const request: Dict = {
            'marketId': this.safeString (info, 'marketId'),
        };
        const response = await this.sapiPrivateGetOrderBookLastTradePrice (this.extend (request, params));
        //
        //     { "marketId": 5567895, "lastTradePrice": "0.52" }
        //
        return this.parsePredictionTicker (response, outcomeObj as any);
    }

    /**
     * @ignore
     * @method
     * @name binance#parsePredictionTicker
     * @description parses a last-trade-price response into a unified ticker object; the venue quotes the market's primary (YES) token, so a NO outcome mirrors as 1 - price
     * @param {object} raw the raw last-trade-price object
     * @param {object} [market] the outcome object the ticker belongs to
     * @returns {object} a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)
     */
    override parsePredictionTicker (raw: Dict, market: Market = undefined): PredictionTicker {
        //
        //     { "marketId": 5567895, "lastTradePrice": "0.52" }
        //
        const marketAny = market as any;
        const outcomeObj = this.safeOutcome (this.safeString (marketAny, 'outcome'), marketAny);
        // the venue quotes the market's primary token (outcome index 0, e.g. YES or UP),
        // any other outcome of a binary market mirrors as 1 - price
        const outcomeInfo = this.safeDict (outcomeObj, 'info', {});
        const outcomeIndex = this.safeString (outcomeInfo, 'index');
        let isMirrored = false;
        if (outcomeIndex !== undefined) {
            isMirrored = (outcomeIndex !== '0');
        } else {
            const label = this.safeStringUpper (outcomeObj, 'label', 'YES');
            isMirrored = (label === 'NO') || (label === 'DOWN');
        }
        const lastString = this.safeString (raw, 'lastTradePrice');
        let last = undefined;
        if (lastString !== undefined) {
            if (isMirrored) {
                last = this.parseNumber (Precise.stringSub ('1', lastString));
            } else {
                last = this.parseNumber (lastString);
            }
        }
        const now = this.milliseconds ();
        return this.safePredictionTicker ({
            'outcome': this.safeString (outcomeObj, 'outcome'),
            'outcomeId': this.safeString2 (outcomeObj, 'outcomeId', 'id'),
            'label': this.safeString (outcomeObj, 'label'),
            'market': this.safeString (outcomeObj, 'market'),
            'timestamp': now,
            'datetime': this.iso8601 (now),
            'high': undefined,
            'low': undefined,
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': undefined,
            'info': raw,
        }, market);
    }

    /**
     * @method
     * @name binance#fetchTickers
     * @description fetches last trade prices for multiple outcomes, one request per distinct underlying market
     * @see https://developers.binance.com/en/docs/catalog/web3-wallet-prediction-trading/api/rest-api/market-data#query-last-trade-price
     * @param {string[]} outcomes unified outcomes — required: the venue has no all-tickers endpoint
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of prediction [ticker structures](https://docs.ccxt.com/#/?id=ticker-structure)
     */
    override async fetchTickers (outcomes: Strings = undefined, params = {}): Promise<PredictionTickers> {
        if (outcomes === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchTickers() requires an outcomes argument — the venue has no all-tickers endpoint; pass the outcome handles to fetch (discover them via fetchEvents ())');
        }
        await this.loadOutcomes (outcomes);
        const responsesByMarketId: Dict = {};
        const result: PredictionTickers = {};
        const outcomesLength = outcomes.length;
        for (let i = 0; i < outcomesLength; i++) {
            const outcomeObj = this.outcome (outcomes[i]);
            const info = this.safeDict (outcomeObj, 'info', {});
            const marketId = this.safeString (info, 'marketId');
            if (marketId === undefined) {
                continue;
            }
            let response = this.safeDict (responsesByMarketId, marketId);
            if (response === undefined) {
                const request: Dict = {
                    'marketId': marketId,
                };
                response = await this.sapiPrivateGetOrderBookLastTradePrice (this.extend (request, params));
                responsesByMarketId[marketId] = response;
            }
            const ticker = this.parsePredictionTicker (response as Dict, outcomeObj as any);
            const symbolKey = this.safeString (ticker, 'outcome', outcomes[i]);
            result[symbolKey] = ticker;
        }
        return result;
    }

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
    override async fetchOrderBook (outcome: Str, limit: Int = undefined, params = {}): Promise<PredictionOrderBook> {
        await this.loadOutcome (outcome);
        const outcomeObj = this.outcome (outcome);
        const info = this.safeDict (outcomeObj, 'info', {});
        const request: Dict = {
            'vendor': this.safeString (info, 'vendor', this.safeString (this.options, 'defaultVendor')),
            'marketId': this.safeString (info, 'marketId'),
            'tokenId': this.safeString2 (outcomeObj, 'outcomeId', 'id'),
        };
        const response = await this.sapiPrivateGetOrderBook (this.extend (request, params));
        //
        //     {
        //         "outcome": "YES",
        //         "tokenId": "112233",
        //         "timestamp": 1748131800000,
        //         "bids": [ { "price": "0.51", "size": "5000.00" } ],
        //         "asks": [ { "price": "0.52", "size": "3000.00" } ]
        //     }
        //
        const timestamp = this.safeInteger (response, 'timestamp');
        const orderbook = this.parseOrderBook (response, this.safeOutcomeSymbol (outcome, outcomeObj), timestamp, 'bids', 'asks', 'price', 'size');
        return this.safePredictionOrderBook (orderbook, outcomeObj);
    }

    /**
     * @method
     * @name binance#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://developers.binance.com/en/docs/catalog/web3-wallet-prediction-trading/api/rest-api/wallet#query-payment-option-balances
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] 'CeDefi', 'FUNDING', or 'SPOT'
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
     */
    override async fetchBalance (params = {}): Promise<Balances> {
        let type = undefined;
        [ type, params ] = this.handleOptionAndParams (params, 'fetchBalance', 'type', 'SPOT');
        const response = await this.sapiPrivateGetBalancePaymentOptions (params);
        //
        // {
        //     "items": [
        //         {
        //             "accountType": "SPOT",
        //             "availableBalanceDisplay": "1000.00",
        //             "enabled": true
        //         }
        //     ]
        // }
        //
        const result: Dict = {
            'info': response,
        };
        const balances = this.safeList (response, 'items', []);
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const accountType = this.safeString (balance, 'accountType');
            if (accountType === type) {
                const free = this.safeString (balance, 'availableBalanceDisplay');
                const account = this.account ();
                account['free'] = free;
                result['USDT'] = account;
            }
        }
        return this.safeBalance (result);
    }

    /**
     * @ignore
     * @method
     * @name binance#parsePredictionOrder
     * @description parses a raw binance prediction order object into a unified order object
     * @param {object} order the raw order object
     * @param {object} [outcomeObj] the ourtome the order belongs to
     * @returns {object} a [prediction order structure](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    override parsePredictionOrder (order: Dict, outcomeObj: Market = undefined): PredictionOrder {
        //
        // {
        //     "orderId": "54124",
        //     "vendorOrderId": "0x1234abcd...",
        //     "vendor": "PREDICT_FUN",
        //     "marketTopicId": 4229564,
        //     "slug": "btc-price-1h-up-or-down",
        //     "marketTopicTitle": "BTC Price 1h Up or Down?",
        //     "marketId": 5567895,
        //     "marketTitle": "UP",
        //     "outcome": "YES",
        //     "outcomeIndex": 0,
        //     "status": "OPENING",
        //     "side": "BUY",
        //     "orderType": "LIMIT",
        //     "createTime": 1748131500000,
        //     "modifyTime": 1748131500000,
        //     "makerUsdtAmount": "1.00",
        //     "makerShareQty": "2000.00",
        //     "filledUsdtAmount": "0.00",
        //     "filledShareQty": "0.00",
        //     "fillPercentage": "0.00",
        //     "price": "0.50",
        //     "marketProviderFee": "0.02",
        //     "networkFee": "0.000001"
        // }
        //
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        if (outcomeObj === undefined) {
            const marketId = this.safeString (order, 'marketId');
            const outcome = this.safeStringUpper (order, 'outcome');
            const market = this.safeMarket (marketId);
            let outcomeName = this.safeString (market, 'market');
            if (outcomeName === undefined) {
                outcomeName = marketId;
            }
            outcomeName += ':' + outcome;
            outcomeObj = this.safeOutcome (outcomeName);
        }
        const side = this.safeStringLower (order, 'side');
        const timestamp = this.safeInteger (order, 'createTime');
        return this.safePredictionOrder ({
            'id': this.safeString (order, 'orderId'),
            'clientOrderId': undefined,
            'info': order,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'status': status,
            'outcome': this.safeString (outcomeObj, 'outcome'),
            'outcomeId': this.safeString (outcomeObj, 'id'),
            'label': this.safeString (outcomeObj, 'label'),
            'market': this.safeString (outcomeObj, 'market'),
            'type': this.safeStringLower (order, 'orderType'),
            'timeInForce': undefined,
            'postOnly': undefined,
            'reduceOnly': undefined,
            'side': side,
            'price': this.safeNumber (order, 'price'),
            'triggerPrice': undefined,
            'amount': undefined,
            'cost': undefined,
            'average': undefined,
            'filled': undefined,
            'remaining': undefined,
            'fee': undefined,
            'trades': [],
        }, outcomeObj);
    }

    parseOrderStatus (status: Str): Str {
        const statuses = {
            'OPENING': 'open',
            'FILLED': 'closed',
            // 'canceled': 'canceled',
            // 'rejected': 'rejected',
            // 'marginCanceled': 'canceled',
        };
        if (status === undefined) {
            return undefined;
        }
        if (status.endsWith ('Rejected')) {
            return 'rejected';
        }
        if (status.endsWith ('Canceled')) {
            return 'canceled';
        }
        return this.safeString (statuses, status, status);
    }

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
    override async fetchOpenOrders (outcome: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<PredictionOrder[]> {
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchOpenOrders', 'paginate');
        let maxEntriesPerRequest = undefined;
        [ maxEntriesPerRequest, params ] = this.handleOptionAndParams (params, 'fetchOpenOrders', 'maxEntriesPerRequest', 100);
        const pageKey = 'ccxtPageKey';
        if (paginate) {
            return await this.fetchPaginatedCallIncremental ('fetchOpenOrders', outcome, since, limit, params, pageKey, maxEntriesPerRequest) as PredictionOrder[];
        }
        const page = this.safeInteger (params, pageKey, 1) - 1;
        const request: Dict = {};
        const offSet = this.safeInteger (params, 'offset', page * maxEntriesPerRequest);
        if (offSet > 0) {
            request['offset'] = offSet;
        }
        let outcomeObj = undefined;
        if (outcome !== undefined) {
            await this.loadOutcome (outcome);
            outcomeObj = this.outcome (outcome);
            const market = this.market (outcomeObj['market']);
            request['marketId'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const wallet = await this.fetchWallet ('fetchOpenOrders', params);
        request['walletAddress'] = wallet['walletAddress'];
        const response = await this.sapiPrivateGetOrderList (this.extend (request, params));
        //
        // {
        //     "total": 2,
        //     "offset": 0,
        //     "limit": 20,
        //     "orders": [
        //         {
        //             "orderId": "54124",
        //             "vendorOrderId": "0x1234abcd...",
        //             "vendor": "PREDICT_FUN",
        //             "marketTopicId": 4229564,
        //             "slug": "btc-price-1h-up-or-down",
        //             "marketTopicTitle": "BTC Price 1h Up or Down?",
        //             "marketId": 5567895,
        //             "marketTitle": "UP",
        //             "outcome": "YES",
        //             "outcomeIndex": 0,
        //             "status": "OPENING",
        //             "side": "BUY",
        //             "orderType": "LIMIT",
        //             "createTime": 1748131500000,
        //             "modifyTime": 1748131500000,
        //             "makerUsdtAmount": "1.00",
        //             "makerShareQty": "2000.00",
        //             "filledUsdtAmount": "0.00",
        //             "filledShareQty": "0.00",
        //             "fillPercentage": "0.00",
        //             "price": "0.50",
        //             "marketProviderFee": "0.02",
        //             "networkFee": "0.000001"
        //         }
        //     ]
        // }
        //
        const orders = this.safeList (response, 'orders', []);
        const parsedOrders = this.parsePredictionOrders (orders, outcomeObj, since);
        return this.filterByOutcomeSinceLimit (parsedOrders, outcome, since, limit) as PredictionOrder[];
    }

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
    override async fetchOrders (outcome: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<PredictionOrder[]> {
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchOrders', 'paginate');
        let maxEntriesPerRequest = undefined;
        [ maxEntriesPerRequest, params ] = this.handleOptionAndParams (params, 'fetchOrders', 'maxEntriesPerRequest', 100);
        const pageKey = 'ccxtPageKey';
        if (paginate) {
            return await this.fetchPaginatedCallIncremental ('fetchOrders', outcome, since, limit, params, pageKey, maxEntriesPerRequest) as PredictionOrder[];
        }
        const page = this.safeInteger (params, pageKey, 1) - 1;
        const request: Dict = {};
        const offSet = this.safeInteger (params, 'offset', page * maxEntriesPerRequest);
        if (offSet > 0) {
            request['offset'] = offSet;
        }
        let outcomeObj = undefined;
        if (outcome !== undefined) {
            await this.loadOutcome (outcome);
            outcomeObj = this.outcome (outcome);
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (since !== undefined) {
            request['startDate'] = this.yyyymmdd (since);
        }
        const until = this.safeInteger (params, 'until');
        params = this.omit (params, 'until');
        if (until !== undefined) {
            request['endDate'] = this.yyyymmdd (until);
        }
        const wallet = await this.fetchWallet ('fetchOrders', params);
        request['walletAddress'] = wallet['walletAddress'];
        const response = await this.sapiPrivateGetOrderHistory (this.extend (request, params));
        //
        // {
        //     "total": 15,
        //     "offset": 0,
        //     "limit": 20,
        //     "orders": [
        //         {
        //             "orderId": "54100",
        //             "vendorOrderId": "0xabcd5678...",
        //             "vendor": "PREDICT_FUN",
        //             "marketTopicId": 4229500,
        //             "slug": "btc-price-1h-up-or-down-prev",
        //             "marketTopicTitle": "BTC Price 1h Up or Down?",
        //             "marketId": 5567800,
        //             "marketTitle": "UP",
        //             "outcome": "YES",
        //             "outcomeIndex": 0,
        //             "status": "CLOSED",
        //             "side": "BUY",
        //             "orderType": "MARKET",
        //             "createTime": 1748045100000,
        //             "modifyTime": 1748045101000,
        //             "terminalTime": 1748045101000,
        //             "makerUsdtAmount": "1.00",
        //             "makerShareQty": "1923.07",
        //             "filledUsdtAmount": "1.00",
        //             "filledShareQty": "1923.07",
        //             "fillPercentage": "1.00",
        //             "price": "0.52",
        //             "marketProviderFee": "0.02",
        //             "networkFee": "0.000001"
        //         }
        //     ]
        // }
        //
        const orders = this.safeList (response, 'orders', []);
        const parsedOrders = this.parsePredictionOrders (orders, outcomeObj, since);
        return this.filterByOutcomeSinceLimit (parsedOrders, outcome, since, limit) as PredictionOrder[];
    }

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
    override async fetchPositions (outcomes: Strings = undefined, params = {}): Promise<PredictionPosition[]> {
        await this.loadOutcomes ();
        const requestedOutcomeSymbols: Dict = {};
        if (outcomes !== undefined) {
            for (let i = 0; i < outcomes.length; i++) {
                const requested = outcomes[i];
                const requestedOutcomeObj = this.safeOutcome (requested);
                const requestedOutcome = this.safeString (requestedOutcomeObj, 'outcome', requested);
                requestedOutcomeSymbols[requestedOutcome] = true;
            }
        }
        const wallet = await this.fetchWallet ('fetchPositions', params);
        const request = {
            'walletAddress': wallet['walletAddress'],
        };
        const response = await this.sapiPrivateGetPositionList (this.extend (request, params));
        //
        // {
        //     "summary": {
        //         "totalValue": "1523.45",
        //         "positionValue": "523.45",
        //         "walletBalance": "1000.00",
        //         "totalClaimableAmount": "50.00",
        //         "todayRealizedPnl": "15.30",
        //         "todayRealizedPnlPercent": "3.10",
        //         "todayTotalCost": "493.55"
        //     },
        //     "counts": {
        //         "ongoingCount": 3,
        //         "endedCount": 12,
        //         "pendingClaimCount": 1
        //     },
        //     "positions": [
        //         {
        //             "positionId": 1001,
        //             "vendor": "PREDICT_FUN",
        //             "chainId": "56",
        //             "tokenId": "112233",
        //             "collateralSymbol": "USDT",
        //             "topicType": "FLAT",
        //             "marketTopicId": 4229564,
        //             "marketId": 5567895,
        //             "marketTopicTitle": "BTC Price 1h Up or Down?",
        //             "marketTitle": "UP",
        //             "outcomeName": "YES",
        //             "outcomeIndex": 0,
        //             "shares": "1923.07",
        //             "avgPrice": "0.52",
        //             "totalCost": "1.00",
        //             "value": "1.06",
        //             "currentPrice": "0.55",
        //             "toWin": "1923.07",
        //             "positionStatus": "OPEN",
        //             "canClaim": false,
        //             "endDate": 1748134800000,
        //             "unrealizedPnl": "0.06",
        //             "unrealizedPnlPercent": "6.00",
        //             "realizedPnl": "0.00",
        //             "pnl": "0.06",
        //             "createdTime": 1748131500000,
        //             "updatedTime": 1748132000000
        //         }
        //     ]
        // }
        //
        const data = this.safeList (response, 'positions', []);
        const positions = this.parsePredictionPositions (data);
        if (outcomes === undefined) {
            return positions;
        }
        const filtered: PredictionPosition[] = [];
        const positionsLength = positions.length;
        for (let i = 0; i < positionsLength; i++) {
            const position = positions[i];
            const positionOutcome = this.safeString (position, 'outcome');
            if ((positionOutcome !== undefined) && (positionOutcome in requestedOutcomeSymbols)) {
                filtered.push (position);
            }
        }
        return filtered;
    }

    /**
     * @method
     * @name binance#fetchPosition
     * @description fetch data on an open position
     * @see https://developers.binance.com/en/docs/catalog/web3-wallet-prediction-trading/api/rest-api/position#query-positions-by-filter
     * @param {string} [outcome] filter by outcome
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [prediction position structures](https://docs.ccxt.com/#/?id=prediction-position-structure)
     */
    override async fetchPosition (outcome: string, params = {}): Promise<PredictionPosition> {
        const request: Dict = {};
        let outcomeObj = undefined;
        if (outcome !== undefined) {
            await this.loadOutcome (outcome);
            outcomeObj = this.outcome (outcome);
            const market = this.market (outcomeObj['market']);
            request['marketTopicId'] = market['info']['marketTopicId'];
        }
        const wallet = await this.fetchWallet ('fetchOrders', params);
        request['walletAddress'] = wallet['walletAddress'];
        const response = await this.sapiPrivateGetPositionFilter (this.extend (request, params));
        //
        //
        const positions = this.safeList (response, 'positions', []);
        const parsedPositions = this.parsePredictionPositions (positions);
        const filteredPositions = this.filterByOutcomeSinceLimit (parsedPositions, outcome, undefined, undefined);
        return this.safeDict (filteredPositions, 0) as PredictionPosition;
    }

    /**
     * @ignore
     * @method
     * @name binance#parsePredictionPosition
     * @description parses a spot balance entry for an outcome token into a unified position object
     * @param {object} position the raw balance entry
     * @param {object} [outcomeObj] the ourtome the position belongs to
     * @returns {object} a [prediction position structure](https://docs.ccxt.com/#/?id=prediction-position-structure)
     */
    override parsePredictionPosition (position: Dict, outcomeObj: Market = undefined): PredictionPosition {
        if (outcomeObj === undefined) {
            const marketId = this.safeString (position, 'marketId');
            const outcome = this.safeStringUpper (position, 'outcomeName');
            const market = this.safeMarket (marketId);
            let outcomeName = this.safeString (market, 'market');
            if (outcomeName === undefined) {
                outcomeName = marketId;
            }
            outcomeName += ':' + outcome;
            outcomeObj = this.safeOutcome (outcomeName);
        }
        const timestamp = this.safeInteger (position, 'createdTime');
        const totalCost = this.parseNumber (this.safeString (position, 'totalCost'));
        return this.safePredictionPosition ({
            'id': this.safeInteger (position, 'positionId'),
            'outcome': this.safeString (outcomeObj, 'outcome'),
            'outcomeId': this.safeString2 (outcomeObj, 'outcomeId', 'id'),
            'market': this.safeString (outcomeObj, 'market'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'isolated': false,
            'hedged': undefined,
            'side': 'long',
            'contracts': undefined,
            'contractSize': this.parseNumber (this.safeString (position, 'shares')),
            'entryPrice': this.parseNumber (this.safeString (position, 'avgPrice')),
            'markPrice': undefined,
            'notional': this.parseNumber (this.safeString (position, 'value')),
            'leverage': undefined,
            'collateral': totalCost,
            'initialMargin': totalCost,
            'maintenanceMargin': undefined,
            'initialMarginPercentage': undefined,
            'maintenanceMarginPercentage': undefined,
            'unrealizedPnl': this.parseNumber (this.safeString (position, 'unrealizedPnl')),
            'realizedPnl': this.parseNumber (this.safeString (position, 'realizedPnl')),
            'liquidationPrice': undefined,
            'marginRatio': undefined,
            'marginMode': 'cross',
            'percentage': this.parseNumber (this.safeString (position, 'unrealizedPnlPercent')),
            'info': position,
        });
    }

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
    override async fetchMyTrades (outcome: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<PredictionTrade[]> {
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchMyTrades', 'paginate');
        let maxEntriesPerRequest = undefined;
        [ maxEntriesPerRequest, params ] = this.handleOptionAndParams (params, 'fetchMyTrades', 'maxEntriesPerRequest', 100);
        const pageKey = 'ccxtPageKey';
        if (paginate) {
            return await this.fetchPaginatedCallIncremental ('fetchMyTrades', outcome, since, limit, params, pageKey, maxEntriesPerRequest) as PredictionTrade[];
        }
        const page = this.safeInteger (params, pageKey, 1) - 1;
        const request: Dict = {
            'status': 'FILLED',
        };
        const offSet = this.safeInteger (params, 'offset', page * maxEntriesPerRequest);
        if (offSet > 0) {
            request['offset'] = offSet;
        }
        let outcomeObj = undefined;
        if (outcome !== undefined) {
            await this.loadOutcome (outcome);
            outcomeObj = this.outcome (outcome);
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (since !== undefined) {
            request['startDate'] = this.yyyymmdd (since);
        }
        const until = this.safeInteger (params, 'until');
        params = this.omit (params, 'until');
        if (until !== undefined) {
            request['endDate'] = this.yyyymmdd (until);
        }
        const wallet = await this.fetchWallet ('fetchMyTrades', params);
        request['walletAddress'] = wallet['walletAddress'];
        const response = await this.sapiPrivateGetOrderHistory (this.extend (request, params));
        //
        // {
        //     "total": 15,
        //     "offset": 0,
        //     "limit": 20,
        //     "orders": [
        //         {
        //             "orderId": "54100",
        //             "vendorOrderId": "0xabcd5678...",
        //             "vendor": "PREDICT_FUN",
        //             "marketTopicId": 4229500,
        //             "slug": "btc-price-1h-up-or-down-prev",
        //             "marketTopicTitle": "BTC Price 1h Up or Down?",
        //             "marketId": 5567800,
        //             "marketTitle": "UP",
        //             "outcome": "YES",
        //             "outcomeIndex": 0,
        //             "status": "CLOSED",
        //             "side": "BUY",
        //             "orderType": "MARKET",
        //             "createTime": 1748045100000,
        //             "modifyTime": 1748045101000,
        //             "terminalTime": 1748045101000,
        //             "makerUsdtAmount": "1.00",
        //             "makerShareQty": "1923.07",
        //             "filledUsdtAmount": "1.00",
        //             "filledShareQty": "1923.07",
        //             "fillPercentage": "1.00",
        //             "price": "0.52",
        //             "marketProviderFee": "0.02",
        //             "networkFee": "0.000001"
        //         }
        //     ]
        // }
        //
        const trades = this.safeList (response, 'orders', []);
        const parsedTrades = this.parsePredictionTrades (trades, outcomeObj);
        return this.filterByOutcomeSinceLimit (parsedTrades, outcome, since, limit) as PredictionTrade[];
    }

    /**
     * @ignore
     * @method
     * @name binance#parsePredictionTrade
     * @description parses a single binance fill into a unified trade object
     * @param {object} trade the raw fill object
     * @param {object} [outcomeObj] the outcome the trade belongs to
     * @returns {object} a [prediction trade structure](https://docs.ccxt.com/#/?id=prediction-trade-structure)
     */
    override parsePredictionTrade (trade: Dict, outcomeObj: Market = undefined): PredictionTrade {
        //
        // {
        //     "orderId": "54124",
        //     "vendorOrderId": "0x1234abcd...",
        //     "vendor": "PREDICT_FUN",
        //     "marketTopicId": 4229564,
        //     "slug": "btc-price-1h-up-or-down",
        //     "marketTopicTitle": "BTC Price 1h Up or Down?",
        //     "marketId": 5567895,
        //     "marketTitle": "UP",
        //     "outcome": "YES",
        //     "outcomeIndex": 0,
        //     "status": "OPENING",
        //     "side": "BUY",
        //     "orderType": "LIMIT",
        //     "createTime": 1748131500000,
        //     "modifyTime": 1748131500000,
        //     "makerUsdtAmount": "1.00",
        //     "makerShareQty": "2000.00",
        //     "filledUsdtAmount": "0.00",
        //     "filledShareQty": "0.00",
        //     "fillPercentage": "0.00",
        //     "price": "0.50",
        //     "marketProviderFee": "0.02",
        //     "networkFee": "0.000001"
        // }
        //
        if (outcomeObj === undefined) {
            const marketId = this.safeString (trade, 'marketId');
            const outcome = this.safeStringUpper (trade, 'outcome');
            const market = this.safeMarket (marketId);
            let outcomeName = this.safeString (market, 'market');
            if (outcomeName === undefined) {
                outcomeName = marketId;
            }
            outcomeName += ':' + outcome;
            outcomeObj = this.safeOutcome (outcomeName);
        }
        const timestamp = this.safeInteger (trade, 'createTime');
        const filled = this.safeString (trade, 'filledShareQty');
        const cost = this.safeString (trade, 'filledUsdtAmount');
        const price = this.safeString (trade, 'price');
        const orderType = this.safeStringLower (trade, 'orderType');
        let fee = undefined;
        if ((orderType === 'market') && (cost !== undefined) && (price !== undefined) && (filled !== undefined)) {
            // buys pay cost above price*filled, sells receive proceeds net of the fee —
            // either way the fee is the absolute difference
            const feeCost = Precise.stringAbs (Precise.stringSub (cost, Precise.stringMul (price, filled)));
            fee = {
                'currency': 'USDT',
                'cost': this.parseNumber (feeCost),
            };
        }
        return this.safePredictionTrade ({
            'id': undefined,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': this.safeInteger (trade, 'modifyTime'),
            'outcome': this.safeString (outcomeObj, 'outcome'),
            'outcomeId': this.safeString (outcomeObj, 'id'),
            'label': this.safeString (outcomeObj, 'label'),
            'market': this.safeString (outcomeObj, 'market'),
            'order': this.safeString (trade, 'orderId'),
            'type': orderType,
            'side': this.safeStringLower (trade, 'side'),
            'takerOrMaker': undefined,
            'price': price,
            'amount': this.safeString (trade, 'makerShareQty'),
            'filled': filled,
            'cost': cost,
            'fee': fee,
        }, outcomeObj);
    }

    /**
     * @method
     * @name binance#fetchWallet
     * @description fetch wallet for user and save the one match the walletAddress user provided
     * @see https://developers.binance.com/en/docs/catalog/web3-wallet-prediction-trading/api/rest-api/wallet#list-prediction-wallets
     * @param {string} [methodName] method name
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a wallet
     */
    async fetchWallet (methodName: string, params = {}): Promise<any> {
        let cachedWallet = this.safeDict (this.options, 'wallet');
        if (cachedWallet !== undefined) {
            return cachedWallet;
        }
        let walletAddress = undefined;
        [ walletAddress, params ] = this.handleOptionAndParams (params, methodName, 'walletAddress', this.walletAddress);
        const response = await this.sapiPrivateGetWalletList ();
        //
        // {
        //     "wallets": [
        //         {
        //             "walletAddress": "0x12e32db8817e292508c34111cbc4b23340df542c",
        //             "walletId": "5b5c1ec3be4e4416a5872b21c1ca5d20",
        //             "registeredTime": 1748000000000
        //         }
        //     ]
        // }
        //
        const wallets = this.safeList (response, 'wallets', []);
        if (walletAddress === undefined) {
            cachedWallet = this.safeDict (wallets, 0);
            this.options['wallet'] = cachedWallet;
            return cachedWallet;
        }
        const walletLength = wallets.length;
        for (let i = 0; i < walletLength; i++) {
            const w = this.safeString (wallets[i], 'walletAddress', '');
            if (w === walletAddress) {
                cachedWallet = wallets[i];
                break;
            }
        }
        if (cachedWallet === undefined) {
            throw new NotSupported (this.id + 'fetchWallet could\'n find wallet ' + walletAddress);
        }
        this.options['wallet'] = cachedWallet;
        return cachedWallet;
    }

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
    async fetchQuote (request: Dict, params = {}): Promise<any> {
        const response = await this.sapiPrivatePostTradeGetQuote (this.extend (request, params));
        //
        // {
        //     "quoteId": "q_20260525_abc123xyz",
        //     "tokenId": "112233",
        //     "chance": "0.52",
        //     "vendor": "PREDICT_FUN",
        //     "marketTitle": "UP",
        //     "marketExtId": "ext_001",
        //     "side": "BUY",
        //     "amountIn": "1000000000000000000",
        //     "amountOut": "1923070000000000000",
        //     "isMinAmountOut": false,
        //     "feeAmount": "20000000000000000",
        //     "feeDiscountBps": "0",
        //     "averagePrice": 0.52,
        //     "lastPrice": 0.52,
        //     "priceImpact": 0.001,
        //     "timestamp": 1748131500000,
        //     "chainId": "56",
        //     "userId": 100103755893,
        //     "walletAddress": "0x12e32db8817e292508c34111cbc4b23340df542c",
        //     "orderType": "MARKET",
        //     "slippageBps": 1200,
        //     "feeRateBps": 200,
        //     "minReceive": "1900000000000000000",
        //     "expireAt": 1748131800000,
        //     "priceLimit": null
        // }
        //
        return response;
    }

    override priceToPrecision (outcome: Str, price: any): string {
        const market = this.market (outcome);
        const prec = this.safeNumber (this.safeDict (market as any, 'precision', {}), 'price', 0.0001);
        let decimals = 4;
        if ((prec !== undefined) && (prec > 0)) {
            decimals = this.precisionFromString (this.numberToString (prec));
        }
        return this.decimalToPrecision (price, ROUND, decimals, DECIMAL_PLACES, this.paddingMode);
    }

    override amountToPrecision (outcome: Str, amount: any): string {
        const market = this.market (outcome);
        const prec = this.safeNumber (this.safeDict (market as any, 'precision', {}), 'amount', 0.01);
        let decimals = 2;
        if ((prec !== undefined) && (prec > 0)) {
            decimals = this.precisionFromString (this.numberToString (prec));
        }
        // amounts truncate so a rounded-up value can never exceed the caller's balance
        return this.decimalToPrecision (amount, TRUNCATE, decimals, DECIMAL_PLACES, this.paddingMode);
    }

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
    override async createOrder (outcome: string, type: string, side: string, amount: number, price: Num = undefined, params = {}): Promise<PredictionOrder> {
        await this.loadOutcome (outcome);
        const outcomeObj = this.outcome (outcome);
        // markets are keyed by the parent market outcome; the outcome handle ("MARKET:LABEL")
        // is not a market id, so resolve the market and price/amount precision via outcomeObj['market']
        const marketSymbol = this.safeString (outcomeObj, 'market') as string;
        const market = this.market (marketSymbol);
        const typeUpper = type.toUpperCase ();
        const sideUpper = side.toUpperCase ();
        const wallet = await this.fetchWallet ('createOrder', params);
        const defaultSlippage = this.safeString (this.options, 'defaultSlippage', '0.05');
        const slippage = this.safeString (params, 'slippage', defaultSlippage);
        const cost = this.safeString (params, 'cost');
        const slippageBps = this.parseToInt (Precise.stringMul (slippage, '10000'));
        const commonRequest: Dict = {
            'walletAddress': wallet['walletAddress'],
            'orderType': typeUpper,
            'slippageBps': slippageBps,
        };
        let amountStr: Str = this.numberToString (amount);
        const priceStr = this.numberToString (price);
        let defaultTif = 'FOK';
        if (typeUpper === 'LIMIT') {
            if (price === undefined) {
                throw new ArgumentsRequired (this.id + 'createOrder requires price for limit order');
            }
            commonRequest['priceLimit'] = this.priceToPrecision (marketSymbol, price);
            defaultTif = 'GTC';
        }
        if (sideUpper === 'BUY') {
            if (cost !== undefined) {
                amountStr = cost;
            } else {
                // the amountIn represents USDT for buy order
                let feeRateBps = this.safeString (params, 'feeRateBps', '200');
                if (typeUpper === 'LIMIT') {
                    feeRateBps = '0';
                } else {
                    if (price === undefined) {
                        throw new ArgumentsRequired (this.id + ' createOrder requires price for ' + side + ' order');
                    }
                }
                const feeRate = Precise.stringDiv (feeRateBps, '10000');
                const minPrice = Precise.stringMin (priceStr, Precise.stringSub ('1', priceStr));
                const fee = Precise.stringMul (Precise.stringMul (feeRate, minPrice), amountStr);
                amountStr = Precise.stringAdd (Precise.stringMul (amountStr, priceStr), fee);
            }
        }
        const timeInForce = this.safeStringUpper (params, 'timeInForce', defaultTif);
        const accountType = this.safeString (params, 'accountType');
        if (accountType === undefined) {
            throw new ArgumentsRequired (this.id + ' createOrder requires accountType (SPOT, FUNDING)');
        }
        params = this.omit (params, [ 'timeInForce', 'accountType', 'cost' ]);
        const quoteRequest = this.extend (commonRequest, {
            'tokenId': outcomeObj['id'],
            'side': sideUpper,
            'amountIn': Precise.stringMul (this.amountToPrecision (marketSymbol, amountStr), '1000000000000000000'),
        });
        const quote = await this.fetchQuote (quoteRequest, params);
        const quoteId = this.safeString (quote, 'quoteId');
        const orderRequest = this.extend (commonRequest, {
            'walletId': wallet['walletId'],
            'quoteId': quoteId,
            'timeInForce': timeInForce,
            'accountType': accountType,
        });
        const response = await this.sapiPrivatePostTradePlaceOrderBundle (this.extend (orderRequest, params));
        return this.safePredictionOrder ({
            'id': this.safeString (response, 'orderId'),
            'clientOrderId': undefined,
            'info': response,
            'timestamp': undefined,
            'datetime': undefined,
            'status': undefined,
            'outcome': this.safeString (outcomeObj, 'outcome', outcome),
            'outcomeId': this.safeString (outcomeObj, 'id'),
            'label': this.safeString (outcomeObj, 'label'),
            'market': this.safeString (outcomeObj, 'market'),
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'filled': undefined,
            'remaining': undefined,
            'cost': undefined,
            'fee': undefined,
            'trades': [],
        }, market);
    }

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
    async createMarketOrderWithCost (symbol: string, side: string, cost: number, params = {}) {
        const req = {
            'cost': cost,
        };
        return await this.createOrder (symbol, 'market', side, cost, undefined, this.extend (req, params));
    }

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
    override async cancelOrder (id: string, outcome: Str = undefined, params = {}): Promise<PredictionOrder> {
        const orders = await this.cancelOrders ([ id ], outcome, params);
        return this.safeDict (orders, 0, {}) as PredictionOrder;
    }

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
    override async cancelOrders (ids: string[], outcome: Str = undefined, params = {}): Promise<PredictionOrder[]> {
        let outcomeObj = undefined;
        if (outcome !== undefined) {
            await this.loadOutcome (outcome);
            outcomeObj = this.outcome (outcome);
        }
        const wallet = await this.fetchWallet ('cancelOrders', params);
        const request: Dict = {
            'walletAddress': wallet['walletAddress'],
            'walletId': wallet['walletId'],
        };
        // flatten cancelInfoList to dot list, eg. cancelInfoList[o].orderId=1234
        for (let i = 0; i < ids.length; i++) {
            const key = 'cancelInfoList[' + this.numberToString (i) + '].orderId';
            request[key] = ids[i];
        }
        const response = await this.sapiPrivatePostTradeBatchCancel (this.extend (request, params));
        //
        // {
        //     "canceled": [
        //         "54124"
        //     ],
        //     "failed": [
        //         {
        //             "orderId": "54126",
        //             "reason": "ORDER_NOT_FOUND"
        //         }
        //     ]
        // }
        //
        const canceledOrders = this.safeList (response, 'canceled', []);
        const outcomeSymbol = this.safeString (outcomeObj, 'outcome', outcome);
        const failedOrders = this.safeList (response, 'failed', []);
        const failedOrdersLength = failedOrders.length;
        for (let i = 0; i < failedOrdersLength; i++) {
            const failedOrder = failedOrders[i];
            const error = this.safeString (failedOrder, 'reason');
            throw new OrderNotFound (this.id + ' cancelOrders() failed for ' + this.safeString (failedOrder, 'orderId') + ': ' + error);
        }
        const orders = [];
        const canceledOrdersLength = canceledOrders.length;
        for (let i = 0; i < canceledOrdersLength; i++) {
            const status = canceledOrders[i];
            const order = {
                'id': status,
                'clientOrderId': undefined,
                'info': status,
                'status': 'canceled',
                'outcome': outcomeSymbol,
                'outcomeId': this.safeString (outcomeObj, 'id'),
                'label': this.safeString (outcomeObj, 'label'),
                'market': this.safeString (outcomeObj, 'market'),
                'timestamp': this.milliseconds (),
                'datetime': this.iso8601 (this.milliseconds ()),
            };
            orders.push (this.safePredictionOrder (order) as PredictionOrder);
        }
        return orders;
    }

    override handleErrors (code: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any) {
        if (response === undefined) {
            return undefined;
        }
        const errorCode = this.safeString (response, 'code');
        if ((errorCode !== undefined) && Precise.stringLt (errorCode, '0')) {
            const message = this.safeString (response, 'msg', '');
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
            throw new ExchangeError (feedback);
        }
        return undefined;
    }

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
    override sign (path: any, api: any = 'sapi', method = 'GET', params = {}, headers: any = undefined, body: any = undefined) {
        const apiGroup: string = typeof api === 'string' ? api : api[0];
        const baseUrls = this.urls['api'] as Dict;
        const baseUrl = this.safeString (baseUrls, apiGroup, baseUrls['sapi'] as string);
        let url = baseUrl + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        this.checkRequiredCredentials ();
        const extendedParams = this.extend ({
            'timestamp': this.nonce (),
        }, query);
        const defaultRecvWindow = this.safeInteger (this.options, 'recvWindow');
        if (defaultRecvWindow !== undefined) {
            extendedParams['recvWindow'] = defaultRecvWindow;
        }
        let querystring = this.urlencodeNested (extendedParams);
        querystring = querystring.replaceAll ('%5B', '[');
        querystring = querystring.replaceAll ('%5D', ']');
        const signature = this.hmac (this.encode (querystring), this.encode (this.secret), sha256);
        querystring = querystring + '&signature=' + signature;
        headers = {
            'X-MBX-APIKEY': this.apiKey,
        };
        if ((method === 'GET') || (method === 'DELETE')) {
            url = url + '?' + querystring;
        } else {
            body = querystring;
            headers['Content-Type'] = 'application/x-www-form-urlencoded';
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}
