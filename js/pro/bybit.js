'use strict';

//  ---------------------------------------------------------------------------

const Precise = require ('../base/Precise');
const bybitRest = require ('../bybit.js');
const { AuthenticationError, BadRequest, NotSupported } = require ('../base/errors');
const { ArrayCache, ArrayCacheBySymbolById, ArrayCacheByTimestamp } = require ('./base/Cache');

//  ---------------------------------------------------------------------------

module.exports = class bybit extends bybitRest {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchBalance': true,
                'watchMyTrades': true,
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
                                'private': 'wss://stream.{hostname}/trade/option/usdc/private/v1',
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
                                'private': 'wss://stream-testnet.{hostname}/trade/option/usdc/private/v1',
                            },
                        },
                    },
                },
            },
            'options': {
                'watchTicker': {
                    'name': 'realtimes', // or bookTicker
                },
            },
            'streaming': {
                'ping': this.ping,
                'keepAlive': 20000,
            },
            'exceptions': {
                'ws': {
                    'exact': {
                    },
                },
            },
        });
    }

    getUrlByMarketType (symbol = undefined, isPrivate = false, method = undefined, params = {}) {
        const accessibility = isPrivate ? 'private' : 'public';
        let isUsdcSettled = undefined;
        let isSpot = undefined;
        let type = undefined;
        let isLinear = undefined;
        let market = undefined;
        let url = this.urls['api']['ws'];
        if (symbol !== undefined) {
            market = this.market (symbol);
            isUsdcSettled = market['settle'] === 'USDC';
            isSpot = market['spot'];
            type = market['type'];
            isLinear = market['linear'];
        } else {
            [ type, params ] = this.handleMarketTypeAndParams (method, undefined, params);
            const defaultSubType = this.safeString (this.options, 'defaultSubType', 'linear');
            const subType = this.safeString (params, 'subType', defaultSubType);
            let defaultSettle = this.safeString (this.options, 'defaultSettle');
            defaultSettle = this.safeString2 (params, 'settle', 'defaultSettle', defaultSettle);
            isUsdcSettled = (defaultSettle === 'USDC');
            isSpot = (type === 'spot');
            isLinear = (subType === 'linear');
        }
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
        return url;
    }

    cleanParams (params) {
        params = this.omit (params, [ 'type', 'subType', 'settle', 'defaultSettle' ]);
        return params;
    }

    async watchTicker (symbol, params = {}) {
        /**
         * @method
         * @name bybit#watchTicker
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the bybit api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const messageHash = 'ticker:' + market['symbol'];
        const url = this.getUrlByMarketType (symbol, false, params);
        params = this.cleanParams (params);
        if (market['spot']) {
            const options = this.safeValue (this.options, 'watchTicker', {});
            const channel = this.safeString (options, 'name', 'realtimes');
            const reqParams = {
                'symbol': market['id'],
            };
            return await this.watchSpotPublic (url, channel, messageHash, reqParams, params);
        } else {
            const channel = 'instrument_info.100ms.' + market['id'];
            const reqParams = [ channel ];
            return await this.watchContractPublic (url, messageHash, reqParams, params);
        }
    }

    handleTicker (client, message) {
        //
        // {
        //     topic: 'bookTicker',
        //     params: { symbol: 'BTCUSDT', binary: 'false', symbolName: 'BTCUSDT' },
        //     data: {
        //       symbol: 'BTCUSDT',
        //       bidPrice: '29150.8',
        //       bidQty: '0.171947',
        //       askPrice: '29156.72',
        //       askQty: '0.017764',
        //       time: 1652956849565
        //     }
        // }
        //
        //  spot realtimes
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
        // swap/futures use an incremental approach sending first the snapshot and then the updates
        //
        // snapshot message
        //     {
        //         "topic":"instrument_info.100ms.BTCUSDT",
        //         "type":"snapshot",
        //         "data":{
        //            "id":1,
        //            "symbol":"BTCUSDT",
        //            "last_price_e4":"291050000",
        //            "last_price":"29105.00",
        //            "bid1_price_e4":"291045000",
        //            "bid1_price":"29104.50",
        //            "ask1_price_e4":"291050000",
        //            "ask1_price":"29105.00",
        //            "last_tick_direction":"ZeroPlusTick",
        //            "prev_price_24h_e4":"297900000",
        //            "prev_price_24h":"29790.00",
        //            "price_24h_pcnt_e6":"-22994",
        //            "high_price_24h_e4":"300200000",
        //            "high_price_24h":"30020.00",
        //            "low_price_24h_e4":"286330000",
        //            "low_price_24h":"28633.00",
        //            "prev_price_1h_e4":"291435000",
        //            "prev_price_1h":"29143.50",
        //            "price_1h_pcnt_e6":"-1321",
        //            "mark_price_e4":"291148200",
        //            "mark_price":"29114.82",
        //            "index_price_e4":"291173600",
        //            "index_price":"29117.36",
        //            "open_interest_e8":"2725210700000",
        //            "total_turnover_e8":"6184585271557950000",
        //            "turnover_24h_e8":"373066109692150560",
        //            "total_volume_e8":"3319897492699924",
        //            "volume_24h_e8":"12774825300000",
        //            "funding_rate_e6":"-97",
        //            "predicted_funding_rate_e6":"100",
        //            "cross_seq":"11834024892",
        //            "created_at":"1970-01-01T00:00:00.000Z",
        //            "updated_at":"2022-05-19T08:52:10.000Z",
        //            "next_funding_time":"2022-05-19T16:00:00Z",
        //            "count_down_hour":"8",
        //            "funding_rate_interval":"8",
        //            "settle_time_e9":"0",
        //            "delisting_status":"0"
        //         },
        //         "cross_seq":"11834024953",
        //         "timestamp_e6":"1652950330515050"
        //     }
        //
        // update message
        //    {
        //        "topic":"instrument_info.100ms.BTCUSDT",
        //        "type":"delta",
        //        "data":{
        //           "update":[
        //              {
        //                 "id":1,
        //                 "symbol":"BTCUSDT",
        //                 "open_interest_e8":"2721359000000",
        //                 "cross_seq":"11834107074",
        //                 "created_at":"1970-01-01T00:00:00.000Z",
        //                 "updated_at":"2022-05-19T08:54:18.000Z"
        //              }
        //           ]
        //        },
        //        "cross_seq":"11834107125",
        //        "timestamp_e6":"1652950458616087"
        //    }
        //
        const topic = this.safeString (message, 'topic', '');
        if ((topic === 'realtimes') || (topic === 'bookTicker')) {
            // spot markets
            const data = this.safeValue (message, 'data');
            const ticker = this.parseWsTicker (data);
            const symbol = ticker['symbol'];
            this.tickers[symbol] = ticker;
            const messageHash = 'ticker:' + symbol;
            client.resolve (ticker, messageHash);
            return;
        }
        const updateType = this.safeString (message, 'type', '');
        const data = this.safeValue (message, 'data', {});
        let symbol = undefined;
        if (updateType === 'snapshot') {
            const parsed = this.parseWsTicker (data);
            symbol = parsed['symbol'];
            this.tickers[symbol] = parsed;
        }
        if (updateType === 'delta') {
            const topicParts = topic.split ('.');
            const topicLength = topicParts.length;
            const marketId = this.safeString (topicParts, topicLength - 1);
            const market = this.market (marketId);
            symbol = market['symbol'];
            const updates = this.safeValue (data, 'update', []);
            let ticker = this.safeValue (this.tickers, symbol, {});
            for (let i = 0; i < updates.length; i++) {
                const update = updates[i];
                ticker = this.updateTicker (ticker, update);
            }
            this.tickers[symbol] = ticker;
        }
        const messageHash = 'ticker:' + symbol;
        client.resolve (this.tickers[symbol], messageHash);
    }

    updateTicker (ticker, update) {
        // First we update the raw ticker with the new values
        // then we parse it again, although we could just
        // update the changed values in the already parsed ticker
        // doing that would lead to an inconsistent info object
        // inside ticker
        const rawTicker = ticker['info'];
        const updateKeys = Object.keys (update);
        const updateLength = updateKeys.length;
        if (updateLength > 0) {
            for (let i = 0; i < updateKeys.length; i++) {
                const key = updateKeys[i];
                if (key in rawTicker) {
                    rawTicker[key] = update[key];
                }
            }
            const parsed = this.parseWsTicker (rawTicker);
            return parsed;
        }
        return ticker;
    }

    parseWsTicker (ticker, market = undefined) {
        //
        // spot
        //   {
        //          symbol: 'BTCUSDT',
        //          bidPrice: '29150.8',
        //          bidQty: '0.171947',
        //          askPrice: '29156.72',
        //          askQty: '0.017764',
        //          time: 1652956849565
        //   }
        //
        //   {
        //          t: 1652883737410,
        //          s: 'BTCUSDT',
        //          o: '30422.68',
        //          h: '30715',
        //          l: '29288.44',
        //          c: '29462.94',
        //          v: '4350.340495',
        //          qv: '130497543.0334267',
        //          m: '-0.0315'
        //    }
        //
        // swap
        //
        //   {
        //            "id":1,
        //            "symbol":"BTCUSDT",
        //            "last_price_e4":"291050000",
        //            "last_price":"29105.00",
        //            "bid1_price_e4":"291045000",
        //            "bid1_price":"29104.50",
        //            "ask1_price_e4":"291050000",
        //            "ask1_price":"29105.00",
        //            "last_tick_direction":"ZeroPlusTick",
        //            "prev_price_24h_e4":"297900000",
        //            "prev_price_24h":"29790.00",
        //            "price_24h_pcnt_e6":"-22994",
        //            "high_price_24h_e4":"300200000",
        //            "high_price_24h":"30020.00",
        //            "low_price_24h_e4":"286330000",
        //            "low_price_24h":"28633.00",
        //            "prev_price_1h_e4":"291435000",
        //            "prev_price_1h":"29143.50",
        //            "price_1h_pcnt_e6":"-1321",
        //            "mark_price_e4":"291148200",
        //            "mark_price":"29114.82",
        //            "index_price_e4":"291173600",
        //            "index_price":"29117.36",
        //            "open_interest_e8":"2725210700000",
        //            "total_turnover_e8":"6184585271557950000",
        //            "turnover_24h_e8":"373066109692150560",
        //            "total_volume_e8":"3319897492699924",
        //            "volume_24h_e8":"12774825300000",
        //            "funding_rate_e6":"-97",
        //            "predicted_funding_rate_e6":"100",
        //            "cross_seq":"11834024892",
        //            "created_at":"1970-01-01T00:00:00.000Z",
        //            "updated_at":"2022-05-19T08:52:10.000Z",
        //            "next_funding_time":"2022-05-19T16:00:00Z",
        //            "count_down_hour":"8",
        //            "funding_rate_interval":"8",
        //            "settle_time_e9":"0",
        //            "delisting_status":"0"
        //         },
        //         "cross_seq":"11834024953",
        //         "timestamp_e6":"1652950330515050"
        //     }
        //
        // option
        //    {
        //        "symbol":"BTC-19NOV21-58000-P",
        //        "bidPrice":"421",
        //        "askPrice":"465",
        //        "bidIv":"0.7785",
        //        "askIv":"0.8012",
        //        "bidSize":"17",
        //        "askSize":"18",
        //        "markPrice":"442.51157238",
        //        "markPriceIv":"0.7897",
        //        "indexPrice":"67102.13",
        //        "underlyingPrice":"67407.49",
        //        "lastPrice":"0",
        //        "delta":"-0.10385629",
        //        "gamma":"0.00002132",
        //        "theta":"-82.72572574",
        //        "vega":"19.33584131",
        //        "change24h":"0",
        //        "volume24h":"0",
        //        "turnover24h":"0",
        //        "high24h":"0",
        //        "low24h":"0",
        //        "totalVolume":"0",
        //        "totalTurnover":"0",
        //        "openInterest":"0",
        //        "predictedDeliveryPrice":"62330.90608575"
        //    }
        //
        let timestamp = this.safeInteger2 (ticker, 'time', 't');
        if (timestamp === undefined) {
            timestamp = this.parse8601 (this.safeString2 (ticker, 'updated_at', 'updatedAt'));
            if (timestamp === undefined) {
                const timestampE9 = this.safeString (ticker, 'updated_at_e9');
                timestamp = Precise.stringDiv (timestampE9, '1000000');
                timestamp = this.parseNumber (timestamp);
                timestamp = (timestamp !== undefined) ? parseInt (timestamp) : undefined;
            }
        }
        const marketId = this.safeString2 (ticker, 'symbol', 's');
        const symbol = this.safeSymbol (marketId, market);
        const last = this.safeStringN (ticker, [ 'l', 'last_price', 'lastPrice' ]);
        const open = this.safeStringN (ticker, [ 'prev_price_24h', 'o', 'prevPrice24h' ]);
        let quoteVolume = this.safeStringN (ticker, [ 'v', 'turnover24h' ]);
        if (quoteVolume === undefined) {
            quoteVolume = this.safeString2 (ticker, 'turnover_24h_e8', 'turnover24hE8');
            quoteVolume = Precise.stringDiv (quoteVolume, '100000000');
        }
        let baseVolume = this.safeStringN (ticker, [ 'qv', 'volume24h', 'volume_24h' ]);
        if (baseVolume === undefined) {
            baseVolume = this.safeString2 (ticker, 'volume_24h_e8', 'volume24hE8');
            baseVolume = Precise.stringDiv (baseVolume, '100000000');
        }
        const bid = this.safeStringN (ticker, [ 'bidPrice', 'bid1_price', 'bid1Price' ]);
        const ask = this.safeStringN (ticker, [ 'askPrice', 'ask1_price', 'ask1Price' ]);
        const high = this.safeStringN (ticker, [ 'high_price_24h', 'high24h', 'h', 'highPrice24h' ]);
        const low = this.safeStringN (ticker, [ 'low_price_24h', 'low24h', 'l', 'lowPrice24h' ]);
        let percentage = this.safeString (ticker, 'm');
        if (percentage === undefined) {
            percentage = this.safeString2 (ticker, 'price_24h_pcnt_e6', 'price24hPcntE6');
            percentage = Precise.stringDiv (percentage, '1000000');
        }
        const change = this.safeString (ticker, 'change24h');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': high,
            'low': low,
            'bid': bid,
            'bidVolume': this.safeString2 (ticker, 'bidSize', 'bidQty'),
            'ask': ask,
            'askVolume': this.safeString2 (ticker, 'askSize', 'askQty'),
            'vwap': undefined,
            'open': open,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': change,
            'percentage': percentage,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        }, market);
    }

    async watchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const interval = this.timeframes[timeframe];
        const url = this.getUrlByMarketType (symbol, false, params);
        params = this.cleanParams (params);
        const messageHash = 'kline' + ':' + timeframe + ':' + symbol;
        let ohlcv = undefined;
        if (market['spot']) {
            const channel = 'kline';
            const reqParams = {
                'symbol': market['id'],
                'klineType': timeframe, // spot uses the same timeframe as ours
            };
            ohlcv = await this.watchSpotPublic (url, channel, messageHash, reqParams, params);
        } else {
            const prefix = market['linear'] ? 'candle' : 'klineV2';
            const channel = prefix + '.' + interval + '.' + market['id'];
            const reqParams = [ channel ];
            ohlcv = await this.watchContractPublic (url, messageHash, reqParams, params);
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
        const topic = this.safeString (message, 'topic');
        if (Array.isArray (data)) {
            // swap messages
            const topicParts = topic.split ('.');
            const topicLength = topicParts.length;
            const marketId = this.safeString (topicParts, topicLength - 1);
            const timeframe = this.safeString (topicParts, topicLength - 2);
            const marketIds = {};
            for (let i = 0; i < data.length; i++) {
                const ohlcv = data[i];
                const market = this.market (marketId);
                const symbol = market['symbol'];
                const parsed = this.parseWsOHLCV (ohlcv, market);
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
                const interval = marketIds[symbol];
                const timeframe = this.findTimeframe (interval);
                const messageHash = 'kline' + ':' + timeframe + ':' + symbol;
                const stored = this.safeValue (this.ohlcvs, symbol);
                client.resolve (stored, messageHash);
            }
        } else {
            // spot messages
            const params = this.safeValue (message, 'params', {});
            const data = this.safeValue (message, 'data');
            const marketId = this.safeString (params, 'symbol');
            const timeframe = this.safeString (params, 'klineType');
            const market = this.market (marketId);
            const parsed = this.parseWsOHLCV (data, market);
            const symbol = market['symbol'];
            let stored = this.safeValue (this.ohlcvs, symbol);
            if (stored === undefined) {
                const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
                stored = new ArrayCacheByTimestamp (limit);
                this.ohlcvs[symbol] = stored;
            }
            stored.append (parsed);
            const messageHash = 'kline' + ':' + timeframe + ':' + symbol;
            client.resolve (stored, messageHash);
        }
    }

    parseWsOHLCV (ohlcv, market = undefined) {
        //
        // swap
        //   {
        //      start: 1652893140,
        //      end: 1652893200,
        //      open: 67.9,
        //      close: 67.84,
        //      high: 67.91,
        //      low: 67.84,
        //      volume: 56,
        //      turnover: 0.82528936,
        //      timestamp: '1652893152874413', // microseconds
        //      confirm: false,
        //      cross_seq: 63544166
        //   }
        //
        // spot
        //
        //   {
        //      t: 1652893440000,
        //      s: 'LTCUSDT',
        //      sn: 'LTCUSDT',
        //      c: '67.92',
        //      h: '68.05',
        //      l: '67.92',
        //      o: '68.05',
        //      v: '9.71302'
        //   }
        //
        let timestamp = this.safeInteger (ohlcv, 't');
        if (timestamp === undefined) {
            timestamp = this.safeTimestamp (ohlcv, 'start');
        }
        return [
            timestamp,
            this.safeNumber2 (ohlcv, 'open', 'o'),
            this.safeNumber2 (ohlcv, 'high', 'h'),
            this.safeNumber2 (ohlcv, 'low', 'l'),
            this.safeNumber2 (ohlcv, 'close', 'c'),
            this.safeNumber2 (ohlcv, 'volume', 'v'),
        ];
    }

    async watchOrderBook (symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name bybit#watchOrderBook
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the bybit api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const url = this.getUrlByMarketType (symbol, false, params);
        params = this.cleanParams (params);
        const messageHash = 'orderbook' + ':' + symbol;
        let orderbook = undefined;
        if (market['spot']) {
            const channel = 'depth';
            const reqParams = {
                'symbol': market['id'],
            };
            orderbook = await this.watchSpotPublic (url, channel, messageHash, reqParams, params);
        } else {
            let channel = undefined;
            if (market['option']) {
                channel = 'delta.orderbook100' + '.' + market['marketId'];
            } else {
                if (limit !== undefined) {
                    if (limit !== 25 && limit !== 200) {
                        throw new BadRequest (this.id + ' watchOrderBook limit argument must be either 25 or 200');
                    }
                } else {
                    limit = 25;
                }
                const prefix = (limit === 25) ? 'orderBookL2_25' : 'orderBook_200.100ms';
                channel = prefix + '.' + market['id'];
            }
            const reqParams = [ channel ];
            orderbook = await this.watchContractPublic (url, messageHash, reqParams, params);
        }
        return orderbook.limit (limit);
    }

    handleOrderBook (client, message) {
        //
        // spot snapshot
        // {
        //     topic: 'depth',
        //     params: { symbol: 'BTCUSDT', binary: 'false', symbolName: 'BTCUSDT' },
        //     data: {
        //       s: 'BTCUSDT',
        //       t: 1652970523792,
        //       v: '34407758_140450607_2',
        //       b: [
        //            [
        //                "9780.79",
        //                "0.01"
        //            ],
        //       ],
        //       a: [
        //            [
        //               "9781.21",
        //               "0.042842"
        //            ]
        //       ]
        //     }
        //   }
        //
        // contract snapshot
        //    {
        //        topic: 'orderBookL2_25.BTCUSDT',
        //        type: 'snapshot',
        //        data: {
        //          order_book: [
        //              {
        //                  "price":"29907.50",
        //                  "symbol":"BTCUSDT",
        //                  "id":"299075000",
        //                  "side":"Buy",
        //                  "size":0.763
        //              }
        //          ]
        //        },
        //        cross_seq: '11846360142',
        //        timestamp_e6: '1652973544516741'
        //    }
        //
        // contract delta
        //
        // {
        //     topic: 'orderBookL2_25.BTCUSDT',
        //     type: 'delta',
        //     data: {
        //         "delete": [
        //             {
        //                   "price": "3001.00",
        //                   "symbol": "BTCUSDT",
        //                   "id": 30010000,
        //                   "side": "Sell"
        //             }
        //          ],
        //          "update": [
        //             {
        //                   "price": "2999.00",
        //                   "symbol": "BTCUSDT",
        //                   "id": 29990000,
        //                   "side": "Buy",
        //                   "size": 8
        //             }
        //          ],
        //          "insert": [
        //             {
        //                   "price": "2998.00",
        //                   "symbol": "BTCUSDT",
        //                   "id": 29980000,
        //                   "side": "Buy",
        //                   "size": 8
        //             }
        //            ],
        //          },
        //          cross_seq: '11848736847',
        //          timestamp_e6: '1652976712534987'
        //     }
        //
        const topic = this.safeString (message, 'topic', '');
        const data = this.safeValue (message, 'data', {});
        if (topic === 'depth') {
            // spot branch, we get the snapshot in every message
            const marketId = this.safeString (data, 's');
            const market = this.market (marketId);
            const symbol = market['symbol'];
            const timestamp = this.safeInteger (data, 't');
            const snapshot = this.parseOrderBook (data, symbol, timestamp, 'b', 'a');
            let orderbook = undefined;
            if (!(symbol in this.orderbooks)) {
                orderbook = this.orderBook (snapshot);
                this.orderbooks[symbol] = orderbook;
            } else {
                orderbook = this.orderbooks[symbol];
                orderbook.reset (snapshot);
            }
            const messageHash = 'orderbook' + ':' + symbol;
            client.resolve (orderbook, messageHash);
            return;
        }
        if (topic.indexOf ('orderBook') >= 0) {
            // contract branch
            const type = this.safeString (message, 'type');
            const topicParts = topic.split ('.');
            const topicLength = topicParts.length;
            const marketId = this.safeString (topicParts, topicLength - 1);
            const market = this.market (marketId);
            const symbol = market['symbol'];
            const messageHash = 'orderbook' + ':' + symbol;
            const nonce = this.safeInteger2 (message, 'cross_seq', 'crossSeq');
            const timestamp = this.safeIntegerProduct2 (message, 'timestamp_e6', 'timestampE6', 0.001);
            if (type === 'snapshot') {
                const rawOrderBook = this.safeValue2 (data, 'order_book', 'orderBook', data);
                const snapshot = this.parseOrderBook (rawOrderBook, symbol, timestamp, 'Buy', 'Sell', 'price', 'size');
                snapshot['nonce'] = nonce;
                let orderbook = undefined;
                if (!(symbol in this.orderbooks)) {
                    orderbook = this.orderBook (snapshot);
                    this.orderbooks[symbol] = orderbook;
                } else {
                    orderbook = this.orderbooks[symbol];
                    orderbook.reset (snapshot);
                }
            } else if (type === 'delta') {
                const deleted = this.safeValue (data, 'delete', []);
                const updated = this.safeValue (data, 'update', []);
                const inserted = this.safeValue (data, 'insert', []);
                const updatedDeleted = [];
                for (let i = 0; i < deleted.length; i++) {
                    const entry = deleted[i];
                    entry['size'] = 0;
                    updatedDeleted.push (entry);
                }
                let deltas = updatedDeleted;
                deltas = this.arrayConcat (deltas, updated);
                deltas = this.arrayConcat (deltas, inserted);
                const orderbook = this.safeValue (this.orderbooks, symbol);
                orderbook['nonce'] = nonce;
                orderbook['timestamp'] = timestamp;
                orderbook['datetime'] = this.iso8601 (timestamp);
                this.handleDeltas (orderbook, deltas);
            }
            client.resolve (this.orderbooks[symbol], messageHash);
        }
    }

    handleDeltas (orderbook, deltas) {
        //
        //   [
        //      {
        //            "price": "2999.00",
        //            "symbol": "BTCUSDT",
        //            "id": 29990000,
        //            "side": "Buy",
        //            "size": 8
        //      }
        //   ]
        //
        for (let i = 0; i < deltas.length; i++) {
            const delta = deltas[i];
            const side = this.safeString (delta, 'side');
            if (side === 'Buy') {
                this.handleDelta (orderbook['bids'], deltas[i]);
            } else {
                this.handleDelta (orderbook['asks'], deltas[i]);
            }
        }
    }

    handleDelta (bookside, delta) {
        //
        //   {
        //         "price": "2999.00",
        //         "symbol": "BTCUSDT",
        //         "id": 29990000,
        //         "side": "Buy",
        //         "size": 8
        //   }
        //
        const price = this.safeNumber (delta, 'price');
        const amount = this.safeNumber (delta, 'size');
        bookside.store (price, amount);
    }

    async watchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bybit#watchMyTrades
         * @description watches information on multiple trades made by the user
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the bybit api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const commonChannel = 'trade';
        const url = this.getUrlByMarketType (symbol, false, params);
        params = this.cleanParams (params);
        const messageHash = commonChannel + ':' + symbol;
        let trades = undefined;
        if (market['spot']) {
            const reqParams = {
                'symbol': market['id'],
            };
            trades = await this.watchSpotPublic (url, commonChannel, messageHash, reqParams, params);
        } else {
            let channel = undefined;
            if (market['option']) {
                channel = 'recenttrades' + '.' + market['baseId'];
            } else {
                channel = commonChannel + '.' + market['id'];
            }
            const reqParams = [ channel ];
            trades = await this.watchContractPublic (url, messageHash, reqParams, params);
        }
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    handleTrades (client, message) {
        //
        // swap
        //    {
        //        topic: 'trade.BTCUSDT',
        //        data: [
        //          {
        //            symbol: 'BTCUSDT',
        //            tick_direction: 'ZeroPlusTick',
        //            price: '29678.00',
        //            size: 0.025,
        //            timestamp: '2022-05-19T13:36:01.000Z',
        //            trade_time_ms: '1652967361915',
        //            side: 'Buy',
        //            trade_id: '78352b1f-17b7-522a-9eea-b06f0deaf23e'
        //          }
        //        ]
        //    }
        //
        // spot
        //
        //    {
        //        topic: 'trade',
        //        params: { symbol: 'BTCUSDT', binary: 'false', symbolName: 'BTCUSDT' },
        //        data: {
        //          v: '2290000000003002848',
        //          t: 1652967602261,
        //          p: '29698.82',
        //          q: '0.189531',
        //          m: true
        //        }
        //    }
        //
        let marketId = undefined;
        const data = this.safeValue (message, 'data', []);
        const topic = this.safeString (message, 'topic');
        let trades = undefined;
        if (!Array.isArray (data)) {
            // spot markets
            const params = this.safeValue (message, 'params', {});
            marketId = this.safeString (params, 'symbol');
            // injecting marketId in trade
            data['symbol'] = marketId;
            trades = [ data ];
        } else {
            // contract markets
            const parts = topic.split ('.');
            marketId = this.safeString (parts, 1);
            trades = data;
        }
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        let stored = this.safeValue (this.trades, symbol);
        if (stored === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            stored = new ArrayCache (limit);
            this.trades[symbol] = stored;
        }
        for (let j = 0; j < trades.length; j++) {
            const parsed = this.parseWsTrade (trades[j], market);
            stored.append (parsed);
        }
        const messageHash = 'trade' + ':' + symbol;
        client.resolve (stored, messageHash);
    }

    parseWsTrade (trade, market = undefined) {
        //
        // swap public
        //
        //     {
        //       symbol: 'BTCUSDT',
        //       tick_direction: 'ZeroPlusTick',
        //       price: '29678.00',
        //       size: 0.025,
        //       timestamp: '2022-05-19T13:36:01.000Z',
        //       trade_time_ms: '1652967361915',
        //       side: 'Buy',
        //       trade_id: '78352b1f-17b7-522a-9eea-b06f0deaf23e'
        //     }
        //
        // swap private
        //    {
        //        symbol: 'LTCUSDT',
        //        side: 'Buy',
        //        order_id: '6773a86c-24c3-4066-90b6-d45c6653f35f',
        //        exec_id: '91d4962c-828f-58f1-9a1e-388c357d9344',
        //        order_link_id: '',
        //        price: 71.8,
        //        order_qty: 0.1,
        //        exec_type: 'Trade',
        //        exec_qty: 0.1,
        //        exec_fee: 0.004308,
        //        leaves_qty: 0,
        //        is_maker: false,
        //        trade_time: '2022-05-23T14:08:08.875206Z'
        //    }
        //
        // option
        //
        //     {
        //         "symbol":"BTC-31DEC21-36000-P",
        //         "tradeId":"787bf079-b6a5-5bc0-a76d-59dad9036e7b",
        //         "price":"371",
        //         "size":"0.01",
        //         "tradeTime":"1636510323144",
        //         "side":"Buy",
        //         "crossSeq":"118388"
        //     }
        //
        // usdc
        //   {
        //       "orderId":"290b1b83-b6bb-4327-9839-8c5b9c322b4c",
        //       "orderLinkId":"",
        //       "tradeId":"3a69833e-f23c-5530-83a9-ccbb4af34926",
        //       "symbol":"BTCPERP",
        //       "side":"Sell",
        //       "execPrice":"30331",
        //       "execQty":"0.001",
        //       "execFee":"0.0181986",
        //       "feeRate":"0.0006",
        //       "tradeTime":1653321686805,
        //       "lastLiquidityInd":"TAKER",
        //       "execValue":"30.331",
        //       "execType":"TRADE"
        //   }
        //
        // spot public
        //
        //    {
        //      'symbol': 'BTCUSDT', // artificially added
        //       v: '2290000000003002848', // trade id
        //       t: 1652967602261,
        //       p: '29698.82',
        //       q: '0.189531',
        //       m: true
        //     }
        //
        // spot private
        //
        //     {
        //         'e': 'ticketInfo',
        //         'E': '1653313467249', // event time
        //         's': 'LTCUSDT',
        //         'q': '0.13621',
        //         't': '1653313467227', // timestamp
        //         'p': '72.43',
        //         'T': '2200000000004436641', // trade Id
        //         'o': '1162472050160422400', // order Id
        //         'c': '1653313466834', // client Id
        //         'O': '1162471954312183040',
        //         'a': '24478790', // account id
        //         'A': '18478961',
        //         'm': false, // isMaker
        //     }
        //
        const id = this.safeStringN (trade, [ 'trade_id', 'v', 'tradeId', 'T', 'exec_id' ]);
        const marketId = this.safeString2 (trade, 'symbol', 's');
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        const price = this.safeStringN (trade, [ 'p', 'price', 'execPrice' ]);
        const amount = this.safeStringN (trade, [ 'q', 'size', 'exec_qty', 'execQty' ]);
        const cost = this.safeString2 (trade, 'exec_value', 'execValue');
        let timestamp = this.safeIntegerN (trade, [ 'trade_time_ms', 't', 'tradeTime', 'tradeTimeMs' ]);
        if (timestamp === undefined) {
            timestamp = this.parse8601 (this.safeString (trade, 'trade_time'));
        }
        const side = this.safeStringLower (trade, 'side');
        let isMaker = this.safeValue2 (trade, 'm', 'is_maker');
        if (isMaker === undefined) {
            const lastLiquidityInd = this.safeString (trade, 'lastLiquidityInd');
            isMaker = (lastLiquidityInd === 'MAKER');
        }
        const takerOrMaker = isMaker ? 'maker' : 'taker';
        const orderId = this.safeStringN (trade, [ 'o', 'order_id', 'tradeTime' ]);
        let fee = undefined;
        const isContract = this.safeValue (market, 'contract');
        if (isContract) {
            const feeCost = this.safeString2 (trade, 'exec_fee', 'execFee');
            if (feeCost !== undefined) {
                const feeCurrency = market['linear'] ? market['quote'] : market['base'];
                fee = {
                    'cost': feeCost,
                    'currency': feeCurrency,
                };
            }
        }
        return this.safeTrade ({
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': orderId,
            'type': undefined,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
        }, market);
    }

    async watchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bybit#watchMyTrades
         * @description watches information on multiple trades made by the user
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the bybit api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure
         */
        const method = 'watchMyTrades';
        let messageHash = 'usertrade';
        await this.loadMarkets ();
        let market = undefined;
        let type = undefined;
        let isUsdcSettled = undefined;
        const url = this.getUrlByMarketType (symbol, true, method, params);
        if (symbol !== undefined) {
            market = this.market (symbol);
            symbol = market['symbol'];
            messageHash += ':' + symbol;
            type = market['type'];
            isUsdcSettled = market['settle'] === 'USDC';
        } else {
            [ type, params ] = this.handleMarketTypeAndParams (method, undefined, params);
            let settle = this.safeString (this.options, 'defaultSettle');
            settle = this.safeString2 (params, 'settle', 'defaultSettle', settle);
            isUsdcSettled = settle === 'USDC';
        }
        params = this.cleanParams (params);
        let trades = undefined;
        if (type === 'spot') {
            trades = await this.watchSpotPrivate (url, messageHash, params);
        } else {
            let channel = undefined;
            if (isUsdcSettled) {
                channel = (type === 'option') ? 'user.openapi.option.trade' : 'user.openapi.perp.trade';
            } else {
                channel = 'execution';
            }
            const reqParams = [ channel ];
            messageHash += ':' + channel;
            trades = await this.watchContractPrivate (url, messageHash, reqParams, params);
        }
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    handleMyTrades (client, message) {
        //
        // spot
        //
        //   [
        //       {
        //           'e': 'ticketInfo',
        //           'E': '1653313467249',
        //           's': 'LTCUSDT',
        //           'q': '0.13621',
        //           't': '1653313467227',
        //           'p': '72.43',
        //           'T': '2200000000004436641',
        //           'o': '1162472050160422400',
        //           'c': '1653313466834',
        //           'O': '1162471954312183040',
        //           'a': '24478790',
        //           'A': '18478961',
        //           'm': false,
        //       }
        //   ]
        //
        // usdc
        //
        //   {
        //       "id":"b4c38cdc-5708-4c24-9f26-b3468f7b9658",
        //       "topic":"user.openapi.perp.trade",
        //       "creationTime":1653321605512,
        //       "data":{
        //          "result":[
        //             {
        //                "orderId":"cfafeaae-f4a5-4ee5-bd03-b899251b1557",
        //                "orderLinkId":"",
        //                "tradeId":"29a3b7da-f593-55c4-9f23-afd9d6715668",
        //                "symbol":"BTCPERP",
        //                "side":"Buy",
        //                "execPrice":"30333.5",
        //                "execQty":"0.001",
        //                "execFee":"0.0182001",
        //                "feeRate":"0.0006",
        //                "tradeTime":1653321605486,
        //                "lastLiquidityInd":"TAKER",
        //                "execValue":"30.3335",
        //                "execType":"TRADE"
        //             }
        //          ],
        //          "version":5,
        //          "baseLine":1
        //       }
        //   }
        //
        const topic = this.safeString (message, 'topic', '');
        let data = [];
        if (Array.isArray (message)) {
            data = message;
        } else {
            data = this.safeValue (message, 'data', []);
            if ('result' in data) {
                // usdc
                data = data['result'];
            }
        }
        if (this.myTrades === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            this.myTrades = new ArrayCacheBySymbolById (limit);
        }
        const trades = this.myTrades;
        const marketSymbols = {};
        for (let i = 0; i < data.length; i++) {
            const rawTrade = data[i];
            const parsed = this.parseWsTrade (rawTrade);
            const symbol = parsed['symbol'];
            marketSymbols[symbol] = true;
            trades.append (parsed);
        }
        const symbols = Object.keys (marketSymbols);
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const messageHash = 'usertrade:' + symbol + ':' + topic;
            client.resolve (trades, messageHash);
        }
        // non-symbol specific
        const messageHash = 'usertrade:' + topic;
        client.resolve (trades, messageHash);
    }

    async watchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bybit#watchOrders
         * @description watches information on multiple orders made by the user
         * @param {string|undefined} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the bybit api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure
         */
        const method = 'watchOrders';
        let messageHash = 'order';
        await this.loadMarkets ();
        let market = undefined;
        let type = undefined;
        let isUsdcSettled = undefined;
        const url = this.getUrlByMarketType (symbol, true, method, params);
        if (symbol !== undefined) {
            market = this.market (symbol);
            symbol = market['symbol'];
            messageHash += ':' + symbol;
            type = market['type'];
            isUsdcSettled = market['settle'] === 'USDC';
        } else {
            [ type, params ] = this.handleMarketTypeAndParams (method, undefined, params);
            let settle = this.safeString (this.options, 'defaultSettle');
            settle = this.safeString2 (params, 'settle', 'defaultSettle', settle);
            isUsdcSettled = settle === 'USDC';
        }
        params = this.cleanParams (params);
        let orders = undefined;
        if (type === 'spot') {
            orders = await this.watchSpotPrivate (url, messageHash, params);
        } else {
            let channel = undefined;
            if (isUsdcSettled) {
                channel = (type === 'option') ? 'user.openapi.option.order' : 'user.openapi.perp.order';
            } else {
                const orderType = this.safeString (params, 'orderType');
                const stop = this.safeValue (params, 'stop', false);
                const isStopOrder = stop || (orderType === 'stop') || (orderType === 'conditional');
                params = this.omit (params, [ 'stop', 'orderType' ]);
                channel = isStopOrder ? 'stop_order' : 'order';
            }
            const reqParams = [ channel ];
            messageHash += ':' + channel;
            orders = await this.watchContractPrivate (url, messageHash, reqParams, params);
        }
        if (this.newUpdates) {
            limit = orders.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (orders, symbol, since, limit, true);
    }

    handleOrder (client, message, subscription = undefined) {
        //
        // spot order
        //
        //     [
        //         {
        //           e: 'executionReport',
        //           E: '1653297251061',
        //           s: 'LTCUSDT',
        //           c: '1653297250740',
        //           S: 'SELL',
        //           o: 'MARKET_OF_BASE',
        //           f: 'GTC',
        //           q: '0.16233',
        //           p: '0',
        //           X: 'NEW',
        //           i: '1162336018974750208',
        //           M: '0',
        //           l: '0',
        //           z: '0',
        //           L: '0',
        //           n: '0',
        //           N: '',
        //           u: true,
        //           w: true,
        //           m: false,
        //           O: '1653297251042',
        //           Z: '0',
        //           A: '0',
        //           C: false,
        //           v: '0',
        //           d: 'NO_LIQ'
        //         }
        //     ]
        //
        // swap order
        //     {
        //         topic: 'order',
        //         action: '',
        //         data: [
        //           {
        //             order_id: 'f52071fd-6604-4cff-8112-82958ec55d3f',
        //             order_link_id: '',
        //             symbol: 'LTCUSDT',
        //             side: 'Buy',
        //             order_type: 'Market',
        //             price: 75.5,
        //             qty: 0.1,
        //             leaves_qty: 0,
        //             last_exec_price: 71.93,
        //             cum_exec_qty: 0.1,
        //             cum_exec_value: 7.193,
        //             cum_exec_fee: 0.0043158,
        //             time_in_force: 'ImmediateOrCancel',
        //             create_type: 'CreateByUser',
        //             cancel_type: 'UNKNOWN',
        //             order_status: 'Filled',
        //             take_profit: 0,
        //             stop_loss: 0,
        //             trailing_stop: 0,
        //             create_time: '2022-05-23T09:32:34.266539338Z',
        //             update_time: '2022-05-23T09:32:34.270607105Z',
        //             reduce_only: false,
        //             close_on_trigger: false,
        //             position_idx: '1'
        //           }
        //         ]
        //     }
        // usdc order
        //
        //     {
        //         "id":"401a6485-5701-49f2-9d0b-c09d97d56748",
        //         "topic":"user.openapi.perp.order",
        //         "creationTime":1653304042137,
        //         "data":{
        //            "result":[
        //               {
        //                  "orderId":"fe2e0765-fa47-4516-a962-fb021b9418e7",
        //                  "orderLinkId":"",
        //                  "createdAt":1653304042104,
        //                  "updatedAt":1653304042107,
        //                  "symbol":"BTCPERP",
        //                  "orderStatus":"New",
        //                  "side":"Buy",
        //                  "price":"20000.0000",
        //                  "qty":"0.001",
        //                  "cumExecQty":"0",
        //                  "leavesQty":"0.001",
        //                  "orderIM":"20.012",
        //                  "realisedPnl":null,
        //                  "orderType":"Limit",
        //                  "reduceOnly":0,
        //                  "timeInForce":"GoodTillCancel",
        //                  "cumExecFee":"0",
        //                  "orderPnl":"",
        //                  "basePrice":"",
        //                  "cumExecValue":"0",
        //                  "closeOnTrigger":"false",
        //                  "triggerBy":"UNKNOWN",
        //                  "takeProfit":"0",
        //                  "stopLoss":"0",
        //                  "tpTriggerBy":"UNKNOWN",
        //                  "slTriggerBy":"UNKNOWN",
        //                  "triggerPrice":"0",
        //                  "stopOrderType":"UNKNOWN",
        //                  "cancelType":"UNKNOWN"
        //               }
        //            ],
        //            "version":2,
        //            "baseLine":1,
        //            "dataType":"CHANGE"
        //         }
        //      }
        //
        const topic = this.safeString (message, 'topic', '');
        let data = [];
        let isSpot = false;
        if (Array.isArray (message)) {
            data = message;
            isSpot = true;
        } else {
            data = this.safeValue (message, 'data', []);
            if ('result' in data) {
                // usdc
                data = data['result'];
            }
        }
        const dataLength = data.length;
        if (dataLength === 0) {
            return;
        }
        if (this.orders === undefined) {
            const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
            this.orders = new ArrayCacheBySymbolById (limit);
        }
        const orders = this.orders;
        const marketSymbols = {};
        for (let i = 0; i < data.length; i++) {
            const rawOrder = data[i];
            let parsed = undefined;
            if (isSpot) {
                // spot orders have a different format
                // from the REST API
                parsed = this.parseWsOrder (rawOrder);
            } else {
                parsed = this.parseOrder (rawOrder);
            }
            const symbol = parsed['symbol'];
            marketSymbols[symbol] = true;
            orders.append (parsed);
        }
        const symbols = Object.keys (marketSymbols);
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const messageHash = 'order:' + symbol + ':' + topic;
            client.resolve (orders, messageHash);
        }
        const messageHash = 'order:' + topic;
        // non-symbol specific
        client.resolve (orders, messageHash);
    }

    parseWsOrder (order, market = undefined) {
        //
        //    {
        //        e: 'executionReport',
        //        E: '1653297251061', // timestamp
        //        s: 'LTCUSDT', // symbol
        //        c: '1653297250740', // user id
        //        S: 'SELL', // side
        //        o: 'MARKET_OF_BASE', // order type
        //        f: 'GTC', // time in force
        //        q: '0.16233', // quantity
        //        p: '0', // price
        //        X: 'NEW', // status
        //        i: '1162336018974750208', // order id
        //        M: '0',
        //        l: '0', // last filled
        //        z: '0', // total filled
        //        L: '0', // last traded price
        //        n: '0', // trading fee
        //        N: '', // fee asset
        //        u: true,
        //        w: true,
        //        m: false, // is limit_maker
        //        O: '1653297251042', // order creation
        //        Z: '0', // total filled
        //        A: '0', // account id
        //        C: false, // is close
        //        v: '0', // leverage
        //        d: 'NO_LIQ'
        //    }
        //
        const id = this.safeString (order, 'i');
        const marketId = this.safeString (order, 's');
        const symbol = this.safeSymbol (marketId, market);
        const timestamp = this.safeInteger (order, 'O');
        let price = this.safeString (order, 'p');
        if (price === '0') {
            price = undefined; // market orders
        }
        const amount = this.safeString (order, 'q');
        const filled = this.safeString (order, 'z');
        const status = this.parseOrderStatus (this.safeString (order, 'X'));
        const side = this.safeStringLower (order, 'S');
        const lastTradeTimestamp = this.safeString (order, 'E');
        const timeInForce = this.safeString (order, 'f');
        let type = this.safeStringLower (order, 'o');
        if (type.indexOf ('market') >= 0) {
            type = 'market';
        }
        let fee = undefined;
        const feeCost = this.safeString (order, 'n');
        if (feeCost !== undefined && feeCost !== '0') {
            const feeCurrencyId = this.safeString (order, 'N');
            const feeCurrencyCode = this.safeCurrencyCode (feeCurrencyId);
            fee = {
                'cost': feeCost,
                'currency': feeCurrencyCode,
            };
        }
        return this.safeOrder ({
            'info': order,
            'id': id,
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'symbol': symbol,
            'type': type,
            'timeInForce': timeInForce,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': undefined,
            'amount': amount,
            'cost': undefined,
            'average': undefined,
            'filled': filled,
            'remaining': undefined,
            'status': status,
            'fee': fee,
            'trades': undefined,
        }, market);
    }

    async watchBalance (params = {}) {
        /**
         * @method
         * @name bybit#watchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} params extra parameters specific to the bybit api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        const method = 'watchBalance';
        let type = undefined;
        [ type, params ] = this.handleMarketTypeAndParams (method, undefined, params);
        if (type !== 'spot' && type !== 'swap') {
            throw new NotSupported (this.id + ' watchBalance does not support ' + type + ' type');
        }
        const messageHash = 'balance:' + type;
        const url = this.getUrlByMarketType (undefined, true, method, params);
        params = this.cleanParams (params);
        if (type === 'spot') {
            return await this.watchSpotPrivate (url, messageHash, params);
        } else {
            const reqParams = [
                'wallet',
            ];
            return await this.watchContractPrivate (url, messageHash, reqParams, params);
        }
    }

    handleBalance (client, message) {
        //
        // swap
        //
        //   {
        //       "topic":"wallet",
        //       "data":[
        //          {
        //             "wallet_balance":10.052857,
        //             "available_balance":5.049857
        //             "coin": "BTC", // if not available = usdt
        //          }
        //       ]
        //   }
        //
        // spot message
        //
        // [
        //     {
        //        "e":"outboundAccountInfo",
        //        "E":"1653039590765",
        //        "T":true,
        //        "W":true,
        //        "D":true,
        //        "B":[
        //           {
        //              "a":"USDT",
        //              "f":"14.6634752497",
        //              "l":"10"
        //           }
        //        ]
        //     }
        // ]
        //
        const topic = this.safeString (message, 'topic');
        let messageHash = 'balance';
        if (topic === 'wallet') {
            const data = this.safeValue (message, 'data', []);
            // swap
            for (let i = 0; i < data.length; i++) {
                const account = this.account ();
                const balance = data[i];
                const currencyId = this.safeString (balance, 'coin', 'USDT');
                const code = this.safeCurrencyCode (currencyId);
                account['free'] = this.safeString (balance, 'available_balance');
                account['total'] = this.safeString (balance, 'wallet_balance');
                this.balance[code] = account;
                this.balance = this.safeBalance (this.balance);
            }
            messageHash += ':' + 'swap';
            client.resolve (this.balance, messageHash);
            return;
        }
        if (Array.isArray (message)) {
            // spot balance
            for (let i = 0; i < message.length; i++) {
                const balances = this.safeValue (message[i], 'B', []);
                for (let j = 0; j < balances.length; j++) {
                    const balance = balances[j];
                    const account = this.account ();
                    const code = this.safeCurrencyCode (this.safeString (balance, 'a'));
                    account['free'] = this.safeString (balance, 'f');
                    account['used'] = this.safeString (balance, 'l');
                    this.balance[code] = account;
                    this.balance = this.safeBalance (this.balance);
                }
            }
            messageHash += ':' + 'spot';
            client.resolve (this.balance, messageHash);
        }
    }

    async watchContractPublic (url, messageHash, reqParams = {}, params = {}) {
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

    async watchSpotPrivate (url, messageHash, params = {}) {
        const channel = 'private';
        // sending the authentication message automatically
        // subscribes to all 3 private topics.
        this.checkRequiredCredentials ();
        let expires = this.milliseconds () + 10000;
        expires = expires.toString ();
        const path = 'GET/realtime';
        const auth = path + expires;
        const signature = this.hmac (this.encode (auth), this.encode (this.secret), 'sha256', 'hex');
        const request = {
            'op': 'auth',
            'args': [
                this.apiKey, expires, signature,
            ],
        };
        return await this.watch (url, messageHash, request, channel);
    }

    async watchContractPrivate (url, messageHash, reqParams, params = {}) {
        await this.authenticateContract (url, params);
        return await this.watchContractPublic (url, messageHash, reqParams, params);
    }

    async authenticateContract (url, params = {}) {
        this.checkRequiredCredentials ();
        const messageHash = 'login';
        const client = this.client (url);
        let future = this.safeValue (client.subscriptions, messageHash);
        if (future === undefined) {
            future = client.future ('authenticated');
            let expires = this.milliseconds () + 10000;
            expires = expires.toString ();
            const path = 'GET/realtime';
            const auth = path + expires;
            const signature = this.hmac (this.encode (auth), this.encode (this.secret), 'sha256', 'hex');
            const request = {
                'op': 'auth',
                'args': [
                    this.apiKey, expires, signature,
                ],
            };
            this.spawn (this.watch, url, messageHash, request, messageHash, future);
        }
        return await future;
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
        // auth error
        //
        //   {
        //       success: false,
        //       ret_msg: 'error:USVC1111',
        //       conn_id: 'e73770fb-a0dc-45bd-8028-140e20958090',
        //       request: {
        //         op: 'auth',
        //         args: [
        //           '9rFT6uR4uz9Imkw4Wx',
        //           '1653405853543',
        //           '542e71bd85597b4db0290f0ce2d13ed1fd4bb5df3188716c1e9cc69a879f7889'
        //         ]
        //   }
        //
        //   { code: '-10009', desc: 'Invalid period!' }
        //
        const code = this.safeInteger (message, 'code');
        try {
            if (code !== undefined) {
                const feedback = this.id + ' ' + this.json (message);
                this.throwExactlyMatchedException (this.exceptions['exact'], code, feedback);
            }
            const success = this.safeValue (message, 'success', false);
            if (!success) {
                const ret_msg = this.safeString (message, 'ret_msg');
                const request = this.safeValue (message, 'request', {});
                const op = this.safeString (request, 'op');
                if (op === 'auth') {
                    throw new AuthenticationError ('Authentication failed: ' + ret_msg);
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
        //    {
        //        topic: 'trade.BTCUSDT',
        //        data: [
        //          {
        //            symbol: 'BTCUSDT',
        //            tick_direction: 'ZeroPlusTick',
        //            price: '29678.00',
        //            size: 0.025,
        //            timestamp: '2022-05-19T13:36:01.000Z',
        //            trade_time_ms: '1652967361915',
        //            side: 'Buy',
        //            trade_id: '78352b1f-17b7-522a-9eea-b06f0deaf23e'
        //          }
        //        ]
        //    }
        //    {
        //        success: true,
        //        ret_msg: '',
        //        conn_id: '55f508ad-d17b-48d8-8b19-669280a25a72',
        //        request: {
        //          op: 'auth',
        //          args: [
        //            'cH4MQfkrFNKYiLfpVB',
        //            '1653038985746',
        //            'eede78af3eb916ffc569a5c1466b83e36034324f480ca2684728d17fb606acae'
        //          ]
        //        }
        //    }
        //
        if (!this.handleErrorMessage (client, message)) {
            return;
        }
        // contract pong
        const ret_msg = this.safeString (message, 'ret_msg');
        if (ret_msg === 'pong') {
            this.handlePong (client, message);
            return;
        }
        // spot pong
        const pong = this.safeInteger (message, 'pong');
        if (pong !== undefined) {
            this.handlePong (client, message);
            return;
        }
        // usdc pong
        const op = this.safeString (message, 'op');
        if (op === 'pong') {
            this.handlePong (client, message);
            return;
        }
        const event = this.safeString (message, 'event');
        if (event === 'sub') {
            this.handleSubscriptionStatus (client, message);
            return;
        }
        // contract public and private
        const topic = this.safeString (message, 'topic', '');
        if ((topic.indexOf ('kline') >= 0 || topic.indexOf ('candle') >= 0)) {
            this.handleOHLCV (client, message);
            return;
        }
        if ((topic.indexOf ('realtimes') >= 0 || topic.indexOf ('instrument_info') >= 0)) {
            this.handleTicker (client, message);
            return;
        }
        if ((topic.indexOf ('trade') >= 0)) {
            if ((topic.indexOf ('user') >= 0)) {
                this.handleMyTrades (client, message);
                return;
            }
            this.handleTrades (client, message);
        }
        if (topic.indexOf ('orderBook') >= 0) {
            this.handleOrderBook (client, message);
            return;
        }
        if (topic.indexOf ('order') >= 0) {
            this.handleOrder (client, message);
            return;
        }
        const methods = {
            'realtimes': this.handleTicker,
            'bookTicker': this.handleTicker,
            'depth': this.handleOrderBook,
            'wallet': this.handleBalance,
            'execution': this.handleMyTrades,
        };
        const method = this.safeValue (methods, topic);
        if (method !== undefined) {
            method.call (this, client, message);
        }
        // contract auth acknowledgement
        const request = this.safeValue (message, 'request', {});
        const reqOp = this.safeString (request, 'op');
        if (reqOp === 'auth') {
            this.handleAuthenticate (client, message);
        }
        // usdc auth
        const type = this.safeString (message, 'type');
        if (type === 'AUTH_RESP') {
            this.handleAuthenticate (client, message);
        }
        // private spot topics
        if (Array.isArray (message)) {
            const first = this.safeValue (message, 0);
            const topic = this.safeString (first, 'e');
            if (topic === 'outboundAccountInfo') {
                this.handleBalance (client, message);
            }
            if (topic === 'executionReport') {
                this.handleOrder (client, message);
            }
            if (topic === 'ticketInfo') {
                this.handleMyTrades (client, message);
            }
        }
    }

    ping (client) {
        const url = client.url;
        const timestamp = this.milliseconds ();
        if (url.indexOf ('spot') >= 0) {
            return { 'ping': timestamp };
        }
        return { 'op': 'ping' };
    }

    handlePong (client, message) {
        //
        //   {
        //       success: true,
        //       ret_msg: 'pong',
        //       conn_id: 'db3158a0-8960-44b9-a9de-ac350ee13158',
        //       request: { op: 'ping', args: null }
        //   }
        //
        //   { pong: 1653296711335 }
        //
        client.lastPong = this.safeInteger (message, 'pong');
        return message;
    }

    handleAuthenticate (client, message) {
        //
        //    {
        //        success: true,
        //        ret_msg: '',
        //        conn_id: '55f508ad-d17b-48d8-8b19-669280a25a72',
        //        request: {
        //          op: 'auth',
        //          args: [
        //            'cH4MQfkrFNKYiLfpVB',
        //            '1653038985746',
        //            'eede78af3eb916ffc569a5c1466b83e36034324f480ca2684728d17fb606acae'
        //          ]
        //        }
        //    }
        //
        // this will only be effective for swap markets,
        // spot markets don't have this 'authenticated' future
        client.resolve (message, 'authenticated');
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
        //
        return message;
    }
};
