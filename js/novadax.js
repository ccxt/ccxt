'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { AuthenticationError, ExchangeError, PermissionDenied, BadRequest, ArgumentsRequired, OrderNotFound, InsufficientFunds, ExchangeNotAvailable, DDoSProtection, InvalidAddress, InvalidOrder } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class novadax extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'novadax',
            'name': 'NovaDAX',
            'countries': [ 'BR' ], // Brazil
            'rateLimit': 300,
            'version': 'v1',
            // new metainfo interface
            'has': {
                'CORS': false,
                'publicAPI': true,
                'privateAPI': true,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'cancelOrders': true,
                'createDepositAddress': true,
                'createOrder': true,
                'fetchBalance': true,
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchDeposits': true,
                'fetchDepositAddress': true,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrderTrades': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFees': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchWithdrawals': true,
            },
            'timeframes': {
                '1m': '1/MINUTES',
                '5m': '5/MINUTES',
                '15m': '15/MINUTES',
                '30m': '30/MINUTES',
                '1h': '1/HOURS',
                '4h': '4/HOURS',
                '1d': '1/DAYS',
                '1w': '1/WEEKS',
                '1M': '1/MONTHS',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/51840849/87591171-9a377d80-c6f0-11ea-94ac-97a126eac3bc.jpg',
                'api': {
                    'public': 'https://api.novadax.com',
                    'private': 'https://api.novadax.com',
                },
                'www': 'https://www.novadax.com',
                'doc': [
                    'https://doc.novadax.com/en-US/',
                ],
                'fees': 'https://www.novadax.com/en/fees-and-limits',
            },
            'api': {
                'public': {
                    'get': [
                        'common/symbol',
                        'common/symbols',
                        'common/timestamp',
                        'market/tickers',
                        'market/ticker',
                        'market/depth',
                        'market/trades',
                    ],
                },
                'private': {
                    'get': [
                        'orders/get',
                        'orders/list',
                        'orders/fill',
                        'account/getBalance',
                        'account/subs',
                        'account/subs/balance',
                        'account/subs/transfer/record',
                    ],
                    'post': [
                        'orders/create',
                        'orders/cancel',
                        'account/withdraw/coin',
                        'account/subs/transfer',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'taker': 0.5 / 100,
                    'maker': 0.3 / 100,
                },
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'exceptions': {
                'exact': {
                },
                'broad': {
                },
            },
            'commonCurrencies': {
            },
        });
    }

    async fetchTime (params = {}) {
        const response = await this.publicGetCommonTimestamp (params);
        //
        //     {
        //         "code":"A10000",
        //         "data":1599090512080,
        //         "message":"Success"
        //     }
        //
        return this.safeInteger (response, 'data');
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/' + this.version + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else if (api === 'private') {
            this.checkRequiredCredentials ();
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return;
        }
        const feedback = this.id + ' ' + body;
        const message = this.safeString (response, 'error');
        if (message !== undefined) {
            this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
            throw new ExchangeError (feedback); // unknown message
        }
    }
};
