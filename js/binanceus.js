'use strict';

//  ---------------------------------------------------------------------------

const binance = require ('./binance.js');

//  ---------------------------------------------------------------------------

module.exports = class binanceus extends binance {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'binanceus',
            'name': 'Binance US',
            'countries': [ 'US' ], // US
            'certified': false,
            'pro': true,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/65177307-217b7c80-da5f-11e9-876e-0b748ba0a358.jpg',
                'api': {
                    'web': 'https://www.binance.us',
                    'sapi': 'https://api.binance.us/sapi/v1',
                    'wapi': 'https://api.binance.us/wapi/v3',
                    'public': 'https://api.binance.us/api/v3',
                    'private': 'https://api.binance.us/api/v3',
                },
                'www': 'https://www.binance.us',
                'referral': 'https://www.binance.us/?ref=35005074',
                'doc': 'https://github.com/binance-us/binance-official-api-docs',
                'fees': 'https://www.binance.us/en/fee/schedule',
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'taker': this.parseNumber ('0.001'), // 0.1% trading fee, zero fees for all trading pairs before November 1
                    'maker': this.parseNumber ('0.001'), // 0.1% trading fee, zero fees for all trading pairs before November 1
                },
            },
            'options': {
                'quoteOrderQty': false,
            },
        });
    }
};

