'use strict';

//  ---------------------------------------------------------------------------

const currencycomRest = require ('../currencycom.js');
const Precise = require ('../base/Precise');
const { ArrayCache, ArrayCacheByTimestamp } = require ('./base/Cache');

//  ---------------------------------------------------------------------------

module.exports = class currencycom extends currencycomRest {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchBalance': true,
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
                // WS timeframes differ from REST timeframes
                'timeframes': {
                    '1m': 'M1',
                    '3m': 'M3',
                    '5m': 'M5',
                    '15m': 'M15',
                    '30m': 'M30',
                    '1h': 'H1',
                    '4h': 'H4',
                    '1d': 'D1',
                    '1w': 'W1',
                },
            },
            'streaming': {
                // okex does not support built-in ws protocol-level ping-pong
                // instead it requires a custom text-based ping-pong
                'ping': this.ping,
                'keepAlive': 20000,
            },
        });
    }

    ping (client) {
        // custom ping-pong
        const requestId = this.requestId ().toString ();
        return {
            'destination': 'ping',
            'correlationId': requestId,
            'payload': {},
        };
    }

    handlePong (client, message) {
        client.lastPong = this.milliseconds ();
        return message;
    }

    handleBalance (client, message, subscription) {
        //
        //     {
        //         status: 'OK',
        //         correlationId: '1',
        //         payload: {
        //             makerCommission: 0.2,
        //             takerCommission: 0.2,
        //             buyerCommission: 0.2,
        //             sellerCommission: 0.2,
        //             canTrade: true,
        //             canWithdraw: true,
        //             canDeposit: true,
        //             updateTime: 1596742699,
        //             balances: [
        //                 {
        //                     accountId: 5470306579272968,
        //                     collateralCurrency: true,
        //                     asset: 'ETH',
        //                     free: 0,
        //                     locked: 0,
        //                     default: false
        //                 },
        //                 {
        //                     accountId: 5470310874305732,
        //                     collateralCurrency: true,
        //                     asset: 'USD',
        //                     free: 47.82576735,
        //                     locked: 1.187925,
        //                     default: true
        //                 },
        //             ]
        //         }
        //     }
        //
        const payload = this.safeValue (message, 'payload');
        const balance = this.parseBalance (payload);
        this.balance = this.extend (this.balance, balance);
        const messageHash = this.safeString (subscription, 'messageHash');
        client.resolve (this.balance, messageHash);
        if (messageHash in client.subscriptions) {
            delete client.subscriptions[messageHash];
        }
    }

    handleTicker (client, message, subscription) {
        //
        //     {
        //         status: 'OK',
        //         correlationId: '1',
        //         payload: {
        //             tickers: [
        //                 {
        //                     symbol: 'BTC/USD_LEVERAGE',
        //                     priceChange: '484.05',
        //                     priceChangePercent: '4.14',
        //                     weightedAvgPrice: '11682.83',
        //                     prevClosePrice: '11197.70',
        //                     lastPrice: '11682.80',
        //                     lastQty: '0.25',
        //                     bidPrice: '11682.80',
        //                     askPrice: '11682.85',
        //                     openPrice: '11197.70',
        //                     highPrice: '11734.05',
        //                     lowPrice: '11080.95',
        //                     volume: '299.133',
        //                     quoteVolume: '3488040.3465',
        //                     openTime: 1596585600000,
        //                     closeTime: 1596654452674
        //                 }
        //             ]
        //         }
        //     }
        //
        const destination = '/api/v1/ticker/24hr';
        const payload = this.safeValue (message, 'payload');
        const tickers = this.safeValue (payload, 'tickers', []);
        for (let i = 0; i < tickers.length; i++) {
            const ticker = this.parseTicker (tickers[i]);
            const symbol = ticker['symbol'];
            this.tickers[symbol] = ticker;
            const messageHash = destination + ':' + symbol;
            client.resolve (ticker, messageHash);
            if (messageHash in client.subscriptions) {
                delete client.subscriptions[messageHash];
            }
        }
    }

    handleTrade (trade, market = undefined) {
        //
        //     {
        //         price: 11668.55,
        //         size: 0.001,
        //         id: 1600300736,
        //         ts: 1596653426822,
        //         symbol: 'BTC/USD_LEVERAGE',
        //         orderId: '00a02503-0079-54c4-0000-00004020163c',
        //         clientOrderId: '00a02503-0079-54c4-0000-482f0000754f',
        //         buyer: false
        //     }
        //
        const marketId = this.safeString (trade, 'symbol');
        const symbol = this.safeSymbol (marketId, undefined, '/');
        const timestamp = this.safeInteger (trade, 'ts');
        const priceString = this.safeString (trade, 'price');
        const amountString = this.safeString (trade, 'size');
        const cost = this.parseNumber (Precise.stringMul (priceString, amountString));
        const price = this.parseNumber (priceString);
        const amount = this.parseNumber (amountString);
        const id = this.safeString2 (trade, 'id');
        const orderId = this.safeString (trade, 'orderId');
        const buyer = this.safeValue (trade, 'buyer');
        const side = buyer ? 'buy' : 'sell';
        return {
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': id,
            'order': orderId,
            'type': undefined,
            'takerOrMaker': undefined,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': undefined,
        };
    }

    handleTrades (client, message, subscription) {
        //
        //     {
        //         status: 'OK',
        //         destination: 'internal.trade',
        //         payload: {
        //             price: 11668.55,
        //             size: 0.001,
        //             id: 1600300736,
        //             ts: 1596653426822,
        //             symbol: 'BTC/USD_LEVERAGE',
        //             orderId: '00a02503-0079-54c4-0000-00004020163c',
        //             clientOrderId: '00a02503-0079-54c4-0000-482f0000754f',
        //             buyer: false
        //         }
        //     }
        //
        const payload = this.safeValue (message, 'payload');
        const parsed = this.handleTrade (payload);
        const symbol = parsed['symbol'];
        // const destination = this.safeString (message, 'destination');
        const destination = 'trades.subscribe';
        const messageHash = destination + ':' + symbol;
        let stored = this.safeValue (this.trades, symbol);
        if (stored === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            stored = new ArrayCache (limit);
            this.trades[symbol] = stored;
        }
        stored.append (parsed);
        client.resolve (stored, messageHash);
    }

    findTimeframe (timeframe) {
        const timeframes = this.safeValue (this.options, 'timeframes');
        const keys = Object.keys (timeframes);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            if (timeframes[key] === timeframe) {
                return key;
            }
        }
        return undefined;
    }

    handleOHLCV (client, message) {
        //
        //     {
        //         status: 'OK',
        //         destination: 'ohlc.event',
        //         payload: {
        //             interval: 'M1',
        //             symbol: 'BTC/USD_LEVERAGE',
        //             t: 1596650940000,
        //             h: 11670.05,
        //             l: 11658.1,
        //             o: 11668.55,
        //             c: 11666.05
        //         }
        //     }
        //
        // const destination = this.safeString (message, 'destination');
        const destination = 'OHLCMarketData.subscribe';
        const payload = this.safeValue (message, 'payload', {});
        const interval = this.safeString (payload, 'interval');
        const timeframe = this.findTimeframe (interval);
        const marketId = this.safeString (payload, 'symbol');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const messageHash = destination + ':' + timeframe + ':' + symbol;
        const result = [
            this.safeInteger (payload, 't'),
            this.safeNumber (payload, 'o'),
            this.safeNumber (payload, 'h'),
            this.safeNumber (payload, 'l'),
            this.safeNumber (payload, 'c'),
            undefined, // no volume v in OHLCV
        ];
        this.ohlcvs[symbol] = this.safeValue (this.ohlcvs, symbol, {});
        let stored = this.safeValue (this.ohlcvs[symbol], timeframe);
        if (stored === undefined) {
            const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
            stored = new ArrayCacheByTimestamp (limit);
            this.ohlcvs[symbol][timeframe] = stored;
        }
        stored.append (result);
        client.resolve (stored, messageHash);
    }

    requestId () {
        const reqid = this.sum (this.safeInteger (this.options, 'correlationId', 0), 1);
        this.options['correlationId'] = reqid;
        return reqid;
    }

    async watchPublic (destination, symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const messageHash = destination + ':' + symbol;
        const url = this.urls['api']['ws'];
        const requestId = this.requestId ().toString ();
        const request = this.deepExtend ({
            'destination': destination,
            'correlationId': requestId,
            'payload': {
                'symbols': [ market['id'] ],
            },
        }, params);
        const subscription = this.extend (request, {
            'messageHash': messageHash,
            'symbol': symbol,
        });
        return await this.watch (url, messageHash, request, messageHash, subscription);
    }

    async watchPrivate (destination, params = {}) {
        await this.loadMarkets ();
        const messageHash = '/api/v1/account';
        const url = this.urls['api']['ws'];
        const requestId = this.requestId ().toString ();
        const payload = {
            'timestamp': this.milliseconds (),
            'apiKey': this.apiKey,
        };
        const auth = this.urlencode (this.keysort (payload));
        const request = this.deepExtend ({
            'destination': destination,
            'correlationId': requestId,
            'payload': payload,
        }, params);
        request['payload']['signature'] = this.hmac (this.encode (auth), this.encode (this.secret));
        const subscription = this.extend (request, {
            'messageHash': messageHash,
        });
        return await this.watch (url, messageHash, request, messageHash, subscription);
    }

    async watchBalance (params = {}) {
        /**
         * @method
         * @name currencycom#watchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} params extra parameters specific to the currencycom api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.loadMarkets ();
        return await this.watchPrivate ('/api/v1/account', params);
    }

    async watchTicker (symbol, params = {}) {
        /**
         * @method
         * @name currencycom#watchTicker
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the currencycom api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const destination = '/api/v1/ticker/24hr';
        const messageHash = destination + ':' + symbol;
        const url = this.urls['api']['ws'];
        const requestId = this.requestId ().toString ();
        const request = this.deepExtend ({
            'destination': destination,
            'correlationId': requestId,
            'payload': {
                'symbol': market['id'],
            },
        }, params);
        const subscription = this.extend (request, {
            'messageHash': messageHash,
            'symbol': symbol,
        });
        return await this.watch (url, messageHash, request, messageHash, subscription);
    }

    async watchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name currencycom#watchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the currencycom api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        symbol = this.symbol (symbol);
        const trades = await this.watchPublic ('trades.subscribe', symbol, params);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    async watchOrderBook (symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name currencycom#watchOrderBook
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the currencycom api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        symbol = this.symbol (symbol);
        const orderbook = await this.watchPublic ('depthMarketData.subscribe', symbol, params);
        return orderbook.limit ();
    }

    async watchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name currencycom#watchOHLCV
         * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
         * @param {int|undefined} limit the maximum amount of candles to fetch
         * @param {object} params extra parameters specific to the currencycom api endpoint
         * @returns {[[int]]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        symbol = this.symbol (symbol);
        const destination = 'OHLCMarketData.subscribe';
        const messageHash = destination + ':' + timeframe;
        const timeframes = this.safeValue (this.options, 'timeframes');
        const request = {
            'destination': destination,
            'payload': {
                'intervals': [
                    timeframes[timeframe],
                ],
            },
        };
        const ohlcv = await this.watchPublic (messageHash, symbol, this.extend (request, params));
        if (this.newUpdates) {
            limit = ohlcv.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (ohlcv, since, limit, 0, true);
    }

    handleDeltas (bookside, deltas) {
        const prices = Object.keys (deltas);
        for (let i = 0; i < prices.length; i++) {
            const price = prices[i];
            const amount = deltas[price];
            bookside.store (parseFloat (price), parseFloat (amount));
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
        const payload = this.safeValue (message, 'payload', {});
        const data = this.safeValue (payload, 'data', {});
        const marketId = this.safeString (payload, 'symbol');
        const symbol = this.safeSymbol (marketId, undefined, '/');
        // const destination = this.safeString (message, 'destination');
        const destination = 'depthMarketData.subscribe';
        const messageHash = destination + ':' + symbol;
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
        //     {
        //         status: 'OK',
        //         destination: 'internal.trade',
        //         payload: {
        //             price: 11634.75,
        //             size: 0.001,
        //             id: 1605492357,
        //             ts: 1596263802399,
        //             instrumentId: 45076691096786110,
        //             orderId: '00a02503-0079-54c4-0000-0000401fff51',
        //             clientOrderId: '00a02503-0079-54c4-0000-482b00002f17',
        //             buyer: false
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
                    const destination = this.safeString (subscription, 'destination');
                    if (destination !== undefined) {
                        const methods = {
                            '/api/v1/ticker/24hr': this.handleTicker,
                            '/api/v1/account': this.handleBalance,
                        };
                        const method = this.safeValue (methods, destination);
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
                'internal.trade': this.handleTrades,
                'ohlc.event': this.handleOHLCV,
                'ping': this.handlePong,
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
