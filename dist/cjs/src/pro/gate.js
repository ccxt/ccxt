'use strict';

var gate$1 = require('../gate.js');
var errors = require('../base/errors.js');
var Cache = require('../base/ws/Cache.js');
var sha512 = require('../static_dependencies/noble-hashes/sha512.js');
var Precise = require('../base/Precise.js');

// ----------------------------------------------------------------------------
//  ---------------------------------------------------------------------------
class gate extends gate$1 {
    describe() {
        return this.deepExtend(super.describe(), {
            'has': {
                'ws': true,
                'cancelAllOrdersWs': true,
                'cancelOrderWs': true,
                'createMarketBuyOrderWithCostWs': true,
                'createMarketOrderWs': true,
                'createMarketOrderWithCostWs': false,
                'createMarketSellOrderWithCostWs': false,
                'createOrderWs': true,
                'createOrdersWs': true,
                'createPostOnlyOrderWs': true,
                'createReduceOnlyOrderWs': true,
                'createStopLimitOrderWs': true,
                'createStopLossOrderWs': true,
                'createStopMarketOrderWs': false,
                'createStopOrderWs': true,
                'createTakeProfitOrderWs': true,
                'createTriggerOrderWs': true,
                'editOrderWs': true,
                'fetchOrderWs': true,
                'fetchOrdersWs': false,
                'fetchOpenOrdersWs': true,
                'fetchClosedOrdersWs': true,
                'watchOrderBook': true,
                'watchTicker': true,
                'watchTickers': true,
                'watchTrades': true,
                'watchTradesForSymbols': true,
                'watchMyTrades': true,
                'watchOHLCV': true,
                'watchBalance': true,
                'watchOrders': true,
                'watchLiquidations': false,
                'watchLiquidationsForSymbols': false,
                'watchMyLiquidations': true,
                'watchMyLiquidationsForSymbols': true,
                'watchPositions': true,
            },
            'urls': {
                'api': {
                    'ws': 'wss://ws.gate.io/v4',
                    'spot': 'wss://api.gateio.ws/ws/v4/',
                    'swap': {
                        'usdt': 'wss://fx-ws.gateio.ws/v4/ws/usdt',
                        'btc': 'wss://fx-ws.gateio.ws/v4/ws/btc',
                    },
                    'future': {
                        'usdt': 'wss://fx-ws.gateio.ws/v4/ws/delivery/usdt',
                        'btc': 'wss://fx-ws.gateio.ws/v4/ws/delivery/btc',
                    },
                    'option': {
                        'usdt': 'wss://op-ws.gateio.live/v4/ws/usdt',
                        'btc': 'wss://op-ws.gateio.live/v4/ws/btc',
                    },
                },
                'test': {
                    'swap': {
                        'usdt': 'wss://fx-ws-testnet.gateio.ws/v4/ws/usdt',
                        'btc': 'wss://fx-ws-testnet.gateio.ws/v4/ws/btc',
                    },
                    'future': {
                        'usdt': 'wss://fx-ws-testnet.gateio.ws/v4/ws/usdt',
                        'btc': 'wss://fx-ws-testnet.gateio.ws/v4/ws/btc',
                    },
                    'option': {
                        'usdt': 'wss://op-ws-testnet.gateio.live/v4/ws/usdt',
                        'btc': 'wss://op-ws-testnet.gateio.live/v4/ws/btc',
                    },
                },
            },
            'options': {
                'tradesLimit': 1000,
                'OHLCVLimit': 1000,
                'watchTradesSubscriptions': {},
                'watchTickerSubscriptions': {},
                'watchOrderBookSubscriptions': {},
                'watchTicker': {
                    'name': 'tickers', // or book_ticker
                },
                'watchOrderBook': {
                    'interval': '100ms',
                    'snapshotDelay': 10,
                    'snapshotMaxRetries': 3,
                    'checksum': true,
                },
                'watchBalance': {
                    'settle': 'usdt',
                    'spot': 'spot.balances', // spot.margin_balances, spot.funding_balances or spot.cross_balances
                },
                'watchPositions': {
                    'fetchPositionsSnapshot': true,
                    'awaitPositionsSnapshot': true, // whether to wait for the positions snapshot before providing updates
                },
            },
            'exceptions': {
                'ws': {
                    'exact': {
                        '1': errors.BadRequest,
                        '2': errors.BadRequest,
                        '4': errors.AuthenticationError,
                        '6': errors.AuthenticationError,
                        '11': errors.AuthenticationError,
                    },
                    'broad': {},
                },
            },
        });
    }
    /**
     * @method
     * @name gate#createOrderWs
     * @see https://www.gate.io/docs/developers/apiv4/ws/en/#order-place
     * @see https://www.gate.io/docs/developers/futures/ws/en/#order-place
     * @description Create an order on the exchange
     * @param {string} symbol Unified CCXT market symbol
     * @param {string} type 'limit' or 'market' *"market" is contract only*
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount the amount of currency to trade
     * @param {float} [price] *ignored in "market" orders* the price at which the order is to be fulfilled at in units of the quote currency
     * @param {object} [params]  extra parameters specific to the exchange API endpoint
     * @param {float} [params.stopPrice] The price at which a trigger order is triggered at
     * @param {string} [params.timeInForce] "GTC", "IOC", or "PO"
     * @param {float} [params.stopLossPrice] The price at which a stop loss order is triggered at
     * @param {float} [params.takeProfitPrice] The price at which a take profit order is triggered at
     * @param {string} [params.marginMode] 'cross' or 'isolated' - marginMode for margin trading if not provided this.options['defaultMarginMode'] is used
     * @param {int} [params.iceberg] Amount to display for the iceberg order, Null or 0 for normal orders, Set to -1 to hide the order completely
     * @param {string} [params.text] User defined information
     * @param {string} [params.account] *spot and margin only* "spot", "margin" or "cross_margin"
     * @param {bool} [params.auto_borrow] *margin only* Used in margin or cross margin trading to allow automatic loan of insufficient amount if balance is not enough
     * @param {string} [params.settle] *contract only* Unified Currency Code for settle currency
     * @param {bool} [params.reduceOnly] *contract only* Indicates if this order is to reduce the size of a position
     * @param {bool} [params.close] *contract only* Set as true to close the position, with size set to 0
     * @param {bool} [params.auto_size] *contract only* Set side to close dual-mode position, close_long closes the long side, while close_short the short one, size also needs to be set to 0
     * @param {int} [params.price_type] *contract only* 0 latest deal price, 1 mark price, 2 index price
     * @param {float} [params.cost] *spot market buy only* the quote quantity that can be used as an alternative for the amount
     * @returns {object|undefined} [An order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createOrderWs(symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        symbol = market['symbol'];
        const messageType = this.getTypeByMarket(market);
        const channel = messageType + '.order_place';
        const url = this.getUrlByMarket(market);
        params['textIsRequired'] = true;
        const request = this.createOrderRequest(symbol, type, side, amount, price, params);
        await this.authenticate(url, messageType);
        const rawOrder = await this.requestPrivate(url, request, channel);
        const order = this.parseOrder(rawOrder, market);
        return order;
    }
    /**
     * @method
     * @name gate#createOrdersWs
     * @description create a list of trade orders
     * @see https://www.gate.io/docs/developers/futures/ws/en/#order-batch-place
     * @param {Array} orders list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createOrdersWs(orders, params = {}) {
        await this.loadMarkets();
        const request = this.createOrdersRequest(orders, params);
        const firstOrder = orders[0];
        const market = this.market(firstOrder['symbol']);
        if (market['swap'] !== true) {
            throw new errors.NotSupported(this.id + ' createOrdersWs is not supported for swap markets');
        }
        const messageType = this.getTypeByMarket(market);
        const channel = messageType + '.order_batch_place';
        const url = this.getUrlByMarket(market);
        await this.authenticate(url, messageType);
        const rawOrders = await this.requestPrivate(url, request, channel);
        return this.parseOrders(rawOrders, market);
    }
    /**
     * @method
     * @name gate#cancelAllOrdersWs
     * @description cancel all open orders
     * @see https://www.gate.io/docs/developers/futures/ws/en/#cancel-all-open-orders-matched
     * @see https://www.gate.io/docs/developers/apiv4/ws/en/#order-cancel-all-with-specified-currency-pair
     * @param {string} symbol unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.channel] the channel to use, defaults to spot.order_cancel_cp or futures.order_cancel_cp
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelAllOrdersWs(symbol = undefined, params = {}) {
        await this.loadMarkets();
        const market = (symbol === undefined) ? undefined : this.market(symbol);
        const trigger = this.safeBool2(params, 'stop', 'trigger');
        const messageType = this.getTypeByMarket(market);
        let channel = messageType + '.order_cancel_cp';
        [channel, params] = this.handleOptionAndParams(params, 'cancelAllOrdersWs', 'channel', channel);
        const url = this.getUrlByMarket(market);
        params = this.omit(params, ['stop', 'trigger']);
        const [type, query] = this.handleMarketTypeAndParams('cancelAllOrders', market, params);
        const [request, requestParams] = (type === 'spot') ? this.multiOrderSpotPrepareRequest(market, trigger, query) : this.prepareRequest(market, type, query);
        await this.authenticate(url, messageType);
        const rawOrders = await this.requestPrivate(url, this.extend(request, requestParams), channel);
        return this.parseOrders(rawOrders, market);
    }
    /**
     * @method
     * @name gate#cancelOrderWs
     * @description Cancels an open order
     * @see https://www.gate.io/docs/developers/apiv4/ws/en/#order-cancel
     * @see https://www.gate.io/docs/developers/futures/ws/en/#order-cancel
     * @param {string} id Order id
     * @param {string} symbol Unified market symbol
     * @param {object} [params] Parameters specified by the exchange api
     * @param {bool} [params.trigger] True if the order to be cancelled is a trigger order
     * @returns An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelOrderWs(id, symbol = undefined, params = {}) {
        await this.loadMarkets();
        const market = (symbol === undefined) ? undefined : this.market(symbol);
        const trigger = this.safeValueN(params, ['is_stop_order', 'stop', 'trigger'], false);
        params = this.omit(params, ['is_stop_order', 'stop', 'trigger']);
        const [type, query] = this.handleMarketTypeAndParams('cancelOrder', market, params);
        const [request, requestParams] = (type === 'spot' || type === 'margin') ? this.spotOrderPrepareRequest(market, trigger, query) : this.prepareRequest(market, type, query);
        const messageType = this.getTypeByMarket(market);
        const channel = messageType + '.order_cancel';
        const url = this.getUrlByMarket(market);
        await this.authenticate(url, messageType);
        request['order_id'] = id.toString();
        const res = await this.requestPrivate(url, this.extend(request, requestParams), channel);
        return this.parseOrder(res, market);
    }
    /**
     * @method
     * @name gate#editOrderWs
     * @description edit a trade order, gate currently only supports the modification of the price or amount fields
     * @see https://www.gate.io/docs/developers/apiv4/ws/en/#order-amend
     * @see https://www.gate.io/docs/developers/futures/ws/en/#order-amend
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of the currency you want to trade in units of the base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async editOrderWs(id, symbol, type, side, amount = undefined, price = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const extendedRequest = this.editOrderRequest(id, symbol, type, side, amount, price, params);
        const messageType = this.getTypeByMarket(market);
        const channel = messageType + '.order_amend';
        const url = this.getUrlByMarket(market);
        await this.authenticate(url, messageType);
        const rawOrder = await this.requestPrivate(url, extendedRequest, channel);
        return this.parseOrder(rawOrder, market);
    }
    /**
     * @method
     * @name gate#fetchOrderWs
     * @description Retrieves information on an order
     * @see https://www.gate.io/docs/developers/apiv4/ws/en/#order-status
     * @see https://www.gate.io/docs/developers/futures/ws/en/#order-status
     * @param {string} id Order id
     * @param {string} symbol Unified market symbol, *required for spot and margin*
     * @param {object} [params] Parameters specified by the exchange api
     * @param {bool} [params.trigger] True if the order being fetched is a trigger order
     * @param {string} [params.marginMode] 'cross' or 'isolated' - marginMode for margin trading if not provided this.options['defaultMarginMode'] is used
     * @param {string} [params.type] 'spot', 'swap', or 'future', if not provided this.options['defaultMarginMode'] is used
     * @param {string} [params.settle] 'btc' or 'usdt' - settle currency for perpetual swap and future - market settle currency is used if symbol !== undefined, default="usdt" for swap and "btc" for future
     * @returns An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrderWs(id, symbol = undefined, params = {}) {
        await this.loadMarkets();
        const market = (symbol === undefined) ? undefined : this.market(symbol);
        const [request, requestParams] = this.fetchOrderRequest(id, symbol, params);
        const messageType = this.getTypeByMarket(market);
        const channel = messageType + '.order_status';
        const url = this.getUrlByMarket(market);
        await this.authenticate(url, messageType);
        const rawOrder = await this.requestPrivate(url, this.extend(request, requestParams), channel);
        return this.parseOrder(rawOrder, market);
    }
    /**
     * @method
     * @name gate#fetchOpenOrdersWs
     * @description fetch all unfilled currently open orders
     * @see https://www.gate.io/docs/developers/futures/ws/en/#order-list
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of  open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOpenOrdersWs(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchOrdersByStatusWs('open', symbol, since, limit, params);
    }
    /**
     * @method
     * @name gate#fetchClosedOrdersWs
     * @description fetches information on multiple closed orders made by the user
     * @see https://www.gate.io/docs/developers/futures/ws/en/#order-list
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchClosedOrdersWs(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchOrdersByStatusWs('finished', symbol, since, limit, params);
    }
    /**
     * @method
     * @name gate#fetchOrdersWs
     * @see https://www.gate.io/docs/developers/futures/ws/en/#order-list
     * @description fetches information on multiple orders made by the user by status
     * @param {string} status requested order status
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int|undefined} [since] the earliest time in ms to fetch orders for
     * @param {int|undefined} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.orderId] order id to begin at
     * @param {int} [params.limit] the maximum number of order structures to retrieve
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrdersByStatusWs(status, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            symbol = market['symbol'];
            if (market['swap'] !== true) {
                throw new errors.NotSupported(this.id + ' fetchOrdersByStatusWs is only supported by swap markets. Use rest API for other markets');
            }
        }
        const [request, requestParams] = this.prepareOrdersByStatusRequest(status, symbol, since, limit, params);
        const newRequest = this.omit(request, ['settle']);
        const messageType = this.getTypeByMarket(market);
        const channel = messageType + '.order_list';
        const url = this.getUrlByMarket(market);
        await this.authenticate(url, messageType);
        const rawOrders = await this.requestPrivate(url, this.extend(newRequest, requestParams), channel);
        const orders = this.parseOrders(rawOrders, market);
        return this.filterBySymbolSinceLimit(orders, symbol, since, limit);
    }
    /**
     * @method
     * @name gate#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async watchOrderBook(symbol, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        symbol = market['symbol'];
        const marketId = market['id'];
        const [interval, query] = this.handleOptionAndParams(params, 'watchOrderBook', 'interval', '100ms');
        const messageType = this.getTypeByMarket(market);
        const channel = messageType + '.order_book_update';
        const messageHash = 'orderbook' + ':' + symbol;
        const url = this.getUrlByMarket(market);
        const payload = [marketId, interval];
        if (limit === undefined) {
            limit = 100;
        }
        if (market['contract']) {
            const stringLimit = limit.toString();
            payload.push(stringLimit);
        }
        const subscription = {
            'symbol': symbol,
            'limit': limit,
        };
        const orderbook = await this.subscribePublic(url, messageHash, payload, channel, query, subscription);
        return orderbook.limit();
    }
    /**
     * @method
     * @name gate#unWatchOrderBook
     * @description unWatches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async unWatchOrderBook(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        symbol = market['symbol'];
        const marketId = market['id'];
        let interval = '100ms';
        [interval, params] = this.handleOptionAndParams(params, 'watchOrderBook', 'interval', interval);
        const messageType = this.getTypeByMarket(market);
        const channel = messageType + '.order_book_update';
        const subMessageHash = 'orderbook' + ':' + symbol;
        const messageHash = 'unsubscribe:orderbook' + ':' + symbol;
        const url = this.getUrlByMarket(market);
        const payload = [marketId, interval];
        const limit = this.safeInteger(params, 'limit', 100);
        if (market['contract']) {
            const stringLimit = limit.toString();
            payload.push(stringLimit);
        }
        return await this.unSubscribePublicMultiple(url, 'orderbook', [symbol], [messageHash], [subMessageHash], payload, channel, params);
    }
    handleOrderBookSubscription(client, message, subscription) {
        const symbol = this.safeString(subscription, 'symbol');
        const limit = this.safeInteger(subscription, 'limit');
        this.orderbooks[symbol] = this.orderBook({}, limit);
    }
    handleOrderBook(client, message) {
        //
        // spot
        //
        //     {
        //         "time": 1650189272,
        //         "channel": "spot.order_book_update",
        //         "event": "update",
        //         "result": {
        //             "t": 1650189272515,
        //             "e": "depthUpdate",
        //             "E": 1650189272,
        //             "s": "GMT_USDT",
        //             "U": 140595902,
        //             "u": 140595902,
        //             "b": [
        //                 [ '2.51518', "228.119" ],
        //                 [ '2.50587', "1510.11" ],
        //                 [ '2.49944', "67.6" ],
        //             ],
        //             "a": [
        //                 [ '2.5182', "4.199" ],
        //                 [ "2.51926", "1874" ],
        //                 [ '2.53528', "96.529" ],
        //             ]
        //         }
        //     }
        //
        // swap
        //
        //     {
        //         "id": null,
        //         "time": 1650188898,
        //         "channel": "futures.order_book_update",
        //         "event": "update",
        //         "error": null,
        //         "result": {
        //             "t": 1650188898938,
        //             "s": "GMT_USDT",
        //             "U": 1577718307,
        //             "u": 1577719254,
        //             "b": [
        //                 { p: "2.5178", s: 0 },
        //                 { p: "2.5179", s: 0 },
        //                 { p: "2.518", s: 0 },
        //             ],
        //             "a": [
        //                 { p: "2.52", s: 0 },
        //                 { p: "2.5201", s: 0 },
        //                 { p: "2.5203", s: 0 },
        //             ]
        //         }
        //     }
        //
        const channel = this.safeString(message, 'channel');
        const channelParts = channel.split('.');
        const rawMarketType = this.safeString(channelParts, 0);
        const isSpot = rawMarketType === 'spot';
        const marketType = isSpot ? 'spot' : 'contract';
        const delta = this.safeValue(message, 'result');
        const deltaStart = this.safeInteger(delta, 'U');
        const deltaEnd = this.safeInteger(delta, 'u');
        const marketId = this.safeString(delta, 's');
        const symbol = this.safeSymbol(marketId, undefined, '_', marketType);
        const messageHash = 'orderbook:' + symbol;
        const storedOrderBook = this.safeValue(this.orderbooks, symbol, this.orderBook({}));
        const nonce = this.safeInteger(storedOrderBook, 'nonce');
        if (nonce === undefined) {
            let cacheLength = 0;
            if (storedOrderBook !== undefined) {
                cacheLength = storedOrderBook.cache.length;
            }
            const snapshotDelay = this.handleOption('watchOrderBook', 'snapshotDelay', 10);
            const waitAmount = isSpot ? snapshotDelay : 0;
            if (cacheLength === waitAmount) {
                // max limit is 100
                const subscription = client.subscriptions[messageHash];
                const limit = this.safeInteger(subscription, 'limit');
                this.spawn(this.loadOrderBook, client, messageHash, symbol, limit, {}); // needed for c#, number of args needs to match
            }
            storedOrderBook.cache.push(delta);
            return;
        }
        else if (nonce >= deltaEnd) {
            return;
        }
        else if (nonce >= deltaStart - 1) {
            this.handleDelta(storedOrderBook, delta);
        }
        else {
            delete client.subscriptions[messageHash];
            delete this.orderbooks[symbol];
            const checksum = this.handleOption('watchOrderBook', 'checksum', true);
            if (checksum) {
                const error = new errors.ChecksumError(this.id + ' ' + this.orderbookChecksumMessage(symbol));
                client.reject(error, messageHash);
            }
        }
        client.resolve(storedOrderBook, messageHash);
    }
    getCacheIndex(orderBook, cache) {
        const nonce = this.safeInteger(orderBook, 'nonce');
        const firstDelta = cache[0];
        const firstDeltaStart = this.safeInteger(firstDelta, 'U');
        if (nonce < firstDeltaStart) {
            return -1;
        }
        for (let i = 0; i < cache.length; i++) {
            const delta = cache[i];
            const deltaStart = this.safeInteger(delta, 'U');
            const deltaEnd = this.safeInteger(delta, 'u');
            if ((nonce >= deltaStart - 1) && (nonce < deltaEnd)) {
                return i;
            }
        }
        return cache.length;
    }
    handleBidAsks(bookSide, bidAsks) {
        for (let i = 0; i < bidAsks.length; i++) {
            const bidAsk = bidAsks[i];
            if (Array.isArray(bidAsk)) {
                bookSide.storeArray(this.parseBidAsk(bidAsk));
            }
            else {
                const price = this.safeFloat(bidAsk, 'p');
                const amount = this.safeFloat(bidAsk, 's');
                bookSide.store(price, amount);
            }
        }
    }
    handleDelta(orderbook, delta) {
        const timestamp = this.safeInteger(delta, 't');
        orderbook['timestamp'] = timestamp;
        orderbook['datetime'] = this.iso8601(timestamp);
        orderbook['nonce'] = this.safeInteger(delta, 'u');
        const bids = this.safeValue(delta, 'b', []);
        const asks = this.safeValue(delta, 'a', []);
        const storedBids = orderbook['bids'];
        const storedAsks = orderbook['asks'];
        this.handleBidAsks(storedBids, bids);
        this.handleBidAsks(storedAsks, asks);
    }
    /**
     * @method
     * @name gate#watchTicker
     * @see https://www.gate.io/docs/developers/apiv4/ws/en/#tickers-channel
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchTicker(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        symbol = market['symbol'];
        params['callerMethodName'] = 'watchTicker';
        const result = await this.watchTickers([symbol], params);
        return this.safeValue(result, symbol);
    }
    /**
     * @method
     * @name gate#watchTickers
     * @see https://www.gate.io/docs/developers/apiv4/ws/en/#tickers-channel
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchTickers(symbols = undefined, params = {}) {
        return await this.subscribeWatchTickersAndBidsAsks(symbols, 'watchTickers', this.extend({ 'method': 'tickers' }, params));
    }
    handleTicker(client, message) {
        //
        //    {
        //        "time": 1649326221,
        //        "channel": "spot.tickers",
        //        "event": "update",
        //        "result": {
        //          "currency_pair": "BTC_USDT",
        //          "last": "43444.82",
        //          "lowest_ask": "43444.82",
        //          "highest_bid": "43444.81",
        //          "change_percentage": "-4.0036",
        //          "base_volume": "5182.5412425462",
        //          "quote_volume": "227267634.93123952",
        //          "high_24h": "47698",
        //          "low_24h": "42721.03"
        //        }
        //    }
        //
        this.handleTickerAndBidAsk('ticker', client, message);
    }
    /**
     * @method
     * @name gate#watchBidsAsks
     * @see https://www.gate.io/docs/developers/apiv4/ws/en/#best-bid-or-ask-price
     * @see https://www.gate.io/docs/developers/apiv4/ws/en/#order-book-channel
     * @description watches best bid & ask for symbols
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchBidsAsks(symbols = undefined, params = {}) {
        return await this.subscribeWatchTickersAndBidsAsks(symbols, 'watchBidsAsks', this.extend({ 'method': 'book_ticker' }, params));
    }
    handleBidAsk(client, message) {
        //
        //    {
        //        "time": 1671363004,
        //        "time_ms": 1671363004235,
        //        "channel": "spot.book_ticker",
        //        "event": "update",
        //        "result": {
        //          "t": 1671363004228,
        //          "u": 9793320464,
        //          "s": "BTC_USDT",
        //          "b": "16716.8",
        //          "B": "0.0134",
        //          "a": "16716.9",
        //          "A": "0.0353"
        //        }
        //    }
        //
        this.handleTickerAndBidAsk('bidask', client, message);
    }
    async subscribeWatchTickersAndBidsAsks(symbols = undefined, callerMethodName = undefined, params = {}) {
        await this.loadMarkets();
        [callerMethodName, params] = this.handleParamString(params, 'callerMethodName', callerMethodName);
        symbols = this.marketSymbols(symbols, undefined, false);
        const market = this.market(symbols[0]);
        const messageType = this.getTypeByMarket(market);
        const marketIds = this.marketIds(symbols);
        let channelName = undefined;
        [channelName, params] = this.handleOptionAndParams(params, callerMethodName, 'method');
        const url = this.getUrlByMarket(market);
        const channel = messageType + '.' + channelName;
        const isWatchTickers = callerMethodName.indexOf('watchTicker') >= 0;
        const prefix = isWatchTickers ? 'ticker' : 'bidask';
        const messageHashes = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            messageHashes.push(prefix + ':' + symbol);
        }
        const tickerOrBidAsk = await this.subscribePublicMultiple(url, messageHashes, marketIds, channel, params);
        if (this.newUpdates) {
            const items = {};
            items[tickerOrBidAsk['symbol']] = tickerOrBidAsk;
            return items;
        }
        const result = isWatchTickers ? this.tickers : this.bidsasks;
        return this.filterByArray(result, 'symbol', symbols, true);
    }
    handleTickerAndBidAsk(objectName, client, message) {
        const channel = this.safeString(message, 'channel');
        const parts = channel.split('.');
        const rawMarketType = this.safeString(parts, 0);
        const marketType = (rawMarketType === 'futures') ? 'contract' : 'spot';
        const result = this.safeValue(message, 'result');
        let results = [];
        if (Array.isArray(result)) {
            results = this.safeList(message, 'result', []);
        }
        else {
            const rawTicker = this.safeDict(message, 'result', {});
            results = [rawTicker];
        }
        const isTicker = (objectName === 'ticker'); // whether ticker or bid-ask
        for (let i = 0; i < results.length; i++) {
            const rawTicker = results[i];
            const marketId = this.safeString(rawTicker, 's');
            const market = this.safeMarket(marketId, undefined, '_', marketType);
            const parsedItem = this.parseTicker(rawTicker, market);
            const symbol = parsedItem['symbol'];
            if (isTicker) {
                this.tickers[symbol] = parsedItem;
            }
            else {
                this.bidsasks[symbol] = parsedItem;
            }
            const messageHash = objectName + ':' + symbol;
            client.resolve(parsedItem, messageHash);
        }
    }
    /**
     * @method
     * @name gate#watchTrades
     * @description get the list of most recent trades for a particular symbol
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async watchTrades(symbol, since = undefined, limit = undefined, params = {}) {
        return await this.watchTradesForSymbols([symbol], since, limit, params);
    }
    /**
     * @method
     * @name gate#watchTradesForSymbols
     * @description get the list of most recent trades for a particular symbol
     * @param {string[]} symbols unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async watchTradesForSymbols(symbols, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols);
        const marketIds = this.marketIds(symbols);
        const market = this.market(symbols[0]);
        const messageType = this.getTypeByMarket(market);
        const channel = messageType + '.trades';
        const messageHashes = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            messageHashes.push('trades:' + symbol);
        }
        const url = this.getUrlByMarket(market);
        const trades = await this.subscribePublicMultiple(url, messageHashes, marketIds, channel, params);
        if (this.newUpdates) {
            const first = this.safeValue(trades, 0);
            const tradeSymbol = this.safeString(first, 'symbol');
            limit = trades.getLimit(tradeSymbol, limit);
        }
        return this.filterBySinceLimit(trades, since, limit, 'timestamp', true);
    }
    /**
     * @method
     * @name gate#unWatchTradesForSymbols
     * @description get the list of most recent trades for a particular symbol
     * @param {string[]} symbols unified symbol of the market to fetch trades for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async unWatchTradesForSymbols(symbols, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols);
        const marketIds = this.marketIds(symbols);
        const market = this.market(symbols[0]);
        const messageType = this.getTypeByMarket(market);
        const channel = messageType + '.trades';
        const subMessageHashes = [];
        const messageHashes = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            subMessageHashes.push('trades:' + symbol);
            messageHashes.push('unsubscribe:trades:' + symbol);
        }
        const url = this.getUrlByMarket(market);
        return await this.unSubscribePublicMultiple(url, 'trades', symbols, messageHashes, subMessageHashes, marketIds, channel, params);
    }
    /**
     * @method
     * @name gate#unWatchTrades
     * @description get the list of most recent trades for a particular symbol
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async unWatchTrades(symbol, params = {}) {
        return await this.unWatchTradesForSymbols([symbol], params);
    }
    handleTrades(client, message) {
        //
        // {
        //     "time": 1648725035,
        //     "channel": "spot.trades",
        //     "event": "update",
        //     "result": [{
        //       "id": 3130257995,
        //       "create_time": 1648725035,
        //       "create_time_ms": "1648725035923.0",
        //       "side": "sell",
        //       "currency_pair": "LTC_USDT",
        //       "amount": "0.0116",
        //       "price": "130.11"
        //     }]
        // }
        //
        let result = this.safeValue(message, 'result');
        if (!Array.isArray(result)) {
            result = [result];
        }
        const parsedTrades = this.parseTrades(result);
        for (let i = 0; i < parsedTrades.length; i++) {
            const trade = parsedTrades[i];
            const symbol = trade['symbol'];
            let cachedTrades = this.safeValue(this.trades, symbol);
            if (cachedTrades === undefined) {
                const limit = this.safeInteger(this.options, 'tradesLimit', 1000);
                cachedTrades = new Cache.ArrayCache(limit);
                this.trades[symbol] = cachedTrades;
            }
            cachedTrades.append(trade);
            const hash = 'trades:' + symbol;
            client.resolve(cachedTrades, hash);
        }
    }
    /**
     * @method
     * @name gate#watchOHLCV
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async watchOHLCV(symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        symbol = market['symbol'];
        const marketId = market['id'];
        const interval = this.safeString(this.timeframes, timeframe, timeframe);
        const messageType = this.getTypeByMarket(market);
        const channel = messageType + '.candlesticks';
        const messageHash = 'candles:' + interval + ':' + market['symbol'];
        const url = this.getUrlByMarket(market);
        const payload = [interval, marketId];
        const ohlcv = await this.subscribePublic(url, messageHash, payload, channel, params);
        if (this.newUpdates) {
            limit = ohlcv.getLimit(symbol, limit);
        }
        return this.filterBySinceLimit(ohlcv, since, limit, 0, true);
    }
    handleOHLCV(client, message) {
        //
        // {
        //     "time": 1606292600,
        //     "channel": "spot.candlesticks",
        //     "event": "update",
        //     "result": {
        //       "t": "1606292580", // total volume
        //       "v": "2362.32035", // volume
        //       "c": "19128.1", // close
        //       "h": "19128.1", // high
        //       "l": "19128.1", // low
        //       "o": "19128.1", // open
        //       "n": "1m_BTC_USDT" // sub
        //     }
        //   }
        //
        const channel = this.safeString(message, 'channel');
        const channelParts = channel.split('.');
        const rawMarketType = this.safeString(channelParts, 0);
        const marketType = (rawMarketType === 'spot') ? 'spot' : 'contract';
        let result = this.safeValue(message, 'result');
        if (!Array.isArray(result)) {
            result = [result];
        }
        const marketIds = {};
        for (let i = 0; i < result.length; i++) {
            const ohlcv = result[i];
            const subscription = this.safeString(ohlcv, 'n', '');
            const parts = subscription.split('_');
            const timeframe = this.safeString(parts, 0);
            const timeframeId = this.findTimeframe(timeframe);
            const prefix = timeframe + '_';
            const marketId = subscription.replace(prefix, '');
            const symbol = this.safeSymbol(marketId, undefined, '_', marketType);
            const parsed = this.parseOHLCV(ohlcv);
            this.ohlcvs[symbol] = this.safeValue(this.ohlcvs, symbol, {});
            let stored = this.safeValue(this.ohlcvs[symbol], timeframe);
            if (stored === undefined) {
                const limit = this.safeInteger(this.options, 'OHLCVLimit', 1000);
                stored = new Cache.ArrayCacheByTimestamp(limit);
                this.ohlcvs[symbol][timeframeId] = stored;
            }
            stored.append(parsed);
            marketIds[symbol] = timeframe;
        }
        const keys = Object.keys(marketIds);
        for (let i = 0; i < keys.length; i++) {
            const symbol = keys[i];
            const timeframe = marketIds[symbol];
            const interval = this.findTimeframe(timeframe);
            const hash = 'candles' + ':' + interval + ':' + symbol;
            const stored = this.safeValue(this.ohlcvs[symbol], interval);
            client.resolve(stored, hash);
        }
    }
    /**
     * @method
     * @name gate#watchMyTrades
     * @description watches information on multiple trades made by the user
     * @param {string} symbol unified market symbol of the market trades were made in
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async watchMyTrades(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let subType = undefined;
        let type = undefined;
        let marketId = '!' + 'all';
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            marketId = market['id'];
        }
        [type, params] = this.handleMarketTypeAndParams('watchMyTrades', market, params);
        [subType, params] = this.handleSubTypeAndParams('watchMyTrades', market, params);
        const messageType = this.getSupportedMapping(type, {
            'spot': 'spot',
            'margin': 'spot',
            'future': 'futures',
            'swap': 'futures',
            'option': 'options',
        });
        const channel = messageType + '.usertrades';
        let messageHash = 'myTrades';
        if (symbol !== undefined) {
            messageHash += ':' + symbol;
        }
        const isInverse = (subType === 'inverse');
        const url = this.getUrlByMarketType(type, isInverse);
        const payload = [marketId];
        // uid required for non spot markets
        const requiresUid = (type !== 'spot');
        const trades = await this.subscribePrivate(url, messageHash, payload, channel, params, requiresUid);
        if (this.newUpdates) {
            limit = trades.getLimit(symbol, limit);
        }
        return this.filterBySymbolSinceLimit(trades, symbol, since, limit, true);
    }
    handleMyTrades(client, message) {
        //
        // {
        //     "time": 1543205083,
        //     "channel": "futures.usertrades",
        //     "event": "update",
        //     "error": null,
        //     "result": [
        //       {
        //         "id": "3335259",
        //         "create_time": 1628736848,
        //         "create_time_ms": 1628736848321,
        //         "contract": "BTC_USD",
        //         "order_id": "4872460",
        //         "size": 1,
        //         "price": "40000.4",
        //         "role": "maker"
        //       }
        //     ]
        // }
        //
        const result = this.safeValue(message, 'result', []);
        const tradesLength = result.length;
        if (tradesLength === 0) {
            return;
        }
        let cachedTrades = this.myTrades;
        if (cachedTrades === undefined) {
            const limit = this.safeInteger(this.options, 'tradesLimit', 1000);
            cachedTrades = new Cache.ArrayCacheBySymbolById(limit);
            this.myTrades = cachedTrades;
        }
        const parsed = this.parseTrades(result);
        const marketIds = {};
        for (let i = 0; i < parsed.length; i++) {
            const trade = parsed[i];
            cachedTrades.append(trade);
            const symbol = trade['symbol'];
            marketIds[symbol] = true;
        }
        const keys = Object.keys(marketIds);
        for (let i = 0; i < keys.length; i++) {
            const market = keys[i];
            const hash = 'myTrades:' + market;
            client.resolve(cachedTrades, hash);
        }
        client.resolve(cachedTrades, 'myTrades');
    }
    /**
     * @method
     * @name gate#watchBalance
     * @description watch balance and get the amount of funds available for trading or funds locked in orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    async watchBalance(params = {}) {
        await this.loadMarkets();
        let type = undefined;
        let subType = undefined;
        [type, params] = this.handleMarketTypeAndParams('watchBalance', undefined, params);
        [subType, params] = this.handleSubTypeAndParams('watchBalance', undefined, params);
        const isInverse = (subType === 'inverse');
        const url = this.getUrlByMarketType(type, isInverse);
        const requiresUid = (type !== 'spot');
        const channelType = this.getSupportedMapping(type, {
            'spot': 'spot',
            'margin': 'spot',
            'future': 'futures',
            'swap': 'futures',
            'option': 'options',
        });
        const channel = channelType + '.balances';
        const messageHash = type + '.balance';
        return await this.subscribePrivate(url, messageHash, undefined, channel, params, requiresUid);
    }
    handleBalance(client, message) {
        //
        // spot order fill
        //   {
        //       "time": 1653664351,
        //       "channel": "spot.balances",
        //       "event": "update",
        //       "result": [
        //         {
        //           "timestamp": "1653664351",
        //           "timestamp_ms": "1653664351017",
        //           "user": "10406147",
        //           "currency": "LTC",
        //           "change": "-0.0002000000000000",
        //           "total": "0.09986000000000000000",
        //           "available": "0.09986000000000000000"
        //         }
        //       ]
        //   }
        //
        // account transfer
        //
        //    {
        //        "id": null,
        //        "time": 1653665088,
        //        "channel": "futures.balances",
        //        "event": "update",
        //        "error": null,
        //        "result": [
        //          {
        //            "balance": 25.035008537,
        //            "change": 25,
        //            "text": "-",
        //            "time": 1653665088,
        //            "time_ms": 1653665088286,
        //            "type": "dnw",
        //            "user": "10406147"
        //          }
        //        ]
        //   }
        //
        // swap order fill
        //   {
        //       "id": null,
        //       "time": 1653665311,
        //       "channel": "futures.balances",
        //       "event": "update",
        //       "error": null,
        //       "result": [
        //         {
        //           "balance": 20.031873037,
        //           "change": -0.0031355,
        //           "text": "LTC_USDT:165551103273",
        //           "time": 1653665311,
        //           "time_ms": 1653665311437,
        //           "type": "fee",
        //           "user": "10406147"
        //         }
        //       ]
        //   }
        //
        const result = this.safeValue(message, 'result', []);
        const timestamp = this.safeInteger(message, 'time_ms');
        this.balance['info'] = result;
        this.balance['timestamp'] = timestamp;
        this.balance['datetime'] = this.iso8601(timestamp);
        for (let i = 0; i < result.length; i++) {
            const rawBalance = result[i];
            const account = this.account();
            const currencyId = this.safeString(rawBalance, 'currency', 'USDT'); // when not present it is USDT
            const code = this.safeCurrencyCode(currencyId);
            account['free'] = this.safeString(rawBalance, 'available');
            account['total'] = this.safeString2(rawBalance, 'total', 'balance');
            this.balance[code] = account;
        }
        const channel = this.safeString(message, 'channel');
        const parts = channel.split('.');
        const rawType = this.safeString(parts, 0);
        const channelType = this.getSupportedMapping(rawType, {
            'spot': 'spot',
            'futures': 'swap',
            'options': 'option',
        });
        const messageHash = channelType + '.balance';
        this.balance = this.safeBalance(this.balance);
        client.resolve(this.balance, messageHash);
    }
    /**
     * @method
     * @name gate#watchPositions
     * @see https://www.gate.io/docs/developers/futures/ws/en/#positions-subscription
     * @see https://www.gate.io/docs/developers/delivery/ws/en/#positions-subscription
     * @see https://www.gate.io/docs/developers/options/ws/en/#positions-channel
     * @description watch all open positions
     * @param {string[]} [symbols] list of unified market symbols to watch positions for
     * @param {int} [since] the earliest time in ms to fetch positions for
     * @param {int} [limit] the maximum number of positions to retrieve
     * @param {object} params extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/en/latest/manual.html#position-structure}
     */
    async watchPositions(symbols = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let market = undefined;
        symbols = this.marketSymbols(symbols);
        const payload = ['!' + 'all'];
        if (!this.isEmpty(symbols)) {
            market = this.getMarketFromSymbols(symbols);
        }
        let type = undefined;
        let query = undefined;
        [type, query] = this.handleMarketTypeAndParams('watchPositions', market, params);
        if (type === 'spot') {
            type = 'swap';
        }
        const typeId = this.getSupportedMapping(type, {
            'future': 'futures',
            'swap': 'futures',
            'option': 'options',
        });
        let messageHash = type + ':positions';
        if (!this.isEmpty(symbols)) {
            messageHash += '::' + symbols.join(',');
        }
        const channel = typeId + '.positions';
        let subType = undefined;
        [subType, query] = this.handleSubTypeAndParams('watchPositions', market, query);
        const isInverse = (subType === 'inverse');
        const url = this.getUrlByMarketType(type, isInverse);
        const client = this.client(url);
        this.setPositionsCache(client, type, symbols);
        const fetchPositionsSnapshot = this.handleOption('watchPositions', 'fetchPositionsSnapshot', true);
        const awaitPositionsSnapshot = this.handleOption('watchPositions', 'awaitPositionsSnapshot', true);
        const cache = this.safeValue(this.positions, type);
        if (fetchPositionsSnapshot && awaitPositionsSnapshot && cache === undefined) {
            return await client.future(type + ':fetchPositionsSnapshot');
        }
        const positions = await this.subscribePrivate(url, messageHash, payload, channel, query, true);
        if (this.newUpdates) {
            return positions;
        }
        return this.filterBySymbolsSinceLimit(this.positions[type], symbols, since, limit, true);
    }
    setPositionsCache(client, type, symbols = undefined) {
        if (this.positions === undefined) {
            this.positions = {};
        }
        if (type in this.positions) {
            return;
        }
        const fetchPositionsSnapshot = this.handleOption('watchPositions', 'fetchPositionsSnapshot', false);
        if (fetchPositionsSnapshot) {
            const messageHash = type + ':fetchPositionsSnapshot';
            if (!(messageHash in client.futures)) {
                client.future(messageHash);
                this.spawn(this.loadPositionsSnapshot, client, messageHash, type);
            }
        }
        else {
            this.positions[type] = new Cache.ArrayCacheBySymbolBySide();
        }
    }
    async loadPositionsSnapshot(client, messageHash, type) {
        const positions = await this.fetchPositions(undefined, { 'type': type });
        this.positions[type] = new Cache.ArrayCacheBySymbolBySide();
        const cache = this.positions[type];
        for (let i = 0; i < positions.length; i++) {
            const position = positions[i];
            cache.append(position);
        }
        // don't remove the future from the .futures cache
        const future = client.futures[messageHash];
        future.resolve(cache);
        client.resolve(cache, type + ':position');
    }
    handlePositions(client, message) {
        //
        //    {
        //        time: 1693158497,
        //        time_ms: 1693158497204,
        //        channel: 'futures.positions',
        //        event: 'update',
        //        result: [{
        //            contract: 'XRP_USDT',
        //            cross_leverage_limit: 0,
        //            entry_price: 0.5253,
        //            history_pnl: 0,
        //            history_point: 0,
        //            last_close_pnl: 0,
        //            leverage: 0,
        //            leverage_max: 50,
        //            liq_price: 0.0361,
        //            maintenance_rate: 0.01,
        //            margin: 4.89609962852,
        //            mode: 'single',
        //            realised_pnl: -0.0026265,
        //            realised_point: 0,
        //            risk_limit: 500000,
        //            size: 1,
        //            time: 1693158497,
        //            time_ms: 1693158497195,
        //            update_id: 1,
        //            user: '10444586'
        //        }]
        //    }
        //
        const type = this.getMarketTypeByUrl(client.url);
        const data = this.safeValue(message, 'result', []);
        const cache = this.positions[type];
        const newPositions = [];
        for (let i = 0; i < data.length; i++) {
            const rawPosition = data[i];
            const position = this.parsePosition(rawPosition);
            newPositions.push(position);
            cache.append(position);
        }
        const messageHashes = this.findMessageHashes(client, type + ':positions::');
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
        client.resolve(newPositions, type + ':positions');
    }
    /**
     * @method
     * @name gate#watchOrders
     * @description watches information on multiple orders made by the user
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] spot, margin, swap, future, or option. Required if listening to all symbols.
     * @param {boolean} [params.isInverse] if future, listen to inverse or linear contracts
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async watchOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            symbol = market['symbol'];
        }
        let type = undefined;
        let query = undefined;
        [type, query] = this.handleMarketTypeAndParams('watchOrders', market, params);
        const typeId = this.getSupportedMapping(type, {
            'spot': 'spot',
            'margin': 'spot',
            'future': 'futures',
            'swap': 'futures',
            'option': 'options',
        });
        const channel = typeId + '.orders';
        let messageHash = 'orders';
        let payload = ['!' + 'all'];
        if (symbol !== undefined) {
            messageHash += ':' + market['id'];
            payload = [market['id']];
        }
        let subType = undefined;
        [subType, query] = this.handleSubTypeAndParams('watchOrders', market, query);
        const isInverse = (subType === 'inverse');
        const url = this.getUrlByMarketType(type, isInverse);
        // uid required for non spot markets
        const requiresUid = (type !== 'spot');
        const orders = await this.subscribePrivate(url, messageHash, payload, channel, query, requiresUid);
        if (this.newUpdates) {
            limit = orders.getLimit(symbol, limit);
        }
        return this.filterBySinceLimit(orders, since, limit, 'timestamp', true);
    }
    handleOrder(client, message) {
        //
        // {
        //     "time": 1605175506,
        //     "channel": "spot.orders",
        //     "event": "update",
        //     "result": [
        //       {
        //         "id": "30784435",
        //         "user": 123456,
        //         "text": "t-abc",
        //         "create_time": "1605175506",
        //         "create_time_ms": "1605175506123",
        //         "update_time": "1605175506",
        //         "update_time_ms": "1605175506123",
        //         "event": "put",
        //         "currency_pair": "BTC_USDT",
        //         "type": "limit",
        //         "account": "spot",
        //         "side": "sell",
        //         "amount": "1",
        //         "price": "10001",
        //         "time_in_force": "gtc",
        //         "left": "1",
        //         "filled_total": "0",
        //         "fee": "0",
        //         "fee_currency": "USDT",
        //         "point_fee": "0",
        //         "gt_fee": "0",
        //         "gt_discount": true,
        //         "rebated_fee": "0",
        //         "rebated_fee_currency": "USDT"
        //       }
        //     ]
        // }
        //
        const orders = this.safeValue(message, 'result', []);
        const limit = this.safeInteger(this.options, 'ordersLimit', 1000);
        if (this.orders === undefined) {
            this.orders = new Cache.ArrayCacheBySymbolById(limit);
        }
        const stored = this.orders;
        const marketIds = {};
        const parsedOrders = this.parseOrders(orders);
        for (let i = 0; i < parsedOrders.length; i++) {
            const parsed = parsedOrders[i];
            // inject order status
            const info = this.safeValue(parsed, 'info');
            const event = this.safeString(info, 'event');
            if (event === 'put' || event === 'update') {
                parsed['status'] = 'open';
            }
            else if (event === 'finish') {
                const status = this.safeString(parsed, 'status');
                if (status === undefined) {
                    const left = this.safeInteger(info, 'left');
                    parsed['status'] = (left === 0) ? 'closed' : 'canceled';
                }
            }
            stored.append(parsed);
            const symbol = parsed['symbol'];
            const market = this.market(symbol);
            marketIds[market['id']] = true;
        }
        const keys = Object.keys(marketIds);
        for (let i = 0; i < keys.length; i++) {
            const messageHash = 'orders:' + keys[i];
            client.resolve(this.orders, messageHash);
        }
        client.resolve(this.orders, 'orders');
    }
    /**
     * @method
     * @name gate#watchMyLiquidations
     * @description watch the public liquidations of a trading pair
     * @see https://www.gate.io/docs/developers/futures/ws/en/#liquidates-api
     * @see https://www.gate.io/docs/developers/delivery/ws/en/#liquidates-api
     * @see https://www.gate.io/docs/developers/options/ws/en/#liquidates-channel
     * @param {string} symbol unified CCXT market symbol
     * @param {int} [since] the earliest time in ms to fetch liquidations for
     * @param {int} [limit] the maximum number of liquidation structures to retrieve
     * @param {object} [params] exchange specific parameters for the bitmex api endpoint
     * @returns {object} an array of [liquidation structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#liquidation-structure}
     */
    async watchMyLiquidations(symbol, since = undefined, limit = undefined, params = {}) {
        return this.watchMyLiquidationsForSymbols([symbol], since, limit, params);
    }
    /**
     * @method
     * @name gate#watchMyLiquidationsForSymbols
     * @description watch the private liquidations of a trading pair
     * @see https://www.gate.io/docs/developers/futures/ws/en/#liquidates-api
     * @see https://www.gate.io/docs/developers/delivery/ws/en/#liquidates-api
     * @see https://www.gate.io/docs/developers/options/ws/en/#liquidates-channel
     * @param {string[]} symbols unified CCXT market symbols
     * @param {int} [since] the earliest time in ms to fetch liquidations for
     * @param {int} [limit] the maximum number of liquidation structures to retrieve
     * @param {object} [params] exchange specific parameters for the gate api endpoint
     * @returns {object} an array of [liquidation structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#liquidation-structure}
     */
    async watchMyLiquidationsForSymbols(symbols = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols, undefined, true, true);
        const market = this.getMarketFromSymbols(symbols);
        let type = undefined;
        let query = undefined;
        [type, query] = this.handleMarketTypeAndParams('watchMyLiquidationsForSymbols', market, params);
        const typeId = this.getSupportedMapping(type, {
            'future': 'futures',
            'swap': 'futures',
            'option': 'options',
        });
        let subType = undefined;
        [subType, query] = this.handleSubTypeAndParams('watchMyLiquidationsForSymbols', market, query);
        const isInverse = (subType === 'inverse');
        const url = this.getUrlByMarketType(type, isInverse);
        const payload = [];
        let messageHash = '';
        if (this.isEmpty(symbols)) {
            if (typeId !== 'futures' && !isInverse) {
                throw new errors.BadRequest(this.id + ' watchMyLiquidationsForSymbols() does not support listening to all symbols, you must call watchMyLiquidations() instead for each symbol you wish to watch.');
            }
            messageHash = 'myLiquidations';
            payload.push('!all');
        }
        else {
            const symbolsLength = symbols.length;
            if (symbolsLength !== 1) {
                throw new errors.BadRequest(this.id + ' watchMyLiquidationsForSymbols() only allows one symbol at a time. To listen to several symbols call watchMyLiquidationsForSymbols() several times.');
            }
            messageHash = 'myLiquidations::' + symbols[0];
            payload.push(market['id']);
        }
        const channel = typeId + '.liquidates';
        const newLiquidations = await this.subscribePrivate(url, messageHash, payload, channel, query, true);
        if (this.newUpdates) {
            return newLiquidations;
        }
        return this.filterBySymbolsSinceLimit(this.liquidations, symbols, since, limit, true);
    }
    handleLiquidation(client, message) {
        //
        // future / delivery
        //     {
        //         "channel":"futures.liquidates",
        //         "event":"update",
        //         "time":1541505434,
        //         "time_ms":1541505434123,
        //         "result":[
        //            {
        //               "entry_price":209,
        //               "fill_price":215.1,
        //               "left":0,
        //               "leverage":0.0,
        //               "liq_price":213,
        //               "margin":0.007816722941,
        //               "mark_price":213,
        //               "order_id":4093362,
        //               "order_price":215.1,
        //               "size":-124,
        //               "time":1541486601,
        //               "time_ms":1541486601123,
        //               "contract":"BTC_USD",
        //               "user":"1040xxxx"
        //            }
        //         ]
        //     }
        // option
        //    {
        //        "channel":"options.liquidates",
        //        "event":"update",
        //        "time":1630654851,
        //        "result":[
        //           {
        //              "user":"1xxxx",
        //              "init_margin":1190,
        //              "maint_margin":1042.5,
        //              "order_margin":0,
        //              "time":1639051907,
        //              "time_ms":1639051907000
        //           }
        //        ]
        //    }
        //
        const rawLiquidations = this.safeList(message, 'result', []);
        const newLiquidations = [];
        for (let i = 0; i < rawLiquidations.length; i++) {
            const rawLiquidation = rawLiquidations[i];
            const liquidation = this.parseWsLiquidation(rawLiquidation);
            const symbol = this.safeString(liquidation, 'symbol');
            let liquidations = this.safeValue(this.liquidations, symbol);
            if (liquidations === undefined) {
                const limit = this.safeInteger(this.options, 'liquidationsLimit', 1000);
                liquidations = new Cache.ArrayCache(limit);
            }
            liquidations.append(liquidation);
            this.liquidations[symbol] = liquidations;
            client.resolve(liquidations, 'myLiquidations::' + symbol);
        }
        client.resolve(newLiquidations, 'myLiquidations');
    }
    parseWsLiquidation(liquidation, market = undefined) {
        //
        // future / delivery
        //    {
        //        "entry_price": 209,
        //        "fill_price": 215.1,
        //        "left": 0,
        //        "leverage": 0.0,
        //        "liq_price": 213,
        //        "margin": 0.007816722941,
        //        "mark_price": 213,
        //        "order_id": 4093362,
        //        "order_price": 215.1,
        //        "size": -124,
        //        "time": 1541486601,
        //        "time_ms": 1541486601123,
        //        "contract": "BTC_USD",
        //        "user": "1040xxxx"
        //    }
        // option
        //    {
        //        "user": "1xxxx",
        //        "init_margin": 1190,
        //        "maint_margin": 1042.5,
        //        "order_margin": 0,
        //        "time": 1639051907,
        //        "time_ms": 1639051907000
        //    }
        //
        const marketId = this.safeString(liquidation, 'contract');
        market = this.safeMarket(marketId, market);
        const timestamp = this.safeInteger(liquidation, 'time_ms');
        const originalSize = this.safeString(liquidation, 'size');
        const left = this.safeString(liquidation, 'left');
        const amount = Precise["default"].stringAbs(Precise["default"].stringSub(originalSize, left));
        return this.safeLiquidation({
            'info': liquidation,
            'symbol': this.safeSymbol(marketId, market),
            'contracts': this.parseNumber(amount),
            'contractSize': this.safeNumber(market, 'contractSize'),
            'price': this.safeNumber(liquidation, 'fill_price'),
            'baseValue': undefined,
            'quoteValue': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
        });
    }
    handleErrorMessage(client, message) {
        //
        //    {
        //        "time": 1647274664,
        //        "channel": "futures.orders",
        //        "event": "subscribe",
        //        "error": { code: 2, message: "unknown contract BTC_USDT_20220318" },
        //    }
        //    {
        //      "time": 1647276473,
        //      "channel": "futures.orders",
        //      "event": "subscribe",
        //      "error": {
        //        "code": 4,
        //        "message": "{"label":"INVALID_KEY","message":"Invalid key provided"}\n"
        //      },
        //      "result": null
        //    }
        //    {
        //       header: {
        //         response_time: '1718551891329',
        //         status: '400',
        //         channel: 'spot.order_place',
        //         event: 'api',
        //         client_id: '81.34.68.6-0xc16375e2c0',
        //         conn_id: '9539116e0e09678f'
        //       },
        //       data: { errs: { label: 'AUTHENTICATION_FAILED', message: 'Not login' } },
        //       request_id: '10406147'
        //     }
        //     {
        //         "time": 1739853211,
        //         "time_ms": 1739853211201,
        //         "id": 1,
        //         "conn_id": "62f2c1dabbe186d7",
        //         "trace_id": "cdb02a8c0b61086b2fe6f8fad2f98c54",
        //         "channel": "spot.trades",
        //         "event": "subscribe",
        //         "payload": [
        //             "LUNARLENS_USDT",
        //             "ETH_USDT"
        //         ],
        //         "error": {
        //             "code": 2,
        //             "message": "unknown currency pair: LUNARLENS_USDT"
        //         },
        //         "result": {
        //             "status": "fail"
        //         },
        //         "requestId": "cdb02a8c0b61086b2fe6f8fad2f98c54"
        //     }
        //
        const data = this.safeDict(message, 'data');
        const errs = this.safeDict(data, 'errs');
        const error = this.safeDict(message, 'error', errs);
        const code = this.safeString2(error, 'code', 'label');
        const id = this.safeStringN(message, ['id', 'requestId', 'request_id']);
        if (error !== undefined) {
            const messageHash = this.safeString(client.subscriptions, id);
            try {
                this.throwExactlyMatchedException(this.exceptions['ws']['exact'], code, this.json(message));
                this.throwExactlyMatchedException(this.exceptions['exact'], code, this.json(errs));
                const errorMessage = this.safeString(error, 'message', this.safeString(errs, 'message'));
                this.throwBroadlyMatchedException(this.exceptions['ws']['broad'], errorMessage, this.json(message));
                throw new errors.ExchangeError(this.json(message));
            }
            catch (e) {
                client.reject(e, messageHash);
                if ((messageHash !== undefined) && (messageHash in client.subscriptions)) {
                    delete client.subscriptions[messageHash];
                }
                // remove subscriptions for watchSymbols
                const channel = this.safeString(message, 'channel');
                if ((channel !== undefined) && (channel.indexOf('.') > 0)) {
                    const parsedChannel = channel.split('.');
                    const payload = this.safeList(message, 'payload', []);
                    for (let i = 0; i < payload.length; i++) {
                        const marketType = parsedChannel[0] === 'futures' ? 'swap' : parsedChannel[0];
                        const symbol = this.safeSymbol(payload[i], undefined, '_', marketType);
                        const messageHashSymbol = parsedChannel[1] + ':' + symbol;
                        if ((messageHashSymbol !== undefined) && (messageHashSymbol in client.subscriptions)) {
                            delete client.subscriptions[messageHashSymbol];
                        }
                    }
                }
            }
            if ((id !== undefined) && (id in client.subscriptions)) {
                delete client.subscriptions[id];
            }
            return true;
        }
        return false;
    }
    handleBalanceSubscription(client, message, subscription = undefined) {
        this.balance = {};
    }
    handleSubscriptionStatus(client, message) {
        const channel = this.safeString(message, 'channel');
        const methods = {
            'balance': this.handleBalanceSubscription,
            'spot.order_book_update': this.handleOrderBookSubscription,
            'futures.order_book_update': this.handleOrderBookSubscription,
        };
        const id = this.safeString(message, 'id');
        if (channel in methods) {
            const subscriptionHash = this.safeString(client.subscriptions, id);
            const subscription = this.safeValue(client.subscriptions, subscriptionHash);
            const method = methods[channel];
            method.call(this, client, message, subscription);
        }
        if (id in client.subscriptions) {
            delete client.subscriptions[id];
        }
    }
    handleUnSubscribe(client, message) {
        //
        // {
        //     "time":1725534679,
        //     "time_ms":1725534679786,
        //     "id":2,
        //     "conn_id":"fac539b443fd7002",
        //     "trace_id":"efe1d282b630b4aa266b84bee177791a",
        //     "channel":"spot.trades",
        //     "event":"unsubscribe",
        //     "payload":[
        //        "LTC_USDT"
        //     ],
        //     "result":{
        //        "status":"success"
        //     },
        //     "requestId":"efe1d282b630b4aa266b84bee177791a"
        // }
        //
        const id = this.safeString(message, 'id');
        const keys = Object.keys(client.subscriptions);
        for (let i = 0; i < keys.length; i++) {
            const messageHash = keys[i];
            if (!(messageHash in client.subscriptions)) {
                continue;
                // the previous iteration can have deleted the messageHash from the subscriptions
            }
            if (messageHash.startsWith('unsubscribe')) {
                const subscription = client.subscriptions[messageHash];
                const subId = this.safeString(subscription, 'id');
                if (id !== subId) {
                    continue;
                }
                const messageHashes = this.safeList(subscription, 'messageHashes', []);
                const subMessageHashes = this.safeList(subscription, 'subMessageHashes', []);
                for (let j = 0; j < messageHashes.length; j++) {
                    const unsubHash = messageHashes[j];
                    const subHash = subMessageHashes[j];
                    this.cleanUnsubscription(client, subHash, unsubHash);
                }
                this.cleanCache(subscription);
            }
        }
    }
    cleanCache(subscription) {
        const topic = this.safeString(subscription, 'topic', '');
        const symbols = this.safeList(subscription, 'symbols', []);
        const symbolsLength = symbols.length;
        if (topic === 'ohlcv') {
            const symbolsAndTimeFrames = this.safeList(subscription, 'symbolsAndTimeframes', []);
            for (let i = 0; i < symbolsAndTimeFrames.length; i++) {
                const symbolAndTimeFrame = symbolsAndTimeFrames[i];
                const symbol = this.safeString(symbolAndTimeFrame, 0);
                const timeframe = this.safeString(symbolAndTimeFrame, 1);
                delete this.ohlcvs[symbol][timeframe];
            }
        }
        else if (symbolsLength > 0) {
            for (let i = 0; i < symbols.length; i++) {
                const symbol = symbols[i];
                if (topic.endsWith('trades')) {
                    delete this.trades[symbol];
                }
                else if (topic === 'orderbook') {
                    delete this.orderbooks[symbol];
                }
                else if (topic === 'ticker') {
                    delete this.tickers[symbol];
                }
            }
        }
        else {
            if (topic.endsWith('trades')) {
                // don't reset this.myTrades directly here
                // because in c# we need to use a different object
                const keys = Object.keys(this.trades);
                for (let i = 0; i < keys.length; i++) {
                    delete this.trades[keys[i]];
                }
            }
        }
    }
    handleMessage(client, message) {
        //
        // subscribe
        //    {
        //        "time": 1649062304,
        //        "id": 1649062303,
        //        "channel": "spot.candlesticks",
        //        "event": "subscribe",
        //        "result": { status: "success" }
        //    }
        //
        // candlestick
        //    {
        //        "time": 1649063328,
        //        "channel": "spot.candlesticks",
        //        "event": "update",
        //        "result": {
        //          "t": "1649063280",
        //          "v": "58932.23174896",
        //          "c": "45966.47",
        //          "h": "45997.24",
        //          "l": "45966.47",
        //          "o": "45975.18",
        //          "n": "1m_BTC_USDT",
        //          "a": "1.281699"
        //        }
        //     }
        //
        //  orders
        //   {
        //       "time": 1630654851,
        //       "channel": "options.orders", or futures.orders or spot.orders
        //       "event": "update",
        //       "result": [
        //          {
        //             "contract": "BTC_USDT-20211130-65000-C",
        //             "create_time": 1637897000,
        //               (...)
        //       ]
        //   }
        // orderbook
        //   {
        //       "time": 1649770525,
        //       "channel": "spot.order_book_update",
        //       "event": "update",
        //       "result": {
        //         "t": 1649770525653,
        //         "e": "depthUpdate",
        //         "E": 1649770525,
        //         "s": "LTC_USDT",
        //         "U": 2622525645,
        //         "u": 2622525665,
        //         "b": [
        //           [Array], [Array],
        //           [Array], [Array],
        //           [Array], [Array],
        //           [Array], [Array],
        //           [Array], [Array],
        //           [Array]
        //         ],
        //         "a": [
        //           [Array], [Array],
        //           [Array], [Array],
        //           [Array], [Array],
        //           [Array], [Array],
        //           [Array], [Array],
        //           [Array]
        //         ]
        //       }
        //     }
        //
        // balance update
        //
        //    {
        //        "time": 1653664351,
        //        "channel": "spot.balances",
        //        "event": "update",
        //        "result": [
        //          {
        //            "timestamp": "1653664351",
        //            "timestamp_ms": "1653664351017",
        //            "user": "10406147",
        //            "currency": "LTC",
        //            "change": "-0.0002000000000000",
        //            "total": "0.09986000000000000000",
        //            "available": "0.09986000000000000000"
        //          }
        //        ]
        //    }
        //
        if (this.handleErrorMessage(client, message)) {
            return;
        }
        const event = this.safeString(message, 'event');
        if (event === 'subscribe') {
            this.handleSubscriptionStatus(client, message);
            return;
        }
        if (event === 'unsubscribe') {
            this.handleUnSubscribe(client, message);
            return;
        }
        const channel = this.safeString(message, 'channel', '');
        const channelParts = channel.split('.');
        const channelType = this.safeValue(channelParts, 1);
        const v4Methods = {
            'usertrades': this.handleMyTrades,
            'candlesticks': this.handleOHLCV,
            'orders': this.handleOrder,
            'positions': this.handlePositions,
            'tickers': this.handleTicker,
            'book_ticker': this.handleBidAsk,
            'trades': this.handleTrades,
            'order_book_update': this.handleOrderBook,
            'balances': this.handleBalance,
            'liquidates': this.handleLiquidation,
        };
        const method = this.safeValue(v4Methods, channelType);
        if (method !== undefined) {
            method.call(this, client, message);
        }
        const requestId = this.safeString(message, 'request_id');
        if (requestId === 'authenticated') {
            this.handleAuthenticationMessage(client, message);
            return;
        }
        if (requestId !== undefined) {
            const data = this.safeDict(message, 'data');
            // use safeValue as result may be Array or an Object
            const result = this.safeValue(data, 'result');
            const ack = this.safeBool(message, 'ack');
            if (ack !== true) {
                client.resolve(result, requestId);
            }
        }
    }
    getUrlByMarket(market) {
        const baseUrl = this.urls['api'][market['type']];
        if (market['contract']) {
            return market['linear'] ? baseUrl['usdt'] : baseUrl['btc'];
        }
        else {
            return baseUrl;
        }
    }
    getTypeByMarket(market) {
        if (market['spot']) {
            return 'spot';
        }
        else if (market['option']) {
            return 'options';
        }
        else {
            return 'futures';
        }
    }
    getUrlByMarketType(type, isInverse = false) {
        const api = this.urls['api'];
        const url = api[type];
        if ((type === 'swap') || (type === 'future')) {
            return isInverse ? url['btc'] : url['usdt'];
        }
        else {
            return url;
        }
    }
    getMarketTypeByUrl(url) {
        const findBy = {
            'op-': 'option',
            'delivery': 'future',
            'fx': 'swap',
        };
        const keys = Object.keys(findBy);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const value = findBy[key];
            if (url.indexOf(key) >= 0) {
                return value;
            }
        }
        return 'spot';
    }
    requestId() {
        // their support said that reqid must be an int32, not documented
        const reqid = this.sum(this.safeInteger(this.options, 'reqid', 0), 1);
        this.options['reqid'] = reqid;
        return reqid;
    }
    async subscribePublic(url, messageHash, payload, channel, params = {}, subscription = undefined) {
        const requestId = this.requestId();
        const time = this.seconds();
        const request = {
            'id': requestId,
            'time': time,
            'channel': channel,
            'event': 'subscribe',
            'payload': payload,
        };
        if (subscription !== undefined) {
            const client = this.client(url);
            if (!(messageHash in client.subscriptions)) {
                const tempSubscriptionHash = requestId.toString();
                client.subscriptions[tempSubscriptionHash] = messageHash;
            }
        }
        const message = this.extend(request, params);
        return await this.watch(url, messageHash, message, messageHash, subscription);
    }
    async subscribePublicMultiple(url, messageHashes, payload, channel, params = {}) {
        const requestId = this.requestId();
        const time = this.seconds();
        const request = {
            'id': requestId,
            'time': time,
            'channel': channel,
            'event': 'subscribe',
            'payload': payload,
        };
        const message = this.extend(request, params);
        return await this.watchMultiple(url, messageHashes, message, messageHashes);
    }
    async unSubscribePublicMultiple(url, topic, symbols, messageHashes, subMessageHashes, payload, channel, params = {}) {
        const requestId = this.requestId();
        const time = this.seconds();
        const request = {
            'id': requestId,
            'time': time,
            'channel': channel,
            'event': 'unsubscribe',
            'payload': payload,
        };
        const sub = {
            'id': requestId.toString(),
            'topic': topic,
            'unsubscribe': true,
            'messageHashes': messageHashes,
            'subMessageHashes': subMessageHashes,
            'symbols': symbols,
        };
        const message = this.extend(request, params);
        return await this.watchMultiple(url, messageHashes, message, messageHashes, sub);
    }
    async authenticate(url, messageType) {
        const channel = messageType + '.login';
        const client = this.client(url);
        const messageHash = 'authenticated';
        const future = client.future(messageHash);
        const authenticated = this.safeValue(client.subscriptions, messageHash);
        if (authenticated === undefined) {
            return await this.requestPrivate(url, {}, channel, messageHash);
        }
        return future;
    }
    handleAuthenticationMessage(client, message) {
        const messageHash = 'authenticated';
        const future = this.safeValue(client.futures, messageHash);
        future.resolve(true);
    }
    async requestPrivate(url, reqParams, channel, requestId = undefined) {
        this.checkRequiredCredentials();
        // uid is required for some subscriptions only so it's not a part of required credentials
        const event = 'api';
        if (requestId === undefined) {
            const reqId = this.requestId();
            requestId = reqId.toString();
        }
        const messageHash = requestId;
        const time = this.seconds();
        // unfortunately, PHP demands double quotes for the escaped newline symbol
        const signatureString = [event, channel, this.json(reqParams), time.toString()].join("\n"); // eslint-disable-line quotes
        const signature = this.hmac(this.encode(signatureString), this.encode(this.secret), sha512.sha512, 'hex');
        const payload = {
            'req_id': requestId,
            'timestamp': time.toString(),
            'api_key': this.apiKey,
            'signature': signature,
            'req_param': reqParams,
        };
        const request = {
            'id': requestId,
            'time': time,
            'channel': channel,
            'event': event,
            'payload': payload,
        };
        return await this.watch(url, messageHash, request, messageHash, requestId);
    }
    async subscribePrivate(url, messageHash, payload, channel, params, requiresUid = false) {
        this.checkRequiredCredentials();
        // uid is required for some subscriptions only so it's not a part of required credentials
        if (requiresUid) {
            if (this.uid === undefined || this.uid.length === 0) {
                throw new errors.ArgumentsRequired(this.id + ' requires uid to subscribe');
            }
            const idArray = [this.uid];
            if (payload === undefined) {
                payload = idArray;
            }
            else {
                payload = this.arrayConcat(idArray, payload);
            }
        }
        const time = this.seconds();
        const event = 'subscribe';
        const signaturePayload = 'channel=' + channel + '&' + 'event=' + event + '&' + 'time=' + time.toString();
        const signature = this.hmac(this.encode(signaturePayload), this.encode(this.secret), sha512.sha512, 'hex');
        const auth = {
            'method': 'api_key',
            'KEY': this.apiKey,
            'SIGN': signature,
        };
        const requestId = this.requestId();
        const request = {
            'id': requestId,
            'time': time,
            'channel': channel,
            'event': event,
            'auth': auth,
        };
        if (payload !== undefined) {
            request['payload'] = payload;
        }
        const client = this.client(url);
        if (!(messageHash in client.subscriptions)) {
            const tempSubscriptionHash = requestId.toString();
            // in case of authenticationError we will throw
            client.subscriptions[tempSubscriptionHash] = messageHash;
        }
        const message = this.extend(request, params);
        return await this.watch(url, messageHash, message, messageHash, messageHash);
    }
}

module.exports = gate;
