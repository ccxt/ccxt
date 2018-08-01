'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, DDoSProtection, AuthenticationError, PermissionDenied } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class nebula extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'nebula',
            'name': 'nebula',
            'countries': [ 'FR' ],
            'version': 'v1',
            'userAgent': undefined,
            'rateLimit': 2000,
            'has': {
                'CORS': false,
                'fetchOHLCV': false,
                'cancelOrder': true,
                'createOrder': true,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
                'fetchOrders': false,
                'fetchOrder': false,
                'fetchTickers': true,
                'fetchTrades': true,
                'fetchOrderBook': true,
                'fetchMyTrades': true,
                'fetchL2OrderBook': true,
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
                        'orders',
                        'orders/closed',
                        'orders/canceled',
                        'trades',
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
                'taker': market['takerFee'],
                'maker': market['makerFee'],
                'info': market,
            });
        }
        return result;
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
            request['end'] = params['end'] || this.iso8601 (this.nonce ());
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
            request['end'] = params['end'] || this.iso8601 (this.nonce ());
        }
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
        let [response] = await this.privateGetOrders (request);
        return this.parseOrder (response, undefined);
    }

    paramsToRequest (params, request, paramList) {
        for (let p = 0; p < paramList.length; p++) {
            let paramName = paramList[p];
            let param = params[paramName];
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
        let tickers = await this.publicGetExchanges (params);
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
        if (typeof params['fromId'] !== 'undefined') {
            request['fromId'] = params.fromId;
        } else if (since) {
            request['start'] = this.iso8601 (since);
            request['end'] = params['end'] || this.iso8601 (this.nonce ());
        }
        if (typeof limit !== 'undefined')
            request['limit'] = limit;
        let response = await this.publicGetTradehistory (this.extend (request));
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
            request['end'] = params['end'] || this.iso8601 (this.nonce ());
        }
        if (typeof limit !== 'undefined')
            request['limit'] = limit;
        if (typeof params['side'] !== 'undefined')
            request['side'] = params['side'];
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
            throw new DDoSProtection (this.id + ' ' + body);
        if (code >= 400) {
            if (body) {
                if (body[0] === '{') {
                    let response = JSON.parse (body);
                    if ('error' in response) {
                        if ('message' in response['error']) {
                            let feedback = this.id + ' ' + this.json (response);
                            let message = this.safeValue (response['error'], 'message');
                            let exceptions = this.exceptions;
                            if (typeof message !== 'undefined') {
                                if (message in exceptions) {
                                    throw new exceptions[message] (feedback);
                                }
                            }
                            throw new ExchangeError (feedback);
                        }
                    }
                }
            }
        }
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let endpoint = '';
        let parameters = params;
        if (Object.keys (params).length && params['endpoint']) {
            endpoint = '/' + params['endpoint'];
            parameters = this.omit (params, ['endpoint']);
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
