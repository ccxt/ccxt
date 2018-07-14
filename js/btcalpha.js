'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, AuthenticationError, DDoSProtection, InvalidOrder } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class btcalpha extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'btcalpha',
            'name': 'BTC-Alpha',
            'countries': 'US',
            'version': 'v1',
            'has': {
                'fetchTicker': false,
                'fetchOHLCV': true,
                'fetchOrders': true,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
                'fetchMyTrades': true,
            },
            'timeframes': {
                '1m': '1',
                '5m': '5',
                '15m': '15',
                '30m': '30',
                '1h': '60',
                '4h': '240',
                '1d': 'D',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/42625213-dabaa5da-85cf-11e8-8f99-aa8f8f7699f0.jpg',
                'api': 'https://btc-alpha.com/api',
                'www': 'https://btc-alpha.com',
                'doc': 'https://btc-alpha.github.io/api-docs',
                'fees': 'https://btc-alpha.com/fees/',
                'referral': 'https://btc-alpha.com/?r=123788',
            },
            'api': {
                'public': {
                    'get': [
                        'currencies/',
                        'pairs/',
                        'orderbook/{pair_name}/',
                        'exchanges/',
                        'charts/{pair}/{type}/chart/',
                    ],
                },
                'private': {
                    'get': [
                        'wallets/',
                        'orders/own/',
                        'order/{id}/',
                        'exchanges/own/',
                        'deposits/',
                        'withdraws/',
                    ],
                    'post': [
                        'order/',
                        'order-cancel/',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'maker': 0.2 / 100,
                    'taker': 0.2 / 100,
                },
                'funding': {
                    'withdraw': {
                        'BTC': 0.00135,
                        'LTC': 0.0035,
                        'XMR': 0.018,
                        'ZEC': 0.002,
                        'ETH': 0.01,
                        'ETC': 0.01,
                        'SIB': 1.5,
                        'CCRB': 4,
                        'PZM': 0.05,
                        'ITI': 0.05,
                        'DCY': 5,
                        'R': 5,
                        'ATB': 0.05,
                        'BRIA': 0.05,
                        'KZC': 0.05,
                        'HWC': 1,
                        'SPA': 1,
                        'SMS': 0.001,
                        'REC': 0.01,
                        'SUP': 1,
                        'BQ': 100,
                        'GDS': 0.1,
                        'EVN': 300,
                        'TRKC': 0.01,
                        'UNI': 1,
                        'STN': 1,
                        'BCH': undefined,
                        'QBIC': 0.5,
                    },
                },
            },
        });
    }

    async fetchMarkets () {
        let markets = await this.publicGetPairs ();
        let result = [];
        for (let i = 0; i < markets.length; i++) {
            let market = markets[i];
            let id = market['name'];
            let base = this.commonCurrencyCode (market['currency1']);
            let quote = this.commonCurrencyCode (market['currency2']);
            let symbol = base + '/' + quote;
            let precision = {
                'amount': 8,
                'price': parseInt (market['price_precision']),
            };
            let lot = Math.pow (10, -precision['amount']);
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'active': true,
                'lot': lot,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': parseFloat (market['minimum_order_size']),
                        'max': parseFloat (market['maximum_order_size']),
                    },
                    'price': {
                        'min': Math.pow (10, -precision['price']),
                        'max': Math.pow (10, precision['price']),
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
                'info': market,
            });
        }
        return result;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let request = {
            'pair_name': this.marketId (symbol),
        };
        if (limit) {
            request['limit_sell'] = limit;
            request['limit_buy'] = limit;
        }
        let reponse = await this.publicGetOrderbookPairName (this.extend (request, params));
        return this.parseOrderBook (reponse, undefined, 'buy', 'sell', 'price', 'amount');
    }

    parseTrade (trade, market = undefined) {
        let symbol = undefined;
        if (!market)
            market = this.safeValue (this.marketsById, trade['pair']);
        if (market)
            symbol = market['symbol'];
        let timestamp = parseInt (trade['timestamp'] * 1000);
        let price = parseFloat (trade['price']);
        let amount = parseFloat (trade['amount']);
        let cost = this.costToPrecision (symbol, price * amount);
        let id = this.safeString (trade, 'id');
        if (!id)
            id = this.safeString (trade, 'tid');
        return {
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': id,
            'order': this.safeString (trade, 'o_id'),
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
        let market = undefined;
        let request = {};
        if (typeof symbol !== 'undefined') {
            market = this.market (symbol);
            request['pair'] = market['id'];
        }
        if (limit)
            request['limit'] = limit;
        let trades = await this.publicGetExchanges (this.extend (request, params));
        return this.parseTrades (trades, market, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '5m', since = undefined, limit = undefined) {
        return [
            ohlcv['time'] * 1000,
            ohlcv['open'],
            ohlcv['high'],
            ohlcv['low'],
            ohlcv['close'],
            ohlcv['volume'],
        ];
    }

    async fetchOHLCV (symbol, timeframe = '5m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'pair': market['id'],
            'type': this.timeframes[timeframe],
        };
        if (limit)
            request['limit'] = limit;
        if (since)
            request['since'] = parseInt (since / 1000);
        let response = await this.publicGetChartsPairTypeChart (this.extend (request, params));
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let balances = await this.privateGetWallets (params);
        let result = { 'info': balances };
        for (let i = 0; i < balances.length; i++) {
            let balance = balances[i];
            let currency = this.commonCurrencyCode (balance['currency']);
            let account = {
                'free': parseFloat (balance['balance']),
                'used': parseFloat (balance['reserve']),
                'total': 0.0,
            };
            account['total'] = this.sum (account['free'], account['used']);
            result[currency] = account;
        }
        return this.parseBalance (result);
    }

    parseOrder (order, market = undefined) {
        let symbol = undefined;
        if (!market)
            market = this.safeValue (this.marketsById, order['pair']);
        if (market)
            symbol = market['symbol'];
        let timestamp = parseInt (order['date'] * 1000);
        let price = parseFloat (order['price']);
        let amount = this.safeFloat (order, 'amount');
        let status = this.safeString (order, 'status');
        let statuses = {
            '1': 'open',
            '2': 'canceled',
            '3': 'closed',
        };
        let id = this.safeString (order, 'oid');
        if (!id)
            id = this.safeString (order, 'id');
        let trades = this.safeValue (order, 'trades');
        if (trades)
            trades = this.parseTrades (trades, market);
        return {
            'id': id,
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'status': this.safeString (statuses, status),
            'symbol': symbol,
            'type': 'limit',
            'side': order['type'],
            'price': price,
            'cost': undefined,
            'amount': amount,
            'filled': undefined,
            'remaining': undefined,
            'trades': trades,
            'fee': undefined,
            'info': order,
        };
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.privatePostOrder (this.extend ({
            'pair': market['id'],
            'type': side,
            'amount': amount,
            'price': this.priceToPrecision (symbol, price),
        }, params));
        if (!response['success'])
            throw new InvalidOrder (this.id + ' ' + this.json (response));
        return this.parseOrder (response, market);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        let response = await this.privatePostOrderCancel (this.extend ({
            'order': id,
        }, params));
        return response;
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let order = await this.privateGetOrderId (this.extend ({
            'id': id,
        }, params));
        return this.parseOrder (order);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let request = {};
        let market = undefined;
        if (symbol) {
            market = this.market (symbol);
            request['pair'] = market['id'];
        }
        if (limit)
            request['limit'] = limit;
        let orders = await this.privateGetOrdersOwn (this.extend (request, params));
        return this.parseOrders (orders, market, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        let orders = await this.fetchOrders (symbol, since, limit, this.extend ({
            'status': '1',
        }, params));
        return orders;
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        let orders = await this.fetchOrders (symbol, since, limit, this.extend ({
            'status': '3',
        }, params));
        return orders;
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let request = {};
        if (symbol) {
            let market = this.market (symbol);
            request['pair'] = market['id'];
        }
        if (limit)
            request['limit'] = limit;
        let trades = await this.privateGetExchangesOwn (this.extend (request, params));
        return this.parseTrades (trades, undefined, since, limit);
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let query = this.urlencode (this.keysort (this.omit (params, this.extractParams (path))));
        let url = this.urls['api'] + '/';
        if (path !== 'charts/{pair}/{type}/chart/') {
            url += 'v1/';
        }
        url += this.implodeParams (path, params);
        headers = { 'Accept': 'application/json' };
        if (api === 'public') {
            if (query.length)
                url += '?' + query;
        } else {
            this.checkRequiredCredentials ();
            let payload = this.apiKey;
            if (method === 'POST') {
                headers['Content-Type'] = 'application/x-www-form-urlencoded';
                body = query;
                payload += body;
            } else if (query.length) {
                url += '?' + query;
            }
            headers['X-KEY'] = this.apiKey;
            headers['X-SIGN'] = this.hmac (this.encode (payload), this.encode (this.secret));
            headers['X-NONCE'] = this.nonce ().toString ();
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body) {
        if (code < 400)
            return;
        if (typeof body !== 'string')
            return; // fallback to default error handler
        if (body.length < 2)
            return; // fallback to default error handler
        if ((body[0] === '{') || (body[0] === '[')) {
            let response = JSON.parse (body);
            let message = this.id + ' ' + this.safeValue (response, 'detail', body);
            if (code === 401 || code === 403) {
                throw new AuthenticationError (message);
            } else if (code === 429) {
                throw new DDoSProtection (message);
            }
            throw new ExchangeError (message);
        }
    }
};
