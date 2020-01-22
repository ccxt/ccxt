'use strict';

//  ---------------------------------------------------------------------------

const ccxt = require ('ccxt');
const { ExchangeError } = require ('ccxt/js/base/errors');

//  ---------------------------------------------------------------------------

module.exports = class binance extends ccxt.binance {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'watchOrderBook': true,
                'watchTrades': true,
                'watchOHLCV': true,
                'watchTicker': true,
                'watchOrders': true,
                'watchBalance': true,
            },
            'urls': {
                'api': {
                    'ws': 'wss://stream.binance.com:9443/ws',
                },
            },
            'options': {
                'watchOrderBookRate': 100, // get updates every 100ms or 1000ms
                'tradesLimit': 1000,
                'OHLCVLimit': 1000,
            },
        });
    }

    async loadMarkets (reload = false, params = {}) {
        const markets = await super.loadMarkets (reload, params);
        let marketsByLowercaseId = this.safeValue (this.options, 'marketsByLowercaseId');
        if ((marketsByLowercaseId === undefined) || reload) {
            marketsByLowercaseId = {};
            for (let i = 0; i < this.symbols.length; i++) {
                const symbol = this.symbols[i];
                const market = this.markets[symbol];
                const lowercaseId = this.safeStringLower (market, 'id');
                market['lowercaseId'] = lowercaseId;
                this.markets_by_id[market['id']] = market;
                this.markets[symbol] = market;
                marketsByLowercaseId[lowercaseId] = this.markets[symbol];
            }
            this.options['marketsByLowercaseId'] = marketsByLowercaseId;
        }
        return markets;
    }

    async watchOrderBook (symbol, limit = undefined, params = {}) {
        //
        // https://github.com/binance-exchange/binance-official-api-docs/blob/master/web-socket-streams.md#partial-book-depth-streams
        //
        // <symbol>@depth<levels>@100ms or <symbol>@depth<levels> (1000ms)
        // valid <levels> are 5, 10, or 20
        //
        if (limit !== undefined) {
            if ((limit !== 5) && (limit !== 10) && (limit !== 20)) {
                throw new ExchangeError (this.id + ' watchOrderBook limit argument must be undefined, 5, 10 or 20');
            }
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        //
        // https://github.com/binance-exchange/binance-official-api-docs/blob/master/web-socket-streams.md#how-to-manage-a-local-order-book-correctly
        //
        // 1. Open a stream to wss://stream.binance.com:9443/ws/bnbbtc@depth.
        // 2. Buffer the events you receive from the stream.
        // 3. Get a depth snapshot from https://www.binance.com/api/v1/depth?symbol=BNBBTC&limit=1000 .
        // 4. Drop any event where u is <= lastUpdateId in the snapshot.
        // 5. The first processed event should have U <= lastUpdateId+1 AND u >= lastUpdateId+1.
        // 6. While listening to the stream, each new event's U should be equal to the previous event's u+1.
        // 7. The data in each event is the absolute quantity for a price level.
        // 8. If the quantity is 0, remove the price level.
        // 9. Receiving an event that removes a price level that is not in your local order book can happen and is normal.
        //
        const name = 'depth';
        const messageHash = market['lowercaseId'] + '@' + name;
        const url = this.urls['api']['ws']; // + '/' + messageHash;
        const requestId = this.nonce ();
        const watchOrderBookRate = this.safeString (this.options, 'watchOrderBookRate', '100');
        const request = {
            'method': 'SUBSCRIBE',
            'params': [
                messageHash + '@' + watchOrderBookRate + 'ms',
            ],
            'id': requestId,
        };
        const subscription = {
            'id': requestId.toString (),
            'messageHash': messageHash,
            'name': name,
            'symbol': symbol,
            'method': this.handleOrderBookSubscription,
            'limit': limit,
        };
        const message = this.extend (request, params);
        // 1. Open a stream to wss://stream.binance.com:9443/ws/bnbbtc@depth.
        const future = this.watch (url, messageHash, message, messageHash, subscription);
        return await this.after (future, this.limitOrderBook, symbol, limit, params);
    }

    limitOrderBook (orderbook, symbol, limit = undefined, params = {}) {
        return orderbook.limit (limit);
    }

    async fetchOrderBookSnapshot (client, message, subscription) {
        const symbol = this.safeString (subscription, 'symbol');
        const messageHash = this.safeString (subscription, 'messageHash');
        // 3. Get a depth snapshot from https://www.binance.com/api/v1/depth?symbol=BNBBTC&limit=1000 .
        // todo: this is a synch blocking call in ccxt.php - make it async
        const snapshot = await this.fetchOrderBook (symbol);
        const orderbook = this.orderbooks[symbol];
        orderbook.reset (snapshot);
        // unroll the accumulated deltas
        const messages = orderbook.cache;
        for (let i = 0; i < messages.length; i++) {
            const message = messages[i];
            this.handleOrderBookMessage (client, message, orderbook);
        }
        this.orderbooks[symbol] = orderbook;
        client.resolve (orderbook, messageHash);
    }

    handleDelta (bookside, delta) {
        const price = this.safeFloat (delta, 0);
        const amount = this.safeFloat (delta, 1);
        bookside.store (price, amount);
    }

    handleDeltas (bookside, deltas) {
        for (let i = 0; i < deltas.length; i++) {
            this.handleDelta (bookside, deltas[i]);
        }
    }

    handleOrderBookMessage (client, message, orderbook) {
        const u = this.safeInteger2 (message, 'u', 'lastUpdateId');
        // merge accumulated deltas
        // 4. Drop any event where u is <= lastUpdateId in the snapshot.
        if (u > orderbook['nonce']) {
            const U = this.safeInteger (message, 'U');
            // 5. The first processed event should have U <= lastUpdateId+1 AND u >= lastUpdateId+1.
            if ((U !== undefined) && ((U - 1) > orderbook['nonce'])) {
                // todo: client.reject from handleOrderBookMessage properly
                throw new ExchangeError (this.id + ' handleOrderBook received an out-of-order nonce');
            }
            this.handleDeltas (orderbook['asks'], this.safeValue (message, 'a', []));
            this.handleDeltas (orderbook['bids'], this.safeValue (message, 'b', []));
            orderbook['nonce'] = u;
            const timestamp = this.safeInteger (message, 'E');
            orderbook['timestamp'] = timestamp;
            orderbook['datetime'] = this.iso8601 (timestamp);
        }
        return orderbook;
    }

    handleOrderBook (client, message) {
        //
        // initial snapshot is fetched with ccxt's fetchOrderBook
        // the feed does not include a snapshot, just the deltas
        //
        //     {
        //         "e": "depthUpdate", // Event type
        //         "E": 1577554482280, // Event time
        //         "s": "BNBBTC", // Symbol
        //         "U": 157, // First update ID in event
        //         "u": 160, // Final update ID in event
        //         "b": [ // bids
        //             [ "0.0024", "10" ], // price, size
        //         ],
        //         "a": [ // asks
        //             [ "0.0026", "100" ], // price, size
        //         ]
        //     }
        //
        const marketId = this.safeString (message, 's');
        let market = undefined;
        let symbol = undefined;
        if (marketId !== undefined) {
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
                symbol = market['symbol'];
            }
        }
        const name = 'depth';
        const messageHash = market['lowercaseId'] + '@' + name;
        const orderbook = this.orderbooks[symbol];
        if (orderbook['nonce'] !== undefined) {
            // 5. The first processed event should have U <= lastUpdateId+1 AND u >= lastUpdateId+1.
            // 6. While listening to the stream, each new event's U should be equal to the previous event's u+1.
            try {
                this.handleOrderBookMessage (client, message, orderbook);
                client.resolve (orderbook, messageHash);
            } catch (e) {
                delete this.orderbooks[symbol];
                delete client.subscriptions[messageHash];
                client.reject (e, messageHash);
            }
        } else {
            // 2. Buffer the events you receive from the stream.
            orderbook.cache.push (message);
        }
    }

    signMessage (client, messageHash, message, params = {}) {
        // todo: implement binance signMessage
        return message;
    }

    handleOrderBookSubscription (client, message, subscription) {
        const symbol = this.safeString (subscription, 'symbol');
        const limit = this.safeString (subscription, 'limit');
        if (symbol in this.orderbooks) {
            delete this.orderbooks[symbol];
        }
        this.orderbooks[symbol] = this.orderBook ({}, limit);
        // fetch the snapshot in a separate async call
        this.spawn (this.fetchOrderBookSnapshot, client, message, subscription);
    }

    handleSubscriptionStatus (client, message) {
        //
        //     {
        //         "result": null,
        //         "id": 1574649734450
        //     }
        //
        const id = this.safeString (message, 'id');
        const subscriptionsById = this.indexBy (client.subscriptions, 'id');
        const subscription = this.safeValue (subscriptionsById, id, {});
        const method = this.safeValue (subscription, 'method');
        if (method !== undefined) {
            method.call (this, client, message, subscription);
        }
        return message;
    }

    async watchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const name = 'trade';
        const messageHash = market['lowercaseId'] + '@' + name;
        const url = this.urls['api']['ws']; // + '/' + messageHash;
        const requestId = this.nonce ();
        const request = {
            'method': 'SUBSCRIBE',
            'params': [
                messageHash,
            ],
            'id': requestId,
        };
        const subscribe = {
            'id': requestId,
        };
        const future = this.watch (url, messageHash, request, messageHash, subscribe);
        return await this.after (future, this.filterBySinceLimit, since, limit);
    }

    handleTrade (client, message) {
        // The Trade Streams push raw trade information; each trade has a unique buyer and seller.
        // Update Speed: Real-time
        //
        // {
        //   e: 'trade',
        //   E: 1579481530911,
        //   s: 'ETHBTC',
        //   t: 158410082,
        //   p: '0.01914100',
        //   q: '0.00700000',
        //   b: 586187049,
        //   a: 586186710,
        //   T: 1579481530910,
        //   m: false,
        //   M: true
        // }
        const marketId = this.safeString (message, 's');
        let market = undefined;
        let symbol = marketId;
        if (marketId in this.markets_by_id) {
            market = this.markets_by_id[marketId];
            symbol = market['symbol'];
        }
        const lowerCaseId = this.safeStringLower (message, 's');
        const event = this.safeString (message, 'e');
        const messageHash = lowerCaseId + '@' + event;
        const parsed = this.parseTrade (message, market);
        const array = this.safeValue (this.trades, symbol, []);
        array.push (parsed);
        const length = array.length;
        if (length > this.options['tradesLimit']) {
            array.shift ();
        }
        this.trades[symbol] = array;
        client.resolve (array, messageHash);
    }

    async watchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const url = this.urls['api']['ws'];
        const market = this.market (symbol);
        const marketId = market['lowercaseId'];
        const interval = this.timeframes[timeframe];
        const name = 'kline_';
        const messageHash = marketId + '@' + name + interval;
        const requestId = this.nonce ();
        const request = {
            'method': 'SUBSCRIBE',
            'params': [
                messageHash,
            ],
            'id': requestId,
        };
        const subscribe = {
            'id': requestId,
        };
        return await this.watch (url, messageHash, request, messageHash, subscribe);
    }

    handleOHCLV (client, message) {
        // {
        //   e: 'kline',
        //   E: 1579482921215,
        //   s: 'ETHBTC',
        //   k: {
        //     t: 1579482900000,
        //     T: 1579482959999,
        //     s: 'ETHBTC',
        //     i: '1m',
        //     f: 158411535,
        //     L: 158411550,
        //     o: '0.01913200',
        //     c: '0.01913500',
        //     h: '0.01913700',
        //     l: '0.01913200',
        //     v: '5.08400000',
        //     n: 16,
        //     x: false,
        //     q: '0.09728060',
        //     V: '3.30200000',
        //     Q: '0.06318500',
        //     B: '0'
        //   }
        // }
        const marketId = this.safeString (message, 's');
        const lowercaseMarketId = this.safeStringLower (message, 's');
        const event = this.safeString (message, 'e');
        const kline = this.safeValue (message, 'k');
        const interval = this.safeString (kline, 'i');
        const messageHash = lowercaseMarketId + '@' + event + '_' + interval;
        const timestamp = this.safeInteger (kline, 't');
        const open = this.safeFloat (kline, 'o');
        const high = this.safeFloat (kline, 'h');
        const low = this.safeFloat (kline, 'l');
        const close = this.safeFloat (kline, 'c');
        const volume = this.safeFloat (kline, 'v');
        const parsed = [
            timestamp,
            open,
            high,
            low,
            close,
            volume,
        ];
        let symbol = marketId;
        if (marketId in this.markets_by_id) {
            const market = this.markets_by_id[marketId];
            symbol = market['symbol'];
        }
        if (!(symbol in this.ohlcvs)) {
            this.ohlcvs[symbol] = [];
        }
        const stored = this.ohlcvs[symbol];
        const length = stored.length;
        if (length && parsed[0] === stored[length - 1][0]) {
            stored[length - 1] = parsed;
        } else {
            stored.push (parsed);
            if (length + 1 > this.options['OHLCVLimit']) {
                stored.shift ();
            }
        }
        this.ohlcvs[symbol] = stored;
        client.resolve (stored, messageHash);
    }

    async watchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const url = this.urls['api']['ws'];
        const market = this.market (symbol);
        const marketId = market['lowercaseId'];
        const name = 'ticker';
        const messageHash = marketId + '@' + name;
        const requestId = this.nonce ();
        const request = {
            'method': 'SUBSCRIBE',
            'params': [
                messageHash,
            ],
            'id': requestId,
        };
        const subscribe = {
            'id': requestId,
        };
        return await this.watch (url, messageHash, request, messageHash, subscribe);
    }

    handleTicker (client, message) {
        // 24hr rolling window ticker statistics for a single symbol. These are NOT the statistics of the UTC day, but a 24hr rolling window for the previous 24hrs.
        //
        // Update Speed: 1000ms
        // {
        //   e: '24hrTicker',
        //   E: 1579485598569,
        //   s: 'ETHBTC',
        //   p: '-0.00004000',
        //   P: '-0.209',
        //   w: '0.01920495',
        //   x: '0.01916500',
        //   c: '0.01912500',
        //   Q: '0.10400000',
        //   b: '0.01912200',
        //   B: '4.10400000',
        //   a: '0.01912500',
        //   A: '0.00100000',
        //   o: '0.01916500',
        //   h: '0.01956500',
        //   l: '0.01887700',
        //   v: '173518.11900000',
        //   q: '3332.40703994',
        //   O: 1579399197842,
        //   C: 1579485597842,
        //   F: 158251292,
        //   L: 158414513,
        //   n: 163222
        // }
        const event = 'ticker'; // message['e'] === 24hrTicker
        const wsMarketId = this.safeStringLower (message, 's');
        const messageHash = wsMarketId + '@' + event;
        const timestamp = this.safeInteger (message, 'C');
        let symbol = undefined;
        const marketId = this.safeString (message, 's');
        if (marketId in this.markets_by_id) {
            const market = this.markets_by_id[marketId];
            symbol = market['symbol'];
        }
        const last = this.safeFloat (message, 'c');
        const parsed = {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (message, 'h'),
            'low': this.safeFloat (message, 'l'),
            'bid': this.safeFloat (message, 'b'),
            'bidVolume': this.safeFloat (message, 'B'),
            'ask': this.safeFloat (message, 'a'),
            'askVolume': this.safeFloat (message, 'A'),
            'vwap': this.safeFloat (message, 'w'),
            'open': this.safeFloat (message, 'o'),
            'close': last,
            'last': last,
            'previousClose': this.safeFloat (message, 'x'), // previous day close
            'change': this.safeFloat (message, 'p'),
            'percentage': this.safeFloat (message, 'P'),
            'average': undefined,
            'baseVolume': this.safeFloat (message, 'v'),
            'quoteVolume': this.safeFloat (message, 'q'),
            'info': message,
        };
        client.resolve (parsed, messageHash);
    }

    async authenticate () {
        const time = this.seconds ();
        const lastAuthenticatedTime = this.safeInteger (this.options, 'lastAuthenticatedTime', 0);
        if (time - lastAuthenticatedTime > 1800) {
            const response = await this.publicPostUserDataStream ();
            this.options['listenKey'] = this.safeString (response, 'listenKey');
            this.options['lastAuthenticatedTime'] = time;
        }
    }

    async watchBalance (params = {}) {
        await this.loadMarkets ();
        await this.authenticate ();
        const url = this.urls['api']['ws'] + '/' + this.options['listenKey'];
        const requestId = this.nonce ();
        const request = {
            'method': 'SUBSCRIBE',
            'params': [
            ],
            'id': requestId,
        };
        const subscribe = {
            'id': requestId,
        };
        const messageHash = 'outboundAccountInfo';
        return await this.watch (url, messageHash, request, 1, subscribe);
    }

    handleBalance (client, message) {
        // sent upon creating or filling an order
        //
        // {
        //   "e": "outboundAccountInfo",   // Event type
        //   "E": 1499405658849,           // Event time
        //   "m": 0,                       // Maker commission rate (bips)
        //   "t": 0,                       // Taker commission rate (bips)
        //   "b": 0,                       // Buyer commission rate (bips)
        //   "s": 0,                       // Seller commission rate (bips)
        //   "T": true,                    // Can trade?
        //   "W": true,                    // Can withdraw?
        //   "D": true,                    // Can deposit?
        //   "u": 1499405658848,           // Time of last account update
        //   "B": [                        // Balances array
        //     {
        //       "a": "LTC",               // Asset
        //       "f": "17366.18538083",    // Free amount
        //       "l": "0.00000000"         // Locked amount
        //     },
        //     {
        //       "a": "BTC",
        //       "f": "10537.85314051",
        //       "l": "2.19464093"
        //     },
        //     {
        //       "a": "ETH",
        //       "f": "17902.35190619",
        //       "l": "0.00000000"
        //     },
        //     {
        //       "a": "BNC",
        //       "f": "1114503.29769312",
        //       "l": "0.00000000"
        //     },
        //     {
        //       "a": "NEO",
        //       "f": "0.00000000",
        //       "l": "0.00000000"
        //     }
        //   ]
        // }
        const balances = this.safeValue (message, 'B', []);
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const currencyId = this.safeString (balance, 'a');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeFloat (balance, 'f');
            account['used'] = this.safeFloat (balance, 'l');
            this.balance[code] = account;
        }
        const parsed = this.parseBalance (this.balance);
        const messageHash = message['e'];
        client.resolve (parsed, messageHash);
    }

    async watchOrders (params = {}) {
        await this.loadMarkets ();
        await this.authenticate ();
        const url = this.urls['api']['ws'] + '/' + this.options['listenKey'];
        const requestId = this.nonce ();
        const request = {
            'method': 'SUBSCRIBE',
            'params': [
            ],
            'id': requestId,
        };
        const subscribe = {
            'id': requestId,
        };
        const messageHash = 'executionReport';
        return await this.watch (url, messageHash, request, 1, subscribe);
    }

    handleOrder (client, message) {
        // {
        //   "e": "executionReport",        // Event type
        //   "E": 1499405658658,            // Event time
        //   "s": "ETHBTC",                 // Symbol
        //   "c": "mUvoqJxFIILMdfAW5iGSOW", // Client order ID
        //   "S": "BUY",                    // Side
        //   "o": "LIMIT",                  // Order type
        //   "f": "GTC",                    // Time in force
        //   "q": "1.00000000",             // Order quantity
        //   "p": "0.10264410",             // Order price
        //   "P": "0.00000000",             // Stop price
        //   "F": "0.00000000",             // Iceberg quantity
        //   "g": -1,                       // OrderListId
        //   "C": null,                     // Original client order ID; This is the ID of the order being canceled
        //   "x": "NEW",                    // Current execution type
        //   "X": "NEW",                    // Current order status
        //   "r": "NONE",                   // Order reject reason; will be an error code.
        //   "i": 4293153,                  // Order ID
        //   "l": "0.00000000",             // Last executed quantity
        //   "z": "0.00000000",             // Cumulative filled quantity
        //   "L": "0.00000000",             // Last executed price
        //   "n": "0",                      // Commission amount
        //   "N": null,                     // Commission asset
        //   "T": 1499405658657,            // Transaction time
        //   "t": -1,                       // Trade ID
        //   "I": 8641984,                  // Ignore
        //   "w": true,                     // Is the order on the book?
        //   "m": false,                    // Is this trade the maker side?
        //   "M": false,                    // Ignore
        //   "O": 1499405658657,            // Order creation time
        //   "Z": "0.00000000",             // Cumulative quote asset transacted quantity
        //   "Y": "0.00000000"              // Last quote asset transacted quantity (i.e. lastPrice * lastQty),
        //   "Q": "0.00000000"              // Quote Order Qty
        // }
        console.log (message)
    }

    handleMessage (client, message) {
        const methods = {
            'depthUpdate': this.handleOrderBook,
            'trade': this.handleTrade,
            'kline': this.handleOHCLV,
            '24hrTicker': this.handleTicker,
            'outboundAccountInfo': this.handleBalance,
            'executionReport': this.handleOrder,
        };
        const event = this.safeString (message, 'e');
        const method = this.safeValue (methods, event);
        if (method === undefined) {
            const requestId = this.safeString (message, 'id');
            if (requestId !== undefined) {
                return this.handleSubscriptionStatus (client, message);
            }
            return message;
        } else {
            return method.call (this, client, message);
        }
    }
};
