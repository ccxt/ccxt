'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { InvalidNonce, OrderNotFound, InvalidOrder, InsufficientFunds, AuthenticationError } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class qryptos extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'qryptos',
            'name': 'QRYPTOS',
            'countries': [ 'CN', 'TW' ],
            'version': '2',
            'rateLimit': 1000,
            'has': {
                'CORS': false,
                'fetchTickers': true,
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
                'fetchMyTrades': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/30953915-b1611dc0-a436-11e7-8947-c95bd5a42086.jpg',
                'api': 'https://api.qryptos.com',
                'www': 'https://www.qryptos.com',
                'doc': [
                    'https://developers.quoine.com',
                    'https://developers.quoine.com/v2',
                ],
                'fees': 'https://qryptos.zendesk.com/hc/en-us/articles/115007858167-Fees',
            },
            'api': {
                'public': {
                    'get': [
                        'products',
                        'products/{id}',
                        'products/{id}/price_levels',
                        'executions',
                        'ir_ladders/{currency}',
                    ],
                },
                'private': {
                    'get': [
                        'accounts/balance',
                        'accounts/main_asset',
                        'crypto_accounts',
                        'executions/me',
                        'fiat_accounts',
                        'loan_bids',
                        'loans',
                        'orders',
                        'orders/{id}',
                        'orders/{id}/trades',
                        'orders/{id}/executions',
                        'trades',
                        'trades/{id}/loans',
                        'trading_accounts',
                        'trading_accounts/{id}',
                    ],
                    'post': [
                        'fiat_accounts',
                        'loan_bids',
                        'orders',
                    ],
                    'put': [
                        'loan_bids/{id}/close',
                        'loans/{id}',
                        'orders/{id}',
                        'orders/{id}/cancel',
                        'trades/{id}',
                        'trades/{id}/close',
                        'trades/close_all',
                        'trading_accounts/{id}',
                    ],
                },
            },
            'skipJsonOnStatusCodes': [401],
            'exceptions': {
                'messages': {
                    'API Authentication failed': AuthenticationError,
                    'Nonce is too small': InvalidNonce,
                    'Order not found': OrderNotFound,
                    'user': {
                        'not_enough_free_balance': InsufficientFunds,
                    },
                    'price': {
                        'must_be_positive': InvalidOrder,
                    },
                    'quantity': {
                        'less_than_order_size': InvalidOrder,
                    },
                },
            },
        });
    }

    async fetchMarkets () {
        let markets = await this.publicGetProducts ();
        let result = [];
        for (let p = 0; p < markets.length; p++) {
            let market = markets[p];
            let id = market['id'].toString ();
            let base = market['base_currency'];
            let quote = market['quoted_currency'];
            let symbol = base + '/' + quote;
            let maker = this.safeFloat (market, 'maker_fee');
            let taker = this.safeFloat (market, 'taker_fee');
            let active = !market['disabled'];
            let minAmount = undefined;
            let minPrice = undefined;
            if (base === 'BTC') {
                minAmount = 0.001;
            } else if (base === 'ETH') {
                minAmount = 0.01;
            }
            if (quote === 'BTC') {
                minPrice = 0.00000001;
            } else if (quote === 'ETH' || quote === 'USD' || quote === 'JPY') {
                minPrice = 0.00001;
            }
            let limits = {
                'amount': { 'min': minAmount },
                'price': { 'min': minPrice },
                'cost': { 'min': undefined },
            };
            if (typeof minPrice !== 'undefined')
                if (typeof minAmount !== 'undefined')
                    limits['cost']['min'] = minPrice * minAmount;
            let precision = {
                'amount': undefined,
                'price': undefined,
            };
            if (typeof minAmount !== 'undefined')
                precision['amount'] = -Math.log10 (minAmount);
            if (typeof minPrice !== 'undefined')
                precision['price'] = -Math.log10 (minPrice);
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'maker': maker,
                'taker': taker,
                'limits': limits,
                'precision': precision,
                'active': active,
                'info': market,
            });
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let balances = await this.privateGetAccountsBalance (params);
        let result = { 'info': balances };
        for (let b = 0; b < balances.length; b++) {
            let balance = balances[b];
            let currency = balance['currency'];
            let total = parseFloat (balance['balance']);
            let account = {
                'free': total,
                'used': 0.0,
                'total': total,
            };
            result[currency] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let orderbook = await this.publicGetProductsIdPriceLevels (this.extend ({
            'id': this.marketId (symbol),
        }, params));
        return this.parseOrderBook (orderbook, undefined, 'buy_price_levels', 'sell_price_levels');
    }

    parseTicker (ticker, market = undefined) {
        let timestamp = this.milliseconds ();
        let last = undefined;
        if ('last_traded_price' in ticker) {
            if (ticker['last_traded_price']) {
                let length = ticker['last_traded_price'].length;
                if (length > 0)
                    last = this.safeFloat (ticker, 'last_traded_price');
            }
        }
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high_market_ask'),
            'low': this.safeFloat (ticker, 'low_market_bid'),
            'bid': this.safeFloat (ticker, 'market_bid'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'market_ask'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'volume_24h'),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let tickers = await this.publicGetProducts (params);
        let result = {};
        for (let t = 0; t < tickers.length; t++) {
            let ticker = tickers[t];
            let base = ticker['base_currency'];
            let quote = ticker['quoted_currency'];
            let symbol = base + '/' + quote;
            let market = this.markets[symbol];
            result[symbol] = this.parseTicker (ticker, market);
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let ticker = await this.publicGetProductsId (this.extend ({
            'id': market['id'],
        }, params));
        return this.parseTicker (ticker, market);
    }

    parseTrade (trade, market) {
        // {             id:  12345,
        //         quantity: "6.789",
        //            price: "98765.4321",
        //       taker_side: "sell",
        //       created_at:  1512345678,
        //          my_side: "buy"           }
        let timestamp = trade['created_at'] * 1000;
        // 'taker_side' gets filled for both fetchTrades and fetchMyTrades
        let takerSide = this.safeString (trade, 'taker_side');
        // 'my_side' gets filled for fetchMyTrades only and may differ from 'taker_side'
        let mySide = this.safeString (trade, 'my_side');
        let side = (typeof mySide !== 'undefined') ? mySide : takerSide;
        let takerOrMaker = undefined;
        if (typeof mySide !== 'undefined')
            takerOrMaker = (takerSide === mySide) ? 'taker' : 'maker';
        return {
            'info': trade,
            'id': trade['id'].toString (),
            'order': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': this.safeFloat (trade, 'price'),
            'amount': this.safeFloat (trade, 'quantity'),
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'product_id': market['id'],
        };
        if (typeof limit !== 'undefined')
            request['limit'] = limit;
        let response = await this.publicGetExecutions (this.extend (request, params));
        return this.parseTrades (response['models'], market, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'product_id': market['id'],
        };
        if (typeof limit !== 'undefined')
            request['limit'] = limit;
        let response = await this.privateGetExecutionsMe (this.extend (request, params));
        return this.parseTrades (response['models'], market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let order = {
            'order_type': type,
            'product_id': this.marketId (symbol),
            'side': side,
            'quantity': amount,
        };
        if (type === 'limit')
            order['price'] = price;
        let response = await this.privatePostOrders (this.extend (order, params));
        return this.parseOrder (response);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let result = await this.privatePutOrdersIdCancel (this.extend ({
            'id': id,
        }, params));
        let order = this.parseOrder (result);
        if (order['status'] === 'closed')
            throw new OrderNotFound (this.id + ' ' + this.json (order));
        return order;
    }

    parseOrder (order, market = undefined) {
        let timestamp = order['created_at'] * 1000;
        let marketId = this.safeString (order, 'product_id');
        if (typeof marketId !== 'undefined') {
            if (marketId in this.markets_by_id)
                market = this.markets_by_id[marketId];
        }
        let status = undefined;
        if ('status' in order) {
            if (order['status'] === 'live') {
                status = 'open';
            } else if (order['status'] === 'filled') {
                status = 'closed';
            } else if (order['status'] === 'cancelled') { // 'll' intended
                status = 'canceled';
            }
        }
        let amount = this.safeFloat (order, 'quantity');
        let filled = this.safeFloat (order, 'filled_quantity');
        let price = this.safeFloat (order, 'price');
        let symbol = undefined;
        if (market) {
            symbol = market['symbol'];
        }
        return {
            'id': order['id'].toString (),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'type': order['order_type'],
            'status': status,
            'symbol': symbol,
            'side': order['side'],
            'price': price,
            'amount': amount,
            'filled': filled,
            'remaining': amount - filled,
            'trades': undefined,
            'fee': {
                'currency': undefined,
                'cost': this.safeFloat (order, 'order_fee'),
            },
            'info': order,
        };
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let order = await this.privateGetOrdersId (this.extend ({
            'id': id,
        }, params));
        return this.parseOrder (order);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        let request = {};
        if (symbol) {
            market = this.market (symbol);
            request['product_id'] = market['id'];
        }
        let status = this.safeValue (params, 'status');
        if (status) {
            params = this.omit (params, 'status');
            if (status === 'open') {
                request['status'] = 'live';
            } else if (status === 'closed') {
                request['status'] = 'filled';
            } else if (status === 'canceled') {
                request['status'] = 'cancelled';
            }
        }
        if (typeof limit !== 'undefined')
            request['limit'] = limit;
        let result = await this.privateGetOrders (this.extend (request, params));
        let orders = result['models'];
        return this.parseOrders (orders, market, since, limit);
    }

    fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return this.fetchOrders (symbol, since, limit, this.extend ({ 'status': 'open' }, params));
    }

    fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return this.fetchOrders (symbol, since, limit, this.extend ({ 'status': 'closed' }, params));
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        headers = {
            'X-Quoine-API-Version': this.version,
            'Content-Type': 'application/json',
        };
        if (api === 'public') {
            if (Object.keys (query).length)
                url += '?' + this.urlencode (query);
        } else {
            this.checkRequiredCredentials ();
            if (method === 'GET') {
                if (Object.keys (query).length)
                    url += '?' + this.urlencode (query);
            } else if (Object.keys (query).length) {
                body = this.json (query);
            }
            let nonce = this.nonce ();
            let request = {
                'path': url,
                'nonce': nonce,
                'token_id': this.apiKey,
                'iat': Math.floor (nonce / 1000), // issued at
            };
            headers['X-Quoine-Auth'] = this.jwt (request, this.secret);
        }
        url = this.urls['api'] + url;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response = undefined) {
        if (code >= 200 && code <= 299)
            return;
        const messages = this.exceptions['messages'];
        if (code === 401) {
            // expected non-json response
            if (body in messages)
                throw new messages[body] (this.id + ' ' + body);
            else
                return;
        }
        if (typeof response === 'undefined')
            if ((body[0] === '{') || (body[0] === '['))
                response = JSON.parse (body);
            else
                return;
        const feedback = this.id + ' ' + this.json (response);
        if (code === 404) {
            // { "message": "Order not found" }
            const message = this.safeString (response, 'message');
            if (message in messages)
                throw new messages[message] (feedback);
        } else if (code === 422) {
            // array of error messages is returned in 'user' or 'quantity' property of 'errors' object, e.g.:
            // { "errors": { "user": ["not_enough_free_balance"] }}
            // { "errors": { "quantity": ["less_than_order_size"] }}
            if ('errors' in response) {
                const errors = response['errors'];
                const errorTypes = ['user', 'quantity', 'price'];
                for (let i = 0; i < errorTypes.length; i++) {
                    const errorType = errorTypes[i];
                    if (errorType in errors) {
                        const errorMessages = errors[errorType];
                        for (let j = 0; j < errorMessages.length; j++) {
                            const message = errorMessages[j];
                            if (message in messages[errorType])
                                throw new messages[errorType][message] (feedback);
                        }
                    }
                }
            }
        }
    }
};
