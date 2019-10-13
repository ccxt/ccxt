'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ArgumentsRequired, AuthenticationError, ExchangeError, InsufficientFunds, InvalidOrder } = require ('./base/errors');
const { ROUND } = require ('./base/functions/number');

//  ---------------------------------------------------------------------------

module.exports = class bitmax extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitmax',
            'name': 'BitMax',
            'countries': [ 'CN' ], // China
            'rateLimit': 500,
            'certified': false,
            // new metainfo interface
            'has': {
                'CORS': false,
                'fetchTickers': true,
                'fetchOHLCV': true,
                'fetchMyTrades': false,
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
                'fetchTransactions': false,
                'fetchCurrencies': true,
                'cancelAllOrders': true,
            },
            'timeframes': {
                '1m': '1',
                '3m': '3',
                '5m': '5',
                '15m': '15',
                '30m': '30',
                '1h': '60',
                '2h': '120',
                '4h': '240',
                '6h': '360',
                '12h': '720',
                '1d': '1d',
                '1w': '1w',
                '1M': '1m',
            },
            'version': 'v1',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/12462602/60425376-f41fef00-9c24-11e9-899b-e3af164ff9e2.png',
                'api': 'https://bitmax.io/api',
                'test': 'https://bitmax-test.io/api',
                'www': 'https://bitmax.io',
                'doc': [
                    'https://github.com/bitmax-exchange/api-doc/blob/master/bitmax-api-doc-v1.2.md',
                ],
                'fees': 'https://bitmax.io/#/feeRate/tradeRate',
            },
            'api': {
                'public': {
                    'get': [
                        'assets',
                        'depth',
                        'fees',
                        'quote',
                        'depth',
                        'trades',
                        'products',
                        'ticker/24hr',
                        'barhist',
                        'barhist/info',
                        'margin/ref-price',
                    ],
                },
                'private': {
                    'get': [
                        'user/info',
                        'balance',
                        'order/batch',
                        'order/open',
                        'order',
                        'order/history',
                        'order/{coid}',
                        'transaction',
                        'margin/balance',
                        'margin/order/open',
                        'margin/order',
                    ],
                    'post': [
                        'margin/order',
                        'order',
                        'order/batch',
                    ],
                    'delete': [
                        'margin/order',
                        'order',
                        'order/all',
                        'order/batch',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'taker': 0.0004,
                    'maker': 0.0004,
                },
            },
            'options': {
                'accountGroup': -1,
                'timeDifference': 0,
                'adjustForTimeDifference': false,
                'parseOrderToPrecision': false,
            },
            'exceptions': {
                'exact': {
                    '2100': AuthenticationError, // {"code":2100,"message":"ApiKeyFailure"}
                    '6010': InsufficientFunds, // {'code': 6010, 'message': 'Not enough balance.'}
                    '60060': InvalidOrder, // { 'code': 60060, 'message': 'The order is already filled or canceled.' }
                },
                'broad': {},
            },
        });
    }

    nonce () {
        return this.milliseconds () - this.options['timeDifference'];
    }

    async fetchCurrencies (params = {}) {
        const response = await this.publicGetAssets (params);
        //
        //     [
        //         {
        //           "assetCode" : "LTO",
        //           "assetName" : "LTO",
        //           "precisionScale" : 9,
        //           "nativeScale" : 3,
        //           "withdrawalFee" : 5.0,
        //           "minWithdrawalAmt" : 10.0,
        //           "status" : "Normal"
        //         },
        //     ]
        //
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const currency = response[i];
            const id = this.safeString (currency, 'assetCode');
            // todo: will need to rethink the fees
            // to add support for multiple withdrawal/deposit methods and
            // differentiated fees for each particular method
            const code = this.safeCurrencyCode (id);
            const precision = this.safeInteger (currency, 'precisionScale');
            const fee = this.safeFloat (currency, 'withdrawalFee'); // todo: redesign
            const status = this.safeString (currency, 'status');
            const active = (status === 'Normal');
            result[code] = {
                'id': id,
                'code': code,
                'info': currency,
                'type': undefined,
                'name': this.safeString (currency, 'assetName'),
                'active': active,
                'fee': fee,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': Math.pow (10, -precision),
                        'max': undefined,
                    },
                    'price': {
                        'min': Math.pow (10, -precision),
                        'max': undefined,
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': this.safeFloat (currency, 'minWithdrawalAmt'),
                        'max': undefined,
                    },
                },
            };
        }
        return result;
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetProducts (params);
        //
        //     [
        //         {
        //             "symbol" : "BCH/USDT",
        //             "domain" : "USDS",
        //             "baseAsset" : "BCH",
        //             "quoteAsset" : "USDT",
        //             "priceScale" : 2,
        //             "qtyScale" : 3,
        //             "notionalScale" : 9,
        //             "minQty" : "0.000000001",
        //             "maxQty" : "1000000000",
        //             "minNotional" : "5",
        //             "maxNotional" : "200000",
        //             "status" : "Normal",
        //             "miningStatus" : "",
        //             "marginTradable" : true,
        //             "commissionType" : "Quote",
        //             "commissionReserveRate" : 0.0010000000
        //         },
        //     ]
        //
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const market = response[i];
            const id = this.safeString (market, 'symbol');
            const baseId = this.safeString (market, 'baseAsset');
            const quoteId = this.safeString (market, 'quoteAsset');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const precision = {
                'amount': this.safeInteger (market, 'qtyScale'),
                'price': this.safeInteger (market, 'notionalScale'),
            };
            const status = this.safeString (market, 'status');
            const active = (status === 'Normal');
            const entry = {
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
                        'min': this.safeFloat (market, 'minQty'),
                        'max': this.safeFloat (market, 'maxQty'),
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'cost': {
                        'min': this.safeFloat (market, 'minNotional'),
                        'max': this.safeFloat (market, 'maxNotional'),
                    },
                },
            };
            result.push (entry);
        }
        return result;
    }

    calculateFee (symbol, type, side, amount, price, takerOrMaker = 'taker', params = {}) {
        const market = this.markets[symbol];
        let key = 'quote';
        const rate = market[takerOrMaker];
        let cost = amount * rate;
        let precision = market['precision']['price'];
        if (side === 'sell') {
            cost *= price;
        } else {
            key = 'base';
            precision = market['precision']['amount'];
        }
        cost = this.decimalToPrecision (cost, ROUND, precision, this.precisionMode);
        return {
            'type': takerOrMaker,
            'currency': market[key],
            'rate': rate,
            'cost': parseFloat (cost),
        };
    }

    async loadAccountGroup () {
        if (this.options['accountGroup'] === -1) {
            const response = await this.privateGetUserInfo ();
            //
            //     {
            //         "accountGroup": 5
            //     }
            //
            this.options['accountGroup'] = this.safeInteger (response, 'accountGroup', -1);
        }
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        await this.loadAccountGroup ();
        const response = await this.privateGetBalance (params);
        //
        //     {
        //         "code": 0,
        //         "status": "success",     // this field will be deprecated soon
        //         "email": "foo@bar.com",  // this field will be deprecated soon
        //         "data": [
        //             {
        //                 "assetCode":       "TSC",
        //                 "assetName":       "Ethereum",
        //                 "totalAmount":     "20.03",    // total balance amount
        //                 "availableAmount": "20.03",    // balance amount available to trade
        //                 "inOrderAmount":   "0.000",    // in order amount
        //                 "btcValue":        "70.81"     // the current BTC value of the balance
        //                                                 // ("btcValue" might not be available when price is missing)
        //             },
        //         ]
        //     }
        //
        const result = { 'info': response };
        const balances = this.safeValue (response, 'data', []);
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const code = this.safeCurrencyCode (this.safeString (balance, 'assetCode'));
            const account = this.account ();
            account['free'] = this.safeFloat (balance, 'availableAmount');
            account['used'] = this.safeFloat (balance, 'inOrderAmount');
            account['total'] = this.safeFloat (balance, 'totalAmount');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['symbol'],
        };
        if (limit !== undefined) {
            request['n'] = limit; // default = maximum = 100
        }
        const response = await this.publicGetDepth (this.extend (request, params));
        //
        //     {
        //         "m":"depth",
        //         "ts":1570866464777,
        //         "seqnum":5124140078,
        //         "s":"ETH/USDT",
        //         "asks":[
        //             ["183.57","5.92"],
        //             ["183.6","10.185"]
        //         ],
        //         "bids":[
        //             ["183.54","0.16"],
        //             ["183.53","10.8"],
        //         ]
        //     }
        //
        const timestamp = this.safeInteger (response, 'ts');
        const result = this.parseOrderBook (response, timestamp);
        result['nonce'] = this.safeInteger (response, 'seqnum');
        return result;
    }

    parseTicker (ticker, market = undefined) {
        //
        //     {
        //         "symbol":"BCH/USDT",
        //         "interval":"1d",
        //         "barStartTime":1570866600000,
        //         "openPrice":"225.16",
        //         "closePrice":"224.05",
        //         "highPrice":"226.08",
        //         "lowPrice":"218.92",
        //         "volume":"8607.036"
        //     }
        //
        const timestamp = this.safeInteger (ticker, 'barStartTime');
        let symbol = undefined;
        const marketId = this.safeString (ticker, 'symbol');
        if (marketId in this.markets_by_id) {
            market = this.markets_by_id[marketId];
        } else if (marketId !== undefined) {
            const [ baseId, quoteId ] = marketId.split ('/');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            symbol = base + '/' + quote;
        }
        if ((symbol === undefined) && (market !== undefined)) {
            symbol = market['symbol'];
        }
        const last = this.safeFloat (ticker, 'closePrice');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'highPrice'),
            'low': this.safeFloat (ticker, 'lowPrice'),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': this.safeFloat (ticker, 'openPrice'),
            'close': last,
            'last': last,
            'previousClose': undefined, // previous day close
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'volume'),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    parseTickers (rawTickers, symbols = undefined) {
        const tickers = [];
        for (let i = 0; i < rawTickers.length; i++) {
            tickers.push (this.parseTicker (rawTickers[i]));
        }
        return this.filterByArray (tickers, 'symbol', symbols);
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['symbol'],
        };
        const response = await this.publicGetTicker24hr (this.extend (request, params));
        return this.parseTicker (response, market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetTicker24hr (params);
        return this.parseTickers (response, symbols);
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        //
        //     [
        //         {
        //             "m":"bar",
        //             "s":"ETH/BTC",
        //             "ba":"ETH",
        //             "qa":"BTC",
        //             "i":"1",
        //             "t":1570867020000,
        //             "o":"0.022023",
        //             "c":"0.022018",
        //             "h":"0.022023",
        //             "l":"0.022018",
        //             "v":"2.510",
        //         }
        //     ]
        //
        return [
            this.safeInteger (ohlcv, 't'),
            this.safeFloat (ohlcv, 'o'),
            this.safeFloat (ohlcv, 'h'),
            this.safeFloat (ohlcv, 'l'),
            this.safeFloat (ohlcv, 'c'),
            this.safeFloat (ohlcv, 'v'),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['symbol'],
            'interval': this.timeframes[timeframe],
        };
        // if since and limit are not specified
        // the exchange will return just 1 last candle by default
        const duration = this.parseTimeframe (timeframe);
        if (since !== undefined) {
            request['from'] = since;
            if (limit !== undefined) {
                request['to'] = this.sum (request['from'], limit * duration * 1000, 1);
            }
        } else if (limit !== undefined) {
            request['to'] = this.milliseconds ();
            request['from'] = request['to'] - limit * duration * 1000 - 1;
        }
        const response = await this.publicGetBarhist (this.extend (request, params));
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    parseTrade (trade, market = undefined) {
        //
        // public fetchTrades
        //
        //     {
        //         "p":  "13.75",         // price
        //         "q":  "6.68",          // quantity
        //         "t":  1528988084944,   // timestamp
        //         "bm": False            // if true, the buyer is the market maker
        //     }
        //
        const timestamp = this.safeInteger (trade, 't');
        const price = this.safeFloat (trade, 'p');
        const amount = this.safeFloat (trade, 'q');
        const takerOrMaker = trade['bm'] ? 'maker' : 'taker';
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        return {
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': undefined,
            'order': undefined,
            'type': undefined,
            'takerOrMaker': takerOrMaker,
            'side': undefined,
            'price': price,
            'amount': amount,
            'cost': price * amount,
            'fee': undefined,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['n'] = limit; // currently limited to 100 or fewer
        }
        const response = await this.publicGetTrades (this.extend (request, params));
        //
        //     {
        //         "m": "marketTrades",       // message type
        //         "s": "ETH/BTC",            // symbol
        //         "trades": [
        //             {
        //                 "p":  "13.75",         // price
        //                 "q":  "6.68",          // quantity
        //                 "t":  1528988084944,   // timestamp
        //                 "bm": False            // if true, the buyer is the market maker
        //             },
        //         ]
        //     }
        //
        const trades = this.safeValue (response, 'trades', []);
        return this.parseTrades (trades, market, since, limit);
    }

    parseOrderStatus (status) {
        const statuses = {
            'PendingNew': 'open',
            'New': 'open',
            'PartiallyFilled': 'open',
            'Filled': 'closed',
            'Canceled': 'canceled',
            'Rejected': 'rejected',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        //
        // createOrder
        //
        //     {
        //         "coid": "xxx...xxx",
        //         "action": "new",
        //         "success": true  // success = true means the order has been submitted to the matching engine.
        //     }
        //
        // fetchOrder
        //
        //     {
        //         "accountCategory": "CASH",
        //         "accountId": "cshKAhmTHQNUKhR1pQyrDOdotE3Tsnz4",
        //         "avgPrice": "0.000000000",
        //         "baseAsset": "ETH",
        //         "btmxCommission": "0.000000000",
        //         "coid": "41g6wtPRFrJXgg6Y7vpIkcCyWhgcK0cF", // the unique identifier, you will need, this value to cancel this order
        //         "errorCode": "NULL_VAL",
        //         "execId": "12452288",
        //         "execInst": "NULL_VAL",
        //         "fee": "0.000000000", // cumulative fee paid for this order
        //         "feeAsset": "", // the asset
        //         "filledQty": "0.000000000", // filled quantity
        //         "notional": "0.000000000",
        //         "orderPrice": "0.310000000", // only available for limit and stop limit orders
        //         "orderQty": "1.000000000",
        //         "orderType": "StopLimit",
        //         "quoteAsset": "BTC",
        //         "side": "Buy",
        //         "status": "PendingNew",
        //         "stopPrice": "0.300000000", // only available for stop market and stop limit orders
        //         "symbol": "ETH/BTC",
        //         "time": 1566091628227, // The last execution time of the order
        //         "sendingTime": 1566091503547, // The sending time of the order
        //         "userId": "supEQeSJQllKkxYSgLOoVk7hJAX59WSz"
        //     }
        //
        // fetchOrders, fetchOpenOrders, fetchClosedOrders
        //
        // ...
        //
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const symbol = this.findSymbol (this.safeString (order, 'symbol'), market);
        let timestamp = undefined;
        if ('time' in order) {
            timestamp = this.safeInteger (order, 'time');
        }
        let price = this.safeFloat (order, 'orderPrice');
        const amount = this.safeFloat (order, 'orderQty');
        const filled = this.safeFloat (order, 'filledQty');
        let remaining = undefined;
        let cost = this.safeFloat (order, 'cummulativeQuoteQty');
        if (filled !== undefined) {
            if (amount !== undefined) {
                remaining = amount - filled;
                if (this.options['parseOrderToPrecision']) {
                    remaining = parseFloat (this.amountToPrecision (symbol, remaining));
                }
                remaining = Math.max (remaining, 0.0);
            }
            if (price !== undefined) {
                if (cost === undefined) {
                    cost = price * filled;
                }
            }
        }
        const id = this.safeString (order, 'coid');
        let type = this.safeString (order, 'orderType');
        if (type !== undefined) {
            type = type.toLowerCase ();
            if (type === 'market') {
                if (price === 0.0) {
                    if ((cost !== undefined) && (filled !== undefined)) {
                        if ((cost > 0) && (filled > 0)) {
                            price = cost / filled;
                        }
                    }
                }
            }
        }
        let side = this.safeString (order, 'side');
        if (side !== undefined) {
            side = side.toLowerCase ();
        }
        const fee = {
            'cost': this.safeFloat (order, 'fee'),
            'currency': this.safeString (order, 'feeAsset'),
        };
        const average = this.safeFloat (order, 'avgPrice');
        return {
            'info': order,
            'id': id,
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
            'fee': fee,
            'trades': undefined,
        };
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        await this.loadAccountGroup ();
        const market = this.market (symbol);
        const request = {
            'coid': this.coid (), // a unique identifier of length 32
            'time': this.milliseconds (), // milliseconds since UNIX epoch in UTC
            'symbol': market['id'],
            // 'orderPrice': this.priceToPrecision (symbol, price), // optional, limit price of the order. This field is required for limit orders and stop limit orders
            // 'stopPrice': '15.7', // optional, stopPrice of the order. This field is required for stop_market orders and stop limit orders
            'orderQty': this.amountToPrecision (symbol, amount),
            'orderType': type, // order type, you shall specify one of the following: "limit", "market", "stop_market", "stop_limit"
            'side': side, // "buy" or "sell"
            // 'postOnly': true, // optional, if true, the order will either be posted to the limit order book or be cancelled, i.e. the order cannot take liquidity, default is false
            // 'timeInForce': 'GTC', // optional, supports "GTC" good-till-canceled and "IOC" immediate-or-cancel
        };
        if ((type === 'limit') || (type === 'stop_limit')) {
            request['orderPrice'] = this.priceToPrecision (symbol, price);
        }
        const response = await this.privatePostOrder (this.extend (request, params));
        //
        //     {
        //         "code": 0,
        //         "email": "foo@bar.com", // this field will be deprecated soon
        //         "status": "success", // this field will be deprecated soon
        //         "data": {
        //             "coid": "xxx...xxx",
        //             "action": "new",
        //             "success": true, // success = true means the order has been submitted to the matching engine
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        return this.parseOrder (data, market);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        await this.loadAccountGroup ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const request = {
            'coid': id,
        };
        const response = await this.privateGetOrderCoid (this.extend (request, params));
        //
        //     {
        //         'code': 0,
        //         'status': 'success', // this field will be deprecated soon
        //         'email': 'foo@bar.com', // this field will be deprecated soon
        //         "data": {
        //             "accountCategory": "CASH",
        //             "accountId": "cshKAhmTHQNUKhR1pQyrDOdotE3Tsnz4",
        //             "avgPrice": "0.000000000",
        //             "baseAsset": "ETH",
        //             "btmxCommission": "0.000000000",
        //             "coid": "41g6wtPRFrJXgg6Y7vpIkcCyWhgcK0cF", // the unique identifier, you will need, this value to cancel this order
        //             "errorCode": "NULL_VAL",
        //             "execId": "12452288",
        //             "execInst": "NULL_VAL",
        //             "fee": "0.000000000", // cumulative fee paid for this order
        //             "feeAsset": "", // the asset
        //             "filledQty": "0.000000000", // filled quantity
        //             "notional": "0.000000000",
        //             "orderPrice": "0.310000000", // only available for limit and stop limit orders
        //             "orderQty": "1.000000000",
        //             "orderType": "StopLimit",
        //             "quoteAsset": "BTC",
        //             "side": "Buy",
        //             "status": "PendingNew",
        //             "stopPrice": "0.300000000", // only available for stop market and stop limit orders
        //             "symbol": "ETH/BTC",
        //             "time": 1566091628227, // The last execution time of the order
        //             "sendingTime": 1566091503547, // The sending time of the order
        //             "userId": "supEQeSJQllKkxYSgLOoVk7hJAX59WSz"
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        return this.parseOrder (data, market);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrders requires a symbol argument');
        }
        await this.loadMarkets ();
        await this.loadAccountGroup ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.privateGetOrderHistory (this.extend (request, params));
        let orders = this.safeValue (response, 'data', {});
        orders = this.safeValue (orders, 'data', {});
        return this.parseOrders (orders, market, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        await this.loadAccountGroup ();
        const market = this.market (symbol);
        const request = {};
        request['symbol'] = market['id'];
        const response = await this.privateGetOrderOpen (this.extend (request, params));
        const orders = this.safeValue (response, 'data', []);
        return this.parseOrders (orders, market, since, limit);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = { 'status': 'Filled' };
        const orders = await this.fetchOrders (symbol, since, limit, this.extend (request, params));
        return orders;
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder requires a symbol argument');
        }
        await this.loadMarkets ();
        await this.loadAccountGroup ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'coid': this.coid (),
            'origCoid': id,
            'time': this.nonce (),
        };
        const response = await this.privateDeleteOrder (this.extend (request, params));
        //
        //     {
        //         'code': 0,
        //         'status': 'success', // this field will be deprecated soon
        //         'email': 'foo@bar.com', // this field will be deprecated soon
        //         'data': {
        //             'action': 'cancel',
        //             'coid': 'gaSRTi3o3Yo4PaXpVK0NSLP47vmJuLea',
        //             'success': True,
        //         }
        //     }
        //
        const order = this.safeValue (response, 'data', {});
        return this.parseOrder (order);
    }

    async cancelAllOrders (symbol = undefined, params = {}) {
        const request = {
            // 'side': 'buy', // optional string field (case-insensitive), either "buy" or "sell"
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id']; // optional
        }
        const response = await this.privateDeleteOrderAll (this.extend (request, params));
        //
        //     ?
        //
        return response;
    }

    coid () {
        const uuid = this.uuid ();
        const parts = uuid.split ('-');
        const clientOrderId = parts.join ('');
        const coid = clientOrderId.slice (0, 32);
        return coid;
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.version;
        // fix sign params
        if (this.options['accountGroup'] !== -1 && api === 'private') {
            url = url.replace ('/api/', '/' + this.number_to_string (this.options['accountGroup']) + '/api/');
        }
        url += '/' + this.implodeParams (path, params);
        // fix sign error
        path = path.replace ('/{coid}', '');
        url = url.replace ('v1/order/history', 'v2/order/history');
        let timestamp = this.nonce ();
        if (api === 'private') {
            this.checkRequiredCredentials ();
            let coid = this.coid ();
            if ('coid' in params) {
                coid = params['coid'];
            }
            if ('time' in params) {
                timestamp = params['time'];
            }
            timestamp = this.number_to_string (timestamp);
            let query = timestamp + '+' + path;
            if (method !== 'GET') {
                query += '+' + coid;
            }
            const signature = this.hmac (this.encode (query), this.encode (this.secret), 'sha256', 'base64');
            headers = {
                'x-auth-key': this.apiKey,
                'x-auth-signature': signature,
                'x-auth-timestamp': timestamp,
                'Content-Type': 'application/json',
            };
            if (method !== 'GET') {
                headers['x-auth-coid'] = coid;
                body = this.json (params);
            }
        } else {
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return; // fallback to default error handler
        }
        //
        //     {"code":2100,"message":"ApiKeyFailure"}
        //     {'code': 6010, 'message': 'Not enough balance.'}
        //     {'code': 60060, 'message': 'The order is already filled or canceled.'}
        //
        const code = this.safeString (response, 'code');
        const message = this.safeString (response, 'message');
        if ((code !== undefined) || (message !== undefined)) {
            const feedback = this.id + ' ' + body;
            const exact = this.exceptions['exact'];
            if (code in exact) {
                throw new exact[code] (feedback);
            }
            if (message in exact) {
                throw new exact[message] (feedback);
            }
            const broad = this.exceptions['broad'];
            const broadKey = this.findBroadlyMatchedKey (broad, message);
            if (broadKey !== undefined) {
                throw new broad[broadKey] (feedback);
            }
            throw new ExchangeError (feedback); // unknown message
        }
    }
};
