//  ---------------------------------------------------------------------------

import xcoinRest from '../xcoin.js';
import { ArrayCache, ArrayCacheBySymbolById, ArrayCacheBySymbolBySide, ArrayCacheByTimestamp } from '../base/ws/Cache.js';
import { Balances, Dict, Int, Market, OHLCV, Order, OrderBook, Position, Str, Strings, Ticker, Tickers, Trade } from '../base/types.js';
import Client from '../base/ws/Client.js';
import { sha256 } from '../static_dependencies/noble-hashes/sha256.js';
import { Precise } from '../base/Precise.js';
import { ArgumentsRequired, AuthenticationError, ExchangeError } from '../base/errors.js';

// ----------------------------------------------------------------------------

/**
 * @class xcoin
 * @augments Exchange
 * @description XCoin WebSocket API implementation
 */
export default class xcoin extends xcoinRest {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchBalance': true,
                'watchMyTrades': true,
                'watchOHLCV': true,
                'watchOrderBook': true,
                'watchOrderBookForSymbols': false,
                'watchOrders': true,
                'watchPositions': true,
                'watchTicker': true,
                'watchTickers': true,
                'watchTrades': true,
                'watchTradesForSymbols': false,
                'watchBidsAsks': true,
            },
            'urls': {
                'api': {
                    'ws': {
                        'public': 'wss://stream.xcoin.com/ws/public/v1/market',
                        'private': 'wss://stream.xcoin.com/ws/private',
                    },
                },
            },
            'options': {
                'tradesLimit': 1000,
                'ordersLimit': 1000,
                'OHLCVLimit': 1000,
                'watchOrderBookForSymbols': {
                    'depth': 30, // 5, 10, 20, 30
                    'interval': 100, // 100, 500, 1000 ms
                },
                'watchTicker': {
                    'channel': 'ticker24hr', // ticker24hr or miniTicker
                },
                'watchTickers': {
                    'channel': 'ticker24hr', // ticker24hr or miniTicker
                },
            },
            'streaming': {
                'keepAlive': 30000,
                'ping': this.ping,
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '4h': '4h',
                '1d': '1d',
                '1w': '1w',
            },
        });
    }

    async publicWatch (unifiedHash: string, exchangeChannel: string, symbols = undefined, params = {}) {
        const url = this.urls['api']['ws']['public'];
        const channelMap = {
            'spot': 'spot',
            'swap': 'linear_perpetual',
            'future': 'linear_futures',
        };
        const pluralMethods = {
            'orderBook': 'watchOrderBooks',
            'ticker': 'watchTickers',
        };
        let messageHash = unifiedHash;
        const requestObjects = [];
        symbols = this.marketSymbols (symbols, undefined, true, true);
        const symbolsLength = symbols.length;
        const isSingleSymbol = (symbolsLength !== undefined) && (symbolsLength === 1);
        if (isSingleSymbol) {
            const market = this.market (symbols[0]);
            requestObjects.push ({
                'symbol': market['id'],
                'stream': exchangeChannel,
                'businessType': this.safeString (channelMap, market['type']),
            });
            const subscribe = {
                'event': 'subscribe',
                'data': requestObjects,
            };
            const request = this.deepExtend (subscribe, params);
            messageHash = messageHash + ':' + market['symbol'];
            return await this.watch (url, messageHash, request, messageHash);
        } else {
            const messageHashes = [];
            if (symbolsLength > 1) {
                for (let i = 0; i < symbolsLength; i++) {
                    const market = this.market (symbols[i]);
                    requestObjects.push ({
                        'symbol': market['id'],
                        'stream': exchangeChannel,
                        'businessType': this.safeString (channelMap, market['type']),
                    });
                    messageHashes.push (unifiedHash + ':' + market['symbol']);
                }
            } else {
                messageHash = messageHash + 's';
                let marketType: Str = undefined;
                const callingMethod = this.safeString (pluralMethods, unifiedHash, unifiedHash);
                [ marketType, params ] = this.handleOptionAndParams (params, callingMethod, 'type');
                requestObjects.push ({
                    'stream': exchangeChannel,
                    'businessType': this.safeString (channelMap, marketType),
                });
                messageHash = messageHash + ':' + 's';
                messageHashes.push (messageHash);
            }
            const subscribe = {
                'event': 'subscribe',
                'data': requestObjects,
            };
            const request = this.deepExtend (subscribe, params);
            return await this.watchMultiple (url, messageHashes, request, messageHashes);
        }
    }

    async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        /**
         * watches information on multiple trades made in a market
         * @see https://xcoin.com/docs/coinApi/websocket-stream/public-channel/trade-channel
         * @param {string} symbol unified market symbol of the market trades were made in
         * @param {int} [since] the earliest time in ms to fetch trades for
         * @param {int} [limit] the maximum number of trade structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
         */
        return this.watchTradesForSymbols ([ symbol ], since, limit, params);
    }

    async watchTradesForSymbols (symbols: string[], since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        /**
         * @method
         * @name apex#watchTradesForSymbols
         * @description get the list of most recent trades for a list of symbols
         * @see https://xcoin.com/docs/coinApi/websocket-stream/public-channel/trade-channel
         * @param {string[]} symbols unified symbol of the market to fetch trades for
         * @param {int} [since] timestamp in ms of the earliest trade to fetch
         * @param {int} [limit] the maximum amount of trades to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
         */
        await this.loadMarkets ();
        const trades = await this.publicWatch ('trade', 'trade', symbols, params);
        if (this.newUpdates) {
            const first = this.safeDict (trades, 0);
            const symbol = this.safeString (first, 'symbol');
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    handleTrade (client: Client, message: any) {
        //
        //    {
        //        "businessType": "linear_perpetual",
        //        "symbol": "BTC-USDT-PERP",
        //        "stream": "trade",
        //        "data": [
        //            {
        //                "symbol": "BTC-USDT-PERP",
        //                "id": "1151458165",
        //                "side": "buy",
        //                "price": "104613.3",
        //                "qty": "0.5435",
        //                "time": "1762238885070"
        //            }
        //        ],
        //        "ts": 1762238885074
        //    }
        //
        const marketId = this.safeString (message, 'symbol');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const data = this.safeList (message, 'data', []);
        const messageHash = 'trade:' + symbol;
        if (!(symbol in this.trades)) {
            const options = this.safeDict (this.options, 'ws', {});
            const limit = this.safeInteger (options, 'trades', 1000);
            this.trades[symbol] = new ArrayCache (limit);
        }
        const trades = this.trades[symbol];
        for (let i = 0; i < data.length; i++) {
            const trade = this.parseWsTrade (data[i], market);
            trades.append (trade);
        }
        client.resolve (trades, messageHash);
        client.resolve (trades, 'trades');
    }

    parseWsTrade (trade: any, market: any = undefined): Trade {
        //
        // public trade
        //
        //    {
        //        "businessType": "linear_perpetual",
        //        "symbol": "BTC-USDT-PERP",
        //        "stream": "trade",
        //        "data": [
        //            {
        //                "symbol": "BTC-USDT-PERP",
        //                "id": "1151486270",
        //                "side": "sell",
        //                "price": "104541.6",
        //                "qty": "0.0009",
        //                "time": "1762239293764"
        //            }
        //        ],
        //        "ts": 1762239293767
        //    }
        //
        //
        // myTrades (from tradeList in order)
        //
        //
        const timestamp = this.safeInteger (trade, 'time');
        const marketId = this.safeString (trade, 'symbol');
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        return this.safeTrade ({
            'id': this.safeString (trade, 'id'),
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': undefined,
            'type': this.safeStringLower (trade, 'orderType'),
            'side': this.safeStringLower (trade, 'side'),
            'takerOrMaker': undefined,
            'price': this.safeString (trade, 'price'),
            'amount': this.safeString (trade, 'qty'),
            'cost': undefined,
            'fee': undefined,
        }, market);
    }

    async watchTicker (symbol: string, params = {}): Promise<Ticker> {
        /**
         * watches a price ticker, a statistical calculation with the information for a specific market
         * @see https://xcoin.com/docs/coinApi/websocket-stream/public-channel/24h-ticker-channel
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        symbol = this.symbol (symbol);
        let wsChannel: Str = undefined;
        [ wsChannel, params ] = this.handleOptionAndParams (params, 'watchTicker', 'channel', 'ticker24hr');
        return await this.publicWatch ('ticker', wsChannel, [ symbol ], params);
    }

    async watchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        /**
         * watches a price ticker, a statistical calculation with the information for all markets
         * @see https://xcoin.com/docs/coinApi/websocket-stream/public-channel/24h-ticker-channel
         * @param {string[]} symbols unified symbols of the markets to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        let wsChannel: Str = undefined;
        [ wsChannel, params ] = this.handleOptionAndParams (params, 'watchTickers', 'channel', 'ticker24hr');
        const tickers = await this.publicWatch ('ticker', wsChannel, symbols, params);
        return this.filterByArray (tickers, 'symbol', symbols);
    }

    handleTicker (client: Client, message: any) {
        //
        //    {
        //        "businessType": "linear_perpetual",
        //        "symbol": "BTC-USDT-PERP",
        //        "stream": "ticker24hr",
        //        "data": [
        //            {
        //                "symbol": "BTC-USDT-PERP",
        //                "priceChange": "-2777.3",
        //                "priceChangePercent": "-0.026546295676776173",
        //                "lastPrice": "101843.7",
        //                "highPrice": "104799.9",
        //                "lowPrice": "98889.3",
        //                "fillQty": "155914.9386",
        //                "fillAmount": "15865232612.32784",
        //                "count": "701637"
        //            }
        //        ],
        //        "ts": 1762328284542
        //    }
        //
        const marketId = this.safeString (message, 'symbol');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const data = this.safeList (message, 'data', []);
        const newTickers = {};
        for (let i = 0; i < data.length; i++) {
            const ticker = this.parseWsTicker (data[i], market);
            newTickers[symbol] = ticker;
            this.tickers[symbol] = ticker;
            client.resolve (ticker, 'ticker:' + symbol);
        }
        client.resolve (newTickers, 'tickers');
    }

    parseWsTicker (ticker: any, market: any = undefined): Ticker {
        return this.safeTicker ({
            'symbol': this.safeSymbol (this.safeString (ticker, 'symbol'), market),
            'timestamp': undefined,
            'datetime': undefined,
            'high': this.safeString (ticker, 'highPrice'),
            'low': this.safeString (ticker, 'lowPrice'),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': this.safeString (ticker, 'lastPrice'),
            'previousClose': undefined,
            'change': this.safeString (ticker, 'priceChange'),
            'percentage': this.safeString (ticker, 'priceChangePercent'),
            'average': undefined,
            'baseVolume': this.safeString (ticker, 'fillQty'),
            'quoteVolume': this.safeString (ticker, 'fillAmount'),
            'info': ticker,
        }, market);
    }

    async watchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        /**
         * watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @see https://xcoin.com/docs/coinApi/websocket-stream/public-channel/incremental-depth-channel
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int} [limit] the maximum amount of order book entries to return
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.interval] 100ms or 1000ms, default is 100ms
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
    }

    async watchOrderBookForSymbols (symbols: string[], limit: Int = undefined, params = {}): Promise<OrderBook> {
        /**
         * @method
         * @name xcoin#watchOrderBookForSymbols
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @see https://xcoin.com/docs/coinApi/websocket-stream/public-channel/incremental-depth-channel
         * @param {string[]} symbols unified array of symbols
         * @param {int} [limit] the maximum amount of order book entries to return
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {boolean} [params.uta] set to true for the unified trading account (uta), defaults to false
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        let interval = undefined;
        [ interval, params ] = this.handleOptionAndParams (params, 'watchOrderBook', 'interval', 100);
        const orderbook = await this.publicWatch ('orderbook', 'depthlevels#' + interval.toString () + 'ms', symbols, params);
        return orderbook.limit ();
    }

    async watchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        /**
         * watches historical candlestick data containing the open, high, low, close price, and the volume of a market
         * @see https://xcoin.com/docs/coinApi/websocket-stream/public-channel/kline-channel
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int} [since] timestamp in ms of the earliest candle to fetch
         * @param {int} [limit] the maximum amount of candles to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const interval = this.safeString (this.timeframes, timeframe, timeframe);
        const url = this.urls['api']['ws']['public'];
        const messageHash = 'kline:' + symbol + ':' + timeframe;
        const subscribe = {
            'event': 'subscribe',
            'data': [
                {
                    'businessType': market['spot'] ? 'spot' : 'linear_perpetual',
                    'symbol': market['id'],
                    'stream': 'kline#' + interval,
                },
            ],
        };
        const request = this.deepExtend (subscribe, params);
        const ohlcv = await this.watch (url, messageHash, request, messageHash);
        if (this.newUpdates) {
            limit = ohlcv.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (ohlcv, since, limit, 0, true);
    }

    async watchBidsAsks (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        /**
         * watches best bid & ask for symbols
         * @see https://xcoin.com/docs/coinApi/websocket-stream/public-channel/limited-depth-levels-channel
         * @param {string[]} symbols unified symbols of the markets to fetch the bids/asks for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const url = this.urls['api']['ws']['public'];
        const messageHash = 'bidsasks';
        const data = [];
        
        if (symbols === undefined) {
            throw new ArgumentsRequired (this.id + ' watchBidsAsks() requires a symbols argument');
        }
        
        for (let i = 0; i < symbols.length; i++) {
            const market = this.market (symbols[i]);
            data.push ({
                'businessType': market['spot'] ? 'spot' : 'linear_perpetual',
                'symbol': market['id'],
                'stream': 'depthlevels#1000ms',
                'levels': '1',
                'group': '1',
            });
        }
        
        const subscribe = {
            'event': 'subscribe',
            'data': data,
        };
        const request = this.deepExtend (subscribe, params);
        const bidsasks = await this.watch (url, messageHash, request, messageHash);
        return this.filterByArray (bidsasks, 'symbol', symbols);
    }

    async watchBalance (params = {}): Promise<Balances> {
        /**
         * query for balance and get the amount of funds available for trading or funds locked in orders
         * @see https://xcoin.com/docs/coinApi/websocket-stream/private-channel/trading-account-channel
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
         */
        await this.loadMarkets ();
        await this.authenticate (params);
        const url = this.urls['api']['ws']['private'];
        const messageHash = 'balance';
        const subscribe = {
            'event': 'subscribe',
            'data': [
                {
                    'stream': 'trading_account',
                },
            ],
        };
        const request = this.deepExtend (subscribe, params);
        return await this.watch (url, messageHash, request, messageHash);
    }

    async watchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        /**
         * watches information on multiple orders made by the user
         * @see https://xcoin.com/docs/coinApi/websocket-stream/private-channel/order-channel
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int} [since] the earliest time in ms to fetch orders for
         * @param {int} [limit] the maximum number of order structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        await this.authenticate (params);
        let market = undefined;
        let messageHash = 'orders';
        if (symbol !== undefined) {
            market = this.market (symbol);
            symbol = market['symbol'];
            messageHash = 'orders:' + symbol;
        }
        const url = this.urls['api']['ws']['private'];
        const subscribe = {
            'event': 'subscribe',
            'data': [
                {
                    'stream': 'order',
                },
            ],
        };
        const request = this.deepExtend (subscribe, params);
        const orders = await this.watch (url, messageHash, request, messageHash);
        if (this.newUpdates) {
            limit = orders.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (orders, symbol, since, limit, true);
    }

    async watchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        /**
         * watches information on multiple trades made by the user (from order fills)
         * @see https://xcoin.com/docs/coinApi/websocket-stream/private-channel/order-channel
         * @param {string} symbol unified market symbol of the market trades were made in
         * @param {int} [since] the earliest time in ms to fetch trades for
         * @param {int} [limit] the maximum number of trade structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
         */
        // Note: xcoin sends trades within order updates, so we reuse watchOrders
        await this.loadMarkets ();
        await this.authenticate (params);
        let market = undefined;
        let messageHash = 'myTrades';
        if (symbol !== undefined) {
            market = this.market (symbol);
            symbol = market['symbol'];
            messageHash = 'myTrades:' + symbol;
        }
        const url = this.urls['api']['ws']['private'];
        const subscribe = {
            'event': 'subscribe',
            'data': [
                {
                    'stream': 'order',
                },
            ],
        };
        const request = this.deepExtend (subscribe, params);
        const trades = await this.watch (url, messageHash, request, messageHash);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (trades, symbol, since, limit, true);
    }

    async watchPositions (symbols: Strings = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Position[]> {
        /**
         * watch all open positions
         * @see https://xcoin.com/docs/coinApi/websocket-stream/private-channel/position-channel
         * @param {string[]|undefined} symbols list of unified market symbols
         * @param {object} params extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/en/latest/manual.html#position-structure}
         */
        await this.loadMarkets ();
        await this.authenticate (params);
        symbols = this.marketSymbols (symbols);
        const url = this.urls['api']['ws']['private'];
        const messageHash = 'positions';
        const subscribe = {
            'event': 'subscribe',
            'data': [
                {
                    'stream': 'position',
                },
            ],
        };
        const request = this.deepExtend (subscribe, params);
        const positions = await this.watch (url, messageHash, request, messageHash);
        return this.filterBySymbolsSinceLimit (positions, symbols, since, limit, true);
    }

    handleOrderBook (client: Client, message: any) {
        //
        // Incremental depth update
        // {
        //     "businessType": "spot",
        //     "symbol": "BTC-USDT",
        //     "stream": "depth#100ms",
        //     "data": [{
        //         "symbol": "BTC-USDT",
        //         "bids": [["65000", "0.1"], ["65001", "0.1"]],
        //         "asks": [["65000", "0.1"], ["65001", "0.1"]],
        //         "preUpdateId": "99",
        //         "lastUpdateId": "100"
        //     }],
        //     "ts": "1732256095953"
        // }
        //
        // Limited depth levels
        // {
        //     "businessType": "spot",
        //     "symbol": "BTC-USDT",
        //     "stream": "depthlevels#1000ms#5#1",
        //     "data": [{
        //         "symbol": "BTC-USDT",
        //         "lastUpdateId": "2888033",
        //         "bids": [["85000", "67.5586"]],
        //         "asks": [["85510", "7.09"]],
        //         "group": "1"
        //     }],
        //     "ts": 1754999207653
        // }
        //
        const marketId = this.safeString (message, 'symbol');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const data = this.safeValue (message, 'data', []);
        const stream = this.safeString (message, 'stream', '');
        
        if (data.length > 0) {
            const update = data[0];
            const timestamp = this.safeInteger (message, 'ts');
            const bids = this.safeValue (update, 'bids', []);
            const asks = this.safeValue (update, 'asks', []);
            
            let messageHash = 'depth:' + symbol;
            if (stream.indexOf ('depthlevels') >= 0) {
                messageHash = 'bidsasks';
            }
            
            let orderbook = this.safeValue (this.orderbooks, symbol);
            if (orderbook === undefined) {
                orderbook = this.orderBook ({});
                this.orderbooks[symbol] = orderbook;
            }
            
            // Check if this is a snapshot (has many levels) or update (has few changes)
            const isSnapshot = (bids.length > 10) || (asks.length > 10);
            if (isSnapshot) {
                const snapshot = this.parseOrderBook (update, symbol, timestamp, 'bids', 'asks');
                orderbook.reset (snapshot);
            } else {
                // Incremental update
                this.handleDeltas (orderbook['bids'], bids);
                this.handleDeltas (orderbook['asks'], asks);
                orderbook['timestamp'] = timestamp;
                orderbook['datetime'] = this.iso8601 (timestamp);
            }
            
            client.resolve (orderbook, messageHash);
            
            // For bidsasks, also create a ticker-like structure
            if (stream.indexOf ('depthlevels') >= 0) {
                const ticker = {
                    'symbol': symbol,
                    'bid': this.safeFloat (bids, [0, 0]),
                    'bidVolume': this.safeFloat (bids, [0, 1]),
                    'ask': this.safeFloat (asks, [0, 0]),
                    'askVolume': this.safeFloat (asks, [0, 1]),
                    'timestamp': timestamp,
                    'datetime': this.iso8601 (timestamp),
                    'info': update,
                };
                if (this.bidsasks === undefined) {
                    this.bidsasks = {};
                }
                this.bidsasks[symbol] = ticker;
                client.resolve (this.bidsasks, 'bidsasks');
            }
        }
    }

    handleDelta (bookside: any, delta: any) {
        const price = this.safeFloat (delta, 0);
        const amount = this.safeFloat (delta, 1);
        bookside.store (price, amount);
    }

    handleDeltas (bookside: any, deltas: any) {
        for (let i = 0; i < deltas.length; i++) {
            this.handleDelta (bookside, deltas[i]);
        }
    }

    handleOHLCV (client: Client, message: any) {
        //
        // {
        //     "businessType": "spot",
        //     "symbol": "BTC-USDT",
        //     "stream": "kline#1m",
        //     "data": [{
        //         "symbol": "BTC-USDT",
        //         "period": "1m",
        //         "openTime": "1747290000000",
        //         "closeTime": "1747290052647",
        //         "openPrice": "102510.8",
        //         "closePrice": "102476",
        //         "highPrice": "102510.8",
        //         "lowPrice": "102476",
        //         "volume": "246.521",
        //         "quoteVolume": "25267402.2798",
        //         "count": "46"
        //     }],
        //     "ts": "1732256095953"
        // }
        //
        const marketId = this.safeString (message, 'symbol');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const data = this.safeValue (message, 'data', []);
        
        if (data.length > 0) {
            const kline = data[0];
            const period = this.safeString (kline, 'period');
            const timeframe = this.findTimeframe (period);
            const parsed = this.parseOHLCV (kline, market);
            const messageHash = 'kline:' + symbol + ':' + timeframe;
            
            let stored = this.safeValue (this.ohlcvs, symbol);
            if (stored === undefined) {
                stored = {};
                this.ohlcvs[symbol] = stored;
            }
            
            let storedArray = this.safeValue (stored, timeframe);
            if (storedArray === undefined) {
                const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
                storedArray = new ArrayCacheByTimestamp (limit);
                stored[timeframe] = storedArray;
            }
            
            const length = storedArray.length;
            if (length && parsed[0] === storedArray.array[length - 1][0]) {
                // Update the last candle
                storedArray.array[length - 1] = parsed;
            } else {
                // Append new candle
                storedArray.append (parsed);
            }
            
            client.resolve (storedArray, messageHash);
        }
    }

    parseOHLCV (ohlcv: any, market: any = undefined): OHLCV {
        //
        // {
        //     "symbol": "BTC-USDT",
        //     "period": "1m",
        //     "openTime": "1747290000000",
        //     "closeTime": "1747290052647",
        //     "openPrice": "102510.8",
        //     "closePrice": "102476",
        //     "highPrice": "102510.8",
        //     "lowPrice": "102476",
        //     "volume": "246.521",
        //     "quoteVolume": "25267402.2798",
        //     "count": "46"
        // }
        //
        return [
            this.safeInteger (ohlcv, 'openTime'),
            this.safeNumber (ohlcv, 'openPrice'),
            this.safeNumber (ohlcv, 'highPrice'),
            this.safeNumber (ohlcv, 'lowPrice'),
            this.safeNumber (ohlcv, 'closePrice'),
            this.safeNumber (ohlcv, 'volume'),
        ];
    }

    handleBalance (client: Client, message: any) {
        //
        // {
        //     "pid": "1915030429994115073",
        //     "totalEquity": "9982626.463656177813115742",
        //     "totalMarginBalance": "9982499.027406177813115742",
        //     "totalAvailableBalance": "9963268.480482499813115742",
        //     "details": [{
        //         "currency": "USDT",
        //         "equity": "9992460.435444457813115742",
        //         "balance": "10022285.67808223248136992",
        //         "upl": "-29825.242637774668254178",
        //         "availableMargin": "9977888.265744457813115742",
        //         "initialMargin": "13532.0697",
        //         "frozen": "1040.1"
        //     }]
        // }
        //
        const details = this.safeValue (message, 'details', []);
        const result = {
            'info': message,
            'timestamp': undefined,
            'datetime': undefined,
        };
        
        for (let i = 0; i < details.length; i++) {
            const balance = details[i];
            const currencyId = this.safeString (balance, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            const total = this.safeString (balance, 'balance');
            const free = this.safeString (balance, 'availableMargin');
            const frozen = this.safeString (balance, 'frozen');
            account['free'] = free;
            account['used'] = frozen;
            account['total'] = total;
            result[code] = account;
        }
        
        const messageHash = 'balance';
        this.balance = this.safeBalance (result);
        client.resolve (this.balance, messageHash);
    }

    handleOrder (client: Client, message: any) {
        //
        // {
        //     "pid": "1915030429994115073",
        //     "businessType": "linear_futures",
        //     "symbol": "BTC-USDT-27JUN25",
        //     "orderId": "1374073495124123648",
        //     "clientOrderId": "1374073495124123648",
        //     "price": "104186.15",
        //     "qty": "1",
        //     "orderType": "market",
        //     "side": "buy",
        //     "totalFillQty": "1",
        //     "avgPrice": "104186.15",
        //     "status": "filled",
        //     "createTime": "1747646250290",
        //     "updateTime": "1747646250302",
        //     "tradeList": [...]
        // }
        //
        const order = this.parseOrder (message);
        const symbol = order['symbol'];
        
        if (this.orders === undefined) {
            const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
            this.orders = new ArrayCacheBySymbolById (limit);
        }
        const orders = this.orders;
        orders.append (order);
        
        let messageHash = 'orders';
        client.resolve (orders, messageHash);
        if (symbol !== undefined) {
            messageHash = 'orders:' + symbol;
            client.resolve (orders, messageHash);
        }
        
        // Handle trades from tradeList
        const tradeList = this.safeValue (message, 'tradeList', []);
        if (tradeList.length > 0) {
            if (this.myTrades === undefined) {
                const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
                this.myTrades = new ArrayCacheBySymbolById (limit);
            }
            const myTrades = this.myTrades;
            
            for (let i = 0; i < tradeList.length; i++) {
                const trade = this.parseTrade (tradeList[i]);
                myTrades.append (trade);
            }
            
            messageHash = 'myTrades';
            client.resolve (myTrades, messageHash);
            if (symbol !== undefined) {
                messageHash = 'myTrades:' + symbol;
                client.resolve (myTrades, messageHash);
            }
        }
    }

    parseOrder (order: any, market: any = undefined): Order {
        //
        // {
        //     "pid": "1915030429994115073",
        //     "businessType": "linear_futures",
        //     "symbol": "BTC-USDT-27JUN25",
        //     "orderId": "1374073495124123648",
        //     "clientOrderId": "1374073495124123648",
        //     "price": "104186.15",
        //     "qty": "1",
        //     "orderType": "market",
        //     "side": "buy",
        //     "totalFillQty": "1",
        //     "avgPrice": "104186.15",
        //     "status": "filled",
        //     "lever": "1",
        //     "quoteFee": "-0.52093075",
        //     "createTime": "1747646250290",
        //     "updateTime": "1747646250302"
        // }
        //
        const id = this.safeString (order, 'orderId');
        const clientOrderId = this.safeString (order, 'clientOrderId');
        const marketId = this.safeString (order, 'symbol');
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        const timestamp = this.safeInteger (order, 'createTime');
        const lastTradeTimestamp = this.safeInteger (order, 'updateTime');
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const side = this.safeStringLower (order, 'side');
        const type = this.safeStringLower (order, 'orderType');
        const price = this.safeString (order, 'price');
        const amount = this.safeString (order, 'qty');
        const filled = this.safeString (order, 'totalFillQty');
        const average = this.safeString (order, 'avgPrice');
        
        let fee = undefined;
        const feeCost = this.safeString (order, 'quoteFee');
        if (feeCost !== undefined) {
            fee = {
                'cost': Precise.stringAbs (feeCost),
                'currency': market['quote'],
            };
        }
        
        return this.safeOrder ({
            'id': id,
            'clientOrderId': clientOrderId,
            'info': order,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'status': status,
            'symbol': symbol,
            'type': type,
            'timeInForce': this.safeString (order, 'timeInForce'),
            'postOnly': undefined,
            'reduceOnly': this.safeValue (order, 'reduceOnly'),
            'side': side,
            'price': price,
            'stopPrice': undefined,
            'triggerPrice': undefined,
            'amount': amount,
            'filled': filled,
            'remaining': undefined,
            'cost': undefined,
            'average': average,
            'fee': fee,
            'trades': undefined,
        }, market);
    }

    parseOrderStatus (status: Str): Str {
        const statuses = {
            'new': 'open',
            'partial_filled': 'open',
            'filled': 'closed',
            'cancelled': 'canceled',
            'rejected': 'rejected',
            'expired': 'expired',
        };
        return this.safeString (statuses, status, status);
    }

    handlePosition (client: Client, message: any) {
        //
        // {
        //     "businessType": "linear_perpetual",
        //     "symbol": "BTC-USDT-PERP",
        //     "stream": "position",
        //     "data": [{
        //         "businessType": "linear_futures",
        //         "symbol": "BTC-USDT-27JUN25",
        //         "positionQty": "1",
        //         "avgPrice": "104186.15",
        //         "upl": "-20.7918",
        //         "lever": "1",
        //         "liquidationPrice": "0",
        //         "markPrice": "102106.97",
        //         "im": "1021.0697",
        //         "indexPrice": "103188.28",
        //         "pnl": "-0.52093075",
        //         "fee": "-0.52093075",
        //         "fundingFee": "0",
        //         "createTime": "1747646250302",
        //         "updateTime": "1747646250302",
        //         "positionId": "6755399441058600",
        //         "pid": "1915030429994115073",
        //         "tradedType": "OPEN"
        //     }],
        //     "ts": "1732256095953"
        // }
        //
        const data = this.safeValue (message, 'data', []);
        
        if (this.positions === undefined) {
            this.positions = new ArrayCacheBySymbolById ();
        }
        const positions = this.positions;
        
        for (let i = 0; i < data.length; i++) {
            const position = this.parsePosition (data[i]);
            positions.append (position);
        }
        
        const messageHash = 'positions';
        client.resolve (positions, messageHash);
    }

    parsePosition (position: any, market: any = undefined): Position {
        //
        // {
        //     "businessType": "linear_futures",
        //     "symbol": "BTC-USDT-27JUN25",
        //     "positionQty": "1",
        //     "avgPrice": "104186.15",
        //     "upl": "-20.7918",
        //     "lever": "1",
        //     "liquidationPrice": "0",
        //     "markPrice": "102106.97",
        //     "im": "1021.0697",
        //     "indexPrice": "103188.28",
        //     "pnl": "-0.52093075",
        //     "fee": "-0.52093075",
        //     "fundingFee": "0",
        //     "createTime": "1747646250302",
        //     "updateTime": "1747646250302",
        //     "positionId": "6755399441058600"
        // }
        //
        const marketId = this.safeString (position, 'symbol');
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        const timestamp = this.safeInteger (position, 'updateTime');
        const contracts = this.safeString (position, 'positionQty');
        const entryPrice = this.safeString (position, 'avgPrice');
        const unrealizedPnl = this.safeString (position, 'upl');
        const realizedPnl = this.safeString (position, 'pnl');
        const markPrice = this.safeString (position, 'markPrice');
        const liquidationPrice = this.safeString (position, 'liquidationPrice');
        const leverage = this.safeString (position, 'lever');
        const initialMargin = this.safeString (position, 'im');
        const side = Precise.stringGt (contracts, '0') ? 'long' : 'short';
        return this.safePosition ({
            'info': position,
            'id': this.safeString (position, 'positionId'),
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'contracts': Precise.stringAbs (contracts),
            'contractSize': undefined,
            'side': side,
            'notional': undefined,
            'leverage': leverage,
            'unrealizedPnl': unrealizedPnl,
            'realizedPnl': realizedPnl,
            'collateral': undefined,
            'entryPrice': entryPrice,
            'markPrice': markPrice,
            'liquidationPrice': liquidationPrice,
            'marginMode': undefined,
            'hedged': undefined,
            'maintenanceMargin': undefined,
            'maintenanceMarginPercentage': undefined,
            'initialMargin': initialMargin,
            'initialMarginPercentage': undefined,
            'marginRatio': undefined,
            'lastUpdateTimestamp': timestamp,
            'percentage': undefined,
        });
    }

    handleMessage (client: Client, message: any) {
        const event = this.safeString (message, 'event');
        if (event === 'subscribe') {
            this.handleSubscriptionStatus (client, message);
            return;
        }
        if (event === 'authorization') {
            return this.handleAuthenticationMessage (client, message);
        }
        // Handle error messages
        const code = this.safeString (message, 'code');
        if (code !== undefined && code !== '0') {
            this.handleErrorMessage (client, message);
            return;
        }
        // Handle data messages by stream type
        const stream = this.safeString (message, 'stream');
        if (stream === undefined) {
            return;
        }
        const methods: Dict = {
            'pong': this.handlePong,
            'position': this.handlePosition,
            'order': this.handleOrder,
            'trading_account': this.handleBalance,
            'kline': this.handleOHLCV,
            'depth': this.handleOrderBook,
            'depthlevels': this.handleOrderBook,
            'ticker24hr': this.handleTicker,
            'miniTicker': this.handleTicker,
            'trade': this.handleTrade,
        };
        const method = this.safeValue (methods, stream);
        if (method !== undefined) {
            method.call (this, client, message);
        }
    }

    handleAuthenticationMessage (client: Client, message: any) {
        //
        // {
        //     "event": "authorization",
        //     "msg": "success",
        //     "code": "0",
        //     "ts": "1732158443301"
        // }
        //
        const code = this.safeString (message, 'code');
        const messageHash = 'authenticated';
        if (code === '0') {
            client.resolve (message, messageHash);
        } else {
            const error = new AuthenticationError (this.id + ' authentication failed: ' + this.safeString (message, 'msg'));
            client.reject (error, messageHash);
        }
    }

    handleErrorMessage (client: Client, message: any) {
        //
        // {
        //     "code": "xxxx",
        //     "msg": "error message"
        // }
        //
        const code = this.safeString (message, 'code');
        const msg = this.safeString (message, 'msg', 'Unknown error');
        const feedback = this.id + ' ' + msg;
        this.throwExactlyMatchedException (this.exceptions['exact'], code, feedback);
        this.throwBroadlyMatchedException (this.exceptions['broad'], msg, feedback);
        throw new ExchangeError (feedback);
    }

    handleSubscriptionStatus (client: Client, message: any) {
        //
        // successful subscription
        //
        //    {
        //        "event": "subscribe",
        //        "data": [
        //            {
        //                "businessType": "linear_perpetual",
        //                "symbol": "BTC-USDT-PERP",
        //                "stream": "trade",
        //                "message": "成功",
        //                "code": 0
        //            }
        //        ],
        //        "ts": 1762237676412
        //    }
        //
        return message;
    }

    handlePong (client: Client, message: any) {
        //
        // { "event": "pong", "ts": "1732256095953" }
        //
        client.lastPong = this.milliseconds ();
        return message;
    }

    ping (client: Client) {
        //
        // Send ping message to keep connection alive
        //
        return {
            'event': 'ping',
        };
    }

    async authenticate (params = {}) {
        //
        // Authenticate WebSocket connection for private channels
        //
        const url = this.urls['api']['ws']['private'];
        const messageHash = 'authenticated';
        const client = this.client (url);
        const future = client.future (messageHash);
        const authenticated = this.safeValue (client.subscriptions, messageHash);
        if (authenticated === undefined) {
            const timestamp = this.milliseconds ().toString ();
            const accountName = this.safeString (this.options, 'accountName', '');
            // Create signature: timestamp + accountName + accessKey
            const message = timestamp + accountName + this.apiKey;
            const signature = this.hmac (this.encode (message), this.encode (this.secret), sha256, 'hex');
            const auth = {
                'event': 'authorization',
                'data': {
                    'accountName': accountName,
                    'type': 'Token',
                    'accessKey': this.apiKey,
                    'accessTimestamp': timestamp,
                },
                'accessSign': signature,
            };
            const request = this.deepExtend (auth, params);
            this.spawn (this.watch, url, messageHash, request, messageHash);
        }
        return await future;
    }
}