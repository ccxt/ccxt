'use strict';

//  ---------------------------------------------------------------------------

const ccxt = require ('ccxt');
const { ExchangeError, NotImplemented, RateLimitExceeded } = require ('ccxt/js/base/errors');

//  ---------------------------------------------------------------------------

module.exports = class bitmex extends ccxt.bitmex {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'fetchWsTicker': true,
                'fetchWsOrderBook': true,
            },
            'urls': {
                'api': {
                    'ws': 'wss://www.bitmex.com/realtime',
                },
            },
            'versions': {
                'ws': '0.2.0',
            },
            'options': {
                'subscriptionStatusByChannelId': {},
                'fetchWsOrderBookLevel': 'orderBookL2', // 'orderBookL2' = L2 full order book, 'orderBookL2_25' = L2 top 25, 'orderBook10' L3 top 10
            },
            'exceptions': {
                'ws': {
                    'exact': {
                    },
                    'broad': {
                        'Rate limit exceeded': RateLimitExceeded,
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
        // todo: add support for multiple tickers (may be tricky)
        // kraken confirms multi-pair subscriptions separately one by one
        // trigger correct fetchWsTickers calls upon receiving any of symbols
        // --------------------------------------------------------------------
        // if there's a corresponding fetchWsTicker call - trigger it
        this.resolveWsFuture (client, messageHash, result);
    }

    async fetchWsBalance (params = {}) {
        await this.loadMarkets ();
        throw new NotImplemented (this.id + ' fetchWsBalance() not implemented yet');
    }

    handleWsTrades (client, message) {
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
        //     // todo: add max limit to the dequeue of trades, unshift and push
        //     const trade = this.parseWsTrade (client, delta, market);
        //     this.trades.push (trade);
        //     tradesCount += 1;
        //
        const wsName = message[3];
        // const name = 'ticker';
        // const messageHash = wsName + ':' + name;
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
        throw NotImplemented (this.id + ' handleWsTrades() not implemented yet (wip)');
    }

    handleWsOHLCV (client, message) {
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
        const messageHash = wsName + ':' + name;
        this.resolveWsFuture (client, messageHash, result);
    }

    async fetchWsOrderBook (symbol, limit = undefined, params = {}) {
        let name = undefined;
        if (limit === undefined) {
            name = this.safeString (this.options, 'fetchWsOrderBookLevel', 'orderBookL2');
        } else if (limit === 25) {
            name = 'orderBookL2_25';
        } else if (limit === 10) {
            name = 'orderBookL10';
        } else {
            throw new ExchangeError (this.id + ' fetchWsOrderBook limit argument must be undefined (L2), 25 (L2) or 10 (L3)');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const messageHash = name + ':' + market['id'];
        const url = this.urls['api']['ws'];
        const request = {
            'op': 'subscribe',
            'args': [
                messageHash,
            ],
        };
        return this.sendWsMessage (url, messageHash, this.deepExtend (request, params), messageHash);
    }

    async fetchWsOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        const name = 'ohlc';
        const request = {
            'subscription': {
                'interval': parseInt (this.timeframes[timeframe]),
            },
        };
        return await this.fetchWsPublicMessage (name, symbol, this.extend (request, params));
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
        //     {
        //         table: 'orderBookL2',
        //         action: 'partial',
        //         keys: [ 'symbol', 'id', 'side' ],
        //         types: {
        //             symbol: 'symbol',
        //             id: 'long',
        //             side: 'symbol',
        //             size: 'long',
        //             price: 'float'
        //         },
        //         foreignKeys: { symbol: 'instrument', side: 'side' },
        //         attributes: { symbol: 'parted', id: 'sorted' },
        //         filter: { symbol: 'XBTUSD' },
        //         data: [
        //             { symbol: 'XBTUSD', id: 8700000100, side: 'Sell', size: 1, price: 999999 },
        //             { symbol: 'XBTUSD', id: 8700000200, side: 'Sell', size: 3, price: 999998 },
        //             { symbol: 'XBTUSD', id: 8716991250, side: 'Sell', size: 26, price: 830087.5 },
        //             { symbol: 'XBTUSD', id: 8728701950, side: 'Sell', size: 1720, price: 712980.5 },
        //         ]
        //     }
        //
        // subsequent updates
        //
        //     {
        //         table: 'orderBookL2',
        //         action: 'update',
        //         data: [
        //             { symbol: 'XBTUSD', id: 8799285100, side: 'Sell', size: 70590 },
        //             { symbol: 'XBTUSD', id: 8799285550, side: 'Sell', size: 217652 },
        //             { symbol: 'XBTUSD', id: 8799288950, side: 'Buy', size: 47552 },
        //             { symbol: 'XBTUSD', id: 8799289250, side: 'Buy', size: 78217 },
        //         ]
        //     }
        //
        const action = this.safeString (message, 'action');
        const table = this.safeString (message, 'table');
        const data = this.safeValue (message, 'data', []);
        // if it's an initial snapshot
        if (action === 'partial') {
            const filter = this.safeValue (message, 'filter', {});
            const marketId = this.safeValue (filter, 'symbol');
            if (marketId in this.markets_by_id) {
                const market = this.markets_by_id[marketId];
                const symbol = market['symbol'];
                if (table === 'orderBookL2') {
                    this.orderbooks[symbol] = this.indexedOrderBook ();
                } else if (table === 'orderBookL2_25') {
                    this.orderbooks[symbol] = this.limitedIndexedOrderBook ({}, 25);
                } else if (table === 'orderBook10') {
                    this.orderbooks[symbol] = this.limitedIndexedOrderBook ({}, 10);
                }
                const orderbook = this.orderbooks[symbol];
                for (let i = 0; i < data.length; i++) {
                    const price = this.safeFloat (data[i], 'price');
                    const size = this.safeFloat (data[i], 'size');
                    const id = this.safeString (data[i], 'id');
                    let side = this.safeString (data[i], 'side');
                    side = (side === 'Buy') ? 'bids' : 'asks';
                    const bookside = orderbook[side];
                    bookside.store (price, size, id);
                }
                const messageHash = table + ':' + marketId;
                this.resolveWsFuture (client, messageHash, orderbook.limit ());
            }
        } else {
            const numUpdatesByMarketId = {};
            for (let i = 0; i < data.length; i++) {
                const marketId = this.safeValue (data[i], 'symbol');
                if (marketId in this.markets_by_id) {
                    if (!(marketId in numUpdatesByMarketId)) {
                        numUpdatesByMarketId[marketId] = 0;
                    }
                    numUpdatesByMarketId[marketId] += 1;
                    const market = this.markets_by_id[marketId];
                    const symbol = market['symbol'];
                    const orderbook = this.orderbooks[symbol];
                    const price = this.safeFloat (data[i], 'price');
                    const size = this.safeFloat (data[i], 'size', 0);
                    const id = this.safeString (data[i], 'id');
                    let side = this.safeString (data[i], 'side');
                    side = (side === 'Buy') ? 'bids' : 'asks';
                    const bookside = orderbook[side];
                    if (action === 'insert') {
                        bookside.store (price, size, id);
                    } else {
                        bookside.restore (price, size, id);
                    }
                }
            }
            const marketIds = Object.keys (numUpdatesByMarketId);
            for (let i = 0; i < marketIds.length; i++) {
                const marketId = marketIds[i];
                const messageHash = table + ':' + marketId;
                const market = this.markets_by_id[marketId];
                const symbol = market['symbol'];
                const orderbook = this.orderbooks[symbol];
                this.resolveWsFuture (client, messageHash, orderbook.limit ());
            }
        }
    }

    handleWsDeltas (bookside, deltas, timestamp) {
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
        //         info: 'Welcome to the BitMEX Realtime API.',
        //         version: '2019-11-22T00:24:37.000Z',
        //         timestamp: '2019-11-23T09:02:27.771Z',
        //         docs: 'https://www.bitmex.com/app/wsAPI',
        //         limit: { remaining: 39 }
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
        //         success: true,
        //         subscribe: 'orderBookL2:XBTUSD',
        //         request: { op: 'subscribe', args: [ 'orderBookL2:XBTUSD' ] }
        //     }
        //
        // --------------------------------------------------------------------
        //
        // const channelId = this.safeString (message, 'channelID');
        // this.options['subscriptionStatusByChannelId'][channelId] = message;
        // const requestId = this.safeString (message, 'reqid');
        // if (client.futures[requestId]) {
        //     // todo: transpile delete in ccxt
        //     delete client.futures[requestId];
        // }
        //
        return message;
    }

    handleWsErrors (client, message) {
        //
        // generic error format
        //
        //     { "error": errorMessage }
        //
        // examples
        //
        //     {
        //         "status": 429,
        //         "error": "Rate limit exceeded, retry in 1 seconds.",
        //         "meta": { "retryAfter": 1 },
        //         "request": { "op": "subscribe", "args": "orderBook" },
        //     }
        //
        //     { "error": "Rate limit exceeded, retry in 29 seconds." }
        //
        const error = this.safeValue (message, 'error');
        if (error !== undefined) {
            const request = this.safeValue (message, 'request', {});
            const args = this.safeString (request, 'args', []);
            const numArgs = args.length;
            if (numArgs > 0) {
                const messageHash = args[0];
                const broad = this.exceptions['ws']['broad'];
                const broadKey = this.findBroadlyMatchedKey (broad, error);
                let exception = undefined;
                if (broadKey === undefined) {
                    exception = new ExchangeError (error);
                } else {
                    exception = new broad[broadKey] (error);
                }
                // console.log (requestId, exception);
                this.rejectWsFuture (client, messageHash, exception);
                return false;
            }
        }
        return true;
    }

    handleWsMessage (client, message) {
        //
        //     {
        //         info: 'Welcome to the BitMEX Realtime API.',
        //         version: '2019-11-22T00:24:37.000Z',
        //         timestamp: '2019-11-23T09:04:42.569Z',
        //         docs: 'https://www.bitmex.com/app/wsAPI',
        //         limit: { remaining: 38 }
        //     }
        //
        //     {
        //         success: true,
        //         subscribe: 'orderBookL2:XBTUSD',
        //         request: { op: 'subscribe', args: [ 'orderBookL2:XBTUSD' ] }
        //     }
        //
        //     {
        //         table: 'orderBookL2',
        //         action: 'update',
        //         data: [
        //             { symbol: 'XBTUSD', id: 8799284800, side: 'Sell', size: 721000 },
        //             { symbol: 'XBTUSD', id: 8799285100, side: 'Sell', size: 70590 },
        //             { symbol: 'XBTUSD', id: 8799285550, side: 'Sell', size: 217652 },
        //             { symbol: 'XBTUSD', id: 8799285850, side: 'Sell', size: 105578 },
        //             { symbol: 'XBTUSD', id: 8799286350, side: 'Sell', size: 172093 },
        //             { symbol: 'XBTUSD', id: 8799286650, side: 'Sell', size: 201125 },
        //             { symbol: 'XBTUSD', id: 8799288950, side: 'Buy', size: 47552 },
        //             { symbol: 'XBTUSD', id: 8799289250, side: 'Buy', size: 78217 },
        //             { symbol: 'XBTUSD', id: 8799289700, side: 'Buy', size: 193677 },
        //             { symbol: 'XBTUSD', id: 8799290000, side: 'Buy', size: 818161 },
        //             { symbol: 'XBTUSD', id: 8799290500, side: 'Buy', size: 218806 },
        //             { symbol: 'XBTUSD', id: 8799290800, side: 'Buy', size: 102946 }
        //         ]
        //     }
        //
        if (this.handleWsErrors (client, message)) {
            const table = this.safeString (message, 'table');
            const methods = {
                'orderBookL2': 'handleWsOrderBook',
                'orderBookL2_25': 'handleWsOrderBook',
                'orderBook10': 'handleWsOrderBook',
            };
            const method = this.safeString (methods, table);
            if (method === undefined) {
                console.log (message);
                return message;
            } else {
                return this[method] (client, message);
            }
        }
    }
};
