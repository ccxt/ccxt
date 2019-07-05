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
            'countries': [ 'KR' ],
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

    async fetchMarkets (params = {}) {
        const quote = 'KRW';
        const quoteId = quote.toLowerCase ();
        // todo: rewrite this for web endpoint
        const coins = [
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
        const result = [];
        for (let i = 0; i < coins.length; i++) {
            const baseId = coins[i];
            const id = baseId + '/' + quoteId;
            const base = this.safeCurrencyCode (baseId);
            const symbol = base + '/' + quote;
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
        const timestamp = this.safeInteger (ticker, 'time') * 1000;
        const symbol = market['symbol'];
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
            'coin': market['baseId'],
        };
        const response = await this.publicGetPubTicker (this.extend (request, params));
        return this.parseTicker (response, market);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'coin': market['baseId'],
        };
        const response = await this.publicGetPubDepth (this.extend (request, params));
        return this.parseOrderBook (response);
    }

    parseTrade (trade, market = undefined) {
        let timestamp = this.safeInteger (trade, 'date');
        if (timestamp !== undefined) {
            timestamp *= 1000;
        }
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'amount');
        let cost = undefined;
        if (price !== undefined) {
            if (amount !== undefined) {
                cost = amount * price;
            }
        }
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const type = 'limit';
        const side = this.safeString (trade, 'type');
        const id = this.safeString (trade, 'tid');
        return {
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': undefined,
            'type': type,
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
            'coin': market['baseId'],
        };
        const response = await this.publicGetPubTrades (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privatePostAccountBalance (params);
        const result = { 'info': response };
        const balancKeys = Object.keys (response);
        for (let i = 0; i < balancKeys.length; i++) {
            const key = balancKeys[i];
            const parts = key.split ('_');
            const numParts = parts.length;
            if (numParts !== 2) {
                continue;
            }
            let type = parts[1];
            if (type !== 'reserved' && type !== 'balance') {
                continue;
            }
            const currencyId = parts[0];
            const code = this.safeCurrencyCode (currencyId);
            if (!(code in result)) {
                result[code] = this.account ();
            }
            type = (type === 'reserved' ? 'used' : 'free');
            result[code][type] = this.safeFloat (response, key);
            const otherType = (type === 'used' ? 'free' : 'used');
            if (otherType in result[code]) {
                result[code]['total'] = this.sum (result[code]['free'], result[code]['used']);
            }
        }
        return this.parseBalance (result);
    }

    parseOrderStatus (status) {
        const statuses = {
            '1': 'open',
            '2': 'open',
            '3': 'canceled',
            '4': 'closed',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market) {
        const symbol = market['symbol'];
        const timestamp = this.safeInteger (order, 'time') * 1000;
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const amount = this.safeFloat (order, 'amount_total');
        const remaining = this.safeFloat (order, 'amount_over');
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
            'price': this.safeFloat (order, 'price'),
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
        const market = this.market (symbol);
        const request = {
            'coin': market['baseId'],
            'type': side,
            'number': amount,
            'price': price,
        };
        const response = await this.privatePostTradeAdd (this.extend (request, params));
        const order = {
            'id': response['id'],
            'time': this.seconds (),
            'type': side,
            'price': price,
            'amount_total': amount,
            'amount_over': amount,
            'info': response,
        };
        const id = order['id'];
        this.orders[id] = this.parseOrder (order, market);
        return order;
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'id': id,
            'coin': market['baseId'],
        };
        return await this.privatePostTradeCancel (this.extend (request, params));
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'id': id,
            'coin': market['baseId'],
        };
        const response = await this.privatePostTradeFetchtrust (this.extend (request, params));
        return this.parseOrder (response, market);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'coin': market['baseId'],
        };
        if (since !== undefined) {
            request['since'] = parseInt (since / 1000);
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privatePostTradeTrust (this.extend (request, params));
        return this.parseOrders (response, market);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'type': '1',
        };
        return await this.fetchOrders (symbol, since, limit, this.extend (request, params));
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/' + path;
        let query = undefined;
        if (api === 'public') {
            query = this.urlencode (params);
            if (query.length) {
                url += '?' + query;
            }
        } else {
            this.checkRequiredCredentials ();
            body = this.urlencode (this.extend (params, {
                'key': this.apiKey,
                'nonce': this.nonce (),
            }));
            const secret = this.hash (this.secret);
            body += '&signature=' + this.hmac (this.encode (body), this.encode (secret));
            headers = { 'Content-type': 'application/x-www-form-urlencoded' };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const response = await this.fetch2 (path, api, method, params, headers, body);
        const status = this.safeString (response, 'status');
        if (!response || response === 'nil' || status) {
            const ErrorClass = this.safeValue ({
                '100': DDoSProtection,
                '101': DDoSProtection,
                '104': AuthenticationError,
                '105': AuthenticationError,
                '106': DDoSProtection,
            }, status, ExchangeError);
            const message = this.safeString (response, 'msg', this.json (response));
            throw new ErrorClass (message);
        }
        return response;
    }
};
