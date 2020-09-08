'use strict';

//  ---------------------------------------------------------------------------

const hitbtc = require ('./hitbtc.js');

//  ---------------------------------------------------------------------------

module.exports = class bitcoincom extends hitbtc {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitcoincom',
            'name': 'bitcoin.com',
            'countries': [ 'KN' ],
            'urls': {
                'logo': '',
                'api': {
                    'public': 'https://api.exchange.bitcoin.com',
                    'private': 'https://api.exchange.bitcoin.com',
                },
                'www': 'https://exchange.bitcoin.com',
                'doc': 'https://api.exchange.bitcoin.com/api/2/explore',
                'fees': 'https://exchange.bitcoin.com/fees-and-limits',
            },
            'fees': {
                'trading': {
                    'maker': 0.15 / 100,
                    'taker': 0.2 / 100,
                },
            },
        });
    }
};
