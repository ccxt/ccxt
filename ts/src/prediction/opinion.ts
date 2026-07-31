import { keccak_256 as keccak } from '@noble/hashes/sha3.js';
import { secp256k1 } from '@noble/curves/secp256k1.js';
import Exchange from '../abstract/prediction/opinion.js';
import { ecdsa } from '../base/functions/crypto.js';
import type { Dict, Int, Market, OHLCV, PredictionEvent, PredictionOrderBook, PredictionTicker, PredictionTickers, Strings, fetchEventsParams } from '../base/types.js';
import { AuthenticationError, ArgumentsRequired, BadRequest } from '../base/errors.js';

// ---------------------------------------------------------------------------

/**
 * @class opinion
 * @augments Exchange
 */
export default class opinion extends Exchange {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'opinion',
            'name': 'Opinion',
            'countries': [ 'HK' ],
            'rateLimit': 67, // 15 requests per second per API key
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
                'fetchOHLCV': true,
                'fetchOrderBook': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'prediction': true,
            },
            'timeframes': {
                // live-verified via GET /token/price-history: only 1h/1d are recognized,
                // any other interval value (including 1m/1w) silently falls back to 1d
                '1h': '1h',
                '1d': '1d',
            },
            'urls': {
                'logo': '', // todo
                'api': {
                    'opinion': 'https://openapi.opinion.trade/openapi',
                },
                'www': 'https://opinion.trade',
                'doc': [ 'https://docs.opinion.trade' ],
            },
            'api': {
                'opinion': {
                    'public': {
                        'get': {
                            'market': 1,
                            'market/{marketId}': 1,
                            'market/categorical/{marketId}': 1,
                            'market/slug/{slug}': 1,
                            'label': 1,
                            'token/latest-price': 1,
                            'token/orderbook': 1,
                            'token/price-history': 1,
                            'quoteToken': 1,
                        },
                    },
                    'private': {
                        'get': {
                            'order': 1,
                            'order/{orderId}': 1,
                            'positions/user/{walletAddress}': 1,
                            'trade/user/{walletAddress}': 1,
                            'auth/api-key': 1,
                        },
                        'post': {
                            'auth/api-key': 1,
                        },
                        'delete': {
                            'auth/api-key': 1,
                        },
                    },
                },
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': false,
                'walletAddress': true,
                'privateKey': true,
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': -0.02,
                    'taker': 0.04,
                },
            },
            'exceptions': {
                'exact': {
                    '11001': AuthenticationError, // "This API Key has no related Opinion Login Wallet yet"
                    '11002': AuthenticationError, // "Invalid API key"
                },
                'broad': {},
            },
            'options': {
                'eventScopeParams': [ 'labelId' ],
                'defaultFetchEventsLimit': 20,
                'marketsPageLimit': 20,
                'maxMarketsPages': 50,
            },
        });
    }

    /**
     * @method
     * @name opinion#fetchMarkets
     * @description fetches every kind of Opinion market (standalone binaries and categorical parents);
     * categorical parents double as our unified "events" and are cached into this.events as a side effect
     * @see https://docs.opinion.trade/developer-guide/opinion-open-api/market
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.limit] max number of markets to collect (defaults to options.maxMarketsPages, 1000); caps the pages fetched
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets (params = {}): Promise<Market[]> {
        const rest = this.omit (params, [ 'limit' ]);
        const userLimit = this.safeInteger (params, 'limit');
        const pageLimit = this.safeInteger (this.options, 'marketsPageLimit', 20);
        const maxPages = this.safeInteger (this.options, 'maxMarketsPages', 50);
        const flatMarkets: Market[] = [];
        const eventsDict: Dict = {};
        let page = 1;
        let fetchedRawCount = 0;
        while (true) {
            const request: Dict = {
                'marketType': 2, // all - both standalone binaries and categorical parents
                'limit': pageLimit,
                'page': page,
            };
            const response = await this.opinionPublicGetMarket (this.extend (request, rest));
            const result = this.safeDict (response, 'result', {});
            const rawMarkets = this.safeList (result, 'list', []);
            const rawMarketsLength = rawMarkets.length;
            fetchedRawCount = this.sum (fetchedRawCount, rawMarketsLength);
            // categorical parents expand into several flatMarkets entries each, so the raw,
            // unflattened row count in 'total' must be compared against fetchedRawCount, not
            // flatMarkets.length - otherwise expansion makes the comparison meaningless
            const total = this.safeInteger (result, 'total');
            for (let i = 0; i < rawMarketsLength; i++) {
                const raw = rawMarkets[i];
                const marketType = this.safeInteger (raw, 'marketType');
                if (marketType === 1) {
                    const event: any = this.parseEvent (raw);
                    const childMarkets = event['markets'];
                    const childMarketsLength = childMarkets.length;
                    for (let ci = 0; ci < childMarketsLength; ci++) {
                        flatMarkets.push (childMarkets[ci] as unknown as Market);
                    }
                    eventsDict[event['event']] = event;
                } else {
                    flatMarkets.push (this.parseOpinionMarket (raw));
                }
            }
            const collectedLength = flatMarkets.length;
            if ((rawMarketsLength < pageLimit) || (page >= maxPages) || ((total !== undefined) && (fetchedRawCount >= total)) || ((userLimit !== undefined) && (collectedLength >= userLimit))) {
                break;
            }
            page = this.sum (page, 1);
        }
        this.events = eventsDict;
        const flatMarketsLength = flatMarkets.length;
        if ((userLimit !== undefined) && (flatMarketsLength > userLimit)) {
            return this.arraySlice (flatMarkets, 0, userLimit);
        }
        return flatMarkets;
    }

    /**
     * @ignore
     * @method
     * @name opinion#parseOpinionMarket
     * @description converts a single raw opinion market (standalone binary, or one categorical child) into one ccxt market with yes/no outcomes
     * @param {object} raw the raw opinion market object
     * @param {string} [eventSlug] the slug of the parent event
     * @returns {object} a [market structure](https://docs.ccxt.com/#/?id=market-structure)
     */
    parseOpinionMarket (raw: Dict, eventSlug: string = undefined): Market {
        // {
        //     "chainId": "56",
        //     "conditionId": "469db44df1309dac7cf9fcaa142562f3c89719d47277e095d021c1561166539a",
        //     "createdAt": 1778750719,
        //     "cutoffAt": 0,
        //     "isResolvableByAI": true,
        //     "marketId": 16565,
        //     "marketTitle": "10–15s",
        //     "noLabel": "No",
        //     "noTokenId": "48641131337815600205538397357674754469573755318952418769815647071528778171134",
        //     "questionId": "63907f471c045499f69b5ea157bdea1942f9d53b6e5e767ae69f4d148aeeefae",
        //     "quoteToken": "0x55d398326f99059fF775485246999027B3197955",
        //     "rebate": {
        //         "maker": 0.5
        //     },
        //     "resolvedAt": 1779342061,
        //     "resultTokenId": "107063188116504514729209026208703521982564071792212276771696073817845504321279",
        //     "rules": "",
        //     "slug": "how-long-will-trump-and-xi-shake-hands-when-they-meet-10-15s",
        //     "status": 4,
        //     "statusEnum": "Resolved",
        //     "volume": "50",
        //     "yesLabel": "Yes",
        //     "yesTokenId": "107063188116504514729209026208703521982564071792212276771696073817845504321279"
        // }
        const marketId = this.safeString (raw, 'marketId');
        const slug = this.safeString (raw, 'slug');
        let effectiveEventSlug = eventSlug;
        if ((eventSlug !== undefined) && (slug !== undefined) && (slug.indexOf (eventSlug) === 0)) {
            effectiveEventSlug = undefined;
        }
        const marketSymbol = this.slugToMarketSymbol (effectiveEventSlug, slug);
        const statusEnum = this.safeString (raw, 'statusEnum');
        const active = (statusEnum === 'Activated');
        const resolved = (statusEnum === 'Resolved');
        const resultTokenId = this.safeString (raw, 'resultTokenId');
        const hasResult = resolved && (resultTokenId !== undefined) && (resultTokenId !== '');
        const outcomeLabels = [
            this.safeString (raw, 'yesLabel', 'YES'),
            this.safeString (raw, 'noLabel', 'NO'),
        ];
        const outcomeTokenIds = [
            this.safeString (raw, 'yesTokenId'),
            this.safeString (raw, 'noTokenId'),
        ];
        const outcomes: any[] = [];
        let resolvedOutcome = undefined;
        for (let i = 0; i < outcomeLabels.length; i++) {
            const label = outcomeLabels[i];
            const tokenId = outcomeTokenIds[i];
            const outcomeHandle = this.slugToOutcomeSymbol (effectiveEventSlug, slug, label);
            let winner = undefined;
            let settleFraction = undefined;
            if (hasResult) {
                winner = (tokenId === resultTokenId);
                settleFraction = winner ? 1 : 0;
                if (winner) {
                    resolvedOutcome = outcomeHandle;
                }
            }
            outcomes.push ({
                'id': tokenId,
                'outcomeId': tokenId,
                'outcome': outcomeHandle,
                'market': marketSymbol,
                'label': label,
                'active': active,
                'winner': winner,
                'settleFraction': settleFraction,
                'info': raw,
            });
        }
        // effectively-final copy for the market object literal below (reassigned in the loop)
        const marketResolvedOutcome = resolvedOutcome;
        const expiryTimestamp = this.safeTimestamp (raw, 'cutoffAt');
        const created = this.safeTimestamp (raw, 'createdAt');
        return {
            'id': marketId,
            'market': marketSymbol,
            // no real base asset (an outcome share, not a currency) - baseId is the market's own
            // id, matching kalshi/polymarket. collateral is BSC USDT (0x55d398...) on every market
            // observed live; quoteId uses the symbol like kalshi/polymarket do, not the raw address
            'base': 'USDT',
            'quote': 'USDT',
            'settle': undefined,
            'baseId': marketId,
            'quoteId': 'USDT',
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
            'resolvedOutcome': marketResolvedOutcome,
            'contract': false,
            'linear': undefined,
            'inverse': undefined,
            'contractSize': undefined,
            'expiry': expiryTimestamp,
            'expiryDatetime': this.iso8601 (expiryTimestamp),
            'strike': undefined,
            'optionType': undefined,
            'taker': this.fees['trading']['taker'],
            'maker': this.fees['trading']['maker'],
            'percentage': true,
            'tierBased': false,
            'feeSide': 'get',
            'precision': {
                'amount': undefined,
                'price': undefined,
            },
            'limits': {
                'leverage': { 'min': 1, 'max': 1 },
                'amount': { 'min': undefined, 'max': undefined },
                'price': { 'min': 0, 'max': 1 },
                'cost': { 'min': undefined, 'max': undefined },
            },
            'outcomes': outcomes,
            'info': raw,
            'created': created,
        } as unknown as Market;
    }

    /**
     * @method
     * @name opinion#fetchEvents
     * @description fetches Opinion's categorical markets (our unified "events") - scope required via query/queries/tags/eventId/slug/labelId
     * @see https://docs.opinion.trade/developer-guide/opinion-open-api/market
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.labelId] filter by Opinion category label id, used verbatim - call GET /label directly to discover valid ids
     * @returns {object[]} an array of event structures
     */
    async fetchEvents (params: fetchEventsParams = {}): Promise<PredictionEvent[]> {
        this.requireEventQuery (params);
        const queries = this.parseSearchQueries (params);
        const eventId = this.safeString (params, 'eventId');
        const slug = this.safeString (params, 'slug');
        if ((eventId !== undefined) || (slug !== undefined)) {
            const singleRest = this.omit (params, [ 'eventId', 'slug', 'query', 'queries', 'tags', 'status', 'sort', 'searchIn', 'limit' ]);
            let singleResponse = undefined;
            if (slug !== undefined) {
                singleResponse = await this.opinionPublicGetMarketSlugSlug (this.extend ({ 'slug': slug }, singleRest));
            } else {
                singleResponse = await this.opinionPublicGetMarketCategoricalMarketId (this.extend ({ 'marketId': eventId }, singleRest));
            }
            const singleResult = this.safeDict (singleResponse, 'result', {});
            const singleData = this.safeDict (singleResult, 'data', {});
            const single = this.parseEvent (singleData);
            this.indexEventOutcomes (single);
            return this.applyEventFetchParams ([ single ], params, queries);
        }
        const rest = this.omit (params, [ 'query', 'queries', 'tags', 'status', 'sort', 'searchIn', 'limit' ]);
        const pageLimit = this.safeInteger (this.options, 'defaultFetchEventsLimit', 20);
        const limit = Math.min (this.safeInteger (params, 'limit', pageLimit), pageLimit);
        const request: Dict = {
            'marketType': 1, // categorical only - these are the ones with childMarkets, our unified "event"
            'limit': limit,
            'page': 1,
        };
        const response = await this.opinionPublicGetMarket (this.extend (request, rest));
        const result = this.safeDict (response, 'result', {});
        const rawEvents = this.safeList (result, 'list', []);
        const rawEventsLength = rawEvents.length;
        const parsedEvents: any[] = [];
        if (this.markets === undefined) {
            this.markets = this.createSafeDictionary ();
        }
        for (let i = 0; i < rawEventsLength; i++) {
            const event: any = this.parseEvent (rawEvents[i]);
            parsedEvents.push (event);
            // register the parsed markets so populateOutcomes can index their outcomes
            const eventMarkets = this.safeList (event, 'markets', []);
            const eventMarketsLength = eventMarkets.length;
            for (let mi = 0; mi < eventMarketsLength; mi++) {
                const m = eventMarkets[mi];
                this.markets[m['market']] = m;
            }
        }
        this.populateOutcomes ();
        return this.applyEventFetchParams (parsedEvents, params, queries);
    }

    /**
     * @method
     * @name opinion#fetchEvent
     * @description fetches a single prediction-market event by its market id, or slug
     * @see https://docs.opinion.trade/developer-guide/opinion-open-api/market
     * @param {string} id the numeric marketId, or the market slug
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [prediction event structure](https://docs.ccxt.com/#/?id=prediction-event-structure)
     */
    async fetchEvent (id: string, params = {}): Promise<PredictionEvent> {
        const isSlug = (id.indexOf ('-') >= 0);
        let response = undefined;
        if (isSlug) {
            response = await this.opinionPublicGetMarketSlugSlug (this.extend ({ 'slug': id }, params));
        } else {
            response = await this.opinionPublicGetMarketCategoricalMarketId (this.extend ({ 'marketId': id }, params));
        }
        const result = this.safeDict (response, 'result', {});
        const data = this.safeDict (result, 'data', {});
        const event: any = this.parseEvent (data);
        this.indexEventOutcomes (event);
        return event;
    }

    parseEvent (rawEvent: Dict): any {
        // {
        //     "chainId": "56",
        //     "childMarkets": [
        //         {
        //             "chainId": "56",
        //             "conditionId": "469db44df1309dac7cf9fcaa142562f3c89719d47277e095d021c1561166539a",
        //             "createdAt": 1778750719,
        //             "cutoffAt": 0,
        //             "isResolvableByAI": true,
        //             "marketId": 16565,
        //             "marketTitle": "10–15s",
        //             "noLabel": "No",
        //             "noTokenId": "48641131337815600205538397357674754469573755318952418769815647071528778171134",
        //             "questionId": "63907f471c045499f69b5ea157bdea1942f9d53b6e5e767ae69f4d148aeeefae",
        //             "quoteToken": "0x55d398326f99059fF775485246999027B3197955",
        //             "rebate": {
        //                 "maker": 0.5
        //             },
        //             "resolvedAt": 1779342061,
        //             "resultTokenId": "107063188116504514729209026208703521982564071792212276771696073817845504321279",
        //             "rules": "",
        //             "slug": "how-long-will-trump-and-xi-shake-hands-when-they-meet-10-15s",
        //             "status": 4,
        //             "statusEnum": "Resolved",
        //             "volume": "50",
        //             "yesLabel": "Yes",
        //             "yesTokenId": "107063188116504514729209026208703521982564071792212276771696073817845504321279"
        //         },
        //         {
        //             "chainId": "56",
        //             "conditionId": "c4054e23e1afc96c93bbc05378414f8286b2f3e3107bb80944ba8a7581428812",
        //             "createdAt": 1778750720,
        //             "cutoffAt": 0,
        //             "isResolvableByAI": true,
        //             "marketId": 16566,
        //             "marketTitle": "15s+",
        //             "noLabel": "No",
        //             "noTokenId": "47010463515333704767569479601138504130354011266006912230152057656074556410652",
        //             "questionId": "3c78ac485d772b8241fd185f8b45ef9d7df9690d99ea59ed58927ade2f50b182",
        //             "quoteToken": "0x55d398326f99059fF775485246999027B3197955",
        //             "rebate": {
        //                 "maker": 0.5
        //             },
        //             "resolvedAt": 1779342061,
        //             "resultTokenId": "47010463515333704767569479601138504130354011266006912230152057656074556410652",
        //             "rules": "",
        //             "slug": "how-long-will-trump-and-xi-shake-hands-when-they-meet-15s-plus",
        //             "status": 4,
        //             "statusEnum": "Resolved",
        //             "volume": "50",
        //             "yesLabel": "Yes",
        //             "yesTokenId": "4219962057210945760892475434030882254029819241100485445656470801524365584613"
        //         }
        //     ],
        //     "conditionId": "",
        //     "coverUrl": "",
        //     "createdAt": 1778750719,
        //     "cutoffAt": 1778803200,
        //     "isResolvableByAI": false,
        //     "labelIds": [
        //         1
        //     ],
        //     "labels": [
        //         "Politics"
        //     ],
        //     "marketId": 788,
        //     "marketTitle": "How long will Trump and Xi shake hands when they meet?",
        //     "marketType": 1,
        //     "noLabel": "",
        //     "noTokenId": "",
        //     "questionId": "63907f471c045499f69b5ea157bdea1942f9d53b6e5e767ae69f4d148aeeefae",
        //     "quoteToken": "0x55d398326f99059fF775485246999027B3197955",
        //     "rebate": {
        //         "maker": 0.5
        //     },
        //     "resolvedAt": 0,
        //     "resultTokenId": "",
        //     "rules": "This market resolves based on the length of the longest qualifying handshake between Donald Trump and Xi Jinping on May 14, 2026 (Beijing local time), the day of their bilateral meeting at the Great Hall of the People.\nBaseline already established: Video footage from the welcome ceremony confirms a qualifying handshake within the 10–15s range. The remaining question is whether any additional handshake on the same day produces a longer measured duration.\nOutcomes:\n\n10–15s — resolves YES if no qualifying handshake on May 14, 2026 exceeds 15 seconds.\n15s+ — resolves YES if any qualifying handshake on May 14, 2026 is measured at more than 15 seconds.\n\nMeasurement: Duration is measured from the exact moment hands make initial physical contact until the exact moment either party breaks contact. Where multiple video sources exist, the highest-resolution footage is used; where measurements differ, the consensus reading across major media is applied. A duration falling exactly on the 15s boundary resolves to 15s+.\nQualifying handshake: voluntary, intentional, in-person; direct hand-to-hand contact (gloves permitted); clearly visible on video from start to finish. Fist bumps, hugs, waves, back pats, and other non-handshake contact are excluded from the measured duration even if they occur during the same greeting.\nResolution window: All qualifying handshakes occurring on May 14, 2026 in Beijing local time are eligible, including those at arrival, bilateral sessions, signing ceremonies, state dinners, and departure. Handshakes on any other date do not count.\nResolution source: video footage from May 14, 2026.",
        //     "slug": "how-long-will-trump-and-xi-shake-hands-when-they-meet",
        //     "status": 1,
        //     "statusEnum": "Created",
        //     "thumbnailUrl": "https://images.opinion.trade/0xf988d66bd9c46b69d33e2703f7264d3c2267136c/0xdf583bdff183f389d7c5d9c5d099127cabda824afd05d66059b8027ca775763d",
        //     "volume": "100.00",
        //     "volume24h": "100.00",
        //     "volume7d": "100.00",
        //     "yesLabel": "",
        //     "yesTokenId": ""
        // }
        const eventId = this.safeString (rawEvent, 'marketId');
        const slug = this.safeString (rawEvent, 'slug');
        const title = this.safeString (rawEvent, 'marketTitle');
        const eventHandle = (title !== undefined) ? this.shortenSlug (title) : this.shortenSlug (slug);
        const rawChildren = this.safeList (rawEvent, 'childMarkets', []);
        const rawChildrenLength = rawChildren.length;
        const marketsList: any[] = [];
        for (let i = 0; i < rawChildrenLength; i++) {
            marketsList.push (this.parseOpinionMarket (rawChildren[i], slug));
        }
        const statusEnum = this.safeString (rawEvent, 'statusEnum');
        const active = (statusEnum === 'Activated');
        const resolved = (statusEnum === 'Resolved');
        const end = this.safeTimestamp (rawEvent, 'cutoffAt');
        const created = this.safeTimestamp (rawEvent, 'createdAt');
        const labels = this.safeList (rawEvent, 'labels', []);
        return this.extend ({
            'id': eventId,
            'event': eventHandle,
            'title': title,
            'description': this.safeString (rawEvent, 'rules'),
            'slug': slug,
            'category': this.safeString (labels, 0),
            'tags': labels,
            'markets': marketsList,
            'active': active,
            'resolved': resolved,
            'volume': this.safeNumber (rawEvent, 'volume'),
            'created': created,
            'createdDatetime': this.iso8601 (created),
            'end': end,
            'endDatetime': this.iso8601 (end),
            'image': this.safeString2 (rawEvent, 'coverUrl', 'thumbnailUrl'),
            'info': rawEvent,
        });
    }

    /**
     * @method
     * @name opinion#fetchTicker
     * @description fetches the latest trade price and top of book for a single outcome token
     * @see https://docs.opinion.trade/developer-guide/opinion-open-api/token
     * @param {string} outcome unified outcome or outcome token id
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [prediction ticker structure](https://docs.ccxt.com/#/?id=prediction-ticker-structure)
     */
    async fetchTicker (outcome: string, params = {}): Promise<PredictionTicker> {
        const outcomeObj = await this.loadOutcome (outcome);
        const tokenId = outcomeObj['outcomeId'] as string;
        const promises = [
            this.opinionPublicGetTokenLatestPrice (this.extend ({ 'token_id': tokenId }, params)),
            this.opinionPublicGetTokenOrderbook ({ 'token_id': tokenId }),
        ];
        const [ priceResponse, bookResponse ] = await Promise.all (promises);
        const response: Dict = { 'price': priceResponse, 'book': bookResponse };
        return this.parsePredictionTicker (response, outcomeObj as any);
    }

    /**
     * @ignore
     * @method
     * @name opinion#parsePredictionTicker
     * @description parses a raw opinion latest-price + orderbook pair into a unified ticker object
     * @param {object} ticker a { price, book } dict of the two raw responses
     * @param {object} [market] the outcome object the ticker belongs to
     * @returns {object} a [prediction ticker structure](https://docs.ccxt.com/#/?id=prediction-ticker-structure)
     */
    parsePredictionTicker (ticker: Dict, market: Market = undefined): PredictionTicker {
        //
        //     {
        //         "price": {
        //             "errmsg": "",
        //             "errno": 0,
        //             "result": { "price": "0.002", "side": "buy-limit", "size": "205.03", "timestamp": 1766844546000, "tokenId": "..." }
        //         },
        //         "book": {
        //             "errmsg": "",
        //             "errno": 0,
        //             "result": { "asks": [ { "price": "0.999", "size": "5500" } ], "bids": [], "market": "...", "timestamp": ..., "tokenId": "..." }
        //         }
        //     }
        //
        const marketAny = market as any;
        const priceResponse = this.safeDict (ticker, 'price', {});
        const priceResult = this.safeDict (priceResponse, 'result', {});
        const bookResponse = this.safeDict (ticker, 'book', {});
        const bookResult = this.safeDict (bookResponse, 'result', {});
        const bids = this.safeList (bookResult, 'bids', []);
        const asks = this.safeList (bookResult, 'asks', []);
        const bestBid = this.safeDict (bids, 0, {});
        const bestAsk = this.safeDict (asks, 0, {});
        const last = this.safeNumber (priceResult, 'price');
        const timestamp = this.safeInteger (priceResult, 'timestamp', this.milliseconds ());
        return this.safePredictionTicker ({
            'outcome': this.safeString (marketAny, 'outcome'),
            'outcomeId': this.safeString2 (marketAny, 'outcomeId', 'id'),
            'label': this.safeString (marketAny, 'label'),
            'market': this.safeString2 (marketAny, 'market', 'outcome'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': undefined,
            'low': undefined,
            'bid': this.safeNumber (bestBid, 'price'),
            'bidVolume': this.safeNumber (bestBid, 'size'),
            'ask': this.safeNumber (bestAsk, 'price'),
            'askVolume': this.safeNumber (bestAsk, 'size'),
            'open': undefined,
            'close': last,
            'last': last,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': undefined,
            'info': ticker,
        }, market);
    }

    /**
     * @method
     * @name opinion#fetchTickers
     * @description fetches tickers for multiple outcome tokens - opinion has no all-tickers endpoint, each token needs its own latest-price + orderbook request
     * @see https://docs.opinion.trade/developer-guide/opinion-open-api/token
     * @param {string[]} outcomes unified outcomes or outcome token ids - required, opinion has no all-tickers endpoint
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures](https://docs.ccxt.com/#/?id=prediction-ticker-structure) indexed by outcome
     */
    async fetchTickers (outcomes: Strings = undefined, params = {}): Promise<PredictionTickers> {
        if (outcomes === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchTickers() requires an outcomes argument — the venue has no all-tickers endpoint; pass the outcome handles or token ids to fetch (discover them via fetchEvents ())');
        }
        await this.loadOutcomes (outcomes);
        const outcomesLength = outcomes.length;
        const promises: any[] = [];
        for (let i = 0; i < outcomesLength; i++) {
            const outcomeObj = this.outcome (outcomes[i]);
            const tokenId = outcomeObj['outcomeId'] as string;
            promises.push (this.opinionPublicGetTokenLatestPrice (this.extend ({ 'token_id': tokenId }, params)));
            promises.push (this.opinionPublicGetTokenOrderbook ({ 'token_id': tokenId }));
        }
        const responses = await Promise.all (promises);
        const result: PredictionTickers = {};
        for (let i = 0; i < outcomesLength; i++) {
            const outcomeObj = this.outcome (outcomes[i]);
            const priceIndex = i * 2;
            const priceResponse = responses[priceIndex];
            const bookResponse = responses[this.sum (priceIndex, 1)];
            const response: Dict = { 'price': priceResponse, 'book': bookResponse };
            const ticker = this.parsePredictionTicker (response, outcomeObj as any);
            const symbolKey = this.safeString (ticker, 'outcome');
            if (symbolKey !== undefined) {
                result[symbolKey] = ticker;
            }
        }
        return result;
    }

    /**
     * @method
     * @name opinion#fetchOrderBook
     * @description fetches the order book for a single outcome token
     * @see https://docs.opinion.trade/developer-guide/opinion-open-api/token
     * @param {string} outcome unified outcome or outcome token id
     * @param {int} [limit] not used by opinion fetchOrderBook
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [prediction order book structure](https://docs.ccxt.com/#/?id=prediction-order-book-structure)
     */
    async fetchOrderBook (outcome: string, limit: Int = undefined, params = {}): Promise<PredictionOrderBook> {
        const outcomeObj = await this.loadOutcome (outcome);
        const tokenId = outcomeObj['outcomeId'] as string;
        const request: Dict = {
            'token_id': tokenId,
        };
        const response = await this.opinionPublicGetTokenOrderbook (this.extend (request, params));
        //
        //     {
        //         "errmsg": "",
        //         "errno": 0,
        //         "result": {
        //             "asks": [
        //                 { "price": "0.999", "size": "5500" }
        //             ],
        //             "bids": [],
        //             "market": "ff7d2d935d0cce2922ea05a363e5a87439e1f8f86f01dacf7238d4c4cc542f6c",
        //             "timestamp": 1785488076901,
        //             "tokenId": "56915117085756475550546730127709511264652860289185956800398231821503615918119"
        //         }
        //     }
        //
        const result = this.safeDict (response, 'result', {});
        const timestamp = this.safeInteger (result, 'timestamp');
        const orderbook = this.parseOrderBook (result, this.safeOutcomeSymbol (outcome, outcomeObj), timestamp, 'bids', 'asks', 'price', 'size');
        return this.safePredictionOrderBook (orderbook, outcomeObj);
    }

    /**
     * @method
     * @name opinion#fetchOHLCV
     * @description fetches historical candlestick data for an outcome token
     * @see https://docs.opinion.trade/developer-guide/opinion-open-api/token
     * @param {string} outcome unified outcome or outcome token id
     * @param {string} timeframe the length of time each candle represents - only '1h' and '1d' are supported live
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum number of candles to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} a list of [OHLCV structures](https://docs.ccxt.com/#/?id=ohlcv-structure)
     */
    async fetchOHLCV (outcome: string, timeframe = '1d', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        if (!(timeframe in this.timeframes)) {
            // hoisted keys list: chaining join onto Object.keys breaks the python transpiler
            const supportedKeys = Object.keys (this.timeframes);
            throw new BadRequest (this.id + ' fetchOHLCV() unsupported timeframe ' + timeframe + ', supported timeframes are ' + supportedKeys.join (', '));
        }
        const outcomeObj = await this.loadOutcome (outcome);
        const tokenId = outcomeObj['outcomeId'] as string;
        const interval = this.safeString (this.timeframes, timeframe);
        const response = await this.opinionPublicGetTokenPriceHistory (this.extend ({
            'token_id': tokenId,
            'interval': interval,
        }, params));
        //
        //     {
        //         "errmsg": "",
        //         "errno": 0,
        //         "result": {
        //             "history": [
        //                 { "p": "0.001", "t": 1785495600 }
        //             ]
        //         }
        //     }
        //
        const result = this.safeDict (response, 'result', {});
        const history = this.safeList (result, 'history', []);
        // the venue pre-buckets each tick to the requested interval boundary, so every point
        // already represents one whole candle - no client-side aggregation is needed, unlike
        // venues that only expose raw, irregularly-spaced trade ticks
        const candles = [];
        const historyLength = history.length;
        for (let i = 0; i < historyLength; i++) {
            const point = history[i];
            const price = this.safeNumber (point, 'p');
            const timestamp = this.safeTimestamp (point, 't');
            if ((price !== undefined) && (timestamp !== undefined)) {
                candles.push ([ timestamp, price, price, price, price, undefined ]);
            }
        }
        // the venue returns history newest-first; sort ascending to match the unified OHLCV convention
        const sorted = this.sortBy (candles, 0);
        return this.filterBySinceLimit (sorted, since, limit, 0) as OHLCV[];
    }

    /**
     * @method
     * @name opinion#parseOHLCV
     * @description parses a single opinion price-history point into a unified OHLCV candle
     * @param {object} ohlcv the raw { p, t } point
     * @param {object} [market] the outcome object the candle belongs to
     * @returns {int[]} a candle ordered as timestamp, open, high, low, close, volume
     */
    parseOHLCV (ohlcv, market: Market = undefined): OHLCV {
        // Unused: fetchOHLCV maps { p, t } points directly.
        //
        //     { "p": "0.001", "t": 1785495600 }
        //
        const price = this.safeNumber (ohlcv, 'p');
        return [ this.safeTimestamp (ohlcv, 't'), price, price, price, price, undefined ];
    }

    hashMessage (message: any): string {
        return '0x' + this.hash (message, keccak, 'hex');
    }

    signHash (hash: string, privateKey: string): Dict {
        const signature = ecdsa (hash.slice (-64), privateKey.slice (-64), secp256k1, undefined);
        // assign before padStart so the PHP str_pad regex matches (it only handles a bare identifier)
        const rRaw = signature['r'];
        const sRaw = signature['s'];
        const r = rRaw.padStart (64, '0');
        const s = sRaw.padStart (64, '0');
        return {
            'r': '0x' + r,
            's': '0x' + s,
            'v': this.sum (27, signature['v']),
        };
    }

    signMessage (message: any, privateKey: string): Dict {
        return this.signHash (this.hashMessage (message), privateKey.slice (-64));
    }

    signApiKeyAuth (walletAddress: string, action: string, timestamp: string): string {
        // EIP-712 signature used to create/get/delete an API key (wallet-authenticated key management)
        const domain: Dict = {
            'name': 'Opinion OpenAPI',
            'version': '1',
            'chainId': 56,
        };
        const messageTypes: Dict = {
            'OpinionApiKeyAuth': [
                { 'name': 'walletAddress', 'type': 'address' },
                { 'name': 'action', 'type': 'string' },
                { 'name': 'timestamp', 'type': 'string' },
            ],
        };
        const messageData: Dict = {
            'walletAddress': walletAddress,
            'action': action,
            'timestamp': timestamp,
        };
        const encoded = this.ethEncodeStructuredData (domain, messageTypes, messageData);
        const sig = this.signMessage (encoded, this.privateKey);
        return '0x' + this.remove0xPrefix (sig['r']) + this.remove0xPrefix (sig['s']) + this.intToBase16 (sig['v']);
    }

    /**
     * @method
     * @name opinion#createApiKey
     * @description self-service creation of an Open API key linked to this.walletAddress via
     * an EIP-712-signed request - there is no "generate key" button in the Opinion GUI, this is
     * the only documented way to obtain a wallet-linked key
     * @see https://docs.opinion.trade/developer-guide/opinion-open-api/authentication
     * @param {object} [params] extra parameters
     * @returns {object} the api credentials { apiKey, walletAddress }
     */
    async createApiKey (params = {}): Promise<Dict> {
        const response = await this.opinionPrivatePostAuthApiKey (params);
        const result = this.safeDict (response, 'result', {});
        return this.setApiCredentials (result);
    }

    /**
     * @method
     * @name opinion#fetchApiKey
     * @description fetches the currently active Open API key for this.walletAddress
     * @see https://docs.opinion.trade/developer-guide/opinion-open-api/authentication
     * @param {object} [params] extra parameters
     * @returns {object} the api credentials { apiKey, walletAddress }
     */
    async fetchApiKey (params = {}): Promise<Dict> {
        const response = await this.opinionPrivateGetAuthApiKey (params);
        const result = this.safeDict (response, 'result', {});
        return this.setApiCredentials (result);
    }

    /**
     * @method
     * @name opinion#deleteApiKey
     * @description revokes the Open API key for this.walletAddress
     * @see https://docs.opinion.trade/developer-guide/opinion-open-api/authentication
     * @param {object} [params] extra parameters
     * @returns {object} raw response, result.deleted confirms revocation
     */
    async deleteApiKey (params = {}): Promise<Dict> {
        const response = await this.opinionPrivateDeleteAuthApiKey (params);
        this.options['apiKey'] = undefined;
        return response;
    }

    setApiCredentials (response: Dict): Dict {
        //
        //     { "apiKey": "8ZXXKZhF07MQK22oQaN9MAQ7mxjWf20m", "walletAddress": "0x513959919bce49bb8fee6421291a192c1cbbecd0" }
        //
        const creds: Dict = {
            'apiKey': this.safeString (response, 'apiKey'),
            'walletAddress': this.safeString (response, 'walletAddress'),
        };
        // cache in options rather than the typed apiKey field so the assignment is valid
        // in the struct-based languages (C#/Go/Java)
        this.options['apiKey'] = creds['apiKey'];
        return creds;
    }

    /**
     * @ignore
     * @method
     * @name opinion#sign
     * @description builds the request url and attaches the apikey/EIP-712 authentication headers for private endpoints
     * @param {string} path the endpoint path
     * @param {string|string[]} api the api group and access level
     * @param {string} method the http method
     * @param {object} params the request parameters
     * @param {object} [headers] request headers
     * @param {string} [body] the request body
     * @returns {object} a dict with url, method, body and headers
     */
    sign (path: string, api: any = 'opinion', method = 'GET', params = {}, headers: any = undefined, body: any = undefined) {
        const apiGroup: string = typeof api === 'string' ? api : api[0];
        const access: string = typeof api === 'string' ? 'public' : api[1];
        const baseUrls = this.urls['api'] as Dict;
        const baseUrl = this.safeString (baseUrls, apiGroup, baseUrls['opinion'] as string);
        let url = baseUrl + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        const existingHeaders = (headers !== undefined) ? headers : {};
        headers = this.extend ({
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        }, existingHeaders);
        if (access === 'private') {
            if (path === 'auth/api-key') {
                // wallet-signature scheme: no apiKey involved, the signature itself is the credential
                if ((this.walletAddress === undefined) || (this.privateKey === undefined)) {
                    throw new ArgumentsRequired (this.id + ' ' + path + ' requires a walletAddress and privateKey');
                }
                const actionByMethod: Dict = { 'POST': 'create', 'GET': 'get', 'DELETE': 'delete' };
                const action = this.safeString (actionByMethod, method, 'get');
                const timestamp = this.numberToString (this.seconds ());
                headers['OPINION_ADDRESS'] = this.walletAddress;
                headers['OPINION_SIGNATURE'] = this.signApiKeyAuth (this.walletAddress, action, timestamp);
                headers['OPINION_TIMESTAMP'] = timestamp;
            } else {
                const apiKey = (this.apiKey !== undefined) ? this.apiKey : this.safeString (this.options, 'apiKey');
                if (apiKey === undefined) {
                    throw new AuthenticationError (this.id + ' ' + path + ' requires an apiKey - set it directly or call createApiKey()/fetchApiKey() first');
                }
                headers['apikey'] = apiKey;
            }
        }
        if (method === 'GET') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            body = this.json (query);
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}
