'use strict';

//  ---------------------------------------------------------------------------

const ccxt = require ('ccxt');
const { BadSymbol } = require ('ccxt/js/base/errors');
const { ArrayCache, ArrayCacheByTimestamp, ArrayCacheBySymbolById, NotSupported } = require ('./base/Cache');

//  ---------------------------------------------------------------------------

module.exports = class aax extends ccxt.aax {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchOHLCV': true,
                'watchOrderBook': true,
                'watchTicker': true,
                // 'watchTickers': false, // for now
                'watchTrades': true,
                'watchBalance': true,
                // 'watchStatus': false, // for now
                // 'watchOrders': true,
                // 'watchMyTrades': true,
            },
            'urls': {
                'api': {
                    'ws': {
                        'public': 'wss://realtime.aax.com/marketdata/v2/',
                        'private': 'wss://stream.aax.com/notification/v2/',
                    },
                },
            },
            'options': {
                'OHLCVLimit': 1000,
                'tradesLimit': 1000,
                'ordersLimit': 1000,
                'myTradesLimit': 1000,
            },
        });
    }

    async watchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const name = 'candles';
        const market = this.market (symbol);
        const interval = this.timeframes[timeframe];
        const messageHash = market['id'] + '@' + interval + '_' + name;
        const url = this.urls['api']['ws']['public'];
        const subscribe = {
            'e': 'subscribe',
            'stream': messageHash,
        };
        const request = this.deepExtend (subscribe, params);
        const ohlcv = await this.watch (url, messageHash, request, messageHash);
        if (this.newUpdates) {
            limit = ohlcv.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (ohlcv, since, limit, 0, true);
    }

    handleOHLCV (client, message) {
        //
        //     {
        //         c: '53876.69000000',
        //         e: 'BTCUSDT@1m_candles',
        //         h: '53876.69000000',
        //         l: '53832.47000000',
        //         o: '53832.47000000',
        //         s: 1619707320, // start
        //         t: 1619707346, // end
        //         v: '301.70946400'
        //     }
        //
        const messageHash = this.safeString (message, 'e');
        const parts = messageHash.split ('@');
        const marketId = this.safeString (parts, 0);
        const timeframeName = this.safeString (parts, 1);
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const parsed = [
            this.safeTimestamp (message, 's'),
            this.safeFloat (message, 'o'),
            this.safeFloat (message, 'h'),
            this.safeFloat (message, 'l'),
            this.safeFloat (message, 'c'),
            this.safeFloat (message, 'v'),
        ];
        const subParts = timeframeName.split ('_');
        const interval = this.safeString (subParts, 0);
        const timeframe = this.findTimeframe (interval);
        // TODO: move to base class
        this.ohlcvs[symbol] = this.safeValue (this.ohlcvs, symbol, {});
        let stored = this.safeValue (this.ohlcvs[symbol], timeframe);
        if (stored === undefined) {
            const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
            stored = new ArrayCacheByTimestamp (limit);
            this.ohlcvs[symbol][timeframe] = stored;
        }
        stored.append (parsed);
        client.resolve (stored, messageHash);
    }

    async watchTicker (symbol, params = {}) {
        const name = 'tickers';
        await this.loadMarkets ();
        const market = this.market (symbol);
        const messageHash = market['id'] + '@' + name;
        const url = this.urls['api']['ws']['public'];
        const subscribe = {
            'e': 'subscribe',
            'stream': name,
        };
        const request = this.extend (subscribe, params);
        return await this.watch (url, messageHash, request, name);
    }

    handleTickers (client, message) {
        //
        //     {
        //         e: 'tickers',
        //         t: 1619663715213,
        //         tickers: [
        //             {
        //                 a: '0.00000000',
        //                 c: '47655.65000000',
        //                 d: '-3.48578544',
        //                 h: '50451.37000000',
        //                 l: '47002.45000000',
        //                 o: '49376.82000000',
        //                 s: 'YFIUSDT',
        //                 v: '18140.31675687'
        //             },
        //             {
        //                 a: '0.00000000',
        //                 c: '1.39127000',
        //                 d: '-3.09668252',
        //                 h: '1.43603000',
        //                 l: '1.28451000',
        //                 o: '1.43573000',
        //                 s: 'XRPUSDT',
        //                 v: '451952.36683000'
        //             },
        //         ]
        //     }
        //
        const name = this.safeString (message, 'e');
        const timestamp = this.safeInteger (message, 't');
        const extension = {
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        const tickers = this.parseTickers (this.safeValue (message, 'tickers', []), undefined, extension);
        const symbols = Object.keys (tickers);
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            if (symbol in this.markets) {
                const market = this.market (symbol);
                const ticker = tickers[symbol];
                this.tickers[symbol] = ticker;
                const messageHash = market['id'] + '@' + name;
                client.resolve (ticker, messageHash);
            }
        }
    }

    async watchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        const name = 'trade';
        await this.loadMarkets ();
        const market = this.market (symbol);
        const messageHash = market['id'] + '@' + name;
        const url = this.urls['api']['ws']['public'];
        const subscribe = {
            'e': 'subscribe',
            'stream': messageHash,
        };
        const request = this.extend (subscribe, params);
        const trades = await this.watch (url, messageHash, request, messageHash);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    handleTrades (client, message, subscription) {
        //
        //     {
        //         e: 'BTCUSDT@trade',
        //         p: '-54408.21000000',
        //         q: '0.007700',
        //         t: 1619644477710
        //     }
        //
        const messageHash = this.safeString (message, 'e');
        const parts = messageHash.split ('@');
        const marketId = this.safeString (parts, 0);
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        // const timestamp = this.safeInteger (message, 't');
        // const amount = this.safeNumber (message, 'q');
        // const price = this.safeNumber (message, 'p');
        const trade = this.parseTrade (message, market);
        let stored = this.safeValue (this.trades, symbol);
        if (stored === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            stored = new ArrayCache (limit);
            this.trades[symbol] = stored;
        }
        stored.append (trade);
        client.resolve (stored, messageHash);
    }

    async watchOrderBook (symbol, limit = undefined, params = {}) {
        const name = 'book';
        await this.loadMarkets ();
        const market = this.market (symbol);
        limit = (limit === undefined) ? 20 : limit;
        if ((limit !== 20) && (limit !== 50)) {
            throw new NotSupported (this.id + ' watchOrderBook() accepts limit values of 20 or 50 only');
        }
        const messageHash = market['id'] + '@' + name + '_' + limit.toString ();
        const url = this.urls['api']['ws']['public'];
        const subscribe = {
            'e': 'subscribe',
            'stream': messageHash,
        };
        const request = this.extend (subscribe, params);
        const orderbook = await this.watch (url, messageHash, request, messageHash);
        return orderbook.limit (limit);
    }

    handleDelta (bookside, delta) {
        const price = this.safeFloat (delta, 0);
        const amount = this.safeFloat (delta, 1);
        bookside.store (price, amount);
    }

    handleDeltas (bookside, deltas) {
        for (let i = 0; i < deltas.length; i++) {
            this.handleDelta (bookside, deltas[i]);
        }
    }

    handleOrderBook (client, message) {
        //
        //     {
        //         asks: [
        //             [ '54397.48000000', '0.002300' ],
        //             [ '54407.86000000', '1.880000' ],
        //             [ '54409.34000000', '0.046900' ],
        //         ],
        //         bids: [
        //             [ '54383.17000000', '1.380000' ],
        //             [ '54374.43000000', '1.880000' ],
        //             [ '54354.07000000', '0.013400' ],
        //         ],
        //         e: 'BTCUSDT@book_20',
        //         t: 1619626148086
        //     }
        //
        const messageHash = this.safeString (message, 'e');
        const [ marketId, nameLimit ] = messageHash.split ('@');
        const parts = nameLimit.split ('_');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const limitString = this.safeString (parts, 1);
        const limit = parseInt (limitString);
        const timestamp = this.safeInteger (message, 't');
        const snapshot = this.parseOrderBook (message, symbol, timestamp);
        let orderbook = undefined;
        if (!(symbol in this.orderbooks)) {
            orderbook = this.orderBook (snapshot, limit);
            this.orderbooks[symbol] = orderbook;
        } else {
            orderbook = this.orderbooks[symbol];
            orderbook.reset (snapshot);
        }
        client.resolve (orderbook, messageHash);
    }

    requestId () {
        // their support said that reqid must be an int32, not documented
        const reqid = this.sum (this.safeInteger (this.options, 'reqid', 0), 1);
        this.options['reqid'] = reqid;
        return reqid;
    }

    async handshake (params = {}) {
        const url = this.urls['api']['ws']['private'];
        const client = this.client (url);
        const event = 'handshake';
        const future = client.future (event);
        const authenticated = this.safeValue (client.subscriptions, event);
        if (authenticated === undefined) {
            const requestId = this.requestId ();
            const query = {
                'event': '#' + event,
                'data': {},
                'cid': requestId,
            };
            const request = this.extend (query, params);
            const messageHash = requestId.toString ();
            const response = await this.watch (url, messageHash, request, messageHash);
            future.resolve (response);
        }
        return await future;
    }

    async authenticate (params = {}) {
        const url = this.urls['api']['ws']['private'];
        const client = this.client (url);
        const event = 'login';
        const future = client.future (event);
        const authenticated = this.safeValue (client.subscriptions, event);
        if (authenticated === undefined) {
            const nonce = this.milliseconds ();
            const payload = nonce.toString () + ':' + this.apiKey;
            const signature = this.hmac (this.encode (payload), this.encode (this.secret));
            const requestId = this.requestId ();
            const query = {
                'event': event,
                'data': {
                    'apiKey': this.apiKey,
                    'nonce': nonce,
                    'signature': signature,
                },
                'cid': requestId,
            };
            const request = this.extend (query, params);
            const messageHash = requestId.toString ();
            const response = await this.watch (url, messageHash, request, messageHash);
            //
            //     {
            //         data: {
            //             isAuthenticated: true,
            //             uid: '1362494'
            //         },
            //         rid: 2
            //     }
            //
            //     {
            //         data: {
            //             authError: { name: 'AuthLoginError', message: 'login failed' },
            //             isAuthenticated: false
            //         },
            //         rid: 2
            //     }
            //
            const data = this.safeValue (response, 'data', {});
            const isAuthenticated = this.safeValue (data, 'isAuthenticated', false);
            if (isAuthenticated) {
                future.resolve (response);
            } else {
                throw new ccxt.AuthenticationError (this.id + ' ' + this.json (response));
            }
        }
        return await future;
    }

    async watchBalance (params = {}) {
        await this.loadMarkets ();
        await this.handshake (params);
        await this.authenticate (params);
        const url = this.urls['api']['ws']['private'];


        {"event":"#subscribe","data":{"channel":"user/' + ${USER_ID} + '"},"cid":2}


        const client = this.client (url);
        if (!(type in client.subscriptions)) {
            // reset this.balances after a disconnect
            this.balance[type] = {};
        }
        const messageHash = type + ':balance';
        const message = undefined;
        return await this.watch (url, messageHash, message, type);
    }

    handleBalance (client, message) {
        //
        // sent upon creating or filling an order
        //
        //     {
        //         "e": "outboundAccountPosition", // Event type
        //         "E": 1564034571105,             // Event Time
        //         "u": 1564034571073,             // Time of last account update
        //         "B": [                          // Balances Array
        //             {
        //                 "a": "ETH",                 // Asset
        //                 "f": "10000.000000",        // Free
        //                 "l": "0.000000"             // Locked
        //             }
        //         ]
        //     }
        //
        // future/delivery
        //
        //     {
        //         "e": "ACCOUNT_UPDATE",            // Event Type
        //         "E": 1564745798939,               // Event Time
        //         "T": 1564745798938 ,              // Transaction
        //         "i": "SfsR",                      // Account Alias
        //         "a": {                            // Update Data
        //             "m":"ORDER",                  // Event reason type
        //             "B":[                         // Balances
        //                 {
        //                     "a":"BTC",                // Asset
        //                     "wb":"122624.12345678",   // Wallet Balance
        //                     "cw":"100.12345678"       // Cross Wallet Balance
        //                 },
        //             ],
        //             "P":[
        //                 {
        //                     "s":"BTCUSD_200925",      // Symbol
        //                     "pa":"0",                 // Position Amount
        //                     "ep":"0.0",               // Entry Price
        //                     "cr":"200",               // (Pre-fee) Accumulated Realized
        //                     "up":"0",                 // Unrealized PnL
        //                     "mt":"isolated",          // Margin Type
        //                     "iw":"0.00000000",        // Isolated Wallet (if isolated position)
        //                     "ps":"BOTH"               // Position Side
        //                 },
        //             ]
        //         }
        //     }
        //
        const wallet = this.safeValue (this.options, 'wallet', 'wb'); // cw for cross wallet
        // each account is connected to a different endpoint
        // and has exactly one subscriptionhash which is the account type
        const subscriptions = Object.keys (client.subscriptions);
        const accountType = subscriptions[0];
        const messageHash = accountType + ':balance';
        message = this.safeValue (message, 'a', message);
        this.balance[accountType]['info'] = message;
        const balances = this.safeValue (message, 'B', []);
        for (let i = 0; i < balances.length; i++) {
            const entry = balances[i];
            const currencyId = this.safeString (entry, 'a');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeFloat (entry, 'f');
            account['used'] = this.safeFloat (entry, 'l');
            account['total'] = this.safeFloat (entry, wallet);
            this.balance[accountType][code] = account;
        }
        client.resolve (this.parseBalance (this.balance[accountType]), messageHash);
    }

    handleSystemStatus (client, message) {
        // { e: 'system', status: [ { all: 'active' } ] }
    }

    handleSubscriptionStatus (client, message) {
        //
        // public
        //
        //     { e: 'reply', status: 'ok' }
        //
        // private handshake response
        //
        //     {
        //         data: {
        //             id: 'SID-fqC6a7VTFG6X',
        //             info: "Invalid sid 'null', assigned a new one",
        //             isAuthenticated: false,
        //             pingTimeout: 68000
        //         },
        //         rid: 1
        //     }
        //
        const rid = this.safeString (message, 'rid');
        const subscription = this.safeValue (client.subscriptions, rid);
        if (subscription !== undefined) {
            client.resolve (message, rid);
        }
    }

    handleMessage (client, message) {
        //
        //     {
        //         e: 'system',
        //         status: [
        //             { all: 'active' }
        //         ]
        //     }
        //
        //
        //     {
        //         asks: [
        //             [ '54397.48000000', '0.002300' ],
        //             [ '54407.86000000', '1.880000' ],
        //             [ '54409.34000000', '0.046900' ],
        //         ],
        //         bids: [
        //             [ '54383.17000000', '1.380000' ],
        //             [ '54374.43000000', '1.880000' ],
        //             [ '54354.07000000', '0.013400' ],
        //         ],
        //         e: 'BTCUSDT@book_20',
        //         t: 1619626148086
        //     }
        //
        // server may publish empty events if there is nothing to send right after a new connection is established
        //
        //     {"e":"empty"}
        //
        // private handshake response
        //
        //     {
        //         data: {
        //             id: 'SID-fqC6a7VTFG6X',
        //             info: "Invalid sid 'null', assigned a new one",
        //             isAuthenticated: false,
        //             pingTimeout: 68000
        //         },
        //         rid: 1
        //     }
        //
        const e = this.safeString (message, 'e');
        if (e === undefined) {
            // private
            const rid = this.safeString (message, 'rid');
            if (rid !== undefined) {
                this.handleSubscriptionStatus (client, message);
            }
        } else {
            // public
            const parts = e.split ('@');
            const numParts = parts.length;
            const methods = {
                'reply': this.handleSubscriptionStatus,
                'system': this.handleSystemStatus,
                'book': this.handleOrderBook,
                'trade': this.handleTrades,
                'empty': undefined, // server may publish empty events if there is nothing to send right after a new connection is established
                'tickers': this.handleTickers,
                'candles': this.handleOHLCV,
                'done': this.handleOrder,
            };
            let method = undefined;
            if (numParts > 1) {
                const nameLimit = this.safeString (parts, 1);
                const subParts = nameLimit.split ('_');
                const first = this.safeString (subParts, 0);
                const second = this.safeString (subParts, 1);
                method = this.safeValue2 (methods, first, second);
            } else {
                const name = this.safeString (parts, 0);
                method = this.safeValue (methods, name);
            }
            if (method !== undefined) {
                return method.call (this, client, message);
            }
            //
            // if (method === undefined) {
            //     if (type === 'match') {
            //         if (authenticated) {
            //             this.handleMyTrade (client, message);
            //             this.handleOrder (client, message);
            //         } else {
            //             this.handleTrade (client, message);
            //         }
            //     }
            // } else {
            // }
            // process.exit ();
        }
    }
};
