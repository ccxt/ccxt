'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, AuthenticationError, DDoSProtection } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class coinnest extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'coinnest',
            'name': 'coinnest',
            'countries': 'KR',
            'rateLimit': 1000,
            'has': {
                'fetchOpenOrders': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/38065728-7289ff5c-330d-11e8-9cc1-cf0cbcb606bc.jpg',
                'api': {
                    'public': 'https://api.coinnest.co.kr/api',
                    'private': 'https://api.coinnest.co.kr/api',
                    'web': 'https://www.coinnest.co.kr',
                },
                'www': 'https://www.coinnest.co.kr',
                'doc': 'https://www.coinnest.co.kr/doc/intro.html',
                'fees': [
                    'https://coinnesthelp.zendesk.com/hc/ko/articles/115002110252-%EA%B1%B0%EB%9E%98-%EC%88%98%EC%88%98%EB%A3%8C%EB%8A%94-%EC%96%BC%EB%A7%88%EC%9D%B8%EA%B0%80%EC%9A%94-',
                    'https://coinnesthelp.zendesk.com/hc/ko/articles/115002110272-%EB%B9%84%ED%8A%B8%EC%BD%94%EC%9D%B8-%EC%88%98%EC%88%98%EB%A3%8C%EB%A5%BC-%EC%84%A0%ED%83%9D%ED%95%98%EB%8A%94-%EC%9D%B4%EC%9C%A0%EA%B0%80-%EB%AC%B4%EC%97%87%EC%9D%B8%EA%B0%80%EC%9A%94-',
                ],
            },
            'api': {
                'web': {
                    'get': [
                        'coin/allcoin',
                    ],
                },
                'public': {
                    'get': [
                        'pub/ticker',
                        'pub/depth',
                        'pub/trades',
                    ],
                },
                'private': {
                    'post': [
                        'account/balance',
                        'trade/add',
                        'trade/cancel',
                        'trade/fetchtrust',
                        'trade/trust',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'maker': 0.1 / 100,
                    'taker': 0.1 / 100,
                },
                'funding': {
                    'withdraw': {
                        'BTC': '0.002',
                    },
                },
            },
            'precision': {
                'amount': 8,
                'price': 8,
            },
        });
    }

    async fetchMarkets () {
        let quote = 'KRW';
        let quoteId = quote.toLowerCase ();
        // todo: rewrite this for web endpoint
        let coins = [
            'btc',
            'bch',
            'btg',
            'bcd',
            'ubtc',
            'btn',
            'kst',
            'ltc',
            'act',
            'eth',
            'etc',
            'ada',
            'qtum',
            'xlm',
            'neo',
            'gas',
            'rpx',
            'hsr',
            'knc',
            'tsl',
            'tron',
            'omg',
            'wtc',
            'mco',
            'storm',
            'gto',
            'pxs',
            'chat',
            'ink',
            'oc',
            'hlc',
            'ent',
            'qbt',
            'spc',
            'put',
        ];
        let result = [];
        for (let i = 0; i < coins.length; i++) {
            let baseId = coins[i];
            let id = baseId + '/' + quoteId;
            let base = this.commonCurrencyCode (baseId.toUpperCase ());
            let symbol = base + '/' + quote;
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': true,
                'info': undefined,
            });
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        let timestamp = ticker['time'] * 1000;
        let symbol = market['symbol'];
        let last = parseFloat (ticker['last']);
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': parseFloat (ticker['high']),
            'low': parseFloat (ticker['low']),
            'bid': parseFloat (ticker['buy']),
            'bidVolume': undefined,
            'ask': parseFloat (ticker['sell']),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': parseFloat (ticker['vol']),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let ticker = await this.publicGetPubTicker (this.extend ({
            'coin': market['baseId'],
        }, params));
        return this.parseTicker (ticker, market);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let orderbook = await this.publicGetPubDepth (this.extend ({
            'coin': market['baseId'],
        }, params));
        return this.parseOrderBook (orderbook);
    }

    parseTrade (trade, market = undefined) {
        let timestamp = parseInt (trade['date']) * 1000;
        let price = parseFloat (trade['price']);
        let amount = parseFloat (trade['amount']);
        let symbol = market['symbol'];
        let cost = this.priceToPrecision (symbol, amount * price);
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
            'cost': parseFloat (cost),
            'fee': undefined,
            'info': trade,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let trades = await this.publicGetPubTrades (this.extend ({
            'coin': market['baseId'],
        }, params));
        return this.parseTrades (trades, market, since, limit);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostAccountBalance (params);
        let result = { 'info': response };
        let balancKeys = Object.keys (response);
        for (let i = 0; i < balancKeys.length; i++) {
            let key = balancKeys[i];
            let parts = key.split ('_');
            if (parts.length !== 2)
                continue;
            let type = parts[1];
            if (type !== 'reserved' && type !== 'balance')
                continue;
            let currency = parts[0].toUpperCase ();
            currency = this.commonCurrencyCode (currency);
            if (!(currency in result)) {
                result[currency] = {
                    'free': 0.0,
                    'used': 0.0,
                    'total': 0.0,
                };
            }
            type = (type === 'reserved' ? 'used' : 'free');
            result[currency][type] = parseFloat (response[key]);
            let otherType = (type === 'used' ? 'free' : 'used');
            if (otherType in result[currency])
                result[currency]['total'] = this.sum (result[currency]['free'], result[currency]['used']);
        }
        return this.parseBalance (result);
    }

    parseOrder (order, market) {
        let symbol = market['symbol'];
        let timestamp = parseInt (order['time']) * 1000;
        let status = parseInt (order['status']);
        // 1: newly created, 2: ready for dealing, 3: canceled, 4: completed.
        if (status === 4) {
            status = 'closed';
        } else if (status === 3) {
            status = 'canceled';
        } else {
            status = 'open';
        }
        let amount = parseFloat (order['amount_total']);
        let remaining = parseFloat (order['amount_over']);
        let filled = this.safeValue (order, 'deals');
        if (filled) {
            filled = this.safeFloat (filled, 'sum_amount');
        } else {
            filled = amount - remaining;
        }
        return {
            'id': this.safeString (order, 'id'),
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': symbol,
            'type': 'limit',
            'side': order['type'],
            'price': parseFloat (order['price']),
            'cost': undefined,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'trades': undefined,
            'fee': undefined,
            'info': this.safeValue (order, 'info', order),
        };
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.privatePostTradeAdd (this.extend ({
            'coin': market['baseId'],
            'type': side,
            'number': amount,
            'price': price,
        }, params));
        let order = {
            'id': response['id'],
            'time': this.seconds (),
            'type': side,
            'price': price,
            'amount_total': amount,
            'amount_over': amount,
            'info': response,
        };
        let id = order['id'];
        this.orders[id] = this.parseOrder (order, market);
        return order;
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.privatePostTradeCancel (this.extend ({
            'id': id,
            'coin': market['baseId'],
        }, params));
        return response;
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let order = await this.privatePostTradeFetchtrust (this.extend ({
            'id': id,
            'coin': market['baseId'],
        }, params));
        return this.parseOrder (order, market);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'coin': market['baseId'],
        };
        if (since)
            request['since'] = parseInt (since / 1000);
        if (limit)
            request['limit'] = limit;
        let response = await this.privatePostTradeTrust (this.extend (request, params));
        return this.parseOrders (response, market);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchOrders (symbol, since, limit, this.extend ({
            'type': '1',
        }, params));
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/' + path;
        let query = undefined;
        if (api === 'public') {
            query = this.urlencode (params);
            if (query.length)
                url += '?' + query;
        } else {
            this.checkRequiredCredentials ();
            body = this.urlencode (this.extend (params, {
                'key': this.apiKey,
                'nonce': this.nonce (),
            }));
            let secret = this.hash (this.secret);
            body += '&signature=' + this.hmac (this.encode (body), this.encode (secret));
            headers = { 'Content-type': 'application/x-www-form-urlencoded' };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        let status = this.safeString (response, 'status');
        if (!response || response === 'nil' || status) {
            let ErrorClass = this.safeValue ({
                '100': DDoSProtection,
                '101': DDoSProtection,
                '104': AuthenticationError,
                '105': AuthenticationError,
                '106': DDoSProtection,
            }, status, ExchangeError);
            let message = this.safeString (response, 'msg', this.json (response));
            throw new ErrorClass (message);
        }
        return response;
    }
};
