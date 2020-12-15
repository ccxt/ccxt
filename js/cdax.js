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
            'pro': false,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/102157692-fd406280-3e90-11eb-8d46-4511b617cd17.jpg',
                'www': 'https://cdax.io',
                'referral': 'https://cdax.io/invite?invite_code=esc74',
                'doc': 'https://github.com/cloudapidoc/API_Docs',
                'fees': 'https://cdax.io/about/fee',
            },
        });
    }
};
