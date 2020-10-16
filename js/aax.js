'use strict';

const Exchange = require ('./base/Exchange');
const { ExchangeError, PermissionDenied, InsufficientFunds, InvalidOrder, BadRequest, CancelPending, AuthenticationError, BadSymbol } = require ('./base/errors');

module.exports = class aax extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'aax',
            'name': 'aax',
            'rateLimit': 500,
            'has': {
                'fetchMarkets': true,
                'fetchOHLCV': true,
                'fetchOrderBook': true,
                'fetchTrades': true,
                'fetchBalance': true,
                'createOrder': true,
                'cancelOrder': true,
                'fetchMyTrades': true,
                'fetchOpenOrders': true,
                'fetchOrders': true,
                'fetchOrder': true,
                'fetchTicker': true,
            },
            'timeframes': {
                '1m': 1,
                '3m': 3,
                '5m': 5,
                '15m': 15,
                '30m': 30,
                '1h': 60,
                '2h': 120,
                '3h': 180,
                '4h': 240,
                '8h': 480,
                '1d': 1440,
            },
            'headers': {
                'Content-Type': 'application/json',
            },
            'urls': {
                'api': 'https://api.aax.com',
                'www': 'https://www.aax.com/',
            },
            'api': {
                'public': {
                    'get': [
                        'v2/instruments',
                        'v2/market/orderbook',
                        'marketdata/v1/getHistMarketData',
                        'v2/market/trades',
                        'v2/market/tickers',
                    ],
                },
                'private': {
                    'get': [
                        'v2/account/balances',
                        'v2/spot/trades',
                        'v2/spot/openOrders',
                        'v2/spot/orders',
                        'v2/user/info',
                    ],
                    'post': [
                        'v2/spot/orders',
                    ],
                    'delete': [
                        'v2/spot/orders/cancel/{orderID}',
                    ],
                },
            },
            'exceptions': {
                '400': BadRequest,
                '401': AuthenticationError,
                '403': AuthenticationError,
                '429': PermissionDenied,
                '10003': BadRequest,
                '10006': AuthenticationError,
                '20001': InsufficientFunds,
                '20009': BadRequest,
                '30004': BadRequest,
                '30005': BadRequest,
                '30006': BadRequest,
                '30007': BadRequest,
                '30008': BadRequest,
                '30009': BadRequest,
                '30011': CancelPending,
                '30012': BadSymbol,
                '30013': BadSymbol,
                '30018': InvalidOrder,
                '30019': InvalidOrder,
                '30020': InvalidOrder,
                '30023': InvalidOrder,
                '30026': InvalidOrder,
                '30027': ExchangeError,
                '30030': InvalidOrder,
                '30047': InvalidOrder,
            },
            'errorMessages': {
                '400': 'There is something wrong with your request',
                '401': 'Your API key is wrong',
                '403': 'Your API key does not have enough privileges to access this resource',
                '429': 'You have exceeded your API key rate limits',
                '500': 'Internal Server Error',
                '503': 'Service is down for maintenance',
                '504': 'Request timeout expired',
                '550': 'You requested data that are not available at this moment',
                '10003': 'Parameter validation error',
                '10006': 'Session expired, please relogin',
                '20001': 'Insufficient balance. Please deposit to trade',
                '20009': 'Order amount must be positive',
                '30004': 'Minimum quantity is {0}',
                '30005': 'Quantity maximum precision is {0} decimal places',
                '30006': 'Price maximum precision is {0} decimal places',
                '30007': 'Minimum price is {0}',
                '30008': 'Stop price maximum precision is {0} decimal places',
                '30009': 'Stop Price cannot be less than {0}',
                '30011': 'The order is being cancelled, please wait',
                '30012': 'Unknown currency',
                '30013': 'Unknown symbol',
                '30018': 'Order price cannot be greater than {0}',
                '30019': 'Order quantity cannot be greater than {0}',
                '30020': 'Order price must be a multiple of {0}',
                '30023': 'Order failed, please try again',
                '30026': 'Quantity is not a multiple of {0}',
                '30027': 'Close position failed, it is recommended that you cancel the current order and then close the position',
                '30028': 'Symbol cannot be traded at this time',
                '30030': 'Price cannot be specified for market orders',
                '30037': 'Once stop limit order triggered, stop price cannot be amended',
                '30040': 'Order status has changed, please try again later',
                '30047': 'The order is closed. Can nott cancel',
                '30049': 'The order is being modified, please wait',
                '40009': 'Too many requests',
                '50001': 'Server side exception, please try again later',
                '50002': 'Server is busy, please try again later',
            },
        });
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'];
        let queryParams = '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (api === 'public' || method === 'GET') {
            if (Object.keys (query).length) {
                queryParams += '?' + this.urlencode (query);
            }
        }
        if (api === 'private') {
            const nonce = this.milliseconds ().toString ();
            let signature = nonce + ':' + method + queryParams;
            if (method !== 'GET' && method !== 'HEAD') {
                body = this.json (query);
                signature += body;
            }
            const encodedHEX = this.hmac (this.encode (signature), this.encode (this.secret), 'sha256');
            headers = {
                'X-ACCESS-KEY': this.apiKey,
                'X-ACCESS-NONCE': nonce,
                'X-ACCESS-SIGN': encodedHEX,
            };
        }
        url += queryParams;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetV2Instruments ();
        // Exchange Response
        // {
        //     "code":1,
        //     "data":[
        //        {
        //           "tickSize":"0.1",
        //           "lotSize":"0.0001",
        //           "base":"BTC",
        //           "quote":"USDT",
        //           "minQuantity":"0.0010000000",
        //           "maxQuantity":"999900.0000000000",
        //           "minPrice":"0.1000000000",
        //           "maxPrice":"10000000.0000000000",
        //           "status":"enable",
        //           "symbol":"BTCUSDT",
        //           "code":null,
        //           "takerFee":"0.00000",
        //           "makerFee":"0.00000",
        //           "multiplier":"1.000000000000",
        //           "mmRate":"0.02500",
        //           "imRate":"0.05000",
        //           "type":"spot"
        //        },
        //        ...
        //     ],
        //     "message":"success",
        //     "ts":1573561743499
        //  }
        const result = [];
        const markets = this.safeValue (response, 'data');
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const code = this.safeString (market, 'code');
            if ((code && code.toUpperCase () === 'FP')) {
                continue;
            }
            const id = this.safeString (market, 'symbol');
            const baseId = this.safeString (market, 'base');
            const quoteId = this.safeString (market, 'quote');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = baseId + '/' + quoteId;
            const status = this.safeString (market, 'status');
            let active = undefined;
            if (status !== undefined) {
                active = (status.toUpperCase () === 'ENABLE');
            }
            const precision = {
                'price': this.precisionFromString (market['tickSize']),
                'amount': this.precisionFromString (market['lotSize']),
            };
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
                'type': this.safeString (market, 'type'),
                'taker': this.safeFloat (market, 'takerFee'),
                'maker': this.safeFloat (market, 'makerFee'),
                'limits': {
                    'amount': {
                        'min': this.safeFloat (market, 'minQuantity'),
                        'max': this.safeFloat (market, 'maxQuantity'),
                    },
                    'price': {
                        'min': this.safeFloat (market, 'minPrice'),
                        'max': this.safeFloat (market, 'maxPrice'),
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
            };
            result.push (entry);
        }
        return result;
    }

    async fetchOHLCV (symbol = 'BTC/USDT', timeframe = '1m', since = undefined, limit = 30, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'date_scale': this.timeframes[timeframe],
            'base': market['base'],
            'quote': market['quote'],
            'limit': limit,
        };
        if (since !== undefined) {
            request['from'] = since;
        }
        if ('to' in params) {
            request['to'] = params['to'];
        }
        const response = await this.publicGetMarketdataV1GetHistMarketData (this.extend (request, params));
        const result = [];
        if ('s' in response && response['s'] === 'ok') {
            const timeArr = response['t'];
            const openArr = response['o'];
            const highArr = response['h'];
            const lowArr = response['l'];
            const closeArr = response['c'];
            const volumeArr = response['v'];
            let prevOpenTime = undefined;
            for (let i = 0; i < timeArr.length; i++) {
                const openTime = (parseInt (timeArr[i]) * 1000);
                if (openTime !== prevOpenTime) {
                    const ohlcvArr = [];
                    ohlcvArr.push (openTime);
                    ohlcvArr.push (openArr[i]);
                    ohlcvArr.push (highArr[i]);
                    ohlcvArr.push (lowArr[i]);
                    ohlcvArr.push (closeArr[i]);
                    ohlcvArr.push (volumeArr[i] / closeArr[i]);
                    result.push (ohlcvArr);
                    prevOpenTime = openTime;
                }
            }
        }
        return this.parseOHLCVs (result, market, timeframe, since, limit);
    }

    parseTicker (ticker, market = undefined, time = undefined) {
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const timestamp = time;
        const open = this.safeFloat (ticker, 'o');
        const last = this.safeFloat (ticker, 'c');
        let change = undefined;
        let percentage = undefined;
        let average = undefined;
        if (last !== undefined && open !== undefined) {
            change = last - open;
            average = this.sum (last, open) / 2;
            if (open > 0) {
                percentage = change / open * 100;
            }
        }
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'h'),
            'low': this.safeFloat (ticker, 'l'),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': open,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': change,
            'percentage': percentage,
            'average': average,
            'baseVolume': undefined,
            'quoteVolume': this.safeFloat (ticker, 'v'),
            'info': ticker,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const response = await this.publicGetV2MarketTickers (this.extend (params));
        const result = this.safeValue (response, 'tickers', []);
        const pair = market['id'];
        for (let i = 0; i < result.length; i++) {
            const ticker = result[i];
            if (pair === ticker['s']) {
                return this.parseTicker (ticker, market, this.safeInteger (response, 't'));
            }
        }
        return null;
    }

    async fetchOrderBook (symbol = 'BTC/USDT', limit = 50, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'level': limit,
        };
        const response = await this.publicGetV2MarketOrderbook (this.extend (request, params));
        // Response Format
        // {
        //     "asks":[
        //        [
        //           "10823.00000000", #price
        //           "0.004000"  #size
        //        ],
        //        [
        //           "10823.10000000",
        //           "0.100000"
        //        ],
        //        [
        //           "10823.20000000",
        //           "0.010000"
        //        ]
        //     ],
        //     "bids":[
        //        [
        //           "10821.20000000",
        //           "0.002000"
        //        ],
        //        [
        //           "10821.10000000",
        //           "0.005000"
        //        ],
        //        [
        //           "10820.40000000",
        //           "0.013000"
        //        ]
        //     ],
        //     "e":"BTCUSDT@book_50",
        //     "t":1561543614756
        //  }
        const timestamp = this.safeInteger (response, 't').toString ();
        return this.parseOrderBook (response, timestamp);
    }

    parseTrade (trade, market = undefined) {
        // From FetchTrades
        //   {
        //     "e":"BTCUSDFP@trades",
        //     "trades":
        //         [ { "p":"9395.50000000",
        //            "q":"50.000000",
        //            "t":1592563996718
        //          },
        //         {  "p":"9395.50000000",
        //            "q":"50.000000",
        //            "t":1592563993577
        //         }]
        //   }
        // Response From FetchMyTrdaes
        // {
        //        [
        //           {
        //              "avgPrice":"8000",
        //              "base":"BTC",
        //              "commission":"0.00000888",
        //              "createTime":"2019-11-12T03:18:35Z",
        //              "cumQty":"0.0148",
        //              "filledPrice":"8000",
        //              "filledQty":"0.0148",
        //              "leavesQty":"0.0052",
        //              "orderID":"wFo9ZPxAJ",
        //              "orderQty":"0.02",
        //              "orderStatus":2,
        //              "orderType":2,
        //              "price":"8000",
        //              "quote":"USDT",
        //              "rejectCode":0,
        //              "rejectReason":null,
        //              "side":1,
        //              "stopPrice":"0",
        //              "symbol":"BTCUSDT",
        //              "taker":false,
        //              "transactTime":"2019-11-12T03:16:16Z",
        //              "updateTime":null,
        //              "userID":"216214"
        //           }
        //        ],
        //  }
        let timestamp = this.safeString (trade, 't');
        if (timestamp === undefined) {
            timestamp = this.safeString (trade, 'createTime');
            if (timestamp !== undefined) {
                timestamp = this.parse8601 (timestamp);
            }
        }
        let symbol = undefined;
        if (market !== undefined) {
            symbol = this.safeString (market, 'symbol');
        }
        if (symbol === undefined) {
            const base = this.safeString (trade, 'base');
            const quote = this.safeString (trade, 'quote');
            if (base !== undefined && quote !== undefined) {
                symbol = base + '/' + quote;
            }
        }
        let price = this.safeFloat2 (trade, 'p', 'avgPrice');
        const amount = this.safeFloat2 (trade, 'q', 'orderQty');
        const sideType = this.safeInteger (trade, 'side');
        let side = undefined;
        if (sideType !== undefined) {
            if (sideType === 1) {
                side = 'BUY';
            }
            if (sideType === 2) {
                side = 'SELL';
            }
        }
        if (side === undefined) {
            if (price < 0) {
                side = 'SELL';
            } else {
                side = 'BUY';
            }
            price = Math.abs (price);
        }
        let cost = undefined;
        if (price !== undefined && amount !== undefined && symbol !== undefined) {
            cost = parseFloat (this.costToPrecision (symbol, price * amount));
        }
        let takerOrMaker = undefined;
        if ('taker' in trade) {
            takerOrMaker = trade['taker'] ? 'taker' : 'maker';
        }
        const orderId = this.safeString (trade, 'orderID');
        return {
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': orderId,
            'order': orderId,
            'type': undefined,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': this.safeString (trade, 'commission'),
        };
    }

    async fetchTrades (symbol, since = undefined, limit = 2000, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'limit': limit,
        };
        const response = await this.publicGetV2MarketTrades (this.extend (request, params));
        // Response Received
        // {
        //     "e":"BTCUSDFP@trades",
        //     "trades":
        //         [ { "p":"9395.50000000",
        //            "q":"50.000000",
        //            "t":1592563996718
        //          },
        //         {  "p":"9395.50000000",
        //            "q":"50.000000",
        //            "t":1592563993577
        //         }]
        //   }
        return this.parseTrades (this.safeValue (response, 'trades'), market, since, limit);
    }

    async fetchBalance (params = {}) {
        const request = {
            'purseType': 'SPTP', // spot only for now
        };
        const response = await this.privateGetV2AccountBalances (this.extend (request, params));
        // FetchBalance Response
        //    {
        //      "code":1,
        //      "data":[
        //      {
        //        "purseType":"FUTP",
        //        "currency":"BTC",
        //        "available":"0.41000000",
        //        "unavailable":"0.00000000"
        //      },
        //      {
        //        "purseType":"FUTP",
        //        "currency":"USDT",
        //        "available":"0.21000000",
        //        "unvaliable":"0.00000000"
        //      }
        //    ]
        //      "message":"success",
        //      "ts":1573530401020
        //    }
        const result = { 'info': response };
        const balances = this.safeValue (response, 'data');
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const currencyId = this.safeString (balance, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const account = {
                'free': this.safeFloat (balance, 'available'),
                'used': this.safeFloat (balance, 'unavailable'),
            };
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    parseOrderType (type) {
        const orderTypes = {
            '1': 'market',
            '2': 'limit',
            '3': 'stop',
            '4': 'stop-limit',
        };
        return this.safeString (orderTypes, type, type);
    }

    parseOrderStatus (status) {
        const statuses = {
            '0': 'open', // pending-new
            '1': 'open', // new
            '2': 'open', // partiallyfilled
            '3': 'closed', // filled
            '4': 'canceled', // cancel - rejected
            '5': 'canceled', // canceled
            '6': 'rejected', // rejected
            '10': 'canceled', // canceled
            '11': 'rejected', // business-rejct
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined, time = undefined) {
        // CraeteOrder,cancelOrder Response
        //       {
        //        "avgPrice":"0",
        //        "base":"BTC",
        //        "clOrdID":"aax",
        //        "commission":"0",
        //        "createTime":null,
        //        "cumQty":"0",
        //        "id":null,
        //        "isTriggered":null,
        //        "lastPrice":"0",
        //        "lastQty":"0",
        //        "leavesQty":"0",
        //        "orderID":"wJ4L366KB",
        //        "orderQty":"0.02",
        //        "orderStatus":0,
        //        "orderType":2,
        //        "price":"8000",
        //        "quote":"USDT",
        //        "rejectCode":null,
        //        "rejectReason":null,
        //        "side":1,
        //        "stopPrice":null,
        //        "symbol":"BTCUSDT",
        //        "transactTime":null,
        //        "updateTime":null,
        //        "timeInForce":1,
        //        "userID":"216214"
        //     },
        let timestamp = this.safeString (order, 'createTime');
        if (timestamp === undefined && time !== undefined) {
            timestamp = time;
        } else {
            if (timestamp.length !== 13) {
                timestamp = this.parse8601 (timestamp);
            } else {
                timestamp = parseInt (timestamp);
            }
        }
        const price = this.safeFloat (order, 'price');
        const amount = this.safeFloat (order, 'orderQty');
        let cost = undefined;
        let symbol = undefined;
        if (market !== undefined) {
            symbol = this.safeString (market, 'symbol');
        }
        if (symbol === undefined) {
            const base = this.safeString (order, 'base');
            const quote = this.safeString (order, 'quote');
            if (base !== undefined && quote !== undefined) {
                symbol = base + '/' + quote;
            }
        }
        if (price !== undefined && amount !== undefined && symbol !== undefined) {
            cost = parseFloat (this.costToPrecision (symbol, price * amount));
        }
        const sideType = this.safeInteger (order, 'side');
        let side = undefined;
        if (sideType !== undefined) {
            if (sideType === 1) {
                side = 'BUY';
            }
            if (sideType === 2) {
                side = 'SELL';
            }
        }
        const remaining = this.safeFloat (order, 'leavesQty');
        let filled = undefined;
        if (remaining !== undefined && amount !== undefined) {
            filled = amount - remaining;
        }
        const orderType = this.parseOrderType (this.safeString (order, 'orderType'));
        const status = this.parseOrderStatus (this.safeString (order, 'orderStatus'));
        return {
            'info': order,
            'id': this.safeString (order, 'orderID'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': orderType,
            'side': side,
            'price': price,
            'stop_price': this.safeString (order, 'stopPrice'),
            'amount': amount,
            'cost': cost,
            'average': this.safeFloat (order, 'avgPrice'),
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': this.safeString (order, 'commission'),
            'trades': undefined,
        };
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        type = type.toUpperCase ();
        if (type === 'STOP_LIMIT') {
            type = 'STOP-LIMIT';
        }
        const request = {
            // === Required ===
            // orderType : string // can be MARKET,LIMIT,STOP,STOP-LIMIT
            // symbol : string
            // orderQty : string // Buying or selling quantity
            // side : string // BUY or SELL
            // === Required according to ordeType ===
            // price : string // limit price in limit and stop-limit orders
            // stopPrice : string // Trigger price for stop-limit order and stop order
            // ===Optional ===
            // clOrdID : string
            // timeInForce :string // GTC/IOC/FOK，default is GTC
            'orderType': type,
            'symbol': market['id'],
            'orderQty': this.amountToPrecision (symbol, amount),
            'side': side.toUpperCase (),
        };
        if ((type === 'LIMIT') || (type === 'STOP-LIMIT')) {
            if (price === undefined) {
                throw new InvalidOrder (this.id + ' createOrder method requires a price for a ' + type + ' order');
            }
            request['price'] = this.priceToPrecision (symbol, price);
        }
        if ((type === 'STOP') || (type === 'STOP-LIMIT')) {
            const stopPrice = this.safeFloat (params, 'stopPrice');
            if (stopPrice === undefined) {
                throw new InvalidOrder (this.id + ' createOrder method requires a stopPrice extra param for a ' + type + ' order');
            }
            request['stopPrice'] = this.priceToPrecision (symbol, stopPrice);
        }
        const response = await this.privatePostV2SpotOrders (this.extend (request, params));
        // Response
        // {
        //     "code":1,
        //     "data":{
        //        "avgPrice":"0",
        //        "base":"BTC",
        //        "clOrdID":"aax",
        //        "commission":"0",
        //        "createTime":null,
        //        "cumQty":"0",
        //        "id":null,
        //        "isTriggered":null,
        //        "lastPrice":"0",
        //        "lastQty":"0",
        //        "leavesQty":"0",
        //        "orderID":"wJ4L366KB",
        //        "orderQty":"0.02",
        //        "orderStatus":0,
        //        "orderType":2,
        //        "price":"8000",
        //        "quote":"USDT",
        //        "rejectCode":null,
        //        "rejectReason":null,
        //        "side":1,
        //        "stopPrice":null,
        //        "symbol":"BTCUSDT",
        //        "transactTime":null,
        //        "updateTime":null,
        //        "timeInForce":1,
        //        "userID":"216214"
        //     },
        //     "message":"success",
        //     "ts":1573530401264
        //  }
        return this.parseOrder (this.safeValue (response, 'data'), market, this.safeString (response, 'ts'));
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            await this.loadMarkets ();
            market = this.market (symbol);
        }
        const request = {
            'orderID': id,
        };
        const response = await this.privateDeleteV2SpotOrdersCancelOrderID (this.extend (request, params));
        // Response
        // {
        //     "code":1,
        //     "data":{
        //        "avgPrice":"0",
        //        "base":"BTC",
        //        "clOrdID":"aax",
        //        "commission":"0",
        //        "createTime":"2019-11-12T03:46:41Z",
        //        "cumQty":"0",
        //        "id":"114330021504606208",
        //        "isTriggered":false,
        //        "lastPrice":"0",
        //        "lastQty":"0",
        //        "leavesQty":"0",
        //        "orderID":"wJ4L366KB",
        //        "orderQty":"0.05",
        //        "orderStatus":1,
        //        "orderType":2,
        //        "price":"8000",
        //        "quote":"USDT",
        //        "rejectCode":0,
        //        "rejectReason":null,
        //        "side":1,
        //        "stopPrice":"0",
        //        "symbol":"BTCUSDT",
        //        "transactTime":null,
        //        "updateTime":"2019-11-12T03:46:41Z",
        //        "timeInForce":1,
        //        "userID":"216214"
        //     },
        //     "message":"success",
        //     "ts":1573530402029
        //  }
        return this.parseOrder (this.safeValue (response, 'data'), market, this.safeString (response, 'ts'));
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            // pageNum : Integer // optional
            // pageSize : Integer // optional
            // base : String // optional
            // quote : String // optional
            // orderId : String //optional
            // startDate : String //optional
            // endDate : String //optional
            // side : String // optional
            // orderType : String // optional
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['base'] = market['baseId'];
            request['quote'] = market['quoteId'];
        }
        if (since !== undefined) {
            request['startDate'] = this.ymd (since, '-');
        }
        if (limit !== undefined) {
            request['pageSize'] = limit;
        }
        const response = await this.privateGetV2SpotTrades (this.extend (request, params));
        // Response
        // {
        //     "code":1,
        //     "data":{
        //        "list":[
        //           {
        //              "avgPrice":"8000",
        //              "base":"BTC",
        //              "commission":"0.00000888",
        //              "createTime":"2019-11-12T03:18:35Z",
        //              "cumQty":"0.0148",
        //              "filledPrice":"8000",
        //              "filledQty":"0.0148",
        //              "id":"114322949580906499",
        //              "leavesQty":"0.0052",
        //              "orderID":"wFo9ZPxAJ",
        //              "orderQty":"0.02",
        //              "orderStatus":2,
        //              "orderType":2,
        //              "price":"8000",
        //              "quote":"USDT",
        //              "rejectCode":0,
        //              "rejectReason":null,
        //              "side":1,
        //              "stopPrice":"0",
        //              "symbol":"BTCUSDT",
        //              "taker":false,
        //              "transactTime":"2019-11-12T03:16:16Z",
        //              "updateTime":null,
        //              "userID":"216214"
        //           }
        //        ],
        //        "pageNum":1,
        //        "pageSize":1,
        //        "total":10
        //     },
        //     "message":"success",
        //     "ts":1573532934832
        //  }
        const result = this.safeValue (response, 'data');
        return this.parseTrades (this.safeValue (result, 'list', []), market, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            // pageNum : Integer // optional
            // pageSize : Integer // optional
            // symbol : String // optional
            // orderId : String // optional
            // side : String // optional
            // orderType : String // optional
            // clOrdID : String //optional
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (limit !== undefined) {
            request['pageSize'] = limit;
        }
        const response = await this.privateGetV2SpotOpenOrders (this.extend (request, params));
        // Response
        // {
        //     "code":1,
        //     "data":{
        //        "list":[
        //           {
        //              "avgPrice":"0",
        //              "base":"BTC",
        //              "clOrdID":"aax",
        //              "commission":"0",
        //              "createTime":"2019-11-12T03:41:52Z",
        //              "cumQty":"0",
        //              "id":"114328808516083712",
        //              "isTriggered":false,
        //              "lastPrice":"0",
        //              "lastQty":"0",
        //              "leavesQty":"0",
        //              "orderID":"wJ3qitASB",
        //              "orderQty":"0.02",
        //              "orderStatus":1,
        //              "orderType":2,
        //              "price":"8000",
        //              "quote":"USDT",
        //              "rejectCode":0,
        //              "rejectReason":null,
        //              "side":1,
        //              "stopPrice":"0",
        //              "symbol":"BTCUSDT",
        //              "transactTime":null,
        //              "updateTime":"2019-11-12T03:41:52Z",
        //              "timeInForce":1,
        //              "userID":"216214"
        //           },
        //           ...
        //        ],
        //        "pageNum":1,
        //        "pageSize":2,
        //        "total":2
        //     },
        //     "message":"success",
        //     "ts":1573553718212
        //  }
        const result = this.safeValue (response, 'data');
        return this.parseOrders (this.safeValue (result, 'list', []), market, since, limit);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = 100, params = {}) {
        await this.loadMarkets ();
        const request = {
            // pageNum : Integer // optional
            // pageSize : Integer // optional
            // symbol : String // optional
            // orderId : String // optional
            // side : String // optional
            // orderType : String // optional
            // clOrdID : String //optional
            // base : string // optional
            // quote :string // optional
            // orderStatus : Integer //optional 1: new, 2:filled, 3:cancel
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['base'] = market['baseId'];
            request['quote'] = market['quoteId'];
        }
        if (limit !== undefined) {
            request['pageSize'] = limit;
        }
        const response = await this.privateGetV2SpotOrders (this.extend (request, params));
        const result = this.safeValue (response, 'data');
        return this.parseOrders (this.safeValue (result, 'list', []), market, since, limit);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'orderID': id,
        };
        const response = await this.privateGetV2SpotOrders (this.extend (request, params));
        const result = this.safeValue (response, 'data');
        const list = this.safeValue (result, 'list', []);
        return this.parseOrder (list[0]);
    }

    async fetchUserId () {
        const response = await this.privateGetV2UserInfo ();
        const result = this.safeValue (response, 'data');
        return this.safeValue (result, 'userID');
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return;
        }
        const errorCode = this.safeString (response, 'code');
        if (errorCode === undefined) {
            // fetchOrderBook or fetchTrades or fetchOhlcv
            return;
        }
        if (errorCode === '1') {
            // success
            return;
        }
        const errorMessages = this.errorMessages;
        let message = undefined;
        message = this.safeString (response, 'message');
        if (message === undefined) {
            message = this.safeString (errorMessages, errorCode, 'Unknown Error');
        }
        const feedback = this.id + ' ' + message;
        this.throwExactlyMatchedException (this.exceptions, errorCode, feedback);
        throw new ExchangeError (feedback);
    }
};
