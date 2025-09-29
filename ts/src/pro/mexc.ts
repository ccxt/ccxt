
//  ---------------------------------------------------------------------------

import mexcRest from '../mexc.js';
import { ArgumentsRequired, AuthenticationError, NotSupported } from '../base/errors.js';
import { ArrayCache, ArrayCacheBySymbolById, ArrayCacheByTimestamp } from '../base/ws/Cache.js';
import { sha256 } from '../static_dependencies/noble-hashes/sha256.js';
import type { Int, OHLCV, Str, OrderBook, Order, Trade, Ticker, Balances, Dict, Tickers, Strings } from '../base/types.js';
import Client from '../base/ws/Client.js';

//  ---------------------------------------------------------------------------

export default class mexc extends mexcRest {
    describe (): any {
        return this.deepExtend (super.describe (), {
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
                'unWatchTicker': true,
                'unWatchTickers': true,
                'unWatchBidsAsks': true,
                'unWatchOHLCV': true,
                'unWatchOrderBook': true,
                'unWatchTrades': true,
            },
            'urls': {
                'api': {
                    'ws': {
                        'spot': 'wss://wbs-api.mexc.com/ws',
                        'swap': 'wss://contract.mexc.com/edge',
                    },
                },
            },
            'options': {
                'listenKeyRefreshRate': 1200000,
                'decompressBinary': false,
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
            'exceptions': {
            },
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
    async watchTicker (symbol: string, params = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const messageHash = 'ticker:' + market['symbol'];
        if (market['spot']) {
            const channel = 'spot@public.aggre.bookTicker.v3.api.pb@100ms@' + market['id'];
            return await this.watchSpotPublic (channel, messageHash, params);
        } else {
            const channel = 'sub.ticker';
            const requestParams: Dict = {
                'symbol': market['id'],
            };
            return await this.watchSwapPublic (channel, messageHash, requestParams, params);
        }
    }

    handleTicker (client: Client, message) {
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
        this.handleBidAsk (client, message);
        const rawTicker = this.safeDictN (message, [ 'd', 'data', 'publicAggreBookTicker' ]);
        const marketId = this.safeString2 (message, 's', 'symbol');
        const timestamp = this.safeInteger2 (message, 't', 'sendTime');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        let ticker = undefined;
        if (market['spot']) {
            ticker = this.parseWsTicker (rawTicker, market);
            ticker['timestamp'] = timestamp;
            ticker['datetime'] = this.iso8601 (timestamp);
        } else {
            ticker = this.parseTicker (rawTicker, market);
        }
        this.tickers[symbol] = ticker;
        const messageHash = 'ticker:' + symbol;
        client.resolve (ticker, messageHash);
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
    async watchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols, undefined);
        const messageHashes = [];
        const firstSymbol = this.safeString (symbols, 0);
        let market = undefined;
        if (firstSymbol !== undefined) {
            market = this.market (firstSymbol);
        }
        let type = undefined;
        [ type, params ] = this.handleMarketTypeAndParams ('watchTickers', market, params);
        const isSpot = (type === 'spot');
        const url = (isSpot) ? this.urls['api']['ws']['spot'] : this.urls['api']['ws']['swap'];
        const request: Dict = {};
        if (isSpot) {
            throw new NotSupported (this.id + ' watchTickers does not support spot markets');
            // let miniTicker = false;
            // [ miniTicker, params ] = this.handleOptionAndParams (params, 'watchTickers', 'miniTicker');
            // const topics = [];
            // if (!miniTicker) {
            //     if (symbols === undefined) {
            //         throw new ArgumentsRequired (this.id + ' watchTickers required symbols argument for the bookTicker channel');
            //     }
            //     const marketIds = this.marketIds (symbols);
            //     for (let i = 0; i < marketIds.length; i++) {
            //         const marketId = marketIds[i];
            //         messageHashes.push ('ticker:' + symbols[i]);
            //         const channel = 'spot@public.bookTicker.v3.api@' + marketId;
            //         topics.push (channel);
            //     }
            // } else {
            //     topics.push ('spot@public.miniTickers.v3.api@UTC+8');
            //     if (symbols === undefined) {
            //         messageHashes.push ('spot:ticker');
            //     } else {
            //         for (let i = 0; i < symbols.length; i++) {
            //             messageHashes.push ('ticker:' + symbols[i]);
            //         }
            //     }
            // }
            // request['method'] = 'SUBSCRIPTION';
            // request['params'] = topics;
        } else {
            request['method'] = 'sub.tickers';
            request['params'] = {};
            messageHashes.push ('ticker');
        }
        const ticker = await this.watchMultiple (url, messageHashes, this.extend (request, params), messageHashes);
        if (isSpot && this.newUpdates) {
            const result: Dict = {};
            result[ticker['symbol']] = ticker;
            return result;
        }
        return this.filterByArray (this.tickers, 'symbol', symbols);
    }

    handleTickers (client: Client, message) {
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
        const data = this.safeList2 (message, 'data', 'd');
        const channel = this.safeString (message, 'c', '');
        const marketId = this.safeString (message, 's');
        const market = this.safeMarket (marketId);
        const channelStartsWithSpot = channel.startsWith ('spot');
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
                ticker = this.parseWsTicker (entry, market);
            } else {
                ticker = this.parseTicker (entry);
            }
            const symbol = ticker['symbol'];
            this.tickers[symbol] = ticker;
            result.push (ticker);
            const messageHash = 'ticker:' + symbol;
            client.resolve (ticker, messageHash);
        }
        client.resolve (result, topic);
    }

