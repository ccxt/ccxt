//  ---------------------------------------------------------------------------

import xtRest from '../xt.js';
import { ArrayCache, ArrayCacheBySymbolById, ArrayCacheByTimestamp } from '../base/ws/Cache.js';
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
                'watchPositions': undefined, // TODO https://doc.xt.com/#futures_user_websocket_v2position
            },
            'urls': {
                'api': {
                    'ws': {
                        'spot': 'wss://stream.xt.com',
                        'contract': 'wss://fstream.xt.com/ws',
                    },
                },
            },
            'options': {
                'tradesLimit': 1000,
                'ordersLimit': 1000,
                'OHLCVLimit': 1000,
                'watchTicker': {
                    'method': 'ticker',  // agg_ticker (contract only)
                },
                'watchTickers': {
                    'method': 'tickers',  // agg_tickers (contract only)
                },
            },
            'streaming': {
                'keepAlive': 20000,
                'ping': this.ping,
            },
            'accessToken': undefined,
        });
    }

    async getListenKey (isContract: boolean) {
        /**
         * @ignore
         * @method
         * @description required for private endpoints
         * @param {string} isContract true for contract trades
         * @see https://doc.xt.com/#websocket_privategetToken
         * @see https://doc.xt.com/#futures_user_websocket_v2base
         * @returns {string} listen key / access token
         */
        this.checkRequiredCredentials ();
        const tradeType = isContract ? 'contract' : 'spot';
        let url = this.urls['api']['ws'][tradeType];
        if (!isContract) {
            url = url + '/private';
        }
        const client = this.client (url);
        const accessToken = this.safeValue (client.subscriptions, 'accessToken');
        if (accessToken === undefined) {
            if (isContract) {
                const response = await this.privateLinearGetFutureUserV1UserListenKey ();
                //
                //    {
                //        returnCode: '0',
                //        msgInfo: 'success',
                //        error: null,
                //        result: '3BC1D71D6CF96DA3458FC35B05B633351684511731128'
                //    }
                //
                client.subscriptions['accessToken'] = this.safeValue (response, 'result');
            } else {
                const response = await this.privateSpotPostWsToken ();
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
        }
        return client.subscriptions['accessToken'];
    }

    async subscribe (name: string, access: string, methodName: string, market: object = undefined, params = {}) {
        /**
         * @ignore
         * @method
         * @description Connects to a websocket channel
         * @see https://doc.xt.com/#websocket_privaterequestFormat
         * @see https://doc.xt.com/#futures_market_websocket_v2base
         * @param {string} name name of the channel
         * @param {string} access public or private
         * @param {string} methodName the name of the CCXT class method
         * @param {object|undefined} market CCXT market
         * @param {object} params extra parameters specific to the xt api
         * @returns {object} data from the websocket stream
         */
        await this.loadMarkets ();
        const privateAccess = access === 'private';
        let type = undefined;
        [ type, params ] = this.handleMarketTypeAndParams (methodName, market, params);
        const isContract = (type !== 'spot');
        const subscribe = {
            'method': isContract ? 'SUBSCRIBE' : 'subscribe',
            'id': this.numberToString (this.milliseconds ()) + name,  // call back ID
        };
        if (privateAccess) {
            if (!isContract) {
                subscribe['params'] = [ name ];
                subscribe['listenKey'] = await this.getListenKey (isContract);
            } else {
                const listenKey = await this.getListenKey (isContract);
                const param = name + '@' + listenKey;
                subscribe['params'] = [ param ];
            }
        } else {
            subscribe['params'] = [ name ];
        }
        const tradeType = isContract ? 'contract' : 'spot';
        const messageHash = name + ':' + tradeType;
        const request = this.extend (subscribe, params);
        let tail = access;
        if (isContract) {
            tail = privateAccess ? 'user' : 'market';
        }
        const url = this.urls['api']['ws'][tradeType] + '/' + tail;
        return await this.watch (url, messageHash, request, messageHash);
    }

    async watchTicker (symbol: string, params = {}) {
        /**
         * @method
         * @name xt#watchTicker
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @see https://doc.xt.com/#websocket_publictickerRealTime
         * @see https://doc.xt.com/#futures_market_websocket_v2tickerRealTime
         * @see https://doc.xt.com/#futures_market_websocket_v2aggTickerRealTime
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the xt api endpoint
         * @param {string} params.method 'agg_ticker' (contract only) or 'ticker', default = 'ticker' - the endpoint that will be streamed
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        const market = this.market (symbol);
        const options = this.safeValue (this.options, 'watchTicker');
        const defaultMethod = this.safeString (options, 'method', 'ticker');
        const method = this.safeString (params, 'method', defaultMethod);
        const name = method + '@' + market['id'];
        return await this.subscribe (name, 'public', 'watchTicker', market, params);
    }

    async watchTickers (symbols: string[] = undefined, params = {}) {
        /**
         * @method
         * @name xt#watchTicker
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @see https://doc.xt.com/#websocket_publicallTicker
         * @see https://doc.xt.com/#futures_market_websocket_v2allTicker
         * @see https://doc.xt.com/#futures_market_websocket_v2allAggTicker
         * @param {string} symbol not used by xt watchTickers
         * @param {object} params extra parameters specific to the xt api endpoint
         * @param {string} params.method 'agg_tickers' (contract only) or 'tickers', default = 'tickers' - the endpoint that will be streamed
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        const options = this.safeValue (this.options, 'watchTickers');
        const defaultMethod = this.safeString (options, 'method', 'tickers');
        const name = this.safeString (params, 'method', defaultMethod);
        return await this.subscribe (name, 'public', 'watchTickers', undefined, params);
    }

    async watchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name hitbtc#watchOHLCV
         * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @see https://doc.xt.com/#websocket_publicsymbolKline
         * @see https://doc.xt.com/#futures_market_websocket_v2symbolKline
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe 1m, 3m, 5m, 15m, 30m, 1h, 2h, 4h, 6h, 8h, 12h, 1d, 3d, 1w, or 1M
         * @param {int|undefined} since not used by xt watchOHLCV
         * @param {int|undefined} limit not used by xt watchOHLCV
         * @param {object} params extra parameters specific to the xt api endpoint
         * @returns {[[int]]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        const market = this.market (symbol);
        const name = 'kline@' + market['id'] + ',' + timeframe;
        return await this.subscribe (name, 'public', 'watchOHLCV', market, params);
    }

    async watchTrades (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name xt#watchTrades
         * @description get the list of most recent trades for a particular symbol
         * @see https://doc.xt.com/#websocket_publicdealRecord
         * @see https://doc.xt.com/#futures_market_websocket_v2dealRecord
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the xt api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const name = 'trade@' + market['id'];
        const trades = await this.subscribe (name, 'public', 'watchTrades', market, params);
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
         * @see https://doc.xt.com/#futures_market_websocket_v2limitDepth
         * @see https://doc.xt.com/#futures_market_websocket_v2increDepth
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
        const orderbook = await this.subscribe (name, 'public', 'watchOrderBook', market, params);
        return orderbook.limit ();
    }

    async watchOrders (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name xt#watchOrders
         * @description watches information on multiple orders made by the user
         * @see https://doc.xt.com/#websocket_privateorderChange
         * @see https://doc.xt.com/#futures_user_websocket_v2order
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since not used by xt watchOrders
         * @param {int|undefined} limit the maximum number of orders to return
         * @param {object} params extra parameters specific to the xt api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const name = 'order';
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const orders = await this.subscribe (name, 'private', 'watchOrders', market, params);
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
         * @see https://doc.xt.com/#futures_user_websocket_v2trade
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the kucoin api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
         */
        await this.loadMarkets ();
        const name = 'trade';
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const trades = await this.subscribe (name, 'private', 'watchMyTrades', market, params);
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
         * @see https://doc.xt.com/#futures_user_websocket_v2balance
         * @param {object} params extra parameters specific to the xt api endpoint
         * @returns {[object]} a list of [balance structures]{@link https://docs.ccxt.com/#/?id=balance-structure}
         */
        await this.loadMarkets ();
        const name = 'balance';
        return await this.subscribe (name, 'private', 'watchBalance', undefined, params);
    }

    handleTicker (client: Client, message) {
        //
        // spot
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
        // contract
        //
        //    {
        //        "topic": "ticker",
        //        "event": "ticker@btc_usdt",
        //        "data": {
        //            "s": "btc_index",  // trading pair
        //            "o": "49000",      // opening price
        //            "c": "50000",      // closing price
        //            "h": "0.1",        // highest price
        //            "l": "0.1",        // lowest price
        //            "a": "0.1",        // volume
        //            "v": "0.1",        // turnover
        //            "ch": "0.21",      // quote change
        //            "t": 123124124     // timestamp
        //       }
        //    }
        //
        // agg_ticker (contract)
        //
        //    {
        //        "topic": "agg_ticker",
        //        "event": "agg_ticker@btc_usdt",
        //        "data": {
        //            "s": "btc_index",          // trading pair
        //            "o": "49000",              // opening price
        //            "c": "50000",              // closing price
        //            "h": "0.1",                // highest price
        //            "l": "0.1",                // lowest price
        //            "a": "0.1",                // volume
        //            "v": "0.1",                // turnover
        //            "ch": "0.21",              // quote change
        //            "i": "0.21" ,              // index price
        //            "m": "0.21",               // mark price
        //            "bp": "0.21",              // bid price
        //            "ap": "0.21" ,             // ask price
        //            "t": 123124124             // timestamp
        //       }
        //    }
        //
        const data = this.safeValue (message, 'data');
        const marketId = this.safeString (data, 's');
        if (marketId !== undefined) {
            const ticker = this.parseTicker (data);
            const symbol = ticker['symbol'];
            this.tickers[symbol] = ticker;
            const event = this.safeString (message, 'event');
            const market = this.market (symbol);
            const messageHashTail = market['contract'] ? 'contract' : 'spot';
            const messageHash = event + ':' + messageHashTail;
            client.resolve (ticker, messageHash);
        }
        return message;
    }

    handleTickers (client: Client, message) {
        //
        // spot
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
        // contract
        //
        //    {
        //        "topic": "tickers",
        //        "event": "tickers",
        //        "data": [
        //            {
        //                "s": "btc_index",  // trading pair
        //                "o": "49000",      // opening price
        //                "c": "50000",      // closing price
        //                "h": "0.1",        // highest price
        //                "l": "0.1",        // lowest price
        //                "a": "0.1",        // volume
        //                "v": "0.1",        // turnover
        //                "ch": "0.21",      // quote change
        //                "t": 123124124     // timestamp
        //            }
        //        ]
        //    }
        //
        // agg_ticker (contract)
        //
        //    {
        //        "topic": "agg_tickers",
        //        "event": "agg_tickers",
        //        "data": [
        //            {
        //                "s": "btc_index",          // trading pair
        //                "o": "49000",              // opening price
        //                "c": "50000",              // closing price
        //                "h": "0.1",                // highest price
        //                "l": "0.1",                // lowest price
        //                "a": "0.1",                // volume
        //                "v": "0.1",                // turnover
        //                "ch": "0.21",              // quote change
        //                "i": "0.21" ,              // index price
        //                "m": "0.21",               // mark price
        //                "bp": "0.21",              // bid price
        //                "ap": "0.21" ,             // ask price
        //                "t": 123124124             // timestamp
        //            }
        //        ]
        //    }
        //
        const data = this.safeValue (message, 'data', []);
        const firstTicker = this.safeValue (data, 0);
        const spotTest = this.safeString2 (firstTicker, 'cv', 'aq');
        const tradeType = (spotTest !== undefined) ? 'spot' : 'contract';
        for (let i = 0; i < data.length; i++) {
            const tickerData = data[i];
            const ticker = this.parseTicker (tickerData);
            const symbol = ticker['symbol'];
            this.tickers[symbol] = ticker;
        }
        client.resolve (this.tickers, 'tickers:' + tradeType);
        return message;
    }

    handleOHLCV (client: Client, message) {
        //
        // spot
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
        // contract
        //
        //    {
        //        "topic": "kline",
        //        "event": "kline@btc_usdt,5m",
        //        "data": {
        //            "s": "btc_index",      // trading pair
        //            "o": "49000",          // opening price
        //            "c": "50000",          // closing price
        //            "h": "0.1",            // highest price
        //            "l": "0.1",            // lowest price
        //            "a": "0.1",            // volume
        //            "v": "0.1",            // turnover
        //            "ch": "0.21",          // quote change
        //            "t": 123124124         // timestamp
        //        }
        //    }
        //
        const data = this.safeValue (message, 'data', {});
        const marketId = this.safeString (data, 's');
        if (marketId !== undefined) {
            const timeframe = this.safeString (data, 'i');
            const tradeType = ('q' in data) ? 'spot' : 'contract';
            const market = this.safeMarket (marketId, undefined, undefined, tradeType);
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
            const event = this.safeString (message, 'event');
            const messageHash = event + ':' + tradeType;
            client.resolve (stored, messageHash);
        }
        return message;
    }

    handleTrade (client: Client, message) {
        //
        // spot
        //
        //    {
        //        topic: 'trade',
        //        event: 'trade@btc_usdt',
        //        data: {
        //            s: 'btc_usdt',
        //            i: '228825383103928709',
        //            t: 1684258222702,
        //            p: '27003.65',
        //            q: '0.000796',
        //            b: true
        //        }
        //    }
        //
        // contract
        //
        //    {
        //        "topic": "trade",
        //        "event": "trade@btc_usdt",
        //        "data": {
        //            "s": "btc_index",  // trading pair
        //            "p": "50000",      // price
        //            "a": "0.1"         // Quantity
        //            "m": "BID"         // Deal side  BID:Buy ASK:Sell
        //            "t": 123124124     // timestamp
        //        }
        //    }
        //
        const data = this.safeValue (message, 'data');
        const marketId = this.safeStringLower (data, 's');
        if (marketId !== undefined) {
            const trade = this.parseTrade (data);
            const market = this.market (trade['symbol']);
            const tradeType = market['contract'] ? 'contract' : 'spot';
            const symbol = market['symbol'];
            const event = this.safeString (message, 'event');
            let tradesArray = this.safeValue (this.trades, symbol);
            if (tradesArray === undefined) {
                const tradesLimit = this.safeInteger (this.options, 'tradesLimit', 1000);
                tradesArray = new ArrayCache (tradesLimit);
                this.trades[symbol] = tradesArray;
            }
            tradesArray.append (trade);
            const messageHash = event + ':' + tradeType;
            client.resolve (tradesArray, messageHash);
        }
        return message;
    }

    handleOrderBook (client: Client, message) {
        //
        // spot
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
        // contract
        //
        //    {
        //        "topic": "depth",
        //        "event": "depth@btc_usdt,20",
        //        "data": {
        //            s: "btc_usdt",
        //            pu: "548111455664",
        //            fu: "548111455665",
        //            u: "548111455667",
        //            a: [
        //                [
        //                    "26841.5",
        //                    "50210",
        //                ],
        //            ],
        //            b: [
        //                [
        //                    "26841",
        //                    "67075",
        //                ],
        //            ],
        //            t: 1684530667083,
        //        }
        //    }
        //
        const data = this.safeValue (message, 'data');
        const marketId = this.safeString (data, 's');
        if (marketId !== undefined) {
            let event = this.safeString (message, 'event');
            const splitEvent = event.split (',');
            event = this.safeString (splitEvent, 0);
            const tradeType = ('fu' in data) ? 'contract' : 'spot';
            const market = this.safeMarket (marketId, undefined, undefined, tradeType);
            const symbol = market['symbol'];
            const asks = this.safeValue (data, 'a');
            const bids = this.safeValue (data, 'b');
            let orderbook = this.safeValue (this.orderbooks, symbol);
            const messageHash = event + ':' + tradeType;
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

    parseWsOrderTrade (trade, market = undefined) {
        //
        //    {
        //        "s": "btc_usdt",                         // symbol
        //        "t": 1656043204763,                      // time happened time
        //        "i": "6216559590087220004",              // orderId,
        //        "ci": "test123",                         // clientOrderId
        //        "st": "PARTIALLY_FILLED",                // state
        //        "sd": "BUY",                             // side BUY/SELL
        //        "eq": "2",                               // executedQty executed quantity
        //        "ap": "30000",                           // avg price
        //        "f": "0.002"                             // fee
        //    }
        //
        // contract
        //
        //    {
        //        "symbol": "btc_usdt",                    // Trading pair
        //        "orderId": "1234",                       // Order Id
        //        "origQty": "34244",                      // Original Quantity
        //        "avgPrice": "123",                       // Quantity
        //        "price": "1111",                         // Average price
        //        "executedQty": "34244",                  // Volume (Cont)
        //        "orderSide": "BUY",                      // BUY, SELL
        //        "positionSide": "LONG",                  // LONG, SHORT
        //        "marginFrozen": "123",                   // Occupied margin
        //        "sourceType": "default",                 // DEFAULT:normal order,ENTRUST:plan commission,PROFIR:Take Profit and Stop Loss
        //        "sourceId" : "1231231",                  // Triggering conditions ID
        //        "state": "",                             // state:NEW：New order (unfilled);PARTIALLY_FILLED:Partial deal;PARTIALLY_CANCELED:Partial revocation;FILLED:Filled;CANCELED:Cancled;REJECTED:Order failed;EXPIRED：Expired
        //        "createTime": 1731231231,                // CreateTime
        //        "clientOrderId": "204788317630342726"
        //    }
        //
        const marketId = this.safeString (trade, 's');
        const tradeType = ('symbol' in trade) ? 'contract' : 'spot';
        market = this.safeMarket (marketId, market, undefined, tradeType);
        const timestamp = this.safeString (trade, 't');
        return this.safeTrade ({
            'info': trade,
            'id': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'order': this.safeString (trade, 'i', 'orderId'),
            'type': this.parseOrderStatus (this.safeString (trade, 'st', 'state')),
            'side': this.safeStringLower (trade, 'sd', 'orderSide'),
            'takerOrMaker': undefined,
            'price': this.safeNumber (trade, 'price'),
            'amount': this.safeString (trade, 'origQty'),
            'cost': undefined,
            'fee': {
                'currency': undefined,
                'cost': this.safeNumber (trade, 'f'),
                'rate': undefined,
            },
        }, market);
    }

    parseWsOrder (order, market = undefined) {
        //
        // spot
        //
        //    {
        //        "s": "btc_usdt",                         // symbol
        //        "t": 1656043204763,                      // time happened time
        //        "i": "6216559590087220004",              // orderId,
        //        "ci": "test123",                         // clientOrderId
        //        "st": "PARTIALLY_FILLED",                // state
        //        "sd": "BUY",                             // side BUY/SELL
        //        "eq": "2",                               // executedQty executed quantity
        //        "ap": "30000",                           // avg price
        //        "f": "0.002"                             // fee
        //    }
        //
        // contract
        //
        //    {
        //        "symbol": "btc_usdt",                    // Trading pair
        //        "orderId": "1234",                       // Order Id
        //        "origQty": "34244",                      // Original Quantity
        //        "avgPrice": "123",                       // Quantity
        //        "price": "1111",                         // Average price
        //        "executedQty": "34244",                  // Volume (Cont)
        //        "orderSide": "BUY",                      // BUY, SELL
        //        "positionSide": "LONG",                  // LONG, SHORT
        //        "marginFrozen": "123",                   // Occupied margin
        //        "sourceType": "default",                 // DEFAULT:normal order,ENTRUST:plan commission,PROFIR:Take Profit and Stop Loss
        //        "sourceId" : "1231231",                  // Triggering conditions ID
        //        "state": "",                             // state:NEW：New order (unfilled);PARTIALLY_FILLED:Partial deal;PARTIALLY_CANCELED:Partial revocation;FILLED:Filled;CANCELED:Cancled;REJECTED:Order failed;EXPIRED：Expired
        //        "createTime": 1731231231,                // CreateTime
        //        "clientOrderId": "204788317630342726"
        //    }
        //
        const marketId = this.safeString2 (order, 's', 'symbol');
        const tradeType = ('symbol' in order) ? 'contract' : 'spot';
        market = this.safeMarket (marketId, market, undefined, tradeType);
        const timestamp = this.safeInteger2 (order, 't', 'createTime');
        return this.safeOrder ({
            'info': order,
            'id': this.safeString2 (order, 'i', 'orderId'),
            'clientOrderId': this.safeString2 (order, 'ci', 'clientOrderId'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': market['symbol'],
            'type': market['type'],
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': this.safeStringLower2 (order, 'sd', 'orderSide'),
            'price': this.safeNumber (order, 'price'),
            'stopPrice': undefined,
            'stopLoss': undefined,
            'takeProfit': undefined,
            'amount': this.safeString (order, 'origQty'),
            'filled': this.safeString2 (order, 'eq', 'executedQty'),
            'remaining': undefined,
            'cost': undefined,
            'average': this.safeString2 (order, 'ap', 'avgPrice'),
            'status': this.parseOrderStatus (this.safeString (order, 'st', 'state')),
            'fee': {
                'currency': undefined,
                'cost': this.safeNumber (order, 'f'),
            },
            'trades': undefined,
        }, market);
    }

    handleOrder (client: Client, message) {
        //
        // spot
        //
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
        // contract
        //
        //    {
        //        "topic": "order",
        //        "event": "order@123456",
        //        "data": {
        //             "symbol": "btc_usdt",                    // Trading pair
        //             "orderId": "1234",                       // Order Id
        //             "origQty": "34244",                      // Original Quantity
        //             "avgPrice": "123",                       // Quantity
        //             "price": "1111",                         // Average price
        //             "executedQty": "34244",                  // Volume (Cont)
        //             "orderSide": "BUY",                      // BUY, SELL
        //             "positionSide": "LONG",                  // LONG, SHORT
        //             "marginFrozen": "123",                   // Occupied margin
        //             "sourceType": "default",                 // DEFAULT:normal order,ENTRUST:plan commission,PROFIR:Take Profit and Stop Loss
        //             "sourceId" : "1231231",                  // Triggering conditions ID
        //             "state": "",                             // state:NEW：New order (unfilled);PARTIALLY_FILLED:Partial deal;PARTIALLY_CANCELED:Partial revocation;FILLED:Filled;CANCELED:Cancled;REJECTED:Order failed;EXPIRED：Expired
        //             "createTime": 1731231231,                // CreateTime
        //             "clientOrderId": "204788317630342726"
        //           }
        //    }
        //
        let orders = this.orders;
        if (orders === undefined) {
            const limit = this.safeInteger (this.options, 'ordersLimit');
            orders = new ArrayCacheBySymbolById (limit);
            this.orders = orders;
        }
        const order = this.safeValue (message, 'data', {});
        const marketId = this.safeString2 (order, 's', 'symbol');
        if (marketId !== undefined) {
            const tradeType = ('symbol' in order) ? 'contract' : 'spot';
            const market = this.safeMarket (marketId, undefined, undefined, tradeType);
            const parsed = this.parseWsOrder (order, market);
            orders.append (parsed);
            client.resolve (orders, 'order:' + tradeType);
        }
        return message;
    }

    handleBalance (client: Client, message) {
        //
        // spot
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
        // contract
        //
        //    {
        //        "topic": "balance",
        //        "event": "balance@123456",
        //        "data": {
        //            "coin": "usdt",
        //            "underlyingType": 1,                          // 1:Coin-M,2:USDT-M
        //            "walletBalance": "123",                       // Balance
        //            "openOrderMarginFrozen": "123",               // Frozen order
        //            "isolatedMargin": "213",                      // Isolated Margin
        //            "crossedMargin": "0"                          // Crossed Margin
        //            "availableBalance": '2.256114450000000000',
        //            "coupon": '0',
        //            "bonus": '0'
        //        }
        //    }
        //
        const data = this.safeValue (message, 'data', {});
        const currencyId = this.safeString2 (data, 'c', 'coin');
        const code = this.safeCurrencyCode (currencyId);
        const account = this.account ();
        account['free'] = this.safeString2 (data, 'b', 'availableBalance');
        account['used'] = this.safeString (data, 'f');
        account['total'] = this.safeString (data, 'walletBalance');
        this.balance[code] = account;
        this.balance = this.safeBalance (this.balance);
        const tradeType = ('coin' in data) ? 'contract' : 'spot';
        client.resolve (this.balance, 'balance:' + tradeType);
    }

    handleMyTrades (client: Client, message) {
        //
        // spot
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
        // contract
        //
        //    {
        //       "topic": "trade",
        //       "event": "trade@123456",
        //       "data": {
        //            "symbol": 'btc_usdt',
        //            "orderSide": 'SELL',
        //            "positionSide": 'LONG',
        //            "orderId": '231485367663419328',
        //            "price": '27152.7',
        //            "quantity": '33',
        //            "marginUnfrozen": '2.85318000',
        //            "timestamp": 1684892412565
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
        const market = this.market (parsedTrade['symbol']);
        stored.append (parsedTrade);
        const tradeType = market['contract'] ? 'contract' : 'spot';
        client.resolve (stored, 'trade:' + tradeType);
    }

    handleMessage (client, message) {
        const event = this.safeString (message, 'event');
        if (event === 'pong') {
            return client.onPong (message);
        } else if (event !== undefined) {
            const topic = this.safeString (message, 'topic');
            const methods = {
                'kline': this.handleOHLCV,
                'depth': this.handleOrderBook,
                'depth_update': this.handleOrderBook,
                'ticker': this.handleTicker,
                'agg_ticker': this.handleTicker,
                'tickers': this.handleTickers,
                'agg_tickers': this.handleTickers,
                'balance': this.handleBalance,
                'order': this.handleOrder,
            };
            let method = this.safeValue (methods, topic);
            if (topic === 'trade') {
                const data = this.safeValue (message, 'data');
                if (('oi' in data) || ('orderId' in data)) {
                    method = this.handleMyTrades;
                } else {
                    method = this.handleTrade;
                }
            }
            if (method !== undefined) {
                return method.call (this, client, message);
            }
        }
    }

    ping (client) {
        client.lastPong = this.milliseconds ();
        return 'ping';
    }

    handleErrorMessage (client: Client, message) {
        //
        //    {
        //        "id": "123",
        //        "code": 401,
        //        "msg": "token expire"
        //    }
        //
        const msg = this.safeString (message, 'msg');
        if ((msg === 'invalid_listen_key') || (msg === 'token expire')) {
            client.subscriptions['accessToken'] = undefined;
            this.getListenKey (true);
        }
        client.reject (message);
    }
}
