'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ExchangeNotAvailable, InsufficientFunds, InvalidOrder, DDoSProtection, InvalidNonce, AuthenticationError, NotSupported } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class fcoin extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'fcoin',
            'name': 'FCoin',
            'countries': 'CN',
            'rateLimit': 2000,
            'userAgent': this.userAgents['chrome39'],
            'version': 'v2',
            'accounts': undefined,
            'accountsById': undefined,
            'hostname': 'api.fcoin.com',
            'has': {
                'CORS': false,
                'fetchDepositAddress': false,
                'fetchOHCLV': false,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchOrderBook': true,
                'fetchOrderBooks': false,
                'fetchTradingLimits': false,
                'withdraw': false,
                'fetchCurrencies': false,
            },
            'timeframes': {
                '1m': 'M1',
                '3m': 'M3',
                '5m': 'M5',
                '15m': 'M15',
                '30m': 'M30',
                '1h': 'H1',
                '1d': 'D1',
                '1w': 'W1',
                '1M': 'MN',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/42244210-c8c42e1e-7f1c-11e8-8710-a5fb63b165c4.jpg',
                'api': 'https://api.fcoin.com',
                'www': 'https://www.fcoin.com',
                'referral': 'https://www.fcoin.com/i/W9VvE',
                'doc': 'https://developer.fcoin.com',
                'fees': 'https://support.fcoin.com/hc/en-us/articles/360003715514-Trading-Rules',
            },
            'api': {
                'market': {
                    'get': [
                        'ticker/{symbol}',
                        'depth/{level}/{symbol}',
                        'trades/{symbol}',
                        'candles/{timeframe}/{symbol}',
                    ],
                },
                'public': {
                    'get': [
                        'symbols',
                        'currencies',
                        'server-time',
                    ],
                },
                'private': {
                    'get': [
                        'accounts/balance',
                        'orders',
                        'orders/{order_id}',
                        'orders/{order_id}/match-results', // check order result
                    ],
                    'post': [
                        'orders',
                        'orders/{order_id}/submit-cancel', // cancel order
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': 0.001,
                    'taker': 0.001,
                },
            },
            'limits': {
                'amount': { 'min': 0.01, 'max': 100000 },
            },
            'options': {
                'limits': {
                    'BTM/USDT': { 'amount': { 'min': 0.1, 'max': 10000000 }},
                    'ETC/USDT': { 'amount': { 'min': 0.001, 'max': 400000 }},
                    'ETH/USDT': { 'amount': { 'min': 0.001, 'max': 10000 }},
                    'LTC/USDT': { 'amount': { 'min': 0.001, 'max': 40000 }},
                    'BCH/USDT': { 'amount': { 'min': 0.001, 'max': 5000 }},
                    'BTC/USDT': { 'amount': { 'min': 0.001, 'max': 1000 }},
                    'FT/BTC': { 'amount': { 'min': 1, 'max': 10000000 }},
                    'FT/ETH': { 'amount': { 'min': 1, 'max': 10000000 }},
                    'FT/USDT': { 'amount': { 'min': 1, 'max': 10000000 }},
                    'ZIL/ETH': { 'amount': { 'min': 1, 'max': 10000000 }},
                    'ZIP/ETH': { 'amount': { 'min': 1, 'max': 10000000 }},
                    'OMG/ETH': { 'amount': { 'min': 0.01, 'max': 500000 }},
                    'ICX/ETH': { 'amount': { 'min': 0.01, 'max': 3000000 }},
                },
            },
            'exceptions': {
                '400': NotSupported, // Bad Request
                '401': AuthenticationError,
                '405': NotSupported,
                '429': DDoSProtection, // Too Many Requests, exceed api request limit
                '1002': ExchangeNotAvailable, // System busy
                '1016': InsufficientFunds,
                '3008': InvalidOrder,
                '6004': InvalidNonce,
                '6005': AuthenticationError, // Illegal API Signature
            },
        });
    }

    async fetchMarkets () {
        let response = await this.publicGetSymbols ();
        let result = [];
        let markets = response['data'];
        for (let i = 0; i < markets.length; i++) {
            let market = markets[i];
            let id = market['name'];
            let baseId = market['base_currency'];
            let quoteId = market['quote_currency'];
            let base = baseId.toUpperCase ();
            base = this.commonCurrencyCode (base);
            let quote = quoteId.toUpperCase ();
            quote = this.commonCurrencyCode (quote);
            let symbol = base + '/' + quote;
            let precision = {
                'price': market['price_decimal'],
                'amount': market['amount_decimal'],
            };
            let limits = {
                'price': {
                    'min': Math.pow (10, -precision['price']),
                    'max': Math.pow (10, precision['price']),
                },
            };
            if (symbol in this.options['limits']) {
                limits = this.extend (this.options['limits'][symbol], limits);
            }
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': true,
                'precision': precision,
                'limits': limits,
                'info': market,
            });
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privateGetAccountsBalance ();
        let result = { 'info': response };
        let balances = response['data'];
        for (let i = 0; i < balances.length; i++) {
            let balance = balances[i];
            let currencyId = balance['currency'];
            let code = currencyId.toUpperCase ();
            if (currencyId in this.currencies_by_id) {
                code = this.currencies_by_id[currencyId]['code'];
            } else {
                code = this.commonCurrencyCode (code);
            }
            let account = this.account ();
            account['free'] = parseFloat (balance['available']);
            account['total'] = parseFloat (balance['balance']);
            account['used'] = parseFloat (balance['frozen']);
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    parseBidsAsks (bidasks, priceKey = 0, amountKey = 1) {
        let newbidasks = [];
        let length = bidasks.length;
        let halfLength = parseInt (length / 2);
        for (let i = 0; i < halfLength; i++) {
            let ba = bidasks.slice (0, 2);
            newbidasks.push ([ba[priceKey], ba[amountKey]]);    // sames a little ugly, just aim to pass eslint check
            bidasks = bidasks.slice (2);
        }
        return newbidasks;
    }

    async fetchOrderBook (symbol = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let request = {
            'symbol': this.marketId (symbol),
            'level': 'full',  // full
        };
        let orderbook = await this.marketGetDepthLevelSymbol (this.extend (request, params));
        return this.parseOrderBook (orderbook['data'], orderbook['data']['ts'], 'bids', 'asks', 0, 1);
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let ticker = await this.marketGetTickerSymbol (this.extend ({
            'symbol': market['id'],
        }, params));
        return this.parseTicker (ticker, market);
    }

    parseTicker (ticker, market = undefined) {
        let timestamp = this.nonce ();  // better to use server time, but fcoin server response 'seq'
        let symbol = undefined;
        if (typeof market !== 'undefined') {
            symbol = market['symbol'];
        } else if ('pair' in ticker) {
            let idParts = ticker['type'].split ('.');
            let id = idParts[1];
            if (id in this.markets_by_id) {
                market = this.markets_by_id[id];
            }
            if (typeof market !== 'undefined') {
                symbol = market['symbol'];
            }
        }
        let ts = ticker['data']['ticker'];
        let last = ts[0];
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': ts[7],
            'low': ts[8],
            'bid': ts[2],
            'bidVolume': ts[3],
            'ask': ts[4],
            'askVolume': ts[5],
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': ts[9],
            'quoteVolume': ts[10],
            'info': ticker,
        };
    }

    parseTrade (trade, market) {
        let timestamp = parseInt (parseFloat (trade['ts']));
        let side = trade['side'].toLowerCase ();
        let orderId = this.safeString (trade, 'id');
        let price = this.safeFloat (trade, 'price');
        let amount = this.safeFloat (trade, 'amount');
        let cost = price * amount;
        let fee = undefined;
        return {
            'id': orderId,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'order': orderId,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = 50, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'symbol': market['id'],
            'limit': limit,
        };
        if (typeof since !== 'undefined') {
            request['timestamp'] = parseInt (since / 1000);
        }
        let response = await this.marketGetTradesSymbol (this.extend (request, params));
        return this.parseTrades (response['data'], market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let orderType = type;
        amount = this.amountToPrecision (symbol, amount);
        let order = {
            'symbol': this.marketId (symbol),
            'amount': amount,
            'side': side,
            'type': orderType,
        };
        if (type === 'limit') {
            order['price'] = this.priceToPrecision (symbol, price);
        }
        let result = await this.privatePostOrders (this.extend (order, params));
        return result['data'];
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        return await this.privatePostOrdersOrderIdSubmitCancel (this.extend ({
            'order_id': id,
        }, params));
    }

    parseOrder (order, market = undefined) {
        let side = order['side'];
        let open = order['state'] === 'submitted';
        let canceled = order['state'] === 'canceled';
        let status = undefined;
        if (open) {
            status = 'open';
        } else if (canceled) {
            status = 'canceled';
        } else {
            status = 'closed';
        }
        let symbol = undefined;
        if (!market) {
            let exchange = order['symbol'];
            if (exchange in this.markets_by_id) {
                market = this.markets_by_id[exchange];
            }
        }
        if (market) {
            symbol = market['symbol'];
        }
        let orderType = order['type'];
        let timestamp = parseInt (parseFloat (order['created_at']));
        let amount = this.safeFloat (order, 'amount');
        let filled_amount = this.safeFloat (order, 'filled_amount');
        let feeCurrency = (side === 'buy') ? market['base'] : market['quote'];
        let result = {
            'info': order,
            'id': order['id'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': orderType,
            'side': side,
            'price': this.safeFloat (order, 'price'),
            'average': undefined,
            'amount': amount,
            'remaining': amount - filled_amount,
            'filled': filled_amount,
            'status': status,
            'fee': {
                'cost': this.safeFloat (order, 'fill_fees'),
                'currency': feeCurrency,
            },
        };
        return result;
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.privateGetOrdersOrderId (this.extend ({
            'order_id': id,
        }, params));
        return this.parseOrder (response);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        let result = undefined;
        result = await this.fetchOrders (symbol, since, limit, { 'states': 'submitted' });
        return result;
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        let result = undefined;
        result = await this.fetchOrders (symbol, since, limit, { 'states': 'filled' });
        return result;
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.privateGetOrders (this.extend ({
            'symbol': market['id'],
            'states': 'submitted',
        }, params));
        return this.parseOrders (response['data']);
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        return [
            ohlcv['seq'],
            ohlcv['open'],
            ohlcv['high'],
            ohlcv['low'],
            ohlcv['close'],
            ohlcv['base_vol'],
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        if (typeof limit === 'undefined') {
            limit = 100;
        }
        let market = this.market (symbol);
        let request = {
            'symbol': market['id'],
            'timeframe': this.timeframes[timeframe],
            'limit': limit,
        };
        let response = await this.marketGetCandlesTimeframeSymbol (this.extend (request, params));
        return this.parseOHLCVs (response['data'], market, timeframe, since, limit);
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let request = '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        let url = this.urls['api'];
        if ((api === 'public') || (api === 'market') || (path.indexOf ('/hist') >= 0)) {
            request = '/' + this.version + '/' + api + request;
            url += request;
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        }
        if (api === 'private') {
            this.checkRequiredCredentials ();
            request = '/' + this.version + request;
            url += request;
            let paramsStr = '';
            let sortedQuery = this.keysort (query);
            if (method === 'POST' && !this.isEmpty (sortedQuery)) {
                body = this.json (sortedQuery);
            }
            paramsStr = this.urlencode (sortedQuery);
            if (method === 'GET') {
                url += paramsStr ? '?' + paramsStr : '';
            }
            //  HTTP_METHOD + HTTP_REQUEST_URI + TIMESTAMP + POST_BODY
            let timestamp = this.nonce ();
            let tsStr = timestamp.toString ();
            let signStr = method + url + tsStr;
            signStr += (method === 'POST' && paramsStr) ? paramsStr : '';
            let payload = this.stringToBase64 (this.encode (signStr));
            let secret = this.encode (this.secret);
            let signature = this.hmac (payload, secret, 'sha1', 'binary');
            signature = this.decode (this.stringToBase64 (signature));
            headers = {};
            headers['FC-ACCESS-KEY'] = this.apiKey;
            headers['FC-ACCESS-SIGNATURE'] = signature;
            headers['FC-ACCESS-TIMESTAMP'] = tsStr;
            headers['Content-Type'] = 'application/json';
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body) {
        if (body.length < 2) {
            return;
        }
        if (body[0] !== '{') {
            throw new ExchangeError (body);
        }
        const response = JSON.parse (body);
        if (!('status' in response)) {
            throw new ExchangeError (body);
        }
        let status = this.safeString (response, 'status');
        if (status === '0') {
            return;
        }
        const feedback = this.id + ' ' + this.json (response);
        if (status in this.exceptions) {
            const exceptions = this.exceptions;
            throw new exceptions[status] (feedback);
        }
        throw new ExchangeError (feedback);
    }
};
