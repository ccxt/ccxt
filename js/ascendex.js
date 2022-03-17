'use strict';

//  ---------------------------------------------------------------------------

const ccxt = require ('ccxt');
const { ExchangeError } = require ('ccxt/js/base/errors');
const { ArrayCache, ArrayCacheByTimestamp } = require ('./base/Cache');

//  ---------------------------------------------------------------------------

module.exports = class ascendex extends ccxt.ascendex {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchOrderBook': true,
                'watchTicker': true,
                'watchTrades': true,
            },
            'urls': {
                'api': {
                    'ws': 'wss://ascendex.com/0/api/pro/v1/stream',
                },
            },
            'options': {
                'tradesLimit': 1000,
                'ordersLimit': 1000,
                'OHLCVLimit': 1000,
            },
        });
    }

    async watchPublic (channel, messageHash, symbol, method, limit = undefined, params = {}) {
        const url = this.urls['api']['ws'];
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

    async watchTicker (symbol, params = {}) {
        return await this.watchPublic ('ticker', symbol, this.handleTicker, params);
    }

    handleTicker (client, message, subscription) {
        //
        //     {
        //         date: '1624398991255',
        //         ticker: {
        //             high: '33298.38',
        //             vol: '56375.9469',
        //             last: '32396.95',
        //             low: '28808.19',
        //             buy: '32395.81',
        //             sell: '32409.3',
        //             turnover: '1771122527.0000',
        //             open: '31652.44',
        //             riseRate: '2.36'
        //         },
        //         dataType: 'ticker',
        //         channel: 'btcusdt_ticker'
        //     }
        //
        const symbol = this.safeString (subscription, 'symbol');
        const channel = this.safeString (message, 'channel');
        const market = this.market (symbol);
        const data = this.safeValue (message, 'ticker');
        data['date'] = this.safeValue (message, 'date');
        const ticker = this.parseTicker (data, market);
        ticker['symbol'] = symbol;
        this.tickers[symbol] = ticker;
        client.resolve (ticker, channel);
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
                'symbol': symbol,
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

    handleMessage (client, message) {
        //
        //     { m: 'ping', hp: 3 }
        //
        //     { m: 'sub', ch: 'bar:BTC/USDT', code: 0 }
        //
        //     { m: 'sub', id: '1647515701', ch: 'depth:BTC/USDT', code: 0 }
        //
        //     { m: 'connected', type: 'unauth' }
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
        //     }
        //
        const subject = this.safeString (message, 'm');
        if (subject === 'ping') {
            this.handlePing (client, message);
            return;
        }
        if (subject === 'sub') {
            this.handleSubscriptionStatus (client, message);
            return;
        }
        const marketId = this.safeString2 (message, 's', 'symbol');
        if (marketId !== undefined) {
            const channel = subject + ':' + marketId;
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
};
