//  ---------------------------------------------------------------------------

import etoroRest from '../etoro.js';
import { ArgumentsRequired, AuthenticationError, BadRequest, BadSymbol, ExchangeError, PermissionDenied, RateLimitExceeded } from '../base/errors.js';
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
                'watchBalance': false,
                'watchBidsAsks': true,
                'unWatchBidsAsks': true,
                'watchMyTrades': true,
                'unWatchMyTrades': true,
                'watchOHLCV': false,
                'watchOHLCVForSymbols': false,
                'watchOrderBook': false,
                'watchOrderBookForSymbols': false,
                'watchOrders': true,
                'unWatchOrders': true,
                'watchPositions': true,
                'unWatchPositions': true,
                'watchTicker': true,
                'unWatchTicker': true,
                'watchTickers': true,
                'unWatchTickers': true,
                'watchTrades': false,
                'watchTradesForSymbols': false,
            },
            'urls': {
                'api': {
                    'ws': 'wss://ws.etoro.com/ws',
                },
                'test': {
                    'ws': 'wss://ws.etoro.com/ws',
                },
                'demo': {
                    'ws': 'wss://ws.etoro.com/ws',
                },
            },
            'options': {
                'ordersLimit': 1000,
                'tradesLimit': 1000,
                'positionsLimit': 1000,
                'watchTickers': {
                    'snapshot': true,
                },
                'watchPositions': {
                    'fetchPositionsSnapshot': true,
                    'awaitPositionsSnapshot': true,
                },
            },
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
                        'SubscribeFailed': BadSymbol,
                        'UnhandledException': ExchangeError,
                    },
                },
            },
        });
    }

    getWsUrl (): string {
        return this.safeString (this.urls['api'], 'ws', 'wss://ws.etoro.com/ws');
    }

    getPrivateTopic (params: Dict = {}): string {
        return this.isDemoMode (params) ? 'private:demo' : 'private';
    }

    async authenticate (url: string, params: Dict = {}) {
        this.checkRequiredCredentials ();
        const messageHash = 'authenticated';
        const client = this.client (url);
        const authState = this.safeValue (client.subscriptions, messageHash);
        if (authState === true) {
            return true;
        }
        const future = client.reusableFuture (messageHash);
        if (authState === undefined) {
            const request: Dict = {
                'id': this.uuid (),
                'operation': 'Authenticate',
                'data': {
                    'userKey': this.secret,
                    'apiKey': this.apiKey,
                },
            };
            this.watch (url, messageHash, request, messageHash, 'pending');
        }
        return await future;
    }

    async subscribeTopics (url: string, messageHashes: string[], topics: string[], subscribeHashes: string[], snapshot: boolean = true) {
        await this.authenticate (url);
        const client = this.client (url);
        if (!('activeTopics' in client.subscriptions)) {
            client.subscriptions['activeTopics'] = {};
        }
        const activeTopics = client.subscriptions['activeTopics'];
        const newTopics: string[] = [];
        for (let i = 0; i < topics.length; i++) {
            const topic = topics[i];
            if (!(topic in activeTopics) && !this.inArray (topic, newTopics)) {
                newTopics.push (topic);
            }
        }
        let request: NullableDict = undefined;
        if (newTopics.length > 0) {
            const requestId = this.uuid ();
            for (let i = 0; i < newTopics.length; i++) {
                activeTopics[newTopics[i]] = true;
            }
            request = {
                'id': requestId,
                'operation': 'Subscribe',
                'data': {
                    'topics': newTopics,
                    'snapshot': snapshot,
                },
            };
            if (!('pendingRequests' in client.subscriptions)) {
                client.subscriptions['pendingRequests'] = {};
            }
            const pendingRequests = client.subscriptions['pendingRequests'];
            pendingRequests[requestId] = {
                'messageHashes': messageHashes,
                'subscribeHashes': subscribeHashes,
                'topics': newTopics,
            };
        }
        return await this.watchMultiple (url, messageHashes, request, subscribeHashes);
    }

    async unsubscribeTopics (url: string, topics: string[]) {
        if (topics.length === 0) {
            return true;
        }
        if ((this.clients === undefined) || !(url in this.clients)) {
            return true;
        }
        const client = this.client (url);
        if (!client.isOpen ()) {
            return true;
        }
        const activeTopics = this.safeDict (client.subscriptions, 'activeTopics', {});
        const topicsToSend: string[] = [];
        for (let i = 0; i < topics.length; i++) {
            const topic = topics[i];
            if ((topic in activeTopics) && !this.inArray (topic, topicsToSend)) {
                topicsToSend.push (topic);
                delete activeTopics[topic];
            }
        }
        if (topicsToSend.length === 0) {
            return true;
        }
        await this.authenticate (url);
        const requestId = this.uuid ();
        const unsubHash = 'unsubscribe:' + requestId;
        const request: Dict = {
            'id': requestId,
            'operation': 'Unsubscribe',
            'data': {
                'topics': topicsToSend,
            },
        };
        return await this.watch (url, unsubHash, request, unsubHash);
    }

    /**
     * @method
     * @name etoro#watchTicker
     * @description watches a price ticker for a specific market via real-time instrument rate updates
     * @see https://api-portal.etoro.com/api-reference/websocket/instrument-rates
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.snapshot] true (default) to receive the current rate snapshot immediately on subscribe
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    override async watchTicker (symbol: string, params: Dict = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const resolvedSymbol = market['symbol'];
        const topic = 'instrument:' + market['id'];
        const messageHash = 'ticker:' + resolvedSymbol;
        const url = this.getWsUrl ();
        const options = this.safeDict (this.options, 'watchTickers', {});
        const snapshot = this.safeBool (params, 'snapshot', this.safeBool (options, 'snapshot', true));
        return await this.subscribeTopics (url, [ messageHash ], [ topic ], [ messageHash ], snapshot);
    }

    /**
     * @method
     * @name etoro#unWatchTicker
     * @description unWatches a price ticker for a specific market
     * @see https://api-portal.etoro.com/api-reference/websocket/instrument-rates
     * @param {string} symbol unified symbol of the market to unwatch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} unsubscription confirmation
     */
    override async unWatchTicker (symbol: string, params: Dict = {}): Promise<any> {
        return await this.unWatchTickers ([ symbol ], params);
    }

    /**
     * @method
     * @name etoro#watchTickers
     * @description watches price tickers for multiple specified markets via real-time instrument rate updates
     * @see https://api-portal.etoro.com/api-reference/websocket/instrument-rates
     * @param {string[]} symbols unified symbols of the markets to watch tickers for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.snapshot] true (default) to receive the current rate snapshot immediately on subscribe
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    override async watchTickers (symbols: Strings = undefined, params: Dict = {}): Promise<Tickers> {
        await this.loadMarkets ();
        const normalizedSymbols = this.marketSymbols (symbols, undefined, false);
        if ((normalizedSymbols === undefined) || (normalizedSymbols.length === 0)) {
            throw new ArgumentsRequired (this.id + ' watchTickers() requires a non-empty symbols argument');
        }
        const url = this.getWsUrl ();
        const topics: string[] = [];
        const messageHashes: string[] = [];
        for (let i = 0; i < normalizedSymbols.length; i++) {
            const market = this.market (normalizedSymbols[i]);
            const resolvedSymbol = market['symbol'];
            topics.push ('instrument:' + market['id']);
            messageHashes.push ('ticker:' + resolvedSymbol);
        }
        const options = this.safeDict (this.options, 'watchTickers', {});
        const snapshot = this.safeBool (params, 'snapshot', this.safeBool (options, 'snapshot', true));
        const ticker = await this.subscribeTopics (url, messageHashes, topics, messageHashes, snapshot);
        if (this.newUpdates) {
            const result: Dict = {};
            const tickerSymbol = this.safeString (ticker, 'symbol');
            if (tickerSymbol !== undefined) {
                result[tickerSymbol] = ticker;
            }
            return result;
        }
        return this.filterByArray (this.tickers, 'symbol', normalizedSymbols);
    }

    /**
     * @method
     * @name etoro#unWatchTickers
     * @description unWatches price tickers for multiple markets
     * @see https://api-portal.etoro.com/api-reference/websocket/instrument-rates
     * @param {string[]} symbols unified symbols of the markets to unwatch tickers for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} unsubscription confirmation
     */
    override async unWatchTickers (symbols: Strings = undefined, params: Dict = {}): Promise<any> {
        return await this.unWatchInstrumentStreams (symbols, 'ticker', params);
    }

    /**
     * @method
     * @name etoro#watchBidsAsks
     * @description watches best bid and ask prices for multiple specified markets
     * @see https://api-portal.etoro.com/api-reference/websocket/instrument-rates
     * @param {string[]} symbols unified symbols of the markets to watch bids and asks for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.snapshot] true (default) to receive the current rate snapshot immediately on subscribe
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    override async watchBidsAsks (symbols: Strings = undefined, params: Dict = {}): Promise<Tickers> {
        await this.loadMarkets ();
        const normalizedSymbols = this.marketSymbols (symbols, undefined, false);
        if ((normalizedSymbols === undefined) || (normalizedSymbols.length === 0)) {
            throw new ArgumentsRequired (this.id + ' watchBidsAsks() requires a non-empty symbols argument');
        }
        const url = this.getWsUrl ();
        const topics: string[] = [];
        const messageHashes: string[] = [];
        for (let i = 0; i < normalizedSymbols.length; i++) {
            const market = this.market (normalizedSymbols[i]);
            const resolvedSymbol = market['symbol'];
            topics.push ('instrument:' + market['id']);
            messageHashes.push ('bidask:' + resolvedSymbol);
        }
        const options = this.safeDict (this.options, 'watchTickers', {});
        const snapshot = this.safeBool (params, 'snapshot', this.safeBool (options, 'snapshot', true));
        const ticker = await this.subscribeTopics (url, messageHashes, topics, messageHashes, snapshot);
        if (this.newUpdates) {
            const result: Dict = {};
            const tickerSymbol = this.safeString (ticker, 'symbol');
            if (tickerSymbol !== undefined) {
                result[tickerSymbol] = ticker;
            }
            return result;
        }
        return this.filterByArray (this.bidsasks, 'symbol', normalizedSymbols);
    }

    /**
     * @method
     * @name etoro#unWatchBidsAsks
     * @description unWatches best bid and ask prices for multiple markets
     * @see https://api-portal.etoro.com/api-reference/websocket/instrument-rates
     * @param {string[]} symbols unified symbols of the markets to unwatch bids and asks for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} unsubscription confirmation
     */
    override async unWatchBidsAsks (symbols: Strings = undefined, params: Dict = {}): Promise<any> {
        return await this.unWatchInstrumentStreams (symbols, 'bidask', params);
    }

    async unWatchInstrumentStreams (symbols: Strings, prefix: string, params: Dict = {}): Promise<any> {
        await this.loadMarkets ();
        const normalizedSymbols = this.marketSymbols (symbols, undefined, false);
        if ((normalizedSymbols === undefined) || (normalizedSymbols.length === 0)) {
            throw new ArgumentsRequired (this.id + ' unWatch requires a non-empty symbols argument');
        }
        const url = this.getWsUrl ();
        const topicsToUnsub: string[] = [];
        const hasClient = (this.clients !== undefined) && (url in this.clients);
        const client = hasClient ? this.client (url) : undefined;
        for (let i = 0; i < normalizedSymbols.length; i++) {
            const market = this.market (normalizedSymbols[i]);
            const resolvedSymbol = market['symbol'];
            const subHash = prefix + ':' + resolvedSymbol;
            if (client !== undefined) {
                this.cleanUnsubscription (client, subHash, undefined);
            }
            if ((prefix === 'ticker') && (resolvedSymbol in this.tickers)) {
                delete this.tickers[resolvedSymbol];
            } else if ((prefix === 'bidask') && (resolvedSymbol in this.bidsasks)) {
                delete this.bidsasks[resolvedSymbol];
            }
            const marketId = market['id'];
            let stillNeeded = false;
            if (client !== undefined) {
                const sharedMarkets = this.safeList (this.markets_by_id, marketId, [ market ]);
                for (let j = 0; j < sharedMarkets.length; j++) {
                    const sharedSymbol = this.safeString (sharedMarkets[j], 'symbol');
                    if (sharedSymbol !== undefined) {
                        if ((('ticker:' + sharedSymbol) in client.subscriptions) || (('bidask:' + sharedSymbol) in client.subscriptions)) {
                            stillNeeded = true;
                            break;
                        }
                    }
                }
            }
            if (!stillNeeded) {
                const topic = 'instrument:' + marketId;
                topicsToUnsub.push (topic);
                if ((client !== undefined) && (marketId !== undefined) && ('rawTickers' in client.subscriptions)) {
                    const rawTickers = client.subscriptions['rawTickers'];
                    if ((rawTickers !== undefined) && (marketId in rawTickers)) {
                        delete rawTickers[marketId];
                    }
                }
            }
        }
        return await this.unsubscribeTopics (url, topicsToUnsub);
    }

    /**
     * @method
     * @name etoro#watchOrders
     * @description watches information on orders created, updated, filled, or canceled by the user
     * @see https://api-portal.etoro.com/api-reference/websocket/private-portfolio-updates
     * @param {string} [symbol] unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.demo] true to watch the demo account stream ('private:demo'), false for real ('private')
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    override async watchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Order[]> {
        await this.loadMarkets ();
        let resolvedSymbol: Str = undefined;
        const privateTopic = this.getPrivateTopic (params);
        let messageHash = 'orders:' + privateTopic;
        if (symbol !== undefined) {
            const market = this.market (symbol);
            resolvedSymbol = market['symbol'];
            messageHash = messageHash + ':' + resolvedSymbol;
        }
        const url = this.getWsUrl ();
        const subscribeHash = 'sub:' + privateTopic + ':orders';
        const orders = await this.subscribeTopics (url, [ messageHash ], [ privateTopic ], [ subscribeHash ], false);
        let limitResolved: Int = limit;
        if (this.newUpdates) {
            limitResolved = orders.getLimit (resolvedSymbol, limit);
        }
        return this.filterBySymbolSinceLimit (orders, resolvedSymbol, since, limitResolved, true);
    }

    /**
     * @method
     * @name etoro#unWatchOrders
     * @description unWatches user order updates
     * @see https://api-portal.etoro.com/api-reference/websocket/private-portfolio-updates
     * @param {string} [symbol] unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.demo] true for demo account stream, false for real
     * @returns {object} unsubscription confirmation
     */
    override async unWatchOrders (symbol: Str = undefined, params: Dict = {}): Promise<any> {
        return await this.unWatchPrivateChannel ('orders', symbol, params);
    }

    /**
     * @method
     * @name etoro#watchMyTrades
     * @description watches executed trade fills made by the user
     * @see https://api-portal.etoro.com/api-reference/websocket/private-portfolio-updates
     * @param {string} [symbol] unified market symbol of the market trades were made in
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.demo] true to watch the demo account stream ('private:demo'), false for real ('private')
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    override async watchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        let resolvedSymbol: Str = undefined;
        const privateTopic = this.getPrivateTopic (params);
        let messageHash = 'myTrades:' + privateTopic;
        if (symbol !== undefined) {
            const market = this.market (symbol);
            resolvedSymbol = market['symbol'];
            messageHash = messageHash + ':' + resolvedSymbol;
        }
        const url = this.getWsUrl ();
        const subscribeHash = 'sub:' + privateTopic + ':myTrades';
        const trades = await this.subscribeTopics (url, [ messageHash ], [ privateTopic ], [ subscribeHash ], false);
        let limitResolved: Int = limit;
        if (this.newUpdates) {
            limitResolved = trades.getLimit (resolvedSymbol, limit);
        }
        return this.filterBySymbolSinceLimit (trades, resolvedSymbol, since, limitResolved, true);
    }

    /**
     * @method
     * @name etoro#unWatchMyTrades
     * @description unWatches user trade fill updates
     * @see https://api-portal.etoro.com/api-reference/websocket/private-portfolio-updates
     * @param {string} [symbol] unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.demo] true for demo account stream, false for real
     * @returns {object} unsubscription confirmation
     */
    override async unWatchMyTrades (symbol: Str = undefined, params: Dict = {}): Promise<any> {
        return await this.unWatchPrivateChannel ('myTrades', symbol, params);
    }

    /**
     * @method
     * @name etoro#watchPositions
     * @description watch all open and newly opened/closed positions
     * @see https://api-portal.etoro.com/api-reference/websocket/private-portfolio-updates
     * @param {string[]} [symbols] list of unified market symbols to watch positions for
     * @param {int} [since] the earliest time in ms to fetch positions for
     * @param {int} [limit] the maximum number of positions to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.demo] true to watch the demo account stream ('private:demo'), false for real ('private')
     * @returns {object[]} a list of [position structures]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    override async watchPositions (symbols: Strings = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Position[]> {
        await this.loadMarkets ();
        const normalizedSymbols = this.marketSymbols (symbols);
        const privateTopic = this.getPrivateTopic (params);
        const url = this.getWsUrl ();
        const client = this.client (url);
        await this.authenticate (url);
        this.setPositionsCache (client, params);
        const fetchPositionsSnapshot = this.handleOption ('watchPositions', 'fetchPositionsSnapshot', true);
        const awaitPositionsSnapshot = this.handleOption ('watchPositions', 'awaitPositionsSnapshot', true);
        const subscribeHash = 'sub:' + privateTopic + ':positions';
        if ((fetchPositionsSnapshot === true) && (awaitPositionsSnapshot === true) && (this.positions === undefined)) {
            const snapshot = await client.future ('fetchPositionsSnapshot');
            return this.filterBySymbolsSinceLimit (snapshot, normalizedSymbols, since, limit, true);
        }
        const messageHashes: string[] = [];
        if ((normalizedSymbols !== undefined) && (normalizedSymbols.length > 0)) {
            for (let i = 0; i < normalizedSymbols.length; i++) {
                messageHashes.push ('positions:' + privateTopic + ':' + normalizedSymbols[i]);
            }
        } else {
            messageHashes.push ('positions:' + privateTopic);
        }
        const newPositions = await this.subscribeTopics (url, messageHashes, [ privateTopic ], [ subscribeHash ], false);
        if (this.newUpdates) {
            return newPositions;
        }
        return this.filterBySymbolsSinceLimit (this.positions, normalizedSymbols, since, limit, true);
    }

    setPositionsCache (client: Client, params: Dict = {}) {
        if (this.positions !== undefined) {
            return;
        }
        const fetchPositionsSnapshot = this.handleOption ('watchPositions', 'fetchPositionsSnapshot', true);
        if (fetchPositionsSnapshot === true) {
            const messageHash = 'fetchPositionsSnapshot';
            if (!(messageHash in client.futures)) {
                client.future (messageHash);
                this.spawn (this.loadPositionsSnapshot, client, messageHash, params);
            }
        } else {
            const limit = this.safeInteger (this.options, 'positionsLimit', 1000);
            this.positions = new ArrayCacheBySymbolById (limit);
        }
    }

    async loadPositionsSnapshot (client: Client, messageHash: string, params: Dict = {}) {
        const isDemo = this.isDemoMode (params);
        const positions = await this.fetchPositions (undefined, { 'demo': isDemo });
        const limit = this.safeInteger (this.options, 'positionsLimit', 1000);
        this.positions = new ArrayCacheBySymbolById (limit);
        const cache = this.positions;
        for (let i = 0; i < positions.length; i++) {
            cache.append (positions[i]);
        }
        if (messageHash in client.futures) {
            const future = client.futures[messageHash];
            future.resolve (cache);
        }
    }

    /**
     * @method
     * @name etoro#unWatchPositions
     * @description unWatches user position updates
     * @see https://api-portal.etoro.com/api-reference/websocket/private-portfolio-updates
     * @param {string[]} [symbols] list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.demo] true for demo account stream, false for real
     * @returns {object} unsubscription confirmation
     */
    override async unWatchPositions (symbols: Strings = undefined, params: Dict = {}): Promise<any> {
        await this.loadMarkets ();
        const normalizedSymbols = this.marketSymbols (symbols);
        const privateTopic = this.getPrivateTopic (params);
        const url = this.getWsUrl ();
        const hasClient = (this.clients !== undefined) && (url in this.clients);
        const client = hasClient ? this.client (url) : undefined;
        if (client !== undefined) {
            if ((normalizedSymbols !== undefined) && (normalizedSymbols.length > 0)) {
                for (let i = 0; i < normalizedSymbols.length; i++) {
                    this.cleanUnsubscription (client, 'positions:' + privateTopic + ':' + normalizedSymbols[i], undefined);
                }
            } else {
                this.cleanUnsubscription (client, 'positions:' + privateTopic, undefined, true);
                this.cleanUnsubscription (client, 'sub:' + privateTopic + ':positions', undefined);
                this.cleanCache ({ 'topic': 'positions' });
            }
        }
        if ((normalizedSymbols === undefined) || (normalizedSymbols.length === 0)) {
            return await this.maybeUnsubscribePrivateTopic (url, privateTopic);
        }
        return true;
    }

    async unWatchPrivateChannel (channel: string, symbol: Str = undefined, params: Dict = {}): Promise<any> {
        await this.loadMarkets ();
        const privateTopic = this.getPrivateTopic (params);
        const url = this.getWsUrl ();
        const hasClient = (this.clients !== undefined) && (url in this.clients);
        const client = hasClient ? this.client (url) : undefined;
        if (client !== undefined) {
            if (symbol !== undefined) {
                const market = this.market (symbol);
                this.cleanUnsubscription (client, channel + ':' + privateTopic + ':' + market['symbol'], undefined);
            } else {
                this.cleanUnsubscription (client, channel + ':' + privateTopic, undefined, true);
                this.cleanUnsubscription (client, 'sub:' + privateTopic + ':' + channel, undefined);
                this.cleanCache ({ 'topic': channel });
            }
        }
        if (symbol === undefined) {
            return await this.maybeUnsubscribePrivateTopic (url, privateTopic);
        }
        return true;
    }

    async maybeUnsubscribePrivateTopic (url: string, privateTopic: string): Promise<any> {
        if ((this.clients === undefined) || !(url in this.clients)) {
            return true;
        }
        const client = this.client (url);
        const prefix = 'sub:' + privateTopic + ':';
        const subKeys = Object.keys (client.subscriptions);
        for (let i = 0; i < subKeys.length; i++) {
            if (subKeys[i].indexOf (prefix) === 0) {
                return true;
            }
        }
        return await this.unsubscribeTopics (url, [ privateTopic ]);
    }

    createWsException (errorCode: Str, errorMessage: Str, message: Dict): ExchangeError {
        const feedback = this.id + ' ' + this.json (message);
        if (errorCode !== undefined) {
            const wsExceptions = this.safeDict (this.exceptions, 'ws', {});
            const exact = this.safeDict (wsExceptions, 'exact', {});
            const ExceptionClass = this.safeValue (exact, errorCode);
            if (ExceptionClass !== undefined) {
                return new ExceptionClass (feedback);
            }
        }
        return new ExchangeError (feedback);
    }

    handleControlMessage (client: Client, message: Dict) {
        //
        //     { "id": "ed72693c-...", "success": true, "operation": "Authenticate" }
        //     { "id": "ed72693c-...", "success": false, "operation": "Subscribe", "errorMessage": "...", "errorCode": "InvalidTopicName" }
        //
        const operation = this.safeString (message, 'operation');
        const id = this.safeString (message, 'id');
        const success = this.safeBool (message, 'success', false);
        const errorCode = this.safeString (message, 'errorCode');
        const errorMessage = this.safeString (message, 'errorMessage');
        if (operation === 'Authenticate') {
            if (success || (errorCode === 'SessionAlreadyAuthenticated')) {
                client.subscriptions['authenticated'] = true;
                client.resolve (message, 'authenticated');
            } else {
                if ('authenticated' in client.subscriptions) {
                    delete client.subscriptions['authenticated'];
                }
                const error = this.createWsException (errorCode, errorMessage, message);
                client.reject (error, 'authenticated');
            }
            return;
        }
        if (operation === 'Subscribe') {
            const pendingRequests = this.safeDict (client.subscriptions, 'pendingRequests', {});
            const pending = (id !== undefined) ? this.safeDict (pendingRequests, id) : undefined;
            if ((id !== undefined) && (id in pendingRequests)) {
                delete pendingRequests[id];
            }
            if (!success && (errorCode !== 'TopicAlreadySubscribed')) {
                const error = this.createWsException (errorCode, errorMessage, message);
                if (pending !== undefined) {
                    const activeTopics = this.safeDict (client.subscriptions, 'activeTopics', {});
                    const pendingTopics = this.safeList (pending, 'topics', []);
                    for (let i = 0; i < pendingTopics.length; i++) {
                        if (pendingTopics[i] in activeTopics) {
                            delete activeTopics[pendingTopics[i]];
                        }
                    }
                    const subscribeHashes = this.safeList (pending, 'subscribeHashes', []);
                    for (let i = 0; i < subscribeHashes.length; i++) {
                        const subHash = subscribeHashes[i];
                        if (subHash in client.subscriptions) {
                            delete client.subscriptions[subHash];
                        }
                    }
                    const messageHashes = this.safeList (pending, 'messageHashes', []);
                    for (let i = 0; i < messageHashes.length; i++) {
                        client.reject (error, messageHashes[i]);
                    }
                } else {
                    client.reject (error);
                }
            }
            return;
        }
        if (operation === 'Unsubscribe') {
            const unsubHash = (id !== undefined) ? ('unsubscribe:' + id) : undefined;
            if ((unsubHash !== undefined) && (unsubHash in client.subscriptions)) {
                delete client.subscriptions[unsubHash];
            }
            if (success || (errorCode === 'TopicNotSubscribed')) {
                if (unsubHash !== undefined) {
                    client.resolve (true, unsubHash);
                }
            } else {
                const error = this.createWsException (errorCode, errorMessage, message);
                if (unsubHash !== undefined) {
                    client.reject (error, unsubHash);
                } else {
                    client.reject (error);
                }
            }
        }
    }

    handleTicker (client: Client, topic: string, content: Dict) {
        //
        // Snapshot:
        //     {
        //         "InstrumentID": "100000",
        //         "Ask": "60724.29",
        //         "Bid": "60724.28",
        //         "LastExecution": "60724.28",
        //         "Date": "2026-11-26T14:21:09.6046673Z",
        //         "OfficialClosingPrice": "60072.79",
        //         "PriceRateID": "166287251399"
        //     }
        //
        // Incremental delta (Trading.Instrument.Rate):
        //     {
        //         "Date": "2026-11-26T14:21:10.8261151Z",
        //         "PriceRateID": "166287251711"
        //     }
        //
        const topicParts = topic.split (':');
        const marketId = this.safeString (content, 'InstrumentID', this.safeString (topicParts, 1));
        if (marketId === undefined) {
            return;
        }
        if (!('rawTickers' in client.subscriptions)) {
            client.subscriptions['rawTickers'] = {};
        }
        const rawTickers = client.subscriptions['rawTickers'];
        const existingRaw = this.safeDict (rawTickers, marketId, {});
        const mergedRaw = this.extend (existingRaw, content, { 'InstrumentID': marketId });
        rawTickers[marketId] = mergedRaw;
        const markets = this.safeList (this.markets_by_id, marketId, []);
        const marketsLength = markets.length;
        if (marketsLength === 0) {
            const fallbackMarket = this.safeMarket (marketId);
            const ticker = this.parseTicker (mergedRaw, fallbackMarket);
            const symbol = ticker['symbol'];
            if (symbol !== undefined) {
                this.tickers[symbol] = ticker;
                this.bidsasks[symbol] = ticker;
                client.resolve (ticker, 'ticker:' + symbol);
                client.resolve (ticker, 'bidask:' + symbol);
            }
            return;
        }
        for (let i = 0; i < marketsLength; i++) {
            const market = markets[i];
            const ticker = this.parseTicker (mergedRaw, market);
            const symbol = ticker['symbol'];
            if (symbol === undefined) {
                continue;
            }
            this.tickers[symbol] = ticker;
            this.bidsasks[symbol] = ticker;
            client.resolve (ticker, 'ticker:' + symbol);
            client.resolve (ticker, 'bidask:' + symbol);
        }
    }

    findCachedOrderMarketById (orderId: Str): Market {
        if ((this.orders === undefined) || (orderId === undefined)) {
            return undefined;
        }
        const hashmap = this.orders.hashmap;
        const symbols = Object.keys (hashmap);
        for (let i = 0; i < symbols.length; i++) {
            const symMap = hashmap[symbols[i]];
            if (orderId in symMap) {
                return this.safeDict (this.markets, symbols[i]) as Market;
            }
        }
        return undefined;
    }

    mergeOrder (existing: Order, incoming: Order): Order {
        if (existing === undefined) {
            return incoming;
        }
        const merged: Dict = this.extend ({}, existing);
        const incomingDict: Dict = incoming;
        const keys = Object.keys (incomingDict);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const val = incomingDict[key];
            if (val !== undefined) {
                merged[key] = val;
            }
        }
        return merged as Order;
    }

    resolveOrder (client: Client, topic: string, order: Order) {
        const symbol = this.safeString (order, 'symbol');
        const id = this.safeString (order, 'id');
        if ((symbol === undefined) || (id === undefined)) {
            return;
        }
        if (this.orders === undefined) {
            const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
            this.orders = new ArrayCacheBySymbolById (limit);
        }
        const orders = this.orders;
        const symbolMap = this.safeDict (orders.hashmap, symbol, {});
        const existing = this.safeDict (symbolMap, id) as Order;
        const merged = this.mergeOrder (existing, order);
        orders.append (merged);
        client.resolve (orders, 'orders:' + topic);
        client.resolve (orders, 'orders:' + topic + ':' + symbol);
    }

    handleOrderEvent (client: Client, topic: string, content: Dict) {
        //
        //     {
        //         "orderId": 396858465,
        //         "accountId": 34374239,
        //         "action": "open",
        //         "transaction": "buy",
        //         "orderType": "mkt",
        //         "orderUpdateType": "executed",
        //         "updateTime": "2026-11-26T14:21:24.857",
        //         "orderState": "filled",
        //         "asset": { "instrumentId": 1202, "symbol": "", "side": "long", "settlementType": "real", "leverage": 1, "currency": "EUR" },
        //         "accountCurrency": "USD",
        //         "requestedTriggerRate": null,
        //         "requestedUnits": 0.070703,
        //         "requestedAmount": 15.0,
        //         "requestTime": "2026-11-26T14:21:24.7558174",
        //         "positionsExecutions": [ ... ],
        //         "totalFees": 1,
        //         "totalCosts": 15.98,
        //         "totalProceeds": null
        //     }
        //
        // settlementType can be "na" on cancellations; preserve the market resolved from earlier updates
        const orderId = this.safeString (content, 'orderId');
        const cachedMarket = this.findCachedOrderMarketById (orderId);
        const order = this.parseOrder (content, cachedMarket);
        this.resolveOrder (client, topic, order);
        const executions = this.safeList (content, 'positionsExecutions', []);
        const executionsLength = executions.length;
        if (executionsLength > 0) {
            const orderType = this.safeString (order, 'type');
            const orderSide = this.safeString (order, 'side');
            for (let i = 0; i < executionsLength; i++) {
                const exec = executions[i];
                this.handleWsExecutionTrade (client, topic, exec, orderId, orderType, orderSide);
                this.handleWsExecutionPosition (client, topic, exec);
            }
        }
    }

    handleLegacyOrder (client: Client, topic: string, msgType: string, content: Dict) {
        let rawOrder = content;
        if (msgType === 'Trading.Order.Open') {
            const inner = this.safeDict (content, 'Order');
            if (inner === undefined) {
                return;
            }
            const requestToken = this.safeString (content, 'RequestToken');
            rawOrder = this.extend (inner, { 'RequestToken': requestToken, 'status': 'open', 'orderType': 'mit' });
        }
        const marketId = this.safeStringN (rawOrder, [ 'InstrumentID', 'instrumentID', 'instrumentId' ]);
        if (marketId === undefined) {
            return;
        }
        const order = this.parseOrder (rawOrder);
        this.resolveOrder (client, topic, order);
    }

    handleWsExecutionTrade (client: Client, topic: string, exec: Dict, orderId: Str, orderType: Str, orderSide: Str) {
        const asset = this.safeDict (exec, 'asset', {});
        const marketId = this.safeString2 (asset, 'instrumentId', 'instrumentID');
        const settlementType = this.safeString (asset, 'settlementType');
        const market = this.safeEtoroMarket (marketId, settlementType);
        const symbol = market['symbol'];
        if (symbol === undefined) {
            return;
        }
        const updateType = this.safeStringLower (exec, 'positionUpdateType', 'fill');
        const execData = this.safeDict2 (exec, 'openingData', 'closingData');
        if (execData === undefined) {
            return;
        }
        const positionId = this.safeString (exec, 'positionId');
        const tradeId = (positionId !== undefined) ? (positionId + ':' + updateType) : undefined;
        const timeStr = this.safeStringN (execData, [ 'executionTime', 'openTime', 'closeTime' ]);
        const timestamp = this.parseUtcIsoTimestamp (timeStr);
        const price = this.safeString (execData, 'avgPrice');
        const amount = market['future']
            ? this.safeString2 (execData, 'contracts', 'units')
            : this.safeString2 (execData, 'units', 'contracts');
        const feeCost = this.safeString (execData, 'fees');
        const feeCurrency = this.safeCurrencyCode (this.safeString (exec, 'marginCurrency', 'USD'));
        let fee: NullableDict = undefined;
        if (feeCost !== undefined) {
            fee = {
                'cost': this.parseNumber (Precise.stringAbs (feeCost)),
                'currency': feeCurrency,
            };
        }
        const trade = this.safeTrade ({
            'id': tradeId,
            'info': exec,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': orderId,
            'type': orderType,
            'side': orderSide,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'fee': fee,
        }, market);
        if (this.myTrades === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            this.myTrades = new ArrayCacheBySymbolById (limit);
        }
        const myTrades = this.myTrades;
        myTrades.append (trade);
        client.resolve (myTrades, 'myTrades:' + topic);
        client.resolve (myTrades, 'myTrades:' + topic + ':' + symbol);
    }

    findCachedPositionById (positionId: Str): Position | undefined {
        if ((this.positions === undefined) || (positionId === undefined)) {
            return undefined;
        }
        const hashmap = this.positions.hashmap;
        const symbols = Object.keys (hashmap);
        for (let i = 0; i < symbols.length; i++) {
            const symMap = hashmap[symbols[i]];
            if (positionId in symMap) {
                return symMap[positionId];
            }
        }
        return undefined;
    }

    resolvePosition (client: Client, topic: string, position: Position) {
        const symbol = this.safeString (position, 'symbol');
        if (symbol === undefined) {
            return;
        }
        if (this.positions === undefined) {
            const limit = this.safeInteger (this.options, 'positionsLimit', 1000);
            this.positions = new ArrayCacheBySymbolById (limit);
        }
        this.positions.append (position);
        const newPositions = [ position ];
        client.resolve (newPositions, 'positions:' + topic);
        client.resolve (newPositions, 'positions:' + topic + ':' + symbol);
    }

    handleWsExecutionPosition (client: Client, topic: string, exec: Dict) {
        const asset = this.safeDict (exec, 'asset', {});
        const marketId = this.safeString2 (asset, 'instrumentId', 'instrumentID');
        const settlementType = this.safeString (asset, 'settlementType');
        const market = this.safeEtoroMarket (marketId, settlementType);
        const symbol = market['symbol'];
        if (symbol === undefined) {
            return;
        }
        const id = this.safeString (exec, 'positionId');
        const existing = this.findCachedPositionById (id);
        const openingData = this.safeDict (exec, 'openingData');
        const closingData = this.safeDict (exec, 'closingData');
        const positionState = this.safeStringLower (exec, 'positionState');
        const isClosed = (positionState === 'closed') || (closingData !== undefined);
        const side = this.safeStringLower (asset, 'side', this.safeString (existing, 'side'));
        const leverage = this.omitZero (this.safeString (asset, 'leverage', this.safeString (existing, 'leverage')));
        let initialMarginPercentage: Str = undefined;
        if ((leverage !== undefined) && Precise.stringGt (leverage, '0')) {
            initialMarginPercentage = Precise.stringDiv ('1', leverage);
        }
        const margin = this.omitZero (this.safeString2 (exec, 'margin', 'initialMargin', this.safeString (existing, 'initialMargin')));
        let openTimeStr: Str = undefined;
        let entryPrice: Str = undefined;
        if (openingData !== undefined) {
            openTimeStr = this.safeString2 (openingData, 'openTime', 'executionTime');
            entryPrice = this.omitZero (this.safeString (openingData, 'avgPrice'));
        }
        if (entryPrice === undefined) {
            entryPrice = this.safeString (existing, 'entryPrice');
        }
        let timestamp = this.parseUtcIsoTimestamp (openTimeStr);
        if (timestamp === undefined) {
            timestamp = this.safeInteger (existing, 'timestamp');
        }
        const updateTimeStr = this.safeString (exec, 'updateTime');
        const lastUpdateTimestamp = this.parseUtcIsoTimestamp (updateTimeStr);
        if (timestamp === undefined) {
            timestamp = lastUpdateTimestamp;
        }
        let markPrice: Str = undefined;
        let realizedPnl: Str = undefined;
        const unrealizedPnl: Str = '0';
        let collateral: Str = margin;
        if (closingData !== undefined) {
            markPrice = this.omitZero (this.safeString (closingData, 'avgPrice'));
            realizedPnl = this.safeString2 (closingData, 'acctCcyReturn', 'pnl');
            collateral = this.omitZero (this.safeString (closingData, 'liquidationValueAcctCcy', collateral));
        } else {
            const cachedTicker = this.safeDict (this.tickers, symbol);
            markPrice = this.omitZero (this.safeString (cachedTicker, 'last', entryPrice));
        }
        let contracts: Str = undefined;
        if (isClosed) {
            contracts = this.safeString (exec, 'remainingUnits', '0');
        } else {
            contracts = this.omitZero (this.safeString (exec, 'remainingUnits'));
            if ((contracts === undefined) && (openingData !== undefined)) {
                contracts = market['future']
                    ? this.omitZero (this.safeString2 (openingData, 'contracts', 'units'))
                    : this.omitZero (this.safeString2 (openingData, 'units', 'contracts'));
            }
        }
        let notional: Str = undefined;
        if ((contracts !== undefined) && (markPrice !== undefined)) {
            notional = Precise.stringMul (contracts, markPrice);
        } else if ((contracts !== undefined) && (entryPrice !== undefined)) {
            notional = Precise.stringMul (contracts, entryPrice);
        }
        let percentage: Str = '0';
        if ((margin !== undefined) && Precise.stringGt (margin, '0')) {
            if (realizedPnl !== undefined) {
                percentage = Precise.stringMul (Precise.stringDiv (realizedPnl, margin), '100');
            }
        }
        const position = this.safePosition ({
            'info': exec,
            'id': id,
            'symbol': symbol,
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
            'unrealizedPnl': this.parseNumber (unrealizedPnl),
            'realizedPnl': this.parseNumber (realizedPnl),
            'contracts': this.parseNumber (contracts),
            'contractSize': this.safeNumber (market, 'contractSize', 1),
            'marginRatio': undefined,
            'liquidationPrice': undefined,
            'markPrice': this.parseNumber (markPrice),
            'lastPrice': this.parseNumber (markPrice),
            'collateral': this.parseNumber (collateral),
            'marginMode': 'isolated',
            'side': side,
            'percentage': this.parseNumber (percentage),
            'stopLossPrice': this.parseNumber (this.parseProtectionRate (this.safeString (exec, 'stopLossRate'))),
            'takeProfitPrice': this.parseNumber (this.parseProtectionRate (this.safeString (exec, 'takeProfitRate'))),
            'hedged': true,
        });
        this.resolvePosition (client, topic, position);
    }

    handlePositionOpen (client: Client, topic: string, content: Dict) {
        const raw = this.safeDict (content, 'Position', content);
        const position = this.parsePosition (raw);
        const symbol = this.safeString (position, 'symbol');
        if (symbol === undefined) {
            return;
        }
        if (position['markPrice'] === undefined) {
            const cachedTicker = this.safeDict (this.tickers, symbol);
            position['markPrice'] = this.safeNumber (cachedTicker, 'last', position['entryPrice']);
        }
        if (position['unrealizedPnl'] === undefined) {
            position['unrealizedPnl'] = 0;
        }
        if (position['percentage'] === undefined) {
            position['percentage'] = 0;
        }
        this.resolvePosition (client, topic, position);
    }

    handlePositionClose (client: Client, topic: string, content: Dict) {
        const positionId = this.safeString2 (content, 'PositionID', 'positionId');
        const existing = this.findCachedPositionById (positionId);
        let market: Market = undefined;
        const marketId = this.safeString2 (content, 'InstrumentID', 'instrumentId');
        if (marketId !== undefined) {
            market = this.safeMarket (marketId);
        } else if (existing !== undefined) {
            market = this.safeMarket (existing['symbol']);
        }
        if (market === undefined) {
            return;
        }
        const position = this.parsePosition (content, market);
        if (existing !== undefined) {
            if (position['side'] === undefined) {
                position['side'] = existing['side'];
            }
            if (position['entryPrice'] === undefined) {
                position['entryPrice'] = existing['entryPrice'];
            }
            if (position['timestamp'] === undefined) {
                position['timestamp'] = existing['timestamp'];
                position['datetime'] = existing['datetime'];
            }
        }
        position['contracts'] = 0;
        if (position['unrealizedPnl'] === undefined) {
            position['unrealizedPnl'] = 0;
        }
        this.resolvePosition (client, topic, position);
    }

    override handleMessage (client: Client, message: Dict) {
        if (!this.isDictionary (message)) {
            return;
        }
        const operation = this.safeString (message, 'operation');
        if (operation !== undefined) {
            this.handleControlMessage (client, message);
            return;
        }
        const messages = this.safeList (message, 'messages');
        if (messages === undefined) {
            return;
        }
        for (let i = 0; i < messages.length; i++) {
            const item = messages[i];
            const topic = this.safeString (item, 'topic', '');
            const msgType = this.safeString (item, 'type', '');
            const rawContent = this.safeValue (item, 'content');
            let content: NullableDict = undefined;
            if (typeof rawContent === 'string') {
                content = this.parseJson (rawContent);
            } else if (this.isDictionary (rawContent)) {
                content = rawContent;
            }
            if (content === undefined) {
                continue;
            }
            if ((topic.indexOf ('instrument:') === 0) && ((msgType === 'Snapshot') || (msgType === 'Trading.Instrument.Rate'))) {
                this.handleTicker (client, topic, content);
            } else if (msgType === 'OrderEvent') {
                this.handleOrderEvent (client, topic, content);
            } else if ((msgType === 'Trading.Order.Open') || (msgType === 'Trading.OrderForOpen.Update') || (msgType === 'Trading.OrderForClose.Update') || (msgType === 'Trading.OrderForCloseMultiple.Update')) {
                this.handleLegacyOrder (client, topic, msgType, content);
            } else if ((msgType === 'Trading.Position.Open') || (msgType === 'Trading.Position.Opened')) {
                this.handlePositionOpen (client, topic, content);
            } else if ((msgType === 'Trading.Position.Close') || (msgType === 'Trading.Position.Closed')) {
                this.handlePositionClose (client, topic, content);
            }
        }
    }
}
