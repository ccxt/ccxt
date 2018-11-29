'use strict';

//  ---------------------------------------------------------------------------

const bittrex = require ('./bittrex');

//  ---------------------------------------------------------------------------

module.exports = class bittrexinternational extends bittrex {
    describe () {
        return this.deepExtend (super.describe (), {
            'urls': {
                'api': {
                    'public': 'https://international.bittrex.com/api',
                    'account': 'https://international.bittrex.com/api',
                    'market': 'https://international.bittrex.com/api',
                    'v2': 'https://international.bittrex.com/api/v2.0/pub',
                },
            },
        });
    }
};
