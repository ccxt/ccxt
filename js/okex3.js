'use strict';

const okex = require ('./okex');
// const { ExchangeError, ArgumentsRequired, DDoSProtection, InsufficientFunds, InvalidOrder, OrderNotFound, AuthenticationError } = require('./base/errors');

module.exports = class okex3 extends okex {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'okex3',
            'name': 'OKEX v3',
            'version': 'v3',
            'has': {
                'CORS': false,
                'futures': true,
                'fetchTickers': true,
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
                'password': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/32552768-0d6dd3c6-c4a6-11e7-90f8-c043b64756a7.jpg',
                'api': {
                    'public': 'https://www.okex.com/api',
                    'private': 'https://www.okex.com/api',
                },
                'www': 'https://www.okex.com',
                'doc': 'https://www.okex.com/docs/',
                'fees': 'https://www.okex.com/pages/products/fees.html',
            },
            'api': {
                'public': {
                    'get': [
                        'spot/v3/instruments/{symbol}/book',    // instrument-id
                        'spot/v3/instruments/ticker',
                        'spot/v3/instruments/{symbol}/ticker',
                        'spot/v3/instruments/{symbol}/trades',
                        'spot/v3/instruments/{symbol}/candles',
                        'futures/v3/instruments/{symbol}/book',
                        'futures/v3/instruments/ticker',
                        'futures/v3/instruments/{symbol}/ticker',
                        'futures/v3/instruments/{symbol}/trades',
                        'futures/v3/instruments/{symbol}/candles',
                        'general/v3/time',
                    ],
                },
                'private': {
                    'post': [
                        'account/v3/transfer',
                        'account/v3/withdrawal',
                    ],
                    'get': [
                        'account/v3/withdrawal/fee',
                    ],
                },
            },
        });
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = '/';
        url += this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (api === 'private') {
            this.checkRequiredCredentials ();
            if (method === 'GET') {
                if (Object.keys (query).length)
                    url += '?' + this.urlencode (query);
            } else {
                body = this.json (query);
            }
            let timestamp = '';
            let timeStampData = this.fetch (this.urls['api']['public'] + '/general/v3/time');
            timestamp = timeStampData['iso'];
            let payload = [timestamp, method, '/api' + url].join ('');
            if (body) {
                payload += body;
            }
            let signature = this.hmac (payload, this.secret, 'sha256', 'base64');
            headers = {
                'OK-ACCESS-KEY': this.apiKey,
                'OK-ACCESS-SIGN': this.decode (signature),
                'OK-ACCESS-TIMESTAMP': timestamp,
                'OK-ACCESS-PASSPHRASE': this.password,
                'Content-Type': 'application/json',
            };
        } else {
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        }
        url = this.urls['api'][api] + url;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
};
