'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeNotAvailable, ExchangeError, DDoSProtection, BadSymbol, InvalidOrder, ArgumentsRequired, AuthenticationError, OrderNotFound, PermissionDenied, InsufficientFunds, BadRequest } = require ('./base/errors');
const Precise = require ('./base/Precise');

//  ---------------------------------------------------------------------------

module.exports = class whitebit extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'whitebit',
            'name': 'WhiteBit',
            'version': 'v2',
            'countries': [ 'EE' ],
            'rateLimit': 500,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': undefined, // has but unimplemented
                'swap': false,
                'future': false,
                'option': false,
                'cancelOrder': true,
                'createDepositAddress': undefined,
                'createLimitOrder': undefined,
                'createMarketOrder': undefined,
                'createOrder': true,
                'editOrder': undefined,
                'fetchBalance': true,
                'fetchBidsAsks': undefined,
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchFundingFees': true,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrderBook': true,
                'fetchOrderTrades': true,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': true,
                'withdraw': true,
            },
            'timeframes': {
                '1m': '1m',
                '3m': '3m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '2h': '2h',
                '4h': '4h',
                '6h': '6h',
                '8h': '8h',
                '12h': '12h',
                '1d': '1d',
                '3d': '3d',
                '1w': '1w',
                '1M': '1M',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/66732963-8eb7dd00-ee66-11e9-849b-10d9282bb9e0.jpg',
                'api': {
                    'v1': {
                        'public': 'https://whitebit.com/api/v1/public',
                        'private': 'https://whitebit.com/api/v1',
                    },
                    'v2': {
                        'public': 'https://whitebit.com/api/v2/public',
                    },
                    'v4': {
                        'public': 'https://whitebit.com/api/v4/public',
                        'private': 'https://whitebit.com/api/v4',
                    },
                },
                'www': 'https://www.whitebit.com',
                'doc': 'https://github.com/whitebit-exchange/api-docs',
                'fees': 'https://whitebit.com/fee-schedule',
                'referral': 'https://whitebit.com/referral/d9bdf40e-28f2-4b52-b2f9-cd1415d82963',
            },
            'api': {
                'web': {
                    'get': [
                        'v1/healthcheck',
                    ],
                },
                'v1': {
                    'public': {
                        'get': [
                            'markets',
                            'tickers',
                            'ticker',
                            'symbols',
                            'depth/result',
                            'history',
                            'kline',
                        ],
                    },
                    'private': {
                        'post': [
                            'account/balance',
                            'order/new',
                            'order/cancel',
                            'orders',
                            'account/order_history',
                            'account/executed_history',
                            'account/executed_history/all',
                            'account/order',
                        ],
                    },
                },
                'v2': {
                    'public': {
                        'get': [
                            'markets',
                            'ticker',
                            'assets',
                            'fee',
                            'depth/{market}',
                            'trades/{market}',
                        ],
                    },
                },
                'v4': {
                    'public': {
                        'get': [
                            'assets',
                            'fee',
                            'orderbook/{market}',
                            'ticker',
                            'trades/{market}',
                            'time',
                            'ping',
                        ],
                    },
                    'private': {
                        'post': [
                            'main-account/address',
                            'main-account/balance',
                            'main-account/create-new-address',
                            'main-account/codes',
                            'main-account/codes/apply',
                            'main-account/codes/my',
                            'main-account/codes/history',
                            'main-account/fiat-deposit-url',
                            'main-account/history',
                            'main-account/withdraw',
                            'main-account/withdraw-pay',
                            'trade-account/balance',
                            'trade-account/executed-history',
                            'trade-account/order',
                            'trade-account/order/history',
                            'order/new',
                            'order/market',
                            'order/stock_market',
                            'order/stop_limit',
                            'order/stop_market',
                            'order/cancel',
                            'orders',
                        ],
                    },
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'taker': this.parseNumber ('0.001'),
                    'maker': this.parseNumber ('0.001'),
                },
            },
            'options': {
                'createMarketBuyOrderRequiresPrice': true,
                'fiatCurrencies': [ 'EUR', 'USD', 'RUB', 'UAH' ],
            },
            'exceptions': {
                'exact': {
                    'Unauthorized request.': AuthenticationError, // {"code":10,"message":"Unauthorized request."}
                    'The market format is invalid.': BadSymbol, // {"code":0,"message":"Validation failed","errors":{"market":["The market format is invalid."]}}
                    'Market is not available': BadSymbol, // {"success":false,"message":{"market":["Market is not available"]},"result":[]}
                    'Invalid payload.': BadRequest, // {"code":9,"message":"Invalid payload."}
                    'Amount must be greater than 0': InvalidOrder, // {"code":0,"message":"Validation failed","errors":{"amount":["Amount must be greater than 0"]}}
                    'The order id field is required.': InvalidOrder, // {"code":0,"message":"Validation failed","errors":{"orderId":["The order id field is required."]}}
                    'Not enough balance': InsufficientFunds, // {"code":0,"message":"Validation failed","errors":{"amount":["Not enough balance"]}}
                    'This action is unauthorized.': PermissionDenied, // {"code":0,"message":"This action is unauthorized."}
                    'This API Key is not authorized to perform this action.': PermissionDenied, // {"code":4,"message":"This API Key is not authorized to perform this action."}
                    'Unexecuted order was not found.': OrderNotFound, // {"code":2,"message":"Inner validation failed","errors":{"order_id":["Unexecuted order was not found."]}}
                    '503': ExchangeNotAvailable, // {"response":null,"status":503,"errors":{"message":[""]},"notification":null,"warning":null,"_token":null},
                    '422': OrderNotFound, // {"response":null,"status":422,"errors":{"orderId":["Finished order id 1295772653 not found on your account"]},"notification":null,"warning":"Finished order id 1295772653 not found on your account","_token":null}
                },
                'broad': {
                    'Given amount is less than min amount': InvalidOrder, // {"code":0,"message":"Validation failed","errors":{"amount":["Given amount is less than min amount 200000"],"total":["Total is less than 5.05"]}}
                    'Total is less than': InvalidOrder, // {"code":0,"message":"Validation failed","errors":{"amount":["Given amount is less than min amount 200000"],"total":["Total is less than 5.05"]}}
                    'fee must be no less than': InvalidOrder, // {"code":0,"message":"Validation failed","errors":{"amount":["Total amount + fee must be no less than 5.05505"]}}
                    'Enable your key in API settings': PermissionDenied, // {"code":2,"message":"This action is unauthorized. Enable your key in API settings"}
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.v2PublicGetMarkets (params);
        //
        //    {
        //        "success": true,
        //        "message": "",
        //        "result": [
        //            {
        //                "name":
        //                "C98_USDT",
        //                "stock":"C98",
        //                "money":"USDT",
        //                "stockPrec":"3",
        //                "moneyPrec":"5",
        //                "feePrec":"6",
        //                "makerFee":"0.001",
        //                "takerFee":"0.001",
        //                "minAmount":"2.5",
        //                "minTotal":"5.05",
        //                "tradesEnabled":true
        //            },
        //            ...
        //        ]
        //    }
        //
        const markets = this.safeValue (response, 'result');
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString (market, 'name');
            const baseId = this.safeString (market, 'stock');
            const quoteId = this.safeString (market, 'money');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const active = this.safeValue (market, 'tradesEnabled');
            const entry = {
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'settle': undefined,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': undefined,
                'type': 'spot',
                'spot': true,
                'margin': undefined,
                'swap': false,
                'future': false,
                'option': false,
                'active': active,
                'contract': false,
                'linear': undefined,
                'inverse': undefined,
                'taker': this.safeNumber (market, 'makerFee'),
                'maker': this.safeNumber (market, 'takerFee'),
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': this.safeInteger (market, 'stockPrec'),
                    'price': this.safeInteger (market, 'moneyPrec'),
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': {
                        'min': this.safeNumber (market, 'minAmount'),
                        'max': undefined,
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'cost': {
                        'min': this.safeNumber (market, 'minTotal'),
                        'max': undefined,
                    },
                },
                'info': market,
            };
            result.push (entry);
        }
        return result;
    }

    async fetchCurrencies (params = {}) {
        const response = await this.v4PublicGetAssets (params);
        //
        //      "BTC": {
        //          "name": "Bitcoin",
        //          "unified_cryptoasset_id": 1,
        //          "can_withdraw": true,
        //          "can_deposit": true,
        //          "min_withdraw": "0.001",
        //          "max_withdraw": "2",
        //          "maker_fee": "0.1",
        //          "taker_fee": "0.1",
        //          "min_deposit": "0.0001",
        //           "max_deposit": "0",
        //       },
        //
        const ids = Object.keys (response);
        const result = {};
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const currency = response[id];
            // breaks down in Python due to utf8 encoding issues on the exchange side
            // const name = this.safeString (currency, 'name');
            const canDeposit = this.safeValue (currency, 'can_deposit', true);
            const canWithdraw = this.safeValue (currency, 'can_withdraw', true);
            const active = canDeposit && canWithdraw;
            const code = this.safeCurrencyCode (id);
            result[code] = {
                'id': id,
                'code': code,
                'info': currency, // the original payload
                'name': undefined, // see the comment above
                'active': active,
                'deposit': canDeposit,
                'withdraw': canWithdraw,
                'fee': undefined,
                'precision': undefined,
                'limits': {
                    'amount': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': this.safeNumber (currency, 'min_withdraw'),
                        'max': this.safeNumber (currency, 'max_withdraw'),
                    },
                },
            };
        }
        return result;
    }

    async fetchFundingFees (params = {}) {
        await this.loadMarkets ();
        const response = await this.v4PublicGetFee (params);
        //
        //      {
        //          "1INCH":{
        //              "is_depositable":true,
        //              "is_withdrawal":true,
        //              "ticker":"1INCH",
        //              "name":"1inch",
        //              "providers":[
        //              ],
        //              "withdraw":{
        //                   "max_amount":"0",
        //                  "min_amount":"21.5",
        //                  "fixed":"17.5",
        //                  "flex":null
        //              },
        //              "deposit":{
        //                  "max_amount":"0",
        //                  "min_amount":"19.5",
        //                  "fixed":null,
        //                  "flex":null
        //               }
        //          },
        //           {...}
        //      }
        //
        const currenciesIds = Object.keys (response);
        const withdrawFees = {};
        const depositFees = {};
        for (let i = 0; i < currenciesIds.length; i++) {
            const currency = currenciesIds[i];
            const data = response[currency];
            const code = this.safeCurrencyCode (currency);
            const withdraw = this.safeValue (data, 'withdraw', {});
            withdrawFees[code] = this.safeString (withdraw, 'fixed');
            const deposit = this.safeValue (data, 'deposit', {});
            depositFees[code] = this.safeString (deposit, 'fixed');
        }
        return {
            'withdraw': withdrawFees,
            'deposit': depositFees,
            'info': response,
        };
    }

    async fetchTradingFees (params = {}) {
        const response = await this.v4PublicGetAssets (params);
        //
        //      {
        //          '1INCH': {
        //              name: '1inch',
        //              unified_cryptoasset_id: '8104',
        //              can_withdraw: true,
        //              can_deposit: true,
        //              min_withdraw: '33',
        //              max_withdraw: '0',
        //              maker_fee: '0.1',
        //              taker_fee: '0.1',
        //              min_deposit: '30',
        //              max_deposit: '0'
        //            },
        //            ...
        //      }
        //
        const result = {};
        for (let i = 0; i < this.symbols.length; i++) {
            const symbol = this.symbols[i];
            const market = this.market (symbol);
            const fee = this.safeValue (response, market['baseId'], {});
            let makerFee = this.safeString (fee, 'maker_fee');
            let takerFee = this.safeString (fee, 'taker_fee');
            makerFee = Precise.stringDiv (makerFee, '100');
            takerFee = Precise.stringDiv (takerFee, '100');
            result[symbol] = {
                'info': fee,
                'symbol': market['symbol'],
                'percentage': true,
                'tierBased': false,
                'maker': this.parseNumber (makerFee),
                'taker': this.parseNumber (takerFee),
            };
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        const response = await this.v1PublicGetTicker (this.extend (request, params));
        //
        //      {
        //         "success":true,
        //         "message":"",
        //         "result": {
        //             "bid":"0.021979",
        //             "ask":"0.021996",
        //             "open":"0.02182",
        //             "high":"0.022039",
        //             "low":"0.02161",
        //             "last":"0.021987",
        //             "volume":"2810.267",
        //             "deal":"61.383565474",
        //             "change":"0.76",
        //         },
        //     }
        //
        const ticker = this.safeValue (response, 'result', {});
        return this.parseTicker (ticker, market);
    }

    parseTicker (ticker, market = undefined) {
        //  FetchTicker (v1)
        //
        //      {
        //          "bid":"0.021979",
        //          "ask":"0.021996",
        //          "open":"0.02182",
        //          "high":"0.022039",
        //          "low":"0.02161",
        //          "last":"0.021987",
        //          "volume":"2810.267",
        //          "deal":"61.383565474",
        //          "change":"0.76",
        //      }
        //
        // FetchTickers (v4)
        //
        //      "BCH_RUB":{
        //          "base_id":1831,
        //          "quote_id":0,
        //          "last_price":"32830.21",
        //          "quote_volume":"1494659.8024096",
        //          "base_volume":"46.1083",
        //          "isFrozen":false,
        //          "change":"2.12" // in percent
        //      },
        //
        market = this.safeMarket (undefined, market);
        const last = this.safeString (ticker, 'last_price');
        const change = this.safeString (ticker, 'change');
        const percentage = Precise.stringMul (change, '0.01');
        return this.safeTicker ({
            'symbol': market['symbol'],
            'timestamp': undefined,
            'datetime': undefined,
            'high': this.safeString (ticker, 'high'),
            'low': this.safeString (ticker, 'low'),
            'bid': this.safeString (ticker, 'bid'),
            'bidVolume': undefined,
            'ask': this.safeString (ticker, 'ask'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': this.safeString (ticker, 'open'),
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': percentage,
            'average': undefined,
            'baseVolume': this.safeString2 (ticker, 'base_volume', 'volume'),
            'quoteVolume': this.safeString2 (ticker, 'quote_volume', 'deal'),
            'info': ticker,
        }, market, false);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.v4PublicGetTicker (params);
        //
        //      "BCH_RUB": {
        //          "base_id":1831,
        //          "quote_id":0,
        //          "last_price":"32830.21",
        //          "quote_volume":"1494659.8024096",
        //          "base_volume":"46.1083",
        //          "isFrozen":false,
        //          "change":"2.12"
        //      },
        //
        const marketIds = Object.keys (response);
        const result = {};
        for (let i = 0; i < marketIds.length; i++) {
            const marketId = marketIds[i];
            const market = this.safeMarket (marketId);
            const ticker = this.parseTicker (response[marketId], market);
            const symbol = ticker['symbol'];
            result[symbol] = ticker;
        }
        return this.filterByArray (result, 'symbol', symbols);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        if (limit !== undefined) {
            request['depth'] = limit; // default = 50, maximum = 100
        }
        const response = await this.v4PublicGetOrderbookMarket (this.extend (request, params));
        //
        //      {
        //          "timestamp": 1594391413,
        //          "asks": [
        //              [
        //                  "9184.41",
        //                  "0.773162"
        //              ],
        //              [ ... ]
        //          ],
        //          "bids": [
        //              [
        //                  "9181.19",
        //                  "0.010873"
        //              ],
        //              [ ... ]
        //          ]
        //      }
        //
        const timestamp = this.safeString (response, 'timestamp');
        return this.parseOrderBook (response, symbol, timestamp);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        const response = await this.v4PublicGetTradesMarket (this.extend (request, params));
        //
        //      [
        //          {
        //              "tradeID": 158056419,
        //              "price": "9186.13",
        //              "quote_volume": "0.0021",
        //              "base_volume": "9186.13",
        //              "trade_timestamp": 1594391747,
        //              "type": "sell"
        //          },
        //      ],
        //
        return this.parseTrades (response, market, since, limit);
    }

    parseTrade (trade, market = undefined) {
        // fetchTradesV4
        //     {
        //       "tradeID": 158056419,
        //       "price": "9186.13",
        //       "quote_volume": "0.0021",
        //       "base_volume": "9186.13",
        //       "trade_timestamp": 1594391747,
        //       "type": "sell"
        //     },
        //
        // orderTrades (v4Private)
        //
        //     {
        //         "time": 1593342324.613711,
        //         "fee": "0.00000419198",
        //         "price": "0.00000701",
        //         "amount": "598",
        //         "id": 149156519, // trade id
        //         "dealOrderId": 3134995325, // orderId
        //         "clientOrderId": "customId11",
        //         "role": 2, // 1 = maker, 2 = taker
        //         "deal": "0.00419198" // amount in money
        //     }
        //
        const timestamp = this.safeTimestamp2 (trade, 'time', 'trade_timestamp');
        const orderId = this.safeString (trade, 'dealOrderId');
        const cost = this.safeString (trade, 'deal');
        const price = this.safeString (trade, 'price');
        const amount = this.safeString2 (trade, 'amount', 'base_volume');
        const id = this.safeString2 (trade, 'id', 'tradeID');
        const side = this.safeString (trade, 'type');
        const symbol = this.safeSymbol (undefined, market);
        const role = this.safeInteger (trade, 'role');
        let takerOrMaker = undefined;
        if (role !== undefined) {
            takerOrMaker = (role === 1) ? 'maker' : 'taker';
        }
        let fee = undefined;
        const feeCost = this.safeString (trade, 'fee');
        if (feeCost !== undefined) {
            const safeMarket = this.safeMarket (undefined, market);
            const quote = safeMarket['quote'];
            fee = {
                'cost': feeCost,
                'currency': quote,
            };
        }
        return this.safeTrade ({
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': id,
            'order': orderId,
            'type': undefined,
            'takerOrMaker': takerOrMaker,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
        }, market);
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
            'interval': this.timeframes[timeframe],
        };
        if (since !== undefined) {
            const maxLimit = 1440;
            if (limit === undefined) {
                limit = maxLimit;
            }
            limit = Math.min (limit, maxLimit);
            const start = parseInt (since / 1000);
            const duration = this.parseTimeframe (timeframe);
            const end = this.sum (start, duration * limit);
            request['start'] = start;
            request['end'] = end;
        }
        if (limit !== undefined) {
            request['limit'] = limit; // max 1440
        }
        const response = await this.v1PublicGetKline (this.extend (request, params));
        //
        //     {
        //         "success":true,
        //         "message":"",
        //         "result":[
        //             [1591488000,"0.025025","0.025025","0.025029","0.025023","6.181","0.154686629"],
        //             [1591488060,"0.025028","0.025033","0.025035","0.025026","8.067","0.201921167"],
        //             [1591488120,"0.025034","0.02505","0.02505","0.025034","20.089","0.503114696"],
        //         ]
        //     }
        //
        const result = this.safeValue (response, 'result', []);
        return this.parseOHLCVs (result, market, timeframe, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        //     [
        //         1591488000,
        //         "0.025025",
        //         "0.025025",
        //         "0.025029",
        //         "0.025023",
        //         "6.181",
        //         "0.154686629"
        //     ]
        //
        return [
            this.safeTimestamp (ohlcv, 0), // timestamp
            this.safeNumber (ohlcv, 1), // open
            this.safeNumber (ohlcv, 3), // high
            this.safeNumber (ohlcv, 4), // low
            this.safeNumber (ohlcv, 2), // close
            this.safeNumber (ohlcv, 5), // volume
        ];
    }

    async fetchStatus (params = {}) {
        const response = await this.v4PublicGetPing (params);
        //
        //      [
        //          "pong"
        //      ]
        //
        let status = this.safeString (response, 0, undefined);
        status = (status === undefined) ? 'maintenance' : 'ok';
        this.status = this.extend (this.status, {
            'status': status,
            'updated': this.milliseconds (),
        });
        return this.status;
    }

    async fetchTime (params = {}) {
        const response = await this.v4PublicGetTime (params);
        //
        //     {
        //         "time":1635467280514
        //     }
        //
        return this.safeInteger (response, 'time');
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        let method = undefined;
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
            'side': side,
            'amount': this.amountToPrecision (symbol, amount),
        };
        const stopPrice = this.safeNumber2 (params, 'stopPrice', 'activationPrice');
        if (stopPrice !== undefined) {
            // it's a stop order
            request['activation_price'] = this.priceToPrecision (symbol, stopPrice);
            if (type === 'limit' || type === 'stopLimit') {
                // it's a stop-limit-order
                method = 'v4PrivateOPostOrderStopLimit';
            } else if (type === 'market' || type === 'stopMarket') {
                // it's a stop-market-order
                method = 'v4PrivatePostOrderStopMarket';
            }
        } else {
            if (type === 'market') {
                // it's a regular market order
                method = 'v4PrivatePostOrderMarket';
            }
            if (type === 'limit') {
                // it's a regular limit order
                method = 'v4PrivatePostOrderNew';
            }
        }
        // aggregate common assignments regardless stop or not
        if (type === 'limit' || type === 'stopLimit') {
            if (price === undefined) {
                throw new ArgumentsRequired (this.id + ' createOrder requires a price argument for a stopLimit order');
            }
            const convertedPrice = this.priceToPrecision (symbol, price);
            request['price'] = convertedPrice;
        }
        if (type === 'market' || type === 'stopMarket') {
            if (side === 'buy') {
                let cost = this.safeNumber (params, 'cost');
                const createMarketBuyOrderRequiresPrice = this.safeValue (this.options, 'createMarketBuyOrderRequiresPrice', true);
                if (createMarketBuyOrderRequiresPrice) {
                    if (price !== undefined) {
                        if (cost === undefined) {
                            cost = amount * price;
                        }
                    } else if (cost === undefined) {
                        throw new InvalidOrder (this.id + " createOrder() requires the price argument for market buy orders to calculate total order cost (amount to spend), where cost = amount * price. Supply a price argument to createOrder() call if you want the cost to be calculated for you from price and amount, or, alternatively, add .options['createMarketBuyOrderRequiresPrice'] = false and supply the total cost value in the 'amount' argument or in the 'cost' extra parameter (the exchange-specific behaviour)");
                    }
                } else {
                    cost = (cost === undefined) ? amount : cost;
                }
                request['amount'] = this.costToPrecision (symbol, cost);
            }
        }
        if (method === undefined) {
            throw new ArgumentsRequired (this.id + ' Invalid type:  createOrder() requires one of the following order types: market, limit, stopLimit or stopMarket');
        }
        const response = await this[method] (this.extend (request, params));
        return this.parseOrder (response);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
            'orderId': parseInt (id),
        };
        return await this.v4PrivatePostOrderCancel (this.extend (request, params));
    }

    parseBalance (response) {
        const balanceKeys = Object.keys (response);
        const result = { };
        for (let i = 0; i < balanceKeys.length; i++) {
            const id = balanceKeys[i];
            const balance = response[id];
            const code = this.safeCurrencyCode (id);
            const account = this.account ();
            account['free'] = this.safeString (balance, 'available');
            account['used'] = this.safeString (balance, 'freeze');
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.v4PrivatePostTradeAccountBalance (params);
        //
        //     {
        //         "BTC": { "available": "0.123", "freeze": "1" },
        //         "XMR": { "available": "3013", "freeze": "100" },
        //     }
        //
        return this.parseBalance (response);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOpenOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit; // default 50 max 100
        }
        const response = await this.v4PrivatePostOrders (this.extend (request, params));
        //
        //     [
        //         {
        //             "orderId": 3686033640,
        //             "clientOrderId": "customId11",
        //             "market": "BTC_USDT",
        //             "side": "buy",
        //             "type": "limit",
        //             "timestamp": 1594605801.49815,    // current timestamp of unexecuted order
        //             "dealMoney": "0",                 // executed amount in money
        //             "dealStock": "0",                 // executed amount in stock
        //             "amount": "2.241379",             // active order amount
        //             "takerFee": "0.001",
        //             "makerFee": "0.001",
        //             "left": "2.241379",               // unexecuted amount in stock
        //             "dealFee": "0",                   // executed fee by deal
        //             "price": "40000"
        //         },
        //     ]
        //
        return this.parseOrders (response, market, since, limit, { 'status': 'open' });
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            symbol = market['symbol'];
            request['market'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 50 max 100
        }
        const response = await this.v4PrivatePostTradeAccountOrderHistory (this.extend (request, params));
        //
        //     {
        //         "BTC_USDT": [
        //             {
        //                 "id": 160305483,
        //                 "clientOrderId": "customId11",
        //                 "time": 1594667731.724403,
        //                 "side": "sell",
        //                 "role": 2, // 1 = maker, 2 = taker
        //                 "amount": "0.000076",
        //                 "price": "9264.21",
        //                 "deal": "0.70407996",
        //                 "fee": "0.00070407996"
        //             },
        //         ],
        //     }
        //
        const marketIds = Object.keys (response);
        let results = [];
        for (let i = 0; i < marketIds.length; i++) {
            const marketId = marketIds[i];
            const market = this.safeMarket (marketId, undefined, '_');
            const orders = response[marketId];
            for (let j = 0; j < orders.length; j++) {
                const order = this.parseOrder (orders[j], market);
                results.push (this.extend (order, { 'status': 'filled' }));
            }
        }
        results = this.sortBy (results, 'timestamp');
        results = this.filterBySymbolSinceLimit (results, symbol, since, limit, since === undefined);
        return results;
    }

    parseOrder (order, market = undefined) {
        //
        // createOrder, fetchOpenOrders
        //
        //     {
        //         "orderId": 4180284841,
        //         "clientOrderId": "order1987111",
        //         "market": "BTC_USDT",
        //         "side": "buy",
        //         "type": "stop limit",
        //         "timestamp": 1595792396.165973,
        //         "dealMoney": "0",                  // if order finished - amount in money currency that finished
        //         "dealStock": "0",                  // if order finished - amount in stock currency that finished
        //         "amount": "0.001",
        //         "takerFee": "0.001",
        //         "makerFee": "0.001",
        //         "left": "0.001",                   // remaining amount
        //         "dealFee": "0",                    // fee in money that you pay if order is finished
        //         "price": "40000",
        //         "activation_price": "40000"        // activation price -> only for stopLimit, stopMarket
        //     }
        //
        // fetchClosedOrders
        //
        //     {
        //         "market": "BTC_USDT"
        //         "amount": "0.0009",
        //         "price": "40000",
        //         "type": "limit",
        //         "id": 4986126152,
        //         "clientOrderId": "customId11",
        //         "side": "sell",
        //         "ctime": 1597486960.311311,       // timestamp of order creation
        //         "takerFee": "0.001",
        //         "ftime": 1597486960.311332,       // executed order timestamp
        //         "makerFee": "0.001",
        //         "dealFee": "0.041258268",         // paid fee if order is finished
        //         "dealStock": "0.0009",            // amount in stock currency that finished
        //         "dealMoney": "41.258268"          // amount in money currency that finished
        //     }
        //
        const marketId = this.safeString (order, 'market');
        market = this.safeMarket (marketId, market, '_');
        const symbol = market['symbol'];
        const side = this.safeString (order, 'side');
        const filled = this.safeString (order, 'dealStock');
        const remaining = this.safeString (order, 'left');
        let clientOrderId = this.safeString (order, 'clientOrderId');
        if (clientOrderId === '') {
            clientOrderId = undefined;
        }
        let price = this.safeString (order, 'price');
        const stopPrice = this.safeString (order, 'activation_price');
        const orderId = this.safeString2 (order, 'orderId', 'id');
        const type = this.safeString (order, 'type');
        let amount = this.safeString (order, 'amount');
        let cost = undefined;
        if (price === '0') {
            // api error to be solved
            price = undefined;
        }
        if (side === 'buy' && type.indexOf ('market') >= 0) {
            // in these cases the amount is in the quote currency meaning it's the cost
            cost = amount;
            amount = undefined;
            if (price !== undefined) {
                // if the price is available we can do this conversion
                // from amount in quote currency to base currency
                amount = Precise.stringDiv (cost, price);
            }
        }
        const dealFee = this.safeString (order, 'dealFee');
        let fee = undefined;
        if (dealFee !== undefined) {
            fee = {
                'cost': this.parseNumber (dealFee),
                'currency': market['quote'],
            };
        }
        const timestamp = this.safeTimestamp2 (order, 'ctime', 'timestamp');
        const lastTradeTimestamp = this.safeTimestamp (order, 'ftime');
        return this.safeOrder ({
            'info': order,
            'id': orderId,
            'symbol': symbol,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'timeInForce': undefined,
            'postOnly': undefined,
            'status': undefined,
            'side': side,
            'price': price,
            'type': type,
            'stopPrice': stopPrice,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'average': undefined,
            'cost': cost,
            'fee': fee,
            'trades': undefined,
        }, market);
    }

    async fetchOrderTrades (id, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'orderId': parseInt (id),
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['market'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 50, max 100
        }
        const response = await this.v4PrivatePostTradeAccountOrder (this.extend (request, params));
        //
        //     {
        //         "records": [
        //             {
        //                 "time": 1593342324.613711,
        //                 "fee": "0.00000419198",
        //                 "price": "0.00000701",
        //                 "amount": "598",
        //                 "id": 149156519, // trade id
        //                 "dealOrderId": 3134995325, // orderId
        //                 "clientOrderId": "customId11", // empty string if not specified
        //                 "role": 2, // 1 = maker, 2 = taker
        //                 "deal": "0.00419198"
        //             }
        //         ],
        //         "offset": 0,
        //         "limit": 100
        //     }
        //
        const data = this.safeValue (response, 'records', []);
        return this.parseTrades (data, market);
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'ticker': currency['id'],
        };
        let method = 'v4PrivatePostMainAccountAddress';
        if (this.isFiat (code)) {
            method = 'v4PrivatePostMainAccountFiatDepositUrl';
            const provider = this.safeNumber (params, 'provider');
            if (provider === undefined) {
                throw new ArgumentsRequired (this.id + ' fetchDepositAddress() requires a provider when the ticker is fiat');
            }
            request['provider'] = provider;
            const amount = this.safeNumber (params, 'amount');
            if (amount === undefined) {
                throw new ArgumentsRequired (this.id + ' fetchDepositAddress() requires an amount when the ticker is fiat');
            }
            request['amount'] = amount;
            const uniqueId = this.safeValue (params, 'uniqueId');
            if (uniqueId === undefined) {
                throw new ArgumentsRequired (this.id + ' fetchDepositAddress() requires an uniqueId when the ticker is fiat');
            }
        }
        const response = await this[method] (this.extend (request, params));
        //
        // fiat
        //
        //     {
        //         "url": "https://someaddress.com"
        //     }
        //
        // crypto
        //
        //     {
        //         "account": {
        //             "address": "GDTSOI56XNVAKJNJBLJGRNZIVOCIZJRBIDKTWSCYEYNFAZEMBLN75RMN",
        //             "memo": "48565488244493"
        //         },
        //         "required": {
        //             "fixedFee": "0",
        //             "flexFee": {
        //                 "maxFee": "0",
        //                 "minFee": "0",
        //                 "percent": "0"
        //             },
        //             "maxAmount": "0",
        //             "minAmount": "1"
        //         }
        //     }
        //
        const url = this.safeString (response, 'url');
        const account = this.safeValue (response, 'account', {});
        const address = this.safeString (account, 'address', url);
        const tag = this.safeString (account, 'memo');
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'network': undefined,
            'info': response,
        };
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code); // check if it has canDeposit
        const request = {
            'ticker': currency['id'],
            'amount': this.currencyToPrecision (code, amount),
            'address': address,
        };
        let uniqueId = this.safeValue (params, 'uniqueId');
        if (uniqueId === undefined) {
            uniqueId = this.uuid22 ();
        }
        request['uniqueId'] = uniqueId;
        if (tag !== undefined) {
            request['memo'] = tag;
        }
        if (this.isFiat (code)) {
            const provider = this.safeValue (params, 'provider');
            if (provider === undefined) {
                throw new ArgumentsRequired (this.id + ' fetchDepositAddress() requires a provider when the ticker is fiat');
            }
            request['provider'] = provider;
        }
        const response = await this.v4PrivatePostMainAccountWithdraw (this.extend (request, params));
        //
        // empty array with a success status
        // go to deposit/withdraw history and check you request status by uniqueId
        //
        //     []
        //
        return {
            'id': uniqueId,
            'info': response,
        };
    }

    isFiat (currency) {
        const fiatCurrencies = this.safeValue (this.options, 'fiatCurrencies', []);
        return this.inArray (currency, fiatCurrencies);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const query = this.omit (params, this.extractParams (path));
        const version = this.safeValue (api, 0);
        const accessibility = this.safeValue (api, 1);
        const pathWithParams = '/' + this.implodeParams (path, params);
        let url = this.urls['api'][version][accessibility] + pathWithParams;
        if (accessibility === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        }
        if (accessibility === 'private') {
            this.checkRequiredCredentials ();
            const nonce = this.nonce ().toString ();
            const secret = this.stringToBinary (this.encode (this.secret));
            const request = '/' + 'api' + '/' + version + pathWithParams;
            body = this.json (this.extend ({ 'request': request, 'nonce': nonce }, params));
            const payload = this.stringToBase64 (body);
            const signature = this.hmac (payload, secret, 'sha512');
            headers = {
                'Content-Type': 'application/json',
                'X-TXC-APIKEY': this.apiKey,
                'X-TXC-PAYLOAD': payload,
                'X-TXC-SIGNATURE': signature,
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if ((code === 418) || (code === 429)) {
            throw new DDoSProtection (this.id + ' ' + code.toString () + ' ' + reason + ' ' + body);
        }
        if (code === 404) {
            throw new ExchangeError (this.id + ' ' + code.toString () + ' endpoint not found');
        }
        if (response !== undefined) {
            // For cases where we have a meaningful status
            // {"response":null,"status":422,"errors":{"orderId":["Finished order id 435453454535 not found on your account"]},"notification":null,"warning":"Finished order id 435453454535 not found on your account","_token":null}
            const status = this.safeInteger (response, 'status');
            // {"code":10,"message":"Unauthorized request."}
            const message = this.safeString (response, 'message');
            // For these cases where we have a generic code variable error key
            // {"code":0,"message":"Validation failed","errors":{"amount":["Amount must be greater than 0"]}}
            const code = this.safeInteger (response, 'code');
            const hasErrorStatus = status !== undefined && status !== '200';
            if (hasErrorStatus || code !== undefined) {
                const feedback = this.id + ' ' + body;
                let errorInfo = message;
                if (hasErrorStatus) {
                    errorInfo = status;
                } else {
                    const errorObject = this.safeValue (response, 'errors');
                    if (errorObject !== undefined) {
                        const errorKey = Object.keys (errorObject)[0];
                        const errorMessageArray = this.safeValue (errorObject, errorKey, []);
                        const errorMessageLength = errorMessageArray.length;
                        errorInfo = (errorMessageLength > 0) ? errorMessageArray[0] : body;
                    }
                }
                this.throwExactlyMatchedException (this.exceptions['exact'], errorInfo, feedback);
                this.throwBroadlyMatchedException (this.exceptions['broad'], body, feedback);
                throw new ExchangeError (feedback);
            }
        }
    }
};
