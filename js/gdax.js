"use strict";

// ----------------------------------------------------------------------------

const Exchange = require ('./base/Exchange')
const { ExchangeError, InvalidOrder, AuthenticationError, NotSupported } = require ('./base/errors')

// ----------------------------------------------------------------------------

module.exports = class gdax extends Exchange {

    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'gdax',
            'name': 'GDAX',
            'countries': 'US',
            'rateLimit': 1000,
            'hasCORS': true,
            'hasFetchOHLCV': true,
            'hasDeposit': true,
            'hasWithdraw': true,
            'hasFetchOrder': true,
            'hasFetchOrders': true,
            'hasFetchOpenOrders': true,
            'hasFetchClosedOrders': true,
            'timeframes': {
                '1m': 60,
                '5m': 300,
                '15m': 900,
                '30m': 1800,
                '1h': 3600,
                '2h': 7200,
                '4h': 14400,
                '12h': 43200,
                '1d': 86400,
                '1w': 604800,
                '1M': 2592000,
                '1y': 31536000,
            },
            'urls': {
                'test': 'https://api-public.sandbox.gdax.com',
                'logo': 'https://user-images.githubusercontent.com/1294454/27766527-b1be41c6-5edb-11e7-95f6-5b496c469e2c.jpg',
                'api': 'https://api.gdax.com',
                'www': 'https://www.gdax.com',
                'doc': 'https://docs.gdax.com',
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
                'password': true,
            },
            'api': {
                'public': {
                    'get': [
                        'currencies',
                        'products',
                        'products/{id}/book',
                        'products/{id}/candles',
                        'products/{id}/stats',
                        'products/{id}/ticker',
                        'products/{id}/trades',
                        'time',
                    ],
                },
                'private': {
                    'get': [
                        'accounts',
                        'accounts/{id}',
                        'accounts/{id}/holds',
                        'accounts/{id}/ledger',
                        'coinbase-accounts',
                        'fills',
                        'funding',
                        'orders',
                        'orders/{id}',
                        'payment-methods',
                        'position',
                        'reports/{id}',
                        'users/self/trailing-volume',
                    ],
                    'post': [
                        'deposits/coinbase-account',
                        'deposits/payment-method',
                        'funding/repay',
                        'orders',
                        'position/close',
                        'profiles/margin-transfer',
                        'reports',
                        'withdrawals/coinbase',
                        'withdrawals/crypto',
                        'withdrawals/payment-method',
                    ],
                    'delete': [
                        'orders',
                        'orders/{id}',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'maker': 0.0,
                    'taker': 0.25 / 100,
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
            let quote = market['quote_currency'];
            let symbol = base + '/' + quote;
            let amountLimits = {
                'min': market['base_min_size'],
                'max': market['base_max_size'],
            };
            let priceLimits = {
                'min': market['quote_increment'],
                'max': undefined,
            };
            let costLimits = {
                'min': priceLimits['min'],
                'max': undefined,
            };
            let limits = {
                'amount': amountLimits,
                'price': priceLimits,
                'cost': costLimits,
            };
            let precision = {
                'amount': -Math.log10 (parseFloat (amountLimits['min'])),
                'price': -Math.log10 (parseFloat (priceLimits['min'])),
            };
            let taker = this.fees['trading']['taker'];
            if ((base == 'ETH') || (base == 'LTC')) {
                taker = 0.003;
            }
            result.push (this.extend (this.fees['trading'], {
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': market,
                'precision': precision,
                'limits': limits,
                'taker': taker,
            }));
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let balances = await this.privateGetAccounts ();
        let result = { 'info': balances };
        for (let b = 0; b < balances.length; b++) {
            let balance = balances[b];
            let currency = balance['currency'];
            let account = {
                'free': parseFloat (balance['available']),
                'used': parseFloat (balance['hold']),
                'total': parseFloat (balance['balance']),
            };
            result[currency] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, params = {}) {
        await this.loadMarkets ();
        let orderbook = await this.publicGetProductsIdBook (this.extend ({
            'id': this.marketId (symbol),
            'level': 2, // 1 best bidask, 2 aggregated, 3 full
        }, params));
        return this.parseOrderBook (orderbook);
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = this.extend ({
            'id': market['id'],
        }, params);
        let ticker = await this.publicGetProductsIdTicker (request);
        let quote = await this.publicGetProductsIdStats (request);
        let timestamp = this.parse8601 (ticker['time']);
        let bid = undefined;
        let ask = undefined;
        if ('bid' in ticker)
            bid = parseFloat (ticker['bid']);
        if ('ask' in ticker)
            ask = parseFloat (ticker['ask']);
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': parseFloat (quote['high']),
            'low': parseFloat (quote['low']),
            'bid': bid,
            'ask': ask,
            'vwap': undefined,
            'open': parseFloat (quote['open']),
            'close': undefined,
            'first': undefined,
            'last': parseFloat (quote['last']),
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': parseFloat (ticker['volume']),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    parseTrade (trade, market = undefined) {
        let timestamp = this.parse8601 (trade['time']);
        let side = (trade['side'] == 'buy') ? 'sell' : 'buy';
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        return {
            'id': trade['trade_id'].toString (),
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': undefined,
            'side': side,
            'price': parseFloat (trade['price']),
            'amount': parseFloat (trade['size']),
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetProductsIdTrades (this.extend ({
            'id': market['id'], // fixes issue #2
        }, params));
        return this.parseTrades (response, market);
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        return [
            ohlcv[0] * 1000,
            ohlcv[3],
            ohlcv[2],
            ohlcv[1],
            ohlcv[4],
            ohlcv[5],
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let granularity = this.timeframes[timeframe];
        let request = {
            'id': market['id'],
            'granularity': granularity,
        };
        if (since) {
            request['start'] = this.iso8601 (since);
            if (!limit)
                limit = 200; // max = 200
            request['end'] = this.iso8601 (limit * granularity * 1000 + since);
        }
        let response = await this.publicGetProductsIdCandles (this.extend (request, params));
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    async fetchTime () {
        let response = this.publicGetTime ();
        return this.parse8601 (response['iso']);
    }

    getOrderStatus (status) {
        let statuses = {
            'pending': 'open',
            'active': 'open',
            'open': 'open',
            'done': 'closed',
            'canceled': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        let timestamp = this.parse8601 (order['created_at']);
        let symbol = undefined;
        if (!market) {
            if (order['product_id'] in this.markets_by_id)
                market = this.markets_by_id[order['product_id']];
        }
        let status = this.getOrderStatus (order['status']);
        let price = this.safeFloat (order, 'price');
        let amount = this.safeFloat (order, 'size');
        let filled = this.safeFloat (order, 'filled_size');
        let remaining = amount - filled;
        let cost = this.safeFloat (order, 'executed_value');
        if (market)
            symbol = market['symbol'];
        return {
            'id': order['id'],
            'info': order,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'status': status,
            'symbol': symbol,
            'type': order['type'],
            'side': order['side'],
            'price': price,
            'cost': cost,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'fee': undefined,
        };
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.privateGetOrdersId (this.extend ({
            'id': id,
        }, params));
        return this.parseOrder (response);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let request = {
            'status': 'all',
        };
        let market = undefined;
        if (symbol) {
            market = this.market (symbol);
            request['product_id'] = market['id'];
        }
        let response = await this.privateGetOrders (this.extend (request, params));
        return this.parseOrders (response, market);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let request = {};
        let market = undefined;
        if (symbol) {
            market = this.market (symbol);
            request['product_id'] = market['id'];
        }
        let response = await this.privateGetOrders (this.extend (request, params));
        return this.parseOrders (response, market);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let request = {
            'status': 'done',
        };
        let market = undefined;
        if (symbol) {
            market = this.market (symbol);
            request['product_id'] = market['id'];
        }
        let response = await this.privateGetOrders (this.extend (request, params));
        return this.parseOrders (response, market);
    }

    async createOrder (market, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        // let oid = this.nonce ().toString ();
        let order = {
            'product_id': this.marketId (market),
            'side': side,
            'size': amount,
            'type': type,
        };
        if (type == 'limit')
            order['price'] = price;
        let response = await this.privatePostOrders (this.extend (order, params));
        return {
            'info': response,
            'id': response['id'],
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        return await this.privateDeleteOrdersId ({ 'id': id });
    }

    async getPaymentMethods () {
        let response = await this.privateGetPaymentMethods ();
        return response;
    }

    async deposit (currency, amount, address, params = {}) {
        await this.loadMarkets ();
        let request = {
            'currency': currency,
            'amount': amount,
        };
        let method = 'privatePostDeposits';
        if ('payment_method_id' in params) {
            // deposit from a payment_method, like a bank account
            method += 'PaymentMethod';
        } else if ('coinbase_account_id' in params) {
            // deposit into GDAX account from a Coinbase account
            method += 'CoinbaseAccount';
        } else {
            // deposit methodotherwise we did not receive a supported deposit location
            // relevant docs link for the Googlers
            // https://docs.gdax.com/#deposits
            throw NotSupported (this.id + ' deposit() requires one of `coinbase_account_id` or `payment_method_id` extra params');
        }
        let response = await this[method] (this.extend (request, params));
        if (!response)
            throw ExchangeError (this.id + ' deposit() error: ' + this.json (response));
        return {
            'info': response,
            'id': response['id'],
        };
    }

    async withdraw (currency, amount, address, params = {}) {
        await this.loadMarkets ();
        let request = {
            'currency': currency,
            'amount': amount,
        };
        let method = 'privatePostWithdrawals';
        if ('payment_method_id' in params) {
            method += 'PaymentMethod';
        } else if ('coinbase_account_id' in params) {
            method += 'CoinbaseAccount';
        } else {
            method += 'Crypto';
            request['crypto_address'] = address;
        }
        let response = await this[method] (this.extend (request, params));
        if (!response)
            throw ExchangeError (this.id + ' withdraw() error: ' + this.json (response));
        return {
            'info': response,
            'id': response['id'],
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let request = '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (method == 'GET') {
            if (Object.keys (query).length)
                request += '?' + this.urlencode (query);
        }
        let url = this.urls['api'] + request;
        if (api == 'private') {
            this.checkRequiredCredentials ();
            let nonce = this.nonce ().toString ();
            let payload = '';
            if (method != 'GET') {
                if (Object.keys (query).length)
                    body = this.json (query);
                    payload = body;
            }
            // let payload = (body) ? body : '';
            let what = nonce + method + request + payload;
            let secret = this.base64ToBinary (this.secret);
            let signature = this.hmac (this.encode (what), secret, 'sha256', 'base64');
            headers = {
                'CB-ACCESS-KEY': this.apiKey,
                'CB-ACCESS-SIGN': this.decode (signature),
                'CB-ACCESS-TIMESTAMP': nonce,
                'CB-ACCESS-PASSPHRASE': this.password,
                'Content-Type': 'application/json',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body) {
        if (code == 400) {
            if (body[0] == "{") {
                let response = JSON.parse (body);
                let message = response['message'];
                if (message.indexOf ('price too small') >= 0) {
                    throw new InvalidOrder (this.id + ' ' + message);
                } else if (message.indexOf ('price too precise') >= 0) {
                    throw new InvalidOrder (this.id + ' ' + message);
                } else if (message == 'Invalid API Key') {
                    throw new AuthenticationError (this.id + ' ' + message);
                }
                throw new ExchangeError (this.id + ' ' + this.json (response));
            }
            throw new ExchangeError (this.id + ' ' + body);
        }
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if ('message' in response) {
            throw new ExchangeError (this.id + ' ' + this.json (response));
        }
        return response;
    }
}
