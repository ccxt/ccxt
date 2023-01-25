'use strict';

//  ---------------------------------------------------------------------------

const krakenRest = require ('../kraken.js');
const { BadSymbol, BadRequest, ExchangeError, NotSupported, InvalidNonce } = require ('../base/errors');
const { ArrayCache, ArrayCacheByTimestamp, ArrayCacheBySymbolById } = require ('./base/Cache');
const Precise = require ('../base/Precise.js');

//  ---------------------------------------------------------------------------

module.exports = class kraken extends krakenRest {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchBalance': false, // no such type of subscription as of 2021-01-05
                'watchMyTrades': true,
                'watchOHLCV': true,
                'watchOrderBook': true,
                'watchOrders': true,
                'watchTicker': true,
                'watchTickers': false, // for now
                'watchTrades': true,
                // 'watchHeartbeat': true,
                // 'watchStatus': true,
            },
            'urls': {
                'api': {
                    'ws': {
                        'public': 'wss://ws.kraken.com',
                        'private': 'wss://ws-auth.kraken.com',
                        'beta': 'wss://beta-ws.kraken.com',
                    },
                },
            },
            'versions': {
                'ws': '0.2.0',
            },
            'options': {
                'tradesLimit': 1000,
                'OHLCVLimit': 1000,
                'ordersLimit': 1000,
                'symbolsByOrderId': {},
                'checksum': true,
            },
            'exceptions': {
                'ws': {
                    'exact': {
                        'Event(s) not found': BadRequest,
                    },
                    'broad': {
                        'Currency pair not in ISO 4217-A3 format': BadSymbol,
                    },
                },
            },
        });
    }

    handleTicker (client, message, subscription) {
        //
        //     [
        //         0, // channelID
        //         {
        //             "a": [ "5525.40000", 1, "1.000" ], // ask, wholeAskVolume, askVolume
        //             "b": [ "5525.10000", 1, "1.000" ], // bid, wholeBidVolume, bidVolume
        //             "c": [ "5525.10000", "0.00398963" ], // closing price, volume
        //             "h": [ "5783.00000", "5783.00000" ], // high price today, high price 24h ago
        //             "l": [ "5505.00000", "5505.00000" ], // low price today, low price 24h ago
        //             "o": [ "5760.70000", "5763.40000" ], // open price today, open price 24h ago
        //             "p": [ "5631.44067", "5653.78939" ], // vwap today, vwap 24h ago
        //             "t": [ 11493, 16267 ], // number of trades today, 24 hours ago
        //             "v": [ "2634.11501494", "3591.17907851" ], // volume today, volume 24 hours ago
        //         },
        //         "ticker",
        //         "XBT/USD"
        //     ]
        //
        const wsName = message[3];
        const name = 'ticker';
        const messageHash = name + ':' + wsName;
        const market = this.safeValue (this.options['marketsByWsName'], wsName);
        const symbol = market['symbol'];
        const ticker = message[1];
        const vwap = this.safeFloat (ticker['p'], 0);
        let quoteVolume = undefined;
        const baseVolume = this.safeFloat (ticker['v'], 0);
        if (baseVolume !== undefined && vwap !== undefined) {
            quoteVolume = baseVolume * vwap;
        }
        const last = this.safeFloat (ticker['c'], 0);
        const timestamp = this.milliseconds ();
        const result = {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker['h'], 0),
            'low': this.safeFloat (ticker['l'], 0),
            'bid': this.safeFloat (ticker['b'], 0),
            'bidVolume': this.safeFloat (ticker['b'], 2),
            'ask': this.safeFloat (ticker['a'], 0),
            'askVolume': this.safeFloat (ticker['a'], 2),
            'vwap': vwap,
            'open': this.safeFloat (ticker['o'], 0),
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        };
        // todo add support for multiple tickers (may be tricky)
        // kraken confirms multi-pair subscriptions separately one by one
        // trigger correct watchTickers calls upon receiving any of symbols
        this.tickers[symbol] = result;
        client.resolve (result, messageHash);
    }

    handleTrades (client, message, subscription) {
        //
        //     [
        //         0, // channelID
        //         [ //     price        volume         time             side type misc
        //             [ "5541.20000", "0.15850568", "1534614057.321597", "s", "l", "" ],
        //             [ "6060.00000", "0.02455000", "1534614057.324998", "b", "l", "" ],
        //         ],
        //         "trade",
        //         "XBT/USD"
        //     ]
        //
        const wsName = this.safeString (message, 3);
        const name = this.safeString (message, 2);
        const messageHash = name + ':' + wsName;
        const market = this.safeValue (this.options['marketsByWsName'], wsName);
        const symbol = market['symbol'];
        let stored = this.safeValue (this.trades, symbol);
        if (stored === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            stored = new ArrayCache (limit);
            this.trades[symbol] = stored;
        }
        const trades = this.safeValue (message, 1, []);
        const parsed = this.parseTrades (trades, market);
        for (let i = 0; i < parsed.length; i++) {
            stored.append (parsed[i]);
        }
        client.resolve (stored, messageHash);
    }

    handleOHLCV (client, message, subscription) {
        //
        //     [
        //         216, // channelID
        //         [
        //             '1574454214.962096', // Time, seconds since epoch
        //             '1574454240.000000', // End timestamp of the interval
        //             '0.020970', // Open price at midnight UTC
        //             '0.020970', // Intraday high price
        //             '0.020970', // Intraday low price
        //             '0.020970', // Closing price at midnight UTC
        //             '0.020970', // Volume weighted average price
        //             '0.08636138', // Accumulated volume today
        //             1, // Number of trades today
        //         ],
        //         'ohlc-1', // Channel Name of subscription
        //         'ETH/XBT', // Asset pair
        //     ]
        //
        const info = this.safeValue (subscription, 'subscription', {});
        const interval = this.safeInteger (info, 'interval');
        const name = this.safeString (info, 'name');
        const wsName = this.safeString (message, 3);
        const market = this.safeValue (this.options['marketsByWsName'], wsName);
        const symbol = market['symbol'];
        const timeframe = this.findTimeframe (interval);
        const duration = this.parseTimeframe (timeframe);
        if (timeframe !== undefined) {
            const candle = this.safeValue (message, 1);
            const messageHash = name + ':' + timeframe + ':' + wsName;
            let timestamp = this.safeFloat (candle, 1);
            timestamp -= duration;
            const result = [
                parseInt (timestamp * 1000),
                this.safeFloat (candle, 2),
                this.safeFloat (candle, 3),
                this.safeFloat (candle, 4),
                this.safeFloat (candle, 5),
                this.safeFloat (candle, 7),
            ];
            this.ohlcvs[symbol] = this.safeValue (this.ohlcvs, symbol, {});
            let stored = this.safeValue (this.ohlcvs[symbol], timeframe);
            if (stored === undefined) {
                const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
                stored = new ArrayCacheByTimestamp (limit);
                this.ohlcvs[symbol][timeframe] = stored;
            }
            stored.append (result);
            client.resolve (stored, messageHash);
        }
    }

    requestId () {
        // their support said that reqid must be an int32, not documented
        const reqid = this.sum (this.safeInteger (this.options, 'reqid', 0), 1);
        this.options['reqid'] = reqid;
        return reqid;
    }

    async watchPublic (name, symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const wsName = this.safeValue (market['info'], 'wsname');
        const messageHash = name + ':' + wsName;
        const url = this.urls['api']['ws']['public'];
        const requestId = this.requestId ();
        const subscribe = {
            'event': 'subscribe',
            'reqid': requestId,
            'pair': [
                wsName,
            ],
            'subscription': {
                'name': name,
            },
        };
        const request = this.deepExtend (subscribe, params);
        return await this.watch (url, messageHash, request, messageHash);
    }

    async watchTicker (symbol, params = {}) {
        /**
         * @method
         * @name kraken#watchTicker
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the kraken api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        return await this.watchPublic ('ticker', symbol, params);
    }

    async watchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name kraken#watchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the kraken api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        symbol = this.symbol (symbol);
        const name = 'trade';
        const trades = await this.watchPublic (name, symbol, params);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    async watchOrderBook (symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name kraken#watchOrderBook
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the kraken api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        const name = 'book';
        const request = {};
        if (limit !== undefined) {
            if ((limit === 10) || (limit === 25) || (limit === 100) || (limit === 500) || (limit === 1000)) {
                request['subscription'] = {
                    'depth': limit, // default 10, valid options 10, 25, 100, 500, 1000
                };
            } else {
                throw new NotSupported (this.id + ' watchOrderBook accepts limit values of 10, 25, 100, 500 and 1000 only');
            }
        }
        const orderbook = await this.watchPublic (name, symbol, this.extend (request, params));
        return orderbook.limit ();
    }

    async watchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name kraken#watchOHLCV
         * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
         * @param {int|undefined} limit the maximum amount of candles to fetch
         * @param {object} params extra parameters specific to the kraken api endpoint
         * @returns {[[int]]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const name = 'ohlc';
        const market = this.market (symbol);
        symbol = market['symbol'];
        const wsName = this.safeValue (market['info'], 'wsname');
        const messageHash = name + ':' + timeframe + ':' + wsName;
        const url = this.urls['api']['ws']['public'];
        const requestId = this.requestId ();
        const subscribe = {
            'event': 'subscribe',
            'reqid': requestId,
            'pair': [
                wsName,
            ],
            'subscription': {
                'name': name,
                'interval': this.timeframes[timeframe],
            },
        };
        const request = this.deepExtend (subscribe, params);
        const ohlcv = await this.watch (url, messageHash, request, messageHash);
        if (this.newUpdates) {
            limit = ohlcv.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (ohlcv, since, limit, 0, true);
    }

    async loadMarkets (reload = false, params = {}) {
        const markets = await super.loadMarkets (reload, params);
        let marketsByWsName = this.safeValue (this.options, 'marketsByWsName');
        if ((marketsByWsName === undefined) || reload) {
            marketsByWsName = {};
            for (let i = 0; i < this.symbols.length; i++) {
                const symbol = this.symbols[i];
                const market = this.markets[symbol];
                if (market['darkpool']) {
                    const info = this.safeValue (market, 'info', {});
                    const altname = this.safeString (info, 'altname');
                    const wsName = altname.slice (0, 3) + '/' + altname.slice (3);
                    marketsByWsName[wsName] = market;
                } else {
                    const info = this.safeValue (market, 'info', {});
                    const wsName = this.safeString (info, 'wsname');
                    marketsByWsName[wsName] = market;
                }
            }
            this.options['marketsByWsName'] = marketsByWsName;
        }
        return markets;
    }

    async watchHeartbeat (params = {}) {
        await this.loadMarkets ();
        const event = 'heartbeat';
        const url = this.urls['api']['ws']['public'];
        return await this.watch (url, event);
    }

    handleHeartbeat (client, message) {
        //
        // every second (approx) if no other updates are sent
        //
        //     { "event": "heartbeat" }
        //
        const event = this.safeString (message, 'event');
        client.resolve (message, event);
    }

    handleOrderBook (client, message, subscription) {
        //
        // first message (snapshot)
        //
        //     [
        //         1234, // channelID
        //         {
        //             "as": [
        //                 [ "5541.30000", "2.50700000", "1534614248.123678" ],
        //                 [ "5541.80000", "0.33000000", "1534614098.345543" ],
        //                 [ "5542.70000", "0.64700000", "1534614244.654432" ]
        //             ],
        //             "bs": [
        //                 [ "5541.20000", "1.52900000", "1534614248.765567" ],
        //                 [ "5539.90000", "0.30000000", "1534614241.769870" ],
        //                 [ "5539.50000", "5.00000000", "1534613831.243486" ]
        //             ]
        //         },
        //         "book-10",
        //         "XBT/USD"
        //     ]
        //
        // subsequent updates
        //
        //     [
        //         1234,
        //         { // optional
        //             "a": [
        //                 [ "5541.30000", "2.50700000", "1534614248.456738" ],
        //                 [ "5542.50000", "0.40100000", "1534614248.456738" ]
        //             ]
        //         },
        //         { // optional
        //             "b": [
        //                 [ "5541.30000", "0.00000000", "1534614335.345903" ]
        //             ]
        //         },
        //         "book-10",
        //         "XBT/USD"
        //     ]
        //
        const messageLength = message.length;
        const wsName = message[messageLength - 1];
        const bookDepthString = message[messageLength - 2];
        const parts = bookDepthString.split ('-');
        const depth = this.safeInteger (parts, 1, 10);
        const market = this.safeValue (this.options['marketsByWsName'], wsName);
        const symbol = market['symbol'];
        let timestamp = undefined;
        const messageHash = 'book:' + wsName;
        // if this is a snapshot
        if ('as' in message[1]) {
            // todo get depth from marketsByWsName
            this.orderbooks[symbol] = this.orderBook ({}, depth);
            const orderbook = this.orderbooks[symbol];
            const sides = {
                'as': 'asks',
                'bs': 'bids',
            };
            const keys = Object.keys (sides);
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                const side = sides[key];
                const bookside = orderbook[side];
                const deltas = this.safeValue (message[1], key, []);
                timestamp = this.handleDeltas (bookside, deltas, timestamp);
            }
            orderbook['symbol'] = symbol;
            orderbook['timestamp'] = timestamp;
            orderbook['datetime'] = this.iso8601 (timestamp);
            client.resolve (orderbook, messageHash);
        } else {
            const orderbook = this.orderbooks[symbol];
            // else, if this is an orderbook update
            let a = undefined;
            let b = undefined;
            let c = undefined;
            if (messageLength === 5) {
                a = this.safeValue (message[1], 'a', []);
                b = this.safeValue (message[2], 'b', []);
                c = this.safeInteger (message[1], 'c');
                c = this.safeInteger (message[2], 'c', c);
            } else {
                c = this.safeInteger (message[1], 'c');
                if ('a' in message[1]) {
                    a = this.safeValue (message[1], 'a', []);
                } else {
                    b = this.safeValue (message[1], 'b', []);
                }
            }
            const storedAsks = orderbook['asks'];
            const storedBids = orderbook['bids'];
            let example = undefined;
            if (a !== undefined) {
                timestamp = this.handleDeltas (storedAsks, a, timestamp);
                example = this.safeValue (a, 0);
            }
            if (b !== undefined) {
                timestamp = this.handleDeltas (storedBids, b, timestamp);
                example = this.safeValue (b, 0);
            }
            // don't remove this line or I will poop on your face
            orderbook.limit ();
            const checksum = this.safeValue (this.options, 'checksum', true);
            if (checksum) {
                const priceString = this.safeString (example, 0);
                const amountString = this.safeString (example, 1);
                const priceParts = priceString.split ('.');
                const amountParts = amountString.split ('.');
                const priceLength = priceParts[1].length - 0;
                const amountLength = amountParts[1].length - 0;
                const payloadArray = [];
                if (c !== undefined) {
                    for (let i = 0; i < 10; i++) {
                        const formatted = this.formatNumber (storedAsks[i][0], priceLength) + this.formatNumber (storedAsks[i][1], amountLength);
                        payloadArray.push (formatted);
                    }
                    for (let i = 0; i < 10; i++) {
                        const formatted = this.formatNumber (storedBids[i][0], priceLength) + this.formatNumber (storedBids[i][1], amountLength);
                        payloadArray.push (formatted);
                    }
                }
                const payload = payloadArray.join ('');
                const localChecksum = this.crc32 (payload, false);
                if (localChecksum !== c) {
                    const error = new InvalidNonce (this.id + ' invalid checksum');
                    client.reject (error, messageHash);
                }
            }
            orderbook['symbol'] = symbol;
            orderbook['timestamp'] = timestamp;
            orderbook['datetime'] = this.iso8601 (timestamp);
            client.resolve (orderbook, messageHash);
        }
    }

    formatNumber (n, length) {
        const string = this.numberToString (n);
        const parts = string.split ('.');
        const integer = this.safeString (parts, 0);
        const decimals = this.safeString (parts, 1, '');
        const paddedDecimals = decimals.padEnd (length, '0');
        const joined = integer + paddedDecimals;
        let i = 0;
        while (joined[i] === '0') {
            i += 1;
        }
        if (i > 0) {
            return joined.slice (i);
        } else {
            return joined;
        }
    }

    handleDeltas (bookside, deltas, timestamp) {
        for (let j = 0; j < deltas.length; j++) {
            const delta = deltas[j];
            const price = parseFloat (delta[0]);
            const amount = parseFloat (delta[1]);
            const oldTimestamp = timestamp ? timestamp : 0;
            timestamp = Math.max (oldTimestamp, parseInt (parseFloat (delta[2]) * 1000));
            bookside.store (price, amount);
        }
        return timestamp;
    }

    handleSystemStatus (client, message) {
        //
        // todo: answer the question whether handleSystemStatus should be renamed
        // and unified as handleStatus for any usage pattern that
        // involves system status and maintenance updates
        //
        //     {
        //         connectionID: 15527282728335292000,
        //         event: 'systemStatus',
        //         status: 'online', // online|maintenance|(custom status tbd)
        //         version: '0.2.0'
        //     }
        //
        return message;
    }

    async authenticate (params = {}) {
        const url = this.urls['api']['ws']['private'];
        const client = this.client (url);
        const authenticated = 'authenticated';
        let subscription = this.safeValue (client.subscriptions, authenticated);
        if (subscription === undefined) {
            const response = await this.privatePostGetWebSocketsToken (params);
            //
            //     {
            //         "error":[],
            //         "result":{
            //             "token":"xeAQ\/RCChBYNVh53sTv1yZ5H4wIbwDF20PiHtTF+4UI",
            //             "expires":900
            //         }
            //     }
            //
            subscription = this.safeValue (response, 'result');
            client.subscriptions[authenticated] = subscription;
        }
        return this.safeString (subscription, 'token');
    }

    async watchPrivate (name, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const token = await this.authenticate ();
        const subscriptionHash = name;
        let messageHash = name;
        if (symbol !== undefined) {
            symbol = this.symbol (symbol);
            messageHash += ':' + symbol;
        }
        const url = this.urls['api']['ws']['private'];
        const requestId = this.requestId ();
        const subscribe = {
            'event': 'subscribe',
            'reqid': requestId,
            'subscription': {
                'name': name,
                'token': token,
            },
        };
        const request = this.deepExtend (subscribe, params);
        const result = await this.watch (url, messageHash, request, subscriptionHash);
        if (this.newUpdates) {
            limit = result.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (result, symbol, since, limit, true);
    }

    async watchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name kraken#watchMyTrades
         * @description watches information on multiple trades made by the user
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the kraken api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure
         */
        return await this.watchPrivate ('ownTrades', symbol, since, limit, params);
    }

    handleMyTrades (client, message, subscription = undefined) {
        //
        //     [
        //         [
        //             {
        //                 'TT5UC3-GOIRW-6AZZ6R': {
        //                     cost: '1493.90107',
        //                     fee: '3.88415',
        //                     margin: '0.00000',
        //                     ordertxid: 'OTLAS3-RRHUF-NDWH5A',
        //                     ordertype: 'market',
        //                     pair: 'XBT/USDT',
        //                     postxid: 'TKH2SE-M7IF5-CFI7LT',
        //                     price: '6851.50005',
        //                     time: '1586822919.335498',
        //                     type: 'sell',
        //                     vol: '0.21804000'
        //                 }
        //             },
        //             {
        //                 'TIY6G4-LKLAI-Y3GD4A': {
        //                     cost: '22.17134',
        //                     fee: '0.05765',
        //                     margin: '0.00000',
        //                     ordertxid: 'ODQXS7-MOLK6-ICXKAA',
        //                     ordertype: 'market',
        //                     pair: 'ETH/USD',
        //                     postxid: 'TKH2SE-M7IF5-CFI7LT',
        //                     price: '169.97999',
        //                     time: '1586340530.895739',
        //                     type: 'buy',
        //                     vol: '0.13043500'
        //                 }
        //             },
        //         ],
        //         'ownTrades',
        //         { sequence: 1 }
        //     ]
        //
        const allTrades = this.safeValue (message, 0, []);
        const allTradesLength = allTrades.length;
        if (allTradesLength > 0) {
            if (this.myTrades === undefined) {
                const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
                this.myTrades = new ArrayCache (limit);
            }
            const stored = this.myTrades;
            const symbols = {};
            for (let i = 0; i < allTrades.length; i++) {
                const trades = this.safeValue (allTrades, i, {});
                const ids = Object.keys (trades);
                for (let j = 0; j < ids.length; j++) {
                    const id = ids[j];
                    const trade = trades[id];
                    const parsed = this.parseWsTrade (this.extend ({ 'id': id }, trade));
                    stored.append (parsed);
                    const symbol = parsed['symbol'];
                    symbols[symbol] = true;
                }
            }
            const name = 'ownTrades';
            client.resolve (this.myTrades, name);
            const keys = Object.keys (symbols);
            for (let i = 0; i < keys.length; i++) {
                const messageHash = name + ':' + keys[i];
                client.resolve (this.myTrades, messageHash);
            }
        }
    }

    parseWsTrade (trade, market = undefined) {
        //
        //     {
        //         id: 'TIMIRG-WUNNE-RRJ6GT', // injected from outside
        //         ordertxid: 'OQRPN2-LRHFY-HIFA7D',
        //         postxid: 'TKH2SE-M7IF5-CFI7LT',
        //         pair: 'USDCUSDT',
        //         time: 1586340086.457,
        //         type: 'sell',
        //         ordertype: 'market',
        //         price: '0.99860000',
        //         cost: '22.16892001',
        //         fee: '0.04433784',
        //         vol: '22.20000000',
        //         margin: '0.00000000',
        //         misc: ''
        //     }
        //
        //     {
        //         id: 'TIY6G4-LKLAI-Y3GD4A',
        //         cost: '22.17134',
        //         fee: '0.05765',
        //         margin: '0.00000',
        //         ordertxid: 'ODQXS7-MOLK6-ICXKAA',
        //         ordertype: 'market',
        //         pair: 'ETH/USD',
        //         postxid: 'TKH2SE-M7IF5-CFI7LT',
        //         price: '169.97999',
        //         time: '1586340530.895739',
        //         type: 'buy',
        //         vol: '0.13043500'
        //     }
        //
        const wsName = this.safeString (trade, 'pair');
        market = this.safeValue (this.options['marketsByWsName'], wsName, market);
        let symbol = undefined;
        const orderId = this.safeString (trade, 'ordertxid');
        const id = this.safeString2 (trade, 'id', 'postxid');
        const timestamp = this.safeTimestamp (trade, 'time');
        const side = this.safeString (trade, 'type');
        const type = this.safeString (trade, 'ordertype');
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'vol');
        let cost = undefined;
        let fee = undefined;
        if ('fee' in trade) {
            let currency = undefined;
            if (market !== undefined) {
                currency = market['quote'];
            }
            fee = {
                'cost': this.safeFloat (trade, 'fee'),
                'currency': currency,
            };
        }
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        if (price !== undefined) {
            if (amount !== undefined) {
                cost = price * amount;
            }
        }
        return {
            'id': id,
            'order': orderId,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': type,
            'side': side,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
        };
    }

    async watchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name kraken#watchOrders
         * @see https://docs.kraken.com/websockets/#message-openOrders
         * @description watches information on multiple orders made by the user
         * @param {string|undefined} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the kraken api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        return await this.watchPrivate ('openOrders', symbol, since, limit, params);
    }

    handleOrders (client, message, subscription = undefined) {
        //
        //     [
        //         [
        //             {
        //                 "OGTT3Y-C6I3P-XRI6HX": {
        //                     "cost": "0.00000",
        //                     "descr": {
        //                         "close": "",
        //                         "leverage": "0:1",
        //                         "order": "sell 10.00345345 XBT/EUR @ limit 34.50000 with 0:1 leverage",
        //                         "ordertype": "limit",
        //                         "pair": "XBT/EUR",
        //                         "price": "34.50000",
        //                         "price2": "0.00000",
        //                         "type": "sell"
        //                     },
        //                     "expiretm": "0.000000",
        //                     "fee": "0.00000",
        //                     "limitprice": "34.50000",
        //                     "misc": "",
        //                     "oflags": "fcib",
        //                     "opentm": "0.000000",
        //                     "price": "34.50000",
        //                     "refid": "OKIVMP-5GVZN-Z2D2UA",
        //                     "starttm": "0.000000",
        //                     "status": "open",
        //                     "stopprice": "0.000000",
        //                     "userref": 0,
        //                     "vol": "10.00345345",
        //                     "vol_exec": "0.00000000"
        //                 }
        //             },
        //             {
        //                 "OGTT3Y-C6I3P-XRI6HX": {
        //                     "cost": "0.00000",
        //                     "descr": {
        //                         "close": "",
        //                         "leverage": "0:1",
        //                         "order": "sell 0.00000010 XBT/EUR @ limit 5334.60000 with 0:1 leverage",
        //                         "ordertype": "limit",
        //                         "pair": "XBT/EUR",
        //                         "price": "5334.60000",
        //                         "price2": "0.00000",
        //                         "type": "sell"
        //                     },
        //                     "expiretm": "0.000000",
        //                     "fee": "0.00000",
        //                     "limitprice": "5334.60000",
        //                     "misc": "",
        //                     "oflags": "fcib",
        //                     "opentm": "0.000000",
        //                     "price": "5334.60000",
        //                     "refid": "OKIVMP-5GVZN-Z2D2UA",
        //                     "starttm": "0.000000",
        //                     "status": "open",
        //                     "stopprice": "0.000000",
        //                     "userref": 0,
        //                     "vol": "0.00000010",
        //                     "vol_exec": "0.00000000"
        //                 }
        //             },
        //         ],
        //         "openOrders",
        //         { "sequence": 234 }
        //     ]
        //
        // status-change
        //
        //     [
        //         [
        //             { "OGTT3Y-C6I3P-XRI6HX": { "status": "closed" }},
        //             { "OGTT3Y-C6I3P-XRI6HX": { "status": "closed" }},
        //         ],
        //         "openOrders",
        //         { "sequence": 59342 }
        //     ]
        //
        const allOrders = this.safeValue (message, 0, []);
        const allOrdersLength = allOrders.length;
        if (allOrdersLength > 0) {
            const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
            if (this.orders === undefined) {
                this.orders = new ArrayCacheBySymbolById (limit);
            }
            const stored = this.orders;
            const symbols = {};
            for (let i = 0; i < allOrders.length; i++) {
                const orders = this.safeValue (allOrders, i, {});
                const ids = Object.keys (orders);
                for (let j = 0; j < ids.length; j++) {
                    const id = ids[j];
                    const order = orders[id];
                    const parsed = this.parseWsOrder (order);
                    parsed['id'] = id;
                    let symbol = undefined;
                    const symbolsByOrderId = this.safeValue (this.options, 'symbolsByOrderId', {});
                    if (parsed['symbol'] !== undefined) {
                        symbol = parsed['symbol'];
                        symbolsByOrderId[id] = symbol;
                        this.options['symbolsByOrderId'] = symbolsByOrderId;
                    } else {
                        symbol = this.safeString (symbolsByOrderId, id);
                    }
                    const previousOrders = this.safeValue (stored.hashmap, symbol);
                    const previousOrder = this.safeValue (previousOrders, id);
                    let newOrder = parsed;
                    if (previousOrder !== undefined) {
                        const newRawOrder = this.extend (previousOrder['info'], newOrder['info']);
                        newOrder = this.parseWsOrder (newRawOrder);
                        newOrder['id'] = id;
                    }
                    const length = stored.length;
                    if (length === limit && (previousOrder === undefined)) {
                        const first = stored[0];
                        if (first['id'] in symbolsByOrderId) {
                            delete symbolsByOrderId[first['id']];
                        }
                    }
                    stored.append (newOrder);
                    symbols[symbol] = true;
                }
            }
            const name = 'openOrders';
            client.resolve (this.orders, name);
            const keys = Object.keys (symbols);
            for (let i = 0; i < keys.length; i++) {
                const messageHash = name + ':' + keys[i];
                client.resolve (this.orders, messageHash);
            }
        }
    }

    parseWsOrder (order, market = undefined) {
        //
        // createOrder
        //    {
        //        avg_price: '0.00000',
        //        cost: '0.00000',
        //        descr: {
        //            close: null,
        //            leverage: null,
        //            order: 'sell 0.01000000 ETH/USDT @ limit 1900.00000',
        //            ordertype: 'limit',
        //            pair: 'ETH/USDT',
        //            price: '1900.00000',
        //            price2: '0.00000',
        //            type: 'sell'
        //        },
        //        expiretm: null,
        //        fee: '0.00000',
        //        limitprice: '0.00000',
        //        misc: '',
        //        oflags: 'fciq',
        //        opentm: '1667522705.757622',
        //        refid: null,
        //        starttm: null,
        //        status: 'open',
        //        stopprice: '0.00000',
        //        timeinforce: 'GTC',
        //        userref: 0,
        //        vol: '0.01000000',
        //        vol_exec: '0.00000000'
        //    }
        //
        const description = this.safeValue (order, 'descr', {});
        const orderDescription = this.safeString (description, 'order');
        let side = undefined;
        let type = undefined;
        let wsName = undefined;
        let price = undefined;
        let amount = undefined;
        if (orderDescription !== undefined) {
            const parts = orderDescription.split (' ');
            side = this.safeString (parts, 0);
            amount = this.safeString (parts, 1);
            wsName = this.safeString (parts, 2);
            type = this.safeString (parts, 4);
            price = this.safeString (parts, 5);
        }
        side = this.safeString (description, 'type', side);
        type = this.safeString (description, 'ordertype', type);
        wsName = this.safeString (description, 'pair', wsName);
        market = this.safeValue (this.options['marketsByWsName'], wsName, market);
        let symbol = undefined;
        const timestamp = this.safeTimestamp (order, 'opentm');
        amount = this.safeString (order, 'vol', amount);
        const filled = this.safeString (order, 'vol_exec');
        let fee = undefined;
        const cost = this.safeString (order, 'cost');
        price = this.safeString (description, 'price', price);
        if ((price === undefined) || (Precise.stringEq (price, '0.0'))) {
            price = this.safeString (description, 'price2');
        }
        if ((price === undefined) || (Precise.stringEq (price, '0.0'))) {
            price = this.safeString (order, 'price', price);
        }
        const average = this.safeString2 (order, 'avg_price', 'price');
        if (market !== undefined) {
            symbol = market['symbol'];
            if ('fee' in order) {
                const flags = order['oflags'];
                const feeCost = this.safeString (order, 'fee');
                fee = {
                    'cost': feeCost,
                    'rate': undefined,
                };
                if (flags.indexOf ('fciq') >= 0) {
                    fee['currency'] = market['quote'];
                } else if (flags.indexOf ('fcib') >= 0) {
                    fee['currency'] = market['base'];
                }
            }
        }
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        let id = this.safeString (order, 'id');
        if (id === undefined) {
            const txid = this.safeValue (order, 'txid');
            id = this.safeString (txid, 0);
        }
        const clientOrderId = this.safeString (order, 'userref');
        const rawTrades = this.safeValue (order, 'trades');
        let trades = undefined;
        if (rawTrades !== undefined) {
            trades = this.parseTrades (rawTrades, market, undefined, undefined, { 'order': id });
        }
        const stopPrice = this.safeNumber (order, 'stopprice');
        return this.safeOrder ({
            'id': id,
            'clientOrderId': clientOrderId,
            'info': order,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': symbol,
            'type': type,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': stopPrice,
            'triggerPrice': stopPrice,
            'cost': cost,
            'amount': amount,
            'filled': filled,
            'average': average,
            'remaining': undefined,
            'fee': fee,
            'trades': trades,
        });
    }

    handleSubscriptionStatus (client, message) {
        //
        // public
        //
        //     {
        //         channelID: 210,
        //         channelName: 'book-10',
        //         event: 'subscriptionStatus',
        //         reqid: 1574146735269,
        //         pair: 'ETH/XBT',
        //         status: 'subscribed',
        //         subscription: { depth: 10, name: 'book' }
        //     }
        //
        // private
        //
        //     {
        //         channelName: 'openOrders',
        //         event: 'subscriptionStatus',
        //         reqid: 1,
        //         status: 'subscribed',
        //         subscription: { maxratecount: 125, name: 'openOrders' }
        //     }
        //
        const channelId = this.safeString (message, 'channelID');
        if (channelId !== undefined) {
            client.subscriptions[channelId] = message;
        }
        // const requestId = this.safeString (message, 'reqid');
        // if (requestId in client.futures) {
        //     delete client.futures[requestId];
        // }
    }

    handleErrorMessage (client, message) {
        //
        //     {
        //         errorMessage: 'Currency pair not in ISO 4217-A3 format foobar',
        //         event: 'subscriptionStatus',
        //         pair: 'foobar',
        //         reqid: 1574146735269,
        //         status: 'error',
        //         subscription: { name: 'ticker' }
        //     }
        //
        const errorMessage = this.safeValue (message, 'errorMessage');
        if (errorMessage !== undefined) {
            const requestId = this.safeValue (message, 'reqid');
            if (requestId !== undefined) {
                const broad = this.exceptions['ws']['broad'];
                const broadKey = this.findBroadlyMatchedKey (broad, errorMessage);
                let exception = undefined;
                if (broadKey === undefined) {
                    exception = new ExchangeError (errorMessage);
                } else {
                    exception = new broad[broadKey] (errorMessage);
                }
                client.reject (exception, requestId);
                return false;
            }
        }
        return true;
    }

    handleMessage (client, message) {
        if (Array.isArray (message)) {
            const channelId = this.safeString (message, 0);
            const subscription = this.safeValue (client.subscriptions, channelId, {});
            const info = this.safeValue (subscription, 'subscription', {});
            const messageLength = message.length;
            const channelName = this.safeString (message, messageLength - 2);
            const name = this.safeString (info, 'name');
            const methods = {
                // public
                'book': this.handleOrderBook,
                'ohlc': this.handleOHLCV,
                'ticker': this.handleTicker,
                'trade': this.handleTrades,
                // private
                'openOrders': this.handleOrders,
                'ownTrades': this.handleMyTrades,
            };
            const method = this.safeValue2 (methods, name, channelName);
            if (method === undefined) {
                return message;
            } else {
                return method.call (this, client, message, subscription);
            }
        } else {
            if (this.handleErrorMessage (client, message)) {
                const event = this.safeString (message, 'event');
                const methods = {
                    'heartbeat': this.handleHeartbeat,
                    'systemStatus': this.handleSystemStatus,
                    'subscriptionStatus': this.handleSubscriptionStatus,
                };
                const method = this.safeValue (methods, event);
                if (method === undefined) {
                    return message;
                } else {
                    return method.call (this, client, message);
                }
            }
        }
    }
};
