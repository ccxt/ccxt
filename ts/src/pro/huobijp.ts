
// ----------------------------------------------------------------------------

import huobijpRest from '../huobijp.js';
import { ExchangeError } from '../base/errors.js';
import { ArrayCache, ArrayCacheByTimestamp } from '../base/ws/Cache.js';
import { Int } from '../base/types.js';
import Client from '../base/ws/Client.js';

// ----------------------------------------------------------------------------

export default class huobijp extends huobijpRest {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchOrderBook': true,
                'watchTickers': false, // for now
                'watchTicker': true,
                'watchTrades': true,
                'watchBalance': false, // for now
                'watchOHLCV': true,
            },
            'urls': {
                'api': {
                    'ws': {
                        'api': {
                            'public': 'wss://{hostname}/ws',
                            'private': 'wss://{hostname}/ws/v2',
                        },
                    },
                },
            },
            'options': {
                'tradesLimit': 1000,
                'OHLCVLimit': 1000,
                'api': 'api', // or api-aws for clients hosted on AWS
                'ws': {
                    'gunzip': true,
                },
            },
        });
    }

    requestId () {
        const requestId = this.sum (this.safeInteger (this.options, 'requestId', 0), 1);
        this.options['requestId'] = requestId;
        return requestId.toString ();
    }

    async watchTicker (symbol: string, params = {}) {
        /**
         * @method
         * @name huobijp#watchTicker
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the huobijp api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        // only supports a limit of 150 at this time
        const messageHash = 'market.' + market['id'] + '.detail';
        const api = this.safeString (this.options, 'api', 'api');
        const hostname = { 'hostname': this.hostname };
        const url = this.implodeParams (this.urls['api']['ws'][api]['public'], hostname);
        const requestId = this.requestId ();
        const request = {
            'sub': messageHash,
            'id': requestId,
        };
        const subscription = {
            'id': requestId,
            'messageHash': messageHash,
            'symbol': symbol,
            'params': params,
        };
        return await this.watch (url, messageHash, this.extend (request, params), messageHash, subscription);
    }

    handleTicker (client: Client, message) {
        //
        //     {
        //         ch: 'market.btcusdt.detail',
        //         ts: 1583494163784,
        //         tick: {
        //             id: 209988464418,
        //             low: 8988,
        //             high: 9155.41,
        //             open: 9078.91,
        //             close: 9136.46,
        //             vol: 237813910.5928412,
        //             amount: 26184.202558551195,
        //             version: 209988464418,
        //             count: 265673
        //         }
        //     }
        //
        const tick = this.safeValue (message, 'tick', {});
        const ch = this.safeString (message, 'ch');
        const parts = ch.split ('.');
        const marketId = this.safeString (parts, 1);
        const market = this.safeMarket (marketId);
        const ticker = this.parseTicker (tick, market);
        const timestamp = this.safeValue (message, 'ts');
        ticker['timestamp'] = timestamp;
        ticker['datetime'] = this.iso8601 (timestamp);
        const symbol = ticker['symbol'];
        this.tickers[symbol] = ticker;
        client.resolve (ticker, ch);
        return message;
    }

    async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name huobijp#watchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the huobijp api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        // only supports a limit of 150 at this time
        const messageHash = 'market.' + market['id'] + '.trade.detail';
        const api = this.safeString (this.options, 'api', 'api');
        const hostname = { 'hostname': this.hostname };
        const url = this.implodeParams (this.urls['api']['ws'][api]['public'], hostname);
        const requestId = this.requestId ();
        const request = {
            'sub': messageHash,
            'id': requestId,
        };
        const subscription = {
            'id': requestId,
            'messageHash': messageHash,
            'symbol': symbol,
            'params': params,
        };
        const trades = await this.watch (url, messageHash, this.extend (request, params), messageHash, subscription);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    handleTrades (client: Client, message) {
        //
        //     {
        //         ch: "market.btcusdt.trade.detail",
        //         ts: 1583495834011,
        //         tick: {
        //             id: 105004645372,
        //             ts: 1583495833751,
        //             data: [
        //                 {
        //                     id: 1.050046453727319e+22,
        //                     ts: 1583495833751,
        //                     tradeId: 102090727790,
        //                     amount: 0.003893,
        //                     price: 9150.01,
        //                     direction: "sell"
        //                 }
        //             ]
        //         }
        //     }
        //
        const tick = this.safeValue (message, 'tick', {});
        const data = this.safeValue (tick, 'data', {});
        const ch = this.safeString (message, 'ch');
        const parts = ch.split ('.');
        const marketId = this.safeString (parts, 1);
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        let tradesCache = this.safeValue (this.trades, symbol);
        if (tradesCache === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            tradesCache = new ArrayCache (limit);
            this.trades[symbol] = tradesCache;
        }
        for (let i = 0; i < data.length; i++) {
            const trade = this.parseTrade (data[i], market);
            tradesCache.append (trade);
        }
        client.resolve (tradesCache, ch);
        return message;
    }

    async watchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name huobijp#watchOHLCV
         * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
         * @param {int|undefined} limit the maximum amount of candles to fetch
         * @param {object} params extra parameters specific to the huobijp api endpoint
         * @returns {[[int]]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const interval = this.safeString (this.timeframes, timeframe, timeframe);
        const messageHash = 'market.' + market['id'] + '.kline.' + interval;
        const api = this.safeString (this.options, 'api', 'api');
        const hostname = { 'hostname': this.hostname };
        const url = this.implodeParams (this.urls['api']['ws'][api]['public'], hostname);
        const requestId = this.requestId ();
        const request = {
            'sub': messageHash,
            'id': requestId,
        };
        const subscription = {
            'id': requestId,
            'messageHash': messageHash,
            'symbol': symbol,
            'timeframe': timeframe,
            'params': params,
        };
        const ohlcv = await this.watch (url, messageHash, this.extend (request, params), messageHash, subscription);
        if (this.newUpdates) {
            limit = ohlcv.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (ohlcv, since, limit, 0, true);
    }

    handleOHLCV (client: Client, message) {
        //
        //     {
        //         ch: 'market.btcusdt.kline.1min',
        //         ts: 1583501786794,
        //         tick: {
        //             id: 1583501760,
        //             open: 9094.5,
        //             close: 9094.51,
        //             low: 9094.5,
        //             high: 9094.51,
        //             amount: 0.44639786263800907,
        //             vol: 4059.76919054,
        //             count: 16
        //         }
        //     }
        //
        const ch = this.safeString (message, 'ch');
        const parts = ch.split ('.');
        const marketId = this.safeString (parts, 1);
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const interval = this.safeString (parts, 3);
        const timeframe = this.findTimeframe (interval);
        this.ohlcvs[symbol] = this.safeValue (this.ohlcvs, symbol, {});
        let stored = this.safeValue (this.ohlcvs[symbol], timeframe);
        if (stored === undefined) {
            const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
            stored = new ArrayCacheByTimestamp (limit);
            this.ohlcvs[symbol][timeframe] = stored;
        }
        const tick = this.safeValue (message, 'tick');
        const parsed = this.parseOHLCV (tick, market);
        stored.append (parsed);
        client.resolve (stored, ch);
    }

    async watchOrderBook (symbol: string, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name huobijp#watchOrderBook
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the huobijp api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        if ((limit !== undefined) && (limit !== 150)) {
            throw new ExchangeError (this.id + ' watchOrderBook accepts limit = 150 only');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        // only supports a limit of 150 at this time
        limit = (limit === undefined) ? 150 : limit;
        const messageHash = 'market.' + market['id'] + '.mbp.' + limit.toString ();
        const api = this.safeString (this.options, 'api', 'api');
        const hostname = { 'hostname': this.hostname };
        const url = this.implodeParams (this.urls['api']['ws'][api]['public'], hostname);
        const requestId = this.requestId ();
        const request = {
            'sub': messageHash,
            'id': requestId,
        };
        const subscription = {
            'id': requestId,
            'messageHash': messageHash,
            'symbol': symbol,
            'limit': limit,
            'params': params,
            'method': this.handleOrderBookSubscription,
        };
        const orderbook = await this.watch (url, messageHash, this.extend (request, params), messageHash, subscription);
        return orderbook.limit ();
    }

    handleOrderBookSnapshot (client: Client, message, subscription) {
        //
        //     {
        //         id: 1583473663565,
        //         rep: 'market.btcusdt.mbp.150',
        //         status: 'ok',
        //         data: {
        //             seqNum: 104999417756,
        //             bids: [
        //                 [9058.27, 0],
        //                 [9058.43, 0],
        //                 [9058.99, 0],
        //             ],
        //             asks: [
        //                 [9084.27, 0.2],
        //                 [9085.69, 0],
        //                 [9085.81, 0],
        //             ]
        //         }
        //     }
        //
        const symbol = this.safeString (subscription, 'symbol');
        const messageHash = this.safeString (subscription, 'messageHash');
        const orderbook = this.orderbooks[symbol];
        const data = this.safeValue (message, 'data');
        const snapshot = this.parseOrderBook (data, symbol);
        snapshot['nonce'] = this.safeInteger (data, 'seqNum');
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

    async watchOrderBookSnapshot (client, message, subscription) {
        const messageHash = this.safeString (subscription, 'messageHash');
        try {
            const symbol = this.safeString (subscription, 'symbol');
            const limit = this.safeInteger (subscription, 'limit');
            const params = this.safeValue (subscription, 'params');
            const api = this.safeString (this.options, 'api', 'api');
            const hostname = { 'hostname': this.hostname };
            const url = this.implodeParams (this.urls['api']['ws'][api]['public'], hostname);
            const requestId = this.requestId ();
            const request = {
                'req': messageHash,
                'id': requestId,
            };
            // this is a temporary subscription by a specific requestId
            // it has a very short lifetime until the snapshot is received over ws
            const snapshotSubscription = {
                'id': requestId,
                'messageHash': messageHash,
                'symbol': symbol,
                'limit': limit,
                'params': params,
                'method': this.handleOrderBookSnapshot,
            };
            const orderbook = await this.watch (url, requestId, request, requestId, snapshotSubscription);
            return orderbook.limit ();
        } catch (e) {
            delete client.subscriptions[messageHash];
            client.reject (e, messageHash);
        }
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

    handleOrderBookMessage (client: Client, message, orderbook) {
        //
        //     {
        //         ch: "market.btcusdt.mbp.150",
        //         ts: 1583472025885,
        //         tick: {
        //             seqNum: 104998984994,
        //             prevSeqNum: 104998984977,
        //             bids: [
        //                 [9058.27, 0],
        //                 [9058.43, 0],
        //                 [9058.99, 0],
        //             ],
        //             asks: [
        //                 [9084.27, 0.2],
        //                 [9085.69, 0],
        //                 [9085.81, 0],
        //             ]
        //         }
        //     }
        //
        const tick = this.safeValue (message, 'tick', {});
        const seqNum = this.safeInteger (tick, 'seqNum');
        const prevSeqNum = this.safeInteger (tick, 'prevSeqNum');
        if ((prevSeqNum <= orderbook['nonce']) && (seqNum > orderbook['nonce'])) {
            const asks = this.safeValue (tick, 'asks', []);
            const bids = this.safeValue (tick, 'bids', []);
            this.handleDeltas (orderbook['asks'], asks);
            this.handleDeltas (orderbook['bids'], bids);
            orderbook['nonce'] = seqNum;
            const timestamp = this.safeInteger (message, 'ts');
            orderbook['timestamp'] = timestamp;
            orderbook['datetime'] = this.iso8601 (timestamp);
        }
        return orderbook;
    }

    handleOrderBook (client: Client, message) {
        //
        // deltas
        //
        //     {
        //         ch: "market.btcusdt.mbp.150",
        //         ts: 1583472025885,
        //         tick: {
        //             seqNum: 104998984994,
        //             prevSeqNum: 104998984977,
        //             bids: [
        //                 [9058.27, 0],
        //                 [9058.43, 0],
        //                 [9058.99, 0],
        //             ],
        //             asks: [
        //                 [9084.27, 0.2],
        //                 [9085.69, 0],
        //                 [9085.81, 0],
        //             ]
        //         }
        //     }
        //
        const messageHash = this.safeString (message, 'ch');
        const ch = this.safeValue (message, 'ch');
        const parts = ch.split ('.');
        const marketId = this.safeString (parts, 1);
        const symbol = this.safeSymbol (marketId);
        const orderbook = this.orderbooks[symbol];
        if (orderbook['nonce'] === undefined) {
            orderbook.cache.push (message);
        } else {
            this.handleOrderBookMessage (client, message, orderbook);
            client.resolve (orderbook, messageHash);
        }
    }

    handleOrderBookSubscription (client: Client, message, subscription) {
        const symbol = this.safeString (subscription, 'symbol');
        const limit = this.safeInteger (subscription, 'limit');
        if (symbol in this.orderbooks) {
            delete this.orderbooks[symbol];
        }
        this.orderbooks[symbol] = this.orderBook ({}, limit);
        // watch the snapshot in a separate async call
        this.spawn (this.watchOrderBookSnapshot, client, message, subscription);
    }

    handleSubscriptionStatus (client: Client, message) {
        //
        //     {
        //         "id": 1583414227,
        //         "status": "ok",
        //         "subbed": "market.btcusdt.mbp.150",
        //         "ts": 1583414229143
        //     }
        //
        const id = this.safeString (message, 'id');
        const subscriptionsById = this.indexBy (client.subscriptions, 'id');
        const subscription = this.safeValue (subscriptionsById, id);
        if (subscription !== undefined) {
            const method = this.safeValue (subscription, 'method');
            if (method !== undefined) {
                return method.call (this, client, message, subscription);
            }
            // clean up
            if (id in client.subscriptions) {
                delete client.subscriptions[id];
            }
        }
        return message;
    }

    handleSystemStatus (client: Client, message) {
        //
        // todo: answer the question whether handleSystemStatus should be renamed
        // and unified as handleStatus for any usage pattern that
        // involves system status and maintenance updates
        //
        //     {
        //         id: '1578090234088', // connectId
        //         type: 'welcome',
        //     }
        //
        return message;
    }

    handleSubject (client: Client, message) {
        //
        //     {
        //         ch: "market.btcusdt.mbp.150",
        //         ts: 1583472025885,
        //         tick: {
        //             seqNum: 104998984994,
        //             prevSeqNum: 104998984977,
        //             bids: [
        //                 [9058.27, 0],
        //                 [9058.43, 0],
        //                 [9058.99, 0],
        //             ],
        //             asks: [
        //                 [9084.27, 0.2],
        //                 [9085.69, 0],
        //                 [9085.81, 0],
        //             ]
        //         }
        //     }
        //
        const ch = this.safeValue (message, 'ch');
        const parts = ch.split ('.');
        const type = this.safeString (parts, 0);
        if (type === 'market') {
            const methodName = this.safeString (parts, 2);
            const methods = {
                'mbp': this.handleOrderBook,
                'detail': this.handleTicker,
                'trade': this.handleTrades,
                'kline': this.handleOHLCV,
                // ...
            };
            const method = this.safeValue (methods, methodName);
            if (method === undefined) {
                return message;
            } else {
                return method.call (this, client, message);
            }
        }
    }

    async pong (client, message) {
        //
        //     { ping: 1583491673714 }
        //
        await client.send ({ 'pong': this.safeInteger (message, 'ping') });
    }

    handlePing (client: Client, message) {
        this.spawn (this.pong, client, message);
    }

    handleErrorMessage (client: Client, message) {
        //
        //     {
        //         ts: 1586323747018,
        //         status: 'error',
        //         'err-code': 'bad-request',
        //         'err-msg': 'invalid mbp.150.symbol linkusdt',
        //         id: '2'
        //     }
        //
        const status = this.safeString (message, 'status');
        if (status === 'error') {
            const id = this.safeString (message, 'id');
            const subscriptionsById = this.indexBy (client.subscriptions, 'id');
            const subscription = this.safeValue (subscriptionsById, id);
            if (subscription !== undefined) {
                const errorCode = this.safeString (message, 'err-code');
                try {
                    this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, this.json (message));
                } catch (e) {
                    const messageHash = this.safeString (subscription, 'messageHash');
                    client.reject (e, messageHash);
                    client.reject (e, id);
                    if (id in client.subscriptions) {
                        delete client.subscriptions[id];
                    }
                }
            }
            return false;
        }
        return message;
    }

    handleMessage (client: Client, message) {
        if (this.handleErrorMessage (client, message)) {
            //
            //     {"id":1583414227,"status":"ok","subbed":"market.btcusdt.mbp.150","ts":1583414229143}
            //
            //           ________________________
            //
            // sometimes huobijp responds with half of a JSON response like
            //
            //     ' {"ch":"market.ethbtc.m '
            //
            // this is passed to handleMessage as a string since it failed to be decoded as JSON
            //
            if (this.safeString (message, 'id') !== undefined) {
                this.handleSubscriptionStatus (client, message);
            } else if (this.safeString (message, 'ch') !== undefined) {
                // route by channel aka topic aka subject
                this.handleSubject (client, message);
            } else if (this.safeString (message, 'ping') !== undefined) {
                this.handlePing (client, message);
            }
        }
    }
}

