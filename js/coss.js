'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const CryptoJS = require ('crypto-js');

//  ---------------------------------------------------------------------------

module.exports = class coss extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'coss',
            'name': 'COSS',
            'country': [ 'SG', 'NL' ],
            'rateLimit': 1000,
            'version': '1',
            'comment': 'Certified exchange',
            'urls': {
                'logo': 'https://example.com/image.jpg',
                'api': 'https://coss.io/api/v1',
                'www': 'https://coss.io/',
                'doc': [
                    'https://api.coss.io/v1/spec',
                ],
            },
            'api': {
                'engine': {
                    'get': [
                        'dp',
                        'ht',
                    ],
                },
                'trade': {
                    'get': [
                        'exchange-info',
                        'account/balances',
                    ],
                },
            },
        });
    }

    async fetchMarkets () {
        return '';
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let pathArr = (this.urls['api'] + '/' + path).split ('/');
        if (api === 'trade') {
            pathArr[2] = 'trade.' + pathArr[2];
            pathArr.splice (3, 0, 'c');
        } else if (api === 'engine') {
            pathArr[2] = 'engine.' + pathArr[2];
        }
        path = pathArr.join ('/');
        let url = undefined;
        if (method === 'GET' && path.indexOf ('account') < 0) {
            url = path + '?' + this.urlencode (params);
        } else {
            let request = this.urlencode ({ 'timestamp': '10', 'recvWindow': '5000' });
            url = path + '?' + request;
            headers = {
                'Signature': this.hmac (request, CryptoJS.enc.Base64.parse (this.secret), 'sha256', 'hex'),
                'Authorization': this.apiKey,
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
};
