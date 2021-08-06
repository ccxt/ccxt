'use strict';

// ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ArgumentsRequired, InsufficientFunds, OrderNotFound } = require ('./base/errors');
const Precise = require ('./base/Precise');

// ---------------------------------------------------------------------------

module.exports = class kuna extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'kuna',
            'name': 'Kuna',
            'countries': [ 'UA' ],
            'rateLimit': 1000,
            'version': 'v2',
            'has': {
                'CORS': false,
                'cancelOrder': true,
                'createOrder': true,
                'fetchBalance': true,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': 'emulated',
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'withdraw': false,
            },
            'timeframes': undefined,
            'urls': {
                'extension': '.json',
                'referral': 'https://kuna.io?r=kunaid-gvfihe8az7o4',
                'logo': 'https://user-images.githubusercontent.com/51840849/87153927-f0578b80-c2c0-11ea-84b6-74612568e9e1.jpg',
                'api': 'https://kuna.io',
                'www': 'https://kuna.io',
                'doc': 'https://kuna.io/documents/api',
                'fees': 'https://kuna.io/documents/api',
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
                    'taker': 0.25 / 100,
                    'maker': 0.25 / 100,
                },
                'funding': {
                    'withdraw': {
                        'UAH': '1%',
                        'BTC': 0.001,
                        'BCH': 0.001,
                        'ETH': 0.01,
                        'WAVES': 0.01,
                        'GOL': 0.0,
                        'GBG': 0.0,
                        // 'RMC': 0.001 BTC
                        // 'ARN': 0.01 ETH
                        // 'R': 0.01 ETH
                        // 'EVR': 0.01 ETH
                    },
                    'deposit': {
                        // 'UAH': (amount) => amount * 0.001 + 5
                    },
                },
            },
            'commonCurrencies': {
                'PLA': 'Plair',
            },
            'exceptions': {
                '2002': InsufficientFunds,
                '2003': OrderNotFound,
            },
        });
    }

    async fetchTime (params = {}) {
        const response = await this.publicGetTimestamp (params);
        //
        //     1594911427
        //
        return response * 1000;
    }

    async fetchMarkets (params = {}) {
        const quotes = [ 'btc', 'rub', 'uah', 'usd', 'usdt', 'usdc' ];
        const markets = [];
        const response = await this.publicGetTickers (params);
        const ids = Object.keys (response);
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            for (let j = 0; j < quotes.length; j++) {
                const quoteId = quotes[j];
                const index = id.indexOf (quoteId);
                const slice = id.slice (index);
                if ((index > 0) && (slice === quoteId)) {
                    const baseId = id.replace (quoteId, '');
                    const base = this.safeCurrencyCode (baseId);
                    const quote = this.safeCurrencyCode (quoteId);
                    const symbol = base + '/' + quote;
                    markets.push ({
                        'id': id,
                        'symbol': symbol,
                        'base': base,
                        'quote': quote,
                        'baseId': baseId,
                        'quoteId': quoteId,
                        'precision': {
                            'amount': undefined,
                            'price': undefined,
                        },
                        'limits': {
                            'amount': {
                                'min': undefined,
                                'max': undefined,
                            },
                            'price': {
                                'min': undefined,
                                'max': undefined,
                            },
                            'cost': {
                                'min': undefined,
                                'max': undefined,
                            },
                        },
                        'active': undefined,
                        'info': undefined,
                    });
                    break;
                }
            }
        }
        return markets;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit; // default = 300
        }
        const orderbook = await this.publicGetDepth (this.extend (request, params));
        const timestamp = this.safeTimestamp (orderbook, 'timestamp');
        return this.parseOrderBook (orderbook, symbol, timestamp);
    }

    parseTicker (ticker, market = undefined) {
        const timestamp = this.safeTimestamp (ticker, 'at');
        ticker = ticker['ticker'];
        let symbol = undefined;
        if (market) {
            symbol = market['symbol'];
        }
        const last = this.safeNumber (ticker, 'last');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeNumber (ticker, 'high'),
            'low': this.safeNumber (ticker, 'low'),
            'bid': this.safeNumber (ticker, 'buy'),
            'bidVolume': undefined,
            'ask': this.safeNumber (ticker, 'sell'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': this.safeNumber (ticker, 'open'),
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeNumber (ticker, 'vol'),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetTickers (params);
        const ids = Object.keys (response);
        const result = {};
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
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
                base = this.safeCurrencyCode (base);
                quote = this.safeCurrencyCode (quote);
                symbol = base + '/' + quote;
            }
            result[symbol] = this.parseTicker (response[id], market);
        }
        return this.filterByArray (result, 'symbol', symbols);
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        const response = await this.publicGetTickersMarket (this.extend (request, params));
        return this.parseTicker (response, market);
    }

    async fetchL3OrderBook (symbol, limit = undefined, params = {}) {
        return await this.fetchOrderBook (symbol, limit, params);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        const response = await this.publicGetTrades (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    parseTrade (trade, market = undefined) {
        const timestamp = this.parse8601 (this.safeString (trade, 'created_at'));
        let symbol = undefined;
        if (market) {
            symbol = market['symbol'];
        }
        let side = this.safeString2 (trade, 'side', 'trend');
        if (side !== undefined) {
            const sideMap = {
                'ask': 'sell',
                'bid': 'buy',
            };
            side = this.safeString (sideMap, side, side);
        }
        const priceString = this.safeString (trade, 'price');
        const amountString = this.safeString (trade, 'volume');
        const price = this.parseNumber (priceString);
        const amount = this.parseNumber (amountString);
        let cost = this.safeNumber (trade, 'funds');
        if (cost === undefined) {
            cost = this.parseNumber (Precise.stringMul (priceString, amountString));
        }
        const orderId = this.safeString (trade, 'order_id');
        const id = this.safeString (trade, 'id');
        return {
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': undefined,
            'side': side,
            'order': orderId,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': undefined,
        };
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const trades = await this.fetchTrades (symbol, since, limit, params);
        const ohlcvc = this.buildOHLCVC (trades, timeframe, since, limit);
        const result = [];
        for (let i = 0; i < ohlcvc.length; i++) {
            const ohlcv = ohlcvc[i];
            result.push ([
                ohlcv[0],
                ohlcv[1],
                ohlcv[2],
                ohlcv[3],
                ohlcv[4],
                ohlcv[5],
            ]);
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetMembersMe (params);
        const balances = this.safeValue (response, 'accounts');
        const result = { 'info': balances };
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const currencyId = this.safeString (balance, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeString (balance, 'balance');
            account['used'] = this.safeString (balance, 'locked');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'market': this.marketId (symbol),
            'side': side,
            'volume': amount.toString (),
            'ord_type': type,
        };
        if (type === 'limit') {
            request['price'] = price.toString ();
        }
        const response = await this.privatePostOrders (this.extend (request, params));
        const marketId = this.safeValue (response, 'market');
        const market = this.safeValue (this.markets_by_id, marketId);
        return this.parseOrder (response, market);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'id': id,
        };
        const response = await this.privatePostOrderDelete (this.extend (request, params));
        const order = this.parseOrder (response);
        const status = order['status'];
        if (status === 'closed' || status === 'canceled') {
            throw new OrderNotFound (this.id + ' ' + this.json (order));
        }
        return order;
    }

    parseOrderStatus (status) {
        const statuses = {
            'done': 'closed',
            'wait': 'open',
            'cancel': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        const marketId = this.safeString (order, 'market');
        const symbol = this.safeSymbol (marketId, market);
        const timestamp = this.parse8601 (this.safeString (order, 'created_at'));
        const status = this.parseOrderStatus (this.safeString (order, 'state'));
        const type = this.safeString (order, 'type');
        const side = this.safeString (order, 'side');
        const id = this.safeString (order, 'id');
        return this.safeOrder ({
            'id': id,
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': symbol,
            'type': type,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': this.safeNumber (order, 'price'),
            'stopPrice': undefined,
            'amount': this.safeNumber (order, 'volume'),
            'filled': this.safeNumber (order, 'executed_volume'),
            'remaining': this.safeNumber (order, 'remaining_volume'),
            'trades': undefined,
            'fee': undefined,
            'info': order,
            'cost': undefined,
            'average': undefined,
        });
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'id': parseInt (id),
        };
        const response = await this.privateGetOrder (this.extend (request, params));
        return this.parseOrder (response);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOpenOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        const response = await this.privateGetOrders (this.extend (request, params));
        // todo emulation of fetchClosedOrders, fetchOrders, fetchOrder
        // with order cache + fetchOpenOrders
        // as in BTC-e, Liqui, Yobit, DSX, Tidex, WEX
        return this.parseOrders (response, market, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        const response = await this.privateGetTradesMy (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    nonce () {
        return this.milliseconds ();
    }

    encodeParams (params) {
        if ('orders' in params) {
            const orders = params['orders'];
            let query = this.urlencode (this.keysort (this.omit (params, 'orders')));
            for (let i = 0; i < orders.length; i++) {
                const order = orders[i];
                const keys = Object.keys (order);
                for (let k = 0; k < keys.length; k++) {
                    const key = keys[k];
                    const value = order[key];
                    query += '&orders%5B%5D%5B' + key + '%5D=' + value.toString ();
                }
            }
            return query;
        }
        return this.urlencode (this.keysort (params));
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let request = '/api/' + this.version + '/' + this.implodeParams (path, params);
        if ('extension' in this.urls) {
            request += this.urls['extension'];
        }
        const query = this.omit (params, this.extractParams (path));
        let url = this.urls['api'] + request;
        if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            this.checkRequiredCredentials ();
            const nonce = this.nonce ().toString ();
            const query = this.encodeParams (this.extend ({
                'access_key': this.apiKey,
                'tonce': nonce,
            }, params));
            const auth = method + '|' + request + '|' + query;
            const signed = this.hmac (this.encode (auth), this.encode (this.secret));
            const suffix = query + '&signature=' + signed;
            if (method === 'GET') {
                url += '?' + suffix;
            } else {
                body = suffix;
                headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return;
        }
        if (code === 400) {
            const error = this.safeValue (response, 'error');
            const errorCode = this.safeString (error, 'code');
            const feedback = this.id + ' ' + this.json (response);
            this.throwExactlyMatchedException (this.exceptions, errorCode, feedback);
            // fallback to default error handler
        }
    }
};
