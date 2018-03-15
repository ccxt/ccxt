'use strict';

//  ---------------------------------------------------------------------------

const bitcoincoid = require ('./bitcoincoid.js');

//  ---------------------------------------------------------------------------

module.exports = class indodax extends bitcoincoid {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'indodax',
            'name': 'INDODAX',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/37443283-2fddd0e4-281c-11e8-9741-b4f1419001b5.jpg',
                'api': {
                    'public': 'https://vip.bitcoin.co.id/api',
                    'private': 'https://vip.bitcoin.co.id/tapi',
                },
                'www': 'https://indodax.com',
                'doc': [
                    'https://vip.bitcoin.co.id/downloads/BITCOINCOID-API-DOCUMENTATION.pdf',
                ],
            },
        });
    }
};
