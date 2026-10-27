
//  ---------------------------------------------------------------------------

import interactivebrokersRest from '../interactivebrokers.js';
import { AuthenticationError, ExchangeError } from '../base/errors.js';
import { ArrayCacheBySymbolById, ArrayCacheByTimestamp } from '../base/ws/Cache.js';
import type { Balances, Dict, Int, OHLCV, Order, OrderBook, Str, Strings, Ticker, Tickers, Trade } from '../base/types.js';
import Client from '../base/ws/Client.js';

//  ---------------------------------------------------------------------------

/**
 * @class interactivebrokers
 * @augments interactivebrokersRest
 */
export default class interactivebrokers extends interactivebrokersRest {
    override describe (): any {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchBalance': true,
                'watchBidsAsks': true,
                'watchMyTrades': true,
                'watchOHLCV': true,
                'watchOrderBook': true,
                'watchOrders': true,
                'watchPositions': false,
                'watchTickers': true,
                'watchTrades': false,
                'unWatchBalance': true,
                'unWatchBidsAsks': true,
                'unWatchMyTrades': true,
                'unWatchOHLCV': true,
                'unWatchOrderBook': true,
                'unWatchOrders': true,
                'unWatchTickers': true,
            },
            'urls': {
                'api': {
                    'ws': 'wss://api.ibkr.com/v1/api/ws',
                },
            },
            'options': {
                'ws': {
                    'options': {
                        // the session cookie from POST /tickle is set here when the connection is created
                        'headers': {},
                    },
                },
                'tradesLimit': 1000,
                'ordersLimit': 1000,
                'OHLCVLimit': 1000,
                'awaitAuthenticated': true, // wait for {"topic":"sts","args":{"authenticated":true}} before subscribing
                'tickleInterval': 240000, // POST /tickle and refresh the market data streams every 4 minutes (they expire after 15 minutes)
                'watchTickers': {
                    // 31 last, 55 symbol, 70 high, 71 low, 82 change, 83 change %, 84 bid, 85 ask size, 86 ask, 88 bid size,
                    // 7059 last size, 7295 open, 7635 mark, 7741 prior close, 7762 volume
                    'fields': [ '31', '55', '70', '71', '82', '83', '84', '85', '86', '88', '7059', '7295', '7635', '7741', '7762' ],
                },
                'watchOHLCV': {
                    'exchange': 'SMART',
                    'source': 'trades', // 'midpoint', 'trades', 'bid_ask', 'bid', 'ask'
                    'outsideRth': false,
                },
                'watchMyTrades': {
                    'realtimeUpdatesOnly': false,
                    'days': 1,
                },
                'watchBalance': {
                    'fetchBalanceSnapshot': true, // the ledger stream has cash only, the snapshot adds the crypto holdings and the locked amounts
                },
            },
            'streaming': {
                'keepAlive': 30000,
            },
        });
    }

    /**
     * @method
     * @name interactivebrokers#ibkrConnect
     * @description opens (or reuses) the authenticated websocket connection, the brokerage session cookie is obtained via POST /tickle
     * @ignore
     * @see https://www.interactivebrokers.com/docs/web-api/ws/connection-guide
     * @see https://www.interactivebrokers.com/docs/web-api/ws/auth-status
     * @returns {string} the url of the websocket client
     */
    async ibkrConnect (): Promise<string> {
        await this.authenticate ();
        const url = this.urls['api']['ws'] + '?oauth_token=' + this.apiKey;
        if (!(url in this.clients)) {
            const response = await this.webapiPostV1ApiTickle ();
            //
            //     { "session": "bb665d0f55b6289d70bc8a7f4fd2d3d0", "iserver": { "authStatus": { "authenticated": true, ... } }, ... }
            //
            const session = this.safeString (response, 'session');
            if (session === undefined) {
                throw new AuthenticationError (this.id + ' ibkrConnect() POST /tickle returned no session ' + this.json (response));
            }
            const defaultOptions: Dict = {
                'ws': {
                    'options': {
                        'headers': {},
                    },
                },
            };
            this.extendExchangeOptions (defaultOptions);
            const originalHeaders = this.options['ws']['options']['headers'];
            // with oauth the cookie carries the raw session id (not the {"session":"..."} json used by the
            // client portal gateway) and the upgrade is rejected with http 403 unless the user agent is ClientPortalGW
            const userAgent = this.safeString (this.options, 'wsUserAgent', 'ClientPortalGW/1');
            const headers: Dict = this.extend (originalHeaders, {
                'Cookie': 'api=' + session,
                'User-Agent': userAgent,
            });
            this.options['ws']['options']['headers'] = headers;
            // instantiate client
            const newClient = this.client (url);
            this.options['ws']['options']['headers'] = originalHeaders;
            const tickleInterval = this.safeInteger (this.options, 'tickleInterval', 240000);
            this.delay (tickleInterval, this.ibkrKeepAliveSession, newClient);
        }
        const client = this.client (url);
        const awaitAuthenticated = this.safeBool (this.options, 'awaitAuthenticated', true);
        const isAuthenticated = this.safeBool (client.subscriptions, 'ibkrAuthenticated', false);
        if (awaitAuthenticated && !isAuthenticated) {
            const messageHash = 'authenticated';
            await this.watch (url, messageHash, undefined, messageHash);
        } else {
            await client.connect (0);
        }
        return url;
    }

    /**
     * @method
     * @name interactivebrokers#ibkrKeepAliveSession
     * @description keeps the brokerage session alive with POST /tickle and refreshes the market data streams, which expire after 15 minutes
     * @ignore
     * @param {object} client the websocket client
     * @returns {undefined}
     */
    async ibkrKeepAliveSession (client: Client): Promise<any> {
        const current = this.safeValue (this.clients, client.url);
        if (current !== client) {
            return undefined; // the connection was closed or replaced
        }
        try {
            await this.webapiPostV1ApiTickle ();
        } catch (e) {
            // a failing tickle is retried on the next interval
            if (this.verbose) {
                this.log ('ibkrKeepAliveSession tickle failed', e);
            }
        }
        // resubscribe the market data streams before they expire
        const sent: Dict = {};
        const keys = Object.keys (client.subscriptions);
        for (let i = 0; i < keys.length; i++) {
            const subscription = client.subscriptions[keys[i]];
            if (typeof subscription === 'object') {
                const request = this.safeString (subscription, 'request');
                if ((request !== undefined) && request.startsWith ('smd+') && !(request in sent)) {
                    sent[request] = true;
                    try {
                        await client.send (request);
                    } catch (e) {
                        // the connection is gone, the client reconnects on the next watch call
                        if (this.verbose) {
                            this.log ('ibkrKeepAliveSession resubscribe failed', e);
                        }
                    }
                }
            }
        }
        const tickleInterval = this.safeInteger (this.options, 'tickleInterval', 240000);
        this.delay (tickleInterval, this.ibkrKeepAliveSession, client);
        return undefined;
    }

    /**
     * @method
     * @name interactivebrokers#ibkrSubscribe
     * @description sends a raw subscription message once per subscribe hash, IBKR does not acknowledge subscriptions
     * @ignore
     * @param {object} client the websocket client
     * @param {string} subscribeHash the key of the subscription
     * @param {string} request the raw message, e.g. 'smd+265598+{"fields":["31"]}'
     * @param {object} [subscription] extra data stored with the subscription
     * @returns {undefined}
     */
    async ibkrSubscribe (client: Client, subscribeHash: string, request: string, subscription: Dict = {}): Promise<any> {
        if (subscribeHash in client.subscriptions) {
            return undefined;
        }
        client.subscriptions[subscribeHash] = this.extend (subscription, { 'request': request });
        try {
            await client.send (request);
        } catch (e) {
            delete client.subscriptions[subscribeHash];
            throw e;
        }
        return undefined;
    }

    /**
     * @method
     * @name interactivebrokers#ibkrUnsubscribe
     * @description removes the subscriptions and rejects the pending futures of the given hashes, then sends the raw unsubscribe message, IBKR does not acknowledge unsubscriptions
     * @ignore
     * @param {object} client the websocket client
     * @param {string[]} subHashes the message hashes and subscribe hashes to clean
     * @param {string} request the raw unsubscribe message, e.g. 'umd+265598+{}', undefined to only clean
     * @param {object} [subscription] the cache to clean, see cleanCache
     * @returns {boolean} true
     */
    async ibkrUnsubscribe (client: Client, subHashes: string[], request: Str, subscription: Dict = {}): Promise<any> {
        for (let i = 0; i < subHashes.length; i++) {
            const subHash = subHashes[i];
            this.cleanUnsubscription (client, subHash, 'unsubscribe::' + subHash);
        }
        this.cleanCache (subscription);
        if (request !== undefined) {
            await client.connected;
            await client.send (request);
        }
        return true;
    }

    /**
     * @method
     * @name interactivebrokers#ibkrUnsubscribeMarketData
     * @description sends umd for a conid when no ticker, bidask or ohlcv subscription of the market is left
     * @ignore
     * @param {object} client the websocket client
     * @param {string} marketId the conid
     * @returns {undefined}
     */
    async ibkrUnsubscribeMarketData (client: Client, marketId: Str): Promise<any> {
        const keys = Object.keys (client.subscriptions);
        for (let i = 0; i < keys.length; i++) {
            const subscription = client.subscriptions[keys[i]];
            if (typeof subscription === 'object') {
                const request = this.safeString (subscription, 'request');
                const conid = this.safeString (subscription, 'conid');
                if ((request !== undefined) && request.startsWith ('smd+') && (conid === marketId)) {
                    return undefined; // still in use
                }
            }
        }
        await client.connected;
        await client.send ('umd+' + marketId + '+{}');
        return undefined;
    }

    /**
     * @method
     * @name interactivebrokers#ibkrMarketDataRequest
     * @description builds the smd subscription message of a market
     * @ignore
     * @param {string} marketId the conid
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string[]} [params.fields] the market data fields to stream
     * @returns {Array} the raw message and the params without fields
     */
    ibkrMarketDataRequest (marketId: Str, params: Dict = {}): any[] {
        const options = this.safeDict (this.options, 'watchTickers', {});
        const defaultFields = this.safeList (options, 'fields', []);
        const fields = this.safeList (params, 'fields', defaultFields);
        const query = this.omit (params, 'fields');
        const request = 'smd+' + marketId + '+' + this.json ({ 'fields': fields });
        return [ request, query ];
    }

    /**
     * @method
     * @name interactivebrokers#watchTickers
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @see https://www.interactivebrokers.com/docs/web-api/ws/streaming-data
     * @param {string[]} symbols unified symbols of the markets to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string[]} [params.fields] the market data fields to stream, default options.watchTicker.fields
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    override async watchTickers (symbols: Strings = undefined, params: Dict = {}): Promise<Tickers> {
        const ticker = await this.ibkrWatchMarketData ('ticker', symbols, params);
        if (this.newUpdates) {
            const result: Dict = {};
            const tickerSymbol = ticker['symbol'] as string;
            result[tickerSymbol] = ticker;
            return result;
        }
        return this.filterByArray (this.tickers, 'symbol', symbols);
    }

    /**
     * @method
     * @name interactivebrokers#watchBidsAsks
     * @description watches best bid & ask for symbols
     * @see https://www.interactivebrokers.com/docs/web-api/ws/streaming-data
     * @param {string[]} symbols unified symbols of the markets to fetch the bids and asks for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    override async watchBidsAsks (symbols: Strings = undefined, params: Dict = {}): Promise<Tickers> {
        const ticker = await this.ibkrWatchMarketData ('bidask', symbols, params);
        if (this.newUpdates) {
            const result: Dict = {};
            const tickerSymbol = ticker['symbol'] as string;
            result[tickerSymbol] = ticker;
            return result;
        }
        return this.filterByArray (this.bidsasks, 'symbol', symbols);
    }

    /**
     * @method
     * @name interactivebrokers#ibkrWatchMarketData
     * @description subscribes to the smd streams of the markets
     * @ignore
     * @param {string} topic 'ticker' or 'bidask'
     * @param {string[]} symbols unified symbols of the markets
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} the updated ticker
     */
    async ibkrWatchMarketData (topic: string, symbols: Strings = undefined, params: Dict = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const marketSymbols = this.marketSymbols (symbols, undefined, false);
        const url = await this.ibkrConnect ();
        const client = this.client (url);
        const messageHashes: string[] = [];
        for (let i = 0; i < marketSymbols.length; i++) {
            messageHashes.push (topic + '::' + marketSymbols[i]);
        }
        const future = this.watchMultiple (url, messageHashes);
        for (let i = 0; i < marketSymbols.length; i++) {
            const market = this.market (marketSymbols[i]);
            const [ request, query ] = this.ibkrMarketDataRequest (market['id'], params);
            const subscription: Dict = this.extend ({ 'conid': market['id'], 'symbol': market['symbol'] }, query);
            await this.ibkrSubscribe (client, messageHashes[i], request, subscription);
        }
        return await future;
    }

    /**
     * @method
     * @name interactivebrokers#unWatchTicker
     * @description unWatches a price ticker
     * @see https://www.interactivebrokers.com/docs/web-api/ws/streaming-data
     * @param {string} symbol unified symbol of the market
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {boolean} true
     */
    override async unWatchTicker (symbol: string, params: Dict = {}): Promise<any> {
        return await this.unWatchTickers ([ symbol ], params);
    }

    /**
     * @method
     * @name interactivebrokers#unWatchTickers
     * @description unWatches the price tickers of the markets
     * @see https://www.interactivebrokers.com/docs/web-api/ws/streaming-data
     * @param {string[]} symbols unified symbols of the markets
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {boolean} true
     */
    override async unWatchTickers (symbols: Strings = undefined, params: Dict = {}): Promise<any> {
        return await this.ibkrUnWatchMarketData ('ticker', symbols, params);
    }

    /**
     * @method
     * @name interactivebrokers#unWatchBidsAsks
     * @description unWatches the best bids & asks of the markets
     * @see https://www.interactivebrokers.com/docs/web-api/ws/streaming-data
     * @param {string[]} symbols unified symbols of the markets
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {boolean} true
     */
    override async unWatchBidsAsks (symbols: Strings = undefined, params: Dict = {}): Promise<any> {
        return await this.ibkrUnWatchMarketData ('bidask', symbols, params);
    }

    /**
     * @method
     * @name interactivebrokers#ibkrUnWatchMarketData
     * @description removes the ticker or bidask subscriptions, umd is sent when the market has no other subscription left
     * @ignore
     * @param {string} topic 'ticker' or 'bidask'
     * @param {string[]} symbols unified symbols of the markets
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {boolean} true
     */
    async ibkrUnWatchMarketData (topic: string, symbols: Strings = undefined, params: Dict = {}): Promise<any> {
        await this.loadMarkets ();
        const marketSymbols = this.marketSymbols (symbols, undefined, false);
        const url = await this.ibkrConnect ();
        const client = this.client (url);
        const subHashes: string[] = [];
        for (let i = 0; i < marketSymbols.length; i++) {
            subHashes.push (topic + '::' + marketSymbols[i]);
        }
        const subscription: Dict = {
            'topic': (topic === 'bidask') ? 'bidsasks' : 'ticker', // the cache names of cleanCache
            'symbols': marketSymbols,
        };
        await this.ibkrUnsubscribe (client, subHashes, undefined, subscription);
        for (let i = 0; i < marketSymbols.length; i++) {
            const market = this.market (marketSymbols[i]);
            await this.ibkrUnsubscribeMarketData (client, market['id']);
        }
        return true;
    }

    handleTicker (client: Client, message: Dict) {
        //
        //     {
        //         "server_id": "q0",
        //         "conidEx": "495759171",
        //         "conid": 495759171,
        //         "_updated": 1702334859712,
        //         "6119": "q0",
        //         "31": "2428.50",
        //         "84": "2428.25",
        //         "86": "2428.75",
        //         "topic": "smd+495759171"
        //     }
        //
        const topic = this.safeString (message, 'topic', '');
        const parts = topic.split ('+');
        const marketId = this.safeString (parts, 1);
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        // the updates are deltas, they are merged into the previous raw ticker
        const previous = this.safeDict (this.tickers, symbol, {});
        const previousInfo = this.safeDict (previous, 'info', {});
        const merged = this.extend (previousInfo, message);
        if (this.safeInteger (message, '_updated') === undefined) {
            merged['_updated'] = this.milliseconds ();
        }
        const ticker = this.parseTicker (merged, market);
        this.tickers[symbol] = ticker;
        client.resolve (ticker, 'ticker::' + symbol);
        const hasBidAsk = ('84' in message) || ('85' in message) || ('86' in message) || ('88' in message);
        if (hasBidAsk || !(symbol in this.bidsasks)) {
            const bidAsk = this.safeTicker ({
                'symbol': symbol,
                'timestamp': ticker['timestamp'],
                'datetime': ticker['datetime'],
                'bid': this.safeString (ticker, 'bid'),
                'bidVolume': this.safeString (ticker, 'bidVolume'),
                'ask': this.safeString (ticker, 'ask'),
                'askVolume': this.safeString (ticker, 'askVolume'),
                'info': merged,
            }, market);
            this.bidsasks[symbol] = bidAsk;
            client.resolve (bidAsk, 'bidask::' + symbol);
        }
        this.ibkrUpdateOHLCVs (client, symbol, message);
    }

    /**
     * @method
     * @name interactivebrokers#watchOHLCV
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market, the history comes from smh, the last candles are built from the last price of the smd stream
     * @see https://www.interactivebrokers.com/docs/web-api/ws/historical-data
     * @see https://www.interactivebrokers.com/docs/web-api/ws/streaming-data
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.source] 'trades' (default), 'midpoint', 'bid_ask', 'bid' or 'ask'
     * @param {boolean} [params.outsideRth] include data outside regular trading hours
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    override async watchOHLCV (symbol: string, timeframe: string = '1m', since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<OHLCV[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const unifiedSymbol = market['symbol'];
        const url = await this.ibkrConnect ();
        const client = this.client (url);
        const messageHash = 'ohlcv::' + unifiedSymbol + '::' + timeframe;
        const future = this.watch (url, messageHash);
        // the last price stream, it builds the current candles
        const [ marketDataRequest, query ] = this.ibkrMarketDataRequest (market['id'], params);
        await this.ibkrSubscribe (client, messageHash, marketDataRequest, { 'conid': market['id'], 'symbol': unifiedSymbol, 'timeframe': timeframe });
        // the history, it seeds the candles
        const historyHash = 'smh::' + market['id'] + '::' + timeframe;
        if (!(historyHash in client.subscriptions)) {
            if (!(unifiedSymbol in this.ohlcvs)) {
                this.ohlcvs[unifiedSymbol] = {};
            }
            const ohlcvLimit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
            if (!(timeframe in this.ohlcvs[unifiedSymbol])) {
                this.ohlcvs[unifiedSymbol][timeframe] = new ArrayCacheByTimestamp (ohlcvLimit);
            }
            const options = this.safeDict (this.options, 'watchOHLCV', {});
            const duration = this.parseTimeframe (timeframe);
            const historyLimit = (limit === undefined) ? 100 : limit;
            const historyRequest: Dict = {
                'exchange': this.safeString (options, 'exchange', 'SMART'),
                'period': this.ibkrWsPeriod (duration, historyLimit),
                'bar': this.safeString (this.timeframes, timeframe, timeframe),
                'outsideRth': this.safeBool (options, 'outsideRth', false),
                'source': this.safeString (options, 'source', 'trades'),
                // no 'format', the bars carry the "t" timestamp only with the default format
            };
            const request = 'smh+' + market['id'] + '+' + this.json (this.extend (historyRequest, query));
            await this.ibkrSubscribe (client, historyHash, request, { 'conid': market['id'], 'symbol': unifiedSymbol, 'timeframe': timeframe, 'duration': duration });
        }
        const ohlcv = await future;
        let resultLimit = limit;
        if (this.newUpdates) {
            resultLimit = ohlcv.getLimit (unifiedSymbol, limit);
        }
        return this.filterBySinceLimit (ohlcv, since, resultLimit, 0, true);
    }

    /**
     * @method
     * @name interactivebrokers#unWatchOHLCV
     * @description unWatches historical candlestick data
     * @see https://www.interactivebrokers.com/docs/web-api/ws/streaming-data
     * @param {string} symbol unified symbol of the market
     * @param {string} timeframe the length of time each candle represents
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {boolean} true
     */
    override async unWatchOHLCV (symbol: string, timeframe: string = '1m', params: Dict = {}): Promise<any> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const unifiedSymbol = market['symbol'];
        const url = await this.ibkrConnect ();
        const client = this.client (url);
        const subHashes = [ 'ohlcv::' + unifiedSymbol + '::' + timeframe, 'smh::' + market['id'] + '::' + timeframe ];
        const subscription: Dict = {
            'topic': 'ohlcv',
            'symbolsAndTimeframes': [ [ unifiedSymbol, timeframe ] ],
        };
        await this.ibkrUnsubscribe (client, subHashes, undefined, subscription);
        await this.ibkrUnsubscribeMarketData (client, market['id']);
        return true;
    }

    handleOHLCV (client: Client, message: Dict) {
        //
        //     {
        //         "serverId": "smh265598",
        //         "symbol": "AAPL",
        //         "barLength": 3600,
        //         "data": [
        //             { "o": 182.0, "c": 183.5, "h": 184.2, "l": 181.5, "v": 95000, "t": 1699801200 }
        //         ],
        //         "points": 1,
        //         "topic": "smh+265598"
        //     }
        //
        const topic = this.safeString (message, 'topic', '');
        const parts = topic.split ('+');
        const marketId = this.safeString (parts, 1);
        const serverId = this.safeString (message, 'serverId');
        if (serverId !== undefined) {
            // the history is sent once, the request must be cancelled to free one of the 5 concurrent slots
            this.spawn (this.ibkrCancelHistory, client, serverId);
        }
        const barLength = this.safeInteger (message, 'barLength');
        // several timeframes of a market share the topic, they are told apart by the bar length
        const keys = Object.keys (client.subscriptions);
        let subscription: Dict | undefined = undefined;
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            if (key.startsWith ('smh::' + marketId + '::')) {
                const candidate = client.subscriptions[key];
                const duration = this.safeInteger (candidate, 'duration');
                if ((subscription === undefined) || (duration === barLength)) {
                    subscription = candidate;
                }
            }
        }
        if (subscription === undefined) {
            return;
        }
        const symbol = this.safeString (subscription, 'symbol') as string;
        const timeframe = this.safeString (subscription, 'timeframe') as string;
        const market = this.safeMarket (marketId);
        const stored = this.safeValue (this.safeDict (this.ohlcvs, symbol, {}), timeframe);
        if (stored === undefined) {
            return;
        }
        const data = this.safeList (message, 'data', []);
        const bars = [];
        let lastHistoryTimestamp: Int = undefined;
        for (let i = 0; i < data.length; i++) {
            const parsed = this.parseOHLCV (data[i], market);
            let timestamp = parsed[0];
            if (timestamp === undefined) {
                continue;
            }
            if (timestamp < 100000000000) {
                timestamp = timestamp * 1000; // seconds
                parsed[0] = timestamp;
            }
            bars.push (parsed);
            if ((lastHistoryTimestamp === undefined) || (timestamp > lastHistoryTimestamp)) {
                lastHistoryTimestamp = timestamp;
            }
        }
        // the live candles built from smd before the history arrived are kept only when they are newer than the history
        for (let i = 0; i < stored.length; i++) {
            const candle = stored[i];
            if ((lastHistoryTimestamp === undefined) || (candle[0] > lastHistoryTimestamp)) {
                bars.push (candle);
            }
        }
        const sorted = this.sortBy (bars, 0);
        const ohlcvLimit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
        const cache = new ArrayCacheByTimestamp (ohlcvLimit);
        for (let i = 0; i < sorted.length; i++) {
            cache.append (sorted[i]);
        }
        this.ohlcvs[symbol][timeframe] = cache;
        client.resolve (cache, 'ohlcv::' + symbol + '::' + timeframe);
    }

    /**
     * @method
     * @name interactivebrokers#ibkrWsPeriod
     * @description builds the smh period, it accepts {1-30}min, {1-8}h, {1-1000}d, {1-792}w, {1-182}m and {1-15}y only, so the period is rounded up to the smallest fitting unit
     * @ignore
     * @see https://www.interactivebrokers.com/docs/web-api/ws/historical-data
     * @param {int} duration the length of one bar in seconds
     * @param {int} limit the number of bars
     * @returns {string} the period, e.g. '2h'
     */
    ibkrWsPeriod (duration: number, limit: number): string {
        const total = duration * limit;
        const minutes = this.parseToInt ((total + 59) / 60);
        if (minutes <= 30) {
            return this.numberToString (Math.max (minutes, 1)) + 'min';
        }
        const hours = this.parseToInt ((total + 3599) / 3600);
        if (hours <= 8) {
            return this.numberToString (hours) + 'h';
        }
        const days = this.parseToInt ((total + 86399) / 86400);
        if (days <= 1000) {
            return this.numberToString (days) + 'd';
        }
        const weeks = this.parseToInt ((total + 604799) / 604800);
        if (weeks <= 792) {
            return this.numberToString (weeks) + 'w';
        }
        const months = this.parseToInt ((total + 2591999) / 2592000);
        if (months <= 182) {
            return this.numberToString (months) + 'm';
        }
        const years = this.parseToInt ((total + 31535999) / 31536000);
        return this.numberToString (Math.min (years, 15)) + 'y';
    }

    /**
     * @method
     * @name interactivebrokers#ibkrCancelHistory
     * @description cancels a historical data request with umh
     * @ignore
     * @param {object} client the websocket client
     * @param {string} serverId the serverId of the smh response
     * @returns {undefined}
     */
    async ibkrCancelHistory (client: Client, serverId: string): Promise<any> {
        await client.send ('umh+' + serverId);
        return undefined;
    }

    /**
     * @method
     * @name interactivebrokers#ibkrUpdateOHLCVs
     * @description updates the current candles of the watched timeframes of a market with the last price of a market data delta
     * @ignore
     * @param {object} client the websocket client
     * @param {string} symbol unified market symbol
     * @param {object} delta the raw smd message
     */
    ibkrUpdateOHLCVs (client: Client, symbol: string, delta: Dict) {
        const lastString = this.ibkrParseValue (this.safeString (delta, '31'));
        if (lastString === undefined) {
            return;
        }
        const ohlcvsBySymbol = this.safeDict (this.ohlcvs, symbol);
        if (ohlcvsBySymbol === undefined) {
            return;
        }
        const price = this.parseNumber (lastString);
        const sizeString = this.ibkrParseValue (this.safeString (delta, '7059'));
        let size = 0;
        if (sizeString !== undefined) {
            size = this.parseNumber (sizeString);
        }
        const timestamp = this.safeInteger (delta, '_updated', this.milliseconds ());
        const timeframes = Object.keys (ohlcvsBySymbol);
        for (let i = 0; i < timeframes.length; i++) {
            const timeframe = timeframes[i];
            const stored = ohlcvsBySymbol[timeframe];
            const duration = this.parseTimeframe (timeframe) * 1000;
            const candleTimestamp = this.parseToInt (timestamp / duration) * duration;
            const length = stored.length;
            let candle = undefined;
            if (length > 0) {
                const lastCandle = stored[length - 1];
                if (lastCandle[0] === candleTimestamp) {
                    candle = lastCandle;
                } else if (lastCandle[0] > candleTimestamp) {
                    continue;
                }
            }
            if (candle === undefined) {
                stored.append ([ candleTimestamp, price, price, price, price, size ]);
            } else {
                const high = Math.max (candle[2], price);
                const low = Math.min (candle[3], price);
                const volume = this.sum (candle[5], size);
                stored.append ([ candleTimestamp, candle[1], high, low, price, volume ]);
            }
            client.resolve (stored, 'ohlcv::' + symbol + '::' + timeframe);
        }
    }

    /**
     * @method
     * @name interactivebrokers#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data, requires a level 2 market data subscription, one price ladder per account
     * @see https://www.interactivebrokers.com/docs/web-api/ws/booktrader
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.accountId] the account id, defaults to options["accountId"]
     * @param {string} [params.exchange] the deep book exchange, all by default
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure} indexed by market symbols
     */
    override async watchOrderBook (symbol: string, limit: Int = undefined, params: Dict = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const unifiedSymbol = market['symbol'];
        const [ accountId, query ] = await this.loadAccountId (params);
        const bookExchange = this.safeString (query, 'exchange');
        const url = await this.ibkrConnect ();
        const client = this.client (url);
        const messageHash = 'orderbook::' + unifiedSymbol;
        const future = this.watch (url, messageHash);
        let request = 'sbd+' + accountId + '+' + market['id'];
        if (bookExchange !== undefined) {
            request = request + '+' + bookExchange;
        }
        await this.ibkrSubscribe (client, messageHash, request, { 'conid': market['id'], 'symbol': unifiedSymbol, 'accountId': accountId });
        const orderbook = await future;
        return orderbook.limit ();
    }

    /**
     * @method
     * @name interactivebrokers#unWatchOrderBook
     * @description unWatches the order book of a market, ubd cancels the price ladder of the account
     * @see https://www.interactivebrokers.com/docs/web-api/ws/booktrader
     * @param {string} symbol unified symbol of the market
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.accountId] the account id, defaults to options["accountId"]
     * @returns {boolean} true
     */
    override async unWatchOrderBook (symbol: string, params: Dict = {}): Promise<any> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const unifiedSymbol = market['symbol'];
        const [ accountId, query ] = await this.loadAccountId (params);
        const url = await this.ibkrConnect ();
        const client = this.client (url);
        const subscription: Dict = this.extend ({
            'topic': 'orderbook',
            'symbols': [ unifiedSymbol ],
        }, query);
        return await this.ibkrUnsubscribe (client, [ 'orderbook::' + unifiedSymbol ], 'ubd+' + accountId, subscription);
    }

    handleOrderBook (client: Client, message: Dict) {
        //
        //     {
        //         "topic": "sbd+U1234567+265598",
        //         "data": [
        //             { "row": 0, "focus": 0, "price": "182.45" },
        //             { "row": 1, "focus": 1, "price": "5 @ 182.50" },
        //             { "row": 2, "focus": 0, "price": "182.50", "bid": "200" },
        //             { "row": 3, "focus": 0, "price": "182.55", "ask": "150" }
        //         ]
        //     }
        //
        const topic = this.safeString (message, 'topic', '');
        const parts = topic.split ('+');
        const marketId = this.safeString (parts, 2);
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const data = this.safeList (message, 'data', []);
        const bids = [];
        const asks = [];
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            let price = this.safeString (row, 'price');
            if (price === undefined) {
                continue;
            }
            if (price.indexOf ('@') >= 0) {
                // "size @ price" marks the last trade
                const priceParts = price.split ('@');
                const pricePart = priceParts[1];
                const priceWords = pricePart.split (' ');
                price = priceWords.join ('');
            }
            price = this.ibkrParseValue (price);
            const bid = this.ibkrParseValue (this.safeString (row, 'bid'));
            const ask = this.ibkrParseValue (this.safeString (row, 'ask'));
            if (bid !== undefined) {
                bids.push ([ price, bid ]);
            }
            if (ask !== undefined) {
                asks.push ([ price, ask ]);
            }
        }
        const timestamp = this.milliseconds ();
        const snapshot = this.parseOrderBook ({ 'bids': bids, 'asks': asks }, symbol, timestamp);
        let orderbook = this.safeValue (this.orderbooks, symbol);
        if (orderbook === undefined) {
            orderbook = this.orderBook ({});
            this.orderbooks[symbol] = orderbook;
        }
        orderbook.reset (snapshot);
        client.resolve (orderbook, 'orderbook::' + symbol);
    }

    /**
     * @method
     * @name interactivebrokers#watchOrders
     * @description watches information on multiple orders made by the user
     * @see https://www.interactivebrokers.com/docs/web-api/ws/order-updates
     * @param {string} [symbol] unified market symbol of the market the orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string[]} [params.filters] order status filters, e.g. [ 'Submitted', 'Filled' ]
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    override async watchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Order[]> {
        await this.loadMarkets ();
        let messageHash = 'orders';
        let unifiedSymbol: Str = undefined;
        if (symbol !== undefined) {
            unifiedSymbol = this.symbol (symbol);
            messageHash = messageHash + '::' + unifiedSymbol;
        }
        const url = await this.ibkrConnect ();
        const client = this.client (url);
        const future = this.watch (url, messageHash);
        const filters = this.safeList (params, 'filters');
        const requestParams: Dict = {};
        if (filters !== undefined) {
            requestParams['filters'] = filters;
        }
        await this.ibkrSubscribe (client, 'sor', 'sor+' + this.json (requestParams));
        const orders = await future;
        let resultLimit = limit;
        if (this.newUpdates) {
            resultLimit = orders.getLimit (unifiedSymbol, limit);
        }
        return this.filterBySymbolSinceLimit (orders, unifiedSymbol, since, resultLimit, true);
    }

    /**
     * @method
     * @name interactivebrokers#unWatchOrders
     * @description unWatches information on multiple orders made by the user
     * @see https://www.interactivebrokers.com/docs/web-api/ws/order-updates
     * @param {string} [symbol] not used by interactivebrokers.unWatchOrders, all the order streams are cancelled
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {boolean} true
     */
    override async unWatchOrders (symbol: Str = undefined, params: Dict = {}): Promise<any> {
        const url = await this.ibkrConnect ();
        const client = this.client (url);
        this.cleanUnsubscription (client, 'orders', 'unsubscribe::orders', true);
        return await this.ibkrUnsubscribe (client, [ 'sor' ], 'uor+{}', { 'topic': 'orders' });
    }

    handleOrders (client: Client, message: Dict) {
        //
        //     {
        //         "topic": "sor",
        //         "args": [
        //             {
        //                 "acct": "U1234567",
        //                 "conid": 265598,
        //                 "orderId": 1234568790,
        //                 "orderType": "Limit",
        //                 "side": "BUY",
        //                 "price": "185.50",
        //                 "status": "Submitted",
        //                 "filledQuantity": 0.0,
        //                 "remainingQuantity": 5.0,
        //                 "totalSize": 5.0,
        //                 "timeInForce": "CLOSE",
        //                 "lastExecutionTime_r": 1702317649000,
        //                 "order_ref": "my-id"
        //             }
        //         ]
        //     }
        //
        const args = this.safeList (message, 'args', []);
        if (args.length === 0) {
            return;
        }
        if (this.orders === undefined) {
            const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
            this.orders = new ArrayCacheBySymbolById (limit);
        }
        const orders = this.orders;
        const symbols: Dict = {};
        for (let i = 0; i < args.length; i++) {
            const rawOrder = args[i];
            let parsed = this.parseOrder (rawOrder);
            const orderSymbol = parsed['symbol'] as string;
            // the updates may be partial, they are merged into the previous raw order
            const previousOrders = this.safeDict (orders.hashmap, orderSymbol, {});
            const previous = this.safeDict (previousOrders, parsed['id']);
            if (previous !== undefined) {
                const previousInfo = this.safeDict (previous, 'info', {});
                parsed = this.parseOrder (this.extend (previousInfo, rawOrder));
            }
            orders.append (parsed);
            symbols[orderSymbol] = true;
        }
        client.resolve (orders, 'orders');
        const keys = Object.keys (symbols);
        for (let i = 0; i < keys.length; i++) {
            client.resolve (orders, 'orders::' + keys[i]);
        }
    }

    /**
     * @method
     * @name interactivebrokers#watchMyTrades
     * @description watches information on multiple trades made by the user
     * @see https://www.interactivebrokers.com/docs/web-api/ws/trades
     * @param {string} [symbol] unified market symbol of the market the trades were made in
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.realtimeUpdatesOnly] skip the trades of the previous days, default false
     * @param {int} [params.days] number of days of trades to receive first, default 1
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    override async watchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        let messageHash = 'myTrades';
        let unifiedSymbol: Str = undefined;
        if (symbol !== undefined) {
            unifiedSymbol = this.symbol (symbol);
            messageHash = messageHash + '::' + unifiedSymbol;
        }
        const url = await this.ibkrConnect ();
        const client = this.client (url);
        const future = this.watch (url, messageHash);
        const options = this.safeDict (this.options, 'watchMyTrades', {});
        const requestParams: Dict = {
            'realtimeUpdatesOnly': this.safeBool (params, 'realtimeUpdatesOnly', this.safeBool (options, 'realtimeUpdatesOnly', false)),
            'days': this.safeInteger (params, 'days', this.safeInteger (options, 'days', 1)),
        };
        await this.ibkrSubscribe (client, 'str', 'str+' + this.json (requestParams));
        const trades = await future;
        let resultLimit = limit;
        if (this.newUpdates) {
            resultLimit = trades.getLimit (unifiedSymbol, limit);
        }
        return this.filterBySymbolSinceLimit (trades, unifiedSymbol, since, resultLimit, true);
    }

    /**
     * @method
     * @name interactivebrokers#unWatchMyTrades
     * @description unWatches information on multiple trades made by the user
     * @see https://www.interactivebrokers.com/docs/web-api/ws/trades
     * @param {string} [symbol] not used by interactivebrokers.unWatchMyTrades, all the trade streams are cancelled
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {boolean} true
     */
    override async unWatchMyTrades (symbol: Str = undefined, params: Dict = {}): Promise<any> {
        const url = await this.ibkrConnect ();
        const client = this.client (url);
        this.cleanUnsubscription (client, 'myTrades', 'unsubscribe::myTrades', true);
        return await this.ibkrUnsubscribe (client, [ 'str' ], 'utr', { 'topic': 'myTrades' });
    }

    handleMyTrades (client: Client, message: Dict) {
        //
        //     {
        //         "topic": "str",
        //         "args": [
        //             {
        //                 "execution_id": "0000e0d5.6576fd38.01.01",
        //                 "symbol": "AAPL",
        //                 "side": "B",
        //                 "order_description": "Bot 5 @ 192.26 on ISLAND",
        //                 "trade_time_r": 1702319146000,
        //                 "size": 5,
        //                 "price": "192.26",
        //                 "order_ref": "my-id",
        //                 "exchange": "ISLAND",
        //                 "net_amount": 961.3,
        //                 "account": "U1234567",
        //                 "conid": 265598
        //             }
        //         ]
        //     }
        //
        const args = this.safeList (message, 'args', []);
        if (args.length === 0) {
            return;
        }
        if (this.myTrades === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            this.myTrades = new ArrayCacheBySymbolById (limit);
        }
        const trades = this.myTrades;
        const symbols: Dict = {};
        for (let i = 0; i < args.length; i++) {
            const trade = this.parseTrade (args[i]);
            trades.append (trade);
            const tradeSymbol = trade['symbol'] as string;
            symbols[tradeSymbol] = true;
        }
        client.resolve (trades, 'myTrades');
        const keys = Object.keys (symbols);
        for (let i = 0; i < keys.length; i++) {
            client.resolve (trades, 'myTrades::' + keys[i]);
        }
    }

    /**
     * @method
     * @name interactivebrokers#watchBalance
     * @description watch balance and get the amount of funds available for trading or funds locked in orders, the cash comes from the account ledger stream, the first call takes a fetchBalance snapshot for the holdings and the locked amounts
     * @see https://www.interactivebrokers.com/docs/web-api/ws/account-ledger
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.accountId] the account id, defaults to options["accountId"]
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
     */
    override async watchBalance (params: Dict = {}): Promise<Balances> {
        await this.loadMarkets ();
        const [ accountId, query ] = await this.loadAccountId (params);
        const url = await this.ibkrConnect ();
        const client = this.client (url);
        const messageHash = 'balance';
        const subscribeHash = 'sld::' + accountId;
        if (!(subscribeHash in client.subscriptions)) {
            const options = this.safeDict (this.options, 'watchBalance', {});
            const fetchBalanceSnapshot = this.safeBool (options, 'fetchBalanceSnapshot', true);
            if (fetchBalanceSnapshot) {
                this.balance = await this.fetchBalance (this.extend (query, { 'accountId': accountId }));
            }
        }
        const future = this.watch (url, messageHash);
        await this.ibkrSubscribe (client, subscribeHash, 'sld+' + accountId + '+{}', { 'accountId': accountId });
        return await future;
    }

    /**
     * @method
     * @name interactivebrokers#unWatchBalance
     * @description unWatches the balance of the account
     * @see https://www.interactivebrokers.com/docs/web-api/ws/account-ledger
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.accountId] the account id, defaults to options["accountId"]
     * @returns {boolean} true
     */
    async unWatchBalance (params: Dict = {}): Promise<any> {
        const [ accountId, query ] = await this.loadAccountId (params);
        const url = await this.ibkrConnect ();
        const client = this.client (url);
        this.balance = {};
        return await this.ibkrUnsubscribe (client, [ 'balance', 'sld::' + accountId ], 'uld+' + accountId + '+{}', query);
    }

    handleBalance (client: Client, message: Dict) {
        //
        //     {
        //         "result": [
        //             { "acctCode": "U1234567", "cashbalance": 2.0201311791131118E8, "key": "LedgerListBASE", "secondKey": "BASE", "settledCash": 2.02E8, "timestamp": 1700248325, ... },
        //             { "acctCode": "U1234567", "cashbalance": 1000.0, "key": "LedgerListUSD", "secondKey": "USD", "timestamp": 1700248325, ... },
        //             { "key": "LedgerListEUR", "timestamp": 1700248325 }
        //         ],
        //         "topic": "sld+U1234567"
        //     }
        //
        const result = this.safeList (message, 'result', []);
        let changed = false;
        let timestamp: Int = undefined;
        for (let i = 0; i < result.length; i++) {
            const entry = result[i];
            timestamp = this.safeTimestamp (entry, 'timestamp', timestamp);
            const cash = this.safeString (entry, 'cashbalance');
            if (cash === undefined) {
                continue; // unchanged since the previous message
            }
            const key = this.safeString (entry, 'key', '');
            const currencyId = this.safeString (entry, 'secondKey', key.replace ('LedgerList', ''));
            if (currencyId === 'BASE') {
                continue; // aggregated entry in the account base currency
            }
            const code = this.safeCurrencyCode (currencyId) as string;
            const account = this.safeDict (this.balance, code, this.account ());
            account['total'] = cash;
            account['free'] = undefined; // recomputed from total - used
            this.balance[code] = account;
            changed = true;
        }
        if (!changed && ('info' in this.balance)) {
            return;
        }
        this.balance['info'] = message;
        this.balance['timestamp'] = timestamp;
        this.balance['datetime'] = this.iso8601 (timestamp);
        this.balance = this.safeBalance (this.balance);
        client.resolve (this.balance, 'balance');
    }

    handleSessionStatus (client: Client, message: Dict) {
        //
        //     { "topic": "sts", "args": { "authenticated": true, "competing": false, "message": "", "fail": "", "serverName": "...", "serverVersion": "..." } }
        //
        const args = this.safeDict (message, 'args', {});
        const authenticated = this.safeBool (args, 'authenticated');
        if (authenticated === undefined) {
            return;
        }
        if (authenticated) {
            client.subscriptions['ibkrAuthenticated'] = true;
            client.resolve (true, 'authenticated');
        } else {
            client.subscriptions['ibkrAuthenticated'] = false;
            const error = new AuthenticationError (this.id + ' the brokerage session is not authenticated ' + this.json (message));
            client.reject (error);
        }
    }

    handleErrorMessage (client: Client, message: Dict): boolean {
        //
        //     { "topic": "smd+123", "error": "..." }
        //
        const errorMessage = this.safeString (message, 'error');
        if (errorMessage === undefined) {
            return false;
        }
        const feedback = this.id + ' ' + this.json (message);
        try {
            this.throwBroadlyMatchedException (this.exceptions['broad'], errorMessage, feedback);
            throw new ExchangeError (feedback);
        } catch (error) {
            client.reject (error);
        }
        return true;
    }

    override ping (client: Client) {
        // https://www.interactivebrokers.com/docs/web-api/ws/ping - "tic" keeps the websocket session alive, no response is sent
        return 'tic';
    }

    override handleMessage (client: Client, message: any) {
        //
        // every message (including the 10 second system heartbeats) proves the connection is alive
        //
        //     { "topic": "system", "success": "username" }
        //     { "topic": "system", "hb": 1702334859712 }
        //
        client.lastPong = this.milliseconds ();
        if (typeof message === 'string') {
            return;
        }
        if (this.handleErrorMessage (client, message)) {
            return;
        }
        const topic = this.safeString (message, 'topic', '');
        if (topic.startsWith ('smd+')) {
            this.handleTicker (client, message);
        } else if (topic.startsWith ('smh+')) {
            this.handleOHLCV (client, message);
        } else if (topic.startsWith ('sbd+')) {
            this.handleOrderBook (client, message);
        } else if (topic === 'sor') {
            this.handleOrders (client, message);
        } else if (topic === 'str') {
            this.handleMyTrades (client, message);
        } else if (topic.startsWith ('sld+')) {
            this.handleBalance (client, message);
        } else if (topic === 'sts') {
            this.handleSessionStatus (client, message);
        }
        // system, act, blt, ntf, spl and ssd are not used
    }
}
