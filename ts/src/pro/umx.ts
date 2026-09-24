
//  ---------------------------------------------------------------------------

import umxRest from '../umx.js';
import { ExchangeError } from '../base/errors.js';
import { ArrayCache } from '../base/ws/Cache.js';
import type { Dict, Int, Trade } from '../base/types.js';
import Client from '../base/ws/Client.js';

//  ---------------------------------------------------------------------------

export default class umx extends umxRest {
    override describe (): any {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchBalance': false,
                'watchBidsAsks': false,
                'watchMyTrades': false,
                'watchOHLCV': false,
                'watchOrderBook': false,
                'watchOrders': false,
                'watchPositions': false,
                'watchTicker': false,
                'watchTickers': false,
                'watchTrades': true,
                'watchTradesForSymbols': true,
                'unWatchTrades': true,
                'unWatchTradesForSymbols': true,
            },
            'urls': {
                'api': {
                    'ws': {
                        'public': 'wss://stream.umx.com/ws/public/v1/market',
                        'private': 'wss://stream.umx.com/ws/private/v2/notification',
                    },
                },
            },
            'options': {
                'tradesLimit': 1000,
            },
            'streaming': {
                // the venue probes an idle connection with a text PING after thirty
                // seconds of silence, the client side ping keeps the line busy instead
                'keepAlive': 15000,
            },
        });
    }

    /**
     * @method
     * @name umx#watchTrades
     * @description watches information on multiple trades made in a market
     * @see https://www.umx.com/docs/coin-apis/websocket-stream/public-channel/trade-channel
     * @param {string} symbol unified market symbol of the market trades were made in
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    override async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Trade[]> {
        return await this.watchTradesForSymbols ([ symbol ], since, limit, params);
    }

    /**
     * @method
     * @name umx#watchTradesForSymbols
     * @description watches information on multiple trades made in multiple markets
     * @see https://www.umx.com/docs/coin-apis/websocket-stream/public-channel/trade-channel
     * @param {string[]} symbols unified market symbols of the markets trades were made in
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    override async watchTradesForSymbols (symbols: string[], since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols, undefined, false);
        const messageHashes = [];
        const topics = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const messageHash = 'trade::' + symbol;
            if (!this.inArray (messageHash, messageHashes)) {
                messageHashes.push (messageHash);
                topics.push (this.subscriptionTopic ('trade', symbol));
            }
        }
        const url = this.urls['api']['ws']['public'];
        const message: Dict = {
            'event': 'subscribe',
            'data': topics,
        };
        const trades = await this.watchMultiple (url, messageHashes, this.deepExtend (message, params), messageHashes);
        if (this.newUpdates) {
            const first = this.safeDict (trades, 0);
            const tradeSymbol = this.safeString (first, 'symbol');
            limit = trades.getLimit (tradeSymbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    /**
     * @method
     * @name umx#unWatchTrades
     * @description unsubscribes from the trades channel of a market
     * @see https://www.umx.com/docs/coin-apis/websocket-stream/public-channel/trade-channel
     * @param {string} symbol unified market symbol of the market to stop watching the trades of
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {any} the result of the unwatch operation
     */
    override async unWatchTrades (symbol: string, params: Dict = {}): Promise<any> {
        return await this.unWatchTradesForSymbols ([ symbol ], params);
    }

    /**
     * @method
     * @name umx#unWatchTradesForSymbols
     * @description unsubscribes from the trades channel of multiple markets
     * @see https://www.umx.com/docs/coin-apis/websocket-stream/public-channel/trade-channel
     * @param {string[]} symbols unified market symbols of the markets to stop watching the trades of
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {any} the result of the unwatch operation
     */
    override async unWatchTradesForSymbols (symbols: string[], params: Dict = {}): Promise<any> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols, undefined, false);
        const subMessageHashes = [];
        const messageHashes = [];
        const topics = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const subMessageHash = 'trade::' + symbol;
            if (!this.inArray (subMessageHash, subMessageHashes)) {
                subMessageHashes.push (subMessageHash);
                messageHashes.push ('unsubscribe::trade::' + symbol);
                topics.push (this.subscriptionTopic ('trade', symbol));
            }
        }
        const url = this.urls['api']['ws']['public'];
        const message: Dict = {
            'event': 'unsubscribe',
            'data': topics,
        };
        const subscription: Dict = {
            'unsubscribe': true,
            'symbols': symbols,
            'messageHashes': messageHashes,
            'subMessageHashes': subMessageHashes,
            'topic': 'trades',
        };
        return await this.watchMultiple (url, messageHashes, this.deepExtend (message, params), messageHashes, subscription);
    }

    /**
     * @ignore
     * @method
     * @name umx#subscriptionTopic
     * @description build one entry of the data list of a subscription request
     * @param {string} stream the venue channel name, e.g. "trade"
     * @param {string} symbol unified market symbol
     * @returns {object} the topic object with the stream, businessType and venue symbol
     */
    subscriptionTopic (stream: string, symbol: string): Dict {
        const market = this.market (symbol);
        const businessTypes = this.safeDict (this.options, 'businessTypes', {});
        const businessType = this.safeString (businessTypes, market['type'], market['type']);
        return {
            'stream': stream,
            'businessType': businessType,
            'symbol': market['id'],
        };
    }

    handleTrades (client: Client, message: Dict) {
        //
        //     {
        //         "businessType": "spot",
        //         "symbol": "BTC-USDT",
        //         "stream": "trade",
        //         "data": [
        //             {
        //                 "symbol": "BTC-USDT",
        //                 "id": "1384528849",
        //                 "side": "buy",
        //                 "price": "70759.2",
        //                 "qty": "0.64353",
        //                 "time": "1773138337236"
        //             }
        //         ],
        //         "ts": 1773138337239
        //     }
        //
        const marketId = this.safeString (message, 'symbol');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        if (!(symbol in this.trades)) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            this.trades[symbol] = new ArrayCache (limit);
        }
        const tradesArray = this.trades[symbol];
        const data = this.safeList (message, 'data', []);
        const newTrades = [];
        for (let i = 0; i < data.length; i++) {
            const rawTrade = this.safeDict (data, i, {});
            const trade = this.parseTrade (rawTrade, market);
            newTrades.push (trade);
        }
        const sorted = this.sortBy (newTrades, 'timestamp');
        for (let j = 0; j < sorted.length; j++) {
            tradesArray.append (sorted[j]);
        }
        this.trades[symbol] = tradesArray;
        client.resolve (tradesArray, 'trade::' + symbol);
    }

    handleSubscriptionStatus (client: Client, message: Dict) {
        //
        //     {
        //         "event": "subscribe",
        //         "data": [
        //             {
        //                 "businessType": "spot",
        //                 "symbol": "BTC-USDT",
        //                 "stream": "trade",
        //                 "message": "...",
        //                 "code": 0
        //             }
        //         ],
        //         "ts": 1773138335728
        //     }
        //
        const event = this.safeString (message, 'event');
        const data = this.safeList (message, 'data', []);
        for (let i = 0; i < data.length; i++) {
            const entry = data[i];
            const stream = this.safeString (entry, 'stream');
            const marketId = this.safeString (entry, 'symbol');
            const symbol = this.safeSymbol (marketId);
            const messageHash = stream + '::' + symbol;
            const code = this.safeString (entry, 'code');
            if ((code !== undefined) && (code !== '0')) {
                const feedback = this.id + ' ' + this.json (entry);
                const error = new ExchangeError (feedback);
                client.reject (error, messageHash);
                client.reject (error, 'unsubscribe::' + messageHash);
            } else if (event === 'unsubscribe') {
                const unsubHash = 'unsubscribe::' + messageHash;
                const subscription = this.safeDict (client.subscriptions, unsubHash);
                if (subscription !== undefined) {
                    this.cleanCache (subscription);
                }
                this.cleanUnsubscription (client, messageHash, unsubHash);
            }
        }
    }

    async pong (client: Client, message: any) {
        // the venue speaks a text based heartbeat, see the streaming block in describe
        try {
            await client.send ('PONG');
        } catch (e) {
            this.onError (client, e);
        }
    }

    override ping (client: Client): any {
        return 'PING';
    }

    override handleMessage (client: Client, message: any) {
        if (message === 'PING') {
            this.spawn (this.pong, client, message);
            return;
        }
        if (message === 'PONG') {
            client.lastPong = this.milliseconds ();
            return;
        }
        const event = this.safeString (message, 'event');
        if ((event === 'subscribe') || (event === 'unsubscribe')) {
            this.handleSubscriptionStatus (client, message);
            return;
        }
        const stream = this.safeString (message, 'stream');
        if (stream === 'trade') {
            this.handleTrades (client, message);
        }
    }
}
