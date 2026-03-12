'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var htx$1 = require('../htx.js');
var errors = require('../base/errors.js');
var Cache = require('../base/ws/Cache.js');
var sha256 = require('../static_dependencies/noble-hashes/sha256.js');

// ----------------------------------------------------------------------------
//  ---------------------------------------------------------------------------
class htx extends htx$1["default"] {
    describe() {
        return this.deepExtend(super.describe(), {
            'has': {
                'ws': true,
                'createOrderWs': false,
                'editOrderWs': false,
                'fetchOpenOrdersWs': false,
                'fetchOrderWs': false,
                'cancelOrderWs': false,
                'cancelOrdersWs': false,
                'cancelAllOrdersWs': false,
                'fetchTradesWs': false,
                'fetchBalanceWs': false,
                'watchOrderBook': true,
                'watchOrders': true,
                'watchTickers': false,
                'watchTicker': true,
                'watchTrades': true,
                'watchTradesForSymbols': false,
                'watchMyTrades': true,
                'watchBalance': true,
                'watchOHLCV': true,
                'unwatchTicker': true,
                'unwatchOHLCV': true,
                'unwatchTrades': true,
                'unwatchOrderBook': true,
            },
            'urls': {
                'api': {
                    'ws': {
                        'api': {
                            'spot': {
                                'public': 'wss://{hostname}/ws',
                                'private': 'wss://{hostname}/ws/v2',
                                'feed': 'wss://{hostname}/feed',
                            },
                            'future': {
                                'linear': {
                                    'public': 'wss://api.hbdm.vn/linear-swap-ws',
                                    'private': 'wss://api.hbdm.vn/linear-swap-notification',
                                },
                                'inverse': {
                                    'public': 'wss://api.hbdm.vn/ws',
                                    'private': 'wss://api.hbdm.vn/notification',
                                },
                            },
                            'swap': {
                                'inverse': {
                                    'public': 'wss://api.hbdm.vn/swap-ws',
                                    'private': 'wss://api.hbdm.vn/swap-notification',
                                },
                                'linear': {
                                    'public': 'wss://api.hbdm.vn/linear-swap-ws',
                                    'private': 'wss://api.hbdm.vn/linear-swap-notification',
                                },
                            },
                        },
                        // these settings work faster for clients hosted on AWS
                        'api-aws': {
                            'spot': {
                                'public': 'wss://api-aws.huobi.pro/ws',
                                'private': 'wss://api-aws.huobi.pro/ws/v2',
                                'feed': 'wss://{hostname}/feed',
                            },
                            'future': {
                                'linear': {
                                    'public': 'wss://api.hbdm.vn/linear-swap-ws',
                                    'private': 'wss://api.hbdm.vn/linear-swap-notification',
                                },
                                'inverse': {
                                    'public': 'wss://api.hbdm.vn/ws',
                                    'private': 'wss://api.hbdm.vn/notification',
                                },
                            },
                            'swap': {
                                'linear': {
                                    'public': 'wss://api.hbdm.vn/linear-swap-ws',
                                    'private': 'wss://api.hbdm.vn/linear-swap-notification',
                                },
                                'inverse': {
                                    'public': 'wss://api.hbdm.vn/swap-ws',
                                    'private': 'wss://api.hbdm.vn/swap-notification',
                                },
                            },
                        },
                    },
                },
            },
            'options': {
                'tradesLimit': 1000,
                'OHLCVLimit': 1000,
                'api': 'api',
                'watchOrderBook': {
                    'maxRetries': 3,
                    'checksum': true,
                    'depth': 150, // 150 or 20
                },
                'ws': {
                    'gunzip': true,
                },
                'watchTicker': {
                    'name': 'market.{marketId}.detail', // 'market.{marketId}.bbo' or 'market.{marketId}.ticker'
                },
            },
            'exceptions': {
                'ws': {
                    'exact': {
                        'bad-request': errors.BadRequest,
                        '2002': errors.AuthenticationError,
                        '2021': errors.BadRequest,
                        '2001': errors.BadSymbol,
                        '2011': errors.BadSymbol,
                        '2040': errors.BadRequest,
                        '4007': errors.BadRequest, // { op: 'sub', cid: '1', topic: 'accounts_unify.USDT', 'err-code': 4007, 'err-msg': 'Non - single account user is not available, please check through the cross and isolated account asset interface', ts: 1698419318540 }
                    },
                },
            },
        });
    }
    requestId() {
        this.lockId();
        const requestId = this.sum(this.safeInteger(this.options, 'requestId', 0), 1);
        this.options['requestId'] = requestId;
        this.unlockId();
        return requestId.toString();
    }
    /**
     * @method
     * @name htx#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://www.htx.com/en-us/opend/newApiPages/?id=7ec53561-7773-11ed-9966-0242ac110003
     * @see https://www.htx.com/en-us/opend/newApiPages/?id=28c33ab2-77ae-11ed-9966-0242ac110003
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    async watchTicker(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        symbol = market['symbol'];
        const options = this.safeDict(this.options, 'watchTicker', {});
        const topic = this.safeString(options, 'name', 'market.{marketId}.detail');
        if (topic === 'market.{marketId}.ticker' && market['type'] !== 'spot') {
            throw new errors.BadRequest(this.id + ' watchTicker() with name market.{marketId}.ticker is only allowed for spot markets, use market.{marketId}.detail instead');
        }
        const messageHash = this.implodeParams(topic, { 'marketId': market['id'] });
        const url = this.getUrlByMarketType(market['type'], market['linear']);
        return await this.subscribePublic(url, symbol, messageHash, undefined, params);
    }
    /**
     * @method
     * @name htx#unWatchTicker
     * @description unWatches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @see https://www.htx.com/en-us/opend/newApiPages/?id=7ec53561-7773-11ed-9966-0242ac110003
     * @see https://www.htx.com/en-us/opend/newApiPages/?id=28c33ab2-77ae-11ed-9966-0242ac110003
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    async unWatchTicker(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const topic = 'ticker';
        const options = this.safeDict(this.options, 'watchTicker', {});
        const channel = this.safeString(options, 'name', 'market.{marketId}.detail');
        if (channel === 'market.{marketId}.ticker' && market['type'] !== 'spot') {
            throw new errors.BadRequest(this.id + ' watchTicker() with name market.{marketId}.ticker is only allowed for spot markets, use market.{marketId}.detail instead');
        }
        const subMessageHash = this.implodeParams(channel, { 'marketId': market['id'] });
        return await this.unsubscribePublic(market, subMessageHash, topic, params);
    }
    handleTicker(client, message) {
        //
        // "market.btcusdt.detail"
        //     {
        //         "ch": "market.btcusdt.detail",
        //         "ts": 1583494163784,
        //         "tick": {
        //             "id": 209988464418,
        //             "low": 8988,
        //             "high": 9155.41,
        //             "open": 9078.91,
        //             "close": 9136.46,
        //             "vol": 237813910.5928412,
        //             "amount": 26184.202558551195,
        //             "version": 209988464418,
        //             "count": 265673
        //         }
        //     }
        // "market.btcusdt.bbo"
        //     {
        //         "ch": "market.btcusdt.bbo",
        //         "ts": 1671941599613,
        //         "tick": {
        //             "seqId": 161499562790,
        //             "ask": 16829.51,
        //             "askSize": 0.707776,
        //             "bid": 16829.5,
        //             "bidSize": 1.685945,
        //             "quoteTime": 1671941599612,
        //             "symbol": "btcusdt"
        //         }
        //     }
        //
        const tick = this.safeValue(message, 'tick', {});
        const ch = this.safeString(message, 'ch');
        const parts = ch.split('.');
        const marketId = this.safeString(parts, 1);
        const market = this.safeMarket(marketId);
        const ticker = this.parseTicker(tick, market);
        const timestamp = this.safeValue(message, 'ts');
        ticker['timestamp'] = timestamp;
        ticker['datetime'] = this.iso8601(timestamp);
        const symbol = ticker['symbol'];
        this.tickers[symbol] = ticker;
        client.resolve(ticker, ch);
        return message;
    }
    /**
     * @method
     * @name htx#watchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://www.htx.com/en-us/opend/newApiPages/?id=7ec53b69-7773-11ed-9966-0242ac110003
     * @see https://www.htx.com/en-us/opend/newApiPages/?id=28c33c21-77ae-11ed-9966-0242ac110003
     * @see https://www.htx.com/en-us/opend/newApiPages/?id=28c33cfe-77ae-11ed-9966-0242ac110003
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    async watchTrades(symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        symbol = market['symbol'];
        const messageHash = 'market.' + market['id'] + '.trade.detail';
        const url = this.getUrlByMarketType(market['type'], market['linear']);
        const trades = await this.subscribePublic(url, symbol, messageHash, undefined, params);
        if (this.newUpdates) {
            limit = trades.getLimit(symbol, limit);
        }
        return this.filterBySinceLimit(trades, since, limit, 'timestamp', true);
    }
    /**
     * @method
     * @name htx#unWatchTrades
     * @description unWatches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @see https://www.htx.com/en-us/opend/newApiPages/?id=7ec53b69-7773-11ed-9966-0242ac110003
     * @see https://www.htx.com/en-us/opend/newApiPages/?id=28c33c21-77ae-11ed-9966-0242ac110003
     * @see https://www.htx.com/en-us/opend/newApiPages/?id=28c33cfe-77ae-11ed-9966-0242ac110003
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    async unWatchTrades(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const topic = 'trades';
        const options = this.safeDict(this.options, 'watchTrades', {});
        const channel = this.safeString(options, 'name', 'market.{marketId}.trade.detail');
        const subMessageHash = this.implodeParams(channel, { 'marketId': market['id'] });
        return await this.unsubscribePublic(market, subMessageHash, topic, params);
    }
    handleTrades(client, message) {
        //
        //     {
        //         "ch": "market.btcusdt.trade.detail",
        //         "ts": 1583495834011,
        //         "tick": {
        //             "id": 105004645372,
        //             "ts": 1583495833751,
        //             "data": [
        //                 {
        //                     "id": 1.050046453727319e+22,
        //                     "ts": 1583495833751,
        //                     "tradeId": 102090727790,
        //                     "amount": 0.003893,
        //                     "price": 9150.01,
        //                     "direction": "sell"
        //                 }
        //             ]
        //         }
        //     }
        //
        const tick = this.safeValue(message, 'tick', {});
        const data = this.safeValue(tick, 'data', {});
        const ch = this.safeString(message, 'ch');
        const parts = ch.split('.');
        const marketId = this.safeString(parts, 1);
        const market = this.safeMarket(marketId);
        const symbol = market['symbol'];
        let tradesCache = this.safeValue(this.trades, symbol);
        if (tradesCache === undefined) {
            const limit = this.safeInteger(this.options, 'tradesLimit', 1000);
            tradesCache = new Cache.ArrayCache(limit);
            this.trades[symbol] = tradesCache;
        }
        for (let i = 0; i < data.length; i++) {
            const trade = this.parseTrade(data[i], market);
            tradesCache.append(trade);
        }
        client.resolve(tradesCache, ch);
        return message;
    }
    /**
     * @method
     * @name htx#watchOHLCV
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://www.htx.com/en-us/opend/newApiPages/?id=7ec53241-7773-11ed-9966-0242ac110003
     * @see https://www.htx.com/en-us/opend/newApiPages/?id=28c3346a-77ae-11ed-9966-0242ac110003
     * @see https://www.htx.com/en-us/opend/newApiPages/?id=28c33563-77ae-11ed-9966-0242ac110003
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async watchOHLCV(symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        symbol = market['symbol'];
        const interval = this.safeString(this.timeframes, timeframe, timeframe);
        const messageHash = 'market.' + market['id'] + '.kline.' + interval;
        const url = this.getUrlByMarketType(market['type'], market['linear']);
        const ohlcv = await this.subscribePublic(url, symbol, messageHash, undefined, params);
        if (this.newUpdates) {
            limit = ohlcv.getLimit(symbol, limit);
        }
        return this.filterBySinceLimit(ohlcv, since, limit, 0, true);
    }
    /**
     * @method
     * @name htx#unWatchOHLCV
     * @description unWatches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://www.htx.com/en-us/opend/newApiPages/?id=7ec53241-7773-11ed-9966-0242ac110003
     * @see https://www.htx.com/en-us/opend/newApiPages/?id=28c3346a-77ae-11ed-9966-0242ac110003
     * @see https://www.htx.com/en-us/opend/newApiPages/?id=28c33563-77ae-11ed-9966-0242ac110003
     * @param {string} symbol unified symbol of the market
     * @param {string} timeframe the length of time each candle represents
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {object} [params.timezone] if provided, kline intervals are interpreted in that timezone instead of UTC, example '+08:00'
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async unWatchOHLCV(symbol, timeframe = '1m', params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const interval = this.safeString(this.timeframes, timeframe, timeframe);
        const subMessageHash = 'market.' + market['id'] + '.kline.' + interval;
        const topic = 'ohlcv';
        params['symbolsAndTimeframes'] = [[market['symbol'], timeframe]];
        return await this.unsubscribePublic(market, subMessageHash, topic, params);
    }
    handleOHLCV(client, message) {
        //
        //     {
        //         "ch": "market.btcusdt.kline.1min",
        //         "ts": 1583501786794,
        //         "tick": {
        //             "id": 1583501760,
        //             "open": 9094.5,
        //             "close": 9094.51,
        //             "low": 9094.5,
        //             "high": 9094.51,
        //             "amount": 0.44639786263800907,
        //             "vol": 4059.76919054,
        //             "count": 16
        //         }
        //     }
        //
        const ch = this.safeString(message, 'ch');
        const parts = ch.split('.');
        const marketId = this.safeString(parts, 1);
        const market = this.safeMarket(marketId);
        const symbol = market['symbol'];
        const interval = this.safeString(parts, 3);
        const timeframe = this.findTimeframe(interval);
        this.ohlcvs[symbol] = this.safeValue(this.ohlcvs, symbol, {});
        let stored = this.safeValue(this.ohlcvs[symbol], timeframe);
        if (stored === undefined) {
            const limit = this.safeInteger(this.options, 'OHLCVLimit', 1000);
            stored = new Cache.ArrayCacheByTimestamp(limit);
            this.ohlcvs[symbol][timeframe] = stored;
        }
        const tick = this.safeValue(message, 'tick');
        const parsed = this.parseOHLCV(tick, market);
        stored.append(parsed);
        client.resolve(stored, ch);
    }
    /**
     * @method
     * @name htx#watchOrderBook
     * @see https://huobiapi.github.io/docs/dm/v1/en/#subscribe-market-depth-data
     * @see https://huobiapi.github.io/docs/coin_margined_swap/v1/en/#subscribe-incremental-market-depth-data
     * @see https://huobiapi.github.io/docs/usdt_swap/v1/en/#general-subscribe-incremental-market-depth-data
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure} indexed by market symbols
     */
    async watchOrderBook(symbol, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        symbol = market['symbol'];
        const allowedLimits = [5, 20, 150, 400];
        // 2) 5-level/20-level incremental MBP is a tick by tick feed,
        // which means whenever there is an order book change at that level, it pushes an update;
        // 150-levels/400-level incremental MBP feed is based on the gap
        // between two snapshots at 100ms interval.
        const options = this.safeDict(this.options, 'watchOrderBook', {});
        if (limit === undefined) {
            limit = this.safeInteger(options, 'depth', 150);
        }
        if (!this.inArray(limit, allowedLimits)) {
            throw new errors.ExchangeError(this.id + ' watchOrderBook market accepts limits of 5, 20, 150 or 400 only');
        }
        let messageHash = undefined;
        if (market['spot']) {
            messageHash = 'market.' + market['id'] + '.mbp.' + this.numberToString(limit);
        }
        else {
            messageHash = 'market.' + market['id'] + '.depth.size_' + this.numberToString(limit) + '.high_freq';
        }
        const url = this.getUrlByMarketType(market['type'], market['linear'], false, true);
        let method = this.handleOrderBookSubscription;
        if (!market['spot']) {
            params = this.extend(params);
            params['data_type'] = 'incremental';
            method = undefined;
        }
        const orderbook = await this.subscribePublic(url, symbol, messageHash, method, params);
        return orderbook.limit();
    }
    /**
     * @method
     * @name htx#unWatchOrderBook
     * @description unsubscribe from the orderbook channel
     * @see https://huobiapi.github.io/docs/dm/v1/en/#subscribe-market-depth-data
     * @see https://huobiapi.github.io/docs/coin_margined_swap/v1/en/#subscribe-incremental-market-depth-data
     * @see https://huobiapi.github.io/docs/usdt_swap/v1/en/#general-subscribe-incremental-market-depth-data
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.limit] orderbook limit, default is undefined
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure} indexed by market symbols
     */
    async unWatchOrderBook(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const topic = 'orderbook';
        const options = this.safeDict(this.options, 'watchOrderBook', {});
        const depth = this.safeInteger(options, 'depth', 150);
        let subMessageHash = undefined;
        if (market['spot']) {
            subMessageHash = 'market.' + market['id'] + '.mbp.' + this.numberToString(depth);
        }
        else {
            subMessageHash = 'market.' + market['id'] + '.depth.size_' + this.numberToString(depth) + '.high_freq';
        }
        if (!(market['spot'])) {
            params['data_type'] = 'incremental';
        }
        return await this.unsubscribePublic(market, subMessageHash, topic, params);
    }
    handleOrderBookSnapshot(client, message, subscription) {
        //
        //     {
        //         "id": 1583473663565,
        //         "rep": "market.btcusdt.mbp.150",
        //         "status": "ok",
        //         "ts": 1698359289261,
        //         "data": {
        //             "seqNum": 104999417756,
        //             "bids": [
        //                 [9058.27, 0],
        //                 [9058.43, 0],
        //                 [9058.99, 0],
        //             ],
        //             "asks": [
        //                 [9084.27, 0.2],
        //                 [9085.69, 0],
        //                 [9085.81, 0],
        //             ]
        //         }
        //     }
        //
        const symbol = this.safeString(subscription, 'symbol');
        const messageHash = this.safeString(subscription, 'messageHash');
        const id = this.safeString(message, 'id');
        const lastTimestamp = this.safeInteger(subscription, 'lastTimestamp');
        try {
            const orderbook = this.orderbooks[symbol];
            const data = this.safeValue(message, 'data');
            const messages = orderbook.cache;
            const firstMessage = this.safeValue(messages, 0, {});
            const snapshot = this.parseOrderBook(data, symbol);
            const tick = this.safeValue(firstMessage, 'tick');
            const sequence = this.safeInteger(tick, 'prevSeqNum');
            const nonce = this.safeInteger(data, 'seqNum');
            snapshot['nonce'] = nonce;
            const snapshotTimestamp = this.safeInteger(message, 'ts');
            subscription['lastTimestamp'] = snapshotTimestamp;
            const snapshotLimit = this.safeInteger(subscription, 'limit');
            const snapshotOrderBook = this.orderBook(snapshot, snapshotLimit);
            client.resolve(snapshotOrderBook, id);
            if ((sequence === undefined) || (nonce < sequence)) {
                const maxAttempts = this.handleOption('watchOrderBook', 'maxRetries', 3);
                let numAttempts = this.safeInteger(subscription, 'numAttempts', 0);
                // retry to synchronize if we have not reached maxAttempts yet
                if (numAttempts < maxAttempts) {
                    // safety guard
                    if (messageHash in client.subscriptions) {
                        numAttempts = this.sum(numAttempts, 1);
                        const delayTime = this.sum(1000, lastTimestamp - snapshotTimestamp);
                        subscription['numAttempts'] = numAttempts;
                        client.subscriptions[messageHash] = subscription;
                        this.delay(delayTime, this.watchOrderBookSnapshot, client, message, subscription);
                    }
                }
                else {
                    // throw upon failing to synchronize in maxAttempts
                    throw new errors.InvalidNonce(this.id + ' failed to synchronize WebSocket feed with the snapshot for symbol ' + symbol + ' in ' + maxAttempts.toString() + ' attempts');
                }
            }
            else {
                orderbook.reset(snapshot);
                // unroll the accumulated deltas
                for (let i = 0; i < messages.length; i++) {
                    this.handleOrderBookMessage(client, messages[i]);
                }
                orderbook.cache = [];
                this.orderbooks[symbol] = orderbook;
                client.resolve(orderbook, messageHash);
            }
        }
        catch (e) {
            delete client.subscriptions[messageHash];
            delete this.orderbooks[symbol];
            client.reject(e, messageHash);
        }
    }
    async watchOrderBookSnapshot(client, message, subscription) {
        const messageHash = this.safeString(subscription, 'messageHash');
        const symbol = this.safeString(subscription, 'symbol');
        const limit = this.safeInteger(subscription, 'limit');
        const timestamp = this.safeInteger(message, 'ts');
        const params = this.safeValue(subscription, 'params');
        const attempts = this.safeInteger(subscription, 'numAttempts', 0);
        const market = this.market(symbol);
        const url = this.getUrlByMarketType(market['type'], market['linear'], false, true);
        const requestId = this.requestId();
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
            'numAttempts': attempts,
            'lastTimestamp': timestamp,
            'method': this.handleOrderBookSnapshot,
        };
        try {
            const orderbook = await this.watch(url, requestId, request, requestId, snapshotSubscription);
            return orderbook.limit();
        }
        catch (e) {
            delete client.subscriptions[messageHash];
            client.reject(e, messageHash);
        }
        return undefined;
    }
    handleDelta(bookside, delta) {
        const price = this.safeFloat(delta, 0);
        const amount = this.safeFloat(delta, 1);
        bookside.store(price, amount);
    }
    handleDeltas(bookside, deltas) {
        for (let i = 0; i < deltas.length; i++) {
            this.handleDelta(bookside, deltas[i]);
        }
    }
    handleOrderBookMessage(client, message) {
        // spot markets
        //
        //     {
        //         "ch": "market.btcusdt.mbp.150",
        //         "ts": 1583472025885,
        //         "tick": {
        //             "seqNum": 104998984994,
        //             "prevSeqNum": 104998984977,
        //             "bids": [
        //                 [9058.27, 0],
        //                 [9058.43, 0],
        //                 [9058.99, 0],
        //             ],
        //             "asks": [
        //                 [9084.27, 0.2],
        //                 [9085.69, 0],
        //                 [9085.81, 0],
        //             ]
        //         }
        //     }
        //
        // non-spot market update
        //
        //     {
        //         "ch":"market.BTC220218.depth.size_150.high_freq",
        //         "tick":{
        //             "asks":[],
        //             "bids":[
        //                 [43445.74,1],
        //                 [43444.48,0 ],
        //                 [40593.92,9]
        //             ],
        //             "ch":"market.BTC220218.depth.size_150.high_freq",
        //             "event":"update",
        //             "id":152727500274,
        //             "mrid":152727500274,
        //             "ts":1645023376098,
        //             "version":37536690
        //         },
        //         "ts":1645023376098
        //     }
        // non-spot market snapshot
        //
        //     {
        //         "ch":"market.BTC220218.depth.size_150.high_freq",
        //         "tick":{
        //             "asks":[
        //                 [43445.74,1],
        //                 [43444.48,0 ],
        //                 [40593.92,9]
        //             ],
        //             "bids":[
        //                 [43445.74,1],
        //                 [43444.48,0 ],
        //                 [40593.92,9]
        //             ],
        //             "ch":"market.BTC220218.depth.size_150.high_freq",
        //             "event":"snapshot",
        //             "id":152727500274,
        //             "mrid":152727500274,
        //             "ts":1645023376098,
        //             "version":37536690
        //         },
        //         "ts":1645023376098
        //     }
        //
        const ch = this.safeValue(message, 'ch');
        const parts = ch.split('.');
        const marketId = this.safeString(parts, 1);
        const market = this.safeMarket(marketId);
        const symbol = market['symbol'];
        const orderbook = this.orderbooks[symbol];
        const tick = this.safeValue(message, 'tick', {});
        const seqNum = this.safeInteger(tick, 'seqNum');
        const prevSeqNum = this.safeInteger(tick, 'prevSeqNum');
        const event = this.safeString(tick, 'event');
        const version = this.safeInteger(tick, 'version');
        const timestamp = this.safeInteger(message, 'ts');
        if (event === 'snapshot') {
            const snapshot = this.parseOrderBook(tick, symbol, timestamp);
            orderbook.reset(snapshot);
            orderbook['nonce'] = version;
        }
        if ((prevSeqNum !== undefined) && prevSeqNum > orderbook['nonce']) {
            const checksum = this.handleOption('watchOrderBook', 'checksum', true);
            if (checksum) {
                throw new errors.ChecksumError(this.id + ' ' + this.orderbookChecksumMessage(symbol));
            }
        }
        const spotConditon = market['spot'] && (prevSeqNum === orderbook['nonce']);
        const nonSpotCondition = market['contract'] && (version - 1 === orderbook['nonce']);
        if (spotConditon || nonSpotCondition) {
            const asks = this.safeValue(tick, 'asks', []);
            const bids = this.safeValue(tick, 'bids', []);
            this.handleDeltas(orderbook['asks'], asks);
            this.handleDeltas(orderbook['bids'], bids);
            orderbook['nonce'] = spotConditon ? seqNum : version;
            orderbook['timestamp'] = timestamp;
            orderbook['datetime'] = this.iso8601(timestamp);
        }
    }
    handleOrderBook(client, message) {
        //
        // deltas
        //
        // spot markets
        //
        //     {
        //         "ch": "market.btcusdt.mbp.150",
        //         "ts": 1583472025885,
        //         "tick": {
        //             "seqNum": 104998984994,
        //             "prevSeqNum": 104998984977,
        //             "bids": [
        //                 [9058.27, 0],
        //                 [9058.43, 0],
        //                 [9058.99, 0],
        //             ],
        //             "asks": [
        //                 [9084.27, 0.2],
        //                 [9085.69, 0],
        //                 [9085.81, 0],
        //             ]
        //         }
        //     }
        //
        // non spot markets
        //
        //     {
        //         "ch":"market.BTC220218.depth.size_150.high_freq",
        //         "tick":{
        //             "asks":[],
        //             "bids":[
        //                 [43445.74,1],
        //                 [43444.48,0 ],
        //                 [40593.92,9]
        //             ],
        //             "ch":"market.BTC220218.depth.size_150.high_freq",
        //             "event":"update",
        //             "id":152727500274,
        //             "mrid":152727500274,
        //             "ts":1645023376098,
        //             "version":37536690
        //         },
        //         "ts":1645023376098
        //     }
        //
        const messageHash = this.safeString(message, 'ch');
        const tick = this.safeDict(message, 'tick');
        const event = this.safeString(tick, 'event');
        const ch = this.safeString(message, 'ch');
        const parts = ch.split('.');
        const marketId = this.safeString(parts, 1);
        const symbol = this.safeSymbol(marketId);
        if (!(symbol in this.orderbooks)) {
            const size = this.safeString(parts, 3);
            const sizeParts = size.split('_');
            const limit = this.safeInteger(sizeParts, 1);
            this.orderbooks[symbol] = this.orderBook({}, limit);
        }
        const orderbook = this.orderbooks[symbol];
        if ((event === undefined) && (orderbook['nonce'] === undefined)) {
            orderbook.cache.push(message);
        }
        else {
            this.handleOrderBookMessage(client, message);
            client.resolve(orderbook, messageHash);
        }
    }
    handleOrderBookSubscription(client, message, subscription) {
        const symbol = this.safeString(subscription, 'symbol');
        const market = this.market(symbol);
        const limit = this.safeInteger(subscription, 'limit');
        this.orderbooks[symbol] = this.orderBook({}, limit);
        if (market['spot']) {
            this.spawn(this.watchOrderBookSnapshot, client, message, subscription);
        }
    }
    /**
     * @method
     * @name htx#watchMyTrades
     * @description watches information on multiple trades made by the user
     * @see https://www.htx.com/en-us/opend/newApiPages/?id=7ec53dd5-7773-11ed-9966-0242ac110003
     * @param {string} symbol unified market symbol of the market trades were made in
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    async watchMyTrades(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        this.checkRequiredCredentials();
        await this.loadMarkets();
        let type = undefined;
        let marketId = '*'; // wildcard
        let market = undefined;
        let messageHash = undefined;
        let channel = undefined;
        let trades = undefined;
        let subType = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            symbol = market['symbol'];
            type = market['type'];
            subType = market['linear'] ? 'linear' : 'inverse';
            marketId = market['lowercaseId'];
        }
        else {
            type = this.safeString(this.options, 'defaultType', 'spot');
            type = this.safeString(params, 'type', type);
            subType = this.safeString2(this.options, 'subType', 'defaultSubType', 'linear');
            subType = this.safeString(params, 'subType', subType);
            params = this.omit(params, ['type', 'subType']);
        }
        if (type === 'spot') {
            let mode = undefined;
            if (mode === undefined) {
                mode = this.safeString2(this.options, 'watchMyTrades', 'mode', '0');
                mode = this.safeString(params, 'mode', mode);
                params = this.omit(params, 'mode');
            }
            messageHash = 'trade.clearing' + '#' + marketId + '#' + mode;
            channel = messageHash;
        }
        else {
            const channelAndMessageHash = this.getOrderChannelAndMessageHash(type, subType, market, params);
            channel = this.safeString(channelAndMessageHash, 0);
            const orderMessageHash = this.safeString(channelAndMessageHash, 1);
            // we will take advantage of the order messageHash because already handles stuff
            // like symbol/margin/subtype/type variations
            messageHash = orderMessageHash + ':' + 'trade';
        }
        trades = await this.subscribePrivate(channel, messageHash, type, subType, params);
        if (this.newUpdates) {
            limit = trades.getLimit(symbol, limit);
        }
        return this.filterBySymbolSinceLimit(trades, symbol, since, limit, true);
    }
    getOrderChannelAndMessageHash(type, subType, market = undefined, params = {}) {
        let messageHash = undefined;
        let channel = undefined;
        let orderType = this.safeString(this.options, 'orderType', 'orders'); // orders or matchOrders
        orderType = this.safeString(params, 'orderType', orderType);
        params = this.omit(params, 'orderType');
        const marketCode = (market !== undefined) ? market['lowercaseId'].toLowerCase() : undefined;
        const baseId = (market !== undefined) ? market['baseId'] : undefined;
        const prefix = orderType;
        messageHash = prefix;
        if (subType === 'linear') {
            // USDT Margined Contracts Example: LTC/USDT:USDT
            const marginMode = this.safeString(params, 'margin', 'cross');
            const marginPrefix = (marginMode === 'cross') ? prefix + '_cross' : prefix;
            messageHash = marginPrefix;
            if (marketCode !== undefined) {
                messageHash += '.' + marketCode;
                channel = messageHash;
            }
            else {
                channel = marginPrefix + '.' + '*';
            }
        }
        else if (type === 'future') {
            // inverse futures Example: BCH/USD:BCH-220408
            if (baseId !== undefined) {
                channel = prefix + '.' + baseId.toLowerCase();
                messageHash = channel;
            }
            else {
                channel = prefix + '.' + '*';
            }
        }
        else {
            // inverse swaps: Example: BTC/USD:BTC
            if (marketCode !== undefined) {
                channel = prefix + '.' + marketCode;
                messageHash = channel;
            }
            else {
                channel = prefix + '.' + '*';
            }
        }
        return [channel, messageHash];
    }
    /**
     * @method
     * @name htx#watchOrders
     * @description watches information on multiple orders made by the user
     * @see https://www.htx.com/en-us/opend/newApiPages/?id=7ec53c8f-7773-11ed-9966-0242ac110003
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async watchOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let type = undefined;
        let subType = undefined;
        let market = undefined;
        let suffix = '*'; // wildcard
        if (symbol !== undefined) {
            market = this.market(symbol);
            symbol = market['symbol'];
            type = market['type'];
            suffix = market['lowercaseId'];
            subType = market['linear'] ? 'linear' : 'inverse';
        }
        else {
            type = this.safeString(this.options, 'defaultType', 'spot');
            type = this.safeString(params, 'type', type);
            subType = this.safeString2(this.options, 'subType', 'defaultSubType', 'linear');
            subType = this.safeString(params, 'subType', subType);
            params = this.omit(params, ['type', 'subType']);
        }
        let messageHash = undefined;
        let channel = undefined;
        if (type === 'spot') {
            messageHash = 'orders' + '#' + suffix;
            channel = messageHash;
        }
        else {
            const channelAndMessageHash = this.getOrderChannelAndMessageHash(type, subType, market, params);
            channel = this.safeString(channelAndMessageHash, 0);
            messageHash = this.safeString(channelAndMessageHash, 1);
        }
        const orders = await this.subscribePrivate(channel, messageHash, type, subType, params);
        if (this.newUpdates) {
            limit = orders.getLimit(symbol, limit);
        }
        return this.filterBySinceLimit(orders, since, limit, 'timestamp', true);
    }
    handleOrder(client, message) {
        //
        // spot
        //
        //     for new order creation
        //
        //     {
        //         "action":"push",
        //         "ch":"orders#btcusdt", // or "orders#*" for global subscriptions
        //         "data": {
        //             "orderStatus": "submitted",
        //             "eventType": "creation",
        //             "totalTradeAmount": 0 // for "submitted" order status
        //             "orderCreateTime": 1645116048355, // only when `submitted` status
        //             "orderSource": "spot-web",
        //             "accountId": 44234548,
        //             "orderPrice": "100",
        //             "orderSize": "0.05",
        //             "symbol": "ethusdt",
        //             "type": "buy-limit",
        //             "orderId": "478861479986886",
        //             "clientOrderId": '',
        //         }
        //     }
        //
        //     for filled order, additional fields are present:
        //
        //             "orderStatus": "filled",
        //             "eventType": "trade",
        //             "totalTradeAmount": "5.9892649859",
        //             "tradePrice": "0.676669",
        //             "tradeVolume": "8.8511",
        //             "tradeTime": 1760427775894,
        //             "aggressor": false,
        //             "execAmt": "8.8511",
        //             "tradeId": 100599712781,
        //             "remainAmt": "0",
        //
        // spot wrapped trade
        //
        //     {
        //         "action": "push",
        //         "ch": "orders#ltcusdt",
        //         "data": {
        //             "tradePrice": "130.01",
        //             "tradeVolume": "0.0385",
        //             "tradeTime": 1648714741525,
        //             "aggressor": true,
        //             "execAmt": "0.0385",
        //             "orderSource": "spot-web",
        //             "orderSize": "0.0385",
        //             "remainAmt": "0",
        //             "tradeId": 101541578884,
        //             "symbol": "ltcusdt",
        //             "type": "sell-market",
        //             "eventType": "trade",
        //             "clientOrderId": '',
        //             "orderStatus": "filled",
        //             "orderId": 509835753860328
        //         }
        //     }
        //
        // non spot order
        //
        // {
        //     "contract_type": "swap",
        //     "pair": "LTC-USDT",
        //     "business_type": "swap",
        //     "op": "notify",
        //     "topic": "orders_cross.ltc-usdt",
        //     "ts": 1650354508696,
        //     "symbol": "LTC",
        //     "contract_code": "LTC-USDT",
        //     "volume": 1,
        //     "price": 110.34,
        //     "order_price_type": "lightning",
        //     "direction": "sell",
        //     "offset": "close",
        //     "status": 6,
        //     "lever_rate": 1,
        //     "order_id": "966002354015051776",
        //     "order_id_str": "966002354015051776",
        //     "client_order_id": null,
        //     "order_source": "web",
        //     "order_type": 1,
        //     "created_at": 1650354508649,
        //     "trade_volume": 1,
        //     "trade_turnover": 11.072,
        //     "fee": -0.005536,
        //     "trade_avg_price": 110.72,
        //     "margin_frozen": 0,
        //     "profit": -0.045,
        //     "trade": [
        //       {
        //         "trade_fee": -0.005536,
        //         "fee_asset": "USDT",
        //         "real_profit": 0.473,
        //         "profit": -0.045,
        //         "trade_id": 86678766507,
        //         "id": "86678766507-966002354015051776-1",
        //         "trade_volume": 1,
        //         "trade_price": 110.72,
        //         "trade_turnover": 11.072,
        //         "created_at": 1650354508656,
        //         "role": "taker"
        //       }
        //     ],
        //     "canceled_at": 0,
        //     "fee_asset": "USDT",
        //     "margin_asset": "USDT",
        //     "uid": "359305390",
        //     "liquidation_type": "0",
        //     "margin_mode": "cross",
        //     "margin_account": "USDT",
        //     "is_tpsl": 0,
        //     "real_profit": 0.473,
        //     "trade_partition": "USDT",
        //     "reduce_only": 1
        //   }
        //
        //
        const messageHash = this.safeString2(message, 'ch', 'topic');
        const data = this.safeValue(message, 'data');
        let marketId = this.safeString(message, 'contract_code');
        if (marketId === undefined) {
            marketId = this.safeString(data, 'symbol');
        }
        const market = this.safeMarket(marketId);
        let parsedOrder = undefined;
        if (data !== undefined) {
            // spot updates
            const eventType = this.safeString(data, 'eventType');
            if (eventType === 'trade') {
                // when a spot order is filled we get an update message
                // with the trade info
                const parsedTrade = this.parseOrderTrade(data, market);
                // inject trade in existing order by faking an order object
                const orderId = this.safeString(parsedTrade, 'order');
                const trades = [parsedTrade];
                const status = this.parseOrderStatus(this.safeString2(data, 'orderStatus', 'status', 'closed'));
                const filled = this.safeString(data, 'execAmt');
                const remaining = this.safeString(data, 'remainAmt');
                const order = {
                    'id': orderId,
                    'trades': trades,
                    'status': status,
                    'symbol': market['symbol'],
                    'filled': this.parseNumber(filled),
                    'remaining': this.parseNumber(remaining),
                    'price': this.safeNumber(data, 'orderPrice'),
                    'amount': this.safeNumber(data, 'orderSize'),
                    'info': data,
                };
                parsedOrder = order;
            }
            else {
                parsedOrder = this.parseWsOrder(data, market);
            }
        }
        else {
            // contract branch
            parsedOrder = this.parseWsOrder(message, market);
            const rawTrades = this.safeValue(message, 'trade', []);
            const tradesLength = rawTrades.length;
            if (tradesLength > 0) {
                const tradesObject = {
                    'trades': rawTrades,
                    'ch': messageHash,
                    'symbol': marketId,
                };
                // inject order params in every trade
                const extendTradeParams = {
                    'order': this.safeString(parsedOrder, 'id'),
                    'type': this.safeString(parsedOrder, 'type'),
                    'side': this.safeString(parsedOrder, 'side'),
                };
                // trades arrive inside an order update
                // we're forwarding them to handleMyTrade
                // so they can be properly resolved
                this.handleMyTrade(client, tradesObject, extendTradeParams);
            }
        }
        if (this.orders === undefined) {
            const limit = this.safeInteger(this.options, 'ordersLimit', 1000);
            this.orders = new Cache.ArrayCacheBySymbolById(limit);
        }
        const cachedOrders = this.orders;
        cachedOrders.append(parsedOrder);
        client.resolve(this.orders, messageHash);
        // when we make a global subscription (for contracts only) our message hash can't have a symbol/currency attached
        // so we're removing it here
        let genericMessageHash = messageHash.replace('.' + market['lowercaseId'], '');
        const lowerCaseBaseId = this.safeStringLower(market, 'baseId');
        genericMessageHash = genericMessageHash.replace('.' + lowerCaseBaseId, '');
        client.resolve(this.orders, genericMessageHash);
    }
    parseWsOrder(order, market = undefined) {
        //
        // spot
        //
        //     {
        //         "orderSource": "spot-web",
        //         "orderCreateTime": 1645116048355, // creating only
        //         "accountId": 44234548,
        //         "orderPrice": "100",
        //         "orderSize": "0.05",
        //         "orderValue": "3.71676361", // market-buy only
        //         "symbol": "ethusdt",
        //         "type": "buy-limit",
        //         "orderId": "478861479986886",
        //         "eventType": "creation",
        //         "clientOrderId": '',
        //         "orderStatus": "submitted"
        //         "lastActTime":1645118621810 // except creating
        //         "execAmt":"0"
        //     }
        //
        // swap order
        //
        //     {
        //         "contract_type": "swap",
        //         "pair": "LTC-USDT",
        //         "business_type": "swap",
        //         "op": "notify",
        //         "topic": "orders_cross.ltc-usdt",
        //         "ts": 1648717911384,
        //         "symbol": "LTC",
        //         "contract_code": "LTC-USDT",
        //         "volume": 1,
        //         "price": 129.13,
        //         "order_price_type": "lightning",
        //         "direction": "sell",
        //         "offset": "close",
        //         "status": 6,
        //         "lever_rate": 5,
        //         "order_id": "959137967397068800",
        //         "order_id_str": "959137967397068800",
        //         "client_order_id": null,
        //         "order_source": "web",
        //         "order_type": 1,
        //         "created_at": 1648717911344,
        //         "trade_volume": 1,
        //         "trade_turnover": 12.952,
        //         "fee": -0.006476,
        //         "trade_avg_price": 129.52,
        //         "margin_frozen": 0,
        //         "profit": -0.005,
        //         "trade": [
        //             {
        //                 "trade_fee": -0.006476,
        //                 "fee_asset": "USDT",
        //                 "real_profit": -0.005,
        //                 "profit": -0.005,
        //                 "trade_id": 83619995370,
        //                 "id": "83619995370-959137967397068800-1",
        //                 "trade_volume": 1,
        //                 "trade_price": 129.52,
        //                 "trade_turnover": 12.952,
        //                 "created_at": 1648717911352,
        //                 "role": "taker"
        //             }
        //         ],
        //         "canceled_at": 0,
        //         "fee_asset": "USDT",
        //         "margin_asset": "USDT",
        //         "uid": "359305390",
        //         "liquidation_type": "0",
        //         "margin_mode": "cross",
        //         "margin_account": "USDT",
        //         "is_tpsl": 0,
        //         "real_profit": -0.005,
        //         "trade_partition": "USDT",
        //         "reduce_only": 1
        //     }
        //
        //     {
        //         "op":"notify",
        //         "topic":"orders.ada",
        //         "ts":1604388667226,
        //         "symbol":"ADA",
        //         "contract_type":"quarter",
        //         "contract_code":"ADA201225",
        //         "volume":1,
        //         "price":0.0905,
        //         "order_price_type":"post_only",
        //         "direction":"sell",
        //         "offset":"open",
        //         "status":6,
        //         "lever_rate":20,
        //         "order_id":773207641127878656,
        //         "order_id_str":"773207641127878656",
        //         "client_order_id":null,
        //         "order_source":"web",
        //         "order_type":1,
        //         "created_at":1604388667146,
        //         "trade_volume":1,
        //         "trade_turnover":10,
        //         "fee":-0.022099447513812154,
        //         "trade_avg_price":0.0905,
        //         "margin_frozen":0,
        //         "profit":0,
        //         "trade":[],
        //         "canceled_at":0,
        //         "fee_asset":"ADA",
        //         "uid":"123456789",
        //         "liquidation_type":"0",
        //         "is_tpsl": 0,
        //         "real_profit": 0
        //     }
        //
        const lastTradeTimestamp = this.safeInteger2(order, 'lastActTime', 'ts');
        const created = this.safeInteger(order, 'orderCreateTime');
        const marketId = this.safeString2(order, 'contract_code', 'symbol');
        market = this.safeMarket(marketId, market);
        const symbol = this.safeSymbol(marketId, market);
        const amount = this.safeString2(order, 'orderSize', 'volume');
        const status = this.parseOrderStatus(this.safeString2(order, 'orderStatus', 'status'));
        const id = this.safeString2(order, 'orderId', 'order_id');
        const clientOrderId = this.safeString2(order, 'clientOrderId', 'client_order_id');
        const price = this.safeString2(order, 'orderPrice', 'price');
        const filled = this.safeString(order, 'execAmt');
        const typeSide = this.safeString(order, 'type');
        const feeCost = this.safeString(order, 'fee');
        let fee = undefined;
        if (feeCost !== undefined) {
            const feeCurrencyId = this.safeString(order, 'fee_asset');
            fee = {
                'cost': feeCost,
                'currency': this.safeCurrencyCode(feeCurrencyId),
            };
        }
        const avgPrice = this.safeString(order, 'trade_avg_price');
        const rawTrades = this.safeValue(order, 'trade');
        let typeSideParts = [];
        if (typeSide !== undefined) {
            typeSideParts = typeSide.split('-');
        }
        let type = this.safeStringLower(typeSideParts, 1);
        if (type === undefined) {
            type = this.safeString(order, 'order_price_type');
        }
        let side = this.safeStringLower(typeSideParts, 0);
        if (side === undefined) {
            side = this.safeString(order, 'direction');
        }
        const cost = this.safeString(order, 'orderValue');
        return this.safeOrder({
            'info': order,
            'id': id,
            'clientOrderId': clientOrderId,
            'timestamp': created,
            'datetime': this.iso8601(created),
            'lastTradeTimestamp': lastTradeTimestamp,
            'status': status,
            'symbol': symbol,
            'type': type,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'amount': amount,
            'filled': filled,
            'remaining': undefined,
            'cost': cost,
            'fee': fee,
            'average': avgPrice,
            'trades': rawTrades,
        }, market);
    }
    parseOrderTrade(trade, market = undefined) {
        // spot private wrapped trade
        //
        //     {
        //         "tradePrice": "130.01",
        //         "tradeVolume": "0.0385",
        //         "tradeTime": 1648714741525,
        //         "aggressor": true,
        //         "execAmt": "0.0385",
        //         "orderSource": "spot-web",
        //         "orderSize": "0.0385",
        //         "remainAmt": "0",
        //         "tradeId": 101541578884,
        //         "symbol": "ltcusdt",
        //         "type": "sell-market",
        //         "eventType": "trade",
        //         "clientOrderId": '',
        //         "orderStatus": "filled",
        //         "orderId": 509835753860328
        //     }
        //
        market = this.safeMarket(undefined, market);
        const symbol = market['symbol'];
        const tradeId = this.safeString(trade, 'tradeId');
        const price = this.safeString(trade, 'tradePrice');
        const amount = this.safeString(trade, 'tradeVolume');
        const order = this.safeString(trade, 'orderId');
        const timestamp = this.safeInteger(trade, 'tradeTime');
        let type = this.safeString(trade, 'type');
        let side = undefined;
        if (type !== undefined) {
            const typeParts = type.split('-');
            side = typeParts[0];
            type = typeParts[1];
        }
        const aggressor = this.safeValue(trade, 'aggressor');
        let takerOrMaker = undefined;
        if (aggressor !== undefined) {
            takerOrMaker = aggressor ? 'taker' : 'maker';
        }
        return this.safeTrade({
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'symbol': symbol,
            'id': tradeId,
            'order': order,
            'type': type,
            'takerOrMaker': takerOrMaker,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'fee': undefined,
        }, market);
    }
    /**
     * @method
     * @name htx#watchPositions
     * @see https://www.huobi.com/en-in/opend/newApiPages/?id=8cb7de1c-77b5-11ed-9966-0242ac110003
     * @see https://www.huobi.com/en-in/opend/newApiPages/?id=8cb7df0f-77b5-11ed-9966-0242ac110003
     * @see https://www.huobi.com/en-in/opend/newApiPages/?id=28c34a7d-77ae-11ed-9966-0242ac110003
     * @see https://www.huobi.com/en-in/opend/newApiPages/?id=5d5156b5-77b6-11ed-9966-0242ac110003
     * @description watch all open positions. Note: huobi has one channel for each marginMode and type
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param since
     * @param limit
     * @param {object} params extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/en/latest/manual.html#position-structure}
     */
    async watchPositions(symbols = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let market = undefined;
        let messageHash = '';
        if (!this.isEmpty(symbols)) {
            market = this.getMarketFromSymbols(symbols);
            messageHash = '::' + symbols.join(',');
        }
        let type = undefined;
        let subType = undefined;
        if (market !== undefined) {
            type = market['type'];
            subType = market['linear'] ? 'linear' : 'inverse';
        }
        else {
            [type, params] = this.handleMarketTypeAndParams('watchPositions', market, params);
            if (type === 'spot') {
                type = 'future';
            }
            [subType, params] = this.handleOptionAndParams(params, 'watchPositions', 'subType', subType);
        }
        symbols = this.marketSymbols(symbols);
        let marginMode = undefined;
        [marginMode, params] = this.handleMarginModeAndParams('watchPositions', params, 'cross');
        const isLinear = (subType === 'linear');
        const url = this.getUrlByMarketType(type, isLinear, true);
        messageHash = marginMode + ':positions' + messageHash;
        const channel = (marginMode === 'cross') ? 'positions_cross.*' : 'positions.*';
        const newPositions = await this.subscribePrivate(channel, messageHash, type, subType, params);
        if (this.newUpdates) {
            return newPositions;
        }
        return this.filterBySymbolsSinceLimit(this.positions[url][marginMode], symbols, since, limit, false);
    }
    handlePositions(client, message) {
        //
        //    {
        //        op: 'notify',
        //        topic: 'positions_cross',
        //        ts: 1696767149650,
        //        event: 'snapshot',
        //        data: [
        //          {
        //            contract_type: 'swap',
        //            pair: 'BTC-USDT',
        //            business_type: 'swap',
        //            liquidation_price: null,
        //            symbol: 'BTC',
        //            contract_code: 'BTC-USDT',
        //            volume: 1,
        //            available: 1,
        //            frozen: 0,
        //            cost_open: 27802.2,
        //            cost_hold: 27802.2,
        //            profit_unreal: 0.0175,
        //            profit_rate: 0.000629446590557581,
        //            profit: 0.0175,
        //            margin_asset: 'USDT',
        //            position_margin: 27.8197,
        //            lever_rate: 1,
        //            direction: 'buy',
        //            last_price: 27819.7,
        //            margin_mode: 'cross',
        //            margin_account: 'USDT',
        //            trade_partition: 'USDT',
        //            position_mode: 'dual_side'
        //          },
        //        ]
        //    }
        //
        const url = client.url;
        const topic = this.safeString(message, 'topic', '');
        const marginMode = (topic === 'positions_cross') ? 'cross' : 'isolated';
        if (this.positions === undefined) {
            this.positions = {};
        }
        const clientPositions = this.safeValue(this.positions, url);
        if (clientPositions === undefined) {
            this.positions[url] = {};
        }
        const clientMarginModePositions = this.safeValue(clientPositions, marginMode);
        if (clientMarginModePositions === undefined) {
            this.positions[url][marginMode] = new Cache.ArrayCacheBySymbolBySide();
        }
        const cache = this.positions[url][marginMode];
        const rawPositions = this.safeValue(message, 'data', []);
        const newPositions = [];
        const timestamp = this.safeInteger(message, 'ts');
        for (let i = 0; i < rawPositions.length; i++) {
            const rawPosition = rawPositions[i];
            const position = this.parsePosition(rawPosition);
            position['timestamp'] = timestamp;
            position['datetime'] = this.iso8601(timestamp);
            newPositions.push(position);
            cache.append(position);
        }
        const messageHashes = this.findMessageHashes(client, marginMode + ':positions::');
        for (let i = 0; i < messageHashes.length; i++) {
            const messageHash = messageHashes[i];
            const parts = messageHash.split('::');
            const symbolsString = parts[1];
            const symbols = symbolsString.split(',');
            const positions = this.filterByArray(newPositions, 'symbol', symbols, false);
            if (!this.isEmpty(positions)) {
                client.resolve(positions, messageHash);
            }
        }
        client.resolve(newPositions, marginMode + ':positions');
    }
    /**
     * @method
     * @name htx#watchBalance
     * @description watch balance and get the amount of funds available for trading or funds locked in orders
     * @see https://www.htx.com/en-us/opend/newApiPages/?id=7ec52e28-7773-11ed-9966-0242ac110003
     * @see https://www.htx.com/en-us/opend/newApiPages/?id=10000084-77b7-11ed-9966-0242ac110003
     * @see https://www.htx.com/en-us/opend/newApiPages/?id=8cb7dcca-77b5-11ed-9966-0242ac110003
     * @see https://www.htx.com/en-us/opend/newApiPages/?id=28c34995-77ae-11ed-9966-0242ac110003
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
     */
    async watchBalance(params = {}) {
        let type = undefined;
        [type, params] = this.handleMarketTypeAndParams('watchBalance', undefined, params);
        let subType = undefined;
        [subType, params] = this.handleSubTypeAndParams('watchBalance', undefined, params, 'linear');
        const isUnifiedAccount = this.safeValue2(params, 'isUnifiedAccount', 'unified', false);
        params = this.omit(params, ['isUnifiedAccount', 'unified']);
        await this.loadMarkets();
        let messageHash = undefined;
        let channel = undefined;
        let marginMode = undefined;
        if (type === 'spot') {
            let mode = this.safeString2(this.options, 'watchBalance', 'mode', '2');
            mode = this.safeString(params, 'mode', mode);
            messageHash = 'accounts.update' + '#' + mode;
            channel = messageHash;
        }
        else {
            const symbol = this.safeString(params, 'symbol');
            const currency = this.safeString(params, 'currency');
            const market = (symbol !== undefined) ? this.market(symbol) : undefined;
            const currencyCode = (currency !== undefined) ? this.currency(currency) : undefined;
            marginMode = this.safeString(params, 'margin', 'cross');
            params = this.omit(params, ['currency', 'symbol', 'margin']);
            let prefix = 'accounts';
            messageHash = prefix;
            if (subType === 'linear') {
                if (isUnifiedAccount) {
                    // usdt contracts account
                    prefix = 'accounts_unify';
                    messageHash = prefix;
                    channel = prefix + '.' + 'usdt';
                }
                else {
                    // usdt contracts account
                    prefix = (marginMode === 'cross') ? prefix + '_cross' : prefix;
                    messageHash = prefix;
                    if (marginMode === 'isolated') {
                        // isolated margin only allows filtering by symbol3
                        if (symbol !== undefined) {
                            messageHash += '.' + market['id'];
                            channel = messageHash;
                        }
                        else {
                            // subscribe to all
                            channel = prefix + '.' + '*';
                        }
                    }
                    else {
                        // cross margin
                        if (currencyCode !== undefined) {
                            channel = prefix + '.' + currencyCode['id'];
                            messageHash = channel;
                        }
                        else {
                            // subscribe to all
                            channel = prefix + '.' + '*';
                        }
                    }
                }
            }
            else if (type === 'future') {
                // inverse futures account
                if (currencyCode !== undefined) {
                    messageHash += '.' + currencyCode['id'];
                    channel = messageHash;
                }
                else {
                    // subscribe to all
                    channel = prefix + '.' + '*';
                }
            }
            else {
                // inverse swaps account
                if (market !== undefined) {
                    messageHash += '.' + market['id'];
                    channel = messageHash;
                }
                else {
                    // subscribe to all
                    channel = prefix + '.' + '*';
                }
            }
        }
        const subscriptionParams = {
            'type': type,
            'subType': subType,
            'margin': marginMode,
        };
        // we are differentiating the channel from the messageHash for global subscriptions (*)
        // because huobi returns a different topic than the topic sent. Example: we send
        // "accounts.*" and "accounts" is returned so we're setting channel = "accounts.*" and
        // messageHash = "accounts" allowing handleBalance to freely resolve the topic in the message
        return await this.subscribePrivate(channel, messageHash, type, subType, params, subscriptionParams);
    }
    handleBalance(client, message) {
        // spot
        //
        //     {
        //         "action": "push",
        //         "ch": "accounts.update#0",
        //         "data": {
        //             "currency": "btc",
        //             "accountId": 123456,
        //             "balance": "23.111",
        //             "available": "2028.699426619837209087",
        //             "changeType": "transfer",
        //             "accountType":"trade",
        //             "seqNum": "86872993928",
        //             "changeTime": 1568601800000
        //         }
        //     }
        //
        // inverse future
        //
        //     {
        //         "op":"notify",
        //         "topic":"accounts.ada",
        //         "ts":1604388667226,
        //         "event":"order.match",
        //         "data":[
        //             {
        //                 "symbol":"ADA",
        //                 "margin_balance":446.417641681222726716,
        //                 "margin_static":445.554085945257745136,
        //                 "margin_position":11.049723756906077348,
        //                 "margin_frozen":0,
        //                 "margin_available":435.367917924316649368,
        //                 "profit_real":21.627049781983019459,
        //                 "profit_unreal":0.86355573596498158,
        //                 "risk_rate":40.000796572150656768,
        //                 "liquidation_price":0.018674308027108984,
        //                 "withdraw_available":423.927036163274725677,
        //                 "lever_rate":20,
        //                 "adjust_factor":0.4
        //             }
        //         ],
        //         "uid":"123456789"
        //     }
        //
        // usdt / linear future, swap
        //
        //     {
        //         "op":"notify",
        //         "topic":"accounts.btc-usdt", // or "accounts" for global subscriptions
        //         "ts":1603711370689,
        //         "event":"order.open",
        //         "data":[
        //             {
        //                 "margin_mode":"cross",
        //                 "margin_account":"USDT",
        //                 "margin_asset":"USDT",
        //                 "margin_balance":30.959342395,
        //                 "margin_static":30.959342395,
        //                 "margin_position":0,
        //                 "margin_frozen":10,
        //                 "profit_real":0,
        //                 "profit_unreal":0,
        //                 "withdraw_available":20.959342395,
        //                 "risk_rate":153.796711975,
        //                 "position_mode":"dual_side",
        //                 "contract_detail":[
        //                     {
        //                         "symbol":"LTC",
        //                         "contract_code":"LTC-USDT",
        //                         "margin_position":0,
        //                         "margin_frozen":0,
        //                         "margin_available":20.959342395,
        //                         "profit_unreal":0,
        //                         "liquidation_price":null,
        //                         "lever_rate":1,
        //                         "adjust_factor":0.01,
        //                         "contract_type":"swap",
        //                         "pair":"LTC-USDT",
        //                         "business_type":"swap",
        //                         "trade_partition":"USDT"
        //                     },
        //                 ],
        //                 "futures_contract_detail":[],
        //             }
        //         ]
        //     }
        //
        // inverse future
        //
        //     {
        //         "op":"notify",
        //         "topic":"accounts.ada",
        //         "ts":1604388667226,
        //         "event":"order.match",
        //         "data":[
        //             {
        //                 "symbol":"ADA",
        //                 "margin_balance":446.417641681222726716,
        //                 "margin_static":445.554085945257745136,
        //                 "margin_position":11.049723756906077348,
        //                 "margin_frozen":0,
        //                 "margin_available":435.367917924316649368,
        //                 "profit_real":21.627049781983019459,
        //                 "profit_unreal":0.86355573596498158,
        //                 "risk_rate":40.000796572150656768,
        //                 "liquidation_price":0.018674308027108984,
        //                 "withdraw_available":423.927036163274725677,
        //                 "lever_rate":20,
        //                 "adjust_factor":0.4
        //             }
        //         ],
        //         "uid":"123456789"
        //     }
        //
        const channel = this.safeString(message, 'ch');
        const data = this.safeValue(message, 'data', []);
        const timestamp = this.safeInteger(data, 'changeTime', this.safeInteger(message, 'ts'));
        this.balance['timestamp'] = timestamp;
        this.balance['datetime'] = this.iso8601(timestamp);
        this.balance['info'] = data;
        if (channel !== undefined) {
            // spot balance
            const currencyId = this.safeString(data, 'currency');
            const code = this.safeCurrencyCode(currencyId);
            const account = this.account();
            account['free'] = this.safeString(data, 'available');
            account['total'] = this.safeString(data, 'balance');
            this.balance[code] = account;
            this.balance = this.safeBalance(this.balance);
            client.resolve(this.balance, channel);
        }
        else {
            // contract balance
            const dataLength = data.length;
            if (dataLength === 0) {
                return;
            }
            const first = this.safeValue(data, 0, {});
            const topic = this.safeString(message, 'topic');
            const splitTopic = topic.split('.');
            let messageHash = this.safeString(splitTopic, 0);
            let subscription = this.safeValue2(client.subscriptions, messageHash, messageHash + '.*');
            if (subscription === undefined) {
                // if subscription not found means that we subscribed to a specific currency/symbol
                // and we use the first data entry to find it
                // Example: topic = 'accounts'
                // client.subscription hash = 'accounts.usdt'
                // we do 'accounts' + '.' + data[0]]['margin_asset'] to get it
                const currencyId = this.safeString2(first, 'margin_asset', 'symbol');
                messageHash += '.' + currencyId.toLowerCase();
                subscription = this.safeValue(client.subscriptions, messageHash);
            }
            const type = this.safeString(subscription, 'type');
            const subType = this.safeString(subscription, 'subType');
            if (topic === 'accounts_unify') {
                // {
                //     "margin_asset": "USDT",
                //     "margin_static": 10,
                //     "cross_margin_static": 10,
                //     "margin_balance": 10,
                //     "cross_profit_unreal": 0,
                //     "margin_frozen": 0,
                //     "withdraw_available": 10,
                //     "cross_risk_rate": null,
                //     "cross_swap": [],
                //     "cross_future": [],
                //     "isolated_swap": []
                // }
                const marginAsset = this.safeString(first, 'margin_asset');
                const code = this.safeCurrencyCode(marginAsset);
                const marginFrozen = this.safeString(first, 'margin_frozen');
                const unifiedAccount = this.account();
                unifiedAccount['free'] = this.safeString(first, 'withdraw_available');
                unifiedAccount['used'] = marginFrozen;
                this.balance[code] = unifiedAccount;
                this.balance = this.safeBalance(this.balance);
                client.resolve(this.balance, 'accounts_unify');
            }
            else if (subType === 'linear') {
                const margin = this.safeString(subscription, 'margin');
                if (margin === 'cross') {
                    const fieldName = (type === 'future') ? 'futures_contract_detail' : 'contract_detail';
                    const balances = this.safeValue(first, fieldName, []);
                    const balancesLength = balances.length;
                    if (balancesLength > 0) {
                        for (let i = 0; i < balances.length; i++) {
                            const balance = balances[i];
                            const marketId = this.safeString2(balance, 'contract_code', 'margin_account');
                            const market = this.safeMarket(marketId);
                            const currencyId = this.safeString(balance, 'margin_asset');
                            const currency = this.safeCurrency(currencyId);
                            const code = this.safeString(market, 'settle', currency['code']);
                            // the exchange outputs positions for delisted markets
                            // https://www.huobi.com/support/en-us/detail/74882968522337
                            // we skip it if the market was delisted
                            if (code !== undefined) {
                                const account = this.account();
                                account['free'] = this.safeString2(balance, 'margin_balance', 'margin_available');
                                account['used'] = this.safeString(balance, 'margin_frozen');
                                const accountsByCode = {};
                                accountsByCode[code] = account;
                                const symbol = market['symbol'];
                                this.balance[symbol] = this.safeBalance(accountsByCode);
                            }
                        }
                    }
                }
                else {
                    // isolated margin
                    for (let i = 0; i < data.length; i++) {
                        const isolatedBalance = data[i];
                        const account = this.account();
                        account['free'] = this.safeString(isolatedBalance, 'margin_balance', 'margin_available');
                        account['used'] = this.safeString(isolatedBalance, 'margin_frozen');
                        const currencyId = this.safeString2(isolatedBalance, 'margin_asset', 'symbol');
                        const code = this.safeCurrencyCode(currencyId);
                        this.balance[code] = account;
                        this.balance = this.safeBalance(this.balance);
                    }
                }
            }
            else {
                // inverse branch
                for (let i = 0; i < data.length; i++) {
                    const balance = data[i];
                    const currencyId = this.safeString(balance, 'symbol');
                    const code = this.safeCurrencyCode(currencyId);
                    const account = this.account();
                    account['free'] = this.safeString(balance, 'margin_available');
                    account['used'] = this.safeString(balance, 'margin_frozen');
                    this.balance[code] = account;
                    this.balance = this.safeBalance(this.balance);
                }
            }
            client.resolve(this.balance, messageHash);
        }
    }
    handleSubscriptionStatus(client, message) {
        //
        //     {
        //         "id": 1583414227,
        //         "status": "ok",
        //         "subbed": "market.btcusdt.mbp.150",
        //         "ts": 1583414229143
        //     }
        //
        // unsubscribe
        //     {
        //         "id": "2",
        //         "status": "ok",
        //         "unsubbed": "market.BTC-USDT-251003.detail",
        //         "ts": 1759329276980
        //     }
        //
        const id = this.safeString(message, 'id');
        const subscriptionsById = this.indexBy(client.subscriptions, 'id');
        const subscription = this.safeDict(subscriptionsById, id);
        if (subscription !== undefined) {
            const method = this.safeValue(subscription, 'method');
            if (method !== undefined) {
                method.call(this, client, message, subscription);
                // return; commented out to clean up
            }
            // clean up
            if (id in client.subscriptions) {
                delete client.subscriptions[id];
            }
        }
        if ('unsubbed' in message) {
            this.handleUnSubscription(client, subscription);
        }
    }
    handleUnSubscription(client, subscription) {
        const messageHashes = this.safeList(subscription, 'messageHashes', []);
        const subMessageHashes = this.safeList(subscription, 'subMessageHashes', []);
        for (let i = 0; i < messageHashes.length; i++) {
            const unsubHash = messageHashes[i];
            const subHash = subMessageHashes[i];
            this.cleanUnsubscription(client, subHash, unsubHash);
        }
        this.cleanCache(subscription);
    }
    handleSystemStatus(client, message) {
        //
        // todo: answer the question whether handleSystemStatus should be renamed
        // and unified as handleStatus for any usage pattern that
        // involves system status and maintenance updates
        //
        //     {
        //         "id": "1578090234088", // connectId
        //         "type": "welcome",
        //     }
        //
        return message;
    }
    handleSubject(client, message) {
        // spot
        //     {
        //         "ch": "market.btcusdt.mbp.150",
        //         "ts": 1583472025885,
        //         "tick": {
        //             "seqNum": 104998984994,
        //             "prevSeqNum": 104998984977,
        //             "bids": [
        //                 [9058.27, 0],
        //                 [9058.43, 0],
        //                 [9058.99, 0],
        //             ],
        //             "asks": [
        //                 [9084.27, 0.2],
        //                 [9085.69, 0],
        //                 [9085.81, 0],
        //             ]
        //         }
        //     }
        // non spot
        //
        //     {
        //         "ch":"market.BTC220218.depth.size_150.high_freq",
        //         "tick":{
        //             "asks":[],
        //             "bids":[
        //                 [43445.74,1],
        //                 [43444.48,0 ],
        //                 [40593.92,9]
        //             ],
        //             "ch":"market.BTC220218.depth.size_150.high_freq",
        //             "event":"update",
        //             "id":152727500274,
        //             "mrid":152727500274,
        //             "ts":1645023376098,
        //             "version":37536690
        //         },
        //         "ts":1645023376098
        //     }
        //
        // spot private trade
        //
        //     {
        //         "action":"push",
        //         "ch":"trade.clearing#ltcusdt#1",
        //         "data":{
        //             "eventType":"trade",
        //             "symbol":"ltcusdt",
        //             // ...
        //         },
        //     }
        //
        // spot order
        //
        //     {
        //         "action":"push",
        //         "ch":"orders#btcusdt",
        //         "data": {
        //             "orderSide":"buy",
        //             "lastActTime":1583853365586,
        //             "clientOrderId":"abc123",
        //             "orderStatus":"rejected",
        //             "symbol":"btcusdt",
        //             "eventType":"trigger",
        //             "errCode": 2002,
        //             "errMessage":"invalid.client.order.id (NT)"
        //         }
        //     }
        //
        // contract order
        //
        //     {
        //         "op":"notify",
        //         "topic":"orders.ada",
        //         "ts":1604388667226,
        //         // ?
        //     }
        //
        const ch = this.safeValue(message, 'ch', '');
        const parts = ch.split('.');
        const type = this.safeString(parts, 0);
        if (type === 'market') {
            const methodName = this.safeString(parts, 2);
            const methods = {
                'depth': this.handleOrderBook,
                'mbp': this.handleOrderBook,
                'detail': this.handleTicker,
                'bbo': this.handleTicker,
                'ticker': this.handleTicker,
                'trade': this.handleTrades,
                'kline': this.handleOHLCV,
            };
            const method = this.safeValue(methods, methodName);
            if (method !== undefined) {
                method.call(this, client, message);
                return;
            }
        }
        // private spot subjects
        const privateParts = ch.split('#');
        const privateType = this.safeString(privateParts, 0, '');
        if (privateType === 'trade.clearing') {
            this.handleMyTrade(client, message);
            return;
        }
        if (privateType.indexOf('accounts.update') >= 0) {
            this.handleBalance(client, message);
            return;
        }
        if (privateType === 'orders') {
            this.handleOrder(client, message);
            return;
        }
        // private contract subjects
        const op = this.safeString(message, 'op');
        if (op === 'notify') {
            const topic = this.safeString(message, 'topic', '');
            if (topic.indexOf('orders') >= 0) {
                this.handleOrder(client, message);
            }
            if (topic.indexOf('account') >= 0) {
                this.handleBalance(client, message);
            }
            if (topic.indexOf('positions') >= 0) {
                this.handlePositions(client, message);
            }
        }
    }
    async pong(client, message) {
        //
        //     { ping: 1583491673714 }
        //     { action: "ping", data: { ts: 1645108204665 } }
        //     { op: "ping", ts: "1645202800015" }
        //
        try {
            const ping = this.safeInteger(message, 'ping');
            if (ping !== undefined) {
                await client.send({ 'pong': ping });
                return;
            }
            const action = this.safeString(message, 'action');
            if (action === 'ping') {
                const data = this.safeValue(message, 'data');
                const pingTs = this.safeInteger(data, 'ts');
                await client.send({ 'action': 'pong', 'data': { 'ts': pingTs } });
                return;
            }
            const op = this.safeString(message, 'op');
            if (op === 'ping') {
                const pingTs = this.safeInteger(message, 'ts');
                await client.send({ 'op': 'pong', 'ts': pingTs });
            }
        }
        catch (e) {
            const error = new errors.NetworkError(this.id + ' pong failed ' + this.exceptionMessage(e));
            client.reset(error);
        }
    }
    handlePing(client, message) {
        this.spawn(this.pong, client, message);
    }
    handleAuthenticate(client, message) {
        //
        // spot
        //
        //     {
        //         "action": "req",
        //         "code": 200,
        //         "ch": "auth",
        //         "data": {}
        //     }
        //
        // non spot
        //
        //    {
        //        "op": "auth",
        //        "type": "api",
        //        "err-code": 0,
        //        "ts": 1645200307319,
        //        "data": { "user-id": "35930539" }
        //    }
        //
        const promise = client.futures['auth'];
        promise.resolve(message);
    }
    handleErrorMessage(client, message) {
        //
        //     {
        //         "action": "sub",
        //         "code": 2002,
        //         "ch": "accounts.update#2",
        //         "message": "invalid.auth.state"
        //      }
        //
        //     {
        //         "ts": 1586323747018,
        //         "status": "error",
        //         'err-code': "bad-request",
        //         'err-msg': "invalid mbp.150.symbol linkusdt",
        //         "id": "2"
        //     }
        //
        //     {
        //         "op": "sub",
        //         "cid": "1",
        //         "topic": "accounts_unify.USDT",
        //         "err-code": 4007,
        //         'err-msg': "Non - single account user is not available, please check through the cross and isolated account asset interface",
        //         "ts": 1698419490189
        //     }
        //     {
        //         "action":"req",
        //         "code":2002,
        //         "ch":"auth",
        //         "message":"auth.fail"
        //     }
        //
        const status = this.safeString(message, 'status');
        if (status === 'error') {
            const id = this.safeString(message, 'id');
            const subscriptionsById = this.indexBy(client.subscriptions, 'id');
            const subscription = this.safeValue(subscriptionsById, id);
            if (subscription !== undefined) {
                const errorCode = this.safeString(message, 'err-code');
                try {
                    this.throwExactlyMatchedException(this.exceptions['ws']['exact'], errorCode, this.json(message));
                    throw new errors.ExchangeError(this.json(message));
                }
                catch (e) {
                    const messageHash = this.safeString(subscription, 'messageHash');
                    client.reject(e, messageHash);
                    client.reject(e, id);
                    if (id in client.subscriptions) {
                        delete client.subscriptions[id];
                    }
                }
            }
            return false;
        }
        const code = this.safeString2(message, 'code', 'err-code');
        if (code !== undefined && ((code !== '200') && (code !== '0'))) {
            const feedback = this.id + ' ' + this.json(message);
            try {
                this.throwExactlyMatchedException(this.exceptions['ws']['exact'], code, feedback);
                throw new errors.ExchangeError(feedback);
            }
            catch (e) {
                if (e instanceof errors.AuthenticationError) {
                    client.reject(e, 'auth');
                    const method = 'auth';
                    if (method in client.subscriptions) {
                        delete client.subscriptions[method];
                    }
                    return false;
                }
                else {
                    client.reject(e);
                }
            }
        }
        return true;
    }
    handleMessage(client, message) {
        if (this.handleErrorMessage(client, message)) {
            //
            //     {"id":1583414227,"status":"ok","subbed":"market.btcusdt.mbp.150","ts":1583414229143}
            //
            // first ping format
            //
            //    {"ping": 1645106821667 }
            //
            // second ping format
            //
            //    {"action":"ping","data":{"ts":1645106821667}}
            //
            // third pong format
            //
            //
            // auth spot
            //
            //     {
            //         "action": "req",
            //         "code": 200,
            //         "ch": "auth",
            //         "data": {}
            //     }
            //
            // auth non spot
            //
            //    {
            //        "op": "auth",
            //        "type": "api",
            //        "err-code": 0,
            //        "ts": 1645200307319,
            //        "data": { "user-id": "35930539" }
            //    }
            //
            // trade
            //
            //     {
            //         "action":"push",
            //         "ch":"trade.clearing#ltcusdt#1",
            //         "data":{
            //             "eventType":"trade",
            //             // ?
            //         }
            //     }
            //
            if ('id' in message) {
                this.handleSubscriptionStatus(client, message);
                return;
            }
            if ('action' in message) {
                const action = this.safeString(message, 'action');
                if (action === 'ping') {
                    this.handlePing(client, message);
                    return;
                }
                if (action === 'sub') {
                    this.handleSubscriptionStatus(client, message);
                    return;
                }
            }
            if ('ch' in message) {
                if (message['ch'] === 'auth') {
                    this.handleAuthenticate(client, message);
                    return;
                }
                else {
                    // route by channel aka topic aka subject
                    this.handleSubject(client, message);
                    return;
                }
            }
            if ('op' in message) {
                const op = this.safeString(message, 'op');
                if (op === 'ping') {
                    this.handlePing(client, message);
                    return;
                }
                if (op === 'auth') {
                    this.handleAuthenticate(client, message);
                    return;
                }
                if (op === 'sub') {
                    this.handleSubscriptionStatus(client, message);
                    return;
                }
                if (op === 'notify') {
                    this.handleSubject(client, message);
                    return;
                }
            }
            if ('ping' in message) {
                this.handlePing(client, message);
            }
        }
    }
    handleMyTrade(client, message, extendParams = {}) {
        //
        // spot
        //
        //     {
        //         "action":"push",
        //         "ch":"trade.clearing#ltcusdt#1",
        //         "data":{
        //             "eventType":"trade",
        //             "symbol":"ltcusdt",
        //             "orderId":"478862728954426",
        //             "orderSide":"buy",
        //             "orderType":"buy-market",
        //             "accountId":44234548,
        //             "source":"spot-web",
        //             "orderValue":"5.01724137",
        //             "orderCreateTime":1645124660365,
        //             "orderStatus":"filled",
        //             "feeCurrency":"ltc",
        //             "tradePrice":"118.89",
        //             "tradeVolume":"0.042200701236437042",
        //             "aggressor":true,
        //             "tradeId":101539740584,
        //             "tradeTime":1645124660368,
        //             "transactFee":"0.000041778694224073",
        //             "feeDeduct":"0",
        //             "feeDeductType":""
        //         }
        //     }
        //
        // contract
        //
        //     {
        //         "symbol": "ADA/USDT:USDT"
        //         "ch": "orders_cross.ada-usdt"
        //         "trades": [
        //             {
        //                 "trade_fee":-0.022099447513812154,
        //                 "fee_asset":"ADA",
        //                 "trade_id":113913755890,
        //                 "id":"113913755890-773207641127878656-1",
        //                 "trade_volume":1,
        //                 "trade_price":0.0905,
        //                 "trade_turnover":10,
        //                 "created_at":1604388667194,
        //                 "profit":0,
        //                 "real_profit": 0,
        //                 "role":"maker"
        //             }
        //         ],
        //     }
        //
        if (this.myTrades === undefined) {
            const limit = this.safeInteger(this.options, 'tradesLimit', 1000);
            this.myTrades = new Cache.ArrayCacheBySymbolById(limit);
        }
        const cachedTrades = this.myTrades;
        const messageHash = this.safeString(message, 'ch');
        if (messageHash !== undefined) {
            const data = this.safeValue(message, 'data');
            if (data !== undefined) {
                const parsed = this.parseWsTrade(data);
                const symbol = this.safeString(parsed, 'symbol');
                if (symbol !== undefined) {
                    cachedTrades.append(parsed);
                    client.resolve(this.myTrades, messageHash);
                }
            }
            else {
                // this trades object is artificially created
                // in handleOrder
                const rawTrades = this.safeValue(message, 'trades', []);
                const marketId = this.safeValue(message, 'symbol');
                const market = this.market(marketId);
                for (let i = 0; i < rawTrades.length; i++) {
                    const trade = rawTrades[i];
                    let parsedTrade = this.parseTrade(trade, market);
                    // add extra params (side, type, ...) coming from the order
                    parsedTrade = this.extend(parsedTrade, extendParams);
                    cachedTrades.append(parsedTrade);
                }
                // messageHash here is the orders one, so
                // we have to recreate the trades messageHash = orderMessageHash + ':' + 'trade'
                const tradesHash = messageHash + ':' + 'trade';
                client.resolve(this.myTrades, tradesHash);
                // when we make an global order sub we have to send the channel like this
                // ch = orders_cross.* and we store messageHash = 'orders_cross'
                // however it is returned with the specific order update symbol: ch = orders_cross.btc-usd
                // since this is a global sub, our messageHash does not specify any symbol (ex: orders_cross:trade)
                // so we must remove it
                let genericOrderHash = messageHash.replace('.' + market['lowercaseId'], '');
                const lowerCaseBaseId = this.safeStringLower(market, 'baseId');
                genericOrderHash = genericOrderHash.replace('.' + lowerCaseBaseId, '');
                const genericTradesHash = genericOrderHash + ':' + 'trade';
                client.resolve(this.myTrades, genericTradesHash);
            }
        }
    }
    parseWsTrade(trade, market = undefined) {
        // spot private
        //
        //     {
        //         "eventType":"trade",
        //         "symbol":"ltcusdt",
        //         "orderId":"478862728954426",
        //         "orderSide":"buy",
        //         "orderType":"buy-market",
        //         "accountId":44234548,
        //         "source":"spot-web",
        //         "orderValue":"5.01724137",
        //         "orderCreateTime":1645124660365,
        //         "orderStatus":"filled",
        //         "feeCurrency":"ltc",
        //         "tradePrice":"118.89",
        //         "tradeVolume":"0.042200701236437042",
        //         "aggressor":true,
        //         "tradeId":101539740584,
        //         "tradeTime":1645124660368,
        //         "transactFee":"0.000041778694224073",
        //         "feeDeduct":"0",
        //         "feeDeductType":""
        //     }
        //
        const symbol = this.safeSymbol(this.safeString(trade, 'symbol'));
        const side = this.safeString2(trade, 'side', 'orderSide');
        const tradeId = this.safeString(trade, 'tradeId');
        const price = this.safeString(trade, 'tradePrice');
        const amount = this.safeString(trade, 'tradeVolume');
        const order = this.safeString(trade, 'orderId');
        const timestamp = this.safeInteger(trade, 'tradeTime');
        market = this.market(symbol);
        const orderType = this.safeString(trade, 'orderType');
        const aggressor = this.safeValue(trade, 'aggressor');
        let takerOrMaker = undefined;
        if (aggressor !== undefined) {
            takerOrMaker = aggressor ? 'taker' : 'maker';
        }
        let type = undefined;
        let orderTypeParts = [];
        if (orderType !== undefined) {
            orderTypeParts = orderType.split('-');
            type = this.safeString(orderTypeParts, 1);
        }
        let fee = undefined;
        const feeCurrency = this.safeCurrencyCode(this.safeString(trade, 'feeCurrency'));
        if (feeCurrency !== undefined) {
            fee = {
                'cost': this.safeString(trade, 'transactFee'),
                'currency': feeCurrency,
            };
        }
        return this.safeTrade({
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'symbol': symbol,
            'id': tradeId,
            'order': order,
            'type': type,
            'takerOrMaker': takerOrMaker,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'fee': fee,
        }, market);
    }
    getUrlByMarketType(type, isLinear = true, isPrivate = false, isFeed = false) {
        const api = this.safeString(this.options, 'api', 'api');
        const hostname = { 'hostname': this.hostname };
        let hostnameURL = undefined;
        let url = undefined;
        if (type === 'spot') {
            if (isPrivate) {
                hostnameURL = this.urls['api']['ws'][api]['spot']['private'];
            }
            else {
                if (isFeed) {
                    hostnameURL = this.urls['api']['ws'][api]['spot']['feed'];
                }
                else {
                    hostnameURL = this.urls['api']['ws'][api]['spot']['public'];
                }
            }
            url = this.implodeParams(hostnameURL, hostname);
        }
        else {
            const baseUrl = this.urls['api']['ws'][api][type];
            const subTypeUrl = isLinear ? baseUrl['linear'] : baseUrl['inverse'];
            url = isPrivate ? subTypeUrl['private'] : subTypeUrl['public'];
        }
        return url;
    }
    async subscribePublic(url, symbol, messageHash, method = undefined, params = {}) {
        const requestId = this.requestId();
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
        if (method !== undefined) {
            subscription['method'] = method;
        }
        return await this.watch(url, messageHash, this.extend(request, params), messageHash, subscription);
    }
    async unsubscribePublic(market, subMessageHash, topic, params = {}) {
        const requestId = this.requestId();
        const request = {
            'unsub': subMessageHash,
            'id': requestId,
        };
        const messageHash = 'unsubscribe::' + subMessageHash;
        const isFeed = (topic === 'orderbook');
        const url = this.getUrlByMarketType(market['type'], market['linear'], false, isFeed);
        const subscription = {
            'unsubscribe': true,
            'id': requestId,
            'subMessageHashes': [subMessageHash],
            'messageHashes': [messageHash],
            'symbols': [market['symbol']],
            'topic': topic,
        };
        const symbolsAndTimeframes = this.safeList(params, 'symbolsAndTimeframes');
        if (symbolsAndTimeframes !== undefined) {
            subscription['symbolsAndTimeframes'] = symbolsAndTimeframes;
            params = this.omit(params, 'symbolsAndTimeframes');
        }
        return await this.watch(url, messageHash, this.extend(request, params), messageHash, subscription);
    }
    async subscribePrivate(channel, messageHash, type, subtype, params = {}, subscriptionParams = {}) {
        const requestId = this.requestId();
        const subscription = {
            'id': requestId,
            'messageHash': messageHash,
            'params': params,
        };
        const extendedSubsription = this.extend(subscription, subscriptionParams);
        let request = undefined;
        if (type === 'spot') {
            request = {
                'action': 'sub',
                'ch': channel,
            };
        }
        else {
            request = {
                'op': 'sub',
                'topic': channel,
                'cid': requestId,
            };
        }
        const isLinear = subtype === 'linear';
        const url = this.getUrlByMarketType(type, isLinear, true);
        const hostname = (type === 'spot') ? this.urls['hostnames']['spot'] : this.urls['hostnames']['contract'];
        const authParams = {
            'type': type,
            'url': url,
            'hostname': hostname,
        };
        await this.authenticate(authParams);
        return await this.watch(url, messageHash, this.extend(request, params), channel, extendedSubsription);
    }
    async authenticate(params = {}) {
        const url = this.safeString(params, 'url');
        const hostname = this.safeString(params, 'hostname');
        const type = this.safeString(params, 'type');
        if (url === undefined || hostname === undefined || type === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' authenticate requires a url, hostname and type argument');
        }
        this.checkRequiredCredentials();
        const messageHash = 'auth';
        const relativePath = url.replace('wss://' + hostname, '');
        const client = this.client(url);
        const future = client.reusableFuture(messageHash);
        const authenticated = this.safeValue(client.subscriptions, messageHash);
        if (authenticated === undefined) {
            const timestamp = this.ymdhms(this.milliseconds(), 'T');
            let signatureParams = undefined;
            if (type === 'spot') {
                signatureParams = {
                    'accessKey': this.apiKey,
                    'signatureMethod': 'HmacSHA256',
                    'signatureVersion': '2.1',
                    'timestamp': timestamp,
                };
            }
            else {
                signatureParams = {
                    'AccessKeyId': this.apiKey,
                    'SignatureMethod': 'HmacSHA256',
                    'SignatureVersion': '2',
                    'Timestamp': timestamp,
                };
            }
            signatureParams = this.keysort(signatureParams);
            const auth = this.urlencode(signatureParams, true); // true required in go
            const payload = ['GET', hostname, relativePath, auth].join("\n"); // eslint-disable-line quotes
            const signature = this.hmac(this.encode(payload), this.encode(this.secret), sha256.sha256, 'base64');
            let request = undefined;
            if (type === 'spot') {
                const newParams = {
                    'authType': 'api',
                    'accessKey': this.apiKey,
                    'signatureMethod': 'HmacSHA256',
                    'signatureVersion': '2.1',
                    'timestamp': timestamp,
                    'signature': signature,
                };
                request = {
                    'params': newParams,
                    'action': 'req',
                    'ch': 'auth',
                };
            }
            else {
                request = {
                    'op': 'auth',
                    'type': 'api',
                    'AccessKeyId': this.apiKey,
                    'SignatureMethod': 'HmacSHA256',
                    'SignatureVersion': '2',
                    'Timestamp': timestamp,
                    'Signature': signature,
                };
            }
            const requestId = this.requestId();
            const subscription = {
                'id': requestId,
                'messageHash': messageHash,
                'params': params,
            };
            this.watch(url, messageHash, request, messageHash, subscription);
        }
        return await future;
    }
}

exports["default"] = htx;
