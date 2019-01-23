'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { AuthenticationError, BadRequest, ExchangeError, ExchangeNotAvailable, InsufficientFunds, NotSupported } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class walutomat extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'walutomat',
            'name': 'Walutomat',
            'countries': ['PL'],
            'rateLimit': 1000,
            'version': 'v1',
            'has': {
                'fetchMarkets': true,
                'fetchBalance': true,
                'fetchOrderBook': true,
                'fetchTrades': true,
                'createOrder': true,
                'cancelOrder': true,
                'fetchOrders': true,
                'fetchClosedOrders': true,
                'fetchTicker': false,
            },
            'urls': {
                'logo': 'https://api.walutomat.pl/v2.0.0/walutomat_logo.png',
                'api': 'https://api.walutomat.pl/api',
                'www': 'https://www.walutomat.pl',
                'doc': [
                    'https://api.walutomat.pl/',
                ],
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'api': {
                'public': {
                    'get': [
                        'public/market/orderbook/{symbol}',
                    ],
                },
                'private': {
                    'get': [
                        'account/id',
                        'account/balances',
                        'account/history',
                        'market/orders',
                        'market/orders/{orderId}',
                    ],
                    'post': [
                        'market/orders',
                        'market/orders/close/{orderId}',
                    ],
                },
            },
            'exceptions': {
                'INVALID ARGUMENT': ExchangeError,
                'INVALID PARAMETER': ExchangeError,
                'INSUFFICIENT_FUNDS': InsufficientFunds,
                'MISSING_API_KEY': AuthenticationError,
            },
        });
    }

    fetchMarkets (params = {}) {
        let currencies = ['EUR', 'GBP', 'USD', 'CHF', 'PLN'];
        let markets = [];
        let currenciesLength = currencies.length;
        for (let base = 0; base < currenciesLength - 1; base++) {
            let newIndex = base + 1;
            for (let quote = newIndex; quote < currencies.length; quote++) {
                markets.push ({
                    'id': currencies[base] + '_' + currencies[quote],
                    'symbol': currencies[base] + '/' + currencies[quote],
                    'base': currencies[base],
                    'quote': currencies[quote],
                    'active': true,
                    'precision': {
                        'amount': 2,
                        'price': 4,
                    },
                    'info': currencies[base] + ' - ' + currencies[quote] + ' exchange',
                });
            }
        }
        return markets;
    }

    async fetchBalance (params = {}) {
        let balances = await this.privateGetAccountBalances ();
        let result = {};
        for (let i = 0; i < balances.length; i++) {
            let balance = balances[i];
            result[this.safeString (balance, 'currency')] = {
                'free': this.safeFloat (balance, 'balanceAvailable'),
                'used': this.safeFloat (balance, 'balanceReserved'),
                'total': this.safeFloat (balance, 'balanceAll'),
            };
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        let symbolObject = { 'symbol': this.formatSymbol (symbol) };
        let response = await this.publicGetPublicMarketOrderbookSymbol (this.extend (symbolObject, params));
        return this.parseOrderBook (response, undefined, 'bids', 'asks', 'price', 'baseVolume');
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        let request = {
            'operationType': 'MARKET_FX',
            'currencies': symbol,
            'continueFrom': since,
            'volume': limit,
            'sortOrder': 'DESC',
        };
        let response = await this.privateGetAccountHistory (this.extend (request, params));
        let result = [];
        for (let i = 0; i < response.length; i++) {
            result.push ({
                'id': this.safeInteger (response, 'id'),
            });
        }
        return result;
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        let submitId = params.submitId;
        let pair = this.formatSymbol (symbol);
        let currencies = symbol.split ('/');
        let body = {
            'submitId': submitId,
            'pair': pair,
            'price': price,
            'buySell': side.toUpperCase (),
            'volumeCurrency': currencies[0],
            'otherCurrency': currencies[1],
            'volume': amount,
        };
        return await this.privatePostMarketOrders (this.extend (body));
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        let request = {
            'orderId': id,
        };
        return await this.privatePostMarketOrdersCloseOrderId (this.extend (request, params));
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        // TODO: Would be nice to get parametrized API response
        let orders = await this.privateGetMarketOrders ();
        let result = [];
        for (let i = 0; i < orders.length; i++) {
            result.push ({
                'info': orders[i],
                'id': this.safeString (orders[i], 'orderId'),
                'symbol': this.parseSymbol (this.safeString (orders[i], 'market')),
                'timestamp': undefined,
                'datetime': this.safeString (orders[i], 'submitTs'),
                'lastTradeTimestamp': undefined,
                'type': 'limit',
                'side': this.safeString (orders[i], 'buySell').toLowerCase (),
                'price': this.safeFloat (orders[i], 'price'),
                'cost': this.safeFloat (orders[i], 'feeAmountMax'),
                'amount': this.safeFloat (orders[i], 'volume'),
                'remaining': undefined,
                'filled': undefined,
                'status': this.parseOrderStatus (this.safeString (orders[i], 'status')),
                'fee': undefined,
                'trades': undefined,
            });
        }
        return result;
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        // TODO: Would be nice to have fetchOrders parametrized to get closed offers
        return await this.fetchOrders (symbol, since, limit, params);
    }

    formatOrderBook (orderBookEntry) {
        return [this.safeFloat (orderBookEntry, 'price'), this.safeFloat (orderBookEntry, 'baseVolume')];
    }

    formatSymbol (symbol) {
        return symbol.replace ('/', '_');
    }

    parseSymbol (symbol) {
        return symbol.replace ('_', '/');
    }

    parseOrderStatus (status) {
        let statuses = {
            'MARKET_REQUESTED': 'open',
            'MARKET_PUBLISHED': 'open',
            'CLOSED': 'closed',
            'CANCELLED': 'canceled',
        };
        if (status in statuses) {
            return statuses[status];
        }
        return status;
    }

    makeUri (path, params) {
        return '/api/' + this.version + '/' + this.url (path, params);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.version + '/' + this.url (path, params);
        let uri = this.makeUri (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (api === 'private') {
            this.checkRequiredCredentials ();
            let timestamp = this.milliseconds ().toString ();
            let prehash = uri + timestamp;
            if (method === 'POST') {
                body = this.json (query);
                prehash += body;
            }
            let signature = this.hmac (this.encode (prehash), this.encode (this.secret), 'sha256', 'hex');
            headers = {
                'X-API-KEY': this.apiKey,
                'X-API-SIGNATURE': signature,
                'X-API-NONCE': timestamp,
                'Content-Type': 'application/json',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response) {
        if (typeof body !== 'string')
            return; // fallback to default error handler
        if (body.length < 2)
            return; // fallback to default error handler
        if ((body[0] === '{') || (body[0] === '[')) {
            let errorMessage = this.safeString (response, 'message');
            let errors = this.safeValue (response, 'errors', {});
            if (errorMessage) {
                let exceptions = this.exceptions;
                let feedback = this.json (errors);
                if (errorMessage in exceptions) {
                    throw new exceptions[errorMessage] (feedback);
                } else {
                    throw new ExchangeError (feedback);
                }
            }
        }
        if (httpCode !== 200) {
            let feedback = this.json (response);
            if (httpCode === 400) {
                throw new BadRequest (feedback);
            } else if (httpCode === 401 || httpCode === 403) {
                throw new AuthenticationError (feedback);
            } else if (httpCode === 404) {
                throw new NotSupported (feedback);
            } else if (httpCode === 500) {
                throw new ExchangeNotAvailable (feedback);
            } else {
                throw new ExchangeError (feedback);
            }
        }
    }
};
