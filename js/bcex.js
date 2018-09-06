'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, AuthenticationError, InsufficientFunds, InvalidOrder, OrderNotFound } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class bcex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bcex',
            'name': 'BCEX',
            'countries': [ 'CN', 'CA' ],
            'version': '1',
            'has': {
                'fetchBalance': true,
                'fetchMarkets': true,
                'createOrder': true,
                'cancelOrder': true,
                'fetchTicker': true,
                'fetchTickers': false,
                'fetchTrades': true,
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchClosedOrders': true,
                'fetchOpenOrders': true,
                'fetchTradingLimits': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/43362240-21c26622-92ee-11e8-9464-5801ec526d77.jpg',
                'api': 'https://www.bcex.top',
                'www': 'https://www.bcex.top',
                'doc': 'https://www.bcex.top/api_market/market/',
                'fees': 'http://bcex.udesk.cn/hc/articles/57085',
                'referral': 'https://www.bcex.top/user/reg/type/2/pid/758978',
            },
            'api': {
                'public': {
                    'get': [
                        'Api_Market/getPriceList', // tickers
                        'Api_Order/ticker', // last ohlcv candle (ticker)
                        'Api_Order/depth', // orderbook
                        'Api_Market/getCoinTrade', // ticker
                        'Api_Order/marketOrder', // trades...
                    ],
                    'post': [
                        'Api_Market/getPriceList', // tickers
                        'Api_Order/ticker', // last ohlcv candle (ticker)
                        'Api_Order/depth', // orderbook
                        'Api_Market/getCoinTrade', // ticker
                        'Api_Order/marketOrder', // trades...
                    ],
                },
                'private': {
                    'post': [
                        'Api_Order/cancel',
                        'Api_Order/coinTrust', // limit order
                        'Api_Order/orderList', // open / all orders (my trades?)
                        'Api_Order/orderInfo',
                        'Api_Order/tradeList', // open / all orders
                        'Api_Order/trustList', // ?
                        'Api_User/userBalance',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'buy': 0.0,
                    'sell': 0.2 / 100,
                },
                'funding': {
                    'tierBased': false,
                    'percentage': false,
                    'withdraw': {
                        'ckusd': 0.0,
                        'other': 0.05 / 100,
                    },
                    'deposit': {},
                },
            },
            'exceptions': {
                '该币不存在,非法操作': ExchangeError, // { code: 1, msg: "该币不存在,非法操作" } - returned when a required symbol parameter is missing in the request (also, maybe on other types of errors as well)
                '公钥不合法': AuthenticationError, // { code: 1, msg: '公钥不合法' } - wrong public key
                '您的可用余额不足': InsufficientFunds, // { code: 1, msg: '您的可用余额不足' } - your available balance is insufficient
                '您的btc不足': InsufficientFunds, // { code: 1, msg: '您的btc不足' } - your btc is insufficient
                '参数非法': InvalidOrder, // {'code': 1, 'msg': '参数非法'} - 'Parameter illegal'
                '订单信息不存在': OrderNotFound, // {'code': 1, 'msg': '订单信息不存在'} - 'Order information does not exist'
            },
        });
    }

    async fetchTradingLimits (symbols = undefined, params = {}) {
        // this method should not be called directly, use loadTradingLimits () instead
        // by default it will try load withdrawal fees of all currencies (with separate requests, sequentially)
        // however if you define symbols = [ 'ETH/BTC', 'LTC/BTC' ] in args it will only load those
        await this.loadMarkets ();
        if (typeof symbols === 'undefined') {
            symbols = this.symbols;
        }
        let result = {};
        for (let i = 0; i < symbols.length; i++) {
            let symbol = symbols[i];
            result[symbol] = await this.fetchTradingLimitsById (this.marketId (symbol), params);
        }
        return result;
    }

    async fetchTradingLimitsById (id, params = {}) {
        let request = {
            'symbol': id,
        };
        let response = await this.publicPostApiOrderTicker (this.extend (request, params));
        //
        //     {  code:    0,
        //         msg:   "获取牌价信息成功",
        //        data: {         high:  0.03721392,
        //                         low:  0.03335362,
        //                         buy: "0.03525757",
        //                        sell: "0.03531160",
        //                        last:  0.0352634,
        //                         vol: "184742.4176",
        //                   min_trade: "0.01500000",
        //                   max_trade: "100.00000000",
        //                number_float: "4",
        //                 price_float: "8"             } } }
        //
        return this.parseTradingLimits (this.safeValue (response, 'data', {}));
    }

    parseTradingLimits (limits, symbol = undefined, params = {}) {
        //
        //  {         high:  0.03721392,
        //             low:  0.03335362,
        //             buy: "0.03525757",
        //            sell: "0.03531160",
        //            last:  0.0352634,
        //             vol: "184742.4176",
        //       min_trade: "0.01500000",
        //       max_trade: "100.00000000",
        //    number_float: "4",
        //     price_float: "8"             }
        //
        return {
            'info': limits,
            'precision': {
                'amount': this.safeInteger (limits, 'number_float'),
                'price': this.safeInteger (limits, 'price_float'),
            },
            'limits': {
                'amount': {
                    'min': this.safeFloat (limits, 'min_trade'),
                    'max': this.safeFloat (limits, 'max_trade'),
                },
            },
        };
    }

    async fetchMarkets () {
        let response = await this.publicGetApiMarketGetPriceList ();
        let result = [];
        let keys = Object.keys (response);
        for (let i = 0; i < keys.length; i++) {
            let currentMarketId = keys[i];
            let currentMarkets = response[currentMarketId];
            for (let j = 0; j < currentMarkets.length; j++) {
                let market = currentMarkets[j];
                let baseId = market['coin_from'];
                let quoteId = market['coin_to'];
                let base = baseId.toUpperCase ();
                let quote = quoteId.toUpperCase ();
                base = this.commonCurrencyCode (base);
                quote = this.commonCurrencyCode (quote);
                let id = baseId + '2' + quoteId;
                let symbol = base + '/' + quote;
                let active = true;
                let defaults = this.safeValue (this.options['limits'], symbol, {});
                result.push (this.extend ({
                    'id': id,
                    'symbol': symbol,
                    'base': base,
                    'quote': quote,
                    'baseId': baseId,
                    'quoteId': quoteId,
                    'active': active,
                    // overrided by defaults from this.options['limits']
                    'precision': {
                        'amount': undefined,
                        'price': undefined,
                    },
                    // overrided by defaults from this.options['limits']
                    'limits': {
                        'amount': {
                            'min': undefined,
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
                    'info': market,
                }, defaults));
            }
        }
        return result;
    }

    parseTrade (trade, market = undefined) {
        let symbol = undefined;
        if (typeof market !== 'undefined') {
            symbol = market['symbol'];
        }
        let timestamp = this.safeInteger2 (trade, 'date', 'created');
        if (typeof timestamp !== 'undefined') {
            timestamp = timestamp * 1000;
        }
        let id = this.safeString (trade, 'tid');
        let orderId = this.safeString (trade, 'order_id');
        let amount = this.safeFloat2 (trade, 'number', 'amount');
        let price = this.safeFloat (trade, 'price');
        let cost = undefined;
        if (typeof price !== 'undefined') {
            if (typeof amount !== 'undefined') {
                cost = amount * price;
            }
        }
        let side = this.safeString (trade, 'type');
        return {
            'info': trade,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': undefined,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'order': orderId,
            'fee': undefined,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let request = {
            'symbol': this.marketId (symbol),
        };
        if (typeof limit !== 'undefined') {
            request['limit'] = limit;
        }
        let market = this.market (symbol);
        let response = await this.publicPostApiOrderMarketOrder (this.extend (request, params));
        return this.parseTrades (response['data'], market, since, limit);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostApiUserUserBalance (params);
        let data = response['data'];
        let keys = Object.keys (data);
        let result = { };
        for (let i = 0; i < keys.length; i++) {
            let key = keys[i];
            let amount = this.safeFloat (data, key);
            let parts = key.split ('_');
            let currencyId = parts[0];
            let lockOrOver = parts[1];
            let code = currencyId.toUpperCase ();
            if (currencyId in this.currencies_by_id) {
                code = this.currencies_by_id[currencyId]['code'];
            } else {
                code = this.commonCurrencyCode (code);
            }
            if (!(code in result)) {
                let account = this.account ();
                result[code] = account;
            }
            if (lockOrOver === 'lock') {
                result[code]['used'] = parseFloat (amount);
            } else {
                result[code]['free'] = parseFloat (amount);
            }
        }
        keys = Object.keys (result);
        for (let i = 0; i < keys.length; i++) {
            let key = keys[i];
            let total = this.sum (result[key]['used'], result[key]['free']);
            result[key]['total'] = total;
        }
        result['info'] = data;
        return this.parseBalance (result);
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.markets[symbol];
        let request = {
            'part': market['quoteId'],
            'coin': market['baseId'],
        };
        let response = await this.publicPostApiMarketGetCoinTrade (this.extend (request, params));
        let timestamp = this.milliseconds ();
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (response, 'max'),
            'low': this.safeFloat (response, 'min'),
            'bid': this.safeFloat (response, 'buy'),
            'bidVolume': undefined,
            'ask': this.safeFloat (response, 'sale'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': this.safeFloat (response, 'price'),
            'last': this.safeFloat (response, 'price'),
            'previousClose': undefined,
            'change': undefined,
            'percentage': this.safeFloat (response, 'change_24h'),
            'average': undefined,
            'baseVolume': this.safeFloat (response, 'volume_24h'),
            'quoteVolume': undefined,
            'info': response,
        };
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let marketId = this.marketId (symbol);
        let request = {
            'symbol': marketId,
        };
        let response = await this.publicPostApiOrderDepth (this.extend (request, params));
        let data = response['data'];
        let orderbook = this.parseOrderBook (data, data['date'] * 1000);
        return orderbook;
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'symbol': market['id'],
        };
        let response = await this.privatePostApiOrderOrderList (this.extend (request, params));
        return this.parseTrades (response['data'], market, since, limit);
    }

    parseOrderStatus (status) {
        let statuses = {
            '0': 'open',
            '1': 'open', // partially filled
            '2': 'closed',
            '3': 'canceled',
        };
        if (status in statuses) {
            return statuses[status];
        }
        return status;
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        if (typeof symbol === 'undefined')
            throw new ExchangeError (this.id + ' fetchOrder requires a symbol argument');
        await this.loadMarkets ();
        let request = {
            'symbol': this.marketId (symbol),
            'trust_id': id,
        };
        let response = await this.privatePostApiOrderOrderInfo (this.extend (request, params));
        let order = response['data'];
        let timestamp = this.safeInteger (order, 'created') * 1000;
        let status = this.parseOrderStatus (order['status']);
        let side = this.safeString (order, 'flag');
        if (side === 'sale')
            side = 'sell';
        // Can't use parseOrder because the data format is different btw endpoint for fetchOrder and fetchOrders
        let result = {
            'info': order,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': undefined,
            'side': side,
            'price': this.safeFloat (order, 'price'),
            'cost': undefined,
            'average': this.safeFloat (order, 'avg_price'),
            'amount': this.safeFloat (order, 'number'),
            'filled': this.safeFloat (order, 'numberdeal'),
            'remaining': this.safeFloat (order, 'numberover'),
            'status': status,
            'fee': undefined,
        };
        return result;
    }

    parseOrder (order, market = undefined) {
        let id = this.safeString (order, 'id');
        let timestamp = this.safeInteger (order, 'datetime') * 1000;
        let iso8601 = this.iso8601 (timestamp);
        let symbol = market['symbol'];
        let type = undefined;
        let side = this.safeString (order, 'type');
        if (side === 'sale')
            side = 'sell';
        let price = this.safeFloat (order, 'price');
        let average = this.safeFloat (order, 'avg_price');
        let amount = this.safeFloat (order, 'amount');
        let remaining = this.safeFloat (order, 'amount_outstanding');
        let filled = amount - remaining;
        let status = this.safeString (order, 'status');
        status = this.parseOrderStatus (status);
        let cost = filled * price;
        let fee = undefined;
        let result = {
            'info': order,
            'id': id,
            'timestamp': timestamp,
            'datetime': iso8601,
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'cost': cost,
            'average': average,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': fee,
        };
        return result;
    }

    async fetchOrdersByType (type, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let request = {
            'type': type,
        };
        let market = undefined;
        if (typeof symbol !== 'undefined') {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        let response = await this.privatePostApiOrderTradeList (this.extend (request, params));
        if ('data' in response) {
            return this.parseOrders (response['data'], market, since, limit);
        }
        return [];
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return this.fetchOrdersByType ('open', symbol, since, limit, params);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        let orders = await this.fetchOrders (symbol, since, limit, params);
        return this.filterBy (orders, 'status', 'closed');
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return this.fetchOrdersByType ('all', symbol, since, limit, params);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let order = {
            'symbol': this.marketId (symbol),
            'type': side,
            'price': this.priceToPrecision (symbol, price),
            'number': this.amountToPrecision (symbol, amount),
        };
        let response = await this.privatePostApiOrderCoinTrust (this.extend (order, params));
        let data = response['data'];
        return {
            'info': response,
            'id': this.safeString (data, 'order_id'),
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        if (typeof symbol === 'undefined')
            throw new ExchangeError (this.id + ' cancelOrder requires a symbol argument');
        await this.loadMarkets ();
        let request = {};
        if (typeof symbol !== 'undefined') {
            request['symbol'] = this.marketId (symbol);
        }
        if (typeof id !== 'undefined') {
            request['order_id'] = id;
        }
        let response = await this.privatePostApiOrderCancel (this.extend (request, params));
        return response;
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            this.checkRequiredCredentials ();
            let payload = this.urlencode ({ 'api_key': this.apiKey });
            if (Object.keys (query).length) {
                payload += '&' + this.urlencode (this.keysort (query));
            }
            let auth = payload + '&secret_key=' + this.secret;
            let signature = this.hash (this.encode (auth));
            body = payload + '&sign=' + signature;
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body) {
        if (typeof body !== 'string')
            return; // fallback to default error handler
        if (body.length < 2)
            return; // fallback to default error handler
        if ((body[0] === '{') || (body[0] === '[')) {
            let response = JSON.parse (body);
            let code = this.safeValue (response, 'code');
            if (typeof code !== 'undefined') {
                if (code !== 0) {
                    //
                    // { code: 1, msg: "该币不存在,非法操作" } - returned when a required symbol parameter is missing in the request (also, maybe on other types of errors as well)
                    // { code: 1, msg: '公钥不合法' } - wrong public key
                    // { code: 1, msg: '价格输入有误，请检查你的数值精度' } - 'The price input is incorrect, please check your numerical accuracy'
                    // { code: 1, msg: '单笔最小交易数量不能小于0.00100000,请您重新挂单'} -
                    //                  'The minimum number of single transactions cannot be less than 0.00100000. Please re-post the order'
                    //
                    let message = this.safeString (response, 'msg');
                    let feedback = this.id + ' msg: ' + message + ' ' + body;
                    let exceptions = this.exceptions;
                    if (message in exceptions) {
                        throw new exceptions[message] (feedback);
                    } else if (message.indexOf ('请您重新挂单') >= 0) {  // minimum limit
                        throw new InvalidOrder (feedback);
                    } else {
                        throw new ExchangeError (feedback);
                    }
                }
            }
        }
    }

    calculateFee (symbol, type, side, amount, price, takerOrMaker = 'taker', params = {}) {
        let market = this.markets[symbol];
        let rate = market[side];
        let cost = parseFloat (this.costToPrecision (symbol, amount * price));
        return {
            'type': takerOrMaker,
            'currency': market['quote'],
            'rate': rate,
            'cost': parseFloat (this.feeToPrecision (symbol, rate * cost)),
        };
    }
};
