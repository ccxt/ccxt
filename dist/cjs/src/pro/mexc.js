'use strict';

var mexc$1 = require('../mexc.js');
var errors = require('../base/errors.js');
var Cache = require('../base/ws/Cache.js');
var sha256 = require('../static_dependencies/noble-hashes/sha256.js');

// ----------------------------------------------------------------------------
//  ---------------------------------------------------------------------------
class mexc extends mexc$1 {
    describe() {
        return this.deepExtend(super.describe(), {
            'has': {
                'ws': true,
                'cancelAllOrdersWs': false,
                'cancelOrdersWs': false,
                'cancelOrderWs': false,
                'createOrderWs': false,
                'editOrderWs': false,
                'fetchBalanceWs': false,
                'fetchOpenOrdersWs': false,
                'fetchOrderWs': false,
                'fetchTradesWs': false,
                'watchBalance': true,
                'watchMyTrades': true,
                'watchOHLCV': true,
                'watchOrderBook': true,
                'watchOrders': true,
                'watchTicker': true,
                'watchTickers': true,
                'watchBidsAsks': true,
                'watchTrades': true,
                'watchTradesForSymbols': false,
            },
            'urls': {
                'api': {
                    'ws': {
                        'spot': 'wss://wbs.mexc.com/ws',
                        'swap': 'wss://contract.mexc.com/edge',
                    },
                },
            },
            'options': {
                'listenKeyRefreshRate': 1200000,
                // TODO add reset connection after #16754 is merged
                'timeframes': {
                    '1m': 'Min1',
                    '5m': 'Min5',
                    '15m': 'Min15',
                    '30m': 'Min30',
                    '1h': 'Min60',
                    '4h': 'Hour4',
                    '8h': 'Hour8',
                    '1d': 'Day1',
                    '1w': 'Week1',
                    '1M': 'Month1',
                },
                'watchOrderBook': {
                    'snapshotDelay': 25,
                    'snapshotMaxRetries': 3,
                },
                'listenKey': undefined,
            },
            'streaming': {
                'ping': this.ping,
                'keepAlive': 8000,
            },
            'exceptions': {},
        });
    }
    /**
     * @method
     * @name mexc#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#individual-symbol-book-ticker-streams
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#public-channels
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#miniticker
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.miniTicker] set to true for using the miniTicker endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchTicker(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const messageHash = 'ticker:' + market['symbol'];
        if (market['spot']) {
            let miniTicker = false;
            [miniTicker, params] = this.handleOptionAndParams(params, 'watchTicker', 'miniTicker');
            let channel = undefined;
            if (miniTicker) {
                channel = 'spot@public.miniTicker.v3.api@' + market['id'] + '@UTC+8';
            }
            else {
                channel = 'spot@public.bookTicker.v3.api@' + market['id'];
            }
            return await this.watchSpotPublic(channel, messageHash, params);
        }
        else {
            const channel = 'sub.ticker';
            const requestParams = {
                'symbol': market['id'],
            };
            return await this.watchSwapPublic(channel, messageHash, requestParams, params);
        }
    }
    handleTicker(client, message) {
        //
        // swap
        //
        //     {
        //         "symbol": "BTC_USDT",
        //         "data": {
        //             "symbol": "BTC_USDT",
        //             "lastPrice": 76376.2,
        //             "riseFallRate": -0.0006,
        //             "fairPrice": 76374.4,
        //             "indexPrice": 76385.8,
        //             "volume24": 962062810,
        //             "amount24": 7344207079.96768,
        //             "maxBidPrice": 84024.3,
        //             "minAskPrice": 68747.2,
        //             "lower24Price": 75620.2,
        //             "high24Price": 77210,
        //             "timestamp": 1731137509138,
        //             "bid1": 76376.2,
        //             "ask1": 76376.3,
        //             "holdVol": 95479623,
        //             "riseFallValue": -46.5,
        //             "fundingRate": 0.0001,
        //             "zone": "UTC+8",
        //             "riseFallRates": [ -0.0006, 0.1008, 0.2262, 0.2628, 0.2439, 1.0564 ],
        //             "riseFallRatesOfTimezone": [ 0.0065, -0.0013, -0.0006 ]
        //         },
        //         "channel": "push.ticker",
        //         "ts": 1731137509138
        //     }
        //
        // spot
        //
        //    {
        //        "c": "spot@public.bookTicker.v3.api@BTCUSDT",
        //        "d": {
        //            "A": "4.70432",
        //            "B": "6.714863",
        //            "a": "20744.54",
        //            "b": "20744.17"
        //        },
        //        "s": "BTCUSDT",
        //        "t": 1678643605721
        //    }
        //
        // spot miniTicker
        //
        //     {
        //         "d": {
        //             "s": "BTCUSDT",
        //             "p": "76522",
        //             "r": "0.0012",
        //             "tr": "0.0012",
        //             "h": "77196.3",
        //             "l": "75630.77",
        //             "v": "584664223.92",
        //             "q": "7666.720258",
        //             "lastRT": "-1",
        //             "MT": "0",
        //             "NV": "--",
        //             "t": "1731135533126"
        //         },
        //         "c": "spot@public.miniTicker.v3.api@BTCUSDT@UTC+8",
        //         "t": 1731135533126,
        //         "s": "BTCUSDT"
        //     }
        //
        this.handleBidAsk(client, message);
        const rawTicker = this.safeDict2(message, 'd', 'data');
        const marketId = this.safeString2(message, 's', 'symbol');
        const timestamp = this.safeInteger(message, 't');
        const market = this.safeMarket(marketId);
        const symbol = market['symbol'];
        let ticker = undefined;
        if (market['spot']) {
            ticker = this.parseWsTicker(rawTicker, market);
            ticker['timestamp'] = timestamp;
            ticker['datetime'] = this.iso8601(timestamp);
        }
        else {
            ticker = this.parseTicker(rawTicker, market);
        }
        this.tickers[symbol] = ticker;
        const messageHash = 'ticker:' + symbol;
        client.resolve(ticker, messageHash);
    }
    /**
     * @method
     * @name mexc#watchTickers
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#individual-symbol-book-ticker-streams
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#public-channels
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#minitickers
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.miniTicker] set to true for using the miniTicker endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchTickers(symbols = undefined, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols, undefined);
        const messageHashes = [];
        const firstSymbol = this.safeString(symbols, 0);
        let market = undefined;
        if (firstSymbol !== undefined) {
            market = this.market(firstSymbol);
        }
        let type = undefined;
        [type, params] = this.handleMarketTypeAndParams('watchTickers', market, params);
        const isSpot = (type === 'spot');
        const url = (isSpot) ? this.urls['api']['ws']['spot'] : this.urls['api']['ws']['swap'];
        const request = {};
        if (isSpot) {
            let miniTicker = false;
            [miniTicker, params] = this.handleOptionAndParams(params, 'watchTickers', 'miniTicker');
            const topics = [];
            if (!miniTicker) {
                if (symbols === undefined) {
                    throw new errors.ArgumentsRequired(this.id + ' watchTickers required symbols argument for the bookTicker channel');
                }
                const marketIds = this.marketIds(symbols);
                for (let i = 0; i < marketIds.length; i++) {
                    const marketId = marketIds[i];
                    messageHashes.push('ticker:' + symbols[i]);
                    const channel = 'spot@public.bookTicker.v3.api@' + marketId;
                    topics.push(channel);
                }
            }
            else {
                topics.push('spot@public.miniTickers.v3.api@UTC+8');
                if (symbols === undefined) {
                    messageHashes.push('spot:ticker');
                }
                else {
                    for (let i = 0; i < symbols.length; i++) {
                        messageHashes.push('ticker:' + symbols[i]);
                    }
                }
            }
            request['method'] = 'SUBSCRIPTION';
            request['params'] = topics;
        }
        else {
            request['method'] = 'sub.tickers';
            request['params'] = {};
            messageHashes.push('ticker');
        }
        const ticker = await this.watchMultiple(url, messageHashes, this.extend(request, params), messageHashes);
        if (isSpot && this.newUpdates) {
            const result = {};
            result[ticker['symbol']] = ticker;
            return result;
        }
        return this.filterByArray(this.tickers, 'symbol', symbols);
    }
    handleTickers(client, message) {
        //
        // swap
        //
        //     {
        //       "channel": "push.tickers",
        //       "data": [
        //         {
        //           "symbol": "ETH_USDT",
        //           "lastPrice": 2324.5,
        //           "riseFallRate": 0.0356,
        //           "fairPrice": 2324.32,
        //           "indexPrice": 2325.44,
        //           "volume24": 25868309,
        //           "amount24": 591752573.9792,
        //           "maxBidPrice": 2557.98,
        //           "minAskPrice": 2092.89,
        //           "lower24Price": 2239.39,
        //           "high24Price": 2332.59,
        //           "timestamp": 1725872514111
        //         }
        //       ],
        //       "ts": 1725872514111
        //     }
        //
        // spot
        //
        //    {
        //        "c": "spot@public.bookTicker.v3.api@BTCUSDT",
        //        "d": {
        //            "A": "4.70432",
        //            "B": "6.714863",
        //            "a": "20744.54",
        //            "b": "20744.17"
        //        },
        //        "s": "BTCUSDT",
        //        "t": 1678643605721
        //    }
        //
        // spot miniTicker
        //
        //     {
        //         "d": {
        //             "s": "BTCUSDT",
        //             "p": "76522",
        //             "r": "0.0012",
        //             "tr": "0.0012",
        //             "h": "77196.3",
        //             "l": "75630.77",
        //             "v": "584664223.92",
        //             "q": "7666.720258",
        //             "lastRT": "-1",
        //             "MT": "0",
        //             "NV": "--",
        //             "t": "1731135533126"
        //         },
        //         "c": "spot@public.miniTicker.v3.api@BTCUSDT@UTC+8",
        //         "t": 1731135533126,
        //         "s": "BTCUSDT"
        //     }
        //
        const data = this.safeList2(message, 'data', 'd');
        const channel = this.safeString(message, 'c', '');
        const marketId = this.safeString(message, 's');
        const market = this.safeMarket(marketId);
        const channelStartsWithSpot = channel.startsWith('spot');
        const marketIdIsUndefined = marketId === undefined;
        const isSpot = marketIdIsUndefined ? channelStartsWithSpot : market['spot'];
        const spotPrefix = 'spot:';
        const messageHashPrefix = isSpot ? spotPrefix : '';
        const topic = messageHashPrefix + 'ticker';
        const result = [];
        for (let i = 0; i < data.length; i++) {
            const entry = data[i];
            let ticker = undefined;
            if (isSpot) {
                ticker = this.parseWsTicker(entry, market);
            }
            else {
                ticker = this.parseTicker(entry);
            }
            const symbol = ticker['symbol'];
            this.tickers[symbol] = ticker;
            result.push(ticker);
            const messageHash = 'ticker:' + symbol;
            client.resolve(ticker, messageHash);
        }
        client.resolve(result, topic);
    }
    parseWsTicker(ticker, market = undefined) {
        //
        // spot
        //
        //     {
        //         "A": "4.70432",
        //         "B": "6.714863",
        //         "a": "20744.54",
        //         "b": "20744.17"
        //     }
        //
        // spot miniTicker
        //
        //     {
        //         "s": "BTCUSDT",
        //         "p": "76522",
        //         "r": "0.0012",
        //         "tr": "0.0012",
        //         "h": "77196.3",
        //         "l": "75630.77",
        //         "v": "584664223.92",
        //         "q": "7666.720258",
        //         "lastRT": "-1",
        //         "MT": "0",
        //         "NV": "--",
        //         "t": "1731135533126"
        //     }
        //
        const marketId = this.safeString(ticker, 's');
        const timestamp = this.safeInteger(ticker, 't');
        const price = this.safeString(ticker, 'p');
        return this.safeTicker({
            'info': ticker,
            'symbol': this.safeSymbol(marketId, market),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'open': undefined,
            'high': this.safeNumber(ticker, 'h'),
            'low': this.safeNumber(ticker, 'l'),
            'close': price,
            'last': price,
            'bid': this.safeNumber(ticker, 'b'),
            'bidVolume': this.safeNumber(ticker, 'B'),
            'ask': this.safeNumber(ticker, 'a'),
            'askVolume': this.safeNumber(ticker, 'A'),
            'vwap': undefined,
            'previousClose': undefined,
            'change': undefined,
            'percentage': this.safeNumber(ticker, 'tr'),
            'average': undefined,
            'baseVolume': this.safeNumber(ticker, 'v'),
            'quoteVolume': this.safeNumber(ticker, 'q'),
        }, market);
    }
    /**
     * @method
     * @name mexc#watchBidsAsks
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#individual-symbol-book-ticker-streams
     * @description watches best bid & ask for symbols
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchBidsAsks(symbols = undefined, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols, undefined, true, false, true);
        let marketType = undefined;
        if (symbols === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' watchBidsAsks required symbols argument');
        }
        const markets = this.marketsForSymbols(symbols);
        [marketType, params] = this.handleMarketTypeAndParams('watchBidsAsks', markets[0], params);
        const isSpot = marketType === 'spot';
        if (!isSpot) {
            throw new errors.NotSupported(this.id + ' watchBidsAsks only support spot market');
        }
        const messageHashes = [];
        const topics = [];
        for (let i = 0; i < symbols.length; i++) {
            if (isSpot) {
                const market = this.market(symbols[i]);
                topics.push('spot@public.bookTicker.v3.api@' + market['id']);
            }
            messageHashes.push('bidask:' + symbols[i]);
        }
        const url = this.urls['api']['ws']['spot'];
        const request = {
            'method': 'SUBSCRIPTION',
            'params': topics,
        };
        const ticker = await this.watchMultiple(url, messageHashes, this.extend(request, params), messageHashes);
        if (this.newUpdates) {
            const tickers = {};
            tickers[ticker['symbol']] = ticker;
            return tickers;
        }
        return this.filterByArray(this.bidsasks, 'symbol', symbols);
    }
    handleBidAsk(client, message) {
        //
        //    {
        //        "c": "spot@public.bookTicker.v3.api@BTCUSDT",
        //        "d": {
        //            "A": "4.70432",
        //            "B": "6.714863",
        //            "a": "20744.54",
        //            "b": "20744.17"
        //        },
        //        "s": "BTCUSDT",
        //        "t": 1678643605721
        //    }
        //
        const parsedTicker = this.parseWsBidAsk(message);
        const symbol = this.safeString(parsedTicker, 'symbol');
        if (symbol === undefined) {
            return;
        }
        this.bidsasks[symbol] = parsedTicker;
        const messageHash = 'bidask:' + symbol;
        client.resolve(parsedTicker, messageHash);
    }
    parseWsBidAsk(ticker, market = undefined) {
        const data = this.safeDict(ticker, 'd');
        const marketId = this.safeString(ticker, 's');
        market = this.safeMarket(marketId, market);
        const symbol = this.safeString(market, 'symbol');
        const timestamp = this.safeInteger(ticker, 't');
        return this.safeTicker({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'ask': this.safeNumber(data, 'a'),
            'askVolume': this.safeNumber(data, 'A'),
            'bid': this.safeNumber(data, 'b'),
            'bidVolume': this.safeNumber(data, 'B'),
            'info': ticker,
        }, market);
    }
    async watchSpotPublic(channel, messageHash, params = {}) {
        const url = this.urls['api']['ws']['spot'];
        const request = {
            'method': 'SUBSCRIPTION',
            'params': [channel],
        };
        return await this.watch(url, messageHash, this.extend(request, params), channel);
    }
    async watchSpotPrivate(channel, messageHash, params = {}) {
        this.checkRequiredCredentials();
        const listenKey = await this.authenticate(channel);
        const url = this.urls['api']['ws']['spot'] + '?listenKey=' + listenKey;
        const request = {
            'method': 'SUBSCRIPTION',
            'params': [channel],
        };
        return await this.watch(url, messageHash, this.extend(request, params), channel);
    }
    async watchSwapPublic(channel, messageHash, requestParams, params = {}) {
        const url = this.urls['api']['ws']['swap'];
        const request = {
            'method': channel,
            'param': requestParams,
        };
        const message = this.extend(request, params);
        return await this.watch(url, messageHash, message, messageHash);
    }
    async watchSwapPrivate(messageHash, params = {}) {
        this.checkRequiredCredentials();
        const channel = 'login';
        const url = this.urls['api']['ws']['swap'];
        const timestamp = this.milliseconds().toString();
        const payload = this.apiKey + timestamp;
        const signature = this.hmac(this.encode(payload), this.encode(this.secret), sha256.sha256);
        const request = {
            'method': channel,
            'param': {
                'apiKey': this.apiKey,
                'signature': signature,
                'reqTime': timestamp,
            },
        };
        const message = this.extend(request, params);
        return await this.watch(url, messageHash, message, channel);
    }
    /**
     * @method
     * @name mexc#watchOHLCV
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#kline-streams
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
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
        const timeframes = this.safeValue(this.options, 'timeframes', {});
        const timeframeId = this.safeString(timeframes, timeframe);
        const messageHash = 'candles:' + symbol + ':' + timeframe;
        let ohlcv = undefined;
        if (market['spot']) {
            const channel = 'spot@public.kline.v3.api@' + market['id'] + '@' + timeframeId;
            ohlcv = await this.watchSpotPublic(channel, messageHash, params);
        }
        else {
            const channel = 'sub.kline';
            const requestParams = {
                'symbol': market['id'],
                'interval': timeframeId,
            };
            ohlcv = await this.watchSwapPublic(channel, messageHash, requestParams, params);
        }
        if (this.newUpdates) {
            limit = ohlcv.getLimit(symbol, limit);
        }
        return this.filterBySinceLimit(ohlcv, since, limit, 0, true);
    }
    handleOHLCV(client, message) {
        //
        // spot
        //
        //    {
        //        "d": {
        //            "e": "spot@public.kline.v3.api",
        //            "k": {
        //                "t": 1678642261,
        //                "o": 20626.94,
        //                "c": 20599.69,
        //                "h": 20626.94,
        //                "l": 20597.06,
        //                "v": 27.678686,
        //                "a": 570332.77,
        //                "T": 1678642320,
        //                "i": "Min1"
        //            }
        //        },
        //        "c": "spot@public.kline.v3.api@BTCUSDT@Min1",
        //        "t": 1678642276459,
        //        "s": "BTCUSDT"
        //    }
        //
        // swap
        //
        //   {
        //       "channel": "push.kline",
        //       "data": {
        //         "a": 325653.3287,
        //         "c": 38839,
        //         "h": 38909.5,
        //         "interval": "Min1",
        //         "l": 38833,
        //         "o": 38901.5,
        //         "q": 83808,
        //         "rc": 38839,
        //         "rh": 38909.5,
        //         "rl": 38833,
        //         "ro": 38909.5,
        //         "symbol": "BTC_USDT",
        //         "t": 1651230660
        //       },
        //       "symbol": "BTC_USDT",
        //       "ts": 1651230713067
        //   }
        //
        const d = this.safeValue2(message, 'd', 'data', {});
        const rawOhlcv = this.safeValue(d, 'k', d);
        const timeframeId = this.safeString2(rawOhlcv, 'i', 'interval');
        const timeframes = this.safeValue(this.options, 'timeframes', {});
        const timeframe = this.findTimeframe(timeframeId, timeframes);
        const marketId = this.safeString2(message, 's', 'symbol');
        const market = this.safeMarket(marketId);
        const symbol = market['symbol'];
        const messageHash = 'candles:' + symbol + ':' + timeframe;
        const parsed = this.parseWsOHLCV(rawOhlcv, market);
        this.ohlcvs[symbol] = this.safeValue(this.ohlcvs, symbol, {});
        let stored = this.safeValue(this.ohlcvs[symbol], timeframe);
        if (stored === undefined) {
            const limit = this.safeInteger(this.options, 'OHLCVLimit', 1000);
            stored = new Cache.ArrayCacheByTimestamp(limit);
            this.ohlcvs[symbol][timeframe] = stored;
        }
        stored.append(parsed);
        client.resolve(stored, messageHash);
    }
    parseWsOHLCV(ohlcv, market = undefined) {
        //
        // spot
        //
        //    {
        //        "t": 1678642260,
        //        "o": 20626.94,
        //        "c": 20599.69,
        //        "h": 20626.94,
        //        "l": 20597.06,
        //        "v": 27.678686,
        //        "a": 570332.77,
        //        "T": 1678642320,
        //        "i": "Min1"
        //    }
        //
        // swap
        //    {
        //       "symbol": "BTC_USDT",
        //       "interval": "Min1",
        //       "t": 1680055080,
        //       "o": 27301.9,
        //       "c": 27301.8,
        //       "h": 27301.9,
        //       "l": 27301.8,
        //       "a": 8.19054,
        //       "q": 3,
        //       "ro": 27301.8,
        //       "rc": 27301.8,
        //       "rh": 27301.8,
        //       "rl": 27301.8
        //     }
        //
        return [
            this.safeTimestamp(ohlcv, 't'),
            this.safeNumber(ohlcv, 'o'),
            this.safeNumber(ohlcv, 'h'),
            this.safeNumber(ohlcv, 'l'),
            this.safeNumber(ohlcv, 'c'),
            this.safeNumber2(ohlcv, 'v', 'q'),
        ];
    }
    /**
     * @method
     * @name mexc#watchOrderBook
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#diff-depth-stream
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#public-channels
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async watchOrderBook(symbol, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        symbol = market['symbol'];
        const messageHash = 'orderbook:' + symbol;
        let orderbook = undefined;
        if (market['spot']) {
            const channel = 'spot@public.increase.depth.v3.api@' + market['id'];
            orderbook = await this.watchSpotPublic(channel, messageHash, params);
        }
        else {
            const channel = 'sub.depth';
            const requestParams = {
                'symbol': market['id'],
            };
            orderbook = await this.watchSwapPublic(channel, messageHash, requestParams, params);
        }
        return orderbook.limit();
    }
    handleOrderBookSubscription(client, message) {
        // spot
        //     { id: 0, code: 0, msg: "spot@public.increase.depth.v3.api@BTCUSDT" }
        //
        const msg = this.safeString(message, 'msg');
        const parts = msg.split('@');
        const marketId = this.safeString(parts, 2);
        const symbol = this.safeSymbol(marketId);
        this.orderbooks[symbol] = this.orderBook({});
    }
    getCacheIndex(orderbook, cache) {
        // return the first index of the cache that can be applied to the orderbook or -1 if not possible
        const nonce = this.safeInteger(orderbook, 'nonce');
        const firstDelta = this.safeValue(cache, 0);
        const firstDeltaNonce = this.safeInteger2(firstDelta, 'r', 'version');
        if (nonce < firstDeltaNonce - 1) {
            return -1;
        }
        for (let i = 0; i < cache.length; i++) {
            const delta = cache[i];
            const deltaNonce = this.safeInteger2(delta, 'r', 'version');
            if (deltaNonce >= nonce) {
                return i;
            }
        }
        return cache.length;
    }
    handleOrderBook(client, message) {
        //
        // spot
        //    {
        //        "c": "spot@public.increase.depth.v3.api@BTCUSDT",
        //        "d": {
        //            "asks": [{
        //                "p": "20290.89",
        //                "v": "0.000000"
        //            }],
        //            "e": "spot@public.increase.depth.v3.api",
        //            "r": "3407459756"
        //        },
        //        "s": "BTCUSDT",
        //        "t": 1661932660144
        //    }
        //
        //
        //
        // swap
        //  {
        //      "channel":"push.depth",
        //      "data":{
        //         "asks":[
        //            [
        //               39146.5,
        //               11264,
        //               1
        //            ]
        //         ],
        //         "bids":[
        //            [
        //               39144,
        //               35460,
        //               1
        //            ]
        //         ],
        //         "end":4895965272,
        //         "begin":4895965271
        //      },
        //      "symbol":"BTC_USDT",
        //      "ts":1651239652372
        //  }
        //
        const data = this.safeValue2(message, 'd', 'data');
        const marketId = this.safeString2(message, 's', 'symbol');
        const symbol = this.safeSymbol(marketId);
        const messageHash = 'orderbook:' + symbol;
        const subscription = this.safeValue(client.subscriptions, messageHash);
        const limit = this.safeInteger(subscription, 'limit');
        if (subscription === true) {
            // we set client.subscriptions[messageHash] to 1
            // once we have received the first delta and initialized the orderbook
            client.subscriptions[messageHash] = 1;
            this.orderbooks[symbol] = this.countedOrderBook({});
        }
        const storedOrderBook = this.orderbooks[symbol];
        const nonce = this.safeInteger(storedOrderBook, 'nonce');
        if (nonce === undefined) {
            const cacheLength = storedOrderBook.cache.length;
            const snapshotDelay = this.handleOption('watchOrderBook', 'snapshotDelay', 25);
            if (cacheLength === snapshotDelay) {
                this.spawn(this.loadOrderBook, client, messageHash, symbol, limit, {});
            }
            storedOrderBook.cache.push(data);
            return;
        }
        try {
            this.handleDelta(storedOrderBook, data);
            const timestamp = this.safeInteger2(message, 't', 'ts');
            storedOrderBook['timestamp'] = timestamp;
            storedOrderBook['datetime'] = this.iso8601(timestamp);
        }
        catch (e) {
            delete client.subscriptions[messageHash];
            client.reject(e, messageHash);
        }
        client.resolve(storedOrderBook, messageHash);
    }
    handleBooksideDelta(bookside, bidasks) {
        //
        //    [{
        //        "p": "20290.89",
        //        "v": "0.000000"
        //    }]
        //
        for (let i = 0; i < bidasks.length; i++) {
            const bidask = bidasks[i];
            if (Array.isArray(bidask)) {
                bookside.storeArray(bidask);
            }
            else {
                const price = this.safeFloat(bidask, 'p');
                const amount = this.safeFloat(bidask, 'v');
                bookside.store(price, amount);
            }
        }
    }
    handleDelta(orderbook, delta) {
        const existingNonce = this.safeInteger(orderbook, 'nonce');
        const deltaNonce = this.safeInteger2(delta, 'r', 'version');
        if (deltaNonce < existingNonce) {
            // even when doing < comparison, this happens: https://app.travis-ci.com/github/ccxt/ccxt/builds/269234741#L1809
            // so, we just skip old updates
            return;
        }
        orderbook['nonce'] = deltaNonce;
        const asks = this.safeList(delta, 'asks', []);
        const bids = this.safeList(delta, 'bids', []);
        const asksOrderSide = orderbook['asks'];
        const bidsOrderSide = orderbook['bids'];
        this.handleBooksideDelta(asksOrderSide, asks);
        this.handleBooksideDelta(bidsOrderSide, bids);
    }
    /**
     * @method
     * @name mexc#watchTrades
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#trade-streams
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#public-channels
     * @description get the list of most recent trades for a particular symbol
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async watchTrades(symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        symbol = market['symbol'];
        const messageHash = 'trades:' + symbol;
        let trades = undefined;
        if (market['spot']) {
            const channel = 'spot@public.deals.v3.api@' + market['id'];
            trades = await this.watchSpotPublic(channel, messageHash, params);
        }
        else {
            const channel = 'sub.deal';
            const requestParams = {
                'symbol': market['id'],
            };
            trades = await this.watchSwapPublic(channel, messageHash, requestParams, params);
        }
        if (this.newUpdates) {
            limit = trades.getLimit(symbol, limit);
        }
        return this.filterBySinceLimit(trades, since, limit, 'timestamp', true);
    }
    handleTrades(client, message) {
        //
        //    {
        //        "c": "spot@public.deals.v3.api@BTCUSDT",
        //        "d": {
        //            "deals": [{
        //                "p": "20382.70",
        //                "v": "0.043800",
        //                "S": 1,
        //                "t": 1678593222456,
        //            }, ],
        //            "e": "spot@public.deals.v3.api",
        //        },
        //        "s": "BTCUSDT",
        //        "t": 1678593222460,
        //    }
        //
        // swap
        //     {
        //         "symbol": "BTC_USDT",
        //         "data": {
        //             "p": 27307.3,
        //             "v": 5,
        //             "T": 2,
        //             "O": 3,
        //             "M": 1,
        //             "t": 1680055941870
        //         },
        //         "channel": "push.deal",
        //         "ts": 1680055941870
        //     }
        //
        const marketId = this.safeString2(message, 's', 'symbol');
        const market = this.safeMarket(marketId);
        const symbol = market['symbol'];
        const messageHash = 'trades:' + symbol;
        let stored = this.safeValue(this.trades, symbol);
        if (stored === undefined) {
            const limit = this.safeInteger(this.options, 'tradesLimit', 1000);
            stored = new Cache.ArrayCache(limit);
            this.trades[symbol] = stored;
        }
        const d = this.safeValue2(message, 'd', 'data');
        const trades = this.safeValue(d, 'deals', [d]);
        for (let j = 0; j < trades.length; j++) {
            let parsedTrade = undefined;
            if (market['spot']) {
                parsedTrade = this.parseWsTrade(trades[j], market);
            }
            else {
                parsedTrade = this.parseTrade(trades[j], market);
            }
            stored.append(parsedTrade);
        }
        client.resolve(stored, messageHash);
    }
    /**
     * @method
     * @name mexc#watchMyTrades
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#spot-account-deals
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#private-channels
     * @description watches information on multiple trades made by the user
     * @param {string} symbol unified market symbol of the market trades were made in
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async watchMyTrades(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let messageHash = 'myTrades';
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            symbol = market['symbol'];
            messageHash = messageHash + ':' + symbol;
        }
        let type = undefined;
        [type, params] = this.handleMarketTypeAndParams('watchMyTrades', market, params);
        let trades = undefined;
        if (type === 'spot') {
            const channel = 'spot@private.deals.v3.api';
            trades = await this.watchSpotPrivate(channel, messageHash, params);
        }
        else {
            trades = await this.watchSwapPrivate(messageHash, params);
        }
        if (this.newUpdates) {
            limit = trades.getLimit(symbol, limit);
        }
        return this.filterBySymbolSinceLimit(trades, symbol, since, limit, true);
    }
    handleMyTrade(client, message, subscription = undefined) {
        //
        //    {
        //        "c": "spot@private.deals.v3.api",
        //        "d": {
        //            "p": "22339.99",
        //            "v": "0.000235",
        //            "S": 1,
        //            "T": 1678670940695,
        //            "t": "9f6a47fb926442e496c5c4c104076ae3",
        //            "c": '',
        //            "i": "e2b9835d1b6745f8a10ab74a81a16d50",
        //            "m": 0,
        //            "st": 0
        //        },
        //        "s": "BTCUSDT",
        //        "t": 1678670940700
        //    }
        //
        const messageHash = 'myTrades';
        const data = this.safeValue2(message, 'd', 'data');
        const futuresMarketId = this.safeString(data, 'symbol');
        const marketId = this.safeString(message, 's', futuresMarketId);
        const market = this.safeMarket(marketId);
        const symbol = market['symbol'];
        let trade = undefined;
        if (market['spot']) {
            trade = this.parseWsTrade(data, market);
        }
        else {
            trade = this.parseTrade(data, market);
        }
        let trades = this.myTrades;
        if (trades === undefined) {
            const limit = this.safeInteger(this.options, 'tradesLimit', 1000);
            trades = new Cache.ArrayCacheBySymbolById(limit);
            this.myTrades = trades;
        }
        trades.append(trade);
        client.resolve(trades, messageHash);
        const symbolSpecificMessageHash = messageHash + ':' + symbol;
        client.resolve(trades, symbolSpecificMessageHash);
    }
    parseWsTrade(trade, market = undefined) {
        //
        // public trade
        //    {
        //        "p": "20382.70",
        //        "v": "0.043800",
        //        "S": 1,
        //        "t": 1678593222456,
        //    }
        // private trade
        //    {
        //        "S": 1,
        //        "T": 1661938980268,
        //        "c": "",
        //        "i": "c079b0fcb80a46e8b128b281ce4e4f38",
        //        "m": 1,
        //        "p": "1.008",
        //        "st": 0,
        //        "t": "4079b1522a0b40e7919f609e1ea38d44",
        //        "v": "5"
        //    }
        //
        //
        //   d: {
        //       p: '1.0005',
        //       v: '5.71',
        //       a: '5.712855',
        //       S: 1,
        //       T: 1714325698237,
        //       t: 'edafcd9fdc2f426e82443d114691f724',
        //       c: '',
        //       i: 'C02__413321238354677760043',
        //       m: 0,
        //       st: 0,
        //       n: '0.005712855',
        //       N: 'USDT'
        //   }
        let timestamp = this.safeInteger(trade, 'T');
        let tradeId = this.safeString(trade, 't');
        if (timestamp === undefined) {
            timestamp = this.safeInteger(trade, 't');
            tradeId = undefined;
        }
        const priceString = this.safeString(trade, 'p');
        const amountString = this.safeString(trade, 'v');
        const rawSide = this.safeString(trade, 'S');
        const side = (rawSide === '1') ? 'buy' : 'sell';
        const isMaker = this.safeInteger(trade, 'm');
        const feeAmount = this.safeNumber(trade, 'n');
        const feeCurrencyId = this.safeString(trade, 'N');
        return this.safeTrade({
            'info': trade,
            'id': tradeId,
            'order': this.safeString(trade, 'i'),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'symbol': this.safeSymbol(undefined, market),
            'type': undefined,
            'side': side,
            'takerOrMaker': (isMaker) ? 'maker' : 'taker',
            'price': priceString,
            'amount': amountString,
            'cost': undefined,
            'fee': {
                'cost': feeAmount,
                'currency': this.safeCurrencyCode(feeCurrencyId),
            },
        }, market);
    }
    /**
     * @method
     * @name mexc#watchOrders
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#spot-account-orders
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#margin-account-orders
     * @description watches information on multiple orders made by the user
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string|undefined} params.type the type of orders to retrieve, can be 'spot' or 'margin'
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async watchOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        params = this.omit(params, 'type');
        let messageHash = 'orders';
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            symbol = market['symbol'];
            messageHash = messageHash + ':' + symbol;
        }
        let type = undefined;
        [type, params] = this.handleMarketTypeAndParams('watchOrders', market, params);
        let orders = undefined;
        if (type === 'spot') {
            const channel = type + '@private.orders.v3.api';
            orders = await this.watchSpotPrivate(channel, messageHash, params);
        }
        else {
            orders = await this.watchSwapPrivate(messageHash, params);
        }
        if (this.newUpdates) {
            limit = orders.getLimit(symbol, limit);
        }
        return this.filterBySymbolSinceLimit(orders, symbol, since, limit, true);
    }
    handleOrder(client, message) {
        //
        // spot
        //    {
        //        "c": "spot@private.orders.v3.api",
        //        "d": {
        //              "A":8.0,
        //              "O":1661938138000,
        //              "S":1,
        //              "V":10,
        //              "a":8,
        //              "c":"",
        //              "i":"e03a5c7441e44ed899466a7140b71391",
        //              "m":0,
        //              "o":1,
        //              "p":0.8,
        //              "s":1,
        //              "v":10,
        //              "ap":0,
        //              "cv":0,
        //              "ca":0
        //        },
        //        "s": "MXUSDT",
        //        "t": 1661938138193
        //    }
        // spot - stop
        //    {
        //        "c": "spot@private.orders.v3.api",
        //        "d": {
        //              "N":"USDT",
        //              "O":1661938853715,
        //              "P":0.9,
        //              "S":1,
        //              "T":"LE",
        //              "i":"f6d82e5f41d745f59fe9d3cafffd80b5",
        //              "o":100,
        //              "p":1.01,
        //              "s":"NEW",
        //              "v":6
        //        },
        //        "s": "MXUSDT",
        //        "t": 1661938853727
        //    }
        // margin
        //    {
        //        "c": "margin@private.orders.v3.api",
        //        "d":{
        //             "O":1661938138000,
        //             "p":"0.8",
        //             "a":"8",
        //             "v":"10",
        //            "da":"0",
        //            "dv":"0",
        //             "A":"8.0",
        //             "V":"10",
        //             "n": "0",
        //             "N": "USDT",
        //             "S":1,
        //             "o":1,
        //             "s":1,
        //             "i":"e03a5c7441e44ed899466a7140b71391",
        //        },
        //        "s": "MXUSDT",
        //        "t":1661938138193
        //    }
        //
        const messageHash = 'orders';
        const data = this.safeValue2(message, 'd', 'data');
        const futuresMarketId = this.safeString(data, 'symbol');
        const marketId = this.safeString(message, 's', futuresMarketId);
        const market = this.safeMarket(marketId);
        const symbol = market['symbol'];
        let parsed = undefined;
        if (market['spot']) {
            parsed = this.parseWsOrder(data, market);
        }
        else {
            parsed = this.parseOrder(data, market);
        }
        let orders = this.orders;
        if (orders === undefined) {
            const limit = this.safeInteger(this.options, 'ordersLimit', 1000);
            orders = new Cache.ArrayCacheBySymbolById(limit);
            this.orders = orders;
        }
        orders.append(parsed);
        client.resolve(orders, messageHash);
        const symbolSpecificMessageHash = messageHash + ':' + symbol;
        client.resolve(orders, symbolSpecificMessageHash);
    }
    parseWsOrder(order, market = undefined) {
        //
        // spot
        //     {
        //          "A":8.0,
        //          "O":1661938138000,
        //          "S":1,
        //          "V":10,
        //          "a":8,
        //          "c":"",
        //          "i":"e03a5c7441e44ed899466a7140b71391",
        //          "m":0,
        //          "o":1,
        //          "p":0.8,
        //          "s":1,
        //          "v":10,
        //          "ap":0,
        //          "cv":0,
        //          "ca":0
        //    }
        // spot - stop
        //    {
        //        "N":"USDT",
        //        "O":1661938853715,
        //        "P":0.9,
        //        "S":1,
        //        "T":"LE",
        //        "i":"f6d82e5f41d745f59fe9d3cafffd80b5",
        //        "o":100,
        //        "p":1.01,
        //        "s":"NEW",
        //        "v":6
        //    }
        // margin
        //    {
        //        "O":1661938138000,
        //        "p":"0.8",
        //        "a":"8",
        //        "v":"10",
        //       "da":"0",
        //       "dv":"0",
        //        "A":"8.0",
        //        "V":"10",
        //        "n": "0",
        //        "N": "USDT",
        //        "S":1,
        //        "o":1,
        //        "s":1,
        //        "i":"e03a5c7441e44ed899466a7140b71391",
        //    }
        //
        const timestamp = this.safeInteger(order, 'O');
        const side = this.safeString(order, 'S');
        const status = this.safeString(order, 's');
        const type = this.safeString(order, 'o');
        let fee = undefined;
        const feeCurrency = this.safeString(order, 'N');
        if (feeCurrency !== undefined) {
            fee = {
                'currency': feeCurrency,
                'cost': undefined,
            };
        }
        return this.safeOrder({
            'id': this.safeString(order, 'i'),
            'clientOrderId': this.safeString(order, 'c'),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'lastTradeTimestamp': undefined,
            'status': this.parseWsOrderStatus(status, market),
            'symbol': this.safeSymbol(undefined, market),
            'type': this.parseWsOrderType(type),
            'timeInForce': this.parseWsTimeInForce(type),
            'side': (side === '1') ? 'buy' : 'sell',
            'price': this.safeString(order, 'p'),
            'stopPrice': undefined,
            'triggerPrice': this.safeNumber(order, 'P'),
            'average': this.safeString(order, 'ap'),
            'amount': this.safeString(order, 'v'),
            'cost': this.safeString(order, 'a'),
            'filled': this.safeString(order, 'cv'),
            'remaining': this.safeString(order, 'V'),
            'fee': fee,
            'trades': undefined,
            'info': order,
        }, market);
    }
    parseWsOrderStatus(status, market = undefined) {
        const statuses = {
            '1': 'open',
            '2': 'closed',
            '3': 'open',
            '4': 'canceled',
            '5': 'closed',
            'NEW': 'open',
            'CANCELED': 'canceled',
            'EXECUTED': 'closed',
            'FAILED': 'rejected',
        };
        return this.safeString(statuses, status, status);
    }
    parseWsOrderType(type) {
        const types = {
            '1': 'limit',
            '2': undefined,
            '3': undefined,
            '4': undefined,
            '5': 'market',
            '100': 'limit', // STOP_LIMIT
        };
        return this.safeString(types, type);
    }
    parseWsTimeInForce(timeInForce) {
        const timeInForceIds = {
            '1': 'GTC',
            '2': 'PO',
            '3': 'IOC',
            '4': 'FOK',
            '5': 'GTC',
            '100': 'GTC', // STOP_LIMIT
        };
        return this.safeString(timeInForceIds, timeInForce);
    }
    /**
     * @method
     * @name mexc#watchBalance
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#spot-account-upadte
     * @description watch balance and get the amount of funds available for trading or funds locked in orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    async watchBalance(params = {}) {
        await this.loadMarkets();
        let type = undefined;
        [type, params] = this.handleMarketTypeAndParams('watchBalance', undefined, params);
        const messageHash = 'balance:' + type;
        if (type === 'spot') {
            const channel = 'spot@private.account.v3.api';
            return await this.watchSpotPrivate(channel, messageHash, params);
        }
        else {
            return await this.watchSwapPrivate(messageHash, params);
        }
    }
    handleBalance(client, message) {
        //
        // spot
        //    {
        //        "c": "spot@private.account.v3.api",
        //        "d": {
        //            "a": "USDT",
        //            "c": 1678185928428,
        //            "f": "302.185113007893322435",
        //            "fd": "-4.990689704",
        //            "l": "4.990689704",
        //            "ld": "4.990689704",
        //            "o": "ENTRUST_PLACE"
        //        },
        //        "t": 1678185928435
        //    }
        //
        //
        // swap balance
        //
        //     {
        //         "channel": "push.personal.asset",
        //         "data": {
        //             "availableBalance": 67.2426683348,
        //             "bonus": 0,
        //             "currency": "USDT",
        //             "frozenBalance": 0,
        //             "positionMargin": 1.36945756
        //         },
        //         "ts": 1680059188190
        //     }
        //
        const c = this.safeString(message, 'c');
        const type = (c === undefined) ? 'swap' : 'spot';
        const messageHash = 'balance:' + type;
        const data = this.safeValue2(message, 'd', 'data');
        const futuresTimestamp = this.safeInteger(message, 'ts');
        const timestamp = this.safeInteger(data, 'c', futuresTimestamp);
        if (!(type in this.balance)) {
            this.balance[type] = {};
        }
        this.balance[type]['info'] = data;
        this.balance[type]['timestamp'] = timestamp;
        this.balance[type]['datetime'] = this.iso8601(timestamp);
        const currencyId = this.safeString2(data, 'a', 'currency');
        const code = this.safeCurrencyCode(currencyId);
        const account = this.account();
        account['free'] = this.safeString2(data, 'f', 'availableBalance');
        account['used'] = this.safeString2(data, 'l', 'frozenBalance');
        this.balance[type][code] = account;
        this.balance[type] = this.safeBalance(this.balance[type]);
        client.resolve(this.balance[type], messageHash);
    }
    async authenticate(subscriptionHash, params = {}) {
        // we only need one listenKey since ccxt shares connections
        let listenKey = this.safeString(this.options, 'listenKey');
        if (listenKey !== undefined) {
            return listenKey;
        }
        const response = await this.spotPrivatePostUserDataStream(params);
        //
        //    {
        //        "listenKey": "pqia91ma19a5s61cv6a81va65sdf19v8a65a1a5s61cv6a81va65sdf19v8a65a1"
        //    }
        //
        listenKey = this.safeString(response, 'listenKey');
        this.options['listenKey'] = listenKey;
        const listenKeyRefreshRate = this.safeInteger(this.options, 'listenKeyRefreshRate', 1200000);
        this.delay(listenKeyRefreshRate, this.keepAliveListenKey, listenKey, params);
        return listenKey;
    }
    async keepAliveListenKey(listenKey, params = {}) {
        if (listenKey === undefined) {
            return;
        }
        const request = {
            'listenKey': listenKey,
        };
        try {
            await this.spotPrivatePutUserDataStream(this.extend(request, params));
            const listenKeyRefreshRate = this.safeInteger(this.options, 'listenKeyRefreshRate', 1200000);
            this.delay(listenKeyRefreshRate, this.keepAliveListenKey, listenKey, params);
        }
        catch (error) {
            const url = this.urls['api']['ws']['spot'] + '?listenKey=' + listenKey;
            const client = this.client(url);
            this.options['listenKey'] = undefined;
            client.reject(error);
            delete this.clients[url];
        }
    }
    handlePong(client, message) {
        client.lastPong = this.milliseconds();
        return message;
    }
    handleSubscriptionStatus(client, message) {
        //
        //    {
        //        "id": 0,
        //        "code": 0,
        //        "msg": "spot@public.increase.depth.v3.api@BTCUSDT"
        //    }
        // Set the default to an empty string if the message is empty during the test.
        const msg = this.safeString(message, 'msg', '');
        if (msg === 'PONG') {
            this.handlePong(client, message);
        }
        else if (msg.indexOf('@') > -1) {
            const parts = msg.split('@');
            const channel = this.safeString(parts, 1);
            const methods = {
                'public.increase.depth.v3.api': this.handleOrderBookSubscription,
            };
            const method = this.safeValue(methods, channel);
            if (method !== undefined) {
                method.call(this, client, message);
            }
        }
    }
    handleMessage(client, message) {
        if (typeof message === 'string') {
            if (message === 'Invalid listen key') {
                const error = new errors.AuthenticationError(this.id + ' invalid listen key');
                client.reject(error);
            }
            return;
        }
        if ('msg' in message) {
            this.handleSubscriptionStatus(client, message);
            return;
        }
        const c = this.safeString(message, 'c');
        let channel = undefined;
        if (c === undefined) {
            channel = this.safeString(message, 'channel');
        }
        else {
            const parts = c.split('@');
            channel = this.safeString(parts, 1);
        }
        const methods = {
            'public.deals.v3.api': this.handleTrades,
            'push.deal': this.handleTrades,
            'public.kline.v3.api': this.handleOHLCV,
            'push.kline': this.handleOHLCV,
            'public.bookTicker.v3.api': this.handleTicker,
            'public.miniTicker.v3.api': this.handleTicker,
            'public.miniTickers.v3.api': this.handleTickers,
            'push.ticker': this.handleTicker,
            'push.tickers': this.handleTickers,
            'public.increase.depth.v3.api': this.handleOrderBook,
            'push.depth': this.handleOrderBook,
            'private.orders.v3.api': this.handleOrder,
            'push.personal.order': this.handleOrder,
            'private.account.v3.api': this.handleBalance,
            'push.personal.asset': this.handleBalance,
            'private.deals.v3.api': this.handleMyTrade,
            'push.personal.order.deal': this.handleMyTrade,
            'pong': this.handlePong,
        };
        if (channel in methods) {
            const method = methods[channel];
            method.call(this, client, message);
        }
    }
    ping(client) {
        return { 'method': 'ping' };
    }
}

module.exports = mexc;
