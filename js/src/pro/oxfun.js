//  ---------------------------------------------------------------------------
import oxfunRest from '../oxfun.js';
import { ArgumentsRequired, AuthenticationError, BadRequest } from '../base/errors.js';
import { sha256 } from '../static_dependencies/noble-hashes/sha256.js';
import { ArrayCache, ArrayCacheBySymbolById, ArrayCacheBySymbolBySide, ArrayCacheByTimestamp } from '../base/ws/Cache.js';
//  ---------------------------------------------------------------------------
export default class oxfun extends oxfunRest {
    describe() {
        return this.deepExtend(super.describe(), {
            'has': {
                'ws': true,
                'watchTrades': true,
                'watchTradesForSymbols': true,
                'watchOrderBook': true,
                'watchOrderBookForSymbols': true,
                'watchOHLCV': true,
                'watchOHLCVForSymbols': true,
                'watchOrders': true,
                'watchMyTrades': false,
                'watchTicker': true,
                'watchTickers': true,
                'watchBidsAsks': true,
                'watchBalance': true,
                'createOrderWs': true,
                'editOrderWs': true,
                'cancelOrderWs': true,
                'cancelOrdersWs': true,
            },
            'urls': {
                'api': {
                    'ws': 'wss://api.ox.fun/v2/websocket',
                    'test': 'wss://stgapi.ox.fun/v2/websocket',
                },
            },
            'options': {
                'timeframes': {
                    '1m': '60s',
                    '3m': '180s',
                    '5m': '300s',
                    '15m': '900s',
                    '30m': '1800s',
                    '1h': '3600s',
                    '2h': '7200s',
                    '4h': '14400s',
                    '6h': '21600s',
                    '12h': '43200s',
                    '1d': '86400s',
                },
                'watchOrderBook': {
                    'channel': 'depth', // depth, depthL5, depthL10, depthL25
                },
            },
            'streaming': {
                'ping': this.ping,
                'keepAlive': 50000,
            },
        });
    }
    async subscribeMultiple(messageHashes, argsArray, params = {}) {
        const url = this.urls['api']['ws'];
        const request = {
            'op': 'subscribe',
            'args': argsArray,
        };
        return await this.watchMultiple(url, messageHashes, this.extend(request, params), messageHashes);
    }
    /**
     * @method
     * @name oxfun#watchTrades
     * @description watches information on multiple trades made in a market
     * @see https://docs.ox.fun/?json#trade
     * @param {string} symbol unified market symbol of the market trades were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int|string} [params.tag] If given it will be echoed in the reply and the max size of tag is 32
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async watchTrades(symbol, since = undefined, limit = undefined, params = {}) {
        return await this.watchTradesForSymbols([symbol], since, limit, params);
    }
    /**
     * @method
     * @name oxfun#watchTradesForSymbols
     * @description get the list of most recent trades for a particular symbol
     * @see https://docs.ox.fun/?json#trade
     * @param {string[]} symbols
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int|string} [params.tag] If given it will be echoed in the reply and the max size of tag is 32
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async watchTradesForSymbols(symbols, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols, undefined, false);
        const args = [];
        const messageHashes = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const messageHash = 'trades' + ':' + symbol;
            messageHashes.push(messageHash);
            const marketId = this.marketId(symbol);
            const arg = 'trade:' + marketId;
            args.push(arg);
        }
        const trades = await this.subscribeMultiple(messageHashes, args, params);
        if (this.newUpdates) {
            const first = this.safeDict(trades, 0, {});
            const tradeSymbol = this.safeString(first, 'symbol');
            limit = trades.getLimit(tradeSymbol, limit);
        }
        return this.filterBySinceLimit(trades, since, limit, 'timestamp', true);
    }
    handleTrades(client, message) {
        //
        //     {
        //         table: 'trade',
        //         data: [
        //             {
        //                 side: 'SELL',
        //                 quantity: '0.074',
        //                 matchType: 'TAKER',
        //                 price: '3079.5',
        //                 marketCode: 'ETH-USD-SWAP-LIN',
        //                 tradeId: '400017157974517783',
        //                 timestamp: '1716124156643'
        //             }
        //         ]
        //     }
        //
        const data = this.safeList(message, 'data', []);
        for (let i = 0; i < data.length; i++) {
            const trade = this.safeDict(data, i, {});
            const parsedTrade = this.parseWsTrade(trade);
            const symbol = this.safeString(parsedTrade, 'symbol');
            const messageHash = 'trades:' + symbol;
            if (!(symbol in this.trades)) {
                const tradesLimit = this.safeInteger(this.options, 'tradesLimit', 1000);
                this.trades[symbol] = new ArrayCache(tradesLimit);
            }
            const stored = this.trades[symbol];
            stored.append(parsedTrade);
            client.resolve(stored, messageHash);
        }
    }
    parseWsTrade(trade, market = undefined) {
        //
        //     {
        //         side: 'SELL',
        //         quantity: '0.074',
        //         matchType: 'TAKER',
        //         price: '3079.5',
        //         marketCode: 'ETH-USD-SWAP-LIN',
        //         tradeId: '400017157974517783',
        //         timestamp: '1716124156643'
        //     }
        //
        const marketId = this.safeString(trade, 'marketCode');
        market = this.safeMarket(marketId, market);
        const timestamp = this.safeInteger(trade, 'timestamp');
        return this.safeTrade({
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'symbol': market['symbol'],
            'id': this.safeString(trade, 'tradeId'),
            'order': undefined,
            'type': undefined,
            'takerOrMaker': this.safeStringLower(trade, 'matchType'),
            'side': this.safeStringLower(trade, 'side'),
            'price': this.safeNumber(trade, 'price'),
            'amount': this.safeNumber(trade, 'quantity'),
            'cost': undefined,
            'fee': undefined,
        });
    }
    /**
     * @method
     * @name oxfun#watchOHLCV
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://docs.ox.fun/?json#candles
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int|string} [params.tag] If given it will be echoed in the reply and the max size of tag is 32
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async watchOHLCV(symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const timeframes = this.safeDict(this.options, 'timeframes', {});
        const interval = this.safeString(timeframes, timeframe, timeframe);
        const args = 'candles' + interval + ':' + market['id'];
        const messageHash = 'ohlcv:' + symbol + ':' + timeframe;
        const url = this.urls['api']['ws'];
        const request = {
            'op': 'subscribe',
            'args': [args],
        };
        const ohlcvs = await this.watch(url, messageHash, this.extend(request, params), messageHash);
        if (this.newUpdates) {
            limit = ohlcvs.getLimit(symbol, limit);
        }
        return this.filterBySinceLimit(ohlcvs, since, limit, 0, true);
    }
    /**
     * @method
     * @name oxfun#watchOHLCVForSymbols
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://docs.ox.fun/?json#candles
     * @param {string[][]} symbolsAndTimeframes array of arrays containing unified symbols and timeframes to fetch OHLCV data for, example [['BTC/USDT', '1m'], ['LTC/USDT', '5m']]
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int|string} [params.tag] If given it will be echoed in the reply and the max size of tag is 32
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async watchOHLCVForSymbols(symbolsAndTimeframes, since = undefined, limit = undefined, params = {}) {
        const symbolsLength = symbolsAndTimeframes.length;
        if (symbolsLength === 0 || !Array.isArray(symbolsAndTimeframes[0])) {
            throw new ArgumentsRequired(this.id + " watchOHLCVForSymbols() requires a an array of symbols and timeframes, like  [['BTC/USDT:OX', '1m'], ['OX/USDT', '5m']]");
        }
        await this.loadMarkets();
        const args = [];
        const messageHashes = [];
        const timeframes = this.safeDict(this.options, 'timeframes', {});
        for (let i = 0; i < symbolsAndTimeframes.length; i++) {
            const symbolAndTimeframe = symbolsAndTimeframes[i];
            const sym = symbolAndTimeframe[0];
            const tf = symbolAndTimeframe[1];
            const marketId = this.marketId(sym);
            const interval = this.safeString(timeframes, tf, tf);
            const arg = 'candles' + interval + ':' + marketId;
            args.push(arg);
            const messageHash = 'multi:ohlcv:' + sym + ':' + tf;
            messageHashes.push(messageHash);
        }
        const [symbol, timeframe, candles] = await this.subscribeMultiple(messageHashes, args, params);
        if (this.newUpdates) {
            limit = candles.getLimit(symbol, limit);
        }
        const filtered = this.filterBySinceLimit(candles, since, limit, 0, true);
        return this.createOHLCVObject(symbol, timeframe, filtered);
    }
    handleOHLCV(client, message) {
        //
        //     {
        //         "table": "candles60s",
        //         "data": [
        //             {
        //                 "marketCode": "BTC-USD-SWAP-LIN",
        //                 "candle": [
        //                     "1594313762698", //timestamp
        //                     "9633.1",        //open
        //                     "9693.9",        //high
        //                     "9238.1",        //low
        //                     "9630.2",        //close
        //                     "45247",         //volume in OX
        //                     "5.3"            //volume in Contracts
        //                 ]
        //             }
        //         ]
        //     }
        //
        const table = this.safeString(message, 'table');
        const parts = table.split('candles');
        const timeframeId = this.safeString(parts, 1, '');
        const timeframe = this.findTimeframe(timeframeId);
        const messageData = this.safeList(message, 'data', []);
        const data = this.safeDict(messageData, 0, {});
        const marketId = this.safeString(data, 'marketCode');
        const market = this.safeMarket(marketId);
        const symbol = this.safeSymbol(marketId, market);
        if (!(symbol in this.ohlcvs)) {
            this.ohlcvs[symbol] = {};
        }
        if (!(timeframe in this.ohlcvs[symbol])) {
            const limit = this.safeInteger(this.options, 'OHLCVLimit', 1000);
            this.ohlcvs[symbol][timeframe] = new ArrayCacheByTimestamp(limit);
        }
        const candle = this.safeList(data, 'candle', []);
        const parsed = this.parseWsOHLCV(candle, market);
        const stored = this.ohlcvs[symbol][timeframe];
        stored.append(parsed);
        const messageHash = 'ohlcv:' + symbol + ':' + timeframe;
        client.resolve(stored, messageHash);
        // for multiOHLCV we need special object, as opposed to other "multi"
        // methods, because OHLCV response item does not contain symbol
        // or timeframe, thus otherwise it would be unrecognizable
        const messageHashForMulti = 'multi:' + messageHash;
        client.resolve([symbol, timeframe, stored], messageHashForMulti);
    }
    parseWsOHLCV(ohlcv, market = undefined) {
        //
        //     [
        //         "1594313762698", //timestamp
        //         "9633.1",        //open
        //         "9693.9",        //high
        //         "9238.1",        //low
        //         "9630.2",        //close
        //         "45247",         //volume in OX
        //         "5.3"            //volume in Contracts
        //     ]
        //
        return [
            this.safeInteger(ohlcv, 0),
            this.safeNumber(ohlcv, 1),
            this.safeNumber(ohlcv, 2),
            this.safeNumber(ohlcv, 3),
            this.safeNumber(ohlcv, 4),
            this.safeNumber(ohlcv, 6),
        ];
    }
    /**
     * @method
     * @name oxfun#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.ox.fun/?json#fixed-size-order-book
     * @see https://docs.ox.fun/?json#full-order-book
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async watchOrderBook(symbol, limit = undefined, params = {}) {
        return await this.watchOrderBookForSymbols([symbol], limit, params);
    }
    /**
     * @method
     * @name oxfun#watchOrderBookForSymbols
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.ox.fun/?json#fixed-size-order-book
     * @see https://docs.ox.fun/?json#full-order-book
     * @param {string[]} symbols unified array of symbols
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int|string} [params.tag] If given it will be echoed in the reply and the max size of tag is 32
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async watchOrderBookForSymbols(symbols, limit = undefined, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols);
        let channel = 'depth';
        const options = this.safeDict(this.options, 'watchOrderBook', {});
        const defaultChannel = this.safeString(options, 'channel');
        if (defaultChannel !== undefined) {
            channel = defaultChannel;
        }
        else if (limit !== undefined) {
            if (limit <= 5) {
                channel = 'depthL5';
            }
            else if (limit <= 10) {
                channel = 'depthL10';
            }
            else if (limit <= 25) {
                channel = 'depthL25';
            }
        }
        const args = [];
        const messageHashes = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const messageHash = 'orderbook:' + symbol;
            messageHashes.push(messageHash);
            const marketId = this.marketId(symbol);
            const arg = channel + ':' + marketId;
            args.push(arg);
        }
        const orderbook = await this.subscribeMultiple(messageHashes, args, params);
        return orderbook.limit();
    }
    handleOrderBook(client, message) {
        //
        //     {
        //         "table": "depth",
        //         "data": {
        //             "seqNum": "100170478917895032",
        //             "asks": [
        //                 [ 0.01, 100500 ],
        //                 ...
        //             ],
        //             "bids": [
        //                 [ 69.69696, 69 ],
        //                 ...
        //             ],
        //             "checksum": 261021645,
        //             "marketCode": "OX-USDT",
        //             "timestamp": 1716204786184
        //         },
        //         "action": "partial"
        //     }
        //
        const data = this.safeDict(message, 'data', {});
        const marketId = this.safeString(data, 'marketCode');
        const symbol = this.safeSymbol(marketId);
        const timestamp = this.safeInteger(data, 'timestamp');
        const messageHash = 'orderbook:' + symbol;
        if (!(symbol in this.orderbooks)) {
            this.orderbooks[symbol] = this.orderBook({});
        }
        const orderbook = this.orderbooks[symbol];
        const snapshot = this.parseOrderBook(data, symbol, timestamp, 'asks', 'bids');
        orderbook.reset(snapshot);
        orderbook['nonce'] = this.safeInteger(data, 'seqNum');
        this.orderbooks[symbol] = orderbook;
        client.resolve(orderbook, messageHash);
    }
    /**
     * @method
     * @name oxfun#watchTicker
     * @see https://docs.ox.fun/?json#ticker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int|string} [params.tag] If given it will be echoed in the reply and the max size of tag is 32
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchTicker(symbol, params = {}) {
        const ticker = await this.watchTickers([symbol], params);
        return this.safeValue(ticker, symbol);
    }
    /**
     * @method
     * @name oxfun#watchTickers
     * @see https://docs.ox.fun/?json#ticker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @param {string[]} [symbols] unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int|string} [params.tag] If given it will be echoed in the reply and the max size of tag is 32
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchTickers(symbols = undefined, params = {}) {
        await this.loadMarkets();
        const allSymbols = (symbols === undefined);
        let sym = symbols;
        const args = [];
        if (allSymbols) {
            sym = this.symbols;
            args.push('ticker:all');
        }
        const messageHashes = [];
        for (let i = 0; i < sym.length; i++) {
            const symbol = sym[i];
            const messageHash = 'tickers' + ':' + symbol;
            messageHashes.push(messageHash);
            const marketId = this.marketId(symbol);
            if (!allSymbols) {
                args.push('ticker:' + marketId);
            }
        }
        const newTicker = await this.subscribeMultiple(messageHashes, args, params);
        if (this.newUpdates) {
            const result = {};
            result[newTicker['symbol']] = newTicker;
            return result;
        }
        return this.filterByArray(this.tickers, 'symbol', symbols);
    }
    handleTicker(client, message) {
        //
        //     {
        //         "table": "ticker",
        //         "data": [
        //             {
        //                 "last": "3088.6",
        //                 "open24h": "3087.2",
        //                 "high24h": "3142.0",
        //                 "low24h": "3053.9",
        //                 "volume24h": "450512672.1800",
        //                 "currencyVolume24h": "1458.579",
        //                 "openInterest": "3786.801",
        //                 "marketCode": "ETH-USD-SWAP-LIN",
        //                 "timestamp": "1716212747050",
        //                 "lastQty": "0.813",
        //                 "markPrice": "3088.6",
        //                 "lastMarkPrice": "3088.6",
        //                 "indexPrice": "3086.5"
        //             },
        //             ...
        //         ]
        //     }
        //
        const data = this.safeList(message, 'data', []);
        for (let i = 0; i < data.length; i++) {
            const rawTicker = this.safeDict(data, i, {});
            const ticker = this.parseTicker(rawTicker);
            const symbol = ticker['symbol'];
            const messageHash = 'tickers:' + symbol;
            this.tickers[symbol] = ticker;
            client.resolve(ticker, messageHash);
        }
    }
    /**
     * @method
     * @name oxfun#watchBidsAsks
     * @see https://docs.ox.fun/?json#best-bid-ask
     * @description watches best bid & ask for symbols
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchBidsAsks(symbols = undefined, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols, undefined, false);
        const messageHashes = [];
        const args = [];
        for (let i = 0; i < symbols.length; i++) {
            const market = this.market(symbols[i]);
            args.push('bestBidAsk:' + market['id']);
            messageHashes.push('bidask:' + market['symbol']);
        }
        const newTickers = await this.subscribeMultiple(messageHashes, args, params);
        if (this.newUpdates) {
            const tickers = {};
            tickers[newTickers['symbol']] = newTickers;
            return tickers;
        }
        return this.filterByArray(this.bidsasks, 'symbol', symbols);
    }
    handleBidAsk(client, message) {
        //
        //     {
        //       "table": "bestBidAsk",
        //       "data": {
        //         "ask": [
        //           19045.0,
        //           1.0
        //         ],
        //         "checksum": 3790706311,
        //         "marketCode": "BTC-USD-SWAP-LIN",
        //         "bid": [
        //           19015.0,
        //           1.0
        //         ],
        //         "timestamp": "1665456882928"
        //       }
        //     }
        //
        const data = this.safeDict(message, 'data', {});
        const parsedTicker = this.parseWsBidAsk(data);
        const symbol = parsedTicker['symbol'];
        this.bidsasks[symbol] = parsedTicker;
        const messageHash = 'bidask:' + symbol;
        client.resolve(parsedTicker, messageHash);
    }
    parseWsBidAsk(ticker, market = undefined) {
        const marketId = this.safeString(ticker, 'marketCode');
        market = this.safeMarket(marketId, market);
        const symbol = this.safeString(market, 'symbol');
        const timestamp = this.safeInteger(ticker, 'timestamp');
        const ask = this.safeList(ticker, 'ask', []);
        const bid = this.safeList(ticker, 'bid', []);
        return this.safeTicker({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'ask': this.safeNumber(ask, 0),
            'askVolume': this.safeNumber(ask, 1),
            'bid': this.safeNumber(bid, 0),
            'bidVolume': this.safeNumber(bid, 1),
            'info': ticker,
        }, market);
    }
    /**
     * @method
     * @name oxfun#watchBalance
     * @see https://docs.ox.fun/?json#balance-channel
     * @description watch balance and get the amount of funds available for trading or funds locked in orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int|string} [params.tag] If given it will be echoed in the reply and the max size of tag is 32
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    async watchBalance(params = {}) {
        await this.loadMarkets();
        this.authenticate();
        const args = 'balance:all';
        const messageHash = 'balance';
        const url = this.urls['api']['ws'];
        const request = {
            'op': 'subscribe',
            'args': [args],
        };
        return await this.watch(url, messageHash, this.extend(request, params), messageHash);
    }
    handleBalance(client, message) {
        //
        //     {
        //         "table": "balance",
        //         "accountId": "106464",
        //         "timestamp": "1716549132780",
        //         "tradeType": "PORTFOLIO",
        //         "data": [
        //             {
        //                 "instrumentId": "xOX",
        //                 "total": "23.375591220",
        //                 "available": "23.375591220",
        //                 "reserved": "0",
        //                 "quantityLastUpdated": "1716509744262",
        //                 "locked": "0"
        //             },
        //             ...
        //         ]
        //     }
        //
        const balances = this.safeList(message, 'data');
        const timestamp = this.safeInteger(message, 'timestamp');
        this.balance['info'] = message;
        this.balance['timestamp'] = timestamp;
        this.balance['datetime'] = this.iso8601(timestamp);
        for (let i = 0; i < balances.length; i++) {
            const balance = this.safeDict(balances, i, {});
            const currencyId = this.safeString(balance, 'instrumentId');
            const code = this.safeCurrencyCode(currencyId);
            if (!(code in this.balance)) {
                this.balance[code] = this.account();
            }
            const account = this.balance[code];
            account['total'] = this.safeString(balance, 'total');
            account['used'] = this.safeString(balance, 'reserved');
            account['free'] = this.safeString(balance, 'available');
            this.balance[code] = account;
        }
        this.balance = this.safeBalance(this.balance);
        client.resolve(this.balance, 'balance');
    }
    /**
     * @method
     * @name oxfun#watchPositions
     * @see https://docs.ox.fun/?json#position-channel
     * @description watch all open positions
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param since
     * @param limit
     * @param {object} params extra parameters specific to the exchange API endpoint
     * @param {int|string} [params.tag] If given it will be echoed in the reply and the max size of tag is 32
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/en/latest/manual.html#position-structure}
     */
    async watchPositions(symbols = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        await this.authenticate();
        const allSymbols = (symbols === undefined);
        let sym = symbols;
        const args = [];
        if (allSymbols) {
            sym = this.symbols;
            args.push('position:all');
        }
        const messageHashes = [];
        for (let i = 0; i < sym.length; i++) {
            const symbol = sym[i];
            const messageHash = 'positions' + ':' + symbol;
            messageHashes.push(messageHash);
            const marketId = this.marketId(symbol);
            if (!allSymbols) {
                args.push('position:' + marketId);
            }
        }
        const newPositions = await this.subscribeMultiple(messageHashes, args, params);
        if (this.newUpdates) {
            return newPositions;
        }
        return this.filterBySymbolsSinceLimit(this.positions, symbols, since, limit, true);
    }
    handlePositions(client, message) {
        //
        //     {
        //         "table": "position",
        //         "accountId": "106464",
        //         "timestamp": "1716550771582",
        //         "data": [
        //             {
        //                 "instrumentId": "ETH-USD-SWAP-LIN",
        //                 "quantity": "0.01",
        //                 "lastUpdated": "1716550757299",
        //                 "contractValCurrency": "ETH",
        //                 "entryPrice": "3709.6",
        //                 "positionPnl": "-5.000",
        //                 "estLiquidationPrice": "743.4",
        //                 "margin": "0",
        //                 "leverage": "0"
        //             }
        //         ]
        //     }
        //
        if (this.positions === undefined) {
            this.positions = new ArrayCacheBySymbolBySide();
        }
        const cache = this.positions;
        const data = this.safeList(message, 'data', []);
        for (let i = 0; i < data.length; i++) {
            const rawPosition = this.safeDict(data, i, {});
            const position = this.parseWsPosition(rawPosition);
            const symbol = position['symbol'];
            const messageHash = 'positions:' + symbol;
            cache.append(position);
            client.resolve(position, messageHash);
        }
    }
    parseWsPosition(position, market = undefined) {
        //
        //     {
        //         "instrumentId": "ETH-USD-SWAP-LIN",
        //         "quantity": "0.01",
        //         "lastUpdated": "1716550757299",
        //         "contractValCurrency": "ETH",
        //         "entryPrice": "3709.6",
        //         "positionPnl": "-5.000",
        //         "estLiquidationPrice": "743.4",
        //         "margin": "0", // Currently always reports 0
        //         "leverage": "0" // Currently always reports 0
        //     }
        //
        const marketId = this.safeString(position, 'instrumentId');
        market = this.safeMarket(marketId, market);
        return this.safePosition({
            'info': position,
            'id': undefined,
            'symbol': market['symbol'],
            'notional': undefined,
            'marginMode': 'cross',
            'liquidationPrice': this.safeNumber(position, 'estLiquidationPrice'),
            'entryPrice': this.safeNumber(position, 'entryPrice'),
            'unrealizedPnl': this.safeNumber(position, 'positionPnl'),
            'realizedPnl': undefined,
            'percentage': undefined,
            'contracts': this.safeNumber(position, 'quantity'),
            'contractSize': undefined,
            'markPrice': undefined,
            'lastPrice': undefined,
            'side': undefined,
            'hedged': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'lastUpdateTimestamp': this.safeInteger(position, 'lastUpdated'),
            'maintenanceMargin': undefined,
            'maintenanceMarginPercentage': undefined,
            'collateral': undefined,
            'initialMargin': undefined,
            'initialMarginPercentage': undefined,
            'leverage': undefined,
            'marginRatio': undefined,
            'stopLossPrice': undefined,
            'takeProfitPrice': undefined,
        });
    }
    /**
     * @method
     * @name oxfun#watchOrders
     * @description watches information on multiple orders made by the user
     * @see https://docs.ox.fun/?json#order-channel
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int|string} [params.tag] If given it will be echoed in the reply and the max size of tag is 32
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async watchOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        await this.authenticate();
        let messageHash = 'orders';
        let args = 'order:';
        const market = this.safeMarket(symbol);
        if (symbol === undefined) {
            args += 'all';
        }
        else {
            messageHash += ':' + symbol;
            args += ':' + market['id'];
        }
        const request = {
            'op': 'subscribe',
            'args': [
                args,
            ],
        };
        const url = this.urls['api']['ws'];
        const orders = await this.watch(url, messageHash, request, messageHash);
        if (this.newUpdates) {
            limit = orders.getLimit(symbol, limit);
        }
        return this.filterBySymbolSinceLimit(orders, symbol, since, limit, true);
    }
    handleOrders(client, message) {
        //
        //     {
        //         "table": "order",
        //         "data": [
        //             {
        //                 "accountId": "106464",
        //                 "clientOrderId": "1716713676233",
        //                 "orderId": "1000116921319",
        //                 "price": "1000.0",
        //                 "quantity": "0.01",
        //                 "amount": "0.0",
        //                 "side": "BUY",
        //                 "status": "OPEN",
        //                 "marketCode": "ETH-USD-SWAP-LIN",
        //                 "timeInForce": "MAKER_ONLY",
        //                 "timestamp": "1716713677834",
        //                 "remainQuantity": "0.01",
        //                 "limitPrice": "1000.0",
        //                 "notice": "OrderOpened",
        //                 "orderType": "LIMIT",
        //                 "isTriggered": "false",
        //                 "displayQuantity": "0.01"
        //             }
        //         ]
        //     }
        //
        const data = this.safeList(message, 'data', []);
        let messageHash = 'orders';
        if (this.orders === undefined) {
            const limit = this.safeInteger(this.options, 'ordersLimit', 1000);
            this.orders = new ArrayCacheBySymbolById(limit);
        }
        const orders = this.orders;
        for (let i = 0; i < data.length; i++) {
            const order = this.safeDict(data, i, {});
            const parsedOrder = this.parseOrder(order);
            orders.append(parsedOrder);
            messageHash += ':' + parsedOrder['symbol'];
            client.resolve(this.orders, messageHash);
        }
    }
    /**
     * @method
     * @name oxfun#createOrderWs
     * @see https://docs.ox.fun/?json#order-commands
     * @description create a trade order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market', 'limit', 'STOP_LIMIT' or 'STOP_MARKET'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.clientOrderId] a unique id for the order
     * @param {int} [params.timestamp] in milliseconds. If an order reaches the matching engine and the current timestamp exceeds timestamp + recvWindow, then the order will be rejected.
     * @param {int} [params.recvWindow] in milliseconds. If an order reaches the matching engine and the current timestamp exceeds timestamp + recvWindow, then the order will be rejected. If timestamp is provided without recvWindow, then a default recvWindow of 1000ms is used.
     * @param {float} [params.cost] the quote quantity that can be used as an alternative for the amount for market buy orders
     * @param {float} [params.triggerPrice] The price at which a trigger order is triggered at
     * @param {float} [params.limitPrice] Limit price for the STOP_LIMIT order
     * @param {bool} [params.postOnly] if true, the order will only be posted if it will be a maker order
     * @param {string} [params.timeInForce] GTC (default), IOC, FOK, PO, MAKER_ONLY or MAKER_ONLY_REPRICE (reprices order to the best maker only price if the specified price were to lead to a taker trade)
     * @param {string} [params.selfTradePreventionMode] NONE, EXPIRE_MAKER, EXPIRE_TAKER or EXPIRE_BOTH for more info check here {@link https://docs.ox.fun/?json#self-trade-prevention-modes}
     * @param {string} [params.displayQuantity] for an iceberg order, pass both quantity and displayQuantity fields in the order request
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createOrderWs(symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets();
        await this.authenticate();
        const messageHash = this.nonce().toString();
        const request = {
            'op': 'placeorder',
            'tag': messageHash,
        };
        params = this.omit(params, 'tag');
        const orderRequest = this.createOrderRequest(symbol, type, side, amount, price, params);
        const timestamp = this.safeInteger(orderRequest, 'timestamp');
        if (timestamp === undefined) {
            orderRequest['timestamp'] = this.milliseconds();
        }
        request['data'] = orderRequest;
        const url = this.urls['api']['ws'];
        return await this.watch(url, messageHash, request, messageHash);
    }
    /**
     * @method
     * @name oxfun#editOrderWs
     * @description edit a trade order
     * @see https://docs.ox.fun/?json#modify-order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of the currency you want to trade in units of the base currency
     * @param {float|undefined} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.timestamp] in milliseconds. If an order reaches the matching engine and the current timestamp exceeds timestamp + recvWindow, then the order will be rejected.
     * @param {int} [params.recvWindow] in milliseconds. If an order reaches the matching engine and the current timestamp exceeds timestamp + recvWindow, then the order will be rejected. If timestamp is provided without recvWindow, then a default recvWindow of 1000ms is used.
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async editOrderWs(id, symbol, type, side, amount = undefined, price = undefined, params = {}) {
        await this.loadMarkets();
        await this.authenticate();
        const messageHash = this.nonce().toString();
        const request = {
            'op': 'modifyorder',
            'tag': messageHash,
        };
        params = this.omit(params, 'tag');
        let orderRequest = this.createOrderRequest(symbol, type, side, amount, price, params);
        orderRequest = this.extend(orderRequest, { 'orderId': id });
        const timestamp = this.safeInteger(orderRequest, 'timestamp');
        if (timestamp === undefined) {
            orderRequest['timestamp'] = this.milliseconds();
        }
        request['data'] = orderRequest;
        const url = this.urls['api']['ws'];
        return await this.watch(url, messageHash, request, messageHash);
    }
    handlePlaceOrders(client, message) {
        //
        //     {
        //         "event": "placeorder",
        //         "submitted": true,
        //         "tag": "1716934577",
        //         "timestamp": "1716932973899",
        //         "data": {
        //             "marketCode": "ETH-USD-SWAP-LIN",
        //             "side": "BUY",
        //             "orderType": "LIMIT",
        //             "quantity": "0.010",
        //             "timeInForce": "GTC",
        //             "price": "400.0",
        //             "limitPrice": "400.0",
        //             "orderId": "1000117429736",
        //             "source": 13
        //         }
        //     }
        //
        //
        // Failure response format
        //     {
        //         "event": "placeorder",
        //         "submitted": false,
        //         "message": "JSON data format is invalid",
        //         "code": "20009",
        //         "timestamp": "1716932877381"
        //     }
        //
        const messageHash = this.safeString(message, 'tag');
        const submitted = this.safeBool(message, 'submitted');
        // filter out partial errors
        if (!submitted) {
            const method = this.safeString(message, 'event');
            const stringMsg = this.json(message);
            const code = this.safeInteger(message, 'code');
            this.handleErrors(code, undefined, client.url, method, undefined, stringMsg, message, undefined, undefined);
        }
        const data = this.safeValue(message, 'data', {});
        const order = this.parseOrder(data);
        client.resolve(order, messageHash);
    }
    /**
     * @method
     * @name oxfun#cancelOrderWs
     * @see https://docs.ox.fun/?json#cancel-order
     * @description cancels an open order
     * @param {string} id order id
     * @param {string} symbol unified market symbol, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelOrderWs(id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired(this.id + ' cancelOrderWs() requires a symbol argument');
        }
        await this.loadMarkets();
        await this.authenticate();
        const messageHash = this.nonce().toString();
        const data = {
            'marketCode': this.marketId(symbol),
            'orderId': id,
        };
        const request = {
            'op': 'cancelorder',
            'tag': messageHash,
            'data': data,
        };
        const url = this.urls['api']['ws'];
        return await this.watch(url, messageHash, request, messageHash);
    }
    /**
     * @method
     * @name oxfun#cancelOrdersWs
     * @see https://www.okx.com/docs-v5/en/#order-book-trading-trade-ws-mass-cancel-order
     * @description cancel multiple orders
     * @param {string[]} ids order ids
     * @param {string} symbol unified market symbol, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelOrdersWs(ids, symbol = undefined, params = {}) {
        const idsLength = ids.length;
        if (idsLength > 20) {
            throw new BadRequest(this.id + ' cancelOrdersWs() accepts up to 20 ids at a time');
        }
        if (symbol === undefined) {
            throw new ArgumentsRequired(this.id + ' cancelOrdersWs() requires a symbol argument');
        }
        await this.loadMarkets();
        await this.authenticate();
        const messageHash = this.nonce().toString();
        const marketId = this.marketId(symbol);
        const dataArray = [];
        for (let i = 0; i < idsLength; i++) {
            const data = {
                'instId': marketId,
                'ordId': ids[i],
            };
            dataArray.push(data);
        }
        const request = {
            'op': 'cancelorders',
            'tag': messageHash,
            'dataArray': dataArray,
        };
        const url = this.urls['api']['ws'];
        return await this.watch(url, messageHash, this.deepExtend(request, params), messageHash);
    }
    async authenticate(params = {}) {
        const url = this.urls['api']['ws'];
        const client = this.client(url);
        const messageHash = 'authenticated';
        const future = client.future(messageHash);
        const authenticated = this.safeDict(client.subscriptions, messageHash);
        if (authenticated === undefined) {
            this.checkRequiredCredentials();
            const timestamp = this.milliseconds();
            const payload = timestamp.toString() + 'GET/auth/self/verify';
            const signature = this.hmac(this.encode(payload), this.encode(this.secret), sha256, 'base64');
            const request = {
                'op': 'login',
                'data': {
                    'apiKey': this.apiKey,
                    'timestamp': timestamp,
                    'signature': signature,
                },
            };
            const message = this.extend(request, params);
            this.watch(url, messageHash, message, messageHash);
        }
        return await future;
    }
    handleAuthenticationMessage(client, message) {
        const authenticated = this.safeBool(message, 'success', false);
        const messageHash = 'authenticated';
        if (authenticated) {
            // we resolve the future here permanently so authentication only happens once
            const future = this.safeDict(client.futures, messageHash);
            future.resolve(true);
        }
        else {
            const error = new AuthenticationError(this.json(message));
            client.reject(error, messageHash);
            if (messageHash in client.subscriptions) {
                delete client.subscriptions[messageHash];
            }
        }
    }
    ping(client) {
        return 'ping';
    }
    handlePong(client, message) {
        client.lastPong = this.milliseconds();
        return message;
    }
    handleMessage(client, message) {
        if (message === 'pong') {
            this.handlePong(client, message);
            return;
        }
        const table = this.safeString(message, 'table');
        const data = this.safeList(message, 'data', []);
        const event = this.safeString(message, 'event');
        if ((table !== undefined) && (data !== undefined)) {
            if (table === 'trade') {
                this.handleTrades(client, message);
            }
            if (table === 'ticker') {
                this.handleTicker(client, message);
            }
            if (table.indexOf('candles') > -1) {
                this.handleOHLCV(client, message);
            }
            if (table.indexOf('depth') > -1) {
                this.handleOrderBook(client, message);
            }
            if (table.indexOf('balance') > -1) {
                this.handleBalance(client, message);
            }
            if (table.indexOf('position') > -1) {
                this.handlePositions(client, message);
            }
            if (table.indexOf('order') > -1) {
                this.handleOrders(client, message);
            }
            if (table === 'bestBidAsk') {
                this.handleBidAsk(client, message);
            }
        }
        else {
            if (event === 'login') {
                this.handleAuthenticationMessage(client, message);
            }
            if ((event === 'placeorder') || (event === 'modifyorder') || (event === 'cancelorder')) {
                this.handlePlaceOrders(client, message);
            }
        }
    }
}
