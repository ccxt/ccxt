'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ExchangeNotAvailable, BadResponse, BadRequest, InvalidOrder, InsufficientFunds, AuthenticationError, RateLimitExceeded, DDoSProtection, BadSymbol } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class lcx extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'lcx',
            'name': 'lcx',
            'countries': ['LI'],
            'rateLimit': 250, // ms
            'has': {
                'CORS': true,
                'fetchMarkets': true,
            },
            'timeframes': {
                '1m': '1',
                '3m': '3',
                '5m': '5',
                '15m': '15',
                '30m': '30',
                '45m': '45',
                '1h': '60',
                '2h': '120',
                '3h': '180',
                '4h': '240',
                '1d': '1D',
                '1w': '1W',
                '1M': '1M',
            },
            'version': 'v1',
            'urls': {
                'logo': 'https://web.lcx.com/wp-content/uploads/2018/12/logo_black.png',
                'api': {
                    'accounts': 'https://exchange-api.lcx.com',
                    'public': 'https://exchange-api.lcx.com',
                    'private': 'https://exchange-api.lcx.com',
                },
                'www': 'https://www.lcx.com',
                'doc': [
                    'https://exchange.lcx.com/v1/docs',
                ],
                'fees': 'https://exchange.lcx.com/setting/fees',
                'referral': 'https://accounts.lcx.com/register?referralCode=CCXT_DOCS',
            },
            'api': {
                'public': {
                    'get': [
                        'market/pairs',
                        'currency',
                        'market/tickers',
                    ],
                    'post': [
                        'order/book',
                        'market/ticker',
                        'market/kline',
                        'trade/recent',
                    ],
                },
                'private': {
                    'post': [
                        'orderHistory',
                        'open',
                        'create',
                        'cancel',
                    ],
                    'get': [
                        'balances',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'maker': 0.003,
                    'taker': 0.003,
                },
            },
            'exceptions': {
                'exact': {
                    'UNAUTHORIZED': AuthenticationError,
                    'INVALID_ARGUMENT': BadRequest, // Parameters are not a valid format, parameters are empty, or out of range, or a parameter was sent when not required.
                    'TRADING_UNAVAILABLE': ExchangeNotAvailable,
                    'NOT_ENOUGH_BALANCE': InsufficientFunds,
                    'NOT_ALLOWED_COMBINATION': BadRequest,
                    'INVALID_ORDER': InvalidOrder, // Requested order does not exist, or it is not your order
                    'RATE_LIMIT_EXCEEDED': RateLimitExceeded, // You are sending requests too frequently. Please try it later.
                    'MARKET_UNAVAILABLE': ExchangeNotAvailable, // Market is closed today
                    'INVALID_MARKET': BadSymbol, // Requested market is not exist
                    'INVALID_CURRENCY': BadRequest, // Requested currency is not exist on ProBit system
                    'TOO_MANY_OPEN_ORDERS': DDoSProtection, // Too many open orders
                },
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'options': {},
            'commonCurrencies': {
                'LCX': 'LCX',
                'BTC': 'Bitcoin',
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetMarketPairs (params);
        const markets = this.safeValue (response, 'data', []);
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString (market, 'symbol');
            const baseId = this.safeString (market, 'base');
            const quoteId = this.safeString (market, 'quote');
            const base = this.safeString (market, 'base');
            const quote = this.safeString (market, 'quote');
            const symbol = base + '/' + quote;
            const active = this.safeValue (market, 'status', false);
            const amountPrecision = this.safeInteger (market, 'amountPrecision');
            const costPrecision = this.safeInteger (market, 'amountPrecision');
            const precision = {
                'amount': amountPrecision,
                'price': this.safeFloat (market, 'pricePrecision'),
                'cost': costPrecision,
            };
            const takerFeeRate = 0.3;
            const makerFeeRate = 0.3;
            result.push ({
                'id': id,
                'info': market,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': active,
                'precision': precision,
                'taker': takerFeeRate / 100,
                'maker': makerFeeRate / 100,
                'limits': {
                    'amount': {
                        'min': this.safeFloat (market, 'minBaseOrder'),
                        'max': this.safeFloat (market, 'maxBaseOrder'),
                    },
                    'price': {
                        'min': this.safeFloat (market, 'min_price'),
                        'max': this.safeFloat (market, 'max_price'),
                    },
                    'cost': {
                        'min': this.safeFloat (market, 'minQuoteOrder'),
                        'max': this.safeFloat (market, 'maxQuoteOrder'),
                    },
                },
            });
        }
        return result;
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/';
        const query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (method === 'POST') {
                url += this.implodeParams (path, params);
                body = this.json (query);
            } else {
                url += this.implodeParams (path, params);
                if (Object.keys (query).length) {
                    url += '?' + this.urlencode (query);
                }
            }
        } else if (api === 'private') {
            path = 'api' + '/' + path;
            const now = this.nonce ();
            this.checkRequiredCredentials ();
            let payload = method + '/' + path;
            if (method !== 'GET') {
                payload = method + '/' + path + this.json (query);
            }
            const signature = this.hmac (payload, this.secret, 'sha256', 'base64');
            headers = {
                'x-access-key': this.apiKey,
                'x-access-sign': signature,
                'x-access-timestamp': now,
            };
            url += this.implodeParams (path, params);
            if (method === 'GET') {
                if (Object.keys (query).length) {
                    url += '?' + this.urlencode (query);
                }
            } else if (Object.keys (query).length) {
                body = this.json (query);
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return; // fallback to default error handler
        }
        if ('errorCode' in response) {
            const errorCode = this.safeString (response, 'errorCode');
            const message = this.safeString (response, 'message');
            if (errorCode !== undefined) {
                const feedback = this.id + ' ' + body;
                this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
                this.throwBroadlyMatchedException (this.exceptions['exact'], errorCode, feedback);
                throw new ExchangeError (feedback);
            }
        }
    }
};
