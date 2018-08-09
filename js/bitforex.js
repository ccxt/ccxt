'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, AuthenticationError } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class bitforex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitforex',
            'name': 'Bitforex',
            'countries': [ 'CN' ],
            'version': '1',
            'has': {
                'fetchBalance': true,
                'fetchMarkets': true,
                'createOrder': true,
                'cancelOrder': true,
                'fetchTicker': true,
                'fetchTickers': false,
                'fetchTrades': true,
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchOpenOrders': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1249087/43923293-57f06258-9bef-11e8-8630-53bd65111998.png',
                'api': 'https://api.bitforex.com/api/v1',  
                'www': 'https://www.bitforex.com',
                'doc': 'https://github.com/bitforexapi/API_Docs/wiki',
                'fees': 'https://help.bitforex.com/en_us/?cat=13',
                'referral': '',
            },
            'api': {
                'public': {
                    'get': [
                        'market/symbols',
                        'market/ticker',
                        'market/depth',
                        'market/trades',
                        'market/kline',
                    ],
                },
                'private': {
                    'post': [
                        'fund/mainAccount',
                        'fund/allAccount',
                        'fund/placeOrder',
                        'fund/cancelOrder',
                        'fund/orderInfo',
                        'fund/orderInfos',
                    ],
                },
            },
            'fees': {
            },
        });
    }

    async fetchMarkets () {
        let response = await this.publicGetMarketSymbols ();
        let data = response['data'];
        let result = [];
        for (let i = 0; i < data.length; i++) {
            let market = data[i];
            let id = market['symbol'];
            let symbolParts = id.split ('-');
            let baseId = symbolParts[2];
            let quoteId = symbolParts[1];
            let base = baseId.toUpperCase ();
            let quote = quoteId.toUpperCase ();
            base = this.commonCurrencyCode (base);
            quote = this.commonCurrencyCode (quote);
            let symbol = base + '/' + quote;
            let active = true;
            let precision = {
                'amount':market['amountPrecision'],   //TODO: This is 4. Do we need to convert to decimal places? (eg. 0.0001?)
                'price':  market['pricePrecision'],
            };
            let limits = {
                'amount': {
                    'min': market['minOrderAmount'], 
                    'max': undefined,
                },
                'price': {
                    'min': undefined, 
                    'max': undefined,
                },
                'cost': {
                    'min': undefined, 
                    'max': undefined,
                },
            };
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': active,
                'precision': precision,
                'limits': limits,
                'info': market,
            });
        }
        return result;
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        return -1;
    }

    async fetchBalance (params = {}) {
        return -1;
    }

    async fetchTicker (symbol, params = {}) {
        return -1;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        return -1;
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return -1;
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        return -1;
    }

    async fetchOrdersByType (type, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return -1;
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return -1;
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return -1;
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        return -1;
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        return -1;
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            this.checkRequiredCredentials ();

            //TODO
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };    }

    handleErrors (code, reason, url, method, headers, body) {
        //TODO
        return;
    }
};
