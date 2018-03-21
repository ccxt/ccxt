'use strict';

// ----------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { InsufficientFunds, ExchangeError, InvalidOrder, AuthenticationError, OrderNotFound, InvalidAddress } = require ('./base/errors');

// ----------------------------------------------------------------------------

module.exports = class abucoins extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'abucoins',
            'name': 'ABUCOINS',
            'countries': 'PL',
            'rateLimit': 1000,
            'userAgent': this.userAgents['chrome'],
            'has': {
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
                'fetchMyTrades': true,
                'withdraw': true,
                'fetchDepositAddress': true,
            },
            'urls': {
                'logo': 'https://abucoins.com/dist/assets/84e018a.png',
                'api': 'https://api.abucoins.com',
                'www': 'https://abucoins.com',
                'doc': 'https://docs.abucoins.com/',
                'fees': [
                    'https://abucoins.com/fees',
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
                        'products',
                        'products/{id}/book',
                        'products/{id}/ticker',
                        'products/{id}/trades',
                    ],
                },
                'private': {
                    'get': [
                        'accounts',
                        'orders',
                        'orders/{id}',
                        'fills',
                        'payment-methods',
                    ],
                    'post': [
                        'deposits/coinbase-account',
                        'orders',
                        'withdrawals/make',
                        'deposits/make',
                    ],
                    'delete': [
                        'orders/{id}',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': true, // complicated tier system per coin
                    'percentage': true,
                    'maker': 0.0,
                    'taker': 0.25 / 100,
                },
                'funding': {
                    'tierBased': false,
                    'percentage': false,
                    'withdraw': {
                        'BTC': 0.0005,
                    },
                    'deposit': {
                        'BTC': 0,
                    },
                },
            },
            'options': {
                'cacheDepositMethodsOnFetchDepositAddress': true, // will issue up to two calls in fetchDepositAddress
                'depositMethods': {},
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
            let taker = 0;
            let maker = 0;
            if ((base === 'PLN') && (base === 'EUR') && (base === 'USD') && (base === 'PLN')) {
                maker = 0.0025;
            } else {
                maker = 0.0010;
            }
            let active = true;
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
                        'min': undefined,
                        'max': undefined,
                    },
                },
                'taker': taker,
                'maker': maker,
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
            'level': 2, // 0 fully agregated order book 1 best ask and bid 2 top 50 asks and bids
        }, params));
        return this.parseOrderBook (orderbook);
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let id = this.marketId (symbol);
        let request = this.extend ({
            'id': id,
        }, params);
        let ticker = await this.publicGetProductsIdTicker (request);
        let timestamp = this.parse8601 (ticker['time']);
        let bid = undefined;
        let ask = undefined;
        if ('bid' in ticker)
            bid = this.safeFloat (ticker, 'bid');
        if ('ask' in ticker)
            ask = this.safeFloat (ticker, 'ask');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': undefined,
            'low': undefined,
            'bid': bid,
            'ask': ask,
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'first': undefined,
            'last': this.safeFloat (ticker, 'price'),
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
            if (trade['side'] === 'buy') {
                feeCurrency = market['base'];
            } else {
                feeCurrency = market['quote'];
            }
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
        let cost = undefined;
        let fee = {
            'cost': undefined,
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
        let request = {
            'status': 'open',
        };
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

    async createOrder (market, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let order = {
            'product_id': this.marketId (market),
            'side': side,
            'size': this.truncate_to_string (amount, 20),
            'type': type,
        };
        if (type === 'limit') {
            order['price'] = this.truncate_to_string (price, 20);
        } else {
            // for market buy
            if (side === 'buy') {
                if (!price) {
                    throw new InvalidOrder ('For market buy orders ' + this.id + " requires the amount of quote currency to spend, to calculate proper costs call createOrder (symbol, 'market', 'buy', amount, price)");
                }
                order['funds'] = this.truncate_to_string (amount * price, 20);
            }
        }
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

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let request = '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (method === 'GET') {
            if (Object.keys (query).length)
                request += '?' + this.urlencode (query);
        }
        headers = {};
        let url = this.urls['api'] + request;
        if (api === 'private') {
            this.checkRequiredCredentials ();
            let nonce = this.nonce ().toString ();
            let payload = '';
            if (method !== 'GET') {
                if (Object.keys (query).length) {
                    headers['Content-type'] = 'application/json; charset=UTF-8';
                    body = this.json (query);
                    payload = body;
                }
            }
            // let payload = (body) ? body : '';
            let what = nonce + method + request + payload;
            let secret = this.base64ToBinary (this.secret);
            let signature = this.hmac (this.encode (what), secret, 'sha256', 'base64');
            headers['AC-ACCESS-KEY'] = this.apiKey;
            headers['AC-ACCESS-SIGN'] = signature;
            headers['AC-ACCESS-TIMESTAMP'] = nonce;
            headers['AC-ACCESS-PASSPHRASE'] = this.password;
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body) {
        let response = JSON.parse (body);
        if (response['message']) {
            let message = response['message'];
            let error = this.id + ' ' + message;
            if (message.indexOf ('Amount is too small') >= 0) {
                throw new InvalidOrder (error);
            } else if (message.indexOf ('Insufficient funds') >= 0) {
                throw new InsufficientFunds (error);
            } else if (message.indexOf ('Order not found') >= 0) {
                throw new OrderNotFound (error);
            } else if (message.indexOf ('ACCESS DENIED') >= 0) {
                throw new AuthenticationError (error);
            }
            throw new ExchangeError (this.id + ' ' + message);
        }
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if ('message' in response) {
            throw new ExchangeError (this.id + ' ' + this.json (response));
        }
        return response;
    }

    async withdraw (currency, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        await this.loadMarkets ();
        let request = {
            'currency': currency,
            'amount': amount,
            'address': address,
            'tag': tag,
            'method': this.safeString (params, 'method'),
        };
        let response = await this.privatePostWithdrawalsMake (this.extend (request, params));
        if (!response)
            throw new ExchangeError (this.id + ' withdraw() error: ' + this.json (response));
        return {
            'info': response,
            'id': response['payoutId'],
        };
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        let currency = this.currency (code);
        // eslint-disable-next-line quotes
        let method = this.safeString (params, 'method');
        if (typeof method === 'undefined') {
            if (this.options['cacheDepositMethodsOnFetchDepositAddress']) {
                // cache depositMethods
                if (!(code in this.options['depositMethods']))
                    this.options['depositMethods'][code] = this.fetchDepositMethods (code);
                method = this.options['depositMethods'][code][0]['id'];
            } else {
                throw new ExchangeError (this.id + ' fetchDepositAddress() requires an extra `method` parameter. Use fetchDepositMethods ("' + code + '") to get a list of available deposit methods or enable the exchange property .options["cacheDepositMethodsOnFetchDepositAddress"] = true');
            }
        }
        let request = {
            'asset': currency['id'],
            'method': method,
        };
        let response = await this.privatePostDepositsMake (this.extend (request, params)); // overwrite methods
        let result = response['result'];
        let numResults = result.length;
        if (numResults < 1)
            throw new InvalidAddress (this.id + ' privatePostDepositsMake() returned no addresses');
        let address = this.safeString (result[0], 'address');
        this.checkAddress (address);
        let tag = this.safeString (result[0], 'tag');
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'status': 'ok',
            'info': response,
        };
    }

    async fetchDepositMethods (code, params = {}) {
        await this.loadMarkets ();
        let currency = this.currency (code);
        let ret = undefined;
        let response = await this.privateGetPaymentMethods (this.extend (params));
        if (this.options['cacheDepositMethodsOnFetchDepositAddress']) {
            for (let p = 0; p < response.length; p++) {
                let method = response[p];
                this.options['depositMethods'][method['id']] = method;
                if (method['currency'] === currency) {
                    ret = method;
                }
            }
        }
        return ret;
    }
};
