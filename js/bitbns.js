'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired, InsufficientFunds, OrderNotFound, BadRequest, BadSymbol } = require ('./base/errors');
const Precise = require ('./base/Precise');

//  ---------------------------------------------------------------------------

module.exports = class bitbns extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitbns',
            'name': 'Bitbns',
            'countries': [ 'IN' ], // India
            'rateLimit': 1000,
            'certified': false,
            'pro': false,
            // new metainfo interface
            'has': {
                'cancelOrder': true,
                'createOrder': true,
                'fetchBalance': true,
                'fetchDepositAddress': true,
                'fetchDeposits': true,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchStatus': true,
                'fetchTicker': 'emulated',
                'fetchTickers': true,
                'fetchTrades': false,
                'fetchWithdrawals': true,
            },
            'timeframes': {
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/117201933-e7a6e780-adf5-11eb-9d80-98fc2a21c3d6.jpg',
                'api': {
                    'ccxt': 'https://bitbns.com/order',
                    'v1': 'https://api.bitbns.com/api/trade/v1',
                    'v2': 'https://api.bitbns.com/api/trade/v2',
                },
                'www': 'https://bitbns.com',
                'referral': 'https://ref.bitbns.com/1090961',
                'doc': [
                    'https://bitbns.com/trade/#/api-trading/',
                ],
                'fees': 'https://bitbns.com/fees',
            },
            'api': {
                'ccxt': {
                    'get': [
                        'fetchMarkets',
                        'fetchTickers',
                        'fetchOrderbook',
                    ],
                },
                'v1': {
                    'get': [
                        'platform/status',
                        'tickers',
                        'orderbook/sell/{symbol}',
                        'orderbook/buy/{symbol}',
                    ],
                    'post': [
                        'currentCoinBalance/EVERYTHING',
                        'getApiUsageStatus/USAGE',
                        'getOrderSocketToken/USAGE',
                        'currentCoinBalance/{symbol}',
                        'orderStatus/{symbol}',
                        'depositHistory/{symbol}',
                        'withdrawHistory/{symbol}',
                        'listOpenOrders/{symbol}',
                        'listOpenStopOrders/{symbol}',
                        'getCoinAddress/{symbol}',
                        'placeSellOrder/{symbol}',
                        'placeBuyOrder/{symbol}',
                        'buyStopLoss/{symbol}',
                        'placeSellOrder/{symbol}',
                        'cancelOrder/{symbol}',
                        'cancelStopLossOrder/{symbol}',
                        'listExecutedOrders/{symbol}',
                    ],
                },
                'v2': {
                    'post': [
                        'orders',
                        'cancel',
                        'getordersnew',
                        'marginOrders',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'feeSide': 'quote',
                    'tierBased': false,
                    'percentage': true,
                    'taker': this.parseNumber ('0.0025'),
                    'maker': this.parseNumber ('0.0025'),
                },
            },
            'exceptions': {
                'exact': {
                    '400': BadRequest, // {"msg":"Invalid Request","status":-1,"code":400}
                    '409': BadSymbol, // {"data":"","status":0,"error":"coin name not supplied or not yet supported","code":409}
                    '416': InsufficientFunds, // {"data":"Oops ! Not sufficient currency to sell","status":0,"error":null,"code":416}
                    '417': OrderNotFound, // {"data":[],"status":0,"error":"Nothing to show","code":417}
                },
                'broad': {},
            },
        });
    }

    async fetchStatus (params = {}) {
        const response = await this.v1GetPlatformStatus (params);
        //
        //     {
        //         "data":{
        //             "BTC":{"status":1},
        //             "ETH":{"status":1},
        //             "XRP":{"status":1},
        //         },
        //         "status":1,
        //         "error":null,
        //         "code":200
        //     }
        //
        let status = this.safeString (response, 'status');
        if (status !== undefined) {
            status = (status === '1') ? 'ok' : 'maintenance';
            this.status = this.extend (this.status, {
                'status': status,
                'updated': this.milliseconds (),
            });
        }
        return this.status;
    }

    async fetchMarkets (params = {}) {
        const response = await this.ccxtGetFetchMarkets (params);
        //
        //     [
        //         {
        //             "id":"BTC",
        //             "symbol":"BTC/INR",
        //             "base":"BTC",
        //             "quote":"INR",
        //             "baseId":"BTC",
        //             "quoteId":"",
        //             "active":true,
        //             "limits":{
        //                 "amount":{"min":"0.00017376","max":20},
        //                 "price":{"min":2762353.2359999996,"max":6445490.883999999},
        //                 "cost":{"min":800,"max":128909817.67999998}
        //             },
        //             "precision":{
        //                 "amount":8,
        //                 "price":2
        //             },
        //             "info":{}
        //         },
        //     ]
        //
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const market = response[i];
            const id = this.safeString (market, 'id');
            const baseId = this.safeString (market, 'base');
            const quoteId = this.safeString (market, 'quote');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const marketPrecision = this.safeValue (market, 'precision', {});
            const precision = {
                'amount': this.safeInteger (marketPrecision, 'amount'),
                'price': this.safeInteger (marketPrecision, 'price'),
            };
            const marketLimits = this.safeValue (market, 'limits', {});
            const amountLimits = this.safeValue (marketLimits, 'amount', {});
            const priceLimits = this.safeValue (marketLimits, 'price', {});
            const costLimits = this.safeValue (marketLimits, 'cost', {});
            const usdt = (quoteId === 'USDT');
            const uppercaseId = usdt ? (baseId + '_' + quoteId) : baseId;
            result.push ({
                'id': id,
                'uppercaseId': uppercaseId,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'info': market,
                'active': undefined,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': this.safeNumber (amountLimits, 'min'),
                        'max': this.safeNumber (amountLimits, 'max'),
                    },
                    'price': {
                        'min': this.safeNumber (priceLimits, 'min'),
                        'max': this.safeNumber (priceLimits, 'max'),
                    },
                    'cost': {
                        'min': this.safeNumber (costLimits, 'min'),
                        'max': this.safeNumber (costLimits, 'max'),
                    },
                },
            });
        }
        return result;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit; // default 100, max 5000, see https://github.com/binance-exchange/binance-official-api-docs/blob/master/rest-api.md#order-book
        }
        const response = await this.ccxtGetFetchOrderbook (this.extend (request, params));
        //
        //     {
        //         "bids":[
        //             [49352.04,0.843948],
        //             [49352.03,0.742048],
        //             [49349.78,0.686239],
        //         ],
        //         "asks":[
        //             [49443.59,0.065137],
        //             [49444.63,0.098211],
        //             [49449.01,0.066309],
        //         ],
        //         "timestamp":1619172786577,
        //         "datetime":"2021-04-23T10:13:06.577Z",
        //         "nonce":""
        //     }
        //
        const timestamp = this.safeInteger (response, 'timestamp');
        return this.parseOrderBook (response, timestamp);
    }

    parseTicker (ticker, market = undefined) {
        //
        //     {
        //         "symbol":"BTC/INR",
        //         "info":{
        //             "highest_buy_bid":4368494.31,
        //             "lowest_sell_bid":4374835.09,
        //             "last_traded_price":4374835.09,
        //             "yes_price":4531016.27,
        //             "volume":{"max":"4569119.23","min":"4254552.13","volume":62.17722344}
        //         },
        //         "timestamp":1619100020845,
        //         "datetime":1619100020845,
        //         "high":"4569119.23",
        //         "low":"4254552.13",
        //         "bid":4368494.31,
        //         "bidVolume":"",
        //         "ask":4374835.09,
        //         "askVolume":"",
        //         "vwap":"",
        //         "open":4531016.27,
        //         "close":4374835.09,
        //         "last":4374835.09,
        //         "baseVolume":62.17722344,
        //         "quoteVolume":"",
        //         "previousClose":"",
        //         "change":-156181.1799999997,
        //         "percentage":-3.446934874943623,
        //         "average":4452925.68
        //     }
        //
        const timestamp = this.safeInteger (ticker, 'timestamp');
        const marketId = this.safeString (ticker, 'symbol');
        const symbol = this.safeSymbol (marketId, market);
        const last = this.safeNumber (ticker, 'last');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeNumber (ticker, 'high'),
            'low': this.safeNumber (ticker, 'low'),
            'bid': this.safeNumber (ticker, 'bid'),
            'bidVolume': this.safeNumber (ticker, 'bidVolume'),
            'ask': this.safeNumber (ticker, 'ask'),
            'askVolume': this.safeNumber (ticker, 'askVolume'),
            'vwap': this.safeNumber (ticker, 'vwap'),
            'open': this.safeNumber (ticker, 'open'),
            'close': last,
            'last': last,
            'previousClose': this.safeNumber (ticker, 'previousClose'), // previous day close
            'change': this.safeNumber (ticker, 'change'),
            'percentage': this.safeNumber (ticker, 'percentage'),
            'average': this.safeNumber (ticker, 'average'),
            'baseVolume': this.safeNumber (ticker, 'baseVolume'),
            'quoteVolume': this.safeNumber (ticker, 'quoteVolume'),
            'info': ticker,
        };
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.ccxtGetFetchTickers (params);
        //
        //     {
        //         "BTC/INR":{
        //             "symbol":"BTC/INR",
        //             "info":{
        //                 "highest_buy_bid":4368494.31,
        //                 "lowest_sell_bid":4374835.09,
        //                 "last_traded_price":4374835.09,
        //                 "yes_price":4531016.27,
        //                 "volume":{"max":"4569119.23","min":"4254552.13","volume":62.17722344}
        //             },
        //             "timestamp":1619100020845,
        //             "datetime":1619100020845,
        //             "high":"4569119.23",
        //             "low":"4254552.13",
        //             "bid":4368494.31,
        //             "bidVolume":"",
        //             "ask":4374835.09,
        //             "askVolume":"",
        //             "vwap":"",
        //             "open":4531016.27,
        //             "close":4374835.09,
        //             "last":4374835.09,
        //             "baseVolume":62.17722344,
        //             "quoteVolume":"",
        //             "previousClose":"",
        //             "change":-156181.1799999997,
        //             "percentage":-3.446934874943623,
        //             "average":4452925.68
        //         }
        //     }
        //
        return this.parseTickers (response, symbols);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.v1PostCurrentCoinBalanceEVERYTHING (params);
        //
        //     {
        //         "data":{
        //             "availableorderMoney":0,
        //             "availableorderBTC":0,
        //             "availableorderXRP":0,
        //             "inorderMoney":0,
        //             "inorderBTC":0,
        //             "inorderXRP":0,
        //             "inorderNEO":0,
        //         },
        //         "status":1,
        //         "error":null,
        //         "code":200
        //     }
        //
        const timestamp = undefined;
        const result = {
            'info': response,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        const data = this.safeValue (response, 'data', {});
        const keys = Object.keys (data);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const parts = key.split ('availableorder');
            const numParts = parts.length;
            if (numParts > 1) {
                const currencyId = this.safeString (parts, 1);
                if (currencyId !== 'Money') {
                    const code = this.safeCurrencyCode (currencyId);
                    const account = this.account ();
                    account['free'] = this.safeString (data, key);
                    account['used'] = this.safeString (data, 'inorder' + currencyId);
                    result[code] = account;
                }
            }
        }
        return this.parseBalance (result);
    }

    parseOrderStatus (status) {
        const statuses = {
            '0': 'open',
            // 'PARTIALLY_FILLED': 'open',
            // 'FILLED': 'closed',
            // 'CANCELED': 'canceled',
            // 'PENDING_CANCEL': 'canceling', // currently unused
            // 'REJECTED': 'rejected',
            // 'EXPIRED': 'expired',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        //
        // createOrder
        //
        //     {
        //         "data":"Successfully placed bid to purchase currency",
        //         "status":1,
        //         "error":null,
        //         "id":5424475,
        //         "code":200
        //     }
        //
        // fetchOrder
        //
        //     {
        //         "entry_id":5424475,
        //         "btc":0.01,
        //         "rate":2000,
        //         "time":"2021-04-25T17:05:42.000Z",
        //         "type":0,
        //         "status":0,
        //         "total":0.01,
        //         "avg_cost":null,
        //         "side":"BUY",
        //         "amount":0.01,
        //         "remaining":0.01,
        //         "filled":0,
        //         "cost":null,
        //         "fee":0.05
        //     }
        //
        // fetchOpenOrders
        //
        //     {
        //         "entry_id":5424475,
        //         "btc":0.01,
        //         "rate":2000,
        //         "time":"2021-04-25T17:05:42.000Z",
        //         "type":0,
        //         "status":0
        //     }
        //
        const id = this.safeString2 (order, 'id', 'entry_id');
        const marketId = this.safeString (order, 'symbol');
        const symbol = this.safeSymbol (marketId, market);
        const timestamp = this.parse8601 (this.safeString (order, 'time'));
        const price = this.safeNumber (order, 'rate');
        const amount = this.safeNumber2 (order, 'amount', 'btc');
        const filled = this.safeNumber (order, 'filled');
        const remaining = this.safeNumber (order, 'remaining');
        const average = this.safeNumber (order, 'avg_cost');
        const cost = this.safeNumber (order, 'cost');
        let type = this.safeStringLower (order, 'type');
        if (type === '0') {
            type = 'limit';
        }
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const side = this.safeStringLower (order, 'side');
        const feeCost = this.safeNumber (order, 'fee');
        let fee = undefined;
        if (feeCost !== undefined) {
            const feeCurrencyCode = undefined;
            fee = {
                'cost': feeCost,
                'currency': feeCurrencyCode,
            };
        }
        return this.safeOrder ({
            'info': order,
            'id': id,
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': type,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': undefined,
            'amount': amount,
            'cost': cost,
            'average': average,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': fee,
            'trades': undefined,
        });
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        if (type !== 'limit') {
            throw new ExchangeError (this.id + ' allows limit orders only');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'side': side.toUpperCase (),
            'symbol': market['baseId'] + '_' + market['quoteId'],
            'quantity': this.amountToPrecision (symbol, amount),
            'rate': this.priceToPrecision (symbol, price),
            // 'target_rate': this.priceToPrecision (symbol, targetRate),
            // 't_rate': this.priceToPrecision (symbol, stopPrice),
            // 'trail_rate': this.priceToPrecision (symbol, trailRate),
            // To Place Simple Buy or Sell Order use rate
            // To Place Stoploss Buy or Sell Order use rate & t_rate
            // To Place Bracket Buy or Sell Order use rate , t_rate, target_rate & trail_rate
        };
        const response = await this.v2PostOrders (this.extend (request, params));
        //
        //     {
        //         "data":"Successfully placed bid to purchase currency",
        //         "status":1,
        //         "error":null,
        //         "id":5424475,
        //         "code":200
        //     }
        //
        return this.parseOrder (response, market);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const quoteSide = (market['quoteId'] === 'USDT') ? 'usdtcancelOrder' : 'cancelOrder';
        const request = {
            'entry_id': id,
            'symbol': market['uppercaseId'],
            'side': quoteSide,
        };
        const response = await this.v2PostCancel (this.extend (request, params));
        return this.parseOrder (response, market);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'entry_id': id,
        };
        const response = await this.v1PostOrderStatusSymbol (this.extend (request, params));
        //
        //     {
        //         "data":[
        //             {
        //                 "entry_id":5424475,
        //                 "btc":0.01,
        //                 "rate":2000,
        //                 "time":"2021-04-25T17:05:42.000Z",
        //                 "type":0,
        //                 "status":0,
        //                 "total":0.01,
        //                 "avg_cost":null,
        //                 "side":"BUY",
        //                 "amount":0.01,
        //                 "remaining":0.01,
        //                 "filled":0,
        //                 "cost":null,
        //                 "fee":0.05
        //             }
        //         ],
        //         "status":1,
        //         "error":null,
        //         "code":200
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        const first = this.safeValue (data, 0);
        return this.parseOrder (first, market);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const quoteSide = (market['quoteId'] === 'USDT') ? 'usdtListOpenOrders' : 'listOpenOrders';
        const request = {
            'symbol': market['uppercaseId'],
            'side': quoteSide,
            'page': 0,
        };
        const response = await this.v2PostGetordersnew (this.extend (request, params));
        //
        //     {
        //         "data":[
        //             {
        //                 "entry_id":5424475,
        //                 "btc":0.01,
        //                 "rate":2000,
        //                 "time":"2021-04-25T17:05:42.000Z",
        //                 "type":0,
        //                 "status":0
        //             }
        //         ],
        //         "status":1,
        //         "error":null,
        //         "code":200
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseOrders (data, market, since, limit);
    }

    parseTrade (trade, market = undefined) {
        //
        // fetchMyTrades
        //
        //     {
        //         "type": "BTC Sell order executed",
        //         "typeI": 6,
        //         "crypto": 5000,
        //         "amount": 35.4,
        //         "rate": 709800,
        //         "date": "2020-05-22T15:05:34.000Z",
        //         "unit": "INR",
        //         "factor": 100000000,
        //         "fee": 0.09,
        //         "delh_btc": -5000,
        //         "delh_inr": 0,
        //         "del_btc": 0,
        //         "del_inr": 35.4,
        //         "id": "2938823"
        //     }
        //
        market = this.safeMarket (undefined, market);
        const orderId = this.safeString (trade, 'id');
        const timestamp = this.parse8601 (this.safeString (trade, 'date'));
        const amountString = this.safeString (trade, 'amount');
        const priceString = this.safeString (trade, 'rate');
        const price = this.parseNumber (priceString);
        const factor = this.safeString (trade, 'factor');
        const amountScaled = Precise.stringDiv (amountString, factor);
        const amount = this.parseNumber (amountScaled);
        const cost = this.parseNumber (Precise.stringMul (priceString, amountScaled));
        const symbol = market['symbol'];
        let side = this.safeStringLower (trade, 'type');
        if (side.indexOf ('sell') >= 0) {
            side = 'sell';
        } else if (side.indexOf ('buy') >= 0) {
            side = 'buy';
        }
        let fee = undefined;
        const feeCost = this.safeNumber (trade, 'fee');
        if (feeCost !== undefined) {
            const feeCurrencyCode = market['quote'];
            fee = {
                'cost': feeCost,
                'currency': feeCurrencyCode,
            };
        }
        return {
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': undefined,
            'order': orderId,
            'type': undefined,
            'side': side,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
        };
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'page': 0,
        };
        if (since !== undefined) {
            request['since'] = this.iso8601 (since);
        }
        const response = await this.v1PostListExecutedOrdersSymbol (this.extend (request, params));
        //
        //     {
        //         "data": [
        //             {
        //                 "type": "BTC Sell order executed",
        //                 "typeI": 6,
        //                 "crypto": 5000,
        //                 "amount": 35.4,
        //                 "rate": 709800,
        //                 "date": "2020-05-22T15:05:34.000Z",
        //                 "unit": "INR",
        //                 "factor": 100000000,
        //                 "fee": 0.09,
        //                 "delh_btc": -5000,
        //                 "delh_inr": 0,
        //                 "del_btc": 0,
        //                 "del_inr": 35.4,
        //                 "id": "2938823"
        //             },
        //             {
        //                 "type": "BTC Sell order executed",
        //                 "typeI": 6,
        //                 "crypto": 195000,
        //                 "amount": 1380.58,
        //                 "rate": 709765.5,
        //                 "date": "2020-05-22T15:05:34.000Z",
        //                 "unit": "INR",
        //                 "factor": 100000000,
        //                 "fee": 3.47,
        //                 "delh_btc": -195000,
        //                 "delh_inr": 0,
        //                 "del_btc": 0,
        //                 "del_inr": 1380.58,
        //                 "id": "2938823"
        //             }
        //         ],
        //         "status": 1,
        //         "error": null,
        //         "code": 200
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseTrades (data, market, since, limit);
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        if (code === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchDeposits() requires a currency code argument');
        }
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'symbol': currency['id'],
            'page': 0,
        };
        const response = await this.v1PostDepositHistorySymbol (this.extend (request, params));
        //
        //     {
        //         "data":[
        //             {
        //                 "type":"USDT deposited",
        //                 "typeI":1,
        //                 "amount":100,
        //                 "date":"2021-04-24T14:56:04.000Z",
        //                 "unit":"USDT",
        //                 "factor":100,
        //                 "fee":0,
        //                 "delh_btc":0,
        //                 "delh_inr":0,
        //                 "rate":0,
        //                 "del_btc":10000,
        //                 "del_inr":0
        //             }
        //         ],
        //         "status":1,
        //         "error":null,
        //         "code":200
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseTransactions (data, currency, since, limit);
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        if (code === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchWithdrawals() requires a currency code argument');
        }
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'symbol': currency['id'],
            'page': 0,
        };
        const response = await this.v1PostWithdrawHistorySymbol (this.extend (request, params));
        //
        //     ...
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseTransactions (data, currency, since, limit);
    }

    parseTransactionStatusByType (status, type = undefined) {
        const statusesByType = {
            'deposit': {
                '0': 'pending',
                '1': 'ok',
            },
            'withdrawal': {
                '0': 'pending', // Email Sent
                '1': 'canceled', // Cancelled (different from 1 = ok in deposits)
                '2': 'pending', // Awaiting Approval
                '3': 'failed', // Rejected
                '4': 'pending', // Processing
                '5': 'failed', // Failure
                '6': 'ok', // Completed
            },
        };
        const statuses = this.safeValue (statusesByType, type, {});
        return this.safeString (statuses, status, status);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        // fetchDeposits
        //
        //     {
        //         "type":"USDT deposited",
        //         "typeI":1,
        //         "amount":100,
        //         "date":"2021-04-24T14:56:04.000Z",
        //         "unit":"USDT",
        //         "factor":100,
        //         "fee":0,
        //         "delh_btc":0,
        //         "delh_inr":0,
        //         "rate":0,
        //         "del_btc":10000,
        //         "del_inr":0
        //     }
        //
        // fetchWithdrawals
        //
        //     ...
        //
        const currencyId = this.safeString (transaction, 'unit');
        const code = this.safeCurrencyCode (currencyId, currency);
        const timestamp = this.parse8601 (this.safeString (transaction, 'date'));
        let type = this.safeString (transaction, 'type');
        let status = undefined;
        if (type !== undefined) {
            if (type.indexOf ('deposit') >= 0) {
                type = 'deposit';
                status = 'ok';
            } else if (type.indexOf ('withdraw') >= 0) {
                type = 'withdrawal';
            }
        }
        // const status = this.parseTransactionStatusByType (this.safeString (transaction, 'status'), type);
        const amount = this.safeNumber (transaction, 'amount');
        const feeCost = this.safeNumber (transaction, 'fee');
        let fee = undefined;
        if (feeCost !== undefined) {
            fee = { 'currency': code, 'cost': feeCost };
        }
        return {
            'info': transaction,
            'id': undefined,
            'txid': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'address': undefined,
            'addressTo': undefined,
            'addressFrom': undefined,
            'tag': undefined,
            'tagTo': undefined,
            'tagFrom': undefined,
            'type': type,
            'amount': amount,
            'currency': code,
            'status': status,
            'updated': undefined,
            'internal': undefined,
            'fee': fee,
        };
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'symbol': currency['id'],
        };
        const response = await this.v1PostGetCoinAddressSymbol (this.extend (request, params));
        //
        //     {
        //         "data":{
        //             "token":"0x680dee9edfff0c397736e10b017cf6a0aee4ba31",
        //             "expiry":"2022-04-24 22:30:11"
        //         },
        //         "status":1,
        //         "error":null
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const address = this.safeString (data, 'token');
        const tag = this.safeString (data, 'tag');
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'info': response,
        };
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'v1', method = 'GET', params = {}, headers = undefined, body = undefined) {
        this.checkRequiredCredentials ();
        const baseUrl = this.implodeHostname (this.urls['api'][api]);
        let url = baseUrl + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        const nonce = this.nonce ().toString ();
        headers = {
            'X-BITBNS-APIKEY': this.apiKey,
        };
        if (method === 'GET') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else if (method === 'POST') {
            if (Object.keys (query).length) {
                body = this.json (query);
            } else {
                body = '{}';
            }
            const auth = {
                'timeStamp_nonce': nonce,
                'body': body,
            };
            const payload = this.stringToBase64 (this.json (auth));
            const signature = this.hmac (payload, this.encode (this.secret), 'sha512');
            headers['X-BITBNS-PAYLOAD'] = this.decode (payload);
            headers['X-BITBNS-SIGNATURE'] = signature;
            headers['Content-Type'] = 'application/x-www-form-urlencoded';
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return; // fallback to default error handler
        }
        //
        //     {"msg":"Invalid Request","status":-1,"code":400}
        //     {"data":[],"status":0,"error":"Nothing to show","code":417}
        //
        const code = this.safeString (response, 'code');
        const message = this.safeString (response, 'msg');
        const error = (code !== undefined) && (code !== '200');
        if (error || (message !== undefined)) {
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions['exact'], code, feedback);
            this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
            throw new ExchangeError (feedback); // unknown message
        }
    }
};
