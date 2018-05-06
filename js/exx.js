'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, AuthenticationError } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class exx extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'exx',
            'name': 'EXX',
            'countries': 'CN',
            'rateLimit': 1000 / 10,
            'has': {
                'fetchOrder': true,
                'fetchTickers': true,
                'fetchOpenOrders': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/37770292-fbf613d0-2de4-11e8-9f79-f2dc451b8ccb.jpg',
                'api': {
                    'public': 'https://api.exx.com/data/v1',
                    'private': 'https://trade.exx.com/api',
                },
                'www': 'https://www.exx.com/',
                'doc': 'https://www.exx.com/help/restApi',
                'fees': 'https://www.exx.com/help/rate',
            },
            'api': {
                'public': {
                    'get': [
                        'markets',
                        'tickers',
                        'ticker',
                        'depth',
                        'trades',
                    ],
                },
                'private': {
                    'get': [
                        'order',
                        'cancel',
                        'getOrder',
                        'getOpenOrders',
                        'getBalance',
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
                        'BCC': 0.0003,
                        'BCD': 0.0,
                        'BOT': 10.0,
                        'BTC': 0.001,
                        'BTG': 0.0,
                        'BTM': 25.0,
                        'BTS': 3.0,
                        'EOS': 1.0,
                        'ETC': 0.01,
                        'ETH': 0.01,
                        'ETP': 0.012,
                        'HPY': 0.0,
                        'HSR': 0.001,
                        'INK': 20.0,
                        'LTC': 0.005,
                        'MCO': 0.6,
                        'MONA': 0.01,
                        'QASH': 5.0,
                        'QCASH': 5.0,
                        'QTUM': 0.01,
                        'USDT': 5.0,
                    },
                },
            },
        });
    }

    async fetchMarkets () {
        let markets = await this.publicGetMarkets ();
        let ids = Object.keys (markets);
        let result = [];
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i];
            let market = markets[id];
            let [ baseId, quoteId ] = id.split ('_');
            let upper = id.toUpperCase ();
            let [ base, quote ] = upper.split ('_');
            base = this.commonCurrencyCode (base);
            quote = this.commonCurrencyCode (quote);
            let symbol = base + '/' + quote;
            let active = market['isOpen'] === true;
            let precision = {
                'amount': parseInt (market['amountScale']),
                'price': parseInt (market['priceScale']),
            };
            let lot = Math.pow (10, -precision['amount']);
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': active,
                'lot': lot,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': lot,
                        'max': Math.pow (10, precision['amount']),
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

    parseTicker (ticker, market = undefined) {
        let symbol = market['symbol'];
        let timestamp = parseInt (ticker['date']);
        ticker = ticker['ticker'];
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
            'change': parseFloat (ticker['riseRate']),
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
        let ticker = await this.publicGetTicker (this.extend ({
            'currency': market['id'],
        }, params));
        return this.parseTicker (ticker, market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let tickers = await this.publicGetTickers (params);
        let result = {};
        let timestamp = this.milliseconds ();
        let ids = Object.keys (tickers);
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i];
            if (!(id in this.marketsById))
                continue;
            let market = this.marketsById[id];
            let symbol = market['symbol'];
            let ticker = {
                'date': timestamp,
                'ticker': tickers[id],
            };
            result[symbol] = this.parseTicker (ticker, market);
        }
        return result;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let orderbook = await this.publicGetDepth (this.extend ({
            'currency': this.marketId (symbol),
        }, params));
        return this.parseOrderBook (orderbook, orderbook['timestamp']);
    }

    parseTrade (trade, market = undefined) {
        let timestamp = trade['date'] * 1000;
        let price = parseFloat (trade['price']);
        let amount = parseFloat (trade['amount']);
        let symbol = market['symbol'];
        let cost = this.costToPrecision (symbol, price * amount);
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
        let trades = await this.publicGetTrades (this.extend ({
            'currency': market['id'],
        }, params));
        return this.parseTrades (trades, market, since, limit);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let balances = await this.privateGetGetBalance (params);
        let result = { 'info': balances };
        balances = balances['funds'];
        let currencies = Object.keys (balances);
        for (let i = 0; i < currencies.length; i++) {
            let id = currencies[i];
            let balance = balances[id];
            let currency = this.commonCurrencyCode (id);
            let account = {
                'free': parseFloat (balance['balance']),
                'used': parseFloat (balance['freeze']),
                'total': parseFloat (balance['total']),
            };
            result[currency] = account;
        }
        return this.parseBalance (result);
    }

    parseOrder (order, market = undefined) {
        let symbol = market['symbol'];
        let timestamp = parseInt (order['trade_date']);
        let price = parseFloat (order['price']);
        let cost = this.safeFloat (order, 'trade_money');
        let amount = this.safeFloat (order, 'total_amount');
        let filled = this.safeFloat (order, 'trade_amount', 0.0);
        let remaining = this.amountToPrecision (symbol, amount - filled);
        let status = this.safeInteger (order, 'status');
        if (status === 1) {
            status = 'canceled';
        } else if (status === 2) {
            status = 'closed';
        } else {
            status = 'open';
        }
        let fee = undefined;
        if ('fees' in order) {
            fee = {
                'cost': this.safeFloat (order, 'fees'),
                'currency': market['quote'],
            };
        }
        return {
            'id': this.safeString (order, 'id'),
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'lastTradeTimestamp': undefined,
            'status': 'open',
            'symbol': symbol,
            'type': 'limit',
            'side': order['type'],
            'price': price,
            'cost': cost,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'trades': undefined,
            'fee': fee,
            'info': order,
        };
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.privateGetOrder (this.extend ({
            'currency': market['id'],
            'type': side,
            'price': price,
            'amount': amount,
        }, params));
        let id = response['id'];
        let order = this.parseOrder ({
            'id': id,
            'trade_date': this.milliseconds (),
            'total_amount': amount,
            'price': price,
            'type': side,
            'info': response,
        }, market);
        this.orders[id] = order;
        return order;
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let result = await this.privateGetCancel (this.extend ({
            'id': id,
            'currency': market['id'],
        }, params));
        return result;
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let order = await this.privateGetGetOrder (this.extend ({
            'id': id,
            'currency': market['id'],
        }, params));
        return this.parseOrder (order, market);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let orders = await this.privateGetOpenOrders (this.extend ({
            'currency': market['id'],
        }, params));
        return this.parseOrders (orders, market, since, limit);
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/' + path;
        if (api === 'public') {
            if (Object.keys (params).length)
                url += '?' + this.urlencode (params);
        } else {
            this.checkRequiredCredentials ();
            let query = this.urlencode (this.keysort (this.extend ({
                'accesskey': this.apiKey,
                'nonce': this.nonce (),
            }, params)));
            let signature = this.hmac (this.encode (query), this.encode (this.secret), 'sha512');
            url += '?' + query + '&signature=' + signature;
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        let code = this.safeInteger (response, 'code');
        let message = this.safeString (response, 'message');
        if (code && code !== 100 && message) {
            if (code === 103)
                throw new AuthenticationError (message);
            throw new ExchangeError (message);
        }
        return response;
    }
};
