import { keccak_256 as keccak } from '@noble/hashes/sha3.js';
import { secp256k1 } from '@noble/curves/secp256k1.js';
import Exchange from '../abstract/prediction/insightx.js';
import { ArgumentsRequired, AuthenticationError, BadSymbol, ExchangeError, InsufficientFunds, InvalidOrder, NotSupported, OrderNotFound, PermissionDenied } from '../base/errors.js';
import { Precise } from '../base/Precise.js';
import { ecdsa } from '../base/functions/crypto.js';
import type { Bool, Dict, Int, Market, Num, PredictionEvent, PredictionOrder, PredictionPosition, PredictionTicker, Str, fetchEventsParams, int } from '../base/types.js';

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
                'cancelOrder': true,
                'createOrder': true,
                'fetchCanceledOrders': true,
                'fetchClosedOrders': true,
                'fetchEvent': false,
                'fetchEvents': true,
                'fetchMarkets': true,
                'fetchOpenOrders': true,
                'fetchOrders': true,
                'fetchOutcome': true,
                'fetchPosition': true,
                'fetchTicker': true,
                'fetchTickers': false,
                'prediction': true,
                'signIn': true,
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
                    '1006': AuthenticationError, // Authorization Error
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
                    '9001': InvalidOrder, // Invalid Order ID
                },
                'broad': {},
            },
            'options': {
                'defaultNetwork': 'mantle_mainnet',
                'chainId': 5000,
                'rpcUrl': 'https://rpc.mantle.xyz',
                'tradingContract': '0xD22A5FFdb71221B7b2F081e2679C8A0149d58BE9',
                'defaultMarketStatus': 1,
                'marketsPageSize': 100,
                'maxFetchMarketsLimit': 100,
                'tokenExpires': undefined,
            },
        });
    }

    /**
     * @method
     * @name insightx#signIn
     * @description obtains and caches an insightx JWT by signing the wallet login message
     * @see https://insightx-2.gitbook.io/whitepaper/insightx-whitepaper/10.-developer-resources-and-api-integration#id-10.5-authentication
     * @param {object} [params] extra exchange-specific parameters
     * @param {boolean} [params.reload] force a new JWT even when a cached token is available
     * @param {string} [params.network] insightx network name, defaults to mantle_mainnet
     * @param {string} [params.address] wallet address, derived from privateKey when omitted
     * @param {string} [params.tipInfo] pre-fetched login message, normally fetched automatically
     * @param {string} [params.signature] externally produced personal_sign signature, normally generated from privateKey
     * @returns {string} the JWT used by private insightx endpoints
     */
    override async signIn (params = {}): Promise<string> {
        const reload = this.safeBool (params, 'reload', false);
        const now = this.milliseconds ();
        const tokenExpires = this.safeInteger (this.options, 'tokenExpires');
        const hasValidToken = (this.token !== undefined) && (this.token.length > 0) && ((tokenExpires === undefined) || (now < tokenExpires));
        if (hasValidToken && !reload) {
            return this.token as string;
        }
        const network = this.safeString (params, 'network', this.safeString (this.options, 'defaultNetwork', 'mantle_mainnet'));
        let address = this.safeString (params, 'address', this.walletAddress);
        if ((address === undefined) && !this.isEmptyString (this.privateKey)) {
            address = this.ethGetAddressFromPrivateKey (this.privateKey);
        }
        if (address === undefined) {
            throw new AuthenticationError (this.id + ' signIn() requires a privateKey or params.address with params.signature');
        }
        let tipInfo = this.safeString (params, 'tipInfo');
        if (tipInfo === undefined) {
            const tipResponse = await this.insightxPublicGetWalletTipInfo ({
                'network': network,
                'address': address,
            });
            const tipData = this.safeDict (tipResponse, 'data', {});
            tipInfo = this.safeString (tipData, 'tip_info');
        }
        if (tipInfo === undefined) {
            throw new AuthenticationError (this.id + ' signIn() failed to receive the wallet login message');
        }
        let signature = this.safeString (params, 'signature');
        if (signature === undefined) {
            if (this.isEmptyString (this.privateKey)) {
                throw new AuthenticationError (this.id + ' signIn() requires params.signature when privateKey is not configured');
            }
            signature = this.signWalletMessage (tipInfo, this.privateKey);
        }
        const request: Dict = {
            'network': network,
            'address': address,
            'signature': signature,
        };
        const rest = this.omit (params, [ 'reload', 'network', 'address', 'tipInfo', 'signature' ]);
        const response = await this.insightxPublicPostWalletConnect (this.extend (request, rest));
        const data = this.safeDict (response, 'data', {});
        const token = this.safeString (data, 'token');
        if (token === undefined) {
            throw new AuthenticationError (this.id + ' signIn() failed to receive a JWT token');
        }
        this.token = token;
        const expiresIn = this.safeInteger (data, 'expires_in');
        if (expiresIn !== undefined) {
            const expiresInString = this.numberToString (expiresIn);
            const expiresInMillisecondsString = Precise.stringMul (expiresInString, '1000');
            const expiresInMilliseconds = this.parseToInt (expiresInMillisecondsString);
            this.options['tokenExpires'] = this.sum (now, expiresInMilliseconds);
        } else {
            this.options['tokenExpires'] = this.parseJwtExpiration (token);
        }
        return token;
    }

    /**
     * @ignore
     * @method
     * @name insightx#parseJwtExpiration
     * @description extracts the expiration timestamp from an insightx JWT
     * @param {string} token insightx JWT
     * @returns {int} the expiration timestamp in milliseconds
     */
    parseJwtExpiration (token: string): Int {
        const parts = token.split ('.');
        const payloadPart = this.safeString (parts, 1);
        const signaturePart = this.safeString (parts, 2);
        if ((payloadPart === undefined) || (signaturePart === undefined)) {
            return undefined;
        }
        let payload = payloadPart;
        payload = payload.replaceAll ('-', '+');
        payload = payload.replaceAll ('_', '/');
        const payloadLength = this.binaryLength (this.encode (payload));
        const remainder = this.numberToString (payloadLength % 4);
        if (remainder === '2') {
            payload = payload + '==';
        } else if (remainder === '3') {
            payload = payload + '=';
        } else if (remainder === '1') {
            return undefined;
        }
        const decoded = this.parseJson (this.base64ToString (payload));
        const expires = this.safeInteger (decoded, 'exp');
        if (expires === undefined) {
            return undefined;
        }
        const expiresString = this.numberToString (expires);
        const expiresMillisecondsString = Precise.stringMul (expiresString, '1000');
        return this.parseToInt (expiresMillisecondsString);
    }

    /**
     * @ignore
     * @method
     * @name insightx#hashWalletMessage
     * @description hashes an insightx wallet login message using the EIP-191 personal_sign prefix
     * @param {string} message wallet login message
     * @returns {string} the keccak256 message hash
     */
    hashWalletMessage (message: string): string {
        const binaryMessage = this.encode (message);
        const binaryMessageLength = this.binaryLength (binaryMessage);
        const x19 = this.base16ToBinary ('19');
        const newline = this.base16ToBinary ('0a');
        const prefix = this.binaryConcat (x19, this.encode ('Ethereum Signed Message:'), newline, this.encode (this.numberToString (binaryMessageLength)));
        return '0x' + this.hash (this.binaryConcat (prefix, binaryMessage), keccak, 'hex');
    }

    /**
     * @ignore
     * @method
     * @name insightx#signWalletMessage
     * @description signs an insightx wallet login message with an EVM private key
     * @param {string} message wallet login message
     * @param {string} privateKey EVM private key
     * @returns {string} a 65-byte personal_sign signature
     */
    signWalletMessage (message: string, privateKey: string): string {
        const messageHash = this.hashWalletMessage (message);
        const signature = ecdsa (messageHash.slice (-64), privateKey.slice (-64), secp256k1, undefined);
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
     * @name insightx#handleToken
     * @description returns a valid cached JWT or obtains a new one through wallet login
     * @param {object} [params] extra parameters forwarded to signIn
     * @returns {string} a valid insightx JWT
     */
    async handleToken (params = {}): Promise<string> {
        const token = await this.signIn (params);
        return token as string;
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
     * @param {int} [params.marketStatus] raw insightx market status, defaults to 1 (active)
     * @returns {object[]} a list of raw insightx market objects
     */
    async fetchRawMarkets (params = {}): Promise<Dict[]> {
        const maxMarkets = this.safeInteger (params, 'marketLimit', this.safeInteger (this.options, 'maxFetchMarketsLimit', 100));
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
        const rest = this.omit (params, [ 'query', 'queries', 'searchIn', 'sort', 'tags', 'eventId', 'slug', 'limit', 'marketLimit', 'eventLimit', 'page', 'size', 'status', 'marketStatus' ]);
        const result: Dict[] = [];
        let collectedEvents = 0;
        for (let statusIndex = 0; statusIndex < statusesLength; statusIndex++) {
            let page = initialPage;
            while (true) {
                const request: Dict = {
                    'page': page,
                    'size': pageSize,
                    'status': statuses[statusIndex],
                };
                const response = await this.insightxPublicGetPredictV2Markets (this.extend (request, rest));
                const data = this.safeDict (response, 'data', {});
                const total = this.safeInteger (data, 'total', 0);
                const markets = this.safeList (data, 'list', []);
                const marketsLength = markets.length;
                for (let i = 0; i < marketsLength; i++) {
                    result.push (markets[i]);
                }
                collectedEvents = this.sum (collectedEvents, marketsLength);
                if ((collectedEvents > total) || (marketsLength === 0) || (collectedEvents >= maxMarkets)) {
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
            const rawMarket = await this.fetchRawMarket (marketId);
            const parsedMarket = this.parseMarket (rawMarket);
            if (this.markets === undefined) {
                this.markets = this.createSafeDictionary ();
            }
            if (parsedMarket === undefined) {
                throw new ExchangeError (this.id + ' fetchOutcome() could not resolve parsed');
            }
            this.markets[(parsedMarket as Dict)['market']] = parsedMarket;
            this.indexMarketOutcomes (parsedMarket);
            return this.outcome (outcomeSymbol);
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
        const outcomeObj = await this.loadOutcome (outcome);
        const marketId = this.safeString (outcomeObj, 'marketId');
        if (marketId === undefined) {
            throw new BadSymbol (this.id + ' fetchTicker() could not resolve the parent market for ' + outcome);
        }
        const response = await this.fetchRawMarket (marketId, params);
        //
        // {
        //     "errno": 0,
        //     "errmsg": "no error",
        //     "data": {
        //         "id": 80436029,
        //         "event_id": 6194354,
        //         "title": "Will Bitcoin reach $80,000 in August?",
        //         "description": "...",
        //         "rules": "",
        //         "banner": "...",
        //         "image_url": "...",
        //         "outcome0_name": "Yes",
        //         "outcome1_name": "No",
        //         "outcome_prices": "[0.42,0.58]",
        //         "end_time": 1788235200,
        //         "settle_time": 0,
        //         "winner_idx": 0,
        //         "status": 1,
        //         "total_volume": 151,
        //         "total_volume0": 0,
        //         "total_volume1": 0,
        //         "category": "",
        //         "tags": "",
        //         "source": "polymarket",
        //         "creator_uid": 0,
        //         "created_at": 1787934064,
        //         "updated_at": 1787936943,
        //         "identifier": "will-bitcoin-reach-80k-in-august-2026-from-august-28",
        //         "source_market_id": "3953844",
        //         "group_item_title": "↑ 80,000",
        //         "poly_clob_token_ids": "56164455570252326223230108705520239369498485700090339884257384687834000075314,4637795543195949251552327206874787994351587830091699916381347808615298403497"
        //     }
        // }
        //
        return this.parsePredictionTicker (response, outcomeObj);
    }

    /**
     * @method
     * @name insightx#fetchPosition
     * @description fetches the authenticated user's position for one insightx outcome
     * @see https://insightx-2.gitbook.io/whitepaper/insightx-whitepaper/10.-developer-resources-and-api-integration#get-position
     * @param {string} outcome unified outcome handle or raw outcome id in marketId:outcomeIndex format
     * @param {object} [params] extra exchange-specific parameters
     * @returns {object} a [prediction position structure](https://docs.ccxt.com/#/?id=prediction-position-structure)
     */
    override async fetchPosition (outcome: string, params = {}): Promise<PredictionPosition> {
        await this.handleToken ();
        const outcomeObj = await this.loadOutcome (outcome);
        const marketId = this.safeString (outcomeObj, 'marketId');
        const outcomeInfo = this.safeDict (outcomeObj, 'info', {});
        const outcomeIndex = this.safeInteger (outcomeInfo, 'outcome_idx');
        if ((marketId === undefined) || (outcomeIndex === undefined)) {
            throw new BadSymbol (this.id + ' fetchPosition() could not resolve the market id and outcome index for ' + outcome);
        }
        const request: Dict = {
            'market_id': marketId,
            'outcome_idx': outcomeIndex,
        };
        const rest = this.omit (params, [ 'market_id', 'outcome_idx' ]);
        const response = await this.insightxPrivateGetPredictV2Position (this.extend (request, rest));
        const positionData = this.safeDict (response, 'data');
        const contracts = this.safeNumber (positionData, 'volume');
        if ((positionData === undefined) || (contracts === undefined) || (contracts <= 0)) {
            const positions: PredictionPosition[] = [];
            return this.safeDict (positions, 0) as PredictionPosition;
        }
        return this.parsePredictionPosition (positionData, outcomeObj);
    }

    /**
     * @method
     * @name insightx#fetchOrders
     * @description fetches the authenticated user's orders, optionally filtered by one insightx outcome
     * @see https://insightx-2.gitbook.io/whitepaper/insightx-whitepaper/10.-developer-resources-and-api-integration#get-orders
     * @param {string} [outcome] unified outcome handle or raw outcome id in marketId:outcomeIndex format
     * @param {int} [since] timestamp in ms of the earliest order to fetch
     * @param {int} [limit] the maximum number of orders to fetch
     * @param {object} [params] extra exchange-specific parameters
     * @param {boolean} [params.paginate] *spot only* default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @param {string} [params.status] raw order status filter, 'pending', 'partially_filled', 'filled', 'cancelled' or 'expired'
     * @returns {object[]} a list of [prediction order structures](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    override async fetchOrders (outcome: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<PredictionOrder[]> {
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchOrders', 'paginate');
        let maxEntriesPerRequest = undefined;
        [ maxEntriesPerRequest, params ] = this.handleOptionAndParams (params, 'fetchOrders', 'maxEntriesPerRequest', 100);
        const pageKey = 'ccxtPageKey';
        if (paginate) {
            return await this.fetchPaginatedCallIncremental ('fetchOrders', outcome, since, limit, params, pageKey, maxEntriesPerRequest) as PredictionOrder[];
        }
        const page = this.safeInteger2 (params, pageKey, 'page', 1);
        let pageSize = this.safeInteger (params, 'size');
        if ((limit !== undefined) && ((pageSize === undefined) || (pageSize < limit))) {
            pageSize = limit;
        }
        const request: Dict = {
            'page': page,
            'size': pageSize,
        };
        await this.handleToken ();
        let outcomeObj: any = undefined;
        if (outcome !== undefined) {
            outcomeObj = await this.loadOutcome (outcome);
            const marketId = this.safeString (outcomeObj, 'marketId');
            if (marketId === undefined) {
                throw new BadSymbol (this.id + ' fetchOrders() could not resolve the parent market for ' + outcome);
            }
            request['market_id'] = marketId;
        }
        const rest = this.omit (params, [ 'market_id', 'outcome_idx', 'page', 'size', pageKey ]);
        const response = await this.insightxPrivateGetPredictV2Orders (this.extend (request, rest));
        //
        // {
        //     "errno": 0,
        //     "errmsg": "no error",
        //     "data": {
        //         "list": [
        //             {
        //                 "id": 820700,
        //                 "market_id": 80436029,
        //                 "outcome_idx": 1,
        //                 "side": "buy",
        //                 "type": "limit",
        //                 "price": 0.2,
        //                 "amount": 1,
        //                 "filled_amount": 0,
        //                 "remaining_amt": 1,
        //                 "uid": 6353,
        //                 "status": "pending",
        //                 "created_at": 1786666977,
        //                 "updated_at": 1786666977
        //             }
        //         ],
        //         "count": 0
        //     }
        // }
        //
        const data = this.safeDict (response, 'data', {});
        const orders = this.safeList (data, 'list', []);
        const parsedOrders = this.parsePredictionOrders (orders, outcomeObj, since);
        return this.filterByOutcomeSinceLimit (parsedOrders, outcome, since, limit) as PredictionOrder[];
    }

    /**
     * @ignore
     * @method
     * @name insightx#fetchOrdersByStatuses
     * @description fetches and merges insightx orders for several mutually exclusive native statuses
     * @param {string} [outcome] unified outcome handle or raw outcome id in marketId:outcomeIndex format
     * @param {int} [since] timestamp in ms of the earliest order to fetch
     * @param {int} [limit] the maximum number of orders to return
     * @param {string[]} statuses native insightx order statuses to fetch
     * @param {object} [params] extra exchange-specific parameters
     * @returns {object[]} a list of [prediction order structures](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    async fetchOrdersByStatuses (outcome: Str, since: Int, limit: Int, statuses: string[], params = {}): Promise<PredictionOrder[]> {
        const rest = this.omit (params, [ 'status' ]);
        let result: PredictionOrder[] = [];
        for (let i = 0; i < statuses.length; i++) {
            const statusParams = this.extend ({ 'status': statuses[i] }, rest);
            const orders = await this.fetchOrders (outcome, since, limit, statusParams);
            result = this.arrayConcat (result, orders);
        }
        const indexed = this.indexBy (result, 'id');
        result = this.toArray (indexed) as PredictionOrder[];
        result = this.sortBy (result, 'timestamp');
        return result;
    }

    /**
     * @method
     * @name insightx#fetchOpenOrders
     * @description fetches the authenticated user's pending and partially filled orders
     * @see https://insightx-2.gitbook.io/whitepaper/insightx-whitepaper/10.-developer-resources-and-api-integration#get-orders
     * @param {string} [outcome] unified outcome handle or raw outcome id in marketId:outcomeIndex format
     * @param {int} [since] timestamp in ms of the earliest order to fetch
     * @param {int} [limit] the maximum number of open orders to return after status filtering
     * @param {object} [params] extra exchange-specific parameters
     * @param {int} [params.page] page number to fetch, defaults to 1
     * @param {int} [params.size] number of orders to request before status filtering
     * @param {string} [params.status] not used by insightx.fetchOpenOrders
     * @returns {object[]} a list of [prediction order structures](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    override async fetchOpenOrders (outcome: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<PredictionOrder[]> {
        const orders = await this.fetchOrdersByStatuses (outcome, since, limit, [ 'pending', 'partially_filled' ], params);
        const result: PredictionOrder[] = [];
        for (let i = 0; i < orders.length; i++) {
            const order = orders[i];
            if (this.safeString (order, 'status') === 'open') {
                result.push (order);
            }
        }
        return this.filterBySinceLimit (result, since, limit, 'timestamp') as PredictionOrder[];
    }

    /**
     * @method
     * @name insightx#fetchClosedOrders
     * @description fetches the authenticated user's filled orders
     * @see https://insightx-2.gitbook.io/whitepaper/insightx-whitepaper/10.-developer-resources-and-api-integration#get-orders
     * @param {string} [outcome] unified outcome handle or raw outcome id in marketId:outcomeIndex format
     * @param {int} [since] timestamp in ms of the earliest order to fetch
     * @param {int} [limit] the maximum number of closed orders to return after status filtering
     * @param {object} [params] extra exchange-specific parameters
     * @param {int} [params.page] page number to fetch, defaults to 1
     * @param {int} [params.size] number of orders to request before status filtering
     * @param {string} [params.status] not used by insightx.fetchClosedOrders
     * @returns {object[]} a list of [prediction order structures](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    override async fetchClosedOrders (outcome: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<PredictionOrder[]> {
        const orders = await this.fetchOrdersByStatuses (outcome, since, limit, [ 'filled', 'cancelled', 'expired' ], params);
        const result: PredictionOrder[] = [];
        for (let i = 0; i < orders.length; i++) {
            const order = orders[i];
            const status = this.safeString (order, 'status');
            if ((status === 'closed')) {
                result.push (order);
            }
        }
        return this.filterBySinceLimit (result, since, limit, 'timestamp') as PredictionOrder[];
    }

    /**
     * @method
     * @name insightx#fetchCanceledOrders
     * @description fetches the authenticated user's cancelled orders
     * @see https://insightx-2.gitbook.io/whitepaper/insightx-whitepaper/10.-developer-resources-and-api-integration#get-orders
     * @param {string} [outcome] unified outcome handle or raw outcome id in marketId:outcomeIndex format
     * @param {int} [since] timestamp in ms of the earliest order to fetch
     * @param {int} [limit] the maximum number of canceled orders to return
     * @param {object} [params] extra exchange-specific parameters
     * @param {int} [params.page] page number to fetch, defaults to 1
     * @param {int} [params.size] number of orders to request per page
     * @param {string} [params.status] not used by insightx.fetchCanceledOrders
     * @returns {object[]} a list of [prediction order structures](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    async fetchCanceledOrders (outcome: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<PredictionOrder[]> {
        const rest = this.omit (params, [ 'status' ]);
        return await this.fetchOrders (outcome, since, limit, this.extend ({ 'status': 'cancelled' }, rest));
    }

    /**
     * @ignore
     * @method
     * @name insightx#decimalToBase16
     * @description converts an unsigned decimal integer string to hexadecimal without JavaScript integer precision loss
     * @param {string} value unsigned decimal integer string
     * @returns {string} lowercase hexadecimal without a 0x prefix
     */
    decimalToBase16 (value: string): string {
        let decimalString = value;
        const hexChars = [ '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f' ];
        let result = '';
        while (Precise.stringGt (decimalString, '0')) {
            const remainder = this.parseToInt (Precise.stringMod (decimalString, '16'));
            result = hexChars[remainder] + result;
            decimalString = Precise.stringDiv (decimalString, '16', 0) as string;
        }
        if (result === '') {
            return '0';
        }
        return result;
    }

    /**
     * @ignore
     * @method
     * @name insightx#encodeTradeCalldata
     * @description ABI-encodes trade(uint64 order_id, uint64 deadline, bytes signature)
     * @param {string} orderId insightx order id
     * @param {string} deadline signature expiration timestamp in seconds
     * @param {string} signature backend-generated order signature
     * @returns {string} EVM transaction calldata
     */
    encodeTradeCalldata (orderId: string, deadline: string, signature: string): string {
        const maxUint64 = '18446744073709551615';
        if (!Precise.stringGt (orderId, '0') || Precise.stringGt (orderId, maxUint64)) {
            throw new InvalidOrder (this.id + ' createOrder() received an invalid uint64 order_id');
        }
        if (!Precise.stringGt (deadline, '0') || Precise.stringGt (deadline, maxUint64)) {
            throw new InvalidOrder (this.id + ' createOrder() received an invalid uint64 deadline');
        }
        let signatureHex = this.remove0xPrefix (signature);
        if ((signatureHex === undefined) || (signatureHex === '') || (Precise.stringMod (this.numberToString (signatureHex.length), '2') !== '0')) {
            throw new InvalidOrder (this.id + ' createOrder() received an invalid trade signature');
        }
        this.base16ToBinary (signatureHex);
        let orderIdHex = this.decimalToBase16 (orderId);
        let deadlineHex = this.decimalToBase16 (deadline);
        let offsetHex = '60';
        let signatureLengthHex = this.intToBase16 (this.parseToInt (signatureHex.length / 2));
        orderIdHex = orderIdHex.padStart (64, '0');
        deadlineHex = deadlineHex.padStart (64, '0');
        offsetHex = offsetHex.padStart (64, '0');
        signatureLengthHex = signatureLengthHex.padStart (64, '0');
        while (Precise.stringMod (this.numberToString (signatureHex.length), '64') !== '0') {
            signatureHex = signatureHex + '0';
        }
        const selectorHash = this.hash (this.encode ('trade(uint64,uint64,bytes)'), keccak, 'hex');
        const selector = selectorHash.slice (0, 8);
        return '0x' + selector + orderIdHex + deadlineHex + offsetHex + signatureLengthHex + signatureHex;
    }

    /**
     * @method
     * @name insightx#createOrder
     * @description creates a limit order intent and confirms it on Mantle by calling trade(order_id, deadline, signature)
     * @see https://insightx-2.gitbook.io/whitepaper/insightx-whitepaper/10.-developer-resources-and-api-integration#id-10.8-create-order
     * @see https://insightx-2.gitbook.io/whitepaper/insightx-whitepaper/10.-developer-resources-and-api-integration#id-10.9-on-chain-order-confirmation
     * @param {string} outcome unified outcome handle or raw outcome id in marketId:outcomeIndex format
     * @param {string} type only 'limit' is documented and supported
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount number of outcome shares or contracts
     * @param {float} [price] price per share between 0.0001 and 0.9999
     * @param {object} [params] extra exchange-specific parameters
     * @param {string} [params.rpcUrl] Mantle JSON-RPC URL, defaults to options.rpcUrl
     * @param {string} [params.rpc] alias for params.rpcUrl
     * @param {string} [params.gasLimit] gas limit as a hex quantity; estimated automatically when omitted
     * @param {boolean} [params.confirmOnChain] submit the Mantle confirmation with privateKey, defaults to true; false returns the pending intent and calldata for an external wallet
     * @param {boolean} [params.skipWaitForReceipt] return after broadcasting without waiting for the transaction receipt, defaults to false
     * @param {int} [params.receiptTimeout] maximum milliseconds to wait for the transaction receipt, defaults to 60000
     * @returns {object} a [prediction order structure](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    override async createOrder (outcome: string, type: Str, side: Str, amount: Num, price: Num = undefined, params = {}): Promise<PredictionOrder> {
        await this.handleToken ();
        const outcomeObj = await this.loadOutcome (outcome);
        const marketId = this.safeString (outcomeObj, 'marketId');
        const outcomeInfo = this.safeDict (outcomeObj, 'info', {});
        const outcomeIndex = this.safeInteger (outcomeInfo, 'outcome_idx');
        if ((marketId === undefined) || (outcomeIndex === undefined)) {
            throw new BadSymbol (this.id + ' createOrder() could not resolve the market id and outcome index for ' + outcome);
        }
        const typeLower = this.safeStringLower ({ 'type': type }, 'type');
        if (typeLower !== 'limit') {
            throw new NotSupported (this.id + ' createOrder() only supports documented limit orders');
        }
        const sideLower = this.safeStringLower ({ 'side': side }, 'side');
        if ((sideLower !== 'buy') && (sideLower !== 'sell')) {
            throw new InvalidOrder (this.id + ' createOrder() side must be buy or sell');
        }
        if (price === undefined) {
            throw new ArgumentsRequired (this.id + ' createOrder() requires a price for limit orders');
        }
        const amountString = this.numberToString (amount);
        const priceString = this.numberToString (price);
        if ((amountString === undefined) || !Precise.stringGt (amountString, '0')) {
            throw new InvalidOrder (this.id + ' createOrder() amount must be greater than zero');
        }
        if ((priceString === undefined) || Precise.stringLt (priceString, '0.0001') || Precise.stringGt (priceString, '0.9999')) {
            throw new InvalidOrder (this.id + ' createOrder() price must be between 0.0001 and 0.9999');
        }
        const request: Dict = {
            'market_id': this.parseToInt (marketId),
            'outcome_idx': outcomeIndex,
            'side': sideLower,
            'order_type': typeLower,
            'price': price,
            'amount': amount,
        };
        const rest = this.omit (params, [ 'market_id', 'outcome_idx', 'side', 'order_type', 'price', 'amount', 'rpcUrl', 'rpc', 'gasLimit', 'confirmOnChain', 'skipWaitForReceipt', 'receiptTimeout' ]);
        const response = await this.insightxPrivatePostPredictV2PlaceOrder (this.extend (rest, request));
        const data = this.safeDict (response, 'data', {});
        const orderId = this.safeString (data, 'order_id');
        const tradeRecord = this.safeDict (data, 'trade_record');
        const deadline = this.safeString (tradeRecord, 'deadline');
        const signature = this.safeString (tradeRecord, 'signature');
        if ((orderId === undefined) || (deadline === undefined) || (signature === undefined)) {
            throw new ExchangeError (this.id + ' createOrder() did not receive order_id, deadline and signature');
        }
        const calldata = this.encodeTradeCalldata (orderId, deadline, signature);
        const defaultRpcUrl = this.safeString (this.options, 'rpcUrl');
        const rpcUrl = this.safeString2 (params, 'rpcUrl', 'rpc', defaultRpcUrl);
        const tradingContract = this.safeString (this.options, 'tradingContract');
        const confirmOnChain = this.safeBool (params, 'confirmOnChain', false);
        let transactionHash: Str = undefined;
        const skipWaitForReceipt = this.safeBool (params, 'skipWaitForReceipt', false);
        let receipt: any = undefined;
        let status: Str = undefined;
        if (confirmOnChain) {
            if (this.isEmptyString (this.privateKey)) {
                throw new AuthenticationError (this.id + ' createOrder() requires a privateKey to confirm the order on-chain');
            }
            if (rpcUrl === undefined) {
                throw new ArgumentsRequired (this.id + ' createOrder() requires params.rpcUrl or options.rpcUrl');
            }
            if (tradingContract === undefined) {
                throw new ExchangeError (this.id + ' createOrder() requires options.tradingContract');
            }
            const fromAddress = this.ethGetAddressFromPrivateKey (this.privateKey);
            let gasLimit = this.safeString (params, 'gasLimit');
            if (gasLimit === undefined) {
                gasLimit = await this.ethRpc (rpcUrl, 'eth_estimateGas', [ { 'from': fromAddress, 'to': tradingContract, 'value': '0x0', 'data': calldata } ]) as string;
            }
            const chainId = this.safeInteger (this.options, 'chainId', 5000);
            transactionHash = await this.sendEvmTransaction (rpcUrl, chainId, fromAddress, tradingContract, '0x0', calldata, gasLimit);

            if (!skipWaitForReceipt) {
                const receiptTimeout = this.safeInteger (params, 'receiptTimeout', 60000);
                receipt = await this.waitForTransactionReceipt (rpcUrl, transactionHash, receiptTimeout);
                const receiptStatus = this.safeString (receipt, 'status');
                if ((receiptStatus === '0x0') || (receiptStatus === '0')) {
                    throw new ExchangeError (this.id + ' createOrder() on-chain trade transaction failed: ' + transactionHash);
                }
                status = 'open';
            }
        }
        const info: Dict = this.deepExtend (response, {
            'tradingContract': tradingContract,
            'calldata': calldata,
        });
        if (transactionHash !== undefined) {
            info['transactionHash'] = transactionHash;
        }
        if (receipt !== undefined) {
            info['receipt'] = receipt;
        }
        return this.safePredictionOrder ({
            'id': orderId,
            'status': status,
            'type': typeLower,
            'side': sideLower,
            'price': price,
            'amount': amount,
            'outcome': this.safeString (outcomeObj, 'outcome'),
            'outcomeId': this.safeString (outcomeObj, 'outcomeId'),
            'label': this.safeString (outcomeObj, 'label'),
            'market': this.safeString (outcomeObj, 'market'),
            'event': this.safeString (outcomeObj, 'event'),
            'info': info,
        }, outcomeObj);
    }

    /**
     * @method
     * @name insightx#cancelOrder
     * @description cancels an open or partially filled insightx order
     * @see https://insightx-2.gitbook.io/whitepaper/insightx-whitepaper/10.-developer-resources-and-api-integration#id-10.10-cancel-order
     * @param {string} id insightx order id
     * @param {string} [outcome] not used by insightx.cancelOrder
     * @param {object} [params] extra exchange-specific parameters
     * @returns {object} a [prediction order structure](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    override async cancelOrder (id: string, outcome: Str = undefined, params = {}): Promise<PredictionOrder> {
        await this.handleToken ();
        const request: Dict = {
            'order_id': this.parseToInt (id),
        };
        const rest = this.omit (params, [ 'order_id' ]);
        const response = await this.insightxPrivatePostPredictV2CancelOrder (this.extend (request, rest));
        //
        // {
        //     "errno": 0,
        //     "errmsg": "no error",
        //     "data": {
        //         "order_id": 820700,
        //         "status": "cancelled"
        //     }
        // }
        //
        return this.safePredictionOrder ({
            'id': id,
            'status': 'canceled',
            'info': response,
        });
    }

    /**
     * @ignore
     * @method
     * @name insightx#parseOrderStatus
     * @description maps an insightx order status to the unified prediction order status vocabulary
     * @param {string} status raw insightx order status
     * @returns {string} the unified order status
     */
    parseOrderStatus (status: Str): Str {
        const statuses: Dict = {
            'pending': 'open',
            'partial': 'open',
            'partially_filled': 'open',
            'filled': 'closed',
            'cancelled': 'canceled',
            'canceled': 'canceled',
            'expired': 'expired',
        };
        return this.safeString (statuses, status, status);
    }

    /**
     * @ignore
     * @method
     * @name insightx#parsePredictionOrder
     * @description parses an insightx order into a unified prediction order
     * @param {object} order raw insightx order object
     * @param {object} [market] the requested outcome object used when raw identity is unavailable
     * @returns {object} a [prediction order structure](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    override parsePredictionOrder (order: Dict, market: Market = undefined): PredictionOrder {
        const marketId = this.safeString (order, 'market_id');
        const outcomeIndex = this.safeString (order, 'outcome_idx');
        let rawOutcomeId: Str = undefined;
        if ((marketId !== undefined) && (outcomeIndex !== undefined)) {
            rawOutcomeId = marketId + ':' + outcomeIndex;
        }
        const outcomeObj = this.safeOutcome (rawOutcomeId, market);
        const timestamp = this.safeTimestamp (order, 'created_at');
        const lastUpdateTimestamp = this.safeTimestamp (order, 'updated_at');
        const lastTradeTimestamp = this.safeTimestamp (order, 'filled_at');
        const rawSide = this.safeStringLower (order, 'side');
        let side: Str = undefined;
        if ((rawSide === 'buy') || (rawSide === 'sell')) {
            side = rawSide;
        }
        return this.safePredictionOrder ({
            'id': this.safeString (order, 'id'),
            'clientOrderId': this.safeString (order, 'client_order_id'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'lastUpdateTimestamp': lastUpdateTimestamp,
            'status': this.parseOrderStatus (this.safeStringLower (order, 'status')),
            'type': this.safeStringLower2 (order, 'order_type', 'type', 'limit'),
            'timeInForce': undefined,
            'side': side,
            'price': this.safeNumber (order, 'price'),
            'average': undefined,
            'amount': this.safeNumber (order, 'amount'),
            'filled': this.safeNumber (order, 'filled_amount'),
            'remaining': undefined,
            'cost': undefined,
            'fee': undefined,
            'reduceOnly': undefined,
            'postOnly': undefined,
            'trades': [],
            'outcome': this.safeString (outcomeObj, 'outcome'),
            'outcomeId': this.safeString (outcomeObj, 'outcomeId', rawOutcomeId),
            'label': this.safeString (outcomeObj, 'label'),
            'market': this.safeString (outcomeObj, 'market'),
            'event': this.safeString (outcomeObj, 'event'),
            'info': order,
        }, outcomeObj);
    }

    /**
     * @ignore
     * @method
     * @name insightx#parsePredictionPosition
     * @description parses an insightx outcome position into a unified prediction position
     * @param {object} positionData raw insightx position object
     * @param {object} [market] the outcome object the position belongs to
     * @returns {object} a [prediction position structure](https://docs.ccxt.com/#/?id=prediction-position-structure)
     */
    override parsePredictionPosition (positionData: Dict, market: Market = undefined): PredictionPosition {
        return this.safePredictionPosition ({
            'id': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'contracts': this.safeNumber (positionData, 'volume'),
            'contractSize': 1,
            'side': 'long',
            'notional': undefined,
            'unrealizedPnl': undefined,
            'realizedPnl': this.safeNumber (positionData, 'realized_pnl'),
            'collateral': undefined,
            'entryPrice': this.safeNumber (positionData, 'avg_price'),
            'markPrice': undefined,
            'lastPrice': undefined,
            'percentage': undefined,
            'outcome': this.safeString (market, 'outcome'),
            'outcomeId': this.safeString (market, 'outcomeId'),
            'label': this.safeString (market, 'label'),
            'market': this.safeString (market, 'market'),
            'event': this.safeString (market, 'event'),
            'resolved': undefined,
            'won': undefined,
            'settleFraction': undefined,
            'payout': undefined,
            'info': positionData,
        });
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
        const eventId = this.safeString (first, 'id');
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
     * @name insightx#signEvmTransaction
     * @description signs an EIP-1559 Mantle transaction with the configured EVM private key
     * @param {object} tx unsigned EIP-1559 transaction fields
     * @param {string} privateKey EVM private key
     * @returns {string} signed raw transaction hex
     */
    override signEvmTransaction (tx: Dict, privateKey: string): string {
        const accessList = this.rlpEncodeList ([]);
        const fields = [
            this.rlpEncodeBytes (this.intToRlpHex (this.safeInteger (tx, 'chainId'))),
            this.rlpEncodeBytes (this.hexToRlpBytes (this.safeString (tx, 'nonce'))),
            this.rlpEncodeBytes (this.hexToRlpBytes (this.safeString (tx, 'maxPriorityFeePerGas'))),
            this.rlpEncodeBytes (this.hexToRlpBytes (this.safeString (tx, 'maxFeePerGas'))),
            this.rlpEncodeBytes (this.hexToRlpBytes (this.safeString (tx, 'gasLimit'))),
            this.rlpEncodeBytes (this.remove0xPrefix (this.safeString (tx, 'to'))),
            this.rlpEncodeBytes (this.hexToRlpBytes (this.safeString (tx, 'value', '0x0'))),
            this.rlpEncodeBytes (this.remove0xPrefix (this.safeString (tx, 'data', '0x'))),
            accessList,
        ];
        const payload = '02' + this.rlpEncodeList (fields);
        const hashHex = this.hash (this.base16ToBinary (payload), keccak, 'hex');
        const signature = ecdsa (hashHex, this.remove0xPrefix (privateKey), secp256k1, undefined);
        let rHex = this.safeString (signature, 'r');
        let sHex = this.safeString (signature, 's');
        if (rHex === undefined) {
            throw new ExchangeError (this.id + ' signEvmTransaction() missing rHex');
        }
        if (Precise.stringMod (this.numberToString (rHex.length), '2') !== '0') {
            rHex = '0' + rHex;
        }
        if (sHex === undefined) {
            throw new ExchangeError (this.id + ' signEvmTransaction() missing sHex');
        }
        if (Precise.stringMod (this.numberToString (sHex.length), '2') !== '0') {
            sHex = '0' + sHex;
        }
        const yParity = this.safeInteger (signature, 'v');
        const signedFields: string[] = [];
        for (let i = 0; i < fields.length; i++) {
            signedFields.push (fields[i]);
        }
        signedFields.push (this.rlpEncodeBytes (this.intToRlpHex (yParity)));
        signedFields.push (this.rlpEncodeBytes (rHex));
        signedFields.push (this.rlpEncodeBytes (sHex));
        return '0x02' + this.rlpEncodeList (signedFields);
    }

    /**
     * @ignore
     * @method
     * @name insightx#handleErrors
     * @description maps insightx response error codes to ccxt exceptions
     */
    override handleErrors (statusCode: int, statusText: string, url: string, method: string, responseHeaders: Dict, responseBody: string, response: any, requestHeaders: any, requestBody: any) {
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
