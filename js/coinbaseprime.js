'use strict';

// ---------------------------------------------------------------------------

const gdax = require ('./gdax.js');

// ---------------------------------------------------------------------------

module.exports = class coinbaseprime extends gdax {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'coinbaseprime',
            'name': 'Coinbase Prime',
            'urls': {
                'test': 'https://api-public.sandbox.prime.coinbase.com',
                'logo': 'https://ph-files.imgix.net/58ceb872-d4a9-4cf2-99ea-def0fceb13d7?auto=format&auto=compress&codec=mozjpeg&cs=strip&w=80&h=80&fit=crop',
                'api': 'https://api.prime.coinbase.com',
                'www': 'https://prime.coinbase.com/',
                'doc': 'https://docs.prime.coinbase.com/',
                'fees': [
                    'https://docs.prime.coinbase.com/#fees',
                    'https://support.prime.coinbase.com/customer/en/portal/articles/2945629-fees?b_id=17475',
                ],
            },
        });
    }
};
