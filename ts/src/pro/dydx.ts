
//  ---------------------------------------------------------------------------

import dydxRest from '../dydx.js';
import { ArrayCache, ArrayCacheByTimestamp } from '../base/ws/Cache.js';
import type { Int, Trade, Dict, OrderBook, OHLCV } from '../base/types.js';
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
                'watchOrderBook': true,
                'watchOHLCV': true,
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

    /**
     * @method
     * @name dydx#unWatchTrades
     * @description unsubscribes from the trades channel
     * @see https://docs.dydx.xyz/indexer-client/websockets#trades
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    async unWatchTrades (symbol: string, params = {}): Promise<any> {
        await this.loadMarkets ();
        const url = this.urls['api']['ws'];
        const market = this.market (symbol);
        const messageHash = 'trade:' + market['symbol'];
        const request: Dict = {
            'type': 'unsubscribe',
            'channel': 'v4_trades',
            'id': market['id'],
        };
        return await this.watch (url, messageHash, this.extend (request, params), messageHash);
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
        //                 "createdAt": "2025-08-04T00:42:07.119Z",
        //                 "createdAtHeight": "45487245"
        //             }
        //         ]
        //     }
        // }
        //
        const marketId = this.safeString (message, 'id');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const content = this.safeDict (message, 'contents');
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
        //     "id": "02b6148d0000000200000003",
        //     "side": "BUY",
        //     "size": "0.024",
        //     "price": "114581",
        //     "type": "LIMIT",
        //     "createdAt": "2025-08-04T00:42:07.118Z",
        //     "createdAtHeight": "45487244"
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

    /**
     * @method
     * @name dydx#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.dydx.xyz/indexer-client/websockets#orders
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure} indexed by market symbols
     */
    async watchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const url = this.urls['api']['ws'];
        const market = this.market (symbol);
        const messageHash = 'orderbook:' + market['symbol'];
        const request: Dict = {
            'type': 'subscribe',
            'channel': 'v4_orderbook',
            'id': market['id'],
        };
        const orderbook = await this.watch (url, messageHash, this.extend (request, params), messageHash);
        return orderbook.limit ();
    }

    /**
     * @method
     * @name dydx#unWatchOrderBook
     * @description unWatches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.dydx.xyz/indexer-client/websockets#orders
     * @param {string} symbol unified array of symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure} indexed by market symbols
     */
    async unWatchOrderBook (symbol: string, params = {}): Promise<any> {
        await this.loadMarkets ();
        const url = this.urls['api']['ws'];
        const market = this.market (symbol);
        const messageHash = 'orderbook:' + market['symbol'];
        const request: Dict = {
            'type': 'unsubscribe',
            'channel': 'v4_orderbook',
            'id': market['id'],
        };
        return await this.watch (url, messageHash, this.extend (request, params), messageHash);
    }

    handleOrderBook (client: Client, message) {
        //
        // {
        //     "type": "subscribed",
        //     "connection_id": "7af140fb-b33d-4f0e-8f4c-30f16337b360",
        //     "message_id": 1,
        //     "channel": "v4_orderbook",
        //     "id": "BTC-USD",
        //     "contents": {
        //         "bids": [
        //             {
        //                 "price": "114623",
        //                 "size": "0.1112"
        //             }
        //         ],
        //         "asks": [
        //             {
        //                 "price": "114624",
        //                 "size": "0.0872"
        //             }
        //         ]
        //     }
        // }
        //
        const marketId = this.safeString (message, 'id');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const content = this.safeDict (message, 'contents');
        let orderbook = this.safeValue (this.orderbooks, symbol);
        if (orderbook === undefined) {
            orderbook = this.orderBook ();
        }
        orderbook['symbol'] = symbol;
        const asks = this.safeList (content, 'asks', []);
        const bids = this.safeList (content, 'bids', []);
        this.handleDeltas (orderbook['asks'], asks);
        this.handleDeltas (orderbook['bids'], bids);
        orderbook['nonce'] = this.safeInteger (message, 'message_id');
        const messageHash = 'orderbook:' + symbol;
        this.orderbooks[symbol] = orderbook;
        client.resolve (orderbook, messageHash);
    }

    handleDelta (bookside, delta) {
        if (Array.isArray (delta)) {
            const price = this.safeFloat (delta, 0);
            const amount = this.safeFloat (delta, 1);
            bookside.store (price, amount);
        } else {
            const bidAsk = this.parseBidAsk (delta, 'price', 'size');
            bookside.storeArray (bidAsk);
        }
    }

    /**
     * @method
     * @name dydx#watchOHLCV
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://docs.dydx.xyz/indexer-client/websockets#candles
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async watchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        await this.loadMarkets ();
        const url = this.urls['api']['ws'];
        const market = this.market (symbol);
        const messageHash = 'ohlcv:' + market['symbol'];
        const resolution = this.safeString (this.timeframes, timeframe, timeframe);
        const request: Dict = {
            'type': 'subscribe',
            'channel': 'v4_candles',
            'id': market['id'] + '/' + resolution,
        };
        const ohlcv = await this.watch (url, messageHash, this.extend (request, params), messageHash);
        if (this.newUpdates) {
            limit = ohlcv.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (ohlcv, since, limit, 0, true);
    }

    /**
     * @method
     * @name dydx#unWatchOHLCV
     * @description unWatches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://docs.dydx.xyz/indexer-client/websockets#candles
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {object} [params.timezone] if provided, kline intervals are interpreted in that timezone instead of UTC, example '+08:00'
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async unWatchOHLCV (symbol: string, timeframe = '1m', params = {}): Promise<any> {
        await this.loadMarkets ();
        const url = this.urls['api']['ws'];
        const market = this.market (symbol);
        const messageHash = 'ohlcv:' + market['symbol'];
        const resolution = this.safeString (this.timeframes, timeframe, timeframe);
        const request: Dict = {
            'type': 'unsubscribe',
            'channel': 'v4_candles',
            'id': market['id'] + '/' + resolution,
        };
        return await this.watch (url, messageHash, this.extend (request, params), messageHash);
    }

    handleOHLCV (client: Client, message) {
        //
        // {
        //     "type": "subscribed",
        //     "connection_id": "e00b6e27-590c-4e91-a24d-b0645289434b",
        //     "message_id": 1,
        //     "channel": "v4_candles",
        //     "id": "BTC-USD/1MIN",
        //     "contents": {
        //         "candles": [
        //             {
        //                 "startedAt": "2025-08-05T03:40:00.000Z",
        //                 "ticker": "BTC-USD",
        //                 "resolution": "1MIN",
        //                 "low": "114249",
        //                 "high": "114256",
        //                 "open": "114256",
        //                 "close": "114249",
        //                 "baseTokenVolume": "0.4726",
        //                 "usdVolume": "53996.1818",
        //                 "trades": 7,
        //                 "startingOpenInterest": "501.7424",
        //                 "orderbookMidPriceOpen": "114255.5",
        //                 "orderbookMidPriceClose": "114255.5"
        //             }
        //         ]
        //     }
        // }
        // {
        //     "type": "channel_data",
        //     "connection_id": "e00b6e27-590c-4e91-a24d-b0645289434b",
        //     "message_id": 3,
        //     "id": "BTC-USD/1MIN",
        //     "channel": "v4_candles",
        //     "version": "1.0.0",
        //     "contents": {
        //         "startedAt": "2025-08-05T03:40:00.000Z",
        //         "ticker": "BTC-USD",
        //         "resolution": "1MIN",
        //         "low": "114249",
        //         "high": "114262",
        //         "open": "114256",
        //         "close": "114261",
        //         "baseTokenVolume": "0.4753",
        //         "usdVolume": "54304.6873",
        //         "trades": 9,
        //         "startingOpenInterest": "501.7424",
        //         "orderbookMidPriceOpen": "114255.5",
        //         "orderbookMidPriceClose": "114255.5"
        //     }
        // }
        //
        const id = this.safeString (message, 'id');
        const part = id.split ('/');
        const interval = this.safeString (part, 1);
        const timeframe = this.findTimeframe (interval);
        const marketId = this.safeString (part, 0);
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const content = this.safeDict (message, 'contents');
        const candles = this.safeList (content, 'candles');
        const messageHash = 'ohlcv:' + symbol;
        const ohlcv = this.safeDict (candles, 0, content);
        const parsed = this.parseOHLCV (ohlcv, market);
        this.ohlcvs[symbol] = this.safeValue (this.ohlcvs, symbol, {});
        let stored = this.safeValue (this.ohlcvs[symbol], timeframe);
        if (stored === undefined) {
            const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
            stored = new ArrayCacheByTimestamp (limit);
            this.ohlcvs[symbol][timeframe] = stored;
        }
        stored.append (parsed);
        client.resolve (stored, messageHash);
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
                'v4_orderbook': this.handleOrderBook,
                'v4_candles': this.handleOHLCV,
            };
            const method = this.safeValue (methods, topic);
            if (method !== undefined) {
                method.call (this, client, message);
            }
        }
    }
}
