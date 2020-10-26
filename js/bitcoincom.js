'use strict';

//  ---------------------------------------------------------------------------

const hitbtc = require ('./hitbtc.js');

// ---------------------------------------------------------------------------

module.exports = class bitcoincom extends hitbtc {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitcoincom',
            'name': 'bitcoin.com',
            'countries': [ 'KN' ],
            'urls': {
                'api': {
                    'ws': 'wss://api.exchange.bitcoin.com/api/2/ws',
                },
            },
        });
    }
};