    parseWsTicker (ticker, market = undefined) {
        // protobuf ticker
        // "bidprice": "93387.28",  // Best bid price
        // "bidquantity": "3.73485", // Best bid quantity
        // "askprice": "93387.29", // Best ask price
        // "askquantity": "7.669875" // Best ask quantity
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
        //         "p": "76521",
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
        const marketId = this.safeString (ticker, 's');
        const timestamp = this.safeInteger (ticker, 't');
        const price = this.safeString (ticker, 'p');
        return this.safeTicker ({
            'info': ticker,
            'symbol': this.safeSymbol (marketId, market),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'open': undefined,
            'high': this.safeNumber (ticker, 'h'),
            'low': this.safeNumber (ticker, 'l'),
            'close': price,
            'last': price,
            'bid': this.safeNumber2 (ticker, 'b', 'bidPrice'),
            'bidVolume': this.safeNumber2 (ticker, 'B', 'bidQuantity'),
            'ask': this.safeNumber2 (ticker, 'a', 'askPrice'),
            'askVolume': this.safeNumber2 (ticker, 'A', 'askQuantity'),
            'vwap': undefined,
            'previousClose': undefined,
            'change': undefined,
            'percentage': this.safeNumber (ticker, 'tr'),
            'average': undefined,
            'baseVolume': this.safeNumber (ticker, 'v'),
            'quoteVolume': this.safeNumber (ticker, 'q'),
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
    async watchBidsAsks (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols, undefined, true, false, true);
        let marketType = undefined;
        if (symbols === undefined) {
            throw new ArgumentsRequired (this.id + ' watchBidsAsks required symbols argument');
        }
        const markets = this.marketsForSymbols (symbols);
        [ marketType, params ] = this.handleMarketTypeAndParams ('watchBidsAsks', markets[0], params);
        const isSpot = marketType === 'spot';
        if (!isSpot) {
            throw new NotSupported (this.id + ' watchBidsAsks only support spot market');
        }
        const messageHashes = [];
        const topics = [];
        for (let i = 0; i < symbols.length; i++) {
            if (isSpot) {
                const market = this.market (symbols[i]);
                topics.push ('spot@public.aggre.bookTicker.v3.api.pb@100ms@' + market['id']);
            }
            messageHashes.push ('bidask:' + symbols[i]);
        }
        const url = this.urls['api']['ws']['spot'];
        const request: Dict = {
            'method': 'SUBSCRIPTION',
            'params': topics,
        };
        const ticker = await this.watchMultiple (url, messageHashes, this.extend (request, params), messageHashes);
        if (this.newUpdates) {
            const tickers: Dict = {};
            tickers[ticker['symbol']] = ticker;
            return tickers;
        }
        return this.filterByArray (this.bidsasks, 'symbol', symbols);
    }

    handleBidAsk (client: Client, message) {
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
        const parsedTicker = this.parseWsBidAsk (message);
        const symbol = this.safeString (parsedTicker, 'symbol');
        if (symbol === undefined) {
            return;
        }
        this.bidsasks[symbol] = parsedTicker;
        const messageHash = 'bidask:' + symbol;
        client.resolve (parsedTicker, messageHash);
    }

    parseWsBidAsk (ticker, market = undefined) {
        const data = this.safeDict (ticker, 'd');
        const marketId = this.safeString (ticker, 's');
        market = this.safeMarket (marketId, market);
        const symbol = this.safeString (market, 'symbol');
        const timestamp = this.safeInteger (ticker, 't');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'ask': this.safeNumber (data, 'a'),
            'askVolume': this.safeNumber (data, 'A'),
            'bid': this.safeNumber (data, 'b'),
            'bidVolume': this.safeNumber (data, 'B'),
            'info': ticker,
        }, market);
    }

    async watchSpotPublic (channel, messageHash, params = {}) {
        const unsubscribed = this.safeBool (params, 'unsubscribed', false);
        params = this.omit (params, [ 'unsubscribed' ]);
        const url = this.urls['api']['ws']['spot'];
        const method = (unsubscribed) ? 'UNSUBSCRIPTION' : 'SUBSCRIPTION';
        const request: Dict = {
            'method': method,
            'params': [ channel ],
        };
        return await this.watch (url, messageHash, this.extend (request, params), messageHash);
    }

    async watchSpotPrivate (channel, messageHash, params = {}) {
        this.checkRequiredCredentials ();
        const listenKey = await this.authenticate (channel);
        const url = this.urls['api']['ws']['spot'] + '?listenKey=' + listenKey;
        const request: Dict = {
            'method': 'SUBSCRIPTION',
            'params': [ channel ],
        };
        return await this.watch (url, messageHash, this.extend (request, params), channel);
    }

    async watchSwapPublic (channel, messageHash, requestParams, params = {}) {
        const url = this.urls['api']['ws']['swap'];
        const request: Dict = {
            'method': channel,
            'param': requestParams,
        };
        const message = this.extend (request, params);
        return await this.watch (url, messageHash, message, messageHash);
    }

    async watchSwapPrivate (messageHash, params = {}) {
        this.checkRequiredCredentials ();
        const channel = 'login';
        const url = this.urls['api']['ws']['swap'];
        const timestamp = this.milliseconds ().toString ();
        const payload = this.apiKey + timestamp;
        const signature = this.hmac (this.encode (payload), this.encode (this.secret), sha256);
        const request: Dict = {
            'method': channel,
            'param': {
                'apiKey': this.apiKey,
                'signature': signature,
                'reqTime': timestamp,
            },
        };
        const message = this.extend (request, params);
        return await this.watch (url, messageHash, message, channel);
    }

