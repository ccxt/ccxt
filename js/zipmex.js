'use strict';

//  ---------------------------------------------------------------------------

const ndax = require ('./ndax.js');

//  ---------------------------------------------------------------------------

module.exports = class zipmex extends ndax {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'zipmex',
            'name': 'Zipmex',
            'countries': [ 'AU', 'SG', 'TH', 'ID' ], // Australia, Singapore, Thailand, Indonesia
            'certified': false,
            'pro': true,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/65177307-217b7c80-da5f-11e9-876e-0b748ba0a358.jpg',
                'test': undefined,
                'api': {
                    'public': 'https://apws.zipmex.com:8443/AP',
                    'private': 'https://apws.zipmex.com:8443/AP',
                    // 'ws': 'wss://apws.zipmex.com/WSGateway'
                },

                'api': {
                    'web': 'https://www.binance.us',
                    'sapi': 'https://api.binance.us/sapi/v1',
                    'wapi': 'https://api.binance.us/wapi/v3',
                    'public': 'https://api.binance.us/api/v1',
                    'private': 'https://api.binance.us/api/v3',
                    'v1': 'https://api.binance.us/api/v1',
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

