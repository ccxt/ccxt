'use strict';

//  ---------------------------------------------------------------------------

const hitbtc = require ('./hitbtc.js');

//  ---------------------------------------------------------------------------

module.exports = class changellypro extends hitbtc {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'changellypro',
            'name': 'changelly pro',
            'countries': [ 'KN' ],
            'urls': {
                'logo': '',
                'api': {
                    'public': 'https://api.pro.changelly.com',
                    'private': 'https://api.pro.changelly.com',
                },
                'www': 'https://pro.changelly.com',
                'doc': 'https://api.pro.changelly.com',
                'fees': 'https://changelly.com/blog/changelly-pro-fee-structure/',
            },
            'fees': {
                'trading': {
                    'maker': 0.1 / 100,
                    'taker': 0.1 / 100,
                },
            },
        });
    }
};
