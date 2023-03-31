'use strict';

//  ---------------------------------------------------------------------------

import poloniexfuturesRest from '../poloniexfutures.js';
import { AuthenticationError } from '../base/errors.js';
import { ArrayCache, ArrayCacheBySymbolById, ArrayCacheByTimestamp } from '../base/ws/Cache.js';
import { Precise } from '../base/Precise.js';
import { sha256 } from '../static_dependencies/noble-hashes/sha256.js';

//  ---------------------------------------------------------------------------

export default class poloniexfutures extends poloniexfuturesRest {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchOHLCV': false,
                'watchOrderBook': true,
                'watchTicker': true,
                'watchTickers': false,
                'watchTrades': true,
                'watchBalance': true,
                'watchStatus': false,
                'watchOrders': true,
                'watchMyTrades': true,
            },
            'urls': {
                'api': {
                    'ws': 'wss://futures-apiws.poloniex.com/endpoint',
                },
            },
            'options': {
                'tradesLimit': 1000,
                'ordersLimit': 1000,
                'watchOrderBookMethod': '/contractMarket/level3v2', // can also be '/contractMarket/level2'
                'publicToken': undefined,
                'privateToken': undefined,
            },
        });
    }

    async getPublicToken (params = {}) {
        if (this.options['publicToken'] === undefined) {
            const response = await this.publicPostBulletPublic ();
            //
            //    {
            //        code: '200000',
            //        data: {
            //            instanceServers: [ [Object] ],
            //            token: 'DcXijCbKcWFew_i0BS8y6UNmBtlHW3UAvR4Nx4VADIn15tt-jDqMbYWNZ2II5fSnrClCBBv6dTDc8PMFHz-H6tSnN_vkspYYmOImrn5NXLlsFbcpggjU6mMGfZAja_q_-wgHjBcT7RhvJVwiLf8PgR2VF0_UPbEwl-RWj6JCmic=.9NqWNqQVILOkGiD1RL1AoQ=='
            //        }
            //    }
            //
            const data = this.safeValue (response, 'data');
            this.options['publicToken'] = this.safeString (data, 'token');
        }
        return this.options['publicToken'];
        // TODO: deal with expired token?
    }

    async authenticate (params = {}) {
        // TODO
        /**
         * @ignore
         * @method
         * @description authenticates the user to access private web socket channels
         * @see https://futures-docs.poloniex.com/#apply-for-connection-token
         * @returns {object} response from exchange
         */
        this.checkRequiredCredentials ();
        const timestamp = this.numberToString (this.milliseconds ());
        const url = this.urls['api']['ws']['private'];
        const messageHash = 'authenticated';
        const client = this.client (url);
        let future = this.safeValue (client.subscriptions, messageHash);
        if (future === undefined) {
            const accessPath = '/ws';
            const auth = 'GET\n' + accessPath + '\nsignTimestamp=' + timestamp;
            // let expires = this.milliseconds () + 10000;
            // expires = expires.toString ();
            const request = {
                'event': 'subscribe',
                'channel': [ 'auth' ],
                'params': {
                    'key': this.apiKey,
                    'signTimestamp': timestamp,
                    'signature': this.hmac (this.encode (auth), this.encode (this.secret), sha256, 'base64'),
                    'signatureMethod': 'HmacSHA256',  // optional
                    'signatureVersion': '2',          // optional
                },
            };
            const message = this.extend (request, params);
            future = await this.watch (url, messageHash, message);
            //
            //    {
            //        "data": {
            //            "success": true,
            //            "ts": 1645597033915
            //        },
            //        "channel": "auth"
            //    }
            //
            //    # Failure to return results
            //
            //    {
            //        "data": {
            //            "success": false,
            //            "message": "Authentication failed!",
            //            "ts": 1646276295075
            //        },
            //        "channel": "auth"
            //    }
            //
            client.subscriptions[messageHash] = future;
        }
        return future;
    }

    async subscribe (name, isPrivate, symbol = undefined, params = {}) {
        /**
         * @ignore
         * @method
         * @description Connects to a websocket channel
         * @param {String} name name of the channel
         * @param {Bool} isPrivate true for the authenticated url, false for the public url
         * @param {String|undefined} symbol is required for all public channels, not required for private channels (except position)
         * @param {Object} params extra parameters specific to the poloniex api
         * @returns {Object} data from the websocket stream
         */
        await this.loadMarkets ();
        const token = await this.getPublicToken ();
        const url = this.urls['api']['ws'] + '?token=' + token;
        const subscribe = {
            'id': this.milliseconds () + name + symbol,   // ID is a unique string to mark the request which is same as the id property of ack.
            'type': 'subscribe',
            'topic': name,                                // Subscribed topic. Some topics support subscribe to the data of multiple trading pairs through ",".
            'privateChannel': isPrivate,                  // Adopt the private channel or not. Set as false by default.
            'response': true,                             // Whether the server needs to return the receipt information of this subscription or not. Set as false by default.
        };
        let messageHash = name;
        if (symbol !== undefined) {
            const market = this.market (symbol);
            const marketId = market['id'];
            messageHash = name + ':' + marketId;
            subscribe['topic'] = messageHash;
        }
        const request = this.extend (subscribe, params);
        return await this.watch (url, messageHash, request, name);
    }

    async watchTicker (symbol, params = {}) {
        /**
         * @method
         * @name poloniexfutures#watchTicker
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @see https://futures-docs.poloniex.com/#get-real-time-symbol-ticker
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the poloniexfutures api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        const name = '/contractMarket/ticker';
        return await this.subscribe (name, false, symbol, params);
    }

    async watchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name poloniexfutures#watchTrades
         * @description get the list of most recent trades for a particular symbol
         * @see https://futures-docs.poloniex.com/#full-matching-engine-data-level-3
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the poloniexfutures api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const name = '/contractMarket/execution';
        // const name = ' /contractMarket/level3v2'; // ? or
        const trades = await this.subscribe (name, false, symbol, params);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    async watchOrderBook (symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name poloniexfutures#watchOrderBook
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @see https://futures-docs.poloniex.com/#level-2-market-data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit not used by poloniexfutures watchOrderBook
         * @param {object} params extra parameters specific to the poloniexfutures api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        let name = this.safeString (this.options, 'watchOrderBookMethod', '/contractMarket/level3v2'); // can also be /contractMarket/level2
        [ name, params ] = this.handleOptionAndParams (params, 'watchOrderBookMethod', 'name', name);
        const orderbook = await this.subscribe (name, false, symbol, params);
        return orderbook.limit ();
    }

    async watchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name poloniexfutures#watchOrders
         * @description watches information on multiple orders made by the user
         * @see https://futures-docs.poloniex.com/#private-messages
         * @param {string|undefined} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since not used by poloniexfutures watchOrders
         * @param {int|undefined} limit not used by poloniexfutures watchOrders
         * @param {object} params extra parameters specific to the poloniexfutures api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const name = '/contractMarket/tradeOrders';
        // const name = '/contractMarket/advancedOrders'; // TODO: for stop orders
        await this.authenticate ();
        const orders = await this.subscribe (name, true, symbol, params);
        if (this.newUpdates) {
            limit = orders.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (orders, since, limit, 'timestamp', true);
    }

    async watchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name poloniexfutures#watchMyTrades
         * @description watches information on multiple orders made by the user
         * @see https://futures-docs.poloniex.com/#private-messages
         * @param {string|undefined} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since not used by poloniexfutures watchMyTrades
         * @param {int|undefined} limit not used by poloniexfutures watchMyTrades
         * @param {object} params extra parameters specific to the poloniexfutures api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const name = '/contractMarket/tradeOrders';
        await this.authenticate ();
        const orders = await this.subscribe (name, true, symbol, params);
        if (this.newUpdates) {
            limit = orders.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (orders, since, limit, 'timestamp', true);
    }

    async watchBalance (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name poloniexfutures#watchOrders
         * @description watches information on multiple orders made by the user
         * @see https://futures-docs.poloniex.com/#account-balance-events
         * @param {string|undefined} symbol not used by poloniexfutures watchBalance
         * @param {int|undefined} since not used by poloniexfutures watchBalance
         * @param {int|undefined} limit not used by poloniexfutures watchBalance
         * @param {object} params extra parameters specific to the poloniexfutures api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const name = '/contractAccount/wallet';
        await this.authenticate ();
        return await this.subscribe (name, true, undefined, params);
    }

    handleTrade (client, message) {
        //
        //    {
        //        data: {
        //            makerUserId: "1410336",
        //            symbol: "BTCUSDTPERP",
        //            sequence: 267913,
        //            side: "buy",
        //            size: 2,
        //            price: 28409.5,
        //            takerOrderId: "6426f9f15782c8000776995f",
        //            makerOrderId: "6426f9f141406b0008df976e",
        //            takerUserId: "1410880",
        //            tradeId: "6426f9f1de029f0001e334dd",
        //            ts: 1680275953739092500,
        //        },
        //        subject: "match",
        //        topic: "/contractMarket/execution:BTCUSDTPERP",
        //        type: "message",
        //    }
        //
        const data = this.safeValue (message, 'data', []);
        const marketId = this.safeString (data, 'symbol');
        if (marketId !== undefined) {
            const trade = this.parseWsTrade (data);
            const symbol = trade['symbol'];
            const messageHash = '/contractMarket/execution:' + marketId;
            let tradesArray = this.safeValue (this.trades, symbol);
            if (tradesArray === undefined) {
                const tradesLimit = this.safeInteger (this.options, 'tradesLimit', 1000);
                tradesArray = new ArrayCache (tradesLimit);
                this.trades[symbol] = tradesArray;
            }
            tradesArray.append (trade);
            client.resolve (tradesArray, messageHash);
        }
        return message;
    }

    parseWsTrade (trade, market = undefined) {
        //
        // handleTrade
        //
        //    {
        //        symbol: 'BTC_USDT',
        //        amount: '13.41634893',
        //        quantity: '0.000537',
        //        takerSide: 'buy',
        //        createTime: 1676950548834,
        //        price: '24983.89',
        //        id: '62486976',
        //        ts: 1676950548839
        //    }
        //
        const marketId = this.safeString (trade, 'symbol');
        market = this.safeMarket (marketId, market);
        const timestamp = this.safeInteger (trade, 'timestamp');
        return this.safeTrade ({
            'info': trade,
            'id': this.safeString (trade, 'id'),
            'symbol': this.safeString (market, 'symbol'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'order': undefined,
            'type': this.safeStringLower (trade, 'type'),
            'side': this.safeString (trade, 'takerSide'),
            'takerOrMaker': 'taker',
            'price': this.safeString (trade, 'price'),
            'amount': this.safeString (trade, 'quantity'),
            'cost': this.safeString (trade, 'amount'),
            'fee': {
                'rate': undefined,
                'cost': undefined,
                'currency': undefined,
            },
        }, market);
    }

    parseWsOrderTrade (trade, market = undefined) {
        //
        //    {
        //        "symbol": "BTC_USDT",
        //        "type": "LIMIT",
        //        "quantity": "1",
        //        "orderId": "32471407854219264",
        //        "tradeFee": "0",
        //        "clientOrderId": "",
        //        "accountType": "SPOT",
        //        "feeCurrency": "",
        //        "eventType": "place",
        //        "source": "API",
        //        "side": "BUY",
        //        "filledQuantity": "0",
        //        "filledAmount": "0",
        //        "matchRole": "MAKER",
        //        "state": "NEW",
        //        "tradeTime": 0,
        //        "tradeAmount": "0",
        //        "orderAmount": "0",
        //        "createTime": 1648708186922,
        //        "price": "47112.1",
        //        "tradeQty": "0",
        //        "tradePrice": "0",
        //        "tradeId": "0",
        //        "ts": 1648708187469
        //    }
        //
        const timestamp = this.safeInteger (trade, 'tradeTime');
        const marketId = this.safeString (trade, 'symbol');
        return this.safeTrade ({
            'info': trade,
            'id': this.safeString (trade, 'tradeId'),
            'symbol': this.safeSymbol (marketId, market),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'order': this.safeString (trade, 'orderId'),
            'type': this.safeStringLower (trade, 'type'),
            'side': this.safeString (trade, 'side'),
            'takerOrMaker': this.safeString (trade, 'matchRole'),
            'price': this.safeString (trade, 'price'),
            'amount': this.safeString (trade, 'tradeAmount'), // ? tradeQty?
            'cost': undefined,
            'fee': {
                'rate': undefined,
                'cost': this.safeString (trade, 'tradeFee'),
                'currency': this.safeString (trade, 'feeCurrency'),
            },
        }, market);
    }

    handleOrder (client, message) {
        //
        // level2
        //
        //    {
        //        "subject": "level2",
        //        "topic": "/contractMarket/level2:BTCUSDTPERP",
        //        "type": "message",
        //        "data": {
        //          "sequence": 18,                     // Sequence number which is used to judge the continuity of pushed messages
        //          "change": "5000.0,sell,83"          // Price, side, quantity
        //          "timestamp": 1551770400000
        //        }
        //    }
        //
        // level3
        //
        //    {
        //        "topic": "/contractMarket/execution:BTCUSDTPERP",
        //        "subject": "match",
        //        "data": {
        //             "symbol": "BTCUSDTPERP",                       // Symbol
        //             "sequence": 36,                                // Sequence number which is used to judge the continuity of the pushed messages
        //             "side": "buy",                                 // Side of liquidity taker
        //             "matchSize": 1,                                // Filled quantity
        //             "size": 1,                                     // unFilled quantity
        //             "price": 3200.00,                              // Filled price
        //             "takerOrderId": "5c9dd00870744d71c43f5e25",    // Taker order ID
        //             "ts": 1553846281766256031,                     // Filled time - nanosecond
        //             "makerOrderId": "5c9d852070744d0976909a0c",    // Maker order ID
        //             "tradeId": "5c9dd00970744d6f5a3d32fc"          // Transaction ID
        //        }
        //    }
        //
        const data = this.safeValue (message, 'data');
        let orders = this.orders;
        if (orders === undefined) {
            const limit = this.safeInteger (this.options, 'ordersLimit');
            orders = new ArrayCacheBySymbolById (limit);
            this.orders = orders;
        }
        const order = this.safeValue (data, 0);
        const marketId = this.safeString (order, 'symbol');
        if (marketId !== undefined) {
            const messageHash = 'orders:' + marketId;
            const symbol = this.safeSymbol (marketId);
            const orderId = this.safeString (order, 'orderId');
            const clientOrderId = this.safeString (order, 'clientOrderId');
            const previousOrders = this.safeValue (orders.hashmap, symbol, {});
            const previousOrder = this.safeValue2 (previousOrders, orderId, clientOrderId);
            if (previousOrder === undefined) {
                const parsed = this.parseWsOrder (order);
                orders.append (parsed);
                client.resolve (orders, messageHash);
            } else {
                const trade = this.parseWsTrade (order);
                if (previousOrder['trades'] === undefined) {
                    previousOrder['trades'] = [];
                }
                previousOrder['trades'].push (trade);
                previousOrder['lastTradeTimestamp'] = trade['timestamp'];
                let totalCost = 0;
                let totalAmount = 0;
                const trades = previousOrder['trades'];
                for (let i = 0; i < trades.length; i++) {
                    const trade = trades[i];
                    totalCost = this.sum (totalCost, trade['cost']);
                    totalAmount = this.sum (totalAmount, trade['amount']);
                }
                if (totalAmount > 0) {
                    previousOrder['average'] = totalCost / totalAmount;
                }
                previousOrder['cost'] = totalCost;
                if (previousOrder['filled'] !== undefined) { // ? previousOrder['filled'] = 0
                    previousOrder['filled'] += trade['amount'];
                    if (previousOrder['amount'] !== undefined) {
                        previousOrder['remaining'] = previousOrder['amount'] - previousOrder['filled'];
                    }
                }
                if (previousOrder['fee'] === undefined) {
                    previousOrder['fee'] = {
                        'rate': undefined,
                        'cost': 0,
                        'currency': trade['fee']['currency'],
                    };
                }
                if ((previousOrder['fee']['cost'] !== undefined) && (trade['fee']['cost'] !== undefined)) {
                    const stringOrderCost = this.numberToString (previousOrder['fee']['cost']);
                    const stringTradeCost = this.numberToString (trade['fee']['cost']);
                    previousOrder['fee']['cost'] = Precise.stringAdd (stringOrderCost, stringTradeCost);
                }
                // update the newUpdates count
                orders.append (previousOrder);
                client.resolve (orders, messageHash);
                // } else if ((type === 'received') || (type === 'done')) { // TODO?: delete
                //     const info = this.extend (previousOrder['info'], data);
                //     const order = this.parseWsOrder (info);
                //     const keys = Object.keys (order);
                //     // update the reference
                //     for (let i = 0; i < keys.length; i++) {
                //         const key = keys[i];
                //         if (order[key] !== undefined) {
                //             previousOrder[key] = order[key];
                //         }
                //     }
                //     // update the newUpdates count
                //     orders.append (previousOrder);
                //     client.resolve (orders, messageHash);
                // }
            }
        }
        return message;
    }

    parseWsOrder (order, market = undefined) {
        //
        //    {
        //        "symbol": "BTC_USDT",
        //        "type": "LIMIT",
        //        "quantity": "1",
        //        "orderId": "32471407854219264",
        //        "tradeFee": "0",
        //        "clientOrderId": "",
        //        "accountType": "SPOT",
        //        "feeCurrency": "",
        //        "eventType": "place",
        //        "source": "API",
        //        "side": "BUY",
        //        "filledQuantity": "0",
        //        "filledAmount": "0",
        //        "matchRole": "MAKER",
        //        "state": "NEW",
        //        "tradeTime": 0,
        //        "tradeAmount": "0",
        //        "orderAmount": "0",
        //        "createTime": 1648708186922,
        //        "price": "47112.1",
        //        "tradeQty": "0",
        //        "tradePrice": "0",
        //        "tradeId": "0",
        //        "ts": 1648708187469
        //    }
        //
        const id = this.safeString (order, 'orderId');
        const clientOrderId = this.safeString (order, 'clientOrderId');
        const marketId = this.safeString (order, 'symbol');
        const timestamp = this.safeString (order, 'ts');
        const filledAmount = this.safeString (order, 'filledAmount'); // TODO? filledQuantity
        let trades = undefined;
        if (!Precise.stringEq (filledAmount, '0')) {
            trades = [];
            const trade = this.parseWsOrderTrade (order);
            trades.push (trade);
        }
        return this.safeOrder ({
            'info': order,
            'symbol': this.safeSymbol (marketId, market),
            'id': id,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'type': this.safeString (order, 'type'),
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': this.safeString (order, 'side'),
            'price': this.safeString (order, 'price'),
            'stopPrice': undefined,
            'triggerPrice': undefined,
            'amount': this.safeString (order, 'orderAmount'),
            'cost': undefined,
            'average': undefined,
            'filled': filledAmount,
            'remaining': this.safeString (order, 'remaining_size'),
            'status': undefined, // TODO?: eventType, state
            'fee': {
                'rate': undefined,
                'cost': this.safeString (order, 'tradeFee'),
                'currency': this.safeString (order, 'feeCurrency'),
            },
            'trades': trades,
        });
    }

    handleTicker (client, message) {
        //
        //    {
        //        "subject": "ticker",
        //        "topic": "/contractMarket/ticker:BTCUSDTPERP",
        //        "data": {
        //            "symbol": "BTCUSDTPERP",                   // Market of the symbol
        //            "sequence": 45,                            // Sequence number which is used to judge the continuity of the pushed messages
        //            "side": "sell",                            // Transaction side of the last traded taker order
        //            "price": 3600.00,                          // Filled price
        //            "size": 16,                                // Filled quantity
        //            "tradeId": "5c9dcf4170744d6f5a3d32fb",     // Order ID
        //            "bestBidSize": 795,                        // Best bid size
        //            "bestBidPrice": 3200.00,                   // Best bid
        //            "bestAskPrice": 3600.00,                   // Best ask size
        //            "bestAskSize": 284,                        // Best ask
        //            "ts": 1553846081210004941                  // Filled time - nanosecond
        //        },
        //        "type": "message",
        //    }
        //
        const data = this.safeValue (message, 'data', {});
        const marketId = this.safeString (data, 'symbol');
        if (marketId !== undefined) {
            const ticker = this.parseTicker (data);
            const symbol = ticker['symbol'];
            this.tickers[symbol] = ticker;
            const messageHash = '/contractMarket/ticker:' + marketId;
            client.resolve (ticker, messageHash);
        }
        return message;
    }

    handleOrderBook (client, message) {
        //
        //    {
        //        data: {
        //            symbol: 'BTCUSDTPERP',
        //            sequence: 1679593048010,
        //            orderId: '6426fec8586b9500089d64d8',
        //            clientOid: '14e6ee8e-8757-462c-84db-ed12c2b62f55',
        //            ts: 1680277192127513900
        //        },
        //        subject: 'received',
        //        topic: '/contractMarket/level3v2:BTCUSDTPERP',
        //        type: 'message'
        //    }
        //
        //    {
        //        data: {
        //            symbol: 'BTCUSDTPERP',
        //            sequence: 1679593047982,
        //            side: 'sell',
        //            orderTime: '1680277191900131371',
        //            size: '1',
        //            orderId: '6426fec7d32b6e000790268b',
        //            price: '28376.4',
        //            ts: 1680277191939042300
        //        },
        //        subject: 'open',
        //        topic: '/contractMarket/level3v2:BTCUSDTPERP',
        //        type: 'message'
        //    }
        //
        //    {
        //        data: {
        //            symbol: 'BTCUSDTPERP',
        //            reason: 'canceled',   // or 'filled'
        //            sequence: 1679593047983,
        //            orderId: '6426fec74026fa0008e7046f',
        //            ts: 1680277191949842000
        //        },
        //        subject: 'done',
        //        topic: '/contractMarket/level3v2:BTCUSDTPERP',
        //        type: 'message'
        //    }
        //
        const data = this.safeValue (message, 'data', []);
        const type = this.safeString (message, 'subject');
        const marketId = this.safeString (data, 'symbol');
        const market = this.safeMarket (marketId);
        const orderId = this.safeString (data, 'orderId');
        const timestamp = this.safeString (data, 'ts') / 1000;
        const messageHash = this.safeString (data, 'topic');
        const side = this.safeString (data, 'side');
        const size = this.safeString (data, 'size');
        const price = this.safeString (data, 'price');
        // TODO ↓
        const symbol = market['symbol'];
        const name = 'book_lv2';
        const messageHash = name + ':' + marketId;
        const subscription = this.safeValue (client.subscriptions, messageHash, {});
        const limit = this.safeInteger (subscription, 'limit');
        const timestamp = this.safeInteger (item, 'ts');
        const asks = this.safeValue (item, 'asks');
        const bids = this.safeValue (item, 'bids');
        const snapshot = type === 'snapshot';
        const update = type === 'update';
        if (snapshot || update) {
            if (snapshot) {
                this.orderbooks[symbol] = this.orderBook ({}, limit);
            }
            const orderbook = this.orderbooks[symbol];
            if (bids !== undefined) {
                for (let i = 0; i < bids.length; i++) {
                    const bid = this.safeValue (bids, i);
                    const price = this.safeNumber (bid, 0);
                    const amount = this.safeNumber (bid, 1);
                    orderbook['bids'].store (price, amount);
                }
            }
            if (asks !== undefined) {
                for (let i = 0; i < asks.length; i++) {
                    const ask = this.safeValue (asks, i);
                    const price = this.safeNumber (ask, 0);
                    const amount = this.safeNumber (ask, 1);
                    orderbook['asks'].store (price, amount);
                }
            }
            orderbook['timestamp'] = timestamp;
            orderbook['datetime'] = this.iso8601 (timestamp);
            client.resolve (orderbook, messageHash);
        }
    }

    handleBalance (client, message) {
        //
        // Order Margin Event
        //
        //    {
        //        "topic": "/contractAccount/wallet",
        //        "subject": "orderMargin.change",
        //        "channelType": "private",
        //        "data": {
        //            "orderMargin": 5923,              // Current order margin
        //            "currency":"USDT",                // Currency
        //            "timestamp": 1553842862614
        //        }
        //    }
        //
        const data = this.safeValue (message, 'data', []);
        const availableBalance = this.safeNumber (message, 'availableBalance');
        if (availableBalance !== undefined) {
            const currencyId = this.safeString (data, 'currency');
            const messageHash = 'wallet:' + currencyId;
            this.balance = this.parseWsBalance (data);
            client.resolve (this.balance, messageHash);
        }
        return message;
    }

    parseWsBalance (response) {
        //
        //    {
        //        "orderMargin": 5923,              // not present if availableBalance is present
        //        "availableBalance": 5923,         // not present if orderMargin is present
        //        "currency": "USDT",               // Currency
        //        "timestamp": 1553842862614
        //    }
        //
        const timestamp = this.safeInteger (response, 'timestamp');
        const result = {
            'info': response,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        const currencyId = this.safeString (response, 'currency');
        const code = this.safeCurrencyCode (currencyId);
        const newAccount = this.account ();
        newAccount['free'] = this.safeString (response, 'availableBalance');
        newAccount['used'] = this.safeString (response, 'orderMargin');
        result[code] = newAccount;
        return this.safeBalance (result);
    }

    handleMessage (client, message) {
        const subject = this.safeString (message, 'subject');
        // const type = this.safeString (message, 'type');
        const event = this.safeString (message, 'event');
        if (event === 'pong') {
            return this.handlePong (client, message);
        }
        const methods = {
            'book': this.handleOrderBook,
            'open': this.handleOrderBook,
            'done': this.handleOrderBook,
            'ticker': this.handleTicker,
            // 'trades': this.handleTrade,
            'match': this.handleTrade,
            'orders': this.handleOrder,
            'balances': this.handleBalance,
        };
        const method = this.safeValue (methods, subject);
        if (subject === 'auth') {
            this.handleAuthenticate (client, message);
        } else {
            if (method !== undefined) {
                return method.call (this, client, message);
            }
        }
    }

    handleAuthenticate (client, message) {
        //
        //    {
        //        success: true,
        //        ret_msg: '',
        //        op: 'auth',
        //        conn_id: 'ce3dpomvha7dha97tvp0-2xh'
        //    }
        //
        const data = this.safeValue (message, 'data');
        const success = this.safeValue (data, 'success');
        const messageHash = 'authenticated';
        if (success) {
            client.resolve (message, messageHash);
        } else {
            const error = new AuthenticationError (this.id + ' ' + this.json (message));
            client.reject (error, messageHash);
            if (messageHash in client.subscriptions) {
                delete client.subscriptions[messageHash];
            }
        }
        return message;
    }

    ping (client) {
        return {
            'type': 'ping',
            'id': this.milliseconds (),
        };
    }

    handlePong (client, message) {
        client.lastPong = this.milliseconds ();
        return message;
    }
}
