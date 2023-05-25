'use strict';

var bitfinex2$1 = require('../bitfinex2.js');
var Precise = require('../base/Precise.js');
var errors = require('../base/errors.js');
var Cache = require('../base/ws/Cache.js');
var sha512 = require('../static_dependencies/noble-hashes/sha512.js');

//  ---------------------------------------------------------------------------
//  ---------------------------------------------------------------------------
class bitfinex2 extends bitfinex2$1 {
    describe() {
        return this.deepExtend(super.describe(), {
            'has': {
                'ws': true,
                'watchTicker': true,
                'watchTickers': false,
                'watchOrderBook': true,
                'watchTrades': true,
                'watchMyTrades': true,
                'watchBalance': true,
                'watchOHLCV': true,
                'watchOrders': true,
            },
            'urls': {
                'api': {
                    'ws': {
                        'public': 'wss://api-pub.bitfinex.com/ws/2',
                        'private': 'wss://api.bitfinex.com/ws/2',
                    },
                },
            },
            'options': {
                'watchOrderBook': {
                    'prec': 'P0',
                    'freq': 'F0',
                },
                'ordersLimit': 1000,
                'checksum': true,
            },
        });
    }
    async subscribe(channel, symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const marketId = market['id'];
        const url = this.urls['api']['ws']['public'];
        const client = this.client(url);
        const messageHash = channel + ':' + marketId;
        const request = {
            'event': 'subscribe',
            'channel': channel,
            'symbol': marketId,
        };
        const result = await this.watch(url, messageHash, this.deepExtend(request, params), messageHash, { 'checksum': false });
        const checksum = this.safeValue(this.options, 'checksum', true);
        if (checksum && !client.subscriptions[messageHash]['checksum'] && (channel === 'book')) {
            client.subscriptions[messageHash]['checksum'] = true;
            await client.send({
                'event': 'conf',
                'flags': 131072,
            });
        }
        return result;
    }
    async subscribePrivate(messageHash) {
        await this.loadMarkets();
        await this.authenticate();
        const url = this.urls['api']['ws']['private'];
        return await this.watch(url, messageHash, undefined, 1);
    }
    async watchOHLCV(symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name biftfinex2#watchOHLCV
         * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
         * @param {int|undefined} limit the maximum amount of candles to fetch
         * @param {object} params extra parameters specific to the biftfinex2 api endpoint
         * @returns {[[int]]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        symbol = market['symbol'];
        const interval = this.safeString(this.timeframes, timeframe, timeframe);
        const channel = 'candles';
        const key = 'trade:' + interval + ':' + market['id'];
        const messageHash = channel + ':' + interval + ':' + market['id'];
        const request = {
            'event': 'subscribe',
            'channel': channel,
            'key': key,
        };
        const url = this.urls['api']['ws']['public'];
        // not using subscribe here because this message has a different format
        const ohlcv = await this.watch(url, messageHash, this.deepExtend(request, params), messageHash);
        if (this.newUpdates) {
            limit = ohlcv.getLimit(symbol, limit);
        }
        return this.filterBySinceLimit(ohlcv, since, limit, 0);
    }
    handleOHLCV(client, message, subscription) {
        //
        // initial snapshot
        //   [
        //       341527, // channel id
        //       [
        //          [
        //             1654705860000, // timestamp
        //             1802.6, // open
        //             1800.3, // close
        //             1802.8, // high
        //             1800.3, // low
        //             86.49588236 // volume
        //          ],
        //          [
        //             1654705800000,
        //             1803.6,
        //             1802.6,
        //             1804.9,
        //             1802.3,
        //             74.6348086
        //          ],
        //          [
        //             1654705740000,
        //             1802.5,
        //             1803.2,
        //             1804.4,
        //             1802.4,
        //             23.61801085
        //          ]
        //       ]
        //   ]
        //
        // update
        //   [
        //       211171,
        //       [
        //          1654705680000,
        //          1801,
        //          1802.4,
        //          1802.9,
        //          1800.4,
        //          23.91911091
        //       ]
        //   ]
        //
        const data = this.safeValue(message, 1, []);
        let ohlcvs = undefined;
        const first = this.safeValue(data, 0);
        if (Array.isArray(first)) {
            // snapshot
            ohlcvs = data;
        }
        else {
            // update
            ohlcvs = [data];
        }
        const channel = this.safeValue(subscription, 'channel');
        const key = this.safeString(subscription, 'key');
        const keyParts = key.split(':');
        const interval = this.safeString(keyParts, 1);
        let marketId = key;
        marketId = marketId.replace('trade:', '');
        marketId = marketId.replace(interval + ':', '');
        const market = this.safeMarket(marketId);
        const timeframe = this.findTimeframe(interval);
        const symbol = market['symbol'];
        const messageHash = channel + ':' + interval + ':' + marketId;
        this.ohlcvs[symbol] = this.safeValue(this.ohlcvs, symbol, {});
        let stored = this.safeValue(this.ohlcvs[symbol], timeframe);
        if (stored === undefined) {
            const limit = this.safeInteger(this.options, 'OHLCVLimit', 1000);
            stored = new Cache.ArrayCacheByTimestamp(limit);
            this.ohlcvs[symbol][timeframe] = stored;
        }
        const ohlcvsLength = ohlcvs.length;
        for (let i = 0; i < ohlcvsLength; i++) {
            const ohlcv = ohlcvs[ohlcvsLength - i - 1];
            const parsed = this.parseOHLCV(ohlcv, market);
            stored.append(parsed);
        }
        client.resolve(stored, messageHash);
    }
    async watchTrades(symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitfinex2#watchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the bitfinex2 api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        const trades = await this.subscribe('trades', symbol, params);
        if (this.newUpdates) {
            limit = trades.getLimit(symbol, limit);
        }
        return this.filterBySinceLimit(trades, since, limit, 'timestamp');
    }
    async watchMyTrades(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitfinex2#watchMyTrades
         * @description watches information on multiple trades made by the user
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the bitfinex2 api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure
         */
        await this.loadMarkets();
        let messageHash = 'myTrade';
        if (symbol !== undefined) {
            const market = this.market(symbol);
            messageHash += ':' + market['id'];
        }
        const trades = await this.subscribePrivate(messageHash);
        if (this.newUpdates) {
            limit = trades.getLimit(symbol, limit);
        }
        return this.filterBySymbolSinceLimit(trades, symbol, since, limit);
    }
    async watchTicker(symbol, params = {}) {
        /**
         * @method
         * @name bitfinex2#watchTicker
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the bitfinex2 api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        return await this.subscribe('ticker', symbol, params);
    }
    handleMyTrade(client, message, subscription = {}) {
        //
        // trade execution
        // [
        //     0,
        //     "te", // or tu
        //     [
        //        1133411090,
        //        "tLTCUST",
        //        1655110144598,
        //        97084883506,
        //        0.1,
        //        42.821,
        //        "EXCHANGE MARKET",
        //        42.799,
        //        -1,
        //        null,
        //        null,
        //        1655110144596
        //     ]
        // ]
        //
        const name = 'myTrade';
        const data = this.safeValue(message, 2);
        const trade = this.parseWsTrade(data, false);
        const symbol = trade['symbol'];
        const market = this.market(symbol);
        const messageHash = name + ':' + market['id'];
        if (this.myTrades === undefined) {
            const limit = this.safeInteger(this.options, 'tradesLimit', 1000);
            this.myTrades = new Cache.ArrayCacheBySymbolById(limit);
        }
        const array = this.myTrades;
        array.append(trade);
        this.myTrades = array;
        // generic subscription
        client.resolve(array, name);
        // specific subscription
        client.resolve(array, messageHash);
    }
    handleTrades(client, message, subscription) {
        //
        // initial snapshot
        //
        //    [
        //        188687, // channel id
        //        [
        //          [ 1128060675, 1654701572690, 0.00217533, 1815.3 ], // id, mts, amount, price
        //          [ 1128060665, 1654701551231, -0.00280472, 1814.1 ],
        //          [ 1128060664, 1654701550996, -0.00364444, 1814.1 ],
        //          [ 1128060656, 1654701527730, -0.00265203, 1814.2 ],
        //          [ 1128060647, 1654701505193, 0.00262395, 1815.2 ],
        //          [ 1128060642, 1654701484656, -0.13411443, 1816 ],
        //          [ 1128060641, 1654701484656, -0.00088557, 1816 ],
        //          [ 1128060639, 1654701478326, -0.002, 1816 ],
        //        ]
        //    ]
        // update
        //
        //    [
        //        360141,
        //        'te',
        //        [
        //            1128060969, // id
        //            1654702500098, // mts
        //            0.00325131, // amount positive buy, negative sell
        //            1818.5, // price
        //        ],
        //    ]
        //
        //
        const channel = this.safeValue(subscription, 'channel');
        const marketId = this.safeString(subscription, 'symbol');
        const market = this.safeMarket(marketId);
        const messageHash = channel + ':' + marketId;
        const tradesLimit = this.safeInteger(this.options, 'tradesLimit', 1000);
        const symbol = market['symbol'];
        let stored = this.safeValue(this.trades, symbol);
        if (stored === undefined) {
            stored = new Cache.ArrayCache(tradesLimit);
            this.trades[symbol] = stored;
        }
        const isPublicTrade = true;
        const messageLength = message.length;
        if (messageLength === 2) {
            // initial snapshot
            const trades = this.safeValue(message, 1, []);
            for (let i = 0; i < trades.length; i++) {
                const parsed = this.parseWsTrade(trades[i], isPublicTrade, market);
                stored.append(parsed);
            }
        }
        else {
            // update
            const type = this.safeString(message, 1);
            if (type === 'tu') {
                // don't resolve for a duplicate update
                // since te and tu updates are duplicated on the public stream
                return;
            }
            const trade = this.safeValue(message, 2, []);
            const parsed = this.parseWsTrade(trade, isPublicTrade, market);
            stored.append(parsed);
        }
        client.resolve(stored, messageHash);
        return message;
    }
    parseWsTrade(trade, isPublic = false, market = undefined) {
        //
        //    [
        //        1128060969, // id
        //        1654702500098, // mts
        //        0.00325131, // amount positive buy, negative sell
        //        1818.5, // price
        //    ]
        //
        // trade execution
        //
        //    [
        //        1133411090, // id
        //        "tLTCUST", // symbol
        //        1655110144598, // create ms
        //        97084883506, // order id
        //        0.1, // amount
        //        42.821, // price
        //        "EXCHANGE MARKET", // order type
        //        42.799, // order price
        //        -1, // maker
        //        null, // fee
        //        null, // fee currency
        //        1655110144596 // cid
        //    ]
        //
        // trade update
        //
        //    [
        //       1133411090,
        //       "tLTCUST",
        //       1655110144598,
        //       97084883506,
        //       0.1,
        //       42.821,
        //       "EXCHANGE MARKET",
        //       42.799,
        //       -1,
        //       -0.0002,
        //       "LTC",
        //       1655110144596
        //    ]
        //
        let marketId = (!isPublic) ? this.safeString(trade, 1) : undefined;
        market = this.safeMarket(marketId, market);
        const createdKey = isPublic ? 1 : 2;
        const priceKey = isPublic ? 3 : 5;
        const amountKey = isPublic ? 2 : 4;
        marketId = market['id'];
        let type = this.safeString(trade, 6);
        if (type !== undefined) {
            if (type.indexOf('LIMIT') > -1) {
                type = 'limit';
            }
            else if (type.indexOf('MARKET') > -1) {
                type = 'market';
            }
        }
        const orderId = (!isPublic) ? this.safeString(trade, 3) : undefined;
        const id = this.safeString(trade, 0);
        const timestamp = this.safeInteger(trade, createdKey);
        const price = this.safeString(trade, priceKey);
        const amountString = this.safeString(trade, amountKey);
        const amount = this.parseNumber(Precise["default"].stringAbs(amountString));
        let side = undefined;
        if (amount !== undefined) {
            side = Precise["default"].stringGt(amountString, '0') ? 'buy' : 'sell';
        }
        const symbol = this.safeSymbol(marketId, market);
        const feeValue = this.safeString(trade, 9);
        let fee = undefined;
        if (feeValue !== undefined) {
            const currencyId = this.safeString(trade, 10);
            const code = this.safeCurrencyCode(currencyId);
            fee = {
                'cost': feeValue,
                'currency': code,
            };
        }
        const maker = this.safeInteger(trade, 8);
        let takerOrMaker = undefined;
        if (maker !== undefined) {
            takerOrMaker = (maker === -1) ? 'taker' : 'maker';
        }
        return this.safeTrade({
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'symbol': symbol,
            'id': id,
            'order': orderId,
            'type': type,
            'takerOrMaker': takerOrMaker,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'fee': fee,
        }, market);
    }
    handleTicker(client, message, subscription) {
        //
        // [
        //    340432, // channel ID
        //     [
        //         236.62,        // 1 BID float Price of last highest bid
        //         9.0029,        // 2 BID_SIZE float Size of the last highest bid
        //         236.88,        // 3 ASK float Price of last lowest ask
        //         7.1138,        // 4 ASK_SIZE float Size of the last lowest ask
        //         -1.02,         // 5 DAILY_CHANGE float Amount that the last price has changed since yesterday
        //         0,             // 6 DAILY_CHANGE_PERC float Amount that the price has changed expressed in percentage terms
        //         236.52,        // 7 LAST_PRICE float Price of the last trade.
        //         5191.36754297, // 8 VOLUME float Daily volume
        //         250.01,        // 9 HIGH float Daily high
        //         220.05,        // 10 LOW float Daily low
        //     ]
        //  ]
        //
        const ticker = this.safeValue(message, 1);
        const marketId = this.safeString(subscription, 'symbol');
        const market = this.safeMarket(marketId);
        const symbol = this.safeSymbol(marketId);
        const parsed = this.parseWsTicker(ticker, market);
        const channel = 'ticker';
        const messageHash = channel + ':' + marketId;
        this.tickers[symbol] = parsed;
        client.resolve(parsed, messageHash);
    }
    parseWsTicker(ticker, market = undefined) {
        //
        //     [
        //         236.62,        // 1 BID float Price of last highest bid
        //         9.0029,        // 2 BID_SIZE float Size of the last highest bid
        //         236.88,        // 3 ASK float Price of last lowest ask
        //         7.1138,        // 4 ASK_SIZE float Size of the last lowest ask
        //         -1.02,         // 5 DAILY_CHANGE float Amount that the last price has changed since yesterday
        //         0,             // 6 DAILY_CHANGE_PERC float Amount that the price has changed expressed in percentage terms
        //         236.52,        // 7 LAST_PRICE float Price of the last trade.
        //         5191.36754297, // 8 VOLUME float Daily volume
        //         250.01,        // 9 HIGH float Daily high
        //         220.05,        // 10 LOW float Daily low
        //     ]
        //
        market = this.safeMarket(undefined, market);
        const symbol = market['symbol'];
        const last = this.safeString(ticker, 6);
        const change = this.safeString(ticker, 4);
        return this.safeTicker({
            'symbol': symbol,
            'timestamp': undefined,
            'datetime': undefined,
            'high': this.safeString(ticker, 8),
            'low': this.safeString(ticker, 9),
            'bid': this.safeString(ticker, 0),
            'bidVolume': this.safeString(ticker, 1),
            'ask': this.safeString(ticker, 2),
            'askVolume': this.safeString(ticker, 3),
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': change,
            'percentage': this.safeString(ticker, 5),
            'average': undefined,
            'baseVolume': this.safeString(ticker, 7),
            'quoteVolume': undefined,
            'info': ticker,
        }, market);
    }
    async watchOrderBook(symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitfinex2#watchOrderBook
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the bitfinex2 api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        if (limit !== undefined) {
            if ((limit !== 25) && (limit !== 100)) {
                throw new errors.ExchangeError(this.id + ' watchOrderBook limit argument must be undefined, 25 or 100');
            }
        }
        const options = this.safeValue(this.options, 'watchOrderBook', {});
        const prec = this.safeString(options, 'prec', 'P0');
        const freq = this.safeString(options, 'freq', 'F0');
        const request = {
            'prec': prec,
            'freq': freq, // string, frequency of updates 'F0' = realtime, 'F1' = 2 seconds, default is 'F0'
        };
        if (limit !== undefined) {
            request['len'] = limit; // string, number of price points, '25', '100', default = '25'
        }
        const orderbook = await this.subscribe('book', symbol, this.deepExtend(request, params));
        return orderbook.limit();
    }
    handleOrderBook(client, message, subscription) {
        //
        // first message (snapshot)
        //
        //     [
        //         18691, // channel id
        //         [
        //             [ 7364.8, 10, 4.354802 ], // price, count, size > 0 = bid
        //             [ 7364.7, 1, 0.00288831 ],
        //             [ 7364.3, 12, 0.048 ],
        //             [ 7364.9, 3, -0.42028976 ], // price, count, size < 0 = ask
        //             [ 7365, 1, -0.25 ],
        //             [ 7365.5, 1, -0.00371937 ],
        //         ]
        //     ]
        //
        // subsequent updates
        //
        //     [
        //         358169, // channel id
        //         [
        //            1807.1, // price
        //            0, // cound
        //            1 // size
        //         ]
        //     ]
        //
        const marketId = this.safeString(subscription, 'symbol');
        const symbol = this.safeSymbol(marketId);
        const channel = 'book';
        const messageHash = channel + ':' + marketId;
        const prec = this.safeString(subscription, 'prec', 'P0');
        const isRaw = (prec === 'R0');
        const id = this.safeString(message, 0);
        // if it is an initial snapshot
        let orderbook = this.safeValue(this.orderbooks, symbol);
        if (orderbook === undefined) {
            const limit = this.safeInteger(subscription, 'len');
            if (isRaw) {
                // raw order books
                this.orderbooks[symbol] = this.indexedOrderBook({}, limit);
            }
            else {
                // P0, P1, P2, P3, P4
                this.orderbooks[symbol] = this.countedOrderBook({}, limit);
            }
            orderbook = this.orderbooks[symbol];
            if (isRaw) {
                const deltas = message[1];
                for (let i = 0; i < deltas.length; i++) {
                    const delta = deltas[i];
                    const size = (delta[2] < 0) ? -delta[2] : delta[2];
                    const side = (delta[2] < 0) ? 'asks' : 'bids';
                    const bookside = orderbook[side];
                    const id = this.safeString(delta, 0);
                    const price = this.safeFloat(delta, 1);
                    bookside.store(price, size, id);
                }
            }
            else {
                const deltas = message[1];
                for (let i = 0; i < deltas.length; i++) {
                    const delta = deltas[i];
                    const amount = this.safeNumber(delta, 2);
                    const counter = this.safeNumber(delta, 1);
                    const price = this.safeNumber(delta, 0);
                    const size = (amount < 0) ? -amount : amount;
                    const side = (amount < 0) ? 'asks' : 'bids';
                    const bookside = orderbook[side];
                    bookside.store(price, size, counter);
                }
            }
            client.resolve(orderbook, messageHash);
        }
        else {
            const deltas = message[1];
            const orderbook = this.orderbooks[symbol];
            if (isRaw) {
                const price = this.safeFloat(deltas, 1);
                const size = (deltas[2] < 0) ? -deltas[2] : deltas[2];
                const side = (deltas[2] < 0) ? 'asks' : 'bids';
                const bookside = orderbook[side];
                // price = 0 means that you have to remove the order from your book
                const amount = (price > 0) ? size : 0;
                bookside.store(price, amount, id);
            }
            else {
                const amount = this.safeNumber(deltas, 2);
                const counter = this.safeNumber(deltas, 1);
                const price = this.safeNumber(deltas, 0);
                const size = (amount < 0) ? -amount : amount;
                const side = (amount < 0) ? 'asks' : 'bids';
                const bookside = orderbook[side];
                bookside.store(price, size, counter);
            }
            client.resolve(orderbook, messageHash);
        }
    }
    handleChecksum(client, message, subscription) {
        //
        // [ 173904, 'cs', -890884919 ]
        //
        const marketId = this.safeString(subscription, 'symbol');
        const symbol = this.safeSymbol(marketId);
        const channel = 'book';
        const messageHash = channel + ':' + marketId;
        const book = this.safeValue(this.orderbooks, symbol);
        if (book === undefined) {
            return;
        }
        const depth = 25; // covers the first 25 bids and asks
        const stringArray = [];
        const bids = book['bids'];
        const asks = book['asks'];
        // pepperoni pizza from bitfinex
        for (let i = 0; i < depth; i++) {
            const bid = this.safeValue(bids, i);
            const ask = this.safeValue(asks, i);
            if (bid !== undefined) {
                stringArray.push(this.numberToString(bids[i][0]));
                stringArray.push(this.numberToString(bids[i][1]));
            }
            if (ask !== undefined) {
                stringArray.push(this.numberToString(asks[i][0]));
                stringArray.push(this.numberToString(-asks[i][1]));
            }
        }
        const payload = stringArray.join(':');
        const localChecksum = this.crc32(payload, true);
        const responseChecksum = this.safeInteger(message, 2);
        if (responseChecksum !== localChecksum) {
            const error = new errors.InvalidNonce(this.id + ' invalid checksum');
            client.reject(error, messageHash);
        }
    }
    async watchBalance(params = {}) {
        /**
         * @method
         * @name bitfinex2#watchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} params extra parameters specific to the bitfinex2 api endpoint
         * @param {str|undefined} params.type spot or contract if not provided this.options['defaultType'] is used
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.loadMarkets();
        const balanceType = this.safeString(params, 'wallet', 'exchange'); // exchange, margin
        params = this.omit(params, 'wallet');
        const messageHash = 'balance:' + balanceType;
        return await this.subscribePrivate(messageHash);
    }
    handleBalance(client, message, subscription) {
        //
        // snapshot (exchange + margin together)
        //   [
        //       0,
        //       'ws',
        //       [
        //           [
        //               'exchange',
        //               'LTC',
        //               0.05479727,
        //               0,
        //               null,
        //               'Trading fees for 0.05 LTC (LTCUST) @ 51.872 on BFX (0.2%)',
        //               null,
        //           ]
        //           [
        //               'margin',
        //               'USTF0',
        //               11.960650700086292,
        //               0,
        //               null,
        //               'Trading fees for 0.1 LTCF0 (LTCF0:USTF0) @ 51.844 on BFX (0.065%)',
        //               null,
        //           ],
        //       ],
        //   ]
        //
        // spot
        //   [
        //       0,
        //       'wu',
        //       [
        //         'exchange',
        //         'LTC', // currency
        //         0.06729727, // wallet balance
        //         0, // unsettled balance
        //         0.06729727, // available balance might be null
        //         'Exchange 0.4 LTC for UST @ 65.075',
        //         {
        //           reason: 'TRADE',
        //           order_id: 96596397973,
        //           order_id_oppo: 96596632735,
        //           trade_price: '65.075',
        //           trade_amount: '-0.4',
        //           order_cid: 1654636218766,
        //           order_gid: null
        //         }
        //       ]
        //   ]
        //
        // margin
        //
        //   [
        //       'margin',
        //       'USTF0',
        //       11.960650700086292, // total
        //       0,
        //       6.776250700086292, // available
        //       'Trading fees for 0.1 LTCF0 (LTCF0:USTF0) @ 51.844 on BFX (0.065%)',
        //       null
        //   ]
        //
        const updateType = this.safeValue(message, 1);
        let data = undefined;
        if (updateType === 'ws') {
            data = this.safeValue(message, 2);
        }
        else {
            data = [this.safeValue(message, 2)];
        }
        const updatedTypes = {};
        for (let i = 0; i < data.length; i++) {
            const rawBalance = data[i];
            const currencyId = this.safeString(rawBalance, 1);
            const code = this.safeCurrencyCode(currencyId);
            const balance = this.parseWsBalance(rawBalance);
            const balanceType = this.safeString(rawBalance, 0);
            const oldBalance = this.safeValue(this.balance, balanceType, {});
            oldBalance[code] = balance;
            oldBalance['info'] = message;
            this.balance[balanceType] = this.safeBalance(oldBalance);
            updatedTypes[balanceType] = true;
        }
        const updatesKeys = Object.keys(updatedTypes);
        for (let i = 0; i < updatesKeys.length; i++) {
            const type = updatesKeys[i];
            const messageHash = 'balance:' + type;
            client.resolve(this.balance[type], messageHash);
        }
    }
    parseWsBalance(balance) {
        //
        //     [
        //         'exchange',
        //         'LTC',
        //         0.05479727, // balance
        //         0,
        //         null, // available null if not calculated yet
        //         'Trading fees for 0.05 LTC (LTCUST) @ 51.872 on BFX (0.2%)',
        //         null,
        //     ]
        //
        const totalBalance = this.safeString(balance, 2);
        const availableBalance = this.safeString(balance, 4);
        const account = this.account();
        if (availableBalance !== undefined) {
            account['free'] = availableBalance;
        }
        account['total'] = totalBalance;
        return account;
    }
    handleSystemStatus(client, message) {
        //
        //     {
        //         event: 'info',
        //         version: 2,
        //         serverId: 'e293377e-7bb7-427e-b28c-5db045b2c1d1',
        //         platform: { status: 1 }, // 1 for operative, 0 for maintenance
        //     }
        //
        return message;
    }
    handleSubscriptionStatus(client, message) {
        //
        //     {
        //         event: 'subscribed',
        //         channel: 'book',
        //         chanId: 67473,
        //         symbol: 'tBTCUSD',
        //         prec: 'P0',
        //         freq: 'F0',
        //         len: '25',
        //         pair: 'BTCUSD'
        //     }
        //
        const channelId = this.safeString(message, 'chanId');
        client.subscriptions[channelId] = message;
        return message;
    }
    authenticate(params = {}) {
        const url = this.urls['api']['ws']['private'];
        const client = this.client(url);
        const messageHash = 'authenticated';
        let future = this.safeValue(client.subscriptions, messageHash);
        if (future === undefined) {
            const nonce = this.milliseconds();
            const payload = 'AUTH' + nonce.toString();
            const signature = this.hmac(this.encode(payload), this.encode(this.secret), sha512.sha384, 'hex');
            const event = 'auth';
            const request = {
                'apiKey': this.apiKey,
                'authSig': signature,
                'authNonce': nonce,
                'authPayload': payload,
                'event': event,
            };
            const message = this.extend(request, params);
            future = this.watch(url, messageHash, message);
            client.subscriptions[messageHash] = future;
        }
        return future;
    }
    handleAuthenticationMessage(client, message) {
        const messageHash = 'authenticated';
        const status = this.safeString(message, 'status');
        if (status === 'OK') {
            // we resolve the future here permanently so authentication only happens once
            client.resolve(message, messageHash);
        }
        else {
            const error = new errors.AuthenticationError(this.json(message));
            client.reject(error, messageHash);
            // allows further authentication attempts
            if (messageHash in client.subscriptions) {
                delete client.subscriptions[messageHash];
            }
        }
    }
    async watchOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitfinex2#watchOrders
         * @description watches information on multiple orders made by the user
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the bitfinex2 api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure
         */
        await this.loadMarkets();
        let messageHash = 'orders';
        if (symbol !== undefined) {
            const market = this.market(symbol);
            messageHash += ':' + market['id'];
        }
        const orders = await this.subscribePrivate(messageHash);
        if (this.newUpdates) {
            limit = orders.getLimit(symbol, limit);
        }
        return this.filterBySymbolSinceLimit(orders, symbol, since, limit);
    }
    handleOrders(client, message, subscription) {
        //
        // limit order
        //    [
        //        0,
        //        "on", // ou or oc
        //        [
        //           96923856256, // order id
        //           null, // gid
        //           1655029337026, // cid
        //           "tLTCUST", // symbol
        //           1655029337027, // created timestamp
        //           1655029337029, // updated timestamp
        //           0.1, // amount
        //           0.1, // amount_orig
        //           "EXCHANGE LIMIT", // order type
        //           null, // type_prev
        //           null, // mts_tif
        //           null, // placeholder
        //           0, // flags
        //           "ACTIVE", // status
        //           null,
        //           null,
        //           30, // price
        //           0, // price average
        //           0, // price_trailling
        //           0, // price_aux_limit
        //           null,
        //           null,
        //           null,
        //           0, // notify
        //           0,
        //           null,
        //           null,
        //           null,
        //           "BFX",
        //           null,
        //           null,
        //        ]
        //    ]
        //
        const data = this.safeValue(message, 2, []);
        const messageType = this.safeString(message, 1);
        if (this.orders === undefined) {
            const limit = this.safeInteger(this.options, 'ordersLimit', 1000);
            this.orders = new Cache.ArrayCacheBySymbolById(limit);
        }
        const orders = this.orders;
        const symbolIds = {};
        if (messageType === 'os') {
            const snapshotLength = data.length;
            if (snapshotLength === 0) {
                return;
            }
            for (let i = 0; i < data.length; i++) {
                const value = data[i];
                const parsed = this.parseWsOrder(value);
                const symbol = parsed['symbol'];
                symbolIds[symbol] = true;
                orders.append(parsed);
            }
        }
        else {
            const parsed = this.parseWsOrder(data);
            orders.append(parsed);
            const symbol = parsed['symbol'];
            symbolIds[symbol] = true;
        }
        const name = 'orders';
        client.resolve(this.orders, name);
        const keys = Object.keys(symbolIds);
        for (let i = 0; i < keys.length; i++) {
            const symbol = keys[i];
            const market = this.market(symbol);
            const messageHash = name + ':' + market['id'];
            client.resolve(this.orders, messageHash);
        }
    }
    parseWsOrderStatus(status) {
        const statuses = {
            'ACTIVE': 'open',
            'CANCELED': 'canceled',
            'EXECUTED': 'closed',
            'PARTIALLY FILLED': 'open',
        };
        return this.safeString(statuses, status, status);
    }
    parseWsOrder(order, market = undefined) {
        //
        //   [
        //       97084883506, // order id
        //       null,
        //       1655110144596, // clientOrderId
        //       'tLTCUST', // symbol
        //       1655110144596, // created timestamp
        //       1655110144598, // updated timestamp
        //       0, // amount
        //       0.1, // amount_orig negative if sell order
        //       'EXCHANGE MARKET', // type
        //       null,
        //       null,
        //       null,
        //       0,
        //       'EXECUTED @ 42.821(0.1)', // status
        //       null,
        //       null,
        //       42.799, // price
        //       42.821, // price average
        //       0, // price trailling
        //       0, // price_aux_limit
        //       null,
        //       null,
        //       null,
        //       0,
        //       0,
        //       null,
        //       null,
        //       null,
        //       'BFX',
        //       null,
        //       null,
        //       {}
        //   ]
        //
        const id = this.safeString(order, 0);
        const clientOrderId = this.safeString(order, 1);
        const marketId = this.safeString(order, 3);
        const symbol = this.safeSymbol(marketId);
        market = this.safeMarket(marketId);
        let amount = this.safeNumber(order, 7);
        let side = 'buy';
        if (amount < 0) {
            amount = Math.abs(amount);
            side = 'sell';
        }
        const remaining = Precise["default"].stringAbs(this.safeString(order, 6));
        let type = this.safeString(order, 8);
        if (type.indexOf('LIMIT') > -1) {
            type = 'limit';
        }
        else if (type.indexOf('MARKET') > -1) {
            type = 'market';
        }
        const rawState = this.safeString(order, 13);
        const stateParts = rawState.split(' ');
        const trimmedStatus = this.safeString(stateParts, 0);
        const status = this.parseWsOrderStatus(trimmedStatus);
        const price = this.safeString(order, 16);
        const timestamp = this.safeInteger2(order, 5, 4);
        const average = this.safeString(order, 17);
        const stopPrice = this.omitZero(this.safeString(order, 18));
        return this.safeOrder({
            'info': order,
            'id': id,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'stopPrice': stopPrice,
            'triggerPrice': stopPrice,
            'average': average,
            'amount': amount,
            'remaining': remaining,
            'filled': undefined,
            'status': status,
            'fee': undefined,
            'cost': undefined,
            'trades': undefined,
        }, market);
    }
    handleMessage(client, message) {
        const channelId = this.safeString(message, 0);
        //
        //     [
        //         1231,
        //         'hb',
        //     ]
        //
        // auth message
        //    {
        //        event: 'auth',
        //        status: 'OK',
        //        chanId: 0,
        //        userId: 3159883,
        //        auth_id: 'ac7108e7-2f26-424d-9982-c24700dc02ca',
        //        caps: {
        //          orders: { read: 1, write: 1 },
        //          account: { read: 1, write: 1 },
        //          funding: { read: 1, write: 1 },
        //          history: { read: 1, write: 0 },
        //          wallets: { read: 1, write: 1 },
        //          withdraw: { read: 0, write: 1 },
        //          positions: { read: 1, write: 1 },
        //          ui_withdraw: { read: 0, write: 0 }
        //        }
        //    }
        //
        if (Array.isArray(message)) {
            if (message[1] === 'hb') {
                return message; // skip heartbeats within subscription channels for now
            }
            const subscription = this.safeValue(client.subscriptions, channelId, {});
            const channel = this.safeString(subscription, 'channel');
            const name = this.safeString(message, 1);
            const publicMethods = {
                'book': this.handleOrderBook,
                'cs': this.handleChecksum,
                'candles': this.handleOHLCV,
                'ticker': this.handleTicker,
                'trades': this.handleTrades,
            };
            const privateMethods = {
                'os': this.handleOrders,
                'ou': this.handleOrders,
                'on': this.handleOrders,
                'oc': this.handleOrders,
                'wu': this.handleBalance,
                'ws': this.handleBalance,
                'tu': this.handleMyTrade,
            };
            let method = undefined;
            if (channelId === '0') {
                method = this.safeValue(privateMethods, name);
            }
            else {
                method = this.safeValue2(publicMethods, name, channel);
            }
            if (method === undefined) {
                return message;
            }
            else {
                return method.call(this, client, message, subscription);
            }
        }
        else {
            const event = this.safeString(message, 'event');
            if (event !== undefined) {
                const methods = {
                    'info': this.handleSystemStatus,
                    'subscribed': this.handleSubscriptionStatus,
                    'auth': this.handleAuthenticationMessage,
                };
                const method = this.safeValue(methods, event);
                if (method === undefined) {
                    return message;
                }
                else {
                    return method.call(this, client, message);
                }
            }
        }
    }
}

module.exports = bitfinex2;
