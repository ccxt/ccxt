
//  ---------------------------------------------------------------------------

import coinmateRest from '../coinmate.js';
import { AuthenticationError } from '../base/errors.js';
import type { Int, Market, OrderBook, Ticker, Trade } from '../base/types.js';
import Client from '../base/ws/Client.js';
import { ArrayCache } from '../base/ws/Cache.js';

//  ---------------------------------------------------------------------------

export default class coinmate extends coinmateRest {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchOrderBook': true,
                'watchOrders': false,
                'watchTrades': true,
                'watchOHLCV': false,
                'watchTicker': false,
                'watchTickers': false,
            },
            'urls': {
                'api': {
                    'ws': 'wss://coinmate.io/api/websocket',
                },
            },
            'options': {
                'watchOrderBook': {
                    'snapshotDelay': 6,
                    'snapshotMaxRetries': 3,
                },
                'tradesLimit': 1000,
                'OHLCVLimit': 1000,
            },
            'exceptions': {
                'exact': {
                    '4009': AuthenticationError,
                },
            },
        });
    }

    async watchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        /**
         * @method
         * @name coinmate#watchOrderBook
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @see https://coinmate.docs.apiary.io/#introduction/public-channels/order-book
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int} [limit] the maximum amount of order book entries to return
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const messageHash = 'orderbook:' + market['symbol'];
        const url = this.urls['api']['ws'];
        const request = {
            'event': 'subscribe',
            'data': {
                'channel': 'order_book-' + market['id'],
            },
        };
        const message = this.extend (request, params);
        const orderbook = await this.watch (url, messageHash, message, messageHash);
        return orderbook.limit ();
    }

    handleOrderBook (client, message) {
        //
        //     {
        //         "channel": "order_book-BTC_EUR",
        //         "payload": {
        //             "bids": [
        //                 {
        //                     "price": 37875.8,
        //                     "amount": 0.0002894
        //                 }
        //             ],
        //             "asks": [
        //                 {
        //                     "price": 37914.7,
        //                     "amount": 0.44199852
        //                 }
        //             ]
        //         },
        //         "event": "data"
        //     }
        //
        const data = this.safeValue (message, 'payload', {});
        const topic = this.safeString (message, 'channel');
        const part = topic.split ('-');
        const symbol = this.symbol (this.safeString (part, 1));
        let orderbook = this.safeValue (this.orderbooks, symbol);
        if (orderbook === undefined) {
            orderbook = this.orderBook ();
        } else {
            orderbook.reset ();
        }
        orderbook['symbol'] = symbol;
        const asks = this.safeValue (data, 'asks', []);
        const bids = this.safeValue (data, 'bids', []);
        this.handleDeltas (orderbook['asks'], asks);
        this.handleDeltas (orderbook['bids'], bids);
        const messageHash = 'orderbook:' + symbol;
        this.orderbooks[symbol] = orderbook;
        client.resolve (orderbook, messageHash);
    }

    handleDelta (bookside, delta) {
        const bidAsk = this.parseBidAsk (delta, 'price', 'amount');
        bookside.storeArray (bidAsk);
    }

    async watchTicker (symbol: string, params = {}): Promise<Ticker> {
        /**
         * @method
         * @name coinmate#watchTicker
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @see https://coinmate.docs.apiary.io/#introduction/public-channels/trade-statistics
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const messageHash = 'ticker:' + market['symbol'];
        const url = this.urls['api']['ws'];
        const request = {
            'event': 'subscribe',
            'data': {
                'channel': 'statistics-' + market['id'],
            },
        };
        const message = this.extend (request, params);
        return await this.watch (url, messageHash, message, messageHash);
    }

    handleTicker (client: Client, message) {
        //
        //     {
        //         "channel": "statistics-BTC_CZK",
        //         "payload": {
        //             "lastRealizedTrade": 939449,
        //             "todaysOpen": 950357,
        //             "dailyChange": -1.14777920,
        //             "volume24Hours": 2.78398556,
        //             "high24hours": 954788,
        //             "low24hours": 928180
        //         },
        //         "event": "data"
        //     }
        //
        const data = this.safeValue (message, 'payload', {});
        const topic = this.safeString (message, 'channel');
        const part = topic.split ('-');
        const symbol = this.symbol (this.safeString (part, 1));
        const market = this.market (symbol);
        const ticker = this.parseWsTicker (data, market);
        this.tickers[symbol] = ticker;
        const messageHash = 'ticker:' + symbol;
        client.resolve (this.tickers[symbol], messageHash);
    }

    parseWsTicker (ticker, market: Market = undefined): Ticker {
        //
        //     {
        //         "lastRealizedTrade": 939449,
        //         "todaysOpen": 950357,
        //         "dailyChange": -1.14777920,
        //         "volume24Hours": 2.78398556,
        //         "high24hours": 954788,
        //         "low24hours": 928180
        //     }
        //
        const last = this.safeNumber (ticker, 'lastRealizedTrade');
        return this.safeTicker ({
            'symbol': market['symbol'],
            'timestamp': undefined,
            'datetime': undefined,
            'high': this.safeNumber (ticker, 'high24hours'),
            'low': this.safeNumber (ticker, 'low24hours'),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': this.safeNumber (ticker, 'todaysOpen'),
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeNumber (ticker, 'volume24Hours'),
            'quoteVolume': undefined,
            'info': ticker,
        }, market);
    }

    async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        /**
         * @method
         * @name coinmate#watchTrades
         * @description watches information on multiple trades made in a market
         * @see https://coinmate.docs.apiary.io/#introduction/public-channels/new-trades
         * @param {string} symbol unified market symbol of the market trades were made in
         * @param {int} [since] the earliest time in ms to fetch trades for
         * @param {int} [limit] the maximum number of trade structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const messageHash = 'trade:' + market['symbol'];
        const url = this.urls['api']['ws'];
        const request = {
            'event': 'subscribe',
            'data': {
                'channel': 'trades-' + market['id'],
            },
        };
        const message = this.extend (request, params);
        const trades = await this.watch (url, messageHash, message, messageHash);
        if (this.newUpdates) {
            limit = trades.getLimit (market['symbol'], limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    handleTrades (client: Client, message) {
        //
        //     {
        //         "channel": "trades-BTC_CZK",
        //         "payload": [
        //             {
        //                 "date": 1705903916528,
        //                 "price": 936150,
        //                 "amount": 0.00050834,
        //                 "buyOrderId": 2542958233,
        //                 "sellOrderId": 2542958191,
        //                 "type": "BUY"
        //             }
        //         ],
        //         "event": "data"
        //     }
        //
        const data = this.safeValue (message, 'payload', []);
        const topic = this.safeString (message, 'channel');
        const part = topic.split ('-');
        const symbol = this.symbol (this.safeString (part, 1));
        const market = this.market (symbol);
        let stored = this.safeValue (this.trades, symbol);
        if (stored === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            stored = new ArrayCache (limit);
            this.trades[symbol] = stored;
        }
        for (let i = 0; i < data.length; i++) {
            const trade = this.parseWsTrade (data[i], market);
            stored.append (trade);
        }
        const messageHash = 'trade:' + symbol;
        client.resolve (stored, messageHash);
    }

    parseWsTrade (trade, market: Market = undefined): Trade {
        //
        //     {
        //         "date": 1705903916528,
        //         "price": 936150,
        //         "amount": 0.00050834,
        //         "buyOrderId": 2542958233,
        //         "sellOrderId": 2542958191,
        //         "type": "BUY"
        //     }
        //
        const timestamp = this.safeInteger (trade, 'date');
        const side = this.safeStringLower (trade, 'type');
        const priceString = this.safeString (trade, 'price');
        const amountString = this.safeString (trade, 'amount');
        let orderId = undefined;
        if (side === 'buy') {
            orderId = this.safeString (trade, 'buyOrderId');
        } else {
            orderId = this.safeString (trade, 'sellOrderId');
        }
        return this.safeTrade ({
            'id': undefined,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'order': orderId,
            'symbol': market['symbol'],
            'type': undefined,
            'side': side,
            'takerOrMaker': undefined,
            'price': priceString,
            'amount': amountString,
            'cost': undefined,
            'fee': undefined,
        }, market);
    }

    handleErrorMessage (client: Client, message) {
        //
        //     {
        //         "message": "Websocket error",
        //         "event": "error"
        //     }
        //
        const type = this.safeString (message, 'event', '');
        if (type === 'error') {
            return true;
        }
        return false;
    }

    handleMessage (client: Client, message) {
        if (this.handleErrorMessage (client, message)) {
            return;
        }
        const event = this.safeString (message, 'event');
        if (event === 'data') {
            const topic = this.safeString (message, 'channel', '');
            // trades-{CURRENCY_PAIR}
            // order_book-{CURRENCY_PAIR}
            // statistics-{CURRENCY_PAIR}
            // private-open_orders-{ACCOUNT_ID}-{CURRENCY_PAIR}
            // private-open_orders-{ACCOUNT_ID}
            // private-user_balances-{ACCOUNT_ID}
            // private-user-trades-{ACCOUNT_ID}-{CURRENCY_PAIR}
            // private-user-trades-{ACCOUNT_ID}
            // private-user-transfers-{ACCOUNT_ID}
            const channelSplit = topic.split ('-');
            const methods = {
                'order_book': this.handleOrderBook,
                'statistics': this.handleTicker,
                'trades': this.handleTrades,
            };
            const exacMethod = this.safeValue (methods, this.safeString (channelSplit, 0));
            if (exacMethod !== undefined) {
                exacMethod.call (this, client, message);
                return;
            }
            const keys = Object.keys (methods);
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                if (topic.indexOf (keys[i]) >= 0) {
                    const method = methods[key];
                    method.call (this, client, message);
                    return;
                }
            }
        }
    }
}
