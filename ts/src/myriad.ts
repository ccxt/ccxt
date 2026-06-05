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

import Exchange from './abstract/myriad.js';
import type {
    Int, Dict,
    Strings,
    Market, Ticker, OrderBook, OHLCV,
} from './base/types.js';

// ---------------------------------------------------------------------------

/**
 * @class myriad
 * @augments Exchange
 */
export default class myriad extends Exchange {
    describe () {
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
                'fetchEvents': true,
                'fetchMarkets': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': false,
                'fetchOrderBook': true,
                'fetchPositions': false,
                'fetchTicker': true,
                'fetchTrades': false,
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
                        },
                    },
                    'private': {
                        'post': {
                            'markets/quote': 1,
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
     * Fetches all Myriad markets paginated and returns one CCXT market per raw market,
     * each containing a list of outcome objects.
     * @param params
     * @see https://docs.myriad.markets/api-reference/markets/list-markets
     */
    async fetchMarkets (params = {}): Promise<Market[]> {
        const queries = this.safeList (params, 'queries', []) as string[];
        const rest0 = this.omit (params, [ 'queries' ]);
        if (queries && queries.length > 0) {
            const searchLimit = this.safeInteger (rest0, 'limit', this.safeInteger (this.options, 'defaultFetchMarketsLimit', 50));
            const searchRest = this.omit (rest0, [ 'limit' ]);
            const seen = {};
            const rawEvents = [];
            for (let i = 0; i < queries.length; i++) {
                const q = queries[i];
                const response = await this.myriadPublicGetQuestions (this.extend ({ 'keyword': q, 'limit': searchLimit }, searchRest));
                const foundList = this.safeList (response, 'data', response as any);
                const found = (foundList !== undefined) ? foundList : [];
                for (let j = 0; j < found.length; j++) {
                    const rawEvent = found[j];
                    const eventId = this.safeString (rawEvent, 'id');
                    if (eventId && !(eventId in seen)) {
                        seen[eventId] = true;
                        rawEvents.push (rawEvent);
                    }
                }
            }
            const qFlatMarkets = [];
            const qEventsDict = {};
            for (let i = 0; i < rawEvents.length; i++) {
                const rawEvent = rawEvents[i];
                const questionSlug = this.safeString (rawEvent, 'slug', this.safeString (rawEvent, 'id'));
                const eventKey = questionSlug ? this.shortenSlug (questionSlug) : undefined;
                const parsed = this.parseEvent (rawEvent);
                if (eventKey) {
                    qEventsDict[eventKey] = parsed;
                }
                const parsedMarkets = parsed['markets'] as unknown as Market[];
                for (let j = 0; j < parsedMarkets.length; j++) {
                    const m = parsedMarkets[j];
                    qFlatMarkets.push (m);
                }
            }
            this.events = qEventsDict;
            return qFlatMarkets;
        }
        const flatMarkets = [];
        const networkGroups = {};
        let page = 1;
        const limit = this.safeInteger (this.options, 'defaultFetchMarketsLimit', 50);
        const status = this.safeString (rest0, 'status', this.safeString (this.options, 'defaultMarketStatus', 'open'));
        const rest = this.omit (rest0, [ 'status' ]);
        while (true) {
            const response = await this.myriadPublicGetMarkets (this.extend ({
                'status': status,
                'limit': limit,
                'page': page,
            }, rest));
            const rawMarketsList = this.safeList (response, 'data', response as any);
            const rawMarkets = (rawMarketsList !== undefined) ? rawMarketsList : [];
            if (!rawMarkets || rawMarkets.length === 0) {
                break;
            }
            for (let i = 0; i < rawMarkets.length; i++) {
                const raw = rawMarkets[i];
                const networkId = this.safeString (raw, 'networkId');
                const eventKey = networkId ? this.shortenSlug (networkId) : undefined;
                const m = this.parseMyriadMarket (raw);
                flatMarkets.push (m);
                if (eventKey) {
                    if (!(eventKey in networkGroups)) {
                        const optionsDict = this.options as Dict;
                        const networksMap = optionsDict['networks'] as Dict;
                        let networkName = networkId;
                        if (networksMap) {
                            const mappedName = networksMap[networkId];
                            networkName = (mappedName !== undefined) ? mappedName : networkId;
                        }
                        networkGroups[eventKey] = { 'networkId': networkId, 'title': networkName, 'markets': [] };
                    }
                    const networkGroup = networkGroups[eventKey] as Dict;
                    networkGroup['markets'].push (m);
                }
            }
            page = this.sum (page, 1);
            if (rawMarkets.length < limit) {
                break;
            }
        }
        const eventsDict = {};
        const networkGroupKeys = Object.keys (networkGroups);
        for (let i = 0; i < networkGroupKeys.length; i++) {
            const eventKey = networkGroupKeys[i];
            const g = networkGroups[eventKey] as Dict;
            const networkId = g['networkId'] as string;
            eventsDict[eventKey] = this.extend ({
                'id': networkId,
                'slug': networkId,
                'symbol': networkId,
                'title': g['title'],
                'description': undefined,
                'markets': g['markets'],
                'url': undefined,
                'image': undefined,
                'active': true,
                'resolved': false,
                'created': undefined,
                'createdDatetime': undefined,
                'end': undefined,
                'endDatetime': undefined,
                'lastUpdatedAt': undefined,
                'resolutionSource': undefined,
                'info': { 'networkId': networkId },
            }) as any;
        }
        this.events = eventsDict;
        return flatMarkets;
    }

    /**
     * Converts a single raw Myriad market into one CCXT market with a list of outcome objects.
     * @param raw
     * @param eventSlug
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
        const outcomes = [];
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
     * Fetches the current price for a single Myriad outcome by loading the parent market.
     * @param outcome outcomeId like 2741:756/0 or the symbol, e.g. "TRUMP_WIN:YES"
     * @param params
     * @see https://docs.myriad.markets/builders/myriad-api-reference#320c9e49da828116b12dec5bfeea306a
     */
    async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        const outcome = symbol;
        await this.loadMarkets ();
        const outcomeObj = this.outcome (outcome);
        const networkId = this.safeString (outcomeObj['info'], 'networkId');
        const marketId = this.safeString (outcomeObj['info'], 'marketId');
        const request = {
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
     * Parses a raw Myriad market object into a unified CCXT Ticker for the specified outcome.
     * @param raw
     * @param market  outcome object
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
            'baseVolume': undefined,
            'quoteVolume': this.safeNumber (raw, 'volume24h'),
            'info': raw,
        }, market);
    }

    /**
     * Fetches a synthesized AMM order book for a single Myriad outcome using the market price.
     * @param outcome outcome id or symbol e.g. TRUMP_WIN:YES
     * @param limit
     * @param params
     * @see https://docs.myriad.markets/builders/myriad-api-reference#320c9e49da828116b12dec5bfeea306a
     */
    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        const outcome = symbol;
        await this.loadMarkets ();
        const outcomeObj = this.outcome (outcome);
        const networkId = this.safeString (outcomeObj['info'], 'networkId');
        const marketId = this.safeString (outcomeObj['info'], 'marketId');
        const outcomeId = this.safeString (outcomeObj['info'], 'outcomeId');
        const request = {
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
        // AMM: synthesize a single bid/ask pair at the current implied price
        const bid = price !== undefined ? price - 0.001 : undefined;
        const ask = price !== undefined ? price + 0.001 : undefined;
        return {
            'symbol': this.safeOutcomeSymbol (outcome, outcomeObj),
            'bids': bid !== undefined ? [ [ bid, 9999 ] ] : [],
            'asks': ask !== undefined ? [ [ ask, 9999 ] ] : [],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'nonce': undefined,
        } as unknown as OrderBook;
    }

    /**
     * Fetches OHLCV data for a Myriad outcome from the price_charts bucket embedded in the market response.
     * @param symbol  outcome symbol, e.g. "TRUMP_WIN:YES"
     * @param timeframe
     * @param since
     * @param limit
     * @param params
    * @see https://docs.myriad.markets/builders/myriad-api-reference#320c9e49da828116b12dec5bfeea306a
     */
    async fetchOHLCV (symbol: string, timeframe = '1d', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        await this.loadMarkets ();
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
        let selectedOutcome = undefined;
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
        const outcomePriceCharts = this.safeDict (selectedOutcome, 'price_charts', {});
        let chart = this.safeValue (outcomePriceCharts, bucketKey);
        if (chart === undefined) {
            const outcomePriceChartKeys = Object.keys (outcomePriceCharts);
            for (let i = 0; i < outcomePriceChartKeys.length; i++) {
                const key = outcomePriceChartKeys[i];
                const chartObj = this.safeDict (outcomePriceCharts, key, {});
                if (this.safeString (chartObj, 'timeframe') === bucketKey) {
                    chart = chartObj;
                    break;
                }
            }
        }
        const pointsList = this.safeList (chart, 'prices', this.safeList (chart, 'data', chart as any));
        let points = (pointsList !== undefined) ? pointsList : [];
        if (points.length === 0) {
            const priceCharts = this.safeDict (response, 'price_charts', {});
            const bucket = this.safeValue (priceCharts, bucketKey, {});
            points = this.safeList (bucket, outcomeId, this.safeList (bucket, 'data', [])) as any[];
        }
        return this.parseOHLCVs (points, outcomeObj, timeframe, since, limit);
    }

    /**
     * Parses a single Myriad price chart data point into a CCXT OHLCV tuple.
     * @param ohlcv
     * @param market
     */
    parseOHLCV (ohlcv: Dict, market: Market = undefined): OHLCV {
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
        const ts = this.safeInteger (ohlcv, 'timestamp');
        const open = this.safeNumber (ohlcv, 'open');
        const high = this.safeNumber (ohlcv, 'high');
        const low = this.safeNumber (ohlcv, 'low');
        const close = this.safeNumber (ohlcv, 'close');
        const price = this.safeNumber (ohlcv, 'price', this.safeNumber (ohlcv, 'value'));  // fallback single-value tick
        return [
            ts !== undefined ? ts * 1000 : undefined,
            open !== undefined ? open : price,
            high !== undefined ? high : price,
            low !== undefined ? low : price,
            close !== undefined ? close : price,
            undefined,
        ];
    }

    /**
     * Fetches Myriad questions matching the given search terms and merges them into this.events and this.markets.
     * With no queries, fetches all questions via loadMarkets() and returns this.events.
     * @param queries
     * @param params
     * @see https://docs.myriad.markets/api-reference/questions/list-questions
     */
    async fetchEvents (queries: Strings = undefined, params = {}): Promise<any[]> {
        queries = (queries === undefined) ? [] : queries;
        if (!queries || queries.length === 0) {
            await this.loadMarkets ();
            this.populateOutcomes ();
            return Object.values (this.events as Dict) as any[];
        }
        const limit = this.safeInteger (params, 'limit', this.safeInteger (this.options, 'defaultFetchEventsLimit', 50));
        const rest = this.omit (params, [ 'limit' ]);
        const seen = {};
        const rawEvents = [];
        for (let i = 0; i < queries.length; i++) {
            const q = queries[i];
            const response = await this.myriadPublicGetQuestions (this.extend ({
                'keyword': q,
                'limit': limit,
            }, rest));
            const foundList = this.safeList (response, 'data', response as any);
            const found = (foundList !== undefined) ? foundList : [];
            for (let j = 0; j < found.length; j++) {
                const rawEvent = found[j];
                const eventId = this.safeString (rawEvent, 'id');
                if (eventId && !(eventId in seen)) {
                    seen[eventId] = true;
                    rawEvents.push (rawEvent);
                }
            }
        }
        if (!this.events) {
            this.events = {};
        }
        if (!this.markets) {
            this.markets = this.createSafeDictionary ();
        }
        const result = [];
        for (let i = 0; i < rawEvents.length; i++) {
            const rawEvent = rawEvents[i];
            const questionSlug = this.safeString (rawEvent, 'slug', this.safeString (rawEvent, 'id'));
            const eventKey = questionSlug ? this.shortenSlug (questionSlug) : undefined;
            const parsedEvent = this.parseEvent (rawEvent);
            if (eventKey) {
                const eventsDict = this.events as Dict;
                eventsDict[eventKey] = parsedEvent;
                const parsedMarkets = parsedEvent['markets'] as unknown as Market[];
                for (let j = 0; j < parsedMarkets.length; j++) {
                    const m = parsedMarkets[j];
                    this.markets[m['symbol'] as string] = m;
                }
                result.push (parsedEvent);
            }
        }
        this.populateOutcomes ();
        return result;
    }

    /**
     * @ignore
     * Rebuilds this.outcomes and this.outcomes_by_id from the outcomes of every loaded market.
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
     * Parses a raw Myriad question object into the unified CCXT event shape with a nested markets list.
     * Each market in the list contains its own outcomes array.
     * @param rawEvent
     */
    parseEvent (rawEvent: Dict): any {
        const questionSlug = this.safeString (rawEvent, 'slug', this.safeString (rawEvent, 'id'));
        const rawMarkets = this.safeList (rawEvent, 'markets', []) as any[];
        const marketsList = [];
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
     * Builds the request URL and attaches the x-api-key header for private or authenticated endpoints.
     * @param path
     * @param api
     * @param method
     * @param params
     * @param headers
     * @param body
     */
    sign (path: string, api: any = 'myriad', method = 'GET', params = {}, headers: Dict = undefined, body: Dict = undefined) {
        const apiGroup = typeof api === 'string' ? api : api[0];
        const access = typeof api === 'string' ? 'public' : api[1];
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
