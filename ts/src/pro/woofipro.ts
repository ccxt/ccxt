// ----------------------------------------------------------------------------

import woofiproRest from '../woofipro.js';
import { ExchangeError, AuthenticationError } from '../base/errors.js';
import { ArrayCacheByTimestamp, ArrayCacheBySymbolById, ArrayCache, ArrayCacheBySymbolBySide } from '../base/ws/Cache.js';
import { Precise } from '../base/Precise.js';
import { sha256 } from '../static_dependencies/noble-hashes/sha256.js';
import type { Int, Str, Strings, OrderBook, Order, Trade, Ticker, Tickers, OHLCV, Balances, Position } from '../base/types.js';
import Client from '../base/ws/Client.js';

// ----------------------------------------------------------------------------

export default class woofipro extends woofiproRest {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchBalance': true,
                'watchMyTrades': false,
                'watchOHLCV': true,
                'watchOrderBook': true,
                'watchOrders': true,
                'watchTicker': true,
                'watchTickers': true,
                'watchTrades': true,
                'watchPositions': true,
            },
            'urls': {
                'api': {
                    'ws': {
                        'public': 'wss://ws-evm.orderly.org/ws/stream',
                        'private': 'wss://ws-private-evm.orderly.org/v2/ws/private/stream',
                    },
                },
                'test': {
                    'ws': {
                        'public': 'wss://testnet-ws-evm.orderly.org/ws/stream',
                        'private': 'wss://testnet-ws-private-evm.orderly.org/v2/ws/private/stream',
                    },
                },
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
                'uid': true,
            },
            'options': {
                'tradesLimit': 1000,
                'ordersLimit': 1000,
                'requestId': {},
                'watchPositions': {
                    'fetchPositionsSnapshot': true, // or false
                    'awaitPositionsSnapshot': true, // whether to wait for the positions snapshot before providing updates
                },
            },
            'streaming': {
                'ping': this.ping,
                'keepAlive': 10000,
            },
            'exceptions': {
                'ws': {
                    'exact': {
                        'Auth is needed.': AuthenticationError,
                    },
                },
            },
        });
    }

    requestId (url) {
        const options = this.safeValue (this.options, 'requestId', {});
        const previousValue = this.safeInteger (options, url, 0);
        const newValue = this.sum (previousValue, 1);
        this.options['requestId'][url] = newValue;
        return newValue;
    }

    async watchPublic (messageHash, message) {
        const url = this.urls['api']['ws']['public'] + '/' + this.uid;
        const requestId = this.requestId (url);
        const subscribe = {
            'id': requestId,
        };
        const request = this.extend (subscribe, message);
        return await this.watch (url, messageHash, request, messageHash, subscribe);
    }

    async watchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        /**
         * @method
         * @name woofipro#watchOrderBook
         * @see https://orderly.network/docs/build-on-evm/evm-api/websocket-api/public/orderbook
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int} [limit] the maximum amount of order book entries to return.
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const name = 'orderbook';
        const market = this.market (symbol);
        const topic = market['id'] + '@' + name;
        const request = {
            'event': 'subscribe',
            'topic': topic,
        };
        const message = this.extend (request, params);
        const orderbook = await this.watchPublic (topic, message);
        return orderbook.limit ();
    }

    handleOrderBook (client: Client, message) {
        //
        //     {
        //         "topic": "PERP_BTC_USDC@orderbook",
        //         "ts": 1650121915308,
        //         "data": {
        //             "symbol": "PERP_BTC_USDC",
        //             "bids": [
        //                 [
        //                     0.30891,
        //                     2469.98
        //                 ]
        //             ],
        //             "asks": [
        //                 [
        //                     0.31075,
        //                     2379.63
        //                 ]
        //             ]
        //         }
        //     }
        //
        const data = this.safeValue (message, 'data');
        const marketId = this.safeString (data, 'symbol');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const topic = this.safeString (message, 'topic');
        let orderbook = this.safeValue (this.orderbooks, symbol);
        if (orderbook === undefined) {
            orderbook = this.orderBook ({});
        }
        const timestamp = this.safeInteger (message, 'ts');
        const snapshot = this.parseOrderBook (data, symbol, timestamp, 'bids', 'asks');
        orderbook.reset (snapshot);
        client.resolve (orderbook, topic);
    }

    async watchTicker (symbol: string, params = {}): Promise<Ticker> {
        /**
         * @method
         * @name woofipro#watchTicker
         * @see https://orderly.network/docs/build-on-evm/evm-api/websocket-api/public/24-hour-ticker
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        const name = 'ticker';
        const market = this.market (symbol);
        symbol = market['symbol'];
        const topic = market['id'] + '@' + name;
        const request = {
            'event': 'subscribe',
            'topic': topic,
        };
        const message = this.extend (request, params);
        return await this.watchPublic (topic, message);
    }

    parseWsTicker (ticker, market = undefined) {
        //
        //     {
        //         "symbol": "PERP_BTC_USDC",
        //         "open": 19441.5,
        //         "close": 20147.07,
        //         "high": 20761.87,
        //         "low": 19320.54,
        //         "volume": 2481.103,
        //         "amount": 50037935.0286,
        //         "count": 3689
        //     }
        //
        return this.safeTicker ({
            'symbol': this.safeSymbol (undefined, market),
            'timestamp': undefined,
            'datetime': undefined,
            'high': this.safeString (ticker, 'high'),
            'low': this.safeString (ticker, 'low'),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': this.safeString (ticker, 'open'),
            'close': this.safeString (ticker, 'close'),
            'last': undefined,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeString (ticker, 'volume'),
            'quoteVolume': this.safeString (ticker, 'amount'),
            'info': ticker,
        }, market);
    }

    handleTicker (client: Client, message) {
        //
        //     {
        //         "topic": "PERP_BTC_USDC@ticker",
        //         "ts": 1657120017000,
        //         "data": {
        //             "symbol": "PERP_BTC_USDC",
        //             "open": 19441.5,
        //             "close": 20147.07,
        //             "high": 20761.87,
        //             "low": 19320.54,
        //             "volume": 2481.103,
        //             "amount": 50037935.0286,
        //             "count": 3689
        //         }
        //     }
        //
        const data = this.safeValue (message, 'data');
        const topic = this.safeValue (message, 'topic');
        const marketId = this.safeString (data, 'symbol');
        const market = this.safeMarket (marketId);
        const timestamp = this.safeInteger (message, 'ts');
        data['date'] = timestamp;
        const ticker = this.parseWsTicker (data, market);
        ticker['symbol'] = market['symbol'];
        this.tickers[market['symbol']] = ticker;
        client.resolve (ticker, topic);
        return message;
    }

    async watchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        /**
         * @method
         * @name woofipro#watchTickers
         * @see https://orderly.network/docs/build-on-evm/evm-api/websocket-api/public/24-hour-tickers
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
         * @param {string[]} symbols unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const name = 'tickers';
        const topic = name;
        const request = {
            'event': 'subscribe',
            'topic': topic,
        };
        const message = this.extend (request, params);
        const tickers = await this.watchPublic (topic, message);
        return this.filterByArray (tickers, 'symbol', symbols);
    }

    handleTickers (client: Client, message) {
        //
        //     {
        //         "topic":"tickers",
        //         "ts":1618820615000,
        //         "data":[
        //             {
        //                 "symbol":"PERP_NEAR_USDC",
        //                 "open":16.297,
        //                 "close":17.183,
        //                 "high":24.707,
        //                 "low":11.997,
        //                 "volume":0,
        //                 "amount":0,
        //                 "count":0
        //             },
        //         ...
        //         ]
        //     }
        //
        const topic = this.safeValue (message, 'topic');
        const data = this.safeValue (message, 'data');
        const timestamp = this.safeInteger (message, 'ts');
        const result = [];
        for (let i = 0; i < data.length; i++) {
            const marketId = this.safeString (data[i], 'symbol');
            const market = this.safeMarket (marketId);
            const ticker = this.parseWsTicker (this.extend (data[i], { 'date': timestamp }), market);
            this.tickers[market['symbol']] = ticker;
            result.push (ticker);
        }
        client.resolve (result, topic);
    }

    async watchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        /**
         * @method
         * @name woofipro#watchOHLCV
         * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @see https://orderly.network/docs/build-on-evm/evm-api/websocket-api/public/k-line
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int} [since] timestamp in ms of the earliest candle to fetch
         * @param {int} [limit] the maximum amount of candles to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        if ((timeframe !== '1m') && (timeframe !== '5m') && (timeframe !== '15m') && (timeframe !== '30m') && (timeframe !== '1h') && (timeframe !== '1d') && (timeframe !== '1w') && (timeframe !== '1M')) {
            throw new ExchangeError (this.id + ' watchOHLCV timeframe argument must be 1m, 5m, 15m, 30m, 1h, 1d, 1w, 1M');
        }
        const market = this.market (symbol);
        const interval = this.safeString (this.timeframes, timeframe, timeframe);
        const name = 'kline';
        const topic = market['id'] + '@' + name + '_' + interval;
        const request = {
            'event': 'subscribe',
            'topic': topic,
        };
        const message = this.extend (request, params);
        const ohlcv = await this.watchPublic (topic, message);
        if (this.newUpdates) {
            limit = ohlcv.getLimit (market['symbol'], limit);
        }
        return this.filterBySinceLimit (ohlcv, since, limit, 0, true);
    }

    handleOHLCV (client: Client, message) {
        //
        //     {
        //         "topic":"PERP_BTC_USDC@kline_1m",
        //         "ts":1618822432146,
        //         "data":{
        //             "symbol":"PERP_BTC_USDC",
        //             "type":"1m",
        //             "open":56948.97,
        //             "close":56891.76,
        //             "high":56948.97,
        //             "low":56889.06,
        //             "volume":44.00947568,
        //             "amount":2504584.9,
        //             "startTime":1618822380000,
        //             "endTime":1618822440000
        //         }
        //     }
        //
        const data = this.safeValue (message, 'data');
        const topic = this.safeValue (message, 'topic');
        const marketId = this.safeString (data, 'symbol');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const interval = this.safeString (data, 'type');
        const timeframe = this.findTimeframe (interval);
        const parsed = [
            this.safeInteger (data, 'startTime'),
            this.safeFloat (data, 'open'),
            this.safeFloat (data, 'high'),
            this.safeFloat (data, 'low'),
            this.safeFloat (data, 'close'),
            this.safeFloat (data, 'volume'),
        ];
        this.ohlcvs[symbol] = this.safeValue (this.ohlcvs, symbol, {});
        let stored = this.safeValue (this.ohlcvs[symbol], timeframe);
        if (stored === undefined) {
            const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
            stored = new ArrayCacheByTimestamp (limit);
            this.ohlcvs[symbol][timeframe] = stored;
        }
        stored.append (parsed);
        client.resolve (stored, topic);
    }

    async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        /**
         * @method
         * @name woofipro#watchTrades
         * @description watches information on multiple trades made in a market
         * @see https://orderly.network/docs/build-on-evm/evm-api/websocket-api/public/trade
         * @param {string} symbol unified market symbol of the market trades were made in
         * @param {int} [since] the earliest time in ms to fetch trades for
         * @param {int} [limit] the maximum number of trade structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const topic = market['id'] + '@trade';
        const request = {
            'event': 'subscribe',
            'topic': topic,
        };
        const message = this.extend (request, params);
        const trades = await this.watchPublic (topic, message);
        if (this.newUpdates) {
            limit = trades.getLimit (market['symbol'], limit);
        }
        return this.filterBySymbolSinceLimit (trades, symbol, since, limit, true);
    }

    handleTrade (client: Client, message) {
        //
        // {
        //     "topic":"PERP_ADA_USDC@trade",
        //     "ts":1618820361552,
        //     "data":{
        //         "symbol":"PERP_ADA_USDC",
        //         "price":1.27988,
        //         "size":300,
        //         "side":"BUY",
        //     }
        // }
        //
        const topic = this.safeString (message, 'topic');
        const timestamp = this.safeInteger (message, 'ts');
        const data = this.safeValue (message, 'data');
        const marketId = this.safeString (data, 'symbol');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const trade = this.parseWsTrade (this.extend (data, { 'timestamp': timestamp }), market);
        let tradesArray = this.safeValue (this.trades, symbol);
        if (tradesArray === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            tradesArray = new ArrayCache (limit);
        }
        tradesArray.append (trade);
        this.trades[symbol] = tradesArray;
        client.resolve (tradesArray, topic);
    }

    parseWsTrade (trade, market = undefined) {
        //
        //     {
        //         "symbol":"PERP_ADA_USDC",
        //         "timestamp":1618820361552,
        //         "price":1.27988,
        //         "size":300,
        //         "side":"BUY",
        //     }
        //
        const marketId = this.safeString (trade, 'symbol');
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        const price = this.safeString (trade, 'price');
        const amount = this.safeString (trade, 'size');
        const cost = Precise.stringMul (price, amount);
        const side = this.safeStringLower (trade, 'side');
        const timestamp = this.safeInteger (trade, 'timestamp');
        return this.safeTrade ({
            'id': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'order': undefined,
            'takerOrMaker': undefined,
            'type': undefined,
            'fee': undefined,
            'info': trade,
        }, market);
    }

    checkRequiredUid (error = true) {
        if (!this.uid) {
            if (error) {
                throw new AuthenticationError (this.id + ' requires `uid` credential');
            } else {
                return false;
            }
        }
        return true;
    }

    handleErrorMessage (client: Client, message) {
        //
        // {"id":"1","event":"subscribe","success":false,"ts":1710780997216,"errorMsg":"Auth is needed."}
        //
        if (!('success' in message)) {
            return false;
        }
        const success = this.safeBool (message, 'success');
        if (success) {
            return false;
        }
        const errorMessage = this.safeString (message, 'errorMsg');
        try {
            if (errorMessage !== undefined) {
                const feedback = this.id + ' ' + this.json (message);
                this.throwExactlyMatchedException (this.exceptions['exact'], errorMessage, feedback);
            }
            return false;
        } catch (error) {
            if (error instanceof AuthenticationError) {
                const messageHash = 'authenticated';
                client.reject (error, messageHash);
                if (messageHash in client.subscriptions) {
                    delete client.subscriptions[messageHash];
                }
            } else {
                client.reject (error);
            }
            return true;
        }
    }

    handleMessage (client: Client, message) {
        if (this.handleErrorMessage (client, message)) {
            return;
        }
        const methods = {
            'ping': this.handlePing,
            'pong': this.handlePong,
            'subscribe': this.handleSubscribe,
            'orderbook': this.handleOrderBook,
            'ticker': this.handleTicker,
            'tickers': this.handleTickers,
            'kline': this.handleOHLCV,
            'trade': this.handleTrade,
        };
        const event = this.safeString (message, 'event');
        let method = this.safeValue (methods, event);
        if (method !== undefined) {
            method.call (this, client, message);
            return;
        }
        const topic = this.safeString (message, 'topic');
        if (topic !== undefined) {
            method = this.safeValue (methods, topic);
            if (method !== undefined) {
                method.call (this, client, message);
                return;
            }
            const splitTopic = topic.split ('@');
            const splitLength = splitTopic.length;
            if (splitLength === 2) {
                const name = this.safeString (splitTopic, 1);
                method = this.safeValue (methods, name);
                if (method !== undefined) {
                    method.call (this, client, message);
                    return;
                }
                const splitName = name.split ('_');
                const splitNameLength = splitTopic.length;
                if (splitNameLength === 2) {
                    method = this.safeValue (methods, this.safeString (splitName, 0));
                    if (method !== undefined) {
                        method.call (this, client, message);
                    }
                }
            }
        }
    }

    ping (client: Client) {
        return { 'event': 'ping' };
    }

    handlePing (client: Client, message) {
        return { 'event': 'pong' };
    }

    handlePong (client: Client, message) {
        //
        // { event: "pong", ts: 1614667590000 }
        //
        client.lastPong = this.milliseconds ();
        return message;
    }

    handleSubscribe (client: Client, message) {
        //
        //     {
        //         "id": "666888",
        //         "event": "subscribe",
        //         "success": true,
        //         "ts": 1657117712212
        //     }
        //
        return message;
    }
}
