'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var bequant$1 = require('../abstract/pro/bequant.js');
var bequant$2 = require('../bequant.js');

// ----------------------------------------------------------------------------
// ---------------------------------------------------------------------------
class bequant extends bequant$1["default"] {
    describe() {
        // eslint-disable-next-line new-cap
        const restInstance = new bequant$2["default"]();
        const restDescribe = restInstance.describe();
        const parentWsDescribe = super.describeData();
        const extended = this.deepExtend(restDescribe, parentWsDescribe);
        return this.deepExtend(extended, {
            'id': 'bequant',
            'name': 'Bequant',
            'countries': ['MT'], // Malta
            'pro': true,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/55248342-a75dfe00-525a-11e9-8aa2-05e9dca943c6.jpg',
                'api': {
                    'public': 'https://api.bequant.io/api/3',
                    'private': 'https://api.bequant.io/api/3',
                    'ws': {
                        'public': 'wss://api.bequant.io/api/3/ws/public',
                        'private': 'wss://api.bequant.io/api/3/ws/trading',
                    },
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

exports["default"] = bequant;
