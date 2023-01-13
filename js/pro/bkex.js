'use strict';

//  ---------------------------------------------------------------------------

const bkexRest = require ('../bkex.js');
const { ExchangeError, BadRequest, AuthenticationError, NotSupported } = require ('../base/errors');
const { ArrayCache, ArrayCacheBySymbolById, ArrayCacheByTimestamp } = require ('./base/Cache');

//  ---------------------------------------------------------------------------

module.exports = class bkex extends bkexRest {
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
                'watchPosition': undefined,
            },
            'urls': {
                'api': {
                    'ws': {
                        'spot': 'wss://api.bkex.com/socket.io/?EIO=3&transport=websocket',
                        'swap': 'wss://fapi.bkex.com/fapi/v2/ws',
                    },
                },
            },
            'options': {
                'requestIds': {},
                'watchOHLCV': {
                    'timeframes': {
                        'spot': {
                            '1m': '1',
                            '5m': '5',
                            '15m': '15',
                            '30m': '30',
                            '1h': '60',
                            '4h': '240',
                            '6h': '360',
                            '12h': '720',
                            '1D': '1D',
                            '1w': '1W',
                        },
                        'swap': {
                            '1m': 'M1',
                            '5m': 'M5',
                            '15m': 'M15',
                            '30m': 'M30',
                            '1h': 'H1',
                            '2h': 'H2',
                            '4h': 'H4',
                            '6h': 'H6',
                            '1D': 'D1',
                            '1w': 'W1',
                        },
                    },
                },
            },
            'streaming': {
                'keepAlive': 20000,
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

    connect (url) {
        const client = this.safeValue (this.clients, url);
        if (client === undefined) {
            const messageHash = 'connect:' + url;
            return this.watch (url, messageHash, undefined, messageHash);
        }
    }

    async watchBalance (params = {}) {
        /**
         * @method
         * @name bkex#watchBalance
         * @see https://bkexapi.github.io/docs/api_en.htm?shell#websocket-account-4
         * @see https://bkexapi.github.io/docs/api_en.htm?shell#websocket-contract-u-account
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} params extra parameters specific to the bkex api endpoint
         * @param {string|undefined} params.type spot or contract if not provided this.options['defaultType'] is used
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        const [ type, query ] = this.handleMarketTypeAndParams ('watchBalance', undefined, params);
        const url = this.urls['api']['ws'][type];
        const messageHash = 'balance:' + type;
        let request = undefined;
        if (type === 'spot') {
            await this.connect (url);
            await this.authenticateSpot ();
            request = [
                'subUserAccountInfo',
            ];
            request = '42/account,' + JSON.stringify (request);
        } else if (type === 'swap') {
            await this.authenticateSwap ();
            request = this.extend ({
                'event': 'sub',
                'topic': 'user.balance',
            }, query);
        }
        return await this.watch (url, messageHash, request, messageHash);
    }

    handleSpotBalance (client, message) {
        //
        //    [
        //        {
        //            "avAfterChange": "201.100000",
        //            "availableChange": "0.100000",
        //            "currency": "BTC",
        //            "frAfterChange": "0.000000",
        //            "frozenChange": "0.000000",
        //            "time": 1588667153068,
        //            "type": "TRADE_DEAL_BUYER"
        //        },
        //        {
        //            "avAfterChange": "1991120.234380",
        //            "availableChange": "0.000000",
        //            "currency": "USDT",
        //            "frAfterChange": "0.000000",
        //            "frozenChange": "-807.251420",
        //            "time": 1588667153068,
        //            "type": "TRADE_DEAL_BUYER"
        //        }
        //    ]
        //
        for (let i = 0; i < message.length; i++) {
            const rawBalance = message[i];
            const currencyId = this.safeString (rawBalance, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const account = (code in this.balance) ? this.balance[code] : this.account ();
            account['free'] = this.safeString (rawBalance, 'avAfterChange');
            account['used'] = this.safeString (rawBalance, 'frAfterChange');
            this.balance['spot'][code] = account;
        }
        this.balance = this.safeBalance (this.balance);
        const messageHash = 'balance:spot';
        client.resolve (this.balance, messageHash);
    }

    handleSwapBalance (client, message) {
        //
        //    {
        //        "type":"user.balance",
        //        "ts":1662365636378,
        //        "data":{
        //            "balance":"6120140.06",
        //            "frozen":"0",
        //            "margin":"1002.79",
        //            "point":"0",
        //            "loans":"",
        //            "profit":"-327.08",
        //            "unProfit":"0",
        //            "unLosses":"-327.08",
        //            "coin":"usdt"
        //        }
        //    }
        //
        const rawBalance = this.safeValue (message, 'data', {});
        const currencyId = this.safeString (rawBalance, 'coin');
        const code = this.safeCurrencyCode (currencyId);
        const account = (code in this.balance) ? this.balance['swap'][code] : this.account ();
        account['total'] = this.safeString (rawBalance, 'balance');
        account['used'] = this.safeString (rawBalance, 'frozen');
        this.balance['swap'][code] = account;
        this.balance = this.safeBalance (this.balance);
        const messageHash = 'balance:swap';
        client.resolve (this.balance, messageHash);
    }

    async watchTicker (symbol, params = {}) {
        /**
         * @method
         * @name bkex#watchTicker
         * @see https://bkexapi.github.io/docs/api_en.htm?shell#websocket-6
         * @see https://bkexapi.github.io/docs/api_en.htm?shell#websocket-contract-q-4
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the bkex api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const [ type, query ] = this.handleMarketTypeAndParams ('watchTicker', market, params);
        const url = this.urls['api']['ws'][type];
        const messageHash = 'ticker:' + market['symbol'];
        let request = undefined;
        if (type === 'spot') {
            await this.connect (url);
            request = [
                'subQuotationSymbol',
                {
                    'symbol': market['id'],
                },
            ];
            request = '42/quotation,' + JSON.stringify (request);
        } else if (type === 'swap') {
            request = this.extend ({
                'event': 'sub',
                'topic': market['id'] + '.ticker',
            }, query);
        }
        return await this.watch (url, messageHash, request, messageHash);
    }

    handleSpotTicker (client, message) {
        //
        //    [{
        //        "symbol": BTC_USDT,
        //        "close": 7145.0806,
        //        "open": 7123.0407,
        //        "high": 7167.1034,
        //        "low": 7105.5237,
        //        "volume": 4214.5321,
        //        "quoteVolume": 94285313.4451,
        //        "change": 0.12
        //    }]
        //
        for (let i = 0; i < message.length; i++) {
            const rawTicker = message[i];
            const ticker = this.parseTicker (rawTicker);
            const symbol = ticker['symbol'];
            const messageHash = 'ticker:' + symbol;
            this.tickers[symbol] = ticker;
            client.resolve (this.tickers[symbol], messageHash);
        }
    }

    handleSwapTicker (client, message) {
        //
        //    {
        //        "type":"btc_usdt.ticker",
        //        "ts":1659319399003,
        //        "data":{
        //            "symbol":"btc_usdt",
        //            "amount":"2553.28",
        //            "volume":"60609744.48039",
        //            "open":"23775.65",
        //            "close":"23745.15",
        //            "high":"23852.37",
        //            "low":"23561.12",
        //            "lastPrice":"23745.15",
        //            "lastAmount":"0.06",
        //            "lastTime":1659336982046,
        //            "change":"-0.12"
        //        }
        //    }
        //
        const data = this.safeValue (message, 'data', {});
        const ticker = this.parseTicker (data);
        const symbol = ticker['symbol'];
        const messageHash = 'ticker:' + symbol;
        this.tickers[symbol] = ticker;
        client.resolve (this.tickers[symbol], messageHash);
    }

    requestId (symbol) {
        const requestId = this.sum (this.safeInteger (this.options, 'requestId', 0), 1);
        this.options['requestId'] = requestId;
        this.options['requestIds'][requestId] = symbol;
        return requestId.toString ();
    }

    async watchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bkex#watchOHLCV
         * @see https://bkexapi.github.io/docs/api_en.htm?shell#websocket-3
         * @see https://bkexapi.github.io/docs/api_en.htm?shell#websocket-contract-q-5
         * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
         * @param {int|undefined} limit the maximum amount of candles to fetch
         * @param {object} params extra parameters specific to the bkex api endpoint
         * @param {int} params.to Cut-off time stamp in seconds
         * @returns {[[int]]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const [ type, query ] = this.handleMarketTypeAndParams ('watchOHLCV', market, params);
        const url = this.urls['api']['ws'][type];
        let request = undefined;
        const ohlcvOptions = this.safeValue (this.options, 'watchOHLCV');
        const timeframes = this.safeValue (ohlcvOptions, 'timeframes', {});
        const messageHash = 'ohlcv:' + symbol;
        if (type === 'spot') {
            await this.connect (url);
            const spotTimeframes = this.safeValue (timeframes, 'spot', {});
            const requestId = this.requestId (symbol);
            timeframe = this.safeString (spotTimeframes, timeframe, timeframe);
            request = [
                'subKlineByRange',
                {
                    'symbol': market['id'],
                    'period': timeframe,
                    'from': since / 1000,
                    'to': this.safeInteger (params, 'to', this.seconds ()),
                    'no': requestId,
                },
            ];
            request = '42/quotation,' + JSON.stringify (request);
        } else if (type === 'swap') {
            const swapTimeframes = this.safeValue (timeframes, 'swap', {});
            timeframe = this.safeString (swapTimeframes, timeframe, timeframe);
            request = this.extend ({
                'event': 'sub',
                'topic': market['id'] + '.candle.' + timeframe,
            }, query);
        } else {
            throw ExchangeError (this.id + ' watchOHLCV does not support ' + type + ' markets yet');
        }
        const ohlcv = await this.watch (url, messageHash, request, messageHash);
        if (this.newUpdates) {
            limit = ohlcv.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (ohlcv, since, limit, 0, true);
    }

    handleSpotOHLCV (client, message) {
        //
        //    {
        //        "no": "157430756955441833",
        //        "noMore": false,
        //        "list":[
        //          {
        //            "volume": 194.2213,
        //            "close": 8765.4543,
        //            "quoteVolume": 31295.7543,
        //            "high": 8942.4962,
        //            "low": 8312.3154,
        //            "open": 8532.8129,
        //            "ts": 1574307629
        //          }]
        //    }
        //
        const requestId = this.safeString (message, 'no');
        const symbol = this.safeValue (this.options['requestIds'], requestId);
        const market = this.market (symbol);
        const list = this.safeValue (message, 'list', []);
        let stored = this.safeValue (this.ohlcvs, symbol);
        if (stored === undefined) {
            const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
            stored = new ArrayCacheByTimestamp (limit);
            this.ohlcvs[symbol] = stored;
        }
        for (let i = 0; i < list.length; i++) {
            const rawOHLCV = list[i];
            const parsed = this.parseOHLCV (rawOHLCV, market);
            // ws ts is returned in seconds
            parsed[0] = parsed[0] * 1000;
            stored.append (parsed);
        }
        const messageHash = 'ohlcv:' + symbol;
        client.resolve (stored, messageHash);
    }

    handleSwapOHLCV (client, message) {
        //
        //    {
        //        "type": "btc_usdt.candle.M1",
        //        "ts": 1662360553440,
        //        "data": [
        //            "473.15",
        //            "9355628.808",
        //            "19771.14",
        //            "19778.09",
        //            "19769.17",
        //            "19778.06",
        //            "1662360540000"
        //        ]
        //    }
        //
        const rawOHLCV = this.safeValue (message, 'data', []);
        const type = this.safeString (message, 'type', '');
        const parts = type.split ('.');
        const marketId = this.safeString (parts, 0);
        const symbol = this.safeSymbol (marketId, undefined, '_');
        let stored = this.safeValue (this.ohlcvs, symbol);
        if (stored === undefined) {
            const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
            stored = new ArrayCacheByTimestamp (limit);
            this.ohlcvs[symbol] = stored;
        }
        const parsed = this.parseWsSwapOHLCV (rawOHLCV);
        stored.append (parsed);
        const messageHash = 'ohlcv:' + symbol;
        client.resolve (stored, messageHash);
    }

    parseWsSwapOHLCV (ohlcv) {
        //
        //    [
        //        "473.15",
        //        "9355628.808",
        //        "19771.14",
        //        "19778.09",
        //        "19769.17",
        //        "19778.06",
        //        "1662360540000"
        //    ]
        //
        return [
            this.safeInteger (ohlcv, 6),
            this.safeFloat (ohlcv, 2),
            this.safeFloat (ohlcv, 3),
            this.safeFloat (ohlcv, 4),
            this.safeFloat (ohlcv, 5),
            this.safeFloat (ohlcv, 0),
        ];
    }

    async watchOrderBook (symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name bkex#watchOrderBook
         * @see https://bkexapi.github.io/docs/api_en.htm?shell#websocket-4
         * @see https://bkexapi.github.io/docs/api_en.htm?shell#websocket-contract-q-3
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return. Support 5, 10, 20
         * @param {object} params extra parameters specific to the bkex api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const [ type, query ] = this.handleMarketTypeAndParams ('watchOrderBook', market, params);
        const url = this.urls['api']['ws'][type];
        symbol = market['symbol'];
        const messageHash = 'orderbook' + ':' + symbol;
        let request = undefined;
        if (type === 'spot') {
            await this.connect (url);
            if (limit === undefined) {
                limit = 50;
            }
            request = [
                'subOrderDepth',
                {
                    'symbol': market['id'],
                    'number': limit,
                },
            ];
            request = '42/quotation,' + JSON.stringify (request);
        } else if (type === 'swap') {
            if (limit === undefined) {
                limit = 20;
            }
            request = this.extend ({
                'event': 'sub',
                'topic': market['id'] + '.' + limit + 'deep',
            }, query);
        } else {
            throw ExchangeError (this.id + ' watchOrderBook does not support ' + type + ' markets yet');
        }
        const orderbook = await this.watch (url, messageHash, request, messageHash);
        return orderbook.limit ();
    }

    handleSpotOrderBook (client, message) {
        //
        //    {
        //        symbol: "BTC_USDT",
        //        ts: "1673302556003",
        //        asks: [
        //          [
        //            "17202.99",
        //            "3.06188",
        //          ],
        //          [
        //            "17203.10",
        //            "1.03758",
        //          ],
        //        ],
        //        bids: [
        //          [
        //            "17202.51",
        //            "2.93101",
        //          ],
        //          [
        //            "17202.45",
        //            "0.68164",
        //          ],
        //        ],
        //    }
        //
        const timestamp = this.safeInteger (message, 'ts');
        const marketId = this.safeString (message, 'symbol');
        const symbol = this.safeSymbol (marketId, undefined, '_');
        let orderbook = this.safeValue (this.orderbooks, symbol);
        if (orderbook === undefined) {
            orderbook = this.orderBook ();
        }
        const snapshot = this.parseOrderBook (message, symbol, timestamp, 'bids', 'asks', 0, 1);
        orderbook.reset (snapshot);
        const messageHash = 'orderbook' + ':' + symbol;
        this.orderbooks[symbol] = orderbook;
        client.resolve (orderbook, messageHash);
    }

    handleSwapOrderBook (client, message) {
        //
        //    {
        //        "type":"btc_usdt.5deep",
        //        "ts":1658133356423,
        //        "data":{
        //            "symbol":"btc_usdt",
        //            "asks":[
        //                "22283.880000",
        //                "1.91",
        //                "22284.060000",
        //                "0.08",
        //                "22284.440000",
        //                "0.11",
        //                "22284.620000",
        //                "0.06",
        //                "22284.640000",
        //                "1.24"
        //            ],
        //            "bids":[
        //                "22283.200000",
        //                "1060",
        //                "22283.000000",
        //                "790",
        //                "22282.280000",
        //                "80",
        //                "22282.240000",
        //                "1150",
        //                "22282.210000",
        //                "940"
        //            ]
        //        }
        //    }
        //
        const timestamp = this.safeInteger (message, 'ts');
        const data = this.safeValue (message, 'data', {});
        const marketId = this.safeString (data, 'symbol');
        const symbol = this.safeSymbol (marketId, undefined, '_');
        let orderbook = this.safeValue (this.orderbooks, symbol);
        if (orderbook === undefined) {
            orderbook = this.orderBook ();
        }
        const snapshot = this.parseSwapOrderBook (data, symbol, timestamp, 'bids', 'asks', 0, 1);
        orderbook.reset (snapshot);
        const messageHash = 'orderbook' + ':' + symbol;
        this.orderbooks[symbol] = orderbook;
        client.resolve (orderbook, messageHash);
    }

    parseSwapBidsAsks (bidasks) {
        const result = [];
        for (let i = 0; i < bidasks.length; i = i + 2) {
            result.push ([ bidasks[i], bidasks[i + 1] ]);
        }
        return result;
    }

    parseSwapOrderBook (orderbook, symbol, timestamp = undefined, bidsKey = 'bids', asksKey = 'asks') {
        const bids = this.parseSwapBidsAsks (this.safeValue (orderbook, bidsKey, []));
        const asks = this.parseSwapBidsAsks (this.safeValue (orderbook, asksKey, []));
        return {
            'symbol': symbol,
            'bids': this.sortBy (bids, 0, true),
            'asks': this.sortBy (asks, 0),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'nonce': undefined,
        };
    }

    handleDelta (bookside, delta) {
        const bidAsk = this.parseBidAsk (delta, 'p', 's');
        bookside.storeArray (bidAsk);
    }

    handleDeltas (bookside, deltas) {
        for (let i = 0; i < deltas.length; i++) {
            this.handleDelta (bookside, deltas[i]);
        }
    }

    async watchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bkex#watchTrades
         * @see https://bkexapi.github.io/docs/api_en.htm?shell#websocket-5
         * @see https://bkexapi.github.io/docs/api_en.htm?shell#websocket-contract-q-6
         * @description watches information on multiple trades made in a market
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the bkex api endpoint
         * @param {int} params.number quantity of trades for spot markets
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const [ type, query ] = this.handleMarketTypeAndParams ('watchTrades', market, params);
        const url = this.urls['api']['ws'][type];
        const messageHash = 'trade:' + market['symbol'];
        let request = undefined;
        if (type === 'spot') {
            await this.connect (url);
            const number = this.safeInteger (params, 'number', 1);
            if (number < 1 || number > 50) {
                throw BadRequest (this.id + ' watchTrades() requires a number parameter between 1 and 50 (default is 50)');
            }
            request = [
                'quotationDealConnect',
                {
                    'symbol': market['id'],
                    'number': number,
                },
            ];
            request = '42/quotation,' + JSON.stringify (request);
        } else if (type === 'swap') {
            request = this.extend ({
                'event': 'sub',
                'topic': market['id'] + '.trade',
            }, query);
        }
        const trades = await this.watch (url, messageHash, request, messageHash);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    handleSpotTrades (client, message) {
        //
        //    [{
        //        "symbol": BTC_USDT,
        //        "price": 7145.0806,
        //        "volume": 0.1662,
        //        "direction": "B",
        //        "ts": 1577254059571
        //    }]
        //
        // testing showed only one symbol returned for each message
        const first = this.safeValue (message, 0);
        const marketId = this.safeString (first, 'symbol');
        const symbol = this.safeSymbol (marketId, undefined, '_');
        let stored = this.safeValue (this.trades, symbol);
        if (stored === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            stored = new ArrayCache (limit);
            this.trades[symbol] = stored;
        }
        for (let i = 0; i < message.length; i++) {
            const rawTrade = message[i];
            const trade = this.parseTrade (rawTrade);
            stored.append (trade);
        }
        const messageHash = 'trade' + ':' + symbol;
        client.resolve (stored, messageHash);
    }

    handleSwapTrades (client, message) {
        //
        //    {
        //        "type": "btc_usdt.trade",
        //        "ts": 1662361313562,
        //        "data": [
        //          "19788.12",
        //          "1",
        //          "15.06",
        //          "1662361313094"
        //        ]
        //    }
        //
        const type = this.safeString (message, 'type');
        const split = type.split ('.');
        const marketId = this.safeString (split, 0);
        const market = this.safeMarket (marketId, undefined, '_');
        const symbol = market['symbol'];
        const data = this.safeValue (message, 'data', []);
        let stored = this.safeValue (this.trades, symbol);
        if (stored === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            stored = new ArrayCache (limit);
            this.trades[symbol] = stored;
        }
        const parsed = this.parseWsTrade (data, market);
        stored.append (parsed);
        const messageHash = 'trade' + ':' + symbol;
        client.resolve (stored, messageHash);
    }

    parseWsTrade (trade, market = undefined) {
        //
        //    [
        //      "19788.12",
        //      "1",
        //      "15.06",
        //      "1662361313094"
        //    ]
        //
        const timestamp = this.safeInteger (trade, 3);
        const sideId = this.safeString (trade, 1);
        return this.safeTrade ({
            'id': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': this.safeString (market, 'symbol'),
            'order': undefined,
            'type': undefined,
            'side': (sideId === '1') ? 'buy' : 'sell',
            'takerOrMaker': undefined,
            'price': this.safeString (trade, 0),
            'amount': this.safeString (trade, 2),
            'cost': undefined,
            'fee': undefined,
            'info': trade,
        }, market);
    }

    async watchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bkex#watchOrders
         * @description watches information on multiple orders made by the user
         * @param {string|undefined} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the bkex api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure
         */
        await this.loadMarkets ();
        let market = undefined;
        let messageHash = 'orders';
        let subscriptionHash = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            symbol = market['symbol'];
            messageHash = 'orders:' + symbol;
        }
        const [ type, query ] = this.handleMarketTypeAndParams ('watchOrders', market, params);
        const url = this.urls['api']['ws'][type];
        let request = undefined;
        if (type === 'spot') {
            throw NotSupported (this.id + ' watchOrders is not supported for spot markets');  // testing showed channel only returns trades
        } else if (type === 'swap') {
            await this.authenticateSwap ();
            subscriptionHash = 'orders:swap';
            request = this.extend ({
                'event': 'sub',
                'topic': 'user.order',
            }, query);
        }
        const orders = await this.watch (url, messageHash, request, subscriptionHash);
        if (this.newUpdates) {
            limit = orders.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (orders, symbol, since, limit, true);
    }

    async watchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bkex#watchMyTrades
         * @description watches information on multiple trades made by the user
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the bkex api endpoint
         * @param {boolean} params.unifiedMargin use unified margin account
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html#trade-structure
         */
        await this.loadMarkets ();
        let market = undefined;
        let messageHash = 'myTrades';
        let susbcriptionHash = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            symbol = market['symbol'];
            messageHash = 'orders:' + symbol;
        }
        const [ type, query ] = this.handleMarketTypeAndParams ('watchMyTrades', market, params);
        const url = this.urls['api']['ws'][type];
        let request = undefined;
        if (type === 'spot') {
            susbcriptionHash = 'myTrades:spot';
            await this.connect (url);
            await this.authenticateSpot ();
            request = [ 'subUserOrderDeal' ];
            request = '42/account,' + JSON.stringify (request);
        } else if (type === 'swap') {
            await this.authenticateSwap ();
            susbcriptionHash = 'myTrades:swap';
            request = this.extend ({
                'event': 'sub',
                'topic': 'user.order',
            }, query);
        }
        const trades = await this.watch (url, messageHash, request, susbcriptionHash);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    handleSwapOrder (client, message) {
        //
        //    {
        //        "type":"user.order",
        //        "ts":1662367922965,
        //        "data":[
        //            {
        //                "id":"22090516520341901010000604204",
        //                "customID":"",
        //                "symbol":"btc_usdt",
        //                "type":2,
        //                "action":1,
        //                "side":2,
        //                "positionID":"220905163537440014195",
        //                "price":"0",
        //                "leverage":20,
        //                "amount":"1.2",
        //                "frozen":"0",
        //                "filledAmount":"0",
        //                "filledPrice":"0",
        //                "filledValue":"",
        //                "triggerType":2,
        //                "spPrice":"0",
        //                "slPrice":"0",
        //                "state":0,
        //                "profit":"",
        //                "fee":"",
        //                "pointFee":"",
        //                "pointProfit":"",
        //                "closePrice":"",
        //                "triggerPrice":"",
        //                "createdAt":1662367923419,
        //                "updatedAt":0
        //            }
        //        ]
        //    }
        //
        if (this.orders === undefined) {
            const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
            this.orders = new ArrayCacheBySymbolById (limit);
        }
        const orders = this.orders;
        const rawOrders = this.safeValue (message, 'data', []);
        for (let i = 0; i < rawOrders.length; i++) {
            const rawOrder = rawOrders[i];
            const order = this.parseOrder (rawOrder);
            orders.append (order);
            const messageHash = 'orders:' + order['symbol'];
            client.resolve (orders, messageHash);
        }
        client.resolve (orders, 'orders');
    }

    handleSpotMyTrade (client, message) {
        //
        //    {
        //        "id": "2023011311140905745058984",
        //        "symbol": "BTC_USDT",
        //        "dealVolume": "0.00100",
        //        "price": "18841.06",
        //        "feeCurrency": "BTC",
        //        "fee": "0.00000200",
        //        "orderId": "2023011311140901245053196",
        //        "tradeTime": 1673579649057,
        //        "orderSide": "BID"
        //    }
        // connected
        //    {
        //        "msg": "success",
        //        "code": 0,
        //        "status": 0
        //    }
        //
        const code = this.safeInteger (message, 'code');
        if (code === 0) {
            return;
        } else if (code !== undefined) {
            throw ExchangeError (this.id + ' ' + this.json (message));
        }
        let myTrades = this.myTrades;
        if (myTrades === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            myTrades = new ArrayCacheBySymbolById (limit);
        }
        const trade = this.parseMyTrade (message);
        myTrades.append (trade);
        let messageHash = 'myTrades:' + trade['symbol'];
        client.resolve (myTrades, messageHash);
        messageHash = 'myTrades';
        client.resolve (myTrades, messageHash);
    }

    handleMyTrade (client, message) {
        //
        //    {
        //        stream: 'trade_updates',
        //        data: {
        //          event: 'new',
        //          timestamp: '2022-12-16T07:28:51.67621869Z',
        //          order: {
        //            id: 'c2470331-8993-4051-bf5d-428d5bdc9a48',
        //            client_order_id: '0f1f3764-107a-4d09-8b9a-d75a11738f5c',
        //            created_at: '2022-12-16T02:28:51.673531798-05:00',
        //            updated_at: '2022-12-16T02:28:51.678736847-05:00',
        //            submitted_at: '2022-12-16T02:28:51.673015558-05:00',
        //            filled_at: null,
        //            expired_at: null,
        //            cancel_requested_at: null,
        //            canceled_at: null,
        //            failed_at: null,
        //            replaced_at: null,
        //            replaced_by: null,
        //            replaces: null,
        //            asset_id: '276e2673-764b-4ab6-a611-caf665ca6340',
        //            symbol: 'BTC/USD',
        //            asset_class: 'crypto',
        //            notional: null,
        //            qty: '0.01',
        //            filled_qty: '0',
        //            filled_avg_price: null,
        //            order_class: '',
        //            order_type: 'market',
        //            type: 'market',
        //            side: 'buy',
        //            time_in_force: 'gtc',
        //            limit_price: null,
        //            stop_price: null,
        //            status: 'new',
        //            extended_hours: false,
        //            legs: null,
        //            trail_percent: null,
        //            trail_price: null,
        //            hwm: null
        //          },
        //          execution_id: '5f781a30-b9a3-4c86-b466-2175850cf340'
        //        }
        //      }
        //
        const data = this.safeValue (message, 'data', {});
        const event = this.safeString (data, 'event');
        if (event !== 'fill' && event !== 'partial_fill') {
            return;
        }
        const rawOrder = this.safeValue (data, 'order', {});
        let myTrades = this.myTrades;
        if (myTrades === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            myTrades = new ArrayCacheBySymbolById (limit);
        }
        const trade = this.parseMyTrade (rawOrder);
        myTrades.append (trade);
        let messageHash = 'myTrades:' + trade['symbol'];
        client.resolve (myTrades, messageHash);
        messageHash = 'myTrades';
        client.resolve (myTrades, messageHash);
    }

    parseMyTrade (trade, market = undefined) {
        //
        // spot
        //     {
        //         "id": "2023011311140905745058984",
        //         "symbol": "BTC_USDT",
        //         "dealVolume": "0.00100",
        //         "price": "18841.06",
        //         "feeCurrency": "BTC",
        //         "fee": "0.00000200",
        //         "orderId": "2023011311140901245053196",
        //         "tradeTime": 1673579649057,
        //         "orderSide": "BID"
        //     }
        //
        const marketId = this.safeString (trade, 'symbol');
        const timestamp = this.safeInteger (trade, 'tradeTime');
        const sideId = this.safeString (trade, 'orderSide');
        const feeCurrencyId = this.safeString (trade, 'feeCurrency');
        const fee = {
            'currency': this.safeCurrencyCode (feeCurrencyId),
            'cost': this.safeNumber (trade, 'fee'),
        };
        return this.safeTrade ({
            'id': this.safeString (trade, 'id'),
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': this.safeSymbol (marketId, market, '_'),
            'order': this.safeString (trade, 'orderId'),
            'type': undefined,
            'side': (sideId === 'BID') ? 'buy' : 'sell',
            'takerOrMaker': undefined,
            'price': this.safeString (trade, 'price'),
            'amount': this.safeString (trade, 'dealVolume'),
            'cost': undefined,
            'fee': fee,
        }, market);
    }

    async authenticateSpot (params = {}) {
        this.checkRequiredCredentials ();
        const messageHash = 'authenticatedSpot';
        const url = this.urls['api']['ws']['spot'];
        const client = this.client (url);
        let future = this.safeValue (client.subscriptions, messageHash);
        if (future === undefined) {
            future = client.future (messageHash);
            await this.watch (url, '40/account', '40/account', '40/account');
            const milliseconds = this.milliseconds ();
            const signatureParams = 'timestamp=' + milliseconds.toString ();
            const signature = this.hmac (this.encode (signatureParams), this.encode (this.secret), 'sha256');
            let request = [
                'userLogin',
                {
                    'signature': signature,
                    'accessKey': this.apiKey,
                    'timestamp': milliseconds,
                },
            ];
            request = '42/account,' + JSON.stringify (request);
            this.spawn (this.watch, url, messageHash, request, messageHash, future);
        }
        return await future;
    }

    async authenticateSwap (params = {}) {
        this.checkRequiredCredentials ();
        const messageHash = 'authenticatedSwap';
        const url = this.urls['api']['ws']['swap'];
        const client = this.client (url);
        let future = this.safeValue (client.subscriptions, messageHash);
        if (future === undefined) {
            future = client.future (messageHash);
            const request = {
                'event': 'auth',
                'accessKey': this.apiKey,
            };
            this.spawn (this.watch, url, messageHash, request, messageHash, future);
        }
        return await future;
    }

    handleErrorMessage (client, message) {
        //
        //    {
        //        T: 'error',
        //        code: 400,
        //        msg: 'invalid syntax'
        //    }
        //
        const code = this.safeString (message, 'code');
        const msg = this.safeValue (message, 'msg', {});
        throw new ExchangeError (this.id + ' code: ' + code + ' message: ' + msg);
    }

    handleUserLogin (client, message) {
        //
        //  success
        //    {
        //        "msg": "success",
        //        "code": 0,
        //        "status": 0
        //    }
        //  fail
        //    {
        //        "msg": "API authentication failed",
        //        "code": 1002,
        //        "status": 0
        //    }
        //
        const code = this.safeInteger (message, 'code');
        if (code === 0) {
            client.resolve (message, 'authenticatedSpot');
        } else {
            throw AuthenticationError (this.id + this.json (message));
        }
        client.resolve ();
        return message;
    }

    ping (client) {
        if (client.url === this.urls['api']['ws']['spot']) {
            return '2';
        }
        return { 'event': 'ping' };
    }

    handleMessage (client, message) {
        if (client.url === this.urls['api']['ws']['spot']) {
            this.handleSpotMessage (client, message);
        } else if (client.url === this.urls['api']['ws']['swap']) {
            this.handleSwapMessage (client, message);
        } else {
            throw ExchangeError (this.id + ' received message from unknown client url: ' + client.url);
        }
    }

    async handle40 (client, message) {
        let messageHash = '40/quotation';
        await this.watch (client.url, messageHash, messageHash, messageHash);
        messageHash = 'connect:' + client.url;
        client.resolve (message, messageHash);
    }

    handle40Quotation (client, message) {
        //
        // 40/quotation
        //
        const messageHash = '40/quotation';
        client.resolve (message, messageHash);
    }

    handle40Account (client, message) {
        //
        // 40/account
        //
        const messageHash = '40/account';
        client.resolve (message, messageHash);
    }

    handleSpotMessage (client, message) {
        if (message === '40') {
            return this.handle40 (client, message);
        }
        let methods = {
            '40': this.handle40,
            '40/quotation': this.handle40Quotation,
            '40/account': this.handle40Account,
        };
        let method = this.safeValue (methods, message);
        if (method !== undefined) {
            return method.call (this, client, message);
        }
        const messageLength = message.length;
        const commaIndex = message.indexOf (',');
        const rawMessage = message.slice (commaIndex + 1, messageLength);
        const parsedMessage = this.parseJson (rawMessage);
        const type = this.safeString (parsedMessage, 0);
        const data = this.safeValue (parsedMessage, 1);
        methods = {
            'quotationOrderDepth': this.handleSpotOrderBook,
            'symbolKlineByRange': this.handleSpotOHLCV,
            'quotationAllDeal': this.handleSpotTrades,
            'quotationListDeal': this.handleSpotTrades,
            'qPairsUpdateStats': this.handleSpotTicker,
            'userLogin': this.handleUserLogin,
            'subUserOrderDeal': this.handleSpotMyTrade,
            'subUserAccountInfo': this.handleSpotBalance,
        };
        method = this.safeValue (methods, type);
        if (method !== undefined) {
            return method.call (this, client, data);
        }
    }

    handleSwapMessage (client, message) {
        const type = this.safeString (message, 'type', '');
        const methods = {
            'deep': this.handleSwapOrderBook,
            'ticker': this.handleSwapTicker,
            'trade': this.handleSwapTrades,
            'candle': this.handleSwapOHLCV,
            'user.order': this.handleSwapOrder,
            'user.account': this.handleSwapBalance,
        };
        const keys = Object.keys (methods);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            if (type.indexOf (key) >= 0) {
                const method = methods[key];
                return method.call (this, client, message);
            }
        }
        return message;
    }

    handleSubscription (client, message) {
        //
        // crypto
        //    {
        //          T: 'subscription',
        //          trades: [],
        //          quotes: [ 'BTC/USDT' ],
        //          orderbooks: [],
        //          bars: [],
        //          updatedBars: [],
        //          dailyBars: []
        //    }
        // trading
        //    {
        //        stream: 'listening',
        //        data: {
        //            streams: ['trade_updates']
        //        }
        //    }
        //
        return message;
    }
};
