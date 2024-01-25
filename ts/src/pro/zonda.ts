
//  ---------------------------------------------------------------------------

import zondaRest from '../zonda.js';
import { ArrayCache, ArrayCacheBySymbolById } from '../base/ws/Cache.js';
import type { Tickers, Int, Strings } from '../base/types.js';
import Client from '../base/ws/Client.js';
import { Str, OrderBook, Order, Trade, Ticker, Balances } from '../base/types';
import { sha256 } from '../static_dependencies/noble-hashes/sha256.js';
import { AuthenticationError, ExchangeError, InvalidNonce } from '../base/errors.js';
import { CountedOrderBook } from '../base/ws/OrderBook.js';
import { sha512 } from '../static_dependencies/noble-hashes/sha512.js';

//  ---------------------------------------------------------------------------

export default class zonda extends zondaRest {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchTicker': true,
                'watchTickers': true,
                'watchTrades': true,
                'watchOrderBook': true,
                'watchBalance': true,
                'watchOHLCV': false,
                'watchOrders': true,
                'watchMyTrades': true,
                'watchPositions': false,
                'createOrderWs': false,
                'cancelOrderWs': false,
                'fetchOpenOrdersWs': false,
                'cancelAllOrdersWs': false,
            },
            'urls': {
                'api': {
                    'ws': 'wss://api.zondacrypto.exchange/websocket/',
                },
            },
            'options': {
                'tradesLimit': 1000,
                'watchTicker': {
                    'method': 'ticker',  // or 'stats'
                },
                'watchTickers': {
                    'method': 'ticker',  // or 'stats'
                },
            },
            'timeframes': {
            },
            'streaming': {
            },
        });
    }

    async subscribe (path: string, messageHash: string, isPrivate: boolean, params = {}) {
        /**
         * @ignore
         * @method
         * @param {string} name websocket endpoint name
         * @param {string} messageHash
         * @param {boolean} isPrivate true for private endpoints
         * @param {object} [params] extra parameters specific to the zonda api
         */
        await this.loadMarkets ();
        const url = this.urls['api']['ws'];
        const subscribe = {
            'action': isPrivate ? 'subscribe-private' : 'subscribe-public',
            'module': 'trading',
            'path': path,
        };
        if (isPrivate) {
            const payload = this.apiKey + this.nonce ();
            subscribe['hashSignature'] = this.hmac (payload, this.secret, sha512);
            subscribe['publicKey'] = this.apiKey;
            subscribe['requestTimestamp'] = this.milliseconds ();
        }
        const message = this.extend (subscribe, params);
        return await this.watch (url, messageHash, message, messageHash);
    }

    async watchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        /**
         * @method
         * @name zonda#watchOrderBook
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @see https://docs.zondacrypto.exchange/reference/orderbook-3
         * @see https://docs.zondacrypto.exchange/reference/orderbook-limited-1
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int} [limit] the maximum amount of order book entries to return
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.method] 'orderbook/full', 'orderbook/{depth}/{speed}', 'orderbook/{depth}/{speed}/batch', 'orderbook/top/{speed}', or 'orderbook/top/{speed}/batch'
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        let name = 'orderbook/' + market['id'];
        if (limit !== undefined) {
            name = 'orderbook-limited/' + market['id'] + '/' + limit;
        }
        const url = this.urls['api']['ws'];
        const subscribe = {
            'action': 'subscribe-public',
            'module': 'trading',
            'path': name,
        };
        name = name.toLowerCase ();
        const messageHash = name;
        const subscription = {
            'requestId': this.uuid (),
            'name': name,
            'symbol': symbol,
            'method': this.handleOrderBookSubscription,
            'limit': limit,
            'params': params,
        };
        const message = this.extend (subscribe, params);
        const orderbook = await this.watch (url, messageHash, message, messageHash, subscription);
        return orderbook.limit ();
    }

    handleOrderBookSubscription (client: Client, message, subscription) {
        const defaultLimit = this.safeInteger (this.options, 'watchOrderBookLimit', 1000);
        const symbol = this.safeString (subscription, 'symbol');
        const limit = this.safeInteger (subscription, 'limit', defaultLimit);
        this.orderbooks[symbol] = new CountedOrderBook ({}, limit);
        subscription = this.extend (subscription, { 'symbol': symbol });
        this.spawn (this.fetchOrderBookSnapshot, client, message, subscription);
    }

    async fetchOrderBookSnapshot (client, message, subscription) {
        const name = this.safeString (subscription, 'name');
        const requestId = this.safeString (subscription, 'requestId');
        const symbol = this.safeString (subscription, 'symbol');
        const url = this.urls['api']['ws'];
        const request = {
            'requestId': requestId,
            'action': 'proxy',
            'module': 'trading',
            'path': name,
        };
        const messageHash = name;
        try {
            const snapshot = await this.watch (url, requestId, request, requestId, subscription);
            const orderbook = this.safeValue (this.orderbooks, symbol);
            if (orderbook === undefined) {
                // if the orderbook is dropped before the snapshot is received
                return;
            }
            orderbook.reset (snapshot);
            // unroll the accumulated deltas
            const messages = orderbook.cache;
            for (let i = 0; i < messages.length; i++) {
                const messageItem = messages[i];
                const nonce = this.safeInteger (messageItem, 'seqNo');
                // Drop any event where u is <= lastUpdateId in the snapshot
                if (nonce <= orderbook['nonce']) {
                    continue;
                }
                this.handleOrderBookMessage (client, messageItem, orderbook);
            }
            this.orderbooks[symbol] = orderbook;
            client.resolve (orderbook, messageHash);
        } catch (e) {
            delete client.subscriptions[messageHash];
            client.reject (e, messageHash);
        }
    }

    handleOrderBook (client: Client, message) {
        //
        //   {
        //       action: 'push',
        //       topic: 'trading/orderbook/btc-usdt',
        //       message: {
        //            changes: [
        //                {
        //                    "marketCode": "BTC-PLN",
        //                    "entryType": "Buy",
        //                    "rate": "27601.35",
        //                    "action": "update",
        //                    "state": {
        //                        "ra": "27601.35",
        //                        "ca": "0.46205049",
        //                        "sa": "0.46205049",
        //                        "pa": "0.46205049",
        //                        "co": 4
        //                    }
        //                }
        //            ],
        //            timestamp: '1705448464172'
        //       },
        //       timestamp: '1705448464172',
        //       seqNo: 943857832
        //   }
        //
        const topic = this.safeString (message, 'topic');
        const parts = topic.split ('/');
        const marketId = this.safeString (parts, 2);
        const market = this.safeMarket (marketId, undefined, '-');
        const symbol = market['symbol'];
        const messageHash = 'orderbook/' + marketId;
        const orderbook = this.safeValue (this.orderbooks, symbol);
        if (orderbook === undefined) {
            // Sometimes Binance sends the first delta before the subscription
            // confirmation arrives. At that point the orderbook is not
            // initialized yet and the snapshot has not been requested yet
            // therefore it is safe to drop these premature messages.
            //
            return;
        }
        const nonce = this.safeInteger (orderbook, 'nonce');
        if (nonce === undefined) {
            // 2. Buffer the events you receive from the stream.
            orderbook.cache.push (message);
            return;
        }
        try {
            this.handleOrderBookMessage (client, message, orderbook);
            client.resolve (orderbook, messageHash);
        } catch (e) {
            delete this.orderbooks[symbol];
            delete client.subscriptions[messageHash];
            client.reject (e, messageHash);
        }
    }

    handleOrderBookMessage (client: Client, message, orderbook) {
        //
        //   {
        //       action: 'push',
        //       topic: 'trading/orderbook/btc-usdt',
        //       message: {
        //            changes: [
        //                {
        //                    "marketCode": "BTC-PLN",
        //                    "entryType": "Buy",
        //                    "rate": "27601.35",
        //                    "action": "update",
        //                    "state": {
        //                        "ra": "27601.35",
        //                        "ca": "0.46205049",
        //                        "sa": "0.46205049",
        //                        "pa": "0.46205049",
        //                        "co": 4
        //                    }
        //                }
        //            ],
        //            timestamp: '1705448464172'
        //       },
        //       timestamp: '1705448464172',
        //       seqNo: 943857832
        //   }
        //
        const nonce = this.safeInteger (message, 'seqNo');
        if (nonce !== orderbook['nonce'] + 1) {
            throw new InvalidNonce (this.id + ' watchOrderBook received an out-of-order nonce');
        }
        const data = this.safeValue (message, 'message');
        const changes = this.safeValue (data, 'changes');
        const timestamp = this.safeInteger (data, 'timestamp');
        for (let i = 0; i < changes.length; i++) {
            const change = changes[i];
            const sideId = this.safeString (change, 'sideEntry');
            const side = (sideId === 'Buy') ? 'asks' : 'bids';
            const state = this.safeValue (change, 'state');
            this.handleDelta (orderbook[side], state);
        }
        orderbook['timestamp'] = timestamp;
        orderbook['datetime'] = this.iso8601 (timestamp);
        orderbook['nonce'] = nonce;
        return orderbook;
    }

    handleDelta (bookside, delta) {
        //
        //    {
        //        "ra": "27601.35",
        //        "ca": "0.46205049",
        //        "sa": "0.46205049",
        //        "pa": "0.46205049",
        //        "co": 4
        //    }
        //
        const price = this.safeNumber (delta, 'ra');
        const amount = this.safeNumber (delta, 'ca');
        const count = this.safeInteger (delta, 'co');
        bookside.store (price, amount, count);
    }

    async watchTicker (symbol: string, params = {}): Promise<Ticker> {
        /**
         * @method
         * @name zonda#watchTicker
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @see https://docs.zondacrypto.exchange/reference/ticker-2
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.method] 'ticker' or 'stats'
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        const options = this.safeValue (this.options, 'watchTicker');
        const defaultMethod = this.safeString (options, 'method', 'ticker');
        const method = this.safeString2 (params, 'method', 'defaultMethod', defaultMethod);
        params = this.omit (params, [ 'method', 'defaultMethod' ]);
        const market = this.market (symbol);
        const name = method + '/' + market['id'];
        return await this.subscribe (name, name, false, params);
    }

    async watchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        /**
         * @method
         * @name kucoin#watchTickers
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
         * @param {string[]} symbols unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        const options = this.safeValue (this.options, 'watchTicker');
        const defaultMethod = this.safeString (options, 'method', 'ticker');
        const method = this.safeString2 (params, 'method', 'defaultMethod', defaultMethod);
        params = this.omit (params, [ 'method', 'defaultMethod' ]);
        symbols = this.marketSymbols (symbols);
        const messageHash = method;
        // TODO: symbols? each ticker is returned in a separate response
        // if (symbols !== undefined) {
        //     messageHash = messageHash + '::' + symbols.join (',');
        // }
        const tickers = await this.subscribe (method, messageHash, false, params);
        if (this.newUpdates) {
            return tickers;
        }
        return this.filterByArray (this.tickers, 'symbol', symbols);
    }

    handleTicker (client: Client, message) {
        //
        //    {
        //        action: 'push',
        //        topic: 'trading/ticker/btc-usdt',
        //        message: {
        //            market: {
        //                code: 'BTC-USDT',
        //                first: {
        //                    currency: "BTC",
        //                    minOffer: "0.0000028",
        //                    scale: 8,
        //                },
        //                second: {
        //                    currency: "USDT",
        //                    minOffer: "0.108",
        //                    scale: 6,
        //                },
        //                amountPrecision: 8,
        //                pricePrecision: 6,
        //                ratePrecision: 6
        //            },
        //            time: '1705985905717',
        //            highestBid: '40084.863',
        //            lowestAsk: '40129.182218',
        //            rate: '39936.159614',
        //            previousRate: '39809.546219'
        //        },
        //        timestamp: '1705985905717',
        //        seqNo: 94754371
        //    }
        //
        const data = this.safeValue (message, 'message');
        const responseMarket = this.safeValue (data, 'market');
        const marketId = this.safeString (responseMarket, 'code');
        const market = this.safeMarket (marketId);
        const ticker = this.parseWsTicker (data, market);
        this.tickers[market['symbol']] = ticker;
        const messageHash = 'ticker/' + market['id'];
        client.resolve (ticker, messageHash);
        client.resolve (ticker, 'ticker');
        return message;
    }

    handleStats (client: Client, message) {
        //  another method for watchTicker
        //
        //    {
        //        "action": "push",
        //        "topic": "trading/stats/btc-pln",
        //        "message": [
        //            {
        //                "m": "BTC-PLN",      // Currency pair of the market.
        //                "h": 28094.15,       // Highest price of the last 24 hours.
        //                "l": 27381.89,       // Lowest price of the last 24 hours.
        //                "v": 1837.10247456,  // Volume of the last 24 hours.
        //                "r24h": 27940        // Average rate of the last 24 hours.
        //            }
        //        ],
        //        "timestamp": "1576846510713",
        //        "seqNo": 430772
        //    }
        //
        const data = this.safeValue (message, 'message');
        const timestamp = this.safeInteger (message, 'timestamp');
        for (let i = 0; i < data.length; i++) {
            const item = data[i];
            const ticker = this.parseWsTicker (item);
            ticker['timestamp'] = timestamp;
            ticker['datetime'] = this.iso8601 (timestamp);
            const symbol = ticker['symbol'];
            const market = this.market (symbol);
            this.tickers[market['symbol']] = ticker;
            const messageHash = 'stats/' + market['id'];
            client.resolve (ticker, messageHash);
        }
        client.resolve (this.tickers, 'stats');
        return message;
    }

    parseWsTicker (ticker, market = undefined) {
        //
        //    {
        //        market: {
        //                code: 'BTC-USDT',
        //                first: {
        //                    currency: "BTC",
        //                    minOffer: "0.0000028",
        //                    scale: 8,
        //                },
        //                second: {
        //                    currency: "USDT",
        //                    minOffer: "0.108",
        //                    scale: 6,
        //                },
        //                amountPrecision: 8,
        //                pricePrecision: 6,
        //                ratePrecision: 6
        //            },
        //            time: '1705985905717',
        //            highestBid: '40084.863',
        //            lowestAsk: '40129.182218',
        //            rate: '39936.159614',
        //            previousRate: '39809.546219'
        //        },
        //        timestamp: '1705985905717',
        //        seqNo: 94754371
        //    }
        //
        const data = this.safeValue (ticker, 'message');
        const responseMarket = this.safeValue (data, 'market');
        const marketId = this.safeString (responseMarket, 'code');
        market = this.safeMarket (marketId, market);
        const timestamp = this.safeInteger (ticker, 'timestamp');
        const last = this.safeString (ticker, 'rate');
        return this.safeTicker ({
            'symbol': this.safeString2 (market, 'symbol', 'm'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'h'),
            'low': this.safeString (ticker, 'l'),
            'bid': this.safeString (ticker, 'highestBid'),
            'bidVolume': undefined,
            'ask': this.safeString (ticker, 'lowestAsk'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': this.safeString (ticker, 'r24h'),
            'baseVolume': this.safeString (ticker, 'v'),
            'quoteVolume': undefined,
            'info': ticker,
        }, market);
    }

    async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        /**
         * @method
         * @name zonda#watchTrades
         * @description get the list of most recent trades for a particular symbol
         * @see https://docs.zondacrypto.exchange/reference/last-transactions-ws
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int} [since] timestamp in ms of the earliest trade to fetch
         * @param {int} [limit] the maximum amount of trades to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const name = 'transactions/' + market['id'].toLowerCase ();
        const trades = await this.subscribe (name, name, false, params);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp');
    }

    handleTrades (client: Client, message) {
        //
        //    {
        //        "action": "push",
        //        "topic": "trading/transactions/btc-pln",
        //        "message": {
        //            "transactions": [
        //                {
        //                    "id": "50764c8c-232a-11ea-8d5d-0242ac110008",
        //                    "t": "1576847523375",
        //                    "a": "0.03245411",
        //                    "r": "27787.66",
        //                    "ty": "Buy"
        //                }
        //            ]
        //        },
        //        "timestamp": "1576847523375",
        //        "seqNo": 1182873
        //    }
        //
        const data = this.safeValue (message, 'message', {});
        const transactions = this.safeValue (data, 'transactions', {});
        const topic = this.safeString (message, 'topic');
        const splitTopic = topic.split ('/');
        const marketId = this.safeStringUpper (splitTopic, 2);
        const channel = this.safeString (splitTopic, 1);
        const messageHash = channel + '/' + marketId;
        const market = this.market (marketId);
        const tradesLimit = this.safeInteger (this.options, 'tradesLimit', 1000);
        const symbol = market['symbol'];
        let stored = this.safeValue (this.trades, symbol);
        if (stored === undefined) {
            stored = new ArrayCache (tradesLimit);
            this.trades[symbol] = stored;
        }
        const trades = this.parseTrades (transactions, market);
        for (let j = 0; j < trades.length; j++) {
            stored.append (trades[j]);
        }
        client.resolve (stored, messageHash);
        return message;
    }

    async watchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        /**
         * @name zonda#watchOrders
         * @description watches information on multiple orders made by the user
         * @see https://docs.zondacrypto.exchange/reference/active-orders-ws
         * @see https://docs.zondacrypto.exchange/reference/active-stop-orders-1
         * @param {string} [symbol] unified CCXT market symbol
         * @param {int} [since] timestamp in ms of the earliest order to fetch
         * @param {int} [limit] the maximum amount of orders to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        let name = 'offers/';
        const stop = this.safeValue (params, 'stop');
        if (stop) {
            name = 'stop/offers/';
        }
        if (symbol !== undefined) {
            const market = this.market (symbol);
            name += market['id'];
        }
        const orders = await this.subscribe (name, name, true, params);
        if (this.newUpdates) {
            limit = orders.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (orders, since, limit, 'timestamp');
    }

    handleOrderSnapshot (client: Client, message) {
        // order snapshot
        //    {
        //        "action": "proxy-response",
        //        "requestId": "4976d5bd-b1d0-c547-9245-44e4e419e12f",
        //        "statusCode": 200,
        //        "body": {
        //            "status": "Ok",
        //            "items": [
        //                {
        //                    "market": "BTC-PLN",
        //                    "offerType": "Buy",
        //                    "id": "90996f21-27e5-11ea-8d5d-0242ac110008",
        //                    "currentAmount": "15",
        //                    "lockedAmount": "15.00",
        //                    "rate": "1",
        //                    "startAmount": "15",
        //                    "time": "1577367751519",
        //                    "postOnly": false,
        //                    "hidden": false,
        //                    "mode": "limit",
        //                    "receivedAmount": "0.0",
        //                    "firstBalanceId": "380c5b41-44e4-4962-aa8b-451d32d4d352",
        //                    "secondBalanceId": "6c25f724-4b07-4a0f-bad2-8432ffc07b22"
        //                }
        //            ]
        //        }
        //    }
    }

    handleOrder (client: Client, message) {
        //
        // order
        //
        //    {
        //        "action": "push",
        //        "topic": "trading/offers/btc-pln",
        //        "message": {
        //            "entryType": "Buy",
        //            "rate": "1",
        //            "action": "update",
        //            "offerId": "90996f21-27e5-11ea-8d5d-0242ac110008",
        //            "market": "BTC-PLN",
        //            "state": {
        //                "market": "BTC-PLN",
        //                "offerType": "Buy",
        //                "id": "90996f21-27e5-11ea-8d5d-0242ac110008",
        //                "currentAmount": "15",
        //                "lockedAmount": "15.00",
        //                "rate": "1",
        //                "startAmount": "15",
        //                "time": "1577367751519",
        //                "postOnly": false,
        //                "hidden": false,
        //                "mode": "Limit",
        //                "receivedAmount": "0.0",
        //                "balances": {
        //                    "first": "36b3e538-7aac-4fe9-8834-a0577f7706a2",
        //                    "second": "00a6680d-f453-41dd-beca-7594e5680f5a"
        //                },
        //        },
        //        "timestamp": "1577367751519"
        //        },
        //        "timestamp": "1577367751519",
        //        "seqNo": 16
        //    }
        //
        // stop orders
        //
        //    {
        //        "action": "push",
        //        "topic": "trading/stop/offers",
        //        "message": {
        //            "action": "rejected",
        //            "rejectionReason": "InsufficientFunds",
        //            "exchangeOfferId": "8887265-8399-11e9-becc-0242ac110aaa",
        //            "state": {
        //            "id": "79b57265-8399-11e9-becc-0242ac110004",
        //            "operationId": "2b6823c5-dadc-8672-4053-d5d2ca071fc2",
        //            "userId": "f3788966-2c59-425b-9066-51f80fe1a6fd",
        //            "market": "BTC-PLN",
        //            "amount": "1",
        //            "rate": null,
        //            "stopRate": "100000",
        //            "status": "rejected",
        //            "offerType": "Buy",
        //            "mode": "stop-market",
        //            "balances": {
        //                "first": "36b3e538-7aac-4fe9-8834-a0577f7706a2",
        //                "second": "00a6680d-f453-41dd-beca-7594e5680f5a"
        //            },
        //            "createdAt": "1559303080684",
        //            "flags": []
        //            }
        //        },
        //        "timestamp": "1559303080684",
        //        "seqNo": 54
        //    }
        //
        if (this.orders === undefined) {
            const limit = this.safeInteger (this.options, 'ordersLimit');
            this.orders = new ArrayCacheBySymbolById (limit);
        }
        const data = this.safeValue (message, 'params', []);
        if (Array.isArray (data)) {
            for (let i = 0; i < data.length; i++) {
                const order = data[i];
                this.handleOrderHelper (client, message, order);
            }
        } else {
            this.handleOrderHelper (client, message, data);
        }
        return message;
    }

    handleOrderHelper (client: Client, message, order) {
        // TODO
        const orders = this.orders;
        const marketId = this.safeStringLower2 (order, 'instrument', 'symbol');
        const method = this.safeString (message, 'method');
        const splitMethod = method.split ('_order');
        const messageHash = this.safeString (splitMethod, 0);
        const symbol = this.safeSymbol (marketId);
        const parsed = this.parseOrder (order);
        orders.append (parsed);
        client.resolve (orders, messageHash);
        client.resolve (orders, messageHash + '::' + symbol);
    }

    parseWsOrderTrade (trade, market = undefined) {
        //
        // TODO
        //    {
        //        "id": 584244931496,
        //        "client_order_id": "b5acd79c0a854b01b558665bcf379456",
        //        "symbol": "BTCUSDT",
        //        "side": "buy",
        //        "status": "new",
        //        "type": "limit",
        //        "time_in_force": "GTC",
        //        "quantity": "0.01000",
        //        "quantity_cumulative": "0",
        //        "price": "0.01",                              // only updates and snapshots
        //        "post_only": false,
        //        "reduce_only": false,                         // only margin and contract
        //        "display_quantity": "0",                      // only updates and snapshot
        //        "created_at": "2021-07-02T22:52:32.864Z",
        //        "updated_at": "2021-07-02T22:52:32.864Z",
        //        "trade_id": 1361977606,                       // only trades
        //        "trade_quantity": "0.00001",                  // only trades
        //        "trade_price": "49595.04",                    // only trades
        //        "trade_fee": "0.001239876000",                // only trades
        //        "trade_taker": true,                          // only trades, only spot
        //        "trade_position_id": 485308,                  // only trades, only margin
        //        "report_type": "new"                          // "trade", "status" (snapshot)
        //    }
        //
        const timestamp = this.safeInteger (trade, 'created_at');
        const marketId = this.safeString (trade, 'symbol');
        return this.safeTrade ({
            'info': trade,
            'id': this.safeString (trade, 'trade_id'),
            'order': this.safeString (trade, 'id'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': this.safeMarket (marketId, market),
            'type': undefined,
            'side': this.safeString (trade, 'side'),
            'takerOrMaker': this.safeString (trade, 'trade_taker'),
            'price': this.safeString (trade, 'trade_price'),
            'amount': this.safeString (trade, 'trade_quantity'),
            'cost': undefined,
            'fee': {
                'cost': this.safeString (trade, 'trade_fee'),
                'currency': undefined,
                'rate': undefined,
            },
        }, market);
    }

    parseWsOrder (order, market = undefined) {
        //
        // TODO
        //    {
        //        "id": 584244931496,
        //        "client_order_id": "b5acd79c0a854b01b558665bcf379456",
        //        "symbol": "BTCUSDT",
        //        "side": "buy",
        //        "status": "new",
        //        "type": "limit",
        //        "time_in_force": "GTC",
        //        "quantity": "0.01000",
        //        "quantity_cumulative": "0",
        //        "price": "0.01",                              // only updates and snapshots
        //        "post_only": false,
        //        "reduce_only": false,                         // only margin and contract
        //        "display_quantity": "0",                      // only updates and snapshot
        //        "created_at": "2021-07-02T22:52:32.864Z",
        //        "updated_at": "2021-07-02T22:52:32.864Z",
        //        "trade_id": 1361977606,                       // only trades
        //        "trade_quantity": "0.00001",                  // only trades
        //        "trade_price": "49595.04",                    // only trades
        //        "trade_fee": "0.001239876000",                // only trades
        //        "trade_taker": true,                          // only trades, only spot
        //        "trade_position_id": 485308,                  // only trades, only margin
        //        "report_type": "new"                          // "trade", "status" (snapshot)
        //    }
        //
        const timestamp = this.safeString (order, 'created_at');
        const marketId = this.safeString (order, 'symbol');
        market = this.safeMarket (marketId, market);
        const tradeId = this.safeString (order, 'trade_id');
        let trades = undefined;
        if (tradeId !== undefined) {
            const trade = this.parseWsOrderTrade (order, market);
            trades = [ trade ];
        }
        // const rawStatus = this.safeString (order, 'status');
        // const report_type = this.safeString (order, 'report_type');
        // let parsedStatus = undefined;
        // if (report_type === 'canceled') {
        //     parsedStatus = this.parseOrderStatus (report_type);
        // } else {
        //     parsedStatus = this.parseOrderStatus (rawStatus);
        // }
        return this.safeOrder ({
            'info': order,
            'id': this.safeString (order, 'id'),
            'clientOrderId': this.safeString (order, 'client_order_id'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': market['symbol'],
            'price': this.safeString (order, 'price'),
            'amount': this.safeString (order, 'quantity'),
            'type': this.safeString (order, 'type'),
            'side': this.safeStringUpper (order, 'side'),
            'timeInForce': this.safeString (order, 'time_in_force'),
            'postOnly': this.safeString (order, 'post_only'),
            'reduceOnly': this.safeValue (order, 'reduce_only'),
            'filled': undefined,
            'remaining': undefined,
            'cost': undefined,
            // 'status': parsedStatus,
            'average': undefined,
            'trades': trades,
            'fee': undefined,
        }, market);
    }

    async watchBalance (params = {}): Promise<Balances> {
        /**
         * TODO
         * @method
         * @name zonda#watchBalance
         * @description watches balance updates, cannot subscribe to margin account balances
         * @see https://docs.zondacrypto.exchange/reference/available-funds-ws
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [balance structures]{@link https://docs.ccxt.com/#/?id=balance-structure}
         */
        await this.loadMarkets ();
        let type = undefined;
        [ type, params ] = this.handleMarketTypeAndParams ('watchBalance', undefined, params);
        const name = this.getSupportedMapping (type, {
            'spot': 'spot_balance_subscribe',
            'swap': 'futures_balance_subscribe',
            'future': 'futures_balance_subscribe',
        });
        const mode = this.safeString (params, 'mode', 'batches');
        params = this.omit (params, 'mode');
        const request = {
            'mode': mode,
        };
        return await this.subscribePrivate (name, undefined, this.extend (request, params));
    }

    handleBalance (client: Client, message) {
        //
        // TODO
        //    {
        //        "jsonrpc": "2.0",
        //        "method": "futures_balance",
        //        "params": [
        //            {
        //                "currency": "BCN",
        //                "available": "100.000000000000",
        //                "reserved": "0",
        //                "reserved_margin": "0"
        //            },
        //            ...
        //        ]
        //    }
        //
        const messageHash = this.safeString (message, 'method');
        const params = this.safeValue (message, 'params');
        const balance = this.parseBalance (params);
        this.balance = this.deepExtend (this.balance, balance);
        client.resolve (this.balance, messageHash);
    }

    handleNotification (client: Client, message) {
        //
        // TODO
        //     { jsonrpc: "2.0", result: true, id: null }
        //
        return message;
    }

    handleOrderRequest (client: Client, message) {
        //
        // TODO
        // createOrderWs, cancelOrderWs
        //
        //    {
        //        "jsonrpc": "2.0",
        //        "result": {
        //            "id": 1130310696965,
        //            "client_order_id": "OPC2oyHSkEBqIpPtniLqeW-597hUL3Yo",
        //            "symbol": "ADAUSDT",
        //            "side": "buy",
        //            "status": "new",
        //            "type": "limit",
        //            "time_in_force": "GTC",
        //            "quantity": "4",
        //            "quantity_cumulative": "0",
        //            "price": "0.3300000",
        //            "post_only": false,
        //            "created_at": "2023-11-17T14:58:15.903Z",
        //            "updated_at": "2023-11-17T14:58:15.903Z",
        //            "original_client_order_id": "d6b645556af740b1bd1683400fd9cbce",       // spot_replace_order only
        //            "report_type": "new"
        //            "margin_mode": "isolated",                                            // margin and future only
        //            "reduce_only": false,                                                 // margin and future only
        //        },
        //        "id": 1700233093414
        //    }
        //
        const messageHash = this.safeInteger (message, 'id');
        const result = this.safeValue (message, 'result', {});
        if (Array.isArray (result)) {
            const parsedOrders = [];
            for (let i = 0; i < result.length; i++) {
                const parsedOrder = this.parseWsOrder (result[i]);
                parsedOrders.push (parsedOrder);
            }
            client.resolve (parsedOrders, messageHash);
        } else {
            const parsedOrder = this.parseWsOrder (result);
            client.resolve (parsedOrder, messageHash);
        }
        return message;
    }

    handleSubscriptionStatus (client: Client, message) {
        //
        //    {
        //        action: 'subscribe-public-confirm',
        //        module: 'trading',
        //        path: 'orderbook/btc-usdt'
        //    }
        //
        const name = this.safeString (message, 'path', '');
        const subscriptionsById = this.indexBy (client.subscriptions, 'name');
        const subscription = this.safeValue (subscriptionsById, name, {});
        const method = this.safeValue (subscription, 'method');
        if (method !== undefined) {
            method.call (this, client, message, subscription);
        }
        return message;
    }

    handleSnapshot (client: Client, message) {
        //
        //    {
        //        "action": "proxy-response",
        //        "requestId": "78539fe0-e9b0-4e4e-8c86-70b36aa93d4f",
        //        "statusCode": 200,
        //        "body": {
        //          "status": "Ok",
        //          "sell": [
        //            {
        //              "ra": "27779.61",
        //              "ca": "2.02",
        //              "sa": "2.02",
        //              "pa": "2.02",
        //              "co": 1
        //            }
        //          ],
        //          "buy": [
        //            {
        //              "ra": "27300",
        //              "ca": "0.0531304",
        //              "sa": "0.0531304",
        //              "pa": "0.0531304",
        //              "co": 2
        //            }
        //          ],
        //          "timestamp": "1576847127883",
        //          "seqNo": "40019280"
        //        }
        //    }
        //
        const messageHash = this.safeString (message, 'requestId');
        const body = this.safeValue (message, 'body');
        const rawBids = this.safeValue (body, 'buy', []);
        const rawAsks = this.safeValue (body, 'sell', []);
        const timestamp = this.safeInteger (body, 'timestamp');
        const subscription = this.safeValue (client.subscriptions, messageHash);
        const symbol = this.safeString (subscription, 'symbol');
        const orderbook = {
            'symbol': symbol,
            'bids': this.parseBidsAsks (rawBids, 'ra', 'ca', 'co'),
            'asks': this.parseBidsAsks (rawAsks, 'ra', 'ca', 'co'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'nonce': this.safeInteger (body, 'seqNo'),
        };
        client.resolve (orderbook, messageHash);
    }

    handleMessage (client: Client, message) {
        this.handleError (client, message);
        const action = this.safeString (message, 'action');
        const path = this.safeString (message, 'path');
        const isOrderbookPath = (path === 'orderbook');
        if (isOrderbookPath) {
            if (action === 'subscribe-public-confirm') {
                return this.handleSubscriptionStatus (client, message);
            } else if (action === 'proxy-response') {
                return this.handleSnapshot (client, message);
            }
        }
        const topic = this.safeString (message, 'topic');
        let splitTopic = undefined;
        if (topic !== undefined) {
            splitTopic = topic.split ('/');
        }
        const channel = this.safeString (splitTopic, 1);
        const methods = {
            'transactions': this.handleTrades,
            'ticker': this.handleTicker,
            'orderbook': this.handleOrderBook,
        };
        const method = this.safeValue (methods, channel);
        if (method !== undefined) {
            method.call (this, client, message);
        }
    }

    handleAuthenticate (client: Client, message) {
        //
        // TODO
        //    {
        //        "jsonrpc": "2.0",
        //        "result": true
        //    }
        //
        const success = this.safeValue (message, 'result');
        const messageHash = 'authenticated';
        if (success) {
            const future = this.safeValue (client.futures, messageHash);
            future.resolve (true);
        } else {
            const error = new AuthenticationError (this.id + ' ' + this.json (message));
            client.reject (error, messageHash);
            if (messageHash in client.subscriptions) {
                delete client.subscriptions[messageHash];
            }
        }
        return message;
    }

    handleError (client: Client, message) {
        //
        // TODO
        //    {
        //        jsonrpc: '2.0',
        //        error: {
        //          code: 20001,
        //          message: 'Insufficient funds',
        //          description: 'Check that the funds are sufficient, given commissions'
        //        },
        //        id: 1700228604325
        //    }
        //
        const error = this.safeValue (message, 'error');
        if (error !== undefined) {
            const code = this.safeValue (error, 'code');
            const errorMessage = this.safeString (error, 'message');
            const description = this.safeString (error, 'description');
            const feedback = this.id + ' ' + description;
            this.throwExactlyMatchedException (this.exceptions['exact'], code, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], errorMessage, feedback);
            throw new ExchangeError (feedback); // unknown message
        }
        return undefined;
    }
}
