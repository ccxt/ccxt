'use strict';

//  ---------------------------------------------------------------------------

const coinegg = require ('./coinegg.js');
const { ExchangeError } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class btctradeim extends coinegg {
    describe () {
        const result = this.deepExtend (super.describe (), {
            'id': 'btctradeim',
            'name': 'BtcTrade.im',
            'countries': [ 'HK' ],
            'urls': {
                'referral': 'https://m.baobi.com/invite?inv=1765b2',
                'logo': 'https://user-images.githubusercontent.com/1294454/36770531-c2142444-1c5b-11e8-91e2-a4d90dc85fe8.jpg',
                'api': {
                    'web': 'https://api.btctrade.im/coin',
                    'rest': 'https://api.btctrade.im/api/v1',
                },
                'www': 'https://www.btctrade.im',
                'doc': 'https://www.btctrade.im/help.api.html',
                'fees': 'https://www.btctrade.im/spend.price.html',
            },
            'status': {
                'status': 'error',
                'updated': undefined,
                'eta': undefined,
                'url': undefined,
            },
            'fees': {
                'trading': {
                    'maker': 0.2 / 100,
                    'taker': 0.2 / 100,
                },
                'funding': {
                    'withdraw': {
                        'BTC': 0.001,
                    },
                },
            },
            // see the fix below
            //     'options': {
            //         'quoteIds': [ 'btc', 'eth', 'usc' ],
            //     },
        });
        // a fix for PHP array_merge not overwriting "lists" (integer-indexed arrays)
        // https://github.com/ccxt/ccxt/issues/3343
        result['options']['quoteIds'] = [ 'btc', 'eth', 'usc' ];
        return result;
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const response = await this.fetch2 (path, api, method, params, headers, body);
        if (api === 'web') {
            return response;
        }
        const data = this.safeValue (response, 'data');
        if (data) {
            const code = this.safeString (response, 'code');
            if (code !== '0') {
                const message = this.safeString (response, 'msg', 'Error');
                throw new ExchangeError (message);
            }
            return data;
        }
        return response;
    }
};
