// ----------------------------------------------------------------------------

import wooRest from '../woo.js';
import { ExchangeError, AuthenticationError } from '../base/errors.js';
import { ArrayCacheByTimestamp, ArrayCacheBySymbolById, ArrayCache } from '../base/ws/Cache.js';
import { Precise } from '../base/Precise.js';
import { sha256 } from '../static_dependencies/noble-hashes/sha256.js';
import { Int } from '../base/types.js';
import Client from '../base/ws/Client.js';

// ----------------------------------------------------------------------------

export default class woo extends wooRest {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchBalance': false,
                'watchMyTrades': false,
                'watchOHLCV': true,
                'watchOrderBook': true,
                'watchOrders': true,
                'watchTicker': true,
                'watchTickers': true,
                'watchTrades': true,
            },
            'urls': {
                'api': {
                    'ws': {
                        'public': 'wss://wss.woo.org/ws/stream',
                        'private': 'wss://wss.woo.network/v2/ws/private/stream',
                    },
                },
                'test': {
                    'ws': {
                        'public': 'wss://wss.staging.woo.org/ws/stream',
                        'private': 'wss://wss.staging.woo.org/v2/ws/private/stream',
                    },
                },
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
                'uid': true,
            },
            'options': {
                'tradesLimit': 1000,
                'ordersLimit': 1000,
                'requestId': {},
            },
            'streaming': {
                'ping': this.ping,
                'keepAlive': 10000,
            },
        });
    }

    requestId (url) {
        const options = this.safeValue (this.options, 'requestId', {});
        const previousValue = this.safeInteger (options, url, 0);
        const newValue = this.sum (previousValue, 1);
        this.options['requestId'][url] = newValue;
        return newValue;
    }

    async watchPublic (messageHash, message) {
        this.checkRequiredUid ();
        const url = this.urls['api']['ws']['public'] + '/' + this.uid;
        const requestId = this.requestId (url);
        const subscribe = {
            'id': requestId,
        };
        const request = this.extend (subscribe, message);
        return await this.watch (url, messageHash, request, messageHash, subscribe);
    }

    async watchOrderBook (symbol: string, limit: Int = undefined, params = {}) {
        await this.loadMarkets ();
        const name = 'orderbook';
        const market = this.market (symbol);
        const topic = market['id'] + '@' + name;
        const request = {
            'event': 'subscribe',
            'topic': topic,
        };
        const message = this.extend (request, params);
        const orderbook = await this.watchPublic (topic, message);
        return orderbook.limit ();
    }

    handleOrderBook (client: Client, message) {
        //
        //     {
        //         topic: 'PERP_BTC_USDT@orderbook',
        //         ts: 1650121915308,
        //         data: {
        //             symbol: 'PERP_BTC_USDT',
        //             bids: [
        //                 [
        //                     0.30891,
        //                     2469.98
        //                 ]
        //             ],
        //             asks: [
        //                 [
        //                     0.31075,
        //                     2379.63
        //                 ]
        //             ]
        //         }
        //     }
        //
        const data = this.safeValue (message, 'data');
        const marketId = this.safeString (data, 'symbol');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const topic = this.safeString (message, 'topic');
        let orderbook = this.safeValue (this.orderbooks, symbol);
        if (orderbook === undefined) {
            orderbook = this.orderBook ({});
        }
        const timestamp = this.safeInteger (message, 'ts');
        const snapshot = this.parseOrderBook (data, symbol, timestamp, 'bids', 'asks');
        orderbook.reset (snapshot);
        client.resolve (orderbook, topic);
    }

    async watchTicker (symbol: string, params = {}) {
        await this.loadMarkets ();
        const name = 'ticker';
        const market = this.market (symbol);
        const topic = market['id'] + '@' + name;
        const request = {
            'event': 'subscribe',
            'topic': topic,
        };
        const message = this.extend (request, params);
        return await this.watchPublic (topic, message);
    }

    parseWsTicker (ticker, market = undefined) {
        //
        //     {
        //         symbol: 'PERP_BTC_USDT',
        //         open: 19441.5,
        //         close: 20147.07,
        //         high: 20761.87,
        //         low: 19320.54,
        //         volume: 2481.103,
        //         amount: 50037935.0286,
        //         count: 3689
        //     }
        //
        const timestamp = this.safeInteger (ticker, 'date', this.milliseconds ());
        return this.safeTicker ({
            'symbol': this.safeSymbol (undefined, market),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'high'),
            'low': this.safeString (ticker, 'low'),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': this.safeString (ticker, 'open'),
            'close': this.safeString (ticker, 'close'),
            'last': undefined,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeString (ticker, 'volume'),
            'quoteVolume': this.safeString (ticker, 'amount'),
            'info': ticker,
        }, market);
    }

    handleTicker (client: Client, message) {
        //
        //     {
        //         topic: 'PERP_BTC_USDT@ticker',
        //         ts: 1657120017000,
        //         data: {
        //             symbol: 'PERP_BTC_USDT',
        //             open: 19441.5,
        //             close: 20147.07,
        //             high: 20761.87,
        //             low: 19320.54,
        //             volume: 2481.103,
        //             amount: 50037935.0286,
        //             count: 3689
        //         }
        //     }
        //
        const data = this.safeValue (message, 'data');
        const topic = this.safeValue (message, 'topic');
        const marketId = this.safeString (data, 'symbol');
        const market = this.safeMarket (marketId);
        const timestamp = this.safeInteger (message, 'ts');
        data['date'] = timestamp;
        const ticker = this.parseWsTicker (data, market);
        ticker['symbol'] = market['symbol'];
        this.tickers[market['symbol']] = ticker;
        client.resolve (ticker, topic);
        return message;
    }

    async watchTickers (symbols: string[] = undefined, params = {}) {
        await this.loadMarkets ();
        const name = 'tickers';
        const topic = name;
        const request = {
            'event': 'subscribe',
            'topic': topic,
        };
        const message = this.extend (request, params);
        const tickers = await this.watchPublic (topic, message);
        return this.filterByArray (tickers, 'symbol', symbols);
    }

    handleTickers (client: Client, message) {
        //
        //     {
        //         "topic":"tickers",
        //         "ts":1618820615000,
        //         "data":[
        //             {
        //                 "symbol":"SPOT_OKB_USDT",
        //                 "open":16.297,
        //                 "close":17.183,
        //                 "high":24.707,
        //                 "low":11.997,
        //                 "volume":0,
        //                 "amount":0,
        //                 "count":0
        //             },
        //             {
        //                 "symbol":"SPOT_XRP_USDT",
        //                 "open":1.3515,
        //                 "close":1.43794,
        //                 "high":1.96674,
        //                 "low":0.39264,
        //                 "volume":750127.1,
        //                 "amount":985440.5122,
        //                 "count":396
        //             },
        //         ...
        //         ]
        //     }
        //
        const topic = this.safeValue (message, 'topic');
        const data = this.safeValue (message, 'data');
        const timestamp = this.safeInteger (message, 'ts');
        const result = [];
        for (let i = 0; i < data.length; i++) {
            const marketId = this.safeString (data[i], 'symbol');
            const market = this.safeMarket (marketId);
            const ticker = this.parseWsTicker (this.extend (data[i], { 'date': timestamp }), market);
            this.tickers[market['symbol']] = ticker;
            result.push (ticker);
        }
        client.resolve (result, topic);
    }

    async watchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}) {
        await this.loadMarkets ();
        if ((timeframe !== '1m') && (timeframe !== '5m') && (timeframe !== '15m') && (timeframe !== '30m') && (timeframe !== '1h') && (timeframe !== '1d') && (timeframe !== '1w') && (timeframe !== '1M')) {
            throw new ExchangeError (this.id + ' watchOHLCV timeframe argument must be 1m, 5m, 15m, 30m, 1h, 1d, 1w, 1M');
        }
        const market = this.market (symbol);
        const interval = this.safeString (this.timeframes, timeframe, timeframe);
        const name = 'kline';
        const topic = market['id'] + '@' + name + '_' + interval;
        const request = {
            'event': 'subscribe',
            'topic': topic,
        };
        const message = this.extend (request, params);
        const ohlcv = await this.watchPublic (topic, message);
        if (this.newUpdates) {
            limit = ohlcv.getLimit (market['symbol'], limit);
        }
        return this.filterBySinceLimit (ohlcv, since, limit, 0);
    }

    handleOHLCV (client: Client, message) {
        //
        //     {
        //         "topic":"SPOT_BTC_USDT@kline_1m",
        //         "ts":1618822432146,
        //         "data":{
        //             "symbol":"SPOT_BTC_USDT",
        //             "type":"1m",
        //             "open":56948.97,
        //             "close":56891.76,
        //             "high":56948.97,
        //             "low":56889.06,
        //             "volume":44.00947568,
        //             "amount":2504584.9,
        //             "startTime":1618822380000,
        //             "endTime":1618822440000
        //         }
        //     }
        //
        const data = this.safeValue (message, 'data');
        const topic = this.safeValue (message, 'topic');
        const marketId = this.safeString (data, 'symbol');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const interval = this.safeString (data, 'type');
        const timeframe = this.findTimeframe (interval);
        const parsed = [
            this.safeInteger (data, 'startTime'),
            this.safeFloat (data, 'open'),
            this.safeFloat (data, 'high'),
            this.safeFloat (data, 'low'),
            this.safeFloat (data, 'close'),
            this.safeFloat (data, 'volume'),
        ];
        this.ohlcvs[symbol] = this.safeValue (this.ohlcvs, symbol, {});
        let stored = this.safeValue (this.ohlcvs[symbol], timeframe);
        if (stored === undefined) {
            const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
            stored = new ArrayCacheByTimestamp (limit);
            this.ohlcvs[symbol][timeframe] = stored;
        }
        stored.append (parsed);
        client.resolve (stored, topic);
    }

    async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const topic = market['id'] + '@trade';
        const request = {
            'event': 'subscribe',
            'topic': topic,
        };
        const message = this.extend (request, params);
        const trades = await this.watchPublic (topic, message);
        if (this.newUpdates) {
            limit = trades.getLimit (market['symbol'], limit);
        }
        return this.filterBySymbolSinceLimit (trades, symbol, since, limit);
    }

    handleTrade (client: Client, message) {
        //
        // {
        //     "topic":"SPOT_ADA_USDT@trade",
        //     "ts":1618820361552,
        //     "data":{
        //         "symbol":"SPOT_ADA_USDT",
        //         "price":1.27988,
        //         "size":300,
        //         "side":"BUY",
        //         "source":0
        //     }
        // }
        //
        const topic = this.safeString (message, 'topic');
        const timestamp = this.safeInteger (message, 'ts');
        const data = this.safeValue (message, 'data');
        const marketId = this.safeString (data, 'symbol');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const trade = this.parseWsTrade (this.extend (data, { 'timestamp': timestamp }), market);
        let tradesArray = this.safeValue (this.trades, symbol);
        if (tradesArray === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            tradesArray = new ArrayCache (limit);
        }
        tradesArray.append (trade);
        this.trades[symbol] = tradesArray;
        client.resolve (tradesArray, topic);
    }

    parseWsTrade (trade, market = undefined) {
        //
        //     {
        //         "symbol":"SPOT_ADA_USDT",
        //         "timestamp":1618820361552,
        //         "price":1.27988,
        //         "size":300,
        //         "side":"BUY",
        //         "source":0
        //     }
        //
        const marketId = this.safeString (trade, 'symbol');
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        const price = this.safeString (trade, 'price');
        const amount = this.safeString (trade, 'size');
        const cost = Precise.stringMul (price, amount);
        const side = this.safeStringLower (trade, 'side');
        const timestamp = this.safeInteger (trade, 'timestamp');
        return this.safeTrade ({
            'id': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'order': undefined,
            'takerOrMaker': undefined,
            'type': undefined,
            'fee': undefined,
            'info': trade,
        }, market);
    }

    checkRequiredUid (error = true) {
        if (!this.uid) {
            if (error) {
                throw new AuthenticationError (this.id + ' requires `uid` credential');
            } else {
                return false;
            }
        }
        return true;
    }

    authenticate (params = {}) {
        this.checkRequiredCredentials ();
        const url = this.urls['api']['ws']['private'] + '/' + this.uid;
        const client = this.client (url);
        const messageHash = 'authenticated';
        const event = 'auth';
        let future = this.safeValue (client.subscriptions, messageHash);
        if (future === undefined) {
            const ts = this.nonce ().toString ();
            const auth = '|' + ts;
            const signature = this.hmac (this.encode (auth), this.encode (this.secret), sha256);
            const request = {
                'event': event,
                'params': {
                    'apikey': this.apiKey,
                    'sign': signature,
                    'timestamp': ts,
                },
            };
            const message = this.extend (request, params);
            future = this.watch (url, messageHash, message);
            client.subscriptions[messageHash] = future;
        }
        return future;
    }

    async watchPrivate (messageHash, message, params = {}) {
        await this.authenticate (params);
        const url = this.urls['api']['ws']['private'] + '/' + this.uid;
        const requestId = this.requestId (url);
        const subscribe = {
            'id': requestId,
        };
        const request = this.extend (subscribe, message);
        return await this.watch (url, messageHash, request, messageHash, subscribe);
    }

    async watchOrders (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        await this.loadMarkets ();
        const topic = 'executionreport';
        let messageHash = topic;
        if (symbol !== undefined) {
            const market = this.market (symbol);
            symbol = market['symbol'];
            messageHash += ':' + symbol;
        }
        const request = {
            'event': 'subscribe',
            'topic': topic,
        };
        const message = this.extend (request, params);
        const orders = await this.watchPrivate (messageHash, message);
        if (this.newUpdates) {
            limit = orders.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (orders, symbol, since, limit);
    }

    parseWsOrder (order, market = undefined) {
        //
        //     {
        //         symbol: 'PERP_BTC_USDT',
        //         clientOrderId: 0,
        //         orderId: 52952826,
        //         type: 'LIMIT',
        //         side: 'SELL',
        //         quantity: 0.01,
        //         price: 22000,
        //         tradeId: 0,
        //         executedPrice: 0,
        //         executedQuantity: 0,
        //         fee: 0,
        //         feeAsset: 'USDT',
        //         totalExecutedQuantity: 0,
        //         status: 'NEW',
        //         reason: '',
        //         orderTag: 'default',
        //         totalFee: 0,
        //         visible: 0.01,
        //         timestamp: 1657515556799,
        //         reduceOnly: false,
        //         maker: false
        //     }
        //
        const orderId = this.safeString (order, 'orderId');
        const marketId = this.safeString (order, 'symbol');
        market = this.market (marketId);
        const symbol = market['symbol'];
        const timestamp = this.safeInteger (order, 'timestamp');
        const fee = {
            'cost': this.safeString (order, 'totalFee'),
            'currency': this.safeString (order, 'feeAsset'),
        };
        let price = this.safeNumber (order, 'price');
        const avgPrice = this.safeNumber (order, 'avgPrice');
        if ((price === 0) && (avgPrice !== undefined)) {
            price = avgPrice;
        }
        const amount = this.safeFloat (order, 'quantity');
        const side = this.safeStringLower (order, 'side');
        const type = this.safeStringLower (order, 'type');
        const filled = this.safeNumber (order, 'totalExecutedQuantity');
        const totalExecQuantity = this.safeFloat (order, 'totalExecutedQuantity');
        let remaining = amount;
        if (amount >= totalExecQuantity) {
            remaining -= totalExecQuantity;
        }
        const rawStatus = this.safeString (order, 'status');
        const status = this.parseOrderStatus (rawStatus);
        const trades = undefined;
        const clientOrderId = this.safeString (order, 'clientOrderId');
        return this.safeOrder ({
            'info': order,
            'symbol': symbol,
            'id': orderId,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': timestamp,
            'type': type,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': undefined,
            'triggerPrice': undefined,
            'amount': amount,
            'cost': undefined,
            'average': undefined,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': fee,
            'trades': trades,
        });
    }

    handleOrderUpdate (client: Client, message) {
        //
        //     {
        //         topic: 'executionreport',
        //         ts: 1657515556799,
        //         data: {
        //             symbol: 'PERP_BTC_USDT',
        //             clientOrderId: 0,
        //             orderId: 52952826,
        //             type: 'LIMIT',
        //             side: 'SELL',
        //             quantity: 0.01,
        //             price: 22000,
        //             tradeId: 0,
        //             executedPrice: 0,
        //             executedQuantity: 0,
        //             fee: 0,
        //             feeAsset: 'USDT',
        //             totalExecutedQuantity: 0,
        //             status: 'NEW',
        //             reason: '',
        //             orderTag: 'default',
        //             totalFee: 0,
        //             visible: 0.01,
        //             timestamp: 1657515556799,
        //             reduceOnly: false,
        //             maker: false
        //         }
        //     }
        //
        const order = this.safeValue (message, 'data');
        this.handleOrder (client, order);
    }

    handleOrder (client: Client, message) {
        const topic = 'executionreport';
        const parsed = this.parseWsOrder (message);
        const symbol = this.safeString (parsed, 'symbol');
        const orderId = this.safeString (parsed, 'id');
        if (symbol !== undefined) {
            if (this.orders === undefined) {
                const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
                this.orders = new ArrayCacheBySymbolById (limit);
            }
            const cachedOrders = this.orders;
            const orders = this.safeValue (cachedOrders.hashmap, symbol, {});
            const order = this.safeValue (orders, orderId);
            if (order !== undefined) {
                const fee = this.safeValue (order, 'fee');
                if (fee !== undefined) {
                    parsed['fee'] = fee;
                }
                const fees = this.safeValue (order, 'fees');
                if (fees !== undefined) {
                    parsed['fees'] = fees;
                }
                parsed['trades'] = this.safeValue (order, 'trades');
                parsed['timestamp'] = this.safeInteger (order, 'timestamp');
                parsed['datetime'] = this.safeString (order, 'datetime');
            }
            cachedOrders.append (parsed);
            client.resolve (this.orders, topic);
            const messageHashSymbol = topic + ':' + symbol;
            client.resolve (this.orders, messageHashSymbol);
        }
    }

    handleMessage (client: Client, message) {
        const methods = {
            'ping': this.handlePing,
            'pong': this.handlePong,
            'subscribe': this.handleSubscribe,
            'orderbook': this.handleOrderBook,
            'ticker': this.handleTicker,
            'tickers': this.handleTickers,
            'kline': this.handleOHLCV,
            'auth': this.handleAuth,
            'executionreport': this.handleOrderUpdate,
            'trade': this.handleTrade,
        };
        const event = this.safeString (message, 'event');
        let method = this.safeValue (methods, event);
        if (method !== undefined) {
            return method.call (this, client, message);
        }
        const topic = this.safeString (message, 'topic');
        if (topic !== undefined) {
            method = this.safeValue (methods, topic);
            if (method !== undefined) {
                return method.call (this, client, message);
            }
            const splitTopic = topic.split ('@');
            const splitLength = splitTopic.length;
            if (splitLength === 2) {
                const name = this.safeString (splitTopic, 1);
                method = this.safeValue (methods, name);
                if (method !== undefined) {
                    return method.call (this, client, message);
                }
                const splitName = name.split ('_');
                const splitNameLength = splitTopic.length;
                if (splitNameLength === 2) {
                    method = this.safeValue (methods, this.safeString (splitName, 0));
                    if (method !== undefined) {
                        return method.call (this, client, message);
                    }
                }
            }
        }
        return message;
    }

    ping (client) {
        return { 'event': 'ping' };
    }

    handlePing (client: Client, message) {
        return { 'event': 'pong' };
    }

    handlePong (client: Client, message) {
        //
        // { event: 'pong', ts: 1657117026090 }
        //
        client.lastPong = this.milliseconds ();
        return message;
    }

    handleSubscribe (client: Client, message) {
        //
        //     {
        //         id: '666888',
        //         event: 'subscribe',
        //         success: true,
        //         ts: 1657117712212
        //     }
        //
        return message;
    }

    handleAuth (client: Client, message) {
        //
        //     {
        //         event: 'auth',
        //         success: true,
        //         ts: 1657463158812
        //     }
        //
        const messageHash = 'authenticated';
        const success = this.safeValue (message, 'success');
        if (success) {
            client.resolve (message, messageHash);
        } else {
            const error = new AuthenticationError (this.json (message));
            client.reject (error, messageHash);
            // allows further authentication attempts
            if (messageHash in client.subscriptions) {
                delete client.subscriptions['authenticated'];
            }
        }
    }
}
