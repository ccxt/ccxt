'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, AuthenticationError, DDoSProtection } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class coinzip extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'coinzip',
            'name': 'Coinzip',
            'countries': ['PH', 'KR', 'JP', 'SG', 'AU'],
            'rateLimit': 400,
            'version': 'v2',
            'has': {
                'CORS': false,
                'fetchBalance': true,
                'fetchMarkets': true,
                'createOrder': true,
                'cancelOrder': true,
                'fetchTicker': true,
                'fetchOHLCV': true,
                'fetchTickers': true,
                'fetchMyTrades': true,
                'fetchTrades': true,
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/coinzip.logo.jpg',
                'api': 'https://coinzip.co',
                'www': 'https://coinzip.co',
                'documents': 'https://coinzip.co/documents/api_v2'
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true
            },
            'api': {
                'public': {
                    'get': [
                        '/api/v2/markets',
                        '/api/v2/tickers',
                        '/api/v2/tickers/{market}',
                        '/api/v2/order_book',
                        '/api/v2/depth',
                        '/api/v2/trades',
                        '/api/v2/k',
                        '/api/v2/k_with_pending_trades',
                        '/api/v2/timestamp'
                    ]
                },
                'private': {
                    'get': [
                        '/api/v2/members/me',
                        '/api/v2/deposits',
                        '/api/v2/deposit/id',
                        '/api/v2/orders',
                        '/api/v2/orders/{id}',
                        '/api/v2/orders/summary',
                        '/api/v2/trades/my',
                    ],
                    'post': [
                        '/api/v2/orders',
                        '/api/v2/orders/multi',
                        '/api/v2/orders/clear',
                        '/api/v2/order/delete'
                    ]
                }
            },
            'fees': {
                'trading': {
                }
            }
        });
    }

    async fetchMarkets (params = {}) {
        const markets = await this.publicGetApiV2Markets ();

        return markets.map(m => ({
            'id': m.id.toUpperCase(),
            'symbol': m.name,
            'base': m.base_unit.toUpperCase(),
            'quote': m.quote_unit.toUpperCase(),
            'baseId': m.base_unit,
            'quoteId': m.quote_unit,
            'info': m,
            'precision': {
                'amount': 8,
                'price': 8,
            },
            'limits': {
                'amount': {
                    'min': undefined,
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
            }
        }));
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const { apiKey, secret, urlencode, now, hmac } = this;
        const query = this.omit (params, this.extractParams (path));
        const sortByKey = (data => Object.keys(data).sort().reduce((obj, k) => {
            obj[k] = data[k];
            return obj;
        }, {}));
        const url = ((apiURL, path, params, query) => {
            const rawUrl = `${ apiURL }/${ this.implodeParams (path, params) }`;

            if (api === 'private') {
                const tonce = now ();
                const extendedQuery = sortByKey ({ 'access_key': apiKey, 'tonce': tonce, ...query });
                const signature = hmac (`${method}|${path}|${urlencode (extendedQuery)}`, secret);
                const signedQuery = { ...extendedQuery, signature };

                return rawUrl + '?' + urlencode (sortByKey (signedQuery));
            }

            return rawUrl;
        }) (this.urls['api'], path, params, query);

        return { url, method, body, headers };
    }
};

