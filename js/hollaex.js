'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { BadRequest, AuthenticationError, NetworkError, ArgumentsRequired, OrderNotFound, InsufficientFunds } = require ('./base/errors');
const { TICK_SIZE } = require ('./base/functions/number');
const Precise = require ('./base/Precise');

//  ---------------------------------------------------------------------------

module.exports = class hollaex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'hollaex',
            'name': 'HollaEx',
            'countries': [ 'KR' ],
            // 4 requests per second => 1000ms / 4 = 250 ms between requests
            'rateLimit': 250,
            'version': 'v2',
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': undefined,
                'swap': false,
                'future': false,
                'option': false,
                'addMargin': false,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'createLimitBuyOrder': true,
                'createLimitSellOrder': true,
                'createMarketBuyOrder': true,
                'createMarketSellOrder': true,
                'createOrder': true,
                'createReduceOnlyOrder': false,
                'fetchBalance': true,
                'fetchBorrowRate': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchBorrowRates': false,
                'fetchBorrowRatesPerSymbol': false,
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchDepositAddress': 'emulated',
                'fetchDepositAddresses': true,
                'fetchDeposits': true,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchLeverage': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrder': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrderBooks': true,
                'fetchOrders': true,
                'fetchPosition': false,
                'fetchPositions': false,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': true,
                'fetchTransactions': undefined,
                'fetchWithdrawals': true,
                'reduceMargin': false,
                'setLeverage': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'withdraw': true,
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '15m': '15m',
                '1h': '1h',
                '4h': '4h',
                '1d': '1d',
                '1w': '1w',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/75841031-ca375180-5ddd-11ea-8417-b975674c23cb.jpg',
                'test': 'https://api.sandbox.hollaex.com',
                'api': 'https://api.hollaex.com',
                'www': 'https://hollaex.com',
                'doc': 'https://apidocs.hollaex.com',
                'referral': 'https://pro.hollaex.com/signup?affiliation_code=QSWA6G',
            },
            'precisionMode': TICK_SIZE,
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'api': {
                'public': {
                    'get': {
                        'health': 1,
                        'constants': 1,
                        'kit': 1,
                        'tiers': 1,
                        'ticker': 1,
                        'tickers': 1,
                        'orderbook': 1,
                        'orderbooks': 1,
                        'trades': 1,
                        'chart': 1,
                        'charts': 1,
                        // TradingView
                        'udf/config': 1,
                        'udf/history': 1,
                        'udf/symbols': 1,
                    },
                },
                'private': {
                    'get': {
                        'user': 1,
                        'user/balance': 1,
                        'user/deposits': 1,
                        'user/withdrawals': 1,
                        'user/withdrawal/fee': 1,
                        'user/trades': 1,
                        'orders': 1,
                        'order': 1,
                    },
                    'post': {
                        'user/withdrawal': 1,
                        'order': 1,
                    },
                    'delete': {
                        'order/all': 1,
                        'order': 1,
                    },
                },
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'taker': 0.001,
                    'maker': 0.001,
                },
            },
            'exceptions': {
                'broad': {
                    'Invalid token': AuthenticationError,
                    'Order not found': OrderNotFound,
                    'Insufficient balance': InsufficientFunds,
                },
                'exact': {
                    '400': BadRequest,
                    '403': AuthenticationError,
                    '404': BadRequest,
                    '405': BadRequest,
                    '410': BadRequest,
                    '429': BadRequest,
                    '500': NetworkError,
                    '503': NetworkError,
                },
            },
            'options': {
                // how many seconds before the authenticated request expires
                'api-expires': parseInt (this.timeout / 1000),
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetConstants (params);
        //
        //     {
        //         coins: {
        //             xmr: {
        //                 id: 7,
        //                 fullname: "Monero",
        //                 symbol: "xmr",
        //                 active: true,
        //                 allow_deposit: true,
        //                 allow_withdrawal: true,
        //                 withdrawal_fee: 0.02,
        //                 min: 0.001,
        //                 max: 100000,
        //                 increment_unit: 0.001,
        //                 deposit_limits: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0 },
        //                 withdrawal_limits: { '1': 10, '2': 15, '3': 100, '4': 100, '5': 200, '6': 300, '7': 350, '8': 400, '9': 500, '10': -1 },
        //                 created_at: "2019-12-09T07:14:02.720Z",
        //                 updated_at: "2020-01-16T12:12:53.162Z"
        //             },
        //             // ...
        //         },
        //         pairs: {
        //             'btc-usdt': {
        //                 id: 2,
        //                 name: "btc-usdt",
        //                 pair_base: "btc",
        //                 pair_2: "usdt",
        //                 taker_fees: { '1': 0.3, '2': 0.25, '3': 0.2, '4': 0.18, '5': 0.1, '6': 0.09, '7': 0.08, '8': 0.06, '9': 0.04, '10': 0 },
        //                 maker_fees: { '1': 0.1, '2': 0.08, '3': 0.05, '4': 0.03, '5': 0, '6': 0, '7': 0, '8': 0, '9': 0, '10': 0 },
        //                 min_size: 0.0001,
        //                 max_size: 1000,
        //                 min_price: 100,
        //                 max_price: 100000,
        //                 increment_size: 0.0001,
        //                 increment_price: 0.05,
        //                 active: true,
        //                 created_at: "2019-12-09T07:15:54.537Z",
        //                 updated_at: "2019-12-09T07:15:54.537Z"
        //             },
        //         },
        //         config: { tiers: 10 },
        //         status: true
        //     }
        //
        const pairs = this.safeValue (response, 'pairs', {});
        const keys = Object.keys (pairs);
        const result = [];
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const market = pairs[key];
            const baseId = this.safeString (market, 'pair_base');
            const quoteId = this.safeString (market, 'pair_2');
            const base = this.commonCurrencyCode (baseId.toUpperCase ());
            const quote = this.commonCurrencyCode (quoteId.toUpperCase ());
            result.push ({
                'id': this.safeString (market, 'name'),
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
                'active': this.safeValue (market, 'active'),
                'contract': false,
                'linear': undefined,
                'inverse': undefined,
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': this.safeNumber (market, 'increment_size'),
                    'price': this.safeNumber (market, 'increment_price'),
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': {
                        'min': this.safeNumber (market, 'min_size'),
                        'max': this.safeNumber (market, 'max_size'),
                    },
                    'price': {
                        'min': this.safeNumber (market, 'min_price'),
                        'max': this.safeNumber (market, 'max_price'),
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
                'info': market,
            });
        }
        return result;
    }

    async fetchCurrencies (params = {}) {
        const response = await this.publicGetConstants (params);
        //
        //     {
        //         "coins":{
        //             "bch":{
        //                 "id":4,
        //                 "fullname":"Bitcoin Cash",
        //                 "symbol":"bch",
        //                 "active":true,
        //                 "verified":true,
        //                 "allow_deposit":true,
        //                 "allow_withdrawal":true,
        //                 "withdrawal_fee":0.0001,
        //                 "min":0.001,
        //                 "max":100000,
        //                 "increment_unit":0.001,
        //                 "logo":"https://bitholla.s3.ap-northeast-2.amazonaws.com/icon/BCH-hollaex-asset-01.svg",
        //                 "code":"bch",
        //                 "is_public":true,
        //                 "meta":{},
        //                 "estimated_price":null,
        //                 "description":null,
        //                 "type":"blockchain",
        //                 "network":null,
        //                 "standard":null,
        //                 "issuer":"HollaEx",
        //                 "withdrawal_fees":null,
        //                 "created_at":"2019-08-09T10:45:43.367Z",
        //                 "updated_at":"2021-12-13T03:08:32.372Z",
        //                 "created_by":1,
        //                 "owner_id":1
        //             },
        //         },
        //         "network":"https://api.hollaex.network"
        //     }
        //
        const coins = this.safeValue (response, 'coins', {});
        const keys = Object.keys (coins);
        const result = {};
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const currency = coins[key];
            const id = this.safeString (currency, 'symbol');
            const numericId = this.safeInteger (currency, 'id');
            const code = this.safeCurrencyCode (id);
            const name = this.safeString (currency, 'fullname');
            const depositEnabled = this.safeValue (currency, 'allow_deposit');
            const withdrawEnabled = this.safeValue (currency, 'allow_withdrawal');
            const isActive = this.safeValue (currency, 'active');
            const active = isActive && depositEnabled && withdrawEnabled;
            const fee = this.safeNumber (currency, 'withdrawal_fee');
            const precision = this.safeNumber (currency, 'increment_unit');
            const withdrawalLimits = this.safeValue (currency, 'withdrawal_limits', []);
            result[code] = {
                'id': id,
                'numericId': numericId,
                'code': code,
                'info': currency,
                'name': name,
                'active': active,
                'deposit': depositEnabled,
                'withdraw': withdrawEnabled,
                'fee': fee,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': this.safeNumber (currency, 'min'),
                        'max': this.safeNumber (currency, 'max'),
                    },
                    'withdraw': {
                        'min': undefined,
                        'max': this.safeValue (withdrawalLimits, 0),
                    },
                },
            };
        }
        return result;
    }

    async fetchOrderBooks (symbols = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetOrderbooks (params);
        const result = {};
        const marketIds = Object.keys (response);
        for (let i = 0; i < marketIds.length; i++) {
            const marketId = marketIds[i];
            const orderbook = response[marketId];
            const symbol = this.safeSymbol (marketId, undefined, '-');
            const timestamp = this.parse8601 (this.safeString (orderbook, 'timestamp'));
            result[symbol] = this.parseOrderBook (response[marketId], timestamp);
        }
        return result;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const marketId = this.marketId (symbol);
        const request = {
            'symbol': marketId,
        };
        const response = await this.publicGetOrderbooks (this.extend (request, params));
        //
        //     {
        //         "btc-usdt": {
        //             "bids": [
        //                 [ 8836.4, 1.022 ],
        //                 [ 8800, 0.0668 ],
        //                 [ 8797.75, 0.2398 ],
        //             ],
        //             "asks": [
        //                 [ 8839.35, 1.5334 ],
        //                 [ 8852.6, 0.0579 ],
        //                 [ 8860.45, 0.1815 ],
        //             ],
        //             "timestamp": "2020-03-03T02:27:25.147Z"
        //         },
        //         "eth-usdt": {},
        //         // ...
        //     }
        //
        const orderbook = this.safeValue (response, marketId);
        const timestamp = this.parse8601 (this.safeString (orderbook, 'timestamp'));
        return this.parseOrderBook (orderbook, symbol, timestamp);
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicGetTicker (this.extend (request, params));
        //
        //     {
        //         open: 8615.55,
        //         close: 8841.05,
        //         high: 8921.1,
        //         low: 8607,
        //         last: 8841.05,
        //         volume: 20.2802,
        //         timestamp: '2020-03-03T03:11:18.964Z'
        //     }
        //
        return this.parseTicker (response, market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetTickers (this.extend (params));
        //
        //     {
        //         "bch-usdt": {
        //             "time": "2020-03-02T04:29:45.011Z",
        //             "open": 341.65,
        //             "close":337.9,
        //             "high":341.65,
        //             "low":337.3,
        //             "last":337.9,
        //             "volume":0.054,
        //             "symbol":"bch-usdt"
        //         },
        //         // ...
        //     }
        //
        return this.parseTickers (response, symbols);
    }

    parseTickers (response, symbols = undefined, params = {}) {
        const result = {};
        const keys = Object.keys (response);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const ticker = response[key];
            const marketId = this.safeString (ticker, 'symbol', key);
            const market = this.safeMarket (marketId, undefined, '-');
            const symbol = market['symbol'];
            result[symbol] = this.extend (this.parseTicker (ticker, market), params);
        }
        return this.filterByArray (result, 'symbol', symbols);
    }

    parseTicker (ticker, market = undefined) {
        //
        // fetchTicker
        //
        //     {
        //         open: 8615.55,
        //         close: 8841.05,
        //         high: 8921.1,
        //         low: 8607,
        //         last: 8841.05,
        //         volume: 20.2802,
        //         timestamp: '2020-03-03T03:11:18.964Z',
        //     }
        //
        // fetchTickers
        //
        //     {
        //         "time": "2020-03-02T04:29:45.011Z",
        //         "open": 341.65,
        //         "close": 337.9,
        //         "high": 341.65,
        //         "low": 337.3,
        //         "last": 337.9,
        //         "volume": 0.054,
        //         "symbol": "bch-usdt"
        //     }
        //
        const marketId = this.safeString (ticker, 'symbol');
        market = this.safeMarket (marketId, market, '-');
        const symbol = market['symbol'];
        const timestamp = this.parse8601 (this.safeString2 (ticker, 'time', 'timestamp'));
        const close = this.safeString (ticker, 'close');
        return this.safeTicker ({
            'symbol': symbol,
            'info': ticker,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'high'),
            'low': this.safeString (ticker, 'low'),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': this.safeString (ticker, 'open'),
            'close': close,
            'last': this.safeString (ticker, 'last', close),
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeString (ticker, 'volume'),
            'quoteVolume': undefined,
        }, market, false);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicGetTrades (this.extend (request, params));
        //
        //     {
        //         "btc-usdt": [
        //             {
        //                 "size": 0.5,
        //                 "price": 8830,
        //                 "side": "buy",
        //                 "timestamp": "2020-03-03T04:44:33.034Z"
        //             },
        //             // ...
        //         ]
        //     }
        //
        const trades = this.safeValue (response, market['id'], []);
        return this.parseTrades (trades, market, since, limit);
    }

    parseTrade (trade, market = undefined) {
        //
        // fetchTrades (public)
        //
        //     {
        //         "size": 0.5,
        //         "price": 8830,
        //         "side": "buy",
        //         "timestamp": "2020-03-03T04:44:33.034Z"
        //     }
        //
        // fetchMyTrades (private)
        //  {
        //      "side":"sell",
        //      "symbol":"doge-usdt",
        //      "size":70,
        //      "price":0.147411,
        //      "timestamp":"2022-01-26T17:53:34.650Z",
        //      "order_id":"cba78ecb-4187-4da2-9d2f-c259aa693b5a",
        //      "fee":0.01031877,"fee_coin":"usdt"
        //  }
        //
        const marketId = this.safeString (trade, 'symbol');
        market = this.safeMarket (marketId, market, '-');
        const symbol = market['symbol'];
        const datetime = this.safeString (trade, 'timestamp');
        const timestamp = this.parse8601 (datetime);
        const side = this.safeString (trade, 'side');
        const orderId = this.safeString (trade, 'order_id');
        const priceString = this.safeString (trade, 'price');
        const amountString = this.safeString (trade, 'size');
        const feeCostString = this.safeString (trade, 'fee');
        let fee = undefined;
        if (feeCostString !== undefined) {
            fee = {
                'cost': feeCostString,
                'currency': market['quote'],
            };
        }
        return this.safeTrade ({
            'info': trade,
            'id': undefined,
            'timestamp': timestamp,
            'datetime': datetime,
            'symbol': symbol,
            'order': orderId,
            'type': undefined,
            'side': side,
            'takerOrMaker': undefined,
            'price': priceString,
            'amount': amountString,
            'cost': undefined,
            'fee': fee,
        }, market);
    }

    async fetchTradingFees (params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetTiers (params);
        //
        //     {
        //         '1': {
        //             id: '1',
        //             name: 'Silver',
        //             icon: '',
        //             description: 'Your crypto journey starts here! Make your first deposit to start trading, and verify your account to level up!',
        //             deposit_limit: '0',
        //             withdrawal_limit: '1000',
        //             fees: {
        //                 maker: {
        //                     'eth-btc': '0.1',
        //                     'ada-usdt': '0.1',
        //                     ...
        //                 },
        //                 taker: {
        //                     'eth-btc': '0.1',
        //                     'ada-usdt': '0.1',
        //                     ...
        //                 }
        //             },
        //             note: '<ul>\n<li>Login and verify email</li>\n</ul>\n',
        //             created_at: '2021-03-22T03:51:39.129Z',
        //             updated_at: '2021-11-01T02:51:56.214Z'
        //         },
        //         ...
        //     }
        //
        const firstTier = this.safeValue (response, '1', {});
        const fees = this.safeValue (firstTier, 'fees', {});
        const makerFees = this.safeValue (fees, 'maker', {});
        const takerFees = this.safeValue (fees, 'taker', {});
        const result = {};
        for (let i = 0; i < this.symbols.length; i++) {
            const symbol = this.symbols[i];
            const market = this.market (symbol);
            const makerString = this.safeString (makerFees, market['id']);
            const takerString = this.safeString (takerFees, market['id']);
            result[symbol] = {
                'info': fees,
                'symbol': symbol,
                'maker': this.parseNumber (Precise.stringDiv (makerString, '100')),
                'taker': this.parseNumber (Precise.stringDiv (takerString, '100')),
                'percentage': true,
                'tierBased': true,
            };
        }
        return result;
    }

    async fetchOHLCV (symbol, timeframe = '1h', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'resolution': this.timeframes[timeframe],
        };
        const duration = this.parseTimeframe (timeframe);
        if (since === undefined) {
            if (limit === undefined) {
                throw new ArgumentsRequired (this.id + " fetchOHLCV() requires a 'since' or a 'limit' argument");
            } else {
                const end = this.seconds ();
                const start = end - duration * limit;
                request['to'] = end;
                request['from'] = start;
            }
        } else {
            if (limit === undefined) {
                request['from'] = parseInt (since / 1000);
                request['to'] = this.seconds ();
            } else {
                const start = parseInt (since / 1000);
                request['from'] = start;
                request['to'] = this.sum (start, duration * limit);
            }
        }
        const response = await this.publicGetChart (this.extend (request, params));
        //
        //     [
        //         {
        //             "time":"2020-03-02T20:00:00.000Z",
        //             "close":8872.1,
        //             "high":8872.1,
        //             "low":8858.6,
        //             "open":8858.6,
        //             "symbol":"btc-usdt",
        //             "volume":1.2922
        //         },
        //     ]
        //
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    parseOHLCV (response, market = undefined, timeframe = '1h', since = undefined, limit = undefined) {
        //
        //     {
        //         "time":"2020-03-02T20:00:00.000Z",
        //         "close":8872.1,
        //         "high":8872.1,
        //         "low":8858.6,
        //         "open":8858.6,
        //         "symbol":"btc-usdt",
        //         "volume":1.2922
        //     }
        //
        return [
            this.parse8601 (this.safeString (response, 'time')),
            this.safeNumber (response, 'open'),
            this.safeNumber (response, 'high'),
            this.safeNumber (response, 'low'),
            this.safeNumber (response, 'close'),
            this.safeNumber (response, 'volume'),
        ];
    }

    parseBalance (response) {
        const timestamp = this.parse8601 (this.safeString (response, 'updated_at'));
        const result = {
            'info': response,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        const currencyIds = Object.keys (this.currencies_by_id);
        for (let i = 0; i < currencyIds.length; i++) {
            const currencyId = currencyIds[i];
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeString (response, currencyId + '_available');
            account['total'] = this.safeString (response, currencyId + '_balance');
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetUserBalance (params);
        //
        //     {
        //         "updated_at": "2020-03-02T22:27:38.428Z",
        //         "btc_balance": 0,
        //         "btc_pending": 0,
        //         "btc_available": 0,
        //         "eth_balance": 0,
        //         "eth_pending": 0,
        //         "eth_available": 0,
        //         // ...
        //     }
        //
        return this.parseBalance (response);
    }

    async fetchOpenOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'order_id': id,
        };
        const response = await this.privateGetOrder (this.extend (request, params));
        //
        //     {
        //         "id": "string",
        //         "side": "sell",
        //         "symbol": "xht-usdt",
        //         "size": 0.1,
        //         "filled": 0,
        //         "stop": null,
        //         "fee": 0,
        //         "fee_coin": "usdt",
        //         "type": "limit",
        //         "price": 1.09,
        //         "status": "new",
        //         "created_by": 116,
        //         "created_at": "2021-02-17T02:32:38.910Z",
        //         "updated_at": "2021-02-17T02:32:38.910Z",
        //         "User": {
        //             "id": 116,
        //             "email": "fight@club.com",
        //             "username": "narrator",
        //             "exchange_id": 176
        //         }
        //     }
        //
        return this.parseOrder (response);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'open': true,
        };
        return await this.fetchOrders (symbol, since, limit, this.extend (request, params));
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'open': false,
        };
        return await this.fetchOrders (symbol, since, limit, this.extend (request, params));
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'order_id': id,
        };
        const response = await this.privateGetOrder (this.extend (request, params));
        //             {
        //                 "id": "string",
        //                 "side": "sell",
        //                 "symbol": "xht-usdt",
        //                 "size": 0.1,
        //                 "filled": 0,
        //                 "stop": null,
        //                 "fee": 0,
        //                 "fee_coin": "usdt",
        //                 "type": "limit",
        //                 "price": 1.09,
        //                 "status": "new",
        //                 "created_by": 116,
        //                 "created_at": "2021-02-17T02:32:38.910Z",
        //                 "updated_at": "2021-02-17T02:32:38.910Z",
        //                 "User": {
        //                     "id": 116,
        //                     "email": "fight@club.com",
        //                     "username": "narrator",
        //                     "exchange_id": 176
        //                 }
        //             }
        const order = response;
        if (order === undefined) {
            throw new OrderNotFound (this.id + ' fetchOrder() could not find order id ' + id);
        }
        return this.parseOrder (order);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        const request = {
            // 'symbol': market['id'],
            // 'side': 'buy', // 'sell'
            // 'status': 'new', // 'filled', 'pfilled', 'canceled'
            // 'open': true,
            // 'limit': limit, // default 50, max 100
            // 'page': 1,
            // 'order_by': 'created_at', // id, ...
            // 'order': 'asc', // 'desc'
            // 'start_date': this.iso8601 (since),
            // 'end_date': this.iso8601 (this.milliseconds ()),
        };
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (since !== undefined) {
            request['start_date'] = this.iso8601 (since);
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 50, max 100
        }
        const response = await this.privateGetOrders (this.extend (request, params));
        //
        //     {
        //         "count": 1,
        //         "data": [
        //             {
        //                 "id": "string",
        //                 "side": "sell",
        //                 "symbol": "xht-usdt",
        //                 "size": 0.1,
        //                 "filled": 0,
        //                 "stop": null,
        //                 "fee": 0,
        //                 "fee_coin": "usdt",
        //                 "type": "limit",
        //                 "price": 1.09,
        //                 "status": "new",
        //                 "created_by": 116,
        //                 "created_at": "2021-02-17T02:32:38.910Z",
        //                 "updated_at": "2021-02-17T02:32:38.910Z",
        //                 "User": {
        //                     "id": 116,
        //                     "email": "fight@club.com",
        //                     "username": "narrator",
        //                     "exchange_id": 176
        //                 }
        //             }
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseOrders (data, market, since, limit);
    }

    parseOrderStatus (status) {
        const statuses = {
            'new': 'open',
            'pfilled': 'open',
            'filled': 'closed',
            'canceled': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        //
        // createOrder, fetchOpenOrder, fetchOpenOrders
        //
        //     {
        //         "id": "string",
        //         "side": "sell",
        //         "symbol": "xht-usdt",
        //         "size": 0.1,
        //         "filled": 0,
        //         "stop": null,
        //         "fee": 0,
        //         "fee_coin": "usdt",
        //         "type": "limit",
        //         "price": 1.09,
        //         "status": "new",
        //         "created_by": 116,
        //         "created_at": "2021-02-17T02:32:38.910Z",
        //         "updated_at": "2021-02-17T02:32:38.910Z",
        //         "User": {
        //             "id": 116,
        //             "email": "fight@club.com",
        //             "username": "narrator",
        //             "exchange_id": 176
        //         },
        //         "fee_structure": {
        //             "maker": 0.2,
        //             "taker": 0.2
        //         },
        //     }
        //
        const marketId = this.safeString (order, 'symbol');
        const symbol = this.safeSymbol (marketId, market, '-');
        const id = this.safeString (order, 'id');
        const timestamp = this.parse8601 (this.safeString (order, 'created_at'));
        const type = this.safeString (order, 'type');
        const side = this.safeString (order, 'side');
        const price = this.safeString (order, 'price');
        const amount = this.safeString (order, 'size');
        const filled = this.safeString (order, 'filled');
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        return this.safeOrder ({
            'id': id,
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': symbol,
            'type': type,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': undefined,
            'amount': amount,
            'filled': filled,
            'remaining': undefined,
            'cost': undefined,
            'trades': undefined,
            'fee': undefined,
            'info': order,
            'average': undefined,
        }, market);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'side': side,
            'size': this.normalizeNumberIfNeeded (amount),
            'type': type,
            // 'stop': parseFloat (this.priceToPrecision (symbol, stopPrice)),
            // 'meta': {}, // other options such as post_only
        };
        if (type !== 'market') {
            const convertedPrice = parseFloat (this.priceToPrecision (symbol, price));
            request['price'] = this.normalizeNumberIfNeeded (convertedPrice);
        }
        const stopPrice = this.safeNumber2 (params, 'stopPrice', 'stop');
        if (stopPrice !== undefined) {
            request['stop'] = this.normalizeNumberIfNeeded (parseFloat (this.priceToPrecision (symbol, stopPrice)));
            params = this.omit (params, [ 'stopPrice', 'stop' ]);
        }
        const response = await this.privatePostOrder (this.extend (request, params));
        //
        //     {
        //         "fee": 0,
        //         "meta": {},
        //         "symbol": "xht-usdt",
        //         "side": "sell",
        //         "size": 0.1,
        //         "type": "limit",
        //         "price": 1,
        //         "fee_structure": {
        //             "maker": 0.2,
        //             "taker": 0.2
        //         },
        //         "fee_coin": "usdt",
        //         "id": "string",
        //         "created_by": 116,
        //         "filled": 0,
        //         "status": "new",
        //         "updated_at": "2021-02-17T03:03:19.231Z",
        //         "created_at": "2021-02-17T03:03:19.231Z",
        //         "stop": null
        //     }
        //
        return this.parseOrder (response, market);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'order_id': id,
        };
        const response = await this.privateDeleteOrder (this.extend (request, params));
        //
        //     {
        //         "title": "string",
        //         "symbol": "xht-usdt",
        //         "side": "sell",
        //         "size": 1,
        //         "type": "limit",
        //         "price": 0.1,
        //         "id": "string",
        //         "created_by": 34,
        //         "filled": 0
        //     }
        //
        return this.parseOrder (response);
    }

    async cancelAllOrders (symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + " cancelAllOrders() requires a 'symbol' argument");
        }
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        market = this.market (symbol);
        request['symbol'] = market['id'];
        const response = await this.privateDeleteOrderAll (this.extend (request, params));
        //
        //     [
        //         {
        //             "title": "string",
        //             "symbol": "xht-usdt",
        //             "side": "sell",
        //             "size": 1,
        //             "type": "limit",
        //             "price": 0.1,
        //             "id": "string",
        //             "created_by": 34,
        //             "filled": 0
        //         }
        //     ]
        //
        return this.parseOrders (response, market);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            // 'symbol': market['id'],
            // 'limit': 50, // default 50, max 100
            // 'page': 1, // page of data to retrieve
            // 'order_by': 'timestamp', // field to order data
            // 'order': 'asc', // asc or desc
            // 'start_date': 123, // starting date of queried data
            // 'end_date': 321, // ending date of queried data
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 50, max 100
        }
        if (since !== undefined) {
            request['start_date'] = this.iso8601 (since);
        }
        const response = await this.privateGetUserTrades (this.extend (request, params));
        //
        //     {
        //         "count": 1,
        //         "data": [
        //             {
        //                 "side": "buy",
        //                 "symbol": "eth-usdt",
        //                 "size": 0.086,
        //                 "price": 226.19,
        //                 "timestamp": "2020-03-03T08:03:55.459Z",
        //                 "fee": 0.1
        //             }
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseTrades (data, market, since, limit);
    }

    parseDepositAddress (depositAddress, currency = undefined) {
        //
        //     {
        //         "currency":"usdt",
        //         "address":"TECLD9XBH31XpyykdHU3uEAeUK7E6Lrmik",
        //         "network":"trx",
        //         "standard":null,
        //         "is_valid":true,
        //         "created_at":"2021-05-12T02:43:05.446Z"
        //     }
        //
        let address = this.safeString (depositAddress, 'address');
        let tag = undefined;
        if (address !== undefined) {
            const parts = address.split (':');
            address = this.safeString (parts, 0);
            tag = this.safeString (parts, 1);
        }
        this.checkAddress (address);
        const currencyId = this.safeString (depositAddress, 'currency');
        currency = this.safeCurrency (currencyId, currency);
        const network = this.safeString (depositAddress, 'network');
        return {
            'currency': currency['code'],
            'address': address,
            'tag': tag,
            'network': network,
            'info': depositAddress,
        };
    }

    async fetchDepositAddresses (codes = undefined, params = {}) {
        await this.loadMarkets ();
        const network = this.safeString (params, 'network');
        params = this.omit (params, 'network');
        const response = await this.privateGetUser (params);
        //
        //     {
        //         "id":620,
        //         "email":"igor.kroitor@gmail.com",
        //         "full_name":"",
        //         "gender":false,
        //         "nationality":"",
        //         "dob":null,
        //         "phone_number":"",
        //         "address":{"city":"","address":"","country":"","postal_code":""},
        //         "id_data":{"note":"","type":"","number":"","status":0,"issued_date":"","expiration_date":""},
        //         "bank_account":[],
        //         "crypto_wallet":{},
        //         "verification_level":1,
        //         "email_verified":true,
        //         "otp_enabled":true,
        //         "activated":true,
        //         "username":"igor.kroitor",
        //         "affiliation_code":"QSWA6G",
        //         "settings":{
        //             "chat":{"set_username":false},
        //             "risk":{"popup_warning":false,"order_portfolio_percentage":20},
        //             "audio":{"public_trade":false,"order_completed":true,"order_partially_completed":true},
        //             "language":"en",
        //             "interface":{"theme":"white","order_book_levels":10},
        //             "notification":{"popup_order_completed":true,"popup_order_confirmation":true,"popup_order_partially_filled":true}
        //         },
        //         "affiliation_rate":0,
        //         "network_id":10620,
        //         "discount":0,
        //         "created_at":"2021-03-24T02:37:57.379Z",
        //         "updated_at":"2021-03-24T02:37:57.379Z",
        //         "balance":{
        //             "btc_balance":0,
        //             "btc_available":0,
        //             "eth_balance":0.000914,
        //             "eth_available":0.000914,
        //             "updated_at":"2020-03-04T04:03:27.174Z
        //         "},
        //         "wallet":[
        //             {"currency":"usdt","address":"TECLD9XBH31XpyykdHU3uEAeUK7E6Lrmik","network":"trx","standard":null,"is_valid":true,"created_at":"2021-05-12T02:43:05.446Z"},
        //             {"currency":"xrp","address":"rGcSzmuRx8qngPRnrvpCKkP9V4njeCPGCv:286741597","network":"xrp","standard":null,"is_valid":true,"created_at":"2021-05-12T02:49:01.273Z"}
        //         ]
        //     }
        //
        const wallet = this.safeValue (response, 'wallet', []);
        const addresses = (network === undefined) ? wallet : this.filterBy (wallet, 'network', network);
        return this.parseDepositAddresses (addresses, codes);
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            // 'currency': currency['id'],
            // 'limit': 50, // default 50, max 100
            // 'page': 1, // page of data to retrieve
            // 'order_by': 'timestamp', // field to order data
            // 'order': 'asc', // asc or desc
            // 'start_date': 123, // starting date of queried data
            // 'end_date': 321, // ending date of queried data
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 50, max 100
        }
        if (since !== undefined) {
            request['start_date'] = this.iso8601 (since);
        }
        const response = await this.privateGetUserDeposits (this.extend (request, params));
        //
        //     {
        //         "count": 1,
        //         "data": [
        //             {
        //                 "id": 539,
        //                 "amount": 20,
        //                 "fee": 0,
        //                 "address": "0x5c0cc98270d7089408fcbcc8e2131287f5be2306",
        //                 "transaction_id": "0xd4006327a5ec2c41adbdcf566eaaba6597c3d45906abe78ea1a4a022647c2e28",
        //                 "status": true,
        //                 "dismissed": false,
        //                 "rejected": false,
        //                 "description": "",
        //                 "type": "deposit",
        //                 "currency": "usdt",
        //                 "created_at": "2020-03-03T07:56:36.198Z",
        //                 "updated_at": "2020-03-03T08:00:05.674Z",
        //                 "user_id": 620
        //             }
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseTransactions (data, currency, since, limit);
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            // 'currency': currency['id'],
            // 'limit': 50, // default 50, max 100
            // 'page': 1, // page of data to retrieve
            // 'order_by': 'timestamp', // field to order data
            // 'order': 'asc', // asc or desc
            // 'start_date': 123, // starting date of queried data
            // 'end_date': 321, // ending date of queried data
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 50, max 100
        }
        if (since !== undefined) {
            request['start_date'] = this.iso8601 (since);
        }
        const response = await this.privateGetUserWithdrawals (this.extend (request, params));
        //
        //     {
        //         "count": 1,
        //         "data": [
        //             {
        //                 "id": 539,
        //                 "amount": 20,
        //                 "fee": 0,
        //                 "address": "0x5c0cc98270d7089408fcbcc8e2131287f5be2306",
        //                 "transaction_id": "0xd4006327a5ec2c41adbdcf566eaaba6597c3d45906abe78ea1a4a022647c2e28",
        //                 "status": true,
        //                 "dismissed": false,
        //                 "rejected": false,
        //                 "description": "",
        //                 "type": "withdrawal",
        //                 "currency": "usdt",
        //                 "created_at": "2020-03-03T07:56:36.198Z",
        //                 "updated_at": "2020-03-03T08:00:05.674Z",
        //                 "user_id": 620
        //             }
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseTransactions (data, currency, since, limit);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        // fetchWithdrawals, fetchDeposits
        //
        //     {
        //         "id": 539,
        //         "amount": 20,
        //         "fee": 0,
        //         "address": "0x5c0cc98270d7089408fcbcc8e2131287f5be2306",
        //         "transaction_id": "0xd4006327a5ec2c41adbdcf566eaaba6597c3d45906abe78ea1a4a022647c2e28",
        //         "status": true,
        //         "dismissed": false,
        //         "rejected": false,
        //         "description": "",
        //         "type": "withdrawal",
        //         "currency": "usdt",
        //         "created_at": "2020-03-03T07:56:36.198Z",
        //         "updated_at": "2020-03-03T08:00:05.674Z",
        //         "user_id": 620
        //     }
        //
        // withdraw
        //
        //     {
        //         message: 'Withdrawal request is in the queue and will be processed.',
        //         transaction_id: '1d1683c3-576a-4d53-8ff5-27c93fd9758a',
        //         amount: 1,
        //         currency: 'xht',
        //         fee: 0,
        //         fee_coin: 'xht'
        //     }
        //
        const id = this.safeString (transaction, 'id');
        const txid = this.safeString (transaction, 'transaction_id');
        const timestamp = this.parse8601 (this.safeString (transaction, 'created_at'));
        const updated = this.parse8601 (this.safeString (transaction, 'updated_at'));
        const type = this.safeString (transaction, 'type');
        const amount = this.safeNumber (transaction, 'amount');
        let address = this.safeString (transaction, 'address');
        let addressTo = undefined;
        const addressFrom = undefined;
        let tag = undefined;
        let tagTo = undefined;
        const tagFrom = undefined;
        if (address !== undefined) {
            const parts = address.split (':');
            address = this.safeString (parts, 0);
            tag = this.safeString (parts, 1);
            addressTo = address;
            tagTo = tag;
        }
        const currencyId = this.safeString (transaction, 'currency');
        currency = this.safeCurrency (currencyId, currency);
        let status = this.safeValue (transaction, 'status');
        const dismissed = this.safeValue (transaction, 'dismissed');
        const rejected = this.safeValue (transaction, 'rejected');
        if (status) {
            status = 'ok';
        } else if (dismissed) {
            status = 'canceled';
        } else if (rejected) {
            status = 'failed';
        } else {
            status = 'pending';
        }
        const feeCurrencyId = this.safeString (transaction, 'fee_coin');
        const feeCurrencyCode = this.safeCurrencyCode (feeCurrencyId, currency);
        const fee = {
            'currency': feeCurrencyCode,
            'cost': this.safeNumber (transaction, 'fee'),
        };
        return {
            'info': transaction,
            'id': id,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'network': undefined,
            'addressFrom': addressFrom,
            'address': address,
            'addressTo': addressTo,
            'tagFrom': tagFrom,
            'tag': tag,
            'tagTo': tagTo,
            'type': type,
            'amount': amount,
            'currency': currency['code'],
            'status': status,
            'updated': updated,
            'fee': fee,
        };
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        [ tag, params ] = this.handleWithdrawTagAndParams (tag, params);
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currency (code);
        if (tag !== undefined) {
            address += ':' + tag;
        }
        const request = {
            'currency': currency['id'],
            'amount': amount,
            'address': address,
        };
        const network = this.safeString (params, 'network');
        if (network !== undefined) {
            request['network'] = network;
        }
        const response = await this.privatePostUserWithdrawal (this.extend (request, params));
        //
        //     {
        //         message: 'Withdrawal request is in the queue and will be processed.',
        //         transaction_id: '1d1683c3-576a-4d53-8ff5-27c93fd9758a',
        //         amount: 1,
        //         currency: 'xht',
        //         fee: 0,
        //         fee_coin: 'xht'
        //     }
        //
        return this.parseTransaction (response, currency);
    }

    normalizeNumberIfNeeded (number) {
        if (number % 1 === 0) {
            number = parseInt (number);
        }
        return number;
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const query = this.omit (params, this.extractParams (path));
        path = '/' + this.version + '/' + this.implodeParams (path, params);
        if ((method === 'GET') || (method === 'DELETE')) {
            if (Object.keys (query).length) {
                path += '?' + this.urlencode (query);
            }
        }
        const url = this.urls['api'] + path;
        if (api === 'private') {
            this.checkRequiredCredentials ();
            const defaultExpires = this.safeInteger2 (this.options, 'api-expires', 'expires', parseInt (this.timeout / 1000));
            const expires = this.sum (this.seconds (), defaultExpires);
            const expiresString = expires.toString ();
            let auth = method + path + expiresString;
            headers = {
                'api-key': this.apiKey,
                'api-expires': expiresString,
            };
            if (method === 'POST') {
                headers['Content-type'] = 'application/json';
                if (Object.keys (query).length) {
                    body = this.json (query);
                    auth += body;
                }
            }
            const signature = this.hmac (this.encode (auth), this.encode (this.secret));
            headers['api-signature'] = signature;
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return;
        }
        if ((code >= 400) && (code <= 503)) {
            //
            //  { "message": "Invalid token" }
            //
            const feedback = this.id + ' ' + body;
            const message = this.safeString (response, 'message');
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
            const status = code.toString ();
            this.throwExactlyMatchedException (this.exceptions['exact'], status, feedback);
        }
    }
};
