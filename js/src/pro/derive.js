// ----------------------------------------------------------------------------
import deriveRest from '../derive.js';
import { ExchangeError, AuthenticationError, UnsubscribeError } from '../base/errors.js';
import { ArrayCacheBySymbolById, ArrayCache } from '../base/ws/Cache.js';
// ----------------------------------------------------------------------------
export default class derive extends deriveRest {
    describe() {
        return this.deepExtend(super.describe(), {
            'has': {
                'ws': false,
                'watchBalance': false,
                'watchMyTrades': true,
                'watchOHLCV': false,
                'watchOrderBook': true,
                'watchOrders': true,
                'watchTicker': true,
                'watchTickers': false,
                'watchBidsAsks': false,
                'watchTrades': true,
                'watchTradesForSymbols': false,
                'watchPositions': false,
            },
            'urls': {
                'api': {
                    'ws': 'wss://api.lyra.finance/ws',
                },
                'test': {
                    'ws': 'wss://api-demo.lyra.finance/ws',
                },
            },
            'options': {
                'tradesLimit': 1000,
                'ordersLimit': 1000,
                'requestId': {},
            },
            'streaming': {
                'keepAlive': 9000,
            },
            'exceptions': {
                'ws': {
                    'exact': {},
                },
            },
        });
    }
    requestId(url) {
        const options = this.safeValue(this.options, 'requestId', {});
        const previousValue = this.safeInteger(options, url, 0);
        const newValue = this.sum(previousValue, 1);
        this.options['requestId'][url] = newValue;
        return newValue;
    }
    async watchPublic(messageHash, message, subscription) {
        const url = this.urls['api']['ws'];
        const requestId = this.requestId(url);
        const request = this.extend(message, {
            'id': requestId,
        });
        subscription = this.extend(subscription, {
            'id': requestId,
            'method': 'subscribe',
        });
        return await this.watch(url, messageHash, request, messageHash, subscription);
    }
    /**
     * @method
     * @name derive#watchOrderBook
     * @see https://docs.derive.xyz/reference/orderbook-instrument_name-group-depth
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return.
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async watchOrderBook(symbol, limit = undefined, params = {}) {
        await this.loadMarkets();
        if (limit === undefined) {
            limit = 10;
        }
        const market = this.market(symbol);
        const topic = 'orderbook.' + market['id'] + '.10.' + this.numberToString(limit);
        const request = {
            'method': 'subscribe',
            'params': {
                'channels': [
                    topic,
                ],
            },
        };
        const subscription = {
            'name': topic,
            'symbol': symbol,
            'limit': limit,
            'params': params,
        };
        const orderbook = await this.watchPublic(topic, request, subscription);
        return orderbook.limit();
    }
    handleOrderBook(client, message) {
        //
        // {
        //     method: 'subscription',
        //     params: {
        //       channel: 'orderbook.BTC-PERP.10.1',
        //       data: {
        //         timestamp: 1738331231506,
        //         instrument_name: 'BTC-PERP',
        //         publish_id: 628419,
        //         bids: [ [ '104669', '40' ] ],
        //         asks: [ [ '104736', '40' ] ]
        //       }
        //     }
        // }
        //
        const params = this.safeDict(message, 'params');
        const data = this.safeDict(params, 'data');
        const marketId = this.safeString(data, 'instrument_name');
        const market = this.safeMarket(marketId);
        const symbol = market['symbol'];
        const topic = this.safeString(params, 'channel');
        if (!(symbol in this.orderbooks)) {
            const defaultLimit = this.safeInteger(this.options, 'watchOrderBookLimit', 1000);
            const subscription = client.subscriptions[topic];
            const limit = this.safeInteger(subscription, 'limit', defaultLimit);
            this.orderbooks[symbol] = this.orderBook({}, limit);
        }
        const orderbook = this.orderbooks[symbol];
        const timestamp = this.safeInteger(data, 'timestamp');
        const snapshot = this.parseOrderBook(data, symbol, timestamp, 'bids', 'asks');
        orderbook.reset(snapshot);
        client.resolve(orderbook, topic);
    }
    /**
     * @method
     * @name derive#watchTicker
     * @see https://docs.derive.xyz/reference/ticker-instrument_name-interval
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchTicker(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const topic = 'ticker.' + market['id'] + '.100';
        const request = {
            'method': 'subscribe',
            'params': {
                'channels': [
                    topic,
                ],
            },
        };
        const subscription = {
            'name': topic,
            'symbol': symbol,
            'params': params,
        };
        return await this.watchPublic(topic, request, subscription);
    }
    handleTicker(client, message) {
        //
        // {
        //     method: 'subscription',
        //     params: {
        //       channel: 'ticker.BTC-PERP.100',
        //       data: {
        //         timestamp: 1738485104439,
        //         instrument_ticker: {
        //           instrument_type: 'perp',
        //           instrument_name: 'BTC-PERP',
        //           scheduled_activation: 1701840228,
        //           scheduled_deactivation: '9223372036854775807',
        //           is_active: true,
        //           tick_size: '0.1',
        //           minimum_amount: '0.01',
        //           maximum_amount: '10000',
        //           amount_step: '0.001',
        //           mark_price_fee_rate_cap: '0',
        //           maker_fee_rate: '0.0001',
        //           taker_fee_rate: '0.0003',
        //           base_fee: '0.1',
        //           base_currency: 'BTC',
        //           quote_currency: 'USD',
        //           option_details: null,
        //           perp_details: {
        //             index: 'BTC-USD',
        //             max_rate_per_hour: '0.004',
        //             min_rate_per_hour: '-0.004',
        //             static_interest_rate: '0.0000125',
        //             aggregate_funding: '10581.779418721074588722',
        //             funding_rate: '0.000024792239208858'
        //           },
        //           erc20_details: null,
        //           base_asset_address: '0xDBa83C0C654DB1cd914FA2710bA743e925B53086',
        //           base_asset_sub_id: '0',
        //           pro_rata_fraction: '0',
        //           fifo_min_allocation: '0',
        //           pro_rata_amount_step: '0.1',
        //           best_ask_amount: '0.131',
        //           best_ask_price: '99898.6',
        //           best_bid_amount: '0.056',
        //           best_bid_price: '99889.1',
        //           five_percent_bid_depth: '11.817',
        //           five_percent_ask_depth: '9.116',
        //           option_pricing: null,
        //           index_price: '99883.8',
        //           mark_price: '99897.52408421244763303548098',
        //           stats: {
        //             contract_volume: '92.395',
        //             num_trades: '2924',
        //             open_interest: '33.743468027373780786',
        //             high: '102320.4',
        //             low: '99064.3',
        //             percent_change: '-0.021356',
        //             usd_change: '-2178'
        //           },
        //           timestamp: 1738485165881,
        //           min_price: '97939.1',
        //           max_price: '101895.2'
        //         }
        //       }
        //     }
        // }
        //
        const params = this.safeDict(message, 'params');
        const rawData = this.safeDict(params, 'data');
        const data = this.safeDict(rawData, 'instrument_ticker');
        const topic = this.safeValue(params, 'channel');
        const ticker = this.parseTicker(data);
        this.tickers[ticker['symbol']] = ticker;
        client.resolve(ticker, topic);
        return message;
    }
    /**
     * @method
     * @name derive#unWatchOrderBook
     * @description unsubscribe from the orderbook channel
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.limit] orderbook limit, default is undefined
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async unWatchOrderBook(symbol, params = {}) {
        await this.loadMarkets();
        let limit = this.safeInteger(params, 'limit');
        if (limit === undefined) {
            limit = 10;
        }
        const market = this.market(symbol);
        const topic = 'orderbook.' + market['id'] + '.10.' + this.numberToString(limit);
        const messageHash = 'unwatch' + topic;
        const request = {
            'method': 'unsubscribe',
            'params': {
                'channels': [
                    topic,
                ],
            },
        };
        const subscription = {
            'name': topic,
        };
        return await this.unWatchPublic(messageHash, request, subscription);
    }
    /**
     * @method
     * @name derive#unWatchTrades
     * @description unsubscribe from the trades channel
     * @param {string} symbol unified symbol of the market to unwatch the trades for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {any} status of the unwatch request
     */
    async unWatchTrades(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const topic = 'trades.' + market['id'];
        const messageHah = 'unwatch' + topic;
        const request = {
            'method': 'unsubscribe',
            'params': {
                'channels': [
                    topic,
                ],
            },
        };
        const subscription = {
            'name': topic,
        };
        return await this.unWatchPublic(messageHah, request, subscription);
    }
    async unWatchPublic(messageHash, message, subscription) {
        const url = this.urls['api']['ws'];
        const requestId = this.requestId(url);
        const request = this.extend(message, {
            'id': requestId,
        });
        subscription = this.extend(subscription, {
            'id': requestId,
            'method': 'unsubscribe',
        });
        return await this.watch(url, messageHash, request, messageHash, subscription);
    }
    handleOrderBookUnSubscription(client, topic) {
        const parsedTopic = topic.split('.');
        const marketId = this.safeString(parsedTopic, 1);
        const market = this.safeMarket(marketId);
        const symbol = market['symbol'];
        if (symbol in this.orderbooks) {
            delete this.orderbooks[symbol];
        }
        if (topic in client.subscriptions) {
            delete client.subscriptions[topic];
        }
        const error = new UnsubscribeError(this.id + ' orderbook ' + symbol);
        client.reject(error, topic);
        client.resolve(error, 'unwatch' + topic);
    }
    handleTradesUnSubscription(client, topic) {
        const parsedTopic = topic.split('.');
        const marketId = this.safeString(parsedTopic, 1);
        const market = this.safeMarket(marketId);
        const symbol = market['symbol'];
        if (symbol in this.orderbooks) {
            delete this.trades[symbol];
        }
        if (topic in client.subscriptions) {
            delete client.subscriptions[topic];
        }
        const error = new UnsubscribeError(this.id + ' trades ' + symbol);
        client.reject(error, topic);
        client.resolve(error, 'unwatch' + topic);
    }
    handleUnSubscribe(client, message) {
        //
        // {
        //     id: 1,
        //     result: {
        //       status: { 'orderbook.BTC-PERP.10.10': 'ok' },
        //       remaining_subscriptions: []
        //     }
        // }
        //
        const result = this.safeDict(message, 'result');
        const status = this.safeDict(result, 'status');
        if (status !== undefined) {
            const topics = Object.keys(status);
            for (let i = 0; i < topics.length; i++) {
                const topic = topics[i];
                if (topic.indexOf('orderbook') >= 0) {
                    this.handleOrderBookUnSubscription(client, topic);
                }
                else if (topic.indexOf('trades') >= 0) {
                    this.handleTradesUnSubscription(client, topic);
                }
            }
        }
        return message;
    }
    /**
     * @method
     * @name derive#watchTrades
     * @description watches information on multiple trades made in a market
     * @see https://docs.derive.xyz/reference/trades-instrument_name
     * @param {string} symbol unified market symbol of the market trades were made in
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async watchTrades(symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const topic = 'trades.' + market['id'];
        const request = {
            'method': 'subscribe',
            'params': {
                'channels': [
                    topic,
                ],
            },
        };
        const subscription = {
            'name': topic,
            'symbol': symbol,
            'params': params,
        };
        const trades = await this.watchPublic(topic, request, subscription);
        if (this.newUpdates) {
            limit = trades.getLimit(market['symbol'], limit);
        }
        return this.filterBySymbolSinceLimit(trades, symbol, since, limit, true);
    }
    handleTrade(client, message) {
        //
        //
        const params = this.safeDict(message, 'params');
        const data = this.safeDict(params, 'data');
        const topic = this.safeValue(params, 'channel');
        const parsedTopic = topic.split('.');
        const marketId = this.safeString(parsedTopic, 1);
        const market = this.safeMarket(marketId);
        const symbol = market['symbol'];
        let tradesArray = this.safeValue(this.trades, symbol);
        if (tradesArray === undefined) {
            const limit = this.safeInteger(this.options, 'tradesLimit', 1000);
            tradesArray = new ArrayCache(limit);
        }
        for (let i = 0; i < data.length; i++) {
            const trade = this.parseTrade(data[i]);
            tradesArray.append(trade);
        }
        this.trades[symbol] = tradesArray;
        client.resolve(tradesArray, topic);
    }
    async authenticate(params = {}) {
        this.checkRequiredCredentials();
        const url = this.urls['api']['ws'];
        const client = this.client(url);
        const messageHash = 'authenticated';
        const future = client.future(messageHash);
        const authenticated = this.safeValue(client.subscriptions, messageHash);
        if (authenticated === undefined) {
            const requestId = this.requestId(url);
            const now = this.milliseconds().toString();
            const signature = this.signMessage(now, this.privateKey);
            const deriveWalletAddress = this.safeString(this.options, 'deriveWalletAddress');
            const request = {
                'id': requestId,
                'method': 'public/login',
                'params': {
                    'wallet': deriveWalletAddress,
                    'timestamp': now,
                    'signature': signature,
                },
            };
            // const subscription: Dict = {
            //     'name': topic,
            //     'symbol': symbol,
            //     'params': params,
            // };
            const message = this.extend(request, params);
            this.watch(url, messageHash, message, messageHash, message);
        }
        return await future;
    }
    async watchPrivate(messageHash, message, subscription) {
        await this.authenticate();
        const url = this.urls['api']['ws'];
        const requestId = this.requestId(url);
        const request = this.extend(message, {
            'id': requestId,
        });
        subscription = this.extend(subscription, {
            'id': requestId,
            'method': 'subscribe',
        });
        return await this.watch(url, messageHash, request, messageHash, subscription);
    }
    /**
     * @method
     * @name derive#watchOrders
     * @see https://docs.derive.xyz/reference/subaccount_id-orders
     * @description watches information on multiple orders made by the user
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subaccount_id] *required* the subaccount id
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async watchOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let subaccountId = undefined;
        [subaccountId, params] = this.handleDeriveSubaccountId('watchOrders', params);
        const topic = this.numberToString(subaccountId) + '.orders';
        let messageHash = topic;
        if (symbol !== undefined) {
            const market = this.market(symbol);
            symbol = market['symbol'];
            messageHash += ':' + symbol;
        }
        const request = {
            'method': 'subscribe',
            'params': {
                'channels': [
                    topic,
                ],
            },
        };
        const subscription = {
            'name': topic,
            'params': params,
        };
        const message = this.extend(request, params);
        const orders = await this.watchPrivate(messageHash, message, subscription);
        if (this.newUpdates) {
            limit = orders.getLimit(symbol, limit);
        }
        return this.filterBySymbolSinceLimit(orders, symbol, since, limit, true);
    }
    handleOrder(client, message) {
        //
        // {
        //     method: 'subscription',
        //     params: {
        //         channel: '130837.orders',
        //         data: [
        //             {
        //                 subaccount_id: 130837,
        //                 order_id: '1f44c564-5658-4b69-b8c4-4019924207d5',
        //                 instrument_name: 'BTC-PERP',
        //                 direction: 'buy',
        //                 label: 'test1234',
        //                 quote_id: null,
        //                 creation_timestamp: 1738578974146,
        //                 last_update_timestamp: 1738578974146,
        //                 limit_price: '10000',
        //                 amount: '0.01',
        //                 filled_amount: '0',
        //                 average_price: '0',
        //                 order_fee: '0',
        //                 order_type: 'limit',
        //                 time_in_force: 'post_only',
        //                 order_status: 'untriggered',
        //                 max_fee: '219',
        //                 signature_expiry_sec: 1746354973,
        //                 nonce: 1738578973570,
        //                 signer: '0x30CB7B06AdD6749BbE146A6827502B8f2a79269A',
        //                 signature: '0xc6927095f74a0d3b1aeef8c0579d120056530479f806e9d2e6616df742a8934c69046361beae833b32b25c0145e318438d7d1624bb835add956f63aa37192f571c',
        //                 cancel_reason: '',
        //                 mmp: false,
        //                 is_transfer: false,
        //                 replaced_order_id: null,
        //                 trigger_type: 'stoploss',
        //                 trigger_price_type: 'mark',
        //                 trigger_price: '102800',
        //                 trigger_reject_message: null
        //             }
        //         ]
        //     }
        // }
        //
        const params = this.safeDict(message, 'params');
        const topic = this.safeString(params, 'channel');
        const rawOrders = this.safeList(params, 'data');
        for (let i = 0; i < rawOrders.length; i++) {
            const data = rawOrders[i];
            const parsed = this.parseOrder(data);
            const symbol = this.safeString(parsed, 'symbol');
            const orderId = this.safeString(parsed, 'id');
            if (symbol !== undefined) {
                if (this.orders === undefined) {
                    const limit = this.safeInteger(this.options, 'ordersLimit', 1000);
                    this.orders = new ArrayCacheBySymbolById(limit);
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
                    parsed['timestamp'] = this.safeInteger(order, 'timestamp');
                    parsed['datetime'] = this.safeString(order, 'datetime');
                }
                cachedOrders.append(parsed);
                const messageHashSymbol = topic + ':' + symbol;
                client.resolve(this.orders, messageHashSymbol);
            }
        }
        client.resolve(this.orders, topic);
    }
    /**
     * @method
     * @name derive#watchMyTrades
     * @see https://docs.derive.xyz/reference/subaccount_id-trades
     * @description watches information on multiple trades made by the user
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subaccount_id] *required* the subaccount id
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async watchMyTrades(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let subaccountId = undefined;
        [subaccountId, params] = this.handleDeriveSubaccountId('watchMyTrades', params);
        const topic = this.numberToString(subaccountId) + '.trades';
        let messageHash = topic;
        if (symbol !== undefined) {
            const market = this.market(symbol);
            symbol = market['symbol'];
            messageHash += ':' + symbol;
        }
        const request = {
            'method': 'subscribe',
            'params': {
                'channels': [
                    topic,
                ],
            },
        };
        const subscription = {
            'name': topic,
            'params': params,
        };
        const message = this.extend(request, params);
        const trades = await this.watchPrivate(messageHash, message, subscription);
        if (this.newUpdates) {
            limit = trades.getLimit(symbol, limit);
        }
        return this.filterBySymbolSinceLimit(trades, symbol, since, limit, true);
    }
    handleMyTrade(client, message) {
        //
        //
        let myTrades = this.myTrades;
        if (myTrades === undefined) {
            const limit = this.safeInteger(this.options, 'tradesLimit', 1000);
            myTrades = new ArrayCacheBySymbolById(limit);
        }
        const params = this.safeDict(message, 'params');
        const topic = this.safeString(params, 'channel');
        const rawTrades = this.safeList(params, 'data');
        for (let i = 0; i < rawTrades.length; i++) {
            const trade = this.parseTrade(message);
            myTrades.append(trade);
            client.resolve(myTrades, topic);
            const messageHash = topic + trade['symbol'];
            client.resolve(myTrades, messageHash);
        }
    }
    handleErrorMessage(client, message) {
        //
        // {
        //     id: '690c6276-0fc6-4121-aafa-f28bf5adedcb',
        //     error: { code: -32600, message: 'Invalid Request' }
        // }
        //
        if (!('error' in message)) {
            return false;
        }
        const errorMessage = this.safeDict(message, 'error');
        const errorCode = this.safeString(errorMessage, 'code');
        try {
            if (errorCode !== undefined) {
                const feedback = this.id + ' ' + this.json(message);
                this.throwExactlyMatchedException(this.exceptions['exact'], errorCode, feedback);
                throw new ExchangeError(feedback);
            }
            return false;
        }
        catch (error) {
            if (error instanceof AuthenticationError) {
                const messageHash = 'authenticated';
                client.reject(error, messageHash);
                if (messageHash in client.subscriptions) {
                    delete client.subscriptions[messageHash];
                }
            }
            else {
                client.reject(error);
            }
            return true;
        }
    }
    handleMessage(client, message) {
        if (this.handleErrorMessage(client, message)) {
            return;
        }
        const methods = {
            'orderbook': this.handleOrderBook,
            'ticker': this.handleTicker,
            'trades': this.handleTrade,
            'orders': this.handleOrder,
            'mytrades': this.handleMyTrade,
        };
        let event = undefined;
        const params = this.safeDict(message, 'params');
        if (params !== undefined) {
            const channel = this.safeString(params, 'channel');
            if (channel !== undefined) {
                const parsedChannel = channel.split('.');
                if ((channel.indexOf('orders') >= 0) || channel.indexOf('trades') > 0) {
                    event = this.safeString(parsedChannel, 1);
                    // {subaccounr_id}.trades
                    if (event === 'trades') {
                        event = 'mytrades';
                    }
                }
                else {
                    event = this.safeString(parsedChannel, 0);
                }
            }
        }
        const method = this.safeValue(methods, event);
        if (method !== undefined) {
            method.call(this, client, message);
            return;
        }
        if ('id' in message) {
            const id = this.safeString(message, 'id');
            const subscriptionsById = this.indexBy(client.subscriptions, 'id');
            const subscription = this.safeValue(subscriptionsById, id, {});
            if ('method' in subscription) {
                if (subscription['method'] === 'public/login') {
                    this.handleAuth(client, message);
                }
                else if (subscription['method'] === 'unsubscribe') {
                    this.handleUnSubscribe(client, message);
                }
                // could handleSubscribe
            }
        }
    }
    handleAuth(client, message) {
        //
        // {
        //     id: 1,
        //     result: [ 130837 ]
        // }
        //
        const messageHash = 'authenticated';
        const ids = this.safeList(message, 'result');
        if (ids.length > 0) {
            // client.resolve (message, messageHash);
            const future = this.safeValue(client.futures, 'authenticated');
            future.resolve(true);
        }
        else {
            const error = new AuthenticationError(this.json(message));
            client.reject(error, messageHash);
            // allows further authentication attempts
            if (messageHash in client.subscriptions) {
                delete client.subscriptions['authenticated'];
            }
        }
    }
}
