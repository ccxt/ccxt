//  ---------------------------------------------------------------------------

import etoroRest from '../etoro.js';
import { ArgumentsRequired, AuthenticationError, BadRequest, BadSymbol, ExchangeError, NotSupported, PermissionDenied, RateLimitExceeded } from '../base/errors.js';
import { ArrayCacheBySymbolById } from '../base/ws/Cache.js';
import type { Dict, Int, Market, NullableDict, Order, Str, Strings, Ticker, Tickers } from '../base/types.js';
import Client from '../base/ws/Client.js';

//  ---------------------------------------------------------------------------

export default class etoro extends etoroRest {
    override describe (): Dict {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'unWatchOrders': true,
                'unWatchTicker': true,
                'unWatchTickers': true,
                'watchBalance': false,
                'watchMyTrades': false,
                'watchOHLCV': false,
                'watchOrderBook': false,
                'watchOrders': true,
                'watchPositions': false,
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
            },
            'streaming': {},
            'exceptions': {
                'ws': {
                    'exact': {
                        'InvalidKey': AuthenticationError,
                        'Unauthorized': AuthenticationError,
                        'ApiKeyRequired': AuthenticationError,
                        'UserKeyRequired': AuthenticationError,
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
        return this.isSandboxModeEnabled ? 'private:demo' : 'private:real';
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
        const url = this.getWsUrl ();
        await this.authenticate (url);
        const client = this.client (url);
        const topics: string[] = [];
        const missingTopics: string[] = [];
        const messageHashes: string[] = [];
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
            messageHashes.push ('ticker:' + market['symbol']);
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
        };
        const ticker = await this.watchMultiple (url, messageHashes, this.extend (request, params), topics, subscription);
        if (this.newUpdates) {
            const result: Dict = {};
            result[ticker['symbol']] = ticker;
            return result;
        }
        return this.filterByArray (this.tickers, 'symbol', marketSymbols);
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
     * @description unWatches price tickers for multiple markets, the spot and the swap market of an instrument are unsubscribed together because they share the same price feed
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
        const url = this.getWsUrl ();
        await this.authenticate (url);
        const topics: string[] = [];
        const messageHashes: string[] = [];
        const sharedSymbols: string[] = [];
        for (let i = 0; i < marketSymbols.length; i++) {
            const market = this.market (marketSymbols[i]);
            const marketId = market['id'];
            const topic = 'instrument:' + marketId;
            if (!this.inArray (topic, topics)) {
                topics.push (topic);
                const marketsById = this.safeList (this.markets_by_id, marketId, []);
                for (let j = 0; j < marketsById.length; j++) {
                    const sharedSymbol = this.safeString (marketsById[j], 'symbol', '');
                    if ((sharedSymbol !== '') && !this.inArray (sharedSymbol, sharedSymbols)) {
                        sharedSymbols.push (sharedSymbol);
                    }
                }
            }
            messageHashes.push ('unsubscribe:ticker:' + market['symbol']);
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
            'symbols': sharedSymbols,
            'messageHashes': messageHashes,
            'unsubscribe': true,
            'kind': 'ticker',
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
            const previous = this.safeDict (this.tickers, symbol, {});
            const previousInfo = this.safeDict (previous, 'info', {});
            const merged = this.extend (previousInfo, content);
            const ticker = this.parseWsTicker (merged, market as Market);
            this.tickers[symbol] = ticker;
            client.resolve (ticker, 'ticker:' + symbol);
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
        const url = this.getWsUrl ();
        await this.authenticate (url);
        let messageHash = 'orders';
        let marketSymbol: Str = undefined;
        if (symbol !== undefined) {
            const market = this.market (symbol);
            marketSymbol = market['symbol'];
            messageHash = messageHash + ':' + marketSymbol;
        }
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
            'messageHashes': [ messageHash ],
        };
        const orders = await this.watch (url, messageHash, this.extend (request, params), topic, subscription);
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
        await this.loadMarkets ();
        const url = this.getWsUrl ();
        await this.authenticate (url);
        const topic = this.getPrivateTopic ();
        const messageHash = 'unsubscribe:orders';
        const requestId = this.uuid ();
        const request: Dict = {
            'id': requestId,
            'operation': 'Unsubscribe',
            'data': {
                'topics': [ topic ],
            },
        };
        const subscription: Dict = {
            'id': requestId,
            'topics': [ topic ],
            'messageHashes': [ messageHash ],
            'unsubscribe': true,
            'kind': 'orders',
        };
        return await this.watch (url, messageHash, this.extend (request, params), messageHash, subscription);
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
            normalizedAsset = this.extend (asset, {
                'settlementType': this.getSettlementType (market),
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

    buildWsError (message: Dict) {
        const errorCode = this.safeString (message, 'errorCode');
        const feedback = this.id + ' ' + this.json (message);
        const wsExceptions = this.safeDict (this.exceptions, 'ws', {});
        const exact = this.safeDict (wsExceptions, 'exact', {});
        try {
            this.throwExactlyMatchedException (exact, errorCode, feedback);
            throw new ExchangeError (feedback);
        } catch (e) {
            return e;
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
                const error = this.buildWsError (message);
                client.reject (error, messageHash);
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
            const error = this.buildWsError (message);
            const topics = this.safeList (subscription, 'topics', []);
            for (let i = 0; i < topics.length; i++) {
                const topic = topics[i];
                if (topic in client.subscriptions) {
                    delete client.subscriptions[topic];
                }
            }
            for (let i = 0; i < messageHashes.length; i++) {
                client.reject (error, messageHashes[i]);
            }
        } else if (operation === 'Unsubscribe') {
            if (success || (errorCode === 'TopicNotSubscribed')) {
                this.handleUnsubscription (client, subscription);
                return;
            }
            const error = this.buildWsError (message);
            for (let i = 0; i < messageHashes.length; i++) {
                const messageHash = messageHashes[i];
                if (messageHash in client.subscriptions) {
                    delete client.subscriptions[messageHash];
                }
                client.reject (error, messageHash);
            }
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
        const kind = this.safeString (subscription, 'kind');
        if (kind === 'orders') {
            this.cleanUnsubscription (client, 'orders', 'unsubscribe:orders', true);
            this.cleanCache ({ 'topic': 'orders' });
        } else if (kind === 'ticker') {
            const symbols = this.safeList (subscription, 'symbols', []);
            for (let i = 0; i < symbols.length; i++) {
                const symbol = symbols[i];
                this.cleanUnsubscription (client, 'ticker:' + symbol, 'unsubscribe:ticker:' + symbol);
            }
            this.cleanCache ({ 'topic': 'ticker', 'symbols': symbols });
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
