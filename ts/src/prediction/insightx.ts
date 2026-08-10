import Exchange from '../abstract/prediction/insightx.js';
import { AuthenticationError, BadSymbol, ExchangeError, InsufficientFunds, InvalidOrder, OrderNotFound, PermissionDenied } from '../base/errors.js';
import { Precise } from '../base/Precise.js';
import type { Bool, Dict, Int, Market, Num, PredictionEvent, Str, fetchEventsParams, int } from '../base/types.js';

// ---------------------------------------------------------------------------

/**
 * @class insightx
 * @augments Exchange
 */
export default class insightx extends Exchange {
    override describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'insightx',
            'name': 'InsightX',
            'countries': [],
            'version': 'v2',
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
                'fetchEvent': true,
                'fetchEvents': true,
                'fetchMarkets': true,
                'prediction': true,
            },
            'urls': {
                'api': {
                    'insightx': 'https://mainnet-api.insightx.finance',
                },
                'www': 'https://insightx.finance',
                'doc': [ 'https://insightx-2.gitbook.io' ],
            },
            'api': {
                'insightx': {
                    'public': {
                        'get': {
                            'wallet/tip_info': 1,
                            'predict/v2/markets': 1,
                            'predict/v2/market': 1,
                        },
                        'post': {
                            'wallet/connect': 1,
                        },
                    },
                    'private': {
                        'get': {
                            'predict/v2/position': 1,
                            'predict/v2/orders': 1,
                        },
                        'post': {
                            'predict/v2/place-order': 1,
                            'predict/v2/cancel-order': 1,
                        },
                    },
                },
            },
            'requiredCredentials': {
                'apiKey': false,
                'secret': false,
                'walletAddress': false,
                'privateKey': true,
                'token': false,
            },
            'exceptions': {
                'exact': {
                    '40001': AuthenticationError, // Invalid Signature
                    '40002': AuthenticationError, // JWT Expired
                    '40003': AuthenticationError, // Invalid JWT
                    '4001': BadSymbol, // Market Not Found
                    '4002': OrderNotFound, // Order Not Found
                    '4003': InvalidOrder, // Order Already Filled
                    '4004': PermissionDenied, // Unauthorized Order
                    '4005': InsufficientFunds,
                    '4008': InvalidOrder, // Market Closed
                    '5000': ExchangeError, // Internal Error
                },
                'broad': {},
            },
            'options': {
                'defaultNetwork': 'mantle_mainnet',
                'chainId': 5000,
                'tradingContract': '0xD22A5FFdb71221B7b2F081e2679C8A0149d58BE9',
                'defaultMarketStatus': 1,
                'marketsPageSize': 100,
                'fetchMarketsLimit': 100,
            },
        });
    }

    /**
     * @ignore
     * @method
     * @name insightx#eventIdToHandle
     * @description converts an insightx event id into a stable unified event handle
     * @param {string} eventId raw insightx event id
     * @returns {string} the unified event handle
     */
    eventIdToHandle (eventId: Str): string {
        if (eventId === undefined) {
            throw new ExchangeError (this.id + ' eventIdToHandle() requires an event id');
        }
        return this.shortenSlug ('insightx-event-' + eventId);
    }

    /**
     * @ignore
     * @method
     * @name insightx#parseCommaSeparatedValues
     * @description parses a comma-separated insightx response field into trimmed string values
     * @param {string} value comma-separated values
     * @returns {string[]} the parsed values
     */
    parseCommaSeparatedValues (value: Str): string[] {
        if ((value === undefined) || (value === '')) {
            return [];
        }
        const parts = value.split (',');
        const result: string[] = [];
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i].trim ();
            if (part !== '') {
                result.push (part);
            }
        }
        return result;
    }

    /**
     * @ignore
     * @method
     * @name insightx#fetchRawMarkets
     * @description fetches a bounded page range of raw insightx markets
     * @see https://insightx-2.gitbook.io/whitepaper/insightx-whitepaper/10.-developer-resources-and-api-integration#id-10.6-market-data
     * @param {object} [params] extra exchange-specific parameters
     * @param {int} [params.page] page number to start from, defaults to 1
     * @param {int} [params.size] number of markets per request, defaults to 100
     * @param {int} [params.limit] maximum number of markets to collect, defaults to 100
     * @param {int} [params.marketStatus] raw insightx market status, defaults to 1 (active)
     * @returns {object[]} a list of raw insightx market objects
     */
    async fetchRawMarkets (params = {}): Promise<Dict[]> {
        const maxMarkets = this.safeInteger (params, 'limit', this.safeInteger (this.options, 'fetchMarketsLimit', 100));
        const initialPage = this.safeInteger (params, 'page', 1);
        let pageSize = this.safeInteger (params, 'size', this.safeInteger (this.options, 'marketsPageSize', 100));
        if (pageSize > maxMarkets) {
            pageSize = maxMarkets;
        }
        const unifiedStatus = this.safeString (params, 'status');
        const marketStatus = this.safeInteger (params, 'marketStatus');
        const statuses: int[] = [];
        if (marketStatus !== undefined) {
            statuses.push (marketStatus);
        } else if ((unifiedStatus === 'closed') || (unifiedStatus === 'inactive')) {
            statuses.push (2);
            statuses.push (3);
            statuses.push (4);
        } else if (unifiedStatus === 'all') {
            statuses.push (1);
            statuses.push (2);
            statuses.push (3);
            statuses.push (4);
        } else {
            statuses.push (this.safeInteger (this.options, 'defaultMarketStatus', 1));
        }
        const rest = this.omit (params, [ 'query', 'queries', 'searchIn', 'sort', 'tags', 'eventId', 'slug', 'limit', 'page', 'size', 'status', 'marketStatus' ]);
        const result: Dict[] = [];
        let collected = 0;
        for (let statusIndex = 0; statusIndex < statuses.length; statusIndex++) {
            let page = initialPage;
            while (collected < maxMarkets) {
                const request: Dict = {
                    'page': page,
                    'size': pageSize,
                    'status': statuses[statusIndex],
                };
                const response = await this.insightxPublicGetPredictV2Markets (this.extend (request, rest));
                const data = this.safeDict (response, 'data', {});
                const markets = this.safeList (data, 'list', []);
                const marketsLength = markets.length;
                for (let i = 0; i < marketsLength; i++) {
                    if (collected < maxMarkets) {
                        result.push (this.safeDict (markets, i, {}));
                        collected = this.sum (collected, 1);
                    }
                }
                if ((marketsLength === 0) || (marketsLength < pageSize) || (collected >= maxMarkets)) {
                    break;
                }
                page = this.sum (page, 1);
            }
        }
        return result;
    }

    /**
     * @ignore
     * @method
     * @name insightx#parseEvents
     * @description groups raw insightx markets by event_id and parses them into unified events
     * @param {object[]} rawMarkets raw insightx market objects
     * @returns {object[]} a list of prediction event structures
     */
    parseEvents (rawMarkets: Dict[]): PredictionEvent[] {
        const grouped: Dict = {};
        for (let i = 0; i < rawMarkets.length; i++) {
            const raw = rawMarkets[i];
            const eventId = this.safeString (raw, 'event_id', this.safeString (raw, 'id'));
            if (eventId !== undefined) {
                const rows = this.safeList (grouped, eventId, []);
                rows.push (raw);
                grouped[eventId] = rows;
            }
        }
        const result: PredictionEvent[] = [];
        const eventIds = Object.keys (grouped);
        for (let i = 0; i < eventIds.length; i++) {
            const rows = this.safeList (grouped, eventIds[i], []);
            result.push (this.parseEvent (rows));
        }
        return result;
    }

    /**
     * @method
     * @name insightx#fetchMarkets
     * @description fetches a bounded list of insightx prediction markets and their YES/NO outcomes
     * @see https://insightx-2.gitbook.io/whitepaper/insightx-whitepaper/10.-developer-resources-and-api-integration#id-10.6-market-data
     * @param {object} [params] extra exchange-specific parameters
     * @param {int} [params.page] page number to start from, defaults to 1
     * @param {int} [params.size] number of markets per request, defaults to 100
     * @param {int} [params.limit] maximum number of markets to collect, defaults to 100
     * @param {string} [params.status] unified event status, 'active', 'closed', 'inactive' or 'all'
     * @param {int} [params.marketStatus] raw insightx market status, defaults to 1 (active)
     * @param {string} [params.query] client-side title or description filter over the bounded result
     * @param {string[]} [params.queries] multiple client-side search terms
     * @returns {object[]} an array of prediction market structures
     */
    override async fetchMarkets (params = {}): Promise<Market[]> {
        const events = await this.fetchEvents (params);
        const result: Market[] = [];
        for (let i = 0; i < events.length; i++) {
            const markets = this.safeList (events[i], 'markets', []);
            for (let j = 0; j < markets.length; j++) {
                result.push (markets[j] as Market);
            }
        }
        return result;
    }

    /**
     * @method
     * @name insightx#fetchEvents
     * @description fetches a bounded market listing, groups rows by event_id, and caches each event's markets and outcomes
     * @see https://insightx-2.gitbook.io/whitepaper/insightx-whitepaper/10.-developer-resources-and-api-integration#id-10.6-market-data
     * @param {object} [params] extra exchange-specific parameters
     * @param {string} [params.query] client-side title or description filter over the bounded result
     * @param {string[]} [params.queries] multiple client-side search terms
     * @param {string} [params.searchIn] 'title', 'description' or 'both', defaults to 'both' when searching
     * @param {string[]} [params.tags] client-side tag filter over the bounded result
     * @param {string} [params.eventId] raw market id for a direct market-detail lookup
     * @param {int} [params.page] page number to start from, defaults to 1
     * @param {int} [params.size] number of markets per request, defaults to 100
     * @param {int} [params.limit] maximum number of markets to collect, defaults to 100
     * @param {string} [params.status] unified event status, 'active', 'closed', 'inactive' or 'all'
     * @param {int} [params.marketStatus] raw insightx market status, defaults to 1 (active)
     * @returns {object[]} an array of prediction event structures
     */
    override async fetchEvents (params: fetchEventsParams = {}): Promise<PredictionEvent[]> {
        const eventId = this.safeString (params, 'eventId');
        const queries = this.parseSearchQueries (params);
        let events: PredictionEvent[] = [];
        if (eventId !== undefined) {
            const directParams = this.omit (params, [ 'eventId', 'query', 'queries', 'searchIn', 'sort', 'tags', 'limit', 'page', 'size', 'status', 'marketStatus' ]);
            events = [ await this.fetchEvent (eventId, directParams) ];
        } else {
            const rawMarkets = await this.fetchRawMarkets (params);
            events = this.parseEvents (rawMarkets);
        }
        if (this.markets === undefined) {
            this.markets = this.createSafeDictionary ();
        }
        for (let i = 0; i < events.length; i++) {
            const markets = this.safeList (events[i], 'markets', []);
            for (let j = 0; j < markets.length; j++) {
                const market = this.safeDict (markets, j, {});
                const marketHandle = this.safeString (market, 'market');
                if (marketHandle !== undefined) {
                    this.markets[marketHandle] = market;
                }
            }
        }
        this.setEvents (events);
        this.populateOutcomes ();
        const queriesLength = queries.length;
        let postParams = params;
        if ((queriesLength > 0) && (this.safeString (params, 'searchIn') === undefined)) {
            postParams = this.extend ({ 'searchIn': 'both' }, postParams);
        }
        return this.applyEventFetchParams (events, postParams, queries);
    }

    /**
     * @method
     * @name insightx#fetchEvent
     * @description fetches one insightx market by raw market id and wraps its parent event as a partial single-market event
     * @see https://insightx-2.gitbook.io/whitepaper/insightx-whitepaper/10.-developer-resources-and-api-integration#id-10.6-market-data
     * @param {string} id raw insightx market id
     * @param {object} [params] extra exchange-specific parameters
     * @returns {object} a prediction event structure containing the requested market
     */
    override async fetchEvent (id: string, params = {}): Promise<PredictionEvent> {
        const request: Dict = {
            'market_id': id,
        };
        const response = await this.insightxPublicGetPredictV2Market (this.extend (request, params));
        const raw = this.safeDict (response, 'data', {});
        const event = this.parseEvent ([ raw ]);
        this.setEvents ([ event ]);
        this.indexEventOutcomes (event);
        return event;
    }

    /**
     * @ignore
     * @method
     * @name insightx#parseEvent
     * @description parses one or more raw insightx markets sharing an event_id into a unified event
     * @param {object[]} rawMarkets raw insightx market objects sharing an event_id
     * @returns {object} a prediction event structure
     */
    parseEvent (rawMarkets: Dict[]): PredictionEvent {
        const first = this.safeDict (rawMarkets, 0, {});
        const eventId = this.safeString (first, 'event_id', this.safeString (first, 'id'));
        if (eventId === undefined) {
            throw new ExchangeError (this.id + ' parseEvent() requires an event_id or id');
        }
        const eventHandle = this.eventIdToHandle (eventId);
        const markets: any[] = [];
        let active = false;
        let resolved = true;
        let volume = '0';
        let created: Int = undefined;
        let end: Int = undefined;
        for (let i = 0; i < rawMarkets.length; i++) {
            const raw = rawMarkets[i];
            const market = this.parseMarket (raw);
            markets.push (market);
            if (this.safeBool (market, 'active', false)) {
                active = true;
            }
            if (!this.safeBool (market, 'resolved', false)) {
                resolved = false;
            }
            const marketVolume = this.safeString (raw, 'total_volume');
            if (marketVolume !== undefined) {
                const summedVolume = Precise.stringAdd (volume, marketVolume);
                if (summedVolume !== undefined) {
                    volume = summedVolume;
                }
            }
            const marketCreated = this.safeTimestamp (raw, 'created_at');
            if ((marketCreated !== undefined) && ((created === undefined) || (marketCreated < created))) {
                created = marketCreated;
            }
            const marketEnd = this.safeTimestamp (raw, 'end_time');
            if ((marketEnd !== undefined) && ((end === undefined) || (marketEnd > end))) {
                end = marketEnd;
            }
        }
        return {
            'id': eventId,
            'event': eventHandle,
            'slug': undefined,
            'title': this.safeString (first, 'title'),
            'description': this.safeString (first, 'description'),
            'category': this.safeString (first, 'category'),
            'tags': this.parseCommaSeparatedValues (this.safeString (first, 'tags')),
            'markets': markets,
            'active': active,
            'resolved': resolved,
            'volume': this.parseNumber (volume),
            'liquidity': undefined,
            'created': created,
            'createdDatetime': this.iso8601 (created),
            'end': end,
            'endDatetime': this.iso8601 (end),
            'image': this.safeString2 (first, 'image_url', 'banner'),
            'url': undefined,
            'info': { 'markets': rawMarkets },
        };
    }

    /**
     * @ignore
     * @method
     * @name insightx#parseMarket
     * @description parses a raw insightx binary market and its YES/NO outcomes
     * @param {object} raw raw insightx market object
     * @returns {object} a prediction market structure
     */
    override parseMarket (raw: Dict): Market {
        const marketId = this.safeString (raw, 'id');
        if (marketId === undefined) {
            throw new ExchangeError (this.id + ' parseMarket() requires an id');
        }
        const eventId = this.safeString (raw, 'event_id', marketId);
        const eventHandle = this.eventIdToHandle (eventId);
        const identifier = this.safeString (raw, 'identifier', marketId);
        const marketHandle = this.slugToMarketSymbol (eventHandle, identifier);
        const status = this.safeInteger (raw, 'status');
        const active = status === 1;
        const closed = (status !== undefined) && (status !== 1);
        const winnerIndex = this.safeInteger (raw, 'winner_idx', 0);
        const resolved = (status === 3) && (winnerIndex > 0);
        const end = this.safeTimestamp (raw, 'end_time');
        const created = this.safeTimestamp (raw, 'created_at');
        const pricePrecision = 0.0001;
        const labels: Str[] = [
            this.safeString (raw, 'outcome0_name', 'Yes'),
            this.safeString (raw, 'outcome1_name', 'No'),
        ];
        let prices: any[] = [];
        const parsedPrices = this.parseJson (this.safeString (raw, 'outcome_prices', '[]'));
        if (parsedPrices !== undefined) {
            prices = parsedPrices as any[];
        }
        const sourceTokenIds = this.parseCommaSeparatedValues (this.safeString (raw, 'poly_clob_token_ids'));
        const outcomes: any[] = [];
        let resolvedOutcome: Str = undefined;
        for (let i = 0; i < labels.length; i++) {
            const outcomeIndex = this.sum (i, 1);
            const label = labels[i];
            const outcomeHandle = this.slugToOutcomeSymbol (eventHandle, identifier, label);
            const outcomeId = marketId + ':' + this.numberToString (outcomeIndex);
            const price = this.safeNumber (prices, i);
            let winnerRaw: Bool = undefined;
            let settleFractionRaw: Num = undefined;
            if (resolved) {
                winnerRaw = outcomeIndex === winnerIndex;
                settleFractionRaw = winnerRaw ? 1 : 0;
                if (winnerRaw) {
                    resolvedOutcome = outcomeHandle;
                }
            }
            const winner = winnerRaw;
            const settleFraction = settleFractionRaw;
            outcomes.push ({
                'outcome': outcomeHandle,
                'outcomeId': outcomeId,
                'label': label,
                'market': marketHandle,
                'marketId': marketId,
                'event': eventHandle,
                'price': price,
                'active': active,
                'winner': winner,
                'settleFraction': settleFraction,
                'precision': {
                    'amount': undefined,
                    'price': pricePrecision,
                },
                'info': {
                    'outcome_idx': outcomeIndex,
                    'source_token_id': this.safeString (sourceTokenIds, i),
                },
            });
        }
        return {
            'id': marketId,
            'market': marketHandle,
            'event': eventHandle,
            'marketType': 'binary',
            'executionModel': 'clob',
            'title': this.safeString (raw, 'title'),
            'description': this.safeString (raw, 'description'),
            'outcomes': outcomes,
            'collateral': undefined,
            'active': active,
            'closed': closed,
            'resolved': resolved,
            'resolvedOutcome': resolvedOutcome,
            'created': created,
            'createdDatetime': this.iso8601 (created),
            'end': end,
            'endDatetime': this.iso8601 (end),
            'volume': this.safeNumber (raw, 'total_volume'),
            'liquidity': undefined,
            'tickSize': pricePrecision,
            'resolutionSource': undefined,
            'image': this.safeString2 (raw, 'image_url', 'banner'),
            'base': marketId,
            'quote': undefined,
            'settle': undefined,
            'baseId': marketId,
            'quoteId': undefined,
            'settleId': undefined,
            'type': 'prediction',
            'spot': false,
            'margin': false,
            'swap': false,
            'future': false,
            'option': false,
            'prediction': true,
            'contract': false,
            'linear': undefined,
            'inverse': undefined,
            'contractSize': undefined,
            'expiry': end,
            'expiryDatetime': this.iso8601 (end),
            'strike': undefined,
            'optionType': undefined,
            'percentage': true,
            'tierBased': false,
            'precision': {
                'amount': undefined,
                'price': pricePrecision,
            },
            'limits': {
                'leverage': { 'min': 1, 'max': 1 },
                'amount': { 'min': undefined, 'max': undefined },
                'price': { 'min': 0.0001, 'max': 0.9999 },
                'cost': { 'min': undefined, 'max': undefined },
            },
            'info': raw,
        } as unknown as Market;
    }

    /**
     * @ignore
     * @method
     * @name insightx#handleErrors
     * @description maps insightx response error codes to ccxt exceptions
     */
    override handleErrors (statusCode: int, statusText: string, url: string, method: string, responseHeaders: Dict, responseBody: string, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return undefined;
        }
        const errorCode = this.safeString (response, 'errno');
        if ((errorCode === undefined) || (errorCode === '0')) {
            return undefined;
        }
        const feedback = this.id + ' ' + responseBody;
        this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
        throw new ExchangeError (feedback);
    }

    /**
     * @ignore
     * @method
     * @name insightx#sign
     * @description builds insightx request URLs, JSON bodies, and JWT headers for authenticated endpoints
     * @param {string} path endpoint path
     * @param {string|string[]} api api group and access level
     * @param {string} method HTTP method
     * @param {object} params request parameters
     * @param {object} [headers] request headers
     * @param {string} [body] request body
     * @returns {object} a dictionary containing url, method, body and headers
     */
    override sign (path: any, api: any = 'insightx', method = 'GET', params = {}, headers: any = undefined, body: any = undefined) {
        const apiGroup: string = typeof api === 'string' ? api : api[0];
        const access: string = typeof api === 'string' ? 'public' : api[1];
        const baseUrls = this.urls['api'] as Dict;
        const baseUrl = this.safeString (baseUrls, apiGroup, baseUrls['insightx']);
        let url = baseUrl + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (method === 'GET') {
            const queryString = this.urlencode (query);
            if (queryString !== '') {
                url = url + '?' + queryString;
            }
        } else {
            body = this.json (query);
        }
        const existingHeaders = (headers !== undefined) ? headers : {};
        headers = this.extend ({
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        }, existingHeaders);
        if (access === 'private') {
            const hasToken = (this.token !== undefined) && (this.token.length > 0);
            if (!hasToken) {
                throw new AuthenticationError (this.id + ' requires a JWT token for private API requests');
            }
            headers['jwt-token'] = this.token;
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}
