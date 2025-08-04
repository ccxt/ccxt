
//  ---------------------------------------------------------------------------

import dydxRest from '../dydx.js';
import { ArrayCache } from '../base/ws/Cache.js';
import type { Int, Trade, Dict } from '../base/types.js';
import Client from '../base/ws/Client.js';
import { ExchangeError } from '../base/errors.js';

//  ---------------------------------------------------------------------------

export default class dydx extends dydxRest {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchBalance': false,
                'watchTicker': false,
                'watchTickers': false,
                'watchTrades': true,
                'watchOrderBook': false,
                'watchOHLCV': false,
            },
            'urls': {
                'test': {
                    'ws': 'wss://indexer.v4testnet.dydx.exchange/v4/ws',
                },
                'api': {
                    'ws': 'wss://indexer.dydx.trade/v4/ws',
                },
            },
            'options': {},
            'streaming': {},
            'exceptions': {},
        });
    }

    /**
     * @method
     * @name dydx#watchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://docs.dydx.xyz/indexer-client/websockets#trades
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#public-trades}
     */
    async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const url = this.urls['api']['ws'];
        const market = this.market (symbol);
        const messageHash = 'trade:' + market['symbol'];
        const request: Dict = {
            'type': 'subscribe',
            'channel': 'v4_trades',
            'id': market['id'],
        };
        const trades = await this.watch (url, messageHash, this.extend (request, params), messageHash);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    handleTrades (client, message) {
        //
        // {
        //     "type": "subscribed",
        //     "connection_id": "9011edff-d8f7-47fc-bbc6-0c7b5ba7dfae",
        //     "message_id": 3,
        //     "channel": "v4_trades",
        //     "id": "BTC-USD",
        //     "contents": {
        //         "trades": [
        //             {
        //                 "id": "02b6148d0000000200000005",
        //                 "side": "BUY",
        //                 "size": "0.024",
        //                 "price": "114581",
        //                 "type": "LIMIT",
        //                 "createdAt": "2025-08-04T00:42:07.118Z",
        //                 "createdAtHeight": "45487245"
        //             }
        //         ]
        //     }
        // }
        //
        const marketId = this.safeString (message, 'id');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const content = this.safeDict (message, 'contents', {});
        const rawTrades = this.safeList (content, 'trades', []);
        let stored = this.safeValue (this.trades, symbol);
        if (stored === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            stored = new ArrayCache (limit);
            this.trades[symbol] = stored;
        }
        const parsedTrades = this.parseTrades (rawTrades, market);
        for (let i = 0; i < parsedTrades.length; i++) {
            const parsed = parsedTrades[i];
            stored.append (parsed);
        }
        const messageHash = 'trade' + ':' + symbol;
        client.resolve (stored, messageHash);
    }

    parseWsTrade (trade, market = undefined) {
        //
        // {
        //     "id": "02b6148d0000000200000005",
        //     "side": "BUY",
        //     "size": "0.024",
        //     "price": "114581",
        //     "type": "LIMIT",
        //     "createdAt": "2025-08-04T00:42:07.118Z",
        //     "createdAtHeight": "45487245"
        // }
        //
        const timestamp = this.parse8601 (this.safeString (trade, 'createdAt'));
        return this.safeTrade ({
            'id': this.safeString (trade, 'id'),
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': this.safeString (market, 'symbol'),
            'order': undefined,
            'type': this.safeStringLower (trade, 'type'),
            'side': this.safeStringLower (trade, 'side'),
            'takerOrMaker': undefined,
            'price': this.safeString (trade, 'price'),
            'amount': this.safeString (trade, 'size'),
            'cost': undefined,
            'fee': undefined,
        }, market);
    }

    handleErrorMessage (client: Client, message) {
        //
        // {
        //     "type": "error",
        //     "message": "....",
        //     "connection_id": "9011edff-d8f7-47fc-bbc6-0c7b5ba7dfae",
        //     "message_id": 4
        // }
        //
        try {
            const msg = this.safeString (message, 'message');
            throw new ExchangeError (this.id + ' ' + msg);
        } catch (e) {
            client.reject (e);
        }
        return true;
    }

    handleMessage (client: Client, message) {
        const type = this.safeString (message, 'type');
        if (type === 'error') {
            this.handleErrorMessage (client, message);
            return;
        }
        if (type !== undefined) {
            const topic = this.safeString (message, 'channel');
            const methods: Dict = {
                'v4_trades': this.handleTrades,
            };
            const method = this.safeValue (methods, topic);
            if (method !== undefined) {
                method.call (this, client, message);
            }
        }
    }
}
