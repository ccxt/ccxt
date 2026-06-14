import Exchange from '../abstract/prediction/polymarket.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { Precise } from '../base/Precise.js';
import { ArrayCache } from '../base/ws/Cache.js';
import type {
    Int, Str, Num, Dict,
    Market, Ticker, Tickers, OrderBook, Trade, OHLCV,
    Order, Balances, Position,
    Strings,
    PredictionEvent,
} from '../base/types.js';
import { ArgumentsRequired, BadRequest } from '../../ccxt.js';

// ---------------------------------------------------------------------------

/**
 * @class polymarket
 * @augments Exchange
 */
export default class polymarket extends Exchange {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'polymarket',
            'name': 'Polymarket',
            'countries': [ 'US' ],
            'rateLimit': 100,
            'certified': false,
            'pro': true,
            'has': {
                'CORS': undefined,
                'spot': false,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'createOrder': true,
                'fetchBalance': true,
                'fetchCurrencies': false,
                'fetchDeposits': false,
                'fetchEvents': true,        // Custom: fetch Polymarket events
                'fetchLedger': false,
                'fetchMarkets': true,       // Each outcome token = one market
                'fetchMyTrades': false,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchPositions': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchWithdrawals': false,
                'prediction': true,         // Prediction market support
                'watchOrderBook': true,
                'watchTicker': true,
                'watchTrades': true,
            },
            'timeframes': {
                '1m': '1',
                '5m': '5',
                '1h': '60',
                '6h': '360',
                '1d': '1440',
            },
            'urls': {
                'logo': 'https://polymarket.com/favicon.ico',
                'api': {
                    'gamma': 'https://gamma-api.polymarket.com',
                    'clob': 'https://clob.polymarket.com',
                    'data': 'https://data-api.polymarket.com',
                    'ws': 'wss://ws-subscriptions-clob.polymarket.com/ws/market',
                },
                'www': 'https://polymarket.com',
                'doc': [ 'https://docs.polymarket.com' ],
                'fees': 'https://docs.polymarket.com/#fees',
            },
            'api': {
                'gamma': {
                    'public': {
                        'get': {
                            'status': 1,
                            'comments': 1,
                            'comments/{id}': 1,
                            'comments/user_address/{user_address}': 1,
                            'events': 1,
                            'events/creators': 1,
                            'events/creators/{id}': 1,
                            'events/keyset': 1,
                            'events/pagination': 1,
                            'events/results': 1,
                            'events/slug/{slug}': 1,
                            'events/{id}': 1,
                            'events/{id}/comments/count': 1,
                            'events/{id}/tags': 1,
                            'events/{id}/tweet-count': 1,
                            'markets': 1,
                            'markets/keyset': 1,
                            'markets/slug/{slug}': 1,
                            'markets/{id}': 1,
                            'markets/{id}/description': 1,
                            'markets/{id}/tags': 1,
                            'profiles/user_address/{user_address}': 1,
                            'public-profile': 1,
                            'public-search': 1,
                            'series': 1,
                            'series-summary/slug/{slug}': 1,
                            'series-summary/{id}': 1,
                            'series/{id}': 1,
                            'series/{id}/comments/count': 1,
                            'sports': 1,
                            'sports/market-types': 1,
                            'tags': 1,
                            'tags/slug/{slug}': 1,
                            'tags/slug/{slug}/related-tags': 1,
                            'tags/slug/{slug}/related-tags/tags': 1,
                            'tags/{id}': 1,
                            'tags/{id}/related-tags': 1,
                            'tags/{id}/related-tags/tags': 1,
                            'teams': 1,
                            'teams/{id}': 1,
                        },
                        'post': {
                            'markets/abridged': 1,
                            'markets/information': 1,
                        },
                    },
                },
                'clob': {
                    'public': {
                        'get': {
                            'book': 1,
                            'books': 1,
                            'builder/trades': 1,
                            'clob-markets/{condition_id}': 1,
                            'fee-rate': 1,
                            'fee-rate/{token_id}': 1,
                            'last-trade-price': 1,
                            'last-trades-prices': 1,
                            'markets-by-token/{token_id}': 1,
                            'markets/live-activity/{condition_id}': 1,
                            'midpoint': 1,
                            'midpoints': 1,
                            'neg-risk': 1,
                            'neg-risk/{token_id}': 1,
                            'price': 1,
                            'prices': 1,
                            'prices-history': 1,
                            'rebates/current': 1,
                            'rewards/markets/current': 1,
                            'rewards/markets/multi': 1,
                            'rewards/markets/{condition_id}': 1,
                            'sampling-markets': 1,
                            'sampling-simplified-markets': 1,
                            'simplified-markets': 1,
                            'spread': 1,
                            'tick-size': 1,
                            'tick-size/{token_id}': 1,
                            'time': 1,
                        },
                        'post': {
                            'batch-prices-history': 1,
                            'books': 1,
                            'last-trades-prices': 1,
                            'markets/live-activity': 1,
                            'midpoints': 1,
                            'prices': 1,
                            'spreads': 1,
                        },
                    },
                    'private': {
                        'get': {
                            'auth/api-keys': 1,
                            'auth/ban-status/closed-only': 1,
                            'auth/builder-api-key': 1,
                            'auth/derive-api-key': 1,
                            'balance-allowance': 1,
                            'balance-allowance/update': 1,
                            'data/order/{id}': 1,
                            'data/orders': 1,
                            'data/trades': 1,
                            'notifications': 1,
                            'order-scoring': 1,
                            'orders-scoring': 1,
                            'rewards/user': 1,
                            'rewards/user/markets': 1,
                            'rewards/user/percentages': 1,
                            'rewards/user/total': 1,
                        },
                        'post': {
                            'auth/api-key': 1,
                            'auth/builder-api-key': 1,
                            'heartbeats': 1,
                            'order': 1,
                            'orders': 1,
                            'v1/heartbeats': 1,
                        },
                        'delete': {
                            'auth/api-key': 1,
                            'auth/builder-api-key': 1,
                            'cancel-all': 1,
                            'cancel-market-orders': 1,
                            'notifications': 1,
                            'order': 1,
                            'orders': 1,
                        },
                    },
                },
                'data': {
                    'public': {
                        'get': {
                            'activity': 1,
                            'closed-positions': 1,
                            'holders': 1,
                            'live-volume': 1,
                            'oi': 1,
                            'other': 1,
                            'positions': 1,
                            'revisions': 1,
                            'traded': 1,
                            'trades': 1,
                            'v1/accounting/snapshot': 1,
                            'v1/activity/combos': 1,
                            'v1/builders/leaderboard': 1,
                            'v1/builders/volume': 1,
                            'v1/leaderboard': 1,
                            'v1/market-positions': 1,
                            'v1/positions/combos': 1,
                            'value': 1,
                        },
                    },
                },
                'combos': {
                    'public': {
                        'get': {
                            'v1/rfq/combo-markets': 1,
                        },
                    },
                    'private': {
                        'post': {
                            'v1/maker/confirmations': 1,
                            'v1/maker/quotes': 1,
                            'v1/maker/quotes/cancel': 1,
                        },
                    },
                },
            },
            'requiredCredentials': {
                'apiKey': true,   // POLY_API_KEY
                'secret': true,   // POLY_API_SECRET
                'password': true,   // POLY_PASSPHRASE
                'walletAddress': true,   // Ethereum wallet address
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': 0.0,
                    'taker': 0.0,
                },
            },
            'options': {
                'defaultFetchEventsLimit': 100,
                'maxFetchEventsLimit': 500,
                'defaultEventStatus': 'active',  // 'active' | 'closed' | 'all'
            },
        });
    }

    /**
     * @method
     * @name polymarket#fetchMarkets
     * @description retrieves data on all markets for polymarket, each prediction market becomes one market with its outcome tokens listed under the outcomes key
     * @see https://docs.polymarket.com/api-reference/events/list-events
     * @see https://docs.polymarket.com/api-reference/search/search-markets-events-and-profiles
     * @param {object} [params] extra exchange-specific parameters
     * @param {string[]} [params.queries] search terms used to filter the fetched events
     * @param {string} [params.status] 'active', 'closed' or 'all', the status of the events to fetch, defaults to 'active'
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets (params = {}): Promise<Market[]> {
        const queries = this.safeList (params, 'queries', []) as any[];
        const rest = this.omit (params, [ 'queries' ]);
        const queriesLength = queries.length;
        let rawEvents: any[] = [];
        if (queriesLength > 0) {
            rawEvents = await this.fetchRawEventsBySearch (queries, rest);
        } else {
            rawEvents = await this.fetchRawEventsList (rest);
        }
        const flatMarkets: Market[] = [];
        const eventsDict: Dict = {};
        for (let rei = 0; rei < rawEvents.length; rei++) {
            const rawEvent = rawEvents[rei];
            const ccxtMarkets = this.parseEventToMarkets (rawEvent);
            for (let mi = 0; mi < ccxtMarkets.length; mi++) {
                flatMarkets.push (ccxtMarkets[mi]);
            }
            const parsedEvent = this.parseEvent (rawEvent);
            const eventSlug = this.safeString (rawEvent, 'slug');
            if (eventSlug) {
                const eventKey = this.shortenSlug (eventSlug);
                eventsDict[eventKey] = parsedEvent;
            }
        }
        this.events = eventsDict;
        return flatMarkets;
    }

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
    async fetchRawEventsBySearch (queries: any[], params = {}): Promise<any[]> {
        const pageSize = this.safeInteger (params, 'limit', 50);
        const rest = this.omit (params, [ 'limit' ]);
        const seen: Dict = {};
        const rawEvents: any[] = [];
        for (let qi = 0; qi < queries.length; qi++) {
            const q = queries[qi];
            const baseRequest: Dict = { 'q': q, 'limit_per_type': pageSize, 'events_status': 'active' };
            let firstRequest: Dict = { 'page': 1 };
            firstRequest = this.extend (this.extend (firstRequest, baseRequest), rest);
            const first = await this.gammaPublicGetPublicSearch (firstRequest);
            const firstEvents = this.safeList (first, 'events', []) as any[];
            const firstEventsLength = firstEvents.length;
            const pagination = this.safeDict (first, 'pagination', {});
            const totalResults = this.safeInteger (pagination, 'totalResults', firstEventsLength);
            const totalPages = Math.ceil (totalResults / pageSize);
            const remainingPages: number[] = [];
            for (let p = 2; p <= totalPages; p++) {
                remainingPages.push (p);
            }
            const restPromises: any[] = [];
            for (let pi = 0; pi < remainingPages.length; pi++) {
                let pageRequest: Dict = { 'page': remainingPages[pi] };
                pageRequest = this.extend (this.extend (pageRequest, baseRequest), rest);
                restPromises.push (this.gammaPublicGetPublicSearch (pageRequest));
            }
            const restResponses = await Promise.all (restPromises);
            const allEvents: any[] = [];
            for (let fi = 0; fi < firstEvents.length; fi++) {
                allEvents.push (firstEvents[fi]);
            }
            for (let ri = 0; ri < restResponses.length; ri++) {
                const pageEvents = this.safeList (restResponses[ri], 'events', []) as any[];
                for (let ei = 0; ei < pageEvents.length; ei++) {
                    allEvents.push (pageEvents[ei]);
                }
            }
            for (let ei = 0; ei < allEvents.length; ei++) {
                const rawEvent = allEvents[ei];
                const eventId = this.safeString (rawEvent, 'id');
                if (eventId && !(eventId in seen)) {
                    seen[eventId] = true;
                    rawEvents.push (rawEvent);
                }
            }
        }
        return rawEvents;
    }

    /**
     * @ignore
     * @method
     * @name polymarket#fetchRawEventsList
     * @description fetches raw gamma event objects from the events listing endpoint, paginating in parallel
     * @see https://docs.polymarket.com/api-reference/events/list-events
     * @param {object} [params] extra exchange-specific parameters
     * @param {string} [params.status] 'active', 'closed' or 'all', defaults to options.defaultEventStatus
     * @returns {object[]} an array of raw gamma event objects
     */
    async fetchRawEventsList (params = {}): Promise<any[]> {
        const pageSize = this.safeInteger (this.options, 'maxFetchEventsLimit', 500);
        const maxPages = 20;
        const status = this.safeString (params, 'status', this.safeString (this.options, 'defaultEventStatus', 'active'));
        const rest = this.omit (params, [ 'status' ]);
        let baseRequest: Dict = { 'limit': pageSize, 'order': 'volume24hr', 'ascending': false };
        baseRequest = this.extend (baseRequest, rest);
        if (status === 'active') {
            baseRequest['active'] = true;
        } else if (status === 'closed') {
            baseRequest['closed'] = true;
        }
        // fetch page 1 first; if full, fire remaining pages in parallel
        let firstPageRequest: Dict = { 'offset': 0 };
        firstPageRequest = this.extend (firstPageRequest, baseRequest);
        const firstPageResponse = await this.gammaPublicGetEvents (firstPageRequest);
        const firstPage = (firstPageResponse !== undefined) ? firstPageResponse : [];
        const firstPageLength = firstPage.length;
        const allRawEvents: any[] = [];
        for (let fi = 0; fi < firstPageLength; fi++) {
            allRawEvents.push (firstPage[fi]);
        }
        if (firstPageLength >= pageSize) {
            const offsets: number[] = [];
            for (let p = 1; p < maxPages; p++) {
                offsets.push (p * pageSize);
            }
            const restPromises: any[] = [];
            for (let oi = 0; oi < offsets.length; oi++) {
                let pageRequest: Dict = { 'offset': offsets[oi] };
                pageRequest = this.extend (pageRequest, baseRequest);
                restPromises.push (this.gammaPublicGetEvents (pageRequest));
            }
            const restPages = await Promise.all (restPromises);
            for (let ri = 0; ri < restPages.length; ri++) {
                const page = (restPages[ri] !== undefined) ? restPages[ri] : [];
                const pageLength = page.length;
                for (let pi = 0; pi < pageLength; pi++) {
                    allRawEvents.push (page[pi]);
                }
            }
        }
        return allRawEvents;
    }

    parseEventToMarkets (event: Dict): Market[] {
        const eventSlug = this.safeString (event, 'slug', this.safeString (event, 'id'));
        const rawMarkets = this.safeList (event, 'markets', []) as any[];
        const result: Market[] = [];
        //
        // {
        //    "id":"604489",
        //    "question":"Will Trump visit China by October 31?",
        //    "conditionId":"0x3d69cc559693ee46ba58da16e43c4e75b8da67b99c2e9a9d2f72bb0222d0f137",
        //    "slug":"will-trump-visit-china-by-october-31",
        //    "resolutionSource":"",
        //    "endDate":"2025-10-31T00:00:00Z",
        //    "startDate":"2025-09-19T21:22:54.912576Z",
        //    "image":"https://polymarket-upload.s3.us-east-2.amazonaws.com/will-trump-visit-china-by-october-31-ujqWMja0Uizt.png",
        //    "icon":"https://polymarket-upload.s3.us-east-2.amazonaws.com/will-trump-visit-china-by-october-31-ujqWMja0Uizt.png",
        //    "description":"If U.S. President Donald Trump visits China by October 31, 2025, 11:59 PM ET, this market will resolve to \\""Yes\\"". Otherwise, this market will resolve to \\""No\\"".\\n\\nFor the purpose of this market, a \\""visit\\"" is defined as Trump physically entering the terrestrial or maritime territory of the listed country. Whether or not Trump enters the country's airspace during the timeframe of this market will have no bearing on a positive resolution.\\n\\nThe primary resolution source for this information will be official information from government of the United States of America, official information from Trump or released by his verified social media accounts (e.g. https://twitter.com/POTUS), however, a consensus of credible reporting will also be used.",
        //    "outcomes":"[\\""Yes\\"", \\""No\\""]",
        //    "outcomePrices":"[\\"0\\", \\"1\\"]",
        //    "volume":"549414.493468",
        //    "active":true,
        //    "closed":true,
        //    "marketMakerAddress":"",
        //    "createdAt":"2025-09-19T19:32:28.841694Z",
        //    "updatedAt":"2026-03-09T22:44:28.896812Z",
        //    "closedTime":"2025-11-01 06:28:08+00",
        //    "new":false,
        //    "featured":false,
        //    "submitted_by":"0x91430CaD2d3975766499717fA0D66A78D814E5c5",
        //    "archived":false,
        //    "resolvedBy":"0x65070BE91477460D8A7AeEb94ef92fe056C2f2A7",
        //    "restricted":true,
        //    "groupItemTitle":"October 31, 2025",
        //    "groupItemThreshold":"0",
        //    "questionID":"0x2dd49c70f01a5e7c687a9820d606ff0d85fb50199735928d52d98b3a57586969",
        //    "umaEndDate":"2025-11-01T06:28:08Z",
        //    "enableOrderBook":true,
        //    "orderPriceMinTickSize":"0.001",
        //    "orderMinSize":"5",
        //    "umaResolutionStatus":"resolved",
        //    "volumeNum":"549414.493468",
        //    "endDateIso":"2025-10-31",
        //    "startDateIso":"2025-09-19",
        //    "hasReviewedDates":true,
        //    "volume1wk":"121949.66579699998",
        //    "volume1mo":"535231.3545640002",
        //    "volume1yr":"549414.4934680002",
        //    "clobTokenIds":"[\\"45601394554497090173642354630373884477724604907691447337031201817815960365378\\", \\"102652665954921241745169157447280060113772926009745753029489061659654862632571\\"]",
        //    "umaBond":"500",
        //    "umaReward":"5",
        //    "volume1wkClob":"121949.66579699998",
        //    "volume1moClob":"535231.3545640002",
        //    "volume1yrClob":"549414.4934680002",
        //    "volumeClob":"549414.493468",
        //    "customLiveness":"0",
        //    "acceptingOrders":false,
        //    "negRisk":false,
        //    "negRiskRequestID":"",
        //    "ready":false,
        //    "funded":false,
        //    "acceptingOrdersTimestamp":"2025-09-19T21:22:32Z",
        //    "cyom":false,
        //    "pagerDutyNotificationEnabled":false,
        //    "approved":true,
        //    "rewardsMinSize":"100",
        //    "rewardsMaxSpread":"3.5",
        //    "spread":"0.001",
        //    "automaticallyResolved":true,
        //    "oneDayPriceChange":"-0.0005",
        //    "oneWeekPriceChange":"-0.007",
        //    "oneMonthPriceChange":"-0.011",
        //    "lastTradePrice":"1",
        //    "bestAsk":"0.001",
        //    "automaticallyActive":true,
        //    "clearBookOnStart":true,
        //    "seriesColor":"",
        //    "showGmpSeries":false,
        //    "showGmpOutcome":false,
        //    "manualActivation":false,
        //    "negRiskOther":false,
        //    "umaResolutionStatuses":"[\\""proposed\\""]",
        //    "pendingDeployment":false,
        //    "deploying":false,
        //    "deployingTimestamp":"2025-09-19T21:22:01.979023Z",
        //    "rfqEnabled":false,
        //    "holdingRewardsEnabled":false,
        //    "feesEnabled":false,
        //    "requiresTranslation":false,
        //    "feeType":null
        // }
        //
        for (let mi = 0; mi < rawMarkets.length; mi++) {
            const market = rawMarkets[mi];
            const conditionId = this.safeString (market, 'conditionId');
            const marketId = this.safeString (market, 'id');
            const marketSlug = this.safeString (market, 'slug', conditionId);
            const active = this.safeBool (market, 'active', false);
            const closed = this.safeBool (market, 'closed', false);
            const tickSize = this.safeNumber (market, 'minimumTickSize', 0.01);
            const endDate = this.safeString (market, 'endDate', this.safeString (market, 'end_date_iso'));
            // Gamma API returns these arrays as JSON-encoded strings
            let outcomeLabels: any[] = [];
            let clobTokenIds: any[] = [];
            let outcomePrices: any[] = [];
            const parsedOutcomes = this.parseJson (this.safeString (market, 'outcomes', '[]'));
            const parsedTokenIds = this.parseJson (this.safeString (market, 'clobTokenIds', '[]'));
            const parsedPrices = this.parseJson (this.safeString (market, 'outcomePrices', '[]'));
            let parsedOutcomesLength = undefined;
            if (parsedOutcomes !== undefined) {
                parsedOutcomesLength = (parsedOutcomes as any[]).length;
            }
            let parsedTokenIdsLength = undefined;
            if (parsedTokenIds !== undefined) {
                parsedTokenIdsLength = (parsedTokenIds as any[]).length;
            }
            let parsedPricesLength = undefined;
            if (parsedPrices !== undefined) {
                parsedPricesLength = (parsedPrices as any[]).length;
            }
            if (parsedOutcomes && (parsedOutcomesLength !== undefined)) {
                outcomeLabels = parsedOutcomes as any[];
            }
            if (parsedTokenIds && (parsedTokenIdsLength !== undefined)) {
                clobTokenIds = parsedTokenIds as any[];
            }
            if (parsedPrices && (parsedPricesLength !== undefined)) {
                outcomePrices = parsedPrices as any[];
            }
            const outcomeLabelsLength = outcomeLabels.length;
            const clobTokenIdsLength = clobTokenIds.length;
            if (outcomeLabelsLength === 0 || clobTokenIdsLength === 0) {
                continue;
            }
            // Market symbol (no outcome suffix)
            const marketSymbol = this.slugToMarketSymbol (eventSlug, marketSlug);
            // Build outcomes array
            const outcomes: any[] = [];
            for (let oi = 0; oi < outcomeLabels.length; oi++) {
                const outcomeLabel = outcomeLabels[oi];
                const clobTokenId = clobTokenIds[oi];
                const outcomePrice = this.safeNumber (outcomePrices as any, oi as any);
                if (!clobTokenId) {
                    continue;
                }
                outcomes.push ({
                    'id': clobTokenId,
                    'symbol': marketSymbol + ':' + outcomeLabel.toUpperCase (),
                    'marketSymbol': marketSymbol,
                    'label': outcomeLabel,
                    'price': outcomePrice,
                    'active': active && !closed,
                    'info': market,
                });
            }
            const baseId = (conditionId !== undefined) ? conditionId : marketId;
            result.push ({
                'id': conditionId,
                'symbol': marketSymbol,
                'base': 'USDC',
                'quote': 'USDC',
                'settle': undefined,
                'baseId': baseId,
                'quoteId': 'USDC',
                'settleId': undefined,
                'type': 'prediction',
                'spot': false,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'prediction': true,
                'active': active && !closed,
                'contract': false,
                'linear': undefined,
                'inverse': undefined,
                'contractSize': undefined,
                'expiry': endDate ? this.parse8601 (endDate) : undefined,
                'expiryDatetime': endDate,
                'strike': undefined,
                'optionType': undefined,
                'taker': 0.0,
                'maker': 0.0,
                'percentage': true,
                'tierBased': false,
                'feeSide': 'get',
                'precision': {
                    'amount': tickSize,
                    'price': tickSize,
                },
                'limits': {
                    'leverage': { 'min': 1, 'max': 1 },
                    'amount': { 'min': 1, 'max': undefined },
                    'price': { 'min': 0.01, 'max': 0.99 },
                    'cost': { 'min': undefined, 'max': undefined },
                },
                'outcomes': outcomes,
                'info': market,
                'created': undefined,
            } as unknown as Market);
        }
        return result;
    }

    /**
     * @method
     * @name polymarket#fetchTicker
     * @description fetches the current mid-price and best bid/ask for a single outcome token
     * @see https://docs.polymarket.com/api-reference/data/get-midpoint-price
     * @see https://docs.polymarket.com/api-reference/market-data/get-order-book
     * @param {string} symbol unified outcome symbol like TRUMP_DANCE_TODAY_997:YES or an outcome token id
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)
     */
    async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        const outcome = symbol;
        this.checkEventsAndMarkets (outcome);
        const outcomeObj = this.outcome (outcome);
        const tokenId = outcomeObj['id'];
        const promises = [
            this.clobPublicGetMidpoint ({ 'token_id': tokenId }),
            this.clobPublicGetBook ({ 'token_id': tokenId }),
        ];
        const [ midpointResponse, bookResponse ] = await Promise.all (promises);
        const response = { 'midpoint': midpointResponse, 'book': bookResponse };
        //
        //     {
        //         "midpoint": {
        //             "mid": "0.9985"
        //         },
        //         "book": {
        //             "market": "0x2d55f622bc12e23dc1f1bb4db8360c28c92155f9376bf73953c0756ee1387b2f",
        //             "asset_id": "16718041887881762329859205887704087070587186248220606272297433440108449709696",
        //             "timestamp": "1777344471023",
        //             "hash": "11aa0feabec970de83b04a2c0d50a7639e144f43",
        //             "bids": [
        //                 {
        //                     "price": "0.45",
        //                     "size": "100"
        //                 },
        //             ],
        //             "asks": [
        //                 {
        //                     "price": "0.46",
        //                     "size": "150"
        //                 },
        //             ],
        //             "min_order_size": "5",
        //             "tick_size": "0.001",
        //             "neg_risk": false,
        //             "last_trade_price": "0.998"
        //         }
        //     }
        //
        return this.parseTicker (
            response,
            outcomeObj
        );
    }

    /**
     * @method
     * @name polymarket#fetchTickers
     * @description fetches tickers for multiple outcome tokens at once using the batched CLOB book and midpoint endpoints
     * @see https://docs.polymarket.com/api-reference/market-data/get-order-books-request-body
     * @see https://docs.polymarket.com/api-reference/market-data/get-midpoint-prices-request-body
     * @param {string[]} [symbols] unified outcome symbols or outcome token ids, fetches all loaded outcomes when omitted
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures](https://docs.ccxt.com/#/?id=ticker-structure) indexed by outcome symbol
     */
    async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        const outcomes = symbols;
        let outcomesLength = 0;
        if (outcomes !== undefined) {
            outcomesLength = outcomes.length;
        }
        if (outcomesLength > 0) {
            for (let i = 0; i < outcomes.length; i++) {
                this.checkEventsAndMarkets (outcomes[i]);
            }
        } else {
            this.checkEventsAndMarkets ();
        }
        const outcomesMap = (this.outcomes !== undefined) ? this.outcomes : {};
        const targets: any[] = [];
        if (outcomes !== undefined) {
            for (let oi = 0; oi < outcomes.length; oi++) {
                targets.push (outcomes[oi]);
            }
        } else {
            const allOutcomeKeys = Object.keys (outcomesMap);
            for (let ki = 0; ki < allOutcomeKeys.length; ki++) {
                targets.push (allOutcomeKeys[ki]);
            }
        }
        const outcomesByTokenId: Dict = {};
        const tokenIds: any[] = [];
        for (let i = 0; i < targets.length; i++) {
            const outcomeObj = this.outcome (targets[i]);
            const tokenId = this.safeString (outcomeObj, 'id');
            if ((tokenId !== undefined) && !(tokenId in outcomesByTokenId)) {
                outcomesByTokenId[tokenId] = outcomeObj;
                tokenIds.push (tokenId);
            }
        }
        const chunkSize = this.safeInteger (this.options, 'fetchTickersBatchSize', 200);
        const result: Tickers = {};
        const tokenIdsLength = tokenIds.length;
        let startIndex = 0;
        while (startIndex < tokenIdsLength) {
            let endIndex = this.sum (startIndex, chunkSize);
            if (endIndex > tokenIdsLength) {
                endIndex = tokenIdsLength;
            }
            const bookParams: any[] = [];
            for (let i = startIndex; i < endIndex; i++) {
                bookParams.push ({ 'token_id': tokenIds[i] });
            }
            const promises = [
                this.clobPublicPostBooks (bookParams),
                this.clobPublicPostMidpoints (bookParams),
            ];
            const responses = await Promise.all (promises);
            const books = responses[0];
            const midpoints = responses[1];
            const booksLength = books.length;
            for (let i = 0; i < booksLength; i++) {
                const book = books[i];
                const tokenId = this.safeString (book, 'asset_id');
                if ((tokenId === undefined) || !(tokenId in outcomesByTokenId)) {
                    continue;
                }
                const outcomeObj = outcomesByTokenId[tokenId];
                const mid = this.safeString (midpoints, tokenId);
                const tickerInput: Dict = { 'midpoint': { 'mid': mid }, 'book': book };
                const ticker = this.parseTicker (tickerInput, outcomeObj);
                const symbolKey = this.safeString (ticker, 'symbol', tokenId);
                result[symbolKey] = ticker;
            }
            startIndex = this.sum (startIndex, chunkSize);
        }
        return result;
    }

    /**
     * @ignore
     * @method
     * @name polymarket#parseTicker
     * @description parses a combined midpoint + order book response into a unified ticker object
     * @param {object} ticker a dict with midpoint and book entries
     * @param {object} [market] the outcome object the ticker belongs to
     * @returns {object} a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)
     */
    parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        //
        //     {
        //         "midpoint": {
        //             "mid": "0.9985"
        //         },
        //         "book": {
        //             "market": "0x2d55f622bc12e23dc1f1bb4db8360c28c92155f9376bf73953c0756ee1387b2f",
        //             "asset_id": "16718041887881762329859205887704087070587186248220606272297433440108449709696",
        //             "timestamp": "1777344471023",
        //             "hash": "11aa0feabec970de83b04a2c0d50a7639e144f43",
        //             "bids": [
        //                 {
        //                     "price": "0.45",
        //                     "size": "100"
        //                 },
        //             ],
        //             "asks": [
        //                 {
        //                     "price": "0.46",
        //                     "size": "150"
        //                 },
        //             ],
        //             "min_order_size": "5",
        //             "tick_size": "0.001",
        //             "neg_risk": false,
        //             "last_trade_price": "0.998"
        //         }
        //     }
        //
        const midpointData = this.safeDict (ticker, 'midpoint', {});
        const bookData = this.safeDict (ticker, 'book', {});
        const mid = this.safeNumber (midpointData, 'mid');
        const bids = this.safeList (bookData, 'bids', []) as any[];
        const asks = this.safeList (bookData, 'asks', []) as any[];
        const bidsLength = bids.length;
        const asksLength = asks.length;
        // the CLOB book endpoint returns levels sorted away from the touch (bids ascending, asks descending), so the best level is the last entry
        const bestBid = (bidsLength > 0) ? bids[bidsLength - 1] : undefined;
        const bestAsk = (asksLength > 0) ? asks[asksLength - 1] : undefined;
        const lastTradePrice = this.safeNumber (bookData, 'last_trade_price');
        const last = (lastTradePrice !== undefined) ? lastTradePrice : mid;
        const symbol = this.safeSymbol (undefined, market);
        const timestamp = this.safeInteger (bookData, 'timestamp', this.milliseconds ());
        let quoteVolume = undefined;
        if (market !== undefined) {
            quoteVolume = this.safeNumber2 (market['info'], 'volume24hr', 'volume');
        }
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': undefined,
            'low': undefined,
            'bid': this.safeNumber (bestBid, 'price'),
            'bidVolume': this.safeNumber (bestBid, 'size'),
            'ask': this.safeNumber (bestAsk, 'price'),
            'askVolume': this.safeNumber (bestAsk, 'size'),
            'vwap': undefined,
            'open': undefined,
            'close': mid,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': mid,
            'baseVolume': undefined,
            'quoteVolume': quoteVolume,
            'info': ticker,
        }, market);
    }

    /**
     * @method
     * @name polymarket#fetchOrderBook
     * @description fetches the CLOB order book for a single outcome token
     * @see https://docs.polymarket.com/api-reference/market-data/get-order-book
     * @param {string} symbol unified outcome symbol or outcome token id
     * @param {int} [limit] not used by polymarket fetchOrderBook
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order book structure](https://docs.ccxt.com/#/?id=order-book-structure)
     */
    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        const outcome = symbol;
        this.checkEventsAndMarkets (outcome);
        const outcomeObj = this.outcome (outcome);
        const tokenId = outcomeObj['id'] as string;
        const request: Dict = {
            'token_id': tokenId,
        };
        const response = await this.clobPublicGetBook (this.extend (request, params));
        //
        //     {
        //         "market": "0x42d42b30124ed2d93800358dfd1d48253114e4d58cff15cb765cd0c69956555f",
        //         "asset_id": "53471586309106256293075593293890793127405137223521910882276033765569397092350",
        //         "timestamp": "1777541385018",
        //         "hash": "bfb61f58dab4055d956eb5e758dbc9101c9a4e6c",
        //         "bids": [
        //             { "price": "0.001", "size": "3147.19" },
        //             { "price": "0.002", "size": "1432.11" }
        //         ],
        //         "asks": [
        //             { "price": "0.999", "size": "73.68" },
        //             { "price": "0.998", "size": "7" }
        //         ],
        //         "min_order_size": "5",
        //         "tick_size": "0.001",
        //         "neg_risk": false,
        //         "last_trade_price": "0.002"
        //     }
        //
        const timestamp = this.safeInteger (response, 'timestamp');
        return this.parseOrderBook (response, this.safeOutcomeSymbol (outcome, outcomeObj), timestamp, 'bids', 'asks', 'price', 'size');
    }

    /**
     * @method
     * @name polymarket#fetchOHLCV
     * @description fetches price history ticks for a single outcome token and buckets them client-side into OHLCV candles, snapping tick timestamps to the candle boundary
     * @see https://docs.polymarket.com/api-reference/markets/get-prices-history
     * @param {string} symbol unified outcome symbol or outcome token id
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum number of candles to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} a list of candles ordered as timestamp, open, high, low, close, volume
     */
    async fetchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        const outcome = symbol;
        this.checkEventsAndMarkets (outcome);
        const outcomeObj = this.outcome (outcome);
        const tokenId = outcomeObj['id'] as string;
        const fidelityMin = this.safeInteger (this.timeframes, timeframe, 1); // fidelity in minutes
        const nowS = this.seconds ();
        let startS: number;
        let endS: number = nowS;
        if (since !== undefined) {
            startS = this.parseToInt (since / 1000);
            if (limit !== undefined) {
                const endBound = this.sum (startS, limit * fidelityMin * 60);
                endS = (endBound < nowS) ? endBound : nowS;
            }
        } else {
            const barCount = (limit !== undefined) ? limit : 100;
            startS = nowS - (barCount * fidelityMin * 60);
        }
        const request: Dict = {
            'market': tokenId,
            'fidelity': fidelityMin,
            'startTs': startS,
            'endTs': endS,
        };
        const response = await this.clobPublicGetPricesHistory (this.extend (request, params));
        //
        //     {
        //         "history": [
        //             { "t": "1776043119", "p": "0.265" },
        //         ]
        //     }
        //
        const history = this.safeList (response, 'history', []) as any[];
        // Client-side bucket aggregation: snap each tick to its candle boundary and
        // build open/high/low/close/volume. Assumes history is sorted ascending by time.
        const resolutionMs = fidelityMin * 60 * 1000;
        const buckets = {};
        for (let i = 0; i < history.length; i++) {
            const item = history[i];
            const t = this.safeInteger (item, 't');
            const price = this.safeNumber (item, 'p');
            if ((t === undefined) || (price === undefined)) {
                continue;
            }
            const rawMs = t * 1000;
            const snappedMs = Math.floor (rawMs / resolutionMs) * resolutionMs;
            let vol = this.safeNumber (item, 's');
            if (vol === undefined) {
                vol = this.safeNumber (item, 'v');
            }
            if (vol === undefined) {
                vol = 0;
            }
            const bucketKey = snappedMs.toString ();
            if (!(bucketKey in buckets)) {
                buckets[bucketKey] = [ snappedMs, price, price, price, price, vol ];
            } else {
                const candle = buckets[bucketKey] as OHLCV;
                candle[2] = Math.max (candle[2] as number, price); // high
                candle[3] = Math.min (candle[3] as number, price); // low
                candle[4] = price;                                  // close (last tick wins)
                candle[5] = this.sum (candle[5] as number, vol);   // volume
                buckets[bucketKey] = candle; // reassign after mutation, php arrays are value types
            }
        }
        const bucketKeys = Object.keys (buckets);
        const unsortedCandles = [];
        for (let i = 0; i < bucketKeys.length; i++) {
            unsortedCandles.push (buckets[bucketKeys[i]] as OHLCV);
        }
        const candles = this.sortBy (unsortedCandles, 0);
        const candlesLength = candles.length;
        if ((limit !== undefined) && (candlesLength > limit)) {
            return this.arraySlice (candles, -limit);
        }
        return candles;
    }

    parseOHLCV (ohlcv, market: Market = undefined): OHLCV {
        // Unused: fetchOHLCV performs client-side bucket aggregation directly.
        //
        //     {
        //         "t": "1776043119",
        //         "p": "0.265"
        //     }
        //
        const price = this.safeNumber (ohlcv, 'p');
        return [ this.safeTimestamp (ohlcv, 't'), price, price, price, price, 0 ];
    }

    /**
     * @method
     * @name polymarket#fetchTime
     * @description fetches the current timestamp from the CLOB server
     * @see https://docs.polymarket.com/api-reference/data/get-server-time
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current server time in milliseconds
     */
    async fetchTime (params = {}): Promise<Int> {
        const response = await this.clobPublicGetTime (params);
        //
        //     1781273248
        //
        return this.parseToInt (response) * 1000;
    }

    /**
     * @method
     * @name polymarket#fetchTrades
     * @description fetches public trade history for a single outcome token from the data API
     * @see https://docs.polymarket.com/api-reference/core/get-trades-for-a-user-or-markets
     * @param {string} symbol unified outcome symbol or outcome token id
     * @param {int} [since] not used by polymarket fetchTrades
     * @param {int} [limit] the maximum number of trades to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)
     */
    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        const outcome = symbol;
        this.checkEventsAndMarkets (outcome);
        const outcomeObj = this.outcome (outcome);
        const tokenId = outcomeObj['id'] as string;
        const outcomeInfo = this.safeDict (outcomeObj, 'info', {});
        const conditionId = this.safeString (outcomeInfo, 'conditionId');
        if (conditionId === undefined) {
            throw new BadRequest (this.id + ' fetchTrades() requires outcome.info.conditionId for an outcome ' + tokenId);
        }
        // the endpoint requires a market conditionId, then its filtered down to the requested outcome
        const request: Dict = { 'market': conditionId };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.dataPublicGetTrades (this.extend (request, params));
        const rawTrades = Array.isArray (response) ? response : this.safeList (response, 'data', []);
        const filteredTrades: any[] = [];
        for (let i = 0; i < rawTrades.length; i++) {
            const trade = rawTrades[i];
            const tradeAsset = this.safeString (trade, 'asset');
            if (tradeAsset === tokenId) {
                filteredTrades.push (trade);
            }
        }
        return this.parseTrades (filteredTrades, outcomeObj, since, limit);
    }

    /**
     * @ignore
     * @method
     * @name polymarket#parseTrade
     * @description parses a raw data API trade object into a unified trade object
     * @param {object} trade the raw trade object
     * @param {object} [market] the outcome object the trade belongs to
     * @returns {object} a [trade structure](https://docs.ccxt.com/#/?id=public-trades)
     */
    parseTrade (trade: Dict, market: Market = undefined): Trade {
        const id = this.safeString2 (trade, 'transactionHash', 'id');
        const timestamp = this.safeIntegerProduct (trade, 'timestamp', 1000);
        const price = this.safeNumber (trade, 'price');
        const amount = this.safeNumber (trade, 'size');
        const rawSide = this.safeStringLower (trade, 'side');
        const side = (rawSide === 'buy' || rawSide === 'sell') ? rawSide : undefined;
        const symbol = this.safeSymbol (undefined, market);
        return this.safeTrade ({
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'outcome': symbol,
            'outcomeId': this.safeString (trade, 'asset'),
            'order': this.safeString (trade, 'orderId'),
            'type': undefined,
            'side': side,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'fee': undefined,
        }, market);
    }

    /**
     * @method
     * @name polymarket#fetchBalance
     * @description fetches the total USDC value of the wallet's positions from the data API
     * @see https://docs.polymarket.com/api-reference/core/get-total-value-of-a-users-positions
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)
     */
    async fetchBalance (params = {}): Promise<Balances> {
        if (this.walletAddress === undefined) {
            throw new ArgumentsRequired (this.id + ' walletAddress is required to fetchBalance');
        }
        const request: Dict = {
            'user': this.walletAddress,
        };
        const response = await this.dataPublicGetValue (this.extend (request, params));
        return this.parseBalance (response);
    }

    /**
     * @ignore
     * @method
     * @name polymarket#parseBalance
     * @description parses a portfolio value response into a balances object with a USDC entry
     * @param {object} response the raw portfolio value response
     * @returns {object} a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)
     */
    parseBalance (response): Balances {
        const result: Dict = { 'info': response };
        const total = this.safeNumber (response, 'value', this.safeNumber (response, 'total'));
        result['USDC'] = {
            'free': total,
            'used': 0,
            'total': total,
        };
        return result as Balances;
    }

    /**
     * @method
     * @name polymarket#fetchPositions
     * @description fetches open outcome token positions for the wallet from the data API
     * @see https://docs.polymarket.com/api-reference/core/get-current-positions-for-a-user
     * @param {string[]} [symbols] unified outcome symbols to filter by
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structures](https://docs.ccxt.com/#/?id=position-structure)
     */
    async fetchPositions (symbols: Strings = undefined, params = {}): Promise<Position[]> {
        const outcomes = symbols;
        let outcomesLength = 0;
        if (outcomes !== undefined) {
            outcomesLength = outcomes.length;
        }
        if (outcomesLength > 0) {
            for (let i = 0; i < outcomes.length; i++) {
                this.checkEventsAndMarkets (outcomes[i]);
            }
        } else {
            this.checkEventsAndMarkets ();
        }
        if (this.walletAddress === undefined) {
            throw new ArgumentsRequired (this.id + ' walletAddress is required to fetchPositions');
        }
        const request = {
            'user': this.walletAddress,
        };
        const response = await this.dataPublicGetPositions (this.extend (request, params));
        const positions = this.safeList (response, 'data', []) as any[];
        return this.parsePositions (positions, outcomes);
    }

    /**
     * @ignore
     * @method
     * @name polymarket#parsePosition
     * @description parses a raw data API position object into a unified position object
     * @param {object} position the raw position object
     * @param {object} [market] the outcome object the position belongs to
     * @returns {object} a [position structure](https://docs.ccxt.com/#/?id=position-structure)
     */
    parsePosition (position: Dict, market: Market = undefined): Position {
        const tokenId = this.safeString (position, 'asset');
        const marketData = this.safeOutcome (tokenId, market as any);
        const size = this.safeNumber (position, 'size');
        const entryPrice = this.safeNumber (position, 'avgPrice');
        const curPrice = this.safeNumber (position, 'currentPrice');
        // const unrealizedPnl = (size !== undefined && entryPrice !== undefined && curPrice !== undefined)
        //     ? size * (curPrice - entryPrice)
        //     : undefined;
        let notional = undefined;
        if ((size !== undefined) && (curPrice !== undefined)) {
            notional = size * curPrice;
        }
        return {
            'id': this.safeString (position, 'id'),
            'symbol': marketData['symbol'],
            'timestamp': undefined,
            'datetime': undefined,
            'contracts': size,
            'contractSize': 1,
            'side': 'long',
            'notional': notional,
            'leverage': 1,
            'unrealizedPnl': undefined,
            'realizedPnl': this.safeNumber (position, 'realizedPnl'),
            'collateral': undefined,
            'entryPrice': entryPrice,
            'markPrice': curPrice,
            'liquidationPrice': undefined,
            'hedged': false,
            'maintenanceMargin': undefined,
            'maintenanceMarginPercentage': undefined,
            'initialMargin': undefined,
            'initialMarginPercentage': undefined,
            'marginRatio': undefined,
            'marginMode': 'cross',
            'marginType': 'cross',
            'percentage': undefined,
            'info': position,
        } as Position;
    }

    /**
     * @method
     * @name polymarket#fetchOpenOrders
     * @description fetches open resting orders for the authenticated user, optionally filtered by outcome token
     * @see https://docs.polymarket.com/api-reference/trade/get-user-orders
     * @param {string} [symbol] unified outcome symbol or outcome token id
     * @param {int} [since] not used by polymarket fetchOpenOrders
     * @param {int} [limit] the maximum number of orders to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)
     */
    async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        const outcome = symbol;
        if (outcome !== undefined) {
            this.checkEventsAndMarkets (outcome);
        } else {
            this.checkEventsAndMarkets ();
        }
        const request: Dict = {};
        let outcomeObj: any = undefined;
        if (outcome !== undefined) {
            outcomeObj = this.outcome (outcome);
            request['asset_id'] = outcomeObj['id'];
        }
        const response = await this.clobPrivateGetDataOrders (this.extend (request, params));
        const orders = this.safeList (response, 'data', []) as any[];
        return this.parseOrders (orders, outcomeObj as any, since, limit);
    }

    /**
     * @method
     * @name polymarket#fetchOrder
     * @description fetches a single order by id from the CLOB private data endpoint
     * @see https://docs.polymarket.com/api-reference/trade/get-single-order-by-id
     * @param {string} id the order id
     * @param {string} [symbol] unified outcome symbol or outcome token id
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure](https://docs.ccxt.com/#/?id=order-structure)
     */
    async fetchOrder (id: Str, symbol: Str = undefined, params = {}): Promise<Order> {
        const outcome = symbol;
        if (outcome !== undefined) {
            this.checkEventsAndMarkets (outcome);
        } else {
            this.checkEventsAndMarkets ();
        }
        const request: Dict = { 'id': id };
        const response = await this.clobPrivateGetDataOrderId (this.extend (request, params));
        return this.parseOrder (response);
    }

    /**
     * @ignore
     * @method
     * @name polymarket#parseOrder
     * @description parses a raw CLOB order object into a unified order object
     * @param {object} order the raw order object
     * @param {object} [market] the outcome object the order belongs to
     * @returns {object} an [order structure](https://docs.ccxt.com/#/?id=order-structure)
     */
    parseOrder (order: Dict, market: Market = undefined): Order {
        const id = this.safeString (order, 'id');
        const tokenId = this.safeString (order, 'asset_id');
        const mkt = this.safeOutcome (tokenId, market as any);
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const side = this.safeStringLower (order, 'side');
        const price = this.safeNumber (order, 'price');
        const amount = this.safeNumber (order, 'original_size');
        const filled = this.safeNumber (order, 'size_matched', 0);
        const ts = this.safeIntegerProduct (order, 'created_at', 1000);
        return this.safeOrder ({
            'id': id,
            'clientOrderId': undefined,
            'info': order,
            'timestamp': ts,
            'datetime': this.iso8601 (ts),
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': mkt['symbol'],
            'type': this.safeStringLower (order, 'type', 'limit'),
            'timeInForce': this.safeString (order, 'time_in_force', 'GTC'),
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': undefined,
            'triggerPrice': undefined,
            'average': undefined,
            'amount': amount,
            'cost': undefined,
            'filled': filled,
            'remaining': undefined,
            'fee': undefined,
            'trades': [],
        }, mkt);
    }

    /**
     * @ignore
     * @method
     * @name polymarket#parseOrderStatus
     * @description maps a polymarket order status string to the unified status vocabulary
     * @param {string} status the raw polymarket order status
     * @returns {string} a unified order status
     */
    parseOrderStatus (status: Str): Str {
        const statuses: Dict = {
            'LIVE': 'open',
            'MATCHED': 'closed',
            'CANCELLED': 'canceled',
            'DELAYED': 'open',
        };
        return this.safeString (statuses, status, status);
    }

    /**
     * @method
     * @name polymarket#createOrder
     * @description places a limit or market order on the CLOB for the given outcome token
     * @see https://docs.polymarket.com/api-reference/trade/post-a-new-order
     * @param {string} symbol unified outcome symbol or outcome token id
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how many outcome tokens to trade
     * @param {float} [price] the price per outcome token between 0 and 1
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure](https://docs.ccxt.com/#/?id=order-structure)
     */
    async createOrder (symbol: string, type: Str, side: Str, amount: Num, price: Num = undefined, params = {}): Promise<Order> {
        const outcome = symbol;
        this.checkEventsAndMarkets (outcome);
        const outcomeObj = this.outcome (outcome);
        const tokenId = outcomeObj['id'] as string;
        const sideRaw = side as string;
        const typeRaw = type as string;
        const sideStr = sideRaw.toUpperCase ();
        const typeStr = typeRaw.toUpperCase ();
        const request: Dict = {
            'token_id': tokenId,
            'price': price,
            'size': amount,
            'side': sideStr,
            'type': typeStr,
        };
        const response = await this.clobPrivatePostOrder (this.extend (request, params));
        return this.parseOrder (response, outcomeObj as any);
    }

    /**
     * @method
     * @name polymarket#cancelOrder
     * @description cancels a single open order by id on the CLOB
     * @see https://docs.polymarket.com/api-reference/trade/cancel-single-order
     * @param {string} id the order id
     * @param {string} [symbol] unified outcome symbol or outcome token id
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure](https://docs.ccxt.com/#/?id=order-structure)
     */
    async cancelOrder (id: Str, symbol: Str = undefined, params = {}): Promise<Order> {
        const outcome = symbol;
        this.checkEventsAndMarkets (outcome);
        const request: Dict = { 'order_id': id };
        const response = await this.clobPrivateDeleteOrder (this.extend (request, params));
        return this.parseOrder (response);
    }

    /**
     * @method
     * @name polymarket#cancelAllOrders
     * @description cancels all open orders on the CLOB, optionally scoped to one outcome token
     * @see https://docs.polymarket.com/api-reference/trade/cancel-all-orders
     * @param {string} [symbol] unified outcome symbol or outcome token id
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)
     */
    async cancelAllOrders (symbol: Str = undefined, params = {}): Promise<Order[]> {
        const outcome = symbol;
        this.checkEventsAndMarkets (outcome);
        const request: Dict = {};
        if (outcome !== undefined) {
            const outcomeObj = this.outcome (outcome);
            request['asset_id'] = outcomeObj['id'];
        }
        const response = await this.clobPrivateDeleteOrders (this.extend (request, params));
        return this.parseOrders (response);
    }

    /**
     * @method
     * @name polymarket#fetchEvents
     * @description fetches prediction-market events matching the given search terms (or all active events when omitted) and caches their markets and outcomes on the instance
     * @see https://docs.polymarket.com/api-reference/search/search-markets-events-and-profiles
     * @see https://docs.polymarket.com/api-reference/events/list-events
     * @param {string[]} [queries] search terms, fetches all active events when omitted
     * @param {object} [params] extra exchange-specific parameters
     * @param {int} [params.limit] page size per search query, defaults to 50
     * @returns {object[]} an array of event structures
     */
    async fetchEvents (queries: Strings = undefined, params = {}): Promise<PredictionEvent[]> {
        queries = (queries === undefined) ? [] : queries;
        const queriesLength = queries.length;
        let rawEvents: any[] = [];
        if (queriesLength > 0) {
            rawEvents = await this.fetchRawEventsBySearch (queries, params);
        } else {
            rawEvents = await this.fetchRawEventsList (params);
        }
        // Parse and merge into class-level caches
        if (!this.events) {
            this.events = {};
        }
        if (!this.markets) {
            this.markets = this.createSafeDictionary ();
        }
        const result: any[] = [];
        for (let rei = 0; rei < rawEvents.length; rei++) {
            const rawEvent = rawEvents[rei];
            let eventForParsing = rawEvent;
            let ccxtMarkets = this.parseEventToMarkets (eventForParsing);
            const ccxtMarketsLength = ccxtMarkets.length;
            if (ccxtMarketsLength === 0) {
                // search results may omit the nested markets, fall back to the detail endpoint
                const eventId = this.safeString (rawEvent, 'id');
                const rawEventSlug = this.safeString (rawEvent, 'slug');
                let detailedEvent = undefined;
                if (eventId !== undefined) {
                    detailedEvent = await this.gammaPublicGetEventsId ({ 'id': eventId });
                } else if (rawEventSlug !== undefined) {
                    detailedEvent = await this.gammaPublicGetEventsSlugSlug ({ 'slug': rawEventSlug });
                }
                if (detailedEvent !== undefined) {
                    eventForParsing = this.safeValue (detailedEvent, 'event', detailedEvent) as Dict;
                    ccxtMarkets = this.parseEventToMarkets (eventForParsing);
                }
            }
            for (let mi = 0; mi < ccxtMarkets.length; mi++) {
                const m = ccxtMarkets[mi];
                this.markets[m['symbol'] as string] = m;
            }
            const parsedEvent = this.parseEvent (eventForParsing);
            const eventSlug = this.safeString (eventForParsing, 'slug', this.safeString (rawEvent, 'slug'));
            if (eventSlug) {
                const eventKey = this.shortenSlug (eventSlug);
                this.events[eventKey] = parsedEvent;
            }
            result.push (parsedEvent);
        }
        this.outcomes = {};
        this.outcomes_by_id = {};
        const marketKeys = Object.keys (this.markets);
        for (let i = 0; i < marketKeys.length; i++) {
            const market = this.markets[marketKeys[i]] as Dict;
            const outcomesList = this.safeList (market, 'outcomes', []) as any[];
            for (let j = 0; j < outcomesList.length; j++) {
                const oc = outcomesList[j];
                const ocSymbol = this.safeString (oc, 'symbol');
                if (ocSymbol !== undefined) {
                    this.outcomes[ocSymbol] = oc;
                }
                const ocId = this.safeString (oc, 'id');
                if (ocId !== undefined) {
                    this.outcomes_by_id[ocId] = oc;
                }
            }
        }
        return result;
    }

    parseEvent (rawEvent: Dict): Dict {
        // {
        //     "id": "73113",
        //     "ticker": "ukraine-agrees-not-to-join-nato-before-2027",
        //     "slug": "ukraine-agrees-not-to-join-nato-before-2027",
        //     "title": "Ukraine agrees not to join NATO before 2027? ",
        //     "description": "This market will resolve to \\"Yes\\" if Ukraine publicly agrees not to join NATO by December 31, 2026, 11:59 PM ET. Otherwise, this market will resolve to “No”.\\n\\nAn official pledge by Ukraine not to join NATO will qualify for a “Yes” resolution whether as a unilateral announcement or part of an agreement with the Russian Federation.\\n\\nAny agreement or pledge made before the resolution date of this market will qualify, regardless of if/when the agreement goes into effect.\\n\\nAn agreement by Ukraine not to join NATO for any amount of time will count (e.g. If Ukraine not to join NATO for 10 years this will qualify).\\n\\nAn agreement by Ukraine not to join NATO as a precondition of a more comprehensive peace process or deal will qualify, even if the agreement is not finalized or part of a formalized peace deal. The September 8, 1995 “Agreed Basic Principles” between Bosnia and Yugoslavia which recognized the borders and sovereignty of Bosnia and Herzegovina, and was later formalized through the Dayton Peace Agreement is an example of a qualifying agreement. \\n\\nThe primary resolution source for this market will be an official announcement by the Ukraine, however an overwhelming consensus of credible reporting confirming a qualifying agreement has been reached will also count.",
        //     "resolutionSource": "",
        //     "startDate": "2025-11-05T17:00:57.200353Z",
        //     "creationDate": "2025-11-05T17:00:57.20035Z",
        //     "endDate": "2026-12-31T00:00:00Z",
        //     "image": "https://polymarket-upload.s3.us-east-2.amazonaws.com/ukraine-agrees-not-to-join-nato-before-july-vKEDpScXuAtt.jpg",
        //     "icon": "https://polymarket-upload.s3.us-east-2.amazonaws.com/ukraine-agrees-not-to-join-nato-before-july-vKEDpScXuAtt.jpg",
        //     "active": true,
        //     "closed": false,
        //     "archived": false,
        //     "new": false,
        //     "featured": false,
        //     "restricted": true,
        //     "liquidity": "22010.6659",
        //     "openInterest": "0",
        //     "createdAt": "2025-11-04T19:27:23.246129Z",
        //     "updatedAt": "2026-03-14T14:38:21.25643Z",
        //     "competitive": "0.9538344143456696",
        //     "enableOrderBook": true,
        //     "liquidityClob": "22010.6659",
        //     "commentCount": "0",
        //     "markets": [],
        //     "tags": [
        //         {
        //             "id": "101970",
        //             "label": "World",
        //             "slug": "world",
        //             "forceShow": false,
        //             "createdAt": "2025-03-19T23:36:08.498099Z",
        //             "updatedAt": "2026-03-09T22:25:02.420693Z",
        //             "requiresTranslation": false
        //         },
        //         {
        //             "id": "270",
        //             "label": "putin",
        //             "slug": "putin",
        //             "publishedAt": "2023-11-02 21:46:19.507+00",
        //             "createdAt": "2023-11-02T21:46:19.528Z",
        //             "updatedAt": "2026-03-09T22:29:44.08742Z",
        //             "requiresTranslation": false
        //         }
        //     ],
        //     "cyom": false,
        //     "showAllOutcomes": true,
        //     "showMarketImages": true,
        //     "enableNegRisk": false,
        //     "automaticallyActive": true,
        //     "seriesSlug": "ukraine-not-nato",
        //     "negRiskAugmented": false,
        //     "cumulativeMarkets": false,
        //     "pendingDeployment": false,
        //     "deploying": false,
        //     "requiresTranslation": false
        // }
        const marketsList = this.parseEventToMarkets (rawEvent);
        const slug = this.safeString (rawEvent, 'slug');
        return this.extend ({
            'id': this.safeString (rawEvent, 'id'),
            'slug': slug,
            'symbol': slug ? this.shortenSlug (slug) : undefined,
            'title': this.safeString (rawEvent, 'title'),
            'markets': marketsList,
            'url': this.safeString (rawEvent, 'url'),
            'image': this.safeString (rawEvent, 'image_url'),
            'created': this.parse8601 (this.safeString (rawEvent, 'created_date_iso')),
            'createdDatetime': this.safeString (rawEvent, 'created_date_iso'),
            'end': this.parse8601 (this.safeString (rawEvent, 'end_date_iso')),
            'endDatetime': this.safeString (rawEvent, 'end_date_iso'),
            'category': this.safeString (rawEvent, 'category'),
            'lastUpdatedAt': this.parse8601 (this.safeString (rawEvent, 'last_updated_date_iso')),
            'lastUpdatedAtDatetime': this.safeString (rawEvent, 'last_updated_date_iso'),
            'resolutionSource': this.safeString (rawEvent, 'resolution_source'),
            'resolved': this.safeBool (rawEvent, 'resolved'),
            'info': rawEvent,
        });
    }

    /**
     * @ignore
     * @method
     * @name polymarket#parseEvents
     * @description parses an array of raw gamma event objects into unified event objects
     * @param {object[]} rawEvents the raw gamma event objects
     * @returns {object[]} a list of event structures
     */
    parseEvents (rawEvents: any[]): any[] {
        const result: any[] = [];
        for (let i = 0; i < rawEvents.length; i++) {
            const rawEvent = rawEvents[i];
            result.push (this.parseEvent (rawEvent));
        }
        return result;
    }

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
    sign (path: any, api: any = 'gamma', method = 'GET', params = {}, headers: any = undefined, body: any = undefined) {
        // api is either a string ('gamma') or array (['gamma', 'public'])
        const apiGroup: string = typeof api === 'string' ? api : api[0];
        const access: string = typeof api === 'string' ? 'public' : api[1];
        const baseUrls = this.urls['api'] as Dict;
        const baseUrl = this.safeString (baseUrls, apiGroup, baseUrls['gamma'] as string);
        let url = baseUrl + '/' + this.implodeParams (path, params);
        const isArrayBody = Array.isArray (params);
        let query: Dict = {};
        if (!isArrayBody) {
            query = this.omit (params, this.extractParams (path));
        }
        if (method === 'GET') {
            const querystring = this.urlencode (query);
            if (querystring) {
                url += '?' + querystring;
            }
        } else if (isArrayBody) {
            body = this.json (params);
        } else {
            const queryKeys = Object.keys (query);
            const queryKeysLength = queryKeys.length;
            if (queryKeysLength > 0) {
                body = this.json (query);
            }
        }
        const headerDefaults = (headers !== undefined) ? headers : {};
        headers = this.extend ({
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        }, headerDefaults);
        if (access === 'private') {
            this.checkRequiredCredentials ();
            const timestamp = this.seconds ().toString ();
            let auth = timestamp + method + '/' + path;
            if (body !== undefined) {
                auth = auth + body;
            }
            const signature = this.hmac (
                this.encode (auth),
                this.encode (this.secret),
                sha256,
                'base64'
            );
            headers = this.extend (headers, {
                'POLY_ADDRESS': this.walletAddress,
                'POLY_API_KEY': this.apiKey,
                'POLY_PASSPHRASE': this.password,
                'POLY_SIGNATURE': signature,
                'POLY_TIMESTAMP': timestamp,
            });
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleMessage (client: any, message: any) {
        // Polymarket sends "PONG" text frames as keepalive responses; skip them.
        if (typeof message === 'string') {
            return;
        }
        const events = Array.isArray (message) ? message : [ message ];
        for (let i = 0; i < events.length; i++) {
            const event = events[i];
            if (!event || typeof event !== 'object') {
                continue;
            }
            const eventType = this.safeString (event, 'event_type');
            if (eventType === 'book') {
                this.handleOrderBookSnapshot (client, event);
            } else if (eventType === 'price_change') {
                this.handleOrderBookDelta (client, event);
            } else if (eventType === 'last_trade_price') {
                this.handleTrade (client, event);
            }
            // tick_size_change events are silently ignored for now
        }
    }

    handleOrderBookSnapshot (client: any, event: any) {
        const tokenId = this.safeString (event, 'asset_id');
        const symbol = this.tokenIdToSymbol (tokenId);
        if (symbol === undefined) {
            return;
        }
        if (this.orderbooks[symbol] === undefined) {
            this.orderbooks[symbol] = this.orderBook ([]);
        }
        const orderbook = this.orderbooks[symbol];
        const timestamp = this.parsePolyTimestamp (this.safeString (event, 'timestamp'));
        const rawBids = this.safeList (event, 'bids', []) as any[];
        const rawAsks = this.safeList (event, 'asks', []) as any[];
        const bids = [];
        for (let i = 0; i < rawBids.length; i++) {
            const b = rawBids[i];
            bids.push ([ this.safeNumber (b, 'price'), this.safeNumber (b, 'size') ]);
        }
        const asks = [];
        for (let j = 0; j < rawAsks.length; j++) {
            const a = rawAsks[j];
            asks.push ([ this.safeNumber (a, 'price'), this.safeNumber (a, 'size') ]);
        }
        orderbook.reset ({
            'bids': bids,
            'asks': asks,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
        });
        client.resolve (orderbook, 'orderbook::' + symbol);
        client.resolve (orderbook, 'ticker::' + symbol);
    }

    handleOrderBookDelta (client: any, event: any) {
        const timestamp = this.parsePolyTimestamp (this.safeString (event, 'timestamp'));
        const changes = this.safeList (event, 'price_changes', []) as any[];
        const updated = {};
        for (let i = 0; i < changes.length; i++) {
            const change = changes[i];
            const tokenId = this.safeString (change, 'asset_id');
            const symbol = this.tokenIdToSymbol (tokenId);
            if (symbol === undefined || this.orderbooks[symbol] === undefined) {
                continue; // no snapshot yet — discard delta
            }
            const orderbook = this.orderbooks[symbol];
            const price = this.safeNumber (change, 'price') as number;
            const size = this.safeNumber (change, 'size') as number;
            const isBuy = this.safeStringUpper (change, 'side', '') === 'BUY';
            const side = isBuy ? orderbook['bids'] : orderbook['asks'];
            // storeArray([price, size]) inserts/updates or removes (size=0) the level
            const sideRef = side as any;
            sideRef.storeArray ([ price, size ]);
            orderbook['timestamp'] = timestamp;
            orderbook['datetime'] = this.iso8601 (timestamp);
            updated[symbol] = true;
        }
        const updatedSymbols = Object.keys (updated);
        for (let k = 0; k < updatedSymbols.length; k++) {
            const symbol = updatedSymbols[k];
            const orderbook = this.orderbooks[symbol];
            client.resolve (orderbook, 'orderbook::' + symbol);
            client.resolve (orderbook, 'ticker::' + symbol);
        }
    }

    handleTrade (client: any, event: any) {
        const tokenId = this.safeString (event, 'asset_id');
        const symbol = this.tokenIdToSymbol (tokenId);
        if (symbol === undefined) {
            return;
        }
        const timestamp = this.parsePolyTimestamp (this.safeString (event, 'timestamp'));
        const price = this.safeNumber (event, 'price') as number;
        const amount = this.safeNumber (event, 'size') as number;
        const market = this.safeMarket (symbol);
        const trade = this.safeTrade ({
            'id': this.safeString (event, 'transaction_hash'),
            'info': event,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': undefined,
            'type': undefined,
            'side': this.safeStringLower (event, 'side'),
            'takerOrMaker': 'taker',
            'price': price,
            'amount': amount,
            'cost': undefined,
            'fee': undefined,
        }, market);
        if (!this.trades) {
            this.trades = {};
        }
        let stored = this.trades[symbol];
        if (stored === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            stored = new ArrayCache (limit);
            this.trades[symbol] = stored;
        }
        stored.append (trade);
        client.resolve (stored, 'trades::' + symbol);
    }

    /**
     * @method
     * @name polymarket#watchOrderBook
     * @description streams live order-book updates for a single Polymarket outcome token
     * @param {string} symbol unified outcome symbol (e.g. "ELECTION/YES:USDC")
     * @param {int} [limit] optional depth limit applied after resolving
     * @param {object} [params] extra params (currently unused)
     * @returns {object} an [order book structure]{@link https://docs.ccxt.com/#/?id=order-book-structure}
     */
    async watchOrderBook (symbol: Str, limit: Int = undefined, params = {}): Promise<OrderBook> {
        const outcome = symbol;
        await this.loadMarkets ();
        const outcomeObj = this.outcome (outcome);
        const tokenId = this.safeString (outcomeObj, 'id');
        symbol = this.safeString (outcomeObj, 'symbol');
        const messageHash = 'orderbook::' + symbol;
        const subscribeHash = 'subscribe::' + tokenId;
        const subscribeMsg = { 'operation': 'subscribe', 'assets_ids': [ tokenId ] };
        const url = this.urls['api']['ws'];
        const orderbook = await this.watch (url, messageHash, subscribeMsg, subscribeHash);
        return orderbook.limit ();
    }

    /**
     * @method
     * @name polymarket#watchTrades
     * @description streams live fills for a single Polymarket outcome token
     * @param {string} symbol unified outcome symbol
     * @param {int} [since] optional unix timestamp (ms) lower bound
     * @param {int} [limit] optional max number of trades to return
     * @param {object} [params] extra params (unused)
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async watchTrades (symbol: Str, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        const outcome = symbol;
        await this.loadMarkets ();
        const outcomeObj = this.outcome (outcome);
        const tokenId = this.safeString (outcomeObj, 'id');
        symbol = this.safeString (outcomeObj, 'symbol');
        const messageHash = 'trades::' + symbol;
        const subscribeHash = 'subscribe::' + tokenId;
        const subscribeMsg = { 'operation': 'subscribe', 'assets_ids': [ tokenId ] };
        const url = this.urls['api']['ws'];
        const trades = await this.watch (url, messageHash, subscribeMsg, subscribeHash);
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    /**
     * @method
     * @name polymarket#watchTicker
     * @description streams a synthetic ticker derived from order-book snapshots and deltas (mid = (bid + ask) / 2)
     * @param {string} symbol unified outcome symbol
     * @param {object} [params] extra params (unused)
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchTicker (symbol: Str, params = {}): Promise<Ticker> {
        const outcome = symbol;
        await this.loadMarkets ();
        const outcomeObj = this.outcome (outcome);
        const tokenId = this.safeString (outcomeObj, 'id');
        symbol = this.safeString (outcomeObj, 'symbol');
        const messageHash = 'ticker::' + symbol;
        const subscribeHash = 'subscribe::' + tokenId;
        const subscribeMsg = { 'operation': 'subscribe', 'assets_ids': [ tokenId ] };
        if (this.orderbooks[symbol] === undefined) {
            this.orderbooks[symbol] = this.orderBook ([]);
        }
        const url = this.urls['api']['ws'];
        const orderbook = await this.watch (url, messageHash, subscribeMsg, subscribeHash);
        const bids = orderbook['bids'] as any;
        const asks = orderbook['asks'] as any;
        let bestBid = undefined;
        let bestBidVolume = undefined;
        let bidsLength = 0;
        if (bids !== undefined) {
            bidsLength = bids.length;
        }
        if ((bids !== undefined) && (bidsLength > 0)) {
            bestBid = bids[0][0];
            bestBidVolume = bids[0][1];
        }
        let bestAsk = undefined;
        let bestAskVolume = undefined;
        let asksLength = 0;
        if (asks !== undefined) {
            asksLength = asks.length;
        }
        if ((asks !== undefined) && (asksLength > 0)) {
            bestAsk = asks[0][0];
            bestAskVolume = asks[0][1];
        }
        let mid = undefined;
        if ((bestBid !== undefined) && (bestAsk !== undefined)) {
            const sum = Precise.stringAdd (this.numberToString (bestBid), this.numberToString (bestAsk));
            mid = this.parseNumber (Precise.stringDiv (sum, '2'));
        } else if (bestBid !== undefined) {
            mid = bestBid;
        } else {
            mid = bestAsk;
        }
        const market = this.safeMarket (symbol);
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': orderbook['timestamp'],
            'datetime': orderbook['datetime'],
            'high': undefined,
            'low': undefined,
            'bid': bestBid,
            'bidVolume': bestBidVolume,
            'ask': bestAsk,
            'askVolume': bestAskVolume,
            'vwap': undefined,
            'open': undefined,
            'close': mid,
            'last': mid,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': mid,
            'baseVolume': undefined,
            'quoteVolume': undefined,
            'info': orderbook,
        }, market);
    }

    tokenIdToSymbol (tokenId: string): Str {
        if (!tokenId) {
            return undefined;
        }
        const marketsById = this.markets_by_id as any;
        const market = (marketsById !== undefined) ? marketsById[tokenId] : undefined;
        return market ? (market['symbol'] as string) : undefined;
    }

    parsePolyTimestamp (raw: Str): number {
        if (raw === undefined) {
            return this.milliseconds ();
        }
        const n = this.parseToInt (raw);
        if (n === undefined) {
            return this.milliseconds ();
        }
        return n;
    }
}
