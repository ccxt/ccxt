'use strict';

// Bitazza uses Alphapoint, also used by ndax
// In order to use private endpoints, the following are required:
// - 'apiKey'
// - 'secret',
// - 'uid' (userId in the api info)
// - 'login' (the email address used to log into the UI)
// - 'password' (the password used to log into the UI)

const ndax = require ('./ndax.js');

//  ---------------------------------------------------------------------------

module.exports = class bitazza extends ndax {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitazza',
            'name': 'Bitazza',
            'countries': [ 'THA' ],
            'certified': false,
            'pro': false,
            'urls': {
                'test': undefined,
                'api': {
                    'public': 'https://apexapi.bitazza.com:8443/AP',
                    'private': 'https://apexapi.bitazza.com:8443/AP',
                },
                'www': 'https://bitazza.com/',
                'referral': '',
                'fees': 'https://bitazza.com/fees.html',
                'doc': [
                    'https://api-doc.bitazza.com/',
                ],
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'taker': this.parseNumber ('0.0025'),
                    'maker': this.parseNumber ('0.0025'),
                },
            },
        });
    }
};
