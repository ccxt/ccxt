'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');

//  ---------------------------------------------------------------------------

module.exports = class negociecoins extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'negociecoins',
            'name': 'NegocieCoins',
            'countries': 'BR',
            'rateLimit': 1000,
            'version': 'v3',
            'has': {
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/38008571-25a6246e-3258-11e8-969b-aeb691049245.jpg',
                'api': {
                    'public': 'https://broker.negociecoins.com.br/api/v3',
                    'private': 'https://broker.negociecoins.com.br/tradeapi/v1',
                },
                'www': 'https://www.negociecoins.com.br',
                'doc': [
                    'https://www.negociecoins.com.br/documentacao-tradeapi',
                    'https://www.negociecoins.com.br/documentacao-api',
                ],
                'fees': 'https://www.negociecoins.com.br/comissoes',
            },
            'api': {
                'public': {
                    'get': [
                        '{PAR}/ticker',
                        '{PAR}/orderbook',
                        '{PAR}/trades',
                        '{PAR}/trades/{timestamp_inicial}',
                        '{PAR}/trades/{timestamp_inicial}/{timestamp_final}',
                    ],
                },
                'private': {
                    'get': [
                        'user/balance',
                        'user/order/{orderId}',
                    ],
                    'post': [
                        'user/order',
                        'user/orders',
                    ],
                    'delete': [
                        'user/order/{orderId}',
                    ],
                },
            },
            'markets': {
                'B2X/BRL': { 'id': 'b2xbrl', 'symbol': 'B2X/BRL', 'base': 'B2X', 'quote': 'BRL' },
                'BCH/BRL': { 'id': 'bchbrl', 'symbol': 'BCH/BRL', 'base': 'BCH', 'quote': 'BRL' },
                'BTC/BRL': { 'id': 'btcbrl', 'symbol': 'BTC/BRL', 'base': 'BTC', 'quote': 'BRL' },
                'BTG/BRL': { 'id': 'btgbrl', 'symbol': 'BTG/BRL', 'base': 'BTG', 'quote': 'BRL' },
                'DASH/BRL': { 'id': 'dashbrl', 'symbol': 'DASH/BRL', 'base': 'DASH', 'quote': 'BRL' },
                'LTC/BRL': { 'id': 'ltcbrl', 'symbol': 'LTC/BRL', 'base': 'LTC', 'quote': 'BRL' },
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
        let symbol = (typeof market !== 'undefined') ? market['symbol'] : undefined;
        let last = this.safeFloat (ticker, 'last');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': this.safeFloat (ticker, 'buy'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'sell'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'vol'),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let ticker = await this.publicGetPARTicker (this.extend ({
            'PAR': market['id'],
        }, params));
        return this.parseTicker (ticker, market);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let orderbook = await this.publicGetPAROrderbook (this.extend ({
            'PAR': this.marketId (symbol),
        }, params));
        return this.parseOrderBook (orderbook, undefined, 'bid', 'ask', 'price', 'quantity');
    }

    parseTrade (trade, market = undefined) {
        let timestamp = trade['date'] * 1000;
        let price = this.safeFloat (trade, 'price');
        let amount = this.safeFloat (trade, 'amount');
        let symbol = market['symbol'];
        let cost = parseFloat (this.costToPrecision (symbol, price * amount));
        return {
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': this.safeString (trade, 'tid'),
            'order': undefined,
            'type': 'limit',
            'side': trade['type'].toLowerCase (),
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
        if (typeof since === 'undefined')
            since = 0;
        let request = {
            'PAR': market['id'],
            'timestamp_inicial': parseInt (since / 1000),
        };
        let trades = await this.publicGetPARTradesTimestampInicial (this.extend (request, params));
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
        let price = this.safeFloat (order, 'price');
        let amount = this.safeFloat (order, 'quantity');
        let cost = this.safeFloat (order, 'total');
        let remaining = this.safeFloat (order, 'pending_quantity');
        let filled = this.safeFloat (order, 'executed_quantity');
        let status = order['status'];
        // cancelled, filled, partially filled, pending, rejected
        if (status === 'filled') {
            status = 'closed';
        } else if (status === 'cancelled') {
            status = 'canceled';
        } else {
            status = 'open';
        }
        let trades = undefined;
        // if (order['operations'])
        //     trades = this.parseTrades (order['operations']);
        return {
            'id': order['id'].toString (),
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'lastTradeTimestamp': undefined,
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
                'cost': this.safeFloat (order, 'fee'),
            },
            'info': order,
        };
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
        let response = await this.privateDeleteUserOrderOrderId (this.extend ({
            'orderId': id,
        }, params));
        return this.parseOrder (response[0], market);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let order = await this.privateGetUserOrderOrderId (this.extend ({
            'orderId': id,
        }, params));
        return this.parseOrder (order[0]);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'pair': market['id'],
            // type: buy, sell
            // status: cancelled, filled, partially filled, pending, rejected
            // startId
            // endId
            // startDate yyyy-MM-dd
            // endDate: yyyy-MM-dd
        };
        if (typeof since !== 'undefined')
            request['startDate'] = this.ymd (since);
        if (typeof limit !== 'undefined')
            request['pageSize'] = limit;
        let orders = await this.privatePostUserOrders (this.extend (request, params));
        return this.parseOrders (orders, market);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchOrders (symbol, since, limit, this.extend ({
            'status': 'pending',
        }, params));
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchOrders (symbol, since, limit, this.extend ({
            'status': 'filled',
        }, params));
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        let queryString = this.urlencode (query);
        if (api === 'public') {
            if (queryString.length)
                url += '?' + queryString;
        } else {
            this.checkRequiredCredentials ();
            let timestamp = this.seconds ().toString ();
            let nonce = this.nonce ().toString ();
            let content = '';
            if (queryString.length) {
                body = this.json (query);
                content = this.hash (this.encode (body), 'md5', 'base64');
            } else {
                body = '';
            }
            let uri = this.encodeURIComponent (url).toLowerCase ();
            let payload = [ this.apiKey, method, uri, timestamp, nonce, content ].join ('');
            let secret = this.base64ToBinary (this.secret);
            let signature = this.hmac (this.encode (payload), this.encode (secret), 'sha256', 'base64');
            signature = this.binaryToString (signature);
            let auth = [ this.apiKey, signature, nonce, timestamp ].join (':');
            headers = {
                'Authorization': 'amx ' + auth,
            };
            if (method === 'POST') {
                headers['Content-Type'] = 'application/json; charset=UTF-8';
                headers['Content-Length'] = body.length;
            } else if (queryString.length) {
                url += '?' + queryString;
                body = undefined;
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
};
