'use strict';

//  ---------------------------------------------------------------------------

const litebitexchangeRest = require ('../litebitexchange.js');
const { ExchangeError } = require ('../base/errors');
const { ArrayCache, ArrayCacheByTimestamp, ArrayCacheBySymbolById } = require ('./base/Cache');

//  ---------------------------------------------------------------------------

module.exports = class litebitexchange extends litebitexchangeRest {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchMyTrades': true,
                'watchOHLCV': true,
                'watchOrderBook': true,
                'watchOrders': true,
                'watchTicker': true,
                'watchTrades': true,
            },
            'urls': {
                'api': {
                    'ws': 'wss://ws.exchange.litebit.eu/v1',
                },
            },
            'options': {
                'tradesLimit': 1000,
                'ordersLimit': 1000,
                'OHLCVLimit': 1000,
            },
        });
    }

    requestId () {
        // their support said that reqid must be an int32, not documented
        const reqid = this.sum (this.safeInteger (this.options, 'reqid', 0), 1);
        this.options['reqid'] = reqid;
        return reqid;
    }

    async subscribe (name, symbol, isPrivate, params = {}) {
        await this.loadMarkets ();
        if (isPrivate) {
            await this.authenticate ();
        }
        let channel = name;
        if (symbol !== undefined) {
            const market = this.market (symbol);
            channel = channel + ':' + market['id'];
        }
        const url = this.urls['api']['ws'];
        const request = {
            'event': 'subscribe',
            'data': [ channel ],
        };
        const message = this.extend (request, params);
        return await this.watch (url, channel, message, channel);
    }

    async watchTicker (symbol, params = {}) {
        return await this.subscribe ('ticker', symbol, false, params);
    }

    handleTicker (client, message) {
        //
        // {
        //   "event": "ticker",
        //   "data": {
        //     "market": "BTC-EUR",
        //     "open": "1.12345678",
        //     "last": "1.12345678",
        //     "volume": "1.12345678",
        //     "low": "1.12345678",
        //     "high": "1.12345678",
        //     "bid": "1.12345678",
        //     "ask": "1.12345678"
        //   }
        // }
        //
        const data = this.safeValue (message, 'data');
        const marketId = this.safeString (data, 'market');
        const market = this.safeMarket (marketId, undefined, '-');
        const ticker = this.parseTicker (data, market);
        const symbol = ticker['symbol'];
        this.tickers[symbol] = ticker;
        const event = this.safeString (message, 'event');
        const messageHash = event + ':' + marketId;
        client.resolve (ticker, messageHash);
        return message;
    }

    async watchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        const trades = await this.subscribe ('trades', symbol, false, params);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    handleTrade (client, message) {
        //
        // {
        //   "event": "trade",
        //   "data": {
        //     "uuid": "9beba3ae-4755-4f06-82be-60b2a3452926",
        //     "amount": "10.0000",
        //     "price": "0.1450",
        //     "side": "buy",
        //     "timestamp": 1622123573863,
        //     "market": "XRP-EUR"
        //   }
        // }
        //
        const data = this.safeValue (message, 'data');
        const marketId = this.safeString (data, 'market');
        const market = this.safeMarket (marketId, undefined, '-');
        const symbol = market['symbol'];
        const trade = this.parseTrade (data, market);
        let array = this.safeValue (this.trades, symbol);
        if (array === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            array = new ArrayCache (limit);
        }
        array.append (trade);
        this.trades[symbol] = array;
        const messageHash = 'trades:' + marketId;
        client.resolve (array, messageHash);
    }

    async watchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const name = 'candles';
        const marketId = market['id'];
        const interval = this.timeframes[timeframe];
        const channel = name + ':' + marketId + ':' + interval;
        const url = this.urls['api']['ws'];
        const request = {
            'event': 'subscribe',
            'data': [ channel ],
        };
        const message = this.extend (request, params);
        const ohlcv = await this.watch (url, channel, message, channel);
        if (this.newUpdates) {
            limit = ohlcv.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (ohlcv, since, limit, 0, true);
    }

    handleOHLCV (client, message) {
        //
        // {
        //   "event": "candle",
        //   "data": {
        //     "market": "BTC-EUR",
        //     "interval": 900,
        //     "ohlcv": [1525337100, "0.1221", "0.1460", "0.1032", "0.1538", "5.305"]
        //   }
        // }
        //
        const data = this.safeValue (message, 'data');
        const marketId = this.safeString (data, 'market');
        const market = this.safeMarket (marketId, undefined, '-');
        const symbol = market['symbol'];
        const interval = this.safeString (data, 'interval');
        // use a reverse lookup in a static map instead
        const timeframe = this.findTimeframe (interval);
        const candle = this.safeValue (data, 'ohlcv');
        this.ohlcvs[symbol] = this.safeValue (this.ohlcvs, symbol, {});
        let stored = this.safeValue (this.ohlcvs[symbol], timeframe);
        if (stored === undefined) {
            const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
            stored = new ArrayCacheByTimestamp (limit);
            this.ohlcvs[symbol][timeframe] = stored;
        }
        const parsed = this.parseOHLCV (candle, market);
        stored.append (parsed);
        const messageHash = 'candles:' + marketId + ':' + interval;
        client.resolve (stored, messageHash);
    }

    async watchOrderBook (symbol, limit = undefined, params = {}) {
        const name = 'book';
        const orderbook = await this.subscribe (name, symbol, false, params);
        return orderbook.limit (limit);
    }

    handleDelta (bookside, delta) {
        const price = this.safeFloat (delta, 0);
        const amount = this.safeFloat (delta, 1);
        bookside.store (price, amount);
    }

    handleDeltas (bookside, deltas) {
        for (let i = 0; i < deltas.length; i++) {
            this.handleDelta (bookside, deltas[i]);
        }
    }

    handleOrderBookMessage (client, message, orderbook) {
        //
        // {
        //   "event": "book",
        //   "data": {
        //     "market": "BTC-EUR",
        //     "sequence": 1231232,
        //     "update_type": "snapshot",
        //     "timestamp": 1622123573863,
        //     "asks": [
        //       [<price>, <amount>],
        //       ...,
        //     ],
        //     "bids": [
        //       [<price>, <amount>],
        //       ...,
        //     ]
        //   }
        // }
        //
        const data = this.safeValue (message, 'data');
        const nonce = this.safeInteger (data, 'sequence');
        if (orderbook['nonce'] === undefined || nonce > orderbook['nonce']) {
            this.handleDeltas (orderbook['asks'], this.safeValue (data, 'asks', []));
            this.handleDeltas (orderbook['bids'], this.safeValue (data, 'bids', []));
            orderbook['nonce'] = nonce;
            const timestamp = this.safeInteger (data, 'timestamp');
            orderbook['timestamp'] = timestamp;
            orderbook['datetime'] = this.iso8601 (timestamp);
        }
        return orderbook;
    }

    handleOrderBook (client, message) {
        //
        // {
        //   "event": "book",
        //   "data": {
        //     "market": "BTC-EUR",
        //     "sequence": 1231232,
        //     "update_type": "snapshot",
        //     "timestamp": 1622123573863,
        //     "asks": [
        //       [<price>, <amount>],
        //       ...,
        //     ],
        //     "bids": [
        //       [<price>, <amount>],
        //       ...,
        //     ]
        //   }
        // }
        //
        const event = this.safeString (message, 'event');
        const data = this.safeValue (message, 'data');
        const marketId = this.safeString (data, 'market');
        const market = this.safeMarket (marketId, undefined, '-');
        const symbol = market['symbol'];
        const updateType = this.safeString (data, 'update_type');
        if (updateType === 'snapshot') {
            this.orderbooks[symbol] = this.orderBook ({});
        }
        const orderbook = this.safeValue (this.orderbooks, symbol);
        this.handleOrderBookMessage (client, message, orderbook);
        const messageHash = event + ':' + marketId;
        client.resolve (orderbook, messageHash);
    }

    async watchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const orders = await this.subscribe ('orders', symbol, true, params);
        if (this.newUpdates) {
            limit = orders.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (orders, symbol, since, limit, true);
    }

    handleOrder (client, message) {
        //
        // {
        //   "event": "order",
        //   "data": {
        //     "uuid": "5f7bda37-5dac-4525-bd72-14df3fbc6f82",
        //     "amount": "1.00000000",
        //     "amount_filled": "0.00000000",
        //     "amount_quote_filled": "0.00000000",
        //     "fee": "0.00000000",
        //     "price": "0.01635866",
        //     "side": "buy",
        //     "type": "limit",
        //     "status": "open",
        //     "filled_status": "not_filled",
        //     "stop": null,
        //     "stop_price": null,
        //     "post_only": false,
        //     "time_in_force": "gtc",
        //     "created_at": 1614919085000,
        //     "updated_at": 1614919085000,
        //     "expire_at": null,
        //     "market": "BTC-EUR",
        //     "client_id": null
        //   }
        // }
        //
        const data = this.safeValue (message, 'data');
        const marketId = this.safeString (data, 'market');
        const market = this.safeMarket (marketId, undefined, '-');
        const order = this.parseOrder (data, market);
        if (this.orders === undefined) {
            const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
            this.orders = new ArrayCacheBySymbolById (limit);
        }
        const orders = this.orders;
        orders.append (order);
        const messageHash = 'orders';
        client.resolve (this.orders, messageHash);
    }

    async watchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const trades = await this.subscribe ('fills', undefined, true, params);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (trades, symbol, since, limit, true);
    }

    handleMyTrade (client, message) {
        //
        // {
        //   "event": "fill",
        //   "data": {
        //     "uuid": "234234897234-1243-1234-qsf234",
        //     "order_uuid": "234234897234-1243-1234-qsf235",
        //     "amount": "0.00100000",
        //     "price": "42986.64",
        //     "amount_quote": "43.09410660",
        //     "side": "buy",
        //     "fee": "0.10746660",
        //     "market": "BTC-EUR",
        //     "liquidity": "taker",
        //     "timestamp": 1622123573863
        //   }
        // }
        //
        const data = this.safeValue (message, 'data');
        const marketId = this.safeString (data, 'market');
        const market = this.safeMarket (marketId, undefined, '-');
        const trade = this.parseTrade (data, market);
        if (this.myTrades === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            this.myTrades = new ArrayCache (limit);
        }
        const myTrades = this.myTrades;
        myTrades.append (trade);
        const messageHash = 'fills';
        client.resolve (myTrades, messageHash);
    }

    async authenticate (params = {}) {
        const url = this.urls['api']['ws'];
        const client = this.client (url);
        const action = 'authenticate';
        let future = this.safeValue (client.subscriptions, action);
        if (future === undefined) {
            this.checkRequiredCredentials ();
            const requestId = this.requestId ();
            future = client.future (requestId);
            client.subscriptions[action] = future;
            const timestamp = this.milliseconds ();
            const stringTimestamp = timestamp.toString ();
            const auth = action + stringTimestamp;
            const signature = this.hmac (this.encode (auth), this.encode (this.secret));
            const request = {
                'rid': requestId,
                'event': action,
                'data': {
                    'api_key': this.apiKey,
                    'timestamp': timestamp,
                    'signature': signature,
                },
            };
            const message = this.extend (request, params);
            this.spawn (this.watch, url, requestId, message);
        }
        return await future;
    }

    handleSuccess (client, message) {
        //
        // {
        //   "rid": 1147483647,
        //   "event": "authenticate"
        // }
        //
        const requestId = this.safeInteger (message, 'rid');
        if (requestId !== undefined) {
            client.resolve (message, requestId);
        }
    }

    handleError (client, message) {
        //
        // {
        //   "rid": 1147483647,
        //   "event": "error",
        //   "data": {
        //     "code": 10012,
        //     "message": "Invalid channel."
        //   }
        // }
        //
        const requestId = this.safeString (message, 'rid');
        if (requestId !== undefined) {
            const data = this.safeValue (message, 'data');
            const errorCode = this.safeString (data, 'code');
            const errorMessage = this.safeString (data, 'message');
            const Exception = this.safeValue (this.exceptions['exact'], errorCode);
            let error = new ExchangeError (errorMessage);
            if (Exception !== undefined) {
                error = new Exception (errorMessage);
            }
            client.reject (error, requestId);
        }
    }

    handleMessage (client, message) {
        const methods = {
            'error': this.handleError,
            'authenticate': this.handleSuccess,
            // successful subscribes and unsubscribes don't need to be handled....
            // 'subscribe': this.handleSuccess,
            // 'unsubscribe': this.handleSuccess,
            'ticker': this.handleTicker,
            'book': this.handleOrderBook,
            'trade': this.handleTrade,
            'candle': this.handleOHLCV,
            'order': this.handleOrder,
            'fill': this.handleMyTrade,
        };
        const event = this.safeString (message, 'event');
        const method = this.safeValue (methods, event);
        if (method) {
            return method.call (this, client, message);
        }
    }
};
