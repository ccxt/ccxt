'use strict';

//  ---------------------------------------------------------------------------

const bwRest = require ('../bw');
const Precise = require ('../base/Precise');
const { NotSupported } = require ('../base/errors');
const { ArrayCache, ArrayCacheByTimestamp } = require ('./base/Cache');

//  ---------------------------------------------------------------------------

module.exports = class bw extends bwRest {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchBalance': false,
                'watchTicker': true,
                'watchTickers': true,
                'watchTrades': true,
                'watchMyTrades': false,
                'watchOrders': false,
                'watchOrderBook': true,
                'watchOHLCV': true,
            },
            'urls': {
                'api': {
                    'ws': {
                        'nonChina': 'wss://kline.bw.com/websocket',
                        'china': 'wss://kline.bw.io/websocket',
                    },
                },
            },
            'options': {
                'useChinaUrl': false,
            },
            'streaming': {
            },
            'exceptions': {
            },
        });
    }

    requestId () {
        const requestId = this.sum (this.safeInteger (this.options, 'requestId', 0), 1);
        this.options['requestId'] = requestId;
        return requestId;
    }

    getWsUrl () {
        let url = this.urls['api']['ws']['nonChina'];
        const useChinaUrl = this.safeValue (this.options, 'useChinaUrl', false);
        if (useChinaUrl) {
            url = this.urls['api']['ws']['china'];
        }
        return url;
    }

    async watchTicker (symbol, params = {}) {
        /**
         * @method
         * @name bw#watchTicker
         * @see https://github.com/bw-exchange/api_docs_en/wiki/WebSocket-API-Reference#subscribe-tickers-data-all_trade_statistic_24h
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the bw api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const url = this.getWsUrl ();
        const messageHash = 'ticker:' + symbol;
        const message = {
            'dataType': market['id'] + '_TRADE_STATISTIC_24H',
            'action': 'ADD',
        };
        const request = this.deepExtend (message, params);
        return await this.watch (url, messageHash, request, messageHash, request);
    }

    async watchTickers (symbols = undefined, params = {}) {
        /**
         * @method
         * @name bw#watchTickers
         * @see https://github.com/bw-exchange/api_docs_en/wiki/WebSocket-API-Reference#subscribe-tickers-data-all_trade_statistic_24h
         * @description watches price tickers, a statistical calculation with the information calculated over the past 24 hours for all markets
         * @param {string} symbols unified symbols of the markets to fetch the tickers for
         * @param {object} params extra parameters specific to the bw api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const url = this.getWsUrl ();
        const messageHash = 'tickers';
        const message = {
            'dataType': 'ALL_TRADE_STATISTIC_24H',
            'action': 'ADD',
        };
        const request = this.deepExtend (message, params);
        const tickers = await this.watch (url, messageHash, request, messageHash, request);
        return this.filterByArray (tickers, 'symbol', symbols);
    }

    handleTickers (client, message) {
        //
        //     {
        //         trade_statistic: [
        //           [
        //             '281',
        //             '23317.13',
        //             '23582.58',
        //             '23185.47',
        //             '236.2633',
        //             '0.3',
        //             '[[1, 23458.21], [2, 23303.2], [3, 23274.17], [4, 23292.21], [5, 23284.64], [6, 23317.13]]',
        //             '23246.27',
        //             '23417.63',
        //             '5526276.8286'
        //           ],
        //            ...
        //         ]
        //     }
        //
        const rawTickers = this.safeValue (message, 'trade_statistic', []);
        for (let i = 0; i < rawTickers.length; i++) {
            const rawTicker = rawTickers[i];
            const ticker = this.parseTicker (rawTicker);
            const symbol = this.safeString (ticker, 'symbol', '');
            const messageHash = 'ticker:' + symbol;
            this.tickers[symbol] = ticker;
            client.resolve (ticker, messageHash);
        }
        client.resolve (this.tickers, 'tickers');
    }

    async watchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bw#watchTrades
         * @description get the list of most recent trades for a particular symbol
         * @see https://github.com/bw-exchange/api_docs_en/wiki/WebSocket-API-Reference#subscribe-trade-detail-data-marketid_trade_symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the bw api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const url = this.getWsUrl ();
        const messageHash = 'trades:' + symbol;
        const name = this.safeString (market['info'], 'name');
        const message = {
            'dataType': market['id'] + '_TRADE_' + name,
            'action': 'ADD',
        };
        const request = this.deepExtend (message, params);
        const trades = await this.watch (url, messageHash, request, messageHash, request);
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    handleTrades (client, message) {
        //
        //  snapshot
        //     [
        //         [
        //           'T',
        //           '281',
        //           '1660857342',
        //           'BTC_USDT',
        //           'bid',
        //           '23326.85',
        //           '0.02052'
        //         ]
        //     ]
        //
        //  update
        //     [
        //       'T',
        //       '281',
        //       '1660857342',
        //       'BTC_USDT',
        //       'bid',
        //       '23326.85',
        //       '0.02052'
        //     ]
        //
        const first = this.safeValue (message, 0);
        const snapshot = this.isArray (first);
        let rawTrades = [];
        if (snapshot) {
            rawTrades = message;
        } else {
            rawTrades.push (message);
        }
        for (let i = 0; i < rawTrades.length; i++) {
            const rawTrade = rawTrades[i];
            const marketId = this.safeString (rawTrade, 1);
            const market = this.safeMarket (marketId);
            const symbol = market['symbol'];
            const messageHash = 'trades:' + symbol;
            let stored = this.safeValue (this.trades, symbol);
            if (stored === undefined) {
                const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
                stored = new ArrayCache (limit);
                this.trades[symbol] = stored;
            }
            const trade = this.parseTrade (rawTrade, market);
            stored.append (trade);
            this.trades[symbol] = stored;
            client.resolve (this.trades[symbol], messageHash);
        }
    }

    async watchOrderBook (symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name bw#watchOrderBook
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @see https://github.com/bw-exchange/api_docs_en/wiki/WebSocket-API-Reference#subscribe-to-market-depth-data-marketid_entrust_add_symbol
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the bw api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const url = this.getWsUrl ();
        const messageHash = 'orderbook:' + symbol;
        const name = this.safeString (market['info'], 'name');
        const message = {
            'dataType': market['id'] + '_ENTRUST_ADD_' + name,
            'action': 'ADD',
        };
        const request = this.deepExtend (message, params);
        const orderbook = await this.watch (url, messageHash, request, messageHash, request);
        return orderbook.limit (limit);
    }

    handleOrderBook (client, message) {
        //
        // snapshot
        //     [
        //         [
        //             'AE',
        //             '281',
        //             'BTC_USDT',
        //             '1660858391',
        //             { asks: [["1111111111","0.00166"],...] },
        //             { bids: [["1111111111","0.00166"],...] }
        //         ]
        //     ]
        //  update
        //     [
        //         'E',
        //         '281',
        //         '1660858542',
        //         'BTC_USDT',
        //         'ASK',
        //         '23530.49',
        //         '0.02699'
        //     ]
        //
        const first = this.safeValue (message, 0);
        const isSnapshots = this.isArray (first);
        if (isSnapshots) {
            for (let i = 0; i < message.length; i++) {
                const rawOrderbook = message[i];
                const marketId = this.safeString (rawOrderbook, 1);
                const symbol = this.safeSymbol (marketId);
                const timestampSeconds = this.safeString (rawOrderbook, 3);
                const timestamp = this.parseNumber (Precise.stringMul (timestampSeconds, '1000'));
                let storedOrderBook = this.safeValue (this.orderbooks, symbol);
                if (storedOrderBook === undefined) {
                    storedOrderBook = this.orderBook ({});
                    this.orderbooks[symbol] = storedOrderBook;
                }
                const snapshot = this.parseBwOrderBook (rawOrderbook, symbol, timestamp);
                storedOrderBook.reset (snapshot);
                const messageHash = 'orderbook:' + symbol;
                client.resolve (storedOrderBook, messageHash);
            }
        } else {
            const marketId = this.safeString (message, 1);
            const symbol = this.safeSymbol (marketId);
            const timestampSeconds = this.safeString (message, 2);
            const timestamp = this.parseNumber (Precise.stringMul (timestampSeconds, '1000'));
            let storedOrderBook = this.safeValue (this.orderbooks, symbol);
            if (storedOrderBook === undefined) {
                storedOrderBook = this.orderBook ({});
                this.orderbooks[symbol] = storedOrderBook;
            }
            const type = this.safeString (message, 4);
            const bidAsk = this.parseBidAsk (message, 5, 6);
            if (type === 'ASK') {
                const asks = storedOrderBook['asks'];
                asks.storeArray (bidAsk);
            } else if (type === 'BID') {
                const bids = storedOrderBook['bids'];
                bids.storeArray (bidAsk);
            } else {
                throw new NotSupported (this.id + 'watchOrderBook() received unknown message. ' + this.json (message));
            }
            storedOrderBook['timestamp'] = timestamp;
            storedOrderBook['datetime'] = this.iso8601 (timestamp);
            const messageHash = 'orderbook:' + symbol;
            client.resolve (storedOrderBook, messageHash);
        }
    }

    parseBwOrderBook (orderbook, symbol, timestamp = undefined) {
        const asksObject = this.safeValue (orderbook, 4, {});
        const asks = this.safeValue (asksObject, 'asks', []);
        const bidsObject = this.safeValue (orderbook, 5, {});
        const bids = this.safeValue (bidsObject, 'bids', []);
        return {
            'symbol': symbol,
            'bids': this.sortBy (bids, 0, true),
            'asks': this.sortBy (asks, 0),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'nonce': undefined,
        };
    }

    async watchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bw#fetchOHLCV
         * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @see https://github.com/bw-exchange/api_docs_en/wiki/WebSocket-API-Reference#subscribe-kline-data-marketid_kline_klinetype_symbol
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
         * @param {int|undefined} limit the maximum amount of candles to fetch
         * @param {object} params extra parameters specific to the bw api endpoint
         * @returns {[[int]]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const interval = this.safeString (this.timeframes, timeframe, timeframe);
        const url = this.getWsUrl ();
        const messageHash = 'ohlcv:' + symbol + ':' + interval;
        const name = this.safeString (market['info'], 'name');
        const message = {
            'dataType': market['id'] + '_KLINE_' + interval + '_' + name,
            'action': 'ADD',
        };
        const request = this.deepExtend (message, params);
        const ohlcv = await this.watch (url, messageHash, request, messageHash, request);
        if (this.newUpdates) {
            limit = ohlcv.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (ohlcv, since, limit, 0, true);
    }

    handleOHLCV (client, message) {
        //
        //  first message
        //    [
        //        [
        //            "K",
        //            "305",
        //            "eth_btc",
        //            "1591511280",
        //            "0.02504",
        //            "0.02504",
        //            "0.02504",
        //            "0.02504",
        //            "0.0123",
        //            "0",
        //            "285740.17",
        //            "1M",
        //            "false",
        //            "0.000308"
        //        ]
        //    ]
        //  update
        //    [
        //        "K",
        //        "305",
        //        "eth_btc",
        //        "1591511280",
        //        "0.02504",
        //        "0.02504",
        //        "0.02504",
        //        "0.02504",
        //        "0.0123",
        //        "0",
        //        "285740.17",
        //        "1M",
        //        "false",
        //        "0.000308"
        //    ]
        //
        const first = this.safeValue (message, 0);
        const snapshot = this.isArray (first);
        let rawOHLCVs = [];
        if (snapshot) {
            rawOHLCVs = message;
        } else {
            rawOHLCVs.push (message);
        }
        for (let i = 0; i < rawOHLCVs.length; i++) {
            const rawOHLCV = rawOHLCVs[i];
            const marketId = this.safeString (rawOHLCV, 1);
            const symbol = this.safeSymbol (marketId);
            const parsed = this.parseOHLCV (rawOHLCV);
            this.ohlcvs[symbol] = this.safeValue (this.ohlcvs, symbol, {});
            const interval = this.safeString (rawOHLCV, 11);
            const timeframe = this.findTimeframe (interval);
            let stored = this.safeValue (this.ohlcvs[symbol], timeframe);
            if (stored === undefined) {
                const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
                stored = new ArrayCacheByTimestamp (limit);
                this.ohlcvs[symbol][timeframe] = stored;
            }
            stored.append (parsed);
            const messageHash = 'ohlcv:' + symbol + ':' + interval;
            client.resolve (stored, messageHash);
        }
    }

    handleMessage (client, message) {
        const ticker = this.safeValue (message, 'trade_statistic');
        if (ticker !== undefined) {
            return this.handleTickers (client, message);
        }
        let messageToAnalyze = message;
        const first = this.safeValue (message, 0);
        if (this.isArray (first)) {
            messageToAnalyze = first;
        }
        const channel = this.safeString (messageToAnalyze, 0);
        const handlers = {
            'T': this.handleTrades,
            'K': this.handleTickers,
            'AE': this.handleOrderBook,
            'E': this.handleOrderBook,
        };
        const handler = this.safeValue (handlers, channel);
        if (handler !== undefined) {
            return handler.call (this, client, message);
        }
        throw new NotSupported (this.id + ' received an unsupported message: ' + this.json (message));
    }
};
