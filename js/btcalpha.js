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
            'countries': [ 'US' ],
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

    async fetchMarkets (params = {}) {
        const response = await this.publicGetPairs (params);
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const market = response[i];
            const id = this.safeString (market, 'name');
            const baseId = this.safeString (market, 'currency1');
            const quoteId = this.safeString (market, 'currency2');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const precision = {
                'amount': 8,
                'price': this.safeInteger (market, 'price_precision'),
            };
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'active': true,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': this.safeFloat (market, 'minimum_order_size'),
                        'max': this.safeFloat (market, 'maximum_order_size'),
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
        const request = {
            'pair_name': this.marketId (symbol),
        };
        if (limit) {
            request['limit_sell'] = limit;
            request['limit_buy'] = limit;
        }
        const reponse = await this.publicGetOrderbookPairName (this.extend (request, params));
        return this.parseOrderBook (reponse, undefined, 'buy', 'sell', 'price', 'amount');
    }

    parseTrade (trade, market = undefined) {
        let symbol = undefined;
        if (market === undefined) {
            market = this.safeValue (this.marketsById, trade['pair']);
        }
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        let timestamp = this.safeInteger (trade, 'timestamp');
        if (timestamp !== undefined) {
            timestamp *= 1000;
        }
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'amount');
        let cost = undefined;
        if (price !== undefined) {
            if (amount !== undefined) {
                cost = parseFloat (this.costToPrecision (symbol, price * amount));
            }
        }
        const id = this.safeString2 (trade, 'id', 'tid');
        const side = this.safeString2 (trade, 'my_side', 'side');
        const orderId = this.safeString (trade, 'o_id');
        return {
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': orderId,
            'type': 'limit',
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
        let market = undefined;
        const request = {};
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['pair'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const trades = await this.publicGetExchanges (this.extend (request, params));
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
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
            'type': this.timeframes[timeframe],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (since !== undefined) {
            request['since'] = parseInt (since / 1000);
        }
        const response = await this.publicGetChartsPairTypeChart (this.extend (request, params));
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetWallets (params);
        const result = { 'info': response };
        for (let i = 0; i < response.length; i++) {
            const balance = response[i];
            const currencyId = this.safeString (balance, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['used'] = this.safeFloat (balance, 'reserve');
            account['total'] = this.safeFloat (balance, 'balance');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    parseOrderStatus (status) {
        const statuses = {
            '1': 'open',
            '2': 'canceled',
            '3': 'closed',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        let symbol = undefined;
        if (market === undefined) {
            market = this.safeValue (this.marketsById, order['pair']);
        }
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        let timestamp = this.safeInteger (order, 'date');
        if (timestamp !== undefined) {
            timestamp *= 1000;
        }
        const price = this.safeFloat (order, 'price');
        const amount = this.safeFloat (order, 'amount');
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const id = this.safeString2 (order, 'oid', 'id');
        let trades = this.safeValue (order, 'trades', []);
        trades = this.parseTrades (trades, market);
        const side = this.safeString2 (order, 'my_side', 'type');
        return {
            'id': id,
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'status': status,
            'symbol': symbol,
            'type': 'limit',
            'side': side,
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
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
            'type': side,
            'amount': amount,
            'price': this.priceToPrecision (symbol, price),
        };
        const response = await this.privatePostOrder (this.extend (request, params));
        if (!response['success']) {
            throw new InvalidOrder (this.id + ' ' + this.json (response));
        }
        return this.parseOrder (response, market);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        const request = {
            'order': id,
        };
        const response = await this.privatePostOrderCancel (this.extend (request, params));
        return response;
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'id': id,
        };
        const order = await this.privateGetOrderId (this.extend (request, params));
        return this.parseOrder (order);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['pair'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const orders = await this.privateGetOrdersOwn (this.extend (request, params));
        return this.parseOrders (orders, market, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'status': '1',
        };
        return await this.fetchOrders (symbol, since, limit, this.extend (request, params));
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'status': '3',
        };
        return await this.fetchOrders (symbol, since, limit, this.extend (request, params));
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        if (symbol !== undefined) {
            const market = this.market (symbol);
            request['pair'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const trades = await this.privateGetExchangesOwn (this.extend (request, params));
        return this.parseTrades (trades, undefined, since, limit);
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const query = this.urlencode (this.keysort (this.omit (params, this.extractParams (path))));
        let url = this.urls['api'] + '/';
        if (path !== 'charts/{pair}/{type}/chart/') {
            url += 'v1/';
        }
        url += this.implodeParams (path, params);
        headers = { 'Accept': 'application/json' };
        if (api === 'public') {
            if (query.length) {
                url += '?' + query;
            }
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

    handleErrors (code, reason, url, method, headers, body, response) {
        if (response === undefined) {
            return; // fallback to default error handler
        }
        if (code < 400) {
            return; // fallback to default error handler
        }
        const message = this.id + ' ' + this.safeValue (response, 'detail', body);
        if (code === 401 || code === 403) {
            throw new AuthenticationError (message);
        } else if (code === 429) {
            throw new DDoSProtection (message);
        }
        throw new ExchangeError (message);
    }
};
