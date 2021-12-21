'use strict';

// ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired } = require ('./base/errors'); // , BadRequest, AuthenticationError, RateLimitExceeded, BadSymbol, InvalidOrder, InsufficientFunds, OrderNotFound, PermissionDenied
const { TICK_SIZE } = require ('./base/functions/number');
const Precise = require ('./base/Precise');
// ---------------------------------------------------------------------------

module.exports = class coinsbit extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'coinsbit',
            'name': 'Coinsbit',
            'countries': [ 'EE' ], // Estonia
            // 'rateLimit': 50, // default rate limit is 20 times per second
            'version': 1,
            'certified': false,
            'has': {
                'addMargin': undefined,
                'cancelAllOrders': undefined,
                'cancelOrder': undefined,
                'createMarketOrder': undefined,
                'createOrder': undefined,
                'fetchBalance': undefined,
                'fetchCanceledOrders': undefined,
                'fetchClosedOrders': undefined,
                // 'fetchCurrencies' doesn't exist, and will be 'emulated'
                'fetchDepositAddress': undefined,
                'fetchDeposits': undefined,
                'fetchFundingRateHistory': undefined,
                'fetchMarkets': true,
                // 'fetchMarketsByType': <-- i think fetchMarketsByType makes things complex, and might be totally removed from ccxt. There should be one 'fetchMarkets' imho. you can see another comment related to this matter under 'handleMarketTypeAndParams' function down below.
                'fetchMyTrades': undefined,
                'fetchOHLCV': true,
                'fetchOpenOrders': undefined,
                'fetchOrder': undefined,
                'fetchOrderBook': true,
                'fetchOrderTrades': undefined,
                'fetchPosition': undefined,
                'fetchPositions': undefined,
                'fetchStatus': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': false,
                'fetchTrades': true,
                'fetchWithdrawals': undefined,
                'reduceMargin': undefined,
                'setLeverage': undefined,
                'withdraw': undefined,
            },
            'timeframes': {
                '1m': 60, // works for max 12 hours diapason (between from-to)
                '30m': 1800, // for max 24 hours diapason
                '1h': 3600, // for max 7 days diapason
                '1d': 86400, // for any diapason
            },
            'urls': {
                'logo': '  <<< TODO >>>   https://upload.wikimedia.org/wikipedia/commons/8/8c/Coinsbit.png  ',
                'api': {
                    'spot': {
                        'public': 'https://coinsbit.io/api/',
                        'private': 'https://coinsbit.io/api/',
                    },
                },
                'www': 'https://coinsbit.io/',
                'doc': [
                    'https://www.notion.so/coinsbitwsapi/API-COINSBIT-WS-API-COINSBIT-cf1044cff30646d49a0bab0e28f27a87',
                    'https://github.com/Coinsbit-connect/api/wiki/API',
                ],
                'fees': [
                    'https://coinsbit.io/fee-schedule',
                ],
                'referral': '  <<< TODO >>>   ',
            },
            'api': {
                'spot': {
                    'public': {
                        'get': {
                            'markets': 1,
                            'tickers': 1,
                            'ticker': 1,
                            'book': 1,
                            'history': 1,
                            'history/result': 1,
                            'products': 1, // Of no use, everything already available in 'markets'
                            'symbols': 1, // Of no use, everything already available in 'markets'
                            'depth/result': 1,
                            'kline': 1,
                        },
                    },
                    'private': {
                        'get': {
                        },
                        'post': {
                            'order/new': 1,
                            'order/cancel': 1,
                            'orders': 1,
                            'account/balances': 1,
                            'account/balance': 1,
                            'account/order': 1,
                            'account/trades': 1,
                            'account/order_history': 1,
                            'account/order_history_list': 1,
                        },
                    },
                },
            },
            'precisionMode': TICK_SIZE,
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': 0.2 / 100,
                    'taker': 0.2 / 100,
                },
            },
            'options': {
                'fetchTradesMethod': 'spotPublicGetHistory', // spotPublicGetHistory | spotPublicGetHistoryResult
                'maxDiapasonsForTimeframes': {
                    '1m': 43200,
                    '30m': 86400,
                    '1h': 86400 * 7,
                    '1d': Number.MAX_SAFE_INTEGER,
                },
            },
            'commonCurrencies': {
                // 'xxx': 'xxxxxxx',
            },
            'exceptions': {
                'exact': {
                    // '400': BadRequest, // Invalid parameter
                    // '401': AuthenticationError, // Invalid signature, fail to pass the validation
                    // '429': RateLimitExceeded, // too many requests, rate limit rule is violated
                    // '1000': PermissionDenied, // {"success":false,"code":1000,"message":"Please open contract account first!"}
                    // '1002': InvalidOrder, // {"success":false,"code":1002,"message":"Contract not allow place order!"}
                    // '10072': AuthenticationError, // Invalid access key
                    // '10073': AuthenticationError, // Invalid request time
                    // '10216': InvalidAddress, // {"code":10216,"msg":"No available deposit address"}
                    // '10232': BadSymbol, // {"code":10232,"msg":"The currency not exist"}
                    // '30000': BadSymbol, // Trading is suspended for the requested symbol
                    // '30001': InvalidOrder, // Current trading type (bid or ask) is not allowed
                    // '30002': InvalidOrder, // Invalid trading amount, smaller than the symbol minimum trading amount
                    // '30003': InvalidOrder, // Invalid trading amount, greater than the symbol maximum trading amount
                    // '30004': InsufficientFunds, // Insufficient balance
                    // '30005': InvalidOrder, // Oversell error
                    // '30010': InvalidOrder, // Price out of allowed range
                    // '30016': BadSymbol, // Market is closed
                    // '30019': InvalidOrder, // Orders count over limit for batch processing
                    // '30020': BadSymbol, // Restricted symbol, API access is not allowed for the time being
                    // '30021': BadSymbol, // Invalid symbol
                    // '33333': BadSymbol, // {"code":33333,"msg":"currency can not be null"}
                },
                'broad': {
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        const [defaultType, request] = this.handleMarketTypeAndParams ('fetchMarkets', undefined, params); // Note: imho, I am against dividing methods according to types (like 'fetchSpotMarkets', 'fetchFuturesMarkets' and etc..) because there might be many types and exchanges, from time to time, add new types, thus it will need a never-ending 'new method' creations. I think that, independent to the exchange-type, everything should be done with one 'fetchXXX' functions - if there are multiple different types, they should be handled inside one 'fetchXXX' function (just by passing 'defaultType' parameter). That has also one advantage - the most of the 'return' object structure can be same and only a few property-values might need to be happening inside if-else blocks, thus will save multiple 'fetchSpotXXX', 'fetchFuturesXXX' functions to be written over-and-over again with same structure.
        let data = '';
        if (defaultType === 'spot') {
            const response = await this.spotPublicGetMarkets (request);
            //     {
            //         "success": true,
            //         "message": "",
            //         "result": [
            //             {
            //                 name: "BTC_USDT",
            //                 moneyPrec: "8",
            //                 stock: "BTC",
            //                 money: "USDT",
            //                 stockPrec: "8",
            //                 feePrec: "8",
            //                 minAmount: "0.001"
            //             },
            //             ...
            //          ],
            //         "code":"200",
            //
            data = this.safeValue (response, 'result', []);
        } else if (defaultType === 'futures') {
            // JUST FOR DEMONSTRATIONAL PURPOSES
            // const response = await this.futuresPublicGetMarkets (params);
            // i.e. : data = this.safeValue (response, 'result', []);
        }
        const result = [];
        for (let i = 0; i < data.length; i++) {
            const market = data[i];
            const id = this.safeString (market, 'name');
            const baseId = this.safeString (market, 'stock');
            const quoteId = this.safeString (market, 'money');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const priceScale = this.safeInteger (market, 'moneyPrec'); // <<< TODO >>>  strings 1e-8
            const quantityScale = this.safeInteger (market, 'stockPrec');
            const pricePrecision = 1 / Math.pow (10, priceScale);
            const quantityPrecision = 1 / Math.pow (10, quantityScale);
            const minAmount = this.safeNumber (market, 'minAmount');
            const type = 'spot';
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'type': type,
                'spot': defaultType === 'spot',
                'derivative': undefined,
                'contract': undefined,
                'linear': undefined,
                'inverse': undefined,
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'settle': undefined,
                'settleId': undefined,
                'margin': undefined,
                'active': undefined,
                'taker': undefined,
                'maker': undefined,
                'precision': {
                    'price': pricePrecision,
                    'amount': quantityPrecision,
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': {
                        'min': minAmount,
                        'max': undefined,
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'cost': {
                        'min': this.safeNumber (market, 'feePrec'),     // <<< TODO >>> I am not yet sure this is correct.
                        'max': undefined,
                    },
                },
                'info': market,
            });
        }
        return result;
    }

    async fetchTicker (symbol = undefined, params = {}) {
        const request = this.handleMarketTypeAndParams ('fetchTicker', undefined, params)[1];
        await this.loadMarkets ();
        const market = this.market (symbol);
        request['market'] = market['id'];
        let ticker = undefined;
        if (market['spot']) {
            const response = await this.spotPublicGetTicker (request);
            //     {
            //          success: true,
            //          message: "",
            //          result: {
            //            bid: '46504.7412435',
            //            ask: '46511.54203562',
            //            open: '47030.33',
            //            high: '47549.99',
            //            low: '45571.08',
            //            last: '46459.99',
            //            volume: '8372.29022355',
            //            deal: '388090406.73607745',
            //          },
            //          code: "200"
            //     }
            ticker = this.safeValue (response, 'result', {});
        }
        return this.parseTicker (ticker, market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        const [defaultType, request] = this.handleMarketTypeAndParams ('fetchTickers', undefined, params);
        await this.loadMarkets ();
        let tickers = {};
        if (defaultType === 'spot') {
            const response = await this.spotPublicGetTickers (request);
            //     {
            //          success: true,
            //          message: "",
            //          result: {
            //            BTC_USDT: {
            //               at: '1640028811',
            //               ticker: {
            //                 bid: '46448.49682539',
            //                 ask: '46458.41093569',
            //                 open: '46687.39',
            //                 high: '47550',
            //                 low: '45584.27',
            //                 last: '46462.77',
            //                 vol: '32.56275846',
            //                 deal: '1510574.62551143',
            //                 change: '-0'
            //               }
            //            },
            //            ...
            //          },
            //          code: "200"
            //     }
            tickers = this.safeValue (response, 'result', {});
            const result = [];
            const values = Object.values (tickers || []);
            const keys = Object.keys (tickers);
            for (let i = 0; i < values.length; i++) {
                const key = keys[i];
                const market = this.market (key);
                result.push (this.extend (this.parseTicker (values[i], market), params));
            }
            return this.filterByArray (result, 'symbol', symbols);
        }
    }
    parseTicker (ticker, market = undefined) {
        //       at: '1640028811',
        //       ticker: {
        //         bid: '46448.49682539',
        //         ask: '46458.41093569',
        //         open: '46687.39',
        //         high: '47550',
        //         low: '45584.27',
        //         last: '46462.77',
        //         vol: '32.56275846',
        //         deal: '1510574.62551143',
        //         change: '-0'
        //       }
        let tickerFinal = {};
        let timestamp = null;
        if ('ticker' in ticker) { // if arrived from fetchTickers
            tickerFinal = this.safeValue (ticker, 'ticker', {});
            timestamp = this.safeTimestamp (ticker, 'at');
        } else { // if arrived from fetchTicker, then there is nothing to be done more
            tickerFinal = ticker;
            timestamp = this.milliseconds ();
        }
        const last = this.safeNumber (tickerFinal, 'last');
        return this.safeTicker ({
            'symbol': market['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeNumber (tickerFinal, 'high'),
            'low': this.safeNumber (tickerFinal, 'low'),
            'bid': this.safeNumber (tickerFinal, 'bid'),
            'bidVolume': undefined,
            'ask': this.safeNumber (tickerFinal, 'ask'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': this.safeNumber (tickerFinal, 'open'),
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined, // They do have 'change' property, but atm,  for some reason, they always return "0 | -0 | -1 | -2" strange values. So, skipping for now.
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeNumber (tickerFinal, 'volume'),
            'quoteVolume': this.safeNumber (tickerFinal, 'deal'),
            'info': ticker,
        }, market);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        const request = this.handleMarketTypeAndParams ('fetchOrderBook', undefined, params)[1];
        await this.loadMarkets ();
        const market = this.market (symbol);
        request['market'] = market['id'];
        let orderbook = {};
        if (market['spot']) {
            if (limit !== undefined) {
                request['limit'] = Math.min (1000, limit); // this parameter is not required, default 50 will be returned
            }
            const type = this.safeString (params, 'type', 'bidsAsks'); // <<< TODO >> maybe a better way to set default unified param name (same param can be used for binance fetchBidsAsks too, if that will get integrated inside binance's fetchOrderbook )
            const method = this.safeString (this.options, 'fetchOrderBookMethod', type);
            if (method === 'bidsAsks') {
                const response = await this.spotPublicGetDepthResult (this.extend (request, params));
                //     {
                //         asks: [
                //             [  "46809.06069986", "2.651"  ],
                //             [  "46819.80796146", "2.6401" ],
                //             ...
                //         ],
                //         bids: [
                //             [  "46799.39054516",  "2.702" ],
                //             [  "46801.25196599",  "0.4"   ],
                //             ...
                //         ]
                //     }
                const priceKey = 0;
                const amountKey = 1;
                orderbook = this.parseOrderBook (response, symbol, undefined, 'bids', 'asks', priceKey, amountKey);
            } else if (method === 'book') {
                request['offset'] = this.safeString (params, 'offset', 0);
                // ATM, they need to call separately (unfortunately)
                request['side'] = this.safeString (params, 'side', 'buy');
                const requestBids = this.spotPublicGetBook (this.extend (request, params));
                request['side'] = this.safeString (params, 'side', 'sell');
                const requestAsks = this.spotPublicGetBook (this.extend (request, params));
                const responses = await Promise.all ([requestBids, requestAsks]);
                // FOR EACH (BUY/SELL) REQUEST, THE RESPONSE IS SIMILAR (JUST 'side' PROPERTY IS DIFFERENT BETWEEN THEM)
                //     {
                //         success: true,
                //         message: "",
                //         result: {
                //             offset: 0,
                //             limit: 2,
                //             total: 334,
                //             orders: [
                //                 {
                //                     id: 8620142523,
                //                     left: "1.56772",
                //                     market: "BTC_USDT",
                //                     amount: "1.56772",
                //                     type: "limit",
                //                     price: "46752.63032535",
                //                     timestamp: 1640031161.544,
                //                     side: "buy",
                //                     dealFee: "0",
                //                     takerFee: "0",
                //                     makerFee: "0",
                //                     dealStock: "0",
                //                     dealMoney: "0"
                //                 },
                //                 ...
                //             ]
                //         },
                //         code: 200
                //     }
                const resultBids = this.safeValue (responses[0], 'result', {});
                const resultAsks = this.safeValue (responses[1], 'result', {});
                const bids = this.safeValue (resultBids, 'orders', []);
                const asks = this.safeValue (resultAsks, 'orders', []);
                const response = { 'bids': bids, 'asks': asks };
                const priceKey = 'price';
                const amountKey = 'amount';
                orderbook = this.parseOrderBook (response, symbol, undefined, 'bids', 'asks', priceKey, amountKey);
            }
        }
        // orderbook['nonce']  <<< TODO >>> -- atm I dont know how to handle that, as the response doesn't have right that property
        return orderbook;
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        const request = this.handleMarketTypeAndParams ('fetchOHLCV', undefined, params)[1];
        await this.loadMarkets ();
        const market = this.market (symbol);
        request['market'] = market['id'];
        const duration = this.parseTimeframe (timeframe);
        const maxAllowedDiapason = this.options['maxDiapasonsForTimeframes'][timeframe];
        let maxRequestedMilliSeconds = null;
        if (limit === undefined) {
            maxRequestedMilliSeconds = maxAllowedDiapason * 1000;
        } else {
            maxRequestedMilliSeconds = Math.min (this.sum (limit, 1) * duration, maxAllowedDiapason) * 1000;
        }
        let response = null;
        if (market['spot']) {
            request['interval'] = this.timeframes[timeframe];
            const now = this.milliseconds ();
            let startTime = since;
            let endTime = this.sum (now, 1000); // At first, Let's add one second
            if (startTime === undefined) {
                startTime = endTime - maxRequestedMilliSeconds;
            } else {
                endTime = this.sum (startTime, maxRequestedMilliSeconds);
            }
            startTime = startTime / 1000;
            endTime = endTime / 1000;
            request['start'] = parseInt (startTime);
            request['end'] = parseInt (endTime);
            response = await this.spotPublicGetKline (this.extend (request, params));
            // {
            //     success: true,
            //     message: "",
            //     result: {
            //         market: "BTC_USDT",
            //         start: 1640000000,
            //         end: 1640001234,
            //         interval: 60,
            //         kline: [
            //             {
            //                 time: 1640000000,
            //                 open: "46979.18",
            //                 close: "46893.88",
            //                 highest: "46979.18",
            //                 lowest: "46893.88",
            //                 volume: "2.35947525",
            //                 amount: "110745.7371631963",
            //                 market: "BTC_USDT"
            //             },
            //             {
            //                 time: 1640000060,
            //                 ....
        }
        const result = this.safeValue (response, 'result', {});
        const data = this.safeValue (result, 'kline', []);
        return this.parseOHLCVs (data, market, timeframe, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        // the ordering in spot candles is OCHLV
        //
        //     {
        //         time: '1640051700',
        //         open: '46954.3',
        //         close: '46932.07',
        //         highest: '46960.75',
        //         lowest: '46932.07',
        //         volume: '1.6985718',
        //         amount: '79753.7310157163',
        //         market: 'BTC_USDT'
        //     }
        //
        // the ordering in swap / contract candles is OHLCV
        //
        if (market === undefined) {
            const marketId = this.safeString (ohlcv, 'market');
            market = this.market (marketId, market);
        }
        return [
            this.safeTimestamp (ohlcv, 'time'),
            this.safeNumber (ohlcv, 'open'),
            this.safeNumber (ohlcv, 'highest'),
            this.safeNumber (ohlcv, 'lowest'),
            this.safeNumber (ohlcv, 'close'),
            this.safeNumber (ohlcv, 'volume'), // At this moment, we do not make any use of 'amount' property
        ];
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        params = this.handleMarketTypeAndParams ('fetchOHLCV', undefined, params)[1];
        const request = {
            'market': market['id']
        };
        if (limit !== undefined) {
            request['limit'] = limit; // default = 50, minimum = 50, maximum = 1000
        }
        const defaultMethod = this.safeString (this.options, 'fetchTradesMethod');
        const method = this.safeString (params, 'method', defaultMethod);
        let data = {};
        if (market['spot']) {
            if (method === 'spotPublicGetHistory') {
                if (!('lastId' in params)) {
                    throw new ArgumentsRequired (this.id + " fetchTrades() requires 'lastId' id in params");
                }
                const response = await this[method] (this.deepExtend (request, params));
                // {
                //     success: true,
                //     message: "",
                //     result: [
                //         {
                //             id: 99601,
                //             type: "buy",
                //             time: 1640108002.455,
                //             amount: "323144.05252658",
                //             price: "0.008",
                //             total: "2585.15242021"
                //         },
                //         {
                //             id: 99544,
                //             type: "buy",
                //             time: 1640107990.112,
                //             amount: "967.91335",
                //             price: "0.00794371",
                //             total: "7.68882295"
                //         },
                data = this.safeValue (response, 'result', []);
            } else if (method === 'spotPublicGetHistoryResult') {
                if (!('since' in params)) {
                    throw new ArgumentsRequired (this.id + " fetchTrades() requires 'since' id in params");
                }
                data = this[method] (this.deepExtend (request, params));
                // [
                //     {
                //         tid: 99601,
                //         type: "buy",
                //         date: 1640108002,
                //         amount: "323144.05252658",
                //         price: "0.008",
                //         total: "2585.15242021"
                //     },
                //     {
                //         tid: 99544,
                //         type: "buy",
                //         date: 1640107990,
                //         amount: "967.91335",
                //         price: "0.00794371",
                //         total: "7.68882295"
                //     },
            }
        }
        return this.parseTrades (data, market, since, limit);
    }

    parseTrade (trade, market = undefined) {
        //         /history
        //         {
        //             id: 99601,
        //             type: "buy",
        //             time: 1640108002.455,
        //             amount: "323144.05252658",
        //             price: "0.008",
        //             total: "2585.15242021"
        //         },

        //         /history/result
        //         {
        //             tid: 99601,
        //             type: "buy",
        //             date: 1640108002,
        //             amount: "323144.05252658",
        //             price: "0.008",
        //             total: "2585.15242021"
        //         },
        const symbol = market['symbol'];
        const id = this.safeString2 (trade, 'id', this.safeString2 (trade, 'tid'));
        const timestamp = this.safeTimestamp (trade, 'time', this.safeInteger (trade, 'date'));
        const price = this.safeString (trade, 'price');
        const amount = this.safeString (trade, 'amount');
        const side = this.safeString (trade, 'type');
        const takerOrMaker = 'taker'; // as no other info
        return this.safeTrade ({
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': id,
            'order': undefined,
            'type': undefined,
            'takerOrMaker': takerOrMaker,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'fee': undefined,
        }, market);
    }

    sign (path, api = ['spot', 'public'], method = 'GET', params = {}, headers = undefined, body = undefined) {
        const [ section, access ] = api;
        let url = this.urls['api'][section][access] + 'v' + this.version + '/' + access + '/' + path;
        // const defaultType = this.safeString (params, 'defaultType', 'spot'); defaultType same as section
        params = this.omit (params, 'defaultType');
        params = this.omit (params, this.extractParams (path));
        if (access === 'public') {
            if (method === 'GET') {
                if (Object.keys (params).length) {
                    url += '?' + this.urlencode (params);
                }
            }
        } else {
            this.checkRequiredCredentials ();
            const timestamp = this.milliseconds ().toString ();
            let auth = '';
            headers = {
                'ApiKey': this.apiKey,
                'Request-Time': timestamp,
                'Content-Type': 'application/json',
            };
            if (method === 'POST') {
                auth = this.json (params);
                body = auth;
            } else {
                params = this.keysort (params);
                if (Object.keys (params).length) {
                    auth += this.urlencode (params);
                    url += '?' + auth;
                }
            }
            auth = this.apiKey + timestamp + auth;
            const signature = this.hmac (this.encode (auth), this.encode (this.secret), 'sha256');
            headers['Signature'] = signature;
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        //    {
        //        success: true,
        //        message: "",
        //        code: "200",
        //        result: [ .... ]
        //    }
        const success = this.safeValue (response, 'success', true);
        const code = this.safeString (response, 'code');
        if ((code !== undefined && code !== '200') || !success) { 
            const feedback = this.id + ' ' + body;
            // Just to keep notes: history/result & depth/result endpoints only return pure ARRAY as response, without any code/messages
            let responseCode = 0;
            if (success === false) { // If success is not 'false' strictly, then probably response didnt contain expected JSON format at all. Maybe 404 or any outage
                responseCode = this.safeString (response, 'code');
            }
            this.throwExactlyMatchedException (this.exceptions['exact'], responseCode, feedback);
            throw new ExchangeError (feedback);
        }
    }
};
