'use strict';

//  ---------------------------------------------------------------------------

const ccxt = require ('ccxt');
const { ArgumentsRequired, AuthenticationError } = require ('ccxt/js/base/errors');
const { ArrayCache, ArrayCacheByTimestamp } = require ('./base/Cache');

//  ---------------------------------------------------------------------------

module.exports = class okex extends ccxt.okex {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchTicker': true,
                // 'watchTickers': false, // for now
                'watchOrderBook': true,
                'watchTrades': true,
                // 'watchBalance': true,
                // 'watchOHLCV': true,
            },
            'urls': {
                'api': {
                    'ws': {
                        'public': 'wss://ws.okex.com:8443/ws/v5/public', // wss://wsaws.okex.com:8443/ws/v5/public
                        'private': 'wss://ws.okex.com:8443/ws/v5/private', // wss://wsaws.okex.com:8443/ws/v5/private
                    },
                },
                'test': {
                    'ws': {
                        'public': 'wss://wspap.okex.com:8443/ws/v5/public?brokerId=9999',
                        'private': 'wss://wspap.okex.com:8443/ws/v5/private?brokerId=9999',
                    },
                },
            },
            'options': {
                'watchOrderBook': {
                    // books, 400 depth levels will be pushed in the initial full snapshot. Incremental data will be pushed every 100 ms when there is change in order book.
                    // books5, 5 depth levels will be pushed every time. Data will be pushed every 100 ms when there is change in order book.
                    // books50-l2-tbt, 50 depth levels will be pushed in the initial full snapshot. Incremental data will be pushed tick by tick, i.e. whenever there is change in order book.
                    // books-l2-tbt, 400 depth levels will be pushed in the initial full snapshot. Incremental data will be pushed tick by tick, i.e. whenever there is change in order book.
                    'depth': 'books-l2-tbt',
                },
                'watchBalance': 'spot', // margin, futures, swap
                'ws': {
                    // 'inflate': true,
                },
            },
            'streaming': {
                // okex does not support built-in ws protocol-level ping-pong
                // instead it requires a custom text-based ping-pong
                'ping': this.ping,
                'keepAlive': 20000,
            },
        });
    }

    async subscribe (access, channel, symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const url = this.urls['api']['ws'][access];
        const messageHash = channel + ':' + market['id'];
        const request = {
            'op': 'subscribe',
            'args': [
                {
                    'channel': channel,
                    'instId': market['id'],
                },
            ],
        };
        return await this.watch (url, messageHash, this.deepExtend (request, params), messageHash);
    }

    async watchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        const trades = await this.subscribe ('public', 'trades', symbol, params);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    handleTrades (client, message) {
        //
        //     {
        //         arg: { channel: 'trades', instId: 'BTC-USDT' },
        //         data: [
        //             {
        //                 instId: 'BTC-USDT',
        //                 tradeId: '216970876',
        //                 px: '31684.5',
        //                 sz: '0.00001186',
        //                 side: 'buy',
        //                 ts: '1626531038288'
        //             }
        //         ]
        //     }
        //
        const arg = this.safeValue (message, 'arg', {});
        const channel = this.safeString (arg, 'channel');
        const data = this.safeValue (message, 'data', []);
        const tradesLimit = this.safeInteger (this.options, 'tradesLimit', 1000);
        for (let i = 0; i < data.length; i++) {
            const trade = this.parseTrade (data[i]);
            const symbol = trade['symbol'];
            const marketId = this.safeString (trade['info'], 'instId');
            const messageHash = channel + ':' + marketId;
            let stored = this.safeValue (this.trades, symbol);
            if (stored === undefined) {
                stored = new ArrayCache (tradesLimit);
                this.trades[symbol] = stored;
            }
            stored.append (trade);
            client.resolve (stored, messageHash);
        }
        return message;
    }

    async watchTicker (symbol, params = {}) {
        return await this.subscribe ('public', 'tickers', symbol, params);
    }

    handleTicker (client, message) {
        //
        //     {
        //         arg: { channel: 'tickers', instId: 'BTC-USDT' },
        //         data: [
        //             {
        //                 instType: 'SPOT',
        //                 instId: 'BTC-USDT',
        //                 last: '31500.1',
        //                 lastSz: '0.00001754',
        //                 askPx: '31500.1',
        //                 askSz: '0.00998144',
        //                 bidPx: '31500',
        //                 bidSz: '3.05652439',
        //                 open24h: '31697',
        //                 high24h: '32248',
        //                 low24h: '31165.6',
        //                 sodUtc0: '31385.5',
        //                 sodUtc8: '32134.9',
        //                 volCcy24h: '503403597.38138519',
        //                 vol24h: '15937.10781721',
        //                 ts: '1626526618762'
        //             }
        //         ]
        //     }
        //
        const arg = this.safeValue (message, 'arg', {});
        const channel = this.safeString (arg, 'channel');
        const data = this.safeValue (message, 'data', []);
        for (let i = 0; i < data.length; i++) {
            const ticker = this.parseTicker (data[i]);
            const symbol = ticker['symbol'];
            const marketId = this.safeString (ticker['info'], 'instId');
            const messageHash = channel + ':' + marketId;
            this.tickers[symbol] = ticker;
            client.resolve (ticker, messageHash);
        }
        return message;
    }

    async watchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        const interval = this.timeframes[timeframe];
        const name = 'candle' + interval + 's';
        const ohlcv = await this.subscribe ('public', name, symbol, params);
        if (this.newUpdates) {
            limit = ohlcv.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (ohlcv, since, limit, 0, true);
    }

    handleOHLCV (client, message) {
        //
        //     {
        //         table: "spot/candle60s",
        //         data: [
        //             {
        //                 candle: [
        //                     "2020-03-16T14:29:00.000Z",
        //                     "4948.3",
        //                     "4966.7",
        //                     "4939.1",
        //                     "4945.3",
        //                     "238.36021657"
        //                 ],
        //                 instrument_id: "BTC-USDT"
        //             }
        //         ]
        //     }
        //
        const table = this.safeString (message, 'table');
        const data = this.safeValue (message, 'data', []);
        const parts = table.split ('/');
        const part1 = this.safeString (parts, 1);
        let interval = part1.replace ('candle', '');
        interval = interval.replace ('s', '');
        // use a reverse lookup in a static map instead
        const timeframe = this.findTimeframe (interval);
        for (let i = 0; i < data.length; i++) {
            const marketId = this.safeString (data[i], 'instrument_id');
            const candle = this.safeValue (data[i], 'candle');
            const market = this.safeMarket (marketId);
            const symbol = market['symbol'];
            const parsed = this.parseOHLCV (candle, market);
            this.ohlcvs[symbol] = this.safeValue (this.ohlcvs, symbol, {});
            let stored = this.safeValue (this.ohlcvs[symbol], timeframe);
            if (stored === undefined) {
                const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
                stored = new ArrayCacheByTimestamp (limit);
                this.ohlcvs[symbol][timeframe] = stored;
            }
            stored.append (parsed);
            const messageHash = table + ':' + marketId;
            client.resolve (stored, messageHash);
        }
    }

    async watchOrderBook (symbol, limit = undefined, params = {}) {
        const options = this.safeValue (this.options, 'watchOrderBook', {});
        // books, 400 depth levels will be pushed in the initial full snapshot. Incremental data will be pushed every 100 ms when there is change in order book.
        // books5, 5 depth levels will be pushed every time. Data will be pushed every 100 ms when there is change in order book.
        // books50-l2-tbt, 50 depth levels will be pushed in the initial full snapshot. Incremental data will be pushed tick by tick, i.e. whenever there is change in order book.
        // books-l2-tbt, 400 depth levels will be pushed in the initial full snapshot. Incremental data will be pushed tick by tick, i.e. whenever there is change in order book.
        const depth = this.safeString (options, 'depth', 'books-l2-tbt');
        const orderbook = await this.subscribe ('public', depth, symbol, params);
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

    handleOrderBookMessage (client, message, orderbook) {
        //
        //     {
        //         instrument_id: "BTC-USDT",
        //         asks: [
        //             ["4568.5", "0.49723138", "2"],
        //             ["4568.7", "0.5013", "1"],
        //             ["4569.1", "0.4398", "1"],
        //         ],
        //         bids: [
        //             ["4568.4", "0.84187666", "5"],
        //             ["4568.3", "0.75661506", "6"],
        //             ["4567.8", "2.01", "2"],
        //         ],
        //         timestamp: "2020-03-16T11:11:43.388Z",
        //         checksum: 473370408
        //     }
        //
        const asks = this.safeValue (message, 'asks', []);
        const bids = this.safeValue (message, 'bids', []);
        this.handleDeltas (orderbook['asks'], asks);
        this.handleDeltas (orderbook['bids'], bids);
        const timestamp = this.parse8601 (this.safeString (message, 'timestamp'));
        orderbook['timestamp'] = timestamp;
        orderbook['datetime'] = this.iso8601 (timestamp);
        return orderbook;
    }

    handleOrderBook (client, message) {
        //
        // snapshot
        //
        //     {
        //         arg: { channel: 'books-l2-tbt', instId: 'BTC-USDT' },
        //         action: 'snapshot',
        //         data: [
        //             {
        //                 asks: [
        //                     [ '31685', '0.78069158', '0', '17' ],
        //                     [ '31685.1', '0.0001', '0', '1' ],
        //                     [ '31685.6', '0.04543165', '0', '1' ],
        //                 ],
        //                 bids: [
        //                     [ '31684.9', '0.01', '0', '1' ],
        //                     [ '31682.9', '0.0001', '0', '1' ],
        //                     [ '31680.7', '0.01', '0', '1' ],
        //                 ],
        //                 ts: '1626532416403',
        //                 checksum: -1023440116
        //             }
        //         ]
        //     }
        //
        // update
        //
        //     {
        //         arg: { channel: 'books-l2-tbt', instId: 'BTC-USDT' },
        //         action: 'update',
        //         data: [
        //             {
        //                 asks: [
        //                     [ '31657.7', '0', '0', '0' ],
        //                     [ '31659.7', '0.01', '0', '1' ],
        //                     [ '31987.3', '0.01', '0', '1' ]
        //                 ],
        //                 bids: [
        //                     [ '31642.9', '0.50296385', '0', '4' ],
        //                     [ '31639.9', '0', '0', '0' ],
        //                     [ '31638.7', '0.01', '0', '1' ],
        //                 ],
        //                 ts: '1626535709008',
        //                 checksum: 830931827
        //             }
        //         ]
        //     }
        //
        const arg = this.safeValue (message, 'arg', {});
        const channel = this.safeString (arg, 'channel');
        const action = this.safeString (message, 'action');
        const data = this.safeValue (message, 'data', []);
        const marketId = this.safeString (arg, 'instId');
        const symbol = this.safeSymbol (marketId);
        const depths = {
            'books': 400,
            'books5': 5,
            'books-l2-tbt': 400,
            'books50-l2-tbt': 50,
        };
        const limit = this.safeInteger (depths, channel);
        if (action === 'snapshot') {
            for (let i = 0; i < data.length; i++) {
                const update = data[i];
                const orderbook = this.orderBook ({}, limit);
                this.orderbooks[symbol] = orderbook;
                this.handleOrderBookMessage (client, update, orderbook);
                const messageHash = channel + ':' + marketId;
                client.resolve (orderbook, messageHash);
            }
        } else {
            for (let i = 0; i < data.length; i++) {
                const update = data[i];
                if (symbol in this.orderbooks) {
                    const orderbook = this.orderbooks[symbol];
                    this.handleOrderBookMessage (client, update, orderbook);
                    const messageHash = channel + ':' + marketId;
                    client.resolve (orderbook, messageHash);
                }
            }
        }
        return message;
    }

    async authenticate (params = {}) {
        this.checkRequiredCredentials ();
        const url = this.urls['api']['ws'];
        const messageHash = 'login';
        const client = this.client (url);
        let future = this.safeValue (client.subscriptions, messageHash);
        if (future === undefined) {
            future = client.future ('authenticated');
            const timestamp = this.seconds ().toString ();
            const method = 'GET';
            const path = '/users/self/verify';
            const auth = timestamp + method + path;
            const signature = this.hmac (this.encode (auth), this.encode (this.secret), 'sha256', 'base64');
            const request = {
                'op': messageHash,
                'args': [
                    this.apiKey,
                    this.password,
                    timestamp,
                    signature,
                ],
            };
            this.spawn (this.watch, url, messageHash, request, messageHash, future);
        }
        return await future;
    }

    async watchBalance (params = {}) {
        const defaultType = this.safeString2 (this.options, 'watchBalance', 'defaultType');
        const type = this.safeString (params, 'type', defaultType);
        if (type === undefined) {
            throw new ArgumentsRequired (this.id + " watchBalance requires a type parameter (one of 'spot', 'margin', 'futures', 'swap')");
        }
        // const query = this.omit (params, 'type');
        const negotiation = await this.authenticate ();
        return await this.subscribeToUserAccount (negotiation, params);
    }

    async subscribeToUserAccount (negotiation, params = {}) {
        const defaultType = this.safeString2 (this.options, 'watchBalance', 'defaultType');
        const type = this.safeString (params, 'type', defaultType);
        if (type === undefined) {
            throw new ArgumentsRequired (this.id + " watchBalance requires a type parameter (one of 'spot', 'margin', 'futures', 'swap')");
        }
        await this.loadMarkets ();
        const currencyId = this.safeString (params, 'currency');
        const code = this.safeString (params, 'code', this.safeCurrencyCode (currencyId));
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
        }
        const marketId = this.safeString (params, 'instrument_id');
        const symbol = this.safeString (params, 'symbol');
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        } else if (marketId !== undefined) {
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
            }
        }
        const marketUndefined = (market === undefined);
        const currencyUndefined = (currency === undefined);
        if (type === 'spot') {
            if (currencyUndefined) {
                throw new ArgumentsRequired (this.id + " watchBalance requires a 'currency' (id) or a unified 'code' parameter for " + type + ' accounts');
            }
        } else if ((type === 'margin') || (type === 'swap') || (type === 'option')) {
            if (marketUndefined) {
                throw new ArgumentsRequired (this.id + " watchBalance requires a 'instrument_id' (id) or a unified 'symbol' parameter for " + type + ' accounts');
            }
        } else if (type === 'futures') {
            if (currencyUndefined && marketUndefined) {
                throw new ArgumentsRequired (this.id + " watchBalance requires a 'currency' (id), or unified 'code', or 'instrument_id' (id), or unified 'symbol' parameter for " + type + ' accounts');
            }
        }
        let suffix = undefined;
        if (!currencyUndefined) {
            suffix = currency['id'];
        } else if (!marketUndefined) {
            suffix = market['id'];
        }
        const accountType = (type === 'margin') ? 'spot' : type;
        const account = (type === 'margin') ? 'margin_account' : 'account';
        const messageHash = accountType + '/' + account;
        const subscriptionHash = messageHash + ':' + suffix;
        const url = this.urls['api']['ws'];
        const request = {
            'op': 'subscribe',
            'args': [ subscriptionHash ],
        };
        const query = this.omit (params, [ 'currency', 'code', 'instrument_id', 'symbol', 'type' ]);
        return await this.watch (url, messageHash, this.deepExtend (request, query), subscriptionHash);
    }

    handleBalance (client, message) {
        //
        // spot
        //
        //     {
        //         table: 'spot/account',
        //         data: [
        //             {
        //                 available: '11.044827320825',
        //                 currency: 'USDT',
        //                 id: '',
        //                 balance: '11.044827320825',
        //                 hold: '0'
        //             }
        //         ]
        //     }
        //
        // margin
        //
        //     {
        //         table: "spot/margin_account",
        //         data: [
        //             {
        //                 maint_margin_ratio: "0.08",
        //                 liquidation_price: "0",
        //                 'currency:USDT': { available: "0", balance: "0", borrowed: "0", hold: "0", lending_fee: "0" },
        //                 tiers: "1",
        //                 instrument_id:   "ETH-USDT",
        //                 'currency:ETH': { available: "0", balance: "0", borrowed: "0", hold: "0", lending_fee: "0" }
        //             }
        //         ]
        //     }
        //
        const table = this.safeString (message, 'table');
        const parts = table.split ('/');
        let type = this.safeString (parts, 0);
        if (type === 'spot') {
            const part1 = this.safeString (parts, 1);
            if (part1 === 'margin_account') {
                type = 'margin';
            }
        }
        const data = this.safeValue (message, 'data', []);
        for (let i = 0; i < data.length; i++) {
            const balance = this.parseBalanceByType (type, data);
            const oldBalance = this.safeValue (this.balance, type, {});
            const newBalance = this.deepExtend (oldBalance, balance);
            this.balance[type] = this.parseBalance (newBalance);
            client.resolve (this.balance[type], table);
        }
    }

    handleSubscriptionStatus (client, message) {
        //
        //     { event: 'subscribe', arg: { channel: 'tickers', instId: 'BTC-USDT' } }
        //
        // const channel = this.safeString (message, 'channel');
        // client.subscriptions[channel] = message;
        return message;
    }

    handleAuthenticate (client, message) {
        //
        //     { event: 'login', success: true }
        //
        client.resolve (message, 'authenticated');
        return message;
    }

    ping (client) {
        // okex does not support built-in ws protocol-level ping-pong
        // instead it requires custom text-based ping-pong
        return 'ping';
    }

    handlePong (client, message) {
        client.lastPong = this.milliseconds ();
        return message;
    }

    handleErrorMessage (client, message) {
        //
        //     { event: 'error', msg: 'Illegal request: {"op":"subscribe","args":["spot/ticker:BTC-USDT"]}', code: '60012' }
        //     { event: 'error', msg: "channel:ticker,instId:BTC-USDT doesn't exist", code: '60018' }
        //
        const errorCode = this.safeString (message, 'errorCode');
        try {
            if (errorCode !== undefined) {
                const feedback = this.id + ' ' + this.json (message);
                this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
                const messageString = this.safeValue (message, 'message');
                if (messageString !== undefined) {
                    this.throwBroadlyMatchedException (this.exceptions['broad'], messageString, feedback);
                }
            }
        } catch (e) {
            if (e instanceof AuthenticationError) {
                client.reject (e, 'authenticated');
                const method = 'login';
                if (method in client.subscriptions) {
                    delete client.subscriptions[method];
                }
                return false;
            }
        }
        return message;
    }

    handleMessage (client, message) {
        if (!this.handleErrorMessage (client, message)) {
            return;
        }
        //
        //     { event: 'subscribe', arg: { channel: 'tickers', instId: 'BTC-USDT' } }
        //
        //     {
        //         arg: { channel: 'tickers', instId: 'BTC-USDT' },
        //         data: [
        //             {
        //                 instType: 'SPOT',
        //                 instId: 'BTC-USDT',
        //                 last: '31500.1',
        //                 lastSz: '0.00001754',
        //                 askPx: '31500.1',
        //                 askSz: '0.00998144',
        //                 bidPx: '31500',
        //                 bidSz: '3.05652439',
        //                 open24h: '31697',
        //                 high24h: '32248',
        //                 low24h: '31165.6',
        //                 sodUtc0: '31385.5',
        //                 sodUtc8: '32134.9',
        //                 volCcy24h: '503403597.38138519',
        //                 vol24h: '15937.10781721',
        //                 ts: '1626526618762'
        //             }
        //         ]
        //     }
        //
        //     { event: 'error', msg: 'Illegal request: {"op":"subscribe","args":["spot/ticker:BTC-USDT"]}', code: '60012' }
        //     { event: 'error', msg: "channel:ticker,instId:BTC-USDT doesn't exist", code: '60018' }
        //
        //
        //
        if (message === 'pong') {
            return this.handlePong (client, message);
        }
        // const table = this.safeString (message, 'table');
        // if (table === undefined) {
        const event = this.safeString (message, 'event');
        if (event !== undefined) {
            const methods = {
                // 'info': this.handleSystemStatus,
                // 'book': 'handleOrderBook',
                'login': this.handleAuthenticate,
                'subscribe': this.handleSubscriptionStatus,
            };
            const method = this.safeValue (methods, event);
            if (method === undefined) {
                return message;
            } else {
                return method.call (this, client, message);
            }
        } else {
            const arg = this.safeValue (message, 'arg', {});
            const channel = this.safeString (arg, 'channel');
            const methods = {
                // 'books': this.handleOrderBook, // 400 depth levels will be pushed in the initial full snapshot. Incremental data will be pushed every 100 ms when there is change in order book.
                // 'books5': this.handleOrderBook, // 5 depth levels will be pushed every time. Data will be pushed every 100 ms when there is change in order book.
                // 'books50-l2-tbt': this.handleOrderBook, // 50 depth levels will be pushed in the initial full snapshot. Incremental data will be pushed tick by tick, i.e. whenever there is change in order book.
                'books-l2-tbt': this.handleOrderBook, // 400 depth levels will be pushed in the initial full snapshot. Incremental data will be pushed tick by tick, i.e. whenever there is change in order book.
                'tickers': this.handleTicker,
                'trades': this.handleTrades,
                // 'account': this.handleBalance,
                // 'margin_account': this.handleBalance,
            };
            const method = this.safeValue (methods, channel);
            if (method === undefined) {
                return message;
            } else {
                return method.call (this, client, message);
            }
        }
    }
};
