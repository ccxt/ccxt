'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class bcex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bcex',
            'name': 'bcex',
            'countries': [ 'CA' ],
            'rateLimit': 500,
            'version': '1',
            'has': {
                'fetchBalance': true,
                'fetchMarkets': true,
                'createOrder': true,
                'cancelOrder': true,
                'fetchTicker': true,
                'fetchTickers': false,
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchOpenOrders': true,
            },
            'urls': {
                'logo': 'https://www.bcex.top/images/bcex_logo0.png',
                'api': 'https://www.bcex.top',
                'www': 'https://www.bcex.ca',
                'doc': 'https://www.bcex.ca/api_market/market/',
                'fees': 'http://bcex.udesk.cn/hc/articles/57085',
            },
            'api': {
                'public': {
                    'get': [
                        'Api_Market/getPriceList'
                    ],
                },
                'private': {
                    'post': [
                        'Api_User/userBalance',
                        'Api_Order/coinTrust',
                        'Api_Order/cancel',
                        'Api_Order/ticker',
                        'Api_Order/orderList',
                        'Api_Order/tradeList',
                    ],
                },
            },
            'fees': {
            },
        });
    }

    async fetchMarkets () {
        let response = await this.publicGetApiMarketGetPriceList ();
        return 0;
    }

    async fetchBalance (params = {}) {
        return 0;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        return 0;
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return 0;
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        return 0;
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return 0;
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        return 0;
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        return 0;
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let request = '/' + this.implodeParams(path, params);
        let query = this.omit(params, this.extractParams(path));
        if (method === 'GET') {
            if (Object.keys(query).length)
                request += '?' + this.urlencode(query);
        }
        let url = this.urls['api'] + request;
        if (api === 'private') {
            this.checkRequiredCredentials();
            let timestamp = this.milliseconds().toString();
            let payload = '';
            if (method !== 'GET') {
                if (Object.keys(query).length) {
                    body = this.json(query);
                    payload = body;
                }
            }
            let what = timestamp + method + request + payload;
            let signature = this.hmac(this.encode(what), this.encode(this.secret), 'sha256');
            headers = {
                'CRYPTON-APIKEY': this.apiKey,
                'CRYPTON-SIGNATURE': signature,
                'CRYPTON-TIMESTAMP': timestamp,
                'Content-Type': 'application/json',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
};
