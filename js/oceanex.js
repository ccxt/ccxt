'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError } = require ('./base/errors');

module.exports = class oceanex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'oceanex',
            'name': 'oceanex',
            'countries': [ 'SG' ],
            'urls': {
                'api': 'https://api.oceanex.pro/v1/',
                'www': 'https://www.oceanex.pro.com',
                'doc': 'https://api.oceanex.pro/doc/v1/',
            },
            'api': {
                'public': {
                    'get': [
                        'markets',
                        'tickers/{pair}/',
                        'tickers_multi',
                        'order_book',
                        'order_book/multi',
                        'fees/trading',
                        'trades',
                        'timestamp',
                    ],
                },
                'private': {
                    'get': [
                        'key',
                        'members/me',
                        'orders',
                        'orders_filter',
                    ],
                    'post': [
                        'orders',
                        'orders/multi',
                        'order/delete',
                        'order/delete/multi',
                        'orders/clear',
                    ],
                },
            },
            'version': 'v1',
            'rateLimit': 1000,
            'has': {
                'fetchMarkets': true,
                'fetchCurrencies': false,
                'fetchTicker': true,
                'fetchOrderBook': true,
                'fetchTrades': true,
                'fetchTradingLimits': false,
                'fetchTradingFees': true,
                'fetchFundingFees': false,
                'fetchTime': true,
                'fetchOrders': true,
                'fetchBalance': true,
                'createOrder': true,
                'cancelOrder': true,
                'cancelAllOrders': true,
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '4h': '4h',
                '12h': '12h',
                '1d': '1d',
                '1w': '1w',
            },
        });
    }

    async fetchMarkets (params = {}) {
        let response = await this.publicGetMarkets ();
        const result = [];
        const markets = this.safeValue (response, 'data');
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            let id = market['id'].toUpperCase ();
            let symbol = market['name'];
            let pair = market['name'].split ('/');
            let base = pair[0];
            let quote = pair[1];
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': base,
                'quoteId': quote,
                'active': true,
                'info': market,
                'precision': undefined,
                'limits': undefined,
            });
        }
        // parse markets
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        let response = await this.publicGetTickersPair (this.extend ({ 'pair': symbol }), params);
        const data = response['data'];
        return this.parseTicker (data, symbol);
    }

    parseTicker (data, market = undefined) {
        let timestamp = data['at'];
        const ticker = data['ticker'];
        if (typeof timestamp === 'string') {
            if (timestamp.length > 0) {
                timestamp = this.parse8601 (timestamp);
            }
        }
        return {
            'symbol': market,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': this.safeFloat (ticker, 'buy'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'sell'),
            'vwap': undefined,
            'open': undefined,
            'close': this.safeFloat (ticker, 'last'),
            'last': this.safeFloat (ticker, 'last'),
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'volume'),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        let response = await this.publicGetOrderBook (this.extend ({
            'market': symbol,
            'limit': limit,
        }, params));
        const orderbook = this.safeValue (response, 'data');
        return this.parseOrderBook (orderbook, orderbook['timestamp']);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        let response = await this.publicGetTrades (this.extend ({
            'market': symbol,
            'limit': limit,
        }, params));
        let data = this.safeValue (response, 'data');
        return this.parseTrades (data, symbol, since, limit);
    }

    parseTrade (trade, market = undefined) {
        let side = undefined;
        if (trade['side'] === 'bid') {
            side = 'buy';
        } else if (trade['side'] === 'ask') {
            side = 'sell';
        }
        return {
            'info': trade,
            'timestamp': trade['created_on'],
            'datetime': trade['created_at'],
            'symbol': trade['market'],
            'id': trade['id'],
            'order': undefined,
            'type': 'limit',
            'takerOrMaker': undefined,
            'side': side,
            'price': this.safeFloat (trade, 'price'),
            'amount': this.safeFloat (trade, 'volume'),
            'cost': undefined,
            'fee': undefined,
        };
    }

    async fetchTime (params = {}) {
        let response = await this.publicGetTimestamp ();
        return response['data'];
    }

    async fetchTradingFees (params = {}) {
        let response = await this.publicGetFeesTrading ();
        return response['data'];
    }

    async fetchKey (params = {}) {
        // private method input value {'user_jwt': encrypted_jwt_token}
        // jwt_token should be RS256 encoded
        let response = await this.privateGetKey (this.extend (params));
        return response['data'];
    }

    async fetchBalance (params = {}) {
        let response = await this.privateGetMembersMe (this.extend (params));
        const balances = this.safeValue (response['data'], 'accounts');
        let result = { 'info': balances };
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            let currency = balance['currency'];
            let account = this.account ();
            let free = this.safeFloat (balance, 'balance');
            let used = this.safeFloat (balance, 'locked');
            let total = free + used;
            account['free'] = free;
            account['used'] = used;
            account['total'] = total;
            result[currency] = account;
        }
        return this.parseBalance (result);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        let response = await this.privatePostOrders (this.extend (params));
        const data = response['data'];
        let result = {
            'info': data,
            'id': data['id'],
            'symbol': data['market'],
            'type': data['ord_type'],
            'side': data['side'],
            'status': data['state'],
        };
        return result;
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        let response = await this.privateGetOrders (this.extend (params));
        const data = response['data'];
        return this.parseOrders (data);
    }

    parseOrder (order, market = undefined) {
        let result = {
            'info': order,
            'id': order['id'],
            'timestamp': order['created_on'],
            'datetime': order['created_at'],
            'lastTradeTimestamp': undefined,
            'symbol': order['market'],
            'type': order['ord_type'],
            'side': order['side'],
            'price': this.safeFloat (order, 'price'),
            'average': this.safeFloat (order, 'avg_price'),
            'amount': this.safeFloat (order, 'volume'),
            'remaining': this.safeFloat (order, 'remaining_volume'),
            'filled': this.safeFloat (order, 'executed_volume'),
            'status': order['state'],
            'fee': undefined,
        };
        return result;
    }

    async createMultiOrders (params = {}) {
        let response = await this.privatePostOrdersMulti (this.extend (params));
        const data = response['data'];
        return this.parseOrders (data);
    }

    async filterOrders (params = {}) {
        let response = await this.privateGetOrdersFilter (this.extend (params));
        const data = response['data'];
        return this.parseOrders (data);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        let response = await this.privatePostOrderDelete (this.extend (params));
        const data = response['data'];
        return this.parseOrder (data);
    }

    async cancelMulitOrders (params = {}) {
        let response = await this.privatePostOrderDeleteMulti (this.extend (params));
        const data = response['data'];
        return this.parseOrders (data);
    }

    async cancelAllOrders (symbol = undefined, params = {}) {
        let response = await this.privatePostOrdersClear (this.extend (params));
        const data = response['data'];
        return this.parseOrders (data);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (Object.keys (query).length) {
            url += '?' + this.urlencode (query);
        }
        headers = { 'Content-Type': 'application/json' };
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response) {
        // API response structure
        // HTTP code : 200 (success to send request to API) / 201 (success to create order)
        // {"code": , (success return 0. other code indicate error)
        //  "message": "", (if error, contain error message report)
        //  "data": []}
        if (response === undefined) {
            return;
        }
        if (code === 200 || code === 201) {
            const resCode = this.safeValue (response, 'code');
            if (resCode === undefined) {
                throw new ExchangeError (response);
            }
            if (resCode !== 0) {
                throw new ExchangeError (response['message']);
            }
        }
    }
};