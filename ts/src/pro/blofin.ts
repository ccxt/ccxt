
//  ---------------------------------------------------------------------------

import blofinRest from '../blofin.js';
import { NotSupported } from '../base/errors.js';
import { ArrayCache } from '../base/ws/Cache.js';
import type { Int, MarketInterface, Trade, Str } from '../base/types.js';
import Client from '../base/ws/Client.js';

//  ---------------------------------------------------------------------------

export default class blofin extends blofinRest {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchTrades': true,
            },
            'urls': {
                'api': {
                    'ws': {
                        'swap': {
                            'public': 'wss://openapi.blofin.com/ws/public',
                            'private': 'wss://openapi.blofin.com/ws/private',
                        },
                    },
                },
            },
            'options': {
                'tradesLimit': 1000,
            },
        });
    }

    async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        /**
         * @method
         * @name blofin#watchTrades
         * @see https://docs.blofin.com/index.html#ws-trades-channel
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int} [since] timestamp in ms of the earliest trade to fetch
         * @param {int} [limit] the maximum amount of trades to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
         */
        await this.loadMarkets ();
        symbol = this.symbol (symbol);
        return await this.watchTradesForSymbols ([ symbol ], since, limit, params);
    }

    async watchTradesForSymbols (symbols: string[], since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        /**
         * @method
         * @name bitmart#watchTradesForSymbols
         * @see https://docs.blofin.com/index.html#ws-trades-channel
         * @description get the list of most recent trades for a list of symbols
         * @param {string[]} symbols unified symbol of the market to fetch trades for
         * @param {int} [since] timestamp in ms of the earliest trade to fetch
         * @param {int} [limit] the maximum amount of trades to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
         */
        await this.loadMarkets ();
        const trades = await this.watchMultipleSymbols ('trades', 'watchTradesForSymbols', symbols, limit, params);
        if (this.newUpdates) {
            const first = this.safeDict (trades, 0);
            const tradeSymbol = this.safeString (first, 'symbol');
            limit = trades.getLimit (tradeSymbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    async watchMultipleSymbols (channelName: string, methodName: string, symbols: string[], limit: Int = undefined, params = {}) {
        await this.loadMarkets ();
        let firstMarket = undefined;
        symbols = this.marketSymbols (symbols, undefined, true, true);
        if (symbols !== undefined) {
            firstMarket = this.market (symbols[0]);
        }
        let marketType = undefined;
        [ marketType, params ] = this.handleMarketTypeAndParams (methodName, firstMarket, params);
        if (marketType === 'spot') {
            throw new NotSupported (this.id + ' ' + methodName + '() is not supported for spot markets');
        }
        // const length = symbols.length;
        // if (length > 20) {
        //     throw new NotSupported (this.id + ' ' + methodName + '() accepts a maximum of 20 symbols in one request');
        // }
        const rawSubscriptions = [];
        const messageHashes = [];
        for (let i = 0; i < symbols.length; i++) {
            const market = this.market (symbols[i]);
            const message = {
                'channel': channelName,
                'instId': market['id'],
            };
            rawSubscriptions.push (message);
            messageHashes.push (channelName + ':' + market['symbol']);
        }
        const request = {
            'op': 'subscribe',
            'args': rawSubscriptions,
        };
        const url = this.implodeHostname (this.urls['api']['ws'][marketType]['public']);
        return await this.watchMultiple (url, messageHashes, this.deepExtend (request, params), messageHashes);
    }

    handleMessage (client: Client, message) {
        //
        // message examples
        //
        // {
        //   arg: {
        //     channel: "trades",
        //     instId: "DOGE-USDT",
        //   },
        //   event: "subscribe"
        // }
        //
        //
        // {
        //   arg: {
        //     channel: "trades",
        //     instId: "DOGE-USDT",
        //   },
        //   data: [
        //     {
        //       instId: "DOGE-USDT",
        //       price: "0.08199",
        //       ...
        //     },
        //   ],
        // }
        //
        const methods = {
            'trades': this.handleWsTrades,
        };
        const event = this.safeString (message, 'event');
        if (event === 'subscribe') {
            return;
        }
        const arg = this.safeDict (message, 'arg');
        const channelName = this.safeString (arg, 'channel');
        const method = this.safeValue (methods, channelName);
        if (method) {
            method.call (this, client, message, channelName);
        }
    }

    handleWsTrades (client: Client, message, channelName: Str) {
        const data = this.safeList (message, 'data');
        //
        //  [
        //     {
        //       instId: "DOGE-USDT",
        //       tradeId: "3373545342",
        //       price: "0.08199",
        //       size: "4",
        //       side: "buy",
        //       ts: "1707486245435",
        //     }
        //  ]
        //
        if (data === undefined) {
            return;
        }
        for (let i = 0; i < data.length; i++) {
            const rawTrade = data[i];
            const trade = this.parseWsTrade (rawTrade);
            const symbol = trade['symbol'];
            let stored = this.safeValue (this.trades, symbol);
            if (stored === undefined) {
                const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
                stored = new ArrayCache (limit);
                this.trades[symbol] = stored;
            }
            stored.append (trade);
            const messageHash = channelName + ':' + symbol;
            client.resolve (stored, messageHash);
        }
    }

    parseWsTrade (trade: any, market?: MarketInterface): Trade {
        //
        //     {
        //       instId: "DOGE-USDT",
        //       tradeId: "3373545342",
        //       price: "0.08199",
        //       size: "4",
        //       side: "buy",
        //       ts: "1707486245435",
        //     }
        //
        return this.parseTrade (trade, market);
    }
}
