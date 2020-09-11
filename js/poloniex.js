'use strict';

//  ---------------------------------------------------------------------------

const ccxt = require ('ccxt');
const { ArrayCache } = require ('./base/Cache');

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

    async watchBalance (params = {}) {
        this.checkRequiredCredentials ();
        await this.loadMarkets ();
        const channelId = '1000';
        const url = this.urls['api']['ws'];
        const client = this.client (url);
        const messageHash = channelId + ':b:e';
        if (!(channelId in client.subscriptions)) {
            this.balance = await this.fetchBalance (params);
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
            return await this.watch (url, messageHash, subscribe, channelId);
        } else {
            return await this.watch (url, messageHash, {}, channelId);
        }
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
        const future = this.watch (url, messageHash, subscribe, channelId);
        return await this.after (future, this.filterByArray, 'symbol', symbols);
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
        const future = this.watch (url, messageHash, subscribe, numericId);
        return await this.after (future, this.filterBySinceLimit, since, limit, 'timestamp', true);
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
        const future = this.watch (url, messageHash, subscribe, numericId);
        return await this.after (future, this.limitOrderBook, symbol, limit, params);
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
        // not implemented yet
        return message;
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
