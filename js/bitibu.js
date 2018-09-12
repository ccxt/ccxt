'use strict';

// ---------------------------------------------------------------------------

const acx = require ('./acx.js');

// ---------------------------------------------------------------------------

module.exports = class bitibu extends acx {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitibu',
            'name': 'Bitibu',
            'countries': [ 'CY' ],
            'has': {
                'CORS': false,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/45444675-c9ce6680-b6d0-11e8-95ab-3e749a940de1.jpg',
                'extension': '.json',
                'api': 'https://bitibu.com',
                'www': 'https://bitibu.com',
                'doc': 'https://bitibu.com/documents/api_v2',
            },
        });
    }
};
