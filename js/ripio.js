'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { TICK_SIZE } = require ('./base/functions/number');

//  ---------------------------------------------------------------------------

module.exports = class ripio extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'ripio',
            'name': 'Ripio',
            'countries': [ 'AR' ], // Argentina
            'rateLimit': 50,
            'version': 'v1',
            // new metainfo interface
            'has': {
                'CORS': false,
                'fetchMarkets': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/92337550-2b085500-f0b3-11ea-98e7-5794fb07dd3b.jpg',
                'api': {
                    'public': 'https://api.exchange.ripio.com/api',
                    'private': 'https://api.exchange.ripio.com/api',
                },
                'www': 'https://exchange.ripio.com',
                'doc': [
                    'https://exchange.ripio.com/en/api/',
                ],
                'fees': 'https://exchange.ripio.com/en/fee',
            },
            'api': {
                'public': {
                    'get': [
                        'rate/all',
                        'rate/{pair}',
                        'rate/all', // ?country={country_code}
                        'orderbook/{pair}',
                        'tradehistory/{pair}',
                        'pair/',
                        'currency/',
                        'orderbook/{pair}/depth', // ?amount=1.4
                    ],
                },
                'private': {
                    'get': [
                        'balances/exchange_balances',
                        'order/{pair}',
                        'order/{pair}/{order_id}',
                        'order/{pair}', // ?status=OPEN,PART
                        // - OPEN: Open order available to be fill in the orderbook.
                        // - PART: Partially filled order, the remaining amount to fill remains in the orderbook.
                        // - CLOS: Order was cancelled before be fully filled but the amount already filled amount is traded.
                        // - CANC: Order was cancelled before any fill.
                        // - COMP: Order was fully filled.
                        'trade/{pair}',
                    ],
                    'post': [
                        'order/{pair}',
                        'order/{pair}/{order_id}/cancel',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'taker': 0.0 / 100,
                    'maker': 0.0 / 100,
                },
            },
            'precisionMode': TICK_SIZE,
            'requiredCredentials': {
                'apiKey': true,
                'secret': false,
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

    async fetchMarkets (params = {}) {
        const response = await this.publicGetPair (params);
        //
        //     {
        //         "next":null,
        //         "previous":null,
        //         "results":[
        //             {
        //                 "base":"BTC",
        //                 "base_name":"Bitcoin",
        //                 "quote":"USDC",
        //                 "quote_name":"USD Coin",
        //                 "symbol":"BTC_USDC",
        //                 "fees":[
        //                     {"traded_volume":0.0,"maker_fee":0.0,"taker_fee":0.0,"cancellation_fee":0.0}
        //                 ],
        //                 "country":"ZZ",
        //                 "enabled":true,
        //                 "priority":10,
        //                 "min_amount":"0.00001",
        //                 "price_tick":"0.000001",
        //                 "min_value":"10",
        //                 "limit_price_threshold":"25.00"
        //             },
        //         ]
        //     }
        //
        const result = [];
        const results = this.safeValue (response, 'results', []);
        for (let i = 0; i < results.length; i++) {
            const market = results[i];
            const baseId = this.safeString (market, 'base');
            const quoteId = this.safeString (market, 'quote');
            const id = this.safeString (market, 'symbol');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const precision = {
                'amount': this.safeInteger (market, 'amountPrecision'),
                'price': this.safeFloat (market, 'price_tick'),
                'cost': this.safeInteger (market, 'valuePrecision'),
            };
            const limits = {
                'amount': {
                    'min': this.safeFloat (market, 'min_amount'),
                    'max': undefined,
                },
                'price': {
                    'min': undefined,
                    'max': undefined,
                },
                'cost': {
                    'min': this.safeFloat (market, 'min_value'),
                    'max': undefined,
                },
            };
            const active = this.safeValue (market, 'enabled', true);
            const fees = this.safeValue (market, 'fees', []);
            const firstFee = this.safeValue (fees, 0, {});
            const maker = this.safeFloat (firstFee, 'maker_fee', 0.0);
            const taker = this.safeFloat (firstFee, 'taker_fee', 0.0);
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'precision': precision,
                'maker': maker,
                'taker': taker,
                'limits': limits,
                'info': market,
                'active': active,
            });
        }
        return result;
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const request = '/' + this.version + '/' + this.implodeParams (path, params);
        let url = this.urls['api'][api] + request;
        const query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else if (api === 'private') {
            this.checkRequiredCredentials ();
            // const timestamp = this.milliseconds ().toString ();
            // let queryString = undefined;
            // if (method === 'POST') {
            //     body = this.json (query);
            //     queryString = this.hash (body, 'md5');
            // } else {
            //     if (Object.keys (query).length) {
            //         url += '?' + this.urlencode (query);
            //     }
            //     queryString = this.urlencode (this.keysort (query));
            // }
            // const auth = method + "\n" + request + "\n" + queryString + "\n" + timestamp; // eslint-disable-line quotes
            // const signature = this.hmac (this.encode (auth), this.encode (this.secret));
            // headers = {
            //     'X-Nova-Access-Key': this.apiKey,
            //     'X-Nova-Signature': signature,
            //     'X-Nova-Timestamp': timestamp,
            // };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
};
