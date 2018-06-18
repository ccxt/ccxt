'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, DDoSProtection, OrderNotFound, AuthenticationError } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class bitmex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitmex',
            'name': 'BitMEX',
            'countries': 'SC', // Seychelles
            'version': 'v1',
            'userAgent': undefined,
            'rateLimit': 2000,
            'has': {
                'CORS': false,
                'fetchOHLCV': true,
                'withdraw': true,
                'editOrder': true,
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '1h': '1h',
                '1d': '1d',
            },
            'urls': {
                'test': 'https://testnet.bitmex.com',
                'logo': 'https://user-images.githubusercontent.com/1294454/27766319-f653c6e6-5ed4-11e7-933d-f0bc3699ae8f.jpg',
                'api': 'https://www.bitmex.com',
                'www': 'https://www.bitmex.com',
                'doc': [
                    'https://www.bitmex.com/app/apiOverview',
                    'https://github.com/BitMEX/api-connectors/tree/master/official-http',
                ],
                'fees': 'https://www.bitmex.com/app/fees',
            },
            'api': {
                'public': {
                    'get': [
                        'announcement',
                        'announcement/urgent',
                        'funding',
                        'instrument',
                        'instrument/active',
                        'instrument/activeAndIndices',
                        'instrument/activeIntervals',
                        'instrument/compositeIndex',
                        'instrument/indices',
                        'insurance',
                        'leaderboard',
                        'liquidation',
                        'orderBook',
                        'orderBook/L2',
                        'quote',
                        'quote/bucketed',
                        'schema',
                        'schema/websocketHelp',
                        'settlement',
                        'stats',
                        'stats/history',
                        'trade',
                        'trade/bucketed',
                    ],
                },
                'private': {
                    'get': [
                        'apiKey',
                        'chat',
                        'chat/channels',
                        'chat/connected',
                        'execution',
                        'execution/tradeHistory',
                        'notification',
                        'order',
                        'position',
                        'user',
                        'user/affiliateStatus',
                        'user/checkReferralCode',
                        'user/commission',
                        'user/depositAddress',
                        'user/margin',
                        'user/minWithdrawalFee',
                        'user/wallet',
                        'user/walletHistory',
                        'user/walletSummary',
                    ],
                    'post': [
                        'apiKey',
                        'apiKey/disable',
                        'apiKey/enable',
                        'chat',
                        'order',
                        'order/bulk',
                        'order/cancelAllAfter',
                        'order/closePosition',
                        'position/isolate',
                        'position/leverage',
                        'position/riskLimit',
                        'position/transferMargin',
                        'user/cancelWithdrawal',
                        'user/confirmEmail',
                        'user/confirmEnableTFA',
                        'user/confirmWithdrawal',
                        'user/disableTFA',
                        'user/logout',
                        'user/logoutAll',
                        'user/preferences',
                        'user/requestEnableTFA',
                        'user/requestWithdrawal',
                    ],
                    'put': [
                        'order',
                        'order/bulk',
                        'user',
                    ],
                    'delete': [
                        'apiKey',
                        'order',
                        'order/all',
                    ],
                },
            },
            'asyncconf': {
                'conx-tpls': {
                    'default': {
                        'type': 'ws',
                        'baseurl': 'wss://www.bitmex.com/realtime',
                    },
                },
                'methodmap': {
                    '_asyncTimeoutSendPing': '_asyncTimeoutSendPing',
                    '_asyncTimeoutRemoveNonce': '_asyncTimeoutRemoveNonce',
                },
                'events': {
                    'ob': {
                        'conx-tpl': 'default',
                        'generators': {
                            'url': '{baseurl}',
                            'id': '{id}',
                        },
                    },
                },
            },
        });
    }

    async fetchMarkets () {
        let markets = await this.publicGetInstrumentActiveAndIndices ();
        let result = [];
        for (let p = 0; p < markets.length; p++) {
            let market = markets[p];
            let active = (market['state'] !== 'Unlisted');
            let id = market['symbol'];
            let base = market['underlying'];
            let quote = market['quoteCurrency'];
            let type = undefined;
            let future = false;
            let prediction = false;
            let basequote = base + quote;
            base = this.commonCurrencyCode (base);
            quote = this.commonCurrencyCode (quote);
            let swap = (id === basequote);
            let symbol = id;
            if (swap) {
                type = 'swap';
                symbol = base + '/' + quote;
            } else if (id.indexOf ('B_') >= 0) {
                prediction = true;
                type = 'prediction';
            } else {
                future = true;
                type = 'future';
            }
            let precision = {
                'amount': undefined,
                'price': undefined,
            };
            if (market['lotSize'])
                precision['amount'] = this.precisionFromString (this.truncate_to_string (market['lotSize'], 16));
            if (market['tickSize'])
                precision['price'] = this.precisionFromString (this.truncate_to_string (market['tickSize'], 16));
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'active': active,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': market['lotSize'],
                        'max': market['maxOrderQty'],
                    },
                    'price': {
                        'min': market['tickSize'],
                        'max': market['maxPrice'],
                    },
                },
                'taker': market['takerFee'],
                'maker': market['makerFee'],
                'type': type,
                'spot': false,
                'swap': swap,
                'future': future,
                'prediction': prediction,
                'info': market,
            });
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privateGetUserMargin ({ 'currency': 'all' });
        let result = { 'info': response };
        for (let b = 0; b < response.length; b++) {
            let balance = response[b];
            let currency = balance['currency'].toUpperCase ();
            currency = this.commonCurrencyCode (currency);
            let account = {
                'free': balance['availableMargin'],
                'used': 0.0,
                'total': balance['marginBalance'],
            };
            if (currency === 'BTC') {
                account['free'] = account['free'] * 0.00000001;
                account['total'] = account['total'] * 0.00000001;
            }
            account['used'] = account['total'] - account['free'];
            result[currency] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'symbol': market['id'],
        };
        if (typeof limit !== 'undefined')
            request['depth'] = limit;
        let orderbook = await this.publicGetOrderBookL2 (this.extend (request, params));
        let result = {
            'bids': [],
            'asks': [],
            'timestamp': undefined,
            'datetime': undefined,
            'nonce': undefined,
        };
        for (let o = 0; o < orderbook.length; o++) {
            let order = orderbook[o];
            let side = (order['side'] === 'Sell') ? 'asks' : 'bids';
            let amount = order['size'];
            let price = order['price'];
            result[side].push ([ price, amount ]);
        }
        result['bids'] = this.sortBy (result['bids'], 0, true);
        result['asks'] = this.sortBy (result['asks'], 0);
        return result;
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        let filter = { 'filter': { 'orderID': id }};
        let result = await this.fetchOrders (symbol, undefined, undefined, this.deepExtend (filter, params));
        let numResults = result.length;
        if (numResults === 1)
            return result[0];
        throw new OrderNotFound (this.id + ': The order ' + id + ' not found.');
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        let request = {};
        if (typeof symbol !== 'undefined') {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (typeof since !== 'undefined')
            request['startTime'] = this.iso8601 (since);
        if (typeof limit !== 'undefined')
            request['count'] = limit;
        request = this.deepExtend (request, params);
        // why the hassle? urlencode in python is kinda broken for nested dicts.
        // E.g. self.urlencode({"filter": {"open": True}}) will return "filter={'open':+True}"
        // Bitmex doesn't like that. Hence resorting to this hack.
        if ('filter' in request)
            request['filter'] = this.json (request['filter']);
        let response = await this.privateGetOrder (request);
        return this.parseOrders (response, market, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        let filter_params = { 'filter': { 'open': true }};
        return await this.fetchOrders (symbol, since, limit, this.deepExtend (filter_params, params));
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        // Bitmex barfs if you set 'open': false in the filter...
        let orders = await this.fetchOrders (symbol, since, limit, params);
        return this.filterBy (orders, 'status', 'closed');
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        if (!market['active'])
            throw new ExchangeError (this.id + ': symbol ' + symbol + ' is delisted');
        let request = this.extend ({
            'symbol': market['id'],
            'binSize': '1d',
            'partial': true,
            'count': 1,
            'reverse': true,
        }, params);
        let quotes = await this.publicGetQuoteBucketed (request);
        let quotesLength = quotes.length;
        let quote = quotes[quotesLength - 1];
        let tickers = await this.publicGetTradeBucketed (request);
        let ticker = tickers[0];
        let timestamp = this.milliseconds ();
        let open = this.safeFloat (ticker, 'open');
        let close = this.safeFloat (ticker, 'close');
        let change = close - open;
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': parseFloat (ticker['high']),
            'low': parseFloat (ticker['low']),
            'bid': parseFloat (quote['bidPrice']),
            'bidVolume': undefined,
            'ask': parseFloat (quote['askPrice']),
            'askVolume': undefined,
            'vwap': parseFloat (ticker['vwap']),
            'open': open,
            'close': close,
            'last': close,
            'previousClose': undefined,
            'change': change,
            'percentage': change / open * 100,
            'average': this.sum (open, close) / 2,
            'baseVolume': parseFloat (ticker['homeNotional']),
            'quoteVolume': parseFloat (ticker['foreignNotional']),
            'info': ticker,
        };
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        let timestamp = this.parse8601 (ohlcv['timestamp']) - this.parseTimeframe (timeframe) * 1000;
        return [
            timestamp,
            ohlcv['open'],
            ohlcv['high'],
            ohlcv['low'],
            ohlcv['close'],
            ohlcv['volume'],
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        // send JSON key/value pairs, such as {"key": "value"}
        // filter by individual fields and do advanced queries on timestamps
        // let filter = { 'key': 'value' };
        // send a bare series (e.g. XBU) to nearest expiring contract in that series
        // you can also send a timeframe, e.g. XBU:monthly
        // timeframes: daily, weekly, monthly, quarterly, and biquarterly
        let market = this.market (symbol);
        let request = {
            'symbol': market['id'],
            'binSize': this.timeframes[timeframe],
            'partial': true,     // true == include yet-incomplete current bins
            // 'filter': filter, // filter by individual fields and do advanced queries
            // 'columns': [],    // will return all columns if omitted
            // 'start': 0,       // starting point for results (wtf?)
            // 'reverse': false, // true == newest first
            // 'endTime': '',    // ending date filter for results
        };
        if (typeof limit !== 'undefined')
            request['count'] = limit; // default 100, max 500
        // if since is not set, they will return candles starting from 2017-01-01
        if (typeof since !== 'undefined') {
            let ymdhms = this.ymdhms (since);
            let ymdhm = ymdhms.slice (0, 16);
            request['startTime'] = ymdhm; // starting date filter for results
        }
        let response = await this.publicGetTradeBucketed (this.extend (request, params));
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    parseTrade (trade, market = undefined) {
        let timestamp = this.parse8601 (trade['timestamp']);
        let symbol = undefined;
        if (!market) {
            if ('symbol' in trade)
                market = this.markets_by_id[trade['symbol']];
        }
        if (market)
            symbol = market['symbol'];
        return {
            'id': trade['trdMatchID'],
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': undefined,
            'type': undefined,
            'side': trade['side'].toLowerCase (),
            'price': trade['price'],
            'amount': trade['size'],
        };
    }

    parseOrderStatus (status) {
        let statuses = {
            'new': 'open',
            'partiallyfilled': 'open',
            'filled': 'closed',
            'canceled': 'canceled',
            'rejected': 'rejected',
            'expired': 'expired',
        };
        return this.safeString (statuses, status.toLowerCase ());
    }

    parseOrder (order, market = undefined) {
        let status = this.safeValue (order, 'ordStatus');
        if (typeof status !== 'undefined')
            status = this.parseOrderStatus (status);
        let symbol = undefined;
        if (market) {
            symbol = market['symbol'];
        } else {
            let id = order['symbol'];
            if (id in this.markets_by_id) {
                market = this.markets_by_id[id];
                symbol = market['symbol'];
            }
        }
        let datetime_value = undefined;
        let timestamp = undefined;
        let iso8601 = undefined;
        if ('timestamp' in order)
            datetime_value = order['timestamp'];
        else if ('transactTime' in order)
            datetime_value = order['transactTime'];
        if (typeof datetime_value !== 'undefined') {
            timestamp = this.parse8601 (datetime_value);
            iso8601 = this.iso8601 (timestamp);
        }
        let price = this.safeFloat (order, 'price');
        let amount = parseFloat (order['orderQty']);
        let filled = this.safeFloat (order, 'cumQty', 0.0);
        let remaining = Math.max (amount - filled, 0.0);
        let cost = undefined;
        if (typeof price !== 'undefined')
            if (typeof filled !== 'undefined')
                cost = price * filled;
        let result = {
            'info': order,
            'id': order['orderID'].toString (),
            'timestamp': timestamp,
            'datetime': iso8601,
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': order['ordType'].toLowerCase (),
            'side': order['side'].toLowerCase (),
            'price': price,
            'amount': amount,
            'cost': cost,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': undefined,
        };
        return result;
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'symbol': market['id'],
        };
        if (typeof since !== 'undefined')
            request['startTime'] = this.iso8601 (since);
        if (typeof limit !== 'undefined')
            request['count'] = limit;
        let response = await this.publicGetTrade (this.extend (request, params));
        return this.parseTrades (response, market);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let request = {
            'symbol': this.marketId (symbol),
            'side': this.capitalize (side),
            'orderQty': amount,
            'ordType': this.capitalize (type),
        };
        if (typeof price !== 'undefined')
            request['price'] = price;
        let response = await this.privatePostOrder (this.extend (request, params));
        let order = this.parseOrder (response);
        let id = order['id'];
        this.orders[id] = order;
        return this.extend ({ 'info': response }, order);
    }

    async editOrder (id, symbol, type, side, amount = undefined, price = undefined, params = {}) {
        await this.loadMarkets ();
        let request = {
            'orderID': id,
        };
        if (typeof amount !== 'undefined')
            request['orderQty'] = amount;
        if (typeof price !== 'undefined')
            request['price'] = price;
        let response = await this.privatePutOrder (this.extend (request, params));
        let order = this.parseOrder (response);
        this.orders[order['id']] = order;
        return this.extend ({ 'info': response }, order);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.privateDeleteOrder (this.extend ({ 'orderID': id }, params));
        let order = response[0];
        let error = this.safeString (order, 'error');
        if (typeof error !== 'undefined')
            if (error.indexOf ('Unable to cancel order due to existing state') >= 0)
                throw new OrderNotFound (this.id + ' cancelOrder() failed: ' + error);
        order = this.parseOrder (order);
        this.orders[order['id']] = order;
        return this.extend ({ 'info': response }, order);
    }

    isFiat (currency) {
        if (currency === 'EUR')
            return true;
        if (currency === 'PLN')
            return true;
        return false;
    }

    async withdraw (currency, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        await this.loadMarkets ();
        if (currency !== 'BTC')
            throw new ExchangeError (this.id + ' supoprts BTC withdrawals only, other currencies coming soon...');
        let request = {
            'currency': 'XBt', // temporarily
            'amount': amount,
            'address': address,
            // 'otpToken': '123456', // requires if two-factor auth (OTP) is enabled
            // 'fee': 0.001, // bitcoin network fee
        };
        let response = await this.privatePostUserRequestWithdrawal (this.extend (request, params));
        return {
            'info': response,
            'id': response['transactID'],
        };
    }

    handleErrors (code, reason, url, method, headers, body) {
        if (code === 429)
            throw new DDoSProtection (this.id + ' ' + body);
        if (code >= 400) {
            if (body) {
                if (body[0] === '{') {
                    let response = JSON.parse (body);
                    if ('error' in response) {
                        if ('message' in response['error']) {
                            let message = this.safeValue (response['error'], 'message');
                            if (typeof message !== 'undefined') {
                                if (message === 'Invalid API Key.')
                                    throw new AuthenticationError (this.id + ' ' + this.json (response));
                            }
                            // stub code, need proper handling
                            throw new ExchangeError (this.id + ' ' + this.json (response));
                        }
                    }
                }
            }
        }
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let query = '/api' + '/' + this.version + '/' + path;
        if (method !== 'PUT')
            if (Object.keys (params).length)
                query += '?' + this.urlencode (params);
        let url = this.urls['api'] + query;
        if (api === 'private') {
            this.checkRequiredCredentials ();
            let nonce = this.nonce ().toString ();
            let auth = method + query + nonce;
            if (method === 'POST' || method === 'PUT') {
                if (Object.keys (params).length) {
                    body = this.json (params);
                    auth += body;
                }
            }
            headers = {
                'Content-Type': 'application/json',
                'api-nonce': nonce,
                'api-key': this.apiKey,
                'api-signature': this.hmac (this.encode (auth), this.encode (this.secret)),
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    _asyncOnMsg (data, conxid = 'default') {
        // send ping after 5 seconds if not message received
        let lastTimer = this.safeValue (this.asyncContext['_'], 'timer');
        if (typeof lastTimer !== 'undefined') {
            this._asyncTimeoutCancel (lastTimer);
        }
        this.asyncContext['_']['timer'] = this._asyncTimeoutSet (5000, this._asyncMethodMap ('_asyncTimeoutSendPing'), []);
        if (data === 'pong') {
            return;
        }
        let msg = this.asyncParseJson (data);
        let table = this.safeString (msg, 'table');
        let subscribe = this.safeString (msg, 'subscribe');
        let unsubscribe = this.safeString (msg, 'unsubscribe');
        let status = this.safeInteger (msg, 'status');
        if (typeof subscribe !== 'undefined') {
            this._asyncHandleSubscription ('ob', msg, conxid);
        } else if (typeof unsubscribe !== 'undefined') {
            this._asyncHandleUnsubscription ('ob', msg, conxid);
        } else if (typeof table !== 'undefined') {
            if (table === 'orderBookL2') {
                this._asyncHandleOb (msg, conxid);
            }
        } else if (typeof status !== 'undefined') {
            this._asyncHandleError (msg, conxid);
        }
    }

    _asyncTimeoutSendPing () {
        this.asyncSend ('ping');
    }

    _asyncHandleError (msg, conxid = 'default') {
        let status = this.safeInteger (msg, 'status');
        let error = this.safeString (msg, 'error');
        this.emit ('err', new ExchangeError (this.id + ' status ' + status + ':' + error), conxid);
    }

    _asyncHandleSubscription (event, msg, conxid = 'default') {
        let success = this.safeValue (msg, 'success');
        let subscribe = this.safeString (msg, 'subscribe');
        let parts = subscribe.split (':');
        let partsLen = parts.length;
        if (partsLen === 2) {
            if (parts[0] === 'orderBookL2') {
                let symbol = this.findSymbol (parts[1]);
                if ('sub-nonces' in this.asyncContext[event][symbol]['data']) {
                    let nonces = this.asyncContext[event][symbol]['data']['sub-nonces'];
                    const keys = Object.keys (nonces);
                    for (let i = 0; i < keys.length; i++) {
                        let nonce = keys[i];
                        this._asyncTimeoutCancel (nonces[nonce]);
                        this.emit (nonce, success);
                    }
                    this.asyncContext[event][symbol]['data']['sub-nonces'] = {};
                }
            }
        }
    }

    _asyncHandleUnsubscription (event, msg, conxid = 'default') {
        let success = this.safeValue (msg, 'success');
        let unsubscribe = this.safeString (msg, 'unsubscribe');
        let parts = unsubscribe.split (':');
        let partsLen = parts.length;
        if (partsLen === 2) {
            if (parts[0] === 'orderBookL2') {
                let symbol = this.findSymbol (parts[1]);
                if (success) {
                    if (symbol in this.asyncContext['_']['dbids']) {
                        this.omit (this.asyncContext['_']['dbids'], symbol);
                    }
                }
                if ('unsub-nonces' in this.asyncContext[event][symbol]['data']) {
                    let nonces = this.asyncContext[event][symbol]['data']['unsub-nonces'];
                    const keys = Object.keys (nonces);
                    for (let i = 0; i < keys.length; i++) {
                        let nonce = keys[i];
                        this._asyncTimeoutCancel (nonces[nonce]);
                        this.emit (nonce, success);
                    }
                    this.asyncContext[event][symbol]['data']['unsub-nonces'] = {};
                }
            }
        }
    }


    _asyncHandleOb (msg, conxid = 'default') {
        let action = this.safeString (msg, 'action');
        let data = this.safeValue (msg, 'data');
        let symbol = this.safeString (data[0], 'symbol');
        symbol = this.findSymbol (symbol);
        if (action === 'partial') {
            let ob = {
                'bids': [],
                'asks': [],
                'timestamp': undefined,
                'datetime': undefined,
                'nonce': undefined,
            };
            let obIds = {};
            for (let o = 0; o < data.length; o++) {
                let order = data[o];
                let side = (order['side'] === 'Sell') ? 'asks' : 'bids';
                let amount = order['size'];
                let price = order['price'];
                let priceId = order['id'];
                ob[side].push ([ price, amount ]);
                obIds[priceId] = price;
            }
            ob['bids'] = this.sortBy (ob['bids'], 0, true);
            ob['asks'] = this.sortBy (ob['asks'], 0);
            this.asyncContext['ob'][symbol]['data']['ob'] = ob;
            this.asyncContext['_']['dbids'][symbol] = obIds;
            this.emit ('ob', symbol, ob);
        } else if (action === 'update') {
            if (symbol in this.asyncContext['_']['dbids']) {
                let obIds = this.asyncContext['_']['dbids'][symbol];
                let curob = this.asyncContext['ob'][symbol]['data']['ob'];
                for (let o = 0; o < data.length; o++) {
                    let order = data[o];
                    let amount = order['size'];
                    let side = (order['side'] === 'Sell') ? 'asks' : 'bids';
                    let priceId = order['id'];
                    let price = obIds[priceId];
                    this.updateBidAsk ([price, amount], curob[side], order['side'] === 'Buy');
                }
                this.asyncContext['ob'][symbol]['data']['ob'] = curob;
                this.emit ('ob', symbol, this._cloneOrderBook (curob));
            }
        } else if (action === 'insert') {
            if (symbol in this.asyncContext['_']['dbids']) {
                let curob = this.asyncContext['ob'][symbol]['data']['ob'];
                for (let o = 0; o < data.length; o++) {
                    let order = data[o];
                    let amount = order['size'];
                    let side = (order['side'] === 'Sell') ? 'asks' : 'bids';
                    let priceId = order['id'];
                    let price = order['price'];
                    this.updateBidAsk ([price, amount], curob[side], order['side'] === 'Buy');
                    this.asyncContext['_']['dbids'][symbol][priceId] = price;
                }
                this.asyncContext['ob'][symbol]['data']['ob'] = curob;
                this.emit ('ob', symbol, this._cloneOrderBook (curob));
            }
        } else if (action === 'delete') {
            if (symbol in this.asyncContext['_']['dbids']) {
                let obIds = this.asyncContext['_']['dbids'][symbol];
                let curob = this.asyncContext['ob'][symbol]['data']['ob'];
                for (let o = 0; o < data.length; o++) {
                    let order = data[o];
                    let side = (order['side'] === 'Sell') ? 'asks' : 'bids';
                    let priceId = order['id'];
                    let price = obIds[priceId];
                    this.updateBidAsk ([price, 0], curob[side], order['side'] === 'Buy');
                    this.omit (this.asyncContext['_']['dbids'][symbol], priceId);
                }
                this.asyncContext['ob'][symbol]['data']['ob'] = curob;
                this.emit ('ob', symbol, this._cloneOrderBook (curob));
            }
        } else {
            this.emit ('err', new ExchangeError (this.id + ' invalid orderbook message'));
        }
    }

    _asyncSubscribe (event, symbol, nonce) {
        if (event !== 'ob') {
            throw new NotSupported ('subscribe ' + event + '(' + symbol + ') not supported for exchange ' + this.id);
        }
        let id = this.market_id (symbol).toUpperCase ();
        let payload = {
            'op': 'subscribe',
            'args': ['orderBookL2:' + id],
        };
        if (!('sub-nonces' in this.asyncContext[event][symbol]['data'])) {
            this.asyncContext[event][symbol]['data']['sub-nonces'] = {};
        }
        let nonceStr = nonce.toString ();
        let handle = this._asyncTimeoutSet (this.timeout, this._asyncMethodMap ('_asyncTimeoutRemoveNonce'), [nonceStr, event, symbol, 'sub-nonce']);
        this.asyncContext[event][symbol]['data']['sub-nonces'][nonceStr] = handle;
        this.asyncSendJson (payload);
    }

    _asyncUnsubscribe (event, symbol, nonce) {
        if (event !== 'ob') {
            throw new NotSupported ('unsubscribe ' + event + '(' + symbol + ') not supported for exchange ' + this.id);
        }
        let id = this.market_id (symbol).toUpperCase ();
        let payload = {
            'op': 'unsubscribe',
            'args': ['orderBookL2:' + id],
        };
        if (!('unsub-nonces' in this.asyncContext[event][symbol]['data'])) {
            this.asyncContext[event][symbol]['data']['unsub-nonces'] = {};
        }
        let nonceStr = nonce.toString ();
        let handle = this._asyncTimeoutSet (this.timeout, this._asyncMethodMap ('_asyncTimeoutRemoveNonce'), [nonceStr, event, symbol, 'unsub-nonces']);
        this.asyncContext[event][symbol]['data']['unsub-nonces'][nonceStr] = handle;
        this.asyncSendJson (payload);
    }

    _asyncTimeoutRemoveNonce (timerNonce, event, symbol, key) {
        if (key in this.asyncContext[event][symbol]['data']) {
            let nonces = this.asyncContext[event][symbol]['data'][key];
            if (timerNonce in nonces) {
                this.omit (this.asyncContext[event][symbol]['data'][key], timerNonce);
            }
        }
    }

    _asyncEventOnOpen (conxid, asyncoptions) {
        this.asyncContext['_']['dbids'] = {};
        // send auth
        // let nonce = this.nonce ();
        // let signature = this.hmac (this.encode ('GET/realtime' + nonce.toString ()), this.encode (this.secret));
        // let payload = {
        //     'op': 'authKeyExpires',
        //     'args': [this.apiKey, nonce, signature]
        //  };
        // this.asyncSendJson (payload);
    }
};
