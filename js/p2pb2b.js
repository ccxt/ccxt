'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ArgumentsRequired, AuthenticationError, ExchangeError, OrderNotFound, InsufficientFunds, InvalidOrder } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class p2pb2b extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'p2pb2b',
            'name': 'p2pb2b',
            'countries': ['EE'],
            'version': 'v1',
            'rateLimit': 1000,
            'has': {
                'createMarketOrder': false,
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchCurrencies': false,
                'fetchTicker': false,
                'fetchTickers': false,
                'fetchOHLCV': false,
                'fetchTrades': false,
            },
            'urls': {
                'api': {
                    'public': 'https://api.p2pb2b.io/api/v1/public',
                    'private': 'https://api.p2pb2b.io/api/v1',
                    'wapi': 'wss://apiws.p2pb2b.io/',
                },
                'www': 'https://p2pb2b.io/',
                'doc': [
                    'https://documenter.getpostman.com/view/6288660/SVYxnEmD?version=latest',
                    'https://p2pb2bwsspublic.docs.apiary.io/',
                ],
                'fees': 'https://p2pb2b.io/fee-schedule',
            },
            'api': {
                'public': {
                    'get': [
                        'markets',
                        'tickers',
                        'ticker',
                        'book',
                        'history',
                        'history/result',
                        'products',
                        'symbols',
                        'depth/result',
                    ],
                },
                'private': {
                    'post': [
                        'order/new',
                        'order/cancel',
                        'orders',
                        'account/balances',
                        'account/balance',
                        'account/order',
                        'account/order_history',
                    ],
                },
                'wapi': {
                    'server': [
                        'ping',
                        'time',
                    ],
                    'kline': [
                        'subscribe',
                        'unsubscribe',
                        'update',
                    ],
                    'price': [
                        'subscribe',
                        'unsubscribe',
                        'update',
                    ],
                    'state': [
                        'query',
                        'subscribe',
                        'unsubscribe',
                        'update',
                    ],
                    'deals': [
                        'subscribe',
                        'unsubscribe',
                        'update',
                    ],
                    'depth': [
                        'subscribe',
                        'unsubscribe',
                        'update',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'maker': 0.002,
                    'taker': 0.002,
                },
            },
            'exceptions': {
                'Balance not enough': InsufficientFunds,
                'Total is less than': InvalidOrder,
                'Order not found': OrderNotFound,
                'Unauthorized request.': AuthenticationError,
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
                'amount': this.safeFloat (market, 'stockPrec'),
                'price': this.safeFloat (market, 'moneyPrec'),
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
        const method = 'privatePostOrderNew';
        const request = {
            'side': side,
            'market': market['id'],
            'amount': this.amountToPrecision (symbol, amount),
            'price': this.priceToPrecision (symbol, price),
        };
        const response = await this[method] (this.extend (request, params));
        const order = this.parseNewOrder (response.result, market);
        return order;
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'market': this.marketId (symbol),
            'orderId': parseInt (id),
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
            'market': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privatePostOrders (this.extend (request, params));
        const result = response.result;
        return this.parseOrders (result, market, since, limit);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const orderIdField = this.getOrderIdField ();
        const request = {};
        request[orderIdField] = id;
        const response = await this.privatePostAccountOrder (this.extend (request, params));
        if (response['result'].length === 0) {
            throw new OrderNotFound (this.id + ' order ' + id + ' not found');
        }
        return this.parseOrder (response['result']['records']);
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
        return this.parseOrderBook (response.result, undefined, 'bids', 'asks');
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const query = this.omit (params, 'type');
        const response = await this.privatePostAccountBalances (query);
        const balances = this.safeValue (response, 'result');
        const symbols = Object.keys (balances);
        const result = { 'info': balances };
        for (let i = 0; i < symbols.length; i++) {
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
                'X-TXC-SIGNATURE': signature,
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    parseNewOrder (order, market = undefined) {
        const marketName = this.safeString (order, 'market');
        market = market || this.findMarket (marketName);
        const symbol = this.safeString (market, 'symbol');
        let timestamp = this.safeString (order, 'timestamp');
        if (timestamp !== undefined) {
            timestamp = parseInt (timestamp) * 1000;
        }
        const amount = this.safeFloat (order, 'amount');
        const remaining = this.safeFloat (order, 'left');
        const fillAmount = amount - remaining;
        return {
            'id': this.safeString (order, 'orderId'),
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'lastTradeTimestamp': undefined,
            'status': undefined,
            'symbol': symbol,
            'type': this.safeString (order, 'type'),
            'side': this.safeString (order, 'side'),
            'price': this.safeFloat (order, 'price'),
            'cost': this.safeFloat (order, 'dealFee', 0.0),
            'amount': amount,
            'filled': fillAmount,
            'remaining': remaining,
            'fee': this.safeFloat (order, 'dealFee'),
            'info': order,
        };
    }

    parseOrder (order, market = undefined) {
        const marketName = this.safeString (order, 'market');
        market = market || this.findMarket (marketName);
        const symbol = this.safeString (market, 'symbol');
        let timestamp = this.safeString (order, 'time');
        if (timestamp !== undefined) {
            timestamp = parseInt (timestamp) * 1000;
        }
        const amount = this.safeFloat (order, 'amount');
        const fillAmount = this.safeFloat (order, 'dealStock', amount);
        const remaining = amount - fillAmount;
        return {
            'id': this.safeString (order, 'id'),
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'lastTradeTimestamp': undefined,
            'status': undefined,
            'symbol': symbol,
            'type': this.safeString (order, 'type'),
            'side': this.safeString (order, 'side'),
            'price': this.safeFloat (order, 'price'),
            'cost': this.safeFloat (order, 'dealFee', 0.0),
            'amount': amount,
            'filled': fillAmount,
            'remaining': remaining,
            'fee': this.safeFloat (order, 'dealFee'),
            'info': order,
        };
    }

    getOrderIdField () {
        return 'orderId';
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return;
        }
        if (body.length > 0) {
            if (body[0] === '{') {
                const success = this.safeValue (response, 'success', true);
                const errorMessage = this.safeValue (response, 'message', [[]]);
                if (!success && errorMessage) {
                    const messageKey = Object.keys (errorMessage)[0];
                    const message = errorMessage[messageKey][0];
                    const exceptionMessages = Object.keys (this.exceptions);
                    for (let i = 0; i < exceptionMessages.length; i++) {
                        const exceptionMessage = exceptionMessages[i];
                        if (message.indexOf (exceptionMessage) >= 0) {
                            const ExceptionClass = this.exceptions[exceptionMessage];
                            throw new ExceptionClass (this.id + ' ' + message);
                        }
                    }
                }
            }
        }
        if (code >= 400 || this.safeValue (response, 'status', 200) >= 400) {
            if (body.indexOf ('Server Error') >= 0) {
                throw new ExchangeError (this.id + ' Server Error');
            }
        }
    }
};
