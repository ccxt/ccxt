import Exchange from '../abstract/prediction/sxbet.js';
import type { Dict, Market, Str } from '../base/types.js';

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
        const pageSize = this.safeInteger (this.options, 'marketsPageSize', 100);
        const maxPages = this.safeInteger (this.options, 'maxMarketsPages', 50);
        const markets: Market[] = [];
        let paginationKey: Str = undefined;
        let page = 0;
        while (true) {
            const request: Dict = { 'pageSize': pageSize };
            if (paginationKey !== undefined) {
                request['paginationKey'] = paginationKey;
            }
            const response = await this.sxbetPublicGetMarketsActive (this.extend (request, rest));
            const result = this.safeDict (response, 'data', {});
            const rawMarkets = this.safeList (result, 'markets', []);
            const rawMarketsLength = rawMarkets.length;
            for (let i = 0; i < rawMarketsLength; i++) {
                markets.push (this.parseSxbetMarket (rawMarkets[i]));
            }
            paginationKey = this.safeString (result, 'nextKey');
            page = this.sum (page, 1);
            const collectedLength = markets.length;
            if ((rawMarketsLength < pageSize) || (page >= maxPages) || (paginationKey === undefined) || ((userLimit !== undefined) && (collectedLength >= userLimit))) {
                break;
            }
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
        const hashLength = marketHash.length;
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
            'taker': undefined,
            'maker': undefined,
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
