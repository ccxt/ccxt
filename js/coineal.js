'use strict';

const Exchange = require ('./base/Exchange');
const { ExchangeError, InsufficientFunds, InvalidOrder, BadRequest, ArgumentsRequired, AuthenticationError, OrderNotFound, BadSymbol } = require ('./base/errors');

module.exports = class coineal extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'coineal',
            'name': 'Coineal',
            'countries': [],
            'rateLimit': 1000,
            'has': {
                'fetchMarkets': true,
                'fetchOHLCV': true,
                'fetchOrderBook': true,
                'fetchTrades': true,
                'createOrder': true,
                'cancelOrder': true,
                'fetchMyTrades': true,
                'fetchOpenOrders': true,
                'fetchBalance': true,
                'fetchOrder': true,
                'fetchClosedOrders': true,
                'fetchTicker': true,
                'fetchOrders': true,
            },
            'timeframes': {
                '1m': '1', // default
                '5m': '5',
                '15m': '15',
                '30m': '30',
                '1h': '60',
                '1d': '1440',
            },
            'urls': {
                'api': {
                    'public': 'https://exchange-open-api.coineal.com',
                    'private': 'https://exchange-open-api.coineal.com',
                },
                'www': 'https://exchange-open-api.coineal.com',
            },
            'api': {
                'public': {
                    'get': [
                        'open/api/common/symbols',
                        'open/api/get_records',
                        'open/api/market_dept',
                        'open/api/get_trades',
                        'open/api/get_ticker',
                    ],
                },
                'private': {
                    'get': [
                        'open/api/all_trade',
                        'open/api/new_order',
                        'open/api/all_order',
                        'open/api/user/account',
                        'open/api/order_info',
                    ],
                    'post': [
                        'open/api/create_order',
                        'open/api/cancel_order',
                    ],
                },
            },
            'exceptions': {
                '5': InvalidOrder,
                '6': InvalidOrder,
                '7': InvalidOrder,
                '8': InvalidOrder,
                '19': InsufficientFunds,
                '22': OrderNotFound,
                '23': ArgumentsRequired,
                '24': ArgumentsRequired,
                '25': InvalidOrder,
                '501': InvalidOrder,
                '100004': BadRequest,
                '100005': BadRequest,
                '100007': AuthenticationError,
                '110002': BadSymbol,
                '110005': InsufficientFunds,
                '110032': AuthenticationError,
            },
            'errorMessages': {
                '5': 'Order Failed',
                '6': 'Exceed the minimum volume requirement',
                '7': 'Exceed the maximum volume requirement',
                '8': 'Order cancellation failed',
                '9': 'The transaction is frozen',
                '13': 'Sorry, the program has a system error, please contact the webmaster',
                '19': 'Insufficient balance available',
                '22': 'Order does not exist',
                '23': 'Missing transaction quantity parameter',
                '24': 'Missing transaction price parameter',
                '25': 'Quantity Precision Error',
                '501': 'Bid price cannot be lower than 10% of the latest price',
                '100001': 'System error',
                '100002': 'System upgrade',
                '100004': 'Parameter request is invalid',
                '100005': 'Parameter signature error',
                '100007': 'Unathorized IP',
                '110002': 'Unknown currency code',
                '110005': 'Insufficient balance available',
                '110025': 'Account locked by background administrator',
                '110032': 'This user is not athorized to do this',
            },
        });
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api];
        url += '/' + path;
        const query = this.omit (params, this.extractParams (path));
        if (api === 'private') {
            let content = '';
            query['api_key'] = this.apiKey;
            const sortedParams = this.keysort (query);
            const keys = Object.keys (sortedParams);
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                content += key + sortedParams[key].toString ();
            }
            const signature = content + this.secret;
            const hash = this.hash (this.encode (signature), 'md5');
            query['sign'] = hash;
            if (method === 'POST') {
                headers = {
                    'Content-Type': 'application/x-www-form-urlencoded',
                };
            }
        }
        if (Object.keys (query).length) {
            url += '?' + this.urlencode (query);
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetOpenApiCommonSymbols ();
        // Exchange response
        // {
        //     "code": "0",
        //     "msg": "suc",
        //     "data": [
        //         {
        //             "symbol": "btcusdt",
        //             "count_coin": "usdt",
        //             "amount_precision": 5,
        //             "base_coin": "btc",
        //             "price_precision": 2
        //         }
        //     ]
        // }
        const result = [];
        const markets = this.safeValue (response, 'data');
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString (market, 'symbol');
            const baseId = this.safeString (market, 'base_coin');
            const quoteId = this.safeString (market, 'count_coin');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const precision = {
                'amount': this.safeInteger (market, 'amount_precision'),
                'price': this.safeInteger (market, 'price_precision'),
            };
            const active = true;
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
                        'min': Math.pow (10, -precision['amount']),
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
            };
            result.push (entry);
        }
        return result;
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        return [
            ohlcv[0] * 1000,
            parseFloat (ohlcv[1]),
            parseFloat (ohlcv[2]),
            parseFloat (ohlcv[3]),
            parseFloat (ohlcv[4]),
            parseFloat (ohlcv[5]),
        ];
    }

    async fetchOHLCV (symbol = 'BTC/USDT', timeframe = '1m', params = {}, since = undefined, limit = undefined) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'period': this.timeframes[timeframe],
        };
        const response = await this.publicGetOpenApiGetRecords (this.extend (request, params));
        // Exchange response
        // {
        //     'code': '0',
        //     'msg': 'suc',
        //     'data': [
        //                 [
        //                     1529387760,  //Time Stamp
        //                     7585.41,  //Opening Price
        //                     7585.41,  //Highest Price
        //                     7585.41,  //Lowest Price
        //                     7585.41,  //Closing Price
        //                     0.0       //Transaction Volume
        //                 ]
        //             ]
        // }
        return this.parseOHLCVs (this.safeValue (response, 'data'), market, timeframe, since, limit);
    }

    async fetchOrderBook (symbol = 'BTC/USDT', limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'type': 'step0',
        };
        const response = await this.publicGetOpenApiMarketDept (this.extend (request, params));
        // Exchange response
        // {
        //     "code": "0",
        //     "msg": "suc",
        //     "data": {
        //         "tick": {
        //             "time": 1529408112000,  //Refresh time of depth
        //             "asks": //Ask orders
        //             [
        //                 [
        //                     "6753.31", //Price of Ask 1
        //                     0.00306    //Order Size of Ask 1
        //                 ],
        //                 [
        //                     "6754.78", //Price of Ask 2
        //                     0.61112   //Order Size of Ask 2
        //                 ]
        //                 ...
        //             ],
        //             "bids": //Ask orders
        //             [
        //                 [
        //                     "6732.02",  //Price of Bid 1
        //                     0.18444     //Order Size of Bid 1
        //                 ],
        //                 [
        //                     "6730.08", //Price of Bid 2
        //                     0.14662    //Order Size of Bid 2
        //                 ]
        //                 ...
        //             ]
        //         }
        const data = this.safeValue (response, 'data');
        const detailData = this.safeValue (data, 'tick');
        return this.parseOrderBook (detailData, this.safeValue (detailData, 'time'));
    }

    parseTicker (ticker, market = undefined) {
        const timestamp = this.safeInteger (ticker, 'time');
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const last = this.safeFloat (ticker, 'last');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': this.safeString (ticker, 'buy'),
            'bidVolume': undefined,
            'ask': this.safeString (ticker, 'sell'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'vol'),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicGetOpenApiGetTicker (this.extend (request));
        // {
        //     "code": "0",
        //     "msg": "suc",
        //     "data": {
        //         "high": 6796.63,
        //         "vol": 2364.85442742,
        //         "last": 6722.37,
        //         "low": 6399.28,
        //         "buy": "6721.56",
        //         "sell": "6747.47",
        //         "time": 1529406706715
        //     }
        // }
        const result = this.safeValue (response, 'data');
        return this.parseTicker (result, market);
    }

    parseTrade (trade, market = undefined) {
        // Fetch Trades Object When Symbol is Undefined
        //             {
        //                 "volume": "1.000",
        //                 "side": "BUY",
        //                 "price": "0.10000000",
        //                 "fee": "0.16431104",
        //                 "ctime": 1510996571195,
        //                 "deal_price": "0.10000000",
        //                 "id": 306,
        //                 "type": "买入",
        //                 "market": "marketObj"
        //             }
        // Fetch My Trades Object
        //             {
        //                 "volume": "1.000",
        //                 "side": "BUY",
        //                 "price": "0.10000000",
        //                 "fee": "0.16431104",
        //                 "ctime": 1510996571195,
        //                 "deal_price": "0.10000000",
        //                 "id": 306,
        //                 "type": "买入"
        //             }
        // Fetch Trades Object
        //         {
        //             "amount": 0.99583,
        //             "trade_time": 1529408112000,
        //             "price": 6763.9,
        //             "id": 280101,
        //             "type": "sell"
        //         }
        let timestamp = this.safeString (trade, 'trade_time');
        if (timestamp === undefined) {
            timestamp = this.safeString (trade, 'ctime');
        }
        const price = this.safeFloat (trade, 'price');
        let amount = this.safeFloat (trade, 'amount');
        if (amount === undefined) {
            amount = this.safeFloat (trade, 'volume');
        }
        let symbol = undefined;
        if (market === undefined) {
            market = this.safeValue (trade, 'market');
        }
        if (market !== undefined) {
            symbol = this.safeString (market, 'symbol');
        }
        let cost = undefined;
        if (price !== undefined) {
            if (amount !== undefined) {
                if (symbol !== undefined) {
                    cost = parseFloat (this.costToPrecision (symbol, price * amount));
                }
            }
        }
        let side = this.safeString (trade, 'side');
        if (side === undefined) {
            side = this.safeString (trade, 'type');
        }
        const transactionId = this.safeString (trade, 'id');
        let orderId = undefined;
        if (side !== undefined) {
            if (side.toUpperCase () === 'BUY') {
                orderId = this.safeString (trade, 'bid_id');
            }
            if (side.toUpperCase () === 'SELL') {
                orderId = this.safeString (trade, 'ask_id');
            }
        }
        if (orderId === undefined) {
            orderId = this.safeString (trade, 'id');
        }
        const feecost = this.safeFloat (trade, 'fee');
        let fee = undefined;
        if (feecost !== undefined) {
            fee = {
                'cost': feecost,
                'currency': this.safeString (trade, 'feeCoin'),
            };
        }
        return {
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': transactionId,
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

    async fetchTrades (symbol = 'BTC/USDT', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicGetOpenApiGetTrades (this.extend (request, params));
        // Exchange response
        // {
        //     "code": "0",
        //     "msg": "suc",
        //     "data": [
        //         {
        //             "amount": 0.99583,
        //             "trade_time": 1529408112000,
        //             "price": 6763.9,
        //             "id": 280101,
        //             "type": "sell"
        //         }
        //     ]
        // }
        return this.parseTrades (this.safeValue (response, 'data'), market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'time': this.milliseconds ().toString (),
            'symbol': market['id'],
            'side': side.toUpperCase (),
            'volume': this.amountToPrecision (symbol, amount),
        };
        if (type === 'limit') {
            request['type'] = '1';
            request['price'] = this.priceToPrecision (symbol, price);
        } else {
            request['type'] = '2';
            if (side.toUpperCase () === 'BUY') {
                const currentSymbolDetail = await this.fetchTicker (symbol);
                const currentPrice = this.safeFloat (currentSymbolDetail, 'last');
                if (currentPrice === undefined) {
                    throw new InvalidOrder ('Provide correct Symbol');
                }
                request['volume'] = this.costToPrecision (symbol, parseFloat (amount) * currentPrice);
            }
        }
        const response = await this.privatePostOpenApiCreateOrder (this.extend (request, params));
        // Exchange response
        // {
        //     "code": "0",
        //     "msg": "suc",
        //     "data": {
        //         "order_id": 34343
        //     }
        // }
        const code = this.safeString (response, 'code');
        if (code !== '0') {
            throw new InvalidOrder (response['msg'] + ' ' + this.json (response));
        }
        const result = this.safeValue (response, 'data');
        return await this.fetchOrder (this.safeString (result, 'order_id'), symbol);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' CancelOrder requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'order_id': id,
            'time': this.milliseconds (),
        };
        const response = await this.privatePostOpenApiCancelOrder (this.extend (request, params));
        // Exchange response
        // {
        //     "code": "0",
        //     "msg": "suc",
        //     "data": {}
        // }
        const code = this.safeString (response, 'code');
        if (code !== '0') {
            throw new InvalidOrder (response['msg'] + ' ' + this.json (response));
        }
        return await this.fetchOrder (id, symbol);
    }

    async getTrades (symbol, limit, params) {
        const request = {
            'symbol': symbol,
            'time': this.milliseconds (),
            'page': 1,
            'pageSize': limit,
            'sort': 1,
        };
        const response = await this.privateGetOpenApiAllTrade (this.extend (request, params));
        const result = this.safeValue (response, 'data');
        return this.safeValue (result, 'resultList', []);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = 100, params = {}) {
        await this.loadMarkets ();
        // Exchange response
        // {
        //     "code": "0",
        //     "msg": "suc",
        //     "data": {
        //         "count": 22,
        //         "resultList": [
        //             {
        //                 "volume": "1.000",
        //                 "side": "BUY",
        //                 "price": "0.10000000",
        //                 "fee": "0.16431104",
        //                 "ctime": 1510996571195,
        //                 "deal_price": "0.10000000",
        //                 "id": 306,
        //                 "type": "买入",
        //             }
        //         ]
        //     }
        // }
        if (symbol === undefined) {
            const totalMarkets = Object.keys (this.markets);
            let trades = [];
            for (let i = 0; i < totalMarkets.length; i++) {
                const market = this.market (totalMarkets[i]);
                const result = await this.getTrades (market['id'], limit, params);
                for (let i = 0; i < result.length; i++) {
                    result[i]['market'] = market;
                }
                trades = this.arrayConcat (trades, result);
            }
            return this.parseTrades (trades, undefined, since, trades.length);
        }
        const market = this.market (symbol);
        const result = await this.getTrades (market['id'], limit, params);
        return this.parseTrades (result, market, since, limit);
    }

    parseOrderStatus (status) {
        const statuses = {
            '0': 'Open', // Historical Order Unsuccessful
            '1': 'Open',
            '2': 'Closed',
            '3': 'Open', // Partially Opened
            '4': 'Canceled',
            '5': 'Cancelling',
            '6': 'Abnormal Orders',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        let symbol = undefined;
        const baseId = this.safeString (order, 'baseCoin');
        const quoteId = this.safeString (order, 'countCoin');
        const base = this.safeCurrencyCode (baseId); // unified
        const quote = this.safeCurrencyCode (quoteId);
        if (base !== undefined) {
            if (quote !== undefined) {
                symbol = base + '/' + quote;
            }
        }
        const timestamp = this.safeString (order, 'created_at');
        const filled = this.safeFloat (order, 'deal_volume');
        const remaining = this.safeFloat (order, 'remain_volume');
        let amount = this.safeFloat (order, 'volume');
        if (filled !== undefined) {
            if (remaining !== undefined) {
                amount = this.amountToPrecision (symbol, filled + remaining);
            }
        }
        let id = this.safeString (order, 'order_id');
        if (id === undefined) {
            id = this.safeString (order, 'id');
        }
        const side = this.safeString (order, 'side');
        let cost = undefined;
        let type = undefined;
        const typeId = this.safeInteger (order, 'type');
        if (typeId !== undefined) {
            if (typeId === 1) {
                type = 'limit';
            } else {
                type = 'market';
            }
        }
        let trades = this.safeValue (order, 'tradeList');
        let price = this.safeFloat (order, 'total_price');
        if (type === 'limit') {
            price = this.safeFloat (order, 'price');
        }
        if (trades !== undefined) {
            if (trades.length > 0) {
                price = this.safeFloat (order, 'avg_price');
            }
        }
        if (filled !== undefined) {
            if (price !== undefined) {
                cost = filled * price;
            }
        }
        let fee = undefined;
        const average = this.safeFloat (order, 'avg_price');
        if (trades !== undefined) {
            trades = this.parseTrades (trades, market);
            let feeCost = undefined;
            const numTrades = trades.length;
            for (let i = 0; i < numTrades; i++) {
                if (feeCost === undefined) {
                    feeCost = 0;
                }
                const tradeFee = this.safeFloat (trades[i], 'fee');
                if (tradeFee !== undefined) {
                    feeCost = this.sum (feeCost, tradeFee);
                }
            }
            let feeCurrency = undefined;
            if (market !== undefined) {
                feeCurrency = market['quote'];
            }
            if (feeCost !== undefined) {
                fee = {
                    'cost': feeCost,
                    'currency': feeCurrency,
                };
            }
        }
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
            'trades': trades,
        };
    }

    async fetchCommonOrders (symbol, limit, params) {
        const request = {
            'symbol': symbol,
            'time': this.milliseconds (),
            'page': 1,
            'pageSize': limit,
        };
        const response = await this.privateGetOpenApiAllOrder (this.extend (request, params));
        const result = this.safeValue (response, 'data');
        return this.safeValue (result, 'orderList', []);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = 100, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' FetchOpenOrder requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const orderData = await this.fetchCommonOrders (market['id'], limit, params);
        const closedOrdered = this.filterBy (orderData, 'status', 2);
        return this.parseOrders (closedOrdered, market, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = 100, params = {}) {
        await this.loadMarkets ();
        const symbolsToFetch = (symbol !== undefined) ? [symbol] : this.symbols;
        let ordersData = [];
        for (let i = 0; i < symbolsToFetch.length; i++) {
            const market = this.market (symbolsToFetch[i]);
            const orders = await this.fetchCommonOrders (market['id'], limit, params);
            const openOrders = this.filterByArray (orders, 'status', [0, 1, 3], false);
            ordersData = this.arrayConcat (ordersData, openOrders);
        }
        // Exchange response
        // {
        //     "code": "0",
        //     "msg": "suc",
        //     "data": {
        //       "count": 10,
        //       "resultList": [
        //           {
        //               "side": "BUY",
        //               "total_price": "0.10000000",
        //               "created_at": 1510993841000,
        //               "avg_price": "0.10000000",
        //               "countCoin": "btc",
        //               "source": 1,
        //               "type": 1,
        //               "side_msg": "买入",
        //               "volume": "1.000",
        //               "price": "0.10000000",
        //               "source_msg": "WEB",
        //               "status_msg": "部分成交",
        //               "deal_volume": "0.50000000",
        //               "id": 424,
        //               "remain_volume": "0.00000000",
        //               "baseCoin": "eth",
        //               "tradeList": [
        //                   {
        //                       "volume": "0.500",
        //                       "price": "0.10000000",
        //                       "fee": "0.16431104",
        //                       "ctime": 1510996571195,
        //                       "deal_price": "0.10000000",
        //                       "id": 306,
        //                       "type": "买入"
        //                   }
        //               ],
        //               "status": 3
        //           },
        //           {
        //               "side": "SELL",
        //               "total_price": "0.10000000",
        //               "created_at": 1510993841000,
        //               "avg_price": "0.10000000",
        //               "countCoin": "btc",
        //               "source": 1,
        //               "type": 1,
        //               "side_msg": "买入",
        //               "volume": "1.000",
        //               "price": "0.10000000",
        //               "source_msg": "WEB",
        //               "status_msg": "未成交",
        //               "deal_volume": "0.00000000",
        //               "id": 425,
        //               "remain_volume": "0.00000000",
        //               "baseCoin": "eth",
        //               "tradeList": [],
        //               "status": 1
        //           }
        //       ]
        //     }
        // }
        const market = (symbol !== undefined) ? this.market (symbol) : undefined;
        return this.parseOrders (ordersData, market, since, limit);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = 100, params = {}) {
        await this.loadMarkets ();
        const marketsToFetch = (symbol !== undefined) ? [symbol] : this.symbols;
        let ordersData = [];
        for (let i = 0; i < marketsToFetch.length; i++) {
            const market = this.market (marketsToFetch[i]);
            const orders = await this.fetchCommonOrders (market['id'], limit, params);
            const allOrders = this.filterByArray (orders, 'status', [0, 1, 2, 3, 4], false);
            ordersData = this.arrayConcat (ordersData, allOrders);
        }
        const market = (symbol !== undefined) ? this.market (symbol) : undefined;
        return this.parseOrders (ordersData, market, since, limit);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' FetchOrder requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'time': (this.milliseconds ()),
            'order_id': id,
        };
        const response = await this.privateGetOpenApiOrderInfo (this.extend (request, params));
        const result = this.safeValue (response, 'data');
        return this.parseOrder (this.safeValue (result, 'order_info', {}), market);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const request = {
            'time': this.milliseconds (),
        };
        const response = await this.privateGetOpenApiUserAccount (this.extend (request, params));
        const result = { 'info': response };
        const resultData = this.safeValue (response, 'data');
        const balances = this.safeValue (resultData, 'coin_list');
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const currencyId = this.safeString (balance, 'coin');
            const code = this.safeCurrencyCode (currencyId);
            const account = {
                'free': this.safeFloat (balance, 'normal'),
                'used': this.safeFloat (balance, 'locked'),
                // 'total': this.safeFloat (balance, 'balance'),
            };
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return;
        }
        // EndPoints Result common pattern
        // {
        //     "code" : "code_id",
        //     "msg" : "",
        //     "data" : {}
        // }
        const errorCode = this.safeString (response, 'code');
        if (errorCode === '0') {
            // success
            return;
        }
        const errorMessages = this.errorMessages;
        let message = undefined;
        message = this.safeString (response, 'msg');
        if (message === undefined) {
            message = this.safeString (errorMessages, errorCode, 'Unknown Error');
        }
        const feedback = this.id + ' ' + message;
        this.throwExactlyMatchedException (this.exceptions, errorCode, feedback);
        throw new ExchangeError (feedback);
    }
};
