'use strict';

//  ---------------------------------------------------------------------------

const ccxt = require ('ccxt');
const { AuthenticationError, ArgumentsRequired } = require ('ccxt/js/base/errors');
const { ArrayCache } = require ('./base/Cache');

//  ---------------------------------------------------------------------------

module.exports = class gopax extends ccxt.gopax {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchOrderBook': true,
                // 'watchTrades': true,
                // 'watchTicker': true,
                // 'watchOHLCV': true,
                // 'watchOrders': true,
                // 'watchMyTrades': true,
            },
            'urls': {
                'api': {
                    'ws': 'wss://wsapi.gopax.co.kr',
                },
            },
            'options': {
                'tradesLimit': 1000,
                'ordersLimit': 1000,
                'OHLCVLimit': 1000,
            },
        });
    }

    getSignedUrl () {
        const options = this.safeValue (this.options, 'ws', {});
        if ('url' in options) {
            return options['url'];
        }
        this.checkRequiredCredentials ();
        const nonce = this.nonce ().toString ();
        const auth = 't' + nonce;
        const rawSecret = this.base64ToBinary (this.secret);
        const signature = this.hmac (this.encode (auth), rawSecret, 'sha512', 'base64');
        const query = {
            'apiKey': this.apiKey,
            'timestamp': nonce,
            'signature': signature,
        };
        const url = this.urls['api']['ws'] + '?' + this.urlencode (query);
        options['url'] = url;
        this.options['ws'] = options;
        return url;
    }

    async watchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        const future = this.watchPublic ('trades', symbol, params);
        return await this.after (future, this.filterBySinceLimit, since, limit, 'timestamp', true);
    }

    handleTrade (client, message) {
        //
        //     {
        //         event: 'trade',
        //         timestamp: 1590779594547,
        //         market: 'ETH-EUR',
        //         id: '450c3298-f082-4461-9e2c-a0262cc7cc2e',
        //         amount: '0.05026233',
        //         price: '198.46',
        //         side: 'buy'
        //     }
        //
        const marketId = this.safeString (message, 'market');
        const market = this.safeMarket (marketId, undefined, '-');
        const symbol = market['symbol'];
        const name = 'trades';
        const messageHash = name + '@' + marketId;
        const trade = this.parseTrade (message, market);
        let array = this.safeValue (this.trades, symbol);
        if (array === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            array = new ArrayCache (limit);
        }
        array.append (trade);
        this.trades[symbol] = array;
        client.resolve (array, messageHash);
    }

    async watchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const name = 'orderbook';
        const messageHash = name + ':' + market['id'];
        const url = this.getSignedUrl ();
        const request = {
            'n': 'SubscribeToOrderBook',
            'o': {
                'tradingPairName': market['id'],
            },
        };
        const subscription = {
            'messageHash': messageHash,
            'name': name,
            'symbol': symbol,
            'marketId': market['id'],
            'method': this.handleOrderBook,
            'limit': limit,
            'params': params,
        };
        const message = this.extend (request, params);
        const future = this.watch (url, messageHash, message, messageHash, subscription);
        return await this.after (future, this.limitOrderBook, symbol, limit, params);
    }

    handleDelta (bookside, delta) {
        //
        //     {
        //         entryId: 60949856,
        //         price: 31575000,
        //         volume: 0.3163,
        //         updatedAt: 1609420344.174
        //     }
        //
        const price = this.safeFloat (delta, 'price');
        const amount = this.safeFloat (delta, 'volume');
        const nonce = this.safeInteger (delta, 'entryId');
        bookside.store (price, amount);
        return nonce;
    }

    handleDeltas (bookside, deltas) {
        let nonce = 0;
        for (let i = 0; i < deltas.length; i++) {
            const n = this.handleDelta (bookside, deltas[i]);
            nonce = Math.max (nonce, n);
        }
        return nonce;
    }

    handleOrderBookMessage (client, message, orderbook) {
        //
        //     {
        //         i: -1,
        //         n: 'OrderBookEvent',
        //         o: {
        //             ask: [
        //                 { entryId: 60949856, price: 31575000, volume: 0.3163, updatedAt: 1609420344.174 }
        //             ],
        //             bid: [],
        //             tradingPairName: 'BTC-KRW'
        //         }
        //     }
        //
        const o = this.safeValue (message, 'o', {});
        const askNonce = this.handleDeltas (orderbook['asks'], this.safeValue (o, 'ask', []));
        const bidNonce = this.handleDeltas (orderbook['bids'], this.safeValue (o, 'bid', []));
        const nonce = Math.max (askNonce, bidNonce);
        orderbook['nonce'] = nonce;
        return orderbook;
    }

    handleOrderBook (client, message) {
        //
        // initial snapshot
        //
        //     {
        //         n: 'SubscribeToOrderBook',
        //         o: {
        //             ask: [
        //                 { entryId: 60490601, price: 32061000, volume: 0.09996, updatedAt: 1609412729.325 },
        //                 { entryId: 60490959, price: 32078000, volume: 0.206, updatedAt: 1609412735.793 },
        //                 { entryId: 60490687, price: 32085000, volume: 0.192, updatedAt: 1609412730.373 },
        //             ],
        //             bid: [
        //                 { entryId: 60491143, price: 32059000, volume: 0.3118, updatedAt: 1609412740.011 },
        //                 { entryId: 60490948, price: 32058000, volume: 0.00162449, updatedAt: 1609412735.555 },
        //                 { entryId: 60488158, price: 32053000, volume: 0.206, updatedAt: 1609412680.169 },
        //             ],
        //             tradingPairName: 'BTC-KRW',
        //             maxEntryId: 60491355
        //         }
        //     }
        //
        // delta update
        //
        //     {
        //         i: -1,
        //         n: 'OrderBookEvent',
        //         o: {
        //             ask: [
        //                 { entryId: 60949856, price: 31575000, volume: 0.3163, updatedAt: 1609420344.174 }
        //             ],
        //             bid: [],
        //             tradingPairName: 'BTC-KRW'
        //         }
        //     }
        //
        const n = this.safeString (message, 'n');
        const o = this.safeValue (message, 'o');
        const marketId = this.safeString (o, 'tradingPairName');
        const market = this.safeMarket (marketId, undefined, '-');
        const symbol = market['symbol'];
        // const nonce = this.safeInteger (o, 'maxEntryId');
        const name = 'orderbook';
        const messageHash = name + ':' + market['id'];
        const subscription = this.safeValue (client.subscriptions, messageHash, {});
        const limit = this.safeInteger (subscription, 'limit');
        if (!(symbol in this.orderbooks)) {
            this.orderbooks[symbol] = this.orderBook ({}, limit);
        }
        const orderbook = this.safeValue (this.orderbooks, symbol);
        if (!(symbol in this.orderbooks)) {
            this.orderbooks[symbol] = this.orderBook ({}, limit);
        }
        if (n === 'SubscribeToOrderBook') {
            this.handleOrderBookMessage (client, message, orderbook);
            for (let i = 0; i < orderbook.cache.length; i++) {
                const message = orderbook.cache[i];
                this.handleOrderBookMessage (client, message, orderbook);
            }
            client.resolve (orderbook, messageHash);
        } else {
            if (orderbook['nonce'] === undefined) {
                orderbook.cache.push (message);
            } else {
                this.handleOrderBookMessage (client, message, orderbook);
                client.resolve (orderbook, messageHash);
            }
        }
    }

    async watchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' watchOrders requires a symbol argument');
        }
        await this.loadMarkets ();
        const authenticate = this.authenticate ();
        const market = this.market (symbol);
        const marketId = market['id'];
        const url = this.urls['api']['ws'];
        const name = 'account';
        const subscriptionHash = name + '@' + marketId;
        const messageHash = subscriptionHash + '_' + 'order';
        const request = {
            'action': 'subscribe',
            'channels': [
                {
                    'name': name,
                    'markets': [ marketId ],
                },
            ],
        };
        const future = this.afterDropped (authenticate, this.watch, url, messageHash, request, subscriptionHash);
        return await this.after (future, this.filterBySymbolSinceLimit, symbol, since, limit);
    }

    async watchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' watchMyTrades requires a symbol argument');
        }
        await this.loadMarkets ();
        const authenticate = this.authenticate ();
        const market = this.market (symbol);
        const marketId = market['id'];
        const url = this.urls['api']['ws'];
        const name = 'account';
        const subscriptionHash = name + '@' + marketId;
        const messageHash = subscriptionHash + '_' + 'fill';
        const request = {
            'action': 'subscribe',
            'channels': [
                {
                    'name': name,
                    'markets': [ marketId ],
                },
            ],
        };
        const future = this.afterDropped (authenticate, this.watch, url, messageHash, request, subscriptionHash);
        return await this.after (future, this.filterBySymbolSinceLimit, symbol, since, limit);
    }

    handleOrder (client, message) {
        //
        //     {
        //         event: 'order',
        //         orderId: 'f0e5180f-9497-4d05-9dc2-7056e8a2de9b',
        //         market: 'ETH-EUR',
        //         created: 1590948500319,
        //         updated: 1590948500319,
        //         status: 'new',
        //         side: 'sell',
        //         orderType: 'limit',
        //         amount: '0.1',
        //         amountRemaining: '0.1',
        //         price: '300',
        //         onHold: '0.1',
        //         onHoldCurrency: 'ETH',
        //         selfTradePrevention: 'decrementAndCancel',
        //         visible: true,
        //         timeInForce: 'GTC',
        //         postOnly: false
        //     }
        //
        const name = 'account';
        const event = this.safeString (message, 'event');
        const marketId = this.safeString (message, 'market');
        const messageHash = name + '@' + marketId + '_' + event;
        let symbol = marketId;
        let market = undefined;
        if (marketId in this.markets_by_id) {
            market = this.markets_by_id[marketId];
            symbol = market['symbol'];
        }
        const order = this.parseOrder (message, market);
        const orderId = order['id'];
        const defaultKey = this.safeValue (this.orders, symbol, {});
        defaultKey[orderId] = order;
        this.orders[symbol] = defaultKey;
        let result = [];
        const values = Object.values (this.orders);
        for (let i = 0; i < values.length; i++) {
            const orders = Object.values (values[i]);
            result = this.arrayConcat (result, orders);
        }
        // delete older orders from our structure to prevent memory leaks
        const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
        result = this.sortBy (result, 'timestamp');
        const resultLength = result.length;
        if (resultLength > limit) {
            const toDelete = resultLength - limit;
            for (let i = 0; i < toDelete; i++) {
                const id = result[i]['id'];
                const symbol = result[i]['symbol'];
                delete this.orders[symbol][id];
            }
            result = result.slice (toDelete, resultLength);
        }
        client.resolve (result, messageHash);
    }

    handleMyTrade (client, message) {
        //
        //     {
        //         event: 'fill',
        //         timestamp: 1590964470132,
        //         market: 'ETH-EUR',
        //         orderId: '85d082e1-eda4-4209-9580-248281a29a9a',
        //         fillId: '861d2da5-aa93-475c-8d9a-dce431bd4211',
        //         side: 'sell',
        //         amount: '0.1',
        //         price: '211.46',
        //         taker: true,
        //         fee: '0.056',
        //         feeCurrency: 'EUR'
        //     }
        //
        const name = 'account';
        const event = this.safeString (message, 'event');
        const marketId = this.safeString (message, 'market');
        const messageHash = name + '@' + marketId + '_' + event;
        const market = this.safeMarket (marketId, undefined, '-');
        const trade = this.parseTrade (message, market);
        if (this.myTrades === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            this.myTrades = new ArrayCache (limit);
        }
        const array = this.myTrades;
        array.append (trade);
        this.myTrades = array;
        client.resolve (array, messageHash);
    }

    handleMessage (client, message) {
        //
        //     {
        //         n: 'SubscribeToOrderBook',
        //         o: {
        //             ask: [
        //                 { entryId: 60490601, price: 32061000, volume: 0.09996, updatedAt: 1609412729.325 },
        //                 { entryId: 60490959, price: 32078000, volume: 0.206, updatedAt: 1609412735.793 },
        //                 { entryId: 60490687, price: 32085000, volume: 0.192, updatedAt: 1609412730.373 },
        //             ],
        //             bid: [
        //                 { entryId: 60491143, price: 32059000, volume: 0.3118, updatedAt: 1609412740.011 },
        //                 { entryId: 60490948, price: 32058000, volume: 0.00162449, updatedAt: 1609412735.555 },
        //                 { entryId: 60488158, price: 32053000, volume: 0.206, updatedAt: 1609412680.169 },
        //             ],
        //             tradingPairName: 'BTC-KRW',
        //             maxEntryId: 60491355
        //         }
        //     }
        //
        const methods = {
        //     'subscribed': this.handleSubscriptionStatus,
            'OrderBookEvent': this.handleOrderBook,
            'SubscribeToOrderBook': this.handleOrderBook,
        //     'trade': this.handleTrade,
        //     'candle': this.handleOHLCV,
        //     'ticker24h': this.handleTicker,
        //     'authenticate': this.handleAuthenticationMessage,
        //     'order': this.handleOrder,
        //     'fill': this.handleMyTrade,
        };
        const n = this.safeString (message, 'n');
        const method = this.safeValue (methods, n);
        if (method === undefined) {
            return message;
        } else {
            return method.call (this, client, message);
        }
    }
};
