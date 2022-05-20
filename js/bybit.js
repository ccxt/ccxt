'use strict';

//  ---------------------------------------------------------------------------

const ccxt = require ('ccxt');
// BadSymbol, BadRequest
const { AuthenticationError, BadRequest } = require ('ccxt/js/base/errors');
const Precise = require ('ccxt/js/base/Precise');
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
                'watchTicker': {
                    'name': 'realtimes', // or bookTicker
                },
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
            [ type, params ] = this.handleMarketTypeAndParams ('fetchPositions', undefined, params);
            const defaultSubType = this.safeString (this.options, 'defaultSubType', 'linear');
            const subType = this.safeString (params, 'subType', defaultSubType);
            let defaultSettle = this.safeString (this.options, 'defaultSettle');
            defaultSettle = this.safeString2 (params, 'settle', 'defaultSettle', defaultSettle);
            isUsdcSettled = (defaultSettle === 'USDC');
            isSpot = (type === 'spot');
            isLinear = (subType === 'linear');
            params = this.omit (params, [ 'settle', 'defaultSettle', 'subType' ]);
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
        return [url, params];
    }

    async watchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const messageHash = 'ticker:' + market['symbol'];
        let url = undefined;
        [ url, params ] = this.getUrlByMarketType (symbol, false, params);
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
            return await this.watchSwapPublic (url, messageHash, reqParams, params);
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
        const type = this.safeString (message, 'type', '');
        const data = this.safeValue (message, 'data', {});
        let symbol = undefined;
        if (type === 'snapshot') {
            const parsed = this.parseWsTicker (data);
            symbol = parsed['symbol'];
            this.tickers[symbol] = parsed;
        }
        if (type === 'delta') {
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
            timestamp = this.parse8601 (this.safeString (ticker, 'updated_at'));
        }
        const marketId = this.safeString2 (ticker, 'symbol', 's');
        const symbol = this.safeSymbol (marketId, market);
        const last = this.safeString2 (ticker, 'l', 'last_price');
        const open = this.safeString2 (ticker, 'prev_price_24h', 'o');
        let baseVolume = this.safeStringN (ticker, ['v', 'turnover24h']);
        if (baseVolume === undefined) {
            baseVolume = this.safeString (ticker, 'turnover_24h_e8');
            baseVolume = Precise.stringDiv (baseVolume, '100000000');
        }
        let quoteVolume = this.safeString2 (ticker, 'qv', 'volume24h');
        if (quoteVolume === undefined) {
            quoteVolume = this.safeString (ticker, 'volume_24h_e8');
        }
        const bid = this.safeStringN (ticker, ['bidPrice', 'bid1_price']);
        const ask = this.safeStringN (ticker, ['askPrice', 'ask1_price']);
        const high = this.safeStringN (ticker, ['high_price_24h', 'high24h', 'h']);
        const low = this.safeStringN (ticker, ['low_price_24h', 'low24h', 'l']);
        let percentage = this.safeString (ticker, 'm');
        if (percentage === undefined) {
            percentage = this.safeString (ticker, 'price_24h_pcnt_e6');
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
        }, market, false);
    }

    async watchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const interval = this.timeframes[timeframe];
        let url = undefined;
        [ url, params ] = this.getUrlByMarketType (symbol, false, params);
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
        //      timestamp: '1652893152874413',
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
        return [
            this.safeInteger2 (ohlcv, 'timestamp', 't'),
            this.safeNumber2 (ohlcv, 'open', 'o'),
            this.safeNumber2 (ohlcv, 'high', 'h'),
            this.safeNumber2 (ohlcv, 'low', 'l'),
            this.safeNumber2 (ohlcv, 'close', 'c'),
            this.safeNumber2 (ohlcv, 'volume', 'v'),
        ];
    }

    async watchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        let url = undefined;
        [ url, params ] = this.getUrlByMarketType (symbol, false, params);
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
            orderbook = await this.watchSwapPublic (url, messageHash, reqParams, params);
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
                const rawOrderBook = this.safeValue2 (data, 'order_book', 'orderBook');
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
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        let url = undefined;
        const commonChannel = 'trade';
        [ url, params ] = this.getUrlByMarketType (symbol, false, params);
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
            trades = await this.watchSwapPublic (url, messageHash, reqParams, params);
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
        // swap
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
        // spot
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
        const id = this.safeStringN (trade, ['trade_id', 'v', 'tradeId']);
        const marketId = this.safeString (trade, 'symbol');
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        const amountString = this.safeString2 (trade, 'q', 'size');
        const priceString = this.safeString2 (trade, 'p', 'price');
        const costString = this.safeString (trade, 'exec_value');
        const timestamp = this.safeNumberN (trade, ['trade_time_ms', 't', 'tradeTime', 'tradeTimeMs']);
        const side = this.safeStringLower (trade, 'side');
        const isMaker = this.safeValue (trade, 'm');
        const takerOrMaker = isMaker ? 'maker' : 'taker';
        return this.safeTrade ({
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': undefined,
            'type': undefined,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': priceString,
            'amount': amountString,
            'cost': costString,
            'fee': undefined,
        }, market);
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
        if (!this.handleErrorMessage (client, message)) {
            return;
        }
        const event = this.safeString (message, 'event');
        if (event === 'sub') {
            this.handleSubscriptionStatus (client, message);
            return;
        }
        const topic = this.safeString (message, 'topic', '');
        if ((topic.indexOf ('kline') >= 0 || topic.indexOf ('candle') >= 0)) {
            this.handleOHLCV (client, message);
            return;
        }
        if ((topic.indexOf ('realtimes') >= 0 || topic.indexOf ('instrument_info') >= 0)) {
            this.handleTicker (client, message);
            return;
        }
        if (topic.indexOf ('trade') >= 0) {
            this.handleTrades (client, message);
            return;
        }
        if (topic.indexOf ('orderBook') >= 0) {
            this.handleOrderBook (client, message);
            return;
        }
        const methods = {
            'realtimes': this.handleTicker,
            'bookTicker': this.handleTicker,
            'depth': this.handleOrderBook,
            // 'order': this.handleOrder,
            // 'wallet': this.handleBalance,
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
