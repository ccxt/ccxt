'use strict';

// ---------------------------------------------------------------------------

const okcoinusd = require ('./okcoinusd.js');

// ---------------------------------------------------------------------------

module.exports = class okex extends okcoinusd {

    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'okex',
            'name': 'OKEX',
            'countries': [ 'CN', 'US' ],
            'hasCORS': false,
            'hasFutureMarkets': true,
            'hasFetchTickers': true,
            'has': {
                'fetchTickers': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/32552768-0d6dd3c6-c4a6-11e7-90f8-c043b64756a7.jpg',
                'api': {
                    'web': 'https://www.okex.com/v2',
                    'public': 'https://www.okex.com/api',
                    'private': 'https://www.okex.com/api',
                },
                'www': 'https://www.okex.com',
                'doc': 'https://www.okex.com/rest_getStarted.html',
                'fees': 'https://www.okex.com/fees.html',
            },
        });
    }

    commonCurrencyCode (currency) {
        const currencies = {
            'FAIR': 'FairGame',
        };
        if (currency in currencies)
            return currencies[currency];
        return currency;
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let request = {};
        let response = await this.publicGetTickers (this.extend (request, params));
        let tickers = response['tickers'];
        let timestamp = parseInt (response['date']) * 1000;
        let result = {};
        for (let i = 0; i < tickers.length; i++) {
            let ticker = tickers[i];
            let market = undefined;
            if ('symbol' in ticker) {
                let marketId = ticker['symbol'];
                if (marketId in this.markets_by_id)
                    market = this.markets_by_id[marketId];
            }
            ticker = this.parseTicker (this.extend (tickers[i], { 'timestamp': timestamp }), market);
            let symbol = ticker['symbol'];
            result[symbol] = ticker;
        }
        return result;
    }
}
