// LMEX Pro (WebSocket) connector for CCXT Pro
// Extends the base LMEX REST connector with real-time WebSocket streams
//
// Futures WS: wss://ws.lmex.io/ws/oss/futures
// Spot WS:    wss://ws.lmex.io/ws/oss/spot
// Requires:   Origin: https://lmex.io  header
//
// Subscribe format:  {"op": "subscribe",   "args": ["channel:SYMBOL"]}
// Unsubscribe:       {"op": "unsubscribe", "args": ["channel:SYMBOL"]}
// Ping:              {"op": "ping"}
// Pong response:     {"op": "pong"}
//
// Public channels:
//   update:{symbol}          — ticker (price, best bid/ask, 24h stats)
//   snapshotL2:{symbol}      — full order book snapshot + delta updates
//   tradeHistoryApi:{symbol} — public trades
//   ohlcv:{symbol}:{res}     — OHLCV candles (res = 1,5,15,30,60,240,1440…)
//
// Authenticated channels (login required before subscribe):
//   notificationApiV2        — orders, fills, positions updates

import lmexRest from '../lmex.js';
import { AuthenticationError } from '../base/errors.js';
import { ArrayCache, ArrayCacheByTimestamp, ArrayCacheBySymbolById } from '../base/ws/Cache.js';
import type {
    Balances, Dict, Int, Market, OHLCV, Order, OrderBook,
    Position, Str, Strings, Ticker, Tickers, Trade,
} from '../base/types.js';
import Client from '../base/ws/Client.js';
import { sha384 } from '../static_dependencies/noble-hashes/sha512.js';

/**
 * @class lmex
 * @augments lmexRest
 */
