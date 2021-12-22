'use strict';

// ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired, InvalidOrder } = require ('./base/errors'); // BadRequest, AuthenticationError, RateLimitExceeded, BadSymbol, InsufficientFunds, OrderNotFound, PermissionDenied
const { TICK_SIZE } = require ('./base/functions/number');
const Precise = require ('./base/Precise');
function c(o){console.log(o);}
// ---------------------------------------------------------------------------

module.exports = class coinsbit extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'coinsbit',
            'name': 'Coinsbit',
            'countries': [ 'EE' ], // Estonia
            'rateLimit': 1000, // No defaults known
            'version': 'v1',
            'certified': false,
            'has': {
                'addMargin': undefined,
                'cancelAllOrders': undefined,
                'createOrder': true,
                'cancelOrder': undefined,
                'createMarketOrder': undefined,
                'fetchBalance': true,
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
                    'public': 'https://coinsbit.io',
                    'private': 'https://coinsbit.io',
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
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': 0.2 / 100,
                    'taker': 0.2 / 100,
                },
            },
            'options': {
                'fetchTradesMethod': 'publicGetHistory', // publicGetHistory | publicGetHistoryResult
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
        let data = undefined;
        const request = params;
        const response = await this.publicGetMarkets (request);
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
        const result = [];
        for (let i = 0; i < data.length; i++) {
            const market = data[i];
            const id = this.safeString (market, 'name');
            const baseId = this.safeString (market, 'stock');
            const quoteId = this.safeString (market, 'money');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const priceScale = this.safeInteger (market, 'moneyPrec');
            const quantityScale = this.safeInteger (market, 'stockPrec');
            const pricePrecision = priceScale;
            const quantityPrecision = quantityScale;
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
                'spot': true,
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
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        let ticker = undefined;
        const response = await this.publicGetTicker (request);
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
        return this.parseTicker (ticker, market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        const request = params;
        await this.loadMarkets ();
        let tickers = {};
        const response = await this.publicGetTickers (request);
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
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        let orderbook = {};
        if (limit !== undefined) {
            request['limit'] = Math.min (1000, limit); // this parameter is not required, default 50 will be returned
        }
        const type = this.safeString (params, 'type', 'depth/result'); // <<< TODO >> maybe a better way to set default unified param name (same param can be used for binance fetchBidsAsks too, if that will get integrated inside binance's fetchOrderbook )
        const method = this.safeString (this.options, 'fetchOrderBookMethod', type);
        if (method === 'depth/result') {
            const response = await this.publicGetDepthResult (this.extend (request, params));
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
            const requestBids = this.publicGetBook (this.extend (request, params));
            request['side'] = this.safeString (params, 'side', 'sell');
            const requestAsks = this.publicGetBook (this.extend (request, params));
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
        // orderbook['nonce']  <<< TODO >>> -- atm I dont know how to handle that, as the response doesn't have right that property
        return orderbook;
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        const duration = this.parseTimeframe (timeframe);
        const maxAllowedDiapason = this.options['maxDiapasonsForTimeframes'][timeframe];
        let maxRequestedMilliSeconds = null;
        if (limit === undefined) {
            maxRequestedMilliSeconds = maxAllowedDiapason * 1000;
        } else {
            maxRequestedMilliSeconds = Math.min (this.sum (limit, 1) * duration, maxAllowedDiapason) * 1000;
        }
        let response = null;
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
        response = await this.publicGetKline (this.extend (request, params));
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
        const result = this.safeValue (response, 'result', {});
        const data = this.safeValue (result, 'kline', []);
        return this.parseOHLCVs (data, market, timeframe, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
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
        const request = {
            'market': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit; // default = 50, minimum = 50, maximum = 1000
        }
        const defaultMethod = this.safeString (this.options, 'fetchTradesMethod');
        const method = this.safeString (params, 'method', defaultMethod);
        let data = {};
        if (method === 'publicGetHistory') {
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
        } else if (method === 'publicGetHistoryResult') {
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
        const id = this.safeString2 (trade, 'id', 'tid');
        const timestamp = this.safeTimestamp2 (trade, 'time', 'date');
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

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (market['spot']) {
            await this.loadMarkets ();
            const market = this.market (symbol);
            const request = {
                'market': market['id'],
            };
            if (!(['buy', 'sell'].includes (side))) {
                throw new InvalidOrder (this.id + ' createOrder side should be either "buy" or "sell"');
            }
            if (!(['limit', undefined].includes (type))) {
                throw new InvalidOrder (this.id + ' createOrder only supports limit orders');
            }
            if (!price) {
                throw new InvalidOrder (this.id + ' createOrder needs price field');
            }
            request['side'] = side;
            request['amount'] = this.amountToPrecision (symbol, amount);
            request['price'] = this.priceToPrecision (symbol, price);
            const response = await this.privatePostOrderNew (this.extend (request, params));
            // {
            //     success: true,
            //     message: '',
            //     result: {
            //       orderId: '8629354782',
            //       market: 'ETH_USDT',
            //       price: '4000',
            //       side: 'buy',
            //       type: 'limit',
            //       timestamp: '1640212275.928',
            //       dealMoney: '7.98856357',
            //       dealStock: '0.002',
            //       amount: '0.002',
            //       takerFee: '0.002',
            //       makerFee: '0.002',
            //       left: '0',
            //       dealFee: '0'
            //     },
            //     code: '200'
            //   }
            const data = this.safeValue (response, 'result', {});
            return this.parseOrder (data, market);
        }
    }

    parseOrder (order, market = undefined) {
        //     {
        //       orderId: '8629354782',
        //       market: 'ETH_USDT',
        //       price: '4000',
        //       side: 'buy',
        //       type: 'limit',
        //       timestamp: '1640212275.928',
        //       dealMoney: '7.98856357',
        //       dealStock: '0.002',
        //       amount: '0.002',
        //       takerFee: '0.002',
        //       makerFee: '0.002',
        //       left: '0',
        //       dealFee: '0'
        //     }
        const id = this.safeString (order, 'orderId');
        const side = this.safeString (order, 'side');
        const orderType = this.safeString (order, 'type');
        const timestamp = this.safeTimestamp (order, 'timestamp');
        const price = this.safeString (order, 'price');
        const amount = this.safeString (order, 'amount');
        const remaining = this.safeString (order, 'left');
        const filled = this.safeString (order, 'dealStock');
        const costedQuoteCurrency = this.safeString (order, 'dealMoney');
        const feeTaker = this.safeString (order, 'takerFee');
        // const feeMaker = this.safeString (order, 'makerFee'); <<<TODO >>> couldn't find any use from this
        const marketId = this.safeString (order, 'market');
        if (market === undefined) {
            market = this.safeMarket (marketId, market, '_');
        }
        const quoteCurrency = market['quote'];
        const cost = Precise.stringMul (costedQuoteCurrency, feeTaker); // <<< TODO >> as both taker/maker has same fee, probably doesn't matter, and we can calculate cost
        return this.safeOrder2 ({
            'id': id,
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'status': undefined,
            'symbol': market['symbol'],
            'type': orderType,
            'timeInForce': undefined,
            'side': side,
            'price': price,
            'stopPrice': undefined,
            'average': undefined,
            'amount': amount,
            'cost': undefined,
            'filled': filled,
            'remaining': remaining,
            'fee': {
                'cost': cost,
                'currency': quoteCurrency,
            },
            'trades': undefined,
            'info': order,
        }, market);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const request = this.omit (params, 'type');
        const response = await this.privatePostAccountBalances (request);
        // {
        //     success: true,
        //     message: '',
        //     result: {
        //       BTC: { available: '0', freeze: '0' },
        //       USDT: { available: '0', freeze: '0' },
        //       ...
        c (response);
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api];
        params = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            url += '/api/' + this.version + '/' + api + '/' + path;
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        } else {
            this.checkRequiredCredentials ();
            const request = '/api/' + this.version + '/' + path;
            url += request;
            params['request'] = request;
            params['nonce'] = this.nonce ().toString ();
            const auth = this.json (params);
            const auth64 = this.stringToBase64 (auth);
            const signature = this.hmac (auth64, this.encode (this.secret), 'sha512');
            body = auth;
            headers = {
                'X-TXC-APIKEY': this.apiKey,
                'X-TXC-PAYLOAD': this.decode (auth64),
                'X-TXC-SIGNATURE': signature,
                'Content-type': 'application/json',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
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
