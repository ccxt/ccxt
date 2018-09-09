'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');

//  ---------------------------------------------------------------------------

module.exports = class dragonex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'dragonex',
            'name': 'DragonEX',
            'countries': ['SG'], // Singapore
            'version': 'v1',
            'rateLimit': 2000,  // NOT THE ACTUAL RATE LIMIT
            'accessToken': undefined,
            'has': {},
            'urls': {
                'logo': '',
                'api': {
                    'public': 'https://openapi.dragonex.io/api', // all endpoints are authenticated
                    'private': 'https://openapi.dragonex.io/api',
                },
                'www': 'https://dragonex.io',
                'referral': '',
                'doc': 'https://github.com/Dragonexio/OpenApi/tree/master/docs/English',
                'fees': 'https://dragonex.zendesk.com/hc/en-us/articles/115002431171-Fee',
            },
            'api': {
                'private': {
                    'get': [
                        'coin/all/',
                        'user/own/',
                        'symbol/all/',
                        'market/kline/'
                    ],
                    'post': [
                        'token/new/'
                    ],
                },
            },
        })
    };

    async authenticate () {
        let response = await this.privatePostTokenNew ();
        this.accessToken = response['data']['token'];
        return this.accessToken;
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        this.checkRequiredCredentials ();
        let signablePath = '/' + this.version + '/' + path;
        let url = this.urls['api'][api] + signablePath;
        let shaContent = this.hash (body, 'sha1');
        let contentType = 'application/json';
        let date = this.emailGMT (this.milliseconds ());
        let canonicalizedDragonExHeaders = '';  // not sure what this is
        let string = [method, shaContent, contentType, date, canonicalizedDragonExHeaders].join('\n');
        string = string + '/api' + signablePath;
        let signed = this.hmac (string, this.secret, 'sha1', 'base64');
        headers = {
            'auth': this.apiKey + ':' + signed,
            'content-type': contentType,
            'content-sha1': shaContent,
            'date': date,
        };
        if (typeof this.accessToken !== 'undefined') {
            headers['token'] = this.accessToken;
        }
        return {'url': url, 'method': method, 'body': body, 'headers': headers}
    };
};
