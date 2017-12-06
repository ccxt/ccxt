"use strict";

// ---------------------------------------------------------------------------

const bittrex = require ('./bittrex.js')

// ---------------------------------------------------------------------------

module.exports = class bleutrade extends bittrex {

    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bleutrade',
            'name': 'Bleutrade',
            'countries': 'BR', // Brazil
            'rateLimit': 1000,
            'version': 'v2',
            'hasCORS': true,
            'hasFetchTickers': true,
            'hasFetchOHLCV': false,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/30303000-b602dbe6-976d-11e7-956d-36c5049c01e7.jpg',
                'api': {
                    'public': 'https://bleutrade.com/api',
                    'account': 'https://bleutrade.com/api',
                    'market': 'https://bleutrade.com/api',
                },
                'www': 'https://bleutrade.com',
                'doc': 'https://bleutrade.com/help/API',
            },
        });
    }

    async fetchMarkets () {
        let markets = await this.publicGetMarkets ();
        let result = [];
        for (let p = 0; p < markets['result'].length; p++) {
            let market = markets['result'][p];
            let id = market['MarketName'];
            let base = market['MarketCurrency'];
            let quote = market['BaseCurrency'];
            base = this.commonCurrencyCode (base);
            quote = this.commonCurrencyCode (quote);
            let symbol = base + '/' + quote;
            let precision = {
                'amount': 8,
                'price': 8,
            };
            let active = market['IsActive'];
            result.push (this.extend (this.fees['trading'], {
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'active': active,
                'info': market,
                'lot': Math.pow (10, -precision['amount']),
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': market['MinTradeSize'],
                        'max': undefined,
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'cost': {
                        'min': 0,
                        'max': undefined,
                    },
                },
            }));
        }
        return result;
    }

    async fetchOrderBook (symbol, params = {}) {
        await this.loadMarkets ();
        let response = await this.publicGetOrderbook (this.extend ({
            'market': this.marketId (symbol),
            'type': 'ALL',
            'depth': 50,
        }, params));
        let orderbook = response['result'];
        return this.parseOrderBook (orderbook, undefined, 'buy', 'sell', 'Rate', 'Quantity');
    }
}
