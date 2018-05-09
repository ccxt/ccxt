'use strict';

// ---------------------------------------------------------------------------

const huobipro = require ('./huobipro.js');
const { ExchangeError, ExchangeNotAvailable, AuthenticationError, InvalidOrder, InsufficientFunds } = require ('./base/errors');

// ---------------------------------------------------------------------------

module.exports = class cointiger extends huobipro {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'cointiger',
            'name': 'CoinTiger',
            'countries': 'CN',
            'hostname': 'api.cointiger.com',
            'has': {
                'fetchCurrencies': false,
                'fetchTickers': true,
                'fetchOrder': false,
            },
            'headers': {
                'Language': 'en_US',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/39797261-d58df196-5363-11e8-9880-2ec78ec5bd25.jpg',
                'api': {
                    'public': 'https://api.cointiger.com/exchange/trading/api/market',
                    'private': 'https://api.cointiger.com/exchange/trading/api',
                    'exchange': 'https://www.cointiger.com/exchange',
                },
                'www': 'https://www.cointiger.com/exchange/register.html?refCode=FfvDtt',
                'doc': 'https://github.com/cointiger/api-docs-en/wiki',
            },
            'api': {
                'public': {
                    'get': [
                        'history/kline', // 获取K线数据
                        'detail/merged', // 获取聚合行情(Ticker)
                        'depth', // 获取 Market Depth 数据
                        'trade', // 获取 Trade Detail 数据
                        'history/trade', // 批量获取最近的交易记录
                        'detail', // 获取 Market Detail 24小时成交量数据
                    ],
                },
                'exchange': {
                    'get': [
                        'footer/tradingrule.html',
                        'api/public/market/detail',
                    ],
                },
                'private': {
                    'get': [
                        'user/balance',
                        'order/new',
                        'order/history',
                        'order/trade',
                    ],
                    'post': [
                        'order',
                    ],
                    'delete': [
                        'order',
                    ],
                },
            },
            'exceptions': {
                '1': InsufficientFunds,
                '2': ExchangeError,
                '5': InvalidOrder,
                '16': AuthenticationError, // funding password not set
                '100001': ExchangeError,
                '100002': ExchangeNotAvailable,
                '100003': ExchangeError,
                '100005': AuthenticationError,
            },
        });
    }

    async fetchMarkets () {
        this.parseJsonResponse = false;
        let response = await this.exchangeGetFooterTradingruleHtml ();
        this.parseJsonResponse = true;
        let rows = response.split ('<tr>');
        let numRows = rows.length;
        let limit = numRows - 1;
        let result = [];
        for (let i = 1; i < limit; i++) {
            let row = rows[i];
            let parts = row.split ('<span style="color:#ffffff">');
            let numParts = parts.length;
            if ((numParts < 6) || (parts[1].indexOf ('Kind&nbsp') >= 0))
                continue;
            let id = parts[1].split ('</span>')[0];
            let minAmount = parts[2].split ('</span>')[0];
            let minPrice = parts[4].split ('</span>')[0];
            let precision = {
                'amount': this.precisionFromString (minAmount),
                'price': this.precisionFromString (minPrice),
            };
            id = id.split ('&nbsp')[0];
            let [ baseId, quoteId ] = id.split ('/');
            let base = this.commonCurrencyCode (baseId);
            let quote = this.commonCurrencyCode (quoteId);
            baseId = baseId.toLowerCase ();
            quoteId = quoteId.toLowerCase ();
            id = baseId + quoteId;
            let symbol = base + '/' + quote;
            result.push ({
                'id': id,
                'uppercaseId': id.toUpperCase (),
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': true,
                'precision': precision,
                'taker': 0.001,
                'maker': 0.001,
                'limits': {
                    'amount': {
                        'min': parseFloat (minAmount),
                        'max': undefined,
                    },
                    'price': {
                        'min': parseFloat (minPrice),
                        'max': undefined,
                    },
                    'cost': {
                        'min': 0,
                        'max': undefined,
                    },
                },
                'info': undefined,
            });
        }
        this.options['marketsByUppercaseId'] = this.indexBy (result, 'uppercaseId');
        return result;
    }

    parseTicker (ticker, market = undefined) {
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        let timestamp = this.safeInteger (ticker, 'id');
        let close = this.safeFloat (ticker, 'last');
        let percentage = this.safeFloat (ticker, 'percentChange');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high24hr'),
            'low': this.safeFloat (ticker, 'low24hr'),
            'bid': this.safeFloat (ticker, 'highestBid'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'lowestAsk'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': close,
            'last': close,
            'previousClose': undefined,
            'change': undefined,
            'percentage': percentage,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'baseVolume'),
            'quoteVolume': this.safeFloat (ticker, 'quoteVolume'),
            'info': ticker,
        };
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetDepth (this.extend ({
            'symbol': market['id'], // this endpoint requires a lowercase market id
            'type': 'step0',
        }, params));
        let data = response['data']['depth_data'];
        if ('tick' in data) {
            if (!data['tick']) {
                throw new ExchangeError (this.id + ' fetchOrderBook() returned empty response: ' + this.json (response));
            }
            let orderbook = data['tick'];
            let timestamp = data['ts'];
            return this.parseOrderBook (orderbook, timestamp);
        }
        throw new ExchangeError (this.id + ' fetchOrderBook() returned unrecognized response: ' + this.json (response));
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let marketId = market['id'];
        let response = await this.exchangeGetApiPublicMarketDetail (params);
        if (!(marketId in response))
            throw new ExchangeError (this.id + ' fetchTicker symbol ' + symbol + ' (' + marketId + ') not found');
        return this.parseTicker (response[marketId], market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.exchangeGetApiPublicMarketDetail (params);
        let result = {};
        let ids = Object.keys (response);
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i];
            let market = undefined;
            let symbol = id;
            if (id in this.options['marketsByUppercaseId']) {
                // this endpoint returns uppercase ids
                symbol = this.options['marketsByUppercaseId'][id]['symbol'];
            }
            result[symbol] = this.parseTicker (response[id], market);
        }
        return result;
    }

    parseTrade (trade, market = undefined) {
        //
        //     {
        //         "volume": {
        //             "amount": "1.000",
        //             "icon": "",
        //             "title": "成交量"
        //                   },
        //         "price": {
        //             "amount": "0.04978883",
        //             "icon": "",
        //             "title": "委托价格"
        //                  },
        //         "created_at": 1513245134000,
        //         "deal_price": {
        //             "amount": 0.04978883000000000000000000000000,
        //             "icon": "",
        //             "title": "成交价格"
        //                       },
        //         "id": 138
        //     }
        //
        let side = this.safeString (trade, 'side');
        let amount = undefined;
        let price = undefined;
        let cost = undefined;
        if (typeof side !== 'undefined') {
            side = side.toLowerCase ();
            price = this.safeFloat (trade, 'price');
            amount = this.safeFloat (trade, 'amount');
        } else {
            price = this.safeFloat (trade['price'], 'amount');
            amount = this.safeFloat (trade['volume'], 'amount');
            cost = this.safeFloat (trade['deal_price'], 'amount');
        }
        if (typeof amount !== 'undefined')
            if (typeof price !== 'undefined')
                if (typeof cost === 'undefined')
                    cost = amount * price;
        let timestamp = this.safeValue (trade, 'created_at');
        if (typeof timestamp === 'undefined')
            timestamp = this.safeValue (trade, 'ts');
        let iso8601 = (typeof timestamp !== 'undefined') ? this.iso8601 (timestamp) : undefined;
        let symbol = undefined;
        if (typeof market !== 'undefined')
            symbol = market['symbol'];
        return {
            'info': trade,
            'id': trade['id'].toString (),
            'order': undefined,
            'timestamp': timestamp,
            'datetime': iso8601,
            'symbol': symbol,
            'type': undefined,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': undefined,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = 1000, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'symbol': market['id'],
        };
        if (typeof limit !== 'undefined')
            request['size'] = limit;
        let response = await this.publicGetHistoryTrade (this.extend (request, params));
        return this.parseTrades (response['data']['trade_data'], market, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (typeof symbol === 'undefined')
            throw new ExchangeError (this.id + ' fetchOrders requires a symbol argument');
        await this.loadMarkets ();
        let market = this.market (symbol);
        if (typeof limit === 'undefined')
            limit = 100;
        let response = await this.privateGetOrderTrade (this.extend ({
            'symbol': market['id'],
            'offset': 1,
            'limit': limit,
        }, params));
        return this.parseTrades (response['data']['list'], market, since, limit);
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = 1000, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'symbol': market['id'],
            'period': this.timeframes[timeframe],
        };
        if (typeof limit !== 'undefined') {
            request['size'] = limit;
        }
        let response = await this.publicGetHistoryKline (this.extend (request, params));
        return this.parseOHLCVs (response['data']['kline_data'], market, timeframe, since, limit);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privateGetUserBalance (params);
        //
        //     {
        //         "code": "0",
        //         "msg": "suc",
        //         "data": [{
        //             "normal": "1813.01144179",
        //             "lock": "1325.42036785",
        //             "coin": "btc"
        //         }, {
        //             "normal": "9551.96692244",
        //             "lock": "547.06506717",
        //             "coin": "eth"
        //         }]
        //     }
        //
        let balances = response['data'];
        let result = { 'info': response };
        for (let i = 0; i < balances.length; i++) {
            let balance = balances[i];
            let id = balance['coin'];
            let code = id.toUpperCase ();
            code = this.commonCurrencyCode (code);
            if (id in this.currencies_by_id) {
                code = this.currencies_by_id[id]['code'];
            }
            let account = this.account ();
            account['used'] = parseFloat (balance['lock']);
            account['free'] = balance['normal'];
            account['total'] = this.sum (account['used'], account['free']);
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrdersByStatus (status = undefined, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (typeof symbol === 'undefined')
            throw new ExchangeError (this.id + ' fetchOrders requires a symbol argument');
        await this.loadMarkets ();
        let market = this.market (symbol);
        if (typeof limit === 'undefined')
            limit = 100;
        let method = (status === 'open') ? 'privateGetOrderNew' : 'privateGetOrderHistory';
        let response = await this[method] (this.extend ({
            'symbol': market['id'],
            'offset': 1,
            'limit': limit,
        }, params));
        return this.parseOrders (response['data']['list'], market, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return this.fetchOrdersByStatus ('open', symbol, since, limit, params);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return this.fetchOrdersByStatus ('closed', symbol, since, limit, params);
    }

    parseOrder (order, market = undefined) {
        let side = this.safeString (order, 'side');
        side = side.toLowerCase ();
        //
        //      {
        //            volume: { "amount": "0.054", "icon": "", "title": "volume" },
        //         age_price: { "amount": "0.08377697", "icon": "", "title": "Avg price" },
        //              side:   "BUY",
        //             price: { "amount": "0.00000000", "icon": "", "title": "price" },
        //        created_at:   1525569480000,
        //       deal_volume: { "amount": "0.64593598", "icon": "", "title": "Deal volume" },
        //   "remain_volume": { "amount": "1.00000000", "icon": "", "title": "尚未成交"
        //                id:   26834207,
        //             label: { go: "trade", title: "Traded", click: 1 },
        //          side_msg:   "Buy"
        //      },
        //
        let type = undefined;
        let status = undefined;
        let symbol = undefined;
        if (typeof market !== 'undefined')
            symbol = market['symbol'];
        let timestamp = order['created_at'];
        let amount = this.safeFloat (order['volume'], 'amount');
        let remaining = ('remain_volume' in order) ? this.safeFloat (order['remain_volume'], 'amount') : undefined;
        let filled = ('deal_volume' in order) ? this.safeFloat (order['deal_volume'], 'amount') : undefined;
        let price = ('age_price' in order) ? this.safeFloat (order['age_price'], 'amount') : undefined;
        if (typeof price === 'undefined')
            price = ('price' in order) ? this.safeFloat (order['price'], 'amount') : undefined;
        let cost = undefined;
        let average = undefined;
        if (typeof amount !== 'undefined') {
            if (typeof remaining !== 'undefined') {
                if (typeof filled === 'undefined')
                    filled = amount - remaining;
            } else if (typeof filled !== 'undefined') {
                cost = filled * price;
                average = parseFloat (cost / filled);
                if (typeof remaining === 'undefined')
                    remaining = amount - filled;
            }
        }
        if ((typeof remaining !== 'undefined') && (remaining > 0))
            status = 'open';
        let result = {
            'info': order,
            'id': order['id'].toString (),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'average': average,
            'cost': cost,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': undefined,
        };
        return result;
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        if (!this.password)
            throw new AuthenticationError (this.id + ' createOrder requires exchange.password to be set to user trading password (not login password!)');
        this.checkRequiredCredentials ();
        let market = this.market (symbol);
        let orderType = (type === 'limit') ? 1 : 2;
        let order = {
            'symbol': market['id'],
            'side': side.toUpperCase (),
            'type': orderType,
            'volume': this.amountToPrecision (symbol, amount),
            'capital_password': this.password,
        };
        if ((type === 'market') && (side === 'buy')) {
            if (typeof price === 'undefined') {
                throw new InvalidOrder (this.id + ' createOrder requires price argument for market buy orders to calculate total cost according to exchange rules');
            }
            order['volume'] = this.amountToPrecision (symbol, amount * price);
        }
        if (type === 'limit')
            order['price'] = this.priceToPrecision (symbol, price);
        let response = await this.privatePostOrder (this.extend (order, params));
        //
        //     {"order_id":34343}
        //
        let timestamp = this.milliseconds ();
        return {
            'info': response,
            'id': response['order_id'].toString (),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'status': undefined,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'filled': undefined,
            'remaining': undefined,
            'cost': undefined,
            'trades': undefined,
            'fee': undefined,
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        if (typeof symbol === 'undefined')
            throw new ExchangeError (this.id + ' cancelOrder requires a symbol argument');
        let market = this.market (symbol);
        return await this.privateDeleteOrder (this.extend ({
            'symbol': market['id'],
            'order_id': id,
        }, params));
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        this.checkRequiredCredentials ();
        let url = this.urls['api'][api] + '/' + this.implodeParams (path, params);
        if (api === 'private') {
            let timestamp = this.milliseconds ().toString ();
            let query = this.keysort (this.extend ({
                'time': timestamp,
            }, params));
            let keys = Object.keys (query);
            let auth = '';
            for (let i = 0; i < keys.length; i++) {
                auth += keys[i] + query[keys[i]];
            }
            auth += this.secret;
            let signature = this.hmac (this.encode (auth), this.encode (this.secret), 'sha512');
            let isCreateOrderMethod = (path === 'order') && (method === 'POST');
            let urlParams = isCreateOrderMethod ? {} : query;
            url += '?' + this.urlencode (this.keysort (this.extend ({
                'api_key': this.apiKey,
                'time': timestamp,
            }, urlParams)));
            url += '&sign=' + this.decode (signature);
            if (method === 'POST') {
                body = this.urlencode (query);
                headers = {
                    'Content-Type': 'application/x-www-form-urlencoded',
                };
            }
        } else if (api === 'public') {
            url += '?' + this.urlencode (this.extend ({
                'api_key': this.apiKey,
            }, params));
        } else {
            if (Object.keys (params).length)
                url += '?' + this.urlencode (params);
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body) {
        if (typeof body !== 'string')
            return; // fallback to default error handler
        if (body.length < 2)
            return; // fallback to default error handler
        if ((body[0] === '{') || (body[0] === '[')) {
            let response = JSON.parse (body);
            if ('code' in response) {
                //
                //     {"code":"100005","msg":"request sign illegal","data":null}
                //
                let code = this.safeString (response, 'code');
                if ((typeof code !== 'undefined') && (code !== '0')) {
                    const message = this.safeString (response, 'msg');
                    const feedback = this.id + ' ' + this.json (response);
                    const exceptions = this.exceptions;
                    if (code in exceptions) {
                        if (code === 2) {
                            if (message === 'offsetNot Null') {
                                throw new ExchangeError (feedback);
                            } else if (message === 'Parameter error') {
                                throw new ExchangeError (feedback);
                            }
                        }
                        throw new exceptions[code] (feedback);
                    } else {
                        throw new ExchangeError (this.id + ' unknown "error" value: ' + this.json (response));
                    }
                }
            }
        }
    }
};

