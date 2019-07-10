'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ArgumentsRequired } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class negociecoins extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'negociecoins',
            'name': 'NegocieCoins',
            'countries': [ 'BR' ],
            'rateLimit': 1000,
            'version': 'v3',
            'has': {
                'createMarketOrder': false,
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
        const timestamp = ticker['date'] * 1000;
        const symbol = (market !== undefined) ? market['symbol'] : undefined;
        const last = this.safeFloat (ticker, 'last');
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
        const market = this.market (symbol);
        const request = {
            'PAR': market['id'],
        };
        const ticker = await this.publicGetPARTicker (this.extend (request, params));
        return this.parseTicker (ticker, market);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'PAR': this.marketId (symbol),
        };
        const response = await this.publicGetPAROrderbook (this.extend (request, params));
        return this.parseOrderBook (response, undefined, 'bid', 'ask', 'price', 'quantity');
    }

    parseTrade (trade, market = undefined) {
        const timestamp = trade['date'] * 1000;
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'amount');
        let cost = undefined;
        if (price !== undefined) {
            if (amount !== undefined) {
                cost = price * amount;
            }
        }
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const id = this.safeString (trade, 'tid');
        const type = 'limit';
        let side = this.safeString (trade, 'type');
        if (side !== undefined) {
            side = side.toLowerCase ();
        }
        return {
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': id,
            'order': undefined,
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': undefined,
            'info': trade,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (since === undefined) {
            since = 0;
        }
        const request = {
            'PAR': market['id'],
            'timestamp_inicial': parseInt (since / 1000),
        };
        const response = await this.publicGetPARTradesTimestampInicial (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetUserBalance (params);
        //
        //     {
        //         "coins": [
        //             {"name":"BRL","available":0.0,"openOrders":0.0,"withdraw":0.0,"total":0.0},
        //             {"name":"BTC","available":0.0,"openOrders":0.0,"withdraw":0.0,"total":0.0},
        //         ],
        //     }
        //
        const result = { 'info': response };
        const balances = this.safeValue (response, 'coins');
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const currencyId = this.safeString (balance, 'name');
            const code = this.safeCurrencyCode (currencyId);
            const openOrders = this.safeFloat (balance, 'openOrders');
            const withdraw = this.safeFloat (balance, 'withdraw');
            const account = {
                'free': this.safeFloat (balance, 'total'),
                'used': this.sum (openOrders, withdraw),
                'total': this.safeFloat (balance, 'available'),
            };
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    parseOrderStatus (status) {
        const statuses = {
            'filled': 'closed',
            'cancelled': 'canceled',
            'partially filled': 'open',
            'pending': 'open',
            'rejected': 'rejected',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        let symbol = undefined;
        if (market === undefined) {
            const marketId = this.safeString (order, 'pair');
            market = this.safeValue (this.marketsById, marketId);
            if (market) {
                symbol = market['symbol'];
            }
        }
        const timestamp = this.parse8601 (this.safeString (order, 'created'));
        const price = this.safeFloat (order, 'price');
        const amount = this.safeFloat (order, 'quantity');
        const cost = this.safeFloat (order, 'total');
        const remaining = this.safeFloat (order, 'pending_quantity');
        const filled = this.safeFloat (order, 'executed_quantity');
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const trades = undefined;
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
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
            'price': this.priceToPrecision (symbol, price),
            'volume': this.amountToPrecision (symbol, amount),
            'type': side,
        };
        const response = await this.privatePostUserOrder (this.extend (request, params));
        const order = this.parseOrder (response[0], market);
        const id = order['id'];
        this.orders[id] = order;
        return order;
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.markets[symbol];
        const request = {
            'orderId': id,
        };
        const response = await this.privateDeleteUserOrderOrderId (this.extend (request, params));
        return this.parseOrder (response[0], market);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'orderId': id,
        };
        const order = await this.privateGetUserOrderOrderId (this.extend (request, params));
        return this.parseOrder (order[0]);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrders () requires a symbol argument');
        }
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
            // type: buy, sell
            // status: cancelled, filled, partially filled, pending, rejected
            // startId
            // endId
            // startDate yyyy-MM-dd
            // endDate: yyyy-MM-dd
        };
        if (since !== undefined) {
            request['startDate'] = this.ymd (since);
        }
        if (limit !== undefined) {
            request['pageSize'] = limit;
        }
        const orders = await this.privatePostUserOrders (this.extend (request, params));
        return this.parseOrders (orders, market);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'status': 'pending',
        };
        return await this.fetchOrders (symbol, since, limit, this.extend (request, params));
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'status': 'filled',
        };
        return await this.fetchOrders (symbol, since, limit, this.extend (request, params));
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        const queryString = this.urlencode (query);
        if (api === 'public') {
            if (queryString.length) {
                url += '?' + queryString;
            }
        } else {
            this.checkRequiredCredentials ();
            const timestamp = this.seconds ().toString ();
            const nonce = this.nonce ().toString ();
            let content = '';
            if (queryString.length) {
                body = this.json (query);
                content = this.hash (this.encode (body), 'md5', 'base64');
            } else {
                body = '';
            }
            const uri = this.encodeURIComponent (url).toLowerCase ();
            const payload = [ this.apiKey, method, uri, timestamp, nonce, content ].join ('');
            const secret = this.base64ToBinary (this.secret);
            let signature = this.hmac (this.encode (payload), secret, 'sha256', 'base64');
            signature = this.decode (signature);
            const auth = [ this.apiKey, signature, nonce, timestamp ].join (':');
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
