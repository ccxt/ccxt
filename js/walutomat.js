'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { AuthenticationError, InsufficientFunds, ExchangeError } = require ('./base/errors');

//  ---------------------------------------------------------------------------
// TODO: Change API endpoints to v2.0.0 version
module.exports = class walutomat extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'walutomat',
            'name': 'Walutomat',
            'countries': ['PL'],
            'rateLimit': 1000,
            'version': 'v2.0.0',
            'has': {
                'fetchMarkets': true,
                'fetchBalance': true,
                'fetchOrderBook': true,
                'fetchTrades': true,
                'createOrder': true,
                'cancelOrder': true,
                'fetchOrders': true,
                'fetchClosedOrders': true,
            },
            'urls': {
                'logo': 'https://api.walutomat.pl/v2.0.0/walutomat_logo.png',
                'api': 'https://api.walutomat.pl/api',
                'www': 'https://www.walutomat.pl',
                'doc': [
                    'https://api.walutomat.pl/v2.0.0',
                ],
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'api': {
                'public': {
                    'get': [
                        'market_fx/best_offers',
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

    async fetchMarkets () {
        let currencies = ['EUR', 'GBP', 'USD', 'CHF', 'PLN'];
        let markets = [];
        for (let base = 0; base < currencies.length - 1; base++) {
            for (let quote = base + 1; quote < currencies.length; quote++) {
                markets.push ({
                    'id': `${currencies[base]}_${currencies[quote]}`,
                    'symbol': `${currencies[base]}${currencies[quote]}`,
                    'base': currencies[base],
                    'quote': currencies[quote],
                    'active': true,
                    'precision': {
                        'amount': 2,
                        'price': 4,
                    },
                });
            }
        }
        return markets;
    }

    // TODO: Change fetchBalance to newest API
    async fetchBalance (params = {}) {
        let balances = await this.privateGetAccountBalances ();
        let result = {};
        for (let i = 0; i < balances.length; i++) {
            let balance = balances[i];
            result[balance.currency] = {
                'free': balance.balanceAvailable,
                'used': balance.balanceReserved,
                'total': balance.balanceAll,
            };
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        let symbolObject = { 'currencyPair': this.formatSymbol (symbol) };
        let response = await this.publicGetMarketFxBestOffers (this.extend (symbolObject, params));
        let apiResult = this.safeValue (response, 'result');
        let bids = this.safeValue (apiResult, 'bids', []);
        let asks = this.safeValue (apiResult, 'asks', []);
        let result = {
            'bids': [],
            'asks': [],
            'timestamp': undefined,
            'datetime': undefined,
            'nonce': undefined,
        };
        for (let i = 0; i < 10; i++) {
            result.bids.push (this.formatOrderBook (bids[i]));
            result.asks.push (this.formatOrderBook (asks[i]));
        }
        return result;
    }

    // TODO: Change fetchTrades to the newest API
    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        let request = {
            'operationType': 'MARKET_FX',
            'currencies': symbol,
            'continueFrom': since,
            'volume': limit,
            'sortOrder': params.sortOrder || 'DESC',
        };
        let result = await this.privateGetAccountHistory (this.extend (request, params));
        return result.map (trade => ({
            'id': trade.id,
        }));
    }

    // TODO: Change createOrder to the newest API
    async createOrder (symbol, type, side, amount, price, { submitId }) {
        let pair = this.formatSymbol (symbol);
        let currencies = symbol.split ('/');
        let body = {
            submitId,
            pair,
            price,
            'buySell': side.toUpperCase (),
            'volumeCurrency': currencies[0],
            'otherCurrency': currencies[1],
            'volume': amount,
        };
        return await this.privatePostMarketOrders (this.extend (body));
    }

    // TODO: Change cancelOrder to the newest API
    async cancelOrder (id, symbol = undefined, params = {}) {
        let request = {
            'orderId': id,
        };
        return await this.privatePostMarketOrdersCloseOrderId (this.extend (request, params));
    }

    // TODO: Change fetchOrders to the newest API
    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        let orders = await this.privateGetMarketOrders ();
        return orders.map (order => ({
            'info': order,
            'id': order.orderId,
            'symbol': this.parseSymbol (order.market),
            'timestamp': order.submitTs,
            'datetime': order.submitTs,
            'lastTradeTimestamp': order.updateTs,
            'type': 'limit',
            'side': order.buySell.toLowerCase (),
            'price': +order.price,
            'cost': order.feeAmountMax,
            'amount': +order.volume,
            'remaining': undefined,
            'filled': undefined,
            'status': this.parseOrderStatus (order.status),
            'fee': undefined,
            'trades': undefined,
        }));
    }

    // TODO: Update after changing fetchOrders
    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchOrders (symbol, since, limit, params);
    }

    formatOrderBook (orderBookEntry) {
        return [this.safeFloat (orderBookEntry, 'price'), this.safeFloat (orderBookEntry, 'volume')];
    }

    formatSymbol (symbol) {
        return symbol.replace ('/', '');
    }

    parseSymbol (symbol) {
        return `${symbol.slice (0, 3)}/${symbol.slice (3)}`;
    }

    // TODO: Probably needs changes, need to verify with the API
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

    // TODO: Check if signing hasn't changed when API version went to v2.0.0
    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.version + '/' + this.url (path, params);
        let uri = '/api/' + this.version + '/' + this.url (path, params);
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

    handleErrors (httpCode, reason, url, method, headers, body) {
        if (typeof body !== 'string')
            return; // fallback to default error handler
        if (body.length < 2)
            return; // fallback to default error handler
        // code 401 and plain body 'Authentication failed' (with single quotes)
        // this error is sent if you do not submit a proper Content-Type
        if ((body[0] === '{') || (body[0] === '[')) {
            let response = JSON.parse (body);
            let errors = this.safeValue (response, 'errors', []);
            if (errors.length > 0) {
                let feedback = this.id + ' ' + this.json (response);
                let exceptions = this.exceptions;
                for (let i = 0; i < errors.length; i++) {
                    if (errors[i].key in exceptions) {
                        throw new exceptions[errors[i].key] (feedback);
                    } else {
                        throw new ExchangeError (feedback);
                    }
                }
            }
        }
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if (typeof response !== 'object') {
            throw new ExchangeError (this.id + ' returned a non-json response: ' + response.toString ());
        }
        if ((response[0] === '{' || response[0] === '[')) {
            return JSON.parse (response);
        }
        return response;
    }
};
