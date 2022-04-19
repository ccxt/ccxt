'use strict';

//  ---------------------------------------------------------------------------

const ccxt = require ('ccxt');
const { NotSupported } = require ('ccxt/js/base/errors');
const Precise = require ('ccxt/js/base/Precise');
const { ArrayCache, ArrayCacheByTimestamp } = require ('./base/Cache');

//  ---------------------------------------------------------------------------

module.exports = class phemex extends ccxt.phemex {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchTicker': true,
                'watchTickers': false, // for now
                'watchTrades': true,
                'watchOrderBook': true,
                'watchOHLCV': true,
            },
            'urls': {
                'test': {
                    'ws': 'wss://testnet.phemex.com/ws',
                },
                'api': {
                    'ws': 'wss://phemex.com/ws',
                },
            },
            'options': {
                'tradesLimit': 1000,
                'OHLCVLimit': 1000,
            },
            'streaming': {
                'keepAlive': 20000,
            },
        });
    }

    fromEn (en, scale) {
        if (en === undefined) {
            return undefined;
        }
        const precise = new Precise (en);
        precise.decimals = this.sum (precise.decimals, scale);
        precise.reduce ();
        return precise.toString ();
    }

    fromEp (ep, market = undefined) {
        if ((ep === undefined) || (market === undefined)) {
            return ep;
        }
        return this.fromEn (ep, this.safeInteger (market, 'priceScale'));
    }

    fromEv (ev, market = undefined) {
        if ((ev === undefined) || (market === undefined)) {
            return ev;
        }
        return this.fromEn (ev, this.safeInteger (market, 'valueScale'));
    }

    fromEr (er, market = undefined) {
        if ((er === undefined) || (market === undefined)) {
            return er;
        }
        return this.fromEn (er, this.safeInteger (market, 'ratioScale'));
    }

    requestId () {
        const requestId = this.sum (this.safeInteger (this.options, 'requestId', 0), 1);
        this.options['requestId'] = requestId;
        return requestId;
    }

    parseSwapTicker (ticker, market = undefined) {
        //
        //     {
        //         close: 442800,
        //         fundingRate: 10000,
        //         high: 445400,
        //         indexPrice: 442621,
        //         low: 428400,
        //         markPrice: 442659,
        //         open: 432200,
        //         openInterest: 744183,
        //         predFundingRate: 10000,
        //         symbol: 'LTCUSD',
        //         turnover: 8133238294,
        //         volume: 934292
        //     }
        //
        const marketId = this.safeString (ticker, 'symbol');
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        const timestamp = this.safeIntegerProduct (ticker, 'timestamp', 0.000001);
        const lastString = this.fromEp (this.safeString (ticker, 'close'), market);
        const last = this.parseNumber (lastString);
        const quoteVolume = this.parseNumber (this.fromEv (this.safeString (ticker, 'turnover'), market));
        const baseVolume = this.parseNumber (this.fromEv (this.safeString (ticker, 'volume'), market));
        let change = undefined;
        let percentage = undefined;
        let average = undefined;
        const openString = this.omitZero (this.fromEp (this.safeString (ticker, 'open'), market));
        const open = this.parseNumber (openString);
        if ((openString !== undefined) && (lastString !== undefined)) {
            change = this.parseNumber (Precise.stringSub (lastString, openString));
            average = this.parseNumber (Precise.stringDiv (Precise.stringAdd (lastString, openString), '2'));
            percentage = this.parseNumber (Precise.stringMul (Precise.stringSub (Precise.stringDiv (lastString, openString), '1'), '100'));
        }
        const result = {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.parseNumber (this.fromEp (this.safeString (ticker, 'high'), market)),
            'low': this.parseNumber (this.fromEp (this.safeString (ticker, 'low'), market)),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': open,
            'close': last,
            'last': last,
            'previousClose': undefined, // previous day close
            'change': change,
            'percentage': percentage,
            'average': average,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        };
        return result;
    }

    handleTicker (client, message) {
        //
        //     {
        //         spot_market24h: {
        //             askEp: 958148000000,
        //             bidEp: 957884000000,
        //             highEp: 962000000000,
        //             lastEp: 958220000000,
        //             lowEp: 928049000000,
        //             openEp: 935597000000,
        //             symbol: 'sBTCUSDT',
        //             turnoverEv: 146074214388978,
        //             volumeEv: 15492228900
        //         },
        //         timestamp: 1592847265888272100
        //     }
        //
        // swap
        //
        //     {
        //         market24h: {
        //             close: 442800,
        //             fundingRate: 10000,
        //             high: 445400,
        //             indexPrice: 442621,
        //             low: 428400,
        //             markPrice: 442659,
        //             open: 432200,
        //             openInterest: 744183,
        //             predFundingRate: 10000,
        //             symbol: 'LTCUSD',
        //             turnover: 8133238294,
        //             volume: 934292
        //         },
        //         timestamp: 1592845585373374500
        //     }
        //
        let name = 'market24h';
        let ticker = this.safeValue (message, name);
        let result = undefined;
        if (ticker === undefined) {
            name = 'spot_market24h';
            ticker = this.safeValue (message, name);
            result = this.parseTicker (ticker);
        } else {
            result = this.parseSwapTicker (ticker);
        }
        const symbol = result['symbol'];
        const messageHash = name + ':' + symbol;
        const timestamp = this.safeIntegerProduct (message, 'timestamp', 0.000001);
        result['timestamp'] = timestamp;
        result['datetime'] = this.iso8601 (timestamp);
        this.tickers[symbol] = result;
        client.resolve (result, messageHash);
    }

    async watchBalance (params = {}) {
        await this.loadMarkets ();
        const messageHash = 'balance';
        return await this.subscribePrivate (messageHash, params);
    }

    handleBalance (client, message) {
        //
        //  [
        //       {
        //         accountBalanceEv: 0,
        //         accountID: 26472240001,
        //         bonusBalanceEv: 0,
        //         currency: 'BTC',
        //         totalUsedBalanceEv: 0,
        //         userID: 2647224
        //       }
        //  ]
        //
        for (let i = 0; i < message.length; i++) {
            const balance = message[i];
            const currencyId = this.safeString (balance, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const currency = this.safeValue (this.currencies, code, {});
            const scale = this.safeInteger (currency, 'valueScale', 8);
            const account = this.account ();
            const usedEv = this.safeString (balance, 'totalUsedBalanceEv');
            const totalEv = this.safeString (balance, 'accountBalanceEv');
            account['used'] = this.fromEn (usedEv, scale);
            account['total'] = this.fromEn (usedEv, totalEv);
            this.balance[code] = account;
            this.balance = this.safeBalance (this.balance);
        }
        client.resolve (this.balance, 'balance');
    }

    handleTrades (client, message) {
        //
        //     {
        //         sequence: 1795484727,
        //         symbol: 'sBTCUSDT',
        //         trades: [
        //             [ 1592891002064516600, 'Buy', 964020000000, 1431000 ],
        //             [ 1592890978987934500, 'Sell', 963704000000, 1401800 ],
        //             [ 1592890972918701800, 'Buy', 963938000000, 2018600 ],
        //         ],
        //         type: 'snapshot'
        //     }
        //
        const name = 'trade';
        const marketId = this.safeString (message, 'symbol');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const messageHash = name + ':' + symbol;
        let stored = this.safeValue (this.trades, symbol);
        if (stored === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            stored = new ArrayCache (limit);
            this.trades[symbol] = stored;
        }
        const trades = this.safeValue (message, 'trades', []);
        const parsed = this.parseTrades (trades, market);
        for (let i = 0; i < parsed.length; i++) {
            stored.append (parsed[i]);
        }
        client.resolve (stored, messageHash);
    }

    handleOHLCV (client, message) {
        //
        //     {
        //         kline: [
        //             [ 1592905200, 60, 960688000000, 960709000000, 960709000000, 960400000000, 960400000000, 848100, 8146756046 ],
        //             [ 1592905140, 60, 960718000000, 960716000000, 960717000000, 960560000000, 960688000000, 4284900, 41163743512 ],
        //             [ 1592905080, 60, 960513000000, 960684000000, 960718000000, 960684000000, 960718000000, 4880500, 46887494349 ],
        //         ],
        //         sequence: 1804401474,
        //         symbol: 'sBTCUSDT',
        //         type: 'snapshot'
        //     }
        //
        const name = 'kline';
        const marketId = this.safeString (message, 'symbol');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const candles = this.safeValue (message, name, []);
        const first = this.safeValue (candles, 0, []);
        const interval = this.safeString (first, 1);
        const timeframe = this.findTimeframe (interval);
        if (timeframe !== undefined) {
            const messageHash = name + ':' + timeframe + ':' + symbol;
            const ohlcvs = this.parseOHLCVs (candles, market);
            this.ohlcvs[symbol] = this.safeValue (this.ohlcvs, symbol, {});
            let stored = this.safeValue (this.ohlcvs[symbol], timeframe);
            if (stored === undefined) {
                const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
                stored = new ArrayCacheByTimestamp (limit);
                this.ohlcvs[symbol][timeframe] = stored;
            }
            for (let i = 0; i < ohlcvs.length; i++) {
                const candle = ohlcvs[i];
                stored.append (candle);
            }
            client.resolve (stored, messageHash);
        }
    }

    async watchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const name = market['spot'] ? 'spot_market24h' : 'market24h';
        const url = this.urls['api']['ws'];
        const requestId = this.requestId ();
        const subscriptionHash = name + '.subscribe';
        const messageHash = name + ':' + symbol;
        const subscribe = {
            'method': subscriptionHash,
            'id': requestId,
            'params': [],
        };
        const request = this.deepExtend (subscribe, params);
        return await this.watch (url, messageHash, request, subscriptionHash);
    }

    async watchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const url = this.urls['api']['ws'];
        const requestId = this.requestId ();
        const name = 'trade';
        const messageHash = name + ':' + symbol;
        const method = name + '.subscribe';
        const subscribe = {
            'method': method,
            'id': requestId,
            'params': [
                market['id'],
            ],
        };
        const request = this.deepExtend (subscribe, params);
        const trades = await this.watch (url, messageHash, request, messageHash);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    async watchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const url = this.urls['api']['ws'];
        const requestId = this.requestId ();
        const name = 'orderbook';
        const messageHash = name + ':' + symbol;
        const method = name + '.subscribe';
        const subscribe = {
            'method': method,
            'id': requestId,
            'params': [
                market['id'],
            ],
        };
        const request = this.deepExtend (subscribe, params);
        const orderbook = await this.watch (url, messageHash, request, messageHash);
        return orderbook.limit (limit);
    }

    async watchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const url = this.urls['api']['ws'];
        const requestId = this.requestId ();
        const name = 'kline';
        const messageHash = name + ':' + timeframe + ':' + symbol;
        const method = name + '.subscribe';
        const subscribe = {
            'method': method,
            'id': requestId,
            'params': [
                market['id'],
                this.safeInteger (this.timeframes, timeframe),
            ],
        };
        const request = this.deepExtend (subscribe, params);
        const ohlcv = await this.watch (url, messageHash, request, messageHash);
        if (this.newUpdates) {
            limit = ohlcv.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (ohlcv, since, limit, 0, true);
    }

    handleDelta (bookside, delta, market = undefined) {
        const bidAsk = this.parseBidAsk (delta, 0, 1, market);
        bookside.storeArray (bidAsk);
    }

    handleDeltas (bookside, deltas, market = undefined) {
        for (let i = 0; i < deltas.length; i++) {
            this.handleDelta (bookside, deltas[i], market);
        }
    }

    handleOrderBook (client, message) {
        //
        //     {
        //         book: {
        //             asks: [
        //                 [ 960316000000, 6993800 ],
        //                 [ 960318000000, 13183000 ],
        //                 [ 960319000000, 9170200 ],
        //             ],
        //             bids: [
        //                 [ 959941000000, 8385300 ],
        //                 [ 959939000000, 10296600 ],
        //                 [ 959930000000, 3672400 ],
        //             ]
        //         },
        //         depth: 30,
        //         sequence: 1805784701,
        //         symbol: 'sBTCUSDT',
        //         timestamp: 1592908460404461600,
        //         type: 'snapshot'
        //     }
        //
        const marketId = this.safeString (message, 'symbol');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const type = this.safeString (message, 'type');
        const depth = this.safeInteger (message, 'depth');
        const name = 'orderbook';
        const messageHash = name + ':' + symbol;
        const nonce = this.safeInteger (message, 'sequence');
        const timestamp = this.safeIntegerProduct (message, 'timestamp', 0.000001);
        if (type === 'snapshot') {
            const book = this.safeValue (message, 'book', {});
            const snapshot = this.parseOrderBook (book, symbol, timestamp, 'bids', 'asks', 0, 1, market);
            snapshot['nonce'] = nonce;
            const orderbook = this.orderBook (snapshot, depth);
            this.orderbooks[symbol] = orderbook;
            client.resolve (orderbook, messageHash);
        } else {
            const orderbook = this.safeValue (this.orderbooks, symbol);
            if (orderbook !== undefined) {
                const changes = this.safeValue (message, 'book', {});
                const asks = this.safeValue (changes, 'asks', []);
                const bids = this.safeValue (changes, 'bids', []);
                this.handleDeltas (orderbook['asks'], asks, market);
                this.handleDeltas (orderbook['bids'], bids, market);
                orderbook['nonce'] = nonce;
                orderbook['timestamp'] = timestamp;
                orderbook['datetime'] = this.iso8601 (timestamp);
                this.orderbooks[symbol] = orderbook;
                client.resolve (orderbook, messageHash);
            }
        }
    }

    handleMessage (client, message) {
        // private update
        // {
        //     sequence: 83839628,
        //     timestamp: '1650382581827447829',
        //     type: 'snapshot',
        //     accounts: [
        //       {
        //         accountBalanceEv: 0,
        //         accountID: 26472240001,
        //         bonusBalanceEv: 0,
        //         currency: 'BTC',
        //         totalUsedBalanceEv: 0,
        //         userID: 2647224
        //       }
        //     ],
        //     orders: [],
        //     positions: [
        //       {
        //         accountID: 26472240001,
        //         assignedPosBalanceEv: 0,
        //         avgEntryPriceEp: 0,
        //         bankruptCommEv: 0,
        //         bankruptPriceEp: 0,
        //         buyLeavesQty: 0,
        //         buyLeavesValueEv: 0,
        //         buyValueToCostEr: 1150750,
        //         createdAtNs: 0,
        //         crossSharedBalanceEv: 0,
        //         cumClosedPnlEv: 0,
        //         cumFundingFeeEv: 0,
        //         cumTransactFeeEv: 0,
        //         curTermRealisedPnlEv: 0,
        //         currency: 'BTC',
        //         dataVer: 2,
        //         deleveragePercentileEr: 0,
        //         displayLeverageEr: 10000000000,
        //         estimatedOrdLossEv: 0,
        //         execSeq: 0,
        //         freeCostEv: 0,
        //         freeQty: 0,
        //         initMarginReqEr: 1000000,
        //         lastFundingTime: '1640601827712091793',
        //         lastTermEndTime: 0,
        //         leverageEr: 0,
        //         liquidationPriceEp: 0,
        //         maintMarginReqEr: 500000,
        //         makerFeeRateEr: 0,
        //         markPriceEp: 507806777,
        //         orderCostEv: 0,
        //         posCostEv: 0,
        //         positionMarginEv: 0,
        //         positionStatus: 'Normal',
        //         riskLimitEv: 10000000000,
        //         sellLeavesQty: 0,
        //         sellLeavesValueEv: 0,
        //         sellValueToCostEr: 1149250,
        //         side: 'None',
        //         size: 0,
        //         symbol: 'BTCUSD',
        //         takerFeeRateEr: 0,
        //         term: 1,
        //         transactTimeNs: 0,
        //         unrealisedPnlEv: 0,
        //         updatedAtNs: 0,
        //         usedBalanceEv: 0,
        //         userID: 2647224,
        //         valueEv: 0
        //       }
        //     ]
        // }
        const id = this.safeInteger (message, 'id');
        if (id !== undefined) {
            const subscriptionsById = this.indexBy (client.subscriptions, 'id');
            const subscription = this.safeValue (subscriptionsById, id, {});
            const method = this.safeValue (subscription, 'method');
            if (method !== undefined) {
                method.call (this, client, message);
                return;
            }
        }
        if (('market24h' in message) || ('spot_market24h' in message)) {
            return this.handleTicker (client, message);
        } else if ('trades' in message) {
            return this.handleTrades (client, message);
        } else if ('kline' in message) {
            return this.handleOHLCV (client, message);
        } else if ('book' in message) {
            return this.handleOrderBook (client, message);
        } else if ('accounts' in message) {
            const accounts = this.safeValue (message, 'accounts', []);
            const length = accounts.length;
            if (length > 0) {
                this.handleBalance (client, accounts);
            }
        } else {
            //
            //     { error: null, id: 1, result: { status: 'success' } }
            //
            return message;
        }
    }

    handleAuthenticate (client, message) {
        //
        // {
        //     "error": null,
        //     "id": 1234,
        //     "result": {
        //       "status": "success"
        //     }
        // }
        //
        client.resolve (message, 'authenticated');
        return message;
    }

    async subscribePrivate (messageHash, params = {}) {
        await this.loadMarkets ();
        await this.authenticate ();
        const url = this.urls['api']['ws'];
        const requestId = this.seconds ();
        const channel = 'aop.subscribe';
        let request = {
            'id': requestId,
            'method': channel,
            'params': [],
        };
        request = this.extend (request, params);
        const subscription = {
            'id': requestId,
            'messageHash': messageHash,
        };
        return await this.watch (url, messageHash, request, channel, subscription);
    }

    async authenticate (params = {}) {
        this.checkRequiredCredentials ();
        const url = this.urls['api']['ws'];
        const client = this.client (url);
        const time = this.seconds ();
        const messageHash = 'authenticated';
        let future = this.safeValue (client.subscriptions, messageHash);
        if (future === undefined) {
            future = client.future (messageHash);
            const expiryDelta = this.safeInteger (this.options, 'expires', 120);
            const expiration = this.seconds () + expiryDelta;
            const payload = this.apiKey + expiration.toString ();
            const signature = this.hmac (this.encode (payload), this.encode (this.secret), 'sha256');
            const request = {
                'method': 'user.auth',
                'params': [ 'API', this.apiKey, signature, expiration],
                'id': time,
            };
            const subscription = {
                'id': time,
                'method': this.handleAuthenticate,
            };
            this.spawn (this.watch, url, messageHash, request, messageHash, subscription);
        }
        return await future;
    }
};
