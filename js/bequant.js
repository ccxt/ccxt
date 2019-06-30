'use strict';

// ---------------------------------------------------------------------------

const hitbtc2 = require ('./hitbtc2');
// ---------------------------------------------------------------------------

module.exports = class bequant extends hitbtc2 {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bequant',
            'name': 'Bequant',
            'countries': [ 'MT' ], // Malta
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/55248342-a75dfe00-525a-11e9-8aa2-05e9dca943c6.jpg',
                'api': 'https://api.bequant.io',
                'www': 'https://bequant.io',
                'doc': [
                    'https://api.bequant.io/',
                ],
                'fees': [
                    'https://bequant.io/fees-and-limits',
                ],
                'referral': 'https://bequant.io',
            },
        });
    }
};
