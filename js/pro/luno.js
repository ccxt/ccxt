'use strict';

//  ---------------------------------------------------------------------------

const lunoRest = require ('../luno');
const Precise = require ('../base/Precise');
const { ExchangeError } = require ('../base/errors');
const { ArrayCache } = require ('./base/Cache');

//  ---------------------------------------------------------------------------

module.exports = class luno extends lunoRest {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchBalance': undefined, // is in beta
                'watchTicker': false,
                'watchTickers': false,
                'watchTrades': true,
                'watchMyTrades': false,
                'watchOrders': undefined, // is in beta
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
            'streaming': {
            },
            'exceptions': {
            },
        });
    }

    async watchTrades (symbol, since = undefined, limit = undefined, params = {}) {
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
        await this.checkRequiredCredentials ();
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const subscriptionHash = '/stream/' + market['id'];
        const url = this.urls['api']['ws'] + subscriptionHash;
        const messageHash = 'trades:' + symbol;
        const subscribe = {
            'api_key_id': this.apiKey,
            'api_key_secret': this.secret,
        };
        const request = this.deepExtend (subscribe, params);
        const trades = await this.watch (url, messageHash, request, subscriptionHash);
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    handleTrades (client, message) {
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
        const url = client['url'];
        const marketId = url.slice (31);
        const symbol = this.safeSymbol (marketId);
        const messageHash = 'trades:' + symbol;
        let stored = this.safeValue (this.trades, symbol);
        if (stored === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            stored = new ArrayCache (limit);
            this.trades[symbol] = stored;
        }
        const rawTrades = this.safeValue (message, 'trade_updates', []);
        if (rawTrades.length === 0) {
            return;
        }
        for (let i = 0; i < rawTrades.length; i++) {
            const rawTrade = rawTrades[i];
            const market = this.safeMarket (marketId);
            const trade = this.parseTrade (rawTrade, market);
            stored.append (trade);
        }
        this.trades[symbol] = stored;
        client.resolve (this.trades[symbol], messageHash);
    }

    async watchOrderBook (symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name luno#watchOrderBook
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {objectConstructor} params extra parameters specific to the luno api endpoint
         * @param {string|undefined} params.type accepts l2 or l3 for level 2 or level 3 order book
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        await this.checkRequiredCredentials ();
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const subscriptionHash = '/stream/' + market['id'];
        const url = this.urls['api']['ws'] + subscriptionHash;
        const messageHash = 'orderbook:' + symbol;
        const subscribe = {
            'api_key_id': this.apiKey,
            'api_key_secret': this.secret,
        };
        const request = this.deepExtend (subscribe, params);
        const orderbook = await this.watch (url, messageHash, request, subscriptionHash);
        return orderbook.limit (limit);
    }

    handleOrderBook (client, message) {
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
        const url = client['url'];
        const marketId = url.slice (31);
        const symbol = this.safeSymbol (marketId);
        const messageHash = 'orderbook:' + symbol;
        const timestamp = this.safeString (message, 'timestamp');
        let storedOrderBook = this.safeValue (this.orderbooks, symbol);
        if (storedOrderBook === undefined) {
            storedOrderBook = this.indexedOrderBook ({});
            this.orderbooks[symbol] = storedOrderBook;
        }
        const asks = this.safeValue (message, 'asks');
        if (asks !== undefined) {
            const snapshot = this.parseOrderBook (message, symbol, timestamp, 'bids', 'asks', 'price', 'volume', 'id');
            storedOrderBook.reset (snapshot);
        } else {
            this.handleDelta (storedOrderBook, message);
            storedOrderBook['timestamp'] = timestamp;
            storedOrderBook['datetime'] = this.iso8601 (timestamp);
        }
        client.resolve (storedOrderBook, messageHash);
    }

    parseOrderBook (orderbook, symbol, timestamp = undefined, bidsKey = 'bids', asksKey = 'asks', priceKey = 0, amountKey = 1, thirdKey = undefined) {
        const bids = this.parseBidsAsks (this.safeValue (orderbook, bidsKey, []), priceKey, amountKey, thirdKey);
        const asks = this.parseBidsAsks (this.safeValue (orderbook, asksKey, []), priceKey, amountKey, thirdKey);
        return {
            'symbol': symbol,
            'bids': this.sortBy (bids, 0, true),
            'asks': this.sortBy (asks, 0),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'nonce': undefined,
        };
    }

    parseBidsAsks (bidasks, priceKey = 0, amountKey = 1, thirdKey = undefined) {
        bidasks = this.toArray (bidasks);
        const result = [];
        for (let i = 0; i < bidasks.length; i++) {
            result.push (this.parseBidAsk (bidasks[i], priceKey, amountKey, thirdKey));
        }
        return result;
    }

    parseBidAsk (bidask, priceKey = 0, amountKey = 1, thirdKey = undefined) {
        const price = this.safeNumber (bidask, priceKey);
        const amount = this.safeNumber (bidask, amountKey);
        const result = [ price, amount ];
        if (thirdKey !== undefined) {
            const thirdValue = this.safeString (bidask, thirdKey);
            result.push (thirdValue);
        }
        return result;
    }

    handleDelta (orderbook, message) {
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
        const createUpdate = this.safeValue (message, 'create_update');
        const asksOrderSide = orderbook['asks'];
        const bidsOrderSide = orderbook['bids'];
        if (createUpdate !== undefined) {
            const array = this.parseBidAsk (createUpdate, 'price', 'volume', 'order_id');
            const type = this.safeString (createUpdate, 'type');
            if (type === 'ASK') {
                asksOrderSide.storeArray (array);
            } else if (type === 'BID') {
                bidsOrderSide.storeArray (array);
            }
        }
        const deleteUpdate = this.safeValue (message, 'delete_update');
        if (deleteUpdate !== undefined) {
            const orderId = this.safeString (deleteUpdate, 'order_id');
            asksOrderSide.storeArray (0, 0, orderId);
            bidsOrderSide.storeArray (0, 0, orderId);
        }
        const trades = this.safeValue (message, 'trade_updates', []);
        for (let i = 0; i < trades.length; i++) {
            const trade = trades[i];
            const orderId = this.safeString2 (trade, 'order_id', 'maker_order_id');
            const amountToReduce = this.safeString (trade, 'base');
            for (let ii = 0; ii < asksOrderSide.length; ii++) {
                const ask = asksOrderSide[i];
                if (ask[2] === orderId) {
                    const previousAmount = this.parseNumber (ask[1]);
                    const updatedAmount = Precise.stringSub (previousAmount, amountToReduce);
                    asksOrderSide.storeArray (ask[0], updatedAmount, orderId);
                    break;
                }
            }
        }
        return message;
    }

    checkSequenceNumber (client, message) {
        const currentNumber = this.safeNumber (message, 'sequence', 0);
        const url = client['url'];
        const sequenceNumbers = this.options['sequenceNumbers'];
        const lastSequenceNumber = this.safeNumber (sequenceNumbers, url);
        if (lastSequenceNumber !== undefined && currentNumber !== lastSequenceNumber + 1) {
            throw new ExchangeError (this.id + ' receieved an invalid sequence number');
        }
        this.options['sequenceNumbers'][url] = currentNumber;
        return message;
    }

    handleMessage (client, message) {
        this.checkSequenceNumber (client, message);
        const url = client['url'];
        const handlers = {
            '/stream': [ this.handleOrderBook, this.handleTrades ],
        };
        const keys = Object.keys (handlers);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const index = url.indexOf (key);
            if (index > 0) {
                const handlerArray = handlers[key];
                for (let j = 0; j < handlerArray.length; j++) {
                    const handler = handlerArray[j];
                    handler.call (this, client, message);
                }
            }
        }
        return message;
    }
};
