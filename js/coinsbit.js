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
            'countries': ['EE'],
            'version': 'v1',
            'rateLimit': 1000,
            'has': {
                'createMarketOrder': false,
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
                'fetchCurrencies': false,
            },
            'urls': {
                'api': {
                    'public': 'https://coinsbit.io/api/v1/public',
                    'private': 'https://coinsbit.io/api/v1',
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
            throw new ExchangeError (this.id + ' publicGetMarkets returned empty response: ' + this.json (markets));
        }
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const baseId = this.safeString (market, 'stock');
            const quoteId = this.safeString (market, 'money');
            const id = baseId + '_' + quoteId;
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

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        let method = 'privatePostOrderNew';
        const request = {
            'pair': market['id'],
            'amount': this.amountToPrecision (symbol, amount),
            'price': this.priceToPrecision (symbol, price),
        };
        const response = await this[method] (this.extend (request, params));
        const order = this.parseOrder (response, market);
        return this.extend (order, {
            'type': type,
        });
    }

    async cancelOrder (id, symbol, params = {}) {
        await this.loadMarkets ();
        const request = {
            'market': this.marketId (symbol),
            'order_id': parseInt (id),
        };
        return await this.privatePostOrderCancel (this.extend (request, params));
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrders requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privatePostOrders (this.extend (request, params));
        const result = response.result;
        return this.parseOrders (result, market, since, limit);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'market': this.marketId (symbol),
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetDepthResult (this.extend (request, params));
        return this.parseOrderBook (response, undefined, 'bids', 'asks');
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const query = this.omit (params, 'type');
        const response = await this.privatePostAccountBalances (query);
        const balances = this.safeValue (response, 'result');
        const symbols = Object.keys (balances);
        const result = { 'info': balances };
        for (let i = 0; i < symbols.length; i ++) {
            const currencyId = symbols[i];
            const code = this.safeCurrencyCode (currencyId);
            const balance = balances[code];
            const account = this.account ();
            account['free'] = this.safeFloat (balance, 'available');
            account['total'] = this.safeFloat (balance, 'available') + this.safeFloat (balance, 'freeze');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));

        if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            this.checkRequiredCredentials ();
            const request = '/api/' + this.version + '/' + this.implodeParams (path, params);
            const nonce = this.nonce ().toString ();
            query = this.extend ({
                'nonce': nonce.toString (),
                'request': request,
            }, query);
            body = this.json (query);
            query = this.encode (body);
            const payload = this.stringToBase64 (query);
            const secret = this.encode (this.secret);
            const signature = this.hmac (payload, secret, 'sha512');
            headers = {
                'Content-type': 'application/json',
                'X-TXC-APIKEY': this.apiKey,
                'X-TXC-PAYLOAD': payload,
                'X-TXC-SIGNATURE': signature
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    parseOrder (order, market = undefined) {
        const id = this.safeString (order, 'id');
        let side = this.safeString (order, 'type');

        return {
            'id': id,
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'lastTradeTimestamp': lastTradeTimestamp,
            'status': status,
            'symbol': symbol,
            'type': undefined,
            'side': side,
            'price': price,
            'cost': cost,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'trades': trades,
            'fee': fee,
            'info': order,
        };
    }
};
