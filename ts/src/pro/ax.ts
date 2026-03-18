
//  ---------------------------------------------------------------------------

import axRest from '../ax.js';
import { AuthenticationError, ExchangeError } from '../base/errors.js';
import { ArrayCache, ArrayCacheByTimestamp, ArrayCacheBySymbolById } from '../base/ws/Cache.js';
import type { Int, OHLCV, Order, OrderBook, Trade, Ticker, Dict, Str } from '../base/types.js';
import Client from '../base/ws/Client.js';

//  ---------------------------------------------------------------------------

export default class ax extends axRest {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'cancelAllOrdersWs': false,
                'cancelOrdersWs': false,
                'cancelOrderWs': false,
                'createOrderWs': false,
                'editOrderWs': false,
                'fetchBalanceWs': false,
                'fetchOpenOrdersWs': false,
                'fetchOrderWs': false,
                'fetchTradesWs': false,
                'watchBalance': false,
                'watchMyTrades': true,
                'watchOHLCV': true,
                'watchOrderBook': true,
                'watchOrders': true,
                'watchTicker': true,
                'watchTrades': true,
            },
            'urls': {
                'api': {
                    'ws': {
                        'public': 'wss://gateway.architect.exchange/md/ws',
                        'private': 'wss://gateway.architect.exchange/orders/ws',
                    },
                },
                'test': {
                    'ws': {
                        'public': 'wss://gateway.sandbox.architect.exchange/md/ws',
                        'private': 'wss://gateway.sandbox.architect.exchange/orders/ws',
                    },
                },
            },
            'options': {
                'tradesLimit': 1000,
                'OHLCVLimit': 1000,
                'ordersLimit': 1000,
                'requestId': 0,
            },
            'streaming': {},
        });
    }

    requestId () {
        const requestId = this.sum (this.safeInteger (this.options, 'requestId', 0), 1);
        this.options['requestId'] = requestId;
        return requestId;
    }

    async authenticateWs (url = undefined) {
        await this.handleToken ();
        const token = this.token;
        if (token === undefined) {
            throw new AuthenticationError (this.id + ' authenticateWs() requires a token');
        }
        if (url !== undefined) {
            const client = this.safeValue (this.clients, url);
            if (client !== undefined) {
                return;
            }
        }
        this.options['ws'] = this.safeDict (this.options, 'ws', {});
        this.options['ws']['options'] = this.safeDict (this.options['ws'], 'options', {});
        this.options['ws']['options']['headers'] = {
            'Authorization': 'Bearer ' + token,
        };
    }

    getWsUrl (type: string) {
        const sandboxMode = this.safeBool (this.options, 'sandboxMode', false);
        if (sandboxMode) {
            return this.urls['test']['ws'][type];
        }
        return this.urls['api']['ws'][type];
    }

    /**
     * @method
     * @name ax#watchTicker
     * @description watches a price ticker, a statistical calculation with the information for a specific market
     * @see https://docs.architect.exchange/api-reference
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    async watchTicker (symbol: string, params = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const url = this.getWsUrl ('public');
        await this.authenticateWs (url);
        const messageHash = 'ticker:' + symbol;
        const subscribeHash = 'md:' + symbol;
        const rid = this.requestId ();
        const subscribe: Dict = {
            'rid': rid,
            'type': 'subscribe',
            'symbol': market['id'],
            'level': 'LEVEL_2',
        };
        return await this.watch (url, messageHash, this.extend (subscribe, params), subscribeHash);
    }

    /**
     * @method
     * @name ax#watchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://docs.architect.exchange/api-reference
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const url = this.getWsUrl ('public');
        await this.authenticateWs (url);
        const messageHash = 'trade:' + symbol;
        const subscribeHash = 'md:' + symbol;
        const rid = this.requestId ();
        const subscribe: Dict = {
            'rid': rid,
            'type': 'subscribe',
            'symbol': market['id'],
            'level': 'LEVEL_2',
        };
        const trades = await this.watch (url, messageHash, this.extend (subscribe, params), subscribeHash);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    /**
     * @method
     * @name ax#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.architect.exchange/api-reference
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] not used by ax watchOrderBook
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure} indexed by market symbols
     */
    async watchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const url = this.getWsUrl ('public');
        await this.authenticateWs (url);
        const messageHash = 'orderbook:' + symbol;
        const subscribeHash = 'md:' + symbol;
        const rid = this.requestId ();
        const subscribe: Dict = {
            'rid': rid,
            'type': 'subscribe',
            'symbol': market['id'],
            'level': 'LEVEL_2',
        };
        const orderbook = await this.watch (url, messageHash, this.extend (subscribe, params), subscribeHash);
        return orderbook.limit ();
    }

    /**
     * @method
     * @name ax#watchOHLCV
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://docs.architect.exchange/api-reference
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} [timeframe] the length of time each candle represents, default '1m'
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async watchOHLCV (symbol: string, timeframe: string = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const url = this.getWsUrl ('public');
        await this.authenticateWs (url);
        const width = this.safeString (this.timeframes, timeframe, timeframe);
        const messageHash = 'candles:' + timeframe + ':' + symbol;
        const rid = this.requestId ();
        const subscribe: Dict = {
            'rid': rid,
            'type': 'subscribe_candles',
            'symbol': market['id'],
            'width': width,
        };
        const ohlcv = await this.watch (url, messageHash, this.extend (subscribe, params), messageHash);
        if (this.newUpdates) {
            limit = ohlcv.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (ohlcv, since, limit, 0, true);
    }

    /**
     * @method
     * @name ax#watchOrders
     * @description watches information on multiple orders made by the user
     * @see https://docs.architect.exchange/api-reference
     * @param {string|undefined} [symbol] unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async watchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        let messageHash = 'orders';
        if (symbol !== undefined) {
            const market = this.market (symbol);
            symbol = market['symbol'];
            messageHash = messageHash + ':' + symbol;
        }
        const url = this.getWsUrl ('private');
        await this.authenticateWs (url);
        const orders = await this.watch (url, messageHash, undefined, messageHash);
        if (this.newUpdates) {
            limit = orders.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (orders, symbol, since, limit, true);
    }

    /**
     * @method
     * @name ax#watchMyTrades
     * @description watches information on multiple trades made by the user
     * @see https://docs.architect.exchange/api-reference
     * @param {string|undefined} [symbol] unified market symbol of the market trades were made in
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    async watchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        let messageHash = 'myTrades';
        if (symbol !== undefined) {
            const market = this.market (symbol);
            symbol = market['symbol'];
            messageHash = messageHash + ':' + symbol;
        }
        const url = this.getWsUrl ('private');
        await this.authenticateWs (url);
        const trades = await this.watch (url, messageHash, undefined, messageHash);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (trades, symbol, since, limit, true);
    }

    handleMessage (client: Client, message) {
        // check if this is a subscription response (has rid)
        const rid = this.safeInteger (message, 'rid');
        if (rid !== undefined) {
            this.handleSubscriptionResponse (client, message);
            return;
        }
        const t = this.safeString (message, 't');
        if (t === undefined) {
            return;
        }
        // market data WS events
        if (t === 'h') {
            this.handleHeartbeat (client, message);
        } else if (t === 's') {
            this.handleWsTicker (client, message);
        } else if (t === 't') {
            this.handleWsTrade (client, message);
        } else if (t === '2') {
            this.handleWsOrderBook (client, message);
        } else if (t === 'c') {
            this.handleWsOHLCV (client, message);
        // order gateway WS events
        } else if ((t === 'n') || (t === 'p') || (t === 'f') || (t === 'c') || (t === 'j') || (t === 'x') || (t === 'd')) {
            this.handleOrderUpdate (client, message);
        }
    }

    handleSubscriptionResponse (client: Client, message) {
        // handle login response from order gateway
        const rid = this.safeInteger (message, 'rid');
        if (rid === 0) {
            // initial login response: { rid: 0, res: { li: "user-id", o: [open orders] }, err: null }
            const res = this.safeDict (message, 'res', {});
            const openOrders = this.safeList (res, 'o', []);
            for (let i = 0; i < openOrders.length; i++) {
                const order = this.parseOrder (openOrders[i]);
                this.handleOrderCacheUpdate (client, order);
            }
            return;
        }
        // subscribe response: { rid: N, result: { subscribe: "ok" } }
        const error = this.safeDict (message, 'error');
        if (error !== undefined) {
            const errorMessage = this.safeString (error, 'message', 'Unknown error');
            throw new ExchangeError (this.id + ' ' + errorMessage);
        }
    }

    handleHeartbeat (client: Client, message) {
        // heartbeat message with timestamp
        client.lastPong = this.milliseconds ();
    }

    handleWsTicker (client: Client, message) {
        //
        //     { "t": "s", "s": "BTCUSD-PERP", "p": "50000", "q": 100, "v": 50000, "oi": 12000, "m": "49999", "ts": ..., "tn": ... }
        //
        const ticker = this.parseTicker (message);
        const symbol = ticker['symbol'];
        this.tickers[symbol] = ticker;
        const messageHash = 'ticker:' + symbol;
        client.resolve (ticker, messageHash);
    }

    handleWsTrade (client: Client, message) {
        //
        //     { "t": "t", "s": "BTCUSD-PERP", "p": "50000", "q": 50, "d": "B", "ts": ..., "tn": ... }
        //
        const marketId = this.safeString (message, 's');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        let tradesArray = this.safeValue (this.trades, symbol);
        if (tradesArray === undefined) {
            const tradesLimit = this.safeInteger (this.options, 'tradesLimit', 1000);
            tradesArray = new ArrayCache (tradesLimit);
            this.trades[symbol] = tradesArray;
        }
        const trade = this.parseTrade (message, market);
        tradesArray.append (trade);
        const messageHash = 'trade:' + symbol;
        client.resolve (tradesArray, messageHash);
    }

    handleWsOrderBook (client: Client, message) {
        //
        //     { "t": "2", "s": "BTCUSD-PERP", "b": [...], "a": [...], "st": true/false, "ts": ..., "tn": ... }
        //
        const marketId = this.safeString (message, 's');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const messageHash = 'orderbook:' + symbol;
        const isSnapshot = this.safeBool (message, 'st', false);
        const ts = this.safeInteger (message, 'ts');
        const timestamp = (ts !== undefined) ? ts * 1000 : undefined;
        let orderbook = this.safeValue (this.orderbooks, symbol);
        if (orderbook === undefined) {
            this.orderbooks[symbol] = this.orderBook ({});
            orderbook = this.orderbooks[symbol];
        }
        if (isSnapshot) {
            const snapshot = this.parseOrderBook (message, symbol, timestamp, 'b', 'a', 'p', 'q');
            orderbook.reset (snapshot);
        } else {
            const bids = this.safeList (message, 'b', []);
            const asks = this.safeList (message, 'a', []);
            for (let i = 0; i < bids.length; i++) {
                const bid = bids[i];
                const price = this.safeNumber (bid, 'p');
                const amount = this.safeNumber (bid, 'q');
                const bookSide = orderbook['bids'];
                bookSide.store (price, amount);
            }
            for (let i = 0; i < asks.length; i++) {
                const ask = asks[i];
                const price = this.safeNumber (ask, 'p');
                const amount = this.safeNumber (ask, 'q');
                const bookSide = orderbook['asks'];
                bookSide.store (price, amount);
            }
            orderbook['timestamp'] = timestamp;
            orderbook['datetime'] = this.iso8601 (timestamp);
        }
        orderbook['symbol'] = symbol;
        client.resolve (orderbook, messageHash);
    }

    handleWsOHLCV (client: Client, message) {
        //
        //     { "t": "c", "symbol": "BTCUSD-PERP", "ts": "2026-03-09T12:00:00Z", "open": "...", "high": "...", "low": "...", "close": "...", "volume": ..., "width": "1m" }
        //
        const marketId = this.safeString (message, 'symbol');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const width = this.safeString (message, 'width');
        const timeframe = this.findTimeframe (width);
        const parsed = this.parseOHLCV (message, market);
        this.ohlcvs[symbol] = this.safeValue (this.ohlcvs, symbol, {});
        let stored = this.safeValue (this.ohlcvs[symbol], timeframe);
        if (stored === undefined) {
            const ohlcvLimit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
            stored = new ArrayCacheByTimestamp (ohlcvLimit);
            this.ohlcvs[symbol][timeframe] = stored;
        }
        stored.append (parsed);
        const messageHash = 'candles:' + timeframe + ':' + symbol;
        client.resolve (stored, messageHash);
    }

    handleOrderUpdate (client: Client, message) {
        //
        //     { "t": "n", "eid": "evt-1", "o": { "oid": "O-...", "s": "BTCUSD-PERP", "d": "B", "q": 100, ... }, "ts": ..., "tn": ... }
        //     { "t": "p", "eid": "evt-2", "o": { ... }, "xs": { "tid": "T-...", ... }, "ts": ..., "tn": ... }
        //     { "t": "f", "eid": "evt-3", "o": { ... }, "xs": { "tid": "T-...", ... }, "ts": ..., "tn": ... }
        //     { "t": "c", "eid": "evt-4", "o": { "oid": "O-...", "o": "CANCELED" }, "ts": ..., "tn": ... }
        //
        const t = this.safeString (message, 't');
        const orderData = this.safeDict (message, 'o', {});
        const order = this.parseOrder (orderData);
        this.handleOrderCacheUpdate (client, order);
        // handle fill events for myTrades
        if ((t === 'p') || (t === 'f')) {
            const fillData = this.safeDict (message, 'xs', {});
            if (Object.keys (fillData).length > 0) {
                this.handleMyTradeUpdate (client, fillData, order);
            }
        }
    }

    handleOrderCacheUpdate (client: Client, order: Order) {
        const symbol = this.safeString (order, 'symbol');
        if (this.orders === undefined) {
            const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
            this.orders = new ArrayCacheBySymbolById (limit);
        }
        const cachedOrders = this.orders as ArrayCacheBySymbolById;
        cachedOrders.append (order);
        client.resolve (this.orders, 'orders');
        if (symbol !== undefined) {
            client.resolve (this.orders, 'orders:' + symbol);
        }
    }

    handleMyTradeUpdate (client: Client, fillData: Dict, order: Order) {
        //
        //     { "tid": "T-...", "s": "BTCUSD-PERP", "q": 50, "p": "50000", "d": "B", "agg": true }
        //
        const marketId = this.safeString2 (fillData, 's', 'symbol');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const trade = this.parseTrade (fillData, market);
        trade['order'] = this.safeString (order, 'id');
        if (this.myTrades === undefined) {
            const tradesLimit = this.safeInteger (this.options, 'tradesLimit', 1000);
            this.myTrades = new ArrayCacheBySymbolById (tradesLimit);
        }
        const myTrades = this.myTrades as ArrayCacheBySymbolById;
        myTrades.append (trade);
        client.resolve (this.myTrades, 'myTrades');
        if (symbol !== undefined) {
            client.resolve (this.myTrades, 'myTrades:' + symbol);
        }
    }

    onError (client: Client, error) {
        super.onError (client, error);
    }

    onClose (client: Client, error) {
        super.onClose (client, error);
    }
}
