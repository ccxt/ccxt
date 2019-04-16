'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { AuthenticationError, ArgumentsRequired } = require ('./base/errors');
//  ---------------------------------------------------------------------------

module.exports = class bitmart extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitmart',
            'name': 'Bitmart',
            'countries': [ 'US', 'CN', 'HK', 'KR' ],
            'rateLimit': 1000,
            'version': 'v2',
            'has': {
                'CORS': true,
                'fetchMarkets': true,
                'fetchTicker': true,
                'fetchTickers': 'emulated',
                'fetchCurrencies': true,
                'fetchOrderBook': true,
                'fetchTrades': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchBalance': true,
                'createOrder': true,
                'cancelOrder': true,
                'fetchOrders': false,
                'fetchOpenOrders': 'emulated',
                'fetchClosedOrders': 'emulated',
                'fetchOrder': true,
            },
            'urls': {
                'logo': 'https://www.bitmart.com/_nuxt/img/ed5c199.png',
                'api': 'https://openapi.bitmart.com',
                'www': 'https://www.bitmart.com/',
                'doc': 'https://github.com/bitmartexchange/bitmart-official-api-docs/blob/master/REST.md',
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
                'uid': true,
            },
            'api': {
                'token': {
                    'post': [
                        'authentication',
                    ],
                },
                'public': {
                    'get': [
                        'currencies',
                        'ping',
                        'steps',
                        'symbols',
                        'symbols_details',
                        'symbols/{symbol}/kline',
                        'symbols/{symbol}/orders',
                        'symbols/{symbol}/trades',
                        'ticker',
                        'time',
                    ],
                },
                'private': {
                    'get': [
                        'orders',
                        'orders/{id}',
                        'trades',
                        'wallet',
                    ],
                    'post': [
                        'orders',
                    ],
                    'delete': [
                        'orders',
                        'orders/{id}',
                    ],
                },
            },
            'timeframes': {
                '1m': 1,
                '3m': 3,
                '5m': 5,
                '15m': 15,
                '30m': 30,
                '45m': 45,
                '1h': 60,
                '2h': 120,
                '3h': 180,
                '4h': 240,
                '1d': 1440,
                '1w': 10080,
                '1M': 43200,
            },
        });
    }

    async signIn (params = {}) {
        let message = this.apiKey + ':' + this.secret + ':' + this.uid;
        let data = {
            'grant_type': 'client_credentials',
            'client_id': this.apiKey,
            'client_secret': this.hmac (this.encode (message), this.encode (this.secret), 'sha256'),
        };
        let response = await this.tokenPostAuthentication (this.extend (data, params));
        let accessToken = this.safeString (response, 'access_token');
        if (!accessToken) {
            throw new AuthenticationError (this.id + ' signIn() failed to authenticate. Access token missing from response.');
        }
        let expiresIn = this.safeInteger (response, 'expires_in');
        this.options['expires'] = this.sum (this.nonce (), expiresIn * 1000);
        this.options['accessToken'] = accessToken;
        return response;
    }

    async fetchMarkets (params = {}) {
        let markets = await this.publicGetSymbolsDetails ();
        let result = [];
        for (let i = 0; i < markets.length; i++) {
            let market = markets[i];
            let id = market['id'];
            let base = market['base_currency'];
            let quote = market['quote_currency'];
            let symbol = base + '/' + quote;
            let precision = {
                'amount': 8,
                'price': market['price_max_precision'],
            };
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'precision': precision,
                'info': market,
            });
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        let timestamp = this.milliseconds ();
        let symbol = ticker['symbol_id'];
        let last = this.safeFloat (ticker, 'current_price');
        let percentage = this.safeFloat (ticker, 'fluctuation');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'highest_price'),
            'low': this.safeFloat (ticker, 'lowest_price'),
            'bid': this.safeFloat (ticker, 'bid_1'),
            'bidVolume': this.safeFloat (ticker, 'bid_1_amount'),
            'ask': this.safeFloat (ticker, 'ask_1'),
            'askVolume': this.safeFloat (ticker, 'ask_1_amount'),
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': percentage * 100,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'base_volume'),
            'quoteVolume': this.safeFloat (ticker, 'volume'),
            'info': ticker,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let ticker = await this.publicGetTicker (this.extend ({
            'symbol': this.marketId (symbol),
        }, params));
        return this.parseTicker (ticker);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let tickers = await this.publicGetTicker (params);
        let result = {};
        for (let i = 0; i < tickers.length; i++) {
            let ticker = this.parseTicker (tickers[i]);
            let symbol = ticker['symbol'];
            result[symbol] = ticker;
        }
        return result;
    }

    async fetchCurrencies (params = {}) {
        let currencies = await this.publicGetCurrencies (params);
        let result = {};
        for (let i = 0; i < currencies.length; i++) {
            let currency = currencies[i];
            let id = currency['id'];
            result[id] = {
                'id': id,
                'code': id,
                'name': currency['name'],
                'info': currency, // the original payload
                'active': true,
            };
        }
        return result;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        //
        // order query parameters:
        //    precision : price precision whose range is defined in symbol details : [optional]
        //
        let response = await this.publicGetSymbolsSymbolOrders (this.extend ({
            'symbol': this.marketId (symbol),
        }, params));
        return this.parseOrderBook (response, undefined, 'buys', 'sells', 'price', 'amount');
    }

    parseTrade (trade, market) {
        let timestamp = this.safeInteger (trade, 'timestamp');
        if (timestamp === undefined) {
            timestamp = this.safeInteger (trade, 'order_time');
        }
        let side = this.safeString (trade, 'type');
        if (side !== undefined) {
            side = side.toLowerCase ();
        }
        return {
            'info': trade,
            'id': this.safeString (trade, 'trade_id'),
            'order': this.safeInteger (trade, 'entrust_id'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': 'limit',
            'side': side,
            'price': this.safeFloat (trade, 'price'),
            'amount': this.safeFloat (trade, 'amount'),
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetSymbolsSymbolTrades (this.extend ({
            'symbol': this.marketId (symbol),
        }, params));
        return this.parseTrades (response, market, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined)
            throw new ArgumentsRequired (this.id + ' fetchMyTrades requires a symbol argument');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'symbol': this.marketId (symbol),
        };
        if (limit === undefined) {
            limit = 500;
        }
        request['limit'] = limit;
        if (this.safeInteger (params, 'offset') === undefined) {
            request['offset'] = 0;
        }
        let response = await this.privateGetTrades (this.extend (request, params));
        let trades = this.safeValue (response, 'trades');
        return this.parseTrades (trades, market, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        return [
            this.safeInteger (ohlcv, 'timestamp') * 100,
            this.safeFloat (ohlcv, 'open_price'),
            this.safeFloat (ohlcv, 'highest_price'),
            this.safeFloat (ohlcv, 'lowest_price'),
            this.safeFloat (ohlcv, 'current_price'),
            this.safeFloat (ohlcv, 'volume'),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        //
        // ohlcv query parameters:
        //    from : start time of k-line data (in milliseconds) : [required]
        //    to : end time of k-line data (in milliseconds) : [required]
        //    step : steps of sampling (in minutes, default 1 minute) : [optional]
        //
        if (limit === undefined) {
            limit = 1;
        }
        // convert timeframe minutes to milliseconds
        let step = (this.timeframes[timeframe] * 60 * 1000);
        let to = this.milliseconds ();
        if (since === undefined) {
            since = to - (step * limit);
        } else {
            to = this.sum (since, step * limit);
        }
        let request = {
            'symbol': this.marketId (symbol),
            'to': to,
            'from': since,
            'step': this.timeframes[timeframe],
        };
        let response = await this.publicGetSymbolsSymbolKline (this.extend (request, params));
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let balances = await this.privateGetWallet (params);
        let result = { 'info': balances };
        for (let i = 0; i < balances.length; i++) {
            let balance = balances[i];
            let id = this.safeString (balance, 'id');
            if (id in this.currencies_by_id) {
                id = this.currencies_by_id[id]['code'];
            }
            let free = this.safeFloat (balance, 'available');
            let used = this.safeFloat (balance, 'frozen');
            result[id] = {
                'free': free,
                'used': used,
                'total': this.sum (free, used),
            };
        }
        return result;
    }

    parseOrder (order, market = undefined) {
        let timestamp = this.milliseconds ();
        let status = this.parseOrderStatus (this.safeString (order, 'status'));
        let symbol = this.findSymbol (this.safeString (order, 'symbol'), market);
        let info = order['info'];
        if (info === undefined) {
            info = this.extend ({}, order);
        }
        order = this.mapOrderResponse (order, market);
        return {
            'id': this.safeInteger (order, 'id'),
            'info': info,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': 'limit',
            'side': this.safeString (order, 'side'),
            'price': this.safeFloat (order, 'price'),
            'amount': this.safeFloat (order, 'amount'),
            'cost': undefined,
            'average': undefined,
            'filled': this.safeFloat (order, 'executed_amount'),
            'remaining': this.safeFloat (order, 'remaining_amount'),
            'status': status,
            'fee': undefined,
            'trades': undefined,
        };
    }

    mapOrderResponse (order, market = undefined) {
        let originalAmount = this.safeFloat (order, 'original_amount');
        if (originalAmount !== undefined) {
            order['amount'] = originalAmount;
        }
        let entrustId = this.safeInteger (order, 'entrust_id');
        if (entrustId !== undefined) {
            order['id'] = entrustId;
        }
        return order;
    }

    parseOrderStatus (status) {
        let statuses = {
            '0': 'all',
            '1': 'open',
            '2': 'open',
            '3': 'closed',
            '4': 'canceled',
            '5': 'open',
            '6': 'closed',
        };
        return (status in statuses) ? statuses[status] : status;
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let order = {
            'symbol': this.marketId (symbol),
            'side': side.toLowerCase (),
            'amount': this.amountToPrecision (symbol, amount),
            'price': this.priceToPrecision (symbol, price),
        };
        let response = await this.privatePostOrders (this.extend (order, params));
        order = this.extend ({
            'status': 'open',
            'info': response,
        }, order);
        return this.parseOrder (this.extend (order, response), market);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined)
            throw new ArgumentsRequired (this.id + ' cancelOrder requires a symbol argument');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.privateDeleteOrdersId (this.extend ({
            'id': id,
            'entrust_id': id,
        }, params));
        return this.parseOrder (this.extend ({
            'symbol': this.marketId (symbol),
            'status': 'canceled',
            'entrust_id': id,
            'info': response,
        }, response), market);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined)
            throw new ArgumentsRequired (this.id + ' fetchOpenOrders requires a symbol argument');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'symbol': this.marketId (symbol),
        };
        if (limit === undefined) {
            limit = 500;
        }
        request['limit'] = limit;
        if (this.safeInteger (params, 'offset') === undefined) {
            request['offset'] = 0;
        }
        // pending & partially filled orders
        request['status'] = 5;
        let response = await this.privateGetOrders (this.extend (request, params));
        let orders = this.safeValue (response, 'orders');
        return this.parseOrders (orders, market, since, limit);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined)
            throw new ArgumentsRequired (this.id + ' fetchClosedOrders requires a symbol argument');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'symbol': this.marketId (symbol),
        };
        if (limit === undefined) {
            limit = 500;
        }
        request['limit'] = limit;
        if (this.safeInteger (params, 'offset') === undefined) {
            request['offset'] = 0;
        }
        // successful and canceled orders
        request['status'] = 6;
        let response = await this.privateGetOrders (this.extend (request, params));
        let orders = this.safeValue (response, 'orders');
        return this.parseOrders (orders, market, since, limit);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined)
            throw new ArgumentsRequired (this.id + ' fetchOrder requires a symbol argument');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.privateGetOrdersId (this.extend ({
            'id': id,
        }, params));
        return this.parseOrder (response, market);
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.version + '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (Object.keys (query).length)
                url += '?' + this.urlencode (query);
        } else if (api === 'token') {
            this.checkRequiredCredentials ();
            body = this.urlencode (query);
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
            };
        } else {
            this.checkRequiredCredentials ();
            let token = this.safeString (this.options, 'accessToken');
            if (token === undefined) {
                throw new AuthenticationError (this.id + ' ' + path + ' endpoint requires an accessToken option or a prior call to signIn() method');
            }
            let expires = this.safeInteger (this.options, 'expires');
            if (expires !== undefined) {
                if (this.nonce () >= expires) {
                    throw new AuthenticationError (this.id + ' accessToken expired, supply a new accessToken or call to signIn() method');
                }
            }
            if (Object.keys (query).length)
                url += '?' + this.urlencode (query);
            headers = {
                'Content-Type': 'application/json',
                'X-BM-TIMESTAMP': this.nonce (),
                'X-BM-AUTHORIZATION': 'Bearer ' + token,
            };
            if (method !== 'GET') {
                query = this.keysort (query);
                body = this.json (query);
                let message = this.urlencode (query);
                headers['X-BM-SIGNATURE'] = this.hmac (this.encode (message), this.encode (this.secret), 'sha256');
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
};
