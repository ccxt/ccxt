'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class coinsbit extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'coinsbit',
            'name': 'Coinsbit',
            'countries': ['BR'],
            'rateLimit': 1000,
            'has': {
                'createMarketOrder': false,
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
            },
            'urls': {
                'api': {
                    'public': 'http://coinsbit.io/api/v1/public',
                    'private': 'http://coinsbit.io/api/v1/private',
                    'wapi': 'wss://coinsbit.io/api/v1/trade_ws',
                },
                'www': 'https://coinsbit.io/',
                'doc': [
                    'https://www.notion.so/API-COINSBIT-WS-API-COINSBIT-cf1044cff30646d49a0bab0e28f27a87',
                ],
                'fees': 'https://coinsbit.io/fee-schedule',
            },
            'api': {
                'public': {
                    'get': [
                        'markets',
                        'tickers',
                        'ticker',
                        'book',
                        'history',
                        'symbols',
                        'depth/result'
                    ],
                    'post': [
                        'order/new',
                        'order/cancel',
                        'orders',
                        'account/balances',
                        'account/balance',
                        'account/order',
                        'account/order_history'
                    ]
                },
                'private': {
                    'get': [
                        'markets',
                        'tickers',
                        'ticker',
                        'book',
                        'history',
                        'symbols',
                        'depth/result'
                    ],
                    'post': [
                        'order/new',
                        'order/cancel',
                        'orders',
                        'account/balances',
                        'account/balance',
                        'account/order',
                        'account/order_history'
                    ]
                },
                'wapi': {
                    'server': [
                        'ping',
                        'time',
                    ],
                    'kline': [
                        'subscribe',
                        'unsubscribe',
                    ],
                    'price': [
                        'subscribe',
                        'unsubscribe',
                    ],
                    'state': [
                        'query',
                        'subscribe',
                        'unsubscribe',
                    ],
                    'deals': [
                        'subscribe',
                        'unsubscribe',
                    ],
                    'depth': [
                        'subscribe',
                        'unsubscribe',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'maker': 0.002,
                    'taker': 0.002,
                },
                'funding': {
                    'withdraw': {
                        'BTC': 0.0,
                        'ETH': 0.0,
                        'KSH': 0.0,
                    },
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetMarkets (params);
        const markets = this.safeValue (response, 'result');
        const numMarkets = markets.length;
        if (numMarkets < 1) {
            throw new ExchangeError (this.id + ' publicGetCommonSymbols returned empty response: ' + this.json (markets));
        }
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const baseId = this.safeString (market, 'stock');
            const quoteId = this.safeString (market, 'money');
            const id = baseId + quoteId;
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const precision = {
                'amount': market['stockPrec'],
                'price': market['moneyPrec'],
            };
            const minAmount = this.safeFloat (market, 'minAmount', 0);
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': true,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': minAmount,
                        'max': undefined,
                    },
                    'price': {
                        'min': Math.pow (10, -precision['price']),
                        'max': undefined,
                    },
                    'cost': {
                        'min': -1 * Math.log10 (precision['amount']),
                        'max': undefined,
                    },
                },
                'info': market,
            });
        }
        return result;
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/';

        url += this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            this.checkRequiredCredentials ();
            const nonce = this.nonce ().toString ();
            const auth = nonce + this.uid + this.apiKey;
            const signature = this.encode (this.hmac (this.encode (auth), this.encode (this.secret)));
            query = this.extend ({
                'key': this.apiKey,
                'signature': signature.toUpperCase (),
                'nonce': nonce,
            }, query);
            body = this.urlencode (query);
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
};
