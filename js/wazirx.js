'use strict';

const Exchange = require ('./base/Exchange');
const { ExchangeError } = require ('./base/errors');

module.exports = class wazirx extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'wazirx',
            'name': 'WazirX',
            'countries': ['IN'],
            'version': 'v2',
            'has': {
                'CORS': true,
                'fetchMarkets': true,
                'fetchCurrencies': false,
                'fetchTickers': false,
                'fetchTicker': false,
                'fetchOHLCV': false,
                'fetchOrderBook': true,
                'fetchTrades': false,
                'fetchTime': true,
                'fetchStatus': true,
            },
            'urls': {
                'logo': 'https://i0.wp.com/blog.wazirx.com/wp-content/uploads/2020/06/banner.png',
                'api': {
                    'spot': {
                        'v1': 'https://api.wazirx.com/sapi/v1',
                    },
                },
                'www': 'https://wazirx.com',
                'doc': 'https://github.com/WazirX/wazirx-api',
            },
            'api': {
                'spot': {
                    'v1': {
                        'public': {
                            'get': [
                                'ping',
                                'systemStatus',
                                'exchangeInfo',
                                'tickers/24hr',
                                'ticker/24hr',
                                'depth',
                                'trades',
                                'time',
                                'historicalTrades',
                            ],
                        },
                    },
                },
            },
            'exceptions': {
                'exact': {
                    '403': 'ab',
                },
            },
            'options': {
                'cachedMarketData': {},
            },
        });
    }

    async fetchMarkets (params = {}) {
        // check filters
        const response = await this.spotV1PublicGetExchangeInfo (params);
        //
        // {
        //     "timezone":"UTC",
        //     "serverTime":1641336850932,
        //     "symbols":[
        //     {
        //         "symbol":"btcinr",
        //         "status":"trading",
        //         "baseAsset":"btc",
        //         "quoteAsset":"inr",
        //         "baseAssetPrecision":5,
        //         "quoteAssetPrecision":0,
        //         "orderTypes":[
        //             "limit",
        //             "stop_limit"
        //         ],
        //         "isSpotTradingAllowed":true,
        //         "filters":[
        //             {
        //                 "filterType":"PRICE_FILTER",
        //                 "minPrice":"1",
        //                 "tickSize":"1"
        //             }
        //         ]
        //     },
        //
        const markets = this.safeValue (response, 'symbols', []);
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const entry = markets[i];
            const id = this.safeString (entry, 'symbol');
            const baseId = this.safeString (entry, 'baseAsset');
            const quoteId = this.safeString (entry, 'quoteAsset');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const filters = this.safeValue (entry, 'filters');
            let minPrice = undefined;
            let maxPrice = undefined;
            let minAmount = undefined;
            let maxAmount = undefined;
            let minCost = undefined;
            for (let j = 0; j < filters.length; j++) {
                const filter = filters[j];
                const filterType = this.safeString (filter, 'filterType');
                if (filterType === 'PRICE_FILTER') {
                    minPrice = this.safeNumber (filter, 'minPrice');
                    maxPrice = this.safeNumber (filter, 'maxPrice');
                    minAmount = this.safeNumber (filter, 'minAmount');
                    maxAmount = this.safeNumber (filter, 'maxAmount');
                    minCost = this.safeNumber (filter, 'minExchangeValue');
                }
            }
            const status = this.safeString (entry, 'status');
            const active = status === 'trading';
            const limits = {
                'price': {
                    'min': minPrice,
                    'max': maxPrice,
                },
                'amount': {
                    'min': minAmount,
                    'max': maxAmount,
                },
                'cost': {
                    'min': minCost,
                    'max': undefined,
                },
            };
            const precision = {
                'price': this.safeInteger (entry, 'quoteAssetPrecision'),
                'amount': this.safeInteger (entry, 'baseAssetPrecision'),
            };
            result.push ({
                'info': entry,
                'symbol': symbol,
                'id': id,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'limits': limits,
                'precision': precision,
                'type': 'spot',
                'spot': true,
                'active': active,
            });
        }
        return result;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets (); // missing markets
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit; // [1, 5, 10, 20, 50, 100, 500, 1000]
        }
        const response = await this.spotV1PublicGetDepth (this.extend (request, params));
        //
        //     {
        //          "timestamp":1559561187,
        //          "asks":[
        //                     ["8540.0","1.5"],
        //                     ["8541.0","0.0042"]
        //                 ],
        //          "bids":[
        //                     ["8530.0","0.8814"],
        //                     ["8524.0","1.4"]
        //                 ]
        //      }
        //
        const timestamp = this.safeTimestamp (response, 'timestamp');
        return this.parseOrderBook (response, symbol, timestamp);
    }

    async fetchStatus (params = {}) {
        const response = await this.spotV1PublicGetSystemStatus (params);
        //
        //  { "status":"normal","message":"System is running normally." }
        //
        let status = this.safeString (response, 'status');
        status = (status === 'normal') ? 'ok' : 'maintenance';
        this.status = this.extend (this.status, {
            'status': status,
            'updated': this.milliseconds (),
        });
        return this.status;
    }

    async fetchTime (params = {}) {
        const response = await this.spotV1PublicGetTime (params);
        //
        //     {
        //         "serverTime":1635467280514
        //     }
        //
        return this.safeInteger (response, 'serverTime');
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const marketType = this.safeValue (api, 0);
        const version = this.safeValue (api, 1);
        let url = this.urls['api'][marketType][version] + '/' + path;
        if (Object.keys (params).length) {
            url += '?' + this.urlencode (params);
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (statusCode, statusText, url, method, responseHeaders, responseBody, response, requestHeaders, requestBody) {
        if (statusCode !== 200) {
            const feedback = this.id + ' ' + responseBody;
            throw new ExchangeError (feedback);
        }
    }
};