export default class lmex extends lmexRest {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'has': {
                'watchBalance': true,
                'watchMyTrades': true,
                'watchOHLCV': true,
                'watchOrderBook': true,
                'watchOrders': true,
                'watchPosition': true,
                'watchPositions': true,
                'watchTicker': true,
                'watchTickers': true,
                'watchTrades': true,
            },
            'urls': {
                'api': {
                    'ws': {
                        'futures': 'wss://ws.lmex.io/ws/oss/futures',
                        'spot': 'wss://ws.lmex.io/ws/oss/spot',
                    },
                },
            },
            'options': {
                'watchOrderBook': {
                    'depth': 25,
                },
                'OHLCVLimit': 1000,
                'tradesLimit': 1000,
                'ordersLimit': 1000,
                'pingInterval': 20000,
            },
        });
    }

    /**
     * @ignore
     * @method
     * @description returns the WebSocket URL for a given market
     */
    wsUrl (market: Market): string {
        const wsApi = this.safeValue (this.safeValue (this.urls, 'api'), 'ws', {});
        let wsUrl = this.safeString (wsApi, 'futures');
        if (market['spot']) {
            wsUrl = this.safeString (wsApi, 'spot');
        }
        return wsUrl;
    }

    /**
     * @ignore
     * @method
     * @description returns WebSocket connection options including the required Origin header
     */
    wsOptions (): Dict {
        return {
            'headers': { 'Origin': 'https://lmex.io' },
        };
    }

    /**
     * @ignore
     * @method
     * @description authenticates the WebSocket connection for private channels
     */
    async authenticate (url: string): Promise<any> {
        const client = this.client (url);
        const messageHash = 'authenticated';
        const future = client.future (messageHash);
        const authenticated = this.safeValue (client.subscriptions, messageHash);
        if (!authenticated) {
            const nonce = this.nonce ().toString ();
            const path = '/notificationApiV2';
            const signature = this.hmac (
                this.encode (path + nonce),
                this.encode (this.secret),
                sha384,
                'hex'
            );
            const request: Dict = {
                'op': 'login',
                'args': [ this.apiKey, nonce, signature ],
            };
            this.watch (url, messageHash, request, messageHash);
        }
        return future;
    }

    /**
     * @method
     * @name lmex#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://docs.lmex.io
     * @param {string} symbol unified symbol of the market to watch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)
     */
    async watchTicker (symbol: string, params = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const url = this.wsUrl (market);
        const channel = 'update:' + market['id'];
        const messageHash = 'ticker:' + symbol;
        const request: Dict = {
            'op': 'subscribe',
            'args': [ channel ],
        };
        return await this.watch (url, messageHash, request, channel, params) as Ticker;
    }

    /**
     * @method
     * @name lmex#watchTickers
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @see https://docs.lmex.io
     * @param {string[]} [symbols] unified symbols of the markets to watch the tickers for, watches all markets if unset
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures](https://docs.ccxt.com/#/?id=ticker-structure)
     */
    async watchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const wsApi = this.safeValue (this.safeValue (this.urls, 'api'), 'ws', {});
        const futuresUrl = this.safeString (wsApi, 'futures');
        const spotUrl = this.safeString (wsApi, 'spot');
        const futuresArgs = [];
        const spotArgs = [];
        let allSymbols = [];
        if (symbols !== undefined) {
            allSymbols = symbols;
        }
        for (let i = 0; i < allSymbols.length; i++) {
            const symbol = allSymbols[i];
            const market = this.market (symbol);
            const channel = 'update:' + market['id'];
            if (market['spot']) {
                spotArgs.push (channel);
            } else {
                futuresArgs.push (channel);
            }
        }
        if (futuresArgs.length) {
            const request: Dict = { 'op': 'subscribe', 'args': futuresArgs };
            this.watch (futuresUrl, 'tickers', request, 'tickers', params);
        }
        if (spotArgs.length) {
            const request: Dict = { 'op': 'subscribe', 'args': spotArgs };
            this.watch (spotUrl, 'tickers', request, 'tickers', params);
        }
        // Await the primary URL (futures for swap/mixed, spot if spot-only)
        let primaryUrl = futuresUrl;
        if ((spotArgs.length > 0) && (futuresArgs.length === 0)) {
            primaryUrl = spotUrl;
        }
        await this.watch (primaryUrl, 'tickers', {}, 'tickers', params);
        return this.filterByArrayTickers (this.tickers, 'symbol', symbols, false);
    }

    /**
     * @ignore
     * @method
     * @description handles incoming ticker messages from the WebSocket
     */
    handleTicker (client: Client, message: Dict): void {
        const topic = this.safeString (message, 'topic', '');
        const parts = topic.split (':');
        const marketId = this.safeString (parts, 1);
        const data = this.safeValue (message, 'data', {});
        const market = this.safeMarket (marketId !== undefined ? marketId : this.safeString (data, 'symbol'));
        const ticker = this.parseTicker (data, market);
        const symbol = ticker['symbol'];
        this.tickers[symbol] = ticker;
        client.resolve (ticker, 'ticker:' + symbol);
        client.resolve (this.tickers, 'tickers');
    }

    /**
     * @method
     * @name lmex#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.lmex.io
     * @param {string} symbol unified symbol of the market to watch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols
     */
    async watchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const url = this.wsUrl (market);
        const channel = 'snapshotL2:' + market['id'];
        const messageHash = 'orderbook:' + symbol;
        const request: Dict = {
            'op': 'subscribe',
            'args': [ channel ],
        };
        const orderbook = await this.watch (url, messageHash, request, channel, params);
        return (orderbook as any).limit ();
    }

    /**
     * @ignore
     * @method
     * @description handles incoming order book messages from the WebSocket
     */
    handleOrderBook (client: Client, message: Dict): void {
        const topic = this.safeString (message, 'topic', '');
        const parts = topic.split (':');
        const marketId = this.safeString (parts, 1);
        const data = this.safeValue (message, 'data', {});
        const market = this.safeMarket (marketId !== undefined ? marketId : this.safeString (data, 'symbol'));
        const symbol = market['symbol'];
        const seqNum = this.safeInteger (data, 'seqNum', 0);
        const isSnap = (this.safeString (data, 'type') === 'snapshot') || (this.safeValue (this.orderbooks, symbol) === undefined);
        if (isSnap) {
            this.orderbooks[symbol] = this.indexedOrderBook ({});
        }
        const orderbook = this.orderbooks[symbol];
        const rawBids = this.safeList (data, 'bids', []);
        const rawAsks = this.safeList (data, 'asks', []);
        this.handleDeltas (orderbook['bids'], rawBids);
        this.handleDeltas (orderbook['asks'], rawAsks);
        orderbook['timestamp'] = this.safeInteger (data, 'timestamp');
        orderbook['datetime'] = this.iso8601 (orderbook['timestamp']);
        orderbook['nonce'] = seqNum;
        orderbook['symbol'] = symbol;
        client.resolve (orderbook, 'orderbook:' + symbol);
    }

    /**
     * @ignore
     * @method
     * @description applies a single order book delta to a bookside
     */
    handleDelta (bookside: any, delta: any[]): void {
        const price = this.safeNumber (delta, 0);
        const amount = this.safeNumber (delta, 1);
        bookside.store (price, amount);
    }

    /**
     * @ignore
     * @method
     * @description applies a list of order book deltas to a bookside
     */
    handleDeltas (bookside: any, deltas: any[]): void {
        for (let i = 0; i < deltas.length; i++) {
            this.handleDelta (bookside, deltas[i]);
        }
    }

    /**
     * @method
     * @name lmex#watchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://docs.lmex.io
     * @param {string} symbol unified symbol of the market to watch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to watch
     * @param {int} [limit] the maximum number of trades to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)
     */
    async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const url = this.wsUrl (market);
        const channel = 'tradeHistoryApi:' + market['id'];
        const messageHash = 'trades:' + symbol;
        const request: Dict = {
            'op': 'subscribe',
            'args': [ channel ],
        };
        const trades = await this.watch (url, messageHash, request, channel, params);
        if (this.newUpdates) {
            limit = (trades as any).getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades as Trade[], since, limit, 'timestamp', true);
    }

    /**
     * @ignore
     * @method
     * @description handles incoming public trade messages from the WebSocket
     */
    handleTrades (client: Client, message: Dict): void {
        const topic = this.safeString (message, 'topic', '');
        const topicParts = topic.split (':');
        const data = this.safeValue (message, 'data', {});
        const fills = this.safeList (data, 'trades', [ data ]);
        let marketId = this.safeString (topicParts, 1);
        if (!marketId) {
            marketId = this.safeString (data, 'symbol');
        }
        if (!marketId) {
            marketId = this.safeString (fills[0], 'symbol');
        }
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        if (this.safeValue (this.trades, symbol) === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            this.trades[symbol] = new ArrayCache (limit);
        }
        const stored = this.trades[symbol];
        for (let i = 0; i < fills.length; i++) {
            const trade = this.parseTrade (fills[i], market);
            stored.append (trade);
        }
        client.resolve (stored, 'trades:' + symbol);
    }

    /**
     * @method
     * @name lmex#watchOHLCV
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://docs.lmex.io
     * @param {string} symbol unified symbol of the market to watch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to watch
     * @param {int} [limit] the maximum amount of candles to watch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async watchOHLCV (symbol: string, timeframe: string = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const url = this.wsUrl (market);
        const resolution = this.safeString (this.timeframes, timeframe, '1');
        const channel = 'ohlcv:' + market['id'] + ':' + resolution;
        const messageHash = 'ohlcv:' + symbol + ':' + timeframe;
        const request: Dict = {
            'op': 'subscribe',
            'args': [ channel ],
        };
        const ohlcvs = await this.watch (url, messageHash, request, channel, params);
        if (this.newUpdates) {
            limit = (ohlcvs as any).getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (ohlcvs as OHLCV[], since, limit, 0, true);
    }

    /**
     * @ignore
     * @method
     * @description handles incoming OHLCV messages from the WebSocket
     */
    handleOHLCV (client: Client, message: Dict): void {
        const topic = this.safeString (message, 'topic', '');
        // topic format: ohlcv:BTC-PERP:60
        const parts = topic.split (':');
        const marketId = this.safeString (parts, 1);
        const res = this.safeString (parts, 2, '1');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        // Find timeframe key from resolution number
        const timeframeKeys = Object.keys (this.timeframes);
        let timeframe = '1m';
        for (let i = 0; i < timeframeKeys.length; i++) {
            const tf = timeframeKeys[i];
            if (this.safeString (this.timeframes, tf) === res) {
                timeframe = tf;
                break;
            }
        }
        const messageHash = 'ohlcv:' + symbol + ':' + timeframe;
        this.ohlcvs[symbol] = this.safeValue (this.ohlcvs, symbol, {});
        let stored = this.safeValue (this.ohlcvs[symbol], timeframe);
        if (stored === undefined) {
            const ohlcvLimit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
            stored = new ArrayCacheByTimestamp (ohlcvLimit);
            this.ohlcvs[symbol][timeframe] = stored;
        }
        const data = this.safeValue (message, 'data', {});
        const parsed = [
            this.safeTimestamp (data, 'time'),
            this.safeNumber (data, 'open'),
            this.safeNumber (data, 'high'),
            this.safeNumber (data, 'low'),
            this.safeNumber (data, 'close'),
            this.safeNumber (data, 'volume'),
        ];
        stored.append (parsed);
        client.resolve (stored, messageHash);
    }

    /**
     * @method
     * @name lmex#watchOrders
     * @description watches information on multiple orders made by the user
     * @see https://docs.lmex.io
     * @param {string} [symbol] unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to watch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)
     */
    async watchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        const wsApi = this.safeValue (this.safeValue (this.urls, 'api'), 'ws', {});
        const url = this.safeString (wsApi, 'futures');
        await this.authenticate (url);
        const channel = 'notificationApiV2';
        let messageHash = 'orders';
        if (symbol !== undefined) {
            messageHash = 'orders:' + symbol;
        }
        const request: Dict = {
            'op': 'subscribe',
            'args': [ channel ],
        };
        const orders = await this.watch (url, messageHash, request, channel, params);
        if (this.newUpdates) {
            limit = (orders as any).getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (orders as Order[], symbol, since, limit, true);
    }

    /**
     * @method
     * @name lmex#watchMyTrades
     * @description watches information on multiple trades made by the user
     * @see https://docs.lmex.io
     * @param {string} [symbol] unified market symbol of the market the trades were made in
     * @param {int} [since] the earliest time in ms to watch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)
     */
    async watchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const wsApi = this.safeValue (this.safeValue (this.urls, 'api'), 'ws', {});
        const url = this.safeString (wsApi, 'futures');
        await this.authenticate (url);
        const channel = 'notificationApiV2';
        let messageHash = 'myTrades';
        if (symbol !== undefined) {
            messageHash = 'myTrades:' + symbol;
        }
        const request: Dict = {
            'op': 'subscribe',
            'args': [ channel ],
        };
        const trades = await this.watch (url, messageHash, request, channel, params);
        if (this.newUpdates) {
            limit = (trades as any).getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (trades as Trade[], symbol, since, limit, true);
    }

    /**
     * @method
     * @name lmex#watchBalance
     * @description watch balance and get the amount of funds available for trading or funds locked in orders
     * @see https://docs.lmex.io
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)
     */
    async watchBalance (params = {}): Promise<Balances> {
        const wsApi = this.safeValue (this.safeValue (this.urls, 'api'), 'ws', {});
        const url = this.safeString (wsApi, 'futures');
        await this.authenticate (url);
        const channel = 'notificationApiV2';
        const request: Dict = { 'op': 'subscribe', 'args': [ channel ] };
        return await this.watch (url, 'balance', request, channel, params) as Balances;
    }

    /**
     * @method
     * @name lmex#watchPositions
     * @description watch all open positions
     * @see https://docs.lmex.io
     * @param {string[]} [symbols] list of unified market symbols
     * @param {int} [since] the earliest time in ms to watch positions for
     * @param {int} [limit] the maximum number of position structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structures](https://docs.ccxt.com/#/?id=position-structure)
     */
    async watchPositions (symbols: Strings = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Position[]> {
        await this.loadMarkets ();
        const wsApi = this.safeValue (this.safeValue (this.urls, 'api'), 'ws', {});
        const url = this.safeString (wsApi, 'futures');
        await this.authenticate (url);
        const channel = 'notificationApiV2';
        const messageHash = 'positions';
        const request: Dict = { 'op': 'subscribe', 'args': [ channel ] };
        const positions = await this.watch (url, messageHash, request, channel, params);
        return this.filterBySymbolsSinceLimit (positions as Position[], symbols, since, limit, true);
    }

    /**
     * @ignore
     * @method
     * @description dispatches incoming notificationApiV2 messages to the right handler
     */
    handleNotification (client: Client, message: Dict): void {
        const data = this.safeValue (message, 'data', {});
        const type = this.safeString (data, 'type');
        if (type === 'ORDER_UPDATE' || type === 'ORDER_FILLED') {
            this.handleOrderUpdate (client, data);
        } else if (type === 'TRADE_UPDATE' || type === 'FILL') {
            this.handleMyTradeUpdate (client, data);
        } else if (type === 'POSITION_UPDATE') {
            this.handlePositionUpdate (client, data);
        } else if (type === 'ACCOUNT_UPDATE' || type === 'BALANCE_UPDATE') {
            this.handleBalanceUpdate (client, data);
        }
    }

    /**
     * @ignore
     * @method
     * @description handles an order update from the private notification channel
     */
    handleOrderUpdate (client: Client, data: Dict): void {
        const order = this.parseOrder (data);
        const symbol = order['symbol'];
        if (!this.orders) {
            const cacheLimit = this.safeInteger (this.options, 'ordersLimit', 1000);
            this.orders = new ArrayCacheBySymbolById (cacheLimit);
        }
        this.orders.append (order);
        client.resolve (this.orders, 'orders');
        if (symbol) {
            client.resolve (this.orders, 'orders:' + symbol);
        }
    }

    /**
     * @ignore
     * @method
     * @description handles a private trade (fill) update from the notification channel
     */
    handleMyTradeUpdate (client: Client, data: Dict): void {
        const trade = this.parseTrade (data);
        const symbol = trade['symbol'];
        if (!this.myTrades) {
            const cacheLimit = this.safeInteger (this.options, 'tradesLimit', 1000);
            this.myTrades = new ArrayCacheBySymbolById (cacheLimit);
        }
        this.myTrades.append (trade);
        client.resolve (this.myTrades, 'myTrades');
        if (symbol) {
            client.resolve (this.myTrades, 'myTrades:' + symbol);
        }
    }

    /**
     * @ignore
     * @method
     * @description handles a position update from the private notification channel
     */
    handlePositionUpdate (client: Client, data: Dict): void {
        const position = this.parsePosition (data);
        if (!this.positions) {
            this.positions = new ArrayCacheBySymbolById ();
        }
        this.positions.append (position);
        client.resolve (this.positions, 'positions');
    }

    /**
     * @ignore
     * @method
     * @description handles a balance update from the private notification channel
     */
    handleBalanceUpdate (client: Client, data: Dict): void {
        const balance = this.parseBalance (data);
        client.resolve (balance, 'balance');
    }

    /**
     * @ignore
     * @method
     * @description handles the login acknowledgement message from the server
     */
    handleAuthenticate (client: Client, message: Dict): void {
        const success = this.safeBool (message, 'success', false);
        if (success) {
            client.resolve (true, 'authenticated');
        } else {
            const error = new AuthenticationError (
                this.id + ' authentication failed: ' + this.json (message)
            );
            client.reject (error, 'authenticated');
            throw error;
        }
    }

    /**
     * @ignore
     * @method
     * @description returns a ping message to keep the WebSocket connection alive
     */
    ping (client: Client): Dict {
        return { 'op': 'ping' };
    }

    /**
     * @ignore
     * @method
     * @description handles a pong reply from the server
     */
    handlePong (client: Client, message: Dict): void {
        client.lastPong = this.milliseconds ();
    }

    /**
     * @ignore
     * @method
     * @description routes an incoming WebSocket message to the correct handler
     */
    handleMessage (client: Client, message: Dict): void {
        const op = this.safeString (message, 'op');
        const topic = this.safeString (message, 'topic', '');
        // Keepalive
        if (op === 'pong') {
            this.handlePong (client, message);
            return;
        }
        // Auth response
        if (op === 'login') {
            this.handleAuthenticate (client, message);
            return;
        }
        // Subscription ack — no action needed
        if (op === 'subscribe' || op === 'unsubscribe') {
            return;
        }
        // Route by topic prefix
        if (topic.indexOf ('update:') === 0) {
            this.handleTicker (client, message);
        } else if (topic.indexOf ('snapshotL2:') === 0) {
            this.handleOrderBook (client, message);
        } else if (topic.indexOf ('tradeHistoryApi:') === 0) {
            this.handleTrades (client, message);
        } else if (topic.indexOf ('ohlcv:') === 0) {
            this.handleOHLCV (client, message);
        } else if (topic === 'notificationApiV2') {
            this.handleNotification (client, message);
        }
    }
}
