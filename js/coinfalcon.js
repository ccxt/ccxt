'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, AuthenticationError, RateLimitExceeded, ArgumentsRequired } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class coinfalcon extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'coinfalcon',
            'name': 'CoinFalcon',
            'countries': [ 'GB' ],
            'rateLimit': 1000,
            'version': 'v1',
            'has': {
                'cancelOrder': true,
                'createOrder': true,
                'fetchBalance': true,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/41822275-ed982188-77f5-11e8-92bb-496bcd14ca52.jpg',
                'api': 'https://coinfalcon.com',
                'www': 'https://coinfalcon.com',
                'doc': 'https://docs.coinfalcon.com',
                'fees': 'https://coinfalcon.com/fees',
                'referral': 'https://coinfalcon.com/?ref=CFJSVGTUPASB',
            },
            'api': {
                'public': {
                    'get': [
                        'markets',
                        'markets/{market}/orders',
                        'markets/{market}/trades',
                    ],
                },
                'private': {
                    'get': [
                        'user/accounts',
                        'user/orders',
                        'user/orders/{id}',
                        'user/trades',
                    ],
                    'post': [
                        'user/orders',
                    ],
                    'delete': [
                        'user/orders/{id}',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'maker': 0.0,
                    'taker': 0.002, // tiered fee starts at 0.2%
                },
            },
            'precision': {
                'amount': 8,
                'price': 8,
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetMarkets (params);
        const markets = this.safeValue (response, 'data');
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const [ baseId, quoteId ] = market['name'].split ('-');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const precision = {
                'amount': this.safeInteger (market, 'size_precision'),
                'price': this.safeInteger (market, 'price_precision'),
            };
            result.push ({
                'id': market['name'],
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': true,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': Math.pow (10, -precision['amount']),
                        'max': undefined,
                    },
                    'price': {
                        'min': Math.pow (10, -precision['price']),
                        'max': undefined,
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
                'info': market,
            });
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        const marketId = this.safeString (ticker, 'name');
        const symbol = this.safeSymbol (marketId, market, '-');
        const timestamp = this.milliseconds ();
        const last = parseFloat (ticker['last_price']);
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': undefined,
            'low': undefined,
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': this.safeFloat (ticker, 'change_in_24h'),
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': this.safeFloat (ticker, 'volume'),
            'info': ticker,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const tickers = await this.fetchTickers (params);
        return tickers[symbol];
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetMarkets (params);
        const tickers = this.safeValue (response, 'data');
        const result = {};
        for (let i = 0; i < tickers.length; i++) {
            const ticker = this.parseTicker (tickers[i]);
            const symbol = ticker['symbol'];
            result[symbol] = ticker;
        }
        return this.filterByArray (result, 'symbol', symbols);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'market': this.marketId (symbol),
            'level': '3',
        };
        const response = await this.publicGetMarketsMarketOrders (this.extend (request, params));
        const data = this.safeValue (response, 'data', {});
        return this.parseOrderBook (data, undefined, 'bids', 'asks', 'price', 'size');
    }

    parseTrade (trade, market = undefined) {
        const timestamp = this.parse8601 (this.safeString (trade, 'created_at'));
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'size');
        const symbol = market['symbol'];
        let cost = undefined;
        if (price !== undefined) {
            if (amount !== undefined) {
                cost = parseFloat (this.costToPrecision (symbol, price * amount));
            }
        }
        const tradeId = this.safeString (trade, 'id');
        const side = this.safeString (trade, 'side');
        const orderId = this.safeString (trade, 'order_id');
        let fee = undefined;
        const feeCost = this.safeFloat (trade, 'fee');
        if (feeCost !== undefined) {
            const feeCurrencyCode = this.safeString (trade, 'fee_currency_code');
            fee = {
                'cost': feeCost,
                'currency': this.safeCurrencyCode (feeCurrencyCode),
            };
        }
        return {
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': tradeId,
            'order': orderId,
            'type': undefined,
            'side': side,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
        };
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        if (since !== undefined) {
            request['start_time'] = this.iso8601 (since);
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetUserTrades (this.extend (request, params));
        const data = this.safeValue (response, 'data', []);
        return this.parseTrades (data, market, since, limit);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        if (since !== undefined) {
            request['since'] = this.iso8601 (since);
        }
        const response = await this.publicGetMarketsMarketTrades (this.extend (request, params));
        const data = this.safeValue (response, 'data', []);
        return this.parseTrades (data, market, since, limit);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetUserAccounts (params);
        const result = { 'info': response };
        const balances = this.safeValue (response, 'data');
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const currencyId = this.safeString (balance, 'currency_code');
            const code = this.safeCurrencyCode (currencyId);
            const account = {
                'free': this.safeFloat (balance, 'available_balance'),
                'used': this.safeFloat (balance, 'hold_balance'),
                'total': this.safeFloat (balance, 'balance'),
            };
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    parseOrderStatus (status) {
        const statuses = {
            'fulfilled': 'closed',
            'canceled': 'canceled',
            'pending': 'open',
            'open': 'open',
            'partially_filled': 'open',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        //
        //     {
        //         "id":"8bdd79f4-8414-40a2-90c3-e9f4d6d1eef4"
        //         "market":"IOT-BTC"
        //         "price":"0.0000003"
        //         "size":"4.0"
        //         "size_filled":"3.0"
        //         "fee":"0.0075"
        //         "fee_currency_code":"iot"
        //         "funds":"0.0"
        //         "status":"canceled"
        //         "order_type":"buy"
        //         "post_only":false
        //         "operation_type":"market_order"
        //         "created_at":"2018-01-12T21:14:06.747828Z"
        //     }
        //
        const marketId = this.safeString (order, 'market');
        const symbol = this.safeSymbol (marketId, market, '-');
        const timestamp = this.parse8601 (this.safeString (order, 'created_at'));
        const price = this.safeFloat (order, 'price');
        const amount = this.safeFloat (order, 'size');
        const filled = this.safeFloat (order, 'size_filled');
        let remaining = undefined;
        let cost = undefined;
        if (amount !== undefined) {
            if (filled !== undefined) {
                remaining = Math.max (0, amount - filled);
            }
            if (price !== undefined) {
                cost = filled * price;
            }
        }
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        let type = this.safeString (order, 'operation_type');
        if (type !== undefined) {
            type = type.split ('_');
            type = type[0];
        }
        const side = this.safeString (order, 'order_type');
        return {
            'id': this.safeString (order, 'id'),
            'clientOrderId': undefined,
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'status': status,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'cost': cost,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'trades': undefined,
            'fee': undefined,
            'info': order,
            'lastTradeTimestamp': undefined,
            'average': undefined,
        };
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        // price/size must be string
        const request = {
            'market': market['id'],
            'size': this.amountToPrecision (symbol, amount),
            'order_type': side,
        };
        if (type === 'limit') {
            price = this.priceToPrecision (symbol, price);
            request['price'] = price.toString ();
        }
        request['operation_type'] = type + '_order';
        const response = await this.privatePostUserOrders (this.extend (request, params));
        const data = this.safeValue (response, 'data', {});
        return this.parseOrder (data, market);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'id': id,
        };
        const response = await this.privateDeleteUserOrdersId (this.extend (request, params));
        const market = this.market (symbol);
        const data = this.safeValue (response, 'data', {});
        return this.parseOrder (data, market);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'id': id,
        };
        const response = await this.privateGetUserOrdersId (this.extend (request, params));
        const data = this.safeValue (response, 'data', {});
        return this.parseOrder (data);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['market'] = market['id'];
        }
        if (since !== undefined) {
            request['since_time'] = this.iso8601 (since);
        }
        // TODO: test status=all if it works for closed orders too
        const response = await this.privateGetUserOrders (this.extend (request, params));
        const data = this.safeValue (response, 'data', []);
        const orders = this.filterByArray (data, 'status', [ 'pending', 'open', 'partially_filled' ], false);
        return this.parseOrders (orders, market, since, limit);
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let request = '/api/' + this.version + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (Object.keys (query).length) {
                request += '?' + this.urlencode (query);
            }
        } else {
            this.checkRequiredCredentials ();
            if (method === 'GET') {
                if (Object.keys (query).length) {
                    request += '?' + this.urlencode (query);
                }
            } else {
                body = this.json (query);
            }
            const seconds = this.seconds ().toString ();
            let payload = [ seconds, method, request ].join ('|');
            if (body) {
                payload += '|' + body;
            }
            const signature = this.hmac (this.encode (payload), this.encode (this.secret));
            headers = {
                'CF-API-KEY': this.apiKey,
                'CF-API-TIMESTAMP': seconds,
                'CF-API-SIGNATURE': signature,
                'Content-Type': 'application/json',
            };
        }
        const url = this.urls['api'] + request;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (code < 400) {
            return;
        }
        const ErrorClass = this.safeValue ({
            '401': AuthenticationError,
            '429': RateLimitExceeded,
        }, code, ExchangeError);
        throw new ErrorClass (body);
    }
};
