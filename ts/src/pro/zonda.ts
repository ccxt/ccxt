
//  ---------------------------------------------------------------------------

import zondaRest from '../zonda.js';
import { ArrayCache, ArrayCacheBySymbolById } from '../base/ws/Cache.js';
import type { Tickers, Int, Strings } from '../base/types.js';
import Client from '../base/ws/Client.js';
import { Str, OrderBook, Order, Trade, Ticker, Balances } from '../base/types';
import { sha256 } from '../static_dependencies/noble-hashes/sha256.js';
import { AuthenticationError, ExchangeError, InvalidNonce } from '../base/errors.js';
import { CountedOrderBook } from '../base/ws/OrderBook.js';

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
                'watchOrders': true,
                'watchOHLCV': true,
                'watchMyTrades': false,
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

    async authenticate () {
        /**
         * TODO
         * @ignore
         * @method
         * @description authenticates the user to access private web socket channels
         * @see https://api.zonda.com/#socket-authentication
         * @returns {object} response from exchange
         */
        this.checkRequiredCredentials ();
        const url = this.urls['api']['ws']['private'];
        const messageHash = 'authenticated';
        const client = this.client (url);
        const future = client.future (messageHash);
        const authenticated = this.safeValue (client.subscriptions, messageHash);
        if (authenticated === undefined) {
            const timestamp = this.milliseconds ();
            const signature = this.hmac (this.encode (this.numberToString (timestamp)), this.encode (this.secret), sha256, 'hex');
            const request = {
                'method': 'login',
                'params': {
                    'type': 'HS256',
                    'api_key': this.apiKey,
                    'timestamp': timestamp,
                    'signature': signature,
                },
            };
            this.watch (url, messageHash, request, messageHash);
            //
            //    {
            //        "jsonrpc": "2.0",
            //        "result": true
            //    }
            //
            //    # Failure to return results
            //
            //    {
            //        "jsonrpc": "2.0",
            //        "error": {
            //            "code": 1002,
            //            "message": "Authorization is required or has been failed",
            //            "description": "invalid signature format"
            //        }
            //    }
            //
        }
        return future;
    }

    async subscribePublic (name: string, snapshot: boolean, params = {}) {
        /**
         * @ignore
         * @method
         * @param {string} name websocket endpoint name
         * @param {string[]} [symbols] unified CCXT symbol(s)
         * @param {object} [params] extra parameters specific to the zonda api
         */
        await this.loadMarkets ();
        const url = this.urls['api']['ws'];
        const subscribe = {
            'action': snapshot ? 'proxy' : 'subscribe-public',
            'module': 'trading',
            'path': name,
        };
        let messageHash = name;
        if (snapshot) {
            subscribe['requestId'] = this.milliseconds ();
            messageHash += '::snapshot';
        }
        const message = this.extend (subscribe, params);
        return await this.watch (url, messageHash, message, messageHash);
    }

    async subscribePrivate (name: string, symbol: Str = undefined, params = {}) {
        /**
         * TODO
         * @ignore
         * @method
         * @param {string} name websocket endpoint name
         * @param {string} [symbol] unified CCXT symbol
         * @param {object} [params] extra parameters specific to the zonda api
         */
        await this.loadMarkets ();
        await this.authenticate ();
        const url = this.urls['api']['ws']['private'];
        const splitName = name.split ('_subscribe');
        let messageHash = this.safeString (splitName, 0);
        if (symbol !== undefined) {
            messageHash = messageHash + '::' + symbol;
        }
        const subscribe = {
            'method': name,
            'params': params,
            'id': this.nonce (),
        };
        return await this.watch (url, messageHash, subscribe, messageHash);
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
        return await this.subscribePublic (name, false, params);
    }

    async watchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        /**
         * @method
         * @name zonda#watchTicker
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {[string]} symbols array of unified market symbols
         * @param {object} params extra parameters specific to the exchange API endpoint
         * @returns {[object]} an array of ticker structures [ticker structures]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        const options = this.safeValue (this.options, 'watchTicker');
        const defaultMethod = this.safeString (options, 'method', 'ticker');
        const name = this.safeString2 (params, 'method', 'defaultMethod', defaultMethod);
        const tickers = await this.subscribePublic (name, true, params);
        return this.filterByArray (tickers, 'symbol', symbols);
    }

    handleTicker (client: Client, message) {
        //
        // TODO
        // ticker
        //
        //    {
        //        action: 'push',
        //        topic: 'trading/ticker/btc-usdt',
        //        message: {
        //            market: {
        //                code: 'BTC-USDT',
        //                first: [Object],
        //                second: [Object],
        //                amountPrecision: 8,
        //                pricePrecision: 6,
        //                ratePrecision: 6
        //            },
        //            time: '1705443996064',
        //            highestBid: '43301.640002',
        //            lowestAsk: '43420.565141',
        //            rate: '43406.420002',
        //            previousRate: '43486.838493'
        //        },
        //        timestamp: '1705443996064',
        //        seqNo: 94461165
        //    }
        //
        // stats
        //
        //    {
        //        "action": "push",
        //        "topic": "trading/stats/btc-pln",
        //        "message": [
        //            {
        //                "m": "BTC-PLN",
        //                "h": 28094.15,
        //                "l": 27381.89,
        //                "v": 1837.10247456,
        //                "r24h": 27940
        //            }
        //        ],
        //        "timestamp": "1576846510713",
        //        "seqNo": 430772
        //    }
        //
        const data = this.safeValue (message, 'data', {});
        const marketIds = Object.keys (data);
        const channel = this.safeString (message, 'ch');
        const newTickers = [];
        for (let i = 0; i < marketIds.length; i++) {
            const marketId = marketIds[i];
            const market = this.safeMarket (marketId);
            const symbol = market['symbol'];
            const ticker = this.parseWsTicker (data[marketId], market);
            this.tickers[symbol] = ticker;
            newTickers.push (ticker);
            const messageHash = channel + '::' + symbol;
            client.resolve (this.tickers[symbol], messageHash);
        }
        const messageHashes = this.findMessageHashes (client, channel + '::');
        for (let i = 0; i < messageHashes.length; i++) {
            const messageHash = messageHashes[i];
            const parts = messageHash.split ('::');
            const symbolsString = parts[1];
            const symbols = symbolsString.split (',');
            const tickers = this.filterByArray (newTickers, 'symbol', symbols);
            const tickersSymbols = Object.keys (tickers);
            const numTickers = tickersSymbols.length;
            if (numTickers > 0) {
                client.resolve (tickers, messageHash);
            }
        }
        client.resolve (this.tickers, channel);
        return message;
    }

    parseWsTicker (ticker, market = undefined) {
        //
        // TODO
        //    {
        //        "t": 1614815872000,             // Timestamp in milliseconds
        //        "a": "0.031175",                // Best ask
        //        "A": "0.03329",                 // Best ask quantity
        //        "b": "0.031148",                // Best bid
        //        "B": "0.10565",                 // Best bid quantity
        //        "c": "0.031210",                // Last price
        //        "o": "0.030781",                // Open price
        //        "h": "0.031788",                // High price
        //        "l": "0.030733",                // Low price
        //        "v": "62.587",                  // Base asset volume
        //        "q": "1.951420577",             // Quote asset volume
        //        "p": "0.000429",                // Price change
        //        "P": "1.39",                    // Price change percent
        //        "L": 1182694927                 // Last trade identifier
        //    }
        //
        //    {
        //        "t": 1614815872030,
        //        "o": "32636.79",
        //        "c": "32085.51",
        //        "h": "33379.92",
        //        "l": "30683.28",
        //        "v": "11.90667",
        //        "q": "384081.1955629"
        //    }
        //
        const timestamp = this.safeInteger (ticker, 't');
        const symbol = this.safeSymbol (undefined, market);
        const last = this.safeString (ticker, 'c');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'h'),
            'low': this.safeString (ticker, 'l'),
            'bid': this.safeString (ticker, 'b'),
            'bidVolume': this.safeString (ticker, 'B'),
            'ask': this.safeString (ticker, 'a'),
            'askVolume': this.safeString (ticker, 'A'),
            'vwap': undefined,
            'open': this.safeString (ticker, 'o'),
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeString (ticker, 'v'),
            'quoteVolume': this.safeString (ticker, 'q'),
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
        const trades = await this.subscribePublic (name, true, params);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp');
    }

    handleTrades (client: Client, message) {
        //
        // TODO
        //    {
        //        action: 'push',
        //        topic: 'trading/transactions/btc-usdt',
        //        message: {
        //            transactions: [
        //                {
        //                    {
        //                        "id": "50764c8c-232a-11ea-8d5d-0242ac110008",
        //                        "t": "1576847523375",
        //                        "a": "0.03245411",
        //                        "r": "27787.66",
        //                        "ty": "Buy"
        //                    }
        //                }
        //            ]
        //        },
        //        timestamp: '1705447699746',
        //        seqNo: 962433
        //    }
        //
        const data = this.safeValue2 (message, 'snapshot', 'update', {});
        const marketIds = Object.keys (data);
        for (let i = 0; i < marketIds.length; i++) {
            const marketId = marketIds[i];
            const market = this.safeMarket (marketId);
            const tradesLimit = this.safeInteger (this.options, 'tradesLimit', 1000);
            const symbol = market['symbol'];
            let stored = this.safeValue (this.trades, symbol);
            if (stored === undefined) {
                stored = new ArrayCache (tradesLimit);
                this.trades[symbol] = stored;
            }
            const trades = this.parseWsTrades (data[marketId], market);
            for (let j = 0; j < trades.length; j++) {
                stored.append (trades[j]);
            }
            const messageHash = 'trades::' + symbol;
            client.resolve (stored, messageHash);
        }
        return message;
    }

    parseWsTrades (trades, market: object = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        // TODO
        trades = this.toArray (trades);
        let result = [];
        for (let i = 0; i < trades.length; i++) {
            const trade = this.extend (this.parseWsTrade (trades[i], market), params);
            result.push (trade);
        }
        result = this.sortBy2 (result, 'timestamp', 'id');
        const symbol = this.safeString (market, 'symbol');
        return this.filterBySymbolSinceLimit (result, symbol, since, limit) as Trade[];
    }

    parseWsTrade (trade, market = undefined) {
        //
        // TODO
        //    {
        //        "t": 1626861123552,       // Timestamp in milliseconds
        //        "i": 1555634969,          // Trade identifier
        //        "p": "30877.68",          // Price
        //        "q": "0.00006",           // Quantity
        //        "s": "sell"               // Side
        //    }
        //
        const timestamp = this.safeInteger (trade, 't');
        return this.safeTrade ({
            'info': trade,
            'id': this.safeString (trade, 'i'),
            'order': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': this.safeString (market, 'symbol'),
            'type': undefined,
            'side': this.safeString (trade, 's'),
            'takerOrMaker': undefined,
            'price': this.safeString (trade, 'p'),
            'amount': this.safeString (trade, 'q'),
            'cost': undefined,
            'fee': undefined,
        }, market);
    }

    async watchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        /**
         * TODO
         * @method
         * @name zonda#watchOrders
         * @description watches information on multiple orders made by the user
         * @see https://api.zonda.com/#subscribe-to-reports
         * @see https://api.zonda.com/#subscribe-to-reports-2
         * @see https://api.zonda.com/#subscribe-to-reports-3
         * @param {string} [symbol] unified CCXT market symbol
         * @param {int} [since] timestamp in ms of the earliest order to fetch
         * @param {int} [limit] the maximum amount of orders to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        let marketType = undefined;
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        [ marketType, params ] = this.handleMarketTypeAndParams ('watchOrders', market, params);
        const name = this.getSupportedMapping (marketType, {
            'spot': 'spot_subscribe',
            'margin': 'margin_subscribe',
            'swap': 'futures_subscribe',
            'future': 'futures_subscribe',
        });
        const orders = await this.subscribePrivate (name, symbol, params);
        if (this.newUpdates) {
            limit = orders.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (orders, since, limit, 'timestamp');
    }

    handleOrder (client: Client, message) {
        //
        // TODO
        //    {
        //        "jsonrpc": "2.0",
        //        "method": "spot_order",                            // "margin_order", "future_order"
        //        "params": {
        //            "id": 584244931496,
        //            "client_order_id": "b5acd79c0a854b01b558665bcf379456",
        //            "symbol": "BTCUSDT",
        //            "side": "buy",
        //            "status": "new",
        //            "type": "limit",
        //            "time_in_force": "GTC",
        //            "quantity": "0.01000",
        //            "quantity_cumulative": "0",
        //            "price": "0.01",                              // only updates and snapshots
        //            "post_only": false,
        //            "reduce_only": false,                         // only margin and contract
        //            "display_quantity": "0",                      // only updates and snapshot
        //            "created_at": "2021-07-02T22:52:32.864Z",
        //            "updated_at": "2021-07-02T22:52:32.864Z",
        //            "trade_id": 1361977606,                       // only trades
        //            "trade_quantity": "0.00001",                  // only trades
        //            "trade_price": "49595.04",                    // only trades
        //            "trade_fee": "0.001239876000",                // only trades
        //            "trade_taker": true,                          // only trades, only spot
        //            "trade_position_id": 485308,                  // only trades, only margin
        //            "report_type": "new"                          // "trade", "status" (snapshot)
        //        }
        //    }
        //
        //    {
        //       "jsonrpc": "2.0",
        //       "method": "spot_orders",                            // "margin_orders", "future_orders"
        //       "params": [
        //            {
        //                "id": 584244931496,
        //                "client_order_id": "b5acd79c0a854b01b558665bcf379456",
        //                "symbol": "BTCUSDT",
        //                "side": "buy",
        //                "status": "new",
        //                "type": "limit",
        //                "time_in_force": "GTC",
        //                "quantity": "0.01000",
        //                "quantity_cumulative": "0",
        //                "price": "0.01",                              // only updates and snapshots
        //                "post_only": false,
        //                "reduce_only": false,                         // only margin and contract
        //                "display_quantity": "0",                      // only updates and snapshot
        //                "created_at": "2021-07-02T22:52:32.864Z",
        //                "updated_at": "2021-07-02T22:52:32.864Z",
        //                "trade_id": 1361977606,                       // only trades
        //                "trade_quantity": "0.00001",                  // only trades
        //                "trade_price": "49595.04",                    // only trades
        //                "trade_fee": "0.001239876000",                // only trades
        //                "trade_taker": true,                          // only trades, only spot
        //                "trade_position_id": 485308,                  // only trades, only margin
        //                "report_type": "new"                          // "trade", "status" (snapshot)
        //            }
        //        ]
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
         * @see https://api.zonda.com/#subscribe-to-spot-balances
         * @see https://api.zonda.com/#subscribe-to-futures-balances
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.type] 'spot', 'swap', or 'future'
         *
         * EXCHANGE SPECIFIC PARAMETERS
         * @param {string} [params.mode] 'updates' or 'batches' (default), 'updates' = messages arrive after balance updates, 'batches' = messages arrive at equal intervals if there were any updates
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
        if (action === 'subscribe-public-confirm') {
            return this.handleSubscriptionStatus (client, message);
        }
        if (action === 'proxy-response') {
            return this.handleSnapshot (client, message);
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
