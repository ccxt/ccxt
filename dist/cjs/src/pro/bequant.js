'use strict';

var hitbtc = require('./hitbtc.js');
var bequant$1 = require('../bequant.js');

//  ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
class bequant extends hitbtc {
    describe() {
        // eslint-disable-next-line new-cap
        const restInstance = new bequant$1();
        const restDescribe = restInstance.describe();
        const extended = this.deepExtend(super.describe(), restDescribe);
        return this.deepExtend(extended, {
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
                'referral': 'https://bequant.io',
            },
        });
    }
}

module.exports = bequant;
