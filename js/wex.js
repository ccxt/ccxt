'use strict';

// ---------------------------------------------------------------------------

const liqui = require ('./liqui.js');
const { ExchangeError, InsufficientFunds, OrderNotFound, DDoSProtection } = require ('./base/errors');

// ---------------------------------------------------------------------------

module.exports = class wex extends liqui {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'wex',
            'name': 'WEX',
            'countries': [ 'NZ' ], // New Zealand
            'version': '3',
            'has': {
                'CORS': false,
                'fetchTickers': true,
                'fetchDepositAddress': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/30652751-d74ec8f8-9e31-11e7-98c5-71469fcef03e.jpg',
                'api': {
                    'public': 'https://wex1.in/api',
                    'private': 'https://wex1.in/tapi',
                },
                'www': 'https://wex1.in',
                'doc': [
                    'https://wex1.in/api/3/docs',
                    'https://wex1.in/tapi/docs',
                ],
                'fees': 'https://wex1.in/fees',
            },
            'api': {
                'public': {
                    'get': [
                        'info',
                        'ticker/{pair}',
                        'depth/{pair}',
                        'trades/{pair}',
                    ],
                },
                'private': {
                    'post': [
                        'getInfo',
                        'Trade',
                        'ActiveOrders',
                        'OrderInfo',
                        'CancelOrder',
                        'TradeHistory',
                        'TransHistory',
                        'CoinDepositAddress',
                        'WithdrawCoin',
                        'CreateCoupon',
                        'RedeemCoupon',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'maker': 0.2 / 100,
                    'taker': 0.2 / 100,
                },
                'funding': {
                    'withdraw': {
                        'BTC': 0.001,
                        'LTC': 0.001,
                        'NMC': 0.1,
                        'NVC': 0.1,
                        'PPC': 0.1,
                        'DASH': 0.001,
                        'ETH': 0.003,
                        'BCH': 0.001,
                        'ZEC': 0.001,
                    },
                },
            },
            'exceptions': {
                'messages': {
                    'bad status': OrderNotFound,
                    'Requests too often': DDoSProtection,
                    'not available': DDoSProtection,
                    'external service unavailable': DDoSProtection,
                },
            },
            'commonCurrencies': {
                'RUR': 'RUB',
            },
        });
    }

    parseTicker (ticker, market = undefined) {
        let timestamp = ticker['updated'] * 1000;
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        let last = this.safeFloat (ticker, 'last');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': this.safeFloat (ticker, 'sell'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'buy'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': this.safeFloat (ticker, 'avg'),
            'baseVolume': this.safeFloat (ticker, 'vol_cur'),
            'quoteVolume': this.safeFloat (ticker, 'vol'),
            'info': ticker,
        };
    }

    async fetchDepositAddress (code, params = {}) {
        let request = { 'coinName': this.commonCurrencyCode (code) };
        let response = await this.privatePostCoinDepositAddress (this.extend (request, params));
        return {
            'currency': code,
            'address': response['return']['address'],
            'tag': undefined,
            'info': response,
        };
    }

    handleErrors (code, reason, url, method, headers, body, response) {
        if (code === 200) {
            if (body[0] !== '{') {
                // response is not JSON -> resort to default error handler
                return;
            }
            if ('success' in response) {
                if (!response['success']) {
                    const error = this.safeString (response, 'error');
                    if (!error) {
                        throw new ExchangeError (this.id + ' returned a malformed error: ' + body);
                    }
                    if (error === 'no orders') {
                        // returned by fetchOpenOrders if no open orders (fix for #489) -> not an error
                        return;
                    }
                    const feedback = this.id + ' ' + this.json (response);
                    const messages = this.exceptions['messages'];
                    if (error in messages) {
                        throw new messages[error] (feedback);
                    }
                    if (error.indexOf ('It is not enough') >= 0) {
                        throw new InsufficientFunds (feedback);
                    } else {
                        throw new ExchangeError (feedback);
                    }
                }
            }
        }
    }
};
