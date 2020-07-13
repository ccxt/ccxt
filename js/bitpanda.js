'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { AuthenticationError, ExchangeError, PermissionDenied, BadRequest, ArgumentsRequired, OrderNotFound, InsufficientFunds, ExchangeNotAvailable, DDoSProtection } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class bitpanda extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitpanda',
            'name': 'Bitpanda',
            'countries': [ 'AT' ], // Austria
            'rateLimit': 300,
            'version': 'v1',
            // new metainfo interface
            'has': {
                'privateAPI': false,
                'fetchCurrencies': true,
                'fetchMarkets': true,
                'fetchOHLCV': true,
                'fetchOrderBook': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFees': true,
                'fetchTicker': true,
                'fetchTickers': true,
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
                'logo': 'https://user-images.githubusercontent.com/1294454/29604020-d5483cdc-87ee-11e7-94c7-d1a8d9169293.jpg',
                'api': {
                    'public': 'https://api.exchange.bitpanda.com/public',
                    'private': 'https://api.exchange.bitpanda.com/public',
                },
                'www': 'https://www.bitpanda.com',
                'doc': [
                    'https://developers.bitpanda.com',
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
                    'tierBased': false,
                    'percentage': true,
                    'taker': 0.15 / 100,
                    'maker': 0.10 / 100,
                    'tiers': [
                        // volume in BTC
                        {
                            'taker': [
                                [0, 0.15 / 100],
                                [100, 0.13 / 100],
                                [250, 0.13 / 100],
                                [1000, 0.1 / 100],
                                [5000, 0.09 / 100],
                                [10000, 0.075 / 100],
                                [20000, 0.065 / 100],
                            ],
                            'maker': [
                                [0, 0.1 / 100],
                                [100, 0.1 / 100],
                                [250, 0.09 / 100],
                                [1000, 0.075 / 100],
                                [5000, 0.06 / 100],
                                [10000, 0.05 / 100],
                                [20000, 0.05 / 100],
                            ],
                        },
                    ],
                },
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': false,
            },
            // exchange-specific options
            'options': {
            },
            'exceptions': {
                'exact': {
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
                    'INVALID_SIDE': BadRequest,
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
                    'NEGATIVE_AMOUNT': BadRequest,
                    'NEGATIVE_PRICE': BadRequest,
                    'MIN_SIZE_NOT_SATISFIED': BadRequest,
                    'BAD_AMOUNT_PRECISION': BadRequest,
                    'BAD_PRICE_PRECISION': BadRequest,
                    'BAD_TRIGGER_PRICE_PRECISION': BadRequest,
                    'MAX_OPEN_ORDERS_EXCEEDED': BadRequest,
                    'MISSING_PRICE': ArgumentsRequired,
                    'MISSING_ORDER_TYPE': ArgumentsRequired,
                    'MISSING_SIDE': ArgumentsRequired,
                    'MISSING_CANDLESTICKS_PERIOD_PARAM': ArgumentsRequired,
                    'MISSING_CANDLESTICKS_UNIT_PARAM': ArgumentsRequired,
                    'MISSING_FROM_PARAM': ArgumentsRequired,
                    'MISSING_INSTRUMENT_CODE': ArgumentsRequired,
                    'MISSING_ORDER_ID': ArgumentsRequired,
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
        });
    }

    async fetchTime (params = {}) {
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
                'precision': this.safeInteger (currency, 'precision'),
                'limits': {
                    'amount': { 'min': undefined, 'max': undefined },
                    'price': { 'min': undefined, 'max': undefined },
                    'cost': { 'min': undefined, 'max': undefined },
                    'withdraw': { 'min': undefined, 'max': undefined },
                },
            };
        }
        return result;
    }

    async fetchMarkets (params = {}) {
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
            const symbol = base + '/' + quote;
            const precision = {
                'amount': this.safeInteger (market, 'amount_precision'),
                'price': this.safeInteger (market, 'market_precision'),
            };
            const limits = {
                'amount': {
                    'min': undefined,
                    'max': undefined,
                },
                'price': {
                    'min': undefined,
                    'max': undefined,
                },
                'cost': {
                    'min': this.safeFloat (market, 'min_size'),
                    'max': undefined,
                },
            };
            const state = this.safeString (market, 'state');
            const active = (state === 'ACTIVE');
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'precision': precision,
                'limits': limits,
                'info': market,
                'active': active,
            });
        }
        return result;
    }

    async fetchTradingFees (params = {}) {
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
        const feeGroupsById = this.indexBy (response, 'fee_group_id');
        const feeGroupId = this.safeValue (this.options, 'fee_group_id', 'default');
        const feeGroup = this.safeValue (feeGroupsById, feeGroupId, {});
        const feeTiers = this.safeValue (feeGroup, 'fee_tiers');
        const result = {};
        for (let i = 0; i < this.symbols.length; i++) {
            const symbol = this.symbols[i];
            const fee = {
                'info': feeGroup,
                'symbol': symbol,
                'maker': undefined,
                'taker': undefined,
                'percentage': true,
                'tierBased': true,
            };
            const takerFees = [];
            const makerFees = [];
            for (let i = 0; i < feeTiers.length; i++) {
                const tier = feeTiers[i];
                const volume = this.safeFloat (tier, 'volume');
                let taker = this.safeFloat (tier, 'taker_fee');
                let maker = this.safeFloat (tier, 'maker_fee');
                taker /= 100;
                maker /= 100;
                takerFees.push ([ volume, taker ]);
                makerFees.push ([ volume, maker ]);
                if (i === 0) {
                    fee['taker'] = taker;
                    fee['maker'] = maker;
                }
            }
            const tiers = {
                'taker': takerFees,
                'maker': makerFees,
            };
            fee['tiers'] = tiers;
            result[symbol] = fee;
        }
        return result;
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
        let symbol = undefined;
        if (marketId !== undefined) {
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
            } else if (marketId !== undefined) {
                const [ baseId, quoteId ] = marketId.split ('_');
                const base = this.safeCurrencyCode (baseId);
                const quote = this.safeCurrencyCode (quoteId);
                symbol = base + '/' + quote;
            }
        }
        if ((symbol === undefined) && (market !== undefined)) {
            symbol = market['symbol'];
        }
        const last = this.safeFloat (ticker, 'last_price');
        const percentage = this.safeFloat (ticker, 'price_change_percentage');
        const change = this.safeFloat (ticker, 'price_change');
        let open = undefined;
        let average = undefined;
        if ((last !== undefined) && (change !== undefined)) {
            open = last - change;
            average = this.sum (last, open) / 2;
        }
        const baseVolume = this.safeFloat (ticker, 'base_volume');
        const quoteVolume = this.safeFloat (ticker, 'quote_volume');
        let vwap = undefined;
        if (quoteVolume !== undefined && baseVolume !== undefined) {
            vwap = quoteVolume / baseVolume;
        }
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': this.safeFloat (ticker, 'best_bid'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'best_ask'),
            'askVolume': undefined,
            'vwap': vwap,
            'open': open,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': change,
            'percentage': percentage,
            'average': average,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        };
    }

    async fetchTicker (symbol, params = {}) {
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
        await this.loadMarkets ();
        const tickers = await this.publicGetMarketTicker (params);
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
        for (let i = 0; i < tickers.length; i++) {
            const ticker = this.parseTicker (tickers[i]);
            const symbol = ticker['symbol'];
            result[symbol] = ticker;
        }
        return result;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'instrument_code': this.marketId (symbol),
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
        return this.parseOrderBook (response, timestamp, 'bids', 'asks', 'price', 'amount');
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
        const modulo = this.integerModulo (timestamp, duration);
        const alignedTimestamp = timestamp - modulo;
        const options = this.safeValue (this.options, 'fetchOHLCV', {});
        const volumeField = this.safeString (options, 'volume', 'total_amount');
        return [
            alignedTimestamp,
            this.safeFloat (ohlcv, 'open'),
            this.safeFloat (ohlcv, 'high'),
            this.safeFloat (ohlcv, 'low'),
            this.safeFloat (ohlcv, 'close'),
            this.safeFloat (ohlcv, volumeField),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
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
        const timestamp = this.parse8601 (this.safeString (trade, 'time'));
        const side = this.safeStringLower (trade, 'taker_side');
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'amount');
        const cost = this.safeFloat (trade, 'volume');
        const marketId = this.safeString (trade, 'instrument_code');
        let symbol = undefined;
        if (marketId !== undefined) {
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
                symbol = market['symbol'];
            } else {
                const [ baseId, quoteId ] = marketId.split ('_');
                const base = this.safeCurrencyCode (baseId);
                const quote = this.safeCurrencyCode (quoteId);
                symbol = base + '/' + quote;
            }
        }
        if ((market !== undefined) && (symbol === undefined)) {
            symbol = market['symbol'];
        }
        return {
            'id': this.safeString (trade, 'sequence'),
            'order': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': undefined,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'takerOrMaker': undefined,
            'fee': undefined,
            'info': trade,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
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
        const feedback = this.id + ' ' + body;
        const message = this.safeString (response, 'error');
        if (message !== undefined) {
            this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
            throw new ExchangeError (feedback); // unknown message
        }
    }
};
