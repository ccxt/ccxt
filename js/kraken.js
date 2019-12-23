'use strict';

//  ---------------------------------------------------------------------------

const ccxt = require ('ccxt');
const { BadSymbol, BadRequest, ExchangeError, NotImplemented } = require ('ccxt/js/base/errors');

//  ---------------------------------------------------------------------------

module.exports = class kraken extends ccxt.kraken {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchTicker': true,
                'watchOrderBook': true,
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
                'subscriptionStatusByChannelId': {},
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

    handleTicker (client, message) {
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
        const vwap = parseFloat (ticker['p'][0]);
        let quoteVolume = undefined;
        const baseVolume = parseFloat (ticker['v'][0]);
        if (baseVolume !== undefined && vwap !== undefined) {
            quoteVolume = baseVolume * vwap;
        }
        const last = parseFloat (ticker['c'][0]);
        const timestamp = this.milliseconds ();
        const result = {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': parseFloat (ticker['h'][0]),
            'low': parseFloat (ticker['l'][0]),
            'bid': parseFloat (ticker['b'][0]),
            'bidVolume': parseFloat (ticker['b'][2]),
            'ask': parseFloat (ticker['a'][0]),
            'askVolume': parseFloat (ticker['a'][2]),
            'vwap': vwap,
            'open': parseFloat (ticker['o'][0]),
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
        // todo: add support for multiple tickers (may be tricky)
        // kraken confirms multi-pair subscriptions separately one by one
        // trigger correct watchTickers calls upon receiving any of symbols
        // --------------------------------------------------------------------
        // if there's a corresponding watchTicker call - trigger it
        client.resolve (result, messageHash);
    }

    async watchBalance (params = {}) {
        await this.loadMarkets ();
        throw new NotImplemented (this.id + ' watchBalance() not implemented yet');
    }

    handleTrades (client, message) {
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
        // todo: incremental trades – add max limit to the dequeue of trades, unshift and push
        //
        //     const trade = this.handleTrade (client, delta, market);
        //     this.trades.push (trade);
        //     tradesCount += 1;
        //
        const wsName = message[3];
        // const name = 'ticker';
        // const messageHash = name + ':' + wsName;
        const market = this.safeValue (this.options['marketsByWsName'], wsName);
        const symbol = market['symbol'];
        // for (let i = 0; i < message[1].length; i++)
        const timestamp = parseInt (message[2]);
        const result = {
            'id': undefined,
            'order': undefined,
            'info': message,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            // 'type': type,
            // 'side': side,
            'takerOrMaker': undefined,
            // 'price': price,
            // 'amount': amount,
            // 'cost': price * amount,
            // 'fee': fee,
        };
        result['id'] = undefined;
        throw NotImplemented (this.id + ' handleTrades() not implemented yet (wip)');
    }

    handleOHLCV (client, message) {
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
        const wsName = message[3];
        const name = 'ohlc';
        const candle = message[1];
        // console.log (
        //     this.iso8601 (parseInt (parseFloat (candle[0]) * 1000)), '-',
        //     this.iso8601 (parseInt (parseFloat (candle[1]) * 1000)), ': [',
        //     parseFloat (candle[2]),
        //     parseFloat (candle[3]),
        //     parseFloat (candle[4]),
        //     parseFloat (candle[5]),
        //     parseFloat (candle[7]), ']'
        // );
        const result = [
            parseInt (parseFloat (candle[0]) * 1000),
            parseFloat (candle[2]),
            parseFloat (candle[3]),
            parseFloat (candle[4]),
            parseFloat (candle[5]),
            parseFloat (candle[7]),
        ];
        const messageHash = name + ':' + wsName;
        client.resolve (result, messageHash);
    }

    reqid () {
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
        const requestId = this.reqid ();
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
        // const future = this.watch (url, [ messageHash, requestId ], request, messageHash);
        // const client = this.clients[url];
        // client['futures'][requestId] = future;
        // return await future;
    }

    async watchTicker (symbol, params = {}) {
        return await this.watchPublic ('ticker', symbol, params);
    }

    async watchTrades (symbol, params = {}) {
        return await this.watchPublic ('trade', symbol, params);
    }

    async watchOrderBook (symbol, limit = undefined, params = {}) {
        const name = 'book';
        const request = {};
        if (limit !== undefined) {
            request['subscription'] = {
                'depth': limit, // default 10, valid options 10, 25, 100, 500, 1000
            };
        }
        return await this.watchPublic (name, symbol, this.extend (request, params));
    }

    async watchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        const name = 'ohlc';
        const request = {
            'subscription': {
                'interval': parseInt (this.timeframes[timeframe]),
            },
        };
        return await this.watchPublic (name, symbol, this.extend (request, params));
    }

    async loadMarkets (reload = false, params = {}) {
        const markets = await super.loadMarkets (reload, params);
        let marketsByWsName = this.safeValue (this.options, 'marketsByWsName');
        if ((marketsByWsName === undefined) || reload) {
            marketsByWsName = {};
            for (let i = 0; i < this.symbols.length; i++) {
                const symbol = this.symbols[i];
                const market = this.markets[symbol];
                if (!market['darkpool']) {
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

    handleTrade (client, trade, market = undefined) {
        //
        // public trades
        //
        //     [
        //         "t", // trade
        //         "42706057", // id
        //         1, // 1 = buy, 0 = sell
        //         "0.05567134", // price
        //         "0.00181421", // amount
        //         1522877119, // timestamp
        //     ]
        //
        const id = trade[1].toString ();
        const side = trade[2] ? 'buy' : 'sell';
        const price = parseFloat (trade[3]);
        const amount = parseFloat (trade[4]);
        const timestamp = trade[5] * 1000;
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        return {
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': id,
            'order': undefined,
            'type': undefined,
            'takerOrMaker': undefined,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': price * amount,
            'fee': undefined,
        };
    }

    handleOrderBook (client, message) {
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
        const market = this.safeValue (this.options['marketsByWsName'], wsName);
        const symbol = market['symbol'];
        let timestamp = undefined;
        const messageHash = 'book:' + wsName;
        // if this is a snapshot
        if ('as' in message[1]) {
            // todo get depth from marketsByWsName
            this.orderbooks[symbol] = this.limitedOrderBook ({}, 10);
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
            orderbook['timestamp'] = timestamp;
            // the .limit () operation will be moved to the watchOrderBook
            client.resolve (orderbook.limit (), messageHash);
        } else {
            const orderbook = this.orderbooks[symbol];
            // else, if this is an orderbook update
            let a = undefined;
            let b = undefined;
            if (messageLength === 5) {
                a = this.safeValue (message[1], 'a', []);
                b = this.safeValue (message[2], 'b', []);
            } else {
                if ('a' in message[1]) {
                    a = this.safeValue (message[1], 'a', []);
                } else {
                    b = this.safeValue (message[1], 'b', []);
                }
            }
            if (a !== undefined) {
                timestamp = this.handleDeltas (orderbook['asks'], a, timestamp);
            }
            if (b !== undefined) {
                timestamp = this.handleDeltas (orderbook['bids'], b, timestamp);
            }
            orderbook['timestamp'] = timestamp;
            // the .limit () operation will be moved to the watchOrderBook
            client.resolve (orderbook.limit (), messageHash);
        }
    }

    handleDeltas (bookside, deltas, timestamp) {
        for (let j = 0; j < deltas.length; j++) {
            const delta = deltas[j];
            const price = parseFloat (delta[0]);
            const amount = parseFloat (delta[1]);
            timestamp = Math.max (timestamp || 0, parseInt (parseFloat (delta[2]) * 1000));
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

    handleSubscriptionStatus (client, message) {
        //
        // todo: answer the question whether handleSubscriptionStatus should be renamed
        // and unified as handleResponse for any usage pattern that
        // involves an identified request/response sequence
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
        const channelId = this.safeString (message, 'channelID');
        this.options['subscriptionStatusByChannelId'][channelId] = message;
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
                // console.log (requestId, exception);
                client.reject (exception, requestId);
                // throw exception;
                return false;
            }
        }
        return true;
    }

    signMessage (client, messageHash, message, params = {}) {
        // todo: kraken signMessage not implemented yet
        return message;
    }

    handleMessage (client, message) {
        if (Array.isArray (message)) {
            const channelId = message[0].toString ();
            const subscriptionStatus = this.safeValue (this.options['subscriptionStatusByChannelId'], channelId, {});
            const subscription = this.safeValue (subscriptionStatus, 'subscription', {});
            const name = this.safeString (subscription, 'name');
            const methods = {
                'book': this.handleOrderBook,
                'ohlc': this.handleOHLCV,
                'ticker': this.handleTicker,
                'trade': this.handleTrades,
            };
            const method = this.safeValue (methods, name);
            if (method === undefined) {
                return message;
            } else {
                return this.call (method, client, message);
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
                    return this.call (method, client, message);
                }
            }
        }
    }
};
