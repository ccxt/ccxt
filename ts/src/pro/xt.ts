//  ---------------------------------------------------------------------------

import xtRest from '../xt.js';
import { ArrayCache, ArrayCacheBySymbolById, ArrayCacheByTimestamp } from '../base/ws/Cache.js';
import { Precise } from '../base/Precise.js';
import { Int } from '../base/types.js';
import Client from '../base/ws/Client.js';

//  ---------------------------------------------------------------------------

export default class xt extends xtRest {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchOHLCV': true,
                'watchOrderBook': true,
                'watchTicker': true,
                'watchTickers': true,
                'watchTrades': true,
                'watchBalance': true,
                'watchOrders': true,
                'watchMyTrades': true,
            },
            'urls': {
                'api': {
                    'ws': 'wss://stream.xt.com',
                },
            },
            'options': {
                'tradesLimit': 1000,
                'ordersLimit': 1000,
                'OHLCVLimit': 1000,
            },
            'streaming': {
                'keepAlive': 30000,
            },
            'accessToken': undefined,
        });
    }

    async getAccessToken (params = {}) {
        /**
         * @ignore
         * @method
         * @description required for private endpoints
         * @see https://doc.xt.com/#websocket_privategetToken
         * @returns {string} accessToken
         */
        this.checkRequiredCredentials ();
        const url = this.urls['api']['ws'] + '/private';
        const client = this.client (url);
        const accessToken = this.safeValue (client.subscriptions, 'accessToken');
        if (accessToken === undefined) {
            const response = await this.privateSpotPostWsToken (params);
            //
            //    {
            //        "rc": 0,
            //        "mc": "SUCCESS",
            //        "ma": [],
            //        "result": {
            //            "accessToken": "eyJhbqGciOiJSUzI1NiJ9.eyJhY2NvdW50SWQiOiIyMTQ2Mjg1MzIyNTU5Iiwic3ViIjoibGh4dDRfMDAwMUBzbmFwbWFpbC5jYyIsInNjb3BlIjoiYXV0aCIsImlzcyI6Inh0LmNvbSIsImxhc3RBdXRoVGltZSI6MTY2MzgxMzY5MDk1NSwic2lnblR5cGUiOiJBSyIsInVzZXJOYW1lIjoibGh4dDRfMDAwMUBzbmFwbWFpbC5jYyIsImV4cCI6MTY2NjQwNTY5MCwiZGV2aWNlIjoidW5rbm93biIsInVzZXJJZCI6MjE0NjI4NTMyMjU1OX0.h3zJlJBQrK2x1HvUxsKivnn6PlSrSDXXXJ7WqHAYSrN2CG5XPTKc4zKnTVoYFbg6fTS0u1fT8wH7wXqcLWXX71vm0YuP8PCvdPAkUIq4-HyzltbPr5uDYd0UByx0FPQtq1exvsQGe7evXQuDXx3SEJXxEqUbq_DNlXPTq_JyScI",
            //            "refreshToken": "eyJhbGciOiqJSUzI1NiJ9.eyJhY2NvdW50SWQiOiIyMTQ2Mjg1MzIyNTU5Iiwic3ViIjoibGh4dDRfMDAwMUBzbmFwbWFpbC5jYyIsInNjb3BlIjoicmVmcmVzaCIsImlzcyI6Inh0LmNvbSIsImxhc3RBdXRoVGltZSI6MTY2MzgxMzY5MDk1NSwic2lnblR5cGUiOiJBSyIsInVzZXJOYW1lIjoibGh4dDRfMDAwMUBzbmFwbWFpbC5jYyIsImV4cCI6MTY2NjQwNTY5MCwiZGV2aWNlIjoidW5rbm93biIsInVzZXJJZCI6MjE0NjI4NTMyMjU1OX0.Fs3YVm5YrEOzzYOSQYETSmt9iwxUHBovh2u73liv1hLUec683WGfktA_s28gMk4NCpZKFeQWFii623FvdfNoteXR0v1yZ2519uNvNndtuZICDdv3BQ4wzW1wIHZa1skxFfqvsDnGdXpjqu9UFSbtHwxprxeYfnxChNk4ssei430"
            //        }
            //    }
            //
            const result = this.safeValue (response, 'result');
            client.subscriptions['accessToken'] = this.safeString (result, 'accessToken');
        }
        return client.subscriptions['accessToken'];
    }

    async subscribe (name: string, access: string, symbol: string = undefined, params = {}) {
        /**
         * @ignore
         * @method
         * @description Connects to a websocket channel
         * @see https://doc.xt.com/#websocket_privaterequestFormat
         * @param {String} name name of the channel
         * @param {String} access public or private
         * @param {String|undefined} symbol CCXT market symbol
         * @param {Object} params extra parameters specific to the xt api
         * @returns {Object} data from the websocket stream
         */
        await this.loadMarkets ();
        const url = this.urls['api']['ws'] + '/' + access;
        const subscribe = {
            'method': 'subscribe',
            'params': [
                name,
            ],
            'id': this.milliseconds () + name,  // call back ID
        };
        if (access === 'private') {
            subscribe['listenKey'] = await this.getAccessToken ();
        }
        const messageHash = name;
        const request = this.extend (subscribe, params);
        return await this.watch (url, messageHash, request, messageHash);
    }

    async watchTicker (symbol: string, params = {}) {
        /**
         * @method
         * @name xt#watchTicker
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @see https://doc.xt.com/#websocket_publictickerRealTime
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the xt api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        const market = this.market (symbol);
        const name = 'ticker@' + market['id'];
        return await this.subscribe (name, 'public', symbol, params);
    }

    async watchTickers (symbols: string[] = undefined, params = {}) {
        /**
         * @method
         * @name xt#watchTicker
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @see https://doc.xt.com/#websocket_publicallTicker
         * @param {string} symbol not used by xt watchTickers
         * @param {object} params extra parameters specific to the xt api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        const name = 'tickers';
        return await this.subscribe (name, 'public', undefined, params);
    }

    async watchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name hitbtc#watchOHLCV
         * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @see https://doc.xt.com/#websocket_publicsymbolKline
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe 1m, 3m, 5m, 15m, 30m, 1h, 2h, 4h, 6h, 8h, 12h, 1d, 3d, 1w, or 1M
         * @param {int|undefined} since not used by xt watchOHLCV
         * @param {int|undefined} limit not used by xt watchOHLCV
         * @param {object} params extra parameters specific to the xt api endpoint
         * @returns {[[int]]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        const market = this.market (symbol);
        const name = 'kline@' + market['id'] + ',' + timeframe;
        return await this.subscribe (name, 'public', symbol, params);
    }

    async watchTrades (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name xt#watchTrades
         * @description get the list of most recent trades for a particular symbol
         * @see https://doc.xt.com/#websocket_publicdealRecord
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the xt api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const name = 'trade@' + market['id'];
        const trades = await this.subscribe (name, 'public', symbol, params);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp');
    }

    async watchOrderBook (symbol: string, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name xt#watchOrderBook
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @see https://doc.xt.com/#websocket_publiclimitDepth
         * @see https://doc.xt.com/#websocket_publicincreDepth
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit not used by xt watchOrderBook
         * @param {object} params extra parameters specific to the xt api endpoint
         * @param {int|undefined} params.levels 5, 10, 20, or 50
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        const market = this.market (symbol);
        const levels = this.safeString (params, 'levels');
        params = this.omit (params, 'levels');
        let name = 'depth_update@' + market['id'];
        if (levels !== undefined) {
            name = 'depth@' + market['id'] + ',' + levels;
        }
        const orderbook = await this.subscribe (name, 'public', symbol, params);
        return orderbook.limit ();
    }

    async watchOrders (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name xt#watchOrders
         * @description watches information on multiple orders made by the user
         * @see https://doc.xt.com/#websocket_privateorderChange
         * @param {string|undefined} symbol not used by xt watchOrders
         * @param {int|undefined} since not used by xt watchOrders
         * @param {int|undefined} limit the maximum number of orders to return
         * @param {object} params extra parameters specific to the xt api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const name = 'open_orders';
        const orders = await this.subscribe (name, 'private', undefined, params);
        if (this.newUpdates) {
            limit = orders.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (orders, since, limit, 'timestamp');
    }

    async watchMyTrades (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name xt#watchMyTrades
         * @description watches information on multiple trades made by the user
         * @see https://doc.xt.com/#websocket_privateorderDeal
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the kucoin api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
         */
        await this.loadMarkets ();
        const name = 'trade';
        const trades = await this.subscribe (name, 'private', undefined, params);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp');
    }

    async watchBalance (params = {}) {
        /**
         * @method
         * @name xt#watchOrders
         * @description watches information on multiple orders made by the user
         * @see https://doc.xt.com/#websocket_privatebalanceChange
         * @param {object} params extra parameters specific to the xt api endpoint
         * @returns {[object]} a list of [balance structures]{@link https://docs.ccxt.com/#/?id=balance-structure}
         */
        await this.loadMarkets ();
        const name = 'balance';
        return await this.subscribe (name, 'private', undefined, params);
    }

    handleTicker (client: Client, message) {
        //
        //    {
        //        topic: 'ticker',
        //        event: 'ticker@btc_usdt',
        //        data: {
        //           s: 'btc_usdt',            // symbol
        //           t: 1683501935877,         // time(Last transaction time)
        //           cv: '-82.67',             // priceChangeValue(24 hour price change)
        //           cr: '-0.0028',            // priceChangeRate 24-hour price change (percentage)
        //           o: '28823.87',            // open price
        //           c: '28741.20',            // close price
        //           h: '29137.64',            // highest price
        //           l: '28660.93',            // lowest price
        //           q: '6372.601573',         // quantity
        //           v: '184086075.2772391'    // volume
        //        }
        //    }
        //
        const data = this.safeValue (message, 'data');
        const marketId = this.safeString (data, 's');
        if (marketId !== undefined) {
            const ticker = this.parseTicker (data);
            const symbol = ticker['symbol'];
            this.tickers[symbol] = ticker;
            const messageHash = this.safeString (message, 'event');
            client.resolve (ticker, messageHash);
        }
        return message;
    }

    handleTickers (client: Client, message) {
        //
        //    {
        //        topic: 'tickers',
        //        event: 'tickers',
        //        data: [
        //            {
        //                s: 'elon_usdt',
        //                t: 1683502958381,
        //                cv: '-0.0000000125',
        //                cr: '-0.0495',
        //                o: '0.0000002522',
        //                c: '0.0000002397',
        //                h: '0.0000002690',
        //                l: '0.0000002371',
        //                q: '3803783034.0000000000',
        //                v: '955.3260820022'
        //            },
        //            ...
        //        ]
        //    }
        //
        const data = this.safeValue (message, 'data', []);
        for (let i = 0; i < data.length; i++) {
            const tickerData = data[i];
            const ticker = this.parseTicker (tickerData);
            const symbol = ticker['symbol'];
            this.tickers[symbol] = ticker;
        }
        client.resolve (this.tickers, 'tickers');
        return message;
    }

    handleOHLCV (client: Client, message) {
        //
        //    {
        //        "topic": "kline",
        //        "event": "kline@btc_usdt,5m",
        //        "data": {
        //            "s": "btc_usdt",        // symbol
        //            "t": 1656043200000,     // time
        //            "i": "5m",              // interval
        //            "o": "44000",           // open price
        //            "c": "50000",           // close price
        //            "h": "52000",           // highest price
        //            "l": "36000",           // lowest price
        //            "q": "34.2",            // qty(quantity)
        //            "v": "230000"           // volume
        //        }
        //    }
        //
        const data = this.safeValue (message, 'data', {});
        const messageHash = this.safeString (message, 'event');
        const timeframe = this.safeString (data, 'i');
        const marketId = this.safeString (data, 's');
        if (marketId !== undefined) {
            const market = this.market (marketId);
            const symbol = market['symbol'];
            const parsed = this.parseOHLCV (data, market);
            this.ohlcvs[symbol] = this.safeValue (this.ohlcvs, symbol, {});
            let stored = this.safeValue (this.ohlcvs[symbol], timeframe);
            if (stored === undefined) {
                const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
                stored = new ArrayCacheByTimestamp (limit);
                this.ohlcvs[symbol][timeframe] = stored;
            }
            stored.append (parsed);
            client.resolve (stored, messageHash);
        }
        return message;
    }

    handleTrade (client: Client, message) {
        // TODO
        //
        //    {
        //        "topic": "trade",
        //        "event": "trade@btc_usdt",
        //        "data": {
        //            "s": "btc_usdt",          // symbol
        //            "i": 6316559590087222000, // trade id
        //            "t": 1655992403617,       // trade time
        //            "p": "43000",             // trade price
        //            "q": "0.21",              // qty，trade quantity
        //            "b": true                 // whether is buyerMaker or not
        //        }
        //    }
        //
        const channel = this.safeString (message, 'feed');
        const marketId = this.safeStringLower (message, 'product_id');
        if (marketId !== undefined) {
            const market = this.market (marketId);
            const symbol = market['symbol'];
            const messageHash = 'trade:' + symbol;
            let tradesArray = this.safeValue (this.trades, symbol);
            if (tradesArray === undefined) {
                const tradesLimit = this.safeInteger (this.options, 'tradesLimit', 1000);
                tradesArray = new ArrayCache (tradesLimit);
                this.trades[symbol] = tradesArray;
            }
            if (channel === 'trade_snapshot') {
                const trades = this.safeValue (message, 'trades', []);
                for (let i = 0; i < trades.length; i++) {
                    const item = trades[i];
                    const trade = this.parseTrade (item);
                    tradesArray.append (trade);
                }
            } else {
                const trade = this.parseTrade (message);
                tradesArray.append (trade);
            }
            client.resolve (tradesArray, messageHash);
        }
        return message;
    }

    handleOrderBook (client: Client, message) {
        //
        //    {
        //        "topic": "depth",
        //        "event": "depth@btc_usdt,20",
        //        "data": {
        //            "s": "btc_usdt",        // symbol
        //            "fi": 1681433733351,
        //            "i": 1681433733371,
        //            "a": [                  // asks(sell order)
        //                [                   // [0]price, [1]quantity
        //                    "34000",        // price
        //                    "1.2"           // quantity
        //                ],
        //                [
        //                    "34001",
        //                    "2.3"
        //                ]
        //            ],
        //            "b": [                   // bids(buy order)
        //                [
        //                    "32000",
        //                    "0.2"
        //                ],
        //                [
        //                    "31000",
        //                    "0.5"
        //                ]
        //            ]
        //        }
        //    }
        //
        const data = this.safeValue (message, 'data');
        const marketId = this.safeString (data, 's');
        const messageHash = this.safeString (message, 'event');
        if (marketId !== undefined) {
            const market = this.market (marketId);
            const symbol = market['id'];
            const asks = this.safeValue (data, 'a');
            const bids = this.safeValue (data, 'b');
            let orderbook = this.safeValue (this.orderbooks, symbol);
            if (orderbook === undefined) {
                const subscription = this.safeValue (client.subscriptions, messageHash, {});
                const limit = this.safeInteger (subscription, 'limit');
                this.orderbooks[symbol] = this.orderBook ({}, limit);
                orderbook = this.orderbooks[symbol];
            }
            if (asks !== undefined) {
                for (let i = 0; i < asks.length; i++) {
                    const ask = asks[i];
                    const price = this.safeNumber (ask, 0);
                    const quantity = this.safeNumber (ask, 1);
                    orderbook['asks'].store (price, quantity);
                }
            }
            if (bids !== undefined) {
                for (let i = 0; i < bids.length; i++) {
                    const bid = bids[i];
                    const price = this.safeNumber (bid, 0);
                    const quantity = this.safeNumber (bid, 1);
                    orderbook['bids'].store (price, quantity);
                }
            }
            client.resolve (orderbook, messageHash);
        }
    }

    handleOrder (client: Client, message) {
        // TODO
        //    {
        //        "topic": "order",
        //        "event": "order",
        //        "data": {
        //            "s": "btc_usdt",                // symbol
        //            "t": 1656043204763,             // time happened time
        //            "i": "6216559590087220004",     // orderId,
        //            "ci": "test123",                // clientOrderId
        //            "st": "PARTIALLY_FILLED",       // state
        //            "sd": "BUY",                    // side BUY/SELL
        //            "eq": "2",                      // executedQty executed quantity
        //            "ap": "30000",                  // avg price
        //            "f": "0.002"                    // fee
        //        }
        //    }
        //
        let orders = this.orders;
        if (orders === undefined) {
            const limit = this.safeInteger (this.options, 'ordersLimit');
            orders = new ArrayCacheBySymbolById (limit);
            this.orders = orders;
        }
        const order = this.safeValue (message, 'order');
        if (order !== undefined) {
            const marketId = this.safeStringLower (order, 'instrument');
            const messageHash = 'orders';
            const symbol = this.safeSymbol (marketId);
            const orderId = this.safeString (order, 'order_id');
            const previousOrders = this.safeValue (orders.hashmap, symbol, {});
            const previousOrder = this.safeValue (previousOrders, orderId);
            if (previousOrder === undefined) {
                const parsed = this.parseOrder (order);
                orders.append (parsed);
                client.resolve (orders, messageHash);
                client.resolve (orders, messageHash + ':' + symbol);
            } else {
                const trade = this.parseTrade (order);
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
                    totalCost = Precise.stringAdd (totalCost, this.numberToString (trade['cost']));
                    totalAmount = Precise.stringAdd (totalAmount, this.numberToString (trade['amount']));
                }
                if (Precise.stringGt (totalAmount, '0')) {
                    previousOrder['average'] = Precise.stringDiv (totalCost, totalAmount);
                }
                previousOrder['cost'] = totalCost;
                if (previousOrder['filled'] !== undefined) {
                    previousOrder['filled'] = Precise.stringAdd (previousOrder['filled'], this.numberToString (trade['amount']));
                    if (previousOrder['amount'] !== undefined) {
                        previousOrder['remaining'] = Precise.stringSub (previousOrder['amount'], previousOrder['filled']);
                    }
                }
                if (previousOrder['fee'] === undefined) {
                    previousOrder['fee'] = {
                        'rate': undefined,
                        'cost': '0',
                        'currency': this.numberToString (trade['fee']['currency']),
                    };
                }
                if ((previousOrder['fee']['cost'] !== undefined) && (trade['fee']['cost'] !== undefined)) {
                    const stringOrderCost = this.numberToString (previousOrder['fee']['cost']);
                    const stringTradeCost = this.numberToString (trade['fee']['cost']);
                    previousOrder['fee']['cost'] = Precise.stringAdd (stringOrderCost, stringTradeCost);
                }
                // update the newUpdates count
                orders.append (this.safeOrder (previousOrder));
                client.resolve (orders, messageHash + ':' + symbol);
                client.resolve (orders, messageHash);
            }
        } else {
            const isCancel = this.safeValue (message, 'is_cancel');
            if (isCancel) {
                // get order without symbol
                for (let i = 0; i < orders.length; i++) {
                    const order = orders[i];
                    if (order['id'] === message['order_id']) {
                        orders[i] = this.extend (order, {
                            'status': 'canceled',
                        });
                        client.resolve (orders, 'orders');
                        client.resolve (orders, 'orders:' + order['symbol']);
                        break;
                    }
                }
            }
        }
        return message;
    }

    handleBalance (client: Client, message) {
        //
        //    {
        //        topic: 'balance',
        //        event: 'balance',
        //        data: {
        //            a: 3513677381884,
        //            t: 1684250056775,
        //            c: 'usdt',
        //            b: '7.71000000',
        //            f: '0.00000000',
        //            z: 'SPOT'
        //        }
        //    }
        //
        const data = this.safeValue (message, 'data', {});
        const currencyId = this.safeString (data, 'c');
        const code = this.safeCurrencyCode (currencyId);
        const account = this.account ();
        const free = this.safeString (data, 'b');
        const used = this.safeString (data, 'f');
        account['free'] = free;
        account['used'] = used;
        this.balance[code] = account;
        this.balance = this.safeBalance (this.balance);
        client.resolve (this.balance, 'balance');
    }

    handleMyTrades (client: Client, message) {
        //
        //    {
        //        "topic": "trade",
        //        "event": "trade",
        //        "data": {
        //            "s": "btc_usdt",                // symbol
        //            "t": 1656043204763,             // time
        //            "i": "6316559590087251233",     // tradeId
        //            "oi": "6216559590087220004",    // orderId
        //            "p": "30000",                   // trade price
        //            "q": "3",                       // qty quantity
        //            "v": "90000"                    // volume trade amount
        //        }
        //    }
        //
        const data = this.safeValue (message, 'data', {});
        let stored = this.myTrades;
        if (stored === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            stored = new ArrayCacheBySymbolById (limit);
            this.myTrades = stored;
        }
        const parsedTrade = this.parseTrade (data);
        stored.append (parsedTrade);
        client.resolve (stored, 'trade');
    }

    handleMessage (client, message) {
        const event = this.safeString (message, 'event');
        if (event === 'pong') {
            return client.onPong (message);
        } else if (event !== undefined) {
            const topic = this.safeString (message, 'topic');
            const methods = {
                'trade': this.handleMyTrades,
                'kline': this.handleOHLCV,
                'depth': this.handleOrderBook,
                'depth_update': this.handleOrderBook,
                'ticker': this.handleTicker,
                'tickers': this.handleTickers,
                'balance': this.handleBalance,
                'order': this.handleOrder,
            };
            const splitEvent = event.split ('@');
            let method = this.safeValue (methods, topic);
            if ((splitEvent.length > 1) && (topic === 'trade')) {
                method = this.handleTrade;
            }
            if (method !== undefined) {
                return method.call (this, client, message);
            }
        }
    }
}
