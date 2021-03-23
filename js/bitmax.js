'use strict';

//  ---------------------------------------------------------------------------

const ascendex = require ('./ascendex.js');

//  ---------------------------------------------------------------------------

module.exports = class bitmax extends ascendex {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitmax',
            'name': 'BitMax',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/66820319-19710880-ef49-11e9-8fbe-16be62a11992.jpg',
                'api': 'https://bitmax.io',
                'test': 'https://bitmax-test.io',
                'www': 'https://bitmax.io',
                'doc': [
                    'https://bitmax-exchange.github.io/bitmax-pro-api/#bitmax-pro-api-documentation',
                ],
                'fees': 'https://bitmax.io/#/feeRate/tradeRate',
                'referral': 'https://bitmax.io/#/register?inviteCode=EL6BXBQM',
            },
        });
    }
};
