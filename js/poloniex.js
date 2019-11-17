'use strict';

//  ---------------------------------------------------------------------------

const ccxt = require ('ccxt');

//  ---------------------------------------------------------------------------

module.exports = class poloniex extends ccxt.poloniex {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'fetchWsTicker': true,
                'fetchWsOrderBook': true,
            },
            'urls': {
                'api': {
                    'ws': 'wss://api2.poloniex.com/',
                },
            },
        });
    }

    // getWsMessageHash (client, response) {
    //     const channelId = response[0].toString ();
    //     const length = response.length;
    //     if (length <= 2) {
    //         return;
    //     }
    //     if (channelId === '1002') {
    //         return channelId + response[2][0].toString ();
    //     } else {
    //         return channelId;
    //     }
    // }

    handleWsTicker (response) {
        const data = response[2];
        const market = this.safeValue (this.options['marketsByNumericId'], data[0].toString ());
        const symbol = this.safeString (market, 'symbol');
        return {
            'info': response,
            'symbol': symbol,
            'last': parseFloat (data[1]),
            'ask': parseFloat (data[2]),
            'bid': parseFloat (data[3]),
            'change': parseFloat (data[4]),
            'baseVolume': parseFloat (data[5]),
            'quoteVolume': parseFloat (data[6]),
            'active': data[7] ? false : true,
            'high': parseFloat (data[8]),
            'low': parseFloat (data[9]),
        };
    }

    async fetchWsTickers (symbol) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const numericId = market['info']['id'].toString ();
        const url = this.urls['api']['websocket']['public'];
        return await this.WsTickerMessage (url, '1002' + numericId, {
            'command': 'subscribe',
            'channel': 1002,
        });
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

    async fetchWsOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const numericId = this.safeString (market, 'numericId');
        const url = this.urls['api']['ws'];
        const orderbook = await this.sendWsMessage (url, numericId, {
            'command': 'subscribe',
            'channel': numericId,
        });
        return orderbook.limit (limit);
    }

    handleWsHeartbeat (message) {
        //
        // every second
        //
        //     [ 1010 ]
        //
        return message;
    }

    handleWsOrderBookAndTrades (message) {
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
        //             [ "t", "42706057", 1, "0.05567134", "0.00181421", 1522877119 ] // trade, id, sell, price, size, timestamp
        //         ]
        //     ]
        //
        // TODO: handle incremental trades too
        const marketId = message[0].toString ();
        const nonce = message[1];
        const data = message[2];
        const market = this.safeValue (this.options['marketsByNumericId'], marketId);
        const symbol = this.safeString (market, 'symbol');
        let orderbookCount = 0;
        let tradesCount = 0;
        for (let i = 0; i < data.length; i++) {
            const delta = data[i];
            if (delta[0] === 'i') {
                const snapshot = this.safeValue (delta[1], 'orderBook', []);
                const sides = [ 'asks', 'bids' ];
                this.orderbooks[symbol] = this.orderbook ();
                const orderbook = this.orderbooks[symbol];
                for (let j = 0; j < snapshot.length; j++) {
                    const side = sides[j];
                    const bookside = orderbook[side];
                    const orders = snapshot[j];
                    const prices = Object.keys (orders);
                    for (let k = 0; k < prices.length; k++) {
                        const price = prices[k];
                        const amount = parseFloat (orders[price]);
                        bookside.store (price, amount);
                    }
                }
                orderbook['nonce'] = nonce;
                orderbookCount += 1;
            } else if (delta[0] === 'o') {
                const orderbook = this.orderbooks[symbol];
                const side = delta[1] ? 'bids' : 'asks';
                const bookside = orderbook[side];
                const price = delta[2];
                const amount = parseFloat (delta[3]);
                bookside.store (price, amount);
                orderbookCount += 1;
            } else if (delta[0] === 't') {
                const trade = this.parseWsTrade (delta);
                this.trades.push (trade);
                tradesCount += 1;
            }
        }
        if (orderbookCount) {
            // resolve the orderbook future
        }
        if (tradesCount) {
            // resolve the trades future
        }
    }

    handleWsMessage (client, message) {
        const channelId = message[0].toString ();
        const market = this.safeValue (this.options['marketsByNumericId'], channelId);
        if (market === undefined) {
            const methods = {
                // '<numericId>': 'handleWsOrderBookAndTrades', // Price Aggregated Book
                '1000': 'handleWsPrivateAccountNotifications', // (Beta)
                '1002': 'handleWsTicker', // Ticker Data
                // '1003': undefined, // 24 Hour Exchange Volume
                '1010': 'handleWsHeartbeat',
            };
            const method = this.safeString (methods, channelId);
            if (method === undefined) {
                return message;
            } else {
                return this[method] (message);
            }
        } else {
            return this.handleWsOrderBookAndTrades (message);
        }
        // if (channelId in this.options['marketsByNumericId']) {
        //     return this.handleWsOrderBookAndTrades (message);
        // } else {
        //     const methods = {
        //         // '<numericId>': 'handleWsOrderBookAndTrades', // Price Aggregated Book
        //         '1000': 'handleWsPrivateAccountNotifications', // (Beta)
        //         '1002': 'handleWsTicker', // Ticker Data
        //         // '1003': undefined, // 24 Hour Exchange Volume
        //         '1010': 'handleWsHeartbeat',
        //     };
        //     const method = this.safeString (methods, channelId);
        //     if (method === undefined) {
        //         return message;
        //     } else {
        //         return this[method] (message);
        //     }
        // }
    }
};
