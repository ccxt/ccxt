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
                'fetchMarkets': false,
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
                'api': 'https://api.wazirx.com',
                'www': 'https://wazirx.com',
                'doc': 'https://github.com/WazirX/wazirx-api',
            },
            'api': {
                'public': {
                    'get': [
                        'sapi/v1/ping',
                        'sapi/v1/systemStatus',
                        'sapi/v1/exchangeInfo',
                        'sapi/v1/tickers/24hr',
                        'sapi/v1/ticker/24hr',
                        'sapi/v1/depth',
                        'sapi/v1/trades',
                        'sapi/v1/time',
                        'sapi/v1/historicalTrades',
                    ],
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
        return []; // tmp
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit; // [1, 5, 10, 20, 50, 100, 500, 1000]
        }
        const response = await this.publicGetSapiV1Depth (this.extend (request, params));
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
        return this.parseOrderBook (response, timestamp);
    }

    async fetchStatus (params = {}) {
        const response = await this.publicGetSapiV1SystemStatus (params);
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
        const response = await this.publicGetSapiV1Time (params);
        //
        //     {
        //         "serverTime":1635467280514
        //     }
        //
        return this.safeInteger (response, 'serverTime');
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + path;
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
