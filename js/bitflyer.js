'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, OrderNotFound } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class bitflyer extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitflyer',
            'name': 'bitFlyer',
            'countries': 'JP',
            'version': 'v1',
            'rateLimit': 1000, // their nonce-timestamp is in seconds...
            'has': {
                'CORS': false,
                'withdraw': true,
                'fetchMyTrades': true,
                'fetchOrders': true,
                'fetchOrder': true,
                'fetchOpenOrders': 'emulated',
                'fetchClosedOrders': 'emulated',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/28051642-56154182-660e-11e7-9b0d-6042d1e6edd8.jpg',
                'api': 'https://api.bitflyer.jp',
                'www': 'https://bitflyer.jp',
                'doc': 'https://bitflyer.jp/API',
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
                        'getcollateral',
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

    async fetchMarkets () {
        let jp_markets = await this.publicGetGetmarkets ();
        let us_markets = await this.publicGetGetmarketsUsa ();
        let eu_markets = await this.publicGetGetmarketsEu ();
        let markets = this.arrayConcat (jp_markets, us_markets);
        markets = this.arrayConcat (markets, eu_markets);
        let result = [];
        for (let p = 0; p < markets.length; p++) {
            let market = markets[p];
            let id = market['product_code'];
            let currencies = id.split ('_');
            let base = undefined;
            let quote = undefined;
            let symbol = id;
            let numCurrencies = currencies.length;
            if (numCurrencies === 1) {
                base = symbol.slice (0, 3);
                quote = symbol.slice (3, 6);
            } else if (numCurrencies === 2) {
                base = currencies[0];
                quote = currencies[1];
                symbol = base + '/' + quote;
            } else {
                base = currencies[1];
                quote = currencies[2];
            }
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': market,
            });
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privateGetGetbalance ();
        let balances = {};
        for (let b = 0; b < response.length; b++) {
            let account = response[b];
            let currency = account['currency_code'];
            balances[currency] = account;
        }
        let result = { 'info': response };
        let currencies = Object.keys (this.currencies);
        for (let i = 0; i < currencies.length; i++) {
            let currency = currencies[i];
            let account = this.account ();
            if (currency in balances) {
                account['total'] = balances[currency]['amount'];
                account['free'] = balances[currency]['available'];
                account['used'] = account['total'] - account['free'];
            }
            result[currency] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let orderbook = await this.publicGetGetboard (this.extend ({
            'product_code': this.marketId (symbol),
        }, params));
        return this.parseOrderBook (orderbook, undefined, 'bids', 'asks', 'price', 'size');
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let ticker = await this.publicGetGetticker (this.extend ({
            'product_code': this.marketId (symbol),
        }, params));
        let timestamp = this.parse8601 (ticker['timestamp']);
        let last = parseFloat (ticker['ltp']);
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': undefined,
            'low': undefined,
            'bid': parseFloat (ticker['best_bid']),
            'bidVolume': undefined,
            'ask': parseFloat (ticker['best_ask']),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': parseFloat (ticker['volume_by_product']),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    parseTrade (trade, market = undefined) {
        let side = undefined;
        let order = undefined;
        if ('side' in trade)
            if (trade['side']) {
                side = trade['side'].toLowerCase ();
                let id = side + '_child_order_acceptance_id';
                if (id in trade)
                    order = trade[id];
            }
        if (typeof order === 'undefined')
            order = this.safeString (trade, 'child_order_acceptance_id');
        let timestamp = this.parse8601 (trade['exec_date']);
        return {
            'id': trade['id'].toString (),
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'order': order,
            'type': undefined,
            'side': side,
            'price': trade['price'],
            'amount': trade['size'],
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetGetexecutions (this.extend ({
            'product_code': market['id'],
        }, params));
        return this.parseTrades (response, market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let order = {
            'product_code': this.marketId (symbol),
            'child_order_type': type.toUpperCase (),
            'side': side.toUpperCase (),
            'price': price,
            'size': amount,
        };
        let result = await this.privatePostSendchildorder (this.extend (order, params));
        // { "status": - 200, "error_message": "Insufficient funds", "data": null }
        return {
            'info': result,
            'id': result['child_order_acceptance_id'],
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        if (typeof symbol === 'undefined')
            throw new ExchangeError (this.id + ' cancelOrder() requires a symbol argument');
        await this.loadMarkets ();
        return await this.privatePostCancelchildorder (this.extend ({
            'product_code': this.marketId (symbol),
            'child_order_acceptance_id': id,
        }, params));
    }

    parseOrderStatus (status) {
        let statuses = {
            'ACTIVE': 'open',
            'COMPLETED': 'closed',
            'CANCELED': 'canceled',
            'EXPIRED': 'canceled',
            'REJECTED': 'canceled',
        };
        if (status in statuses)
            return statuses[status];
        return status.toLowerCase ();
    }

    parseOrder (order, market = undefined) {
        let timestamp = this.parse8601 (order['child_order_date']);
        let amount = this.safeFloat (order, 'size');
        let remaining = this.safeFloat (order, 'outstanding_size');
        let filled = this.safeFloat (order, 'executed_size');
        let price = this.safeFloat (order, 'price');
        let cost = price * filled;
        let status = this.parseOrderStatus (order['child_order_state']);
        let type = order['child_order_type'].toLowerCase ();
        let side = order['side'].toLowerCase ();
        let symbol = undefined;
        if (typeof market === 'undefined') {
            let marketId = this.safeString (order, 'product_code');
            if (typeof marketId !== 'undefined') {
                if (marketId in this.markets_by_id)
                    market = this.markets_by_id[marketId];
            }
        }
        if (typeof market !== 'undefined')
            symbol = market['symbol'];
        let fee = undefined;
        let feeCost = this.safeFloat (order, 'total_commission');
        if (typeof feeCost !== 'undefined') {
            fee = {
                'cost': feeCost,
                'currency': undefined,
                'rate': undefined,
            };
        }
        return {
            'id': order['child_order_acceptance_id'],
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
        if (typeof symbol === 'undefined')
            throw new ExchangeError (this.id + ' fetchOrders() requires a symbol argument');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'product_code': market['id'],
            'count': limit,
        };
        let response = await this.privateGetGetchildorders (this.extend (request, params));
        let orders = this.parseOrders (response, market, since, limit);
        if (symbol)
            orders = this.filterBy (orders, 'symbol', symbol);
        return orders;
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = 100, params = {}) {
        params['child_order_state'] = 'ACTIVE';
        return this.fetchOrders (symbol, since, limit, params);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = 100, params = {}) {
        params['child_order_state'] = 'COMPLETED';
        return this.fetchOrders (symbol, since, limit, params);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        if (typeof symbol === 'undefined')
            throw new ExchangeError (this.id + ' fetchOrder() requires a symbol argument');
        let orders = await this.fetchOrders (symbol);
        let ordersById = this.indexBy (orders, 'id');
        if (id in ordersById)
            return ordersById[id];
        throw new OrderNotFound (this.id + ' No order found with id ' + id);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (typeof symbol === 'undefined')
            throw new ExchangeError (this.id + ' fetchMyTrades requires a symbol argument');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'product_code': market['id'],
        };
        if (limit)
            request['count'] = limit;
        let response = await this.privateGetGetexecutions (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        await this.loadMarkets ();
        if (code !== 'JPY' && code !== 'USD' && code !== 'EUR')
            throw new ExchangeError (this.id + ' allows withdrawing JPY, USD, EUR only, ' + code + ' is not supported');
        let currency = this.currency (code);
        let response = await this.privatePostWithdraw (this.extend ({
            'currency_code': currency['id'],
            'amount': amount,
            // 'bank_account_id': 1234,
        }, params));
        return {
            'info': response,
            'id': response['message_id'],
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let request = '/' + this.version + '/';
        if (api === 'private')
            request += 'me/';
        request += path;
        if (method === 'GET') {
            if (Object.keys (params).length)
                request += '?' + this.urlencode (params);
        }
        let url = this.urls['api'] + request;
        if (api === 'private') {
            this.checkRequiredCredentials ();
            let nonce = this.nonce ().toString ();
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
