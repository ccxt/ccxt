'use strict';

//  ---------------------------------------------------------------------------

const zbRest = require ('../zb.js');
const { ExchangeError, AuthenticationError, NotSupported } = require ('../base/errors');
const { ArrayCache, ArrayCacheByTimestamp } = require ('./base/Cache');

//  ---------------------------------------------------------------------------

module.exports = class zb extends zbRest {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchOrderBook': true,
                'watchTicker': true,
                'watchTrades': true,
                'watchOHLCV': true,
            },
            'urls': {
                'api': {
                    'ws': {
                        'spot': 'wss://api.{hostname}/websocket',
                        'contract': 'wss://fapi.{hostname}/ws/public/v1',
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

    async watchPublic (url, messageHash, symbol, method, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const type = market['spot'] ? 'spot' : 'contract';
        let request = undefined;
        const isLimitSet = limit !== undefined;
        if (type === 'spot') {
            request = {
                'event': 'addChannel',
                'channel': messageHash,
            };
            if (isLimitSet) {
                request['length'] = limit;
            }
        } else {
            request = {
                'action': 'subscribe',
                'channel': messageHash,
            };
            if (isLimitSet) {
                request['size'] = limit;
            }
        }
        const message = this.extend (request, params);
        const subscription = {
            'symbol': symbol,
            'messageHash': messageHash,
            'method': method,
        };
        if (isLimitSet) {
            subscription['limit'] = limit;
        }
        return await this.watch (url, messageHash, message, messageHash, subscription);
    }

    async watchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        let messageHash = undefined;
        const type = market['spot'] ? 'spot' : 'contract';
        if (type === 'spot') {
            messageHash = market['baseId'] + market['quoteId'] + '_' + 'ticker';
        } else {
            messageHash = market['id'] + '.' + 'Ticker';
        }
        const url = this.implodeHostname (this.urls['api']['ws'][type]);
        return await this.watchPublic (url, messageHash, symbol, this.handleTicker, undefined, params);
    }

    parseWsTicker (ticker, market = undefined) {
        //
        // contract ticker
        //      {
        //          data: [
        //            38568.36, // open
        //            39958.75, // high
        //            38100, // low
        //            39211.78, // last
        //            61695.496, // volume 24h
        //            1.67, // change
        //            1647369457, // time
        //            285916.615048
        //          ]
        //    }
        //
        const timestamp = this.safeInteger (ticker, 6);
        const last = this.safeString (ticker, 3);
        return this.safeTicker ({
            'symbol': this.safeSymbol (undefined, market),
            'timestamp': timestamp,
            'datetime': undefined,
            'high': this.safeString (ticker, 1),
            'low': this.safeString (ticker, 2),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': this.safeString (ticker, 0),
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': this.safeString (ticker, 5),
            'average': undefined,
            'baseVolume': this.safeString (ticker, 4),
            'quoteVolume': undefined,
            'info': ticker,
        }, market, false);
    }

    handleTicker (client, message, subscription) {
        //
        // spot ticker
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
        // contract ticker
        //      {
        //          channel: 'BTC_USDT.Ticker',
        //          data: [
        //            38568.36,
        //            39958.75,
        //            38100,
        //            39211.78,
        //            61695.496,
        //            1.67,
        //            1647369457,
        //            285916.615048
        //          ]
        //      }
        //
        const symbol = this.safeString (subscription, 'symbol');
        const channel = this.safeString (message, 'channel');
        const market = this.market (symbol);
        let data = this.safeValue (message, 'ticker');
        let ticker = undefined;
        if (data === undefined) {
            data = this.safeValue (message, 'data', []);
            ticker = this.parseWsTicker (data, market);
        } else {
            data['date'] = this.safeValue (message, 'date');
            ticker = this.parseTicker (data, market);
        }
        ticker['symbol'] = symbol;
        this.tickers[symbol] = ticker;
        client.resolve (ticker, channel);
        return message;
    }

    async watchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (market['spot']) {
            throw new NotSupported (this.id + ' watchOHLCV() supports contract markets only');
        }
        if ((limit === undefined) || (limit > 1440)) {
            limit = 100;
        }
        const interval = this.timeframes[timeframe];
        const messageHash = market['id'] + '.KLine' + '_' + interval;
        const url = this.implodeHostname (this.urls['api']['ws']['contract']);
        const ohlcv = await this.watchPublic (url, messageHash, symbol, this.handleOHLCV, limit, params);
        if (this.newUpdates) {
            limit = ohlcv.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (ohlcv, since, limit, 0, true);
    }

    handleOHLCV (client, message, subscription) {
        //
        // snapshot update
        //    {
        //        channel: 'BTC_USDT.KLine_1m',
        //        type: 'Whole',
        //        data: [
        //          [ 48543.77, 48543.77, 48542.82, 48542.82, 0.43, 1640227260 ],
        //          [ 48542.81, 48542.81, 48529.89, 48529.89, 1.202, 1640227320 ],
        //          [ 48529.95, 48529.99, 48529.85, 48529.9, 4.226, 1640227380 ],
        //          [ 48529.96, 48529.99, 48525.11, 48525.11, 8.858, 1640227440 ],
        //          [ 48525.05, 48525.05, 48464.17, 48476.63, 32.772, 1640227500 ],
        //          [ 48475.62, 48485.65, 48475.12, 48479.36, 20.04, 1640227560 ],
        //        ]
        //    }
        // partial update
        //    {
        //        channel: 'BTC_USDT.KLine_1m',
        //        data: [
        //          [ 39095.45, 45339.48, 36923.58, 39204.94, 1215304.988, 1645920000 ]
        //        ]
        //    }
        //
        const data = this.safeValue (message, 'data', []);
        const channel = this.safeString (message, 'channel', '');
        const parts = channel.split ('_');
        const partsLength = parts.length;
        const interval = this.safeString (parts, partsLength - 1);
        const timeframe = this.findTimeframe (interval);
        const symbol = this.safeString (subscription, 'symbol');
        const market = this.market (symbol);
        for (let i = 0; i < data.length; i++) {
            const candle = data[i];
            const parsed = this.parseOHLCV (candle, market);
            this.ohlcvs[symbol] = this.safeValue (this.ohlcvs, symbol, {});
            let stored = this.safeValue (this.ohlcvs[symbol], timeframe);
            if (stored === undefined) {
                const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
                stored = new ArrayCacheByTimestamp (limit);
                this.ohlcvs[symbol][timeframe] = stored;
            }
            stored.append (parsed);
            client.resolve (stored, channel);
        }
        return message;
    }

    async watchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        let messageHash = undefined;
        const type = market['spot'] ? 'spot' : 'contract';
        if (type === 'spot') {
            messageHash = market['baseId'] + market['quoteId'] + '_' + 'trades';
        } else {
            messageHash = market['id'] + '.' + 'Trade';
        }
        const url = this.implodeHostname (this.urls['api']['ws'][type]);
        const trades = await this.watchPublic (url, messageHash, symbol, this.handleTrades, limit, params);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    handleTrades (client, message, subscription) {
        // contract trades
        // {
        //     "channel":"BTC_USDT.Trade",
        //     "type":"Whole",
        //     "data":[
        //        [
        //           40768.07,
        //           0.01,
        //           1,
        //           1647442757
        //        ],
        //        [
        //           40792.22,
        //           0.334,
        //           -1,
        //           1647442765
        //        ],
        //        [
        //           40789.77,
        //           0.14,
        //           1,
        //           1647442766
        //        ]
        //     ]
        //  }
        // spot trades
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
        const type = this.safeString (message, 'type');
        let trades = [];
        if (type === 'Whole') {
            // contract trades
            for (let i = 0; i < data.length; i++) {
                const trade = data[i];
                const parsed = this.parseWsTrade (trade, market);
                trades.push (parsed);
            }
        } else {
            // spot trades
            trades = this.parseTrades (data, market);
        }
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
            if ((limit !== 5) && (limit !== 10)) {
                throw new ExchangeError (this.id + ' watchOrderBook limit argument must be undefined, 5, or 10');
            }
        } else {
            limit = 5; // default
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const type = market['spot'] ? 'spot' : 'contract';
        let messageHash = undefined;
        let url = this.implodeHostname (this.urls['api']['ws'][type]);
        if (type === 'spot') {
            url += '/' + market['baseId'];
            messageHash = market['baseId'] + market['quoteId'] + '_' + 'quick_depth';
        } else {
            messageHash = market['id'] + '.' + 'Depth';
        }
        const orderbook = await this.watchPublic (url, messageHash, symbol, this.handleOrderBook, limit, params);
        return orderbook.limit ();
    }

    parseWsTrade (trade, market = undefined) {
        //
        //    [
        //       40768.07, // price
        //       0.01, // quantity
        //       1, // buy or -1 sell
        //       1647442757 // time
        //    ],
        //
        const timestamp = this.safeTimestamp (trade, 3);
        const price = this.safeString (trade, 0);
        const amount = this.safeString (trade, 1);
        market = this.safeMarket (undefined, market);
        const sideNumber = this.safeInteger (trade, 2);
        const side = (sideNumber === 1) ? 'buy' : 'sell';
        return this.safeTrade ({
            'id': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'order': undefined,
            'type': undefined,
            'side': side,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'fee': undefined,
            'info': trade,
        }, market);
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
        // For contract markets zb will:
        // 1: send snapshot
        // 2: send deltas
        // 3: repeat 1-2
        // So we have a guarentee that deltas
        // are always updated and arrive after
        // the snapshot
        //
        const type = this.safeString2 (message, 'type', 'dataType');
        const channel = this.safeString (message, 'channel');
        const symbol = this.safeString (subscription, 'symbol');
        let orderbook = this.safeValue (this.orderbooks, symbol);
        if (type !== undefined) {
            // handle orderbook snapshot
            const isContractSnapshot = (type === 'Whole');
            const data = isContractSnapshot ? this.safeValue (message, 'data') : message;
            const timestamp = this.safeInteger2 (data, 'lastTime', 'time');
            const asksKey = isContractSnapshot ? 'asks' : 'listUp';
            const bidsKey = isContractSnapshot ? 'bids' : 'listDown';
            const snapshot = this.parseOrderBook (data, symbol, timestamp, bidsKey, asksKey);
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
            client.resolve (orderbook, channel);
        } else {
            this.handleOrderBookMessage (client, message, orderbook);
            client.resolve (orderbook, channel);
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
        const timestamp = this.safeInteger (data, 'time');
        const asks = this.safeValue (data, 'asks', []);
        const bids = this.safeValue (data, 'bids', []);
        this.handleDeltas (orderbook['asks'], asks);
        this.handleDeltas (orderbook['bids'], bids);
        orderbook['timestamp'] = timestamp;
        orderbook['datetime'] = this.iso8601 (timestamp);
        return orderbook;
    }

    handleDelta (bookside, delta) {
        const price = this.safeFloat (delta, 0);
        const amount = this.safeFloat (delta, 1);
        bookside.store (price, amount);
    }

    handleDeltas (bookside, deltas) {
        for (let i = 0; i < deltas.length; i++) {
            this.handleDelta (bookside, deltas[i]);
        }
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
        //
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

    handleErrorMessage (client, message) {
        //
        // { errorCode: 10020, errorMsg: "action param can't be empty" }
        // { errorCode: 10015, errorMsg: '无效的签名(1002)' }
        //
        const errorCode = this.safeString (message, 'errorCode');
        try {
            if (errorCode !== undefined) {
                const feedback = this.id + ' ' + this.json (message);
                this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
                const messageString = this.safeValue (message, 'message');
                if (messageString !== undefined) {
                    this.throwBroadlyMatchedException (this.exceptions['broad'], messageString, feedback);
                }
            }
        } catch (e) {
            if (e instanceof AuthenticationError) {
                client.reject (e, 'authenticated');
                const method = 'login';
                if (method in client.subscriptions) {
                    delete client.subscriptions[method];
                }
                return false;
            }
        }
        return message;
    }
};
