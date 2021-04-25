'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired, ExchangeNotAvailable, InsufficientFunds, OrderNotFound, InvalidOrder, DDoSProtection, InvalidNonce, AuthenticationError, RateLimitExceeded, PermissionDenied, NotSupported, BadRequest, BadSymbol, AccountSuspended, OrderImmediatelyFillable } = require ('./base/errors');
const { TRUNCATE } = require ('./base/functions/number');
const Precise = require ('./base/Precise');

//  ---------------------------------------------------------------------------

module.exports = class bitbns extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitbns',
            'name': 'Bitbns',
            'countries': [ 'IN' ], // India
            'rateLimit': 500,
            'certified': true,
            'pro': true,
            // new metainfo interface
            'has': {
                'cancelOrder': true,
                'createOrder': true,
                'fetchBalance': true,
                'fetchDepositAddress': true,
                'fetchDeposits': true,
                'fetchMarkets': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchStatus': true,
                'fetchWithdrawals': true,
            },
            'timeframes': {
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/29604020-d5483cdc-87ee-11e7-94c7-d1a8d9169293.jpg',
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
                    'feeSide': 'get',
                    'tierBased': false,
                    'percentage': true,
                    'taker': 0.0025,
                    'maker': 0.0025,
                },
            },
            'exceptions': {
                'exact': {
                    '400': BadRequest, // {"msg":"Invalid Request","status":-1,"code":400}
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
            result.push ({
                'id': id,
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
        const timestamp = this.safeInteger (ticker, 'closeTime');
        const marketId = this.safeString (ticker, 'symbol');
        const symbol = this.safeSymbol (marketId, market);
        const last = this.safeNumber (ticker, 'lastPrice');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeNumber (ticker, 'highPrice'),
            'low': this.safeNumber (ticker, 'lowPrice'),
            'bid': this.safeNumber (ticker, 'bidPrice'),
            'bidVolume': this.safeNumber (ticker, 'bidQty'),
            'ask': this.safeNumber (ticker, 'askPrice'),
            'askVolume': this.safeNumber (ticker, 'askQty'),
            'vwap': this.safeNumber (ticker, 'weightedAvgPrice'),
            'open': this.safeNumber (ticker, 'openPrice'),
            'close': last,
            'last': last,
            'previousClose': this.safeNumber (ticker, 'prevClosePrice'), // previous day close
            'change': this.safeNumber (ticker, 'priceChange'),
            'percentage': this.safeNumber (ticker, 'priceChangePercent'),
            'average': undefined,
            'baseVolume': this.safeNumber (ticker, 'volume'),
            'quoteVolume': this.safeNumber (ticker, 'quoteVolume'),
            'info': ticker,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        let method = 'publicGetTicker24hr';
        if (market['future']) {
            method = 'fapiPublicGetTicker24hr';
        } else if (market['delivery']) {
            method = 'dapiPublicGetTicker24hr';
        }
        const response = await this[method] (this.extend (request, params));
        if (Array.isArray (response)) {
            const firstTicker = this.safeValue (response, 0, {});
            return this.parseTicker (firstTicker, market);
        }
        return this.parseTicker (response, market);
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
        return this.parseBalance (result, false);
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
        const id = this.safeString2 (order, 'id', 'entry_id');
        const marketId = this.safeString (order, 'symbol');
        const symbol = this.safeSymbol (marketId, market);
        const timestamp = this.parse8601 (this.safeString (order, 'time'));
        const price = this.safeNumber (order, 'rate');
        const amount = this.safeNumber (order, 'amount');
        const filled = this.safeNumber (order, 'filled');
        const remaining = this.safeNumber (order, 'remaining');
        const average = this.safeNumber (order, 'avg_cost');
        const cost = this.safeNumber (order, 'cost');
        const type = this.safeStringLower (order, 'type');
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
        // // additional required fields depending on the order type
        // let stopPriceIsRequired = false;
        // if ((uppercaseType === 'STOP_LOSS') || (uppercaseType === 'TAKE_PROFIT')) {
        //     stopPriceIsRequired = true;
        // } else if ((uppercaseType === 'STOP_LOSS_LIMIT') || (uppercaseType === 'TAKE_PROFIT_LIMIT')) {
        //     stopPriceIsRequired = true;
        // } else if (uppercaseType === 'STOP') {
        //     stopPriceIsRequired = true;
        // } else if ((uppercaseType === 'STOP_MARKET') || (uppercaseType === 'TAKE_PROFIT_MARKET')) {
        //     stopPriceIsRequired = true;
        // }
        // if (stopPriceIsRequired) {
        //     const stopPrice = this.safeNumber2 (params, 'stopPrice', 't_rate');
        //     if (stopPrice === undefined) {
        //         throw new InvalidOrder (this.id + ' createOrder() requires a stopPrice or a t_rate extra param for a ' + type + ' order');
        //     } else {
        //         params = this.omit (params, [ 'stopPrice', 't_rate' ]);
        //         request['t_rate'] = this.priceToPrecision (symbol, stopPrice);
        //     }
        // }
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

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const defaultType = this.safeString2 (this.options, 'fetchOrders', 'defaultType', market['type']);
        const type = this.safeString (params, 'type', defaultType);
        let method = 'privateGetAllOrders';
        if (type === 'future') {
            method = 'fapiPrivateGetAllOrders';
        } else if (type === 'delivery') {
            method = 'dapiPrivateGetAllOrders';
        } else if (type === 'margin') {
            method = 'sapiGetMarginAllOrders';
        }
        const request = {
            'symbol': market['id'],
        };
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const query = this.omit (params, 'type');
        const response = await this[method] (this.extend (request, query));
        //
        //  spot
        //
        //     [
        //         {
        //             "symbol": "LTCBTC",
        //             "orderId": 1,
        //             "clientOrderId": "myOrder1",
        //             "price": "0.1",
        //             "origQty": "1.0",
        //             "executedQty": "0.0",
        //             "cummulativeQuoteQty": "0.0",
        //             "status": "NEW",
        //             "timeInForce": "GTC",
        //             "type": "LIMIT",
        //             "side": "BUY",
        //             "stopPrice": "0.0",
        //             "icebergQty": "0.0",
        //             "time": 1499827319559,
        //             "updateTime": 1499827319559,
        //             "isWorking": true
        //         }
        //     ]
        //
        //  futures
        //
        //     [
        //         {
        //             "symbol": "BTCUSDT",
        //             "orderId": 1,
        //             "clientOrderId": "myOrder1",
        //             "price": "0.1",
        //             "origQty": "1.0",
        //             "executedQty": "1.0",
        //             "cumQuote": "10.0",
        //             "status": "NEW",
        //             "timeInForce": "GTC",
        //             "type": "LIMIT",
        //             "side": "BUY",
        //             "stopPrice": "0.0",
        //             "updateTime": 1499827319559
        //         }
        //     ]
        //
        return this.parseOrders (response, market, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        let query = undefined;
        let type = undefined;
        const request = {};
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
            const defaultType = this.safeString2 (this.options, 'fetchOpenOrders', 'defaultType', market['type']);
            type = this.safeString (params, 'type', defaultType);
            query = this.omit (params, 'type');
        } else if (this.options['warnOnFetchOpenOrdersWithoutSymbol']) {
            const symbols = this.symbols;
            const numSymbols = symbols.length;
            const fetchOpenOrdersRateLimit = parseInt (numSymbols / 2);
            throw new ExchangeError (this.id + ' fetchOpenOrders WARNING: fetching open orders without specifying a symbol is rate-limited to one call per ' + fetchOpenOrdersRateLimit.toString () + ' seconds. Do not call this method frequently to avoid ban. Set ' + this.id + '.options["warnOnFetchOpenOrdersWithoutSymbol"] = false to suppress this warning message.');
        } else {
            const defaultType = this.safeString2 (this.options, 'fetchOpenOrders', 'defaultType', 'spot');
            type = this.safeString (params, 'type', defaultType);
            query = this.omit (params, 'type');
        }
        let method = 'privateGetOpenOrders';
        if (type === 'future') {
            method = 'fapiPrivateGetOpenOrders';
        } else if (type === 'delivery') {
            method = 'dapiPrivateGetOpenOrders';
        } else if (type === 'margin') {
            method = 'sapiGetMarginOpenOrders';
        }
        const response = await this[method] (this.extend (request, query));
        return this.parseOrders (response, market, since, limit);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const orders = await this.fetchOrders (symbol, since, limit, params);
        return this.filterBy (orders, 'status', 'closed');
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const defaultType = this.safeString2 (this.options, 'fetchOpenOrders', 'defaultType', market['type']);
        const type = this.safeString (params, 'type', defaultType);
        // https://github.com/ccxt/ccxt/issues/6507
        const origClientOrderId = this.safeValue2 (params, 'origClientOrderId', 'clientOrderId');
        const request = {
            'symbol': market['id'],
            // 'orderId': id,
            // 'origClientOrderId': id,
        };
        if (origClientOrderId === undefined) {
            request['orderId'] = id;
        } else {
            request['origClientOrderId'] = origClientOrderId;
        }
        let method = 'privateDeleteOrder';
        if (type === 'future') {
            method = 'fapiPrivateDeleteOrder';
        } else if (type === 'delivery') {
            method = 'dapiPrivateDeleteOrder';
        } else if (type === 'margin') {
            method = 'sapiDeleteMarginOrder';
        }
        const query = this.omit (params, [ 'type', 'origClientOrderId', 'clientOrderId' ]);
        const response = await this[method] (this.extend (request, query));
        return this.parseOrder (response);
    }

    async cancelAllOrders (symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelAllOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const defaultType = this.safeString2 (this.options, 'cancelAllOrders', 'defaultType', 'spot');
        const type = this.safeString (params, 'type', defaultType);
        const query = this.omit (params, 'type');
        let method = 'privateDeleteOpenOrders';
        if (type === 'margin') {
            method = 'sapiDeleteMarginOpenOrders';
        } else if (type === 'future') {
            method = 'fapiPrivateDeleteAllOpenOrders';
        } else if (type === 'delivery') {
            method = 'dapiPrivateDeleteAllOpenOrders';
        }
        const response = await this[method] (this.extend (request, query));
        if (Array.isArray (response)) {
            return this.parseOrders (response, market);
        } else {
            return response;
        }
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const defaultType = this.safeString2 (this.options, 'fetchMyTrades', 'defaultType', market['type']);
        const type = this.safeString (params, 'type', defaultType);
        params = this.omit (params, 'type');
        let method = undefined;
        if (type === 'spot') {
            method = 'privateGetMyTrades';
        } else if (type === 'margin') {
            method = 'sapiGetMarginMyTrades';
        } else if (type === 'future') {
            method = 'fapiPrivateGetUserTrades';
        } else if (type === 'delivery') {
            method = 'dapiPrivateGetUserTrades';
        }
        const request = {
            'symbol': market['id'],
        };
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this[method] (this.extend (request, params));
        //
        // spot trade
        //
        //     [
        //         {
        //             "symbol": "BNBBTC",
        //             "id": 28457,
        //             "orderId": 100234,
        //             "price": "4.00000100",
        //             "qty": "12.00000000",
        //             "commission": "10.10000000",
        //             "commissionAsset": "BNB",
        //             "time": 1499865549590,
        //             "isBuyer": true,
        //             "isMaker": false,
        //             "isBestMatch": true,
        //         }
        //     ]
        //
        // futures trade
        //
        //     [
        //         {
        //             "accountId": 20,
        //             "buyer": False,
        //             "commission": "-0.07819010",
        //             "commissionAsset": "USDT",
        //             "counterPartyId": 653,
        //             "id": 698759,
        //             "maker": False,
        //             "orderId": 25851813,
        //             "price": "7819.01",
        //             "qty": "0.002",
        //             "quoteQty": "0.01563",
        //             "realizedPnl": "-0.91539999",
        //             "side": "SELL",
        //             "symbol": "BTCUSDT",
        //             "time": 1569514978020
        //         }
        //     ]
        //
        return this.parseTrades (response, market, since, limit);
    }

    async fetchMyDustTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        //
        // Binance provides an opportunity to trade insignificant (i.e. non-tradable and non-withdrawable)
        // token leftovers (of any asset) into `BNB` coin which in turn can be used to pay trading fees with it.
        // The corresponding trades history is called the `Dust Log` and can be requested via the following end-point:
        // https://github.com/binance-exchange/binance-official-api-docs/blob/master/wapi-api.md#dustlog-user_data
        //
        await this.loadMarkets ();
        const response = await this.wapiGetUserAssetDribbletLog (params);
        // { success:    true,
        //   results: { total:    1,
        //               rows: [ {     transfered_total: "1.06468458",
        //                         service_charge_total: "0.02172826",
        //                                      tran_id: 2701371634,
        //                                         logs: [ {              tranId:  2701371634,
        //                                                   serviceChargeAmount: "0.00012819",
        //                                                                   uid: "35103861",
        //                                                                amount: "0.8012",
        //                                                           operateTime: "2018-10-07 17:56:07",
        //                                                      transferedAmount: "0.00628141",
        //                                                             fromAsset: "ADA"                  } ],
        //                                 operate_time: "2018-10-07 17:56:06"                                } ] } }
        const results = this.safeValue (response, 'results', {});
        const rows = this.safeValue (results, 'rows', []);
        const data = [];
        for (let i = 0; i < rows.length; i++) {
            const logs = rows[i]['logs'];
            for (let j = 0; j < logs.length; j++) {
                logs[j]['isDustTrade'] = true;
                data.push (logs[j]);
            }
        }
        const trades = this.parseTrades (data, undefined, since, limit);
        return this.filterBySinceLimit (trades, since, limit);
    }

    parseDustTrade (trade, market = undefined) {
        // {              tranId:  2701371634,
        //   serviceChargeAmount: "0.00012819",
        //                   uid: "35103861",
        //                amount: "0.8012",
        //           operateTime: "2018-10-07 17:56:07",
        //      transferedAmount: "0.00628141",
        //             fromAsset: "ADA"                  },
        const orderId = this.safeString (trade, 'tranId');
        const timestamp = this.parse8601 (this.safeString (trade, 'operateTime'));
        const tradedCurrency = this.safeCurrencyCode (this.safeString (trade, 'fromAsset'));
        const earnedCurrency = this.currency ('BNB')['code'];
        const applicantSymbol = earnedCurrency + '/' + tradedCurrency;
        let tradedCurrencyIsQuote = false;
        if (applicantSymbol in this.markets) {
            tradedCurrencyIsQuote = true;
        }
        //
        // Warning
        // Binance dust trade `fee` is already excluded from the `BNB` earning reported in the `Dust Log`.
        // So the parser should either set the `fee.cost` to `0` or add it on top of the earned
        // BNB `amount` (or `cost` depending on the trade `side`). The second of the above options
        // is much more illustrative and therefore preferable.
        //
        const fee = {
            'currency': earnedCurrency,
            'cost': this.safeNumber (trade, 'serviceChargeAmount'),
        };
        let symbol = undefined;
        let amount = undefined;
        let cost = undefined;
        let side = undefined;
        if (tradedCurrencyIsQuote) {
            symbol = applicantSymbol;
            amount = this.sum (this.safeNumber (trade, 'transferedAmount'), fee['cost']);
            cost = this.safeNumber (trade, 'amount');
            side = 'buy';
        } else {
            symbol = tradedCurrency + '/' + earnedCurrency;
            amount = this.safeNumber (trade, 'amount');
            cost = this.sum (this.safeNumber (trade, 'transferedAmount'), fee['cost']);
            side = 'sell';
        }
        let price = undefined;
        if (cost !== undefined) {
            if (amount) {
                price = cost / amount;
            }
        }
        const id = undefined;
        const type = undefined;
        const takerOrMaker = undefined;
        return {
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': orderId,
            'type': type,
            'takerOrMaker': takerOrMaker,
            'side': side,
            'amount': amount,
            'price': price,
            'cost': cost,
            'fee': fee,
            'info': trade,
        };
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

    async fetchFundingFees (codes = undefined, params = {}) {
        const response = await this.sapiGetAssetAssetDetail (params);
        //
        //     {
        //       "VRAB": {
        //         "withdrawFee": "100",
        //         "minWithdrawAmount": "200",
        //         "withdrawStatus": true,
        //         "depositStatus": true
        //       },
        //       "NZD": {
        //         "withdrawFee": "0",
        //         "minWithdrawAmount": "0",
        //         "withdrawStatus": false,
        //         "depositStatus": false
        //       },
        //       "AKRO": {
        //         "withdrawFee": "313",
        //         "minWithdrawAmount": "626",
        //         "withdrawStatus": true,
        //         "depositStatus": true
        //       },
        //     }
        //
        const ids = Object.keys (response);
        const withdrawFees = {};
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const code = this.safeCurrencyCode (id);
            withdrawFees[code] = this.safeNumber (response[id], 'withdrawFee');
        }
        return {
            'withdraw': withdrawFees,
            'deposit': {},
            'info': response,
        };
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'coin': currency['id'],
            'address': address,
            'amount': amount,
            // https://binance-docs.github.io/apidocs/spot/en/#withdraw-sapi
            // issue sapiGetCapitalConfigGetall () to get networks for withdrawing USDT ERC20 vs USDT Omni
            // 'network': 'ETH', // 'BTC', 'TRX', etc, optional
        };
        if (tag !== undefined) {
            request['addressTag'] = tag;
        }
        const response = await this.sapiPostCapitalWithdrawApply (this.extend (request, params));
        //     { id: '9a67628b16ba4988ae20d329333f16bc' }
        return {
            'info': response,
            'id': this.safeString (response, 'id'),
        };
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'v1', method = 'GET', params = {}, headers = undefined, body = undefined) {
        this.checkRequiredCredentials ();
        const baseUrl = this.implodeParams (this.urls['api'][api], { 'hostname': this.hostname });
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
            body = this.json (query);
            const auth = {
                'timeStamp_nonce': nonce,
                'body': body,
            };
            const payload = this.stringToBase64 (this.json (auth));
            const signature = this.hmac (payload, this.secret, 'sha512');
            headers['X-BITBNS-PAYLOAD'] = payload;
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
