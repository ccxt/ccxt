'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired, ExchangeNotAvailable, InvalidOrder, OrderNotFound } = require ('./base/errors');

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
                'fetchTicker': true,
                'fetchOrderBook': true,
                'fetchTrades': true,
                'fetchMarkets': true,
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
                        'user/orders/',
                    ],
                    'post': [
                        'user/request-withdrawal',
                        'order',
                    ],
                    'delete': [
                        'user/orders',
                        'user/orders/',
                    ]
                },
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

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let query = '/' + this.version + '/' + path;
        if (method === 'GET') {
            if (Object.keys (params).length) {
                query += '?' + this.urlencode (params);
            }
        }
        let url = this.urls['api'] + query;
        if (api === 'private') {
            this.checkRequiredCredentials ();
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

    // handleErrors (code, reason, url, method, headers, body, response) {
    //     if ((body[0] === '{') || (body[0] === '[')) {
    //         if ('result' in response) {
    //             let result = response['result'];
    //             if (result !== 'success') {
    //                 //
    //                 //    {  "errorCode": "405",  "status": "maintenance",  "result": "error"}
    //                 //
    //                 const code = this.safeString (response, 'errorCode');
    //                 const feedback = this.id + ' ' + this.json (response);
    //                 const exceptions = this.exceptions;
    //                 if (code in exceptions) {
    //                     throw new exceptions[code] (feedback);
    //                 } else {
    //                     throw new ExchangeError (feedback);
    //                 }
    //             }
    //         } else {
    //             throw new ExchangeError (this.id + ' ' + body);
    //         }
    //     }
    // }
};
