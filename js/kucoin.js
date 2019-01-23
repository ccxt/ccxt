'use strict';

// ---------------------------------------------------------------------------

const kucoin = require ('./kucoin.js');

// ---------------------------------------------------------------------------

module.exports = class kucoin2 extends kucoin {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'kucoin2',
            'name': 'KuCoin 2',
            'country': ['HK'],
            'rateLimit': 1000,
            'version': 'v1',
            'certified': true,
            'comment': 'This comment is optional',
            'urls': {
                'logo': 'https://example.com/image.jpg',
                'api': {
                    'public': 'https://openapi-sandbox.kucoin.com/api',
                    'private': 'https://openapi-sandbox.kucoin.com/api',
                },
                'www': 'https://www.kucoin.com',
                'doc': [
                    'https://docs.kucoin.com',
                ],
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
                'password': true,
            },
            'api': {
                'public': {
                    'get': [
                        'timestamp',
                        'symbols',
                        'market/orderbook/level{level}',
                        'market/histories',
                        'market/candles',
                        'market/stats',
                        'currencies',
                        'currencies/{currency}'
                    ],
                    'post': [
                        'bullet-public',
                    ],
                },
                'private': {
                    'get': [
                        'accounts',
                        'accounts/{accountId}',
                        'accounts/{accountId}/ledgers',
                        'accounts/{accountId}/holds',
                        'deposit-addresses',
                        'deposits',
                        'withdrawals',
                        'withdrawals/quotas',
                        'orders',
                        'orders/{order-id}',
                        'fills',
                    ],
                    'post': [
                        'accounts',
                        'accounts/inner-transfer',
                        'deposit-addresses',
                        'withdrawals',
                        'orders',
                        'bullet-private',

                    ],
                    'delete': [
                        'withdrawals/{withdrawalId}',
                        'orders',
                    ],
                },
            },
        });
    }

    async loadTimeDifference () {
        const response = await this.publicGetTimestamp ();
        const after = this.milliseconds ();
        const kucoinTime = this.safeInteger (response, 'data');
        this.options['timeDifference'] = parseInt (after - kucoinTime);
        return this.options['timeDifference'];
    }

    async fetchMarkets (params = {}) {
        return this.publicGetTimestamp ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let endpoint = '/' + this.version + '/' + this.implodeParams (path, params);
        let url = this.urls['api'][api] + endpoint;
        let query = this.omit (params, this.extractParams (path));
        const timestamp = this.nonce ();
        headers = this.extend (headers, {
            'KC-API-KEY': this.apiKey,
            'KC-API-TIMESTAMP': timestamp,
            'KC-API-PASSPHRASE': this.password,
            'KC-API-SIGN': '',
        });
        if (api === 'private') {
            this.checkRequiredCredentials ();
        }
        console.log (query);
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

}
