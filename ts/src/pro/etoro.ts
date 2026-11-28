//  ---------------------------------------------------------------------------

import etoroRest from '../etoro.js';
import { ArgumentsRequired, AuthenticationError, BadRequest, BadSymbol, ExchangeError, NotSupported, PermissionDenied, RateLimitExceeded } from '../base/errors.js';
import { ArrayCacheBySymbolById } from '../base/ws/Cache.js';
import { Precise } from '../base/Precise.js';
import type { Dict, Int, Market, NullableDict, Order, Position, Str, Strings, Ticker, Tickers, Trade } from '../base/types.js';
import Client from '../base/ws/Client.js';

//  ---------------------------------------------------------------------------

export default class etoro extends etoroRest {
    override describe (): Dict {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'unWatchBidsAsks': true,
                'unWatchMyTrades': true,
                'unWatchOrders': true,
                'unWatchPositions': true,
                'unWatchTicker': true,
                'unWatchTickers': true,
                'watchBalance': false,
                'watchBidsAsks': true,
                'watchMyTrades': true,
                'watchOHLCV': false,
                'watchOrderBook': false,
                'watchOrders': true,
                'watchPositions': true,
                'watchTicker': true,
                'watchTickers': true,
                'watchTrades': false,
            },
            'urls': {
                'api': {
                    'ws': 'wss://ws.etoro.com/ws',
                },
                'test': {
                    'ws': 'wss://ws.etoro.com/ws',
                },
            },
            'options': {
                'ordersLimit': 1000,
                'tradesLimit': 1000,
                'positionsLimit': 1000,
                'watchPositions': {
                    'fetchPositionsSnapshot': true, // fetch the open positions with rest before the first update
                    'awaitPositionsSnapshot': true, // whether to return the snapshot on the first call
                },
            },
            'streaming': {},
            'exceptions': {
                'ws': {
                    'exact': {
                        'InvalidKey': AuthenticationError,
                        'Unauthorized': AuthenticationError,
                        'ApiKeyRequired': AuthenticationError,
                        'UserKeyRequired': AuthenticationError,
                        'SessionNotAuthenticated': AuthenticationError,
                        'Forbidden': PermissionDenied,
                        'TooManyRequests': RateLimitExceeded,
                        'DataRequired': BadRequest,
                        'InvalidTopicName': BadRequest,
                        'SubscribeFailed': BadSymbol, // {"success":false,"operation":"Subscribe","errorMessage":"Snapshot not found","errorCode":"SubscribeFailed"}
                        'UnhandledException': ExchangeError,
                    },
                },
            },
        });
    }

    getWsUrl (): string {
        const urls = this.safeDict (this.urls, 'api', {});
        return this.safeString (urls, 'ws', 'wss://ws.etoro.com/ws');
    }

    getPrivateTopic (): string {
        if (this.isSandboxModeEnabled) {
            return 'private:demo';
        }
        return 'private:real';
    }

    /**
     * @method
     * @name etoro#authenticate
     * @description authenticates the websocket connection, every topic requires an authenticated session
     * @ignore
     * @see https://api-portal.etoro.com/core/websocket/authentication.md
     * @param {string} url the websocket url
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {boolean} true once the session is authenticated
     */
    async authenticate (url: string, params: Dict = {}) {
        this.checkRequiredCredentials ();
        const messageHash = 'authenticated';
        const client = this.client (url);
        const future = client.reusableFuture (messageHash);
        const authenticated = this.safeValue (client.subscriptions, messageHash);
        if (authenticated === undefined) {
            const request: Dict = {
                'id': this.uuid (),
                'operation': 'Authenticate',
                'data': {
                    'userKey': this.secret,
                    'apiKey': this.apiKey,
                },
            };
            this.watch (url, messageHash, this.extend (request, params), messageHash);
        }
        return await future;
    }

    /**
     * @method
     * @name etoro#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://api-portal.etoro.com/core/websocket/topics.md
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure](https://docs.ccxt.com/?id=ticker-structure)
     */
    override async watchTicker (symbol: string, params: Dict = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const tickers = await this.watchTickers ([ market['symbol'] ], params);
        return this.safeDict (tickers, market['symbol']) as Ticker;
    }

    /**
     * @method
     * @name etoro#watchTickers
     * @description watches price tickers for multiple markets, the spot and the swap market of an instrument share the same price feed
     * @see https://api-portal.etoro.com/core/websocket/topics.md
     * @param {string[]} symbols unified symbols of the markets to fetch the ticker for, required
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures](https://docs.ccxt.com/?id=ticker-structure)
     */
    override async watchTickers (symbols: Strings = undefined, params: Dict = {}): Promise<Tickers> {
        await this.loadMarkets ();
        if (symbols === undefined) {
            throw new ArgumentsRequired (this.id + ' watchTickers() requires a symbols argument');
        }
        const marketSymbols = this.marketSymbols (symbols, undefined, false);
        const ticker = await this.subscribeInstruments (marketSymbols, 'ticker', params);
        if (this.newUpdates) {
            const result: Dict = {};
            result[ticker['symbol']] = ticker;
            return result;
        }
        return this.filterByArray (this.tickers, 'symbol', marketSymbols);
    }

    /**
     * @method
     * @name etoro#watchBidsAsks
     * @description watches best bid & ask for symbols, the spot and the swap market of an instrument share the same price feed
     * @see https://api-portal.etoro.com/core/websocket/topics.md
     * @param {string[]} symbols unified symbols of the markets to fetch the bids and asks for, required
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures](https://docs.ccxt.com/?id=ticker-structure)
     */
    override async watchBidsAsks (symbols: Strings = undefined, params: Dict = {}): Promise<Tickers> {
        await this.loadMarkets ();
        if (symbols === undefined) {
            throw new ArgumentsRequired (this.id + ' watchBidsAsks() requires a symbols argument');
        }
        const marketSymbols = this.marketSymbols (symbols, undefined, false);
        const ticker = await this.subscribeInstruments (marketSymbols, 'bidask', params);
        if (this.newUpdates) {
            const result: Dict = {};
            result[ticker['symbol']] = ticker;
            return result;
        }
        return this.filterByArray (this.bidsasks, 'symbol', marketSymbols);
    }

    /**
     * @method
     * @name etoro#subscribeInstruments
     * @description subscribes to the rates of the instruments, shared by watchTickers and watchBidsAsks
     * @ignore
     * @param {string[]} marketSymbols unified market symbols
     * @param {string} prefix 'ticker' or 'bidask'
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} the first updated ticker
     */
    async subscribeInstruments (marketSymbols: string[], prefix: string, params: Dict = {}) {
        const url = this.getWsUrl ();
        await this.authenticate (url);
        const client = this.client (url);
        const topics: string[] = [];
        const missingTopics: string[] = [];
        const messageHashes: string[] = [];
        const markers: string[] = [];
        for (let i = 0; i < marketSymbols.length; i++) {
            const market = this.market (marketSymbols[i]);
            const topic = 'instrument:' + market['id'];
            if (!this.inArray (topic, topics)) {
                topics.push (topic);
                // the server rejects the whole request if one of the topics is already subscribed
                if (this.safeValue (client.subscriptions, topic) === undefined) {
                    missingTopics.push (topic);
                }
            }
            const messageHash = prefix + ':' + market['symbol'];
            messageHashes.push (messageHash);
            // marks the symbol as watched, an instrument topic is unsubscribed when none of its symbols is watched
            const marker = 'sub:' + messageHash;
            client.subscriptions[marker] = true;
            markers.push (marker);
        }
        const requestId = this.uuid ();
        const request: Dict = {
            'id': requestId,
            'operation': 'Subscribe',
            'data': {
                'topics': missingTopics,
                'snapshot': true,
            },
        };
        const subscription: Dict = {
            'id': requestId,
            'topics': missingTopics,
            'messageHashes': messageHashes,
            'markers': markers,
        };
        return await this.watchMultiple (url, messageHashes, this.extend (request, params), topics, subscription);
    }

    /**
     * @method
     * @name etoro#unWatchTicker
     * @description unWatches a price ticker
     * @see https://api-portal.etoro.com/core/websocket/topics.md
     * @param {string} symbol unified symbol of the market to stop watching
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {boolean} true once the subscription is removed
     */
    override async unWatchTicker (symbol: string, params: Dict = {}): Promise<any> {
        return await this.unWatchTickers ([ symbol ], params);
    }

    /**
     * @method
     * @name etoro#unWatchTickers
     * @description unWatches price tickers for multiple markets
     * @see https://api-portal.etoro.com/core/websocket/topics.md
     * @param {string[]} symbols unified symbols of the markets to stop watching, required
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {boolean} true once the subscription is removed
     */
    override async unWatchTickers (symbols: Strings = undefined, params: Dict = {}): Promise<any> {
        await this.loadMarkets ();
        if (symbols === undefined) {
            throw new ArgumentsRequired (this.id + ' unWatchTickers() requires a symbols argument');
        }
        const marketSymbols = this.marketSymbols (symbols, undefined, false);
        return await this.unsubscribeInstruments (marketSymbols, 'ticker', params);
    }

    /**
     * @method
     * @name etoro#unWatchBidsAsks
     * @description unWatches best bid & ask for symbols
     * @see https://api-portal.etoro.com/core/websocket/topics.md
     * @param {string[]} symbols unified symbols of the markets to stop watching, required
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {boolean} true once the subscription is removed
     */
    override async unWatchBidsAsks (symbols: Strings = undefined, params: Dict = {}): Promise<any> {
        await this.loadMarkets ();
        if (symbols === undefined) {
            throw new ArgumentsRequired (this.id + ' unWatchBidsAsks() requires a symbols argument');
        }
        const marketSymbols = this.marketSymbols (symbols, undefined, false);
        return await this.unsubscribeInstruments (marketSymbols, 'bidask', params);
    }

    /**
     * @method
     * @name etoro#unsubscribeInstruments
     * @description stops watching the rates of the instruments, an instrument topic is unsubscribed only when no ticker or bid/ask stream of its markets is watched anymore
     * @ignore
     * @param {string[]} marketSymbols unified market symbols
     * @param {string} prefix 'ticker' or 'bidask'
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {boolean} true once the subscription is removed
     */
    async unsubscribeInstruments (marketSymbols: string[], prefix: string, params: Dict = {}): Promise<any> {
        const url = this.getWsUrl ();
        await this.authenticate (url);
        const client = this.client (url);
        const marketIds: string[] = [];
        for (let i = 0; i < marketSymbols.length; i++) {
            const symbol = marketSymbols[i];
            const messageHash = prefix + ':' + symbol;
            const marker = 'sub:' + messageHash;
            if (marker in client.subscriptions) {
                delete client.subscriptions[marker];
            }
            this.cleanUnsubscription (client, messageHash, undefined);
            const marketId = this.safeString (this.market (symbol), 'id', '');
            if (!this.inArray (marketId, marketIds)) {
                marketIds.push (marketId);
            }
        }
        const cacheTopic = (prefix === 'ticker') ? 'ticker' : 'bidsasks';
        this.cleanCache ({ 'topic': cacheTopic, 'symbols': marketSymbols });
        const topics: string[] = [];
        for (let i = 0; i < marketIds.length; i++) {
            const marketId = marketIds[i];
            // the spot and the swap market of an instrument share the topic
            const marketsById = this.safeList (this.markets_by_id, marketId, []);
            let stillWatched = false;
            for (let j = 0; j < marketsById.length; j++) {
                const sharedSymbol = this.safeString (marketsById[j], 'symbol');
                const sharedTickerKey = 'sub:ticker:' + sharedSymbol;
                const sharedBidAskKey = 'sub:bidask:' + sharedSymbol;
                if ((sharedTickerKey in client.subscriptions) || (sharedBidAskKey in client.subscriptions)) {
                    stillWatched = true;
                    break;
                }
            }
            if (!stillWatched) {
                topics.push ('instrument:' + marketId);
            }
        }
        return await this.unsubscribeTopics (url, topics, params);
    }

    /**
     * @method
     * @name etoro#unsubscribeTopics
     * @description sends an unsubscribe request for the topics
     * @ignore
     * @param {string} url the websocket url
     * @param {string[]} topics the topics to unsubscribe from
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {boolean} true once the server confirms the unsubscription
     */
    async unsubscribeTopics (url: string, topics: string[], params: Dict = {}): Promise<any> {
        const numTopics = topics.length;
        if (numTopics === 0) {
            return true;
        }
        const messageHashes: string[] = [];
        for (let i = 0; i < numTopics; i++) {
            messageHashes.push ('unsubscribe:' + topics[i]);
        }
        const requestId = this.uuid ();
        const request: Dict = {
            'id': requestId,
            'operation': 'Unsubscribe',
            'data': {
                'topics': topics,
            },
        };
        const subscription: Dict = {
            'id': requestId,
            'topics': topics,
            'messageHashes': messageHashes,
            'unsubscribe': true,
        };
        return await this.watchMultiple (url, messageHashes, this.extend (request, params), messageHashes, subscription);
    }

    handleTicker (client: Client, item: Dict, content: Dict) {
        //
        // snapshot, the first message after subscribing
        //
        //     {
        //         "topic": "instrument:100000",
        //         "content": "{\"InstrumentID\":\"100000\",\"Ask\":\"60499.96\",\"Bid\":\"60499.95\",\"LastExecution\":\"60499.95\",\"Date\":\"2026-11-26T16:50:14.8003652Z\",\"PriceRateID\":\"166301248746\",\"IsMarketOpen\":\"true\",\"AllowBuy\":\"true\",\"AllowSell\":\"true\",\"IsExchangeOpen\":\"false\",...}",
        //         "id": "d77117c1-4e3e-4cd8-abf6-1b308117c258",
        //         "type": "Snapshot"
        //     }
        //
        // update, only the changed fields are sent
        //
        //     {
        //         "topic": "instrument:100000",
        //         "content": "{\"Ask\":\"60436.49\",\"Bid\":\"60436.48\",\"LastExecution\":\"60436.48\",\"Date\":\"2026-11-26T16:55:58.871447Z\",\"PriceRateID\":\"166301566340\",...}",
        //         "id": "f1992278-2c4a-4b8f-92d6-8b99f5e1cb00",
        //         "type": "Trading.Instrument.Rate"
        //     }
        //
        const topic = this.safeString (item, 'topic', '');
        const parts = topic.split (':');
        const marketId = this.safeString (parts, 1);
        const markets = this.safeList (this.markets_by_id, marketId, []);
        for (let i = 0; i < markets.length; i++) {
            const market = this.safeDict (markets, i, {});
            const symbol: string = market['symbol'];
            // merge the partial update into the previous state of the instrument
            let previous = this.safeDict (this.tickers, symbol);
            if (previous === undefined) {
                previous = this.safeDict (this.bidsasks, symbol, {});
            }
            const previousInfo = this.safeDict (previous, 'info', {});
            const merged = this.extend (previousInfo, content);
            const ticker = this.parseWsTicker (merged, market as Market);
            const tickerKey = 'sub:ticker:' + symbol;
            const bidAskKey = 'sub:bidask:' + symbol;
            const tickerWatched = (tickerKey in client.subscriptions);
            const bidAskWatched = (bidAskKey in client.subscriptions);
            if (tickerWatched || !bidAskWatched) {
                this.tickers[symbol] = ticker;
                client.resolve (ticker, 'ticker:' + symbol);
            }
            if (bidAskWatched) {
                this.bidsasks[symbol] = ticker;
                client.resolve (ticker, 'bidask:' + symbol);
            }
        }
    }

    parseWsTicker (ticker: Dict, market: Market = undefined): Ticker {
        const marketId = this.safeString (ticker, 'InstrumentID');
        const marketResolved = this.safeEtoroMarket (marketId, undefined, market);
        const timestamp = this.parse8601 (this.safeString (ticker, 'Date'));
        const last = this.safeString (ticker, 'LastExecution');
        return this.safeTicker ({
            'symbol': marketResolved['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': undefined,
            'low': undefined,
            'bid': this.safeString (ticker, 'Bid'),
            'bidVolume': undefined,
            'ask': this.safeString (ticker, 'Ask'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': undefined,
            'markPrice': undefined,
            'indexPrice': undefined,
            'info': ticker,
        }, marketResolved);
    }

    /**
     * @method
     * @name etoro#watchOrders
     * @description watches information on multiple orders made by the user, the demo account is used in sandbox mode
     * @see https://api-portal.etoro.com/core/websocket/topics.md
     * @param {string} [symbol] unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures](https://docs.ccxt.com/?id=order-structure)
     */
    override async watchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Order[]> {
        await this.loadMarkets ();
        let messageHash = 'orders';
        let marketSymbol: Str = undefined;
        if (symbol !== undefined) {
            const market = this.market (symbol);
            marketSymbol = market['symbol'];
            messageHash = messageHash + ':' + marketSymbol;
        }
        const orders = await this.watchPrivate ([ messageHash ], 'orders', params);
        let limitResolved = limit;
        if (this.newUpdates) {
            limitResolved = orders.getLimit (marketSymbol, limit);
        }
        return this.filterBySymbolSinceLimit (orders, marketSymbol, since, limitResolved, true);
    }

    /**
     * @method
     * @name etoro#unWatchOrders
     * @description unWatches information on multiple orders made by the user
     * @see https://api-portal.etoro.com/core/websocket/topics.md
     * @param {string} [symbol] not supported, all markets are unwatched at once
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {boolean} true once the subscription is removed
     */
    override async unWatchOrders (symbol: Str = undefined, params: Dict = {}): Promise<any> {
        if (symbol !== undefined) {
            throw new NotSupported (this.id + ' unWatchOrders() does not support a symbol argument, unWatch from all markets only');
        }
        return await this.unWatchPrivate ('orders', params);
    }

    /**
     * @method
     * @name etoro#watchMyTrades
     * @description watches the fills of the orders made by the user, every opening or closing execution of a position is a trade, the demo account is used in sandbox mode
     * @see https://api-portal.etoro.com/core/websocket/topics.md
     * @param {string} [symbol] unified market symbol of the market trades were made in
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures](https://docs.ccxt.com/?id=trade-structure)
     */
    override async watchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        let messageHash = 'myTrades';
        let marketSymbol: Str = undefined;
        if (symbol !== undefined) {
            const market = this.market (symbol);
            marketSymbol = market['symbol'];
            messageHash = messageHash + ':' + marketSymbol;
        }
        const trades = await this.watchPrivate ([ messageHash ], 'myTrades', params);
        let limitResolved = limit;
        if (this.newUpdates) {
            limitResolved = trades.getLimit (marketSymbol, limit);
        }
        return this.filterBySymbolSinceLimit (trades, marketSymbol, since, limitResolved, true);
    }

    /**
     * @method
     * @name etoro#unWatchMyTrades
     * @description unWatches the fills of the orders made by the user
     * @see https://api-portal.etoro.com/core/websocket/topics.md
     * @param {string} [symbol] not supported, all markets are unwatched at once
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {boolean} true once the subscription is removed
     */
    override async unWatchMyTrades (symbol: Str = undefined, params: Dict = {}): Promise<any> {
        if (symbol !== undefined) {
            throw new NotSupported (this.id + ' unWatchMyTrades() does not support a symbol argument, unWatch from all markets only');
        }
        return await this.unWatchPrivate ('myTrades', params);
    }

    /**
     * @method
     * @name etoro#watchPositions
     * @description watches the open positions, the positions are fetched with rest first and updated by the executions of the orders, the demo account is used in sandbox mode
     * @see https://api-portal.etoro.com/core/websocket/topics.md
     * @param {string[]} [symbols] list of unified market symbols
     * @param {int} [since] the earliest time in ms to fetch positions for
     * @param {int} [limit] the maximum number of positions to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structures](https://docs.ccxt.com/?id=position-structure)
     */
    override async watchPositions (symbols: Strings = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Position[]> {
        await this.loadMarkets ();
        const marketSymbols = this.marketSymbols (symbols);
        const url = this.getWsUrl ();
        await this.authenticate (url);
        const client = this.client (url);
        this.setPositionsCache (client);
        const fetchPositionsSnapshot = this.handleOption ('watchPositions', 'fetchPositionsSnapshot', true);
        const awaitPositionsSnapshot = this.handleOption ('watchPositions', 'awaitPositionsSnapshot', true);
        if (fetchPositionsSnapshot && awaitPositionsSnapshot && (this.positions === undefined)) {
            const snapshot = await client.future ('fetchPositionsSnapshot');
            return this.filterBySymbolsSinceLimit (snapshot, marketSymbols, since, limit, true);
        }
        const messageHashes: string[] = [];
        if (marketSymbols === undefined) {
            messageHashes.push ('positions');
        } else {
            for (let i = 0; i < marketSymbols.length; i++) {
                messageHashes.push ('positions:' + marketSymbols[i]);
            }
        }
        const newPositions = await this.watchPrivate (messageHashes, 'positions', params);
        if (this.newUpdates) {
            return this.filterBySymbolsSinceLimit (newPositions, marketSymbols, since, limit, true);
        }
        return this.filterBySymbolsSinceLimit (this.positions, marketSymbols, since, limit, true);
    }

    setPositionsCache (client: Client) {
        if (this.positions !== undefined) {
            return;
        }
        const fetchPositionsSnapshot = this.handleOption ('watchPositions', 'fetchPositionsSnapshot', true);
        if (fetchPositionsSnapshot) {
            const messageHash = 'fetchPositionsSnapshot';
            if (!(messageHash in client.futures)) {
                client.future (messageHash);
                this.spawn (this.loadPositionsSnapshot, client, messageHash);
            }
        } else {
            const limit = this.safeInteger (this.options, 'positionsLimit', 1000);
            this.positions = new ArrayCacheBySymbolById (limit);
        }
    }

    async loadPositionsSnapshot (client: Client, messageHash: string) {
        const positions = await this.fetchPositions ();
        const limit = this.safeInteger (this.options, 'positionsLimit', 1000);
        this.positions = new ArrayCacheBySymbolById (limit);
        const cache = this.positions;
        for (let i = 0; i < positions.length; i++) {
            cache.append (positions[i]);
        }
        // don't remove the future from the .futures cache
        if (messageHash in client.futures) {
            const future = client.futures[messageHash];
            future.resolve (cache);
            client.resolve (cache, 'positions');
        }
    }

    /**
     * @method
     * @name etoro#unWatchPositions
     * @description unWatches the positions
     * @see https://api-portal.etoro.com/core/websocket/topics.md
     * @param {string[]} [symbols] not supported, all markets are unwatched at once
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {boolean} true once the subscription is removed
     */
    override async unWatchPositions (symbols: Strings = undefined, params: Dict = {}): Promise<any> {
        if (symbols !== undefined) {
            throw new NotSupported (this.id + ' unWatchPositions() does not support a symbols argument, unWatch from all markets only');
        }
        return await this.unWatchPrivate ('positions', params);
    }

    /**
     * @method
     * @name etoro#watchPrivate
     * @description subscribes to the private topic of the account, shared by watchOrders, watchMyTrades and watchPositions
     * @ignore
     * @param {string[]} messageHashes the message hashes to wait for
     * @param {string} kind 'orders', 'myTrades' or 'positions'
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} the updated cache
     */
    async watchPrivate (messageHashes: string[], kind: string, params: Dict = {}) {
        const url = this.getWsUrl ();
        await this.authenticate (url);
        const client = this.client (url);
        // marks the stream as watched, the private topic is unsubscribed when none of the streams is watched
        const marker = 'sub:private:' + kind;
        client.subscriptions[marker] = true;
        const topic = this.getPrivateTopic ();
        const requestId = this.uuid ();
        const request: Dict = {
            'id': requestId,
            'operation': 'Subscribe',
            'data': {
                'topics': [ topic ],
                'snapshot': false,
            },
        };
        const subscription: Dict = {
            'id': requestId,
            'topics': [ topic ],
            'messageHashes': messageHashes,
            'markers': [ marker ],
        };
        return await this.watchMultiple (url, messageHashes, this.extend (request, params), [ topic ], subscription);
    }

    /**
     * @method
     * @name etoro#unWatchPrivate
     * @description stops watching a stream of the private topic, the topic is unsubscribed when none of the private streams is watched anymore
     * @ignore
     * @param {string} kind 'orders', 'myTrades' or 'positions'
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {boolean} true once the subscription is removed
     */
    async unWatchPrivate (kind: string, params: Dict = {}): Promise<any> {
        await this.loadMarkets ();
        const url = this.getWsUrl ();
        await this.authenticate (url);
        const client = this.client (url);
        const marker = 'sub:private:' + kind;
        if (marker in client.subscriptions) {
            delete client.subscriptions[marker];
        }
        this.cleanUnsubscription (client, kind, undefined, true);
        this.cleanCache ({ 'topic': kind });
        const kinds = [ 'orders', 'myTrades', 'positions' ];
        for (let i = 0; i < kinds.length; i++) {
            const subscriptionKey = 'sub:private:' + kinds[i];
            if (subscriptionKey in client.subscriptions) {
                return true;
            }
        }
        return await this.unsubscribeTopics (url, [ this.getPrivateTopic () ], params);
    }

    handleOrder (client: Client, item: Dict, content: Dict) {
        //
        //     {
        //         "topic": "private:demo",
        //         "content": "{\"orderId\":396863001,\"accountId\":34374239,\"action\":\"open\",\"transaction\":\"buy\",\"orderType\":\"mkt\",\"eToroOrderType\":\"17\",\"requestType\":\"amount\",\"orderUpdateType\":\"created\",\"updateTime\":\"2026-11-26T16:51:00.3019409\",\"orderState\":\"waitingForMarket\",\"asset\":{\"instrumentId\":1001,\"symbol\":\"\",\"side\":\"long\",\"settlementType\":\"real\",\"leverage\":1,\"currency\":\"USD\"},...}",
        //         "id": "94baef8d-29c2-4148-a0c5-edc0a58854fb",
        //         "type": "OrderEvent"
        //     }
        //
        if (this.orders === undefined) {
            const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
            this.orders = new ArrayCacheBySymbolById (limit);
        }
        const orders = this.orders;
        // the settlement type is "na" in some updates (e.g. cancelation), keep the market of the earlier updates then
        const orderId = this.safeString (content, 'orderId');
        let market: Market = undefined;
        for (let i = 0; i < orders.length; i++) {
            const cached = orders[i];
            const cachedSymbol = this.safeString (cached, 'symbol');
            if ((this.safeString (cached, 'id') === orderId) && (cachedSymbol !== undefined)) {
                market = this.safeDict (this.markets, cachedSymbol) as Market;
                if (market !== undefined) {
                    break;
                }
            }
        }
        const order = this.parseWsOrder (content, market);
        orders.append (order);
        const symbol = this.safeString (order, 'symbol');
        if (symbol !== undefined) {
            client.resolve (orders, 'orders:' + symbol);
        }
        client.resolve (orders, 'orders');
        const executions = this.safeList (content, 'positionsExecutions', []);
        const numExecutions = executions.length;
        if (numExecutions > 0) {
            this.handleMyTrades (client, executions, order);
            this.handlePositions (client, executions);
        }
    }

    handleMyTrades (client: Client, executions: Dict[], order: Order) {
        if (this.myTrades === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            this.myTrades = new ArrayCacheBySymbolById (limit);
        }
        const trades = this.myTrades;
        const symbols: Dict = {};
        for (let i = 0; i < executions.length; i++) {
            const execution = this.extend (executions[i], {
                'orderId': this.safeString (order, 'id'),
                'orderType': this.safeString (order, 'type'),
                'orderSide': this.safeString (order, 'side'),
            });
            const trade = this.parseWsTrade (execution);
            trade['info'] = executions[i];
            const tradeSymbol = this.safeString (trade, 'symbol');
            if ((tradeSymbol === undefined) || (trade['amount'] === undefined)) {
                continue;
            }
            trades.append (trade);
            symbols[tradeSymbol] = true;
        }
        const keys = Object.keys (symbols);
        const numKeys = keys.length;
        if (numKeys === 0) {
            return;
        }
        for (let i = 0; i < numKeys; i++) {
            client.resolve (trades, 'myTrades:' + keys[i]);
        }
        client.resolve (trades, 'myTrades');
    }

    override parseWsTrade (trade: Dict, market: Market = undefined): Trade {
        //
        // a position execution of an order event, extended with the orderId, the orderType and the orderSide of the order
        //
        //     {
        //         "positionId": 3650747611,
        //         "positionUpdateType": "open",
        //         "updateTime": "2026-11-26T14:21:24.857",
        //         "positionState": "open",
        //         "asset": { "instrumentId": 1202, "symbol": "", "side": "long", "settlementType": "real", "leverage": 1, "currency": "EUR" },
        //         "marginCurrency": "USD",
        //         "initialMargin": 14.98,
        //         "margin": 14.98,
        //         "openingData": { "orderId": 396858465, "executionTime": "2026-11-26T14:21:24.8669768", "units": 0.070703, "contracts": 0.070703, "avgPrice": 192.9, "fees": 1, "openTime": "2026-11-26T14:21:24.8669768" },
        //         "closingData": null,
        //         "remainingUnits": 0.070703,
        //         "remainingContracts": 0.070703
        //     }
        //
        const asset = this.safeDict (trade, 'asset', {});
        const marketId = this.safeString2 (asset, 'instrumentId', 'instrumentID');
        const marketResolved = this.safeEtoroMarket (marketId, this.safeString (asset, 'settlementType'), market);
        const openingData = this.safeDict (trade, 'openingData');
        const closingData = this.safeDict (trade, 'closingData');
        const isOpen = (openingData !== undefined);
        const data = this.safeDict2 (trade, 'openingData', 'closingData', {});
        const timestamp = this.parse8601 (this.safeString (data, 'executionTime'));
        let amount = this.safeString (data, 'units');
        if (marketResolved['future']) {
            amount = this.safeString (data, 'contracts', amount);
        }
        let side = this.safeString (trade, 'orderSide');
        if (side === undefined) {
            const direction = this.safeString (asset, 'side');
            if (isOpen) {
                side = (direction === 'short') ? 'sell' : 'buy';
            } else if (closingData !== undefined) {
                side = (direction === 'short') ? 'buy' : 'sell';
            }
        }
        const feeCost = this.safeString (data, 'fees');
        let fee = undefined;
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'currency': this.safeString (trade, 'marginCurrency', 'USD'),
            };
        }
        const positionId = this.safeString (trade, 'positionId');
        const tradeSide = (isOpen) ? 'open' : 'close';
        return this.safeTrade ({
            'info': trade,
            'id': positionId + '-' + tradeSide,
            'order': this.safeString2 (data, 'orderId', 'orderID', this.safeString (trade, 'orderId')),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': marketResolved['symbol'],
            'type': this.safeString (trade, 'orderType', 'market'),
            'side': side,
            'takerOrMaker': 'taker',
            'price': this.safeString (data, 'avgPrice'),
            'amount': amount,
            'cost': undefined,
            'fee': fee,
        }, this.safeMarket (undefined, marketResolved));
    }

    handlePositions (client: Client, executions: Dict[]) {
        if (this.positions === undefined) {
            // the positions are not watched or the snapshot is still loading
            return;
        }
        const cache = this.positions;
        const newPositions: Position[] = [];
        for (let i = 0; i < executions.length; i++) {
            const execution = executions[i];
            const positionId = this.safeString (execution, 'positionId', '');
            let previous: NullableDict = undefined;
            const symbolKeys = Object.keys (cache.hashmap);
            for (let j = 0; j < symbolKeys.length; j++) {
                const byId = this.safeDict (cache.hashmap, symbolKeys[j], {});
                previous = this.safeDict (byId, positionId);
                if (previous !== undefined) {
                    break;
                }
            }
            const position = this.parseWsPosition (execution, previous);
            if (position['symbol'] === undefined) {
                continue;
            }
            cache.append (position);
            newPositions.push (position);
        }
        const numNewPositions = newPositions.length;
        if (numNewPositions === 0) {
            return;
        }
        // symbols of swap markets contain a colon, so the symbols are collected from the positions instead of the message hashes
        const symbols: string[] = [];
        for (let i = 0; i < numNewPositions; i++) {
            const symbol = this.safeString (newPositions[i], 'symbol', '');
            if (!this.inArray (symbol, symbols)) {
                symbols.push (symbol);
            }
        }
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const positions = this.filterBySymbolsSinceLimit (newPositions, [ symbol ]);
            client.resolve (positions, 'positions:' + symbol);
        }
        client.resolve (newPositions, 'positions');
    }

    parseWsPosition (position: Dict, previous: NullableDict = undefined): Position {
        //
        // a position execution of an order event, see parseWsTrade
        //
        // the executions carry only the opening or the closing data, the rest is taken from the previous state of the position
        //
        const asset = this.safeDict (position, 'asset', {});
        const marketId = this.safeString2 (asset, 'instrumentId', 'instrumentID');
        const marketResolved = this.safeEtoroMarket (marketId, this.safeString (asset, 'settlementType'));
        const openingData = this.safeDict (position, 'openingData');
        const closingData = this.safeDict (position, 'closingData');
        const isFuture = marketResolved['future'];
        let contracts = this.safeString (position, 'remainingUnits');
        if (isFuture) {
            contracts = this.safeString (position, 'remainingContracts', contracts);
        }
        let entryPrice = this.safeString (previous, 'entryPrice');
        let timestamp = this.safeInteger (previous, 'timestamp');
        if (openingData !== undefined) {
            entryPrice = this.safeString (openingData, 'avgPrice', entryPrice);
            timestamp = this.parse8601 (this.safeString2 (openingData, 'openTime', 'executionTime'));
        }
        let realizedPnl: Str = undefined;
        const markPrice = this.safeString (previous, 'markPrice');
        if (closingData !== undefined) {
            realizedPnl = this.safeString (closingData, 'acctCcyReturn');
        }
        const leverage = this.safeString (asset, 'leverage', this.safeString (previous, 'leverage'));
        let initialMarginPercentage: Str = undefined;
        if ((leverage !== undefined) && !Precise.stringEq (leverage, '0')) {
            initialMarginPercentage = Precise.stringDiv ('1', leverage);
        }
        const margin = this.safeString (position, 'margin', this.safeString (previous, 'initialMargin'));
        let notional: Str = undefined;
        const notionalPrice = (markPrice !== undefined) ? markPrice : entryPrice;
        if ((contracts !== undefined) && (notionalPrice !== undefined)) {
            notional = Precise.stringMul (contracts, notionalPrice);
        }
        let side = this.safeString (asset, 'side');
        if ((side !== 'long') && (side !== 'short')) {
            side = this.safeString (previous, 'side');
        }
        const lastUpdateTimestamp = this.parse8601 (this.safeString (position, 'updateTime'));
        if (timestamp === undefined) {
            timestamp = lastUpdateTimestamp;
        }
        return this.safePosition ({
            'info': position,
            'id': this.safeString (position, 'positionId'),
            'symbol': marketResolved['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastUpdateTimestamp': lastUpdateTimestamp,
            'initialMargin': this.parseNumber (margin),
            'initialMarginPercentage': this.parseNumber (initialMarginPercentage),
            'maintenanceMargin': undefined,
            'maintenanceMarginPercentage': undefined,
            'entryPrice': this.parseNumber (entryPrice),
            'notional': this.parseNumber (notional),
            'leverage': this.parseNumber (leverage),
            'unrealizedPnl': undefined,
            'realizedPnl': this.parseNumber (realizedPnl),
            'contracts': this.parseNumber (contracts),
            'contractSize': this.safeNumber (marketResolved, 'contractSize', this.parseNumber ('1')),
            'marginRatio': undefined,
            'liquidationPrice': undefined,
            'markPrice': this.parseNumber (markPrice),
            'lastPrice': undefined,
            'collateral': this.parseNumber (margin),
            'marginMode': 'isolated',
            'side': side,
            'percentage': undefined,
            'hedged': true,
            'stopLossPrice': this.safeNumber (previous, 'stopLossPrice'),
            'takeProfitPrice': this.safeNumber (previous, 'takeProfitPrice'),
        });
    }

    override parseWsOrder (order: Dict, market: Market = undefined): Order {
        //
        //     {
        //         "orderId": 396863001,
        //         "relatedOrderIds": null,
        //         "accountId": 34374239,
        //         "action": "open",
        //         "transaction": "buy",
        //         "orderType": "mkt",
        //         "eToroOrderType": "17",
        //         "openActionType": "0",
        //         "closeActionType": null,
        //         "requestType": "amount",
        //         "orderUpdateType": "canceled",
        //         "updateTime": "2026-11-26T16:51:00.3",
        //         "orderState": "canceled",
        //         "asset": { "instrumentId": 1001, "symbol": "", "side": "long", "settlementType": "na", "leverage": 1, "currency": "USD" },
        //         "accountCurrency": "USD",
        //         "requestedTriggerRate": null,
        //         "requestedUnits": 0.039381,
        //         "requestedContracts": 0,
        //         "requestedAmount": 14.0000,
        //         "requestTime": "2026-11-26T16:51:00.203",
        //         "openStopLossRate": null,
        //         "openTakeProfitRate": null,
        //         "requestedStopLossType": "fixed",
        //         "positionsExecutions": [],
        //         "cancelledUnits": null,
        //         "remainingUnits": null,
        //         "totalFees": null,
        //         "errorMessage": null,
        //         "errorCode": null
        //     }
        //
        const asset = this.safeDict (order, 'asset', {});
        const settlementType = this.safeStringLower (asset, 'settlementType');
        const knownSettlementTypes = [ 'real', 'cfd', 'realfutures' ];
        let normalizedAsset = asset;
        if ((market !== undefined) && !this.inArray (settlementType, knownSettlementTypes)) {
            const resolvedMarket = this.safeMarket (undefined, market);
            normalizedAsset = this.extend (asset, {
                'settlementType': this.getSettlementType (resolvedMarket),
            });
        }
        // map the websocket fields onto the rest order shape
        const normalized = this.extend (order, {
            'type': this.safeString (order, 'orderType'),
            'status': {
                'id': this.safeString (order, 'orderState'),
                'errorCode': this.safeString (order, 'errorCode'),
                'errorMessage': this.safeString (order, 'errorMessage'),
            },
            'lastUpdate': this.safeString (order, 'updateTime'),
            'positionExecutions': this.safeList (order, 'positionsExecutions', []),
            'asset': normalizedAsset,
        });
        const result = this.parseOrder (normalized, market);
        result['info'] = order;
        return result;
    }

    findSubscriptionById (client: Client, requestId: Str): NullableDict {
        if (requestId === undefined) {
            return undefined;
        }
        const keys = Object.keys (client.subscriptions);
        for (let i = 0; i < keys.length; i++) {
            const subscription = client.subscriptions[keys[i]];
            if (this.isDictionary (subscription) && (this.safeString (subscription, 'id') === requestId)) {
                return subscription;
            }
        }
        return undefined;
    }

    rejectWsError (client: Client, message: Dict, messageHashes: string[]) {
        const errorCode = this.safeString (message, 'errorCode');
        const feedback = this.id + ' ' + this.json (message);
        const wsExceptions = this.safeDict (this.exceptions, 'ws', {});
        const exact = this.safeDict (wsExceptions, 'exact', {});
        try {
            this.throwExactlyMatchedException (exact, errorCode, feedback);
            throw new ExchangeError (feedback);
        } catch (e) {
            for (let i = 0; i < messageHashes.length; i++) {
                client.reject (e, messageHashes[i]);
            }
        }
    }

    handleOperationResponse (client: Client, message: Dict) {
        //
        //     {"id":"fe42443f-a218-4745-b7a2-acbde3cf6d61","success":true,"operation":"Authenticate"}
        //     {"success":false,"operation":"Authenticate","errorMessage":"Session is already authenticated","errorCode":"SessionAlreadyAuthenticated"}
        //     {"id":"1f6be205-9d0e-46cc-9303-86d0cc7cc926","success":false,"operation":"Subscribe","errorMessage":"Already subscribed to topic instrument:100000","errorCode":"TopicAlreadySubscribed"}
        //     {"id":"e0111049-1d79-449c-a65c-08bb26a0ad3e","success":false,"operation":"Unsubscribe","errorMessage":"Topic instrument:100000 is not subscribed","errorCode":"TopicNotSubscribed"}
        //
        const operation = this.safeString (message, 'operation');
        const success = this.safeBool (message, 'success', false);
        const errorCode = this.safeString (message, 'errorCode');
        if (operation === 'Authenticate') {
            const messageHash = 'authenticated';
            if (success || (errorCode === 'SessionAlreadyAuthenticated')) {
                // the resolved future is kept, so that later calls to authenticate () return immediately
                const future = this.safeValue (client.futures, messageHash);
                if (future !== undefined) {
                    future.resolve (true);
                }
            } else {
                this.rejectWsError (client, message, [ messageHash ]);
                if (messageHash in client.subscriptions) {
                    delete client.subscriptions[messageHash];
                }
            }
            return;
        }
        const subscription = this.findSubscriptionById (client, this.safeString (message, 'id'));
        if (subscription === undefined) {
            return;
        }
        const messageHashes = this.safeList (subscription, 'messageHashes', []);
        if (operation === 'Subscribe') {
            if (success || (errorCode === 'TopicAlreadySubscribed')) {
                return;
            }
            const topics = this.safeList (subscription, 'topics', []);
            for (let i = 0; i < topics.length; i++) {
                const topic = topics[i];
                if (topic in client.subscriptions) {
                    delete client.subscriptions[topic];
                }
            }
            const markers = this.safeList (subscription, 'markers', []);
            for (let i = 0; i < markers.length; i++) {
                const marker = markers[i];
                if (marker in client.subscriptions) {
                    delete client.subscriptions[marker];
                }
            }
            this.rejectWsError (client, message, messageHashes);
        } else if (operation === 'Unsubscribe') {
            if (success || (errorCode === 'TopicNotSubscribed')) {
                this.handleUnsubscription (client, subscription);
                return;
            }
            for (let i = 0; i < messageHashes.length; i++) {
                const messageHash = messageHashes[i];
                if (messageHash in client.subscriptions) {
                    delete client.subscriptions[messageHash];
                }
            }
            this.rejectWsError (client, message, messageHashes);
        }
    }

    handleUnsubscription (client: Client, subscription: Dict) {
        const topics = this.safeList (subscription, 'topics', []);
        for (let i = 0; i < topics.length; i++) {
            const topic = topics[i];
            if (topic in client.subscriptions) {
                delete client.subscriptions[topic];
            }
        }
        const messageHashes = this.safeList (subscription, 'messageHashes', []);
        for (let i = 0; i < messageHashes.length; i++) {
            this.cleanUnsubscription (client, undefined, messageHashes[i]);
        }
    }

    override handleMessage (client: Client, message: any) {
        //
        // the server sends a binary frame with a single null byte as a heartbeat
        //
        if (!this.isDictionary (message)) {
            return;
        }
        if (this.safeString (message, 'operation') !== undefined) {
            this.handleOperationResponse (client, message);
            return;
        }
        //
        //     {
        //         "messages": [
        //             { "topic": "instrument:100000", "content": "{...}", "id": "...", "type": "Trading.Instrument.Rate" }
        //         ]
        //     }
        //
        const messages = this.safeList (message, 'messages', []);
        for (let i = 0; i < messages.length; i++) {
            const item = this.safeDict (messages, i, {});
            const topic = this.safeString (item, 'topic', '');
            const messageType = this.safeString (item, 'type');
            const content = this.parseJson (this.safeString (item, 'content'));
            if (!this.isDictionary (content)) {
                continue;
            }
            if (topic.startsWith ('instrument:')) {
                this.handleTicker (client, item, content);
            } else if (topic.startsWith ('private') && (messageType === 'OrderEvent')) {
                // legacy order updates (Trading.OrderForOpen.Update, ...) duplicate the OrderEvent messages and are skipped
                this.handleOrder (client, item, content);
            }
        }
    }
}
