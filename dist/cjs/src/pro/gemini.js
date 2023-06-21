'use strict';

var gemini$1 = require('../gemini.js');
var Cache = require('../base/ws/Cache.js');
var errors = require('../base/errors.js');
var sha512 = require('../static_dependencies/noble-hashes/sha512.js');

//  ---------------------------------------------------------------------------
//  ---------------------------------------------------------------------------
class gemini extends gemini$1 {
    describe() {
        return this.deepExtend(super.describe(), {
            'has': {
                'ws': true,
                'watchBalance': false,
                'watchTicker': false,
                'watchTickers': false,
                'watchTrades': true,
                'watchMyTrades': false,
                'watchOrders': true,
                'watchOrderBook': true,
                'watchOHLCV': true,
            },
            'hostname': 'api.gemini.com',
            'urls': {
                'api': {
                    'ws': 'wss://api.gemini.com',
                },
                'test': {
                    'ws': 'wss://api.sandbox.gemini.com',
                },
            },
        });
    }
    async watchTrades(symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name gemini#watchTrades
         * @description watch the list of most recent trades for a particular symbol
         * @see https://docs.gemini.com/websocket-api/#market-data-version-2
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the gemini api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const messageHash = 'trades:' + market['symbol'];
        const marketId = market['id'];
        const request = {
            'type': 'subscribe',
            'subscriptions': [
                {
                    'name': 'l2',
                    'symbols': [
                        marketId.toUpperCase(),
                    ],
                },
            ],
        };
        const subscribeHash = 'l2:' + market['symbol'];
        const url = this.urls['api']['ws'] + '/v2/marketdata';
        const trades = await this.watch(url, messageHash, request, subscribeHash);
        if (this.newUpdates) {
            limit = trades.getLimit(market['symbol'], limit);
        }
        return this.filterBySinceLimit(trades, since, limit, 'timestamp', true);
    }
    parseWsTrade(trade, market = undefined) {
        //
        //     {
        //         type: 'trade',
        //         symbol: 'BTCUSD',
        //         event_id: 122258166738,
        //         timestamp: 1655330221424,
        //         price: '22269.14',
        //         quantity: '0.00004473',
        //         side: 'buy'
        //     }
        //
        const timestamp = this.safeInteger(trade, 'timestamp');
        const id = this.safeString(trade, 'event_id');
        const priceString = this.safeString(trade, 'price');
        const amountString = this.safeString(trade, 'quantity');
        const side = this.safeStringLower(trade, 'side');
        const marketId = this.safeStringLower(trade, 'symbol');
        const symbol = this.safeSymbol(marketId, market);
        return this.safeTrade({
            'id': id,
            'order': undefined,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'symbol': symbol,
            'type': undefined,
            'side': side,
            'takerOrMaker': undefined,
            'price': priceString,
            'cost': undefined,
            'amount': amountString,
            'fee': undefined,
        }, market);
    }
    handleTrade(client, message) {
        //
        //     {
        //         type: 'trade',
        //         symbol: 'BTCUSD',
        //         event_id: 122278173770,
        //         timestamp: 1655335880981,
        //         price: '22530.80',
        //         quantity: '0.04',
        //         side: 'buy'
        //     }
        //
        const trade = this.parseWsTrade(message);
        const symbol = trade['symbol'];
        const tradesLimit = this.safeInteger(this.options, 'tradesLimit', 1000);
        let stored = this.safeValue(this.trades, symbol);
        if (stored === undefined) {
            stored = new Cache.ArrayCache(tradesLimit);
            this.trades[symbol] = stored;
        }
        stored.append(trade);
        const messageHash = 'trades:' + symbol;
        client.resolve(stored, messageHash);
    }
    handleTrades(client, message) {
        //
        //     {
        //         type: 'l2_updates',
        //         symbol: 'BTCUSD',
        //         changes: [
        //             [ 'buy', '22252.37', '0.02' ],
        //             [ 'buy', '22251.61', '0.04' ],
        //             [ 'buy', '22251.60', '0.04' ],
        //             // some asks as well
        //         ],
        //         trades: [
        //             { type: 'trade', symbol: 'BTCUSD', event_id: 122258166738, timestamp: 1655330221424, price: '22269.14', quantity: '0.00004473', side: 'buy' },
        //             { type: 'trade', symbol: 'BTCUSD', event_id: 122258141090, timestamp: 1655330213216, price: '22250.00', quantity: '0.00704098', side: 'buy' },
        //             { type: 'trade', symbol: 'BTCUSD', event_id: 122258118291, timestamp: 1655330206753, price: '22250.00', quantity: '0.03', side: 'buy' },
        //         ],
        //         auction_events: [
        //             {
        //                 type: 'auction_result',
        //                 symbol: 'BTCUSD',
        //                 time_ms: 1655323200000,
        //                 result: 'failure',
        //                 highest_bid_price: '21590.88',
        //                 lowest_ask_price: '21602.30',
        //                 collar_price: '21634.73'
        //             },
        //             {
        //                 type: 'auction_indicative',
        //                 symbol: 'BTCUSD',
        //                 time_ms: 1655323185000,
        //                 result: 'failure',
        //                 highest_bid_price: '21661.90',
        //                 lowest_ask_price: '21663.79',
        //                 collar_price: '21662.845'
        //             },
        //         ]
        //     }
        //
        const marketId = this.safeStringLower(message, 'symbol');
        const market = this.safeMarket(marketId);
        const trades = this.safeValue(message, 'trades');
        if (trades !== undefined) {
            const symbol = market['symbol'];
            const tradesLimit = this.safeInteger(this.options, 'tradesLimit', 1000);
            let stored = this.safeValue(this.trades, symbol);
            if (stored === undefined) {
                stored = new Cache.ArrayCache(tradesLimit);
                this.trades[symbol] = stored;
            }
            for (let i = 0; i < trades.length; i++) {
                const trade = this.parseWsTrade(trades[i], market);
                stored.append(trade);
            }
            const messageHash = 'trades:' + symbol;
            client.resolve(stored, messageHash);
        }
    }
    async watchOHLCV(symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name gemini#fetchOHLCV
         * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @see https://docs.gemini.com/websocket-api/#candles-data-feed
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
         * @param {int|undefined} limit the maximum amount of candles to fetch
         * @param {object} params extra parameters specific to the gemini api endpoint
         * @returns {[[int]]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const timeframeId = this.safeString(this.timeframes, timeframe, timeframe);
        const request = {
            'type': 'subscribe',
            'subscriptions': [
                {
                    'name': 'candles_' + timeframeId,
                    'symbols': [
                        market['id'].toUpperCase(),
                    ],
                },
            ],
        };
        const messageHash = 'ohlcv:' + market['symbol'] + ':' + timeframeId;
        const url = this.urls['api']['ws'] + '/v2/marketdata';
        const ohlcv = await this.watch(url, messageHash, request, messageHash);
        if (this.newUpdates) {
            limit = ohlcv.getLimit(symbol, limit);
        }
        return this.filterBySinceLimit(ohlcv, since, limit, 0, true);
    }
    handleOHLCV(client, message) {
        //
        //     {
        //         "type": "candles_15m_updates",
        //         "symbol": "BTCUSD",
        //         "changes": [
        //             [
        //                 1561054500000,
        //                 9350.18,
        //                 9358.35,
        //                 9350.18,
        //                 9355.51,
        //                 2.07
        //             ],
        //             [
        //                 1561053600000,
        //                 9357.33,
        //                 9357.33,
        //                 9350.18,
        //                 9350.18,
        //                 1.5900161
        //             ]
        //             ...
        //         ]
        //     }
        //
        const type = this.safeString(message, 'type', '');
        let timeframeId = type.slice(8);
        const timeframeEndIndex = timeframeId.indexOf('_');
        timeframeId = timeframeId.slice(0, timeframeEndIndex);
        const marketId = this.safeString(message, 'symbol', '').toLowerCase();
        const market = this.safeMarket(marketId);
        const symbol = this.safeSymbol(marketId, market);
        const changes = this.safeValue(message, 'changes', []);
        const timeframe = this.findTimeframe(timeframeId);
        const ohlcvsBySymbol = this.safeValue(this.ohlcvs, symbol);
        if (ohlcvsBySymbol === undefined) {
            this.ohlcvs[symbol] = {};
        }
        let stored = this.safeValue(this.ohlcvs[symbol], timeframe);
        if (stored === undefined) {
            const limit = this.safeInteger(this.options, 'OHLCVLimit', 1000);
            stored = new Cache.ArrayCacheByTimestamp(limit);
            this.ohlcvs[symbol][timeframe] = stored;
        }
        const changesLength = changes.length;
        // reverse order of array to store candles in ascending order
        for (let i = 0; i < changesLength; i++) {
            const index = changesLength - i - 1;
            const parsed = this.parseOHLCV(changes[index], market);
            stored.append(parsed);
        }
        const messageHash = 'ohlcv:' + symbol + ':' + timeframeId;
        client.resolve(stored, messageHash);
        return message;
    }
    async watchOrderBook(symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name gemini#watchOrderBook
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @see https://docs.gemini.com/websocket-api/#market-data-version-2
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the gemini api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const messageHash = 'orderbook:' + market['symbol'];
        const marketId = market['id'];
        const request = {
            'type': 'subscribe',
            'subscriptions': [
                {
                    'name': 'l2',
                    'symbols': [
                        marketId.toUpperCase(),
                    ],
                },
            ],
        };
        const subscribeHash = 'l2:' + market['symbol'];
        const url = this.urls['api']['ws'] + '/v2/marketdata';
        const orderbook = await this.watch(url, messageHash, request, subscribeHash);
        return orderbook.limit();
    }
    handleOrderBook(client, message) {
        const changes = this.safeValue(message, 'changes', []);
        const marketId = this.safeStringLower(message, 'symbol');
        const market = this.safeMarket(marketId);
        const symbol = market['symbol'];
        const messageHash = 'orderbook:' + symbol;
        let orderbook = this.safeValue(this.orderbooks, symbol);
        if (orderbook === undefined) {
            orderbook = this.orderBook();
        }
        for (let i = 0; i < changes.length; i++) {
            const delta = changes[i];
            const price = this.safeNumber(delta, 1);
            const size = this.safeNumber(delta, 2);
            const side = (delta[0] === 'buy') ? 'bids' : 'asks';
            const bookside = orderbook[side];
            bookside.store(price, size);
            orderbook[side] = bookside;
        }
        orderbook['symbol'] = symbol;
        this.orderbooks[symbol] = orderbook;
        client.resolve(orderbook, messageHash);
    }
    handleL2Updates(client, message) {
        //
        //     {
        //         type: 'l2_updates',
        //         symbol: 'BTCUSD',
        //         changes: [
        //             [ 'buy', '22252.37', '0.02' ],
        //             [ 'buy', '22251.61', '0.04' ],
        //             [ 'buy', '22251.60', '0.04' ],
        //             // some asks as well
        //         ],
        //         trades: [
        //             { type: 'trade', symbol: 'BTCUSD', event_id: 122258166738, timestamp: 1655330221424, price: '22269.14', quantity: '0.00004473', side: 'buy' },
        //             { type: 'trade', symbol: 'BTCUSD', event_id: 122258141090, timestamp: 1655330213216, price: '22250.00', quantity: '0.00704098', side: 'buy' },
        //             { type: 'trade', symbol: 'BTCUSD', event_id: 122258118291, timestamp: 1655330206753, price: '22250.00', quantity: '0.03', side: 'buy' },
        //         ],
        //         auction_events: [
        //             {
        //                 type: 'auction_result',
        //                 symbol: 'BTCUSD',
        //                 time_ms: 1655323200000,
        //                 result: 'failure',
        //                 highest_bid_price: '21590.88',
        //                 lowest_ask_price: '21602.30',
        //                 collar_price: '21634.73'
        //             },
        //             {
        //                 type: 'auction_indicative',
        //                 symbol: 'BTCUSD',
        //                 time_ms: 1655323185000,
        //                 result: 'failure',
        //                 highest_bid_price: '21661.90',
        //                 lowest_ask_price: '21663.79',
        //                 collar_price: '21662.845'
        //             },
        //         ]
        //     }
        //
        this.handleOrderBook(client, message);
        this.handleTrades(client, message);
    }
    async watchOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name gemini#fetchOrders
         * @description watches information on multiple orders made by the user
         * @see https://docs.gemini.com/websocket-api/#order-events
         * @param {string|undefined} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the gemini api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        const url = this.urls['api']['ws'] + '/v1/order/events?eventTypeFilter=initial&eventTypeFilter=accepted&eventTypeFilter=rejected&eventTypeFilter=fill&eventTypeFilter=cancelled&eventTypeFilter=booked';
        await this.loadMarkets();
        const authParams = {
            'url': url,
        };
        await this.authenticate(authParams);
        if (symbol !== undefined) {
            const market = this.market(symbol);
            symbol = market['symbol'];
        }
        const messageHash = 'orders';
        const orders = await this.watch(url, messageHash, undefined, messageHash);
        if (this.newUpdates) {
            limit = orders.getLimit(symbol, limit);
        }
        return this.filterBySymbolSinceLimit(orders, symbol, since, limit);
    }
    handleHeartbeat(client, message) {
        //
        //     {
        //         type: 'heartbeat',
        //         timestampms: 1659740268958,
        //         sequence: 7,
        //         trace_id: '25b3d92476dd3a9a5c03c9bd9e0a0dba',
        //         socket_sequence: 7
        //     }
        //
        return message;
    }
    handleSubscription(client, message) {
        //
        //     {
        //         type: 'subscription_ack',
        //         accountId: 19433282,
        //         subscriptionId: 'orderevents-websocket-25b3d92476dd3a9a5c03c9bd9e0a0dba',
        //         symbolFilter: [],
        //         apiSessionFilter: [],
        //         eventTypeFilter: []
        //     }
        //
        return message;
    }
    handleOrder(client, message) {
        //
        //     [
        //         {
        //             type: 'accepted',
        //             order_id: '134150423884',
        //             event_id: '134150423886',
        //             account_name: 'primary',
        //             client_order_id: '1659739406916',
        //             api_session: 'account-pnBFSS0XKGvDamX4uEIt',
        //             symbol: 'batbtc',
        //             side: 'sell',
        //             order_type: 'exchange limit',
        //             timestamp: '1659739407',
        //             timestampms: 1659739407576,
        //             is_live: true,
        //             is_cancelled: false,
        //             is_hidden: false,
        //             original_amount: '1',
        //             price: '1',
        //             socket_sequence: 139
        //         }
        //     ]
        //
        const messageHash = 'orders';
        if (this.orders === undefined) {
            const limit = this.safeInteger(this.options, 'ordersLimit', 1000);
            this.orders = new Cache.ArrayCacheBySymbolById(limit);
        }
        const orders = this.orders;
        for (let i = 0; i < message.length; i++) {
            const order = this.parseWsOrder(message[i]);
            orders.append(order);
        }
        client.resolve(this.orders, messageHash);
    }
    parseWsOrder(order, market = undefined) {
        //
        //     {
        //         type: 'accepted',
        //         order_id: '134150423884',
        //         event_id: '134150423886',
        //         account_name: 'primary',
        //         client_order_id: '1659739406916',
        //         api_session: 'account-pnBFSS0XKGvDamX4uEIt',
        //         symbol: 'batbtc',
        //         side: 'sell',
        //         order_type: 'exchange limit',
        //         timestamp: '1659739407',
        //         timestampms: 1659739407576,
        //         is_live: true,
        //         is_cancelled: false,
        //         is_hidden: false,
        //         original_amount: '1',
        //         price: '1',
        //         socket_sequence: 139
        //     }
        //
        const timestamp = this.safeNumber(order, 'timestampms');
        const status = this.safeString(order, 'type');
        const marketId = this.safeString(order, 'symbol');
        const typeId = this.safeString(order, 'order_type');
        const behavior = this.safeString(order, 'behavior');
        let timeInForce = 'GTC';
        let postOnly = false;
        if (behavior === 'immediate-or-cancel') {
            timeInForce = 'IOC';
        }
        else if (behavior === 'fill-or-kill') {
            timeInForce = 'FOK';
        }
        else if (behavior === 'maker-or-cancel') {
            timeInForce = 'PO';
            postOnly = true;
        }
        return this.safeOrder({
            'id': this.safeString(order, 'order_id'),
            'clientOrderId': this.safeString(order, 'client_order_id'),
            'info': order,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'lastTradeTimestamp': undefined,
            'status': this.parseWsOrderStatus(status),
            'symbol': this.safeSymbol(marketId, market),
            'type': this.parseWsOrderType(typeId),
            'timeInForce': timeInForce,
            'postOnly': postOnly,
            'side': this.safeString(order, 'side'),
            'price': this.safeNumber(order, 'price'),
            'stopPrice': undefined,
            'average': this.safeNumber(order, 'avg_execution_price'),
            'cost': undefined,
            'amount': this.safeNumber(order, 'original_amount'),
            'filled': this.safeNumber(order, 'executed_amount'),
            'remaining': this.safeNumber(order, 'remaining_amount'),
            'fee': undefined,
            'trades': undefined,
        }, market);
    }
    parseWsOrderStatus(status) {
        const statuses = {
            'accepted': 'open',
            'booked': 'open',
            'fill': 'closed',
            'cancelled': 'canceled',
            'cancel_rejected': 'rejected',
            'rejected': 'rejected',
        };
        return this.safeString(statuses, status, status);
    }
    parseWsOrderType(type) {
        const types = {
            'exchange limit': 'limit',
            'market buy': 'market',
            'market sell': 'market',
        };
        return this.safeString(types, type, type);
    }
    handleError(client, message) {
        //
        //     {
        //         reason: 'NoValidTradingPairs',
        //         result: 'error'
        //     }
        //
        throw new errors.ExchangeError(this.json(message));
    }
    handleMessage(client, message) {
        //
        //  public
        //     {
        //         type: 'trade',
        //         symbol: 'BTCUSD',
        //         event_id: 122278173770,
        //         timestamp: 1655335880981,
        //         price: '22530.80',
        //         quantity: '0.04',
        //         side: 'buy'
        //     }
        //
        //  private
        //     [
        //         {
        //             type: 'accepted',
        //             order_id: '134150423884',
        //             event_id: '134150423886',
        //             account_name: 'primary',
        //             client_order_id: '1659739406916',
        //             api_session: 'account-pnBFSS0XKGvDamX4uEIt',
        //             symbol: 'batbtc',
        //             side: 'sell',
        //             order_type: 'exchange limit',
        //             timestamp: '1659739407',
        //             timestampms: 1659739407576,
        //             is_live: true,
        //             is_cancelled: false,
        //             is_hidden: false,
        //             original_amount: '1',
        //             price: '1',
        //             socket_sequence: 139
        //         }
        //     ]
        //
        const isArray = Array.isArray(message);
        if (isArray) {
            return this.handleOrder(client, message);
        }
        const reason = this.safeString(message, 'reason');
        if (reason === 'error') {
            this.handleError(client, message);
        }
        const methods = {
            'l2_updates': this.handleL2Updates,
            'trade': this.handleTrade,
            'subscription_ack': this.handleSubscription,
            'heartbeat': this.handleHeartbeat,
        };
        const type = this.safeString(message, 'type', '');
        if (type.indexOf('candles') >= 0) {
            return this.handleOHLCV(client, message);
        }
        const method = this.safeValue(methods, type);
        if (method !== undefined) {
            method.call(this, client, message);
        }
    }
    async authenticate(params = {}) {
        const url = this.safeString(params, 'url');
        if ((this.clients !== undefined) && (url in this.clients)) {
            return;
        }
        this.checkRequiredCredentials();
        const startIndex = this.urls['api']['ws'].length;
        const urlParamsIndex = url.indexOf('?');
        const urlLength = url.length;
        const endIndex = (urlParamsIndex >= 0) ? urlParamsIndex : urlLength;
        const request = url.slice(startIndex, endIndex);
        const payload = {
            'request': request,
            'nonce': this.nonce(),
        };
        const b64 = this.stringToBase64(this.json(payload));
        const signature = this.hmac(this.encode(b64), this.encode(this.secret), sha512.sha384, 'hex');
        const defaultOptions = {
            'ws': {
                'options': {
                    'headers': {},
                },
            },
        };
        this.options = this.extend(defaultOptions, this.options);
        const originalHeaders = this.options['ws']['options']['headers'];
        const headers = {
            'X-GEMINI-APIKEY': this.apiKey,
            'X-GEMINI-PAYLOAD': b64,
            'X-GEMINI-SIGNATURE': signature,
        };
        this.options['ws']['options']['headers'] = headers;
        this.client(url);
        this.options['ws']['options']['headers'] = originalHeaders;
    }
}

module.exports = gemini;
