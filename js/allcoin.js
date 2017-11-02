"use strict";

//  ---------------------------------------------------------------------------

const okcoinusd = require ('./okcoinusd.js')

//  ---------------------------------------------------------------------------

module.exports = class allcoin extends okcoinusd {

    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'allcoin',
            'name': 'Allcoin',
            'countries': 'CA',
            'hasCORS': false,
            'extension': '',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/31561809-c316b37c-b061-11e7-8d5a-b547b4d730eb.jpg',
                'api': {
                    'web': 'https://allcoin.com',
                    'public': 'https://api.allcoin.com/api',
                    'private': 'https://api.allcoin.com/api',
                },
                'www': 'https://allcoin.com',
                'doc': 'https://allcoin.com/About/APIReference',
            },
            'api': {
                'web': {
                    'get': [
                        'marketoverviews/',
                    ],
                },
                'public': {
                    'get': [
                        'depth',
                        'kline',
                        'ticker',
                        'trades',
                    ],
                },
                'private': {
                    'post': [
                        'batch_trade',
                        'cancel_order',
                        'order_history',
                        'order_info',
                        'orders_info',
                        'repayment',
                        'trade',
                        'trade_history',
                        'userinfo',
                    ],
                },
            },
            'markets': undefined,
        });
    }

    async fetchMarkets () {
        let currencies = [ 'BTC', 'ETH', 'USD', 'QTUM' ];
        let result = [];
        for (let i = 0; i < currencies.length; i++) {
            let currency = currencies[i];
            let response = await this.webGetMarketoverviews ({
                'type': 'full',
                'secondary': currency,
            });
            let markets = response['Markets'];
            for (let k = 0; k < markets.length; k++) {
                let market = markets[k];
                let base = market['Primary'];
                let quote = market['Secondary'];
                let id = base.toLowerCase () + '_' + quote.toLowerCase ();
                let symbol = base + '/' + quote;
                result.push ({
                    'id': id,
                    'symbol': symbol,
                    'base': base,
                    'quote': quote,
                    'type': 'spot',
                    'spot': true,
                    'future': false,
                    'info': market,
                });
            }
        }
        return result;
    }

    getOrderStatus (status) {
        if (status == -1)
            return 'canceled';
        if (status == 0)
            return 'open';
        if (status == 1)
            return 'partial';
        if (status == 2)
            return 'closed';
        if (status == 10)
            return 'canceled';
        return status;
    }
}
