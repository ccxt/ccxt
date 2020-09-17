'use strict';

//  ---------------------------------------------------------------------------

const binance = require ('./binance.js');

//  ---------------------------------------------------------------------------

module.exports = class gooplex extends binance {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'gooplex',
            'name': 'Gooplex',
            'countries': [ 'BR' ], // US
            'certified': false,
            'pro': false,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/228850/93481157-a0a2cb00-f8d4-11ea-8608-d56dd916a9ed.jpg',
                'api': {
                    'web': 'https://www.gooplex.com.br',
                    'public': 'https://www.gooplex.com.br/api/v1',
                    'private': 'https://www.gooplex.com.br/api/v3',
                    'v3': 'https://www.gooplex.com.br/api/v3',
                    'v1': 'https://www.gooplex.com.br/api/v1',
                },
                'www': 'https://www.gooplex.com.br',
                'referral': 'https://www.gooplex.com.br/account/signup?ref=H8QQ57WT',
                'doc': 'https://www.gooplex.com.br/apidocs/#api-document-description',
                'fees': 'https://gooplex.zendesk.com/hc/pt/articles/360049326131-O-que-s%C3%A3o-taxas-de-negocia%C3%A7%C3%A3o-',
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'taker': 0.0022, // 0.22% trading fee
                    'maker': 0.0022, // 0.22% trading fee
                },
            },
            'options': {
                'quoteOrderQty': false,
            },
        });
    }
};

