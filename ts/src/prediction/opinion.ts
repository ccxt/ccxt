import Exchange from '../abstract/prediction/opinion.js';
import { ecdsa } from '../base/functions/crypto.js';
import { secp256k1 } from '@noble/curves/secp256k1.js';
import { keccak_256 as keccak } from '@noble/hashes/sha3.js';
import { AuthenticationError, ArgumentsRequired } from '../base/errors.js';
import type { Dict, Market, PredictionEvent, fetchEventsParams } from '../base/types.js';

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
                'prediction': true,
                'fetchMarkets': true,
                'fetchEvent': true,
                'fetchEvents': true,
            },
            'timeframes': {
                '1m': '1m',
                '1h': '1h',
                '1d': '1d',
                '1w': '1w',
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
                'fetchEventsLimit': 20,        
                'maxFetchMarketsPages': 50,
            },
        });
    }

    /**
     * @method
     * @name opinion#fetchMarkets
     * @description fetches every kind of Opinion market (standalone binaries and categorical parents);
     * categorical parents double as our unified "events" and are cached into this.events as a side effect
     * @param {object} [params] extra parameters
     * @returns {object[]} a list of market structures
     */
    async fetchMarkets (params = {}): Promise<Market[]> {
        const rest = this.omit (params, [ 'limit' ]);
        const userLimit = this.safeInteger (params, 'limit');
        const pageLimit = this.safeInteger (this.options, 'fetchEventsLimit', 20);
        const maxPages = this.safeInteger (this.options, 'maxFetchMarketsPages', 50);
        const flatMarkets: Market[] = [];
        const eventsDict: Dict = {};
        let page = 1;
        while (page <= maxPages) {
            const request: Dict = {
                'marketType': 2,
                'limit': pageLimit,
                'page': page,
            };
            const response = await this.opinionPublicGetMarket (this.extend (request, rest));
            const result = this.safeDict (response, 'result', {});
            const rawList = this.safeList (result, 'list', []);
            const rawListLength = rawList.length;
            for (let i = 0; i < rawListLength; i++) {
                const raw = rawList[i];
                const marketType = this.safeInteger (raw, 'marketType');
                if (marketType === 1) {
                    const event = this.parseEvent (raw);
                    const childMarkets = event['markets'];
                    const childMarketsLength = childMarkets.length;
                    for (let ci = 0; ci < childMarketsLength; ci++) {
                        flatMarkets.push (childMarkets[ci] as unknown as Market);
                    }
                    eventsDict[event['event']] = event;
                } else {
                    flatMarkets.push (this.parseMarket (raw));
                }
            }
            const collectedLength = flatMarkets.length;
            if ((rawListLength < pageLimit) || ((userLimit !== undefined) && (collectedLength >= userLimit))) {
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

    parseMarket (raw: Dict, eventSlug: any = undefined): Market {
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
        let handleEventSlug = eventSlug;
        if ((eventSlug !== undefined) && (slug !== undefined) && (slug.indexOf (eventSlug) === 0)) {
            handleEventSlug = undefined;
        }
        const marketSymbol = this.slugToMarketSymbol (handleEventSlug, slug);
        const statusEnum = this.safeString (raw, 'statusEnum');
        const active = (statusEnum === 'Activated');
        const resolved = (statusEnum === 'Resolved');
        const resultTokenId = this.safeString (raw, 'resultTokenId');
        const hasResult = resolved && (resultTokenId !== undefined) && (resultTokenId !== '');
        const outcomeDefs = [
            [ this.safeString (raw, 'yesLabel', 'YES'), this.safeString (raw, 'yesTokenId') ],
            [ this.safeString (raw, 'noLabel', 'NO'), this.safeString (raw, 'noTokenId') ],
        ];
        const outcomes: any[] = [];
        let resolvedOutcome = undefined;
        for (let i = 0; i < outcomeDefs.length; i++) {
            const label = outcomeDefs[i][0];
            const tokenId = outcomeDefs[i][1];
            const outcomeHandle = this.slugToOutcomeSymbol (handleEventSlug, slug, label);
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
        const marketResolvedOutcome = resolvedOutcome;
        const end = this.safeTimestamp (raw, 'cutoffAt');
        const created = this.safeTimestamp (raw, 'createdAt');
        return {
            'id': marketId,
            'market': marketSymbol,
            'base': undefined,
            'quote': undefined,
            'settle': undefined,
            'baseId': undefined,
            'quoteId': this.safeString (raw, 'quoteToken'),
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
            'expiry': end,
            'expiryDatetime': this.iso8601 (end),
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
     * @param {object} [params] extra parameters, see {@link https://docs.ccxt.com/#/?id=prediction-markets the prediction unified API}
     * @param {int} [params.labelId] filter by Opinion category label id (see fetchLabels-style discovery via the /label endpoint)
     * @returns {object[]} a list of prediction event structures
     */
    async fetchEvents (params: fetchEventsParams = {}): Promise<PredictionEvent[]> {
        this.requireEventQuery (params);
        const queries = this.parseSearchQueries (params);
        const eventId = this.safeString (params, 'eventId');
        const slug = this.safeString (params, 'slug');
        if ((eventId !== undefined) || (slug !== undefined)) {
            const singleId = (eventId !== undefined) ? eventId : slug;
            const singleRest = this.omit (params, [ 'eventId', 'slug', 'query', 'queries', 'tags', 'status', 'sort', 'searchIn', 'limit' ]);
            const single = await this.fetchEvent (singleId, singleRest);
            return this.applyEventFetchParams ([ single ], params, queries);
        }
        const rest = this.omit (params, [ 'query', 'queries', 'tags', 'status', 'sort', 'searchIn', 'limit' ]);
        const userLimit = this.safeInteger (params, 'limit');
        const pageLimit = this.safeInteger (this.options, 'fetchEventsLimit', 20);
        const limit = (userLimit !== undefined) ? Math.min (userLimit, pageLimit) : pageLimit;
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
        for (let i = 0; i < rawEventsLength; i++) {
            const event = this.parseEvent (rawEvents[i]);
            parsedEvents.push (event);
            this.indexEventOutcomes (event);
        }
        return this.applyEventFetchParams (parsedEvents, params, queries);
    }

    /**
     * @method
     * @name opinion#fetchEvent
     * @description fetches a single categorical Opinion market (our unified "event") by id or slug
     * @param {string} id the numeric marketId, or the market slug (contains a '-')
     * @param {object} [params] extra parameters
     * @returns {object} a prediction event structure
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
        const event = this.parseEvent (data);
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
        const markets: any[] = [];
        for (let i = 0; i < rawChildrenLength; i++) {
            markets.push (this.parseMarket (rawChildren[i], slug));
        }
        const statusEnum = this.safeString (rawEvent, 'statusEnum');
        const active = (statusEnum === 'Activated');
        const resolved = (statusEnum === 'Resolved');
        const end = this.safeTimestamp (rawEvent, 'cutoffAt');
        const created = this.safeTimestamp (rawEvent, 'createdAt');
        const labels = this.safeList (rawEvent, 'labels', []);
        return {
            'id': eventId,
            'event': eventHandle,
            'title': title,
            'description': this.safeString (rawEvent, 'rules'),
            'slug': slug,
            'category': this.safeString (labels, 0),
            'tags': labels,
            'markets': markets,
            'active': active,
            'resolved': resolved,
            'volume': this.safeNumber (rawEvent, 'volume'),
            'created': created,
            'createdDatetime': this.iso8601 (created),
            'end': end,
            'endDatetime': this.iso8601 (end),
            'image': this.safeString2 (rawEvent, 'coverUrl', 'thumbnailUrl'),
            'info': rawEvent,
        };
    }

    hashMessage (message: any): string {
        return '0x' + this.hash (message, keccak, 'hex');
    }

    signHash (hash: string, privateKey: string): Dict {
        const signature = ecdsa (hash.slice (-64), privateKey.slice (-64), secp256k1, undefined);
        const r = signature['r'].padStart (64, '0');
        const s = signature['s'].padStart (64, '0');
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
     * @ignore
     * @method
     * @name opinion#createApiKey
     * @description self-service creation of an Open API key linked to this.walletAddress via
     * an EIP-712-signed request - there is no "generate key" button in the Opinion GUI, this is
     * the only documented way to obtain a wallet-linked key
     * @param {object} [params] extra parameters
     * @returns {object} raw response, result.apiKey holds the issued key
     */
    async createApiKey (params = {}): Promise<Dict> {
        return await this.opinionPrivatePostAuthApiKey (params);
    }

    /**
     * @ignore
     * @method
     * @name opinion#fetchApiKey
     * @description fetches the currently active Open API key for this.walletAddress
     * @param {object} [params] extra parameters
     * @returns {object} raw response, result.apiKey holds the active key
     */
    async fetchApiKey (params = {}): Promise<Dict> {
        return await this.opinionPrivateGetAuthApiKey (params);
    }

    /**
     * @ignore
     * @method
     * @name opinion#deleteApiKey
     * @description revokes the Open API key for this.walletAddress
     * @param {object} [params] extra parameters
     * @returns {object} raw response, result.deleted confirms revocation
     */
    async deleteApiKey (params = {}): Promise<Dict> {
        return await this.opinionPrivateDeleteAuthApiKey (params);
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
        const [ id, access ] = Array.isArray (api) ? api : [ 'opinion', api ];
        let url = this.urls['api'][id] + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        const existingHeaders = (headers !== undefined) ? headers : {};
        headers = this.extend ({
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        }, existingHeaders);
        if (access === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
            return { 'url': url, 'method': method, 'body': body, 'headers': headers };
        }
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
            headers['apikey'] = this.apiKey;
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
