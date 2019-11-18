'use strict';

//  ---------------------------------------------------------------------------

const ccxt = require ('ccxt');
const { NotImplemented } = require ('ccxt/js/base/errors');

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

    handleWsTickers (client, response) {
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

    async fetchWsBalance (params = {}) {
        await this.loadMarkets ();
        this.balance = await this.fetchBalance (params);
        const channelId = '1000';
        const subscribe = {
            'command': 'subscribe',
            'channel': channelId,
        };
        const messageHash = channelId + ':b:e';
        const url = this.urls['api']['ws'];
        return this.sendWsMessage (url, messageHash, subscribe, channelId);
    }

    async fetchWsTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        // rewrite
        throw new NotImplemented (this.id + 'fetchWsTickers not implemented yet');
        // const market = this.market (symbol);
        // const numericId = market['info']['id'].toString ();
        // const url = this.urls['api']['websocket']['public'];
        // return await this.WsTickerMessage (url, '1002' + numericId, {
        //     'command': 'subscribe',
        //     'channel': 1002,
        // });
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

    async fetchWsTrades (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const numericId = this.safeString (market, 'numericId');
        const messageHash = numericId + ':trades';
        const url = this.urls['api']['ws'];
        const subscribe = {
            'command': 'subscribe',
            'channel': numericId,
        };
        return this.sendWsMessage (url, messageHash, subscribe, numericId);
    }

    async fetchWsOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const numericId = this.safeString (market, 'numericId');
        const messageHash = numericId + ':orderbook';
        const url = this.urls['api']['ws'];
        const subscribe = {
            'command': 'subscribe',
            'channel': numericId,
        };
        // the commented lines below won't work in sync php
        // todo: figure out a way to wrap it in a base method
        //
        // const orderbook = await this.sendWsMessage (url, messageHash, {
        //     'command': 'subscribe',
        //     'channel': numericId,
        // });
        // return orderbook.limit (limit);
        return this.sendWsMessage (url, messageHash, subscribe, numericId);
    }

    async fetchWsHeartbeat (params = {}) {
        await this.loadMarkets ();
        const channelId = '1010';
        const url = this.urls['api']['ws'];
        return this.sendWsMessage (url, channelId);
    }

    signWsMessage (client, messageHash, message, params = {}) {
        if (messageHash.indexOf ('1000') === 0) {
            if (this.checkRequiredCredentials (false)) {
                const nonce = this.nonce ();
                const payload = this.urlencode ({ 'nonce': nonce });
                const signature = this.hmac (this.encode (payload), this.encode (this.secret), 'sha512');
                message = this.extend (message, {
                    'key': this.apiKey,
                    'payload': payload,
                    'sign': signature,
                });
            }
        }
        return message;
    }

    handleWsHeartbeat (client, message) {
        //
        // every second
        //
        //     [ 1010 ]
        //
        const channelId = '1010';
        this.resolveWsFuture (client, channelId, message);
    }

    parseWsTrade (client, trade, market = undefined) {
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
        const id = trade[1].toString ();
        const side = trade[2] ? 'buy' : 'sell';
        const price = parseFloat (trade[3]);
        const amount = parseFloat (trade[4]);
        const timestamp = trade[5] * 1000;
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

    handleWsOrderBookAndTrades (client, message) {
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
                        const price = prices[k]; // no need to conver the price here
                        const amount = parseFloat (orders[price]);
                        bookside.store (price, amount);
                    }
                }
                orderbook['nonce'] = nonce;
                orderbookUpdatesCount += 1;
            } else if (delta[0] === 'o') {
                const orderbook = this.orderbooks[symbol];
                const side = delta[1] ? 'bids' : 'asks';
                const bookside = orderbook[side];
                const price = delta[2]; // no need to conver the price here
                const amount = parseFloat (delta[3]);
                bookside.store (price, amount);
                orderbookUpdatesCount += 1;
            } else if (delta[0] === 't') {
                // todo: add max limit to the dequeue of trades, unshift and push
                const trade = this.parseWsTrade (client, delta, market);
                this.trades.push (trade);
                tradesCount += 1;
            }
        }
        if (orderbookUpdatesCount) {
            // resolve the orderbook future
            const messageHash = marketId + ':orderbook';
            const orderbook = this.orderbooks[symbol];
            this.resolveWsFuture (client, messageHash, orderbook.limit ());
        }
        if (tradesCount) {
            // resolve the trades future
            const messageHash = marketId + ':trades';
            this.resolveWsFuture (client, messageHash, this.trades);
        }
    }

    handleWsAccountNotifications (client, message) {
        console.log ('Received', message);
        console.log ('Private WS not implemented yet (wip)');
        process.exit ();
    }

    handleWsMessage (client, message) {
        const channelId = message[0].toString ();
        const market = this.safeValue (this.options['marketsByNumericId'], channelId);
        if (market === undefined) {
            const methods = {
                // '<numericId>': 'handleWsOrderBookAndTrades', // Price Aggregated Book
                '1000': 'handleWsAccountNotifications', // Beta
                '1002': 'handleWsTickers', // Ticker Data
                // '1003': undefined, // 24 Hour Exchange Volume
                '1010': 'handleWsHeartbeat',
            };
            const method = this.safeString (methods, channelId);
            if (method === undefined) {
                return message;
            } else {
                return this[method] (client, message);
            }
        } else {
            return this.handleWsOrderBookAndTrades (client, message);
        }
    }
};
