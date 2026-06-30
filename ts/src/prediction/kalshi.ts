import { sha256 } from '@noble/hashes/sha2.js';
import Exchange from '../abstract/prediction/kalshi.js';
import { Precise } from '../base/Precise.js';
import { rsa } from '../base/functions/rsa.js';
import { BadSymbol } from '../base/errors.js';
import type {
    Int, int, Str, Num, Dict, Strings,
    Market, PredictionOrderBook, OHLCV,
    Balances, PredictionOpenInterest,
    PredictionEvent, PredictionTicker, PredictionTickers, PredictionOrder, PredictionTrade, PredictionPosition,
    fetchEventsParams,
} from '../base/types.js';

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
                'fetchEvent': true,
                'fetchEvents': true,
                'fetchMarkets': true,
                'fetchOHLCV': true,
                'fetchOpenInterest': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchPositions': true,
                'fetchStatus': true,
                'fetchTicker': true,
                'fetchTickers': true,
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
                            'events/multivariate': 1,
                            'events/fee_changes': 1,
                            'events/{event_ticker}': 1,
                            'events/{event_ticker}/metadata': 1,
                            'series': 1,
                            'series/fee_changes': 1,
                            'series/{series_ticker}': 1,
                            'series/{series_ticker}/markets/{ticker}/candlesticks': 1,
                            'series/{series_ticker}/events/{ticker}/candlesticks': 1,
                            'series/{series_ticker}/events/{ticker}/forecast_percentile_history': 1,
                            'markets': 1,
                            'markets/trades': 1,
                            'markets/orderbooks': 1,
                            'markets/candlesticks': 1,
                            'markets/{ticker}': 1,
                            'markets/{ticker}/orderbook': 1,
                            'exchange/status': 1,
                            'exchange/schedule': 1,
                            'exchange/announcements': 1,
                            'exchange/user_data_timestamp': 1,
                            'milestones': 1,
                            'milestones/{milestone_id}': 1,
                            'structured_targets': 1,
                            'structured_targets/{structured_target_id}': 1,
                            'search/filters_by_sport': 1,
                            'search/tags_by_categories': 1,
                            'live_data/batch': 1,
                            'live_data/milestone/{milestone_id}': 1,
                            'historical/markets': 1,
                            'historical/markets/{ticker}/candlesticks': 1,
                            'historical/trades': 1,
                            'historical/cutoff_timestamps': 1,
                            'multivariate_event_collections': 1,
                            'multivariate_event_collections/{collection_ticker}': 1,
                            'multivariate_event_collections/{collection_ticker}/lookup': 1,
                            'incentive_programs': 1,
                        },
                    },
                    'private': {
                        'get': {
                            'portfolio/balance': 1,
                            'portfolio/orders': 1,
                            'portfolio/orders/{order_id}': 1,
                            'portfolio/orders/{order_id}/queue_position': 1,
                            'portfolio/orders/queue_positions': 1,
                            'portfolio/positions': 1,
                            'portfolio/fills': 1,
                            'portfolio/settlements': 1,
                            'portfolio/deposits': 1,
                            'portfolio/withdrawals': 1,
                            'portfolio/order_groups': 1,
                            'portfolio/order_groups/{order_group_id}': 1,
                            'portfolio/summary/total_resting_order_value': 1,
                            'portfolio/subaccounts/balances': 1,
                            'portfolio/subaccounts/netting': 1,
                            'portfolio/subaccounts/transfers': 1,
                            'historical/fills': 1,
                            'historical/orders': 1,
                        },
                        'post': {
                            'portfolio/orders': 1,
                            'portfolio/events/orders': 1,
                            'portfolio/orders/batched': 1,
                            'portfolio/orders/{order_id}/amend': 1,
                            'portfolio/orders/{order_id}/decrease': 1,
                            'portfolio/order_groups/create': 1,
                            'portfolio/subaccounts': 1,
                            'portfolio/subaccounts/transfer': 1,
                            'multivariate_event_collections/{collection_ticker}': 1,
                        },
                        'put': {
                            'portfolio/order_groups/{order_group_id}/reset': 1,
                            'portfolio/order_groups/{order_group_id}/trigger': 1,
                            'portfolio/order_groups/{order_group_id}/limit': 1,
                            'portfolio/subaccounts/netting': 1,
                            'multivariate_event_collections/{collection_ticker}/lookup': 1,
                        },
                        'delete': {
                            'portfolio/orders/{order_id}': 1,
                            'portfolio/orders/batched': 1,
                            'portfolio/events/orders/{order_id}': 1, // v2 cancel (the non-v2 paths above are 410 Gone)
                            'portfolio/order_groups/{order_group_id}': 1,
                        },
                    },
                },
            },
            'requiredCredentials': {
                'apiKey': true,   // KALSHI-ACCESS-KEY (UUID)
                'secret': false,   // not used — signing is RSA with privateKey, override base default
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
            'exceptions': {
                'exact': {
                    'not_found': BadSymbol,   // 404 for an unknown market/ticker id — distinguish from an outage
                },
                'broad': {},
            },
            'options': {
                'defaultFetchEventsLimit': 200,   // events page size for the fetchEvents cursor scan
                'maxFetchMarketsLimit': 1000,      // markets page size / max markets collected per unscoped listing
                'defaultEventStatus': 'open',  // 'open' | 'closed' | 'settled'
                // kalshi has tens of thousands of markets. false (default) = resolve each outcome on
                // demand (~1s per market, cached) so hot paths are cheap; set true to bulk-load every
                // outcome once up front (a multi-second listing scan) and make every later lookup a hit
                'loadAllOutcomes': false,
            },
        });
    }

    /**
     * @method
     * @name kalshi#fetchMarkets
     * @description fetches kalshi markets; with a query it resolves the query via the events endpoint and returns the matched events' markets, otherwise it pages the markets listing
     * @see https://trading-api.readme.io/reference/getmarkets
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.query] a single search query; resolved against the events endpoint (event title/ticker), then the matched events' markets are returned
     * @param {string[]} [params.queries] multiple search queries (alternative to query); markets from any matching event are returned
     * @param {int} [params.limit] for an unscoped listing (no query), the max number of markets to collect (defaults to options.maxFetchMarketsLimit, 1000)
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets (params = {}): Promise<Market[]> {
        const queries = this.parseSearchQueries (params) as any[];
        const queriesLength = queries.length;
        // kalshi's public markets endpoint has no free-text search, so a query would otherwise
        // force a client-side scan of every open market (thousands, paged 1000 at a time, which
        // hangs). Resolve the query against the events endpoint instead — it is bounded by
        // maxPages, scoped server-side, supports multiple topics, and returns each event's parsed
        // markets — then flatten those markets.
        if (queriesLength > 0) {
            const eventParams = this.omit (params, [ 'limit' ]);
            const events = await this.fetchEvents (eventParams);
            const eventsLength = events.length;
            const queryMarkets: Market[] = [];
            for (let ei = 0; ei < eventsLength; ei++) {
                const eventMarkets = this.safeList (events[ei], 'markets', []) as any[];
                const eventMarketsLength = eventMarkets.length;
                for (let mi = 0; mi < eventMarketsLength; mi++) {
                    queryMarkets.push (eventMarkets[mi]);
                }
            }
            return queryMarkets;
        }
        const rest = this.omit (params, [ 'query', 'queries', 'limit' ]);
        // no query: page the markets listing directly. Cap the total collected so an unscoped
        // loadMarkets cannot run away through every kalshi market via the cursor.
        const maxMarkets = this.safeInteger (params, 'limit', this.safeInteger (this.options, 'maxFetchMarketsLimit', 1000));
        const flatMarkets: Market[] = [];
        const eventsDict: Dict = {};
        let cursor: Str = undefined;
        const limit = this.safeInteger (this.options, 'maxFetchMarketsLimit', 1000);
        // default to tradeable (open) markets; kalshi has thousands of closed/settled markets and
        // an unfiltered cursor pages through those, so loadMarkets would otherwise return mostly
        // closed markets. Pass params.status (e.g. 'closed', 'settled', 'unopened') to override
        const status = this.safeString (rest, 'status', 'open');
        while (true) {
            const request: Dict = { 'limit': limit, 'status': status };
            if (cursor !== undefined) {
                request['cursor'] = cursor;
            }
            const response = await this.kalshiPublicGetMarkets (this.extend (request, rest));
            const rawMarkets = this.safeList (response, 'markets', []) as any[];
            const rawMarketsLength = rawMarkets.length;
            for (let i = 0; i < rawMarkets.length; i++) {
                const raw = rawMarkets[i];
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
                                'event': eventKey,
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
            const collectedLength = flatMarkets.length;
            if (!cursor || rawMarketsLength < limit || collectedLength >= maxMarkets) {
                break;
            }
        }
        this.events = eventsDict;
        const flatMarketsLength = flatMarkets.length;
        if (flatMarketsLength > maxMarkets) {
            return this.arraySlice (flatMarkets, 0, maxMarkets);
        }
        return flatMarkets;
    }

    parseBinaryMarketToOutcomes (raw: Dict): Market[] {
        return [ this.parseMarket (raw) ];
    }

    /**
     * @ignore
     * @method
     * @name kalshi#fetchOutcome
     * @description resolves a single outcome on demand instead of bulk-loading. kalshi has tens of
     * thousands of markets, so a cache miss fetches just the requested market by ticker and merges
     * it into the cache (the same outcome lookups loadOutcomes builds), so repeat lookups are free
     * @param {string} outcomeSymbol an outcome id — a kalshi ticker, or a ticker with a '-NO' suffix
     * @returns {object} the resolved outcome object
     */
    async fetchOutcome (outcomeSymbol: string): Promise<any> {
        const symbolLength = outcomeSymbol.length;
        const suffix = outcomeSymbol.slice (symbolLength - 3);
        const isNo = (suffix === '-NO');
        const baseTicker = isNo ? outcomeSymbol.slice (0, symbolLength - 3) : outcomeSymbol;
        let response = undefined;
        try {
            response = await this.kalshiPublicGetMarketsTicker ({ 'ticker': baseTicker });
        } catch (e) {
            // an unknown ticker — or a unified handle passed on a cold cache — returns 'not_found',
            // which handleErrors maps to BadSymbol. surface a clear hint; let network failures propagate.
            if (e instanceof BadSymbol) {
                throw new BadSymbol (this.id + ' could not resolve outcome ' + outcomeSymbol + ' — pass an outcomeId, or call fetchEvents ()/loadOutcomes () first');
            }
            throw e;
        }
        const rawMarket = this.safeDict (response, 'market', response);
        const parsed = this.parseMarket (rawMarket);
        if (this.markets === undefined) {
            this.markets = this.createSafeDictionary ();
        }
        this.markets[parsed['symbol']] = parsed;
        this.populateOutcomes ();
        return this.outcome (outcomeSymbol);
    }

    handleErrors (code: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any) {
        // kalshi returns { "error": { "code": "...", ... } } with a 4xx; map known codes to ccxt
        // errors (e.g. not_found -> BadSymbol) so callers can distinguish them from a transport
        // outage (the base otherwise maps a bare 404 to ExchangeNotAvailable). unmapped codes fall
        // through to the base http-status handling.
        if (!response) {
            return undefined;
        }
        const error = this.safeDict (response, 'error');
        if (error !== undefined) {
            const errorCode = this.safeString (error, 'code');
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], errorCode, feedback);
        }
        return undefined;
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
        // markets use status 'active' while events use 'open'
        const status = this.safeString (raw, 'status');
        const active = (status === 'active') || (status === 'open');
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
        // market symbol (no outcome suffix)
        const subtitleOrTicker = (subtitle !== undefined) ? subtitle : ticker;
        const marketSymbol = this.slugToMarketSymbol (eventTicker, subtitleOrTicker);
        // kalshi exposes the per-market price tick via price_ranges[].step (a dollar value,
        // e.g. "0.0010" for deci-cent markets, "0.0100" for cent markets); older responses
        // used tick_size (in cents). amount is a whole number of contracts
        const priceRanges = this.safeList (raw, 'price_ranges', []);
        const firstRange = this.safeDict (priceRanges, 0, {});
        const stepDollars = this.safeString (firstRange, 'step');
        let pricePrecision = this.parseNumber (Precise.stringDiv (this.safeString (raw, 'tick_size', '1'), '100'));
        if (stepDollars !== undefined) {
            pricePrecision = this.parseNumber (stepDollars);
        }
        const precision = {
            'amount': 1,
            'price': pricePrecision,
        };
        // Build outcomes
        const outcomeLabels = [ 'YES', 'NO' ];
        const outcomeIds = [ ticker, ticker + '-NO' ];
        const outcomes: any[] = [];
        for (let oi = 0; oi < outcomeLabels.length; oi++) {
            const label = outcomeLabels[oi];
            const outcomeHandle = marketSymbol + ':' + label;
            outcomes.push ({
                'id': outcomeIds[oi],
                'outcomeId': outcomeIds[oi],
                'outcome': outcomeHandle,
                'market': marketSymbol,
                'label': label,
                'active': active,
                'precision': precision,
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
            'marketType': 'binary',
            'executionModel': 'clob',
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
            'precision': precision,
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
        } as unknown as Market;
    }

    /**
     * @method
     * @name kalshi#fetchTicker
     * @description fetches the current market price and bid/ask for a single kalshi outcome
     * @see https://docs.kalshi.com/api-reference/market/get-market
     * @param {string} outcome the unified outcome like TRUMP_BRING_BACK_MANUFACTURING:YES or outcomeId like KXGDPSHAREMANU-29
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)
     */
    async fetchTicker (outcome: Str, params = {}): Promise<PredictionTicker> {
        await this.loadOutcome (outcome);
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
     * @method
     * @name kalshi#fetchStatus
     * @description fetches the kalshi exchange status
     * @see https://docs.kalshi.com/api-reference/exchange/get-exchange-status
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [status structure](https://docs.ccxt.com/#/?id=exchange-status-structure)
     */
    async fetchStatus (params = {}): Promise<any> {
        const response = await this.kalshiPublicGetExchangeStatus (params);
        //
        //     { "exchange_active": true, "trading_active": true }
        //
        const tradingActive = this.safeBool (response, 'trading_active', false);
        return {
            'status': tradingActive ? 'ok' : 'maintenance',
            'updated': undefined,
            'eta': undefined,
            'url': undefined,
            'info': response,
        };
    }

    /**
     * @method
     * @name kalshi#fetchOpenInterest
     * @description fetches the open interest of a prediction market outcome
     * @see https://docs.kalshi.com/api-reference/market/get-market
     * @param {string} outcome unified outcome or outcome id
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [open interest structure](https://docs.ccxt.com/#/?id=open-interest-structure)
     */
    async fetchOpenInterest (outcome: string, params = {}): Promise<PredictionOpenInterest> {
        await this.loadOutcome (outcome);
        const outcomeObj = this.outcome (outcome);
        const ticker = this.safeString (outcomeObj['info'], 'ticker');
        const request: Dict = { 'ticker': ticker };
        const response = await this.kalshiPublicGetMarketsTicker (this.extend (request, params));
        const raw = this.safeDict (response, 'market', response);
        return this.parseOpenInterest (raw, outcomeObj as any);
    }

    parseOpenInterest (interest, market: Market = undefined): PredictionOpenInterest {
        //
        //     { "ticker": "...", "open_interest_fp": "60802.01", ... }   // open interest in contracts
        //
        const timestamp = this.milliseconds ();
        const openInterest = this.safeOpenInterest ({
            'symbol': this.safeSymbol (undefined, market),
            'openInterestAmount': this.safeNumber2 (interest, 'open_interest_fp', 'open_interest'),
            'openInterestValue': undefined,
            'baseVolume': undefined,
            'quoteVolume': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'info': interest,
        }, market);
        openInterest['outcome'] = this.safeOutcomeSymbol (undefined, market);
        openInterest['outcomeId'] = this.safeString (market, 'outcomeId');
        delete openInterest['symbol'];
        return openInterest as PredictionOpenInterest;
    }

    /**
     * @ignore
     * @method
     * @name kalshi#parseTicker
     * @description parses a raw kalshi market object into a unified ticker object
     * @param {object} raw the raw market object
     * @param {object} [market] the outcome object the ticker belongs to
     * @returns {object} a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)
     */
    parseTicker (raw: Dict, market: Market = undefined): PredictionTicker {
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
        const marketAny = market as any;
        const outcomeObj = this.safeOutcome (this.safeString (marketAny, 'outcome'), marketAny);
        const outcomeLabel = market ? this.safeString (market, 'label', this.safeString (market['info'], 'outcomeLabel', 'YES')) : 'YES';
        const isNo = outcomeLabel.toUpperCase () === 'NO';
        const now = this.milliseconds ();
        const outcome = this.safeString (outcomeObj, 'outcome');
        const yesAsk = this.safeNumber (raw, 'yes_ask_dollars');
        const yesBid = this.safeNumber (raw, 'yes_bid_dollars');
        const noAsk = this.safeNumber (raw, 'no_ask_dollars');
        const noBid = this.safeNumber (raw, 'no_bid_dollars');
        const last = this.safeNumber (raw, 'last_price_dollars');
        let bid: Num;
        let ask: Num;
        let close: Num;
        if (isNo) {
            bid = noBid;
            ask = noAsk;
            close = (last !== undefined) ? this.parseNumber (Precise.stringSub ('1', this.numberToString (last))) : undefined;
        } else {
            bid = yesBid;
            ask = yesAsk;
            close = last;
        }
        // the book is quoted in the yes token, the no side mirrors with sizes swapped
        const bidSizeString = (isNo) ? this.safeString (raw, 'yes_ask_size_fp') : this.safeString (raw, 'yes_bid_size_fp');
        const askSizeString = (isNo) ? this.safeString (raw, 'yes_bid_size_fp') : this.safeString (raw, 'yes_ask_size_fp');
        // kalshi occasionally reports a negative size for settling/closed markets; a size
        // can't be negative, so drop it rather than emit an invalid volume
        let bidVolume = undefined;
        if ((bidSizeString !== undefined) && Precise.stringGe (bidSizeString, '0')) {
            bidVolume = this.parseNumber (bidSizeString);
        }
        let askVolume = undefined;
        if ((askSizeString !== undefined) && Precise.stringGe (askSizeString, '0')) {
            askVolume = this.parseNumber (askSizeString);
        }
        let average = undefined;
        if ((bid !== undefined) && (ask !== undefined)) {
            average = this.parseNumber (Precise.stringDiv (Precise.stringAdd (this.numberToString (bid), this.numberToString (ask)), '2'));
        }
        return this.safePredictionTicker ({
            'outcome': outcome,
            'outcomeId': this.safeString2 (outcomeObj, 'outcomeId', 'id'),
            'label': this.safeString (outcomeObj, 'label'),
            'market': this.safeString2 (outcomeObj, 'market', 'outcome'),
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
            'baseVolume': this.safeNumberN (raw, [ 'volume_24h_fp', 'volume_24h', 'volume' ]), // 24h volume in contracts
            'quoteVolume': undefined,
            'info': raw,
        }, market);
    }

    /**
     * @method
     * @name kalshi#fetchTickers
     * @description fetches tickers for multiple outcomes at once, batching their market tickers through the markets endpoint
     * @see https://docs.kalshi.com/api-reference/market/get-markets
     * @param {string[]} [outcomes] unified outcomes, fetches tickers for all loaded outcomes when omitted
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures](https://docs.ccxt.com/#/?id=ticker-structure) indexed by outcome
     */
    async fetchTickers (outcomes: Strings = undefined, params = {}): Promise<PredictionTickers> {
        const targets: any[] = [];
        if (outcomes !== undefined) {
            for (let i = 0; i < outcomes.length; i++) {
                await this.loadOutcome (outcomes[i]);
                targets.push (outcomes[i]);
            }
        } else {
            await this.loadOutcomes ();
            const allKeys = Object.keys (this.outcomes);
            for (let i = 0; i < allKeys.length; i++) {
                targets.push (allKeys[i]);
            }
        }
        // group requested outcomes by their market ticker, yes and no outcomes share one market
        const outcomesByTicker: Dict = {};
        const tickers: any[] = [];
        for (let i = 0; i < targets.length; i++) {
            const outcomeObj = this.outcome (targets[i]);
            const ticker = this.safeString (outcomeObj['info'], 'ticker');
            if (ticker === undefined) {
                continue;
            }
            if (!(ticker in outcomesByTicker)) {
                outcomesByTicker[ticker] = [];
                tickers.push (ticker);
            }
            // reassign after push, plain mutation through a local is lost in transpiled php (arrays are value types there)
            const grouped = outcomesByTicker[ticker];
            grouped.push (outcomeObj);
            outcomesByTicker[ticker] = grouped;
        }
        const chunkSize = this.safeInteger (this.options, 'fetchTickersBatchSize', 100);
        const result: PredictionTickers = {};
        const tickersLength = tickers.length;
        let startIndex = 0;
        while (startIndex < tickersLength) {
            let endIndex = this.sum (startIndex, chunkSize);
            if (endIndex > tickersLength) {
                endIndex = tickersLength;
            }
            const chunk: any[] = [];
            for (let i = startIndex; i < endIndex; i++) {
                chunk.push (tickers[i]);
            }
            const request: Dict = {
                'tickers': chunk.join (','),
                'limit': chunkSize,
            };
            const response = await this.kalshiPublicGetMarkets (this.extend (request, params));
            const rawMarkets = this.safeList (response, 'markets', []) as any[];
            for (let i = 0; i < rawMarkets.length; i++) {
                const raw = rawMarkets[i];
                const marketTicker = this.safeString (raw, 'ticker');
                if ((marketTicker === undefined) || !(marketTicker in outcomesByTicker)) {
                    continue;
                }
                const grouped = outcomesByTicker[marketTicker] as any[];
                for (let j = 0; j < grouped.length; j++) {
                    const ticker = this.parseTicker (raw, grouped[j]);
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
     * @method
     * @name kalshi#fetchOrderBook
     * @description fetches the order book for a single kalshi outcome
     * @see https://docs.kalshi.com/api-reference/market/get-market-orderbook
     * @param {string} outcome unified outcome or outcome id
     * @param {int} [limit] the maximum number of bids/asks to return (not enforced by kalshis API, reserved for future client-side trimming)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order book structure](https://docs.ccxt.com/#/?id=order-book-structure)
     */
    async fetchOrderBook (outcome: Str, limit: Int = undefined, params = {}): Promise<PredictionOrderBook> {
        await this.loadOutcome (outcome);
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
        return this.safePredictionOrderBook (this.sortedOrders (this.safeString (outcomeObj, 'outcome', outcome), timestamp, bids, asks), outcomeObj);
    }

    /**
     * @ignore
     * @method
     * @name kalshi#sortedOrders
     * @description sorts bids descending and asks ascending, then returns a CCXT-shaped order book object
     * @param {string} outcome unified outcome
     * @param {int} timestamp timestamp in ms
     * @param {object[]} bids array of [price, size] bid levels
     * @param {object[]} asks array of [price, size] ask levels
     * @returns {object} an [order book structure](https://docs.ccxt.com/#/?id=order-book-structure)
     */
    sortedOrders (outcome: Str, timestamp: Int, bids: any[], asks: any[]): PredictionOrderBook {
        // Sort bids descending, asks ascending, match CCXT OrderBook shape
        bids = this.sortBy (bids, 0, true);
        asks = this.sortBy (asks, 0);
        return {
            'outcome': outcome,
            'bids': bids,
            'asks': asks,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'nonce': undefined,
        } as unknown as PredictionOrderBook;
    }

    /**
     * @method
     * @name kalshi#fetchOHLCV
     * @description fetches OHLCV candlesticks for a single kalshi outcome from the candlesticks endpoint
     * @see https://docs.kalshi.com/api-reference/market/get-market-candlesticks
     * @param {string} outcome unified outcome
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum number of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} a list of candles ordered as timestamp, open, high, low, close, volume
     */
    async fetchOHLCV (outcome: Str, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        await this.loadOutcome (outcome);
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
            const sinceS = this.parseToInt (since / 1000);
            request['start_ts'] = sinceS;
            if (limit !== undefined) {
                const end = this.sum (sinceS, limit * tf);
                request['end_ts'] = (end < now) ? end : now;
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
     * @ignore
     * @method
     * @name kalshi#parseOHLCV
     * @description parses a single kalshi candlestick object into a CCXT OHLCV tuple, converting cent prices to decimals
     * @param {object} ohlcv the raw candlestick object
     * @param {object} [market] the outcome object the candle belongs to
     * @returns {int[]} a candle ordered as timestamp, open, high, low, close, volume
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
     * @method
     * @name kalshi#fetchTrades
     * @description fetches public trade history for a single kalshi market ticker
     * @see https://docs.kalshi.com/api-reference/market/get-trades
     * @param {string} outcome unified outcome
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum number of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)
     */
    async fetchTrades (outcome: Str, since: Int = undefined, limit: Int = undefined, params = {}): Promise<PredictionTrade[]> {
        await this.loadOutcome (outcome);
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
        return this.parseTrades (filteredTrades, outcomeObj as any, since, limit) as PredictionTrade[];
    }

    /**
     * @ignore
     * @method
     * @name kalshi#parseTrade
     * @description parses a raw kalshi trade object into a unified trade object
     * @param {object} trade the raw trade object
     * @param {object} [market] the outcome object the trade belongs to
     * @returns {object} a [trade structure](https://docs.ccxt.com/#/?id=public-trades)
     */
    parseTrade (trade: Dict, market: Market = undefined): PredictionTrade {
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
        const outcomeObj = this.safeOutcome (this.safeString (marketAny, 'outcome'), marketAny);
        const marketInfo = this.safeDict (outcomeObj, 'info', {});
        const requestedOutcomeLabel = this.safeStringLower (outcomeObj, 'label', this.safeStringLower (marketInfo, 'outcomeLabel'));
        const outcomeSymbol = this.safeString (outcomeObj, 'outcome');
        const outcomeId = this.safeString2 (outcomeObj, 'outcomeId', 'id');
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
        return this.safePredictionTrade ({
            'id': id,
            'info': trade,
            'timestamp': ts,
            'datetime': this.iso8601 (ts),
            'outcome': outcomeSymbol,
            'outcomeId': outcomeId,
            'label': this.safeString (outcomeObj, 'label'),
            'market': this.safeString2 (outcomeObj, 'market', 'outcome'),
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
     * @method
     * @name kalshi#fetchBalance
     * @description fetches the authenticated user's USD portfolio balance from kalshi
     * @see https://trading-api.readme.io/reference/getbalance
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)
     */
    async fetchBalance (params = {}): Promise<Balances> {
        await this.loadOutcomes ();
        const response = await this.kalshiPrivateGetPortfolioBalance (params);
        return this.parseBalance (response);
    }

    /**
     * @ignore
     * @method
     * @name kalshi#parseBalance
     * @description parses a kalshi balance response (cents) into a unified balances object with a USD entry
     * @param {object} response the raw balance response
     * @returns {object} a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)
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
        return this.safeBalance (result) as Balances;
    }

    /**
     * @method
     * @name kalshi#fetchPositions
     * @description fetches open market positions for the authenticated kalshi user
     * @see https://trading-api.readme.io/reference/getportfoliopositions
     * @param {string[]} [outcomes] filter by outcome ids or outcomes
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structures](https://docs.ccxt.com/#/?id=position-structure)
     */
    async fetchPositions (outcomes: Strings = undefined, params = {}): Promise<PredictionPosition[]> {
        let outcomesLength = 0;
        if (outcomes !== undefined) {
            outcomesLength = outcomes.length;
        }
        if (outcomesLength > 0) {
            for (let i = 0; i < outcomes.length; i++) {
                await this.loadOutcome (outcomes[i]);
            }
        } else {
            await this.loadOutcomes ();
        }
        const response = await this.kalshiPrivateGetPortfolioPositions (params);
        const positions = this.safeList (response, 'market_positions', []) as any[];
        return this.parsePositions (positions, outcomes) as PredictionPosition[];
    }

    /**
     * @ignore
     * @method
     * @name kalshi#parsePosition
     * @description parses a raw kalshi portfolio position into a unified position object
     * @param {object} position the raw position object
     * @param {object} [market] the outcome object the position belongs to
     * @returns {object} a [position structure](https://docs.ccxt.com/#/?id=position-structure)
     */
    parsePosition (position: Dict, market: Market = undefined): PredictionPosition {
        const ticker = this.safeString (position, 'ticker');
        const outcomeObj = this.safeOutcome (ticker, market as any);
        const yesContracts = this.safeNumber (position, 'position');  // positive = long YES
        let positionSide: Str;
        let contractsValue = undefined;
        if (yesContracts !== undefined) {
            positionSide = (yesContracts >= 0) ? 'long' : 'short';
            contractsValue = this.parseNumber (Precise.stringAbs (this.numberToString (yesContracts)));
        }
        return this.safePredictionPosition ({
            'id': undefined,
            'outcome': this.safeString (outcomeObj, 'outcome', ticker),
            'outcomeId': this.safeString2 (outcomeObj, 'outcomeId', 'id'),
            'label': this.safeString (outcomeObj, 'label'),
            'market': this.safeString2 (outcomeObj, 'market', 'outcome'),
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
        });
    }

    /**
     * @method
     * @name kalshi#fetchOpenOrders
     * @description fetches resting (open) orders for the authenticated kalshi user, optionally filtered by ticker
     * @see https://trading-api.readme.io/reference/getorders
     * @param {string} [outcome] filter by unified outcome
     * @param {int} [since] timestamp in ms of the earliest order to fetch
     * @param {int} [limit] the maximum number of orders to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)
     */
    async fetchOpenOrders (outcome: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<PredictionOrder[]> {
        if (outcome !== undefined) {
            await this.loadOutcome (outcome);
        } else {
            await this.loadOutcomes ();
        }
        const request: Dict = { 'status': 'resting' };
        let outcomeObj: any = undefined;
        if (outcome !== undefined) {
            outcomeObj = this.outcome (outcome);
            request['ticker'] = this.safeString (outcomeObj['info'], 'ticker');
        }
        const response = await this.kalshiPrivateGetPortfolioOrders (this.extend (request, params));
        const orders = this.safeList (response, 'orders', []) as any[];
        return this.parseOrders (orders, outcomeObj as any, since, limit) as PredictionOrder[];
    }

    /**
     * @method
     * @name kalshi#fetchOrder
     * @description fetches a single order by id from the kalshi portfolio endpoint
     * @see https://trading-api.readme.io/reference/getorder
     * @param {string} id order id
     * @param {string} [outcome] unified outcome
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure](https://docs.ccxt.com/#/?id=order-structure)
     */
    async fetchOrder (id: Str, outcome: Str = undefined, params = {}): Promise<PredictionOrder> {
        if (outcome !== undefined) {
            await this.loadOutcome (outcome);
        } else {
            await this.loadOutcomes ();
        }
        const response = await this.kalshiPrivateGetPortfolioOrdersOrderId (this.extend ({ 'order_id': id }, params));
        return this.parseOrder (this.safeValue (response, 'order', response));
    }

    /**
     * @ignore
     * @method
     * @name kalshi#parseOrder
     * @description parses a raw kalshi order object into a unified order object
     * @param {object} order the raw order object
     * @param {object} [market] the outcome object the order belongs to
     * @returns {object} an [order structure](https://docs.ccxt.com/#/?id=order-structure)
     */
    parseOrder (order: Dict, market: Market = undefined): PredictionOrder {
        const id = this.safeString (order, 'order_id');
        const ticker = this.safeString (order, 'ticker');
        const mkt = this.safeOutcome (ticker, market as any);
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const action = this.safeString (order, 'action');
        const side = (action === 'buy') ? 'buy' : 'sell';
        // price in the outcome's own leg: V2 returns *_price_dollars (already dollars),
        // legacy returned yes_price/no_price in cents
        const labelIsNo = (this.safeStringUpper (mkt, 'label') === 'NO');
        const dollarsKey = (labelIsNo) ? 'no_price_dollars' : 'yes_price_dollars';
        const centsKey = (labelIsNo) ? 'no_price' : 'yes_price';
        let price = this.safeNumber (order, dollarsKey);
        if (price === undefined) {
            const priceCents = this.safeNumber (order, centsKey);
            if (priceCents !== undefined) {
                price = priceCents / 100;
            }
        }
        // V2 counts are fixed-point (*_count_fp); legacy used count / filled_count
        const amount = this.safeNumber2 (order, 'initial_count_fp', 'count');
        const filled = this.safeNumber2 (order, 'fill_count_fp', 'filled_count', 0);
        let remaining = this.safeNumber (order, 'remaining_count_fp');
        if ((remaining === undefined) && (amount !== undefined) && (filled !== undefined)) {
            remaining = amount - filled;
        }
        const ts = this.parse8601 (this.safeString (order, 'created_time'));
        return this.safePredictionOrder ({
            'id': id,
            'clientOrderId': this.safeString (order, 'client_order_id'),
            'info': order,
            'timestamp': ts,
            'datetime': this.iso8601 (ts),
            'lastTradeTimestamp': undefined,
            'status': status,
            'outcome': this.safeString (mkt, 'outcome'),
            'outcomeId': this.safeString2 (mkt, 'outcomeId', 'id'),
            'label': this.safeString (mkt, 'label'),
            'market': this.safeString2 (mkt, 'market', 'outcome'),
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
     * @ignore
     * @method
     * @name kalshi#parseOrderStatus
     * @description maps a kalshi order status string to the CCXT unified status vocabulary
     * @param {string} status the raw kalshi order status
     * @returns {string} the unified order status
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
     * @method
     * @name kalshi#createOrder
     * @description places a limit or market order on kalshi for the given outcome token
     * @see https://trading-api.readme.io/reference/createorder
     * @param {string} outcome unified outcome
     * @param {string} type 'limit' or 'market'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount number of contracts
     * @param {float} [price] limit price in dollars (0–1 range)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure](https://docs.ccxt.com/#/?id=order-structure)
     */
    async createOrder (outcome: Str, type: Str, side: Str, amount: Num, price: Num = undefined, params = {}): Promise<PredictionOrder> {
        await this.loadOutcome (outcome);
        const outcomeObj = this.outcome (outcome);
        const ticker = this.safeString (outcomeObj['info'], 'ticker');
        const isNo = (outcomeObj['label'] === 'NO');
        const isBuy = (side === 'buy');
        // kalshi V2 (/portfolio/events/orders) quotes the YES leg only: side 'bid' = buy YES,
        // 'ask' = sell YES, price in dollars. a NO order maps to the complementary YES order
        // (buy NO @ q == sell YES @ 1-q), so flip the book side and the price
        let bookSide = (isBuy) ? 'bid' : 'ask';
        let yesPrice = price;
        if (isNo) {
            bookSide = (isBuy) ? 'ask' : 'bid';
            if (price !== undefined) {
                yesPrice = this.parseNumber (Precise.stringSub ('1', this.numberToString (price)));
            }
        }
        const isMarket = (type === 'market');
        const defaultTif = (isMarket) ? 'immediate_or_cancel' : 'good_till_canceled';
        let timeInForce = undefined;
        [ timeInForce, params ] = this.handleOptionAndParams (params, 'createOrder', 'time_in_force', defaultTif);
        let stp = undefined;
        [ stp, params ] = this.handleOptionAndParams (params, 'createOrder', 'self_trade_prevention_type', 'taker_at_cross');
        const request: Dict = {
            'ticker': ticker,
            'side': bookSide,
            'count': this.numberToString (amount),
            'time_in_force': timeInForce,
            'self_trade_prevention_type': stp,
        };
        if (yesPrice !== undefined) {
            request['price'] = this.numberToString (yesPrice);
        }
        const response = await this.kalshiPrivatePostPortfolioEventsOrders (this.extend (request, params));
        // the V2 create response is minimal (order_id, fill_count, remaining_count), so backfill
        // the known order details and resolve the status from the remaining count
        const order = this.parseOrder (response, outcomeObj as any);
        order['side'] = side;
        order['amount'] = amount;
        order['price'] = price;
        if (order['status'] === undefined) {
            const remaining = this.safeNumber (response, 'remaining_count');
            let resolvedStatus = 'open';
            if ((remaining !== undefined) && (remaining === 0)) {
                resolvedStatus = 'closed';
            }
            order['status'] = resolvedStatus;
        }
        return order as PredictionOrder;
    }

    /**
     * @method
     * @name kalshi#cancelOrder
     * @description cancels a single open order by id on kalshi
     * @see https://trading-api.readme.io/reference/cancelorder
     * @param {string} id order id
     * @param {string} [outcome] unified outcome
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure](https://docs.ccxt.com/#/?id=order-structure)
     */
    async cancelOrder (id: Str, outcome: Str = undefined, params = {}): Promise<PredictionOrder> {
        if (outcome !== undefined) {
            await this.loadOutcome (outcome);
        } else {
            await this.loadOutcomes ();
        }
        // v2 cancel: DELETE /portfolio/events/orders/{order_id} (the /portfolio/orders/{id}
        // and /portfolio/orders/batched paths are deprecated v1 endpoints returning 410 Gone)
        const response = await this.kalshiPrivateDeletePortfolioEventsOrdersOrderId (this.extend ({ 'order_id': id }, params));
        return this.parseOrder (this.safeDict (response, 'order', response));
    }

    /**
     * @method
     * @name kalshi#cancelAllOrders
     * @description cancels all open orders on kalshi, optionally scoped to one outcome ticker
     * @see https://trading-api.readme.io/reference/cancelorders
     * @param {string} [outcome] unified outcome to scope the cancellation to
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)
     */
    async cancelAllOrders (outcome: Str = undefined, params = {}): Promise<PredictionOrder[]> {
        if (outcome !== undefined) {
            await this.loadOutcome (outcome);
        } else {
            await this.loadOutcomes ();
        }
        // kalshi has no "cancel all" / batch-cancel endpoint (the v1 DELETE /portfolio/orders
        // and /portfolio/orders/batched paths are 410 Gone) — fetch the resting orders and
        // cancel them one by one via the v2 DELETE /portfolio/events/orders/{order_id}
        const request: Dict = { 'status': 'resting' };
        if (outcome !== undefined) {
            const outcomeObj = this.outcome (outcome);
            request['ticker'] = this.safeString (outcomeObj['info'], 'ticker');
        }
        const restingResponse = await this.kalshiPrivateGetPortfolioOrders (request);
        const restingOrders = this.safeList (restingResponse, 'orders', []);
        const restingOrdersLength = restingOrders.length;
        const canceledOrders = [];
        for (let i = 0; i < restingOrdersLength; i++) {
            const orderId = this.safeString (restingOrders[i], 'order_id');
            if (orderId !== undefined) {
                const response = await this.kalshiPrivateDeletePortfolioEventsOrdersOrderId (this.extend ({ 'order_id': orderId }, params));
                canceledOrders.push (this.safeDict (response, 'order', response));
            }
        }
        return this.parseOrders (canceledOrders) as PredictionOrder[];
    }

    /**
     * @method
     * @name kalshi#fetchEvents
     * @description fetches kalshi events via cursor-paginated /events, filters client-side by query strings, then fetches full event details with nested markets in parallel and caches in this.events
     * @see https://trading-api.readme.io/reference/getevents
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.query] a single query string to filter events by (matches event ticker/title)
     * @param {string[]} [params.queries] multiple query strings (alternative to query)
     * @param {string} [params.status] 'open' | 'closed' | 'settled', defaults to options.defaultEventStatus
     * @param {int} [params.limit] page size per request, defaults to 200
     * @param {int} [params.maxPages] maximum number of event pages to scan, defaults to 50
     * @returns {object[]} an array of event structures
     */
    async fetchEvents (params: fetchEventsParams = {}): Promise<PredictionEvent[]> {
        this.requireEventQuery (params);
        const queries = this.parseSearchQueries (params);
        params = this.omit (params, [ 'query', 'queries' ]);
        // map the unified status onto the kalshi event status (open / closed) so it is pushed server-side
        const requestedStatus = this.safeString (params, 'status', this.safeString (this.options, 'defaultEventStatus', 'active'));
        let status = 'open';
        if ((requestedStatus === 'closed') || (requestedStatus === 'inactive')) {
            status = 'closed';
        }
        const pageLimit = this.safeInteger (params, 'limit', this.safeInteger (this.options, 'defaultFetchEventsLimit', 200));
        const maxPages = this.safeInteger (params, 'maxPages', 50);
        const rest = this.omit (params, [ 'status', 'limit', 'maxPages', 'sort', 'searchIn', 'eventId', 'slug' ]);
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
        // sequential cursor scan over events ONLY (no nested markets): a nested page is ~2.6 MB
        // (200 events + ~1200 markets), so scanning every open event that way transfers tens of MB
        // and takes ~100s. Event-only pages are ~25x smaller; the few events that match the query
        // then fetch their markets individually below (the per-event fallback). Net: seconds, not minutes.
        const matchedEvents: any[] = [];
        let cursor: string | undefined = undefined;
        let page = 0;
        while (page < maxPages) {
            const request: Dict = { 'status': status, 'limit': pageLimit, 'with_nested_markets': false };
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
                const tickerLower = ticker.toLowerCase ();
                const title = this.safeString (rawEvent, 'title', '').toLowerCase ();
                let matches = (lowerQueriesLength === 0);
                for (let li = 0; li < lowerQueries.length; li++) {
                    if (tickerLower.indexOf (lowerQueries[li]) > -1 || title.indexOf (lowerQueries[li]) > -1) {
                        matches = true;
                        break;
                    }
                }
                if (matches && ticker) {
                    matchedEvents.push (rawEvent);
                }
            }
            page = this.sum (page, 1);
            if (!cursor || rawEventsLength < pageLimit) {
                break;
            }
        }
        const result: any[] = [];
        for (let di = 0; di < matchedEvents.length; di++) {
            const fullEvent = matchedEvents[di];
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
                result.push (parsedEvent);
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
                const ocSymbol = this.safeString (oc, 'outcome');
                if (ocSymbol !== undefined) {
                    this.outcomes[ocSymbol] = oc;
                }
                const ocId = this.safeString (oc, 'outcomeId');
                if (ocId !== undefined) {
                    this.outcomes_by_id[ocId] = oc;
                }
            }
        }
        return this.applyEventFetchParams (result, params, queries);
    }

    /**
     * @method
     * @name kalshi#fetchEvent
     * @description fetches a single prediction-market event by its event ticker
     * @see https://trading-api.readme.io/reference/getevent
     * @param {string} id the event ticker
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [prediction event structure](https://docs.ccxt.com/#/?id=prediction-event-structure)
     */
    async fetchEvent (id: string, params = {}): Promise<PredictionEvent> {
        const request: Dict = { 'event_ticker': id, 'with_nested_markets': true };
        const response = await this.kalshiPublicGetEventsEventTicker (this.extend (request, params));
        const fullEvent = this.safeDict (response, 'event', response);
        const nestedMarkets = this.safeList (fullEvent, 'markets');
        if (nestedMarkets === undefined) {
            fullEvent['markets'] = this.safeList (response, 'markets', []);
        }
        const event: any = this.parseEvent (fullEvent);
        return event;
    }

    /**
     * @ignore
     * @method
     * @name kalshi#parseEvent
     * @description parses a raw kalshi event object (with nested markets) into the unified CCXT event shape
     * @param {object} rawEvent the raw event object
     * @returns {object} an event structure
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
        // aggregate volume/liquidity from the markets and derive the creation time so sort works
        let totalVolume = 0;
        let totalLiquidity = 0;
        let earliestCreated = undefined;
        for (let i = 0; i < rawMarkets.length; i++) {
            const rawMarket = rawMarkets[i];
            const parsed = this.parseMarket (rawMarket);
            marketsList.push (parsed);
            totalVolume = this.sum (totalVolume, this.safeNumber2 (rawMarket, 'volume_fp', 'volume', 0));
            totalLiquidity = this.sum (totalLiquidity, this.safeNumber2 (rawMarket, 'liquidity_dollars', 'liquidity', 0));
            const marketCreated = this.parse8601 (this.safeString (rawMarket, 'open_time'));
            if ((marketCreated !== undefined) && ((earliestCreated === undefined) || (marketCreated < earliestCreated))) {
                earliestCreated = marketCreated;
            }
        }
        const ticker = this.safeString (rawEvent, 'event_ticker');
        const title = this.safeString (rawEvent, 'title');
        let created = this.parse8601 (this.safeString (rawEvent, 'created_date_iso'));
        if (created === undefined) {
            created = earliestCreated;
        }
        return this.extend ({
            'id': ticker,
            'slug': ticker,
            'event': title ? this.shortenSlug (title) : undefined,
            'title': title,
            'markets': marketsList,
            'volume': totalVolume,
            'liquidity': totalLiquidity,
            'url': this.safeString (rawEvent, 'url'),
            'image': this.safeString (rawEvent, 'image_url'),
            'created': created,
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
     * @ignore
     * @method
     * @name kalshi#sign
     * @description builds the request URL and attaches RSA-PSS SHA-256 authentication headers for private endpoints
     * @param {string} path the endpoint path
     * @param {string|string[]} [api] the api group and access level
     * @param {string} [method] HTTP method
     * @param {object} [params] request parameters
     * @param {object} [headers] request headers
     * @param {object} [body] request body
     * @returns {object} a dictionary with url, method, body and headers
     */
    sign (path: any, api: any = 'kalshi', method = 'GET', params = {}, headers: any = undefined, body: any = undefined) {
        const apiGroup: string = typeof api === 'string' ? api : api[0];
        const access: string = typeof api === 'string' ? 'public' : api[1];
        const baseUrls = this.urls['api'] as Dict;
        const baseUrl = this.safeString (baseUrls, apiGroup, baseUrls['kalshi'] as string);
        const implodedPath = this.implodeParams (path, params);
        let url = baseUrl + '/' + implodedPath;
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
            // Signing payload: {timestamp}{METHOD}{path}, where path is the full request path
            // INCLUDING the /trade-api/v2 prefix and any path params substituted in, but NOT
            // the query string (e.g. /trade-api/v2/portfolio/orders/{order_id})
            const tradeApiIndex = baseUrl.indexOf ('/trade-api');
            const versionPrefix = baseUrl.slice (tradeApiIndex);
            const pathForSigning = versionPrefix + '/' + implodedPath;
            const payload = timestamp + method + pathForSigning;
            // RSA-PSS SHA-256 signature with the private key PEM
            const keyParts = this.privateKey.split ('\\n');
            const cleanPrivateKey = keyParts.join ('\n');
            const signature = rsa (payload, cleanPrivateKey, sha256, 'pss');
            headers = this.extend (headers, {
                'KALSHI-ACCESS-KEY': this.apiKey,
                'KALSHI-ACCESS-SIGNATURE': signature,
                'KALSHI-ACCESS-TIMESTAMP': timestamp,
            });
            if (method !== 'GET' && querystring) {
                // kalshi expects a JSON body; the signature covers only timestamp+method+path
                body = this.json (query);
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}
