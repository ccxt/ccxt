'use strict';

//  ---------------------------------------------------------------------------

const okcoinusd = require ('./okcoinusd.js');

//  ---------------------------------------------------------------------------

module.exports = class allcoin extends okcoinusd {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'allcoin',
            'name': 'Allcoin',
            'countries': 'CA',
            'has': {
                'CORS': false,
            },
            'extension': '',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/31561809-c316b37c-b061-11e7-8d5a-b547b4d730eb.jpg',
                'api': {
                    'web': 'https://www.allcoin.com',
                    'public': 'https://api.allcoin.com/api',
                    'private': 'https://api.allcoin.com/api',
                },
                'www': 'https://www.allcoin.com',
                'doc': 'https://www.allcoin.com/About/APIReference',
            },
            'api': {
                'web': {
                    'get': [
                        'Home/MarketOverViewDetail/',
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
        });
    }

    async fetchMarkets () {
        let result = [];
        let response = await this.webGetHomeMarketOverViewDetail ();
        let coins = response['marketCoins'];
        for (let j = 0; j < coins.length; j++) {
            let markets = coins[j]['Markets'];
            for (let k = 0; k < markets.length; k++) {
                let market = markets[k]['Market'];
                let base = market['Primary'];
                let quote = market['Secondary'];
                let baseId = base.toLowerCase ();
                let quoteId = quote.toLowerCase ();
                let id = baseId + '_' + quoteId;
                let symbol = base + '/' + quote;
                let active = market['TradeEnabled'] && market['BuyEnabled'] && market['SellEnabled'];
                result.push ({
                    'id': id,
                    'symbol': symbol,
                    'base': base,
                    'quote': quote,
                    'baseId': baseId,
                    'quoteId': quoteId,
                    'active': active,
                    'type': 'spot',
                    'spot': true,
                    'future': false,
                    'maker': market['AskFeeRate'], // BidFeeRate 0, AskFeeRate 0.002, we use just the AskFeeRate here
                    'taker': market['AskFeeRate'], // BidFeeRate 0, AskFeeRate 0.002, we use just the AskFeeRate here
                    'precision': {
                        'amount': market['PrimaryDigits'],
                        'price': market['SecondaryDigits'],
                    },
                    'limits': {
                        'amount': {
                            'min': market['MinTradeAmount'],
                            'max': market['MaxTradeAmount'],
                        },
                        'price': {
                            'min': market['MinOrderPrice'],
                            'max': market['MaxOrderPrice'],
                        },
                        'cost': {
                            'min': undefined,
                            'max': undefined,
                        },
                    },
                    'info': market,
                });
            }
        }
        return result;
    }

    parseOrderStatus (status) {
        if (status === -1)
            return 'canceled';
        if (status === 0)
            return 'open';
        if (status === 1)
            return 'open'; // partially filled
        if (status === 2)
            return 'closed';
        if (status === 10)
            return 'canceled';
        return status;
    }

    getCreateDateField () {
        // allcoin typo create_data instead of create_date
        return 'create_data';
    }

    getOrdersField () {
        // allcoin typo order instead of orders (expected based on their API docs)
        return 'order';
    }
};
