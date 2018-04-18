'use strict';

//  ---------------------------------------------------------------------------
const bitsane = require ('./bitsane.js');
//  ---------------------------------------------------------------------------

module.exports = class anybits extends bitsane {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'anybits',
            'name': 'Anybits',
            'countries': '',
            'has': {
                'fetchCurrencies': true,
                'fetchTickers': true,
                'fetchOpenOrders': true,
                'fetchDepositAddress': true,
                'withdraw': true,
            },
            'urls': {
                'logo': 'https://anybits.com/img/anybits-img/logo2x.png',
                'api': 'https://anybits.com/api',
                'www': 'https://anybits.com/',
                'doc': 'https://anybits.com/help/api',
                'fees': 'https://anybits.com/help/fees',
            },
            'api': {
                'public': {
                    'get': [
                        'assets/currencies',
                        'assets/pairs',
                        'ticker',
                        'orderbook',
                        'trades',
                    ],
                },
                'private': {
                    'post': [
                        'balances',
                        'order/cancel',
                        'order/new',
                        'order/status',
                        'orders',
                        'orders/history',
                        'deposit/address',
                        'withdraw',
                        'withdrawal/status',
                        'transactions/history',
                        'vouchers',
                        'vouchers/create',
                        'vouchers/redeem',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'maker': 0.15 / 100,
                    'taker': 0.25 / 100,
                },
            },
        });
    }
};
