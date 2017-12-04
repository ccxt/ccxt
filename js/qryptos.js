"use strict";

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange')
const { ExchangeError, OrderNotFound, InsufficientFunds } = require ('./base/errors')

//  ---------------------------------------------------------------------------

module.exports = class qryptos extends Exchange {

    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'qryptos',
            'name': 'QRYPTOS',
            'countries': [ 'CN', 'TW' ],
            'version': '2',
            'rateLimit': 1000,
            'hasFetchTickers': true,
            'hasCORS': false,
            'has': {
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/30953915-b1611dc0-a436-11e7-8947-c95bd5a42086.jpg',
                'api': 'https://api.qryptos.com',
                'www': 'https://www.qryptos.com',
                'doc': 'https://developers.quoine.com',
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
                        'crypto_accounts',
                        'executions/me',
                        'fiat_accounts',
                        'loan_bids',
                        'loans',
                        'orders',
                        'orders/{id}',
                        'orders/{id}/trades',
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
        });
    }

    async fetchMarkets () {
        let markets = await this.publicGetProducts ();
        let result = [];
        for (let p = 0; p < markets.length; p++) {
            let market = markets[p];
            let id = market['id'];
            let base = market['base_currency'];
            let quote = market['quoted_currency'];
            let symbol = base + '/' + quote;
            let maker = parseFloat (market['maker_fee']);
            let taker = parseFloat (market['taker_fee']);
            let active = !market['disabled'];
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'maker': maker,
                'taker': taker,
                'active': active,
                'info': market,
            });
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let balances = await this.privateGetAccountsBalance ();
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

    async fetchOrderBook (symbol, params = {}) {
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
                    last = parseFloat (ticker['last_traded_price']);
            }
        }
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': parseFloat (ticker['high_market_ask']),
            'low': parseFloat (ticker['low_market_bid']),
            'bid': parseFloat (ticker['market_bid']),
            'ask': parseFloat (ticker['market_ask']),
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'first': undefined,
            'last': last,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': parseFloat (ticker['volume_24h']),
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
        let timestamp = trade['created_at'] * 1000;
        return {
            'info': trade,
            'id': trade['id'].toString (),
            'order': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'side': trade['taker_side'],
            'price': parseFloat (trade['price']),
            'amount': parseFloat (trade['quantity']),
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'product_id': market['id'],
        };
        if (limit)
            request['limit'] = limit;
        let response = await this.publicGetExecutions (this.extend (request, params));
        return this.parseTrades (response['models'], market);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let order = {
            'order_type': type,
            'product_id': this.marketId (symbol),
            'side': side,
            'quantity': amount,
        };
        if (type == 'limit')
            order['price'] = price;
        let response = await this.privatePostOrders (this.extend ({
            'order': order,
        }, params));
        let id = undefined;
        if ('id' in response)
            id = response['id'].toString ();
        return {
            'info': response,
            'id': id,
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        return await this.privatePutOrdersIdCancel (this.extend ({
            'id': id,
        }, params));
    }

    parseOrder (order) {
        let timestamp = order['created_at'] * 1000;
        let marketId = order['product_id'];
        let market = this.marketsById[marketId];
        let status = undefined;
        if ('status' in order) {
            if (order['status'] == 'live') {
                status = 'open';
            } else if (order['status'] == 'filled') {
                status = 'closed';
            } else if (order['status'] == 'cancelled') { // 'll' intended
                status = 'canceled';
            }
        }
        let amount = parseFloat (order['quantity']);
        let filled = parseFloat (order['filled_quantity']);
        return {
            'id': order['id'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'type': order['order_type'],
            'status': status,
            'symbol': market['symbol'],
            'side': order['side'],
            'price': order['price'],
            'amount': amount,
            'filled': filled,
            'remaining': amount - filled,
            'trades': undefined,
            'fee': {
                'currency': undefined,
                'cost': parseFloat (order['order_fee']),
            },
            'info': order,
        };
    }

    async fetchOrder (id) {
        await this.loadMarkets ();
        let order = await this.privateGetOrdersId ({ 'id': id });
        return this.parseOrder (order);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params={}) {
        await this.loadMarkets ();
        let market = undefined;
        let request = {};
        if (symbol) {
            market = this.market (symbol);
            request['product_id'] = market['id'];
        }
        let status = params['status'];
        if (status == 'open') {
            request['status'] = 'live';
        } else if (status == 'closed') {
            request['status'] = 'filled';
        } else if (status == 'canceled') {
            request['status'] = 'cancelled';
        }
        let result = await this.privateGetOrders (request);
        let orders = result['models'];
        return this.parseOrders (orders, market);
    }

    fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return this.fetchOrders (symbol, since, limit, this.extend ({ 'status': 'open' }, params));
    }

    fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return this.fetchOrders (symbol, since, limit, this.extend ({ 'status': 'open' }, params));
    }

    handleErrors (code, reason, url, method, headers, body) {
        let response = undefined;
        if (code == 200 || code == 404 || code == 422) {
            if ((body[0] == '{') || (body[0] == '[')) {
                response = JSON.parse (body);
            } else {
                // if not a JSON response
                throw new ExchangeError (this.id + ' returned a non-JSON reply: ' + body);
            }
        }
        if (code == 404) {
            if ('message' in response) {
                if (response['message'] == 'Order not found') {
                    throw new OrderNotFound (this.id + ' ' + body);
                }
            }
        } else if (code == 422) {
            if ('errors' in response) {
                let errors = response['errors'];
                if ('user' in errors) {
                    let messages = errors['user'];
                    if (messages.indexOf ('not_enough_free_balance') >= 0) {
                        throw new InsufficientFunds (this.id + ' ' + body);
                    }
                }
            }
        }
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
        if (api == 'public') {
            if (Object.keys (query).length)
                url += '?' + this.urlencode (query);
        } else {
            this.checkRequiredCredentials ();
            if (method == 'GET') {
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
}
