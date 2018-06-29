'use strict';

// ---------------------------------------------------------------------------

const foxbit = require ('./foxbit.js');

// ---------------------------------------------------------------------------

module.exports = class chilebit extends foxbit {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'chilebit',
            'name': 'ChileBit',
            'countries': [ 'CL' ],
            'has': {
                'CORS': false,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27991414-1298f0d8-647f-11e7-9c40-d56409266336.jpg',
                'api': {
                    'public': 'https://api.blinktrade.com/api',
                    'private': 'https://api.blinktrade.com/tapi',
                },
                'www': 'https://chilebit.net',
                'doc': 'https://blinktrade.com/docs',
            },
            'options': {
                'brokerId': '9', // https://blinktrade.com/docs/#brokers
            },
        });
    }
};
