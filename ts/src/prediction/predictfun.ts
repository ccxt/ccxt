import Exchange from '../abstract/prediction/predictfun.js';
import { Precise } from '../base/Precise.js';
// import { TRUNCATE, ROUND, DECIMAL_PLACES } from '../base/functions/number.js';
// import { sha256 } from '@noble/hashes/sha2.js';
import { ArgumentsRequired } from '../base/errors.js';
import type { Bool, Dict, Endpoint, fetchEventsParams, Int, Market, PredictionEvent, PredictionOrderBook, Str } from '../base/types.js';

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
                'fetchTicker': false,
                'fetchTickers': false,
                'fetchTime': false,
                'fetchTrades': false,
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
                'warnOnFetchEventSlug': true,   // warn if fetchEvent is called without slug parameter
            },
        });
    }

    /**
     * @method
     * @name predictfun#fetchMarkets
     * @description Retrieves all outcome markets from outcomeMeta.
     * Each binary outcome becomes one CCXT prediction market with two outcomes: YES and NO.
     * @see https://dev.predict.fun/get-categories-25326910e0
     * @param {object} [params] extra parameters
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
     * @returns {object} a [prediction event structure](https://docs.ccxt.com/#/?id=prediction-event-structure)
     */
    override async fetchEvent (id: string, params = {}): Promise<PredictionEvent> {
        const warnOnFetchEventSlug = this.safeBool (this.options, 'warnOnFetchEventSlug', true);
        const paramSlug = this.safeString (params, 'slug');
        let slug = id;
        if (paramSlug !== undefined) {
            slug = paramSlug;
        } else if (warnOnFetchEventSlug) {
            throw new ArgumentsRequired (this.id + ' fetchEvent() requires a slug parameter (or set warnOnFetchEventSlug option to false to pass the slug as the id argument)');
        }
        const events = await this.fetchEvents (this.extend ({ 'slug': slug }, params));
        return this.safeDict (events, 0) as PredictionEvent;
    }

    /**
     * @method
     * @name predictfun#fetchEvents
     * @description fetches prediction-market events (market topics); the call must be scoped by query/queries/tags, eventId, or an l1Category/l2Category listing filter
     * @see https://dev.predict.fun/get-categories-25326910e0
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string[]} [params.tags] predictfun tag ids
     * @param {string} [params.slug] direct lookup by event slug
     * @param {int} [params.limit] the maximum number of events to return
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
        params = this.omit (params, [ 'query', 'queries' ]);
        const userLimit = this.safeInteger (params, 'limit');
        let fetchCap = this.safeInteger (this.options, 'maxFetchEventsResults', 100);
        if (userLimit !== undefined) {
            fetchCap = userLimit;
        }
        const slug = this.safeString2 (params, 'slug', 'eventId');
        const rest = this.omit (params, [ 'status', 'limit', 'sort', 'eventId', 'slug', 'tags', 'marketVariant' ]);
        if (!this.markets) {
            this.markets = this.createSafeDictionary ();
        }
        let rawTopics: any[] = [];
        if (slug !== undefined) {
            const response = await this.predictfunGetV1CategoriesSlug (this.extend ({ 'slug': slug }, rest));
            const data = this.safeDict (response, 'data');
            rawTopics = [ data ];
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
        const postParams = this.omit (params, [ 'tags' ]);
        return this.applyEventFetchParams (result, postParams, queries);
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
        const title = this.safeString (rawMarket, 'title', marketId);
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
     * @param {int} [limit] not used by binance fetchOrderBook
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
     * @ignore
     * @method
     * @name predictfun#sign
     * @description builds the request URL and attaches RSA-PSS SHA-256 authentication headers for private endpoints
     * @param {string} path the endpoint path
     * @param {string|string[]} [api] the api group and access level
     * @param {string} [method] HTTP method
     * @param {object} [params] request parameters
     * @param {object} [headers] request headers
     * @param {object} [body] request body
     * @returns {object} a dictionary with url, method, body and headers
     */
    override sign (path: any, api: any = 'predictfun', method = 'GET', params = {}, headers: any = undefined, body: any = undefined) {
        this.checkRequiredCredentials ();
        const apiGroup: string = typeof api === 'string' ? api : api[0];
        const baseUrls = this.urls['api'] as Dict;
        const baseUrl = this.safeString (baseUrls, apiGroup, baseUrls['predictfun'] as string);
        let url = baseUrl + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        const querystring = this.urlencode (query);
        if (method === 'GET' && querystring) {
            url += '?' + querystring;
        }
        const existingHeaders = (headers !== undefined) ? headers : {};
        headers = this.extend ({
            'x-api-key': this.apiKey,
        }, existingHeaders);
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}
