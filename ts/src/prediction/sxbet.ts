import { keccak_256 as keccak } from '@noble/hashes/sha3.js';
import { secp256k1 } from '@noble/curves/secp256k1.js';
import Exchange from '../abstract/prediction/sxbet.js';
import { ecdsa } from '../base/functions/crypto.js';
import { ROUND, DECIMAL_PLACES, TICK_SIZE } from '../base/functions/number.js';
import { Precise } from '../base/Precise.js';
import { ArgumentsRequired, BadRequest, BadSymbol, DuplicateOrderId, ExchangeError, InsufficientFunds, InvalidOrder, MarketClosed, NotSupported, OperationRejected, OrderNotFillable, OrderNotFound, PermissionDenied, RateLimitExceeded } from '../base/errors.js';
import type { Balances, Dict, Int, int, Market, Num, PredictionEvent, PredictionOrder, PredictionOrderBook, PredictionPosition, PredictionSettlement, PredictionTicker, PredictionTickers, PredictionTrade, Str, Strings, fetchEventsParams } from '../base/types.js';

// ---------------------------------------------------------------------------

/**
 * @class sxbet
 * @augments Exchange
 */
export default class sxbet extends Exchange {
    override describe (): any {
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
                'approve': true,
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
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchPositions': true,
                'fetchSettlements': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
                'prediction': true,
            },
            'urls': {
                'logo': '', // todo
                'api': {
                    'sxbet': 'https://api.sx.bet',
                    'explorer': 'https://explorerl2.sx.technology',
                },
                'test': {
                    'sxbet': 'https://api.toronto.sx.bet',
                    'explorer': 'https://explorerl2.toronto.sx.technology',
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
                            'orders/approve': 1,
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
                    'percentage': true,
                    // no per-trade maker/taker cut found anywhere in the docs or /metadata —
                    // oracleFees there is a resolution/oracle cost, not a trading fee
                    'maker': 0.0,
                    'taker': 0.0,
                },
            },
            'exceptions': {
                // sx.bet errors come as { "error": "Bad Request", "message": <CODE or [strings]>, "statusCode": 4xx };
                // per-order statuses inside a 200 createOrder response reuse the same codes
                'exact': {
                    'INSUFFICIENT_BALANCE': InsufficientFunds,   // maker token balance too low
                    'INVALID_MARKET': BadRequest,   // non-unique marketHashes in one request
                    'ORDERS_ALREADY_EXIST': DuplicateOrderId,
                    'TOO_MANY_DIFFERENT_MARKETS': BadRequest,   // more than 3 markets in a single request
                    'ORDERS_MUST_HAVE_IDENTICAL_MARKET': BadRequest,
                    'BAD_BASE_TOKEN': BadRequest,   // all orders must share one base token
                    'INSUFFICIENT_KYC': PermissionDenied,
                    'AFTER_ORDER_EXPIRY': OrderNotFillable,   // a targeted order expired before the fill
                    'BASE_TOKENS_NOT_SAME': BadRequest,
                    'MARKETS_NOT_SAME': BadRequest,
                    'DIRECTIONS_NOT_SAME': BadRequest,
                    'INVALID_ORDERS': OrderNotFillable,   // a targeted order is no longer active
                    'INVALID_ODDS': InvalidOrder,   // desiredOdds must be below 10^20
                    'PERCENTAGEODDS_UNDEFINED_OR_MALFORMED': InvalidOrder,   // live-verified: maker percentageOdds above the 10^20 cap (price > 1) or malformed
                    'TOTAL_BET_SIZE_TOO_LOW': InvalidOrder,   // live-verified: stake below the venue's minimum bet size
                    'INVALID_ODDS_SLIPPAGE': BadRequest,   // integer 0-100
                    'MATCH_STATE_INVALID': MarketClosed,   // fixture not available for betting
                    'TAKER_SIGNATURE_MISMATCH': InvalidOrder,
                    'SIGNATURE_MISMATCH': InvalidOrder,   // cancel payload signature failed verification
                    'PROXY_ACCOUNT_INVALID': BadRequest,
                    'TAKER_AMOUNT_TOO_LOW': InvalidOrder,   // below the token's taker minimum
                    'META_TX_RATE_LIMIT_REACHED': RateLimitExceeded,   // max 10 pending meta transactions
                    'INSUFFICIENT_SPACE': OrderNotFillable,   // remaining maker space consumed by pending fills
                    'FILL_ALREADY_SUBMITTED': DuplicateOrderId,
                    'ODDS_STALE': OrderNotFillable,   // nothing resting within desiredOdds + oddsSlippage
                    'NO_MATCHING_ORDERS': OrderNotFillable,   // observed live: no fillable liquidity (e.g. self-trade)
                    'CANCEL_REQUEST_ALREADY_PROCESSED': OperationRejected,
                    'RATE_LIMIT_ORDER_REQUEST_MARKET_COUNT': BadRequest,   // more than 1000 marketHashes queried
                    'BOTH_SPORTXEVENTID_MARKETHASHES_PRESENT': BadRequest,
                    'BAD_MARKET_HASHES': BadRequest,   // invalid or more than 30 hashes on /markets/find
                },
                'broad': {
                    'no longer supported': NotSupported,   // e.g. "OrderBook V2 is no longer supported" (testnet V3 canary gate)
                    'must be': BadRequest,   // request validation messages like "orders must be an array"
                },
            },
            'options': {
                'marketsPageSize': 100,   // markets per GET /markets/active page (cursor pagination)
                'maxMarketsPages': 50,    // safety cap on pages fetched per markets scan (100 * 50 = 5000 markets)
                // venue-specific fetchEvents scope params accepted by requireEventQuery
                'eventScopeParams': [ 'leagueId', 'sportId' ],
                // per-chain RPC endpoint for the on-chain reads approve() needs (ERC20 name()/nonces());
                // sx.bet's own REST API has no RPC proxy, and /metadata carries no rpcUrl field
                'chains': {
                    '4162': { 'rpcUrl': 'https://rpc-rollup.sx.technology' },
                    '79479957': { 'rpcUrl': 'https://rpc-rollup.toronto.sx.technology' },
                },
                'approveDeadlineSeconds': 7200,
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
    override async fetchMarkets (params = {}): Promise<Market[]> {
        const rest = this.omit (params, [ 'limit' ]);
        const userLimit = this.safeInteger (params, 'limit');
        const rawMarkets = await this.fetchRawMarketsPaged (rest, userLimit);
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
     * @name sxbet#fetchRawMarketsPaged
     * @description pages through GET /markets/active (cursor-based via paginationKey/nextKey), stopping once options.maxMarketsPages pages or userLimit raw markets have been collected
     * @param {object} [extra] extra request params merged into every page (e.g. leagueId, sportId, sportXeventId)
     * @param {int} [userLimit] stop collecting once this many raw markets have been gathered
     * @returns {object[]} the raw (unparsed) sx.bet market objects
     */
    async fetchRawMarketsPaged (extra: Dict = {}, userLimit: Int = undefined): Promise<any[]> {
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
     * @name sxbet#filterRawMarketsByFixture
     * @description keeps only the raw markets belonging to one fixture — the venue's own sportXeventId filter on /markets/active is unreliable (observed live returning every fixture), so the scope is enforced client-side
     * @param {object[]} rawMarkets the raw sx.bet market objects
     * @param {string} sportXeventId the fixture id to keep
     * @returns {object[]} the raw markets of that fixture only
     */
    filterRawMarketsByFixture (rawMarkets: any[], sportXeventId: string): any[] {
        const result: any[] = [];
        const rawMarketsLength = rawMarkets.length;
        for (let i = 0; i < rawMarketsLength; i++) {
            const raw = rawMarkets[i];
            if (this.safeString (raw, 'sportXeventId') === sportXeventId) {
                result.push (raw);
            }
        }
        return result;
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
        //
        //     {
        //         "status": "ACTIVE",
        //         "marketHash": "0x7154aa3580267e276cccd0f4f826464a05e3efd8e1c81d7717bef6b5ae88b07d",
        //         "outcomeOneName": "Los Angeles Rams",
        //         "outcomeTwoName": "San Francisco 49ers",
        //         "outcomeVoidName": "NO_CONTEST",
        //         "teamOneName": "Los Angeles Rams",
        //         "teamTwoName": "San Francisco 49ers",
        //         "type": 226,
        //         "gameTime": 1789086900,
        //         "line": -2.5, // present on spread/total markets only
        //         "sportXeventId": "L18870109",
        //         "liveEnabled": true,
        //         "sportLabel": "Football",
        //         "sportId": 8,
        //         "leagueId": 243,
        //         "leagueLabel": "NFL",
        //         "mainLine": true,
        //         "isQuarterLineMarket": false
        //     }
        //
        const marketHash = this.safeString (raw, 'marketHash', '');
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
        // guard against a zero sentinel for "no scheduled game time" - safeTimestamp would
        // turn it into the 1970 epoch
        let gameTime = undefined;
        if (this.safeInteger (raw, 'gameTime', 0) !== 0) {
            gameTime = this.safeTimestamp (raw, 'gameTime');
        }
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
                // USDC stakes have 6 decimals; prices sit on the odds ladder (oddsLadderStepSize
                // 125 in 1e-5 units on both networks — see /metadata), i.e. a 0.00125 step
                'amount': 0.000001,
                'price': 0.00125,
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
    override async fetchEvents (params: fetchEventsParams = {}): Promise<PredictionEvent[]> {
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
            rawMarkets = await this.fetchRawMarketsPaged (this.extend ({ 'sportXeventId': eventId }, rest), undefined);
            // the venue's sportXeventId filter on /markets/active is unreliable (observed live
            // returning every fixture) — enforce the scope client-side
            rawMarkets = this.filterRawMarketsByFixture (rawMarkets, eventId);
        } else if (leagueId !== undefined) {
            rawMarkets = await this.fetchRawMarketsPaged (this.extend ({ 'leagueId': leagueId }, rest), undefined);
        } else if (sportId !== undefined) {
            rawMarkets = await this.fetchRawMarketsPaged (this.extend ({ 'sportId': sportId }, rest), undefined);
        } else {
            // no server-side scope left, only query/tags — full scan (same bound as fetchMarkets)
            // then filter client-side, since sx.bet exposes no full-text search endpoint
            rawMarkets = await this.fetchRawMarketsPaged (rest, undefined);
        }
        const queriesLength = queries.length;
        if (queriesLength > 0) {
            const filtered: any[] = [];
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
            const event = this.parseEvent (fixtureId, grouped[fixtureId]);
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
    override async fetchEvent (id: string, params = {}): Promise<PredictionEvent> {
        let rawMarkets = await this.fetchRawMarketsPaged (this.extend ({ 'sportXeventId': id }, params), undefined);
        // enforce the fixture scope client-side — see filterRawMarketsByFixture
        rawMarkets = this.filterRawMarketsByFixture (rawMarkets, id);
        const rawMarketsLength = rawMarkets.length;
        if (rawMarketsLength === 0) {
            throw new BadSymbol (this.id + ' fetchEvent() could not find an active fixture ' + id);
        }
        const event: any = this.parseEvent (id, rawMarkets);
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
     * @name sxbet#parseEvent
     * @description groups a fixture's raw markets (all sharing one sportXeventId) into one unified event structure
     * @param {string} fixtureId the sx.bet sportXeventId
     * @param {object[]} rawMarkets the raw sx.bet market objects belonging to this fixture
     * @returns {object} an event structure
     */
    parseEvent (fixtureId: string, rawMarkets: any[]): any {
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
            if (parsed === undefined) {
                throw new ExchangeError (this.id + ' parseEvent() could not resolve parsed market');
            }
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
            // skip the zero sentinel for "no scheduled game time" so it can't become the epoch
            if ((gameTime !== undefined) && (gameTime !== '0') && ((earliestGameTime === undefined) || (gameTime < earliestGameTime))) {
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
     * @name sxbet#loadSxMetadata
     * @description resolves and caches the network-specific values from /metadata needed to build and sign orders: the USDC token address (sx.bet orders can be denominated in USDC or WSX per-order, but every sxbet market's quote/settle is fixed to 'USDC' — see parseSxbetMarket, so only USDC-denominated liquidity/orders are surfaced), the executor address (maker order signing), the EIP-712 fill domain (chainId/version/verifyingContract) and the odds ladder step
     * @returns {object} a dict with usdcAddress, wsxAddress, executorAddress, chainId, fillVerifyingContract, fillDomainVersion, oddsLadderStepSize, tokenTransferProxy
     */
    async loadSxMetadata (): Promise<Dict> {
        const cached = this.safeDict (this.options, 'sxMetadata');
        if (cached !== undefined) {
            return cached;
        }
        const response = await this.sxbetPublicGetMetadata ();
        const data = this.safeDict (response, 'data', {});
        const addresses = this.safeDict (data, 'addresses', {});
        const addressesKeys = Object.keys (addresses);
        const addressesKeysLength = addressesKeys.length;
        let usdcAddress: Str = undefined;
        let wsxAddress: Str = undefined;
        let chainId: Str = undefined;
        if (addressesKeysLength > 0) {
            chainId = addressesKeys[0];
            const chainAddresses = this.safeDict (addresses, chainId, {});
            usdcAddress = this.safeString (chainAddresses, 'USDC');
            wsxAddress = this.safeString (chainAddresses, 'WSX');
        }
        const executorAddress = this.safeString (data, 'executorAddress');
        const fillVerifyingContract = this.safeString (data, 'EIP712FillHasher');
        const fillDomainVersion = this.safeString (data, 'domainVersion');
        const oddsLadderStepSize = this.safeString (data, 'oddsLadderStepSize', '125');
        const tokenTransferProxy = this.safeString (data, 'TokenTransferProxy');
        if ((usdcAddress === undefined) || (executorAddress === undefined) || (fillVerifyingContract === undefined) || (fillDomainVersion === undefined) || (chainId === undefined) || (tokenTransferProxy === undefined)) {
            throw new ExchangeError (this.id + ' could not resolve required fields from /metadata');
        }
        const metadata: Dict = {
            'usdcAddress': usdcAddress,
            'wsxAddress': wsxAddress,
            'executorAddress': executorAddress,
            'chainId': chainId,
            'fillVerifyingContract': fillVerifyingContract,
            'fillDomainVersion': fillDomainVersion,
            'oddsLadderStepSize': oddsLadderStepSize,
            'tokenTransferProxy': tokenTransferProxy,
        };
        this.options['sxMetadata'] = metadata;
        return metadata;
    }

    /**
     * @ignore
     * @method
     * @name sxbet#roundOddsToLadder
     * @description rounds an implied probability (0-1) to sx.bet's odds ladder (oddsLadderStepSize is in units of 1e-5, e.g. 125 -> a 0.125% step) — a maker's percentageOdds is rejected unless it lands exactly on the ladder
     * @param {string} probability the implied probability as a decimal string (0-1)
     * @param {string} oddsLadderStepSize the raw oddsLadderStepSize from /metadata (e.g. '125')
     * @returns {string} the probability rounded to the nearest ladder step, as a decimal string
     */
    roundOddsToLadder (probability: Str, oddsLadderStepSize: string): string {
        const tickSize = Precise.stringDiv (oddsLadderStepSize, '100000', 10);
        return this.decimalToPrecision (probability, ROUND, tickSize, TICK_SIZE);
    }

    /**
     * @ignore
     * @method
     * @name sxbet#hashPersonalMessage
     * @description hashes a binary message with the EIP-191 personal_sign prefix ("\x19Ethereum Signed Message:\n" + byte length), matching wallet.signMessage()/personal_sign used by sx.bet's maker order signature
     * @param {Uint8Array} binaryMessage the raw bytes to sign
     * @returns {string} the 32-byte digest to ecdsa-sign, as a '0x'-prefixed hex string
     */
    hashPersonalMessage (binaryMessage: any): string {
        const binaryMessageLength = this.binaryLength (binaryMessage);
        const x19 = this.base16ToBinary ('19');
        const newline = this.base16ToBinary ('0a');
        const prefix = this.binaryConcat (x19, this.encode ('Ethereum Signed Message:'), newline, this.encode (this.numberToString (binaryMessageLength)));
        return '0x' + this.hash (this.binaryConcat (prefix, binaryMessage), keccak, 'hex');
    }

    /**
     * @ignore
     * @method
     * @name sxbet#hashEip712Digest
     * @description hashes an EIP-712 encoded payload (domainSeparator‖structHash, prefixed with 0x1901 by ethEncodeStructuredData) down to the final 32-byte digest to sign, used by sx.bet's taker-fill and cancel signatures
     * @param {Uint8Array} encoded the output of this.ethEncodeStructuredData (domain, types, message)
     * @returns {string} the 32-byte digest to ecdsa-sign, as a '0x'-prefixed hex string
     */
    hashEip712Digest (encoded: any): string {
        return '0x' + this.hash (encoded, keccak, 'hex');
    }

    /**
     * @ignore
     * @method
     * @name sxbet#signDigest
     * @description ecdsa-signs a 32-byte digest and assembles the r‖s‖v hex signature sx.bet expects
     * @param {string} digest the '0x'-prefixed 32-byte digest to sign
     * @param {string} privateKey the signer's private key
     * @returns {string} a '0x'-prefixed 65-byte hex signature (r‖s‖v)
     */
    signDigest (digest: string, privateKey: string): string {
        const signature = ecdsa (digest.slice (-64), privateKey.slice (-64), secp256k1, undefined);
        // assign to bare locals before padStart — the php transpiler's str_pad regex only
        // matches a simple identifier, an expression form leaks a raw padStart() call
        const rRaw = signature['r'];
        const sRaw = signature['s'];
        const r = rRaw.padStart (64, '0');
        const s = sRaw.padStart (64, '0');
        const v = this.intToBase16 (this.sum (27, signature['v']));
        return '0x' + r + s + v;
    }

    /**
     * @ignore
     * @method
     * @name sxbet#fetchErc20Name
     * @description reads an ERC20 token's name() via eth_call (needed for the Permit EIP-712 domain — must match the token's real on-chain name or the signature fails verification)
     * @param {string} rpcUrl the RPC endpoint to call
     * @param {string} tokenAddress the token contract address
     * @returns {string} the token's on-chain name
     */
    async fetchErc20Name (rpcUrl: Str, tokenAddress: string): Promise<string> {
        const nameCallData = '0x06fdde03'; // name()
        const result = await this.ethRpc (rpcUrl, 'eth_call', [ { 'to': tokenAddress, 'data': nameCallData }, 'latest' ]);
        const hex = this.remove0xPrefix (result);
        // dynamic ABI string return: [32-byte offset][32-byte length][utf8 bytes, right-padded]
        const lengthHex = hex.slice (64, 128);
        const length = this.hexToInt (lengthHex);
        const dataEnd = this.sum (128, length * 2);
        const dataHex = hex.slice (128, dataEnd);
        return this.decode (this.base16ToBinary (dataHex));
    }

    /**
     * @ignore
     * @method
     * @name sxbet#hexToInt
     * @description parses a hex string (no '0x' prefix) into an integer — plain digit-by-digit, since JS's parseInt (hex, 16) two-argument form has no portable equivalent across languages/transpilers. Only used for small values (byte lengths, permit nonces), safe well within the float-precision range
     * @param {string} hex the hex string, no '0x' prefix
     * @returns {int} the parsed integer
     */
    hexToInt (hex: string): number {
        const digits = '0123456789abcdef';
        const lowerHex = hex.toLowerCase ();
        const hexLength = lowerHex.length;
        let result = 0;
        for (let i = 0; i < hexLength; i++) {
            const ch = lowerHex[i];
            const digitValue = digits.indexOf (ch);
            result = (result * 16) + digitValue;
        }
        return result;
    }

    /**
     * @method
     * @name sxbet#approve
     * @description grants sx.bet's TokenTransferProxy an ERC20 allowance over the wallet's USDC via a gasless EIP-2612 Permit signature (POST /orders/approve) — required once before any order can be placed, otherwise the API rejects orders with an allowance error
     * @see https://docs.sx.bet/api-reference/post-approve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.tokenAddress] the token to approve, defaults to USDC (from /metadata)
     * @param {string} [params.spender] the address granted the allowance, defaults to TokenTransferProxy (from /metadata)
     * @param {string} [params.value] the allowance in raw token units, defaults to unlimited (max uint256)
     * @param {int} [params.deadline] unix seconds the permit signature expires at, defaults to options.approveDeadlineSeconds from now
     * @param {string} [params.rpcUrl] overrides the chain's default RPC endpoint (see options.chains)
     * @returns {object} a dict with the raw response and the returned approval tx hash (undefined if the allowance was already set)
     */
    async approve (params = {}): Promise<any> {
        this.checkRequiredCredentials ();
        if (this.privateKey === undefined) {
            throw new ArgumentsRequired (this.id + ' approve() requires a privateKey to sign the permit');
        }
        const sxMetadata = await this.loadSxMetadata ();
        const usdcAddress = this.safeString (sxMetadata, 'usdcAddress', '');
        const tokenTransferProxy = this.safeString (sxMetadata, 'tokenTransferProxy', '');
        const chainId = this.safeInteger (sxMetadata, 'chainId');
        const tokenAddress = this.safeString (params, 'tokenAddress', usdcAddress);
        const spender = this.safeString (params, 'spender', tokenTransferProxy);
        const chains = this.safeDict (this.options, 'chains', {});
        const chainConfig = this.safeDict (chains, this.numberToString (chainId), {});
        const rpcUrl = this.safeString (params, 'rpcUrl', this.safeString (chainConfig, 'rpcUrl'));
        if (rpcUrl === undefined) {
            throw new ArgumentsRequired (this.id + ' approve() has no RPC endpoint configured for chainId ' + this.numberToString (chainId) + ' - pass params.rpcUrl');
        }
        const owner = this.walletAddress;
        const nonceCallData = '0x7ecebe00' + this.padHexAddress (owner); // nonces(address)
        const nonceResult = await this.ethRpc (rpcUrl, 'eth_call', [ { 'to': tokenAddress, 'data': nonceCallData }, 'latest' ]);
        const nonceHex = this.hexToRlpBytes (nonceResult);
        const nonce = (nonceHex === '') ? '0' : this.numberToString (this.hexToInt (nonceHex));
        const tokenName = await this.fetchErc20Name (rpcUrl, tokenAddress);
        const defaultDeadlineSeconds = this.safeInteger (this.options, 'approveDeadlineSeconds', 7200);
        const deadline = this.safeInteger (params, 'deadline', this.sum (this.seconds (), defaultDeadlineSeconds));
        const maxUint256 = '115792089237316195423570985008687907853269984665640564039457584007913129639935';
        const value = this.safeString (params, 'value', maxUint256);
        const domain: Dict = { 'name': tokenName, 'version': '1', 'chainId': chainId, 'verifyingContract': tokenAddress };
        const messageTypes: Dict = {
            'Permit': [
                { 'name': 'owner', 'type': 'address' },
                { 'name': 'spender', 'type': 'address' },
                { 'name': 'value', 'type': 'uint256' },
                { 'name': 'nonce', 'type': 'uint256' },
                { 'name': 'deadline', 'type': 'uint256' },
            ],
        };
        const messageData: Dict = { 'owner': owner, 'spender': spender, 'value': value, 'nonce': nonce, 'deadline': deadline };
        const encoded = this.ethEncodeStructuredData (domain, messageTypes, messageData);
        const digest = this.hashEip712Digest (encoded);
        const signature = this.signDigest (digest, this.privateKey);
        const request: Dict = {
            'owner': owner,
            'spender': spender,
            'tokenAddress': tokenAddress,
            'value': value,
            'deadline': deadline,
            'signature': signature,
        };
        const rest = this.omit (params, [ 'tokenAddress', 'spender', 'value', 'deadline', 'rpcUrl' ]);
        const response = await this.sxbetPrivatePostOrdersApprove (this.extend (request, rest));
        const data = this.safeDict (response, 'data', {});
        return {
            'info': response,
            'id': this.safeString (data, 'hash'),
        };
    }

    /**
     * @method
     * @name sxbet#createOrder
     * @description places an order on sx.bet — a 'limit' order posts a resting MAKER order (personal_sign, POST /orders/new); a 'market' order immediately fills against resting maker orders as a TAKER (EIP-712 signed, POST /orders/fill/v2). sx.bet has no shares — 'amount' is the USDC stake to risk, and 'price' is the implied probability (0-1) of the requested outcome. 'sell' bets the OPPOSITE outcome of the one requested (sx.bet is bilateral: there is no owned position to sell, only the complementary side of the same market)
     * @see https://docs.sx.bet/developers/posting-orders
     * @see https://docs.sx.bet/developers/filling-orders
     * @param {string} outcome unified outcome handle or outcomeId (marketHash or marketHash + '-2')
     * @param {string} type 'limit' (resting maker order) or 'market' (immediate taker fill)
     * @param {string} side 'buy' bets the requested outcome directly; 'sell' bets the complementary outcome of the same market
     * @param {float} amount the USDC amount to stake/risk
     * @param {float} [price] implied probability (0-1) of the requested outcome; required for both order types — for 'market' it acts as the reference (worst acceptable) fill price the oddsSlippage tolerance applies to
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.apiExpiry] unix seconds the maker order expires at (limit only), defaults to options.defaultOrderExpirySeconds from now
     * @param {int} [params.oddsSlippage] percent tolerance (0-100) on the fill price (market only), defaults to 5
     * @param {string} [params.salt] overrides the random salt/fillSalt differentiating this order
     * @returns {object} a [prediction order structure](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    override async createOrder (outcome: string, type: Str, side: Str, amount: Num, price: Num = undefined, params = {}): Promise<PredictionOrder> {
        this.checkRequiredCredentials ();
        await this.loadOutcome (outcome);
        const outcomeObj = this.outcome (outcome);
        if (type === 'limit') {
            return await this.createSxbetMakerOrder (outcomeObj, side, amount, price, params);
        } else if (type === 'market') {
            return await this.createSxbetTakerFillOrder (outcomeObj, side, amount, price, params);
        }
        throw new InvalidOrder (this.id + " createOrder() type must be 'limit' or 'market', got " + type);
    }

    /**
     * @ignore
     * @method
     * @name sxbet#createSxbetMakerOrder
     * @description builds, signs (personal_sign) and posts a resting maker order via POST /orders/new
     * @returns {object} a [prediction order structure](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    async createSxbetMakerOrder (outcomeObj: Dict, side: Str, amount: Num, price: Num, params = {}): Promise<PredictionOrder> {
        if (price === undefined) {
            throw new ArgumentsRequired (this.id + " createOrder() requires a price for a 'limit' order");
        }
        const marketHash = this.safeString (outcomeObj['info'], 'marketHash', '');
        const outcomeId = this.safeString (outcomeObj, 'outcomeId');
        const isOutcomeOne = (outcomeId === marketHash);
        const isBuy = (side === 'buy');
        // 'sell' bets the complementary outcome, mirroring the requested outcome's own probability —
        // matches the normalize-to-one-book convention used by other prediction venues
        const isMakerBettingOutcomeOne = (isBuy) ? isOutcomeOne : !isOutcomeOne;
        const priceStr = this.numberToString (price);
        const makerProbability = (isBuy) ? priceStr : Precise.stringSub ('1', priceStr);
        const sxMetadata = await this.loadSxMetadata ();
        const usdcAddress = this.safeString (sxMetadata, 'usdcAddress', '');
        const executor = this.safeString (sxMetadata, 'executorAddress', '');
        const oddsLadderStepSize = this.safeString (sxMetadata, 'oddsLadderStepSize', '125');
        const roundedProbability = this.roundOddsToLadder (makerProbability, oddsLadderStepSize);
        const percentageOdds = this.decimalToPrecision (Precise.stringMul (roundedProbability, '100000000000000000000'), ROUND, 0, DECIMAL_PLACES);
        const amountStr = this.numberToString (amount);
        const totalBetSize = this.decimalToPrecision (Precise.stringMul (amountStr, '1000000'), ROUND, 0, DECIMAL_PLACES);
        const expiry = '2209006800'; // deprecated field, sx.bet requires this exact hardcoded value
        const defaultExpirySeconds = this.safeInteger (this.options, 'defaultOrderExpirySeconds', 3600);
        const apiExpiry = this.safeInteger (params, 'apiExpiry', this.sum (this.seconds (), defaultExpirySeconds));
        const salt = this.safeString (params, 'salt', this.numberToString (this.milliseconds ()));
        const maker = this.walletAddress;
        const orderHash = this.hashSxbetOrder (marketHash, usdcAddress, totalBetSize, percentageOdds, expiry, salt, maker, executor, isMakerBettingOutcomeOne);
        const digest = this.hashPersonalMessage (this.base16ToBinary (this.remove0xPrefix (orderHash)));
        const signature = this.signDigest (digest, this.privateKey);
        const orderRequest: Dict = {
            'marketHash': marketHash,
            'maker': maker,
            'baseToken': usdcAddress,
            'totalBetSize': totalBetSize,
            'percentageOdds': percentageOdds,
            'expiry': this.parseToInt (expiry),
            'apiExpiry': apiExpiry,
            'executor': executor,
            'salt': salt,
            'isMakerBettingOutcomeOne': isMakerBettingOutcomeOne,
            'signature': signature,
        };
        const rest = this.omit (params, [ 'apiExpiry', 'salt' ]);
        const response = await this.sxbetPrivatePostOrdersNew (this.extend ({ 'orders': [ orderRequest ] }, rest));
        const data = this.safeDict (response, 'data', {});
        const orderHashes = this.safeList (data, 'orders', []);
        const statuses = this.safeDict (data, 'statuses', {});
        const returnedId = this.safeString (orderHashes, 0, orderHash);
        const status = this.safeString (statuses, returnedId, this.safeString (statuses, orderHash));
        if ((status !== undefined) && (status !== 'OK')) {
            // per-order rejections (INSUFFICIENT_BALANCE, ORDERS_ALREADY_EXIST, ...) arrive inside a
            // 200 response, so handleErrors never sees them — route them through the same mapping
            const feedback = this.id + ' createOrder() rejected: ' + status;
            this.throwExactlyMatchedException (this.exceptions['exact'], status, feedback);
            throw new InvalidOrder (feedback);
        }
        const now = this.milliseconds ();
        return this.safePredictionOrder ({
            'id': returnedId,
            'clientOrderId': undefined,
            'timestamp': now,
            'datetime': this.iso8601 (now),
            'lastTradeTimestamp': undefined,
            'status': 'open',
            'type': 'limit',
            'timeInForce': undefined,
            'side': side,
            'price': price,
            'average': undefined,
            'amount': amount,
            'filled': 0,
            'remaining': amount,
            'cost': amount,
            'fee': undefined,
            'reduceOnly': undefined,
            'postOnly': undefined,
            'trades': [],
            'outcome': this.safeString (outcomeObj, 'outcome'),
            'outcomeId': this.safeString (outcomeObj, 'outcomeId'),
            'label': this.safeString (outcomeObj, 'label'),
            'market': this.safeString (outcomeObj, 'market'),
            'info': response,
        }, outcomeObj);
    }

    /**
     * @ignore
     * @method
     * @name sxbet#sxbetUint256Hex
     * @description converts a decimal integer string into 32-byte zero-padded hex via string arithmetic - uint256 order fields (percentageOdds ~ 5e19) overflow the native 64-bit integers some language bases use for byte packing
     * @param {string} value the non-negative decimal integer string
     * @returns {string} a 64-character lowercase hex string without the 0x prefix
     */
    sxbetUint256Hex (value: string): string {
        const digits = [ '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f' ];
        let hexRaw = '';
        let remaining: Str = value;
        // a uint256 has at most 64 hex digits, so the loop is bounded instead of while-based
        for (let i = 0; i < 64; i++) {
            const isPositive = Precise.stringGt (remaining, '0');
            if (!isPositive) {
                break;
            }
            const digitStr = Precise.stringMod (remaining, '16');
            const digit = this.parseToInt (digitStr);
            hexRaw = digits[digit] + hexRaw;
            remaining = Precise.stringDiv (remaining, '16', 0);
        }
        return hexRaw.padStart (64, '0');
    }

    /**
     * @ignore
     * @method
     * @name sxbet#hashSxbetOrder
     * @description builds the sx.bet maker order hash: solidity-packed keccak256 of (marketHash, baseToken, totalBetSize, percentageOdds, expiry, salt, maker, executor, isMakerBettingOutcomeOne). Packed manually (bytes32‖address‖uint256 x4‖address‖address‖bool, minimal per-type byte widths) via base primitives ported to every language, rather than the TS-only vendored solidityPackedKeccak256 helper — verified byte-identical against it
     * @returns {string} the 32-byte order hash, as a '0x'-prefixed hex string
     */
    hashSxbetOrder (marketHash: string, baseToken: string, totalBetSize: string, percentageOdds: string, expiry: string, salt: string, maker: string, executor: string, isMakerBettingOutcomeOne: boolean): string {
        // ternary hoisted to a bare local before base16ToBinary: inlined inside the function call
        // argument, the regex transpiler mangles it (see the signatureType fix earlier this session)
        const boolHex = (isMakerBettingOutcomeOne) ? '01' : '00';
        const packed = this.binaryConcat (
            this.base16ToBinary (this.remove0xPrefix (marketHash)),
            this.base16ToBinary (this.remove0xPrefix (baseToken)),
            this.base16ToBinary (this.sxbetUint256Hex (totalBetSize)),
            this.base16ToBinary (this.sxbetUint256Hex (percentageOdds)),
            this.base16ToBinary (this.sxbetUint256Hex (expiry)),
            this.base16ToBinary (this.sxbetUint256Hex (salt)),
            this.base16ToBinary (this.remove0xPrefix (maker)),
            this.base16ToBinary (this.remove0xPrefix (executor)),
            this.base16ToBinary (boolHex)
        );
        return '0x' + this.hash (packed, keccak, 'hex');
    }

    /**
     * @ignore
     * @method
     * @name sxbet#createSxbetTakerFillOrder
     * @description builds, signs (EIP-712) and posts an immediate taker fill via POST /orders/fill/v2
     * @returns {object} a [prediction order structure](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    async createSxbetTakerFillOrder (outcomeObj: Dict, side: Str, amount: Num, price: Num = undefined, params = {}): Promise<PredictionOrder> {
        const marketHash = this.safeString (outcomeObj['info'], 'marketHash', '');
        const outcomeId = this.safeString (outcomeObj, 'outcomeId');
        const isOutcomeOne = (outcomeId === marketHash);
        const isBuy = (side === 'buy');
        const isTakerBettingOutcomeOne = (isBuy) ? isOutcomeOne : !isOutcomeOne;
        if (price === undefined) {
            // the reference (worst acceptable) price the desiredOdds are computed from
            throw new ArgumentsRequired (this.id + " createOrder() requires a price for a 'market' order");
        }
        const requestedProbabilityStr = this.numberToString (price);
        const takerProbability = (isBuy) ? requestedProbabilityStr : Precise.stringSub ('1', requestedProbabilityStr);
        const desiredOdds = this.decimalToPrecision (Precise.stringMul (takerProbability, '100000000000000000000'), ROUND, 0, DECIMAL_PLACES);
        let oddsSlippage = undefined;
        [ oddsSlippage, params ] = this.handleOptionAndParams (params, 'createOrder', 'oddsSlippage', 5);
        const sxMetadata = await this.loadSxMetadata ();
        const usdcAddress = this.safeString (sxMetadata, 'usdcAddress', '');
        const chainId = this.safeInteger (sxMetadata, 'chainId');
        const fillVerifyingContract = this.safeString (sxMetadata, 'fillVerifyingContract', '');
        const fillDomainVersion = this.safeString (sxMetadata, 'fillDomainVersion', '');
        const amountStr = this.numberToString (amount);
        const stakeWei = this.decimalToPrecision (Precise.stringMul (amountStr, '1000000'), ROUND, 0, DECIMAL_PLACES);
        const fillSalt = this.safeString (params, 'salt', this.numberToString (this.milliseconds ()));
        const taker = this.walletAddress;
        const zeroAddress = '0x0000000000000000000000000000000000000000';
        const zeroHash = '0x0000000000000000000000000000000000000000000000000000000000000000';
        const domain: Dict = {
            'name': 'SX Bet',
            'version': fillDomainVersion,
            'chainId': chainId,
            'verifyingContract': fillVerifyingContract,
        };
        const messageTypes: Dict = {
            'Details': [
                { 'name': 'action', 'type': 'string' },
                { 'name': 'market', 'type': 'string' },
                { 'name': 'betting', 'type': 'string' },
                { 'name': 'stake', 'type': 'string' },
                { 'name': 'worstOdds', 'type': 'string' },
                { 'name': 'worstReturning', 'type': 'string' },
                { 'name': 'fills', 'type': 'FillObject' },
            ],
            'FillObject': [
                { 'name': 'stakeWei', 'type': 'string' },
                { 'name': 'marketHash', 'type': 'string' },
                { 'name': 'baseToken', 'type': 'string' },
                { 'name': 'desiredOdds', 'type': 'string' },
                { 'name': 'oddsSlippage', 'type': 'uint256' },
                { 'name': 'isTakerBettingOutcomeOne', 'type': 'bool' },
                { 'name': 'fillSalt', 'type': 'uint256' },
                { 'name': 'beneficiary', 'type': 'address' },
                { 'name': 'beneficiaryType', 'type': 'uint8' },
                { 'name': 'cashOutTarget', 'type': 'bytes32' },
            ],
        };
        const messageData: Dict = {
            'action': 'N/A',
            'market': marketHash,
            'betting': 'N/A',
            'stake': 'N/A',
            'worstOdds': 'N/A',
            'worstReturning': 'N/A',
            'fills': {
                'stakeWei': stakeWei,
                'marketHash': marketHash,
                'baseToken': usdcAddress,
                'desiredOdds': desiredOdds,
                'oddsSlippage': oddsSlippage,
                'isTakerBettingOutcomeOne': isTakerBettingOutcomeOne,
                'fillSalt': fillSalt,
                'beneficiary': zeroAddress,
                'beneficiaryType': 0,
                'cashOutTarget': zeroHash,
            },
        };
        const encoded = this.ethEncodeStructuredData (domain, messageTypes, messageData);
        const digest = this.hashEip712Digest (encoded);
        const takerSig = this.signDigest (digest, this.privateKey);
        const request: Dict = {
            'market': marketHash,
            'baseToken': usdcAddress,
            'isTakerBettingOutcomeOne': isTakerBettingOutcomeOne,
            'stakeWei': stakeWei,
            'desiredOdds': desiredOdds,
            'oddsSlippage': oddsSlippage,
            'fillSalt': fillSalt,
            'taker': taker,
            'takerSig': takerSig,
        };
        const rest = this.omit (params, [ 'salt' ]);
        const response = await this.sxbetPrivatePostOrdersFillV2 (this.extend (request, rest));
        const data = this.safeDict (response, 'data', {});
        const fillHash = this.safeString (data, 'fillHash');
        const totalFilledStr = this.safeString (data, 'totalFilled', '0');
        const filled = this.parseNumber (Precise.stringDiv (totalFilledStr, '1000000', 6));
        const averageOddsStr = this.safeString (data, 'averageOdds');
        let averagePrice: Num = undefined;
        if (averageOddsStr !== undefined) {
            const averageTakerProbability = Precise.stringDiv (averageOddsStr, '100000000000000000000', 10);
            // ternary hoisted to a bare local before parseNumber (see hashSxbetOrder's comment)
            const averageOutcomeProbability = (isBuy) ? averageTakerProbability : Precise.stringSub ('1', averageTakerProbability);
            averagePrice = this.parseNumber (averageOutcomeProbability);
        }
        const now = this.milliseconds ();
        return this.safePredictionOrder ({
            'id': fillHash,
            'clientOrderId': undefined,
            'timestamp': now,
            'datetime': this.iso8601 (now),
            'lastTradeTimestamp': now,
            'status': 'closed',
            'type': 'market',
            'timeInForce': undefined,
            'side': side,
            'price': (averagePrice !== undefined) ? averagePrice : price,
            'average': averagePrice,
            'amount': amount,
            'filled': filled,
            'remaining': this.parseNumber (Precise.stringSub (amountStr, this.numberToString (filled))),
            'cost': filled,
            'fee': undefined,
            'reduceOnly': undefined,
            'postOnly': undefined,
            'trades': [],
            'outcome': this.safeString (outcomeObj, 'outcome'),
            'outcomeId': this.safeString (outcomeObj, 'outcomeId'),
            'label': this.safeString (outcomeObj, 'label'),
            'market': this.safeString (outcomeObj, 'market'),
            'info': response,
        }, outcomeObj);
    }

    /**
     * @ignore
     * @method
     * @name sxbet#signSxbetCancel
     * @description signs a cancel payload with EIP-712 — the cancel domain uses a random 'salt' field instead of the usual 'verifyingContract' (verified byte-identical against the reference TypedDataEncoder for this domain shape)
     * @param {string} domainName the EIP-712 domain name for this cancel endpoint (e.g. 'CancelOrderV2SportX')
     * @param {object} messageTypes the EIP-712 'Details' type definition for this cancel endpoint
     * @param {object} messageData the EIP-712 message values for this cancel endpoint
     * @param {string} salt the random bytes32 hex salt (also sent in the request body)
     * @returns {string} a '0x'-prefixed 65-byte hex signature
     */
    async signSxbetCancel (domainName: string, messageTypes: Dict, messageData: Dict, salt: string): Promise<string> {
        const sxMetadata = await this.loadSxMetadata ();
        const chainId = this.safeInteger (sxMetadata, 'chainId');
        // the bytes32 domain salt goes in as raw bytes - every language's EIP-712 encoder accepts
        // binary, while a hex string ends up UTF8-encoded (and rejected) by some of them
        const saltBinary = this.base16ToBinary (this.remove0xPrefix (salt));
        const domain: Dict = { 'name': domainName, 'version': '1.0', 'chainId': chainId, 'salt': saltBinary };
        const encoded = this.ethEncodeStructuredData (domain, messageTypes, messageData);
        const digest = this.hashEip712Digest (encoded);
        return this.signDigest (digest, this.privateKey);
    }

    /**
     * @ignore
     * @method
     * @name sxbet#parseSxbetCancelResult
     * @description parses one order's outcome out of a cancel endpoint's shared {cancelledCount, orders, notCancelled} response shape
     * @param {string} orderHash the order hash to report status for
     * @param {object} response the raw cancel endpoint response
     * @returns {object} a [prediction order structure](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    parseSxbetCancelResult (orderHash: string, response: Dict): PredictionOrder {
        const data = this.safeDict (response, 'data', {});
        const cancelledOrders = this.safeList (data, 'orders', []);
        let status = 'open';
        const cancelledOrdersLength = cancelledOrders.length;
        for (let i = 0; i < cancelledOrdersLength; i++) {
            if (this.safeString (cancelledOrders[i], 'orderHash') === orderHash) {
                status = 'canceled';
                break;
            }
        }
        return this.safePredictionOrder ({
            'id': orderHash,
            'status': status,
            'info': response,
        });
    }

    /**
     * @ignore
     * @method
     * @name sxbet#cancelSxbetOrders
     * @description signs and posts a batch cancel via POST /orders/cancel/v2 — one EIP-712 signature cancels every hash in the list
     * @param {string[]} orderHashes the order hashes to cancel
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a [prediction order structure](https://docs.ccxt.com/#/?id=prediction-order-structure) per requested hash
     */
    async cancelSxbetOrders (orderHashes: string[], params = {}): Promise<PredictionOrder[]> {
        this.checkRequiredCredentials ();
        if (this.privateKey === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a privateKey to sign the cancel request');
        }
        const maker = this.walletAddress;
        const timestamp = this.seconds ();
        // assign to a bare local before padStart — see the signDigest comment
        const saltHexRaw = this.intToBase16 (this.milliseconds ());
        const saltHex = saltHexRaw.padStart (64, '0');
        const salt = this.safeString (params, 'salt', '0x' + saltHex);
        const messageTypes: Dict = {
            'Details': [
                { 'name': 'orderHashes', 'type': 'string[]' },
                { 'name': 'timestamp', 'type': 'uint256' },
            ],
        };
        const messageData: Dict = { 'orderHashes': orderHashes, 'timestamp': timestamp };
        const signature = await this.signSxbetCancel ('CancelOrderV2SportX', messageTypes, messageData, salt);
        const request: Dict = {
            'orderHashes': orderHashes,
            'signature': signature,
            'salt': salt,
            'maker': maker,
            'timestamp': timestamp,
        };
        const rest = this.omit (params, [ 'salt' ]);
        const response = await this.sxbetPrivatePostOrdersCancelV2 (this.extend (request, rest));
        const result: PredictionOrder[] = [];
        const orderHashesLength = orderHashes.length;
        for (let i = 0; i < orderHashesLength; i++) {
            result.push (this.parseSxbetCancelResult (orderHashes[i], response));
        }
        return result;
    }

    /**
     * @method
     * @name sxbet#cancelOrder
     * @description cancels a single resting maker order by its order hash
     * @see https://docs.sx.bet/api-reference/post-cancel-orders
     * @param {string} id the order hash to cancel
     * @param {string} [outcome] not used by sxbet.cancelOrder
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [prediction order structure](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    override async cancelOrder (id: string, outcome: Str = undefined, params = {}): Promise<PredictionOrder> {
        if (id === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires an id argument');
        }
        const orders = await this.cancelSxbetOrders ([ id ], params);
        return this.safeDict (orders, 0) as PredictionOrder;
    }

    /**
     * @method
     * @name sxbet#cancelOrders
     * @description cancels multiple resting maker orders in a single signed request
     * @see https://docs.sx.bet/api-reference/post-cancel-orders
     * @param {string[]} ids the order hashes to cancel
     * @param {string} [outcome] not used by sxbet.cancelOrders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [prediction order structures](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    override async cancelOrders (ids: string[], outcome: Str = undefined, params = {}): Promise<PredictionOrder[]> {
        if ((ids === undefined) || (ids.length === 0)) {
            throw new ArgumentsRequired (this.id + ' cancelOrders() requires a non-empty ids argument');
        }
        return await this.cancelSxbetOrders (ids, params);
    }

    /**
     * @method
     * @name sxbet#cancelAllOrders
     * @description cancels every resting maker order. With no outcome, one signature cancels ALL open orders (POST /orders/cancel/all). With an outcome, only that market's open orders are cancelled — resolved via GET /orders and batch-cancelled through POST /orders/cancel/v2, since sx.bet's per-market granularity of native cancellation is the whole fixture (POST /orders/cancel/event, all markets under one sportXeventId), not a single market
     * @see https://docs.sx.bet/api-reference/post-cancel-all
     * @see https://docs.sx.bet/api-reference/post-cancel-event
     * @param {string} [outcome] unified outcome or outcomeId — scopes the cancel to that outcome's market; omit to cancel everything
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.sportXeventId] cancels every order across every market of this fixture (POST /orders/cancel/event) instead of the outcome/blanket paths
     * @returns {object[]} a list of [prediction order structures](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    async cancelAllOrders (outcome: Str = undefined, params = {}): Promise<PredictionOrder[]> {
        this.checkRequiredCredentials ();
        if (this.privateKey === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelAllOrders() requires a privateKey to sign the cancel request');
        }
        const maker = this.walletAddress;
        const timestamp = this.seconds ();
        // assign to a bare local before padStart — see the signDigest comment
        const saltHexRaw = this.intToBase16 (this.milliseconds ());
        const saltHex = saltHexRaw.padStart (64, '0');
        const salt = this.safeString (params, 'salt', '0x' + saltHex);
        const sportXeventId = this.safeString (params, 'sportXeventId');
        if (sportXeventId !== undefined) {
            const messageTypes: Dict = {
                'Details': [
                    { 'name': 'sportXeventId', 'type': 'string' },
                    { 'name': 'timestamp', 'type': 'uint256' },
                ],
            };
            const messageData: Dict = { 'sportXeventId': sportXeventId, 'timestamp': timestamp };
            const signature = await this.signSxbetCancel ('CancelOrderEventsSportX', messageTypes, messageData, salt);
            const request: Dict = {
                'sportXeventId': sportXeventId,
                'signature': signature,
                'salt': salt,
                'maker': maker,
                'timestamp': timestamp,
            };
            const rest = this.omit (params, [ 'salt', 'sportXeventId' ]);
            const response = await this.sxbetPrivatePostOrdersCancelEvent (this.extend (request, rest));
            const data = this.safeDict (response, 'data', {});
            const cancelledOrders = this.safeList (data, 'orders', []);
            const result: PredictionOrder[] = [];
            const cancelledOrdersLength = cancelledOrders.length;
            for (let i = 0; i < cancelledOrdersLength; i++) {
                const orderHash = this.safeString (cancelledOrders[i], 'orderHash', '');
                result.push (this.parseSxbetCancelResult (orderHash, response));
            }
            return result;
        }
        if (outcome !== undefined) {
            await this.loadOutcome (outcome);
            const outcomeObj = this.outcome (outcome);
            const marketHash = this.safeString (outcomeObj['info'], 'marketHash', '');
            const openOrders = await this.sxbetPublicGetOrders ({ 'marketHashes': marketHash, 'maker': maker });
            const rawOrders = this.safeList (openOrders, 'data', []);
            const orderHashes: string[] = [];
            const rawOrdersLength = rawOrders.length;
            for (let i = 0; i < rawOrdersLength; i++) {
                const rawOrder = rawOrders[i];
                if (this.safeString (rawOrder, 'orderStatus') === 'ACTIVE') {
                    orderHashes.push (this.safeString (rawOrder, 'orderHash', ''));
                }
            }
            if (orderHashes.length === 0) {
                return [];
            }
            return await this.cancelSxbetOrders (orderHashes, params);
        }
        const blanketMessageTypes: Dict = {
            'Details': [
                { 'name': 'timestamp', 'type': 'uint256' },
            ],
        };
        const blanketMessageData: Dict = { 'timestamp': timestamp };
        const blanketSignature = await this.signSxbetCancel ('CancelAllOrdersSportX', blanketMessageTypes, blanketMessageData, salt);
        const blanketRequest: Dict = {
            'signature': blanketSignature,
            'salt': salt,
            'maker': maker,
            'timestamp': timestamp,
        };
        const blanketRest = this.omit (params, [ 'salt' ]);
        const blanketResponse = await this.sxbetPrivatePostOrdersCancelAll (this.extend (blanketRequest, blanketRest));
        const blanketData = this.safeDict (blanketResponse, 'data', {});
        const blanketCancelledOrders = this.safeList (blanketData, 'orders', []);
        const blanketResult: PredictionOrder[] = [];
        const blanketCancelledOrdersLength = blanketCancelledOrders.length;
        for (let i = 0; i < blanketCancelledOrdersLength; i++) {
            const orderHash = this.safeString (blanketCancelledOrders[i], 'orderHash', '');
            blanketResult.push (this.parseSxbetCancelResult (orderHash, blanketResponse));
        }
        return blanketResult;
    }

    /**
     * @ignore
     * @method
     * @name sxbet#parsePredictionOrder
     * @description parses one raw GET /orders row into a unified prediction order. every sx.bet maker order is a 'buy' of the outcome it bets on (isMakerBettingOutcomeOne selects the side), priced at the maker's own implied probability
     * @param {object} order the raw sx.bet order object
     * @param {object} [market] the outcome object the order belongs to (resolved from the cache by outcomeId when omitted)
     * @returns {object} a [prediction order structure](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    override parsePredictionOrder (order: Dict, market: Market = undefined): PredictionOrder {
        //
        //     {
        //         "marketHash": "0xbf06c6379c922d8118612d1d7493b20f6df6929437fbf6022904327f9516a2eb",
        //         "fillAmount": "0",
        //         "pendingFillAmount": "0",
        //         "orderHash": "0x17253b84088b569faeb88d9e32df6eb213a9f45dee475712e8c98c2fbd6f17f8",
        //         "maker": "0xC3f45c4Ea846424eA5bf1Dd4121b251293210f03",
        //         "totalBetSize": "5000000",
        //         "percentageOdds": "50000000000000000000",
        //         "baseToken": "0x1BC6326EA6aF2aB8E4b6Bc83418044B1923b2956",
        //         "executor": "0x3259E7Ccc0993368fCB82689F5C534669A0C06ca",
        //         "salt": "1785852948895",
        //         "isMakerBettingOutcomeOne": true,
        //         "signature": "0x...",
        //         "expiry": 2209006800,
        //         "apiExpiry": 1785853540,
        //         "sportXeventId": "L12003787",
        //         "orderStatus": "ACTIVE"
        //     }
        //
        const orderHash = this.safeString (order, 'orderHash');
        const marketHash = this.safeString (order, 'marketHash', '');
        const isMakerBettingOutcomeOne = this.safeBool (order, 'isMakerBettingOutcomeOne', true);
        const outcomeId = (isMakerBettingOutcomeOne) ? marketHash : (marketHash + '-2');
        const outcomeObj = this.safeOutcome (outcomeId, market as any);
        const oneDenom = '100000000000000000000';
        const usdcDecimals = '1000000';
        const percentageOdds = this.safeString (order, 'percentageOdds');
        const price = (percentageOdds !== undefined) ? this.parseNumber (Precise.stringDiv (percentageOdds, oneDenom)) : undefined;
        const totalBetSize = this.safeString (order, 'totalBetSize', '0');
        const fillAmount = this.safeString (order, 'fillAmount', '0');
        const pendingFillAmount = this.safeString (order, 'pendingFillAmount', '0');
        const amount = this.parseNumber (Precise.stringDiv (totalBetSize, usdcDecimals, 6));
        const filled = this.parseNumber (Precise.stringDiv (fillAmount, usdcDecimals, 6));
        const remainingRaw = Precise.stringSub (Precise.stringSub (totalBetSize, fillAmount), pendingFillAmount);
        const remaining = this.parseNumber (Precise.stringDiv (remainingRaw, usdcDecimals, 6));
        // the venue only distinguishes ACTIVE/INACTIVE; an INACTIVE fully-filled order closed,
        // any other INACTIVE order was cancelled or expired
        const orderStatus = this.safeString (order, 'orderStatus');
        let status = 'open';
        if (orderStatus !== 'ACTIVE') {
            status = Precise.stringGe (fillAmount, totalBetSize) ? 'closed' : 'canceled';
        }
        // the sortBy created_at key exists server-side but the row carries no timestamp field
        return this.safePredictionOrder ({
            'id': orderHash,
            'clientOrderId': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'lastTradeTimestamp': undefined,
            'status': status,
            'type': 'limit',
            'timeInForce': undefined,
            'side': 'buy',
            'price': price,
            'average': undefined,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'cost': undefined,
            'fee': undefined,
            'reduceOnly': undefined,
            'postOnly': undefined,
            'trades': [],
            'outcome': this.safeString (outcomeObj, 'outcome'),
            'outcomeId': this.safeString (outcomeObj, 'outcomeId', outcomeId),
            'label': this.safeString (outcomeObj, 'label'),
            'market': this.safeString (outcomeObj, 'market'),
            'info': order,
        }, outcomeObj) as PredictionOrder;
    }

    /**
     * @method
     * @name sxbet#fetchOpenOrders
     * @description fetches the wallet's resting maker orders via GET /orders scoped by maker — needs only walletAddress (the endpoint is public), no privateKey
     * @see https://docs.sx.bet/api-reference/get-orders
     * @param {string} [outcome] unified outcome or outcomeId — narrows to that outcome's market
     * @param {int} [since] not supported by the venue (order rows carry no timestamp), applied client-side only if the venue adds one
     * @param {int} [limit] the maximum number of orders to return (server-side perPage, max 1000)
     * @param {object} [params] extra parameters specific to the exchange API endpoint (e.g. sportXeventId, page)
     * @returns {object[]} a list of [prediction order structures](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    override async fetchOpenOrders (outcome: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<PredictionOrder[]> {
        if (this.walletAddress === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOpenOrders() requires a walletAddress to identify the maker');
        }
        const request: Dict = { 'maker': this.walletAddress };
        let outcomeObj = undefined;
        if (outcome !== undefined) {
            await this.loadOutcome (outcome);
            outcomeObj = this.outcome (outcome);
            request['marketHashes'] = this.safeString (outcomeObj['info'], 'marketHash');
        }
        if (limit !== undefined) {
            request['perPage'] = limit;
        }
        const response = await this.sxbetPublicGetOrders (this.extend (request, params));
        const rawOrders = this.safeList (response, 'data', []);
        return this.parsePredictionOrders (rawOrders, outcomeObj, since, limit);
    }

    /**
     * @method
     * @name sxbet#fetchOrders
     * @description fetches the wallet's maker orders. sx.bet's GET /orders only serves RESTING (active) orders — filled/cancelled/expired orders leave the listing permanently (their history is only reconstructable from trades), so this returns the same set as fetchOpenOrders
     * @see https://docs.sx.bet/api-reference/get-orders
     * @param {string} [outcome] unified outcome or outcomeId — narrows to that outcome's market
     * @param {int} [since] not supported by the venue (order rows carry no timestamp)
     * @param {int} [limit] the maximum number of orders to return (server-side perPage, max 1000)
     * @param {object} [params] extra parameters specific to the exchange API endpoint (e.g. sportXeventId, page)
     * @returns {object[]} a list of [prediction order structures](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    override async fetchOrders (outcome: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<PredictionOrder[]> {
        return await this.fetchOpenOrders (outcome, since, limit, params);
    }

    /**
     * @method
     * @name sxbet#fetchOrder
     * @description fetches a single resting maker order by its order hash. throws OrderNotFound when the hash is no longer resting — sx.bet's GET /orders drops filled/cancelled/expired orders from the listing entirely
     * @see https://docs.sx.bet/api-reference/get-orders
     * @param {string} id the order hash
     * @param {string} [outcome] unified outcome or outcomeId (labelling hint only, the request needs just the id)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [prediction order structure](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    async fetchOrder (id: Str, outcome: Str = undefined, params = {}): Promise<PredictionOrder> {
        if (id === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder() requires an id argument');
        }
        let outcomeObj = undefined;
        if (outcome !== undefined) {
            await this.loadOutcome (outcome);
            outcomeObj = this.outcome (outcome);
        }
        const request: Dict = { 'orderHashes': id };
        const response = await this.sxbetPublicGetOrders (this.extend (request, params));
        const rawOrders = this.safeList (response, 'data', []);
        const rawOrdersLength = rawOrders.length;
        if (rawOrdersLength === 0) {
            throw new OrderNotFound (this.id + ' fetchOrder() could not find order ' + id + ' - it is not resting (filled, cancelled or expired orders leave the venue listing)');
        }
        return this.parsePredictionOrder (this.safeDict (rawOrders, 0, {}), outcomeObj);
    }

    /**
     * @ignore
     * @method
     * @name sxbet#tokenAmountDivider
     * @description resolves the raw-to-human divider for a base token amount — sx.bet denominates in USDC (6 decimals) or WSX (18 decimals); the token is recognised through the cached /metadata addresses, defaulting to USDC when the cache is cold
     * @param {string} baseToken the base token contract address
     * @returns {string} the power-of-ten divider as a string
     */
    tokenAmountDivider (baseToken: Str): string {
        const sxMetadata = this.safeDict (this.options, 'sxMetadata', {});
        const usdcAddress = this.safeStringLower (sxMetadata, 'usdcAddress', '');
        const baseTokenLower = (baseToken === undefined) ? '' : baseToken.toLowerCase ();
        if ((usdcAddress !== '') && (baseTokenLower !== usdcAddress)) {
            return '1000000000000000000'; // WSX, 18 decimals
        }
        return '1000000'; // USDC, 6 decimals
    }

    /**
     * @ignore
     * @method
     * @name sxbet#parsePredictionTrade
     * @description parses one raw GET /trades row into a unified trade. the row's bettingOutcomeOne selects the outcome the bettor backed, so every trade is a 'buy' of that outcome at the implied probability the bettor received
     * @param {object} trade the raw sx.bet trade object
     * @param {object} [market] the outcome object the trade belongs to (resolved from the cache by outcomeId when omitted)
     * @returns {object} a [prediction trade structure](https://docs.ccxt.com/#/?id=prediction-trade-structure)
     */
    override parsePredictionTrade (trade: Dict, market: Market = undefined): PredictionTrade {
        //
        //     {
        //         "baseToken": "0x6629Ce1Cf35Cc1329ebB4F63202F3f197b3F050B",
        //         "bettor": "0x713117eCdEfB29B919544C7502162423220fE78b",
        //         "stake": "5471240",
        //         "odds": "65000000000000000000",
        //         "orderHash": "0xa39a03729714170256eb0ea3c3c14b2985f7320d6fa75663edbca8c6d6e4dc83",
        //         "marketHash": "0x80f558d8535e4f1343e3dc0303ab6d32432c732607fc460fe910ef95845ba40d",
        //         "maker": false,
        //         "bettingOutcomeOne": false,
        //         "settled": true,
        //         "settleValue": 1,
        //         "fillHash": "0x8e55b9a69f8b2ff4b9816f59c772da765227df104833daad946cfe36d2873938",
        //         "tradeStatus": "SUCCESS",
        //         "betType": 1,
        //         "settleDate": "2026-03-13T00:25:57.472Z",
        //         "outcome": 1,
        //         "createdAt": "2026-03-12T23:18:47.931Z",
        //         "sportXeventId": "L18268159",
        //         "netReturn": "8.417292",
        //         "betTime": 1773357527
        //     }
        //
        const id = this.safeString (trade, 'fillHash');
        let timestamp = this.safeTimestamp (trade, 'betTime');
        if (timestamp === undefined) {
            timestamp = this.parse8601 (this.safeString (trade, 'createdAt'));
        }
        const marketHash = this.safeString (trade, 'marketHash', '');
        const bettingOutcomeOne = this.safeBool (trade, 'bettingOutcomeOne', true);
        const outcomeId = (bettingOutcomeOne) ? marketHash : (marketHash + '-2');
        const outcomeObj = this.safeOutcome (outcomeId, market as any);
        const oneDenom = '100000000000000000000';
        const odds = this.safeString (trade, 'odds');
        const price = (odds !== undefined) ? this.parseNumber (Precise.stringDiv (odds, oneDenom)) : undefined;
        const divider = this.tokenAmountDivider (this.safeString (trade, 'baseToken'));
        const stake = this.safeString (trade, 'stake', '0');
        const amount = this.parseNumber (Precise.stringDiv (stake, divider, 6));
        const isMaker = this.safeBool (trade, 'maker', false);
        return this.safePredictionTrade ({
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'outcome': this.safeString (outcomeObj, 'outcome'),
            'outcomeId': this.safeString (outcomeObj, 'outcomeId', outcomeId),
            'label': this.safeString (outcomeObj, 'label'),
            'market': this.safeString (outcomeObj, 'market'),
            'order': this.safeString (trade, 'orderHash'),
            'type': undefined,
            'side': 'buy',
            'takerOrMaker': (isMaker) ? 'maker' : 'taker',
            'price': price,
            'amount': amount,
            'cost': amount,
            'fee': undefined,
        }, market);
    }

    /**
     * @method
     * @name sxbet#fetchTrades
     * @description fetches the public trade tape of one outcome's market — every bettor's matched fills, successful ones only by default (pass params.tradeStatus to change). the venue requires the trades listing to be scoped, so the outcome argument is mandatory
     * @see https://docs.sx.bet/api-reference/get-trades
     * @param {string} outcome unified outcome or outcomeId
     * @param {int} [since] timestamp in ms of the earliest trade to fetch (server-side startDate)
     * @param {int} [limit] the maximum number of trades to return (server-side pageSize)
     * @param {object} [params] extra parameters specific to the exchange API endpoint (e.g. settled, tradeStatus, paginationKey)
     * @returns {object[]} a list of [prediction trade structures](https://docs.ccxt.com/#/?id=prediction-trade-structure)
     */
    override async fetchTrades (outcome: Str, since: Int = undefined, limit: Int = undefined, params = {}): Promise<PredictionTrade[]> {
        if (outcome === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchTrades() requires an outcome argument - the venue requires the trades listing to be scoped');
        }
        // warm the metadata cache so tokenAmountDivider can tell USDC from WSX amounts
        await this.loadSxMetadata ();
        await this.loadOutcome (outcome);
        const outcomeObj = this.outcome (outcome);
        const request: Dict = {
            'marketHashes': this.safeString (outcomeObj['info'], 'marketHash'),
            'tradeStatus': 'SUCCESS',
        };
        if (since !== undefined) {
            request['startDate'] = this.parseToInt (since / 1000);
        }
        if (limit !== undefined) {
            request['pageSize'] = limit;
        }
        const response = await this.sxbetPublicGetTrades (this.extend (request, params));
        const data = this.safeDict (response, 'data', {});
        const rawTrades = this.safeList (data, 'trades', []);
        return this.parsePredictionTrades (rawTrades, outcomeObj, since, limit);
    }

    /**
     * @method
     * @name sxbet#fetchMyTrades
     * @description fetches the wallet's trades (matched fills, both taker and maker legs) via GET /trades scoped by bettor — needs only walletAddress (the endpoint is public). settled trades embed the resolution (settled/settleValue/outcome) in the raw info
     * @see https://docs.sx.bet/api-reference/get-trades
     * @param {string} [outcome] unified outcome or outcomeId — narrows to that outcome's market and drops the opposite side's legs
     * @param {int} [since] timestamp in ms of the earliest trade to fetch (server-side startDate)
     * @param {int} [limit] the maximum number of trades to return (server-side pageSize)
     * @param {object} [params] extra parameters specific to the exchange API endpoint (e.g. settled, sportXeventId, tradeStatus, paginationKey)
     * @returns {object[]} a list of [prediction trade structures](https://docs.ccxt.com/#/?id=prediction-trade-structure)
     */
    override async fetchMyTrades (outcome: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<PredictionTrade[]> {
        if (this.walletAddress === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades() requires a walletAddress to identify the bettor');
        }
        // warm the metadata cache so tokenAmountDivider can tell USDC from WSX amounts
        await this.loadSxMetadata ();
        const request: Dict = { 'bettor': this.walletAddress };
        let outcomeObj = undefined;
        if (outcome !== undefined) {
            await this.loadOutcome (outcome);
            outcomeObj = this.outcome (outcome);
            request['marketHashes'] = this.safeString (outcomeObj['info'], 'marketHash');
        }
        if (since !== undefined) {
            request['startDate'] = this.parseToInt (since / 1000);
        }
        if (limit !== undefined) {
            request['pageSize'] = limit;
        }
        const response = await this.sxbetPublicGetTrades (this.extend (request, params));
        const data = this.safeDict (response, 'data', {});
        const rawTrades = this.safeList (data, 'trades', []);
        return this.parsePredictionTrades (rawTrades, outcomeObj, since, limit);
    }

    /**
     * @ignore
     * @method
     * @name sxbet#fetchRawBettorTrades
     * @description fetches the wallet's raw GET /trades rows scoped by bettor (shared by fetchPositions and fetchSettlements)
     * @param {string[]} [marketHashes] narrow to these market hashes (max 100)
     * @param {boolean} [settled] the server-side settled filter
     * @param {int} [since] timestamp in ms mapped to the server-side startDate
     * @param {int} [limit] the server-side pageSize
     * @param {object} [params] extra request params forwarded verbatim
     * @returns {object[]} the raw (unparsed) sx.bet trade objects
     */
    async fetchRawBettorTrades (marketHashes: Strings = undefined, settled: any = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<any[]> {
        if (this.walletAddress === undefined) {
            throw new ArgumentsRequired (this.id + ' requires a walletAddress to identify the bettor');
        }
        // warm the metadata cache so tokenAmountDivider can tell USDC from WSX amounts
        await this.loadSxMetadata ();
        const request: Dict = { 'bettor': this.walletAddress };
        if (marketHashes !== undefined) {
            request['marketHashes'] = marketHashes.join (',');
        }
        if (settled !== undefined) {
            request['settled'] = settled;
        }
        if (since !== undefined) {
            request['startDate'] = this.parseToInt (since / 1000);
        }
        if (limit !== undefined) {
            request['pageSize'] = limit;
        }
        const response = await this.sxbetPublicGetTrades (this.extend (request, params));
        const data = this.safeDict (response, 'data', {});
        return this.safeList (data, 'trades', []);
    }

    /**
     * @ignore
     * @method
     * @name sxbet#fetchExplorerTokenBalance
     * @description reads one token's raw wallet balance through the SX rollup block explorer API
     * @param {string} tokenAddress the token contract address
     * @param {object} [params] extra request params forwarded verbatim
     * @returns {string} the raw integer balance in token base units
     */
    async fetchExplorerTokenBalance (tokenAddress: Str, params = {}): Promise<Str> {
        const request: Dict = {
            'module': 'account',
            'action': 'tokenbalance',
            'contractaddress': tokenAddress,
            'address': this.walletAddress,
        };
        const response = await this.explorerPublicGetApi (this.extend (request, params));
        //
        //     { "message": "OK", "result": "1000000000", "status": "1" }
        //
        const status = this.safeString (response, 'status');
        if (status !== '1') {
            throw new ExchangeError (this.id + ' fetchBalance() explorer error: ' + this.json (response));
        }
        return this.safeString (response, 'result', '0');
    }

    /**
     * @method
     * @name sxbet#fetchBalance
     * @description fetches the wallet's USDC and WSX balances through the SX rollup block explorer — sx.bet itself has no balance endpoint. resting maker orders lock no funds (tokens only move when a fill settles on-chain), so the whole on-chain balance is reported free
     * @see https://docs.sx.bet/developers/testnet-and-mainnet
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)
     */
    override async fetchBalance (params = {}): Promise<Balances> {
        if (this.walletAddress === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchBalance() requires a walletAddress');
        }
        const sxMetadata = await this.loadSxMetadata ();
        const usdcAddress = this.safeString (sxMetadata, 'usdcAddress', '');
        const wsxAddress = this.safeString (sxMetadata, 'wsxAddress');
        const usdcRaw = await this.fetchExplorerTokenBalance (usdcAddress, params);
        const result: Dict = { 'info': { 'USDC': usdcRaw }};
        const usdcTotal = this.parseNumber (Precise.stringDiv (usdcRaw, '1000000', 6));
        result['USDC'] = { 'free': usdcTotal, 'used': 0, 'total': usdcTotal };
        if (wsxAddress !== undefined) {
            const wsxRaw = await this.fetchExplorerTokenBalance (wsxAddress, params);
            const wsxTotal = this.parseNumber (Precise.stringDiv (wsxRaw, '1000000000000000000', 8));
            result['WSX'] = { 'free': wsxTotal, 'used': 0, 'total': wsxTotal };
            result['info'] = { 'USDC': usdcRaw, 'WSX': wsxRaw };
        }
        return this.safeBalance (result) as Balances;
    }

    /**
     * @method
     * @name sxbet#fetchPositions
     * @description builds the wallet's open positions by aggregating its unsettled successful trades per outcome — sx.bet has no dedicated positions endpoint, a position is the sum of live bets on one side of a market. contracts is the total potential payout (stake / odds summed over the trades, i.e. the USDC received if the outcome wins), entryPrice is the stake-weighted average implied probability, and collateral/notional is the total stake at risk
     * @see https://docs.sx.bet/api-reference/get-trades
     * @param {string[]} [outcomes] filter by unified outcomes or outcomeIds
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [prediction position structures](https://docs.ccxt.com/#/?id=prediction-position-structure)
     */
    override async fetchPositions (outcomes: Strings = undefined, params = {}): Promise<PredictionPosition[]> {
        // copy to a plain list so the transpilers and the strict null checks see one shape
        const outcomesList: string[] = (outcomes === undefined) ? [] : outcomes;
        const outcomesLength = outcomesList.length;
        let marketHashes: Strings = undefined;
        if (outcomesLength > 0) {
            await this.loadOutcomes (outcomesList);
            marketHashes = [];
            for (let i = 0; i < outcomesLength; i++) {
                const outcomeObj = this.outcome (outcomesList[i]);
                marketHashes.push (this.safeString (outcomeObj['info'], 'marketHash', ''));
            }
        }
        const rawTrades = await this.fetchRawBettorTrades (marketHashes, false, undefined, undefined, this.extend ({ 'tradeStatus': 'SUCCESS' }, params));
        // aggregate per outcomeId: stakes sum to the collateral at risk, stake / odds sums to the
        // potential payout, and the stake-weighted implied probability becomes the entry price
        const totals: Dict = {};
        const order: string[] = [];
        const oneDenom = '100000000000000000000';
        const rawTradesLength = rawTrades.length;
        for (let i = 0; i < rawTradesLength; i++) {
            const trade = rawTrades[i];
            const marketHash = this.safeString (trade, 'marketHash', '');
            const bettingOutcomeOne = this.safeBool (trade, 'bettingOutcomeOne', true);
            const outcomeId = (bettingOutcomeOne) ? marketHash : (marketHash + '-2');
            const divider = this.tokenAmountDivider (this.safeString (trade, 'baseToken'));
            const stake = Precise.stringDiv (this.safeString (trade, 'stake', '0'), divider, 6);
            const odds = Precise.stringDiv (this.safeString (trade, 'odds', '0'), oneDenom, 10);
            if (Precise.stringLe (odds, '0')) {
                continue;
            }
            if (!(outcomeId in totals)) {
                totals[outcomeId] = { 'stake': '0', 'payout': '0', 'timestamp': undefined, 'lastTrade': trade };
                order.push (outcomeId);
            }
            const entry = totals[outcomeId];
            entry['stake'] = Precise.stringAdd (entry['stake'], stake);
            entry['payout'] = Precise.stringAdd (entry['payout'], Precise.stringDiv (stake, odds, 6));
            const tradeTimestamp = this.safeTimestamp (trade, 'betTime');
            const entryTimestamp = this.safeInteger (entry, 'timestamp');
            if ((tradeTimestamp !== undefined) && ((entryTimestamp === undefined) || (tradeTimestamp > entryTimestamp))) {
                entry['timestamp'] = tradeTimestamp;
                entry['lastTrade'] = trade;
            }
            totals[outcomeId] = entry;
        }
        const result: PredictionPosition[] = [];
        const orderLength = order.length;
        for (let i = 0; i < orderLength; i++) {
            const outcomeId = order[i];
            const entry = totals[outcomeId];
            const outcomeObj = this.safeOutcome (outcomeId);
            const stakeTotal = this.safeString (entry, 'stake', '0');
            const payoutTotal = this.safeString (entry, 'payout', '0');
            // hoist the condition to a bare local — a call inside the ternary condition mangles
            // in the regex transpiler
            const hasPayout = Precise.stringGt (payoutTotal, '0');
            const entryPrice = (hasPayout) ? Precise.stringDiv (stakeTotal, payoutTotal, 6) : undefined;
            const timestamp = this.safeInteger (entry, 'timestamp');
            result.push ({
                'id': outcomeId,
                'info': this.safeDict (entry, 'lastTrade', {}),
                'timestamp': timestamp,
                'datetime': this.iso8601 (timestamp),
                'contracts': this.parseNumber (payoutTotal),
                'contractSize': 1,
                'side': 'long',
                'notional': this.parseNumber (stakeTotal),
                'unrealizedPnl': undefined,
                'realizedPnl': undefined,
                'collateral': this.parseNumber (stakeTotal),
                'entryPrice': this.parseNumber (entryPrice),
                'markPrice': undefined,
                'lastPrice': undefined,
                'percentage': undefined,
                'outcome': this.safeString (outcomeObj, 'outcome', outcomeId),
                'outcomeId': this.safeString (outcomeObj, 'outcomeId', outcomeId),
                'label': this.safeString (outcomeObj, 'label'),
                'market': this.safeString (outcomeObj, 'market'),
                'event': undefined,
            } as unknown as PredictionPosition);
        }
        if (outcomesLength === 0) {
            return result;
        }
        // the server-side marketHashes filter covers both sides of each market — drop the legs
        // the caller did not ask for
        const wantedIds: Dict = {};
        for (let i = 0; i < outcomesLength; i++) {
            const outcomeObj = this.outcome (outcomesList[i]);
            wantedIds[this.safeString (outcomeObj, 'outcomeId', '')] = true;
        }
        const filtered: PredictionPosition[] = [];
        const resultLength = result.length;
        for (let i = 0; i < resultLength; i++) {
            const position = result[i];
            // hoist the key to a bare local — a call on the left of `in` breaks the php transpiler
            const positionOutcomeId = this.safeString (position, 'outcomeId', '');
            if (positionOutcomeId in wantedIds) {
                filtered.push (position);
            }
        }
        return filtered;
    }

    /**
     * @method
     * @name sxbet#fetchSettlements
     * @description fetches the wallet's settled bets — each settled GET /trades row becomes one settlement with the resolved winner, the payout (stake / odds when won, the stake back when the market voided, zero when lost) and the realized pnl
     * @see https://docs.sx.bet/api-reference/get-trades
     * @param {string} [outcome] filter to a single unified outcome or outcomeId
     * @param {int} [since] timestamp in ms of the earliest settlement to fetch (server-side startDate on the bet time)
     * @param {int} [limit] the maximum number of settlements to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of prediction settlement structures
     */
    override async fetchSettlements (outcome: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<PredictionSettlement[]> {
        let marketHashes: Strings = undefined;
        let wantedOutcomeId: Str = undefined;
        if (outcome !== undefined) {
            await this.loadOutcome (outcome);
            const outcomeObj = this.outcome (outcome);
            marketHashes = [ this.safeString (outcomeObj['info'], 'marketHash', '') ];
            wantedOutcomeId = this.safeString (outcomeObj, 'outcomeId');
        }
        const rawTrades = await this.fetchRawBettorTrades (marketHashes, true, since, limit, params);
        const result: any[] = [];
        const rawTradesLength = rawTrades.length;
        for (let i = 0; i < rawTradesLength; i++) {
            const settlement = this.parseSettlement (rawTrades[i]);
            if ((wantedOutcomeId === undefined) || (this.safeString (settlement, 'outcomeId') === wantedOutcomeId)) {
                result.push (settlement);
            }
        }
        return this.filterBySinceLimit (result, since, limit, 'timestamp') as PredictionSettlement[];
    }

    /**
     * @ignore
     * @method
     * @name sxbet#parseSettlement
     * @description parses one settled GET /trades row into the unified prediction settlement shape. the raw `outcome` field carries the winner as 1 or 2 with 0 for a voided market, and the full payout of a winning bet is stake / odds (the implied probability the bettor received)
     * @param {object} settlement the raw settled sx.bet trade
     * @param {object} [market] a resolved outcome/market hint
     * @returns {object} a prediction settlement structure
     */
    parseSettlement (settlement: Dict, market: Market = undefined): any {
        const marketHash = this.safeString (settlement, 'marketHash', '');
        const bettingOutcomeOne = this.safeBool (settlement, 'bettingOutcomeOne', true);
        const outcomeId = (bettingOutcomeOne) ? marketHash : (marketHash + '-2');
        const outcomeObj = this.safeOutcome (outcomeId, market as any);
        const winner = this.safeInteger (settlement, 'outcome');
        const isVoid = (winner === 0);
        const heldNumber = (bettingOutcomeOne) ? 1 : 2;
        let won: any = undefined;
        if ((winner !== undefined) && !isVoid) {
            won = (winner === heldNumber);
        }
        const divider = this.tokenAmountDivider (this.safeString (settlement, 'baseToken'));
        const stake = Precise.stringDiv (this.safeString (settlement, 'stake', '0'), divider, 6);
        const oneDenom = '100000000000000000000';
        const odds = Precise.stringDiv (this.safeString (settlement, 'odds', '0'), oneDenom, 10);
        // a winning bet returns its full stake / odds, a voided market refunds the stake
        let payout: Str = '0';
        if (isVoid) {
            payout = stake;
        } else if (won === true) {
            // hoist the condition to a bare local — see the fetchPositions comment
            const hasOdds = Precise.stringGt (odds, '0');
            payout = (hasOdds) ? Precise.stringDiv (stake, odds, 6) : stake;
        }
        const pnl = Precise.stringSub (payout, stake);
        // resolve the winning side's human label through the cached market when available
        let resultLabel: Str = undefined;
        if (isVoid) {
            resultLabel = 'VOID';
        } else if (winner !== undefined) {
            const info = this.safeDict (outcomeObj, 'info', {});
            const labelKey = (winner === 1) ? 'outcomeOneName' : 'outcomeTwoName';
            resultLabel = this.safeString (info, labelKey, this.numberToString (winner));
        }
        const timestamp = this.parse8601 (this.safeString (settlement, 'settleDate'));
        let settlePrice: Num = undefined;
        if (won !== undefined) {
            settlePrice = (won) ? 1 : 0;
        }
        return {
            'info': settlement,
            'id': this.safeString (settlement, 'fillHash'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'outcome': this.safeString (outcomeObj, 'outcome', outcomeId),
            'outcomeId': this.safeString (outcomeObj, 'outcomeId', outcomeId),
            'market': this.safeString (outcomeObj, 'market'),
            'event': undefined,
            'result': resultLabel,
            'won': won,
            'amount': this.parseNumber (stake),
            'price': settlePrice,
            'cost': this.parseNumber (stake),
            'payout': this.parseNumber (payout),
            'pnl': this.parseNumber (pnl),
        };
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
    override async fetchTicker (outcome: Str, params = {}): Promise<PredictionTicker> {
        await this.loadOutcome (outcome);
        const outcomeObj = this.outcome (outcome);
        const marketHash = this.safeString (outcomeObj['info'], 'marketHash');
        const sxMetadata = await this.loadSxMetadata ();
        const usdcAddress = this.safeString (sxMetadata, 'usdcAddress', '');
        const request: Dict = { 'marketHashes': marketHash, 'baseToken': usdcAddress };
        const response = await this.sxbetPublicGetOrdersOddsBest (this.extend (request, params));
        const result = this.safeDict (response, 'data', {});
        const bestOddsList = this.safeList (result, 'bestOdds', []);
        const raw = this.safeDict (bestOddsList, 0, {});
        return this.parsePredictionTicker (raw, outcomeObj as any);
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
    override async fetchTickers (outcomes: Strings = undefined, params = {}): Promise<PredictionTickers> {
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
        const sxMetadata = await this.loadSxMetadata ();
        const usdcAddress = this.safeString (sxMetadata, 'usdcAddress', '');
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
                    const ticker = this.parsePredictionTicker (raw, grouped[j]);
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
     * @name sxbet#parsePredictionTicker
     * @description parses one /orders/odds/best entry into a unified ticker for one side of the market
     * @param {object} raw one bestOdds entry ({ marketHash, baseToken, outcomeOne: { percentageOdds, updatedAt }, outcomeTwo: {...} })
     * @param {object} [market] the outcome object the ticker belongs to
     * @returns {object} a [prediction ticker structure](https://docs.ccxt.com/#/?id=prediction-ticker-structure)
     */
    override parsePredictionTicker (raw: Dict, market: Market = undefined): PredictionTicker {
        //
        //     {
        //         "marketHash": "0x48ce0ef287c59fb3bb3ca6deb80de0d5791eb761ea8e16d6f03c8e93ef28d1de",
        //         "baseToken": "0x6629Ce1Cf35Cc1329ebB4F63202F3f197b3F050B",
        //         "outcomeOne": { "percentageOdds": "50250000000000000000", "updatedAt": 1785697831141 },
        //         "outcomeTwo": { "percentageOdds": "48000000000000000000", "updatedAt": 1785699649869 }
        //     }
        //
        const marketAny = market as any;
        const outcomeObj = this.safeOutcome (this.safeString (marketAny, 'outcome'), marketAny);
        const outcomeId = this.safeString (outcomeObj, 'outcomeId');
        const marketHash = this.safeString (raw, 'marketHash');
        const isOutcomeOne = (outcomeId === marketHash);
        const outcomeOneOdds = this.safeDict (raw, 'outcomeOne', {});
        const outcomeTwoOdds = this.safeDict (raw, 'outcomeTwo', {});
        const ownOdds = (isOutcomeOne) ? outcomeOneOdds : outcomeTwoOdds;
        const oppositeOdds = (isOutcomeOne) ? outcomeTwoOdds : outcomeOneOdds;
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
        let average: Num = undefined;
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
    override async fetchOrderBook (outcome: Str, limit: Int = undefined, params = {}): Promise<PredictionOrderBook> {
        await this.loadOutcome (outcome);
        const outcomeObj = this.outcome (outcome);
        const marketHash = this.safeString (outcomeObj['info'], 'marketHash');
        const outcomeId = this.safeString (outcomeObj, 'outcomeId');
        const isOutcomeOne = (outcomeId === marketHash);
        const sxMetadata = await this.loadSxMetadata ();
        const usdcAddress = this.safeString (sxMetadata, 'usdcAddress', '');
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

    override handleErrors (code: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any) {
        // sx.bet returns { "error": "Bad Request", "message": <code or [strings]>, "statusCode": 4xx };
        // map the known codes to ccxt errors so callers can distinguish a rejected order or a
        // validation problem from a transport outage (the base otherwise maps a bare 4xx to the
        // exchange-not-available error). unmapped codes fall through to the base http-status handling
        if (!response) {
            return undefined;
        }
        const message = this.safeValue (response, 'message');
        if (message === undefined) {
            return undefined;
        }
        // validation failures arrive as an array of strings, business errors as a single code string
        let messageString = undefined;
        if (Array.isArray (message)) {
            messageString = message.join (', ');
        } else {
            messageString = message;
        }
        const feedback = this.id + ' ' + body;
        this.throwExactlyMatchedException (this.exceptions['exact'], messageString, feedback);
        this.throwBroadlyMatchedException (this.exceptions['broad'], messageString, feedback);
        // a 400 is a client-side bad request (bad params, invalid order), not a transport outage —
        // throw BadRequest instead of letting the base map the bare 400 to a retryable network-unavailable error
        if (code === 400) {
            throw new BadRequest (feedback);
        }
        return undefined;
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
    override sign (path: any, api: any = 'sxbet', method = 'GET', params = {}, headers: any = undefined, body: any = undefined) {
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
