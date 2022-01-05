'use strict';

// ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { BadRequest } = require ('./base/errors');
// const { TRUNCATE, DECIMAL_PLACES, TICK_SIZE } = require ('./base/functions/number');
// const Precise = require ('./base/Precise');

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
                'fetchMarkets': true,
                'fetchTime': true,
                'fetchOrderBook': true,
            },
            'timeframes': {
                '1m': '1m',
                '3m': '3m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '2h': '2h',
                '4h': '4h',
                '6h': '6h',
                '8h': '8h',
                '1d': '1d',
                '3d': '3d',
                '1w': '1w',
                '1M': '1M',
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
                        'market/depth', // when symbol type is not 1 - fetchOrderBook
                        // GET https://api.binance.me/api/v3/depth (when symbol type is 1)
                        // GET https://api.binance.me/api/v3/trades (when symbol type is 1)
                        // GET https://api.binance.me/api/v3/aggTrades (when symbol type is 1)
                        // GET https://api.binance.me/api/v1/klines (when symbol type is 1)
                        'market/trades', // when symbol type is not 1 - fetchTrades
                        'market/agg-trades', // when symbol type is not 1
                        'market/klines', // when symbol type is not 1 - fetchOHLCV
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

    async fetchTime (params = {}) {
        const response = await this.publicGetCommonTime (params);
        //
        //      {
        //          "code":0,
        //          "msg":"Success",
        //         "data":null,
        //          "timestamp":1641318638443
        //      }
        //
        return this.safeInteger (response, 'timestamp');
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetCommonSymbols (params);
        //
        //       {
        //            "code":0,
        //            "msg":"Success",
        //            "data":{
        //                "list":[
        //                    {
        //                        "type":1,
        //                        "symbol":"ADA_TRY",
        //                        "baseAsset":"ADA",
        //                        "basePrecision":8,
        //                        "quoteAsset":"TRY",
        //                        "quotePrecision":8,
        //                        "filters":[
        //                            {"filterType":"PRICE_FILTER","minPrice":"0.01000000","maxPrice":"10000.00000000","tickSize":"0.01000000","applyToMarket":false},
        //                            {"filterType":"PERCENT_PRICE","multiplierUp":5,"multiplierDown":0.2,"avgPriceMins":"5","applyToMarket":false},
        //                            {"filterType":"LOT_SIZE","minQty":"0.10000000","maxQty":"9222449.00000000","stepSize":"0.10000000","applyToMarket":false},
        //                            {"filterType":"MIN_NOTIONAL","avgPriceMins":"5","minNotional":"10.00000000","applyToMarket":true},
        //                            {"filterType":"ICEBERG_PARTS","applyToMarket":false,"limit":"10"},
        //                            {"filterType":"MARKET_LOT_SIZE","minQty":"0.00000000","maxQty":"191987.27930555","stepSize":"0.00000000","applyToMarket":false},
        //                            {"filterType":"MAX_NUM_ORDERS","applyToMarket":false},
        //                            {"filterType":"MAX_NUM_ALGO_ORDERS","applyToMarket":false,"maxNumAlgoOrders":"5"}
        //                        ],
        //                        "orderTypes":[
        //                            "LIMIT",
        //                            "LIMIT_MAKER",
        //                            "MARKET",
        //                            "STOP_LOSS_LIMIT",
        //                            "TAKE_PROFIT_LIMIT"
        //                            ],
        //                        "icebergEnable":1,
        //                        "ocoEnable":1,
        //                        "spotTradingEnable":1,
        //                        "marginTradingEnable":0,
        //                        "permissions":["SPOT"]
        //                    },
        //                ]
        //            }
        //        }
        //
        const result = [];
        for (let i = 0; i < response['data']['list'].length; i++) {
            const market = response['data']['list'][i];
            // const type = this.safeInteger(market, 'type'); // Important to see endpoint for this market
            const id = this.safeString (market, 'symbol');
            const filterType0 = market['filters'][0];
            const filterType2 = market['filters'][2];
            const minPrice = this.safeValue (filterType0, 'minPrice');
            const maxPrice = this.safeValue (filterType0, 'maxPrice');
            const minQty2 = this.safeValue (filterType2, 'minQty');
            const maxQty2 = this.safeValue (filterType2, 'maxQty');
            const baseId = this.safeString (market, 'baseAsset');
            const quoteId = this.safeString (market, 'quoteAsset');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const spotPer = market['permissions'].includes ('SPOT');
            const marginPer = market['permissions'].includes ('MARGIN');
            const marginEnable = (this.safeNumber (market, 'marginTradingEnable')) === '1' ? true : false;
            const spotEnable = (this.safeNumber (market, 'spotTradingEnable')) === '1' ? true : false;
            const symbol = base + '/' + quote;
            const precision = {
                'price': this.safeInteger (market, 'quotePrecision'),
                'amount': this.safeInteger (market, 'basePrecision'),
            };
            result.push (this.extend (this.fees['trading'], {
                'info': market,
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'type': 'spot',
                'spot': spotPer,
                'margin': marginPer && marginEnable,
                'active': spotEnable,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': this.parseNumber (minQty2),
                        'max': this.parseNumber (maxQty2),
                    },
                    'price': {
                        'min': this.parseNumber (minPrice),
                        'max': this.parseNumber (maxPrice),
                    },
                    'cost': {
                        'min': undefined, // this.parseNumber (minQty * minPrice),
                        'max': undefined, // this.parseNumber (maxQty * maxPrice),
                    },
                },
            }));
        }
        return result;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'symbol': this.marketId (symbol),
        };
        if (limit === undefined) {
            limit = 100; // default = 100, max 5000. Valid values are 5, 10, 20, 50 100 and 500
        } else if ((limit !== 5) && (limit !== 10) && (limit !== 20) && (limit !== 50) && (limit !== 100) && (limit !== 500)) {
            throw new BadRequest (this.id + ' fetchOrderBook() limit argument must be undefined, 5, 10, 20, 50, 100 or 500, default is 100');
        }
        request['limit'] = limit;
        const response = await this.publicGetMarketDepth (this.extend (request, params));
        //
        //    {
        //        "code":0,
        //        "msg":"Success",
        //        "data":{
        //            "lastUpdateId":16083754974,
        //            "bids":[
        //                ["46203.21000000","1.75479000"],
        //                ["46203.03000000","0.06255000"],
        //                ["46202.47000000","0.00170000"],
        //                ["46202.46000000","0.01378000"],
        //                ["46202.30000000","0.01634000"]
        //            ],
        //            "asks":[
        //                ["46203.22000000","0.01611000"],
        //                ["46203.24000000","0.00498000"],
        //                ["46203.26000000","0.01136000"],
        //                ["46205.59000000","0.00216000"],
        //                ["46205.84000000","0.08579000"]
        //            ]
        //        },
        //        "timestamp":1641383770656
        //    }
        //
        const result = this.safeValue (response, 'data', {});
        const timestamp = this.safeInteger (response, 'timestamp', {});
        const orderBook = this.parseOrderBook (result, symbol, timestamp, 'bids', 'asks', '0', '1');
        orderBook['nonce'] = this.safeInteger (result, 'lastUpdateId', {});
        return orderBook;
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + this.version + '/' + path;
        if (api === 'public') {
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return '1'; // return;
        }
    }
};
