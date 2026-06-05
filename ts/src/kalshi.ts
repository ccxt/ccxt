import Exchange from './abstract/kalshi.js';
import { Precise } from './base/Precise.js';
import { rsa } from './base/functions/rsa.js';
import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
import type {
    Int, Str, Num, Dict, Strings,
    Market, Ticker, OrderBook, Trade, OHLCV,
    Order, Balances, Position,
} from './base/types.js';

// ---------------------------------------------------------------------------

/**
 * @class kalshi
 * @augments Exchange
 */
export default class kalshi extends Exchange {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'kalshi',
            'name': 'Kalshi',
            'countries': [ 'US' ],
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
                'cancelAllOrders': true,
                'cancelOrder': true,
                'createOrder': true,
                'fetchBalance': true,
                'fetchCurrencies': false,
                'fetchEvents': true,
                'fetchMarkets': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchPositions': true,
                'fetchTicker': true,
                'fetchTickers': false,
                'fetchTrades': true,
                'prediction': true,
            },
            'timeframes': {
                '1m': 1,
                '5m': 5,
                '15m': 15,
                '1h': 60,
                '6h': 360,
                '1d': 1440,
            },
            'urls': {
                'logo': 'https://kalshi.com/favicon.ico',
                'api': {
                    'kalshi': 'https://api.elections.kalshi.com/trade-api/v2',
                },
                'test': {
                    'kalshi': 'https://demo-api.kalshi.co/trade-api/v2',
                },
                'www': 'https://kalshi.com',
                'doc': [ 'https://trading-api.readme.io/reference/getting-started' ],
            },
            'api': {
                'kalshi': {
                    'public': {
                        'get': {
                            'events': 1,
                            'events/{event_ticker}': 1,
                            'series': 1,
                            'series/{series_ticker}': 1,
                            'markets': 1,
                            'markets/{ticker}': 1,
                            'markets/{ticker}/orderbook': 1,
                            'markets/trades': 1,
                            'series/{series_ticker}/markets/{ticker}/candlesticks': 1,
                        },
                    },
                    'private': {
                        'get': {
                            'portfolio/balance': 1,
                            'portfolio/orders': 1,
                            'portfolio/orders/{order_id}': 1,
                            'portfolio/positions': 1,
                            'portfolio/fills': 1,
                        },
                        'post': {
                            'portfolio/orders': 1,
                        },
                        'delete': {
                            'portfolio/orders/{order_id}': 1,
                            'portfolio/orders': 1,
                        },
                    },
                },
            },
            'requiredCredentials': {
                'apiKey': true,   // KALSHI-ACCESS-KEY (UUID)
                'privateKey': true,   // RSA PEM private key for signing
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': 0.0,
                    'taker': 0.07,  // 7% fee on profit
                },
            },
            'options': {
                'defaultFetchEventsLimit': 100,
                'maxFetchMarketsLimit': 1000,
                'defaultEventStatus': 'open',  // 'open' | 'closed' | 'settled'
            },
        });
    }

    /**
     * Fetches all Kalshi markets via cursor pagination and maps each binary market to YES and NO CCXT markets.
     * @param params
     * @see https://trading-api.readme.io/reference/getmarkets
     */
    async fetchMarkets (params = {}): Promise<Market[]> {
        const queries = this.safeList (params, 'queries', []) as any[];
        const rest = this.omit (params, [ 'queries' ]);
        const lowerQueries: string[] = [];
        for (let qi = 0; qi < queries.length; qi++) {
            lowerQueries.push (queries[qi].toLowerCase ());
        }
        const lowerQueriesLength = lowerQueries.length;
        const flatMarkets: Market[] = [];
        const eventsDict: Dict = {};
        let cursor: Str = undefined;
        const limit = this.safeInteger (this.options, 'maxFetchMarketsLimit', 1000);
        while (true) {
            const request: Dict = { 'limit': limit };
            if (cursor !== undefined) {
                request['cursor'] = cursor;
            }
            const response = await this.kalshiPublicGetMarkets (this.extend (request, rest));
            const rawMarkets = this.safeList (response, 'markets', []) as any[];
            const rawMarketsLength = rawMarkets.length;
            for (let i = 0; i < rawMarkets.length; i++) {
                const raw = rawMarkets[i];
                if (lowerQueriesLength > 0) {
                    const ticker = this.safeString (raw, 'ticker', '').toLowerCase ();
                    const title = this.safeString (raw, 'title', '').toLowerCase ();
                    let matches = false;
                    for (let mi = 0; mi < lowerQueries.length; mi++) {
                        if (ticker.indexOf (lowerQueries[mi]) !== -1 || title.indexOf (lowerQueries[mi]) !== -1) {
                            matches = true;
                            break;
                        }
                    }
                    if (!matches) {
                        continue;
                    }
                }
                const parsed = this.parseBinaryMarketToOutcomes (raw);
                const eventTicker = this.safeString (raw, 'event_ticker');
                const eventTitle = this.safeString (raw, 'title', eventTicker);
                const eventKey = eventTitle ? this.shortenSlug (eventTitle) : undefined;
                for (let j = 0; j < parsed.length; j++) {
                    const m = parsed[j];
                    flatMarkets.push (m);
                    if (eventKey) {
                        if (!(eventKey in eventsDict)) {
                            eventsDict[eventKey] = {
                                'id': eventTicker,
                                'slug': eventTicker,
                                'symbol': eventKey,
                                'title': eventTitle,
                                'markets': [],
                            };
                        }
                        const eventEntry = eventsDict[eventKey] as Dict;
                        eventEntry['markets'].push (m);
                    }
                }
            }
            cursor = this.safeString (response, 'cursor');
            if (!cursor || rawMarketsLength < limit) {
                break;
            }
        }
        this.events = eventsDict;
        return flatMarkets;
    }

    parseBinaryMarketToOutcomes (raw: Dict): Market[] {
        return [ this.parseMarket (raw) ];
    }

    parseMarket (raw: Dict): Market {
        // {
        //    "can_close_early":true,
        //    "close_time":"2029-07-01T14:00:00Z",
        //    "created_time":"0001-01-01T00:00:00Z",
        //    "early_close_condition":"This market will close and expire early if the event occurs.",
        //    "event_ticker":"KXBALANCE-29",
        //    "expected_expiration_time":"2029-07-01T14:00:00Z",
        //    "expiration_time":"2029-07-01T14:00:00Z",
        //    "expiration_value":"",
        //    "fractional_trading_enabled":false,
        //    "last_price_dollars":"0.1100",
        //    "latest_expiration_time":"2029-07-01T14:00:00Z",
        //    "liquidity_dollars":"0.0000",
        //    "market_type":"binary",
        //    "no_ask_dollars":"0.9000",
        //    "no_bid_dollars":"0.8900",
        //    "no_sub_title":"During Trump's term",
        //    "notional_value_dollars":"1.0000",
        //    "open_interest_fp":"16353.00",
        //    "open_time":"2025-01-03T15:00:00Z",
        //    "previous_price_dollars":"0.0000",
        //    "previous_yes_ask_dollars":"0.0000",
        //    "previous_yes_bid_dollars":"0.0000",
        //    "price_level_structure":"linear_cent",
        //    "price_ranges":[
        //        {
        //            "end":"1.0000",
        //            "start":"0.0000",
        //            "step":"0.0100"
        //        }
        //    ],
        //    "response_price_units":"usd_cent",
        //    "result":"",
        //    "rules_primary":"If there is not a budget deficit for any of fiscal years 2025, 2026, 2027, or 2028, then the market resolves to Yes.",
        //    "rules_secondary":"",
        //    "settlement_timer_seconds":"1800",
        //    "status":"active",
        //    "subtitle":"",
        //    "tick_size":"1",
        //    "ticker":"KXBALANCE-29",
        //    "title":"Will Trump balance the budget?",
        //    "updated_time":"0001-01-01T00:00:00Z",
        //    "volume_24h_fp":"85.00",
        //    "volume_fp":"40208.00",
        //    "yes_ask_dollars":"0.1100",
        //    "yes_ask_size_fp":"",
        //    "yes_bid_dollars":"0.1000",
        //    "yes_bid_size_fp":"",
        //    "yes_sub_title":"During Trump's term"
        // }
        const ticker = this.safeString (raw, 'ticker');
        const eventTicker = this.safeString (raw, 'event_ticker');
        const subtitle = this.safeString (raw, 'subtitle', this.safeString (raw, 'title'));
        const active = this.safeString (raw, 'status') === 'open';
        const endDate = this.safeString (raw, 'expiration_time');
        const volume = this.safeNumber (raw, 'volume');
        const liquidity = this.safeNumber (raw, 'liquidity');
        const openInt = this.safeNumber (raw, 'open_interest');
        // Derive series ticker: drop last hyphen-segment from event_ticker
        let eventParts = [];
        if (eventTicker) {
            eventParts = eventTicker.split ('-');
        }
        let seriesTicker = eventTicker;
        const eventPartsLength = eventParts.length;
        if (eventPartsLength > 1) {
            const seriesParts = this.arraySlice (eventParts, 0, eventPartsLength - 1);
            seriesTicker = seriesParts.join ('-');
        }
        // Market symbol (no outcome suffix)
        const subtitleOrTicker = (subtitle !== undefined) ? subtitle : ticker;
        const marketSymbol = this.slugToMarketSymbol (eventTicker, subtitleOrTicker);
        // Build outcomes
        const outcomeLabels = [ 'YES', 'NO' ];
        const outcomeIds = [ ticker, ticker + '-NO' ];
        const outcomes: any[] = [];
        for (let oi = 0; oi < outcomeLabels.length; oi++) {
            const label = outcomeLabels[oi];
            outcomes.push ({
                'id': outcomeIds[oi],
                'symbol': marketSymbol + ':' + label,
                'marketSymbol': marketSymbol,
                'label': label,
                'active': active,
                'info': {
                    'ticker': ticker,
                    'eventTicker': eventTicker,
                    'seriesTicker': seriesTicker,
                    'subtitle': subtitle,
                    'outcomeLabel': label,
                    'volume': volume,
                    'liquidity': liquidity,
                    'openInterest': openInt,
                },
            });
        }
        return {
            'id': ticker,
            'symbol': marketSymbol,
            'base': 'USD',
            'quote': 'USD',
            'settle': undefined,
            'baseId': ticker,
            'quoteId': 'USD',
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
            'taker': 0.07,
            'maker': 0.0,
            'percentage': true,
            'tierBased': false,
            'feeSide': 'get',
            'precision': {
                'amount': 1,
                'price': 0.01,
            },
            'limits': {
                'leverage': { 'min': 1, 'max': 1 },
                'amount': { 'min': 1, 'max': undefined },
                'price': { 'min': 0.01, 'max': 0.99 },
                'cost': { 'min': undefined, 'max': undefined },
            },
            'outcomes': outcomes,
            'info': this.extend (raw, {
                'ticker': ticker,
                'eventTicker': eventTicker,
                'seriesTicker': seriesTicker,
                'subtitle': subtitle,
                'volume': volume,
                'liquidity': liquidity,
                'openInterest': openInt,
            }),
            'created': undefined,
        };
    }

    /**
     * Fetches the current market price and bid/ask for a single Kalshi outcome.
     * @param outcome the unified symbol like TRUMP_BRING_BACK_MANUFACTURING:YES or outcomeId like KXGDPSHAREMANU-29
     * @param params
     * @see https://docs.kalshi.com/api-reference/market/get-market
     */
    async fetchTicker (symbol: Str, params = {}): Promise<Ticker> {
        const outcome = symbol;
        await this.loadMarkets ();
        await this.checkEventsAndMarkets (outcome);
        const outcomeObj = this.outcome (outcome);
        const ticker = this.safeString (outcomeObj['info'], 'ticker');
        const request: Dict = {
            'ticker': ticker,
        };
        const response = await this.kalshiPublicGetMarketsTicker (this.extend (request, params));
        //
        //     {
        //         "market": {
        //             "can_close_early": true,
        //             "close_time": "2029-06-30T03:59:00Z",
        //             "created_time": "2025-06-05T17:55:43.779104Z",
        //             "early_close_condition": "This market will close and expire early if the event occurs.",
        //             "event_ticker": "KXGDPSHAREMANU-29",
        //             "expected_expiration_time": "2029-06-30T14:00:00Z",
        //             "expiration_time": "2029-07-07T14:00:00Z",
        //             "expiration_value": "",
        //             "floor_strike": "13.1",
        //             "fractional_trading_enabled": true,
        //             "last_price_dollars": "0.1980",
        //             "latest_expiration_time": "2029-07-07T14:00:00Z",
        //             "liquidity_dollars": "0.0000",
        //             "market_type": "binary",
        //             "no_ask_dollars": "0.8890",
        //             "no_bid_dollars": "0.8030",
        //             "no_sub_title": "Before 2029",
        //             "notional_value_dollars": "1.0000",
        //             "open_interest_fp": "11077.21",
        //             "open_time": "2025-06-05T18:00:00Z",
        //             "previous_price_dollars": "0.1980",
        //             "previous_yes_ask_dollars": "0.1970",
        //             "previous_yes_bid_dollars": "0.1110",
        //             "price_level_structure": "deci_cent",
        //             "price_ranges": [
        //                 {
        //                     "start": "0.55",
        //                     "end": "0.56",
        //                     "step": "0.01"
        //                 } 
        //             ],
        //             "response_price_units": "usd_cent",
        //             "result": "",
        //             "rules_primary": "If the value added by Manufacturing to GDP in Q4 2028 is at least 13.1% (the value it was in Q1 2005), then the market resolves to Yes.",
        //             "rules_secondary": "",
        //             "settlement_timer_seconds": "1800",
        //             "status": "active",
        //             "strike_type": "greater_or_equal",
        //             "tick_size": "1",
        //             "ticker": "KXGDPSHAREMANU-29",
        //             "title": "Will Trump bring back manufacturing?",
        //             "updated_time": "2026-04-09T10:32:47.890506Z",
        //             "volume_24h_fp": "0.00",
        //             "volume_fp": "19617.68",
        //             "yes_ask_dollars": "0.1970",
        //             "yes_ask_size_fp": "2750.00",
        //             "yes_bid_dollars": "0.1110",
        //             "yes_bid_size_fp": "2505.61",
        //             "yes_sub_title": "Before 2029"
        //         }
        //     }
        //
        const raw = this.safeValue (response, 'market', response);
        return this.parseTicker (raw, outcomeObj as any);
    }

    /**
     * Parses a raw Kalshi market object into a unified CCXT Ticker
     * @param raw
     * @param market
     */
    parseTicker (raw: Dict, market: Market = undefined): Ticker {
        //
        //     {
        //         "market": {
        //             "can_close_early": true,
        //             "close_time": "2029-06-30T03:59:00Z",
        //             "created_time": "2025-06-05T17:55:43.779104Z",
        //             "early_close_condition": "This market will close and expire early if the event occurs.",
        //             "event_ticker": "KXGDPSHAREMANU-29",
        //             "expected_expiration_time": "2029-06-30T14:00:00Z",
        //             "expiration_time": "2029-07-07T14:00:00Z",
        //             "expiration_value": "",
        //             "floor_strike": "13.1",
        //             "fractional_trading_enabled": true,
        //             "last_price_dollars": "0.1980",
        //             "latest_expiration_time": "2029-07-07T14:00:00Z",
        //             "liquidity_dollars": "0.0000",
        //             "market_type": "binary",
        //             "no_ask_dollars": "0.8890",
        //             "no_bid_dollars": "0.8030",
        //             "no_sub_title": "Before 2029",
        //             "notional_value_dollars": "1.0000",
        //             "open_interest_fp": "11077.21",
        //             "open_time": "2025-06-05T18:00:00Z",
        //             "previous_price_dollars": "0.1980",
        //             "previous_yes_ask_dollars": "0.1970",
        //             "previous_yes_bid_dollars": "0.1110",
        //             "price_level_structure": "deci_cent",
        //             "price_ranges": [
        //                 {
        //                     "start": "0.55",
        //                     "end": "0.56",
        //                     "step": "0.01"
        //                 } 
        //             ],
        //             "response_price_units": "usd_cent",
        //             "result": "",
        //             "rules_primary": "If the value added by Manufacturing to GDP in Q4 2028 is at least 13.1% (the value it was in Q1 2005), then the market resolves to Yes.",
        //             "rules_secondary": "",
        //             "settlement_timer_seconds": "1800",
        //             "status": "active",
        //             "strike_type": "greater_or_equal",
        //             "tick_size": "1",
        //             "ticker": "KXGDPSHAREMANU-29",
        //             "title": "Will Trump bring back manufacturing?",
        //             "updated_time": "2026-04-09T10:32:47.890506Z",
        //             "volume_24h_fp": "0.00",
        //             "volume_fp": "19617.68",
        //             "yes_ask_dollars": "0.1970",
        //             "yes_ask_size_fp": "2750.00",
        //             "yes_bid_dollars": "0.1110",
        //             "yes_bid_size_fp": "2505.61",
        //             "yes_sub_title": "Before 2029"
        //         }
        //     }
        //
        const outcomeLabel = market ? this.safeString (market, 'label', this.safeString (market['info'], 'outcomeLabel', 'YES')) : 'YES';
        const isNo = outcomeLabel.toUpperCase () === 'NO';
        const now = this.milliseconds ();
        const symbol = this.safeSymbol (undefined, market);
        const yesAsk = this.safeNumber (raw, 'yes_ask_dollars');
        const yesBid = this.safeNumber (raw, 'yes_bid_dollars');
        const noAsk  = this.safeNumber (raw, 'no_ask_dollars');
        const noBid  = this.safeNumber (raw, 'no_bid_dollars');
        const last   = this.safeNumber (raw, 'last_price_dollars');
        let bid: Num;
        let ask: Num;
        let close: Num;
        if (isNo) {
            bid   = noBid;
            ask   = noAsk;
            close = (last !== undefined) ? this.parseNumber (Precise.stringSub ('1', this.numberToString (last))) : undefined;
        } else {
            bid   = yesBid;
            ask   = yesAsk;
            close = last;
        }
        const bidVolume = isNo ? undefined : this.safeNumber (raw, 'yes_bid_size_fp');
        const askVolume = isNo ? undefined : this.safeNumber (raw, 'yes_ask_size_fp');
        let average = undefined;
        if ((bid !== undefined) && (ask !== undefined)) {
            average = (bid + ask) / 2;
        }
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': now,
            'datetime': this.iso8601 (now),
            'high': undefined,
            'low': undefined,
            'bid': bid,
            'bidVolume': bidVolume,
            'ask': ask,
            'askVolume': askVolume,
            'vwap': undefined,
            'open': undefined,
            'close': close,
            'last': close,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': average,
            'baseVolume': undefined,
            'quoteVolume': this.safeNumber (raw, 'volume'),
            'info': raw,
        }, market);
    }

    /**
     * Fetches the order book for a single Kalshi outcome
     * @param {string} outcome id or symbol
     * @param {int} [limit] the maximum number of bids/asks to return (not enforced by Kalshis API reserved for future client-side trimming)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @see https://docs.kalshi.com/api-reference/market/get-market-orderbook
     */
    async fetchOrderBook (symbol: Str, limit: Int = undefined, params = {}): Promise<OrderBook> {
        const outcome = symbol;
        await this.loadMarkets ();
        await this.checkEventsAndMarkets (outcome);
        const outcomeObj = this.outcome (outcome);
        const ticker = this.safeString (outcomeObj['info'], 'ticker');
        const isNo = outcomeObj['label'] === 'NO';
        const request: Dict = {
            'ticker': ticker,
        };
        const response = await this.kalshiPublicGetMarketsTickerOrderbook (this.extend (request, params));
        //
        //     {
        //         "orderbook_fp": {
        //             "no_dollars": [
        //                 [ "0.1500", "100.00" ], [ "0.1600", "101.00" ]
        //             ],
        //             "yes_dollars": [ 
        //                 [ "0.1500", "100.00" ], [ "0.1600", "101.00" ]
        //             ]
        //         }
        //     }
        //
        const book = this.safeValue (response, 'orderbook_fp', response);
        const timestamp = this.milliseconds ();
        // Kalshi uses YES-side perspective: `yes` = bids, `no` = asks (inverted)
        const rawYes = this.safeList (book, 'yes_dollars', []) as any[];
        const rawNo = this.safeList (book, 'no_dollars', []) as any[];
        // Convert [price_cents, size] → [price, size]
        const bids: any[] = [];
        const asks: any[] = [];
        if (isNo) {
            // NO perspective: NO bids come from rawNo, NO asks invert rawYes (NO ask = 1 - YES bid)
            for (let bi = 0; bi < rawNo.length; bi++) {
                const price = this.safeNumber (rawNo[bi], 0);
                bids.push ([ price, this.safeNumber (rawNo[bi], 1) ]);
            }
            for (let ai = 0; ai < rawYes.length; ai++) {
                const yesPrice = this.safeNumber (rawYes[ai], 0);
                const price = (yesPrice !== undefined) ? this.parseNumber (Precise.stringSub ('1', this.numberToString (yesPrice))) : undefined;
                asks.push ([ price, this.safeNumber (rawYes[ai], 1) ]);
            }
        } else {
            // YES perspective: YES bids from rawYes, YES asks invert rawNo (YES ask = 1 - NO bid)
            for (let bi = 0; bi < rawYes.length; bi++) {
                const price = this.safeNumber (rawYes[bi], 0);
                bids.push ([ price, this.safeNumber (rawYes[bi], 1) ]);
            }
            for (let ai = 0; ai < rawNo.length; ai++) {
                const noPrice = this.safeNumber (rawNo[ai], 0);
                const price = (noPrice !== undefined) ? this.parseNumber (Precise.stringSub ('1', this.numberToString (noPrice))) : undefined;
                asks.push ([ price, this.safeNumber (rawNo[ai], 1) ]);
            }
        }
        return this.sortedOrders (this.safeString (outcomeObj, 'symbol', outcome), timestamp, bids, asks);
    }

    /**
     * Sorts bids descending and asks ascending, then returns a CCXT-shaped OrderBook object.
     * @param symbol
     * @param timestamp
     * @param bids
     * @param asks
     */
    sortedOrders (symbol: Str, timestamp: Int, bids: any[], asks: any[]): OrderBook {
        // Sort bids descending, asks ascending, match CCXT OrderBook shape
        bids = this.sortBy (bids, 0, true);
        asks = this.sortBy (asks, 0);
        return {
            'symbol': symbol,
            'bids': bids,
            'asks': asks,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'nonce': undefined,
        } as unknown as OrderBook;
    }

    /**
     * Fetches OHLCV candlesticks for a single Kalshi outcome from the candlesticks endpoint.
     * @param outcome
     * @param timeframe
     * @param since
     * @param limit
     * @param params
     * @see https://docs.kalshi.com/api-reference/market/get-market-candlesticks
     */
    async fetchOHLCV (symbol: Str, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        const outcome = symbol;
        await this.loadMarkets ();
        await this.checkEventsAndMarkets (outcome);
        const outcomeObj = this.outcome (outcome);
        const ticker = this.safeString (outcomeObj['info'], 'ticker');
        const seriesTicker = this.safeString (outcomeObj['info'], 'seriesTicker', ticker);
        const periodMin = this.safeInteger (this.timeframes, timeframe, 1);
        const request: Dict = {
            'series_ticker': seriesTicker,
            'ticker': ticker,
            'period_interval': periodMin,
        };
        const now = this.seconds ();
        const tf = this.parseTimeframe (timeframe);
        if (since !== undefined) {
            request['start_ts'] = this.parseToInt (since / 1000);
            if (limit !== undefined) {
                const end = (since / 1000) + limit * tf;
                request['end_ts'] = end < now ? end : now;
            }
        } else {
            const defaultLimit = this.safeInteger (this.options, 'defaultFetchOHLCVLimit', 200);
            const candlesCount = (limit !== undefined) ? limit : defaultLimit;
            request['end_ts'] = now;
            request['start_ts'] = now - (candlesCount * tf);
        }
        const response = await this.kalshiPublicGetSeriesSeriesTickerMarketsTickerCandlesticks (
            this.extend (request, params)
        );
        //
        //     {
        //         "candlesticks": [
        //             {
        //                 "end_period_ts": 1776109260,
        //                 "open_interest_fp": "10869.00",
        //                 "price": {
        //                     "open_dollars": "0.5600",
        //                     "low_dollars": "0.5600",
        //                     "high_dollars": "0.5600",
        //                     "close_dollars": "0.5600",
        //                     "mean_dollars": "0.5600",
        //                     "previous_dollars": "0.5600",
        //                     "min_dollars": "0.5600",
        //                     "max_dollars": "0.5600"
        //                 },
        //                 "volume_fp": "0.00",
        //                 "yes_ask": {
        //                     "close_dollars": "0.1630",
        //                     "high_dollars": "0.1630",
        //                     "low_dollars": "0.1500",
        //                     "open_dollars": "0.1630"
        //                 },
        //                 "yes_bid": {
        //                     "close_dollars": "0.0800",
        //                     "high_dollars": "0.0800",
        //                     "low_dollars": "0.0700",
        //                     "open_dollars": "0.0800"
        //                 }
        //             },
        //         ],
        //         "ticker": "KXGDPSHAREMANU-29"
        //     }
        //
        const candles = this.safeList (response, 'candlesticks', []) as any[];
        const usableCandles = [];
        for (let i = 0; i < candles.length; i++) {
            const candle = candles[i];
            const priceObj = this.safeDict (candle, 'price', {});
            const openPrice = this.safeNumber (priceObj, 'open_dollars');
            const previousPrice = this.safeNumber (priceObj, 'previous_dollars');
            if ((openPrice !== undefined) || (previousPrice !== undefined)) {
                usableCandles.push (candle);
            }
        }
        return this.parseOHLCVs (usableCandles, outcomeObj as any, timeframe, since, limit);
    }

    /**
     * Parses a single Kalshi candlestick object into a CCXT OHLCV tuple, converting cent prices to decimals.
     * @param ohlcv
     * @param market
     */
    parseOHLCV (ohlcv, market: Market = undefined): OHLCV {
        //
        //     {
        //         "end_period_ts": 1776109260,
        //         "open_interest_fp": "10869.00",
        //         "price": {
        //             "open_dollars": "0.5600",
        //             "low_dollars": "0.5600",
        //             "high_dollars": "0.5600",
        //             "close_dollars": "0.5600",
        //             "mean_dollars": "0.5600",
        //             "previous_dollars": "0.5600",
        //             "min_dollars": "0.5600",
        //             "max_dollars": "0.5600"
        //         },
        //         "volume_fp": "0.00",
        //         "yes_ask": {
        //             "close_dollars": "0.1630",
        //             "high_dollars": "0.1630",
        //             "low_dollars": "0.1500",
        //             "open_dollars": "0.1630"
        //         },
        //         "yes_bid": {
        //             "close_dollars": "0.0800",
        //             "high_dollars": "0.0800",
        //             "low_dollars": "0.0700",
        //             "open_dollars": "0.0800"
        //         }
        //     }
        //
        const price = this.safeDict (ohlcv, 'price', {});
        // no-trade periods carry only previous_dollars (last trade price) → flat candle
        const previous = this.safeNumber (price, 'previous_dollars');
        return [
            this.safeTimestamp (ohlcv, 'end_period_ts'),
            this.safeNumber (price, 'open_dollars', previous),
            this.safeNumber (price, 'high_dollars', previous),
            this.safeNumber (price, 'low_dollars', previous),
            this.safeNumber (price, 'close_dollars', previous),
            this.safeNumber (ohlcv, 'volume_fp', 0),
        ];
    }

    /**
     * Fetches public trade history for a single Kalshi market ticker.
     * @param outcome
     * @param since
     * @param limit
     * @param params
     * @see https://docs.kalshi.com/api-reference/market/get-trades
     */
    async fetchTrades (symbol: Str, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        const outcome = symbol;
        await this.loadMarkets ();
        await this.checkEventsAndMarkets (outcome);
        const outcomeObj = this.outcome (outcome);
        const ticker = this.safeString (outcomeObj['info'], 'ticker');
        const request: Dict = { 'ticker': ticker };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.kalshiPublicGetMarketsTrades (this.extend (request, params));
        const trades = this.safeList (response, 'trades', []) as any[];
        const filteredTrades: any[] = [];
        for (let i = 0; i < trades.length; i++) {
            const trade = trades[i];
            const tradeTicker = this.safeString2 (trade, 'ticker', 'market_ticker');
            if (tradeTicker === undefined || tradeTicker === ticker) {
                filteredTrades.push (trade);
            }
        }
        return this.parseTrades (filteredTrades, outcomeObj as any, since, limit);
    }

    /**
     * Parses a raw Kalshi trade object into a unified CCXT Trade object.
     * @param trade
     * @param market
     */
    parseTrade (trade: Dict, market: Market = undefined): Trade {
        const id = this.safeString (trade, 'trade_id');
        const ts = this.parse8601 (this.safeString (trade, 'created_time'));
        const priceDollars = this.safeNumber2 (trade, 'yes_price_dollars', 'price_dollars');
        const priceCents = this.safeNumber2 (trade, 'yes_price', 'price');
        let price = undefined;
        if (priceDollars !== undefined) {
            price = priceDollars;
        } else if (priceCents !== undefined) {
            price = priceCents / 100;
        }
        const amountFp = this.safeNumber2 (trade, 'count_fp', 'size_fp');
        const amount = this.safeNumber (trade, 'count', amountFp);
        const rawSide = this.safeStringLower (trade, 'taker_side');
        const marketAny = market as any;
        const marketInfo = this.safeDict (marketAny, 'info', {});
        const requestedOutcomeLabel = this.safeStringLower (marketAny, 'label', this.safeStringLower (marketInfo, 'outcomeLabel'));
        const outcomeSymbol = this.safeString (marketAny, 'symbol', this.safeSymbol (undefined, market));
        const outcomeId = this.safeString (marketAny, 'id');
        let side: Str;
        if (rawSide === 'yes' || rawSide === 'no') {
            if (requestedOutcomeLabel === 'yes' || requestedOutcomeLabel === 'no') {
                side = (rawSide === requestedOutcomeLabel) ? 'buy' : 'sell';
            } else {
                side = (rawSide === 'yes') ? 'buy' : 'sell';
            }
        }
        let cost = undefined;
        if ((price !== undefined) && (amount !== undefined)) {
            cost = price * amount;
        }
        return this.safeTrade ({
            'id': id,
            'info': trade,
            'timestamp': ts,
            'datetime': this.iso8601 (ts),
            'symbol': this.safeSymbol (undefined, market),
            'outcome': outcomeSymbol,
            'outcomeId': outcomeId,
            'order': undefined,
            'type': undefined,
            'side': side,
            'takerOrMaker': 'taker',
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': undefined,
        }, market);
    }

    /**
     * Fetches the authenticated user's USD portfolio balance from Kalshi.
     * @param params
     * @see https://trading-api.readme.io/reference/getbalance
     */
    async fetchBalance (params = {}): Promise<Balances> {
        await this.checkEventsAndMarkets ();
        const response = await this.kalshiPrivateGetPortfolioBalance (params);
        return this.parseBalance (response);
    }

    /**
     * Parses a Kalshi balance response (cents) into a CCXT Balances object with a USD entry.
     * @param response
     */
    parseBalance (response): Balances {
        // Kalshi balance in cents → divide by 100
        const result: Dict = { 'info': response };
        const balanceCents = this.safeNumber (response, 'balance');
        let total = undefined;
        if (balanceCents !== undefined) {
            total = balanceCents / 100;
        }
        result['USD'] = { 'free': total, 'used': 0, 'total': total };
        return result as Balances;
    }

    /**
     * Fetches open market positions for the authenticated Kalshi user.
     * @param outcomes
     * @param params
     * @see https://trading-api.readme.io/reference/getportfoliopositions
     */
    async fetchPositions (symbols: Strings = undefined, params = {}): Promise<Position[]> {
        const outcomes = symbols;
        let outcomesLength = 0;
        if (outcomes !== undefined) {
            outcomesLength = outcomes.length;
        }
        if (outcomesLength > 0) {
            for (let i = 0; i < outcomes.length; i++) {
                await this.checkEventsAndMarkets (outcomes[i]);
            }
        } else {
            await this.checkEventsAndMarkets ();
        }
        const response = await this.kalshiPrivateGetPortfolioPositions (params);
        const positions = this.safeList (response, 'market_positions', []) as any[];
        return this.parsePositions (positions, outcomes);
    }

    /**
     * Parses a raw Kalshi portfolio position into a unified CCXT Position object.
     * @param position
     * @param market
     */
    parsePosition (position: Dict, market: Market = undefined): Position {
        const ticker = this.safeString (position, 'ticker');
        const outcomeObj = this.safeOutcome (ticker, market as any);
        const yesContracts = this.safeNumber (position, 'position');  // positive = long YES
        let positionSide: Str;
        let contractsValue = undefined;
        if (yesContracts !== undefined) {
            positionSide = (yesContracts >= 0) ? 'long' : 'short';
            contractsValue = this.parseNumber (Precise.stringAbs (this.numberToString (yesContracts)));
        }
        return {
            'id': undefined,
            'symbol': this.safeString (outcomeObj, 'symbol', ticker),
            'timestamp': undefined,
            'datetime': undefined,
            'contracts': contractsValue,
            'contractSize': 1,
            'side': positionSide,
            'notional': undefined,
            'leverage': 1,
            'unrealizedPnl': undefined,
            'realizedPnl': undefined,
            'collateral': undefined,
            'entryPrice': undefined,
            'markPrice': undefined,
            'liquidationPrice': undefined,
            'hedged': false,
            'maintenanceMargin': undefined,
            'maintenanceMarginPercentage': undefined,
            'initialMargin': undefined,
            'initialMarginPercentage': undefined,
            'marginRatio': undefined,
            'marginMode': 'cross',
            'marginType': 'cross',
            'percentage': undefined,
            'info': position,
        } as Position;
    }

    /**
     * Fetches resting (open) orders for the authenticated Kalshi user, optionally filtered by ticker.
     * @param outcome
     * @param since
     * @param limit
     * @param params
     * @see https://trading-api.readme.io/reference/getorders
     */
    async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        const outcome = symbol;
        if (outcome !== undefined) {
            await this.checkEventsAndMarkets (outcome);
        } else {
            await this.checkEventsAndMarkets ();
        }
        const request: Dict = { 'status': 'resting' };
        let outcomeObj: any = undefined;
        if (outcome !== undefined) {
            outcomeObj = this.outcome (outcome);
            request['ticker'] = this.safeString (outcomeObj['info'], 'ticker');
        }
        const response = await this.kalshiPrivateGetPortfolioOrders (this.extend (request, params));
        const orders = this.safeList (response, 'orders', []) as any[];
        return this.parseOrders (orders, outcomeObj as any, since, limit);
    }

    /**
     * Fetches a single order by ID from the Kalshi portfolio endpoint.
     * @param id
     * @param symbol
     * @param params
     * @see https://trading-api.readme.io/reference/getorder
     */
    async fetchOrder (id: Str, symbol: Str = undefined, params = {}): Promise<Order> {
        if (symbol !== undefined) {
            await this.checkEventsAndMarkets (symbol);
        } else {
            await this.checkEventsAndMarkets ();
        }
        const response = await this.kalshiPrivateGetPortfolioOrdersOrderId (this.extend ({ 'order_id': id }, params));
        return this.parseOrder (this.safeValue (response, 'order', response));
    }

    /**
     * Parses a raw Kalshi order object into a unified CCXT Order object.
     * @param order
     * @param market
     */
    parseOrder (order: Dict, market: Market = undefined): Order {
        const id = this.safeString (order, 'order_id');
        const ticker = this.safeString (order, 'ticker');
        const mkt = this.safeOutcome (ticker, market as any);
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const side = this.safeString (order, 'action') === 'buy' ? 'buy' : 'sell';
        const priceCents = this.safeNumber (order, 'no_price', this.safeNumber (order, 'yes_price'));
        let price = undefined;
        if (priceCents !== undefined) {
            price = priceCents / 100;
        }
        const amount = this.safeNumber (order, 'count');
        const filled = this.safeNumber (order, 'filled_count', 0);
        let remaining = undefined;
        if ((amount !== undefined) && (filled !== undefined)) {
            remaining = amount - filled;
        }
        const ts = this.parse8601 (this.safeString (order, 'created_time'));
        return this.safeOrder ({
            'id': id,
            'clientOrderId': this.safeString (order, 'client_order_id'),
            'info': order,
            'timestamp': ts,
            'datetime': this.iso8601 (ts),
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': mkt['symbol'],
            'type': this.safeStringLower (order, 'type', 'limit'),
            'timeInForce': 'GTC',
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': undefined,
            'triggerPrice': undefined,
            'average': undefined,
            'amount': amount,
            'cost': undefined,
            'filled': filled,
            'remaining': remaining,
            'fee': undefined,
            'trades': [],
        }, mkt);
    }

    /**
     * Maps a Kalshi order status string to the CCXT unified status vocabulary.
     * @param status
     */
    parseOrderStatus (status: Str): Str {
        const statuses: Dict = {
            'resting': 'open',
            'executed': 'closed',
            'canceled': 'canceled',
            'pending': 'open',
        };
        return this.safeString (statuses, status, status);
    }

    /**
     * Places a limit or market order on Kalshi for the given outcome token.
     * @param outcome
     * @param type
     * @param side
     * @param amount
     * @param price
     * @param params
     * @see https://trading-api.readme.io/reference/createorder
     */
    async createOrder (symbol: Str, type: Str, side: Str, amount: Num, price: Num = undefined, params = {}): Promise<Order> {
        const outcome = symbol;
        await this.loadMarkets ();
        await this.checkEventsAndMarkets (outcome);
        const outcomeObj = this.outcome (outcome);
        const ticker = this.safeString (outcomeObj['info'], 'ticker');
        const outcomeLabel = outcomeObj['label'];
        let priceCents = undefined;
        if (price !== undefined) {
            priceCents = this.parseToInt (price * 100 + 0.5);
        }
        const request: Dict = {
            'action': side === 'buy' ? 'buy' : 'sell',
            'count': amount,
            'side': outcomeLabel === 'NO' ? 'no' : 'yes',
            'ticker': ticker,
            'type': type,
        };
        if (priceCents !== undefined) {
            const priceKey = (outcomeLabel === 'NO') ? 'no_price' : 'yes_price';
            request[priceKey] = priceCents;
        }
        const response = await this.kalshiPrivatePostPortfolioOrders (this.extend (request, params));
        return this.parseOrder (this.safeValue (response, 'order', response), outcomeObj as any);
    }

    /**
     * Cancels a single open order by ID on Kalshi.
     * @param id
     * @param symbol
     * @param params
     * @see https://trading-api.readme.io/reference/cancelorder
     */
    async cancelOrder (id: Str, symbol: Str = undefined, params = {}): Promise<Order> {
        if (symbol !== undefined) {
            await this.checkEventsAndMarkets (symbol);
        } else {
            await this.checkEventsAndMarkets ();
        }
        const response = await this.kalshiPrivateDeletePortfolioOrdersOrderId (this.extend ({ 'order_id': id }, params));
        return this.parseOrder (this.safeValue (response, 'order', response));
    }

    /**
     * Cancels all open orders on Kalshi, optionally scoped to one outcome ticker.
     * @param outcome
     * @param params
     * @see https://trading-api.readme.io/reference/cancelorders
     */
    async cancelAllOrders (symbol: Str = undefined, params = {}): Promise<Order[]> {
        const outcome = symbol;
        if (outcome !== undefined) {
            await this.checkEventsAndMarkets (outcome);
        } else {
            await this.checkEventsAndMarkets ();
        }
        const request: Dict = {};
        if (outcome !== undefined) {
            await this.loadMarkets ();
            const outcomeObj = this.outcome (outcome);
            request['ticker'] = this.safeString (outcomeObj['info'], 'ticker');
        }
        const response = await this.kalshiPrivateDeletePortfolioOrders (this.extend (request, params));
        return this.parseOrders (this.safeList (response, 'orders', []) as any[]);
    }

    /**
     * Fetches Kalshi events via cursor-paginated /events, filters client-side by query strings,
     * then fetches full event details with nested markets in parallel and caches in this.events.
     * @param queries
     * @param params
     * @see https://trading-api.readme.io/reference/getevents
     */
    async fetchEvents (queries: Strings = undefined, params = {}): Promise<any> {
        queries = (queries === undefined) ? [] : queries;
        const status = this.safeString (params, 'status', this.safeString (this.options, 'defaultEventStatus', 'open'));
        const pageLimit = this.safeInteger (params, 'limit', 200);
        const maxPages = this.safeInteger (params, 'maxPages', 5);
        const rest = this.omit (params, [ 'status', 'limit', 'maxPages' ]);
        if (!this.events) {
            this.events = {};
        }
        if (!this.markets) {
            this.markets = this.createSafeDictionary ();
        }
        const lowerQueries: string[] = [];
        for (let qi = 0; qi < queries.length; qi++) {
            lowerQueries.push (queries[qi].toLowerCase ());
        }
        const lowerQueriesLength = lowerQueries.length;
        // Phase 1: sequential cursor scan (lightweight — no nested markets) to collect matching tickers
        const matchedTickers: string[] = [];
        let cursor: string | undefined = undefined;
        let page = 0;
        while (page < maxPages) {
            const request: Dict = { 'status': status, 'limit': pageLimit };
            if (cursor) {
                request['cursor'] = cursor;
            }
            const response = await this.kalshiPublicGetEvents (this.extend (request, rest));
            const rawEvents = this.safeList (response, 'events', []) as any[];
            const rawEventsLength = rawEvents.length;
            cursor = this.safeString (response, 'cursor');
            for (let rei = 0; rei < rawEvents.length; rei++) {
                const rawEvent = rawEvents[rei];
                const ticker = this.safeString (rawEvent, 'event_ticker', '');
                const title = this.safeString (rawEvent, 'title', '').toLowerCase ();
                let matches = (lowerQueriesLength === 0);
                for (let li = 0; li < lowerQueries.length; li++) {
                    if (ticker.toLowerCase ().indexOf (lowerQueries[li]) !== -1 || title.indexOf (lowerQueries[li]) !== -1) {
                        matches = true;
                        break;
                    }
                }
                if (matches && ticker) {
                    matchedTickers.push (ticker);
                }
            }
            page = this.sum (page, 1);
            if (!cursor || rawEventsLength < pageLimit) {
                break;
            }
        }
        // Phase 2: fetch full event details (with nested markets) for all matched tickers in parallel
        const detailPromises: any[] = [];
        for (let ti = 0; ti < matchedTickers.length; ti++) {
            detailPromises.push (this.kalshiPublicGetEventsEventTicker ({ 'event_ticker': matchedTickers[ti], 'with_nested_markets': true }));
        }
        const detailResponses = await Promise.all (detailPromises);
        const result: Dict = {};
        for (let di = 0; di < detailResponses.length; di++) {
            const detail = detailResponses[di];
            const fullEvent = this.safeValue (detail, 'event', detail) as Dict;
            const rawNestedMarkets = this.safeList (fullEvent, 'markets', []) as any[];
            const rawNestedMarketsLength = rawNestedMarkets.length;
            if (rawNestedMarketsLength === 0) {
                const eventTicker = this.safeString (fullEvent, 'event_ticker');
                if (eventTicker !== undefined) {
                    const eventMarkets: any[] = [];
                    let marketCursor: string | undefined = undefined;
                    const marketsLimit = this.safeInteger (this.options, 'maxFetchMarketsLimit', 1000);
                    const maxMarketPages = this.safeInteger (this.options, 'maxMarketPages', 1000);
                    for (let mp = 0; mp < maxMarketPages; mp++) {
                        const marketRequest: Dict = {
                            'event_ticker': eventTicker,
                            'limit': marketsLimit,
                        };
                        if (marketCursor !== undefined) {
                            marketRequest['cursor'] = marketCursor;
                        }
                        const marketResponse = await this.kalshiPublicGetMarkets (marketRequest);
                        const pageMarkets = this.safeList (marketResponse, 'markets', []) as any[];
                        const pageMarketsLength = pageMarkets.length;
                        for (let mi = 0; mi < pageMarkets.length; mi++) {
                            eventMarkets.push (pageMarkets[mi]);
                        }
                        marketCursor = this.safeString (marketResponse, 'cursor');
                        if ((marketCursor === undefined) || (marketCursor === '') || (pageMarketsLength < marketsLimit)) {
                            break;
                        }
                    }
                    fullEvent['markets'] = eventMarkets;
                }
            }
            const parsedEvent = this.parseEvent (fullEvent);
            const eventTitle = this.safeString (fullEvent, 'title');
            const eventKey = eventTitle ? this.shortenSlug (eventTitle) : undefined;
            if (eventKey) {
                this.events[eventKey] = parsedEvent;
                result[eventKey] = parsedEvent;
                const parsedMarketsRaw = parsedEvent['markets'];
                const parsedMarkets = (parsedMarketsRaw !== undefined) ? parsedMarketsRaw : [];
                for (let mi = 0; mi < parsedMarkets.length; mi++) {
                    const m = parsedMarkets[mi];
                    this.markets[m['symbol']] = m;
                }
            }
        }
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
        return this.events;
    }

    /**
     * Parses a raw Kalshi event object (with nested markets) into the unified CCXT event shape.
     * @param rawEvent
     */
    parseEvent (rawEvent: Dict): any {
        // {
        //         "available_on_brokers": true,
        //         "category": "Politics",
        //         "collateral_return_type": "",
        //         "event_ticker": "KXBALANCE-29",
        //         "last_updated_ts": "0001-01-01T00:00:00Z",
        //         "markets": [
        //             {
        //                 "can_close_early": true,
        //                 "close_time": "2029-07-01T14:00:00Z",
        //                 "created_time": "0001-01-01T00:00:00Z",
        //                 "early_close_condition": "This market will close and expire early if the event occurs.",
        //                 "event_ticker": "KXBALANCE-29",
        //                 "expected_expiration_time": "2029-07-01T14:00:00Z",
        //                 "expiration_time": "2029-07-01T14:00:00Z",
        //                 "expiration_value": "",
        //                 "fractional_trading_enabled": false,
        //                 "last_price_dollars": "0.1000",
        //                 "latest_expiration_time": "2029-07-01T14:00:00Z",
        //                 "liquidity_dollars": "0.0000",
        //                 "market_type": "binary",
        //                 "no_ask_dollars": "0.9000",
        //                 "no_bid_dollars": "0.8900",
        //                 "no_sub_title": "During Trump's term",
        //                 "notional_value_dollars": "1.0000",
        //                 "open_interest_fp": "16268.00",
        //                 "open_time": "2025-01-03T15:00:00Z",
        //                 "previous_price_dollars": "0.0000",
        //                 "previous_yes_ask_dollars": "0.0000",
        //                 "previous_yes_bid_dollars": "0.0000",
        //                 "price_level_structure": "linear_cent",
        //                 "price_ranges": [
        //                     {
        //                         "end": "1.0000",
        //                         "start": "0.0000",
        //                         "step": "0.0100"
        //                     }
        //                 ],
        //                 "response_price_units": "usd_cent",
        //                 "result": "",
        //                 "rules_primary": "If there is not a budget deficit for any of fiscal years 2025, 2026, 2027, or 2028, then the market resolves to Yes.",
        //                 "rules_secondary": "",
        //                 "settlement_timer_seconds": "1800",
        //                 "status": "active",
        //                 "subtitle": "",
        //                 "tick_size": "1",
        //                 "ticker": "KXBALANCE-29",
        //                 "title": "Will Trump balance the budget?",
        //                 "updated_time": "0001-01-01T00:00:00Z",
        //                 "volume_24h_fp": "28.00",
        //                 "volume_fp": "40111.00",
        //                 "yes_ask_dollars": "0.1100",
        //                 "yes_ask_size_fp": "",
        //                 "yes_bid_dollars": "0.1000",
        //                 "yes_bid_size_fp": "",
        //                 "yes_sub_title": "During Trump's term"
        //             }
        //         ],
        //         "mutually_exclusive": false,
        //         "series_ticker": "KXBALANCE",
        //         "strike_period": "",
        //         "sub_title": "During Trump's term",
        //         "title": "Will Trump balance the budget?"
        // }
        const rawMarkets = this.safeList (rawEvent, 'markets', []) as any[];
        const marketsList: any[] = [];
        for (let i = 0; i < rawMarkets.length; i++) {
            const rawMarket = rawMarkets[i];
            const parsed = this.parseMarket (rawMarket);
            marketsList.push (parsed);
        }
        const ticker = this.safeString (rawEvent, 'event_ticker');
        const title = this.safeString (rawEvent, 'title');
        return this.extend ({
            'id': ticker,
            'slug': ticker,
            'symbol': title ? this.shortenSlug (title) : undefined,
            'title': title,
            'markets': marketsList,
            'url': this.safeString (rawEvent, 'url'),
            'image': this.safeString (rawEvent, 'image_url'),
            'created': this.parse8601 (this.safeString (rawEvent, 'created_date_iso')),
            'createdDatetime': this.safeString (rawEvent, 'created_date_iso'),
            'end': this.parse8601 (this.safeString (rawEvent, 'end_date_iso')),
            'endDatetime': this.safeString (rawEvent, 'end_date_iso'),
            'category': this.safeString (rawEvent, 'category'),
            'lastUpdatedAt': this.parse8601 (this.safeString (rawEvent, 'last_updated_date_iso')),
            'lastUpdatedAtDatetime': this.safeString (rawEvent, 'last_updated_date_iso'),
            'resolutionSource': this.safeString (rawEvent, 'resolution_source'),
            'resolved': this.safeBool (rawEvent, 'resolved'),
            'info': rawEvent,
        });
    }

    /**
     * Builds the request URL and attaches RSA-PSS SHA-256 authentication headers for private endpoints.
     * @param path
     * @param api
     * @param method
     * @param params
     * @param headers
     * @param body
     */
    sign (path: any, api: any = 'kalshi', method = 'GET', params = {}, headers: any = undefined, body: any = undefined) {
        const apiGroup: string = typeof api === 'string' ? api : api[0];
        const access: string = typeof api === 'string' ? 'public' : api[1];
        const baseUrls = this.urls['api'] as Dict;
        const baseUrl = this.safeString (baseUrls, apiGroup, baseUrls['kalshi'] as string);
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
        if (access === 'private') {
            this.checkRequiredCredentials ();
            const timestamp = this.milliseconds ().toString ();
            // Signing payload: {timestamp}{METHOD}/{path_without_base}
            const pathForSigning = '/' + path;
            const payload = timestamp + method + pathForSigning;
            // RSA-PSS SHA-256 signature with the private key PEM
            const keyParts = this.privateKey.split ('\\n');
            const cleanPrivateKey = keyParts.join ('\n');
            const signature = rsa (payload, cleanPrivateKey, sha256);
            headers = this.extend (headers, {
                'KALSHI-ACCESS-KEY': this.apiKey,
                'KALSHI-ACCESS-SIGNATURE': signature,
                'KALSHI-ACCESS-TIMESTAMP': timestamp,
            });
            if (method !== 'GET' && querystring) {
                body = query as any;
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}
