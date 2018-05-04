'use strict';

// ---------------------------------------------------------------------------

const qryptos = require ('./qryptos.js');

// ---------------------------------------------------------------------------

module.exports = class quoinex extends qryptos {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'quoinex',
            'name': 'QUOINEX',
            'countries': [ 'JP', 'SG', 'VN' ],
            'version': '2',
            'rateLimit': 1000,
            'has': {
                'CORS': false,
                'fetchTickers': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/35047114-0e24ad4a-fbaa-11e7-96a9-69c1a756083b.jpg',
                'api': 'https://api.quoine.com',
                'www': 'https://quoinex.com/',
                'doc': [
                    'https://developers.quoine.com',
                    'https://developers.quoine.com/v2',
                ],
                'fees': 'https://news.quoinex.com/fees/',
            },
        });
    }
};
