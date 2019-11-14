'use strict';

//  ---------------------------------------------------------------------------

const ccxt = require ('ccxt');
const IncrementalOrderBook = require ('./base/OrderBook');

//  ---------------------------------------------------------------------------

module.exports = class poloniex extends ccxt.poloniex {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
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

    getWsMessageHash (client, response) {
        const channelId = response[0].toString ();
        const length = response.length;
        if (length <= 2) {
            return;
        }
        if (channelId === '1002') {
            return channelId + response[2][0].toString ();
        } else {
            return channelId;
        }
    }

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

    async fetchWsTicker (symbol) {
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
        return await this.sendWsMessage (this.handleWsOrderBook, url, numericId, {
            'command': 'subscribe',
            'channel': numericId,
        });
        // return await this.WsOrderBookMessage (url, numericId, {
        //     'command': 'subscribe',
        //     'channel': numericId,
        // });
    }

    handleWsOrderBook (orderbook) {
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
        //                         { // asks
        //                             "0.00001853": "2537.5637", // price, size
        //                             "0.00001854": "1567238.172367"
        //                         },
        //                         { // bids
        //                             "0.00001841": "3645.3647",
        //                             "0.00001840": "1637.3647"
        //                         }
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
        const marketId = orderbook[0].toString ();
        const nonce = orderbook[1];
        const data = orderbook[2];
        const market = this.safeValue (this.options['marketsByNumericId'], marketId);
        const symbol = this.safeString (market, 'symbol');
        const deltas = [];
        for (let i = 0; i < data.length; i++) {
            let delta = data[i];
            if (delta[0] === 'i') {
                const snapshot = delta[1]['orderBook'];
                const asks = snapshot[0];
                const bids = snapshot[1];
                this.orderbooks[symbol] = new IncrementalOrderBook ({
                    'bids': this.parseBidAsk (bids),
                    'asks': this.parseBidAsk (asks),
                    'nonce': undefined,
                    'timestamp': undefined,
                    'datetime': undefined,
                });
            } else if (delta[0] === 'o') {
                const price = parseFloat (delta[2]);
                const amount = parseFloat (delta[3]);
                const operation = (amount === 0) ? 'delete' : 'add';
                const side = delta[1] ? 'bids' : 'asks';
                delta = [undefined, operation, side, price, amount];
                deltas.push (delta);
            }
        }

        // if (!(symbol in this.orderBooks)) {
        //
        // }
        const incrementalBook = this.orderBooks[symbol];
        incrementalBook.update (deltas);
        incrementalBook.orderBook['nonce'] = orderBook[1];
        return incrementalBook.orderBook;
    }

    parseBidAsk (bidasks) {
        const prices = Object.keys (bidasks);
        const result = [];
        for (let i = 0; i < prices.length; i++) {
            const price = prices[i];
            const amount = bidasks[price];
            result.push ([ parseFloat (price), parseFloat (amount) ]);
        }
        return result;
    }

    handleWsDropped (client, message, messageHash) {
        if (messageHash !== undefined && parseInt (messageHash) < 1000) {
            this.handleWsOrderBook (message);
        }
    }
};
