'use strict';

//  ---------------------------------------------------------------------------

const hitbtc = require ('./hitbtc.js');

//  ---------------------------------------------------------------------------

module.exports = class fmfwio extends hitbtc {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'fmfwio',
            'name': 'FMFW.io',
            'countries': [ 'KN' ],
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/159177712-b685b40c-5269-4cea-ac83-f7894c49525d.jpg',
                'api': {
                    'public': 'https://api.fmfw.io',
                    'private': 'https://api.fmfw.io',
                },
                'www': 'https://fmfw.io',
                'doc': 'https://api.fmfw.io/api/2/explore/',
                'fees': 'https://fmfw.io/fees-and-limits',
                'referral': 'https://fmfw.io/referral/da948b21d6c92d69',
            },
            'fees': {
                'trading': {
                    'maker': this.parseNumber ('0.005'),
                    'taker': this.parseNumber ('0.005'),
                },
            },
        });
    }
};
