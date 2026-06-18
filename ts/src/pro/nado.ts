//  ---------------------------------------------------------------------------

import nadoRest from '../nado.js';
import { ArgumentsRequired, BadResponse } from '../base/errors.js';
import { ArrayCache } from '../base/ws/Cache.js';
import type { Bool, Dict, Int, OrderBook, Strings, Ticker, Tickers, Trade } from '../base/types.js';
import Client from '../base/ws/Client.js';

//  ---------------------------------------------------------------------------

export default class nado extends nadoRest {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchBalance': false,
                'watchBidsAsks': true,
                'watchFundingRate': false,
                'watchFundingRates': false,
                'watchLiquidations': false,
                'watchLiquidationsForSymbols': false,
                'watchMyTrades': false,
                'watchOHLCV': false,
                'watchOHLCVForSymbols': false,
                'watchOrderBook': true,
                'watchOrderBookForSymbols': true,
                'watchOrders': false,
                'watchPositions': false,
                'watchTicker': true,
                'watchTickers': true,
                'watchTrades': true,
                'watchTradesForSymbols': true,
            },
            'streaming': {
                'ping': this.ping,
                'keepAlive': 30000,
            },
            'options': {
                'tradesLimit': 1000,
            },
            'urls': {
                'api': {
                    'ws': {
                        'gateway': 'wss://gateway.prod.nado.xyz/v1/ws',
                        'subscriptions': 'wss://gateway.prod.nado.xyz/v1/subscribe',
                    },
                },
                'test': {
                    'ws': {
                        'gateway': 'wss://gateway.test.nado.xyz/v1/ws',
                        'subscriptions': 'wss://gateway.test.nado.xyz/v1/subscribe',
                    },
                },
            },
        });
    }

    /**
     * @method
     * @name nado#watchTrades
     * @see https://docs.nado.xyz/developer-resources/api/subscriptions/streams
     * @description watches information on multiple trades made in a market
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum number of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const messageHash = 'trade:' + market['symbol'];
        const trades = await this.watchPublic ('trade', market, messageHash, params);
        if (this.newUpdates) {
            limit = trades.getLimit (market['symbol'], limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    /**
     * @method
     * @name nado#watchTradesForSymbols
     * @see https://docs.nado.xyz/developer-resources/api/subscriptions/streams
     * @description get the list of most recent trades for a list of symbols
     * @param {string[]} symbols unified symbols of the markets to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum number of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async watchTradesForSymbols (symbols: string[], since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const symbolsLength = symbols.length;
        if (symbolsLength === 0) {
            throw new ArgumentsRequired (this.id + ' watchTradesForSymbols() requires a non-empty array of symbols');
        }
        symbols = this.marketSymbols (symbols, undefined, false, true, true);
        const promises = [];
        for (let i = 0; i < symbols.length; i++) {
            const market = this.market (symbols[i]);
            const messageHash = 'trade:' + market['symbol'];
            promises.push (this.watchPublic ('trade', market, messageHash, params));
        }
        const trades = await Promise.race (promises);
        if (this.newUpdates) {
            const first = this.safeValue (trades, 0);
            const tradeSymbol = this.safeString (first, 'symbol');
            limit = trades.getLimit (tradeSymbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    /**
     * @method
     * @name nado#watchOrderBook
     * @see https://docs.nado.xyz/developer-resources/api/subscriptions/streams
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {OrderBook} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async watchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const messageHash = 'orderbook:' + market['symbol'];
        if (!(market['symbol'] in this.orderbooks)) {
            const snapshot = await this.fetchOrderBook (symbol, limit);
            this.orderbooks[market['symbol']] = this.orderBook (snapshot, limit);
        }
        const orderbook = await this.watchPublic ('book_depth', market, messageHash, params);
        return orderbook.limit ();
    }

    /**
     * @method
     * @name nado#watchOrderBookForSymbols
     * @see https://docs.nado.xyz/developer-resources/api/subscriptions/streams
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data for a list of symbols
     * @param {string[]} symbols unified symbols of the markets to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {OrderBook} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async watchOrderBookForSymbols (symbols: string[], limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const symbolsLength = symbols.length;
        if (symbolsLength === 0) {
            throw new ArgumentsRequired (this.id + ' watchOrderBookForSymbols() requires a non-empty array of symbols');
        }
        symbols = this.marketSymbols (symbols, undefined, false, true, true);
        const promises = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const market = this.market (symbol);
            const messageHash = 'orderbook:' + market['symbol'];
            if (!(market['symbol'] in this.orderbooks)) {
                const snapshot = await this.fetchOrderBook (symbol, limit);
                this.orderbooks[market['symbol']] = this.orderBook (snapshot, limit);
            }
            promises.push (this.watchPublic ('book_depth', market, messageHash, params));
        }
        const orderbook = await Promise.race (promises);
        return orderbook.limit ();
    }

    /**
     * @method
     * @name nado#watchTicker
     * @see https://docs.nado.xyz/developer-resources/api/subscriptions/streams
     * @description watches a price ticker with the best bid and ask for a specific market
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchTicker (symbol: string, params = {}): Promise<Ticker> {
        await this.loadMarkets ();
        symbol = this.symbol (symbol);
        const tickers = await this.watchTickers ([ symbol ], params);
        return tickers[symbol];
    }

    /**
     * @method
     * @name nado#watchTickers
     * @see https://docs.nado.xyz/developer-resources/api/subscriptions/streams
     * @description watches price tickers with the best bid and ask for all markets of a specific list
     * @param {string[]} [symbols] unified symbols of the markets to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols, undefined, true, true, true);
        let market = undefined;
        let messageHash = 'ticker';
        let streamType = 'all_bbo';
        if (symbols !== undefined) {
            const symbolsLength = symbols.length;
            if (symbolsLength === 1) {
                market = this.market (symbols[0]);
                messageHash = 'ticker:' + market['symbol'];
                streamType = 'best_bid_offer';
            }
        }
        const ticker = await this.watchPublic (streamType, market, messageHash, params);
        if (this.newUpdates) {
            if (messageHash === 'ticker') {
                return this.filterByArray (ticker, 'symbol', symbols);
            }
            const tickers: Dict = {};
            tickers[ticker['symbol']] = ticker;
            return tickers;
        }
        return this.filterByArray (this.tickers, 'symbol', symbols);
    }

    /**
     * @method
     * @name nado#watchBidsAsks
     * @see https://docs.nado.xyz/developer-resources/api/subscriptions/streams
     * @description watches best bid & ask for symbols
     * @param {string[]} symbols unified symbols of the markets to fetch the bids and asks for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchBidsAsks (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols, undefined, true, true, true);
        let market = undefined;
        let messageHash = 'bidask';
        let streamType = 'all_bbo';
        if (symbols !== undefined) {
            const symbolsLength = symbols.length;
            if (symbolsLength === 1) {
                market = this.market (symbols[0]);
                messageHash = 'bidask:' + market['symbol'];
                streamType = 'best_bid_offer';
            }
        }
        const ticker = await this.watchPublic (streamType, market, messageHash, params);
        if (this.newUpdates) {
            if (messageHash === 'bidask') {
                return this.filterByArray (ticker, 'symbol', symbols);
            }
            const tickers: Dict = {};
            tickers[ticker['symbol']] = ticker;
            return tickers;
        }
        return this.filterByArray (this.bidsasks, 'symbol', symbols);
    }

    async watchPublic (streamType, market, messageHash: string, params = {}) {
        const url = this.urls['api']['ws']['subscriptions'];
        const stream: Dict = {
            'type': streamType,
        };
        if (market !== undefined) {
            stream['product_id'] = this.parseToInt (market['id']);
        }
        const request: Dict = {
            'method': 'subscribe',
            'stream': stream,
            'id': this.nonce (),
        };
        const subscription = {
            'streamType': streamType,
            'symbol': this.safeString (market, 'symbol'),
        };
        return await this.watch (url, messageHash, this.deepExtend (request, params), messageHash, subscription);
    }

    parseWsTimestamp (message: Dict, key: string): Int {
        const value = this.safeString (message, key);
        if (value === undefined) {
            return undefined;
        }
        const length = value.length;
        if (length > 13) {
            return this.parseToInt (value.slice (0, length - 6));
        }
        return this.safeInteger (message, key);
    }

    parseWsTrade (trade: Dict, market = undefined): Trade {
        //
        //     {
        //         "type": "trade",
        //         "timestamp": "1676151190656903000",
        //         "product_id": 1,
        //         "price": "25000000000000000000000",
        //         "taker_qty": "1000000000000000000",
        //         "maker_qty": "1000000000000000000",
        //         "is_taker_buyer": true
        //     }
        //
        const marketId = this.safeString (trade, 'product_id');
        market = this.safeMarket (marketId, market);
        const timestamp = this.parseWsTimestamp (trade, 'timestamp');
        const isTakerBuyer = this.safeBool (trade, 'is_taker_buyer');
        let side = undefined;
        if (isTakerBuyer !== undefined) {
            side = isTakerBuyer ? 'buy' : 'sell';
        }
        return this.safeTrade ({
            'info': trade,
            'id': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'order': undefined,
            'type': undefined,
            'side': side,
            'takerOrMaker': 'taker',
            'price': this.parseX18 (this.safeString (trade, 'price')),
            'amount': this.parseX18 (this.safeString (trade, 'taker_qty')),
            'cost': undefined,
            'fee': undefined,
        }, market);
    }

    handleTrade (client: Client, message) {
        const marketId = this.safeString (message, 'product_id');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const messageHash = 'trade:' + symbol;
        let trades = this.safeValue (this.trades, symbol);
        if (trades === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            trades = new ArrayCache (limit);
            this.trades[symbol] = trades;
        }
        const trade = this.parseWsTrade (message, market);
        trades.append (trade);
        client.resolve (trades, messageHash);
    }

    parseWsBidAsk (bidask: Dict, market = undefined): Ticker {
        //
        //     {
        //         "type": "best_bid_offer",
        //         "timestamp": "1676151190656903000",
        //         "product_id": 1,
        //         "bid_price": "24990000000000000000000",
        //         "bid_qty": "5000000000000000000",
        //         "ask_price": "25010000000000000000000",
        //         "ask_qty": "3000000000000000000"
        //     }
        //
        const marketId = this.safeString (bidask, 'product_id');
        market = this.safeMarket (marketId, market);
        const timestamp = this.parseWsTimestamp (bidask, 'timestamp');
        return this.safeTicker ({
            'symbol': market['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'ask': this.parseX18 (this.safeString (bidask, 'ask_price')),
            'askVolume': this.parseX18 (this.safeString (bidask, 'ask_qty')),
            'bid': this.parseX18 (this.safeString (bidask, 'bid_price')),
            'bidVolume': this.parseX18 (this.safeString (bidask, 'bid_qty')),
            'info': bidask,
        }, market);
    }

    handleBidAsk (client: Client, message) {
        const ticker = this.parseWsBidAsk (message);
        const symbol = ticker['symbol'];
        this.bidsasks[symbol] = ticker;
        this.tickers[symbol] = ticker;
        const tickers: Dict = {};
        tickers[symbol] = ticker;
        client.resolve (ticker, 'bidask:' + symbol);
        client.resolve (ticker, 'ticker:' + symbol);
        client.resolve (tickers, 'bidask');
        client.resolve (tickers, 'ticker');
    }

    parseWsAllBidsAsks (message: Dict): Tickers {
        //
        //     {
        //         "type": "all_bbo",
        //         "time": "1781750134714",
        //         "bbos": {
        //             "2": { "bid": "64924000000000000000000", "ask": "64935000000000000000000" }
        //         }
        //     }
        //
        const timestamp = this.safeInteger (message, 'time');
        const bbos = this.safeDict (message, 'bbos', {});
        const marketIds = Object.keys (bbos);
        const result: Dict = {};
        for (let i = 0; i < marketIds.length; i++) {
            const marketId = marketIds[i];
            const market = this.safeMarket (marketId);
            const bbo = this.safeDict (bbos, marketId, {});
            const ticker = this.safeTicker ({
                'symbol': market['symbol'],
                'timestamp': timestamp,
                'datetime': this.iso8601 (timestamp),
                'ask': this.parseX18 (this.safeString (bbo, 'ask')),
                'bid': this.parseX18 (this.safeString (bbo, 'bid')),
                'info': bbo,
            }, market);
            const symbol = market['symbol'];
            result[symbol] = ticker;
        }
        return result;
    }

    handleAllBidsAsks (client: Client, message) {
        const tickers = this.parseWsAllBidsAsks (message);
        const symbols = Object.keys (tickers);
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const ticker = tickers[symbol];
            this.bidsasks[symbol] = ticker;
            this.tickers[symbol] = ticker;
            client.resolve (ticker, 'bidask:' + symbol);
            client.resolve (ticker, 'ticker:' + symbol);
        }
        client.resolve (tickers, 'bidask');
        client.resolve (tickers, 'ticker');
    }

    parseWsOrderBookDeltas (deltas) {
        const result = [];
        for (let i = 0; i < deltas.length; i++) {
            const delta = deltas[i];
            result.push ([
                this.parseX18 (this.safeString (delta, 0)),
                this.parseX18 (this.safeString (delta, 1)),
            ]);
        }
        return result;
    }

    handleDelta (bookside, delta) {
        const bidAsk = this.parseBidAsk (delta, 0, 1);
        bookside.storeArray (bidAsk);
    }

    handleOrderBook (client: Client, message) {
        //
        //     {
        //         "type": "book_depth",
        //         "min_timestamp": "1683805381879572835",
        //         "max_timestamp": "1683805381879572835",
        //         "last_max_timestamp": "1683805381771464799",
        //         "product_id": 1,
        //         "bids": [["21594490000000000000000", "51007390115411548"]],
        //         "asks": [["21694490000000000000000", "0"]]
        //     }
        //
        const marketId = this.safeString (message, 'product_id');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        if (!(symbol in this.orderbooks)) {
            this.orderbooks[symbol] = this.orderBook ();
        }
        const orderbook = this.orderbooks[symbol];
        const asks = this.parseWsOrderBookDeltas (this.safeList (message, 'asks', []));
        const bids = this.parseWsOrderBookDeltas (this.safeList (message, 'bids', []));
        this.handleDeltas (orderbook['asks'], asks);
        this.handleDeltas (orderbook['bids'], bids);
        const timestamp = this.parseWsTimestamp (message, 'max_timestamp');
        orderbook['symbol'] = symbol;
        orderbook['timestamp'] = timestamp;
        orderbook['datetime'] = this.iso8601 (timestamp);
        orderbook['maxTimestamp'] = this.safeString (message, 'max_timestamp');
        const messageHash = 'orderbook:' + symbol;
        client.resolve (orderbook, messageHash);
    }

    ping (client: Client) {
        return {
            'method': 'ping',
            'id': this.nonce (),
            'client_time': this.numberToString (this.milliseconds ()),
        };
    }

    handlePong (client: Client, message) {
        //
        //     {
        //         "result": {
        //             "method": "pong",
        //             "server_time": "1780000000123",
        //             "client_time": "1780000000000"
        //         },
        //         "id": 10
        //     }
        //
        const result = this.safeDict (message, 'result', {});
        client.lastPong = this.safeInteger (result, 'server_time', this.milliseconds ());
        return message;
    }

    handleErrorMessage (client: Client, message): Bool {
        const error = this.safeValue (message, 'error');
        const status = this.safeString (message, 'status');
        if ((error === undefined) && (status !== 'failure')) {
            return false;
        }
        const feedback = this.id + ' ' + this.json (message);
        const exception = new BadResponse (feedback);
        const id = this.safeString (message, 'id');
        if ((id !== undefined) && (id in client.futures)) {
            client.reject (exception, id);
        } else {
            client.reject (exception);
        }
        return true;
    }

    handleMessage (client: Client, message) {
        if (this.handleErrorMessage (client, message)) {
            return;
        }
        const result = this.safeDict (message, 'result');
        const method = this.safeString (result, 'method');
        if (method === 'pong') {
            this.handlePong (client, message);
            return;
        }
        const type = this.safeString (message, 'type');
        const methods = {
            'trade': this.handleTrade,
            'all_bbo': this.handleAllBidsAsks,
            'best_bid_offer': this.handleBidAsk,
            'book_depth': this.handleOrderBook,
        };
        const handler = this.safeValue (methods, type);
        if (handler !== undefined) {
            handler.call (this, client, message);
        }
    }
}
