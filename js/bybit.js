'use strict';

//  ---------------------------------------------------------------------------

const ccxt = require ('ccxt');
// BadSymbol, BadRequest
const { AuthenticationError } = require ('ccxt/js/base/errors');
const { ArrayCache, ArrayCacheBySymbolById, ArrayCacheByTimestamp } = require ('./base/Cache');

//  ---------------------------------------------------------------------------

module.exports = class bybit extends ccxt.bybit {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchBalance': true,
                'watchMyTrades': false,
                'watchOHLCV': true,
                'watchOrderBook': true,
                'watchOrders': true,
                'watchTicker': true,
                'watchTickers': false, // for now
                'watchTrades': true,
            },
            'urls': {
                'api': {
                    'ws': {
                        'inverse': {
                            'public': 'wss://stream.{hostname}/realtime',
                            'private': 'wss://stream.{hostname}/realtime',
                        },
                        'linear': {
                            'public': 'wss://stream.{hostname}/realtime_public',
                            'private': 'wss://stream.{hostname}/realtime_private',
                        },
                        'spot': {
                            'public': 'wss://stream.{hostname}/spot/quote/ws/v2',
                            'private': 'wss://stream.{hostname}/spot/ws',
                        },
                        'usdc': {
                            'option': {
                                'public': 'wss://stream.{hostname}/trade/option/usdc/public/v1',
                                'private': 'wss://stream.{hostname}/trade/option/usdc/private/v1',
                            },
                            'swap': {
                                'public': 'wss://stream.{hostname}/perpetual/ws/v1/realtime_public',
                                'private': 'wss://stream.{hostname}/trade/option/usdc/private/v1', // check this
                            },
                        },
                    },
                },
                'test': {
                    'ws': {
                        'inverse': {
                            'public': 'wss://stream-testnet.{hostname}/realtime',
                            'private': 'wss://stream-testnet.{hostname}/realtime',
                        },
                        'linear': {
                            'public': 'wss://stream-testnet.{hostname}/realtime_public',
                            'private': 'wss://stream-testnet.{hostname}/realtime_private',
                        },
                        'spot': {
                            'public': 'wss://stream-testnet.{hostname}/spot/quote/ws/v2',
                            'private': 'wss://stream-testnet.{hostname}/spot/ws',
                        },
                        'usdc': {
                            'option': {
                                'public': 'wss://stream-testnet.{hostname}/trade/option/usdc/public/v1',
                                'private': 'wss://stream-testnet.{hostname}/trade/option/usdc/private/v1',
                            },
                            'swap': {
                                'public': 'wss://stream-testnet.{hostname}/perpetual/ws/v1/realtime_public',
                                'private': 'wss://stream-testnet.{hostname}/trade/option/usdc/private/v1', // check this
                            },
                        },
                    },
                },
            },
            'options': {
            },
            'streaming': {
                'ping': this.ping,
            },
            'exceptions': {
                'ws': {
                    'exact': {
                    },
                },
            },
        });
    }

    getUrlByMarketType (symbol = undefined, isPrivate = false, params = {}) {
        const accessibility = isPrivate ? 'private' : 'public';
        let url = this.urls['api']['ws'];
        const market = this.market (symbol);
        const isUsdcSettled = market['settle'] === 'USDC';
        const isSpot = market['spot'];
        const type = market['type'];
        const isLinear = market['linear'];
        if (isSpot) {
            url = url['spot'][accessibility];
        } else if (isUsdcSettled) {
            url = url['usdc'][type][accessibility];
        } else if (isLinear) {
            url = url['linear'][accessibility];
        } else {
            // inverse
            url = url['inverse'][accessibility];
        }
        url = this.implodeHostname (url);
        return [url, params];
    }

    async watchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const messageHash = 'ticker:' + market['symbol'];
        let url = undefined;
        [ url, params ] = this.getUrlByMarketType (symbol, false, params);
        if (market['spot']) {
            const channel = 'realtimes';
            const reqParams = {
                'symbol': market['id'],
            };
            return await this.watchSpotPublic (url, channel, messageHash, reqParams, params);
        } else {
            const channel = 'instrument_info.100ms.' + market['id'];
            const reqParams = [ channel ];
            return await this.watchSwapPublic (url, messageHash, reqParams, params);
        }
    }

    handleTicker (client, message) {
        //
        //  spot
        //    {
        //        topic: 'realtimes',
        //        params: { symbol: 'BTCUSDT', binary: 'false', symbolName: 'BTCUSDT' },
        //        data: {
        //          t: 1652883737410,
        //          s: 'BTCUSDT',
        //          o: '30422.68',
        //          h: '30715',
        //          l: '29288.44',
        //          c: '29462.94',
        //          v: '4350.340495',
        //          qv: '130497543.0334267',
        //          m: '-0.0315'
        //        }
        //    }
        //
        const topic = this.safeString (message, 'topic');
        const data = this.safeValue (message, 'data');
        const ticker = this.parseTicker (data);
        const symbol = ticker['symbol'];
        const market = this.market (symbol);
        this.tickers[symbol] = ticker;
        const messageHash = topic + ':' + market['id'];
        client.resolve (ticker, messageHash);
    }

    async watchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const interval = this.timeframes[timeframe];
        let url = undefined;
        [ url, params ] = this.getUrlByMarketType (symbol, false, params);
        const messageHash = 'kline' + ':' + interval + ':' + market['id'];
        let ohlcv = undefined;
        if (market['spot']) {
            const channel = 'kline';
            const reqParams = {
                'symbol': market['id'],
                'klineType': timeframe, // spot uses the same timeframe as ours
            };
            ohlcv = await this.watchSpotPublic (url, channel, messageHash, reqParams, params);
        } else {
            const channel = 'klineV2.' + interval + '.' + market['id'];
            const reqParams = [ channel ];
            ohlcv = await this.watchSwapPublic (url, messageHash, reqParams, params);
        }
        if (this.newUpdates) {
            limit = ohlcv.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (ohlcv, since, limit, 0, true);
    }

    handleOHLCV (client, message) {
        //
        // swap
        //    {
        //        topic: 'klineV2.1.LTCUSD',
        //        data: [
        //          {
        //            start: 1652893140,
        //            end: 1652893200,
        //            open: 67.9,
        //            close: 67.84,
        //            high: 67.91,
        //            low: 67.84,
        //            volume: 56,
        //            turnover: 0.82528936,
        //            timestamp: '1652893152874413',
        //            confirm: false,
        //            cross_seq: 63544166
        //          }
        //        ],
        //        timestamp_e6: 1652893152874413
        //    }
        //
        // spot
        //    {
        //        topic: 'kline',
        //        params: {
        //          symbol: 'LTCUSDT',
        //          binary: 'false',
        //          klineType: '1m',
        //          symbolName: 'LTCUSDT'
        //        },
        //        data: {
        //          t: 1652893440000,
        //          s: 'LTCUSDT',
        //          sn: 'LTCUSDT',
        //          c: '67.92',
        //          h: '68.05',
        //          l: '67.92',
        //          o: '68.05',
        //          v: '9.71302'
        //        }
        //    }
        //
        const data = this.safeValue (message, 'data', {});
        if (Array.isArray (data)) {
            // swap messages
            const topic = this.safeString (message, 'topic');
            const topicParts = topic.split ('.');
            const topicLength = topicParts.length;
            const marketId = this.safeString (topicParts, topicLength - 1);
            const timeframe = this.safeString (topicParts, topicLength - 2);
            const marketIds = {};
            for (let i = 0; i < data.length; i++) {
                const ohlcv = data[i];
                const market = this.market (marketId);
                const symbol = market['symbol'];
                const parsed = this.parseOHLCV (ohlcv, market);
                let stored = this.safeValue (this.ohlcvs, symbol);
                if (stored === undefined) {
                    const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
                    stored = new ArrayCacheByTimestamp (limit);
                    this.ohlcvs[symbol] = stored;
                }
                stored.append (parsed);
                marketIds[symbol] = timeframe;
            }
            const keys = Object.keys (marketIds);
            for (let i = 0; i < keys.length; i++) {
                const symbol = keys[i];
                const timeframe = marketIds[symbol];
                const interval = this.timeframes[timeframe];
                const hash = 'kline' + ':' + interval + ':' + symbol;
                const stored = this.safeValue (this.ohlcvs, symbol);
                client.resolve (stored, hash);
            }
        }
        // const marketId = this.safeString (message, 's');
        // const symbol = this.safeSymbol (marketId);
        // const channel = this.safeString (message, 'm');
        // const data = this.safeValue (message, 'data', {});
        // const interval = this.safeString (data, 'i');
        // const messageHash = channel + ':' + interval + ':' + marketId;
        // const timeframe = this.findTimeframe (interval);
        // const market = this.market (symbol);
        // const parsed = this.parseOHLCV (message, market);
        // this.ohlcvs[symbol] = this.safeValue (this.ohlcvs, symbol, {});
        // let stored = this.safeValue (this.ohlcvs[symbol], timeframe);
        // if (stored === undefined) {
        //     const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
        //     stored = new ArrayCacheByTimestamp (limit);
        //     this.ohlcvs[symbol][timeframe] = stored;
        // }
        // stored.append (parsed);
        // client.resolve (stored, messageHash);
        // return message;
    }

    async watchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const messageHash = 'orderbook' + ':' + market['id'];
        const orderbook = await this.watchPublic (messageHash, params);
        return orderbook.limit (limit);
    }

    handleOrderBook (client, message) {
        //
        //     {
        //         "topic":"orderbook",
        //         "action":"partial",
        //         "symbol":"ltc-usdt",
        //         "data":{
        //             "bids":[
        //                 [104.29, 5.2264],
        //                 [103.86,1.3629],
        //                 [101.82,0.5942]
        //             ],
        //             "asks":[
        //                 [104.81,9.5531],
        //                 [105.54,0.6416],
        //                 [106.18,1.4141],
        //             ],
        //             "timestamp":"2022-04-12T08:17:05.932Z"
        //         },
        //         "time":1649751425
        //     }
        //
        const marketId = this.safeString (message, 'symbol');
        const channel = this.safeString (message, 'topic');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const data = this.safeValue (message, 'data');
        let timestamp = this.safeString (data, 'timestamp');
        timestamp = this.parse8601 (timestamp);
        const snapshot = this.parseOrderBook (data, symbol, timestamp);
        let orderbook = undefined;
        if (!(symbol in this.orderbooks)) {
            orderbook = this.orderBook (snapshot);
            this.orderbooks[symbol] = orderbook;
        } else {
            orderbook = this.orderbooks[symbol];
            orderbook.reset (snapshot);
        }
        const messageHash = channel + ':' + marketId;
        client.resolve (orderbook, messageHash);
    }

    async watchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const messageHash = 'trade' + ':' + market['id'];
        const trades = await this.watchPublic (messageHash, params);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    handleTrades (client, message) {
        //
        //     {
        //         topic: 'trade',
        //         action: 'partial',
        //         symbol: 'btc-usdt',
        //         data: [
        //             {
        //                 size: 0.05145,
        //                 price: 41977.9,
        //                 side: 'buy',
        //                 timestamp: '2022-04-11T09:40:10.881Z'
        //             },
        //         ]
        //     }
        //
        const channel = this.safeString (message, 'topic');
        const marketId = this.safeString (message, 'symbol');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        let stored = this.safeValue (this.trades, symbol);
        if (stored === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            stored = new ArrayCache (limit);
            this.trades[symbol] = stored;
        }
        const data = this.safeValue (message, 'data', []);
        const parsedTrades = this.parseTrades (data, market);
        for (let j = 0; j < parsedTrades.length; j++) {
            stored.append (parsedTrades[j]);
        }
        const messageHash = channel + ':' + marketId;
        client.resolve (stored, messageHash);
        client.resolve (stored, channel);
    }

    async watchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let messageHash = 'order';
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            symbol = market['symbol'];
            messageHash += ':' + market['id'];
        }
        const orders = await this.watchPrivate (messageHash, 'watchOrders', params);
        if (this.newUpdates) {
            limit = orders.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (orders, symbol, since, limit, true);
    }

    handleOrder (client, message, subscription = undefined) {
        //
        //     {
        //         topic: 'order',
        //         action: 'insert',
        //         user_id: 155328,
        //         symbol: 'ltc-usdt',
        //         data: {
        //             symbol: 'ltc-usdt',
        //             side: 'buy',
        //             size: 0.05,
        //             type: 'market',
        //             price: 0,
        //             fee_structure: { maker: 0.1, taker: 0.1 },
        //             fee_coin: 'ltc',
        //             id: 'ce38fd48-b336-400b-812b-60c636454231',
        //             created_by: 155328,
        //             filled: 0.05,
        //             method: 'market',
        //             created_at: '2022-04-11T14:09:00.760Z',
        //             updated_at: '2022-04-11T14:09:00.760Z',
        //             status: 'filled'
        //         },
        //         time: 1649686140
        //     }
        //
        const channel = this.safeString (message, 'topic');
        const marketId = this.safeString (message, 'symbol');
        const data = this.safeValue (message, 'data', {});
        // usually the first message is an empty array
        const dataLength = data.length;
        if (dataLength === 0) {
            return 0;
        }
        const parsed = this.parseOrder (data);
        if (this.orders === undefined) {
            const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
            this.orders = new ArrayCacheBySymbolById (limit);
        }
        const orders = this.orders;
        orders.append (parsed);
        client.resolve (orders);
        // non-symbol specific
        client.resolve (orders, channel);
        const messageHash = channel + ':' + marketId;
        client.resolve (orders, messageHash);
    }

    async watchBalance (params = {}) {
        const messageHash = 'wallet';
        return await this.watchPrivate (messageHash, 'watchBalance', params);
    }

    handleBalance (client, message) {
        //
        //     {
        //         topic: 'wallet',
        //         action: 'partial',
        //         user_id: 155328,
        //         data: {
        //             eth_balance: 0,
        //             eth_available: 0,
        //             usdt_balance: 18.94344188,
        //             usdt_available: 18.94344188,
        //             ltc_balance: 0.00005,
        //             ltc_available: 0.00005,
        //         },
        //         time: 1649687396
        //     }
        //
        const messageHash = this.safeString (message, 'topic');
        const data = this.safeValue (message, 'data');
        const keys = Object.keys (data);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const parts = key.split ('_');
            const currencyId = this.safeString (parts, 0);
            const code = this.safeCurrencyCode (currencyId);
            const account = (code in this.balance) ? this.balance[code] : this.account ();
            const second = this.safeString (parts, 1);
            const freeOrTotal = (second === 'available') ? 'free' : 'total';
            account[freeOrTotal] = this.safeString (data, key);
            this.balance[code] = account;
        }
        this.balance = this.safeBalance (this.balance);
        client.resolve (this.balance, messageHash);
    }

    async watchSwapPublic (url, messageHash, reqParams = {}, params = {}) {
        const request = {
            'op': 'subscribe',
            'args': reqParams,
        };
        const message = this.extend (request, params);
        return await this.watch (url, messageHash, message, messageHash);
    }

    async watchSpotPublic (url, channel, messageHash, reqParams = {}, params = {}) {
        reqParams = this.extend (reqParams, {
            'binary': false,
        });
        const request = {
            'topic': channel,
            'event': 'sub',
            'params': reqParams,
        };
        const message = this.extend (request, params);
        return await this.watch (url, messageHash, message, messageHash);
    }

    async watchPrivate (messageHash, method, params = {}) {
        const options = this.safeValue (this.options, method, {});
        let expires = this.safeString (options, 'api-expires');
        if (expires === undefined) {
            const timeout = parseInt (this.timeout / 1000);
            expires = this.sum (this.seconds (), timeout);
            expires = expires.toString ();
            // we need to memoize these values to avoid generating a new url on each method execution
            // that would trigger a new connection on each received message
            this.options[method]['api-expires'] = expires;
        }
        this.checkRequiredCredentials ();
        const url = this.urls['api']['ws'];
        const auth = 'CONNECT' + '/stream' + expires;
        const signature = this.hmac (this.encode (auth), this.encode (this.secret));
        const authParams = {
            'api-key': this.apiKey,
            'api-signature': signature,
            'api-expires': expires,
        };
        const signedUrl = url + '?' + this.urlencode (authParams);
        const request = {
            'op': 'subscribe',
            'args': [ messageHash ],
        };
        const message = this.extend (request, params);
        return await this.watch (signedUrl, messageHash, message, messageHash);
    }

    handleErrorMessage (client, message) {
        //
        //   {
        //       success: false,
        //       ret_msg: 'error:invalid op',
        //       conn_id: '5e079fdd-9c7f-404d-9dbf-969d650838b5',
        //       request: { op: '', args: null }
        //   }
        //
        //   { code: '-10009', desc: 'Invalid period!' }
        //
        const error = this.safeInteger (message, 'error');
        try {
            if (error !== undefined) {
                const feedback = this.id + ' ' + this.json (message);
                this.throwExactlyMatchedException (this.exceptions['ws']['exact'], error, feedback);
            }
        } catch (e) {
            if (e instanceof AuthenticationError) {
                return false;
            }
        }
        return message;
    }

    handleMessage (client, message) {
        //
        //    {
        //        topic: 'realtimes',
        //        params: { symbol: 'BTCUSDT', binary: 'false', symbolName: 'BTCUSDT' },
        //        data: {
        //          t: 1652883737410,
        //          s: 'BTCUSDT',
        //          o: '30422.68',
        //          h: '30715',
        //          l: '29288.44',
        //          c: '29462.94',
        //          v: '4350.340495',
        //          qv: '130497543.0334267',
        //          m: '-0.0315'
        //        }
        //    }
        //    {
        //        topic: 'klineV2.1.LTCUSD',
        //        data: [
        //          {
        //            start: 1652893140,
        //            end: 1652893200,
        //            open: 67.9,
        //            close: 67.84,
        //            high: 67.91,
        //            low: 67.84,
        //            volume: 56,
        //            turnover: 0.82528936,
        //            timestamp: '1652893152874413',
        //            confirm: false,
        //            cross_seq: 63544166
        //          }
        //        ],
        //        timestamp_e6: 1652893152874413
        //    }
        //
        //    {
        //        topic: 'kline',
        //        event: 'sub',
        //        params: {
        //          symbol: 'LTCUSDT',
        //          binary: 'false',
        //          klineType: '1m',
        //          symbolName: 'LTCUSDT'
        //        },
        //        code: '0',
        //        msg: 'Success'
        //    }
        //
        //
        if (!this.handleErrorMessage (client, message)) {
            return;
        }
        const event = this.safeString (message, 'event');
        if (event === 'sub') {
            this.handleSubscriptionStatus (client, message);
            return;
        }
        const topic = this.safeString (message, 'topic');
        if (topic === 'pong') {
            this.handlePong (client, message);
            return;
        }
        if (topic !== undefined && topic.indexOf ('kline') >= 0) {
            // this.handleOHLCV (client, message);
            return;
        }
        const methods = {
            'realtimes': this.handleTicker,
            'trade': this.handleTrades,
            'orderbook': this.handleOrderBook,
            'order': this.handleOrder,
            'wallet': this.handleBalance,
        };
        const method = this.safeValue (methods, topic);
        if (method !== undefined) {
            method.call (this, client, message);
        }
    }

    ping (client) {
        const timestamp = this.milliseconds ();
        return { 'ping': timestamp.toString () };
    }

    handlePong (client, message) {
        client.lastPong = this.milliseconds ();
        return message;
    }

    handleSubscriptionStatus (client, message) {
        //
        //    {
        //        topic: 'kline',
        //        event: 'sub',
        //        params: {
        //          symbol: 'LTCUSDT',
        //          binary: 'false',
        //          klineType: '1m',
        //          symbolName: 'LTCUSDT'
        //        },
        //        code: '0',
        //        msg: 'Success'
        //    }
        return message;
    }
};
