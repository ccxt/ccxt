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
                'watchTickers': false, // for now
                'watchOrderBook': true,
                'watchTrades': true,
                'watchBalance': true,
                'watchOHLCV': true,
            },
            'urls': {
                'api': {
                    'ws': 'wss://real.okex.com:8443/ws/v3',
                },
                'test': {
                    'ws': 'wss://real.okex.com:8443/ws/v3?BrokerId=181',
                },
            },
            'options': {
                'watchOrderBook': {
                    'limit': 400, // max
                    'type': 'spot', // margin
                    'depth': 'depth_l2_tbt', // depth5, depth
                },
                'watchBalance': 'spot', // margin, futures, swap
                'ws': {
                    'inflate': true,
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

    async subscribe (channel, symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const url = this.urls['api']['ws'];
        const messageHash = market['type'] + '/' + channel + ':' + market['id'];
        const request = {
            'op': 'subscribe',
            'args': [ messageHash ],
        };
        return await this.watch (url, messageHash, this.deepExtend (request, params), messageHash);
    }

    async watchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        const trades = await this.subscribe ('trade', symbol, params);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    async watchTicker (symbol, params = {}) {
        return await this.subscribe ('ticker', symbol, params);
    }

    handleTrade (client, message) {
        //
        //     {
        //         table: 'spot/trade',
        //         data: [
        //             {
        //                 side: 'buy',
        //                 trade_id: '30770973',
        //                 price: '4665.4',
        //                 size: '0.019',
        //                 instrument_id: 'BTC-USDT',
        //                 timestamp: '2020-03-16T13:41:46.526Z'
        //             }
        //         ]
        //     }
        //
        const table = this.safeString (message, 'table');
        const data = this.safeValue (message, 'data', []);
        const tradesLimit = this.safeInteger (this.options, 'tradesLimit', 1000);
        for (let i = 0; i < data.length; i++) {
            const trade = this.parseTrade (data[i]);
            const symbol = trade['symbol'];
            const marketId = this.safeString (trade['info'], 'instrument_id');
            const messageHash = table + ':' + marketId;
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

    handleTicker (client, message) {
        //
        //     {
        //         table: 'spot/ticker',
        //         data: [
        //             {
        //                 last: '4634.1',
        //                 open_24h: '5305.6',
        //                 best_bid: '4631.6',
        //                 high_24h: '5950',
        //                 low_24h: '4448.8',
        //                 base_volume_24h: '147913.11435388',
        //                 quote_volume_24h: '756850119.99108082',
        //                 best_ask: '4631.7',
        //                 instrument_id: 'BTC-USDT',
        //                 timestamp: '2020-03-16T13:16:25.677Z',
        //                 best_bid_size: '0.12348942',
        //                 best_ask_size: '0.00100014',
        //                 last_qty: '0.00331822'
        //             }
        //         ]
        //     }
        //
        const table = this.safeString (message, 'table');
        const data = this.safeValue (message, 'data', []);
        for (let i = 0; i < data.length; i++) {
            const ticker = this.parseTicker (data[i]);
            const symbol = ticker['symbol'];
            const marketId = this.safeString (ticker['info'], 'instrument_id');
            const messageHash = table + ':' + marketId;
            this.tickers[symbol] = ticker;
            client.resolve (ticker, messageHash);
        }
        return message;
    }

    async watchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        const interval = this.timeframes[timeframe];
        const name = 'candle' + interval + 's';
        const ohlcv = await this.subscribe (name, symbol, params);
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
        const depth = this.safeString (options, 'depth', 'depth_l2_tbt');
        const orderbook = await this.subscribe (depth, symbol, params);
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
        // first message (snapshot)
        //
        //     {
        //         table: "spot/depth",
        //         action: "partial",
        //         data: [
        //             {
        //                 instrument_id: "BTC-USDT",
        //                 asks: [
        //                     ["4568.5", "0.49723138", "2"],
        //                     ["4568.7", "0.5013", "1"],
        //                     ["4569.1", "0.4398", "1"],
        //                 ],
        //                 bids: [
        //                     ["4568.4", "0.84187666", "5"],
        //                     ["4568.3", "0.75661506", "6"],
        //                     ["4567.8", "2.01", "2"],
        //                 ],
        //                 timestamp: "2020-03-16T11:11:43.388Z",
        //                 checksum: 473370408
        //             }
        //         ]
        //     }
        //
        // subsequent updates
        //
        //     {
        //         table: "spot/depth",
        //         action: "update",
        //         data: [
        //             {
        //                 instrument_id:   "BTC-USDT",
        //                 asks: [
        //                     ["4598.8", "0", "0"],
        //                     ["4599.1", "0", "0"],
        //                     ["4600.3", "0", "0"],
        //                 ],
        //                 bids: [
        //                     ["4598.5", "0.08", "1"],
        //                     ["4598.2", "0.0337323", "1"],
        //                     ["4598.1", "0.12681801", "3"],
        //                 ],
        //                 timestamp: "2020-03-16T11:20:35.139Z",
        //                 checksum: 740786981
        //             }
        //         ]
        //     }
        //
        const action = this.safeString (message, 'action');
        const data = this.safeValue (message, 'data', []);
        const table = this.safeString (message, 'table');
        if (action === 'partial') {
            for (let i = 0; i < data.length; i++) {
                const update = data[i];
                const marketId = this.safeString (update, 'instrument_id');
                const market = this.safeMarket (marketId);
                const symbol = market['symbol'];
                const options = this.safeValue (this.options, 'watchOrderBook', {});
                // default limit is 400 bidasks
                const limit = this.safeInteger (options, 'limit', 400);
                const orderbook = this.orderBook ({}, limit);
                this.orderbooks[symbol] = orderbook;
                this.handleOrderBookMessage (client, update, orderbook);
                const messageHash = table + ':' + marketId;
                client.resolve (orderbook, messageHash);
            }
        } else {
            for (let i = 0; i < data.length; i++) {
                const update = data[i];
                const marketId = this.safeString (update, 'instrument_id');
                const market = this.safeMarket (marketId);
                const symbol = market['symbol'];
                if (symbol in this.orderbooks) {
                    const orderbook = this.orderbooks[symbol];
                    this.handleOrderBookMessage (client, update, orderbook);
                    const messageHash = table + ':' + marketId;
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
        //     {"event":"subscribe","channel":"spot/depth:BTC-USDT"}
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
        //     { event: 'error', message: 'Invalid sign', errorCode: 30013 }
        //     {"event":"error","message":"Unrecognized request: {\"event\":\"subscribe\",\"channel\":\"spot/depth:BTC-USDT\"}","errorCode":30039}
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
        //     {"event":"error","message":"Unrecognized request: {\"event\":\"subscribe\",\"channel\":\"spot/depth:BTC-USDT\"}","errorCode":30039}
        //     {"event":"subscribe","channel":"spot/depth:BTC-USDT"}
        //     {
        //         table: "spot/depth",
        //         action: "partial",
        //         data: [
        //             {
        //                 instrument_id:   "BTC-USDT",
        //                 asks: [
        //                     ["5301.8", "0.03763319", "1"],
        //                     ["5302.4", "0.00305", "2"],
        //                 ],
        //                 bids: [
        //                     ["5301.7", "0.58911427", "6"],
        //                     ["5301.6", "0.01222922", "4"],
        //                 ],
        //                 timestamp: "2020-03-16T03:25:00.440Z",
        //                 checksum: -2088736623
        //             }
        //         ]
        //     }
        //
        if (message === 'pong') {
            return this.handlePong (client, message);
        }
        const table = this.safeString (message, 'table');
        if (table === undefined) {
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
            }
        } else {
            const parts = table.split ('/');
            const name = this.safeString (parts, 1);
            const methods = {
                'depth': this.handleOrderBook,
                'depth5': this.handleOrderBook,
                'depth_l2_tbt': this.handleOrderBook,
                'ticker': this.handleTicker,
                'trade': this.handleTrade,
                'account': this.handleBalance,
                'margin_account': this.handleBalance,
                // ...
            };
            let method = this.safeValue (methods, name);
            if (name.indexOf ('candle') >= 0) {
                method = this.handleOHLCV;
            }
            if (method === undefined) {
                return message;
            } else {
                return method.call (this, client, message);
            }
        }
    }
};
