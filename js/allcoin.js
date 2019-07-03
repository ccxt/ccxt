'use strict';

//  ---------------------------------------------------------------------------

const okcoinusd = require ('./okcoinusd.js');

//  ---------------------------------------------------------------------------

module.exports = class allcoin extends okcoinusd {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'allcoin',
            'name': 'Allcoin',
            'countries': [ 'CA' ],
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
                'doc': 'https://www.allcoin.com/api_market/market',
                'referral': 'https://www.allcoin.com',
            },
            'status': {
                'status': 'error',
                'updated': undefined,
                'eta': undefined,
                'url': undefined,
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

    async fetchMarkets (params = {}) {
        const result = [];
        const response = await this.webGetHomeMarketOverViewDetail (params);
        const coins = response['marketCoins'];
        for (let j = 0; j < coins.length; j++) {
            const markets = coins[j]['Markets'];
            for (let k = 0; k < markets.length; k++) {
                const market = markets[k]['Market'];
                let base = this.safeString (market, 'Primary');
                let quote = this.safeString (market, 'Secondary');
                const baseId = base.toLowerCase ();
                const quoteId = quote.toLowerCase ();
                base = this.safeCurrencyCode (base);
                quote = this.safeCurrencyCode (quote);
                const id = baseId + '_' + quoteId;
                const symbol = base + '/' + quote;
                const active = market['TradeEnabled'] && market['BuyEnabled'] && market['SellEnabled'];
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
                    'maker': this.safeFloat (market, 'AskFeeRate'), // BidFeeRate 0, AskFeeRate 0.002, we use just the AskFeeRate here
                    'taker': this.safeFloat (market, 'AskFeeRate'), // BidFeeRate 0, AskFeeRate 0.002, we use just the AskFeeRate here
                    'precision': {
                        'amount': this.safeInteger (market, 'PrimaryDigits'),
                        'price': this.safeInteger (market, 'SecondaryDigits'),
                    },
                    'limits': {
                        'amount': {
                            'min': this.safeFloat (market, 'MinTradeAmount'),
                            'max': this.safeFloat (market, 'MaxTradeAmount'),
                        },
                        'price': {
                            'min': this.safeFloat (market, 'MinOrderPrice'),
                            'max': this.safeFloat (market, 'MaxOrderPrice'),
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
        const statuses = {
            '-1': 'canceled',
            '0': 'open',
            '1': 'open',
            '2': 'closed',
            '10': 'canceled',
        };
        return this.safeString (statuses, status, status);
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
