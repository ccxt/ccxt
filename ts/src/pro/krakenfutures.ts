//  ---------------------------------------------------------------------------

import krakenfuturesRest from '../krakenfutures.js';
import { AuthenticationError } from '../base/errors.js';
import { ArrayCache, ArrayCacheBySymbolById } from '../base/ws/Cache.js';
import { Precise } from '../base/Precise.js';
import { sha256 } from '../static_dependencies/noble-hashes/sha256.js';
import { Int } from '../base/types.js';
import Client from '../base/ws/Client.js';

//  ---------------------------------------------------------------------------

export default class krakenfutures extends krakenfuturesRest {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchOHLCV': false,
                'watchOrderBook': true,
                'watchTicker': true,
                'watchTickers': true,
                'watchTrades': true,
                'watchBalance': true,
                // 'watchStatus': true, // https://docs.futures.kraken.com/#websocket-api-public-feeds-heartbeat
                'watchOrders': true,
                'watchMyTrades': true,
            },
            'urls': {
                'api': {
                    'ws': 'wss://futures.kraken.com/ws/v1',
                },
            },
            'options': {
                'tradesLimit': 1000,
                'ordersLimit': 1000,
                'OHLCVLimit': 1000,
                'connectionLimit': 100, // https://docs.futures.kraken.com/#websocket-api-websocket-api-introduction-subscriptions-limits
                'requestLimit': 100, // per second
            },
        });
    }

    async authenticate (params = {}) {
        /**
         * @ignore
         * @method
         * @description authenticates the user to access private web socket channels
         * @see https://docs.futures.kraken.com/#websocket-api-websocket-api-introduction-sign-challenge-challenge
         * @see https://docs.futures.kraken.com/#websocket-api-public-feeds-challenge
         * @returns {object} response from exchange
         */
        this.checkRequiredCredentials ();
        // Hash the challenge with the SHA-256 algorithm
        // Base64-decode your api_secret
        // Use the result of step 2 to hash the result of step 1 with the HMAC-SHA-512 algorithm
        // Base64-encode the result of step 3
        const url = this.urls['api']['ws'];
        const messageHash = 'challenge';
        const client = this.client (url);
        let future = this.safeValue (client.subscriptions, messageHash);
        if (future === undefined) {
            const request = {
                'event': 'challenge',
                'apiKey': this.apiKey,
            };
            const message = this.extend (request, params);
            future = await this.watch (url, messageHash, message);
            client.subscriptions[messageHash] = future;
        }
        return future;
    }

    async subscribePublic (name: string, symbols: string[], params = {}) {
        /**
         * @ignore
         * @method
         * @description Connects to a websocket channel
         * @param {String} name name of the channel
         * @param {[String]} symbols CCXT market symbols
         * @param {Object} params extra parameters specific to the krakenfutures api
         * @returns {Object} data from the websocket stream
         */
        await this.loadMarkets ();
        const url = this.urls['api']['ws'];
        const subscribe = {
            'event': 'subscribe',
            'feed': name,
        };
        const marketIds = [ ];
        let messageHash = name;
        if (symbols.length === 1) {
            const symbol = symbols[0];
            const marketId = this.marketId (symbol);
            marketIds.push (marketId);
            messageHash = messageHash + ':' + marketId;
        }
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            marketIds.push (this.marketId (symbol));
        }
        subscribe['product_ids'] = marketIds;
        const request = this.extend (subscribe, params);
        return await this.watch (url, messageHash, request, name);
    }

    async subscribePrivate (name: string, params = {}) {
        /**
         * @ignore
         * @method
         * @description Connects to a websocket channel
         * @param {String} name name of the channel
         * @param {[String]} symbols CCXT market symbols
         * @param {Object} params extra parameters specific to the krakenfutures api
         * @returns {Object} data from the websocket stream
         */
        await this.loadMarkets ();
        await this.authenticate ();
        const url = this.urls['api']['ws'];
        const subscribe = {
            'event': 'subscribe',
            'feed': name,
            'apiKey': this.apiKey,
            'original_challenge': this.options.challenge,
            'signed_challenge': this.options.signedChallenge,
        };
        const request = this.extend (subscribe, params);
        return await this.watch (url, name, request, name);
    }

    async watchTicker (symbol: string, params = {}) {
        /**
         * @method
         * @name krakenfutures#watchTicker
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @see https://docs.futures.kraken.com/#websocket-api-public-feeds-ticker
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the krakenfutures api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        const name = 'ticker';
        return await this.subscribePublic (name, [ symbol ], params);
    }

    async watchTickers (symbols: string[] = undefined, params = {}) {
        /**
         * @method
         * @name krakenfutures#watchTicker
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @see https://docs.futures.kraken.com/#websocket-api-public-feeds-ticker-lite
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the krakenfutures api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        const name = 'ticker';
        return await this.subscribePublic (name, symbols, params);
    }

    async watchTrades (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name krakenfutures#watchTrades
         * @description get the list of most recent trades for a particular symbol
         * @see https://docs.futures.kraken.com/#websocket-api-public-feeds-trade
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the krakenfutures api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const name = 'trades';
        const trades = await this.subscribePublic (name, [ symbol ], params);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    async watchOrderBook (symbol: string, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name krakenfutures#watchOrderBook
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @see https://docs.futures.kraken.com/#websocket-api-public-feeds-book
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit not used by krakenfutures watchOrderBook
         * @param {object} params extra parameters specific to the krakenfutures api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        let name = this.safeString (this.options.watchOrderBook, 'name', 'book_lv2');
        [ name, params ] = this.handleOptionAndParams (params, 'method', 'name', name);
        const orderbook = await this.subscribePublic (name, [ symbol ], params);
        return orderbook.limit ();
    }

    async watchOrders (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name krakenfutures#watchOrders
         * @description watches information on multiple orders made by the user
         * @see https://docs.futures.kraken.com/#websocket-api-private-feeds-open-orders
         * @see https://docs.futures.kraken.com/#websocket-api-private-feeds-open-orders-verbose
         * @param {string|undefined} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since not used by krakenfutures watchOrders
         * @param {int|undefined} limit not used by krakenfutures watchOrders
         * @param {object} params extra parameters specific to the krakenfutures api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        await this.authenticate ();
        const name = 'orders';
        const orders = await this.subscribePrivate (name, params);
        if (this.newUpdates) {
            limit = orders.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (orders, since, limit, 'timestamp', true);
    }

    async watchMyTrades (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name krakenfutures#watchMyTrades
         * @description watches information on multiple trades made by the user
         * @see https://docs.futures.kraken.com/#websocket-api-private-feeds-fills
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the kucoin api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
         */
        await this.loadMarkets ();
        await this.authenticate ();
        const name = 'orders';
        const orders = await this.subscribePrivate (name, params);
        if (this.newUpdates) {
            limit = orders.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (orders, since, limit, 'timestamp', true);
    }

    async watchBalance (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name krakenfutures#watchOrders
         * @description watches information on multiple orders made by the user
         * @see https://docs.futures.kraken.com/#websocket-api-private-feeds-balances
         * @param {string|undefined} symbol not used by krakenfutures watchBalance
         * @param {int|undefined} since not used by krakenfutures watchBalance
         * @param {int|undefined} limit not used by krakenfutures watchBalance
         * @param {object} params extra parameters specific to the krakenfutures api endpoint
         * @returns {[object]} a list of [balance structures]{@link https://docs.ccxt.com/#/?id=balance-structure}
         */
        await this.loadMarkets ();
        await this.authenticate ();
        const name = 'balances';
        return await this.subscribePrivate (name, params);
    }

    handleTrade (client: Client, message) {
        //
        //    {
        //        channel: 'trades',
        //        data: [
        //            {
        //                symbol: 'BTC_USDT',
        //                amount: '13.41634893',
        //                quantity: '0.000537',
        //                takerSide: 'buy',
        //                createTime: 1676950548834,
        //                price: '24983.89',
        //                id: '62486976',
        //                ts: 1676950548839
        //            }
        //        ]
        //    }
        //
        const data = this.safeValue (message, 'data', []);
        for (let i = 0; i < data.length; i++) {
            const item = data[i];
            const marketId = this.safeString (item, 'symbol');
            if (marketId !== undefined) {
                const trade = this.parseWsTrade (item);
                const symbol = trade['symbol'];
                const type = 'trades';
                const messageHash = type + ':' + marketId;
                let tradesArray = this.safeValue (this.trades, symbol);
                if (tradesArray === undefined) {
                    const tradesLimit = this.safeInteger (this.options, 'tradesLimit', 1000);
                    tradesArray = new ArrayCache (tradesLimit);
                    this.trades[symbol] = tradesArray;
                }
                tradesArray.append (trade);
                client.resolve (tradesArray, messageHash);
            }
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

    handleOrder (client: Client, message) {
        //
        // Order is created
        //
        //    {
        //        channel: 'orders',
        //        data: [
        //            {
        //                "symbol": "BTC_USDT",
        //                "type": "LIMIT",
        //                "quantity": "1",
        //                "orderId": "32471407854219264",
        //                "tradeFee": "0",
        //                "clientOrderId": "",
        //                "accountType": "SPOT",
        //                "feeCurrency": "",
        //                "eventType": "place",
        //                "source": "API",
        //                "side": "BUY",
        //                "filledQuantity": "0",
        //                "filledAmount": "0",
        //                "matchRole": "MAKER",
        //                "state": "NEW",
        //                "tradeTime": 0,
        //                "tradeAmount": "0",
        //                "orderAmount": "0",
        //                "createTime": 1648708186922,
        //                "price": "47112.1",
        //                "tradeQty": "0",
        //                "tradePrice": "0",
        //                "tradeId": "0",
        //                "ts": 1648708187469
        //            }
        //        ]
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

    handleTicker (client: Client, message) {
        //
        //    {
        //        channel: 'ticker',
        //        data: [
        //            {
        //                symbol: 'BTC_USDT',
        //                startTime: 1677280800000,
        //                open: '23154.32',
        //                high: '23212.21',
        //                low: '22761.01',
        //                close: '23148.86',
        //                quantity: '105.179566',
        //                amount: '2423161.17436702',
        //                tradeCount: 17582,
        //                dailyChange: '-0.0002',
        //                markPrice: '23151.09',
        //                closeTime: 1677367197924,
        //                ts: 1677367251090
        //            }
        //        ]
        //    }
        //
        const data = this.safeValue (message, 'data');
        if (data !== undefined) {
            for (let i = 0; i < data.length; i++) {
                const item = data[i];
                const marketId = this.safeString (item, 'symbol');
                if (marketId !== undefined) {
                    const ticker = this.parseTicker (item);
                    const symbol = ticker['symbol'];
                    this.tickers[symbol] = ticker;
                    const messageHash = 'ticker:' + marketId;
                    client.resolve (ticker, messageHash);
                }
            }
            client.resolve (this.tickers, 'ticker');
            return message;
        }
    }

    handleOrderBook (client: Client, message) {
        //
        // snapshot
        //
        //    {
        //        channel: 'book_lv2',
        //        data: [
        //            {
        //                symbol: 'BTC_USDT',
        //                createTime: 1677368876253,
        //                "asks": [
        //                    ["5.65", "0.02"],
        //                    ...
        //                ],
        //                "bids": [
        //                    ["6.16", "0.6"],
        //                    ...
        //                ],
        //                lastId: 164148724,
        //                id: 164148725,
        //                ts: 1677368876316
        //            }
        //        ],
        //        action: 'snapshot'
        //    }
        //
        // update
        //
        //    {
        //        channel: 'book_lv2',
        //        data: [
        //            {
        //                symbol: 'BTC_USDT',
        //                createTime: 1677368876882,
        //                "asks": [
        //                    ["6.35", "3"]
        //                ],
        //                "bids": [
        //                    ["5.65", "0.02"]
        //                ],
        //                lastId: 164148725,
        //                id: 164148726,
        //                ts: 1677368876890
        //            }
        //        ],
        //        action: 'update'
        //    }
        //
        const data = this.safeValue (message, 'data', []);
        const item = this.safeValue (data, 0, {});
        const type = this.safeString (message, 'action');
        const marketId = this.safeString (item, 'symbol');
        const market = this.safeMarket (marketId);
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

    handleBalance (client: Client, message) {
        //
        //    {
        //       "channel": "balances",
        //       "data": [
        //            {
        //                "changeTime": 1657312008411,
        //                "accountId": "1234",
        //                "accountType": "SPOT",
        //                "eventType": "place_order",
        //                "available": "9999999983.668",
        //                "currency": "BTC",
        //                "id": 60018450912695040,
        //                "userId": 12345,
        //                "hold": "16.332",
        //                "ts": 1657312008443
        //            }
        //        ]
        //    }
        //
        const data = this.safeValue (message, 'data', []);
        const messageHash = 'balances';
        this.balance = this.parseWsBalance (data);
        client.resolve (this.balance, messageHash);
    }

    parseWsBalance (response) {
        //
        //    [
        //        {
        //            "changeTime": 1657312008411,
        //            "accountId": "1234",
        //            "accountType": "SPOT",
        //            "eventType": "place_order",
        //            "available": "9999999983.668",
        //            "currency": "BTC",
        //            "id": 60018450912695040,
        //            "userId": 12345,
        //            "hold": "16.332",
        //            "ts": 1657312008443
        //        }
        //    ]
        //
        const firstBalance = this.safeValue (response, 0, {});
        const timestamp = this.safeInteger (firstBalance, 'ts');
        const result = {
            'info': response,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        for (let i = 0; i < response.length; i++) {
            const balance = this.safeValue (response, i);
            const currencyId = this.safeString (balance, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const newAccount = this.account ();
            newAccount['free'] = this.safeString (balance, 'available');
            newAccount['used'] = this.safeString (balance, 'hold');
            result[code] = newAccount;
        }
        return this.safeBalance (result);
    }

    handleMyTrades (client: Client, message) {
        //
        //     {
        //         channel: 'trade_history',
        //         reset: false,
        //         data: [{
        //             id: 'BTC-USDT:8010722',
        //             order_id: '4124999207',
        //             side: 'buy',
        //             fee_amount: '0.0134999868096',
        //             fee_currency_id: 'USDT',
        //             status: 'settled',
        //             price: '23136.7',
        //             quantity: '0.00032416',
        //             cost: '7.499992672',
        //             time: '2022-07-21T17:09:33.056Z',
        //             market_id: 'BTC-USDT'
        //         }]
        //     }
        //
        const rawTrades = this.safeValue (message, 'data', []);
        if (rawTrades.length === 0) {
            return;
        }
        const reset = this.safeValue (message, 'reset', false);
        const messageHash = 'myTrades';
        let stored = this.myTrades;
        if ((stored === undefined) || reset) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            stored = new ArrayCacheBySymbolById (limit);
            this.myTrades = stored;
        }
        const trades = this.parseTrades (rawTrades);
        const tradeSymbols = {};
        for (let j = 0; j < trades.length; j++) {
            const trade = trades[j];
            tradeSymbols[trade['symbol']] = true;
            stored.append (trade);
        }
        const unique = Object.keys (tradeSymbols);
        for (let i = 0; i < unique.length; i++) {
            const symbol = unique[i];
            const symbolSpecificMessageHash = messageHash + ':' + symbol;
            client.resolve (stored, symbolSpecificMessageHash);
        }
        client.resolve (stored, messageHash);
    }

    handleMessage (client: Client, message) {
        const event = this.safeString (message, 'event');
        if (event === 'challenge') {
            this.handleAuthenticate (client, message);
        } else if (event === 'pong') {
            return this.handlePong (client, message);
        } else {
            const feed = this.safeString (message, 'feed');
            const methods = {
                'ticker': this.handleTicker,
                'trade': this.handleTrade,
                'trade_snapshot': this.handleTrade,
                // 'heartbeat': this.handleStatus,
                'ticker_lite': this.handleTicker,
                'book': this.handleOrderBook,
                'book_snapshot': this.handleOrderBook,
                'open_orders_verbose': this.handleOrder,
                'open_orders_verbose_snapshot': this.handleOrder,
                'fills': this.handleMyTrades,
                'fills_snapshot': this.handleMyTrades,
                'open_orders': this.handleOrder,
                'open_orders_snapshot': this.handleOrder,
                'balances': this.handleBalance,
                'balances_snapshot': this.handleBalance,
            };
            const method = this.safeValue (methods, feed);
            return method.call (this, client, message);
        }
    }

    handleAuthenticate (client: Client, message) {
        //
        //    {
        //        "event": "challenge",
        //        "message": "226aee50-88fc-4618-a42a-34f7709570b2"
        //    }
        //
        const event = this.safeValue (message, 'event');
        const messageHash = 'challenge';
        if (event !== 'error') {
            const challenge = this.safeValue (message, 'message');
            const signature = this.hmac (this.encode (challenge), this.encode (this.secret), sha256, 'base64');
            this.options.challenge = challenge;
            this.options.signedChallenge = signature;
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

    ping (client: Client) {
        return {
            'event': 'ping',
        };
    }

    handlePong (client: Client, message) {
        client.lastPong = this.milliseconds ();
        return message;
    }
}
