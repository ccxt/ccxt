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
            'hasFetchTickers': true,
            'hasCORS': false,
            'urls': {
                'logo': 'https://quoinex.com/0756a0e2e1614c9db8ef7185d222435a.png',
                'api': 'https://api.quoine.com',
                'www': 'https://quoinex.com/',
                'doc': [
                    'https://developers.quoine.com',
                    'https://developers.quoine.com/v2',
                ],
                'fees': 'https://quoine.zendesk.com/hc/en-us/articles/115011281488-Fees',
            },
        });
    }
};
