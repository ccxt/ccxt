'use strict';

//  ---------------------------------------------------------------------------

const ccxt = require ('ccxt');
const { AuthenticationError } = require ('ccxt/js/base/errors');
const { ArrayCache, ArrayCacheByTimestamp, ArrayCacheBySymbolById } = require ('./base/Cache');

//  ---------------------------------------------------------------------------

module.exports = class ascendex extends ccxt.ascendex {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchOrderBook': true,
                'watchOHLCV': true,
                'watchOrders': true,
                'watchTrades': true,
                'watchBalance': true,
            },
            'urls': {
                'api': {
                    'ws': {
                        'public': 'wss://ascendex.com/0/api/pro/v1/stream',
                        'private': 'wss://ascendex.com:443/{accountGroup}/api/pro/v2/stream',
                    },
                },
            },
            'options': {
                'tradesLimit': 1000,
                'ordersLimit': 1000,
                'OHLCVLimit': 1000,
                'categoriesAccount': {
                    'cash': 'spot',
                    'futures': 'swap',
                    'margin': 'margin',
                },
            },
        });
    }

    async watchPublic (channel, messageHash, symbol, method, limit = undefined, params = {}) {
        const url = this.urls['api']['ws']['public'];
        const id = this.nonce ();
        const request = {
            'id': id.toString (),
            'op': 'sub',
            'ch': channel,
        };
        const message = this.extend (request, params);
        const subscription = {
            'id': id,
            'symbol': symbol,
            'channel': channel,
            'messageHash': messageHash,
            'method': method,
        };
        if (limit !== undefined) {
            subscription['limit'] = limit;
        }
        return await this.watch (url, messageHash, message, messageHash, subscription);
    }

    async watchPrivate (channel, messageHash, symbol, method, limit = undefined, params = {}) {
        await this.loadAccounts ();
        const accountGroup = this.safeString (this.options, 'account-group');
        let url = this.urls['api']['ws']['private'];
        url = this.implodeParams (url, { 'accountGroup': accountGroup });
        const id = this.nonce ();
        const request = {
            'id': id.toString (),
            'op': 'sub',
            'ch': channel,
        };
        const message = this.extend (request, params);
        const subscription = {
            'id': id,
            'symbol': symbol,
            'channel': channel,
            'messageHash': messageHash,
            'method': method,
        };
        if (limit !== undefined) {
            subscription['limit'] = limit;
        }
        await this.authenticate (url, params);
        return await this.watch (url, messageHash, message, messageHash, subscription);
    }

    async watchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        if ((limit === undefined) || (limit > 1440)) {
            limit = 100;
        }
        const interval = this.timeframes[timeframe];
        const channel = 'bar' + ':' + interval + ':' + market['id'];
        const messageHash = 'bar' + ':' + market['id'];
        const ohlcv = await this.watchPublic (channel, messageHash, symbol, this.handleOHLCV, limit, params);
        if (this.newUpdates) {
            limit = ohlcv.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (ohlcv, since, limit, 0, true);
    }

    handleOHLCV (client, message, subscription) {
        //
        // {
        //     "m": "bar",
        //     "s": "ASD/USDT",
        //     "data": {
        //         "i":  "1",
        //         "ts": 1575398940000,
        //         "o":  "0.04993",
        //         "c":  "0.04970",
        //         "h":  "0.04993",
        //         "l":  "0.04970",
        //         "v":  "8052"
        //     }
        // }
        //
        const data = this.safeValue (message, 'data', {});
        const interval = this.safeString (data, 'i');
        const timeframe = this.findTimeframe (interval);
        const symbol = this.safeString (subscription, 'symbol');
        const market = this.market (symbol);
        const parsed = this.parseOHLCV (message, market);
        this.ohlcvs[symbol] = this.safeValue (this.ohlcvs, symbol, {});
        let stored = this.safeValue (this.ohlcvs[symbol], timeframe);
        if (stored === undefined) {
            const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
            stored = new ArrayCacheByTimestamp (limit);
            this.ohlcvs[symbol][timeframe] = stored;
        }
        stored.append (parsed);
        const messageHash = this.safeString (subscription, 'messageHash');
        client.resolve (stored, messageHash);
        return message;
    }

    async watchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const channel = 'trades' + ':' + market['id'];
        const trades = await this.watchPublic (channel, channel, symbol, this.handleTrades, limit, params);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    handleTrades (client, message, subscription) {
        //
        // {
        //     m: 'trades',
        //     symbol: 'BTC/USDT',
        //     data: [
        //       {
        //         p: '40744.28',
        //         q: '0.00150',
        //         ts: 1647514330758,
        //         bm: true,
        //         seqnum: 72057633465800320
        //       }
        //     ]
        // }
        //
        const symbol = this.safeString (subscription, 'symbol');
        const messageHash = this.safeString (subscription, 'messageHash');
        const market = this.market (symbol);
        const data = this.safeValue (message, 'data', []);
        const trades = this.parseTrades (data, market);
        let array = this.safeValue (this.trades, symbol);
        if (array === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            array = new ArrayCache (limit);
        }
        for (let i = 0; i < trades.length; i++) {
            array.append (trades[i]);
        }
        this.trades[symbol] = array;
        client.resolve (array, messageHash);
    }

    async watchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const channel = 'depth' + ':' + market['id'];
        const orderbook = await this.watchPublic (channel, channel, symbol, this.handleOrderBook, limit, params);
        return orderbook.limit (limit);
    }

    async watchOrderBookSnapshot (client, message, subscription) {
        await this.loadMarkets ();
        const symbol = this.safeString (subscription, 'symbol');
        const market = this.market (symbol);
        const limit = this.safeInteger (subscription, 'limit');
        const params = this.safeValue (subscription, 'params');
        const action = 'depth-snapshot';
        const messageHash = action + ':' + market['id'];
        const url = this.urls['api']['ws'];
        const requestId = this.nonce ().toString ();
        const request = {
            'op': 'req',
            'action': action,
            'id': requestId,
            'args': {
                'symbol': market['id'],
            },
        };
        const snapshotSubscription = {
            'id': requestId,
            'messageHash': messageHash,
            'symbol': symbol,
            'limit': limit,
            'params': params,
            'method': this.handleOrderBookSnapshot,
        };
        const orderbook = await this.watch (url, messageHash, request, messageHash, snapshotSubscription);
        return orderbook.limit (limit);
    }

    handleOrderBookSnapshot (client, message, subscription) {
        //
        // {
        //     m: 'depth',
        //     symbol: 'BTC/USDT',
        //     data: {
        //       ts: 1647520500149,
        //       seqnum: 28590487626,
        //       asks: [
        //         [Array], [Array], [Array],
        //         [Array], [Array], [Array],
        //       ],
        //       bids: [
        //         [Array], [Array], [Array],
        //         [Array], [Array], [Array],
        //       ]
        //     }
        //   }
        //
        const symbol = this.safeString (subscription, 'symbol');
        const messageHash = this.safeString (subscription, 'messageHash');
        const orderbook = this.orderbooks[symbol];
        const data = this.safeValue (message, 'data');
        const snapshot = this.parseOrderBook (data, symbol);
        snapshot['nonce'] = this.safeInteger (data, 'seqnum');
        orderbook.reset (snapshot);
        // unroll the accumulated deltas
        const messages = orderbook.cache;
        for (let i = 0; i < messages.length; i++) {
            const message = messages[i];
            this.handleOrderBookMessage (client, message, orderbook);
        }
        this.orderbooks[symbol] = orderbook;
        client.resolve (orderbook, messageHash);
    }

    handleOrderBook (client, message, subscription) {
        //
        //   {
        //       m: 'depth',
        //       symbol: 'BTC/USDT',
        //       data: {
        //         ts: 1647515136144,
        //         seqnum: 28590470736,
        //         asks: [ [Array], [Array] ],
        //         bids: [ [Array], [Array], [Array], [Array], [Array], [Array] ]
        //       }
        //   }
        //
        const messageHash = this.safeString (subscription, 'messageHash');
        const symbol = this.safeString (subscription, 'symbol');
        let orderbook = this.safeValue (this.orderbooks, symbol);
        if (orderbook === undefined) {
            const limit = this.safeString (subscription, 'limit');
            orderbook = this.orderBook ({}, limit);
        }
        if (orderbook['nonce'] === undefined) {
            orderbook.cache.push (message);
        } else {
            this.handleOrderBookMessage (client, message, orderbook);
            client.resolve (orderbook, messageHash);
        }
    }

    handleDelta (bookside, delta) {
        //
        // ["40990.47","0.01619"],
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
        // {
        //     "m":"depth",
        //     "symbol":"BTC/USDT",
        //     "data":{
        //        "ts":1647527417715,
        //        "seqnum":28590257013,
        //        "asks":[
        //           ["40990.47","0.01619"],
        //           ["41021.21","0"],
        //           ["41031.59","0.06096"]
        //        ],
        //        "bids":[
        //           ["40990.46","0.76114"],
        //           ["40985.18","0"]
        //        ]
        //     }
        //  }
        //
        const data = this.safeValue (message, 'data', {});
        const seqNum = this.safeInteger (data, 'seqnum');
        if (seqNum > orderbook['nonce']) {
            const asks = this.safeValue (data, 'asks', []);
            const bids = this.safeValue (data, 'bids', []);
            this.handleDeltas (orderbook['asks'], asks);
            this.handleDeltas (orderbook['bids'], bids);
            orderbook['nonce'] = seqNum;
            const timestamp = this.safeInteger (data, 'ts');
            orderbook['timestamp'] = timestamp;
            orderbook['datetime'] = this.iso8601 (timestamp);
        }
        return orderbook;
    }

    async watchBalance (params = {}) {
        await this.loadMarkets ();
        const [ type, query ] = this.handleMarketTypeAndParams ('watchBalance', undefined, params);
        let channel = undefined;
        let messageHash = undefined;
        if (type === 'spot') {
            const accountCategories = this.safeValue (this.options, 'accountCategories', {});
            let accountCategory = this.safeString (accountCategories, type, 'cash'); // cash, margin,
            accountCategory = accountCategory.toUpperCase ();
            channel = 'order' + ':' + accountCategory; // order and balance share the same channel
            messageHash = 'balance' + ':' + accountCategory;
        } else {
            channel = 'futures' + '-' + 'account' + '-' + 'update';
            messageHash = channel;
        }
        return await this.watchPrivate (channel, messageHash, undefined, this.handleBalance, undefined, query);
    }

    handleBalance (client, message, subscription) {
        //
        // cash account
        //
        // {
        //     "m": "balance",
        //     "accountId": "cshQtyfq8XLAA9kcf19h8bXHbAwwoqDo",
        //     "ac": "CASH",
        //     "data": {
        //         "a" : "USDT",
        //         "sn": 8159798,
        //         "tb": "600",
        //         "ab": "600"
        //     }
        // }
        //
        // margin account
        //
        // {
        //     "m": "balance",
        //     "accountId": "marOxpKJV83dxTRx0Eyxpa0gxc4Txt0P",
        //     "ac": "MARGIN",
        //     "data": {
        //         "a"  : "USDT",
        //         "sn" : 8159802,
        //         "tb" : "400", // total Balance
        //         "ab" : "400", // available balance
        //         "brw": "0", // borrowws
        //         "int": "0" // interest
        //     }
        // }
        //
        // futures
        // {
        //     "m"     : "futures-account-update",            // message
        //     "e"     : "ExecutionReport",                   // event type
        //     "t"     : 1612508562129,                       // server time (UTC time in milliseconds)
        //     "acc"   : "sample-futures-account-id",         // account ID
        //     "at"    : "FUTURES",                           // account type
        //     "sn"    : 23128,                               // sequence number, strictly increasing for each account
        //     "id"    : "r177710001cbU3813942147C5kbFGOan",  // request ID for this account update
        //     "col": [
        //       {
        //         "a": "USDT",               // asset code
        //         "b": "1000000",            // balance
        //         "f": "1"                   // discount factor
        //       }
        //     ],
        //     (...)
        //
        let accountType = this.safeString2 (message, 'ac', 'at');
        accountType = accountType.toLowerCase ();
        const categoriesAccounts = this.safeValue (this.options, 'categoriesAccounts');
        const type = this.safeString (categoriesAccounts, accountType, 'spot');
        const data = this.safeValue (message, 'data');
        let balances = undefined;
        if (data === undefined) {
            balances = this.safeValue (message, 'col');
        } else {
            balances = [data];
        }
        const messageHash = this.safeString (subscription, 'messageHash');
        for (let i = 0; i < balances.length; i++) {
            const balance = this.parseWsBalance (balances[i]);
            const oldBalance = this.safeValue (this.balance, type, {});
            const newBalance = this.deepExtend (oldBalance, balance);
            this.balance[type] = this.safeBalance (newBalance);
            client.resolve (this.balance[type], messageHash);
        }
    }

    parseWsBalance (balance) {
        //
        // margin
        //  {
        //         "a"  : "USDT",
        //         "sn" : 8159802,
        //         "tb" : "400", // total Balance
        //         "ab" : "400", // available balance
        //         "brw": "0", // borrowws
        //         "int": "0" // interest
        //   }
        //
        // cash
        // {
        //         "a" : "USDT",
        //         "sn": 8159798,
        //         "tb": "600",
        //         "ab": "600"
        //  }
        //
        // future
        //
        // {
        //     "a": "USDT",               // asset code
        //     "b": "1000000",            // balance
        //     "f": "1"                   // discount factor
        // }
        //
        const code = this.safeCurrencyCode (this.safeString (balance, 'a'));
        const account = this.account ();
        account['free'] = this.safeString (balance, 'ab');
        account['total'] = this.safeString2 (balance, 'tb', 'b');
        const result = {
            'info': balance,
            'timestamp': undefined,
            'datetime': undefined,
        };
        result[code] = account;
        return this.safeBalance (result);
    }

    async watchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const [ type, query ] = this.handleMarketTypeAndParams ('watchOrders', market, params);
        let messageHash = undefined;
        if (type !== 'spot') {
            messageHash = 'futures-order';
        } else {
            const accountCategories = this.safeValue (this.options, 'accountCategories', {});
            let accountCategory = this.safeString (accountCategories, type, 'cash'); // cash, margin
            accountCategory = accountCategory.toUpperCase ();
            messageHash = 'order' + ':' + accountCategory;
        }
        const orders = await this.watchPrivate (messageHash, messageHash, symbol, this.handleOrder, limit, query);
        if (this.newUpdates) {
            limit = orders.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (orders, symbol, since, limit, true);
    }

    handleOrder (client, message, subscription) {
        //
        // spot order
        // {
        //   m: 'order',
        //   accountId: 'cshF5SlR9ukAXoDOuXbND4dVpBMw9gzH',
        //   ac: 'CASH',
        //   data: {
        //     sn: 19399016185,
        //     orderId: 'r17f9d7983faU7223046196CMlrj3bfC',
        //     s: 'LTC/USDT',
        //     ot: 'Limit',
        //     t: 1647614461160,
        //     p: '50',
        //     q: '0.1',
        //     sd: 'Buy',
        //     st: 'New',
        //     ap: '0',
        //     cfq: '0',
        //     sp: '',
        //     err: '',
        //     btb: '0',
        //     bab: '0',
        //     qtb: '8',
        //     qab: '2.995',
        //     cf: '0',
        //     fa: 'USDT',
        //     ei: 'NULL_VAL'
        //   }
        // }
        //
        //  futures order
        // {
        //     m: 'futures-order',
        //     sn: 19399927636,
        //     e: 'ExecutionReport',
        //     a: 'futF5SlR9ukAXoDOuXbND4dVpBMw9gzH', // account id
        //     ac: 'FUTURES',
        //     t: 1647622515434, // last execution time
        //      (...)
        // }
        //
        const messageHash = this.safeString (subscription, 'messageHash');
        const data = this.safeValue (message, 'data', message);
        const order = this.parseWsOrder (data);
        if (this.orders === undefined) {
            const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
            this.orders = new ArrayCacheBySymbolById (limit);
        }
        const orders = this.orders;
        orders.append (order);
        client.resolve (orders, messageHash);
        const subscriptionSymbol = this.safeString (subscription, 'symbol');
        if (subscriptionSymbol !== undefined) {
            const market = this.market (subscriptionSymbol);
            const symbolMessageHash = messageHash + ':' + market['id'];
            client.resolve (orders, symbolMessageHash);
        }
        client.resolve (orders, messageHash);
    }

    parseWsOrder (order, market = undefined) {
        //
        // spot order
        //    {
        //          sn: 19399016185, //sequence number
        //          orderId: 'r17f9d7983faU7223046196CMlrj3bfC',
        //          s: 'LTC/USDT',
        //          ot: 'Limit', // order type
        //          t: 1647614461160, // last execution timestamp
        //          p: '50', // price
        //          q: '0.1', // quantity
        //          sd: 'Buy', // side
        //          st: 'New', // status
        //          ap: '0', // average fill price
        //          cfq: '0', // cumulated fill quantity
        //          sp: '', // stop price
        //          err: '',
        //          btb: '0', // base asset total balance
        //          bab: '0', // base asset available balance
        //          qtb: '8', // quote asset total balance
        //          qab: '2.995', // quote asset available balance
        //          cf: '0', // cumulated commission
        //          fa: 'USDT', // fee asset
        //          ei: 'NULL_VAL'
        //        }
        //
        //  futures order
        // {
        //     m: 'futures-order',
        //     sn: 19399927636,
        //     e: 'ExecutionReport',
        //     a: 'futF5SlR9ukAXoDOuXbND4dVpBMw9gzH', // account id
        //     ac: 'FUTURES',
        //     t: 1647622515434, // last execution time
        //     ct: 1647622515413, // order creation time
        //     orderId: 'r17f9df469b1U7223046196Okf5Kbmd',
        //     sd: 'Buy', // side
        //     ot: 'Limit', // order type
        //     ei: 'NULL_VAL',
        //     q: '1', // quantity
        //     p: '50', //price
        //     sp: '0', // stopPrice
        //     spb: '',  // stopTrigger
        //     s: 'LTC-PERP', // symbol
        //     st: 'New', // state
        //     err: '',
        //     lp: '0', // last filled price
        //     lq: '0', // last filled quantity (base asset)
        //     ap: '0',  // average filled price
        //     cfq: '0', // cummulative filled quantity (base asset)
        //     f: '0', // commission fee of the current execution
        //     cf: '0', // cumulative commission fee
        //     fa: 'USDT', // fee asset
        //     psl: '0',
        //     pslt: 'market',
        //     ptp: '0',
        //     ptpt: 'market'
        //   }
        //
        const status = this.parseOrderStatus (this.safeString (order, 'st'));
        const marketId = this.safeString (order, 's');
        const symbol = this.safeSymbol (marketId, market, '/');
        const lastTradeTimestamp = this.safeInteger (order, 't');
        const price = this.safeString (order, 'p');
        const amount = this.safeString (order, 'q');
        const average = this.safeString (order, 'ap');
        const filled = this.safeString2 (order, 'cfq');
        const id = this.safeString (order, 'orderId');
        const type = this.safeStringLower (order, 'ot');
        const side = this.safeStringLower (order, 'sd');
        const feeCost = this.safeNumber (order, 'cf');
        let fee = undefined;
        if (feeCost !== undefined) {
            const feeCurrencyId = this.safeString (order, 'fa');
            const feeCurrencyCode = this.safeCurrencyCode (feeCurrencyId);
            fee = {
                'cost': feeCost,
                'currency': feeCurrencyCode,
            };
        }
        const stopPrice = this.safeNumber (order, 'stopPrice');
        return this.safeOrder ({
            'info': order,
            'id': id,
            'clientOrderId': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'lastTradeTimestamp': lastTradeTimestamp,
            'symbol': symbol,
            'type': type,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': stopPrice,
            'amount': amount,
            'cost': undefined,
            'average': average,
            'filled': filled,
            'remaining': undefined,
            'status': status,
            'fee': fee,
            'trades': undefined,
        }, market);
    }

    handleErrorMessage (client, message) {
        //
        // {
        //     m: 'disconnected',
        //     code: 100005,
        //     reason: 'INVALID_WS_REQUEST_DATA',
        //     info: 'Session is disconnected due to missing pong message from the client'
        //   }
        //
        const errorCode = this.safeInteger (message, 'code');
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
                const method = 'auth';
                if (method in client.subscriptions) {
                    delete client.subscriptions[method];
                }
                return false;
            }
        }
        return message;
    }

    handleAuthenticate (client, message) {
        //
        //     { m: 'auth', id: '1647605234', code: 0 }
        //
        client.resolve (message, 'authenticated');
        return message;
    }

    handleMessage (client, message) {
        if (!this.handleErrorMessage (client, message)) {
            return;
        }
        //
        //     { m: 'ping', hp: 3 }
        //
        //     { m: 'sub', ch: 'bar:BTC/USDT', code: 0 }
        //
        //     { m: 'sub', id: '1647515701', ch: 'depth:BTC/USDT', code: 0 }
        //
        //     { m: 'connected', type: 'unauth' }
        //
        //     { m: 'auth', id: '1647605234', code: 0 }
        //
        // order or balance sub
        // {
        //     m: 'sub',
        //     id: '1647605952',
        //     ch: 'order:cshF5SlR9ukAXoDOuXbND4dVpBMw9gzH', or futures-order
        //     code: 0
        //   }
        //
        // ohlcv
        //  {
        //     m: 'bar',
        //     s: 'BTC/USDT',
        //     data: {
        //       i: '1',
        //       ts: 1647510060000,
        //       o: '40813.93',
        //       c: '40804.57',
        //       h: '40814.21',
        //       l: '40804.56',
        //       v: '0.01537'
        //     }
        //   }
        //
        // trades
        //
        //    {
        //        m: 'trades',
        //        symbol: 'BTC/USDT',
        //        data: [
        //          {
        //            p: '40762.26',
        //            q: '0.01500',
        //            ts: 1647514306759,
        //            bm: true,
        //            seqnum: 72057633465795180
        //          }
        //        ]
        //    }
        //
        // orderbook deltas
        //
        // {
        //     "m":"depth",
        //     "symbol":"BTC/USDT",
        //     "data":{
        //        "ts":1647527417715,
        //        "seqnum":28590257013,
        //        "asks":[
        //           ["40990.47","0.01619"],
        //           ["41021.21","0"],
        //           ["41031.59","0.06096"]
        //        ],
        //        "bids":[
        //           ["40990.46","0.76114"],
        //           ["40985.18","0"]
        //        ]
        //     }
        //  }
        //
        // orderbook snapshot
        //  {
        //     m: 'depth-snapshot',
        //     symbol: 'BTC/USDT',
        //     data: {
        //       ts: 1647525938513,
        //       seqnum: 28590504772,
        //       asks: [
        //         [Array], [Array], [Array], [Array], [Array], [Array], [Array],
        //         [Array], [Array], [Array], [Array], [Array], [Array], [Array],
        //         [Array], [Array], [Array], [Array], [Array], [Array], [Array],
        //         [Array], [Array], [Array], [Array], [Array], [Array], [Array],
        //         [Array], [Array], [Array], [Array], [Array], [Array], [Array],
        //         [Array], [Array], [Array], [Array], [Array], [Array], [Array],
        //         [Array], [Array], [Array], [Array], [Array], [Array], [Array],
        //         [Array], [Array], [Array], [Array], [Array], [Array], [Array],
        //         [Array], [Array], [Array], [Array], [Array], [Array], [Array],
        //       ]
        //  }
        // order update
        //  {
        //      "m": "order",
        //      "accountId": "cshQtyfq8XLAA9kcf19h8bXHbAwwoqDo",
        //      "ac": "CASH",
        //      "data": {
        //          "s":       "BTC/USDT",
        //          "sn":       8159711,
        //          "sd":      "Buy",
        //          "ap":      "0",
        //          "bab":     "2006.5974027",
        //          "btb":     "2006.5974027",
        //          "cf":      "0",
        //          "cfq":     "0",
        //          "err":     "",
        //          "fa":      "USDT",
        //          "orderId": "s16ef210b1a50866943712bfaf1584b",
        //          "ot":      "Market",
        //          "p":       "7967.62",
        //          "q":       "0.0083",
        //          "qab":     "793.23",
        //          "qtb":     "860.23",
        //          "sp":      "",
        //          "st":      "New",
        //          "t":        1576019215402,
        //          "ei":      "NULL_VAL"
        //      }
        //  }
        // balance update cash
        // {
        //     "m": "balance",
        //     "accountId": "cshQtyfq8XLAA9kcf19h8bXHbAwwoqDo",
        //     "ac": "CASH",
        //     "data": {
        //         "a" : "USDT",
        //         "sn": 8159798,
        //         "tb": "600",
        //         "ab": "600"
        //     }
        // }
        // balance update margin
        // {
        //     "m": "balance",
        //     "accountId": "marOxpKJV83dxTRx0Eyxpa0gxc4Txt0P",
        //     "ac": "MARGIN",
        //     "data": {
        //         "a"  : "USDT",
        //         "sn" : 8159802,
        //         "tb" : "400",
        //         "ab" : "400",
        //         "brw": "0",
        //         "int": "0"
        //     }
        // }
        //
        const subject = this.safeString (message, 'm');
        if (subject === 'ping') {
            this.handlePing (client, message);
            return;
        }
        if (subject === 'auth') {
            this.handleAuthenticate (client, message);
            return;
        }
        if (subject === 'sub') {
            this.handleSubscriptionStatus (client, message);
            return;
        }
        let topic = this.safeString2 (message, 's', 'symbol');
        topic = this.safeString (message, 'ac', topic);
        if (topic !== undefined) {
            const channel = subject + ':' + topic;
            const subscription = this.safeValue (client.subscriptions, channel);
            if (subscription !== undefined) {
                const method = this.safeValue (subscription, 'method');
                if (method !== undefined) {
                    return method.call (this, client, message, subscription);
                }
            }
            return message;
        }
    }

    handleSubscriptionStatus (client, message) {
        //
        //     { m: 'sub', ch: 'bar:BTC/USDT', code: 0 }
        //
        //     { m: 'sub', id: '1647515701', ch: 'depth:BTC/USDT', code: 0 }
        //
        const channel = this.safeString (message, 'ch', '');
        const subscription = this.safeValue (client.subscriptions, channel);
        if (channel.indexOf ('depth') !== -1) {
            this.handleOrderBookSubscription (client, message, subscription);
        }
        return message;
    }

    handleOrderBookSubscription (client, message, subscription) {
        const symbol = this.safeString (subscription, 'symbol');
        const limit = this.safeInteger (subscription, 'limit');
        if (symbol in this.orderbooks) {
            delete this.orderbooks[symbol];
        }
        this.orderbooks[symbol] = this.orderBook ({}, limit);
        this.spawn (this.watchOrderBookSnapshot, client, message, subscription);
    }

    async pong (client, message) {
        //
        //     { m: 'ping', hp: 3 }
        //
        await client.send ({ 'op': 'pong', 'hp': this.safeInteger (message, 'hp') });
    }

    handlePing (client, message) {
        this.spawn (this.pong, client, message);
    }

    async authenticate (url, params = {}) {
        this.checkRequiredCredentials ();
        const messageHash = 'auth';
        const client = this.client (url);
        let future = this.safeValue (client.subscriptions, messageHash);
        if (future === undefined) {
            future = client.future ('authenticated');
            const timestamp = this.milliseconds ().toString ();
            const urlParts = url.split ('/');
            const partsLength = urlParts.length;
            const path = this.safeString (urlParts, partsLength - 1);
            const version = this.safeString (urlParts, partsLength - 2);
            const auth = timestamp + '+' + version + '/' + path;
            const secret = this.base64ToBinary (this.secret);
            const signature = this.hmac (this.encode (auth), this.encode (secret), 'sha256', 'base64');
            const request = {
                'op': messageHash,
                'id': this.nonce ().toString (),
                't': timestamp,
                'key': this.apiKey,
                'sig': signature,
            };
            this.spawn (this.watch, url, messageHash, this.extend (request, params), messageHash, future);
        }
        return await future;
    }
};
