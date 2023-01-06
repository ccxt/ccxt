'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { AuthenticationError, ExchangeError, PermissionDenied, BadRequest, ArgumentsRequired, OrderNotFound, InsufficientFunds, ExchangeNotAvailable, DDoSProtection, InvalidAddress, InvalidOrder } = require ('./base/errors');
const { TICK_SIZE } = require ('./base/functions/number');
const Precise = require ('./base/Precise');

//  ---------------------------------------------------------------------------

module.exports = class bitpanda extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitpanda',
            'name': 'Bitpanda Pro',
            'countries': [ 'AT' ], // Austria
            'rateLimit': 300,
            'version': 'v1',
            // new metainfo interface
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'addMargin': false,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'cancelOrders': true,
                'createDepositAddress': true,
                'createOrder': true,
                'createReduceOnlyOrder': false,
                'fetchAccounts': false,
                'fetchBalance': true,
                'fetchBorrowRate': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchBorrowRates': false,
                'fetchBorrowRatesPerSymbol': false,
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchDeposit': false,
                'fetchDepositAddress': true,
                'fetchDepositAddresses': false,
                'fetchDeposits': true,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchLedger': false,
                'fetchLeverage': false,
                'fetchMarginMode': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': false,
                'fetchOrderTrades': true,
                'fetchPosition': false,
                'fetchPositionMode': false,
                'fetchPositions': false,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': true,
                'fetchTransactionFee': false,
                'fetchTransactionFees': false,
                'fetchTransactions': false,
                'fetchTransfer': false,
                'fetchTransfers': false,
                'fetchWithdrawal': false,
                'fetchWithdrawals': true,
                'privateAPI': true,
                'publicAPI': true,
                'reduceMargin': false,
                'setLeverage': false,
                'setMargin': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'transfer': false,
                'withdraw': true,
            },
            'timeframes': {
                '1m': '1/MINUTES',
                '5m': '5/MINUTES',
                '15m': '15/MINUTES',
                '30m': '30/MINUTES',
                '1h': '1/HOURS',
                '4h': '4/HOURS',
                '1d': '1/DAYS',
                '1w': '1/WEEKS',
                '1M': '1/MONTHS',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/51840849/87591171-9a377d80-c6f0-11ea-94ac-97a126eac3bc.jpg',
                'api': {
                    'public': 'https://api.exchange.bitpanda.com/public',
                    'private': 'https://api.exchange.bitpanda.com/public',
                },
                'www': 'https://www.bitpanda.com/en/pro',
                'doc': [
                    'https://developers.bitpanda.com/exchange/',
                ],
                'fees': 'https://www.bitpanda.com/en/pro/fees',
            },
            'api': {
                'public': {
                    'get': [
                        'currencies',
                        'candlesticks/{instrument_code}',
                        'fees',
                        'instruments',
                        'order-book/{instrument_code}',
                        'market-ticker',
                        'market-ticker/{instrument_code}',
                        'price-ticks/{instrument_code}',
                        'time',
                    ],
                },
                'private': {
                    'get': [
                        'account/balances',
                        'account/deposit/crypto/{currency_code}',
                        'account/deposit/fiat/EUR',
                        'account/deposits',
                        'account/deposits/bitpanda',
                        'account/withdrawals',
                        'account/withdrawals/bitpanda',
                        'account/fees',
                        'account/orders',
                        'account/orders/{order_id}',
                        'account/orders/{order_id}/trades',
                        'account/trades',
                        'account/trades/{trade_id}',
                        'account/trading-volume',
                    ],
                    'post': [
                        'account/deposit/crypto',
                        'account/withdraw/crypto',
                        'account/withdraw/fiat',
                        'account/fees',
                        'account/orders',
                    ],
                    'delete': [
                        'account/orders',
                        'account/orders/{order_id}',
                        'account/orders/client/{client_id}',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'taker': this.parseNumber ('0.0015'),
                    'maker': this.parseNumber ('0.001'),
                    'tiers': [
                        // volume in BTC
                        {
                            'taker': [
                                [ this.parseNumber ('0'), this.parseNumber ('0.0015') ],
                                [ this.parseNumber ('100'), this.parseNumber ('0.0013') ],
                                [ this.parseNumber ('250'), this.parseNumber ('0.0013') ],
                                [ this.parseNumber ('1000'), this.parseNumber ('0.001') ],
                                [ this.parseNumber ('5000'), this.parseNumber ('0.0009') ],
                                [ this.parseNumber ('10000'), this.parseNumber ('0.00075') ],
                                [ this.parseNumber ('20000'), this.parseNumber ('0.00065') ],
                            ],
                            'maker': [
                                [ this.parseNumber ('0'), this.parseNumber ('0.001') ],
                                [ this.parseNumber ('100'), this.parseNumber ('0.001') ],
                                [ this.parseNumber ('250'), this.parseNumber ('0.0009') ],
                                [ this.parseNumber ('1000'), this.parseNumber ('0.00075') ],
                                [ this.parseNumber ('5000'), this.parseNumber ('0.0006') ],
                                [ this.parseNumber ('10000'), this.parseNumber ('0.0005') ],
                                [ this.parseNumber ('20000'), this.parseNumber ('0.0005') ],
                            ],
                        },
                    ],
                },
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': false,
            },
            'precisionMode': TICK_SIZE,
            'exceptions': {
                'exact': {
                    'INVALID_CLIENT_UUID': InvalidOrder,
                    'ORDER_NOT_FOUND': OrderNotFound,
                    'ONLY_ONE_ERC20_ADDRESS_ALLOWED': InvalidAddress,
                    'DEPOSIT_ADDRESS_NOT_USED': InvalidAddress,
                    'INVALID_CREDENTIALS': AuthenticationError,
                    'MISSING_CREDENTIALS': AuthenticationError,
                    'INVALID_APIKEY': AuthenticationError,
                    'INVALID_SCOPES': AuthenticationError,
                    'INVALID_SUBJECT': AuthenticationError,
                    'INVALID_ISSUER': AuthenticationError,
                    'INVALID_AUDIENCE': AuthenticationError,
                    'INVALID_DEVICE_ID': AuthenticationError,
                    'INVALID_IP_RESTRICTION': AuthenticationError,
                    'APIKEY_REVOKED': AuthenticationError,
                    'APIKEY_EXPIRED': AuthenticationError,
                    'SYNCHRONIZER_TOKEN_MISMATCH': AuthenticationError,
                    'SESSION_EXPIRED': AuthenticationError,
                    'INTERNAL_ERROR': AuthenticationError,
                    'CLIENT_IP_BLOCKED': PermissionDenied,
                    'MISSING_PERMISSION': PermissionDenied,
                    'ILLEGAL_CHARS': BadRequest,
                    'UNSUPPORTED_MEDIA_TYPE': BadRequest,
                    'ACCOUNT_HISTORY_TIME_RANGE_TOO_BIG': BadRequest,
                    'CANDLESTICKS_TIME_RANGE_TOO_BIG': BadRequest,
                    'INVALID_INSTRUMENT_CODE': BadRequest,
                    'INVALID_ORDER_TYPE': BadRequest,
                    'INVALID_UNIT': BadRequest,
                    'INVALID_PERIOD': BadRequest,
                    'INVALID_TIME': BadRequest,
                    'INVALID_DATE': BadRequest,
                    'INVALID_CURRENCY': BadRequest,
                    'INVALID_AMOUNT': BadRequest,
                    'INVALID_PRICE': BadRequest,
                    'INVALID_LIMIT': BadRequest,
                    'INVALID_QUERY': BadRequest,
                    'INVALID_CURSOR': BadRequest,
                    'INVALID_ACCOUNT_ID': BadRequest,
                    'INVALID_SIDE': InvalidOrder,
                    'INVALID_ACCOUNT_HISTORY_FROM_TIME': BadRequest,
                    'INVALID_ACCOUNT_HISTORY_MAX_PAGE_SIZE': BadRequest,
                    'INVALID_ACCOUNT_HISTORY_TIME_PERIOD': BadRequest,
                    'INVALID_ACCOUNT_HISTORY_TO_TIME': BadRequest,
                    'INVALID_CANDLESTICKS_GRANULARITY': BadRequest,
                    'INVALID_CANDLESTICKS_UNIT': BadRequest,
                    'INVALID_ORDER_BOOK_DEPTH': BadRequest,
                    'INVALID_ORDER_BOOK_LEVEL': BadRequest,
                    'INVALID_PAGE_CURSOR': BadRequest,
                    'INVALID_TIME_RANGE': BadRequest,
                    'INVALID_TRADE_ID': BadRequest,
                    'INVALID_UI_ACCOUNT_SETTINGS': BadRequest,
                    'NEGATIVE_AMOUNT': InvalidOrder,
                    'NEGATIVE_PRICE': InvalidOrder,
                    'MIN_SIZE_NOT_SATISFIED': InvalidOrder,
                    'BAD_AMOUNT_PRECISION': InvalidOrder,
                    'BAD_PRICE_PRECISION': InvalidOrder,
                    'BAD_TRIGGER_PRICE_PRECISION': InvalidOrder,
                    'MAX_OPEN_ORDERS_EXCEEDED': BadRequest,
                    'MISSING_PRICE': InvalidOrder,
                    'MISSING_ORDER_TYPE': InvalidOrder,
                    'MISSING_SIDE': InvalidOrder,
                    'MISSING_CANDLESTICKS_PERIOD_PARAM': ArgumentsRequired,
                    'MISSING_CANDLESTICKS_UNIT_PARAM': ArgumentsRequired,
                    'MISSING_FROM_PARAM': ArgumentsRequired,
                    'MISSING_INSTRUMENT_CODE': ArgumentsRequired,
                    'MISSING_ORDER_ID': InvalidOrder,
                    'MISSING_TO_PARAM': ArgumentsRequired,
                    'MISSING_TRADE_ID': ArgumentsRequired,
                    'INVALID_ORDER_ID': OrderNotFound,
                    'NOT_FOUND': OrderNotFound,
                    'INSUFFICIENT_LIQUIDITY': InsufficientFunds,
                    'INSUFFICIENT_FUNDS': InsufficientFunds,
                    'NO_TRADING': ExchangeNotAvailable,
                    'SERVICE_UNAVAILABLE': ExchangeNotAvailable,
                    'GATEWAY_TIMEOUT': ExchangeNotAvailable,
                    'RATELIMIT': DDoSProtection,
                    'CF_RATELIMIT': DDoSProtection,
                    'INTERNAL_SERVER_ERROR': ExchangeError,
                },
                'broad': {
                },
            },
            'commonCurrencies': {
                'MIOTA': 'IOTA', // https://github.com/ccxt/ccxt/issues/7487
            },
            // exchange-specific options
            'options': {
                'fetchTradingFees': {
                    'method': 'fetchPrivateTradingFees', // or 'fetchPublicTradingFees'
                },
                'fiat': [ 'EUR', 'CHF' ],
            },
        });
    }

    async fetchTime (params = {}) {
        /**
         * @method
         * @name bitpanda#fetchTime
         * @description fetches the current integer timestamp in milliseconds from the exchange server
         * @param {object} params extra parameters specific to the bitpanda api endpoint
         * @returns {int} the current integer timestamp in milliseconds from the exchange server
         */
        const response = await this.publicGetTime (params);
        //
        //     {
        //         iso: '2020-07-10T05:17:26.716Z',
        //         epoch_millis: 1594358246716,
        //     }
        //
        return this.safeInteger (response, 'epoch_millis');
    }

    async fetchCurrencies (params = {}) {
        /**
         * @method
         * @name bitpanda#fetchCurrencies
         * @description fetches all available currencies on an exchange
         * @param {object} params extra parameters specific to the bitpanda api endpoint
         * @returns {object} an associative dictionary of currencies
         */
        const response = await this.publicGetCurrencies (params);
        //
        //     [
        //         {
        //             "code":"BEST",
        //             "precision":8
        //         }
        //     ]
        //
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const currency = response[i];
            const id = this.safeString (currency, 'code');
            const code = this.safeCurrencyCode (id);
            result[code] = {
                'id': id,
                'code': code,
                'name': undefined,
                'info': currency, // the original payload
                'active': undefined,
                'fee': undefined,
                'precision': this.parseNumber (this.parsePrecision (this.safeString (currency, 'precision'))),
                'withdraw': undefined,
                'deposit': undefined,
                'limits': {
                    'amount': { 'min': undefined, 'max': undefined },
                    'withdraw': { 'min': undefined, 'max': undefined },
                },
            };
        }
        return result;
    }

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name bitpanda#fetchMarkets
         * @description retrieves data on all markets for bitpanda
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {[object]} an array of objects representing market data
         */
        const response = await this.publicGetInstruments (params);
        //
        //     [
        //         {
        //             state: 'ACTIVE',
        //             base: { code: 'ETH', precision: 8 },
        //             quote: { code: 'CHF', precision: 2 },
        //             amount_precision: 4,
        //             market_precision: 2,
        //             min_size: '10.0'
        //         }
        //     ]
        //
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const market = response[i];
            const baseAsset = this.safeValue (market, 'base', {});
            const quoteAsset = this.safeValue (market, 'quote', {});
            const baseId = this.safeString (baseAsset, 'code');
            const quoteId = this.safeString (quoteAsset, 'code');
            const id = baseId + '_' + quoteId;
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const state = this.safeString (market, 'state');
            result.push ({
                'id': id,
                'symbol': base + '/' + quote,
                'base': base,
                'quote': quote,
                'settle': undefined,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': undefined,
                'type': 'spot',
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'active': (state === 'ACTIVE'),
                'contract': false,
                'linear': undefined,
                'inverse': undefined,
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': this.parseNumber (this.parsePrecision (this.safeString (market, 'amount_precision'))),
                    'price': this.parseNumber (this.parsePrecision (this.safeString (market, 'market_precision'))),
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'cost': {
                        'min': this.safeNumber (market, 'min_size'),
                        'max': undefined,
                    },
                },
                'info': market,
            });
        }
        return result;
    }

    async fetchTradingFees (params = {}) {
        /**
         * @method
         * @name bitpanda#fetchTradingFees
         * @description fetch the trading fees for multiple markets
         * @param {object} params extra parameters specific to the bitpanda api endpoint
         * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/en/latest/manual.html#fee-structure} indexed by market symbols
         */
        let method = this.safeString (params, 'method');
        params = this.omit (params, 'method');
        if (method === undefined) {
            const options = this.safeValue (this.options, 'fetchTradingFees', {});
            method = this.safeString (options, 'method', 'fetchPrivateTradingFees');
        }
        return await this[method] (params);
    }

    async fetchPublicTradingFees (params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetFees (params);
        //
        //     [
        //         {
        //             "fee_group_id":"default",
        //             "display_text":"The standard fee plan.",
        //             "fee_tiers":[
        //                 {"volume":"0.0","fee_group_id":"default","maker_fee":"0.1","taker_fee":"0.15"},
        //                 {"volume":"100.0","fee_group_id":"default","maker_fee":"0.1","taker_fee":"0.13"},
        //                 {"volume":"250.0","fee_group_id":"default","maker_fee":"0.09","taker_fee":"0.13"},
        //                 {"volume":"1000.0","fee_group_id":"default","maker_fee":"0.075","taker_fee":"0.1"},
        //                 {"volume":"5000.0","fee_group_id":"default","maker_fee":"0.06","taker_fee":"0.09"},
        //                 {"volume":"10000.0","fee_group_id":"default","maker_fee":"0.05","taker_fee":"0.075"},
        //                 {"volume":"20000.0","fee_group_id":"default","maker_fee":"0.05","taker_fee":"0.065"}
        //             ],
        //             "fee_discount_rate":"25.0",
        //             "minimum_price_value":"0.12"
        //         }
        //     ]
        //
        const first = this.safeValue (response, 0, {});
        const feeTiers = this.safeValue (first, 'fee_tiers');
        const tiers = this.parseFeeTiers (feeTiers);
        const firstTier = this.safeValue (feeTiers, 0, {});
        const result = {};
        for (let i = 0; i < this.symbols.length; i++) {
            const symbol = this.symbols[i];
            result[symbol] = {
                'info': first,
                'symbol': symbol,
                'maker': this.safeNumber (firstTier, 'maker_fee'),
                'taker': this.safeNumber (firstTier, 'taker_fee'),
                'percentage': true,
                'tierBased': true,
                'tiers': tiers,
            };
        }
        return result;
    }

    async fetchPrivateTradingFees (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetAccountFees (params);
        //
        //     {
        //         "account_id": "ed524d00-820a-11e9-8f1e-69602df16d85",
        //         "running_trading_volume": "0.0",
        //         "fee_group_id": "default",
        //         "collect_fees_in_best": false,
        //         "fee_discount_rate": "25.0",
        //         "minimum_price_value": "0.12",
        //         "fee_tiers": [
        //             { "volume": "0.0", "fee_group_id": "default", "maker_fee": "0.1", "taker_fee": "0.1" },
        //             { "volume": "100.0", "fee_group_id": "default", "maker_fee": "0.09", "taker_fee": "0.1" },
        //             { "volume": "250.0", "fee_group_id": "default", "maker_fee": "0.08", "taker_fee": "0.1" },
        //             { "volume": "1000.0", "fee_group_id": "default", "maker_fee": "0.07", "taker_fee": "0.09" },
        //             { "volume": "5000.0", "fee_group_id": "default", "maker_fee": "0.06", "taker_fee": "0.08" },
        //             { "volume": "10000.0", "fee_group_id": "default", "maker_fee": "0.05", "taker_fee": "0.07" },
        //             { "volume": "20000.0", "fee_group_id": "default", "maker_fee": "0.05", "taker_fee": "0.06" },
        //             { "volume": "50000.0", "fee_group_id": "default", "maker_fee": "0.05", "taker_fee": "0.05" }
        //         ],
        //         "active_fee_tier": { "volume": "0.0", "fee_group_id": "default", "maker_fee": "0.1", "taker_fee": "0.1" }
        //     }
        //
        const activeFeeTier = this.safeValue (response, 'active_fee_tier', {});
        let makerFee = this.safeString (activeFeeTier, 'maker_fee');
        let takerFee = this.safeString (activeFeeTier, 'taker_fee');
        makerFee = Precise.stringDiv (makerFee, '100');
        takerFee = Precise.stringDiv (takerFee, '100');
        const feeTiers = this.safeValue (response, 'fee_tiers');
        const result = {};
        const tiers = this.parseFeeTiers (feeTiers);
        for (let i = 0; i < this.symbols.length; i++) {
            const symbol = this.symbols[i];
            result[symbol] = {
                'info': response,
                'symbol': symbol,
                'maker': this.parseNumber (makerFee),
                'taker': this.parseNumber (takerFee),
                'percentage': true,
                'tierBased': true,
                'tiers': tiers,
            };
        }
        return result;
    }

    parseFeeTiers (feeTiers, market = undefined) {
        const takerFees = [];
        const makerFees = [];
        for (let i = 0; i < feeTiers.length; i++) {
            const tier = feeTiers[i];
            const volume = this.safeNumber (tier, 'volume');
            let taker = this.safeString (tier, 'taker_fee');
            let maker = this.safeString (tier, 'maker_fee');
            maker = Precise.stringDiv (maker, '100');
            taker = Precise.stringDiv (taker, '100');
            makerFees.push ([ volume, this.parseNumber (maker) ]);
            takerFees.push ([ volume, this.parseNumber (taker) ]);
        }
        return {
            'maker': makerFees,
            'taker': takerFees,
        };
    }

    parseTicker (ticker, market = undefined) {
        //
        // fetchTicker, fetchTickers
        //
        //     {
        //         "instrument_code":"BTC_EUR",
        //         "sequence":602562,
        //         "time":"2020-07-10T06:27:34.951Z",
        //         "state":"ACTIVE",
        //         "is_frozen":0,
        //         "quote_volume":"1695555.1783768",
        //         "base_volume":"205.67436",
        //         "last_price":"8143.91",
        //         "best_bid":"8143.71",
        //         "best_ask":"8156.9",
        //         "price_change":"-147.47",
        //         "price_change_percentage":"-1.78",
        //         "high":"8337.45",
        //         "low":"8110.0"
        //     }
        //
        const timestamp = this.parse8601 (this.safeString (ticker, 'time'));
        const marketId = this.safeString (ticker, 'instrument_code');
        const symbol = this.safeSymbol (marketId, market, '_');
        const last = this.safeString (ticker, 'last_price');
        const percentage = this.safeString (ticker, 'price_change_percentage');
        const change = this.safeString (ticker, 'price_change');
        const baseVolume = this.safeString (ticker, 'base_volume');
        const quoteVolume = this.safeString (ticker, 'quote_volume');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'high'),
            'low': this.safeString (ticker, 'low'),
            'bid': this.safeString (ticker, 'best_bid'),
            'bidVolume': undefined,
            'ask': this.safeString (ticker, 'best_ask'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': change,
            'percentage': percentage,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        }, market);
    }

    async fetchTicker (symbol, params = {}) {
        /**
         * @method
         * @name bitpanda#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the bitpanda api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'instrument_code': market['id'],
        };
        const response = await this.publicGetMarketTickerInstrumentCode (this.extend (request, params));
        //
        //     {
        //         "instrument_code":"BTC_EUR",
        //         "sequence":602562,
        //         "time":"2020-07-10T06:27:34.951Z",
        //         "state":"ACTIVE",
        //         "is_frozen":0,
        //         "quote_volume":"1695555.1783768",
        //         "base_volume":"205.67436",
        //         "last_price":"8143.91",
        //         "best_bid":"8143.71",
        //         "best_ask":"8156.9",
        //         "price_change":"-147.47",
        //         "price_change_percentage":"-1.78",
        //         "high":"8337.45",
        //         "low":"8110.0"
        //     }
        //
        return this.parseTicker (response, market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        /**
         * @method
         * @name bitpanda#fetchTickers
         * @description fetches price tickers for multiple markets, statistical calculations with the information calculated over the past 24 hours each market
         * @param {[string]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} params extra parameters specific to the bitpanda api endpoint
         * @returns {object} an array of [ticker structures]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const response = await this.publicGetMarketTicker (params);
        //
        //     [
        //         {
        //             "instrument_code":"BTC_EUR",
        //             "sequence":602562,
        //             "time":"2020-07-10T06:27:34.951Z",
        //             "state":"ACTIVE",
        //             "is_frozen":0,
        //             "quote_volume":"1695555.1783768",
        //             "base_volume":"205.67436",
        //             "last_price":"8143.91",
        //             "best_bid":"8143.71",
        //             "best_ask":"8156.9",
        //             "price_change":"-147.47",
        //             "price_change_percentage":"-1.78",
        //             "high":"8337.45",
        //             "low":"8110.0"
        //         }
        //     ]
        //
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const ticker = this.parseTicker (response[i]);
            const symbol = ticker['symbol'];
            result[symbol] = ticker;
        }
        return this.filterByArray (result, 'symbol', symbols);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitpanda#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the bitpanda api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'instrument_code': market['id'],
            // level 1 means only the best bid and ask
            // level 2 is a compiled order book up to market precision
            // level 3 is a full orderbook
            // if you wish to get regular updates about orderbooks please use the Websocket channel
            // heavy usage of this endpoint may result in limited access according to rate limits rules
            // 'level': 3, // default
        };
        if (limit !== undefined) {
            request['depth'] = limit;
        }
        const response = await this.publicGetOrderBookInstrumentCode (this.extend (request, params));
        //
        // level 1
        //
        //     {
        //         "instrument_code":"BTC_EUR",
        //         "time":"2020-07-10T07:39:06.343Z",
        //         "asks":{
        //             "value":{
        //                 "price":"8145.29",
        //                 "amount":"0.96538",
        //                 "number_of_orders":1
        //             }
        //         },
        //         "bids":{
        //             "value":{
        //                 "price":"8134.0",
        //                 "amount":"1.5978",
        //                 "number_of_orders":5
        //             }
        //         }
        //     }
        //
        // level 2
        //
        //     {
        //         "instrument_code":"BTC_EUR","time":"2020-07-10T07:36:43.538Z",
        //         "asks":[
        //             {"price":"8146.59","amount":"0.89691","number_of_orders":1},
        //             {"price":"8146.89","amount":"1.92062","number_of_orders":1},
        //             {"price":"8169.5","amount":"0.0663","number_of_orders":1},
        //         ],
        //         "bids":[
        //             {"price":"8143.49","amount":"0.01329","number_of_orders":1},
        //             {"price":"8137.01","amount":"5.34748","number_of_orders":1},
        //             {"price":"8137.0","amount":"2.0","number_of_orders":1},
        //         ]
        //     }
        //
        // level 3
        //
        //     {
        //         "instrument_code":"BTC_EUR",
        //         "time":"2020-07-10T07:32:31.525Z",
        //         "bids":[
        //             {"price":"8146.79","amount":"0.01537","order_id":"5d717da1-a8f4-422d-afcc-03cb6ab66825"},
        //             {"price":"8139.32","amount":"3.66009","order_id":"d0715c68-f28d-4cf1-a450-d56cf650e11c"},
        //             {"price":"8137.51","amount":"2.61049","order_id":"085fd6f4-e835-4ca5-9449-a8f165772e60"},
        //         ],
        //         "asks":[
        //             {"price":"8153.49","amount":"0.93384","order_id":"755d3aa3-42b5-46fa-903d-98f42e9ae6c4"},
        //             {"price":"8153.79","amount":"1.80456","order_id":"62034cf3-b70d-45ff-b285-ba6307941e7c"},
        //             {"price":"8167.9","amount":"0.0018","order_id":"036354e0-71cd-492f-94f2-01f7d4b66422"},
        //         ]
        //     }
        //
        const timestamp = this.parse8601 (this.safeString (response, 'time'));
        return this.parseOrderBook (response, market['symbol'], timestamp, 'bids', 'asks', 'price', 'amount');
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        //     {
        //         "instrument_code":"BTC_EUR",
        //         "granularity":{"unit":"HOURS","period":1},
        //         "high":"9252.65",
        //         "low":"9115.27",
        //         "open":"9250.0",
        //         "close":"9132.35",
        //         "total_amount":"33.85924",
        //         "volume":"311958.9635744",
        //         "time":"2020-05-08T22:59:59.999Z",
        //         "last_sequence":461123
        //     }
        //
        const granularity = this.safeValue (ohlcv, 'granularity');
        const unit = this.safeString (granularity, 'unit');
        const period = this.safeString (granularity, 'period');
        const units = {
            'MINUTES': 'm',
            'HOURS': 'h',
            'DAYS': 'd',
            'WEEKS': 'w',
            'MONTHS': 'M',
        };
        const lowercaseUnit = this.safeString (units, unit);
        const timeframe = period + lowercaseUnit;
        const durationInSeconds = this.parseTimeframe (timeframe);
        const duration = durationInSeconds * 1000;
        const timestamp = this.parse8601 (this.safeString (ohlcv, 'time'));
        const alignedTimestamp = duration * parseInt (timestamp / duration);
        const options = this.safeValue (this.options, 'fetchOHLCV', {});
        const volumeField = this.safeString (options, 'volume', 'total_amount');
        return [
            alignedTimestamp,
            this.safeNumber (ohlcv, 'open'),
            this.safeNumber (ohlcv, 'high'),
            this.safeNumber (ohlcv, 'low'),
            this.safeNumber (ohlcv, 'close'),
            this.safeNumber (ohlcv, volumeField),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitpanda#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
         * @param {int|undefined} limit the maximum amount of candles to fetch
         * @param {object} params extra parameters specific to the bitpanda api endpoint
         * @returns {[[int]]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const periodUnit = this.safeString (this.timeframes, timeframe);
        const [ period, unit ] = periodUnit.split ('/');
        const durationInSeconds = this.parseTimeframe (timeframe);
        const duration = durationInSeconds * 1000;
        if (limit === undefined) {
            limit = 1500;
        }
        const request = {
            'instrument_code': market['id'],
            // 'from': this.iso8601 (since),
            // 'to': this.iso8601 (this.milliseconds ()),
            'period': period,
            'unit': unit,
        };
        if (since === undefined) {
            const now = this.milliseconds ();
            request['to'] = this.iso8601 (now);
            request['from'] = this.iso8601 (now - limit * duration);
        } else {
            request['from'] = this.iso8601 (since);
            request['to'] = this.iso8601 (this.sum (since, limit * duration));
        }
        const response = await this.publicGetCandlesticksInstrumentCode (this.extend (request, params));
        //
        //     [
        //         {"instrument_code":"BTC_EUR","granularity":{"unit":"HOURS","period":1},"high":"9252.65","low":"9115.27","open":"9250.0","close":"9132.35","total_amount":"33.85924","volume":"311958.9635744","time":"2020-05-08T22:59:59.999Z","last_sequence":461123},
        //         {"instrument_code":"BTC_EUR","granularity":{"unit":"HOURS","period":1},"high":"9162.49","low":"9040.0","open":"9132.53","close":"9083.69","total_amount":"26.19685","volume":"238553.7812365","time":"2020-05-08T23:59:59.999Z","last_sequence":461376},
        //         {"instrument_code":"BTC_EUR","granularity":{"unit":"HOURS","period":1},"high":"9135.7","low":"9002.59","open":"9055.45","close":"9133.98","total_amount":"26.21919","volume":"238278.8724959","time":"2020-05-09T00:59:59.999Z","last_sequence":461521},
        //     ]
        //
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    parseTrade (trade, market = undefined) {
        //
        // fetchTrades (public)
        //
        //     {
        //         "instrument_code":"BTC_EUR",
        //         "price":"8137.28",
        //         "amount":"0.22269",
        //         "taker_side":"BUY",
        //         "volume":"1812.0908832",
        //         "time":"2020-07-10T14:44:32.299Z",
        //         "trade_timestamp":1594392272299,
        //         "sequence":603047
        //     }
        //
        // fetchMyTrades, fetchOrder, fetchOpenOrders, fetchClosedOrders trades (private)
        //
        //     {
        //         "fee": {
        //             "fee_amount": "0.0014",
        //             "fee_currency": "BTC",
        //             "fee_percentage": "0.1",
        //             "fee_group_id": "default",
        //             "fee_type": "TAKER",
        //             "running_trading_volume": "0.0"
        //         },
        //         "trade": {
        //             "trade_id": "fdff2bcc-37d6-4a2d-92a5-46e09c868664",
        //             "order_id": "36bb2437-7402-4794-bf26-4bdf03526439",
        //             "account_id": "a4c699f6-338d-4a26-941f-8f9853bfc4b9",
        //             "amount": "1.4",
        //             "side": "BUY",
        //             "instrument_code": "BTC_EUR",
        //             "price": "7341.4",
        //             "time": "2019-09-27T15:05:32.564Z",
        //             "sequence": 48670
        //         }
        //     }
        //
        const feeInfo = this.safeValue (trade, 'fee', {});
        trade = this.safeValue (trade, 'trade', trade);
        let timestamp = this.safeInteger (trade, 'trade_timestamp');
        if (timestamp === undefined) {
            timestamp = this.parse8601 (this.safeString (trade, 'time'));
        }
        const side = this.safeStringLower2 (trade, 'side', 'taker_side');
        const priceString = this.safeString (trade, 'price');
        const amountString = this.safeString (trade, 'amount');
        const costString = this.safeString (trade, 'volume');
        const marketId = this.safeString (trade, 'instrument_code');
        const symbol = this.safeSymbol (marketId, market, '_');
        const feeCostString = this.safeString (feeInfo, 'fee_amount');
        let takerOrMaker = undefined;
        let fee = undefined;
        if (feeCostString !== undefined) {
            const feeCurrencyId = this.safeString (feeInfo, 'fee_currency');
            const feeCurrencyCode = this.safeCurrencyCode (feeCurrencyId);
            const feeRateString = this.safeString (feeInfo, 'fee_percentage');
            fee = {
                'cost': feeCostString,
                'currency': feeCurrencyCode,
                'rate': feeRateString,
            };
            takerOrMaker = this.safeStringLower (feeInfo, 'fee_type');
        }
        return this.safeTrade ({
            'id': this.safeString2 (trade, 'trade_id', 'sequence'),
            'order': this.safeString (trade, 'order_id'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': undefined,
            'side': side,
            'price': priceString,
            'amount': amountString,
            'cost': costString,
            'takerOrMaker': takerOrMaker,
            'fee': fee,
            'info': trade,
        }, market);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitpanda#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the bitpanda api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'instrument_code': market['id'],
            // 'from': this.iso8601 (since),
            // 'to': this.iso8601 (this.milliseconds ()),
        };
        if (since !== undefined) {
            // returns price ticks for a specific market with an interval of maximum of 4 hours
            // sorted by latest first
            request['from'] = this.iso8601 (since);
            request['to'] = this.iso8601 (this.sum (since, 14400000));
        }
        const response = await this.publicGetPriceTicksInstrumentCode (this.extend (request, params));
        //
        //     [
        //         {
        //             "instrument_code":"BTC_EUR",
        //             "price":"8137.28",
        //             "amount":"0.22269",
        //             "taker_side":"BUY",
        //             "volume":"1812.0908832",
        //             "time":"2020-07-10T14:44:32.299Z",
        //             "trade_timestamp":1594392272299,
        //             "sequence":603047
        //         }
        //     ]
        //
        return this.parseTrades (response, market, since, limit);
    }

    parseBalance (response) {
        const balances = this.safeValue (response, 'balances', []);
        const result = { 'info': response };
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const currencyId = this.safeString (balance, 'currency_code');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeString (balance, 'available');
            account['used'] = this.safeString (balance, 'locked');
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    async fetchBalance (params = {}) {
        /**
         * @method
         * @name bitpanda#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} params extra parameters specific to the bitpanda api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.loadMarkets ();
        const response = await this.privateGetAccountBalances (params);
        //
        //     {
        //         "account_id":"4b95934f-55f1-460c-a525-bd5afc0cf071",
        //         "balances":[
        //             {
        //                 "account_id":"4b95934f-55f1-460c-a525-bd5afc0cf071",
        //                 "currency_code":"BTC",
        //                 "change":"10.0",
        //                 "available":"10.0",
        //                 "locked":"0.0",
        //                 "sequence":142135994,
        //                 "time":"2020-07-01T10:57:32.959Z"
        //             }
        //         ]
        //     }
        //
        return this.parseBalance (response);
    }

    parseDepositAddress (depositAddress, currency = undefined) {
        let code = undefined;
        if (currency !== undefined) {
            code = currency['code'];
        }
        const address = this.safeString (depositAddress, 'address');
        const tag = this.safeString (depositAddress, 'destination_tag');
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'network': undefined,
            'info': depositAddress,
        };
    }

    async createDepositAddress (code, params = {}) {
        /**
         * @method
         * @name bitpanda#createDepositAddress
         * @description create a currency deposit address
         * @param {string} code unified currency code of the currency for the deposit address
         * @param {object} params extra parameters specific to the bitpanda api endpoint
         * @returns {object} an [address structure]{@link https://docs.ccxt.com/en/latest/manual.html#address-structure}
         */
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
        };
        const response = await this.privatePostAccountDepositCrypto (this.extend (request, params));
        //
        //     {
        //         "address":"rBnNhk95FrdNisZtXcStzriFS8vEzz53DM",
        //         "destination_tag":"865690307",
        //         "enabled":true,
        //         "is_smart_contract":false
        //     }
        //
        return this.parseDepositAddress (response, currency);
    }

    async fetchDepositAddress (code, params = {}) {
        /**
         * @method
         * @name bitpanda#fetchDepositAddress
         * @description fetch the deposit address for a currency associated with this account
         * @param {string} code unified currency code
         * @param {object} params extra parameters specific to the bitpanda api endpoint
         * @returns {object} an [address structure]{@link https://docs.ccxt.com/en/latest/manual.html#address-structure}
         */
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency_code': currency['id'],
        };
        const response = await this.privateGetAccountDepositCryptoCurrencyCode (this.extend (request, params));
        //
        //     {
        //         "address":"rBnNhk95FrdNisZtXcStzriFS8vEzz53DM",
        //         "destination_tag":"865690307",
        //         "enabled":true,
        //         "is_smart_contract":false,
        //         "can_create_more":false
        //     }
        //
        return this.parseDepositAddress (response, currency);
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitpanda#fetchDeposits
         * @description fetch all deposits made to an account
         * @param {string|undefined} code unified currency code
         * @param {int|undefined} since the earliest time in ms to fetch deposits for
         * @param {int|undefined} limit the maximum number of deposits structures to retrieve
         * @param {object} params extra parameters specific to the bitpanda api endpoint
         * @returns {[object]} a list of [transaction structures]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
        await this.loadMarkets ();
        const request = {
            // 'cursor': 'string', // pointer specifying the position from which the next pages should be returned
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency_code'] = currency['id'];
        }
        if (limit !== undefined) {
            request['max_page_size'] = limit;
        }
        if (since !== undefined) {
            const to = this.safeString (params, 'to');
            if (to === undefined) {
                throw new ArgumentsRequired (this.id + ' fetchDeposits() requires a "to" iso8601 string param with the since argument is specified');
            }
            request['from'] = this.iso8601 (since);
        }
        const response = await this.privateGetAccountDeposits (this.extend (request, params));
        //
        //     {
        //         "deposit_history": [
        //             {
        //                 "transaction_id": "e5342efcd-d5b7-4a56-8e12-b69ffd68c5ef",
        //                 "account_id": "c2d0076a-c20d-41f8-9e9a-1a1d028b2b58",
        //                 "amount": "100",
        //                 "type": "CRYPTO",
        //                 "funds_source": "INTERNAL",
        //                 "time": "2020-04-22T09:57:47Z",
        //                 "currency": "BTC",
        //                 "fee_amount": "0.0",
        //                 "fee_currency": "BTC"
        //             },
        //             {
        //                 "transaction_id": "79793d00-2899-4a4d-95b7-73ae6b31384f",
        //                 "account_id": "c2d0076a-c20d-41f8-9e9a-1a1d028b2b58",
        //                 "time": "2020-05-05T11:22:07.925Z",
        //                 "currency": "EUR",
        //                 "funds_source": "EXTERNAL",
        //                 "type": "FIAT",
        //                 "amount": "50.0",
        //                 "fee_amount": "0.01",
        //                 "fee_currency": "EUR"
        //             }
        //         ],
        //         "max_page_size": 2,
        //         "cursor": "eyJhY2NvdW50X2lkIjp7InMiOiJlMzY5YWM4MC00NTc3LTExZTktYWUwOC05YmVkYzQ3OTBiODQiLCJzcyI6W10sIm5zIjpbXSwiYnMiOltdLCJtIjp7fSwibCI6W119LCJpdGVtX2tleSI6eyJzIjoiV0lUSERSQVdBTDo6MmFlMjYwY2ItOTk3MC00YmNiLTgxNmEtZGY4MDVmY2VhZTY1Iiwic3MiOltdLCJucyI6W10sImJzIjpbXSwibSI6e30sImwiOltdfSwiZ2xvYmFsX3dpdGhkcmF3YWxfaW5kZXhfaGFzaF9rZXkiOnsicyI6ImUzNjlhYzgwLTQ1NzctMTFlOS1hZTA4LTliZWRjNDc5MGI4NCIsInNzIjpbXSwibnMiOltdLCJicyI6W10sIm0iOnt9LCJsIjpbXX0sInRpbWVzdGFtcCI6eyJuIjoiMTU4ODA1ODc2Nzk0OCIsInNzIjpbXSwibnMiOltdLCJicyI6W10sIm0iOnt9LCJsIjpbXX19"
        //     }
        //
        const depositHistory = this.safeValue (response, 'deposit_history', []);
        return this.parseTransactions (depositHistory, currency, since, limit, { 'type': 'deposit' });
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitpanda#fetchWithdrawals
         * @description fetch all withdrawals made from an account
         * @param {string|undefined} code unified currency code
         * @param {int|undefined} since the earliest time in ms to fetch withdrawals for
         * @param {int|undefined} limit the maximum number of withdrawals structures to retrieve
         * @param {object} params extra parameters specific to the bitpanda api endpoint
         * @returns {[object]} a list of [transaction structures]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
        await this.loadMarkets ();
        const request = {
            // 'cursor': 'string', // pointer specifying the position from which the next pages should be returned
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency_code'] = currency['id'];
        }
        if (limit !== undefined) {
            request['max_page_size'] = limit;
        }
        if (since !== undefined) {
            const to = this.safeString (params, 'to');
            if (to === undefined) {
                throw new ArgumentsRequired (this.id + ' fetchWithdrawals() requires a "to" iso8601 string param with the since argument is specified');
            }
            request['from'] = this.iso8601 (since);
        }
        const response = await this.privateGetAccountWithdrawals (this.extend (request, params));
        //
        //     {
        //         "withdrawal_history": [
        //             {
        //                 "account_id": "e369ac80-4577-11e9-ae08-9bedc4790b84",
        //                 "amount": "0.1",
        //                 "currency": "BTC",
        //                 "fee_amount": "0.00002",
        //                 "fee_currency": "BTC",
        //                 "funds_source": "EXTERNAL",
        //                 "related_transaction_id": "e298341a-3855-405e-bce3-92db368a3157",
        //                 "time": "2020-05-05T11:11:32.110Z",
        //                 "transaction_id": "6693ff40-bb10-4dcf-ada7-3b287727c882",
        //                 "type": "CRYPTO"
        //             },
        //             {
        //                 "account_id": "e369ac80-4577-11e9-ae08-9bedc4790b84",
        //                 "amount": "0.1",
        //                 "currency": "BTC",
        //                 "fee_amount": "0.0",
        //                 "fee_currency": "BTC",
        //                 "funds_source": "INTERNAL",
        //                 "time": "2020-05-05T10:29:53.464Z",
        //                 "transaction_id": "ec9703b1-954b-4f76-adea-faac66eabc0b",
        //                 "type": "CRYPTO"
        //             }
        //         ],
        //         "cursor": "eyJhY2NvdW50X2lkIjp7InMiOiJlMzY5YWM4MC00NTc3LTExZTktYWUwOC05YmVkYzQ3OTBiODQiLCJzcyI6W10sIm5zIjpbXSwiYnMiOltdLCJtIjp7fSwibCI6W119LCJpdGVtX2tleSI6eyJzIjoiV0lUSERSQVdBTDo6ZWM5NzAzYjEtOTU0Yi00Zjc2LWFkZWEtZmFhYzY2ZWFiYzBiIiwic3MiOltdLCJucyI6W10sImJzIjpbXSwibSI6e30sImwiOltdfSwiZ2xvYmFsX3dpdGhkcmF3YWxfaW5kZXhfaGFzaF9rZXkiOnsicyI6ImUzNjlhYzgwLTQ1NzctMTFlOS1hZTA4LTliZWRjNDc5MGI4NCIsInNzIjpbXSwibnMiOltdLCJicyI6W10sIm0iOnt9LCJsIjpbXX0sInRpbWVzdGFtcCI6eyJuIjoiMTU4ODY3NDU5MzQ2NCIsInNzIjpbXSwibnMiOltdLCJicyI6W10sIm0iOnt9LCJsIjpbXX19",
        //         "max_page_size": 2
        //     }
        //
        const withdrawalHistory = this.safeValue (response, 'withdrawal_history', []);
        return this.parseTransactions (withdrawalHistory, currency, since, limit, { 'type': 'withdrawal' });
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        /**
         * @method
         * @name bitpanda#withdraw
         * @description make a withdrawal
         * @param {string} code unified currency code
         * @param {float} amount the amount to withdraw
         * @param {string} address the address to withdraw to
         * @param {string|undefined} tag
         * @param {object} params extra parameters specific to the bitpanda api endpoint
         * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
        [ tag, params ] = this.handleWithdrawTagAndParams (tag, params);
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': code,
            'amount': this.currencyToPrecision (code, amount),
            // 'payout_account_id': '66756a10-3e86-48f4-9678-b634c4b135b2', // fiat only
            // 'recipient': { // crypto only
            //     'address': address,
            //     // 'destination_tag': '',
            // },
        };
        const options = this.safeValue (this.options, 'fiat', []);
        const isFiat = this.inArray (code, options);
        const method = isFiat ? 'privatePostAccountWithdrawFiat' : 'privatePostAccountWithdrawCrypto';
        if (isFiat) {
            const payoutAccountId = this.safeString (params, 'payout_account_id');
            if (payoutAccountId === undefined) {
                throw new ArgumentsRequired (this.id + ' withdraw() requires a payout_account_id param for fiat ' + code + ' withdrawals');
            }
        } else {
            const recipient = { 'address': address };
            if (tag !== undefined) {
                recipient['destination_tag'] = tag;
            }
            request['recipient'] = recipient;
        }
        const response = await this[method] (this.extend (request, params));
        //
        // crypto
        //
        //     {
        //         "amount": "1234.5678",
        //         "fee": "1234.5678",
        //         "recipient": "3NacQ7rzZdhfyAtfJ5a11k8jFPdcMP2Bq7",
        //         "destination_tag": "",
        //         "transaction_id": "d0f8529f-f832-4e6a-9dc5-b8d5797badb2"
        //     }
        //
        // fiat
        //
        //     {
        //         "transaction_id": "54236cd0-4413-11e9-93fb-5fea7e5b5df6"
        //     }
        //
        return this.parseTransaction (response, currency);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        // fetchDeposits, fetchWithdrawals
        //
        //     {
        //         "transaction_id": "C2b42efcd-d5b7-4a56-8e12-b69ffd68c5ef",
        //         "type": "FIAT",
        //         "account_id": "c2d0076a-c20d-41f8-9e9a-1a1d028b2b58",
        //         "amount": "1234.5678",
        //         "time": "2019-08-24T14:15:22Z",
        //         "funds_source": "INTERNAL",
        //         "currency": "BTC",
        //         "fee_amount": "1234.5678",
        //         "fee_currency": "BTC",
        //         "blockchain_transaction_id": "f4184fc596403b9d638783cf57adfe4c75c605f6356fbc91338530e9831e9e16",
        //         "related_transaction_id": "e298341a-3855-405e-bce3-92db368a3157"
        //     }
        //
        // withdraw
        //
        //
        //     crypto
        //
        //     {
        //         "amount": "1234.5678",
        //         "fee": "1234.5678",
        //         "recipient": "3NacQ7rzZdhfyAtfJ5a11k8jFPdcMP2Bq7",
        //         "destination_tag": "",
        //         "transaction_id": "d0f8529f-f832-4e6a-9dc5-b8d5797badb2"
        //     }
        //
        //     fiat
        //
        //     {
        //         "transaction_id": "54236cd0-4413-11e9-93fb-5fea7e5b5df6"
        //     }
        //
        const id = this.safeString (transaction, 'transaction_id');
        const amount = this.safeNumber (transaction, 'amount');
        const timestamp = this.parse8601 (this.safeString (transaction, 'time'));
        const currencyId = this.safeString (transaction, 'currency');
        currency = this.safeCurrency (currencyId, currency);
        const status = 'ok'; // the exchange returns cleared transactions only
        const feeCost = this.safeNumber2 (transaction, 'fee_amount', 'fee');
        let fee = undefined;
        const addressTo = this.safeString (transaction, 'recipient');
        const tagTo = this.safeString (transaction, 'destination_tag');
        if (feeCost !== undefined) {
            const feeCurrencyId = this.safeString (transaction, 'fee_currency', currencyId);
            const feeCurrencyCode = this.safeCurrencyCode (feeCurrencyId);
            fee = {
                'cost': feeCost,
                'currency': feeCurrencyCode,
            };
        }
        return {
            'info': transaction,
            'id': id,
            'currency': currency['code'],
            'amount': amount,
            'network': undefined,
            'address': addressTo,
            'addressFrom': undefined,
            'addressTo': addressTo,
            'tag': tagTo,
            'tagFrom': undefined,
            'tagTo': tagTo,
            'status': status,
            'type': undefined,
            'updated': undefined,
            'txid': this.safeString (transaction, 'blockchain_transaction_id'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'fee': fee,
        };
    }

    parseOrderStatus (status) {
        const statuses = {
            'FILLED': 'open',
            'FILLED_FULLY': 'closed',
            'FILLED_CLOSED': 'canceled',
            'FILLED_REJECTED': 'rejected',
            'OPEN': 'open',
            'REJECTED': 'rejected',
            'CLOSED': 'canceled',
            'FAILED': 'failed',
            'STOP_TRIGGERED': 'triggered',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        //
        // createOrder
        //
        //     {
        //         "order_id": "d5492c24-2995-4c18-993a-5b8bf8fffc0d",
        //         "client_id": "d75fb03b-b599-49e9-b926-3f0b6d103206",
        //         "account_id": "a4c699f6-338d-4a26-941f-8f9853bfc4b9",
        //         "instrument_code": "BTC_EUR",
        //         "time": "2019-08-01T08:00:44.026Z",
        //         "side": "BUY",
        //         "price": "5000",
        //         "amount": "1",
        //         "filled_amount": "0.5",
        //         "type": "LIMIT",
        //         "time_in_force": "GOOD_TILL_CANCELLED"
        //     }
        //
        // fetchOrder, fetchOpenOrders, fetchClosedOrders
        //
        //     {
        //         "order": {
        //             "order_id": "66756a10-3e86-48f4-9678-b634c4b135b2",
        //             "account_id": "1eb2ad5d-55f1-40b5-bc92-7dc05869e905",
        //             "instrument_code": "BTC_EUR",
        //             "amount": "1234.5678",
        //             "filled_amount": "1234.5678",
        //             "side": "BUY",
        //             "type": "LIMIT",
        //             "status": "OPEN",
        //             "sequence": 123456789,
        //             "price": "1234.5678",
        //             "average_price": "1234.5678",
        //             "reason": "INSUFFICIENT_FUNDS",
        //             "time": "2019-08-24T14:15:22Z",
        //             "time_in_force": "GOOD_TILL_CANCELLED",
        //             "time_last_updated": "2019-08-24T14:15:22Z",
        //             "expire_after": "2019-08-24T14:15:22Z",
        //             "is_post_only": false,
        //             "time_triggered": "2019-08-24T14:15:22Z",
        //             "trigger_price": "1234.5678"
        //         },
        //         "trades": [
        //             {
        //                 "fee": {
        //                     "fee_amount": "0.0014",
        //                     "fee_currency": "BTC",
        //                     "fee_percentage": "0.1",
        //                     "fee_group_id": "default",
        //                     "fee_type": "TAKER",
        //                     "running_trading_volume": "0.0"
        //                 },
        //                 "trade": {
        //                     "trade_id": "fdff2bcc-37d6-4a2d-92a5-46e09c868664",
        //                     "order_id": "36bb2437-7402-4794-bf26-4bdf03526439",
        //                     "account_id": "a4c699f6-338d-4a26-941f-8f9853bfc4b9",
        //                     "amount": "1.4",
        //                     "side": "BUY",
        //                     "instrument_code": "BTC_EUR",
        //                     "price": "7341.4",
        //                     "time": "2019-09-27T15:05:32.564Z",
        //                     "sequence": 48670
        //                 }
        //             }
        //         ]
        //     }
        //
        const rawOrder = this.safeValue (order, 'order', order);
        const id = this.safeString (rawOrder, 'order_id');
        const clientOrderId = this.safeString (rawOrder, 'client_id');
        const timestamp = this.parse8601 (this.safeString (rawOrder, 'time'));
        const rawStatus = this.parseOrderStatus (this.safeString (rawOrder, 'status'));
        const status = this.parseOrderStatus (rawStatus);
        const marketId = this.safeString (rawOrder, 'instrument_code');
        const symbol = this.safeSymbol (marketId, market, '_');
        const price = this.safeString (rawOrder, 'price');
        const amount = this.safeString (rawOrder, 'amount');
        const filled = this.safeString (rawOrder, 'filled_amount');
        const side = this.safeStringLower (rawOrder, 'side');
        const type = this.safeStringLower (rawOrder, 'type');
        const timeInForce = this.parseTimeInForce (this.safeString (rawOrder, 'time_in_force'));
        const stopPrice = this.safeNumber (rawOrder, 'trigger_price');
        const postOnly = this.safeValue (rawOrder, 'is_post_only');
        const rawTrades = this.safeValue (order, 'trades', []);
        return this.safeOrder ({
            'id': id,
            'clientOrderId': clientOrderId,
            'info': order,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': type,
            'timeInForce': timeInForce,
            'postOnly': postOnly,
            'side': side,
            'price': price,
            'stopPrice': stopPrice,
            'triggerPrice': stopPrice,
            'amount': amount,
            'cost': undefined,
            'average': undefined,
            'filled': filled,
            'remaining': undefined,
            'status': status,
            // 'fee': undefined,
            'trades': rawTrades,
        }, market);
    }

    parseTimeInForce (timeInForce) {
        const timeInForces = {
            'GOOD_TILL_CANCELLED': 'GTC',
            'GOOD_TILL_TIME': 'GTT',
            'IMMEDIATE_OR_CANCELLED': 'IOC',
            'FILL_OR_KILL': 'FOK',
        };
        return this.safeString (timeInForces, timeInForce, timeInForce);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name bitpanda#createOrder
         * @description create a trade order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float|undefined} price the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} params extra parameters specific to the bitpanda api endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const uppercaseType = type.toUpperCase ();
        const request = {
            'instrument_code': market['id'],
            'type': uppercaseType, // LIMIT, MARKET, STOP
            'side': side.toUpperCase (), // or SELL
            'amount': this.amountToPrecision (symbol, amount),
            // "price": "1234.5678", // required for LIMIT and STOP orders
            // "client_id": "d75fb03b-b599-49e9-b926-3f0b6d103206", // optional
            // "time_in_force": "GOOD_TILL_CANCELLED", // limit orders only, GOOD_TILL_CANCELLED, GOOD_TILL_TIME, IMMEDIATE_OR_CANCELLED and FILL_OR_KILL
            // "expire_after": "2020-07-02T19:40:13Z", // required for GOOD_TILL_TIME
            // "is_post_only": false, // limit orders only, optional
            // "trigger_price": "1234.5678" // required for stop orders
        };
        let priceIsRequired = false;
        if (uppercaseType === 'LIMIT' || uppercaseType === 'STOP') {
            priceIsRequired = true;
        }
        if (uppercaseType === 'STOP') {
            const triggerPrice = this.safeNumber (params, 'trigger_price');
            if (triggerPrice === undefined) {
                throw new ArgumentsRequired (this.id + ' createOrder() requires a trigger_price param for ' + type + ' orders');
            }
            request['trigger_price'] = this.priceToPrecision (symbol, triggerPrice);
            params = this.omit (params, 'trigger_price');
        }
        if (priceIsRequired) {
            request['price'] = this.priceToPrecision (symbol, price);
        }
        const clientOrderId = this.safeString2 (params, 'clientOrderId', 'client_id');
        if (clientOrderId !== undefined) {
            request['client_id'] = clientOrderId;
            params = this.omit (params, [ 'clientOrderId', 'client_id' ]);
        }
        const response = await this.privatePostAccountOrders (this.extend (request, params));
        //
        //     {
        //         "order_id": "d5492c24-2995-4c18-993a-5b8bf8fffc0d",
        //         "client_id": "d75fb03b-b599-49e9-b926-3f0b6d103206",
        //         "account_id": "a4c699f6-338d-4a26-941f-8f9853bfc4b9",
        //         "instrument_code": "BTC_EUR",
        //         "time": "2019-08-01T08:00:44.026Z",
        //         "side": "BUY",
        //         "price": "5000",
        //         "amount": "1",
        //         "filled_amount": "0.5",
        //         "type": "LIMIT",
        //         "time_in_force": "GOOD_TILL_CANCELLED"
        //     }
        //
        return this.parseOrder (response, market);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name bitpanda#cancelOrder
         * @description cancels an open order
         * @param {string} id order id
         * @param {string|undefined} symbol not used by bitmex cancelOrder ()
         * @param {object} params extra parameters specific to the bitpanda api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const clientOrderId = this.safeString2 (params, 'clientOrderId', 'client_id');
        params = this.omit (params, [ 'clientOrderId', 'client_id' ]);
        let method = 'privateDeleteAccountOrdersOrderId';
        const request = {};
        if (clientOrderId !== undefined) {
            method = 'privateDeleteAccountOrdersClientClientId';
            request['client_id'] = clientOrderId;
        } else {
            request['order_id'] = id;
        }
        const response = await this[method] (this.extend (request, params));
        //
        // responds with an empty body
        //
        return response;
    }

    async cancelAllOrders (symbol = undefined, params = {}) {
        /**
         * @method
         * @name bitpanda#cancelAllOrders
         * @description cancel all open orders
         * @param {string|undefined} symbol unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
         * @param {object} params extra parameters specific to the bitpanda api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const request = {};
        if (symbol !== undefined) {
            const market = this.market (symbol);
            request['instrument_code'] = market['id'];
        }
        const response = await this.privateDeleteAccountOrders (this.extend (request, params));
        //
        //     [
        //         "a10e9bd1-8f72-4cfe-9f1b-7f1c8a9bd8ee"
        //     ]
        //
        return response;
    }

    async cancelOrders (ids, symbol = undefined, params = {}) {
        /**
         * @method
         * @name bitpanda#cancelOrders
         * @description cancel multiple orders
         * @param {[string]} ids order ids
         * @param {string|undefined} symbol unified market symbol, default is undefined
         * @param {object} params extra parameters specific to the bitpanda api endpoint
         * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const request = {
            'ids': ids.join (','),
        };
        const response = await this.privateDeleteAccountOrders (this.extend (request, params));
        //
        //     [
        //         "a10e9bd1-8f72-4cfe-9f1b-7f1c8a9bd8ee"
        //     ]
        //
        return response;
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name bitpanda#fetchOrder
         * @description fetches information on an order made by the user
         * @param {string|undefined} symbol not used by bitpanda fetchOrder
         * @param {object} params extra parameters specific to the bitpanda api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const request = {
            'order_id': id,
        };
        const response = await this.privateGetAccountOrdersOrderId (this.extend (request, params));
        //
        //     {
        //         "order": {
        //             "order_id": "36bb2437-7402-4794-bf26-4bdf03526439",
        //             "account_id": "a4c699f6-338d-4a26-941f-8f9853bfc4b9",
        //             "time_last_updated": "2019-09-27T15:05:35.096Z",
        //             "sequence": 48782,
        //             "price": "7349.2",
        //             "filled_amount": "100.0",
        //             "status": "FILLED_FULLY",
        //             "amount": "100.0",
        //             "instrument_code": "BTC_EUR",
        //             "side": "BUY",
        //             "time": "2019-09-27T15:05:32.063Z",
        //             "type": "MARKET"
        //         },
        //         "trades": [
        //             {
        //                 "fee": {
        //                     "fee_amount": "0.0014",
        //                     "fee_currency": "BTC",
        //                     "fee_percentage": "0.1",
        //                     "fee_group_id": "default",
        //                     "fee_type": "TAKER",
        //                     "running_trading_volume": "0.0"
        //                 },
        //                 "trade": {
        //                     "trade_id": "fdff2bcc-37d6-4a2d-92a5-46e09c868664",
        //                     "order_id": "36bb2437-7402-4794-bf26-4bdf03526439",
        //                     "account_id": "a4c699f6-338d-4a26-941f-8f9853bfc4b9",
        //                     "amount": "1.4",
        //                     "side": "BUY",
        //                     "instrument_code": "BTC_EUR",
        //                     "price": "7341.4",
        //                     "time": "2019-09-27T15:05:32.564Z",
        //                     "sequence": 48670
        //                 }
        //             }
        //         ]
        //     }
        //
        return this.parseOrder (response);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitpanda#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch open orders for
         * @param {int|undefined} limit the maximum number of  open orders structures to retrieve
         * @param {object} params extra parameters specific to the bitpanda api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const request = {
            // 'from': this.iso8601 (since),
            // 'to': this.iso8601 (this.milliseconds ()), // max range is 100 days
            // 'instrument_code': market['id'],
            // 'with_cancelled_and_rejected': false, // default is false, orders which have been cancelled by the user before being filled or rejected by the system as invalid, additionally, all inactive filled orders which would return with "with_just_filled_inactive"
            // 'with_just_filled_inactive': false, // orders which have been filled and are no longer open, use of "with_cancelled_and_rejected" extends "with_just_filled_inactive" and in case both are specified the latter is ignored
            // 'with_just_orders': false, // do not return any trades corresponsing to the orders, it may be significanly faster and should be used if user is not interesting in trade information
            // 'max_page_size': 100,
            // 'cursor': 'string', // pointer specifying the position from which the next pages should be returned
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['instrument_code'] = market['id'];
        }
        if (since !== undefined) {
            const to = this.safeString (params, 'to');
            if (to === undefined) {
                throw new ArgumentsRequired (this.id + ' fetchOpenOrders() requires a "to" iso8601 string param with the since argument is specified, max range is 100 days');
            }
            request['from'] = this.iso8601 (since);
        }
        if (limit !== undefined) {
            request['max_page_size'] = limit;
        }
        const response = await this.privateGetAccountOrders (this.extend (request, params));
        //
        //     {
        //         "order_history": [
        //             {
        //                 "order": {
        //                     "trigger_price": "12089.88",
        //                     "order_id": "d453ca12-c650-46dd-9dee-66910d96bfc0",
        //                     "account_id": "ef3a5f4c-cfcd-415e-ba89-5a9abf47b28a",
        //                     "instrument_code": "BTC_USDT",
        //                     "time": "2019-08-23T10:02:31.663Z",
        //                     "side": "SELL",
        //                     "price": "10159.76",
        //                     "average_price": "10159.76",
        //                     "amount": "0.2",
        //                     "filled_amount": "0.2",
        //                     "type": "STOP",
        //                     "sequence": 8,
        //                     "status": "FILLED_FULLY"
        //                 },
        //                 "trades": [
        //                     {
        //                         "fee": {
        //                             "fee_amount": "0.4188869",
        //                             "fee_currency": "USDT",
        //                             "fee_percentage": "0.1",
        //                             "fee_group_id": "default",
        //                             "fee_type": "TAKER",
        //                             "running_trading_volume": "0.0"
        //                         },
        //                         "trade": {
        //                             "trade_id": "ec82896f-fd1b-4cbb-89df-a9da85ccbb4b",
        //                             "order_id": "d453ca12-c650-46dd-9dee-66910d96bfc0",
        //                             "account_id": "ef3a5f4c-cfcd-415e-ba89-5a9abf47b28a",
        //                             "amount": "0.2",
        //                             "side": "SELL",
        //                             "instrument_code": "BTC_USDT",
        //                             "price": "10159.76",
        //                             "time": "2019-08-23T10:02:32.663Z",
        //                             "sequence": 9
        //                         }
        //                     }
        //                 ]
        //             },
        //             {
        //                 "order": {
        //                     "order_id": "5151a99e-f414-418f-8cf1-2568d0a63ea5",
        //                     "account_id": "ef3a5f4c-cfcd-415e-ba89-5a9abf47b28a",
        //                     "instrument_code": "BTC_USDT",
        //                     "time": "2019-08-23T10:01:36.773Z",
        //                     "side": "SELL",
        //                     "price": "12289.88",
        //                     "amount": "0.5",
        //                     "filled_amount": "0.0",
        //                     "type": "LIMIT",
        //                     "sequence": 7,
        //                     "status": "OPEN"
        //                 },
        //                 "trades": []
        //             },
        //             {
        //                 "order": {
        //                     "order_id": "ac80d857-75e1-4733-9070-fd4288395fdc",
        //                     "account_id": "ef3a5f4c-cfcd-415e-ba89-5a9abf47b28a",
        //                     "instrument_code": "BTC_USDT",
        //                     "time": "2019-08-23T10:01:25.031Z",
        //                     "side": "SELL",
        //                     "price": "11089.88",
        //                     "amount": "0.1",
        //                     "filled_amount": "0.0",
        //                     "type": "LIMIT",
        //                     "sequence": 6,
        //                     "status": "OPEN"
        //                 },
        //                 "trades": []
        //             }
        //         ],
        //         "max_page_size": 100
        //     }
        //
        const orderHistory = this.safeValue (response, 'order_history', []);
        return this.parseOrders (orderHistory, market, since, limit);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitpanda#fetchClosedOrders
         * @description fetches information on multiple closed orders made by the user
         * @param {string|undefined} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the bitpanda api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        const request = {
            'with_cancelled_and_rejected': true, // default is false, orders which have been cancelled by the user before being filled or rejected by the system as invalid, additionally, all inactive filled orders which would return with "with_just_filled_inactive"
        };
        return await this.fetchOpenOrders (symbol, since, limit, this.extend (request, params));
    }

    async fetchOrderTrades (id, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitpanda#fetchOrderTrades
         * @description fetch all the trades made from a single order
         * @param {string} id order id
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch trades for
         * @param {int|undefined} limit the maximum number of trades to retrieve
         * @param {object} params extra parameters specific to the bitpanda api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html#trade-structure}
         */
        await this.loadMarkets ();
        const request = {
            'order_id': id,
            // 'max_page_size': 100,
            // 'cursor': 'string', // pointer specifying the position from which the next pages should be returned
        };
        if (limit !== undefined) {
            request['max_page_size'] = limit;
        }
        const response = await this.privateGetAccountOrdersOrderIdTrades (this.extend (request, params));
        //
        //     {
        //         "trade_history": [
        //             {
        //                 "trade": {
        //                     "trade_id": "2b42efcd-d5b7-4a56-8e12-b69ffd68c5ef",
        //                     "order_id": "66756a10-3e86-48f4-9678-b634c4b135b2",
        //                     "account_id": "c2d0076a-c20d-41f8-9e9a-1a1d028b2b58",
        //                     "amount": "1234.5678",
        //                     "side": "BUY",
        //                     "instrument_code": "BTC_EUR",
        //                     "price": "1234.5678",
        //                     "time": "2019-08-24T14:15:22Z",
        //                     "price_tick_sequence": 0,
        //                     "sequence": 123456789
        //                 },
        //                 "fee": {
        //                     "fee_amount": "1234.5678",
        //                     "fee_percentage": "1234.5678",
        //                     "fee_group_id": "default",
        //                     "running_trading_volume": "1234.5678",
        //                     "fee_currency": "BTC",
        //                     "fee_type": "TAKER"
        //                 }
        //             }
        //         ],
        //         "max_page_size": 0,
        //         "cursor": "string"
        //     }
        //
        const tradeHistory = this.safeValue (response, 'trade_history', []);
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        return this.parseTrades (tradeHistory, market, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitpanda#fetchMyTrades
         * @description fetch all trades made by the user
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch trades for
         * @param {int|undefined} limit the maximum number of trades structures to retrieve
         * @param {object} params extra parameters specific to the bitpanda api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html#trade-structure}
         */
        await this.loadMarkets ();
        const request = {
            // 'from': this.iso8601 (since),
            // 'to': this.iso8601 (this.milliseconds ()), // max range is 100 days
            // 'instrument_code': market['id'],
            // 'max_page_size': 100,
            // 'cursor': 'string', // pointer specifying the position from which the next pages should be returned
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['instrument_code'] = market['id'];
        }
        if (since !== undefined) {
            const to = this.safeString (params, 'to');
            if (to === undefined) {
                throw new ArgumentsRequired (this.id + ' fetchMyTrades() requires a "to" iso8601 string param with the since argument is specified, max range is 100 days');
            }
            request['from'] = this.iso8601 (since);
        }
        if (limit !== undefined) {
            request['max_page_size'] = limit;
        }
        const response = await this.privateGetAccountTrades (this.extend (request, params));
        //
        //     {
        //         "trade_history": [
        //             {
        //                 "trade": {
        //                     "trade_id": "2b42efcd-d5b7-4a56-8e12-b69ffd68c5ef",
        //                     "order_id": "66756a10-3e86-48f4-9678-b634c4b135b2",
        //                     "account_id": "c2d0076a-c20d-41f8-9e9a-1a1d028b2b58",
        //                     "amount": "1234.5678",
        //                     "side": "BUY",
        //                     "instrument_code": "BTC_EUR",
        //                     "price": "1234.5678",
        //                     "time": "2019-08-24T14:15:22Z",
        //                     "price_tick_sequence": 0,
        //                     "sequence": 123456789
        //                 },
        //                 "fee": {
        //                     "fee_amount": "1234.5678",
        //                     "fee_percentage": "1234.5678",
        //                     "fee_group_id": "default",
        //                     "running_trading_volume": "1234.5678",
        //                     "fee_currency": "BTC",
        //                     "fee_type": "TAKER"
        //                 }
        //             }
        //         ],
        //         "max_page_size": 0,
        //         "cursor": "string"
        //     }
        //
        const tradeHistory = this.safeValue (response, 'trade_history', []);
        return this.parseTrades (tradeHistory, market, since, limit);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/' + this.version + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else if (api === 'private') {
            this.checkRequiredCredentials ();
            headers = {
                'Accept': 'application/json',
                'Authorization': 'Bearer ' + this.apiKey,
            };
            if (method === 'POST') {
                body = this.json (query);
                headers['Content-Type'] = 'application/json';
            } else {
                if (Object.keys (query).length) {
                    url += '?' + this.urlencode (query);
                }
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return;
        }
        //
        //     {"error":"MISSING_FROM_PARAM"}
        //     {"error":"MISSING_TO_PARAM"}
        //     {"error":"CANDLESTICKS_TIME_RANGE_TOO_BIG"}
        //
        const message = this.safeString (response, 'error');
        if (message !== undefined) {
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
            throw new ExchangeError (feedback); // unknown message
        }
    }
};
