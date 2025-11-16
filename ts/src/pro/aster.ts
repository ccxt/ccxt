//  ---------------------------------------------------------------------------

import asterRest from '../aster.js';
import { ArrayCache, ArrayCacheByTimestamp, ArrayCacheBySymbolById } from '../base/ws/Cache.js';
import type { Int, OHLCV, Str, Strings, OrderBook, Order, Trade, Ticker, Tickers, Position, Balances, Dict } from '../base/types.js';
import Client from '../base/ws/Client.js';

//  ---------------------------------------------------------------------------

export default class aster extends asterRest {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchBalance': true,
                'watchMyTrades': true,
                'watchOHLCV': true,
                'watchOrderBook': true,
                'watchOrders': true,
                'watchPositions': true,
                'watchTicker': true,
                'watchTickers': true,
                'watchTrades': true,
                'watchTradesForSymbols': true,
            },
            'urls': {
                'api': {
                    'ws': 'wss://fstream.asterdex.com/ws',
                },
            },
            'options': {
                'tradesLimit': 1000,
                'ordersLimit': 1000,
                'OHLCVLimit': 1000,
                'watchOrderBookRate': 100,
                'watchOrderBookLimit': 1000,
                'listenKeyRefreshRate': 1200000,
                'ws': {
                    'cost': 1,
                },
            },
            'streaming': {
                'keepAlive': 30000,
                'ping': this.ping,
            },
        });
    }

    async watchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        /**
         * @method
         * @name aster#watchOrderBook
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int} [limit] the maximum amount of order book entries to return
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const url = this.urls['api']['ws'];
        const marketId = market['id'];
        const messageHash = 'orderbook:' + symbol;
        const request: Dict = {
            'method': 'SUBSCRIBE',
            'params': [
                marketId.toLowerCase () + '@depth@100ms',
            ],
            'id': this.requestId (),
        };
        const message = this.extend (request, params);
        const orderbook = await this.watch (url, messageHash, message, messageHash);
        return orderbook.limit ();
    }

    handleOrderBook (client: Client, message) {
        //
        //     {
        //         "e": "depthUpdate",
        //         "E": 1638747328000,
        //         "s": "BTCUSDT",
        //         "U": 12345678,
        //         "u": 12345679,
        //         "b": [
        //             ["50000.00", "1.5"]
        //         ],
        //         "a": [
        //             ["50100.00", "0.5"]
        //         ]
        //     }
        //
        const marketId = this.safeString (message, 's');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const timestamp = this.safeInteger (message, 'E');
        const bids = this.safeList (message, 'b', []);
        const asks = this.safeList (message, 'a', []);
        const snapshot = this.parseOrderBook ({
            'bids': bids,
            'asks': asks,
        }, symbol, timestamp);
        if (!(symbol in this.orderbooks)) {
            const ob = this.orderBook (snapshot);
            this.orderbooks[symbol] = ob;
        }
        const orderbook = this.orderbooks[symbol];
        orderbook.reset (snapshot);
        const messageHash = 'orderbook:' + symbol;
        client.resolve (orderbook, messageHash);
    }

    async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        /**
         * @method
         * @name aster#watchTrades
         * @description watches information on multiple trades made in a market
         * @param {string} symbol unified market symbol of the market trades were made in
         * @param {int} [since] the earliest time in ms to fetch trades for
         * @param {int} [limit] the maximum number of trade structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const url = this.urls['api']['ws'];
        const marketId = market['id'];
        const messageHash = 'trades:' + symbol;
        const request: Dict = {
            'method': 'SUBSCRIBE',
            'params': [
                marketId.toLowerCase () + '@aggTrade',
            ],
            'id': this.requestId (),
        };
        const message = this.extend (request, params);
        const trades = await this.watch (url, messageHash, message, messageHash);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (trades, symbol, since, limit, true);
    }

    async watchTradesForSymbols (symbols: string[], since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        /**
         * @method
         * @name aster#watchTradesForSymbols
         * @description watches information on multiple trades made in multiple markets
         * @param {string[]} symbols unified market symbols of the markets trades were made in
         * @param {int} [since] the earliest time in ms to fetch trades for
         * @param {int} [limit] the maximum number of trade structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
         */
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const url = this.urls['api']['ws'];
        const messageHashes = [];
        const subscriptions = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const market = this.market (symbol);
            const marketId = market['id'];
            const messageHash = 'trades:' + symbol;
            messageHashes.push (messageHash);
            subscriptions.push (marketId.toLowerCase () + '@aggTrade');
        }
        const request: Dict = {
            'method': 'SUBSCRIBE',
            'params': subscriptions,
            'id': this.requestId (),
        };
        const message = this.extend (request, params);
        const trades = await this.watchMultiple (url, messageHashes, message, messageHashes);
        if (this.newUpdates) {
            const first = this.safeDict (trades, 0);
            const tradeSymbol = this.safeString (first, 'symbol');
            limit = trades.getLimit (tradeSymbol, limit);
        }
        return this.filterBySymbolsSinceLimit (trades, symbols, since, limit, true);
    }

    handleTrades (client: Client, message) {
        //
        //     {
        //         "e": "aggTrade",
        //         "E": 1638747328000,
        //         "s": "BTCUSDT",
        //         "a": 12345,
        //         "p": "50000.00",
        //         "q": "1.5",
        //         "f": 12344,
        //         "l": 12345,
        //         "T": 1638747327000,
        //         "m": false
        //     }
        //
        const marketId = this.safeString (message, 's');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const trade = this.parseWsTrade (message, market);
        const messageHash = 'trades:' + symbol;
        let tradesArray = this.safeValue (this.trades, symbol);
        if (tradesArray === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            tradesArray = new ArrayCache (limit);
            this.trades[symbol] = tradesArray;
        }
        tradesArray.append (trade);
        client.resolve (tradesArray, messageHash);
    }

    parseWsTrade (trade, market = undefined) {
        //
        //     {
        //         "e": "aggTrade",
        //         "E": 1638747328000,
        //         "s": "BTCUSDT",
        //         "a": 12345,
        //         "p": "50000.00",
        //         "q": "1.5",
        //         "f": 12344,
        //         "l": 12345,
        //         "T": 1638747327000,
        //         "m": false
        //     }
        //
        const id = this.safeString (trade, 'a');
        const timestamp = this.safeInteger (trade, 'T');
        const price = this.safeString (trade, 'p');
        const amount = this.safeString (trade, 'q');
        const marketId = this.safeString (trade, 's');
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        const side = this.safeValue (trade, 'm') ? 'sell' : 'buy';
        return this.safeTrade ({
            'info': trade,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': undefined,
            'side': side,
            'order': undefined,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'fee': undefined,
        }, market);
    }

    async watchTicker (symbol: string, params = {}): Promise<Ticker> {
        /**
         * @method
         * @name aster#watchTicker
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const url = this.urls['api']['ws'];
        const marketId = market['id'];
        const messageHash = 'ticker:' + symbol;
        const request: Dict = {
            'method': 'SUBSCRIBE',
            'params': [
                marketId.toLowerCase () + '@ticker',
            ],
            'id': this.requestId (),
        };
        const message = this.extend (request, params);
        return await this.watch (url, messageHash, message, messageHash);
    }

    async watchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        /**
         * @method
         * @name aster#watchTickers
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
         * @param {string[]} symbols unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const url = this.urls['api']['ws'];
        const messageHash = 'tickers';
        const request: Dict = {
            'method': 'SUBSCRIBE',
            'params': [
                '!ticker@arr',
            ],
            'id': this.requestId (),
        };
        const message = this.extend (request, params);
        const tickers = await this.watch (url, messageHash, message, messageHash);
        if (this.newUpdates) {
            return this.filterByArrayTickers (tickers, 'symbol', symbols);
        }
        return this.tickers;
    }

    handleTicker (client: Client, message) {
        //
        //     {
        //         "e": "24hrTicker",
        //         "E": 1638747328000,
        //         "s": "BTCUSDT",
        //         "p": "1000.00",
        //         "P": "2.00",
        //         "w": "49500.00",
        //         "c": "50000.00",
        //         "Q": "1.5",
        //         "o": "49000.00",
        //         "h": "51000.00",
        //         "l": "48000.00",
        //         "v": "10000.0",
        //         "q": "495000000.0",
        //         "O": 1638660928000,
        //         "C": 1638747328000,
        //         "F": 12340,
        //         "L": 12345,
        //         "n": 6
        //     }
        //
        const marketId = this.safeString (message, 's');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const ticker = this.parseWsTicker (message, market);
        this.tickers[symbol] = ticker;
        const messageHash = 'ticker:' + symbol;
        client.resolve (ticker, messageHash);
    }

    handleTickers (client: Client, message) {
        //
        //     [
        //         {
        //             "e": "24hrTicker",
        //             "E": 1638747328000,
        //             "s": "BTCUSDT",
        //             ...
        //         }
        //     ]
        //
        const tickers = this.safeList (message, 'data', []);
        const parsedTickers = {};
        for (let i = 0; i < tickers.length; i++) {
            const ticker = tickers[i];
            const marketId = this.safeString (ticker, 's');
            const market = this.safeMarket (marketId);
            const symbol = market['symbol'];
            const parsedTicker = this.parseWsTicker (ticker, market);
            this.tickers[symbol] = parsedTicker;
            parsedTickers[symbol] = parsedTicker;
        }
        const messageHash = 'tickers';
        client.resolve (this.tickers, messageHash);
    }

    parseWsTicker (ticker, market = undefined): Ticker {
        //
        //     {
        //         "e": "24hrTicker",
        //         "E": 1638747328000,
        //         "s": "BTCUSDT",
        //         "p": "1000.00",
        //         "P": "2.00",
        //         "w": "49500.00",
        //         "c": "50000.00",
        //         "Q": "1.5",
        //         "o": "49000.00",
        //         "h": "51000.00",
        //         "l": "48000.00",
        //         "v": "10000.0",
        //         "q": "495000000.0",
        //         "O": 1638660928000,
        //         "C": 1638747328000,
        //         "F": 12340,
        //         "L": 12345,
        //         "n": 6
        //     }
        //
        const timestamp = this.safeInteger (ticker, 'E');
        const marketId = this.safeString (ticker, 's');
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        const last = this.safeString (ticker, 'c');
        const open = this.safeString (ticker, 'o');
        const high = this.safeString (ticker, 'h');
        const low = this.safeString (ticker, 'l');
        const baseVolume = this.safeString (ticker, 'v');
        const quoteVolume = this.safeString (ticker, 'q');
        const change = this.safeString (ticker, 'p');
        const percentage = this.safeString (ticker, 'P');
        const vwap = this.safeString (ticker, 'w');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': high,
            'low': low,
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': vwap,
            'open': open,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': change,
            'percentage': percentage,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        }, market);
    }

    async watchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        /**
         * @method
         * @name aster#watchOHLCV
         * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
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
        const url = this.urls['api']['ws'];
        const marketId = market['id'];
        const interval = this.safeString (this.timeframes, timeframe, timeframe);
        const messageHash = 'ohlcv:' + timeframe + ':' + symbol;
        const request: Dict = {
            'method': 'SUBSCRIBE',
            'params': [
                marketId.toLowerCase () + '@kline_' + interval,
            ],
            'id': this.requestId (),
        };
        const message = this.extend (request, params);
        const ohlcv = await this.watch (url, messageHash, message, messageHash);
        if (this.newUpdates) {
            limit = ohlcv.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (ohlcv, since, limit, 0, true);
    }

    handleOHLCV (client: Client, message) {
        //
        //     {
        //         "e": "kline",
        //         "E": 1638747328000,
        //         "s": "BTCUSDT",
        //         "k": {
        //             "t": 1638747300000,
        //             "T": 1638747359999,
        //             "s": "BTCUSDT",
        //             "i": "1m",
        //             "f": 12340,
        //             "L": 12345,
        //             "o": "49000.00",
        //             "c": "50000.00",
        //             "h": "51000.00",
        //             "l": "48000.00",
        //             "v": "10000.0",
        //             "n": 6,
        //             "x": false,
        //             "q": "495000000.0",
        //             "V": "5000.0",
        //             "Q": "247500000.0"
        //         }
        //     }
        //
        const kline = this.safeDict (message, 'k', {});
        const marketId = this.safeString (kline, 's');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const interval = this.safeString (kline, 'i');
        const timeframe = this.findTimeframe (interval);
        const parsed = [
            this.safeInteger (kline, 't'),
            this.safeNumber (kline, 'o'),
            this.safeNumber (kline, 'h'),
            this.safeNumber (kline, 'l'),
            this.safeNumber (kline, 'c'),
            this.safeNumber (kline, 'v'),
        ];
        const messageHash = 'ohlcv:' + timeframe + ':' + symbol;
        this.ohlcvs[symbol] = this.safeDict (this.ohlcvs, symbol, {});
        let stored = this.safeValue (this.ohlcvs[symbol], timeframe);
        if (stored === undefined) {
            const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
            stored = new ArrayCacheByTimestamp (limit);
            this.ohlcvs[symbol][timeframe] = stored;
        }
        stored.append (parsed);
        client.resolve (stored, messageHash);
    }

    async watchBalance (params = {}): Promise<Balances> {
        /**
         * @method
         * @name aster#watchBalance
         * @description watch balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
         */
        await this.loadMarkets ();
        await this.authenticate (params);
        const url = this.urls['api']['ws'];
        const listenKey = this.safeString (this.options, 'listenKey');
        const messageHash = 'balance';
        return await this.watch (url + '/' + listenKey, messageHash, undefined, messageHash);
    }

    handleBalance (client: Client, message) {
        //
        //     {
        //         "e": "ACCOUNT_UPDATE",
        //         "E": 1638747328000,
        //         "a": {
        //             "B": [
        //                 {
        //                     "a": "USDT",
        //                     "wb": "10000.00000000",
        //                     "cw": "9500.00000000"
        //                 }
        //             ]
        //         }
        //     }
        //
        const accountData = this.safeDict (message, 'a', {});
        const balances = this.safeList (accountData, 'B', []);
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const currencyId = this.safeString (balance, 'a');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeString (balance, 'cw');
            account['total'] = this.safeString (balance, 'wb');
            this.balance[code] = account;
        }
        this.balance = this.safeBalance (this.balance);
        const messageHash = 'balance';
        client.resolve (this.balance, messageHash);
    }

    async watchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        /**
         * @method
         * @name aster#watchOrders
         * @description watches information on multiple orders made by the user
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int} [since] the earliest time in ms to fetch orders for
         * @param {int} [limit] the maximum number of order structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        await this.authenticate (params);
        const url = this.urls['api']['ws'];
        const listenKey = this.safeString (this.options, 'listenKey');
        let messageHash = 'orders';
        if (symbol !== undefined) {
            symbol = this.symbol (symbol);
            messageHash += ':' + symbol;
        }
        const orders = await this.watch (url + '/' + listenKey, messageHash, undefined, messageHash);
        if (this.newUpdates) {
            limit = orders.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (orders, symbol, since, limit, true);
    }

    handleOrder (client: Client, message) {
        //
        //     {
        //         "e": "ORDER_TRADE_UPDATE",
        //         "E": 1638747328000,
        //         "o": {
        //             "s": "BTCUSDT",
        //             "c": "client_order_id",
        //             "S": "BUY",
        //             "o": "LIMIT",
        //             "f": "GTC",
        //             "q": "1.5",
        //             "p": "50000.00",
        //             "ap": "0",
        //             "sp": "0",
        //             "x": "NEW",
        //             "X": "NEW",
        //             "i": 12345,
        //             "l": "0",
        //             "z": "0",
        //             "L": "0",
        //             "T": 1638747327000,
        //             "t": 0
        //         }
        //     }
        //
        const orderData = this.safeDict (message, 'o', {});
        const order = this.parseWsOrder (orderData);
        const symbol = order['symbol'];
        if (this.orders === undefined) {
            const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
            this.orders = new ArrayCacheBySymbolById (limit);
        }
        const orders = this.orders;
        orders.append (order);
        let messageHash = 'orders';
        client.resolve (orders, messageHash);
        messageHash += ':' + symbol;
        client.resolve (orders, messageHash);
    }

    parseWsOrder (order, market = undefined) {
        //
        //     {
        //         "s": "BTCUSDT",
        //         "c": "client_order_id",
        //         "S": "BUY",
        //         "o": "LIMIT",
        //         "f": "GTC",
        //         "q": "1.5",
        //         "p": "50000.00",
        //         "ap": "0",
        //         "sp": "0",
        //         "x": "NEW",
        //         "X": "NEW",
        //         "i": 12345,
        //         "l": "0",
        //         "z": "0",
        //         "L": "0",
        //         "T": 1638747327000,
        //         "t": 0
        //     }
        //
        const id = this.safeString (order, 'i');
        const clientOrderId = this.safeString (order, 'c');
        const marketId = this.safeString (order, 's');
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        const side = this.safeStringLower (order, 'S');
        const type = this.safeStringLower (order, 'o');
        const price = this.safeString (order, 'p');
        const amount = this.safeString (order, 'q');
        const filled = this.safeString (order, 'z');
        const average = this.safeString (order, 'ap');
        const timestamp = this.safeInteger (order, 'T');
        const rawStatus = this.safeString (order, 'X');
        const status = this.parseOrderStatus (rawStatus);
        const timeInForce = this.safeString (order, 'f');
        return this.safeOrder ({
            'info': order,
            'id': id,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'average': average,
            'filled': filled,
            'remaining': undefined,
            'status': status,
            'fee': undefined,
            'trades': undefined,
            'timeInForce': timeInForce,
            'postOnly': undefined,
            'reduceOnly': undefined,
        }, market);
    }

    async watchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        /**
         * @method
         * @name aster#watchMyTrades
         * @description watches information on multiple trades made by the user
         * @param {string} symbol unified market symbol of the market trades were made in
         * @param {int} [since] the earliest time in ms to fetch trades for
         * @param {int} [limit] the maximum number of trade structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
         */
        await this.loadMarkets ();
        await this.authenticate (params);
        const url = this.urls['api']['ws'];
        const listenKey = this.safeString (this.options, 'listenKey');
        let messageHash = 'myTrades';
        if (symbol !== undefined) {
            symbol = this.symbol (symbol);
            messageHash += ':' + symbol;
        }
        const trades = await this.watch (url + '/' + listenKey, messageHash, undefined, messageHash);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (trades, symbol, since, limit, true);
    }

    handleMyTrade (client: Client, message) {
        //
        //     {
        //         "e": "ORDER_TRADE_UPDATE",
        //         "E": 1638747328000,
        //         "o": {
        //             "s": "BTCUSDT",
        //             "c": "client_order_id",
        //             "S": "BUY",
        //             "o": "LIMIT",
        //             "f": "GTC",
        //             "q": "1.5",
        //             "p": "50000.00",
        //             "x": "TRADE",
        //             "X": "PARTIALLY_FILLED",
        //             "i": 12345,
        //             "l": "1.0",
        //             "z": "1.0",
        //             "L": "50000.00",
        //             "n": "10.00",
        //             "N": "USDT",
        //             "T": 1638747327000,
        //             "t": 67890
        //         }
        //     }
        //
        const orderData = this.safeDict (message, 'o', {});
        const executionType = this.safeString (orderData, 'x');
        if (executionType !== 'TRADE') {
            return;
        }
        const trade = this.parseWsMyTrade (orderData);
        const symbol = trade['symbol'];
        if (this.myTrades === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            this.myTrades = new ArrayCacheBySymbolById (limit);
        }
        const myTrades = this.myTrades;
        myTrades.append (trade);
        let messageHash = 'myTrades';
        client.resolve (myTrades, messageHash);
        messageHash += ':' + symbol;
        client.resolve (myTrades, messageHash);
    }

    parseWsMyTrade (trade, market = undefined) {
        //
        //     {
        //         "s": "BTCUSDT",
        //         "c": "client_order_id",
        //         "S": "BUY",
        //         "o": "LIMIT",
        //         "l": "1.0",
        //         "z": "1.0",
        //         "L": "50000.00",
        //         "n": "10.00",
        //         "N": "USDT",
        //         "T": 1638747327000,
        //         "t": 67890,
        //         "i": 12345
        //     }
        //
        const id = this.safeString (trade, 't');
        const orderId = this.safeString (trade, 'i');
        const marketId = this.safeString (trade, 's');
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        const side = this.safeStringLower (trade, 'S');
        const type = this.safeStringLower (trade, 'o');
        const price = this.safeString (trade, 'L');
        const amount = this.safeString (trade, 'l');
        const timestamp = this.safeInteger (trade, 'T');
        const feeCost = this.safeString (trade, 'n');
        const feeCurrency = this.safeCurrencyCode (this.safeString (trade, 'N'));
        let fee = undefined;
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'currency': feeCurrency,
            };
        }
        return this.safeTrade ({
            'info': trade,
            'id': id,
            'order': orderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': type,
            'side': side,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'fee': fee,
        }, market);
    }

    async watchPositions (symbols: Strings = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Position[]> {
        /**
         * @method
         * @name aster#watchPositions
         * @description watch all open positions
         * @param {string[]} [symbols] list of unified market symbols
         * @param {int} [since] the earliest time in ms to fetch positions for
         * @param {int} [limit] the maximum number of positions to retrieve
         * @param {object} params extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/en/latest/manual.html#position-structure}
         */
        await this.loadMarkets ();
        await this.authenticate (params);
        const url = this.urls['api']['ws'];
        const listenKey = this.safeString (this.options, 'listenKey');
        const messageHash = 'positions';
        const positions = await this.watch (url + '/' + listenKey, messageHash, undefined, messageHash);
        return this.filterBySymbolsSinceLimit (positions, symbols, since, limit, true);
    }

    handlePosition (client: Client, message) {
        //
        //     {
        //         "e": "ACCOUNT_UPDATE",
        //         "E": 1638747328000,
        //         "a": {
        //             "P": [
        //                 {
        //                     "s": "BTCUSDT",
        //                     "pa": "1.5",
        //                     "ep": "50000.00",
        //                     "up": "1500.00",
        //                     "mt": "cross",
        //                     "iw": "0",
        //                     "ps": "BOTH"
        //                 }
        //             ]
        //         }
        //     }
        //
        const account = this.safeDict (message, 'a', {});
        const rawPositions = this.safeList (account, 'P', []);
        if (this.positions === undefined) {
            this.positions = new ArrayCacheBySymbolById ();
        }
        const cache = this.positions;
        for (let i = 0; i < rawPositions.length; i++) {
            const rawPosition = rawPositions[i];
            const position = this.parseWsPosition (rawPosition);
            cache.append (position);
        }
        const messageHash = 'positions';
        client.resolve (cache, messageHash);
    }

    parseWsPosition (position, market = undefined) {
        //
        //     {
        //         "s": "BTCUSDT",
        //         "pa": "1.5",
        //         "ep": "50000.00",
        //         "up": "1500.00",
        //         "mt": "cross",
        //         "iw": "0",
        //         "ps": "BOTH"
        //     }
        //
        const marketId = this.safeString (position, 's');
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        const contracts = this.safeString (position, 'pa');
        const entryPrice = this.safeString (position, 'ep');
        const unrealizedPnl = this.safeString (position, 'up');
        const marginType = this.safeString (position, 'mt');
        const side = this.safeString (position, 'ps');
        return this.safePosition ({
            'info': position,
            'id': undefined,
            'symbol': symbol,
            'contracts': contracts,
            'contractSize': undefined,
            'unrealizedPnl': unrealizedPnl,
            'leverage': undefined,
            'liquidationPrice': undefined,
            'collateral': undefined,
            'notional': undefined,
            'markPrice': undefined,
            'entryPrice': entryPrice,
            'timestamp': undefined,
            'initialMargin': undefined,
            'initialMarginPercentage': undefined,
            'maintenanceMargin': undefined,
            'maintenanceMarginPercentage': undefined,
            'marginRatio': undefined,
            'datetime': undefined,
            'marginMode': marginType,
            'side': side,
            'hedged': undefined,
            'percentage': undefined,
        });
    }

    async authenticate (params = {}) {
        const response = await this.fapiPrivatePostListenKey (params);
        const listenKey = this.safeString (response, 'listenKey');
        this.options['listenKey'] = listenKey;
        const refreshRate = this.safeInteger (this.options, 'listenKeyRefreshRate', 1200000);
        this.delay (refreshRate, this.keepAliveListenKey, params);
        return listenKey;
    }

    async keepAliveListenKey (params = {}) {
        await this.fapiPrivatePutListenKey (params);
        const refreshRate = this.safeInteger (this.options, 'listenKeyRefreshRate', 1200000);
        this.delay (refreshRate, this.keepAliveListenKey, params);
    }

    handleMessage (client: Client, message) {
        //
        //     {
        //         "e": "depthUpdate",
        //         "s": "BTCUSDT",
        //         ...
        //     }
        //
        //     PONG response:
        //     {
        //         "result": {}
        //     }
        //
        // Handle PONG response - Binance-style API returns {"result": {}} for PING
        const result = this.safeValue (message, 'result');
        if (result !== undefined) {
            const eventType = this.safeString (message, 'e');
            const id = this.safeString (message, 'id');
            // If no event and no id, this is a PONG response
            if (eventType === undefined && id === undefined) {
                this.handlePong (client, message);
                return;
            }
        }
        const event = this.safeString (message, 'e');
        const methods: Dict = {
            'depthUpdate': this.handleOrderBook,
            'aggTrade': this.handleTrades,
            '24hrTicker': this.handleTicker,
            'kline': this.handleOHLCV,
            'ACCOUNT_UPDATE': this.handleAccountUpdate,
            'ORDER_TRADE_UPDATE': this.handleOrderUpdate,
        };
        const exacMethod = this.safeValue (methods, event);
        if (exacMethod !== undefined) {
            exacMethod.call (this, client, message);
            return;
        }
        const data = this.safeList (message, 'data');
        if (data !== undefined) {
            this.handleTickers (client, message);
        }
    }

    handleAccountUpdate (client: Client, message) {
        const account = this.safeDict (message, 'a', {});
        const hasBalances = ('B' in account);
        const hasPositions = ('P' in account);
        if (hasBalances) {
            this.handleBalance (client, message);
        }
        if (hasPositions) {
            this.handlePosition (client, message);
        }
    }

    handleOrderUpdate (client: Client, message) {
        const orderData = this.safeDict (message, 'o', {});
        const executionType = this.safeString (orderData, 'x');
        if (executionType === 'TRADE') {
            this.handleMyTrade (client, message);
        }
        this.handleOrder (client, message);
    }

    ping (client: Client) {
        return {
            'method': 'PING',
        };
    }

    handlePong (client: Client, message) {
        client.lastPong = this.milliseconds ();
        return message;
    }

    handleErrorMessage (client: Client, message) {
        return message;
    }

    requestId () {
        const requestId = this.sum (this.safeInteger (this.options, 'requestId', 0), 1);
        this.options['requestId'] = requestId;
        return requestId;
    }
}
