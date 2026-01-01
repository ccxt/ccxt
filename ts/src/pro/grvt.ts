
//  ---------------------------------------------------------------------------

import grvtRest from '../grvt.js';
import { sha256 } from '../static_dependencies/noble-hashes/sha256.js';
import { ArrayCache, ArrayCacheByTimestamp, ArrayCacheBySymbolById, ArrayCacheBySymbolBySide } from '../base/ws/Cache.js';
import type { Int, OHLCV, Str, Strings, OrderBook, Order, Trade, Balances, Ticker, Dict, Position, Bool, Tickers } from '../base/types.js';
import Client from '../base/ws/Client.js';
import { ArgumentsRequired, ExchangeError } from '../base/errors.js';

//  ---------------------------------------------------------------------------

export default class grvt extends grvtRest {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchTrades': true,
            },
            'urls': {
                'api': {
                    'ws': {
                        'public': 'wss://market-data.grvt.io/ws/full',
                    },
                },
            },
            'options': {
                'watchOrderBook': {
                    'depth': 100, // 5, 10, 20, 50, 100
                    'interval': 500, // 100, 200, 500, 1000
                },
            },
            'streaming': {
                'keepAlive': 300000, // 5 minutes
            },
        });
    }

    handleMessage (client: Client, message) {
        //
        // confirmation
        //
        //  {
        //     jsonrpc: '2.0',
        //     result: {
        //         stream: 'v1.mini.d',
        //         subs: [ 'BTC_USDT_Perp@500' ],
        //         unsubs: [],
        //         num_snapshots: [ 1 ],
        //         first_sequence_number: [ '1061214' ],
        //         latest_sequence_number: [ '1061213' ]
        //     },
        //     id: 1,
        //     method: 'subscribe'
        //  }
        //
        // ticker
        //
        //  {
        //     stream: "v1.mini.d",
        //     selector: "BTC_USDT_Perp@500",
        //     sequence_number: "0",
        //     feed: {
        //         event_time: "1767198134519661154",
        //         instrument: "BTC_USDT_Perp",
        //         ...
        //     },
        //     prev_sequence_number: "0",
        //  }
        //
        if (this.handleErrorMessage (client, message)) {
            return;
        }
        const methods: Dict = {
            'v1.ticker.s': this.handleTicker,
            'v1.ticker.d': this.handleTicker,
            'v1.mini.d': this.handleTicker,
            'v1.mini.s': this.handleTicker,
            'v1.trade': this.handleTrades,
            'v1.candle': this.handleOHLCV,
            'v1.book.s': this.handleOrderBook,
            'v1.book.d': this.handleOrderBook,
        };
        const methodName = this.safeString (message, 'method');
        if (methodName === 'subscribe') {
            // return from confirmation
            return;
        }
        const channel = this.safeString (message, 'stream');
        const method = this.safeValue (methods, channel);
        if (method !== undefined) {
            method.call (this, client, message);
        }
    }

    async subscribeMultiple (messageHashes: string[], request: Dict, rawHashes: string[]): Promise<any> {
        const payload: Dict = {
            'jsonrpc': '2.0',
            'method': 'subscribe',
            'params': request,
            'id': this.requestId (),
        };
        return await this.watchMultiple (this.urls['api']['ws']['public'], messageHashes, payload, rawHashes);
    }

    async subscribe (messageHash: string, request: Dict): Promise<any> {
        const subscriptionHash = messageHash;
        const payload: Dict = {
            'jsonrpc': '2.0',
            'method': 'subscribe',
            'params': request,
            'id': this.requestId (),
        };
        return await this.watch (this.urls['api']['ws']['public'], messageHash, payload, subscriptionHash);
    }

    requestId () {
        this.lockId ();
        const newValue = this.sum (this.safeInteger (this.options, 'requestId', 0), 1);
        this.options['requestId'] = newValue;
        this.unlockId ();
        return newValue;
    }

    /**
     * @method
     * @name grvt#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://api-docs.grvt.io/market_data_streams/#mini-ticker-snap-feed-selector
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    async watchTicker (symbol: string, params = {}): Promise<Ticker> {
        const channel = this.safeString (params, 'channel', 'v1.ticker.s'); // v1.ticker.s | v1.ticker.d | v1.mini.s | v1.mini.d
        await this.loadMarkets ();
        const market = this.market (symbol);
        const marketId = market['id'];
        const interval = this.safeInteger (params, 'interval', 500);
        const selector = marketId + '@' + interval; // raw, 50, 100, 200, 500, 1000, 5000
        const request = {
            'stream': channel,
            'selectors': [ selector ],
        };
        const messageHash = 'ticker::' + market['symbol'];
        return await this.subscribe (messageHash, this.extend (params, request));
    }

    /**
     * @method
     * @name grvt#watchTickers
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @see https://docs.backpack.exchange/#tag/Streams/Public/Ticker
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    async watchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        const channel = this.safeString (params, 'channel', 'v1.ticker.s'); // v1.ticker.s | v1.ticker.d | v1.mini.s | v1.mini.d
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const rawHashes = [];
        const messageHashes = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const market = this.market (symbol);
            const marketId = market['id'];
            const interval = this.safeInteger (params, 'interval', 500);
            const selector = marketId + '@' + interval; // raw, 50, 100, 200, 500, 1000, 5000
            rawHashes.push (selector);
            const messageHash = 'ticker::' + market['symbol'];
            messageHashes.push (messageHash);
        }
        const request = {
            'stream': channel,
            'selectors': rawHashes,
        };
        const ticker = await this.subscribeMultiple (messageHashes, this.extend (params, request), rawHashes);
        if (this.newUpdates) {
            const tickers: Dict = {};
            tickers[ticker['symbol']] = ticker;
            return tickers;
        }
        return this.filterByArray (this.tickers, 'symbol', symbols);
    }

    handleTicker (client: Client, message) {
        //
        // v1.ticker.s
        //
        //    {
        //        "stream": "v1.ticker.s",
        //        "selector": "BTC_USDT_Perp@500",
        //        "sequence_number": "0",
        //        "feed": {
        //            "event_time": "1767199535382794823",
        //            "instrument": "BTC_USDT_Perp",
        //            "mark_price": "87439.392166151",
        //            "index_price": "87462.426721779",
        //            "last_price": "87467.5",
        //            "last_size": "0.001",
        //            "mid_price": "87474.35",
        //            "best_bid_price": "87474.3",
        //            "best_bid_size": "2.435",
        //            "best_ask_price": "87474.4",
        //            "best_ask_size": "3.825",
        //            "funding_rate_8h_curr": "0.01",
        //            "funding_rate_8h_avg": "0.01",
        //            "interest_rate": "0.0",
        //            "forward_price": "0.0",
        //            "buy_volume_24h_b": "3115.631",
        //            "sell_volume_24h_b": "3195.236",
        //            "buy_volume_24h_q": "275739265.1558",
        //            "sell_volume_24h_q": "282773286.2658",
        //            "high_price": "89187.2",
        //            "low_price": "87404.1",
        //            "open_price": "88667.1",
        //            "open_interest": "1914.093886738",
        //            "long_short_ratio": "1.472050",
        //            "funding_rate": "0.01",
        //            "funding_interval_hours": 8,
        //            "next_funding_time": "1767225600000000000"
        //        },
        //        "prev_sequence_number": "0"
        //    }
        //
        // v1.mini.s
        //
        //    {
        //        "stream": "v1.mini.s",
        //        "selector": "BTC_USDT_Perp@500",
        //        "sequence_number": "0",
        //        "feed": {
        //            "event_time": "1767198364309454192",
        //            "instrument": "BTC_USDT_Perp",
        //            "mark_price": "87792.25830235",
        //            "index_price": "87806.705713684",
        //            "last_price": "87800.0",
        //            "last_size": "0.032",
        //            "mid_price": "87799.95",
        //            "best_bid_price": "87799.9",
        //            "best_bid_size": "0.151",
        //            "best_ask_price": "87800.0",
        //            "best_ask_size": "5.733"
        //        },
        //        "prev_sequence_number": "0"
        //    }
        //
        //  v1.mini.d
        //
        //    {
        //        "stream": "v1.mini.d",
        //        "selector": "BTC_USDT_Perp@500",
        //        "sequence_number": "1061718",
        //        "feed": {
        //            "event_time": "1767198266500017753",
        //            "instrument": "BTC_USDT_Perp",
        //            "index_price": "87820.929569614",
        //            "best_ask_size": "5.708"
        //        },
        //        "prev_sequence_number": "1061717"
        //    }
        //
        const data = this.safeDict (message, 'feed', {});
        const selector = this.safeString (message, 'selector');
        const parts = selector.split ('@');
        const marketId = this.safeString (parts, 0);
        const market = this.safeMarket (marketId, undefined);
        const symbol = market['symbol'];
        const ticker = this.parseWsTicker (data, market);
        this.tickers[symbol] = ticker;
        client.resolve (ticker, 'ticker::' + symbol);
    }

    parseWsTicker (message, market = undefined) {
        // same dict as REST api
        return this.parseTicker (message, market);
    }

    /**
     * @method
     * @name grvt#watchTrades
     * @description watches information on multiple trades made in a market
     * @see https://api-docs.grvt.io/market_data_streams/#trade_1
     * @param {string} symbol unified market symbol of the market trades were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        return await this.watchTradesForSymbols ([ symbol ], since, limit, params);
    }

    /**
     * @method
     * @name ascendex#watchTradesForSymbols
     * @description get the list of most recent trades for a list of symbols
     * @see https://ascendex.github.io/ascendex-pro-api/#channel-market-trades
     * @param {string[]} symbols unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.name] the name of the method to call, 'trade' or 'aggTrade', default is 'trade'
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    async watchTradesForSymbols (symbols: string[], since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const rawHashes = [];
        const messageHashes = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const market = this.market (symbol);
            const marketId = market['id'];
            const limitRaw = this.safeInteger (params, 'limit', 50);
            const selector = marketId + '@' + limitRaw; // 50, 200, 500, 1000
            rawHashes.push (selector);
            const messageHash = 'trade::' + market['symbol'];
            messageHashes.push (messageHash);
        }
        const request = {
            'stream': 'v1.trade',
            'selectors': rawHashes,
        };
        const trades = await this.subscribeMultiple (messageHashes, this.extend (params, request), rawHashes);
        if (this.newUpdates) {
            const first = this.safeValue (trades, 0);
            const tradeSymbol = this.safeString (first, 'symbol');
            limit = trades.getLimit (tradeSymbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    handleTrades (client: Client, message) {
        //
        //    {
        //        "stream": "v1.trade",
        //        "selector": "BTC_USDT_Perp@50",
        //        "sequence_number": "0",
        //        "feed": {
        //            "event_time": "1767257046164798775",
        //            "instrument": "BTC_USDT_Perp",
        //            "is_taker_buyer": true,
        //            "size": "0.001",
        //            "price": "87700.1",
        //            "mark_price": "87700.817100682",
        //            "index_price": "87708.566729268",
        //            "interest_rate": "0.0",
        //            "forward_price": "0.0",
        //            "trade_id": "73808524-19",
        //            "venue": "ORDERBOOK",
        //            "is_rpi": false
        //        },
        //        "prev_sequence_number": "0"
        //    }
        //
        const data = this.safeDict (message, 'feed', {});
        const selector = this.safeString (message, 'selector');
        const parts = selector.split ('@');
        const marketId = this.safeString (parts, 0);
        const market = this.safeMarket (marketId, undefined);
        const symbol = market['symbol'];
        if (!(symbol in this.trades)) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            this.trades[symbol] = new ArrayCache (limit);
        }
        const parsed = this.parseWsTrade (data);
        const stored = this.trades[symbol];
        stored.append (parsed);
        client.resolve (stored, 'trade::' + symbol);
    }

    parseWsTrade (trade, market = undefined) {
        // same as REST api
        return this.parseTrade (trade, market);
    }

    /**
     * @method
     * @name grvt#watchOHLCV
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://api-docs.grvt.io/market_data_streams/#candlestick_1
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async watchOHLCV (symbol: string, timeframe: string = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        params['callerMethodName'] = 'watchOHLCV';
        const result = await this.watchOHLCVForSymbols ([ [ symbol, timeframe ] ], since, limit, params);
        return result[symbol][timeframe];
    }

    /**
     * @method
     * @name grvt#watchOHLCVForSymbols
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://api-docs.grvt.io/market_data_streams/#candlestick_1
     * @param {string[][]} symbolsAndTimeframes array of arrays containing unified symbols and timeframes to fetch OHLCV data for, example [['BTC/USDT', '1m'], ['LTC/USDT', '5m']]
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async watchOHLCVForSymbols (symbolsAndTimeframes: string[][], since: Int = undefined, limit: Int = undefined, params = {}) {
        await this.loadMarkets ();
        const rawHashes = [];
        const messageHashes = [];
        for (let i = 0; i < symbolsAndTimeframes.length; i++) {
            const data = symbolsAndTimeframes[i];
            const symbolString = this.safeString (data, 0);
            const market = this.market (symbolString);
            const marketId = market['id'];
            const unfiedTimeframe = this.safeString (data, 1, '1');
            const timeframeId = this.safeString (this.timeframes, unfiedTimeframe, unfiedTimeframe);
            const selector = marketId + '@' + timeframeId + '-TRADE';
            rawHashes.push (selector);
            messageHashes.push ('ohlcv::' + market['symbol'] + '::' + unfiedTimeframe);
        }
        const request = {
            'stream': 'v1.candle',
            'selectors': rawHashes,
        };
        const [ symbol, timeframe, stored ] = await this.subscribeMultiple (messageHashes, this.extend (params, request), rawHashes);
        if (this.newUpdates) {
            limit = stored.getLimit (symbol, limit);
        }
        const filtered = this.filterBySinceLimit (stored, since, limit, 0, true);
        return this.createOHLCVObject (symbol, timeframe, filtered);
    }

    handleOHLCV (client: Client, message) {
        //
        //    {
        //        "stream": "v1.candle",
        //        "selector": "BTC_USDT_Perp@CI_1_M-TRADE",
        //        "sequence_number": "0",
        //        "feed": {
        //            "open_time": "1767263280000000000",
        //            "close_time": "1767263340000000000",
        //            "open": "87799.1",
        //            "close": "87799.1",
        //            "high": "87799.1",
        //            "low": "87799.1",
        //            "volume_b": "0.0",
        //            "volume_q": "0.0",
        //            "trades": 0,
        //            "instrument": "BTC_USDT_Perp"
        //        },
        //        "prev_sequence_number": "0"
        //    }
        //
        const data = this.safeDict (message, 'feed', {});
        const selector = this.safeString (message, 'selector');
        const parts = selector.split ('@');
        const marketId = this.safeString (parts, 0);
        const market = this.safeMarket (marketId, undefined);
        const symbol = market['symbol'];
        const secondPart = this.safeString (parts, 1);
        const timeframeId = secondPart.replace ('-TRADE', '');
        const timeframe = this.findTimeframe (timeframeId);
        const messageHash = 'ohlcv::' + symbol + '::' + timeframe;
        this.ohlcvs[symbol] = this.safeValue (this.ohlcvs, symbol, {});
        if (!(timeframe in this.ohlcvs[symbol])) {
            const limit = this.handleOption ('watchOHLCV', 'limit', 1000);
            this.ohlcvs[symbol][timeframe] = new ArrayCacheByTimestamp (limit);
        }
        const stored = this.ohlcvs[symbol][timeframe];
        const parsed = this.parseWsOHLCV (data, market);
        stored.append (parsed);
        const resolveData = [ symbol, timeframe, stored ];
        client.resolve (resolveData, messageHash);
    }

    parseWsOHLCV (ohlcv, market = undefined): OHLCV {
        // same as REST api
        return this.parseOHLCV (ohlcv, market);
    }

    /**
     * @method
     * @name grvt#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://api-docs.grvt.io/market_data_streams/#orderbook-snap
     * @see https://api-docs.grvt.io/market_data_streams/#orderbook-delta
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return.
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure} indexed by market symbols
     */
    async watchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        return await this.watchOrderBookForSymbols ([ symbol ], limit, params);
    }

    /**
     * @method
     * @name grvt#watchOrderBookForSymbols
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://api-docs.grvt.io/market_data_streams/#orderbook-snap
     * @see https://api-docs.grvt.io/market_data_streams/#orderbook-delta
     * @param {string[]} symbols unified array of symbols
     * @param {int} [limit] the maximum amount of order book entries to return.
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure} indexed by market symbols
     */
    async watchOrderBookForSymbols (symbols: string[], limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const symbolsLength = symbols.length;
        if (symbolsLength === 0) {
            throw new ArgumentsRequired (this.id + ' watchOrderBookForSymbols() requires a non-empty array of symbols');
        }
        if (limit === undefined) {
            [ limit, params ] = this.handleOptionAndParams (params, 'watchOrderBook', 'limit', 100);
        }
        let interval = undefined;
        [ interval, params ] = this.handleOptionAndParams (params, 'watchOrderBook', 'interval', 500);
        symbols = this.marketSymbols (symbols);
        const rawHashes = [];
        const messageHashes = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const market = this.market (symbol);
            const marketId = market['id'];
            const selector = marketId + '@' + interval + '-' + limit; // 5, 10, 20, 50, 100 @ 100, 200, 500, 1000
            rawHashes.push (selector);
            const messageHash = 'orderbook::' + market['symbol'];
            messageHashes.push (messageHash);
        }
        const request = {
            'stream': 'v1.book.s',
            'selectors': rawHashes,
        };
        const orderbook = await this.subscribeMultiple (messageHashes, this.extend (request, params), rawHashes);
        return orderbook.limit ();
    }

    handleOrderBook (client: Client, message) {
        //
        //    {
        //        "stream": "v1.book.s",
        //        "selector": "BTC_USDT_Perp@500-100",
        //        "sequence_number": "0",
        //        "feed": {
        //            "event_time": "1767292408400000000",
        //            "instrument": "BTC_USDT_Perp",
        //            "bids": [
        //                {
        //                    "price": "88107.3",
        //                    "size": "5.322",
        //                    "num_orders": 11
        //                },
        //            ],
        //            "asks": [
        //                {
        //                    "price": "88107.4",
        //                    "size": "5.273",
        //                    "num_orders": 37
        //                },
        //            ]
        //        },
        //        "prev_sequence_number": "0"
        //    }
        //
        const data = this.safeDict (message, 'feed', {});
        const selector = this.safeString (message, 'selector');
        const parts = selector.split ('@');
        const marketId = this.safeString (parts, 0);
        const market = this.safeMarket (marketId, undefined);
        const symbol = market['symbol'];
        const timestamp = this.safeIntegerProduct (data, 'event_time', 0.000001);
        if (!(symbol in this.orderbooks)) {
            this.orderbooks[symbol] = this.orderBook ();
        }
        const orderbook = this.orderbooks[symbol];
        const stream = this.safeString (message, 'stream');
        const isSnapshot = stream === 'v1.book.s';
        if (isSnapshot) {
            const snapshot = this.parseOrderBook (data, symbol, timestamp, 'bids', 'asks', 'price', 'size');
            orderbook.reset (snapshot);
        } else {
            const asks = this.safeList (data, 'a', []);
            const bids = this.safeList (data, 'b', []);
            this.handleDeltas (orderbook['asks'], asks);
            this.handleDeltas (orderbook['bids'], bids);
            orderbook['timestamp'] = timestamp;
            orderbook['datetime'] = this.iso8601 (timestamp);
        }
        orderbook['nonce'] = this.safeInteger (message, 'sequence_number');
        const messageHash = 'orderbook::' + symbol;
        this.orderbooks[symbol] = orderbook;
        client.resolve (orderbook, messageHash);
    }

    handleErrorMessage (client: Client, response): Bool {
        //
        // error example:
        //
        //    {
        //        "id": "30005",
        //        "name": "InvalidNotional",
        //        "message": "order validation failed: invalid notional: notional 0.25 is less than min notional 1"
        //    }
        //
        return false; // 
        const message = this.safeString (response, 'message');
        if (message !== undefined) {
            const body = this.json (response);
            const errorCode = this.safeString (response, 'id');
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
            this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
            throw new ExchangeError (this.id + ' ' + body);
        }
        return false;
    }
}
