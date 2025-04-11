
//  ---------------------------------------------------------------------------

import bitflexRest from '../bitflex.js';
import { ArrayCache, ArrayCacheBySymbolBySide, ArrayCacheBySymbolById, ArrayCacheByTimestamp } from '../base/ws/Cache.js';
import type { Balances, Int, Market, OHLCV, Order, OrderBook, Position, Str, Strings, Ticker, Trade } from '../base/types.js';
import Client from '../base/ws/Client.js';

//  ---------------------------------------------------------------------------
export default class bitflex extends bitflexRest {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchBalance': true,
                'watchTicker': true,
                'watchTickers': false,
                'watchTrades': true,
                'watchMyTrades': false,
                'watchOrders': true,
                'watchOrderBook': true,
                'watchOHLCV': true,
                'watchPositions': true,
            },
            'urls': {
                'api': {
                    'ws': {
                        'public': 'wss://wsapi.bitflex.com/openapi/quote/ws/v2',
                        'private': 'wss://wsapi.bitflex.com/openapi/ws',
                    },
                },
            },
            'options': {
                'listenKeyRefreshRate': 3600000,
                'watchOrderBook': {
                    'snapshotDelay': 25,
                    'snapshotMaxRetries': 3,
                },
                'listenKey': undefined,
            },
            'streaming': {
                'keepAlive': 10000,
            },
        });
    }

    async watchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        /**
         * @method
         * @name bitflex#watchOrderBook
         * @see https://docs.bitflex.com/websocket-v2
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int} [limit] the maximum amount of order book entries to return, not used by bitflex
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const subscriptionHash = 'depth';
        const messageHash = 'book:' + symbol;
        const request = {
            'topic': subscriptionHash,
            'event': 'sub',
            'params': {
                'binary': false,
                'symbol': market['id'],
            },
        };
        const url = this.urls['api']['ws']['public'];
        const orderbook = await this.watch (url, messageHash, this.extend (request, params), messageHash);
        return orderbook.limit ();
    }

    handleOrderBook (client: Client, message) {
        //
        //     {
        //         topic: 'depth',
        //         params: { symbol: 'ETHUSDT', binary: 'false', symbolName: 'ETHUSDT' },
        //         data: {
        //             s: 'ETHUSDT',
        //             t: 1713864203648,
        //             v: '32619510_2',
        //             b: [
        //                 [ '3172.74', '0.12' ],
        //                  ...
        //             ],
        //             a: [
        //                 [ '3172.74', '0.12' ],
        //                  ...
        //             ]
        //         }
        //     }
        //
        const data = this.safeDict (message, 'data', {});
        const params = this.safeDict (message, 'params', {});
        const marketId = this.safeString (params, 'symbol');
        const symbol = this.safeSymbol (marketId);
        const timestamp = this.safeInteger (data, 't');
        const messageHash = 'book:' + symbol;
        if (!(symbol in this.orderbooks)) {
            this.orderbooks[symbol] = this.orderBook ({});
        }
        const orderbook = this.orderbooks[symbol];
        const snapshot = this.parseOrderBook (data, symbol, timestamp, 'b', 'a');
        orderbook.reset (snapshot);
        const nonceString = this.safeString (data, 'v');
        const parts = nonceString.split ('_');
        orderbook['nonce'] = this.parseToInt (parts[0]);
        this.orderbooks[symbol] = orderbook;
        client.resolve (orderbook, messageHash);
    }

    async watchTicker (symbol: string, params = {}): Promise<Ticker> {
        /**
         * @method
         * @name bitflex#watchTicker
         * @see https://docs.bitflex.com/websocket-v2
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const subscriptionHash = 'realtimes';
        const messageHash = 'ticker:' + symbol;
        const request = {
            'topic': subscriptionHash,
            'event': 'sub',
            'params': {
                'binary': false,
                'symbol': market['id'],
            },
        };
        const url = this.urls['api']['ws']['public'];
        const ticker = await this.watch (url, messageHash, this.extend (request, params), messageHash);
        return ticker;
    }

    handleTicker (client: Client, message) {
        //
        //     {
        //         topic: 'realtimes',
        //         params: { symbol: 'ETHUSDT', binary: 'false', symbolName: 'ETHUSDT' },
        //         data: {
        //             t: 1713868819783,
        //             s: 'ETHUSDT',
        //             o: '3214.33',
        //             h: '3223.86',
        //             l: '3153.03',
        //             c: '3184.97',
        //             v: '1707.2222',
        //             qv: '5447142.127877',
        //             m: '-0.0091'
        //         }
        //     }
        //
        const data = this.safeDict (message, 'data', {});
        const params = this.safeDict (message, 'params', {});
        const marketId = this.safeString (params, 'symbol');
        const symbol = this.safeSymbol (marketId);
        this.tickers[symbol] = this.parseWsTicker (data);
        client.resolve (this.tickers[symbol], 'ticker:' + symbol);
        client.resolve (this.tickers, 'tickers');
    }

    parseWsTicker (message, market: Market = undefined) {
        //
        //     {
        //         t: 1713868819783,
        //         s: 'ETHUSDT',
        //         o: '3214.33',
        //         h: '3223.86',
        //         l: '3153.03',
        //         c: '3184.97',
        //         v: '1707.2222',
        //         qv: '5447142.127877',
        //         m: '-0.0091'
        //     }
        //
        const timestamp = this.safeInteger (message, 't');
        const marketId = this.safeString (message, 's');
        market = this.safeMarket (marketId, market);
        const close = this.safeString (message, 'c');
        return this.safeTicker ({
            'symbol': market['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (message, 'h'),
            'low': this.safeString (message, 'l'),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': this.safeString (message, 'o'),
            'close': close,
            'last': close,
            'previousClose': undefined,
            'change': undefined,
            'percentage': this.safeIntegerProduct (message, 'm', 100),
            'average': undefined,
            'baseVolume': this.safeString (message, 'v'),
            'quoteVolume': this.safeString (message, 'qv'),
            'info': message,
        }, market);
    }

    async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        /**
         * @method
         * @name bitflex#watchTrades
         * @see https://docs.bitflex.com/websocket-v2
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int} [since] timestamp in ms of the earliest trade to fetch
         * @param {int} [limit] the maximum amount of trades to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const subscriptionHash = 'trade';
        const messageHash = 'trades:' + symbol;
        const request = {
            'topic': subscriptionHash,
            'event': 'sub',
            'params': {
                'binary': false,
                'symbol': market['id'],
            },
        };
        const url = this.urls['api']['ws']['public'];
        const trades = await this.watch (url, messageHash, this.extend (request, params), messageHash);
        if (this.newUpdates) {
            const first = this.safeDict (trades, 0, {});
            const tradeSymbol = this.safeString (first, 'symbol');
            limit = trades.getLimit (tradeSymbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    handleTrades (client: Client, message) {
        //
        //     {
        //         topic: 'trade',
        //         params: {
        //             symbol: 'ETH-SWAP-USDT',
        //             binary: 'false',
        //             symbolName: 'ETH-SWAP-USDT'
        //         },
        //         data: {
        //             v: '1670465027720953857',
        //             t: 1713870949174,
        //             p: '3178.59',
        //             q: '0.58',
        //             m: false
        //         }
        //     }
        //
        const params = this.safeDict (message, 'params', {});
        const marketId = this.safeString (params, 'symbol');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        if (!(symbol in this.trades)) {
            const tradesLimit = this.safeInteger (this.options, 'tradesLimit', 1000);
            this.trades[symbol] = new ArrayCache (tradesLimit);
        }
        const stored = this.trades[symbol];
        const messageHash = 'trades:' + symbol;
        const data = this.safeDict (message, 'data', {});
        const trade = this.parseWsTrade (data, market);
        stored.append (trade);
        client.resolve (stored, messageHash);
    }

    parseWsTrade (trade, market: Market = undefined) {
        //
        //     data: {
        //         v: '1670465027720953857',
        //         t: 1713870949174,
        //         p: '3178.59',
        //         q: '0.58',
        //         m: false
        //     }
        //
        const timestamp = this.safeInteger (trade, 't');
        return this.safeTrade ({
            'info': trade,
            'amount': this.safeString (trade, 'q'),
            'datetime': this.iso8601 (timestamp),
            'id': undefined,
            'order': undefined,
            'price': this.safeString (trade, 'p'),
            'timestamp': timestamp,
            'type': undefined,
            'side': undefined,
            'symbol': this.safeString (market, 'symbol'),
            'takerOrMaker': undefined,
            'cost': undefined,
            'fee': undefined,
        }, market);
    }

    async watchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        /**
         * @method
         * @name bitflex#fetchOHLCV
         * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @see https://docs.bitflex.exchange/#candlesticks
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int} [since] timestamp in ms of the earliest candle to fetch
         * @param {int} [limit] the maximum amount of candles to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const timeframeId = this.safeString (this.timeframes, timeframe, timeframe);
        const request = {
            'topic': 'kline',
            'event': 'sub',
            'params': {
                'binary': false,
                'symbol': market['id'],
                'klineType': timeframeId,
            },
        };
        const url = this.urls['api']['ws']['public'];
        const messageHash = 'ohlcv:' + market['symbol'] + ':' + timeframe;
        const ohlcv = await this.watch (url, messageHash, this.extend (request, params), messageHash);
        if (this.newUpdates) {
            limit = ohlcv.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (ohlcv, since, limit, 0, true);
    }

    handleOHLCV (client: Client, message) {
        //
        //     {
        //         topic: 'kline',
        //         params: {
        //             symbol: 'ETHUSDT',
        //             binary: 'false',
        //             klineType: '6h',
        //             symbolName: 'ETHUSDT'
        //         },
        //         data: {
        //             t: 1713873600000,
        //             s: 'ETHUSDT',
        //             sn: 'ETHUSDT',
        //             c: '3188.19',
        //             h: '3188.21',
        //             l: '3177.46',
        //             o: '3179.17',
        //             v: '8.5997'
        //         }
        //     }
        //
        const params = this.safeDict (message, 'params', {});
        const timeframeId = this.safeString (params, 'klineType');
        const marketId = this.safeString (params, 'symbol', '');
        const market = this.safeMarket (marketId);
        const symbol = this.safeSymbol (marketId, market);
        const timeframe = this.findTimeframe (timeframeId);
        if (!(symbol in this.ohlcvs)) {
            this.ohlcvs[symbol] = {};
        }
        if (!(timeframe in this.ohlcvs[symbol])) {
            const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
            this.ohlcvs[symbol][timeframe] = new ArrayCacheByTimestamp (limit);
        }
        const data = this.safeDict (message, 'data', {});
        const parsed = this.parseWsOHLCV (data, market);
        const stored = this.ohlcvs[symbol][timeframe];
        stored.append (parsed);
        const messageHash = 'ohlcv:' + symbol + ':' + timeframe;
        client.resolve (stored, messageHash);
    }

    parseWsOHLCV (ohlcv, market: Market = undefined): OHLCV {
        //
        //     {
        //         t: 1713873600000,
        //         s: 'ETHUSDT',
        //         sn: 'ETHUSDT',
        //         c: '3188.19',
        //         h: '3188.21',
        //         l: '3177.46',
        //         o: '3179.17',
        //         v: '8.5997'
        //     }
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

    async watchBalance (params = {}): Promise<Balances> {
        /**
         * @method
         * @name bitflex#watchBalance
         * @description watch balance and get the amount of funds available for trading or funds locked in orders
         * @see https://docs.bitflex.com/user-data-stream
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
         */
        await this.loadMarkets ();
        const messageHash = 'balance';
        return await this.watchPrivate (messageHash, params);
    }

    handleBalance (client: Client, message) {
        //
        //     {
        //         e: 'outboundAccountInfo',
        //         E: '1713969654742',
        //         T: true,
        //         W: true,
        //         D: true,
        //         B: [
        //             { a: 'USDT', f: '80.746342492', l: '0' }
        //             ...
        //         ]
        //     }
        //
        const messageHash = 'balance';
        const balances = this.safeList (message, 'B', []);
        const timestamp = this.safeInteger (message, 'E');
        this.balance['info'] = balances;
        this.balance['timestamp'] = timestamp;
        this.balance['datetime'] = this.iso8601 (timestamp);
        for (let i = 0; i < balances.length; i++) {
            const balanceEntry = balances[i];
            const currencyId = this.safeString (balanceEntry, 'a');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeString (balanceEntry, 'f');
            account['used'] = this.safeString (balanceEntry, 'l');
            this.balance[code] = account;
        }
        this.balance = this.safeBalance (this.balance);
        client.resolve (this.balance, messageHash);
    }

    async watchPositions (symbols: Strings = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Position[]> {
        /**
         * @method
         * @name bitflex#watchPositions
         * @description watch all open positions
         * @see https://docs.bitflex.com/user-data-stream
         * @param {string[]|undefined} symbols list of unified market symbols
         * @param {object} params extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/en/latest/manual.html#position-structure}
         */
        await this.loadMarkets ();
        let messageHash = 'positions';
        symbols = this.marketSymbols (symbols, 'swap', true, true, false);
        if (symbols !== undefined) {
            messageHash += ':' + symbols.join (',');
        }
        const newPositions = await this.watchPrivate (messageHash, params);
        if (this.newUpdates) {
            return newPositions;
        }
        return this.filterBySymbolsSinceLimit (newPositions, symbols, since, limit, true);
    }

    handlePositions (client: Client, message) {
        //
        //     {
        //         e: 'outboundContractPositionInfo',
        //         E: '1713970091904',
        //         A: '1662502620223296003',
        //         s: 'ETH-SWAP-USDT',
        //         S: 'LONG',
        //         p: '3211.99',
        //         P: '0.01',
        //         a: '0.01',
        //         f: '1608.1',
        //         m: '16.1192',
        //         r: '-0.0192'
        //     }
        //
        if (this.positions === undefined) {
            this.positions = new ArrayCacheBySymbolBySide ();
        }
        const cache = this.positions;
        const newPositions = [];
        const position = this.parseWsPosition (message);
        newPositions.push (position);
        cache.append (position);
        const messageHashes = this.findMessageHashes (client, 'positions:');
        for (let i = 0; i < messageHashes.length; i++) {
            const messageHash = messageHashes[i];
            const parts = messageHash.split (':');
            const symbolsString = parts[1];
            const symbols = symbolsString.split (',');
            const positions = this.filterByArray (newPositions, 'symbol', symbols, false);
            if (!this.isEmpty (positions)) {
                client.resolve (positions, messageHash);
            }
        }
        client.resolve (newPositions, 'positions');
    }

    parseWsPosition (position, market = undefined) {
        //
        //     {
        //         e: 'outboundContractPositionInfo',
        //         E: '1713970091904',
        //         A: '1662502620223296003',
        //         s: 'ETH-SWAP-USDT',
        //         S: 'LONG',
        //         p: '3211.99',
        //         P: '0.01',
        //         a: '0.01',
        //         f: '1608.1',
        //         m: '16.1192',
        //         r: '-0.0192'
        //     }
        //
        const marketId = this.safeString (position, 's');
        let marginMode = 'cross';
        if (position === undefined) {
            marginMode = undefined;
        }
        market = this.safeMarket (marketId, market);
        const timestamp = this.safeInteger (position, 'E');
        return this.safePosition ({
            'info': position,
            'id': undefined,
            'symbol': market['symbol'],
            'notional': undefined,
            'marginMode': marginMode,
            'liquidationPrice': this.safeNumber (position, 'f'),
            'entryPrice': this.safeNumber (position, 'p'),
            'unrealizedPnl': undefined,
            'realizedPnl': this.safeNumber (position, 'r'),
            'percentage': undefined,
            'contracts': this.safeNumber (position, 'P'),
            'contractSize': undefined,
            'markPrice': undefined,
            'lastPrice': undefined,
            'side': this.safeStringLower (position, 'S'),
            'hedged': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastUpdateTimestamp': undefined,
            'maintenanceMargin': undefined,
            'maintenanceMarginPercentage': undefined,
            'collateral': undefined,
            'initialMargin': this.safeNumber (position, 'm'),
            'initialMarginPercentage': undefined,
            'leverage': undefined,
            'marginRatio': undefined,
            'stopLossPrice': undefined,
            'takeProfitPrice': undefined,
        });
    }

    async watchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        /**
         * @method
         * @name bitflex#watchOrders
         * @see https://docs.bitflex.com/user-data-stream
         * @description watches information on multiple orders made by the user
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int} [since] the earliest time in ms to fetch orders for
         * @param {int} [limit] the maximum number of order structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        let messageHash = 'orders';
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            symbol = market['symbol'];
            messageHash = messageHash + ':' + symbol;
        }
        const orders = await this.watchPrivate (messageHash, params);
        if (this.newUpdates) {
            limit = orders.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (orders, symbol, since, limit, true);
    }

    handleOrder (client: Client, message) {
        const marketId = this.safeString (message, 's');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const order = this.parseWsOrder (message, market);
        if (this.orders === undefined) {
            const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
            this.orders = new ArrayCacheBySymbolById (limit);
        }
        const stored = this.orders;
        stored.append (order);
        const messageHash = 'orders';
        client.resolve (stored, messageHash);
        const symbolSpecificMessageHash = messageHash + ':' + symbol;
        client.resolve (stored, symbolSpecificMessageHash);
    }

    parseWsOrder (order, market = undefined) {
        //
        //     {
        //         e: 'executionReport',
        //         E: '1713969654752',
        //         s: 'ETHUSDT',
        //         c: '1713969654676406',
        //         S: 'BUY',
        //         o: 'MARKET_OF_QUOTE',
        //         f: 'GTC',
        //         q: '33',
        //         p: '0',
        //         X: 'FILLED',
        //         i: '1671293029561028608',
        //         M: '1671293004546199552',
        //         l: '0.0103',
        //         z: '0.0103',
        //         L: '3200.5',
        //         n: '0.00000618',
        //         N: 'ETH',
        //         u: true,
        //         w: true,
        //         m: false,
        //         O: '1713969654687',
        //         Z: '32.96515',
        //         A: '0',
        //         C: false,
        //         v: '0'
        //     }
        //
        const timestamp = this.safeInteger (order, 'E');
        let type = this.safeString (order, 'o');
        let amount = this.safeString (order, 'q');
        if (type === 'MARKET_OF_QUOTE') {
            amount = undefined; // market spot orders return cost instead of amount
        }
        const orderTimeInForce = this.safeString (order, 'f');
        let timeInForce = this.parseOrderTimeInForce (orderTimeInForce);
        if (type === 'LIMIT_MAKER') {
            timeInForce = 'PO';
        }
        let reduceOnly = undefined;
        if (market['swap']) {
            reduceOnly = this.safeBool (order, 'C', false);
            if ((type !== 'MARKET') && (type !== 'MARKET_OF_QUOTE') && (type !== 'MARKET_OF_BASE')) {
                type = undefined; // swap orders can return type LIMIT for market orders thus we can't parse type properly in ws
            }
        }
        const feeCost = this.safeString (order, 'n');
        const feeCurrency = this.safeString (order, 'N');
        const fee = {
            'cost': feeCost,
            'currency': feeCurrency,
        };
        return this.safeOrder ({
            'id': this.safeString (order, 'i'),
            'clientOrderId': this.safeString (order, 'c'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': this.safeSymbol (undefined, market),
            'type': this.parseWsOrderType (type),
            'side': this.safeStringLower (order, 'S'),
            'lastTradeTimestamp': undefined,
            'lastUpdateTimestamp': undefined,
            'price': this.omitZero (this.safeString (order, 'price')),
            'amount': amount,
            'cost': this.safeString (order, 'Z'),
            'average': undefined,
            'filled': this.safeString (order, 'z'),
            'remaining': undefined,
            'timeInForce': timeInForce,
            'trades': undefined,
            'reduceOnly': reduceOnly,
            'stopPrice': undefined,
            'triggerPrice': this.safeNumber (order, 'P'),
            'takeProfitPrice': undefined,
            'stopLossPrice': undefined,
            'status': this.parseOrderStatus (this.safeString (order, 'X')),
            'fee': fee,
            'info': order,
        }, market);
    }

    parseWsOrderType (type) {
        const types = {
            'MARKET': 'market',
            'MARKET_OF_QUOTE': 'market',
            'MARKET_OF_BASE': 'market',
            'LIMIT': 'limit',
            'LIMIT_MAKER': 'limit',
        };
        return this.safeString (types, type, type);
    }

    async watchPrivate (messageHash, params = {}) {
        this.checkRequiredCredentials ();
        const listenKey = await this.authenticate (params);
        const url = this.urls['api']['ws']['private'] + '/' + listenKey;
        const subscriptionHash = 'private';
        return await this.watch (url, messageHash, params, subscriptionHash);
        //
        // balance
        //     [
        //         {
        //             e: 'outboundAccountInfo',
        //             E: '1713969654742',
        //             T: true,
        //             W: true,
        //             D: true,
        //             B: [ [Object] ]
        //         }
        //     ]
        //
        // spot orders
        //     [
        //         {
        //             e: 'executionReport',
        //             E: '1713969654752',
        //             s: 'ETHUSDT',
        //             c: '1713969654676406',
        //             S: 'BUY',
        //             o: 'MARKET_OF_QUOTE',
        //             f: 'GTC',
        //             q: '33',
        //             p: '0',
        //             X: 'FILLED',
        //             i: '1671293029561028608',
        //             M: '1671293004546199552',
        //             l: '0.0103',
        //             z: '0.0103',
        //             L: '3200.5',
        //             n: '0.00000618',
        //             N: 'ETH',
        //             u: true,
        //             w: true,
        //             m: false,
        //             O: '1713969654687',
        //             Z: '32.96515',
        //             A: '0',
        //             C: false,
        //             v: '0'
        //         }
        //     ]
        //
        //
        // swap orders
        //     [
        //         {
        //             e: 'contractExecutionReport',
        //             E: '1713970091902',
        //             s: 'ETH-SWAP-USDT',
        //             c: 'wsTest',
        //             S: 'BUY',
        //             o: 'LIMIT',
        //             f: 'IOC',
        //             q: '0.01',
        //             p: '3227.71',
        //             X: 'FILLED',
        //             i: '1671296696238232320',
        //             M: '1671296668337852416',
        //             l: '0.01',
        //             z: '0.01',
        //             L: '3211.99',
        //             n: '0.01927194',
        //             N: 'ETH-SWAP-USDT',
        //             u: true,
        //             w: true,
        //             m: false,
        //             O: '1713970091791',
        //             Z: '32.1199',
        //             A: '0',
        //             C: false,
        //             v: '0'
        //         }
        //     ]
        //
        // positions
        //     [
        //         {
        //             e: 'outboundContractPositionInfo',
        //             E: '1713970091904',
        //             A: '1662502620223296003',
        //             s: 'ETH-SWAP-USDT',
        //             S: 'LONG',
        //             p: '3211.99',
        //             P: '0.01',
        //             a: '0.01',
        //             f: '1608.1',
        //             m: '16.1192',
        //             r: '-0.0192'
        //         }
        //     ]
        //
    }

    async authenticate (params = {}) {
        let listenKey = this.safeString (this.options, 'listenKey');
        if (listenKey !== undefined) {
            return listenKey;
        }
        const response = await this.privatePostOpenapiV1UserDataStream (params);
        //
        //     {
        //         "listenKey": "1A9LWJjuMwKWYP4QQPw34GRm8gz3x5AephXSuqcDef1RnzoBVhEeGE963CoS1Sgj"
        //     }
        //
        listenKey = this.safeString (response, 'listenKey');
        this.options['listenKey'] = listenKey;
        const listenKeyRefreshRate = this.safeInteger (this.options, 'listenKeyRefreshRate', 3600000);
        this.delay (listenKeyRefreshRate, this.keepAliveListenKey, listenKey, params);
        return listenKey;
    }

    async keepAliveListenKey (listenKey, params = {}) {
        if (listenKey === undefined) {
            return;
        }
        const request = {
            'listenKey': listenKey,
        };
        try {
            await this.privatePutOpenapiV1UserDataStream (this.extend (request, params));
            const listenKeyRefreshRate = this.safeInteger (this.options, 'listenKeyRefreshRate', 3600000);
            this.delay (listenKeyRefreshRate, this.keepAliveListenKey, listenKey, params);
        } catch (error) {
            const url = this.urls['api']['ws']['private'] + '/' + listenKey;
            const client = this.client (url);
            this.options['listenKey'] = undefined;
            client.reject (error);
            delete this.clients[url];
        }
    }

    handleMessage (client: Client, message) {
        if (Array.isArray (message)) {
            message = message[0]; // private messages are returned as arrays
        }
        const topic = this.safeString (message, 'topic');
        const data = this.safeDict (message, 'data');
        const event = this.safeString (message, 'e');
        if ((topic !== undefined) && (data !== undefined)) { // for public methods
            if (topic === 'depth') {
                this.handleOrderBook (client, message);
            }
            if (topic === 'realtimes') {
                this.handleTicker (client, message);
            }
            if (topic === 'trade') {
                this.handleTrades (client, message);
            }
            if (topic === 'kline') {
                this.handleOHLCV (client, message);
            }
        }
        if (event !== undefined) { // for private methods
            if (event === 'outboundAccountInfo') {
                this.handleBalance (client, message);
            }
            if (event === 'outboundContractPositionInfo') {
                this.handlePositions (client, message);
            }
            if ((event === 'executionReport') || (event === 'contractExecutionReport')) {
                this.handleOrder (client, message);
            }
        }
    }
}
