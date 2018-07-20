'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, AuthenticationError, DDoSProtection } = require ('./base/errors');

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
                'fetchTickers': true,
                'fetchOpenOrders': true,
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
                        'user/trades',
                    ],
                    'post': [
                        'user/orders',
                    ],
                    'delete': [
                        'user/orders',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'maker': 0.0025,
                    'taker': 0.0025,
                },
            },
            'precision': {
                'amount': 8,
                'price': 8,
            },
        });
    }

    async fetchMarkets () {
        let response = await this.publicGetMarkets ();
        let markets = response['data'];
        let result = [];
        for (let i = 0; i < markets.length; i++) {
            let market = markets[i];
            let [ baseId, quoteId ] = market['name'].split ('-');
            let base = this.commonCurrencyCode (baseId);
            let quote = this.commonCurrencyCode (quoteId);
            let symbol = base + '/' + quote;
            let precision = {
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
        if (typeof market === 'undefined') {
            let marketId = ticker['name'];
            market = this.marketsById[marketId];
        }
        let symbol = market['symbol'];
        let timestamp = this.milliseconds ();
        let last = parseFloat (ticker['last_price']);
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
            'change': parseFloat (ticker['change_in_24h']),
            'percentage': undefined,
            'average': undefined,
            'baseVolume': parseFloat (ticker['volume']),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let tickers = await this.fetchTickers (params);
        return tickers[symbol];
    }

    async fetchTickers (symbols = undefined, params = {}) {
        let response = await this.publicGetMarkets ();
        let tickers = response['data'];
        let result = {};
        for (let i = 0; i < tickers.length; i++) {
            let ticker = this.parseTicker (tickers[i]);
            let symbol = ticker['symbol'];
            result[symbol] = ticker;
        }
        return result;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.publicGetMarketsMarketOrders (this.extend ({
            'market': this.marketId (symbol),
            'level': '3',
        }, params));
        return this.parseOrderBook (response['data'], undefined, 'bids', 'asks', 'price', 'size');
    }

    parseTrade (trade, market = undefined) {
        let timestamp = this.parse8601 (trade['created_at']);
        let price = parseFloat (trade['price']);
        let amount = parseFloat (trade['size']);
        let symbol = market['symbol'];
        let cost = parseFloat (this.costToPrecision (symbol, price * amount));
        return {
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': undefined,
            'order': undefined,
            'type': undefined,
            'side': undefined,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': undefined,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'market': market['id'],
        };
        if (typeof since !== 'undefined') {
            request['since'] = this.iso8601 (since);
        }
        let response = await this.publicGetMarketsMarketTrades (this.extend (request, params));
        return this.parseTrades (response['data'], market, since, limit);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privateGetUserAccounts (params);
        let result = { 'info': response };
        let balances = response['data'];
        for (let i = 0; i < balances.length; i++) {
            let balance = balances[i];
            let currencyId = this.safeString (balance, 'currency_code');
            let uppercase = currencyId.toUpperCase ();
            let code = this.commonCurrencyCode (uppercase);
            if (uppercase in this.currencies_by_id) {
                code = this.currencies_by_id[uppercase]['code'];
            }
            let account = {
                'free': parseFloat (balance['available_balance']),
                'used': parseFloat (balance['hold_balance']),
                'total': parseFloat (balance['balance']),
            };
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    parseOrder (order, market = undefined) {
        if (typeof market === 'undefined') {
            market = this.marketsById[order['market']];
        }
        let symbol = market['symbol'];
        let timestamp = this.parse8601 (order['created_at']);
        let price = parseFloat (order['price']);
        let amount = this.safeFloat (order, 'size');
        let filled = this.safeFloat (order, 'size_filled');
        let remaining = this.amountToPrecision (symbol, amount - filled);
        let cost = this.priceToPrecision (symbol, amount * price);
        // pending, open, partially_filled, fullfilled, canceled
        let status = order['status'];
        if (status === 'fulfilled') {
            status = 'closed';
        } else if (status === 'canceled') {
            status = 'canceled';
        } else {
            status = 'open';
        }
        let type = order['operation_type'].split ('_');
        return {
            'id': this.safeString (order, 'id'),
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'status': status,
            'symbol': symbol,
            'type': type[0],
            'side': order['order_type'],
            'price': price,
            'cost': cost,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'trades': undefined,
            'fee': undefined,
            'info': order,
        };
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        // price/size must be string
        amount = this.amountToPrecision (symbol, parseFloat (amount));
        let request = {
            'market': market['id'],
            'size': amount.toString (),
            'order_type': side,
        };
        if (type === 'limit') {
            price = this.priceToPrecision (symbol, parseFloat (price));
            request['price'] = price.toString ();
        }
        request['operation_type'] = type + '_order';
        let response = await this.privatePostUserOrders (this.extend (request, params));
        let order = this.parseOrder (response['data'], market);
        let id = order['id'];
        this.orders[id] = order;
        return order;
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.privateDeleteUserOrders (this.extend ({
            'id': id,
        }, params));
        let market = this.market (symbol);
        return this.parseOrder (response['data'], market);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let request = {};
        if (typeof symbol !== 'undefined') {
            request['market'] = this.marketId (symbol);
        }
        if (typeof since !== 'undefined') {
            request['since_time'] = this.iso8601 (this.milliseconds ());
        }
        // TODO: test status=all if it works for closed orders too
        let response = await this.privateGetUserOrders (this.extend (request, params));
        return this.parseOrders (response['data']);
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let request = '/' + 'api/' + this.version + '/' + this.implodeParams (path, params);
        let url = this.urls['api'] + request;
        let query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (Object.keys (query).length)
                url += '?' + this.urlencode (query);
        } else {
            this.checkRequiredCredentials ();
            if (method === 'GET') {
                if (Object.keys (query).length)
                    url += '?' + this.urlencode (query);
            } else {
                body = this.json (query);
            }
            let seconds = this.seconds ().toString ();
            let payload = [ seconds, method, request ].join ('|');
            if (body) {
                payload += '|' + body;
            }
            let signature = this.hmac (this.encode (payload), this.encode (this.secret));
            headers = {
                'CF-API-KEY': this.apiKey,
                'CF-API-TIMESTAMP': seconds,
                'CF-API-SIGNATURE': signature,
                'Content-Type': 'application/json',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body) {
        if (code < 400) {
            return;
        }
        let ErrorClass = this.safeValue ({
            '401': AuthenticationError,
            '429': DDoSProtection,
        }, code, ExchangeError);
        throw new ErrorClass (body);
    }
};
