'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var sha2_js = require('@noble/hashes/sha2.js');
var ed25519_js = require('@noble/curves/ed25519.js');
var binance$1 = require('../binance.js');
var Precise = require('../base/Precise.js');
var errors = require('../base/errors.js');
var Cache = require('../base/ws/Cache.js');
var rsa = require('../base/functions/rsa.js');
var crypto = require('../base/functions/crypto.js');

// ----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
class binance extends binance$1["default"] {
    describe() {
        const superDescribe = super.describe();
        return this.deepExtend(superDescribe, this.describeData());
    }
    describeData() {
        return {
            'has': {
                'ws': true,
                'watchBalance': true,
                'watchLiquidations': true,
                'watchLiquidationsForSymbols': true,
                'watchMyLiquidations': true,
                'watchMyLiquidationsForSymbols': true,
                'watchBidsAsks': true,
                'watchMyTrades': true,
                'watchOHLCV': true,
                'watchOHLCVForSymbols': true,
                'watchOrderBook': true,
                'watchOrderBookForSymbols': true,
                'watchOrders': true,
                'watchOrdersForSymbols': true,
                'watchPositions': true,
                'watchTicker': true,
                'watchTickers': true,
                'watchMarkPrices': true,
                'watchMarkPrice': true,
                'watchTrades': true,
                'watchTradesForSymbols': true,
                'createOrderWs': true,
                'editOrderWs': true,
                'cancelOrderWs': true,
                'cancelOrdersWs': false,
                'cancelAllOrdersWs': true,
                'fetchBalanceWs': true,
                'fetchDepositsWs': false,
                'fetchMarketsWs': false,
                'fetchMyTradesWs': true,
                'fetchOHLCVWs': true,
                'fetchOrderBookWs': true,
                'fetchOpenOrdersWs': true,
                'fetchOrderWs': true,
                'fetchOrdersWs': true,
                'fetchPositionWs': true,
                'fetchPositionForSymbolWs': true,
                'fetchPositionsWs': true,
                'fetchTickerWs': true,
                'fetchTradesWs': true,
                'fetchTradingFeesWs': false,
                'fetchWithdrawalsWs': false,
                'unWatchTicker': true,
                'unWatchTickers': true,
                'unWatchOHLCV': true,
                'unWatchOHLCVForSymbols': true,
                'unWatchOrderBook': true,
                'unWatchOrderBookForSymbols': true,
                'unWatchTrades': true,
                'unWatchTradesForSymbols': true,
                'unWatchMyTrades': false,
                'unWatchOrders': false,
                'unWatchPositions': false,
                'unWatchMarkPrices': true,
                'unWatchMarkPrice': true,
                'unWatchBidsAsks': true,
            },
            'urls': {
                'test': {
                    'ws': {
                        'spot': 'wss://stream.testnet.binance.vision/ws',
                        'margin': 'wss://stream.testnet.binance.vision/ws',
                        'future': 'wss://fstream.binancefuture.com/ws',
                        'delivery': 'wss://dstream.binancefuture.com/ws',
                        'ws-api': {
                            'spot': 'wss://ws-api.testnet.binance.vision/ws-api/v3',
                            'future': 'wss://testnet.binancefuture.com/ws-fapi/v1',
                            'delivery': 'wss://testnet.binancefuture.com/ws-dapi/v1',
                        },
                    },
                },
                'demo': {
                    'ws': {
                        'spot': 'wss://demo-stream.binance.com/ws',
                        'margin': 'wss://demo-stream.binance.com/ws',
                        'future': 'wss://fstream.binancefuture.com/ws',
                        'delivery': 'wss://dstream.binancefuture.com/ws',
                        'ws-api': {
                            'spot': 'wss://demo-ws-api.binance.com/ws-api/v3',
                            'future': 'wss://testnet.binancefuture.com/ws-fapi/v1',
                            'delivery': 'wss://testnet.binancefuture.com/ws-dapi/v1',
                        },
                    },
                },
                'api': {
                    'ws': {
                        'spot': 'wss://stream.binance.com:9443/ws',
                        'margin': 'wss://stream.binance.com:9443/ws',
                        'future': 'wss://fstream.binance.com/ws',
                        'delivery': 'wss://dstream.binance.com/ws',
                        'stock': 'wss://nbstream.binance.com/equity/ws',
                        'option': 'wss://fstream.binance.com/public/ws',
                        'optionMarket': 'wss://fstream.binance.com/market/ws',
                        'optionPrivate': 'wss://fstream.binance.com/private/ws',
                        'ws-api': {
                            'spot': 'wss://ws-api.binance.com:443/ws-api/v3',
                            'future': 'wss://ws-fapi.binance.com/ws-fapi/v1',
                            'delivery': 'wss://ws-dapi.binance.com/ws-dapi/v1',
                        },
                        'papi': 'wss://fstream.binance.com/pm/ws',
                    },
                },
                'doc': 'https://developers.binance.com/en',
            },
            'streaming': {
                'keepAlive': 180000,
            },
            'options': {
                'returnRateLimits': false,
                'streamLimits': {
                    'spot': 50, // max 1024
                    'margin': 50, // max 1024
                    'future': 50, // max 200
                    'delivery': 50, // max 200
                    'stock': 50,
                    'option': 50, // max 200
                    'optionMarket': 50, // max 200
                },
                'subscriptionLimitByStream': {
                    'spot': 200,
                    'margin': 200,
                    'future': 200,
                    'delivery': 200,
                    'stock': 200,
                    'option': 200,
                    'optionMarket': 200,
                },
                'streamBySubscriptionsHash': this.createSafeDictionary(),
                'streamIndex': -1,
                // get updates every 1000ms or 100ms
                // or every 0ms in real-time for futures
                'watchOrderBookRate': 100,
                'liquidationsLimit': 1000,
                'myLiquidationsLimit': 1000,
                'tradesLimit': 1000,
                'ordersLimit': 1000,
                'OHLCVLimit': 1000,
                'requestId': this.createSafeDictionary(),
                'watchOrderBookLimit': 1000, // default limit
                'watchTrades': {
                    'name': 'trade', // 'trade' or 'aggTrade'
                },
                'watchTicker': {
                    'name': 'ticker', // ticker or miniTicker or ticker_<window_size>
                },
                'watchTickers': {
                    'name': 'miniTicker', // miniTicker or ticker_<window_size>
                },
                'watchOHLCV': {
                    'name': 'kline', // or indexPriceKline or markPriceKline (coin-m futures)
                },
                'watchOrderBook': {
                    'maxRetries': 3,
                    'checksum': true,
                },
                'option': {
                    'listenKey': undefined,
                    'lastAuthenticatedTime': 0,
                },
                'watchBalance': {
                    'fetchBalanceSnapshot': false, // or true
                    'awaitBalanceSnapshot': true, // whether to wait for the balance snapshot before providing updates
                },
                'watchLiquidationsForSymbols': {
                    'defaultType': 'swap',
                },
                'watchPositions': {
                    'fetchPositionsSnapshot': true, // or false
                    'awaitPositionsSnapshot': true, // whether to wait for the positions snapshot before providing updates
                },
                'wallet': 'wb', // wb = wallet balance, cw = cross balance
                'listenKeyRefreshRate': 1200000, // 20 mins
                'stockListenKeyRefreshRate': 1200000, // 20 mins
                'ws': {
                    'cost': 5,
                },
                'tickerChannelsMap': {
                    'price': 'price',
                    'quote': 'quote',
                    '24hrTicker': 'ticker',
                    '24hrMiniTicker': 'miniTicker',
                    'markPriceUpdate': 'markPrice',
                    'markPrice': 'markPrice', // eOptions mark price event type
                    // rolling window tickers
                    '1hTicker': 'ticker_1h',
                    '4hTicker': 'ticker_4h',
                    '1dTicker': 'ticker_1d',
                    'bookTicker': 'bookTicker',
                },
            },
        };
    }
    requestId(url) {
        const options = this.safeDict(this.options, 'requestId', this.createSafeDictionary());
        const previousValue = this.safeInteger(options, url, 0);
        const newValue = this.sum(previousValue, 1);
        this.options['requestId'][url] = newValue;
        return newValue;
    }
    isSpotUrl(client) {
        return (client.url.indexOf('/stream') > -1) || (client.url.indexOf('demo-stream') > -1);
    }
    stream(type, subscriptionHash, numSubscriptions = 1) {
        const streamBySubscriptionsHash = this.safeDict(this.options, 'streamBySubscriptionsHash', this.createSafeDictionary());
        let stream = this.safeString(streamBySubscriptionsHash, subscriptionHash);
        if (stream === undefined) {
            let streamIndex = this.safeInteger(this.options, 'streamIndex', -1);
            const streamLimits = this.safeValue(this.options, 'streamLimits');
            const streamLimit = this.safeInteger(streamLimits, type);
            streamIndex = streamIndex + 1;
            const normalizedIndex = streamIndex % streamLimit;
            this.options['streamIndex'] = streamIndex;
            stream = this.numberToString(normalizedIndex);
            if (subscriptionHash !== undefined) {
                this.options['streamBySubscriptionsHash'][subscriptionHash] = stream;
            }
            const subscriptionsByStreams = this.safeValue(this.options, 'numSubscriptionsByStream');
            if (subscriptionsByStreams === undefined) {
                this.options['numSubscriptionsByStream'] = this.createSafeDictionary();
            }
            const subscriptionsByStream = this.safeInteger(this.options['numSubscriptionsByStream'], stream, 0);
            const newNumSubscriptions = subscriptionsByStream + numSubscriptions;
            const subscriptionLimitByStream = this.safeInteger(this.options['subscriptionLimitByStream'], type, 200);
            if (newNumSubscriptions > subscriptionLimitByStream) {
                throw new errors.BadRequest(this.id + ' reached the limit of subscriptions by stream. Increase the number of streams, or increase the stream limit or subscription limit by stream if the exchange allows.');
            }
            this.options['numSubscriptionsByStream'][stream] = subscriptionsByStream + numSubscriptions;
        }
        return stream;
    }
    getWsUrl(type, category) {
        if ((type === 'option') || (type === 'optionMarket') || (type === 'optionPrivate')) {
            // eOptions urls are stored as full public/market/private paths, no category rewrite needed,
            // see https://github.com/ccxt/ccxt/pull/27982 and https://github.com/ccxt/ccxt/issues/26333
            return this.urls['api']['ws'][type];
        }
        const baseUrl = this.urls['api']['ws'][type];
        if (type === 'future') {
            // skip URL manipulation for proxied/bridge URLs (contain an embedded protocol)
            // const firstProtocol = baseUrl.indexOf ('://');
            // if (firstProtocol !== -1 && baseUrl.indexOf ('://', firstProtocol + 3) !== -1) {
            //     return baseUrl;
            // }
            const baseUrlSplit = baseUrl.split('://');
            const baseUrlSplitLength = baseUrlSplit.length;
            if (baseUrlSplitLength > 2) {
                return baseUrl;
            }
            // only rewrite when the URL ends with exactly "/ws"
            // this avoids matching "/wss", "/ws-api", "/ws-fapi/v1", etc.
            if (baseUrl.endsWith('/ws')) {
                const prefix = baseUrl.slice(0, baseUrl.length - 3);
                return prefix + '/' + category + '/ws';
            }
            return baseUrl;
        }
        return baseUrl;
    }
    getFutureWsCategory(channel) {
        if (channel === 'depth' || channel === 'rpiDepth' || channel === 'bookTicker' || channel === 'trade') {
            return 'public';
        }
        return 'market';
    }
    getPrivateWsUrl(type, listenKey) {
        if (type === 'future') {
            return this.getWsUrl(type, 'private') + '?listenKey=' + listenKey;
        }
        return this.urls['api']['ws'][type] + '/' + listenKey;
    }
    getStockWsUrl(streamType = 'market') {
        const baseUrl = this.urls['api']['ws']['stock'];
        if (streamType === 'combined') {
            return baseUrl.replace('/ws', '/stream');
        }
        return baseUrl;
    }
    getStockTickerFromSymbol(symbol) {
        const market = this.market(symbol);
        const base = this.safeString2(market, 'base', 'id');
        return (base === undefined) ? undefined : base.toLowerCase();
    }
    getStockUnifiedSymbol(stockSymbol, quote = undefined) {
        if (stockSymbol === undefined) {
            return undefined;
        }
        const safeQuote = (quote === undefined) ? 'USDC' : quote;
        const parsed = this.safeSymbol(stockSymbol, undefined, '/', 'spot');
        if ((parsed !== undefined) && (parsed.indexOf('/') >= 0)) {
            return parsed;
        }
        return stockSymbol + '/' + safeQuote;
    }
    /**
     * @method
     * @name binance#watchStockMarketStream
     * @ignore
     * @description subscribe to the tokenized stock market data stream
     * @param {string[]} streams stream names to subscribe to
     * @param {string[]} messageHashes message hashes to listen to
     * @param {object} params extra parameters specific to the exchange API endpoint
     * @returns {object} the raw stream subscription response
     */
    async watchStockMarketStream(streams, messageHashes, params = {}) {
        const url = this.getStockWsUrl('market');
        const requestId = this.requestId(url);
        const query = this.omit(params, ['stock', 'name', 'callerMethodName', 'type', 'subType', 'symbol', 'timeframe']);
        const request = {
            'method': 'SUBSCRIBE',
            'params': streams,
            'id': requestId,
        };
        const subscribe = {
            'id': requestId,
        };
        return await this.watchMultiple(url, messageHashes, this.extend(request, query), messageHashes, subscribe);
    }
    /**
     * @method
     * @name binance#watchLiquidations
     * @description watch the public liquidations of a trading pair
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/websocket-market-streams/Liquidation-Order-Streams
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/websocket-market-streams/Liquidation-Order-Streams
     * @param {string} symbol unified CCXT market symbol
     * @param {int} [since] the earliest time in ms to fetch liquidations for
     * @param {int} [limit] the maximum number of liquidation structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an array of [liquidation structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#liquidation-structure}
     */
    watchLiquidations(symbol, since = undefined, limit = undefined, params = {}) {
        return this.watchLiquidationsForSymbols([symbol], since, limit, params);
    }
    /**
     * @method
     * @name binance#watchLiquidationsForSymbols
     * @description watch the public liquidations of a trading pair
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/websocket-market-streams/All-Market-Liquidation-Order-Streams
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/websocket-market-streams/All-Market-Liquidation-Order-Streams
     * @param {string[]} symbols list of unified market symbols
     * @param {int} [since] the earliest time in ms to fetch liquidations for
     * @param {int} [limit] the maximum number of liquidation structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an array of [liquidation structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#liquidation-structure}
     */
    async watchLiquidationsForSymbols(symbols, since = undefined, limit = undefined, params = {}) {
        if (this.markets === undefined) {
            await this.loadMarkets();
        }
        const subscriptionHashes = [];
        const messageHashes = [];
        let streamHash = 'liquidations';
        symbols = this.marketSymbols(symbols, undefined, true, true);
        if (this.isEmpty(symbols)) {
            subscriptionHashes.push('!' + 'forceOrder@arr');
            messageHashes.push('liquidations');
        }
        else {
            for (let i = 0; i < symbols.length; i++) {
                const market = this.market(symbols[i]);
                subscriptionHashes.push(market['lowercaseId'] + '@forceOrder');
                messageHashes.push('liquidations::' + symbols[i]);
            }
            streamHash += '::' + symbols.join(',');
        }
        let firstMarket = undefined;
        if (!this.isEmpty(symbols)) {
            firstMarket = this.getMarketFromSymbols(symbols);
        }
        const resolvedAuth = this.resolveAuthType('watchLiquidationsForSymbols', firstMarket, params);
        const type = resolvedAuth[0];
        params = resolvedAuth[2];
        // the spot check runs on the RESOLVED type: a spot default combined
        // with a linear or inverse defaultSubType means the caller wants the
        // matching derivatives stream, so the rewrite is allowed to route it
        // there and only a request that still resolves to spot throws
        if (type === 'spot') {
            throw new errors.BadRequest(this.id + ' watchLiquidationsForSymbols is not supported for spot symbols');
        }
        if (type === 'option') {
            throw new errors.NotSupported(this.id + ' watchLiquidationsForSymbols() does not support options markets, there is no public liquidation stream for eOptions');
        }
        const numSubscriptions = subscriptionHashes.length;
        const url = this.getWsUrl(type, this.getFutureWsCategory('forceOrder')) + '/' + this.stream(type, streamHash, numSubscriptions);
        const requestId = this.requestId(url);
        const request = {
            'method': 'SUBSCRIBE',
            'params': subscriptionHashes,
            'id': requestId,
        };
        const subscribe = {
            'id': requestId,
        };
        const newLiquidations = await this.watchMultiple(url, messageHashes, this.extend(request, params), subscriptionHashes, subscribe);
        if (this.newUpdates) {
            return newLiquidations;
        }
        return this.filterBySymbolsSinceLimit(this.liquidations, symbols, since, limit, true);
    }
    handleLiquidation(client, message) {
        //
        // future
        //    {
        //        "e":"forceOrder",
        //        "E":1698871323061,
        //        "o":{
        //           "s":"BTCUSDT",
        //           "S":"BUY",
        //           "o":"LIMIT",
        //           "f":"IOC",
        //           "q":"1.437",
        //           "p":"35100.81",
        //           "ap":"34959.70",
        //           "X":"FILLED",
        //           "l":"1.437",
        //           "z":"1.437",
        //           "T":1698871323059
        //        }
        //    }
        // delivery
        //    {
        //        "e":"forceOrder",              // Event Type
        //        "E": 1591154240950,            // Event Time
        //        "o":{
        //            "s":"BTCUSD_200925",       // Symbol
        //            "ps": "BTCUSD",            // Pair
        //            "S":"SELL",                // Side
        //            "o":"LIMIT",               // Order Type
        //            "f":"IOC",                 // Time in Force
        //            "q":"1",                   // Original Quantity
        //            "p":"9425.5",              // Price
        //            "ap":"9496.5",             // Average Price
        //            "X":"FILLED",              // Order Status
        //            "l":"1",                   // Order Last Filled Quantity
        //            "z":"1",                   // Order Filled Accumulated Quantity
        //            "T": 1591154240949,        // Order Trade Time
        //        }
        //    }
        //
        const rawLiquidation = this.safeValue(message, 'o', {});
        const marketId = this.safeString(rawLiquidation, 's');
        const market = this.safeMarket(marketId, undefined, '', 'contract');
        const symbol = market['symbol'];
        const liquidation = this.parseWsLiquidation(rawLiquidation, market);
        if (this.liquidations === undefined) {
            const limit = this.safeInteger(this.options, 'liquidationsLimit', 1000);
            this.liquidations = new Cache.ArrayCache(limit);
        }
        const cache = this.liquidations;
        cache.append(liquidation);
        client.resolve([liquidation], 'liquidations');
        client.resolve([liquidation], 'liquidations::' + symbol);
    }
    parseWsLiquidation(liquidation, market = undefined) {
        //
        // future
        //    {
        //        "s":"BTCUSDT",
        //        "S":"BUY",
        //        "o":"LIMIT",
        //        "f":"IOC",
        //        "q":"1.437",
        //        "p":"35100.81",
        //        "ap":"34959.70",
        //        "X":"FILLED",
        //        "l":"1.437",
        //        "z":"1.437",
        //        "T":1698871323059
        //    }
        // delivery
        //    {
        //        "s":"BTCUSD_200925",       // Symbol
        //        "ps": "BTCUSD",            // Pair
        //        "S":"SELL",                // Side
        //        "o":"LIMIT",               // Order Type
        //        "f":"IOC",                 // Time in Force
        //        "q":"1",                   // Original Quantity
        //        "p":"9425.5",              // Price
        //        "ap":"9496.5",             // Average Price
        //        "X":"FILLED",              // Order Status
        //        "l":"1",                   // Order Last Filled Quantity
        //        "z":"1",                   // Order Filled Accumulated Quantity
        //        "T": 1591154240949,        // Order Trade Time
        //    }
        // myLiquidation
        //    {
        //        "s":"BTCUSDT",              // Symbol
        //        "c":"TEST",                 // Client Order Id
        //          // special client order id:
        //          // starts with "autoclose-": liquidation order
        //          // "adl_autoclose": ADL auto close order
        //          // "settlement_autoclose-": settlement order for delisting or delivery
        //        "S":"SELL",                 // Side
        //        "o":"TRAILING_STOP_MARKET", // Order Type
        //        "f":"GTC",                  // Time in Force
        //        "q":"0.001",                // Original Quantity
        //        "p":"0",                    // Original Price
        //        "ap":"0",                   // Average Price
        //        "sp":"7103.04",             // Stop Price. Please ignore with TRAILING_STOP_MARKET order
        //        "x":"NEW",                  // Execution Type
        //        "X":"NEW",                  // Order Status
        //        "i":8886774,                // Order Id
        //        "l":"0",                    // Order Last Filled Quantity
        //        "z":"0",                    // Order Filled Accumulated Quantity
        //        "L":"0",                    // Last Filled Price
        //        "N":"USDT",                 // Commission Asset, will not push if no commission
        //        "n":"0",                    // Commission, will not push if no commission
        //        "T":1568879465650,          // Order Trade Time
        //        "t":0,                      // Trade Id
        //        "b":"0",                    // Bids Notional
        //        "a":"9.91",                 // Ask Notional
        //        "m":false,                  // Is this trade the maker side?
        //        "R":false,                  // Is this reduce only
        //        "wt":"CONTRACT_PRICE",      // Stop Price Working Type
        //        "ot":"TRAILING_STOP_MARKET",// Original Order Type
        //        "ps":"LONG",                // Position Side
        //        "cp":false,                 // If Close-All, pushed with conditional order
        //        "AP":"7476.89",             // Activation Price, only puhed with TRAILING_STOP_MARKET order
        //        "cr":"5.0",                 // Callback Rate, only puhed with TRAILING_STOP_MARKET order
        //        "pP": false,                // If price protection is turned on
        //        "si": 0,                    // ignore
        //        "ss": 0,                    // ignore
        //        "rp":"0",                   // Realized Profit of the trade
        //        "V":"EXPIRE_TAKER",         // STP mode
        //        "pm":"OPPONENT",            // Price match mode
        //        "gtd":0                     // TIF GTD order auto cancel time
        //    }
        //
        const marketId = this.safeString(liquidation, 's');
        market = this.safeMarket(marketId, market, undefined, 'swap');
        const timestamp = this.safeInteger(liquidation, 'T');
        return this.safeLiquidation({
            'info': liquidation,
            'symbol': this.safeSymbol(marketId, market),
            'contracts': this.safeNumber(liquidation, 'l'),
            'contractSize': this.safeNumber(market, 'contractSize'),
            'price': this.safeNumber(liquidation, 'ap'),
            'side': this.safeStringLower(liquidation, 'S'),
            'baseValue': undefined,
            'quoteValue': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
        });
    }
    /**
     * @method
     * @name binance#watchMyLiquidations
     * @description watch the private liquidations of a trading pair
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/user-data-streams/Event-Order-Update
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/user-data-streams/Event-Order-Update
     * @param {string} symbol unified CCXT market symbol
     * @param {int} [since] the earliest time in ms to fetch liquidations for
     * @param {int} [limit] the maximum number of liquidation structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an array of [liquidation structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#liquidation-structure}
     */
    watchMyLiquidations(symbol, since = undefined, limit = undefined, params = {}) {
        return this.watchMyLiquidationsForSymbols([symbol], since, limit, params);
    }
    /**
     * @method
     * @name binance#watchMyLiquidationsForSymbols
     * @description watch the private liquidations of a trading pair
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/user-data-streams/Event-Order-Update
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/user-data-streams/Event-Order-Update
     * @param {string[]} symbols list of unified market symbols
     * @param {int} [since] the earliest time in ms to fetch liquidations for
     * @param {int} [limit] the maximum number of liquidation structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an array of [liquidation structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#liquidation-structure}
     */
    async watchMyLiquidationsForSymbols(symbols, since = undefined, limit = undefined, params = {}) {
        if (this.markets === undefined) {
            await this.loadMarkets();
        }
        symbols = this.marketSymbols(symbols, undefined, true, true, true);
        const market = this.getMarketFromSymbols(symbols);
        const messageHashes = ['myLiquidations'];
        if (!this.isEmpty(symbols)) {
            for (let i = 0; i < symbols.length; i++) {
                const symbol = symbols[i];
                messageHashes.push('myLiquidations::' + symbol);
            }
        }
        let type = undefined;
        let subType = undefined;
        [type, subType, params] = this.resolveAuthType('watchMyLiquidationsForSymbols', market, params);
        // hand the resolved type forward: the helper already omitted type and
        // subType from params, so a bare authenticate would re-derive from
        // options.defaultType and seed a different bucket than the listenKey
        // read below indexes - the derive-first shape watchBalance uses
        await this.authenticate(this.extend({ 'type': type, 'subType': subType }, params));
        const listenKey = this.options[type]['listenKey'];
        const url = this.getPrivateWsUrl(type, listenKey);
        const message = undefined;
        const newLiquidations = await this.watchMultiple(url, messageHashes, message, [type]);
        if (this.newUpdates) {
            return newLiquidations;
        }
        return this.filterBySymbolsSinceLimit(this.liquidations, symbols, since, limit);
    }
    handleMyLiquidation(client, message) {
        //
        //    {
        //        "s":"BTCUSDT",              // Symbol
        //        "c":"TEST",                 // Client Order Id
        //          // special client order id:
        //          // starts with "autoclose-": liquidation order
        //          // "adl_autoclose": ADL auto close order
        //          // "settlement_autoclose-": settlement order for delisting or delivery
        //        "S":"SELL",                 // Side
        //        "o":"TRAILING_STOP_MARKET", // Order Type
        //        "f":"GTC",                  // Time in Force
        //        "q":"0.001",                // Original Quantity
        //        "p":"0",                    // Original Price
        //        "ap":"0",                   // Average Price
        //        "sp":"7103.04",             // Stop Price. Please ignore with TRAILING_STOP_MARKET order
        //        "x":"NEW",                  // Execution Type
        //        "X":"NEW",                  // Order Status
        //        "i":8886774,                // Order Id
        //        "l":"0",                    // Order Last Filled Quantity
        //        "z":"0",                    // Order Filled Accumulated Quantity
        //        "L":"0",                    // Last Filled Price
        //        "N":"USDT",                 // Commission Asset, will not push if no commission
        //        "n":"0",                    // Commission, will not push if no commission
        //        "T":1568879465650,          // Order Trade Time
        //        "t":0,                      // Trade Id
        //        "b":"0",                    // Bids Notional
        //        "a":"9.91",                 // Ask Notional
        //        "m":false,                  // Is this trade the maker side?
        //        "R":false,                  // Is this reduce only
        //        "wt":"CONTRACT_PRICE",      // Stop Price Working Type
        //        "ot":"TRAILING_STOP_MARKET",// Original Order Type
        //        "ps":"LONG",                // Position Side
        //        "cp":false,                 // If Close-All, pushed with conditional order
        //        "AP":"7476.89",             // Activation Price, only puhed with TRAILING_STOP_MARKET order
        //        "cr":"5.0",                 // Callback Rate, only puhed with TRAILING_STOP_MARKET order
        //        "pP": false,                // If price protection is turned on
        //        "si": 0,                    // ignore
        //        "ss": 0,                    // ignore
        //        "rp":"0",                   // Realized Profit of the trade
        //        "V":"EXPIRE_TAKER",         // STP mode
        //        "pm":"OPPONENT",            // Price match mode
        //        "gtd":0                     // TIF GTD order auto cancel time
        //    }
        //
        const orderType = this.safeString(message, 'o');
        if (orderType !== 'LIQUIDATION') {
            return;
        }
        const marketId = this.safeString(message, 's');
        const market = this.safeMarket(marketId, undefined, undefined, 'swap');
        const symbol = this.safeSymbol(marketId, market);
        const liquidation = this.parseWsLiquidation(message, market);
        let cache = this.myLiquidations;
        if (cache === undefined) {
            const limit = this.safeInteger(this.options, 'myLiquidationsLimit', 1000);
            cache = new Cache.ArrayCache(limit);
        }
        cache.append(liquidation);
        this.myLiquidations = cache;
        client.resolve([liquidation], 'myLiquidations');
        client.resolve([liquidation], 'myLiquidations::' + symbol);
    }
    /**
     * @method
     * @name binance#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://developers.binance.com/docs/binance-spot-api-docs/web-socket-streams#partial-book-depth-streams
     * @see https://developers.binance.com/docs/binance-spot-api-docs/web-socket-streams#diff-depth-stream
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/websocket-market-streams/Partial-Book-Depth-Streams
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/websocket-market-streams/Diff-Book-Depth-Streams
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/websocket-market-streams/Diff-Book-Depth-Streams-RPI
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/websocket-market-streams/Partial-Book-Depth-Streams
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/websocket-market-streams/Diff-Book-Depth-Streams
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure}
     */
    watchOrderBook(symbol, limit = undefined, params = {}) {
        //
        // todo add support for <levels>-snapshots (depth)
        // https://github.com/binance-exchange/binance-official-api-docs/blob/master/web-socket-streams.md#partial-book-depth-streams        // <symbol>@depth<levels>@100ms or <symbol>@depth<levels> (1000ms)
        // valid <levels> are 5, 10, or 20
        //
        // default 100, max 1000, valid limits 5, 10, 20, 50, 100, 500, 1000
        //
        // notice the differences between trading futures and spot trading
        // the algorithms use different urls in step 1
        // delta caching and merging also differs in steps 4, 5, 6
        //
        // spot/margin
        // https://binance-docs.github.io/apidocs/spot/en/#how-to-manage-a-local-order-book-correctly
        //
        // 1. Open a stream to wss://stream.binance.com:9443/ws/bnbbtc@depth.
        // 2. Buffer the events you receive from the stream.
        // 3. Get a depth snapshot from https://www.binance.com/api/v1/depth?symbol=BNBBTC&limit=1000 .
        // 4. Drop any event where u is <= lastUpdateId in the snapshot.
        // 5. The first processed event should have U <= lastUpdateId+1 AND u >= lastUpdateId+1.
        // 6. While listening to the stream, each new event's U should be equal to the previous event's u+1.
        // 7. The data in each event is the absolute quantity for a price level.
        // 8. If the quantity is 0, remove the price level.
        // 9. Receiving an event that removes a price level that is not in your local order book can happen and is normal.
        //
        // futures
        // https://binance-docs.github.io/apidocs/futures/en/#how-to-manage-a-local-order-book-correctly
        //
        // 1. Open a stream to wss://fstream.binance.com/stream?streams=btcusdt@depth.
        // 2. Buffer the events you receive from the stream. For same price, latest received update covers the previous one.
        // 3. Get a depth snapshot from https://fapi.binance.com/fapi/v1/depth?symbol=BTCUSDT&limit=1000 .
        // 4. Drop any event where u is < lastUpdateId in the snapshot.
        // 5. The first processed event should have U <= lastUpdateId AND u >= lastUpdateId
        // 6. While listening to the stream, each new event's pu should be equal to the previous event's u, otherwise initialize the process from step 3.
        // 7. The data in each event is the absolute quantity for a price level.
        // 8. If the quantity is 0, remove the price level.
        // 9. Receiving an event that removes a price level that is not in your local order book can happen and is normal.
        //
        return this.watchOrderBookForSymbols([symbol], limit, params);
    }
    /**
     * @method
     * @name binance#watchOrderBookForSymbols
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://developers.binance.com/docs/binance-spot-api-docs/web-socket-streams#partial-book-depth-streams
     * @see https://developers.binance.com/docs/binance-spot-api-docs/web-socket-streams#diff-depth-stream
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/websocket-market-streams/Partial-Book-Depth-Streams
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/websocket-market-streams/Diff-Book-Depth-Streams
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/websocket-market-streams/Diff-Book-Depth-Streams-RPI
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/websocket-market-streams/Partial-Book-Depth-Streams
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/websocket-market-streams/Diff-Book-Depth-Streams
     * @param {string[]} symbols unified array of symbols
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.rpi] *future only* set to true to use the RPI endpoint
     * @returns {object} an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
     */
    async watchOrderBookForSymbols(symbols, limit = undefined, params = {}) {
        if (this.markets === undefined) {
            await this.loadMarkets();
        }
        symbols = this.marketSymbols(symbols, undefined, false, true, true);
        const firstMarket = this.market(symbols[0]);
        let type = firstMarket['type'];
        if (firstMarket['option'] === true) {
            type = 'option';
        }
        else if (firstMarket['contract'] === true) {
            type = (firstMarket['linear'] === true) ? 'future' : 'delivery';
        }
        let name = 'depth';
        let streamHash = 'multipleOrderbook';
        if (symbols !== undefined) {
            const symbolsLength = symbols.length;
            if (symbolsLength > 200) {
                throw new errors.BadRequest(this.id + ' watchOrderBookForSymbols() accepts 200 symbols at most. To watch more symbols call watchOrderBookForSymbols() multiple times');
            }
            streamHash += '::' + symbols.join(',');
        }
        let watchOrderBookRate = undefined;
        [watchOrderBookRate, params] = this.handleOptionAndParams(params, 'watchOrderBookForSymbols', 'watchOrderBookRate', '100');
        let rpi = undefined;
        [rpi, params] = this.handleOptionAndParams(params, 'watchOrderBookForSymbols', 'rpi', false);
        if (rpi && type === 'future') {
            name = 'rpiDepth';
            watchOrderBookRate = '500';
        }
        const subParams = [];
        const messageHashes = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const market = this.market(symbol);
            messageHashes.push('orderbook::' + symbol);
            const subscriptionHash = market['lowercaseId'] + '@' + name;
            if (watchOrderBookRate === undefined) {
                throw new errors.ArgumentsRequired(this.id + ' watchOrderBookForSymbols() watchOrderBookRate is required');
            }
            const symbolHash = subscriptionHash + '@' + watchOrderBookRate.toString() + 'ms';
            subParams.push(symbolHash);
        }
        const messageHashesLength = messageHashes.length;
        const url = this.getWsUrl(type, this.getFutureWsCategory(name)) + '/' + this.stream(type, streamHash, messageHashesLength);
        const requestId = this.requestId(url);
        const request = {
            'method': 'SUBSCRIBE',
            'params': subParams,
            'id': requestId,
        };
        const subscription = {
            'id': requestId.toString(),
            'name': name,
            'symbols': symbols,
            'method': this.handleOrderBookSubscription,
            'limit': limit,
            'type': type,
            'params': params,
        };
        const orderbook = await this.watchMultiple(url, messageHashes, this.extend(request, params), messageHashes, subscription);
        return orderbook.limit();
    }
    /**
     * @method
     * @name binance#unWatchOrderBookForSymbols
     * @description unWatches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://developers.binance.com/docs/binance-spot-api-docs/web-socket-streams#partial-book-depth-streams
     * @see https://developers.binance.com/docs/binance-spot-api-docs/web-socket-streams#diff-depth-stream
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/websocket-market-streams/Partial-Book-Depth-Streams
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/websocket-market-streams/Diff-Book-Depth-Streams
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/websocket-market-streams/Partial-Book-Depth-Streams
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/websocket-market-streams/Diff-Book-Depth-Streams
     * @param {string[]} symbols unified array of symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure}
     */
    async unWatchOrderBookForSymbols(symbols, params = {}) {
        if (this.markets === undefined) {
            await this.loadMarkets();
        }
        symbols = this.marketSymbols(symbols, undefined, false, true, true);
        const firstMarket = this.market(symbols[0]);
        let type = firstMarket['type'];
        if (firstMarket['option'] === true) {
            type = 'option';
        }
        else if (firstMarket['contract'] === true) {
            type = (firstMarket['linear'] === true) ? 'future' : 'delivery';
        }
        const name = 'depth';
        let streamHash = 'multipleOrderbook';
        if (symbols !== undefined) {
            streamHash += '::' + symbols.join(',');
        }
        const watchOrderBookRate = this.safeString(this.options, 'watchOrderBookRate', '100');
        const subParams = [];
        const subMessageHashes = [];
        const messageHashes = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const market = this.market(symbol);
            subMessageHashes.push('orderbook::' + symbol);
            messageHashes.push('unsubscribe:orderbook:' + symbol);
            const streamId = market['lowercaseId'];
            const subscriptionHash = streamId + '@' + name;
            const symbolHash = subscriptionHash + '@' + watchOrderBookRate + 'ms';
            subParams.push(symbolHash);
        }
        const messageHashesLength = subMessageHashes.length;
        const url = this.getWsUrl(type, this.getFutureWsCategory('depth')) + '/' + this.stream(type, streamHash, messageHashesLength);
        const requestId = this.requestId(url);
        const request = {
            'method': 'UNSUBSCRIBE',
            'params': subParams,
            'id': requestId,
        };
        const subscription = {
            'unsubscribe': true,
            'id': requestId.toString(),
            'symbols': symbols,
            'subMessageHashes': subMessageHashes,
            'messageHashes': messageHashes,
            'topic': 'orderbook',
        };
        return await this.watchMultiple(url, messageHashes, this.extend(request, params), messageHashes, subscription);
    }
    /**
     * @method
     * @name binance#unWatchOrderBook
     * @description unWatches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://developers.binance.com/docs/binance-spot-api-docs/web-socket-streams#partial-book-depth-streams
     * @see https://developers.binance.com/docs/binance-spot-api-docs/web-socket-streams#diff-depth-stream
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/websocket-market-streams/Partial-Book-Depth-Streams
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/websocket-market-streams/Diff-Book-Depth-Streams
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/websocket-market-streams/Partial-Book-Depth-Streams
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/websocket-market-streams/Diff-Book-Depth-Streams
     * @param {string} symbol unified array of symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure}
     */
    unWatchOrderBook(symbol, params = {}) {
        return this.unWatchOrderBookForSymbols([symbol], params);
    }
    /**
     * @method
     * @name binance#fetchOrderBookWs
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://developers.binance.com/docs/binance-spot-api-docs/websocket-api/market-data-requests#order-book
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/websocket-api/Order-Book
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure}
     */
    async fetchOrderBookWs(symbol, limit = undefined, params = {}) {
        if (this.markets === undefined) {
            await this.loadMarkets();
        }
        const market = this.market(symbol);
        const payload = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            payload['limit'] = limit;
        }
        const marketType = this.getMarketType('fetchOrderBookWs', market, params);
        if (marketType !== 'future') {
            throw new errors.BadRequest(this.id + ' fetchOrderBookWs only supports swap markets');
        }
        const url = this.urls['api']['ws']['ws-api'][marketType];
        const requestId = this.requestId(url);
        const messageHash = requestId.toString();
        let returnRateLimits = false;
        [returnRateLimits, params] = this.handleOptionAndParams(params, 'fetchOrderBookWs', 'returnRateLimits', false);
        payload['returnRateLimits'] = returnRateLimits;
        params = this.omit(params, 'test');
        const message = {
            'id': messageHash,
            'method': 'depth',
            'params': this.signParams(this.extend(payload, params)),
        };
        const subscription = {
            'method': this.handleFetchOrderBook,
        };
        const orderbook = await this.watch(url, messageHash, message, messageHash, subscription);
        orderbook['symbol'] = market['symbol'];
        return orderbook;
    }
    handleFetchOrderBook(client, message) {
        //
        //    {
        //        "id":"51e2affb-0aba-4821-ba75-f2625006eb43",
        //        "status":200,
        //        "result":{
        //            "lastUpdateId":1027024,
        //            "E":1589436922972,
        //            "T":1589436922959,
        //            "bids":[
        //               [
        //                  "4.00000000",
        //                  "431.00000000"
        //               ]
        //            ],
        //            "asks":[
        //               [
        //                  "4.00000200",
        //                  "12.00000000"
        //               ]
        //            ]
        //        }
        //    }
        //
        const messageHash = this.safeString(message, 'id');
        const result = this.safeDict(message, 'result');
        const timestamp = this.safeInteger(result, 'T');
        const orderbook = this.parseOrderBook(result, undefined, timestamp);
        orderbook['nonce'] = this.safeInteger2(result, 'lastUpdateId', 'u');
        client.resolve(orderbook, messageHash);
    }
    async fetchOrderBookSnapshot(client, message, subscription) {
        const symbol = this.safeString(subscription, 'symbol');
        const messageHash = 'orderbook::' + symbol;
        try {
            const defaultLimit = this.safeInteger(this.options, 'watchOrderBookLimit', 1000);
            const type = this.safeValue(subscription, 'type');
            const limit = this.safeInteger(subscription, 'limit', defaultLimit);
            const params = this.safeValue(subscription, 'params');
            // 3. Get a depth snapshot from https://www.binance.com/api/v1/depth?symbol=BNBBTC&limit=1000 .
            // todo: this is a synch blocking call - make it async
            // default 100, max 1000, valid limits 5, 10, 20, 50, 100, 500, 1000
            const snapshot = await this.fetchRestOrderBookSafe(symbol, limit, params);
            if (this.safeValue(this.orderbooks, symbol) === undefined) {
                // if the orderbook is dropped before the snapshot is received
                return;
            }
            const orderbook = this.safeValue(this.orderbooks, symbol);
            orderbook.reset(snapshot);
            // unroll the accumulated deltas
            const messages = orderbook.cache;
            orderbook.cache = [];
            for (let i = 0; i < messages.length; i++) {
                const messageItem = messages[i];
                const U = this.safeInteger(messageItem, 'U');
                const u = this.safeInteger(messageItem, 'u');
                if ((U === undefined) || (u === undefined)) {
                    continue;
                }
                const pu = this.safeInteger(messageItem, 'pu');
                if (type === 'future') {
                    // 4. Drop any event where u is < lastUpdateId in the snapshot
                    if (u < orderbook['nonce']) {
                        continue;
                    }
                    // 5. The first processed event should have U <= lastUpdateId AND u >= lastUpdateId
                    if ((U <= orderbook['nonce']) && (u >= orderbook['nonce']) || (pu === orderbook['nonce'])) {
                        this.handleOrderBookMessage(client, messageItem, orderbook);
                    }
                }
                else {
                    // 4. Drop any event where u is <= lastUpdateId in the snapshot
                    if (u <= orderbook['nonce']) {
                        continue;
                    }
                    // 5. The first processed event should have U <= lastUpdateId+1 AND u >= lastUpdateId+1
                    if (((U - 1) <= orderbook['nonce']) && ((u - 1) >= orderbook['nonce'])) {
                        this.handleOrderBookMessage(client, messageItem, orderbook);
                    }
                }
            }
            if (symbol !== undefined) {
                this.orderbooks[symbol] = orderbook;
            }
            client.resolve(orderbook, messageHash);
        }
        catch (e) {
            delete client.subscriptions[messageHash];
            client.reject(e, messageHash);
        }
    }
    handleDelta(bookside, delta) {
        const price = this.safeFloat(delta, 0);
        const amount = this.safeFloat(delta, 1);
        bookside.store(price, amount);
    }
    handleDeltas(bookside, deltas) {
        for (let i = 0; i < deltas.length; i++) {
            this.handleDelta(bookside, deltas[i]);
        }
    }
    handleOrderBookMessage(client, message, orderbook) {
        const u = this.safeInteger(message, 'u');
        this.handleDeltas(orderbook['asks'], this.safeValue(message, 'a', []));
        this.handleDeltas(orderbook['bids'], this.safeValue(message, 'b', []));
        orderbook['nonce'] = u;
        const timestamp = this.safeInteger(message, 'E');
        orderbook['timestamp'] = timestamp;
        orderbook['datetime'] = this.iso8601(timestamp);
        return orderbook;
    }
    handleOrderBook(client, message) {
        //
        // initial snapshot is fetched with ccxt's fetchOrderBook
        // the feed does not include a snapshot, just the deltas
        //
        //     {
        //         "e": "depthUpdate", // Event type
        //         "E": 1577554482280, // Event time
        //         "s": "BNBBTC", // Symbol
        //         "U": 157, // First update ID in event
        //         "u": 160, // Final update ID in event
        //         "b": [ // bids
        //             [ "0.0024", "10" ], // price, size
        //         ],
        //         "a": [ // asks
        //             [ "0.0026", "100" ], // price, size
        //         ]
        //     }
        //
        const marketId = this.safeString(message, 's');
        // the client url is the authoritative source for the market type — an
        // ambiguous id like BTCUSDT maps to both the spot and the linear swap
        // market, and picking the first match drops the message under the wrong
        // symbol and stalls the orderbook future (delivery/option ids are
        // unique, so the swap hint resolves those correctly too)
        const isSpot = this.isSpotUrl(client);
        const marketType = isSpot ? 'spot' : 'swap';
        const market = this.safeMarket(marketId, undefined, undefined, marketType);
        const symbol = market['symbol'];
        const messageHash = 'orderbook::' + symbol;
        if (!(symbol in this.orderbooks)) {
            //
            // https://github.com/ccxt/ccxt/issues/6672
            //
            // Sometimes Binance sends the first delta before the subscription
            // confirmation arrives. At that point the orderbook is not
            // initialized yet and the snapshot has not been requested yet
            // therefore it is safe to drop these premature messages.
            //
            return;
        }
        const orderbook = this.orderbooks[symbol];
        const nonce = this.safeInteger(orderbook, 'nonce');
        if (nonce === undefined) {
            // 2. Buffer the events you receive from the stream.
            orderbook.cache.push(message);
        }
        else {
            try {
                const U = this.safeInteger(message, 'U');
                if (U === undefined) {
                    return;
                }
                const u = this.safeInteger(message, 'u');
                if (u === undefined) {
                    return;
                }
                const pu = this.safeInteger(message, 'pu');
                if (pu === undefined) {
                    // spot
                    // 4. Drop any event where u is <= lastUpdateId in the snapshot
                    if (u > nonce) {
                        const timestamp = this.safeInteger(orderbook, 'timestamp');
                        let conditional = undefined;
                        if (timestamp === undefined) {
                            // 5. The first processed event should have U <= lastUpdateId+1 AND u >= lastUpdateId+1
                            conditional = ((U - 1) <= nonce) && ((u - 1) >= nonce);
                        }
                        else {
                            // 6. While listening to the stream, each new event's U should be equal to the previous event's u+1.
                            conditional = ((U - 1) === nonce);
                        }
                        if (conditional) {
                            this.handleOrderBookMessage(client, message, orderbook);
                            if (nonce < this.safeInteger(orderbook, 'nonce', 0)) {
                                client.resolve(orderbook, messageHash);
                            }
                        }
                        else {
                            const checksum = this.handleOption('watchOrderBook', 'checksum', true);
                            if (checksum === true) {
                                // todo: client.reject from handleOrderBookMessage properly
                                throw new errors.ChecksumError(this.id + ' ' + this.orderbookChecksumMessage(symbol));
                            }
                        }
                    }
                }
                else {
                    // future
                    // 4. Drop any event where u is < lastUpdateId in the snapshot
                    if (u >= nonce) {
                        // 5. The first processed event should have U <= lastUpdateId AND u >= lastUpdateId
                        // 6. While listening to the stream, each new event's pu should be equal to the previous event's u, otherwise initialize the process from step 3
                        if ((U <= nonce) || (pu === nonce)) {
                            this.handleOrderBookMessage(client, message, orderbook);
                            if (nonce <= this.safeInteger(orderbook, 'nonce', 0)) {
                                client.resolve(orderbook, messageHash);
                            }
                        }
                        else {
                            const checksum = this.handleOption('watchOrderBook', 'checksum', true);
                            if (checksum === true) {
                                // todo: client.reject from handleOrderBookMessage properly
                                throw new errors.ChecksumError(this.id + ' ' + this.orderbookChecksumMessage(symbol));
                            }
                        }
                    }
                }
            }
            catch (e) {
                if (symbol in this.orderbooks) {
                    delete this.orderbooks[symbol];
                }
                if (messageHash in client.subscriptions) {
                    delete client.subscriptions[messageHash];
                }
                client.reject(e, messageHash);
            }
        }
    }
    handleOrderBookSubscription(client, message, subscription) {
        const defaultLimit = this.safeInteger(this.options, 'watchOrderBookLimit', 1000);
        // const messageHash = this.safeString (subscription, 'messageHash');
        const symbolOfSubscription = this.safeString(subscription, 'symbol'); // watchOrderBook
        const symbols = this.safeValue(subscription, 'symbols', [symbolOfSubscription]); // watchOrderBookForSymbols
        const limit = this.safeInteger(subscription, 'limit', defaultLimit);
        // handle list of symbols
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            if (symbol in this.orderbooks) {
                delete this.orderbooks[symbol];
            }
            this.orderbooks[symbol] = this.orderBook({}, limit);
            subscription = this.extend(subscription, { 'symbol': symbol });
            // fetch the snapshot in a separate async call
            this.spawn(this.fetchOrderBookSnapshot, client, message, subscription);
        }
    }
    handleSubscriptionStatus(client, message) {
        //
        //     {
        //         "result": null,
        //         "id": 1574649734450
        //     }
        //
        const id = this.safeString(message, 'id');
        const subscriptionsById = this.indexBy(client.subscriptions, 'id');
        const subscription = this.safeValue(subscriptionsById, id, {});
        const method = this.safeValue(subscription, 'method');
        if (method !== undefined) {
            method.call(this, client, message, subscription);
        }
        const isUnSubMessage = this.safeBool(subscription, 'unsubscribe', false);
        if (isUnSubMessage === true) {
            this.handleUnSubscription(client, subscription);
        }
        return message;
    }
    handleUnSubscription(client, subscription) {
        const messageHashes = this.safeList(subscription, 'messageHashes', []);
        const subMessageHashes = this.safeList(subscription, 'subMessageHashes', []);
        for (let j = 0; j < messageHashes.length; j++) {
            const unsubHash = messageHashes[j];
            const subHash = subMessageHashes[j];
            this.cleanUnsubscription(client, subHash, unsubHash);
        }
        this.cleanCache(subscription);
    }
    /**
     * @method
     * @name binance#watchTradesForSymbols
     * @description get the list of most recent trades for a list of symbols
     * @see https://developers.binance.com/docs/binance-spot-api-docs/websocket-api/market-data-requests#aggregate-trades
     * @see https://developers.binance.com/docs/binance-spot-api-docs/websocket-api/market-data-requests#recent-trades
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/websocket-market-streams/Aggregate-Trade-Streams
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/websocket-market-streams/Aggregate-Trade-Streams
     * @param {string[]} symbols unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.name] the name of the method to call, 'trade' or 'aggTrade', default is 'trade'
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    async watchTradesForSymbols(symbols, since = undefined, limit = undefined, params = {}) {
        if (this.markets === undefined) {
            await this.loadMarkets();
        }
        symbols = this.marketSymbols(symbols, undefined, false, true, true);
        let streamHash = 'multipleTrades';
        if (symbols !== undefined) {
            const symbolsLength = symbols.length;
            if (symbolsLength > 200) {
                throw new errors.BadRequest(this.id + ' watchTradesForSymbols() accepts 200 symbols at most. To watch more symbols call watchTradesForSymbols() multiple times');
            }
            streamHash += '::' + symbols.join(',');
        }
        let name = undefined;
        [name, params] = this.handleOptionAndParams(params, 'watchTradesForSymbols', 'name', 'trade');
        params = this.omit(params, 'callerMethodName');
        const firstMarket = this.market(symbols[0]);
        let type = firstMarket['type'];
        const isOption = firstMarket['option'];
        if (isOption === true) {
            type = 'option';
        }
        else if (firstMarket['contract'] === true) {
            type = (firstMarket['linear'] === true) ? 'future' : 'delivery';
        }
        const messageHashes = [];
        const subParams = [];
        if (isOption === true) {
            // eOptions: always subscribe per-underlying (<underlying>@optionTrade)
            // handleTrade filters to the correct symbol via the 's' field
            const seenUnderlyings = {};
            for (let i = 0; i < symbols.length; i++) {
                const symbol = symbols[i];
                const market = this.market(symbol);
                messageHashes.push('trade::' + symbol);
                const baseIdLower = this.safeStringLower(market, 'baseId', '');
                const quoteIdLower = this.safeStringLower(market, 'quoteId', '');
                const underlying = baseIdLower + '' + quoteIdLower;
                if (!(underlying in seenUnderlyings)) {
                    seenUnderlyings[underlying] = true;
                    subParams.push(underlying + '@optionTrade');
                }
            }
        }
        else {
            for (let i = 0; i < symbols.length; i++) {
                const symbol = symbols[i];
                const market = this.market(symbol);
                messageHashes.push('trade::' + symbol);
                const rawHash = market['lowercaseId'] + '@' + name;
                subParams.push(rawHash);
            }
        }
        const query = this.omit(params, 'type');
        const subParamsLength = subParams.length;
        const url = this.getWsUrl(type, this.getFutureWsCategory(name)) + '/' + this.stream(type, streamHash, subParamsLength);
        const requestId = this.requestId(url);
        const request = {
            'method': 'SUBSCRIBE',
            'params': subParams,
            'id': requestId,
        };
        const subscribe = {
            'id': requestId,
        };
        const trades = await this.watchMultiple(url, messageHashes, this.extend(request, query), messageHashes, subscribe);
        if (this.newUpdates) {
            const first = this.safeValue(trades, 0);
            const tradeSymbol = this.safeString(first, 'symbol');
            limit = trades.getLimit(tradeSymbol, limit);
        }
        return this.filterBySinceLimit(trades, since, limit, 'timestamp', true);
    }
    /**
     * @method
     * @name binance#unWatchTradesForSymbols
     * @description unsubscribes from the trades channel
     * @see https://developers.binance.com/docs/binance-spot-api-docs/websocket-api/market-data-requests#aggregate-trades
     * @see https://developers.binance.com/docs/binance-spot-api-docs/websocket-api/market-data-requests#recent-trades
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/websocket-market-streams/Aggregate-Trade-Streams
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/websocket-market-streams/Aggregate-Trade-Streams
     * @param {string[]} symbols unified symbol of the market to fetch trades for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.name] the name of the method to call, 'trade' or 'aggTrade', default is 'trade'
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    async unWatchTradesForSymbols(symbols, params = {}) {
        if (this.markets === undefined) {
            await this.loadMarkets();
        }
        symbols = this.marketSymbols(symbols, undefined, false, true, true);
        let streamHash = 'multipleTrades';
        if (symbols !== undefined) {
            const symbolsLength = symbols.length;
            if (symbolsLength > 200) {
                throw new errors.BadRequest(this.id + ' watchTradesForSymbols() accepts 200 symbols at most. To watch more symbols call watchTradesForSymbols() multiple times');
            }
            streamHash += '::' + symbols.join(',');
        }
        let name = undefined;
        [name, params] = this.handleOptionAndParams(params, 'watchTradesForSymbols', 'name', 'trade');
        params = this.omit(params, 'callerMethodName');
        const firstMarket = this.market(symbols[0]);
        let type = firstMarket['type'];
        const isOption = firstMarket['option'];
        if (isOption === true) {
            type = 'option';
        }
        else if (firstMarket['contract'] === true) {
            type = (firstMarket['linear'] === true) ? 'future' : 'delivery';
        }
        const subMessageHashes = [];
        const subParams = [];
        const messageHashes = [];
        if (isOption === true) {
            // eOptions: always subscribe per-underlying (<underlying>@optionTrade)
            // handleTrade filters to the correct symbol via the 's' field
            const seenUnderlyings = {};
            for (let i = 0; i < symbols.length; i++) {
                const symbol = symbols[i];
                const market = this.market(symbol);
                subMessageHashes.push('trade::' + symbol);
                messageHashes.push('unsubscribe:trade:' + symbol);
                const baseIdLower = this.safeStringLower(market, 'baseId', '');
                const quoteIdLower = this.safeStringLower(market, 'quoteId', '');
                const underlying = baseIdLower + '' + quoteIdLower;
                if (!(underlying in seenUnderlyings)) {
                    seenUnderlyings[underlying] = true;
                    subParams.push(underlying + '@optionTrade');
                }
            }
        }
        else {
            for (let i = 0; i < symbols.length; i++) {
                const symbol = symbols[i];
                const market = this.market(symbol);
                subMessageHashes.push('trade::' + symbol);
                messageHashes.push('unsubscribe:trade:' + symbol);
                const rawHash = market['lowercaseId'] + '@' + name;
                subParams.push(rawHash);
            }
        }
        const query = this.omit(params, 'type');
        const subParamsLength = subParams.length;
        const url = this.getWsUrl(type, this.getFutureWsCategory(name)) + '/' + this.stream(type, streamHash, subParamsLength);
        const requestId = this.requestId(url);
        const request = {
            'method': 'UNSUBSCRIBE',
            'params': subParams,
            'id': requestId,
        };
        const subscription = {
            'unsubscribe': true,
            'id': requestId.toString(),
            'subMessageHashes': subMessageHashes,
            'messageHashes': messageHashes,
            'symbols': symbols,
            'topic': 'trades',
        };
        return await this.watchMultiple(url, messageHashes, this.extend(request, query), messageHashes, subscription);
    }
    /**
     * @method
     * @name binance#unWatchTrades
     * @description unsubscribes from the trades channel
     * @see https://developers.binance.com/docs/binance-spot-api-docs/websocket-api/market-data-requests#aggregate-trades
     * @see https://developers.binance.com/docs/binance-spot-api-docs/websocket-api/market-data-requests#recent-trades
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/websocket-market-streams/Aggregate-Trade-Streams
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/websocket-market-streams/Aggregate-Trade-Streams
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.name] the name of the method to call, 'trade' or 'aggTrade', default is 'trade'
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    unWatchTrades(symbol, params = {}) {
        return this.unWatchTradesForSymbols([symbol], params);
    }
    /**
     * @method
     * @name binance#watchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://developers.binance.com/docs/binance-spot-api-docs/websocket-api/market-data-requests#aggregate-trades
     * @see https://developers.binance.com/docs/binance-spot-api-docs/websocket-api/market-data-requests#recent-trades
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/websocket-market-streams/Aggregate-Trade-Streams
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/websocket-market-streams/Aggregate-Trade-Streams
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.name] the name of the method to call, 'trade' or 'aggTrade', default is 'trade'
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    async watchTrades(symbol, since = undefined, limit = undefined, params = {}) {
        params['callerMethodName'] = 'watchTrades';
        return await this.watchTradesForSymbols([symbol], since, limit, params);
    }
    parseWsTrade(trade, market = undefined) {
        //
        // public watchTrades
        //
        //     {
        //         "e": "trade",       // event type
        //         "E": 1579481530912, // event time
        //         "s": "ETHBTC",      // symbol
        //         "t": 158410082,     // trade id
        //         "p": "0.01914100",  // price
        //         "q": "0.00700000",  // quantity
        //         "b": 586187049,     // buyer order id
        //         "a": 586186710,     // seller order id
        //         "T": 1579481530910, // trade time
        //         "m": false,         // is the buyer the market maker
        //         "M": true           // binance docs say it should be ignored
        //     }
        //
        //     {
        //        "e": "aggTrade",  // Event type
        //        "E": 123456789,   // Event time
        //        "s": "BNBBTC",    // Symbol
        //        "a": 12345,       // Aggregate trade ID
        //        "p": "0.001",     // Price
        //        "q": "100",       // Quantity
        //        "f": 100,         // First trade ID
        //        "l": 105,         // Last trade ID
        //        "T": 123456785,   // Trade time
        //        "m": true,        // Is the buyer the market maker?
        //        "M": true         // Ignore
        //     }
        //
        // private watchMyTrades spot
        //
        //     {
        //         "e": "executionReport",
        //         "E": 1611063861489,
        //         "s": "BNBUSDT",
        //         "c": "m4M6AD5MF3b1ERe65l4SPq",
        //         "S": "BUY",
        //         "o": "MARKET",
        //         "f": "GTC",
        //         "q": "2.00000000",
        //         "p": "0.00000000",
        //         "P": "0.00000000",
        //         "F": "0.00000000",
        //         "g": -1,
        //         "C": '',
        //         "x": "TRADE",
        //         "X": "PARTIALLY_FILLED",
        //         "r": "NONE",
        //         "i": 1296882607,
        //         "l": "0.33200000",
        //         "z": "0.33200000",
        //         "L": "46.86600000",
        //         "n": "0.00033200",
        //         "N": "BNB",
        //         "T": 1611063861488,
        //         "t": 109747654,
        //         "I": 2696953381,
        //         "w": false,
        //         "m": false,
        //         "M": true,
        //         "O": 1611063861488,
        //         "Z": "15.55951200",
        //         "Y": "15.55951200",
        //         "Q": "0.00000000"
        //     }
        //
        // private watchMyTrades future/delivery
        //
        //     {
        //         "s": "BTCUSDT",
        //         "c": "pb2jD6ZQHpfzSdUac8VqMK",
        //         "S": "SELL",
        //         "o": "MARKET",
        //         "f": "GTC",
        //         "q": "0.001",
        //         "p": "0",
        //         "ap": "33468.46000",
        //         "sp": "0",
        //         "x": "TRADE",
        //         "X": "FILLED",
        //         "i": 13351197194,
        //         "l": "0.001",
        //         "z": "0.001",
        //         "L": "33468.46",
        //         "n": "0.00027086",
        //         "N": "BNB",
        //         "T": 1612095165362,
        //         "t": 458032604,
        //         "b": "0",
        //         "a": "0",
        //         "m": false,
        //         "R": false,
        //         "wt": "CONTRACT_PRICE",
        //         "ot": "MARKET",
        //         "ps": "BOTH",
        //         "cp": false,
        //         "rp": "0.00335000",
        //         "pP": false,
        //         "si": 0,
        //         "ss": 0
        //     }
        //
        const executionType = this.safeString(trade, 'x');
        const isTradeExecution = (executionType === 'TRADE');
        if (!isTradeExecution) {
            return this.parseTrade(trade, market);
        }
        const id = this.safeString2(trade, 't', 'a');
        const timestamp = this.safeInteger(trade, 'T');
        const price = this.safeString2(trade, 'L', 'p');
        let amount = this.safeString(trade, 'q');
        if (isTradeExecution) {
            amount = this.safeString(trade, 'l', amount);
        }
        let cost = this.safeString(trade, 'Y');
        if (cost === undefined) {
            if ((price !== undefined) && (amount !== undefined)) {
                cost = Precise["default"].stringMul(price, amount);
            }
        }
        const marketId = this.safeString(trade, 's');
        const fallbackType = ('ps' in trade) ? 'contract' : 'spot';
        const marketType = (market !== undefined) ? market['type'] : fallbackType;
        const symbol = this.safeSymbol(marketId, market, undefined, marketType);
        let side = this.safeStringLower(trade, 'S');
        let takerOrMaker = undefined;
        const orderId = this.safeString(trade, 'i');
        if ('m' in trade) {
            if (side === undefined) {
                side = (trade['m'] === true) ? 'sell' : 'buy'; // this is reversed intentionally
            }
            takerOrMaker = (trade['m'] === true) ? 'maker' : 'taker';
        }
        let fee = undefined;
        const feeCost = this.safeString(trade, 'n');
        if (feeCost !== undefined) {
            const feeCurrencyId = this.safeString(trade, 'N');
            const feeCurrencyCode = this.safeCurrencyCode(feeCurrencyId);
            fee = {
                'cost': feeCost,
                'currency': feeCurrencyCode,
            };
        }
        const type = this.safeStringLower(trade, 'o');
        return this.safeTrade({
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'symbol': symbol,
            'id': id,
            'order': orderId,
            'type': type,
            'takerOrMaker': takerOrMaker,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
        });
    }
    handleTrade(client, message) {
        // the trade streams push raw trade information in real-time
        // each trade has a unique buyer and seller
        const marketId = this.safeString(message, 's');
        // resolve the market from the transport url — an ambiguous id like
        // BTCUSDT maps to both the spot and the linear swap market
        const isSpot = this.isSpotUrl(client);
        const marketType = isSpot ? 'spot' : 'contract';
        const market = this.safeMarket(marketId, undefined, undefined, marketType);
        const symbol = market['symbol'];
        const messageHash = 'trade::' + symbol;
        const trade = this.parseWsTrade(message, market);
        let tradesArray = this.safeValue(this.trades, symbol);
        if (tradesArray === undefined) {
            const limit = this.safeInteger(this.options, 'tradesLimit', 1000);
            tradesArray = new Cache.ArrayCache(limit);
        }
        tradesArray.append(trade);
        this.trades[symbol] = tradesArray;
        client.resolve(tradesArray, messageHash);
    }
    /**
     * @method
     * @name binance#watchOHLCV
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://developers.binance.com/docs/binance-spot-api-docs/websocket-api/market-data-requests#klines
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/websocket-market-streams/Kline-Candlestick-Streams
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/websocket-market-streams/Kline-Candlestick-Streams
     * @see https://developers.binance.com/en/docs/catalog/advanced-trading-stocks-trading/api/ws-streams/market-streams#kline-stream
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.stock] set to true to use stocks market streams
     * @param {object} [params.timezone] if provided, kline intervals are interpreted in that timezone instead of UTC, example '+08:00'
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async watchOHLCV(symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        if (this.markets === undefined) {
            await this.loadMarkets();
        }
        const market = this.market(symbol);
        symbol = market['symbol'];
        let stock = this.safeBool(market, 'stock', false);
        [stock, params] = this.handleOptionAndParams(params, 'watchOHLCV', 'stock');
        if (stock === true) {
            if ((timeframe !== '5m') && (timeframe !== '1h') && (timeframe !== '1d') && (timeframe !== '1w') && (timeframe !== '1M')) {
                throw new errors.BadRequest(this.id + ' watchOHLCV only supports 5m, 1h, 1d, 1w, and 1M timeframes');
            }
            params['stock'] = true;
        }
        params['callerMethodName'] = 'watchOHLCV';
        const result = await this.watchOHLCVForSymbols([[symbol, timeframe]], since, limit, params);
        return result[symbol][timeframe];
    }
    /**
     * @method
     * @name binance#watchOHLCVForSymbols
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://developers.binance.com/docs/binance-spot-api-docs/websocket-api/market-data-requests#klines
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/websocket-market-streams/Kline-Candlestick-Streams
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/websocket-market-streams/Kline-Candlestick-Streams
     * @see https://developers.binance.com/en/docs/catalog/advanced-trading-stocks-trading/api/ws-streams/market-streams#kline-stream
     * @param {string[][]} symbolsAndTimeframes array of arrays containing unified symbols and timeframes to fetch OHLCV data for, example [['BTC/USDT', '1m'], ['LTC/USDT', '5m']]
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.stock] set to true to use stocks market streams
     * @param {object} [params.timezone] if provided, kline intervals are interpreted in that timezone instead of UTC, example '+08:00'
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async watchOHLCVForSymbols(symbolsAndTimeframes, since = undefined, limit = undefined, params = {}) {
        if (this.markets === undefined) {
            await this.loadMarkets();
        }
        let stock = false;
        [stock, params] = this.handleOptionAndParams(params, 'watchOHLCVForSymbols', 'stock', false);
        if (stock) {
            const stockStreams = [];
            const stockMessageHashes = [];
            for (let i = 0; i < symbolsAndTimeframes.length; i++) {
                const stockSymAndTf = symbolsAndTimeframes[i];
                const stockSymbolString = this.symbol(stockSymAndTf[0]);
                const stockMarket = this.market(stockSymbolString);
                const stockTicker = this.safeString2(stockMarket, 'base', 'id');
                const stockTickerString = (stockTicker === undefined) ? '' : stockTicker.toLowerCase();
                const stockTimeframeString = stockSymAndTf[1];
                const stockInterval = this.safeString(this.timeframes, stockTimeframeString, stockTimeframeString);
                if ((stockInterval !== '5m') && (stockInterval !== '1h') && (stockInterval !== '1d') && (stockInterval !== '1w') && (stockInterval !== '1M')) {
                    throw new errors.BadRequest(this.id + ' watchOHLCVForSymbols only supports 5m, 1h, 1d, 1w, and 1M timeframes');
                }
                stockStreams.push(stockTickerString + '@kline_' + stockInterval);
                stockMessageHashes.push('ohlcv::' + stockMarket['symbol'] + '::' + stockTimeframeString);
            }
            const stockRes = await this.watchStockMarketStream(stockStreams, stockMessageHashes, params);
            const [stockSymbol, stockTimeframe, stockCandles] = stockRes;
            if (this.newUpdates) {
                limit = stockCandles.getLimit(stockSymbol, limit);
            }
            const stockFiltered = this.filterBySinceLimit(stockCandles, since, limit, 0, true);
            return this.createOHLCVObject(stockSymbol, stockTimeframe, stockFiltered);
        }
        let klineType = undefined;
        [klineType, params] = this.handleParamString2(params, 'channel', 'name', 'kline');
        const symbols = this.getListFromObjectValues(symbolsAndTimeframes, 0);
        const marketSymbols = this.marketSymbols(symbols, undefined, false, false, true);
        const firstMarket = this.market(marketSymbols[0]);
        let type = firstMarket['type'];
        let wsUrlType = type;
        if (firstMarket['option'] === true) {
            type = 'option';
            wsUrlType = 'optionMarket'; // eOptions klines are served from /market/ws
        }
        else if (firstMarket['contract'] === true) {
            type = (firstMarket['linear'] === true) ? 'future' : 'delivery';
            wsUrlType = type;
        }
        const isSpot = (type === 'spot');
        let timezone = undefined;
        [timezone, params] = this.handleParamString(params, 'timezone');
        const isUtc8 = (timezone !== undefined) && ((timezone === '+08:00') || Precise["default"].stringEq(timezone, '8'));
        const rawHashes = [];
        const messageHashes = [];
        for (let i = 0; i < symbolsAndTimeframes.length; i++) {
            const symAndTf = symbolsAndTimeframes[i];
            const symbolString = symAndTf[0];
            const timeframeString = symAndTf[1];
            const interval = this.safeString(this.timeframes, timeframeString, timeframeString);
            const market = this.market(symbolString);
            let marketId = market['lowercaseId'];
            if (marketId === undefined) {
                throw new errors.ArgumentsRequired(this.id + ' watchOHLCVForSymbols() marketId is required');
            }
            if (klineType === 'indexPriceKline') {
                // weird behavior for index price kline we can't use the perp suffix
                marketId = marketId.replace('_perp', '');
            }
            const shouldUseUTC8 = (isUtc8 && isSpot);
            const suffix = '@+08:00';
            const utcSuffix = shouldUseUTC8 ? suffix : '';
            rawHashes.push(marketId + '@' + klineType + '_' + interval + utcSuffix);
            messageHashes.push('ohlcv::' + market['symbol'] + '::' + timeframeString);
        }
        const url = this.getWsUrl(wsUrlType, this.getFutureWsCategory(klineType)) + '/' + this.stream(wsUrlType, 'multipleOHLCV');
        const requestId = this.requestId(url);
        const request = {
            'method': 'SUBSCRIBE',
            'params': rawHashes,
            'id': requestId,
        };
        const subscribe = {
            'id': requestId,
        };
        params = this.omit(params, 'callerMethodName');
        const res = await this.watchMultiple(url, messageHashes, this.extend(request, params), messageHashes, subscribe);
        const [symbol, timeframe, candles] = res;
        if (this.newUpdates) {
            limit = candles.getLimit(symbol, limit);
        }
        const filtered = this.filterBySinceLimit(candles, since, limit, 0, true);
        return this.createOHLCVObject(symbol, timeframe, filtered);
    }
    /**
     * @method
     * @name binance#unWatchOHLCVForSymbols
     * @description unWatches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://developers.binance.com/docs/binance-spot-api-docs/websocket-api/market-data-requests#klines
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/websocket-market-streams/Kline-Candlestick-Streams
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/websocket-market-streams/Kline-Candlestick-Streams
     * @param {string[][]} symbolsAndTimeframes array of arrays containing unified symbols and timeframes to fetch OHLCV data for, example [['BTC/USDT', '1m'], ['LTC/USDT', '5m']]
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {object} [params.timezone] if provided, kline intervals are interpreted in that timezone instead of UTC, example '+08:00'
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async unWatchOHLCVForSymbols(symbolsAndTimeframes, params = {}) {
        if (this.markets === undefined) {
            await this.loadMarkets();
        }
        let klineType = undefined;
        [klineType, params] = this.handleParamString2(params, 'channel', 'name', 'kline');
        const symbols = this.getListFromObjectValues(symbolsAndTimeframes, 0);
        const marketSymbols = this.marketSymbols(symbols, undefined, false, false, true);
        const firstMarket = this.market(marketSymbols[0]);
        let type = firstMarket['type'];
        let wsUrlType = type;
        if (firstMarket['option'] === true) {
            type = 'option';
            wsUrlType = 'optionMarket'; // eOptions klines are served from /market/ws
        }
        else if (firstMarket['contract'] === true) {
            type = (firstMarket['linear'] === true) ? 'future' : 'delivery';
            wsUrlType = type;
        }
        const isSpot = (type === 'spot');
        let timezone = undefined;
        [timezone, params] = this.handleParamString(params, 'timezone');
        const isUtc8 = (timezone !== undefined) && ((timezone === '+08:00') || Precise["default"].stringEq(timezone, '8'));
        const rawHashes = [];
        const subMessageHashes = [];
        const messageHashes = [];
        for (let i = 0; i < symbolsAndTimeframes.length; i++) {
            const symAndTf = symbolsAndTimeframes[i];
            const symbolString = symAndTf[0];
            const timeframeString = symAndTf[1];
            const interval = this.safeString(this.timeframes, timeframeString, timeframeString);
            const market = this.market(symbolString);
            let marketId = market['lowercaseId'];
            if (marketId === undefined) {
                throw new errors.ArgumentsRequired(this.id + ' unWatchOHLCVForSymbols() marketId is required');
            }
            if (klineType === 'indexPriceKline') {
                // weird behavior for index price kline we can't use the perp suffix
                marketId = marketId.replace('_perp', '');
            }
            const shouldUseUTC8 = (isUtc8 && isSpot);
            const suffix = '@+08:00';
            const utcSuffix = shouldUseUTC8 ? suffix : '';
            rawHashes.push(marketId + '@' + klineType + '_' + interval + utcSuffix);
            subMessageHashes.push('ohlcv::' + market['symbol'] + '::' + timeframeString);
            messageHashes.push('unsubscribe::ohlcv::' + market['symbol'] + '::' + timeframeString);
        }
        const url = this.getWsUrl(wsUrlType, this.getFutureWsCategory(klineType)) + '/' + this.stream(wsUrlType, 'multipleOHLCV');
        const requestId = this.requestId(url);
        const request = {
            'method': 'UNSUBSCRIBE',
            'params': rawHashes,
            'id': requestId,
        };
        const subscribe = {
            'unsubscribe': true,
            'id': requestId.toString(),
            'symbols': symbols,
            'symbolsAndTimeframes': symbolsAndTimeframes,
            'subMessageHashes': subMessageHashes,
            'messageHashes': messageHashes,
            'topic': 'ohlcv',
        };
        params = this.omit(params, 'callerMethodName');
        return await this.watchMultiple(url, messageHashes, this.extend(request, params), messageHashes, subscribe);
    }
    /**
     * @method
     * @name binance#unWatchOHLCV
     * @description unWatches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://developers.binance.com/docs/binance-spot-api-docs/websocket-api/market-data-requests#klines
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/websocket-market-streams/Kline-Candlestick-Streams
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/websocket-market-streams/Kline-Candlestick-Streams
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {object} [params.timezone] if provided, kline intervals are interpreted in that timezone instead of UTC, example '+08:00'
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async unWatchOHLCV(symbol, timeframe = '1m', params = {}) {
        if (this.markets === undefined) {
            await this.loadMarkets();
        }
        const market = this.market(symbol);
        symbol = market['symbol'];
        params['callerMethodName'] = 'watchOHLCV';
        return await this.unWatchOHLCVForSymbols([[symbol, timeframe]], params);
    }
    handleOHLCV(client, message) {
        //
        //     {
        //         "e": "kline",
        //         "E": 1579482921215,
        //         "s": "ETHBTC",
        //         "k": {
        //             "t": 1579482900000,
        //             "T": 1579482959999,
        //             "s": "ETHBTC",
        //             "i": "1m",
        //             "f": 158411535,
        //             "L": 158411550,
        //             "o": "0.01913200",
        //             "c": "0.01913500",
        //             "h": "0.01913700",
        //             "l": "0.01913200",
        //             "v": "5.08400000",
        //             "n": 16,
        //             "x": false,
        //             "q": "0.09728060",
        //             "V": "3.30200000",
        //             "Q": "0.06318500",
        //             "B": "0"
        //         }
        //     }
        //
        let event = this.safeString(message, 'e');
        const eventMap = {
            'indexPrice_kline': 'indexPriceKline',
            'markPrice_kline': 'markPriceKline',
        };
        event = this.safeString(eventMap, event, event);
        const kline = this.safeValue(message, 'k');
        let marketId = this.safeString2(kline, 's', 'ps');
        if (event === 'indexPriceKline') {
            // indexPriceKline doesn't have the _PERP suffix
            marketId = this.safeString(message, 'ps');
        }
        const interval = this.safeString(kline, 'i');
        // use a reverse lookup in a static map instead
        const unifiedTimeframe = this.findTimeframe(interval);
        const parsed = [
            this.safeInteger(kline, 't'),
            this.safeFloat(kline, 'o'),
            this.safeFloat(kline, 'h'),
            this.safeFloat(kline, 'l'),
            this.safeFloat(kline, 'c'),
            this.safeFloat(kline, 'v'),
        ];
        // resolve the market from the transport url — an ambiguous id like
        // BTCUSDT maps to both the spot and the linear swap market
        const isSpot = this.isSpotUrl(client);
        const marketType = isSpot ? 'spot' : 'contract';
        const symbol = this.safeSymbol(marketId, undefined, undefined, marketType);
        const messageHash = 'ohlcv::' + symbol + '::' + unifiedTimeframe;
        this.ohlcvs[symbol] = this.safeValue(this.ohlcvs, symbol, {});
        let stored = this.safeValue(this.safeValue(this.ohlcvs, symbol), unifiedTimeframe);
        if (stored === undefined) {
            const limit = this.safeInteger(this.options, 'OHLCVLimit', 1000);
            stored = new Cache.ArrayCacheByTimestamp(limit);
            if (symbol !== undefined && unifiedTimeframe !== undefined) {
                this.ohlcvs[symbol][unifiedTimeframe] = stored;
            }
        }
        stored.append(parsed);
        const resolveData = [symbol, unifiedTimeframe, stored];
        client.resolve(resolveData, messageHash);
    }
    /**
     * @method
     * @name binance#fetchTickerWs
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.method] method to use can be ticker.price or ticker.book
     * @param {boolean} [params.returnRateLimits] return the rate limits for the exchange
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    async fetchTickerWs(symbol, params = {}) {
        if (this.markets === undefined) {
            await this.loadMarkets();
        }
        const market = this.market(symbol);
        const payload = {
            'symbol': market['id'],
        };
        const type = this.getMarketType('fetchTickerWs', market, params);
        if (type !== 'future') {
            throw new errors.BadRequest(this.id + ' fetchTickerWs only supports swap markets');
        }
        const url = this.urls['api']['ws']['ws-api'][type];
        const requestId = this.requestId(url);
        const messageHash = requestId.toString();
        const subscription = {
            'method': this.handleTickerWs,
        };
        let returnRateLimits = false;
        [returnRateLimits, params] = this.handleOptionAndParams(params, 'fetchTickerWs', 'returnRateLimits', false);
        payload['returnRateLimits'] = returnRateLimits;
        params = this.omit(params, 'test');
        let method = undefined;
        [method, params] = this.handleOptionAndParams(params, 'fetchTickerWs', 'method', 'ticker.book');
        const message = {
            'id': messageHash,
            'method': method,
            'params': this.signParams(this.extend(payload, params)),
        };
        const ticker = await this.watch(url, messageHash, message, messageHash, subscription);
        return ticker;
    }
    /**
     * @method
     * @name binance#fetchOHLCVWs
     * @description query historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://developers.binance.com/docs/binance-spot-api-docs/websocket-api/market-data-requests#klines
     * @param {string} symbol unified symbol of the market to query OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} since timestamp in ms of the earliest candle to fetch
     * @param {int} limit the maximum amount of candles to fetch
     * @param {object} params extra parameters specific to the exchange API endpoint
     * @param {int} params.until timestamp in ms of the earliest candle to fetch
     *
     * EXCHANGE SPECIFIC PARAMETERS
     * @param {string} params.timeZone default=0 (UTC)
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async fetchOHLCVWs(symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        if (this.markets === undefined) {
            await this.loadMarkets();
        }
        const market = this.market(symbol);
        const marketType = this.getMarketType('fetchOHLCVWs', market, params);
        if (marketType !== 'spot' && marketType !== 'future') {
            throw new errors.BadRequest(this.id + ' fetchOHLCVWs only supports spot or swap markets');
        }
        const url = this.urls['api']['ws']['ws-api'][marketType];
        const requestId = this.requestId(url);
        const messageHash = requestId.toString();
        let returnRateLimits = false;
        [returnRateLimits, params] = this.handleOptionAndParams(params, 'fetchOHLCVWs', 'returnRateLimits', false);
        const payload = {
            'symbol': this.marketId(symbol),
            'returnRateLimits': returnRateLimits,
            'interval': this.timeframes[timeframe],
        };
        const until = this.safeInteger(params, 'until');
        params = this.omit(params, 'until');
        if (since !== undefined) {
            payload['startTime'] = since;
        }
        if (limit !== undefined) {
            payload['limit'] = limit;
        }
        if (until !== undefined) {
            payload['endTime'] = until;
        }
        const message = {
            'id': messageHash,
            'method': 'klines',
            'params': this.extend(payload, params),
        };
        const subscription = {
            'method': this.handleFetchOHLCV,
        };
        return await this.watch(url, messageHash, message, messageHash, subscription);
    }
    handleFetchOHLCV(client, message) {
        //
        //    {
        //        "id": "1dbbeb56-8eea-466a-8f6e-86bdcfa2fc0b",
        //        "status": 200,
        //        "result": [
        //            [
        //                1655971200000,      // Kline open time
        //                "0.01086000",       // Open price
        //                "0.01086600",       // High price
        //                "0.01083600",       // Low price
        //                "0.01083800",       // Close price
        //                "2290.53800000",    // Volume
        //                1655974799999,      // Kline close time
        //                "24.85074442",      // Quote asset volume
        //                2283,               // Number of trades
        //                "1171.64000000",    // Taker buy base asset volume
        //                "12.71225884",      // Taker buy quote asset volume
        //                "0"                 // Unused field, ignore
        //            ]
        //        ],
        //        "rateLimits": [
        //            {
        //                "rateLimitType": "REQUEST_WEIGHT",
        //                "interval": "MINUTE",
        //                "intervalNum": 1,
        //                "limit": 6000,
        //                "count": 2
        //            }
        //        ]
        //    }
        //
        const result = this.safeList(message, 'result');
        const parsed = this.parseOHLCVs(result);
        // use a reverse lookup in a static map instead
        const messageHash = this.safeString(message, 'id');
        client.resolve(parsed, messageHash);
    }
    /**
     * @method
     * @name binance#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://developers.binance.com/docs/binance-spot-api-docs/web-socket-streams#individual-symbol-mini-ticker-stream
     * @see https://developers.binance.com/docs/binance-spot-api-docs/web-socket-streams#all-market-mini-tickers-stream
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/websocket-market-streams/Individual-Symbol-Ticker-Streams
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/websocket-market-streams/All-Market-Mini-Tickers-Stream
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/websocket-market-streams/All-Market-Mini-Tickers-Stream
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/websocket-market-streams/Individual-Symbol-Ticker-Streams
     * @see https://developers.binance.com/en/docs/catalog/advanced-trading-stocks-trading/api/ws-streams/market-streams#price-stream
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.stock] set to true to use the stocks aggregated price stream
     * @param {string} [params.name] stream to use can be ticker or miniTicker
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    async watchTicker(symbol, params = {}) {
        if (this.markets === undefined) {
            await this.loadMarkets();
        }
        symbol = this.symbol(symbol);
        const tickers = await this.watchTickers([symbol], this.extend(params, { 'callerMethodName': 'watchTicker' }));
        return tickers[symbol];
    }
    /**
     * @method
     * @name binance#watchMarkPrice
     * @description watches a mark price for a specific market
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/websocket-market-streams/Mark-Price-Stream
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.use1sFreq] *default is true* if set to true, the mark price will be updated every second, otherwise every 3 seconds
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    async watchMarkPrice(symbol, params = {}) {
        if (this.markets === undefined) {
            await this.loadMarkets();
        }
        symbol = this.symbol(symbol);
        const tickers = await this.watchMarkPrices([symbol], this.extend(params, { 'callerMethodName': 'watchMarkPrice' }));
        return tickers[symbol];
    }
    /**
     * @method
     * @name binance#watchMarkPrices
     * @description watches the mark price for all markets
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/websocket-market-streams/Mark-Price-Stream-for-All-market
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.use1sFreq] *default is true* if set to true, the mark price will be updated every second, otherwise every 3 seconds
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    async watchMarkPrices(symbols = undefined, params = {}) {
        let channelName = undefined;
        // for now watchmarkPrice uses the same messageHash as watchTicker
        // so it's impossible to watch both at the same time
        // refactor this to use different messageHashes
        [channelName, params] = this.handleOptionAndParams(params, 'watchMarkPrices', 'name', 'markPrice');
        const newTickers = await this.watchMultiTickerHelper('watchMarkPrices', channelName, symbols, params);
        if (this.newUpdates) {
            return newTickers;
        }
        return this.filterByArray(this.tickers, 'symbol', symbols);
    }
    /**
     * @method
     * @name binance#watchTickers
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @see https://developers.binance.com/docs/binance-spot-api-docs/web-socket-streams#individual-symbol-mini-ticker-stream
     * @see https://developers.binance.com/docs/binance-spot-api-docs/web-socket-streams#all-market-mini-tickers-stream
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/websocket-market-streams/Individual-Symbol-Ticker-Streams
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/websocket-market-streams/All-Market-Mini-Tickers-Stream
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/websocket-market-streams/All-Market-Mini-Tickers-Stream
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/websocket-market-streams/Individual-Symbol-Ticker-Streams
     * @see https://developers.binance.com/en/docs/catalog/advanced-trading-stocks-trading/api/ws-streams/market-streams#price-stream
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.stock] set to true to use the stocks price stream
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    async watchTickers(symbols = undefined, params = {}) {
        let stock = false;
        [stock, params] = this.handleOptionAndParams(params, 'watchTickers', 'stock', false);
        if (stock) {
            if (symbols === undefined) {
                throw new errors.ArgumentsRequired(this.id + ' watchTickers() with stock stream requires symbols');
            }
            symbols = this.marketSymbols(symbols, undefined, false, false, true);
            const stockResult = await this.watchStockMarketStream(['price'], ['stock:price'], params);
            if (this.newUpdates) {
                return stockResult;
            }
            return this.filterByArray(this.tickers, 'symbol', symbols);
        }
        let channelName = undefined;
        [channelName, params] = this.handleOptionAndParams(params, 'watchTickers', 'name', 'miniTicker');
        if (channelName === 'bookTicker') {
            throw new errors.BadRequest(this.id + ' deprecation notice - to subscribe for bids-asks, use watch_bids_asks() method instead');
        }
        const newTickers = await this.watchMultiTickerHelper('watchTickers', channelName, symbols, params);
        if (this.newUpdates) {
            return newTickers;
        }
        return this.filterByArray(this.tickers, 'symbol', symbols);
    }
    /**
     * @method
     * @name binance#unWatchTickers
     * @description unWatches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @see https://developers.binance.com/docs/binance-spot-api-docs/web-socket-streams#individual-symbol-mini-ticker-stream
     * @see https://developers.binance.com/docs/binance-spot-api-docs/web-socket-streams#all-market-mini-tickers-stream
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/websocket-market-streams/Individual-Symbol-Ticker-Streams
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/websocket-market-streams/All-Market-Mini-Tickers-Stream
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/websocket-market-streams/All-Market-Mini-Tickers-Stream
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/websocket-market-streams/Individual-Symbol-Ticker-Streams
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    async unWatchTickers(symbols = undefined, params = {}) {
        let channelName = undefined;
        [channelName, params] = this.handleOptionAndParams(params, 'watchTickers', 'name', 'ticker');
        if (channelName === 'bookTicker') {
            throw new errors.BadRequest(this.id + ' deprecation notice - to subscribe for bids-asks, use watch_bids_asks() method instead');
        }
        return await this.watchMultiTickerHelper('unWatchTickers', channelName, symbols, params, true);
    }
    /**
     * @method
     * @name binance#unWatchMarkPrices
     * @description unWatches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/websocket-market-streams/Mark-Price-Stream
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    async unWatchMarkPrices(symbols = undefined, params = {}) {
        let channelName = undefined;
        [channelName, params] = this.handleOptionAndParams(params, 'watchMarkPrices', 'name', 'markPrice');
        if (this.markets === undefined) {
            await this.loadMarkets();
        }
        return await this.watchMultiTickerHelper('unWatchMarkPrices', channelName, symbols, params, true);
    }
    /**
     * @method
     * @name binance#unWatchMarkPrice
     * @description unWatches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/websocket-market-streams/Mark-Price-Stream
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    unWatchMarkPrice(symbol, params = {}) {
        return this.unWatchMarkPrices([symbol], params);
    }
    /**
     * @method
     * @name binance#unWatchBidsAsks
     * @description unWatches best bid & ask for symbols
     * @see https://developers.binance.com/docs/binance-spot-api-docs/web-socket-streams#individual-book-ticker-streams
     * @see https://developers.binance.com/docs/derivatives/options-trading/websocket-market-streams/Bookticker
     * @param {string[]} [symbols] unified symbols
     * @param {object} [params] extra parameters
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    async unWatchBidsAsks(symbols = undefined, params = {}) {
        return await this.watchMultiTickerHelper('unWatchBidsAsks', 'bookTicker', symbols, params, true);
    }
    /**
     * @method
     * @name binance#unWatchTicker
     * @description unWatches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @see https://developers.binance.com/docs/binance-spot-api-docs/web-socket-streams#individual-symbol-mini-ticker-stream
     * @see https://developers.binance.com/docs/binance-spot-api-docs/web-socket-streams#all-market-mini-tickers-stream
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/websocket-market-streams/Individual-Symbol-Ticker-Streams
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/websocket-market-streams/All-Market-Mini-Tickers-Stream
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/websocket-market-streams/All-Market-Mini-Tickers-Stream
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/websocket-market-streams/Individual-Symbol-Ticker-Streams
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    unWatchTicker(symbol, params = {}) {
        return this.unWatchTickers([symbol], params);
    }
    /**
     * @method
     * @name binance#watchBidsAsks
     * @description watches best bid & ask for symbols
     * @see https://developers.binance.com/docs/binance-spot-api-docs/websocket-api/market-data-requests#symbol-order-book-ticker
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/websocket-market-streams/All-Book-Tickers-Stream
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/websocket-market-streams/All-Book-Tickers-Stream
     * @see https://developers.binance.com/en/docs/catalog/advanced-trading-stocks-trading/api/ws-streams/market-streams#quote-stream
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.stock] set to true to use stocks quote streams
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    async watchBidsAsks(symbols = undefined, params = {}) {
        if (this.markets === undefined) {
            await this.loadMarkets();
        }
        let stock = false;
        [stock, params] = this.handleOptionAndParams(params, 'watchBidsAsks', 'stock', false);
        if (stock) {
            if (symbols === undefined) {
                throw new errors.ArgumentsRequired(this.id + ' watchBidsAsks() with stock stream requires symbols');
            }
            symbols = this.marketSymbols(symbols, undefined, false, false, true);
            const stockStreams = [];
            const stockMessageHashes = [];
            for (let i = 0; i < symbols.length; i++) {
                const stockTicker = this.getStockTickerFromSymbol(symbols[i]);
                stockStreams.push(stockTicker + '@quote');
                stockMessageHashes.push('stock:quote:' + symbols[i]);
            }
            const stockResult = await this.watchStockMarketStream(stockStreams, stockMessageHashes, params);
            if (this.newUpdates) {
                return stockResult;
            }
            return this.filterByArray(this.bidsasks, 'symbol', symbols);
        }
        symbols = this.marketSymbols(symbols, undefined, true, false, true);
        const result = await this.watchMultiTickerHelper('watchBidsAsks', 'bookTicker', symbols, params);
        if (this.newUpdates) {
            return result;
        }
        return this.filterByArray(this.bidsasks, 'symbol', symbols);
    }
    async watchMultiTickerHelper(methodName, channelName, symbols = undefined, params = {}, isUnsubscribe = false) {
        if (this.markets === undefined) {
            await this.loadMarkets();
        }
        symbols = this.marketSymbols(symbols, undefined, true, false, true);
        const isBidAsk = (channelName === 'bookTicker');
        const isMarkPrice = (channelName === 'markPrice');
        const use1sFreq = this.safeBool(params, 'use1sFreq', true);
        let firstMarket = undefined;
        let marketType = undefined;
        const symbolsDefined = (symbols !== undefined);
        if (symbols !== undefined) {
            firstMarket = this.market(symbols[0]);
        }
        const userDefaultType = this.safeString(this.options, 'defaultType');
        const defaultMarket = (isMarkPrice && userDefaultType !== 'option') ? 'swap' : undefined;
        [marketType, params] = this.handleMarketTypeAndParams(methodName, firstMarket, params, defaultMarket);
        let subType = undefined;
        [subType, params] = this.handleSubTypeAndParams(methodName, firstMarket, params);
        // use marketType (not firstMarket) so the no-symbols case with defaultType='option' is also detected
        const isOptionMarkPrice = (isMarkPrice && marketType === 'option');
        let rawMarketType = undefined;
        if (marketType === 'option') {
            // check option first — isLinear returns true for linear-settled options, which would incorrectly route to futures
            // eOptions: mark price and klines stream from /market/stream; tickers/bids-asks/depth/trades from /public/stream
            rawMarketType = (isOptionMarkPrice) ? 'optionMarket' : 'option';
        }
        else if (this.isLinear(marketType, subType)) {
            rawMarketType = 'future';
        }
        else if (this.isInverse(marketType, subType)) {
            rawMarketType = 'delivery';
        }
        else if (marketType === 'spot') {
            rawMarketType = marketType;
        }
        else {
            throw new errors.NotSupported(this.id + ' ' + methodName + '() does not support options markets');
        }
        // eOptions tickers have a different stream name (@optionTicker) but the same event type (24hrTicker)
        // so only the subscription arg changes — channelName stays as-is to keep messageHashes aligned
        const isOptionTicker = (marketType === 'option' && !isMarkPrice && !isBidAsk);
        if (isMarkPrice && !this.inArray(marketType, ['swap', 'future', 'option'])) {
            throw new errors.NotSupported(this.id + ' ' + methodName + '() does not support ' + marketType + ' markets yet');
        }
        const subscriptionArgs = [];
        const messageHashes = [];
        const unsubscribeMessageHashes = [];
        let suffix = '';
        if (isMarkPrice && !isOptionMarkPrice) {
            suffix = (use1sFreq === true) ? '@1s' : '';
        }
        let unifiedPrefix = undefined;
        if (isBidAsk) {
            unifiedPrefix = 'bidask';
        }
        else if (isMarkPrice) {
            unifiedPrefix = 'markPrice';
        }
        else {
            unifiedPrefix = 'ticker';
        }
        if (symbols !== undefined) {
            const seenUnderlyings = {};
            for (let i = 0; i < symbols.length; i++) {
                const symbol = symbols[i];
                const market = this.market(symbol);
                messageHashes.push(unifiedPrefix + ':' + channelName + '@' + symbol);
                if (isUnsubscribe) {
                    unsubscribeMessageHashes.push('unsubscribe::' + unifiedPrefix + ':' + channelName + '@' + symbol);
                }
                if (isOptionMarkPrice) {
                    // subscribe per underlying, not per contract
                    const baseIdLower = this.safeStringLower(market, 'baseId', '');
                    const quoteIdLower = this.safeStringLower(market, 'quoteId', '');
                    const underlying = baseIdLower + '' + quoteIdLower;
                    if (!(underlying in seenUnderlyings)) {
                        seenUnderlyings[underlying] = true;
                        subscriptionArgs.push(underlying + '@optionMarkPrice');
                    }
                }
                else if (isOptionTicker) {
                    // eOptions tickers: group by underlying + expiry date (<underlying>@optionTicker@<YYMMDD>)
                    // market id format: BTC-240328-70000-C → expiry part is parts[1] = '240328'
                    const marketId = this.safeString(market, 'id', '');
                    const parts = marketId.split('-');
                    const expiryDate = this.safeString(parts, 1);
                    const baseIdLower = this.safeStringLower(market, 'baseId', '');
                    const quoteIdLower = this.safeStringLower(market, 'quoteId', '');
                    const underlying = baseIdLower + '' + quoteIdLower;
                    const subscriptionArg = underlying + '@optionTicker@' + expiryDate;
                    if (!(subscriptionArg in seenUnderlyings)) {
                        seenUnderlyings[subscriptionArg] = true;
                        subscriptionArgs.push(subscriptionArg);
                    }
                }
                else {
                    const streamId = market['lowercaseId'];
                    subscriptionArgs.push(streamId + '@' + channelName + suffix);
                }
            }
        }
        else {
            if (marketType === 'option') {
                const underlying = this.safeStringLower(params, 'underlying');
                if (underlying === undefined) {
                    throw new errors.ArgumentsRequired(this.id + ' ' + methodName + '() requires either symbols or params["underlying"] for eOptions');
                }
                if (isOptionTicker) {
                    // eOptions tickers are per underlying+expiry: <underlying>@optionTicker@<YYMMDD>
                    const expirationDate = this.safeString(params, 'expirationDate');
                    if (expirationDate === undefined) {
                        throw new errors.ArgumentsRequired(this.id + ' ' + methodName + '() requires params["expirationDate"] (e.g. "260227") for eOptions tickers when no symbols are provided');
                    }
                    subscriptionArgs.push(underlying + '@optionTicker@' + expirationDate);
                }
                else {
                    // isOptionMarkPrice: one stream covers all contracts for the underlying
                    subscriptionArgs.push(underlying + '@optionMarkPrice');
                }
                messageHashes.push(unifiedPrefix + 's:' + channelName);
                unsubscribeMessageHashes.push('unsubscribe::' + channelName);
            }
            else if (isBidAsk) {
                if (marketType === 'spot') {
                    throw new errors.ArgumentsRequired(this.id + ' ' + methodName + '() requires symbols for this channel for spot markets');
                }
                subscriptionArgs.push('!' + channelName);
                messageHashes.push(unifiedPrefix + 's:' + channelName);
                unsubscribeMessageHashes.push('unsubscribe::' + channelName);
            }
            else if (isMarkPrice) {
                subscriptionArgs.push('!' + channelName + '@arr' + suffix);
                messageHashes.push(unifiedPrefix + 's:' + channelName);
                unsubscribeMessageHashes.push('unsubscribe::' + channelName);
            }
            else {
                subscriptionArgs.push('!' + channelName + '@arr');
                messageHashes.push(unifiedPrefix + 's:' + channelName);
                unsubscribeMessageHashes.push('unsubscribe::' + channelName);
            }
        }
        let streamHash = channelName;
        if (symbols !== undefined) {
            streamHash = channelName + '::' + symbols.join(',');
        }
        const url = this.getWsUrl(rawMarketType, this.getFutureWsCategory(channelName)) + '/' + this.stream(rawMarketType, streamHash);
        const requestId = this.requestId(url);
        const request = {
            'method': isUnsubscribe ? 'UNSUBSCRIBE' : 'SUBSCRIBE',
            'params': subscriptionArgs,
            'id': requestId,
        };
        let hashes = messageHashes;
        let subscription = {
            'id': requestId,
        };
        if (isUnsubscribe) {
            subscription = {
                'unsubscribe': true,
                'id': requestId.toString(),
                'subMessageHashes': messageHashes,
                'messageHashes': unsubscribeMessageHashes,
                'symbols': symbols,
                'topic': 'ticker',
            };
            hashes = unsubscribeMessageHashes;
        }
        // for option mark prices, the underlying stream delivers all contracts in one array message
        // wait on the batch hash so the resolved value is the full dict of new tickers
        let waitHashes = hashes;
        if (isOptionMarkPrice && !isUnsubscribe) {
            waitHashes = [unifiedPrefix + 's:' + channelName];
        }
        const result = await this.watchMultiple(url, waitHashes, this.deepExtend(request, params), hashes, subscription);
        if (isUnsubscribe) {
            return result;
        }
        // for efficiency, we have two type of returned structure here - if symbols array was provided, then individual
        // ticker dict comes in, otherwise all-tickers dict comes in
        // isOptionMarkPrice always resolves on a batch hash → result is already a dict
        if (!symbolsDefined || isOptionMarkPrice) {
            return result;
        }
        else {
            const newDict = {};
            newDict[result['symbol']] = result;
            return newDict;
        }
    }
    parseWsTicker(message, marketType) {
        // markPrice
        //   {
        //       "e": "markPriceUpdate",   // Event type
        //       "E": 1562305380000,       // Event time
        //       "s": "BTCUSDT",           // Symbol
        //       "p": "11794.15000000",    // Mark price
        //       "i": "11784.62659091",    // Index price
        //       "P": "11784.25641265",    // Estimated Settle Price, only useful in the last hour before the settlement starts
        //       "r": "0.00038167",        // Funding rate
        //       "T": 1562306400000        // Next funding time
        //   }
        //
        // ticker
        //     {
        //         "e": "24hrTicker",      // event type
        //         "E": 1579485598569,     // event time
        //         "s": "ETHBTC",          // symbol
        //         "p": "-0.00004000",     // price change
        //         "P": "-0.209",          // price change percent
        //         "w": "0.01920495",      // weighted average price
        //         "x": "0.01916500",      // the price of the first trade before the 24hr rolling window
        //         "c": "0.01912500",      // last (closing) price
        //         "Q": "0.10400000",      // last quantity
        //         "b": "0.01912200",      // best bid
        //         "B": "4.10400000",      // best bid quantity
        //         "a": "0.01912500",      // best ask
        //         "A": "0.00100000",      // best ask quantity
        //         "o": "0.01916500",      // open price
        //         "h": "0.01956500",      // high price
        //         "l": "0.01887700",      // low price
        //         "v": "173518.11900000", // base volume
        //         "q": "3332.40703994",   // quote volume
        //         "O": 1579399197842,     // open time
        //         "C": 1579485597842,     // close time
        //         "F": 158251292,         // first trade id
        //         "L": 158414513,         // last trade id
        //         "n": 163222,            // total number of trades
        //     }
        //
        // miniTicker
        //     {
        //         "e": "24hrMiniTicker",
        //         "E": 1671617114585,
        //         "s": "MOBBUSD",
        //         "c": "0.95900000",
        //         "o": "0.91200000",
        //         "h": "1.04000000",
        //         "l": "0.89400000",
        //         "v": "2109995.32000000",
        //         "q": "2019254.05788000"
        //     }
        // fetchTickerWs
        //     {
        //         "symbol":"BTCUSDT",
        //         "price":"72606.70",
        //         "time":1712526204284
        //     }
        // fetchTickerWs - ticker.book
        //     {
        //         "lastUpdateId":1027024,
        //         "symbol":"BTCUSDT",
        //         "bidPrice":"4.00000000",
        //         "bidQty":"431.00000000",
        //         "askPrice":"4.00000200",
        //         "askQty":"9.00000000",
        //         "time":1589437530011,
        //      }
        //
        const marketId = this.safeString2(message, 's', 'symbol');
        const symbol = this.safeSymbol(marketId, undefined, undefined, marketType);
        let event = this.safeString(message, 'e', 'bookTicker');
        if (event === '24hrTicker') {
            event = 'ticker';
        }
        if (event === 'markPriceUpdate' || event === 'markPrice') {
            // handle this separately because some fields clash with the ticker fields
            // futures use 'p' for mark price; options use 'mp'
            return this.safeTicker({
                'symbol': symbol,
                'timestamp': this.safeInteger(message, 'E'),
                'datetime': this.iso8601(this.safeInteger(message, 'E')),
                'info': message,
                'markPrice': this.safeString2(message, 'mp', 'p'),
                'indexPrice': this.safeString(message, 'i'),
            });
        }
        let timestamp = undefined;
        if (event === 'bookTicker') {
            // take the event timestamp, if available, for spot tickers it is not
            timestamp = this.safeInteger2(message, 'E', 'time');
        }
        else {
            // take the timestamp of the closing price for candlestick streams
            timestamp = this.safeIntegerN(message, ['C', 'E', 'time']);
        }
        const market = this.safeMarket(marketId, undefined, undefined, marketType);
        const last = this.safeString2(message, 'c', 'price');
        // A coin-margined stream counts `v` in contracts and puts the
        // base asset in `q`, one field over from a linear stream, and
        // `parseTicker` reads the same pair. Only the full ticker
        // carries `w`, so a miniTicker uses the contract size.
        let baseVolume = this.safeString(message, 'v');
        let quoteVolume = this.safeString(message, 'q');
        if (market['inverse'] === true) {
            const contracts = baseVolume;
            baseVolume = quoteVolume;
            const weightedAverage = this.safeString(message, 'w');
            if (weightedAverage === undefined) {
                quoteVolume = Precise["default"].stringMul(contracts, this.safeString(market, 'contractSize'));
            }
            else {
                quoteVolume = Precise["default"].stringMul(baseVolume, weightedAverage);
            }
        }
        return this.safeTicker({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'high': this.safeString(message, 'h'),
            'low': this.safeString(message, 'l'),
            'bid': this.safeString2(message, 'b', 'bidPrice'),
            'bidVolume': this.safeString2(message, 'B', 'bidQty'),
            'ask': this.safeString2(message, 'a', 'askPrice'),
            'askVolume': this.safeString2(message, 'A', 'askQty'),
            'vwap': this.safeString(message, 'w'),
            'open': this.safeString(message, 'o'),
            'close': last,
            'last': last,
            'previousClose': this.safeString(message, 'x'), // previous day close
            'change': this.safeString(message, 'p'),
            'percentage': this.safeString(message, 'P'),
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': message,
        }, market);
    }
    handleTickerWs(client, message) {
        //
        // ticker.price
        //    {
        //        "id":"1",
        //        "status":200,
        //        "result":{
        //            "symbol":"BTCUSDT",
        //            "price":"73178.60",
        //            "time":1712527052374
        //        }
        //    }
        // ticker.book
        //    {
        //        "id":"9d32157c-a556-4d27-9866-66760a174b57",
        //        "status":200,
        //        "result":{
        //            "lastUpdateId":1027024,
        //            "symbol":"BTCUSDT",
        //            "bidPrice":"4.00000000",
        //            "bidQty":"431.00000000",
        //            "askPrice":"4.00000200",
        //            "askQty":"9.00000000",
        //            "time":1589437530011   // Transaction time
        //        }
        //    }
        //
        const messageHash = this.safeString(message, 'id');
        const result = this.safeValue(message, 'result', {});
        const ticker = this.parseWsTicker(result, 'future');
        client.resolve(ticker, messageHash);
    }
    handleBidsAsks(client, message) {
        //
        // arrives one symbol dict or array of symbol dicts
        //
        //     {
        //         "u": 7488717758,
        //         "s": "BTCUSDT",
        //         "b": "28621.74000000",
        //         "B": "1.43278800",
        //         "a": "28621.75000000",
        //         "A": "2.52500800"
        //     }
        //
        this.handleTickersAndBidsAsks(client, message, 'bidasks');
    }
    handleTickers(client, message) {
        //
        // arrives one symbol dict or array of symbol dicts
        //
        //     {
        //         "e": "24hrTicker",      // event type
        //         "E": 1579485598569,     // event time
        //         "s": "ETHBTC",          // symbol
        //         "p": "-0.00004000",     // price change
        //         "P": "-0.209",          // price change percent
        //         "w": "0.01920495",      // weighted average price
        //         "x": "0.01916500",      // the price of the first trade before the 24hr rolling window
        //         "c": "0.01912500",      // last (closing) price
        //         "Q": "0.10400000",      // last quantity
        //         "b": "0.01912200",      // best bid
        //         "B": "4.10400000",      // best bid quantity
        //         "a": "0.01912500",      // best ask
        //         "A": "0.00100000",      // best ask quantity
        //         "o": "0.01916500",      // open price
        //         "h": "0.01956500",      // high price
        //         "l": "0.01887700",      // low price
        //         "v": "173518.11900000", // base volume
        //         "q": "3332.40703994",   // quote volume
        //         "O": 1579399197842,     // open time
        //         "C": 1579485597842,     // close time
        //         "F": 158251292,         // first trade id
        //         "L": 158414513,         // last trade id
        //         "n": 163222,            // total number of trades
        //     }
        //
        this.handleTickersAndBidsAsks(client, message, 'tickers');
    }
    handleMarkPrices(client, message) {
        this.handleTickersAndBidsAsks(client, message, 'markPrices');
    }
    handleTickersAndBidsAsks(client, message, methodType) {
        const isBidAsk = (methodType === 'bidasks');
        const isMarkPrice = (methodType === 'markPrices');
        let unifiedPrefix = undefined;
        if (isBidAsk) {
            unifiedPrefix = 'bidask';
        }
        else if (isMarkPrice) {
            unifiedPrefix = 'markPrice';
        }
        else {
            unifiedPrefix = 'ticker';
        }
        let channelName = undefined;
        const resolvedMessageHashes = [];
        let rawTickers = [];
        const newTickers = {};
        if (Array.isArray(message)) {
            rawTickers = message;
        }
        else {
            rawTickers.push(message);
        }
        for (let i = 0; i < rawTickers.length; i++) {
            const ticker = rawTickers[i];
            let event = this.safeString(ticker, 'e');
            if (isBidAsk) {
                event = 'bookTicker'; // as noted in `handleMessage`, bookTicker doesn't have identifier, so manually set here
            }
            channelName = this.safeString(this.options['tickerChannelsMap'], event, event);
            if (channelName === undefined) {
                continue;
            }
            const tickerMarketId = this.safeString(ticker, 's');
            const tickerMarketsByIdList = this.safeValue(this.markets_by_id, tickerMarketId);
            const numTickerMarkets = (tickerMarketsByIdList === undefined) ? 0 : tickerMarketsByIdList.length;
            // an ambiguous id, spot and swap share e.g. BTCUSDC, must not be resolved by
            // blind first pick, the stream url decides; only a unique match, like an
            // option id, may override it, see https://github.com/ccxt/ccxt/issues/29728
            const tickerMarketById = (numTickerMarkets === 1) ? this.safeValue(tickerMarketsByIdList, 0) : undefined;
            const isSpot = this.isSpotUrl(client);
            const tickerFallbackType = isSpot ? 'spot' : 'contract';
            const tickerMarketType = (tickerMarketById !== undefined) ? tickerMarketById['type'] : tickerFallbackType;
            const parsedTicker = this.parseWsTicker(ticker, tickerMarketType);
            const symbol = parsedTicker['symbol'];
            if (symbol !== undefined) {
                newTickers[symbol] = parsedTicker;
            }
            if (isBidAsk) {
                if (symbol !== undefined) {
                    this.bidsasks[symbol] = parsedTicker;
                }
            }
            else {
                if (symbol !== undefined) {
                    this.tickers[symbol] = parsedTicker;
                }
            }
            const messageHash = unifiedPrefix + ':' + channelName + '@' + symbol;
            resolvedMessageHashes.push(messageHash);
            client.resolve(parsedTicker, messageHash);
        }
        // resolve batch endpoint
        const length = resolvedMessageHashes.length;
        if (length > 0) {
            const batchMessageHash = unifiedPrefix + 's:' + channelName;
            client.resolve(newTickers, batchMessageHash);
        }
    }
    signParams(params = {}) {
        this.checkRequiredCredentials();
        const defaultRecvWindow = this.safeInteger(this.options, 'recvWindow');
        if (defaultRecvWindow !== undefined) {
            params['recvWindow'] = defaultRecvWindow;
        }
        const recvWindow = this.safeInteger(params, 'recvWindow');
        if (recvWindow !== undefined) {
            params['recvWindow'] = recvWindow;
        }
        let extendedParams = this.extend({
            'timestamp': this.nonce(),
            'apiKey': this.apiKey,
        }, params);
        extendedParams = this.keysort(extendedParams);
        const query = this.rawencode(extendedParams);
        let signature = undefined;
        if (this.secret.indexOf('PRIVATE KEY') > -1) {
            if (this.secret.length > 120) {
                signature = rsa.rsa(query, this.secret, sha2_js.sha256);
            }
            else {
                signature = crypto.eddsa(this.encode(query), this.secret, ed25519_js.ed25519);
            }
        }
        else {
            signature = this.hmac(this.encode(query), this.encode(this.secret), sha2_js.sha256);
        }
        extendedParams['signature'] = signature;
        return extendedParams;
    }
    /**
     * @name binance#ensureUserDataStreamWsSubscribeSignature
     * @description watches best bid & ask for symbols
     * @param {string} [marketType] only supports 'spot'
     * @see {@link https://developers.binance.com/docs/binance-spot-api-docs/websocket-api/user-data-stream-requests#subscribe-to-user-data-stream-through-signature-subscription-user_data Binance User Data Stream Documentation}
     * @returns Promise<number> The subscription ID for the user data stream
     */
    async ensureUserDataStreamWsSubscribeSignature(marketType = 'spot') {
        const url = this.urls['api']['ws']['ws-api'][marketType];
        const client = this.client(url);
        const subscriptions = client.subscriptions;
        const subscriptionsKeys = Object.keys(subscriptions);
        const accountType = this.getAccountTypeFromSubscriptions(subscriptionsKeys);
        if (accountType === marketType) {
            return;
        }
        // the subscriptions flag is raised before the subscribe request is confirmed,
        // so a concurrent caller would otherwise return onto an unauthenticated stream
        const messageHash = 'authenticate:signature:' + marketType;
        if (messageHash in client.futures) {
            // another caller is already subscribing, wait for it instead of subscribing again
            await client.future(messageHash);
            return;
        }
        client.future(messageHash); // created ahead of the request below, so concurrent callers can find it
        client.subscriptions[marketType] = true;
        const requestId = this.requestId(url);
        const requestHash = requestId.toString();
        const message = {
            'id': requestHash,
            'method': 'userDataStream.subscribe.signature',
            'params': this.signParams({}),
        };
        const subscription = {
            'id': requestHash,
            'method': this.handleUserDataStreamSubscribe,
            'subscription': marketType,
        };
        try {
            await this.watch(url, requestHash, message, requestHash, subscription);
            client.resolve(marketType, messageHash);
        }
        catch (e) {
            delete client.subscriptions[marketType];
            client.reject(e, messageHash);
            throw e;
        }
    }
    handleUserDataStreamSubscribe(client, message) {
        //
        //   {
        //     "id": 1,
        //     "status": 200,
        //     "result": {
        //         "subscriptionId": 0
        //     }
        //   }
        //
        const messageHash = this.safeString(message, 'id');
        const subscriptions = client.subscriptions;
        const subscriptionsKeys = Object.keys(subscriptions);
        const accountType = this.getAccountTypeFromSubscriptions(subscriptionsKeys);
        const result = this.safeDict(message, 'result', {});
        const subscriptionId = this.safeInteger(result, 'subscriptionId');
        if (subscriptionId === undefined) {
            delete client.subscriptions[accountType];
            client.reject(message, accountType);
            client.reject(message, messageHash);
            return;
        }
        client.resolve(message, messageHash);
    }
    /**
     * @name binance#ensureUserDataStreamWsSubscribeListenToken
     * @description subscribes to user data stream using listenToken (for margin)
     * @param {string} marketType - the market type (e.g., 'margin')
     * @param {object} params - extra parameters specific to the request
     * @param {string} [params.symbol] - required for isolated margin
     * @param {boolean} [params.isIsolated] - whether it is isolated margin
     * @param {number} [params.validity] - validity in milliseconds, default 24 hours, max 24 hours
     * @see {@link https://developers.binance.com/docs/derivatives/usds-margined-futures/websocket-api/user-data-stream Binance User Data Stream Documentation}
     * @returns Promise<void>
     */
    async ensureUserDataStreamWsSubscribeListenToken(marketType = 'margin', params = {}) {
        const url = this.urls['api']['ws']['ws-api']['spot'];
        const options = this.safeDict(this.options, marketType, {});
        const lastAuthenticatedTime = this.safeInteger(options, 'lastAuthenticatedTime', 0);
        const listenTokenRefreshRate = this.safeInteger(this.options, 'listenTokenRefreshRate', 82800000); // 23 hours default
        const time = this.milliseconds();
        const delay = this.sum(listenTokenRefreshRate, 10000);
        if (time - lastAuthenticatedTime > delay) {
            // the future covers the REST create plus the ws subscribe, including the
            // renewal timer re-entry through renewListenToken, so a concurrent caller
            // waits for the leader rather than minting a second listenToken
            const client = this.client(url);
            const messageHash = 'authenticate:' + marketType + ':listenToken';
            if (messageHash in client.futures) {
                // another caller is already fetching, wait for it instead of fetching again
                await client.future(messageHash);
                return;
            }
            client.future(messageHash); // created ahead of the request below, so concurrent callers can find it
            try {
                // Step 1: Create listenToken via REST API
                const symbol = this.safeString(params, 'symbol');
                const isIsolated = this.safeBool(params, 'isIsolated', false);
                const validity = this.safeInteger(params, 'validity');
                const request = {};
                if (isIsolated === true) {
                    if (symbol === undefined) {
                        throw new errors.ArgumentsRequired(this.id + ' ensureUserDataStreamWsSubscribeListenToken() requires a symbol argument for isolated margin mode');
                    }
                    const marketId = this.marketId(symbol);
                    request['symbol'] = marketId;
                    request['isIsolated'] = true;
                }
                if (validity !== undefined) {
                    request['validity'] = validity;
                }
                const response = await this.sapiPostUserListenToken(request);
                const listenToken = this.safeString(response, 'token');
                if (listenToken === undefined) {
                    throw new errors.AuthenticationError(this.id + ' ensureUserDataStreamWsSubscribeListenToken() failed to obtain a listenToken');
                }
                const expirationTime = this.safeInteger(response, 'expirationTime');
                // Step 2: Subscribe to user data stream via WebSocket API
                const requestId = this.requestId(url);
                const requestHash = requestId.toString();
                const message = {
                    'id': requestHash,
                    'method': 'userDataStream.subscribe.listenToken',
                    'params': {
                        'listenToken': listenToken,
                    },
                };
                const subscription = {
                    'id': requestHash,
                    'method': this.handleUserDataStreamSubscribe,
                    'subscription': marketType,
                };
                await this.watch(url, requestHash, message, requestHash, subscription);
                this.options[marketType] = this.extend(options, {
                    'listenToken': listenToken,
                    'expirationTime': expirationTime,
                    'lastAuthenticatedTime': time,
                    'symbol': symbol,
                    'isIsolated': isIsolated,
                    'validity': validity,
                });
                // Schedule token renewal before expiration
                if (expirationTime !== undefined) {
                    const renewalTime = expirationTime - time - 60000; // Renew 1 minute before expiration
                    if (renewalTime > 0) {
                        const extendedParams = this.extend(params, { 'type': marketType });
                        this.delay(renewalTime, this.renewListenToken, extendedParams);
                    }
                }
                client.resolve(listenToken, messageHash);
            }
            catch (e) {
                this.options[marketType] = this.extend(options, {
                    'lastAuthenticatedTime': 0,
                });
                client.reject(e, messageHash);
                throw e;
            }
        }
    }
    async renewListenToken(params = {}) {
        const type = this.safeString(params, 'type', 'margin');
        const options = this.safeDict(this.options, type, {});
        const symbol = this.safeString(options, 'symbol');
        const isIsolated = this.safeBool(options, 'isIsolated', false);
        const validity = this.safeInteger(options, 'validity');
        const renewParams = {};
        if (symbol !== undefined) {
            renewParams['symbol'] = symbol;
        }
        if (isIsolated === true) {
            renewParams['isIsolated'] = isIsolated;
        }
        if (validity !== undefined) {
            renewParams['validity'] = validity;
        }
        await this.ensureUserDataStreamWsSubscribeListenToken(type, renewParams);
    }
    async authenticate(params = {}) {
        const time = this.milliseconds();
        const resolvedAuth = this.resolveAuthType('authenticate', undefined, params);
        const type = resolvedAuth[0];
        params = resolvedAuth[2];
        let isPortfolioMargin = undefined;
        [isPortfolioMargin, params] = this.handleOptionAndParams2(params, 'authenticate', 'papi', 'portfolioMargin', false);
        // For spot use WebSocket API signature subscription
        if (type === 'spot') {
            await this.ensureUserDataStreamWsSubscribeSignature('spot');
            return;
        }
        let marginMode = undefined;
        [marginMode, params] = this.handleMarginModeAndParams('authenticate', params);
        const isIsolatedMargin = (marginMode === 'isolated');
        const symbol = this.safeString(params, 'symbol');
        // For margin use WebSocket API listenToken subscription
        if (type === 'margin' || isIsolatedMargin) {
            const marginParams = {};
            if (symbol !== undefined) {
                marginParams['symbol'] = symbol;
            }
            if (isIsolatedMargin) {
                marginParams['isIsolated'] = true;
            }
            await this.ensureUserDataStreamWsSubscribeListenToken('margin', marginParams);
            return;
        }
        params = this.omit(params, 'symbol');
        const isStock = (type === 'stock');
        const options = this.safeValue(this.options, type, {});
        const lastAuthenticatedTime = this.safeInteger(options, 'lastAuthenticatedTime', 0);
        const refreshRateKey = isStock ? 'stockListenKeyRefreshRate' : 'listenKeyRefreshRate';
        const listenKeyRefreshRate = this.safeInteger(this.options, refreshRateKey, 1200000);
        const delay = this.sum(listenKeyRefreshRate, 10000);
        if (time - lastAuthenticatedTime > delay) {
            // single-flight leader election, see https://github.com/ccxt/ccxt/issues/29393
            // the flight is registered on a never-dialed client because the
            // user-data url embeds the listenKey, so no real client exists
            // before the fetch and no listenKey-free parking url is needed.
            // client.futures is the registry: client.future () is the atomic
            // check-and-insert and client.resolve () / client.reject () settle
            // and remove the entry under the same lock in every port
            const messageHash = 'authenticate:' + type;
            const client = this.client('authenticationFlights');
            if (messageHash in client.futures) {
                // a flight is already in progress - wake when the leader
                // settles it: the listenKey is then in the bucket
                await client.future(messageHash);
                return;
            }
            // reusableFuture (), not future () - the two match in
            // js/py/php/cs/java, but go's Client.Future () yields a channel
            // that the trailing suspension point below would panic on
            const future = client.reusableFuture(messageHash);
            try {
                let response = undefined;
                if (isStock) {
                    const requestParams = this.omit(params, ['stock', 'name', 'callerMethodName', 'type', 'subType', 'symbol', 'timeframe']);
                    response = await this.sapiPostEquityListenKey(requestParams);
                }
                else if (isPortfolioMargin) {
                    response = await this.papiPostListenKey(params);
                    params = this.extend(params, { 'portfolioMargin': true });
                }
                else if (type === 'future') {
                    response = await this.fapiPrivatePostListenKey(params);
                }
                else if (type === 'delivery') {
                    response = await this.dapiPrivatePostListenKey(params);
                }
                else if (type === 'option') {
                    response = await this.eapiPrivatePostListenKey(params);
                }
                else {
                    response = await this.publicPostUserDataStream(params);
                }
                const listenKey = this.safeString(response, 'listenKey');
                if (listenKey === undefined) {
                    // reject the flight BEFORE any cache write: a hollow 200
                    // otherwise caches an empty credential AND stamps
                    // lastAuthenticatedTime, parking every caller on
                    // .../ws/undefined with no retry until the staleness
                    // window reopens - the catch below rejects the flight so
                    // waiters retry and the next caller re-leads
                    throw new errors.AuthenticationError(this.id + ' authenticate() received an empty listenKey');
                }
                this.options[type] = this.extend(options, {
                    'listenKey': listenKey,
                    'lastAuthenticatedTime': time,
                });
                // hoisted out of the delay call: the transpilers garble an inline
                // dict literal nested inside a delay argument
                let delayParams = params;
                if (isStock) {
                    delayParams = this.extend(params, { 'type': 'stock', 'defaultType': 'stock' });
                }
                this.delay(listenKeyRefreshRate, this.keepAliveListenKey, delayParams);
                // settle the flight: client.resolve () removes the future from
                // client.futures and wakes every waiter
                client.resolve(listenKey, messageHash);
            }
            catch (e) {
                // reject the flight - waiters throw and the next caller re-leads.
                // no rethrow here, the trailing suspension point rethrows to this
                // caller AND attaches the handler an alone leader needs
                client.reject(e, messageHash);
            }
            await future;
        }
    }
    async keepAliveListenKey(params = {}) {
        // https://binance-docs.github.io/apidocs/spot/en/#listen-key-spot
        let type = this.safeString2(this.options, 'defaultType', 'authenticate', 'spot');
        type = this.safeString(params, 'type', type);
        let isPortfolioMargin = undefined;
        [isPortfolioMargin, params] = this.handleOptionAndParams2(params, 'keepAliveListenKey', 'papi', 'portfolioMargin', false);
        const subTypeInfo = this.handleSubTypeAndParams('keepAliveListenKey', undefined, params);
        const subType = subTypeInfo[0];
        if (type !== 'option' && type !== 'stock') {
            // guard options first: isLinear returns true for linear-settled options (subType='linear')
            // which would incorrectly convert type='option' to 'future'.
            // stock needs the same exemption: with a defaultSubType of 'linear' -
            // always on binanceusdm, common on mixed instances - isLinear keys off
            // subType alone and would flip 'stock' to 'future' - the stock branch
            // below would never run, and the bucket lookup would renew the
            // FUTURES listen key while the stock key silently expires
            if (this.isLinear(type, subType)) {
                type = 'future';
            }
            else if (this.isInverse(type, subType)) {
                type = 'delivery';
            }
        }
        // For margin, token renewal is handled by renewListenToken method
        if (type === 'margin') {
            return;
        }
        const isStock = (type === 'stock');
        const options = this.safeValue(this.options, type, {});
        const listenKey = this.safeString(options, 'listenKey');
        if (listenKey === undefined) {
            // A network error happened: we can't renew a listen key that does not exist.
            // this guard now covers stock too - the old stock path would POST here and
            // resurrect a fresh key without reconnecting the dead stream, leaving the
            // options bucket claiming a healthy auth over a broken user stream
            return;
        }
        const request = {};
        params = this.omit(params, ['type', 'symbol']);
        const time = this.milliseconds();
        try {
            if (isStock) {
                // the equity endpoint is create-or-renew: with an active key this
                // POST extends the validity of that same key
                const requestParams = this.omit(params, ['stock', 'name', 'callerMethodName', 'subType', 'timeframe']);
                await this.sapiPostEquityListenKey(requestParams);
            }
            else if (isPortfolioMargin) {
                await this.papiPutListenKey(this.extend(request, params));
                params = this.extend(params, { 'portfolioMargin': true });
            }
            else if (type === 'future') {
                await this.fapiPrivatePutListenKey(this.extend(request, params));
            }
            else if (type === 'delivery') {
                await this.dapiPrivatePutListenKey(this.extend(request, params));
            }
            else if (type === 'option') {
                await this.eapiPrivatePutListenKey(this.extend(request, params));
            }
            else {
                request['listenKey'] = listenKey;
                await this.publicPutUserDataStream(this.extend(request, params));
            }
        }
        catch (error) {
            let url = undefined;
            if (isStock) {
                // the stock user stream lives on a fixed url and subscribes to
                // listenKey@orderReport, so the client is addressable without the key
                url = this.getStockWsUrl('user');
            }
            else {
                let urlType = type;
                if (isPortfolioMargin) {
                    urlType = 'papi';
                }
                if (type === 'option') {
                    urlType = 'optionPrivate';
                }
                const cachedListenKey = this.options[type]['listenKey'];
                url = this.getPrivateWsUrl(urlType, cachedListenKey);
            }
            const client = this.client(url);
            const messageHashes = Object.keys(client.futures);
            for (let i = 0; i < messageHashes.length; i++) {
                const messageHash = messageHashes[i];
                client.reject(error, messageHash);
            }
            this.options[type] = this.extend(options, {
                'listenKey': undefined,
                'lastAuthenticatedTime': 0,
            });
            return;
        }
        this.options[type] = this.extend(options, {
            'listenKey': listenKey,
            'lastAuthenticatedTime': time,
        });
        // whether or not to schedule another listenKey keepAlive request
        const clients = Object.values(this.clients);
        const refreshRateKey = isStock ? 'stockListenKeyRefreshRate' : 'listenKeyRefreshRate';
        const listenKeyRefreshRate = this.safeInteger(this.options, refreshRateKey, 1200000);
        let delayParams = params;
        if (isStock) {
            // params had type omitted above - restore it so the next cycle routes back here
            delayParams = this.extend(params, { 'type': 'stock' });
        }
        for (let i = 0; i < clients.length; i++) {
            const client = clients[i];
            const clientSubscriptions = this.safeDict(client, 'subscriptions', {});
            const subscriptionKeys = Object.keys(clientSubscriptions);
            for (let j = 0; j < subscriptionKeys.length; j++) {
                const subscribeType = subscriptionKeys[j];
                if (subscribeType === type) {
                    this.delay(listenKeyRefreshRate, this.keepAliveListenKey, delayParams);
                    return;
                }
            }
        }
    }
    setBalanceCache(client, type, isPortfolioMargin = false) {
        if ((type in client.subscriptions) && (type in this.balance)) {
            return;
        }
        const options = this.safeValue(this.options, 'watchBalance');
        const fetchBalanceSnapshot = this.safeBool(options, 'fetchBalanceSnapshot', false);
        if (fetchBalanceSnapshot === true) {
            const messageHash = type + ':fetchBalanceSnapshot';
            if (!(messageHash in client.futures)) {
                client.future(messageHash);
                this.spawn(this.loadBalanceSnapshot, client, messageHash, type, isPortfolioMargin);
            }
        }
        else {
            this.balance[type] = {};
        }
    }
    async loadBalanceSnapshot(client, messageHash, type, isPortfolioMargin) {
        const params = {
            'type': type,
        };
        if (isPortfolioMargin === true) {
            params['portfolioMargin'] = true;
        }
        const response = await this.fetchBalance(params);
        this.balance[type] = this.extend(response, this.safeValue(this.balance, type, {}));
        // don't remove the future from the .futures cache
        if (messageHash in client.futures) {
            const future = client.futures[messageHash];
            future.resolve();
            client.resolve(this.balance[type], type + ':balance');
        }
    }
    /**
     * @method
     * @name binance#fetchBalanceWs
     * @description fetch balance and get the amount of funds available for trading or funds locked in orders
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/account/websocket-api/Futures-Account-Balance
     * @see https://developers.binance.com/docs/binance-spot-api-docs/websocket-api/account-requests#account-information-user_data
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/account/websocket-api
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string|undefined} [params.type] 'future', 'delivery', 'savings', 'funding', or 'spot'
     * @param {string|undefined} [params.marginMode] 'cross' or 'isolated', for margin trading, uses this.options.defaultMarginMode if not passed, defaults to undefined/None/null
     * @param {string[]|undefined} [params.symbols] unified market symbols, only used in isolated margin mode
     * @param {string|undefined} [params.method] method to use. Can be account.balance, account.status, v2/account.balance or v2/account.status
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
     */
    async fetchBalanceWs(params = {}) {
        if (this.markets === undefined) {
            await this.loadMarkets();
        }
        const type = this.getMarketType('fetchBalanceWs', undefined, params);
        if (type !== 'spot' && type !== 'future' && type !== 'delivery') {
            throw new errors.BadRequest(this.id + ' fetchBalanceWs only supports spot or swap markets');
        }
        const url = this.urls['api']['ws']['ws-api'][type];
        const requestId = this.requestId(url);
        const messageHash = requestId.toString();
        let returnRateLimits = false;
        [returnRateLimits, params] = this.handleOptionAndParams(params, 'fetchBalanceWs', 'returnRateLimits', false);
        const payload = {
            'returnRateLimits': returnRateLimits,
        };
        let method = undefined;
        [method, params] = this.handleOptionAndParams(params, 'fetchBalanceWs', 'method', 'account.status');
        const message = {
            'id': messageHash,
            'method': method,
            'params': this.signParams(this.extend(payload, params)),
        };
        const subscription = {
            'method': (method === 'account.status') ? this.handleAccountStatusWs : this.handleBalanceWs,
        };
        return await this.watch(url, messageHash, message, messageHash, subscription);
    }
    handleBalanceWs(client, message) {
        //
        //
        const messageHash = this.safeString(message, 'id');
        let rawBalance = undefined;
        if (Array.isArray(message['result'])) {
            // account.balance
            rawBalance = this.safeList(message, 'result', []);
        }
        else {
            // account.status
            const result = this.safeDict(message, 'result', {});
            rawBalance = this.safeList(result, 'assets', []);
        }
        const parsedBalances = this.parseBalanceCustom(rawBalance);
        client.resolve(parsedBalances, messageHash);
    }
    handleAccountStatusWs(client, message) {
        //
        // spot
        //    {
        //        "id": "605a6d20-6588-4cb9-afa0-b0ab087507ba",
        //        "status": 200,
        //        "result": {
        //            "makerCommission": 15,
        //            "takerCommission": 15,
        //            "buyerCommission": 0,
        //            "sellerCommission": 0,
        //            "canTrade": true,
        //            "canWithdraw": true,
        //            "canDeposit": true,
        //            "commissionRates": {
        //                "maker": "0.00150000",
        //                "taker": "0.00150000",
        //                "buyer": "0.00000000",
        //                "seller": "0.00000000"
        //            },
        //            "brokered": false,
        //            "requireSelfTradePrevention": false,
        //            "updateTime": 1660801833000,
        //            "accountType": "SPOT",
        //            "balances": [{
        //                    "asset": "BNB",
        //                    "free": "0.00000000",
        //                    "locked": "0.00000000"
        //                },
        //                {
        //                    "asset": "BTC",
        //                    "free": "1.3447112",
        //                    "locked": "0.08600000"
        //                },
        //                {
        //                    "asset": "USDT",
        //                    "free": "1021.21000000",
        //                    "locked": "0.00000000"
        //                }
        //            ],
        //            "permissions": [
        //                "SPOT"
        //            ]
        //        }
        //    }
        // swap
        //
        const messageHash = this.safeString(message, 'id');
        const result = this.safeDict(message, 'result', {});
        const parsedBalances = this.parseBalanceCustom(result);
        client.resolve(parsedBalances, messageHash);
    }
    /**
     * @method
     * @name binance#fetchPositionWs
     * @description fetch data on an open position
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/websocket-api/Position-Information
     * @param {string} symbol unified market symbol of the market the position is held in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [position structure]{@link https://docs.ccxt.com/?id=position-structure}
     */
    fetchPositionWs(symbol, params = {}) {
        return this.fetchPositionsWs([symbol], params);
    }
    /**
     * @method
     * @name binance#fetchPositionsWs
     * @description fetch all open positions
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/websocket-api/Position-Information
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/websocket-api/Position-Information
     * @param {string[]} [symbols] list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.returnRateLimits] set to true to return rate limit informations, defaults to false.
     * @param {string|undefined} [params.method] method to use. Can be account.position or v2/account.position
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/?id=position-structure}
     */
    async fetchPositionsWs(symbols = undefined, params = {}) {
        if (this.markets === undefined) {
            await this.loadMarkets();
        }
        const payload = {};
        let market = undefined;
        symbols = this.marketSymbols(symbols, 'swap', true, true, true);
        if (symbols !== undefined) {
            const symbolsLength = symbols.length;
            if (symbolsLength === 1) {
                market = this.market(symbols[0]);
                payload['symbol'] = market['id'];
            }
        }
        let type = this.getMarketType('fetchPositionsWs', market, params);
        if (symbols === undefined && (type === 'spot')) {
            // when symbols aren't provide
            // we shouldn't rely on the defaultType
            type = 'future';
        }
        if (type !== 'future' && type !== 'delivery') {
            throw new errors.BadRequest(this.id + ' fetchPositionsWs only supports swap markets');
        }
        const url = this.urls['api']['ws']['ws-api'][type];
        const requestId = this.requestId(url);
        const messageHash = requestId.toString();
        let returnRateLimits = false;
        [returnRateLimits, params] = this.handleOptionAndParams(params, 'fetchPositionsWs', 'returnRateLimits', false);
        payload['returnRateLimits'] = returnRateLimits;
        let method = undefined;
        [method, params] = this.handleOptionAndParams(params, 'fetchPositionsWs', 'method', 'account.position');
        const message = {
            'id': messageHash,
            'method': method,
            'params': this.signParams(this.extend(payload, params)),
        };
        const subscription = {
            'method': this.handlePositionsWs,
        };
        const result = await this.watch(url, messageHash, message, messageHash, subscription);
        return this.filterByArrayPositions(result, 'symbol', symbols, false);
    }
    handlePositionsWs(client, message) {
        //
        //    {
        //        id: '1',
        //        status: 200,
        //        result: [
        //            {
        //                symbol: 'BTCUSDT',
        //                positionAmt: '-0.014',
        //                entryPrice: '42901.1',
        //                breakEvenPrice: '30138.83333142',
        //                markPrice: '71055.98470333',
        //                unRealizedProfit: '-394.16838584',
        //                liquidationPrice: '137032.02272908',
        //                leverage: '123',
        //                maxNotionalValue: '50000',
        //                marginType: 'cross',
        //                isolatedMargin: '0.00000000',
        //                isAutoAddMargin: 'false',
        //                positionSide: 'BOTH',
        //                notional: '-994.78378584',
        //                isolatedWallet: '0',
        //                updateTime: 1708906343111,
        //                isolated: false,
        //                adlQuantile: 2
        //            },
        //            ...
        //        ]
        //    }
        //
        //
        const messageHash = this.safeString(message, 'id');
        const result = this.safeList(message, 'result', []);
        const positions = [];
        for (let i = 0; i < result.length; i++) {
            const parsed = this.parsePositionRisk(result[i]);
            const entryPrice = this.safeString(parsed, 'entryPrice');
            if ((entryPrice !== '0') && (entryPrice !== '0.0') && (entryPrice !== '0.00000000')) {
                positions.push(parsed);
            }
        }
        client.resolve(positions, messageHash);
    }
    /**
     * @method
     * @name binance#watchBalance
     * @description watch balance and get the amount of funds available for trading or funds locked in orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.portfolioMargin] set to true if you would like to watch the balance of a portfolio margin account
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
     */
    async watchBalance(params = {}) {
        if (this.markets === undefined) {
            await this.loadMarkets();
        }
        // derive BEFORE authenticating and pass the result in: authenticate
        // re-derives from its own method scope, so without this a method-scoped
        // options.watchBalance.type seeds one bucket while the read below
        // indexes another - the same derive-first shape watchOrders uses
        let type = undefined;
        let subType = undefined;
        [type, subType, params] = this.resolveAuthType('watchBalance', undefined, params);
        await this.authenticate(this.extend({ 'type': type, 'subType': subType }, params));
        let isPortfolioMargin = undefined;
        [isPortfolioMargin, params] = this.handleOptionAndParams2(params, 'watchBalance', 'papi', 'portfolioMargin', false);
        let url = '';
        let urlType = type;
        if (type === 'spot' || type === 'margin') {
            // route to WebSocket API connection where the user data stream is subscribed
            url = this.urls['api']['ws']['ws-api']['spot'];
        }
        else {
            if (isPortfolioMargin) {
                urlType = 'papi';
            }
            else if (type === 'option') {
                const demoMode = this.safeBool(this.options, 'enableDemoTrading', false);
                if ((demoMode === true) || this.isSandboxModeEnabled) {
                    throw new errors.NotSupported(this.id + ' watchBalance() does not support option markets in demo/testnet mode');
                }
                urlType = 'optionPrivate';
            }
            url = this.getPrivateWsUrl(urlType, this.options[type]['listenKey']);
        }
        const client = this.client(url);
        this.setBalanceCache(client, type, isPortfolioMargin);
        this.setPositionsCache(client, type, undefined, isPortfolioMargin);
        const options = this.safeDict(this.options, 'watchBalance');
        const fetchBalanceSnapshot = this.safeBool(options, 'fetchBalanceSnapshot', false);
        const awaitBalanceSnapshot = this.safeBool(options, 'awaitBalanceSnapshot', true);
        if ((fetchBalanceSnapshot === true) && (awaitBalanceSnapshot === true)) {
            await client.future(type + ':fetchBalanceSnapshot');
        }
        const messageHash = type + ':balance';
        const message = undefined;
        return await this.watch(url, messageHash, message, type);
    }
    handleBalance(client, message) {
        //
        // sent upon a balance update not related to orders
        //
        //     {
        //         "e": "balanceUpdate",
        //         "E": 1629352505586,
        //         "a": "IOTX",
        //         "d": "0.43750000",
        //         "T": 1629352505585
        //     }
        //
        // sent upon creating or filling an order
        //
        //     {
        //         "e": "outboundAccountPosition", // Event type
        //         "E": 1564034571105,             // Event Time
        //         "u": 1564034571073,             // Time of last account update
        //         "B": [                          // Balances Array
        //             {
        //                 "a": "ETH",                 // Asset
        //                 "f": "10000.000000",        // Free
        //                 "l": "0.000000"             // Locked
        //             }
        //         ]
        //     }
        //
        // future/delivery
        //
        //     {
        //         "e": "ACCOUNT_UPDATE",            // Event Type
        //         "E": 1564745798939,               // Event Time
        //         "T": 1564745798938 ,              // Transaction
        //         "i": "SfsR",                      // Account Alias
        //         "a": {                            // Update Data
        //             "m":"ORDER",                  // Event reason type
        //             "B":[                         // Balances
        //                 {
        //                     "a":"BTC",                // Asset
        //                     "wb":"122624.12345678",   // Wallet Balance
        //                     "cw":"100.12345678"       // Cross Wallet Balance
        //                 },
        //             ],
        //             "P":[
        //                 {
        //                     "s":"BTCUSD_200925",      // Symbol
        //                     "pa":"0",                 // Position Amount
        //                     "ep":"0.0",               // Entry Price
        //                     "cr":"200",               // (Pre-fee) Accumulated Realized
        //                     "up":"0",                 // Unrealized PnL
        //                     "mt":"isolated",          // Margin Type
        //                     "iw":"0.00000000",        // Isolated Wallet (if isolated position)
        //                     "ps":"BOTH"               // Position Side
        //                 },
        //             ]
        //         }
        //     }
        // externalLockUpdate
        //    {
        //        "e": "externalLockUpdate",  // Event Type
        //        "E": 1581557507324,         // Event Time
        //        "a": "NEO",                 // Asset
        //        "d": "10.00000000",         // Delta
        //        "T": 1581557507268          // Transaction Time
        //    }
        //
        const wallet = this.safeString(this.options, 'wallet', 'wb'); // cw for cross wallet
        // each account is connected to a different endpoint
        const subscriptions = client.subscriptions;
        const subscriptionsKeys = Object.keys(subscriptions);
        const accountType = this.getAccountTypeFromSubscriptions(subscriptionsKeys);
        const messageHash = accountType + ':balance';
        if (this.balance[accountType] === undefined) {
            this.balance[accountType] = {};
        }
        this.balance[accountType]['info'] = message;
        const event = this.safeString(message, 'e');
        if (event === 'balanceUpdate') {
            const currencyId = this.safeString(message, 'a');
            const code = this.safeCurrencyCode(currencyId);
            const account = this.account();
            const delta = this.safeString(message, 'd');
            if ((accountType !== undefined) && (code !== undefined) && (code in this.balance[accountType])) {
                let previousValue = this.balance[accountType][code]['free'];
                if (typeof previousValue !== 'string') {
                    previousValue = this.numberToString(previousValue);
                }
                account['free'] = Precise["default"].stringAdd(previousValue, delta);
            }
            else {
                account['free'] = delta;
            }
            if ((accountType !== undefined) && (code !== undefined)) {
                this.balance[accountType][code] = account;
            }
        }
        else {
            message = this.safeDict(message, 'a', message);
            const B = this.safeList(message, 'B');
            if (B === undefined) {
                return;
            }
            for (let i = 0; i < B.length; i++) {
                const entry = B[i];
                const currencyId = this.safeString(entry, 'a');
                const code = this.safeCurrencyCode(currencyId);
                const account = this.account();
                account['free'] = this.safeString(entry, 'f');
                account['used'] = this.safeString(entry, 'l');
                account['total'] = this.safeString(entry, wallet);
                if ((accountType !== undefined) && (code !== undefined)) {
                    this.balance[accountType][code] = account;
                }
            }
        }
        const timestamp = this.safeInteger(message, 'E');
        this.balance[accountType]['timestamp'] = timestamp;
        this.balance[accountType]['datetime'] = this.iso8601(timestamp);
        this.balance[accountType] = this.safeBalance(this.balance[accountType]);
        client.resolve(this.balance[accountType], messageHash);
    }
    getAccountTypeFromSubscriptions(subscriptions) {
        let accountType = '';
        for (let i = 0; i < subscriptions.length; i++) {
            const subscription = subscriptions[i];
            if ((subscription === 'spot') || (subscription === 'margin') || (subscription === 'future') || (subscription === 'delivery') || (subscription === 'option')) {
                accountType = subscription;
                break;
            }
        }
        return accountType;
    }
    resolveAuthType(methodName, market = undefined, params = {}) {
        // the single home for user-data type derivation: market type, subType,
        // and the guarded linear/inverse rewrite. option and stock must keep
        // their own type, or the listenKey bucket, the endpoint dispatch and
        // the stream selection all silently degrade to futures - the guarded
        // sites used to carry seven inline copies of this dance, and the
        // unguarded copies were the bug class behind the option keepalive and
        // stock keepalive fixes
        let type = undefined;
        [type, params] = this.handleMarketTypeAndParams(methodName, market, params);
        let subType = undefined;
        [subType, params] = this.handleSubTypeAndParams(methodName, market, params);
        if (type !== 'option' && type !== 'stock') {
            if (this.isLinear(type, subType)) {
                type = 'future';
            }
            else if (this.isInverse(type, subType)) {
                type = 'delivery';
            }
        }
        // sites consuming every element unpack this; the two that skip subType
        // index it positionally instead, so no receiver is declared-but-unread
        return [type, subType, params];
    }
    getMarketType(method, market, params = {}) {
        let type = undefined;
        [type, params] = this.handleMarketTypeAndParams(method, market, params);
        let subType = undefined;
        [subType, params] = this.handleSubTypeAndParams(method, market, params);
        if (this.isLinear(type, subType)) {
            type = 'future';
        }
        else if (this.isInverse(type, subType)) {
            type = 'delivery';
        }
        return type;
    }
    /**
     * @method
     * @name binance#createOrderWs
     * @description create a trade order
     * @see https://developers.binance.com/docs/binance-spot-api-docs/websocket-api/trading-requests#place-new-order-trade
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/websocket-api/New-Order
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/websocket-api
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/websocket-api/New-Algo-Order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float|undefined} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} params.test test order, default false
     * @param {boolean} params.returnRateLimits set to true to return rate limit information, default false
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async createOrderWs(symbol, type, side, amount, price = undefined, params = {}) {
        if (this.markets === undefined) {
            await this.loadMarkets();
        }
        const market = this.market(symbol);
        const marketType = this.getMarketType('createOrderWs', market, params);
        if (marketType !== 'spot' && marketType !== 'future' && marketType !== 'delivery') {
            throw new errors.BadRequest(this.id + ' createOrderWs only supports spot or swap markets');
        }
        const url = this.urls['api']['ws']['ws-api'][marketType];
        const requestId = this.requestId(url);
        const messageHash = requestId.toString();
        const sor = this.safeBool2(params, 'sor', 'SOR', false);
        params = this.omit(params, 'sor', 'SOR');
        const triggerPrice = this.safeString2(params, 'triggerPrice', 'stopPrice');
        const stopLossPrice = this.safeString(params, 'stopLossPrice', triggerPrice);
        const takeProfitPrice = this.safeString(params, 'takeProfitPrice');
        const trailingDelta = this.safeString(params, 'trailingDelta');
        const trailingPercent = this.safeStringN(params, ['trailingPercent', 'callbackRate', 'trailingDelta']);
        const isTrailingPercentOrder = trailingPercent !== undefined;
        const isStopLoss = stopLossPrice !== undefined || trailingDelta !== undefined;
        const isTakeProfit = takeProfitPrice !== undefined;
        const isTriggerOrder = triggerPrice !== undefined;
        const isConditional = isTriggerOrder || isTrailingPercentOrder || isStopLoss || isTakeProfit;
        const payload = this.createOrderRequest(symbol, type, side, amount, price, params);
        let returnRateLimits = false;
        [returnRateLimits, params] = this.handleOptionAndParams(params, 'createOrderWs', 'returnRateLimits', false);
        payload['returnRateLimits'] = returnRateLimits;
        const test = this.safeBool(params, 'test', false);
        params = this.omit(params, 'test');
        if ((market['linear'] === true) && (market['swap'] === true) && isConditional) {
            payload['algoType'] = 'CONDITIONAL';
        }
        const message = {
            'id': messageHash,
            'method': 'order.place',
            'params': this.signParams(this.extend(payload, params)),
        };
        if (test === true) {
            if (sor === true) {
                message['method'] = 'sor.order.test';
            }
            else {
                message['method'] = 'order.test';
            }
        }
        if ((market['linear'] === true) && (market['swap'] === true) && isConditional) {
            message['method'] = 'algoOrder.place';
        }
        const subscription = {
            'method': this.handleOrderWs,
        };
        return await this.watch(url, messageHash, message, messageHash, subscription);
    }
    handleOrderWs(client, message) {
        //
        //    {
        //        "id": 1,
        //        "status": 200,
        //        "result": {
        //          "symbol": "BTCUSDT",
        //          "orderId": 7663053,
        //          "orderListId": -1,
        //          "clientOrderId": "x-R4BD3S82d8959d0f5114499487a614",
        //          "transactTime": 1687642291434,
        //          "price": "25000.00000000",
        //          "origQty": "0.00100000",
        //          "executedQty": "0.00000000",
        //          "cummulativeQuoteQty": "0.00000000",
        //          "status": "NEW",
        //          "timeInForce": "GTC",
        //          "type": "LIMIT",
        //          "side": "BUY",
        //          "workingTime": 1687642291434,
        //          "fills": [],
        //          "selfTradePreventionMode": "NONE"
        //        },
        //        "rateLimits": [
        //          {
        //            "rateLimitType": "ORDERS",
        //            "interval": "SECOND",
        //            "intervalNum": 10,
        //            "limit": 50,
        //            "count": 1
        //          },
        //          {
        //            "rateLimitType": "ORDERS",
        //            "interval": "DAY",
        //            "intervalNum": 1,
        //            "limit": 160000,
        //            "count": 1
        //          },
        //          {
        //            "rateLimitType": "REQUEST_WEIGHT",
        //            "interval": "MINUTE",
        //            "intervalNum": 1,
        //            "limit": 1200,
        //            "count": 12
        //          }
        //        ]
        //    }
        //
        const messageHash = this.safeString(message, 'id');
        const result = this.safeDict(message, 'result', {});
        const order = this.parseOrder(result);
        client.resolve(order, messageHash);
    }
    handleOrdersWs(client, message) {
        //
        //    {
        //        "id": 1,
        //        "status": 200,
        //        "result": [{
        //            "symbol": "BTCUSDT",
        //            "orderId": 7665584,
        //            "orderListId": -1,
        //            "clientOrderId": "x-R4BD3S82b54769abdd3e4b57874c52",
        //            "price": "26000.00000000",
        //            "origQty": "0.00100000",
        //            "executedQty": "0.00000000",
        //            "cummulativeQuoteQty": "0.00000000",
        //            "status": "NEW",
        //            "timeInForce": "GTC",
        //            "type": "LIMIT",
        //            "side": "BUY",
        //            "stopPrice": "0.00000000",
        //            "icebergQty": "0.00000000",
        //            "time": 1687642884646,
        //            "updateTime": 1687642884646,
        //            "isWorking": true,
        //            "workingTime": 1687642884646,
        //            "origQuoteOrderQty": "0.00000000",
        //            "selfTradePreventionMode": "NONE"
        //        },
        //        ...
        //        ],
        //        "rateLimits": [{
        //            "rateLimitType": "REQUEST_WEIGHT",
        //            "interval": "MINUTE",
        //            "intervalNum": 1,
        //            "limit": 1200,
        //            "count": 14
        //        }]
        //    }
        //
        const messageHash = this.safeString(message, 'id');
        const result = this.safeList(message, 'result', []);
        const orders = this.parseOrders(result);
        client.resolve(orders, messageHash);
    }
    /**
     * @method
     * @name binance#editOrderWs
     * @description edit a trade order
     * @see https://developers.binance.com/docs/binance-spot-api-docs/websocket-api/trading-requests#cancel-and-replace-order-trade
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/websocket-api/Modify-Order
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/websocket-api/Modify-Order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of the currency you want to trade in units of the base currency
     * @param {float|undefined} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async editOrderWs(id, symbol, type, side, amount = undefined, price = undefined, params = {}) {
        if (this.markets === undefined) {
            await this.loadMarkets();
        }
        const market = this.market(symbol);
        const marketType = this.getMarketType('editOrderWs', market, params);
        if (marketType !== 'spot' && marketType !== 'future' && marketType !== 'delivery') {
            throw new errors.BadRequest(this.id + ' editOrderWs only supports spot or swap markets');
        }
        const url = this.urls['api']['ws']['ws-api'][marketType];
        const requestId = this.requestId(url);
        const messageHash = requestId.toString();
        const isSwap = (marketType === 'future' || marketType === 'delivery');
        let payload = {};
        if (marketType === 'spot') {
            payload = this.editSpotOrderRequest(id, symbol, type, side, amount, price, params);
        }
        else {
            payload = this.editContractOrderRequest(id, symbol, type, side, amount, price, params);
        }
        let returnRateLimits = false;
        [returnRateLimits, params] = this.handleOptionAndParams(params, 'editOrderWs', 'returnRateLimits', false);
        payload['returnRateLimits'] = returnRateLimits;
        const message = {
            'id': messageHash,
            'method': (isSwap) ? 'order.modify' : 'order.cancelReplace',
            'params': this.signParams(this.extend(payload, params)),
        };
        const subscription = {
            'method': this.handleEditOrderWs,
        };
        return await this.watch(url, messageHash, message, messageHash, subscription);
    }
    handleEditOrderWs(client, message) {
        //
        // spot
        //    {
        //        "id": 1,
        //        "status": 200,
        //        "result": {
        //            "cancelResult": "SUCCESS",
        //            "newOrderResult": "SUCCESS",
        //            "cancelResponse": {
        //                "symbol": "BTCUSDT",
        //                "origClientOrderId": "x-R4BD3S82813c5d7ffa594104917de2",
        //                "orderId": 7665177,
        //                "orderListId": -1,
        //                "clientOrderId": "mbrnbQsQhtCXCLY45d5q7S",
        //                "price": "26000.00000000",
        //                "origQty": "0.00100000",
        //                "executedQty": "0.00000000",
        //                "cummulativeQuoteQty": "0.00000000",
        //                "status": "CANCELED",
        //                "timeInForce": "GTC",
        //                "type": "LIMIT",
        //                "side": "BUY",
        //                "selfTradePreventionMode": "NONE"
        //            },
        //            "newOrderResponse": {
        //                "symbol": "BTCUSDT",
        //                "orderId": 7665584,
        //                "orderListId": -1,
        //                "clientOrderId": "x-R4BD3S82b54769abdd3e4b57874c52",
        //                "transactTime": 1687642884646,
        //                "price": "26000.00000000",
        //                "origQty": "0.00100000",
        //                "executedQty": "0.00000000",
        //                "cummulativeQuoteQty": "0.00000000",
        //                "status": "NEW",
        //                "timeInForce": "GTC",
        //                "type": "LIMIT",
        //                "side": "BUY",
        //                "workingTime": 1687642884646,
        //                "fills": [],
        //                "selfTradePreventionMode": "NONE"
        //            }
        //        },
        //        "rateLimits": [{
        //                "rateLimitType": "ORDERS",
        //                "interval": "SECOND",
        //                "intervalNum": 10,
        //                "limit": 50,
        //                "count": 1
        //            },
        //            {
        //                "rateLimitType": "ORDERS",
        //                "interval": "DAY",
        //                "intervalNum": 1,
        //                "limit": 160000,
        //                "count": 3
        //            },
        //            {
        //                "rateLimitType": "REQUEST_WEIGHT",
        //                "interval": "MINUTE",
        //                "intervalNum": 1,
        //                "limit": 1200,
        //                "count": 12
        //            }
        //        ]
        //    }
        // swap
        //    {
        //        "id":"1",
        //        "status":200,
        //        "result":{
        //            "orderId":667061487,
        //            "symbol":"LTCUSDT",
        //            "status":"NEW",
        //            "clientOrderId":"x-xcKtGhcu91a74c818749ee42c0f70",
        //            "price":"82.00",
        //            "avgPrice":"0.00",
        //            "origQty":"1.000",
        //            "executedQty":"0.000",
        //            "cumQty":"0.000",
        //            "cumQuote":"0.00000",
        //            "timeInForce":"GTC",
        //            "type":"LIMIT",
        //            "reduceOnly":false,
        //            "closePosition":false,
        //            "side":"BUY",
        //            "positionSide":"BOTH",
        //            "stopPrice":"0.00",
        //            "workingType":"CONTRACT_PRICE",
        //            "priceProtect":false,
        //            "origType":"LIMIT",
        //            "priceMatch":"NONE",
        //            "selfTradePreventionMode":"NONE",
        //            "goodTillDate":0,
        //            "updateTime":1712918927511
        //        }
        //    }
        //
        const messageHash = this.safeString(message, 'id');
        const result = this.safeDict(message, 'result', {});
        const newSpotOrder = this.safeDict(result, 'newOrderResponse');
        let order;
        if (newSpotOrder !== undefined) {
            order = this.parseOrder(newSpotOrder);
        }
        else {
            order = this.parseOrder(result);
        }
        client.resolve(order, messageHash);
    }
    /**
     * @method
     * @name binance#cancelOrderWs
     * @description cancel multiple orders
     * @see https://developers.binance.com/docs/binance-spot-api-docs/websocket-api/trading-requests#cancel-order-trade
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/websocket-api/Cancel-Order
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/websocket-api/Cancel-Order
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/websocket-api/Cancel-Algo-Order
     * @param {string} id order id
     * @param {string} [symbol] unified market symbol, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string|undefined} [params.cancelRestrictions] Supported values: ONLY_NEW - Cancel will succeed if the order status is NEW. ONLY_PARTIALLY_FILLED - Cancel will succeed if order status is PARTIALLY_FILLED.
     * @param {boolean} [params.trigger] set to true if you would like to cancel a conditional order
     * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async cancelOrderWs(id, symbol = undefined, params = {}) {
        if (this.markets === undefined) {
            await this.loadMarkets();
        }
        if (symbol === undefined) {
            throw new errors.BadRequest(this.id + ' cancelOrderWs requires a symbol');
        }
        const market = this.market(symbol);
        const type = this.getMarketType('cancelOrderWs', market, params);
        const url = this.urls['api']['ws']['ws-api'][type];
        const requestId = this.requestId(url);
        const messageHash = requestId.toString();
        let returnRateLimits = false;
        [returnRateLimits, params] = this.handleOptionAndParams(params, 'cancelOrderWs', 'returnRateLimits', false);
        const payload = {
            'symbol': this.marketId(symbol),
            'returnRateLimits': returnRateLimits,
        };
        const isConditional = this.safeBoolN(params, ['stop', 'trigger', 'conditional']);
        const clientOrderId = this.safeStringN(params, ['clientAlgoId', 'origClientOrderId', 'clientOrderId']);
        const shouldUseAlgoOrder = (market['linear'] === true) && (market['swap'] === true) && (isConditional === true);
        if (clientOrderId !== undefined) {
            if (shouldUseAlgoOrder === true) {
                payload['clientAlgoId'] = clientOrderId;
            }
            else {
                payload['origClientOrderId'] = clientOrderId;
            }
        }
        else {
            if (shouldUseAlgoOrder === true) {
                payload['algoId'] = this.numberToString(id);
            }
            else {
                payload['orderId'] = this.numberToString(id);
            }
        }
        params = this.omit(params, ['origClientOrderId', 'clientOrderId', 'stop', 'trigger', 'conditional']);
        const message = {
            'id': messageHash,
            'method': 'order.cancel',
            'params': this.signParams(this.extend(payload, params)),
        };
        if (shouldUseAlgoOrder === true) {
            message['method'] = 'algoOrder.cancel';
        }
        const subscription = {
            'method': this.handleOrderWs,
        };
        return await this.watch(url, messageHash, message, messageHash, subscription);
    }
    /**
     * @method
     * @name binance#cancelAllOrdersWs
     * @description cancel all open orders in a market
     * @see https://developers.binance.com/docs/binance-spot-api-docs/websocket-api/trading-requests#cancel-open-orders-trade
     * @param {string} [symbol] unified market symbol of the market to cancel orders in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async cancelAllOrdersWs(symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' cancelAllOrdersWs() requires a symbol argument');
        }
        if (this.markets === undefined) {
            await this.loadMarkets();
        }
        const market = this.market(symbol);
        const type = this.getMarketType('cancelAllOrdersWs', market, params);
        if (type !== 'spot') {
            throw new errors.BadRequest(this.id + ' cancelAllOrdersWs only supports spot markets');
        }
        const url = this.urls['api']['ws']['ws-api'][type];
        const requestId = this.requestId(url);
        const messageHash = requestId.toString();
        let returnRateLimits = false;
        [returnRateLimits, params] = this.handleOptionAndParams(params, 'cancelAllOrdersWs', 'returnRateLimits', false);
        const payload = {
            'symbol': this.marketId(symbol),
            'returnRateLimits': returnRateLimits,
        };
        const message = {
            'id': messageHash,
            'method': 'openOrders.cancelAll',
            'params': this.signParams(this.extend(payload, params)),
        };
        const subscription = {
            'method': this.handleOrdersWs,
        };
        return await this.watch(url, messageHash, message, messageHash, subscription);
    }
    /**
     * @method
     * @name binance#fetchOrderWs
     * @description fetches information on an order made by the user
     * @see https://developers.binance.com/docs/binance-spot-api-docs/websocket-api/trading-requests#query-order-user_data
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/websocket-api/Query-Order
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/websocket-api/Query-Order
     * @param {string} id order id
     * @param {string} [symbol] unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async fetchOrderWs(id, symbol = undefined, params = {}) {
        if (this.markets === undefined) {
            await this.loadMarkets();
        }
        if (symbol === undefined) {
            throw new errors.BadRequest(this.id + ' cancelOrderWs requires a symbol');
        }
        const market = this.market(symbol);
        const type = this.getMarketType('fetchOrderWs', market, params);
        if (type !== 'spot' && type !== 'future' && type !== 'delivery') {
            throw new errors.BadRequest(this.id + ' fetchOrderWs only supports spot or swap markets');
        }
        const url = this.urls['api']['ws']['ws-api'][type];
        const requestId = this.requestId(url);
        const messageHash = requestId.toString();
        let returnRateLimits = false;
        [returnRateLimits, params] = this.handleOptionAndParams(params, 'fetchOrderWs', 'returnRateLimits', false);
        const payload = {
            'symbol': this.marketId(symbol),
            'returnRateLimits': returnRateLimits,
        };
        const clientOrderId = this.safeString2(params, 'origClientOrderId', 'clientOrderId');
        if (clientOrderId !== undefined) {
            payload['origClientOrderId'] = clientOrderId;
        }
        else {
            payload['orderId'] = this.numberToString(id);
        }
        const message = {
            'id': messageHash,
            'method': 'order.status',
            'params': this.signParams(this.extend(payload, params)),
        };
        const subscription = {
            'method': this.handleOrderWs,
        };
        return await this.watch(url, messageHash, message, messageHash, subscription);
    }
    /**
     * @method
     * @name binance#fetchOrdersWs
     * @description fetches information on multiple orders made by the user
     * @see https://developers.binance.com/docs/binance-spot-api-docs/websocket-api/trading-requests#order-lists
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int|undefined} [since] the earliest time in ms to fetch orders for
     * @param {int|undefined} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.orderId] order id to begin at
     * @param {int} [params.startTime] earliest time in ms to retrieve orders for
     * @param {int} [params.endTime] latest time in ms to retrieve orders for
     * @param {int} [params.limit] the maximum number of order structures to retrieve
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async fetchOrdersWs(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (this.markets === undefined) {
            await this.loadMarkets();
        }
        if (symbol === undefined) {
            throw new errors.BadRequest(this.id + ' fetchOrdersWs requires a symbol');
        }
        const market = this.market(symbol);
        const type = this.getMarketType('fetchOrdersWs', market, params);
        if (type !== 'spot') {
            throw new errors.BadRequest(this.id + ' fetchOrdersWs only supports spot markets');
        }
        const url = this.urls['api']['ws']['ws-api'][type];
        const requestId = this.requestId(url);
        const messageHash = requestId.toString();
        let returnRateLimits = false;
        [returnRateLimits, params] = this.handleOptionAndParams(params, 'fetchOrdersWs', 'returnRateLimits', false);
        const payload = {
            'symbol': this.marketId(symbol),
            'returnRateLimits': returnRateLimits,
        };
        const message = {
            'id': messageHash,
            'method': 'allOrders',
            'params': this.signParams(this.extend(payload, params)),
        };
        const subscription = {
            'method': this.handleOrdersWs,
        };
        const orders = await this.watch(url, messageHash, message, messageHash, subscription);
        return this.filterBySymbolSinceLimit(orders, symbol, since, limit);
    }
    /**
     * @method
     * @name binance#fetchClosedOrdersWs
     * @description fetch closed orders
     * @see https://developers.binance.com/docs/binance-spot-api-docs/websocket-api/trading-requests#order-lists
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async fetchClosedOrdersWs(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const orders = await this.fetchOrdersWs(symbol, since, limit, params);
        const closedOrders = [];
        for (let i = 0; i < orders.length; i++) {
            const order = orders[i];
            if (order['status'] === 'closed') {
                closedOrders.push(order);
            }
        }
        return closedOrders;
    }
    /**
     * @method
     * @name binance#fetchOpenOrdersWs
     * @description fetch all unfilled currently open orders
     * @see https://developers.binance.com/docs/binance-spot-api-docs/websocket-api/trading-requests#current-open-orders-user_data
     * @param {string} symbol unified market symbol
     * @param {int|undefined} [since] the earliest time in ms to fetch open orders for
     * @param {int|undefined} [limit] the maximum number of open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async fetchOpenOrdersWs(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (this.markets === undefined) {
            await this.loadMarkets();
        }
        const market = this.market(symbol);
        const type = this.getMarketType('fetchOpenOrdersWs', market, params);
        if (type !== 'spot') {
            throw new errors.BadRequest(this.id + ' fetchOpenOrdersWs only supports spot markets');
        }
        const url = this.urls['api']['ws']['ws-api'][type];
        const requestId = this.requestId(url);
        const messageHash = requestId.toString();
        let returnRateLimits = false;
        [returnRateLimits, params] = this.handleOptionAndParams(params, 'fetchOpenOrdersWs', 'returnRateLimits', false);
        const payload = {
            'returnRateLimits': returnRateLimits,
        };
        if (symbol !== undefined) {
            payload['symbol'] = this.marketId(symbol);
        }
        const message = {
            'id': messageHash,
            'method': 'openOrders.status',
            'params': this.signParams(this.extend(payload, params)),
        };
        const subscription = {
            'method': this.handleOrdersWs,
        };
        const orders = await this.watch(url, messageHash, message, messageHash, subscription);
        return this.filterBySymbolSinceLimit(orders, symbol, since, limit);
    }
    /**
     * @method
     * @name binance#watchOrders
     * @description watches information on multiple orders made by the user
     * @see https://developers.binance.com/docs/binance-spot-api-docs/user-data-stream#order-update
     * @see https://developers.binance.com/docs/margin_trading/trade-data-stream/Event-Order-Update
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/user-data-streams/Event-Order-Update
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/user-data-streams/Event-Algo-Order-Update
     * @see https://developers.binance.com/en/docs/catalog/advanced-trading-stocks-trading/api/ws-streams/user-streams#order-report-stream
     * @param {string} symbol unified market symbol of the market the orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.stock] set to true to use stocks user data streams
     * @param {string|undefined} [params.marginMode] 'cross' or 'isolated', for spot margin
     * @param {boolean} [params.portfolioMargin] set to true if you would like to watch portfolio margin account orders
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async watchOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (this.markets === undefined) {
            await this.loadMarkets();
        }
        let stock = false;
        [stock, params] = this.handleOptionAndParams(params, 'watchOrders', 'stock', false);
        if (stock) {
            // literal on top: a stray type in the caller params must not override
            // the forced stock, the removed authenticateStock ignored it entirely
            await this.authenticate(this.extend(params, { 'type': 'stock' }));
            const stockOptions = this.safeDict(this.options, 'stock', {});
            const stockListenKey = this.safeString(stockOptions, 'listenKey');
            if (stockListenKey === undefined) {
                throw new errors.BadRequest(this.id + ' watchOrders() failed to initialize stock listenKey');
            }
            const stockUrl = this.getStockWsUrl('user');
            const stockStreamName = stockListenKey + '@orderReport';
            const stockRequestId = this.requestId(stockUrl);
            let stockMessageHash = 'orders';
            if (symbol !== undefined) {
                stockMessageHash = 'orders:' + this.symbol(symbol);
            }
            const stockRequest = {
                'method': 'SUBSCRIBE',
                'params': [stockStreamName],
                'id': stockRequestId,
            };
            const stockQuery = this.omit(params, ['stock', 'name', 'callerMethodName', 'type', 'subType', 'symbol', 'timeframe']);
            const stockSubscribe = {
                'id': stockRequestId,
            };
            const stockOrders = await this.watch(stockUrl, stockMessageHash, this.extend(stockRequest, stockQuery), stockMessageHash, stockSubscribe);
            if (this.newUpdates) {
                limit = stockOrders.getLimit(symbol, limit);
            }
            return this.filterBySymbolSinceLimit(stockOrders, symbol, since, limit, true);
        }
        let messageHash = 'orders';
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            symbol = market['symbol'];
            messageHash += ':' + symbol;
        }
        let type = undefined;
        let subType = undefined;
        [type, subType, params] = this.resolveAuthType('watchOrders', market, params);
        params = this.extend(params, { 'type': type, 'symbol': symbol, 'subType': subType }); // needed inside authenticate for isolated margin
        await this.authenticate(params);
        let marginMode = undefined;
        [marginMode, params] = this.handleMarginModeAndParams('watchOrders', params);
        let urlType = type;
        if ((type === 'margin') || ((type === 'spot') && (marginMode !== undefined))) {
            urlType = 'spot'; // spot-margin shares the same stream as regular spot
        }
        let isPortfolioMargin = undefined;
        [isPortfolioMargin, params] = this.handleOptionAndParams2(params, 'watchOrders', 'papi', 'portfolioMargin', false);
        let url = '';
        if (type === 'spot' || type === 'margin') {
            // route orders to ws-api user data stream
            url = this.urls['api']['ws']['ws-api']['spot'];
        }
        else {
            if (isPortfolioMargin) {
                urlType = 'papi';
            }
            else if (type === 'option') {
                const demoMode = this.safeBool(this.options, 'enableDemoTrading', false);
                if ((demoMode === true) || this.isSandboxModeEnabled) {
                    throw new errors.NotSupported(this.id + ' watchOrders() does not support option markets in demo/testnet mode');
                }
                urlType = 'optionPrivate';
            }
            url = this.getPrivateWsUrl(urlType, this.options[type]['listenKey']);
        }
        const client = this.client(url);
        this.setBalanceCache(client, type, isPortfolioMargin);
        this.setPositionsCache(client, type, undefined, isPortfolioMargin);
        const message = undefined;
        const orders = await this.watch(url, messageHash, message, type);
        if (this.newUpdates) {
            limit = orders.getLimit(symbol, limit);
        }
        return this.filterBySymbolSinceLimit(orders, symbol, since, limit, true);
    }
    parseWsOrder(order, market = undefined) {
        //
        // spot
        //
        //     {
        //         "e": "executionReport",        // Event type
        //         "E": 1499405658658,            // Event time
        //         "s": "ETHBTC",                 // Symbol
        //         "c": "mUvoqJxFIILMdfAW5iGSOW", // Client order ID
        //         "S": "BUY",                    // Side
        //         "o": "LIMIT",                  // Order type
        //         "f": "GTC",                    // Time in force
        //         "q": "1.00000000",             // Order quantity
        //         "p": "0.10264410",             // Order price
        //         "P": "0.00000000",             // Stop price
        //         "F": "0.00000000",             // Iceberg quantity
        //         "g": -1,                       // OrderListId
        //         "C": null,                     // Original client order ID; This is the ID of the order being canceled
        //         "x": "NEW",                    // Current execution type
        //         "X": "NEW",                    // Current order status
        //         "r": "NONE",                   // Order reject reason; will be an error code.
        //         "i": 4293153,                  // Order ID
        //         "l": "0.00000000",             // Last executed quantity
        //         "z": "0.00000000",             // Cumulative filled quantity
        //         "L": "0.00000000",             // Last executed price
        //         "n": "0",                      // Commission amount
        //         "N": null,                     // Commission asset
        //         "T": 1499405658657,            // Transaction time
        //         "t": -1,                       // Trade ID
        //         "I": 8641984,                  // Ignore
        //         "w": true,                     // Is the order on the book?
        //         "m": false,                    // Is this trade the maker side?
        //         "M": false,                    // Ignore
        //         "O": 1499405658657,            // Order creation time
        //         "Z": "0.00000000",             // Cumulative quote asset transacted quantity
        //         "Y": "0.00000000"              // Last quote asset transacted quantity (i.e. lastPrice * lastQty),
        //         "Q": "0.00000000"              // Quote Order Qty
        //     }
        //
        // future
        //
        //     {
        //         "s":"BTCUSDT",                 // Symbol
        //         "c":"TEST",                    // Client Order Id
        //                                        // special client order id:
        //                                        // starts with "autoclose-": liquidation order
        //                                        // "adl_autoclose": ADL auto close order
        //         "S":"SELL",                    // Side
        //         "o":"TRAILING_STOP_MARKET",    // Order Type
        //         "f":"GTC",                     // Time in Force
        //         "q":"0.001",                   // Original Quantity
        //         "p":"0",                       // Original Price
        //         "ap":"0",                      // Average Price
        //         "sp":"7103.04",                // Stop Price. Please ignore with TRAILING_STOP_MARKET order
        //         "x":"NEW",                     // Execution Type
        //         "X":"NEW",                     // Order Status
        //         "i":8886774,                   // Order Id
        //         "l":"0",                       // Order Last Filled Quantity
        //         "z":"0",                       // Order Filled Accumulated Quantity
        //         "L":"0",                       // Last Filled Price
        //         "N":"USDT",                    // Commission Asset, will not push if no commission
        //         "n":"0",                       // Commission, will not push if no commission
        //         "T":1568879465651,             // Order Trade Time
        //         "t":0,                         // Trade Id
        //         "b":"0",                       // Bids Notional
        //         "a":"9.91",                    // Ask Notional
        //         "m":false,                     // Is this trade the maker side?
        //         "R":false,                     // Is this reduce only
        //         "wt":"CONTRACT_PRICE",         // Stop Price Working Type
        //         "ot":"TRAILING_STOP_MARKET",   // Original Order Type
        //         "ps":"LONG",                   // Position Side
        //         "cp":false,                    // If Close-All, pushed with conditional order
        //         "AP":"7476.89",                // Activation Price, only puhed with TRAILING_STOP_MARKET order
        //         "cr":"5.0",                    // Callback Rate, only puhed with TRAILING_STOP_MARKET order
        //         "rp":"0"                       // Realized Profit of the trade
        //     }
        //
        // watchOrders: linear swap trigger order
        //
        //     {
        //         "caid":"Q5xaq5EGKgXXa0fD7fs0Ip",     // Client Algo Id
        //         "aid":2148719,                       // Algo Id
        //         "at":"CONDITIONAL",                  // Algo Type
        //         "o":"TAKE_PROFIT",                   // Order Type
        //         "s":"BNBUSDT",                       // Symbol
        //         "S":"SELL",                          // Side
        //         "ps":"BOTH",                         // Position Side
        //         "f":"GTC",                           // Time in force
        //         "q":"0.01",                          // quantity
        //         "X":"CANCELED",                      // Algo status
        //         "ai":"",                             // order id
        //         "ap": "0.00000",                     // avg fill price in matching engine, only display when order is triggered and placed in matching engine
        //         "aq": "0.00000",                     // execuated quantity in matching engine, only display when order is triggered and placed in matching engine
        //         "act": "0",                          // actual order type in matching engine, only display when order is triggered and placed in matching engine
        //         "tp":"750",                          // Trigger price
        //         "p":"750",                           // Order Price
        //         "V":"EXPIRE_MAKER",                  // STP mode
        //         "wt":"CONTRACT_PRICE",               // Working type
        //         "pm":"NONE",                         // Price match mode
        //         "cp":false,                          // If Close-All
        //         "pP":false,                          // If price protection is turned on
        //         "R":false,                           // Is this reduce only
        //         "tt":0,                              // Trigger time
        //         "gtd":0,                             // good till time for GTD time in force
        //         "rm": "Reduce Only reject"           // algo order failed reason
        //     }
        //
        // watchOrders: tokenized equities
        //
        //     {
        //         "e": "orderReport",
        //         "E": 1786010067484,
        //         "x": "ORDER_UPDATE",
        //         "i": "6c62d749-b1e5-4559-9747-d4237f55ff26",
        //         "ai": "b0b6dd9d-8b9b-48a9-ba46-b9d54906e415",
        //         "b": "EQ_AAPL",
        //         "q": "USDC",
        //         "S": "buy",
        //         "o": "limit",
        //         "p": 290,
        //         "Q": 0.02,
        //         "N": null,
        //         "fq": 0,
        //         "FN": 0,
        //         "tc": 5.97,
        //         "Z": 0,
        //         "n": "24H",
        //         "s": "new",
        //         "T": 1786010067361,
        //         "U": 1786010067366
        //     }
        //
        const event = this.safeString(order, 'e');
        if (event === 'orderReport') {
            const baseAssetCode = this.safeString(order, 'b');
            let stockBaseSymbol = baseAssetCode;
            if ((stockBaseSymbol !== undefined) && (stockBaseSymbol.indexOf('EQ_') === 0)) {
                stockBaseSymbol = stockBaseSymbol.slice(3);
            }
            if (stockBaseSymbol === undefined) {
                stockBaseSymbol = this.safeString(order, 'symbol');
            }
            const stockQuote = this.safeString(order, 'q', 'USDC');
            const stockSymbol = this.getStockUnifiedSymbol(stockBaseSymbol, stockQuote);
            const stockRawStatus = this.safeStringLower(order, 's');
            const statuses = {
                'accepted': 'open',
                'new': 'open',
                'partially_filled': 'open',
                'filled': 'closed',
                'canceled': 'canceled',
                'rejected': 'rejected',
                'expired': 'expired',
            };
            const stockStatus = this.safeString(statuses, stockRawStatus, stockRawStatus);
            const stockAmount = this.safeString(order, 'Q');
            const stockFilled = this.safeString(order, 'fq');
            let stockRemaining = undefined;
            if ((stockAmount !== undefined) && (stockFilled !== undefined)) {
                stockRemaining = Precise["default"].stringSub(stockAmount, stockFilled);
            }
            const stockTimestamp = this.safeInteger(order, 'T');
            const stockLastUpdateTimestamp = this.safeInteger(order, 'U', stockTimestamp);
            return this.safeOrder({
                'info': order,
                'symbol': stockSymbol,
                'id': this.safeString(order, 'i'),
                'timestamp': stockTimestamp,
                'datetime': this.iso8601(stockTimestamp),
                'lastUpdateTimestamp': stockLastUpdateTimestamp,
                'type': this.parseOrderTypeByMarket(this.safeStringLower(order, 'o'), 'spot'),
                'timeInForce': undefined,
                'postOnly': undefined,
                'reduceOnly': undefined,
                'side': this.safeStringLower(order, 'S'),
                'price': this.safeString(order, 'p'),
                'stopPrice': undefined,
                'triggerPrice': undefined,
                'amount': stockAmount,
                'cost': this.safeString(order, 'FN'),
                'average': undefined,
                'filled': stockFilled,
                'remaining': stockRemaining,
                'status': stockStatus,
                'fee': undefined,
                'trades': undefined,
            });
        }
        const executionType = this.safeString(order, 'x');
        const marketId = this.safeString(order, 's');
        // futures user-data events carry the position side field, spot ones do not
        const marketType = ('ps' in order) ? 'contract' : 'spot';
        const symbol = this.safeSymbol(marketId, undefined, undefined, marketType);
        let timestamp = this.safeInteger(order, 'O');
        const T = this.safeInteger(order, 'T');
        let lastTradeTimestamp = undefined;
        if (executionType === 'NEW' || executionType === 'AMENDMENT' || executionType === 'CANCELED') {
            if (timestamp === undefined) {
                timestamp = T;
            }
        }
        else if (executionType === 'TRADE') {
            lastTradeTimestamp = T;
        }
        const lastUpdateTimestamp = T;
        let fee = undefined;
        const feeCost = this.safeString(order, 'n');
        if ((feeCost !== undefined) && (Precise["default"].stringGt(feeCost, '0'))) {
            const feeCurrencyId = this.safeString(order, 'N');
            const feeCurrency = this.safeCurrencyCode(feeCurrencyId);
            fee = {
                'cost': feeCost,
                'currency': feeCurrency,
            };
        }
        const rawStatus = this.safeString(order, 'X');
        const status = this.parseOrderStatus(rawStatus);
        let clientOrderId = this.safeString2(order, 'C', 'caid');
        if ((clientOrderId === undefined) || (clientOrderId.length === 0)) {
            clientOrderId = this.safeString(order, 'c');
        }
        const stopPrice = this.safeStringN(order, ['P', 'sp', 'tp']);
        let timeInForce = this.safeString(order, 'f');
        if (timeInForce === 'GTX') {
            // GTX means "Good Till Crossing" and is an equivalent way of saying Post Only
            timeInForce = 'PO';
        }
        return this.safeOrder({
            'info': order,
            'symbol': symbol,
            'id': this.safeString2(order, 'i', 'aid'),
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'lastUpdateTimestamp': lastUpdateTimestamp,
            'type': this.parseOrderTypeByMarket(this.safeStringLower(order, 'o'), marketType),
            'timeInForce': timeInForce,
            'postOnly': undefined,
            'reduceOnly': this.safeBool(order, 'R'),
            'side': this.safeStringLower(order, 'S'),
            'price': this.safeString(order, 'p'),
            'stopPrice': stopPrice,
            'triggerPrice': stopPrice,
            'amount': this.safeString(order, 'q'),
            'cost': this.safeString(order, 'Z'),
            'average': this.safeString(order, 'ap'),
            'filled': this.safeString(order, 'z'),
            'remaining': undefined,
            'status': status,
            'fee': fee,
            'trades': undefined,
        });
    }
    handleOrderUpdate(client, message) {
        //
        // spot
        //
        //     {
        //         "e": "executionReport",        // Event type
        //         "E": 1499405658658,            // Event time
        //         "s": "ETHBTC",                 // Symbol
        //         "c": "mUvoqJxFIILMdfAW5iGSOW", // Client order ID
        //         "S": "BUY",                    // Side
        //         "o": "LIMIT",                  // Order type
        //         "f": "GTC",                    // Time in force
        //         "q": "1.00000000",             // Order quantity
        //         "p": "0.10264410",             // Order price
        //         "P": "0.00000000",             // Stop price
        //         "F": "0.00000000",             // Iceberg quantity
        //         "g": -1,                       // OrderListId
        //         "C": null,                     // Original client order ID; This is the ID of the order being canceled
        //         "x": "NEW",                    // Current execution type
        //         "X": "NEW",                    // Current order status
        //         "r": "NONE",                   // Order reject reason; will be an error code.
        //         "i": 4293153,                  // Order ID
        //         "l": "0.00000000",             // Last executed quantity
        //         "z": "0.00000000",             // Cumulative filled quantity
        //         "L": "0.00000000",             // Last executed price
        //         "n": "0",                      // Commission amount
        //         "N": null,                     // Commission asset
        //         "T": 1499405658657,            // Transaction time
        //         "t": -1,                       // Trade ID
        //         "I": 8641984,                  // Ignore
        //         "w": true,                     // Is the order on the book?
        //         "m": false,                    // Is this trade the maker side?
        //         "M": false,                    // Ignore
        //         "O": 1499405658657,            // Order creation time
        //         "Z": "0.00000000",             // Cumulative quote asset transacted quantity
        //         "Y": "0.00000000"              // Last quote asset transacted quantity (i.e. lastPrice * lastQty),
        //         "Q": "0.00000000"              // Quote Order Qty
        //     }
        //
        // future
        //
        //     {
        //         "e":"ORDER_TRADE_UPDATE",           // Event Type
        //         "E":1568879465651,                  // Event Time
        //         "T":1568879465650,                  // Trasaction Time
        //         "o": {
        //             "s":"BTCUSDT",                  // Symbol
        //             "c":"TEST",                     // Client Order Id
        //                                             // special client order id:
        //                                             // starts with "autoclose-": liquidation order
        //                                             // "adl_autoclose": ADL auto close order
        //             "S":"SELL",                     // Side
        //             "o":"TRAILING_STOP_MARKET",     // Order Type
        //             "f":"GTC",                      // Time in Force
        //             "q":"0.001",                    // Original Quantity
        //             "p":"0",                        // Original Price
        //             "ap":"0",                       // Average Price
        //             "sp":"7103.04",                 // Stop Price. Please ignore with TRAILING_STOP_MARKET order
        //             "x":"NEW",                      // Execution Type
        //             "X":"NEW",                      // Order Status
        //             "i":8886774,                    // Order Id
        //             "l":"0",                        // Order Last Filled Quantity
        //             "z":"0",                        // Order Filled Accumulated Quantity
        //             "L":"0",                        // Last Filled Price
        //             "N":"USDT",                     // Commission Asset, will not push if no commission
        //             "n":"0",                        // Commission, will not push if no commission
        //             "T":1568879465651,              // Order Trade Time
        //             "t":0,                          // Trade Id
        //             "b":"0",                        // Bids Notional
        //             "a":"9.91",                     // Ask Notional
        //             "m":false,                      // Is this trade the maker side?
        //             "R":false,                      // Is this reduce only
        //             "wt":"CONTRACT_PRICE",          // Stop Price Working Type
        //             "ot":"TRAILING_STOP_MARKET",    // Original Order Type
        //             "ps":"LONG",                    // Position Side
        //             "cp":false,                     // If Close-All, pushed with conditional order
        //             "AP":"7476.89",                 // Activation Price, only puhed with TRAILING_STOP_MARKET order
        //             "cr":"5.0",                     // Callback Rate, only puhed with TRAILING_STOP_MARKET order
        //             "rp":"0"                        // Realized Profit of the trade
        //         }
        //     }
        //
        // linear swap conditional
        //
        //     {
        //         "e":"ALGO_UPDATE",  // Event Type
        //         "T":1750515742297,  // Event Time
        //         "E":1750515742303,  // Transaction Time
        //         "o":{
        //             "caid":"Q5xaq5EGKgXXa0fD7fs0Ip",     // Client Algo Id
        //             "aid":2148719,                       // Algo Id
        //             "at":"CONDITIONAL",                  // Algo Type
        //             "o":"TAKE_PROFIT",                   // Order Type
        //             "s":"BNBUSDT",                       // Symbol
        //             "S":"SELL",                          // Side
        //             "ps":"BOTH",                         // Position Side
        //             "f":"GTC",                           // Time in force
        //             "q":"0.01",                          // quantity
        //             "X":"CANCELED",                      // Algo status
        //             "ai":"",                             // order id
        //             "ap": "0.00000",                     // avg fill price in matching engine, only display when order is triggered and placed in matching engine
        //             "aq": "0.00000",                     // execuated quantity in matching engine, only display when order is triggered and placed in matching engine
        //             "act": "0",                          // actual order type in matching engine, only display when order is triggered and placed in matching engine
        //             "tp":"750",                          // Trigger price
        //             "p":"750",                           // Order Price
        //             "V":"EXPIRE_MAKER",                  // STP mode
        //             "wt":"CONTRACT_PRICE",               // Working type
        //             "pm":"NONE",                         // Price match mode
        //             "cp":false,                          // If Close-All
        //             "pP":false,                          // If price protection is turned on
        //             "R":false,                           // Is this reduce only
        //             "tt":0,                              // Trigger time
        //             "gtd":0,                             // good till time for GTD time in force
        //             "rm": "Reduce Only reject"           // algo order failed reason
        //         }
        //     }
        //
        const e = this.safeString(message, 'e');
        if (e === 'orderReport') {
            this.handleOrder(client, message);
            return;
        }
        if ((e === 'ORDER_TRADE_UPDATE') || (e === 'ALGO_UPDATE')) {
            const oField = this.safeValue(message, 'o');
            if (Array.isArray(oField)) {
                // eOptions format: o is an array of orders with nested fi fills
                this.handleOptionsOrderUpdate(client, message);
                return;
            }
            message = this.safeDict(message, 'o', message);
        }
        this.handleMyTrade(client, message);
        this.handleOrder(client, message);
        this.handleMyLiquidation(client, message);
    }
    handleStockPrice(client, message) {
        //
        //     {
        //         "rates": [
        //             {
        //                 "s": "JAVA",
        //                 "ac": "EQ_JAVA",
        //                 "p": "83.26",
        //                 "t": 1785959875000,
        //                 "pc": "83.1800",
        //                 "mp": "ON"
        //             },
        //         ],
        //         "e": "price"
        //     }
        //
        const rates = this.safeList(message, 'rates', []);
        const tickers = {};
        for (let i = 0; i < rates.length; i++) {
            const rate = this.safeDict(rates, i, {});
            const stockSymbol = this.safeString(rate, 's');
            const symbol = this.getStockUnifiedSymbol(stockSymbol, 'USDC');
            if (symbol === undefined) {
                continue;
            }
            const timestamp = this.safeInteger(rate, 't');
            const parsed = this.safeTicker({
                'symbol': symbol,
                'timestamp': timestamp,
                'datetime': this.iso8601(timestamp),
                'last': this.safeString(rate, 'p'),
                'close': this.safeString(rate, 'p'),
                'previousClose': this.safeString(rate, 'pc'),
                'info': rate,
            });
            this.tickers[symbol] = parsed;
            tickers[symbol] = parsed;
            client.resolve(parsed, 'stock:price:' + symbol);
        }
        client.resolve(tickers, 'stock:price');
    }
    handleStockQuote(client, message) {
        const stockSymbol = this.safeString(message, 's');
        const symbol = this.getStockUnifiedSymbol(stockSymbol, 'USDC');
        if (symbol === undefined) {
            return;
        }
        const timestamp = this.safeInteger2(message, 'E', 'T');
        const parsed = this.safeTicker({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'bid': this.safeString(message, 'bp'),
            'ask': this.safeString(message, 'ap'),
            'bidVolume': this.safeString(message, 'bs'),
            'askVolume': this.safeString(message, 'as'),
            'info': message,
        });
        this.bidsasks[symbol] = parsed;
        client.resolve(parsed, 'stock:quote:' + symbol);
    }
    handleOptionsOrderUpdate(client, message) {
        //
        // eOptions ORDER_TRADE_UPDATE: "o" is an array of orders (not a dict like futures)
        //
        //     {
        //         "e": "ORDER_TRADE_UPDATE",
        //         "E": 1657613775883,
        //         "o": [
        //             {
        //                 "T": 1657613342918,          // order create time
        //                 "t": 1657613342918,          // order last update time
        //                 "s": "BTC-220930-18000-C",   // symbol
        //                 "c": "",                     // client order ID
        //                 "oid": "4611869636869226548", // order ID
        //                 "p": "1993",                 // price
        //                 "q": "1",                    // signed qty (positive = BUY, negative = SELL)
        //                 "S": "PARTIALLY_FILLED",     // status
        //                 "e": "0.1",                  // cumulative filled qty
        //                 "ec": "199.3",               // cumulative filled amount (USDT)
        //                 "f": "2",                    // cumulative fee
        //                 "tif": "GTC",                // time in force
        //                 "oty": "LIMIT",              // order type
        //                 "fi": [
        //                     {
        //                         "t": "20",           // trade ID
        //                         "p": "1993",         // fill price
        //                         "q": "0.1",          // fill qty
        //                         "T": 1657613774336,  // fill time
        //                         "m": "TAKER",        // "TAKER" or "MAKER"
        //                         "f": "0.0002"        // commission (positive) or rebate (negative)
        //                     }
        //                 ]
        //             }
        //         ]
        //     }
        //
        const orders = this.safeList(message, 'o', []);
        for (let i = 0; i < orders.length; i++) {
            const order = orders[i];
            const fills = this.safeList(order, 'fi', []);
            const rawQty = this.safeString(order, 'q', '0');
            let side = 'BUY';
            if (Precise["default"].stringLt(rawQty, '0')) {
                side = 'SELL';
            }
            const absQty = Precise["default"].stringAbs(rawQty);
            let executionType = 'NEW';
            if (fills.length > 0) {
                executionType = 'TRADE';
            }
            // normalize eOptions fields to the flat format parseWsOrder/handleOrder expect
            const normalizedOrder = {
                's': this.safeString(order, 's'),
                'i': this.safeString(order, 'oid'),
                'c': this.safeString(order, 'c'),
                'S': side,
                'o': this.safeString(order, 'oty'),
                'f': this.safeString(order, 'tif'),
                'q': absQty,
                'p': this.safeString(order, 'p'),
                'X': this.safeString(order, 'S'),
                'x': executionType,
                'z': this.safeString(order, 'e'),
                'Z': this.safeString(order, 'ec'),
                'n': this.safeString(order, 'f'),
                'T': this.safeInteger(order, 't'),
                'O': this.safeInteger(order, 'T'),
            };
            this.handleOrder(client, normalizedOrder);
            for (let j = 0; j < fills.length; j++) {
                const fill = fills[j];
                const isMaker = (this.safeString(fill, 'm') === 'MAKER');
                // normalize fill fields to the flat format parseWsTrade/handleMyTrade expect
                const normalizedTrade = {
                    'x': 'TRADE',
                    's': this.safeString(order, 's'),
                    't': this.safeString(fill, 't'),
                    'L': this.safeString(fill, 'p'),
                    'l': this.safeString(fill, 'q'),
                    'T': this.safeInteger(fill, 'T'),
                    'm': isMaker,
                    'n': this.safeString(fill, 'f'),
                    'i': this.safeString(order, 'oid'),
                    'S': side,
                    'o': this.safeString(order, 'oty'),
                };
                this.handleMyTrade(client, normalizedTrade);
            }
        }
    }
    /**
     * @method
     * @name binance#watchPositions
     * @description watch all open positions
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param {number} [since] since timestamp
     * @param {number} [limit] limit
     * @param {object} params extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.portfolioMargin] set to true if you would like to watch positions in a portfolio margin account
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/en/latest/manual.html#position-structure}
     */
    async watchPositions(symbols = undefined, since = undefined, limit = undefined, params = {}) {
        if (this.markets === undefined) {
            await this.loadMarkets();
        }
        let market = undefined;
        let messageHash = '';
        symbols = this.marketSymbols(symbols);
        if (!this.isEmpty(symbols)) {
            market = this.getMarketFromSymbols(symbols);
            if (symbols === undefined) {
                throw new errors.ArgumentsRequired(this.id + ' watchPositions() symbols is required');
            }
            messageHash = '::' + symbols.join(',');
        }
        let type = undefined;
        let subType = undefined;
        [type, subType, params] = this.resolveAuthType('watchPositions', market, params);
        // spot and margin have no positions - whatever still RESOLVES to spot
        // or margin after the helper falls through to the derivatives stream
        // matching the subType. requests a defaultSubType already rewrote
        // arrive here as future or delivery and pass untouched, which lands on
        // the same stream the old raw-type ordering produced in every case
        if (type === 'spot' || type === 'margin') {
            type = (subType === 'inverse') ? 'delivery' : 'future';
        }
        // 'option' stays as 'option', don't redirect to 'future' - the helper's
        // guard finally makes this comment true
        const marketTypeObject = {};
        marketTypeObject['type'] = type;
        marketTypeObject['subType'] = subType;
        await this.authenticate(this.extend(marketTypeObject, params));
        messageHash = type + ':positions' + messageHash;
        let isPortfolioMargin = undefined;
        [isPortfolioMargin, params] = this.handleOptionAndParams2(params, 'watchPositions', 'papi', 'portfolioMargin', false);
        let urlType = type;
        if (isPortfolioMargin) {
            urlType = 'papi';
        }
        else if (type === 'option') {
            const demoMode = this.safeBool(this.options, 'enableDemoTrading', false);
            if ((demoMode === true) || this.isSandboxModeEnabled) {
                throw new errors.NotSupported(this.id + ' watchPositions() does not support option markets in demo/testnet mode');
            }
            urlType = 'optionPrivate';
        }
        const url = this.getPrivateWsUrl(urlType, this.options[type]['listenKey']);
        const client = this.client(url);
        this.setBalanceCache(client, type, isPortfolioMargin);
        this.setPositionsCache(client, type, symbols, isPortfolioMargin);
        const fetchPositionsSnapshot = this.handleOption('watchPositions', 'fetchPositionsSnapshot', true);
        const awaitPositionsSnapshot = this.handleOption('watchPositions', 'awaitPositionsSnapshot', true);
        const cache = this.safeValue(this.positions, type);
        if ((fetchPositionsSnapshot === true) && (awaitPositionsSnapshot === true) && (cache === undefined)) {
            const snapshot = await client.future(type + ':fetchPositionsSnapshot');
            return this.filterBySymbolsSinceLimit(snapshot, symbols, since, limit, true);
        }
        const newPositions = await this.watch(url, messageHash, undefined, type);
        if (this.newUpdates) {
            return newPositions;
        }
        return this.filterBySymbolsSinceLimit(cache, symbols, since, limit, true);
    }
    setPositionsCache(client, type, symbols = undefined, isPortfolioMargin = false) {
        if (type === 'spot') {
            return;
        }
        if (this.positions === undefined) {
            this.positions = {};
        }
        if (type in this.positions) {
            return;
        }
        const fetchPositionsSnapshot = this.handleOption('watchPositions', 'fetchPositionsSnapshot', false);
        if (fetchPositionsSnapshot === true) {
            const messageHash = type + ':fetchPositionsSnapshot';
            if (!(messageHash in client.futures)) {
                client.future(messageHash);
                this.spawn(this.loadPositionsSnapshot, client, messageHash, type, isPortfolioMargin);
            }
        }
        else {
            this.positions[type] = new Cache.ArrayCacheBySymbolBySide();
        }
    }
    async loadPositionsSnapshot(client, messageHash, type, isPortfolioMargin) {
        const params = {
            'type': type,
        };
        if (isPortfolioMargin === true) {
            params['portfolioMargin'] = true;
        }
        const positions = await this.fetchPositions(undefined, params);
        this.positions[type] = new Cache.ArrayCacheBySymbolBySide();
        const cache = this.positions[type];
        for (let i = 0; i < positions.length; i++) {
            const position = positions[i];
            const contracts = this.safeNumber(position, 'contracts', 0);
            if ((contracts !== undefined) && (contracts > 0)) {
                cache.append(position);
            }
        }
        // don't remove the future from the .futures cache
        if (messageHash in client.futures) {
            const future = client.futures[messageHash];
            future.resolve(cache);
            client.resolve(cache, type + ':position');
        }
    }
    handlePositions(client, message) {
        //
        //     {
        //         e: 'ACCOUNT_UPDATE',
        //         T: 1667881353112,
        //         E: 1667881353115,
        //         a: {
        //             B: [{
        //                 a: 'USDT',
        //                 wb: '1127.95750089',
        //                 cw: '1040.82091149',
        //                 bc: '0'
        //             }],
        //             P: [{
        //                 s: 'BTCUSDT',
        //                 pa: '-0.089',
        //                 ep: '19700.03933',
        //                 cr: '-1260.24809979',
        //                 up: '1.53058860',
        //                 mt: 'isolated',
        //                 iw: '87.13658940',
        //                 ps: 'BOTH',
        //                 ma: 'USDT'
        //             }],
        //             m: 'ORDER'
        //         }
        //     }
        //
        // each account is connected to a different endpoint
        // and has exactly one subscriptionhash which is the account type
        const subscriptions = client.subscriptions;
        const subscriptionsKeys = Object.keys(subscriptions);
        const accountType = this.getAccountTypeFromSubscriptions(subscriptionsKeys);
        if (this.positions === undefined) {
            this.positions = {};
        }
        if (!(accountType in this.positions)) {
            this.positions[accountType] = new Cache.ArrayCacheBySymbolBySide();
        }
        const cache = this.positions[accountType];
        const data = this.safeDict(message, 'a', {});
        const rawPositions = this.safeList(data, 'P', []);
        const newPositions = [];
        for (let i = 0; i < rawPositions.length; i++) {
            const rawPosition = rawPositions[i];
            const position = this.parseWsPosition(rawPosition);
            const timestamp = this.safeInteger(message, 'E');
            position['timestamp'] = timestamp;
            position['datetime'] = this.iso8601(timestamp);
            newPositions.push(position);
            cache.append(position);
        }
        const messageHashes = this.findMessageHashes(client, accountType + ':positions::');
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
        client.resolve(newPositions, accountType + ':positions');
    }
    parseWsPosition(position, market = undefined) {
        //
        //     {
        //         "s": "BTCUSDT", // Symbol
        //         "pa": "0", // Position Amount
        //         "ep": "0.00000", // Entry Price
        //         "cr": "200", // (Pre-fee) Accumulated Realized
        //         "up": "0", // Unrealized PnL
        //         "mt": "isolated", // Margin Type
        //         "iw": "0.00000000", // Isolated Wallet (if isolated position)
        //         "ps": "BOTH" // Position Side
        //     }
        //
        const marketId = this.safeString(position, 's');
        const contracts = this.safeString(position, 'pa');
        const contractsAbs = Precise["default"].stringAbs(this.safeString(position, 'pa'));
        let positionSide = this.safeStringLower(position, 'ps');
        let hedged = true;
        if (positionSide === 'both') {
            hedged = false;
            if (!Precise["default"].stringEq(contracts, '0')) {
                if (Precise["default"].stringLt(contracts, '0')) {
                    positionSide = 'short';
                }
                else {
                    positionSide = 'long';
                }
            }
        }
        return this.safePosition({
            'info': position,
            'id': undefined,
            'symbol': this.safeSymbol(marketId, undefined, undefined, 'swap'),
            'notional': undefined,
            'marginMode': this.safeString(position, 'mt'),
            'liquidationPrice': undefined,
            'entryPrice': this.safeNumber(position, 'ep'),
            'unrealizedPnl': this.safeNumber(position, 'up'),
            'percentage': undefined,
            'contracts': this.parseNumber(contractsAbs),
            'contractSize': undefined,
            'markPrice': undefined,
            'side': positionSide,
            'hedged': hedged,
            'timestamp': undefined,
            'datetime': undefined,
            'maintenanceMargin': undefined,
            'maintenanceMarginPercentage': undefined,
            'collateral': undefined,
            'initialMargin': undefined,
            'initialMarginPercentage': undefined,
            'leverage': undefined,
            'marginRatio': undefined,
        });
    }
    parseWsOptionsPosition(position, market = undefined) {
        //
        //  from BALANCE_POSITION_UPDATE event P[] array:
        //  {
        //      "s": "BTC-251123-126000-C",  // option symbol
        //      "c": "-0.1000",              // position quantity (negative = short)
        //      "p": "-120.00000000",        // position value (USDT)
        //      "a": "1200.00000000"         // average entry price
        //  }
        //
        const marketId = this.safeString(position, 's');
        const contracts = this.safeString(position, 'c');
        const contractsAbs = Precise["default"].stringAbs(contracts);
        let side = undefined;
        if (contracts !== undefined) {
            if (Precise["default"].stringLt(contracts, '0')) {
                side = 'short';
            }
            else if (Precise["default"].stringGt(contracts, '0')) {
                side = 'long';
            }
        }
        return this.safePosition({
            'info': position,
            'id': undefined,
            'symbol': this.safeSymbol(marketId, market, undefined, 'option'),
            'notional': this.safeString(position, 'p'),
            'marginMode': undefined,
            'liquidationPrice': undefined,
            'entryPrice': this.safeNumber(position, 'a'),
            'unrealizedPnl': undefined,
            'percentage': undefined,
            'contracts': this.parseNumber(contractsAbs),
            'contractSize': undefined,
            'markPrice': undefined,
            'side': side,
            'hedged': false,
            'timestamp': undefined,
            'datetime': undefined,
            'maintenanceMargin': undefined,
            'maintenanceMarginPercentage': undefined,
            'collateral': undefined,
            'initialMargin': undefined,
            'initialMarginPercentage': undefined,
            'leverage': undefined,
            'marginRatio': undefined,
        });
    }
    /**
     * @method
     * @name binance#fetchMyTradesWs
     * @description fetch all trades made by the user
     * @see https://developers.binance.com/docs/binance-spot-api-docs/websocket-api/account-requests#account-trade-history-user_data
     * @param {string} symbol unified market symbol
     * @param {int|undefined} [since] the earliest time in ms to fetch trades for
     * @param {int|undefined} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.endTime] the latest time in ms to fetch trades for
     * @param {int} [params.fromId] first trade Id to fetch
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    async fetchMyTradesWs(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (this.markets === undefined) {
            await this.loadMarkets();
        }
        if (symbol === undefined) {
            throw new errors.BadRequest(this.id + ' fetchMyTradesWs requires a symbol');
        }
        const market = this.market(symbol);
        const type = this.getMarketType('fetchMyTradesWs', market, params);
        if (type !== 'spot' && type !== 'future') {
            throw new errors.BadRequest(this.id + ' fetchMyTradesWs does not support ' + type + ' markets');
        }
        const url = this.urls['api']['ws']['ws-api'][type];
        const requestId = this.requestId(url);
        const messageHash = requestId.toString();
        let returnRateLimits = false;
        [returnRateLimits, params] = this.handleOptionAndParams(params, 'fetchMyTradesWs', 'returnRateLimits', false);
        const payload = {
            'symbol': this.marketId(symbol),
            'returnRateLimits': returnRateLimits,
        };
        if (since !== undefined) {
            payload['startTime'] = since;
        }
        if (limit !== undefined) {
            payload['limit'] = limit;
        }
        const fromId = this.safeInteger(params, 'fromId');
        if (fromId !== undefined && since !== undefined) {
            throw new errors.BadRequest(this.id + ' fetchMyTradesWs does not support fetching by both fromId and since parameters at the same time');
        }
        const message = {
            'id': messageHash,
            'method': 'myTrades',
            'params': this.signParams(this.extend(payload, params)),
        };
        const subscription = {
            'method': this.handleTradesWs,
        };
        const trades = await this.watch(url, messageHash, message, messageHash, subscription);
        return this.filterBySymbolSinceLimit(trades, symbol, since, limit);
    }
    /**
     * @method
     * @name binance#fetchTradesWs
     * @description fetch all trades made by the user
     * @see https://developers.binance.com/docs/binance-spot-api-docs/websocket-api/market-data-requests#recent-trades
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve, default=500, max=1000
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     *
     * EXCHANGE SPECIFIC PARAMETERS
     * @param {int} [params.fromId] trade ID to begin at
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    async fetchTradesWs(symbol, since = undefined, limit = undefined, params = {}) {
        if (this.markets === undefined) {
            await this.loadMarkets();
        }
        const market = this.market(symbol);
        const type = this.getMarketType('fetchTradesWs', market, params);
        if (type !== 'spot' && type !== 'future') {
            throw new errors.BadRequest(this.id + ' fetchTradesWs does not support ' + type + ' markets');
        }
        const url = this.urls['api']['ws']['ws-api'][type];
        const requestId = this.requestId(url);
        const messageHash = requestId.toString();
        let returnRateLimits = false;
        [returnRateLimits, params] = this.handleOptionAndParams(params, 'fetchTradesWs', 'returnRateLimits', false);
        const payload = {
            'symbol': this.marketId(symbol),
            'returnRateLimits': returnRateLimits,
        };
        if (limit !== undefined) {
            payload['limit'] = limit;
        }
        const message = {
            'id': messageHash,
            'method': 'trades.historical',
            'params': this.extend(payload, params),
        };
        const subscription = {
            'method': this.handleTradesWs,
        };
        const trades = await this.watch(url, messageHash, message, messageHash, subscription);
        return this.filterBySinceLimit(trades, since, limit);
    }
    handleTradesWs(client, message) {
        //
        // fetchMyTradesWs
        //
        //    {
        //        "id": "f4ce6a53-a29d-4f70-823b-4ab59391d6e8",
        //        "status": 200,
        //        "result": [
        //            {
        //                "symbol": "BTCUSDT",
        //                "id": 1650422481,
        //                "orderId": 12569099453,
        //                "orderListId": -1,
        //                "price": "23416.10000000",
        //                "qty": "0.00635000",
        //                "quoteQty": "148.69223500",
        //                "commission": "0.00000000",
        //                "commissionAsset": "BNB",
        //                "time": 1660801715793,
        //                "isBuyer": false,
        //                "isMaker": true,
        //                "isBestMatch": true
        //            },
        //            ...
        //        ],
        //    }
        //
        // fetchTradesWs
        //
        //    {
        //        "id": "f4ce6a53-a29d-4f70-823b-4ab59391d6e8",
        //        "status": 200,
        //        "result": [
        //            {
        //                "id": 0,
        //                "price": "0.00005000",
        //                "qty": "40.00000000",
        //                "quoteQty": "0.00200000",
        //                "time": 1500004800376,
        //                "isBuyerMaker": true,
        //                "isBestMatch": true
        //            }
        //            ...
        //        ],
        //    }
        //
        const messageHash = this.safeString(message, 'id');
        const result = this.safeList(message, 'result', []);
        const trades = this.parseTrades(result);
        client.resolve(trades, messageHash);
    }
    /**
     * @method
     * @name binance#watchMyTrades
     * @description watches information on multiple trades made by the user
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.portfolioMargin] set to true if you would like to watch trades in a portfolio margin account
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    async watchMyTrades(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (this.markets === undefined) {
            await this.loadMarkets();
        }
        let type = undefined;
        let market = undefined;
        if (symbol !== undefined) {
            const marketResolved = this.market(symbol);
            market = marketResolved;
            symbol = market['symbol'];
        }
        let subType = undefined;
        [type, subType, params] = this.resolveAuthType('watchMyTrades', market, params);
        let messageHash = 'myTrades';
        if ((symbol !== undefined) && (market !== undefined)) {
            symbol = this.symbol(symbol);
            messageHash += ':' + symbol;
            params = this.extend(params, { 'type': market['type'], 'symbol': symbol });
        }
        await this.authenticate(this.extend({ 'type': type, 'subType': subType }, params));
        let urlType = type; // we don't change type because the listening key is different
        if (type === 'margin') {
            urlType = 'spot'; // spot-margin shares the same stream as regular spot
        }
        let isPortfolioMargin = undefined;
        [isPortfolioMargin, params] = this.handleOptionAndParams2(params, 'watchMyTrades', 'papi', 'portfolioMargin', false);
        let url = '';
        if (type === 'spot' || type === 'margin') {
            url = this.urls['api']['ws']['ws-api']['spot'];
        }
        else {
            if (isPortfolioMargin) {
                urlType = 'papi';
            }
            else if (type === 'option') {
                const demoMode = this.safeBool(this.options, 'enableDemoTrading', false);
                if ((demoMode === true) || this.isSandboxModeEnabled) {
                    throw new errors.NotSupported(this.id + ' watchMyTrades() does not support option markets in demo/testnet mode');
                }
                urlType = 'optionPrivate';
            }
            url = this.getPrivateWsUrl(urlType, this.options[type]['listenKey']);
        }
        const client = this.client(url);
        this.setBalanceCache(client, type, isPortfolioMargin);
        this.setPositionsCache(client, type, undefined, isPortfolioMargin);
        const message = undefined;
        const trades = await this.watch(url, messageHash, message, type);
        if (this.newUpdates) {
            limit = trades.getLimit(symbol, limit);
        }
        return this.filterBySymbolSinceLimit(trades, symbol, since, limit, true);
    }
    handleMyTrade(client, message) {
        const messageHash = 'myTrades';
        const executionType = this.safeString(message, 'x');
        if (executionType === 'TRADE') {
            const trade = this.parseWsTrade(message);
            const orderId = this.safeString(trade, 'order');
            let tradeFee = this.safeDict(trade, 'fee', {});
            tradeFee = this.extend({}, tradeFee);
            const symbol = this.safeString(trade, 'symbol');
            if (orderId !== undefined && tradeFee !== undefined && symbol !== undefined) {
                const cachedOrders = this.orders;
                if (cachedOrders !== undefined) {
                    const orders = this.safeValue(cachedOrders.hashmap, symbol, {});
                    const order = this.safeValue(orders, orderId);
                    if (order !== undefined) {
                        // accumulate order fees
                        const fees = this.safeValue(order, 'fees');
                        const fee = this.safeValue(order, 'fee');
                        if (!this.isEmpty(fees)) {
                            let insertNewFeeCurrency = true;
                            for (let i = 0; i < fees.length; i++) {
                                const orderFee = fees[i];
                                if (orderFee['currency'] === tradeFee['currency']) {
                                    const feeCost = this.sum(tradeFee['cost'], orderFee['cost']);
                                    let feeCostString = this.currencyToPrecision(tradeFee['currency'], feeCost);
                                    if (feeCostString === undefined) {
                                        feeCostString = '0';
                                    }
                                    order['fees'][i]['cost'] = parseFloat(feeCostString);
                                    insertNewFeeCurrency = false;
                                    break;
                                }
                            }
                            if (insertNewFeeCurrency) {
                                order['fees'].push(tradeFee);
                            }
                        }
                        else if (fee !== undefined) {
                            if (fee['currency'] === tradeFee['currency']) {
                                const feeCost = this.sum(fee['cost'], tradeFee['cost']);
                                let feeCostString = this.currencyToPrecision(tradeFee['currency'], feeCost);
                                if (feeCostString === undefined) {
                                    feeCostString = '0';
                                }
                                order['fee']['cost'] = parseFloat(feeCostString);
                            }
                            else if (fee['currency'] === undefined) {
                                order['fee'] = tradeFee;
                            }
                            else {
                                order['fees'] = [fee, tradeFee];
                                order['fee'] = undefined;
                            }
                        }
                        else {
                            order['fee'] = tradeFee;
                        }
                        // save this trade in the order
                        const orderTrades = this.safeList(order, 'trades', []);
                        orderTrades.push(trade);
                        order['trades'] = orderTrades;
                        // write the updated order back into the cache: php
                        // arrays are value types, so the fee/trades mutations
                        // above only touched a local copy there — the cache
                        // hashmap rows are wired by reference, so this
                        // assignment reaches the cached row (and is a no-op
                        // in the reference-semantics runtimes)
                        orders[orderId] = order;
                        // don't append twice cause it breaks newUpdates mode
                        // this order already exists in the cache
                    }
                }
            }
            if (this.myTrades === undefined) {
                const limit = this.safeInteger(this.options, 'tradesLimit', 1000);
                this.myTrades = new Cache.ArrayCacheBySymbolById(limit);
            }
            const myTrades = this.myTrades;
            myTrades.append(trade);
            client.resolve(this.myTrades, messageHash);
            const messageHashSymbol = messageHash + ':' + symbol;
            client.resolve(this.myTrades, messageHashSymbol);
        }
    }
    handleOrder(client, message) {
        const parsed = this.parseWsOrder(message);
        const symbol = this.safeString(parsed, 'symbol');
        const orderId = this.safeString(parsed, 'id');
        if (symbol !== undefined) {
            if (this.orders === undefined) {
                const limit = this.safeInteger(this.options, 'ordersLimit', 1000);
                this.orders = new Cache.ArrayCacheBySymbolById(limit);
            }
            const cachedOrders = this.orders;
            const orders = this.safeValue(cachedOrders.hashmap, symbol, {});
            const order = this.safeValue(orders, orderId);
            if (order !== undefined) {
                const fee = this.safeValue(order, 'fee');
                if (fee !== undefined) {
                    parsed['fee'] = fee;
                }
                const fees = this.safeValue(order, 'fees');
                if (fees !== undefined) {
                    parsed['fees'] = fees;
                }
                parsed['trades'] = this.safeValue(order, 'trades');
                const timestamp = this.safeInteger(parsed, 'timestamp');
                if (timestamp === undefined) {
                    parsed['timestamp'] = this.safeInteger(order, 'timestamp');
                    parsed['datetime'] = this.safeString(order, 'datetime');
                }
            }
            cachedOrders.append(parsed);
            const messageHash = 'orders';
            const symbolSpecificMessageHash = 'orders:' + symbol;
            client.resolve(cachedOrders, messageHash);
            client.resolve(cachedOrders, symbolSpecificMessageHash);
        }
    }
    handleAcountUpdate(client, message) {
        this.handleBalance(client, message);
        this.handlePositions(client, message);
    }
    handleOptionsAccountUpdate(client, message) {
        //
        // BALANCE_POSITION_UPDATE (options user data stream)
        //
        //  {
        //      "e": "BALANCE_POSITION_UPDATE",
        //      "E": 1762917544216,   // event time
        //      "T": 1762917544206,   // transaction time
        //      "m": "ORDER",         // reason
        //      "B": [
        //          { "a": "USDT", "b": "10000471.37940900", "bc": "0" }
        //      ],
        //      "P": [
        //          {
        //              "s": "BTC-251123-126000-C",
        //              "c": "-0.1000",
        //              "p": "-120.00000000",
        //              "a": "1200.00000000"
        //          }
        //      ]
        //  }
        //
        // --- balance ---
        const accountType = 'option';
        if (this.balance[accountType] === undefined) {
            this.balance[accountType] = {};
        }
        this.balance[accountType]['info'] = message;
        const B = this.safeList(message, 'B', []);
        for (let i = 0; i < B.length; i++) {
            const entry = B[i];
            const currencyId = this.safeString(entry, 'a');
            const code = this.safeCurrencyCode(currencyId);
            if (code !== undefined) {
                const account = this.account();
                account['total'] = this.safeString(entry, 'b');
                this.balance[accountType][code] = account;
            }
        }
        const timestamp = this.safeInteger(message, 'E');
        this.balance[accountType]['timestamp'] = timestamp;
        this.balance[accountType]['datetime'] = this.iso8601(timestamp);
        this.balance[accountType] = this.safeBalance(this.balance[accountType]);
        client.resolve(this.balance[accountType], accountType + ':balance');
        // --- positions ---
        if (this.positions === undefined) {
            this.positions = {};
        }
        if (!(accountType in this.positions)) {
            this.positions[accountType] = new Cache.ArrayCacheBySymbolBySide();
        }
        const cache = this.positions[accountType];
        const P = this.safeList(message, 'P', []);
        const newPositions = [];
        for (let i = 0; i < P.length; i++) {
            const rawPosition = P[i];
            const position = this.parseWsOptionsPosition(rawPosition);
            position['timestamp'] = timestamp;
            position['datetime'] = this.iso8601(timestamp);
            newPositions.push(position);
            cache.append(position);
        }
        const messageHashes = this.findMessageHashes(client, accountType + ':positions::');
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
        client.resolve(newPositions, accountType + ':positions');
    }
    handleWsError(client, message) {
        //
        //    {
        //        "error": {
        //            "code": 2,
        //            "msg": "Invalid request: invalid stream"
        //        },
        //        "id": 1
        //    }
        //
        const id = this.safeString(message, 'id');
        let rejected = false;
        const error = this.safeDict(message, 'error', {});
        const code = this.safeInteger(error, 'code');
        const msg = this.safeString(error, 'msg');
        const codeValue = (code === undefined) ? 0 : code;
        try {
            this.handleErrors(codeValue, msg, client.url, '', {}, this.json(error), error, {}, {});
        }
        catch (e) {
            rejected = true;
            // private endpoint uses id as messageHash
            client.reject(e, id);
            // public endpoint stores messageHash in subscriptions
            const subscriptionKeys = Object.keys(client.subscriptions);
            for (let i = 0; i < subscriptionKeys.length; i++) {
                const subscriptionHash = subscriptionKeys[i];
                const subscriptionId = this.safeString(client.subscriptions[subscriptionHash], 'id');
                const subscription = this.safeString(client.subscriptions[subscriptionHash], 'subscription');
                if (id === subscriptionId) {
                    client.reject(e, subscriptionHash);
                    if (subscription !== undefined) {
                        delete client.subscriptions[subscription];
                    }
                }
            }
        }
        if (!rejected) {
            client.reject(message, id);
        }
        // reset connection if 5xx error
        const codeString = this.safeString(error, 'code');
        if ((codeString !== undefined) && (codeString[0] === '5')) {
            client.reset(message);
        }
    }
    handleEventStreamTerminated(client, message) {
        //
        //    {
        //        e: 'eventStreamTerminated',
        //        E: 1757896885229
        //    }
        //
        const event = this.safeString(message, 'e');
        const subscriptions = client.subscriptions;
        const subscriptionsKeys = Object.keys(subscriptions);
        const accountType = this.getAccountTypeFromSubscriptions(subscriptionsKeys);
        if (event === 'eventStreamTerminated') {
            delete client.subscriptions[accountType];
            client.reject(message, accountType);
        }
    }
    handleMessage(client, message) {
        // eOptions combined stream endpoints (/public/stream, /market/stream) wrap events as:
        //   { "stream": "<streamName>", "data": { "e": "...", ... } }
        const streamWrapper = this.safeString(message, 'stream');
        if (streamWrapper !== undefined) {
            message = this.safeDict(message, 'data', message);
        }
        // handle WebSocketAPI
        const eventMsg = this.safeDict(message, 'event');
        if (eventMsg !== undefined) {
            message = eventMsg;
        }
        // handle combined stream wrapper payloads
        const eventData = this.safeDict(message, 'data');
        if (eventData !== undefined) {
            message = eventData;
        }
        const status = this.safeString(message, 'status');
        const error = this.safeValue(message, 'error');
        if ((error !== undefined) || (status !== undefined && status !== '200')) {
            this.handleWsError(client, message);
            return;
        }
        // user subscription wraps message in subscriptionId and event
        const id = this.safeString(message, 'id');
        const subscriptions = this.safeValue(client.subscriptions, id);
        let method = this.safeValue(subscriptions, 'method');
        if (method !== undefined) {
            method.call(this, client, message);
            return;
        }
        // handle other APIs
        const methods = {
            'depthUpdate': this.handleOrderBook,
            'trade': this.handleTrade,
            'aggTrade': this.handleTrade,
            'price': this.handleStockPrice,
            'quote': this.handleStockQuote,
            'optionTrade': this.handleTrade,
            'markPrice': this.handleMarkPrices,
            'kline': this.handleOHLCV,
            'markPrice_kline': this.handleOHLCV,
            'indexPrice_kline': this.handleOHLCV,
            '1hTicker@arr': this.handleTickers,
            '4hTicker@arr': this.handleTickers,
            '1dTicker@arr': this.handleTickers,
            '24hrTicker@arr': this.handleTickers,
            '24hrMiniTicker@arr': this.handleTickers,
            '1hTicker': this.handleTickers,
            '4hTicker': this.handleTickers,
            '1dTicker': this.handleTickers,
            '24hrTicker': this.handleTickers,
            '24hrMiniTicker': this.handleTickers,
            'markPriceUpdate': this.handleMarkPrices,
            'markPriceUpdate@arr': this.handleMarkPrices,
            'markPrice@arr': this.handleMarkPrices,
            'bookTicker': this.handleBidsAsks, // there is no "bookTicker@arr" endpoint
            'outboundAccountPosition': this.handleBalance,
            'balanceUpdate': this.handleBalance,
            'ACCOUNT_UPDATE': this.handleAcountUpdate,
            'BALANCE_POSITION_UPDATE': this.handleOptionsAccountUpdate,
            'executionReport': this.handleOrderUpdate,
            'orderReport': this.handleOrderUpdate,
            'ORDER_TRADE_UPDATE': this.handleOrderUpdate,
            'ALGO_UPDATE': this.handleOrderUpdate,
            'forceOrder': this.handleLiquidation,
            'eventStreamTerminated': this.handleEventStreamTerminated,
            'externalLockUpdate': this.handleBalance,
        };
        let event = this.safeString(message, 'e');
        if (Array.isArray(message)) {
            const arrayMessage = message[0];
            event = this.safeString(arrayMessage, 'e') + '@arr';
        }
        method = this.safeValue(methods, event);
        if (method === undefined) {
            const requestId = this.safeString(message, 'id');
            if (requestId !== undefined) {
                this.handleSubscriptionStatus(client, message);
                return;
            }
            // special case for the real-time bookTicker, since it comes without an event identifier
            //
            //     {
            //         "u": 7488717758,
            //         "s": "BTCUSDT",
            //         "b": "28621.74000000",
            //         "B": "1.43278800",
            //         "a": "28621.75000000",
            //         "A": "2.52500800"
            //     }
            //
            if (event === undefined && ('a' in message) && ('b' in message)) {
                this.handleBidsAsks(client, message);
            }
        }
        else {
            method.call(this, client, message);
        }
    }
}

exports["default"] = binance;
