
//  ---------------------------------------------------------------------------

import bitbabyRest from '../bitbaby.js';
// import { ArgumentsRequired, ExchangeError } from '../base/errors.js';
// import { Precise } from '../base/Precise.js';
import { ArrayCache, ArrayCacheByTimestamp } from '../base/ws/Cache.js';
import type { Dict, Int, Market, OHLCV, OrderBook, Ticker, Trade } from '../base/types.js';
import Client from '../base/ws/Client.js';

//  ---------------------------------------------------------------------------

export default class bitbaby extends bitbabyRest {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'has': {
                'watchOHLCV': true,
                'watchOrderBook': true,
                'watchTicker': true,
                'watchTrades': true,
                'unWatchOHLCV': true,
                'unWatchOrderBook': true,
                'unWatchTicker': true,
                'unWatchTrades': true,
            },
            'urls': {
                'api': {
                    'ws': {
                        'spot': 'wss://openapi.bitbaby.com/spot/ws',
                        'contract': 'wss://openapi.bitbaby.com/futures/ws',
                    },
                },
            },
            'options': {},
            'streaming': {
                'keepAlive': 29000,
            },
        });
    }

    handlePong (client: Client, message) {
        //
        //     {
        //         "ts": "2026-04-04T09:53:24Z",
        //         "pong": 1775296404,
        //         "data": {
        //             "ping": 1775296404
        //         }
        //     }
        //
        client.lastPong = this.safeTimestamp (message, 'pong');
        return message;
    }

    handlePing (client: Client, message) {
        //
        //     {
        //         "ts": "2026-04-04T09:53:24Z",
        //         "ping": 1775296404
        //     }
        //
        client.lastPong = this.safeTimestamp (message, 'ping', this.milliseconds ());
        this.spawn (this.pong, client, message);
    }

    async pong (client, message) {
        //
        //     {
        //         "ts": "2026-04-04T09:53:24Z",
        //         "ping": 1775296404
        //     }
        //
        const time = this.safeInteger (message, 'ping');
        const pong: Dict = {
            'ping': time,
        };
        await client.send (pong);
    }

    async subscribe (channel, symbol, params = {}, subscription = undefined) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        let marketType = 'spot';
        if (market['contract']) {
            marketType = 'contract';
        }
        const url = this.urls['api']['ws'][marketType];
        const message: Dict = {
            'event': 'sub',
            'params': {
                'channel': channel,
            },
        };
        return await this.watch (url, channel, this.deepExtend (message, params), channel, subscription);
    }

    async unSubscribe (channel, symbol, params = {}, subscription = undefined) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        let marketType = 'spot';
        if (market['contract']) {
            marketType = 'contract';
        }
        const url = this.urls['api']['ws'][marketType];
        const message: Dict = {
            'event': 'unsub',
            'params': {
                'channel': channel,
            },
        };
        const client = this.client (url);
        const messageHash = 'unsubscribe:' + channel;
        const promise = this.watch (url, messageHash, this.deepExtend (message, params), messageHash, subscription);
        this.handleUnSubscribe (client, subscription);
        return promise; // to avoid CS type error
    }

    handleUnSubscribe (client: Client, subscription) {
        const subMessageHashes = this.safeValue (subscription, 'subMessageHashes', []);
        for (let i = 0; i < subMessageHashes.length; i++) {
            const subHash = subMessageHashes[i];
            const unsubHash = 'unsubscribe:' + subHash;
            this.cleanUnsubscription (client, subHash, unsubHash);
        }
        this.cleanCache (subscription);
    }

    getWsMarketIdFromMarket (market) {
        let marketId = market['lowercaseId'];
        if (market['contract']) {
            const parts = marketId.split ('-');
            const prefix = this.safeString (parts, 0);
            const baseId = this.safeString (parts, 1);
            const quoteId = this.safeString (parts, 2);
            marketId = prefix + '_' + baseId + quoteId;
        }
        return marketId;
    }

    getWsMarketSymbolFromId (rawId) {
        let marketId = rawId.toLowerCase ();
        const parts = rawId.split ('_');
        const length = parts.length;
        if (length > 1) {
            // contract market
            const prefix = this.safeStringUpper (parts, 0);
            const spotPart = this.safeStringLower (parts, 1);
            const spotSafeMarket = this.safeMarket (spotPart);
            const baseId = this.safeString (spotSafeMarket, 'baseId');
            const quoteId = this.safeString (spotSafeMarket, 'quoteId');
            marketId = prefix + '-' + baseId + '-' + quoteId;
        }
        const safeMarket = this.safeMarket (marketId);
        return safeMarket['symbol'];
    }

    /**
     * @method
     * @name bitbaby#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://bitbaby-1.gitbook.io/bitbaby-api/websocket-tui-song
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    async watchTicker (symbol: string, params = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const marketId = this.getWsMarketIdFromMarket (market);
        const channel = 'market_' + marketId;
        return await this.subscribe (channel, symbol, params);
    }

    /**
     * @method
     * @name bitbaby#unWatchTicker
     * @description unWatches a price ticker
     * @see https://bitbaby-1.gitbook.io/bitbaby-api/websocket-tui-song
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async unWatchTicker (symbol: string, params = {}): Promise<any> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const marketId = this.getWsMarketIdFromMarket (market);
        const channel = 'market_' + marketId;
        const subscription: Dict = {
            'unsubscribe': true,
            'subMessageHashes': [ channel ],
            'symbols': [ symbol ],
            'topic': 'ticker',
        };
        return await this.unSubscribe (channel, symbol, params, subscription);
    }

    handleTicker (client: Client, message) {
        //
        // spot
        //     {
        //         "channel": "market_ethusdt",
        //         "tick": {
        //             "symbol": "ETHUSDT",
        //             "open": "2067.29",
        //             "close": "2052.41",
        //             "amount": "6657899.83742",
        //             "vol": "3240.042",
        //             "high": "2080.25",
        //             "low": "2041.91",
        //             "rose": "-0.7183421534",
        //             "rose7d": "2.379907218",
        //             "rose1h": "-0.1090210011",
        //             "rose4h": "0.0750900837",
        //             "rose24h": "-0.7183421534",
        //             "timestamp": 1775288948,
        //             "utime": "2026-04-04T07:49:08Z",
        //             "lastDealId": 0,
        //             "base": "ETH",
        //             "quote": "USDT",
        //             "ts": 1775288948000
        //         },
        //         "ts": "2026-04-04T07:49:08Z"
        //     }
        //
        // contract
        //     {
        //         "channel": "market_e_ethusdt",
        //         "tick": {
        //             "symbol": "E_ETHUSDT",
        //             "open": "2066.17",
        //             "close": "2052.49",
        //             "amount": "15027318102.58",
        //             "vol": "7316331",
        //             "piece": "0",
        //             "high": "2080.29",
        //             "low": "2040.39",
        //             "rose": "-0.5576550388",
        //             "rose7d": "2.4232383367",
        //             "rose1h": "-0.0058462153",
        //             "rose4h": "0.1107198252",
        //             "rose24h": "-0.5576550388",
        //             "timestamp": 1775287987,
        //             "utime": "2026-04-04T07:33:07Z",
        //             "base": "ETH",
        //             "quote": "USDT",
        //             "sign_price": "2052.49",
        //             "index_price": "2053.405",
        //             "funding_rate_last": "0.0000175560529949",
        //             "funding_rate_next": "0.0000800000000000",
        //             "ts": 1775287987000,
        //             "admin_fund_rate_source": "'third'",
        //             "last_fund_rate_third": "0.00005418"
        //         },
        //         "ts": "2026-04-04T07:33:07Z"
        //     }
        //
        const data = this.safeDict (message, 'tick', {});
        const ticker = this.parseWsTicker (data);
        const symbol = ticker['symbol'];
        this.tickers[symbol] = ticker;
        const channel = this.safeString (message, 'channel');
        client.resolve (this.tickers[symbol], channel);
    }

    parseWsTicker (ticker: Dict, market: Market = undefined): Ticker {
        let marketId = this.safeStringLower (ticker, 'symbol');
        const tickerSymbol = this.safeString (ticker, 'symbol', '');
        const parts = tickerSymbol.split ('_');
        const length = parts.length;
        if (length > 1) {
            const prefix = this.safeString (parts, 0);
            const baseId = this.safeString (ticker, 'base');
            const quoteId = this.safeString (ticker, 'quote');
            marketId = prefix + '-' + baseId + '-' + quoteId;
        }
        market = this.safeMarket (marketId, market);
        const timestamp = this.safeInteger (ticker, 'ts');
        const close = this.safeString (ticker, 'close');
        return this.safeTicker ({
            'symbol': market['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'high'),
            'low': this.safeString (ticker, 'low'),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': this.safeString (ticker, 'open'),
            'close': close,
            'last': close,
            'previousClose': undefined,
            'change': undefined,
            'percentage': this.safeString (ticker, 'rose'),
            'average': undefined,
            'baseVolume': this.safeString (ticker, 'vol'),
            'quoteVolume': this.safeString (ticker, 'amount'),
            'markPrice': this.safeString (ticker, 'sign_price'), // todo check
            'indexPrice': this.safeString (ticker, 'index_price'),
            'info': ticker,
        }, market);
    }

    /**
     * @method
     * @name bitbaby#watchOHLCV
     * @see https://bitbaby-1.gitbook.io/bitbaby-api/websocket-tui-song
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async watchOHLCV (symbol: string, timeframe: string = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const marketId = this.getWsMarketIdFromMarket (market);
        const interval = this.safeString (this.timeframes, timeframe, timeframe);
        const channel = 'market_' + marketId + '_kline_' + interval;
        const ohlcv = await this.subscribe (channel, symbol, params);
        if (this.newUpdates) {
            limit = ohlcv.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (ohlcv, since, limit, 0, true);
    }

    /**
     * @method
     * @name bitbaby#unWatchOHLCV
     * @description unWatches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://bitbaby-1.gitbook.io/bitbaby-api/websocket-tui-song
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async unWatchOHLCV (symbol: string, timeframe: string = '1m', params = {}): Promise<any> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const marketId = this.getWsMarketIdFromMarket (market);
        const interval = this.safeString (this.timeframes, timeframe, timeframe);
        const channel = 'market_' + marketId + '_kline_' + interval;
        const subscription: Dict = {
            'unsubscribe': true,
            'subMessageHashes': [ channel ],
            'symbols': [ symbol ],
            'topic': 'ohlcv',
            'symbolsAndTimeframes': [ [ symbol, timeframe ] ],
        };
        return await this.unSubscribe (channel, symbol, params, subscription);
    }

    handleOHLCV (client: Client, message) {
        //
        // spot
        //     {
        //         "channel": "market_ethusdt_kline_1min",
        //         "tick": [
        //             {
        //                 "id": 1775293440,
        //                 "ts": "2026-04-04T09:04:00Z",
        //                 "open": "2050.7",
        //                 "close": "2050.51",
        //                 "high": "2050.71",
        //                 "low": "2050.5",
        //                 "vol": "0.374",
        //                 "amount": "766.9271",
        //                 "symbol": "ETHUSDT"
        //             }
        //         ],
        //         "ts": "2026-04-04T09:04:22Z"
        //     }
        //
        // contract
        //     {
        //         "channel": "market_e_ethusdt_kline_1min",
        //         "tick": [
        //             {
        //                 "id": 1775293680,
        //                 "ts": "2026-04-04T09:08:00Z",
        //                 "open": "2049.66",
        //                 "close": "2049.66",
        //                 "high": "2049.67",
        //                 "low": "2049.66",
        //                 "vol": "262",
        //                 "piece": "",
        //                 "amount": "537012.77",
        //                 "symbol": "E_ETHUSDT"
        //             }
        //         ],
        //         "ts": "2026-04-04T09:08:19Z"
        //     }
        //
        const data = this.safeList (message, 'tick', []);
        const channel = this.safeString (message, 'channel');
        const parts = channel.split ('_kline_');
        const interval = this.safeString (parts, 1);
        const timeframe = this.findTimeframe (interval);
        const first = this.safeDict (data, 0, {});
        const marketId = this.safeString (first, 'symbol');
        const symbol = this.getWsMarketSymbolFromId (marketId);
        if (!(symbol in this.ohlcvs)) {
            this.ohlcvs[symbol] = {};
        }
        if (!(timeframe in this.ohlcvs[symbol])) {
            const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
            this.ohlcvs[symbol][timeframe] = new ArrayCacheByTimestamp (limit);
        }
        const cache = this.ohlcvs[symbol][timeframe];
        for (let i = 0; i < data.length; i++) {
            const candle = this.safeDict (data, i, {});
            const parsed = this.parseOHLCV (candle);
            cache.append (parsed);
        }
        this.ohlcvs[symbol][timeframe] = cache;
        client.resolve (cache, channel);
    }

    /**
     * @method
     * @name bitbaby#watchTrades
     * @description watches information on multiple trades made in a market
     * @see https://bitbaby-1.gitbook.io/bitbaby-api/websocket-tui-song
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
        const marketId = this.getWsMarketIdFromMarket (market);
        const channel = 'market_' + marketId + '_deals';
        const trades = await this.subscribe (channel, symbol, params);
        if (this.newUpdates) {
            limit = trades.getLimit (market['symbol'], limit);
        }
        return this.filterBySymbolSinceLimit (trades, symbol, since, limit, true);
    }

    /**
     * @method
     * @name bitbaby#unWatchTrades
     * @description unsubscribe from the trades channel
     * @see https://bitbaby-1.gitbook.io/bitbaby-api/websocket-tui-song
     * @param {string} symbol unified market symbol of the market trades were made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async unWatchTrades (symbol: string, params = {}): Promise<any> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const marketId = this.getWsMarketIdFromMarket (market);
        const channel = 'market_' + marketId + '_deals';
        const subscription: Dict = {
            'unsubscribe': true,
            'subMessageHashes': [ channel ],
            'symbols': [ symbol ],
            'topic': 'trades',
        };
        return await this.unSubscribe (channel, symbol, params, subscription);
    }

    handleTrade (client: Client, message) {
        //
        // spot
        //     {
        //         "channel": "market_ethusdt_deals",
        //         "tick": [
        //             {
        //             "id": "1775303118",
        //             "ts": "2026-04-04T11:45:18Z",
        //             "side": "sell",
        //             "vol": "0.004",
        //             "amount": "8.206",
        //             "price": "2051.5"
        //             }
        //         ],
        //         "ts": "2026-04-04T11:45:18Z"
        //     }
        //
        // contract
        //     {
        //         "channel": "market_e_ethusdt_deals",
        //         "tick": [
        //             {
        //                 "id": 1775302875,
        //                 "ts": "2026-04-04T11:41:15Z",
        //                 "side": "buy",
        //                 "vol": "1",
        //                 "piece": "",
        //                 "price": "2050.39"
        //             }
        //         ],
        //         "ts": "2026-04-04T11:41:15Z"
        //     }
        //
        const channel = this.safeString (message, 'channel');
        let marketId = channel.replace ('market_', '');
        marketId = marketId.replace ('_deals', '');
        const symbol = this.getWsMarketSymbolFromId (marketId);
        if (!(symbol in this.trades)) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            this.trades[symbol] = new ArrayCache (limit);
        }
        const market = this.market (symbol);
        const cache = this.trades[symbol];
        const trades = [];
        const data = this.safeList (message, 'tick', []);
        for (let i = 0; i < data.length; i++) {
            const trade = this.safeDict (data, i, {});
            const parsed = this.parseWsTrade (trade, market);
            trades.push (parsed);
        }
        const sorted = this.sortBy (trades, 'timestamp');
        for (let i = 0; i < sorted.length; i++) {
            const trade = this.safeDict (sorted, i, {});
            cache.append (trade);
        }
        this.trades[symbol] = cache;
        client.resolve (cache, channel);
    }

    parseWsTrade (trade: Dict, market: Market = undefined): Trade {
        const datetime = this.safeString (trade, 'ts');
        return this.safeTrade ({
            'info': trade,
            'id': this.safeString (trade, 'id'),
            'order': undefined,
            'timestamp': this.parse8601 (datetime),
            'datetime': datetime,
            'symbol': market['symbol'],
            'type': undefined,
            'takerOrMaker': undefined,
            'side': this.safeStringLower (trade, 'side'),
            'price': this.safeString (trade, 'price'),
            'amount': this.safeString (trade, 'vol'),
            'cost': this.safeString (trade, 'amount'),
            'fee': undefined,
        }, market);
    }

    /**
     * @method
     * @name bitbaby#watchOrderBook
     * @see https://bitbaby-1.gitbook.io/bitbaby-api/websocket-tui-song
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return.
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async watchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const marketId = this.getWsMarketIdFromMarket (market);
        const channel = 'market_' + marketId + '_depth_0.1';
        const subscription: Dict = {
            'limit': limit,
        };
        const orderbook = await this.subscribe (channel, symbol, params, subscription);
        return orderbook.limit ();
    }

    /**
     * @method
     * @name bitbaby#unWatchOrderBook
     * @description unsubscribe from the orderbook channel
     * @see https://bitbaby-1.gitbook.io/bitbaby-api/websocket-tui-song
     * @param {string} symbol symbol of the market to unwatch the trades for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async unWatchOrderBook (symbol: string, params = {}): Promise<any> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const marketId = this.getWsMarketIdFromMarket (market);
        const channel = 'market_' + marketId + '_depth_0.1';
        const subscription: Dict = {
            'unsubscribe': true,
            'subMessageHashes': [ channel ],
            'symbols': [ symbol ],
            'topic': 'orderbook',
        };
        return await this.unSubscribe (channel, symbol, params, subscription);
    }

    handleOrderBook (client: Client, message) {
        //
        //     {
        //         "channel": "market_e_ethusdt_depth_0.1",
        //         "tick": {
        //             "asks": [
        //                 [
        //                     "2036.17",
        //                     "9.058",
        //                     "9.058"
        //                 ]
        //             ],
        //             "bids": [
        //                 [
        //                     "2036.16",
        //                     "5.698",
        //                     "5.698"
        //                 ]
        //             ],
        //             "ts": "2026-04-04T12:18:50Z"
        //         },
        //         "ts": "2026-04-04T12:18:50Z"
        //     }
        //
        const channel = this.safeString (message, 'channel');
        let marketId = channel.replace ('market_', '');
        marketId = marketId.replace ('_depth_0.1', '');
        const symbol = this.getWsMarketSymbolFromId (marketId);
        if (!(symbol in this.orderbooks)) {
            const defaultLimit = this.safeInteger (this.options, 'watchOrderBookLimit', 1000);
            const subscription = this.safeDict (client.subscriptions, channel);
            const limit = this.safeInteger (subscription, 'limit', defaultLimit);
            this.orderbooks[symbol] = this.orderBook ({}, limit);
            subscription['limit'] = limit;
        }
        const orderbook = this.orderbooks[symbol];
        const data = this.safeDict (message, 'tick', {});
        const datetime = this.safeString (data, 'ts');
        const timestamp = this.parse8601 (datetime);
        const snapshot = this.parseWsOrderBook (data, symbol, timestamp); // use custom parser to avoid exsessive values
        orderbook.reset (snapshot);
        this.orderbooks[symbol] = orderbook;
        client.resolve (orderbook, channel);
    }

    parseWsOrderBook (orderbook: Dict, symbol: string, timestamp: Int): OrderBook {
        const rawBids = this.safeList (orderbook, 'bids', []);
        const rawAsks = this.safeList (orderbook, 'asks', []);
        const bids = [];
        const asks = [];
        for (let i = 0; i < rawBids.length; i++) {
            const bid = this.safeList (rawBids, i, []);
            const parsedBid = [];
            const price = this.safeNumber (bid, 0);
            const amount = this.safeNumber (bid, 1);
            parsedBid.push (price);
            parsedBid.push (amount);
            bids.push (parsedBid);
        }
        for (let i = 0; i < rawAsks.length; i++) {
            const ask = this.safeList (rawAsks, i, []);
            const parsedAsk = [];
            const price = this.safeNumber (ask, 0);
            const amount = this.safeNumber (ask, 1);
            parsedAsk.push (price);
            parsedAsk.push (amount);
            asks.push (parsedAsk);
        }
        return {
            'symbol': symbol,
            'bids': this.sortBy (bids, 0, true),
            'asks': this.sortBy (asks, 0),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'nonce': undefined,
        } as OrderBook;
    }

    handleMessage (client: Client, message) {
        if ('ping' in message) {
            this.handlePing (client, message);
            return;
        }
        if ('pong' in message) {
            this.handlePong (client, message);
            return;
        }
        const channel = this.safeString (message, 'channel');
        // remove the 'e_' market prefix if it exists
        // for example, 'market_e_btcusdt' becomes 'market_btcusdt'
        const cleanChannel = channel.replace ('_e_', '_');
        const parts = cleanChannel.split ('_');
        const topic = this.safeString (parts, 2);
        if (topic === undefined) {
            // market_btcusdt
            this.handleTicker (client, message);
        } else if (topic === 'kline') {
            // market_btcusdt_kline_1m
            this.handleOHLCV (client, message);
        } else if (topic === 'deals') {
            // market_btcusdt_deals
            this.handleTrade (client, message);
        } else if (topic === 'depth') {
            // market_btcusdt_depth_0.1
            this.handleOrderBook (client, message);
        }
    }
}
