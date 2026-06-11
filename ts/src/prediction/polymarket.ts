import Exchange from '../abstract/prediction/polymarket.js';
import { sha256 } from '../static_dependencies/noble-hashes/sha256.js';
import type {
    Int, Str, Num, Dict,
    Market, Ticker, Tickers, OrderBook, Trade, OHLCV,
    Order, Balances, Position,
    Strings,
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
            'pro': false,
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
                'fetchTrades': true,
                'fetchWithdrawals': false,
                'prediction': true,         // Prediction market support
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
                },
                'www': 'https://polymarket.com',
                'doc': [ 'https://docs.polymarket.com' ],
                'fees': 'https://docs.polymarket.com/#fees',
            },
            'api': {
                'gamma': {
                    'public': {
                        'get': {
                            'events': 1,
                            'events/{id}': 1,
                            'events/slug/{slug}': 1,
                            'markets': 1,
                            'markets/{id}': 1,
                            'public-search': 1,
                        },
                    },
                },
                'clob': {
                    'public': {
                        'get': {
                            'book': 1,
                            'prices-history': 1,
                            'data/trades': 1,
                            'price': 1,
                            'midpoint': 1,
                            'spread': 1,
                        },
                    },
                    'private': {
                        'get': {
                            'data/orders': 1,
                            'data/order/{id}': 1,
                        },
                        'post': {
                            'order': 1,
                        },
                        'delete': {
                            'order': 1,
                            'orders': 1,
                        },
                    },
                },
                'data': {
                    'public': {
                        'get': {
                            'trades': 1,
                        },
                    },
                    'private': {
                        'get': {
                            'positions': 1,
                            'value': 1,
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

    async fetchMarkets (params = {}): Promise<Market[]> {
        const queries = this.safeList (params, 'queries', []) as any[];
        const rest0 = this.omit (params, [ 'queries' ]);
        let pageSize = 0;
        const flatMarkets: Market[] = [];
        const eventsDict: Dict = {};
        const queriesLength = queries.length;
        if (queries && queriesLength > 0) {
            pageSize = this.safeInteger (rest0, 'limit', 50);
            const searchRest = this.omit (rest0, [ 'limit' ]);
            const seen: Dict = {};
            const rawEvents: any[] = [];
            for (let qi = 0; qi < queries.length; qi++) {
                const q = queries[qi];
                const baseRequest1: Dict = { 'q': q, 'limit_per_type': pageSize, 'events_status': 'active' };
                let firstRequest: Dict = { 'page': 1 };
                firstRequest = this.extend (this.extend (firstRequest, baseRequest1), searchRest);
                const first = await this.gammaPublicGetPublicSearch (firstRequest);
                const firstEvents = this.safeList (first, 'events', []) as any[];
                const firstEventsLength = firstEvents.length;
                const pagination = this.safeValue (first, 'pagination', {});
                const totalResults = this.safeInteger (pagination, 'totalResults', firstEventsLength);
                const totalPages = Math.ceil (totalResults / pageSize);
                const remaining: number[] = [];
                for (let p = 2; p <= totalPages; p++) {
                    remaining.push (p);
                }
                const restPromises: any[] = [];
                for (let pi = 0; pi < remaining.length; pi++) {
                    let pageRequest: Dict = { 'page': remaining[pi] };
                    pageRequest = this.extend (this.extend (pageRequest, baseRequest1), searchRest);
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
        pageSize = this.safeInteger (this.options, 'maxFetchEventsLimit', 500);
        const maxPages = 20;
        const status = this.safeString (rest0, 'status', this.safeString (this.options, 'defaultEventStatus', 'active'));
        const rest = this.omit (rest0, [ 'status' ]);
        let baseRequest: Dict = { 'limit': pageSize, 'order': 'volume24hr', 'ascending': false };
        baseRequest = this.extend (baseRequest, rest);
        if (status === 'active') {
            baseRequest['active'] = true;
        } else if (status === 'closed') {
            baseRequest['closed'] = true;
        }
        // Fetch page 1 first; if full, fire remaining pages in parallel
        let firstPageRequest: Dict = { 'offset': 0 };
        firstPageRequest = this.extend (firstPageRequest, baseRequest);
        const firstPageResponse = await this.gammaPublicGetEvents (firstPageRequest);
        const firstPage = (firstPageResponse !== undefined) ? firstPageResponse : [];
        const firstPageLength = firstPage.length;
        const allRawEvents: any[] = [];
        for (let fi = 0; fi < firstPage.length; fi++) {
            allRawEvents.push (firstPage[fi]);
        }
        if (firstPageLength >= pageSize) {
            const offsets: number[] = [];
            for (let p = 1; p < maxPages; p++) {
                offsets.push (p * pageSize);
            }
            const restPromises2: any[] = [];
            for (let oi = 0; oi < offsets.length; oi++) {
                let pageRequest: Dict = { 'offset': offsets[oi] };
                pageRequest = this.extend (pageRequest, baseRequest);
                restPromises2.push (this.gammaPublicGetEvents (pageRequest));
            }
            const restPages = await Promise.all (restPromises2);
            for (let ri2 = 0; ri2 < restPages.length; ri2++) {
                const page = (restPages[ri2] !== undefined) ? restPages[ri2] : [];
                for (let pi2 = 0; pi2 < page.length; pi2++) {
                    allRawEvents.push (page[pi2]);
                }
            }
        }
        for (let rei = 0; rei < allRawEvents.length; rei++) {
            const rawEvent = allRawEvents[rei];
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
     * Fetches the current mid-price and best bid/ask for a single outcome token.
     * @param outcome the unified symbol like TRUMP_DANCE_TODAY_997:YES or outcomeId like 16718041887881762329859205887704087070587186248220606272297433440108449709696
     * @param params
     * @see https://docs.polymarket.com/api-reference/data/get-midpoint-price
     * @see https://docs.polymarket.com/api-reference/market-data/get-order-book
     */
    async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        const outcome = symbol;
        await this.checkEventsAndMarkets (outcome);
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
     * Fetches tickers for multiple outcome tokens sequentially.
     * @param outcomes
     * @param params
     * @see https://docs.polymarket.com/api-reference/data/get-midpoint-price
     */
    async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        const outcomes = symbols;
        let outcomesLength = 0;
        if (outcomes !== undefined) {
            outcomesLength = outcomes.length;
        }
        if (outcomesLength > 0) {
            for (let i = 0; i < outcomes.length; i++) {
                await this.checkEventsAndMarkets (outcomes[i]);
            }
        } else {
            await this.checkEventsAndMarkets ();
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
        const result: Tickers = {};
        for (let i = 0; i < targets.length; i++) {
            const outcomeSymbol = targets[i];
            const ticker = await this.fetchTicker (outcomeSymbol, params);
            result[outcomeSymbol] = ticker;
        }
        return result;
    }

    /**
     * Parses a combined midpoint + order book response into a unified CCXT Ticker object.
     * @param ticker
     * @param market
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
        const midpointData = this.safeValue (ticker, 'midpoint', {});
        const bookData = this.safeValue (ticker, 'book', {});
        const mid = this.safeNumber (midpointData, 'mid');
        const bids = this.safeList (bookData, 'bids', []) as any[];
        const asks = this.safeList (bookData, 'asks', []) as any[];
        const bidsLength = bids.length;
        const asksLength = asks.length;
        const bestBid = bidsLength ? this.safeNumber (bids[0], 'price') : undefined;
        const bestAsk = asksLength ? this.safeNumber (asks[0], 'price') : undefined;
        const symbol = this.safeSymbol (undefined, market);
        const now = this.milliseconds ();
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': now,
            'datetime': this.iso8601 (now),
            'high': undefined,
            'low': undefined,
            'bid': bestBid,
            'bidVolume': bidsLength ? this.safeNumber (bids[0], 'size') : undefined,
            'ask': bestAsk,
            'askVolume': asksLength ? this.safeNumber (asks[0], 'size') : undefined,
            'vwap': undefined,
            'open': undefined,
            'close': mid,
            'last': mid,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': mid,
            'baseVolume': undefined,
            'quoteVolume': market ? this.safeNumber (market['info'], 'volume24h') : undefined,
            'info': ticker,
        }, market);
    }

    /**
     * Fetches the CLOB order book for a single outcome token.
     * @param {string} outcome id or symbol
     * @param {int} [limit] the maximum number of bids/asks to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @see https://docs.polymarket.com/api-reference/market-data/get-order-book
     */
    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        const outcome = symbol;
        await this.checkEventsAndMarkets (outcome);
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
     * Fetches price history ticks for a single outcome token, buckets them client-side
     * into true OHLCV candles (snapping tick timestamps to the candle boundary), and returns
     * a sorted array of OHLCV tuples.
     * @param outcome
     * @param timeframe
     * @param since
     * @param limit
     * @param params
     * @see https://docs.polymarket.com/api-reference/markets/get-prices-history
     */
    async fetchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        const outcome = symbol;
        await this.checkEventsAndMarkets (outcome);
        const outcomeObj = this.outcome (outcome);
        const tokenId = outcomeObj['id'] as string;
        const fidelityMin = this.safeInteger (this.timeframes, timeframe, 1); // fidelity in minutes
        const nowS = this.seconds ();
        let startS: number;
        let endS: number = nowS;
        if (since !== undefined) {
            startS = this.parseToInt (since / 1000);
            if (limit !== undefined) {
                const endBound = startS + limit * fidelityMin * 60;
                endS = endBound < nowS ? endBound : nowS;
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
                candle[5] = (candle[5] as number) + vol;           // volume
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
     * Fetches public trade history for a single outcome token from the CLOB data endpoint.
     * @param outcome
     * @param since
     * @param limit
     * @param params
     * @see https://docs.polymarket.com/api-reference/core/get-trades-for-a-user-or-markets
     */
    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        const outcome = symbol;
        await this.checkEventsAndMarkets (outcome);
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
     * Parses a raw CLOB trade object into a unified CCXT Trade object.
     * @param trade
     * @param market
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
     * Fetches the authenticated user's USDC portfolio value from the Data API.
     * @param params
     * @see https://docs.polymarket.com/api-reference/core/get-total-value-of-a-users-positions
     */
    async fetchBalance (params = {}): Promise<Balances> {
        await this.checkEventsAndMarkets ();
        const request: Dict = {
            'user': this.walletAddress,
        };
        const response = await this.dataPrivateGetValue (this.extend (request, params));
        return this.parseBalance (response);
    }

    /**
     * Parses a portfolio value response into a CCXT Balances object with a USDC entry.
     * @param response
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
     * Fetches open outcome token positions for the authenticated user from the Data API.
     * @param outcomes
     * @param params
     * @see https://docs.polymarket.com/api-reference/core/get-current-positions-for-a-user
     */
    async fetchPositions (symbols: Strings = undefined, params = {}): Promise<Position[]> {
        const outcomes = symbols;
        let outcomesLength = 0;
        if (outcomes !== undefined) {
            outcomesLength = outcomes.length;
        }
        if (outcomesLength > 0) {
            for (let i = 0; i < outcomes.length; i++) {
                await this.checkEventsAndMarkets (outcomes[i]);
            }
        } else {
            await this.checkEventsAndMarkets ();
        }
        if (this.walletAddress === undefined) {
            throw new ArgumentsRequired (this.id + ' walletAddress is required to fetchPositions');
        }
        const request = {
            'user': this.walletAddress,
        };
        const response = await this.dataPrivateGetPositions (this.extend (request, params));
        const positions = this.safeList (response, 'data', []) as any[];
        return this.parsePositions (positions, outcomes);
    }

    /**
     * Parses a raw Data API position object into a unified CCXT Position object.
     * @param position
     * @param market
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
     * Fetches open resting orders for the authenticated user, optionally filtered by outcome token.
     * @param outcome
     * @param since
     * @param limit
     * @param params
     * @see https://docs.polymarket.com/api-reference/trade/get-user-orders
     */
    async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        const outcome = symbol;
        if (outcome !== undefined) {
            await this.checkEventsAndMarkets (outcome);
        } else {
            await this.checkEventsAndMarkets ();
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
     * Fetches a single order by ID from the CLOB private data endpoint.
     * @param id
     * @param symbol
     * @param params
     * @see https://docs.polymarket.com/api-reference/trade/get-single-order-by-id
     */
    async fetchOrder (id: Str, symbol: Str = undefined, params = {}): Promise<Order> {
        const outcome = symbol;
        if (outcome !== undefined) {
            await this.checkEventsAndMarkets (outcome);
        } else {
            await this.checkEventsAndMarkets ();
        }
        const request: Dict = { 'id': id };
        const response = await this.clobPrivateGetDataOrderId (this.extend (request, params));
        return this.parseOrder (response);
    }

    /**
     * Parses a raw CLOB order object into a unified CCXT Order object.
     * @param order
     * @param market
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
     * Maps a Polymarket order status string to the CCXT unified status vocabulary.
     * @param status
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
     * Places a limit or market order on the Polymarket CLOB for the given outcome token.
     * @param outcome
     * @param type
     * @param side
     * @param amount
     * @param price
     * @param params
     * @see https://docs.polymarket.com/api-reference/trade/post-a-new-order
     */
    async createOrder (symbol: string, type: Str, side: Str, amount: Num, price: Num = undefined, params = {}): Promise<Order> {
        const outcome = symbol;
        await this.checkEventsAndMarkets (outcome);
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
     * Cancels a single open order by ID on the Polymarket CLOB.
     * @param id
     * @param symbol
     * @param params
     * @see https://docs.polymarket.com/api-reference/trade/cancel-single-order
     */
    async cancelOrder (id: Str, symbol: Str = undefined, params = {}): Promise<Order> {
        const outcome = symbol;
        await this.checkEventsAndMarkets (outcome);
        const request: Dict = { 'order_id': id };
        const response = await this.clobPrivateDeleteOrder (this.extend (request, params));
        return this.parseOrder (response);
    }

    /**
     * Cancels all open orders on the Polymarket CLOB, optionally scoped to one outcome token.
     * @param outcome
     * @param params
     * @see https://docs.polymarket.com/api-reference/trade/cancel-all-orders
     */
    async cancelAllOrders (symbol: Str = undefined, params = {}): Promise<Order[]> {
        const outcome = symbol;
        await this.checkEventsAndMarkets (outcome);
        const request: Dict = {};
        if (outcome !== undefined) {
            const outcomeObj = this.outcome (outcome);
            request['asset_id'] = outcomeObj['id'];
        }
        const response = await this.clobPrivateDeleteOrders (this.extend (request, params));
        return this.parseOrders (response);
    }

    /**
     * Fetches events matching the given search terms via the Gamma public-search endpoint and
     * merges them into this.events and this.markets; with no queries, fetches all active events.
     * Returns the full this.events dict (all cached events, not just the newly fetched ones).
     * @param queries
     * @param params
     * @see https://docs.polymarket.com/api-reference/search/search-markets-events-and-profiles
     */
    async fetchEvents (queries: Strings = undefined, params = {}): Promise<any> {
        queries = (queries === undefined) ? [] : queries;
        const pageSize = this.safeInteger (params, 'limit', 50);
        const rest = this.omit (params, [ 'limit' ]);
        // For each query: fetch page 1, then all remaining pages in parallel
        const seen: Dict = {};
        const rawEvents: any[] = [];
        for (let qi = 0; qi < queries.length; qi++) {
            const q = queries[qi];
            const baseRequest: Dict = { 'q': q, 'limit_per_type': pageSize, 'events_status': 'active' };
            const firstRequest: Dict = { 'page': 1 };
            const first = await this.gammaPublicGetPublicSearch (this.extend (this.extend (firstRequest, baseRequest), rest));
            const firstEvents = this.safeList (first, 'events', []) as any[];
            const firstEventsLength = firstEvents.length;
            const pagination = this.safeValue (first, 'pagination', {});
            const totalResults = this.safeInteger (pagination, 'totalResults', firstEventsLength);
            const totalPages = Math.ceil (totalResults / pageSize);
            const remainingPages: number[] = [];
            for (let p = 2; p <= totalPages; p++) {
                remainingPages.push (p);
            }
            const restPromises3: any[] = [];
            for (let pi3 = 0; pi3 < remainingPages.length; pi3++) {
                const pageRequest: Dict = { 'page': remainingPages[pi3] };
                restPromises3.push (this.gammaPublicGetPublicSearch (this.extend (this.extend (pageRequest, baseRequest), rest)));
            }
            const restResponses = await Promise.all (restPromises3);
            const allEvents = this.arrayConcat ([], firstEvents);
            for (let ri3 = 0; ri3 < restResponses.length; ri3++) {
                const pageEvents3 = this.safeList (restResponses[ri3], 'events', []) as any[];
                for (let ei3 = 0; ei3 < pageEvents3.length; ei3++) {
                    allEvents.push (pageEvents3[ei3]);
                }
            }
            for (let aei = 0; aei < allEvents.length; aei++) {
                const rawEvent = allEvents[aei];
                const eventId = this.safeString (rawEvent, 'id');
                if (eventId && !(eventId in seen)) {
                    seen[eventId] = true;
                    rawEvents.push (rawEvent);
                }
            }
        }
        // Parse and merge into class-level caches
        if (!this.events) {
            this.events = {};
        }
        if (!this.markets) {
            this.markets = this.createSafeDictionary ();
        }
        for (let rei = 0; rei < rawEvents.length; rei++) {
            const rawEvent = rawEvents[rei];
            let eventForParsing = rawEvent;
            let ccxtMarkets = this.parseEventToMarkets (eventForParsing);
            const ccxtMarketsLength = ccxtMarkets.length;
            if (ccxtMarketsLength === 0) {
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
        return this.events;
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
     * Parses an array of raw Gamma event objects into unified CCXT event objects.
     * @param rawEvents
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
     * Builds the request URL and attaches HMAC-SHA256 authentication headers for private endpoints.
     * @param path
     * @param api
     * @param method
     * @param params
     * @param headers
     * @param body
     */
    sign (path: any, api: any = 'gamma', method = 'GET', params = {}, headers: any = undefined, body: any = undefined) {
        // api is either a string ('gamma') or array (['gamma', 'public'])
        const apiGroup: string = typeof api === 'string' ? api : api[0];
        const access: string = typeof api === 'string' ? 'public' : api[1];
        const baseUrls = this.urls['api'] as Dict;
        const baseUrl = this.safeString (baseUrls, apiGroup, baseUrls['gamma'] as string);
        let url = baseUrl + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        const querystring = this.urlencode (query);
        if (method === 'GET' && querystring) {
            url += '?' + querystring;
        }
        const headerDefaults = (headers !== undefined) ? headers : {};
        headers = this.extend ({
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        }, headerDefaults);
        if (access === 'private') {
            this.checkRequiredCredentials ();
            const timestamp = this.seconds ().toString ();
            const signature = this.hmac (
                this.encode (timestamp + method + '/' + path),
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
            if (method !== 'GET' && querystring) {
                body = query as any;
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}
