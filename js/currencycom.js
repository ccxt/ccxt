'use strict';

//  ---------------------------------------------------------------------------

const ccxt = require ('ccxt');
const { NotSupported } = require ('ccxt/js/base/errors');
const { ArrayCache } = require ('./base/Cache');

//  ---------------------------------------------------------------------------

module.exports = class currencycom extends ccxt.currencycom {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchTicker': true,
                'watchTickers': false, // for now
                'watchTrades': true,
                'watchOrderBook': true,
                // 'watchStatus': true,
                // 'watchHeartbeat': true,
                'watchOHLCV': true,
            },
            'urls': {
                'api': {
                    'ws': 'wss://api-adapter.backend.currency.com/connect',
                },
            },
            'options': {
                'tradesLimit': 1000,
                'OHLCVLimit': 1000,
            },
        });
    }

    handleTicker (client, message, subscription) {
        //
        //     {
        //         status: 'OK',
        //         correlationId: '1',
        //         payload: {
        //             tickers: [
        //                 {
        //                     symbol: '1COV',
        //                     priceChange: '-0.29',
        //                     priceChangePercent: '-0.80',
        //                     prevClosePrice: '36.33',
        //                     lastPrice: '36.04',
        //                     openPrice: '36.33',
        //                     highPrice: '36.46',
        //                     lowPrice: '35.88',
        //                     openTime: 1595548800000,
        //                     closeTime: 1595795305401
        //                 }
        //             ]
        //         }
        //     }
        //
        const symbol = this.safeString (subscription, 'symbol');
        const name = this.safeString (subscription, 'name');
        const messageHash = name + ':' + symbol;
        const market = this.market (symbol);
        const payload = this.safeValue (message, 'payload');
        const tickers = this.safeValue (payload, 'tickers', []);
        for (let i = 0; i < tickers.length; i++) {
            const ticker = this.parseTicker (tickers[i], market);
            this.tickers[symbol] = ticker;
            client.resolve (ticker, messageHash);
            if (messageHash in client.subscriptions) {
                delete client.subscriptions[messageHash];
            }
        }
    }

    async watchBalance (params = {}) {
        await this.loadMarkets ();
        throw new NotSupported (this.id + ' watchBalance() not implemented yet');
    }

    handleTrades (client, message, subscription) {
        let i = 1;
        i = i + 1;
        client.resolve (i, 'foobar');
        //
        //     {
        //         status: 'OK',
        //         correlationId: '1',
        //         payload: {
        //             aggTrades: [
        //                 { a: 1598766162, p: '10053.2', q: '0.0', T: 1595816894580, m: false },
        //                 { a: 1598699844, p: '10061.75', q: '0.001', T: 1595816460425, m: false },
        //                 { a: 1598138315, p: '10100', q: '0.022', T: 1595813323689, m: true },
        //             ]
        //         }
        //     }
        //
        // const symbol = this.safeString (subscription, 'symbol');
        // const name = this.safeString (subscription, 'name');
        // const messageHash = name + ':' + symbol;
        // const market = this.market (symbol);
        // const payload = this.safeValue (message, 'payload');
        // const since = this.safeInteger (payload, 'startTime');
        // const limit = this.safeInteger (payload, 'limit');
        // const rawTrades = this.safeValue (payload, 'aggTrades', []);
        // const trades = this.parseTrades (rawTrades, market, since, limit);
        //
        //     [
        //         0, // channelID
        //         [ //     price        volume         time             side type misc
        //             [ "5541.20000", "0.15850568", "1534614057.321597", "s", "l", "" ],
        //             [ "6060.00000", "0.02455000", "1534614057.324998", "b", "l", "" ],
        //         ],
        //         "trade",
        //         "XBT/USD"
        //     ]
        //
        // const wsName = this.safeString (message, 3);
        // const name = this.safeString (message, 2);
        // const messageHash = name + ':' + wsName;
        // const market = this.safeValue (this.options['marketsByWsName'], wsName);
        // const symbol = market['symbol'];
        // let stored = this.safeValue (this.trades, symbol);
        // if (stored === undefined) {
        //     const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
        //     stored = new ArrayCache (limit);
        //     this.trades[symbol] = stored;
        // }
        // const trades = this.safeValue (message, 1, []);
        // const parsed = this.parseTrades (trades, market);
        // for (let i = 0; i < parsed.length; i++) {
        //     stored.append (parsed[i]);
        // }
        // client.resolve (stored, messageHash);
    }

    findTimeframe (timeframe) {
        const keys = Object.keys (this.timeframes);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            if (this.timeframes[key] === timeframe) {
                return key;
            }
        }
        return undefined;
    }

    handleOHLCV (client, message, subscription) {
        //
        //     [
        //         216, // channelID
        //         [
        //             '1574454214.962096', // Time, seconds since epoch
        //             '1574454240.000000', // End timestamp of the interval
        //             '0.020970', // Open price at midnight UTC
        //             '0.020970', // Intraday high price
        //             '0.020970', // Intraday low price
        //             '0.020970', // Closing price at midnight UTC
        //             '0.020970', // Volume weighted average price
        //             '0.08636138', // Accumulated volume today
        //             1, // Number of trades today
        //         ],
        //         'ohlc-1', // Channel Name of subscription
        //         'ETH/XBT', // Asset pair
        //     ]
        //
        const info = this.safeValue (subscription, 'subscription', {});
        const interval = this.safeInteger (info, 'interval');
        const name = this.safeString (info, 'name');
        const wsName = this.safeString (message, 3);
        const market = this.safeValue (this.options['marketsByWsName'], wsName);
        const symbol = market['symbol'];
        const timeframe = this.findTimeframe (interval);
        const duration = this.parseTimeframe (timeframe);
        if (timeframe !== undefined) {
            const candle = this.safeValue (message, 1);
            const messageHash = name + ':' + timeframe + ':' + wsName;
            let timestamp = this.safeFloat (candle, 1);
            timestamp -= duration;
            const result = [
                parseInt (timestamp * 1000),
                this.safeFloat (candle, 2),
                this.safeFloat (candle, 3),
                this.safeFloat (candle, 4),
                this.safeFloat (candle, 5),
                this.safeFloat (candle, 7),
            ];
            this.ohlcvs[symbol] = this.safeValue (this.ohlcvs, symbol, {});
            let stored = this.safeValue (this.ohlcvs[symbol], timeframe);
            if (stored === undefined) {
                const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
                stored = new ArrayCache (limit);
                this.ohlcvs[symbol][timeframe] = stored;
            }
            const length = stored.length;
            if (length && result[0] === stored[length - 1][0]) {
                stored[length - 1] = result;
            } else {
                stored.append (result);
            }
            client.resolve (stored, messageHash);
        }
    }

    requestId () {
        const reqid = this.sum (this.safeInteger (this.options, 'correlationId', 0), 1);
        this.options['correlationId'] = reqid;
        return reqid;
    }

    async watchPublic (name, symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const messageHash = name + ':' + symbol;
        const url = this.urls['api']['ws'];
        const requestId = this.requestId ().toString ();
        const request = this.deepExtend (params, {
            'destination': name,
            'correlationId': requestId,
            'payload': {
                'symbols': [ market['id'] ],
            },
        });
        const subscription = this.extend (request, {
            'messageHash': messageHash,
            'symbol': symbol,
            'name': name,
        });
        return await this.watch (url, messageHash, request, messageHash, subscription);
    }

    async watchTicker (symbol, params = {}) {
        return await this.watchPublic ('/api/v1/ticker/24hr', symbol, params);
    }

    async watchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        const future = this.watchPublic ('trades.subscribe', symbol, params);
        return await this.after (future, this.filterBySinceLimit, since, limit, 'timestamp', true);
    }

    async watchOrderBook (symbol, limit = undefined, params = {}) {
        const future = this.watchPublic ('depthMarketData.subscribe', symbol, params);
        return await this.after (future, this.limitOrderBook, symbol, limit, params);
    }

    handleDeltas (bookside, deltas) {
        const prices = Object.keys (deltas);
        for (let i = 0; i < prices.length; i++) {
            const price = parseFloat (prices[i]);
            const amount = parseFloat (deltas[price]);
            bookside.store (price, amount);
        }
    }

    handleOrderBook (client, message) {
        //
        //     {
        //         status: 'OK',
        //         destination: 'marketdepth.event',
        //         payload: {
        //             data: '{"ts":1596235401337,"bid":{"11366.85":0.2500,"11366.1":5.0000,"11365.6":0.5000,"11363.0":2.0000},"ofr":{"11366.9":0.2500,"11367.65":5.0000,"11368.15":0.5000}}',
        //             symbol: 'BTC/USD_LEVERAGE'
        //         }
        //     }
        //
        const payload = this.safeValue (message, 'payload');
        let data = this.safeString (payload, 'data');
        if (data === undefined) {
            data = payload;
        } else {
            data = JSON.parse (data);
        }
        const marketId = this.safeString (payload, 'symbol');
        let market = undefined;
        let symbol = undefined;
        if (marketId !== undefined) {
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
                symbol = market['id'];
            } else {
                symbol = marketId;
            }
        }
        const name = 'depthMarketData.subscribe'; // this.safeString (subscription, 'destination');
        const messageHash = name + ':' + symbol;
        const timestamp = this.safeInteger (data, 'ts');
        let orderbook = this.safeValue (this.orderbooks, symbol);
        if (orderbook === undefined) {
            orderbook = this.orderBook ();
        }
        orderbook.reset ({
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        });
        const bids = this.safeValue (data, 'bid', {});
        const asks = this.safeValue (data, 'ofr', {});
        this.handleDeltas (orderbook['bids'], bids);
        this.handleDeltas (orderbook['asks'], asks);
        this.orderbooks[symbol] = orderbook;
        client.resolve (orderbook, messageHash);
    }

    signMessage (client, messageHash, message, params = {}) {
        // todo: signMessage not implemented yet
        return message;
    }

    handleMessage (client, message) {
        //
        //     {
        //         status: 'OK',
        //         correlationId: '1',
        //         payload: {
        //             tickers: [
        //                 {
        //                     symbol: '1COV',
        //                     priceChange: '-0.29',
        //                     priceChangePercent: '-0.80',
        //                     prevClosePrice: '36.33',
        //                     lastPrice: '36.04',
        //                     openPrice: '36.33',
        //                     highPrice: '36.46',
        //                     lowPrice: '35.88',
        //                     openTime: 1595548800000,
        //                     closeTime: 1595795305401
        //                 }
        //             ]
        //         }
        //     }
        //
        //     {
        //         status: 'OK',
        //         destination: 'marketdepth.event',
        //         payload: {
        //             data: '{"ts":1596235401337,"bid":{"11366.85":0.2500,"11366.1":5.0000,"11365.6":0.5000,"11363.0":2.0000},"ofr":{"11366.9":0.2500,"11367.65":5.0000,"11368.15":0.5000}}',
        //             symbol: 'BTC/USD_LEVERAGE'
        //         }
        //     }
        //
        const requestId = this.safeString (message, 'correlationId');
        if (requestId !== undefined) {
            const subscriptionsById = this.indexBy (client.subscriptions, 'correlationId');
            const status = this.safeString (message, 'status');
            const subscription = this.safeValue (subscriptionsById, requestId);
            if (subscription !== undefined) {
                if (status === 'OK') {
                    const name = this.safeString (subscription, 'name');
                    if (name !== undefined) {
                        const methods = {
                            '/api/v1/aggTrades': this.handleTrades,
                            '/api/v1/ticker/24hr': this.handleTicker,
                            '/api/v1/klines': this.handleOHCLV,
                        };
                        const method = this.safeValue (methods, name);
                        if (method === undefined) {
                            return message;
                        } else {
                            return method.call (this, client, message, subscription);
                        }
                    }
                }
            }
        }
        const destination = this.safeString (message, 'destination');
        if (destination !== undefined) {
            const methods = {
                'marketdepth.event': this.handleOrderBook,
            };
            const method = this.safeValue (methods, destination);
            if (method === undefined) {
                return message;
            } else {
                return method.call (this, client, message);
            }
        }
    }
};
