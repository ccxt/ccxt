'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ExchangeNotAvailable, InsufficientFunds, OrderNotFound, InvalidOrder, InvalidNonce, AuthenticationError } = require ('./base/errors');
//  ---------------------------------------------------------------------------

module.exports = class levidge extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'levidge',
            'name': 'Levidge',
            'countries': ['US'],
            'rateLimit': 500,
            'certified': false,
            'has': {
                'CORS': false,
                'fetchBidsAsks': true,
                'fetchTickers': true,
                'fetchOHLCV': true,
                'fetchOrder': true,
                },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/29604020-d5483cdc-87ee-11e7-94c7-d1a8d9169293.jpg',
                'api': {
                    'public': 'https://levidge.com/api',
                },
                'www': 'https://levidge.com',
                'doc': [
                    'https://levidge.com/api-doc/en.html#introduction',
                ],
            },
            'api': {
                'fpublic': {
                    'get': [
                        'Instruments',
                        'InstrumentPairs',
                        'OrderBook',
                        'TradeHistory',
                        'Chart',
                    ],
                },
                'public': {
                    'get': [
                        'Instruments',
                        'InstrumentPairs',
                        'OrderBook',
                        'TradeHistory',
                        'Chart',
                    ],
                },
            },
            });
    }

    async fetchTicker (params = {}) {
        const defaultType = this.safeString2 (this.options, 'fetchTickers', 'defaultType', 'spot');
        const type = this.safeString (params, 'type', defaultType);
        const method = (type === 'spot') ? 'publicGetInstruments' : 'fpublicGetInstruments';
        const response = await this[method] (params);
        return response;
    }

    // async fetchInstrumentPairs (params = {}) {
    //     const defaultType = this.safeString2 (this.options, 'fetchTickers', 'defaultType', 'spot');
    //     const type = this.safeString (params, 'type', defaultType);
    //     const method = (type === 'spot') ? 'publicGetInstrumentPairs' : 'fpublicGetInstrumentPairs';
    //     const response = await this[method] (params);
    //     return response;
    // }

    async fetchOrderBook (id, params = {}) {
        // console.log (id);
        const market = this.market (id);
        const request = {
            'pairId': market['id'],
        };
        const method = market['spot'] ? 'publicGetOrderBook' : 'fpublicGetOrderBook';
        const response = await this[method] (this.extend (request, params));
        return response;
    }

    async fetchBidsAsks (id, params = {}) {
        // console.log (id);
        const market = this.market (id);
        const request = {
            'pairId': market['id'],
        };
        const defaultType = this.safeString2 (this.options, 'fetchOrder', 'defaultType', 'spot');
        const type = this.safeString (params, 'type', defaultType);
        const method = (type === 'spot') ? 'publicGet' : 'fpublicGet';
        const response = await this[method] (this.extend (request, params));
        return response;
    }

    async fetchChart (id, timestamp, params = {}) {
        // console.log (timestamp);
        const request = {
            'pairId': id,
            'timespan': timestamp,
        };
        const defaultType = this.safeString2 (this.options, 'fetchOrder', 'defaultType', 'spot');
        const type = this.safeString (params, 'type', defaultType);
        const method = (type === 'spot') ? 'publicGetChart' : 'fpublicGetChart';
        const response = await this[method] (this.extend (request, params));
        return response;
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api];
        path = 'get' + path;
        url += '/' + path;
        if (api === 'wapi') {
            url += '.html';
        }
        const userDataStream = ((path === 'userDataStream') || (path === 'listenKey'));
        if (path === 'historicalTrades') {
            headers = {
                'X-MBX-APIKEY': this.apiKey,
            };
        } else if (userDataStream) {
            // v1 special case for userDataStream
            body = this.urlencode (params);
            headers = {
                'X-MBX-APIKEY': this.apiKey,
                'Content-Type': 'application/x-www-form-urlencoded',
            };
        }
        if ((api === 'private') || (api === 'sapi') || (api === 'wapi' && path !== 'systemStatus') || (api === 'fapiPrivate')) {
            this.checkRequiredCredentials ();
            let query = this.urlencode (this.extend ({
                'timestamp': this.nonce (),
                'recvWindow': this.options['recvWindow'],
            }, params));
            const signature = this.hmac (this.encode (query), this.encode (this.secret));
            query += '&' + 'signature=' + signature;
            headers = {
                'X-MBX-APIKEY': this.apiKey,
            };
            if ((method === 'GET') || (method === 'DELETE') || (api === 'wapi')) {
                url += '?' + query;
            } else {
                body = query;
                headers['Content-Type'] = 'application/x-www-form-urlencoded';
            }
        } else {
            if (!userDataStream) {
                if (Object.keys (params).length) {
                    url += '?' + this.urlencode (params);
                }
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
};
