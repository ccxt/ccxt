'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { DECIMAL_PLACES } = require ('./base/functions/number');
const { ExchangeError, InvalidOrder, BadRequest, InsufficientFunds, OrderNotFound } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class bitclude extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitclude',
            'name': 'Bitclude',
            'countries': ['PL'],
            'rateLimit': 2000,
            'certified': false,
            'pro': false,
            'urls': {
                'api': {
                    'public': 'https://api.bitclude.com/',
                },
                'www': 'https://bitclude.com',
                'doc': 'https://docs.bitclude.com',
            },
            'has': {
                'fetchMarkets': 'emulated',
                'cancelAllOrders': false,
                'fetchClosedOrders': false,
                'fetchDepositAddress': false,
                'fetchDeposits': false,
                'fetchFundingFees': false,
                'fetchMyTrades': false,
                'fetchOHLCV': false,
                'fetchOpenOrders': false,
                'fetchOrder': false,
                'fetchOrderBook': false,
                'fetchOrders': false,
                'fetchTickers': false,
                'fetchTrades': false,
                'fetchTradingFees': false,
                'fetchWithdrawals': false,
                'withdraw': false,
            },
            'api': {
                'public': {
                    'get': [
                        'stats/ticker.json',
                    ],
                },
            },
            'exceptions': {
                // stolen, todo rewrite
                'exact': {
                    'Not enough balances': InsufficientFunds, // {"error":"Not enough balances","success":false}
                    'InvalidPrice': InvalidOrder, // {"error":"Invalid price","success":false}
                    'Size too small': InvalidOrder, // {"error":"Size too small","success":false}
                    'Missing parameter price': InvalidOrder, // {"error":"Missing parameter price","success":false}
                    'Order not found': OrderNotFound, // {"error":"Order not found","success":false}
                },
                'broad': {
                    'Invalid parameter': BadRequest, // {"error":"Invalid parameter start_time","success":false}
                    'The requested URL was not found on the server': BadRequest,
                    'No such coin': BadRequest,
                    'No such market': BadRequest,
                    'An unexpected error occurred': ExchangeError, // {"error":"An unexpected error occurred, please try again later (58BC21C795).","success":false}
                },
            },
            'precisionMode': DECIMAL_PLACES, // todo
        });
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/' + path;
        if (api === 'public') {
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
};
