'use strict';

// ---------------------------------------------------------------------------

const foxbit = require ('./foxbit.js');

// ---------------------------------------------------------------------------

module.exports = class urdubit extends foxbit {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'urdubit',
            'name': 'UrduBit',
            'countries': [ 'PK' ],
            'has': {
                'CORS': false,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27991453-156bf3ae-6480-11e7-82eb-7295fe1b5bb4.jpg',
                'api': {
                    'public': 'https://api.blinktrade.com/api',
                    'private': 'https://api.blinktrade.com/tapi',
                },
                'www': 'https://urdubit.com',
                'doc': 'https://blinktrade.com/docs',
            },
            'options': {
                'brokerId': '8', // https://blinktrade.com/docs/#brokers
            },
        });
    }
};
