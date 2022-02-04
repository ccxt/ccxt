'use strict';

//  ---------------------------------------------------------------------------

const ccxt = require ('ccxt');
const { AuthenticationError } = require ('ccxt/js/base/errors');
const { ArrayCache, ArrayCacheByTimestamp, ArrayCacheBySymbolById } = require ('./base/Cache');

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
                'watchBalance': true,
                'watchOHLCV': true,
                'watchOrders': true,
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
        const url = this.urls['api']['ws'][access];
        let messageHash = channel;
        const firstArgument = {
            'channel': channel,
        };
        if (symbol !== undefined) {
            const market = this.market (symbol);
            messageHash += ':' + market['id'];
            firstArgument['instId'] = market['id'];
        }
        const request = {
            'op': 'subscribe',
            'args': [
                this.deepExtend (firstArgument, params),
            ],
        };
        return await this.watch (url, messageHash, request, messageHash);
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
        const name = 'candle' + interval;
        const ohlcv = await this.subscribe ('public', name, symbol, params);
        if (this.newUpdates) {
            limit = ohlcv.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (ohlcv, since, limit, 0, true);
    }

    handleOHLCV (client, message) {
        //
        //     {
        //         arg: { channel: 'candle1m', instId: 'BTC-USDT' },
        //         data: [
        //             [
        //                 '1626690720000',
        //                 '31334',
        //                 '31334',
        //                 '31334',
        //                 '31334',
        //                 '0.0077',
        //                 '241.2718'
        //             ]
        //         ]
        //     }
        //
        const arg = this.safeValue (message, 'arg', {});
        const channel = this.safeString (arg, 'channel');
        const data = this.safeValue (message, 'data', []);
        const marketId = this.safeString (arg, 'instId');
        const market = this.safeMarket (marketId);
        const symbol = market['id'];
        const interval = channel.replace ('candle', '');
        // use a reverse lookup in a static map instead
        const timeframe = this.findTimeframe (interval);
        for (let i = 0; i < data.length; i++) {
            const parsed = this.parseOHLCV (data[i], market);
            this.ohlcvs[symbol] = this.safeValue (this.ohlcvs, symbol, {});
            let stored = this.safeValue (this.ohlcvs[symbol], timeframe);
            if (stored === undefined) {
                const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
                stored = new ArrayCacheByTimestamp (limit);
                this.ohlcvs[symbol][timeframe] = stored;
            }
            stored.append (parsed);
            const messageHash = channel + ':' + marketId;
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
        //
        //     [
        //         '31685', // price
        //         '0.78069158', // amount
        //         '0', // liquidated orders
        //         '17' // orders
        //     ]
        //
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
        //         asks: [
        //             [ '31738.3', '0.05973179', '0', '3' ],
        //             [ '31738.5', '0.11035404', '0', '2' ],
        //             [ '31739.6', '0.01', '0', '1' ],
        //         ],
        //         bids: [
        //             [ '31738.2', '0.67557666', '0', '9' ],
        //             [ '31738', '0.02466947', '0', '2' ],
        //             [ '31736.3', '0.01705046', '0', '2' ],
        //         ],
        //         instId: 'BTC-USDT',
        //         ts: '1626537446491'
        //     }
        //
        const asks = this.safeValue (message, 'asks', []);
        const bids = this.safeValue (message, 'bids', []);
        this.handleDeltas (orderbook['asks'], asks);
        this.handleDeltas (orderbook['bids'], bids);
        const timestamp = this.safeInteger (message, 'ts');
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
        // books5
        //
        //     {
        //         arg: { channel: 'books5', instId: 'BTC-USDT' },
        //         data: [
        //             {
        //                 asks: [
        //                     [ '31738.3', '0.05973179', '0', '3' ],
        //                     [ '31738.5', '0.11035404', '0', '2' ],
        //                     [ '31739.6', '0.01', '0', '1' ],
        //                 ],
        //                 bids: [
        //                     [ '31738.2', '0.67557666', '0', '9' ],
        //                     [ '31738', '0.02466947', '0', '2' ],
        //                     [ '31736.3', '0.01705046', '0', '2' ],
        //                 ],
        //                 instId: 'BTC-USDT',
        //                 ts: '1626537446491'
        //             }
        //         ]
        //     }
        //
        const arg = this.safeValue (message, 'arg', {});
        const channel = this.safeString (arg, 'channel');
        const action = this.safeString (message, 'action');
        const data = this.safeValue (message, 'data', []);
        const marketId = this.safeString (arg, 'instId');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
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
        } else if (action === 'update') {
            if (symbol in this.orderbooks) {
                const orderbook = this.orderbooks[symbol];
                for (let i = 0; i < data.length; i++) {
                    const update = data[i];
                    this.handleOrderBookMessage (client, update, orderbook);
                    const messageHash = channel + ':' + marketId;
                    client.resolve (orderbook, messageHash);
                }
            }
        } else if (channel === 'books5') {
            let orderbook = this.safeValue (this.orderbooks, symbol);
            if (orderbook === undefined) {
                orderbook = this.orderBook ({}, limit);
            }
            this.orderbooks[symbol] = orderbook;
            for (let i = 0; i < data.length; i++) {
                const update = data[i];
                const timestamp = this.safeInteger (update, 'ts');
                const snapshot = this.parseOrderBook (update, symbol, timestamp, 'bids', 'asks', 0, 1, market);
                orderbook.reset (snapshot);
                const messageHash = channel + ':' + marketId;
                client.resolve (orderbook, messageHash);
            }
        }
        return message;
    }

    async authenticate (params = {}) {
        this.checkRequiredCredentials ();
        const url = this.urls['api']['ws']['private'];
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
                    {
                        'apiKey': this.apiKey,
                        'passphrase': this.password,
                        'timestamp': timestamp,
                        'sign': signature,
                    },
                ],
            };
            this.spawn (this.watch, url, messageHash, request, messageHash, future);
        }
        return await future;
    }

    async watchBalance (params = {}) {
        await this.loadMarkets ();
        await this.authenticate ();
        return await this.subscribe ('private', 'account', undefined, params);
    }

    handleBalance (client, message) {
        //
        //     {
        //         arg: { channel: 'account' },
        //         data: [
        //             {
        //                 adjEq: '',
        //                 details: [
        //                     {
        //                         availBal: '',
        //                         availEq: '8.21009913',
        //                         cashBal: '8.21009913',
        //                         ccy: 'USDT',
        //                         coinUsdPrice: '0.99994',
        //                         crossLiab: '',
        //                         disEq: '8.2096065240522',
        //                         eq: '8.21009913',
        //                         eqUsd: '8.2096065240522',
        //                         frozenBal: '0',
        //                         interest: '',
        //                         isoEq: '0',
        //                         isoLiab: '',
        //                         liab: '',
        //                         maxLoan: '',
        //                         mgnRatio: '',
        //                         notionalLever: '0',
        //                         ordFrozen: '0',
        //                         twap: '0',
        //                         uTime: '1621927314996',
        //                         upl: '0'
        //                     },
        //                 ],
        //                 imr: '',
        //                 isoEq: '0',
        //                 mgnRatio: '',
        //                 mmr: '',
        //                 notionalUsd: '',
        //                 ordFroz: '',
        //                 totalEq: '22.1930992296832',
        //                 uTime: '1626692120916'
        //             }
        //         ]
        //     }
        //
        const arg = this.safeValue (message, 'arg', {});
        const channel = this.safeString (arg, 'channel');
        const type = 'spot';
        const balance = this.parseTradingBalance (message);
        const oldBalance = this.safeValue (this.balance, type, {});
        const newBalance = this.deepExtend (oldBalance, balance);
        this.balance[type] = this.safeBalance (newBalance);
        client.resolve (this.balance[type], channel);
    }

    async watchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        await this.authenticate ();
        //
        //     {
        //         "op": "subscribe",
        //         "args": [
        //             {
        //                 "channel": "orders",
        //                 "instType": "FUTURES",
        //                 "uly": "BTC-USD",
        //                 "instId": "BTC-USD-200329"
        //             }
        //         ]
        //     }
        //
        const options = this.safeValue (this.options, 'watchOrders', {});
        // By default, receive order updates from any instrument type
        let type = this.safeString (options, 'type', 'ANY');
        type = this.safeString (params, 'type', type);
        params = this.omit (params, 'type');
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            type = market['type'];
        }
        const uppercaseType = type.toUpperCase ();
        const request = {
            'instType': uppercaseType,
        };
        const orders = await this.subscribe ('private', 'orders', symbol, this.extend (request, params));
        if (this.newUpdates) {
            limit = orders.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (orders, symbol, since, limit, true);
    }

    handleOrders (client, message, subscription = undefined) {
        //
        //     {
        //         "arg":{
        //             "channel":"orders",
        //             "instType":"SPOT"
        //         },
        //         "data":[
        //             {
        //                 "accFillSz":"0",
        //                 "amendResult":"",
        //                 "avgPx":"",
        //                 "cTime":"1634548275191",
        //                 "category":"normal",
        //                 "ccy":"",
        //                 "clOrdId":"e847386590ce4dBC330547db94a08ba0",
        //                 "code":"0",
        //                 "execType":"",
        //                 "fee":"0",
        //                 "feeCcy":"USDT",
        //                 "fillFee":"0",
        //                 "fillFeeCcy":"",
        //                 "fillNotionalUsd":"",
        //                 "fillPx":"",
        //                 "fillSz":"0",
        //                 "fillTime":"",
        //                 "instId":"ETH-USDT",
        //                 "instType":"SPOT",
        //                 "lever":"",
        //                 "msg":"",
        //                 "notionalUsd":"451.4516256",
        //                 "ordId":"370257534141235201",
        //                 "ordType":"limit",
        //                 "pnl":"0",
        //                 "posSide":"",
        //                 "px":"60000",
        //                 "rebate":"0",
        //                 "rebateCcy":"ETH",
        //                 "reqId":"",
        //                 "side":"sell",
        //                 "slOrdPx":"",
        //                 "slTriggerPx":"",
        //                 "state":"live",
        //                 "sz":"0.007526",
        //                 "tag":"",
        //                 "tdMode":"cash",
        //                 "tgtCcy":"",
        //                 "tpOrdPx":"",
        //                 "tpTriggerPx":"",
        //                 "tradeId":"",
        //                 "uTime":"1634548275191"
        //             }
        //         ]
        //     }
        //
        const arg = this.safeValue (message, 'arg', {});
        const channel = this.safeString (arg, 'channel');
        const orders = this.safeValue (message, 'data', []);
        const ordersLength = orders.length;
        if (ordersLength > 0) {
            const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
            if (this.orders === undefined) {
                this.orders = new ArrayCacheBySymbolById (limit);
            }
            const stored = this.orders;
            const marketIds = [];
            const parsed = this.parseOrders (orders);
            for (let i = 0; i < parsed.length; i++) {
                const order = parsed[i];
                stored.append (order);
                const symbol = order['symbol'];
                const market = this.market (symbol);
                marketIds.push (market['id']);
            }
            client.resolve (this.orders, channel);
            for (let i = 0; i < marketIds.length; i++) {
                const messageHash = channel + ':' + marketIds[i];
                client.resolve (this.orders, messageHash);
            }
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
        //     { event: 'login', msg: '', code: '0' }
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
        //     { event: 'error', msg: 'Invalid OK_ACCESS_KEY', code: '60005' }
        //     {
        //         event: 'error',
        //         msg: 'Illegal request: {"op":"login","args":["de89b035-b233-44b2-9a13-0ccdd00bda0e","7KUcc8YzQhnxBE3K","1626691289","H57N99mBt5NvW8U19FITrPdOxycAERFMaapQWRqLaSE="]}',
        //         code: '60012'
        //     }
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
                'books': this.handleOrderBook, // 400 depth levels will be pushed in the initial full snapshot. Incremental data will be pushed every 100 ms when there is change in order book.
                'books5': this.handleOrderBook, // 5 depth levels will be pushed every time. Data will be pushed every 100 ms when there is change in order book.
                'books50-l2-tbt': this.handleOrderBook, // 50 depth levels will be pushed in the initial full snapshot. Incremental data will be pushed tick by tick, i.e. whenever there is change in order book.
                'books-l2-tbt': this.handleOrderBook, // 400 depth levels will be pushed in the initial full snapshot. Incremental data will be pushed tick by tick, i.e. whenever there is change in order book.
                'tickers': this.handleTicker,
                'trades': this.handleTrades,
                'account': this.handleBalance,
                // 'margin_account': this.handleBalance,
                'orders': this.handleOrders,
            };
            const method = this.safeValue (methods, channel);
            if (method === undefined) {
                if (channel.indexOf ('candle') === 0) {
                    this.handleOHLCV (client, message);
                } else {
                    return message;
                }
            } else {
                return method.call (this, client, message);
            }
        }
    }
};
