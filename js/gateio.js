'use strict';

//  ---------------------------------------------------------------------------

const ccxt = require ('ccxt');
const { ExchangeError, AuthenticationError } = require ('ccxt/js/base/errors');

//  ---------------------------------------------------------------------------

module.exports = class gateio extends ccxt.gateio {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'watchOrderBook': true,
                'watchTicker': true,
                'watchTrades': true,
                'watchOHLCV': true,
                'watchBalance': true,
                'watchOrders': true,
            },
            'urls': {
                'api': {
                    'ws': 'wss://ws.gate.io/v3',
                },
            },
        });
    }

    async watchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const marketId = market['id'].toUpperCase ();
        const requestId = this.nonce ();
        const url = this.urls['api']['ws'];
        if (!limit) {
            limit = 30;
        } else if (limit !== 1 && limit !== 5 && limit !== 10 && limit !== 20 && limit !== 30) {
            throw new ExchangeError (this.id + ' watchOrderBook limit argument must be undefined, 1, 5, 10, 20, or 30');
        }
        const interval = this.safeString (params, 'interval', '0.00000001');
        const floatInterval = parseFloat (interval);
        const precision = -1 * Math.log10 (floatInterval);
        if ((precision < 0) || (precision > 8) || (precision % 1 !== 0)) {
            throw new ExchangeError (this.id + ' invalid interval');
        }
        const messageHash = 'depth.update' + ':' + marketId;
        const subscribeMessage = {
            'id': requestId,
            'method': 'depth.subscribe',
            'params': [marketId, limit, interval],
        };
        const future = this.watch (url, messageHash, subscribeMessage, messageHash);
        return await this.after (future, this.limitOrderBook, symbol, limit, params);
    }

    signMessage (client, messageHash, message, params = {}) {
        // todo: implement gateio signMessage
        return message;
    }

    limitOrderBook (orderbook, symbol, limit = undefined, params = {}) {
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

    handleOrderBook (client, message) {
        const params = this.safeValue (message, 'params', []);
        const clean = this.safeValue (params, 0);
        const book = this.safeValue (params, 1);
        const marketId = this.safeString (params, 2);
        const method = this.safeString (message, 'method');
        const messageHash = method + ':' + marketId;
        let orderBook = undefined;
        if (clean) {
            orderBook = this.orderBook ({});
            this.orderbooks[marketId] = orderBook;
        } else {
            orderBook = this.orderbooks[marketId];
        }
        this.handleDeltas (orderBook['asks'], this.safeValue (book, 'asks', []));
        this.handleDeltas (orderBook['bids'], this.safeValue (book, 'bids', []));
        client.resolve (orderBook, messageHash);
    }

    async watchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const marketId = market['id'].toUpperCase ();
        const requestId = this.nonce ();
        const url = this.urls['api']['ws'];
        const subscribeMessage = {
            'id': requestId,
            'method': 'ticker.subscribe',
            'params': [marketId],
        };
        const messageHash = 'ticker.update' + ':' + marketId;
        return await this.watch (url, messageHash, subscribeMessage, messageHash);
    }

    handleTicker (client, message) {
        const result = message['params'];
        const marketId = result[0];
        const normalMarketId = marketId.toLowerCase ();
        let market = undefined;
        if (normalMarketId in this.markets_by_id) {
            market = this.markets_by_id[normalMarketId];
        }
        const ticker = result[1];
        const parsed = this.parseTicker (ticker, market);
        const methodType = message['method'];
        const messageHash = methodType + ':' + marketId;
        client.resolve (parsed, messageHash);
    }

    async watchTrades (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const marketId = market['id'].toUpperCase ();
        const requestId = this.nonce ();
        const url = this.urls['api']['ws'];
        const subscribeMessage = {
            'id': requestId,
            'method': 'trades.subscribe',
            'params': [marketId],
        };
        const messageHash = 'trades.update' + ':' + marketId;
        return await this.watch (url, messageHash, subscribeMessage, messageHash);
    }

    handleTrades (client, messsage) {
        const result = messsage['params'];
        const marketId = result[0];
        const normalMarketId = marketId.toLowerCase ();
        let market = undefined;
        if (normalMarketId in this.markets_by_id) {
            market = this.markets_by_id[normalMarketId];
        }
        if (!(marketId in this.trades)) {
            this.trades[marketId] = [];
        }
        const trades = result[1];
        for (let i = 0; i < trades.length; i++) {
            const trade = trades[i];
            const parsed = this.parseTrade (trade, market);
            this.trades[marketId].push (parsed);
        }
        const methodType = messsage['method'];
        const messageHash = methodType + ':' + marketId;
        client.resolve (this.trades[marketId], messageHash);
    }

    async watchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const marketId = market['id'].toUpperCase ();
        const requestId = this.nonce ();
        const url = this.urls['api']['ws'];
        const interval = parseInt (this.timeframes[timeframe]);
        const subscribeMessage = {
            'id': requestId,
            'method': 'kline.subscribe',
            'params': [marketId, interval],
        };
        const messageHash = 'kline.update' + ':' + marketId;
        return await this.watch (url, messageHash, subscribeMessage, messageHash);
    }

    async authenticate () {
        const url = this.urls['api']['ws'];
        const client = this.client (url);
        const future = client.future ('authenticated');
        const method = 'server.sign';
        const authenticate = this.safeValue (client.subscriptions, method);
        if (authenticate === undefined) {
            const requestId = this.milliseconds ();
            const requestIdString = requestId.toString ();
            const signature = this.hmac (this.encode (requestIdString), this.encode (this.secret), 'sha512', 'base64');
            const authenticateMessage = {
                'id': requestId,
                'method': method,
                'params': [ this.apiKey, this.decode (signature), requestId ],
            };
            const subscribe = {
                'id': requestId,
            };
            this.spawn (this.watch, url, requestId, authenticateMessage, method, subscribe);
        }
        return await future;
    }

    handleOHLCV (client, message) {
        const ohlcv = message['params'][0];
        const marketId = ohlcv[7];
        const normalMarketId = marketId.toLowerCase ();
        let market = undefined;
        if (normalMarketId in this.markets_by_id) {
            market = this.markets_by_id[normalMarketId];
        }
        const parsed = this.parseOHLCV (ohlcv, market);
        const methodType = message['method'];
        const messageHash = methodType + ':' + marketId;
        client.resolve (parsed, messageHash);
    }

    async watchBalance (params = {}) {
        await this.loadMarkets ();
        this.checkRequiredCredentials ();
        const url = this.urls['api']['ws'];
        const future = this.authenticate ();
        const requestId = this.nonce ();
        const method = 'balance.update';
        const subscribeMessage = {
            'id': requestId,
            'method': 'balance.subscribe',
            'params': [],
        };
        return await this.afterDropped (future, this.watch, url, method, subscribeMessage, method);
    }

    async fetchBalanceSnapshot (params = {}) {
    }

    handleBalance (client, message) {
        const messageHash = message['method'];
        const result = message['params'][0];
        const keys = Object.keys (result);
        for (let i = 0; i < keys.length; i++) {
            const account = this.account ();
            const key = keys[i];
            const code = this.safeCurrencyCode (key);
            const balance = result[key];
            account['free'] = this.safeFloat (balance, 'available');
            account['used'] = this.safeFloat (balance, 'freeze');
            this.balance[code] = account;
        }
        client.resolve (this.parseBalance (this.balance), messageHash);
    }

    async watchOrders (params = {}) {
        this.checkRequiredCredentials ();
        await this.loadMarkets ();
        const url = this.urls['api']['ws'];
        const future = this.authenticate ();
        const requestId = this.nonce ();
        const method = 'order.update';
        const subscribeMessage = {
            'id': requestId,
            'method': 'order.subscribe',
            'params': [],
        };
        return await this.afterDropped (future, this.watch, url, method, subscribeMessage, method);
    }

    handleOrder (client, message) {
        const messageHash = message['method'];
        const order = message['params'][1];
        const marketId = order['market'];
        const normalMarketId = marketId.toLowerCase ();
        let market = undefined;
        if (normalMarketId in this.markets_by_id) {
            market = this.markets_by_id[normalMarketId];
        }
        const parsed = this.parseOrder (order, market);
        client.resolve (parsed, messageHash);
    }

    handleAuthenticationMessage (client, message) {
        const result = this.safeValue (message, 'result');
        const status = this.safeString (result, 'status');
        if (status === 'success') {
            // client.resolve (true, 'authenticated') will delete the future
            // we want to remember that we are authenticated in subsequent call to private methods
            const future = client.futures['authenticated'];
            future.resolve (true);
        } else {
            // delete authenticate subscribeHash to release the "subscribe lock"
            // allows subsequent calls to subscribe to reauthenticate
            // avoids sending two authentication messages before receiving a reply
            const error = new AuthenticationError ('not success');
            client.reject (error, 'autheticated');
            if ('server.sign' in client.subscriptions) {
                delete client.subscriptions['server.sign'];
            }
        }
    }

    handleErrorMessage (client, message) {
        // todo use error map here
        const error = this.safeValue (message, 'error', {});
        const code = this.safeInteger (error, 'code');
        if (code === 11 || code === 6) {
            const error = new AuthenticationError ('invalid credentials');
            client.reject (error, message['id']);
            client.reject (error, 'authenticated');
        }
    }

    handleMessage (client, message) {
        this.handleErrorMessage (client, message);
        const methods = {
            'depth.update': this.handleOrderBook,
            'ticker.update': this.handleTicker,
            'trades.update': this.handleTrades,
            'kline.update': this.handleOHLCV,
            'balance.update': this.handleBalance,
            'order.update': this.handleOrder,
        };
        const methodType = this.safeString (message, 'method');
        const method = this.safeValue (methods, methodType);
        if (method === undefined) {
            const messageId = this.safeInteger (message, 'id');
            if (messageId !== undefined) {
                // used to resolve subscriptions
                client.resolve (message, messageId);
                // used to resolve authentication messages
                const subscription = this.safeValue (client.subscriptions, 'server.sign', {});
                const subscriptionId = this.safeInteger (subscription, 'id');
                if (messageId === subscriptionId) {
                    this.handleAuthenticationMessage (client, message);
                }
            }
        } else {
            method.call (this, client, message);
        }
    }
};
