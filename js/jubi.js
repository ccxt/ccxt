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

    async fetchMarkets (params = {}) {
        const markets = await this.publicGetAllticker (params);
        const keys = Object.keys (markets);
        const result = [];
        for (let i = 0; i < keys.length; i++) {
            const id = keys[i];
            const baseId = id;
            const quoteId = 'cny';
            const base = this.commonCurrencyCode (baseId.toUpperCase ());
            const quote = this.commonCurrencyCode (quoteId.toUpperCase ());
            const symbol = base + '/' + quote;
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'info': id,
            });
        }
        return result;
    }
};
