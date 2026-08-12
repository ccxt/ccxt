'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var sha3_js = require('@noble/hashes/sha3.js');
var secp256k1_js = require('@noble/curves/secp256k1.js');
var opinion$1 = require('../abstract/prediction/opinion.js');
var crypto = require('../base/functions/crypto.js');
var number = require('../base/functions/number.js');
var Precise = require('../base/Precise.js');
var Cache = require('../base/ws/Cache.js');
var errors = require('../base/errors.js');

// ----------------------------------------------------------------------------
// ---------------------------------------------------------------------------
/**
 * @class opinion
 * @augments Exchange
 */
class opinion extends opinion$1["default"] {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'opinion',
            'name': 'Opinion',
            'countries': ['HK'],
            'rateLimit': 67, // 15 requests per second per API key
            'certified': false,
            'pro': true,
            'has': {
                'CORS': undefined,
                'spot': false,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'cancelOrder': true,
                'createOrder': true,
                'fetchBalance': true,
                'fetchClosedOrders': true,
                'fetchEvent': true,
                'fetchEvents': true,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchPositions': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'prediction': true,
                'watchMyTrades': true,
                'watchOrderBook': true,
                'watchOrders': true,
                'watchTicker': true,
                'watchTrades': true,
            },
            'timeframes': {
                // live-verified via GET /token/price-history: only 1h/1d are recognized,
                // any other interval value (including 1m/1w) silently falls back to 1d
                '1h': '1h',
                '1d': '1d',
            },
            'urls': {
                'logo': 'https://github.com/user-attachments/assets/f633496f-8d3d-4bc2-a59c-612dbbf23b11',
                'api': {
                    'opinion': 'https://openapi.opinion.trade/openapi',
                    'ws': 'wss://ws.opinion.trade',
                },
                'www': 'https://opinion.trade',
                'doc': ['https://docs.opinion.trade'],
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
                            'user/auth': 1,
                            'user/balance': 1,
                        },
                        'post': {
                            'auth/api-key': 1,
                            'order': 1,
                            'order/cancel': 1,
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
                    '10014': errors.AccountNotEnabled, // "Please enable trading first" - live-verified: account onboarded but trading wallet not enabled yet
                    '10403': errors.PermissionDenied, // "API is not available to persons located in the United States, China, or persons located in restricted jurisdictions"
                    '11001': errors.AuthenticationError, // "This API Key has no related Opinion Login Wallet yet"
                    '11002': errors.AuthenticationError, // "Invalid API key"
                    '10605': errors.InvalidOrder, // "Depth not enough" - live-verified: a market order with no matching book depth
                    '10610': errors.InvalidOrder, // "postOnly is not allowed for market orders"
                    '11004': errors.AuthenticationError, // "Self-service key issuance is temporarily disabled"
                    '11005': errors.AuthenticationError, // "Wallet is not a registered Opinion account"
                    '11009': errors.AuthenticationError, // "API key already exists"
                    '11010': errors.AuthenticationError, // "No API key found for this wallet"
                    '11011': errors.AuthenticationError, // "Invalid signature"
                    '11012': errors.AuthenticationError, // "Signature expired"
                    '11013': errors.AuthenticationError, // "Signature already used"
                },
                'broad': {
                    'Insufficient token balance': errors.InsufficientFunds,
                    'below the minimum required value': errors.InvalidOrder,
                    'must be the current multi-signature wallet': errors.InvalidOrder,
                },
            },
            'streaming': {
                // the venue closes idle sockets without an application-level HEARTBEAT (see ping)
                'keepAlive': 25000,
            },
            'options': {
                'tradesLimit': 1000,
                'ordersLimit': 1000,
                'myTradesLimit': 1000,
                'eventScopeParams': ['labelId'],
                'defaultFetchEventsLimit': 20, // events page size for the paginated categorical listing
                'maxFetchEventsResults': 100, // default cap on events fetched when the caller gives no limit
                'maxEventsPages': 50, // safety cap on event pages fetched per call
                'marketsPageLimit': 20,
                'maxMarketsPages': 50,
            },
        });
    }
    /**
     * @method
     * @name opinion#fetchMarkets
     * @description fetches every kind of opinion market
     * categorical parents double as our unified "events" and are cached into this.events as a side effect
     * @see https://docs.opinion.trade/developer-guide/opinion-open-api/market
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.limit] max number of markets to collect (defaults to options.marketsPageLimit * options.maxMarketsPages, 1000)
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets(params = {}) {
        const rest = this.omit(params, ['limit']);
        const userLimit = this.safeInteger(params, 'limit');
        const pageLimit = this.safeInteger(this.options, 'marketsPageLimit', 20);
        const maxPages = this.safeInteger(this.options, 'maxMarketsPages', 50);
        const flatMarkets = [];
        // seen-guard keyed by the event handle; the events themselves go through setEvents below
        // so the cache gets the base indexing (id + handle + slug) instead of a raw assignment
        const seenEvents = {};
        const eventsList = [];
        let page = 1;
        let fetchedRawCount = 0;
        while (true) {
            const request = {
                'marketType': 2, // all - both standalone binaries and categorical parents
                'limit': pageLimit,
                'page': page,
            };
            const response = await this.opinionPublicGetMarket(this.extend(request, rest));
            const result = this.safeDict(response, 'result', {});
            const rawMarkets = this.safeList(result, 'list', []);
            const rawMarketsLength = rawMarkets.length;
            fetchedRawCount = this.sum(fetchedRawCount, rawMarketsLength);
            // categorical parents expand into several flatMarkets entries each, so the raw,
            // unflattened row count in 'total' must be compared against fetchedRawCount, not
            // flatMarkets.length - otherwise expansion makes the comparison meaningless
            const total = this.safeInteger(result, 'total');
            for (let i = 0; i < rawMarketsLength; i++) {
                const raw = rawMarkets[i];
                const marketType = this.safeInteger(raw, 'marketType');
                if (marketType === 1) {
                    const event = this.parseEvent(raw);
                    const childMarkets = event['markets'];
                    const childMarketsLength = childMarkets.length;
                    for (let ci = 0; ci < childMarketsLength; ci++) {
                        flatMarkets.push(childMarkets[ci]);
                    }
                    const eventKey = this.safeString(event, 'event');
                    if ((eventKey !== undefined) && (eventKey !== '') && !(eventKey in seenEvents)) {
                        seenEvents[eventKey] = true;
                        eventsList.push(event);
                    }
                }
                else {
                    flatMarkets.push(this.parseOpinionMarket(raw));
                }
            }
            const collectedLength = flatMarkets.length;
            if ((rawMarketsLength < pageLimit) || (page >= maxPages) || ((total !== undefined) && (fetchedRawCount >= total)) || ((userLimit !== undefined) && (collectedLength >= userLimit))) {
                break;
            }
            page = this.sum(page, 1);
        }
        this.setEvents(eventsList);
        const flatMarketsLength = flatMarkets.length;
        if ((userLimit !== undefined) && (flatMarketsLength > userLimit)) {
            return this.arraySlice(flatMarkets, 0, userLimit);
        }
        return flatMarkets;
    }
    /**
     * @ignore
     * @method
     * @name opinion#fetchOutcome
     * @description resolves a single outcome; a bare numeric token id carries no search text for
     * the base's fetchEvents-driven resolution (opinion has no per-id lookup endpoint, unlike
     * kalshi/polymarket), so bulk-warm the outcome cache via loadOutcomes() first for id-form input
     * @param {string} outcomeSymbol the outcome handle or token id
     * @returns {object} the outcome cache
     */
    async fetchOutcome(outcomeSymbol) {
        if (this.outcomeSearchQuery(outcomeSymbol) === undefined) {
            await this.loadOutcomes();
            if (this.hasOutcome(outcomeSymbol)) {
                return this.safeOutcome(outcomeSymbol);
            }
        }
        return await super.fetchOutcome(outcomeSymbol);
    }
    /**
     * @ignore
     * @method
     * @name opinion#parseOpinionMarket
     * @description converts a single raw opinion market into one ccxt market with yes/no outcomes
     * @param {object} raw the raw opinion market object
     * @param {string} [eventSlug] the slug of the parent event
     * @returns {object} a [market structure](https://docs.ccxt.com/#/?id=market-structure)
     */
    parseOpinionMarket(raw, eventSlug = undefined) {
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
        const marketId = this.safeString(raw, 'marketId');
        const slug = this.safeString(raw, 'slug');
        let effectiveEventSlug = eventSlug;
        if ((eventSlug !== undefined) && (slug !== undefined) && (slug.indexOf(eventSlug) === 0)) {
            effectiveEventSlug = undefined;
        }
        const marketSymbol = this.slugToMarketSymbol(effectiveEventSlug, slug);
        const statusEnum = this.safeString(raw, 'statusEnum');
        const active = (statusEnum === 'Activated');
        const resolved = (statusEnum === 'Resolved');
        const resultTokenId = this.safeString(raw, 'resultTokenId');
        const hasResult = resolved && (resultTokenId !== undefined) && (resultTokenId !== '');
        const outcomeLabels = [
            this.safeString(raw, 'yesLabel', 'YES'),
            this.safeString(raw, 'noLabel', 'NO'),
        ];
        const outcomeTokenIds = [
            this.safeString(raw, 'yesTokenId'),
            this.safeString(raw, 'noTokenId'),
        ];
        const outcomes = [];
        let resolvedOutcome = undefined;
        for (let i = 0; i < outcomeLabels.length; i++) {
            const label = outcomeLabels[i];
            const tokenId = outcomeTokenIds[i];
            const outcomeHandle = this.slugToOutcomeSymbol(effectiveEventSlug, slug, label);
            let winner = undefined;
            let settleFraction = undefined;
            if (hasResult) {
                winner = (tokenId === resultTokenId);
                settleFraction = winner ? 1 : 0;
                if (winner) {
                    resolvedOutcome = outcomeHandle;
                }
            }
            outcomes.push({
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
        const marketResolvedOutcome = resolvedOutcome;
        // the venue sends cutoffAt 0 for markets without a scheduled cutoff - map it to
        // undefined instead of the epoch, same for the event-level end date
        let expiryTimestamp = undefined;
        if (this.safeInteger(raw, 'cutoffAt', 0) !== 0) {
            expiryTimestamp = this.safeTimestamp(raw, 'cutoffAt');
        }
        const created = this.safeTimestamp(raw, 'createdAt');
        return {
            'id': marketId,
            'market': marketSymbol,
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
            'expiryDatetime': this.iso8601(expiryTimestamp),
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
        };
    }
    /**
     * @method
     * @name opinion#fetchEvents
     * @description fetches Opinion's categorical markets - scope required via query/queries/tags/eventId/slug/labelId
     * @see https://docs.opinion.trade/developer-guide/opinion-open-api/market
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.labelId] filter by opinion category label id
     * @param {int} [params.limit] max number of events to fetch (paginated server-side; defaults to options.maxFetchEventsResults, 100)
     * @returns {object[]} an array of event structures
     */
    async fetchEvents(params = {}) {
        this.requireEventQuery(params);
        const queries = this.parseSearchQueries(params);
        const eventId = this.safeString(params, 'eventId');
        const slug = this.safeString(params, 'slug');
        if ((eventId !== undefined) || (slug !== undefined)) {
            const singleRest = this.omit(params, ['eventId', 'slug', 'query', 'queries', 'tags', 'status', 'sort', 'searchIn', 'limit']);
            let singleResponse = undefined;
            if (slug !== undefined) {
                singleResponse = await this.opinionPublicGetMarketSlugSlug(this.extend({ 'slug': slug }, singleRest));
            }
            else {
                singleResponse = await this.opinionPublicGetMarketCategoricalMarketId(this.extend({ 'marketId': eventId }, singleRest));
            }
            const singleResult = this.safeDict(singleResponse, 'result', {});
            const singleData = this.safeDict(singleResult, 'data', {});
            const single = this.parseEvent(singleData);
            this.indexEventOutcomes(single);
            return this.applyEventFetchParams([single], params, queries);
        }
        const rest = this.omit(params, ['query', 'queries', 'tags', 'status', 'sort', 'searchIn', 'limit']);
        const pageLimit = this.safeInteger(this.options, 'defaultFetchEventsLimit', 20);
        const userLimit = this.safeInteger(params, 'limit');
        // bound how many events are actually FETCHED: the user limit when given, otherwise
        // options.maxFetchEventsResults - the scope filters keep the listing narrow, but a broad
        // label can still hold more than one page
        let fetchCap = this.safeInteger(this.options, 'maxFetchEventsResults', 100);
        if (userLimit !== undefined) {
            fetchCap = userLimit;
        }
        const maxPages = this.safeInteger(this.options, 'maxEventsPages', 50);
        const rawEvents = [];
        let page = 1;
        let fetchedRawCount = 0;
        while (true) {
            let reqLimit = pageLimit;
            const remaining = fetchCap - fetchedRawCount;
            if (remaining < reqLimit) {
                reqLimit = remaining;
            }
            if (reqLimit <= 0) {
                break;
            }
            const request = {
                'marketType': 1, // categorical only - these are the ones with childMarkets, our unified "event"
                'limit': reqLimit,
                'page': page,
            };
            const response = await this.opinionPublicGetMarket(this.extend(request, rest));
            const result = this.safeDict(response, 'result', {});
            const pageEvents = this.safeList(result, 'list', []);
            const pageEventsLength = pageEvents.length;
            fetchedRawCount = this.sum(fetchedRawCount, pageEventsLength);
            for (let i = 0; i < pageEventsLength; i++) {
                rawEvents.push(pageEvents[i]);
            }
            const total = this.safeInteger(result, 'total');
            if ((pageEventsLength < reqLimit) || (page >= maxPages) || ((total !== undefined) && (fetchedRawCount >= total)) || (fetchedRawCount >= fetchCap)) {
                break;
            }
            page = this.sum(page, 1);
        }
        const rawEventsLength = rawEvents.length;
        const parsedEvents = [];
        if (this.markets === undefined) {
            this.markets = this.createSafeDictionary();
        }
        for (let i = 0; i < rawEventsLength; i++) {
            const event = this.parseEvent(rawEvents[i]);
            parsedEvents.push(event);
            // register the parsed markets so populateOutcomes can index their outcomes
            const eventMarkets = this.safeList(event, 'markets', []);
            const eventMarketsLength = eventMarkets.length;
            for (let mi = 0; mi < eventMarketsLength; mi++) {
                const m = eventMarkets[mi];
                this.markets[m['market']] = m;
            }
        }
        this.populateOutcomes();
        return this.applyEventFetchParams(parsedEvents, params, queries);
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
    async fetchEvent(id, params = {}) {
        const isSlug = (id.indexOf('-') >= 0);
        let response = undefined;
        if (isSlug) {
            response = await this.opinionPublicGetMarketSlugSlug(this.extend({ 'slug': id }, params));
        }
        else {
            response = await this.opinionPublicGetMarketCategoricalMarketId(this.extend({ 'marketId': id }, params));
        }
        const result = this.safeDict(response, 'result', {});
        const data = this.safeDict(result, 'data', {});
        const event = this.parseEvent(data);
        this.indexEventOutcomes(event);
        return event;
    }
    /**
     * @ignore
     * @method
     * @name opinion#parseEvent
     * @description parses a raw opinion categorical market (with nested childMarkets) into the unified event shape
     * @param {object} rawEvent the raw opinion categorical market object
     * @returns {object} an event structure
     */
    parseEvent(rawEvent) {
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
        const eventId = this.safeString(rawEvent, 'marketId');
        const slug = this.safeString(rawEvent, 'slug');
        const title = this.safeString(rawEvent, 'marketTitle');
        const eventHandle = (title !== undefined) ? this.shortenSlug(title) : this.shortenSlug(slug);
        const rawChildren = this.safeList(rawEvent, 'childMarkets', []);
        const rawChildrenLength = rawChildren.length;
        const marketsList = [];
        for (let i = 0; i < rawChildrenLength; i++) {
            marketsList.push(this.parseOpinionMarket(rawChildren[i], slug));
        }
        const statusEnum = this.safeString(rawEvent, 'statusEnum');
        const active = (statusEnum === 'Activated');
        const resolved = (statusEnum === 'Resolved');
        let end = undefined;
        if (this.safeInteger(rawEvent, 'cutoffAt', 0) !== 0) {
            end = this.safeTimestamp(rawEvent, 'cutoffAt');
        }
        const created = this.safeTimestamp(rawEvent, 'createdAt');
        const labels = this.safeList(rawEvent, 'labels', []);
        return this.extend({
            'id': eventId,
            'event': eventHandle,
            'title': title,
            'description': this.safeString(rawEvent, 'rules'),
            'slug': slug,
            'category': this.safeString(labels, 0),
            'tags': labels,
            'markets': marketsList,
            'active': active,
            'resolved': resolved,
            'volume': this.safeNumber(rawEvent, 'volume'),
            'created': created,
            'createdDatetime': this.iso8601(created),
            'end': end,
            'endDatetime': this.iso8601(end),
            'image': this.safeString2(rawEvent, 'coverUrl', 'thumbnailUrl'),
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
    async fetchTicker(outcome, params = {}) {
        const outcomeObj = await this.loadOutcome(outcome);
        const tokenId = outcomeObj['outcomeId'];
        const promises = [
            this.opinionPublicGetTokenLatestPrice(this.extend({ 'token_id': tokenId }, params)),
            this.opinionPublicGetTokenOrderbook(this.extend({ 'token_id': tokenId }, params)),
        ];
        const [priceResponse, bookResponse] = await Promise.all(promises);
        const response = { 'price': priceResponse, 'book': bookResponse };
        return this.parsePredictionTicker(response, outcomeObj);
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
    parsePredictionTicker(ticker, market = undefined) {
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
        const marketAny = market;
        const priceResponse = this.safeDict(ticker, 'price', {});
        const priceResult = this.safeDict(priceResponse, 'result', {});
        const bookResponse = this.safeDict(ticker, 'book', {});
        const bookResult = this.safeDict(bookResponse, 'result', {});
        const bids = this.safeList(bookResult, 'bids', []);
        const asks = this.safeList(bookResult, 'asks', []);
        const bestBid = this.safeDict(bids, 0, {});
        const bestAsk = this.safeDict(asks, 0, {});
        const last = this.safeNumber(priceResult, 'price');
        const timestamp = this.safeInteger(priceResult, 'timestamp', this.milliseconds());
        return this.safePredictionTicker({
            'outcome': this.safeString(marketAny, 'outcome'),
            'outcomeId': this.safeString2(marketAny, 'outcomeId', 'id'),
            'label': this.safeString(marketAny, 'label'),
            'market': this.safeString2(marketAny, 'market', 'outcome'),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'high': undefined,
            'low': undefined,
            'bid': this.safeNumber(bestBid, 'price'),
            'bidVolume': this.safeNumber(bestBid, 'size'),
            'ask': this.safeNumber(bestAsk, 'price'),
            'askVolume': this.safeNumber(bestAsk, 'size'),
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
     * @returns {object} a dictionary of [prediction ticker structures](https://docs.ccxt.com/#/?id=prediction-ticker-structure) indexed by outcome
     */
    async fetchTickers(outcomes = undefined, params = {}) {
        if (outcomes === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchTickers() requires an outcomes argument — the venue has no all-tickers endpoint; pass the outcome handles or token ids to fetch (discover them via fetchEvents ())');
        }
        await this.loadOutcomes(outcomes);
        const outcomesLength = outcomes.length;
        const promises = [];
        for (let i = 0; i < outcomesLength; i++) {
            const outcomeObj = this.outcome(outcomes[i]);
            const tokenId = outcomeObj['outcomeId'];
            promises.push(this.opinionPublicGetTokenLatestPrice(this.extend({ 'token_id': tokenId }, params)));
            promises.push(this.opinionPublicGetTokenOrderbook(this.extend({ 'token_id': tokenId }, params)));
        }
        const responses = await Promise.all(promises);
        const result = {};
        for (let i = 0; i < outcomesLength; i++) {
            const outcomeObj = this.outcome(outcomes[i]);
            const priceIndex = i * 2;
            const priceResponse = responses[priceIndex];
            const bookResponse = responses[this.sum(priceIndex, 1)];
            const response = { 'price': priceResponse, 'book': bookResponse };
            const ticker = this.parsePredictionTicker(response, outcomeObj);
            const symbolKey = this.safeString(ticker, 'outcome');
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
    async fetchOrderBook(outcome, limit = undefined, params = {}) {
        const outcomeObj = await this.loadOutcome(outcome);
        const tokenId = outcomeObj['outcomeId'];
        const request = {
            'token_id': tokenId,
        };
        const response = await this.opinionPublicGetTokenOrderbook(this.extend(request, params));
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
        const result = this.safeDict(response, 'result', {});
        const timestamp = this.safeInteger(result, 'timestamp');
        const orderbook = this.parseOrderBook(result, this.safeOutcomeSymbol(outcome, outcomeObj), timestamp, 'bids', 'asks', 'price', 'size');
        return this.safePredictionOrderBook(orderbook, outcomeObj);
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
     * @returns {int[][]} a list of candles ordered as timestamp, open, high, low, close, volume
     */
    async fetchOHLCV(outcome, timeframe = '1d', since = undefined, limit = undefined, params = {}) {
        if (!(timeframe in this.timeframes)) {
            const supportedKeys = Object.keys(this.timeframes);
            throw new errors.BadRequest(this.id + ' fetchOHLCV() unsupported timeframe ' + timeframe + ', supported timeframes are ' + supportedKeys.join(', '));
        }
        const outcomeObj = await this.loadOutcome(outcome);
        const tokenId = outcomeObj['outcomeId'];
        const interval = this.safeString(this.timeframes, timeframe);
        const response = await this.opinionPublicGetTokenPriceHistory(this.extend({
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
        const result = this.safeDict(response, 'result', {});
        const history = this.safeList(result, 'history', []);
        const candles = [];
        const historyLength = history.length;
        for (let i = 0; i < historyLength; i++) {
            const point = history[i];
            const price = this.safeNumber(point, 'p');
            const timestamp = this.safeTimestamp(point, 't');
            if ((price !== undefined) && (timestamp !== undefined)) {
                candles.push([timestamp, price, price, price, price, undefined]);
            }
        }
        const sorted = this.sortBy(candles, 0);
        return this.filterBySinceLimit(sorted, since, limit, 0);
    }
    /**
     * @method
     * @name opinion#parseOHLCV
     * @description parses a single opinion price-history point into a unified OHLCV candle
     * @param {object} ohlcv the raw { p, t } point
     * @param {object} [market] the outcome object the candle belongs to
     * @returns {int[]} a candle ordered as timestamp, open, high, low, close, volume
     */
    parseOHLCV(ohlcv, market = undefined) {
        // Unused: fetchOHLCV maps { p, t } points directly.
        //
        //     { "p": "0.001", "t": 1785495600 }
        //
        const price = this.safeNumber(ohlcv, 'p');
        return [this.safeTimestamp(ohlcv, 't'), price, price, price, price, undefined];
    }
    /**
     * @ignore
     * @method
     * @name opinion#loadQuoteToken
     * @description fetches and caches quote-token metadata needed to sign orders
     * @param {string} quoteTokenAddress the on-chain quote-token contract address, read from a 'quoteToken' field
     * @returns {object} the matching quote-token entry
     */
    async loadQuoteToken(quoteTokenAddress) {
        if (quoteTokenAddress === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' loadQuoteToken() requires a quoteTokenAddress');
        }
        const cacheKey = quoteTokenAddress.toLowerCase();
        const cached = this.safeDict(this.options, 'quoteTokens', {});
        const existing = this.safeDict(cached, cacheKey);
        if (existing !== undefined) {
            return existing;
        }
        const response = await this.opinionPublicGetQuoteToken({});
        const result = this.safeDict(response, 'result', {});
        const list = this.safeList(result, 'list', []);
        const listLength = list.length;
        const quoteTokens = {};
        for (let i = 0; i < listLength; i++) {
            const entry = list[i];
            const address = this.safeStringLower(entry, 'quoteTokenAddress');
            if (address !== undefined) {
                quoteTokens[address] = entry;
            }
        }
        this.options['quoteTokens'] = quoteTokens;
        const quoteToken = this.safeDict(quoteTokens, cacheKey);
        if (quoteToken === undefined) {
            throw new errors.ExchangeError(this.id + ' loadQuoteToken() could not find quote token ' + quoteTokenAddress);
        }
        return quoteToken;
    }
    /**
     * @ignore
     * @method
     * @name opinion#loadMultiSignAddress
     * @description fetches and caches the per-wallet multi-signature address that owns order assets
     * @returns {string} the multi-sig wallet address for this.walletAddress on chain 56, or this.walletAddress itself if none exists yet
     */
    async loadMultiSignAddress() {
        const cached = this.safeString(this.options, 'multiSignAddress');
        if (cached !== undefined) {
            return cached;
        }
        const response = await this.opinionPrivateGetUserAuth({});
        const result = this.safeDict(response, 'result', {});
        const walletUsers = this.safeDict(result, 'walletUsers', {});
        const multiSignAddress = this.safeString(walletUsers, '56', this.walletAddress);
        this.options['multiSignAddress'] = multiSignAddress;
        return multiSignAddress;
    }
    signOpinionOrder(order, exchangeAddress) {
        const domain = {
            'name': 'OPINION CTF Exchange',
            'version': '1',
            'chainId': 56,
            'verifyingContract': exchangeAddress,
        };
        const messageTypes = {
            'Order': [
                { 'name': 'salt', 'type': 'uint256' },
                { 'name': 'maker', 'type': 'address' },
                { 'name': 'signer', 'type': 'address' },
                { 'name': 'taker', 'type': 'address' },
                { 'name': 'tokenId', 'type': 'uint256' },
                { 'name': 'makerAmount', 'type': 'uint256' },
                { 'name': 'takerAmount', 'type': 'uint256' },
                { 'name': 'expiration', 'type': 'uint256' },
                { 'name': 'nonce', 'type': 'uint256' },
                { 'name': 'feeRateBps', 'type': 'uint256' },
                { 'name': 'side', 'type': 'uint8' },
                { 'name': 'signatureType', 'type': 'uint8' },
            ],
        };
        const encoded = this.ethEncodeStructuredData(domain, messageTypes, order);
        const sig = this.signMessage(encoded, this.privateKey);
        return '0x' + this.remove0xPrefix(sig['r']) + this.remove0xPrefix(sig['s']) + this.intToBase16(sig['v']);
    }
    opinionOrderRawAmounts(isMarket, side, amount, price, decimals) {
        let decimalsStr = '1';
        for (let i = 0; i < decimals; i++) {
            decimalsStr = decimalsStr + '0';
        }
        const amountStr = this.numberToString(amount);
        if (isMarket && (side === 'BUY')) {
            const marketMakerAmountWei = this.decimalToPrecision(Precise["default"].stringMul(amountStr, decimalsStr), number.TRUNCATE, 0, number.DECIMAL_PLACES);
            return { 'makerAmount': marketMakerAmountWei, 'takerAmount': '0' };
        }
        const priceStr = this.decimalToPrecision(this.numberToString(price), number.ROUND, 6, number.DECIMAL_PLACES);
        const priceParts = priceStr.split('.');
        const priceInt = this.safeString(priceParts, 0, '0');
        const priceFrac = this.safeString(priceParts, 1, '');
        const priceDenom = '1000000';
        const priceNum = Precise["default"].stringAdd(Precise["default"].stringMul(priceInt, priceDenom), priceFrac.padEnd(6, '0'));
        if (priceNum === '0') {
            throw new errors.InvalidOrder(this.id + ' createOrder() invalid price ' + priceStr);
        }
        let makerRaw = amountStr;
        if (side === 'BUY') {
            makerRaw = Precise["default"].stringMul(amountStr, priceStr);
        }
        const makerAmountWei = this.decimalToPrecision(Precise["default"].stringMul(makerRaw, decimalsStr), number.TRUNCATE, 0, number.DECIMAL_PLACES);
        let makerAmount;
        let takerAmount;
        if (side === 'BUY') {
            const k = Precise["default"].stringDiv(makerAmountWei, priceNum, 0);
            makerAmount = Precise["default"].stringMul(k, priceNum);
            takerAmount = Precise["default"].stringMul(k, priceDenom);
        }
        else {
            const k = Precise["default"].stringDiv(makerAmountWei, priceDenom, 0);
            makerAmount = Precise["default"].stringMul(k, priceDenom);
            takerAmount = Precise["default"].stringMul(k, priceNum);
        }
        return { 'makerAmount': makerAmount, 'takerAmount': takerAmount };
    }
    /**
     * @method
     * @name opinion#createOrder
     * @description places a limit or market order on the CLOB for the given outcome token
     * @see https://docs.opinion.trade/developer-guide/opinion-open-api/order
     * @param {string} outcome unified outcome or outcome token id
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount for limit orders, the number of outcome shares to trade; for market orders, the quote (USDT) to spend on a BUY or the shares to sell on a SELL
     * @param {float} [price] the price per outcome token between 0 and 1; required for limit orders and market SELL orders (where it acts as the reference / worst acceptable price for the taker amount); ignored for market BUY orders (amount is already the quote to spend)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {bool} [params.postOnly] limit orders only - reject the order if it would cross the spread
     * @returns {object} a [prediction order structure](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    async createOrder(outcome, type, side, amount, price = undefined, params = {}) {
        await this.loadApiKey();
        this.checkRequiredCredentials();
        const outcomeObj = await this.loadOutcome(outcome);
        const tokenId = outcomeObj['outcomeId'];
        const isMarket = (type === 'market');
        const sideStr = side.toUpperCase();
        if (price === undefined) {
            if (!isMarket) {
                throw new errors.ArgumentsRequired(this.id + ' createOrder() requires a price for limit orders');
            }
            if (sideStr === 'SELL') {
                // the reference (worst acceptable) price the taker amount is computed from
                throw new errors.ArgumentsRequired(this.id + ' createOrder() requires a price for market sell orders');
            }
        }
        let marketOrderPrice = '0';
        if (isMarket && (sideStr === 'SELL')) {
            marketOrderPrice = this.numberToString(price);
        }
        const info = this.safeDict(outcomeObj, 'info', {});
        const topicId = this.safeInteger(info, 'marketId');
        const quoteTokenAddress = this.safeString(info, 'quoteToken');
        const quoteToken = await this.loadQuoteToken(quoteTokenAddress);
        const exchangeAddress = this.safeString(quoteToken, 'ctfExchangeAddress', '');
        const decimals = this.safeInteger(quoteToken, 'decimal', 18);
        const amounts = this.opinionOrderRawAmounts(isMarket, sideStr, amount, price, decimals);
        const makerAmount = this.safeString(amounts, 'makerAmount');
        const takerAmount = this.safeString(amounts, 'takerAmount');
        const sideInt = (sideStr === 'BUY') ? 0 : 1;
        const salt = this.numberToString(this.milliseconds());
        const postOnly = this.safeBool(params, 'postOnly', false);
        const rest = this.omit(params, ['postOnly']);
        const maker = await this.loadMultiSignAddress();
        // Ethereum addresses are case-insensitive - a checksummed multiSignAddress compared
        // against a differently-cased walletAddress with strict equality would pick the wrong
        // signatureType (0 EOA vs 2 Gnosis Safe) and break order signing/validation
        const makerLower = maker.toLowerCase();
        const walletAddressLower = this.walletAddress.toLowerCase();
        const signatureType = (makerLower === walletAddressLower) ? 0 : 2;
        const order = {
            'salt': salt,
            'maker': maker,
            'signer': this.walletAddress,
            'taker': '0x0000000000000000000000000000000000000000',
            'tokenId': tokenId,
            'makerAmount': makerAmount,
            'takerAmount': takerAmount,
            'expiration': '0',
            'nonce': '0',
            'feeRateBps': '0',
            'side': sideInt,
            'signatureType': signatureType,
        };
        const signature = this.signOpinionOrder(order, exchangeAddress);
        const signatureNo0x = this.remove0xPrefix(signature);
        const orderBody = this.extend({
            'salt': salt,
            'maker': maker,
            'signer': this.walletAddress,
            'taker': '0x0000000000000000000000000000000000000000',
            'tokenId': tokenId,
            'makerAmount': makerAmount,
            'takerAmount': takerAmount,
            'expiration': '0',
            'nonce': '0',
            'feeRateBps': '0',
            'side': sideInt.toString(),
            'signatureType': signatureType.toString(),
            'signature': signature,
            'sign': signatureNo0x.slice(0, 64),
            'contractAddress': '',
            'currencyAddress': quoteTokenAddress,
            'topicId': topicId,
            'price': isMarket ? marketOrderPrice : this.numberToString(price),
            'tradingMethod': isMarket ? 1 : 2,
            'timestamp': this.seconds(),
            'safeRate': '0',
            'orderExpTime': '0',
            'postOnly': postOnly,
        }, rest);
        const response = await this.opinionPrivatePostOrder(orderBody);
        const result = this.safeDict(response, 'result', {});
        const orderData = this.safeDict(result, 'orderData', {});
        return this.parsePredictionOrder(orderData, outcomeObj);
    }
    /**
     * @method
     * @name opinion#cancelOrder
     * @description cancels a single open order by id
     * @see https://docs.opinion.trade/developer-guide/opinion-open-api/order
     * @param {string} id the order id
     * @param {string} [outcome] not used by opinion cancelOrder
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [prediction order structure](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    async cancelOrder(id, outcome = undefined, params = {}) {
        await this.loadApiKey();
        const request = { 'orderId': id };
        const response = await this.opinionPrivatePostOrderCancel(this.extend(request, params));
        const result = this.safeDict(response, 'result', {});
        const canceled = this.safeBool(result, 'result', false);
        // a false result does NOT mean the order is still open — it may already be filled,
        // already cancelled, or unknown; don't invent a status the venue didn't report.
        // error responses with an errno never reach this line, handleErrors throws on them
        const status = (canceled) ? 'canceled' : undefined;
        return this.safePredictionOrder({ 'id': id, 'status': status, 'info': response });
    }
    /**
     * @ignore
     * @method
     * @name opinion#parseOrderStatus
     * @description maps an opinion order statusEnum string to the unified status vocabulary
     * @param {string} status the raw opinion order statusEnum
     * @returns {string} a unified order status
     */
    parseOrderStatus(status) {
        const statuses = {
            'Pending': 'open',
            'Finished': 'closed',
            'Canceled': 'canceled',
            'Expired': 'canceled',
            'Failed': 'canceled',
        };
        return this.safeString(statuses, status, status);
    }
    /**
     * @method
     * @name opinion#parsePredictionOrder
     * @description parses a raw opinion order object into a unified prediction order structure
     * @param {object} order the raw opinion OrderData object
     * @param {object} [market] the outcome object the order belongs to
     * @returns {object} a [prediction order structure](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    parsePredictionOrder(order, market = undefined) {
        //
        //     {
        //         "orderId": "...",
        //         "marketId": 1094,
        //         "side": 0,
        //         "sideEnum": "Buy",
        //         "tradingMethod": 2,
        //         "tradingMethodEnum": "Limit",
        //         "price": "0.01",
        //         "orderShares": "5",
        //         "orderAmount": "0.05",
        //         "filledShares": "0",
        //         "filledAmount": "0",
        //         "profit": "0",
        //         "status": 1,
        //         "statusEnum": "Pending",
        //         "createdAt": 1785500000,
        //         "expiresAt": 0,
        //         "postOnly": false
        //     }
        //
        const id = this.safeString(order, 'orderId');
        const marketAny = market;
        const statusEnum = this.safeString(order, 'statusEnum');
        const status = this.parseOrderStatus(statusEnum);
        const sideEnum = this.safeStringLower(order, 'sideEnum');
        const tradingMethodEnum = this.safeStringLower(order, 'tradingMethodEnum');
        const timestamp = this.safeTimestamp(order, 'createdAt');
        return this.safePredictionOrder({
            'id': id,
            'clientOrderId': undefined,
            'info': order,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'lastTradeTimestamp': undefined,
            'status': status,
            'outcome': this.safeString(marketAny, 'outcome'),
            'outcomeId': this.safeString2(marketAny, 'outcomeId', 'id'),
            'label': this.safeString(marketAny, 'label'),
            'market': this.safeString2(marketAny, 'market', 'outcome'),
            'type': tradingMethodEnum,
            'side': sideEnum,
            'price': this.safeNumber(order, 'price'),
            'amount': this.safeNumber(order, 'orderShares'),
            // cost is the FILLED portion's collateral (unified cost = filled * price) — orderAmount
            // is the full requested orderShares * price, wrong for a partially filled order
            'cost': this.safeNumber(order, 'filledAmount'),
            'filled': this.safeNumber(order, 'filledShares'),
            'fee': undefined,
            'trades': [],
        }, market);
    }
    /**
     * @method
     * @name opinion#fetchOrders
     * @description fetches all of the authenticated user's orders
     * @see https://docs.opinion.trade/developer-guide/opinion-open-api/order
     * @param {string} [outcome] filter by unified outcome or outcome token id
     * @param {int} [since] timestamp in ms of the earliest order to fetch
     * @param {int} [limit] the maximum number of orders to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [prediction order structures](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    async fetchOrders(outcome = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadApiKey();
        let outcomeObj = undefined;
        const request = {};
        if (outcome !== undefined) {
            outcomeObj = await this.loadOutcome(outcome);
            const info = this.safeDict(outcomeObj, 'info', {});
            request['marketId'] = this.safeInteger(info, 'marketId');
        }
        const response = await this.opinionPrivateGetOrder(this.extend(request, params));
        const result = this.safeDict(response, 'result', {});
        const orders = this.safeList(result, 'list', []);
        return this.parsePredictionOrders(orders, outcomeObj, since, limit);
    }
    /**
     * @method
     * @name opinion#fetchOrder
     * @description fetches a single order by id
     * @see https://docs.opinion.trade/developer-guide/opinion-open-api/order
     * @param {string} id the order id
     * @param {string} [outcome] unified outcome or outcome token id
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [prediction order structure](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    async fetchOrder(id, outcome = undefined, params = {}) {
        await this.loadApiKey();
        let outcomeObj = undefined;
        if (outcome !== undefined) {
            outcomeObj = await this.loadOutcome(outcome);
        }
        const response = await this.opinionPrivateGetOrderOrderId(this.extend({ 'orderId': id }, params));
        const result = this.safeDict(response, 'result', {});
        const orderData = this.safeDict(result, 'orderData', {});
        return this.parsePredictionOrder(orderData, outcomeObj);
    }
    /**
     * @method
     * @name opinion#fetchOpenOrders
     * @description fetches the authenticated user's open orders
     * @see https://docs.opinion.trade/developer-guide/opinion-open-api/order
     * @param {string} [outcome] filter by unified outcome or outcome token id
     * @param {int} [since] timestamp in ms of the earliest order to fetch
     * @param {int} [limit] the maximum number of orders to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [prediction order structures](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    async fetchOpenOrders(outcome = undefined, since = undefined, limit = undefined, params = {}) {
        // 1 = pending - open status
        const request = { 'status': '1' };
        return await this.fetchOrders(outcome, since, limit, this.extend(request, params));
    }
    /**
     * @method
     * @name opinion#fetchClosedOrders
     * @description fetches the authenticated user's closed orders
     * @see https://docs.opinion.trade/developer-guide/opinion-open-api/order
     * @param {string} [outcome] filter by unified outcome or outcome token id
     * @param {int} [since] timestamp in ms of the earliest order to fetch
     * @param {int} [limit] the maximum number of orders to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [prediction order structures](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    async fetchClosedOrders(outcome = undefined, since = undefined, limit = undefined, params = {}) {
        // 2 = filled, 3 = canceled, 4 = expired, 5 = failed
        const request = { 'status': '2,3,4,5' };
        return await this.fetchOrders(outcome, since, limit, this.extend(request, params));
    }
    /**
     * @method
     * @name opinion#fetchMyTrades
     * @description fetches the authenticated user's trades
     * @see https://docs.opinion.trade/developer-guide/opinion-open-api/trade
     * @param {string} [outcome] filter by unified outcome or outcome token id
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum number of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [prediction trade structures](https://docs.ccxt.com/#/?id=prediction-trade-structure)
     */
    async fetchMyTrades(outcome = undefined, since = undefined, limit = undefined, params = {}) {
        if (this.walletAddress === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchMyTrades() requires a walletAddress');
        }
        await this.loadApiKey();
        let outcomeObj = undefined;
        const request = { 'walletAddress': this.walletAddress };
        if (outcome !== undefined) {
            outcomeObj = await this.loadOutcome(outcome);
            const info = this.safeDict(outcomeObj, 'info', {});
            request['marketId'] = this.safeInteger(info, 'marketId');
        }
        const response = await this.opinionPrivateGetTradeUserWalletAddress(this.extend(request, params));
        const result = this.safeDict(response, 'result', {});
        const trades = this.safeList(result, 'list', []);
        const tradesLength = trades.length;
        for (let i = 0; i < tradesLength; i++) {
            const trade = trades[i];
            const tokenId = this.safeString(trade, 'tokenId');
            const marketId = this.safeInteger(trade, 'marketId');
            if ((tokenId === undefined) && (marketId !== undefined)) {
                const tradeMarket = await this.loadTradeMarket(marketId);
                const info = this.safeDict(tradeMarket, 'info', {});
                const isYes = (this.safeStringLower(trade, 'outcomeSideEnum') === 'yes');
                trade['tokenId'] = isYes ? this.safeString(info, 'yesTokenId') : this.safeString(info, 'noTokenId');
            }
        }
        return this.parsePredictionTrades(trades, outcomeObj, since, limit);
    }
    /**
     * @ignore
     * @method
     * @name opinion#loadTradeMarket
     * @description fetches and caches a single market by its numeric marketId, and indexes its outcomes
     * @param {int} marketId the numeric market id
     * @returns {object} the parsed market
     */
    async loadTradeMarket(marketId) {
        if (marketId === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' loadTradeMarket() requires a marketId');
        }
        const cacheKey = 'tradeMarketsById';
        const cached = this.safeDict(this.options, cacheKey, {});
        const idStr = marketId.toString();
        const existing = this.safeDict(cached, idStr);
        if (existing !== undefined) {
            return existing;
        }
        const response = await this.opinionPublicGetMarketMarketId({ 'marketId': marketId });
        const result = this.safeDict(response, 'result', {});
        const data = this.safeDict(result, 'data', {});
        const market = this.parseOpinionMarket(data);
        if (market === undefined) {
            throw new errors.ExchangeError(this.id + ' loadTradeMarket() could not parse market ' + idStr);
        }
        if (this.markets === undefined) {
            this.markets = this.createSafeDictionary();
        }
        const marketHandle = this.safeString(market, 'market', '');
        this.markets[marketHandle] = market;
        this.indexMarketOutcomes(market);
        cached[idStr] = market;
        this.options[cacheKey] = cached;
        return market;
    }
    /**
     * @ignore
     * @method
     * @name opinion#parsePredictionTrade
     * @description parses a raw opinion trade object into a unified trade object
     * @param {object} trade the raw opinion TradeData object
     * @param {object} [market] the outcome object the trade belongs to
     * @returns {object} a [prediction trade structure](https://docs.ccxt.com/#/?id=prediction-trade-structure)
     */
    parsePredictionTrade(trade, market = undefined) {
        const tokenId = this.safeString(trade, 'tokenId');
        const outcomeObj = this.safeOutcome(tokenId, market);
        const timestamp = this.safeTimestamp(trade, 'createdAt');
        const side = this.safeStringLower(trade, 'side');
        return this.safePredictionTrade({
            'id': this.safeString(trade, 'txHash'),
            'timestamp': timestamp,
            'side': side,
            'price': this.safeNumber(trade, 'price'),
            'amount': this.safeNumber(trade, 'shares'),
            'cost': this.safeNumber(trade, 'amount'),
            'fee': {
                'cost': this.safeNumber(trade, 'fee'),
                'currency': 'USDT',
            },
            'outcome': this.safeString(outcomeObj, 'outcome'),
            'outcomeId': this.safeString2(outcomeObj, 'outcomeId', 'id'),
            'label': this.safeString(outcomeObj, 'label'),
            'market': this.safeString2(outcomeObj, 'market', 'outcome'),
        });
    }
    /**
     * @method
     * @name opinion#fetchBalance
     * @description fetches the authenticated user's quote-token balances
     * @see https://docs.opinion.trade/developer-guide/opinion-open-api/quote-token
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)
     */
    async fetchBalance(params = {}) {
        await this.loadApiKey();
        const request = { 'chain_id': '56' };
        const response = await this.opinionPrivateGetUserBalance(this.extend(request, params));
        const result = this.safeDict(response, 'result', {});
        const rawBalances = this.safeList(result, 'balances', []);
        const rawBalancesLength = rawBalances.length;
        for (let i = 0; i < rawBalancesLength; i++) {
            const rawBalance = rawBalances[i];
            const quoteTokenAddress = this.safeString(rawBalance, 'quoteToken');
            const quoteToken = await this.loadQuoteToken(quoteTokenAddress);
            rawBalance['symbol'] = this.safeString(quoteToken, 'symbol', 'USDT');
        }
        return this.parseBalance(response);
    }
    /**
     * @ignore
     * @method
     * @name opinion#parseBalance
     * @description parses an opinion user-balance response into a unified balances object
     * @param {object} response the raw user-balance response
     * @returns {object} a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)
     */
    parseBalance(response) {
        const result = { 'info': response };
        const data = this.safeDict(response, 'result', {});
        const balances = this.safeList(data, 'balances', []);
        const balancesLength = balances.length;
        for (let i = 0; i < balancesLength; i++) {
            const balance = balances[i];
            const code = this.safeString(balance, 'symbol', 'USDT');
            result[code] = {
                'free': this.safeNumber(balance, 'availableBalance'),
                'used': this.safeNumber(balance, 'frozenBalance'),
                'total': this.safeNumber(balance, 'totalBalance'),
            };
        }
        return this.safeBalance(result);
    }
    /**
     * @method
     * @name opinion#fetchPositions
     * @description fetches the authenticated user's open positions
     * @see https://docs.opinion.trade/developer-guide/opinion-open-api/position
     * @param {string[]} [outcomes] filter by unified outcomes or outcome token ids
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [prediction position structures](https://docs.ccxt.com/#/?id=prediction-position-structure)
     */
    async fetchPositions(outcomes = undefined, params = {}) {
        if (this.walletAddress === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchPositions() requires a walletAddress');
        }
        await this.loadApiKey();
        let outcomesLength = 0;
        if (outcomes !== undefined) {
            outcomesLength = outcomes.length;
            await this.loadOutcomes(outcomes);
        }
        const request = { 'walletAddress': this.walletAddress };
        const response = await this.opinionPrivateGetPositionsUserWalletAddress(this.extend(request, params));
        const result = this.safeDict(response, 'result', {});
        const positions = this.safeList(result, 'list', []);
        const parsed = this.parsePredictionPositions(positions);
        if (outcomesLength === 0) {
            return parsed;
        }
        const wantedTokenIds = {};
        // copy to a plain list so the strict null checks see one shape
        const outcomesList = (outcomes === undefined) ? [] : outcomes;
        for (let i = 0; i < outcomesList.length; i++) {
            const outcomeObj = this.outcome(outcomesList[i]);
            const tokenId = this.safeString(outcomeObj, 'outcomeId');
            if (tokenId !== undefined) {
                wantedTokenIds[tokenId] = true;
            }
        }
        const filtered = [];
        for (let i = 0; i < parsed.length; i++) {
            const position = parsed[i];
            const info = this.safeDict(position, 'info', {});
            const tokenId = this.safeString(info, 'tokenId');
            if ((tokenId !== undefined) && (tokenId in wantedTokenIds)) {
                filtered.push(position);
            }
        }
        return filtered;
    }
    /**
     * @ignore
     * @method
     * @name opinion#parsePredictionPosition
     * @description parses a raw opinion position object into a unified position object
     * @param {object} position the raw opinion PositionData object
     * @param {object} [market] the outcome object the position belongs to
     * @returns {object} a [prediction position structure](https://docs.ccxt.com/#/?id=prediction-position-structure)
     */
    parsePredictionPosition(position, market = undefined) {
        const tokenId = this.safeString(position, 'tokenId');
        const outcomeObj = this.safeOutcome(tokenId, market);
        const outcomeSideEnum = this.safeStringLower(position, 'outcomeSideEnum');
        return this.safePredictionPosition({
            'contracts': this.safeNumber(position, 'sharesOwned'),
            'side': outcomeSideEnum,
            'unrealizedPnl': this.safeNumber(position, 'unrealizedPnl'),
            'entryPrice': this.safeNumber(position, 'avgEntryPrice'),
            'outcome': this.safeString(outcomeObj, 'outcome'),
            'outcomeId': this.safeString2(outcomeObj, 'outcomeId', 'id'),
            'label': this.safeString(outcomeObj, 'label'),
            'market': this.safeString2(outcomeObj, 'market', 'outcome'),
            'info': position,
        });
    }
    hashMessage(message) {
        return '0x' + this.hash(message, sha3_js.keccak_256, 'hex');
    }
    signHash(hash, privateKey) {
        const signature = crypto.ecdsa(hash.slice(-64), privateKey.slice(-64), secp256k1_js.secp256k1, undefined);
        // assign before padStart so the PHP str_pad regex matches
        const rRaw = signature['r'];
        const sRaw = signature['s'];
        const r = rRaw.padStart(64, '0');
        const s = sRaw.padStart(64, '0');
        return {
            'r': '0x' + r,
            's': '0x' + s,
            'v': this.sum(27, signature['v']),
        };
    }
    signMessage(message, privateKey) {
        return this.signHash(this.hashMessage(message), privateKey.slice(-64));
    }
    signApiKeyAuth(walletAddress, action, timestamp) {
        // EIP-712 signature used to create/get/delete an API key (wallet-authenticated key management)
        const domain = {
            'name': 'Opinion OpenAPI',
            'version': '1',
            'chainId': 56,
        };
        const messageTypes = {
            'OpinionApiKeyAuth': [
                { 'name': 'walletAddress', 'type': 'address' },
                { 'name': 'action', 'type': 'string' },
                { 'name': 'timestamp', 'type': 'string' },
            ],
        };
        const messageData = {
            'walletAddress': walletAddress,
            'action': action,
            'timestamp': timestamp,
        };
        const encoded = this.ethEncodeStructuredData(domain, messageTypes, messageData);
        const sig = this.signMessage(encoded, this.privateKey);
        return '0x' + this.remove0xPrefix(sig['r']) + this.remove0xPrefix(sig['s']) + this.intToBase16(sig['v']);
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
    async createApiKey(params = {}) {
        const response = await this.opinionPrivatePostAuthApiKey(params);
        const result = this.safeDict(response, 'result', {});
        return this.setApiCredentials(result);
    }
    /**
     * @method
     * @name opinion#fetchApiKey
     * @description fetches the currently active Open API key for this.walletAddress
     * @see https://docs.opinion.trade/developer-guide/opinion-open-api/authentication
     * @param {object} [params] extra parameters
     * @returns {object} the api credentials { apiKey, walletAddress }
     */
    async fetchApiKey(params = {}) {
        const response = await this.opinionPrivateGetAuthApiKey(params);
        const result = this.safeDict(response, 'result', {});
        return this.setApiCredentials(result);
    }
    /**
     * @method
     * @name opinion#deleteApiKey
     * @description revokes the Open API key for this.walletAddress
     * @see https://docs.opinion.trade/developer-guide/opinion-open-api/authentication
     * @param {object} [params] extra parameters
     * @returns {object} raw response, result.deleted confirms revocation
     */
    async deleteApiKey(params = {}) {
        const response = await this.opinionPrivateDeleteAuthApiKey(params);
        this.options['apiKey'] = undefined;
        // sign() prefers this.apiKey over options['apiKey'] - clear it too, or a directly-set
        // exchange.apiKey would keep being used for private calls after the key is revoked.
        // an empty string, not undefined: the strict base types the credential as string, and
        // sign() treats an empty key as absent
        this.apiKey = '';
        return response;
    }
    /**
     * @ignore
     * @method
     * @name opinion#loadApiKey
     * @description ensures an apiKey is available before a private call - reuses a directly-set key, otherwise
     * self-issues one from the walletAddress/privateKey via fetchApiKey(), falling back to createApiKey() when
     * the wallet has no key yet; freshly created keys can take ~15 seconds to activate venue-side
     * @returns {string} the apiKey
     */
    async loadApiKey() {
        const hasDirectApiKey = !this.isEmptyString(this.apiKey);
        if (hasDirectApiKey) {
            return this.apiKey;
        }
        const optionsKey = this.safeString(this.options, 'apiKey');
        if (optionsKey !== undefined) {
            return optionsKey;
        }
        if ((this.walletAddress === undefined) || (this.privateKey === undefined)) {
            throw new errors.AuthenticationError(this.id + ' private endpoints require an apiKey, or a walletAddress and privateKey to self-issue one');
        }
        let creds = undefined;
        try {
            creds = await this.fetchApiKey();
        }
        catch (e) {
            // no key exists for this wallet yet (11010) - self-issue one; any other
            // failure (unregistered wallet, disabled issuance) surfaces from the create call
            creds = await this.createApiKey();
        }
        return this.safeString(creds, 'apiKey');
    }
    setApiCredentials(response) {
        //
        //     { "apiKey": "...", "walletAddress": "..." }
        //
        const creds = {
            'apiKey': this.safeString(response, 'apiKey'),
            'walletAddress': this.safeString(response, 'walletAddress'),
        };
        this.options['apiKey'] = creds['apiKey'];
        // checkRequiredCredentials() (called by createOrder()) checks this.apiKey, not
        // options['apiKey'] - keep both in sync, same as deleteApiKey() clearing both
        this.apiKey = creds['apiKey'];
        return creds;
    }
    /**
     * @ignore
     * @method
     * @name opinion#opinionWsUrl
     * @description builds the websocket url - the venue authenticates the whole connection with the apiKey passed as a query parameter, for public and private channels alike
     * @returns {string} the websocket url
     */
    opinionWsUrl() {
        const hasDirectApiKey = !this.isEmptyString(this.apiKey);
        const apiKey = (hasDirectApiKey) ? this.apiKey : this.safeString(this.options, 'apiKey');
        if (apiKey === undefined) {
            throw new errors.AuthenticationError(this.id + ' websocket requires an apiKey - set it directly or call createApiKey()/fetchApiKey() first');
        }
        const wsUrl = this.safeString(this.urls['api'], 'ws', '');
        return wsUrl + '?apikey=' + apiKey;
    }
    ping(client) {
        // the venue keeps the socket open only while application-level heartbeats arrive
        return { 'action': 'HEARTBEAT' };
    }
    /**
     * @ignore
     * @method
     * @name opinion#subscribeOpinionChannel
     * @description subscribes to one venue channel scoped by the binary marketId and waits on the given message hash
     * @param {string} messageHash the internal hash the awaited payload resolves on
     * @param {string} channel the venue channel name (e.g. 'market.depth.diff')
     * @param {int} marketId the numeric binary market id
     * @returns {any} the first resolved payload
     */
    async subscribeOpinionChannel(messageHash, channel, marketId) {
        await this.loadApiKey();
        const url = this.opinionWsUrl();
        const subscriptionKey = channel + ':' + this.numberToString(marketId);
        const subscribeMsg = {
            'action': 'SUBSCRIBE',
            'channel': channel,
            'marketId': marketId,
        };
        return await this.watch(url, messageHash, subscribeMsg, subscriptionKey);
    }
    handleMessage(client, message) {
        // every data payload carries its channel name in msgType; frames without one -
        // subscribe acks and heartbeat echoes - carry nothing to route
        const msgType = this.safeString(message, 'msgType');
        if (msgType === undefined) {
            return;
        }
        if (msgType === 'market.depth.diff') {
            this.handleOrderBook(client, message);
        }
        else if (msgType === 'market.last.price') {
            this.handleTicker(client, message);
        }
        else if (msgType === 'market.last.trade') {
            this.handleTrades(client, message);
        }
        else if (msgType === 'trade.order.update') {
            this.handleOrder(client, message);
        }
        else if (msgType === 'trade.record.new') {
            this.handleMyTrade(client, message);
        }
    }
    /**
     * @ignore
     * @method
     * @name opinion#opinionOutcomeByMarketIdSide
     * @description resolves a cached outcome object from the numeric marketId + outcomeSide (1 yes / 2 no) the user channels report instead of a tokenId - cache-only, returns undefined on a cold cache
     * @param {int} marketId the numeric binary market id
     * @param {int} outcomeSide 1 for the yes token, 2 for the no token
     * @returns {object} the outcome object, or undefined
     */
    opinionOutcomeByMarketIdSide(marketId, outcomeSide) {
        if ((marketId === undefined) || (this.markets === undefined)) {
            return undefined;
        }
        const marketKeys = Object.keys(this.markets);
        const marketKeysLength = marketKeys.length;
        for (let i = 0; i < marketKeysLength; i++) {
            const market = this.markets[marketKeys[i]];
            const info = this.safeDict(market, 'info', {});
            if (this.safeInteger(info, 'marketId') === marketId) {
                const outcomes = this.safeList(market, 'outcomes', []);
                const index = (outcomeSide === 2) ? 1 : 0;
                return this.safeDict(outcomes, index);
            }
        }
        return undefined;
    }
    /**
     * @method
     * @name opinion#watchOrderBook
     * @description streams the order book of an outcome token; the channel is delta-only so the live book is seeded from the REST snapshot
     * @see https://docs.opinion.trade/developer-guide/opinion-websocket/market-channels
     * @param {string} outcome unified outcome or outcome token id
     * @param {int} [limit] the maximum number of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [prediction order book structure](https://docs.ccxt.com/#/?id=prediction-order-book-structure)
     */
    async watchOrderBook(outcome, limit = undefined, params = {}) {
        const outcomeObj = await this.loadOutcome(outcome);
        const info = this.safeDict(outcomeObj, 'info', {});
        const marketId = this.safeInteger(info, 'marketId');
        const sym = this.safeOutcomeSymbol(outcome, outcomeObj);
        const channel = 'market.depth.diff';
        const messageHash = 'orderbook::' + sym;
        await this.loadApiKey();
        const url = this.opinionWsUrl();
        const client = this.client(url);
        const subscriptionKey = channel + ':' + this.numberToString(marketId);
        const isNewSubscription = this.safeValue(client.subscriptions, subscriptionKey) === undefined;
        if (isNewSubscription) {
            await this.seedOrderBook(outcome, sym, limit);
        }
        const subscribeMsg = {
            'action': 'SUBSCRIBE',
            'channel': channel,
            'marketId': marketId,
        };
        const future = this.watch(url, messageHash, subscribeMsg, subscriptionKey);
        if (isNewSubscription) {
            // return the freshly-seeded book immediately instead of blocking until the next delta
            client.resolve(this.safeValue(this.orderbooks, sym), messageHash);
        }
        const orderbook = await future;
        return orderbook.limit();
    }
    async seedOrderBook(outcome, sym, limit = undefined) {
        // the depth channel streams single-level deltas only, so seed the live book from the REST snapshot
        const snapshot = await this.fetchOrderBook(outcome, limit);
        const orderbook = this.orderBook({});
        orderbook.reset(snapshot);
        this.orderbooks[sym] = orderbook;
    }
    handleOrderBook(client, message) {
        //
        //     {
        //         "marketId": 2764,
        //         "tokenId": "19120407572139442221452465677574895365338028945317996490376653704877573103648",
        //         "outcomeSide": 1,
        //         "side": "bids",
        //         "price": "0.2",
        //         "size": "50",
        //         "msgType": "market.depth.diff"
        //     }
        //
        const tokenId = this.safeString(message, 'tokenId');
        const outcomeObj = this.safeDict(this.outcomes_by_id, tokenId);
        const sym = this.safeString(outcomeObj, 'outcome');
        if (sym === undefined) {
            return;
        }
        if (this.safeValue(this.orderbooks, sym) === undefined) {
            // the delta belongs to the market's other token, whose book is not being watched
            return;
        }
        const orderbook = this.orderbooks[sym];
        const sideStr = this.safeString(message, 'side');
        const bookSide = (sideStr === 'bids') ? orderbook['bids'] : orderbook['asks'];
        const price = this.safeNumber(message, 'price');
        const size = this.safeNumber(message, 'size');
        bookSide.storeArray([price, size]);
        const now = this.milliseconds();
        orderbook['timestamp'] = now;
        orderbook['datetime'] = this.iso8601(now);
        client.resolve(orderbook, 'orderbook::' + sym);
    }
    /**
     * @method
     * @name opinion#watchTicker
     * @description streams last-price updates of an outcome token
     * @see https://docs.opinion.trade/developer-guide/opinion-websocket/market-channels
     * @param {string} outcome unified outcome or outcome token id
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [prediction ticker structure](https://docs.ccxt.com/#/?id=prediction-ticker-structure)
     */
    async watchTicker(outcome, params = {}) {
        const outcomeObj = await this.loadOutcome(outcome);
        const info = this.safeDict(outcomeObj, 'info', {});
        const marketId = this.safeInteger(info, 'marketId');
        const sym = this.safeOutcomeSymbol(outcome, outcomeObj);
        const messageHash = 'ticker::' + sym;
        return await this.subscribeOpinionChannel(messageHash, 'market.last.price', marketId);
    }
    handleTicker(client, message) {
        //
        //     {
        //         "tokenId": "19120407572139442221452465677574895365338028945317996490376653704877573103648",
        //         "outcomeSide": 1,
        //         "price": "0.85",
        //         "marketId": 2764,
        //         "msgType": "market.last.price"
        //     }
        //
        const tokenId = this.safeString(message, 'tokenId');
        const outcomeObj = this.safeDict(this.outcomes_by_id, tokenId);
        const sym = this.safeString(outcomeObj, 'outcome');
        if (sym === undefined) {
            return;
        }
        const now = this.milliseconds();
        const last = this.safeNumber(message, 'price');
        const ticker = this.safePredictionTicker({
            'outcome': sym,
            'outcomeId': tokenId,
            'label': this.safeString(outcomeObj, 'label'),
            'market': this.safeString(outcomeObj, 'market'),
            'timestamp': now,
            'datetime': this.iso8601(now),
            'close': last,
            'last': last,
            'info': message,
        }, outcomeObj);
        this.tickers[sym] = ticker;
        client.resolve(ticker, 'ticker::' + sym);
    }
    /**
     * @method
     * @name opinion#watchTrades
     * @description streams public trades of an outcome token
     * @see https://docs.opinion.trade/developer-guide/opinion-websocket/market-channels
     * @param {string} outcome unified outcome or outcome token id
     * @param {int} [since] timestamp in ms of the earliest trade to return
     * @param {int} [limit] the maximum number of trades to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [prediction trade structures](https://docs.ccxt.com/#/?id=prediction-trade-structure)
     */
    async watchTrades(outcome, since = undefined, limit = undefined, params = {}) {
        const outcomeObj = await this.loadOutcome(outcome);
        const info = this.safeDict(outcomeObj, 'info', {});
        const marketId = this.safeInteger(info, 'marketId');
        const sym = this.safeOutcomeSymbol(outcome, outcomeObj);
        const messageHash = 'trades::' + sym;
        const trades = await this.subscribeOpinionChannel(messageHash, 'market.last.trade', marketId);
        return this.filterBySinceLimit(trades, since, limit, 'timestamp', true);
    }
    handleTrades(client, message) {
        //
        //     {
        //         "tokenId": "19120407572139442221452465677574895365338028945317996490376653704877573103648",
        //         "side": "Buy",
        //         "outcomeSide": 1,
        //         "price": "0.85",
        //         "shares": "10",
        //         "amount": "8.5",
        //         "marketId": 2764,
        //         "msgType": "market.last.trade"
        //     }
        //
        const tokenId = this.safeString(message, 'tokenId');
        const outcomeObj = this.safeDict(this.outcomes_by_id, tokenId);
        const sym = this.safeString(outcomeObj, 'outcome');
        if (sym === undefined) {
            return;
        }
        const now = this.milliseconds();
        const trade = this.safePredictionTrade({
            'id': undefined,
            'info': message,
            'timestamp': now,
            'datetime': this.iso8601(now),
            'outcome': sym,
            'outcomeId': tokenId,
            'label': this.safeString(outcomeObj, 'label'),
            'market': this.safeString(outcomeObj, 'market'),
            'order': undefined,
            'type': undefined,
            'side': this.safeStringLower(message, 'side'),
            'takerOrMaker': 'taker',
            'price': this.safeNumber(message, 'price'),
            'amount': this.safeNumber(message, 'shares'),
            'cost': this.safeNumber(message, 'amount'),
            'fee': undefined,
        }, outcomeObj);
        if (this.trades === undefined) {
            this.trades = this.createSafeDictionary();
        }
        if (this.safeValue(this.trades, sym) === undefined) {
            const tradesLimit = this.safeInteger(this.options, 'tradesLimit', 1000);
            this.trades[sym] = new Cache.ArrayCache(tradesLimit);
        }
        const stored = this.trades[sym];
        stored.append(trade);
        client.resolve(stored, 'trades::' + sym);
    }
    /**
     * @method
     * @name opinion#watchOrders
     * @description streams the authenticated user's order updates of one market - the venue channel is per-market, so the outcome argument is required
     * @see https://docs.opinion.trade/developer-guide/opinion-websocket/user-channels
     * @param {string} outcome unified outcome or outcome token id whose market to watch
     * @param {int} [since] timestamp in ms of the earliest order to return
     * @param {int} [limit] the maximum number of orders to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [prediction order structures](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    async watchOrders(outcome = undefined, since = undefined, limit = undefined, params = {}) {
        if (outcome === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' watchOrders() requires an outcome (the order update channel is per-market)');
        }
        const outcomeObj = await this.loadOutcome(outcome);
        const info = this.safeDict(outcomeObj, 'info', {});
        const marketId = this.safeInteger(info, 'marketId');
        const messageHash = 'orders';
        const orders = await this.subscribeOpinionChannel(messageHash, 'trade.order.update', marketId);
        const sym = this.safeOutcomeSymbol(outcome, outcomeObj);
        return this.filterByValueSinceLimit(orders, 'outcome', sym, since, limit, 'timestamp', true);
    }
    /**
     * @ignore
     * @method
     * @name opinion#parseWsOrderStatus
     * @description maps the numeric order status of the websocket order channel onto the unified vocabulary
     * @param {int} status the numeric order status
     * @returns {string} a unified order status, or undefined
     */
    parseWsOrderStatus(status) {
        // per the venue docs: 1 pending, 2 finished, 3 canceled, 4 expired, 5 failed
        if (status === 1) {
            return 'open';
        }
        if (status === 2) {
            return 'closed';
        }
        if (status === 3) {
            return 'canceled';
        }
        if (status === 4) {
            return 'expired';
        }
        if (status === 5) {
            return 'rejected';
        }
        return undefined;
    }
    handleOrder(client, message) {
        //
        //     {
        //         "orderUpdateType": "orderConfirm",
        //         "marketId": 2770,
        //         "rootMarketId": 122,
        //         "orderId": "a11ee07e-e22f-11f0-9714-0a58a9feac02",
        //         "side": 1,
        //         "outcomeSide": 1,
        //         "price": "0.150000000000000000",
        //         "shares": "66.66",
        //         "amount": "9.999000000000000000",
        //         "status": 1,
        //         "tradingMethod": 2,
        //         "quoteToken": "0x55d398326f99059fF775485246999027B3197955",
        //         "createdAt": 1766735464,
        //         "expiresAt": 0,
        //         "chainId": "56",
        //         "filledShares": "10.000000000000000000",
        //         "filledAmount": "1.500000000000000000",
        //         "msgType": "trade.order.update"
        //     }
        //
        const marketId = this.safeInteger(message, 'marketId');
        const outcomeSide = this.safeInteger(message, 'outcomeSide');
        const outcomeObj = this.opinionOutcomeByMarketIdSide(marketId, outcomeSide);
        const timestamp = this.safeTimestamp(message, 'createdAt');
        // unlike the REST order body (0 buy / 1 sell), the websocket channel uses 1 buy / 2 sell
        // per the docs and confirmed live
        const sideInt = this.safeInteger(message, 'side');
        const side = (sideInt === 1) ? 'buy' : 'sell';
        const tradingMethod = this.safeInteger(message, 'tradingMethod');
        const type = (tradingMethod === 1) ? 'market' : 'limit';
        const order = this.safePredictionOrder({
            'id': this.safeString(message, 'orderId'),
            'clientOrderId': undefined,
            'info': message,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'lastTradeTimestamp': undefined,
            'status': this.parseWsOrderStatus(this.safeInteger(message, 'status')),
            'outcome': this.safeString(outcomeObj, 'outcome'),
            'outcomeId': this.safeString(outcomeObj, 'outcomeId'),
            'label': this.safeString(outcomeObj, 'label'),
            'market': this.safeString(outcomeObj, 'market'),
            'type': type,
            'side': side,
            'price': this.safeNumber(message, 'price'),
            'amount': this.safeNumber(message, 'shares'),
            'cost': this.safeNumber(message, 'filledAmount'),
            'filled': this.safeNumber(message, 'filledShares'),
            'fee': undefined,
            'trades': [],
        }, outcomeObj);
        if (this.orders === undefined) {
            const limit = this.safeInteger(this.options, 'ordersLimit', 1000);
            this.orders = new Cache.ArrayCacheByOutcomeById(limit);
        }
        const stored = this.orders;
        stored.append(order);
        client.resolve(stored, 'orders');
    }
    /**
     * @method
     * @name opinion#watchMyTrades
     * @description streams the authenticated user's executed trades of one market - the venue channel is per-market, so the outcome argument is required
     * @see https://docs.opinion.trade/developer-guide/opinion-websocket/user-channels
     * @param {string} outcome unified outcome or outcome token id whose market to watch
     * @param {int} [since] timestamp in ms of the earliest trade to return
     * @param {int} [limit] the maximum number of trades to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [prediction trade structures](https://docs.ccxt.com/#/?id=prediction-trade-structure)
     */
    async watchMyTrades(outcome = undefined, since = undefined, limit = undefined, params = {}) {
        if (outcome === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' watchMyTrades() requires an outcome (the trade record channel is per-market)');
        }
        const outcomeObj = await this.loadOutcome(outcome);
        const info = this.safeDict(outcomeObj, 'info', {});
        const marketId = this.safeInteger(info, 'marketId');
        const messageHash = 'myTrades';
        const trades = await this.subscribeOpinionChannel(messageHash, 'trade.record.new', marketId);
        const sym = this.safeOutcomeSymbol(outcome, outcomeObj);
        return this.filterByValueSinceLimit(trades, 'outcome', sym, since, limit, 'timestamp', true);
    }
    handleMyTrade(client, message) {
        //
        //     {
        //         "orderId": "3c7af25f-e21f-11f0-9714-0a58a9feac02",
        //         "tradeNo": "e1403840-e22f-11f0-83af-0a58a9feac02",
        //         "marketId": 2770,
        //         "rootMarketId": 122,
        //         "txHash": "0x272c...4195",
        //         "side": "Buy",
        //         "outcomeSide": 2,
        //         "price": "0.100000000000000000",
        //         "shares": "9.44444",
        //         "amount": "0.944444",
        //         "profit": "0.000000000000000000",
        //         "status": 2,
        //         "quoteToken": "0x55d398326f99059fF775485246999027B3197955",
        //         "fee": "0.000000000000000000",
        //         "chainId": "56",
        //         "createdAt": 1766735571,
        //         "msgType": "trade.record.new"
        //     }
        //
        const marketId = this.safeInteger(message, 'marketId');
        const outcomeSide = this.safeInteger(message, 'outcomeSide');
        const outcomeObj = this.opinionOutcomeByMarketIdSide(marketId, outcomeSide);
        const sym = this.safeString(outcomeObj, 'outcome');
        const timestamp = this.safeTimestamp(message, 'createdAt');
        const trade = this.safePredictionTrade({
            'id': this.safeString(message, 'tradeNo'),
            'info': message,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'outcome': sym,
            'outcomeId': this.safeString(outcomeObj, 'outcomeId'),
            'label': this.safeString(outcomeObj, 'label'),
            'market': this.safeString(outcomeObj, 'market'),
            'order': this.safeString(message, 'orderId'),
            'type': undefined,
            'side': this.safeStringLower(message, 'side'),
            'takerOrMaker': undefined,
            'price': this.safeNumber(message, 'price'),
            'amount': this.safeNumber(message, 'shares'),
            'cost': this.safeNumber(message, 'amount'),
            'fee': {
                'cost': this.safeNumber(message, 'fee'),
                'currency': 'USDT',
            },
        }, outcomeObj);
        if (this.myTrades === undefined) {
            const myTradesLimit = this.safeInteger(this.options, 'myTradesLimit', 1000);
            this.myTrades = new Cache.ArrayCacheByOutcomeById(myTradesLimit);
        }
        const stored = this.myTrades;
        stored.append(trade);
        client.resolve(stored, 'myTrades');
    }
    handleErrors(code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return undefined;
        }
        const errno = this.safeInteger(response, 'errno');
        if ((errno !== undefined) && (errno !== 0)) {
            const errmsg = this.safeString(response, 'errmsg', '');
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException(this.exceptions['exact'], this.numberToString(errno), feedback);
            this.throwBroadlyMatchedException(this.exceptions['broad'], errmsg, feedback);
            throw new errors.ExchangeError(feedback);
        }
        return undefined;
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
    sign(path, api = 'opinion', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const apiGroup = typeof api === 'string' ? api : api[0];
        const access = typeof api === 'string' ? 'public' : api[1];
        const baseUrls = this.urls['api'];
        const baseUrl = this.safeString(baseUrls, apiGroup, baseUrls['opinion']);
        let url = baseUrl + '/' + this.implodeParams(path, params);
        const query = this.omit(params, this.extractParams(path));
        const existingHeaders = (headers !== undefined) ? headers : {};
        headers = this.extend({
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        }, existingHeaders);
        if (access === 'private') {
            if (path === 'auth/api-key') {
                // wallet-signature scheme: no apiKey involved, the signature itself is the credential
                if ((this.walletAddress === undefined) || (this.privateKey === undefined)) {
                    throw new errors.ArgumentsRequired(this.id + ' ' + path + ' requires a walletAddress and privateKey');
                }
                const actionByMethod = { 'POST': 'create', 'GET': 'get', 'DELETE': 'delete' };
                const action = this.safeString(actionByMethod, method, 'get');
                const timestamp = this.numberToString(this.seconds());
                headers['OPINION_ADDRESS'] = this.walletAddress;
                headers['OPINION_SIGNATURE'] = this.signApiKeyAuth(this.walletAddress, action, timestamp);
                headers['OPINION_TIMESTAMP'] = timestamp;
            }
            else {
                // an empty this.apiKey counts as absent - deleteApiKey clears it to '' (the
                // strict base types the credential as string, undefined can not be assigned)
                const hasDirectApiKey = !this.isEmptyString(this.apiKey);
                const apiKey = (hasDirectApiKey) ? this.apiKey : this.safeString(this.options, 'apiKey');
                if (apiKey === undefined) {
                    throw new errors.AuthenticationError(this.id + ' ' + path + ' requires an apiKey - set it directly or call createApiKey()/fetchApiKey() first');
                }
                headers['apikey'] = apiKey;
            }
        }
        if (method === 'GET') {
            if (Object.keys(query).length) {
                url += '?' + this.urlencode(query);
            }
        }
        else {
            body = this.json(query);
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}

exports["default"] = opinion;
