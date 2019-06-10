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
            'version': 'v1',
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
                'api': 'https://api.hollaex.com/v0',
                'www': 'https://hollaex.com',
                'doc': 'https://apidocs.hollaex.com',
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
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
                        'user/orders',
                        'user/orders/',
                    ],
                },
            },
        });
    }

    async fetchMarkets () {
        let response = await this.publicGetConstant ();
        let markets = response['pairs'];
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

    async fetchOrderBook (symbol) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'symbol': market['id'],
        };
        let response = await this.publicGetOrderbooks (this.extend (request));
        response = response[market['id']];
        let result = {
            'bids': response['bids'],
            'asks': response['asks'],
            'datetime': response['timestamp'],
            'timestamp': undefined,
        };
        return result;
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let request = this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        let url = this.urls['api'] + '/';
        if (api === 'public') {
            url += request;
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            this.checkRequiredCredentials ();
            url += this.version + '/' + request;
            let nonce = this.nonce ().toString ();
            let json = this.json (this.extend ({
                'access_token': this.apiKey,
                'nonce': nonce,
            }, params));
            let payload = this.stringToBase64 (this.encode (json));
            body = this.decode (payload);
            let secret = this.secret.toUpperCase ();
            let signature = this.hmac (payload, this.encode (secret), 'sha512');
            headers = {
                'content-type': 'application/json',
                'X-COINONE-PAYLOAD': payload,
                'X-COINONE-SIGNATURE': signature,
            };
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
