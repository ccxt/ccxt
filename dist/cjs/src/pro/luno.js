'use strict';

var luno$1 = require('../luno.js');
var Cache = require('../base/ws/Cache.js');

//  ---------------------------------------------------------------------------
//  ---------------------------------------------------------------------------
class luno extends luno$1 {
    describe() {
        return this.deepExtend(super.describe(), {
            'has': {
                'ws': true,
                'watchTicker': false,
                'watchTickers': false,
                'watchTrades': true,
                'watchMyTrades': false,
                'watchOrders': undefined,
                'watchOrderBook': true,
                'watchOHLCV': false,
            },
            'urls': {
                'api': {
                    'ws': 'wss://ws.luno.com/api/1',
                },
            },
            'options': {
                'sequenceNumbers': {},
            },
            'streaming': {},
            'exceptions': {},
        });
    }
    async watchTrades(symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name luno#watchTrades
         * @description get the list of most recent trades for a particular symbol
         * @see https://www.luno.com/en/developers/api#tag/Streaming-API
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of    trades to fetch
         * @param {object} params extra parameters specific to the luno api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.checkRequiredCredentials();
        await this.loadMarkets();
        const market = this.market(symbol);
        symbol = market['symbol'];
        const subscriptionHash = '/stream/' + market['id'];
        const subscription = { 'symbol': symbol };
        const url = this.urls['api']['ws'] + subscriptionHash;
        const messageHash = 'trades:' + symbol;
        const subscribe = {
            'api_key_id': this.apiKey,
            'api_key_secret': this.secret,
        };
        const request = this.deepExtend(subscribe, params);
        const trades = await this.watch(url, messageHash, request, subscriptionHash, subscription);
        if (this.newUpdates) {
            limit = trades.getLimit(symbol, limit);
        }
        return this.filterBySinceLimit(trades, since, limit, 'timestamp', true);
    }
    handleTrades(client, message, subscription) {
        //
        //     {
        //         sequence: '110980825',
        //         trade_updates: [],
        //         create_update: {
        //             order_id: 'BXHSYXAUMH8C2RW',
        //             type: 'ASK',
        //             price: '24081.09000000',
        //             volume: '0.07780000'
        //         },
        //         delete_update: null,
        //         status_update: null,
        //         timestamp: 1660598775360
        //     }
        //
        const rawTrades = this.safeValue(message, 'trade_updates', []);
        const length = rawTrades.length;
        if (length === 0) {
            return;
        }
        const symbol = subscription['symbol'];
        const market = this.market(symbol);
        const messageHash = 'trades:' + symbol;
        let stored = this.safeValue(this.trades, symbol);
        if (stored === undefined) {
            const limit = this.safeInteger(this.options, 'tradesLimit', 1000);
            stored = new Cache.ArrayCache(limit);
            this.trades[symbol] = stored;
        }
        for (let i = 0; i < rawTrades.length; i++) {
            const rawTrade = rawTrades[i];
            const trade = this.parseTrade(rawTrade, market);
            stored.append(trade);
        }
        this.trades[symbol] = stored;
        client.resolve(this.trades[symbol], messageHash);
    }
    parseTrade(trade, market = undefined) {
        //
        // watchTrades (public)
        //
        //     {
        //       "base": "69.00000000",
        //       "counter": "113.6499000000000000",
        //       "maker_order_id": "BXEEU4S2BWF5WRB",
        //       "taker_order_id": "BXKNCSF7JDHXY3H",
        //       "order_id": "BXEEU4S2BWF5WRB"
        //     }
        //
        return this.safeTrade({
            'info': trade,
            'id': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'symbol': market['symbol'],
            'order': undefined,
            'type': undefined,
            'side': undefined,
            // takerOrMaker has no meaning for public trades
            'takerOrMaker': undefined,
            'price': undefined,
            'amount': this.safeString(trade, 'base'),
            'cost': this.safeString(trade, 'counter'),
            'fee': undefined,
        }, market);
    }
    async watchOrderBook(symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name luno#watchOrderBook
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {objectConstructor} params extra parameters specific to the luno api endpoint
         * @param {string|undefined} params.type accepts l2 or l3 for level 2 or level 3 order book
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.checkRequiredCredentials();
        await this.loadMarkets();
        const market = this.market(symbol);
        symbol = market['symbol'];
        const subscriptionHash = '/stream/' + market['id'];
        const subscription = { 'symbol': symbol };
        const url = this.urls['api']['ws'] + subscriptionHash;
        const messageHash = 'orderbook:' + symbol;
        const subscribe = {
            'api_key_id': this.apiKey,
            'api_key_secret': this.secret,
        };
        const request = this.deepExtend(subscribe, params);
        const orderbook = await this.watch(url, messageHash, request, subscriptionHash, subscription);
        return orderbook.limit();
    }
    handleOrderBook(client, message, subscription) {
        //
        //     {
        //         "sequence": "24352",
        //         "asks": [{
        //             "id": "BXMC2CJ7HNB88U4",
        //             "price": "1234.00",
        //             "volume": "0.93"
        //         }],
        //         "bids": [{
        //             "id": "BXMC2CJ7HNB88U5",
        //             "price": "1201.00",
        //             "volume": "1.22"
        //         }],
        //         "status": "ACTIVE",
        //         "timestamp": 1528884331021
        //     }
        //
        //  update
        //     {
        //         sequence: '110980825',
        //         trade_updates: [],
        //         create_update: {
        //             order_id: 'BXHSYXAUMH8C2RW',
        //             type: 'ASK',
        //             price: '24081.09000000',
        //             volume: '0.07780000'
        //         },
        //         delete_update: null,
        //         status_update: null,
        //         timestamp: 1660598775360
        //     }
        //
        const symbol = subscription['symbol'];
        const messageHash = 'orderbook:' + symbol;
        const timestamp = this.safeString(message, 'timestamp');
        let storedOrderBook = this.safeValue(this.orderbooks, symbol);
        if (storedOrderBook === undefined) {
            storedOrderBook = this.indexedOrderBook({});
            this.orderbooks[symbol] = storedOrderBook;
        }
        const asks = this.safeValue(message, 'asks');
        if (asks !== undefined) {
            const snapshot = this.customParseOrderBook(message, symbol, timestamp, 'bids', 'asks', 'price', 'volume', 'id');
            storedOrderBook.reset(snapshot);
        }
        else {
            this.handleDelta(storedOrderBook, message);
            storedOrderBook['timestamp'] = timestamp;
            storedOrderBook['datetime'] = this.iso8601(timestamp);
        }
        const nonce = this.safeInteger(message, 'sequence');
        storedOrderBook['nonce'] = nonce;
        client.resolve(storedOrderBook, messageHash);
    }
    customParseOrderBook(orderbook, symbol, timestamp = undefined, bidsKey = 'bids', asksKey = 'asks', priceKey = 'price', amountKey = 'volume', thirdKey = undefined) {
        const bids = this.parseBidsAsks(this.safeValue(orderbook, bidsKey, []), priceKey, amountKey, thirdKey);
        const asks = this.parseBidsAsks(this.safeValue(orderbook, asksKey, []), priceKey, amountKey, thirdKey);
        return {
            'symbol': symbol,
            'bids': this.sortBy(bids, 0, true),
            'asks': this.sortBy(asks, 0),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'nonce': undefined,
        };
    }
    parseBidsAsks(bidasks, priceKey = 'price', amountKey = 'volume', thirdKey = undefined) {
        bidasks = this.toArray(bidasks);
        const result = [];
        for (let i = 0; i < bidasks.length; i++) {
            result.push(this.customParseBidAsk(bidasks[i], priceKey, amountKey, thirdKey));
        }
        return result;
    }
    customParseBidAsk(bidask, priceKey = 'price', amountKey = 'volume', thirdKey = undefined) {
        const price = this.safeNumber(bidask, priceKey);
        const amount = this.safeNumber(bidask, amountKey);
        const result = [price, amount];
        if (thirdKey !== undefined) {
            const thirdValue = this.safeString(bidask, thirdKey);
            result.push(thirdValue);
        }
        return result;
    }
    handleDelta(orderbook, message) {
        //
        //  create
        //     {
        //         sequence: '110980825',
        //         trade_updates: [],
        //         create_update: {
        //             order_id: 'BXHSYXAUMH8C2RW',
        //             type: 'ASK',
        //             price: '24081.09000000',
        //             volume: '0.07780000'
        //         },
        //         delete_update: null,
        //         status_update: null,
        //         timestamp: 1660598775360
        //     }
        //  delete
        //     {
        //         sequence: '110980825',
        //         trade_updates: [],
        //         create_update: null,
        //         delete_update: {
        //             "order_id": "BXMC2CJ7HNB88U4"
        //         },
        //         status_update: null,
        //         timestamp: 1660598775360
        //     }
        //  trade
        //     {
        //         sequence: '110980825',
        //         trade_updates: [
        //             {
        //                 "base": "0.1",
        //                 "counter": "5232.00",
        //                 "maker_order_id": "BXMC2CJ7HNB88U4",
        //                 "taker_order_id": "BXMC2CJ7HNB88U5"
        //             }
        //         ],
        //         create_update: null,
        //         delete_update: null,
        //         status_update: null,
        //         timestamp: 1660598775360
        //     }
        //
        const createUpdate = this.safeValue(message, 'create_update');
        const asksOrderSide = orderbook['asks'];
        const bidsOrderSide = orderbook['bids'];
        if (createUpdate !== undefined) {
            const array = this.customParseBidAsk(createUpdate, 'price', 'volume', 'order_id');
            const type = this.safeString(createUpdate, 'type');
            if (type === 'ASK') {
                asksOrderSide.storeArray(array);
            }
            else if (type === 'BID') {
                bidsOrderSide.storeArray(array);
            }
        }
        const deleteUpdate = this.safeValue(message, 'delete_update');
        if (deleteUpdate !== undefined) {
            const orderId = this.safeString(deleteUpdate, 'order_id');
            asksOrderSide.storeArray(0, 0, orderId);
            bidsOrderSide.storeArray(0, 0, orderId);
        }
        return message;
    }
    handleMessage(client, message) {
        if (message === '') {
            return;
        }
        const subscriptions = Object.values(client.subscriptions);
        const handlers = [this.handleOrderBook, this.handleTrades];
        for (let j = 0; j < handlers.length; j++) {
            const handler = handlers[j];
            handler.call(this, client, message, subscriptions[0]);
        }
        return message;
    }
}

module.exports = luno;
