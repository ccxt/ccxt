
//  ---------------------------------------------------------------------------

import polymarketRest from '../polymarket.js';
import { ExchangeError, NotSupported } from '../base/errors.js';
import Client from '../base/ws/Client.js';
import type { Int, Str, Market, OrderBook, Trade, OHLCV, Dict, Strings, Ticker, Tickers } from '../base/types.js';
import { ArrayCache, ArrayCacheByTimestamp } from '../base/ws/Cache.js';

//  ---------------------------------------------------------------------------

export default class polymarket extends polymarketRest {
    override describe (): any {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchBalance': false,
                'watchBidsAsks': true,
                'watchMyTrades': false,
                'watchOHLCV': true,
                'watchOrderBook': true,
                'watchOrders': false,
                'watchPositions': false,
                'watchTicker': true,
                'watchTickers': true,
                'watchTrades': true,
                'watchTradesForSymbols': false,
                'unWatchOHLCV': true,
                'unWatchOrderBook': true,
                'unWatchTicker': true,
                'unWatchTrades': true,
            },
            'urls': {
                'api': {
                    'ws': 'wss://ws.perpetuals.polymarket.com/v1/ws',
                },
            },
            'options': {
                // the venue serves klines over ws for these intervals only, rest also has 1s
                'wsTimeframes': {
                    '1m': '1m',
                    '5m': '5m',
                    '15m': '15m',
                    '30m': '30m',
                    '1h': '1h',
                    '4h': '4h',
                    '6h': '6h',
                    '12h': '12h',
                    '1d': '1d',
                    '1w': '1w',
                },
            },
            'streaming': {
                'ping': this.ping,
                'keepAlive': 20000,
            },
        });
    }

    requestId (): number {
        const requestId = this.sum (this.safeInteger (this.options, 'requestId', 0), 1);
        this.options['requestId'] = requestId;
        return requestId;
    }

    /**
     * @method
     * @ignore
     * @name polymarket#sendSubscription
     * @description sends a subscribe or unsubscribe request and records the request id so the ack can be matched back
     * @param {string} action either 'sub' or 'unsub'
     * @param {string[]} channels venue channel names to subscribe to
     * @param {string[]} messageHashes message hashes the caller awaits
     * @param {string[]} subMessageHashes the underlying subscription hashes, used to reject or clean them when the ack fails
     * @param {object} [context] extra fields stored with the pending request, e.g. the symbol and topic for cache cleanup
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} the raw request frame to send
     */
    sendSubscription (action: string, channels: string[], messageHashes: string[], subMessageHashes: string[], context: Dict = {}, params = {}) {
        const url = this.urls['api']['ws'];
        const client = this.client (url);
        // the base watch only sends the request when one of the hashes is not
        // subscribed yet, so a pending entry is registered under the same
        // condition - otherwise no ack would ever arrive to consume it
        let willSend = false;
        for (let i = 0; i < messageHashes.length; i++) {
            if (!(messageHashes[i] in client.subscriptions)) {
                willSend = true;
            }
        }
        if (!willSend) {
            const emptyRequest: Dict = {};
            return this.extend (emptyRequest, params);
        }
        const id = this.requestId ();
        const request: Dict = {
            'id': id,
            'req': action,
            'chs': channels,
        };
        const basePending: Dict = {
            'method': action,
            'messageHashes': messageHashes,
            'subMessageHashes': subMessageHashes,
        };
        const pending: Dict = this.extend (basePending, context);
        client.subscriptions['req:' + id.toString ()] = pending;
        return this.extend (request, params);
    }

    /**
     * @method
     * @name polymarket#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.polymarket.com/perps/realtime-updates
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] not used by polymarket watchOrderBook, the channel always carries the top twenty levels
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure}
     */
    override async watchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const messageHash = 'orderbook:' + symbol;
        const channel = 'book::' + market['id'];
        const request = this.sendSubscription ('sub', [ channel ], [ messageHash ], [ messageHash ], {}, params);
        const url = this.urls['api']['ws'];
        const orderbook = await this.watch (url, messageHash, request, messageHash);
        return orderbook.limit ();
    }

    /**
     * @method
     * @name polymarket#unWatchOrderBook
     * @description unWatches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.polymarket.com/perps/realtime-updates
     * @param {string} symbol unified symbol of the market to unwatch the order book for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} status of the unwatch request
     */
    override async unWatchOrderBook (symbol: string, params = {}): Promise<any> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const subMessageHash = 'orderbook:' + symbol;
        const messageHash = 'unsubscribe:' + subMessageHash;
        const channel = 'book::' + market['id'];
        const context: Dict = {
            'topic': 'orderbook',
            'symbol': symbol,
        };
        const request = this.sendSubscription ('unsub', [ channel ], [ messageHash ], [ subMessageHash ], context, params);
        const url = this.urls['api']['ws'];
        return await this.watch (url, messageHash, request, messageHash);
    }

    handleOrderBook (client: Client, message: any) {
        //
        //     {
        //         "ch": "book::1",
        //         "ts": 1788546815589,
        //         "ets": 1788546815543,
        //         "sq": 35879871598,
        //         "data": {
        //             "a": [ [ "7715.7", "0.31631" ] ],
        //             "b": [ [ "7715.6", "7.43477" ] ]
        //         }
        //     }
        //
        // every frame is a full snapshot of the top twenty levels, deltas are never sent
        //
        const ch = this.safeString (message, 'ch', '');
        const parts = ch.split ('::');
        const marketId = this.safeString (parts, 1);
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const data = this.safeDict (message, 'data', {});
        const timestamp = this.safeInteger (message, 'ts');
        const snapshot = this.parseOrderBook (data, symbol, timestamp, 'b', 'a');
        snapshot['nonce'] = this.safeInteger (message, 'sq');
        if (!(symbol in this.orderbooks)) {
            const ob = this.orderBook (snapshot);
            this.orderbooks[symbol] = ob;
        }
        const orderbook = this.orderbooks[symbol];
        orderbook.reset (snapshot);
        const messageHash = 'orderbook:' + symbol;
        client.resolve (orderbook, messageHash);
    }

    /**
     * @method
     * @name polymarket#watchTicker
     * @description watches a price ticker, which carries the last, mark and index prices, the mid price, the open interest and the funding rate stay available on the raw frame under the info field
     * @see https://docs.polymarket.com/perps/realtime-updates
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    override async watchTicker (symbol: string, params = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const messageHash = 'ticker:' + symbol;
        const channel = 'tickers::' + market['id'];
        const request = this.sendSubscription ('sub', [ channel ], [ messageHash ], [ messageHash ], {}, params);
        const url = this.urls['api']['ws'];
        return await this.watch (url, messageHash, request, messageHash);
    }

    /**
     * @method
     * @name polymarket#unWatchTicker
     * @description unWatches the price ticker
     * @see https://docs.polymarket.com/perps/realtime-updates
     * @param {string} symbol unified symbol of the market to unwatch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} status of the unwatch request
     */
    override async unWatchTicker (symbol: string, params = {}): Promise<any> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const subMessageHash = 'ticker:' + symbol;
        const messageHash = 'unsubscribe:' + subMessageHash;
        const channel = 'tickers::' + market['id'];
        const context: Dict = {
            'topic': 'ticker',
            'symbol': symbol,
        };
        const request = this.sendSubscription ('unsub', [ channel ], [ messageHash ], [ subMessageHash ], context, params);
        const url = this.urls['api']['ws'];
        return await this.watch (url, messageHash, request, messageHash);
    }

    /**
     * @method
     * @name polymarket#watchTickers
     * @description watches price tickers for multiple markets, the venue fans the all-instruments channel out into one frame per instrument
     * @see https://docs.polymarket.com/perps/realtime-updates
     * @param {string[]} [symbols] unified symbols of the markets to fetch the ticker for, all market tickers are streamed if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    override async watchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const url = this.urls['api']['ws'];
        const messageHashes: string[] = [];
        const channels: string[] = [];
        if (symbols === undefined) {
            messageHashes.push ('tickers');
            channels.push ('tickers::all');
        } else {
            for (let i = 0; i < symbols.length; i++) {
                const market = this.market (symbols[i]);
                messageHashes.push ('ticker:' + market['symbol']);
                channels.push ('tickers::' + market['id']);
            }
        }
        const request = this.sendSubscription ('sub', channels, messageHashes, messageHashes, {}, params);
        const newTicker = await this.watchMultiple (url, messageHashes, request, messageHashes);
        if (this.newUpdates) {
            const result: Dict = {};
            result[newTicker['symbol']] = newTicker;
            return result;
        }
        return this.filterByArray (this.tickers, 'symbol', symbols);
    }

    handleTicker (client: Client, message: any) {
        //
        //     {
        //         "ch": "tickers::1",
        //         "ts": 1788546815743,
        //         "ets": 1788546815693,
        //         "sq": 35879872600,
        //         "data": {
        //             "iid": 1,
        //             "idx": "7713.6",
        //             "mark": "7715.6",
        //             "last": "7714",
        //             "mid": "7715.6",
        //             "oi": "1101.82729",
        //             "fr": "0.00000625",
        //             "nxf": 1788548400000
        //         }
        //     }
        //
        const data = this.safeDict (message, 'data', {});
        const marketId = this.safeString (data, 'iid');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const timestamp = this.safeInteger (message, 'ts');
        const ticker = this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'close': this.safeString (data, 'last'),
            'last': this.safeString (data, 'last'),
            'markPrice': this.safeString (data, 'mark'),
            'indexPrice': this.safeString (data, 'idx'),
            'info': data,
        }, market);
        this.tickers[symbol] = ticker;
        client.resolve (ticker, 'ticker:' + symbol);
        client.resolve (ticker, 'tickers');
    }

    /**
     * @method
     * @name polymarket#watchBidsAsks
     * @description watches best bids and asks for multiple markets
     * @see https://docs.polymarket.com/perps/realtime-updates
     * @param {string[]} symbols unified symbols of the markets to fetch the best bids and asks for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    override async watchBidsAsks (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols, undefined, false);
        const url = this.urls['api']['ws'];
        const messageHashes: string[] = [];
        const channels: string[] = [];
        for (let i = 0; i < symbols.length; i++) {
            const market = this.market (symbols[i]);
            messageHashes.push ('bidask:' + market['symbol']);
            channels.push ('bbo::' + market['id']);
        }
        const request = this.sendSubscription ('sub', channels, messageHashes, messageHashes, {}, params);
        const ticker = await this.watchMultiple (url, messageHashes, request, messageHashes);
        if (this.newUpdates) {
            const result: Dict = {};
            result[ticker['symbol']] = ticker;
            return result;
        }
        return this.filterByArray (this.bidsasks, 'symbol', symbols);
    }

    handleBidAsk (client: Client, message: any) {
        //
        //     {
        //         "ch": "bbo::1",
        //         "ts": 1788546815589,
        //         "ets": 1788546815543,
        //         "sq": 35879871599,
        //         "data": {
        //             "iid": 1,
        //             "bp": "7714.9",
        //             "bq": "22.96595",
        //             "ap": "7715.8",
        //             "aq": "12.9618"
        //         }
        //     }
        //
        const data = this.safeDict (message, 'data', {});
        const marketId = this.safeString (data, 'iid');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const timestamp = this.safeInteger (message, 'ts');
        const ticker = this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'bid': this.safeString (data, 'bp'),
            'bidVolume': this.safeString (data, 'bq'),
            'ask': this.safeString (data, 'ap'),
            'askVolume': this.safeString (data, 'aq'),
            'info': data,
        }, market);
        this.bidsasks[symbol] = ticker;
        client.resolve (ticker, 'bidask:' + symbol);
    }

    /**
     * @method
     * @name polymarket#watchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://docs.polymarket.com/perps/realtime-updates
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    override async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const messageHash = 'trade:' + symbol;
        const channel = 'trades::' + market['id'];
        const request = this.sendSubscription ('sub', [ channel ], [ messageHash ], [ messageHash ], {}, params);
        const url = this.urls['api']['ws'];
        const trades = await this.watch (url, messageHash, request, messageHash);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    /**
     * @method
     * @name polymarket#unWatchTrades
     * @description unWatches the trades stream
     * @see https://docs.polymarket.com/perps/realtime-updates
     * @param {string} symbol unified symbol of the market to unwatch the trades for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} status of the unwatch request
     */
    override async unWatchTrades (symbol: string, params = {}): Promise<any> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const subMessageHash = 'trade:' + symbol;
        const messageHash = 'unsubscribe:' + subMessageHash;
        const channel = 'trades::' + market['id'];
        const context: Dict = {
            'topic': 'trades',
            'symbol': symbol,
        };
        const request = this.sendSubscription ('unsub', [ channel ], [ messageHash ], [ subMessageHash ], context, params);
        const url = this.urls['api']['ws'];
        return await this.watch (url, messageHash, request, messageHash);
    }

    handleTrades (client: Client, message: any) {
        //
        //     {
        //         "ch": "trades::1",
        //         "ts": 1788546815589,
        //         "ets": 1788546815543,
        //         "sq": 35879871600,
        //         "data": {
        //             "tid": 3738280849593744,
        //             "iid": 1,
        //             "side": "long",
        //             "p": "7714",
        //             "qty": "0.00136",
        //             "ts": 1788546565789,
        //             "hash": "0x"
        //         }
        //     }
        //
        // the asyncapi spec describes the data field as an array of trade objects while typing it
        // as a single object, so both shapes are handled here
        //
        const data = this.safeValue (message, 'data');
        let rows = [];
        if (Array.isArray (data)) {
            rows = data;
        } else {
            rows.push (data);
        }
        const rowsLength = rows.length;
        if (rowsLength === 0) {
            return;
        }
        const first = this.safeDict (rows, 0, {});
        const marketId = this.safeString (first, 'iid');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        if (!(symbol in this.trades)) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            const stored = new ArrayCache (limit);
            this.trades[symbol] = stored;
        }
        const trades = this.trades[symbol];
        for (let i = 0; i < rows.length; i++) {
            const row = this.safeDict (rows, i, {});
            const trade = this.parseWsTrade (row, market);
            trades.append (trade);
        }
        const messageHash = 'trade:' + symbol;
        client.resolve (trades, messageHash);
    }

    override parseWsTrade (trade: Dict, market: Market = undefined): Trade {
        //
        //     {
        //         "tid": 3738280849593744,
        //         "iid": 1,
        //         "side": "long",
        //         "p": "7714",
        //         "qty": "0.00136",
        //         "ts": 1788546565789,
        //         "hash": "0x"
        //     }
        //
        const marketId = this.safeString (trade, 'iid');
        market = this.safeMarket (marketId, market);
        const timestamp = this.safeInteger (trade, 'ts');
        let side = this.safeStringLower (trade, 'side');
        if (side === 'long') {
            side = 'buy';
        } else if (side === 'short') {
            side = 'sell';
        }
        return this.safeTrade ({
            'id': this.safeString (trade, 'tid'),
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'order': undefined,
            'type': undefined,
            'side': side,
            'takerOrMaker': undefined,
            'price': this.safeString (trade, 'p'),
            'amount': this.safeString (trade, 'qty'),
            'cost': undefined,
            'fee': undefined,
        }, market);
    }

    /**
     * @method
     * @name polymarket#watchOHLCV
     * @description watches historical candlestick data containing the open, high, low, close price, and the volume of a market
     * @see https://docs.polymarket.com/perps/realtime-updates
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents, the 1s timeframe is not available over the websocket
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    override async watchOHLCV (symbol: string, timeframe: string = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const wsTimeframes = this.safeDict (this.options, 'wsTimeframes', {});
        const interval = this.safeString (wsTimeframes, timeframe);
        if (interval === undefined) {
            throw new NotSupported (this.id + ' watchOHLCV() does not support the ' + timeframe + ' timeframe over the websocket');
        }
        const messageHash = 'candles:' + timeframe + ':' + symbol;
        const channel = 'klines::' + market['id'] + '::' + interval;
        const request = this.sendSubscription ('sub', [ channel ], [ messageHash ], [ messageHash ], {}, params);
        const url = this.urls['api']['ws'];
        const ohlcv = await this.watch (url, messageHash, request, messageHash);
        if (this.newUpdates) {
            limit = ohlcv.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (ohlcv, since, limit, 0, true);
    }

    /**
     * @method
     * @name polymarket#unWatchOHLCV
     * @description unWatches the candlestick stream
     * @see https://docs.polymarket.com/perps/realtime-updates
     * @param {string} symbol unified symbol of the market to unwatch the candles for
     * @param {string} timeframe the length of time each candle represents
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} status of the unwatch request
     */
    override async unWatchOHLCV (symbol: string, timeframe: string = '1m', params = {}): Promise<any> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const wsTimeframes = this.safeDict (this.options, 'wsTimeframes', {});
        const interval = this.safeString (wsTimeframes, timeframe, timeframe);
        const subMessageHash = 'candles:' + timeframe + ':' + symbol;
        const messageHash = 'unsubscribe:' + subMessageHash;
        const channel = 'klines::' + market['id'] + '::' + interval;
        const context: Dict = {
            'topic': 'ohlcv',
            'symbol': symbol,
            'timeframe': timeframe,
        };
        const request = this.sendSubscription ('unsub', [ channel ], [ messageHash ], [ subMessageHash ], context, params);
        const url = this.urls['api']['ws'];
        return await this.watch (url, messageHash, request, messageHash);
    }

    handleOHLCV (client: Client, message: any) {
        //
        //     {
        //         "ch": "klines::1::1h",
        //         "ts": 1788547135685,
        //         "ets": 1788547135685,
        //         "sq": 35880657084,
        //         "data": [
        //             [ 1788537600000, "7724.9", "7724.9", "7724.2", "7724.2", "0.02872", 5 ]
        //         ]
        //     }
        //
        // only the candles touched by fresh trades are included, the array can be empty
        //
        const ch = this.safeString (message, 'ch', '');
        const parts = ch.split ('::');
        const marketId = this.safeString (parts, 1);
        const interval = this.safeString (parts, 2);
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const timeframe = this.findTimeframe (interval);
        if (timeframe === undefined) {
            return;
        }
        const rows = this.safeList (message, 'data', []);
        const rowsLength = rows.length;
        if (rowsLength === 0) {
            return;
        }
        if (!(symbol in this.ohlcvs)) {
            this.ohlcvs[symbol] = {};
        }
        if (!(timeframe in this.ohlcvs[symbol])) {
            const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
            const stored = new ArrayCacheByTimestamp (limit);
            this.ohlcvs[symbol][timeframe] = stored;
        }
        const ohlcv = this.ohlcvs[symbol][timeframe];
        for (let i = 0; i < rows.length; i++) {
            const parsed = this.parseOHLCV (rows[i], market);
            ohlcv.append (parsed);
        }
        const messageHash = 'candles:' + timeframe + ':' + symbol;
        client.resolve (ohlcv, messageHash);
    }

    handleAck (client: Client, message: any) {
        //
        // subscribe or unsubscribe acknowledgement
        //
        //     { "id": 1, "data": [ { "status": "ok" } ] }
        //     { "id": 2, "data": [ { "status": "err", "error": "invalid channel" } ] }
        //
        // ping reply
        //
        //     { "id": 99, "ts": 1788546831854, "data": { "status": "ok", "ts": 1788546831854, "sq": 35879934302 } }
        //
        const id = this.safeString (message, 'id');
        const data = this.safeValue (message, 'data');
        if (!Array.isArray (data)) {
            // post replies carry a data object, at the public stage only the ping op sends posts
            client.lastPong = this.safeInteger (message, 'ts', this.milliseconds ());
            return;
        }
        if (id === undefined) {
            return;
        }
        const key = 'req:' + id;
        const pending = this.safeDict (client.subscriptions, key);
        if (pending === undefined) {
            return;
        }
        delete client.subscriptions[key];
        const messageHashes = this.safeList (pending, 'messageHashes', []);
        const subMessageHashes = this.safeList (pending, 'subMessageHashes', []);
        let errorMessage: Str = undefined;
        for (let i = 0; i < data.length; i++) {
            const entry = this.safeDict (data, i, {});
            const status = this.safeString (entry, 'status');
            if (status === 'err') {
                errorMessage = this.safeString (entry, 'error');
            }
        }
        if (errorMessage !== undefined) {
            const error = new ExchangeError (this.id + ' ' + errorMessage);
            for (let i = 0; i < messageHashes.length; i++) {
                client.reject (error, messageHashes[i]);
                // the hash registered by the base watch call is the awaited
                // message hash, clearing it lets a later call resend - on a
                // failed unsubscribe the live subscription stays untouched
                const messageHash = messageHashes[i];
                if (messageHash in client.subscriptions) {
                    delete client.subscriptions[messageHash];
                }
            }
            return;
        }
        const action = this.safeString (pending, 'method');
        if (action === 'unsub') {
            const topic = this.safeString (pending, 'topic');
            const symbol = this.safeString (pending, 'symbol');
            if (symbol !== undefined) {
                if (topic === 'orderbook') {
                    if (symbol in this.orderbooks) {
                        delete this.orderbooks[symbol];
                    }
                } else if (topic === 'trades') {
                    if (symbol in this.trades) {
                        delete this.trades[symbol];
                    }
                } else if (topic === 'ticker') {
                    if (symbol in this.tickers) {
                        delete this.tickers[symbol];
                    }
                } else if (topic === 'ohlcv') {
                    const timeframe = this.safeString (pending, 'timeframe');
                    if ((timeframe !== undefined) && (symbol in this.ohlcvs)) {
                        if (timeframe in this.ohlcvs[symbol]) {
                            delete this.ohlcvs[symbol][timeframe];
                        }
                    }
                }
            }
            for (let i = 0; i < messageHashes.length; i++) {
                this.cleanUnsubscription (client, subMessageHashes[i], messageHashes[i]);
            }
        }
    }

    override handleMessage (client: Client, message: any) {
        const ch = this.safeString (message, 'ch');
        if (ch === undefined) {
            this.handleAck (client, message);
            return;
        }
        const parts = ch.split ('::');
        const family = this.safeString (parts, 0, '');
        const methods: Dict = {
            'book': this.handleOrderBook,
            'bbo': this.handleBidAsk,
            'trades': this.handleTrades,
            'tickers': this.handleTicker,
            'klines': this.handleOHLCV,
        };
        const method = this.safeValue (methods, family);
        if (method !== undefined) {
            method.call (this, client, message);
        }
    }

    override ping (client: Client) {
        return {
            'id': this.requestId (),
            'req': 'post',
            'op': {
                'type': 'ping',
            },
        };
    }
}
