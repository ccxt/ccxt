"use strict";

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

    parseTickers (tickers, timestamp, symbols) {
        const tickersLength = tickers.length;
        if (!tickers || (tickersLength < 1)) {
            return {};
        }
        let tickers_result = {};
        for (let i = 0; i < tickers.length; i++) {
            let market = undefined;
            if ('symbol' in tickers[i]) {
                if (tickers[i]['symbol'] in this.markets_by_id) {
                    market = this.markets_by_id[tickers[i]['symbol']];
                }
            }
            let ticker = this.extend (tickers[i], { 'timestamp': timestamp });
            ticker = this.parseTicker (ticker, market);
            tickers_result[ticker['symbol']] = ticker;
        }
        return tickers_result;
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let method = 'publicGetTickers';
        let request = {};
        let response = await this[method] (this.extend (request, params));
        let timestamp = parseInt (response['date']) * 1000;
        return this.parseTickers (response['tickers'], timestamp, symbols);
    }
}
