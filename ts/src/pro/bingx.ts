
//  ---------------------------------------------------------------------------

import bingxRest from '../bingx.js';
import { BadRequest } from '../base/errors.js';
import { ArrayCache, ArrayCacheByTimestamp } from '../base/ws/Cache.js';
import { Int } from '../base/types.js';
import Client from '../base/ws/Client.js';

//  ---------------------------------------------------------------------------

export default class bingx extends bingxRest {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchTrades': true,
                'watchOrderBook': true,
                'watchOHLCV': true,
            },
            'urls': {
                'api': {
                    'ws': {
                        'spot': 'wss://open-api-ws.bingx.com/market',
                        'swap': 'wss://open-api-swap.bingx.com/swap-market',
                    },
                },
            },
            'options': {
                'ws': {
                    'gunzip': true,
                },
            },
            'streaming': {
                'ping': this.ping,
                'keepAlive': 20000,
            },
        });
    }

    async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name bingx#watchTrades
         * @description watches information on multiple trades made in a market
         * @see https://bingx-api.github.io/docs/#/spot/socket/market.html#Subscribe%20to%20tick-by-tick
         * @see https://bingx-api.github.io/docs/#/swapV2/socket/market.html#Subscribe%20the%20Latest%20Trade%20Detail
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int} [since] the earliest time in ms to fetch orders for
         * @param {int} [limit] the maximum number of  orde structures to retrieve
         * @param {object} [params] extra parameters specific to the bingx api endpoint
         * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const [ marketType, query ] = this.handleMarketTypeAndParams ('watchTrades', market, params);
        const url = this.safeValue (this.urls['api']['ws'], marketType);
        if (url === undefined) {
            throw new BadRequest (this.id + ' watchTrades is not supported for ' + marketType + ' markets.');
        }
        const messageHash = market['id'] + '@trade';
        const uuid = this.uuid ();
        const request = {
            'id': uuid,
            'dataType': messageHash,
        };
        if (marketType === 'swap') {
            request['reqType'] = 'sub';
        }
        const trades = await this.watch (url, messageHash, this.extend (request, query), messageHash);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    handleTrades (client: Client, message) {
        //
        // spot
        // first snapshot
        //
        //    {
        //      id: 'd83b78ce-98be-4dc2-b847-12fe471b5bc5',
        //      code: 0,
        //      msg: 'SUCCESS',
        //      timestamp: 1690214699854
        //    }
        //
        // subsequent updates
        //
        //     {
        //         code: 0,
        //         data: {
        //           E: 1690214529432,
        //           T: 1690214529386,
        //           e: 'trade',
        //           m: true,
        //           p: '29110.19',
        //           q: '0.1868',
        //           s: 'BTC-USDT',
        //           t: '57903921'
        //         },
        //         dataType: 'BTC-USDT@trade',
        //         success: true
        //     }
        //
        //
        // swap
        // first snapshot
        //
        //    {
        //        id: '2aed93b1-6e1e-4038-aeba-f5eeaec2ca48',
        //        code: 0,
        //        msg: '',
        //        dataType: '',
        //        data: null
        //    }
        //
        // subsequent updates
        //
        //
        //    {
        //        code: 0,
        //        dataType: 'BTC-USDT@trade',
        //        data: [
        //            {
        //                q: '0.0421',
        //                p: '29023.5',
        //                T: 1690221401344,
        //                m: false,
        //                s: 'BTC-USDT'
        //            },
        //            ...
        //        ]
        //    }
        //
        const data = this.safeValue (message, 'data', []);
        const messageHash = this.safeString (message, 'dataType');
        const marketId = messageHash.split ('@')[0];
        const marketType = client.url.indexOf ('swap') >= 0 ? 'swap' : 'spot';
        const market = this.safeMarket (marketId, undefined, undefined, marketType);
        const symbol = market['symbol'];
        let trades = undefined;
        if (Array.isArray (data)) {
            trades = this.parseTrades (data, market);
        } else {
            trades = [ this.parseTrade (data, market) ];
        }
        let stored = this.safeValue (this.trades, symbol);
        if (stored === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            stored = new ArrayCache (limit);
            this.trades[symbol] = stored;
        }
        for (let j = 0; j < trades.length; j++) {
            stored.append (trades[j]);
        }
        client.resolve (stored, messageHash);
    }

    async watchOrderBook (symbol: string, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name bingx#watchOrderBook
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @see https://bingx-api.github.io/docs/#/spot/socket/market.html#Subscribe%20Market%20Depth%20Data
         * @see https://bingx-api.github.io/docs/#/swapV2/socket/market.html#Subscribe%20Market%20Depth%20Data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int} [limit] the maximum amount of order book entries to return
         * @param {object} [params] extra parameters specific to the bingx api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const [ marketType, query ] = this.handleMarketTypeAndParams ('watchOrderBook', market, params);
        if (limit === undefined) {
            limit = 100;
        } else {
            if (marketType === 'swap') {
                if ((limit !== 5) && (limit !== 10) && (limit !== 20) && (limit !== 50) && (limit !== 100)) {
                    throw new BadRequest (this.id + ' watchOrderBook() (swap) only supports limit 5, 10, 20, 50, and 100');
                }
            } else if (marketType === 'spot') {
                if ((limit !== 20) && (limit !== 100)) {
                    throw new BadRequest (this.id + ' watchOrderBook() (spot) only supports limit 20, and 100');
                }
            }
        }
        const url = this.safeValue (this.urls['api']['ws'], marketType);
        if (url === undefined) {
            throw new BadRequest (this.id + ' watchOrderBook is not supported for ' + marketType + ' markets.');
        }
        const messageHash = market['id'] + '@depth' + limit.toString ();
        const uuid = this.uuid ();
        const request = {
            'id': uuid,
            'dataType': messageHash,
        };
        if (marketType === 'swap') {
            request['reqType'] = 'sub';
        }
        const orderbook = await this.watch (url, messageHash, this.deepExtend (request, query), messageHash);
        return orderbook.limit ();
    }

    handleDelta (bookside, delta) {
        const price = this.safeFloat (delta, 0);
        const amount = this.safeFloat (delta, 1);
        bookside.store (price, amount);
    }

    handleOrderBook (client: Client, message) {
        //
        // spot
        //
        //
        //    {
        //        code: 0,
        //        dataType: 'BTC-USDT@depth20',
        //        data: {
        //          bids: [
        //            [ '28852.9', '34.2621' ],
        //            ...
        //          ],
        //          asks: [
        //            [ '28864.9', '23.4079' ],
        //            ...
        //          ]
        //        },
        //        dataType: 'BTC-USDT@depth20',
        //        success: true
        //    }
        //
        // swap
        //
        //
        //    {
        //        code: 0,
        //        dataType: 'BTC-USDT@depth20',
        //        data: {
        //          bids: [
        //            [ '28852.9', '34.2621' ],
        //            ...
        //          ],
        //          asks: [
        //            [ '28864.9', '23.4079' ],
        //            ...
        //          ]
        //        }
        //    }
        //
        const data = this.safeValue (message, 'data', []);
        const messageHash = this.safeString (message, 'dataType');
        const marketId = messageHash.split ('@')[0];
        const marketType = client.url.indexOf ('swap') >= 0 ? 'swap' : 'spot';
        const market = this.safeMarket (marketId, undefined, undefined, marketType);
        const symbol = market['symbol'];
        let orderbook = this.safeValue (this.orderbooks, symbol);
        if (orderbook === undefined) {
            orderbook = this.orderBook ();
        }
        const snapshot = this.parseOrderBook (data, symbol, undefined, 'bids', 'asks', 0, 1);
        orderbook.reset (snapshot);
        this.orderbooks[symbol] = orderbook;
        client.resolve (orderbook, messageHash);
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        //    {
        //        c: '28909.0',
        //        o: '28915.4',
        //        h: '28915.4',
        //        l: '28896.1',
        //        v: '27.6919',
        //        T: 1690907580000
        //    }
        //
        return [
            this.safeInteger (ohlcv, 'T'),
            this.safeNumber (ohlcv, 'o'),
            this.safeNumber (ohlcv, 'h'),
            this.safeNumber (ohlcv, 'l'),
            this.safeNumber (ohlcv, 'c'),
            this.safeNumber (ohlcv, 'v'),
        ];
    }

    handleOHLCV (client: Client, message) {
        // spot
        //
        // first snapshot
        //
        //    {
        //        code: 100400,
        //        id: '12cc019d-6fb0-42b4-8d9b-88d1153ae453',
        //        msg: '',
        //        timestamp: 1690907596102
        //    }
        //
        // subsequent updates
        //
        //
        //
        // swap
        //
        // first snapshot
        //
        //    {
        //        id: '09662f0e-0f84-4e94-a842-285c758421e2',
        //        code: 0,
        //        msg: '',
        //        dataType: '',
        //        data: null
        //    }
        //
        // subsequent updates
        //
        //    {
        //        code: 0,
        //        dataType: 'BTC-USDT@kline_1m',
        //        s: 'BTC-USDT',
        //        data: [
        //            {
        //            c: '28909.0',
        //            o: '28915.4',
        //            h: '28915.4',
        //            l: '28896.1',
        //            v: '27.6919',
        //            T: 1690907580000
        //            }
        //        ]
        //    }
        //
        const data = this.safeValue (message, 'data', []);
        const messageHash = this.safeString (message, 'dataType');
        const timeframeId = messageHash.split ('_')[1];
        const marketId = messageHash.split ('@')[0];
        const marketType = client.url.indexOf ('swap') >= 0 ? 'swap' : 'spot';
        const market = this.safeMarket (marketId, undefined, undefined, marketType);
        const symbol = market['symbol'];
        this.ohlcvs[symbol] = this.safeValue (this.ohlcvs, symbol, {});
        let stored = this.safeValue (this.ohlcvs[symbol], timeframeId);
        if (stored === undefined) {
            const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
            stored = new ArrayCacheByTimestamp (limit);
            this.ohlcvs[symbol][timeframeId] = stored;
        }
        for (let i = 0; i < data.length; i++) {
            const candle = data[i];
            const parsed = this.parseOHLCV (candle, market);
            stored.append (parsed);
        }
        client.resolve (stored, messageHash);
    }

    async watchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name bingx#watchOHLCV
         * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @see https://bingx-api.github.io/docs/#/spot/socket/market.html#K%E7%BA%BF%20Streams
         * @see https://bingx-api.github.io/docs/#/swapV2/socket/market.html#Subscribe%20K-Line%20Data
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int} [since] timestamp in ms of the earliest candle to fetch
         * @param {int} [limit] the maximum amount of candles to fetch
         * @param {object} [params] extra parameters specific to the bingx api endpoint
         * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        const market = this.market (symbol);
        const [ marketType, query ] = this.handleMarketTypeAndParams ('watchOHLCV', market, params);
        const url = this.safeValue (this.urls['api']['ws'], marketType);
        if (url === undefined) {
            throw new BadRequest (this.id + ' watchOHLCV is not supported for ' + marketType + ' markets.');
        }
        const interval = this.safeString (this.timeframes, timeframe, timeframe);
        if (interval === undefined) {
            throw new BadRequest (this.id + ' this timeframe is not supported, supported timeframes: ' + this.timeframes);
        }
        const messageHash = market['id'] + '@kline_' + interval;
        const uuid = this.uuid ();
        const request = {
            'id': uuid,
            'dataType': messageHash,
        };
        if (marketType === 'swap') {
            request['reqType'] = 'sub';
        }
        const ohlcv = await this.watch (url, messageHash, this.extend (request, query), messageHash);
        if (this.newUpdates) {
            limit = ohlcv.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (ohlcv, since, limit, 0, true);
    }

    async watchOrders (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name bitmex#watchOrders
         * @description watches information on multiple orders made by the user
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int} [since] the earliest time in ms to fetch orders for
         * @param {int} [limit] the maximum number of  orde structures to retrieve
         * @param {object} [params] extra parameters specific to the bitmex api endpoint
         * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        await this.authenticate ();
        const name = 'order';
        const subscriptionHash = name;
        let messageHash = name;
        if (symbol !== undefined) {
            symbol = this.symbol (symbol);
            messageHash += ':' + symbol;
        }
        const url = this.urls['api']['ws'];
        const request = {
            'op': 'subscribe',
            'args': [
                subscriptionHash,
            ],
        };
        const orders = await this.watch (url, messageHash, request, subscriptionHash);
        if (this.newUpdates) {
            limit = orders.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (orders, symbol, since, limit, true);
    }

    handleErrorMessage (client: Client, message) {

    }

    async authenticate (params = {}) {
        const time = this.milliseconds ();
        const listenKey = this.safeString (this.options, 'listenKey');
        if (listenKey === undefined) {
            const response = await this.userAuthPostUserDataStream ();
            this.options['listenKey'] = this.safeString (response, 'listenKey');
            this.options['lastAuthenticatedTime'] = time;
            return;
        }
        const lastAuthenticatedTime = this.safeInteger (this.options, 'lastAuthenticatedTime', 0);
        const listenKeyRefreshRate = this.safeInteger (this.options, 'listenKeyRefreshRate', 3600000); // 1 hour
        if (time - lastAuthenticatedTime > listenKeyRefreshRate) {
            const response = await this.userAuthPostUserDataStream ({ 'listenKey': listenKey }); // extend the expiry
            this.options['listenKey'] = this.safeString (response, 'listenKey');
            this.options['lastAuthenticatedTime'] = time;
        }
    }

    ping (client) {
        return 'Pong';
    }

    handleMessage (client: Client, message) {
        const table = this.safeString (message, 'e');
        const dataType = this.safeString (message, 'dataType');
        // if (table === undefined && dataType !== undefined) {
        //     table = dataType.split ('@')[1].split ('_')[0].replace (/[0-9]/g, '');
        // }
        if (dataType === undefined) {
            return;
        }
        if (dataType.indexOf ('@depth') >= 0) {
            this.handleOrderBook (client, message);
            return;
        }
        const methods = {
            'trade': this.handleTrades,
            // 'depth': this.handleOrderBook,
            // 'kline': this.handleOHLCV,
        };
        // if ()
        const method = this.safeValue (methods, table);
        if (method !== undefined) {
            return method.call (this, client, message);
        } else {
            console.log (message);
            // console.log (message['data']);
            // process.exit ();
        }
    }
}
