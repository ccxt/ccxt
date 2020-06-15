'use strict';

// ----------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, BadSymbol, AuthenticationError, InsufficientFunds, InvalidOrder, ArgumentsRequired, OrderNotFound, InvalidAddress, BadRequest, RateLimitExceeded, PermissionDenied, ExchangeNotAvailable, AccountSuspended, OnMaintenance } = require ('./base/errors');
const { TICK_SIZE, TRUNCATE } = require ('./base/functions/number');

// ----------------------------------------------------------------------------

module.exports = class phemex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'phemex',
            'name': 'Phemex',
            'countries': [ 'CN' ], // China
            'rateLimit': 100,
            'version': 'v1',
            'certified': false,
            'pro': true,
            'has': {
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/83165440-2f1cf200-a116-11ea-9046-a255d09fb2ed.jpg',
                'test': {
                    'public': 'https://testnet-api.phemex.com/exchange/public',
                    'private': 'https://testnet-api.phemex.com',
                },
                'api': {
                    'public': 'https://api.phemex.com/exchange/public',
                    // 'public': 'https://api.phemex.com',
                    'private': 'https://api.phemex.com',
                },
                'www': 'https://phemex.com',
                'doc': 'https://github.com/phemex/phemex-api-docs',
                'fees': 'https://phemex.com/fees-conditions',
                'referral': 'https://phemex.com/register?referralCode=EDNVJ',
            },
            'api': {
                'public': {
                    'get': [
                        'cfg/v2/products', // spot + contracts
                        'products', // contracts only
                        'nomics/trades', // ?market=<symbol>&since=<since>
                    ],
                },
                'v1': {
                    'get': [
                        'v1/md/orderbook', // ?symbol=<symbol>&id=<id>
                        'v1/md/trade', // ?symbol=<symbol>&id=<id>
                        'v1/md/ticker/24hr', // ?symbol=<symbol>&id=<id>
                        'v1/md/ticker/24hr/all', // ?id=<id>
                        'v1/exchange/public/products', // contracts only
                    ],
                },
                'v0': {
                    'get': [
                        'md/orderbook', // ?symbol=<symbol>&id=<id>
                        'md/trade', // ?symbol=<symbol>&id=<id>
                        'md/spot/ticker/24hr', // ?symbol=<symbol>&id=<id>
                        'md/ticker/24hr', // ?symbol=<symbol>&id=<id>
                    ],
                },
            },
            'precisionMode': TICK_SIZE,
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'taker': 0.1 / 100,
                    'maker': 0.1 / 100,
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
            'options': {
            },
        });
    }

    parseSafeFloat (value = undefined) {
        if (value === undefined) {
            return value;
        }
        value = value.replace (',', '');
        const parts = value.split (' ');
        return this.safeFloat (parts, 0);
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetCfgV2Products (params);
        //
        //     {
        //         "code":0,
        //         "msg":"OK",
        //         "data":{
        //             "ratioScale":8,
        //             "currencies":[
        //                 {"currency":"BTC","valueScale":8,"minValueEv":1,"maxValueEv":5000000000000000000,"name":"Bitcoin"},
        //                 {"currency":"USD","valueScale":4,"minValueEv":1,"maxValueEv":500000000000000,"name":"USD"},
        //                 {"currency":"USDT","valueScale":8,"minValueEv":1,"maxValueEv":5000000000000000000,"name":"TetherUS"},
        //             ],
        //             "products":[
        //                 {
        //                     "symbol":"BTCUSD",
        //                     "displaySymbol":"BTC / USD",
        //                     "indexSymbol":".BTC",
        //                     "markSymbol":".MBTC",
        //                     "fundingRateSymbol":".BTCFR",
        //                     "fundingRate8hSymbol":".BTCFR8H",
        //                     "contractUnderlyingAssets":"USD",
        //                     "settleCurrency":"BTC",
        //                     "quoteCurrency":"USD",
        //                     "contractSize":1.0,
        //                     "lotSize":1,
        //                     "tickSize":0.5,
        //                     "priceScale":4,
        //                     "ratioScale":8,
        //                     "pricePrecision":1,
        //                     "minPriceEp":5000,
        //                     "maxPriceEp":10000000000,
        //                     "maxOrderQty":1000000,
        //                     "type":"Perpetual"
        //                 },
        //                 {
        //                     "symbol":"sBTCUSDT",
        //                     "displaySymbol":"BTC / USDT",
        //                     "quoteCurrency":"USDT",
        //                     "pricePrecision":2,
        //                     "type":"Spot",
        //                     "baseCurrency":"BTC",
        //                     "baseTickSize":"0.000001 BTC",
        //                     "baseTickSizeEv":100,
        //                     "quoteTickSize":"0.01 USDT",
        //                     "quoteTickSizeEv":1000000,
        //                     "minOrderValue":"10 USDT",
        //                     "minOrderValueEv":1000000000,
        //                     "maxBaseOrderSize":"1000 BTC",
        //                     "maxBaseOrderSizeEv":100000000000,
        //                     "maxOrderValue":"5,000,000 USDT",
        //                     "maxOrderValueEv":500000000000000,
        //                     "defaultTakerFee":"0.001",
        //                     "defaultTakerFeeEr":100000,
        //                     "defaultMakerFee":"0.001",
        //                     "defaultMakerFeeEr":100000,
        //                     "baseQtyPrecision":6,
        //                     "quoteQtyPrecision":2
        //                 },
        //             ],
        //             "riskLimits":[
        //                 {
        //                     "symbol":"BTCUSD",
        //                     "steps":"50",
        //                     "riskLimits":[
        //                         {"limit":100,"initialMargin":"1.0%","initialMarginEr":1000000,"maintenanceMargin":"0.5%","maintenanceMarginEr":500000},
        //                         {"limit":150,"initialMargin":"1.5%","initialMarginEr":1500000,"maintenanceMargin":"1.0%","maintenanceMarginEr":1000000},
        //                         {"limit":200,"initialMargin":"2.0%","initialMarginEr":2000000,"maintenanceMargin":"1.5%","maintenanceMarginEr":1500000},
        //                     ]
        //                 },
        //             ],
        //             "leverages":[
        //                 {"initialMargin":"1.0%","initialMarginEr":1000000,"options":[1,2,3,5,10,25,50,100]},
        //                 {"initialMargin":"1.5%","initialMarginEr":1500000,"options":[1,2,3,5,10,25,50,66]},
        //                 {"initialMargin":"2.0%","initialMarginEr":2000000,"options":[1,2,3,5,10,25,33,50]},
        //             ]
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const products = this.safeValue (data, 'products', []);
        const riskLimits = this.safeValue (data, 'riskLimits', []);
        const riskLimitsById = this.indexBy (riskLimits, 'symbol');
        const result = [];
        for (let i = 0; i < products.length; i++) {
            let market = products[i];
            const id = this.safeString (market, 'symbol');
            const type = this.safeStringLower (market, 'type');
            const quoteId = this.safeString (market, 'quoteCurrency');
            let baseId = undefined;
            let limits = undefined;
            let spot = undefined;
            let future = undefined;
            let precision = undefined;
            let taker = undefined;
            let maker = undefined;
            if (type === 'perpetual') {
                future = true;
                spot = false;
                const riskLimitValues = this.safeValue (riskLimitsById, id, {});
                market = this.extend (market, riskLimitValues);
                console.log (market);
                process.exit ();
                continue;
            } else if (type === 'spot') {
                baseId = this.safeString (market, 'baseCurrency');
                spot = true;
                future = false;
                taker = this.safeFloat (market, 'defaultTakerFee');
                maker = this.safeFloat (market, 'defaultMakerFee');
                precision = {
                    'amount': this.parseSafeFloat (this.safeString (market, 'baseTickSize')),
                    'price': this.parseSafeFloat (this.safeString (market, 'quoteTickSize')),
                };
                limits = {
                    'amount': {
                        'min': precision['amount'],
                        'max': this.parseSafeFloat (this.safeString (market, 'maxBaseOrderSize')),
                    },
                    'price': {
                        'min': precision['price'],
                        'max': undefined,
                    },
                    'cost': {
                        'min': this.parseSafeFloat (this.safeString (market, 'minOrderValue')),
                        'max': this.parseSafeFloat (this.safeString (market, 'maxOrderValue')),
                    },
                };
            }
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const active = undefined;
            // const baseCurrency = this.safeValue (currenciesById, baseId);
            // let amountPrecision = undefined;
            // if (baseCurrency !== undefined) {
            //     amountPrecision = this.safeInteger (baseCurrency, 'decimals', 8);
            // }
            // const precision = {
            //     'price': this.safeInteger (market, 'pricePrecision'),
            //     'amount': amountPrecision,
            // };
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'info': market,
                'type': type,
                'spot': spot,
                'future': future,
                'active': active,
                'taker': taker,
                'maker': maker,
                'precision': precision,
                'limits': limits,
            });
        }
        return result;
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const query = this.omit (params, this.extractParams (path));
        let url = '/' + this.implodeParams (path, params);
        if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        }
        // const getOrDelete = (method === 'GET') || (method === 'DELETE');
        // if (getOrDelete) {
        //     if (Object.keys (query).length) {
        //         url += '?' + this.urlencode (query);
        //     }
        // }
        // if (api === 'private') {
        //     this.checkRequiredCredentials ();
        //     let payload = '';
        //     if (!getOrDelete) {
        //         if (Object.keys (query).length) {
        //             body = this.json (query);
        //             payload = body;
        //         }
        //     }
        //     const timestamp = this.milliseconds ().toString ();
        //     const auth = timestamp + method + url + payload;
        //     const signature = this.hmac (this.encode (auth), this.encode (this.secret));
        //     headers = {
        //     };
        //     if (!getOrDelete) {
        //         headers['Content-Type'] = 'application/json';
        //     }
        // }
        url = this.urls['api'][api] + url;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return; // fallback to default error handler
        }
        //
        //     {"errorCode":308,"error":"The signature length is invalid (HMAC-SHA256 should return a 64 length hexadecimal string)."}
        //     {"errorCode":203,"error":"symbol parameter is required."}
        //     {"errorCode":205,"error":"symbol parameter is invalid."}
        //
        const errorCode = this.safeString (response, 'errorCode');
        const error = this.safeString (response, 'error');
        if (errorCode !== undefined) {
            const feedback = this.id + ' ' + body;
            this.throwBroadlyMatchedException (this.exceptions['broad'], error, feedback);
            this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
            throw new ExchangeError (feedback); // unknown message
        }
    }
};
