'use strict';

//  ---------------------------------------------------------------------------

const ndax = require ('./ndax.js');

// ---------------------------------------------------------------------------

module.exports = class zipmex extends ndax {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'zipmex',
            'name': 'Zipmex',
            'countries': [ 'AU', 'SG', 'TH', 'ID' ], // Australia, Singapore, Thailand, Indonesia
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/146103275-c39a34d9-68a4-4cd2-b1f1-c684548d311b.jpg',
                'test': undefined,
                'api': {
                    'public': 'https://apws.zipmex.com:8443/AP',
                    'private': 'https://apws.zipmex.com:8443/AP',
                    'ws': 'wss://apws.zipmex.com/WSGateway',
                },
                'www': 'https://zipmex.com/',
                'referral': 'https://trade.zipmex.com/global/accounts/sign-up?aff=KLm7HyCsvN',
                'fees': 'https://zipmex.com/fee-schedule',
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'taker': this.parseNumber ('0.002'),
                    'maker': this.parseNumber ('0.002'),
                },
            },
        });
    }
};
