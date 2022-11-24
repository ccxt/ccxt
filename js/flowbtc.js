'use strict';

//  ---------------------------------------------------------------------------

const ndax = require ('./ndax.js');

//  ---------------------------------------------------------------------------

module.exports = class flowbtc extends ndax {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'flowbtc',
            'name': 'flowBTC',
            'countries': [ 'BR' ], // Brazil
            'rateLimit': 1000,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/51840849/87443317-01c0d080-c5fe-11ea-95c2-9ebe1a8fafd9.jpg',
                'api': {
                    'public': 'https://api.flowbtc.com.br:8443/ap/',
                    'private': 'https://api.flowbtc.com.br:8443/ap/',
                },
                'www': 'https://www.flowbtc.com.br',
                'doc': 'https://www.flowbtc.com.br/api.html',
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': 0.0025,
                    'taker': 0.005,
                },
            },
        });
    }
};
