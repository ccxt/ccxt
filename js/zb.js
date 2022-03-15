'use strict';

//  ---------------------------------------------------------------------------

const ccxt = require ('ccxt');
const { ExchangeError } = require ('ccxt/js/base/errors');
const { ArrayCache } = require ('./base/Cache');

//  ---------------------------------------------------------------------------

module.exports = class zb extends ccxt.zb {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchOrderBook': true,
                'watchTicker': true,
                'watchTrades': true,
            },
            'urls': {
                'api': {
                    'ws': {
                        'spot': 'wss://api.zb.work/websocket',
                        'contract': 'wss://fapi.zb.com/ws/public/v1',
                    },
                },
            },
            'options': {
                'tradesLimit': 1000,
                'ordersLimit': 1000,
                'OHLCVLimit': 1000,
            },
        });
    }

    async watchPublic (url, messageHash, symbol, method, request, params = {}) {
        const subscription = {
            // 'name': name,
            'symbol': symbol,
            'messageHash': messageHash,
            'method': method,
        };
        const message = this.extend (request, params);
        return await this.watch (url, messageHash, message, messageHash, subscription);
    }

    async watchTicker (symbol, params = {}) {
        const market = this.market (symbol);
        const messageHash = market['baseId'] + market['quoteId'] + '_' + 'ticker';
        return await this.watchPublic (market['type'], messageHash, symbol, this.handleTicker, params);
    }

    handleTicker (client, message, subscription) {
        //
        //     {
        //         date: '1624398991255',
        //         ticker: {
        //             high: '33298.38',
        //             vol: '56375.9469',
        //             last: '32396.95',
        //             low: '28808.19',
        //             buy: '32395.81',
        //             sell: '32409.3',
        //             turnover: '1771122527.0000',
        //             open: '31652.44',
        //             riseRate: '2.36'
        //         },
        //         dataType: 'ticker',
        //         channel: 'btcusdt_ticker'
        //     }
        //
        const symbol = this.safeString (subscription, 'symbol');
        const channel = this.safeString (message, 'channel');
        const market = this.market (symbol);
        const data = this.safeValue (message, 'ticker');
        data['date'] = this.safeValue (message, 'date');
        const ticker = this.parseTicker (data, market);
        ticker['symbol'] = symbol;
        this.tickers[symbol] = ticker;
        client.resolve (ticker, channel);
        return message;
    }

    async watchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        const trades = await this.watchPublic ('trades', symbol, this.handleTrades, params);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    handleTrades (client, message, subscription) {
        //
        //     {
        //         data: [
        //             { date: 1624537147, amount: '0.0357', price: '34066.11', trade_type: 'bid', type: 'buy', tid: 1718857158 },
        //             { date: 1624537147, amount: '0.0255', price: '34071.04', trade_type: 'bid', type: 'buy', tid: 1718857159 },
        //             { date: 1624537147, amount: '0.0153', price: '34071.29', trade_type: 'bid', type: 'buy', tid: 1718857160 }
        //         ],
        //         dataType: 'trades',
        //         channel: 'btcusdt_trades'
        //     }
        //
        const channel = this.safeValue (message, 'channel');
        const symbol = this.safeString (subscription, 'symbol');
        const market = this.market (symbol);
        const data = this.safeValue (message, 'data');
        const trades = this.parseTrades (data, market);
        let array = this.safeValue (this.trades, symbol);
        if (array === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            array = new ArrayCache (limit);
        }
        for (let i = 0; i < trades.length; i++) {
            array.append (trades[i]);
        }
        this.trades[symbol] = array;
        client.resolve (array, channel);
    }

    async watchOrderBook (symbol, limit = undefined, params = {}) {
        if (limit !== undefined) {
            if ((limit !== 5) && (limit !== 10) && (limit !== 20)) {
                throw new ExchangeError (this.id + ' watchOrderBook limit argument must be undefined, 5, 10 or 20');
            }
        } else {
            limit = 5; // default
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const type = market['spot'] ? 'spot' : 'contract';
        let request = undefined;
        let messageHash = undefined;
        let url = this.urls['api']['ws'][type];
        if (market['type'] === 'spot') {
            url += '/' + market['baseId'];
            const name = 'quick_depth';
            messageHash = market['baseId'] + market['quoteId'] + '_' + name;
            request = {
                'event': 'addChannel',
                'channel': messageHash,
                'length': limit,
            };
        } else {
            const name = 'Depth';
            messageHash = market['id'] + '.' + name;
            request = {
                'action': 'subscribe',
                'channel': messageHash,
                'size': limit,
            };
        }
        const subscription = {
            'symbol': symbol,
            'messageHash': messageHash,
            'limit': limit,
            'method': this.handleOrderBook,
        };
        const message = this.extend (request, params);
        const orderbook = await this.watch (url, messageHash, message, messageHash, subscription);
        return orderbook.limit (limit);
    }

    handleOrderBook (client, message, subscription) {
        // spot snapshot
        //
        //     {
        //         lastTime: 1624524640066,
        //         dataType: 'quickDepth',
        //         channel: 'btcusdt_quick_depth',
        //         currentPrice: 33183.79,
        //         listDown: [
        //             [ 33166.87, 0.2331 ],
        //             [ 33166.86, 0.15 ],
        //             [ 33166.76, 0.15 ],
        //             [ 33161.02, 0.212 ],
        //             [ 33146.35, 0.6066 ]
        //         ],
        //         market: 'btcusdt',
        //         listUp: [
        //             [ 33186.88, 0.15 ],
        //             [ 33190.1, 0.15 ],
        //             [ 33193.03, 0.2518 ],
        //             [ 33195.05, 0.2031 ],
        //             [ 33199.99, 0.6066 ]
        //         ],
        //         high: 34816.8,
        //         rate: '6.484',
        //         low: 32312.41,
        //         currentIsBuy: true,
        //         dayNumber: 26988.5536,
        //         totalBtc: 26988.5536,
        //         showMarket: 'btcusdt'
        //     }
        //
        // contract snapshot
        // {
        //     channel: 'BTC_USDT.Depth',
        //     type: 'Whole',
        //     data: {
        //       asks: [ [Array], [Array], [Array], [Array], [Array] ],
        //       bids: [ [Array], [Array], [Array], [Array], [Array] ],
        //       time: '1647359998198'
        //     }
        //   }
        //
        // contract deltas
        // {
        //     channel: 'BTC_USDT.Depth',
        //     data: {
        //       bids: [ [Array], [Array], [Array], [Array] ],
        //       asks: [ [Array], [Array], [Array] ],
        //       time: '1647360038079'
        //     }
        //  }
        //
        const type = this.safeString2 (message, 'type', 'dataType');
        const channel = this.safeString (message, 'channel');
        const symbol = this.safeString (subscription, 'symbol');
        let orderbook = this.safeValue (this.orderbooks, symbol);
        if (type !== undefined) {
            // handle orderbook snapshot
            const timestamp = this.safeInteger2 (message, 'lastTime', 'time');
            const asksKey = (type === 'whole') ? 'asks' : 'listUp';
            const bidsKey = (type === 'whole') ? 'bids' : 'listDown';
            const snapshot = this.parseOrderBook (message, symbol, timestamp, asksKey, bidsKey);
            if (!(symbol in this.orderbooks)) {
                const defaultLimit = this.safeInteger (this.options, 'watchOrderBookLimit', 1000);
                const limit = this.safeInteger (subscription, 'limit', defaultLimit);
                orderbook = this.orderBook (snapshot, limit);
                this.orderbooks[symbol] = orderbook;
            } else {
                orderbook = this.orderbooks[symbol];
                orderbook.reset (snapshot);
            }
            orderbook['symbol'] = symbol;
            if (type === 'whole') {
                // unroll the accumulated deltas for contract markets
                const messages = orderbook.cache;
                for (let i = 0; i < messages.length; i++) {
                    const message = messages[i];
                    this.handleOrderBookMessage (client, message, orderbook);
                }
            }
            client.resolve (orderbook, channel);
        } else {
            // handle deltas for contract markets
            const nonce = this.safeInteger (orderbook, 'nonce');
            if (nonce === undefined) {
                orderbook.cache.push (message);
            } else {
                this.handleOrderBookMessage (client, message, orderbook);
                client.resolve (orderbook, channel);
            }
        }
    }

    handleOrderBookMessage (client, message, orderbook) {
        //
        // {
        //     channel: 'BTC_USDT.Depth',
        //     data: {
        //       bids: [ [Array], [Array], [Array], [Array] ],
        //       asks: [ [Array], [Array], [Array] ],
        //       time: '1647360038079'
        //     }
        //  }
        //
        const data = this.safeValue (message, 'data', {});
        const seqNum = this.safeInteger (data, 'time');
        if (seqNum > orderbook['nonce']) {
            const asks = this.safeValue (data, 'asks', []);
            const bids = this.safeValue (data, 'bids', []);
            this.handleDeltas (orderbook['asks'], asks);
            this.handleDeltas (orderbook['bids'], bids);
            orderbook['nonce'] = seqNum;
            orderbook['timestamp'] = seqNum;
            orderbook['datetime'] = this.iso8601 (seqNum);
        }
        return orderbook;
    }

    handleMessage (client, message) {
        //
        //
        //     {
        //         no: '0',
        //         code: 1007,
        //         success: false,
        //         channel: 'btc_usdt_ticker',
        //         message: 'Channel is empty'
        //     }
        //
        //     {
        //         date: '1624398991255',
        //         ticker: {
        //             high: '33298.38',
        //             vol: '56375.9469',
        //             last: '32396.95',
        //             low: '28808.19',
        //             buy: '32395.81',
        //             sell: '32409.3',
        //             turnover: '1771122527.0000',
        //             open: '31652.44',
        //             riseRate: '2.36'
        //         },
        //         dataType: 'ticker',
        //         channel: 'btcusdt_ticker'
        //     }
        //
        //     {
        //         data: [
        //             { date: 1624537147, amount: '0.0357', price: '34066.11', trade_type: 'bid', type: 'buy', tid: 1718857158 },
        //             { date: 1624537147, amount: '0.0255', price: '34071.04', trade_type: 'bid', type: 'buy', tid: 1718857159 },
        //             { date: 1624537147, amount: '0.0153', price: '34071.29', trade_type: 'bid', type: 'buy', tid: 1718857160 }
        //         ],
        //         dataType: 'trades',
        //         channel: 'btcusdt_trades'
        //     }
        //
        // contract snapshot
        // {
        //     channel: 'BTC_USDT.Depth',
        //     type: 'Whole',
        //     data: {
        //       asks: [ [Array], [Array], [Array], [Array], [Array] ],
        //       bids: [ [Array], [Array], [Array], [Array], [Array] ],
        //       time: '1647359998198'
        //     }
        //   }
        // contract deltas update
        // {
        //     channel: 'BTC_USDT.Depth',
        //     data: {
        //       bids: [ [Array], [Array], [Array], [Array] ],
        //       asks: [ [Array], [Array], [Array] ],
        //       time: '1647360038079'
        //     }
        //   }
        //
        const dataType = this.safeString (message, 'dataType');
        if (dataType !== undefined) {
            const channel = this.safeString (message, 'channel');
            const subscription = this.safeValue (client.subscriptions, channel);
            if (subscription !== undefined) {
                const method = this.safeValue (subscription, 'method');
                if (method !== undefined) {
                    return method.call (this, client, message, subscription);
                }
            }
            return message;
        }
        const type = this.safeString (message, 'type');
        if (type === 'Whole') {
            this.handleOrderBookSnapshot (client, message);
            return;
        }
        const channel = this.safeString (message, 'channel');
        if (channel.indexOf ('Depth') !== -1) {
            this.handleOrderBookMessage (client, message);
        }
    }
};
