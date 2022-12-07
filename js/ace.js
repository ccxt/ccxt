'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired } = require ('./base/errors');
const { TICK_SIZE } = require ('./base/functions/number');

//  ---------------------------------------------------------------------------

module.exports = class ace extends Exchange {
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
                'fetchMyTrades': false,
                'fetchOHLCV': true,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrders': false,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
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
                '1m': '1m',
                '5m': '5m',
                '10m': '10m',
                '30m': '30m',
                '1h': '1h',
                '2h': '2h',
                '4h': '4h',
                '8h': '8h',
                '12h': '12h',
                '1d': '1d',
                '1w': '1w',
                '1M': '1M',
            },
            'urls': {
                'logo': '',
                'api': {
                    'public': 'https://ace.io/polarisex/oapi',
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
                'phone': true,
            },
            'api': {
                'public': {
                    'get': [
                        'list/tradePrice',
                        'list/marketPair',
                        'list/orderBooks/{base}/{quote}',
                    ],
                },
                'private': {
                    'post': [
                        'v1/coin/customerAccount',
                        'v1/kline/getKlineMin',
                        'v1/order/order',
                        'v1/order/cancel',
                        'v1/order/getOrderList',
                        'v1/order/showOrderStatus',
                        'v1/order/showOrderHistory',
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
                'networks': {
                    'ERC20': 'ERC20',
                    'ETH': 'ERC20',
                    'TRX': 'TRX',
                    'TRC20': 'TRX',
                },
                'currencyToId': {
                    'TWD': 1,
                    'BTC': 2,
                    'ETH': 4,
                    'LTC': 7,
                    'XRP': 10,
                    'EOS': 11,
                    'XLM': 12,
                    'TRX': 13,
                    'USDT': 14,
                    'BNB': 17,
                    'BTT': 19,
                    // 'HWGC': 22,
                    'GTO': 54,
                    'USDC': 57,
                    'MOT': 58,
                    // 'UNI': 59,
                    'MOS': 65,
                    'MOCT': 66,
                    'PT': 67,
                    'DET': 70,
                    'SOLO': 71,
                    'QQQ': 72,
                    'APT': 73,
                    'HT': 74,
                    'UNI': 75,
                    'QTC': 76,
                    'MCO': 79,
                    'FTT': 81,
                    'BAAS': 83,
                    'OKB': 84,
                    'DAI': 85,
                    'MCC': 86,
                    'TACEX': 87,
                    'ACEX': 88,
                    'LINK': 89,
                    'DEC': 90,
                    'FANSI': 91,
                    'HWGC': 93,
                    'KNC': 94,
                    'COMP': 95,
                    'DS': 96,
                    'CRO': 97,
                    'CREAM': 101,
                    'YFI': 102,
                    'WNXM': 103,
                    'MITH': 104,
                    'DEAC': 105,
                    'ENJ': 107,
                    'ANKR': 108,
                    'MANA': 109,
                    'SXP': 110,
                    'CHZ': 111,
                    'DOT': 112,
                    'CAKE': 114,
                    'SHIB': 115,
                    'DOGE': 116,
                    'MATIC': 117,
                    'WOO': 119,
                    'SLP': 120,
                    'AXS': 121,
                    'ADA': 122,
                    'QUICK': 123,
                    'FTM': 124,
                    'YGG': 126,
                    'GALA': 127,
                    'ILV': 128,
                    'DYDX': 129,
                    'SOL': 130,
                    'SAND': 131,
                    'AVAX': 132,
                    'LOOKS': 133,
                    'DEP': 134,
                    'APE': 135,
                    'GMT': 136,
                },
            },
            'precisionMode': TICK_SIZE,
            'exceptions': {
                'exact': {
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
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {[object]} an array of objects representing market data
         */
        let response = await this.publicGetListMarketPair ();
        // temporary workaround to finx json string
        if (response.indexOf ('\'') >= 0) {
            // this line didn't work in php
            response = response.replace (/'/g, '"');
            response = this.parseJson (response);
        }
        //
        //     ['ADA/TWD']
        //
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const id = response[i];
            const splitMarket = id.split ('/');
            const baseId = this.safeString (splitMarket, 0);
            const quoteId = this.safeString (splitMarket, 1);
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const limits = {
                'amount': {
                    'min': undefined,
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
                'leverage': {
                    'min': undefined,
                    'max': undefined,
                },
            };
            result.push ({
                'id': id,
                'uppercaseId': undefined,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': base,
                'quoteId': quote,
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
                'limits': limits,
                'precision': {
                    'price': undefined,
                    'amount': undefined,
                },
                'active': undefined,
                'info': id,
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
        market = this.safeMarket (marketId);
        const symbol = this.safeString (market, 'symbol');
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

    async fetchTicker (symbol, params = {}) {
        /**
         * @method
         * @name ace#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the ace api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const response = await this.publicGetListTradePrice (params);
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
        ticker['id'] = marketId;
        return this.parseTicker (ticker, market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        /**
         * @method
         * @name ace#fetchTickers
         * @description fetches price tickers for multiple markets, statistical calculations with the information calculated over the past 24 hours each market
         * @param {[string]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} params extra parameters specific to the ace api endpoint
         * @returns {object} an array of [ticker structures]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        const response = await this.publicGetListTradePrice ();
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
            const ticker = this.safeValue (response, marketId);
            ticker['id'] = marketId;
            tickers.push (ticker);
        }
        return this.parseTickers (tickers, symbols);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name ace#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the ace api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'base': market['base'],
            'quote': market['quote'],
        };
        const response = await this.publicGetListOrderBooksBaseQuote (this.extend (request, params));
        //
        //     {
        //         "market_pair":"BTC/TWD",
        //         "orderbook": {
        //             "asks": [
        //                 [
        //                     "0.449612",
        //                     "1800000"
        //                 ],
        //                 [
        //                     "0.001",
        //                     "1980000"
        //                 ]
        //             ],
        //             "bids": [
        //                 [
        //                     "0.017087",
        //                     "1165121.4"
        //                 ],
        //                 [
        //                     "0.01",
        //                     "1165121.2"
        //                 ]
        //             ]
        //         }
        //     }
        //
        const orderBook = this.safeValue (response, 'orderbook');
        return this.parseOrderBook (orderBook, market['symbol'], undefined, 'bids', 'asks');
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        //
        //     {
        //         "changeRate": 0,
        //         "closePrice": 101000.0,
        //         "lowPrice": 101000.0,
        //         "highPrice": 101000.0,
        //         "highPrice": 1573195740000L,
        //         "openPrice": 101000.0,
        //         "current": 101000.0,
        //         "createTime": "2019-11-08 14:49:00"
        //     }
        //
        return [
            this.parse8601 (this.safeString (ohlcv, 'createTime')),
            this.safeNumber (ohlcv, 'openPrice'),
            this.safeNumber (ohlcv, 'highPrice'),
            this.safeNumber (ohlcv, 'lowPrice'),
            this.safeNumber (ohlcv, 'closePrice'),
            undefined,
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name ace#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
         * @param {int|undefined} limit the maximum amount of candles to fetch
         * @param {object} params extra parameters specific to the ace api endpoint
         * @returns {[[int]]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const currencyToId = this.safeValue (this.options, 'currencyToId');
        const request = {
            'baseCurrencyId': this.safeNumber (currencyToId, market['quoteId']),
            'tradeCurrencyId': this.safeNumber (currencyToId, market['baseId']),
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privatePostV1KlineGetKlineMin (this.extend (request, params));
        const data = this.safeValue (response, 'attachment', []);
        //
        //     {
        //         "attachment":[
        //                 {
        //                     "changeRate": 0,
        //                     "closePrice": 101000.0,
        //                     "lowPrice": 101000.0,
        //                     "highPrice": 101000.0,
        //                     "highPrice": 1573195740000L,
        //                     "openPrice": 101000.0,
        //                     "current": 101000.0,
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
        };
        return this.safeString (statuses, status, undefined);
    }

    parseOrder (order, market = undefined) {
        //
        // createOrder
        //         "15697850529570392100421100482693"
        //
        // fetchOrders
        //         {
        //             "uid": 0,
        //             "orderNo": "16113081376560890227301101413941",
        //             "orderTime": "2021-01-22 17:35:37",
        //             "orderTimeStamp": 1611308137656,
        //             "baseCurrencyId": 1,
        //             "baseCurrencyNameEn": "TWD",
        //             "currencyId": 14,
        //             "currencyNameEn": "USDT",
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
        if (typeof order === 'string') {
            id = order;
        } else {
            id = this.safeString (order, 'orderNo');
            timestamp = this.safeInteger (order, 'orderTimeStamp');
            const orderSide = this.safeNumber (order, 'buyOrSell');
            side = (orderSide === 1) ? 'buy' : 'sell';
            amount = this.safeString (order, 'num');
            price = this.safeString (order, 'price');
            const quoteId = this.safeString (order, 'baseCurrencyNameEn');
            const baseId = this.safeString (order, 'currencyNameEn');
            if (quoteId !== undefined && baseId !== undefined) {
                symbol = baseId + '/' + quoteId;
            }
            const orderType = this.safeNumber (order, 'type');
            type = (orderType === 1) ? 'limit' : 'market';
            filled = this.safeString (order, 'tradeNum');
            remaining = this.safeString (order, 'remainNum');
            status = this.parseOrderStatus (this.safeString (order, 'status'));
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
            'average': undefined,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': undefined,
            'trades': undefined,
            'info': undefined,
        }, market);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name ace#createOrder
         * @description create a trade order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float|undefined} price the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} params extra parameters specific to the ace api endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const orderType = type.toUpperCase ();
        const orderSide = side.toUpperCase ();
        const currencyToId = this.safeValue (this.options, 'currencyToId');
        const request = {
            'baseCurrencyId': this.safeNumber (currencyToId, market['quoteId']),
            'currencyId': this.safeNumber (currencyToId, market['baseId']),
            'type': (orderType === 'LIMIT') ? 1 : 2,
            'buyOrSell': (orderSide === 'BUY') ? 1 : 2,
            'num': amount,
            'price': price,
        };
        const response = await this.privatePostV1OrderOrder (this.extend (request, params), params);
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

    async cancelOrder (id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name ace#cancelOrder
         * @description cancels an open order
         * @param {string} id order id
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the ace api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const request = {
            'orderNo': id,
        };
        const response = await this.privatePostV1OrderCancel (this.extend (request, params));
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

    async fetchOrder (id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name ace#fetchOrder
         * @description fetches information on an order made by the user
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the ace api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const request = {
            'orderId': id,
        };
        const response = await this.privatePostV1OrderShowOrderStatus (this.extend (request, params));
        //
        //     {
        //         "attachment": {
        //         "remainNum": "0.00000000",
        //         "orderNo": "15681910422154042100431100441305",
        //         "num": "0.85000000",
        //         "tradeNum": "0.85000000",
        //         "baseCurrencyId": 2,
        //         "baseCurrencyName": "Bitcoin",
        //         "buyOrSell": 1,
        //         "orderTime": "2019-09-11 16:37:22.216",
        //         "currencyName": "Ethereum",
        //         "price": "0.03096500",
        //         "averagePrice": "0.03096500",
        //         "currencyId": 4,
        //         "status": 2
        //         },
        //         "message": null,
        //         "parameters": null,
        //         "status": 200
        //     }
        //
        const data = this.safeValue (response, 'attachment');
        return this.parseOrder (data, undefined);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name ace#fetchOrders
         * @description fetches information on multiple orders made by the user
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the ace api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrders() requires the symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const currencyToId = this.safeValue (this.options, 'currencyToId');
        const request = {
            'baseCurrencyId': this.safeNumber (currencyToId, market['quoteId']),
            'tradeCurrencyId': this.safeNumber (currencyToId, market['baseId']),
            // 'start': 0,
        };
        if (since !== undefined) {
            request['startTimestamp'] = since;
        }
        if (limit !== undefined) {
            request['size'] = limit;
        }
        const response = await this.privatePostV1OrderGetOrderList (this.extend (request, params), params);
        let orders = this.safeValue (response, 'attachment');
        if (orders === undefined) {
            orders = [];
        }
        //
        //     {
        //         "attachment": [
        //             {
        //                 "uid": 0,
        //                 "orderNo": "16113081376560890227301101413941",
        //                 "orderTime": "2021-01-22 17:35:37",
        //                 "orderTimeStamp": 1611308137656,
        //                 "baseCurrencyId": 1,
        //                 "baseCurrencyNameEn": "TWD",
        //                 "currencyId": 14,
        //                 "currencyNameEn": "USDT",
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
        //     {
        //         "amount": 0.0030965,
        //         "tradeNo": "15681920522485652100751000417788",
        //         "price": "0.03096500",
        //         "num": "0.10000000",
        //         "bi": 1,
        //         "time": "2019-09-11 16:54:12.248"
        //     }
        //
        const id = this.safeString (trade, 'tradeNo');
        const price = this.safeString (trade, 'price');
        const amount = this.safeString (trade, 'num');
        const datetime = this.safeString (trade, 'time');
        return this.safeTrade ({
            'info': trade,
            'id': id,
            'order': undefined,
            'symbol': undefined,
            'side': undefined,
            'type': undefined,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'fee': undefined,
            'timestamp': this.parse8601 (datetime),
            'datetime': datetime,
        }, market);
    }

    async fetchOrderTrades (id, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name ace#fetchOrderTrades
         * @description fetch all the trades made from a single order
         * @param {string} id order id
         * @param {string} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch trades for
         * @param {int|undefined} limit the maximum number of trades to retrieve
         * @param {object} params extra parameters specific to the ace api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html#trade-structure}
         */
        await this.loadMarkets ();
        const market = this.safeMarket (symbol);
        const request = {
            'orderId': id,
        };
        const response = await this.privatePostV1OrderShowOrderHistory (this.extend (request, params));
        //
        //     {
        //         "attachment": {
        //             "trades": [
        //                 {
        //                     "amount": 0.0030965,
        //                     "tradeNo": "15681920522485652100751000417788",
        //                     "price": "0.03096500",
        //                     "num": "0.10000000",
        //                     "bi": 1,
        //                     "time": "2019-09-11 16:54:12.248"
        //                 },
        //                 {
        //                     "amount": 0.02322375,
        //                     "tradeNo": "15682679767395912100751000467937",
        //                     "price": "0.03096500",
        //                     "num": "0.75000000",
        //                     "bi": 1,
        //                     "time": "2019-09-12 13:59:36.739"
        //                 }
        //             ],
        //             "order": {
        //                 "remainNum": "0.00000000",
        //                 "orderNo": "15681910422154042100431100441305",
        //                 "num": "0.85000000",
        //                 "tradeNum": "0.85000000",
        //                 "baseCurrencyId": 2,
        //                 "baseCurrencyName": "Bitcoin",
        //                 "buyOrSell": 1,
        //                 "orderTime": "2019-09-11 16:37:22.216",
        //                 "currencyName": "Ethereum",
        //                 "price": "0.03096500",
        //                 "averagePrice": "0.03096500",
        //                 "currencyId": 4,
        //                 "status": 2
        //             }
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
        return await this.parseTrades (trades, market, since, limit);
    }

    parseBalance (response) {
        //
        //     [
        //         {
        //             "currencyId": 4,
        //             "amount": 6.896,
        //             "cashAmount": 6.3855,
        //             "uid": 123,
        //             "currencyNameEn": "BTC"
        //         }
        //     ]
        //
        const result = {
            'info': response,
        };
        for (let i = 0; i < response.length; i++) {
            const balance = response[i];
            const currencyId = this.safeString (balance, 'currencyNameEn');
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
         * @param {object} params extra parameters specific to the ace api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.loadMarkets ();
        const response = await this.privatePostV1CoinCustomerAccount (params);
        const balances = this.safeValue (response, 'attachment', []);
        //
        //     {
        //         "attachment":[
        //             {
        //                 "currencyId": 4,
        //                 "amount": 6.896,
        //                 "cashAmount": 6.3855,
        //                 "uid": 123,
        //                 "currencyNameEn": "BTC"
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
            const auth = 'ACE_SIGN' + nonce.toString () + this.phone;
            const signature = this.hash (auth, 'md5', 'hex');
            const splitKey = this.apiKey.split ('#');
            const uid = (this.uid) ? this.uid : splitKey[0];
            const data = this.extend ({
                'uid': uid,
                'timeStamp': nonce,
                'signKey': signature,
                'apiKey': this.apiKey,
                'securityKey': this.secret,
            }, params);
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
            };
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
            return; // fallback to the default error handler
        }
        if (code >= 200 && code < 300) {
            return;
        }
        const feedback = this.id + ' ' + body;
        const error = this.safeString (response, 'error');
        this.throwExactlyMatchedException (this.exceptions['exact'], error, feedback);
        this.throwBroadlyMatchedException (this.exceptions['broad'], error, feedback);
        throw new ExchangeError (feedback); // unknown message
    }
};
