
//  ---------------------------------------------------------------------------

import Exchange from './abstract/oanda.js';
// @ts-ignore
import { ExchangeError, ExchangeNotAvailable, OnMaintenance, ArgumentsRequired, BadRequest, AccountSuspended, InvalidAddress, PermissionDenied, NetworkError, InsufficientFunds, InvalidNonce, CancelPending, InvalidOrder, OrderNotFound, AuthenticationError, RequestTimeout, AccountNotEnabled, BadSymbol, RateLimitExceeded, NotSupported } from './base/errors.js';
import { Precise } from './base/Precise.js';
import { TICK_SIZE } from './base/functions/number.js';
import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
import type { Balances, Currency, Int, Market, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, Transaction } from './base/types.js';

//  ---------------------------------------------------------------------------

/**
 * @class oanda
 * @augments Exchange
 */
export default class oanda extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'oanda',
            'name': 'Oanda',
            // Crypto is offered to the following OANDA divisions:
            //    OANDA Global Markets
            //    OANDA Europe Markets (but not OANDA Europe Limited)
            //    OANDA Australia
            //    OANDA Asia Pacific.
            'countries': [ 'EN' ], // England
            'rateLimit': 8.34, // https://developer.oanda.com/rest-live-v20/development-guide/
            'version': 'v3',
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': true,
                'swap': true,
                'future': false,
                'option': false,
                'addMargin': false,
                'cancelAllOrders': false,
                'cancelOrder': true,
                'createMarketOrder': false,
                'createOrder': true,
                'createReduceOnlyOrder': false,
                'editOrder': true,
                'fetchBalance': true,
                'fetchCanceledOrders': true,
                'fetchClosedOrders': true,
                'fetchDepositAddress': false,
                'fetchDepositAddressesByNetwork': false,
                'fetchDeposits': false,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchIsolatedPositions': false,
                'fetchLedger': true,
                'fetchLeverage': true,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchOrdersByIds': true,
                'fetchOrderTrades': true,
                'fetchPosition': true, // removed because of emulation, will be implemented in base later
                'fetchPositions': true,
                'fetchPositionsRisk': undefined,
                'fetchPremiumIndexOHLCV': false,
                'fetchStatus': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchBidsAsks': true,
                'fetchTime': false,
                'fetchTrades': false,
                'fetchWithdrawals': false,
                'private': true,
                'public': false,
                'reduceMargin': false,
                'setLeverage': true,
                'setMarginMode': false,
                'withdraw': false,
            },
            'timeframes': {
                '5s': 'S5',
                '10s': 'S10',
                '15s': 'S15',
                '30s': 'S30',
                '1m': 'M1',
                '2m': 'M2',
                '4m': 'M4',
                '5m': 'M5',
                '10m': 'M10',
                '15m': 'M15',
                '30m': 'M30',
                '1h': 'H1',
                '2h': 'H2',
                '3h': 'H3',
                '4h': 'H4',
                '6h': 'H6',
                '8h': 'H8',
                '12h': 'H12',
                '1d': 'D',
                '1w': 'W',
                '1M': 'M',
            },
            'urls': {
                'logo': '',
                'api': {
                    'public': 'https://api-fxtrade.oanda.com',
                    'private': 'https://api-fxtrade.oanda.com',
                },
                'test': {
                    'public': 'https://api-fxpractice.oanda.com',
                    'private': 'https://api-fxpractice.oanda.com',
                },
                'www': 'https://www.oanda.com/',
                'doc': [
                    'https://developer.oanda.com/',
                    'https://oanda-api-v20.readthedocs.io/',
                ],
                'fees': [
                    'https://www.oanda.com/bvi-en/cfds/our-pricing/',
                ],
                'referral': '',
            },
            'api': {
                'public': {
                    'get': {
                    },
                },
                // apikey (account id) - https://www.oanda.com/funding/
                // secret - https://www.oanda.com/account/tpa/personal_token
                'private': {
                    'get': {
                        'accounts': 1,
                        'accounts/{accountID}': 1,
                        'accounts/{accountID}/summary': 1, // example response: same as above, but without 'trades'|'orders'|'positions' properties
                        'accounts/{accountID}/instruments': 1,
                        'accounts/{accountID}/changes': 1,
                        'instruments/{instrument}/candles': 1,
                        'instruments/{instrument}/orderBook': 1,
                        'instruments/{instrument}/positionBook': 1,
                        'instruments/{instrument}/recentHourlyOrderBooks': 1, // undocumented, as they have incomplete api
                        'instruments/{instrument}/recentHourlyPositionBooks': 1, // undocumented, as they have incomplete api
                        'accounts/{accountID}/orders': 1,
                        'accounts/{accountID}/pendingOrders': 1, // TO_DO
                        'accounts/{accountID}/orders/{orderSpecifier}': 1,
                        'accounts/{accountID}/trades': 1,
                        'accounts/{accountID}/trades/{tradeSpecifier}': 1,
                        'accounts/{accountID}/positions': 1,
                        'accounts/{accountID}/openPositions': 1,
                        'accounts/{accountID}/positions/{instrument}': 1,
                        'accounts/{accountID}/transactions': 1,
                        'accounts/{accountID}/transactions/{transactionID}': 1,
                        'accounts/{accountID}/transactions/idrange': 1,
                        'accounts/{accountID}/transactions/sinceid': 1,
                        'accounts/{accountID}/transactions/stream': 1,
                        'accounts/{accountID}/candles/latest': 1, // unclear difference compared to 'instrument/candles'
                        'accounts/{accountID}/pricing': 1,
                        'accounts/{accountID}/instruments/{instrument}/candles': 1, // unclear difference compared to 'instrument/candles'
                    },
                    'patch': {
                        'accounts/{accountID}/configuration': 1,
                    },
                    'post': {
                        'accounts/{accountID}/orders': 1,
                    },
                    'put': {
                        'accounts/{accountID}/orders/{orderSpecifier}': 1, // replace order (cancels & recreates)
                        'accounts/{accountID}/orders/{orderSpecifier}/cancel': 1,
                        'accounts/{accountID}/orders/{orderSpecifier}/clientExtensions': 1,
                        'accounts/{accountID}/trades/{tradeSpecifier}/close': 1,
                        'accounts/{accountID}/trades/{tradeSpecifier}/clientExtensions': 1,
                        'accounts/{accountID}/trades/{tradeSpecifier}/orders': 1,
                        'accounts/{accountID}/positions/{instrument}/close': 1,
                    },
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    // 'maker': 0.2 / 100,
                    // 'taker': 0.2 / 100,
                },
            },
            'options': {
                // Oanda has a buggy/incomplete api endpoint. They do return instruments, that work with some endpoints (also in UI charts, like CN50/USD: https://trade.oanda.com/ ) but, some of those instruments are not available for orderbooks, and from API, there is no way to find out which symbols have orderbooks and which doesn't have. So, I've hardcoded them according to the list from their Web-UI.
                'allowedOrdebookSymbols': [ 'AUD/JPY', 'AUD/USD', 'EUR/AUD', 'EUR/CHF', 'EUR/GBP', 'EUR/JPY', 'EUR/USD', 'GBP/CHF', 'GBP/JPY', 'GBP/USD', 'NZD/USD', 'USD/CAD', 'USD/CHF', 'USD/JPY', 'XAU/USD', 'XAG/USD' ],
            },
            'requiredCredentials': {
                'apiKey': true, // this needs to be an account-id
                'secret': true, // this needs to be a 'secret-token'
            },
            'commonCurrencies': {
            },
            'exceptions': {
                // https://developer.oanda.com/rest-live-v20/transaction-df/
                'exact': {
                    'UNITS_INVALID': BadRequest, // {"orderRejectTransaction":{"id":"64","accountID":"001-004-123456-001","userID":123456,"batchID":"64","requestID":"24910393117751396","time":"2022-02-06T07:40:36.837630106Z","type":"LIMIT_ORDER_REJECT","instrument":"EUR_USD","units":"0","price":"1212","timeInForce":"GTC","triggerCondition":"DEFAULT","partialFill":"DEFAULT","positionFill":"DEFAULT","reason":"CLIENT_ORDER","rejectReason":"UNITS_INVALID"},"relatedTransactionIDs":["64"],"lastTransactionID":"64","errorMessage":"Order units specified are invalid","errorCode":"UNITS_INVALID"}
                    'PRICE_INVALID': BadRequest,
                    'UNITS_LIMIT_EXCEEDED': BadRequest,
                    'oanda::rest::core::InvalidParameterException': BadRequest,
                    'ORDER_DOESNT_EXIST': OrderNotFound,
                    'NO_SUCH_ORDER': OrderNotFound,
                    'INVALID_PAGESIZE': BadRequest,
                    'MARGIN_RATE_INVALID': BadRequest,
                },
                'broad': {
                    'Maximum value for ': BadRequest, // {"errorMessage":"Maximum value for 'count' exceeded"}
                    "Invalid value specified for 'instrument'": BadSymbol, // {"errorMessage":"Invalid value specified for 'instrument'"}
                    'Invalid value specified for ': BadRequest, // {"errorMessage":"Invalid value specified for 'from'"}
                    ' is not a valid instrument.': BadSymbol,
                    'Invalid Instrument ': BadSymbol,
                    'The request was missing required data': BadRequest,
                    'The provided request was forbidden': AuthenticationError,
                    'Insufficient authorization to perform request': AuthenticationError,
                    'The order ID specified does not exist': OrderNotFound,
                    'The trade ID specified does not exist': BadRequest,
                    'The transaction ID specified does not exist': BadRequest,
                    'The units specified exceeds the maximum number of units allowed': BadRequest,
                    'The Order specified does not exist': OrderNotFound,
                    'The specified page size is invalid': BadRequest,
                    'The margin rate provided is invalid': BadRequest,
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name oanda#fetchMarkets
         * @description retrieves data on all markets for this exchange
         * @see https://developer.oanda.com/rest-live-v20/account-ep/
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} an array of objects representing market data
         */
        // possible 'type' param: 'CURRENCY', 'CFD', 'METAL'
        const response = await this.privateGetAccountsAccountIDInstruments (params);
        //
        //    {
        //        "instruments": [
        //            {
        //                "name": "EUR_AUD",
        //                "type": "CURRENCY",
        //                "displayName": "EUR/AUD",
        //                "pipLocation": "-4",
        //                "displayPrecision": "5",
        //                "tradeUnitsPrecision": "0",
        //                "minimumTradeSize": "1",
        //                "maximumTrailingStopDistance": "1.00000",
        //                "minimumTrailingStopDistance": "0.00050",
        //                "maximumPositionSize": "0",
        //                "maximumOrderUnits": "100000000",
        //                "marginRate": "5",
        //                "guaranteedStopLossOrderMode": "ALLOWED",
        //                "minimumGuaranteedStopLossDistance": "0.0010",
        //                "guaranteedStopLossOrderExecutionPremium": "0.001",
        //                "guaranteedStopLossOrderLevelRestriction": {
        //                    "volume": "1000000",
        //                    "priceRange": "0.0025"
        //                },
        //                "tags": [
        //                    { "type": "ASSET_CLASS", "name": "CURRENCY" },
        //                    { "type": "BRAIN_ASSET_CLASS", "name": "FX" }
        //                ],
        //                "financing": {
        //                    "longRate": "-0.0122",
        //                    "shortRate": "-0.0084",
        //                    "financingDaysOfWeek": [
        //                        { "dayOfWeek": "MONDAY", "daysCharged": "0" },
        //                        { "dayOfWeek": "TUESDAY", "daysCharged": "1" },
        //                        { "dayOfWeek": "WEDNESDAY", "daysCharged": "4" },
        //                        { "dayOfWeek": "THURSDAY", "daysCharged": "1" },
        //                        { "dayOfWeek": "FRIDAY", "daysCharged": "0" },
        //                        { "dayOfWeek": "SATURDAY", "daysCharged": "0" },
        //                        { "dayOfWeek": "SUNDAY", "daysCharged": "0" }
        //                    ]
        //                }
        //            }
        //        ],
        //        "lastTransactionID": "87"
        //    }
        //
        const data = this.safeValue (response, 'instruments');
        const result = [];
        for (let i = 0; i < data.length; i++) {
            const market = data[i];
            const id = this.safeString (market, 'name');
            const [ baseId, quoteId ] = id.split ('_');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const type = 'spot';
            result.push ({
                'id': id,
                'lowercaseId': id.toLowerCase (),
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'settle': undefined,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': undefined,
                'type': type,
                'spot': true,
                'margin': true,
                'swap': false,
                'future': false,
                'active': true,
                'option': false,
                'contract': false,
                'linear': undefined,
                'inverse': undefined,
                'taker': this.safeNumber (market, 'takerFee'),
                'maker': this.safeNumber (market, 'makerFee'),
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': this.safeNumber (market, 'tradeUnitsPrecision'),
                    'price': this.safeNumber (market, 'displayPrecision'),
                },
                'limits': {
                    'leverage': {
                        'min': this.parseNumber ('1'),
                        'max': undefined,
                    },
                    'amount': {
                        'min': this.safeString (market, 'minimumTradeSize'),
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
                'info': market,
                'created': undefined,
            });
        }
        return result;
    }

    async fetchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        /**
         * @method
         * @name oanda#fetchOHLCV
         * @see https://developer.oanda.com/rest-live-v20/instrument-ep/
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int} [since] timestamp in ms of the earliest candle to fetch
         * @param {int} [limit] the maximum amount of candles to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
         * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'instrument': market['id'],
            'granularity': this.timeframes[timeframe],
            'price': 'BMA', // https://developer.oanda.com/rest-live-v20/primitives-df/#PricingComponent
        };
        // from & to : 'RFC 3339' or 'UNIX' format
        if (since !== undefined) {
            const start = Math.round (since / 1000);
            request['from'] = start.toString;
        }
        if (limit !== undefined) {
            request['count'] = Math.min (limit, 5000);
        }
        const response = await this.privateGetInstrumentsInstrumentCandles (this.extend (request, params));
        //
        //    {
        //        "instrument": "EUR_USD",
        //        "granularity": "M1",
        //        "candles": [
        //            {
        //                "complete": false,
        //                "volume": "18",
        //                "time": "2023-12-29T15:22:00.000000000Z",
        //                "bid": { // if 'B' flag was sent
        //                    "o": "1.10714",
        //                    "h": "1.10719",
        //                    "l": "1.10711",
        //                    "c": "1.10718"
        //                },
        //                "mid": { // if 'M' flag was sent
        //                    "o": "1.10722",
        //                    "h": "1.10728",
        //                    "l": "1.10719",
        //                    "c": "1.10726"
        //                },
        //                "ask": { // if 'A' flag was sent
        //                    "o": "1.10730",
        //                    "h": "1.10736",
        //                    "l": "1.10727",
        //                    "c": "1.10734"
        //                }
        //            }
        //        ]
        //    }
        //
        const data = this.safeValue (response, 'candles', []);
        return this.parseOHLCVs (data, market, timeframe, since, limit);
    }

    parseOHLCV (ohlcv, market: Market = undefined): OHLCV {
        // example response is present in fetchCandles
        const dateString = this.safeString (ohlcv, 'time');
        const timestamp = this.parseDate (dateString);
        const bidObject = this.safeValue (ohlcv, 'bid');
        const askObject = this.safeValue (ohlcv, 'ask');
        const midObject = this.safeValue (ohlcv, 'mid');
        return [
            timestamp,
            this.safeNumber (midObject, 'o'),
            this.safeNumber (askObject, 'h'),
            this.safeNumber (bidObject, 'l'),
            this.safeNumber (midObject, 'c'),
            this.safeNumber (ohlcv, 'volume'),
        ];
    }

    async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        /**
         * @method
         * @name oanda#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        const data = await this.fetchTickers ([ symbol ], params);
        return this.safeValue (data, symbol, {});
    }

    async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        /**
         * @method
         * @name oanda#fetchTickers
         * @see https://developer.oanda.com/rest-live-v20/pricing-ep/
         * @description fetches price tickers for multiple markets
         * @param {string[]|undefined} symbols unified symbols of the markets to fetch the data for, all markets are returned if not assigned
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        return await this.fetchBidsAsks (symbols, params);
    }

    async fetchBidsAsks (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        /**
         * @method
         * @name oanda#fetchBidsAsks
         * @see https://developer.oanda.com/rest-live-v20/pricing-ep/
         * @description fetches the bid and ask price and volume for multiple markets
         * @param {string[]|undefined} symbols unified symbols of the markets to fetch the data for, all markets are returned if not assigned
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        let selectedSymbols = this.symbols; // all symbols by default
        if (symbols !== undefined) {
            selectedSymbols = symbols;
        }
        const ids = [];
        for (let i = 0; i < selectedSymbols.length; i++) {
            const symbol = selectedSymbols[i];
            const market = this.market (symbol);
            ids.push (market['id']);
        }
        const request = {
            'instruments': ids.join (','),
        };
        const response = await this.privateGetAccountsAccountIDPricing (this.extend (request, params));
        //
        //    {
        //        "time": "2023-12-29T15:27:27.829226066Z",
        //        "prices": [
        //            {
        //                "type": "PRICE",
        //                "time": "2023-12-29T15:27:26.635352820Z",
        //                "bids": [
        //                    { "price": "7.721", "liquidity": "3000000" }
        //                ],
        //                "asks": [
        //                    { "price": "7.732",  "liquidity": "3000000" }
        //                ],
        //                "closeoutBid": "7.721",
        //                "closeoutAsk": "7.732",
        //                "status": "tradeable",
        //                "tradeable": true,
        //                "quoteHomeConversionFactors": {
        //                    "positiveUnits": "0.00707394",
        //                    "negativeUnits": "0.00707489"
        //                },
        //                "instrument": "ZAR_JPY"
        //            }
        //        ]
        //    }
        //
        const prices = this.safeValue (response, 'prices', []);
        return this.parseTickers (prices, symbols, params);
    }

    parseTicker (ticker, market: Market = undefined): Ticker {
        const marketId = this.safeString (ticker, 'instrument');
        market = this.safeMarket (marketId, market);
        // const status = this.safeString (ticker, 'status') === 'tradeable';
        const date = this.safeString (ticker, 'time');
        const timestamp = this.parseDate (date);
        const bids = this.safeValue (ticker, 'bids');
        const asks = this.safeValue (ticker, 'asks');
        const bidBestObject = this.safeValue (bids, 0);
        const askBestObject = this.safeValue (asks, 0);
        const bidPrice = this.safeNumber (bidBestObject, 'price');
        const bidVolume = this.safeNumber (bidBestObject, 'liquidity');
        const askPrice = this.safeNumber (askBestObject, 'price');
        const askVolume = this.safeNumber (askBestObject, 'liquidity');
        return this.safeTicker ({
            'symbol': market['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': undefined,
            'low': undefined,
            'bid': bidPrice,
            'bidVolume': bidVolume,
            'ask': askPrice,
            'askVolume': askVolume,
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'last': undefined,
            'previousClose': undefined,
            'change': undefined,
            'percentage': this.safeString (ticker, 'percentChange'),
            'average': undefined,
            'baseVolume': this.safeString (ticker, 'baseVolume'),
            'quoteVolume': this.safeString (ticker, 'quoteVolume'),
            'info': ticker,
        }, market);
    }

    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        /**
         * @method
         * @name oanda#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @see https://developer.oanda.com/rest-live-v20/instrument-ep/
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int} [limit] the maximum amount of order book entries to return
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        // Note: Oanda doesn't provide orderbooks for all markets. Check options['allowedOrdebookSymbols'] for allowed symbols.
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'instrument': market['id'],
        };
        const response = await this.privateGetInstrumentsInstrumentOrderBook (this.extend (request, params));
        //
        //    {
        //        "orderBook": {
        //            "instrument": "EUR_USD",
        //            "time": "2023-12-29T16:00:00Z",
        //            "unixTime": "1703865600",
        //            "price": "1.10474",
        //            "bucketWidth": "0.00050",
        //            "buckets": [
        //                {
        //                    "price": "1.10400",
        //                    "longCountPercent": "0.0035",
        //                    "shortCountPercent": "0.0035"
        //                },
        //                {
        //                    "price": "1.10450",
        //                    "longCountPercent": "0.0105",
        //                    "shortCountPercent": "0.0000"
        //                },
        //                {
        //                    "price": "1.10500",
        //                    "longCountPercent": "0.0105",
        //                    "shortCountPercent": "0.0000"
        //                },
        //                ...
        //            ]
        //        }
        //    }
        //
        const orderbookObject = this.safeValue (response, 'orderBook');
        const timestamp = this.safeTimestamp (orderbookObject, 'unixTime');
        return this.parseOrderBook (orderbookObject, symbol, timestamp);
    }

    parseOrderBook (orderbook: object, symbol: string, timestamp: Int = undefined, bidsKey = 'bids', asksKey = 'asks', priceKey = 0, amountKey = 1): OrderBook {
        // the prices are distanced by bucketWidth
        // to understand, read more info at: https://developer.oanda.com/rest-live-v20/instrument-df/#OrderBook
        const marketId = this.safeString (orderbook, 'instrument');
        const market = this.safeMarket (marketId, undefined);
        const buckets = this.safeValue (orderbook, 'buckets', []);
        const bucketWidth = this.safeValue (orderbook, 'bucketWidth');
        const medianPrice = this.safeString (orderbook, 'price');
        const bids = [];
        const asks = [];
        for (let i = 0; i < buckets.length; i++) {
            const bucket = buckets[i];
            const bucketPriceBegin = this.safeString (bucket, 'price');
            const bucketPriceEnd = Precise.stringAdd (bucketPriceBegin, bucketWidth);
            // we need to use "begin" price for bids, and "end" price for asks
            const longCountPercent = this.safeString (bucket, 'longCountPercent');
            const shortCountPercent = this.safeString (bucket, 'shortCountPercent');
            const hasLongOrders = Precise.stringGt (longCountPercent, '0');
            const hasShortOrders = Precise.stringGt (shortCountPercent, '0');
            const deviationPercent = '1.5'; // 50%
            const medianUpper = Precise.stringMul (medianPrice, deviationPercent);
            const medianLower = Precise.stringDiv (medianPrice, deviationPercent);
            // volumes are percentage of orders for this bucket, there is no way to calculate absolute volume for bidask
            if (hasLongOrders && Precise.stringLt (bucketPriceBegin, medianUpper)) {
                bids.push ([ this.parseNumber (bucketPriceBegin), this.parseNumber (longCountPercent) ]);
            }
            if (hasShortOrders && Precise.stringGt (bucketPriceEnd, medianLower)) {
                asks.push ([ this.parseNumber (bucketPriceEnd), this.parseNumber (shortCountPercent) ]);
            }
        }
        return {
            // @ts-ignore
            'symbol': market['symbol'],
            'bids': this.sortBy (bids, 0, true),
            'asks': this.sortBy (asks, 0),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'nonce': undefined,
        };
    }

    buildOrderRequest (symbol: string, type: OrderType, side: OrderSide, amount, price = undefined, params = {}) {
        const market = this.market (symbol);
        amount = this.amountToPrecision (symbol, amount);
        const units = side === 'buy' ? amount : -amount; // A positive number of units results in a long Order, and a negative number of units results in a short Order. 
        const requestOrder = {
            'instrument': market['id'],
            // timeInForce : (TimeInForce, required, default=GTC),
            'type': this.convertOrderType (type), // todo: Doc says probably incorrectly (""... 'LIMIT' when creating a Market Order..."). while in example "timeInForce": "FOK", & "type": "MARKET"
            'units': units,
        };
        if (price !== undefined) {
            requestOrder['price'] = this.priceToPrecision (symbol, price);
        }
        return { 'order': requestOrder };
    }

    parseOrderStatus (status) {
        const statuses = {
            'PENDING': 'open',
            'FILLED': 'closed',
            'TRIGGERED': 'closed',
            'CANCELLED': 'canceled',
            'REJECTED': 'rejected',
        };
        return this.safeString (statuses, status, status);
    }

    convertOrderType (status) {
        const statuses = {
            'MARKET': 'market',
            'LIMIT': 'limit',
            'STOP': 'stop',
            // 'GUARANTEED_STOP_LOSS': 'stop-limit',
            // 'STOP_LOSS': 'stop-loss',
            // 'TAKE_PROFIT': 'take-profit',
            // 'MARKET_IF_TOUCHED': 'mit',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrderTransactionType (status) {
        const statuses = {
            'MARKET_ORDER': 'market',
            'LIMIT_ORDER': 'limit',
            'STOP_ORDER': 'stop',
            // 'GUARANTEED_STOP_LOSS_ORDER': 'stop-limit',
            // 'STOP_LOSS_ORDER': 'stop-loss',
            // 'TAKE_PROFIT_ORDER': 'take-profit',
            // 'MARKET_IF_TOUCHED_ORDER': 'mit',
            // statuses
            'ORDER_CANCEL': 'cancel',
            'ORDER_FILL': 'close',
        };
        return this.safeString (statuses, status, status);
    }

    parseTimeInForce (timeInForce) {
        const statuses = {
            'GTC': 'GTC',
            'IOC': 'IOC',
            'FOK': 'FOK',
            'GTD': 'GTD',
        };
        return this.safeString (statuses, timeInForce, timeInForce);
    }

    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name oanda#createOrder
         * @description create a trade order
         * @see https://developer.oanda.com/rest-live-v20/order-ep/
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float} [price] the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const request = this.buildOrderRequest (symbol, type, side, amount, price, params);
        const response = await this.privatePostAccountsAccountIDOrders (this.extend (request, params));
        //
        //     {
        //         orderCreateTransaction: {
        //             id: '13',
        //             accountID: '001-004-1234567-001',
        //             userID: '1234567',
        //             batchID: '13',
        //             requestID: '132995756821141501',
        //             time: '2022-02-03T11:38:15.490811234Z',
        //             type: 'LIMIT_ORDER',
        //             instrument: 'USD_JPY',
        //             units: '-1',
        //             price: '101.000',
        //             timeInForce: 'GTC',
        //             triggerCondition: 'DEFAULT',
        //             partialFill: 'DEFAULT',
        //             positionFill: 'DEFAULT',
        //             reason: 'CLIENT_ORDER'
        //         },
        //
        //         // Note: if order crosses orderBook, then the response has 'orderFillTransaction' member too
        //
        //         orderFillTransaction: {
        //             id: '14',
        //             accountID: '001-004-1234567-001',
        //             userID: '1234567',
        //             batchID: '13',
        //             requestID: '132995756821489501',
        //             time: '2022-02-03T11:38:15.490811234Z',
        //             type: 'ORDER_FILL',
        //             orderID: '13',
        //             instrument: 'USD_JPY',
        //             units: '-1',
        //             requestedUnits: '-1',
        //             price: '114.824',
        //             pl: '0.0000',
        //             quotePL: '0',
        //             financing: '0.0000',
        //             baseFinancing: '0',
        //             commission: '0.0000',
        //             accountBalance: '20.0000',
        //             gainQuoteHomeConversionFactor: '0.008664945317',
        //             lossQuoteHomeConversionFactor: '0.008752030194',
        //             guaranteedExecutionFee: '0.0000',
        //             quoteGuaranteedExecutionFee: '0',
        //             halfSpreadCost: '0.0001',
        //             fullVWAP: '114.824',
        //             reason: 'LIMIT_ORDER',
        //             tradeOpened: [Object],
        //             fullPrice: [Object],
        //             homeConversionFactors: [Object]
        //         },
        //
        //         // Note: if order is rejected, then the response has 'orderCancelTransaction' member too
        //
        //         orderCancelTransaction: {
        //             id: '69',
        //             accountID: '001-004-1234567-001',
        //             userID: '1234567',
        //             batchID: '68',
        //             requestID: '24910396909826154',
        //             time: '2022-02-06T07:55:40.491081947Z',
        //             type: 'ORDER_CANCEL',
        //             orderID: '68',
        //             reason: 'MARKET_HALTED'
        //         },
        //         relatedTransactionIDs: [ '13', '14' ],
        //         lastTransactionID: '14'
        //     }
        //
        const market = this.market (symbol);
        return this.parseOrder (response, market);
    }

    async editOrder (id, symbol: string, type: OrderType, side: OrderSide, amount = undefined, price = undefined, params = {}) {
        /**
         * @method
         * @name oanda#editOrder
         * @description edit a trade order
         * @see https://developer.oanda.com/rest-live-v20/order-ep/#collapse_endpoint_5
         * @param {string} id cancel order id
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float} [price] the price at which the order is to be fullfilled, in units of the base currency, ignored in market orders
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const request = this.buildOrderRequest (symbol, type, side, amount, price, params);
        request['orderSpecifier'] = id;
        const response = await this.privatePutAccountsAccountIDOrdersOrderSpecifier (this.extend (request, params));
        //
        //     {
        //         orderCancelTransaction: {
        //             id: '43',
        //             accountID: '001-004-1234567-001',
        //             userID: '1234567',
        //             batchID: '43',
        //             requestID: '114981813471441232',
        //             time: '2022-02-04T17:46:54.522571338Z',
        //             type: 'ORDER_CANCEL',
        //             orderID: '42',
        //             replacedByOrderID: '44',
        //             reason: 'CLIENT_REQUEST_REPLACED'
        //         },
        //         orderCreateTransaction: {
        //             id: '44',
        //             accountID: '001-004-1234567-001',
        //             userID: '1234567',
        //             batchID: '43',
        //             requestID: '114981813471441232',
        //             time: '2022-02-04T17:46:54.522571338Z',
        //             type: 'LIMIT_ORDER',
        //             instrument: 'EUR_USD',
        //             units: '1',
        //             price: '0.98700',
        //             timeInForce: 'GTC',
        //             triggerCondition: 'DEFAULT',
        //             partialFill: 'DEFAULT',
        //             positionFill: 'DEFAULT',
        //             reason: 'REPLACEMENT',
        //             replacesOrderID: '42'
        //         },
        //         relatedTransactionIDs: [ '43', '44' ],
        //         lastTransactionID: '44'
        //     }
        //
        const market = this.market (symbol);
        return this.parseOrder (response, market);
    }

    async cancelOrder (id: string, symbol: Str = undefined, params = {}) {
        /**
         * @method
         * @name oanda#cancelOrder
         * @description cancels an open order
         * @see https://developer.oanda.com/rest-live-v20/order-ep/#collapse_endpoint_7
         * @param {string} id order id
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const request = {
            'orderSpecifier': id,
        };
        const response = await this.privatePutAccountsAccountIDOrdersOrderSpecifierCancel (this.extend (request, params));
        //
        //     {
        //         orderCancelTransaction: {
        //           id: '51',
        //           accountID: '001-004-1234567-001',
        //           userID: '1234567',
        //           batchID: '51',
        //           requestID: '78953047329468193',
        //           time: '2022-02-04T17:58:18.182828031Z',
        //           type: 'ORDER_CANCEL',
        //           orderID: '50',
        //           reason: 'CLIENT_REQUEST'
        //         },
        //         relatedTransactionIDs: [ '51' ],
        //         lastTransactionID: '51'
        //     }
        //
        return this.parseOrder (response);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        if (path.indexOf ('{accountID}') >= 0) { // when accountID is in path, but not provided, use the default one
            params['accountID'] = this.safeValue (params, 'accountID', this.apiKey);
        }
        let url = this.urls['api'][api] + '/' + this.version + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (method === 'GET' && Object.keys (query).length) {
            url += '?' + this.urlencode (query);
        }
        if (api === 'private') {
            this.checkRequiredCredentials ();
            const timestamp = this.milliseconds ().toString ();
            if (method !== 'GET') {
                body = this.json (query);
            }
            headers = {
                'Authorization': 'Bearer ' + this.secret,
                'Content-Type': 'application/json',
                'timestamp': timestamp,
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (!response) {
            return; // fallback to default error handler
        }
        const errorMessage = this.safeString (response, 'errorMessage', '');
        const errorCode = this.safeString (response, 'errorCode', '');
        if (errorMessage !== '') {
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], errorMessage, feedback);
            throw new ExchangeError (feedback); // unknown message
        }
    }
}
