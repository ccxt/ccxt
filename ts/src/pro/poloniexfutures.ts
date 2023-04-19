'use strict';

//  ---------------------------------------------------------------------------

import poloniexfuturesRest from '../poloniexfutures.js';
import { AuthenticationError } from '../base/errors.js';
import { ArrayCache, ArrayCacheBySymbolById } from '../base/ws/Cache.js';
import { Precise } from '../base/Precise.js';
import { Int } from '../base/types.js';
import Client from '../base/ws/Client.js';

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
                'watchMyTrades': false,
            },
            'urls': {
                'api': {
                    'ws': 'wss://futures-apiws.poloniex.com/endpoint',
                },
            },
            'options': {
                'tradesLimit': 1000,
                'ordersLimit': 1000,
                'watchOrderBook': {
                    'method': '/contractMarket/level3v2', // can also be '/contractMarket/level2'
                },
                'publicToken': undefined,
                'privateToken': undefined,
            },
            'streaming': {
                'keepAlive': 30000,
                'maxPingPongMisses': 2.0,
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
    }

    async getPrivateToken (params = {}) {
        if (this.options['privateToken'] === undefined) {
            const response = await this.privatePostBulletPrivate ();
            //
            //   {
            //       code: '200000',
            //       data: {
            //           instanceServers: [
            //                {
            //                    "pingInterval": 50000,
            //                    "endpoint": "wss://futures-apiws.poloniex.com/endpoint",
            //                    "protocol": "websocket",
            //                    "encrypt": true,
            //                    "pingTimeout": 10000
            //                }
            //            ],
            //            "token": "vYNlCtbz4XNJ1QncwWilJnBtmmfe4geLQDUA62kKJsDChc6I4bRDQc73JfIrlFaVYIAE0Gv2--MROnLAgjVsWkcDq_MuG7qV7EktfCEIphiqnlfpQn4Ybg==.IoORVxR2LmKV7_maOR9xOg=="
            //       }
            //   }
            //
            const data = this.safeValue (response, 'data');
            this.options['privateToken'] = this.safeString (data, 'token');
        }
        return this.options['privateToken'];
    }

    async subscribe (name: string, isPrivate: boolean, symbol: string = undefined, params = {}) {
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
        let token = undefined;
        if (isPrivate) {
            token = await this.getPrivateToken ();
        } else {
            token = await this.getPublicToken ();
        }
        const url = this.urls['api']['ws'] + '?token=' + token;
        const milliseconds = this.numberToString (this.milliseconds ());
        const subscribe = {
            'id': milliseconds + name + symbol,   // ID is a unique string to mark the request which is same as the id property of ack.
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

    async watchTicker (symbol: string, params = {}) {
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

    async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}) {
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
        symbol = this.symbol (symbol);
        const trades = await this.subscribe (name, false, symbol, params);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    async watchOrderBook (symbol: string, limit: Int = undefined, params = {}) {
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
        const options = this.safeValue (this.options, 'watchOrderBook');
        let name = this.safeString (options, 'method', '/contractMarket/level3v2'); // can also be /contractMarket/level2
        [ name, params ] = this.handleOptionAndParams (params, 'method', 'name', name);
        const orderbook = await this.subscribe (name, false, symbol, params);
        return orderbook.limit ();
    }

    async watchOrders (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name poloniexfutures#watchOrders
         * @description watches information on multiple orders made by the user
         * @see https://futures-docs.poloniex.com/#private-messages
         * @param {string|undefined} symbol not used by poloniexfutures watchOrders
         * @param {int|undefined} since not used by poloniexfutures watchOrders
         * @param {int|undefined} limit not used by poloniexfutures watchOrders
         * @param {object} params extra parameters specific to the poloniexfutures api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const stop = this.safeValue (params, 'stop');
        const name = stop ? '/contractMarket/advancedOrders' : '/contractMarket/tradeOrders';
        const orders = await this.subscribe (name, true, undefined, params);
        if (this.newUpdates) {
            limit = orders.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (orders, since, limit, 'timestamp', true);
    }

    async watchBalance (params = {}) {
        /**
         * @method
         * @name poloniexfutures#watchBalance
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
        // await this.authenticate ();
        return await this.subscribe (name, true, undefined, params);
    }

    handleTrade (client: Client, message) {
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
            'takerOrMaker': this.safeStringLower (trade, 'matchRole'),
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

    handleOrder (client: Client, message) {
        //
        //    {
        //        data: {
        //          symbol: 'ADAUSDTPERP',
        //          orderType: 'limit',
        //          side: 'buy',
        //          canceledSize: '1',
        //          orderId: '642b4d4c0494cd0007c76813',
        //          type: 'canceled',
        //          orderTime: '1680559436101909048',
        //          size: '1',
        //          filledSize: '0',
        //          marginType: 1,
        //          price: '0.25',
        //          remainSize: '0',
        //          clientOid: '112cbbf1-95a3-4917-957c-d3a87d81f853',
        //          status: 'done',
        //          ts: 1680559677560686600
        //        },
        //        subject: 'orderChange',
        //        topic: '/contractMarket/tradeOrders',
        //        channelType: 'private',
        //        type: 'message',
        //        userId: '1139790'
        //    }
        //
        const data = this.safeValue (message, 'data', {});
        let orders = this.orders;
        if (orders === undefined) {
            const limit = this.safeInteger (this.options, 'ordersLimit');
            orders = new ArrayCacheBySymbolById (limit);
            this.orders = orders;
        }
        const marketId = this.safeString (data, 'symbol');
        if (marketId !== undefined) {
            const messageHash = '/contractMarket/tradeOrders:' + marketId;
            const symbol = this.safeSymbol (marketId);
            const orderId = this.safeString (data, 'orderId');
            const clientOrderId = this.safeString (data, 'clientOid');
            const previousOrders = this.safeValue (orders.hashmap, symbol, {});
            const previousOrder = this.safeValue2 (previousOrders, orderId, clientOrderId);
            if (previousOrder === undefined) {
                const parsed = this.parseWsOrder (data);
                orders.append (parsed);
                client.resolve (orders, messageHash);
            } else {
                const trade = this.parseWsTrade (data);
                if (previousOrder['trades'] === undefined) {
                    previousOrder['trades'] = [];
                }
                previousOrder['trades'].push (trade);
                previousOrder['lastTradeTimestamp'] = trade['timestamp'];
                let totalCost = '0';
                let totalAmount = '0';
                const trades = previousOrder['trades'];
                for (let i = 0; i < trades.length; i++) {
                    const trade = trades[i];
                    totalCost = Precise.stringAdd (totalCost, trade['cost']);
                    totalAmount = Precise.stringAdd (totalAmount, trade['amount']);
                }
                if (Precise.stringGt (totalAmount, '0')) {
                    previousOrder['average'] = this.parseNumber (Precise.stringDiv (totalCost, totalAmount));
                }
                previousOrder['cost'] = this.parseNumber (totalCost);
                if (previousOrder['filled'] !== undefined) {
                    const tradeAmount = this.numberToString (trade['amount']);
                    let previousFilled = this.numberToString (previousOrder['filled']);
                    const previousAmount = this.numberToString (previousOrder['amount']);
                    previousFilled = Precise.stringAdd (tradeAmount, previousFilled);
                    previousOrder['filled'] = this.parseNumber (previousFilled);
                    if (previousOrder['amount'] !== undefined) {
                        previousOrder['remaining'] = this.parseNumber (Precise.stringSub (previousAmount, previousFilled));
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
            }
            client.resolve (orders, '/contractMarket/tradeOrders');
        }
        return message;
    }

    parseStatus (status: string, type: string) {
        /**
         * @ignore
         * @method
         * @param {string} status "match", "open", "done"
         * @param {string} type "open", "match", "filled", "canceled", "update"
         * @returns {string}
         */
        if (type === 'canceled') {
            return 'cancelled';
        }
        const statuses = {
            'open': 'open',
            'match': 'closed',
            'done': 'closed',
        };
        return this.safeString (statuses, status, status);
    }

    parseWsOrder (order, market = undefined) {
        //
        //    {
        //        symbol: 'ADAUSDTPERP',
        //        orderType: 'limit',
        //        side: 'buy',
        //        canceledSize: '1',
        //        orderId: '642b4d4c0494cd0007c76813',
        //        type: 'canceled',
        //        orderTime: '1680559436101909048',
        //        size: '1',
        //        filledSize: '0',
        //        marginType: 1,
        //        price: '0.25',
        //        remainSize: '0',
        //        clientOid: '112cbbf1-95a3-4917-957c-d3a87d81f853',
        //        status: 'done',
        //        ts: 1680559677560686600
        //    }
        //
        const id = this.safeString (order, 'orderId');
        const clientOrderId = this.safeString (order, 'clientOid');
        const marketId = this.safeString (order, 'symbol');
        const timestamp = this.safeIntegerProduct (order, 'ts', 0.000001);
        const filledAmount = this.safeString (order, 'filledSize');
        let trades = undefined;
        if (!Precise.stringEq (filledAmount, '0')) {
            trades = [];
            const trade = this.parseWsOrderTrade (order);
            trades.push (trade);
        }
        const status = this.safeString (order, 'status');
        const type = this.safeString (order, 'type');
        return this.safeOrder ({
            'info': order,
            'symbol': this.safeSymbol (marketId, market),
            'id': id,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'type': this.safeString (order, 'orderType'),
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': this.safeString (order, 'side'),
            'price': this.safeString (order, 'price'),
            'stopPrice': undefined,
            'triggerPrice': undefined,
            'amount': this.safeString (order, 'size'),
            'cost': undefined,
            'average': undefined,
            'filled': filledAmount,
            'remaining': this.safeString (order, 'remainSize'),
            'status': this.parseStatus (status, type),
            'fee': {
                'rate': undefined,
                'cost': this.safeString (order, 'tradeFee'),
                'currency': this.safeString (order, 'feeCurrency'),
            },
            'trades': trades,
        });
    }

    handleTicker (client: Client, message) {
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

    handleOrderBook (client: Client, message) {
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
        // const type = this.safeString (message, 'subject');
        const marketId = this.safeString (data, 'symbol');
        const market = this.safeMarket (marketId);
        // const orderId = this.safeString (data, 'orderId');
        const timestamp = this.safeIntegerProduct (data, 'ts', 0.000001);
        const messageHash = this.safeString (message, 'topic');
        const side = this.safeString (data, 'side');
        const size = this.safeNumber (data, 'size');
        const price = this.safeNumber (data, 'price');
        const orderId = this.safeString (data, 'orderId');
        const symbol = this.safeString (market, 'symbol');
        const subscription = this.safeValue (client.subscriptions, messageHash, {});
        const limit = this.safeInteger (subscription, 'limit');
        // const update = type === 'done';
        let orderBook = this.safeValue (this.orderbooks, symbol);
        if (orderBook === undefined) {
            this.orderbooks[symbol] = this.indexedOrderBook ({}, limit);
            orderBook = this.orderbooks[symbol];
        }
        if (side === 'buy') {  // Only happens if subject is open
            orderBook['bids'].store (price, size, orderId);
        } else if (side === 'sell') {
            orderBook['asks'].store (price, size, orderId);
        }
        orderBook['timestamp'] = timestamp;
        orderBook['datetime'] = this.iso8601 (timestamp);
        orderBook['symbol'] = symbol;
        client.resolve (orderBook, messageHash);
    }

    handleLevel2OrderBook (client: Client, message) {
        //
        //    {
        //        "id": 1545910660740,
        //        "type": "subscribe",
        //        "topic": "/contractMarket/level2:BTCUSDTPERP",
        //        "response": true
        //    }
        //
        //    {
        //        "subject": "level2",
        //        "topic": "/contractMarket/level2:BTCUSDTPERP",
        //        "type": "message",
        //        "data": {
        //            "sequence": 18,                   // Sequence number which is used to judge the continuity of pushed messages
        //            "change": "5000.0,sell,83"        // Price, side, quantity
        //            "timestamp": 1551770400000
        //        }
        //    }
        //
        const data = this.safeValue (message, 'data', {});
        const messageHash = this.safeString (message, 'topic', '');
        const splitTopic = messageHash.split (':');
        const marketId = this.safeString (splitTopic, 1);
        const market = this.safeMarket (marketId);
        const symbol = this.safeString (market, 'symbol');
        const timestamp = this.safeInteger (data, 'timestamp');
        const change = this.safeString (data, 'change');
        const splitChange = change.split (',');
        const price = this.safeNumber (splitChange, 0);
        const side = this.safeString (splitChange, 1);
        const size = this.safeNumber (splitChange, 2);
        const subscription = this.safeValue (client.subscriptions, messageHash, {});
        const limit = this.safeInteger (subscription, 'limit');
        // const update = type === 'done';
        let orderBook = this.safeValue (this.orderbooks, symbol);
        if (orderBook === undefined) {
            this.orderbooks[symbol] = this.orderBook ({}, limit);
            orderBook = this.orderbooks[symbol];
        }
        if (side === 'buy') {  // Only happens if subject is open
            orderBook['bids'].store (price, size);
        } else if (side === 'sell') {
            orderBook['asks'].store (price, size);
        }
        orderBook['timestamp'] = timestamp;
        orderBook['datetime'] = this.iso8601 (timestamp);
        orderBook['symbol'] = symbol;
        client.resolve (orderBook, messageHash);
    }

    handleBalance (client: Client, message) {
        //
        //    {
        //        data: {
        //          currency: 'USDT',
        //          availableBalance: '4.0000000000',
        //          timestamp: '1680557568670'
        //        },
        //        subject: 'availableBalance.change',
        //        topic: '/contractAccount/wallet',
        //        channelType: 'private',
        //        id: '642b4600cae86800074b5ab7',
        //        type: 'message',
        //        userId: '1139790'
        //    }
        //
        //    {
        //        data: {
        //          currency: 'USDT',
        //          orderMargin: '0.0000000000',
        //          timestamp: '1680558743307'
        //        },
        //        subject: 'orderMargin.change',
        //        topic: '/contractAccount/wallet',
        //        channelType: 'private',
        //        id: '642b4a97b58e360007c3a237',
        //        type: 'message',
        //        userId: '1139790'
        //    }
        //
        const data = this.safeValue (message, 'data', []);
        const messageHash = '/contractAccount/wallet';
        const currencyId = this.safeString (data, 'currency');
        const currency = this.currency (currencyId);
        const code = currency['code'];
        const balance = this.safeValue (this.balance, code, {});
        const newBalance = this.parseWsBalance (data);
        if (balance['timestamp'] === newBalance['timestamp']) {
            newBalance['info'] = this.merge (balance['info'], newBalance['info']);
            this.balance[code] = this.merge (balance, newBalance);
        } else {
            this.balance[code] = newBalance;
        }
        client.resolve (this.balance[code], messageHash);
        return message;
    }

    parseWsBalance (response) {
        //
        //    {
        //        currency: 'USDT',
        //        availableBalance: '4.0000000000',
        //        timestamp: '1680557568670'
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
            return client.onPong (message);
        }
        const methods = {
            'received': this.handleOrderBook,
            'open': this.handleOrderBook,
            'done': this.handleOrderBook,
            'level2': this.handleLevel2OrderBook,
            'ticker': this.handleTicker,
            // 'trades': this.handleTrade,
            'match': this.handleTrade,
            'orderChange': this.handleOrder,
            'availableBalance.change': this.handleBalance,
            'orderMargin.change': this.handleBalance,
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
}
