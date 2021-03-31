'use strict';

//  ---------------------------------------------------------------------------

const ccxt = require ('ccxt');
const { ArrayCache, ArrayCacheBySymbolById } = require ('./base/Cache');

//  ---------------------------------------------------------------------------

module.exports = class poloniex extends ccxt.poloniex {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchTicker': true,
                'watchTickers': false, // for now
                'watchTrades': true,
                'watchOrderBook': true,
                'watchBalance': false, // not implemented yet
                'watchOHLCV': false, // missing on the exchange side
            },
            'urls': {
                'api': {
                    'ws': 'wss://api2.poloniex.com',
                },
            },
            'options': {
                'tradesLimit': 1000,
                'symbolsByOrderId': {},
            },
        });
    }

    handleTickers (client, message) {
        //
        //     [
        //         1002,
        //         null,
        //         [
        //             50,               // currency pair id
        //             '0.00663930',     // last trade price
        //             '0.00663924',     // lowest ask
        //             '0.00663009',     // highest bid
        //             '0.01591824',     // percent change in last 24 hours
        //             '176.03923205',   // 24h base volume
        //             '26490.59208176', // 24h quote volume
        //             0,                // is frozen
        //             '0.00678580',     // highest price
        //             '0.00648216'      // lowest price
        //         ]
        //     ]
        //
        const channelId = this.safeString (message, 0);
        const subscribed = this.safeValue (message, 1);
        if (subscribed) {
            // skip subscription confirmation
            return;
        }
        const ticker = this.safeValue (message, 2);
        const numericId = this.safeString (ticker, 0);
        const market = this.safeValue (this.options['marketsByNumericId'], numericId);
        if (market === undefined) {
            // todo handle market not found, reject corresponging futures
            return;
        }
        const symbol = this.safeString (market, 'symbol');
        const timestamp = this.milliseconds ();
        let open = undefined;
        let change = undefined;
        let average = undefined;
        const last = this.safeFloat (ticker, 1);
        const relativeChange = this.safeFloat (ticker, 4);
        if (relativeChange !== -1) {
            open = last / this.sum (1, relativeChange);
            change = last - open;
            average = this.sum (last, open) / 2;
        }
        const result = {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 8),
            'low': this.safeFloat (ticker, 9),
            'bid': this.safeFloat (ticker, 3),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 2),
            'askVolume': undefined,
            'vwap': undefined,
            'open': open,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': change,
            'percentage': relativeChange * 100,
            'average': average,
            'baseVolume': this.safeFloat (ticker, 6),
            'quoteVolume': this.safeFloat (ticker, 5),
            'info': ticker,
        };
        this.tickers[symbol] = result;
        const messageHash = channelId + ':' + numericId;
        client.resolve (result, messageHash);
    }

    async subscribePrivate (messageHash, subscription) {
        const channelId = '1000';
        const url = this.urls['api']['ws'];
        const client = this.client (url);
        if (!(channelId in client.subscriptions)) {
            this.spawn (this.fetchAndCacheOpenOrders);
        }
        const nonce = this.nonce ();
        const payload = this.urlencode ({ 'nonce': nonce });
        const signature = this.hmac (this.encode (payload), this.encode (this.secret), 'sha512');
        const subscribe = {
            'command': 'subscribe',
            'channel': channelId,
            'key': this.apiKey,
            'payload': payload,
            'sign': signature,
        };
        return await this.watch (url, messageHash, subscribe, channelId, subscription);
    }

    async watchBalance (params = {}) {
        this.checkRequiredCredentials ();
        await this.loadMarkets ();
        const url = this.urls['api']['ws'];
        const client = this.client (url);
        const messageHash = 'balance';
        const channelId = '1000';
        const existingSubscription = this.safeValue (client.subscriptions, channelId, {});
        const fetchedBalance = this.safeValue (existingSubscription, 'fetchedBalance', false);
        if (!fetchedBalance) {
            this.balance = await this.fetchBalance ();
            existingSubscription['fetchedBalance'] = true;
        }
        return await this.subscribePrivate (messageHash, existingSubscription);
    }

    async fetchAndCacheOpenOrders () {
        // a cancel order update does not give us very much information
        // about an order, we cache the information before receiving cancel updates
        const openOrders = await this.fetchOpenOrders ();
        let orders = this.orders;
        const symbolsByOrderId = this.safeValue (this.options, 'symbolsByOrderId', {});
        if (orders === undefined) {
            const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
            orders = new ArrayCacheBySymbolById (limit);
            this.orders = orders;
        }
        for (let i = 0; i < openOrders.length; i++) {
            const openOrder = openOrders[i];
            orders.append (openOrder);
            symbolsByOrderId[openOrder.id] = openOrder.symbol;
        }
        this.options['symbolsByOrderId'] = symbolsByOrderId;
    }

    async watchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        this.checkRequiredCredentials ();
        await this.loadMarkets ();
        let messageHash = 'orders';
        if (symbol) {
            const marketId = this.marketId (symbol);
            messageHash = messageHash + ':' + marketId;
        }
        const orders = await this.subscribePrivate (messageHash, {});
        if (this.newUpdates) {
            limit = orders.getLimit ();
        }
        return this.filterBySymbolSinceLimit (orders, symbol, since, limit);
    }

    async watchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        this.checkRequiredCredentials ();
        await this.loadMarkets ();
        let messageHash = 'myTrades';
        if (symbol) {
            const marketId = this.marketId (symbol);
            messageHash = messageHash + ':' + marketId;
        }
        const trades = await this.subscribePrivate (messageHash, {});
        if (this.newUpdates) {
            limit = trades.getLimit ();
        }
        return this.filterBySymbolSinceLimit (trades, symbol, since, limit);
    }

    async watchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const numericId = this.safeString (market, 'numericId');
        const channelId = '1002';
        const messageHash = channelId + ':' + numericId;
        const url = this.urls['api']['ws'];
        const subscribe = {
            'command': 'subscribe',
            'channel': channelId,
        };
        return await this.watch (url, messageHash, subscribe, channelId);
    }

    async watchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const channelId = '1002';
        const messageHash = channelId;
        const url = this.urls['api']['ws'];
        const subscribe = {
            'command': 'subscribe',
            'channel': channelId,
        };
        const tickers = await this.watch (url, messageHash, subscribe, channelId);
        return this.filterByArray (tickers, 'symbol', symbols);
    }

    async loadMarkets (reload = false, params = {}) {
        const markets = await super.loadMarkets (reload, params);
        let marketsByNumericId = this.safeValue (this.options, 'marketsByNumericId');
        if ((marketsByNumericId === undefined) || reload) {
            marketsByNumericId = {};
            for (let i = 0; i < this.symbols.length; i++) {
                const symbol = this.symbols[i];
                const market = this.markets[symbol];
                const numericId = this.safeString (market, 'numericId');
                marketsByNumericId[numericId] = market;
            }
            this.options['marketsByNumericId'] = marketsByNumericId;
        }
        let currenciesByNumericId = this.safeValue (this.options, 'marketsByNumericId');
        if ((currenciesByNumericId === undefined) || reload) {
            currenciesByNumericId = {};
            const keys = Object.keys (this.currencies);
            for (let i = 0; i < keys.length; i++) {
                const currency = this.currencies[keys[i]];
                const numericId = this.safeString (currency, 'numericId');
                currenciesByNumericId[numericId] = currency;
            }
            this.options['currenciesByNumericId'] = currenciesByNumericId;
        }
        return markets;
    }

    async watchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const numericId = this.safeString (market, 'numericId');
        const messageHash = 'trades:' + numericId;
        const url = this.urls['api']['ws'];
        const subscribe = {
            'command': 'subscribe',
            'channel': numericId,
        };
        const trades = await this.watch (url, messageHash, subscribe, numericId);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    async watchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const numericId = this.safeString (market, 'numericId');
        const messageHash = 'orderbook:' + numericId;
        const url = this.urls['api']['ws'];
        const subscribe = {
            'command': 'subscribe',
            'channel': numericId,
        };
        const orderbook = await this.watch (url, messageHash, subscribe, numericId);
        return orderbook.limit (limit);
    }

    async watchHeartbeat (params = {}) {
        await this.loadMarkets ();
        const channelId = '1010';
        const url = this.urls['api']['ws'];
        return await this.watch (url, channelId);
    }

    handleHeartbeat (client, message) {
        //
        // every second (approx) if no other updates are sent
        //
        //     [ 1010 ]
        //
        const channelId = '1010';
        client.resolve (message, channelId);
    }

    handleTrade (client, trade, market = undefined) {
        //
        // public trades
        //
        //     [
        //         "t", // trade
        //         "42706057", // id
        //         1, // 1 = buy, 0 = sell
        //         "0.05567134", // price
        //         "0.00181421", // amount
        //         1522877119, // timestamp
        //     ]
        //
        const id = this.safeString (trade, 1);
        const isBuy = this.safeInteger (trade, 2);
        const side = isBuy ? 'buy' : 'sell';
        const price = this.safeFloat (trade, 3);
        const amount = this.safeFloat (trade, 4);
        const timestamp = this.safeTimestamp (trade, 5);
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        return {
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': id,
            'order': undefined,
            'type': undefined,
            'takerOrMaker': undefined,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': price * amount,
            'fee': undefined,
        };
    }

    handleOrderBookAndTrades (client, message) {
        //
        // first response
        //
        //     [
        //         14, // channelId === market['numericId']
        //         8767, // nonce
        //         [
        //             [
        //                 "i", // initial snapshot
        //                 {
        //                     "currencyPair": "BTC_BTS",
        //                     "orderBook": [
        //                         { "0.00001853": "2537.5637", "0.00001854": "1567238.172367" }, // asks, price, size
        //                         { "0.00001841": "3645.3647", "0.00001840": "1637.3647" } // bids
        //                     ]
        //                 }
        //             ]
        //         ]
        //     ]
        //
        // subsequent updates
        //
        //     [
        //         14,
        //         8768,
        //         [
        //             [ "o", 1, "0.00001823", "5534.6474" ], // orderbook delta, bids, price, size
        //             [ "o", 0, "0.00001824", "6575.464" ], // orderbook delta, asks, price, size
        //             [ "t", "42706057", 1, "0.05567134", "0.00181421", 1522877119 ] // trade, id, side (1 for buy, 0 for sell), price, size, timestamp
        //         ]
        //     ]
        //
        const marketId = message[0].toString ();
        const nonce = message[1];
        const data = message[2];
        const market = this.safeValue (this.options['marketsByNumericId'], marketId);
        const symbol = this.safeString (market, 'symbol');
        let orderbookUpdatesCount = 0;
        let tradesCount = 0;
        let stored = this.safeValue (this.trades, symbol);
        if (stored === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            stored = new ArrayCache (limit);
            this.trades[symbol] = stored;
        }
        for (let i = 0; i < data.length; i++) {
            const delta = data[i];
            if (delta[0] === 'i') {
                const snapshot = this.safeValue (delta[1], 'orderBook', []);
                const sides = [ 'asks', 'bids' ];
                this.orderbooks[symbol] = this.orderBook ();
                const orderbook = this.orderbooks[symbol];
                for (let j = 0; j < snapshot.length; j++) {
                    const side = sides[j];
                    const bookside = orderbook[side];
                    const orders = snapshot[j];
                    const prices = Object.keys (orders);
                    for (let k = 0; k < prices.length; k++) {
                        const price = prices[k];
                        const amount = orders[price];
                        bookside.store (parseFloat (price), parseFloat (amount));
                    }
                }
                orderbook['nonce'] = nonce;
                orderbookUpdatesCount = this.sum (orderbookUpdatesCount, 1);
            } else if (delta[0] === 'o') {
                const orderbook = this.orderbooks[symbol];
                const side = delta[1] ? 'bids' : 'asks';
                const bookside = orderbook[side];
                const price = parseFloat (delta[2]);
                const amount = parseFloat (delta[3]);
                bookside.store (price, amount);
                orderbookUpdatesCount = this.sum (orderbookUpdatesCount, 1);
                orderbook['nonce'] = nonce;
            } else if (delta[0] === 't') {
                const trade = this.handleTrade (client, delta, market);
                stored.append (trade);
                tradesCount = this.sum (tradesCount, 1);
            }
        }
        if (orderbookUpdatesCount) {
            // resolve the orderbook future
            const messageHash = 'orderbook:' + marketId;
            const orderbook = this.orderbooks[symbol];
            client.resolve (orderbook, messageHash);
        }
        if (tradesCount) {
            // resolve the trades future
            const messageHash = 'trades:' + marketId;
            // todo: incremental trades
            client.resolve (stored, messageHash);
        }
    }

    handleAccountNotifications (client, message) {
        // [
        //   1000,
        //   '',
        //   [
        //     [
        //       'p',
        //       898860801559,
        //       121,
        //       '48402.31639500',
        //       '0.00004133',
        //       '0',
        //       null
        //     ],
        //     [ 'b', 28, 'e', '-0.00004133' ],
        //     [ 'b', 214, 'e', '1.99915833' ],
        //     [
        //       't',
        //       42365437,
        //       '48431.17368463',
        //       '0.00004133',
        //       '0.00125000',
        //       0,
        //       898860801559,
        //       '0.00242155',
        //       '2021-03-06 20:01:23',
        //       null,
        //       '0.00004133'
        //     ]
        //   ]
        // ]
        const data = this.safeValue (message, 2, []);
        // order is important here
        const methods = {
            'b': [ this.handleBalance ],
            'p': [ this.handleOrder, this.handleBalance ],
            'n': [ this.handleOrder, this.handleBalance ],
            'o': [ this.handleOrder, this.handleBalance ],
            't': [ this.handleMyTrade, this.handleOrder, this.handleBalance ],
        };
        for (let i = 0; i < data.length; i++) {
            const entry = data[i];
            const type = this.safeString (entry, 0);
            const callbacks = this.safeValue (methods, type);
            if (Array.isArray (callbacks)) {
                for (let j = 0; j < callbacks.length; j++) {
                    const callback = callbacks[j];
                    callback.call (this, client, entry);
                }
            }
        }
    }

    handleBalance (client, message) {
        //
        // balance update
        // [ 'b', 28, 'e', '-0.00004133' ]
        // [ 'b', 214, 'e', '1.99915833' ]
        //
        // pending
        // [ 'p', 6083059, 148, '48402.31639500', '0.00004133', '0', null ]
        //
        // new order
        // ["n", 148, 6083059, 1, "0.03000000", "2.00000000", "2018-09-08 04:54:09", "2.00000000", "12345"]
        // ["n", <currency pair id>, <order number>, <order type>, "<rate>", "<amount>", "<date>", "<original amount ordered>" "<clientOrderId>"]
        //
        // order change
        // [ 'o', 899641758820, '0.00000000', 'c', null, '0.00001971' ]
        // [ 'o', 6083059, '1.50000000', 'f', '12345']
        //
        // ["o", <order number>, "<new amount>", "<order type>", "<clientOrderId>"]
        //
        // trade update
        //
        // ["t", 12345, "0.03000000", "0.50000000", "0.00250000", 0, 6083059, "0.00000375", "2018-09-08 05:54:09", "12345", "0.015"]
        //
        // ["t", <trade ID>, "<rate>", "<amount>", "<fee multiplier>", <funding type>, <order number>, <total fee>, <date>, "<clientOrderId>", "<trade total>"]
        //
        const subscription = this.safeValue (client.subscriptions, '1000', {});
        const fetchedBalance = this.safeValue (subscription, 'fetchedBalance', false);
        // to avoid synchronisation issues
        if (!fetchedBalance) {
            return;
        }
        const messageHash = 'balance';
        const messageType = this.safeString (message, 0);
        if (messageType === 'b') {
            const balanceType = this.safeString (message, 2);
            if (balanceType !== 'e') {
                // no support for poloniex futures atm
                return;
            }
            const numericId = this.safeString (message, 1);
            const currency = this.safeValue (this.options['currenciesByNumericId'], numericId);
            if (currency === undefined) {
                return;
            }
            const code = currency['code'];
            const changeAmount = this.safeFloat (message, 3);
            this.balance[code]['free'] = this.sum (this.balance[code]['free'], changeAmount);
            this.balance[code]['total'] = undefined;
            this.balance = this.parseBalance (this.balance);
        } else if ((messageType === 'o') || (messageType === 'p') || (messageType === 't') || (messageType === 'n')) {
            let symbol = undefined;
            let orderId = undefined;
            if ((messageType === 'o') || (messageType === 'p')) {
                orderId = this.safeString (message, 1);
                const orderType = this.safeString (message, 3);
                if ((messageType === 'o') && (orderType === 'f')) {
                    // we use the trades for the fills and the order events for the cancels
                    return;
                }
            } else if (messageType === 't') {
                orderId = this.safeString (message, 6);
            } else if (messageType === 'n') {
                orderId = this.safeString (message, 2);
            }
            const symbolsByOrderId = this.safeValue (this.options, 'symbolsByOrderId');
            symbol = this.safeString (symbolsByOrderId, orderId);
            if (!(symbol in this.markets)) {
                return;
            }
            const market = this.market (symbol);
            const previousOrders = this.safeValue (this.orders.hashmap, symbol, {});
            const previousOrder = this.safeValue (previousOrders, orderId);
            const quote = market['quote'];
            let changeAmount = undefined;
            if (messageType === 'n') {
                changeAmount = previousOrder['filled'];
            } else if (messageType === 'o') {
                changeAmount = this.safeFloat (message, 5);
            } else {
                changeAmount = previousOrder['amount'];
            }
            const quoteAmount = changeAmount * previousOrder['price'];
            const base = market['base'];
            const baseAmount = changeAmount;
            let orderAmount = undefined;
            let orderCode = undefined;
            if (previousOrder['side'] === 'buy') {
                orderAmount = quoteAmount;
                orderCode = quote;
            } else {
                orderAmount = baseAmount;
                orderCode = base;
            }
            const preciseAmount = this.amountToPrecision (symbol, orderAmount);
            const floatAmount = parseFloat (preciseAmount);
            if ((messageType === 'o') || (messageType === 't') || (messageType === 'n')) {
                this.balance[orderCode]['used'] = this.balance[orderCode]['used'] - floatAmount;
            } else {
                this.balance[orderCode]['used'] = this.sum (this.balance[orderCode]['used'], floatAmount);
            }
            this.balance[orderCode]['total'] = undefined;
            this.balance = this.parseBalance (this.balance);
        }
        client.resolve (this.balance, messageHash);
    }

    handleOrder (client, message) {
        //
        // pending
        // [ 'p', 6083059, 148, '48402.31639500', '0.00004133', '0', null ],
        // ["p", <order number>, <currency pair id>, "<rate>", "<amount>", "<order type>", "<clientOrderId>"]
        //
        // new order
        // ["n", 148, 6083059, 1, "0.03000000", "2.00000000", "2018-09-08 04:54:09", "2.00000000", "12345"]
        // ["n", <currency pair id>, <order number>, <order type>, "<rate>", "<amount>", "<date>", "<original amount ordered>" "<clientOrderId>"]
        //
        // order change
        // [ 'o', 899641758820, '0.00000000', 'c', null, '0.00001971' ]
        // [ 'o', 6083059, '1.50000000', 'f', '12345']
        // ["o", <order number>, "<new amount>", "c", "<clientOrderId>", "<canceledAmount>"]
        //
        // trade change
        // ["t", 12345, "0.03000000", "0.50000000", "0.00250000", 0, 6083059, "0.00000375", "2018-09-08 05:54:09", "12345", "0.015"]
        // ["t", <trade ID>, "<rate>", "<amount>", "<fee multiplier>", <funding type>, <order number>, <total fee>, <date>, "<clientOrderId>", "<trade total>"]
        //
        // in the case of an n update, as corresponding t update is not sent, the code accounts for this
        //
        let orders = this.orders;
        const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
        const symbolsByOrderId = this.safeValue (this.options, 'symbolsByOrderId', {});
        if (orders === undefined) {
            orders = new ArrayCacheBySymbolById (limit);
            this.orders = orders;
        }
        const length = orders.length;
        const type = this.safeString (message, 0);
        let symbol = undefined;
        if (type === 'p') {
            const orderId = this.safeString (message, 1);
            const numericId = this.safeString (message, 2);
            const market = this.safeValue (this.options['marketsByNumericId'], numericId);
            if (market === undefined) {
                return undefined;
            }
            symbol = market['symbol'];
            symbolsByOrderId[orderId] = symbol;
            const price = this.safeFloat (message, 3);
            const amount = this.safeFloat (message, 4);
            const orderType = this.safeInteger (message, 5);
            const side = orderType ? 'buy' : 'sell';
            const clientOrderId = this.safeString (message, 6);
            if (length === limit) {
                const first = orders[0];
                if (first['id'] in symbolsByOrderId) {
                    delete symbolsByOrderId[first['id']];
                }
            }
            orders.append ({
                'info': message,
                'symbol': symbol,
                'id': orderId,
                'clientOrderId': clientOrderId,
                'timestamp': undefined,
                'datetime': undefined,
                'lastTradeTimestamp': undefined,
                'type': 'limit',
                'timeInForce': undefined,
                'postOnly': undefined,
                'side': side,
                'price': price,
                'stopPrice': undefined,
                'amount': amount,
                'cost': undefined,
                'average': undefined,
                'filled': undefined,
                'remaining': amount,
                'status': 'open',
                'fee': undefined,
                'trades': undefined,
            });
        } else if (type === 'n') {
            const numericId = this.safeString (message, 1);
            const market = this.safeValue (this.options['marketsByNumericId'], numericId);
            if (market === undefined) {
                return undefined;
            }
            symbol = market['symbol'];
            const orderId = this.safeString (message, 2);
            const orderType = this.safeInteger (message, 3);
            const side = orderType ? 'buy' : 'sell';
            const price = this.safeFloat (message, 4);
            const remaining = this.safeFloat (message, 5);
            const date = this.safeString (message, 6);
            const timestamp = this.parse8601 (date);
            const amount = this.safeFloat (message, 7);
            const clientOrderId = this.safeString (message, 8);
            let filled = undefined;
            let cost = undefined;
            if ((amount !== undefined) && (remaining !== undefined)) {
                filled = amount - remaining;
                cost = filled * price;
            }
            if (length === limit) {
                const first = orders[0];
                if (first['id'] in symbolsByOrderId) {
                    delete symbolsByOrderId[first['id']];
                }
            }
            orders.append ({
                'info': message,
                'symbol': symbol,
                'id': orderId,
                'clientOrderId': clientOrderId,
                'timestamp': timestamp,
                'datetime': this.iso8601 (timestamp),
                'lastTradeTimestamp': undefined,
                'type': 'limit',
                'timeInForce': undefined,
                'postOnly': undefined,
                'side': side,
                'price': price,
                'stopPrice': undefined,
                'amount': amount,
                'cost': cost,
                'average': undefined,
                'filled': filled,
                'remaining': remaining,
                'status': 'open',
                'fee': undefined,
                'trades': undefined,
            });
        } else if (type === 'o') {
            const orderId = this.safeString (message, 1);
            const orderType = this.safeString (message, 3);
            if ((orderType === 'c') || (orderType === 'k')) {
                const symbol = this.safeString (symbolsByOrderId, orderId);
                const previousOrders = this.safeValue (orders.hashmap, symbol, {});
                const previousOrder = this.safeValue (previousOrders, orderId);
                if (previousOrder !== undefined) {
                    previousOrder['status'] = 'canceled';
                }
            }
        } else if (type === 't') {
            const trade = this.parseWsTrade (message);
            const orderId = this.safeString (trade, 'order');
            const symbol = this.safeString (symbolsByOrderId, orderId);
            const previousOrders = this.safeValue (orders.hashmap, symbol, {});
            const previousOrder = this.safeValue (previousOrders, orderId);
            if (previousOrder['trades'] === undefined) {
                previousOrder['trades'] = [];
            }
            previousOrder['trades'].push (trade);
            let filled = previousOrder['filled'];
            if (filled === undefined) {
                filled = trade['amount'];
            } else {
                filled = previousOrder['filled'] + trade['amount'];
            }
            if (previousOrder['amount'] !== undefined) {
                previousOrder['remaining'] = Math.max (previousOrder['amount'] - filled, 0.0);
                if (previousOrder['remaining'] === 0.0) {
                    previousOrder['status'] = 'closed';
                }
            }
            previousOrder['filled'] = filled;
            previousOrder['cost'] = filled * previousOrder['price'];
            if (previousOrder['fee'] === undefined) {
                previousOrder['fee'] = {
                    'currency': trade['fee']['currency'],
                    'cost': trade['fee']['cost'],
                };
            } else {
                previousOrder['fee']['cost'] = this.sum (previousOrder['fee']['cost'], trade['fee']['cost']);
            }
        }
        const messageHash = 'orders';
        client.resolve (orders, messageHash);
        const symbolSpecificMessageHash = messageHash + ':' + symbol;
        client.resolve (orders, symbolSpecificMessageHash);
    }

    handleMyTrade (client, message) {
        //
        // ["t", 12345, "0.03000000", "0.50000000", "0.00250000", 0, 6083059, "0.00000375", "2018-09-08 05:54:09", "12345", "0.015"]
        // ["t", <trade ID>, "<rate>", "<amount>", "<fee multiplier>", <funding type>, <order number>, <total fee>, <date>, "<clientOrderId>", "<trade total>"]
        //
        // in the case of an n update, as corresponding t update is not sent, the code accounts for this
        // so it is possible to miss myTrade updates
        //
        let trades = this.myTrades;
        if (trades === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            trades = new ArrayCacheBySymbolById (limit);
        }
        let orders = this.orders;
        if (orders === undefined) {
            const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
            orders = new ArrayCacheBySymbolById (limit);
            this.orders = orders;
        }
        const parsed = this.parseWsTrade (message);
        trades.append (parsed);
        const messageHash = 'myTrades';
        client.resolve (trades, messageHash);
        const symbolSpecificMessageHash = messageHash + ':' + parsed['symbol'];
        client.resolve (trades, symbolSpecificMessageHash);
    }

    parseWsTrade (trade) {
        const orders = this.orders;
        const tradeId = this.safeString (trade, 1);
        const price = this.safeFloat (trade, 2);
        const amount = this.safeFloat (trade, 3);
        const feeRate = this.safeFloat (trade, 4);
        const order = this.safeString (trade, 6);
        const feeCost = this.safeFloat (trade, 7);
        const date = this.safeString (trade, 8);
        const cost = this.safeFloat (trade, 10);
        const timestamp = this.parse8601 (date);
        const symbolsByOrderId = this.safeValue (this.options, 'symbolsByOrderId', {});
        const symbol = this.safeString (symbolsByOrderId, order);
        const previousOrders = this.safeValue (orders.hashmap, symbol, {});
        const previousOrder = this.safeValue (previousOrders, order);
        const market = this.market (symbol);
        const side = this.safeString (previousOrder, 'side');
        let feeCurrency = undefined;
        if (side === 'buy') {
            feeCurrency = market['base'];
        } else {
            feeCurrency = market['quote'];
        }
        const fee = {
            'cost': feeCost,
            'rate': feeRate,
            'currency': feeCurrency,
        };
        return {
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': tradeId,
            'order': order,
            'type': 'limit',
            'takerOrMaker': undefined,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
        };
    }

    handleMessage (client, message) {
        const channelId = this.safeString (message, 0);
        const methods = {
            // '<numericId>': 'handleOrderBookAndTrades', // Price Aggregated Book
            '1000': this.handleAccountNotifications, // Beta
            '1002': this.handleTickers, // Ticker Data
            // '1003': undefined, // 24 Hour Exchange Volume
            '1010': this.handleHeartbeat,
        };
        const method = this.safeValue (methods, channelId);
        if (method === undefined) {
            const market = this.safeValue (this.options['marketsByNumericId'], channelId);
            if (market === undefined) {
                return message;
            } else {
                return this.handleOrderBookAndTrades (client, message);
            }
        } else {
            method.call (this, client, message);
        }
    }
};
