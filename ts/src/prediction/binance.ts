import Exchange from '../abstract/prediction/binance.js';
import { Precise } from '../base/Precise.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { ArgumentsRequired, AuthenticationError, BadRequest, BadSymbol, ExchangeError, InvalidNonce, PermissionDenied, RateLimitExceeded, InsufficientFunds, InvalidOrder } from '../base/errors.js';
import type {
    Int, int, Str, Dict, Strings,
    Market, PredictionOrderBook,
    PredictionEvent, PredictionTicker, PredictionTickers,
    fetchEventsParams,
} from '../base/types.js';

// ---------------------------------------------------------------------------

/**
 * @class binance
 * @augments Exchange
 * @description Binance Web3 Wallet prediction trading. Binance aggregates prediction markets from
 * on-chain vendors (predict.fun on BNB Chain) behind its standard signed SAPI — every endpoint,
 * including market data, requires apiKey/secret credentials
 */
export default class binance extends Exchange {
    describe (): any {
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
                'fetchEvent': true,
                'fetchEvents': true,
                'fetchMarkets': true,
                'fetchOrderBook': true,
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
                            'category/list': 200,
                            'market/list': 200,
                            'market/search': 200,
                            'market/detail': 200,
                            'order-book': 200,
                            'order-book/last-trade-price': 200,
                            'wallet/list': 200,
                            'balance/payment-options': 200,
                            'quota/limit/status': 200,
                            'pnl/portfolio': 200,
                            'pnl/query': 200,
                            'position/list': 200,
                            'position/filter': 200,
                            'position/token': 200,
                            'position/settled-history': 200,
                            'order/list': 200,
                            'order/history': 200,
                        },
                        'post': {
                            'trade/get-quote': 200,
                            'trade/place-order-bundle': 200,
                            'trade/batch-cancel': 200,
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
                    'maker': 0.02,
                    'taker': 0.02,  // default feeRateBps of 200 applied per order
                },
            },
            'exceptions': {
                'exact': {
                    '-1003': RateLimitExceeded,
                    '-1021': InvalidNonce,      // timestamp outside recvWindow
                    '-1022': AuthenticationError,   // invalid signature
                    '-1102': BadRequest,        // mandatory parameter missing
                    '-1121': BadSymbol,
                    '-2008': AuthenticationError,   // invalid api-key id
                    '-2014': AuthenticationError,   // api-key format invalid
                    '-2015': PermissionDenied,  // invalid key, ip or permissions
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
                // venue-specific fetchEvents scope params accepted by requireEventQuery in
                // addition to the unified query/queries/tags/eventId/slug
                'eventScopeParams': [ 'l1Category', 'l2Category' ],
            },
        });
    }

    nonce (): Int {
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
    async fetchMarkets (params = {}): Promise<Market[]> {
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
            return [];
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
    async fetchEvents (params: fetchEventsParams = {}): Promise<PredictionEvent[]> {
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
        let fetchCap = this.safeInteger (this.options, 'maxFetchEventsResults', 25);
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
            const sortBy = this.safeStringUpper2 (params, 'sort', 'sortBy');
            if (sortBy !== undefined) {
                listingRequest['sortBy'] = sortBy;
                params = this.omit (params, [ 'sort', 'sortBy' ]);
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
                this.markets[m['symbol']] = m;
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
     * @param {string[]} queries free-text search strings
     * @param {int} [limit] max number of topics to fetch
     * @param {object} [rest] extra params forwarded verbatim to the search endpoint
     * @returns {object[]} raw market topic objects with usable nested markets
     */
    async fetchEventsByQuery (queries: string[], limit: Int, rest = {}): Promise<any[]> {
        const seen: Dict = {};
        const collected: any[] = [];
        const queriesLength = queries.length;
        for (let qi = 0; qi < queriesLength; qi++) {
            const request: Dict = {
                'query': queries[qi],
            };
            if (limit !== undefined) {
                request['topK'] = limit;
            }
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
    async fetchEvent (id: string, params = {}): Promise<PredictionEvent> {
        const detail = await this.fetchRawTopicDetail (id, params);
        const event: any = this.parseEvent (detail);
        this.indexEventOutcomes (event);
        return event;
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
        let active = anyActive;
        if (rawMarketsLength === 0) {
            const status = this.safeString (rawTopic, 'status');
            active = (status === 'REGISTERED') || (status === 'OPEN');
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
            'resolved': undefined,
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
            'amount': undefined,
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
            'symbol': marketSymbol,
            'base': collateral,
            'quote': collateral,
            'settle': undefined,
            'baseId': marketId,
            'quoteId': collateral,
            'settleId': undefined,
            'type': 'prediction',
            'marketType': 'binary',
            'executionModel': 'clob',
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
            'maker': feeRate,
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
     * @see https://developers.binance.com/en/docs/catalog/web3-wallet-prediction-trading/api/rest-api/market-data
     * @param {string} outcome unified outcome handle like BTC_PRICE_1H_UP_DOWN_UP:YES, or an outcome token id
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a prediction [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)
     */
    async fetchTicker (outcome: Str, params = {}): Promise<PredictionTicker> {
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
    parsePredictionTicker (raw: Dict, market: Market = undefined): PredictionTicker {
        //
        //     { "marketId": 5567895, "lastTradePrice": "0.52" }
        //
        const marketAny = market as any;
        const outcomeObj = this.safeOutcome (this.safeString (marketAny, 'outcome'), marketAny);
        const label = this.safeStringUpper (outcomeObj, 'label', 'YES');
        const isNo = (label === 'NO');
        const lastString = this.safeString (raw, 'lastTradePrice');
        let last = undefined;
        if (lastString !== undefined) {
            if (isNo) {
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
     * @see https://developers.binance.com/en/docs/catalog/web3-wallet-prediction-trading/api/rest-api/market-data
     * @param {string[]} outcomes unified outcomes — required: the venue has no all-tickers endpoint
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of prediction [ticker structures](https://docs.ccxt.com/#/?id=ticker-structure)
     */
    async fetchTickers (outcomes: Strings = undefined, params = {}): Promise<PredictionTickers> {
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
            const ticker = this.parsePredictionTicker (response, outcomeObj as any);
            const symbolKey = this.safeString (ticker, 'outcome', outcomes[i]);
            result[symbolKey] = ticker;
        }
        return result;
    }

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
    async fetchOrderBook (outcome: Str, limit: Int = undefined, params = {}): Promise<PredictionOrderBook> {
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

    handleErrors (code: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any) {
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
    sign (path: any, api: any = 'sapi', method = 'GET', params = {}, headers: any = undefined, body: any = undefined) {
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
        let querystring = this.urlencode (extendedParams);
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
