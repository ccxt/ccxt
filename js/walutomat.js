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
                'fetchTrades': false,
                'createOrder': true,
                'cancelOrder': true,
                'fetchOrders': true,
                'fetchClosedOrders': true,
                'fetchTicker': false,
                'fetchOHLCV': false,
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
        const currencies = ['EUR', 'GBP', 'USD', 'CHF', 'PLN'];
        const markets = [];
        const currenciesLength = currencies.length;
        for (let base = 0; base < currenciesLength - 1; base++) {
            const newIndex = base + 1;
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
        const balances = await this.privateGetAccountBalances ();
        const result = {};
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
        await this.loadMarkets ();
        const symbolObject = { 'symbol': this.marketId (symbol) };
        const response = await this.publicGetPublicMarketOrderbookSymbol (this.extend (symbolObject, params));
        return this.parseOrderBook (response, undefined, 'bids', 'asks', 'price', 'baseVolume');
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'operationType': 'MARKET_FX',
            'sortOrder': 'DESC',
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['currencies'] = market['id'];
        }
        if (since !== undefined) {
            // TODO: Not sure if it's correct (idk if it's timestamp or DateTime string
            request['continueFrom'] = since;
        }
        if (limit !== undefined) {
            request['volume'] = limit;
        }
        const response = await this.privateGetAccountHistory (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const body = {
            'submitId': this.uuid (),
            'pair': market['id'],
            'price': price,
            'buySell': side.toUpperCase (),
            'volumeCurrency': market['baseId'],
            'otherCurrency': market['quoteId'],
            'volume': amount,
        };
        return await this.privatePostMarketOrders (this.extend (body, params));
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        const request = {
            'orderId': id,
        };
        return await this.privatePostMarketOrdersCloseOrderId (this.extend (request, params));
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        // TODO: Would be nice to get parametrized API response
        await this.loadMarkets ();
        const market = undefined;
        const orders = await this.privateGetMarketOrders ();
        return this.parseOrders (orders, market, since, limit);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        // TODO: Would be nice to have fetchOrders parametrized to get closed offers
        return await this.fetchOrders (symbol, since, limit, params);
    }

    formatOrderBook (orderBookEntry) {
        return [this.safeFloat (orderBookEntry, 'price'), this.safeFloat (orderBookEntry, 'baseVolume')];
    }

    parseOrder (order, market = undefined) {
        market = this.safeString (order, 'market');
        const id = this.safeString (order, 'orderId');
        const symbol = this.findSymbol (market);
        const datetime = this.safeString (order, 'submitTs');
        const timestamp = this.parse8601 (datetime);
        const lastTradeTimestamp = timestamp;
        const side = this.safeString (order, 'buySell').toLowerCase ();
        const price = this.safeFloat (order, 'price');
        const amount = this.safeFloat (order, 'volume');
        const cost = amount * price;
        const remaining = undefined;
        const filled = undefined;
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const fee = undefined;
        const result = {
            'info': order,
            'id': id,
            'timestamp': timestamp,
            'datetime': datetime,
            'lastTradeTimestamp': lastTradeTimestamp,
            'symbol': symbol,
            'type': 'limit',
            'side': side,
            'price': price,
            'cost': cost,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': fee,
        };
        return result;
    }

    parseOrderStatus (status) {
        const statuses = {
            'MARKET_REQUESTED': 'open',
            'MARKET_PUBLISHED': 'open',
            'CLOSED': 'closed',
            'CANCELLED': 'canceled',
        };
        return this.safeValue (statuses, status, status);
    }

    parseTrade (trade, market = undefined) {
        return {
            'id': this.safeInteger (trade, 'id'),
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const url = this.urls['api'] + '/' + this.version + '/' + this.url (path, params);
        const uri = '/api/' + this.version + '/' + this.url (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (api === 'private') {
            this.checkRequiredCredentials ();
            const timestamp = this.milliseconds ().toString ();
            let prehash = uri + timestamp;
            if (method === 'POST') {
                body = this.json (query);
                prehash += body;
            }
            const signature = this.hmac (this.encode (prehash), this.encode (this.secret), 'sha256', 'hex');
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
            const errorMessage = this.safeString (response, 'message');
            const errors = this.safeValue (response, 'errors', {});
            if (errorMessage) {
                const exceptions = this.exceptions;
                const feedback = this.json (errors);
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
