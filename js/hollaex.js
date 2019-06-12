'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { BadRequest, AuthenticationError, NetworkError, ArgumentsRequired, OrderNotFound } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class hollaex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'hollaex',
            'name': 'HollaEx',
            'countries': [ 'KR' ], // Korea
            'rateLimit': 667, // ?
            'version': 'v0',
            'has': {
                'CORS': false,
                'fetchMarkets': true,
                'fetchTicker': true,
                'fetchOrderBook': true,
                'fetchTrades': true,
                'fetchBalance': true,
                'createOrder': true,
                'cancelOrder': true,
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchMyTrades': true,
                'withdraw': true,
            },
            'urls': {
                'logo': '',
                'api': 'https://api.hollaex.com',
                'www': 'https://hollaex.com',
                'doc': 'https://apidocs.hollaex.com',
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': false,
            },
            'api': {
                'public': {
                    'get': [
                        'ticker',
                        'orderbooks',
                        'trades',
                        'constant',
                    ],
                },
                'private': {
                    'get': [
                        'user',
                        'user/balance',
                        'user/deposits',
                        'user/withdrawals',
                        'user/trades',
                        'user/orders',
                        'user/orders/{orderId}',
                    ],
                    'post': [
                        'user/{requestWithdrawal}',
                        'order',
                    ],
                    'delete': [
                        'user/orders/{orderId}',
                    ],
                },
            },
            'exceptions': {
                'Order not found': OrderNotFound,
                '400': BadRequest,
                '403': AuthenticationError,
                '404': BadRequest,
                '405': BadRequest,
                '410': BadRequest,
                '429': BadRequest,
                '500': NetworkError,
                '503': NetworkError,
            },
        });
    }

    async fetchMarkets () {
        let response = await this.publicGetConstant ();
        let markets = this.safeValue (response, 'pairs');
        let keys = Object.keys (markets);
        let result = [];
        for (let i = 0; i < keys.length; i++) {
            let id = keys[i];
            let market = markets[id];
            let [baseId, quoteId] = id.split ('-');
            let base = this.commonCurrencyCode (baseId).toUpperCase ();
            let quote = this.commonCurrencyCode (quoteId).toUpperCase ();
            let symbol = base + '/' + quote;
            let active = true;
            let limits = {
                'amount': {
                    'min': market['min_size'],
                    'max': market['max_size'],
                },
                'price': {
                    'min': market['min_price'],
                    'max': market['max_price'],
                },
            };
            let entry = {
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'info': market,
                'acitve': active,
                'limits': limits,
            };
            result.push (entry);
        }
        return result;
    }

    async fetchOrderBook (symbol, params = {}) {
        if (symbol === undefined) throw new ArgumentsRequired (this.id + ' fetchOrderBook requires a symbol argument');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'symbol': market['id'],
        };
        let response = await this.publicGetOrderbooks (this.extend (request, params));
        response = response[market['id']];
        let datetime = this.safeString (response, 'timestamp');
        let timestamp = new Date (datetime).getTime ();
        let result = {
            'bids': response['bids'],
            'asks': response['asks'],
            'timestamp': timestamp,
            'datetime': datetime,
        };
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        if (symbol === undefined) throw new ArgumentsRequired (this.id + ' fetchTicker requires a symbol argument');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetTicker (this.extend ({
            'symbol': market['id'],
        }, params));
        let last = response['last'];
        let close = response['close'];
        let high = response['high'];
        let low = response['low'];
        let open = response['open'];
        let datetime = response['timestamp'];
        let timestamp = new Date (datetime).getTime ();
        let baseVolume = response['volume'];
        let result = {
            'symbol': symbol,
            'info': response,
            'timestamp': timestamp,
            'datetime': datetime,
            'high': high,
            'low': low,
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': open,
            'close': close,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': undefined,
        };
        return result;
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) throw new ArgumentsRequired (this.id + ' fetchTrades requires a symbol argument');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetTrades (this.extend ({
            'symbol': market['id'],
        }, params));
        return this.parseTrades (response[market['id']], market);
    }

    parseTrade (trade, market = undefined) {
        let symbol = (market !== undefined) ? market['symbol'] : undefined;
        let side = this.safeString (trade, 'side');
        let datetime = this.safeString (trade, 'timestamp');
        let timestamp = new Date (datetime).getTime ();
        let price = this.safeFloat (trade, 'price');
        let amount = this.safeFloat (trade, 'size');
        return {
            'id': undefined,
            'timestamp': timestamp,
            'datetime': datetime,
            'order': undefined,
            'symbol': symbol,
            'type': undefined,
            'side': side,
            'price': price,
            'amount': amount,
            'info': trade,
        };
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privateGetUserBalance (params);
        let result = { 'info': response };
        let free = {};
        let used = {};
        let total = {};
        let currencyId = Object.keys (this.currencies_by_id);
        for (let i = 0; i < currencyId.length; i++) {
            let currency = this.currencies_by_id[currencyId[i]].code;
            let responseCurr = currencyId[i];
            if (responseCurr === 'eur') {
                responseCurr = 'fiat';
            }
            free[currency] = response[responseCurr + '_available'];
            total[currency] = response[responseCurr + '_balance'];
            // used[currency] = total[currency] - free[currency];
            used[currency] = undefined;
            result[currency] = {
                'free': free[currency],
                'used': used[currency],
                'total': total[currency],
            };
        }
        result['free'] = free;
        result['used'] = used;
        result['total'] = total;
        return result;
    }

    // SYMBOL
    async fetchOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) throw new ArgumentsRequired (this.id + ' fetchOrder requires a symbol argument');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let orderId = this.safeValue (params, 'orderId');
        let request = {
            'symbol': market['id'],
            'orderId': orderId,
        };
        if (orderId === undefined) {
            request['orderId'] = id;
        }
        let response = await this.privateGetUserOrdersOrderId (this.extend (request, params));
        return this.parseOrder (response, market);
    }

    async fetchOrders (symbol = undefined, params = {}) {
        if (symbol === undefined) throw new ArgumentsRequired (this.id + ' fetchOrders requires a symbol argument');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'symbol': market['id'],
        };
        let response = await this.privateGetUserOrders (this.extend (request, params));
        return this.parseOrders (response, market);
    }

    async parseOrder (order, market = undefined) {
        let symbol = this.safeString (market, 'symbol');
        let id = this.safeString (order, 'id');
        let datetime = this.safeString (order, 'created_at');
        let timestamp = new Date (datetime).getTime ();
        let type = this.safeString (order, 'type');
        let side = this.safeString (order, 'side');
        let price = this.safeFloat (order, 'price');
        let amount = this.safeFloat (order, 'size');
        let filled = this.safeFloat (order, 'filled');
        let status = undefined;
        let info = order;
        let lastTradeTimestamp = undefined;
        let remaining = undefined;
        let cost = undefined;
        let trades = undefined;
        let fee = undefined;
        return { id, datetime, timestamp, lastTradeTimestamp, status, symbol, type, side, price, amount, filled, remaining, cost, trades, fee, info };
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let order = {
            'symbol': market['id'],
            'side': side,
            'size': amount,
            'type': type,
            'price': price,
        };
        let response = await this.privatePostOrder (this.extend (order, params));
        response['created_at'] = new Date ().toISOString ();
        return this.parseOrder (response, market);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        let response = await this.privateDeleteUserOrdersOrderId (this.extend ({
            'orderId': id,
        }, params));
        return this.parseOrder (response);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) throw new ArgumentsRequired (this.id + ' fetchMyTrades requires a symbol argument');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let response = await this.privateGetUserTrades (this.extend (request, params));
        return this.parseTrades (response.data, market, since, limit);
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        await this.loadMarkets ();
        let currency = this.currencies[code]['id'];
        let request = {
            'currency': currency,
            'amount': amount,
            'address': address,
            'requestWithdrawal': 'request-withdrawal',
        };
        let response = await this.privatePostUserRequestWithdrawal (this.extend (request, params));
        return {
            'info': response,
            'id': undefined,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.version;
        if (api === 'public') {
            const query = this.omit (params, this.extractParams (path));
            url += '/' + this.implodeParams (path, params);
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else if (api === 'private') {
            this.checkRequiredCredentials ();
            const query = this.omit (params, this.extractParams (path));
            url += '/' + this.implodeParams (path, params);
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
            let accessToken = 'Bearer ' + this.apiKey;
            headers = {
                'Content-Type': 'application/json',
                'Authorization': accessToken,
            };
            if (method === 'POST' || method === 'PUT' || method === 'DELETE') {
                if (Object.keys (params).length) {
                    body = this.json (params);
                }
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response) {
        if (code >= 400 && code <= 503) {
            // console.log(code);
            // console.log('header', headers);
            // console.log('reason', reason);
            // console.log('response', response);
            // console.log(method, url);
            // console.log('body', body);
            const exceptions = this.exceptions;
            const message = this.safeString (response, 'message');
            if (message in exceptions) {
                const ExceptionClass = exceptions[message];
                throw new ExceptionClass (this.id + ' ' + message);
            }
            if (code in exceptions) {
                let status = code.toString ();
                const ExceptionClass = exceptions[status];
                throw new ExceptionClass (this.id + ' ' + message);
            }
        }
    }
};
