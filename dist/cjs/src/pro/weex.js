'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var weex$1 = require('../weex.js');
var errors = require('../base/errors.js');
var sha256 = require('../static_dependencies/noble-hashes/sha256.js');
var Cache = require('../base/ws/Cache.js');

// ----------------------------------------------------------------------------
//  ---------------------------------------------------------------------------
class weex extends weex$1["default"] {
    describe() {
        return this.deepExtend(super.describe(), {
            'has': {
                'watchBalance': true,
                'watchBidsAsks': true,
                'watchMyTrades': true,
                'watchOHLCV': true,
                'watchOHLCVForSymbols': true,
                'watchOrderBook': false,
                'watchOrderBookForSymbols': false,
                'watchOrders': true,
                'watchPositions': true,
                'watchTicker': true,
                'watchTickers': true,
                'watchTrades': true,
                'watchTradesForSymbols': true,
                'unWatchBidsAsks': true,
                'unWatchMyTrades': true,
                'unWatchOHLCV': true,
                'unWatchOHLCVForSymbols': true,
                'unWatchOrderBook': false,
                'unWatchOrderBookForSymbols': false,
                'unWatchOrders': true,
                'unWatchPositions': true,
                'unWatchTicker': true,
                'unWatchTickers': true,
                'unWatchTrades': true,
                'unWatchTradesForSymbols': true,
            },
            'urls': {
                'api': {
                    'ws': {
                        'spot': 'wss://ws-spot.weex.com/v3/ws',
                        'contract': 'wss://ws-contract.weex.com/v3/ws',
                    },
                },
            },
            'options': {
                'ws': {
                    'options': {
                        'headers': {
                            'User-Agent': 'ccxt', // the exchange requires headers
                        },
                    },
                },
                'watchOHLCV': {
                    'priceType': 'LAST_PRICE', // or 'MARK_PRICE' for swap markets
                },
                'watchOHLCVForSymbols': {
                    'priceType': 'LAST_PRICE', // or 'MARK_PRICE' for swap markets
                },
                'watchOrderBook': {
                    'depth': '200', // or '15'
                },
                'watchOrderBookForSymbols': {
                    'depth': '200', // or '15'
                },
                'watchBalance': {
                    'fetchBalanceSnapshot': true,
                    'awaitBalanceSnapshot': true,
                },
                'watchPositions': {
                    'fetchPositionsSnapshot': true,
                    'awaitPositionsSnapshot': true,
                },
            },
            'streaming': {},
        });
    }
    requestId() {
        this.lockId();
        const requestId = this.sum(this.safeInteger(this.options, 'requestId', 0), 1);
        this.options['requestId'] = requestId;
        this.unlockId();
        return this.numberToString(requestId);
    }
    async subscribePublic(messageHashes, channels, isContract = false, params = {}, subscription = {}) {
        const id = this.requestId();
        let method = 'SUBSCRIBE';
        const unsubscribe = this.safeBool(subscription, 'unsubscribe', false);
        if (unsubscribe) {
            method = 'UNSUBSCRIBE';
        }
        const message = {
            'id': id,
            'method': method,
            'params': channels,
        };
        subscription = this.extend(subscription, { 'id': id });
        const type = isContract ? 'contract' : 'spot';
        const url = this.urls['api']['ws'][type] + '/public';
        return await this.watchMultiple(url, messageHashes, this.deepExtend(message, params), messageHashes, subscription);
    }
    async subscribePrivate(messageHash, subscribeHash, channel, isContract = false, params = {}, subscription = {}) {
        const type = isContract ? 'contract' : 'spot';
        const url = this.urls['api']['ws'][type] + '/private';
        this.authenticate(url);
        let method = 'SUBSCRIBE';
        const unsubscribe = this.safeBool(subscription, 'unsubscribe', false);
        if (unsubscribe) {
            method = 'UNSUBSCRIBE';
        }
        const id = this.requestId();
        const message = {
            'id': id,
            'method': method,
            'params': [channel],
        };
        subscription = this.extend(subscription, { 'id': id });
        return await this.watch(url, messageHash, this.deepExtend(message, params), subscribeHash, subscription);
    }
    authenticate(url) {
        this.checkRequiredCredentials();
        if ((this.clients !== undefined) && (url in this.clients)) {
            return;
        }
        const timestamp = this.nonce();
        const payload = timestamp.toString() + '/v3/ws/private';
        const signature = this.hmac(this.encode(payload), this.encode(this.secret), sha256.sha256, 'base64');
        const originalHeaders = this.options['ws']['options']['headers'];
        const userAgent = this.safeString(originalHeaders, 'User-Agent', 'ccxt');
        const extendedOptions = {
            'ws': {
                'options': {
                    'headers': {
                        'User-Agent': userAgent,
                        'ACCESS-KEY': this.apiKey,
                        'ACCESS-SIGN': signature,
                        'ACCESS-PASSPHRASE': this.password,
                        'ACCESS-TIMESTAMP': this.numberToString(timestamp),
                    },
                },
            },
        };
        this.extendExchangeOptions(extendedOptions);
        // instantiate client
        this.client(url);
        // return headers to original state
        const defaultOptions = {
            'ws': {
                'options': {
                    'headers': {
                        'User-Agent': userAgent,
                    },
                },
            },
        };
        this.extendExchangeOptions(defaultOptions);
    }
    /**
     * @method
     * @name weex#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://www.weex.com/api-doc/spot/Websocket/public/Tickers-Channel
     * @see https://www.weex.com/api-doc/contract/Websocket/public/Tickers-Channel
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.name] stream to use can be ticker or miniTicker
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    async watchTicker(symbol, params = {}) {
        await this.loadMarkets();
        symbol = this.symbol(symbol);
        const tickers = await this.watchTickers([symbol], params);
        return tickers[symbol];
    }
    /**
     * @method
     * @name weex#watchTickers
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @see https://www.weex.com/api-doc/spot/Websocket/public/Tickers-Channel
     * @see https://www.weex.com/api-doc/contract/Websocket/public/Tickers-Channel
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    async watchTickers(symbols = undefined, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols, undefined, false, true);
        const firstMarket = this.getMarketFromSymbols(symbols);
        const isContract = firstMarket['contract'];
        const topic = 'ticker';
        const messageHashes = [];
        const channels = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const market = this.market(symbol);
            const channelName = market['id'] + '@' + topic;
            const messageHash = topic + '::' + symbol;
            messageHashes.push(messageHash);
            channels.push(channelName);
        }
        const newTicker = await this.subscribePublic(messageHashes, channels, isContract, params);
        if (this.newUpdates) {
            const result = {};
            result[newTicker['symbol']] = newTicker;
            return result;
        }
        return this.filterByArray(this.tickers, 'symbol', symbols);
    }
    /**
     * @method
     * @name weex#unWatchTicker
     * @description unWatches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @see https://www.weex.com/api-doc/spot/Websocket/public/Tickers-Channel
     * @see https://www.weex.com/api-doc/contract/Websocket/public/Tickers-Channel
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    async unWatchTicker(symbol, params = {}) {
        return await this.unWatchTickers([symbol], params);
    }
    /**
     * @method
     * @name weex#unWatchTickers
     * @description unWatches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @see https://www.weex.com/api-doc/spot/Websocket/public/Tickers-Channel
     * @see https://www.weex.com/api-doc/contract/Websocket/public/Tickers-Channel
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    async unWatchTickers(symbols = undefined, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols, undefined, false, true);
        const firstMarket = this.getMarketFromSymbols(symbols);
        const isContract = firstMarket['contract'];
        const topic = 'ticker';
        const subHashes = [];
        const channels = [];
        const unSubHashes = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const market = this.market(symbol);
            const channelName = market['id'] + '@' + topic;
            const messageHash = topic + '::' + symbol;
            const unSubMessageHash = 'unsubscribe::' + messageHash;
            subHashes.push(messageHash);
            channels.push(channelName);
            unSubHashes.push(unSubMessageHash);
        }
        const subscription = {
            'unsubscribe': true,
            'symbols': symbols,
            'messageHashes': unSubHashes,
            'subMessageHashes': subHashes,
            'topic': topic,
        };
        return await this.subscribePublic(unSubHashes, channels, isContract, params, subscription);
    }
    handleTicker(client, message) {
        //
        //     {
        //         "e": "ticker",
        //         "E": 1776081628845,
        //         "s": "ETHUSDT",
        //         "d": [
        //             {
        //                 "p": "-18.93",
        //                 "P": "-0.008592",
        //                 "w": "2192.40298388",
        //                 "c": "2184.20",
        //                 "o": "2203.13",
        //                 "h": "2217.34",
        //                 "l": "2173.32",
        //                 "v": "359395.800",
        //                 "q": "787940424.31399",
        //                 "O": 1775995200000,
        //                 "C": 1776081600000,
        //                 "n": 485169,
        //                 "m": "2184.28",
        //                 "i": "2185.2025"
        //             }
        //         ]
        //     }
        //
        const market = this.getMarketFromClientAndMessage(client, message);
        const tickers = this.safeList(message, 'd', []);
        const data = this.safeDict(tickers, 0, {});
        const ticker = this.parseWsTicker(data, market);
        const symbol = market['symbol'];
        const messageHash = 'ticker::' + symbol;
        this.tickers[symbol] = ticker;
        client.resolve(this.tickers[symbol], messageHash);
    }
    parseWsTicker(ticker, market = undefined) {
        //
        //     {
        //         "p": "-18.93",
        //         "P": "-0.008592",
        //         "w": "2192.40298388",
        //         "c": "2184.20",
        //         "o": "2203.13",
        //         "h": "2217.34",
        //         "l": "2173.32",
        //         "v": "359395.800",
        //         "q": "787940424.31399",
        //         "O": 1775995200000,
        //         "C": 1776081600000,
        //         "n": 485169,
        //         "m": "2184.28",
        //         "i": "2185.2025"
        //     }
        //
        const timestamp = this.safeInteger(ticker, 'C');
        const close = this.safeString(ticker, 'c');
        return this.safeTicker({
            'symbol': market['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'high': this.safeString(ticker, 'h'),
            'low': this.safeString(ticker, 'l'),
            'bid': this.safeString(ticker, 'b'),
            'bidVolume': this.safeString(ticker, 'B'),
            'ask': this.safeString(ticker, 'a'),
            'askVolume': this.safeString(ticker, 'A'),
            'vwap': this.safeString(ticker, 'w'),
            'open': this.safeString(ticker, 'o'),
            'close': close,
            'last': close,
            'previousClose': this.safeString(ticker, 'x'),
            'change': this.safeString(ticker, 'p'),
            'percentage': this.safeString(ticker, 'P'),
            'average': this.safeString(ticker, 'w'),
            'baseVolume': this.safeString(ticker, 'v'),
            'quoteVolume': this.safeString(ticker, 'q'),
            'markPrice': this.safeString(ticker, 'm'),
            'indexPrice': this.safeString(ticker, 'i'),
            'info': ticker,
        }, market);
    }
    /**
     * @method
     * @name weex#watchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://www.weex.com/api-doc/spot/Websocket/public/Trades-Channel
     * @see https://www.weex.com/api-doc/contract/Websocket/public/Trades-Channel
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    async watchTrades(symbol, since = undefined, limit = undefined, params = {}) {
        return await this.watchTradesForSymbols([symbol], since, limit, params);
    }
    /**
     * @method
     * @name weex#watchTradesForSymbols
     * @description get the list of most recent trades for a list of symbols
     * @see https://www.weex.com/api-doc/spot/Websocket/public/Trades-Channel
     * @see https://www.weex.com/api-doc/contract/Websocket/public/Trades-Channel
     * @param {string[]} symbols unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    async watchTradesForSymbols(symbols, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols, undefined, false, true);
        const firstMarket = this.getMarketFromSymbols(symbols);
        const isContract = firstMarket['contract'];
        const topic = 'trade';
        const messageHashes = [];
        const channels = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const market = this.market(symbol);
            const channelName = market['id'] + '@' + topic;
            const messageHash = topic + '::' + symbol;
            messageHashes.push(messageHash);
            channels.push(channelName);
        }
        const trades = await this.subscribePublic(messageHashes, channels, isContract, params);
        if (this.newUpdates) {
            const first = this.safeValue(trades, 0);
            const tradeSymbol = this.safeString(first, 'symbol');
            limit = trades.getLimit(tradeSymbol, limit);
        }
        return this.filterBySinceLimit(trades, since, limit, 'timestamp', true);
    }
    /**
     * @method
     * @name weex#unWatchTrades
     * @description unsubscribes from the trades channel
     * @see https://www.weex.com/api-doc/spot/Websocket/public/Trades-Channel
     * @see https://www.weex.com/api-doc/contract/Websocket/public/Trades-Channel
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    async unWatchTrades(symbol, params = {}) {
        await this.loadMarkets();
        return await this.unWatchTradesForSymbols([symbol], params);
    }
    /**
     * @method
     * @name weex#unWatchTradesForSymbols
     * @description unsubscribes from the trades channel
     * @see https://www.weex.com/api-doc/spot/Websocket/public/Trades-Channel
     * @see https://www.weex.com/api-doc/contract/Websocket/public/Trades-Channel
     * @param {string[]} symbols unified symbol of the market to fetch trades for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    async unWatchTradesForSymbols(symbols, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols, undefined, false, true);
        const firstMarket = this.getMarketFromSymbols(symbols);
        const isContract = firstMarket['contract'];
        const topic = 'trade';
        const subHashes = [];
        const channels = [];
        const unSubHashes = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const market = this.market(symbol);
            const channelName = market['id'] + '@' + topic;
            const messageHash = topic + '::' + symbol;
            const unSubMessageHash = 'unsubscribe::' + messageHash;
            subHashes.push(messageHash);
            channels.push(channelName);
            unSubHashes.push(unSubMessageHash);
        }
        const subscription = {
            'unsubscribe': true,
            'symbols': symbols,
            'messageHashes': unSubHashes,
            'subMessageHashes': subHashes,
            'topic': 'trades',
        };
        return await this.subscribePublic(unSubHashes, channels, isContract, params, subscription);
    }
    handleTrade(client, message) {
        //
        //     {
        //         "e": "trade",
        //         "E": 1776104608321,
        //         "s": "ETHUSDT",
        //         "d": [
        //             {
        //                 "T": 1776104608298,
        //                 "t": "41099265-7985-4f4c-af93-2cc3bc1cf13b",
        //                 "p": "2225.15",
        //                 "q": "0.02525",
        //                 "v": "56.1850375",
        //                 "m": false
        //             }
        //         ]
        //     }
        //
        const market = this.getMarketFromClientAndMessage(client, message);
        const symbol = market['symbol'];
        const messageHash = 'trade::' + symbol;
        if (!(symbol in this.trades)) {
            const limit = this.safeInteger(this.options, 'tradesLimit', 1000);
            this.trades[symbol] = new Cache.ArrayCache(limit);
        }
        const tradesArray = this.trades[symbol];
        const data = this.safeList(message, 'd', []);
        const newTrades = [];
        for (let i = 0; i < data.length; i++) {
            const rawTrade = this.safeDict(data, i, {});
            const trade = this.parseWsTrade(rawTrade, market);
            newTrades.push(trade);
        }
        const sorted = this.sortBy(newTrades, 'timestamp');
        for (let j = 0; j < sorted.length; j++) {
            const sortedTrade = sorted[j];
            tradesArray.append(sortedTrade);
        }
        this.trades[symbol] = tradesArray;
        client.resolve(tradesArray, messageHash);
    }
    parseWsTrade(trade, market = undefined) {
        //
        //     {
        //         "T": 1776089287762,
        //         "t": "df4d1af1-71e8-400d-9571-f2cee2e6bea8",
        //         "p": "2203.73",
        //         "q": "7.214",
        //         "v": "15897.70822",
        //         "m": false
        //     }
        //
        const timestamp = this.safeInteger(trade, 'T');
        return this.safeTrade({
            'info': trade,
            'id': this.safeString(trade, 't'),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'symbol': market['symbol'],
            'order': undefined,
            'type': undefined,
            'side': undefined,
            'takerOrMaker': undefined,
            'price': this.safeString(trade, 'p'),
            'amount': this.safeString(trade, 'q'),
            'cost': this.safeString(trade, 'v'),
            'fee': undefined,
        }, market);
    }
    /**
     * @method
     * @name weex#watchOHLCV
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://www.weex.com/api-doc/spot/Websocket/public/Candlesticks-Channel
     * @see https://www.weex.com/api-doc/contract/Websocket/public/Candlesticks-Channel
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async watchOHLCV(symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        const extendedParams = this.extend(params, {
            'callerMethodName': 'watchOHLCV',
        });
        const result = await this.watchOHLCVForSymbols([[symbol, timeframe]], since, limit, extendedParams);
        return result[symbol][timeframe];
    }
    /**
     * @method
     * @name weex#watchOHLCVForSymbols
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://www.weex.com/api-doc/spot/Websocket/public/Candlesticks-Channel
     * @see https://www.weex.com/api-doc/contract/Websocket/public/Candlesticks-Channel
     * @param {string[][]} symbolsAndTimeframes array of arrays containing unified symbols and timeframes to fetch OHLCV data for, example [['BTC/USDT', '1m'], ['LTC/USDT', '5m']]
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async watchOHLCVForSymbols(symbolsAndTimeframes, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const callerMethodName = this.safeString(params, 'callerMethodName', 'watchOHLCVForSymbols');
        params = this.omit(params, 'callerMethodName');
        const channels = [];
        const messageHashes = [];
        const firstEntry = this.safeList(symbolsAndTimeframes, 0, []);
        const firstSymbol = this.safeString(firstEntry, 0);
        const firstMarket = this.market(firstSymbol);
        const isContract = firstMarket['contract'];
        let priceType = 'LAST_PRICE';
        if (isContract) {
            [priceType, params] = this.handleOptionAndParams2(params, callerMethodName, 'price', 'priceType', priceType);
        }
        for (let i = 0; i < symbolsAndTimeframes.length; i++) {
            const data = this.safeList(symbolsAndTimeframes, i);
            let symbolString = this.safeString(data, 0);
            const market = this.market(symbolString);
            if (market['type'] !== firstMarket['type']) {
                throw new errors.BadRequest(this.id + ' ' + callerMethodName + ' market symbols must be of the same type');
            }
            symbolString = market['symbol'];
            const unifiedTimeframe = this.safeString(data, 1, '1');
            const interval = this.safeString(this.timeframes, unifiedTimeframe, unifiedTimeframe);
            const channel = market['id'] + '@kline_' + interval + '_' + priceType;
            const messageHash = 'ohlcv::' + symbolString + '::' + unifiedTimeframe;
            channels.push(channel);
            messageHashes.push(messageHash);
        }
        const [symbol, timeframe, stored] = await this.subscribePublic(messageHashes, channels, isContract, params);
        if (this.newUpdates) {
            limit = stored.getLimit(symbol, limit);
        }
        const filtered = this.filterBySinceLimit(stored, since, limit, 0, true);
        return this.createOHLCVObject(symbol, timeframe, filtered);
    }
    /**
     * @method
     * @name weex#unWatchOHLCV
     * @description unWatches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://www.weex.com/api-doc/spot/Websocket/public/Candlesticks-Channel
     * @see https://www.weex.com/api-doc/contract/Websocket/public/Candlesticks-Channel
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async unWatchOHLCV(symbol, timeframe = '1m', params = {}) {
        params['callerMethodName'] = 'unWatchOHLCV';
        return await this.unWatchOHLCVForSymbols([[symbol, timeframe]], params);
    }
    /**
     * @method
     * @name weex#unWatchOHLCVForSymbols
     * @description unWatches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://www.weex.com/api-doc/spot/Websocket/public/Candlesticks-Channel
     * @see https://www.weex.com/api-doc/contract/Websocket/public/Candlesticks-Channel
     * @param {string[][]} symbolsAndTimeframes array of arrays containing unified symbols and timeframes to fetch OHLCV data for, example [['BTC/USDT', '1m'], ['LTC/USDT', '5m']]
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async unWatchOHLCVForSymbols(symbolsAndTimeframes, params = {}) {
        await this.loadMarkets();
        const callerMethodName = this.safeString(params, 'callerMethodName', 'unWatchOHLCVForSymbols');
        params = this.omit(params, 'callerMethodName');
        const channels = [];
        const subHashes = [];
        const unSubHashes = [];
        const firstEntry = this.safeList(symbolsAndTimeframes, 0, []);
        const firstSymbol = this.safeString(firstEntry, 0);
        const firstMarket = this.market(firstSymbol);
        const isContract = firstMarket['contract'];
        let priceType = 'LAST_PRICE';
        if (isContract) {
            [priceType, params] = this.handleOptionAndParams2(params, callerMethodName, 'price', 'priceType', priceType);
        }
        for (let i = 0; i < symbolsAndTimeframes.length; i++) {
            const data = this.safeList(symbolsAndTimeframes, i);
            let symbolString = this.safeString(data, 0);
            const market = this.market(symbolString);
            if (market['type'] !== firstMarket['type']) {
                throw new errors.BadRequest(this.id + ' ' + callerMethodName + ' market symbols must be of the same type');
            }
            symbolString = market['symbol'];
            const unifiedTimeframe = this.safeString(data, 1, '1');
            const interval = this.safeString(this.timeframes, unifiedTimeframe, unifiedTimeframe);
            const channel = market['id'] + '@kline_' + interval + '_' + priceType;
            const messageHash = 'ohlcv::' + symbolString + '::' + unifiedTimeframe;
            const unSubMessageHash = 'unsubscribe::' + messageHash;
            channels.push(channel);
            subHashes.push(messageHash);
            unSubHashes.push(unSubMessageHash);
        }
        const subscription = {
            'unsubscribe': true,
            'symbolsAndTimeframes': symbolsAndTimeframes,
            'messageHashes': unSubHashes,
            'subMessageHashes': subHashes,
            'topic': 'ohlcv',
        };
        return await this.subscribePublic(unSubHashes, channels, isContract, params, subscription);
    }
    handleOHLCV(client, message) {
        //
        //     {
        //         e: 'kline',
        //         E: 1776095535012,
        //         s: 'ETHUSDT',
        //         p: 'LAST_PRICE',
        //         d: [
        //             {
        //                 t: 1776092400000,
        //                 T: 1776096000000,
        //                 s: 'ETHUSDT',
        //                 i: '1h',
        //                 o: '2234.18',
        //                 c: '2205.15',
        //                 h: '2236.43',
        //                 l: '2199.53',
        //                 v: '12505.60574',
        //                 n: 3381,
        //                 q: '27682528.6655305',
        //                 V: '6420.47929',
        //                 Q: '14213680.1906424'
        //             }
        //         ]
        //     }
        //
        const market = this.getMarketFromClientAndMessage(client, message);
        const symbol = market['symbol'];
        if (!(symbol in this.ohlcvs)) {
            this.ohlcvs[symbol] = {};
        }
        const data = this.safeList(message, 'd', []);
        const firstEntry = this.safeDict(data, 0, {});
        const interval = this.safeString(firstEntry, 'i');
        const timeframe = this.findTimeframe(interval);
        if (!(timeframe in this.ohlcvs[symbol])) {
            const limit = this.safeInteger(this.options, 'OHLCVLimit', 1000);
            this.ohlcvs[symbol][timeframe] = new Cache.ArrayCacheByTimestamp(limit);
        }
        const stored = this.ohlcvs[symbol][timeframe];
        for (let i = 0; i < data.length; i++) {
            const entry = this.safeDict(data, i, {});
            const parsed = this.parseWsOHLCV(entry);
            stored.append(parsed);
        }
        const messageHash = 'ohlcv::' + symbol + '::' + timeframe;
        const resolveData = [symbol, timeframe, stored];
        client.resolve(resolveData, messageHash);
    }
    parseWsOHLCV(ohlcv, market = undefined) {
        //
        //     {
        //         t: 1776092400000,
        //         T: 1776096000000,
        //         s: 'ETHUSDT',
        //         i: '1h',
        //         o: '2234.18',
        //         c: '2205.15',
        //         h: '2236.43',
        //         l: '2199.53',
        //         v: '12505.60574',
        //         n: 3381,
        //         q: '27682528.6655305',
        //         V: '6420.47929',
        //         Q: '14213680.1906424'
        //     }
        //
        return [
            this.safeInteger(ohlcv, 't'),
            this.safeNumber(ohlcv, 'o'),
            this.safeNumber(ohlcv, 'h'),
            this.safeNumber(ohlcv, 'l'),
            this.safeNumber(ohlcv, 'c'),
            this.safeNumber(ohlcv, 'v'),
        ];
    }
    /**
     * @method
     * @name weex#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://www.weex.com/api-doc/spot/Websocket/public/Depth-Channel
     * @see https://www.weex.com/api-doc/contract/Websocket/public/Depth-Channel
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure} indexed by market symbols
     */
    async watchOrderBook(symbol, limit = undefined, params = {}) {
        params = this.extend(params, {
            'callerMethodName': 'watchOrderBook',
        });
        return await this.watchOrderBookForSymbols([symbol], limit, params);
    }
    /**
     * @method
     * @name weex#watchOrderBookForSymbols
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://www.weex.com/api-doc/spot/Websocket/public/Depth-Channel
     * @see https://www.weex.com/api-doc/contract/Websocket/public/Depth-Channel
     * @param {string[]} symbols unified array of symbols
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure} indexed by market symbols
     */
    async watchOrderBookForSymbols(symbols, limit = undefined, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols, undefined, false, true);
        const firstMarket = this.getMarketFromSymbols(symbols);
        const isContract = firstMarket['contract'];
        const callerMethodName = this.safeString(params, 'callerMethodName', 'watchOrderBookForSymbols');
        params = this.omit(params, 'callerMethodName');
        let depth = '200';
        [depth, params] = this.handleOptionAndParams(params, callerMethodName, 'depth', depth);
        const messageHashes = [];
        const channels = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const market = this.market(symbol);
            const messageHash = 'orderbook::' + symbol;
            const channel = market['id'] + '@depth' + depth;
            messageHashes.push(messageHash);
            channels.push(channel);
        }
        const subscription = {
            'limit': limit,
        };
        const orderbook = await this.subscribePublic(messageHashes, channels, isContract, params, subscription);
        return orderbook.limit();
    }
    /**
     * @method
     * @name weex#unWatchOrderBook
     * @description unWatches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://www.weex.com/api-doc/spot/Websocket/public/Depth-Channel
     * @see https://www.weex.com/api-doc/contract/Websocket/public/Depth-Channel
     * @param {string} symbol unified array of symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure} indexed by market symbols
     */
    async unWatchOrderBook(symbol, params = {}) {
        params = this.extend(params, {
            'callerMethodName': 'unWatchOrderBook',
        });
        return await this.unWatchOrderBookForSymbols([symbol], params);
    }
    /**
     * @method
     * @name weex#unWatchOrderBookForSymbols
     * @description unWatches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://www.weex.com/api-doc/spot/Websocket/public/Depth-Channel
     * @see https://www.weex.com/api-doc/contract/Websocket/public/Depth-Channel
     * @param {string[]} symbols unified array of symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure} indexed by market symbols
     */
    async unWatchOrderBookForSymbols(symbols, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols, undefined, false, true);
        const firstMarket = this.getMarketFromSymbols(symbols);
        const isContract = firstMarket['contract'];
        const callerMethodName = this.safeString(params, 'callerMethodName', 'unWatchOrderBookForSymbols');
        params = this.omit(params, 'callerMethodName');
        let depth = '200';
        [depth, params] = this.handleOptionAndParams(params, callerMethodName, 'depth', depth);
        const subHashes = [];
        const channels = [];
        const unSubHashes = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const market = this.market(symbol);
            const messageHash = 'orderbook::' + symbol;
            const channel = market['id'] + '@depth' + depth;
            const unSubMessageHash = 'unsubscribe::' + messageHash;
            subHashes.push(messageHash);
            channels.push(channel);
            unSubHashes.push(unSubMessageHash);
        }
        const subscription = {
            'unsubscribe': true,
            'symbols': symbols,
            'messageHashes': unSubHashes,
            'subMessageHashes': subHashes,
            'topic': 'orderbook',
        };
        return await this.subscribePublic(unSubHashes, channels, isContract, params, subscription);
    }
    handleOrderBook(client, message) {
        //
        //     {
        //         "e": "depth",
        //         "E": 1776098967972,
        //         "s": "ETHUSDT",
        //         "U": 14181847790,
        //         "u": 14181847802,
        //         "l": 200,
        //         "d": "CHANGED",
        //         "b": [ [ "2227.21", "0" ], [ "2227.20", "46.519" ] ],
        //         "a": [ [ "2227.21", "44.092" ], [ "2227.26", "0" ] ]
        //     }
        //
        const market = this.getMarketFromClientAndMessage(client, message);
        const symbol = market['symbol'];
        const messageHash = 'orderbook::' + symbol;
        if (!(symbol in this.orderbooks)) {
            const subscription = this.safeDict(client.subscriptions, messageHash, {});
            const limit = this.safeInteger(subscription, 'limit');
            if (limit !== undefined) {
                this.orderbooks[symbol] = this.orderBook({}, limit);
            }
            else {
                this.orderbooks[symbol] = this.orderBook({});
            }
        }
        const orderbook = this.orderbooks[symbol];
        const timestamp = this.safeInteger(message, 'E');
        const event = this.safeString(message, 'e');
        const nonce = this.safeInteger(message, 'u');
        if (event === 'depthSnapshot') {
            const parsed = this.parseOrderBook(message, symbol, timestamp, 'b', 'a');
            parsed['nonce'] = nonce;
            orderbook.reset(parsed);
        }
        else {
            const asks = this.safeList(message, 'a', []);
            const bids = this.safeList(message, 'b', []);
            this.handleDeltas(orderbook['asks'], asks);
            this.handleDeltas(orderbook['bids'], bids);
            orderbook['timestamp'] = timestamp;
            orderbook['datetime'] = this.iso8601(timestamp);
            orderbook['nonce'] = nonce;
        }
        client.resolve(orderbook, messageHash);
    }
    handleDelta(bookside, delta) {
        const bidAsk = this.parseBidAsk(delta);
        bookside.storeArray(bidAsk);
    }
    /**
     * @method
     * @name weex#watchBidsAsks
     * @description watches best bid & ask for spot symbols
     * @see https://www.weex.com/api-doc/spot/Websocket/public/BookTicker-Channel
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchBidsAsks(symbols = undefined, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols, undefined, false, true);
        const firstMarket = this.getMarketFromSymbols(symbols);
        if (firstMarket['contract']) {
            throw new errors.NotSupported(this.id + ' watchBidsAsks is supported for spot markets only');
        }
        const messageHashes = [];
        const channels = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const market = this.market(symbol);
            const channelName = market['id'] + '@' + 'bookTicker';
            const messageHash = 'bidask::' + symbol;
            messageHashes.push(messageHash);
            channels.push(channelName);
        }
        const newTicker = await this.subscribePublic(messageHashes, channels, false, params);
        if (this.newUpdates) {
            const result = {};
            result[newTicker['symbol']] = newTicker;
            return result;
        }
        return this.filterByArray(this.bidsasks, 'symbol', symbols);
    }
    /**
     * @method
     * @name weex#unWatchBidsAsks
     * @description unWatches best bid & ask for spot symbols
     * @see https://www.weex.com/api-doc/spot/Websocket/public/BookTicker-Channel
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async unWatchBidsAsks(symbols = undefined, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols, undefined, false, true);
        const firstMarket = this.getMarketFromSymbols(symbols);
        if (firstMarket['contract']) {
            throw new errors.NotSupported(this.id + ' unWatchBidsAsks is supported for spot markets only');
        }
        const subHashes = [];
        const channels = [];
        const unSubHashes = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const market = this.market(symbol);
            const channelName = market['id'] + '@' + 'bookTicker';
            const messageHash = 'bidask::' + symbol;
            const unSubMessageHash = 'unsubscribe::' + messageHash;
            subHashes.push(messageHash);
            channels.push(channelName);
            unSubHashes.push(unSubMessageHash);
        }
        const subscription = {
            'unsubscribe': true,
            'symbols': symbols,
            'messageHashes': unSubHashes,
            'subMessageHashes': subHashes,
            'topic': 'bidsasks',
        };
        return await this.subscribePublic(unSubHashes, channels, false, params, subscription);
    }
    handleBidAsk(client, message) {
        //
        //     {
        //         "e": "bookTicker",
        //         "E": 1776103547551,
        //         "s": "ETHUSDT",
        //         "u": 1776103547547,
        //         "b": "2227.39",
        //         "B": "1.05512",
        //         "a": "2227.40",
        //         "A": "6.30889"
        //     }
        //
        const market = this.getMarketFromClientAndMessage(client, message);
        const ticker = this.parseWsBidAsk(message, market);
        const symbol = ticker['symbol'];
        this.bidsasks[symbol] = ticker;
        const messageHash = 'bidask::' + symbol;
        client.resolve(ticker, messageHash);
    }
    parseWsBidAsk(message, market = undefined) {
        const timestamp = this.safeInteger(message, 'E');
        return this.safeTicker({
            'symbol': market['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'ask': this.safeString(message, 'a'),
            'askVolume': this.safeString(message, 'A'),
            'bid': this.safeString(message, 'b'),
            'bidVolume': this.safeString(message, 'B'),
            'info': message,
        }, market);
    }
    /**
     * @method
     * @name weex#watchMyTrades
     * @description watches information on multiple trades made by the user
     * @see https://www.weex.com/api-doc/spot/Websocket/private/Fill-Channel
     * @see https://www.weex.com/api-doc/contract/Websocket/private/Fill-Channel
     * @param {string} symbol unified market symbol of the market trades were made in
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] spot or swap, default is spot if symbol is not provided
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    async watchMyTrades(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let marketType = undefined;
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            symbol = market['symbol'];
        }
        [marketType, params] = this.handleMarketTypeAndParams('watchMyTrades', market, params);
        const isContract = (marketType !== 'spot');
        let messageHash = isContract ? 'myContractTrades' : 'myTrades';
        const subscriptionHash = messageHash;
        if (symbol !== undefined) {
            messageHash += '::' + symbol;
        }
        const channel = 'fill';
        const trades = await this.subscribePrivate(messageHash, subscriptionHash, channel, isContract, params);
        if (this.newUpdates) {
            limit = trades.getLimit(symbol, limit);
        }
        return this.filterBySymbolSinceLimit(trades, symbol, since, limit, true);
    }
    /**
     * @method
     * @name weex#unWatchMyTrades
     * @description unWatches information on multiple trades made by the user
     * @see https://www.weex.com/api-doc/spot/Websocket/private/Fill-Channel
     * @see https://www.weex.com/api-doc/contract/Websocket/private/Fill-Channel
     * @param {string} [symbol] not used by the exchange
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] spot or swap, default is spot
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async unWatchMyTrades(symbol = undefined, params = {}) {
        if (symbol !== undefined) {
            throw new errors.NotSupported(this.id + ' unWatchMyTrades does not support a symbol argument. Unsubscribing from myTrades is global for all symbols.');
        }
        let marketType = undefined;
        [marketType, params] = this.handleMarketTypeAndParams('unWatchMyTrades', undefined, params);
        const isContract = (marketType !== 'spot');
        const subHash = isContract ? 'myContractTrades' : 'myTrades';
        const unSubHash = 'unsubscribe::' + subHash;
        const channel = 'fill';
        const subscription = {
            'unsubscribe': true,
            'messageHashes': [unSubHash],
            'subMessageHashes': [subHash],
            'topic': 'myTrades',
            'subHashIsPrefix': true,
        };
        return await this.subscribePrivate(unSubHash, unSubHash, channel, isContract, params, subscription);
    }
    handleMyTrades(client, message) {
        //
        // spot
        //     {
        //         e: 'fill',
        //         E: 1776174283564,
        //         v: 83,
        //         msgEvent: 'OrderUpdate',
        //         d: [
        //             {
        //                 id: '738928502249620072',
        //                 symbol: 'DOGEUSDT',
        //                 baseCoin: 'DOGE',
        //                 quoteCoin: 'USDT',
        //                 orderId: '738928502174122600',
        //                 orderSide: 'SELL',
        //                 fillSize: '200.0',
        //                 fillValue: '19.098000',
        //                 fillFee: '0.01909800',
        //                 direction: 'TAKER',
        //                 createdTime: '1776174283564',
        //                 updatedTime: '1776174283564'
        //             }
        //         ]
        //     }
        //
        // swap
        //     {
        //         "id": "738957755401896296",
        //         "coin": "USDT",
        //         "symbol": "DOGEUSDT",
        //         "orderId": "738957755376730472",
        //         "marginMode": "CROSSED",
        //         "separatedMode": "COMBINED",
        //         "separatedOpenOrderId": "0",
        //         "positionSide": "LONG",
        //         "orderSide": "BUY",
        //         "fillSize": "100",
        //         "fillValue": "9.59500",
        //         "fillFee": "0.00767600",
        //         "liquidateFee": "0",
        //         "realizePnl": "0",
        //         "direction": "TAKER",
        //         "createdTime": "1776181258059",
        //         "updatedTime": "1776181258059"
        //     }
        //
        if (this.myTrades === undefined) {
            const limit = this.safeInteger(this.options, 'tradesLimit', 1000);
            this.myTrades = new Cache.ArrayCacheBySymbolById(limit);
        }
        const trades = this.myTrades;
        const data = this.safeList(message, 'd', []);
        const symbols = {};
        for (let i = 0; i < data.length; i++) {
            const trade = this.safeDict(data, i, {});
            const parsed = this.parseWsMyTrade(trade);
            const symbol = parsed['symbol'];
            symbols[symbol] = true;
            trades.append(parsed);
        }
        let messageHash = 'myTrades';
        const symbolKeys = Object.keys(symbols);
        const market = this.getMarketFromSymbols(symbolKeys);
        if (market['contract']) {
            messageHash = 'myContractTrades';
        }
        for (let j = 0; j < symbolKeys.length; j++) {
            const symbol = symbolKeys[j];
            const symbolMessageHash = messageHash + '::' + symbol;
            client.resolve(trades, symbolMessageHash);
        }
        client.resolve(trades, messageHash);
    }
    parseWsMyTrade(trade, market = undefined) {
        //
        // spot
        //     {
        //         id: '738928502249620072',
        //         symbol: 'DOGEUSDT',
        //         baseCoin: 'DOGE',
        //         quoteCoin: 'USDT',
        //         orderId: '738928502174122600',
        //         orderSide: 'SELL',
        //         fillSize: '200.0',
        //         fillValue: '19.098000',
        //         fillFee: '0.01909800',
        //         direction: 'TAKER',
        //         createdTime: '1776174283564',
        //         updatedTime: '1776174283564'
        //     }
        //
        const timestamp = this.safeInteger(trade, 'createdTime');
        const marketId = this.safeString(trade, 'symbol');
        let marketType = 'spot';
        const positionSide = this.safeString(trade, 'positionSide');
        if (positionSide !== undefined) {
            marketType = 'swap';
        }
        market = this.safeMarket(marketId, undefined, undefined, marketType);
        const side = this.safeStringLower(trade, 'orderSide');
        let fee = undefined;
        const commission = this.safeString(trade, 'fillFee');
        if (commission !== undefined) {
            const commissionAsset = this.safeString(trade, 'coin');
            let feeCurrency = this.safeCurrencyCode(commissionAsset);
            if (marketType === 'spot') {
                if (side === 'buy') {
                    feeCurrency = market['base'];
                }
                else {
                    feeCurrency = market['quote'];
                }
            }
            fee = {
                'cost': commission,
                'currency': feeCurrency,
            };
        }
        return this.safeTrade({
            'info': trade,
            'id': this.safeString(trade, 'id'),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'symbol': market['symbol'],
            'order': this.safeString(trade, 'orderId'),
            'type': this.safeString(trade, 'type'),
            'side': side,
            'takerOrMaker': this.safeStringLower(trade, 'direction'),
            'price': undefined,
            'amount': this.safeString(trade, 'fillSize'),
            'cost': this.safeString(trade, 'fillValue'),
            'fee': fee,
        });
    }
    /**
     * @method
     * @name weex#watchOrders
     * @description watches information on multiple orders made by the user
     * @see https://www.weex.com/api-doc/spot/Websocket/private/Order-Channel
     * @see https://www.weex.com/api-doc/contract/Websocket/private/Order-Channel
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] spot or swap, default is spot if symbol is not provided
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async watchOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            symbol = market['symbol'];
        }
        let marketType = undefined;
        [marketType, params] = this.handleMarketTypeAndParams('watchOrders', market, params);
        const isContract = (marketType !== 'spot');
        let messageHash = isContract ? 'contractOrders' : 'orders';
        const subscriptionHash = messageHash;
        if (symbol !== undefined) {
            messageHash += '::' + symbol;
        }
        const channel = 'orders';
        const orders = await this.subscribePrivate(messageHash, subscriptionHash, channel, isContract, params);
        if (this.newUpdates) {
            limit = orders.getLimit(symbol, limit);
        }
        return this.filterBySymbolSinceLimit(orders, symbol, since, limit, true);
    }
    /**
     * @method
     * @name weex#unWatchOrders
     * @description unWatches information on multiple orders made by the user
     * @see https://www.weex.com/api-doc/spot/Websocket/private/Order-Channel
     * @see https://www.weex.com/api-doc/contract/Websocket/private/Order-Channel
     * @param {string} [symbol] not used by the exchange
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async unWatchOrders(symbol = undefined, params = {}) {
        if (symbol !== undefined) {
            throw new errors.NotSupported(this.id + ' unWatchOrders does not support a symbol argument. Unsubscribing from orders is global for all symbols.');
        }
        let marketType = undefined;
        [marketType, params] = this.handleMarketTypeAndParams('unWatchOrders', undefined, params);
        const isContract = (marketType !== 'spot');
        const subHash = isContract ? 'contractOrders' : 'orders';
        const unSubHash = 'unsubscribe::' + subHash;
        const channel = 'orders';
        const subscription = {
            'unsubscribe': true,
            'messageHashes': [unSubHash],
            'subMessageHashes': [subHash],
            'topic': 'orders',
            'subHashIsPrefix': true,
        };
        return await this.subscribePrivate(unSubHash, unSubHash, channel, isContract, params, subscription);
    }
    handleOrders(client, message) {
        //
        //     {
        //         "e": "orders",
        //         "E": 1776184415058,
        //         "v": 153,
        //         "msgEvent": "OrderUpdate",
        //         "d": [
        //             {
        //                 "id": "738970996765098600",
        //                 "symbol": "DOGEUSDT",
        //                 "baseCoin": "DOGE",
        //                 "quoteCoin": "USDT",
        //                 "orderSide": "SELL",
        //                 "price": "0",
        //                 "size": "200.0",
        //                 "value": "0",
        //                 "clientOrderId": "b-WEEX111125-bf78d975ca38422bb6ea65",
        //                 "type": "MARKET",
        //                 "timeInForce": "IOC",
        //                 "reduceOnly": false,
        //                 "triggerPrice": "0",
        //                 "orderSource": "API",
        //                 "openTpslParentOrderId": "0",
        //                 "setOpenTp": false,
        //                 "setOpenSl": false,
        //                 "takerFeeRate": "0.001",
        //                 "makerFeeRate": "0.001",
        //                 "feeDiscount": "1",
        //                 "takerFeeDiscount": "1",
        //                 "makerFeeDiscount": "1",
        //                 "status": "FILLED",
        //                 "triggerTime": "0",
        //                 "triggerPriceTime": "0",
        //                 "triggerPriceValue": "0",
        //                 "cancelReason": "UNKNOWN_ORDER_CANCEL_REASON",
        //                 "latestFillPrice": "0.09571",
        //                 "maxFillPrice": "0.09571",
        //                 "minFillPrice": "0.09571",
        //                 "cumFillSize": "200.0",
        //                 "cumFillValue": "19.142000",
        //                 "cumFillFee": "0.01914200",
        //                 "createdTime": "1776184415046",
        //                 "updatedTime": "1776184415058"
        //             }
        //         ]
        //     }
        //
        const data = this.safeList(message, 'd', []);
        const symbols = {};
        if (this.orders === undefined) {
            const limit = this.safeInteger(this.options, 'ordersLimit', 1000);
            this.orders = new Cache.ArrayCacheBySymbolById(limit);
        }
        const orders = this.orders;
        const newOrders = [];
        for (let i = 0; i < data.length; i++) {
            const rawOrder = this.safeDict(data, i, {});
            const parsed = this.parseWsOrder(rawOrder);
            orders.append(parsed);
            newOrders.push(parsed);
            const symbol = parsed['symbol'];
            symbols[symbol] = true;
        }
        let messageHash = 'orders';
        const symbolKeys = Object.keys(symbols);
        const market = this.getMarketFromSymbols(symbolKeys);
        if (market['contract']) {
            messageHash = 'contractOrders';
        }
        for (let i = 0; i < symbolKeys.length; i++) {
            const symbol = symbolKeys[i];
            const symbolMessageHash = messageHash + '::' + symbol;
            client.resolve(newOrders, symbolMessageHash);
        }
        client.resolve(newOrders, messageHash);
    }
    parseWsOrder(order, market = undefined) {
        //
        // spot
        //     {
        //         "id": "738970996765098600",
        //         "symbol": "DOGEUSDT",
        //         "baseCoin": "DOGE",
        //         "quoteCoin": "USDT",
        //         "orderSide": "SELL",
        //         "price": "0",
        //         "size": "200.0",
        //         "value": "0",
        //         "clientOrderId": "b-WEEX111125-bf78d975ca38422bb6ea65",
        //         "type": "MARKET",
        //         "timeInForce": "IOC",
        //         "reduceOnly": false,
        //         "triggerPrice": "0",
        //         "orderSource": "API",
        //         "openTpslParentOrderId": "0",
        //         "setOpenTp": false,
        //         "setOpenSl": false,
        //         "takerFeeRate": "0.001",
        //         "makerFeeRate": "0.001",
        //         "feeDiscount": "1",
        //         "takerFeeDiscount": "1",
        //         "makerFeeDiscount": "1",
        //         "status": "FILLED",
        //         "triggerTime": "0",
        //         "triggerPriceTime": "0",
        //         "triggerPriceValue": "0",
        //         "cancelReason": "UNKNOWN_ORDER_CANCEL_REASON",
        //         "latestFillPrice": "0.09571",
        //         "maxFillPrice": "0.09571",
        //         "minFillPrice": "0.09571",
        //         "cumFillSize": "200.0",
        //         "cumFillValue": "19.142000",
        //         "cumFillFee": "0.01914200",
        //         "createdTime": "1776184415046",
        //         "updatedTime": "1776184415058"
        //     }
        //
        // swap
        //     {
        //         "id": "617414920861909658",
        //         "coin": "USDT",
        //         "symbol": "BTCUSDT",
        //         "marginMode": "CROSSED",
        //         "separatedMode": "COMBINED",
        //         "separatedOpenOrderId": "0",
        //         "positionSide": "LONG",
        //         "orderSide": "BUY",
        //         "price": "0.0",
        //         "size": "0.10000",
        //         "clientOrderId": "1747203186927FPIZRP",
        //         "type": "MARKET",
        //         "timeInForce": "IOC",
        //         "reduceOnly": false,
        //         "triggerPrice": "0",
        //         "triggerPriceType": "CONTRACT_PRICE",
        //         "orderSource": "WEB",
        //         "openTpslParentOrderId": "0",
        //         "positionTpsl": false,
        //         "setOpenTp": false,
        //         "setOpenSl": false,
        //         "leverage": "20",
        //         "takerFeeRate": "0.0006",
        //         "makerFeeRate": "0.0002",
        //         "feeDiscount": "1",
        //         "liquidateFeeRate": "0.01",
        //         "status": "PENDING",
        //         "triggerTime": "0",
        //         "triggerPriceTime": "0",
        //         "triggerPriceValue": "0",
        //         "cancelReason": "UNKNOWN_ORDER_CANCEL_REASON",
        //         "latestFillPrice": "0",
        //         "maxFillPrice": "0",
        //         "minFillPrice": "0",
        //         "cumFillSize": "0",
        //         "cumFillValue": "0",
        //         "cumFillFee": "0",
        //         "cumLiquidateFee": "0",
        //         "cumRealizePnl": "0",
        //         "createdTime": "1747203188148",
        //         "updatedTime": "1747203188148"
        //     }
        //
        const timestamp = this.safeInteger(order, 'createdTime');
        const marketId = this.safeString(order, 'symbol');
        let marketType = 'spot';
        const positionSide = this.safeString(order, 'positionSide');
        if (positionSide !== undefined) {
            marketType = 'swap';
        }
        market = this.safeMarket(marketId, undefined, undefined, marketType);
        const side = this.safeStringLower(order, 'orderSide');
        let fee = undefined;
        const commission = this.safeString(order, 'cumFillFee');
        if (commission !== undefined) {
            const commissionAsset = this.safeString(order, 'coin');
            let feeCurrency = this.safeCurrencyCode(commissionAsset);
            if (marketType === 'spot') {
                if (side === 'buy') {
                    feeCurrency = market['base'];
                }
                else {
                    feeCurrency = market['quote'];
                }
            }
            fee = {
                'cost': commission,
                'currency': feeCurrency,
            };
        }
        const rawStatus = this.safeStringLower(order, 'status');
        const rawType = this.safeString(order, 'type');
        const triggerPrice = this.omitZero(this.safeString(order, 'triggerPrice'));
        let stopLossPrice = undefined;
        let takeProfitPrice = undefined;
        if (rawType === 'TAKE_PROFIT_MARKET' || rawType === 'TAKE_PROFIT') {
            takeProfitPrice = triggerPrice;
        }
        else if (rawType === 'STOP_LOSS' || rawType === 'STOP' || rawType === 'STOP_MARKET') {
            stopLossPrice = triggerPrice;
        }
        return this.safeOrder({
            'id': this.safeString(order, 'id'),
            'clientOrderId': this.safeString(order, 'clientOrderId'),
            'symbol': market['symbol'],
            'type': this.parseOrderType(rawType),
            'timeInForce': this.safeString(order, 'timeInForce'),
            'postOnly': undefined,
            'reduceOnly': this.safeBool(order, 'reduceOnly'),
            'side': side,
            'amount': this.safeString(order, 'size'),
            'price': this.safeString(order, 'price'),
            'triggerPrice': triggerPrice,
            'cost': this.safeString(order, 'cumFillValue'),
            'filled': this.safeString(order, 'cumFillSize'),
            'remaining': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'fee': fee,
            'status': this.parseOrderStatus(rawStatus),
            'lastTradeTimestamp': undefined,
            'lastUpdateTimestamp': this.safeInteger(order, 'updatedTime'),
            'average': undefined,
            'trades': undefined,
            'stopLossPrice': stopLossPrice,
            'takeProfitPrice': takeProfitPrice,
            'info': order,
        }, market);
    }
    /**
     * @method
     * @name weex#watchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://www.weex.com/api-doc/spot/Websocket/private/Account-Channel
     * @see https://www.weex.com/api-doc/contract/Websocket/private/Account-Channel
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] 'spot' or 'swap', default is 'spot'
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
     */
    async watchBalance(params = {}) {
        await this.loadMarkets();
        let type = undefined;
        [type, params] = this.handleMarketTypeAndParams('watchBalance', undefined, params);
        const isContract = (type !== 'spot');
        const urlType = isContract ? 'contract' : 'spot';
        const url = this.urls['api']['ws'][urlType] + '/private';
        this.authenticate(url);
        const client = this.client(url);
        this.setBalanceCache(client, type);
        const options = this.safeDict(this.options, 'watchBalance');
        const fetchBalanceSnapshot = this.safeBool(options, 'fetchBalanceSnapshot', false);
        const awaitBalanceSnapshot = this.safeBool(options, 'awaitBalanceSnapshot', true);
        if (fetchBalanceSnapshot && awaitBalanceSnapshot) {
            await client.future(type + ':fetchBalanceSnapshot');
        }
        const messageHash = type + ':' + 'balance';
        return await this.subscribePrivate(messageHash, type, 'account', isContract, params);
    }
    setBalanceCache(client, type) {
        if ((type in client.subscriptions) && (type in this.balance)) {
            return;
        }
        const options = this.safeDict(this.options, 'watchBalance');
        const fetchBalanceSnapshot = this.safeBool(options, 'fetchBalanceSnapshot', false);
        if (fetchBalanceSnapshot) {
            const messageHash = type + ':fetchBalanceSnapshot';
            if (!(messageHash in client.futures)) {
                client.future(messageHash);
                this.spawn(this.loadBalanceSnapshot, client, messageHash, type);
            }
        }
        else {
            this.balance[type] = {};
        }
    }
    async loadBalanceSnapshot(client, messageHash, type) {
        const params = {
            'type': type,
        };
        const response = await this.fetchBalance(params);
        this.balance[type] = this.extend(response, this.safeValue(this.balance, type, {}));
        // don't remove the future from the .futures cache
        if (messageHash in client.futures) {
            const future = client.futures[messageHash];
            future.resolve();
            client.resolve(this.balance[type], type + ':balance');
        }
    }
    handleBalance(client, message) {
        //
        // spot
        //     {
        //         "e": "account",
        //         "E": 1776187844633,
        //         "v": 178,
        //         "msgEvent": "DepositUpdate",
        //         "d": [
        //             {
        //                 "coin": "USDT",
        //                 "equity": "47.98428060",
        //                 "available": "47.98428060",
        //                 "frozen": "0"
        //             }
        //         ]
        //     }
        //
        // coontract
        //     {
        //         "e": "account",
        //         "E": 1776189629849,
        //         "v": 281,
        //         "msgEvent": "DepositUpdate",
        //         "d": [
        //             {
        //                 "coin": "USDT",
        //                 "marginMode": "CROSSED",
        //                 "crossSymbol": "0",
        //                 "isolatedPositionId": "0",
        //                 "amount": "0.00000000",
        //                 "pendingDepositAmount": "20.00000000",
        //                 "pendingWithdrawAmount": "0.00000000",
        //                 "pendingTransferInAmount": "0",
        //                 "pendingTransferOutAmount": "0",
        //                 "liquidating": false,
        //                 "legacyAmount": "0.00000000",
        //                 "cumDepositAmount": "167.50000925",
        //                 "cumWithdrawAmount": "166.94609514",
        //                 "cumTransferInAmount": "0",
        //                 "cumTransferOutAmount": "0",
        //                 "cumMarginMoveInAmount": "10.86162763",
        //                 "cumMarginMoveOutAmount": "10.83205378",
        //                 "cumPositionOpenLongAmount": "305.59400",
        //                 "cumPositionOpenShortAmount": "238.95700",
        //                 "cumPositionCloseLongAmount": "305.86600000",
        //                 "cumPositionCloseShortAmount": "238.94700000",
        //                 "cumPositionFillFeeAmount": "0.00761040",
        //                 "cumPositionLiquidateFeeAmount": "0",
        //                 "cumPositionFundingAmount": "0.00049824",
        //                 "cumOrderFillFeeIncomeAmount": "0",
        //                 "cumOrderLiquidateFeeIncomeAmount": "0",
        //                 "createdTime": "1775605824300",
        //                 "updatedTime": "1776189629849"
        //             }
        //         ]
        //     }
        //
        const url = client.url;
        let accountType = 'spot';
        if (url.indexOf('contract') >= 0) {
            accountType = 'swap';
        }
        const messageHash = accountType + ':balance';
        if (this.balance[accountType] === undefined) {
            this.balance[accountType] = {};
        }
        this.balance[accountType]['info'] = message;
        const balanceUpdates = this.safeList(message, 'd', []);
        for (let i = 0; i < balanceUpdates.length; i++) {
            const entry = this.safeDict(balanceUpdates, i);
            const currencyId = this.safeString(entry, 'coin');
            const code = this.safeCurrencyCode(currencyId);
            const account = this.account();
            account['free'] = this.safeString2(entry, 'available', 'amount');
            account['used'] = this.safeString(entry, 'frozen');
            account['total'] = this.safeString2(entry, 'equity', 'legacyAmount');
            this.balance[accountType][code] = account;
        }
        const timestamp = this.safeInteger(message, 'E');
        this.balance[accountType]['timestamp'] = timestamp;
        this.balance[accountType]['datetime'] = this.iso8601(timestamp);
        this.balance[accountType] = this.safeBalance(this.balance[accountType]);
        client.resolve(this.balance[accountType], messageHash);
    }
    /**
     * @method
     * @name weex#watchPositions
     * @see https://www.weex.com/api-doc/contract/Websocket/private/Positions-Channel
     * @description watch all open positions
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param {int} [since] the earliest time in ms to fetch positions for
     * @param {int} [limit] the maximum number of position structures to retrieve
     * @param {object} params extra parameters specific to the exchange API endpoint
     * @param {int} [params.accountNumber] account number to query orders for, required
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/en/latest/manual.html#position-structure}
     */
    async watchPositions(symbols = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const url = this.urls['api']['ws']['contract'] + '/private';
        this.authenticate(url);
        const client = this.client(url);
        symbols = this.marketSymbols(symbols, 'swap', true);
        let messageHash = 'positions';
        const subscriptionHash = messageHash;
        if (symbols !== undefined) {
            messageHash += '::' + symbols.join(',');
        }
        const channel = 'positions';
        this.setPositionsCache(client, params);
        const fetchPositionsSnapshot = this.handleOption('watchPositions', 'fetchPositionsSnapshot', true);
        const awaitPositionsSnapshot = this.handleOption('watchPositions', 'awaitPositionsSnapshot', true);
        if (fetchPositionsSnapshot && awaitPositionsSnapshot && this.positions === undefined) {
            const snapshot = await client.future('fetchPositionsSnapshot');
            return this.filterBySymbolsSinceLimit(snapshot, symbols, since, limit, true);
        }
        const newPositions = await this.subscribePrivate(messageHash, subscriptionHash, channel, true, params);
        if (this.newUpdates) {
            return newPositions;
        }
        return this.filterBySymbolsSinceLimit(this.positions, symbols, since, limit, true);
    }
    setPositionsCache(client, params = {}) {
        const fetchPositionsSnapshot = this.handleOption('watchPositions', 'fetchPositionsSnapshot', false);
        if (fetchPositionsSnapshot) {
            const messageHash = 'fetchPositionsSnapshot';
            if (!(messageHash in client.futures)) {
                client.future(messageHash);
                this.spawn(this.loadPositionsSnapshot, client, messageHash, params);
            }
        }
        else {
            this.positions = new Cache.ArrayCacheBySymbolById();
        }
    }
    async loadPositionsSnapshot(client, messageHash, params) {
        const positions = await this.fetchPositions(undefined, params);
        this.positions = new Cache.ArrayCacheBySymbolById();
        const cache = this.positions;
        for (let i = 0; i < positions.length; i++) {
            const position = positions[i];
            cache.append(position);
        }
        // don't remove the future from the .futures cache
        const future = client.futures[messageHash];
        future.resolve(cache);
        client.resolve(cache, 'positions');
    }
    /**
     * @method
     * @name weex#unWatchPositions
     * @description unWatches all open positions
     * @see https://www.weex.com/api-doc/contract/Websocket/private/Positions-Channel
     * @param {string[]} [symbols] not used by the exchange, unsubscription from positions is global for all symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} status of the unwatch request
     */
    async unWatchPositions(symbols = undefined, params = {}) {
        if (symbols !== undefined) {
            throw new errors.NotSupported(this.id + ' unWatchPositions does not support a symbols argument. Unsubscribing from positions is global for all symbols.');
        }
        const subHash = 'positions';
        const unSubHash = 'unsubscribe::' + subHash;
        const channel = 'positions';
        const subscription = {
            'unsubscribe': true,
            'messageHashes': [unSubHash],
            'subMessageHashes': [subHash],
            'topic': 'positions',
            'subHashIsPrefix': true,
        };
        return await this.subscribePrivate(unSubHash, unSubHash, channel, true, params, subscription);
    }
    handlePositions(client, message) {
        //
        //     {
        //         "e": "positions",
        //         "E": 1776192398399,
        //         "v": 319,
        //         "msgEvent": "OrderUpdate",
        //         "d": [
        //             {
        //                 "id": "739004481374519656",
        //                 "coin": "USDT",
        //                 "symbol": "DOGEUSDT",
        //                 "side": "LONG",
        //                 "marginMode": "CROSSED",
        //                 "separatedMode": "COMBINED",
        //                 "separatedOpenOrderId": "0",
        //                 "leverage": "11",
        //                 "size": "100",
        //                 "openValue": "9.31100",
        //                 "openFee": "0.00744880",
        //                 "fundingFee": "0",
        //                 "isolatedMargin": "0",
        //                 "autoAppendIsolatedMargin": false,
        //                 "cumOpenSize": "100",
        //                 "cumOpenValue": "9.31100",
        //                 "cumOpenFee": "0.00744880",
        //                 "cumCloseSize": "0",
        //                 "cumCloseValue": "0",
        //                 "cumCloseFee": "0",
        //                 "cumFundingFee": "0",
        //                 "cumLiquidateFee": "0",
        //                 "createdMatchSequenceId": "5792711540",
        //                 "updatedMatchSequenceId": "5792711540",
        //                 "createdTime": "1776192398399",
        //                 "updatedTime": "1776192398399"
        //             }
        //         ]
        //     }
        //
        if (this.positions === undefined) {
            this.positions = new Cache.ArrayCacheBySymbolById();
        }
        const cache = this.positions;
        const newPositions = [];
        const data = this.safeList(message, 'd', []);
        for (let i = 0; i < data.length; i++) {
            const rawPosition = this.safeDict(data, i, {});
            const position = this.parsePosition(rawPosition);
            cache.append(position);
            newPositions.push(position);
        }
        const messageHashes = this.findMessageHashes(client, 'positions::');
        for (let i = 0; i < messageHashes.length; i++) {
            const messageHash = messageHashes[i];
            const parts = messageHash.split('::');
            const symbolsString = parts[1];
            const symbols = symbolsString.split(',');
            const positions = this.filterByArray(newPositions, 'symbol', symbols, false);
            if (!this.isEmpty(positions)) {
                client.resolve(positions, messageHash);
            }
        }
        client.resolve(newPositions, 'positions');
    }
    getMarketFromClientAndMessage(client, message) {
        const url = client.url;
        let marketType = 'spot';
        if (url.indexOf('contract') >= 0) {
            marketType = 'swap';
        }
        const marketId = this.safeString(message, 's');
        const market = this.safeMarket(marketId, undefined, undefined, marketType);
        return market;
    }
    async pong(client, message) {
        //
        //     { "event": "ping", "time": "1776078750000" } - public
        //
        //     { "type": "ping", "time": "1776172740000" } - private
        //
        const response = {
            'id': this.requestId(),
            'method': 'PONG',
        };
        await client.send(response);
    }
    handlePing(client, message) {
        this.spawn(this.pong, client, message);
    }
    handleSubscriptionStatus(client, message) {
        //
        //     { "result": true, "id": 2 }
        //
        const id = this.safeString(message, 'id');
        const subscriptionsById = this.indexBy(client.subscriptions, 'id');
        const subscription = this.safeDict(subscriptionsById, id, {});
        const unsubscribe = this.safeBool(subscription, 'unsubscribe', false);
        if (unsubscribe) {
            const subHashIsPrefix = this.safeBool(subscription, 'subHashIsPrefix', false);
            const messageHashes = this.safeList(subscription, 'messageHashes', []);
            const subHashes = this.safeList(subscription, 'subMessageHashes', []);
            for (let i = 0; i < messageHashes.length; i++) {
                const unSubHash = this.safeString(messageHashes, i);
                const subHash = this.safeString(subHashes, i);
                this.cleanUnsubscription(client, subHash, unSubHash, subHashIsPrefix);
            }
            this.cleanCache(subscription);
        }
        return message;
    }
    handleErrorMessage(client, message) {
        //
        //     {
        //         "result": false,
        //         "id": 1,
        //         "msg": "INVALID_ARGUMENT: invalid symbol : ASDFS_SPBL"
        //     }
        //
        const result = this.safeBool(message, 'result', true);
        if (!result) {
            const msg = this.safeString(message, 'msg', '');
            const feedback = this.id + ' ' + this.json(message);
            try {
                this.throwExactlyMatchedException(this.exceptions['exact'], msg, feedback);
                this.throwBroadlyMatchedException(this.exceptions['broad'], msg, feedback);
                throw new errors.ExchangeError(feedback);
            }
            catch (error) {
                client.reject(error);
                return true;
            }
        }
        return false;
    }
    handleMessage(client, message) {
        //
        //     { "id": "5", "method": "PONG" }
        //
        //     { "result": true, "id": 2 }
        //
        //     {
        //         "result": false,
        //         "id": 1,
        //         "msg": "INVALID_ARGUMENT: invalid symbol : ASDFS_SPBL"
        //     }
        //
        if (this.handleErrorMessage(client, message)) {
            return;
        }
        const id = this.safeString(message, 'id');
        if (id !== undefined) {
            this.handleSubscriptionStatus(client, message);
            return;
        }
        const event = this.safeStringN(message, ['e', 'event', 'type']);
        if (event === 'ping') {
            this.handlePing(client, message);
        }
        else if (event === 'ticker') {
            this.handleTicker(client, message);
        }
        else if ((event === 'trade') || (event === 'tradeSnapshot')) {
            this.handleTrade(client, message);
        }
        else if ((event === 'kline') || (event === 'klineSnapshot')) {
            this.handleOHLCV(client, message);
        }
        else if ((event === 'depth') || (event === 'depthSnapshot')) {
            this.handleOrderBook(client, message);
        }
        else if (event === 'bookTicker') {
            this.handleBidAsk(client, message);
        }
        else if (event === 'fill') {
            this.handleMyTrades(client, message);
        }
        else if (event === 'orders') {
            this.handleOrders(client, message);
        }
        else if (event === 'account') {
            this.handleBalance(client, message);
        }
        else if (event === 'positions') {
            this.handlePositions(client, message);
        }
    }
}

exports["default"] = weex;
