'use strict';

// ---------------------------------------------------------------------------

const hitbtc2 = require ('./hitbtc2');
// ---------------------------------------------------------------------------

module.exports = class bequant extends hitbtc2 {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bequant',
            'name': 'Bequant',
            'countries': [ 'HK' ],
            'urls': {
                'logo': 'https://i.imgur.com/WK3S28s.jpg',
                'api': 'https://api.bequant.io',
                'www': 'https://bequant.io',
                'doc': [
                    'https://api.bequant.io/',
                ],
                'fees': [
                    'https://bequant.io/fees-and-limits',
                ],
            },
        });
    }
};
