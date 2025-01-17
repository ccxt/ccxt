'use strict';

// ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { PermissionDenied, BadRequest, ExchangeError, ArgumentsRequired, InvalidOrder, OrderNotFound } = require ('./base/errors');

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
            'hostname': 'coinsbit.io', // or coinsbit.in
            'has': {
                'createOrder': true,
                'cancelOrder': true,
                'cancelAllOrders': false,
                'createMarketOrder': true,
                'fetchBalance': true,
                'fetchDepositAddress': false,
                'fetchDeposits': false,
                'fetchFundingRateHistory': false,
                'fetchMarkets': true,
                'fetchMyTrades': false,
                'fetchOrderTrades': true,
                'fetchOHLCV': true,
                'fetchOrder': false,
                'fetchOrders': false,
                'fetchOpenOrder': false,
                'fetchOpenOrders': true,
                'fetchClosedOrder': false,
                'fetchClosedOrders': true,
                'fetchCanceledOrders': false,
                'fetchOrderBook': true,
                'fetchPosition': false,
                'fetchPositions': false,
                'fetchStatus': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': false,
                'fetchTrades': true,
                'fetchWithdrawals': false,
                'deposit': false,
                'withdraw': false,
                'addMargin': false,
                'reduceMargin': false,
                'setLeverage': false,
            },
            'timeframes': {
                '1m': 60, // works for max 12 hours diapason (between from-to)
                '30m': 1800, // for max 24 hours diapason
                '1h': 3600, // for max 7 days diapason
                '1d': 86400, // for any diapason
            },
            'urls': {
                'logo': '  <<<TODO>>>   https://upload.wikimedia.org/wikipedia/commons/8/8c/Coinsbit.png  ',
                'api': {
                    'public': 'https://{hostname}',
                    'private': 'https://{hostname}',
                },
                'www': 'https://coinsbit.io/',
                'doc': [
                    'https://www.notion.so/coinsbitwsapi/API-COINSBIT-WS-API-COINSBIT-cf1044cff30646d49a0bab0e28f27a87',
                    'https://github.com/Coinsbit-connect/api/wiki/API',
                ],
                'fees': [
                    'https://coinsbit.io/fee-schedule',
                ],
                'referral': '  <<<TODO>>>   ',
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
                        'order/new_market': 1,
                        'order/cancel': 1,
                        'orders': 1,
                        'account/balances': 1,
                        'account/balance': 1,
                        'account/order': 1, // theoretically, this might got implemented in fetchClosedOrder, but API is broken
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
                'createMarketBuyOrderRequiresPrice': true,
                'fetchTradesMethod': 'publicGetHistory', // publicGetHistory | publicGetHistoryResult
                'maxDiapasonsForTimeframes': {
                    '1m': 43200,
                    '30m': 86400,
                    '1h': 86400 * 7,
                    '1d': Number.MAX_SAFE_INTEGER,
                },
            },
            'commonCurrencies': {},
            'exceptions': {
                'exact': {
                    'Operation blocked': PermissionDenied,
                    'Server Error': BadRequest,
                },
                'broad': {
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetMarkets (params);
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
        const data = this.safeValue (response, 'result', []);
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
                        'min': undefined,
                        'max': undefined,
                    },
                },
                'info': market,
            });
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
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
        await this.loadMarkets ();
        const response = await this.publicGetTickers (params);
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
        const tickers = this.safeValue (response, 'result', {});
        const result = [];
        const marketIds = Object.keys (tickers);
        for (let i = 0; i < marketIds.length; i++) {
            const marketId = marketIds[i];
            const market = this.safeMarket (marketId);
            result.push (this.parseTicker (tickers[marketId], market));
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
        let timestamp = undefined;
        if ('ticker' in ticker) { // if arrived from fetchTickers
            tickerFinal = this.safeValue (ticker, 'ticker', {});
            timestamp = this.safeTimestamp (ticker, 'at');
        } else { // if arrived from fetchTicker, then there is nothing to be done more
            tickerFinal = ticker;
        }
        const last = this.safeNumber (tickerFinal, 'last');
        market = this.safeMarket (undefined, market);
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
        if (limit !== undefined) {
            request['limit'] = Math.min (1000, limit); // this parameter is not required, default 50 will be returned
        }
        const options = this.safeValue (this.options, 'fetchOrderBook', {});
        // publicGetDepthResult or publicGetBook
        const type = this.safeString (params, 'method', 'publicGetDepthResult');
        const method = this.safeString (options, 'method', type);
        params = this.omit (params, 'method');
        let response = undefined;
        let priceKey = undefined;
        let amountKey = undefined;
        if (method === 'publicGetDepthResult') {
            response = await this[method] (this.extend (request, params));
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
            priceKey = 0;
            amountKey = 1;
        } else if (method === 'publicGetBook') {
            request['offset'] = this.safeString (params, 'offset', 0);
            // ATM, they need to be called separately (unfortunately)
            let query = this.extend (request, { 'side': 'buy' });
            const requestBids = await this[method] (this.extend (query, params));
            query = this.extend (request, { 'side': 'sell' });
            const requestAsks = await this[method] (this.extend (query, params));
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
            const resultBids = this.safeValue (requestBids, 'result', {});
            const resultAsks = this.safeValue (requestAsks, 'result', {});
            const bids = this.safeValue (resultBids, 'orders', []);
            const asks = this.safeValue (resultAsks, 'orders', []);
            response = { 'bids': bids, 'asks': asks };
            priceKey = 'price';
            amountKey = 'amount';
        }
        return this.parseOrderBook (response, symbol, undefined, 'bids', 'asks', priceKey, amountKey);
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        const duration = this.parseTimeframe (timeframe);
        const maxAllowedDiapason = this.options['maxDiapasonsForTimeframes'][timeframe];
        let maxRequestedMilliSeconds = undefined;
        if (limit === undefined) {
            maxRequestedMilliSeconds = maxAllowedDiapason * 1000;
        } else {
            maxRequestedMilliSeconds = Math.min (this.sum (limit, 1) * duration, maxAllowedDiapason) * 1000;
        }
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
        const response = await this.publicGetKline (this.extend (request, params));
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
        let data = undefined;
        if (method === 'publicGetHistory') {
            params['lastId'] = this.safeValue (params, 'lastId', 0);
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
            data = await this[method] (this.deepExtend (request, params));
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
        //    /history
        //         {
        //             id: 99601,
        //             type: "buy",
        //             time: 1640108002.455,
        //             amount: "323144.05252658",
        //             price: "0.008",
        //             total: "2585.15242021"
        //         },
        //
        //    /history/result
        //         {
        //             tid: 99601,
        //             type: "buy",
        //             date: 1640108002,
        //             amount: "323144.05252658",
        //             price: "0.008",
        //             total: "2585.15242021"
        //         },
        //
        //      /account/trades :
        //      [
        //         {
        //           time: '1640258718.402',
        //           fee: '0.01572657',
        //           price: '3931.64271609',
        //           amount: '0.002',
        //           id: '1595921',
        //           dealOrderId: '8631729321', //<--- this is different than passed order-id
        //           role: '2',
        //           deal: '7.86328543'
        //         },
        //         ...
        //       ]
        const symbol = this.safeValue (market, 'symbol');
        const id = this.safeString2 (trade, 'id', 'tid');
        const orderId = this.safeString (trade, 'dealOrderId');
        const timestamp = this.safeTimestamp2 (trade, 'time', 'date');
        const price = this.safeString (trade, 'price');
        const amount = this.safeString (trade, 'amount');
        const side = this.safeString (trade, 'type');
        const cost = this.safeString (trade, 'deal');
        const fee = this.safeString (trade, 'fee');
        const role = this.safeInteger (trade, 'role');
        let takerOrMaker = '';
        if (role !== undefined) {
            takerOrMaker = (role === 2) ? 'taker' : 'maker';
        } else {
            takerOrMaker = 'taker';
        }
        return this.safeTrade ({
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': id,
            'order': orderId,
            'type': undefined,
            'takerOrMaker': takerOrMaker,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
        }, market);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        let method = undefined;
        if (type === 'limit') {
            request['side'] = side;
            request['price'] = this.priceToPrecision (symbol, price);
            request['amount'] = this.amountToPrecision (symbol, amount);
            method = 'privatePostOrderNew';
        } else if (type === 'market') {
            request['direction'] = side;
            method = 'privatePostOrderNewMarket';
            // for market buy it requires the amount of quote currency to spend
            if (side === 'buy') {
                let cost = undefined;
                if (this.options['createMarketBuyOrderRequiresPrice']) {
                    if (price === undefined || amount === undefined) {
                        throw new InvalidOrder (this.id + " createOrder() requires the price argument for market buy orders to calculate total order cost (amount to spend), where cost = amount * price. Supply a price argument to createOrder() call if you want the cost to be calculated for you from price and amount, or, alternatively, add .options['createMarketBuyOrderRequiresPrice'] = false and supply the total cost value in the 'amount' argument or in the 'amount' extra parameter (the exchange-specific behaviour)");
                    }
                    cost = amount * price;
                } else {
                    cost = amount;
                }
                request['amount'] = this.costToPrecision (symbol, cost);
            } else if (side === 'sell') {
                request['amount'] = this.amountToPrecision (symbol, amount);
            }
        }
        const response = await this[method] (this.extend (request, params));
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

    async cancelOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new InvalidOrder (this.id + ' cancelOrder requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        request['orderId'] = id;
        const response = await this.privatePostOrderCancel (this.extend (request, params));
        // {
        //     success: true,
        //     message: '',
        //     result: {
        //       orderId: '8631519189',
        //       market: 'ETH_USDT',
        //       price: '3100',
        //       side: 'buy',
        //       type: 'limit',
        //       timestamp: '1640254497.745',
        //       dealMoney: '0',
        //       dealStock: '0',
        //       amount: '0.002',
        //       takerFee: '0.002',
        //       makerFee: '0.002',
        //       left: '0.002',
        //       dealFee: '0'
        //     },
        //     code: '200'
        //  }
        const data = this.safeValue (response, 'result');
        return this.extend (this.parseOrder (data, market), {
            'status': 'canceled',
        });
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOpenOrders requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        const offset = this.safeValue (params, 'offset');
        if (offset !== undefined) {
            request['offset'] = offset;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privatePostOrders (this.extend (request, params));
        // {
        //     success: true,
        //     message: '',
        //     result: {
        //         limit: '50',
        //         offset: '0',
        //         total: '2',
        //         result: [
        //            {
        //               id: '8633074431',
        //               left: '0.002',
        //               market: 'ETH_USDT',
        //               amount: '0.002',
        //               type: 'limit',
        //               price: '2000.1892',
        //               timestamp: '1640284932.136',
        //               side: 'buy',
        //               dealFee: '0',
        //               takerFee: '0.002',
        //               makerFee: '0.002',
        //               dealStock: '0',
        //               dealMoney: '0'
        //           },
        //           ...
        //         ]
        //     },
        //     code: '200'
        // }
        const data = this.safeValue (response, 'result', []);
        const orders = this.safeValue (data, 'result', []);
        return this.parseOrders (orders, market, since, limit);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const method = this.safeValue (params, 'method', 'privatePostAccountOrderHistory');
        let records = undefined;
        if (method === 'privatePostAccountOrderHistory') {
            const response = await this.privatePostAccountOrderHistory (this.extend (request, params));
            // {
            //     success: true,
            //     message: '',
            //     result: {
            //       BTC_USDT: [
            //          {
            //             amount: '0.002',
            //             price: '3000',
            //             type: 'limit',
            //             id: '8629387172',
            //             side: 'sell',
            //             ctime: '1640212942.872',
            //             takerFee: '0.002',
            //             ftime: '1640212942.874',
            //             market: 'ETH_USDT',
            //             makerFee: '0.002',
            //             dealFee: '0.01598386',
            //             dealStock: '0.002',
            //             dealMoney: '7.99193271',
            //             marketName: 'ETH_USDT'
            //          },
            //          ...
            //       ],
            //       ETH_USDT: [
            //          ...
            //       ]
            //     },
            //     code: '200'
            //   }
            const data = this.safeValue (response, 'result', {});
            records = [];
            const marketIds = Object.keys (data);
            for (let i = 0; i < marketIds.length; i++) {
                const marketId = marketIds[i];
                const ordersOfMarket = data[marketId];
                for (let j = 0; j < ordersOfMarket.length; j++) {
                    records.push (ordersOfMarket[j]);
                }
            }
        } else if (method === 'privatePostAccountOrderHistoryList') {
            const response = await this.privatePostAccountOrderHistoryList (this.extend (request, params));
            // {
            //     success: true,
            //     message: '',
            //     result: {
            //       records:
            //       [
            //          {
            //              amount: '0.002',
            //              price: '4000',
            //              type: 'limit',
            //              id: '8629354787',
            //              side: 'buy',
            //              ctime: '1640212275.928',
            //              takerFee: '0.002',
            //              ftime: '1640212275.93',
            //              market: 'ETH_USDT',
            //              makerFee: '0.002',
            //              dealFee: '0.01597712',
            //              dealStock: '0.002',
            //              dealMoney: '7.98856357',
            //              marketName: 'ETH_USDT'
            //          },
            //          ...
            //        ]
            //     },
            //     code: '200',
            // }
            const data = this.safeValue (response, 'result', {});
            records = this.safeValue (data, 'records', []);
        } else {
            throw new ArgumentsRequired (this.id + " fetchClosedOrders() should have 'method' parameter from the following: privatePostAccountOrderHistoryList | privatePostAccountOrderHistory");
        }
        return this.parseOrders (records, market, since, limit, params);
    }

    parseOrder (order, market = undefined) {
        // createOrder & cancelOrder  ( fetchOpenOrders has 'id' instead of 'orderId')
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
        //
        //  fetchClosedOrders
        //      {
        //         id: '8629354787',
        //         amount: '0.002',
        //         price: '4000',
        //         type: 'limit',
        //         side: 'buy',
        //         takerFee: '0.002',
        //         market: 'ETH_USDT',
        //         makerFee: '0.002',
        //         dealFee: '0.01597712',
        //         dealStock: '0.002',
        //         dealMoney: '7.98856357',
        //         ctime: '1640212275.928',
        //         ftime: '1640212275.93',
        //         marketName: 'ETH_USDT'
        //      },
        const isFromCreateOrCancelOrder = ('orderId' in order);
        const isFromFetchOpenOrders = ('id' in order);
        const isFromFetchClosedOrders = ('ctime' in order);
        const id = this.safeString2 (order, 'id', 'orderId');
        const side = this.safeString (order, 'side');
        const orderType = this.safeString (order, 'type');
        let timestamp = this.safeTimestamp2 (order, 'timestamp', 'time');
        if (timestamp === undefined) {
            timestamp = this.safeTimestamp (order, 'ctime');
        }
        const lastTradeTimestamp = this.safeTimestamp (order, 'ftime');
        const price = this.safeString (order, 'price'); // In case of market order, the price is 0
        const remaining = this.safeString (order, 'left');
        const filledSize = this.safeString (order, 'dealStock');
        const cost = this.safeString2 (order, 'dealMoney', 'deal');
        const fee = this.safeString2 (order, 'dealFee', 'fee');
        const amountGeneric = this.safeString (order, 'amount');
        let status = undefined;
        let orderSize = undefined;
        if (orderType === 'market') {
            if (side === 'sell') {
                orderSize = amountGeneric;
            } else {
                orderSize = filledSize; // for buy market order, coinsbit leaves only this way to define orderSize of base currency
            }
        } else {
            orderSize = amountGeneric;
        }
        // only after we have filled/unfilled amounts calculated, we can calculate status after that
        const sameFillAsAmount = orderSize === filledSize;
        if (isFromFetchOpenOrders) {
            status = 'open';
        } else if (isFromFetchClosedOrders) {
            status = sameFillAsAmount ? 'closed' : 'canceled';
        } else if (isFromCreateOrCancelOrder) {
            // cancelled ones will get status overwrites inside 'cancelOrder' anyway, so we handle here only for createOrder's response - let's calculate if it was fully-filled.
            status = sameFillAsAmount ? 'closed' : 'open';
        }
        const marketId = this.safeString (order, 'market');
        if (market === undefined) {
            market = this.safeMarket (marketId, market, '_');
        }
        const symbol = this.safeString (market, 'symbol');
        const quoteCurrency = market['quote'];
        return this.safeOrder ({
            'id': id,
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'status': status,
            'symbol': symbol,
            'type': orderType,
            'timeInForce': undefined,
            'side': side,
            'price': price,
            'stopPrice': undefined,
            'average': undefined,
            'amount': orderSize,
            'cost': cost,
            'filled': filledSize,
            'remaining': remaining,
            'fee': {
                'cost': fee,
                'currency': quoteCurrency,
            },
            'trades': undefined,
            'info': order,
        }, market);
    }

    async fetchOrderTrades (id, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        request['orderId'] = id;
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privatePostAccountTrades (this.extend (request, params));
        // {
        //     success: true,
        //     message: '',
        //     result: {
        //       offset: '0',
        //       limit: '50',
        //       records: [{
        //         time: '1640258718.402',
        //         fee: '0.01572657',
        //         price: '3931.64271609',
        //         amount: '0.002',
        //         id: '1595921',
        //         dealOrderId: '8631729321',  //<--- this is different than passed order-id
        //         role: '2',
        //         deal: '7.86328543'
        //       },
        //       ...
        //     ]},
        //     code: '200'
        // }
        const result = this.safeValue (response, 'result', {});
        const order = this.safeValue (result, 'records');
        if (!order) {
            throw new OrderNotFound (this.id + ' fetchOrderTrades() could not find any trade data for order-id ' + id);
        }
        return this.parseTrade ({ 'id': id, 'order': order }, undefined);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let currencyId = this.safeString (params, 'currency');
        if (currencyId === undefined) {
            const code = this.safeString (params, 'code');
            if (code !== undefined) {
                params = this.omit (params, 'code');
                const currency = this.currency (code);
                currencyId = currency['id'];
            }
        }
        let method = 'privatePostAccountBalances';
        const request = {};
        if (currencyId !== undefined) {
            request['currency'] = currencyId;
            method = 'privatePostAccountBalance';
        }
        const response = await this[method] (this.extend (request, params));
        // {
        //     success: true,
        //     message: '',
        //     result: {
        //       BTC: { available: '0', freeze: '0' },
        //       USDT: { available: '0', freeze: '0' },
        //       ...
        const data = this.safeValue (response, 'result', {});
        const result = {
            'info': response,
            'timestamp': undefined,
            'datetime': undefined,
        };
        const currencyIds = Object.keys (data);
        for (let i = 0; i < currencyIds.length; i++) {
            const currencyId = currencyIds[i];
            const code = this.safeCurrencyCode (currencyId);
            const balance = this.safeValue (data, currencyId, {});
            const account = this.account ();
            account['free'] = this.safeString (balance, 'available');
            account['used'] = this.safeString (balance, 'freeze');
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.implodeHostname (this.urls['api'][api]);
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
        if (!response) {
            return; // fallback to default error handler
        }
        // Note1: generic response is as below
        //    {
        //        success: true,
        //        message: "",
        //        code: "200",
        //        result: [ .... ]
        //    }
        //
        // Note2: history/result & depth/result endpoints only return pure ARRAY as response, without any code/messages
        //
        // Note3: in non-successful cases, code is always 0, they don't have other codes for errors.
        //
        // Note4: sometimes, if you make bad request (i.e. incorrect pair), exchange responds with the below (instead of normal response):
        // {"response":null,"status":500,"errors":{"message":["Server Error"]},"notification":null,"warning":null,"_token":null}
        //
        const errorsMessage = this.safeString (this.safeValue (response, 'errors'), 'message');
        const success = this.safeString (response, 'success', true);
        if (!this.isTrue (success) || errorsMessage !== undefined) {
            const feedback = this.id + ' ' + body;
            const message = this.safeString (response, 'message', errorsMessage);
            this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], body, feedback);
            throw new ExchangeError (feedback);
        }
    }

    isTrue (x) {
        if (x !== undefined) {
            if (typeof x === 'string') {
                if (x !== '0') {
                    return (x === 'true' || x === '1');
                }
            } else {
                return x;
            }
        }
    }
};
