"use strict";

// ---------------------------------------------------------------------------

const liqui = require ('./liqui.js')

// ---------------------------------------------------------------------------

module.exports = class tidex extends liqui {

    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'tidex',
            'name': 'Tidex',
            'countries': 'UK',
            'rateLimit': 1000,
            'version': '3',
            // 'hasCORS': false,
            // 'hasFetchTickers': true,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/30781780-03149dc4-a12e-11e7-82bb-313b269d24d4.jpg',
                'api': {
                    'public': 'https://api.tidex.com/api',
                    'private': 'https://api.tidex.com/tapi',
                },
                'www': 'https://tidex.com',
                'doc': 'https://tidex.com/public-api',
                'fees': 'https://tidex.com/pairs-spec'
            },
        });
    }
}
