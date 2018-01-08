"use strict";

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, InsufficientFunds, OrderNotFound, InvalidOrder, AuthenticationError } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class negociecoins extends Exchange {

    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'negociecoins',
            'name': 'NegocieCoins',
            'countries': 'BR',
            'rateLimit': 1000,
            // obsolete metainfo interface
            'hasFetchOpenOrders': true,
            'hasFetchClosedOrders': true,
            // new metainfo interface
            'has': {
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
            },
            'urls': {
                'logo': 'https://broker.negociecoins.com.br/static/img/logo',
                'api': {
                    'public': 'https://broker.negociecoins.com.br/api/v3',
                    'private': 'https://broker.negociecoins.com.br/tradeapi/v1',
                },
                'www': 'https://www.negociecoins.com.br/',
                'doc': [
                    'https://www.negociecoins.com.br/documentacao-api',
                    'https://www.negociecoins.com.br/documentacao-tradeapi',
                ],
                'fees': 'https://www.negociecoins.com.br/comissoes',
            },
            'api': {
                'public': {
                    'get': [
                        '{market}/ticker',
                        '{market}/orderbook',
                        '{market}/trades',
                        '{market}/trades/{startTime}',
                        '{market}/trades/{startTime}/{endTime}',
                    ],
                },
                'private': {
                    'get': [
                        'user/balance',
                        'user/order/{id}',
                    ],
                    'post': [
                        'user/order',
                        'user/orders',
                    ],
                    'delete': [
                        'user/order/{id}',
                    ],
                },
            },
            'markets': {
                'BTC/BRL': { 'id': 'BRLBTC', 'symbol': 'BTC/BRL', 'base': 'BTC', 'quote': 'BRL' },
                'LTC/BRL': { 'id': 'BRLLTC', 'symbol': 'LTC/BRL', 'base': 'LTC', 'quote': 'BRL' },
                'BCH/BRL': { 'id': 'BRLBCH', 'symbol': 'BCH/BRL', 'base': 'BCH', 'quote': 'BRL' },
                'BTG/BRL': { 'id': 'BRLBTG', 'symbol': 'BTG/BRL', 'base': 'BTG', 'quote': 'BRL' },
            },
            'fees': {
                'trading': {
                    'maker': 0.003,
                    'taker': 0.004,
                },
                'funding': {
                    'withdraw': {
                        'BTC': 0.001,
                        'BCH': 0.00003,
                        'BTG': 0.00009,
                        'LTC': 0.005,
                    },
                },
            },
            'limits': {
                'amount': {
                    'min': 0.001,
                    'max': undefined,
                },
            },
            'precision': {
                'amount': 8,
                'price': 8,
            },
        });
    }

    parseTicker (ticker, market = undefined) {
        let timestamp = ticker['date'] * 1000;
        let symbol = market['symbol'];
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': parseFloat (ticker['high']),
            'low': parseFloat (ticker['low']),
            'bid': parseFloat (ticker['buy']),
            'ask': parseFloat (ticker['sell']),
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'first': undefined,
            'last': parseFloat (ticker['last']),
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': parseFloat (ticker['vol']),
            'info': ticker,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let ticker = await this.publicGetMarketTicker (this.extend ({
            'market': market['id'],
        }, params));
        return this.parseTicker (ticker, market);
    }

    async fetchOrderBook (symbol, params = {}) {
        await this.loadMarkets ();
        let orderbook = await this.publicGetMarketOrderbook (this.extend ({
            'market': this.marketId (symbol),
        }, params));
        return this.parseOrderBook (orderbook, undefined, 'bid', 'ask', 'price', 'quantity');
    }

    parseTrade (trade, market = undefined) {
        let timestamp = trade['date'] * 1000;
        let price = parseFloat (trade['price']);
        let amount = parseFloat (trade['amount']);
        let symbol = market['symbol'];
        let cost = parseFloat (this.costToPrecision (symbol, price * amount));
        return {
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': this.safeString (trade, 'tid'),
            'order': undefined,
            'type': 'limit',
            'side': trade['type'],
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': undefined,
            'info': trade,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let trades = await this.publicGetMarketTrades (this.extend ({
            'market': market['id'],
        }, params));
        return this.parseTrades (trades, market, since, limit);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let balances = await this.privateGetUserBalance (params);
        let result = { 'info': balances };
        let currencies = Object.keys (balances);
        for (let i = 0; i < currencies.length; i++) {
            let id = currencies[i];
            let balance = balances[id];
            let currency = this.commonCurrencyCode (id);
            let account = {
                'free': parseFloat (balance['total']),
                'used': 0.0,
                'total': parseFloat (balance['available']),
            };
            account['used'] = account['total'] - account['free'];
            result[currency] = account;
        }
        return this.parseBalance (result);
    }

    parseOrder (order, market = undefined) {
        let symbol = undefined;
        if (!market) {
            market = this.safeValue (this.marketsById, order['pair']);
            if (market)
                symbol = market['symbol'];
        }
        let timestamp = this.parse8601 (order['created']);
        let price = parseFloat (order['price']);
        let amount = parseFloat (order['quantity']);
        let cost = this.safeFloat (order, 'total');
        let remaining = this.safeFloat (order, 'pending_quantity');
        let filled = this.safeFloat (order, 'executed_quantity');
        let status = order['status'];
        // cancelled, filled, partially filled, pending, rejected
        if (status == 'filled') {
            status = 'closed';
        } else if (status == 'cancelled') {
            status = 'canceled';
        } else {
            status = 'open';
        }
        let trades = undefined;
        // if (order['operations'])
            // trades = this.parseTrades (order['operations']);
        return {
            'id': order['id'].toString (),
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'status': status,
            'symbol': symbol,
            'type': 'limit',
            'side': order['type'],
            'price': price,
            'cost': cost,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'trades': trades,
            'fee': {
                'currency': market['quote'],
                'cost': parseFloat (order['fee']),
            },
            'info': order,
        };
    }

    parseOrders (orders, market, result = []) {
        for (let i = 0; i < orders.length; i++) {
            let order = orders[i];
            result.push (this.parseOrder (order, market));
        }
        return result;
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.privatePostUserOrder (this.extend ({
            'pair': market['id'],
            'price': this.priceToPrecision (symbol, price),
            'volume': this.amountToPrecision (symbol, amount),
            'type': side,
        }, params));
        let order = this.parseOrder (response[0], market);
        let id = order['id'];
        this.orders[id] = order;
        return order;
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.markets[symbol];
        let response = await this.privateDeleteUserOrderId (this.extend ({
            'id': id,
        }, params));
        return this.parseOrder (response[0], market);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let order = await this.privateGetUserOrderId (this.extend ({
            'id': id,
        }, params));
        return this.parseOrder (order[0]);
    }

    // async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
    //     await this.loadMarkets ();
    //     let market = this.market (symbol);
    //     let request = {
    //         'pair': market['id'],
    //         // type: buy, sell
    //         // status: cancelled, filled, partially filled, pending, rejected
    //         // startId
    //         // endId
    //         // startDate yyyy-MM-dd
    //         // endDate: yyyy-MM-dd
    //     };
    //     if (since)
    //         request['startDate'] = since;
    //     let orders = await this.privatePostUserOrders (this.extend (request, params));
    //     return this.parseOrders (orders, market);
    // }

    // async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
    //     params = this.extend(params, {
    //         'status': 'partially filled',
    //     });
    //     return await this.fetchOrders (symbol, since, limit, params);
    // }

    // async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
    //     params = this.extend(params, {
    //         'status': 'filled',
    //     });
    //     return await this.fetchOrders (symbol, since, limit, params);
    // }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (api == 'public') {
            query = this.urlencode (query);
            if (query.length)
                url += '?' + query;
        } else {
            this.checkRequiredCredentials ();
            let queryString = this.urlencode (query);
            let timestamp = this.milliseconds ();
            let nonce = this.nonce ();
            let content = '';
            if (queryString.length)
                content = this.hash (this.encode (queryString), 'md5', 'base64');
            let encUrl = this.encodeURIComponent (url);
            let payload = [ this.apiKey, method, encUrl.toLowerCase (), timestamp, nonce, content ].join ('');
            let secret = this.base64ToBinary (this.secret);
            let signature = this.hmac (this.encode (payload), this.encode (secret), 'sha256', 'base64');
            let auth = [this.apiKey, signature, nonce, timestamp].join (':');
            headers = {
                'Authorization': 'amx ' + auth,
            };
            if (method == 'POST') {
                body = this.unjson (query);
                headers['content-type'] = 'application/json; charset=UTF-8';
                headers['content-length'] = body.length;
            } else if ( queryString.length ) {
                url += '?' + queryString;
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}
