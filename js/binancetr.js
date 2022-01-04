'use strict';

// ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { BadSymbol, PermissionDenied, ExchangeError, ExchangeNotAvailable, OrderNotFound, InsufficientFunds, InvalidOrder, RequestTimeout, AuthenticationError } = require ('./base/errors');
const { TRUNCATE, DECIMAL_PLACES, TICK_SIZE } = require ('./base/functions/number');
const Precise = require ('./base/Precise');

// ---------------------------------------------------------------------------

module.exports = class binancetr extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'binancetr',
            'name': 'Binance TR',
            'countries': [ 'TR' ],
            'rateLimit': 1500,
            'version': 'v1',
            'has': {
            },
            'timeframes': {
            },
            'urls': {
                'logo': '',
                'api': {
                    'public': 'https://www.trbinance.com/open/', // With some exceptions (when symbol type is 1)
                    'private': 'https://www.trbinance.com/open/', // With some exceptions (when symbol type is 1)
                },
                'www': 'https://www.trbinance.com',
                'doc': [
                    'https://www.trbinance.com/apidocs/',
                ],
                'fees': [
                    'https://www.trbinance.com/en/fees/schedule',
                ],
            },
            'api': {
                'public': {
                    'get': [
                        'common/time',
                        'common/symbols',
                        // GET https://api.binance.me/api/v3/depth (when symbol type is 1)
                        'market/depth', // (when symbol type is not 1)
                        //GET https://api.binance.me/api/v3/trades (when symbol type is 1)
                        'market/trades', // (when symbol type is not 1)
                        // GET https://api.binance.me/api/v3/aggTrades (when symbol type is 1)
                        'market/agg-trades', // (when symbol type is not 1)
                        // GET https://api.binance.me/api/v1/klines (when symbol type is 1)
                        'market/klines', // (when symbol type is not 1)
                    ],
                },
                'private': {
                    'get': [
                        'orders/detail',
                        'orders',
                        'account/spot',
                        'account/spot/asset',
                        'orders/trades',
                        'withdraws',
                        'deposits',
                        'deposits/address',
                    ],
                    'post': [
                        'orders',
                        'orders/cancel',
                        'orders/oco',
                        'withdraws',

                    ],
                },
            },
            // 'precisionMode': TICK_SIZE,
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'maker': 0.1 / 100,
                    'taker': 0.1 / 100,
                },
            },
            'options': {
                'networks': {
                },
            },
            'commonCurrencies': {
            },
            'exceptions': {
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetMarketSymbols (params);
        //
        //     [
        //         {
        //             "id":"BCNBTC",
        //             "baseCurrency":"BCN",
        //             "quoteCurrency":"BTC",
        //             "quantityIncrement":"100",
        //             "tickSize":"0.00000000001",
        //             "takeLiquidityRate":"0.002",
        //             "provideLiquidityRate":"0.001",
        //             "feeCurrency":"BTC"
        //         }
        //     ]
        //
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const market = response[i];
            const id = this.safeString (market, 'id');
            const baseId = this.safeString (market, 'baseCurrency');
            const quoteId = this.safeString (market, 'quoteCurrency');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            let symbol = base + '/' + quote;
            // bequant fix
            if (id.indexOf ('_') >= 0) {
                symbol = id;
            }
            const lotString = this.safeString (market, 'quantityIncrement');
            const stepString = this.safeString (market, 'tickSize');
            const lot = this.parseNumber (lotString);
            const step = this.parseNumber (stepString);
            const precision = {
                'price': step,
                'amount': lot,
            };
            const taker = this.safeNumber (market, 'takeLiquidityRate');
            const maker = this.safeNumber (market, 'provideLiquidityRate');
            const feeCurrencyId = this.safeString (market, 'feeCurrency');
            const feeCurrencyCode = this.safeCurrencyCode (feeCurrencyId);
            result.push (this.extend (this.fees['trading'], {
                'info': market,
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'type': 'spot',
                'spot': true,
                'active': true,
                'taker': taker,
                'maker': maker,
                'precision': precision,
                'feeCurrency': feeCurrencyCode,
                'limits': {
                    'amount': {
                        'min': lot,
                        'max': undefined,
                    },
                    'price': {
                        'min': step,
                        'max': undefined,
                    },
                    'cost': {
                        'min': this.parseNumber (Precise.stringMul (lotString, stepString)),
                        'max': undefined,
                    },
                },
            }));
        }
        return result;
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.api[api] + this.version + '/' + path;;
        if (api === 'public') {
            url += api + '/' + this.implodeParams (path, params);
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        } else {
            // will do the private part once we have the keys
        }
        url = this.urls['api'][api] + url;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return;
        }
    }
};
