//  ---------------------------------------------------------------------------

import timexRest from '../timex.js';
import { ArrayCache } from '../base/ws/Cache.js';
import { Int } from '../base/types.js';
import Client from '../base/ws/Client.js';

//  ---------------------------------------------------------------------------

export default class timex extends timexRest {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchOHLCV': false,
                'watchOrderBook': true,
                'watchTicker': false,  // possibly true https://docs.timex.io/websocket-api-list-patterns.html#ticker
                'watchTickers': false,
                'watchTrades': true,
                'watchBalance': false,
                'watchOrders': false,  // possibly true https://docs.timex.io/websocket-api-list-patterns.html#orders
                'watchMyTrades': false,  // possibly true https://docs.timex.io/websocket-api-list-patterns.html#orders
            },
            'urls': {
                'api': {
                    'ws': 'wss://plasma-relay-backend.timex.io/socket/relay',
                },
            },
            'options': {
                'tradesLimit': 1000,
                'ordersLimit': 1000,
                'OHLCVLimit': 1000,
            },
            'timeframes': {
                '1m': 'I1',
                '5m': 'I5',
                '15m': 'I15',
                '30m': 'I30',
                '1h': 'H1',
                '2h': 'H2',
                '4h': 'H4',
                '6h': 'H6',
                '12h': 'H12',
                '1d': 'D1',
                '1w': 'W1',
            },
        });
    }

    async subscribe (name: string, params = {}) {
        /**
         * @ignore
         * @method
         * @description Connects to a websocket channel
         * @param {String} name name of the channel
         * @param {[String]} symbols CCXT market symbols
         * @param {Object} params extra parameters specific to the timex api
         * @returns {Object} data from the websocket stream
         */
        await this.loadMarkets ();
        const url = this.urls['api']['ws'];
        const subscribe = {
            'type': 'SUBSCRIBE',
            'requestId': this.numberToString (this.milliseconds ()),
            'pattern': name,
            'snapshot': true,
        };
        const messageHash = name;
        const request = JSON.stringify (subscribe);
        return await this.watch (url, messageHash, request, name);
    }

    async watchTicker (symbol: string, params = {}) {
        /**
         * @method
         * @name timex#watchTicker
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @see https://docs.timex.io/websocket-api-list-patterns.html#ticker
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the timex api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        const market = this.market (symbol);
        const name = '/ticker/' + market['id'] + '/D1';
        return await this.subscribe (name, params);
    }

    async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name timex#watchTrades
         * @description get the list of most recent trades for a particular symbol
         * @see https://docs.timex.io/websocket-api-list-patterns.html#trade
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the timex api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const name = '/trade.symbols/' + market['baseId'] + '/' + market['quoteId'];
        const trades = await this.subscribe (name, params);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    async watchOrderBook (symbol: string, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name timex#watchOrderBook
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @see https://docs.timex.io/websocket-api-list-streams.html#orderbook
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum number of orders to retrieve
         * @param {object} params extra parameters specific to the timex api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        const market = this.market (symbol);
        const name = '/orderbook/' + market['id'];
        const orderbook = await this.subscribe (name, params);
        return orderbook.limit ();
    }

    async watchOrders (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name timex#watchOrders
         * @description watches information on multiple orders made by the user
         * @see https://docs.timex.io/websocket-api-list-patterns.html#orders
         * @param {string|undefined} symbol not used by timex watchOrders
         * @param {int|undefined} since not used by timex watchOrders
         * @param {int|undefined} limit not used by timex watchOrders
         * @param {object} params extra parameters specific to the timex api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const name = '/order-update/.*';
        const orders = await this.subscribe (name, params);
        if (this.newUpdates) {
            limit = orders.getLimit (symbol, limit); // TODO: shouldn't be restricted to 1 symbol
        }
        return this.filterBySinceLimit (orders, since, limit, 'timestamp', true);
    }

    handleTrade (client: Client, message) {
        //
        // snapshot
        //
        //    {
        //        "feed": "trade_snapshot",
        //        "product_id": "PI_XBTUSD",
        //        "trades": [
        //            {
        //                "feed": "trade",
        //                "product_id": "PI_XBTUSD",
        //                "uid": "caa9c653-420b-4c24-a9f1-462a054d86f1",
        //                "side": "sell",
        //                "type": "fill",
        //                "seq": 655508,
        //                "time": 1612269657781,
        //                "qty": 440,
        //                "price": 34893
        //            },
        //            ...
        //        ]
        //    }
        //
        // update
        //
        //    {
        //        "feed": "trade",
        //        "product_id": "PI_XBTUSD",
        //        "uid": "05af78ac-a774-478c-a50c-8b9c234e071e",
        //        "side": "sell",
        //        "type": "fill",
        //        "seq": 653355,
        //        "time": 1612266317519,
        //        "qty": 15000,
        //        "price": 34969.5
        //    }
        //
        const channel = this.safeString (message, 'feed');
        const marketId = this.safeStringLower (message, 'product_id');
        if (marketId !== undefined) {
            const market = this.market (marketId);
            const symbol = market['symbol'];
            const messageHash = 'trade:' + symbol;
            let tradesArray = this.safeValue (this.trades, symbol);
            if (tradesArray === undefined) {
                const tradesLimit = this.safeInteger (this.options, 'tradesLimit', 1000);
                tradesArray = new ArrayCache (tradesLimit);
                this.trades[symbol] = tradesArray;
            }
            if (channel === 'trade_snapshot') {
                const trades = this.safeValue (message, 'trades', []);
                for (let i = 0; i < trades.length; i++) {
                    const item = trades[i];
                    const trade = this.parseTrade (item);
                    tradesArray.append (trade);
                }
            } else {
                const trade = this.parseTrade (message);
                tradesArray.append (trade);
            }
            client.resolve (tradesArray, messageHash);
        }
        return message;
    }

    handleOrderBook (client: Client, message) {
        //
        //    {
        //        "feed": "book",
        //        "product_id": "PI_XBTUSD",
        //        "side": "sell",
        //        "seq": 326094134,
        //        "price": 34981,
        //        "qty": 0,
        //        "timestamp": 1612269953629
        //    }
        //
        const marketId = this.safeStringLower (message, 'product_id');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const messageHash = 'book:' + symbol;
        const orderbook = this.orderbooks[symbol];
        const side = this.safeString (message, 'side');
        const price = this.safeNumber (message, 'price');
        const qty = this.safeNumber (message, 'qty');
        const timestamp = this.safeInteger (message, 'timestamp');
        if (side === 'sell') {
            orderbook['asks'].store (price, qty);
        } else {
            orderbook['bids'].store (price, qty);
        }
        orderbook['timestamp'] = timestamp;
        orderbook['datetime'] = this.iso8601 (timestamp);
        client.resolve (orderbook, messageHash);
    }

    handleMessage (client, message) {
        const event = this.safeString (message, 'event');
        if (event === 'pong') {
            return client.onPong (message);
        } else {
            const feed = this.safeString (message, 'feed');
            const methods = {
                'trade': this.handleTrade,
                'trade_snapshot': this.handleTrade,
                'book': this.handleOrderBook,
                'book_snapshot': this.handleOrderBookSnapshot,
            };
            const method = this.safeValue (methods, feed);
            if (method !== undefined) {
                return method.call (this, client, message);
            }
        }
    }
}
