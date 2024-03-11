//  ---------------------------------------------------------------------------

import hyperliquidRest from '../hyperliquid.js';
import { ExchangeError } from '../base/errors.js';
import Client from '../base/ws/Client.js';
import { Int, Market, Trade } from '../base/types.js';
import { ArrayCache } from '../base/ws/Cache.js';

//  ---------------------------------------------------------------------------

export default class hyperliquid extends hyperliquidRest {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchBalance': false,
                'watchMyTrades': false,
                'watchOHLCV': false,
                'watchOrderBook': false,
                'watchOrders': false,
                'watchTicker': false,
                'watchTickers': false,
                'watchTrades': true,
                'watchPosition': false,
            },
            'urls': {
                'api': {
                    'ws': {
                        'public': 'wss://api.hyperliquid.xyz/ws',
                    },
                },
                'test': {
                    'ws': {
                        'public': 'wss://api.hyperliquid-testnet.xyz/ws',
                    },
                },
            },
            'options': {
            },
            'streaming': {
                'ping': this.ping,
                'keepAlive': 20000,
            },
            'exceptions': {
                'ws': {
                    'exact': {
                    },
                },
            },
        });
    }

    async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        /**
         * @method
         * @name hyperliquid#watchTrades
         * @description watches information on multiple trades made in a market
         * @param {string} symbol unified market symbol of the market trades were made in
         * @param {int} [since] the earliest time in ms to fetch trades for
         * @param {int} [limit] the maximum number of trade structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const messageHash = 'trade:' + market['symbol'];
        const url = this.urls['api']['ws']['public'];
        const request = {
            'method': 'subscribe',
            'subscription': {
                'type': 'trades',
                'coin': market['base'],
            },
        };
        const message = this.extend (request, params);
        const trades = await this.watch (url, messageHash, message, messageHash);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    handleTrades (client: Client, message) {
        //
        //     {
        //         "channel": "trades",
        //         "data": [
        //             {
        //                 "coin": "BTC",
        //                 "side": "A",
        //                 "px": "68517.0",
        //                 "sz": "0.005",
        //                 "time": 1710125266669,
        //                 "hash": "0xc872699f116e012186620407fc08a802015e0097c5cce74710697f7272e6e959",
        //                 "tid": 981894269203506
        //             }
        //         ]
        //     }
        //
        const entry = this.safeList (message, 'data', []);
        const first = this.safeDict (entry, 0, {});
        const coin = this.safeString (first, 'coin');
        const marketId = coin + '/USDC:USDC';
        const market = this.safeMarket (marketId, undefined);
        const symbol = market['symbol'];
        let stored = this.safeValue (this.trades, symbol);
        if (stored === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            stored = new ArrayCache (limit);
            this.trades[symbol] = stored;
        }
        for (let i = 0; i < entry.length; i++) {
            const data = this.safeValue (entry, i);
            const trade = this.parseWsTrade (data);
            stored.append (trade);
        }
        const messageHash = 'trade:' + symbol;
        client.resolve (stored, messageHash);
    }

    parseWsTrade (trade, market: Market = undefined): Trade {
        //
        //     {
        //         "coin": "BTC",
        //         "side": "A",
        //         "px": "68517.0",
        //         "sz": "0.005",
        //         "time": 1710125266669,
        //         "hash": "0xc872699f116e012186620407fc08a802015e0097c5cce74710697f7272e6e959",
        //         "tid": 981894269203506
        //     }
        //
        const timestamp = this.safeInteger (trade, 'time');
        const price = this.safeString (trade, 'px');
        const amount = this.safeString (trade, 'sz');
        const coin = this.safeString (trade, 'coin');
        const marketId = coin + '/USDC:USDC';
        market = this.safeMarket (marketId, undefined);
        const symbol = market['symbol'];
        const id = this.safeString (trade, 'tid');
        let side = this.safeString (trade, 'side');
        if (side !== undefined) {
            side = (side === 'A') ? 'sell' : 'buy';
        }
        return this.safeTrade ({
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': id,
            'order': undefined,
            'type': undefined,
            'side': side,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'fee': { 'cost': undefined, 'currency': undefined },
        }, market);
    }

    handleErrorMessage (client: Client, message) {
        //
        //     {
        //         "channel": "error",
        //         "data": "Error parsing JSON into valid websocket request: { \"type\": \"allMids\" }"
        //     }
        //
        const channel = this.safeString (message, 'channel', '');
        const ret_msg = this.safeString (message, 'data', '');
        if (channel === 'error') {
            throw new ExchangeError (this.id + ' ' + ret_msg);
        } else {
            return false;
        }
    }

    handleMessage (client: Client, message) {
        if (this.handleErrorMessage (client, message)) {
            return;
        }
        const topic = this.safeString (message, 'channel', '');
        const methods = {
            'pong': this.handlePong,
            'trades': this.handleTrades,
        };
        const exacMethod = this.safeValue (methods, topic);
        if (exacMethod !== undefined) {
            exacMethod.call (this, client, message);
            return;
        }
        const keys = Object.keys (methods);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            if (topic.indexOf (keys[i]) >= 0) {
                const method = methods[key];
                method.call (this, client, message);
                return;
            }
        }
    }

    ping (client) {
        return {
            'method': 'ping',
        };
    }

    handlePong (client: Client, message) {
        //
        //   {
        //       "channel": "pong"
        //   }
        //
        client.lastPong = this.safeInteger (message, 'pong');
        return message;
    }
}
