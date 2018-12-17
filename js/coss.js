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
            'version': 'v1',
            'comment': 'Certified exchange',
            'urls': {
                'logo': 'https://example.com/image.jpg',
                'api': 'https://coss.io/api',
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
                        'account/details',
                        'getmarketsummaries',
                        'market-price',
                    ],
                },
            },
        });
    }

    async fetchMarkets () {
        return '';
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let pathArray = (this.urls['api'] + '/' + this.version + '/' + path).split ('/');
        if (api === 'trade') {
            pathArray[2] = 'trade.' + pathArray[2];
            pathArray.splice (3, 0, 'c');
        } else if (api === 'engine') {
            pathArray[2] = 'engine.' + pathArray[2];
        }
        path = pathArray.join ('/');
        let url = undefined;
        if (method === 'GET' && path.indexOf ('account') < 0) {
            url = path + '?' + this.urlencode (params);
        } else {
            let request = this.urlencode ({ 'recvWindow': '5000', 'timestamp': this.nonce () });
            url = path + '?' + request;
            headers = {
                'Signature': this.hmac (request, this.secret, 'sha256', 'hex'),
                'Authorization': this.apiKey,
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
};
