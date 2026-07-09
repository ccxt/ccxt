
//  ---------------------------------------------------------------------------

import dreamdexRest from '../dreamdex.js';
import { ArrayCacheByTimestamp, ArrayCache } from '../base/ws/Cache.js';
import type { Int, OrderBook, Trade, OHLCV, Dict } from '../base/types.js';
import Client from '../base/ws/Client.js';

//  ---------------------------------------------------------------------------

export default class dreamdex extends dreamdexRest {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchOrderBook': true,
                'watchTrades': true,
                'watchOHLCV': true,
            },
            'urls': {
                'api': {
                    'ws': 'wss://api.dreamdex.io/v0/ws/public',
                },
            },
            'streaming': {
                'ping': this.ping,
                'keepAlive': 30000,
            },
        });
    }

    ping (client: Client) {
        return { 'operation': 'ping' };
    }

    /**
     * @method
     * @name dreamdex#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://api.dreamdex.io/.well-known/async.json
     * @param {string} symbol unified market symbol
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async watchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const market = this.market (symbol);
        symbol = market['symbol'];
        const messageHash = 'orderbook:' + symbol;
        const url = this.urls['api']['ws'];
        const request: Dict = {
            'operation': 'subscribe',
            'channel': 'orderbook',
            'params': {
                'symbols': [ market['id'] ],
            },
        };
        const message = this.extend (request, params);
        const subscription: Dict = {
            'limit': limit,
        };
        const orderbook = await this.watch (url, messageHash, message, messageHash, subscription);
        return orderbook.limit ();
    }

    handleOrderBook (client: Client, message) {
        //
        // snapshot:
        //     {
        //         "channel": "orderbook",
        //         "type": "snapshot",
        //         "symbol": "SOMI:USDso",
        //         "timestamp": 1765534169841,
        //         "bids": [ { "price": "1.24", "quantity": "500" } ],
        //         "asks": [ { "price": "1.26", "quantity": "300" } ],
        //         "nonce": 42
        //     }
        //
        // update:
        //     {
        //         "channel": "orderbook",
        //         "type": "update",
        //         "symbol": "SOMI:USDso",
        //         "timestamp": 1765534169842,
        //         "bids": [ { "price": "1.24", "quantity": "0" } ],
        //         "asks": [ { "price": "1.27", "quantity": "200" } ],
        //         "nonce": 43
        //     }
        //
        const marketId = this.safeString (message, 'symbol');
        const market = this.safeMarket (marketId, undefined, ':');
        const symbol = market['symbol'];
        const timestamp = this.safeInteger (message, 'timestamp');
        const type = this.safeString (message, 'type');
        const messageHash = 'orderbook:' + symbol;
        if (!(symbol in this.orderbooks)) {
            const subscription = this.safeValue (client.subscriptions, messageHash, {});
            const limit = this.safeInteger (subscription, 'limit');
            this.orderbooks[symbol] = this.orderBook ({}, limit);
        }
        const orderbook = this.orderbooks[symbol];
        if (type === 'snapshot') {
            const snapshot = this.parseOrderBook (message, symbol, timestamp, 'bids', 'asks', 'price', 'quantity');
            orderbook.reset (snapshot);
        } else {
            const asks = this.safeList (message, 'asks', []);
            const bids = this.safeList (message, 'bids', []);
            this.handleDeltas (orderbook['asks'], asks);
            this.handleDeltas (orderbook['bids'], bids);
            orderbook['timestamp'] = timestamp;
            orderbook['datetime'] = this.iso8601 (timestamp);
        }
        orderbook['nonce'] = this.safeInteger (message, 'nonce');
        client.resolve (orderbook, messageHash);
    }

    handleDelta (bookside, delta) {
        const price = this.safeFloat (delta, 'price');
        const amount = this.safeFloat (delta, 'quantity');
        bookside.store (price, amount);
    }

    handleDeltas (bookside, deltas) {
        for (let i = 0; i < deltas.length; i++) {
            this.handleDelta (bookside, deltas[i]);
        }
    }

    /**
     * @method
     * @name dreamdex#watchTrades
     * @description watches information on multiple trades made in a market
     * @see https://api.dreamdex.io/.well-known/async.json
     * @param {string} symbol unified market symbol of the market trades were made in
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const market = this.market (symbol);
        symbol = market['symbol'];
        const messageHash = 'trades:' + symbol;
        const url = this.urls['api']['ws'];
        const request: Dict = {
            'operation': 'subscribe',
            'channel': 'trades',
            'params': {
                'symbols': [ market['id'] ],
            },
        };
        const message = this.extend (request, params);
        const trades = await this.watch (url, messageHash, message, messageHash);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (trades, symbol, since, limit, true);
    }

    handleTrades (client: Client, message) {
        //
        // snapshot:
        //     {
        //         "channel": "trades",
        //         "type": "snapshot",
        //         "symbol": "SOMI:USDso",
        //         "trades": [
        //             { "id": "t1", "timestamp": 1765534169841, "symbol": "SOMI:USDso", "side": "buy", "price": "1.25", "quantity": "100", "cost": "125" }
        //         ]
        //     }
        //
        // update:
        //     {
        //         "channel": "trades",
        //         "type": "update",
        //         "symbol": "SOMI:USDso",
        //         "trade": { "id": "t2", "timestamp": 1765534169842, "symbol": "SOMI:USDso", "side": "sell", "price": "1.24", "quantity": "50", "cost": "62" }
        //     }
        //
        const marketId = this.safeString (message, 'symbol');
        const market = this.safeMarket (marketId, undefined, ':');
        const symbol = market['symbol'];
        const type = this.safeString (message, 'type');
        if (!(symbol in this.trades)) {
            const tradesLimit = this.safeInteger (this.options, 'tradesLimit', 1000);
            this.trades[symbol] = new ArrayCache (tradesLimit);
        }
        const stored = this.trades[symbol];
        if (type === 'snapshot') {
            const trades = this.safeList (message, 'trades', []);
            for (let i = 0; i < trades.length; i++) {
                const parsed = this.parseWsTrade (trades[i], market);
                stored.append (parsed);
            }
        } else {
            const trade = this.safeDict (message, 'trade', {});
            const parsed = this.parseWsTrade (trade, market);
            stored.append (parsed);
        }
        const messageHash = 'trades:' + symbol;
        client.resolve (stored, messageHash);
    }

    parseWsTrade (trade: Dict, market = undefined): Trade {
        //
        //     { "id": "t1", "timestamp": 1765534169841, "symbol": "SOMI:USDso", "side": "buy", "price": "1.25", "quantity": "100", "cost": "125" }
        //
        const marketId = this.safeString (trade, 'symbol');
        market = this.safeMarket (marketId, market, ':');
        const timestamp = this.safeInteger (trade, 'timestamp');
        return this.safeTrade ({
            'id': this.safeString (trade, 'id'),
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'order': undefined,
            'type': undefined,
            'side': this.safeString (trade, 'side'),
            'takerOrMaker': undefined,
            'price': this.safeString (trade, 'price'),
            'amount': this.safeString (trade, 'quantity'),
            'cost': this.safeString (trade, 'cost'),
            'fee': undefined,
        }, market);
    }

    /**
     * @method
     * @name dreamdex#watchOHLCV
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://api.dreamdex.io/.well-known/async.json
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} [timeframe] the length of time each candle represents, default '1m'
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async watchOHLCV (symbol: string, timeframe: string = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const market = this.market (symbol);
        symbol = market['symbol'];
        const interval = this.safeString (this.timeframes, timeframe, timeframe);
        const messageHash = 'ohlcv:' + interval + ':' + symbol;
        const url = this.urls['api']['ws'];
        const request: Dict = {
            'operation': 'subscribe',
            'channel': 'ohlcv',
            'params': {
                'symbol': market['id'],
                'timeframe': interval,
            },
        };
        const message = this.extend (request, params);
        const ohlcv = await this.watch (url, messageHash, message, messageHash);
        if (this.newUpdates) {
            limit = ohlcv.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (ohlcv, since, limit, 0, true);
    }

    handleOHLCV (client: Client, message) {
        //
        // snapshot:
        //     {
        //         "channel": "ohlcv",
        //         "type": "snapshot",
        //         "symbol": "SOMI:USDso",
        //         "timeframe": "1m",
        //         "candles": [
        //             { "timestamp": 1765534140000, "open": "1.24", "high": "1.26", "low": "1.23", "close": "1.25", "volume": "1000" }
        //         ]
        //     }
        //
        // update:
        //     {
        //         "channel": "ohlcv",
        //         "type": "update",
        //         "symbol": "SOMI:USDso",
        //         "timeframe": "1m",
        //         "candle": { "timestamp": 1765534200000, "open": "1.25", "high": "1.27", "low": "1.24", "close": "1.26", "volume": "500" }
        //     }
        //
        const marketId = this.safeString (message, 'symbol');
        const market = this.safeMarket (marketId, undefined, ':');
        const symbol = market['symbol'];
        const interval = this.safeString (message, 'timeframe');
        const timeframe = this.findTimeframe (interval);
        const type = this.safeString (message, 'type');
        this.ohlcvs[symbol] = this.safeDict (this.ohlcvs, symbol, {});
        let stored = this.safeValue (this.ohlcvs[symbol], timeframe);
        if (stored === undefined) {
            const ohlcvLimit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
            stored = new ArrayCacheByTimestamp (ohlcvLimit);
            this.ohlcvs[symbol][timeframe] = stored;
        }
        if (type === 'snapshot') {
            const candles = this.safeList (message, 'candles', []);
            for (let i = 0; i < candles.length; i++) {
                const parsed = this.parseOHLCV (candles[i], market);
                stored.append (parsed);
            }
        } else {
            const candle = this.safeDict (message, 'candle', {});
            const parsed = this.parseOHLCV (candle, market);
            stored.append (parsed);
        }
        const messageHash = 'ohlcv:' + interval + ':' + symbol;
        client.resolve (stored, messageHash);
    }

    handleMessage (client: Client, message) {
        const operation = this.safeString (message, 'operation');
        if (operation === 'pong') {
            client.lastPong = this.milliseconds ();
            return;
        }
        const type = this.safeString (message, 'type');
        if (type === 'subscribed') {
            return;
        }
        const channel = this.safeString (message, 'channel');
        const methods: Dict = {
            'orderbook': this.handleOrderBook,
            'trades': this.handleTrades,
            'ohlcv': this.handleOHLCV,
        };
        const method = this.safeValue (methods, channel);
        if (method !== undefined) {
            method.call (this, client, message);
        }
    }
}
