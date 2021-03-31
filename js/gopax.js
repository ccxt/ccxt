'use strict';

//  ---------------------------------------------------------------------------

const ccxt = require ('ccxt');
const { ArrayCache, ArrayCacheBySymbolById } = require ('./base/Cache');

//  ---------------------------------------------------------------------------

module.exports = class gopax extends ccxt.gopax {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchOrderBook': true,
                'watchMyTrades': true,
                'watchBalance': true,
                'watchOrders': true,
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
        const orderbook = await this.watch (url, messageHash, message, messageHash, subscription);
        return orderbook.limit (limit);
    }

    handleDelta (orderbook, bookside, delta) {
        //
        //     {
        //         entryId: 60949856,
        //         price: 31575000,
        //         volume: 0.3163,
        //         updatedAt: 1609420344.174
        //     }
        //
        const entryId = this.safeInteger (delta, 'entryId');
        if ((orderbook['nonce'] !== undefined) && (entryId >= orderbook['nonce'])) {
            const price = this.safeFloat (delta, 'price');
            const amount = this.safeFloat (delta, 'volume');
            bookside.store (price, amount);
        }
        return entryId;
    }

    handleDeltas (orderbook, bookside, deltas) {
        let nonce = 0;
        for (let i = 0; i < deltas.length; i++) {
            const n = this.handleDelta (orderbook, bookside, deltas[i]);
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
        const askNonce = this.handleDeltas (orderbook, orderbook['asks'], this.safeValue (o, 'ask', []));
        const bidNonce = this.handleDeltas (orderbook, orderbook['bids'], this.safeValue (o, 'bid', []));
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
        if (n === 'SubscribeToOrderBook') {
            orderbook['nonce'] = 0;
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
        await this.loadMarkets ();
        const name = 'orders';
        const subscriptionHash = name;
        let messageHash = name;
        if (symbol !== undefined) {
            messageHash += ':' + symbol;
        }
        const url = this.getSignedUrl ();
        const request = {
            'n': 'SubscribeToOrders',
            'o': {},
        };
        const subscription = {
            'messageHash': messageHash,
            'name': name,
            'symbol': symbol,
            'method': this.handleOrderBook,
            'limit': limit,
            'params': params,
        };
        const message = this.extend (request, params);
        const orders = await this.watch (url, messageHash, message, subscriptionHash, subscription);
        if (this.newUpdates) {
            limit = orders.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (orders, symbol, since, limit, true);
    }

    parseWsOrderStatus (status) {
        const statuses = {
            '1': 'open',
            '2': 'canceled',
            '3': 'closed',
            '4': 'open',
            // '5': 'reserved',
        };
        return this.safeString (statuses, status, status);
    }

    parseWsOrderType (orderType) {
        const types = {
            '1': 'limit',
            '2': 'market',
        };
        return this.safeString (types, orderType, orderType);
    }

    parseWsOrderSide (side) {
        const sides = {
            '1': 'buy',
            '2': 'sell',
        };
        return this.safeString (sides, side, side);
    }

    parseWsTimeInForce (timeInForce) {
        const timeInForces = {
            '0': 'GTC',
            '1': 'PO',
            '2': 'IOC',
            '3': 'FOK',
        };
        return this.safeString (timeInForces, timeInForce, timeInForce);
    }

    parseWsOrder (order, market = undefined) {
        //
        //     {
        //         "orderId": 327347,           // order ID
        //         "status": 1,                 // 1(not filled), 2(canceled), 3(completely filled), 4(partially filled), 5(reserved)
        //         "side": 2,                   // 1(bid), 2(ask)
        //         "type": 1,                   // 1(limit), 2(market)
        //         "price": 5500000,            // price
        //         "orgAmount": 1,              // initially placed amount
        //         "remainAmount": 1,           // unfilled or remaining amount
        //         "createdAt": 1597218137,     // placement time
        //         "updatedAt": 1597218137,     // last update time
        //         "tradedBaseAmount": 0,       // filled base asset amount (in ZEC for this case)
        //         "tradedQuoteAmount": 0,      // filled quote asset amount (in KRW for this case)
        //         "feeAmount": 0,              // fee amount
        //         "rewardAmount": 0,           // reward amount
        //         "timeInForce": 0,            // 0(gtc), 1(post only), 2(ioc), 3(fok)
        //         "protection": 1,             // 1(not applied), 2(applied)
        //         "forcedCompletionReason": 0, // 0(n/a), 1(timeInForce), 2(protection)
        //         "stopPrice": 0,              // stop price (> 0 only for stop orders)
        //         "takerFeeAmount": 0,         // fee amount paid as a taker position
        //         "tradingPairName": "ZEC-KRW" // order book
        //     }
        //
        const id = this.safeString (order, 'orderId');
        const clientOrderId = this.safeString (order, 'clientOrderId');
        const timestamp = this.safeTimestamp (order, 'createdAt');
        const type = this.parseWsOrderType (this.safeString (order, 'type'));
        const side = this.parseWsOrderSide (this.safeString (order, 'side'));
        const timeInForce = this.parseWsTimeInForce (this.safeString (order, 'timeInForce'));
        const price = this.safeFloat (order, 'price');
        const amount = this.safeFloat (order, 'orgAmount');
        const stopPrice = this.safeFloat (order, 'stopPrice');
        const remaining = this.safeFloat (order, 'remainAmount');
        const marketId = this.safeString (order, 'tradingPairName');
        market = this.safeMarket (marketId, market, '-');
        const status = this.parseWsOrderStatus (this.safeString (order, 'status'));
        let filled = this.safeFloat (order, 'tradedBaseAmount');
        let cost = this.safeFloat (order, 'tradedQuoteAmount');
        let updated = undefined;
        if ((amount !== undefined) && (remaining !== undefined)) {
            filled = Math.max (0, amount - remaining);
            if (filled > 0) {
                updated = this.safeTimestamp (order, 'updatedAt');
            }
            if (price !== undefined) {
                cost = filled * price;
            }
        }
        let postOnly = undefined;
        if (timeInForce !== undefined) {
            postOnly = (timeInForce === 'PO');
        }
        const fee = undefined;
        return {
            'id': id,
            'clientOrderId': clientOrderId,
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'lastTradeTimestamp': updated,
            'status': status,
            'symbol': market['symbol'],
            'type': type,
            'timeInForce': timeInForce,
            'postOnly': postOnly,
            'side': side,
            'price': price,
            'stopPrice': stopPrice,
            'average': price,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'cost': cost,
            'trades': undefined,
            'fee': fee,
            'info': order,
        };
    }

    handleOrder (client, message, order, market = undefined) {
        const parsed = this.parseWsOrder (order);
        if (this.orders === undefined) {
            const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
            this.orders = new ArrayCacheBySymbolById (limit);
        }
        const orders = this.orders;
        orders.append (parsed);
        return parsed;
    }

    handleOrders (client, message) {
        //
        // subscription response
        //
        //
        //     {
        //         "n": "SubscribeToOrders",
        //         "o": {
        //             "data": [
        //                 {
        //                     "orderId": 327347,           // order ID
        //                     "status": 1,                 // 1(not filled), 2(canceled), 3(completely filled), 4(partially filled), 5(reserved)
        //                     "side": 2,                   // 1(bid), 2(ask)
        //                     "type": 1,                   // 1(limit), 2(market)
        //                     "price": 5500000,            // price
        //                     "orgAmount": 1,              // initially placed amount
        //                     "remainAmount": 1,           // unfilled or remaining amount
        //                     "createdAt": 1597218137,     // placement time
        //                     "updatedAt": 1597218137,     // last update time
        //                     "tradedBaseAmount": 0,       // filled base asset amount (in ZEC for this case)
        //                     "tradedQuoteAmount": 0,      // filled quote asset amount (in KRW for this case)
        //                     "feeAmount": 0,              // fee amount
        //                     "rewardAmount": 0,           // reward amount
        //                     "timeInForce": 0,            // 0(gtc), 1(post only), 2(ioc), 3(fok)
        //                     "protection": 1,             // 1(not applied), 2(applied)
        //                     "forcedCompletionReason": 0, // 0(n/a), 1(timeInForce), 2(protection)
        //                     "stopPrice": 0,              // stop price (> 0 only for stop orders)
        //                     "takerFeeAmount": 0,         // fee amount paid as a taker position
        //                     "tradingPairName": "ZEC-KRW" // order book
        //                 }
        //             ]
        //         }
        //     }
        //
        // delta update
        //
        //     {
        //         "i": -1,                         // always -1 in case of delta push
        //         "n": "OrderEvent",
        //         "o": {
        //             "orderId": 327347,
        //             "status": 4,                 // changed to 4(partially filled)
        //             "side": 2,
        //             "type": 1,
        //             "price": 5500000,
        //             "orgAmount": 1,
        //             "remainAmount": 0.8,         // -0.2 as 0.2 ZEC is filled
        //             "createdAt": 1597218137,
        //             "updatedAt": 1599093631,     // updated
        //             "tradedBaseAmount": 0.2,     // 0.2 ZEC goes out
        //             "tradedQuoteAmount": 1100000,// 1,100,000 KRW comes in
        //             "feeAmount": 440,            // fee amount (in KRW and 0.04% for this case)
        //             "rewardAmount": 0,
        //             "timeInForce": 0,
        //             "protection": 1,
        //             "forcedCompletionReason": 0,
        //             "stopPrice": 0,
        //             "takerFeeAmount": 0,
        //             "tradingPairName": "ZEC-KRW"
        //         }
        //     }
        //
        const o = this.safeValue (message, 'o', []);
        const data = this.safeValue (o, 'data');
        const messageHash = 'orders';
        if (data === undefined) {
            // single order delta update
            const order = this.handleOrder (client, message, data);
            const symbol = order['symbol'];
            client.resolve (this.orders, messageHash);
            client.resolve (this.orders, messageHash + ':' + symbol);
        } else {
            // initial subscription response with multiple orders
            const dataLength = data.length;
            if (dataLength > 0) {
                const symbols = {};
                for (let i = 0; i < dataLength; i++) {
                    const order = this.handleOrder (client, message, data[i]);
                    const symbol = order['symbol'];
                    symbols[symbol] = true;
                }
                client.resolve (this.orders, messageHash);
                const keys = Object.keys (symbols);
                for (let i = 0; i < keys.length; i++) {
                    const symbol = keys[i];
                    client.resolve (this.orders, messageHash + ':' + symbol);
                }
            }
        }
    }

    async watchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const name = 'myTrades';
        const subscriptionHash = name;
        let messageHash = name;
        if (symbol !== undefined) {
            messageHash += ':' + symbol;
        }
        const url = this.getSignedUrl ();
        const request = {
            'n': 'SubscribeToTrades',
            'o': {},
        };
        const subscription = {
            'messageHash': messageHash,
            'name': name,
            'symbol': symbol,
            'method': this.handleMyTrades,
            'limit': limit,
            'params': params,
        };
        const message = this.extend (request, params);
        const trades = await this.watch (url, messageHash, message, subscriptionHash, subscription);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    handleMyTrades (client, message) {
        //
        // subscription response
        //
        //     { n: 'SubscribeToTrades', o: {} }
        //
        //  regular update
        //
        //     {
        //         "i": -1,
        //         "n": "TradeEvent",
        //         "o": {
        //             "tradeId": 74072,            // trade ID
        //             "orderId": 453529,           // order ID
        //             "side": 2,                   // 1(bid), 2(ask)
        //             "type": 1,                   // 1(limit), 2(market)
        //             "baseAmount": 0.01,          // filled base asset amount (in ZEC for this case)
        //             "quoteAmount": 1,            // filled quote asset amount (in KRW for this case)
        //             "fee": 0.0004,               // fee
        //             "price": 100,                // price
        //             "isSelfTrade": false,        // whether both of matching orders are yours
        //             "occurredAt": 1603932107,    // trade occurrence time
        //             "tradingPairName": "ZEC-KRW" // order book
        //         }
        //     }
        //
        const o = this.safeValue (message, 'o', {});
        const name = 'myTrades';
        const messageHash = name;
        const trade = this.parseTrade (o);
        const symbol = trade['symbol'];
        let array = this.safeValue (this.myTrades, symbol);
        if (array === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            array = new ArrayCache (limit);
        }
        array.append (trade);
        this.myTrades[symbol] = array;
        client.resolve (array, messageHash);
        client.resolve (array, messageHash + ':' + symbol);
    }

    async watchBalance (params = {}) {
        await this.loadMarkets ();
        const name = 'balance';
        const messageHash = name;
        const url = this.getSignedUrl ();
        const request = {
            'n': 'SubscribeToBalances',
            'o': {},
        };
        const subscription = {
            'messageHash': messageHash,
            'name': name,
            'params': params,
        };
        const message = this.extend (request, params);
        return await this.watch (url, messageHash, message, messageHash, subscription);
    }

    handleBalance (client, message) {
        //
        //     {
        //         n: 'SubscribeToBalances',
        //         o: {
        //             result: true,
        //             data: [
        //                 { assetId: 1, avail: 30000.74103433, hold: 0, pendingWithdrawal: 0, blendedPrice: 1, lastUpdatedAt: 1609519939.412, isoAlpha3: 'KRW' },
        //                 { assetId: 3, avail: 0, hold: 0, pendingWithdrawal: 0, blendedPrice: 0, lastUpdatedAt: 0, isoAlpha3: 'ETH' },
        //                 { assetId: 4, avail: 0, hold: 0, pendingWithdrawal: 0, blendedPrice: 0, lastUpdatedAt: 0, isoAlpha3: 'BTC' },
        //             ],
        //         },
        //     }
        //
        //     {
        //         "i": -1,                             // always -1 in case of delta push
        //         "n": "BalanceEvent",
        //         "o": {
        //             "assetId": 7,
        //             "avail": 990.4998,               // +1 as you can use 1 ZEC more to place a new order
        //             "hold": 1,                       // -1 as you take it back from an order book
        //             "pendingWithdrawal": 0,
        //             "blendedPrice": 429413.08986192,
        //             "lastUpdatedAt": 1599098077.27,
        //             "isoAlpha3": "ZEC"
        //         }
        //     }
        //
        const o = this.safeValue (message, 'o');
        const data = this.safeValue (o, 'data');
        if (data === undefined) {
            const balance = this.parseBalanceResponse ([ o ]);
            this.balance = this.parseBalance (this.extend (this.balance, balance));
        } else {
            this.balance = this.parseBalanceResponse (data);
        }
        const messageHash = 'balance';
        client.resolve (this.balance, messageHash);
    }

    async pong (client, message) {
        //
        //     "primus::ping::1609504526621"
        //
        const messageString = JSON.parse (message);
        const parts = messageString.split ('::');
        const requestId = this.safeString (parts, 2);
        const response = 'primus::pong::' + requestId;
        await client.send (response);
    }

    handlePing (client, message) {
        this.spawn (this.pong, client, message);
    }

    handleMessage (client, message) {
        //
        // ping string message
        //
        //     "primus::ping::1609504526621"
        //
        // regular json message
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
        if (typeof message === 'string') {
            this.handlePing (client, message);
        } else {
            const methods = {
                'OrderBookEvent': this.handleOrderBook,
                'SubscribeToOrderBook': this.handleOrderBook,
                // 'SubscribeToTrades': this.handleMyTrades,
                'TradeEvent': this.handleMyTrades,
                'SubscribeToOrders': this.handleOrders,
                'OrderEvent': this.handleOrders,
                'SubscribeToBalances': this.handleBalance,
                'BalanceEvent': this.handleBalance,
            };
            const n = this.safeString (message, 'n');
            const method = this.safeValue (methods, n);
            if (method !== undefined) {
                return method.call (this, client, message);
            }
        }
        return message;
    }
};
