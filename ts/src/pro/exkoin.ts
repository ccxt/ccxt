// ----------------------------------------------------------------------------

import exkoinRest from '../exkoin.js';
import { ExchangeError, NotSupported } from '../base/errors.js';
import { ArrayCacheBySymbolById, ArrayCacheByTimestamp, ArrayCache } from '../base/ws/Cache.js';
import { sha256 } from '../static_dependencies/noble-hashes/sha256.js';
import type { Int, Str, OrderBook, Order, Trade, Ticker, Tickers, OHLCV } from '../base/types.js';
import Client from '../base/ws/Client.js';

// ----------------------------------------------------------------------------

export default class exkoin extends exkoinRest {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchBalance': false,
                'watchMyTrades': false,
                'watchOHLCV': true,
                'watchOrderBook': true,
                'watchOrders': true,
                'watchTicker': true,
                'watchTickers': true,
                'watchTrades': true,
                'watchTradesForSymbols': false,
            },
            'urls': {
                'api': {
                    'ws': 'wss://api.exkoin.com/ws',
                },
            },
            'options': {
                'tradesLimit': 1000,
                'ordersLimit': 1000,
                'OHLCVLimit': 1000,
                'watchOrderBook': {
                    'limit': 100, // default limit
                },
            },
            'streaming': {
                'ping': this.ping,
                'keepAlive': 30000, // ping every 30 seconds
            },
        });
    }

    /**
     * @method
     * @name exkoin#watchOrderBook
     * @see https://api.exkoin.com/ws-doc.html
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async watchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const messageHash = 'orderbook:' + symbol;
        // Initialize orderbook with REST API snapshot first
        if (!(symbol in this.orderbooks)) {
            const snapshot = await this.fetchOrderBook (symbol, limit);
            this.orderbooks[symbol] = this.orderBook (snapshot);
        }
        const url = this.urls['api']['ws'];
        const request = {
            'action': 'subscribe',
            'type': 'ob-update',
            'symbol': market['id'],
        };
        const orderbook = await this.watch (url, messageHash, request, messageHash);
        return orderbook.limit ();
    }

    handleOrderBook (client: Client, message) {
        //
        // Incremental Update:
        // {
        //     "event": "ob-update",
        //     "data": {
        //         "s": "BTC/USDT",
        //         "b": [["50000.00", "0.15", "u"], ["49998.00", "0", "d"]],
        //         "a": [["50001.00", "0.05", "u"], ["50003.00", "0", "d"]],
        //         "t": 1729130041,
        //         "n": 123
        //     }
        // }
        //
        // Format: [price, quantity, operation]
        // operation: 'u' = update/insert, 'd' = delete (quantity will be "0")
        //
        const event = this.safeString (message, 'event');
        const data = this.safeValue (message, 'data', {});
        if (event === 'ob-update') {
            const marketId = this.safeString (data, 's'); // symbol
            const market = this.safeMarket (marketId);
            const symbol = market['symbol'];
            const messageHash = 'orderbook:' + symbol;
            const timestamp = this.safeInteger (data, 't'); // timestamp
            if (!(symbol in this.orderbooks)) {
                // If we don't have an orderbook yet, we need to fetch the snapshot first
                // This shouldn't happen if watchOrderBook is called properly
                return;
            }
            const orderbook = this.orderbooks[symbol];
            const bids = orderbook['bids'];
            const asks = orderbook['asks'];
            const bidChanges = this.safeValue (data, 'b', []); // bid changes
            const askChanges = this.safeValue (data, 'a', []); // ask changes
            // Process bid changes
            for (let i = 0; i < bidChanges.length; i++) {
                const [ priceString, quantityString, operation ] = bidChanges[i];
                const price = parseFloat (priceString);
                const quantity = parseFloat (quantityString);
                if (operation === 'd' || quantity === 0) {
                    // Delete the price level
                    bids.store (price, 0);
                } else {
                    // Update/insert the price level
                    bids.store (price, quantity);
                }
            }
            // Process ask changes
            for (let i = 0; i < askChanges.length; i++) {
                const [ priceString, quantityString, operation ] = askChanges[i];
                const price = parseFloat (priceString);
                const quantity = parseFloat (quantityString);
                if (operation === 'd' || quantity === 0) {
                    // Delete the price level
                    asks.store (price, 0);
                } else {
                    // Update/insert the price level
                    asks.store (price, quantity);
                }
            }
            orderbook['bids'] = bids;
            orderbook['asks'] = asks;
            orderbook['timestamp'] = timestamp;
            orderbook['datetime'] = this.iso8601 (timestamp);
            orderbook['nonce'] = this.safeInteger (data, 'n'); // sequence number
            client.resolve (orderbook, messageHash);
        }
    }

    /**
     * @method
     * @name exkoin#watchTickers
     * @see https://api.exkoin.com/ws-doc.html
     * @description watches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchTickers (symbols: string[] = undefined, params = {}): Promise<Tickers> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const messageHash = 'tickers';
        const url = this.urls['api']['ws'];
        const request = {
            'action': 'subscribe',
            'type': 'ticker',
        };
        const tickers = await this.watch (url, messageHash, request, messageHash);
        if (this.newUpdates) {
            return this.filterByArray (tickers, 'symbol', symbols);
        }
        return this.filterByArray (tickers, 'symbol', symbols);
    }

    /**
     * @method
     * @name exkoin#watchTicker
     * @see https://api.exkoin.com/ws-doc.html
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchTicker (symbol: string, params = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const messageHash = 'ticker:' + symbol;
        const url = this.urls['api']['ws'];
        const request = {
            'action': 'subscribe',
            'type': 'ticker',
            'symbol': market['id'],
        };
        return await this.watch (url, messageHash, request, messageHash);
    }

    handleTicker (client: Client, message) {
        //
        // {
        //     "event": "ticker",
        //     "data": {
        //         "symbol": "BTC/USDT",
        //         "last_price": "50000.00",
        //         "price_change_percent": "2.5",
        //         "base_volume": "123.45",
        //         "timestamp": 1729130040000
        //     }
        // }
        //
        const data = this.safeValue (message, 'data', {});
        const marketId = this.safeString (data, 'symbol');
        const market = this.safeMarket (marketId);
        const ticker = this.parseTicker (data, market);
        const symbol = ticker['symbol'];
        this.tickers[symbol] = ticker;
        // Resolve both individual ticker and tickers collection
        const tickerMessageHash = 'ticker:' + symbol;
        const tickersMessageHash = 'tickers';
        client.resolve (ticker, tickerMessageHash);
        client.resolve (this.tickers, tickersMessageHash);
    }

    /**
     * @method
     * @name exkoin#watchTrades
     * @see https://api.exkoin.com/ws-doc.html
     * @description watches information on multiple trades made in a market
     * @param {string} symbol unified market symbol of the market trades were made in
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const messageHash = 'trades:' + symbol;
        const url = this.urls['api']['ws'];
        const request = {
            'action': 'subscribe',
            'type': 'public-trades',
            'symbol': market['id'],
        };
        const trades = await this.watch (url, messageHash, request, messageHash);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    handleTrades (client: Client, message) {
        //
        // {
        //     "event": "public-trades",
        //     "data": {
        //         "symbol": "BTC/USDT",
        //         "price": "50000.00",
        //         "amount": "0.1",
        //         "cost": "5000.00",
        //         "side": "buy",
        //         "created_at": 1729130040000
        //     }
        // }
        //
        const data = this.safeValue (message, 'data', {});
        const marketId = this.safeString (data, 'symbol');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const messageHash = 'trades:' + symbol;
        const trade = this.parseTrade (data, market);
        let tradesCache = this.safeValue (this.trades, symbol);
        if (tradesCache === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            tradesCache = new ArrayCache (limit);
            this.trades[symbol] = tradesCache;
        }
        tradesCache.append (trade);
        client.resolve (tradesCache, messageHash);
    }

    /**
     * @method
     * @name exkoin#watchOHLCV
     * @see https://api.exkoin.com/ws-doc.html
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async watchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const interval = this.safeInteger (this.timeframes, timeframe);
        if (interval === undefined) {
            throw new NotSupported (this.id + ' watchOHLCV does not support timeframe ' + timeframe);
        }
        const messageHash = 'ohlcv:' + symbol + ':' + timeframe;
        const url = this.urls['api']['ws'];
        const request = {
            'action': 'subscribe',
            'type': 'ohlcv',
            'symbol': market['id'],
            'interval': interval.toString (),
        };
        const ohlcv = await this.watch (url, messageHash, request, messageHash);
        if (this.newUpdates) {
            limit = ohlcv.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (ohlcv, since, limit, 0, true);
    }

    handleOHLCV (client: Client, message) {
        //
        // {
        //     "event": "ohlcv",
        //     "data": {
        //         "symbol": "BTC/USDT",
        //         "interval": 60,
        //         "time": 1729130040000,
        //         "open": "67581.47",
        //         "high": "67581.47",
        //         "low": "67338.01",
        //         "close": "67338.01",
        //         "volume": "6.72168016"
        //     }
        // }
        //
        const data = this.safeValue (message, 'data', {});
        const marketId = this.safeString (data, 'symbol');
        const interval = this.safeInteger (data, 'interval');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        // Find timeframe from interval
        let timeframe = '1m';
        const timeframes = Object.keys (this.timeframes);
        for (let i = 0; i < timeframes.length; i++) {
            if (this.timeframes[timeframes[i]] === interval) {
                timeframe = timeframes[i];
                break;
            }
        }
        const messageHash = 'ohlcv:' + symbol + ':' + timeframe;
        const parsed = this.parseOHLCV (data, market);
        if (!(symbol in this.ohlcvs)) {
            this.ohlcvs[symbol] = {};
        }
        if (!(timeframe in this.ohlcvs[symbol])) {
            const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
            this.ohlcvs[symbol][timeframe] = new ArrayCacheByTimestamp (limit);
        }
        const ohlcv = this.ohlcvs[symbol][timeframe];
        ohlcv.append (parsed);
        client.resolve (ohlcv, messageHash);
    }

    /**
     * @method
     * @name exkoin#watchOrders
     * @see https://api.exkoin.com/ws-doc.html
     * @description watches information on multiple orders made by the user
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async watchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        this.checkRequiredCredentials ();
        await this.loadMarkets ();
        let market = undefined;
        let messageHash = 'orders';
        if (symbol !== undefined) {
            market = this.market (symbol);
            symbol = market['symbol'];
            messageHash = 'orders:' + symbol;
        }
        const url = this.urls['api']['ws'];
        const request = {
            'action': 'subscribe',
            'type': 'order',
        };
        if (symbol !== undefined) {
            request['symbol'] = market['id'];
        }
        await this.authenticate (params);
        const orders = await this.watch (url, messageHash, request, messageHash);
        if (this.newUpdates) {
            limit = orders.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (orders, symbol, since, limit, true);
    }

    handleOrders (client: Client, message) {
        //
        // {
        //     "event": "order",
        //     "data": {
        //         "id": "12345",
        //         "user_id": "user123",
        //         "client_order_id": "my-order-1",
        //         "symbol": "BTC/USDT",
        //         "type": "limit",
        //         "side": "buy",
        //         "status": "open",
        //         "price": "50000.00",
        //         "average": "0.00",
        //         "amount": "0.1",
        //         "filled": "0.0",
        //         "remaining": "0.1",
        //         "cost": "0.00",
        //         "fee": {},
        //         "created_at": 1729130040000,
        //         "updated_at": 1729130040000
        //     }
        // }
        //
        const data = this.safeValue (message, 'data', {});
        const order = this.parseOrder (data);
        const symbol = order['symbol'];
        if (this.orders === undefined) {
            const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
            this.orders = new ArrayCacheBySymbolById (limit);
        }
        const orders = this.orders;
        orders.append (order);
        // Resolve both symbol-specific and general orders
        const generalMessageHash = 'orders';
        const symbolMessageHash = 'orders:' + symbol;
        client.resolve (orders, generalMessageHash);
        client.resolve (orders, symbolMessageHash);
    }

    async authenticate (params = {}) {
        this.checkRequiredCredentials ();
        const url = this.urls['api']['ws'];
        const client = this.client (url);
        const messageHash = 'authenticated';
        // Check if already authenticated or authentication is in progress
        let future = this.safeValue (client.subscriptions, messageHash);
        if (future !== undefined) {
            return future;
        }
        const timestamp = this.milliseconds ();
        const signature = this.hmac (timestamp.toString (), this.encode (this.secret), sha256, 'hex');
        const request = {
            'type': 'server.sign',
            'apiKey': this.apiKey,
            'timestamp': timestamp,
            'signature': signature,
        };
        future = await this.watch (url, messageHash, request, messageHash);
        client.subscriptions[messageHash] = future;
        return future;
    }

    handleAuthenticate (client: Client, message) {
        //
        // {
        //     "event": "auth",
        //     "success": true
        // }
        //
        const success = this.safeBool (message, 'success', false);
        if (success) {
            client.resolve (message, 'authenticated');
        } else {
            const errorMessage = this.safeString (message, 'message', 'Authentication failed');
            const error = new ExchangeError (this.id + ' ' + errorMessage);
            client.reject (error, 'authenticated');
        }
    }

    handleMessage (client: Client, message) {
        //
        // Public messages:
        // {"event": "ob-update", "data": {"s": "BTC/USDT", "b": [...], "a": [...]}}
        // {"event": "ticker", "data": {"symbol": "BTC/USDT", "last_price": "50000.00", ...}}
        // {"event": "ohlcv", "data": {"symbol": "BTC/USDT", "interval": 60, ...}}
        // {"event": "public-trades", "data": {"symbol": "BTC/USDT", "price": "50000.00", ...}}
        //
        // Private messages:
        // {"event": "order", "data": {"id": "12345", "symbol": "BTC/USDT", ...}}
        // {"event": "my-trades", "data": {"id": "67890", "symbol": "BTC/USDT", ...}}
        //
        // Auth messages:
        // {"event": "auth", "success": true}
        //
        // Subscription confirmations:
        // {"event": "subscribed", "type": "ob-update", "params": {...}}
        // {"event": "unsubscribed", "type": "ob-update", "params": {...}}
        //
        // Error messages:
        // {"event": "error", "message": "Invalid symbol"}
        //
        const event = this.safeString (message, 'event');
        if (event === undefined) {
            return;
        }
        if (event === 'error') {
            const errorMessage = this.safeString (message, 'message', 'Unknown error');
            throw new ExchangeError (this.id + ' ' + errorMessage);
        } else if (event === 'auth') {
            this.handleAuthenticate (client, message);
        } else if (event === 'ob-update') {
            this.handleOrderBook (client, message);
        } else if (event === 'ticker') {
            this.handleTicker (client, message);
        } else if (event === 'ohlcv') {
            this.handleOHLCV (client, message);
        } else if (event === 'order') {
            this.handleOrders (client, message);
        } else if (event === 'public-trades') {
            this.handleTrades (client, message);
        }
    }

    ping (client: Client) {
        client.lastPong = this.milliseconds ();
        return {
            'type': 'ping',
        };
    }
}
