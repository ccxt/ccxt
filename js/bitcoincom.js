'use strict';

//  ---------------------------------------------------------------------------

const hitbtc = require ('./hitbtc.js');

//  ---------------------------------------------------------------------------

module.exports = class bitcoincom extends hitbtc {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitcoincom',
            'name': 'bitcoin.com',
            'countries': [ 'KN' ],
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/97296144-514fa300-1861-11eb-952b-3d55d492200b.jpg',
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
