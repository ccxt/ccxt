'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, InsufficientFunds, InvalidOrder, OrderNotFound, AuthenticationError, DDoSProtection, PermissionDenied } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class nebula extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'nebula',
            'name': 'nebula',
            'countries': [ 'FR' ],
            'version': 'v1',
            'userAgent': undefined,
            'rateLimit': 5000, // 5 *  1000 please review it if you are whitelisted by our service
            'has': {
                'CORS': false,
                'fetchOHLCV': false,
                'cancelOrder': true,
                'createOrder': true,
                'fetchCurrencies': true,
                'fetchBalance': true,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
                'fetchOrders': false,
                'fetchOrder': false,
                'fetchTickers': true,
                'fetchTrades': true,
                'fetchOrderBook': true,
                'fetchMyTrades': true,
                'createLimitBuyOrder': true,
                'createLimitSellOrder': true,
                'createMarketBuyOrder': true,
                'createMarketSellOrder': true,
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '1h': '1h',
                '1d': '1d',
            },
            'urls': {
                'test': 'https://demo.nebula.exchange',
                'logo': 'https://nebula.exchange/newsite/wp-content/uploads/2018/04/logo_header.png',
                'api': 'https://api.nebula.exchange',
                'www': 'https://nebula.exchange',
                'doc': 'https://nebula.exchange/wp-content/uploads/2018/06/Nebula-API-V1.pdf',
                'fees': 'https://nebula.exchange/faq/',
                'referral': 'https://nebula.exchange/faq/',
            },
            'api': {
                'public': {
                    'get': [
                        'coins',
                        'symbols',
                        'exchanges',
                        'tradehistory',
                        'orderbook',
                        'orderbookL3',
                    ],
                },
                'private': {
                    'get': [
                        'coins',
                        'symbols',
                        'exchanges',
                        'tradehistory',
                        'orderbook',
                        'orderbookL3',
                        'orders',
                        'orders/closed',
                        'orders/canceled',
                        'trades',
                        'wallets',
                    ],
                    'post': [
                        'orders/new',
                    ],
                    'put': [
                        'orders/cancel',
                    ],
                },
            },
            'exceptions': {
                'Invalid API Key.': AuthenticationError,
                'Access Denied': PermissionDenied,
            },
            'options': {
                'fetchTickerQuotes': false,
            },
        });
    }

    async fetchMarkets () {
        let markets = await this.publicGetSymbols ();
        let result = [];
        for (let p = 0; p < markets.length; p++) {
            let market = markets[p];
            let active = true;
            let id = market['symbol'];
            let base = market['token'];
            let quote = market['against'];
            base = this.commonCurrencyCode (base);
            quote = this.commonCurrencyCode (quote);
            let symbol = id;
            let precision = {
                'amount': 8,
                'price': 8,
            };
            let costMin = Math.pow (10, -precision['amount']);
            if (quote === 'ETH') {
                costMin = 0.001;
            } else if (quote === 'BTC') {
                costMin = 0.0001;
            } else if (quote === 'USDT' || quote === 'EURT') {
                costMin = 1.0;
            }
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'active': active,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': Math.pow (10, -precision['amount']),
                        'max': undefined,
                    },
                    'price': {
                        'min': Math.pow (10, -precision['amount']),
                        'max': undefined,
                    },
                    'cost': {
                        'min': costMin,
                        'max': undefined,
                    },
                },
                'taker': 0.0,
                'maker': 0.0,
                'info': market,
            });
        }
        return result;
    }

    async fetchCurrencies (params = {}) {
        let signed = this.safeValue (params, 'signed', false);
        let currencies = signed ? await this.privateGetCoins () : await this.publicGetCoins ();
        let result = {};
        for (let i = 0; i < currencies.length; i++) {
            let currency = currencies[i];
            let id = currency['code'];
            let code = this.commonCurrencyCode (id);
            let precision = 8;
            result[code] = {
                'id': id,
                'code': code,
                'address': undefined,
                'info': currency,
                'type': undefined,
                'name': currency['desc'],
                'active': true,
                'fee': 0.0,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': Math.pow (10, -precision),
                        'max': Math.pow (10, precision),
                    },
                    'price': {
                        'min': Math.pow (10, -precision),
                        'max': Math.pow (10, precision),
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': 0.0,
                        'max': Math.pow (10, precision),
                    },
                },
            };
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = undefined;
        let code = this.safeValue (params, 'code');
        let request = {};
        if (typeof code !== 'undefined')
            request['endpoint'] = code;
        let hideZero = this.safeValue (params, 'hideZero');
        if (typeof hideZero !== 'undefined')
            request['hideZero'] = hideZero;
        response = await this.privateGetWallets (request);
        if (typeof response === 'undefined')
            throw new ExchangeError (this.id + ' empty balance response ' + this.json (response));
        let result = { 'info': response };
        let balances = response;
        if (!Array.isArray (response))
            balances = [response];
        for (let i = 0; i < balances.length; i++) {
            let balance = balances[i];
            let currency = balance['currency'];
            if (currency in this.currencies_by_id)
                currency = this.currencies_by_id[currency]['code'];
            let account = {
                'free': parseFloat (balance['availableAmount']),
                'used': parseFloat (balance['used']),
                'total': parseFloat (balance['amount']),
            };
            result[currency] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        let request = {};
        await this.loadMarkets ();
        request['endpoint'] = this.marketId (symbol);
        if (typeof limit !== 'undefined')
            request['limit'] = limit;
        let signed = this.safeValue (params, 'signed', false);
        let orderbook = signed ? await this.privateGetOrderbook (request) : await this.publicGetOrderbook (request);
        if (typeof orderbook === 'undefined')
            return undefined;
        return this.parseOrderBook (orderbook, orderbook['timestamp'], 'bids', 'asks', 'price', 'amount');
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        let request = {};
        if (typeof symbol === 'undefined')
            throw new ExchangeError (this.id + ' please provide a symbol');
        market = this.market (symbol);
        request['endpoint'] = market['id'];
        if (typeof since !== 'undefined') {
            request['start'] = this.iso8601 (since);
            request['end'] = this.safeValue (params, 'end', this.iso8601 (this.nonce ()));
        }
        this.paramsToRequest (params, request, ['side', 'type']);
        if (typeof limit !== 'undefined')
            request['limit'] = limit;
        let response = await this.privateGetOrders (request);
        return this.parseOrders (response, market);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        let request = {};
        if (typeof symbol === 'undefined')
            throw new ExchangeError (this.id + ' please provide a symbol');
        market = this.market (symbol);
        request['endpoint'] = market['id'];
        if (typeof since !== 'undefined') {
            request['start'] = this.iso8601 (since);
            request['end'] = this.safeValue (params, 'end', this.iso8601 (this.nonce ()));
        }
        if (typeof limit !== 'undefined')
            request['limit'] = limit;
        this.paramsToRequest (params, request, ['side', 'type']);
        let response = await this.privateGetOrdersClosed (request);
        return this.parseOrders (response, market);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        let request = {};
        if (typeof symbol === 'undefined')
            throw new ExchangeError (this.id + ' please provide a symbol');
        market = this.market (symbol);
        request['endpoint'] = market['id'] + '/' + id;
        let response = await this.privateGetOrders (request);
        return this.parseOrder (response, undefined);
    }

    paramsToRequest (params, request, paramList) {
        for (let p = 0; p < paramList.length; p++) {
            let paramName = paramList[p];
            let param = this.safeValue (params, paramName);
            if (typeof param !== 'undefined')
                request[paramName] = param;
        }
    }

    parseOrderStatus (status) {
        let statuses = {
            'open': 'open',
            'new': 'open',
            'partiallyfilled': 'open',
            'filled': 'filled',
            'canceled': 'canceled',
            'rejected': 'canceled',
            'expired': 'canceled',
        };
        return this.safeString (statuses, status.toLowerCase ());
    }

    parseOrder (order, market = undefined) {
        if (typeof order === 'undefined')
            return undefined;
        let status = this.safeValue (order, 'status');
        if (typeof status !== 'undefined')
            status = this.parseOrderStatus (status);
        let symbol = undefined;
        if (market) {
            symbol = market['symbol'];
        } else {
            let id = order['symbol'];
            if (id in this.markets_by_id) {
                market = this.markets_by_id[id];
                symbol = market['symbol'];
            }
        }
        let timestamp = this.safeValue (order, 'timestamp') * 1000;
        let iso8601 = this.iso8601 (timestamp);
        let price = this.safeFloat (order, 'price');
        let amount = this.safeFloat (order, 'quantity');
        let filled = this.safeFloat (order, 'cumQty', 0.0);
        let remaining = this.safeFloat (order, 'remainingQtt', 0.0);
        if (typeof amount !== 'undefined') {
            if (typeof filled !== 'undefined') {
                filled = Math.max (amount - remaining, 0.0);
            }
        }
        let cost = undefined;
        if (typeof price !== 'undefined')
            if (typeof filled !== 'undefined')
                cost = price * filled;
        let result = {
            'info': order,
            'id': order['id'].toString (),
            'timestamp': timestamp,
            'datetime': iso8601,
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': order['type'].toLowerCase (),
            'side': order['side'].toLowerCase (),
            'price': price,
            'amount': amount,
            'cost': cost,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': undefined,
        };
        return result;
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let symbol = undefined;
        if (typeof symbols === 'string') {
            symbol = symbols;
        } else if (typeof symbols !== 'undefined') {
            symbol = symbols[0];
        }
        if (typeof symbol !== 'undefined') {
            let market = this.market (symbol);
            params['token'] = market['base'];
            params['against'] = market['quote'];
        }
        let signed = this.safeValue (params, 'signed', false);
        let tickers = signed ? await this.privateGetExchanges (params) : await this.publicGetExchanges (params);
        let result = {};
        for (let i = 0; i < tickers.length; i++) {
            let ticker = tickers[i];
            let parsedTicker = this.parseTicker (ticker);
            let symbol = parsedTicker['symbol'];
            result[symbol] = parsedTicker;
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        let tickers = await this.fetchTickers (symbol, params);
        return tickers[symbol];
    }

    parseTicker (ticker) {
        if (typeof ticker === 'undefined')
            return undefined;
        let symbol = undefined;
        let id = ticker['symbol'];
        if (id in this.markets_by_id) {
            let market = this.markets_by_id[id];
            symbol = market['symbol'];
        }
        let high = this.safeFloat (ticker, 'highPrice');
        let low = this.safeFloat (ticker, 'lowPrice');
        let open = this.safeFloat (ticker, 'openingPrice');
        let change = open - low;
        let last = this.safeFloat (ticker, 'lastPrice');
        return {
            'symbol': symbol,
            'timestamp': undefined,
            'datetime': undefined,
            'high': high,
            'low': low,
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': open,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': change,
            'percentage': this.safeFloat (ticker, 'change'),
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        if (typeof symbol === 'undefined')
            throw new ExchangeError (this.id + ' please provide a symbol');
        let market = this.market (symbol);
        let request = {};
        request['endpoint'] = market['id'];
        let fromId = this.safeValue (params, 'fromId', undefined);
        if (fromId) {
            request['fromId'] = fromId;
        } else if (since) {
            request['start'] = this.iso8601 (since);
            request['end'] = this.safeValue (params, 'end', this.iso8601 (this.nonce ()));
        }
        if (typeof limit !== 'undefined')
            request['limit'] = limit;
        let signed = this.safeValue (params, 'signed', false);
        let response = signed ? await this.privateGetTradehistory (this.extend (request)) :
            await this.publicGetTradehistory (this.extend (request));
        return this.parseTrades (response, market);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        if (typeof symbol === 'undefined')
            throw new ExchangeError (this.id + ' please provide a symbol');
        let market = this.market (symbol);
        let request = {};
        request['endpoint'] = market['id'];
        if (since) {
            request['start'] = this.iso8601 (since);
            request['end'] = this.safeValue (params, 'end', this.iso8601 (this.nonce ()));
        }
        if (typeof limit !== 'undefined')
            request['limit'] = limit;
        this.paramsToRequest (params, request, ['side']);
        let response = await this.privateGetTrades (this.extend (request));
        return this.parseTrades (response, market, since, limit);
    }

    parseTrade (trade, market = undefined) {
        let timestamp = this.parse8601 (trade['timestamp']) * 1000;
        let symbol = undefined;
        if (!market) {
            if ('symbol' in trade)
                market = this.markets_by_id[trade['symbol']];
        }
        if (market)
            symbol = market['symbol'];
        return {
            'id': trade['id'],
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': undefined,
            'type': undefined,
            'side': trade['side'].toLowerCase (),
            'price': trade['price'],
            'amount': trade['amount'],
        };
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let order = {
            'symbol': this.marketId (symbol),
            'side': side.toLowerCase (),
            'quantity': amount,
            'type': type.toLowerCase (),
        };
        if (type === 'market') {
            order['price'] = this.nonce ().toString ();
        } else {
            order['price'] = this.priceToPrecision (symbol, price);
        }
        let response = await this.privatePostOrdersNew (order);
        let result = this.parseOrder (response);
        let id = result['id'];
        this.orders[id] = result;
        return this.extend ({ 'info': response }, result);
    }

    async createLimitBuyOrder (symbol, amount, price, params = {}) {
        return await this.createOrder (symbol, 'limit', 'buy', amount, price, params);
    }

    async createLimitSellOrder (symbol, amount, price, params = {}) {
        return await this.createOrder (symbol, 'limit', 'sell', amount, price, params);
    }

    async createMarketBuyOrder (symbol, amount, params = {}) {
        return await this.createOrder (symbol, 'market', 'buy', amount, 0.1, params);
    }

    async createMarketSellOrder (symbol, amount, params = {}) {
        return await this.createOrder (symbol, 'market', 'sell', amount, 0.1, params);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        if (typeof id === 'undefined')
            throw new ExchangeError (this.id + ' please provide an order id');
        if (typeof symbol === 'undefined')
            throw new ExchangeError (this.id + ' please provide a symbol');
        let market = this.market (symbol);
        let request = {};
        request['endpoint'] = market['id'] + '/' + id;
        let response = await this.privatePutOrdersCancel (request);
        let order = this.parseOrder (response);
        this.orders[order['id']] = order;
        return this.extend ({ 'info': response }, order);
    }

    isFiat (currency) {
        if (currency === 'EURT')
            return true;
        if (currency === 'USDT')
            return true;
        return false;
    }

    handleErrors (code, reason, url, method, headers, body) {
        if (code === 429)
            throw new DDoSProtection (this.id + ' ' + JSON.parse (body));
        if (code >= 400) {
            if ((body[0] === '{') || (body[0] === '[')) {
                let response = JSON.parse (body);
                let feedback = this.id + ' ' + this.json (response);
                let message = this.safeValue (response, 'message');
                if (message.indexOf ('Insufficient') >= 0) {
                    throw new InsufficientFunds (feedback);
                } else if (message.indexOf ('no order Id provided') >= 0) {
                    throw new OrderNotFound (feedback);
                } else if (message.indexOf ('cancel this order') >= 0) {
                    throw new InvalidOrder (feedback);
                } else if (message.indexOf ('Order not found') >= 0) {
                    throw new InvalidOrder (feedback);
                } else if (message.indexOf ('the order book') >= 0) {
                    throw new InvalidOrder (feedback);
                } else if (message.indexOf ('Order value has changed') >= 0) {
                    throw new InvalidOrder (feedback);
                } else if (message.indexOf ('create order') >= 0) {
                    throw new InvalidOrder (feedback);
                } else if (message.indexOf ('Minimum Order Size') >= 0) {
                    throw new InvalidOrder (feedback);
                } else if (message.indexOf ('Missing API Key') >= 0) {
                    throw new AuthenticationError (feedback);
                } else if (message.indexOf ('Missing API signature') >= 0) {
                    throw new AuthenticationError (feedback);
                } else if (message.indexOf ('Missing payload') >= 0) {
                    throw new AuthenticationError (feedback);
                } else if (message.indexOf ('BAD API signature') >= 0) {
                    throw new AuthenticationError (feedback);
                } else if (message.indexOf ('Unknown user or API Key') >= 0) {
                    throw new AuthenticationError (feedback);
                } else if (message.indexOf ('no symbol provided') >= 0) {
                    throw new ExchangeError (feedback);
                } else if (message.indexOf ('Unknown symbol') >= 0) {
                    throw new ExchangeError (feedback);
                } else if (message.indexOf ('Unknown coin') >= 0) {
                    throw new ExchangeError (feedback);
                } else if (message.indexOf ('country is restricted') >= 0) {
                    throw new ExchangeError (feedback);
                } else if (message.indexOf ('ValidationError') >= 0) {
                    throw new ExchangeError (feedback);
                }
                throw new ExchangeError (this.id + ': unknown error: ' + this.json (response));
            }
        }
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let endpoint = '';
        let parameters = this.omit (params, ['signed']);
        if (Object.keys (params).length) {
            endpoint = this.safeValue (params, 'endpoint', '');
            if (endpoint !== '') {
                endpoint = '/' + endpoint;
                parameters = this.omit (params, ['endpoint', 'signed']);
            }
        }
        let query = '/' + this.version + '/' + path + endpoint;
        if (method === 'GET')
            if (Object.keys (parameters).length)
                query += '?' + this.urlencode (parameters);
        let url = this.urls['api'] + query;
        if (api === 'private') {
            this.checkRequiredCredentials ();
            let auth = method + query;
            if (method === 'POST' || method === 'PUT') {
                if (Object.keys (parameters).length) {
                    body = this.json (parameters);
                    auth += body;
                }
            }
            let payload = this.stringToBase64 (auth);
            let secret = this.encode (this.secret);
            let signature = this.hmac (payload, secret, 'sha384');
            headers = {
                'Content-Type': 'application/json',
                'x-neb-apikey': this.apiKey,
                'x-neb-payload': this.decode (payload),
                'x-neb-signature': signature,
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
};
