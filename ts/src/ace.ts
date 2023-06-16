//  ---------------------------------------------------------------------------

import Exchange from './abstract/ace.js';
import { ArgumentsRequired, BadRequest, AuthenticationError, InsufficientFunds, InvalidOrder } from './base/errors.js';
import { Precise } from './base/Precise.js';
import { TICK_SIZE } from './base/functions/number.js';
import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
import { Int, OrderSide, OrderType } from './base/types.js';

//  ---------------------------------------------------------------------------

export default class ace extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'ace',
            'name': 'ACE',
            'countries': [ 'TW' ], // Taiwan
            'version': 'v2',
            'rateLimit': 100,
            'pro': false,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'cancelAllOrders': false,
                'cancelOrder': true,
                'cancelOrders': false,
                'createOrder': true,
                'editOrder': false,
                'fetchBalance': true,
                'fetchBorrowRate': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchBorrowRates': false,
                'fetchClosedOrders': false,
                'fetchCurrencies': false,
                'fetchDepositAddress': false,
                'fetchDeposits': false,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchMarginMode': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': false,
                'fetchOrderTrades': true,
                'fetchPositionMode': false,
                'fetchPositions': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': false,
                'fetchTrades': false,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTransactionFees': false,
                'fetchTransactions': false,
                'fetchTransfer': false,
                'fetchTransfers': false,
                'fetchWithdrawal': false,
                'fetchWithdrawals': false,
                'setLeverage': false,
                'setMarginMode': false,
                'transfer': false,
                'withdraw': false,
            },
            'timeframes': {
                '1m': 1,
                '5m': 5,
                '10m': 10,
                '30m': 10,
                '1h': 60,
                '2h': 120,
                '4h': 240,
                '8h': 480,
                '12h': 720,
                '1d': 24,
                '1w': 70,
                '1M': 31,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/216908003-fb314cf6-e66e-471c-b91d-1d86e4baaa90.jpg',
                'api': {
                    'public': 'https://ace.io/polarisex',
                    'private': 'https://ace.io/polarisex/open',
                },
                'www': 'https://ace.io/',
                'doc': [
                    'https://github.com/ace-exchange/ace-offical-api-docs',
                ],
                'fees': 'https://helpcenter.ace.io/hc/zh-tw/articles/360018609132-%E8%B2%BB%E7%8E%87%E8%AA%AA%E6%98%8E',
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'api': {
                'public': {
                    'get': [
                        'oapi/v2/list/tradePrice',
                        'oapi/v2/list/marketPair',
                        'open/v2/public/getOrderBook',
                    ],
                },
                'private': {
                    'post': [
                        'v2/coin/customerAccount',
                        'v2/kline/getKline',
                        'v2/order/order',
                        'v2/order/cancel',
                        'v2/order/getOrderList',
                        'v2/order/showOrderStatus',
                        'v2/order/showOrderHistory',
                        'v2/order/getTradeList',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'percentage': true,
                    'maker': this.parseNumber ('0.0005'),
                    'taker': this.parseNumber ('0.001'),
                },
            },
            'options': {
                'brokerId': 'ccxt',
            },
            'precisionMode': TICK_SIZE,
            'exceptions': {
                'exact': {
                    '2003': InvalidOrder,
                    '2004': InvalidOrder,
                    '2005': InvalidOrder,
                    '2021': InsufficientFunds,
                    '2036': InvalidOrder,
                    '2039': InvalidOrder,
                    '2053': InvalidOrder,
                    '2061': BadRequest,
                    '2063': InvalidOrder,
                    '9996': BadRequest,
                    '10012': AuthenticationError,
                    '20182': AuthenticationError,
                    '20183': InvalidOrder,
                },
                'broad': {
                },
            },
            'commonCurrencies': {
            },
        });
    }

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name ace#fetchMarkets
         * @description retrieves data on all markets for ace
         * @see https://github.com/ace-exchange/ace-official-api-docs/blob/master/api_v2.md#oapi-api---market-pair
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {[object]} an array of objects representing market data
         */
        const response = await this.publicGetOapiV2ListMarketPair ();
        //
        //     [
        //         {
        //             "symbol":"BTC/USDT",
        //             "base":"btc",
        //             "baseCurrencyId": "122"
        //             "quote":"usdt",
        //             "basePrecision":"8",
        //             "quotePrecision":"5",
        //             "minLimitBaseAmount":"0.1",
        //             "maxLimitBaseAmount":"480286"
        //         }
        //     ]
        //
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const market = response[i];
            const base = this.safeString (market, 'base');
            const baseCode = this.safeCurrencyCode (base);
            const quote = this.safeString (market, 'quote');
            const quoteCode = this.safeCurrencyCode (quote);
            const symbol = base + '/' + quote;
            result.push ({
                'id': this.safeString (market, 'symbol'),
                'uppercaseId': undefined,
                'symbol': symbol,
                'base': baseCode,
                'baseId': this.safeInteger (market, 'baseCurrencyId'),
                'quote': quoteCode,
                'quoteId': this.safeInteger (market, 'quoteCurrencyId'),
                'settle': undefined,
                'settleId': undefined,
                'type': 'spot',
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'derivative': false,
                'contract': false,
                'linear': undefined,
                'inverse': undefined,
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'limits': {
                    'amount': {
                        'min': this.safeNumber (market, 'minLimitBaseAmount'),
                        'max': this.safeNumber (market, 'maxLimitBaseAmount'),
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
                'precision': {
                    'price': this.parseNumber (this.parsePrecision (this.safeString (market, 'quotePrecision'))),
                    'amount': this.parseNumber (this.parsePrecision (this.safeString (market, 'basePrecision'))),
                },
                'active': undefined,
                'info': market,
            });
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        //
        //     {
        //         "base_volume":229196.34035399999,
        //         "last_price":11881.06,
        //         "quote_volume":19.2909
        //     }
        //
        const marketId = this.safeString (ticker, 'id');
        const symbol = this.safeSymbol (marketId, market);
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': undefined,
            'datetime': undefined,
            'high': undefined,
            'low': undefined,
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': this.safeString (ticker, 'last_price'),
            'last': this.safeString (ticker, 'last_price'),
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeString (ticker, 'base_volume'),
            'quoteVolume': this.safeString (ticker, 'quote_volume'),
            'info': ticker,
        }, market);
    }

    async fetchTicker (symbol: string, params = {}) {
        /**
         * @method
         * @name ace#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @see https://github.com/ace-exchange/ace-official-api-docs/blob/master/api_v2.md#oapi-api---trade-data
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the ace api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const response = await this.publicGetOapiV2ListTradePrice (params);
        const marketId = market['id'];
        const ticker = this.safeValue (response, marketId, {});
        //
        //     {
        //         "BTC/USDT":{
        //             "base_volume":229196.34035399999,
        //             "last_price":11881.06,
        //             "quote_volume":19.2909
        //         }
        //     }
        //
        return this.parseTicker (ticker, market);
    }

    async fetchTickers (symbols: string[] = undefined, params = {}) {
        /**
         * @method
         * @name ace#fetchTickers
         * @description fetches price tickers for multiple markets, statistical calculations with the information calculated over the past 24 hours each market
         * @see https://github.com/ace-exchange/ace-official-api-docs/blob/master/api_v2.md#oapi-api---trade-data
         * @param {[string]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} params extra parameters specific to the ace api endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        const response = await this.publicGetOapiV2ListTradePrice ();
        //
        //     {
        //         "BTC/USDT":{
        //             "base_volume":229196.34035399999,
        //             "last_price":11881.06,
        //             "quote_volume":19.2909
        //         }
        //     }
        //
        const tickers = [];
        const pairs = Object.keys (response);
        for (let i = 0; i < pairs.length; i++) {
            const marketId = pairs[i];
            const market = this.safeMarket (marketId);
            const rawTicker = this.safeValue (response, marketId);
            const ticker = this.parseTicker (rawTicker, market);
            tickers.push (ticker);
        }
        return this.filterByArray (tickers, 'symbol', symbols);
    }

    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name ace#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @see https://github.com/ace-exchange/ace-official-api-docs/blob/master/api_v2.md#open-api---order-books
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the ace api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'quoteCurrencyId': market['quoteId'],
            'baseCurrencyId': market['baseId'],
        };
        if (limit !== undefined) {
            request['depth'] = limit;
        }
        const response = await this.publicGetOpenV2PublicGetOrderBook (this.extend (request, params));
        //
        //     {
        //         "attachment": {
        //             "baseCurrencyId": "2",
        //             "quoteCurrencyId": "14",
        //             "baseCurrencyName": "BTC",
        //             "quoteCurrencyName": "USDT",
        //             "bids": [
        //                 [
        //                     "0.0009",
        //                     "19993.53"
        //                 ],
        //                 [
        //                     "0.001",
        //                     "19675.33"
        //                 ],
        //                 [
        //                     "0.001",
        //                     "19357.13"
        //                 ]
        //             ],
        //             "asks": [
        //                 [
        //                     "0.001",
        //                     "20629.92"
        //                 ],
        //                 [
        //                     "0.001",
        //                     "20948.12"
        //                 ]
        //             ]
        //         },
        //         "message": null,
        //         "parameters": null,
        //         "status": 200
        //     }
        //
        const orderBook = this.safeValue (response, 'attachment');
        return this.parseOrderBook (orderBook, market['symbol'], undefined, 'bids', 'asks');
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        //     {
        //         "changeRate": 0,
        //         "volume": 0,
        //         "closePrice": 101000.0,
        //         "lowPrice": 101000.0,
        //         "highPrice": 101000.0,
        //         "highPrice": 1573195740000L,
        //         "openPrice": 101000.0,
        //         "current": 101000.0,
        //         "currentTime": "2019-11-08 14:49:00",
        //         "createTime": "2019-11-08 14:49:00"
        //     }
        //
        const dateTime = this.safeString (ohlcv, 'createTime');
        let timestamp = this.parse8601 (dateTime);
        if (timestamp !== undefined) {
            timestamp = timestamp - 28800000; // 8 hours
        }
        return [
            timestamp,
            this.safeNumber (ohlcv, 'openPrice'),
            this.safeNumber (ohlcv, 'highPrice'),
            this.safeNumber (ohlcv, 'lowPrice'),
            this.safeNumber (ohlcv, 'closePrice'),
            this.safeNumber (ohlcv, 'volume'),
        ];
    }

    async fetchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name ace#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @see https://github.com/ace-exchange/ace-official-api-docs/blob/master/api_v2.md#open-api---klinecandlestick-data
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
         * @param {int|undefined} limit the maximum amount of candles to fetch
         * @param {object} params extra parameters specific to the ace api endpoint
         * @returns {[[int]]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'duration': this.timeframes[timeframe],
            'quoteCurrencyId': market['quoteId'],
            'baseCurrencyId': market['baseId'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        const response = await this.privatePostV2KlineGetKline (this.extend (request, params));
        const data = this.safeValue (response, 'attachment', []);
        //
        //     {
        //         "attachment":[
        //                 {
        //                     "changeRate": 0,
        //                     "closePrice": 101000.0,
        //                     "volume": 0,
        //                     "lowPrice": 101000.0,
        //                     "highPrice": 101000.0,
        //                     "highPrice": 1573195740000L,
        //                     "openPrice": 101000.0,
        //                     "current": 101000.0,
        //                     "currentTime": "2019-11-08 14:49:00",
        //                     "createTime": "2019-11-08 14:49:00"
        //                 }
        //         ]
        //     }
        //
        return this.parseOHLCVs (data, market, timeframe, since, limit);
    }

    parseOrderStatus (status) {
        const statuses = {
            '0': 'open',
            '1': 'open',
            '2': 'closed',
            '4': 'canceled',
            '5': 'canceled',
        };
        return this.safeString (statuses, status, undefined);
    }

    parseOrder (order, market = undefined) {
        //
        // createOrder
        //         "15697850529570392100421100482693"
        //
        // fetchOpenOrders
        //         {
        //             "uid": 0,
        //             "orderNo": "16113081376560890227301101413941",
        //             "orderTime": "2021-01-22 17:35:37",
        //             "orderTimeStamp": 1611308137656,
        //             "baseCurrencyId": 1,
        //             "baseCurrencyName": "TWD",
        //             "quoteCurrencyId": 14,
        //             "quoteCurrencyName": "USDT",
        //             "buyOrSell": "1",
        //             "num": "6.0000000000000000",
        //             "price": "32.5880000000000000",
        //             "remainNum": "2.0000000000000000",
        //             "tradeNum": "4.0000000000000000",
        //             "tradePrice": "31.19800000000000000000",
        //             "tradeAmount": "124.7920000000000000",
        //             "tradeRate": "0.66666666666666666667",
        //             "status": 1,
        //             "type": 1
        //         }
        //
        let id = undefined;
        let timestamp = undefined;
        let symbol = undefined;
        let price = undefined;
        let amount = undefined;
        let side = undefined;
        let type = undefined;
        let status = undefined;
        let filled = undefined;
        let remaining = undefined;
        let average = undefined;
        if (typeof order === 'string') {
            id = order;
        } else {
            id = this.safeString (order, 'orderNo');
            timestamp = this.safeInteger (order, 'orderTimeStamp');
            if (timestamp === undefined) {
                const dateTime = this.safeString (order, 'orderTime');
                if (dateTime !== undefined) {
                    timestamp = this.parse8601 (dateTime);
                    timestamp = timestamp - 28800000; // 8 hours
                }
            }
            const orderSide = this.safeNumber (order, 'buyOrSell');
            if (orderSide !== undefined) {
                side = (orderSide === 1) ? 'buy' : 'sell';
            }
            amount = this.safeString (order, 'num');
            price = this.safeString (order, 'price');
            const quoteId = this.safeString (order, 'quoteCurrencyName');
            const baseId = this.safeString (order, 'baseCurrencyName');
            if (quoteId !== undefined && baseId !== undefined) {
                symbol = baseId + '/' + quoteId;
            }
            const orderType = this.safeNumber (order, 'type');
            if (orderType !== undefined) {
                type = (orderType === 1) ? 'limit' : 'market';
            }
            filled = this.safeString (order, 'tradeNum');
            remaining = this.safeString (order, 'remainNum');
            status = this.parseOrderStatus (this.safeString (order, 'status'));
            average = this.safeString (order, 'averagePrice');
        }
        return this.safeOrder ({
            'id': id,
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': type,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': undefined,
            'amount': amount,
            'cost': undefined,
            'average': average,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': undefined,
            'trades': undefined,
            'info': order,
        }, market);
    }

    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name ace#createOrder
         * @description create a trade order
         * @see https://github.com/ace-exchange/ace-official-api-docs/blob/master/api_v2.md#open-api---new-order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float|undefined} price the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} params extra parameters specific to the ace api endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const orderType = type.toUpperCase ();
        const orderSide = side.toUpperCase ();
        const request = {
            'baseCurrencyId': market['baseId'],
            'quoteCurrencyId': market['quoteId'],
            'type': (orderType === 'LIMIT') ? 1 : 2,
            'buyOrSell': (orderSide === 'BUY') ? 1 : 2,
            'num': this.amountToPrecision (symbol, amount),
        };
        if (type === 'limit') {
            request['price'] = this.priceToPrecision (symbol, price);
        }
        const response = await this.privatePostV2OrderOrder (this.extend (request, params));
        //
        //     {
        //         "attachment": "15697850529570392100421100482693",
        //         "message": null,
        //         "parameters": null,
        //         "status": 200
        //     }
        //
        const data = this.safeValue (response, 'attachment');
        return this.parseOrder (data, market);
    }

    async cancelOrder (id: string, symbol: string = undefined, params = {}) {
        /**
         * @method
         * @name ace#cancelOrder
         * @description cancels an open order
         * @see https://github.com/ace-exchange/ace-official-api-docs/blob/master/api_v2.md#open-api---cancel-order
         * @param {string} id order id
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the ace api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const request = {
            'orderNo': id,
        };
        const response = await this.privatePostV2OrderCancel (this.extend (request, params));
        //
        //     {
        //         "attachment": 200,
        //         "message": null,
        //         "parameters": null,
        //         "status": 200
        //     }
        //
        return response;
    }

    async fetchOrder (id: string, symbol: string = undefined, params = {}) {
        /**
         * @method
         * @name ace#fetchOrder
         * @description fetches information on an order made by the user
         * @see https://github.com/ace-exchange/ace-official-api-docs/blob/master/api_v2.md#open-api---order-status
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the ace api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const request = {
            'orderNo': id,
        };
        const response = await this.privatePostV2OrderShowOrderStatus (this.extend (request, params));
        //
        //     {
        //         "attachment": {
        //             "buyOrSell": 1,
        //             "averagePrice": "490849.75000000",
        //             "num": "0.00000000",
        //             "orderTime": "2022-11-29 18:03:06.318",
        //             "price": "490849.75000000",
        //             "status": 4,
        //             "tradeNum": "0.02697000",
        //             "remainNum": "0.97303000",
        //             "baseCurrencyId": 2,
        //             "baseCurrencyName": "BTC",
        //             "quoteCurrencyId": 1,
        //             "quoteCurrencyName": "TWD",
        //             "orderNo": "16697161898600391472461100244406"
        //         },
        //         "message": null,
        //         "parameters": null,
        //         "status": 200
        //     }
        //
        const data = this.safeValue (response, 'attachment');
        return this.parseOrder (data, undefined);
    }

    async fetchOpenOrders (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name ace#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @see https://github.com/ace-exchange/ace-official-api-docs/blob/master/api_v2.md#open-api---order-list
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the ace api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOpenOrders() requires the symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'quoteCurrencyId': market['quoteId'],
            'baseCurrencyId': market['baseId'],
            // 'start': 0,
        };
        if (limit !== undefined) {
            request['size'] = limit;
        }
        const response = await this.privatePostV2OrderGetOrderList (this.extend (request, params));
        const orders = this.safeValue (response, 'attachment');
        //
        //     {
        //         "attachment": [
        //             {
        //                 "uid": 0,
        //                 "orderNo": "16113081376560890227301101413941",
        //                 "orderTime": "2021-01-22 17:35:37",
        //                 "orderTimeStamp": 1611308137656,
        //                 "baseCurrencyId": 1,
        //                 "baseCurrencyName": "TWD",
        //                 "quoteCurrencyId": 14,
        //                 "quoteCurrencyName": "USDT",
        //                 "buyOrSell": "1",
        //                 "num": "6.0000000000000000",
        //                 "price": "32.5880000000000000",
        //                 "remainNum": "2.0000000000000000",
        //                 "tradeNum": "4.0000000000000000",
        //                 "tradePrice": "31.19800000000000000000",
        //                 "tradeAmount": "124.7920000000000000",
        //                 "tradeRate": "0.66666666666666666667",
        //                 "status": 1,
        //                 "type": 1
        //             }
        //         ],
        //         "message": null,
        //         "parameters": null,
        //         "status": 200
        //     }
        //
        return this.parseOrders (orders, market, since, limit);
    }

    parseTrade (trade, market = undefined) {
        //
        // fetchOrderTrades
        //         {
        //             "amount": 0.0030965,
        //             "tradeNo": "15681920522485652100751000417788",
        //             "price": "0.03096500",
        //             "num": "0.10000000",
        //             "bi": 1,
        //             "time": "2019-09-11 16:54:12.248"
        //         }
        //
        // fetchMyTrades
        //         {
        //             "buyOrSell": 1,
        //             "orderNo": "16708156853695560053601100247906",
        //             "num": "1",
        //             "price": "16895",
        //             "orderAmount": "16895",
        //             "tradeNum": "0.1",
        //             "tradePrice": "16895",
        //             "tradeAmount": "1689.5",
        //             "fee": "0",
        //             "feeSave": "0",
        //             "status": 1,
        //             "isSelf": false,
        //             "tradeNo": "16708186395087940051961000274150",
        //             "tradeTime": "2022-12-12 12:17:19",
        //             "tradeTimestamp": 1670818639508,
        //             "quoteCurrencyId": 14,
        //             "quoteCurrencyName": "USDT",
        //             "baseCurrencyId": 2,
        //             "baseCurrencyName": "BTC"
        //         }
        const id = this.safeString (trade, 'tradeNo');
        const price = this.safeString (trade, 'price');
        const amount = this.safeString (trade, 'num');
        let timestamp = this.safeInteger (trade, 'tradeTimestamp');
        if (timestamp === undefined) {
            const datetime = this.safeString2 (trade, 'time', 'tradeTime');
            timestamp = this.parse8601 (datetime);
            timestamp = timestamp - 28800000; // 8 hours normalize timestamp
        }
        let symbol = market['symbol'];
        const quoteId = this.safeString (trade, 'quoteCurrencyName');
        const baseId = this.safeString (trade, 'baseCurrencyName');
        if (quoteId !== undefined && baseId !== undefined) {
            symbol = baseId + '/' + quoteId;
        }
        let side = undefined;
        const tradeSide = this.safeNumber (trade, 'buyOrSell');
        if (tradeSide !== undefined) {
            side = (tradeSide === 1) ? 'buy' : 'sell';
        }
        const feeString = this.safeString (trade, 'fee');
        let fee = undefined;
        if (feeString !== undefined) {
            const feeSaveString = this.safeString (trade, 'feeSave');
            fee = {
                'cost': Precise.stringSub (feeString, feeSaveString),
                'currency': quoteId,
            };
        }
        return this.safeTrade ({
            'info': trade,
            'id': id,
            'order': this.safeString (trade, 'orderNo'),
            'symbol': symbol,
            'side': side,
            'type': undefined,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'fee': fee,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        }, market);
    }

    async fetchOrderTrades (id: string, symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name ace#fetchOrderTrades
         * @description fetch all the trades made from a single order
         * @see https://github.com/ace-exchange/ace-official-api-docs/blob/master/api_v2.md#open-api---order-history
         * @param {string} id order id
         * @param {string} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch trades for
         * @param {int|undefined} limit the maximum number of trades to retrieve
         * @param {object} params extra parameters specific to the ace api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
         */
        await this.loadMarkets ();
        const market = this.safeMarket (symbol);
        const request = {
            'orderNo': id,
        };
        const response = await this.privatePostV2OrderShowOrderHistory (this.extend (request, params));
        //
        //     {
        //         "attachment": {
        //             "order": {
        //                 "buyOrSell": 1,
        //                 "averagePrice": "491343.74000000",
        //                 "num": "1.00000000",
        //                 "orderTime": "2022-11-29 18:32:22.232",
        //                 "price": "491343.74000000",
        //                 "status": 1,
        //                 "tradeNum": "0.01622200",
        //                 "remainNum": "0.98377800",
        //                 "baseCurrencyId": 2,
        //                 "baseCurrencyName": "BTC",
        //                 "quoteCurrencyId": 1,
        //                 "quoteCurrencyName": "TWD",
        //                 "orderNo": "16697179457740441472471100214402"
        //             },
        //             "trades": [
        //                 {
        //                     "price": "491343.74000000",
        //                     "num": "0.01622200",
        //                     "time": "2022-11-29 18:32:25.789",
        //                     "tradeNo": "16697179457897791471461000223437",
        //                     "amount": "7970.57815028"
        //                 }
        //             ]
        //         },
        //         "message": null,
        //         "parameters": null,
        //         "status": 200
        //     }
        //
        const data = this.safeValue (response, 'attachment');
        const trades = this.safeValue (data, 'trades');
        if (trades === undefined) {
            return trades;
        }
        return this.parseTrades (trades, market, since, limit);
    }

    async fetchMyTrades (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name ace#fetchMyTrades
         * @description fetch all trades made by the user
         * @see https://github.com/ace-exchange/ace-official-api-docs/blob/master/api_v2.md#open-api---trade-list
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the ace api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const market = this.safeMarket (symbol);
        const request = {
            // 'buyOrSell': 1,
            // 'start': 0,
        };
        if (market['id'] !== undefined) {
            request['quoteCurrencyId'] = market['quoteId'];
            request['baseCurrencyId'] = market['baseId'];
        }
        if (limit !== undefined) {
            request['size'] = limit; // default 10, max 500
        }
        const response = await this.privatePostV2OrderGetTradeList (this.extend (request, params));
        //
        //     {
        //         "attachment": [
        //             {
        //                 "buyOrSell": 1,
        //                 "orderNo": "16708156853695560053601100247906",
        //                 "num": "1",
        //                 "price": "16895",
        //                 "orderAmount": "16895",
        //                 "tradeNum": "0.1",
        //                 "tradePrice": "16895",
        //                 "tradeAmount": "1689.5",
        //                 "fee": "0",
        //                 "feeSave": "0",
        //                 "status": 1,
        //                 "isSelf": false,
        //                 "tradeNo": "16708186395087940051961000274150",
        //                 "tradeTime": "2022-12-12 12:17:19",
        //                 "tradeTimestamp": 1670818639508,
        //                 "quoteCurrencyId": 14,
        //                 "quoteCurrencyName": "USDT",
        //                 "baseCurrencyId": 2,
        //                 "baseCurrencyName": "BTC"
        //             }
        //         ],
        //         "message": null,
        //         "parameters": null,
        //         "status": 200
        //     }
        //
        const trades = this.safeValue (response, 'attachment', []);
        return this.parseTrades (trades, market, since, limit);
    }

    parseBalance (response) {
        //
        //     [
        //         {
        //             "currencyId": 4,
        //             "amount": 6.896,
        //             "cashAmount": 6.3855,
        //             "uid": 123,
        //             "currencyName": "BTC"
        //         }
        //     ]
        //
        const result = {
            'info': response,
        };
        for (let i = 0; i < response.length; i++) {
            const balance = response[i];
            const currencyId = this.safeString (balance, 'currencyName');
            const code = this.safeCurrencyCode (currencyId);
            const amount = this.safeString (balance, 'amount');
            const available = this.safeString (balance, 'cashAmount');
            const account = {
                'free': available,
                'total': amount,
            };
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    async fetchBalance (params = {}) {
        /**
         * @method
         * @name ace#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @see https://github.com/ace-exchange/ace-official-api-docs/blob/master/api_v2.md#open-api---account-balance
         * @param {object} params extra parameters specific to the ace api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.loadMarkets ();
        const response = await this.privatePostV2CoinCustomerAccount (params);
        const balances = this.safeValue (response, 'attachment', []);
        //
        //     {
        //         "attachment":[
        //             {
        //                 "currencyId": 4,
        //                 "amount": 6.896,
        //                 "cashAmount": 6.3855,
        //                 "uid": 123,
        //                 "currencyName": "BTC"
        //             }
        //         ],
        //         message: null,
        //         parameters: null,
        //         status: '200'
        //     }
        //
        return this.parseBalance (balances);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (headers === undefined) {
            headers = {};
        }
        if (api === 'private') {
            this.checkRequiredCredentials ();
            const nonce = this.milliseconds ();
            let auth = 'ACE_SIGN' + this.secret;
            const data = this.extend ({
                'apiKey': this.apiKey,
                'timeStamp': nonce,
            }, params);
            const dataKeys = Object.keys (data);
            const sortedDataKeys = this.sortBy (dataKeys, 0);
            for (let i = 0; i < sortedDataKeys.length; i++) {
                const key = sortedDataKeys[i];
                auth += this.safeString (data, key);
            }
            const signature = this.hash (this.encode (auth), sha256, 'hex');
            data['signKey'] = signature;
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
            };
            if (method === 'POST') {
                const brokerId = this.safeString (this.options, 'brokerId');
                if (brokerId !== undefined) {
                    headers['Referer'] = brokerId;
                }
            }
            body = this.urlencode (data);
        } else if (api === 'public' && method === 'GET') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        }
        url = this.urls['api'][api] + url;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return undefined; // fallback to the default error handler
        }
        const feedback = this.id + ' ' + body;
        const status = this.safeNumber (response, 'status', 200);
        if (status > 200) {
            this.throwExactlyMatchedException (this.exceptions['exact'], status, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], status, feedback);
        }
        return undefined;
    }
}
