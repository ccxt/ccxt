import Exchange from '../abstract/prediction/sxbet.js';
import { Precise } from '../base/Precise.js';
import { ArgumentsRequired, ExchangeError } from '../base/errors.js';
import type { Dict, Int, Market, PredictionEvent, PredictionOrderBook, PredictionTicker, PredictionTickers, Str, Strings, fetchEventsParams } from '../base/types.js';

// ---------------------------------------------------------------------------

/**
 * @class sxbet
 * @augments Exchange
 */
export default class sxbet extends Exchange {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'sxbet',
            'name': 'SX Bet',
            'countries': [],
            'rateLimit': 120, // 500 req/min baseline; /orders is 5500/min, /trades is 200/min
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
                'cancelOrders': true,
                'createOrder': true,
                'fetchBalance': true,
                'fetchEvent': true,
                'fetchEvents': true,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': false,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchPositions': true,
                'fetchSettlements': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'prediction': true,
            },
            'urls': {
                'logo': '', // todo
                'api': {
                    'sxbet': 'https://api.sx.bet',
                    'explorer': 'https://explorerl2.sx.technology/api',
                },
                'test': {
                    'sxbet': 'https://api.toronto.sx.bet',
                    'explorer': 'https://explorerl2.toronto.sx.technology/api',
                },
                'www': 'https://sx.bet',
                'doc': [ 'https://docs.sx.bet' ],
            },
            'api': {
                'sxbet': {
                    'public': {
                        'get': {
                            'metadata': 1,
                            'markets/active': 1,
                            'markets/find': 1,
                            'markets/popular': 1,
                            'orders': 1,
                            'orders/odds/best': 1,
                            'trades': 1,
                            'trades/consolidated': 1,
                            'trades/orders': 1,
                            'trades/portfolio/refunds': 1,
                            'fixture/active': 1,
                            'fixture/status': 1,
                            'sports': 1,
                            'leagues': 1,
                            'leagues/active': 1,
                            'teams': 1,
                            'live-scores': 1,
                        },
                    },
                    'private': {
                        'post': {
                            'orders/new': 1,
                            'orders/fill/v2': 1,
                            'orders/cancel/v2': 1,
                            'orders/cancel/event': 1,
                            'orders/cancel/all': 1,
                        },
                    },
                },
                'explorer': {
                    'public': {
                        'get': {
                            'api': 1, // ?module=account&action=tokenbalance&contractaddress=...&address=...
                        },
                    },
                },
            },
            'requiredCredentials': {
                // apiKey is the optional X-Api-Key header (higher REST rate limits, required for
                // websocket); trading needs walletAddress (order 'maker' field) and privateKey
                'apiKey': false,
                'secret': false,
                'walletAddress': true,
                'privateKey': true,
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': false,
                },
            },
            'exceptions': {
                'exact': {},
                'broad': {},
            },
            'options': {
                'marketsPageSize': 100,
                'maxMarketsPages': 50,
                'eventScopeParams': [ 'leagueId', 'sportId' ],
            },
        });
    }

    /**
     * @method
     * @name sxbet#fetchMarkets
     * @description retrieves data on all active markets, each becomes one market with its two sides listed under the outcomes key
     * @see https://docs.sx.bet/api-reference/get-markets-active
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.limit] max number of markets to collect (defaults to options.marketsPageSize * options.maxMarketsPages, 5000)
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets (params = {}): Promise<Market[]> {
        const rest = this.omit (params, [ 'limit' ]);
        const userLimit = this.safeInteger (params, 'limit');
        const rawMarkets = await this.fetchRawActiveMarkets (rest, userLimit);
        const markets: Market[] = [];
        const rawMarketsLength = rawMarkets.length;
        for (let i = 0; i < rawMarketsLength; i++) {
            markets.push (this.parseSxbetMarket (rawMarkets[i]));
        }
        const marketsLength = markets.length;
        if ((userLimit !== undefined) && (marketsLength > userLimit)) {
            return this.arraySlice (markets, 0, userLimit);
        }
        return markets;
    }

    /**
     * @ignore
     * @method
     * @name sxbet#fetchRawActiveMarkets
     * @description pages through GET /markets/active (cursor-based via paginationKey/nextKey), stopping once options.maxMarketsPages pages or userLimit raw markets have been collected
     * @param {object} [extra] extra request params merged into every page (e.g. leagueId, sportId, sportXeventId)
     * @param {int} [userLimit] stop collecting once this many raw markets have been gathered
     * @returns {object[]} the raw (unparsed) sx.bet market objects
     */
    async fetchRawActiveMarkets (extra: Dict = {}, userLimit: Int = undefined): Promise<any[]> {
        const pageSize = this.safeInteger (this.options, 'marketsPageSize', 100);
        const maxPages = this.safeInteger (this.options, 'maxMarketsPages', 50);
        const rawMarkets: any[] = [];
        let paginationKey: Str = undefined;
        let page = 0;
        while (true) {
            const request: Dict = { 'pageSize': pageSize };
            if (paginationKey !== undefined) {
                request['paginationKey'] = paginationKey;
            }
            const response = await this.sxbetPublicGetMarketsActive (this.extend (request, extra));
            const result = this.safeDict (response, 'data', {});
            const pageMarkets = this.safeList (result, 'markets', []);
            const pageMarketsLength = pageMarkets.length;
            for (let i = 0; i < pageMarketsLength; i++) {
                rawMarkets.push (pageMarkets[i]);
            }
            paginationKey = this.safeString (result, 'nextKey');
            page = this.sum (page, 1);
            const collectedLength = rawMarkets.length;
            if ((pageMarketsLength < pageSize) || (page >= maxPages) || (paginationKey === undefined) || ((userLimit !== undefined) && (collectedLength >= userLimit))) {
                break;
            }
        }
        return rawMarkets;
    }

    /**
     * @ignore
     * @method
     * @name sxbet#parseSxbetMarket
     * @description converts a single raw sx.bet market into one ccxt market with its two sides as outcomes
     * @param {object} raw the raw sx.bet market object
     * @returns {object} a [market structure](https://docs.ccxt.com/#/?id=market-structure)
     */
    parseSxbetMarket (raw: Dict): Market {
        // {
        //     "status": "ACTIVE",
        //     "marketHash": "0x7154aa3580267e276cccd0f4f826464a05e3efd8e1c81d7717bef6b5ae88b07d",
        //     "outcomeOneName": "Los Angeles Rams",
        //     "outcomeTwoName": "San Francisco 49ers",
        //     "outcomeVoidName": "NO_CONTEST",
        //     "teamOneName": "Los Angeles Rams",
        //     "teamTwoName": "San Francisco 49ers",
        //     "type": 226,
        //     "gameTime": 1789086900,
        //     "line": -2.5, // present on spread/total markets only
        //     "sportXeventId": "L18870109",
        //     "liveEnabled": true,
        //     "sportLabel": "Football",
        //     "sportId": 8,
        //     "leagueId": 243,
        //     "leagueLabel": "NFL",
        //     "mainLine": true,
        //     "isQuarterLineMarket": false
        // }
        const marketHash = this.safeString (raw, 'marketHash');
        const teamOneName = this.safeString (raw, 'teamOneName');
        const teamTwoName = this.safeString (raw, 'teamTwoName');
        const outcomeOneName = this.safeString (raw, 'outcomeOneName');
        const outcomeTwoName = this.safeString (raw, 'outcomeTwoName');
        const eventSlug = this.shortenSlug (teamOneName + ' ' + teamTwoName);
        // one fixture carries many markets (moneyline, several spread/total lines, quarter/half
        // variants) whose outcomeOneName text can coincide or nearly coincide, so a text-only
        // slug isn't guaranteed unique. suffix with the market hash instead (always unique,
        // letters+digits only so it survives shortenSlug as one atomic word)
        // parseToInt-wrapped .length: the bare `const n = str.length;` statement is the php
        // transpiler's ARRAY hint (count()), which breaks on a string — this form emits
        // strlen()/len() correctly in both python and php
        const hashLength = this.parseToInt (marketHash.length);
        const hashSuffix = marketHash.slice (hashLength - 6);
        const marketSlug = this.shortenSlug (outcomeOneName) + '_' + hashSuffix;
        const marketSymbol = this.slugToMarketSymbol (eventSlug, marketSlug);
        const status = this.safeString (raw, 'status');
        const active = (status === 'ACTIVE');
        const gameTime = this.safeTimestamp (raw, 'gameTime');
        const outcomeLabels = [ outcomeOneName, outcomeTwoName ];
        const outcomeIds = [ marketHash, marketHash + '-2' ];
        const outcomes: any[] = [];
        for (let oi = 0; oi < outcomeLabels.length; oi++) {
            const label = outcomeLabels[oi];
            const outcomeHandle = this.slugToOutcomeSymbol (eventSlug, marketSlug, label);
            outcomes.push ({
                'id': outcomeIds[oi],
                'outcomeId': outcomeIds[oi],
                'outcome': outcomeHandle,
                'market': marketSymbol,
                'label': label,
                'active': active,
                'winner': undefined,
                'settleFraction': undefined,
                'info': raw,
            });
        }
        return {
            'id': marketHash,
            'market': marketSymbol,
            'base': 'USDC',
            'quote': 'USDC',
            'settle': undefined,
            'baseId': marketHash,
            'quoteId': 'USDC',
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
            'resolved': false,
            'resolvedOutcome': undefined,
            'contract': false,
            'linear': undefined,
            'inverse': undefined,
            'contractSize': undefined,
            'expiry': gameTime,
            'expiryDatetime': this.iso8601 (gameTime),
            'strike': undefined,
            'optionType': undefined,
            // no trading-fee percentage found anywhere in the docs/metadata (oracleFees is a
            // resolution/oracle fee, not a per-trade maker/taker cut) - 0 until live data says otherwise
            'taker': 0,
            'maker': 0,
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
            'created': undefined,
        } as unknown as Market;
    }

    /**
     * @method
     * @name sxbet#fetchEvents
     * @description fetches sx.bet fixtures (one fixture = one event, its markets are every moneyline/spread/total line on that fixture) scoped by eventId, leagueId, sportId or a free-text query/tags match against team and league names — always live from the API, never the local cache (it POPULATES the cache for later event()/outcome lookups). sx.bet has no server-side full-text search, so query/queries/tags are matched client-side against team and league names
     * @see https://docs.sx.bet/api-reference/get-markets-active
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.eventId] direct lookup by unified event id (the sx.bet sportXeventId, e.g. 'L18870109')
     * @param {string} [params.query] free-text search matched against team and league names
     * @param {string[]} [params.queries] multiple free-text searches (alternative to query, unioned)
     * @param {string[]} [params.tags] matched the same way as query/queries (sx.bet has no tag taxonomy)
     * @param {int} [params.leagueId] sx.bet league id (e.g. 243 for NFL) — fetched server-side
     * @param {int} [params.sportId] sx.bet sport id (e.g. 8 for Football) — fetched server-side
     * @param {string} [params.status] 'active' | 'inactive' | 'closed' | 'all'
     * @param {int} [params.limit] max number of events to return
     * @returns {object[]} an array of event structures
     */
    async fetchEvents (params: fetchEventsParams = {}): Promise<PredictionEvent[]> {
        this.requireEventQuery (params);
        const eventId = this.safeString2 (params, 'eventId', 'slug');
        const leagueId = this.safeString (params, 'leagueId');
        const sportId = this.safeString (params, 'sportId');
        const queries = this.parseSearchQueries (params);
        const tags = this.safeList (params, 'tags', []);
        const tagsLength = tags.length;
        for (let i = 0; i < tagsLength; i++) {
            queries.push (tags[i]);
        }
        const rest = this.omit (params, [ 'eventId', 'slug', 'leagueId', 'sportId', 'query', 'queries', 'tags', 'status', 'sort', 'searchIn', 'limit' ]);
        let rawMarkets: any[];
        if (eventId !== undefined) {
            rawMarkets = await this.fetchRawActiveMarkets (this.extend ({ 'sportXeventId': eventId }, rest), undefined);
        } else if (leagueId !== undefined) {
            rawMarkets = await this.fetchRawActiveMarkets (this.extend ({ 'leagueId': leagueId }, rest), undefined);
        } else if (sportId !== undefined) {
            rawMarkets = await this.fetchRawActiveMarkets (this.extend ({ 'sportId': sportId }, rest), undefined);
        } else {
            // no server-side scope left, only query/tags — full scan (same bound as fetchMarkets)
            // then filter client-side, since sx.bet exposes no full-text search endpoint
            rawMarkets = await this.fetchRawActiveMarkets (rest, undefined);
        }
        const queriesLength = queries.length;
        if (queriesLength > 0) {
            const filtered = [];
            const preFilterLength = rawMarkets.length;
            for (let i = 0; i < preFilterLength; i++) {
                if (this.matchesEventQuery (rawMarkets[i], queries)) {
                    filtered.push (rawMarkets[i]);
                }
            }
            rawMarkets = filtered;
        }
        const grouped: Dict = {};
        const order: string[] = [];
        const rawMarketsLength = rawMarkets.length;
        for (let i = 0; i < rawMarketsLength; i++) {
            const raw = rawMarkets[i];
            const sportXeventId = this.safeString (raw, 'sportXeventId');
            if (sportXeventId === undefined) {
                continue;
            }
            if (!(sportXeventId in grouped)) {
                grouped[sportXeventId] = [];
                order.push (sportXeventId);
            }
            grouped[sportXeventId].push (raw);
        }
        if (!this.markets) {
            this.markets = this.createSafeDictionary ();
        }
        const result: any[] = [];
        const orderLength = order.length;
        for (let i = 0; i < orderLength; i++) {
            const fixtureId = order[i];
            const event = this.parseSxbetEvent (fixtureId, grouped[fixtureId]);
            const evMarkets = this.safeList (event, 'markets', []);
            const evMarketsLength = evMarkets.length;
            for (let j = 0; j < evMarketsLength; j++) {
                const m = evMarkets[j];
                this.markets[m['market']] = m;
            }
            result.push (event);
        }
        this.populateOutcomes ();
        const postParams = this.omit (params, [ 'leagueId', 'sportId', 'query', 'queries', 'tags' ]);
        return this.applyEventFetchParams (result, postParams, []);
    }

    /**
     * @method
     * @name sxbet#fetchEvent
     * @description fetches a single sx.bet fixture (event) by its sportXeventId
     * @see https://docs.sx.bet/api-reference/get-markets-active
     * @param {string} id the sx.bet sportXeventId, e.g. 'L18870109'
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [prediction event structure](https://docs.ccxt.com/#/?id=prediction-event-structure)
     */
    async fetchEvent (id: string, params = {}): Promise<PredictionEvent> {
        const rawMarkets = await this.fetchRawActiveMarkets (this.extend ({ 'sportXeventId': id }, params), undefined);
        const event: any = this.parseSxbetEvent (id, rawMarkets);
        this.indexEventOutcomes (event);
        return event;
    }

    /**
     * @ignore
     * @method
     * @name sxbet#matchesEventQuery
     * @description checks a raw market's team/league names against a list of free-text queries, matching in either direction (a short user query inside a long name, or — since fetchEvents derives its fallback test query from an already-slugified handle — a long joined query containing a short name)
     * @param {object} raw the raw sx.bet market object
     * @param {string[]} queries lowercase-insensitive free-text queries
     * @returns {boolean} whether any query matches any of the market's team/league/outcome names
     */
    matchesEventQuery (raw: Dict, queries: string[]): boolean {
        const fields = [
            this.safeString (raw, 'teamOneName'),
            this.safeString (raw, 'teamTwoName'),
            this.safeString (raw, 'leagueLabel'),
            this.safeString (raw, 'sportLabel'),
            this.safeString (raw, 'outcomeOneName'),
            this.safeString (raw, 'outcomeTwoName'),
        ];
        const queriesLength = queries.length;
        for (let qi = 0; qi < queriesLength; qi++) {
            const query = queries[qi].toLowerCase ();
            if (query === '') {
                continue;
            }
            for (let fi = 0; fi < fields.length; fi++) {
                const field = fields[fi];
                if (field === undefined) {
                    continue;
                }
                const fieldLower = field.toLowerCase ();
                if ((query.indexOf (fieldLower) >= 0) || (fieldLower.indexOf (query) >= 0)) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * @ignore
     * @method
     * @name sxbet#parseSxbetEvent
     * @description groups a fixture's raw markets (all sharing one sportXeventId) into one unified event structure
     * @param {string} fixtureId the sx.bet sportXeventId
     * @param {object[]} rawMarkets the raw sx.bet market objects belonging to this fixture
     * @returns {object} an event structure
     */
    parseSxbetEvent (fixtureId: string, rawMarkets: any[]): any {
        const marketsList: Market[] = [];
        let anyActive = false;
        let earliestGameTime: Str = undefined;
        let teamOneName: Str = undefined;
        let teamTwoName: Str = undefined;
        let leagueLabel: Str = undefined;
        const rawMarketsLength = rawMarkets.length;
        for (let i = 0; i < rawMarketsLength; i++) {
            const raw = rawMarkets[i];
            const parsed = this.parseSxbetMarket (raw);
            marketsList.push (parsed);
            if (parsed['active']) {
                anyActive = true;
            }
            if (teamOneName === undefined) {
                teamOneName = this.safeString (raw, 'teamOneName');
                teamTwoName = this.safeString (raw, 'teamTwoName');
                leagueLabel = this.safeString (raw, 'leagueLabel');
            }
            const gameTime = this.safeString (raw, 'gameTime');
            if ((gameTime !== undefined) && ((earliestGameTime === undefined) || (gameTime < earliestGameTime))) {
                earliestGameTime = gameTime;
            }
        }
        const end = this.safeTimestamp ({ 'gameTime': earliestGameTime }, 'gameTime');
        const title = teamOneName + ' vs ' + teamTwoName;
        const eventSlug = this.shortenSlug (teamOneName + ' ' + teamTwoName);
        return {
            'id': fixtureId,
            'slug': fixtureId,
            'event': eventSlug,
            'title': title,
            'description': undefined,
            'category': leagueLabel,
            'tags': undefined,
            'markets': marketsList,
            'mutuallyExclusive': false,
            'active': anyActive,
            'resolved': undefined,
            'volume': undefined,
            'liquidity': undefined,
            'created': undefined,
            'createdDatetime': undefined,
            'end': end,
            'endDatetime': this.iso8601 (end),
            'image': undefined,
            'url': undefined,
            'info': rawMarkets,
        };
    }

    /**
     * @ignore
     * @method
     * @name sxbet#loadUsdcAddress
     * @description resolves and caches the USDC token contract address for the current network from /metadata. sx.bet orders can be denominated in USDC or WSX per-order, but every sxbet market's quote/settle is fixed to 'USDC' (see parseSxbetMarket), so ticker/order-book construction only surfaces USDC-denominated liquidity
     * @returns {string} the USDC token contract address
     */
    async loadUsdcAddress (): Promise<string> {
        let usdcAddress = this.safeString (this.options, 'usdcAddress');
        if (usdcAddress !== undefined) {
            return usdcAddress;
        }
        const response = await this.sxbetPublicGetMetadata ();
        const data = this.safeDict (response, 'data', {});
        const addresses = this.safeDict (data, 'addresses', {});
        const addressesKeys = Object.keys (addresses);
        const addressesKeysLength = addressesKeys.length;
        if (addressesKeysLength > 0) {
            const chainAddresses = this.safeDict (addresses, addressesKeys[0], {});
            usdcAddress = this.safeString (chainAddresses, 'USDC');
        }
        if (usdcAddress === undefined) {
            throw new ExchangeError (this.id + ' could not resolve the USDC token address from /metadata');
        }
        this.options['usdcAddress'] = usdcAddress;
        return usdcAddress;
    }

    /**
     * @method
     * @name sxbet#fetchTicker
     * @description fetches the current best resting odds for a single sx.bet outcome. sx.bet is a peer-to-peer odds book (no matched-trade tape or candles), so bid/ask are the best (highest) percentageOdds resting on this outcome's own side and its mirror (1 - best percentageOdds resting on the opposite outcome)
     * @see https://docs.sx.bet/api-reference/get-orders-odds-best
     * @param {string} outcome unified outcome handle or outcomeId (marketHash or marketHash + '-2')
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [prediction ticker structure](https://docs.ccxt.com/#/?id=prediction-ticker-structure)
     */
    async fetchTicker (outcome: Str, params = {}): Promise<PredictionTicker> {
        await this.loadOutcome (outcome);
        const outcomeObj = this.outcome (outcome);
        const marketHash = this.safeString (outcomeObj['info'], 'marketHash');
        const usdcAddress = await this.loadUsdcAddress ();
        const request: Dict = { 'marketHashes': marketHash, 'baseToken': usdcAddress };
        const response = await this.sxbetPublicGetOrdersOddsBest (this.extend (request, params));
        const result = this.safeDict (response, 'data', {});
        const bestOddsList = this.safeList (result, 'bestOdds', []);
        const raw = this.safeDict (bestOddsList, 0, {});
        return this.parseSxbetTicker (raw, outcomeObj as any);
    }

    /**
     * @method
     * @name sxbet#fetchTickers
     * @description fetches the current best resting odds for multiple sx.bet outcomes, batching both outcomes of the same market into one /orders/odds/best request
     * @see https://docs.sx.bet/api-reference/get-orders-odds-best
     * @param {string[]} outcomes unified outcomes — required: sx.bet has thousands of markets and no endpoint returning all of them at once
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [prediction ticker structures](https://docs.ccxt.com/#/?id=prediction-ticker-structure) indexed by outcome
     */
    async fetchTickers (outcomes: Strings = undefined, params = {}): Promise<PredictionTickers> {
        if (outcomes === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchTickers() requires an outcomes argument — the venue has no all-tickers endpoint; pass the outcome handles to fetch (discover them via fetchEvents ())');
        }
        await this.loadOutcomes (outcomes);
        const outcomesByMarketHash: Dict = {};
        const marketHashes: string[] = [];
        const outcomesLength = outcomes.length;
        for (let i = 0; i < outcomesLength; i++) {
            const outcomeObj = this.outcome (outcomes[i]);
            const marketHash = this.safeString (outcomeObj['info'], 'marketHash');
            if (marketHash === undefined) {
                continue;
            }
            if (!(marketHash in outcomesByMarketHash)) {
                outcomesByMarketHash[marketHash] = [];
                marketHashes.push (marketHash);
            }
            // reassign after push, plain mutation through a local is lost in transpiled php (arrays are value types there)
            const grouped = outcomesByMarketHash[marketHash];
            grouped.push (outcomeObj);
            outcomesByMarketHash[marketHash] = grouped;
        }
        const usdcAddress = await this.loadUsdcAddress ();
        const chunkSize = this.safeInteger (this.options, 'fetchTickersBatchSize', 30);
        const result: PredictionTickers = {};
        const marketHashesLength = marketHashes.length;
        let startIndex = 0;
        while (startIndex < marketHashesLength) {
            let endIndex = this.sum (startIndex, chunkSize);
            if (endIndex > marketHashesLength) {
                endIndex = marketHashesLength;
            }
            const chunk: string[] = [];
            for (let i = startIndex; i < endIndex; i++) {
                chunk.push (marketHashes[i]);
            }
            const request: Dict = { 'marketHashes': chunk.join (','), 'baseToken': usdcAddress };
            const response = await this.sxbetPublicGetOrdersOddsBest (this.extend (request, params));
            const responseData = this.safeDict (response, 'data', {});
            const bestOddsList = this.safeList (responseData, 'bestOdds', []);
            const bestOddsListLength = bestOddsList.length;
            for (let i = 0; i < bestOddsListLength; i++) {
                const raw = bestOddsList[i];
                const marketHash = this.safeString (raw, 'marketHash');
                if ((marketHash === undefined) || !(marketHash in outcomesByMarketHash)) {
                    continue;
                }
                const grouped = outcomesByMarketHash[marketHash] as any[];
                const groupedLength = grouped.length;
                for (let j = 0; j < groupedLength; j++) {
                    const ticker = this.parseSxbetTicker (raw, grouped[j]);
                    const symbolKey = this.safeString (ticker, 'outcome');
                    if (symbolKey !== undefined) {
                        result[symbolKey] = ticker;
                    }
                }
            }
            startIndex = this.sum (startIndex, chunkSize);
        }
        return result;
    }

    /**
     * @ignore
     * @method
     * @name sxbet#parseSxbetTicker
     * @description parses one /orders/odds/best entry into a unified ticker for one side of the market
     * @param {object} raw one bestOdds entry ({ marketHash, baseToken, outcomeOne: { percentageOdds, updatedAt }, outcomeTwo: {...} })
     * @param {object} [market] the outcome object the ticker belongs to
     * @returns {object} a [prediction ticker structure](https://docs.ccxt.com/#/?id=prediction-ticker-structure)
     */
    parseSxbetTicker (raw: Dict, market: Market = undefined): PredictionTicker {
        const marketAny = market as any;
        const outcomeObj = this.safeOutcome (this.safeString (marketAny, 'outcome'), marketAny);
        const outcomeId = this.safeString (outcomeObj, 'outcomeId');
        const marketHash = this.safeString (raw, 'marketHash');
        const isOutcomeOne = (outcomeId === marketHash);
        const outcomeOneOdds = this.safeDict (raw, 'outcomeOne', {});
        const outcomeTwoOdds = this.safeDict (raw, 'outcomeTwo', {});
        const ownOdds = isOutcomeOne ? outcomeOneOdds : outcomeTwoOdds;
        const oppositeOdds = isOutcomeOne ? outcomeTwoOdds : outcomeOneOdds;
        // percentageOdds is the maker's own implied probability * 1e20 (sx.bet protocol format);
        // the opposite side's best resting maker mirrors into this outcome's ask via 1 - p
        const oneDenom = '100000000000000000000';
        const ownPercentage = this.safeString (ownOdds, 'percentageOdds');
        const oppositePercentage = this.safeString (oppositeOdds, 'percentageOdds');
        const bid = (ownPercentage !== undefined) ? this.parseNumber (Precise.stringDiv (ownPercentage, oneDenom)) : undefined;
        const ask = (oppositePercentage !== undefined) ? this.parseNumber (Precise.stringSub ('1', Precise.stringDiv (oppositePercentage, oneDenom))) : undefined;
        const updatedAt = this.safeInteger (ownOdds, 'updatedAt');
        const now = this.milliseconds ();
        const timestamp = (updatedAt !== undefined) ? updatedAt : now;
        let average = undefined;
        if ((bid !== undefined) && (ask !== undefined)) {
            average = this.parseNumber (Precise.stringDiv (Precise.stringAdd (this.numberToString (bid), this.numberToString (ask)), '2'));
        }
        return this.safePredictionTicker ({
            'outcome': this.safeString (outcomeObj, 'outcome'),
            'outcomeId': outcomeId,
            'label': this.safeString (outcomeObj, 'label'),
            'market': this.safeString (outcomeObj, 'market'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': undefined,
            'low': undefined,
            'bid': bid,
            'bidVolume': undefined,
            'ask': ask,
            'askVolume': undefined,
            'open': undefined,
            'close': bid,
            'last': bid,
            'change': undefined,
            'percentage': undefined,
            'average': average,
            'baseVolume': undefined,
            'quoteVolume': undefined,
            'info': raw,
        }, market);
    }

    /**
     * @method
     * @name sxbet#fetchOrderBook
     * @description fetches the resting maker order book for a single sx.bet outcome. bids are maker orders already betting on this outcome (priced at each maker's own implied probability, sized by their remaining stake); asks mirror the opposite outcome's maker orders (price = 1 - their implied probability, sized by how much a taker could bet against them, per sx.bet's remaining-taker-space formula) — the same YES/NO-style mirrored construction used across this codebase's other binary prediction venues
     * @see https://docs.sx.bet/api-reference/get-orders
     * @param {string} outcome unified outcome handle or outcomeId
     * @param {int} [limit] the maximum number of bids/asks to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [prediction order book structure](https://docs.ccxt.com/#/?id=prediction-order-book-structure)
     */
    async fetchOrderBook (outcome: Str, limit: Int = undefined, params = {}): Promise<PredictionOrderBook> {
        await this.loadOutcome (outcome);
        const outcomeObj = this.outcome (outcome);
        const marketHash = this.safeString (outcomeObj['info'], 'marketHash');
        const outcomeId = this.safeString (outcomeObj, 'outcomeId');
        const isOutcomeOne = (outcomeId === marketHash);
        const usdcAddress = await this.loadUsdcAddress ();
        const request: Dict = { 'marketHashes': marketHash };
        const response = await this.sxbetPublicGetOrders (this.extend (request, params));
        const rawOrders = this.safeList (response, 'data', []);
        const oneDenom = '100000000000000000000';
        const usdcDecimals = '1000000'; // sx.bet USDC has 6 decimals (confirmed via /metadata makerOrderMinimums)
        const bids: any[] = [];
        const asks: any[] = [];
        const rawOrdersLength = rawOrders.length;
        for (let i = 0; i < rawOrdersLength; i++) {
            const order = rawOrders[i];
            if (this.safeString (order, 'orderStatus') !== 'ACTIVE') {
                continue;
            }
            if (this.safeStringLower (order, 'baseToken') !== usdcAddress.toLowerCase ()) {
                continue;
            }
            const totalBetSize = this.safeString (order, 'totalBetSize');
            const fillAmount = this.safeString (order, 'fillAmount', '0');
            const pendingFillAmount = this.safeString (order, 'pendingFillAmount', '0');
            const remainingMaker = Precise.stringSub (Precise.stringSub (totalBetSize, fillAmount), pendingFillAmount);
            if (Precise.stringLe (remainingMaker, '0')) {
                continue;
            }
            const percentageOdds = this.safeString (order, 'percentageOdds');
            const makerBettingOne = this.safeBool (order, 'isMakerBettingOutcomeOne');
            if (makerBettingOne === isOutcomeOne) {
                const price = this.parseNumber (Precise.stringDiv (percentageOdds, oneDenom));
                const amount = this.parseNumber (Precise.stringDiv (remainingMaker, usdcDecimals, 6));
                bids.push ([ price, amount ]);
            } else {
                // remainingTakerSpace = remainingMaker * (1e20 / percentageOdds) - remainingMaker,
                // per sx.bet's documented remaining-taker-space formula
                const price = this.parseNumber (Precise.stringSub ('1', Precise.stringDiv (percentageOdds, oneDenom)));
                const ratio = Precise.stringDiv (oneDenom, percentageOdds, 12);
                const remainingTaker = Precise.stringSub (Precise.stringMul (remainingMaker, ratio), remainingMaker);
                const amount = this.parseNumber (Precise.stringDiv (remainingTaker, usdcDecimals, 6));
                asks.push ([ price, amount ]);
            }
        }
        let sortedBids = this.sortBy (bids, 0, true);
        let sortedAsks = this.sortBy (asks, 0);
        if (limit !== undefined) {
            const bidsLength = sortedBids.length;
            let bidsEnd = limit;
            if (bidsEnd > bidsLength) {
                bidsEnd = bidsLength;
            }
            sortedBids = this.arraySlice (sortedBids, 0, bidsEnd);
            const asksLength = sortedAsks.length;
            let asksEnd = limit;
            if (asksEnd > asksLength) {
                asksEnd = asksLength;
            }
            sortedAsks = this.arraySlice (sortedAsks, 0, asksEnd);
        }
        const timestamp = this.milliseconds ();
        return this.safePredictionOrderBook ({
            'outcome': this.safeString (outcomeObj, 'outcome', outcome),
            'bids': sortedBids,
            'asks': sortedAsks,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'nonce': undefined,
        } as unknown as PredictionOrderBook, outcomeObj);
    }

    /**
     * @ignore
     * @method
     * @name sxbet#sign
     * @description builds the request url and attaches the optional API-key header
     * @param {string} path the endpoint path
     * @param {string|string[]} api the api group and access level
     * @param {string} method the http method
     * @param {object} params the request parameters
     * @param {object} [headers] request headers
     * @param {string} [body] the request body
     * @returns {object} a dict with url, method, body and headers
     */
    sign (path: any, api: any = 'sxbet', method = 'GET', params = {}, headers: any = undefined, body: any = undefined) {
        const apiGroup: string = typeof api === 'string' ? api : api[0];
        const baseUrls = this.urls['api'] as Dict;
        const baseUrl = this.safeString (baseUrls, apiGroup, baseUrls['sxbet'] as string);
        let url = baseUrl + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        const existingHeaders = (headers !== undefined) ? headers : {};
        headers = this.extend ({
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        }, existingHeaders);
        if (this.apiKey !== undefined) {
            headers['X-Api-Key'] = this.apiKey;
        }
        if (method === 'GET') {
            const querystring = this.urlencode (query);
            if (querystring) {
                url += '?' + querystring;
            }
        } else {
            const queryKeys = Object.keys (query);
            const queryKeysLength = queryKeys.length;
            if (queryKeysLength > 0) {
                body = this.json (query);
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}
