
//  ---------------------------------------------------------------------------

import blofinRest from '../blofin.js';
import { NotSupported } from '../base/errors.js';
import { ArrayCache } from '../base/ws/Cache.js';
import type { Int, MarketInterface, Trade, OrderBook, Str } from '../base/types.js';
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
                // orderbook channel can be one from:
                //  - "books": 200 depth levels will be pushed in the initial full snapshot. Incremental data will be pushed every 100 ms for the changes in the order book during that period of time.
                //  - "books5": 5 depth levels snapshot will be pushed every time. Snapshot data will be pushed every 100 ms when there are changes in the 5 depth levels snapshot.
                'watchOrderBook': {
                    'channel': 'books',
                },
                'watchOrderBookForSymbols': {
                    'channel': 'books',
                },
            },
        });
    }

    async watchMultipleSymbols (channelName: string, methodName: string, symbols: string[], limit: Int = undefined, params = {}) {
        // underlier method for all watch-multiple symbols
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
        // incoming data updates' examples can be seen under each handler method
        //
        const methods = {
            'trades': this.handleWsTrades,
            'books': this.handleWsOrderBook,
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

    handleParam (params: object, optionName: string, defaultValue = undefined) {
        const value = this.safeValue (params, optionName, defaultValue);
        if (value !== undefined) {
            params = this.omit (params, optionName);
        }
        return [ value, params ];
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
        params['callerMethodName'] = 'watchTrades';
        return await this.watchTradesForSymbols ([ symbol ], since, limit, params);
    }

    async watchTradesForSymbols (symbols: string[], since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        /**
         * @method
         * @name blofin#watchTradesForSymbols
         * @see https://docs.blofin.com/index.html#ws-trades-channel
         * @description get the list of most recent trades for a list of symbols
         * @param {string[]} symbols unified symbol of the market to fetch trades for
         * @param {int} [since] timestamp in ms of the earliest trade to fetch
         * @param {int} [limit] the maximum amount of trades to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
         */
        await this.loadMarkets ();
        let callerMethodName = undefined;
        [ callerMethodName, params ] = this.handleParam (params, 'callerMethodName', 'watchTradesForSymbols');
        const trades = await this.watchMultipleSymbols ('trades', callerMethodName, symbols, limit, params);
        if (this.newUpdates) {
            const first = this.safeDict (trades, 0);
            const tradeSymbol = this.safeString (first, 'symbol');
            limit = trades.getLimit (tradeSymbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    handleWsTrades (client: Client, message, channelName: Str) {
        const data = this.safeList (message, 'data');
        //
        //     {
        //       arg: {
        //         channel: "trades",
        //         instId: "DOGE-USDT",
        //       },
        //       data : [
        //         {
        //           instId: "DOGE-USDT",
        //           tradeId: "3373545342",
        //           price: "0.08199",
        //           size: "4",
        //           side: "buy",
        //           ts: "1707486245435",
        //         },
        //         ...
        //       ]
        //     }
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

    async watchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        /**
         * @method
         * @name blofin#watchOrderBook
         * @see https://docs.blofin.com/index.html#ws-order-book-channel
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @see https://www.bitget.com/api-doc/spot/websocket/public/Depth-Channel
         * @see https://www.bitget.com/api-doc/contract/websocket/public/Order-Book-Channel
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int} [limit] the maximum amount of order book entries to return
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        params['callerMethodName'] = 'watchOrderBook';
        return await this.watchOrderBookForSymbols ([ symbol ], limit, params);
    }

    async watchOrderBookForSymbols (symbols: string[], limit: Int = undefined, params = {}): Promise<OrderBook> {
        /**
         * @method
         * @name blofin#watchOrderBookForSymbols
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @see https://docs.blofin.com/index.html#ws-order-book-channel
         * @param {string[]} symbols unified array of symbols
         * @param {int} [limit] the maximum amount of order book entries to return
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.depth] the type of order book to subscribe to, default is 'depth/increase100', also accepts 'depth5' or 'depth20' or depth50
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        let callerMethodName = undefined;
        [ callerMethodName, params ] = this.handleParam (params, 'callerMethodName', 'watchOrderBookForSymbols');
        let channelName = undefined;
        [ channelName, params ] = this.handleOptionAndParams (params, callerMethodName, 'channel', 'books');
        // due to some problem, temporarily disable other channels
        if (channelName !== 'books') {
            throw new NotSupported (this.id + ' ' + callerMethodName + '() at this moment ' + channelName + ' is not supported, coming soon');
        }
        const orderbook = await this.watchMultipleSymbols (channelName, callerMethodName, symbols, limit, params);
        return orderbook.limit ();
    }

    handleWsOrderBook (client: Client, message, channelName: Str) {
        //
        //   {
        //     arg: {
        //         channel: "books",
        //         instId: "DOGE-USDT",
        //     },
        //     action: "snapshot", // can be 'snapshot' or 'update'
        //     data: {
        //         asks: [   [ 0.08096, 1 ], [ 0.08097, 123 ], ...   ],
        //         bids: [   [ 0.08095, 4 ], [ 0.08094, 237 ], ...   ],
        //         ts: "1707491587909",
        //         prevSeqId: "0", // in case of 'update' there will be some value, less then seqId
        //         seqId: "3374250786",
        //     },
        // }
        //
        const arg = this.safeDict (message, 'arg');
        const marketId = this.safeString (arg, 'instId');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const messageHash = channelName + ':' + symbol;
        let orderbook = this.safeDict (this.orderbooks, symbol);
        if (orderbook === undefined) {
            orderbook = this.orderBook ();
        }
        const data = this.safeDict (message, 'data');
        const timestamp = this.safeInteger (data, 'ts');
        const action = this.safeString (message, 'action');
        if (action === 'snapshot') {
            const orderBookSnapshot = this.parseOrderBook (data, symbol, timestamp);
            orderBookSnapshot['nonce'] = this.safeInteger (data, 'seqId');
            orderbook.reset (orderBookSnapshot);
            this.orderbooks[symbol] = orderbook;
            client.resolve (orderbook, messageHash);
        } else {
            // temp
        }
    }
}
