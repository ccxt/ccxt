'use strict';

// ---------------------------------------------------------------------------

const okex3 = require ('./okex3.js');

// ---------------------------------------------------------------------------

module.exports = class okcoin extends okex3 {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'okcoin',
            'name': 'OKCoin',
            'countries': [ 'CN', 'US' ],
            'hostname': 'okcoin.com',
            'pro': true,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/51840849/87295551-102fbf00-c50e-11ea-90a9-462eebba5829.jpg',
                'www': 'https://www.okcoin.com',
                'doc': 'https://www.okcoin.com/docs/en/',
                'fees': 'https://www.okcoin.com/coin-fees',
                'referral': 'https://www.okcoin.com/account/register?flag=activity&channelId=600001513',
            },
            'fees': {
                'trading': {
                    'taker': 0.002,
                    'maker': 0.001,
                },
            },
            'options': {
                'fetchMarkets': [ 'spot' ],
            },
        });
    }
};
