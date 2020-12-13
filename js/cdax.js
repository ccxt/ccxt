'use strict';

// ---------------------------------------------------------------------------

const huobipro = require ('./huobipro.js');

// ---------------------------------------------------------------------------

module.exports = class cdax extends huobipro {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'cdax',
            'name': 'CDAX',
            'countries': [ 'RU' ],
            'hostname': 'cdax.io',
            'pro': true,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/85734211-85755480-b705-11ea-8b35-0b7f1db33a2f.jpg',
                'api': {
                    'market': 'https://{hostname}',
                    'public': 'https://{hostname}',
                    'private': 'https://{hostname}',
                },
                'www': 'https://cdax.io',
                'referral': 'https://www.huobi.com.ru/invite/?invite_code=esc74',
                'doc': 'https://github.com/cloudapidoc/API_Docs',
                'fees': 'https://cdax.io/about/fee',
            },
        });
    }
};
