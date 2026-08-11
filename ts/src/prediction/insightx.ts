import Exchange from '../abstract/prediction/insightx.js';
import { AuthenticationError, BadSymbol, ExchangeError, InsufficientFunds, InvalidOrder, OrderNotFound, PermissionDenied } from '../base/errors.js';
import { Precise } from '../base/Precise.js';
import type { Bool, Dict, Int, Market, Num, PredictionEvent, PredictionTicker, PredictionTickers, Str, Strings, fetchEventsParams, int } from '../base/types.js';

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
                'fetchEvent': false,
                'fetchEvents': true,
                'fetchMarkets': true,
                'fetchOutcome': true,
                'fetchTicker': true,
                'fetchTickers': true,
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
     * @param {int} [params.marketLimit] maximum number of markets to collect before completing the current event, defaults to 100
     * @param {int} [params.eventLimit] maximum number of complete events to collect
     * @param {int} [params.marketStatus] raw insightx market status, defaults to 1 (active)
     * @returns {object[]} a list of raw insightx market objects
     */
    async fetchRawMarkets (params = {}): Promise<Dict[]> {
        const maxMarkets = this.safeInteger (params, 'marketLimit', this.safeInteger (this.options, 'fetchMarketsLimit', 100));
        const maxEvents = this.safeInteger (params, 'eventLimit');
        if (maxMarkets <= 0) {
            return [];
        }
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
        const statusesLength = statuses.length;
        const effectiveMaxEvents = (statusesLength === 1) ? maxEvents : undefined;
        const rest = this.omit (params, [ 'query', 'queries', 'searchIn', 'sort', 'tags', 'eventId', 'slug', 'limit', 'marketLimit', 'eventLimit', 'page', 'size', 'status', 'marketStatus' ]);
        const result: Dict[] = [];
        let collectedEvents = 0;
        const seenEventIds: Dict = {};
        for (let statusIndex = 0; statusIndex < statusesLength; statusIndex++) {
            let collected = 0;
            let boundaryEventId: Str = undefined;
            let page = initialPage;
            let statusDone = false;
            while (!statusDone) {
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
                    const raw = this.safeDict (markets, i, {});
                    const eventId = this.safeString (raw, 'event_id', this.safeString (raw, 'id'));
                    const isNewEvent = (eventId !== undefined) && !(eventId in seenEventIds);
                    if (isNewEvent && (effectiveMaxEvents !== undefined) && (collectedEvents >= effectiveMaxEvents)) {
                        statusDone = true;
                        break;
                    }
                    if (isNewEvent) {
                        seenEventIds[eventId] = true;
                        collectedEvents = this.sum (collectedEvents, 1);
                    }
                    if (collected < maxMarkets) {
                        result.push (raw);
                        collected = this.sum (collected, 1);
                        if (collected >= maxMarkets) {
                            boundaryEventId = eventId;
                        }
                    } else if ((boundaryEventId !== undefined) && (eventId === boundaryEventId)) {
                        result.push (raw);
                        collected = this.sum (collected, 1);
                    } else {
                        statusDone = true;
                        break;
                    }
                }
                if (statusDone || (marketsLength === 0) || (marketsLength < pageSize)) {
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
     * @param {int} [params.limit] maximum number of markets to return
     * @param {string} [params.status] unified event status, 'active', 'closed', 'inactive' or 'all'
     * @param {int} [params.marketStatus] raw insightx market status, defaults to 1 (active)
     * @param {string} [params.query] client-side title or description filter over the bounded result
     * @param {string[]} [params.queries] multiple client-side search terms
     * @returns {object[]} an array of prediction market structures
     */
    override async fetchMarkets (params = {}): Promise<Market[]> {
        const marketLimit = this.safeInteger (params, 'limit');
        let eventParams = this.omit (params, [ 'limit', 'marketLimit', 'eventLimit' ]);
        if (marketLimit !== undefined) {
            eventParams = this.extend ({ 'marketLimit': marketLimit }, eventParams);
        }
        const events = await this.fetchEvents (eventParams);
        const result: Market[] = [];
        for (let i = 0; i < events.length; i++) {
            const markets = this.safeList (events[i], 'markets', []);
            for (let j = 0; j < markets.length; j++) {
                result.push (markets[j] as Market);
            }
        }
        if ((marketLimit !== undefined) && (result.length > marketLimit)) {
            return this.arraySlice (result, 0, marketLimit) as Market[];
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
     * @param {string} [params.eventId] raw event id used as a client-side filter over the bounded result
     * @param {int} [params.page] page number to start from, defaults to 1
     * @param {int} [params.size] number of markets per request, defaults to 100
     * @param {int} [params.limit] maximum number of complete events to return
     * @param {int} [params.marketLimit] safety bound on raw markets fetched before completing the current event, defaults to 100
     * @param {string} [params.status] unified event status, 'active', 'closed', 'inactive' or 'all'
     * @param {int} [params.marketStatus] raw insightx market status, defaults to 1 (active)
     * @returns {object[]} an array of prediction event structures
     */
    override async fetchEvents (params: fetchEventsParams = {}): Promise<PredictionEvent[]> {
        const queries = this.parseSearchQueries (params);
        const eventLimit = this.safeInteger (params, 'limit');
        let rawParams = this.omit (params, [ 'limit', 'eventLimit' ]);
        if (eventLimit !== undefined) {
            rawParams = this.extend ({ 'eventLimit': eventLimit }, rawParams);
        }
        const rawMarkets = await this.fetchRawMarkets (rawParams);
        const events = this.parseEvents (rawMarkets);
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
     * @ignore
     * @method
     * @name insightx#fetchRawMarket
     * @description fetches one raw insightx market by market id
     * @see https://insightx-2.gitbook.io/whitepaper/insightx-whitepaper/10.-developer-resources-and-api-integration#id-10.6-market-data
     * @param {string} marketId raw insightx market id
     * @param {object} [params] extra exchange-specific parameters
     * @returns {object} the raw insightx market object
     */
    async fetchRawMarket (marketId: string, params = {}): Promise<Dict> {
        const request: Dict = {
            'market_id': marketId,
        };
        const response = await this.insightxPublicGetPredictV2Market (this.extend (request, params));
        return this.safeDict (response, 'data', {});
    }

    /**
     * @ignore
     * @method
     * @name insightx#parseOutcomeId
     * @description parses a raw insightx outcome id in marketId:outcomeIndex format
     * @param {string} outcomeId raw insightx outcome id
     * @returns {object} the raw market id and outcome index, or an empty object for a unified handle
     */
    parseOutcomeId (outcomeId: string): Dict {
        const parts: string[] = outcomeId.split (':');
        const partsLength = parts.length;
        if (partsLength !== 2) {
            return {};
        }
        const marketId = parts[0];
        const outcomeIndex = this.safeInteger (parts, 1);
        if ((outcomeIndex !== 1) && (outcomeIndex !== 2)) {
            return {};
        }
        const chars: string[] = this.stringToCharsArray (marketId);
        const charsLength = chars.length;
        if (charsLength === 0) {
            return {};
        }
        const digits = '0123456789';
        for (let i = 0; i < charsLength; i++) {
            if (digits.indexOf (chars[i]) < 0) {
                return {};
            }
        }
        return {
            'marketId': marketId,
            'outcomeIndex': outcomeIndex,
        };
    }

    /**
     * @ignore
     * @method
     * @name insightx#cacheRawMarket
     * @description parses and caches one raw insightx market and its outcomes
     * @param {object} raw raw insightx market object
     * @returns {object} the parsed partial parent event
     */
    cacheRawMarket (raw: Dict): PredictionEvent {
        const marketId = this.safeString (raw, 'id');
        const eventId = this.safeString (raw, 'event_id', marketId);
        const rawMarkets: Dict[] = [];
        let replaced = false;
        const existingEvent = this.safeDict (this.events, eventId);
        const existingMarkets = this.safeList (existingEvent, 'markets', []);
        for (let i = 0; i < existingMarkets.length; i++) {
            const existingMarket = this.safeDict (existingMarkets, i, {});
            const existingMarketId = this.safeString (existingMarket, 'id');
            if ((marketId !== undefined) && (existingMarketId === marketId)) {
                rawMarkets.push (raw);
                replaced = true;
            } else {
                const existingRaw = this.safeDict (existingMarket, 'info');
                if (existingRaw !== undefined) {
                    rawMarkets.push (existingRaw);
                }
            }
        }
        if (!replaced) {
            rawMarkets.push (raw);
        }
        const event = this.parseEvent (rawMarkets);
        this.setEvents ([ event ]);
        this.indexEventOutcomes (event);
        return event;
    }

    /**
     * @method
     * @name insightx#fetchOutcome
     * @description resolves a single outcome by raw insightx outcome id, falling back to the unified handle search path
     * @see https://insightx-2.gitbook.io/whitepaper/insightx-whitepaper/10.-developer-resources-and-api-integration#id-10.6-market-data
     * @param {string} outcomeSymbol unified outcome handle or raw outcome id in marketId:outcomeIndex format
     * @returns {object} the resolved outcome object
     */
    override async fetchOutcome (outcomeSymbol: string): Promise<any> {
        const parsedId = this.parseOutcomeId (outcomeSymbol);
        const marketId = this.safeString (parsedId, 'marketId');
        if (marketId !== undefined) {
            const raw = await this.fetchRawMarket (marketId);
            this.cacheRawMarket (raw);
            if (this.hasOutcome (outcomeSymbol)) {
                return this.safeOutcome (outcomeSymbol);
            }
            throw new BadSymbol (this.id + ' could not resolve outcome ' + outcomeSymbol);
        }
        return await super.fetchOutcome (outcomeSymbol);
    }

    /**
     * @method
     * @name insightx#fetchTicker
     * @description fetches the latest published probability for one insightx outcome
     * @see https://insightx-2.gitbook.io/whitepaper/insightx-whitepaper/10.-developer-resources-and-api-integration#id-10.6-market-data
     * @param {string} outcome unified outcome handle or raw outcome id in marketId:outcomeIndex format
     * @param {object} [params] extra exchange-specific parameters
     * @returns {object} a [prediction ticker structure](https://docs.ccxt.com/#/?id=prediction-ticker-structure)
     */
    override async fetchTicker (outcome: string, params = {}): Promise<PredictionTicker> {
        const parsedId = this.parseOutcomeId (outcome);
        const directMarketId = this.safeString (parsedId, 'marketId');
        let raw: Dict;
        let outcomeObj: any;
        if (directMarketId !== undefined) {
            raw = await this.fetchRawMarket (directMarketId, params);
            this.cacheRawMarket (raw);
            if (!this.hasOutcome (outcome)) {
                throw new BadSymbol (this.id + ' could not resolve outcome ' + outcome);
            }
            outcomeObj = this.safeOutcome (outcome);
        } else {
            outcomeObj = await this.loadOutcome (outcome);
            const marketId = this.safeString (outcomeObj, 'marketId');
            if (marketId === undefined) {
                throw new BadSymbol (this.id + ' fetchTicker() could not resolve the parent market for ' + outcome);
            }
            raw = await this.fetchRawMarket (marketId, params);
            this.cacheRawMarket (raw);
            outcomeObj = this.safeOutcome (outcome);
        }
        return this.parsePredictionTicker (raw, outcomeObj);
    }

    /**
     * @method
     * @name insightx#fetchTickers
     * @description fetches latest published probabilities for requested outcomes, or for a bounded active market listing when outcomes are omitted
     * @see https://insightx-2.gitbook.io/whitepaper/insightx-whitepaper/10.-developer-resources-and-api-integration#id-10.6-market-data
     * @param {string[]} [outcomes] unified outcome handles or raw outcome ids in marketId:outcomeIndex format
     * @param {object} [params] extra exchange-specific parameters
     * @param {int} [params.limit] maximum number of markets to fetch when outcomes are omitted, defaults to 100
     * @returns {object} a dictionary of [prediction ticker structures](https://docs.ccxt.com/#/?id=prediction-ticker-structure) indexed by outcome
     */
    override async fetchTickers (outcomes: Strings = undefined, params = {}): Promise<PredictionTickers> {
        const result: PredictionTickers = {};
        if (outcomes === undefined) {
            const markets = await this.fetchMarkets (params);
            for (let i = 0; i < markets.length; i++) {
                const market = markets[i];
                const raw = this.safeDict (market, 'info', {});
                const marketOutcomes = this.safeList (market, 'outcomes', []);
                for (let j = 0; j < marketOutcomes.length; j++) {
                    const outcomeObj = this.safeDict (marketOutcomes, j, {});
                    const ticker = this.parsePredictionTicker (raw, outcomeObj as unknown as Market);
                    const outcomeSymbol = this.safeString (ticker, 'outcome');
                    if (outcomeSymbol !== undefined) {
                        result[outcomeSymbol] = ticker;
                    }
                }
            }
            return result;
        }
        const rawByMarketId: Dict = {};
        const marketIds: string[] = [];
        for (let i = 0; i < outcomes.length; i++) {
            if (!this.hasOutcome (outcomes[i])) {
                const parsedId = this.parseOutcomeId (outcomes[i]);
                const marketId = this.safeString (parsedId, 'marketId');
                if ((marketId !== undefined) && !(marketId in rawByMarketId)) {
                    rawByMarketId[marketId] = undefined;
                    marketIds.push (marketId);
                }
            }
        }
        const directPromises: any[] = [];
        for (let i = 0; i < marketIds.length; i++) {
            directPromises.push (this.fetchRawMarket (marketIds[i], params));
        }
        const directResponses = await Promise.all (directPromises);
        for (let i = 0; i < marketIds.length; i++) {
            const raw = directResponses[i];
            rawByMarketId[marketIds[i]] = raw;
            this.cacheRawMarket (raw);
        }
        await this.loadOutcomes (outcomes);
        const grouped: Dict = {};
        const groupedMarketIds: string[] = [];
        for (let i = 0; i < outcomes.length; i++) {
            const outcomeObj = this.outcome (outcomes[i]);
            const marketId = this.safeString (outcomeObj, 'marketId');
            if (marketId === undefined) {
                throw new BadSymbol (this.id + ' fetchTickers() could not resolve the parent market for ' + outcomes[i]);
            }
            if (!(marketId in grouped)) {
                grouped[marketId] = [];
                groupedMarketIds.push (marketId);
            }
            const marketOutcomes = this.safeList (grouped, marketId, []);
            marketOutcomes.push (outcomeObj);
            grouped[marketId] = marketOutcomes;
        }
        const promises: any[] = [];
        const pendingMarketIds: string[] = [];
        for (let i = 0; i < groupedMarketIds.length; i++) {
            const marketId = groupedMarketIds[i];
            if (this.safeValue (rawByMarketId, marketId) === undefined) {
                pendingMarketIds.push (marketId);
                promises.push (this.fetchRawMarket (marketId, params));
            }
        }
        const responses = await Promise.all (promises);
        for (let i = 0; i < pendingMarketIds.length; i++) {
            rawByMarketId[pendingMarketIds[i]] = responses[i];
        }
        for (let i = 0; i < groupedMarketIds.length; i++) {
            const marketId = groupedMarketIds[i];
            const raw = this.safeDict (rawByMarketId, marketId, {});
            const marketOutcomes = this.safeList (grouped, marketId, []);
            for (let j = 0; j < marketOutcomes.length; j++) {
                const ticker = this.parsePredictionTicker (raw, marketOutcomes[j] as unknown as Market);
                const outcomeSymbol = this.safeString (ticker, 'outcome');
                if (outcomeSymbol !== undefined) {
                    result[outcomeSymbol] = ticker;
                }
            }
        }
        return result;
    }

    /**
     * @ignore
     * @method
     * @name insightx#parsePredictionTicker
     * @description parses an insightx market response into a unified ticker for the specified outcome
     * @param {object} raw raw insightx market object
     * @param {object} [market] the outcome object the ticker belongs to
     * @returns {object} a [prediction ticker structure](https://docs.ccxt.com/#/?id=prediction-ticker-structure)
     */
    override parsePredictionTicker (raw: Dict, market: Market = undefined): PredictionTicker {
        const info = this.safeDict (market, 'info', {});
        const outcomeIndex = this.safeInteger (info, 'outcome_idx');
        let price: Num = undefined;
        const parsedPrices = this.parseJson (this.safeString (raw, 'outcome_prices', '[]'));
        if ((parsedPrices !== undefined) && (outcomeIndex !== undefined)) {
            const prices = parsedPrices as any[];
            const priceIndex = this.sum (outcomeIndex, -1);
            price = this.safeNumber (prices, priceIndex);
        }
        const timestamp = this.safeTimestamp (raw, 'updated_at');
        return this.safePredictionTicker ({
            'outcome': this.safeString (market, 'outcome'),
            'outcomeId': this.safeString (market, 'outcomeId'),
            'label': this.safeString (market, 'label'),
            'market': this.safeString (market, 'market'),
            'event': this.safeString (market, 'event'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': undefined,
            'low': undefined,
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'open': undefined,
            'close': price,
            'last': price,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': undefined,
            'openInterest': undefined,
            'info': raw,
        }, market as unknown as Dict);
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
        let end = this.safeTimestamp (raw, 'end_time');
        if (end === 0) {
            end = undefined;
        }
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
