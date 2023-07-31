
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
        let marketType = undefined;
        if (Array.isArray (data)) {
            marketType = 'swap';
        } else {
            marketType = 'spot';
        }
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
        if (limit === undefined) {
            limit = 20;
        } else {
            if ((limit !== 5) && (limit !== 10) && (limit !== 20) && (limit !== 50) && (limit !== 100)) {
                throw new BadRequest (this.id + ' watchOrderBook() can only use limit 5, 10, 20, 50, and 100.');
            }
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const [ marketType, query ] = this.handleMarketTypeAndParams ('watchOrderBook', market, params);
        const url = this.safeValue (this.urls['api']['ws'], marketType);
        if (url === undefined) {
            throw new BadRequest (this.id + ' fetchTicker is not supported for ' + marketType + ' markets.');
        }
        const uuid = this.uuid ();
        const request = {
            'id': uuid,
            'level': limit,
        };
        const messageHash = symbol + '@depth' + limit.toString ();
        const orderbook = await this.watch (url, messageHash, this.deepExtend (request, query), messageHash);
        return orderbook.limit ();
    }

    handleOrderBook (client: Client, message) {
        //
        //     {
        //         "topic": "orderbook.50.BTCUSDT",
        //         "type": "snapshot",
        //         "ts": 1672304484978,
        //         "data": {
        //             "s": "BTCUSDT",
        //             "b": [
        //                 ...,
        //                 [
        //                     "16493.50",
        //                     "0.006"
        //                 ],
        //                 [
        //                     "16493.00",
        //                     "0.100"
        //                 ]
        //             ],
        //             "a": [
        //                 [
        //                     "16611.00",
        //                     "0.029"
        //                 ],
        //                 [
        //                     "16612.00",
        //                     "0.213"
        //                 ],
        //             ],
        //             "u": 18521288,
        //             "seq": 7961638724
        //         }
        //     }
        //
        console.log (client);
        console.log (message);
    }

    handleMessage (client: Client, message) {
        // TODO: Handle ping-pong -> see bybit as example
        let table = this.safeString (message, 'e');
        const dataType = this.safeString (message, 'dataType');
        if (table === undefined && dataType !== undefined) {
            console.log (table, dataType);
            table = dataType.split ('@')[1].replace (/[0-9]/g, '');
        }
        console.log (table);
        const methods = {
            'trade': this.handleTrades,
            'depth': this.handleOrderBook,
        };
        const method = this.safeValue (methods, table);
        if (method !== undefined) {
            return method.call (this, client, message);
        } else {
            console.log (message);
            process.exit ();
        }
    }
}
