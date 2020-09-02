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
                'fetchMarkets': true,
                'fetchTime': true,
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

    async fetchMarkets (params = {}) {
        const response = await this.publicGetCommonSymbols (params);
        //
        //     {
        //         "code":"A10000",
        //         "data":[
        //             {
        //                 "amountPrecision":8,
        //                 "baseCurrency":"BTC",
        //                 "minOrderAmount":"0.001",
        //                 "minOrderValue":"25",
        //                 "pricePrecision":2,
        //                 "quoteCurrency":"BRL",
        //                 "status":"ONLINE",
        //                 "symbol":"BTC_BRL",
        //                 "valuePrecision":2
        //             },
        //         ],
        //         "message":"Success"
        //     }
        //
        const result = [];
        const data = this.safeValue (response, 'data', []);
        for (let i = 0; i < data.length; i++) {
            const market = data[i];
            const baseId = this.safeString (market, 'baseCurrency');
            const quoteId = this.safeString (market, 'quoteCurrency');
            const id = this.safeString (market, 'symbol');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const precision = {
                'amount': this.safeInteger (market, 'amountPrecision'),
                'price': this.safeInteger (market, 'pricePrecision'),
                'cost': this.safeInteger (market, 'valuePrecision'),
            };
            const limits = {
                'amount': {
                    'min': this.safeFloat (market, 'minOrderAmount'),
                    'max': undefined,
                },
                'price': {
                    'min': undefined,
                    'max': undefined,
                },
                'cost': {
                    'min': this.safeFloat (market, 'minOrderValue'),
                    'max': undefined,
                },
            };
            const status = this.safeString (market, 'status');
            const active = (status === 'ONLINE');
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'precision': precision,
                'limits': limits,
                'info': market,
                'active': active,
            });
        }
        return result;
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
