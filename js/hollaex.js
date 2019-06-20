'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { BadRequest, AuthenticationError, NetworkError, ArgumentsRequired, OrderNotFound } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class hollaex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'hollaex',
            'name': 'HollaEx',
            'countries': [ 'KR' ],
            'rateLimit': 333,
            'version': 'v0',
            'has': {
                // fetchDepositAddress user info
                // fetchBidsAsks
                'CORS': false,
                'fetchMarkets': true,
                'fetchTicker': true,
                //fetchTickers
                'fetchOrderBook': true,
                'fetchTrades': true,
                'fetchBalance': true,
                'createOrder': true,
                'cancelOrder': true,
                //fetchOpenOrders
                'fetchOrder': true,
                //fetchDeposits
                //fetchWithdrawls
                'fetchOrders': true,
                'fetchMyTrades': true,
                'withdraw': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/10441291/59487066-8058b500-8eb6-11e9-82fd-c9157b18c2d8.jpg',
                'api': 'https://api.hollaex.com',
                'www': 'https://hollaex.com',
                'doc': 'https://apidocs.hollaex.com',
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': false,
            },
            'api': {
                'public': {
                    'get': [
                        'ticker',
                        'orderbooks',
                        'trades',
                        'constant',
                    ],
                },
                'private': {
                    'get': [
                        'user',
                        'user/balance',
                        'user/trades',
                        'user/orders',
                        'user/orders/{orderId}',
                    ],
                    'post': [
                        'user/request-withdrawal',
                        'order',
                    ],
                    'delete': [
                        'user/orders/{orderId}',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                },
            },
            'exceptions': {
                'Order not found': OrderNotFound,
                '400': BadRequest,
                '403': AuthenticationError,
                '404': BadRequest,
                '405': BadRequest,
                '410': BadRequest,
                '429': BadRequest,
                '500': NetworkError,
                '503': NetworkError,
            },
        });
    }

    async fetchMarkets (params = {}) {
        let response = await this.publicGetConstant ();
        let markets = this.safeValue (response, 'pairs');
        let keys = Object.keys (markets);
        let result = [];
        for (let i = 0; i < keys.length; i++) {
            let id = keys[i];
            let market = markets[id];
            let baseId = market['pair_base'];
            let quoteId = market['pair_2'];
            let tickSize = market['tick_size'];
            let pricePrecision = 0;
            for (let i = 1; i >= 0 && tickSize < 1; i++) {
                tickSize = tickSize * 10;
                pricePrecision = i;
            }
            let minAmount = market['min_size'];
            let amountPrecision = 0;
            for (let i = 1; i >= 0 && minAmount < 1; i++) {
                minAmount = minAmount * 10;
                amountPrecision = i;
            }
            let precision = {
                'cost': undefined,
                'price': pricePrecision,
                'amount': amountPrecision,
            };
            if (quoteId === 'fiat') {
                quoteId = 'eur';
                precision['price'] = 2;
            }
            let base = this.commonCurrencyCode (baseId).toUpperCase ();
            let quote = this.commonCurrencyCode (quoteId).toUpperCase ();
            let symbol = base + '/' + quote;
            let active = true;
            let limits = {
                'amount': {
                    'min': market['min_size'],
                    'max': market['max_size'],
                },
                'price': {
                    'min': market['min_price'],
                    'max': market['max_price'],
                },
                'cost': undefined,
            };
            let info = market;
            let entry = {
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': active,
                'precision': precision,
                'limits': limits,
                'info': info,
            };
            result.push (entry);
        }
        return result;
    }

    async fetchOrderBook (symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrderBook requires a symbol argument');
        }
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'symbol': market['id'],
        };
        let response = await this.publicGetOrderbooks (this.extend (request, params));
        response = response[market['id']];
        let datetime = this.safeString (response, 'timestamp');
        let timestamp = this.parse8601 (datetime);
        let result = {
            'bids': response['bids'],
            'asks': response['asks'],
            'timestamp': timestamp,
            'datetime': datetime,
            'nonce': Date.now (),
        };
        return result;
    }

    async fetchTicker (symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchTicker requires a symbol argument');
        }
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'symbol': market['id'],
        };
        let response = await this.publicGetTicker (this.extend (request, params));
        return this.parseTicker (response, market);
    }

    parseTicker (response, market = undefined) {
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        let info = response;
        let datetime = this.safeString (response, 'timestamp');
        let timestamp = this.parse8601 (datetime);
        let high = this.safeFloat (response, 'high');
        let low = this.safeFloat (response, 'low');
        let bid = undefined;
        let bidVolume = undefined;
        let ask = undefined;
        let askVolume = undefined;
        let vwap = undefined;
        let open = this.safeFloat (response, 'open');
        let close = this.safeFloat (response, 'close');
        let last = this.safeFloat (response, 'last');
        let previousClose = undefined;
        let change = undefined;
        let percentage = undefined;
        let average = undefined;
        let baseVolume = this.safeFloat (response, 'volume');
        let quoteVolume = undefined;
        let result = {
            'symbol': symbol,
            'info': info,
            'timestamp': timestamp,
            'datetime': datetime,
            'high': high,
            'low': low,
            'bid': bid,
            'bidVolume': bidVolume,
            'ask': ask,
            'askVolume': askVolume,
            'vwap': vwap,
            'open': open,
            'close': close,
            'last': last,
            'previousClose': previousClose,
            'change': change,
            'percentage': percentage,
            'average': average,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
        };
        return result;
    }

    async fetchTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchTrades requires a symbol argument');
        }
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'symbol': market['id'],
        };
        let response = await this.publicGetTrades (this.extend (request, params));
        return this.parseTrades (response[market['id']], market);
    }

    parseTrade (trade, market = undefined) {
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        let info = trade;
        let id = undefined;
        let datetime = this.safeString (trade, 'timestamp');
        let timestamp = this.parse8601 (datetime);
        let order = undefined;
        let type = undefined;
        let side = this.safeString (trade, 'side');
        let takerOrMaker = undefined;
        let price = this.safeFloat (trade, 'price');
        let amount = this.safeFloat (trade, 'size');
        let cost = parseFloat (this.amountToPrecision (symbol, price * amount));
        let fee = undefined;
        let result = {
            'info': info,
            'id': id,
            'timestamp': timestamp,
            'datetime': datetime,
            'symbol': symbol,
            'order': order,
            'type': type,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
        };
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privateGetUserBalance (params);
        let result = {
            'info': response,
            'free': undefined,
            'used': undefined,
            'total': undefined,
        };
        let free = {};
        let used = {};
        let total = {};
        let currencyId = Object.keys (this.currencies_by_id);
        for (let i = 0; i < currencyId.length; i++) {
            let currency = this.currencies_by_id[currencyId[i]]['code'];
            let responseCurr = currencyId[i];
            if (responseCurr === 'eur') {
                responseCurr = 'fiat';
            }
            free[currency] = response[responseCurr + '_available'];
            total[currency] = response[responseCurr + '_balance'];
            used[currency] = parseFloat (this.currencyToPrecision (currency, total[currency] - free[currency]));
            result[currency] = {
                'free': free[currency],
                'used': used[currency],
                'total': total[currency],
            };
        }
        result['free'] = free;
        result['used'] = used;
        result['total'] = total;
        return result;
    }

    async fetchOrder (id = undefined, symbol = undefined, params = {}) {
        if (id === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder requires an orderId argument');
        }
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder requires a symbol argument');
        }
        await this.loadMarkets ();
        let market = this.market (symbol);
        let orderId = this.safeValue (params, 'orderId');
        let request = {
            'orderId': orderId,
        };
        if (orderId === undefined) {
            request['orderId'] = id;
        }
        let response = await this.privateGetUserOrdersOrderId (this.extend (request, params));
        if (symbol !== this.markets_by_id[response['symbol']]['symbol']) {
            throw new BadRequest (this.id + ' symbol argument does not match order symbol');
        }
        return this.parseOrder (response, market);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrders requires a symbol argument');
        }
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'symbol': market['id'],
        };
        let response = await this.privateGetUserOrders (this.extend (request, params));
        return this.parseOrders (response, market);
    }

    parseOrder (order, market = undefined) {
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        let id = this.safeString (order, 'id');
        let datetime = this.safeString (order, 'created_at');
        let timestamp = this.parse8601 (datetime);
        let lastTradeTimestamp = undefined;
        let type = this.safeString (order, 'type');
        let side = this.safeString (order, 'side');
        let price = this.safeFloat (order, 'price');
        let amount = this.safeFloat (order, 'size');
        let filled = this.safeFloat (order, 'filled');
        let remaining = parseFloat (this.amountToPrecision (symbol, amount - filled));
        let cost = undefined;
        let status = 'open';
        if (type === 'market') {
            status = 'closed';
        } else {
            cost = parseFloat (this.priceToPrecision (symbol, filled * price));
        }
        let trades = undefined;
        let fee = undefined;
        let info = order;
        let result = {
            'id': id,
            'datetime': datetime,
            'timestamp': timestamp,
            'lastTradeTimestamp': lastTradeTimestamp,
            'status': status,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'cost': cost,
            'trades': trades,
            'fee': fee,
            'info': info,
        };
        return result;
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let order = {
            'symbol': market['id'],
            'side': side,
            'size': amount,
            'type': type,
            'price': price,
        };
        let response = await this.privatePostOrder (this.extend (order, params));
        response['created_at'] = this.iso8601 (this.milliseconds ());
        return this.parseOrder (response, market);
    }

    async cancelOrder (id = undefined, symbol = undefined, params = {}) {
        if (id === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder requires an id argument');
        }
        let request = {
            'orderId': id,
        };
        let response = await this.privateDeleteUserOrdersOrderId (this.extend (request, params));
        return this.parseOrder (response);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades requires a symbol argument');
        }
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let response = await this.privateGetUserTrades (this.extend (request, params));
        return this.parseTrades (response['data'], market, since, limit);
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        await this.loadMarkets ();
        let currency = this.currencies[code]['id'];
        let request = {
            'currency': currency,
            'amount': amount,
            'address': address,
        };
        let response = await this.privatePostUserRequestWithdrawal (this.extend (request, params));
        return {
            'info': response,
            'id': undefined,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.version;
        if (api === 'public') {
            const query = this.omit (params, this.extractParams (path));
            url += '/' + this.implodeParams (path, params);
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else if (api === 'private') {
            this.checkRequiredCredentials ();
            const query = this.omit (params, this.extractParams (path));
            url += '/' + this.implodeParams (path, params);
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
            let accessToken = 'Bearer ' + this.apiKey;
            headers = {
                'Content-Type': 'application/json',
                'Authorization': accessToken,
            };
            if (method === 'POST' || method === 'PUT' || method === 'DELETE') {
                if (Object.keys (params).length) {
                    body = this.json (params);
                }
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response) {
        if (code >= 400 && code <= 503) {
            const exceptions = this.exceptions;
            const message = this.safeString (response, 'message');
            const keys = Object.keys (exceptions);
            if (keys.indexOf (message) !== -1) {
                const ExceptionClass = exceptions[message];
                throw new ExceptionClass (this.id + ' ' + message);
            }
            let status = code.toString ();
            if (keys.indexOf (status) !== -1) {
                const ExceptionClass = exceptions[status];
                throw new ExceptionClass (this.id + ' ' + message);
            }
        }
    }
};
