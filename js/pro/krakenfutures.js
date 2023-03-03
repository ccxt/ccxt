'use strict';

//  ---------------------------------------------------------------------------

const krakenfuturesRest = require ('../krakenfutures.js');
const { BadSymbol, BadRequest } = require ('../base/errors');
const { ArrayCache, ArrayCacheBySymbolById, ArrayCacheByTimestamp } = require ('./base/Cache');

//  ---------------------------------------------------------------------------

module.exports = class krakenfutures extends krakenfuturesRest {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchBalance': false, // for now
                'watchMyTrades': false, // for now
                'watchOHLCV': false, // for now
                'watchOrderBook': false, // for now
                'watchOrders': false, // for now
                'watchTicker': true,
                'watchTickers': false, // for now
                'watchTrades': false, // for now
                // 'watchHeartbeat': true,
                // 'watchStatus': true,
            },
            'urls': {
                'api': {
                    'ws': {
                        'public': 'wss://futures.kraken.com/ws/v1',
                    },
                },
            },
            // 'versions': {
            //     'ws': '0.2.0',
            // },
            'options': {
                'tradesLimit': 1000,
                'OHLCVLimit': 1000,
                'ordersLimit': 1000,
                'symbolsByOrderId': {},
                'checksum': true,
            },
            'exceptions': {
                'ws': {
                    'exact': {
                        'Event(s) not found': BadRequest,
                    },
                    'broad': {
                        'Currency pair not in ISO 4217-A3 format': BadSymbol,
                    },
                },
            },
        });
    }

    handleTicker (client, message) {
        //
        //   {
        //     "time": 1612270825253,
        //     "feed": "ticker",
        //     "product_id": "PI_XBTUSD",
        //     "bid": 34832.5,
        //     "ask": 34847.5,
        //     "bid_size": 42864,
        //     "ask_size": 2300,
        //     "volume": 262306237,
        //     "dtm": 0,
        //     "leverage": "50x",
        //     "index": 34803.45,
        //     "premium": 0.1,
        //     "last": 34852,
        //     "change": 2.995109121267192,
        //     "funding_rate": 3.891007752e-9,
        //     "funding_rate_prediction": 4.2233756e-9,
        //     "suspended": false,
        //     "tag": "perpetual",
        //     "pair": "XBT:USD",
        //     "openInterest": 107706940,
        //     "markPrice": 34844.25,
        //     "maturityTime": 0,
        //     "relative_funding_rate": 0.000135046879166667,
        //     "relative_funding_rate_prediction": 0.000146960125,
        //     "next_funding_rate_time": 1612281600000,
        //     "volumeQuote": 262306237
        //   }
        //
        const product_id = this.safeStringLower (message, 'product_id');
        const name = 'ticker';
        const market = this.market (product_id);
        const symbol = market['symbol'];
        const messageHash = name + ':' + symbol;
        const timestamp = this.milliseconds ();
        const result = this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': undefined,
            'low': undefined,
            'bid': this.safeString (message, 'bid'),
            'bidVolume': this.safeString (message, 'bid_size'),
            'ask': this.safeString (message, 'ask'),
            'askVolume': this.safeString (message, 'ask_size'),
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'last': this.safeString (message, 'last'),
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeString (message, 'volume'),
            'quoteVolume': this.safeString (message, 'volumeQuote'),
            'info': message,
        }, market);
        this.tickers[symbol] = result;
        client.resolve (result, messageHash);
    }

    async watchPublic (name, symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const messageHash = name + ':' + market['symbol'];
        const url = this.urls['api']['ws']['public'];
        const subscribe = {
            'event': 'subscribe',
            'feed': name,
            'product_ids': [
                market['id'],
            ],
        };
        const request = this.deepExtend (subscribe, params);
        return await this.watch (url, messageHash, request, messageHash);
    }

    async watchTicker (symbol, params = {}) {
        /**
         * @method
         * @name krakenfutures#watchTicker
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the kraken api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        return await this.watchPublic ('ticker', symbol, params);
    }

    async watchTrades (symbol, params = {}) {
        /**
         * @method
         * @name krakenfuturest#watchTrades
         * @description watches information on multiple trades made in a market
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {object} params extra parameters specific to the bybit api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure
         */
        return await this.watchPublic ('trade', symbol, params);
    }

    async watchOrderBook (symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name krakenfutures#watchOrderBook
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return.
         * @param {object} params extra parameters specific to the bybit api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        const orderbook = await this.watchPublic ('book', symbol, params);
        return orderbook.limit ();
    }

    handleOrderBook (client, message) {
        //
        // snapshot
        //   {
        //       "feed": "book_snapshot",
        //       "product_id": "PI_XBTUSD",
        //       "timestamp": 1612269825817,
        //       "seq": 326072249,
        //       "tickSize": null,
        //       "bids": [
        //         {
        //           "price": 34892.5,
        //           "qty": 6385
        //         },
        //         {
        //           "price": 34892,
        //           "qty": 10924
        //         },
        //       ],
        //       "asks": [
        //         {
        //           "price": 34911.5,
        //           "qty": 20598
        //         },
        //         {
        //           "price": 34912,
        //           "qty": 2300
        //         },
        //       ]
        //   }
        // delta
        //
        //   {
        //       "feed": "book",
        //       "product_id": "PI_XBTUSD",
        //       "side": "sell",
        //       "seq": 326094134,
        //       "price": 34981,
        //       "qty": 0,
        //       "timestamp": 1612269953629
        //   }
        //
        const feed = this.safeString (message, 'feed');
        const marketId = this.safeStringLower (message, 'product_id');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const timestamp = this.safeInteger (message, 'timestamp');
        const nonce = this.safeInteger (message, 'seq');
        let orderbook = this.safeValue (this.orderbooks, symbol);
        if (orderbook === undefined) {
            orderbook = this.orderBook ();
        }
        if (feed === 'book_snapshot') {
            const snapshot = this.parseOrderBook (message, symbol, timestamp, 'bids', 'asks', 'price', 'qty');
            orderbook.reset (snapshot);
        } else {
            const side = this.safeString (message, 'side');
            if (side === 'sell') {
                this.handleDelta (orderbook['asks'], message);
            } else {
                this.handleDelta (orderbook['bids'], message);
            }
        }
        orderbook['timestamp'] = timestamp;
        orderbook['datetime'] = this.iso8601 (timestamp);
        orderbook['nonce'] = nonce;
        const messageHash = 'book' + ':' + symbol;
        this.orderbooks[symbol] = orderbook;
        client.resolve (orderbook, messageHash);
    }

    handleDelta (bookside, delta) {
        //
        //   {
        //       "feed": "book",
        //       "product_id": "PI_XBTUSD",
        //       "side": "sell",
        //       "seq": 326094134,
        //       "price": 34981,
        //       "qty": 0,
        //       "timestamp": 1612269953629
        //   }
        //
        const bidAsk = this.parseBidAsk (delta, 'price', 'qty');
        bookside.storeArray (bidAsk);
    }

    async watchHeartbeat (params = {}) {
        await this.loadMarkets ();
        const event = 'heartbeat';
        const url = this.urls['api']['ws']['public'];
        return await this.watch (url, event);
    }

    handleHeartbeat (client, message) {
        //
        // every second (approx) if no other updates are sent
        //
        //     { "event": "heartbeat" }
        //
        const event = this.safeString (message, 'event');
        client.resolve (message, event);
    }

    handleTrades (client, message) {
        //
        // snapshot
        // {
        //     feed: 'trade_snapshot',
        //     product_id: 'PF_XBTUSD',
        //     trades: [
        //       {
        //         feed: 'trade',
        //         product_id: 'PF_XBTUSD',
        //         uid: 'e074476f-09de-4c39-9538-1c1fc485a3af',
        //         side: 'buy',
        //         type: 'fill',
        //         seq: 46590,
        //         time: 1677863497310,
        //         qty: 1,
        //         price: 22437
        //       }
        //     ]
        //   }
        //
        // single trade
        //
        //   {
        //       feed: 'trade',
        //       product_id: 'PF_XBTUSD',
        //       uid: 'cf0932f3-a048-4f23-821f-1cc24a50b922',
        //       side: 'buy',
        //       type: 'fill',
        //       seq: 46690,
        //       time: 1677865802580,
        //       qty: 0.0489,
        //       price: 22429
        //   }
        //
        const trades = this.safeValue (message, 'trades', [ message ]);
        const marketId = this.safeStringLower (message, 'product_id');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        let stored = this.safeValue (this.trades, symbol);
        if (stored === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            stored = new ArrayCache (limit);
            this.trades[symbol] = stored;
        }
        for (let j = 0; j < trades.length; j++) {
            const parsed = this.parseTrade (trades[j], market);
            stored.append (parsed);
        }
        const messageHash = 'trade' + ':' + symbol;
        client.resolve (stored, messageHash);
    }

    handleSubscriptionStatus (client, message) {
        //
        // public
        //
        //   {
        //     "event": "subscribed",
        //     "feed": "ticker",
        //     "product_ids": [
        //       "PI_XBTUSD"
        //     ]
        //   }
        //
        // private
        //
        //   {
        //     "event": "subscribed",
        //     "feed": "open_orders",
        //     "api_key": "CMl2SeSn09Tz+2tWuzPiPUjaXEQRGq6qv5UaexXuQ3SnahDQU/gO3aT+",
        //     "original_challenge": "226aee50-88fc-4618-a42a-34f7709570b2",
        //     "signed_challenge":"RE0DVOc7vS6pzcEjGWd/WJRRBWb54RkyvV+AZQSRl4+rap8Rlk64diR+Z9DQILm7qxncswMmJyvP/2vgzqqh+g=="
        //   }
        //
        client.subscriptions[message['feed']] = message;
    }

    handleErrorMessage (client, message) {
        //
        //   {
        //     "event": "error",
        //     "message": "Invalid product id"
        //   }
        //
        // TODO: handle error message
        return true;
    }

    handleMessage (client, message) {
        const name = message['feed'];
        const event = this.safeValue (message, 'event');
        if (event !== undefined) {
            return this.handleSubscriptionStatus (client, message);
        }
        const methods = {
            // public
            'ticker': this.handleTicker,
            'trade': this.handleTrades,
            'book_snapshot': this.handleOrderBook,
            'book': this.handleOrderBook,
        };
        const method = this.safeValue (methods, name);
        if (method === undefined) {
            return message;
        } else {
            return method.call (this, client, message);
        }
    }
};
