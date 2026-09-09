import { keccak_256 as keccak } from '@noble/hashes/sha3.js';
import { secp256k1 } from '@noble/curves/secp256k1.js';
import Exchange from '../abstract/prediction/predictfun.js';
import { ecdsa } from '../base/functions/crypto.js';
import { Precise } from '../base/Precise.js';
import { TRUNCATE, DECIMAL_PLACES } from '../base/functions/number.js';
import { ArgumentsRequired, AuthenticationError, BadRequest, BadSymbol, ExchangeError, InsufficientFunds, InvalidOrder, MarketClosed, OrderNotFound } from '../base/errors.js';
import type { Bool, Dict, Endpoint, fetchEventsParams, Int, Market, Num, OrderSide, OrderType, PredictionEvent, PredictionOrder, PredictionOrderBook, PredictionPosition, PredictionTicker, PredictionTrade, Str, Strings } from '../base/types.js';

// ---------------------------------------------------------------------------

/**
 * @class predictfun
 * @augments Exchange
 */
export default class predictfun extends Exchange {
    override describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'predictfun',
            'name': 'predict.fun',
            'countries': [],
            'rateLimit': 250,
            'version': 'v1',
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
                'cancelAllOrders': false,
                'cancelOrder': true,
                'cancelOrders': true,
                'createMarketBuyOrderWithCost': false,
                'createOrder': true,
                'createOrders': false,
                'fetchBalance': false,
                'fetchClosedOrders': true, // only limit orders
                'fetchCurrencies': false,
                'fetchDeposits': false,
                'fetchEvent': true,
                'fetchEvents': true,
                'fetchLedger': false,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': false,
                'fetchOpenInterest': false,
                'fetchOpenOrders': true, // only limit orders
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': false,
                'fetchOrderTrades': false,
                'fetchPosition': true,
                'fetchPositions': true,
                'fetchStatus': false,
                'fetchTicker': true,
                'fetchTickers': false,
                'fetchTime': false,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchWithdrawals': false,
                'prediction': true,         // Prediction market support
                'watchMyTrades': false,
                'watchOrderBook': false,
                'watchOrders': false,
                'watchTicker': false,
                'watchTrades': false,
            },
            'urls': {
                'logo': '',
                'api': {
                    'predictfun': 'https://api.predict.fun',
                },
                'test': {
                    'predictfun': 'https://api-testnet.predict.fun',
                },
                'www': 'https://predict.fun',
                'doc': [
                    'https://docs.predict.fun',
                ],
            },
            // predict.fun gates every endpoint behind the api key - market data included - so there
            // is no public group to split off: a key-less GET /v1/categories, /v1/markets,
            // /v1/search or even /v1/auth/message answers 401 "authorization error"
            'api': {
                'predictfun': {
                    'get': {
                        'v1/auth/message': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/categories': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/categories/{slug}': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/tags': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/markets': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/markets/{id}': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/markets/{id}/stats': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/markets/{id}/last-sale': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/markets/{id}/orderbook': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/markets/{id}/timeseries': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/markets/{id}/timeseries/latest': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/orders/{hash}': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/orders': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/orders/matches': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/account': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/account/activity': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/positions': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/positions/{address}': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/search': { 'cost': 1 } as Endpoint<Dict>,
                    },
                    'post': {
                        'v1/auth': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/orders/remove': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/orders': { 'cost': 1 } as Endpoint<Dict>,
                        // the docs list this one as /orders/remove-by-hash, but that 404s - the
                        // live path carries the v1 prefix like every other endpoint
                        'v1/orders/remove-by-hash': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/account/referral': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/oauth/finalize': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/oauth/orders': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/oauth/orders/create': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/oauth/orders/cancel': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/oauth/positions': { 'cost': 1 } as Endpoint<Dict>,
                    },
                },
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': false,
                // orders are EIP-712 signed by the maker wallet and the JWT that authorises them
                // is a personal_sign of a server issued message - neither is needed for market
                // data, so they are validated in authenticate () rather than on every request
                'walletAddress': false,
                'privateKey': false,
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': 0,
                    'taker': 0.02,  // default feeRateBps of 200 applied per order
                },
            },
            // the venue answers { success: false, code, error, message } - 'error' is a stable
            // slug so the exact map is keyed on that, the broad map on the message prose
            'exceptions': {
                'exact': {
                    // {"success":false,"code":400,"error":"create_order_min_order_value_not_met","message":"order must have a value of at least 0.9 USD","timestamp":"2026-09-06T14:53:22.142144615Z","trace":"895f3174c6245f432c6c4dd6f7f5ec6d"}
                    // {"success":false,"code":400,"error":"create_order_insufficient_collateral_allowance","message":"Insufficient collateral: USDT allowance is less than the total bid amount.","timestamp":"2026-09-06T15:08:32.4965164Z","trace":"f3de7dd53f6903156840c31ac1698318"}
                    'unauthorized': AuthenticationError,
                    'bad_request': BadRequest,
                    'not_found': BadRequest,
                    'create_order_hash_mismatch': InvalidOrder,
                    'create_order_insufficient_collateral_allowance': InsufficientFunds,
                    'create_order_insufficient_shares_allowance': InsufficientFunds,
                    'create_order_min_order_value_not_met': InvalidOrder,
                    'create_order_price_out_of_range': InvalidOrder,
                    'create_order_market_not_trading': MarketClosed,
                },
                'broad': {
                    // a 401 that is really a permission problem: the hash belongs to another wallet
                    'do not belong to this wallet': OrderNotFound,
                    'order hash must be a': BadRequest,
                    'Orderbook not found': BadSymbol,
                    'market not found': BadSymbol,
                    'not currently trading': MarketClosed,
                    'allowance is less than': InsufficientFunds,
                    'price per share must be': InvalidOrder,
                    'must have a value of at least': InvalidOrder,
                },
            },
            'options': {
                'allowUnscopedFetchEvents': true,
                'maxFetchEventsResults': 100,   // cap on events collected by an unscoped fetchEvents
                // the venue issues JWTs with a flat 24h lifetime (exp - iat = 86400 on every token
                // it hands out), and documents none of it, so the window is configurable here
                'tokenExpiresIn': 86400000,
                // the price a market order is signed at when the caller names none - the extremes
                // of the range the venue accepts, so the order crosses whatever is resting
                'marketBuyPrice': 0.99,
                'marketSellPrice': 0.01,
                'chainId': 56,                  // BNB mainnet, swapped to 97 by setSandboxMode
                // where approve () broadcasts, and the collateral it approves - both chain scoped
                'rpcUrls': {
                    '56': 'https://bsc-dataseed.bnbchain.org/',
                    '97': 'https://bsc-testnet-dataseed.bnbchain.org/',
                },
                'collateral': {
                    '56': '0x55d398326f99059fF775485246999027B3197955',
                    '97': '0xB32171ecD878607FFc4F8FC0bCcE6852BB3149E0',
                },
                'defaultExpiration': 3600,  // default expiration for limit orders is one hour
                'marketOrderExpiration': 300,   // market orders are only valid for five minutes
                // the order's EIP-712 verifying contract, picked by the market's negRisk and
                // yield-bearing flags - taken from the sdk's Constants.ts
                'exchanges': {
                    '56': {
                        'CTF_EXCHANGE': '0x8BC070BEdAB741406F4B1Eb65A72bee27894B689',
                        'NEG_RISK_CTF_EXCHANGE': '0x365fb81bd4A24D6303cd2F19c349dE6894D8d58A',
                        'YIELD_BEARING_CTF_EXCHANGE': '0x6bEb5a40C032AFc305961162d8204CDA16DECFa5',
                        'YIELD_BEARING_NEG_RISK_CTF_EXCHANGE': '0x8A289d458f5a134bA40015085A8F50Ffb681B41d',
                    },
                    '97': {
                        'CTF_EXCHANGE': '0x2A6413639BD3d73a20ed8C95F634Ce198ABbd2d7',
                        'NEG_RISK_CTF_EXCHANGE': '0xd690b2bd441bE36431F6F6639D7Ad351e7B29680',
                        'YIELD_BEARING_CTF_EXCHANGE': '0x8a6B4Fa700A1e310b106E7a48bAFa29111f66e89',
                        'YIELD_BEARING_NEG_RISK_CTF_EXCHANGE': '0x95D5113bc50eD201e319101bbca3e0E250662fCC',
                    },
                },
                // the ERC-1155 contracts the outcome shares themselves live in, which is what a
                // seller approves, and the neg risk adapter that moves those shares on both sides
                // of a match - also taken from the sdk's Constants.ts
                'conditionalTokens': {
                    '56': {
                        'CONDITIONAL_TOKENS': '0x22DA1810B194ca018378464a58f6Ac2B10C9d244',
                        'NEG_RISK_CONDITIONAL_TOKENS': '0x22DA1810B194ca018378464a58f6Ac2B10C9d244',
                        'YIELD_BEARING_CONDITIONAL_TOKENS': '0x9400F8Ad57e9e0F352345935d6D3175975eb1d9F',
                        'YIELD_BEARING_NEG_RISK_CONDITIONAL_TOKENS': '0xF64b0b318AAf83BD9071110af24D24445719A07F',
                    },
                    '97': {
                        'CONDITIONAL_TOKENS': '0x2827AAef52D71910E8FBad2FfeBC1B6C2DA37743',
                        'NEG_RISK_CONDITIONAL_TOKENS': '0x2827AAef52D71910E8FBad2FfeBC1B6C2DA37743',
                        'YIELD_BEARING_CONDITIONAL_TOKENS': '0x38BF1cbD66d174bb5F3037d7068E708861D68D7f',
                        'YIELD_BEARING_NEG_RISK_CONDITIONAL_TOKENS': '0x26e865CbaAe99b62fbF9D18B55c25B5E079A93D5',
                    },
                },
                'adapters': {
                    '56': {
                        'NEG_RISK_ADAPTER': '0xc3Cf7c252f65E0d8D88537dF96569AE94a7F1A6E',
                        'YIELD_BEARING_NEG_RISK_ADAPTER': '0x41dCe1A4B8FB5e6327701750aF6231B7CD0B2A40',
                    },
                    '97': {
                        'NEG_RISK_ADAPTER': '0x285c1B939380B130D7EBd09467b93faD4BA623Ed',
                        'YIELD_BEARING_NEG_RISK_ADAPTER': '0xb74aea04bdeBE912Aa425bC9173F9668e6f11F99',
                    },
                },
                'createOrder': {
                    'taker': '0x0000000000000000000000000000000000000000',
                },
            },
        });
    }

    /**
     * @method
     * @name predictfun#fetchMarkets
     * @description Retrieves all outcome markets from outcomeMeta.
     * Each binary outcome becomes one CCXT prediction market with two outcomes: YES and NO.
     * @see https://dev.predict.fun/get-categories-25326910e0
     * @see https://dev.predict.fun/search-categories-and-markets-27399810e0
     * @param {object} [params] extra parameters
     * @param {string} [params.query] a single search term — routes the call through the search endpoint and returns only the matching markets
     * @param {string[]} [params.queries] multiple search terms (alternative to query), the results are merged and deduplicated
     * @param {string[]} [params.tags] predictfun tag ids
     * @param {string} [params.slug] direct lookup by event slug
     * @param {int} [params.limit] the maximum number of events to collect markets from
     * @returns {Market[]} array of market structures
     */
    override async fetchMarkets (params = {}): Promise<Market[]> {
        const events = await this.fetchEvents (params);
        const eventsLength = events.length;
        const markets: Market[] = [];
        for (let ei = 0; ei < eventsLength; ei++) {
            const eventMarkets = this.safeList (events[ei], 'markets', []) as any[];
            const eventMarketsLength = eventMarkets.length;
            for (let mi = 0; mi < eventMarketsLength; mi++) {
                markets.push (eventMarkets[mi]);
            }
        }
        return markets;
    }

    /**
     * @method
     * @name predictfun#fetchEvent
     * @description fetches a single prediction-market event (market topic)
     * @see https://dev.predict.fun/get-category-by-slug-25326911e0
     * @param {string} id event slug
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.slug] event slug, overrides the id argument when both are given
     * @returns {object} a [prediction event structure](https://docs.ccxt.com/#/?id=prediction-event-structure)
     */
    override async fetchEvent (id: string, params = {}): Promise<PredictionEvent> {
        // the id argument is the event slug, per the base fetchEvent (id) contract - params.slug
        // overrides it so a caller can pass the slug the same way fetchEvents () takes it
        const paramSlug = this.safeString (params, 'slug');
        let slug = id;
        if (paramSlug !== undefined) {
            slug = paramSlug;
        }
        if (slug === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchEvent() requires an event slug as the id argument or a slug parameter');
        }
        const events = await this.fetchEvents (this.extend ({ 'slug': slug }, params));
        return this.safeDict (events, 0) as PredictionEvent;
    }

    /**
     * @method
     * @name predictfun#fetchEvents
     * @description fetches prediction-market events (market topics); the call must be scoped by query/queries/tags, eventId, or an l1Category/l2Category listing filter
     * @see https://dev.predict.fun/get-categories-25326910e0
     * @see https://dev.predict.fun/search-categories-and-markets-27399810e0
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.query] a single search term — routes the call through GET /v1/search instead of the categories listing
     * @param {string[]} [params.queries] multiple search terms (alternative to query), searched one by one and merged deduplicated by event slug
     * @param {string[]} [params.tags] predictfun tag ids
     * @param {string} [params.slug] direct lookup by event slug
     * @param {int} [params.limit] the maximum number of events to return, capped at 25 per search term when searching
     * @param {string} [params.sort] 'VOLUME_24H_DESC' | 'VOLUME_ALL_DESC' | 'PUBLISHED_AT_ASC' | 'PUBLISHED_AT_DESC'
     * @param {string} [params.status] 'OPEN' | 'RESOLVED'
     * @param {string} [params.marketVariant] predictfun enum value ('SPORTS_MATCH', 'CRYPTO_UP_DOWN' etc.)
     * @returns {object[]} a list of [prediction event structures](https://docs.ccxt.com/#/?id=prediction-event-structure)
     */
    override async fetchEvents (params: fetchEventsParams = {}): Promise<PredictionEvent[]> {
        const allowUnscopedFetchEvents = this.safeBool (this.options, 'allowUnscopedFetchEvents', false);
        if (!allowUnscopedFetchEvents) {
            this.requireEventQuery (params);
        }
        const queries = this.parseSearchQueries (params);
        const queriesLength = queries.length;
        params = this.omit (params, [ 'query', 'queries' ]);
        const userLimit = this.safeInteger (params, 'limit');
        let fetchCap = this.safeInteger (this.options, 'maxFetchEventsResults', 100);
        if (userLimit !== undefined) {
            fetchCap = userLimit;
        }
        const slug = this.safeString2 (params, 'slug', 'eventId');
        const rest = this.omit (params, [ 'status', 'limit', 'sort', 'eventId', 'slug', 'tags', 'marketVariant' ]);
        if (this.markets === undefined) {
            this.markets = this.createSafeDictionary ();
        }
        let rawTopics: any[] = [];
        if (slug !== undefined) {
            const response = await this.predictfunGetV1CategoriesSlug (this.extend ({ 'slug': slug }, rest));
            const data = this.safeDict (response, 'data');
            rawTopics = [ data ];
        } else if (queriesLength > 0) {
            // a query/queries scope is answered by the dedicated search endpoint — the categories
            // listing has no text filter, so paging it and matching client-side would both miss
            // the venue's semantic matches and cost one request per page
            rawTopics = await this.fetchRawTopicsByQueries (queries, params);
        } else {
            const request: Dict = {};
            const tags = this.safeList (params, 'tags', []);
            const tagsLength = tags.length;
            if (tagsLength > 0) {
                const tagsString = tags.join (',');
                request['tagIds'] = tagsString;
            }
            params = this.omit (params, [ 'limit', 'tags' ]);
            const extendedRequest = this.extend (request, params);
            let rawTopicsResponse = await this.predictfunGetV1Categories (extendedRequest);
            //
            //     {
            //         "cursor": "NDA1MDA0",
            //         "data": [
            //             {
            //                 "createdAt": "2026-08-26T14:00:02.000Z",
            //                 "description": "This market will resolve to \"Up\" if the ETH/USDT price at the end of the time range specified in the title is greater than the price at the beginning of that range.\r\n\r\nIt will resolve to \"Down\" if the ETH/USDT price at the end of the time range is lower than the price at the beginning of that range.\r\n\r\nIf the two prices are exactly equal, the market will resolve 50-50.\r\n\r\nThe primary resolution source for this market is Chainlink, specifically the ETH/USDT data stream available at https://data.chain.link/streams/eth-usdt-topofbook-datalink?timeframe=1d&chart=candlestick.\r\n\r\nTo verify the final price, use the close price of the 5m candlestick just before the market's end time. For example, for a market running from 1:00 to 1:15 PM ET or 1:10 to 1:15 PM ET, use the close price of the 1:10 PM candlestick as the final price.\r\n\r\nThe Chainlink stream uses the mid-price, which is calculated as the average price between the bid and ask prices from Binance's Top of Book, converted into the quote currency.\r\n\r\nThis market is based solely on the price reported by the Chainlink ETH/USDT data stream, not on other sources or spot markets.\r\n\r\nIf Chainlink data is unavailable or otherwise unusable for resolution, the market will resolve based on a consensus of reliable sources.\n2026-08-27T14:00:00Z",
            //                 "endsAt": "2026-08-27T14:15:00.000Z",
            //                 "id": 405022,
            //                 "imageUrl": "https://static.predict.fun/automarket-eth-usd-15-minutes",
            //                 "isNegRisk": false,
            //                 "isVisible": true,
            //                 "isYieldBearing": false,
            //                 "marketVariant": "CRYPTO_UP_DOWN",
            //                 "markets": [
            //                     {
            //                         "boostEndsAt": "2026-08-27T14:15:00.000Z",
            //                         "boostStartsAt": "2026-08-27T14:00:00.000Z",
            //                         "categorySlug": "eth-updown-15m-1787839200",
            //                         "conditionId": "0xa8e9c348c299989329debd86aaef81a1c4880d42c3954a684bdc731f7a113487",
            //                         "createdAt": "2026-08-26T14:00:02.000Z",
            //                         "decimalPrecision": 2,
            //                         "description": "This market will resolve to \"Up\" if the ETH/USDT price at the end of the time range specified in the title is greater than the price at the beginning of that range.\r\n\r\nIt will resolve to \"Down\" if the ETH/USDT price at the end of the time range is lower than the price at the beginning of that range.\r\n\r\nIf the two prices are exactly equal, the market will resolve 50-50.\r\n\r\nThe primary resolution source for this market is Chainlink, specifically the ETH/USDT data stream available at https://data.chain.link/streams/eth-usdt-topofbook-datalink?timeframe=1d&chart=candlestick.\r\n\r\nTo verify the final price, use the close price of the 5m candlestick just before the market's end time. For example, for a market running from 1:00 to 1:15 PM ET or 1:10 to 1:15 PM ET, use the close price of the 1:10 PM candlestick as the final price.\r\n\r\nThe Chainlink stream uses the mid-price, which is calculated as the average price between the bid and ask prices from Binance's Top of Book, converted into the quote currency.\r\n\r\nThis market is based solely on the price reported by the Chainlink ETH/USDT data stream, not on other sources or spot markets.\r\n\r\nIf Chainlink data is unavailable or otherwise unusable for resolution, the market will resolve based on a consensus of reliable sources.",
            //                         "feeRateBps": 200,
            //                         "id": 1739803,
            //                         "imageUrl": "https://static.predict.fun/automarket-eth-usd-15-minutes",
            //                         "isBoosted": false,
            //                         "isNegRisk": false,
            //                         "isVisible": true,
            //                         "isYieldBearing": false,
            //                         "kalshiMarketTicker": null,
            //                         "marketType": null,
            //                         "marketVariant": "CRYPTO_UP_DOWN",
            //                         "oracleQuestionId": "0x6ab55f25f108508e7c6cc9bb22e3304d3fcecd0771d741fdf6d67e6b7ab9af2c",
            //                         "outcomes": [
            //                             {
            //                                 "bestAsk": {
            //                                     "price": 0.98,
            //                                     "size": 100
            //                                 },
            //                                 "bestBid": {
            //                                     "price": 0.02,
            //                                     "size": 100
            //                                 },
            //                                 "indexSet": 1,
            //                                 "name": "Up",
            //                                 "onChainId": "63015212288887519605689521802215931005858239156918107575780791658588345185817",
            //                                 "status": null,
            //                                 "team": null,
            //                                 "variantData": null
            //                             },
            //                             {
            //                                 "bestAsk": {
            //                                     "price": 0.98,
            //                                     "size": 100
            //                                 },
            //                                 "bestBid": {
            //                                     "price": 0.02,
            //                                     "size": 100
            //                                 },
            //                                 "indexSet": 2,
            //                                 "name": "Down",
            //                                 "onChainId": "111913554301217491431600756326792444318464112865057816486042507140136158411642",
            //                                 "status": null,
            //                                 "team": null,
            //                                 "variantData": null
            //                             }
            //                         ],
            //                         "polymarketConditionIds": [],
            //                         "question": "Ethereum Up or Down - August 27, 10AM-10:15AM ET",
            //                         "questionIndex": null,
            //                         "resolution": null,
            //                         "resolverAddress": "0x77620FAb2969dF2D5696F1f081940E416Cf17cA5",
            //                         "rewards": {
            //                             "current": null,
            //                             "schedule": [
            //                                 {
            //                                     "endsAt": "2026-08-27T14:15:00.000Z",
            //                                     "hourlyRate": 3000,
            //                                     "startsAt": "2026-08-27T14:00:00.000Z"
            //                                 }
            //                             ]
            //                         },
            //                         "shareThreshold": 100,
            //                         "spreadThreshold": 0.06,
            //                         "status": "REGISTERED",
            //                         "team": null,
            //                         "title": "Ethereum Up or Down - August 27, 10AM-10:15AM ET",
            //                         "tradingStatus": "OPEN",
            //                         "variantData": {
            //                             "endPrice": null,
            //                             "priceFeedId": "0x0003543336278a459ac24c2f239ffa36f279cadc71f4babc9f8126c6ff10011d",
            //                             "priceFeedProvider": "CHAINLINK",
            //                             "priceFeedSymbol": "ETHUSDT",
            //                             "startPrice": null,
            //                             "type": "CRYPTO_UP_DOWN"
            //                         }
            //                     }
            //                 ],
            //                 "negRiskOnChainId": null,
            //                 "parentSlug": null,
            //                 "publishedAt": "2026-08-26T14:00:20.780Z",
            //                 "resolutionProvider": "CHAINLINK",
            //                 "shortTitle": "ETH Up or Down 15m",
            //                 "slug": "eth-updown-15m-1787839200",
            //                 "startsAt": "2026-08-27T14:00:00.000Z",
            //                 "stats": null,
            //                 "status": "OPEN",
            //                 "tags": [
            //                     {
            //                         "id": "2",
            //                         "level": 1,
            //                         "makerRebateBps": 0,
            //                         "name": "Crypto",
            //                         "parentId": null
            //                     },
            //                     {
            //                         "id": "7",
            //                         "level": null,
            //                         "makerRebateBps": 0,
            //                         "name": "ETH",
            //                         "parentId": null
            //                     },
            //                     {
            //                         "id": "111",
            //                         "level": 2,
            //                         "makerRebateBps": 2500,
            //                         "name": "Up/Down",
            //                         "parentId": "2"
            //                     },
            //                     {
            //                         "id": "146",
            //                         "level": 2,
            //                         "makerRebateBps": 0,
            //                         "name": "15 Min",
            //                         "parentId": "2"
            //                     }
            //                 ],
            //                 "teams": null,
            //                 "title": "Ethereum Up or Down - August 27, 10AM-10:15AM ET",
            //                 "variantData": {
            //                     "endPrice": null,
            //                     "priceFeedId": "0x0003543336278a459ac24c2f239ffa36f279cadc71f4babc9f8126c6ff10011d",
            //                     "priceFeedProvider": "CHAINLINK",
            //                     "priceFeedSymbol": "ETHUSDT",
            //                     "startPrice": null,
            //                     "type": "CRYPTO_UP_DOWN"
            //                 },
            //                 "variantDetails": {
            //                     "crypto": {
            //                         "priceFeedId": "0x0003543336278a459ac24c2f239ffa36f279cadc71f4babc9f8126c6ff10011d",
            //                         "priceFeedProvider": "CHAINLINK",
            //                         "priceFeedSymbol": "ETHUSDT"
            //                     },
            //                     "upDown": {
            //                         "priceFeedId": "0x0003543336278a459ac24c2f239ffa36f279cadc71f4babc9f8126c6ff10011d",
            //                         "priceFeedProvider": "CHAINLINK",
            //                         "priceFeedSymbol": "ETHUSDT"
            //                     }
            //                 }
            //             }
            //         ],
            //         "success": true
            //     }
            //
            let data = this.safeList (rawTopicsResponse, 'data', []);
            rawTopics = this.arrayConcat (rawTopics, data);
            let topicsLength = rawTopics.length;
            while (topicsLength < fetchCap) {
                const nextPageToken = this.safeString (rawTopicsResponse, 'cursor');
                if (nextPageToken === undefined) {
                    break;
                }
                extendedRequest['after'] = nextPageToken;
                rawTopicsResponse = await this.predictfunGetV1Categories (extendedRequest);
                data = this.safeList (rawTopicsResponse, 'data', []);
                rawTopics = this.arrayConcat (rawTopics, data);
                topicsLength = rawTopics.length;
            }
            if (topicsLength > fetchCap) {
                rawTopics = this.arraySlice (rawTopics, 0, fetchCap);
            }
        }
        const rawTopicsLength = rawTopics.length;
        const result: any[] = [];
        for (let i = 0; i < rawTopicsLength; i++) {
            const parsedEvent = this.parseEvent (rawTopics[i]);
            result.push (parsedEvent);
            const parsedMarkets = this.safeList (parsedEvent, 'markets', []) as any[];
            const parsedMarketsLength = parsedMarkets.length;
            for (let mi = 0; mi < parsedMarketsLength; mi++) {
                const m = parsedMarkets[mi];
                // prediction market rows are keyed by the unified 'market' handle
                const handle = this.safeString (m, 'market');
                if (handle !== undefined) {
                    this.markets[handle] = m;
                }
            }
        }
        this.populateOutcomes ();
        // scoping already happened server-side: the tag filter needs an event-level tags field
        // predictfun topics lack, and the query filter would drop semantic-search matches whose
        // title uses different words than the query
        let postParams = this.omit (params, [ 'tags' ]);
        // status is documented as the venue enum ('OPEN' / 'RESOLVED') but the shared client-side
        // pass speaks the unified vocabulary — translate so it doesn't discard every row it matched
        const rawStatus = this.safeString (params, 'status');
        if (rawStatus === 'OPEN') {
            postParams = this.extend (postParams, { 'status': 'active' });
        } else if (rawStatus === 'RESOLVED') {
            postParams = this.extend (postParams, { 'status': 'closed' });
        }
        return this.applyEventFetchParams (result, postParams, queries);
    }

    /**
     * @ignore
     * @method
     * @name predictfun#fetchRawTopicsByQueries
     * @description searches categories and markets for every query term and returns the raw market topics, deduplicated by slug
     * @see https://dev.predict.fun/search-categories-and-markets-27399810e0
     * @param {string[]} queries the search terms
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.status] anything other than 'active' asks the venue to include resolved rows
     * @returns {object[]} an array of raw market topics, each with a nested markets list
     */
    async fetchRawTopicsByQueries (queries: string[], params = {}): Promise<any[]> {
        // always ask for the venue's maximum page size - this is the per-type page size of the
        // search endpoint (it caps at 25 and defaults to 10), not the caller's event limit, which
        // applyEventFetchParams () applies to the parsed events afterwards
        const limit = 25;
        // resolved rows are excluded unless asked for — the unified status filter drives that
        const status = this.safeString (params, 'status');
        let includeResolved = 'false';
        if ((status !== undefined) && (status !== 'active') && (status !== 'OPEN')) {
            includeResolved = 'true';
        }
        // marketVariant/tags/sort are categories-listing filters the search endpoint does not accept
        const rest = this.omit (params, [ 'query', 'queries', 'limit', 'sort', 'searchIn', 'status', 'eventId', 'slug', 'tags', 'marketVariant' ]);
        const queriesLength = queries.length;
        const result: any[] = [];
        // the venue answers every term separately and the same category comes back for each term
        // that matches it - emit it once, otherwise applyEventFetchParams (), which slices to the
        // caller's limit after filtering, spends a slot on a repeat instead of a distinct event
        const seenSlugs: Dict = {};
        // market rows whose category row did not come back, bucketed by the slug they carry
        const orphanMarkets: Dict = {};
        const orphanSlugs: string[] = [];
        for (let i = 0; i < queriesLength; i++) {
            const request: Dict = {
                'query': queries[i],
                'limit': limit,
                'includeResolved': includeResolved,
            };
            const response = await this.predictfunGetV1Search (this.extend (request, rest));
            //
            //     {
            //         "data": {
            //             "categories": [
            //                 {
            //                     "id": 405022,
            //                     "slug": "eth-updown-15m-1787839200",
            //                     "title": "Ethereum Up or Down - August 27, 10AM-10:15AM ET",
            //                     "description": "This market will resolve to \"Up\" ...",
            //                     "imageUrl": "https://static.predict.fun/automarket-eth-usd-15-minutes",
            //                     "isNegRisk": false,
            //                     "isYieldBearing": false,
            //                     "marketVariant": "CRYPTO_UP_DOWN",
            //                     "variantData": null,
            //                     "createdAt": "2026-08-26T14:00:02.000Z",
            //                     "publishedAt": "2026-08-26T14:00:20.780Z",
            //                     "startsAt": "2026-08-27T14:00:00.000Z",
            //                     "endsAt": "2026-08-27T14:15:00.000Z",
            //                     "status": "OPEN",
            //                     "isVisible": true,
            //                     "tags": [ { "id": "2", "name": "Crypto" } ],
            //                     "markets": [ { "id": 1739803, "categorySlug": "eth-updown-15m-1787839200", ... } ]
            //                 }
            //             ],
            //             "markets": [
            //                 {
            //                     "id": 1739803,
            //                     "imageUrl": "https://static.predict.fun/automarket-eth-usd-15-minutes",
            //                     "title": "Ethereum Up or Down - August 27, 10AM-10:15AM ET",
            //                     "question": "Ethereum Up or Down - August 27, 10AM-10:15AM ET",
            //                     "description": "This market will resolve to \"Up\" ...",
            //                     "tradingStatus": "OPEN",
            //                     "status": "REGISTERED",
            //                     "isVisible": true,
            //                     "isNegRisk": false,
            //                     "isYieldBearing": false,
            //                     "feeRateBps": 200,
            //                     "conditionId": "0xa8e9c348c299989329debd86aaef81a1c4880d42c3954a684bdc731f7a113487",
            //                     "outcomes": [ { "name": "Up", "indexSet": 1, "onChainId": "630152...", "status": null } ],
            //                     "isBoosted": false,
            //                     "categorySlug": "eth-updown-15m-1787839200",
            //                     "marketVariant": "CRYPTO_UP_DOWN"
            //                 }
            //             ]
            //         },
            //         "success": true
            //     }
            //
            const data = this.safeDict (response, 'data', {});
            const categories = this.safeList (data, 'categories', []) as any[];
            const categoriesLength = categories.length;
            for (let ci = 0; ci < categoriesLength; ci++) {
                const category = categories[ci];
                const categorySlug = this.safeString (category, 'slug');
                if (categorySlug === undefined) {
                    // nothing to key a duplicate on, keep the row rather than drop it
                    result.push (category);
                } else if (!(categorySlug in seenSlugs)) {
                    seenSlugs[categorySlug] = true;
                    result.push (category);
                }
            }
            // a term can match a market whose category row is not in the response - those rows are
            // the other half of the payload and would otherwise be dropped, so bucket them by the
            // categorySlug they carry
            const rawMarkets = this.safeList (data, 'markets', []) as any[];
            const rawMarketsLength = rawMarkets.length;
            for (let mi = 0; mi < rawMarketsLength; mi++) {
                const rawMarket = rawMarkets[mi];
                const marketSlug = this.safeString (rawMarket, 'categorySlug');
                if (marketSlug !== undefined) {
                    if (marketSlug in orphanMarkets) {
                        // push through a local and write the slice back - the go transpiler's
                        // AppendToArray reassigns only a local copy of a map-stored array
                        const bucket = orphanMarkets[marketSlug];
                        bucket.push (rawMarket);
                        orphanMarkets[marketSlug] = bucket;
                    } else {
                        orphanMarkets[marketSlug] = [ rawMarket ];
                        orphanSlugs.push (marketSlug);
                    }
                }
            }
        }
        // whatever the category rows did not claim is a market-only hit: synthesize the enclosing
        // topic from the market rows themselves, without spending a request per slug
        const orphanSlugsLength = orphanSlugs.length;
        for (let i = 0; i < orphanSlugsLength; i++) {
            const orphanSlug = orphanSlugs[i];
            if (!(orphanSlug in seenSlugs)) {
                seenSlugs[orphanSlug] = true;
                const markets = orphanMarkets[orphanSlug];
                const first = this.safeDict (markets, 0, {});
                // the market row's 'status' is the registration enum ('REGISTERED' /
                // 'DEREGISTERED'), while parseEvent () reads the topic vocabulary ('OPEN' /
                // 'RESOLVED') - copying it verbatim would report resolved: false for a resolved hit
                const marketStatus = this.safeString (first, 'status');
                const tradingStatus = this.safeString (first, 'tradingStatus');
                let topicStatus: Str = undefined;
                if ((marketStatus === 'RESOLVED') || (marketStatus === 'SETTLED')) {
                    topicStatus = 'RESOLVED';
                } else if (tradingStatus === 'OPEN') {
                    topicStatus = 'OPEN';
                }
                result.push ({
                    // these rows carry no topic id and no endsAt, so the slug stands in as the id:
                    // it is what the venue addresses the topic by, and it keeps the event out of
                    // the caches and filters that key on an id being present.
                    // the missing endsAt is a known and accepted limit of synthesizing without a
                    // request: a market-only hit has no 'end', so its markets have no expiry and
                    // applyEventFetchParams () has nothing to filter or sort them on. recovering
                    // it would cost one GET /v1/categories/{slug} per orphan slug
                    'id': orphanSlug,
                    'slug': orphanSlug,
                    'title': this.safeString (first, 'title'),
                    'description': this.safeString (first, 'description'),
                    'imageUrl': this.safeString (first, 'imageUrl'),
                    'marketVariant': this.safeString (first, 'marketVariant'),
                    'isNegRisk': this.safeBool (first, 'isNegRisk'),
                    'isYieldBearing': this.safeBool (first, 'isYieldBearing'),
                    'isVisible': this.safeBool (first, 'isVisible'),
                    'status': topicStatus,
                    'createdAt': this.safeString (first, 'createdAt'),
                    'markets': markets,
                });
            }
        }
        return result;
    }

    /**
     * @ignore
     * @method
     * @name predictfun#parseEvent
     * @description parses a raw predictfun market topic (with nested markets) into the unified event shape
     * @param {object} rawTopic the raw market topic object
     * @returns {object} an event structure
     */
    parseEvent (rawTopic: Dict): any {
        //
        //     {
        //         "createdAt": "2026-08-26T14:00:02.000Z",
        //         "description": "This market will resolve to \"Up\" if the ETH/USDT price at the end of the time range specified in the title is greater than the price at the beginning of that range.\r\n\r\nIt will resolve to \"Down\" if the ETH/USDT price at the end of the time range is lower than the price at the beginning of that range.\r\n\r\nIf the two prices are exactly equal, the market will resolve 50-50.\r\n\r\nThe primary resolution source for this market is Chainlink, specifically the ETH/USDT data stream available at https://data.chain.link/streams/eth-usdt-topofbook-datalink?timeframe=1d&chart=candlestick.\r\n\r\nTo verify the final price, use the close price of the 5m candlestick just before the market's end time. For example, for a market running from 1:00 to 1:15 PM ET or 1:10 to 1:15 PM ET, use the close price of the 1:10 PM candlestick as the final price.\r\n\r\nThe Chainlink stream uses the mid-price, which is calculated as the average price between the bid and ask prices from Binance's Top of Book, converted into the quote currency.\r\n\r\nThis market is based solely on the price reported by the Chainlink ETH/USDT data stream, not on other sources or spot markets.\r\n\r\nIf Chainlink data is unavailable or otherwise unusable for resolution, the market will resolve based on a consensus of reliable sources.\n2026-08-27T14:00:00Z",
        //         "endsAt": "2026-08-27T14:15:00.000Z",
        //         "id": 405022,
        //         "imageUrl": "https://static.predict.fun/automarket-eth-usd-15-minutes",
        //         "isNegRisk": false,
        //         "isVisible": true,
        //         "isYieldBearing": false,
        //         "marketVariant": "CRYPTO_UP_DOWN",
        //         "markets": [
        //             {
        //                 "boostEndsAt": "2026-08-27T14:15:00.000Z",
        //                 "boostStartsAt": "2026-08-27T14:00:00.000Z",
        //                 "categorySlug": "eth-updown-15m-1787839200",
        //                 "conditionId": "0xa8e9c348c299989329debd86aaef81a1c4880d42c3954a684bdc731f7a113487",
        //                 "createdAt": "2026-08-26T14:00:02.000Z",
        //                 "decimalPrecision": 2,
        //                 "description": "This market will resolve to \"Up\" if the ETH/USDT price at the end of the time range specified in the title is greater than the price at the beginning of that range.\r\n\r\nIt will resolve to \"Down\" if the ETH/USDT price at the end of the time range is lower than the price at the beginning of that range.\r\n\r\nIf the two prices are exactly equal, the market will resolve 50-50.\r\n\r\nThe primary resolution source for this market is Chainlink, specifically the ETH/USDT data stream available at https://data.chain.link/streams/eth-usdt-topofbook-datalink?timeframe=1d&chart=candlestick.\r\n\r\nTo verify the final price, use the close price of the 5m candlestick just before the market's end time. For example, for a market running from 1:00 to 1:15 PM ET or 1:10 to 1:15 PM ET, use the close price of the 1:10 PM candlestick as the final price.\r\n\r\nThe Chainlink stream uses the mid-price, which is calculated as the average price between the bid and ask prices from Binance's Top of Book, converted into the quote currency.\r\n\r\nThis market is based solely on the price reported by the Chainlink ETH/USDT data stream, not on other sources or spot markets.\r\n\r\nIf Chainlink data is unavailable or otherwise unusable for resolution, the market will resolve based on a consensus of reliable sources.",
        //                 "feeRateBps": 200,
        //                 "id": 1739803,
        //                 "imageUrl": "https://static.predict.fun/automarket-eth-usd-15-minutes",
        //                 "isBoosted": false,
        //                 "isNegRisk": false,
        //                 "isVisible": true,
        //                 "isYieldBearing": false,
        //                 "kalshiMarketTicker": null,
        //                 "marketType": null,
        //                 "marketVariant": "CRYPTO_UP_DOWN",
        //                 "oracleQuestionId": "0x6ab55f25f108508e7c6cc9bb22e3304d3fcecd0771d741fdf6d67e6b7ab9af2c",
        //                 "outcomes": [
        //                     {
        //                         "bestAsk": {
        //                             "price": 0.98,
        //                             "size": 100
        //                         },
        //                         "bestBid": {
        //                             "price": 0.02,
        //                             "size": 100
        //                         },
        //                         "indexSet": 1,
        //                         "name": "Up",
        //                         "onChainId": "63015212288887519605689521802215931005858239156918107575780791658588345185817",
        //                         "status": null,
        //                         "team": null,
        //                         "variantData": null
        //                     },
        //                     {
        //                         "bestAsk": {
        //                             "price": 0.98,
        //                             "size": 100
        //                         },
        //                         "bestBid": {
        //                             "price": 0.02,
        //                             "size": 100
        //                         },
        //                         "indexSet": 2,
        //                         "name": "Down",
        //                         "onChainId": "111913554301217491431600756326792444318464112865057816486042507140136158411642",
        //                         "status": null,
        //                         "team": null,
        //                         "variantData": null
        //                     }
        //                 ],
        //                 "polymarketConditionIds": [],
        //                 "question": "Ethereum Up or Down - August 27, 10AM-10:15AM ET",
        //                 "questionIndex": null,
        //                 "resolution": null,
        //                 "resolverAddress": "0x77620FAb2969dF2D5696F1f081940E416Cf17cA5",
        //                 "rewards": {
        //                     "current": null,
        //                     "schedule": [
        //                         {
        //                             "endsAt": "2026-08-27T14:15:00.000Z",
        //                             "hourlyRate": 3000,
        //                             "startsAt": "2026-08-27T14:00:00.000Z"
        //                         }
        //                     ]
        //                 },
        //                 "shareThreshold": 100,
        //                 "spreadThreshold": 0.06,
        //                 "status": "REGISTERED",
        //                 "team": null,
        //                 "title": "Ethereum Up or Down - August 27, 10AM-10:15AM ET",
        //                 "tradingStatus": "OPEN",
        //                 "variantData": {
        //                     "endPrice": null,
        //                     "priceFeedId": "0x0003543336278a459ac24c2f239ffa36f279cadc71f4babc9f8126c6ff10011d",
        //                     "priceFeedProvider": "CHAINLINK",
        //                     "priceFeedSymbol": "ETHUSDT",
        //                     "startPrice": null,
        //                     "type": "CRYPTO_UP_DOWN"
        //                 }
        //             }
        //         ],
        //         "negRiskOnChainId": null,
        //         "parentSlug": null,
        //         "publishedAt": "2026-08-26T14:00:20.780Z",
        //         "resolutionProvider": "CHAINLINK",
        //         "shortTitle": "ETH Up or Down 15m",
        //         "slug": "eth-updown-15m-1787839200",
        //         "startsAt": "2026-08-27T14:00:00.000Z",
        //         "stats": null,
        //         "status": "OPEN",
        //         "tags": [
        //             {
        //                 "id": "2",
        //                 "level": 1,
        //                 "makerRebateBps": 0,
        //                 "name": "Crypto",
        //                 "parentId": null
        //             },
        //             {
        //                 "id": "7",
        //                 "level": null,
        //                 "makerRebateBps": 0,
        //                 "name": "ETH",
        //                 "parentId": null
        //             },
        //             {
        //                 "id": "111",
        //                 "level": 2,
        //                 "makerRebateBps": 2500,
        //                 "name": "Up/Down",
        //                 "parentId": "2"
        //             },
        //             {
        //                 "id": "146",
        //                 "level": 2,
        //                 "makerRebateBps": 0,
        //                 "name": "15 Min",
        //                 "parentId": "2"
        //             }
        //         ],
        //         "teams": null,
        //         "title": "Ethereum Up or Down - August 27, 10AM-10:15AM ET",
        //         "variantData": {
        //             "endPrice": null,
        //             "priceFeedId": "0x0003543336278a459ac24c2f239ffa36f279cadc71f4babc9f8126c6ff10011d",
        //             "priceFeedProvider": "CHAINLINK",
        //             "priceFeedSymbol": "ETHUSDT",
        //             "startPrice": null,
        //             "type": "CRYPTO_UP_DOWN"
        //         },
        //         "variantDetails": {
        //             "crypto": {
        //                 "priceFeedId": "0x0003543336278a459ac24c2f239ffa36f279cadc71f4babc9f8126c6ff10011d",
        //                 "priceFeedProvider": "CHAINLINK",
        //                 "priceFeedSymbol": "ETHUSDT"
        //             },
        //             "upDown": {
        //                 "priceFeedId": "0x0003543336278a459ac24c2f239ffa36f279cadc71f4babc9f8126c6ff10011d",
        //                 "priceFeedProvider": "CHAINLINK",
        //                 "priceFeedSymbol": "ETHUSDT"
        //             }
        //         }
        //     }
        //
        const rawMarkets = this.safeList (rawTopic, 'markets', []) as any[];
        const marketsList: any[] = [];
        let anyActive = false;
        const rawMarketsLength = rawMarkets.length;
        for (let i = 0; i < rawMarketsLength; i++) {
            const parsed = this.parseTopicMarket (rawMarkets[i], rawTopic);
            marketsList.push (parsed);
            if (this.safeBool (parsed, 'active', false)) {
                anyActive = true;
            }
        }
        const slug = this.safeString (rawTopic, 'slug');
        const title = this.safeString (rawTopic, 'title');
        const endDate = this.safeString (rawTopic, 'endsAt');
        const created = this.safeString (rawTopic, 'createdAt');
        const status = this.safeString (rawTopic, 'status');
        let active = anyActive;
        if (rawMarketsLength === 0) {
            active = (status === 'REGISTERED') || (status === 'OPEN');
        }
        let resolved: Bool = undefined;
        if (status !== undefined) {
            resolved = (status === 'RESOLVED') || (status === 'SETTLED');
        }
        return {
            // the venue addresses a category by its slug - GET /v1/categories/{slug} - and
            // fetchEvents () already reads params.eventId as one. publishing the numeric category
            // id here instead would break the base contract that an event can be refetched by its
            // own id; the numeric id stays reachable under info
            'id': slug,
            'slug': slug,
            'event': (slug !== undefined) ? this.shortenSlug (slug) : undefined,
            'title': title,
            'description': this.safeString (rawTopic, 'description'),
            'markets': marketsList,
            'active': active,
            'url': undefined,
            'image': this.safeString (rawTopic, 'imageUrl'),
            'created': this.parse8601 (created),
            'createdDatetime': created,
            'end': this.parse8601 (endDate),
            'endDatetime': endDate,
            'category': this.safeString (rawTopic, 'marketVariant'),
            'resolved': resolved,
            'info': rawTopic,
        };
    }

    /**
     * @ignore
     * @method
     * @name predictfun#stripPriceFormatting
     * @description drops the formatting the venue puts in a price but not in its slug - the currency sign, and a comma that sits between two digits
     * @param {string} [text] the raw title or outcome label
     * @returns {string} the same text with '$' removed and thousands separators closed up
     */
    stripPriceFormatting (text: Str): Str {
        if (text === undefined) {
            return undefined;
        }
        const digits = '0123456789';
        const chars = this.stringToCharsArray (text);
        const charsLength = chars.length;
        let stripped = '';
        for (let i = 0; i < charsLength; i++) {
            const ch = chars[i];
            let keep = true;
            if (ch === '$') {
                keep = false;
            } else if (ch === ',') {
                // only a comma between two digits is a thousands separator: "1,500" has to close
                // up to "1500" to match the venue's comma-free slug. a comma anywhere else is
                // ordinary punctuation and stays, so it still separates words
                const prevIsDigit = (i > 0) && (digits.indexOf (chars[i - 1]) >= 0);
                const nextIsDigit = ((i + 1) < charsLength) && (digits.indexOf (chars[i + 1]) >= 0);
                keep = !(prevIsDigit && nextIsDigit);
            }
            if (keep) {
                stripped = stripped + ch;
            }
        }
        return stripped;
    }

    /**
     * @ignore
     * @method
     * @name predictfun#titleForMarketSymbol
     * @description decides what of a market title belongs in the unified symbol, given how many markets its topic holds
     * @param {string} [topicSlug] the slug of the enclosing topic
     * @param {string} [title] the market title
     * @param {int} [marketCount] how many markets the topic carries
     * @returns {string} the title to append, or the slug itself when the topic holds a single market
     */
    titleForMarketSymbol (topicSlug: Str, title: Str, marketCount: Int = undefined): Str {
        // a topic holding one market needs nothing to tell its markets apart, and the title there
        // only restates the slug in another spelling - the venue writes the same window as
        // btc-updown-5m-1789017900 and as "Bitcoin Up or Down - September 10, 1:25AM-1:30AM ET".
        // returning the slug makes slugToMarketSymbol collapse the two halves into one part.
        // inside a multi-market topic the title is what keeps the handles apart, so it stays
        if ((marketCount === 1) && (topicSlug !== undefined)) {
            return topicSlug;
        }
        return this.stripPriceFormatting (title);
    }

    /**
     * @ignore
     * @method
     * @name predictfun#parseTopicMarket
     * @description parses one nested market of a market topic into the unified market shape, building its outcome tokens
     * @param {object} rawMarket the nested market object
     * @param {object} rawTopic the enclosing raw market topic (carries slug/vendor/fees/dates)
     * @returns {object} a market structure
     */
    parseTopicMarket (rawMarket: Dict, rawTopic: Dict): Market {
        //
        //     {
        //         "boostEndsAt": "2026-08-27T14:15:00.000Z",
        //         "boostStartsAt": "2026-08-27T14:00:00.000Z",
        //         "categorySlug": "eth-updown-15m-1787839200",
        //         "conditionId": "0xa8e9c348c299989329debd86aaef81a1c4880d42c3954a684bdc731f7a113487",
        //         "createdAt": "2026-08-26T14:00:02.000Z",
        //         "decimalPrecision": 2,
        //         "description": "This market will resolve to \"Up\" if the ETH/USDT price at the end of the time range specified in the title is greater than the price at the beginning of that range.\r\n\r\nIt will resolve to \"Down\" if the ETH/USDT price at the end of the time range is lower than the price at the beginning of that range.\r\n\r\nIf the two prices are exactly equal, the market will resolve 50-50.\r\n\r\nThe primary resolution source for this market is Chainlink, specifically the ETH/USDT data stream available at https://data.chain.link/streams/eth-usdt-topofbook-datalink?timeframe=1d&chart=candlestick.\r\n\r\nTo verify the final price, use the close price of the 5m candlestick just before the market's end time. For example, for a market running from 1:00 to 1:15 PM ET or 1:10 to 1:15 PM ET, use the close price of the 1:10 PM candlestick as the final price.\r\n\r\nThe Chainlink stream uses the mid-price, which is calculated as the average price between the bid and ask prices from Binance's Top of Book, converted into the quote currency.\r\n\r\nThis market is based solely on the price reported by the Chainlink ETH/USDT data stream, not on other sources or spot markets.\r\n\r\nIf Chainlink data is unavailable or otherwise unusable for resolution, the market will resolve based on a consensus of reliable sources.",
        //         "feeRateBps": 200,
        //         "id": 1739803,
        //         "imageUrl": "https://static.predict.fun/automarket-eth-usd-15-minutes",
        //         "isBoosted": false,
        //         "isNegRisk": false,
        //         "isVisible": true,
        //         "isYieldBearing": false,
        //         "kalshiMarketTicker": null,
        //         "marketType": null,
        //         "marketVariant": "CRYPTO_UP_DOWN",
        //         "oracleQuestionId": "0x6ab55f25f108508e7c6cc9bb22e3304d3fcecd0771d741fdf6d67e6b7ab9af2c",
        //         "outcomes": [
        //             {
        //                 "bestAsk": {
        //                     "price": 0.98,
        //                     "size": 100
        //                 },
        //                 "bestBid": {
        //                     "price": 0.02,
        //                     "size": 100
        //                 },
        //                 "indexSet": 1,
        //                 "name": "Up",
        //                 "onChainId": "63015212288887519605689521802215931005858239156918107575780791658588345185817",
        //                 "status": null,
        //                 "team": null,
        //                 "variantData": null
        //             },
        //             {
        //                 "bestAsk": {
        //                     "price": 0.98,
        //                     "size": 100
        //                 },
        //                 "bestBid": {
        //                     "price": 0.02,
        //                     "size": 100
        //                 },
        //                 "indexSet": 2,
        //                 "name": "Down",
        //                 "onChainId": "111913554301217491431600756326792444318464112865057816486042507140136158411642",
        //                 "status": null,
        //                 "team": null,
        //                 "variantData": null
        //             }
        //         ],
        //         "polymarketConditionIds": [],
        //         "question": "Ethereum Up or Down - August 27, 10AM-10:15AM ET",
        //         "questionIndex": null,
        //         "resolution": null,
        //         "resolverAddress": "0x77620FAb2969dF2D5696F1f081940E416Cf17cA5",
        //         "rewards": {
        //             "current": null,
        //             "schedule": [
        //                 {
        //                     "endsAt": "2026-08-27T14:15:00.000Z",
        //                     "hourlyRate": 3000,
        //                     "startsAt": "2026-08-27T14:00:00.000Z"
        //                 }
        //             ]
        //         },
        //         "shareThreshold": 100,
        //         "spreadThreshold": 0.06,
        //         "status": "REGISTERED",
        //         "team": null,
        //         "title": "Ethereum Up or Down - August 27, 10AM-10:15AM ET",
        //         "tradingStatus": "OPEN",
        //         "variantData": {
        //             "endPrice": null,
        //             "priceFeedId": "0x0003543336278a459ac24c2f239ffa36f279cadc71f4babc9f8126c6ff10011d",
        //             "priceFeedProvider": "CHAINLINK",
        //             "priceFeedSymbol": "ETHUSDT",
        //             "startPrice": null,
        //             "type": "CRYPTO_UP_DOWN"
        //         }
        //     }
        //
        const marketId = this.safeString (rawMarket, 'id');
        const topicSlug = this.safeString (rawMarket, 'categorySlug');
        // the same handle parseEvent () derives for the enclosing event - stamping it here is what
        // lets every outcome-addressed structure (order, ticker, trade, position) report an event
        const eventHandle = (topicSlug !== undefined) ? this.shortenSlug (topicSlug) : undefined;
        const title = this.safeString (rawMarket, 'title', marketId);
        const topicMarkets = this.safeList (rawTopic, 'markets', []);
        const marketCount = topicMarkets.length;
        const symbolTitle = this.titleForMarketSymbol (topicSlug, title, marketCount);
        const marketSymbol = this.slugToMarketSymbol (topicSlug, symbolTitle);
        const tradingStatus = this.safeString (rawMarket, 'tradingStatus');
        const status = this.safeString (rawMarket, 'status');
        let active = (tradingStatus === 'OPEN');
        if (tradingStatus === undefined) {
            active = (status === 'REGISTERED') || (status === 'OPEN');
        }
        const resolved = (status === 'RESOLVED') || (status === 'SETTLED');
        const endDate = this.safeString (rawTopic, 'endsAt');
        const feeRateBps = this.safeString (rawMarket, 'feeRateBps', '200'); // todo check
        const feeRate = this.parseNumber (Precise.stringDiv (feeRateBps, '10000'));
        const decimalPrecision = this.safeString (rawMarket, 'decimalPrecision', '2');
        const pricePrecision = this.parseNumber (this.parsePrecision (decimalPrecision));
        const precision = {
            'amount': 0.01, // todo check
            'price': pricePrecision,
        };
        const rawOutcomes = this.safeList (rawMarket, 'outcomes', []) as any[];
        const outcomes: any[] = [];
        let resolvedOutcomeRaw: Str = undefined;
        const rawOutcomesLength = rawOutcomes.length;
        for (let oi = 0; oi < rawOutcomesLength; oi++) {
            const rawOutcome = rawOutcomes[oi];
            // a label can carry a formatted price ("$1,800+"), and it goes into the outcome
            // handle verbatim - strip the same formatting the title gets
            const rawLabel = this.safeStringUpper (rawOutcome, 'name');
            const label = this.stripPriceFormatting (rawLabel);
            const tokenId = this.safeString (rawOutcome, 'onChainId');
            const outcomeHandle = marketSymbol + ':' + label;
            let winner: Bool = undefined;
            const outcomeStatus = this.safeString (rawOutcome, 'status');
            let settleFractionRaw: Num = undefined;
            if (outcomeStatus !== undefined) {
                winner = (outcomeStatus === 'WON');
                if (winner) {
                    settleFractionRaw = 1;
                    resolvedOutcomeRaw = outcomeHandle;
                } else {
                    settleFractionRaw = 0; // todo check
                }
            }
            const settleFraction = settleFractionRaw;
            outcomes.push ({
                'id': tokenId,
                'outcomeId': tokenId,
                'outcome': outcomeHandle,
                'market': marketSymbol,
                'event': eventHandle,
                'label': label,
                'price': undefined, // todo check
                'active': active,
                'winner': winner,
                'settleFraction': settleFraction,
                'precision': precision,
                'info': this.extend ({
                    'marketId': marketId,
                }, rawOutcome),
            });
        }
        const resolvedOutcome = resolvedOutcomeRaw;
        const collateral = 'USDT';
        const marketType = (rawOutcomesLength > 2) ? 'categorical' : 'binary';
        const createdDatetime = this.safeString (rawMarket, 'createdAt');
        return {
            'id': marketId,
            'market': marketSymbol,
            'base': collateral,
            'quote': collateral,
            'settle': undefined,
            'baseId': marketId,
            'quoteId': collateral,
            'settleId': undefined,
            'type': 'prediction',
            'marketType': marketType,
            'executionModel': 'clob',
            'collateral': collateral,
            'spot': false,
            'margin': false,
            'swap': false,
            'future': false,
            'option': false,
            'prediction': true,
            'active': active,
            'resolved': resolved,
            'resolvedOutcome': resolvedOutcome,
            'contract': false,
            'linear': undefined,
            'inverse': undefined,
            'contractSize': undefined,
            'expiry': this.parse8601 (endDate),
            'expiryDatetime': endDate,
            'strike': undefined,
            'optionType': undefined,
            'taker': feeRate,
            'maker': 0, // todo check
            'percentage': true,
            'tierBased': false,
            'feeSide': 'get',
            'precision': precision,
            'limits': {
                'leverage': { 'min': 1, 'max': 1 },
                'amount': { 'min': undefined, 'max': undefined },
                'price': { 'min': 0.01, 'max': 0.99 },
                'cost': { 'min': 1, 'max': undefined },  // MARKET quotes require amountIn of at least 1 USDT
            },
            'outcomes': outcomes,
            'info': rawMarket,
            'created': this.parse8601 (createdDatetime),
        } as unknown as Market;
    }

    /**
     * @method
     * @name predictfun#fetchOrderBook
     * @description fetches the order book for a single prediction outcome token
     * @see https://dev.predict.fun/get-the-orderbook-for-a-market-25326908e0
     * @param {string} outcome unified outcome handle, or an outcome token id
     * @param {int} [limit] not used by predictfun fetchOrderBook
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a prediction [order book structure](https://docs.ccxt.com/#/?id=order-book-structure)
     */
    override async fetchOrderBook (outcome: Str, limit: Int = undefined, params = {}): Promise<PredictionOrderBook> {
        await this.loadOutcome (outcome);
        const outcomeObj = this.outcome (outcome);
        const info = this.safeDict (outcomeObj, 'info', {});
        const request: Dict = {
            'id': this.safeString (info, 'marketId'),
        };
        const response = await this.predictfunGetV1MarketsIdOrderbook (this.extend (request, params));
        //
        //     {
        //         "data":
        //             {
        //             "asks": [
        //                 [ 0.99, 101 ]
        //             ],
        //             "bids": [
        //                 [ 0.01, 101 ]
        //             ],
        //             "lastOrderSettled": null,
        //             "marketId": 1743016,
        //             "updateTimestampMs": 1787770521244
        //         },
        //         "success":true
        //     }
        //
        const data = this.safeDict (response, 'data', {});
        const timestamp = this.safeInteger (data, 'updateTimestampMs');
        // The outcome lables are not the same as the outcome indexSet values, so we need to check the indexSet to determine which outcome is being requested
        const indexSet = this.safeInteger (info, 'indexSet');
        const isYesOutcome = (indexSet === 1);
        const outcomeSymbol = this.safeOutcomeSymbol (outcome, outcomeObj);
        // the book endpoint is quoted in the yes token, the no side mirrors at 1 - price with bids and asks swapped
        if (isYesOutcome) {
            const yesOrderbook = this.parseOrderBook (data, outcomeSymbol, timestamp, 'bids', 'asks', 0, 1);
            return this.safePredictionOrderBook (yesOrderbook, outcomeObj);
        } else {
            const bids = this.safeList (data, 'bids', []);
            const asks = this.safeList (data, 'asks', []);
            const noBids = [];
            const noAsks = [];
            for (let i = 0; i < bids.length; i++) {
                const bid = bids[i];
                const bidPrice = this.safeString (bid, 0);
                const bidSize = this.parseNumber (this.safeString (bid, 1));
                const complementPrice = this.parseNumber (Precise.stringSub ('1', bidPrice));
                noAsks.push ([ complementPrice, bidSize ]);
            }
            for (let i = 0; i < asks.length; i++) {
                const ask = asks[i];
                const askPrice = this.safeString (ask, 0);
                const askSize = this.parseNumber (this.safeString (ask, 1));
                const complementPrice = this.parseNumber (Precise.stringSub ('1', askPrice));
                noBids.push ([ complementPrice, askSize ]);
            }
            const noOrderbook = {
                'bids': this.sortBy (noBids, 0, true),
                'asks': this.sortBy (noAsks, 0),
                'timestamp': timestamp,
                'datetime': this.iso8601 (timestamp),
                'nonce': undefined,
            };
            return this.safePredictionOrderBook (noOrderbook, outcomeObj);
        }
    }

    /**
     * @method
     * @name predictfun#fetchTicker
     * @description fetches the best bid and ask for a single prediction outcome token
     * @see https://dev.predict.fun/get-market-by-id-25552989e0
     * @param {string} outcome unified outcome handle, or an outcome token id
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [prediction ticker structure](https://docs.ccxt.com/#/?id=prediction-ticker-structure)
     */
    override async fetchTicker (outcome: Str, params = {}): Promise<PredictionTicker> {
        await this.loadOutcome (outcome);
        const outcomeObj = this.outcome (outcome);
        const info = this.safeDict (outcomeObj, 'info', {});
        const request: Dict = {
            'id': this.safeString (info, 'marketId'),
        };
        // the market detail carries a bestBid/bestAsk per outcome, already sided for the NO
        // outcome - last price and volume live behind /last-sale and /stats, one request each,
        // so they are left undefined rather than spending extra calls on them
        const response = await this.predictfunGetV1MarketsId (this.extend (request, params));
        //
        //     {
        //         "data": {
        //             "id": 2107,
        //             "title": "Will Trump acquire Greenland before 2027?",
        //             "tradingStatus": "OPEN",
        //             "status": "REGISTERED",
        //             "decimalPrecision": 2,
        //             "feeRateBps": 200,
        //             "outcomes": [
        //                 {
        //                     "name": "Yes",
        //                     "indexSet": 1,
        //                     "onChainId": "43765171147442247918432418752066697760469767620931280624762484655579631167373",
        //                     "bestBid": { "price": 0.02, "size": 1448.4122448979592 },
        //                     "bestAsk": { "price": 0.032, "size": 675.29 },
        //                     "status": null
        //                 },
        //                 {
        //                     "name": "No",
        //                     "indexSet": 2,
        //                     "bestBid": { "price": 0.968, "size": 675.29 },
        //                     "bestAsk": { "price": 0.98, "size": 1448.4122448979592 },
        //                     "status": null
        //                 }
        //             ]
        //         },
        //         "success": true
        //     }
        //
        const data = this.safeDict (response, 'data', {});
        return this.parsePredictionTicker (data, outcomeObj);
    }

    /**
     * @ignore
     * @method
     * @name predictfun#parsePredictionTicker
     * @description parses a raw market detail into a unified prediction ticker for one of its outcomes
     * @param {object} ticker the raw market object, with a nested outcomes list
     * @param {object} [market] the outcome the ticker belongs to
     * @returns {object} a [prediction ticker structure](https://docs.ccxt.com/#/?id=prediction-ticker-structure)
     */
    override parsePredictionTicker (ticker: Dict, market: Market = undefined): PredictionTicker {
        const info = this.safeDict (market, 'info', {});
        const indexSet = this.safeInteger (info, 'indexSet');
        const rawOutcomes = this.safeList (ticker, 'outcomes', []);
        const rawOutcomesLength = rawOutcomes.length;
        let rawOutcome: Dict = {};
        let outcomeFound = false;
        for (let i = 0; i < rawOutcomesLength; i++) {
            const candidate = rawOutcomes[i];
            if (this.safeInteger (candidate, 'indexSet') === indexSet) {
                rawOutcome = candidate;
                outcomeFound = true;
                break;
            }
        }
        if (!outcomeFound) {
            // an unmatched indexSet would otherwise return a ticker whose every quote is
            // undefined next to a fresh timestamp, which reads as an empty book rather than as a
            // market that never carried this outcome
            const requested = this.safeOutcomeSymbol (undefined, market);
            throw new BadSymbol (this.id + ' fetchTicker() did not find ' + requested + ' among the outcomes of its market');
        }
        // the venue quotes each outcome on its own side of the book, so no complement is needed
        const bestBid = this.safeDict (rawOutcome, 'bestBid', {});
        const bestAsk = this.safeDict (rawOutcome, 'bestAsk', {});
        const timestamp = this.milliseconds ();
        return this.safePredictionTicker ({
            'outcome': this.safeOutcomeSymbol (undefined, market),
            'outcomeId': this.safeString (market, 'outcomeId'),
            'label': this.safeString (market, 'label'),
            'market': this.safeString (market, 'market'),
            'event': this.safeString (market, 'event'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': undefined,
            'low': undefined,
            'bid': this.safeNumber (bestBid, 'price'),
            'bidVolume': this.safeNumber (bestBid, 'size'),
            'ask': this.safeNumber (bestAsk, 'price'),
            'askVolume': this.safeNumber (bestAsk, 'size'),
            'open': undefined,
            'close': undefined,
            'last': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': undefined,
            'info': ticker,
        });
    }

    /**
     * @method
     * @name predictfun#fetchMyTrades
     * @description fetches the settled matches the wallet took part in, on either side of the book
     * @see https://dev.predict.fun/get-order-match-events-25663812e0
     * @param {string} [outcome] unified outcome handle, restricts the call to that outcome's market
     * @param {int} [since] timestamp in ms of the earliest trade to return, applied client side
     * @param {int} [limit] the maximum number of trades to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.after] cursor from a previous response, the venue pages back from the most recent match
     * @param {bool} [params.isSignerMaker] true keeps only the matches the wallet rested, false only the ones it took
     * @param {string} [params.signerAddress] read another wallet's matches instead of the configured one
     * @returns {object[]} a list of [prediction trade structures](https://docs.ccxt.com/#/?id=prediction-trade-structure)
     */
    override async fetchMyTrades (outcome: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<PredictionTrade[]> {
        const signerAddress = this.safeString (params, 'signerAddress', this.walletAddress);
        if (signerAddress === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades() requires a walletAddress, or a signer address in params to read another wallet');
        }
        const request: Dict = {
            'signerAddress': signerAddress,
        };
        let outcomeObj = undefined;
        if (outcome !== undefined) {
            await this.loadOutcome (outcome);
            outcomeObj = this.outcome (outcome);
            const info = this.safeDict (outcomeObj, 'info', {});
            request['marketId'] = this.safeString (info, 'marketId');
        }
        const query = this.omit (params, 'signerAddress');
        // the endpoint carries no time filter, it pages back from the most recent match, so
        // since is applied client side by parsePredictionTrades
        const response = await this.predictfunGetV1OrdersMatches (this.extend (request, query));
        // the venue answers with the shape documented in fetchTrades below
        const data = this.safeList (response, 'data', []);
        const wallet = signerAddress.toLowerCase ();
        // a settlement names one taker and several makers, and the wallet may sit on either side,
        // so the legs it signed are the ones to report - a self trade legitimately yields two rows
        const flattenTrades: any[] = [];
        const dataLength = data.length;
        for (let i = 0; i < dataLength; i++) {
            const entry = data[i];
            const taker = this.safeDict (entry, 'taker', {});
            const takerSigner = this.safeStringLower (taker, 'signer');
            if (takerSigner === wallet) {
                const takerParty = this.extend (taker, {
                    'takerOrMaker': 'taker',
                    'type': 'market',
                });
                flattenTrades.push (this.extend (entry, { 'partyToParse': takerParty }));
            }
            const makers = this.safeList (entry, 'makers', []);
            const makersLength = makers.length;
            for (let j = 0; j < makersLength; j++) {
                const maker = makers[j];
                const makerSigner = this.safeStringLower (maker, 'signer');
                if (makerSigner === wallet) {
                    const makerParty = this.extend (maker, {
                        'takerOrMaker': 'maker',
                        'type': 'limit',
                    });
                    flattenTrades.push (this.extend (entry, { 'partyToParse': makerParty }));
                }
            }
        }
        return this.parsePredictionTrades (flattenTrades, outcomeObj, since, limit);
    }

    /**
     * @method
     * @name predictfun#fetchTrades
     * @description fetches the most recent settled matches for a single prediction outcome token
     * @see https://dev.predict.fun/get-order-match-events-25663812e0
     * @param {string} outcome unified outcome handle, or an outcome token id
     * @param {int} [since] timestamp in ms of the earliest trade to return, applied client side
     * @param {int} [limit] the maximum number of trades to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.after] cursor from a previous response, the venue pages back from the most recent match
     * @param {string} [params.minValueUsdtWei] only return matches worth at least this many wei
     * @returns {object[]} a list of [prediction trade structures](https://docs.ccxt.com/#/?id=prediction-trade-structure)
     */
    override async fetchTrades (outcome: Str, since: Int = undefined, limit: Int = undefined, params = {}): Promise<PredictionTrade[]> {
        await this.loadOutcome (outcome);
        const outcomeObj = this.outcome (outcome);
        const info = this.safeDict (outcomeObj, 'info', {});
        const request: Dict = {
            'marketId': this.safeString (info, 'marketId'),
        };
        // the endpoint carries no time filter, it pages back from the most recent match, so
        // since is applied client side by parsePredictionTrades
        const response = await this.predictfunGetV1OrdersMatches (this.extend (request, params));
        //
        //     {
        //         "cursor": "eyJjcmVhdGVkQXQiOiIyMDI2LTA5LTA1VDIzOjU1OjU2WiJ9",
        //         "data": [
        //             {
        //                 "amountFilled": "8409090909090909720",
        //                 "executedAt": "2026-09-06T11:45:23.000Z",
        //                 "priceExecuted": "111200000000000000",
        //                 "settlementId": "01a07689-955a-7070-86af-a100b7b7350c",
        //                 "transactionHash": "0x435863c29443ff45b2f8966c52428d3bb3a29a38de24dc6c17ca0817951fda79",
        //                 "taker": {
        //                     "amount": "8409090909090909720",
        //                     "fee": { "amount": "151363636363636374", "type": "SHARES" },
        //                     "hash": "0x0a0eab35c68fda64ced0989aec9313f5884e5ecba51d780f9b7da634cc979027",
        //                     "outcome": { "indexSet": 1, "name": "Up", "onChainId": "44616422429987613582483910707767544579739686077414897363305263997555112684875" },
        //                     "price": "112000000000000000",
        //                     "quoteType": "Bid",
        //                     "signer": "0x6Da6Cb464F92AE7aD4Ec3d239c81719Cb1D0Ae03"
        //                 },
        //                 "makers": [
        //                     {
        //                         "amount": "1009090909090909720",
        //                         "fee": { "amount": "0", "type": "SHARES" },
        //                         "hash": "0x0950ef588b53e2489f95cb1d830a6e0cb0bffc0f4baf4286e3b2e03bad2eba47",
        //                         "outcome": { "indexSet": 2, "name": "Down", "onChainId": "39857821499700810175970492505692306870421072168717601114846981613437602260320" },
        //                         "price": "880000000000000000",
        //                         "quoteType": "Bid",
        //                         "signer": "0x6Da6Cb464F92AE7aD4Ec3d239c81719Cb1D0Ae03"
        //                     }
        //                 ],
        //                 "market": { "id": 1965449 }
        //             }
        //         ],
        //         "success": true
        //     }
        //
        const data = this.safeList (response, 'data', []);
        const flattenTrades: any[] = [];
        const dataLength = data.length;
        for (let i = 0; i < dataLength; i++) {
            const entry = data[i];
            const taker = this.safeDict (entry, 'taker', {});
            const takerOutcome = this.safeDict (taker, 'outcome', {});
            const takerIndexSet = this.safeInteger (takerOutcome, 'indexSet');
            const outcomeIndexSet = this.safeInteger (info, 'indexSet');
            let partyToParse = this.safeDict (entry, 'taker', {});
            if (takerIndexSet === outcomeIndexSet) {
                const takerParty: Dict = {
                    'takerOrMaker': 'taker',
                    'type': 'market',
                };
                partyToParse = this.extend (partyToParse, takerParty);
                flattenTrades.push (this.extend (entry, { 'partyToParse': partyToParse }));
            } else {
                const makers = this.safeList (entry, 'makers', []);
                const makersLength = makers.length;
                const makerParty: Dict = {
                    'takerOrMaker': 'maker',
                    'type': 'limit',
                };
                for (let j = 0; j < makersLength; j++) {
                    const maker = makers[j];
                    const makerOutcome = this.safeDict (maker, 'outcome', {});
                    const makerIndexSet = this.safeInteger (makerOutcome, 'indexSet');
                    if (makerIndexSet === outcomeIndexSet) {
                        partyToParse = maker;
                        partyToParse = this.extend (partyToParse, makerParty);
                        flattenTrades.push (this.extend (entry, { 'partyToParse': partyToParse }));
                    }
                }
            }
        }
        return this.parsePredictionTrades (flattenTrades, outcomeObj, since, limit);
    }

    /**
     * @ignore
     * @method
     * @name predictfun#parsePredictionTrade
     * @description parses a raw order match event into a unified prediction trade for one of the two outcomes
     * @param {object} trade the raw match event
     * @param {object} [market] the outcome the trade belongs to
     * @returns {object} a [prediction trade structure](https://docs.ccxt.com/#/?id=prediction-trade-structure)
     */
    override parsePredictionTrade (trade: Dict, market: Market = undefined): PredictionTrade {
        const party = this.safeDict (trade, 'partyToParse', {});
        // fetchMyTrades spans several markets at once, so the row's identity comes from the party
        // it carries rather than from the outcome the caller asked for
        const partyOutcome = this.safeDict (party, 'outcome', {});
        const tokenId = this.safeString (partyOutcome, 'onChainId');
        const outcomeObj = this.safeOutcome (tokenId, market);
        const takerOrMaker = this.safeString (party, 'takerOrMaker');
        // a resting maker fills at its own price, so the party price is the execution price for
        // that leg. the taker's party price is only its limit: the settlement records what it
        // actually paid, and the difference is the price improvement the book gave it
        let priceStr = this.safeString (party, 'price');
        if (takerOrMaker === 'taker') {
            priceStr = this.safeString (trade, 'priceExecuted', priceStr);
        }
        priceStr = Precise.stringDiv (priceStr, '1000000000000000000');
        let amountStr = this.safeString (party, 'amount');
        amountStr = Precise.stringDiv (amountStr, '1000000000000000000');
        let side: Str = undefined;
        let order: Str = undefined;
        let fee: any = undefined;
        const quoteType = this.safeStringLower (party, 'quoteType');
        if (quoteType === 'bid') {
            side = 'buy';
        } else if (quoteType === 'ask') {
            side = 'sell';
        }
        order = this.safeString (party, 'hash');
        const rawFee = this.safeDict (party, 'fee');
        if (rawFee !== undefined) {
            const feeType = this.safeString (rawFee, 'type');
            const feeCost = this.safeString (rawFee, 'amount');
            fee = {
                // a SHARES fee is charged in outcome tokens rather than in collateral
                'currency': (feeType === 'COLLATERAL') ? 'USDT' : undefined,
                'cost': this.parseNumber (Precise.stringDiv (feeCost, '1000000000000000000')),
            };
        }
        const timestamp = this.parse8601 (this.safeString (trade, 'executedAt'));
        return this.safePredictionTrade ({
            'id': this.safeString (trade, 'settlementId'),
            'order': order,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'outcome': this.safeOutcomeSymbol (undefined, outcomeObj),
            'outcomeId': this.safeString (outcomeObj, 'outcomeId'),
            'label': this.safeString (outcomeObj, 'label'),
            'market': this.safeString (outcomeObj, 'market'),
            'type': this.safeString (party, 'type'),
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': this.parseNumber (priceStr),
            'amount': this.parseNumber (amountStr),
            'cost': undefined,
            'fee': fee,
            'info': this.omit (trade, 'partyToParse'),
        });
    }

    /**
     * @method
     * @name predictfun#setSandboxMode
     * @description switches between BNB mainnet and the BNB testnet
     * @param {bool} enable whether to use the testnet
     * @returns {undefined}
     */
    override setSandboxMode (enable: boolean) {
        super.setSandboxMode (enable);
        // the testnet is a different chain, so the EIP-712 chainId and every verifying contract
        // change with it - and the venue serves the testnet without an api key
        this.options['sandboxMode'] = enable;
        this.options['chainId'] = (enable) ? 97 : 56;
        this.requiredCredentials['apiKey'] = !enable;
        // a token minted for one host is not valid on the other
        this.options['jwtToken'] = undefined;
        this.options['jwtTokenExpiresAt'] = 0;
    }

    /**
     * @ignore
     * @method
     * @name predictfun#hashMessage
     * @description hashes a message the way eth_personal_sign does, prefixing it before the keccak
     * @param {string} message the message to hash
     * @returns {string} the 0x prefixed hash
     */
    hashMessage (message: string): string {
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
     * @name predictfun#signHash
     * @description signs a 32 byte hash with the wallet's private key
     * @param {string} hash the hash to sign
     * @param {string} privateKey the wallet private key
     * @returns {string} the 65 byte signature, 0x prefixed
     */
    signHash (hash: string, privateKey: string): string {
        const signature = ecdsa (hash.slice (-64), privateKey.slice (-64), secp256k1, undefined);
        // assign before padStart so the php str_pad regex matches, it only handles a bare identifier
        const rRaw = signature['r'];
        const sRaw = signature['s'];
        const r = rRaw.padStart (64, '0');
        const s = sRaw.padStart (64, '0');
        // ecrecover wants v in {27,28} while the raw recovery id is {0,1}
        const v = this.intToBase16 (this.sum (27, signature['v']));
        // assign before toLowerCase so the php regex matches, it only handles a bare identifier
        const signatureHex = '0x' + r + s + v;
        return signatureHex.toLowerCase ();
    }

    /**
     * @ignore
     * @method
     * @name predictfun#authenticate
     * @description exchanges a wallet signature for the JWT that authorises order actions, and caches it
     * @see https://dev.predict.fun/get-auth-message-25326899e0
     * @see https://dev.predict.fun/get-jwt-with-valid-signature-25326900e0
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {string} the JWT
     */
    async authenticate (params = {}): Promise<Str> {
        if ((this.walletAddress === undefined) || (this.privateKey === undefined)) {
            throw new ArgumentsRequired (this.id + ' authenticate() requires a walletAddress and a privateKey');
        }
        const now = this.milliseconds ();
        const cached = this.safeString (this.options, 'jwtToken');
        const expiresAt = this.safeInteger (this.options, 'jwtTokenExpiresAt', 0);
        // a token outlives its window silently: the venue answers 401 on every order action once
        // it lapses, so re-issue before that rather than after the first failure
        if ((cached !== undefined) && (now < expiresAt)) {
            return cached;
        }
        const messageResponse = await this.predictfunGetV1AuthMessage (params);
        //
        //     { "data": { "message": "Sign this message to authenticate ..." }, "success": true }
        //
        const messageData = this.safeDict (messageResponse, 'data', {});
        const message = this.safeString (messageData, 'message');
        if (message === undefined) {
            throw new AuthenticationError (this.id + ' authenticate() could not read the message to sign');
        }
        const signature = this.signHash (this.hashMessage (message), this.privateKey);
        const request: Dict = {
            'signer': this.walletAddress,
            'message': message,
            'signature': signature,
        };
        const response = await this.predictfunPostV1Auth (request);
        //
        //     { "data": { "token": "eyJhbGciOi..." }, "success": true }
        //
        const data = this.safeDict (response, 'data', {});
        const token = this.safeString (data, 'token');
        if (token === undefined) {
            throw new AuthenticationError (this.id + ' authenticate() did not return a token');
        }
        this.options['jwtToken'] = token;
        // measured from before the round trip, so the cached window closes a little early rather
        // than a little late
        const tokenExpiresIn = this.safeInteger (this.options, 'tokenExpiresIn', 86400000);
        this.options['jwtTokenExpiresAt'] = this.sum (now, tokenExpiresIn);
        return token;
    }

    /**
     * @ignore
     * @method
     * @name predictfun#signPredictfunOrder
     * @description signs a contract order with the EIP-712 scheme of the exchange that settles it
     * @param {object} order the contract order, as sent to the venue
     * @param {bool} isNegRisk whether the market settles through the negative risk exchange
     * @param {bool} isYieldBearing whether the market settles through the yield bearing exchange
     * @returns {object} a dictionary with the order hash and the signature
     */
    signPredictfunOrder (order: Dict, isNegRisk: boolean, isYieldBearing: boolean): Dict {
        // chainIdValue, not chainId - the php regex transpiler rewrites the substring "chainId"
        // inside the domain literal to a local var, which would corrupt the domain type hash
        const chainIdValue = this.safeInteger (this.options, 'chainId', 56);
        const verifyingContract = this.exchangeAddress (isNegRisk, isYieldBearing);
        const domain: Dict = {
            'name': 'predict.fun CTF Exchange',
            'version': '1',
            'chainId': chainIdValue,
            'verifyingContract': verifyingContract,
        };
        const orderStruct = [
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
        ];
        // ethEncodeStructuredData returns the EIP-712 digest, which is both what gets signed and
        // the order hash the venue indexes the order by
        const encoded = this.ethEncodeStructuredData (domain, { 'Order': orderStruct }, order);
        // ethEncodeStructuredData returns the 0x1901 || domainSeparator || structHash preimage,
        // the digest that gets signed - and that the venue indexes the order by - is its keccak
        const hash = '0x' + this.hash (encoded, keccak, 'hex');
        return {
            'hash': hash,
            'signature': this.signHash (hash, this.privateKey),
        };
    }

    /**
     * @method
     * @name predictfun#createOrder
     * @description creates a LIMIT or MARKET order on a single prediction outcome token
     * @see https://dev.predict.fun/create-an-order-32534694e0
     * @param {string} outcome unified outcome handle, or an outcome token id
     * @param {string} type 'limit' or 'market'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount the number of outcome shares
     * @param {float} [price] the price per share between 0 and 1, required for a limit order; a market order without one is signed at 0.99 to buy or 0.01 to sell, the worst price it accepts
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.expiration] unix timestamp in seconds the limit order expires at
     * @param {bool} [params.postOnly] reject the order if it would take liquidity
     * @param {bool} [params.isFillOrKill] fill the order completely or cancel it
     * @param {string} [params.slippageBps] slippage tolerance for a market order, in basis points
     * @param {string} [params.selfTradePrevention] 'CANCEL_MAKER' | 'CANCEL_TAKER' | 'CANCEL_BOTH'
     * @param {string} [params.salt] order salt, pin it to retry an order idempotently
     * @param {string} [params.nonce] the maker's on chain nonce, defaults to 0
     * @param {string} [params.feeRateBps] fee in basis points, read from the market when omitted
     * @param {bool} [params.isNegRisk] override the market's negative risk flag
     * @param {bool} [params.isYieldBearing] override the market's yield bearing flag
     * @returns {object} an [order structure](https://docs.ccxt.com/#/?id=order-structure)
     */
    override async createOrder (outcome: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}): Promise<PredictionOrder> {
        await this.authenticate ();
        await this.loadOutcome (outcome);
        const outcomeObj = this.outcome (outcome);
        const tokenId = this.safeString (outcomeObj, 'outcomeId');
        if (tokenId === undefined) {
            throw new ArgumentsRequired (this.id + ' createOrder() could not resolve the on chain token id of ' + outcome);
        }
        const strategy = (type === 'market') ? 'MARKET' : 'LIMIT';
        const isMarket = (strategy === 'MARKET');
        if ((!isMarket) && (price === undefined)) {
            throw new ArgumentsRequired (this.id + ' createOrder() requires a price for a limit order');
        }
        const isBuy = (side === 'buy');
        // amounts cross the wire as collateral wei, the venue truncates the price to three
        // significant digits and the quantity to five, so send what it will actually use
        // the venue sizes an order from both legs and refuses anything else: a limitless style
        // takerAmount sentinel of 1 is rejected as create_order_min_order_value_not_met (the order
        // value is read off the taker leg) and signing at the maximum price of 1 is rejected as
        // create_order_price_out_of_range (it wants 0 < price < 1)
        const amountString: Str = this.numberToString (amount);
        const priceString = this.numberToString (price);
        let priceToProvide = priceString;
        if (price === undefined) {
            // a priceless limit order already threw above, so this is a market order. it still
            // has to name a price, so it takes the aggressive end of the
            // range the venue allows: 0.99 crosses any ask, 0.01 is crossed by any bid. the fill
            // happens at the book's own prices, this is only the worst price the order accepts -
            // which is also the collateral the maker leg has to cover
            priceToProvide = (isBuy) ? this.numberToString (this.safeNumber (this.options, 'marketBuyPrice', 0.99)) : this.numberToString (this.safeNumber (this.options, 'marketSellPrice', 0.01));
        }
        const quantityWei = Precise.stringMul (amountString, '1000000000000000000');
        const priceWei = Precise.stringMul (priceToProvide, '1000000000000000000');
        // the collateral leg follows from the price and the size, exactly as for a limit order -
        // both legs have to agree or the venue rejects the order
        const costWei = Precise.stringMul (priceToProvide, quantityWei);
        let makerAmount = quantityWei;
        let takerAmount = costWei;
        if (isBuy) {
            // a buy pays collateral for shares, a sell hands over shares for collateral
            makerAmount = costWei;
            takerAmount = quantityWei;
        }
        const slippageBps = this.safeString (params, 'slippageBps', '0');
        if (Precise.stringGt (slippageBps, '0')) {
            if (isBuy) {
                // widen what the taker is willing to pay, capped at one unit of collateral a share
                makerAmount = Precise.stringMin (Precise.stringDiv (Precise.stringMul (makerAmount, Precise.stringAdd ('10000', slippageBps)), '10000'), quantityWei);
            } else {
                takerAmount = Precise.stringMax (Precise.stringDiv (Precise.stringMul (takerAmount, Precise.stringSub ('10000', slippageBps)), '10000'), '0');
            }
        }
        // feeRateBps and the two exchange selectors live on the market row, not on the outcome
        // row - signing with the wrong pair places the order under a different verifying contract
        // and the venue answers create_order_hash_mismatch
        const marketSymbol = this.safeString (outcomeObj, 'market');
        const marketObj = this.safeDict (this.markets, marketSymbol, {});
        const marketRow = this.safeDict (marketObj, 'info', {});
        const marketFeeRateBps = this.safeString (marketRow, 'feeRateBps', '200');  // should be at least 200
        const feeRateBps = this.safeString (params, 'feeRateBps', marketFeeRateBps);
        const marketIsNegRisk = this.safeBool (marketRow, 'isNegRisk', false);
        const isNegRisk = this.safeBool (params, 'isNegRisk', marketIsNegRisk);
        const marketIsYieldBearing = this.safeBool (marketRow, 'isYieldBearing', false);
        const isYieldBearing = this.safeBool (params, 'isYieldBearing', marketIsYieldBearing);
        const defaultExpiration = this.safeInteger (this.options, 'defaultExpiration', 3600); // 1 hour
        let expirationDelta = defaultExpiration;
        let expiration = this.safeInteger (params, 'expiration');
        if (expiration === undefined) {
            if (isMarket) {
                expirationDelta = this.safeInteger (this.options, 'marketOrderExpiration', defaultExpiration);
            }
            const now = this.seconds ();
            expiration = this.sum (now, expirationDelta);
        }
        // a distinct salt per order so two identical orders do not collide on the venue
        const salt = this.safeString (params, 'salt', this.numberToString (this.milliseconds ()));
        let taker = '0x0000000000000000000000000000000000000000';
        [ taker, params ] = this.handleOptionAndParams (params, 'createOrder', 'taker', taker);
        const contractOrder: Dict = {
            'salt': salt,
            'maker': this.walletAddress,
            'signer': this.walletAddress,
            'taker': taker,
            'tokenId': tokenId,
            'makerAmount': this.decimalToPrecision (makerAmount, TRUNCATE, 0, DECIMAL_PLACES),
            'takerAmount': this.decimalToPrecision (takerAmount, TRUNCATE, 0, DECIMAL_PLACES),
            'expiration': expiration,
            'nonce': this.safeString (params, 'nonce', '0'),
            'feeRateBps': feeRateBps,
            'side': isBuy ? 0 : 1,
            'signatureType': 0, // EOA
        };
        const signed = this.signPredictfunOrder (contractOrder, isNegRisk, isYieldBearing);
        const orderPayload = this.extend (contractOrder, {
            'hash': this.safeString (signed, 'hash'),
            'signature': this.safeString (signed, 'signature'),
        });
        const data: Dict = {
            'order': orderPayload,
            'pricePerShare': this.decimalToPrecision (priceWei, TRUNCATE, 0, DECIMAL_PLACES),
            'strategy': strategy,
        };
        let postOnly = this.safeBool (params, 'isPostOnly', false);
        [ postOnly, params ] = this.handlePostOnly (isMarket, postOnly, params);
        if (postOnly) {
            data['isPostOnly'] = postOnly;
        }
        const timeInForce = this.safeStringUpper (params, 'timeInForce');
        if (timeInForce === 'FOK') {
            data['isFillOrKill'] = true;
        }
        // documented, and the venue takes it inside data rather than as a top level key
        const selfTradePrevention = this.safeStringUpper (params, 'selfTradePrevention');
        if (selfTradePrevention !== undefined) {
            data['selfTradePrevention'] = selfTradePrevention;
        }
        // every param the method consumes itself has to come out, otherwise it survives into the
        // extend below and is posted as a top level key next to 'data'
        params = this.omit (params, [ 'isPostOnly', 'timeInForce', 'isFillOrKill', 'feeRateBps', 'isNegRisk', 'isYieldBearing', 'slippageBps', 'salt', 'nonce', 'expiration', 'selfTradePrevention', 'taker' ]);
        // the JWT authorises the order, the api key only authorises the request
        const request: Dict = {
            'data': data,
        };
        const response = await this.predictfunPostV1Orders (this.extend (request, params));
        //
        //     {
        //         "data": {
        //             "code": "OK",
        //             "orderHash": "0x5ae1a7893b1a804530151dec3866cd0bb8ffe4e4c3640aca1b3ab5ef26c57747",
        //             "orderId": "415535",
        //             "removalLockedUntil": null
        //         },
        //         "success ": true
        //     }
        //
        const result = this.safeDict (response, 'data', {});
        // the venue answers with an id and a hash and nothing else - no price, size, side or
        // status - so the returned order is built from what was requested and signed, with only
        // the identifiers taken from the response
        return this.safePredictionOrder ({
            'id': this.safeString2 (result, 'orderHash', 'hash'),
            'clientOrderId': undefined,
            'info': response,
            'timestamp': undefined,
            'datetime': undefined,
            'status': undefined,
            'outcome': this.safeString (outcomeObj, 'outcome', outcome),
            'outcomeId': this.safeString (outcomeObj, 'outcomeId'),
            'label': this.safeString (outcomeObj, 'label'),
            'market': this.safeString (outcomeObj, 'market'),
            'event': this.safeString (outcomeObj, 'event'),
            'type': type,
            'side': side,
            // the price actually signed, which for a market order is the 0.99 / 0.01 default
            'price': this.parseNumber (priceString),
            'amount': this.parseNumber (amountString),
            'filled': undefined,
            'remaining': undefined,
            'cost': undefined,
            'fee': undefined,
            'trades': [],
        });
    }

    /**
     * @method
     * @name predictfun#fetchPositions
     * @description fetches the outcome shares the wallet holds
     * @see https://dev.predict.fun/get-positions-32675933e0
     * @see https://dev.predict.fun/get-positions-by-address-32675934e0
     * @param {string[]} [outcomes] unified outcome handles to keep, all of them when omitted
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.address] read another wallet's positions, which needs no JWT
     * @param {string} [params.marketId] only positions on this market
     * @param {bool} [params.isResolved] only resolved, or only unresolved, positions
     * @param {string} [params.sort] 'AMOUNT_DESC' | 'EVENT_BLOCK_ASC' | 'EVENT_BLOCK_DESC' | 'SHARES_VALUE_DESC' | 'RETURN_DESC'
     * @param {int} [params.first] the maximum number of positions to return
     * @param {string} [params.after] cursor from a previous response
     * @returns {object[]} a list of [position structures](https://docs.ccxt.com/#/?id=position-structure)
     */
    override async fetchPositions (outcomes: Strings = undefined, params = {}): Promise<PredictionPosition[]> {
        let outcomesLength = 0;
        if (outcomes !== undefined) {
            outcomesLength = outcomes.length;
            await this.loadOutcomes (outcomes);
        }
        const address = this.safeString (params, 'address');
        let response = undefined;
        if (address !== undefined) {
            // the by-address endpoint reads any wallet and is happy with just the api key
            const request: Dict = {
                'address': address,
            };
            const rest = this.omit (params, 'address');
            response = await this.predictfunGetV1PositionsAddress (this.extend (request, rest));
        } else {
            // the JWT is what names the wallet whose positions come back
            await this.authenticate ();
            response = await this.predictfunGetV1Positions (params);
        }
        //
        //     {
        //         "cursor": "eyJtYXJrZXRJZCI6MjAzMjU3OCwib3V0Y29tZUlkIjo0MDAyOTQ3fQ==",
        //         "data": [
        //             {
        //                 "id": "eyJtYXJrZXRJZCI6MjAzMjU4MSwib3V0Y29tZUlkIjo0MDAyOTUyfQ==",
        //                 "amount": "11819508771929824562",
        //                 "averageBuyPriceUsd": "0.57",
        //                 "pnlUsd": 0,
        //                 "valueUsd": 6.74,
        //                 "market": { "id": 2032581, "categorySlug": "btc-updown-5m-1788776400", "status": "REGISTERED", "tradingStatus": "OPEN" },
        //                 "outcome": {
        //                     "indexSet": 1,
        //                     "name": "Up",
        //                     "onChainId": "104613341090911893615899927839535241203421132680281479852748534361460565051967",
        //                     "status": null,
        //                     "bestBid": { "price": 0.57, "size": 192.88842738205366 },
        //                     "bestAsk": { "price": 0.58, "size": 58 }
        //                 }
        //             }
        //         ],
        //         "success": true
        //     }
        //
        const rows = this.safeList (response, 'data', []);
        const parsed = this.parsePredictionPositions (rows);
        if (outcomesLength === 0) {
            return parsed;
        }
        // the venue filters by marketId only, so a set of outcome handles is applied here
        const wanted: Dict = {};
        const wantedOutcomes = this.toArray (outcomes);
        for (let i = 0; i < outcomesLength; i++) {
            const outcomeObj = this.outcome (wantedOutcomes[i]);
            const wantedId = this.safeString (outcomeObj, 'outcomeId', '');
            wanted[wantedId] = true;
        }
        const result: PredictionPosition[] = [];
        const parsedLength = parsed.length;
        for (let i = 0; i < parsedLength; i++) {
            const position = parsed[i];
            const outcomeId = this.safeString (position, 'outcomeId');
            if ((outcomeId !== undefined) && (outcomeId in wanted)) {
                result.push (position);
            }
        }
        return result;
    }

    /**
     * @method
     * @name predictfun#fetchPosition
     * @description fetches the shares the wallet holds of a single outcome
     * @see https://dev.predict.fun/get-positions-32675933e0
     * @param {string} outcome unified outcome handle, or an outcome token id
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.address] read another wallet's position, which needs no JWT
     * @returns {object} a [position structure](https://docs.ccxt.com/#/?id=position-structure)
     */
    override async fetchPosition (outcome: string, params = {}): Promise<PredictionPosition> {
        await this.loadOutcome (outcome);
        const outcomeObj = this.outcome (outcome);
        const info = this.safeDict (outcomeObj, 'info', {});
        // scope the call to the outcome's market so the wallet's other positions are not paged through
        const request: Dict = {
            'marketId': this.safeString (info, 'marketId'),
        };
        const positions = await this.fetchPositions ([ outcome ], this.extend (request, params));
        // holding none of an outcome is an ordinary read, so the empty slot is returned rather
        // than raised - the same shape polymarket and binance answer with
        return this.safeDict (positions, 0) as PredictionPosition;
    }

    /**
     * @ignore
     * @method
     * @name predictfun#parsePredictionPosition
     * @description parses a raw position row into the unified position structure
     * @param {object} position the raw position row
     * @param {object} [market] not used by predictfun parsePredictionPosition
     * @returns {object} a [position structure](https://docs.ccxt.com/#/?id=position-structure)
     */
    override parsePredictionPosition (position: Dict, market: Market = undefined): PredictionPosition {
        const rawOutcome = this.safeDict (position, 'outcome', {});
        const rawMarket = this.safeDict (position, 'market', {});
        const tokenId = this.safeString (rawOutcome, 'onChainId');
        const outcomeObj = this.safeOutcome (tokenId, market);
        // shares are collateral wei, the usd figures come back already scaled
        const contracts = Precise.stringDiv (this.safeString (position, 'amount'), '1000000000000000000');
        const entryPrice = this.safeString (position, 'averageBuyPriceUsd');
        const notional = this.safeString (position, 'valueUsd');
        const pnl = this.safeString (position, 'pnlUsd');
        // what the shares cost, which is also the collateral committed to the position
        const collateral = Precise.stringMul (entryPrice, contracts);
        let markPrice: Str = undefined;
        if ((notional !== undefined) && (contracts !== undefined) && Precise.stringGt (contracts, '0')) {
            markPrice = Precise.stringDiv (notional, contracts);
        }
        let percentage: Str = undefined;
        if ((pnl !== undefined) && (collateral !== undefined) && Precise.stringGt (collateral, '0')) {
            percentage = Precise.stringMul (Precise.stringDiv (pnl, collateral), '100');
        }
        // a settled outcome reports WON or LOST, an open one leaves the field null - and the
        // market can read RESOLVED while the outcome has not been marked yet, so the two are
        // tracked apart: the position is resolved, but which side won is not yet known
        const outcomeStatus = this.safeString (rawOutcome, 'status');
        const marketStatus = this.safeString (rawMarket, 'status');
        const settled = (outcomeStatus === 'WON') || (outcomeStatus === 'LOST');
        const resolved = settled || (marketStatus === 'RESOLVED') || (marketStatus === 'SETTLED');
        let won: Bool = undefined;
        let settleFraction: Str = undefined;
        let payout: Str = undefined;
        if (settled) {
            won = (outcomeStatus === 'WON');
            settleFraction = (won) ? '1' : '0';
            // a winning share redeems for one unit of collateral, a losing one for nothing
            payout = (won) ? contracts : '0';
        }
        // pnl is realized once the market has resolved, unrealized while it is still trading
        let realizedPnl: Str = undefined;
        let unrealizedPnl: Str = pnl;
        if (resolved) {
            realizedPnl = pnl;
            unrealizedPnl = undefined;
        }
        return this.safePredictionPosition ({
            'id': this.safeString (position, 'id'),
            'timestamp': undefined,
            'datetime': undefined,
            'contracts': this.parseNumber (contracts),
            'contractSize': 1,
            'side': 'long', // holding outcome shares is always a long, the short of an outcome is the other side
            'notional': this.parseNumber (notional),
            'unrealizedPnl': this.parseNumber (unrealizedPnl),
            'realizedPnl': this.parseNumber (realizedPnl),
            'collateral': this.parseNumber (collateral),
            'entryPrice': this.parseNumber (entryPrice),
            'markPrice': this.parseNumber (markPrice),
            'lastPrice': undefined,
            'percentage': this.parseNumber (percentage),
            'resolved': resolved,
            'won': won,
            'settleFraction': this.parseNumber (settleFraction),
            'payout': this.parseNumber (payout),
            'outcome': this.safeOutcomeSymbol (undefined, outcomeObj),
            'outcomeId': this.safeString (outcomeObj, 'outcomeId', tokenId),
            'label': this.safeString (outcomeObj, 'label', this.safeStringUpper (rawOutcome, 'name')),
            'market': this.safeString (outcomeObj, 'market'),
            'event': this.safeString (outcomeObj, 'event'),
            'info': position,
        });
    }

    /**
     * @method
     * @name predictfun#cancelOrder
     * @description removes one of your own orders from the order book
     * @see https://dev.predict.fun/remove-orders-by-hash-38139973e0
     * @param {string} id the order hash, as returned by createOrder
     * @param {string} [outcome] unified outcome handle the order belongs to
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure](https://docs.ccxt.com/#/?id=order-structure)
     */
    override async cancelOrder (id: string, outcome: Str = undefined, params = {}): Promise<PredictionOrder> {
        const orders = await this.cancelOrders ([ id ], outcome, params);
        const order = this.safeDict (orders, 0);
        if (order === undefined) {
            throw new OrderNotFound (this.id + ' cancelOrder() could not remove ' + id);
        }
        return order as PredictionOrder;
    }

    /**
     * @method
     * @name predictfun#cancelOrders
     * @description removes several of your own orders from the order book, up to a hundred at a time
     * @see https://dev.predict.fun/remove-orders-by-hash-38139973e0
     * @param {string[]} ids the order hashes, as returned by createOrder
     * @param {string} [outcome] unified outcome handle the orders belong to
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)
     */
    override async cancelOrders (ids: string[], outcome: Str = undefined, params = {}): Promise<PredictionOrder[]> {
        let outcomeObj = undefined;
        if (outcome !== undefined) {
            await this.loadOutcome (outcome);
            outcomeObj = this.outcome (outcome);
        }
        const idsLength = ids.length;
        if (idsLength === 0) {
            throw new ArgumentsRequired (this.id + ' cancelOrders() requires at least one order hash');
        }
        if (idsLength > 100) {
            throw new BadRequest (this.id + ' cancelOrders() takes at most 100 order hashes per call');
        }
        // the JWT identifies the signer whose orders may be pulled
        await this.authenticate ();
        const request: Dict = {
            'data': {
                'hashes': ids,
            },
        };
        // this only pulls the orders off the book, it does not cancel them on chain
        const response = await this.predictfunPostV1OrdersRemoveByHash (this.extend (request, params));
        //
        //     {
        //         "removed": [ "0xebf11bdff189b8609c9ae66bebb20b94742865a2d94970856f3fb6b0896f9ec0" ],
        //         "rejected": [],
        //         "noop": [ "0x00de1b3b4d8647c371022c3b952c82d89298ed3746d4677e582ef9808bbdc6cf" ],
        //         "success": true
        //     }
        //
        const rejected = this.safeList (response, 'rejected', []);
        const rejectedLength = rejected.length;
        if (rejectedLength > 0) {
            throw new OrderNotFound (this.id + ' cancelOrders() was refused for ' + this.json (rejected));
        }
        // the venue reports hashes only, so each one becomes a row the shared order parser can
        // read: it takes the hash off orderHash and the status through parseOrderStatus
        const removed = this.safeList (response, 'removed', []);
        const noop = this.safeList (response, 'noop', []);
        const rows: Dict[] = [];
        const removedLength = removed.length;
        for (let i = 0; i < removedLength; i++) {
            rows.push (this.extend (response, { 'orderHash': removed[i], 'status': 'CANCELLED' }));
        }
        const noopLength = noop.length;
        for (let i = 0; i < noopLength; i++) {
            // accepted, but nothing was resting to pull: the order had already filled, expired,
            // was never booked, or had been removed before - so the status is left unknown
            rows.push (this.extend (response, { 'orderHash': noop[i] }));
        }
        return this.parsePredictionOrders (rows, outcomeObj);
    }

    /**
     * @method
     * @name predictfun#fetchOrder
     * @description fetches one of your own orders by its hash
     * @see https://dev.predict.fun/get-order-by-hash-25326901e0
     * @param {string} id the order hash
     * @param {string} [outcome] unified outcome handle the order belongs to, resolved from the order when omitted
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure](https://docs.ccxt.com/#/?id=order-structure)
     */
    async fetchOrder (id: Str, outcome: Str = undefined, params = {}): Promise<PredictionOrder> {
        await this.authenticate ();
        let outcomeObj = undefined;
        if (outcome !== undefined) {
            await this.loadOutcome (outcome);
            outcomeObj = this.outcome (outcome);
        }
        // the JWT identifies the wallet whose orders can be read
        const request: Dict = {
            'hash': id,
        };
        const response = await this.predictfunGetV1OrdersHash (this.extend (request, params));
        //
        //     {
        //         "data": {
        //             "amount": "10000000000000000000",
        //             "amountFilled": "0",
        //             "currency": "USDT",
        //             "id": "415537",
        //             "isNegRisk": false,
        //             "isYieldBearing": true,
        //             "marketId": 2004048,
        //             "order": {
        //             "expiration": 1788717567,
        //             "feeRateBps": "200",
        //             "hash": "0xd0933a7528d1f4d8f82861a097a8e44298806f072a76bc9ec9c423707c94dfe7",
        //             "maker": "0x78C7b44105eB616B48d4A4328D4Ded1c3B53AF31",
        //             "makerAmount": "5000000000000000000",
        //             "nonce": "0",
        //             "salt": "1788713967425",
        //             "side": 0,
        //             "signature": "0x019cfd569d6d678a5ba900d43d93dfd55b3ef98c38d5b9bd243ac356a1fbffaa351e417d534195aa43bf20f07c6b82c25e7c49591f7c74565c3b9fa75b298bbb1c",
        //             "signatureType": 0,
        //             "signer": "0x78C7b44105eB616B48d4A4328D4Ded1c3B53AF31",
        //             "taker": "0x0000000000000000000000000000000000000000",
        //             "takerAmount": "10000000000000000000",
        //             "tokenId": "21794117812663370870023674333212505719146120894214542748572818978538793884650"},
        //             "rewardEarningRate": 0,
        //             "status": "CANCELLED",
        //             "strategy": "LIMIT"
        //         },
        //         "success": true
        //     }
        //
        const data = this.safeDict (response, 'data', {});
        return this.parsePredictionOrder (data, outcomeObj);
    }

    /**
     * @method
     * @name predictfun#fetchOpenOrders
     * @description fetches your own orders that are still resting on the book (only limit orders can be fetched)
     * @see https://dev.predict.fun/get-orders-25326902e0
     * @param {string} [outcome] unified outcome handle to filter by, all outcomes when omitted
     * @param {int} [since] not used by predictfun fetchOpenOrders, the venue returns no order timestamps
     * @param {int} [limit] the maximum number of orders to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.after] cursor from a previous response, the venue pages back from the newest order
     * @returns {object[]} a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)
     */
    override async fetchOpenOrders (outcome: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<PredictionOrder[]> {
        const request: Dict = {
            'status': 'OPEN',
        };
        return await this.fetchOrdersHelper (outcome, since, limit, this.extend (request, params));
    }

    /**
     * @method
     * @name predictfun#fetchClosedOrders
     * @description fetches your own orders that filled (only limit orders can be fetched)
     * @see https://dev.predict.fun/get-orders-25326902e0
     * @param {string} [outcome] unified outcome handle to filter by, all outcomes when omitted
     * @param {int} [since] not used by predictfun fetchClosedOrders, the venue returns no order timestamps
     * @param {int} [limit] the maximum number of orders to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.after] cursor from a previous response, the venue pages back from the newest order
     * @returns {object[]} a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)
     */
    override async fetchClosedOrders (outcome: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<PredictionOrder[]> {
        // the venue's status filter is an enum of OPEN and FILLED only - expired and cancelled
        // orders cannot be asked for, so a closed order here means one that filled
        const request: Dict = {
            'status': 'FILLED',
        };
        return await this.fetchOrdersHelper (outcome, since, limit, this.extend (request, params));
    }

    /**
     * @ignore
     * @method
     * @name predictfun#fetchOrdersHelper
     * @description fetches your own orders - the venue answers with the open ones unless a status is named, so each public method passes its own
     * @see https://dev.predict.fun/get-orders-25326902e0
     * @param {string} [outcome] unified outcome handle to filter by, all outcomes when omitted
     * @param {int} [since] not used by predictfun, the venue returns no order timestamps
     * @param {int} [limit] the maximum number of orders to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.status] 'OPEN' | 'FILLED' | 'EXPIRED' | 'CANCELLED'
     * @param {string} [params.after] cursor from a previous response, the venue pages back from the newest order
     * @returns {object[]} a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)
     */
    async fetchOrdersHelper (outcome: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<PredictionOrder[]> {
        let outcomeObj = undefined;
        if (outcome !== undefined) {
            await this.loadOutcome (outcome);
            outcomeObj = this.outcome (outcome);
        }
        // the JWT identifies the wallet whose orders are returned
        await this.authenticate ();
        const request: Dict = {};
        const response = await this.predictfunGetV1Orders (this.extend (request, params));
        //
        //     {
        //         "cursor": null,
        //         "data": [
        //             {
        //                 "amount": "10000000000000000000",
        //                 "amountFilled": "0",
        //                 "currency": "USDT",
        //                 "id": "3295357412",
        //                 "isNegRisk": false,
        //                 "isYieldBearing": true,
        //                 "marketId": 2107,
        //                 "order": {
        //                     "expiration": 1788888638,
        //                     "feeRateBps": "200",
        //                     "hash": "0x620e0237aaf75a86facfaa6840cba9d3bff4bb7a9c5606ad404c2a65ffadf14d",
        //                     "maker": "0x9050dfA063D1bE7cA711c750b18D51fDD13e90Ee",
        //                     "makerAmount": "1000000000000000000",
        //                     "nonce": "0",
        //                     "salt": "1788885038954",
        //                     "side": 0,
        //                     "signature": "0x564ea556c53aa58d66497639e82723402fe40fe8214f35ce5963aa5e09fd72e752a35b6bdc616017a55cefd4d34a32005497a0ae324a7d6f30a4998d130b04e81b",
        //                     "signatureType": 0,
        //                     "signer": "0x9050dfA063D1bE7cA711c750b18D51fDD13e90Ee",
        //                     "taker": "0x0000000000000000000000000000000000000000",
        //                     "takerAmount": "10000000000000000000",
        //                     "tokenId": "11755619521560507246941857733124673401539364429068333264940202564484253415073"
        //                 },
        //                 "rewardEarningRate": 0,
        //                 "status": "OPEN",
        //                 "strategy": "LIMIT"
        //             }
        //         ],
        //         "success": true
        //     }
        //
        const data = this.safeList (response, 'data', []);
        // since is deliberately not forwarded: the rows carry no timestamp, so the shared
        // since filter would drop every one of them
        return this.parsePredictionOrders (data, outcomeObj, since, limit);
    }

    /**
     * @ignore
     * @method
     * @name predictfun#parsePredictionOrder
     * @description parses a raw order, as returned by the create and the fetch endpoints, into a unified order
     * @param {object} order the raw order, with the signed contract order nested under 'order'
     * @param {object} [market] the outcome the order belongs to, resolved from the token id when omitted
     * @returns {object} an [order structure](https://docs.ccxt.com/#/?id=order-structure)
     */
    override parsePredictionOrder (order: Dict, market: Market = undefined): PredictionOrder {
        //
        // fetchOrder
        //     {
        //         "amount": "10000000000000000000",
        //         "amountFilled": "0",
        //         "currency": "USDT",
        //         "id": "415537",
        //         "isNegRisk": false,
        //         "isYieldBearing": true,
        //         "marketId": 2004048,
        //         "order": {
        //             "expiration": 1788717567,
        //             "feeRateBps": "200",
        //             "hash": "0xd0933a7528d1f4d8f82861a097a8e44298806f072a76bc9ec9c423707c94dfe7",
        //             "maker": "0x78C7b44105eB616B48d4A4328D4Ded1c3B53AF31",
        //             "makerAmount": "5000000000000000000",
        //             "nonce": "0",
        //             "salt": "1788713967425",
        //             "side": 0,
        //             "signature": "0x019cfd569d6d678a5ba900d43d93dfd55b3ef98c38d5b9bd243ac356a1fbffaa351e417d534195aa43bf20f07c6b82c25e7c49591f7c74565c3b9fa75b298bbb1c",
        //             "signatureType": 0,
        //             "signer": "0x78C7b44105eB616B48d4A4328D4Ded1c3B53AF31",
        //             "taker": "0x0000000000000000000000000000000000000000",
        //             "takerAmount": "10000000000000000000",
        //             "tokenId": "21794117812663370870023674333212505719146120894214542748572818978538793884650"
        //         },
        //         "rewardEarningRate": 0,
        //         "status": "CANCELLED",
        //         "strategy": "LIMIT"
        //     }
        //
        const data = this.safeDict2 (order, 'order', 'data');
        // the fetch endpoints nest the hash inside the contract order, the create endpoint
        // returns it at the top level as orderHash - accept either
        const topLevelHash = this.safeString2 (order, 'hash', 'orderHash');
        const orderHash = this.safeString (data, 'hash', topLevelHash);
        const tokenId = this.safeString (data, 'tokenId');
        const outcomeObj = this.safeOutcome (tokenId, market);
        // the contract order carries the economics: a buy offers collateral for shares while a
        // sell offers shares for collateral, so which leg is the size depends on the side
        const rawSide = this.safeString (data, 'side');
        let side: Str = undefined;
        if ((rawSide === '0') || (rawSide === 'Bid')) {
            side = 'buy';
        } else if ((rawSide === '1') || (rawSide === 'Ask')) {
            side = 'sell';
        }
        const makerAmount = this.safeString (data, 'makerAmount');
        const takerAmount = this.safeString (data, 'takerAmount');
        let amountWei = makerAmount;
        let costWei = takerAmount;
        if (side === 'buy') {
            amountWei = takerAmount;
            costWei = makerAmount;
        }
        const amount = Precise.stringDiv (amountWei, '1000000000000000000');
        const cost = Precise.stringDiv (costWei, '1000000000000000000');
        const type = this.safeStringLower (order, 'strategy');
        let price: Str = undefined;
        // orders show same takerAmount and makerAmount as it was when they were placed
        // the price of market orders will be calculated incorrectly
        // we can calculate price for limit orders only
        if (type === 'limit') {
            price = Precise.stringDiv (cost, amount);
        }
        const amountFilled = this.safeString (order, 'amountFilled');
        const filled = Precise.stringDiv (amountFilled, '1000000000000000000');
        const filledCost = Precise.stringMul (filled, price);
        return this.safePredictionOrder ({
            'id': orderHash,
            'clientOrderId': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'status': this.parseOrderStatus (this.safeString (order, 'status')),
            'type': this.safeStringLower (order, 'strategy'),
            'timeInForce': undefined,
            'side': side,
            'price': price,
            'amount': amount,
            'filled': filled,
            'remaining': undefined,
            'cost': filledCost,
            'fee': undefined,
            'postOnly': this.safeBool (order, 'isPostOnly'),
            'trades': undefined,
            'outcome': this.safeOutcomeSymbol (tokenId, outcomeObj),
            'outcomeId': this.safeString (outcomeObj, 'outcomeId', tokenId),
            'label': this.safeString (outcomeObj, 'label'),
            'market': this.safeString (outcomeObj, 'market'),
            'event': this.safeString (outcomeObj, 'event'),
            'info': order,
        });
    }

    /**
     * @ignore
     * @method
     * @name predictfun#parseOrderStatus
     * @description maps a venue order status onto the unified vocabulary
     * @param {string} [status] the raw status
     * @returns {string} the unified status
     */
    parseOrderStatus (status: Str): Str {
        const statuses: Dict = {
            'OPEN': 'open',
            'PENDING': 'open',
            'MATCHED': 'closed',
            'FILLED': 'closed',
            'CANCELLED': 'canceled',
            'CANCELED': 'canceled',
            'EXPIRED': 'expired',
            'REJECTED': 'rejected',
        };
        return this.safeString (statuses, status, status);
    }

    /**
     * @ignore
     * @method
     * @name predictfun#handleErrors
     * @description maps the venue's error slugs and messages onto the unified exceptions
     * @param {int} statusCode the http status code
     * @param {string} statusText the http status text
     * @param {string} url the request url
     * @param {string} method the http method
     * @param {object} responseHeaders the response headers
     * @param {string} responseBody the raw response body
     * @param {object} response the parsed response
     * @param {object} requestHeaders the request headers
     * @param {object} requestBody the request body
     * @returns {undefined} nothing, it throws when the venue reported a failure
     */
    override handleErrors (statusCode: Int, statusText: string, url: string, method: string, responseHeaders: Dict, responseBody: string, response: any, requestHeaders: any, requestBody: any) {
        if (response === undefined) {
            return undefined;
        }
        const success = this.safeBool (response, 'success', true);
        if (success) {
            return undefined;
        }
        const feedback = this.id + ' ' + responseBody;
        // the message is matched first because it is the more specific of the two: several
        // distinct failures share a generic slug, notably 'unauthorized', which the venue also
        // returns for a hash belonging to another wallet, and 'not_found' for an unknown market
        const message = this.safeString (response, 'message');
        this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
        // the venue also answers 401 when the request was authorised but acted on someone else's
        // order - that case is matched above and has already thrown, so reaching here with a 401
        // means the credential itself was refused. drop the cached JWT, otherwise a token revoked
        // or aged out before its window closes is replayed for the life of the process
        if (statusCode === 401) {
            this.options['jwtToken'] = undefined;
            this.options['jwtTokenExpiresAt'] = 0;
        }
        const error = this.safeString (response, 'error');
        this.throwExactlyMatchedException (this.exceptions['exact'], error, feedback);
        // a 400 is a rejected request or a business rule, not a transport outage - the base would
        // otherwise map the bare status onto a retryable network error
        if (statusCode === 400) {
            throw new BadRequest (feedback);
        }
        throw new ExchangeError (feedback);
    }

    /**
     * @ignore
     * @method
     * @name predictfun#exchangeAddress
     * @description the exchange contract a market settles through, which is what its orders are signed against and what its collateral has to be approved to
     * @param {bool} isNegRisk whether the market settles through the negative risk exchange
     * @param {bool} isYieldBearing whether the market settles through the yield bearing exchange
     * @returns {string} the contract address on the active chain
     */
    exchangeAddress (isNegRisk: boolean, isYieldBearing: boolean): Str {
        const chainIdValue = this.safeInteger (this.options, 'chainId', 56);
        const exchanges = this.safeDict (this.options, 'exchanges', {});
        const byChain = this.safeDict (exchanges, this.numberToString (chainIdValue), {});
        let identifier = 'CTF_EXCHANGE';
        if (isNegRisk && isYieldBearing) {
            identifier = 'YIELD_BEARING_NEG_RISK_CTF_EXCHANGE';
        } else if (isNegRisk) {
            identifier = 'NEG_RISK_CTF_EXCHANGE';
        } else if (isYieldBearing) {
            identifier = 'YIELD_BEARING_CTF_EXCHANGE';
        }
        return this.safeString (byChain, identifier);
    }

    /**
     * @ignore
     * @method
     * @name predictfun#conditionalTokensAddress
     * @description the ERC-1155 contract a market's outcome shares live in, which is the contract a seller grants the approval on
     * @param {bool} isNegRisk whether the market settles through the negative risk exchange
     * @param {bool} isYieldBearing whether the market settles through the yield bearing exchange
     * @returns {string} the contract address on the active chain
     */
    conditionalTokensAddress (isNegRisk: boolean, isYieldBearing: boolean): Str {
        const chainIdValue = this.safeInteger (this.options, 'chainId', 56);
        const tokens = this.safeDict (this.options, 'conditionalTokens', {});
        const byChain = this.safeDict (tokens, this.numberToString (chainIdValue), {});
        let identifier = 'CONDITIONAL_TOKENS';
        if (isNegRisk && isYieldBearing) {
            identifier = 'YIELD_BEARING_NEG_RISK_CONDITIONAL_TOKENS';
        } else if (isNegRisk) {
            identifier = 'NEG_RISK_CONDITIONAL_TOKENS';
        } else if (isYieldBearing) {
            identifier = 'YIELD_BEARING_CONDITIONAL_TOKENS';
        }
        return this.safeString (byChain, identifier);
    }

    /**
     * @ignore
     * @method
     * @name predictfun#adapterAddress
     * @description the negative risk adapter, which moves a seller's shares itself when a neg risk match mints or merges
     * @param {bool} isYieldBearing whether the market settles through the yield bearing exchange
     * @returns {string} the contract address on the active chain
     */
    adapterAddress (isYieldBearing: boolean): Str {
        const chainIdValue = this.safeInteger (this.options, 'chainId', 56);
        const adapters = this.safeDict (this.options, 'adapters', {});
        const byChain = this.safeDict (adapters, this.numberToString (chainIdValue), {});
        let identifier = 'NEG_RISK_ADAPTER';
        if (isYieldBearing) {
            identifier = 'YIELD_BEARING_NEG_RISK_ADAPTER';
        }
        return this.safeString (byChain, identifier);
    }

    /**
     * @ignore
     * @method
     * @name predictfun#signEvmTransaction
     * @description builds and signs an EIP-1559 transaction, returning the raw signed hex
     * @param {object} tx the transaction fields
     * @param {string} privateKey the wallet private key
     * @returns {string} the signed raw transaction
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
        rHex = this.padHexToEven (rHex);
        sHex = this.padHexToEven (sHex);
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
     * @method
     * @name predictfun#approve
     * @description grants the on-chain approvals a wallet needs before it can trade. The buy side is the USDT allowance the exchange spends, without which every order is refused with create_order_insufficient_collateral_allowance; the sell side is the ERC-1155 approval over the outcome shares themselves. WITHOUT params.amount THE BUY SIDE GRANTS AN UNLIMITED (max uint256) ALLOWANCE, pass params.amount to bound it. sends real transactions signed with the privateKey and waits for each receipt, so the wallet needs BNB for gas
     * @see https://dev.predict.fun/how-to-create-or-cancel-orders-679306m0
     * @param {string} [outcome] unified outcome handle, used to pick the contracts its market settles through
     * @param {object} [params] extra parameters
     * @param {string} [params.side] 'buy' for the collateral allowance (the default), 'sell' for the outcome share approval
     * @param {string} [params.spender] approve this contract instead of resolving it from the outcome
     * @param {string} [params.token] the contract to grant on, defaults to USDT when buying and to the market's conditional tokens when selling
     * @param {float} [params.amount] the allowance in USDT, unlimited when omitted, buy side only
     * @param {bool} [params.approved] pass false to revoke instead of grant, sell side only
     * @param {string} [params.owner] the token holder, defaults to walletAddress or the address of the privateKey
     * @param {string} [params.rpcUrl] the rpc to broadcast through, defaults to the public endpoint for the chain
     * @param {string} [params.gasLimit] gas limit as hex, defaults to 0x186a0
     * @returns {object} the transaction receipt when buying, and the list of receipts when selling - a neg risk market needs two
     */
    async approve (outcome: Str = undefined, params = {}): Promise<any> {
        if (this.privateKey === undefined) {
            throw new ArgumentsRequired (this.id + ' approve() requires a privateKey to sign the on-chain transaction');
        }
        const side = this.safeStringLower (params, 'side', 'buy');
        const chainId = this.safeInteger (this.options, 'chainId', 56);
        const chainKey = this.numberToString (chainId);
        const rpcUrls = this.safeDict (this.options, 'rpcUrls', {});
        const rpcUrl = this.safeString (params, 'rpcUrl', this.safeString (rpcUrls, chainKey));
        let owner = this.safeString (params, 'owner', this.walletAddress);
        if (owner === undefined) {
            owner = this.ethGetAddressFromPrivateKey (this.privateKey);
        }
        const gasLimit = this.safeString (params, 'gasLimit', '0x186a0');
        // which of the four exchanges settles a market is a property of the market, so an
        // approval granted for one of them is worth nothing on the others
        let isNegRisk = false;
        let isYieldBearing = false;
        if (outcome !== undefined) {
            await this.loadOutcome (outcome);
            const outcomeObj = this.outcome (outcome);
            const marketSymbol = this.safeString (outcomeObj, 'market');
            const marketObj = this.safeDict (this.markets, marketSymbol, {});
            const marketRow = this.safeDict (marketObj, 'info', {});
            isNegRisk = this.safeBool (marketRow, 'isNegRisk', false);
            isYieldBearing = this.safeBool (marketRow, 'isYieldBearing', false);
        }
        if (side === 'sell') {
            const ctfToken = this.safeString (params, 'token', this.conditionalTokensAddress (isNegRisk, isYieldBearing));
            const operators: any[] = [];
            const explicitOperator = this.safeString (params, 'spender');
            if (explicitOperator !== undefined) {
                operators.push (explicitOperator);
            } else if (outcome === undefined) {
                throw new ArgumentsRequired (this.id + ' approve() requires an outcome to resolve the contracts to approve for selling, or an explicit spender in params');
            } else {
                operators.push (this.exchangeAddress (isNegRisk, isYieldBearing));
                // a neg risk match mints and merges through the adapter, which moves the seller's
                // shares itself, so approving the exchange alone leaves the sell side half open
                if (isNegRisk) {
                    operators.push (this.adapterAddress (isYieldBearing));
                }
            }
            if ((rpcUrl === undefined) || (ctfToken === undefined)) {
                throw new ArgumentsRequired (this.id + ' approve() could not resolve the rpcUrl or the conditional tokens for chain ' + chainKey);
            }
            const approved = this.safeBool (params, 'approved', true);
            let approvedHex = '0000000000000000000000000000000000000000000000000000000000000000';
            if (approved) {
                approvedHex = '0000000000000000000000000000000000000000000000000000000000000001';
            }
            const receipts: any[] = [];
            const operatorsLength = operators.length;
            for (let i = 0; i < operatorsLength; i++) {
                const operatorAddress = operators[i];
                if (operatorAddress === undefined) {
                    throw new ArgumentsRequired (this.id + ' approve() could not resolve the operator to approve for chain ' + chainKey);
                }
                // setApprovalForAll(operator, approved) -> selector 0xa22cb465
                const approvalData = '0xa22cb465' + this.padHexAddress (operatorAddress) + approvedHex;
                // each receipt is awaited before the next transaction goes out, so the nonce the
                // second one looks up already counts the first
                const approvalHash = await this.sendEvmTransaction (rpcUrl, chainId, owner, ctfToken, '0x0', approvalData, gasLimit);
                const receipt = await this.waitForTransactionReceipt (rpcUrl, approvalHash);
                receipts.push (receipt);
            }
            return receipts;
        }
        const collaterals = this.safeDict (this.options, 'collateral', {});
        const token = this.safeString (params, 'token', this.safeString (collaterals, chainKey));
        let spender = this.safeString (params, 'spender');
        if (spender === undefined) {
            if (outcome === undefined) {
                throw new ArgumentsRequired (this.id + ' approve() requires an outcome to resolve the exchange to approve, or an explicit spender in params');
            }
            spender = this.exchangeAddress (isNegRisk, isYieldBearing);
        }
        if ((rpcUrl === undefined) || (token === undefined) || (spender === undefined)) {
            throw new ArgumentsRequired (this.id + ' approve() could not resolve the rpcUrl, the token or the spender for chain ' + chainKey);
        }
        let amountHex = 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
        const amount = this.safeString (params, 'amount');
        if (amount !== undefined) {
            // the collateral has eighteen decimals, so the scaled amount runs past what a float
            // can hold - it has to stay a string all the way into the bigint
            const scaled = Precise.stringMul (amount, '1000000000000000000');
            const amountInt = this.decimalToPrecision (scaled, TRUNCATE, 0, DECIMAL_PLACES);
            const amountBase16 = this.intToBase16 (this.convertToBigInt (amountInt));
            amountHex = amountBase16.padStart (64, '0');
        }
        // approve(spender, amount) -> selector 0x095ea7b3
        const approveData = '0x095ea7b3' + this.padHexAddress (spender) + amountHex;
        const txHash = await this.sendEvmTransaction (rpcUrl, chainId, owner, token, '0x0', approveData, gasLimit);
        return await this.waitForTransactionReceipt (rpcUrl, txHash);
    }

    /**
     * @ignore
     * @method
     * @name predictfun#sign
     * @description builds the request URL and attaches the api key header required by every endpoint
     * @param {string} path the endpoint path
     * @param {string|string[]} [api] the api group and access level
     * @param {string} [method] HTTP method
     * @param {object} [params] request parameters
     * @param {object} [headers] request headers
     * @param {object} [body] request body
     * @returns {object} a dictionary with url, method, body and headers
     */
    override sign (path: any, api: any = 'predictfun', method = 'GET', params = {}, headers: any = undefined, body: any = undefined) {
        // the venue authenticates every endpoint, so the key is required up front rather than
        // per access level - a key-less request is answered with a 401 by the api gateway.
        // the testnet is the exception, it is served without an api key at all
        const sandboxMode = this.safeBool (this.options, 'sandboxMode', false);
        const apiKey = this.apiKey;
        if ((apiKey === undefined) && !sandboxMode) {
            throw new AuthenticationError (this.id + ' sign() requires an apiKey for all endpoints');
        }
        const apiGroup: string = typeof api === 'string' ? api : api[0];
        const baseUrls = this.urls['api'] as Dict;
        const baseUrl = this.safeString (baseUrls, apiGroup, baseUrls['predictfun'] as string);
        let url = baseUrl + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (method === 'GET') {
            if (Object.keys (query).length > 0) {
                url += '?' + this.urlencode (query);
            }
        }
        const existingHeaders = (headers !== undefined) ? headers : {};
        headers = existingHeaders;
        if ((apiKey !== undefined) && (!sandboxMode)) {
            headers = this.extend ({
                'x-api-key': apiKey,
            }, existingHeaders);
        }
        // the api key authorises the request, the JWT authorises acting for a wallet - authenticate ()
        // caches it, so it is attached to every call once an order action has asked for one
        // the JWT is scoped to one wallet, so it only goes to the endpoints that act for a wallet.
        // attaching it to public reads would hand the venue a wallet credential they do not need.
        // note v1/positions/{address} reads someone else's positions and is deliberately absent,
        // as is v1/orders/matches, which is the public trade feed
        const walletPaths = [
            'v1/orders',
            'v1/orders/{hash}',
            'v1/orders/remove',
            'v1/orders/remove-by-hash',
            'v1/account',
            'v1/account/activity',
            'v1/account/referral',
            'v1/positions',
            'v1/oauth/finalize',
            'v1/oauth/orders',
            'v1/oauth/orders/create',
            'v1/oauth/orders/cancel',
            'v1/oauth/positions',
        ];
        const jwtToken = this.safeString (this.options, 'jwtToken');
        // unlike the api key, the JWT IS required on the testnet: wallet endpoints there answer
        // 401 without it, so it is attached on both hosts
        if ((jwtToken !== undefined) && this.inArray (path, walletPaths)) {
            headers['Authorization'] = 'Bearer ' + jwtToken;
        }
        if (method !== 'GET') {
            if (!sandboxMode) {
                this.checkRequiredCredentials ();
            }
            headers['Content-Type'] = 'application/json';
            body = this.json (params);
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}
