'use strict';

// ----------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { InsufficientFunds, ExchangeError, InvalidOrder, AuthenticationError, NotSupported, OrderNotFound } = require ('./base/errors');

// ----------------------------------------------------------------------------

module.exports = class gdax extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'gdax',
            'name': 'GDAX',
            'countries': 'US',
            'rateLimit': 1000,
            'userAgent': this.userAgents['chrome'],
            'has': {
                'CORS': true,
                'fetchOHLCV': true,
                'deposit': true,
                'withdraw': true,
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
                'fetchMyTrades': true,
            },
            'timeframes': {
                '1m': 60,
                '5m': 300,
                '15m': 900,
                '1h': 3600,
                '6h': 21600,
                '1d': 86400,
            },
            'urls': {
                'test': 'https://api-public.sandbox.gdax.com',
                'logo': 'https://user-images.githubusercontent.com/1294454/27766527-b1be41c6-5edb-11e7-95f6-5b496c469e2c.jpg',
                'api': 'https://api.gdax.com',
                'www': 'https://www.gdax.com',
                'doc': 'https://docs.gdax.com',
                'fees': [
                    'https://www.gdax.com/fees',
                    'https://support.gdax.com/customer/en/portal/topics/939402-depositing-and-withdrawing-funds/articles',
                ],
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
                        'accounts/{id}/transfers',
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
                        'coinbase-accounts/{id}/addresses',
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
                    'tierBased': true, // complicated tier system per coin
                    'percentage': true,
                    'maker': 0.0,
                    'taker': 0.25 / 100, // Fee is 0.25%, 0.3% for ETH/LTC pairs
                },
                'funding': {
                    'tierBased': false,
                    'percentage': false,
                    'withdraw': {
                        'BCH': 0,
                        'BTC': 0,
                        'LTC': 0,
                        'ETH': 0,
                        'EUR': 0.15,
                        'USD': 25,
                    },
                    'deposit': {
                        'BCH': 0,
                        'BTC': 0,
                        'LTC': 0,
                        'ETH': 0,
                        'EUR': 0.15,
                        'USD': 10,
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
            let id = market['id'];
            let base = market['base_currency'];
            let quote = market['quote_currency'];
            let symbol = base + '/' + quote;
            let priceLimits = {
                'min': this.safeFloat (market, 'quote_increment'),
                'max': undefined,
            };
            let precision = {
                'amount': 8,
                'price': this.precisionFromString (this.safeString (market, 'quote_increment')),
            };
            let taker = this.fees['trading']['taker'];  // does not seem right
            if ((base === 'ETH') || (base === 'LTC')) {
                taker = 0.003;
            }
            let active = market['status'] === 'online';
            result.push (this.extend (this.fees['trading'], {
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': this.safeFloat (market, 'base_min_size'),
                        'max': this.safeFloat (market, 'base_max_size'),
                    },
                    'price': priceLimits,
                    'cost': {
                        'min': this.safeFloat (market, 'min_market_funds'),
                        'max': this.safeFloat (market, 'max_market_funds'),
                    },
                },
                'taker': taker,
                'active': active,
                'info': market,
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
                'free': this.safeFloat (balance, 'available'),
                'used': this.safeFloat (balance, 'hold'),
                'total': this.safeFloat (balance, 'balance'),
            };
            result[currency] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
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
        let timestamp = this.parse8601 (ticker['time']);
        let bid = undefined;
        let ask = undefined;
        if ('bid' in ticker)
            bid = this.safeFloat (ticker, 'bid');
        if ('ask' in ticker)
            ask = this.safeFloat (ticker, 'ask');
        let last = this.safeFloat (ticker, 'price');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': undefined,
            'low': undefined,
            'bid': bid,
            'bidVolume': undefined,
            'ask': ask,
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'volume'),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    parseTrade (trade, market = undefined) {
        let timestamp = undefined;
        if ('time' in trade) {
            timestamp = this.parse8601 (trade['time']);
        } else if ('created_at' in trade) {
            timestamp = this.parse8601 (trade['created_at']);
        }
        let iso8601 = undefined;
        if (typeof timestamp !== 'undefined')
            iso8601 = this.iso8601 (timestamp);
        let symbol = undefined;
        if (!market) {
            if ('product_id' in trade) {
                let marketId = trade['product_id'];
                if (marketId in this.markets_by_id)
                    market = this.markets_by_id[marketId];
            }
        }
        if (market)
            symbol = market['symbol'];
        let feeRate = undefined;
        let feeCurrency = undefined;
        if (market) {
            feeCurrency = market['quote'];
            if ('liquidity' in trade) {
                let rateType = (trade['liquidity'] === 'T') ? 'taker' : 'maker';
                feeRate = market[rateType];
            }
        }
        let feeCost = this.safeFloat (trade, 'fill_fees');
        if (typeof feeCost === 'undefined')
            feeCost = this.safeFloat (trade, 'fee');
        let fee = {
            'cost': feeCost,
            'currency': feeCurrency,
            'rate': feeRate,
        };
        let type = undefined;
        let id = this.safeString (trade, 'trade_id');
        let side = (trade['side'] === 'buy') ? 'sell' : 'buy';
        let orderId = this.safeString (trade, 'order_id');
        // GDAX returns inverted side to fetchMyTrades vs fetchTrades
        if (typeof orderId !== 'undefined')
            side = (trade['side'] === 'buy') ? 'buy' : 'sell';
        return {
            'id': id,
            'order': orderId,
            'info': trade,
            'timestamp': timestamp,
            'datetime': iso8601,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': this.safeFloat (trade, 'price'),
            'amount': this.safeFloat (trade, 'size'),
            'fee': fee,
        };
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        let request = {};
        if (typeof symbol !== 'undefined') {
            market = this.market (symbol);
            request['product_id'] = market['id'];
        }
        if (typeof limit !== 'undefined')
            request['limit'] = limit;
        let response = await this.privateGetFills (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetProductsIdTrades (this.extend ({
            'id': market['id'], // fixes issue #2
        }, params));
        return this.parseTrades (response, market, since, limit);
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
        if (typeof since !== 'undefined') {
            request['start'] = this.ymdhms (since);
            if (typeof limit === 'undefined') {
                // https://docs.gdax.com/#get-historic-rates
                limit = 300; // max = 300
            }
            request['end'] = this.ymdhms (this.sum (limit * granularity * 1000, since));
        }
        let response = await this.publicGetProductsIdCandles (this.extend (request, params));
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    async fetchTime () {
        let response = await this.publicGetTime ();
        return this.parse8601 (response['iso']);
    }

    parseOrderStatus (status) {
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
        let status = this.parseOrderStatus (order['status']);
        let price = this.safeFloat (order, 'price');
        let amount = this.safeFloat (order, 'size');
        if (typeof amount === 'undefined')
            amount = this.safeFloat (order, 'funds');
        if (typeof amount === 'undefined')
            amount = this.safeFloat (order, 'specified_funds');
        let filled = this.safeFloat (order, 'filled_size');
        let remaining = undefined;
        if (typeof amount !== 'undefined')
            if (typeof filled !== 'undefined')
                remaining = amount - filled;
        let cost = this.safeFloat (order, 'executed_value');
        let fee = {
            'cost': this.safeFloat (order, 'fill_fees'),
            'currency': undefined,
            'rate': undefined,
        };
        if (market)
            symbol = market['symbol'];
        return {
            'id': order['id'],
            'info': order,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': symbol,
            'type': order['type'],
            'side': order['side'],
            'price': price,
            'cost': cost,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'fee': fee,
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
        return this.parseOrders (response, market, since, limit);
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
        return this.parseOrders (response, market, since, limit);
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
        return this.parseOrders (response, market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        // let oid = this.nonce ().toString ();
        let order = {
            'product_id': this.marketId (symbol),
            'side': side,
            'size': amount,
            'type': type,
        };
        if (type === 'limit')
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

    feeToPrecision (currency, fee) {
        let cost = parseFloat (fee);
        return cost.toFixed (this.currencies[currency].precision);
    }

    calculateFee (symbol, type, side, amount, price, takerOrMaker = 'taker', params = {}) {
        let market = this.markets[symbol];
        let rate = market[takerOrMaker];
        let cost = amount * price;
        let currency = market['quote'];
        return {
            'type': takerOrMaker,
            'currency': currency,
            'rate': rate,
            'cost': parseFloat (this.feeToPrecision (currency, rate * cost)),
        };
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
            throw new NotSupported (this.id + ' deposit() requires one of `coinbase_account_id` or `payment_method_id` extra params');
        }
        let response = await this[method] (this.extend (request, params));
        if (!response)
            throw new ExchangeError (this.id + ' deposit() error: ' + this.json (response));
        return {
            'info': response,
            'id': response['id'],
        };
    }

    async withdraw (currency, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
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
            throw new ExchangeError (this.id + ' withdraw() error: ' + this.json (response));
        return {
            'info': response,
            'id': response['id'],
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let request = '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (method === 'GET') {
            if (Object.keys (query).length)
                request += '?' + this.urlencode (query);
        }
        let url = this.urls['api'] + request;
        if (api === 'private') {
            this.checkRequiredCredentials ();
            let nonce = this.nonce ().toString ();
            let payload = '';
            if (method !== 'GET') {
                if (Object.keys (query).length) {
                    body = this.json (query);
                    payload = body;
                }
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
        if ((code === 400) || (code === 404)) {
            if (body[0] === '{') {
                let response = JSON.parse (body);
                let message = response['message'];
                let error = this.id + ' ' + message;
                if (message.indexOf ('price too small') >= 0) {
                    throw new InvalidOrder (error);
                } else if (message.indexOf ('price too precise') >= 0) {
                    throw new InvalidOrder (error);
                } else if (message === 'Insufficient funds') {
                    throw new InsufficientFunds (error);
                } else if (message === 'NotFound') {
                    throw new OrderNotFound (error);
                } else if (message === 'Invalid API Key') {
                    throw new AuthenticationError (error);
                }
                throw new ExchangeError (this.id + ' ' + message);
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
};
