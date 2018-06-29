'use strict';

// ---------------------------------------------------------------------------

const fybse = require ('./fybse.js');

// ---------------------------------------------------------------------------

module.exports = class fybsg extends fybse {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'fybsg',
            'name': 'FYB-SG',
            'countries': [ 'SG' ], // Singapore
            'has': {
                'CORS': false,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766513-3364d56a-5edb-11e7-9e6b-d5898bb89c81.jpg',
                'api': 'https://www.fybsg.com/api/SGD',
                'www': 'https://www.fybsg.com',
                'doc': 'http://docs.fyb.apiary.io',
            },
            'markets': {
                'BTC/SGD': { 'id': 'SGD', 'symbol': 'BTC/SGD', 'base': 'BTC', 'quote': 'SGD' },
            },
        });
    }
};
