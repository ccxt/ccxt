//  ---------------------------------------------------------------------------
import geminiRest from '../gemini.js';
import { ArrayCache, ArrayCacheBySymbolById, ArrayCacheByTimestamp } from '../base/ws/Cache.js';
import { ExchangeError, NotSupported } from '../base/errors.js';
import { sha384 } from '../static_dependencies/noble-hashes/sha512.js';
import Precise from '../base/Precise.js';
//  ---------------------------------------------------------------------------
export default class gemini extends geminiRest {
    describe() {
        return this.deepExtend(super.describe(), {
            'has': {
                'ws': true,
                'watchBalance': false,
                'watchTicker': false,
                'watchTickers': false,
                'watchBidsAsks': true,
                'watchTrades': true,
                'watchTradesForSymbols': true,
                'watchMyTrades': false,
                'watchOrders': true,
                'watchOrderBook': true,
                'watchOrderBookForSymbols': true,
                'watchOHLCV': true,
            },
            'hostname': 'api.gemini.com',
            'urls': {
                'api': {
                    'ws': 'wss://api.gemini.com',
                },
                'test': {
                    'ws': 'wss://api.sandbox.gemini.com',
                },
            },
        });
    }
    /**
     * @method
     * @name gemini#watchTrades
     * @description watch the list of most recent trades for a particular symbol
     * @see https://docs.gemini.com/websocket-api/#market-data-version-2
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async watchTrades(symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const messageHash = 'trades:' + market['symbol'];
        const marketId = market['id'];
        const request = {
            'type': 'subscribe',
            'subscriptions': [
                {
                    'name': 'l2',
                    'symbols': [
                        marketId.toUpperCase(),
                    ],
                },
            ],
        };
        const subscribeHash = 'l2:' + market['symbol'];
        const url = this.urls['api']['ws'] + '/v2/marketdata';
        const trades = await this.watch(url, messageHash, request, subscribeHash);
        if (this.newUpdates) {
            limit = trades.getLimit(market['symbol'], limit);
        }
        return this.filterBySinceLimit(trades, since, limit, 'timestamp', true);
    }
    /**
     * @method
     * @name gemini#watchTradesForSymbols
     * @see https://docs.gemini.com/websocket-api/#multi-market-data
     * @description get the list of most recent trades for a list of symbols
     * @param {string[]} symbols unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async watchTradesForSymbols(symbols, since = undefined, limit = undefined, params = {}) {
        const trades = await this.helperForWatchMultipleConstruct('trades', symbols, params);
        if (this.newUpdates) {
            const first = this.safeList(trades, 0);
            const tradeSymbol = this.safeString(first, 'symbol');
            limit = trades.getLimit(tradeSymbol, limit);
        }
        return this.filterBySinceLimit(trades, since, limit, 'timestamp', true);
    }
    parseWsTrade(trade, market = undefined) {
        //
        // regular v2 trade
        //
        //     {
        //         "type": "trade",
        //         "symbol": "BTCUSD",
        //         "event_id": 122258166738,
        //         "timestamp": 1655330221424,
        //         "price": "22269.14",
        //         "quantity": "0.00004473",
        //         "side": "buy"
        //     }
        //
        // multi data trade
        //
        //    {
        //        "type": "trade",
        //        "symbol": "ETHUSD",
        //        "tid": "1683002242170204", // this is not TS, but somewhat ID
        //        "price": "2299.24",
        //        "amount": "0.002662",
        //        "makerSide": "bid"
        //    }
        //
        const timestamp = this.safeInteger(trade, 'timestamp');
        const id = this.safeString2(trade, 'event_id', 'tid');
        const priceString = this.safeString(trade, 'price');
        const amountString = this.safeString2(trade, 'quantity', 'amount');
        let side = this.safeStringLower(trade, 'side');
        if (side === undefined) {
            const marketSide = this.safeStringLower(trade, 'makerSide');
            if (marketSide === 'bid') {
                side = 'sell';
            }
            else if (marketSide === 'ask') {
                side = 'buy';
            }
        }
        const marketId = this.safeStringLower(trade, 'symbol');
        const symbol = this.safeSymbol(marketId, market);
        return this.safeTrade({
            'id': id,
            'order': undefined,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'symbol': symbol,
            'type': undefined,
            'side': side,
            'takerOrMaker': undefined,
            'price': priceString,
            'cost': undefined,
            'amount': amountString,
            'fee': undefined,
        }, market);
    }
    handleTrade(client, message) {
        //
        //     {
        //         "type": "trade",
        //         "symbol": "BTCUSD",
        //         "event_id": 122278173770,
        //         "timestamp": 1655335880981,
        //         "price": "22530.80",
        //         "quantity": "0.04",
        //         "side": "buy"
        //     }
        //
        const trade = this.parseWsTrade(message);
        const symbol = trade['symbol'];
        const tradesLimit = this.safeInteger(this.options, 'tradesLimit', 1000);
        let stored = this.safeValue(this.trades, symbol);
        if (stored === undefined) {
            stored = new ArrayCache(tradesLimit);
            this.trades[symbol] = stored;
        }
        stored.append(trade);
        const messageHash = 'trades:' + symbol;
        client.resolve(stored, messageHash);
    }
    handleTrades(client, message) {
        //
        //     {
        //         "type": "l2_updates",
        //         "symbol": "BTCUSD",
        //         "changes": [
        //             [ "buy", '22252.37', "0.02" ],
        //             [ "buy", '22251.61', "0.04" ],
        //             [ "buy", '22251.60', "0.04" ],
        //             // some asks as well
        //         ],
        //         "trades": [
        //             { type: 'trade', symbol: 'BTCUSD', event_id: 122258166738, timestamp: 1655330221424, price: '22269.14', quantity: "0.00004473", side: "buy" },
        //             { type: 'trade', symbol: 'BTCUSD', event_id: 122258141090, timestamp: 1655330213216, price: '22250.00', quantity: "0.00704098", side: "buy" },
        //             { type: 'trade', symbol: 'BTCUSD', event_id: 122258118291, timestamp: 1655330206753, price: '22250.00', quantity: "0.03", side: "buy" },
        //         ],
        //         "auction_events": [
        //             {
        //                 "type": "auction_result",
        //                 "symbol": "BTCUSD",
        //                 "time_ms": 1655323200000,
        //                 "result": "failure",
        //                 "highest_bid_price": "21590.88",
        //                 "lowest_ask_price": "21602.30",
        //                 "collar_price": "21634.73"
        //             },
        //             {
        //                 "type": "auction_indicative",
        //                 "symbol": "BTCUSD",
        //                 "time_ms": 1655323185000,
        //                 "result": "failure",
        //                 "highest_bid_price": "21661.90",
        //                 "lowest_ask_price": "21663.78",
        //                 "collar_price": "21662.845"
        //             },
        //         ]
        //     }
        //
        const marketId = this.safeStringLower(message, 'symbol');
        const market = this.safeMarket(marketId);
        const trades = this.safeValue(message, 'trades');
        if (trades !== undefined) {
            const symbol = market['symbol'];
            const tradesLimit = this.safeInteger(this.options, 'tradesLimit', 1000);
            let stored = this.safeValue(this.trades, symbol);
            if (stored === undefined) {
                stored = new ArrayCache(tradesLimit);
                this.trades[symbol] = stored;
            }
            for (let i = 0; i < trades.length; i++) {
                const trade = this.parseWsTrade(trades[i], market);
                stored.append(trade);
            }
            const messageHash = 'trades:' + symbol;
            client.resolve(stored, messageHash);
        }
    }
    handleTradesForMultidata(client, trades, timestamp) {
        if (trades !== undefined) {
            const tradesLimit = this.safeInteger(this.options, 'tradesLimit', 1000);
            const storesForSymbols = {};
            for (let i = 0; i < trades.length; i++) {
                const marketId = trades[i]['symbol'];
                const market = this.safeMarket(marketId.toLowerCase());
                const symbol = market['symbol'];
                const trade = this.parseWsTrade(trades[i], market);
                trade['timestamp'] = timestamp;
                trade['datetime'] = this.iso8601(timestamp);
                let stored = this.safeValue(this.trades, symbol);
                if (stored === undefined) {
                    stored = new ArrayCache(tradesLimit);
                    this.trades[symbol] = stored;
                }
                stored.append(trade);
                storesForSymbols[symbol] = stored;
            }
            const symbols = Object.keys(storesForSymbols);
            for (let i = 0; i < symbols.length; i++) {
                const symbol = symbols[i];
                const stored = storesForSymbols[symbol];
                const messageHash = 'trades:' + symbol;
                client.resolve(stored, messageHash);
            }
        }
    }
    /**
     * @method
     * @name gemini#watchOHLCV
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://docs.gemini.com/websocket-api/#candles-data-feed
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async watchOHLCV(symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const timeframeId = this.safeString(this.timeframes, timeframe, timeframe);
        const request = {
            'type': 'subscribe',
            'subscriptions': [
                {
                    'name': 'candles_' + timeframeId,
                    'symbols': [
                        market['id'].toUpperCase(),
                    ],
                },
            ],
        };
        const messageHash = 'ohlcv:' + market['symbol'] + ':' + timeframeId;
        const url = this.urls['api']['ws'] + '/v2/marketdata';
        const ohlcv = await this.watch(url, messageHash, request, messageHash);
        if (this.newUpdates) {
            limit = ohlcv.getLimit(symbol, limit);
        }
        return this.filterBySinceLimit(ohlcv, since, limit, 0, true);
    }
    handleOHLCV(client, message) {
        //
        //     {
        //         "type": "candles_15m_updates",
        //         "symbol": "BTCUSD",
        //         "changes": [
        //             [
        //                 1561054500000,
        //                 9350.18,
        //                 9358.35,
        //                 9350.18,
        //                 9355.51,
        //                 2.07
        //             ],
        //             [
        //                 1561053600000,
        //                 9357.33,
        //                 9357.33,
        //                 9350.18,
        //                 9350.18,
        //                 1.5900161
        //             ]
        //             ...
        //         ]
        //     }
        //
        const type = this.safeString(message, 'type', '');
        let timeframeId = type.slice(8);
        const timeframeEndIndex = timeframeId.indexOf('_');
        timeframeId = timeframeId.slice(0, timeframeEndIndex);
        const marketId = this.safeString(message, 'symbol', '').toLowerCase();
        const market = this.safeMarket(marketId);
        const symbol = this.safeSymbol(marketId, market);
        const changes = this.safeValue(message, 'changes', []);
        const timeframe = this.findTimeframe(timeframeId);
        const ohlcvsBySymbol = this.safeValue(this.ohlcvs, symbol);
        if (ohlcvsBySymbol === undefined) {
            this.ohlcvs[symbol] = {};
        }
        let stored = this.safeValue(this.ohlcvs[symbol], timeframe);
        if (stored === undefined) {
            const limit = this.safeInteger(this.options, 'OHLCVLimit', 1000);
            stored = new ArrayCacheByTimestamp(limit);
            this.ohlcvs[symbol][timeframe] = stored;
        }
        const changesLength = changes.length;
        // reverse order of array to store candles in ascending order
        for (let i = 0; i < changesLength; i++) {
            const index = changesLength - i - 1;
            const parsed = this.parseOHLCV(changes[index], market);
            stored.append(parsed);
        }
        const messageHash = 'ohlcv:' + symbol + ':' + timeframeId;
        client.resolve(stored, messageHash);
        return message;
    }
    /**
     * @method
     * @name gemini#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.gemini.com/websocket-api/#market-data-version-2
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async watchOrderBook(symbol, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const messageHash = 'orderbook:' + market['symbol'];
        const marketId = market['id'];
        const request = {
            'type': 'subscribe',
            'subscriptions': [
                {
                    'name': 'l2',
                    'symbols': [
                        marketId.toUpperCase(),
                    ],
                },
            ],
        };
        const subscribeHash = 'l2:' + market['symbol'];
        const url = this.urls['api']['ws'] + '/v2/marketdata';
        const orderbook = await this.watch(url, messageHash, request, subscribeHash);
        return orderbook.limit();
    }
    handleOrderBook(client, message) {
        const changes = this.safeValue(message, 'changes', []);
        const marketId = this.safeStringLower(message, 'symbol');
        const market = this.safeMarket(marketId);
        const symbol = market['symbol'];
        const messageHash = 'orderbook:' + symbol;
        // let orderbook = this.safeValue (this.orderbooks, symbol);
        if (!(symbol in this.orderbooks)) {
            this.orderbooks[symbol] = this.orderBook();
        }
        const orderbook = this.orderbooks[symbol];
        for (let i = 0; i < changes.length; i++) {
            const delta = changes[i];
            const price = this.safeNumber(delta, 1);
            const size = this.safeNumber(delta, 2);
            const side = (delta[0] === 'buy') ? 'bids' : 'asks';
            const bookside = orderbook[side];
            bookside.store(price, size);
            orderbook[side] = bookside;
        }
        orderbook['symbol'] = symbol;
        this.orderbooks[symbol] = orderbook;
        client.resolve(orderbook, messageHash);
    }
    /**
     * @method
     * @name gemini#watchOrderBookForSymbols
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.gemini.com/websocket-api/#multi-market-data
     * @param {string[]} symbols unified array of symbols
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async watchOrderBookForSymbols(symbols, limit = undefined, params = {}) {
        const orderbook = await this.helperForWatchMultipleConstruct('orderbook', symbols, params);
        return orderbook.limit();
    }
    /**
     * @method
     * @name gemini#watchBidsAsks
     * @description watches best bid & ask for symbols
     * @see https://docs.gemini.com/websocket-api/#multi-market-data
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchBidsAsks(symbols = undefined, params = {}) {
        return await this.helperForWatchMultipleConstruct('bidsasks', symbols, params);
    }
    handleBidsAsksForMultidata(client, rawBidAskChanges, timestamp, nonce) {
        //
        // {
        //     eventId: '1683002916916153',
        //     events: [
        //       {
        //         price: '50945.37',
        //         reason: 'top-of-book',
        //         remaining: '0.0',
        //         side: 'bid',
        //         symbol: 'BTCUSDT',
        //         type: 'change'
        //       },
        //       {
        //         price: '50947.75',
        //         reason: 'top-of-book',
        //         remaining: '0.11725',
        //         side: 'bid',
        //         symbol: 'BTCUSDT',
        //         type: 'change'
        //       }
        //     ],
        //     socket_sequence: 322,
        //     timestamp: 1708674495,
        //     timestampms: 1708674495174,
        //     type: 'update'
        // }
        //
        const marketId = rawBidAskChanges[0]['symbol'];
        const market = this.safeMarket(marketId.toLowerCase());
        const symbol = market['symbol'];
        if (!(symbol in this.bidsasks)) {
            this.bidsasks[symbol] = this.parseTicker({});
            this.bidsasks[symbol]['symbol'] = symbol;
        }
        const currentBidAsk = this.bidsasks[symbol];
        const messageHash = 'bidsasks:' + symbol;
        // last update always overwrites the previous state and is the latest state
        for (let i = 0; i < rawBidAskChanges.length; i++) {
            const entry = rawBidAskChanges[i];
            const rawSide = this.safeString(entry, 'side');
            const price = this.safeNumber(entry, 'price');
            const sizeString = this.safeString(entry, 'remaining');
            if (Precise.stringEq(sizeString, '0')) {
                continue;
            }
            const size = this.parseNumber(sizeString);
            if (rawSide === 'bid') {
                currentBidAsk['bid'] = price;
                currentBidAsk['bidVolume'] = size;
            }
            else {
                currentBidAsk['ask'] = price;
                currentBidAsk['askVolume'] = size;
            }
        }
        currentBidAsk['timestamp'] = timestamp;
        currentBidAsk['datetime'] = this.iso8601(timestamp);
        currentBidAsk['info'] = rawBidAskChanges;
        this.bidsasks[symbol] = currentBidAsk;
        client.resolve(currentBidAsk, messageHash);
    }
    async helperForWatchMultipleConstruct(itemHashName, symbols, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols, undefined, false, true, true);
        const firstMarket = this.market(symbols[0]);
        if (!firstMarket['spot'] && !firstMarket['linear']) {
            throw new NotSupported(this.id + ' watchMultiple supports only spot or linear-swap symbols');
        }
        const messageHashes = [];
        const marketIds = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const messageHash = itemHashName + ':' + symbol;
            messageHashes.push(messageHash);
            const market = this.market(symbol);
            marketIds.push(market['id']);
        }
        const queryStr = marketIds.join(',');
        let url = this.urls['api']['ws'] + '/v1/multimarketdata?symbols=' + queryStr + '&heartbeat=true&';
        if (itemHashName === 'orderbook') {
            url += 'trades=false&bids=true&offers=true';
        }
        else if (itemHashName === 'bidsasks') {
            url += 'trades=false&bids=true&offers=true&top_of_book=true';
        }
        else if (itemHashName === 'trades') {
            url += 'trades=true&bids=false&offers=false';
        }
        return await this.watchMultiple(url, messageHashes, undefined);
    }
    handleOrderBookForMultidata(client, rawOrderBookChanges, timestamp, nonce) {
        //
        // rawOrderBookChanges
        //
        // [
        //   {
        //     delta: "4105123935484.817624",
        //     price: "0.000000001",
        //     reason: "initial", // initial|cancel|place
        //     remaining: "4105123935484.817624",
        //     side: "bid", // bid|ask
        //     symbol: "SHIBUSD",
        //     type: "change", // seems always change
        //   },
        //   ...
        //
        const marketId = rawOrderBookChanges[0]['symbol'];
        const market = this.safeMarket(marketId.toLowerCase());
        const symbol = market['symbol'];
        const messageHash = 'orderbook:' + symbol;
        if (!(symbol in this.orderbooks)) {
            const ob = this.orderBook();
            this.orderbooks[symbol] = ob;
        }
        const orderbook = this.orderbooks[symbol];
        const bids = orderbook['bids'];
        const asks = orderbook['asks'];
        for (let i = 0; i < rawOrderBookChanges.length; i++) {
            const entry = rawOrderBookChanges[i];
            const price = this.safeNumber(entry, 'price');
            const size = this.safeNumber(entry, 'remaining');
            const rawSide = this.safeString(entry, 'side');
            if (rawSide === 'bid') {
                bids.store(price, size);
            }
            else {
                asks.store(price, size);
            }
        }
        orderbook['bids'] = bids;
        orderbook['asks'] = asks;
        orderbook['symbol'] = symbol;
        orderbook['nonce'] = nonce;
        orderbook['timestamp'] = timestamp;
        orderbook['datetime'] = this.iso8601(timestamp);
        this.orderbooks[symbol] = orderbook;
        client.resolve(orderbook, messageHash);
    }
    handleL2Updates(client, message) {
        //
        //     {
        //         "type": "l2_updates",
        //         "symbol": "BTCUSD",
        //         "changes": [
        //             [ "buy", '22252.37', "0.02" ],
        //             [ "buy", '22251.61', "0.04" ],
        //             [ "buy", '22251.60', "0.04" ],
        //             // some asks as well
        //         ],
        //         "trades": [
        //             { type: 'trade', symbol: 'BTCUSD', event_id: 122258166738, timestamp: 1655330221424, price: '22269.14', quantity: "0.00004473", side: "buy" },
        //             { type: 'trade', symbol: 'BTCUSD', event_id: 122258141090, timestamp: 1655330213216, price: '22250.00', quantity: "0.00704098", side: "buy" },
        //             { type: 'trade', symbol: 'BTCUSD', event_id: 122258118291, timestamp: 1655330206753, price: '22250.00', quantity: "0.03", side: "buy" },
        //         ],
        //         "auction_events": [
        //             {
        //                 "type": "auction_result",
        //                 "symbol": "BTCUSD",
        //                 "time_ms": 1655323200000,
        //                 "result": "failure",
        //                 "highest_bid_price": "21590.88",
        //                 "lowest_ask_price": "21602.30",
        //                 "collar_price": "21634.73"
        //             },
        //             {
        //                 "type": "auction_indicative",
        //                 "symbol": "BTCUSD",
        //                 "time_ms": 1655323185000,
        //                 "result": "failure",
        //                 "highest_bid_price": "21661.90",
        //                 "lowest_ask_price": "21663.79",
        //                 "collar_price": "21662.845"
        //             },
        //         ]
        //     }
        //
        this.handleOrderBook(client, message);
        this.handleTrades(client, message);
    }
    /**
     * @method
     * @name gemini#fetchOrders
     * @description watches information on multiple orders made by the user
     * @see https://docs.gemini.com/websocket-api/#order-events
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async watchOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const url = this.urls['api']['ws'] + '/v1/order/events?eventTypeFilter=initial&eventTypeFilter=accepted&eventTypeFilter=rejected&eventTypeFilter=fill&eventTypeFilter=cancelled&eventTypeFilter=booked';
        await this.loadMarkets();
        const authParams = {
            'url': url,
        };
        await this.authenticate(authParams);
        if (symbol !== undefined) {
            const market = this.market(symbol);
            symbol = market['symbol'];
        }
        const messageHash = 'orders';
        const orders = await this.watch(url, messageHash, undefined, messageHash);
        if (this.newUpdates) {
            limit = orders.getLimit(symbol, limit);
        }
        return this.filterBySymbolSinceLimit(orders, symbol, since, limit, true);
    }
    handleHeartbeat(client, message) {
        //
        //     {
        //         "type": "heartbeat",
        //         "timestampms": 1659740268958,
        //         "sequence": 7,
        //         "trace_id": "25b3d92476dd3a9a5c03c9bd9e0a0dba",
        //         "socket_sequence": 7
        //     }
        //
        client.lastPong = this.milliseconds();
        return message;
    }
    handleSubscription(client, message) {
        //
        //     {
        //         "type": "subscription_ack",
        //         "accountId": 19433282,
        //         "subscriptionId": "orderevents-websocket-25b3d92476dd3a9a5c03c9bd9e0a0dba",
        //         "symbolFilter": [],
        //         "apiSessionFilter": [],
        //         "eventTypeFilter": []
        //     }
        //
        return message;
    }
    handleOrder(client, message) {
        //
        //     [
        //         {
        //             "type": "accepted",
        //             "order_id": "134150423884",
        //             "event_id": "134150423886",
        //             "account_name": "primary",
        //             "client_order_id": "1659739406916",
        //             "api_session": "account-pnBFSS0XKGvDamX4uEIt",
        //             "symbol": "batbtc",
        //             "side": "sell",
        //             "order_type": "exchange limit",
        //             "timestamp": "1659739407",
        //             "timestampms": 1659739407576,
        //             "is_live": true,
        //             "is_cancelled": false,
        //             "is_hidden": false,
        //             "original_amount": "1",
        //             "price": "1",
        //             "socket_sequence": 139
        //         }
        //     ]
        //
        const messageHash = 'orders';
        if (this.orders === undefined) {
            const limit = this.safeInteger(this.options, 'ordersLimit', 1000);
            this.orders = new ArrayCacheBySymbolById(limit);
        }
        const orders = this.orders;
        for (let i = 0; i < message.length; i++) {
            const order = this.parseWsOrder(message[i]);
            orders.append(order);
        }
        client.resolve(this.orders, messageHash);
    }
    parseWsOrder(order, market = undefined) {
        //
        //     {
        //         "type": "accepted",
        //         "order_id": "134150423884",
        //         "event_id": "134150423886",
        //         "account_name": "primary",
        //         "client_order_id": "1659739406916",
        //         "api_session": "account-pnBFSS0XKGvDamX4uEIt",
        //         "symbol": "batbtc",
        //         "side": "sell",
        //         "order_type": "exchange limit",
        //         "timestamp": "1659739407",
        //         "timestampms": 1659739407576,
        //         "is_live": true,
        //         "is_cancelled": false,
        //         "is_hidden": false,
        //         "original_amount": "1",
        //         "price": "1",
        //         "socket_sequence": 139
        //     }
        //
        const timestamp = this.safeInteger(order, 'timestampms');
        const status = this.safeString(order, 'type');
        const marketId = this.safeString(order, 'symbol');
        const typeId = this.safeString(order, 'order_type');
        const behavior = this.safeString(order, 'behavior');
        let timeInForce = 'GTC';
        let postOnly = false;
        if (behavior === 'immediate-or-cancel') {
            timeInForce = 'IOC';
        }
        else if (behavior === 'fill-or-kill') {
            timeInForce = 'FOK';
        }
        else if (behavior === 'maker-or-cancel') {
            timeInForce = 'PO';
            postOnly = true;
        }
        return this.safeOrder({
            'id': this.safeString(order, 'order_id'),
            'clientOrderId': this.safeString(order, 'client_order_id'),
            'info': order,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'lastTradeTimestamp': undefined,
            'status': this.parseWsOrderStatus(status),
            'symbol': this.safeSymbol(marketId, market),
            'type': this.parseWsOrderType(typeId),
            'timeInForce': timeInForce,
            'postOnly': postOnly,
            'side': this.safeString(order, 'side'),
            'price': this.safeNumber(order, 'price'),
            'stopPrice': undefined,
            'average': this.safeNumber(order, 'avg_execution_price'),
            'cost': undefined,
            'amount': this.safeNumber(order, 'original_amount'),
            'filled': this.safeNumber(order, 'executed_amount'),
            'remaining': this.safeNumber(order, 'remaining_amount'),
            'fee': undefined,
            'trades': undefined,
        }, market);
    }
    parseWsOrderStatus(status) {
        const statuses = {
            'accepted': 'open',
            'booked': 'open',
            'fill': 'closed',
            'cancelled': 'canceled',
            'cancel_rejected': 'rejected',
            'rejected': 'rejected',
        };
        return this.safeString(statuses, status, status);
    }
    parseWsOrderType(type) {
        const types = {
            'exchange limit': 'limit',
            'market buy': 'market',
            'market sell': 'market',
        };
        return this.safeString(types, type, type);
    }
    handleError(client, message) {
        //
        //     {
        //         "reason": "NoValidTradingPairs",
        //         "result": "error"
        //     }
        //
        throw new ExchangeError(this.json(message));
    }
    handleMessage(client, message) {
        //
        //  public
        //     {
        //         "type": "trade",
        //         "symbol": "BTCUSD",
        //         "event_id": 122278173770,
        //         "timestamp": 1655335880981,
        //         "price": "22530.80",
        //         "quantity": "0.04",
        //         "side": "buy"
        //     }
        //
        //  private
        //     [
        //         {
        //             "type": "accepted",
        //             "order_id": "134150423884",
        //             "event_id": "134150423886",
        //             "account_name": "primary",
        //             "client_order_id": "1659739406916",
        //             "api_session": "account-pnBFSS0XKGvDamX4uEIt",
        //             "symbol": "batbtc",
        //             "side": "sell",
        //             "order_type": "exchange limit",
        //             "timestamp": "1659739407",
        //             "timestampms": 1659739407576,
        //             "is_live": true,
        //             "is_cancelled": false,
        //             "is_hidden": false,
        //             "original_amount": "1",
        //             "price": "1",
        //             "socket_sequence": 139
        //         }
        //     ]
        //
        const isArray = Array.isArray(message);
        if (isArray) {
            this.handleOrder(client, message);
            return;
        }
        const reason = this.safeString(message, 'reason');
        if (reason === 'error') {
            this.handleError(client, message);
        }
        const methods = {
            'l2_updates': this.handleL2Updates,
            'trade': this.handleTrade,
            'subscription_ack': this.handleSubscription,
            'heartbeat': this.handleHeartbeat,
        };
        const type = this.safeString(message, 'type', '');
        if (type.indexOf('candles') >= 0) {
            this.handleOHLCV(client, message);
            return;
        }
        const method = this.safeValue(methods, type);
        if (method !== undefined) {
            method.call(this, client, message);
        }
        // handle multimarketdata
        if (type === 'update') {
            const ts = this.safeInteger(message, 'timestampms', this.milliseconds());
            const eventId = this.safeInteger(message, 'eventId');
            const events = this.safeList(message, 'events');
            const orderBookItems = [];
            const bidaskItems = [];
            const collectedEventsOfTrades = [];
            const eventsLength = events.length;
            for (let i = 0; i < events.length; i++) {
                const event = events[i];
                const eventType = this.safeString(event, 'type');
                const isOrderBook = (eventType === 'change') && ('side' in event) && this.inArray(event['side'], ['ask', 'bid']);
                const eventReason = this.safeString(event, 'reason');
                const isBidAsk = (eventReason === 'top-of-book') || (isOrderBook && (eventReason === 'initial') && eventsLength === 2);
                if (isBidAsk) {
                    bidaskItems.push(event);
                }
                else if (isOrderBook) {
                    orderBookItems.push(event);
                }
                else if (eventType === 'trade') {
                    collectedEventsOfTrades.push(events[i]);
                }
            }
            const lengthBa = bidaskItems.length;
            if (lengthBa > 0) {
                this.handleBidsAsksForMultidata(client, bidaskItems, ts, eventId);
            }
            const lengthOb = orderBookItems.length;
            if (lengthOb > 0) {
                this.handleOrderBookForMultidata(client, orderBookItems, ts, eventId);
            }
            const lengthTrades = collectedEventsOfTrades.length;
            if (lengthTrades > 0) {
                this.handleTradesForMultidata(client, collectedEventsOfTrades, ts);
            }
        }
    }
    async authenticate(params = {}) {
        const url = this.safeString(params, 'url');
        if ((this.clients !== undefined) && (url in this.clients)) {
            return;
        }
        this.checkRequiredCredentials();
        const startIndex = this.urls['api']['ws'].length;
        const urlParamsIndex = url.indexOf('?');
        const urlLength = url.length;
        const endIndex = (urlParamsIndex >= 0) ? urlParamsIndex : urlLength;
        const request = url.slice(startIndex, endIndex);
        const payload = {
            'request': request,
            'nonce': this.nonce(),
        };
        const b64 = this.stringToBase64(this.json(payload));
        const signature = this.hmac(this.encode(b64), this.encode(this.secret), sha384, 'hex');
        const defaultOptions = {
            'ws': {
                'options': {
                    'headers': {},
                },
            },
        };
        // this.options = this.extend (defaultOptions, this.options);
        this.extendExchangeOptions(defaultOptions);
        const originalHeaders = this.options['ws']['options']['headers'];
        const headers = {
            'X-GEMINI-APIKEY': this.apiKey,
            'X-GEMINI-PAYLOAD': b64,
            'X-GEMINI-SIGNATURE': signature,
        };
        this.options['ws']['options']['headers'] = headers;
        this.client(url);
        this.options['ws']['options']['headers'] = originalHeaders;
    }
}
