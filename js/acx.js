'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { InsufficientFunds, OrderNotFound } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class acx extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'acx',
            'name': 'ACX',
            'countries': [ 'AU' ],
            'rateLimit': 1000,
            'version': 'v2',
            'has': {
                'CORS': true,
                'fetchTickers': true,
                'fetchOHLCV': true,
                'withdraw': true,
                'fetchOrder': true,
            },
            'timeframes': {
                '1m': '1',
                '5m': '5',
                '15m': '15',
                '30m': '30',
                '1h': '60',
                '2h': '120',
                '4h': '240',
                '12h': '720',
                '1d': '1440',
                '3d': '4320',
                '1w': '10080',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/30247614-1fe61c74-9621-11e7-9e8c-f1a627afa279.jpg',
                'extension': '.json',
                'api': 'https://acx.io/api',
                'www': 'https://acx.io',
                'doc': 'https://acx.io/documents/api_v2',
            },
            'api': {
                'public': {
                    'get': [
                        'depth', // Get depth or specified market Both asks and bids are sorted from highest price to lowest.
                        'k_with_pending_trades', // Get K data with pending trades, which are the trades not included in K data yet, because there's delay between trade generated and processed by K data generator
                        'k', // Get OHLC(k line) of specific market
                        'markets', // Get all available markets
                        'order_book', // Get the order book of specified market
                        'order_book/{market}',
                        'tickers', // Get ticker of all markets
                        'tickers/{market}', // Get ticker of specific market
                        'timestamp', // Get server current time, in seconds since Unix epoch
                        'trades', // Get recent trades on market, each trade is included only once Trades are sorted in reverse creation order.
                        'trades/{market}',
                    ],
                },
                'private': {
                    'get': [
                        'members/me', // Get your profile and accounts info
                        'deposits', // Get your deposits history
                        'deposit', // Get details of specific deposit
                        'deposit_address', // Where to deposit The address field could be empty when a new address is generating (e.g. for bitcoin), you should try again later in that case.
                        'orders', // Get your orders, results is paginated
                        'order', // Get information of specified order
                        'trades/my', // Get your executed trades Trades are sorted in reverse creation order.
                        'withdraws', // Get your cryptocurrency withdraws
                        'withdraw', // Get your cryptocurrency withdraw
                    ],
                    'post': [
                        'orders', // Create a Sell/Buy order
                        'orders/multi', // Create multiple sell/buy orders
                        'orders/clear', // Cancel all my orders
                        'order/delete', // Cancel an order
                        'withdraw', // Create a withdraw
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': 0.2 / 100,
                    'taker': 0.2 / 100,
                },
                'funding': {
                    'tierBased': false,
                    'percentage': true,
                    'withdraw': {}, // There is only 1% fee on withdrawals to your bank account.
                },
            },
            'exceptions': {
                '2002': InsufficientFunds,
                '2003': OrderNotFound,
            },
        });
    }

    async fetchMarkets (params = {}) {
        let markets = await this.publicGetMarkets ();
        let result = [];
        for (let p = 0; p < markets.length; p++) {
            let market = markets[p];
            let id = market['id'];
            let symbol = market['name'];
            let baseId = this.safeString (market, 'base_unit');
            let quoteId = this.safeString (market, 'quote_unit');
            if ((baseId === undefined) || (quoteId === undefined)) {
                let ids = symbol.split ('/');
                baseId = ids[0].toLowerCase ();
                quoteId = ids[1].toLowerCase ();
            }
            let base = baseId.toUpperCase ();
            let quote = quoteId.toUpperCase ();
            base = this.commonCurrencyCode (base);
            quote = this.commonCurrencyCode (quote);
            // todo: find out their undocumented precision and limits
            let precision = {
                'amount': 8,
                'price': 8,
            };
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'precision': precision,
                'info': market,
            });
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privateGetMembersMe ();
        let balances = response['accounts'];
        let result = { 'info': balances };
        for (let b = 0; b < balances.length; b++) {
            let balance = balances[b];
            let currency = balance['currency'];
            let uppercase = currency.toUpperCase ();
            let account = {
                'free': parseFloat (balance['balance']),
                'used': parseFloat (balance['locked']),
                'total': 0.0,
            };
            account['total'] = this.sum (account['free'], account['used']);
            result[uppercase] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'market': market['id'],
        };
        if (limit !== undefined)
            request['limit'] = limit; // default = 300
        let orderbook = await this.publicGetDepth (this.extend (request, params));
        let timestamp = orderbook['timestamp'] * 1000;
        return this.parseOrderBook (orderbook, timestamp);
    }

    parseTicker (ticker, market = undefined) {
        let timestamp = ticker['at'] * 1000;
        ticker = ticker['ticker'];
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        let last = this.safeFloat (ticker, 'last');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': this.safeFloat (ticker, 'buy'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'sell'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': this.safeFloat (ticker, 'open'),
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'vol'),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let tickers = await this.publicGetTickers (params);
        let ids = Object.keys (tickers);
        let result = {};
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i];
            let market = undefined;
            let symbol = id;
            if (id in this.markets_by_id) {
                market = this.markets_by_id[id];
                symbol = market['symbol'];
            } else {
                let base = id.slice (0, 3);
                let quote = id.slice (3, 6);
                base = base.toUpperCase ();
                quote = quote.toUpperCase ();
                base = this.commonCurrencyCode (base);
                quote = this.commonCurrencyCode (quote);
                symbol = base + '/' + quote;
            }
            let ticker = tickers[id];
            result[symbol] = this.parseTicker (ticker, market);
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetTickersMarket (this.extend ({
            'market': market['id'],
        }, params));
        return this.parseTicker (response, market);
    }

    parseTrade (trade, market = undefined) {
        let timestamp = this.parse8601 (trade['created_at']);
        return {
            'id': trade['id'].toString (),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'side': undefined,
            'price': this.safeFloat (trade, 'price'),
            'amount': this.safeFloat (trade, 'volume'),
            'cost': this.safeFloat (trade, 'funds'),
            'info': trade,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetTrades (this.extend ({
            'market': market['id'],
        }, params));
        return this.parseTrades (response, market, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        return [
            ohlcv[0] * 1000,
            ohlcv[1],
            ohlcv[2],
            ohlcv[3],
            ohlcv[4],
            ohlcv[5],
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        if (limit === undefined)
            limit = 500; // default is 30
        let request = {
            'market': market['id'],
            'period': this.timeframes[timeframe],
            'limit': limit,
        };
        if (since !== undefined)
            request['timestamp'] = since;
        let response = await this.publicGetK (this.extend (request, params));
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    parseOrder (order, market = undefined) {
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        } else {
            let marketId = order['market'];
            symbol = this.markets_by_id[marketId]['symbol'];
        }
        let timestamp = this.parse8601 (order['created_at']);
        let state = order['state'];
        let status = undefined;
        if (state === 'done') {
            status = 'closed';
        } else if (state === 'wait') {
            status = 'open';
        } else if (state === 'cancel') {
            status = 'canceled';
        }
        return {
            'id': order['id'].toString (),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': symbol,
            'type': order['ord_type'],
            'side': order['side'],
            'price': this.safeFloat (order, 'price'),
            'amount': this.safeFloat (order, 'volume'),
            'filled': this.safeFloat (order, 'executed_volume'),
            'remaining': this.safeFloat (order, 'remaining_volume'),
            'trades': undefined,
            'fee': undefined,
            'info': order,
        };
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.privateGetOrder (this.extend ({
            'id': parseInt (id),
        }, params));
        return this.parseOrder (response);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let order = {
            'market': this.marketId (symbol),
            'side': side,
            'volume': amount.toString (),
            'ord_type': type,
        };
        if (type === 'limit') {
            order['price'] = price.toString ();
        }
        let response = await this.privatePostOrders (this.extend (order, params));
        let market = this.markets_by_id[response['market']];
        return this.parseOrder (response, market);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let result = await this.privatePostOrderDelete ({ 'id': id });
        let order = this.parseOrder (result);
        let status = order['status'];
        if (status === 'closed' || status === 'canceled') {
            throw new OrderNotFound (this.id + ' ' + this.json (order));
        }
        return order;
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        await this.loadMarkets ();
        let currency = this.currency (code);
        // they have XRP but no docs on memo/tag
        let request = {
            'currency': currency['id'],
            'sum': amount,
            'address': address,
        };
        let result = await this.privatePostWithdraw (this.extend (request, params));
        // withdrawal response is undocumented
        return {
            'info': result,
            'id': undefined,
        };
    }

    nonce () {
        return this.milliseconds ();
    }

    encodeParams (params) {
        if ('orders' in params) {
            let orders = params['orders'];
            let query = this.urlencode (this.keysort (this.omit (params, 'orders')));
            for (let i = 0; i < orders.length; i++) {
                let order = orders[i];
                let keys = Object.keys (order);
                for (let k = 0; k < keys.length; k++) {
                    let key = keys[k];
                    let value = order[key];
                    query += '&orders%5B%5D%5B' + key + '%5D=' + value.toString ();
                }
            }
            return query;
        }
        return this.urlencode (this.keysort (params));
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let request = '/api' + '/' + this.version + '/' + this.implodeParams (path, params);
        if ('extension' in this.urls)
            request += this.urls['extension'];
        let query = this.omit (params, this.extractParams (path));
        let url = this.urls['api'] + request;
        if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            this.checkRequiredCredentials ();
            let nonce = this.nonce ().toString ();
            let query = this.encodeParams (this.extend ({
                'access_key': this.apiKey,
                'tonce': nonce,
            }, params));
            let auth = method + '|' + request + '|' + query;
            let signed = this.hmac (this.encode (auth), this.encode (this.secret));
            let suffix = query + '&signature=' + signed;
            if (method === 'GET') {
                url += '?' + suffix;
            } else {
                body = suffix;
                headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response) {
        if (code === 400) {
            const error = this.safeValue (response, 'error');
            const errorCode = this.safeString (error, 'code');
            const feedback = this.id + ' ' + this.json (response);
            const exceptions = this.exceptions;
            if (errorCode in exceptions) {
                throw new exceptions[errorCode] (feedback);
            }
            // fallback to default error handler
        }
    }
};
