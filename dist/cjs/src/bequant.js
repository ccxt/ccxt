'use strict';

var hitbtc = require('./hitbtc.js');

// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
class bequant extends hitbtc {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'bequant',
            'name': 'Bequant',
            'countries': ['MT'],
            'pro': true,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/55248342-a75dfe00-525a-11e9-8aa2-05e9dca943c6.jpg',
                'api': {
                    'public': 'https://api.bequant.io/api/3',
                    'private': 'https://api.bequant.io/api/3',
                },
                'www': 'https://bequant.io',
                'doc': [
                    'https://api.bequant.io/',
                ],
                'fees': [
                    'https://bequant.io/fees-and-limits',
                ],
                'referral': 'https://bequant.io/referral/dd104e3bee7634ec',
            },
        });
    }
}

module.exports = bequant;
