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
                'fetchOrder':true,
                'fetchOrders':true,
                'fetchOpenOrders':true,
            },
            'urls': {
                'logo': 'https://www.bcex.top/images/bcex_logo0.png',
                'api': 'https://www.bcex.top',
                'www': 'https://www.bcex.ca',
                'doc': 'https://www.bcex.ca/api_market/market/',
                'fees': 'http://bcex.udesk.cn/hc/articles/57085',//TODO
            },
            'api': {
                'public': {
                    'get': [
                        'Api_Market/markets',
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
                //TODO
            },
        });
    }

    async fetchMarkets() {
        //TODO
    }

    async fetchBalance(params = {}) {
        //TODO
    }

    async fetchOrderBook(symbol, limit = undefined, params = {}) {
        //TODO
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        //TODO
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        //TODO
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        //TODO
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        //TODO
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        //TODO
    }
};
