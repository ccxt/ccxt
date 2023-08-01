
//  ---------------------------------------------------------------------------

import bingxRest from '../bingx.js';
import { BadRequest } from '../base/errors.js';
import { ArrayCache } from '../base/ws/Cache.js';
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
            throw new BadRequest (this.id + ' fetchTicker is not supported for ' + marketType + ' markets.');
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
            limit = 20;
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
        const messageHash = market['id'] + '@depth' + limit.toString ();
        const url = this.safeValue (this.urls['api']['ws'], marketType);
        if (url === undefined) {
            throw new BadRequest (this.id + ' fetchTicker is not supported for ' + marketType + ' markets.');
        }
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

    handleDeltas (bookside, deltas) {
        for (let i = 0; i < deltas.length; i++) {
            this.handleDelta (bookside, deltas[i]);
        }
    }

    handleOrderBook (client: Client, message) {
        //
        // spot
        //
        // first snapshot
        //
        //    {
        //        code: 0,
        //        id: 'b41f1fc9-2e38-48d8-b6b2-e64fb2050538',
        //        msg: 'SUCCESS',
        //        timestamp: 1690900012131
        //    }
        //
        // subsequent updates
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
        // first snapshot
        //
        //    {
        //        id: 'd0ddbd94-81d5-41de-a098-96e6de9714ca',
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
        } else {
            const asks = this.safeValue (data, 'asks', []);
            const bids = this.safeValue (data, 'bids', []);
            this.handleDeltas (orderbook['asks'], asks);
            this.handleDeltas (orderbook['bids'], bids);
            orderbook['symbol'] = symbol;
        }
        this.orderbooks[symbol] = orderbook;
        client.resolve (orderbook, messageHash);
    }

    handleMessage (client: Client, message) {
        // TODO: Handle ping-pong -> see bybit as example
        let table = this.safeString (message, 'e');
        const dataType = this.safeString (message, 'dataType');
        if (table === undefined && dataType !== undefined) {
            table = dataType.split ('@')[1].replace (/[0-9]/g, '');
        }
        const methods = {
            'trade': this.handleTrades,
            'depth': this.handleOrderBook,
        };
        const method = this.safeValue (methods, table);
        if (method !== undefined) {
            return method.call (this, client, message);
        } else {
            console.log (message);
            console.log (message['data']);
            // process.exit ();
        }
    }
}
