'use strict';

// ---------------------------------------------------------------------------

const gdax = require ('./gdax.js');

// ---------------------------------------------------------------------------

module.exports = class coinbasepro extends gdax {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'coinbasepro',
            'name': 'Coinbase Pro',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/8557965/41755899-8f904926-75a7-11e8-87b3-d73ed8012d14.png',
                'api': 'https://api.pro.coinbase.com',
                'www': 'https://pro.coinbase.com/',
                'doc': 'https://docs.gdax.com',
                'fees': [
                    'https://www.gdax.com/fees',
                    'https://support.gdax.com/customer/en/portal/topics/939402-depositing-and-withdrawing-funds/articles',
                ],
            },
        });
    }
};
