
//  ---------------------------------------------------------------------------

import dotswapRest from '../dotswap.js';
import type { Trade, Dict } from '../base/types.js';
import Client from '../base/ws/Client.js';
import { ArrayCache } from '../base/ws/Cache.js';

//  ---------------------------------------------------------------------------

export default class dotswap extends dotswapRest {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchTrades': true,
                'watchTicker': false,
                'watchOrderBook': false,
                'watchOrders': false,
                'watchBalance': false,
            },
            'urls': {
                'api': {
                    'ws': 'ws://192.168.0.2:28910/ws',
                },
            },
            'streaming': {
            },
        });
    }

    /**
     * @method
     * @name dotswap#watchTrades
     * @description get the list of most recent trades for a particular symbol
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async watchTrades (symbol: string, since: number = undefined, limit: number = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const messageHash = 'trade:' + market['symbol'];
        // Path parameter: {stream} -> symbol@event
        // example: BESTINSLOT•XYZ/BTC@trade
        // The URL provided is ws://.../ws/{stream}
        // CCXT Client usually handles the URL connection.
        // Since the stream is part of the URL path, we need to construct the URL for this specific subscription.
        // Note: CCXT's standard WS Client connects to a base URL. If the URL changes per subscription, it might create multiple clients (one per symbol).
        // This is fine if we treat the URL as the unique key.
        const stream = market['symbol'] + '@trade';
        const url = this.urls['api']['ws'] + '/' + stream;
        // Since there is no explicit "subscribe" message mentioned in the prompt (just connecting to the path),
        // we assume connecting to the URL initiates the stream.
        // We pass 'undefined' as the message to send.
        const trades = await this.watch (url, messageHash, undefined, messageHash);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    handleMessage (client: Client, message) {
        //
        // {
        //     "e": "trade",
        //     "E": 1763975983770,
        //     "s": "DOTSWAP•DOTSWAP/BTC",
        //     "p": "918.209",
        //     "q": "1000",
        //     "T": 1763975975000
        // }
        //
        const event = this.safeString (message, 'e');
        if (event === 'trade') {
            this.handleTrade (client, message);
        }
    }

    handleTrade (client: Client, message) {
        //
        // {
        //     "e": "trade",
        //     "E": 1763975983770,
        //     "s": "DOTSWAP•DOTSWAP/BTC",
        //     "p": "918.209",
        //     "q": "1000",
        //     "T": 1763975975000
        // }
        //
        const marketId = this.safeString (message, 's');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const messageHash = 'trade:' + symbol;
        const trade = this.parseTrade (message, market);
        let stored = this.safeValue (this.trades, symbol);
        if (stored === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            stored = new ArrayCache (limit);
            this.trades[symbol] = stored;
        }
        stored.append (trade);
        client.resolve (stored, messageHash);
    }

    parseTrade (trade: Dict, market = undefined): Trade {
        //
        // {
        //     "e": "trade",
        //     "E": 1763975983770,
        //     "s": "DOTSWAP•DOTSWAP/BTC",
        //     "p": "918.209",
        //     "q": "1000",
        //     "T": 1763975975000
        // }
        //
        const timestamp = this.safeInteger (trade, 'T');
        const price = this.safeString (trade, 'p');
        const amount = this.safeString (trade, 'q');
        const marketId = this.safeString (trade, 's');
        market = this.safeMarket (marketId, market);
        return this.safeTrade ({
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'id': undefined,
            'order': undefined,
            'type': undefined,
            'side': undefined, // Side is not provided in the websocket update
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'fee': undefined,
        }, market);
    }
}
