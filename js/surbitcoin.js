'use strict';

// ---------------------------------------------------------------------------

const foxbit = require ('./foxbit.js');

// ---------------------------------------------------------------------------

module.exports = class surbitcoin extends foxbit {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'surbitcoin',
            'name': 'SurBitcoin',
            'countries': [ 'VE' ],
            'has': {
                'CORS': false,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27991511-f0a50194-6481-11e7-99b5-8f02932424cc.jpg',
                'api': {
                    'public': 'https://api.blinktrade.com/api',
                    'private': 'https://api.blinktrade.com/tapi',
                },
                'www': 'https://surbitcoin.com',
                'doc': 'https://blinktrade.com/docs',
            },
            'options': {
                'brokerId': '1', // https://blinktrade.com/docs/#brokers
            },
        });
    }
};
