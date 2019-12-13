'use strict';

// ---------------------------------------------------------------------------

const hitbtc2 = require ('./hitbtc2');
// ---------------------------------------------------------------------------

module.exports = class bitcoincom extends hitbtc2 {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitcoincom',
            'name': 'Bitcoin.com Exchange',
            'countries': [ 'KN' ], // Saint Kitts and Nevis
            'urls': {
                'logo': 'https://exchange.bitcoin.com/6587783db8865cb8828873e74e2f6161.svg',
                'api': 'https://api.exchange.bitcoin.com',
                'www': 'https://exchange.bitcoin.com',
                'doc': [
                    'https://api.exchange.bitcoin.com',
                ],
                'fees': [
                    'https://intercom.help/exchangebitcoincom/en/articles/3477865-what-are-withdrawal-fees',
                    'https://intercom.help/exchangebitcoincom/en/articles/3477892-trading-commissions',
                ],
                'referral': 'https://exchange.bitcoin.com',
            },
            'fees': {
                'trading': {
                    'percentage': true,
                    'taker': 0.2 / 100,
                    'maker': 0.1 / 100,
                },
                'funding': {
                    'withdraw': {
                        'BCH': 0.001,
                        'BTC': 0.0005,
                        'ETH': 0.01,
                        'USDT': 4,
                        'EOS': 0.1,
                        'TRX': 17,
                        'XRP': 1,
                        'LTC': 0.004,
                        'ZEC': 0.006,
                        'DASH': 0.03,
                        'ACD': 0, // ?
                        'ADA': 105.15,
                        'ATOM': 0, // ?
                        'BCE': 0, // ?
                        'ETC': 0.04,
                        'FLEX': 0, // ?
                        'GOC': 0, // ?
                        'LINK': 2.74,
                        'OMG': 7.932,
                        'ONE': 1614,
                        'ONT': 7,
                        'RFR': 10230,
                        'SAI': 0, // ?
                        'SPICE': 0, // ?
                        'UPT': 800,
                        'WAVES': 4.811,
                        'XLM': 4,
                        'XMR': 0.02,
                    },
                },
            },
        });
    }
};
