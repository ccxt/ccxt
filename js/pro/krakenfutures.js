'use strict';

//  ---------------------------------------------------------------------------

const krakenfuturesRest = require ('../krakenfutures.js');
const { BadSymbol, BadRequest } = require ('../base/errors');

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
        };
        const method = this.safeValue (methods, name);
        if (method === undefined) {
            return message;
        } else {
            return method.call (this, client, message);
        }
    }
};
