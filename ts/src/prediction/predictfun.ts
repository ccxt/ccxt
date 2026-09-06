import Exchange from '../abstract/prediction/predictfun.js';
import { Precise } from '../base/Precise.js';
// import { TRUNCATE, ROUND, DECIMAL_PLACES } from '../base/functions/number.js';
// import { sha256 } from '@noble/hashes/sha2.js';
import { ArgumentsRequired } from '../base/errors.js';
import type { Bool, Dict, Endpoint, fetchEventsParams, Int, Market, PredictionEvent, PredictionOrderBook, PredictionTicker, PredictionTrade, Str } from '../base/types.js';

// ---------------------------------------------------------------------------

/**
 * @class predictfun
 * @augments Exchange
 */
export default class predictfun extends Exchange {
    override describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'predictfun',
            'name': 'predict.fun',
            'countries': [],
            'rateLimit': 250,
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
                'cancelAllOrders': false,
                'cancelOrder': false,
                'cancelOrders': false,
                'createMarketBuyOrderWithCost': false,
                'createOrder': false,
                'createOrders': false,
                'fetchBalance': false,
                'fetchCurrencies': false,
                'fetchDeposits': false,
                'fetchEvent': true,
                'fetchEvents': true,
                'fetchLedger': false,
                'fetchMarkets': true,
                'fetchMyTrades': false,
                'fetchOHLCV': false,
                'fetchOpenInterest': false,
                'fetchOpenOrders': false,
                'fetchOrder': false,
                'fetchOrderBook': true,
                'fetchOrderTrades': false,
                'fetchPosition': false,
                'fetchPositions': false,
                'fetchStatus': false,
                'fetchTicker': true,
                'fetchTickers': false,
                'fetchTime': false,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchWithdrawals': false,
                'prediction': true,         // Prediction market support
                'watchMyTrades': false,
                'watchOrderBook': false,
                'watchOrders': false,
                'watchTicker': false,
                'watchTrades': false,
            },
            'urls': {
                'logo': '',
                'api': {
                    'predictfun': 'https://api.predict.fun',
                },
                'test': {
                    'predictfun': 'https://api-testnet.predict.fun',
                },
                'www': 'https://predict.fun',
                'doc': [
                    'https://docs.predict.fun',
                ],
            },
            // predict.fun gates every endpoint behind the api key - market data included - so there
            // is no public group to split off: a key-less GET /v1/categories, /v1/markets,
            // /v1/search or even /v1/auth/message answers 401 "authorization error"
            'api': {
                'predictfun': {
                    'get': {
                        'v1/auth/message': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/categories': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/categories/{slug}': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/tags': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/markets': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/markets/{id}': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/markets/{id}/stats': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/markets/{id}/last-sale': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/markets/{id}/orderbook': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/markets/{id}/timeseries': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/markets/{id}/timeseries/latest': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/orders/{hash}': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/orders': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/orders/matches': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/account': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/account/activity': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/positions': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/positions/{address}': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/search': { 'cost': 1 } as Endpoint<Dict>,
                    },
                    'post': {
                        'v1/auth': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/orders/remove': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/orders': { 'cost': 1 } as Endpoint<Dict>,
                        'orders/remove-by-hash': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/account/referral': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/oauth/finalize': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/oauth/orders': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/oauth/orders/create': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/oauth/orders/cancel': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/oauth/positions': { 'cost': 1 } as Endpoint<Dict>,
                    },
                },
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': false,
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
                },
                'broad': {
                },
            },
            'options': {
                'allowUnscopedFetchEvents': true,
                'maxFetchEventsResults': 100,   // cap on events collected by an unscoped fetchEvents
            },
        });
    }

    /**
     * @method
     * @name predictfun#fetchMarkets
     * @description Retrieves all outcome markets from outcomeMeta.
     * Each binary outcome becomes one CCXT prediction market with two outcomes: YES and NO.
     * @see https://dev.predict.fun/get-categories-25326910e0
     * @see https://dev.predict.fun/search-categories-and-markets-27399810e0
     * @param {object} [params] extra parameters
     * @param {string} [params.query] a single search term — routes the call through the search endpoint and returns only the matching markets
     * @param {string[]} [params.queries] multiple search terms (alternative to query), the results are merged and deduplicated
     * @param {string[]} [params.tags] predictfun tag ids
     * @param {string} [params.slug] direct lookup by event slug
     * @param {int} [params.limit] the maximum number of events to collect markets from
     * @returns {Market[]} array of market structures
     */
    override async fetchMarkets (params = {}): Promise<Market[]> {
        const events = await this.fetchEvents (params);
        const eventsLength = events.length;
        const markets: Market[] = [];
        for (let ei = 0; ei < eventsLength; ei++) {
            const eventMarkets = this.safeList (events[ei], 'markets', []) as any[];
            const eventMarketsLength = eventMarkets.length;
            for (let mi = 0; mi < eventMarketsLength; mi++) {
                markets.push (eventMarkets[mi]);
            }
        }
        return markets;
    }

    /**
     * @method
     * @name predictfun#fetchEvent
     * @description fetches a single prediction-market event (market topic)
     * @see https://dev.predict.fun/get-category-by-slug-25326911e0
     * @param {string} id event slug
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.slug] event slug, overrides the id argument when both are given
     * @returns {object} a [prediction event structure](https://docs.ccxt.com/#/?id=prediction-event-structure)
     */
    override async fetchEvent (id: string, params = {}): Promise<PredictionEvent> {
        // the id argument is the event slug, per the base fetchEvent (id) contract - params.slug
        // overrides it so a caller can pass the slug the same way fetchEvents () takes it
        const paramSlug = this.safeString (params, 'slug');
        let slug = id;
        if (paramSlug !== undefined) {
            slug = paramSlug;
        }
        if (slug === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchEvent() requires an event slug as the id argument or a slug parameter');
        }
        const events = await this.fetchEvents (this.extend ({ 'slug': slug }, params));
        return this.safeDict (events, 0) as PredictionEvent;
    }

    /**
     * @method
     * @name predictfun#fetchEvents
     * @description fetches prediction-market events (market topics); the call must be scoped by query/queries/tags, eventId, or an l1Category/l2Category listing filter
     * @see https://dev.predict.fun/get-categories-25326910e0
     * @see https://dev.predict.fun/search-categories-and-markets-27399810e0
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.query] a single search term — routes the call through GET /v1/search instead of the categories listing
     * @param {string[]} [params.queries] multiple search terms (alternative to query), searched one by one and merged deduplicated by event slug
     * @param {string[]} [params.tags] predictfun tag ids
     * @param {string} [params.slug] direct lookup by event slug
     * @param {int} [params.limit] the maximum number of events to return, capped at 25 per search term when searching
     * @param {string} [params.sort] 'VOLUME_24H_DESC' | 'VOLUME_ALL_DESC' | 'PUBLISHED_AT_ASC' | 'PUBLISHED_AT_DESC'
     * @param {string} [params.status] 'OPEN' | 'RESOLVED'
     * @param {string} [params.marketVariant] predictfun enum value ('SPORTS_MATCH', 'CRYPTO_UP_DOWN' etc.)
     * @returns {object[]} a list of [prediction event structures](https://docs.ccxt.com/#/?id=prediction-event-structure)
     */
    override async fetchEvents (params: fetchEventsParams = {}): Promise<PredictionEvent[]> {
        const allowUnscopedFetchEvents = this.safeBool (this.options, 'allowUnscopedFetchEvents', false);
        if (!allowUnscopedFetchEvents) {
            this.requireEventQuery (params);
        }
        const queries = this.parseSearchQueries (params);
        const queriesLength = queries.length;
        params = this.omit (params, [ 'query', 'queries' ]);
        const userLimit = this.safeInteger (params, 'limit');
        let fetchCap = this.safeInteger (this.options, 'maxFetchEventsResults', 100);
        if (userLimit !== undefined) {
            fetchCap = userLimit;
        }
        const slug = this.safeString2 (params, 'slug', 'eventId');
        const rest = this.omit (params, [ 'status', 'limit', 'sort', 'eventId', 'slug', 'tags', 'marketVariant' ]);
        if (this.markets === undefined) {
            this.markets = this.createSafeDictionary ();
        }
        let rawTopics: any[] = [];
        if (slug !== undefined) {
            const response = await this.predictfunGetV1CategoriesSlug (this.extend ({ 'slug': slug }, rest));
            const data = this.safeDict (response, 'data');
            rawTopics = [ data ];
        } else if (queriesLength > 0) {
            // a query/queries scope is answered by the dedicated search endpoint — the categories
            // listing has no text filter, so paging it and matching client-side would both miss
            // the venue's semantic matches and cost one request per page
            rawTopics = await this.fetchRawTopicsByQueries (queries, params);
        } else {
            const request: Dict = {};
            const tags = this.safeList (params, 'tags', []);
            const tagsLength = tags.length;
            if (tagsLength > 0) {
                const tagsString = tags.join (',');
                request['tagIds'] = tagsString;
            }
            params = this.omit (params, [ 'limit', 'tags' ]);
            const extendedRequest = this.extend (request, params);
            let rawTopicsResponse = await this.predictfunGetV1Categories (extendedRequest);
            //
            //     {
            //         "cursor": "NDA1MDA0",
            //         "data": [
            //             {
            //                 "createdAt": "2026-08-26T14:00:02.000Z",
            //                 "description": "This market will resolve to \"Up\" if the ETH/USDT price at the end of the time range specified in the title is greater than the price at the beginning of that range.\r\n\r\nIt will resolve to \"Down\" if the ETH/USDT price at the end of the time range is lower than the price at the beginning of that range.\r\n\r\nIf the two prices are exactly equal, the market will resolve 50-50.\r\n\r\nThe primary resolution source for this market is Chainlink, specifically the ETH/USDT data stream available at https://data.chain.link/streams/eth-usdt-topofbook-datalink?timeframe=1d&chart=candlestick.\r\n\r\nTo verify the final price, use the close price of the 5m candlestick just before the market's end time. For example, for a market running from 1:00 to 1:15 PM ET or 1:10 to 1:15 PM ET, use the close price of the 1:10 PM candlestick as the final price.\r\n\r\nThe Chainlink stream uses the mid-price, which is calculated as the average price between the bid and ask prices from Binance's Top of Book, converted into the quote currency.\r\n\r\nThis market is based solely on the price reported by the Chainlink ETH/USDT data stream, not on other sources or spot markets.\r\n\r\nIf Chainlink data is unavailable or otherwise unusable for resolution, the market will resolve based on a consensus of reliable sources.\n2026-08-27T14:00:00Z",
            //                 "endsAt": "2026-08-27T14:15:00.000Z",
            //                 "id": 405022,
            //                 "imageUrl": "https://static.predict.fun/automarket-eth-usd-15-minutes",
            //                 "isNegRisk": false,
            //                 "isVisible": true,
            //                 "isYieldBearing": false,
            //                 "marketVariant": "CRYPTO_UP_DOWN",
            //                 "markets": [
            //                     {
            //                         "boostEndsAt": "2026-08-27T14:15:00.000Z",
            //                         "boostStartsAt": "2026-08-27T14:00:00.000Z",
            //                         "categorySlug": "eth-updown-15m-1787839200",
            //                         "conditionId": "0xa8e9c348c299989329debd86aaef81a1c4880d42c3954a684bdc731f7a113487",
            //                         "createdAt": "2026-08-26T14:00:02.000Z",
            //                         "decimalPrecision": 2,
            //                         "description": "This market will resolve to \"Up\" if the ETH/USDT price at the end of the time range specified in the title is greater than the price at the beginning of that range.\r\n\r\nIt will resolve to \"Down\" if the ETH/USDT price at the end of the time range is lower than the price at the beginning of that range.\r\n\r\nIf the two prices are exactly equal, the market will resolve 50-50.\r\n\r\nThe primary resolution source for this market is Chainlink, specifically the ETH/USDT data stream available at https://data.chain.link/streams/eth-usdt-topofbook-datalink?timeframe=1d&chart=candlestick.\r\n\r\nTo verify the final price, use the close price of the 5m candlestick just before the market's end time. For example, for a market running from 1:00 to 1:15 PM ET or 1:10 to 1:15 PM ET, use the close price of the 1:10 PM candlestick as the final price.\r\n\r\nThe Chainlink stream uses the mid-price, which is calculated as the average price between the bid and ask prices from Binance's Top of Book, converted into the quote currency.\r\n\r\nThis market is based solely on the price reported by the Chainlink ETH/USDT data stream, not on other sources or spot markets.\r\n\r\nIf Chainlink data is unavailable or otherwise unusable for resolution, the market will resolve based on a consensus of reliable sources.",
            //                         "feeRateBps": 200,
            //                         "id": 1739803,
            //                         "imageUrl": "https://static.predict.fun/automarket-eth-usd-15-minutes",
            //                         "isBoosted": false,
            //                         "isNegRisk": false,
            //                         "isVisible": true,
            //                         "isYieldBearing": false,
            //                         "kalshiMarketTicker": null,
            //                         "marketType": null,
            //                         "marketVariant": "CRYPTO_UP_DOWN",
            //                         "oracleQuestionId": "0x6ab55f25f108508e7c6cc9bb22e3304d3fcecd0771d741fdf6d67e6b7ab9af2c",
            //                         "outcomes": [
            //                             {
            //                                 "bestAsk": {
            //                                     "price": 0.98,
            //                                     "size": 100
            //                                 },
            //                                 "bestBid": {
            //                                     "price": 0.02,
            //                                     "size": 100
            //                                 },
            //                                 "indexSet": 1,
            //                                 "name": "Up",
            //                                 "onChainId": "63015212288887519605689521802215931005858239156918107575780791658588345185817",
            //                                 "status": null,
            //                                 "team": null,
            //                                 "variantData": null
            //                             },
            //                             {
            //                                 "bestAsk": {
            //                                     "price": 0.98,
            //                                     "size": 100
            //                                 },
            //                                 "bestBid": {
            //                                     "price": 0.02,
            //                                     "size": 100
            //                                 },
            //                                 "indexSet": 2,
            //                                 "name": "Down",
            //                                 "onChainId": "111913554301217491431600756326792444318464112865057816486042507140136158411642",
            //                                 "status": null,
            //                                 "team": null,
            //                                 "variantData": null
            //                             }
            //                         ],
            //                         "polymarketConditionIds": [],
            //                         "question": "Ethereum Up or Down - August 27, 10AM-10:15AM ET",
            //                         "questionIndex": null,
            //                         "resolution": null,
            //                         "resolverAddress": "0x77620FAb2969dF2D5696F1f081940E416Cf17cA5",
            //                         "rewards": {
            //                             "current": null,
            //                             "schedule": [
            //                                 {
            //                                     "endsAt": "2026-08-27T14:15:00.000Z",
            //                                     "hourlyRate": 3000,
            //                                     "startsAt": "2026-08-27T14:00:00.000Z"
            //                                 }
            //                             ]
            //                         },
            //                         "shareThreshold": 100,
            //                         "spreadThreshold": 0.06,
            //                         "status": "REGISTERED",
            //                         "team": null,
            //                         "title": "Ethereum Up or Down - August 27, 10AM-10:15AM ET",
            //                         "tradingStatus": "OPEN",
            //                         "variantData": {
            //                             "endPrice": null,
            //                             "priceFeedId": "0x0003543336278a459ac24c2f239ffa36f279cadc71f4babc9f8126c6ff10011d",
            //                             "priceFeedProvider": "CHAINLINK",
            //                             "priceFeedSymbol": "ETHUSDT",
            //                             "startPrice": null,
            //                             "type": "CRYPTO_UP_DOWN"
            //                         }
            //                     }
            //                 ],
            //                 "negRiskOnChainId": null,
            //                 "parentSlug": null,
            //                 "publishedAt": "2026-08-26T14:00:20.780Z",
            //                 "resolutionProvider": "CHAINLINK",
            //                 "shortTitle": "ETH Up or Down 15m",
            //                 "slug": "eth-updown-15m-1787839200",
            //                 "startsAt": "2026-08-27T14:00:00.000Z",
            //                 "stats": null,
            //                 "status": "OPEN",
            //                 "tags": [
            //                     {
            //                         "id": "2",
            //                         "level": 1,
            //                         "makerRebateBps": 0,
            //                         "name": "Crypto",
            //                         "parentId": null
            //                     },
            //                     {
            //                         "id": "7",
            //                         "level": null,
            //                         "makerRebateBps": 0,
            //                         "name": "ETH",
            //                         "parentId": null
            //                     },
            //                     {
            //                         "id": "111",
            //                         "level": 2,
            //                         "makerRebateBps": 2500,
            //                         "name": "Up/Down",
            //                         "parentId": "2"
            //                     },
            //                     {
            //                         "id": "146",
            //                         "level": 2,
            //                         "makerRebateBps": 0,
            //                         "name": "15 Min",
            //                         "parentId": "2"
            //                     }
            //                 ],
            //                 "teams": null,
            //                 "title": "Ethereum Up or Down - August 27, 10AM-10:15AM ET",
            //                 "variantData": {
            //                     "endPrice": null,
            //                     "priceFeedId": "0x0003543336278a459ac24c2f239ffa36f279cadc71f4babc9f8126c6ff10011d",
            //                     "priceFeedProvider": "CHAINLINK",
            //                     "priceFeedSymbol": "ETHUSDT",
            //                     "startPrice": null,
            //                     "type": "CRYPTO_UP_DOWN"
            //                 },
            //                 "variantDetails": {
            //                     "crypto": {
            //                         "priceFeedId": "0x0003543336278a459ac24c2f239ffa36f279cadc71f4babc9f8126c6ff10011d",
            //                         "priceFeedProvider": "CHAINLINK",
            //                         "priceFeedSymbol": "ETHUSDT"
            //                     },
            //                     "upDown": {
            //                         "priceFeedId": "0x0003543336278a459ac24c2f239ffa36f279cadc71f4babc9f8126c6ff10011d",
            //                         "priceFeedProvider": "CHAINLINK",
            //                         "priceFeedSymbol": "ETHUSDT"
            //                     }
            //                 }
            //             }
            //         ],
            //         "success": true
            //     }
            //
            let data = this.safeList (rawTopicsResponse, 'data', []);
            rawTopics = this.arrayConcat (rawTopics, data);
            let topicsLength = rawTopics.length;
            while (topicsLength < fetchCap) {
                const nextPageToken = this.safeString (rawTopicsResponse, 'cursor');
                if (nextPageToken === undefined) {
                    break;
                }
                extendedRequest['after'] = nextPageToken;
                rawTopicsResponse = await this.predictfunGetV1Categories (extendedRequest);
                data = this.safeList (rawTopicsResponse, 'data', []);
                rawTopics = this.arrayConcat (rawTopics, data);
                topicsLength = rawTopics.length;
            }
            if (topicsLength > fetchCap) {
                rawTopics = this.arraySlice (rawTopics, 0, fetchCap);
            }
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
        // predictfun topics lack, and the query filter would drop semantic-search matches whose
        // title uses different words than the query
        let postParams = this.omit (params, [ 'tags' ]);
        // status is documented as the venue enum ('OPEN' / 'RESOLVED') but the shared client-side
        // pass speaks the unified vocabulary — translate so it doesn't discard every row it matched
        const rawStatus = this.safeString (params, 'status');
        if (rawStatus === 'OPEN') {
            postParams = this.extend (postParams, { 'status': 'active' });
        } else if (rawStatus === 'RESOLVED') {
            postParams = this.extend (postParams, { 'status': 'closed' });
        }
        return this.applyEventFetchParams (result, postParams, queries);
    }

    /**
     * @ignore
     * @method
     * @name predictfun#fetchRawTopicsByQueries
     * @description searches categories and markets for every query term and returns the raw market topics, deduplicated by slug
     * @see https://dev.predict.fun/search-categories-and-markets-27399810e0
     * @param {string[]} queries the search terms
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.status] anything other than 'active' asks the venue to include resolved rows
     * @returns {object[]} an array of raw market topics, each with a nested markets list
     */
    async fetchRawTopicsByQueries (queries: string[], params = {}): Promise<any[]> {
        // always ask for the venue's maximum page size - this is the per-type page size of the
        // search endpoint (it caps at 25 and defaults to 10), not the caller's event limit, which
        // applyEventFetchParams () applies to the parsed events afterwards
        const limit = 25;
        // resolved rows are excluded unless asked for — the unified status filter drives that
        const status = this.safeString (params, 'status');
        let includeResolved = 'false';
        if ((status !== undefined) && (status !== 'active') && (status !== 'OPEN')) {
            includeResolved = 'true';
        }
        // marketVariant/tags/sort are categories-listing filters the search endpoint does not accept
        const rest = this.omit (params, [ 'query', 'queries', 'limit', 'sort', 'searchIn', 'status', 'eventId', 'slug', 'tags', 'marketVariant' ]);
        const topicsBySlug: Dict = {};
        const topicSlugs: string[] = [];
        const marketsBySlug: Dict = {};
        const marketSlugs: string[] = [];
        const seenMarketIds: Dict = {};
        const queriesLength = queries.length;
        for (let i = 0; i < queriesLength; i++) {
            const request: Dict = {
                'query': queries[i],
                'limit': limit,
                'includeResolved': includeResolved,
            };
            const response = await this.predictfunGetV1Search (this.extend (request, rest));
            //
            //     {
            //         "data": {
            //             "categories": [
            //                 {
            //                     "id": 405022,
            //                     "slug": "eth-updown-15m-1787839200",
            //                     "title": "Ethereum Up or Down - August 27, 10AM-10:15AM ET",
            //                     "description": "This market will resolve to \"Up\" ...",
            //                     "imageUrl": "https://static.predict.fun/automarket-eth-usd-15-minutes",
            //                     "isNegRisk": false,
            //                     "isYieldBearing": false,
            //                     "marketVariant": "CRYPTO_UP_DOWN",
            //                     "variantData": null,
            //                     "createdAt": "2026-08-26T14:00:02.000Z",
            //                     "publishedAt": "2026-08-26T14:00:20.780Z",
            //                     "startsAt": "2026-08-27T14:00:00.000Z",
            //                     "endsAt": "2026-08-27T14:15:00.000Z",
            //                     "status": "OPEN",
            //                     "isVisible": true,
            //                     "tags": [ { "id": "2", "name": "Crypto" } ],
            //                     "markets": [ { "id": 1739803, "categorySlug": "eth-updown-15m-1787839200", ... } ]
            //                 }
            //             ],
            //             "markets": [
            //                 {
            //                     "id": 1739803,
            //                     "imageUrl": "https://static.predict.fun/automarket-eth-usd-15-minutes",
            //                     "title": "Ethereum Up or Down - August 27, 10AM-10:15AM ET",
            //                     "question": "Ethereum Up or Down - August 27, 10AM-10:15AM ET",
            //                     "description": "This market will resolve to \"Up\" ...",
            //                     "tradingStatus": "OPEN",
            //                     "status": "REGISTERED",
            //                     "isVisible": true,
            //                     "isNegRisk": false,
            //                     "isYieldBearing": false,
            //                     "feeRateBps": 200,
            //                     "conditionId": "0xa8e9c348c299989329debd86aaef81a1c4880d42c3954a684bdc731f7a113487",
            //                     "outcomes": [ { "name": "Up", "indexSet": 1, "onChainId": "630152...", "status": null } ],
            //                     "isBoosted": false,
            //                     "categorySlug": "eth-updown-15m-1787839200",
            //                     "marketVariant": "CRYPTO_UP_DOWN"
            //                 }
            //             ]
            //         },
            //         "success": true
            //     }
            //
            const data = this.safeDict (response, 'data', {});
            const categories = this.safeList (data, 'categories', []) as any[];
            const categoriesLength = categories.length;
            for (let ci = 0; ci < categoriesLength; ci++) {
                const category = categories[ci];
                const categorySlug = this.safeString (category, 'slug');
                if ((categorySlug !== undefined) && !(categorySlug in topicsBySlug)) {
                    topicsBySlug[categorySlug] = category;
                    topicSlugs.push (categorySlug);
                }
            }
            const rawMarkets = this.safeList (data, 'markets', []) as any[];
            const rawMarketsLength = rawMarkets.length;
            for (let mi = 0; mi < rawMarketsLength; mi++) {
                const rawMarket = rawMarkets[mi];
                const marketSlug = this.safeString (rawMarket, 'categorySlug');
                const marketId = this.safeString (rawMarket, 'id');
                if ((marketSlug === undefined) || (marketId === undefined) || (marketId in seenMarketIds)) {
                    continue;
                }
                seenMarketIds[marketId] = true;
                if (!(marketSlug in marketsBySlug)) {
                    marketsBySlug[marketSlug] = [];
                    marketSlugs.push (marketSlug);
                }
                // push through a local and write the slice back — the go transpiler's
                // AppendToArray reassigns only a local copy of a map-stored array
                const bucket = marketsBySlug[marketSlug];
                bucket.push (rawMarket);
                marketsBySlug[marketSlug] = bucket;
            }
        }
        const result: any[] = [];
        const topicSlugsLength = topicSlugs.length;
        for (let i = 0; i < topicSlugsLength; i++) {
            result.push (topicsBySlug[topicSlugs[i]]);
        }
        const marketSlugsLength = marketSlugs.length;
        for (let i = 0; i < marketSlugsLength; i++) {
            const marketSlug = marketSlugs[i];
            if (marketSlug in topicsBySlug) {
                continue; // the enclosing category came back in full, nested markets included
            }
            // a market-only hit carries no category row, and the search endpoint's market rows
            // expose neither the enclosing topic's id nor its endsAt - so fetch the category by
            // the slug the market rows do carry, otherwise parseEvent () yields an event with an
            // undefined id, end and created, and markets with an undefined expiry
            const orphanMarkets = marketsBySlug[marketSlug];
            let rawTopic: any = undefined;
            const categoryResponse = await this.predictfunGetV1CategoriesSlug ({ 'slug': marketSlug });
            rawTopic = this.safeDict (categoryResponse, 'data');
            if (rawTopic === undefined) {
                // the lookup failed - fall back to synthesizing the topic from the matched rows,
                // which still carry the title, the description and the createdAt
                const first = this.safeDict (orphanMarkets, 0, {});
                // the market row's 'status' is the registration enum ('REGISTERED' /
                // 'DEREGISTERED'), while parseEvent () reads the topic vocabulary ('OPEN' /
                // 'RESOLVED') - copying it verbatim reports resolved: false for a resolved hit
                const marketStatus = this.safeString (first, 'status');
                const tradingStatus = this.safeString (first, 'tradingStatus');
                let topicStatus: Str = undefined;
                if ((marketStatus === 'RESOLVED') || (marketStatus === 'SETTLED')) {
                    topicStatus = 'RESOLVED';
                } else if (tradingStatus === 'OPEN') {
                    topicStatus = 'OPEN';
                }
                rawTopic = {
                    'slug': marketSlug,
                    'title': this.safeString (first, 'title'),
                    'description': this.safeString (first, 'description'),
                    'imageUrl': this.safeString (first, 'imageUrl'),
                    'marketVariant': this.safeString (first, 'marketVariant'),
                    'isNegRisk': this.safeBool (first, 'isNegRisk'),
                    'isYieldBearing': this.safeBool (first, 'isYieldBearing'),
                    'isVisible': this.safeBool (first, 'isVisible'),
                    'status': topicStatus,
                    'createdAt': this.safeString (first, 'createdAt'),
                    'markets': orphanMarkets,
                };
            }
            result.push (rawTopic);
        }
        return result;
    }

    /**
     * @ignore
     * @method
     * @name predictfun#parseEvent
     * @description parses a raw predictfun market topic (with nested markets) into the unified event shape
     * @param {object} rawTopic the raw market topic object
     * @returns {object} an event structure
     */
    parseEvent (rawTopic: Dict): any {
        //
        //     {
        //         "createdAt": "2026-08-26T14:00:02.000Z",
        //         "description": "This market will resolve to \"Up\" if the ETH/USDT price at the end of the time range specified in the title is greater than the price at the beginning of that range.\r\n\r\nIt will resolve to \"Down\" if the ETH/USDT price at the end of the time range is lower than the price at the beginning of that range.\r\n\r\nIf the two prices are exactly equal, the market will resolve 50-50.\r\n\r\nThe primary resolution source for this market is Chainlink, specifically the ETH/USDT data stream available at https://data.chain.link/streams/eth-usdt-topofbook-datalink?timeframe=1d&chart=candlestick.\r\n\r\nTo verify the final price, use the close price of the 5m candlestick just before the market's end time. For example, for a market running from 1:00 to 1:15 PM ET or 1:10 to 1:15 PM ET, use the close price of the 1:10 PM candlestick as the final price.\r\n\r\nThe Chainlink stream uses the mid-price, which is calculated as the average price between the bid and ask prices from Binance's Top of Book, converted into the quote currency.\r\n\r\nThis market is based solely on the price reported by the Chainlink ETH/USDT data stream, not on other sources or spot markets.\r\n\r\nIf Chainlink data is unavailable or otherwise unusable for resolution, the market will resolve based on a consensus of reliable sources.\n2026-08-27T14:00:00Z",
        //         "endsAt": "2026-08-27T14:15:00.000Z",
        //         "id": 405022,
        //         "imageUrl": "https://static.predict.fun/automarket-eth-usd-15-minutes",
        //         "isNegRisk": false,
        //         "isVisible": true,
        //         "isYieldBearing": false,
        //         "marketVariant": "CRYPTO_UP_DOWN",
        //         "markets": [
        //             {
        //                 "boostEndsAt": "2026-08-27T14:15:00.000Z",
        //                 "boostStartsAt": "2026-08-27T14:00:00.000Z",
        //                 "categorySlug": "eth-updown-15m-1787839200",
        //                 "conditionId": "0xa8e9c348c299989329debd86aaef81a1c4880d42c3954a684bdc731f7a113487",
        //                 "createdAt": "2026-08-26T14:00:02.000Z",
        //                 "decimalPrecision": 2,
        //                 "description": "This market will resolve to \"Up\" if the ETH/USDT price at the end of the time range specified in the title is greater than the price at the beginning of that range.\r\n\r\nIt will resolve to \"Down\" if the ETH/USDT price at the end of the time range is lower than the price at the beginning of that range.\r\n\r\nIf the two prices are exactly equal, the market will resolve 50-50.\r\n\r\nThe primary resolution source for this market is Chainlink, specifically the ETH/USDT data stream available at https://data.chain.link/streams/eth-usdt-topofbook-datalink?timeframe=1d&chart=candlestick.\r\n\r\nTo verify the final price, use the close price of the 5m candlestick just before the market's end time. For example, for a market running from 1:00 to 1:15 PM ET or 1:10 to 1:15 PM ET, use the close price of the 1:10 PM candlestick as the final price.\r\n\r\nThe Chainlink stream uses the mid-price, which is calculated as the average price between the bid and ask prices from Binance's Top of Book, converted into the quote currency.\r\n\r\nThis market is based solely on the price reported by the Chainlink ETH/USDT data stream, not on other sources or spot markets.\r\n\r\nIf Chainlink data is unavailable or otherwise unusable for resolution, the market will resolve based on a consensus of reliable sources.",
        //                 "feeRateBps": 200,
        //                 "id": 1739803,
        //                 "imageUrl": "https://static.predict.fun/automarket-eth-usd-15-minutes",
        //                 "isBoosted": false,
        //                 "isNegRisk": false,
        //                 "isVisible": true,
        //                 "isYieldBearing": false,
        //                 "kalshiMarketTicker": null,
        //                 "marketType": null,
        //                 "marketVariant": "CRYPTO_UP_DOWN",
        //                 "oracleQuestionId": "0x6ab55f25f108508e7c6cc9bb22e3304d3fcecd0771d741fdf6d67e6b7ab9af2c",
        //                 "outcomes": [
        //                     {
        //                         "bestAsk": {
        //                             "price": 0.98,
        //                             "size": 100
        //                         },
        //                         "bestBid": {
        //                             "price": 0.02,
        //                             "size": 100
        //                         },
        //                         "indexSet": 1,
        //                         "name": "Up",
        //                         "onChainId": "63015212288887519605689521802215931005858239156918107575780791658588345185817",
        //                         "status": null,
        //                         "team": null,
        //                         "variantData": null
        //                     },
        //                     {
        //                         "bestAsk": {
        //                             "price": 0.98,
        //                             "size": 100
        //                         },
        //                         "bestBid": {
        //                             "price": 0.02,
        //                             "size": 100
        //                         },
        //                         "indexSet": 2,
        //                         "name": "Down",
        //                         "onChainId": "111913554301217491431600756326792444318464112865057816486042507140136158411642",
        //                         "status": null,
        //                         "team": null,
        //                         "variantData": null
        //                     }
        //                 ],
        //                 "polymarketConditionIds": [],
        //                 "question": "Ethereum Up or Down - August 27, 10AM-10:15AM ET",
        //                 "questionIndex": null,
        //                 "resolution": null,
        //                 "resolverAddress": "0x77620FAb2969dF2D5696F1f081940E416Cf17cA5",
        //                 "rewards": {
        //                     "current": null,
        //                     "schedule": [
        //                         {
        //                             "endsAt": "2026-08-27T14:15:00.000Z",
        //                             "hourlyRate": 3000,
        //                             "startsAt": "2026-08-27T14:00:00.000Z"
        //                         }
        //                     ]
        //                 },
        //                 "shareThreshold": 100,
        //                 "spreadThreshold": 0.06,
        //                 "status": "REGISTERED",
        //                 "team": null,
        //                 "title": "Ethereum Up or Down - August 27, 10AM-10:15AM ET",
        //                 "tradingStatus": "OPEN",
        //                 "variantData": {
        //                     "endPrice": null,
        //                     "priceFeedId": "0x0003543336278a459ac24c2f239ffa36f279cadc71f4babc9f8126c6ff10011d",
        //                     "priceFeedProvider": "CHAINLINK",
        //                     "priceFeedSymbol": "ETHUSDT",
        //                     "startPrice": null,
        //                     "type": "CRYPTO_UP_DOWN"
        //                 }
        //             }
        //         ],
        //         "negRiskOnChainId": null,
        //         "parentSlug": null,
        //         "publishedAt": "2026-08-26T14:00:20.780Z",
        //         "resolutionProvider": "CHAINLINK",
        //         "shortTitle": "ETH Up or Down 15m",
        //         "slug": "eth-updown-15m-1787839200",
        //         "startsAt": "2026-08-27T14:00:00.000Z",
        //         "stats": null,
        //         "status": "OPEN",
        //         "tags": [
        //             {
        //                 "id": "2",
        //                 "level": 1,
        //                 "makerRebateBps": 0,
        //                 "name": "Crypto",
        //                 "parentId": null
        //             },
        //             {
        //                 "id": "7",
        //                 "level": null,
        //                 "makerRebateBps": 0,
        //                 "name": "ETH",
        //                 "parentId": null
        //             },
        //             {
        //                 "id": "111",
        //                 "level": 2,
        //                 "makerRebateBps": 2500,
        //                 "name": "Up/Down",
        //                 "parentId": "2"
        //             },
        //             {
        //                 "id": "146",
        //                 "level": 2,
        //                 "makerRebateBps": 0,
        //                 "name": "15 Min",
        //                 "parentId": "2"
        //             }
        //         ],
        //         "teams": null,
        //         "title": "Ethereum Up or Down - August 27, 10AM-10:15AM ET",
        //         "variantData": {
        //             "endPrice": null,
        //             "priceFeedId": "0x0003543336278a459ac24c2f239ffa36f279cadc71f4babc9f8126c6ff10011d",
        //             "priceFeedProvider": "CHAINLINK",
        //             "priceFeedSymbol": "ETHUSDT",
        //             "startPrice": null,
        //             "type": "CRYPTO_UP_DOWN"
        //         },
        //         "variantDetails": {
        //             "crypto": {
        //                 "priceFeedId": "0x0003543336278a459ac24c2f239ffa36f279cadc71f4babc9f8126c6ff10011d",
        //                 "priceFeedProvider": "CHAINLINK",
        //                 "priceFeedSymbol": "ETHUSDT"
        //             },
        //             "upDown": {
        //                 "priceFeedId": "0x0003543336278a459ac24c2f239ffa36f279cadc71f4babc9f8126c6ff10011d",
        //                 "priceFeedProvider": "CHAINLINK",
        //                 "priceFeedSymbol": "ETHUSDT"
        //             }
        //         }
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
        const topicId = this.safeString (rawTopic, 'id');
        const slug = this.safeString (rawTopic, 'slug');
        const title = this.safeString (rawTopic, 'title');
        const endDate = this.safeString (rawTopic, 'endsAt');
        const created = this.safeString (rawTopic, 'createdAt');
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
            'url': undefined,
            'image': this.safeString (rawTopic, 'imageUrl'),
            'created': this.parse8601 (created),
            'createdDatetime': created,
            'end': this.parse8601 (endDate),
            'endDatetime': endDate,
            'category': this.safeString (rawTopic, 'marketVariant'),
            'resolved': resolved,
            'info': rawTopic,
        };
    }

    /**
     * @ignore
     * @method
     * @name predictfun#parseTopicMarket
     * @description parses one nested market of a market topic into the unified market shape, building its outcome tokens
     * @param {object} rawMarket the nested market object
     * @param {object} rawTopic the enclosing raw market topic (carries slug/vendor/fees/dates)
     * @returns {object} a market structure
     */
    parseTopicMarket (rawMarket: Dict, rawTopic: Dict): Market {
        //
        //     {
        //         "boostEndsAt": "2026-08-27T14:15:00.000Z",
        //         "boostStartsAt": "2026-08-27T14:00:00.000Z",
        //         "categorySlug": "eth-updown-15m-1787839200",
        //         "conditionId": "0xa8e9c348c299989329debd86aaef81a1c4880d42c3954a684bdc731f7a113487",
        //         "createdAt": "2026-08-26T14:00:02.000Z",
        //         "decimalPrecision": 2,
        //         "description": "This market will resolve to \"Up\" if the ETH/USDT price at the end of the time range specified in the title is greater than the price at the beginning of that range.\r\n\r\nIt will resolve to \"Down\" if the ETH/USDT price at the end of the time range is lower than the price at the beginning of that range.\r\n\r\nIf the two prices are exactly equal, the market will resolve 50-50.\r\n\r\nThe primary resolution source for this market is Chainlink, specifically the ETH/USDT data stream available at https://data.chain.link/streams/eth-usdt-topofbook-datalink?timeframe=1d&chart=candlestick.\r\n\r\nTo verify the final price, use the close price of the 5m candlestick just before the market's end time. For example, for a market running from 1:00 to 1:15 PM ET or 1:10 to 1:15 PM ET, use the close price of the 1:10 PM candlestick as the final price.\r\n\r\nThe Chainlink stream uses the mid-price, which is calculated as the average price between the bid and ask prices from Binance's Top of Book, converted into the quote currency.\r\n\r\nThis market is based solely on the price reported by the Chainlink ETH/USDT data stream, not on other sources or spot markets.\r\n\r\nIf Chainlink data is unavailable or otherwise unusable for resolution, the market will resolve based on a consensus of reliable sources.",
        //         "feeRateBps": 200,
        //         "id": 1739803,
        //         "imageUrl": "https://static.predict.fun/automarket-eth-usd-15-minutes",
        //         "isBoosted": false,
        //         "isNegRisk": false,
        //         "isVisible": true,
        //         "isYieldBearing": false,
        //         "kalshiMarketTicker": null,
        //         "marketType": null,
        //         "marketVariant": "CRYPTO_UP_DOWN",
        //         "oracleQuestionId": "0x6ab55f25f108508e7c6cc9bb22e3304d3fcecd0771d741fdf6d67e6b7ab9af2c",
        //         "outcomes": [
        //             {
        //                 "bestAsk": {
        //                     "price": 0.98,
        //                     "size": 100
        //                 },
        //                 "bestBid": {
        //                     "price": 0.02,
        //                     "size": 100
        //                 },
        //                 "indexSet": 1,
        //                 "name": "Up",
        //                 "onChainId": "63015212288887519605689521802215931005858239156918107575780791658588345185817",
        //                 "status": null,
        //                 "team": null,
        //                 "variantData": null
        //             },
        //             {
        //                 "bestAsk": {
        //                     "price": 0.98,
        //                     "size": 100
        //                 },
        //                 "bestBid": {
        //                     "price": 0.02,
        //                     "size": 100
        //                 },
        //                 "indexSet": 2,
        //                 "name": "Down",
        //                 "onChainId": "111913554301217491431600756326792444318464112865057816486042507140136158411642",
        //                 "status": null,
        //                 "team": null,
        //                 "variantData": null
        //             }
        //         ],
        //         "polymarketConditionIds": [],
        //         "question": "Ethereum Up or Down - August 27, 10AM-10:15AM ET",
        //         "questionIndex": null,
        //         "resolution": null,
        //         "resolverAddress": "0x77620FAb2969dF2D5696F1f081940E416Cf17cA5",
        //         "rewards": {
        //             "current": null,
        //             "schedule": [
        //                 {
        //                     "endsAt": "2026-08-27T14:15:00.000Z",
        //                     "hourlyRate": 3000,
        //                     "startsAt": "2026-08-27T14:00:00.000Z"
        //                 }
        //             ]
        //         },
        //         "shareThreshold": 100,
        //         "spreadThreshold": 0.06,
        //         "status": "REGISTERED",
        //         "team": null,
        //         "title": "Ethereum Up or Down - August 27, 10AM-10:15AM ET",
        //         "tradingStatus": "OPEN",
        //         "variantData": {
        //             "endPrice": null,
        //             "priceFeedId": "0x0003543336278a459ac24c2f239ffa36f279cadc71f4babc9f8126c6ff10011d",
        //             "priceFeedProvider": "CHAINLINK",
        //             "priceFeedSymbol": "ETHUSDT",
        //             "startPrice": null,
        //             "type": "CRYPTO_UP_DOWN"
        //         }
        //     }
        //
        const marketId = this.safeString (rawMarket, 'id');
        const topicSlug = this.safeString (rawMarket, 'categorySlug');
        let title = this.safeString (rawMarket, 'title', marketId);
        // slug and title have a mismatch in the numbers
        // one should clean title from commas in numbers to avoid a mismatch with the slug, which has no commas in numbers
        if (title !== undefined) {
            title = title.replaceAll (',0', '0');
        }
        const marketSymbol = this.slugToMarketSymbol (topicSlug, title);
        const tradingStatus = this.safeString (rawMarket, 'tradingStatus');
        const status = this.safeString (rawMarket, 'status');
        let active = (tradingStatus === 'OPEN');
        if (tradingStatus === undefined) {
            active = (status === 'REGISTERED') || (status === 'OPEN');
        }
        const resolved = (status === 'RESOLVED') || (status === 'SETTLED');
        const endDate = this.safeString (rawTopic, 'endsAt');
        const feeRateBps = this.safeString (rawMarket, 'feeRateBps', '200'); // todo check
        const feeRate = this.parseNumber (Precise.stringDiv (feeRateBps, '10000'));
        const decimalPrecision = this.safeString (rawMarket, 'decimalPrecision', '2');
        const pricePrecision = this.parseNumber (this.parsePrecision (decimalPrecision));
        const precision = {
            'amount': 0.01, // todo check
            'price': pricePrecision,
        };
        const rawOutcomes = this.safeList (rawMarket, 'outcomes', []) as any[];
        const outcomes: any[] = [];
        let resolvedOutcomeRaw = undefined;
        const rawOutcomesLength = rawOutcomes.length;
        for (let oi = 0; oi < rawOutcomesLength; oi++) {
            const rawOutcome = rawOutcomes[oi];
            const label = this.safeStringUpper (rawOutcome, 'name');
            const tokenId = this.safeString (rawOutcome, 'onChainId');
            const outcomeHandle = marketSymbol + ':' + label;
            let winner: Bool = undefined;
            const outcomeStatus = this.safeString (rawOutcome, 'status');
            let settleFractionRaw = undefined;
            if (outcomeStatus !== undefined) {
                winner = (outcomeStatus === 'WON');
                if (winner) {
                    settleFractionRaw = 1;
                    resolvedOutcomeRaw = outcomeHandle;
                } else {
                    settleFractionRaw = 0; // todo check
                }
            }
            const settleFraction = settleFractionRaw;
            outcomes.push ({
                'id': tokenId,
                'outcomeId': tokenId,
                'outcome': outcomeHandle,
                'market': marketSymbol,
                'label': label,
                'price': undefined, // todo check
                'active': active,
                'winner': winner,
                'settleFraction': settleFraction,
                'precision': precision,
                'info': this.extend ({
                    'marketId': marketId,
                }, rawOutcome),
            });
        }
        const resolvedOutcome = resolvedOutcomeRaw;
        const collateral = 'USDT'; // todo check
        const marketType = (rawOutcomesLength > 2) ? 'categorical' : 'binary';
        const createdDatetime = this.safeString (rawMarket, 'createdAt');
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
            'marketType': marketType,
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
            'expiry': this.parse8601 (endDate),
            'expiryDatetime': endDate,
            'strike': undefined,
            'optionType': undefined,
            'taker': feeRate,
            'maker': 0, // todo check
            'percentage': true,
            'tierBased': false,
            'feeSide': 'get',
            'precision': precision,
            'limits': {
                'leverage': { 'min': 1, 'max': 1 },
                'amount': { 'min': undefined, 'max': undefined },
                'price': { 'min': 0.01, 'max': 0.99 },
                'cost': { 'min': 1, 'max': undefined },  // MARKET quotes require amountIn of at least 1 USDT
            },
            'outcomes': outcomes,
            'info': rawMarket,
            'created': this.parse8601 (createdDatetime),
        } as unknown as Market;
    }

    /**
     * @method
     * @name predictfun#fetchOrderBook
     * @description fetches the order book for a single prediction outcome token
     * @see https://dev.predict.fun/get-the-orderbook-for-a-market-25326908e0
     * @param {string} outcome unified outcome handle, or an outcome token id
     * @param {int} [limit] not used by predictfun fetchOrderBook
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a prediction [order book structure](https://docs.ccxt.com/#/?id=order-book-structure)
     */
    override async fetchOrderBook (outcome: Str, limit: Int = undefined, params = {}): Promise<PredictionOrderBook> {
        await this.loadOutcome (outcome);
        const outcomeObj = this.outcome (outcome);
        const info = this.safeDict (outcomeObj, 'info', {});
        const request: Dict = {
            'id': this.safeString (info, 'marketId'),
        };
        const response = await this.predictfunGetV1MarketsIdOrderbook (this.extend (request, params));
        //
        //     {
        //         "data":
        //             {
        //             "asks": [
        //                 [ 0.99, 101 ]
        //             ],
        //             "bids": [
        //                 [ 0.01, 101 ]
        //             ],
        //             "lastOrderSettled": null,
        //             "marketId": 1743016,
        //             "updateTimestampMs": 1787770521244
        //         },
        //         "success":true
        //     }
        //
        const data = this.safeDict (response, 'data', {});
        const timestamp = this.safeInteger (data, 'updateTimestampMs');
        // The outcome lables are not the same as the outcome indexSet values, so we need to check the indexSet to determine which outcome is being requested
        const indexSet = this.safeInteger (info, 'indexSet');
        const isYesOutcome = (indexSet === 1);
        const outcomeSymbol = this.safeOutcomeSymbol (outcome, outcomeObj);
        // the book endpoint is quoted in the yes token, the no side mirrors at 1 - price with bids and asks swapped
        if (isYesOutcome) {
            const yesOrderbook = this.parseOrderBook (data, outcomeSymbol, timestamp, 'bids', 'asks', 0, 1);
            return this.safePredictionOrderBook (yesOrderbook, outcomeObj);
        } else {
            const bids = this.safeList (data, 'bids', []);
            const asks = this.safeList (data, 'asks', []);
            const noBids = [];
            const noAsks = [];
            for (let i = 0; i < bids.length; i++) {
                const bid = bids[i];
                const bidPrice = this.safeString (bid, 0);
                const bidSize = this.parseNumber (this.safeString (bid, 1));
                const complementPrice = this.parseNumber (Precise.stringSub ('1', bidPrice));
                noAsks.push ([ complementPrice, bidSize ]);
            }
            for (let i = 0; i < asks.length; i++) {
                const ask = asks[i];
                const askPrice = this.safeString (ask, 0);
                const askSize = this.parseNumber (this.safeString (ask, 1));
                const complementPrice = this.parseNumber (Precise.stringSub ('1', askPrice));
                noBids.push ([ complementPrice, askSize ]);
            }
            const noOrderbook = {
                'bids': this.sortBy (noBids, 0, true),
                'asks': this.sortBy (noAsks, 0),
                'timestamp': timestamp,
                'datetime': this.iso8601 (timestamp),
                'nonce': undefined,
            };
            return this.safePredictionOrderBook (noOrderbook, outcomeObj);
        }
    }

    /**
     * @method
     * @name predictfun#fetchTicker
     * @description fetches the best bid and ask for a single prediction outcome token
     * @see https://dev.predict.fun/get-market-by-id-25552989e0
     * @param {string} outcome unified outcome handle, or an outcome token id
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [prediction ticker structure](https://docs.ccxt.com/#/?id=prediction-ticker-structure)
     */
    override async fetchTicker (outcome: Str, params = {}): Promise<PredictionTicker> {
        await this.loadOutcome (outcome);
        const outcomeObj = this.outcome (outcome);
        const info = this.safeDict (outcomeObj, 'info', {});
        const request: Dict = {
            'id': this.safeString (info, 'marketId'),
        };
        // the market detail carries a bestBid/bestAsk per outcome, already sided for the NO
        // outcome - last price and volume live behind /last-sale and /stats, one request each,
        // so they are left undefined rather than spending extra calls on them
        const response = await this.predictfunGetV1MarketsId (this.extend (request, params));
        //
        //     {
        //         "data": {
        //             "id": 2107,
        //             "title": "Will Trump acquire Greenland before 2027?",
        //             "tradingStatus": "OPEN",
        //             "status": "REGISTERED",
        //             "decimalPrecision": 2,
        //             "feeRateBps": 200,
        //             "outcomes": [
        //                 {
        //                     "name": "Yes",
        //                     "indexSet": 1,
        //                     "onChainId": "43765171147442247918432418752066697760469767620931280624762484655579631167373",
        //                     "bestBid": { "price": 0.02, "size": 1448.4122448979592 },
        //                     "bestAsk": { "price": 0.032, "size": 675.29 },
        //                     "status": null
        //                 },
        //                 {
        //                     "name": "No",
        //                     "indexSet": 2,
        //                     "bestBid": { "price": 0.968, "size": 675.29 },
        //                     "bestAsk": { "price": 0.98, "size": 1448.4122448979592 },
        //                     "status": null
        //                 }
        //             ]
        //         },
        //         "success": true
        //     }
        //
        const data = this.safeDict (response, 'data', {});
        return this.parsePredictionTicker (data, outcomeObj);
    }

    /**
     * @ignore
     * @method
     * @name predictfun#parsePredictionTicker
     * @description parses a raw market detail into a unified prediction ticker for one of its outcomes
     * @param {object} ticker the raw market object, with a nested outcomes list
     * @param {object} [market] the outcome the ticker belongs to
     * @returns {object} a [prediction ticker structure](https://docs.ccxt.com/#/?id=prediction-ticker-structure)
     */
    override parsePredictionTicker (ticker: Dict, market: Market = undefined): PredictionTicker {
        const info = this.safeDict (market, 'info', {});
        const indexSet = this.safeInteger (info, 'indexSet');
        const rawOutcomes = this.safeList (ticker, 'outcomes', []);
        const rawOutcomesLength = rawOutcomes.length;
        let rawOutcome: Dict = {};
        for (let i = 0; i < rawOutcomesLength; i++) {
            const candidate = rawOutcomes[i];
            if (this.safeInteger (candidate, 'indexSet') === indexSet) {
                rawOutcome = candidate;
                break;
            }
        }
        // the venue quotes each outcome on its own side of the book, so no complement is needed
        const bestBid = this.safeDict (rawOutcome, 'bestBid', {});
        const bestAsk = this.safeDict (rawOutcome, 'bestAsk', {});
        const timestamp = this.milliseconds ();
        return this.safePredictionTicker ({
            'outcome': this.safeOutcomeSymbol (undefined, market),
            'outcomeId': this.safeString (market, 'outcomeId'),
            'label': this.safeString (market, 'label'),
            'market': this.safeString (market, 'market'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': undefined,
            'low': undefined,
            'bid': this.safeNumber (bestBid, 'price'),
            'bidVolume': this.safeNumber (bestBid, 'size'),
            'ask': this.safeNumber (bestAsk, 'price'),
            'askVolume': this.safeNumber (bestAsk, 'size'),
            'open': undefined,
            'close': undefined,
            'last': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': undefined,
            'info': ticker,
        });
    }

    /**
     * @method
     * @name predictfun#fetchTrades
     * @description fetches the most recent settled matches for a single prediction outcome token
     * @see https://dev.predict.fun/get-order-match-events-25663812e0
     * @param {string} outcome unified outcome handle, or an outcome token id
     * @param {int} [since] timestamp in ms of the earliest trade to return, applied client side
     * @param {int} [limit] the maximum number of trades to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.after] cursor from a previous response, the venue pages back from the most recent match
     * @param {string} [params.minValueUsdtWei] only return matches worth at least this many wei
     * @returns {object[]} a list of [prediction trade structures](https://docs.ccxt.com/#/?id=prediction-trade-structure)
     */
    override async fetchTrades (outcome: Str, since: Int = undefined, limit: Int = undefined, params = {}): Promise<PredictionTrade[]> {
        await this.loadOutcome (outcome);
        const outcomeObj = this.outcome (outcome);
        const info = this.safeDict (outcomeObj, 'info', {});
        const request: Dict = {
            'marketId': this.safeString (info, 'marketId'),
        };
        // the endpoint carries no time filter, it pages back from the most recent match, so
        // since is applied client side by parsePredictionTrades
        const response = await this.predictfunGetV1OrdersMatches (this.extend (request, params));
        //
        //     {
        //         "cursor": "eyJjcmVhdGVkQXQiOiIyMDI2LTA5LTA1VDIzOjU1OjU2WiJ9",
        //         "data": [
        //             {
        //                 "amountFilled": "8409090909090909720",
        //                 "executedAt": "2026-09-06T11:45:23.000Z",
        //                 "priceExecuted": "111200000000000000",
        //                 "settlementId": "01a07689-955a-7070-86af-a100b7b7350c",
        //                 "transactionHash": "0x435863c29443ff45b2f8966c52428d3bb3a29a38de24dc6c17ca0817951fda79",
        //                 "taker": {
        //                     "amount": "8409090909090909720",
        //                     "fee": { "amount": "151363636363636374", "type": "SHARES" },
        //                     "hash": "0x0a0eab35c68fda64ced0989aec9313f5884e5ecba51d780f9b7da634cc979027",
        //                     "outcome": { "indexSet": 1, "name": "Up", "onChainId": "44616422429987613582483910707767544579739686077414897363305263997555112684875" },
        //                     "price": "112000000000000000",
        //                     "quoteType": "Bid",
        //                     "signer": "0x6Da6Cb464F92AE7aD4Ec3d239c81719Cb1D0Ae03"
        //                 },
        //                 "makers": [
        //                     {
        //                         "amount": "1009090909090909720",
        //                         "fee": { "amount": "0", "type": "SHARES" },
        //                         "hash": "0x0950ef588b53e2489f95cb1d830a6e0cb0bffc0f4baf4286e3b2e03bad2eba47",
        //                         "outcome": { "indexSet": 2, "name": "Down", "onChainId": "39857821499700810175970492505692306870421072168717601114846981613437602260320" },
        //                         "price": "880000000000000000",
        //                         "quoteType": "Bid",
        //                         "signer": "0x6Da6Cb464F92AE7aD4Ec3d239c81719Cb1D0Ae03"
        //                     }
        //                 ],
        //                 "market": { "id": 1965449 }
        //             }
        //         ],
        //         "success": true
        //     }
        //
        const data = this.safeList (response, 'data', []);
        const trades: any[] = [];
        const dataLength = data.length;
        for (let i = 0; i < dataLength; i++) {
            const entry = data[i];
            const taker = this.safeDict (entry, 'taker', {});
            const takerOutcome = this.safeDict (taker, 'outcome', {});
            const takerIndexSet = this.safeInteger (takerOutcome, 'indexSet');
            const outcomeIndexSet = this.safeInteger (info, 'indexSet');
            let partyToParse = this.safeDict (entry, 'taker', {});
            if (takerIndexSet === outcomeIndexSet) {
                const trade = this.parsePredictionTrade (this.extend (entry, { 'partyToParse': partyToParse }), outcomeObj);
                trade['takerOrMaker'] = 'taker';
                trade['type'] = 'market';
                trade['info'] = entry;
                trades.push (trade);
            } else {
                const makers = this.safeList (entry, 'makers', []);
                const makersLength = makers.length;
                for (let j = 0; j < makersLength; j++) {
                    const maker = makers[j];
                    const makerOutcome = this.safeDict (maker, 'outcome', {});
                    const makerIndexSet = this.safeInteger (makerOutcome, 'indexSet');
                    if (makerIndexSet === outcomeIndexSet) {
                        partyToParse = maker;
                        const trade = this.parsePredictionTrade (this.extend (entry, { 'partyToParse': partyToParse }), outcomeObj);
                        trade['takerOrMaker'] = 'maker';
                        trade['type'] = 'limit';
                        trade['info'] = entry;
                        trades.push (trade);
                    }
                }
            }
        }
        return trades;
    }

    /**
     * @ignore
     * @method
     * @name predictfun#parsePredictionTrade
     * @description parses a raw order match event into a unified prediction trade for one of the two outcomes
     * @param {object} trade the raw match event
     * @param {object} [market] the outcome the trade belongs to
     * @returns {object} a [prediction trade structure](https://docs.ccxt.com/#/?id=prediction-trade-structure)
     */
    override parsePredictionTrade (trade: Dict, market: Market = undefined): PredictionTrade {
        const party = this.safeDict (trade, 'partyToParse', {});
        let priceStr = this.safeString (party, 'price');
        priceStr = Precise.stringDiv (priceStr, '1000000000000000000');
        let amountStr = this.safeString (party, 'amount');
        amountStr = Precise.stringDiv (amountStr, '1000000000000000000');
        let side: Str = undefined;
        let order: Str = undefined;
        let fee: any = undefined;
        const quoteType = this.safeStringLower (party, 'quoteType');
        if (quoteType === 'bid') {
            side = 'buy';
        } else if (quoteType === 'ask') {
            side = 'sell';
        }
        order = this.safeString (party, 'hash');
        const rawFee = this.safeDict (party, 'fee');
        if (rawFee !== undefined) {
            const feeType = this.safeString (rawFee, 'type');
            const feeCost = this.safeString (rawFee, 'amount');
            fee = {
                // a SHARES fee is charged in outcome tokens rather than in collateral
                'currency': (feeType === 'COLLATERAL') ? 'USDT' : undefined,
                'cost': this.parseNumber (Precise.stringDiv (feeCost, '1000000000000000000')),
            };
        }
        const timestamp = this.parse8601 (this.safeString (trade, 'executedAt'));
        return this.safePredictionTrade ({
            'id': this.safeString (trade, 'settlementId'),
            'order': order,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'outcome': this.safeOutcomeSymbol (undefined, market),
            'outcomeId': this.safeString (market, 'outcomeId'),
            'label': this.safeString (market, 'label'),
            'market': this.safeString (market, 'market'),
            'type': undefined,
            'side': side,
            'takerOrMaker': undefined,
            'price': this.parseNumber (priceStr),
            'amount': this.parseNumber (amountStr),
            'cost': undefined,
            'fee': fee,
            'info': trade,
        });
    }

    /**
     * @ignore
     * @method
     * @name predictfun#sign
     * @description builds the request URL and attaches the api key header required by every endpoint
     * @param {string} path the endpoint path
     * @param {string|string[]} [api] the api group and access level
     * @param {string} [method] HTTP method
     * @param {object} [params] request parameters
     * @param {object} [headers] request headers
     * @param {object} [body] request body
     * @returns {object} a dictionary with url, method, body and headers
     */
    override sign (path: any, api: any = 'predictfun', method = 'GET', params = {}, headers: any = undefined, body: any = undefined) {
        // the venue authenticates every endpoint, so the key is required up front rather than
        // per access level - a key-less request is answered with a 401 by the api gateway
        this.checkRequiredCredentials ();
        const apiGroup: string = typeof api === 'string' ? api : api[0];
        const baseUrls = this.urls['api'] as Dict;
        const baseUrl = this.safeString (baseUrls, apiGroup, baseUrls['predictfun'] as string);
        let url = baseUrl + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (method === 'GET') {
            if (Object.keys (query).length > 0) {
                url += '?' + this.urlencode (query);
            }
        }
        const existingHeaders = (headers !== undefined) ? headers : {};
        headers = this.extend ({
            'x-api-key': this.apiKey,
        }, existingHeaders);
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}
