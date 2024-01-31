
//  ---------------------------------------------------------------------------

import oceanexRest from '../oceanex.js';
import { ArrayCacheBySymbolById, ArrayCacheByTimestamp } from '../base/ws/Cache.js';
import type { Tickers, Int, OHLCV, Strings, OrderType, OrderSide } from '../base/types.js';
import Client from '../base/ws/Client.js';
import { Str, OrderBook, Order, Trade, Ticker, Balances } from '../base/types';
import { sha256 } from '../static_dependencies/noble-hashes/sha256.js';
import { ArgumentsRequired, AuthenticationError, ExchangeError, NotSupported } from '../base/errors.js';

//  ---------------------------------------------------------------------------

export default class oceanex extends oceanexRest {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchTicker': true,
                'watchTickers': true,
                'watchTrades': false,
                'watchOrderBook': true,
                'watchBalance': true,
                'watchOrders': true,
                'watchOHLCV': true,
                'watchMyTrades': true,
                'createOrderWs': true,
                'cancelOrderWs': true,
                'fetchOrderWs': true,
                'fetchOpenOrdersWs': false,
                'cancelAllOrdersWs': true,
            },
            'urls': {
                'api': {
                    'ws': 'wss://ws.oceanex.pro/ws/v1',
                },
            },
            'options': {
            },
            'timeframes': {
                '1m': 'M1',
                '3m': 'M3',
                '5m': 'M5',
                '15m': 'M15',
                '30m': 'M30',
                '1h': 'H1',
                '4h': 'H4',
                '1d': 'D1',
                '1w': 'D7',
                '1M': '1M',
            },
            'streaming': {
            },
        });
    }

    async authenticate (path: string, method: string = 'GET', params = {}) {
        /**
         * @ignore
         * @method
         * @description authenticates the user to access private web socket channels
         * @see https://api.oceanex.pro/doc/v1/#websocket-authentication
         * @returns {object} response from exchange
         */
        this.checkRequiredCredentials ();
        const url = this.urls['api']['ws'];
        const messageHash = 'authenticated';
        const client = this.client (url);
        const future = client.future (messageHash);
        const authenticated = this.safeValue (client.subscriptions, messageHash);
        if (authenticated === undefined) {
            const timestamp = this.milliseconds ();
            // TODO Sign hash result by RSA PKCS1
            const sortedParams = ''; // TODO sort params
            const data = method + '|' + path + '|' + timestamp + '|' + this.json (sortedParams);
            const signature = this.hmac (data, this.encode (this.secret), sha256, 'base64');
            const request = {
                'uid': this.uuid (),
                'api_key': this.apiKey,
                'signature': signature,
                'nonce': timestamp,
                'verb': method,
                'path': path,
            };
            this.watch (url, messageHash, request, messageHash);
        }
        return future;
    }

    async subscribe (name: string, messageHash: string, isPrivate: boolean, method = 'GET', params = {}) {
        /**
         * @ignore
         * @method
         * @param {string} name websocket endpoint name
         * @param {object} [params] extra parameters specific to the oceanex api
         */
        await this.loadMarkets ();
        const url = this.urls['api']['ws'];
        if (isPrivate) {
            this.authenticate (name, method, params);
        }
        const subscribe = {
            'identifier': { 'handler': name },
            'command': 'message',
            'data': {
                'action': 'index',
                'uuid': this.uuid (),
                'args': params,
            },
        };
        return await this.watch (url, messageHash, subscribe, messageHash);
    }

    async tradeRequest (name: string, params = {}) {
        /**
         * TODO
         * @ignore
         * @method
         * @param {string} name websocket endpoint name
         * @param {string} [symbol] unified CCXT symbol
         * @param {object} [params] extra parameters specific to the oceanex api
         */
        await this.loadMarkets ();
        const url = this.urls['api']['ws']['private'];
        const messageHash = this.nonce ();
        const subscribe = {
            'method': name,
            'params': params,
            'id': messageHash,
        };
        return await this.watch (url, messageHash, subscribe, messageHash);
    }

    async watchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        /**
         * @method
         * @name oceanex#watchOrderBook
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @see https://api.oceanex.pro/doc/v1/#websocket-order-book
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int} [limit] the maximum amount of order book entries to return
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.precision]
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        const name = 'OrderBookHandler';
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        if (limit !== undefined) {
            request['level'] = limit;
        }
        const messageHash = name + '::' + market['id'];
        const orderbook = await this.subscribe (name, messageHash, false, 'GET', this.deepExtend (request, params));
        return orderbook.limit ();
    }

    handleOrderBook (client: Client, message) {
        //
        // TODO
        //    {
        //        "identifier": "{\"handler\":\"OrderBookHandler\"}",
        //        "message": {
        //            "action": "index",
        //            "uuid": "1bd05222-5755-4563-946c-3db8695e4d26",
        //            "code": 0,
        //            "data": {
        //                "asks": [
        //                    [
        //                        "1.725501",
        //                        "50000.0"
        //                    ]
        //                    ...
        //                ],
        //                "bids": [
        //                    [
        //                        "1.690629",
        //                        "50000.0"
        //                    ]
        //                    ...
        //                ]
        //            }
        //        }
        //    }
        //
        const data = this.safeValue2 (message, 'snapshot', 'update', {});
        const marketIds = Object.keys (data);
        const channel = this.safeString (message, 'ch');
        for (let i = 0; i < marketIds.length; i++) {
            const marketId = marketIds[i];
            const market = this.safeMarket (marketId);
            const symbol = market['symbol'];
            const item = data[marketId];
            const messageHash = channel + '::' + symbol;
            if (!(symbol in this.orderbooks)) {
                const subscription = this.safeValue (client.subscriptions, messageHash, {});
                const limit = this.safeInteger (subscription, 'limit');
                this.orderbooks[symbol] = this.orderBook ({}, limit);
            }
            const timestamp = this.safeInteger (item, 't');
            const nonce = this.safeInteger (item, 's');
            const orderbook = this.orderbooks[symbol];
            const asks = this.safeValue (item, 'a', []);
            const bids = this.safeValue (item, 'b', []);
            this.handleDeltas (orderbook['asks'], asks);
            this.handleDeltas (orderbook['bids'], bids);
            orderbook['timestamp'] = timestamp;
            orderbook['datetime'] = this.iso8601 (timestamp);
            orderbook['nonce'] = nonce;
            orderbook['symbol'] = symbol;
            this.orderbooks[symbol] = orderbook;
            client.resolve (orderbook, messageHash);
        }
    }

    handleDelta (bookside, delta) {
        // TODO
        const price = this.safeNumber (delta, 0);
        const amount = this.safeNumber (delta, 1);
        bookside.store (price, amount);
    }

    handleDeltas (bookside, deltas) {
        // TODO
        for (let i = 0; i < deltas.length; i++) {
            this.handleDelta (bookside, deltas[i]);
        }
    }

    async watchTicker (symbol: string, params = {}): Promise<Ticker> {
        /**
         * @method
         * @name oceanex#watchTicker
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @see https://api.oceanex.pro/doc/v1/#websocket-tickers
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        const name = 'TickerHandler';
        const market = this.market (symbol);
        const messageHash = name + '::' + market['id'];
        const request = {
            'markets': [ market['id'] ],
        };
        return await this.subscribe (name, messageHash, false, 'GET', this.deepExtend (request, params));
    }

    async watchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        /**
         * @method
         * @name oceanex#watchTicker
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @see https://api.oceanex.pro/doc/v1/#websocket-tickers
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the exchange API endpoint
         * @param {string} params.method 'ticker/{speed}' (default),'ticker/price/{speed}', 'ticker/{speed}/batch', or 'ticker/{speed}/price/batch''
         * @param {string} params.speed '1s' (default), or '3s'
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        const name = 'TickerHandler';
        const marketIds = [];
        if (symbols !== undefined) {
            for (let i = 0; i < symbols.length; i++) {
                const marketId = this.marketId (symbols[i]);
                marketIds.push (marketId);
            }
        }
        const request = {};
        let messageHash = name;
        if (marketIds.length > 0) {
            messageHash += '::' + marketIds.join (',');
            request['market_ids'] = marketIds;
        }
        const tickers = await this.subscribe (name, messageHash, false, 'GET', this.deepExtend (request, params));
        if (this.newUpdates) {
            return tickers;
        }
        return this.filterByArray (this.tickers, 'symbol', symbols);
    }

    handleTicker (client: Client, message) {
        //
        //    {
        //        "identifier": "{\"handler\":\"TickerHandler\"}",
        //        "message": {
        //            "action": "index",
        //            "uuid": "1310421e-a163-4f7a-9dc3-412c49c7dfc1",
        //            "code": 0,
        //            "data": {
        //                "vetoce": {
        //                    "name": "VET/OCE",
        //                    "display_name": "VET/OCE",
        //                    "base_unit": "vet",
        //                    "quote_unit": "oce",
        //                    "position": 64,
        //                    "open": "0.0",
        //                    "volume": "0.0",
        //                    "funds": "0.0",
        //                    "sell": "1.72550056",
        //                    "buy": "1.6906296",
        //                    "low": "0.0",
        //                    "high":"0.0",
        //                    "first": "0.0",
        //                    "last":"1.68970844",
        //                    "h24_trend": "0.0",
        //                    "at": 1581024183
        //                }
        //            }
        //        }
        //    }
        //
        const msg = this.safeValue (message, 'message', {});
        const data = this.safeValue (msg, 'data', {});
        const marketIds = Object.keys (data);
        const channel = this.safeString (message, 'ch');
        const newTickers = {};
        for (let i = 0; i < marketIds.length; i++) {
            const marketId = marketIds[i];
            const market = this.safeMarket (marketId);
            const symbol = market['symbol'];
            const ticker = this.parseWsTicker (data[marketId], market);
            this.tickers[symbol] = ticker;
            newTickers[symbol] = ticker;
            const messageHash = channel + '::' + symbol;
            client.resolve (newTickers, messageHash);
        }
        const messageHashes = this.findMessageHashes (client, channel + '::');
        for (let i = 0; i < messageHashes.length; i++) {
            const messageHash = messageHashes[i];
            const parts = messageHash.split ('::');
            const symbolsString = parts[1];
            const symbols = symbolsString.split (',');
            const tickers = this.filterByArray (newTickers, 'symbol', symbols);
            const tickersSymbols = Object.keys (tickers);
            const numTickers = tickersSymbols.length;
            if (numTickers > 0) {
                client.resolve (tickers, messageHash);
            }
        }
        client.resolve (this.tickers, channel);
        return message;
    }

    parseWsTicker (ticker, market = undefined) {
        //
        // TODO
        //    {
        //        "t": 1614815872000,             // Timestamp in milliseconds
        //        "a": "0.031175",                // Best ask
        //        "A": "0.03329",                 // Best ask quantity
        //        "b": "0.031148",                // Best bid
        //        "B": "0.10565",                 // Best bid quantity
        //        "c": "0.031210",                // Last price
        //        "o": "0.030781",                // Open price
        //        "h": "0.031788",                // High price
        //        "l": "0.030733",                // Low price
        //        "v": "62.587",                  // Base asset volume
        //        "q": "1.951420577",             // Quote asset volume
        //        "p": "0.000429",                // Price change
        //        "P": "1.39",                    // Price change percent
        //        "L": 1182694927                 // Last trade identifier
        //    }
        //
        //    {
        //        "t": 1614815872030,
        //        "o": "32636.79",
        //        "c": "32085.51",
        //        "h": "33379.92",
        //        "l": "30683.28",
        //        "v": "11.90667",
        //        "q": "384081.1955629"
        //    }
        //
        const timestamp = this.safeInteger (ticker, 't');
        const symbol = this.safeSymbol (undefined, market);
        const last = this.safeString (ticker, 'c');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'h'),
            'low': this.safeString (ticker, 'l'),
            'bid': this.safeString (ticker, 'b'),
            'bidVolume': this.safeString (ticker, 'B'),
            'ask': this.safeString (ticker, 'a'),
            'askVolume': this.safeString (ticker, 'A'),
            'vwap': undefined,
            'open': this.safeString (ticker, 'o'),
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeString (ticker, 'v'),
            'quoteVolume': this.safeString (ticker, 'q'),
            'info': ticker,
        }, market);
    }

    parseWsTrades (trades, market: object = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        // TODO
        trades = this.toArray (trades);
        let result = [];
        for (let i = 0; i < trades.length; i++) {
            const trade = this.extend (this.parseWsTrade (trades[i], market), params);
            result.push (trade);
        }
        result = this.sortBy2 (result, 'timestamp', 'id');
        const symbol = this.safeString (market, 'symbol');
        return this.filterBySymbolSinceLimit (result, symbol, since, limit) as Trade[];
    }

    parseWsTrade (trade, market = undefined) {
        //
        // TODO
        //    {
        //        "t": 1626861123552,       // Timestamp in milliseconds
        //        "i": 1555634969,          // Trade identifier
        //        "p": "30877.68",          // Price
        //        "q": "0.00006",           // Quantity
        //        "s": "sell"               // Side
        //    }
        //
        const timestamp = this.safeInteger (trade, 't');
        return this.safeTrade ({
            'info': trade,
            'id': this.safeString (trade, 'i'),
            'order': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': this.safeString (market, 'symbol'),
            'type': undefined,
            'side': this.safeString (trade, 's'),
            'takerOrMaker': undefined,
            'price': this.safeString (trade, 'p'),
            'amount': this.safeString (trade, 'q'),
            'cost': undefined,
            'fee': undefined,
        }, market);
    }

    async watchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        /**
         * TODO
         * @method
         * @name oceanex#watchOHLCV
         * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @see https://api.oceanex.pro/doc/v1/#websocket-k-line
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} [timeframe] the length of time each candle represents
         * @param {int} [since] not used by oceanex watchOHLCV
         * @param {int} [limit] 0 – 1000, default value = 0 (no history returned)
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        const period = this.safeString (this.timeframes, timeframe, timeframe);
        const name = 'candles/' + period;
        const market = this.market (symbol);
        const request = {
            'params': {
                'symbols': [ market['id'] ],
            },
        };
        if (limit !== undefined) {
            request['params']['limit'] = limit;
        }
        const ohlcv = await this.subscribe (name, name, false, 'GET', this.deepExtend (request, params));
        if (this.newUpdates) {
            limit = ohlcv.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (ohlcv, since, limit, 0);
    }

    handleOHLCV (client: Client, message) {
        //
        // TODO
        //    {
        //        "ch": "candles/M1",                     // Channel
        //        "snapshot": {
        //            "BTCUSDT": [{
        //                "t": 1626860340000,             // Message timestamp
        //                "o": "30881.95",                // Open price
        //                "c": "30890.96",                // Last price
        //                "h": "30900.8",                 // High price
        //                "l": "30861.27",                // Low price
        //                "v": "1.27852",                 // Base asset volume
        //                "q": "39493.9021811"            // Quote asset volume
        //            }
        //            ...
        //            ]
        //        }
        //    }
        //
        //    {
        //        "ch": "candles/M1",
        //        "update": {
        //            "ETHBTC": [{
        //                "t": 1626860880000,
        //                "o": "0.060711",
        //                "c": "0.060749",
        //                "h": "0.060749",
        //                "l": "0.060711",
        //                "v": "12.2800",
        //                "q": "0.7455339675"
        //          }]
        //        }
        //    }
        //
        const data = this.safeValue2 (message, 'snapshot', 'update', {});
        const marketIds = Object.keys (data);
        const channel = this.safeString (message, 'ch');
        const splitChannel = channel.split ('/');
        const period = this.safeString (splitChannel, 1);
        const timeframe = this.findTimeframe (period);
        for (let i = 0; i < marketIds.length; i++) {
            const marketId = marketIds[i];
            const market = this.safeMarket (marketId);
            const symbol = market['symbol'];
            this.ohlcvs[symbol] = this.safeValue (this.ohlcvs, symbol, {});
            let stored = this.safeValue (this.ohlcvs[symbol], timeframe);
            if (stored === undefined) {
                const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
                stored = new ArrayCacheByTimestamp (limit);
                this.ohlcvs[symbol][timeframe] = stored;
            }
            const ohlcvs = this.parseWsOHLCVs (data[marketId], market);
            for (let j = 0; j < ohlcvs.length; j++) {
                stored.append (ohlcvs[j]);
            }
            const messageHash = channel + '::' + symbol;
            client.resolve (stored, messageHash);
        }
        return message;
    }

    parseWsOHLCV (ohlcv, market = undefined): OHLCV {
        //
        // TODO
        //    {
        //        "t": 1626860340000,             // Message timestamp
        //        "o": "30881.95",                // Open price
        //        "c": "30890.96",                // Last price
        //        "h": "30900.8",                 // High price
        //        "l": "30861.27",                // Low price
        //        "v": "1.27852",                 // Base asset volume
        //        "q": "39493.9021811"            // Quote asset volume
        //    }
        //
        return [
            this.safeInteger (ohlcv, 't'),
            this.safeNumber (ohlcv, 'o'),
            this.safeNumber (ohlcv, 'h'),
            this.safeNumber (ohlcv, 'l'),
            this.safeNumber (ohlcv, 'c'),
            this.safeNumber (ohlcv, 'v'),
        ];
    }

    async watchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        /**
         * @method
         * @name oceanex#watchOrders
         * @description watches information on multiple orders made by the user
         * @see https://api.oceanex.pro/doc/v1/#websocket-all-open-order
         * @param {string} [symbol] unified CCXT market symbol
         * @param {int} [since] timestamp in ms of the earliest order to fetch
         * @param {int} [limit] the maximum amount of orders to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        let marketType = undefined;
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        [ marketType, params ] = this.handleMarketTypeAndParams ('watchOrders', market, params);
        const name = this.getSupportedMapping (marketType, {
            'spot': 'spot_subscribe',
            'margin': 'margin_subscribe',
            'swap': 'futures_subscribe',
            'future': 'futures_subscribe',
        });
        const orders = await this.subscribe (name, name, false, 'GET', params);
        if (this.newUpdates) {
            limit = orders.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (orders, since, limit, 'timestamp');
    }

    handleOrder (client: Client, message) {
        //
        // TODO
        //    {
        //        "jsonrpc": "2.0",
        //        "method": "spot_order",                            // "margin_order", "future_order"
        //        "params": {
        //            "id": 584244931496,
        //            "client_order_id": "b5acd79c0a854b01b558665bcf379456",
        //            "symbol": "BTCUSDT",
        //            "side": "buy",
        //            "status": "new",
        //            "type": "limit",
        //            "time_in_force": "GTC",
        //            "quantity": "0.01000",
        //            "quantity_cumulative": "0",
        //            "price": "0.01",                              // only updates and snapshots
        //            "post_only": false,
        //            "reduce_only": false,                         // only margin and contract
        //            "display_quantity": "0",                      // only updates and snapshot
        //            "created_at": "2021-07-02T22:52:32.864Z",
        //            "updated_at": "2021-07-02T22:52:32.864Z",
        //            "trade_id": 1361977606,                       // only trades
        //            "trade_quantity": "0.00001",                  // only trades
        //            "trade_price": "49595.04",                    // only trades
        //            "trade_fee": "0.001239876000",                // only trades
        //            "trade_taker": true,                          // only trades, only spot
        //            "trade_position_id": 485308,                  // only trades, only margin
        //            "report_type": "new"                          // "trade", "status" (snapshot)
        //        }
        //    }
        //
        //    {
        //       "jsonrpc": "2.0",
        //       "method": "spot_orders",                            // "margin_orders", "future_orders"
        //       "params": [
        //            {
        //                "id": 584244931496,
        //                "client_order_id": "b5acd79c0a854b01b558665bcf379456",
        //                "symbol": "BTCUSDT",
        //                "side": "buy",
        //                "status": "new",
        //                "type": "limit",
        //                "time_in_force": "GTC",
        //                "quantity": "0.01000",
        //                "quantity_cumulative": "0",
        //                "price": "0.01",                              // only updates and snapshots
        //                "post_only": false,
        //                "reduce_only": false,                         // only margin and contract
        //                "display_quantity": "0",                      // only updates and snapshot
        //                "created_at": "2021-07-02T22:52:32.864Z",
        //                "updated_at": "2021-07-02T22:52:32.864Z",
        //                "trade_id": 1361977606,                       // only trades
        //                "trade_quantity": "0.00001",                  // only trades
        //                "trade_price": "49595.04",                    // only trades
        //                "trade_fee": "0.001239876000",                // only trades
        //                "trade_taker": true,                          // only trades, only spot
        //                "trade_position_id": 485308,                  // only trades, only margin
        //                "report_type": "new"                          // "trade", "status" (snapshot)
        //            }
        //        ]
        //    }
        //
        if (this.orders === undefined) {
            const limit = this.safeInteger (this.options, 'ordersLimit');
            this.orders = new ArrayCacheBySymbolById (limit);
        }
        const data = this.safeValue (message, 'params', []);
        if (Array.isArray (data)) {
            for (let i = 0; i < data.length; i++) {
                const order = data[i];
                this.handleOrderHelper (client, message, order);
            }
        } else {
            this.handleOrderHelper (client, message, data);
        }
        return message;
    }

    handleOrderHelper (client: Client, message, order) {
        // TODO
        const orders = this.orders;
        const marketId = this.safeStringLower2 (order, 'instrument', 'symbol');
        const method = this.safeString (message, 'method');
        const splitMethod = method.split ('_order');
        const messageHash = this.safeString (splitMethod, 0);
        const symbol = this.safeSymbol (marketId);
        const parsed = this.parseOrder (order);
        orders.append (parsed);
        client.resolve (orders, messageHash);
        client.resolve (orders, messageHash + '::' + symbol);
    }

    parseWsOrderTrade (trade, market = undefined) {
        //
        // TODO
        //    {
        //        "id": 584244931496,
        //        "client_order_id": "b5acd79c0a854b01b558665bcf379456",
        //        "symbol": "BTCUSDT",
        //        "side": "buy",
        //        "status": "new",
        //        "type": "limit",
        //        "time_in_force": "GTC",
        //        "quantity": "0.01000",
        //        "quantity_cumulative": "0",
        //        "price": "0.01",                              // only updates and snapshots
        //        "post_only": false,
        //        "reduce_only": false,                         // only margin and contract
        //        "display_quantity": "0",                      // only updates and snapshot
        //        "created_at": "2021-07-02T22:52:32.864Z",
        //        "updated_at": "2021-07-02T22:52:32.864Z",
        //        "trade_id": 1361977606,                       // only trades
        //        "trade_quantity": "0.00001",                  // only trades
        //        "trade_price": "49595.04",                    // only trades
        //        "trade_fee": "0.001239876000",                // only trades
        //        "trade_taker": true,                          // only trades, only spot
        //        "trade_position_id": 485308,                  // only trades, only margin
        //        "report_type": "new"                          // "trade", "status" (snapshot)
        //    }
        //
        const timestamp = this.safeInteger (trade, 'created_at');
        const marketId = this.safeString (trade, 'symbol');
        return this.safeTrade ({
            'info': trade,
            'id': this.safeString (trade, 'trade_id'),
            'order': this.safeString (trade, 'id'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': this.safeMarket (marketId, market),
            'type': undefined,
            'side': this.safeString (trade, 'side'),
            'takerOrMaker': this.safeString (trade, 'trade_taker'),
            'price': this.safeString (trade, 'trade_price'),
            'amount': this.safeString (trade, 'trade_quantity'),
            'cost': undefined,
            'fee': {
                'cost': this.safeString (trade, 'trade_fee'),
                'currency': undefined,
                'rate': undefined,
            },
        }, market);
    }

    parseWsOrder (order, market = undefined) {
        //
        // TODO
        //    {
        //        "id": 584244931496,
        //        "client_order_id": "b5acd79c0a854b01b558665bcf379456",
        //        "symbol": "BTCUSDT",
        //        "side": "buy",
        //        "status": "new",
        //        "type": "limit",
        //        "time_in_force": "GTC",
        //        "quantity": "0.01000",
        //        "quantity_cumulative": "0",
        //        "price": "0.01",                              // only updates and snapshots
        //        "post_only": false,
        //        "reduce_only": false,                         // only margin and contract
        //        "display_quantity": "0",                      // only updates and snapshot
        //        "created_at": "2021-07-02T22:52:32.864Z",
        //        "updated_at": "2021-07-02T22:52:32.864Z",
        //        "trade_id": 1361977606,                       // only trades
        //        "trade_quantity": "0.00001",                  // only trades
        //        "trade_price": "49595.04",                    // only trades
        //        "trade_fee": "0.001239876000",                // only trades
        //        "trade_taker": true,                          // only trades, only spot
        //        "trade_position_id": 485308,                  // only trades, only margin
        //        "report_type": "new"                          // "trade", "status" (snapshot)
        //    }
        //
        const timestamp = this.safeString (order, 'created_at');
        const marketId = this.safeString (order, 'symbol');
        market = this.safeMarket (marketId, market);
        const tradeId = this.safeString (order, 'trade_id');
        let trades = undefined;
        if (tradeId !== undefined) {
            const trade = this.parseWsOrderTrade (order, market);
            trades = [ trade ];
        }
        const rawStatus = this.safeString (order, 'status');
        const report_type = this.safeString (order, 'report_type');
        let parsedStatus = undefined;
        if (report_type === 'canceled') {
            parsedStatus = this.parseOrderStatus (report_type);
        } else {
            parsedStatus = this.parseOrderStatus (rawStatus);
        }
        return this.safeOrder ({
            'info': order,
            'id': this.safeString (order, 'id'),
            'clientOrderId': this.safeString (order, 'client_order_id'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': market['symbol'],
            'price': this.safeString (order, 'price'),
            'amount': this.safeString (order, 'quantity'),
            'type': this.safeString (order, 'type'),
            'side': this.safeStringUpper (order, 'side'),
            'timeInForce': this.safeString (order, 'time_in_force'),
            'postOnly': this.safeString (order, 'post_only'),
            'reduceOnly': this.safeValue (order, 'reduce_only'),
            'filled': undefined,
            'remaining': undefined,
            'cost': undefined,
            'status': parsedStatus,
            'average': undefined,
            'trades': trades,
            'fee': undefined,
        }, market);
    }

    async watchBalance (params = {}): Promise<Balances> {
        /**
         * @method
         * @name oceanex#watchBalance
         * @description watches balance updates, cannot subscribe to margin account balances
         * @see https://api.oceanex.pro/doc/v1/#websocket-account
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.type] 'spot', 'swap', or 'future'
         *
         * EXCHANGE SPECIFIC PARAMETERS
         * @param {string} [params.mode] 'updates' or 'batches' (default), 'updates' = messages arrive after balance updates, 'batches' = messages arrive at equal intervals if there were any updates
         * @returns {object[]} a list of [balance structures]{@link https://docs.ccxt.com/#/?id=balance-structure}
         */
        await this.loadMarkets ();
        let type = undefined;
        [ type, params ] = this.handleMarketTypeAndParams ('watchBalance', undefined, params);
        const name = this.getSupportedMapping (type, {
            'spot': 'spot_balance_subscribe',
            'swap': 'futures_balance_subscribe',
            'future': 'futures_balance_subscribe',
        });
        const mode = this.safeString (params, 'mode', 'batches');
        params = this.omit (params, 'mode');
        const request = {
            'mode': mode,
        };
        return await this.subscribe (name, name, false, 'GET', this.deepExtend (request, params));
    }

    handleBalance (client: Client, message) {
        //
        // TODO
        //    {
        //        "jsonrpc": "2.0",
        //        "method": "futures_balance",
        //        "params": [
        //            {
        //                "currency": "BCN",
        //                "available": "100.000000000000",
        //                "reserved": "0",
        //                "reserved_margin": "0"
        //            },
        //            ...
        //        ]
        //    }
        //
        const messageHash = this.safeString (message, 'method');
        const params = this.safeValue (message, 'params');
        const balance = this.parseBalance (params);
        this.balance = this.deepExtend (this.balance, balance);
        client.resolve (this.balance, messageHash);
    }

    handleNotification (client: Client, message) {
        //
        // TODO
        //     { jsonrpc: "2.0", result: true, id: null }
        //
        return message;
    }

    handleOrderRequest (client: Client, message) {
        //
        // TODO
        // createOrderWs, cancelOrderWs
        //
        //    {
        //        "jsonrpc": "2.0",
        //        "result": {
        //            "id": 1130310696965,
        //            "client_order_id": "OPC2oyHSkEBqIpPtniLqeW-597hUL3Yo",
        //            "symbol": "ADAUSDT",
        //            "side": "buy",
        //            "status": "new",
        //            "type": "limit",
        //            "time_in_force": "GTC",
        //            "quantity": "4",
        //            "quantity_cumulative": "0",
        //            "price": "0.3300000",
        //            "post_only": false,
        //            "created_at": "2023-11-17T14:58:15.903Z",
        //            "updated_at": "2023-11-17T14:58:15.903Z",
        //            "original_client_order_id": "d6b645556af740b1bd1683400fd9cbce",       // spot_replace_order only
        //            "report_type": "new"
        //            "margin_mode": "isolated",                                            // margin and future only
        //            "reduce_only": false,                                                 // margin and future only
        //        },
        //        "id": 1700233093414
        //    }
        //
        const messageHash = this.safeInteger (message, 'id');
        const result = this.safeValue (message, 'result', {});
        if (Array.isArray (result)) {
            const parsedOrders = [];
            for (let i = 0; i < result.length; i++) {
                const parsedOrder = this.parseWsOrder (result[i]);
                parsedOrders.push (parsedOrder);
            }
            client.resolve (parsedOrders, messageHash);
        } else {
            const parsedOrder = this.parseWsOrder (result);
            client.resolve (parsedOrder, messageHash);
        }
        return message;
    }

    async createOrderWs (symbol: string, type: OrderType, side: OrderSide, amount, price = undefined, params = {}): Promise<Order> {
        /**
         * @method
         * @name oceanex#createOrder
         * @description create a trade order
         * @see https://api.oceanex.pro/doc/v1/#websocket-order-create
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float} [price] the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an [order structure]{@link https://github.com/ccxt/ccxt/wiki/Manual#order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        let request = undefined;
        let marketType = undefined;
        [ marketType, params ] = this.handleMarketTypeAndParams ('createOrder', market, params);
        let marginMode = undefined;
        [ marginMode, params ] = this.handleMarginModeAndParams ('createOrder', params);
        [ request, params ] = await this.subscribe ('temp', marketType, false, side, amount);
        request = this.extend (request, params);
        if (marketType === 'swap') {
            return await this.tradeRequest ('futures_new_order', request);
        } else if ((marketType === 'margin') || (marginMode !== undefined)) {
            return await this.tradeRequest ('margin_new_order', request);
        } else {
            return await this.tradeRequest ('spot_new_order', request);
        }
    }

    async cancelOrderWs (id: string, symbol: Str = undefined, params = {}): Promise<Order> {
        /**
         * @method
         * @name oceanex#cancelOrderWs
         * @see https://api.oceanex.pro/doc/v1/#websocket-order-cancel
         * @description cancels an open order
         * @param {string} id order id
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.marginMode] 'cross' or 'isolated' only 'isolated' is supported
         * @param {bool} [params.margin] true for canceling a margin order
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        let market = undefined;
        let request = {
            'client_order_id': id,
        };
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        let marketType = undefined;
        [ marketType, params ] = this.handleMarketTypeAndParams ('cancelOrderWs', market, params);
        const [ marginMode, query ] = this.handleMarginModeAndParams ('cancelOrderWs', params);
        request = this.extend (request, query);
        if (marketType === 'swap') {
            return await this.tradeRequest ('futures_cancel_order', request);
        } else if ((marketType === 'margin') || (marginMode !== undefined)) {
            return await this.tradeRequest ('margin_cancel_order', request);
        } else {
            return await this.tradeRequest ('spot_cancel_order', request);
        }
    }

    async cancelAllOrdersWs (symbol: Str = undefined, params = {}) {
        /**
         * @method
         * @name oceanex#cancelAllOrdersWs
         * @see https://api.oceanex.pro/doc/v1/#websocket-all-order-cancel
         * @description cancel all open orders
         * @param {string} symbol unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.marginMode] 'cross' or 'isolated' only 'isolated' is supported
         * @param {bool} [params.margin] true for canceling margin orders
         * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        let marketType = undefined;
        [ marketType, params ] = this.handleMarketTypeAndParams ('cancelAllOrdersWs', market, params);
        let marginMode = undefined;
        [ marginMode, params ] = this.handleMarginModeAndParams ('cancelAllOrdersWs', params);
        if (marketType === 'swap') {
            return await this.tradeRequest ('futures_cancel_orders', params);
        } else if ((marketType === 'margin') || (marginMode !== undefined)) {
            throw new NotSupported (this.id + ' cancelAllOrdersWs is not supported for margin orders');
        } else {
            return await this.tradeRequest ('spot_cancel_orders', params);
        }
    }

    async fetchOrderWs (id: string, symbol: string = undefined, params = {}): Promise<Order> {
        /**
         * @method
         * @name oceanex#fetchOrderWs
         * @see https://api.oceanex.pro/doc/v1/#websocket-order-info
         * @description fetches information on an order made by the user
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} [params] extra parameters specific to the bitvavo api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'orderId': id,
            'market': market['id'],
        };
        return await this.subscribe ('temp', 'temp', false, this.extend (request, params));
    }

    async watchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        /**
         * @method
         * @name oceanex#watchMyTrades
         * @description watches information on multiple trades made by the user using orders stream
         * @see https://api.oceanex.pro/doc/v1/#websocket-all-history-order
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int} [since] not used by oceanex watchMyTrades
         * @param {int} [limit] not used by oceanex watchMyTrades
         * @param {object} [params] extra parameters specific to the poloniex strean
         * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
         */
        await this.loadMarkets ();
        const name = 'orders';
        const messageHash = 'myTrades';
        if (symbol !== undefined) {
            symbol = this.symbol (symbol);
        }
        // const symbols = (symbol === undefined) ? undefined : [ symbol ];
        const trades = await this.subscribe (name, messageHash, true, 'temp', params);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    handleMessage (client: Client, message) {
        if (this.handleError (client, message)) {
            return;
        }
        const type = this.safeString (message, 'type');
        if (type === 'ping') {
            const pong = { 'command': 'pong' };
            return pong;
            // TODO: send pong to server
        } else if (type === 'welcome') {
            const keepAlive = this.safeIntegerProduct (message, 'message', 1000, 60000);
            this.streaming['keepAlive'] = keepAlive;
        }
        const identifier = this.safeDict (message, 'identifier');
        const handler = this.safeString (identifier, 'handler');
        // const data = this.safeDict (message, 'data');
        // const action = this.safeString (data, 'action');
        const methods = {
            'OrderBookHandler': this.handleOrderBook,
            'TickerHandler': this.handleTicker,
            'KlineHandler': this.handleOHLCV,
            'OrderHandler': this.handleOrder,
            'AccountHandler': this.handleBalance,
        };
        const endpoint = this.safeValue (methods, handler);
        if (endpoint !== undefined) {
            return endpoint.call (this, client, message);
        }
    }

    handleAuthenticate (client: Client, message) {
        //
        // TODO
        //    {
        //        "jsonrpc": "2.0",
        //        "result": true
        //    }
        //
        const success = this.safeValue (message, 'result');
        const messageHash = 'authenticated';
        if (success) {
            const future = this.safeValue (client.futures, messageHash);
            future.resolve (true);
        } else {
            const error = new AuthenticationError (this.id + ' ' + this.json (message));
            client.reject (error, messageHash);
            if (messageHash in client.subscriptions) {
                delete client.subscriptions[messageHash];
            }
        }
        return message;
    }

    handleError (client: Client, message) {
        //
        // TODO
        //    {
        //        jsonrpc: '2.0',
        //        error: {
        //          code: 20001,
        //          message: 'Insufficient funds',
        //          description: 'Check that the funds are sufficient, given commissions'
        //        },
        //        id: 1700228604325
        //    }
        //
        const error = this.safeValue (message, 'error');
        if (error !== undefined) {
            const code = this.safeValue (error, 'code');
            const errorMessage = this.safeString (error, 'message');
            const description = this.safeString (error, 'description');
            const feedback = this.id + ' ' + description;
            this.throwExactlyMatchedException (this.exceptions['exact'], code, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], errorMessage, feedback);
            throw new ExchangeError (feedback); // unknown message
        }
        return undefined;
    }
}
