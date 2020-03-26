'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, AuthenticationError, ExchangeNotAvailable } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class exx extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'exx',
            'name': 'EXX',
            'countries': [ 'CN' ],
            'rateLimit': 1000 / 10,
            'userAgent': this.userAgents['chrome'],
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
                'referral': 'https://www.exx.com/r/fde4260159e53ab8a58cc9186d35501f?recommQd=1',
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
            'commonCurrencies': {
                'TV': 'TIV', // Ti-Value
            },
            'exceptions': {
                '103': AuthenticationError,
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetMarkets (params);
        const ids = Object.keys (response);
        const result = [];
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const market = response[id];
            const [ baseId, quoteId ] = id.split ('_');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const active = market['isOpen'] === true;
            const precision = {
                'amount': parseInt (market['amountScale']),
                'price': parseInt (market['priceScale']),
            };
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': active,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': Math.pow (10, -precision['amount']),
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
        const symbol = market['symbol'];
        const timestamp = this.safeInteger (ticker, 'date');
        ticker = ticker['ticker'];
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
            'change': this.safeFloat (ticker, 'riseRate'),
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
            'currency': market['id'],
        };
        const response = await this.publicGetTicker (this.extend (request, params));
        return this.parseTicker (response, market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetTickers (params);
        const result = {};
        const timestamp = this.milliseconds ();
        const ids = Object.keys (response);
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            if (!(id in this.marketsById)) {
                continue;
            }
            const market = this.marketsById[id];
            const symbol = market['symbol'];
            const ticker = {
                'date': timestamp,
                'ticker': response[id],
            };
            result[symbol] = this.parseTicker (ticker, market);
        }
        return result;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'currency': this.marketId (symbol),
        };
        const response = await this.publicGetDepth (this.extend (request, params));
        const timestamp = this.safeTimestamp (response, 'timestamp');
        return this.parseOrderBook (response, timestamp);
    }

    parseTrade (trade, market = undefined) {
        const timestamp = this.safeTimestamp (trade, 'date');
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
            'currency': market['id'],
        };
        const response = await this.publicGetTrades (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetGetBalance (params);
        const result = { 'info': response };
        const balances = this.safeValue (response, 'funds');
        const currencies = Object.keys (balances);
        for (let i = 0; i < currencies.length; i++) {
            const currencyId = currencies[i];
            const balance = balances[currencyId];
            const code = this.safeCurrencyCode (currencyId);
            const account = {
                'free': this.safeFloat (balance, 'balance'),
                'used': this.safeFloat (balance, 'freeze'),
                'total': this.safeFloat (balance, 'total'),
            };
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    parseOrder (order, market = undefined) {
        //
        //     {
        //         "fees": 0,
        //         "total_amount": 1,
        //         "trade_amount": 0,
        //         "price": 30,
        //         "currency": “eth_hsr",
        //         "id": "13878",
        //         "trade_money": 0,
        //         "type": "buy",
        //         "trade_date": 1509728897772,
        //         "status": 0
        //     }
        //
        const symbol = market['symbol'];
        const timestamp = parseInt (order['trade_date']);
        const price = this.safeFloat (order, 'price');
        const cost = this.safeFloat (order, 'trade_money');
        const amount = this.safeFloat (order, 'total_amount');
        const filled = this.safeFloat (order, 'trade_amount', 0.0);
        const remaining = parseFloat (this.amountToPrecision (symbol, amount - filled));
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
            'clientOrderId': undefined,
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
            'trades': undefined,
            'fee': fee,
            'info': order,
        };
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'currency': market['id'],
            'type': side,
            'price': price,
            'amount': amount,
        };
        const response = await this.privateGetOrder (this.extend (request, params));
        const id = this.safeString (response, 'id');
        const order = this.parseOrder ({
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
        const market = this.market (symbol);
        const request = {
            'id': id,
            'currency': market['id'],
        };
        const response = await this.privateGetCancel (this.extend (request, params));
        return response;
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'id': id,
            'currency': market['id'],
        };
        const response = await this.privateGetGetOrder (this.extend (request, params));
        return this.parseOrder (response, market);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'currency': market['id'],
        };
        const response = await this.privateGetGetOpenOrders (this.extend (request, params));
        if (!Array.isArray (response)) {
            return [];
        }
        return this.parseOrders (response, market, since, limit);
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/' + path;
        if (api === 'public') {
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        } else {
            this.checkRequiredCredentials ();
            const query = this.urlencode (this.keysort (this.extend ({
                'accesskey': this.apiKey,
                'nonce': this.nonce (),
            }, params)));
            const signed = this.hmac (this.encode (query), this.encode (this.secret), 'sha512');
            url += '?' + query + '&signature=' + signed;
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return; // fallback to default error handler
        }
        //
        //  {"result":false,"message":"服务端忙碌"}
        //  ... and other formats
        //
        const code = this.safeString (response, 'code');
        const message = this.safeString (response, 'message');
        const feedback = this.id + ' ' + body;
        if (code === '100') {
            return;
        }
        if (code !== undefined) {
            this.throwExactlyMatchedException (this.exceptions, code, feedback);
            if (code === '308') {
                // this is returned by the exchange when there are no open orders
                // {"code":308,"message":"Not Found Transaction Record"}
                return;
            } else {
                throw new ExchangeError (feedback);
            }
        }
        const result = this.safeValue (response, 'result');
        if (result !== undefined) {
            if (!result) {
                if (message === '服务端忙碌') {
                    throw new ExchangeNotAvailable (feedback);
                } else {
                    throw new ExchangeError (feedback);
                }
            }
        }
    }
};
