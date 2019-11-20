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
                'fetchWsTicker': true,
                'fetchWsOrderBook': true,
            },
            'urls': {
                'api': {
                    'ws': 'wss://ws.kraken.com',
                    'wsauth': 'wss://ws-auth.kraken.com',
                    'betaws': 'wss://beta-ws.kraken.com',
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

    handleWsTicker (client, message) {
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
        const messageHash = wsName + ':' + name;
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
        this.resolveWsFuture (client, messageHash, result);
    }

    async fetchWsBalance (params = {}) {
        await this.loadMarkets ();
        throw new NotImplemented (this.id + ' fetchWsBalance() not implemented yet');
    }

    async fetchWsTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const wsName = this.safeValue (market['info'], 'wsname');
        const name = 'ticker';
        const messageHash = wsName + ':' + name;
        const url = this.urls['api']['ws'];
        const requestId = this.nonce ();
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
        const future = this.sendWsMessage (url, messageHash, this.extend (subscribe, params), messageHash);
        const client = this.clients[url];
        client['futures'][requestId] = future;
        return future;
    }

    async fetchWsTrades (symbol, params = {}) {
        await this.loadMarkets ();
        throw new NotImplemented (this.id + ' fetchWsTrades() not implemented yet');
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

    async fetchWsOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const wsName = this.safeValue (market['info'], 'wsname');
        const name = 'book';
        const messageHash = wsName + ':' + name;
        const url = this.urls['api']['ws'];
        const requestId = this.nonce ();
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
        if (limit !== undefined) {
            subscribe['subscription']['depth'] = limit; // default 10, valid options 10, 25, 100, 500, 1000
        }
        const future = this.sendWsMessage (url, messageHash, this.extend (subscribe, params), messageHash);
        const client = this.clients[url];
        client['futures'][requestId] = future;
        return future;
    }

    async fetchWsHeartbeat (params = {}) {
        await this.loadMarkets ();
        const event = 'heartbeat';
        const url = this.urls['api']['ws'];
        return this.sendWsMessage (url, event);
    }

    signWsMessage (client, messageHash, message, params = {}) {
        // todo: not implemented yet
        return message;
    }

    handleWsHeartbeat (client, message) {
        //
        // every second (approx) if no other updates are sent
        //
        //     { "event": "heartbeat" }
        //
        const event = this.safeString (message, 'event');
        this.resolveWsFuture (client, event, message);
    }

    parseWsTrade (client, trade, market = undefined) {
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

    handleWsOrderBook (client, message) {
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
        const messageHash = wsName + ':book';
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
                timestamp = this.handleWsDeltas (deltas, bookside, timestamp);
            }
            orderbook['timestamp'] = timestamp;
            this.resolveWsFuture (client, messageHash, orderbook.limit ());
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
                timestamp = this.handleWsDeltas (a, orderbook['asks'], timestamp);
            }
            if (b !== undefined) {
                timestamp = this.handleWsDeltas (b, orderbook['bids'], timestamp);
            }
            orderbook['timestamp'] = timestamp;
            this.resolveWsFuture (client, messageHash, orderbook.limit ());
        }
    }

    handleWsDeltas (deltas, bookside, timestamp) {
        for (let j = 0; j < deltas.length; j++) {
            const delta = deltas[j];
            const price = parseFloat (delta[0]);
            const amount = parseFloat (delta[1]);
            timestamp = Math.max (timestamp || 0, parseInt (delta[2] * 1000));
            bookside.store (price, amount);
        }
        return timestamp;
    }

    handleWsSystemStatus (client, message) {
        //
        // todo: answer the question whether this method should be renamed
        // and unified as handleWsStatus for any usage pattern that
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

    handleWsSubscriptionStatus (client, message) {
        //
        // todo: answer the question whether this method should be renamed
        // and unified as handleWsResponse for any usage pattern that
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
        const requestId = this.safeString (message, 'reqid');
        if (client.futures[requestId]) {
            // todo: transpile delete in ccxt
            delete client.futures[requestId];
        }
    }

    handleWsErrors (client, message) {
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
                this.rejectWsFuture (client, requestId, exception);
                // throw exception;
                return false;
            }
        }
        return true;
    }

    handleWsMessage (client, message) {
        if (Array.isArray (message)) {
            const channelId = message[0].toString ();
            const subscriptionStatus = this.safeValue (this.options['subscriptionStatusByChannelId'], channelId);
            if (subscriptionStatus !== undefined) {
                const subscription = this.safeValue (subscriptionStatus, 'subscription', {});
                const name = this.safeString (subscription, 'name');
                const methods = {
                    'book': 'handleWsOrderBook',
                    'ticker': 'handleWsTicker',
                };
                const method = this.safeString (methods, name);
                if (method === undefined) {
                    return message;
                } else {
                    return this[method] (client, message);
                }
            }
        } else {
            if (this.handleWsErrors (client, message)) {
                const event = this.safeString (message, 'event');
                const methods = {
                    'heartbeat': 'handleWsHeartbeat',
                    'systemStatus': 'handleWsSystemStatus',
                    'subscriptionStatus': 'handleWsSubscriptionStatus',
                };
                const method = this.safeString (methods, event);
                if (method === undefined) {
                    return message;
                } else {
                    return this[method] (client, message);
                }
            }
        }
    }
};
