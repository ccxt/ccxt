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
                        'future': 'wss://fapi.zb.com/ws/public/v1',
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
        const type = market['type'];
        let request = undefined;
        let messageHash = market['baseId'] + market['quoteId'];
        let url = this.urls['api']['ws'][type];
        if (market['type'] === 'spot') {
            url += '/' + market['baseId'];
            const name = 'quick_depth';
            messageHash += '_' + name;
            request = {
                'event': 'addChannel',
                'channel': messageHash,
                'length': limit,
            };
        } else {
            const name = 'Depth';
            messageHash += '.' + name;
            request = {
                'event': 'addChannel',
                'channel': messageHash,
                'size': limit,
            };
        }
        const orderbook = await this.watchPublic (url, messageHash, this.handleOrderBook, request, params);
        return orderbook.limit (limit);
    }

    handleOrderBook (client, message, subscription) {
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
        const channel = this.safeString (message, 'channel');
        const limit = this.safeInteger (subscription, 'limit');
        const symbol = this.safeString (subscription, 'symbol');
        let orderbook = this.safeValue (this.orderbooks, symbol);
        if (orderbook === undefined) {
            orderbook = this.orderBook ({}, limit);
            this.orderbooks[symbol] = orderbook;
        }
        const timestamp = this.safeInteger (message, 'lastTime');
        const parsed = this.parseOrderBook (message, symbol, timestamp, 'listDown', 'listUp');
        orderbook.reset (parsed);
        orderbook['symbol'] = symbol;
        client.resolve (orderbook, channel);
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
    }
};
