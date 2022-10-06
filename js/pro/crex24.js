'use strict';

//  ---------------------------------------------------------------------------

const crex24Rest = require ('../crex24');
const { ArrayCache } = require ('./base/Cache');

//  ---------------------------------------------------------------------------

module.exports = class crex24 extends crex24Rest {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchBalance': false,
                'watchMyTrades': false,
                'watchOHLCV': false,
                'watchOrderBook': true,
                'watchOrders': false,
                'watchTicker': false, // in docs but 'joinTickers' is not working
                'watchTickers': false,
                'watchTrades': true,
            },
            'urls': {
                'api': {
                    'ws': 'wss://api.crex24.com/signalr/connect',
                    'signalr': 'https://api.crex24.com/signalr',
                },
            },
            'api': {
                'signalr': {
                    'get': [
                        'negotiate',
                        'start',
                    ],
                },
            },
            'options': {
                'tradesLimit': 1000,
                'hub': 'publicCryptoHub',
                'I': this.milliseconds (),
            },
        });
    }

    getSignalRUrl (negotiation) {
        const connectionToken = this.safeString (negotiation['response'], 'ConnectionToken');
        const query = this.extend (negotiation['request'], {
            'connectionToken': connectionToken,
        });
        return this.urls['api']['ws'] + '?' + this.urlencode (query);
    }

    requestId () {
        const reqid = this.sum (this.safeInteger (this.options, 'I', 0), 1);
        this.options['I'] = reqid;
        return reqid;
    }

    createSignalRQuery (params = {}) {
        const hub = this.safeString (this.options, 'hub', 'c3');
        const hubs = [
            { 'name': hub },
        ];
        const ms = this.milliseconds ();
        return this.extend ({
            'transport': 'webSockets',
            'connectionData': this.json (hubs),
            'clientProtocol': 1.5,
            '_': ms, // no cache
            'tid': this.sum (ms % 10, 1), // random
        }, params);
    }

    async negotiate (params = {}) {
        const client = this.client (this.urls['api']['ws']);
        const messageHash = 'negotiate';
        let future = this.safeValue (client.subscriptions, messageHash);
        if (future === undefined) {
            future = client.future (messageHash);
            client.subscriptions[messageHash] = future;
            const request = this.createSignalRQuery (params);
            const response = await this.signalrGetNegotiate (this.extend (request, params));
            //
            //     {
            //         Url: "/signalr",
            //         ConnectionToken: "quXd38+jLvV9QTPcXg25B1ecjKlag55IYzdxVp/HO4//JT/aWZXqyQUIxz6hMeMTEjtETd/66gNU3QFDT6P8jivo2OJN1toY4NY5yBSrIx5u4vycKHe8yC4NL7G/fZmD",
            //         ConnectionId: "af5f99b2-1add-499d-b6fb-2ca8bfdbddbf",
            //         KeepAliveTimeout: "66.6666666",
            //         DisconnectTimeout: "100.0",
            //         ConnectionTimeout: "110.0",
            //         TryWebSockets: true,
            //         ProtocolVersion: "1.5",
            //         TransportConnectTimeout: "5.0",
            //         LongPollDelay: "0.0",
            //     }
            //
            const result = {
                'request': request,
                'response': response,
            };
            client.resolve (result, messageHash);
        }
        return await future;
    }

    async watchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name crex24#watchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {str} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {dict} params extra parameters specific to the crex24 api endpoint
         * @returns {[dict]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const negotiation = await this.negotiate ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const messageHash = 'trades:' + symbol;
        const requestId = this.requestId ().toString ();
        const hub = this.safeString (this.options, 'hub', 'publicCryptoHub');
        const request = {
            'H': hub,
            'M': 'joinTradeHistory',
            'A': [ market['id'] ],
            'I': requestId,
        };
        const url = this.getSignalRUrl (negotiation);
        const trades = await this.watch (url, messageHash, request, messageHash, request);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    handleTrades (client, message) {
        //
        //  snapshot
        //     {
        //         "I": "ETH-BTC",
        //         "LST": [{
        //                 "P": "0.02276",
        //                 "V": "0.36247922",
        //                 "S": "s",
        //                 "T": 1581179155
        //             }, {
        //                 "P": "0.02279",
        //                 "V": "0.00434",
        //                 "S": "s",
        //                 "T": 1581179021
        //             }, {
        //                 "P": "0.0228",
        //                 "V": "0.00016337",
        //                 "S": "b",
        //                 "T": 1581178875
        //             },
        //             ...
        //         ]
        //     }
        //  update
        //     {
        //         "I": "ETH-BTC",
        //         "NT": [{
        //                 "P": "0.02278",
        //                 "V": "0.01287829",
        //                 "S": "s",
        //                 "T": 1581179995
        //             }
        //         ]
        //     }
        //
        const marketId = this.safeString (message, 'I');
        const rawTrades = this.safeValue2 (message, 'LST', 'NT', []);
        const symbol = this.safeSymbol (marketId, undefined, '-');
        const market = this.safeMarket (symbol);
        const messageHash = 'trades:' + symbol;
        let stored = this.safeValue (this.trades, symbol);
        if (stored === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            stored = new ArrayCache (limit);
        }
        for (let i = 0; i < rawTrades.length; i++) {
            const rawTrade = rawTrades[i];
            const trade = this.parseWsTrade (rawTrade, market);
            stored.append (trade);
        }
        this.trades[symbol] = stored;
        client.resolve (stored, messageHash);
    }

    parseWsTrade (trade, market = undefined) {
        //
        //    {
        //        "P": "0.02278",
        //        "V": "0.01287829",
        //        "S": "s",
        //        "T": 1581179995
        //    }
        //
        const sideId = this.safeString (trade, 'S');
        const side = (sideId === 's') ? 'sell' : 'buy';
        const timestamp = this.safeTimestamp (trade, 'T');
        return this.safeTrade ({
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': this.safeSymbol (undefined, market),
            'id': undefined,
            'order': undefined,
            'type': undefined,
            'takerOrMaker': undefined,
            'side': side,
            'price': this.safeString (trade, 'P'),
            'cost': undefined,
            'amount': this.safeString (trade, 'V'),
            'fee': undefined,
        }, market);
    }

    async watchOrderBook (symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name crex24#watchOrderBook
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {str} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {dict} params extra parameters specific to the crex24 api endpoint
         * @returns {dict} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const negotiation = await this.negotiate ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const messageHash = 'orderbook:' + symbol;
        const requestId = this.requestId ().toString ();
        const hub = this.safeString (this.options, 'hub', 'publicCryptoHub');
        const request = {
            'H': hub,
            'M': 'joinOrderBook',
            'A': [ market['id'] ],
            'I': requestId,
        };
        const url = this.getSignalRUrl (negotiation);
        const orderbook = await this.watch (url, messageHash, request, messageHash, request);
        return orderbook.limit (limit);
    }

    handleOrderBook (client, message) {
        //
        //  snapshot
        //     {
        //         "I": "ETH-BTC",
        //         "B": [{
        //                 "P": "0.02279",
        //                 "V": "0.001305"
        //             },
        //             ...
        //         ],
        //         "S": [{
        //                 "P": "0.02285",
        //                 "V": "0.35623465"
        //             },
        //             ...
        //         ]
        //     }
        //
        //  update
        //     {
        //         "I": "ETH-BTC",
        //         "BU": [{
        //                 "V": {
        //                     "P": "0.02277",
        //                     "V": "0.0049"
        //                 },
        //                 "N": "LU"
        //             }
        //         ],
        //         "SU": [{
        //                 "V": {
        //                     "P": "0.0229",
        //                     "V": "0.8654"
        //                 },
        //                 "N": "L"
        //             }, {
        //                 "V": "0.02287",
        //                 "N": "R"
        //             }, {
        //                 "V": {
        //                     "P": "0.02286",
        //                     "V": "0.40223465"
        //                 },
        //                 "N": "LU"
        //             }
        //         ]
        //     }
        //
        const marketId = this.safeString (message, 'I');
        const symbol = this.safeSymbol (marketId, undefined, '-');
        let orderbook = this.safeValue (this.orderbooks, symbol);
        if (orderbook === undefined) {
            orderbook = this.orderBook ({});
        }
        const bids = this.safeValue (message, 'B');
        if (bids !== undefined) {
            const snapshot = this.parseOrderBook (message, symbol, undefined, 'B', 'S', 'P', 'V');
            orderbook.reset (snapshot);
        } else {
            const bids = this.safeValue (message, 'BU', []);
            const asks = this.safeValue (message, 'SU', []);
            this.handleDeltas (orderbook['asks'], asks);
            this.handleDeltas (orderbook['bids'], bids);
        }
        const messageHash = 'orderbook:' + symbol;
        this.orderbooks[symbol] = orderbook;
        client.resolve (orderbook, messageHash);
    }

    handleDelta (bookside, delta) {
        //
        //  add
        //     {
        //         V: {
        //           P: "21378",
        //           V: "0.008",
        //         },
        //         N: "L",
        //     }
        //  remove
        //     {
        //         "V": "0.02287",
        //         "N": "R"
        //     }
        //  updated
        //     {
        //         "V": {
        //             "P": "0.02286",
        //             "V": "0.40223465"
        //         },
        //         "N": "LU"
        //     }
        //
        let bidAsk = undefined;
        const type = this.safeString (delta, 'N');
        if (type === 'R') {
            const price = this.safeNumber (delta, 'V');
            bidAsk = [ price, 0 ];
        } else {
            const values = this.safeValue (delta, 'V');
            bidAsk = this.parseBidAsk (values, 'P', 'V');
        }
        bookside.storeArray (bidAsk);
    }

    handleDeltas (bookside, deltas) {
        for (let i = 0; i < deltas.length; i++) {
            this.handleDelta (bookside, deltas[i]);
        }
    }

    handleMessage (client, message) {
        const M = this.safeValue (message, 'M', []);
        for (let i = 0; i < M.length; i++) {
            const A = this.safeValue (M[i], 'A', []);
            const channel = this.safeString (A, 0, '');
            const payload = this.safeString (A, 1, '');
            const json = this.parseJson (payload);
            const methods = {
                'OrderBook': this.handleOrderBook,
                'TradeHistory': this.handleTrades,
            };
            const keys = Object.keys (methods);
            for (let j = 0; j < keys.length; j++) {
                const key = keys[j];
                if (channel.indexOf (key) >= 0) {
                    const method = methods[key];
                    method.call (this, client, json);
                    return;
                }
            }
        }
    }
};
