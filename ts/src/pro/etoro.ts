//  ---------------------------------------------------------------------------

import etoroRest from '../etoro.js';
import { AuthenticationError, ExchangeError } from '../base/errors.js';
import { Precise } from '../base/Precise.js';
import { ArrayCacheBySymbolById } from '../base/ws/Cache.js';
import type { Dict, Int, Market, Order, Str, Strings, Ticker, Tickers, Trade } from '../base/types.js';
import Client from '../base/ws/Client.js';

//  ---------------------------------------------------------------------------

export default class etoro extends etoroRest {
    override describe (): Dict {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchBalance': false,
                'watchMyTrades': true,
                'watchOHLCV': false,
                'watchOrderBook': false,
                'watchOrders': true,
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
                'tradesLimit': 1000,
                'ordersLimit': 1000,
            },
            'streaming': {},
            'exceptions': {
                'ws': {
                    'exact': {
                        'Unauthorized': AuthenticationError,
                        'InvalidKey': AuthenticationError,
                        'ApiKeyRequired': AuthenticationError,
                        'UserKeyRequired': AuthenticationError,
                        'SessionNotAuthenticated': AuthenticationError,
                    },
                },
            },
        });
    }

    async authenticate (params = {}) {
        this.checkRequiredCredentials ();
        const url = this.urls['api']['ws'];
        const client = this.client (url);
        const messageHash = 'authenticated';
        const future = client.reusableFuture (messageHash);
        const authenticated = this.safeValue (client.subscriptions, messageHash);
        if (authenticated === undefined) {
            const requestId = this.uuid ();
            const request: Dict = {
                'id': requestId,
                'operation': 'Authenticate',
                'data': {
                    'userKey': this.secret,
                    'apiKey': this.apiKey,
                },
            };
            this.watch (url, messageHash, this.extend (request, params), messageHash, future);
        }
        return await future;
    }

    async subscribeTopics (topics: string[], messageHashes: string[], snapshot: boolean, params = {}): Promise<any> {
        await this.authenticate ();
        const url = this.urls['api']['ws'];
        const client = this.client (url);
        const subscribeHashes = [];
        const newTopics = [];
        for (let i = 0; i < topics.length; i++) {
            const subscribeHash = 'topic:' + topics[i];
            subscribeHashes.push (subscribeHash);
            // the server rejects a whole request that repeats an already subscribed topic
            if (!(subscribeHash in client.subscriptions)) {
                newTopics.push (topics[i]);
            }
        }
        const requestId = this.uuid ();
        const data: Dict = {
            'topics': newTopics,
        };
        if (snapshot) {
            data['snapshot'] = true;
        }
        const request: Dict = {
            'id': requestId,
            'operation': 'Subscribe',
            'data': data,
        };
        // remember which hashes the request serves, so a rejected subscription rejects its watchers
        const subscription: Dict = {
            'id': requestId,
            'messageHashes': messageHashes,
        };
        return await this.watchMultiple (url, messageHashes, this.extend (request, params), subscribeHashes, subscription);
    }

    /**
     * @method
     * @name etoro#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://api-portal.etoro.com/core/websocket/topics
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)
     */
    override async watchTicker (symbol: string, params = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const tickers = await this.watchTickers ([ market['symbol'] ], params);
        return tickers[market['symbol']];
    }

    /**
     * @method
     * @name etoro#watchTickers
     * @description watches price tickers for multiple markets, the first update of a market is its current rate snapshot
     * @see https://api-portal.etoro.com/core/websocket/topics
     * @param {string[]} symbols unified symbols of the markets to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures](https://docs.ccxt.com/#/?id=ticker-structure)
     */
    override async watchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        await this.loadMarkets ();
        const symbolsList: string[] = this.marketSymbols (symbols, undefined, false);
        const topics = [];
        const messageHashes = [];
        for (let i = 0; i < symbolsList.length; i++) {
            const market = this.market (symbolsList[i]);
            topics.push ('instrument:' + market['id']);
            messageHashes.push ('ticker:' + market['symbol']);
        }
        const ticker = await this.subscribeTopics (topics, messageHashes, true, params);
        if (this.newUpdates) {
            const result: Dict = {};
            result[ticker['symbol']] = ticker;
            return result;
        }
        return this.filterByArray (this.tickers, 'symbol', symbolsList);
    }

    handleTicker (client: Client, topic: string, content: Dict) {
        //
        // topic "instrument:100000", type "Snapshot" (the full rate on subscribe) or "Trading.Instrument.Rate",
        // every value is a string and an update carries only the changed fields
        //
        //     {
        //         "Ask": "64128.89",
        //         "Bid": "64128.88",
        //         "LastExecution": "64128.88",
        //         "Date": "2026-11-18T11:15:48.8618227Z",
        //         "PriceRateID": "165088060265",
        //         ...
        //     }
        //
        //     {
        //         "Date": "2026-11-18T11:15:50.1233866Z",
        //         "PriceRateID": "165088060566"
        //     }
        //
        const parts = topic.split (':');
        const marketId = this.safeString (parts, 1);
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const previous = this.safeDict (this.tickers, symbol);
        let previousInfo: Dict = {};
        if (previous !== undefined) {
            previousInfo = this.safeDict (previous, 'info', {});
        }
        const merged = this.extend (previousInfo, content);
        merged['InstrumentID'] = marketId;
        const ticker = this.parseTicker (merged, market);
        this.tickers[symbol] = ticker;
        client.resolve (ticker, 'ticker:' + symbol);
    }

    /**
     * @method
     * @name etoro#watchOrders
     * @description watches information on multiple orders made by the user
     * @see https://api-portal.etoro.com/core/websocket/topics
     * @param {string} [symbol] unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)
     */
    override async watchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        let messageHash = 'orders';
        let unifiedSymbol: Str = undefined;
        if (symbol !== undefined) {
            const market = this.market (symbol);
            unifiedSymbol = market['symbol'];
            messageHash = messageHash + ':' + unifiedSymbol;
        }
        const orders = await this.subscribeTopics ([ this.getPrivateTopic () ], [ messageHash ], false, params);
        let limitValue = limit;
        if (this.newUpdates) {
            limitValue = orders.getLimit (unifiedSymbol, limit);
        }
        return this.filterBySymbolSinceLimit (orders, unifiedSymbol, since, limitValue, true);
    }

    /**
     * @method
     * @name etoro#watchMyTrades
     * @description watches information on multiple trades made by the user, every position opening or closing execution is a trade
     * @see https://api-portal.etoro.com/core/websocket/topics
     * @param {string} [symbol] unified market symbol of the market trades were made in
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)
     */
    override async watchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        let messageHash = 'myTrades';
        let unifiedSymbol: Str = undefined;
        if (symbol !== undefined) {
            const market = this.market (symbol);
            unifiedSymbol = market['symbol'];
            messageHash = messageHash + ':' + unifiedSymbol;
        }
        const trades = await this.subscribeTopics ([ this.getPrivateTopic () ], [ messageHash ], false, params);
        let limitValue = limit;
        if (this.newUpdates) {
            limitValue = trades.getLimit (unifiedSymbol, limit);
        }
        return this.filterBySymbolSinceLimit (trades, unifiedSymbol, since, limitValue, true);
    }

    getPrivateTopic (): string {
        // real and demo accounts stream on separate topics
        if (this.safeBool (this.options, 'sandboxMode', false)) {
            return 'private:demo';
        }
        return 'private:real';
    }

    handleOrderEvent (client: Client, content: Dict) {
        //
        //     {
        //         "orderId": 394985209,
        //         "action": "open",
        //         "transaction": "buy",
        //         "orderType": "mkt",
        //         "eToroOrderType": "17",
        //         "requestType": "amount",
        //         "orderUpdateType": "executed",
        //         "updateTime": "2026-11-18T11:18:01.83",
        //         "orderState": "filled",
        //         "asset": { "instrumentId": 100000, "symbol": "", "side": "long", "settlementType": "real", "leverage": 1, "currency": "USD" },
        //         "requestedTriggerRate": null,
        //         "requestedUnits": null,
        //         "requestedAmount": null,
        //         "requestTime": null,
        //         "positionsExecutions": [
        //             {
        //                 "positionId": 3645496604,
        //                 "positionUpdateType": "open",
        //                 "positionState": "open",
        //                 "asset": { "instrumentId": 100000, ... },
        //                 "openingData": { "orderId": 394985209, "executionTime": "2026-11-18T11:18:01.8394131", "units": 0.000187, "avgPrice": 64135.45, "fees": 0.12, ... },
        //                 "closingData": null,
        //                 ...
        //             }
        //         ],
        //         "remainingUnits": null,
        //         "totalFees": null,
        //         "totalCosts": null,
        //         "totalProceeds": null,
        //         "errorMessage": null,
        //         "errorCode": null
        //     }
        //
        const asset = this.safeDict (content, 'asset', {});
        const marketId = this.safeString (asset, 'instrumentId');
        const knownMarkets = this.safeList (this.markets_by_id, marketId);
        if (knownMarkets === undefined) {
            return; // an instrument outside the crypto spot markets
        }
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        // orders
        if (this.orders === undefined) {
            const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
            this.orders = new ArrayCacheBySymbolById (limit);
        }
        const parsed = this.parseWsOrder (content, market);
        // a later event of the same order may omit what an earlier one reported, keep the known values
        const cachedOrders = this.orders;
        const symbolOrders = this.safeDict (cachedOrders.hashmap, symbol, {});
        const previous = this.safeDict (symbolOrders, parsed['id']);
        if (previous !== undefined) {
            const keys = [ 'timestamp', 'datetime', 'side', 'price', 'amount', 'filled', 'remaining', 'cost', 'average', 'clientOrderId' ];
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                if ((parsed as Dict)[key] === undefined) {
                    (parsed as Dict)[key] = previous[key];
                }
            }
            const parsedFees = this.safeList (parsed, 'fees', []);
            const numParsedFees = parsedFees.length;
            if (numParsedFees === 0) {
                (parsed as Dict)['fee'] = this.safeDict (previous, 'fee');
                (parsed as Dict)['fees'] = this.safeList (previous, 'fees', []);
            }
        }
        cachedOrders.append (parsed);
        client.resolve (cachedOrders, 'orders');
        client.resolve (cachedOrders, 'orders:' + symbol);
        // trades
        const executions = this.safeList (content, 'positionsExecutions', []);
        const numExecutions = executions.length;
        if (numExecutions > 0) {
            if (this.myTrades === undefined) {
                const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
                this.myTrades = new ArrayCacheBySymbolById (limit);
            }
            const cachedTrades = this.myTrades;
            for (let i = 0; i < numExecutions; i++) {
                const execution = executions[i];
                const openingData = this.safeDict (execution, 'openingData');
                if (openingData !== undefined) {
                    cachedTrades.append (this.parseWsExecution (execution, openingData, 'open', market));
                }
                const closingData = this.safeDict (execution, 'closingData');
                if (closingData !== undefined) {
                    cachedTrades.append (this.parseWsExecution (execution, closingData, 'close', market));
                }
            }
            client.resolve (cachedTrades, 'myTrades');
            client.resolve (cachedTrades, 'myTrades:' + symbol);
        }
    }

    parseWsOrderStatus (status: Str): Str {
        const statuses: Dict = {
            'received': 'open',
            'placed': 'open',
            'filled': 'closed',
            'rejected': 'rejected',
            'partiallyFilled': 'open',
            'pendingCancel': 'open',
            'canceled': 'canceled',
            'expired': 'expired',
            'canceledPartiallyFilled': 'canceled',
            'rejectedPartiallyFilled': 'rejected',
            'waitingForMarket': 'open',
            'pendingTriggeredRate': 'open',
        };
        return this.safeString (statuses, status, status);
    }

    override parseWsOrder (order: Dict, market: Market = undefined): Order {
        const asset = this.safeDict (order, 'asset', {});
        const marketId = this.safeString (asset, 'instrumentId');
        const resolvedMarket = this.safeMarket (marketId, market);
        const exchangeType = this.safeString (order, 'orderType');
        let price = undefined;
        let timeInForce = undefined;
        if (exchangeType === 'mit') {
            price = this.safeString (order, 'requestedTriggerRate');
        } else if (exchangeType === 'limitIOC') {
            price = this.safeString (order, 'requestedLimitRate');
            timeInForce = 'IOC';
        }
        const action = this.safeString (order, 'action');
        let side = undefined;
        if (action === 'close') {
            side = 'sell'; // the account holds long positions only
        } else {
            const transaction = this.safeString (order, 'transaction');
            if ((transaction === 'buy') || (transaction === 'buyToCover')) {
                side = 'buy';
            } else if ((transaction === 'sell') || (transaction === 'sellShort')) {
                side = 'sell';
            }
        }
        const status = this.parseWsOrderStatus (this.safeString (order, 'orderState'));
        let amount = this.safeString (order, 'requestedUnits');
        if ((amount !== undefined) && Precise.stringEq (amount, '0')) {
            amount = undefined;
        }
        const executions = this.safeList (order, 'positionsExecutions', []);
        let filled = undefined;
        let cost = undefined;
        let average = undefined;
        let filledUnits: Str = '0';
        let filledCost: Str = '0';
        for (let i = 0; i < executions.length; i++) {
            const execution = executions[i];
            let data = this.safeDict (execution, 'openingData');
            if (action === 'close') {
                data = this.safeDict (execution, 'closingData');
            }
            if (data !== undefined) {
                const units = this.safeString (data, 'units', '0');
                filledUnits = Precise.stringAdd (filledUnits, units);
                filledCost = Precise.stringAdd (filledCost, Precise.stringMul (units, this.safeString (data, 'avgPrice', '0')));
            }
        }
        if (Precise.stringGt (filledUnits, '0')) {
            filled = filledUnits;
            cost = filledCost;
            average = Precise.stringDiv (filledCost, filledUnits);
        } else if ((status === 'closed') && (amount !== undefined)) {
            filled = amount;
        }
        const fees = [];
        const totalFees = this.safeString (order, 'totalFees');
        if (totalFees !== undefined) {
            fees.push ({
                'cost': totalFees,
                'currency': this.safeString (order, 'currencyOfTotals', 'USD'),
            });
        }
        const requestTime = this.parse8601 (this.safeString (order, 'requestTime'));
        const updateTime = this.parse8601 (this.safeString (order, 'updateTime'));
        return this.safeOrder ({
            'id': this.safeString (order, 'orderId'),
            'clientOrderId': undefined,
            'datetime': this.iso8601 (requestTime),
            'timestamp': requestTime,
            'lastTradeTimestamp': undefined,
            'lastUpdateTimestamp': updateTime,
            'status': status,
            'symbol': resolvedMarket['symbol'],
            'type': this.parseOrderType (exchangeType),
            'timeInForce': timeInForce,
            'postOnly': undefined,
            'reduceOnly': undefined,
            'side': side,
            'price': price,
            'triggerPrice': undefined,
            'amount': amount,
            'cost': cost,
            'average': average,
            'filled': filled,
            'remaining': this.safeString (order, 'remainingUnits'),
            'fee': undefined,
            'fees': fees,
            'trades': undefined,
            'info': order,
        }, resolvedMarket);
    }

    parseWsExecution (execution: Dict, data: Dict, leg: string, market: Market = undefined): Trade {
        //
        //     {
        //         "orderId": 394985209,
        //         "executionTime": "2026-11-18T11:18:01.8394131",
        //         "units": 0.000187,
        //         "contracts": 0.000187,
        //         "avgPrice": 64135.45,
        //         "avgConversionRate": 1,
        //         "markup": 0.01,
        //         "fees": 0.12,
        //         "taxes": 0
        //     }
        //
        const resolvedMarket = this.safeMarket (undefined, market);
        const positionId = this.safeString (execution, 'positionId');
        const timestamp = this.parse8601 (this.safeString (data, 'executionTime'));
        let side = 'buy';
        if (leg === 'close') {
            side = 'sell';
        }
        return this.safeTrade ({
            'id': positionId + '-' + leg,
            'info': execution,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': resolvedMarket['symbol'],
            'order': this.safeString (data, 'orderId'),
            'type': 'market',
            'side': side,
            'takerOrMaker': 'taker',
            'price': this.safeString (data, 'avgPrice'),
            'amount': this.safeString (data, 'units'),
            'cost': undefined,
            'fee': {
                'cost': this.safeString (data, 'fees'),
                'currency': 'USD',
            },
        }, resolvedMarket);
    }

    handleAck (client: Client, message: Dict) {
        //
        //     { "id": "ed72693c-1545-4fa1-8a10-aca7cf5419a6", "success": true, "operation": "Authenticate" }
        //     { "id": "...", "success": false, "operation": "Subscribe", "errorMessage": "Topic name candle:100000 is invalid", "errorCode": "InvalidTopicName" }
        //
        const operation = this.safeString (message, 'operation');
        const success = this.safeBool (message, 'success', false);
        if (operation === 'Authenticate') {
            const future = this.safeValue (client.futures, 'authenticated');
            if (success) {
                if (future !== undefined) {
                    future.resolve (true);
                }
                return;
            }
            const authError = this.getWsError (message);
            client.reject (authError, 'authenticated');
            if ('authenticated' in client.subscriptions) {
                delete client.subscriptions['authenticated'];
            }
            return;
        }
        const errorCode = this.safeString (message, 'errorCode');
        if (success || (errorCode === 'TopicAlreadySubscribed')) {
            return;
        }
        // a rejected subscribe or unsubscribe rejects the watchers of its topics
        const error = this.getWsError (message);
        const requestId = this.safeString (message, 'id');
        const subscriptionKeys = Object.keys (client.subscriptions);
        for (let i = 0; i < subscriptionKeys.length; i++) {
            const key = subscriptionKeys[i];
            const subscription = this.safeDict (client.subscriptions, key);
            if ((subscription !== undefined) && (this.safeString (subscription, 'id') === requestId)) {
                const messageHashes = this.safeList (subscription, 'messageHashes', []);
                for (let j = 0; j < messageHashes.length; j++) {
                    client.reject (error, messageHashes[j]);
                }
                delete client.subscriptions[key];
            }
        }
    }

    getWsError (message: Dict): any {
        const errorCode = this.safeString (message, 'errorCode');
        const feedback = this.id + ' ' + this.json (message);
        try {
            this.throwExactlyMatchedException (this.exceptions['ws']['exact'], errorCode, feedback);
            throw new ExchangeError (feedback);
        } catch (e) {
            return e;
        }
    }

    override handleMessage (client: Client, message: any) {
        //
        // the server also sends a single NUL character frame, which is not json and is skipped
        //
        if (this.safeString (message, 'operation') !== undefined) {
            this.handleAck (client, message);
            return;
        }
        //
        //     {
        //         "messages": [
        //             {
        //                 "topic": "instrument:100000",
        //                 "content": "{\"Ask\":\"84917.73\",\"Bid\":\"83232.21\",...}",
        //                 "id": "f1992278-2c4a-4b8f-92d6-8b99f5e1cb00",
        //                 "type": "Trading.Instrument.Rate"
        //             }
        //         ]
        //     }
        //
        const messages = this.safeList (message, 'messages');
        if (messages === undefined) {
            return;
        }
        for (let i = 0; i < messages.length; i++) {
            const entry = messages[i];
            const messageType = this.safeString (entry, 'type');
            const topic = this.safeString (entry, 'topic', '');
            const content = this.parseJson (this.safeString (entry, 'content'));
            if ((messageType === 'Trading.Instrument.Rate') || (messageType === 'Snapshot')) {
                this.handleTicker (client, topic, content);
            } else if (messageType === 'OrderEvent') {
                this.handleOrderEvent (client, content);
            }
        }
    }
}
