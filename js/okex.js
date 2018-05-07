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
            'has': {
                'CORS': false,
                'futures': true,
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
                'doc': 'https://github.com/okcoin-okex/API-docs-OKEx.com',
                'fees': 'https://www.okex.com/fees.html',
            },
            'commonCurrencies': {
                'FAIR': 'FairGame',
                'HMC': 'Hi Mutual Society',
                'MAG': 'Maggie',
                'NANO': 'XRB',
                'YOYO': 'YOYOW',
            },
        });
    }

    calculateFee (symbol, type, side, amount, price, takerOrMaker = 'taker', params = {}) {
        let market = this.markets[symbol];
        let key = 'quote';
        let rate = market[takerOrMaker];
        let cost = parseFloat (this.costToPrecision (symbol, amount * rate));
        if (side === 'sell') {
            cost *= price;
        } else {
            key = 'base';
        }
        return {
            'type': takerOrMaker,
            'currency': market[key],
            'rate': rate,
            'cost': parseFloat (this.feeToPrecision (symbol, cost)),
        };
    }

    async fetchMarkets () {
        let markets = await super.fetchMarkets ();
        // TODO: they have a new fee schedule as of Feb 7
        // the new fees are progressive and depend on 30-day traded volume
        // the following is the worst case
        for (let i = 0; i < markets.length; i++) {
            if (markets[i]['spot']) {
                markets[i]['maker'] = 0.0015;
                markets[i]['taker'] = 0.0020;
            } else {
                markets[i]['maker'] = 0.0003;
                markets[i]['taker'] = 0.0005;
            }
        }
        return markets;
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
};
