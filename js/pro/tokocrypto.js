'use strict';

//  ---------------------------------------------------------------------------

const tokocryptoRest = require ('../tokocrypto');
const { ExchangeError } = require ('../base/errors');
const { ArrayCache, ArrayCacheBySymbolById, ArrayCacheByTimestamp } = require ('./base/Cache');

//  ---------------------------------------------------------------------------

module.exports = class tokocrypto extends tokocryptoRest {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchBalance': true,
                'watchTicker': true,
                'watchTickers': true,
                'watchTrades': true,
                'watchMyTrades': true,
                'watchOrders': true,
                'watchOrderBook': true,
                'watchOHLCV': true,
            },
            'urls': {
                'api': {
                    'ws': 'wss://stream.binance.com',
                },
            },
            'options': {
            },
            'streaming': {
            },
            'exceptions': {
            },
        });
    }

    async watchBalance (params = {}) {
        /**
         * @method
         * @name tokocrypto#watchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} params extra parameters specific to the tokocrypto api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        const key = await this.authenticate (params);
        const messageHash = 'balance';
        const subscribeHash = 'user';
        const url = this.urls['api']['ws'] + '/ws/' + key;
        return await this.watch (url, messageHash, undefined, subscribeHash);
    }

    handleBalance (client, message) {
        //
        //     {
        //         e: 'outboundAccountPosition',
        //         E: 1662800357210,
        //         u: 1662800357210,
        //         B: [{
        //                 a: 'BNB',
        //                 f: '0.00000000',
        //                 l: '0.00000000'
        //             },
        //             {
        //                 a: 'USDT',
        //                 f: '0.00000000',
        //                 l: '0.00000000'
        //             },
        //             {
        //                 a: 'BIDR',
        //                 f: '58903.70',
        //                 l: '23856.00'
        //             }
        //         ]
        //     }
        //
        const balances = this.safeValue (message, 'B', []);
        const timestamp = this.safeInteger (message, 'E');
        const result = {
            'info': balances,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        for (let i = 0; i < balances.length; i++) {
            const rawBalance = balances[i];
            const currencyId = this.safeString (rawBalance, 'a');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeNumber (rawBalance, 'f');
            account['used'] = this.safeNumber (rawBalance, 'l');
            account['total'] = undefined;
            result[code] = account;
        }
        this.balance = this.safeBalance (result);
        const messageHash = 'balance';
        client.resolve (this.balance, messageHash);
    }

    async watchTicker (symbol, params = {}) {
        /**
         * @method
         * @name tokocrypto#watchTicker
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the tokocrypto api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const wssMarketId = this.wssMarketId (market);
        const url = this.urls['api']['ws'] + '/ws/' + wssMarketId + '@miniTicker';
        const messageHash = 'ticker:' + wssMarketId;
        return await this.watch (url, messageHash, undefined, messageHash);
    }

    handleTicker (client, message) {
        //
        //     {
        //         e: '24hrMiniTicker',
        //         E: 1662803876572,
        //         s: 'BTCUSDT',
        //         c: '21331.10000000',
        //         o: '20757.41000000',
        //         h: '21672.24000000',
        //         l: '20715.00000000',
        //         v: '392403.98713000',
        //         q: '8332213510.60996140'
        //     }
        //
        const marketId = this.safeString (message, 's');
        const symbol = this.safeSymbol (marketId);
        const market = this.safeMarket (marketId);
        const parsedTicker = this.parseWsTicker (message, market);
        const messageHash = 'ticker:' + marketId.toLowerCase ();
        this.tickers[symbol] = parsedTicker;
        client.resolve (parsedTicker, messageHash);
    }

    async watchTickers (symbols, params = {}) {
        /**
         * @method
         * @name tokocrypto#watchTickers
         * @description watches price tickers, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbols unified symbols of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the tokocrypto api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        if (symbols !== undefined) {
            symbols = this.marketSymbols (symbols);
        }
        const url = this.urls['api']['ws'] + '/ws/!miniTicker@arr';
        const messageHash = 'tickers';
        const tickers = await this.watch (url, messageHash, undefined, messageHash);
        return this.filterByArray (tickers, 'symbol', symbols); // TODO returned symbol is not unified symbol therfore filterByArray does not work
    }

    handleTickers (client, message) {
        //
        //     [
        //         {
        //             e: '24hrMiniTicker',
        //             E: 1662803876572,
        //             s: 'BTCUSDT',
        //             c: '21331.10000000',
        //             o: '20757.41000000',
        //             h: '21672.24000000',
        //             l: '20715.00000000',
        //             v: '392403.98713000',
        //             q: '8332213510.60996140'
        //         }
        //         ...
        //     ]
        //
        for (let i = 0; i < message.length; i++) {
            const marketId = this.safeString (message, 's');
            const symbol = this.safeSymbol (marketId);
            const market = this.safeMarket (marketId);
            const parsedTicker = this.parseWsTicker (message, market);
            this.tickers[symbol] = parsedTicker;
        }
        client.resolve (this.tickers, 'tickers');
    }

    parseWsTicker (ticker, market = undefined) {
        //
        //     {
        //         e: '24hrMiniTicker',
        //         E: 1662803876572,
        //         s: 'BTCUSDT',
        //         c: '21331.10000000',
        //         o: '20757.41000000',
        //         h: '21672.24000000',
        //         l: '20715.00000000',
        //         v: '392403.98713000',
        //         q: '8332213510.60996140'
        //     }
        //
        const marketId = this.safeString (ticker, 's');
        const timestamp = this.safeInteger (ticker, 'E');
        return this.safeTicker ({
            'symbol': this.safeSymbol (marketId, market, ''),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'h'),
            'low': this.safeString (ticker, 'l'),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': this.safeString (ticker, 'o'),
            'close': this.safeString (ticker, 'c'),
            'last': this.safeString (ticker, 'l'),
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeString (ticker, 'v'),
            'quoteVolume': this.safeString (ticker, 'q'),
            'info': ticker,
        }, market);
    }

    async watchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name tokocrypto#watchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the tokocrypto api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const wssMarketId = this.wssMarketId (market);
        const url = this.urls['api']['ws'] + '/ws/' + wssMarketId + '@trade';
        const messageHash = 'trades:' + wssMarketId;
        const trades = await this.watch (url, messageHash, undefined, messageHash);
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    wssMarketId (market) {
        let marketId = market['id'];
        marketId = marketId.replace ('_', '');
        return marketId.toLowerCase ();
    }

    handleTrades (client, message) {
        //
        //     {
        //         e: 'trade',
        //         E: 1662801891308,
        //         s: 'BTCUSDT',
        //         t: 1787802850,
        //         p: '21364.47000000',
        //         q: '0.00775000',
        //         b: 13325457349,
        //         a: 13325457367,
        //         T: 1662801891308,
        //         m: true,
        //         M: true
        //     }
        //
        const marketId = this.safeString (message, 's');
        const symbol = this.safeSymbol (marketId);
        const market = this.safeMarket (marketId);
        const messageHash = 'trades:' + marketId.toLowerCase ();
        let stored = this.safeValue (this.trades, symbol);
        if (stored === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            stored = new ArrayCache (limit);
            this.trades[symbol] = stored;
        }
        const parsed = this.parseWsTrade (message, market);
        stored.append (parsed);
        this.trades[symbol] = stored;
        client.resolve (stored, messageHash);
    }

    parseWsTrade (trade, market = undefined) {
        //
        //     {
        //         e: 'trade',
        //         E: 1662801891308,
        //         s: 'BTCUSDT',
        //         t: 1787802850,
        //         p: '21364.47000000',
        //         q: '0.00775000',
        //         b: 13325457349,
        //         a: 13325457367,
        //         T: 1662801891308,
        //         m: true,
        //         M: true
        //     }
        //
        const timestamp = this.safeInteger (trade, 'T');
        const marketId = this.safeString (trade, 's');
        const isMaker = this.safeValue (trade, 'm');
        let side = undefined;
        if (isMaker !== undefined) {
            side = isMaker ? 'sell' : 'buy'; // this is reversed intentionally
        }
        return this.safeTrade ({
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': this.safeSymbol (marketId, market, ''),
            'id': this.safeString (trade, 't'),
            'order': this.safeString (trade, 'b', 'a'),
            'type': undefined,
            'side': side,
            'takerOrMaker': isMaker ? 'maker' : 'taker',
            'price': this.safeNumber (trade, 'p'),
            'amount': this.safeNumber (trade, 'q'),
            'cost': undefined,
            'fee': undefined,
        }, market);
    }

    async watchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name tokocrypto#watchOHLCV
         * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
         * @param {int|undefined} limit the maximum amount of candles to fetch
         * @param {object} params extra parameters specific to the tokocrypto api endpoint
         * @returns {[[int]]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const wssMarketId = this.wssMarketId (market);
        const url = this.urls['api']['ws'] + '/ws/' + wssMarketId + '@kline_' + timeframe;
        const messageHash = 'ohlcv:' + wssMarketId + ':' + timeframe;
        const ohlcv = await this.watch (url, messageHash, undefined, messageHash);
        if (this.newUpdates) {
            limit = ohlcv.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (ohlcv, since, limit, 0, true);
    }

    handleOHLCV (client, message) {
        //
        //     {
        //         e: 'kline',
        //         E: 1662803058504,
        //         s: 'BTCUSDT',
        //         k: {
        //             t: 1662803040000,
        //             T: 1662803099999,
        //             s: 'BTCUSDT',
        //             i: '1m',
        //             f: 1787858699,
        //             L: 1787859351,
        //             o: '21351.20000000',
        //             c: '21350.65000000',
        //             h: '21351.96000000',
        //             l: '21349.83000000',
        //             v: '21.74379000',
        //             n: 653,
        //             x: false,
        //             q: '464251.96659780',
        //             V: '8.03579000',
        //             Q: '171575.46148910',
        //             B: '0'
        //         }
        //     }
        //
        const kline = this.safeValue (message, 'k');
        const marketId = this.safeString (kline, 's');
        const timeframe = this.safeString (kline, 'i');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const messageHash = 'ohlcv:' + marketId.toLowerCase () + ':' + timeframe;
        const parsed = [
            this.safeInteger (kline, 't'),
            this.safeNumber (kline, 'o'),
            this.safeNumber (kline, 'h'),
            this.safeNumber (kline, 'l'),
            this.safeNumber (kline, 'c'),
            this.safeNumber (kline, 'v'),
        ];
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

    async watchOrderBook (symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name tokocrypto#watchOrderBook
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the tokocrypto api endpoint
         * @returns {object} A objectionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const wssMarketId = this.wssMarketId (market);
        const url = this.urls['api']['ws'] + '/ws/' + wssMarketId + '@depth';
        const messageHash = 'orderbook:' + wssMarketId;
        const orderbook = await this.watch (url, messageHash, undefined, messageHash);
        return orderbook.limit (limit);
    }

    async watchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name tokocrypto#fetchOrders
         * @description watches information on multiple orders made by the user
         * @see https://docs.gemini.com/websocket-api/#order-events
         * @param {string|undefined} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the tokocrypto api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        const key = await this.authenticate (params);
        const messageHash = 'orders';
        const subscribeHash = 'user';
        const url = this.urls['api']['ws'] + '/ws/' + key;
        return await this.watch (url, messageHash, undefined, subscribeHash);
    }

    handleOrder (client, message) {
        //
        //     {
        //         e: 'executionReport',
        //         E: 1662798360302,
        //         s: 'USDTBIDR',
        //         c: '145543500',
        //         S: 'BUY',
        //         o: 'LIMIT',
        //         f: 'GTC',
        //         q: '2.00000000',
        //         p: '11928.00',
        //         P: '0.00',
        //         F: '0.00000000',
        //         g: -1,
        //         C: '',
        //         x: 'NEW',
        //         X: 'NEW',
        //         r: 'NONE',
        //         i: 35281234,
        //         l: '0.00000000',
        //         z: '0.00000000',
        //         L: '0.00',
        //         n: '0',
        //         N: null,
        //         T: 1662798360302,
        //         t: -1,
        //         I: 83624071,
        //         w: true,
        //         m: false,
        //         M: false,
        //         O: 1662798360302,
        //         Z: '0.00',
        //         Y: '0.00',
        //         Q: '0.00'
        //     }
        //
        const order = this.parseWsOrder (message);
        if (this.orders === undefined) {
            const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
            this.orders = new ArrayCacheBySymbolById (limit);
        }
        const orders = this.orders;
        orders.append (order);
        const messageHash = 'orders';
        client.resolve (orders, messageHash);
    }

    parseWsOrder (order, market = undefined) {
        //
        //     {
        //         e: 'executionReport',
        //         E: 1662798360302,
        //         s: 'USDTBIDR',
        //         c: '145543500',
        //         S: 'BUY',
        //         o: 'LIMIT',
        //         f: 'GTC',
        //         q: '2.00000000',
        //         p: '11928.00',
        //         P: '0.00',
        //         F: '0.00000000',
        //         g: -1,
        //         C: '',
        //         x: 'NEW',
        //         X: 'NEW',
        //         r: 'NONE',
        //         i: 35281234,
        //         l: '0.00000000',
        //         z: '0.00000000',
        //         L: '0.00',
        //         n: '0',
        //         N: null,
        //         T: 1662798360302,
        //         t: -1,
        //         I: 83624071,
        //         w: true,
        //         m: false,
        //         M: false,
        //         O: 1662798360302,
        //         Z: '0.00',
        //         Y: '0.00',
        //         Q: '0.00'
        //     }
        //
        const timestamp = this.safeNumber (order, 'E');
        const marketId = this.safeString (order, 's');
        const symbol = this.safeSymbol (marketId, market);
        const status = this.safeString (order, 'X');
        let fee = undefined;
        const feeSymbolId = this.safeString (order, 'N');
        if (feeSymbolId !== undefined) {
            fee = {
                'cost': this.safeNumber (order, 'n'),
                'currency': this.safeCurrencyCode (feeSymbolId),
                'rate': undefined,
            };
        }
        const tradeId = this.safeString (order, 't');
        const trades = [];
        if (tradeId !== '-1') {
            const transactionTime = this.safeInteger (order, 'T');
            const isMaker = this.safeValue (order, 'm');
            const trade = this.safeTrade (
                {
                    'info': order,
                    'id': tradeId,
                    'timestamp': transactionTime,
                    'datetime': this.iso8601 (transactionTime),
                    'symbol': symbol,
                    'order': this.safeString (order, 'c', 'C'),
                    'type': this.safeStringLower (order, 'o'),
                    'side': this.safeStringLower (order, 'S'),
                    'takerOrMaker': isMaker ? 'maker' : 'taker',
                    'price': undefined,
                    'amount': undefined,
                    'cost': undefined,
                    'fee': undefined,
                }
            );
            trades.push (trade);
        }
        return this.safeOrder ({
            'id': this.safeString (order, 'c', 'C'),
            'clientOrderId': this.safeString (order, 'client_order_id'),
            'info': order,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'status': this.parseOrderStatus (status),
            'symbol': symbol,
            'type': this.safeStringLower (order, 'o'),
            'timeInForce': this.safeString (order, 'f'),
            'postOnly': undefined,
            'side': this.safeStringLower (order, 'S'),
            'price': this.safeNumber (order, 'p'),
            'stopPrice': this.safeNumber (order, 'P'),
            'average': this.safeNumber (order, 'avg_execution_price'),
            'cost': undefined,
            'amount': this.safeNumber (order, 'q'),
            'filled': this.safeNumber (order, 'z'),
            'remaining': this.safeNumber (order, 'remaining_amount'),
            'fee': fee,
            'trades': trades,
        }, market);
    }

    async handleOrderBook (client, message) {
        //
        //     {
        //         "e": "depthUpdate",
        //         "E": 1662806196047,
        //         "s": "BNBBTC",
        //         "U": 157,
        //         "u": 160,
        //         "b": [
        //           [
        //             "0.0024",
        //             "10"
        //           ]
        //         ],
        //         "a": [
        //           [
        //             "0.0026",
        //             "100"
        //           ]
        //         ]
        //     }
        //
        const marketId = this.safeString (message, 's');
        const timestamp = this.safeString (message, 'E');
        const u = this.safeInteger (message, 'u');
        const U = this.safeInteger (message, 'U');
        const symbol = this.safeSymbol (marketId);
        const messageHash = 'orderbook:' + marketId.toLowerCase ();
        let storedOrderBook = this.safeValue (this.orderbooks, symbol);
        let snapshotUpdateId = undefined;
        if (storedOrderBook === undefined) {
            storedOrderBook = this.orderBook ({});
            const snapshot = await this.fetchOrderBookSnapshot (client, marketId);
            snapshotUpdateId = this.safeInteger (snapshot, 'nonce');
            storedOrderBook.reset (snapshot);
            this.orderbooks[symbol] = storedOrderBook;
            if (u <= snapshotUpdateId) {
                return; // drop events before snapshot
            }
            if (U > snapshotUpdateId + 1 || u < snapshotUpdateId + 1) {
                throw new ExchangeError (this.id + ' invalid first event processed after snapshot');
            }
        }
        if (U !== storedOrderBook['nonce'] + 1) {
            throw new ExchangeError (this.id + ' order book events out of sequence');
        }
        const asks = this.safeValue (message, 'a', []);
        const bids = this.safeValue (message, 'b', []);
        this.handleDeltas (storedOrderBook['asks'], asks);
        this.handleDeltas (storedOrderBook['bids'], bids);
        storedOrderBook['timestamp'] = timestamp;
        storedOrderBook['datetime'] = this.iso8601 (timestamp);
        storedOrderBook['nonce'] = u;
        this.options['lastOrderBookSequenceId'] = u;
        client.resolve (storedOrderBook, messageHash);
    }

    async fetchOrderBookSnapshot (client, symbol) {
        let future = this.safeValue (client.futures, 'orderbookSnapshot');
        if (future === undefined) {
            future = client.future ('orderbookSnapshot');
            const request = {
                'symbol': symbol,
            };
            const response = await this.binanceGetDepth (request);
            //
            //     {
            //         "lastUpdateId":333598053905,
            //         "E":1618631511986,
            //         "T":1618631511964,
            //         "bids":[
            //             ["2493.56","20.189"],
            //             ["2493.54","1.000"],
            //             ["2493.51","0.005"]
            //         ],
            //         "asks":[
            //             ["2493.57","0.877"],
            //             ["2493.62","0.063"],
            //             ["2493.71","12.054"],
            //         ]
            //     }
            //
            const timestamp = this.safeInteger (response, 'T');
            const orderbook = this.parseOrderBook (response, symbol, timestamp);
            orderbook['nonce'] = this.safeInteger (response, 'lastUpdateId');
            future.resolve (orderbook);
            return future;
        }
        return await future;
    }

    handleDelta (bookside, delta) {
        const bidAsk = this.parseBidAsk (delta, 0, 1);
        bookside.storeArray (bidAsk);
    }

    handleDeltas (bookside, deltas) {
        for (let i = 0; i < deltas.length; i++) {
            this.handleDelta (bookside, deltas[i]);
        }
    }

    handleMessage (client, message) {
        const event = this.safeString (message, 'e');
        const handlers = {
            '24hrMiniTicker': this.handleTicker,
            'outboundAccountPosition': this.handleBalance,
            'trade': this.handleTrades,
            'depthUpdate': this.handleOrderBook,
            'kline': this.handleOHLCV,
            'executionReport': this.handleOrder,
        };
        const handler = this.safeValue (handlers, event);
        if (handler !== undefined) {
            return handler.call (this, client, message);
        }
        if (this.isArray (message)) {
            return this.handleTickers (client, message);
        }
        return message;
    }

    async authenticate (params = {}) {
        const listenKeyData = this.safeValue (this.options, 'listenKeyData', {});
        let listenKey = this.safeString (listenKeyData, 'data');
        const timestamp = this.safeInteger (listenKeyData, 'timestamp');
        const expired = (this.milliseconds () - timestamp) > 30 * 60 * 1000;
        if (listenKey === undefined || expired) {
            this.checkRequiredCredentials ();
            const response = await this.privatePostOpenV1UserDataStream (params);
            //
            //     {
            //         code: "0",
            //         msg: "Success",
            //         data: "1ldIAaD6VBrApNS2qhYrVvcDVxTS1RIeve2h8BnCeawjo1bfBd1kb3561QwZ",
            //         timestamp: "1662722869144",
            //     }
            //
            this.options['listenKeyData'] = response;
            listenKey = this.safeString (response, 'data');
        }
        return listenKey;
    }
};
