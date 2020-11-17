'use strict';

// ----------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ArgumentsRequired, InvalidOrder, ExchangeError, BadRequest, BadSymbol } = require ('./base/errors');
const { TRUNCATE, SIGNIFICANT_DIGITS } = require ('./base/functions/number');

// ----------------------------------------------------------------------------

module.exports = class eterbase extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'eterbase',
            'name': 'Eterbase',
            'countries': [ 'SK' ], // Slovakia
            'rateLimit': 500,
            'version': 'v1',
            'certified': true,
            'has': {
                'CORS': false,
                'publicAPI': true,
                'privateAPI': true,
                'cancelOrder': true,
                'createOrder': true,
                'deposit': false,
                'fetchBalance': true,
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchDepositAddress': false,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': false,
                'fetchOrderTrades': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'withdraw': true,
            },
            'timeframes': {
                '1m': '1',
                '5m': '5',
                '15m': '15',
                '1h': '60',
                '4h': '240',
                '1d': '1440',
                '1w': '10080',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/82067900-faeb0f80-96d9-11ea-9f22-0071cfcb9871.jpg',
                'api': 'https://api.eterbase.exchange',
                'www': 'https://www.eterbase.com',
                'doc': 'https://developers.eterbase.exchange',
                'fees': 'https://www.eterbase.com/exchange/fees',
                'referral': 'https://eterbase.exchange/invite/1wjjh4Pe',
            },
            'api': {
                'markets': {
                    'get': [
                        '{id}/order-book',
                    ],
                },
                'public': {
                    'get': [
                        'ping',
                        'assets',
                        'markets',
                        'tickers',
                        'tickers/{id}/ticker',
                        'markets/{id}/trades',
                        'markets/{id}/ohlcv',
                        'wstoken',
                    ],
                },
                'private': {
                    'get': [
                        'accounts/{id}/balances',
                        'accounts/{id}/orders',
                        'accounts/{id}/fills',
                        'orders/{id}/fills',
                        'orders/{id}',
                    ],
                    'post': [
                        'orders',
                        'accounts/{id}/withdrawals',
                    ],
                    'delete': [
                        'orders/{id}',
                    ],
                },
                'feed': {
                    'get': [
                        'feed',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'taker': 0.35 / 100,
                    'maker': 0.35 / 100,
                },
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
                'uid': true,
            },
            'precisionMode': SIGNIFICANT_DIGITS,
            'options': {
                'createMarketBuyOrderRequiresPrice': true,
            },
            'exceptions': {
                'exact': {
                    'Invalid cost': InvalidOrder, // {"message":"Invalid cost","_links":{"self":{"href":"/orders","templated":false}}}
                    'Invalid order ID': InvalidOrder, // {"message":"Invalid order ID","_links":{"self":{"href":"/orders/4a151805-d594-4a96-9d64-e3984f2441f7","templated":false}}}
                    'Invalid market !': BadSymbol, // {"message":"Invalid market !","_links":{"self":{"href":"/markets/300/order-book","templated":false}}}
                },
                'broad': {
                    'Failed to convert argument': BadRequest,
                },
            },
        });
    }

    async fetchTime (params = {}) {
        const response = await this.publicGetPing (params);
        //
        //     { "pong": 1556354416582 }
        //
        return this.safeInteger (response, 'pong');
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetMarkets (params);
        //
        //     [
        //         {
        //             "id":33,
        //             "symbol":"ETHUSDT",
        //             "base":"ETH",
        //             "quote":"USDT",
        //             "priceSigDigs":5,
        //             "qtySigDigs":8,
        //             "costSigDigs":8,
        //             "verificationLevelUser":1,
        //             "verificationLevelCorporate":11,
        //             "group":"USD",
        //             "tradingRules":[
        //                 {"attribute":"Qty","condition":"Min","value":0.006},
        //                 {"attribute":"Qty","condition":"Max","value":1000},
        //                 {"attribute":"Cost","condition":"Min","value":1},
        //                 {"attribute":"Cost","condition":"Max","value":210000}
        //             ],
        //             "allowedOrderTypes":[1,2,3,4],
        //             "state":"Trading"
        //         }
        //     ]
        //
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const market = this.parseMarket (response[i]);
            result.push (market);
        }
        return result;
    }

    parseMarket (market) {
        //
        //     {
        //         "id":33,
        //         "symbol":"ETHUSDT",
        //         "base":"ETH",
        //         "quote":"USDT",
        //         "priceSigDigs":5,
        //         "qtySigDigs":8,
        //         "costSigDigs":8,
        //         "verificationLevelUser":1,
        //         "verificationLevelCorporate":11,
        //         "group":"USD",
        //         "tradingRules":[
        //             {"attribute":"Qty","condition":"Min","value":0.006},
        //             {"attribute":"Qty","condition":"Max","value":1000},
        //             {"attribute":"Cost","condition":"Min","value":1},
        //             {"attribute":"Cost","condition":"Max","value":210000}
        //         ],
        //         "allowedOrderTypes":[1,2,3,4],
        //         "state":"Trading"
        //     }
        //
        const id = this.safeString (market, 'id');
        // const numericId = this.safeString (market, 'id');
        const baseId = this.safeString (market, 'base');
        const quoteId = this.safeString (market, 'quote');
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        const symbol = base + '/' + quote;
        const state = this.safeString (market, 'state');
        const active = (state === 'Trading');
        const precision = {
            'price': this.safeInteger (market, 'priceSigDigs'),
            'amount': this.safeInteger (market, 'qtySigDigs'),
            'cost': this.safeInteger (market, 'costSigDigs'),
        };
        const rules = this.safeValue (market, 'tradingRules', []);
        let minAmount = undefined;
        let maxAmount = undefined;
        let minCost = undefined;
        let maxCost = undefined;
        for (let i = 0; i < rules.length; i++) {
            const rule = rules[i];
            const attribute = this.safeString (rule, 'attribute');
            const condition = this.safeString (rule, 'condition');
            const value = this.safeFloat (rule, 'value');
            if ((attribute === 'Qty') && (condition === 'Min')) {
                minAmount = value;
            } else if ((attribute === 'Qty') && (condition === 'Max')) {
                maxAmount = value;
            } else if ((attribute === 'Cost') && (condition === 'Min')) {
                minCost = value;
            } else if ((attribute === 'Cost') && (condition === 'Max')) {
                maxCost = value;
            }
        }
        return {
            'id': id,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'baseId': baseId,
            'quoteId': quoteId,
            'info': market,
            'active': active,
            'precision': precision,
            'limits': {
                'amount': {
                    'min': minAmount,
                    'max': maxAmount,
                },
                'price': {
                    'min': undefined,
                    'max': undefined,
                },
                'cost': {
                    'min': minCost,
                    'max': maxCost,
                },
            },
        };
    }

    async fetchCurrencies (params = {}) {
        const response = await this.publicGetAssets (params);
        //
        //     [
        //         {
        //             "id":"LINK",
        //             "name":"ChainLink Token",
        //             "precisionDisplay":8,
        //             "precisionMax":18,
        //             "precisionBasis":1000000000000000000,
        //             "precisionStep":1,
        //             "verificationLevelMin":"null",
        //             "cmcId":"LINK",
        //             "txnUrl":"https://etherscan.io/tx/{txnId}",
        //             "state":"Active",
        //             "type":"Crypto",
        //             "isReference":false,
        //             "withdrawalMin":"0",
        //             "withdrawalMax":"50587",
        //             "withdrawalFee":"0.55",
        //             "depositEnabled":true,
        //             "withdrawalEnabled":true,
        //             "description":"",
        //             "coingeckoUrl":"https://www.coingecko.com/en/coins/chainlink",
        //             "coinmarketcapUrl":"https://coinmarketcap.com/currencies/chainlink",
        //             "eterbaseUrl":"https://www.eterbase.com/system-status/LINK",
        //             "explorerUrl":"https://etherscan.io/token/0x514910771af9ca656af840dff83e8264ecf986ca",
        //             "withdrawalMemoAllowed":false,
        //             "countries":[],
        //             "networks":[]
        //         }
        //     ]
        //
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const currency = response[i];
            const id = this.safeString (currency, 'id');
            const precision = this.safeInteger (currency, 'precisionDisplay');
            const code = this.safeCurrencyCode (id);
            const depositEnabled = this.safeValue (currency, 'depositEnabled');
            const withdrawalEnabled = this.safeValue (currency, 'withdrawalEnabled');
            const state = this.safeString (currency, 'state');
            const active = depositEnabled && withdrawalEnabled && (state === 'Active');
            const type = this.safeStringLower (currency, 'type');
            const name = this.safeString (currency, 'name');
            result[code] = {
                'id': id,
                'info': currency,
                'code': code,
                'type': type,
                'name': name,
                'active': active,
                'fee': this.safeFloat (currency, 'withdrawalFee'),
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': Math.pow (10, -precision),
                        'max': Math.pow (10, precision),
                    },
                    'price': {
                        'min': Math.pow (10, -precision),
                        'max': Math.pow (10, precision),
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': this.safeFloat (currency, 'withdrawalMin'),
                        'max': this.safeFloat (currency, 'withdrawalMax'),
                    },
                },
            };
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        //
        // fetchTicker
        //
        //     {
        //         "time":1588778516608,
        //         "marketId":250,
        //         "symbol": "ETHUSDT",
        //         "price":0.0,
        //         "change":0.0,
        //         "volumeBase":0.0,
        //         "volume":0.0,
        //         "low":0.0,
        //         "high":0.0,
        //     }
        //
        const marketId = this.safeString (ticker, 'marketId');
        const symbol = this.safeSymbol (marketId, market);
        const timestamp = this.safeInteger (ticker, 'time');
        const last = this.safeFloat (ticker, 'price');
        const baseVolume = this.safeFloat (ticker, 'volumeBase');
        const quoteVolume = this.safeFloat (ticker, 'volume');
        const vwap = this.vwap (baseVolume, quoteVolume);
        const percentage = this.safeFloat (ticker, 'change');
        const result = {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': vwap,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined, // previous day close
            'change': undefined,
            'percentage': percentage,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        };
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'id': market['id'],
        };
        const response = await this.publicGetTickersIdTicker (this.extend (request, params));
        //
        //     {
        //         "time":1588778516608,
        //         "marketId":250,
        //         "price":0.0,
        //         "change":0.0,
        //         "volumeBase":0.0,
        //         "volume":0.0,
        //         "low":0.0,
        //         "high":0.0,
        //     }
        //
        return this.parseTicker (response, market);
    }

    parseTickers (tickers, symbols = undefined) {
        const result = [];
        for (let i = 0; i < tickers.length; i++) {
            result.push (this.parseTicker (tickers[i]));
        }
        return this.filterByArray (result, 'symbol', symbols);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            // 'quote': 'USDT', // identifier of a quote asset to filter the markets
        };
        const response = await this.publicGetTickers (this.extend (request, params));
        //
        //     [
        //         {
        //             "time":1588831771698,
        //             "marketId":33,
        //             "price":204.54,
        //             "change":-1.03,
        //             "volumeBase":544.9801776699998,
        //             "volume":111550.433735,
        //             "low":200.33,
        //             "high":209.51
        //         },
        //     ]
        //
        return this.parseTickers (response, symbols);
    }

    parseTrade (trade, market) {
        //
        // fetchTrades (public)
        //
        //     {
        //         "id":251199246,
        //         "side":2,
        //         "price":0.022044,
        //         "executedAt":1588830682664,
        //         "qty":0.13545846,
        //         "makerId":"67ed6ef3-33d8-4389-ba70-5c68d9db9f6c",
        //         "takerId":"229ef0d6-fe67-4b5d-9733-824142fab8f3"
        //     }
        //
        // fetchMyTrades, fetchOrderTrades (private)
        //
        //     {
        //         "id": 123,
        //         "marketId": 123,
        //         "side": 1,
        //         "qty": "1.23456",
        //         "price": "1.23456",
        //         "cost": "1.23456",
        //         "fee": "1.23456",
        //         "feeAsset": "XBASE",
        //         "liquidity": 1,
        //         "orderId": "30a2b5d0-be2e-4d0a-93ed-a7c45fed1792",
        //         "tradeId": 123,
        //         "filledAt": 1556355722341
        //     }
        //
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'qty');
        let fee = undefined;
        const feeCost = this.safeFloat (trade, 'fee');
        if (feeCost !== undefined) {
            const feeCurrencyId = this.safeString (trade, 'feeAsset');
            const feeCurrencyCode = this.safeCurrencyCode (feeCurrencyId);
            fee = {
                'cost': feeCost,
                'currency': feeCurrencyCode,
            };
        }
        let cost = this.safeFloat (trade, 'qty');
        if ((cost === undefined) && (price !== undefined) && (amount !== undefined)) {
            cost = price * amount;
        }
        const timestamp = this.safeInteger2 (trade, 'executedAt', 'filledAt');
        const tradeSide = this.safeString (trade, 'side');
        const side = (tradeSide === '1') ? 'buy' : 'sell';
        const liquidity = this.safeString (trade, 'liquidity');
        let takerOrMaker = undefined;
        if (liquidity !== undefined) {
            takerOrMaker = (liquidity === '1') ? 'maker' : 'taker';
        }
        const orderId = this.safeString (trade, 'orderId');
        const id = this.safeString (trade, 'id');
        const marketId = this.safeString (trade, 'marketId');
        const symbol = this.safeSymbol (marketId, market);
        return {
            'info': trade,
            'id': id,
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'order': orderId,
            'type': undefined,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'id': market['id'],
            // 'offset': 0 // the number of records to skip
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetMarketsIdTrades (this.extend (request, params));
        //
        //     [
        //         {
        //             "id":251199246,
        //             "side":2,
        //             "price":0.022044,
        //             "executedAt":1588830682664,
        //             "qty":0.13545846,
        //             "makerId":"67ed6ef3-33d8-4389-ba70-5c68d9db9f6c",
        //             "takerId":"229ef0d6-fe67-4b5d-9733-824142fab8f3"
        //         }
        //     ]
        //
        return this.parseTrades (response, market, since, limit);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'id': this.marketId (symbol),
        };
        const response = await this.marketsGetIdOrderBook (this.extend (request, params));
        //
        //     {
        //         "type":"ob_snapshot",
        //         "marketId":3,
        //         "timestamp":1588836429847,
        //         "bids":[
        //             [0.021694,8.8793688,1], // price, amount, count
        //             [0.01937,7.1340473,1],
        //             [0.020774,3.314881,1],
        //         ],
        //         "asks":[
        //             [0.02305,8.8793688,1],
        //             [0.028022,3.314881,1],
        //             [0.022598,3.314881,1],
        //         ]
        //     }
        //
        const timestamp = this.safeInteger (response, 'timestamp');
        return this.parseOrderBook (response, timestamp);
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        //     {
        //         "time":1588807500000,
        //         "open":0.022077,
        //         "high":0.022077,
        //         "low":0.022051,
        //         "close":0.022051,
        //         "volume":10.532025119999997
        //     }
        //
        return [
            this.safeInteger (ohlcv, 'time'),
            this.safeFloat (ohlcv, 'open'),
            this.safeFloat (ohlcv, 'high'),
            this.safeFloat (ohlcv, 'low'),
            this.safeFloat (ohlcv, 'close'),
            this.safeFloat (ohlcv, 'volume'),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        const request = {
            // 'id': market['id'],
            'interval': this.timeframes[timeframe],
            // 'start': 1588830682664, // milliseconds
            // 'end': 1588830682664, // milliseconds
        };
        const duration = this.parseTimeframe (timeframe);
        const now = this.milliseconds ();
        if (since !== undefined) {
            request['start'] = since;
            if (limit === undefined) {
                request['end'] = now;
            } else {
                request['end'] = this.sum (since, duration * limit * 1000);
            }
        } else if (limit !== undefined) {
            request['start'] = now - duration * limit * 1000;
            request['end'] = now;
        } else {
            throw new ArgumentsRequired (this.id + ' fetchOHLCV requires a since argument, or a limit argument, or both');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        request['id'] = market['id'];
        const response = await this.publicGetMarketsIdOhlcv (this.extend (request, params));
        //
        //     [
        //         {"time":1588807500000,"open":0.022077,"high":0.022077,"low":0.022051,"close":0.022051,"volume":10.532025119999997},
        //         {"time":1588807800000,"open":0.022051,"high":0.022051,"low":0.022044,"close":0.022044,"volume":0.655987},
        //         {"time":1588808400000,"open":0.022044,"high":0.022044,"low":0.022044,"close":0.022044,"volume":3.9615545499999993},
        //     ]
        //
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const request = {
            'id': this.uid,
        };
        const response = await this.privateGetAccountsIdBalances (this.extend (request, params));
        //
        //     [
        //         {
        //             "assetId":"USDT",
        //             "available":"25",
        //             "balance":"25",
        //             "reserved":"0",
        //             "balanceBtc":"0.0",
        //             "balanceRef":"0.0",
        //         }
        //     ]
        //
        const result = { 'info': response };
        for (let i = 0; i < response.length; i++) {
            const balance = response[i];
            const currencyId = this.safeString (balance, 'assetId');
            const code = this.safeCurrencyCode (currencyId);
            const account = {
                'free': this.safeFloat (balance, 'available'),
                'used': this.safeFloat (balance, 'reserved'),
                'total': this.safeFloat (balance, 'balance'),
            };
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'id': id,
        };
        const response = await this.privateGetOrdersId (this.extend (request, params));
        //
        //     {
        //         "id": "30a2b5d0-be2e-4d0a-93ed-a7c45fed1792",
        //         "accountId": "30a2b5d0-be2e-4d0a-93ed-a7c45fed1792",
        //         "marketId": 123,
        //         "type": 1,
        //         "side": 1,
        //         "qty": "1.23456",
        //         "cost": "1.23456",
        //         "remainingQty": "1.23456",
        //         "remainingCost": "1.23456",
        //         "limitPrice": "1.23456",
        //         "stopPrice": "1.23456",
        //         "postOnly": false,
        //         "timeInForce": "GTC",
        //         "state": 1,
        //         "closeReason": "FILLED",
        //         "placedAt": 1556355722341,
        //         "closedAt": 1556355722341
        //     }
        //
        return this.parseOrder (response);
    }

    parseOrderStatus (status) {
        const statuses = {
            '1': undefined, // pending
            '2': 'open', // open
            '3': 'open', // partially filled
            '4': 'closed', // closed
            'FILLED': 'closed',
            'USER_REQUESTED_CANCEL': 'canceled',
            'ADMINISTRATIVE_CANCEL': 'canceled',
            'NOT_ENOUGH_LIQUIDITY': 'canceled',
            'EXPIRED': 'expired',
            'ONE_CANCELS_OTHER': 'canceled',
        };
        return this.safeString (statuses, status);
    }

    parseOrder (order, market = undefined) {
        //
        // fetchOrder, fetchOpenOrders, fetchClosedOrders
        //
        //     {
        //         "id": "30a2b5d0-be2e-4d0a-93ed-a7c45fed1792",
        //         "accountId": "30a2b5d0-be2e-4d0a-93ed-a7c45fed1792",
        //         "marketId": 123,
        //         "type": 1,
        //         "side": 1,
        //         "qty": "1.23456",
        //         "cost": "1.23456",
        //         "remainingQty": "1.23456",
        //         "remainingCost": "1.23456",
        //         "limitPrice": "1.23456",
        //         "stopPrice": "1.23456",
        //         "postOnly": false,
        //         "timeInForce": "GTC",
        //         "state": 1,
        //         "closeReason": "FILLED",
        //         "placedAt": 1556355722341,
        //         "closedAt": 1556355722341
        //     }
        //
        // createOrder
        //
        //     market buy
        //
        //     {
        //         "id":"ff81127c-8fd5-4846-b683-110639dcd322",
        //         "accountId":"6d445378-d8a3-4932-91cd-545d0a4ad2a2",
        //         "marketId":33,
        //         "type":1,
        //         "side":1,
        //         "cost":"25",
        //         "postOnly":false,
        //         "timeInForce":"GTC",
        //         "state":1,
        //         "placedAt":1589510846735
        //     }
        //
        //     market sell, limit buy, limit sell
        //
        //     {
        //         "id":"042a38b0-e369-4ad2-ae73-a18ff6b1dcf1",
        //         "accountId":"6d445378-d8a3-4932-91cd-545d0a4ad2a2",
        //         "marketId":33,
        //         "type":2,
        //         "side":1,
        //         "qty":"1000",
        //         "limitPrice":"100",
        //         "postOnly":false,
        //         "timeInForce":"GTC",
        //         "state":1,
        //         "placedAt":1589403938682,
        //     }
        //
        const id = this.safeString (order, 'id');
        const timestamp = this.safeInteger (order, 'placedAt');
        const marketId = this.safeInteger (order, 'marketId');
        const symbol = this.safeSymbol (marketId, market);
        let status = this.parseOrderStatus (this.safeString (order, 'state'));
        if (status === 'closed') {
            status = this.parseOrderStatus (this.safeString (order, 'closeReason'));
        }
        const orderSide = this.safeString (order, 'side');
        const side = (orderSide === '1') ? 'buy' : 'sell';
        const orderType = this.safeString (order, 'type');
        let type = undefined;
        if (orderType === '1') {
            type = 'market';
        } else if (orderType === '2') {
            type = 'limit';
        } else if (orderType === '3') {
            type = 'stopmarket';
        } else {
            type = 'stoplimit';
        }
        let price = this.safeFloat (order, 'limitPrice');
        const amount = this.safeFloat (order, 'qty');
        let remaining = this.safeFloat (order, 'remainingQty');
        let filled = undefined;
        const remainingCost = this.safeFloat (order, 'remainingCost');
        if ((remainingCost !== undefined) && (remainingCost === 0.0)) {
            remaining = 0;
        }
        if ((amount !== undefined) && (remaining !== undefined)) {
            filled = Math.max (0, amount - remaining);
        }
        const cost = this.safeFloat (order, 'cost');
        if (type === 'market') {
            if (price === 0.0) {
                if ((cost !== undefined) && (filled !== undefined)) {
                    if ((cost > 0) && (filled > 0)) {
                        price = cost / filled;
                    }
                }
            }
        }
        let average = undefined;
        if (cost !== undefined) {
            if (filled) {
                average = cost / filled;
            }
        }
        return {
            'info': order,
            'id': id,
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'average': average,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': undefined,
            'trades': undefined,
        };
    }

    async fetchOrdersByState (state, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const now = this.milliseconds ();
        const ninetyDays = 90 * 24 * 60 * 60 * 1000; // 90 days timerange max
        const request = {
            'id': this.uid,
            'state': state,
            // 'side': Integer, // 1 = buy, 2 = sell
            // 'offset': 0, // the number of records to skip
        };
        if (since === undefined) {
            request['from'] = now - ninetyDays;
            request['to'] = now;
        } else {
            request['from'] = since;
            request['to'] = this.sum (since, ninetyDays);
        }
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['marketId'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 50
        }
        const response = await this.privateGetAccountsIdOrders (this.extend (request, params));
        //
        //     [
        //         {
        //             "id": "30a2b5d0-be2e-4d0a-93ed-a7c45fed1792",
        //             "accountId": "30a2b5d0-be2e-4d0a-93ed-a7c45fed1792",
        //             "marketId": 123,
        //             "type": 1,
        //             "side": 1,
        //             "qty": "1.23456",
        //             "cost": "1.23456",
        //             "remainingQty": "1.23456",
        //             "remainingCost": "1.23456",
        //             "limitPrice": "1.23456",
        //             "stopPrice": "1.23456",
        //             "postOnly": false,
        //             "timeInForce": "GTC",
        //             "state": 1,
        //             "closeReason": "FILLED",
        //             "placedAt": 1556355722341,
        //             "closedAt": 1556355722341
        //         }
        //     ]
        //
        return this.parseOrders (response, market, since, limit);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchOrdersByState ('INACTIVE', symbol, since, limit, params);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchOrdersByState ('ACTIVE', symbol, since, limit, params);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const now = this.milliseconds ();
        const ninetyDays = 90 * 24 * 60 * 60 * 1000; // 90 days timerange max
        const request = {
            'id': this.uid,
            // 'side': Integer, // 1 = buy, 2 = sell
            // 'offset': 0, // the number of records to skip
        };
        if (since === undefined) {
            request['from'] = now - ninetyDays;
            request['to'] = now;
        } else {
            request['from'] = since;
            request['to'] = this.sum (since, ninetyDays);
        }
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['marketId'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 50, max 200
        }
        const response = await this.privateGetAccountsIdFills (this.extend (request, params));
        //
        //     [
        //         {
        //             "id": 123,
        //             "marketId": 123,
        //             "side": 1,
        //             "qty": "1.23456",
        //             "price": "1.23456",
        //             "cost": "1.23456",
        //             "fee": "1.23456",
        //             "feeAsset": "XBASE",
        //             "liquidity": 1,
        //             "orderId": "30a2b5d0-be2e-4d0a-93ed-a7c45fed1792",
        //             "tradeId": 123,
        //             "filledAt": 1556355722341
        //         }
        //     ]
        //
        return this.parseTrades (response, market, since, limit);
    }

    async fetchOrderTrades (id, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'id': id,
        };
        const trades = await this.privateGetOrdersIdFills (this.extend (request, params));
        return this.parseTrades (trades);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const uppercaseType = type.toUpperCase ();
        if (uppercaseType === 'MARKET') {
            type = 1;
        } else if (uppercaseType === 'LIMIT') {
            type = 2;
        } else if (uppercaseType === 'STOPMARKET') {
            type = 3;
        } else if (uppercaseType === 'STOPLIMIT') {
            type = 4;
        }
        const uppercaseSide = side.toUpperCase ();
        side = uppercaseSide === 'BUY' ? 1 : 2;
        const request = {
            'accountId': this.uid,
            'marketId': market['id'],
            'type': type,
            'side': side,
            // 'postOnly': false,
            // 'timeInForce': 'GTC',
        };
        const clientOrderId = this.safeValue2 (params, 'refId', 'clientOrderId');
        let query = params;
        if (clientOrderId !== undefined) {
            request['refId'] = clientOrderId;
            query = this.omit (params, [ 'refId', 'clientOrderId' ]);
        }
        if ((uppercaseType === 'MARKET') && (uppercaseSide === 'BUY')) {
            // for market buy it requires the amount of quote currency to spend
            let cost = this.safeFloat (params, 'cost');
            if (this.options['createMarketBuyOrderRequiresPrice']) {
                if (cost === undefined) {
                    if (price !== undefined) {
                        cost = amount * price;
                    } else {
                        throw new InvalidOrder (this.id + " createOrder() requires the price argument with market buy orders to calculate total order cost (amount to spend), where cost = amount * price. Supply a price argument to createOrder() call if you want the cost to be calculated for you from price and amount, or, alternatively, add .options['createMarketBuyOrderRequiresPrice'] = false to supply the cost in the amount argument (the exchange-specific behaviour)");
                    }
                }
            } else {
                cost = (cost === undefined) ? amount : cost;
            }
            const precision = market['precision']['price'];
            request['cost'] = this.decimalToPrecision (cost, TRUNCATE, precision, this.precisionMode);
        } else {
            request['qty'] = this.amountToPrecision (symbol, amount);
        }
        if (uppercaseType === 'LIMIT') {
            request['limitPrice'] = this.priceToPrecision (symbol, price);
        }
        const response = await this.privatePostOrders (this.extend (request, query));
        //
        // market buy
        //
        //     {
        //         "id":"ff81127c-8fd5-4846-b683-110639dcd322",
        //         "accountId":"6d445378-d8a3-4932-91cd-545d0a4ad2a2",
        //         "marketId":33,
        //         "type":1,
        //         "side":1,
        //         "cost":"25",
        //         "postOnly":false,
        //         "timeInForce":"GTC",
        //         "state":1,
        //         "placedAt":1589510846735
        //     }
        //
        // market sell, limit buy, limit sell
        //
        //     {
        //         "id":"042a38b0-e369-4ad2-ae73-a18ff6b1dcf1",
        //         "accountId":"6d445378-d8a3-4932-91cd-545d0a4ad2a2",
        //         "marketId":33,
        //         "type":2,
        //         "side":1,
        //         "qty":"1000",
        //         "limitPrice":"100",
        //         "postOnly":false,
        //         "timeInForce":"GTC",
        //         "state":1,
        //         "placedAt":1589403938682,
        //     }
        //
        return this.parseOrder (response, market);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        const request = {
            'id': id,
        };
        return await this.privateDeleteOrdersId (this.extend (request, params));
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'id': this.uid,
            'accountId': this.uid,
            'assetId': currency['id'],
            'amount': amount,
            // 'cryptoAddress': address,
            // 'accountNumber': 'IBAN', // IBAN account number
            // 'networkId': 'XBASE', // underlying network
        };
        if (address !== undefined) {
            request['cryptoAddress'] = address;
            if (tag !== undefined) {
                request['memo'] = tag;
            }
        }
        const response = await this.privatePostAccountsIdWithdrawals (this.extend (request, params));
        //
        //     {
        //         "id": "98b62dde-a87f-45f0-8db8-80ae2d312fa6"
        //     }
        //
        return {
            'info': response,
            'id': this.safeString (response, 'id'),
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, httpHeaders = undefined, body = undefined) {
        const query = this.omit (params, this.extractParams (path));
        let request = '/';
        if (api === 'public') {
            request += 'api/' + this.version;
        } else if (api === 'private') {
            request += 'api/' + this.version;
        } else if (api === 'markets') {
            request += 'api/' + api;
        }
        request += '/' + this.implodeParams (path, params);
        if (method === 'GET') {
            if (Object.keys (query).length) {
                request += '?' + this.urlencode (query);
            }
        }
        const url = this.urls['api'] + request;
        if (api === 'private') {
            this.checkRequiredCredentials ();
            let payload = '';
            if (method !== 'GET') {
                if (Object.keys (query).length) {
                    body = this.json (query);
                    payload = body;
                }
            }
            // construct signature
            const hasBody = (method === 'POST') || (method === 'PUT') || (method === 'PATCH');
            // const date = 'Mon, 30 Sep 2019 13:57:23 GMT';
            const date = this.rfc2616 (this.milliseconds ());
            let headersCSV = 'date' + ' ' + 'request-line';
            let message = 'date' + ':' + ' ' + date + "\n" + method + ' ' + request + ' HTTP/1.1'; // eslint-disable-line quotes
            let digest = '';
            if (hasBody) {
                digest = 'SHA-256=' + this.hash (payload, 'sha256', 'base64');
                message += "\ndigest" + ':' + ' ' + digest;  // eslint-disable-line quotes
                headersCSV += ' ' + 'digest';
            }
            const signature = this.hmac (this.encode (message), this.encode (this.secret), 'sha256', 'base64');
            const authorizationHeader = 'hmac username="' + this.apiKey + '",algorithm="hmac-sha256",headers="' + headersCSV + '",' + 'signature="' + signature + '"';
            httpHeaders = {
                'Date': date,
                'Authorization': authorizationHeader,
                'Content-Type': 'application/json',
            };
            if (hasBody) {
                httpHeaders['Digest'] = digest;
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': httpHeaders };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return; // fallback to default error handler
        }
        //
        //     {"message":"Invalid cost","_links":{"self":{"href":"/orders","templated":false}}}
        //
        const message = this.safeString (response, 'message');
        if (message !== undefined) {
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
            throw new ExchangeError (feedback); // unknown message
        }
    }
};
