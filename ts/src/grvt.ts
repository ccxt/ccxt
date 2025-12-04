
//  ---------------------------------------------------------------------------

import Exchange from './abstract/grvt.js';
import { ExchangeError, ArgumentsRequired, ExchangeNotAvailable, InsufficientFunds, OrderNotFound, InvalidOrder, DDoSProtection, InvalidNonce, AuthenticationError, RateLimitExceeded, PermissionDenied, BadRequest, BadSymbol, AccountSuspended, OrderImmediatelyFillable, OnMaintenance, NotSupported } from './base/errors.js';
import { Precise } from './base/Precise.js';
import { TRUNCATE, TICK_SIZE } from './base/functions/number.js';
import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
import type { Balances, Currencies, Currency, Dict, Int, MarginModification, Market, Num, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, Transaction, TransferEntry, int } from './base/types.js';

//  ---------------------------------------------------------------------------

/**
 * @class grvt
 * @augments Exchange
 */
export default class grvt extends Exchange {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'grvt',
            'name': 'GRVT',
            'countries': [  ], //
            'rateLimit': 10,
            'certified': false,
            'version': 'v1',
            'pro': false,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': true,
                'future': false,
                'option': false,
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1H',
                '2h': '2H',
                '4h': '4H',
                '1d': '1D',
                '1w': '1W',
            },
            'urls': {
                'logo': 'https://github.com/user-attachments/assets/67abe346-1273-461a-bd7c-42fa32907c8e',
                'api': {
                    'privateMarket': 'https://market-data.grvt.io/',
                    'privateEdge': 'https://edge.grvt.io/',
                },
                'www': 'https://grvt.io',
                'referral': '----------------------------------------------------',
                'doc': [
                    'https://api-docs.grvt.io/',
                ],
                'fees': '',
            },
            'api': {
                'privateEdge': {
                    'post': {
                        'auth/api_key/login': 1,
                    },
                },
                'privateMarket': {
                    'post': {
                        'full/v1/instrument': 1,
                        'lite/v1/instrument': 1,
                        'full/v1/all_instruments': 1,
                        'lite/v1/all_instruments': 1,
                        'full/v1/instruments': 1,
                        'lite/v1/instruments': 1,
                        'full/v1/currency': 1,
                        'lite/v1/currency': 1,
                        'full/v1/margin_rules': 1,
                        'lite/v1/margin_rules': 1,
                        'full/v1/mini': 1,
                        'lite/v1/mini': 1,
                        'full/v1/ticker': 1,
                        'lite/v1/ticker': 1,
                        'full/v1/book': 1,
                        'lite/v1/book': 1,
                        'full/v1/trade': 1,
                        'lite/v1/trade': 1,
                        'full/v1/trade_history': 1,
                        'lite/v1/trade_history': 1,
                        'full/v1/kline': 1,
                        'lite/v1/kline': 1,
                    },
                },
            },
            // exchange-specific options
            'options': {
               
            },
            'precisionMode': TICK_SIZE,
            'exceptions': {
                'exact': {
                    
                },
                'broad': {
                    
                },
            },
        });
    }

    /**
     * @method
     * @name grvt#signIn
     * @description sign in, must be called prior to using other authenticated methods
     * @see https://api-docs.grvt.io/#authentication
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns response from exchange
     */
    async signIn (params = {}): Promise<{}> {
        const request = {
            'api_key': this.apiKey,
        };
        const response = await this.privateEdgePostAuthApiKeyLogin (this.extend (request, params));
        const status = this.safeString (response, 'status');
        if (status !== 'success') {
            throw new AuthenticationError (this.id + ' signIn() failed: ' + this.json (response));
        }
        return response;
    }

    /**
     * @method
     * @name grvt#fetchMarkets
     * @description retrieves data on all markets for alpaca
     * @see https://api-docs.grvt.io/market_data_api/#get-instrument-prod
     * @param {object} [params] extra parameters specific to the exchange api endpoint
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets (params = {}): Promise<Market[]> {
        await this.signIn ();
        const response = await this.privateMarketPostFullV1AllInstruments (params);
        //
        //    {
        //        "result": [
        //            {
        //                "instrument": "AAVE_USDT_Perp",
        //                "instrument_hash": "0x032201",
        //                "base": "AAVE",
        //                "quote": "USDT",
        //                "kind": "PERPETUAL",
        //                "venues": [
        //                    "ORDERBOOK",
        //                    "RFQ"
        //                ],
        //                "settlement_period": "PERPETUAL",
        //                "base_decimals": "9",
        //                "quote_decimals": "6",
        //                "tick_size": "0.01",
        //                "min_size": "0.1",
        //                "create_time": "1764303867576216941",
        //                "max_position_size": "3000.0",
        //                "funding_interval_hours": "8",
        //                "adjusted_funding_rate_cap": "0.75",
        //                "adjusted_funding_rate_floor": "-0.75"
        //            },
        //            ...
        //
        const result = this.safeList (response, 'result', []);
        return this.parseMarkets (result);
    }

    parseMarket (market): Market {
        const marketId = this.safeString (market, 'instrument');
        const baseId = this.safeString (market, 'base');
        const quoteId = this.safeString (market, 'quote');
        const settleId = quoteId;
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        const settle = this.safeCurrencyCode (settleId);
        const symbol = base + '/' + quote + ':' + settle;
        let type: Str = undefined;
        const typeRaw = this.safeString (market, 'kind');
        if (typeRaw === 'PERPETUAL') {
            type = 'swap';
        }
        const isSpot = (type === 'spot');
        const isSwap = (type === 'swap');
        const isFuture = (type === 'future');
        const isContract = isSwap || isFuture;
        return {
            'id': marketId,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'settle': settle,
            'baseId': baseId,
            'quoteId': quoteId,
            'settleId': settleId,
            'type': type,
            'spot': isSpot,
            'margin': false,
            'swap': isSwap,
            'future': isFuture,
            'option': false,
            'active': undefined, // todo: ask support to add
            'contract': isContract,
            'linear': undefined,
            'inverse': undefined,
            'contractSize': undefined,
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'precision': {
                'amount': this.parseNumber (this.parsePrecision (this.safeString (market, 'base_decimals'))),
                'price': this.parseNumber (this.parsePrecision (this.safeString (market, 'tick_size'))),
            },
            'limits': {
                'leverage': {
                    'min': undefined,
                    'max': undefined,
                },
                'amount': {
                    'min': this.safeNumber (market, 'min_size'),
                    'max': undefined,
                },
                'price': {
                    'min': undefined,
                    'max': undefined,
                },
                'cost': {
                    'min': undefined,
                    'max': undefined,
                },
            },
            'created': this.safeIntegerProduct (market, 'create_time', 0.000001),
            'info': market,
        } as Market;
    }

    /**
     * @method
     * @name grvt#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://api-docs.grvt.io/market_data_api/#get-currency-response
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    async fetchCurrencies (params = {}): Promise<Currencies> {
        await this.signIn ();
        const response = await this.privateMarketPostFullV1Currency (params);
        //
        //    {
        //        "result": [
        //            {
        //                "id": "4",
        //                "symbol": "ETH",
        //                "balance_decimals": "9",
        //                "quantity_multiplier": "1000000000"
        //            },
        //            ..
        //
        const responseResult = this.safeList (response, 'result', []);
        return this.parseCurrencies (responseResult);
    }

    parseCurrency (rawCurrency: Dict): Currency {
        const id = this.safeString (rawCurrency, 'symbol');
        const code = this.safeCurrencyCode (id);
        return this.safeCurrencyStructure ({
            'info': rawCurrency,
            'id': id,
            'code': code,
            'name': undefined,
            'active': undefined,
            'deposit': undefined,
            'withdraw': undefined,
            'fee': undefined,
            'precision': this.parseNumber (this.parsePrecision (this.safeString (rawCurrency, 'balance_decimals'))),
            'limits': {
                'amount': {
                    'min': undefined,
                    'max': undefined,
                },
                'withdraw': {
                    'min': undefined,
                    'max': undefined,
                },
                'deposit': {
                    'min': undefined,
                    'max': undefined,
                },
            },
            'type': 'crypto', // only crypto for now
            'networks': undefined,
        });
    }

    /**
     * @method
     * @name grvt#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://api-docs.grvt.io/market_data_api/#ticker_1
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const request = {
            'instrument': this.marketId (symbol),
        };
        const response = await this.privateMarketPostFullV1Ticker (this.extend (request, params));
        //
        //    {
        //        "result": {
        //            "event_time": "1764774730025055205",
        //            "instrument": "BTC_USDT_Perp",
        //            "mark_price": "92697.300078773",
        //            "index_price": "92727.818122278",
        //            "last_price": "92683.0",
        //            "last_size": "0.001",
        //            "mid_price": "92682.95",
        //            "best_bid_price": "92682.9",
        //            "best_bid_size": "5.332",
        //            "best_ask_price": "92683.0",
        //            "best_ask_size": "0.009",
        //            "funding_rate_8h_curr": "0.0037",
        //            "funding_rate_8h_avg": "0.0037",
        //            "interest_rate": "0.0",
        //            "forward_price": "0.0",
        //            "buy_volume_24h_b": "2893.898",
        //            "sell_volume_24h_b": "2907.847",
        //            "buy_volume_24h_q": "266955739.1606",
        //            "sell_volume_24h_q": "268170211.7109",
        //            "high_price": "93908.3",
        //            "low_price": "89900.1",
        //            "open_price": "90129.2",
        //            "open_interest": "1523.218935908",
        //            "long_short_ratio": "1.472543",
        //            "funding_rate": "0.0037",
        //            "next_funding_time": "1764777600000000000"
        //        }
        //    }
        //
        return this.parseTicker (response);
    }

    parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        const marketId = this.safeString (ticker, 'instrument');
        return this.safeTicker ({
            'info': ticker,
            'symbol': this.safeSymbol (marketId, market),
            'open': this.safeNumber (ticker, 'open_price'),
            'high': this.safeNumber (ticker, 'high_price'),
            'low': this.safeNumber (ticker, 'low_price'),
            'last': this.safeNumber (ticker, 'last_price'),
            'bid': this.safeNumber (ticker, 'best_bid_price'),
            'bidVolume': this.safeNumber (ticker, 'best_bid_size'),
            'ask': this.safeNumber (ticker, 'best_ask_price'),
            'askVolume': this.safeNumber (ticker, 'best_ask_size'),
            'change': undefined,
            'percentage': undefined,
            'baseVolume': this.safeNumber (ticker, 'buy_volume_24h_b'),
            'quoteVolume': this.safeNumber (ticker, 'buy_volume_24h_q'),
            'markPrice': undefined,
            'indexPrice': undefined,
            'vwap': undefined,
            'average': undefined,
            'previousClose': undefined,
        });
    }

    /**
     * @method
     * @name grvt#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://api-docs.grvt.io/market_data_api/#orderbook-levels
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.loc] crypto location, default: us
     * @returns {object} A dictionary of [order book structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#order-book-structure} indexed by market symbols
     */
    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const request = {
            'instrument': this.marketId (symbol),
        };
        if (limit !== undefined) {
            request['depth'] = this.findNearestCeiling ([ 10, 50, 100, 500 ], limit);
        } else {
            request['depth'] = 100; // default
        }
        const response = await this.privateMarketPostFullV1Book (this.extend (request, params));
        //
        //    {
        //        "result": {
        //            "event_time": "1764777396650000000",
        //            "instrument": "BTC_USDT_Perp",
        //            "bids": [
        //                {
        //                    "price": "92336.0",
        //                    "size": "0.005",
        //                    "num_orders": "1"
        //                },
        //                ...
        //            ],
        //            "asks": [
        //                {
        //                    "price": "92336.1",
        //                    "size": "5.711",
        //                    "num_orders": "37"
        //                },
        //                ...
        //            ]
        //        }
        //    }
        //
        const result = this.safeDict (response, 'result', {});
        const timestamp = this.parse8601 (this.safeString (result, 'event_time'));
        const marketId = this.safeString (result, 'instrument');
        return this.parseOrderBook (result, this.safeSymbol (marketId), timestamp, 'bids', 'asks', 'price', 'size');
    }

    /**
     * @method
     * @name grvt#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://api-docs.grvt.io/market_data_api/#trade_1
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.loc] crypto location, default: us
     * @param {string} [params.method] method, default: marketPublicGetV1beta3CryptoLocTrades
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        let request = {
            'instrument': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = Math.min (limit, 1000);
        }
        [ request, params ] = this.handleUntilOption ('end_time', request, params, 0.000001);
        if (since !== undefined) {
            request['start_time'] = since * 1000000;
        }
        const response = await this.privateMarketPostFullV1TradeHistory (this.extend (request, params));
        //
        //    {
        //        "next": "eyJ0cmFkZUlkIjo2NDc5MTAyMywidHJhZGVJbmRleCI6MX0",
        //        "result": [
        //            {
        //                "event_time": "1764779531332118705",
        //                "instrument": "ETH_USDT_Perp",
        //                "is_taker_buyer": false,
        //                "size": "23.73",
        //                "price": "3089.88",
        //                "mark_price": "3089.360002315",
        //                "index_price": "3090.443723246",
        //                "interest_rate": "0.0",
        //                "forward_price": "0.0",
        //                "trade_id": "64796657-1",
        //                "venue": "ORDERBOOK",
        //                "is_rpi": false
        //            },
        //            ...
        //
        return this.parseTrades (response, market, since, limit);
    }

    parseTrade (trade: Dict, market: Market = undefined): Trade {
        //
        // fetchTrades
        //
        //            {
        //                "event_time": "1764779531332118705",
        //                "instrument": "ETH_USDT_Perp",
        //                "is_taker_buyer": false,
        //                "size": "23.73",
        //                "price": "3089.88",
        //                "mark_price": "3089.360002315",
        //                "index_price": "3090.443723246",
        //                "interest_rate": "0.0",
        //                "forward_price": "0.0",
        //                "trade_id": "64796657-1",
        //                "venue": "ORDERBOOK",
        //                "is_rpi": false
        //            }
        //
        const marketId = this.safeString (trade, 'instrument');
        market = this.safeMarket (marketId, market);
        const timestamp = this.safeIntegerProduct (trade, 'event_time', 0.000001);
        const isTakerBuyer = this.safeBool (trade, 'is_taker_buyer');
        let side: Str = undefined;
        if (isTakerBuyer !== undefined) {
            side = isTakerBuyer ? 'buy' : 'sell';
        }
        return this.safeTrade ({
            'info': trade,
            'id': this.safeString (trade, 'trade_id'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'side': side,
            'takerOrMaker': undefined,
            'price': this.safeString (trade, 'price'),
            'amount': this.safeString (trade, 'size'),
            'cost': undefined,
            'fee': undefined,
            'order': undefined,
        }, market);
    }

    /**
     * @method
     * @name grvt#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://api-docs.grvt.io/market_data_api/#candlestick_1
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms for the ending date filter, default is the current time
     * @param {string} [params.priceType] last, mark, index (default is 'last')
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async fetchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        const maxLimit = 1000;
        await this.loadMarkets ();
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchOHLCV', 'paginate', false);
        if (paginate) {
            return await this.fetchPaginatedCallDeterministic ('fetchOHLCV', symbol, since, limit, timeframe, params, maxLimit) as OHLCV[];
        }
        const market = this.market (symbol);
        let request = {
            'instrument': market['id'],
            'interval': this.safeString (this.timeframes, timeframe, timeframe),
        };
        if (limit !== undefined) {
            request['limit'] = Math.min (limit, 1000);
        }
        [ request, params ] = this.handleUntilOption ('end_time', request, params, 0.000001);
        if (since !== undefined) {
            request['start_time'] = since * 1000000;
        }
        const priceTypeMap = {
            'last': 1,
            'mark': 2,
            'index': 3,
        };
        const selectedPriceType = this.safeString (params, 'priceType', 'last');
        request['type'] = this.safeInteger (priceTypeMap, selectedPriceType, 1);
        const response = await this.privateMarketPostFullV1TradeHistory (this.extend (request, params));
        //
        //    [
        //        {
        //            "symbol": "BTC_USDT_PERP",
        //            "time": "1753464720000000",
        //            "duration": "60000000",
        //            "open": "116051.35",
        //            "high": "116060.27",
        //            "low": "116051.35",
        //            "close": "116060.27",
        //            "volume": "0.0257",
        //            "quoteVolume": "2982.6724054"
        //        },
        //        ...
        //    ]
        //
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    parseOHLCV (ohlcv, market: Market = undefined): OHLCV {
        //
        //        {
        //            "symbol": "BTC_USDT_PERP",
        //            "time": "1753464720000000",
        //            "duration": "60000000",
        //            "open": "116051.35",
        //            "high": "116060.27",
        //            "low": "116051.35",
        //            "close": "116060.27",
        //            "volume": "0.0257",
        //            "quoteVolume": "2982.6724054"
        //        }
        //
        return [
            this.safeIntegerProduct (ohlcv, 'time', 0.001),
            this.safeNumber (ohlcv, 'open'),
            this.safeNumber (ohlcv, 'high'),
            this.safeNumber (ohlcv, 'low'),
            this.safeNumber (ohlcv, 'close'),
            this.safeNumber (ohlcv, 'volume'),
        ];
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const query = this.omit (params, this.extractParams (path));
        path = this.implodeParams (path, params);
        let url = this.urls['api'][api] + path;
        let queryString = '';
        if (method === 'GET') {
            if (Object.keys (query).length) {
                queryString = this.urlencode (query);
                url += '?' + queryString;
            }
        }
        const isPrivate = api.startsWith ('private');
        if (isPrivate) {
            this.checkRequiredCredentials ();
            if (method === 'POST') {
                body = this.json (params);
            }
            if (queryString !== '') {
                path = path + '?' + queryString;
            }
            headers = {
                'Content-Type': 'application/json',
            };
            if (path === 'auth/api_key/login') {
                headers['Cookie'] = 'rm=true;';
            } else {
                const accountId = this.safeString (this.options, 'AuthAccountId');
                const cookieValue = this.safeString (this.options, 'AuthCookieValue');
                headers['Cookie'] = cookieValue;
                headers['X-Grvt-Account-Id'] = accountId;
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code: int, reason: string, url: string, method: string, headers: Dict, body: string, response, requestHeaders, requestBody) {
        if (url.endsWith ('auth/api_key/login')) {
            const accountId = this.safeString (headers, 'X-Grvt-Account-Id');
            this.options['AuthAccountId'] = accountId;
            const cookie = this.safeString2 (headers, 'Set-Cookie', 'set-cookie');
            if (cookie !== undefined) {
                const cookieValue = cookie.split (';')[0];
                this.options['AuthCookieValue'] = cookieValue;
            }
            if (this.options['AuthCookieValue'] === undefined || this.options['AuthAccountId'] === undefined) {
                throw new AuthenticationError (this.id + ' signIn() failed to receive auth-cookie or account-id');
            }
            // todo: add expire
        }
        return undefined;
    }
}
