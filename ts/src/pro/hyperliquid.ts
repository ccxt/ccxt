//  ---------------------------------------------------------------------------

import hyperliquidRest from '../hyperliquid.js';
import { ExchangeError, AuthenticationError } from '../base/errors.js';
import { ArrayCache, ArrayCacheBySymbolById, ArrayCacheByTimestamp } from '../base/ws/Cache.js';
import type { Int, Str, Ticker, OrderBook, Order, Trade, OHLCV } from '../base/types.js';
import Client from '../base/ws/Client.js';

//  ---------------------------------------------------------------------------

export default class hyperliquid extends hyperliquidRest {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchBalance': false,
                'watchMyTrades': true,
                'watchOHLCV': true,
                'watchOrderBook': true,
                'watchOrders': true,
                'watchTicker': true,
                'watchTickers': false, // for now
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
            'streaming': {},
            'exceptions': {
                'ws': {
                    'exact': {
                    },
                },
            },
        });
    }

    async watchTicker (symbol: string, params = {}): Promise<Ticker> {
        /**
         * @method
         * @name hyperliquidwatchTicker
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        const url = this.urls['api']['ws']['crypto'];
        await this.authenticate (url);
        await this.loadMarkets ();
        const market = this.market (symbol);
        const messageHash = 'ticker:' + market['symbol'];
        const request = {
            'action': 'subscribe',
            'quotes': [ market['id'] ],
        };
        return await this.watch (url, messageHash, this.extend (request, params), messageHash);
    }

    handleTicker (client: Client, message) {
        //
        //
        const ticker = this.parseTicker (message);
        const symbol = ticker['symbol'];
        const messageHash = 'ticker:' + symbol;
        this.tickers[symbol] = ticker;
        client.resolve (this.tickers[symbol], messageHash);
    }

    parseTicker (ticker, market = undefined): Ticker {
        //
        //
        const marketId = this.safeString (ticker, 'S');
        const datetime = this.safeString (ticker, 't');
        return this.safeTicker ({
            'symbol': this.safeSymbol (marketId, market),
            'timestamp': this.parse8601 (datetime),
            'datetime': datetime,
            'high': undefined,
            'low': undefined,
            'bid': this.safeString (ticker, 'bp'),
            'bidVolume': this.safeString (ticker, 'bs'),
            'ask': this.safeString (ticker, 'ap'),
            'askVolume': this.safeString (ticker, 'as'),
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'last': undefined,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': undefined,
            'info': ticker,
        }, market);
    }

    async watchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        /**
         * @method
         * @name hyperliquidwatchOHLCV
         * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int} [since] timestamp in ms of the earliest candle to fetch
         * @param {int} [limit] the maximum amount of candles to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        const url = this.urls['api']['ws']['crypto'];
        await this.authenticate (url);
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const request = {
            'action': 'subscribe',
            'bars': [ market['id'] ],
        };
        const messageHash = 'ohlcv:' + symbol;
        const ohlcv = await this.watch (url, messageHash, this.extend (request, params), messageHash);
        if (this.newUpdates) {
            limit = ohlcv.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (ohlcv, since, limit, 0, true);
    }

    handleOHLCV (client: Client, message) {
        //
        //
        const marketId = this.safeString (message, 'S');
        const symbol = this.safeSymbol (marketId);
        let stored = this.safeValue (this.ohlcvs, symbol);
        if (stored === undefined) {
            const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
            stored = new ArrayCacheByTimestamp (limit);
            this.ohlcvs[symbol] = stored;
        }
        const parsed = this.parseOHLCV (message);
        stored.append (parsed);
        const messageHash = 'ohlcv:' + symbol;
        client.resolve (stored, messageHash);
    }

    async watchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        /**
         * @method
         * @name hyperliquidwatchOrderBook
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int} [limit] the maximum amount of order book entries to return.
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        const url = this.urls['api']['ws']['crypto'];
        await this.authenticate (url);
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const messageHash = 'orderbook' + ':' + symbol;
        const request = {
            'action': 'subscribe',
            'orderbooks': [ market['id'] ],
        };
        const orderbook = await this.watch (url, messageHash, this.extend (request, params), messageHash);
        return orderbook.limit ();
    }

    handleOrderBook (client: Client, message) {
        //
        //
        const marketId = this.safeString (message, 'S');
        const symbol = this.safeSymbol (marketId);
        const datetime = this.safeString (message, 't');
        const timestamp = this.parse8601 (datetime);
        const isSnapshot = this.safeBool (message, 'r', false);
        let orderbook = this.safeValue (this.orderbooks, symbol);
        if (orderbook === undefined) {
            orderbook = this.orderBook ();
        }
        if (isSnapshot) {
            const snapshot = this.parseOrderBook (message, symbol, timestamp, 'b', 'a', 'p', 's');
            orderbook.reset (snapshot);
        } else {
            const asks = this.safeValue (message, 'a', []);
            const bids = this.safeValue (message, 'b', []);
            this.handleDeltas (orderbook['asks'], asks);
            this.handleDeltas (orderbook['bids'], bids);
            orderbook['timestamp'] = timestamp;
            orderbook['datetime'] = datetime;
        }
        const messageHash = 'orderbook' + ':' + symbol;
        this.orderbooks[symbol] = orderbook;
        client.resolve (orderbook, messageHash);
    }

    handleDelta (bookside, delta) {
        const bidAsk = this.parseBidAsk (delta, 'p', 's');
        bookside.storeArray (bidAsk);
    }

    handleDeltas (bookside, deltas) {
        for (let i = 0; i < deltas.length; i++) {
            this.handleDelta (bookside, deltas[i]);
        }
    }

    async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        /**
         * @method
         * @name hyperliquidwatchTrades
         * @description watches information on multiple trades made in a market
         * @param {string} symbol unified market symbol of the market trades were made in
         * @param {int} [since] the earliest time in ms to fetch orders for
         * @param {int} [limit] the maximum number of trade structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure
         */
        const url = this.urls['api']['ws']['crypto'];
        await this.authenticate (url);
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const messageHash = 'trade:' + symbol;
        const request = {
            'action': 'subscribe',
            'trades': [ market['id'] ],
        };
        const trades = await this.watch (url, messageHash, this.extend (request, params), messageHash);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    handleTrades (client: Client, message) {
        //
        //
        const marketId = this.safeString (message, 'S');
        const symbol = this.safeSymbol (marketId);
        let stored = this.safeValue (this.trades, symbol);
        if (stored === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            stored = new ArrayCache (limit);
            this.trades[symbol] = stored;
        }
        const parsed = this.parseTrade (message);
        stored.append (parsed);
        const messageHash = 'trade' + ':' + symbol;
        client.resolve (stored, messageHash);
    }

    async watchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        /**
         * @method
         * @name hyperliquidwatchMyTrades
         * @description watches information on multiple trades made by the user
         * @param {string} symbol unified market symbol of the market trades were made in
         * @param {int} [since] the earliest time in ms to fetch trades for
         * @param {int} [limit] the maximum number of trade structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {boolean} [params.unifiedMargin] use unified margin account
         * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure
         */
        const url = this.urls['api']['ws']['trading'];
        await this.authenticate (url);
        let messageHash = 'myTrades';
        await this.loadMarkets ();
        if (symbol !== undefined) {
            symbol = this.symbol (symbol);
            messageHash += ':' + symbol;
        }
        const request = {
            'action': 'listen',
            'data': {
                'streams': [ 'trade_updates' ],
            },
        };
        const trades = await this.watch (url, messageHash, this.extend (request, params), messageHash);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    async watchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        /**
         * @method
         * @name hyperliquidwatchOrders
         * @description watches information on multiple orders made by the user
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int} [since] the earliest time in ms to fetch orders for
         * @param {int} [limit] the maximum number of order structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure
         */
        const url = this.urls['api']['ws']['trading'];
        await this.authenticate (url);
        await this.loadMarkets ();
        let messageHash = 'orders';
        if (symbol !== undefined) {
            const market = this.market (symbol);
            symbol = market['symbol'];
            messageHash = 'orders:' + symbol;
        }
        const request = {
            'action': 'listen',
            'data': {
                'streams': [ 'trade_updates' ],
            },
        };
        const orders = await this.watch (url, messageHash, this.extend (request, params), messageHash);
        if (this.newUpdates) {
            limit = orders.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (orders, symbol, since, limit, true);
    }

    handleTradeUpdate (client: Client, message) {
        this.handleOrder (client, message);
        this.handleMyTrade (client, message);
    }

    handleOrder (client: Client, message) {
        //
        //
        const data = this.safeValue (message, 'data', {});
        const rawOrder = this.safeValue (data, 'order', {});
        if (this.orders === undefined) {
            const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
            this.orders = new ArrayCacheBySymbolById (limit);
        }
        const orders = this.orders;
        const order = this.parseOrder (rawOrder);
        orders.append (order);
        let messageHash = 'orders';
        client.resolve (orders, messageHash);
        messageHash = 'orders:' + order['symbol'];
        client.resolve (orders, messageHash);
    }

    handleMyTrade (client: Client, message) {
        //
        //
        const data = this.safeValue (message, 'data', {});
        const event = this.safeString (data, 'event');
        if (event !== 'fill' && event !== 'partial_fill') {
            return;
        }
        const rawOrder = this.safeValue (data, 'order', {});
        let myTrades = this.myTrades;
        if (myTrades === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            myTrades = new ArrayCacheBySymbolById (limit);
        }
        const trade = this.parseMyTrade (rawOrder);
        myTrades.append (trade);
        let messageHash = 'myTrades:' + trade['symbol'];
        client.resolve (myTrades, messageHash);
        messageHash = 'myTrades';
        client.resolve (myTrades, messageHash);
    }

    parseMyTrade (trade, market = undefined) {
        //
        //
        const marketId = this.safeString (trade, 'symbol');
        const datetime = this.safeString (trade, 'filled_at');
        let type = this.safeString (trade, 'type');
        if (type.indexOf ('limit') >= 0) {
            // might be limit or stop-limit
            type = 'limit';
        }
        return this.safeTrade ({
            'id': this.safeString (trade, 'i'),
            'info': trade,
            'timestamp': this.parse8601 (datetime),
            'datetime': datetime,
            'symbol': this.safeSymbol (marketId, undefined, '/'),
            'order': this.safeString (trade, 'id'),
            'type': type,
            'side': this.safeString (trade, 'side'),
            'takerOrMaker': (type === 'market') ? 'taker' : 'maker',
            'price': this.safeString (trade, 'filled_avg_price'),
            'amount': this.safeString (trade, 'filled_qty'),
            'cost': undefined,
            'fee': undefined,
        }, market);
    }

    async authenticate (url, params = {}) {
        this.checkRequiredCredentials ();
        const messageHash = 'authenticated';
        const client = this.client (url);
        const future = client.future (messageHash);
        const authenticated = this.safeValue (client.subscriptions, messageHash);
        if (authenticated === undefined) {
            let request = {
                'action': 'auth',
                'key': this.apiKey,
                'secret': this.secret,
            };
            if (url === this.urls['api']['ws']['trading']) {
                // this auth request is being deprecated in test environment
                request = {
                    'action': 'authenticate',
                    'data': {
                        'key_id': this.apiKey,
                        'secret_key': this.secret,
                    },
                } as any;
            }
            this.watch (url, messageHash, request, messageHash, future);
        }
        return future;
    }

    handleErrorMessage (client: Client, message) {
        //
        //
        const code = this.safeString (message, 'code');
        const msg = this.safeValue (message, 'msg', {});
        throw new ExchangeError (this.id + ' code: ' + code + ' message: ' + msg);
    }

    handleConnected (client: Client, message) {
        //
        //
        return message;
    }

    handleCryptoMessage (client: Client, message) {
        for (let i = 0; i < message.length; i++) {
            const data = message[i];
            const T = this.safeString (data, 'T');
            const msg = this.safeString (data, 'msg');
            if (T === 'subscription') {
                this.handleSubscription (client, data);
                return;
            }
            if (T === 'success' && msg === 'connected') {
                this.handleConnected (client, data);
                return;
            }
            if (T === 'success' && msg === 'authenticated') {
                this.handleAuthenticate (client, data);
                return;
            }
            const methods = {
                'error': this.handleErrorMessage,
                'b': this.handleOHLCV,
                'q': this.handleTicker,
                't': this.handleTrades,
                'o': this.handleOrderBook,
            };
            const method = this.safeValue (methods, T);
            if (method !== undefined) {
                method.call (this, client, data);
            }
        }
    }

    handleTradingMessage (client: Client, message) {
        const stream = this.safeString (message, 'stream');
        const methods = {
            'authorization': this.handleAuthenticate,
            'listening': this.handleSubscription,
            'trade_updates': this.handleTradeUpdate,
        };
        const method = this.safeValue (methods, stream);
        if (method !== undefined) {
            method.call (this, client, message);
        }
    }

    handleMessage (client: Client, message) {
        if (Array.isArray (message)) {
            this.handleCryptoMessage (client, message);
            return;
        }
        this.handleTradingMessage (client, message);
    }

    handleAuthenticate (client: Client, message) {
        //
        //
        const T = this.safeString (message, 'T');
        const data = this.safeValue (message, 'data', {});
        const status = this.safeString (data, 'status');
        if (T === 'success' || status === 'authorized') {
            const promise = client.futures['authenticated'];
            promise.resolve (message);
            return;
        }
        throw new AuthenticationError (this.id + ' failed to authenticate.');
    }

    handleSubscription (client: Client, message) {
        //
        //
        return message;
    }
}
