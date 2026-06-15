/// <reference lib="es2015" />
// ---------------------------------------------------------------------------
//
// Myriad Protocol CCXT Exchange adapter  (https://myriad.markets)
//
// Hierarchy:  Questions (events) → Markets (multi-chain, multi-outcome)
//
// Each market becomes one CCXT market with an outcomes list:
//   market.id:     {networkId}:{marketId}
//   market.symbol: SLUG_SHORT
//   outcomes[i].symbol: SLUG_SHORT:OUTCOME_LABEL
//
// Supports Abstract (2741), Linea (59144), BNB Chain (56).
//
// ---------------------------------------------------------------------------

import Exchange from '../abstract/prediction/myriad.js';
import type {
    Int, Str, Dict,
    Strings,
    Market, Ticker, Tickers, OrderBook, OHLCV, Trade, TradingFeeInterface,
    PredictionEvent,
} from '../base/types.js';
import { Precise } from '../base/Precise.js';

// ---------------------------------------------------------------------------

/**
 * @class myriad
 * @augments Exchange
 */
export default class myriad extends Exchange {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'myriad',
            'name': 'Myriad',
            'countries': [],
            'rateLimit': 200,
            'certified': false,
            'pro': false,
            'has': {
                'CORS': undefined,
                'spot': false,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'cancelOrder': false,
                'createOrder': false,
                'fetchBalance': false,
                'fetchCurrencies': false,
                'fetchEvent': true,
                'fetchEvents': true,
                'fetchMarkets': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': false,
                'fetchOrderBook': true,
                'fetchPositions': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
                'fetchTradingFee': true,
                'prediction': true,
            },
            'timeframes': {
                // Myriad maps timeframes to price_chart bucket keys
                '1m': '24h',
                '5m': '24h',
                '15m': '7d',
                '1h': '7d',
                '6h': '30d',
                '1d': '30d',
            },
            'urls': {
                'logo': 'https://myriad.markets/favicon.ico',
                'api': {
                    'myriad': 'https://api-v2.myriadprotocol.com',
                },
                'test': {
                    'myriad': 'https://api-v2.staging.myriadprotocol.com',
                },
                'www': 'https://myriad.markets',
                'doc': [ 'https://docs.myriad.markets' ],
            },
            'api': {
                'myriad': {
                    'public': {
                        'get': {
                            'questions': 1,
                            'questions/{id}': 1,
                            'markets': 1,
                            'markets/{id}': 1,
                            'markets/{networkId}/{id}': 1,
                            'markets/{id}/events': 1,
                            'markets/{id}/orderbook': 1,
                            'markets/{id}/trades': 1,
                            'markets/{id}/holders': 1,
                            'markets/{id}/referrals': 1,
                            'events': 1,
                            'orders/{hash}': 1,
                            'users/{address}/events': 1,
                            'users/{address}/referrals': 1,
                            'users/{address}/portfolio': 1,
                            'users/{address}/markets': 1,
                            'tags': 1,
                            'topics': 1,
                        },
                        'post': {
                            'markets/quote': 1,
                            'markets/claim': 1,
                            'orders': 1,
                            'positions/split': 1,
                            'positions/merge': 1,
                            'positions/redeem': 1,
                            'positions/redeem-voided': 1,
                            'positions/neg-risk/split': 1,
                            'positions/neg-risk/merge': 1,
                        },
                        'delete': {
                            'orders/{hash}': 1,
                        },
                    },
                    'private': {
                        'post': {
                            'markets/quote_with_fee': 1,
                        },
                    },
                },
            },
            'requiredCredentials': {
                'apiKey': true,   // x-api-key header
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': 0.02,
                    'taker': 0.02,
                },
            },
            'options': {
                'defaultFetchMarketsLimit': 50,
                'defaultFetchEventsLimit': 50,
                'defaultMarketStatus': 'open',   // 'open' | 'closed' | 'resolved'
                'networks': {
                    '2741': 'Abstract',
                    '59144': 'Linea',
                    '56': 'BNB Chain',
                },
            },
        });
    }

    /**
     * @method
     * @name myriad#fetchMarkets
     * @description retrieves data on all markets for myriad, each prediction market becomes one market with its outcome tokens listed under the outcomes key
     * @see https://docs.myriad.markets/builders/myriad-api-reference
     * @param {object} [params] extra exchange-specific parameters
     * @param {string[]} [params.queries] search terms used to filter the fetched markets
     * @param {string} [params.state] 'open', 'closed' or 'resolved', the state of the markets to fetch, defaults to 'open'
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets (params = {}): Promise<Market[]> {
        const queries = this.safeList (params, 'queries', []) as any[];
        const rest = this.omit (params, [ 'queries' ]);
        const queriesLength = queries.length;
        let rawMarkets: any[] = [];
        if (queriesLength > 0) {
            rawMarkets = await this.fetchRawMarketsBySearch (queries, rest);
        } else {
            rawMarkets = await this.fetchRawMarketsList (rest);
        }
        const flatMarkets: Market[] = [];
        const eventsDict: Dict = {};
        for (let i = 0; i < rawMarkets.length; i++) {
            const raw = rawMarkets[i];
            const m = this.parseMyriadMarket (raw);
            flatMarkets.push (m);
            const ev = this.parseMarketToEvent (raw, m);
            const evKey = this.safeString (ev, 'symbol');
            if (evKey !== undefined) {
                eventsDict[evKey] = ev;
            }
        }
        this.events = eventsDict;
        return flatMarkets;
    }

    /**
     * @ignore
     * @method
     * @name myriad#fetchRawMarketsBySearch
     * @description fetches raw myriad market objects matching the given search terms via the markets keyword filter
     * @see https://docs.myriad.markets/builders/myriad-api-reference
     * @param {string[]} queries search terms
     * @param {object} [params] extra exchange-specific parameters
     * @param {int} [params.limit] maximum number of markets per query, defaults to 50
     * @param {string} [params.state] 'open', 'closed' or 'resolved', defaults to options.defaultMarketStatus
     * @returns {object[]} an array of raw myriad market objects
     */
    async fetchRawMarketsBySearch (queries: any[], params = {}): Promise<any[]> {
        const limit = this.safeInteger (params, 'limit', this.safeInteger (this.options, 'defaultFetchEventsLimit', 50));
        const state = this.safeString (params, 'state', this.safeString (this.options, 'defaultMarketStatus', 'open'));
        const rest = this.omit (params, [ 'limit', 'state' ]);
        const seen: Dict = {};
        const rawMarkets: any[] = [];
        for (let i = 0; i < queries.length; i++) {
            const q = queries[i];
            const response = await this.myriadPublicGetMarkets (this.extend ({
                'keyword': q,
                'state': state,
                'limit': limit,
            }, rest));
            const foundList = this.safeList (response, 'data', response as any);
            const found = (foundList !== undefined) ? foundList : [];
            for (let j = 0; j < found.length; j++) {
                const raw = found[j];
                const networkId = this.safeString (raw, 'networkId');
                const marketId = this.safeString (raw, 'id');
                const key = networkId + ':' + marketId;
                if (!(key in seen)) {
                    seen[key] = true;
                    rawMarkets.push (raw);
                }
            }
        }
        return rawMarkets;
    }

    /**
     * @ignore
     * @method
     * @name myriad#fetchRawMarketsList
     * @description fetches raw myriad market objects from the paginated markets listing
     * @see https://docs.myriad.markets/builders/myriad-api-reference
     * @param {object} [params] extra exchange-specific parameters
     * @param {string} [params.state] 'open', 'closed' or 'resolved', defaults to options.defaultMarketStatus
     * @returns {object[]} an array of raw myriad market objects
     */
    async fetchRawMarketsList (params = {}): Promise<any[]> {
        const limit = this.safeInteger (this.options, 'defaultFetchMarketsLimit', 50);
        const state = this.safeString2 (params, 'state', 'status', this.safeString (this.options, 'defaultMarketStatus', 'open'));
        const rest = this.omit (params, [ 'state', 'status' ]);
        const allRawMarkets: any[] = [];
        let page = 1;
        while (true) {
            const response = await this.myriadPublicGetMarkets (this.extend ({
                'state': state,
                'limit': limit,
                'page': page,
            }, rest));
            const rawMarketsList = this.safeList (response, 'data', response as any);
            const rawMarkets = (rawMarketsList !== undefined) ? rawMarketsList : [];
            const rawMarketsLength = rawMarkets.length;
            if (rawMarketsLength === 0) {
                break;
            }
            for (let i = 0; i < rawMarketsLength; i++) {
                allRawMarkets.push (rawMarkets[i]);
            }
            page = this.sum (page, 1);
            if (rawMarketsLength < limit) {
                break;
            }
        }
        return allRawMarkets;
    }

    /**
     * @method
     * @name myriad#fetchEvent
     * @description fetches a single prediction-market event by its market id
     * @see https://docs.myriad.markets/builders/myriad-api-reference
     * @param {string} id the market id
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [prediction event structure](https://docs.ccxt.com/#/?id=prediction-event-structure)
     */
    async fetchEvent (id: string, params = {}): Promise<PredictionEvent> {
        // the unified event id is a composite networkId:marketId
        const parts = id.split (':');
        const partsLength = parts.length;
        const request: Dict = {};
        if (partsLength > 1) {
            request['network_id'] = this.safeString (parts, 0);
            request['id'] = this.safeString (parts, 1);
        } else {
            request['id'] = id;
        }
        const response = await this.myriadPublicGetMarketsId (this.extend (request, params));
        const market = this.parseMyriadMarket (response);
        const event: any = this.parseMarketToEvent (response, market);
        return event;
    }

    /**
     * @ignore
     * @method
     * @name myriad#parseMarketToEvent
     * @description wraps a parsed myriad market into a unified event structure
     * @param {object} raw the raw myriad market object
     * @param {object} market the parsed ccxt market
     * @returns {object} an event structure
     */
    parseMarketToEvent (raw: Dict, market: any): any {
        const slug = this.safeString (raw, 'slug', this.safeString (raw, 'id'));
        const state = this.safeString (raw, 'state', 'open');
        const endDate = this.safeString (raw, 'expiresAt');
        return {
            'id': market['id'],
            'slug': slug,
            'symbol': market['symbol'],
            'title': this.safeString2 (raw, 'title', 'shortName'),
            'description': this.safeString (raw, 'description'),
            'markets': [ market ],
            'url': undefined,
            'image': this.safeString (raw, 'imageUrl'),
            'active': (state === 'open'),
            'resolved': (state === 'resolved'),
            'category': undefined,
            'tags': this.safeList (raw, 'topics'),
            'created': this.parse8601 (this.safeString (raw, 'publishedAt')),
            'createdDatetime': this.safeString (raw, 'publishedAt'),
            'end': (endDate !== undefined) ? this.parse8601 (endDate) : undefined,
            'endDatetime': endDate,
            'lastUpdatedAt': undefined,
            'resolutionSource': this.safeString (raw, 'resolutionSource'),
            'info': raw,
        };
    }

    /**
     * @ignore
     * @method
     * @name myriad#parseMyriadMarket
     * @description converts a single raw myriad market into one ccxt market with a list of outcome objects
     * @param {object} raw the raw myriad market object
     * @param {string} [eventSlug] the slug of the parent event
     * @returns {object} a [market structure](https://docs.ccxt.com/#/?id=market-structure)
     */
    parseMyriadMarket (raw: Dict, eventSlug: string = undefined): Market {
        const networkId = this.safeString (raw, 'networkId');
        const marketId = this.safeString (raw, 'id');
        const slug = this.safeString (raw, 'slug', marketId);
        const rawOutcomes = this.safeList (raw, 'outcomes', []) as any[];
        const endDate = this.safeString (raw, 'expiresAt');
        const state = this.safeString (raw, 'state', 'open');
        const active = state === 'open';
        const volume24h = this.safeNumber (raw, 'volume24h');
        const slugBase = (eventSlug !== undefined) ? eventSlug : networkId;
        const marketSymbol = this.slugToMarketSymbol (slugBase, slug);
        const outcomes: any[] = [];
        for (let i = 0; i < rawOutcomes.length; i++) {
            const outcome = this.safeDict (rawOutcomes, i, {});
            const outcomeId = this.safeString (outcome, 'outcomeId', this.safeString (outcome, 'id', i.toString ()));
            const outcomeLabel = this.safeString (outcome, 'label', this.safeString (outcome, 'title', outcomeId));
            const price = this.safeNumber (outcome, 'price');
            outcomes.push ({
                'id': networkId + ':' + marketId + '/' + outcomeId,
                'symbol': this.slugToOutcomeSymbol (slugBase, slug, outcomeLabel),
                'marketSymbol': marketSymbol,
                'label': outcomeLabel,
                'active': active,
                'info': {
                    'networkId': networkId,
                    'marketId': marketId,
                    'slug': slug,
                    'outcomeId': outcomeId,
                    'outcomeLabel': outcomeLabel,
                    'outcomePrice': price,
                    'volume24h': volume24h,
                    'state': state,
                    'tradingModel': this.safeString (raw, 'tradingModel', 'amm'),
                },
            });
        }
        return {
            'id': networkId + ':' + marketId,
            'symbol': marketSymbol,
            'base': slug,
            'quote': 'USDC',
            'settle': undefined,
            'baseId': networkId + ':' + marketId,
            'quoteId': 'USDC',
            'settleId': undefined,
            'type': 'prediction',
            'spot': false,
            'margin': false,
            'swap': false,
            'future': false,
            'option': false,
            'prediction': true,
            'active': active,
            'contract': false,
            'linear': undefined,
            'inverse': undefined,
            'contractSize': undefined,
            'expiry': endDate ? this.parse8601 (endDate) : undefined,
            'expiryDatetime': endDate,
            'strike': undefined,
            'optionType': undefined,
            'taker': 0.02,
            'maker': 0.02,
            'percentage': true,
            'tierBased': false,
            'feeSide': 'get',
            'precision': {
                'amount': 0.01,
                'price': 0.001,
            },
            'limits': {
                'leverage': { 'min': 1, 'max': 1 },
                'amount': { 'min': 0, 'max': undefined },
                'price': { 'min': 0.001, 'max': 0.999 },
                'cost': { 'min': undefined, 'max': undefined },
            },
            'outcomes': outcomes,
            'info': this.extend (raw, {
                'networkId': networkId,
                'marketId': marketId,
                'slug': slug,
                'volume24h': volume24h,
                'state': state,
            }),
            'created': undefined,
        } as unknown as Market;
    }

    /**
     * @method
     * @name myriad#fetchTicker
     * @description fetches the current price for a single outcome by loading the parent market
     * @see https://docs.myriad.markets/builders/myriad-api-reference
     * @param {string} symbol unified outcome symbol like TRUMP_WIN:YES or an outcome id like 2741:756/0
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)
     */
    async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        const outcome = symbol;
        await this.loadMarkets ();
        this.ensureOutcomesLoaded ();
        const outcomeObj = this.outcome (outcome);
        const networkId = this.safeString (outcomeObj['info'], 'networkId');
        const marketId = this.safeString (outcomeObj['info'], 'marketId');
        const request: Dict = {
            'id': marketId,
            'network_id': networkId,
        };
        const response = await this.myriadPublicGetMarketsId (this.extend (request, params));
        //
        //     {
        //         "id": "756",
        //         "networkId": "2741",
        //         "slug": "will-trump-capture-another-president-before-his-birthday",
        //         "title": "Will Trump capture another president before his birthday?",
        //         "description": "string"
        //         "publishedAt": "2026-01-16T18:05:36.000Z",
        //         "expiresAt": "2026-06-14T04:59:00.000Z",
        //         "resolvesAt": null,
        //         "fees": {
        //             "buy": { "fee": "0.01", "treasury_fee": "0.01", "distributor_fee": "0.01" },
        //             "sell": { "fee": "0", "treasury_fee": "0", "distributor_fee": "0" },
        //             "treasury": "0x5E3EbEc100e2294C0EB2264FC96225dF067AAaa3",
        //             "distributor": "0xE44984C586FeBB31605D23b6316cA11B6f4D86b2"
        //         },
        //         "state": "open",
        //         "voided": false,
        //         "resolvedOutcomeId": "-1",
        //         "topics": [ "Politics" ],
        //         "resolutionSource": "https://www.whitehouse.gov/",
        //         "resolutionTitle": "White House",
        //         "token": {
        //             "name": "Bridged USDC (Stargate)",
        //             "address": "0x84A71ccD554Cc1b02749b35d22F684CC8ec987e1",
        //             "symbol": "USDC.e",
        //             "decimals": "6"
        //         },
        //         "imageUrl": "https://cdn.polkamarkets.com/Qma9FAX15kHewT8vm61vykGA9bqQhNdDLvEbQWSp72i3PQ",
        //         "bannerImageUrl": "https://imagedelivery.net/YN1-rdnufJQJCgu3i1CbVw/255d431f-1bb4-4d90-032b-d1f7032e8000/public",
        //         "ogImageUrl": "https://imagedelivery.net/YN1-rdnufJQJCgu3i1CbVw/cf1af79c-07b9-40f0-283b-ed59865b3c00/public",
        //         "liquidity": "2000",
        //         "liquidityPrice": "0.32532445",
        //         "volume": "10891.236893",
        //         "volume24h": "0.939",
        //         "volumeNotional": "13570.426814",
        //         "volumeNotional24h": "1.028382",
        //         "users": "122",
        //         "shares": "4098.474144",
        //         "featured": false,
        //         "featuredAt": null,
        //         "inPlay": false,
        //         "inPlayStartsAt": null,
        //         "perpetual": false,
        //         "moneyline": false,
        //         "executionMode": "0",
        //         "tradingModel": "amm",
        //         "topHolders": [
        //             "0x8A611AEE71b6448a6F99B6001D1234d020f7d546",
        //             "0x2993249A3D107B759c886a4BD4e02B70d471eA9B",
        //             "0x82a5b3BD2A9216369537583f63fa576a1D57c7E7"
        //         ],
        //         "outcomes": [
        //             {
        //                 "id": "0",
        //                 "title": "Yes",
        //                 "shares": "3742.174971",
        //                 "sharesHeld": "138.741271",
        //                 "price": "0.08693459",
        //                 "closingPrice": null,
        //                 "priceChange24h": "0.00045828",
        //                 "imageUrl": "https://cdn.polkamarkets.com/Qma9FAX15kHewT8vm61vykGA9bqQhNdDLvEbQWSp72i3PQ",
        //                 "holders": "7",
        //                 "tokenId": "1512",
        //                 "price_charts": [Array]
        //             },
        //         ],
        //         "eventId": null,
        //         "outcomeIndex": null,
        //         "negRisk": false,
        //         "externalSources": []
        //     }
        //
        return this.parseTicker (response, outcomeObj);
    }

    /**
     * @method
     * @name myriad#fetchTradingFee
     * @description fetches the buy/sell fee rates for a market outcome
     * @see https://docs.myriad.markets/builders/myriad-api-reference
     * @param {string} symbol unified outcome symbol or outcome id
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [fee structure](https://docs.ccxt.com/#/?id=fee-structure)
     */
    async fetchTradingFee (symbol: string, params = {}): Promise<TradingFeeInterface> {
        const outcome = symbol;
        await this.loadMarkets ();
        this.ensureOutcomesLoaded ();
        const outcomeObj = this.outcome (outcome);
        const info = this.safeDict (outcomeObj, 'info', {});
        const request: Dict = {
            'id': this.safeString (info, 'marketId'),
            'network_id': this.safeString (info, 'networkId'),
        };
        const response = await this.myriadPublicGetMarketsId (this.extend (request, params));
        //
        //     {
        //         "fees": {
        //             "buy": { "fee": "0.02", "treasury_fee": "0.01", "distributor_fee": "0.01" },
        //             "sell": { "fee": "0", "treasury_fee": "0", "distributor_fee": "0" }
        //         }
        //     }
        //
        const fees = this.safeDict (response, 'fees', {});
        const buy = this.safeDict (fees, 'buy', {});
        const sell = this.safeDict (fees, 'sell', {});
        return {
            'info': response,
            'symbol': this.safeSymbol (undefined, outcomeObj as any),
            'maker': this.safeNumber (sell, 'fee'),
            'taker': this.safeNumber (buy, 'fee'),
            'percentage': true,
            'tierBased': false,
        };
    }

    /**
     * @ignore
     * @method
     * @name myriad#parseTicker
     * @description parses a raw myriad market object into a unified ticker for the specified outcome
     * @param {object} raw the raw myriad market object
     * @param {object} [market] the outcome object the ticker belongs to
     * @returns {object} a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)
     */
    parseTicker (raw: Dict, market: Market = undefined): Ticker {
        //
        //     {
        //         "id": "756",
        //         "networkId": "2741",
        //         "slug": "will-trump-capture-another-president-before-his-birthday",
        //         "title": "Will Trump capture another president before his birthday?",
        //         "description": "string"
        //         "publishedAt": "2026-01-16T18:05:36.000Z",
        //         "expiresAt": "2026-06-14T04:59:00.000Z",
        //         "resolvesAt": null,
        //         "fees": {
        //             "buy": { "fee": "0.01", "treasury_fee": "0.01", "distributor_fee": "0.01" },
        //             "sell": { "fee": "0", "treasury_fee": "0", "distributor_fee": "0" },
        //             "treasury": "0x5E3EbEc100e2294C0EB2264FC96225dF067AAaa3",
        //             "distributor": "0xE44984C586FeBB31605D23b6316cA11B6f4D86b2"
        //         },
        //         "state": "open",
        //         "voided": false,
        //         "resolvedOutcomeId": "-1",
        //         "topics": [ "Politics" ],
        //         "resolutionSource": "https://www.whitehouse.gov/",
        //         "resolutionTitle": "White House",
        //         "token": {
        //             "name": "Bridged USDC (Stargate)",
        //             "address": "0x84A71ccD554Cc1b02749b35d22F684CC8ec987e1",
        //             "symbol": "USDC.e",
        //             "decimals": "6"
        //         },
        //         "imageUrl": "https://cdn.polkamarkets.com/Qma9FAX15kHewT8vm61vykGA9bqQhNdDLvEbQWSp72i3PQ",
        //         "bannerImageUrl": "https://imagedelivery.net/YN1-rdnufJQJCgu3i1CbVw/255d431f-1bb4-4d90-032b-d1f7032e8000/public",
        //         "ogImageUrl": "https://imagedelivery.net/YN1-rdnufJQJCgu3i1CbVw/cf1af79c-07b9-40f0-283b-ed59865b3c00/public",
        //         "liquidity": "2000",
        //         "liquidityPrice": "0.32532445",
        //         "volume": "10891.236893",
        //         "volume24h": "0.939",
        //         "volumeNotional": "13570.426814",
        //         "volumeNotional24h": "1.028382",
        //         "users": "122",
        //         "shares": "4098.474144",
        //         "featured": false,
        //         "featuredAt": null,
        //         "inPlay": false,
        //         "inPlayStartsAt": null,
        //         "perpetual": false,
        //         "moneyline": false,
        //         "executionMode": "0",
        //         "tradingModel": "amm",
        //         "topHolders": [
        //             "0x8A611AEE71b6448a6F99B6001D1234d020f7d546",
        //             "0x2993249A3D107B759c886a4BD4e02B70d471eA9B",
        //             "0x82a5b3BD2A9216369537583f63fa576a1D57c7E7"
        //         ],
        //         "outcomes": [
        //             {
        //                 "id": "0",
        //                 "title": "Yes",
        //                 "shares": "3742.174971",
        //                 "sharesHeld": "138.741271",
        //                 "price": "0.08693459",
        //                 "closingPrice": null,
        //                 "priceChange24h": "0.00045828",
        //                 "imageUrl": "https://cdn.polkamarkets.com/Qma9FAX15kHewT8vm61vykGA9bqQhNdDLvEbQWSp72i3PQ",
        //                 "holders": "7",
        //                 "tokenId": "1512",
        //                 "price_charts": [Array]
        //             },
        //         ],
        //         "eventId": null,
        //         "outcomeIndex": null,
        //         "negRisk": false,
        //         "externalSources": []
        //     }
        //
        const outcomeId = market ? this.safeString (market['info'], 'outcomeId') : undefined;
        const outcomes = this.safeList (raw, 'outcomes', []) as any[];
        let price = undefined;
        let change = undefined;
        for (let i = 0; i < outcomes.length; i++) {
            const o = outcomes[i];
            if (this.safeString (o, 'outcomeId', this.safeString (o, 'id')) === outcomeId) {
                price = this.safeNumber (o, 'price');
                change = this.safeNumber (o, 'priceChange24h');
                break;
            }
        }
        const now = this.milliseconds ();
        return this.safeTicker ({
            'symbol': this.safeSymbol (undefined, market),
            'timestamp': now,
            'datetime': this.iso8601 (now),
            'high': undefined,
            'low': undefined,
            'bid': price,
            'bidVolume': undefined,
            'ask': price,
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': price,
            'last': price,
            'previousClose': undefined,
            'change': change,
            'percentage': change,
            'average': price,
            'baseVolume': this.safeNumber (raw, 'volume24h'),          // 24h volume in outcome shares
            'quoteVolume': this.safeNumber (raw, 'volumeNotional24h'), // 24h volume in USDC notional
            'info': raw,
        }, market);
    }

    /**
     * @method
     * @name myriad#fetchOrderBook
     * @description fetches the real order book for order-book markets, or synthesizes a one-level book from the AMM price otherwise
     * @see https://docs.myriad.markets/builders/myriad-order-book
     * @param {string} symbol unified outcome symbol like TRUMP_WIN:YES or an outcome id
     * @param {int} [limit] not used by myriad fetchOrderBook
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order book structure](https://docs.ccxt.com/#/?id=order-book-structure)
     */
    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        const outcome = symbol;
        await this.loadMarkets ();
        this.ensureOutcomesLoaded ();
        const outcomeObj = this.outcome (outcome);
        const networkId = this.safeString (outcomeObj['info'], 'networkId');
        const marketId = this.safeString (outcomeObj['info'], 'marketId');
        const outcomeId = this.safeString (outcomeObj['info'], 'outcomeId');
        const tradingModel = this.safeString (outcomeObj['info'], 'tradingModel', 'amm');
        if (tradingModel === 'ob') {
            const obRequest: Dict = {
                'id': marketId,
                'network_id': networkId,
                'outcome': outcomeId,
            };
            const obResponse = await this.myriadPublicGetMarketsIdOrderbook (this.extend (obRequest, params));
            //
            //     {
            //         "bids": [ [ "980000000000000000", "258412594752186597376" ] ],
            //         "asks": [ [ "990000000000000000", "151975683890577539072" ] ]
            //     }
            //
            return this.parseWeiOrderBook (obResponse, this.safeOutcomeSymbol (outcome, outcomeObj));
        }
        const request: Dict = {
            'id': marketId,
            'network_id': networkId,
        };
        const response = await this.myriadPublicGetMarketsId (this.extend (request, params));
        //
        //     {
        //         "id": "756",
        //         "networkId": "2741",
        //         "slug": "will-trump-capture-another-president-before-his-birthday",
        //         "title": "Will Trump capture another president before his birthday?",
        //         "shortName": null,
        //         "description": "### **Market Dates:**"
        //         "publishedAt": "2026-01-16T18:05:36.000Z",
        //         "expiresAt": "2026-06-14T04:59:00.000Z",
        //         "resolvesAt": null,
        //         "fees": {
        //             "buy": { "fee": "0.01", "treasury_fee": "0.01", "distributor_fee": "0.01" },
        //             "sell": { "fee": "0", "treasury_fee": "0", "distributor_fee": "0" },
        //             "treasury": "0x5E3EbEc100e2294C0EB2264FC96225dF067AAaa3",
        //             "distributor": "0xE44984C586FeBB31605D23b6316cA11B6f4D86b2"
        //         },
        //         "state": "open",
        //         "voided": false,
        //         "resolvedOutcomeId": "-1",
        //         "topics": [ "Politics" ],
        //         "resolutionSource": "https://www.whitehouse.gov/",
        //         "resolutionTitle": "White House",
        //         "token": {
        //             "name": "Bridged USDC (Stargate)",
        //             "address": "0x84A71ccD554Cc1b02749b35d22F684CC8ec987e1",
        //             "symbol": "USDC.e",
        //             "decimals": "6"
        //         },
        //         "imageUrl": "https://cdn.polkamarkets.com/Qma9FAX15kHewT8vm61vykGA9bqQhNdDLvEbQWSp72i3PQ",
        //         "bannerImageUrl": "https://imagedelivery.net/YN1-rdnufJQJCgu3i1CbVw/255d431f-1bb4-4d90-032b-d1f7032e8000/public",
        //         "ogImageUrl": "https://imagedelivery.net/YN1-rdnufJQJCgu3i1CbVw/d3d60089-3d08-45ac-aa9d-139156e3f900/public",
        //         "liquidity": "2000",
        //         "liquidityPrice": "0.29322839",
        //         "volume": "11396.236893",
        //         "volume24h": "500",
        //         "volumeNotional": "14101.517862",
        //         "volumeNotional24h": "525.779869",
        //         "users": "124",
        //         "shares": "4547.083096",
        //         "featured": false,
        //         "featuredAt": null,
        //         "inPlay": false,
        //         "inPlayStartsAt": null,
        //         "perpetual": false,
        //         "moneyline": false,
        //         "executionMode": "0",
        //         "tradingModel": "amm",
        //         "topHolders": [
        //             "0x8A611AEE71b6448a6F99B6001D1234d020f7d546",
        //             "0x2993249A3D107B759c886a4BD4e02B70d471eA9B"
        //         ],
        //         "outcomes": [
        //             {
        //                 "id": "0",
        //                 "title": "Yes",
        //                 "shares": "4232.024971",
        //                 "sharesHeld": "138.741271",
        //                 "price": "0.06928796",
        //                 "closingPrice": null,
        //                 "priceChange24h": "-0.20109988",
        //                 "imageUrl": "https://cdn.polkamarkets.com/Qma9FAX15kHewT8vm61vykGA9bqQhNdDLvEbQWSp72i3PQ",
        //                 "holders": "7",
        //                 "tokenId": "1512",
        //                 "price_charts": [Array]
        //             }
        //         ],
        //         "eventId": null,
        //         "outcomeIndex": null,
        //         "negRisk": false,
        //         "externalSources": []
        //     }
        //
        const outcomes = this.safeList (response, 'outcomes', []) as any[];
        let price = undefined;
        for (let i = 0; i < outcomes.length; i++) {
            const o = outcomes[i];
            if (this.safeString (o, 'outcomeId', this.safeString (o, 'id')) === outcomeId) {
                price = this.safeNumber (o, 'price');
                break;
            }
        }
        const timestamp = this.milliseconds ();
        // AMM: synthesize a single bid/ask pair around the current implied price, clamped into the valid (0, 1) range
        let bid = undefined;
        let ask = undefined;
        if (price !== undefined) {
            if (price > 0.001) {
                bid = this.parseNumber (Precise.stringSub (this.numberToString (price), '0.001'));
            }
            if (price < 0.999) {
                ask = this.parseNumber (Precise.stringAdd (this.numberToString (price), '0.001'));
            }
        }
        // the synthetic size must be a parsed float, an int literal breaks the typed go wrapper conversion
        const synthSize = this.parseNumber ('9999');
        const bids: any[] = [];
        if (bid !== undefined) {
            bids.push ([ bid, synthSize ]);
        }
        const asks: any[] = [];
        if (ask !== undefined) {
            asks.push ([ ask, synthSize ]);
        }
        return {
            'symbol': this.safeOutcomeSymbol (outcome, outcomeObj),
            'bids': bids,
            'asks': asks,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'nonce': undefined,
        } as unknown as OrderBook;
    }

    /**
     * @ignore
     * @method
     * @name myriad#parseWeiOrderBook
     * @description parses an order book whose price and amount levels are 1e18-scaled integer strings
     * @param {object} response the raw orderbook response with bids and asks arrays
     * @param {string} symbol the unified outcome symbol of the order book
     * @returns {object} an [order book structure](https://docs.ccxt.com/#/?id=order-book-structure)
     */
    parseWeiOrderBook (response: Dict, symbol: Str): OrderBook {
        const rawBids = this.safeList (response, 'bids', []) as any[];
        const rawAsks = this.safeList (response, 'asks', []) as any[];
        const bids: any[] = [];
        for (let i = 0; i < rawBids.length; i++) {
            const row = rawBids[i];
            const rowPrice = Precise.stringDiv (this.safeString (row, 0), '1000000000000000000');
            const rowAmount = Precise.stringDiv (this.safeString (row, 1), '1000000000000000000');
            bids.push ([ this.parseNumber (rowPrice), this.parseNumber (rowAmount) ]);
        }
        const asks: any[] = [];
        for (let i = 0; i < rawAsks.length; i++) {
            const row = rawAsks[i];
            const rowPrice = Precise.stringDiv (this.safeString (row, 0), '1000000000000000000');
            const rowAmount = Precise.stringDiv (this.safeString (row, 1), '1000000000000000000');
            asks.push ([ this.parseNumber (rowPrice), this.parseNumber (rowAmount) ]);
        }
        const timestamp = this.milliseconds ();
        return {
            'symbol': symbol,
            'bids': this.sortBy (bids, 0, true),
            'asks': this.sortBy (asks, 0),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'nonce': undefined,
        } as unknown as OrderBook;
    }

    /**
     * @method
     * @name myriad#fetchOHLCV
     * @description fetches price history for an outcome from the price_charts bucket embedded in the market response
     * @see https://docs.myriad.markets/builders/myriad-api-reference
     * @param {string} symbol unified outcome symbol like TRUMP_WIN:YES or an outcome id
     * @param {string} timeframe mapped to the closest available chart bucket (24h, 7d or 30d)
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum number of candles to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} a list of candles ordered as timestamp, open, high, low, close, volume
     */
    async fetchOHLCV (symbol: string, timeframe = '1d', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        await this.loadMarkets ();
        this.ensureOutcomesLoaded ();
        const outcomeObj = this.outcome (symbol);
        const outcomeInfo = this.safeDict (outcomeObj, 'info', {});
        const networkId = this.safeString (outcomeObj['info'], 'networkId');
        const marketId = this.safeString (outcomeObj['info'], 'marketId');
        const outcomeId = this.safeString (outcomeInfo, 'outcomeId', this.safeString (outcomeInfo, 'id'));
        const outcomeTitle = this.safeString (outcomeInfo, 'outcomeLabel', this.safeString (outcomeInfo, 'label', this.safeString (outcomeInfo, 'title')));
        const bucketKey = this.safeString (this.timeframes, timeframe, '30d');
        const response = await this.myriadPublicGetMarketsId (this.extend ({
            'id': marketId,
            'network_id': networkId,
        }, params));
        //
        //     {
        //         "id": "164",
        //         "networkId": "2741",
        //         "slug": "trump-out-as-president-2027",
        //         "title": "Will Trump cease to be President before 2027?",
        //         "state": "open",
        //         "outcomes": [
        //             {
        //                 "id": "0",
        //                 "outcomeId": "0",
        //                 "title": "YES",
        //                 "label": "YES",
        //                 "price": 0.42,
        //                 "priceChange24h": -0.02
        //             }
        //         ],
        //         "price_charts": {
        //             "24h": {
        //                 "timeframe": "24h",
        //                 "prices": [
        //                     {
        //                         "timestamp": 1705318200,
        //                         "open": 0.40,
        //                         "high": 0.45,
        //                         "low": 0.39,
        //                         "close": 0.42,
        //                         "price": 0.42,
        //                         "value": 0.42
        //                     }
        //                 ]
        //             },
        //             "7d": {...},
        //             "30d": {...}
        //         }
        //     }
        //
        const outcomes = this.safeList (response, 'outcomes', []) as any[];
        let selectedOutcome: Dict = undefined;
        for (let i = 0; i < outcomes.length; i++) {
            const outcome = outcomes[i];
            const currentId = this.safeString (outcome, 'id', this.safeString (outcome, 'outcomeId'));
            const currentTitle = this.safeString (outcome, 'title', this.safeString (outcome, 'label'));
            if ((outcomeId !== undefined) && (currentId === outcomeId)) {
                selectedOutcome = outcome;
                break;
            }
            if ((selectedOutcome === undefined) && (outcomeTitle !== undefined) && (currentTitle === outcomeTitle)) {
                selectedOutcome = outcome;
            }
        }
        // price_charts is a list of { timeframe, prices } buckets, with a dict variant on some deployments
        let chart = undefined;
        const chartsList = this.safeList (selectedOutcome, 'price_charts');
        if (chartsList !== undefined) {
            for (let i = 0; i < chartsList.length; i++) {
                const chartObj = chartsList[i];
                if (this.safeString (chartObj, 'timeframe') === bucketKey) {
                    chart = chartObj;
                    break;
                }
            }
        } else {
            const chartsDict = this.safeDict (selectedOutcome, 'price_charts', {});
            chart = this.safeValue (chartsDict, bucketKey);
        }
        const pointsList = this.safeList (chart, 'prices', this.safeList (chart, 'data', chart as any));
        let points = (pointsList !== undefined) ? pointsList : [];
        const pointsLength = points.length;
        if (pointsLength === 0) {
            const priceCharts = this.safeDict (response, 'price_charts', {});
            const bucket = this.safeValue (priceCharts, bucketKey, {});
            points = this.safeList (bucket, outcomeId, this.safeList (bucket, 'data', [])) as any[];
        }
        const usablePoints = [];
        for (let i = 0; i < points.length; i++) {
            const point = points[i];
            const pointOpen = this.safeNumber (point, 'open');
            const pointPrice = this.safeNumber (point, 'price', this.safeNumber (point, 'value'));
            const pointTs = this.safeInteger (point, 'timestamp');
            if (((pointOpen !== undefined) || (pointPrice !== undefined)) && (pointTs !== undefined)) {
                usablePoints.push (point);
            }
        }
        return this.parseOHLCVs (usablePoints, outcomeObj, timeframe, since, limit);
    }

    /**
     * @ignore
     * @method
     * @name myriad#parseOHLCV
     * @description parses a single myriad price chart data point into an ohlcv tuple
     * @param {object} ohlcv the raw price chart data point
     * @param {object} [market] the outcome object the candle belongs to
     * @returns {int[]} a candle ordered as timestamp, open, high, low, close, volume
     */
    parseOHLCV (ohlcv, market: Market = undefined): OHLCV {
        //
        //     {
        //         "timestamp": 1705318200,
        //         "open": 0.40,
        //         "high": 0.45,
        //         "low": 0.39,
        //         "close": 0.42,
        //         "price": 0.42,
        //         "value": 0.42
        //     }
        //
        const open = this.safeNumber (ohlcv, 'open');
        const high = this.safeNumber (ohlcv, 'high');
        const low = this.safeNumber (ohlcv, 'low');
        const close = this.safeNumber (ohlcv, 'close');
        const price = this.safeNumber (ohlcv, 'price', this.safeNumber (ohlcv, 'value'));  // fallback single-value tick
        return [
            this.safeTimestamp (ohlcv, 'timestamp'),
            (open !== undefined) ? open : price,
            (high !== undefined) ? high : price,
            (low !== undefined) ? low : price,
            (close !== undefined) ? close : price,
            0,   // price_charts endpoint has no volume
        ];
    }

    /**
     * @method
     * @name myriad#fetchTickers
     * @description fetches tickers for multiple outcomes, grouping requested outcomes by their parent market to fetch each market only once
     * @see https://docs.myriad.markets/builders/myriad-api-reference
     * @param {string[]} [symbols] unified outcome symbols, refreshes the markets listing and returns tickers for all outcomes when omitted
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures](https://docs.ccxt.com/#/?id=ticker-structure) indexed by outcome symbol
     */
    async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        await this.loadMarkets ();
        this.ensureOutcomesLoaded ();
        const result: Tickers = {};
        if (symbols === undefined) {
            const rawMarkets = await this.fetchRawMarketsList (params);
            for (let i = 0; i < rawMarkets.length; i++) {
                const raw = rawMarkets[i];
                const m = this.parseMyriadMarket (raw);
                const outcomesList = this.safeList (m, 'outcomes', []) as any[];
                for (let j = 0; j < outcomesList.length; j++) {
                    const ticker = this.parseTicker (raw, outcomesList[j]);
                    const symbolKey = this.safeString (ticker, 'symbol');
                    if (symbolKey !== undefined) {
                        result[symbolKey] = ticker;
                    }
                }
            }
            return result;
        }
        // group target outcomes by their parent market to fetch each market only once
        const outcomesByMarket: Dict = {};
        const marketKeys: any[] = [];
        for (let i = 0; i < symbols.length; i++) {
            const outcomeObj = this.outcome (symbols[i]);
            const info = this.safeDict (outcomeObj, 'info', {});
            const networkId = this.safeString (info, 'networkId');
            const marketId = this.safeString (info, 'marketId');
            const key = networkId + ':' + marketId;
            if (!(key in outcomesByMarket)) {
                outcomesByMarket[key] = [];
                marketKeys.push (key);
            }
            // reassign after push, plain mutation through a local is lost in transpiled php (arrays are value types there)
            const grouped = outcomesByMarket[key];
            grouped.push (outcomeObj);
            outcomesByMarket[key] = grouped;
        }
        const promises: any[] = [];
        for (let i = 0; i < marketKeys.length; i++) {
            const key = marketKeys[i];
            const grouped = outcomesByMarket[key] as any[];
            const firstOutcome = grouped[0];
            const info = this.safeDict (firstOutcome, 'info', {});
            promises.push (this.myriadPublicGetMarketsId (this.extend ({
                'id': this.safeString (info, 'marketId'),
                'network_id': this.safeString (info, 'networkId'),
            }, params)));
        }
        const responses = await Promise.all (promises);
        for (let i = 0; i < marketKeys.length; i++) {
            const key = marketKeys[i];
            const response = responses[i];
            const grouped = outcomesByMarket[key] as any[];
            for (let j = 0; j < grouped.length; j++) {
                const outcomeObj = grouped[j];
                const ticker = this.parseTicker (response, outcomeObj);
                const symbolKey = this.safeString (ticker, 'symbol');
                if (symbolKey !== undefined) {
                    result[symbolKey] = ticker;
                }
            }
        }
        return result;
    }

    /**
     * @method
     * @name myriad#fetchTrades
     * @description fetches recent public trades for a single outcome from the market action feed
     * @see https://docs.myriad.markets/builders/myriad-api-reference
     * @param {string} symbol unified outcome symbol like TRUMP_WIN:YES or an outcome id
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum number of trades to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)
     */
    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        this.ensureOutcomesLoaded ();
        const outcomeObj = this.outcome (symbol);
        const info = this.safeDict (outcomeObj, 'info', {});
        const networkId = this.safeString (info, 'networkId');
        const marketId = this.safeString (info, 'marketId');
        const outcomeId = this.safeString (info, 'outcomeId');
        const request: Dict = {
            'id': marketId,
            'network_id': networkId,
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.myriadPublicGetMarketsIdEvents (this.extend (request, params));
        //
        //     {
        //         "data": [
        //             {
        //                 "user": "0xAE7Bfff784EeEe7812D6527B72c77A7Ed773Ed9D",
        //                 "action": "buy",
        //                 "marketTitle": "BNB candles from 10:00 to 10:05 UTC",
        //                 "marketSlug": "bnb-candles-from-10-00-to-10-05-utc",
        //                 "marketId": 218,
        //                 "networkId": 56,
        //                 "outcomeTitle": "More Green",
        //                 "outcomeId": 0,
        //                 "shares": 500,
        //                 "value": 500,
        //                 "timestamp": 1761645928,
        //                 "blockNumber": 66193433,
        //                 "token": "0x55d398326f99059fF775485246999027B3197955",
        //                 "txId": "0x3c81447bd6e5c4c80a6e1425383c0b044ddcb1525d09027c2b371ff84f9b9fa0"
        //             }
        //         ]
        //     }
        //
        const rowsList = this.safeList (response, 'data', response as any);
        const rows = (rowsList !== undefined) ? rowsList : [];
        const trades: any[] = [];
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const action = this.safeString (row, 'action');
            if ((action !== 'buy') && (action !== 'sell')) {
                continue;
            }
            const rowOutcomeId = this.safeString (row, 'outcomeId');
            if ((outcomeId !== undefined) && (rowOutcomeId !== outcomeId)) {
                continue;
            }
            trades.push (row);
        }
        return this.parseTrades (trades, outcomeObj as any, since, limit);
    }

    /**
     * @ignore
     * @method
     * @name myriad#parseTrade
     * @description parses a raw market action feed row into a unified trade object
     * @param {object} trade the raw action feed row
     * @param {object} [market] the outcome object the trade belongs to
     * @returns {object} a [trade structure](https://docs.ccxt.com/#/?id=public-trades)
     */
    parseTrade (trade: Dict, market: Market = undefined): Trade {
        const timestamp = this.safeTimestamp (trade, 'timestamp');
        const amountStr = this.safeString (trade, 'shares');
        const costStr = this.safeString (trade, 'value');
        let priceStr = undefined;
        if ((amountStr !== undefined) && (costStr !== undefined) && !Precise.stringEq (amountStr, '0')) {
            priceStr = Precise.stringDiv (costStr, amountStr);
        }
        return this.safeTrade ({
            'id': this.safeString (trade, 'txId'),
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': this.safeSymbol (undefined, market),
            'order': undefined,
            'type': undefined,
            'side': this.safeString (trade, 'action'),
            'takerOrMaker': 'taker',
            'price': this.parseNumber (priceStr),
            'amount': this.parseNumber (amountStr),
            'cost': this.parseNumber (costStr),
            'fee': undefined,
        }, market);
    }

    /**
     * @method
     * @name myriad#fetchEvents
     * @description fetches prediction-market events matching the given search terms (or all open markets when omitted) and caches their markets and outcomes on the instance
     * @see https://docs.myriad.markets/builders/myriad-api-reference
     * @param {string[]} [queries] search terms, fetches all open markets when omitted
     * @param {object} [params] extra exchange-specific parameters
     * @param {int} [params.limit] maximum number of markets per query, defaults to 50
     * @param {string} [params.state] 'open', 'closed' or 'resolved', defaults to 'open'
     * @returns {object[]} an array of event structures
     */
    async fetchEvents (queries: Strings = undefined, params = {}): Promise<PredictionEvent[]> {
        queries = (queries === undefined) ? [] : queries;
        const queriesLength = queries.length;
        if (queriesLength === 0) {
            await this.loadMarkets ();
            this.populateOutcomes ();
            return Object.values (this.events as Dict) as any[];
        }
        const rawMarkets = await this.fetchRawMarketsBySearch (queries, params);
        if (!this.events) {
            this.events = {};
        }
        if (!this.markets) {
            this.markets = this.createSafeDictionary ();
        }
        const result: any[] = [];
        for (let i = 0; i < rawMarkets.length; i++) {
            const raw = rawMarkets[i];
            const m = this.parseMyriadMarket (raw);
            this.markets[m['symbol'] as string] = m;
            const ev = this.parseMarketToEvent (raw, m);
            const evKey = this.safeString (ev, 'symbol');
            if (evKey !== undefined) {
                this.events[evKey] = ev;
                result.push (ev);
            }
        }
        this.populateOutcomes ();
        return result;
    }

    /**
     * @ignore
     * @method
     * @name myriad#ensureOutcomesLoaded
     * @description rebuilds the outcome caches from the loaded markets when they are empty
     * @returns {undefined}
     */
    ensureOutcomesLoaded () {
        if ((this.outcomes === undefined) || this.isEmpty (this.outcomes)) {
            this.populateOutcomes ();
        }
    }

    /**
     * @ignore
     * @method
     * @name myriad#populateOutcomes
     * @description rebuilds this.outcomes and this.outcomes_by_id from the outcomes of every loaded market
     * @returns {undefined}
     */
    populateOutcomes () {
        this.outcomes = {};
        this.outcomes_by_id = {};
        const marketKeys = Object.keys (this.markets);
        for (let i = 0; i < marketKeys.length; i++) {
            const market = this.markets[marketKeys[i]] as Dict;
            const outcomesList = this.safeList (market, 'outcomes', []) as any[];
            for (let j = 0; j < outcomesList.length; j++) {
                const oc = outcomesList[j];
                const ocSymbol = this.safeString (oc, 'symbol');
                if (ocSymbol !== undefined) {
                    this.outcomes[ocSymbol] = oc;
                }
                const ocId = this.safeString (oc, 'id');
                if (ocId !== undefined) {
                    this.outcomes_by_id[ocId] = oc;
                }
            }
        }
    }

    /**
     * @ignore
     * @method
     * @name myriad#parseEvent
     * @description parses a raw myriad question object into the unified event shape with a nested markets list
     * @param {object} rawEvent the raw myriad question object
     * @returns {object} an event structure
     */
    parseEvent (rawEvent: Dict): any {
        const questionSlug = this.safeString (rawEvent, 'slug', this.safeString (rawEvent, 'id'));
        const rawMarkets = this.safeList (rawEvent, 'markets', []) as any[];
        const marketsList: Market[] = [];
        for (let i = 0; i < rawMarkets.length; i++) {
            const rawMarket = rawMarkets[i];
            marketsList.push (this.parseMyriadMarket (rawMarket, questionSlug));
        }
        const endDate = this.safeString (rawEvent, 'expiresAt', this.safeString (rawEvent, 'endDate'));
        return this.extend (rawEvent, {
            'id': this.safeString (rawEvent, 'id'),
            'slug': questionSlug,
            'symbol': questionSlug ? this.shortenSlug (questionSlug) : undefined,
            'title': this.safeString (rawEvent, 'title'),
            'description': this.safeString (rawEvent, 'description'),
            'markets': marketsList,
            'url': this.safeString (rawEvent, 'url'),
            'image': this.safeString (rawEvent, 'imageUrl', this.safeString (rawEvent, 'image')),
            'active': this.safeBool (rawEvent, 'active'),
            'resolved': this.safeBool (rawEvent, 'resolved', false),
            'category': this.safeString (rawEvent, 'category'),
            'tags': this.safeList (rawEvent, 'tags'),
            'created': this.parse8601 (this.safeString (rawEvent, 'createdAt')),
            'createdDatetime': this.safeString (rawEvent, 'createdAt'),
            'end': endDate ? this.parse8601 (endDate) : undefined,
            'endDatetime': endDate,
            'lastUpdatedAt': this.parse8601 (this.safeString (rawEvent, 'updatedAt')),
            'resolutionSource': this.safeString (rawEvent, 'resolutionSource'),
            'info': rawEvent,
        }) as any;
    }

    /**
     * @ignore
     * @method
     * @name myriad#sign
     * @description builds the request url and attaches the x-api-key header for private endpoints
     * @param {string} path the endpoint path
     * @param {string|string[]} api the api group and access level
     * @param {string} method the http method
     * @param {object} params the request parameters
     * @param {object} [headers] request headers
     * @param {string} [body] the request body
     * @returns {object} a dict with url, method, body and headers
     */
    sign (path: any, api: any = 'myriad', method = 'GET', params = {}, headers: any = undefined, body: any = undefined) {
        const apiGroup: string = typeof api === 'string' ? api : api[0];
        const access: string = typeof api === 'string' ? 'public' : api[1];
        const baseUrls = this.urls['api'] as Dict;
        const baseUrl = this.safeString (baseUrls, apiGroup, baseUrls['myriad'] as string);
        let url = baseUrl + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        const querystring = this.urlencode (query);
        if (method === 'GET' && querystring) {
            url += '?' + querystring;
        }
        const existingHeaders = (headers !== undefined) ? headers : {};
        headers = this.extend ({
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        }, existingHeaders);
        if (access === 'private' || this.apiKey) {
            if (this.apiKey) {
                headers = this.extend (headers, { 'x-api-key': this.apiKey });
            }
            if (method !== 'GET' && querystring) {
                body = query as any;
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}