    /**
     * @method
     * @name mexc#watchOHLCV
     * @see https://www.mexc.com/api-docs/spot-v3/websocket-market-streams#trade-streams
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async watchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const timeframes = this.safeValue (this.options, 'timeframes', {});
        const timeframeId = this.safeString (timeframes, timeframe);
        const messageHash = 'candles:' + symbol + ':' + timeframe;
        let ohlcv = undefined;
        if (market['spot']) {
            const channel = 'spot@public.kline.v3.api.pb@' + market['id'] + '@' + timeframeId;
            ohlcv = await this.watchSpotPublic (channel, messageHash, params);
        } else {
            const channel = 'sub.kline';
            const requestParams: Dict = {
                'symbol': market['id'],
                'interval': timeframeId,
            };
            ohlcv = await this.watchSwapPublic (channel, messageHash, requestParams, params);
        }
        if (this.newUpdates) {
            limit = ohlcv.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (ohlcv, since, limit, 0, true);
    }

    handleOHLCV (client: Client, message) {
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
        // protobuf
        //  {
        //    "channel":"spot@public.kline.v3.api.pb@BTCUSDT@Min1",
        //    "symbol":"BTCUSDT",
        //    "symbolId":"2fb942154ef44a4ab2ef98c8afb6a4a7",
        //    "createTime":"1754737941062",
        //    "publicSpotKline":{
        //       "interval":"Min1",
        //       "windowStart":"1754737920",
        //       "openingPrice":"117317.31",
        //       "closingPrice":"117325.26",
        //       "highestPrice":"117341",
        //       "lowestPrice":"117317.3",
        //       "volume":"3.12599854",
        //       "amount":"366804.43",
        //       "windowEnd":"1754737980"
        //    }
        // }
        //
        let parsed: Dict = undefined;
        let symbol: Str = undefined;
        let timeframe: Str = undefined;
        if ('publicSpotKline' in message) {
            symbol = this.symbol (this.safeString (message, 'symbol'));
            const data = this.safeDict (message, 'publicSpotKline', {});
            const timeframeId = this.safeString (data, 'interval');
            timeframe = this.findTimeframe (timeframeId, this.options['timeframes']);
            parsed = this.parseWsOHLCV (data, this.safeMarket (symbol));
        } else {
            const d = this.safeValue2 (message, 'd', 'data', {});
            const rawOhlcv = this.safeValue (d, 'k', d);
            const timeframeId = this.safeString2 (rawOhlcv, 'i', 'interval');
            const timeframes = this.safeValue (this.options, 'timeframes', {});
            timeframe = this.findTimeframe (timeframeId, timeframes);
            const marketId = this.safeString2 (message, 's', 'symbol');
            const market = this.safeMarket (marketId);
            symbol = market['symbol'];
            parsed = this.parseWsOHLCV (rawOhlcv, market);
        }
        const messageHash = 'candles:' + symbol + ':' + timeframe;
        this.ohlcvs[symbol] = this.safeValue (this.ohlcvs, symbol, {});
        let stored = this.safeValue (this.ohlcvs[symbol], timeframe);
        if (stored === undefined) {
            const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
            stored = new ArrayCacheByTimestamp (limit);
            this.ohlcvs[symbol][timeframe] = stored;
        }
        stored.append (parsed);
        client.resolve (stored, messageHash);
    }

    parseWsOHLCV (ohlcv, market = undefined): OHLCV {
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
        // protobuf
        //
        //       "interval":"Min1",
        //       "windowStart":"1754737920",
        //       "openingPrice":"117317.31",
        //       "closingPrice":"117325.26",
        //       "highestPrice":"117341",
        //       "lowestPrice":"117317.3",
        //       "volume":"3.12599854",
        //       "amount":"366804.43",
        //       "windowEnd":"1754737980"
        //
        return [
            this.safeTimestamp2 (ohlcv, 't', 'windowStart'),
            this.safeNumber2 (ohlcv, 'o', 'openingPrice'),
            this.safeNumber2 (ohlcv, 'h', 'highestPrice'),
            this.safeNumber2 (ohlcv, 'l', 'lowestPrice'),
            this.safeNumber2 (ohlcv, 'c', 'closingPrice'),
            this.safeNumber2 (ohlcv, 'v', 'volume'),
        ];
    }

    /**
     * @method
     * @name mexc#watchOrderBook
     * @see https://www.mexc.com/api-docs/spot-v3/websocket-market-streams#trade-streams
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#public-channels
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.frequency] the frequency of the order book updates, default is '10ms', can be '100ms' or '10ms
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async watchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const messageHash = 'orderbook:' + symbol;
        let orderbook = undefined;
        if (market['spot']) {
            let frequency = undefined;
            [ frequency, params ] = this.handleOptionAndParams (params, 'watchOrderBook', 'frequency', '100ms');
            const channel = 'spot@public.aggre.depth.v3.api.pb@' + frequency + '@' + market['id'];
            orderbook = await this.watchSpotPublic (channel, messageHash, params);
        } else {
            const channel = 'sub.depth';
            const requestParams: Dict = {
                'symbol': market['id'],
            };
            orderbook = await this.watchSwapPublic (channel, messageHash, requestParams, params);
        }
        return orderbook.limit ();
    }

    handleOrderBookSubscription (client: Client, message) {
        // spot
        //     { id: 0, code: 0, msg: "spot@public.increase.depth.v3.api@BTCUSDT" }
        //
        const msg = this.safeString (message, 'msg');
        const parts = msg.split ('@');
        const marketId = this.safeString (parts, 2);
        const symbol = this.safeSymbol (marketId);
        this.orderbooks[symbol] = this.orderBook ({});
    }

    getCacheIndex (orderbook, cache) {
        // return the first index of the cache that can be applied to the orderbook or -1 if not possible
        const nonce = this.safeInteger (orderbook, 'nonce');
        const firstDelta = this.safeValue (cache, 0);
        const firstDeltaNonce = this.safeIntegerN (firstDelta, [ 'r', 'version', 'fromVersion' ]);
        if (nonce < firstDeltaNonce - 1) {
            return -1;
        }
        for (let i = 0; i < cache.length; i++) {
            const delta = cache[i];
            const deltaNonce = this.safeIntegerN (delta, [ 'r', 'version', 'fromVersion' ]);
            if (deltaNonce >= nonce) {
                return i;
            }
        }
        return cache.length;
    }

    handleOrderBook (client: Client, message) {
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
        // protofbuf
        // {
        //      "channel":"spot@public.aggre.depth.v3.api.pb@100ms@BTCUSDT",
        //      "symbol":"BTCUSDT",
        //      "sendTime":"1754741322152",
        //      "publicAggreDepths":{
        //          "asks":[
        //              {
        //                  "price":"117145.49",
        //                  "quantity":"0"
        //              }
        //          ],
        //          "bids":[
        //              {
        //                  "price":"117053.41",
        //                  "quantity":"1.86837271"
        //              }
        //          ],
        //          "eventType":"spot@public.aggre.depth.v3.api.pb@100ms",
        //          "fromVersion":"43296363236",
        //          "toVersion":"43296363255"
        //      }
        // }
        //
        const data = this.safeDictN (message, [ 'd', 'data', 'publicAggreDepths' ]);
        const marketId = this.safeString2 (message, 's', 'symbol');
        const symbol = this.safeSymbol (marketId);
        const messageHash = 'orderbook:' + symbol;
        const subscription = this.safeValue (client.subscriptions, messageHash);
        const limit = this.safeInteger (subscription, 'limit');
        if (!(symbol in this.orderbooks)) {
            this.orderbooks[symbol] = this.orderBook ();
        }
        const storedOrderBook = this.orderbooks[symbol];
        const nonce = this.safeInteger (storedOrderBook, 'nonce');
        if (nonce === undefined) {
            const cacheLength = storedOrderBook.cache.length;
            const snapshotDelay = this.handleOption ('watchOrderBook', 'snapshotDelay', 25);
            if (cacheLength === snapshotDelay) {
                this.spawn (this.loadOrderBook, client, messageHash, symbol, limit, {});
            }
            storedOrderBook.cache.push (data);
            return;
        }
        try {
            this.handleDelta (storedOrderBook, data);
            const timestamp = this.safeIntegerN (message, [ 't', 'ts', 'sendTime' ]);
            storedOrderBook['timestamp'] = timestamp;
            storedOrderBook['datetime'] = this.iso8601 (timestamp);
        } catch (e) {
            delete client.subscriptions[messageHash];
            client.reject (e, messageHash);
            return;
        }
        client.resolve (storedOrderBook, messageHash);
    }

    handleBooksideDelta (bookside, bidasks) {
        //
        //    [{
        //        "p": "20290.89",
        //        "v": "0.000000"
        //    }]
        //
        for (let i = 0; i < bidasks.length; i++) {
            const bidask = bidasks[i];
            if (Array.isArray (bidask)) {
                bookside.storeArray (bidask);
            } else {
                const price = this.safeFloat2 (bidask, 'p', 'price');
                const amount = this.safeFloat2 (bidask, 'v', 'quantity');
                bookside.store (price, amount);
            }
        }
    }

    handleDelta (orderbook, delta) {
        const existingNonce = this.safeInteger (orderbook, 'nonce');
        const deltaNonce = this.safeIntegerN (delta, [ 'r', 'version', 'fromVersion' ]);
        if (deltaNonce < existingNonce) {
            // even when doing < comparison, this happens: https://app.travis-ci.com/github/ccxt/ccxt/builds/269234741#L1809
            // so, we just skip old updates
            return;
        }
        orderbook['nonce'] = deltaNonce;
        const asks = this.safeList (delta, 'asks', []);
        const bids = this.safeList (delta, 'bids', []);
        const asksOrderSide = orderbook['asks'];
        const bidsOrderSide = orderbook['bids'];
        this.handleBooksideDelta (asksOrderSide, asks);
        this.handleBooksideDelta (bidsOrderSide, bids);
    }

    /**
     * @method
     * @name mexc#watchTrades
     * @see https://www.mexc.com/api-docs/spot-v3/websocket-market-streams#trade-streams
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#public-channels
     * @description get the list of most recent trades for a particular symbol
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const messageHash = 'trades:' + symbol;
        let trades = undefined;
        if (market['spot']) {
            const channel = 'spot@public.aggre.deals.v3.api.pb@100ms@' + market['id'];
            trades = await this.watchSpotPublic (channel, messageHash, params);
        } else {
            const channel = 'sub.deal';
            const requestParams: Dict = {
                'symbol': market['id'],
            };
            trades = await this.watchSwapPublic (channel, messageHash, requestParams, params);
        }
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    handleTrades (client: Client, message) {
        // protobuf
        // {
        // "channel": "spot@public.aggre.deals.v3.api.pb@100ms@BTCUSDT",
        // "publicdeals": {
        //     "dealsList": [
        //     {
        //         "price": "93220.00", // Trade price
        //         "quantity": "0.04438243", // Trade quantity
        //         "tradetype": 2, // Trade type (1: Buy, 2: Sell)
        //         "time": 1736409765051 // Trade time
        //     }
        //     ],
        //     "eventtype": "spot@public.aggre.deals.v3.api.pb@100ms" // Event type
        // },
        // "symbol": "BTCUSDT", // Trading pair
        // "sendtime": 1736409765052 // Event time
        // }
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
        const marketId = this.safeString2 (message, 's', 'symbol');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const messageHash = 'trades:' + symbol;
        let stored = this.safeValue (this.trades, symbol);
        if (stored === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            stored = new ArrayCache (limit);
            this.trades[symbol] = stored;
        }
        const d = this.safeDictN (message, [ 'd', 'data', 'publicAggreDeals' ]);
        const trades = this.safeList2 (d, 'deals', 'dealsList', [ d ]);
        for (let j = 0; j < trades.length; j++) {
            let parsedTrade = undefined;
            if (market['spot']) {
                parsedTrade = this.parseWsTrade (trades[j], market);
            } else {
                parsedTrade = this.parseTrade (trades[j], market);
            }
            stored.append (parsedTrade);
        }
        client.resolve (stored, messageHash);
    }

    /**
     * @method
     * @name mexc#watchMyTrades
     * @see https://www.mexc.com/api-docs/spot-v3/websocket-user-data-streams#spot-account-deals
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#private-channels
     * @description watches information on multiple trades made by the user
     * @param {string} symbol unified market symbol of the market trades were made in
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async watchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        let messageHash = 'myTrades';
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            symbol = market['symbol'];
            messageHash = messageHash + ':' + symbol;
        }
        let type = undefined;
        [ type, params ] = this.handleMarketTypeAndParams ('watchMyTrades', market, params);
        let trades = undefined;
        if (type === 'spot') {
            const channel = 'spot@private.deals.v3.api.pb';
            trades = await this.watchSpotPrivate (channel, messageHash, params);
        } else {
            trades = await this.watchSwapPrivate (messageHash, params);
        }
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (trades, symbol, since, limit, true);
    }

    handleMyTrade (client: Client, message, subscription = undefined) {
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
        //    {
        //      channel: "spot@private.deals.v3.api.pb",
        //      symbol: "MXUSDT",
        //      sendTime: 1736417034332,
        //      privateDeals {
        //        price: "3.6962",
        //        quantity: "1",
        //        amount: "3.6962",
        //        tradeType: 2,
        //        tradeId: "505979017439002624X1",
        //        orderId: "C02__505979017439002624115",
        //        feeAmount: "0.0003998377369698171",
        //        feeCurrency: "MX",
        //        time: 1736417034280
        //      }
        // }
        //
        const messageHash = 'myTrades';
        const data = this.safeDictN (message, [ 'd', 'data', 'privateDeals' ]);
        const futuresMarketId = this.safeString (data, 'symbol');
        const marketId = this.safeString2 (message, 's', 'symbol', futuresMarketId);
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        let trade = undefined;
        if (market['spot']) {
            trade = this.parseWsTrade (data, market);
        } else {
            trade = this.parseTrade (data, market);
        }
        let trades = this.myTrades;
        if (trades === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            trades = new ArrayCacheBySymbolById (limit);
            this.myTrades = trades;
        }
        trades.append (trade);
        client.resolve (trades, messageHash);
        const symbolSpecificMessageHash = messageHash + ':' + symbol;
        client.resolve (trades, symbolSpecificMessageHash);
    }

    parseWsTrade (trade, market = undefined) {
        //
        // public trade (protobuf)
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
        // protobuf
        //
        //     {
        //        price: "3.6962",
        //        quantity: "1",
        //        amount: "3.6962",
        //        tradeType: 2,
        //        tradeId: "505979017439002624X1",
        //        orderId: "C02__505979017439002624115",
        //        feeAmount: "0.0003998377369698171",
        //        feeCurrency: "MX",
        //        time: 1736417034280
        //      }
        //
        let timestamp = this.safeInteger2 (trade, 'T', 'time');
        let tradeId = this.safeString2 (trade, 't', 'tradeId');
        if (timestamp === undefined) {
            timestamp = this.safeInteger (trade, 't');
            tradeId = undefined;
        }
        const priceString = this.safeString2 (trade, 'p', 'price');
        const amountString = this.safeString2 (trade, 'v', 'quantity');
        const rawSide = this.safeString2 (trade, 'S', 'tradeType');
        const side = (rawSide === '1') ? 'buy' : 'sell';
        const isMaker = this.safeInteger (trade, 'm');
        const feeAmount = this.safeString2 (trade, 'n', 'feeAmount');
        const feeCurrencyId = this.safeString2 (trade, 'N', 'feeCurrency');
        return this.safeTrade ({
            'info': trade,
            'id': tradeId,
            'order': this.safeString2 (trade, 'i', 'orderId'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': this.safeSymbol (undefined, market),
            'type': undefined,
            'side': side,
            'takerOrMaker': (isMaker) ? 'maker' : 'taker',
            'price': priceString,
            'amount': amountString,
            'cost': this.safeString (trade, 'amount'),
            'fee': {
                'cost': feeAmount,
                'currency': this.safeCurrencyCode (feeCurrencyId),
            },
        }, market);
    }

    /**
     * @method
     * @name mexc#watchOrders
     * @see https://www.mexc.com/api-docs/spot-v3/websocket-user-data-streams#spot-account-orders
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#margin-account-orders
     * @description watches information on multiple orders made by the user
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string|undefined} params.type the type of orders to retrieve, can be 'spot' or 'margin'
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async watchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        let messageHash = 'orders';
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            symbol = market['symbol'];
            messageHash = messageHash + ':' + symbol;
        }
        let type = undefined;
        [ type, params ] = this.handleMarketTypeAndParams ('watchOrders', market, params);
        let orders = undefined;
        if (type === 'spot') {
            const channel = 'spot@private.orders.v3.api.pb';
            orders = await this.watchSpotPrivate (channel, messageHash, params);
        } else {
            orders = await this.watchSwapPrivate (messageHash, params);
        }
        if (this.newUpdates) {
            limit = orders.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (orders, symbol, since, limit, true);
    }

    handleOrder (client: Client, message) {
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
        // protobuf
        //   {
        //      channel: "spot@private.orders.v3.api.pb",
        //      symbol: "MXUSDT",
        //      sendTime: 1736417034281,
        //      privateOrders {}
        //   }
        //
        const messageHash = 'orders';
        const data = this.safeDictN (message, [ 'd', 'data', 'privateOrders' ]);
        const futuresMarketId = this.safeString (data, 'symbol');
        const marketId = this.safeString2 (message, 's', 'symbol', futuresMarketId);
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        let parsed = undefined;
        if (market['spot']) {
            parsed = this.parseWsOrder (data, market);
        } else {
            parsed = this.parseOrder (data, market);
        }
        let orders = this.orders;
        if (orders === undefined) {
            const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
            orders = new ArrayCacheBySymbolById (limit);
            this.orders = orders;
        }
        orders.append (parsed);
        client.resolve (orders, messageHash);
        const symbolSpecificMessageHash = messageHash + ':' + symbol;
        client.resolve (orders, symbolSpecificMessageHash);
    }

    parseWsOrder (order, market = undefined) {
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
        // protofbuf spot order
        // {
        //     "id":"C02__583905164440776704043",
        //     "price":"0.001053",
        //     "quantity":"2000",
        //     "amount":"0",
        //     "avgPrice":"0.001007",
        //     "orderType":5,
        //     "tradeType":1,
        //     "remainAmount":"0.092",
        //     "remainQuantity":"0",
        //     "lastDealQuantity":"2000",
        //     "cumulativeQuantity":"2000",
        //     "cumulativeAmount":"2.014",
        //     "status":2,
        //     "createTime":"1754996075502"
        // }
        //
        const timestamp = this.safeInteger (order, 'createTime');
        const side = this.safeString (order, 'tradeType');
        const status = this.safeString (order, 'status');
        const type = this.safeString (order, 'orderType');
        let fee = undefined;
        const feeCurrency = this.safeString (order, 'N');
        if (feeCurrency !== undefined) {
            fee = {
                'currency': feeCurrency,
                'cost': undefined,
            };
        }
        return this.safeOrder ({
            'id': this.safeString (order, 'id'),
            'clientOrderId': this.safeString (order, 'clientId'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'status': this.parseWsOrderStatus (status, market),
            'symbol': this.safeSymbol (undefined, market),
            'type': this.parseWsOrderType (type),
            'timeInForce': this.parseWsTimeInForce (type),
            'side': (side === '1') ? 'buy' : 'sell',
            'price': this.safeString (order, 'price'),
            'stopPrice': undefined,
            'triggerPrice': undefined,
            'average': this.safeString (order, 'avgPrice'),
            'amount': this.safeString (order, 'quantity'),
            'cost': this.safeString (order, 'amount'),
            'filled': this.safeString (order, 'cumulativeQuantity'),
            'remaining': this.safeString (order, 'remainQuantity'),
            'fee': fee,
            'trades': undefined,
            'info': order,
        }, market);
    }

    parseWsOrderStatus (status, market = undefined) {
        const statuses: Dict = {
            '1': 'open',     // new order
            '2': 'closed',   // filled
            '3': 'open',     // partially filled
            '4': 'canceled', // canceled
            '5': 'closed',   // partially filled then canceled
            'NEW': 'open',
            'CANCELED': 'canceled',
            'EXECUTED': 'closed',
            'FAILED': 'rejected',
        };
        return this.safeString (statuses, status, status);
    }

    parseWsOrderType (type) {
        const types: Dict = {
            '1': 'limit',   // LIMIT_ORDER
            '2': 'limit', // POST_ONLY
            '3': undefined, // IMMEDIATE_OR_CANCEL
            '4': undefined, // FILL_OR_KILL
            '5': 'market',  // MARKET_ORDER
            '100': 'limit', // STOP_LIMIT
        };
        return this.safeString (types, type);
    }

    parseWsTimeInForce (timeInForce) {
        const timeInForceIds: Dict = {
            '1': 'GTC',   // LIMIT_ORDER
            '2': 'PO', // POST_ONLY
            '3': 'IOC', // IMMEDIATE_OR_CANCEL
            '4': 'FOK', // FILL_OR_KILL
            '5': 'GTC',  // MARKET_ORDER
            '100': 'GTC', // STOP_LIMIT
        };
        return this.safeString (timeInForceIds, timeInForce);
    }

    /**
     * @method
     * @name mexc#watchBalance
     * @see https://www.mexc.com/api-docs/spot-v3/websocket-user-data-streams#spot-account-update
     * @description watch balance and get the amount of funds available for trading or funds locked in orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    async watchBalance (params = {}): Promise<Balances> {
        await this.loadMarkets ();
        let type = undefined;
        [ type, params ] = this.handleMarketTypeAndParams ('watchBalance', undefined, params);
        const messageHash = 'balance:' + type;
        if (type === 'spot') {
            const channel = 'spot@private.account.v3.api.pb';
            return await this.watchSpotPrivate (channel, messageHash, params);
        } else {
            return await this.watchSwapPrivate (messageHash, params);
        }
    }

    handleBalance (client: Client, message) {
        //
        // spot
        //
        //    {
        //        channel: "spot@private.account.v3.api.pb",
        //        createTime: "1758134605364",
        //        sendTime: "1758134605373",
        //        privateAccount: {
        //          vcoinName: "USDT",
        //          coinId: "128f589271cb4951b03e71e6323eb7be",
        //          balanceAmount: "0.006016465074677006",
        //          balanceAmountChange: "-4.4022",
        //          frozenAmount: "4.4022",
        //          frozenAmountChange: "4.4022",
        //          type: "ENTRUST_PLACE",
        //          time: "1758134605364",
        //       }
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
        const channel = this.safeString (message, 'channel');
        const type = (channel === 'spot@private.account.v3.api.pb') ? 'spot' : 'swap';
        const messageHash = 'balance:' + type;
        const data = this.safeDictN (message, [ 'data', 'privateAccount' ]);
        const futuresTimestamp = this.safeInteger2 (message, 'ts', 'createTime');
        const timestamp = this.safeInteger2 (data, 'time', futuresTimestamp);
        if (!(type in this.balance)) {
            this.balance[type] = {};
        }
        this.balance[type]['info'] = data;
        this.balance[type]['timestamp'] = timestamp;
        this.balance[type]['datetime'] = this.iso8601 (timestamp);
        const currencyId = this.safeStringN (data, [ 'currency', 'vcoinName' ]);
        const code = this.safeCurrencyCode (currencyId);
        const account = this.account ();
        account['free'] = this.safeString2 (data, 'balanceAmount', 'availableBalance');
        account['used'] = this.safeStringN (data, [ 'frozenBalance', 'frozenAmount' ]);
        this.balance[type][code] = account;
        this.balance[type] = this.safeBalance (this.balance[type]);
        client.resolve (this.balance[type], messageHash);
    }

    /**
     * @method
     * @name mexc#unWatchTicker
     * @description unWatches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async unWatchTicker (symbol: string, params = {}): Promise<any> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const messageHash = 'unsubscribe:ticker:' + market['symbol'];
        let url = undefined;
        let channel = undefined;
        if (market['spot']) {
            channel = 'spot@public.aggre.bookTicker.v3.api.pb@100ms@' + market['id'];
            url = this.urls['api']['ws']['spot'];
            params['unsubscribed'] = true;
            this.watchSpotPublic (channel, messageHash, params);
        } else {
            channel = 'unsub.ticker';
            const requestParams: Dict = {
                'symbol': market['id'],
            };
            url = this.urls['api']['ws']['swap'];
            this.watchSwapPublic (channel, messageHash, requestParams, params);
        }
        const client = this.client (url);
        this.handleUnsubscriptions (client, [ messageHash ]);
        return undefined;
    }

    /**
     * @method
     * @name mexc#unWatchTickers
     * @description unWatches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async unWatchTickers (symbols: Strings = undefined, params = {}): Promise<any> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols, undefined);
        const messageHashes = [];
        const firstSymbol = this.safeString (symbols, 0);
        let market = undefined;
        if (firstSymbol !== undefined) {
            market = this.market (firstSymbol);
        }
        let type = undefined;
        [ type, params ] = this.handleMarketTypeAndParams ('watchTickers', market, params);
        const isSpot = (type === 'spot');
        const url = (isSpot) ? this.urls['api']['ws']['spot'] : this.urls['api']['ws']['swap'];
        const request: Dict = {};
        if (isSpot) {
            throw new NotSupported (this.id + ' watchTickers does not support spot markets');
            // let miniTicker = false;
            // [ miniTicker, params ] = this.handleOptionAndParams (params, 'watchTickers', 'miniTicker');
            // const topics = [];
            // if (!miniTicker) {
            //     if (symbols === undefined) {
            //         throw new ArgumentsRequired (this.id + ' watchTickers required symbols argument for the bookTicker channel');
            //     }
            //     const marketIds = this.marketIds (symbols);
            //     for (let i = 0; i < marketIds.length; i++) {
            //         const marketId = marketIds[i];
            //         messageHashes.push ('unsubscribe:ticker:' + symbols[i]);
            //         const channel = 'spot@public.bookTicker.v3.api@' + marketId;
            //         topics.push (channel);
            //     }
            // } else {
            //     topics.push ('spot@public.miniTickers.v3.api@UTC+8');
            //     if (symbols === undefined) {
            //         messageHashes.push ('unsubscribe:spot:ticker');
            //     } else {
            //         for (let i = 0; i < symbols.length; i++) {
            //             messageHashes.push ('unsubscribe:ticker:' + symbols[i]);
            //         }
            //     }
            // }
            // request['method'] = 'UNSUBSCRIPTION';
            // request['params'] = topics;
        } else {
            request['method'] = 'unsub.tickers';
            request['params'] = {};
            messageHashes.push ('unsubscribe:ticker');
        }
        const client = this.client (url);
        this.watchMultiple (url, messageHashes, this.extend (request, params), messageHashes);
        this.handleUnsubscriptions (client, messageHashes);
        return undefined;
    }

    /**
     * @method
     * @name mexc#unWatchBidsAsks
     * @description unWatches best bid & ask for symbols
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async unWatchBidsAsks (symbols: Strings = undefined, params = {}): Promise<any> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols, undefined, true, false, true);
        let marketType = undefined;
        if (symbols === undefined) {
            throw new ArgumentsRequired (this.id + ' watchBidsAsks required symbols argument');
        }
        const markets = this.marketsForSymbols (symbols);
        [ marketType, params ] = this.handleMarketTypeAndParams ('watchBidsAsks', markets[0], params);
        const isSpot = marketType === 'spot';
        if (!isSpot) {
            throw new NotSupported (this.id + ' watchBidsAsks only support spot market');
        }
        const messageHashes = [];
        const topics = [];
        for (let i = 0; i < symbols.length; i++) {
            if (isSpot) {
                const market = this.market (symbols[i]);
                topics.push ('spot@public.aggre.bookTicker.v3.api.pb@100ms@' + market['id']);
            }
            messageHashes.push ('unsubscribe:bidask:' + symbols[i]);
        }
        const url = this.urls['api']['ws']['spot'];
        const request: Dict = {
            'method': 'UNSUBSCRIPTION',
            'params': topics,
        };
        const client = this.client (url);
        this.watchMultiple (url, messageHashes, this.extend (request, params), messageHashes);
        this.handleUnsubscriptions (client, messageHashes);
        return undefined;
    }

    /**
     * @method
     * @name mexc#unWatchOHLCV
     * @description unWatches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {object} [params.timezone] if provided, kline intervals are interpreted in that timezone instead of UTC, example '+08:00'
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async unWatchOHLCV (symbol: string, timeframe = '1m', params = {}): Promise<any> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const timeframes = this.safeValue (this.options, 'timeframes', {});
        const timeframeId = this.safeString (timeframes, timeframe);
        const messageHash = 'unsubscribe:candles:' + symbol + ':' + timeframe;
        let url = undefined;
        if (market['spot']) {
            url = this.urls['api']['ws']['spot'];
            const channel = 'spot@public.kline.v3.api.pb@' + market['id'] + '@' + timeframeId;
            params['unsubscribed'] = true;
            this.watchSpotPublic (channel, messageHash, params);
        } else {
            url = this.urls['api']['ws']['swap'];
            const channel = 'unsub.kline';
            const requestParams: Dict = {
                'symbol': market['id'],
                'interval': timeframeId,
            };
            this.watchSwapPublic (channel, messageHash, requestParams, params);
        }
        const client = this.client (url);
        this.handleUnsubscriptions (client, [ messageHash ]);
        return undefined;
    }

    /**
     * @method
     * @name mexc#unWatchOrderBook
     * @description unWatches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @param {string} symbol unified array of symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.frequency] the frequency of the order book updates, default is '10ms', can be '100ms' or '10ms
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async unWatchOrderBook (symbol: string, params = {}): Promise<any> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const messageHash = 'unsubscribe:orderbook:' + symbol;
        let url = undefined;
        if (market['spot']) {
            url = this.urls['api']['ws']['spot'];
            let frequency = undefined;
            [ frequency, params ] = this.handleOptionAndParams (params, 'watchOrderBook', 'frequency', '100ms');
            const channel = 'spot@public.aggre.depth.v3.api.pb@' + frequency + '@' + market['id'];
            params['unsubscribed'] = true;
            this.watchSpotPublic (channel, messageHash, params);
        } else {
            url = this.urls['api']['ws']['swap'];
            const channel = 'unsub.depth';
            const requestParams: Dict = {
                'symbol': market['id'],
            };
            this.watchSwapPublic (channel, messageHash, requestParams, params);
        }
        const client = this.client (url);
        this.handleUnsubscriptions (client, [ messageHash ]);
        return undefined;
    }

    /**
     * @method
     * @name mexc#unWatchTrades
     * @description unsubscribes from the trades channel
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.name] the name of the method to call, 'trade' or 'aggTrade', default is 'trade'
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async unWatchTrades (symbol: string, params = {}): Promise<any> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const messageHash = 'unsubscribe:trades:' + symbol;
        let url = undefined;
        if (market['spot']) {
            url = this.urls['api']['ws']['spot'];
            const channel = 'spot@public.aggre.deals.v3.api.pb@100ms@' + market['id'];
            params['unsubscribed'] = true;
            this.watchSpotPublic (channel, messageHash, params);
        } else {
            url = this.urls['api']['ws']['swap'];
            const channel = 'unsub.deal';
            const requestParams: Dict = {
                'symbol': market['id'],
            };
            this.watchSwapPublic (channel, messageHash, requestParams, params);
        }
        const client = this.client (url);
        this.handleUnsubscriptions (client, [ messageHash ]);
        return undefined;
    }

    handleUnsubscriptions (client: Client, messageHashes: string[]) {
        for (let i = 0; i < messageHashes.length; i++) {
            const messageHash = messageHashes[i];
            const subMessageHash = messageHash.replace ('unsubscribe:', '');
            this.cleanUnsubscription (client, subMessageHash, messageHash);
            if (messageHash.indexOf ('ticker') >= 0) {
                const symbol = messageHash.replace ('unsubscribe:ticker:', '');
                if (symbol.indexOf ('unsubscribe') >= 0) {
                    // unWatchTickers
                    const symbols = Object.keys (this.tickers);
                    for (let j = 0; j < symbols.length; j++) {
                        delete this.tickers[symbols[j]];
                    }
                } else if (symbol in this.tickers) {
                    delete this.tickers[symbol];
                }
            } else if (messageHash.indexOf ('bidask') >= 0) {
                const symbol = messageHash.replace ('unsubscribe:bidask:', '');
                if (symbol in this.bidsasks) {
                    delete this.bidsasks[symbol];
                }
            } else if (messageHash.indexOf ('candles') >= 0) {
                const splitHashes = messageHash.split (':');
                let symbol = this.safeString (splitHashes, 2);
                if (splitHashes.length > 4) {
                    symbol += ':' + this.safeString (splitHashes, 3);
                }
                if (symbol in this.ohlcvs) {
                    delete this.ohlcvs[symbol];
                }
            } else if (messageHash.indexOf ('orderbook') >= 0) {
                const symbol = messageHash.replace ('unsubscribe:orderbook:', '');
                if (symbol in this.orderbooks) {
                    delete this.orderbooks[symbol];
                }
            } else if (messageHash.indexOf ('trades') >= 0) {
                const symbol = messageHash.replace ('unsubscribe:trades:', '');
                if (symbol in this.trades) {
                    delete this.trades[symbol];
                }
            }
        }
    }

    async authenticate (subscriptionHash, params = {}) {
        // we only need one listenKey since ccxt shares connections
        let listenKey = this.safeString (this.options, 'listenKey');
        if (listenKey !== undefined) {
            return listenKey;
        }
        const response = await this.spotPrivatePostUserDataStream (params);
        //
        //    {
        //        "listenKey": "pqia91ma19a5s61cv6a81va65sdf19v8a65a1a5s61cv6a81va65sdf19v8a65a1"
        //    }
        //
        listenKey = this.safeString (response, 'listenKey');
        this.options['listenKey'] = listenKey;
        const listenKeyRefreshRate = this.safeInteger (this.options, 'listenKeyRefreshRate', 1200000);
        this.delay (listenKeyRefreshRate, this.keepAliveListenKey, listenKey, params);
        return listenKey;
    }

    async keepAliveListenKey (listenKey, params = {}) {
        if (listenKey === undefined) {
            return;
        }
        const request: Dict = {
            'listenKey': listenKey,
        };
        try {
            await this.spotPrivatePutUserDataStream (this.extend (request, params));
            const listenKeyRefreshRate = this.safeInteger (this.options, 'listenKeyRefreshRate', 1200000);
            this.delay (listenKeyRefreshRate, this.keepAliveListenKey, listenKey, params);
        } catch (error) {
            const url = this.urls['api']['ws']['spot'] + '?listenKey=' + listenKey;
            const client = this.client (url);
            this.options['listenKey'] = undefined;
            client.reject (error);
            delete this.clients[url];
        }
    }

    handlePong (client: Client, message) {
        client.lastPong = this.milliseconds ();
        return message;
    }

    handleSubscriptionStatus (client: Client, message) {
        //
        //    {
        //        "id": 0,
        //        "code": 0,
        //        "msg": "spot@public.increase.depth.v3.api@BTCUSDT"
        //    }
        // Set the default to an empty string if the message is empty during the test.
        const msg = this.safeString (message, 'msg', '');
        if (msg === 'PONG') {
            this.handlePong (client, message);
        } else if (msg.indexOf ('@') > -1) {
            const parts = msg.split ('@');
            const channel = this.safeString (parts, 1);
            const methods: Dict = {
                'public.increase.depth.v3.api': this.handleOrderBookSubscription,
                'public.aggre.depth.v3.api.pb': this.handleOrderBookSubscription,
            };
            const method = this.safeValue (methods, channel);
            if (method !== undefined) {
                method.call (this, client, message);
            }
        }
    }

    handleProtobufMessage (client: Client, message) {
        // protobuf message decoded
        //  {
        //    "channel":"spot@public.kline.v3.api.pb@BTCUSDT@Min1",
        //    "symbol":"BTCUSDT",
        //    "symbolId":"2fb942154ef44a4ab2ef98c8afb6a4a7",
        //    "createTime":"1754737941062",
        //    "publicSpotKline":{
        //       "interval":"Min1",
        //       "windowStart":"1754737920",
        //       "openingPrice":"117317.31",
        //       "closingPrice":"117325.26",
        //       "highestPrice":"117341",
        //       "lowestPrice":"117317.3",
        //       "volume":"3.12599854",
        //       "amount":"366804.43",
        //       "windowEnd":"1754737980"
        //    }
        // }
        const channel = this.safeString (message, 'channel');
        const channelParts = channel.split ('@');
        const channelId = this.safeString (channelParts, 1);
        if (channelId === 'public.kline.v3.api.pb') {
            this.handleOHLCV (client, message);
        } else if (channelId === 'public.aggre.deals.v3.api.pb') {
            this.handleTrades (client, message);
        } else if (channelId === 'public.aggre.bookTicker.v3.api.pb') {
            this.handleTicker (client, message);
        } else if (channelId === 'public.aggre.depth.v3.api.pb') {
            this.handleOrderBook (client, message);
        } else if (channelId === 'private.account.v3.api.pb') {
            this.handleBalance (client, message);
        } else if (channelId === 'private.deals.v3.api.pb') {
            this.handleMyTrade (client, message);
        } else if (channelId === 'private.orders.v3.api.pb') {
            this.handleOrder (client, message);
        }
        return true;
    }

    handleMessage (client: Client, message) {
        if (typeof message === 'string') {
            if (message === 'Invalid listen key') {
                const error = new AuthenticationError (this.id + ' invalid listen key');
                client.reject (error);
                return;
            }
        }
        if (this.isBinaryMessage (message)) {
            message = this.decodeProtoMsg (message);
            this.handleProtobufMessage (client, message);
            return;
        }
        if ('msg' in message) {
            this.handleSubscriptionStatus (client, message);
            return;
        }
        const c = this.safeString (message, 'c');
        let channel = undefined;
        if (c === undefined) {
            channel = this.safeString (message, 'channel');
        } else {
            const parts = c.split ('@');
            channel = this.safeString (parts, 1);
        }
        const methods: Dict = {
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
            method.call (this, client, message);
        }
    }

    ping (client: Client) {
        return { 'method': 'ping' };
    }
}
