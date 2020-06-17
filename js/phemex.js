'use strict';

// ----------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, BadSymbol, AuthenticationError, InsufficientFunds, InvalidOrder, ArgumentsRequired, OrderNotFound, InvalidAddress, BadRequest, RateLimitExceeded, PermissionDenied, ExchangeNotAvailable, AccountSuspended, OnMaintenance } = require ('./base/errors');
const { TICK_SIZE, ROUND } = require ('./base/functions/number');

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
                    'v1': 'https://testnet-api.phemex.com/v1',
                    'public': 'https://testnet-api.phemex.com/exchange/public',
                    'private': 'https://testnet-api.phemex.com',
                },
                'api': {
                    'v1': 'https://api.phemex.com/v1',
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
                        'md/orderbook', // ?symbol=<symbol>&id=<id>
                        'md/trade', // ?symbol=<symbol>&id=<id>
                        'md/ticker/24hr', // ?symbol=<symbol>&id=<id>
                        'md/ticker/24hr/all', // ?id=<id>
                        'exchange/public/products', // contracts only
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

    parseSwapMarket (market) {
        //
        //     {
        //         "symbol":"BTCUSD",
        //         "displaySymbol":"BTC / USD",
        //         "indexSymbol":".BTC",
        //         "markSymbol":".MBTC",
        //         "fundingRateSymbol":".BTCFR",
        //         "fundingRate8hSymbol":".BTCFR8H",
        //         "contractUnderlyingAssets":"USD",
        //         "settleCurrency":"BTC",
        //         "quoteCurrency":"USD",
        //         "contractSize":"1 USD",
        //         "lotSize":1,
        //         "tickSize":0.5,
        //         "priceScale":4,
        //         "ratioScale":8,
        //         "pricePrecision":1,
        //         "minPriceEp":5000,
        //         "maxPriceEp":10000000000,
        //         "maxOrderQty":1000000,
        //         "type":"Perpetual"
        //         "steps":"50",
        //         "riskLimits":[
        //             {"limit":100,"initialMargin":"1.0%","initialMarginEr":1000000,"maintenanceMargin":"0.5%","maintenanceMarginEr":500000},
        //             {"limit":150,"initialMargin":"1.5%","initialMarginEr":1500000,"maintenanceMargin":"1.0%","maintenanceMarginEr":1000000},
        //             {"limit":200,"initialMargin":"2.0%","initialMarginEr":2000000,"maintenanceMargin":"1.5%","maintenanceMarginEr":1500000},
        //         ],
        //         "underlyingSymbol":".BTC",
        //         "baseCurrency":"BTC",
        //         "settlementCurrency":"BTC",
        //         "valueScale":8,
        //         "defaultLeverage":0,
        //         "maxLeverage":100,
        //         "initMarginEr":"1000000",
        //         "maintMarginEr":"500000",
        //         "defaultRiskLimitEv":10000000000,
        //         "deleverage":true,
        //         "makerFeeRateEr":-250000,
        //         "takerFeeRateEr":750000,
        //         "fundingInterval":8,
        //         "marketUrl":"https://phemex.com/trade/BTCUSD",
        //         "description":"BTCUSD is a BTC/USD perpetual contract priced on the .BTC Index. Each contract is worth 1 USD of Bitcoin. Funding is paid and received every 8 hours. At UTC time: 00:00, 08:00, 16:00.",
        //     }
        //
        const id = this.safeString (market, 'symbol');
        const quoteId = this.safeString (market, 'quoteCurrency');
        const baseId = this.safeString (market, 'baseCurrency');
        const type = this.safeStringLower (market, 'type');
        let taker = undefined;
        let maker = undefined;
        let inverse = false;
        const spot = false;
        const swap = true;
        const settleCurrency = this.safeString (market, 'settleCurrency');
        if (settleCurrency !== quoteId) {
            inverse = true;
        }
        const linear = !inverse;
        const precision = {
            'amount': this.safeFloat (market, 'lotSize'),
            'price': this.safeFloat (market, 'tickSize'),
        };
        const priceScale = this.safeInteger (market, 'priceScale');
        const ratioScale = this.safeInteger (market, 'ratioScale');
        const priceScalePower = Math.pow (10, -priceScale);
        const ratioScalePower = Math.pow (10, -ratioScale);
        const minPriceEp = this.safeFloat (market, 'minPriceEp');
        const maxPriceEp = this.safeFloat (market, 'maxPriceEp');
        const makerFeeRateEr = this.safeFloat (market, 'makerFeeRateEr');
        const takerFeeRateEr = this.safeFloat (market, 'takerFeeRateEr');
        let minPrice = undefined;
        let maxPrice = undefined;
        if ((minPriceEp !== undefined) && (precision['price'] !== undefined)) {
            minPrice = parseFloat (this.decimalToPrecision (minPriceEp * priceScalePower, ROUND, precision['price'], this.precisionMode));
        }
        if ((maxPriceEp !== undefined) && (precision['price'] !== undefined)) {
            maxPrice = parseFloat (this.decimalToPrecision (maxPriceEp * priceScalePower, ROUND, precision['price'], this.precisionMode));
        }
        if (makerFeeRateEr !== undefined) {
            maker = parseFloat (this.decimalToPrecision (makerFeeRateEr * ratioScalePower, ROUND, 0.00000001, this.precisionMode));
        }
        if (takerFeeRateEr !== undefined) {
            taker = parseFloat (this.decimalToPrecision (takerFeeRateEr * ratioScalePower, ROUND, 0.00000001, this.precisionMode));
        }
        const limits = {
            'amount': {
                'min': precision['amount'],
                'max': undefined,
            },
            'price': {
                'min': minPrice,
                'max': maxPrice,
            },
            'cost': {
                'min': undefined,
                'max': this.parseSafeFloat (this.safeString (market, 'maxOrderQty')),
            },
        };
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        const symbol = base + '/' + quote;
        const active = undefined;
        return {
            'id': id,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'baseId': baseId,
            'quoteId': quoteId,
            'info': market,
            'type': type,
            'spot': spot,
            'swap': swap,
            'linear': linear,
            'inverse': inverse,
            'active': active,
            'taker': taker,
            'maker': maker,
            'precision': precision,
            'limits': limits,
        };
    }

    parseSpotMarket (market) {
        //
        //     {
        //         "symbol":"sBTCUSDT",
        //         "displaySymbol":"BTC / USDT",
        //         "quoteCurrency":"USDT",
        //         "pricePrecision":2,
        //         "type":"Spot",
        //         "baseCurrency":"BTC",
        //         "baseTickSize":"0.000001 BTC",
        //         "baseTickSizeEv":100,
        //         "quoteTickSize":"0.01 USDT",
        //         "quoteTickSizeEv":1000000,
        //         "minOrderValue":"10 USDT",
        //         "minOrderValueEv":1000000000,
        //         "maxBaseOrderSize":"1000 BTC",
        //         "maxBaseOrderSizeEv":100000000000,
        //         "maxOrderValue":"5,000,000 USDT",
        //         "maxOrderValueEv":500000000000000,
        //         "defaultTakerFee":"0.001",
        //         "defaultTakerFeeEr":100000,
        //         "defaultMakerFee":"0.001",
        //         "defaultMakerFeeEr":100000,
        //         "baseQtyPrecision":6,
        //         "quoteQtyPrecision":2
        //     }
        //
        const type = this.safeStringLower (market, 'type');
        const id = this.safeString (market, 'symbol');
        const quoteId = this.safeString (market, 'quoteCurrency');
        const baseId = this.safeString (market, 'baseCurrency');
        const linear = undefined;
        const inverse = undefined;
        const spot = true;
        const swap = false;
        const taker = this.safeFloat (market, 'defaultTakerFee');
        const maker = this.safeFloat (market, 'defaultMakerFee');
        const precision = {
            'amount': this.parseSafeFloat (this.safeString (market, 'baseTickSize')),
            'price': this.parseSafeFloat (this.safeString (market, 'quoteTickSize')),
        };
        const limits = {
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
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        const symbol = base + '/' + quote;
        const active = undefined;
        return {
            'id': id,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'baseId': baseId,
            'quoteId': quoteId,
            'info': market,
            'type': type,
            'spot': spot,
            'swap': swap,
            'linear': linear,
            'inverse': inverse,
            'active': active,
            'taker': taker,
            'maker': maker,
            'precision': precision,
            'limits': limits,
        };
    }

    async fetchMarkets (params = {}) {
        const v2Products = await this.publicGetCfgV2Products (params);
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
        const v1Products = await this.v1GetExchangePublicProducts (params);
        const v1ProductsData = this.safeValue (v1Products, 'data', []);
        //
        //     {
        //         "code":0,
        //         "msg":"OK",
        //         "data":[
        //             {
        //                 "symbol":"BTCUSD",
        //                 "underlyingSymbol":".BTC",
        //                 "quoteCurrency":"USD",
        //                 "baseCurrency":"BTC",
        //                 "settlementCurrency":"BTC",
        //                 "maxOrderQty":1000000,
        //                 "maxPriceEp":100000000000000,
        //                 "lotSize":1,
        //                 "tickSize":"0.5",
        //                 "contractSize":"1 USD",
        //                 "priceScale":4,
        //                 "ratioScale":8,
        //                 "valueScale":8,
        //                 "defaultLeverage":0,
        //                 "maxLeverage":100,
        //                 "initMarginEr":"1000000",
        //                 "maintMarginEr":"500000",
        //                 "defaultRiskLimitEv":10000000000,
        //                 "deleverage":true,
        //                 "makerFeeRateEr":-250000,
        //                 "takerFeeRateEr":750000,
        //                 "fundingInterval":8,
        //                 "marketUrl":"https://phemex.com/trade/BTCUSD",
        //                 "description":"BTCUSD is a BTC/USD perpetual contract priced on the .BTC Index. Each contract is worth 1 USD of Bitcoin. Funding is paid and received every 8 hours. At UTC time: 00:00, 08:00, 16:00.",
        //                 "type":"Perpetual"
        //             },
        //         ]
        //     }
        //
        const v2ProductsData = this.safeValue (v2Products, 'data', {});
        const products = this.safeValue (v2ProductsData, 'products', []);
        const riskLimits = this.safeValue (v2ProductsData, 'riskLimits', []);
        const riskLimitsById = this.indexBy (riskLimits, 'symbol');
        const v1ProductsById = this.indexBy (v1ProductsData, 'symbol');
        const result = [];
        for (let i = 0; i < products.length; i++) {
            let market = products[i];
            const type = this.safeStringLower (market, 'type');
            if (type === 'perpetual') {
                const id = this.safeString (market, 'symbol');
                const riskLimitValues = this.safeValue (riskLimitsById, id, {});
                market = this.extend (market, riskLimitValues);
                const v1ProductsValues = this.safeValue (v1ProductsById, id, {});
                market = this.extend (market, v1ProductsValues);
                market = this.parseSwapMarket (market);
            } else {
                market = this.parseSpotMarket (market);
            }
            result.push (market);
        }
        return result;
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const query = this.omit (params, this.extractParams (path));
        let url = '/' + this.implodeParams (path, params);
        if ((api === 'public') || (api === 'v1')) {
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
