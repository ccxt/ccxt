'use strict';

// ---------------------------------------------------------------------------

const btcbox = require ('./btcbox.js');

// ---------------------------------------------------------------------------

module.exports = class jubi extends btcbox {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'jubi',
            'name': 'jubi.com',
            'countries': [ 'CN' ],
            'rateLimit': 1500,
            'version': 'v1',
            'has': {
                'CORS': false,
                'fetchTickers': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766581-9d397d9a-5edd-11e7-8fb9-5d8236c0e692.jpg',
                'api': 'https://www.jubi.com/api',
                'www': 'https://www.jubi.com',
                'doc': 'https://www.jubi.com/help/api.html',
            },
        });
    }

    async fetchMarkets () {
        let markets = await this.publicGetAllticker ();
        let keys = Object.keys (markets);
        let result = [];
        for (let p = 0; p < keys.length; p++) {
            let id = keys[p];
            let base = id.toUpperCase ();
            let quote = 'CNY'; // todo
            let symbol = base + '/' + quote;
            base = this.commonCurrencyCode (base);
            quote = this.commonCurrencyCode (quote);
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': id,
            });
        }
        return result;
    }
};
