'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired, OrderNotFound } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class bitflyer extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitflyer',
            'name': 'bitFlyer',
            'countries': [ 'JP' ],
            'version': 'v1',
            'rateLimit': 1000, // their nonce-timestamp is in seconds...
            'has': {
                'CORS': false,
                'withdraw': true,
                'fetchMyTrades': true,
                'fetchOrders': true,
                'fetchOrder': 'emulated',
                'fetchOpenOrders': 'emulated',
                'fetchClosedOrders': 'emulated',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/28051642-56154182-660e-11e7-9b0d-6042d1e6edd8.jpg',
                'api': 'https://api.bitflyer.jp',
                'www': 'https://bitflyer.jp',
                'doc': 'https://lightning.bitflyer.com/docs?lang=en',
            },
            'api': {
                'public': {
                    'get': [
                        'getmarkets/usa', // new (wip)
                        'getmarkets/eu',  // new (wip)
                        'getmarkets',     // or 'markets'
                        'getboard',       // ...
                        'getticker',
                        'getexecutions',
                        'gethealth',
                        'getboardstate',
                        'getchats',
                    ],
                },
                'private': {
                    'get': [
                        'getpermissions',
                        'getbalance',
                        'getbalancehistory',
                        'getcollateral',
                        'getcollateralhistory',
                        'getcollateralaccounts',
                        'getaddresses',
                        'getcoinins',
                        'getcoinouts',
                        'getbankaccounts',
                        'getdeposits',
                        'getwithdrawals',
                        'getchildorders',
                        'getparentorders',
                        'getparentorder',
                        'getexecutions',
                        'getpositions',
                        'gettradingcommission',
                    ],
                    'post': [
                        'sendcoin',
                        'withdraw',
                        'sendchildorder',
                        'cancelchildorder',
                        'sendparentorder',
                        'cancelparentorder',
                        'cancelallchildorders',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'maker': 0.25 / 100,
                    'taker': 0.25 / 100,
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        const jp_markets = await this.publicGetGetmarkets (params);
        const us_markets = await this.publicGetGetmarketsUsa (params);
        const eu_markets = await this.publicGetGetmarketsEu (params);
        let markets = this.arrayConcat (jp_markets, us_markets);
        markets = this.arrayConcat (markets, eu_markets);
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString (market, 'product_code');
            let spot = true;
            let future = false;
            let type = 'spot';
            if ('alias' in market) {
                type = 'future';
                future = true;
                spot = false;
            }
            const currencies = id.split ('_');
            let baseId = undefined;
            let quoteId = undefined;
            let base = undefined;
            let quote = undefined;
            const numCurrencies = currencies.length;
            if (numCurrencies === 1) {
                baseId = id.slice (0, 3);
                quoteId = id.slice (3, 6);
            } else if (numCurrencies === 2) {
                baseId = currencies[0];
                quoteId = currencies[1];
            } else {
                baseId = currencies[1];
                quoteId = currencies[2];
            }
            base = this.safeCurrencyCode (baseId);
            quote = this.safeCurrencyCode (quoteId);
            const symbol = (numCurrencies === 2) ? (base + '/' + quote) : id;
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'type': type,
                'spot': spot,
                'future': future,
                'info': market,
            });
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetGetbalance (params);
        //
        //     [
        //         {
        //             "currency_code": "JPY",
        //             "amount": 1024078,
        //             "available": 508000
        //         },
        //         {
        //             "currency_code": "BTC",
        //             "amount": 10.24,
        //             "available": 4.12
        //         },
        //         {
        //             "currency_code": "ETH",
        //             "amount": 20.48,
        //             "available": 16.38
        //         }
        //     ]
        //
        const result = { 'info': response };
        for (let i = 0; i < response.length; i++) {
            const balance = response[i];
            const currencyId = this.safeString (balance, 'currency_code');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['total'] = this.safeFloat (balance, 'amount');
            account['free'] = this.safeFloat (balance, 'available');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'product_code': this.marketId (symbol),
        };
        const orderbook = await this.publicGetGetboard (this.extend (request, params));
        return this.parseOrderBook (orderbook, undefined, 'bids', 'asks', 'price', 'size');
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const request = {
            'product_code': this.marketId (symbol),
        };
        const ticker = await this.publicGetGetticker (this.extend (request, params));
        const timestamp = this.parse8601 (this.safeString (ticker, 'timestamp'));
        const last = this.safeFloat (ticker, 'ltp');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': undefined,
            'low': undefined,
            'bid': this.safeFloat (ticker, 'best_bid'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'best_ask'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'volume_by_product'),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    parseTrade (trade, market = undefined) {
        let side = this.safeString (trade, 'side');
        if (side !== undefined) {
            if (side.length < 1) {
                side = undefined;
            } else {
                side = side.toLowerCase ();
            }
        }
        let order = undefined;
        if (side !== undefined) {
            side = side.toLowerCase ();
            const id = side + '_child_order_acceptance_id';
            if (id in trade) {
                order = trade[id];
            }
        }
        if (order === undefined) {
            order = this.safeString (trade, 'child_order_acceptance_id');
        }
        const timestamp = this.parse8601 (this.safeString (trade, 'exec_date'));
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'size');
        let cost = undefined;
        if (amount !== undefined) {
            if (price !== undefined) {
                cost = price * amount;
            }
        }
        const id = this.safeString (trade, 'id');
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        return {
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': order,
            'type': undefined,
            'side': side,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': undefined,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'product_code': market['id'],
        };
        const response = await this.publicGetGetexecutions (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'product_code': this.marketId (symbol),
            'child_order_type': type.toUpperCase (),
            'side': side.toUpperCase (),
            'price': price,
            'size': amount,
        };
        const result = await this.privatePostSendchildorder (this.extend (request, params));
        // { "status": - 200, "error_message": "Insufficient funds", "data": null }
        const id = this.safeString (result, 'child_order_acceptance_id');
        return {
            'info': result,
            'id': id,
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a `symbol` argument');
        }
        await this.loadMarkets ();
        const request = {
            'product_code': this.marketId (symbol),
            'child_order_acceptance_id': id,
        };
        return await this.privatePostCancelchildorder (this.extend (request, params));
    }

    parseOrderStatus (status) {
        const statuses = {
            'ACTIVE': 'open',
            'COMPLETED': 'closed',
            'CANCELED': 'canceled',
            'EXPIRED': 'canceled',
            'REJECTED': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        const timestamp = this.parse8601 (this.safeString (order, 'child_order_date'));
        const amount = this.safeFloat (order, 'size');
        const remaining = this.safeFloat (order, 'outstanding_size');
        const filled = this.safeFloat (order, 'executed_size');
        const price = this.safeFloat (order, 'price');
        const cost = price * filled;
        const status = this.parseOrderStatus (this.safeString (order, 'child_order_state'));
        let type = this.safeString (order, 'child_order_type');
        if (type !== undefined) {
            type = type.toLowerCase ();
        }
        let side = this.safeString (order, 'side');
        if (side !== undefined) {
            side = side.toLowerCase ();
        }
        let symbol = undefined;
        if (market === undefined) {
            const marketId = this.safeString (order, 'product_code');
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
            }
        }
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        let fee = undefined;
        const feeCost = this.safeFloat (order, 'total_commission');
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'currency': undefined,
                'rate': undefined,
            };
        }
        const id = this.safeString (order, 'child_order_acceptance_id');
        return {
            'id': id,
            'info': order,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'cost': cost,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'fee': fee,
        };
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = 100, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrders() requires a `symbol` argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'product_code': market['id'],
            'count': limit,
        };
        const response = await this.privateGetGetchildorders (this.extend (request, params));
        let orders = this.parseOrders (response, market, since, limit);
        if (symbol !== undefined) {
            orders = this.filterBy (orders, 'symbol', symbol);
        }
        return orders;
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = 100, params = {}) {
        const request = {
            'child_order_state': 'ACTIVE',
        };
        return await this.fetchOrders (symbol, since, limit, this.extend (request, params));
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = 100, params = {}) {
        const request = {
            'child_order_state': 'COMPLETED',
        };
        return await this.fetchOrders (symbol, since, limit, this.extend (request, params));
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder() requires a `symbol` argument');
        }
        const orders = await this.fetchOrders (symbol);
        const ordersById = this.indexBy (orders, 'id');
        if (id in ordersById) {
            return ordersById[id];
        }
        throw new OrderNotFound (this.id + ' No order found with id ' + id);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades requires a `symbol` argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'product_code': market['id'],
        };
        if (limit !== undefined) {
            request['count'] = limit;
        }
        const response = await this.privateGetGetexecutions (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        await this.loadMarkets ();
        if (code !== 'JPY' && code !== 'USD' && code !== 'EUR') {
            throw new ExchangeError (this.id + ' allows withdrawing JPY, USD, EUR only, ' + code + ' is not supported');
        }
        const currency = this.currency (code);
        const request = {
            'currency_code': currency['id'],
            'amount': amount,
            // 'bank_account_id': 1234,
        };
        const response = await this.privatePostWithdraw (this.extend (request, params));
        const id = this.safeString (response, 'message_id');
        return {
            'info': response,
            'id': id,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let request = '/' + this.version + '/';
        if (api === 'private') {
            request += 'me/';
        }
        request += path;
        if (method === 'GET') {
            if (Object.keys (params).length) {
                request += '?' + this.urlencode (params);
            }
        }
        const url = this.urls['api'] + request;
        if (api === 'private') {
            this.checkRequiredCredentials ();
            const nonce = this.nonce ().toString ();
            let auth = [ nonce, method, request ].join ('');
            if (Object.keys (params).length) {
                if (method !== 'GET') {
                    body = this.json (params);
                    auth += body;
                }
            }
            headers = {
                'ACCESS-KEY': this.apiKey,
                'ACCESS-TIMESTAMP': nonce,
                'ACCESS-SIGN': this.hmac (this.encode (auth), this.encode (this.secret)),
                'Content-Type': 'application/json',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
};
