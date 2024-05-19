
//  ---------------------------------------------------------------------------

import oxfunRest from '../oxfun.js';
import type { Int, Trade } from '../base/types.js';
import { ArrayCache } from '../base/ws/Cache.js';
import Client from '../base/ws/Client.js';

//  ---------------------------------------------------------------------------

export default class oxfun extends oxfunRest {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchTrades': false,
                'watchOrderBook': false,
                'watchOHLCV': false,
                'watchOrders': false,
                'watchMyTrades': false,
                'watchTicker': false,
                'watchTickers': false,
                'watchBalance': false,
            },
            'urls': {
                'api': {
                    'ws': {
                        'public': 'wss://api.ox.fun/v2/websocket',
                        'private': 'wss://api.ox.fun/v2/websocket',
                    },
                    'test': {
                        'public': 'wss://stgapi.ox.fun/v2/websocket',
                        'private': 'wss://stgapi.ox.fun/v2/websocket',
                    },
                },
            },
            'options': {
                'listenKeyRefreshRate': 3600000,
                'watchOrderBook': {
                    'snapshotDelay': 25,
                    'snapshotMaxRetries': 3,
                },
                'listenKey': undefined,
            },
            'streaming': {
                'keepAlive': 10000,
            },
        });
    }

    async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        /**
         * @method
         * @name oxfun#watchTrades
         * @description watches information on multiple trades made in a market
         * @see https://docs.ox.fun/?json#trade
         * @param {string} symbol unified market symbol of the market trades were made in
         * @param {int} [since] the earliest time in ms to fetch orders for
         * @param {int} [limit] the maximum number of trade structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int|string} [params.tag] If given it will be echoed in the reply and the max size of tag is 32
         * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure
         */
        const url = this.urls['api']['ws']['public'];
        await this.loadMarkets ();
        const market = this.market (symbol);
        const subscribeHash = 'trade:' + market['id'];
        const messageHash = 'trades:' + symbol;
        const request = {
            'op': 'subscribe',
            'args': [ subscribeHash ],
        };
        const trades = await this.watch (url, messageHash, this.extend (request, params), messageHash);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    handleTrades (client: Client, message) {
        //
        //     {
        //         table: 'trade',
        //         data: [
        //             {
        //                 side: 'SELL',
        //                 quantity: '0.074',
        //                 matchType: 'TAKER',
        //                 price: '3079.5',
        //                 marketCode: 'ETH-USD-SWAP-LIN',
        //                 tradeId: '400017157974517783',
        //                 timestamp: '1716124156643'
        //             }
        //         ]
        //     }
        //
        const data = this.safeList (message, 'data', []);
        for (let i = 0; i < data.length; i++) {
            const trade = this.safeDict (data, i, {});
            const parsedTrade = this.parseWsTrade (trade);
            const symbol = this.safeString (parsedTrade, 'symbol');
            const messageHash = 'trades:' + symbol;
            if (!(symbol in this.trades)) {
                const tradesLimit = this.safeInteger (this.options, 'tradesLimit', 1000);
                this.trades[symbol] = new ArrayCache (tradesLimit);
            }
            const stored = this.trades[symbol];
            stored.append (parsedTrade);
            client.resolve (stored, messageHash);
        }
    }

    parseWsTrade (trade, market = undefined): Trade {
        //
        //     {
        //         side: 'SELL',
        //         quantity: '0.074',
        //         matchType: 'TAKER',
        //         price: '3079.5',
        //         marketCode: 'ETH-USD-SWAP-LIN',
        //         tradeId: '400017157974517783',
        //         timestamp: '1716124156643'
        //     }
        //
        const marketId = this.safeString (trade, 'marketCode');
        market = this.safeMarket (marketId, market);
        const timestamp = this.safeInteger (trade, 'timestamp');
        return this.safeTrade ({
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'id': this.safeString (trade, 'tradeId'),
            'order': undefined,
            'type': undefined,
            'takerOrMaker': this.safeStringLower (trade, 'matchType'),
            'side': this.safeStringLower (trade, 'side'),
            'price': this.safeNumber (trade, 'price'),
            'amount': this.safeNumber (trade, 'quantity'),
            'cost': undefined,
            'fee': undefined,
        });
    }

    handleMessage (client: Client, message) {
        const table = this.safeString (message, 'table');
        const data = this.safeList (message, 'data', []);
        if ((table !== undefined) && (data !== undefined)) { // for public methods
            if (table === 'trade') {
                this.handleTrades (client, message);
            }
        }
    }
}
