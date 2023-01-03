'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, AuthenticationError, InvalidNonce, InsufficientFunds, InvalidOrder, OrderNotFound, PermissionDenied } = require ('./base/errors');
const { TICK_SIZE } = require ('./base/functions/number');

//  ---------------------------------------------------------------------------

module.exports = class bitbank extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitbank',
            'name': 'bitbank',
            'countries': [ 'JP' ],
            'version': 'v1',
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'addMargin': false,
                'cancelOrder': true,
                'createOrder': true,
                'createReduceOnlyOrder': false,
                'fetchBalance': true,
                'fetchBorrowRate': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchBorrowRates': false,
                'fetchBorrowRatesPerSymbol': false,
                'fetchDepositAddress': true,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchLeverage': false,
                'fetchLeverageTiers': false,
                'fetchMarginMode': false,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchPosition': false,
                'fetchPositionMode': false,
                'fetchPositions': false,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': true,
                'fetchTransfer': false,
                'fetchTransfers': false,
                'reduceMargin': false,
                'setLeverage': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'transfer': false,
                'withdraw': true,
            },
            'timeframes': {
                '1m': '1min',
                '5m': '5min',
                '15m': '15min',
                '30m': '30min',
                '1h': '1hour',
                '4h': '4hour',
                '8h': '8hour',
                '12h': '12hour',
                '1d': '1day',
                '1w': '1week',
            },
            'hostname': 'bitbank.cc',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/37808081-b87f2d9c-2e59-11e8-894d-c1900b7584fe.jpg',
                'api': {
                    'public': 'https://public.{hostname}',
                    'private': 'https://api.{hostname}',
                    'markets': 'https://api.{hostname}',
                },
                'www': 'https://bitbank.cc/',
                'doc': 'https://docs.bitbank.cc/',
                'fees': 'https://bitbank.cc/docs/fees/',
            },
            'api': {
                'public': {
                    'get': [
                        '{pair}/ticker',
                        '{pair}/depth',
                        '{pair}/transactions',
                        '{pair}/transactions/{yyyymmdd}',
                        '{pair}/candlestick/{candletype}/{yyyymmdd}',
                    ],
                },
                'private': {
                    'get': [
                        'user/assets',
                        'user/spot/order',
                        'user/spot/active_orders',
                        'user/spot/trade_history',
                        'user/withdrawal_account',
                    ],
                    'post': [
                        'user/spot/order',
                        'user/spot/cancel_order',
                        'user/spot/cancel_orders',
                        'user/spot/orders_info',
                        'user/request_withdrawal',
                    ],
                },
                'markets': {
                    'get': [
                        'spot/pairs',
                    ],
                },
            },
            'precisionMode': TICK_SIZE,
            'exceptions': {
                '20001': AuthenticationError,
                '20002': AuthenticationError,
                '20003': AuthenticationError,
                '20005': AuthenticationError,
                '20004': InvalidNonce,
                '40020': InvalidOrder,
                '40021': InvalidOrder,
                '40025': ExchangeError,
                '40013': OrderNotFound,
                '40014': OrderNotFound,
                '50008': PermissionDenied,
                '50009': OrderNotFound,
                '50010': OrderNotFound,
                '60001': InsufficientFunds,
                '60005': InvalidOrder,
            },
        });
    }

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name bitbank#fetchMarkets
         * @description retrieves data on all markets for bitbank
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {[object]} an array of objects representing market data
         */
        const response = await this.marketsGetSpotPairs (params);
        //
        //     {
        //       "success": 1,
        //       "data": {
        //         "pairs": [
        //           {
        //             "name": "btc_jpy",
        //             "base_asset": "btc",
        //             "quote_asset": "jpy",
        //             "maker_fee_rate_base": "0",
        //             "taker_fee_rate_base": "0",
        //             "maker_fee_rate_quote": "-0.0002",
        //             "taker_fee_rate_quote": "0.0012",
        //             "unit_amount": "0.0001",
        //             "limit_max_amount": "1000",
        //             "market_max_amount": "10",
        //             "market_allowance_rate": "0.2",
        //             "price_digits": 0,
        //             "amount_digits": 4,
        //             "is_enabled": true,
        //             "stop_order": false,
        //             "stop_order_and_cancel": false
        //           }
        //         ]
        //       }
        //     }
        //
        const data = this.safeValue (response, 'data');
        const pairs = this.safeValue (data, 'pairs', []);
        const result = [];
        for (let i = 0; i < pairs.length; i++) {
            const entry = pairs[i];
            const id = this.safeString (entry, 'name');
            const baseId = this.safeString (entry, 'base_asset');
            const quoteId = this.safeString (entry, 'quote_asset');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            result.push ({
                'id': id,
                'symbol': base + '/' + quote,
                'base': base,
                'quote': quote,
                'settle': undefined,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': undefined,
                'type': 'spot',
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'active': this.safeValue (entry, 'is_enabled'),
                'contract': false,
                'linear': undefined,
                'inverse': undefined,
                'taker': this.safeNumber (entry, 'taker_fee_rate_quote'),
                'maker': this.safeNumber (entry, 'maker_fee_rate_quote'),
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': this.parseNumber (this.parsePrecision (this.safeString (entry, 'amount_digits'))),
                    'price': this.parseNumber (this.parsePrecision (this.safeString (entry, 'price_digits'))),
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': {
                        'min': this.safeNumber (entry, 'unit_amount'),
                        'max': this.safeNumber (entry, 'limit_max_amount'),
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
                'info': entry,
            });
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        const symbol = this.safeSymbol (undefined, market);
        const timestamp = this.safeInteger (ticker, 'timestamp');
        const last = this.safeString (ticker, 'last');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'high'),
            'low': this.safeString (ticker, 'low'),
            'bid': this.safeString (ticker, 'buy'),
            'bidVolume': undefined,
            'ask': this.safeString (ticker, 'sell'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeString (ticker, 'vol'),
            'quoteVolume': undefined,
            'info': ticker,
        }, market);
    }

    async fetchTicker (symbol, params = {}) {
        /**
         * @method
         * @name bitbank#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the bitbank api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
        };
        const response = await this.publicGetPairTicker (this.extend (request, params));
        const data = this.safeValue (response, 'data', {});
        return this.parseTicker (data, market);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitbank#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the bitbank api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
        };
        const response = await this.publicGetPairDepth (this.extend (request, params));
        const orderbook = this.safeValue (response, 'data', {});
        const timestamp = this.safeInteger (orderbook, 'timestamp');
        return this.parseOrderBook (orderbook, market['symbol'], timestamp);
    }

    parseTrade (trade, market = undefined) {
        const timestamp = this.safeInteger (trade, 'executed_at');
        market = this.safeMarket (undefined, market);
        const priceString = this.safeString (trade, 'price');
        const amountString = this.safeString (trade, 'amount');
        const id = this.safeString2 (trade, 'transaction_id', 'trade_id');
        const takerOrMaker = this.safeString (trade, 'maker_taker');
        let fee = undefined;
        const feeCostString = this.safeString (trade, 'fee_amount_quote');
        if (feeCostString !== undefined) {
            fee = {
                'currency': market['quote'],
                'cost': feeCostString,
            };
        }
        const orderId = this.safeString (trade, 'order_id');
        const type = this.safeString (trade, 'type');
        const side = this.safeString (trade, 'side');
        return this.safeTrade ({
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'id': id,
            'order': orderId,
            'type': type,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': priceString,
            'amount': amountString,
            'cost': undefined,
            'fee': fee,
            'info': trade,
        }, market);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitbank#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the bitbank api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
        };
        const response = await this.publicGetPairTransactions (this.extend (request, params));
        const data = this.safeValue (response, 'data', {});
        const trades = this.safeValue (data, 'transactions', []);
        return this.parseTrades (trades, market, since, limit);
    }

    async fetchTradingFees (params = {}) {
        /**
         * @method
         * @name bitbank#fetchTradingFees
         * @description fetch the trading fees for multiple markets
         * @param {object} params extra parameters specific to the bitbank api endpoint
         * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/en/latest/manual.html#fee-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const response = await this.marketsGetSpotPairs (params);
        //
        //     {
        //         success: '1',
        //         data: {
        //           pairs: [
        //             {
        //               name: 'btc_jpy',
        //               base_asset: 'btc',
        //               quote_asset: 'jpy',
        //               maker_fee_rate_base: '0',
        //               taker_fee_rate_base: '0',
        //               maker_fee_rate_quote: '-0.0002',
        //               taker_fee_rate_quote: '0.0012',
        //               unit_amount: '0.0001',
        //               limit_max_amount: '1000',
        //               market_max_amount: '10',
        //               market_allowance_rate: '0.2',
        //               price_digits: '0',
        //               amount_digits: '4',
        //               is_enabled: true,
        //               stop_order: false,
        //               stop_order_and_cancel: false
        //             },
        //             ...
        //           ]
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const pairs = this.safeValue (data, 'pairs', []);
        const result = {};
        for (let i = 0; i < pairs.length; i++) {
            const pair = pairs[i];
            const marketId = this.safeString (pair, 'name');
            const market = this.safeMarket (marketId);
            const symbol = market['symbol'];
            result[symbol] = {
                'info': pair,
                'symbol': symbol,
                'maker': this.safeNumber (pair, 'maker_fee_rate_quote'),
                'taker': this.safeNumber (pair, 'taker_fee_rate_quote'),
                'percentage': true,
                'tierBased': false,
            };
        }
        return result;
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        //     [
        //         "0.02501786",
        //         "0.02501786",
        //         "0.02501786",
        //         "0.02501786",
        //         "0.0000",
        //         1591488000000
        //     ]
        //
        return [
            this.safeInteger (ohlcv, 5),
            this.safeNumber (ohlcv, 0),
            this.safeNumber (ohlcv, 1),
            this.safeNumber (ohlcv, 2),
            this.safeNumber (ohlcv, 3),
            this.safeNumber (ohlcv, 4),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitbank#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
         * @param {int|undefined} limit the maximum amount of candles to fetch
         * @param {object} params extra parameters specific to the bitbank api endpoint
         * @returns {[[int]]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        if (since === undefined) {
            if (limit === undefined) {
                limit = 1000; // it doesn't have any defaults, might return 200, might 2000 (i.e. https://public.bitbank.cc/btc_jpy/candlestick/4hour/2020)
            }
            const duration = this.parseTimeframe (timeframe);
            since = this.milliseconds () - duration * 1000 * limit;
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
            'candletype': this.timeframes[timeframe],
            'yyyymmdd': this.yyyymmdd (since, ''),
        };
        const response = await this.publicGetPairCandlestickCandletypeYyyymmdd (this.extend (request, params));
        //
        //     {
        //         "success":1,
        //         "data":{
        //             "candlestick":[
        //                 {
        //                     "type":"5min",
        //                     "ohlcv":[
        //                         ["0.02501786","0.02501786","0.02501786","0.02501786","0.0000",1591488000000],
        //                         ["0.02501747","0.02501953","0.02501747","0.02501953","0.3017",1591488300000],
        //                         ["0.02501762","0.02501762","0.02500392","0.02500392","0.1500",1591488600000],
        //                     ]
        //                 }
        //             ],
        //             "timestamp":1591508668190
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const candlestick = this.safeValue (data, 'candlestick', []);
        const first = this.safeValue (candlestick, 0, {});
        const ohlcv = this.safeValue (first, 'ohlcv', []);
        return this.parseOHLCVs (ohlcv, market, timeframe, since, limit);
    }

    parseBalance (response) {
        const result = {
            'info': response,
            'timestamp': undefined,
            'datetime': undefined,
        };
        const data = this.safeValue (response, 'data', {});
        const assets = this.safeValue (data, 'assets', []);
        for (let i = 0; i < assets.length; i++) {
            const balance = assets[i];
            const currencyId = this.safeString (balance, 'asset');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeString (balance, 'free_amount');
            account['used'] = this.safeString (balance, 'locked_amount');
            account['total'] = this.safeString (balance, 'onhand_amount');
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    async fetchBalance (params = {}) {
        /**
         * @method
         * @name bitbank#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} params extra parameters specific to the bitbank api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.loadMarkets ();
        const response = await this.privateGetUserAssets (params);
        //
        //     {
        //       "success": "1",
        //       "data": {
        //         "assets": [
        //           {
        //             "asset": "jpy",
        //             "amount_precision": "4",
        //             "onhand_amount": "0.0000",
        //             "locked_amount": "0.0000",
        //             "free_amount": "0.0000",
        //             "stop_deposit": false,
        //             "stop_withdrawal": false,
        //             "withdrawal_fee": {
        //               "threshold": "30000.0000",
        //               "under": "550.0000",
        //               "over": "770.0000"
        //             }
        //           },
        //           {
        //             "asset": "btc",
        //             "amount_precision": "8",
        //             "onhand_amount": "0.00000000",
        //             "locked_amount": "0.00000000",
        //             "free_amount": "0.00000000",
        //             "stop_deposit": false,
        //             "stop_withdrawal": false,
        //             "withdrawal_fee": "0.00060000"
        //           },
        //         ]
        //       }
        //     }
        //
        return this.parseBalance (response);
    }

    parseOrderStatus (status) {
        const statuses = {
            'UNFILLED': 'open',
            'PARTIALLY_FILLED': 'open',
            'FULLY_FILLED': 'closed',
            'CANCELED_UNFILLED': 'canceled',
            'CANCELED_PARTIALLY_FILLED': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        const id = this.safeString (order, 'order_id');
        const marketId = this.safeString (order, 'pair');
        market = this.safeMarket (marketId, market);
        const timestamp = this.safeInteger (order, 'ordered_at');
        const price = this.safeString (order, 'price');
        const amount = this.safeString (order, 'start_amount');
        const filled = this.safeString (order, 'executed_amount');
        const remaining = this.safeString (order, 'remaining_amount');
        const average = this.safeString (order, 'average_price');
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const type = this.safeStringLower (order, 'type');
        const side = this.safeStringLower (order, 'side');
        return this.safeOrder ({
            'id': id,
            'clientOrderId': undefined,
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': market['symbol'],
            'type': type,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': undefined,
            'triggerPrice': undefined,
            'cost': undefined,
            'average': average,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'trades': undefined,
            'fee': undefined,
            'info': order,
        }, market);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name bitbank#createOrder
         * @description create a trade order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float|undefined} price the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} params extra parameters specific to the bitbank api endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
            'amount': this.amountToPrecision (symbol, amount),
            'side': side,
            'type': type,
        };
        if (type === 'limit') {
            request['price'] = this.priceToPrecision (symbol, price);
        }
        const response = await this.privatePostUserSpotOrder (this.extend (request, params));
        const data = this.safeValue (response, 'data');
        return this.parseOrder (data, market);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name bitbank#cancelOrder
         * @description cancels an open order
         * @param {string} id order id
         * @param {string|undefined} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the bitbank api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'order_id': id,
            'pair': market['id'],
        };
        const response = await this.privatePostUserSpotCancelOrder (this.extend (request, params));
        const data = this.safeValue (response, 'data');
        return data;
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name bitbank#fetchOrder
         * @description fetches information on an order made by the user
         * @param {string|undefined} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the bitbank api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'order_id': id,
            'pair': market['id'],
        };
        const response = await this.privateGetUserSpotOrder (this.extend (request, params));
        const data = this.safeValue (response, 'data');
        return this.parseOrder (data, market);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitbank#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch open orders for
         * @param {int|undefined} limit the maximum number of  open orders structures to retrieve
         * @param {object} params extra parameters specific to the bitbank api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
        };
        if (limit !== undefined) {
            request['count'] = limit;
        }
        if (since !== undefined) {
            request['since'] = parseInt (since / 1000);
        }
        const response = await this.privateGetUserSpotActiveOrders (this.extend (request, params));
        const data = this.safeValue (response, 'data', {});
        const orders = this.safeValue (data, 'orders', []);
        return this.parseOrders (orders, market, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitbank#fetchMyTrades
         * @description fetch all trades made by the user
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch trades for
         * @param {int|undefined} limit the maximum number of trades structures to retrieve
         * @param {object} params extra parameters specific to the bitbank api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html#trade-structure}
         */
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['pair'] = market['id'];
        }
        if (limit !== undefined) {
            request['count'] = limit;
        }
        if (since !== undefined) {
            request['since'] = parseInt (since / 1000);
        }
        const response = await this.privateGetUserSpotTradeHistory (this.extend (request, params));
        const data = this.safeValue (response, 'data', {});
        const trades = this.safeValue (data, 'trades', []);
        return this.parseTrades (trades, market, since, limit);
    }

    async fetchDepositAddress (code, params = {}) {
        /**
         * @method
         * @name bitbank#fetchDepositAddress
         * @description fetch the deposit address for a currency associated with this account
         * @param {string} code unified currency code
         * @param {object} params extra parameters specific to the bitbank api endpoint
         * @returns {object} an [address structure]{@link https://docs.ccxt.com/en/latest/manual.html#address-structure}
         */
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'asset': currency['id'],
        };
        const response = await this.privateGetUserWithdrawalAccount (this.extend (request, params));
        const data = this.safeValue (response, 'data', {});
        // Not sure about this if there could be more than one account...
        const accounts = this.safeValue (data, 'accounts', []);
        const firstAccount = this.safeValue (accounts, 0, {});
        const address = this.safeString (firstAccount, 'address');
        return {
            'currency': currency,
            'address': address,
            'tag': undefined,
            'network': undefined,
            'info': response,
        };
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        /**
         * @method
         * @name bitbank#withdraw
         * @description make a withdrawal
         * @param {string} code unified currency code
         * @param {float} amount the amount to withdraw
         * @param {string} address the address to withdraw to
         * @param {string|undefined} tag
         * @param {object} params extra parameters specific to the bitbank api endpoint
         * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
        [ tag, params ] = this.handleWithdrawTagAndParams (tag, params);
        if (!('uuid' in params)) {
            throw new ExchangeError (this.id + ' uuid is required for withdrawal');
        }
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'asset': currency['id'],
            'amount': amount,
        };
        const response = await this.privatePostUserRequestWithdrawal (this.extend (request, params));
        //
        //     {
        //         "success": 1,
        //         "data": {
        //             "uuid": "string",
        //             "asset": "btc",
        //             "amount": 0,
        //             "account_uuid": "string",
        //             "fee": 0,
        //             "status": "DONE",
        //             "label": "string",
        //             "txid": "string",
        //             "address": "string",
        //             "requested_at": 0
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        return this.parseTransaction (data, currency);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        // withdraw
        //
        //     {
        //         "uuid": "string",
        //         "asset": "btc",
        //         "amount": 0,
        //         "account_uuid": "string",
        //         "fee": 0,
        //         "status": "DONE",
        //         "label": "string",
        //         "txid": "string",
        //         "address": "string",
        //         "requested_at": 0
        //     }
        //
        const txid = this.safeString (transaction, 'txid');
        currency = this.safeCurrency (undefined, currency);
        return {
            'id': txid,
            'txid': txid,
            'timestamp': undefined,
            'datetime': undefined,
            'network': undefined,
            'addressFrom': undefined,
            'address': undefined,
            'addressTo': undefined,
            'amount': undefined,
            'type': undefined,
            'currency': currency['code'],
            'status': undefined,
            'updated': undefined,
            'tagFrom': undefined,
            'tag': undefined,
            'tagTo': undefined,
            'comment': undefined,
            'fee': undefined,
            'info': transaction,
        };
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let query = this.omit (params, this.extractParams (path));
        let url = this.implodeHostname (this.urls['api'][api]) + '/';
        if ((api === 'public') || (api === 'markets')) {
            url += this.implodeParams (path, params);
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            this.checkRequiredCredentials ();
            const nonce = this.nonce ().toString ();
            let auth = nonce;
            url += this.version + '/' + this.implodeParams (path, params);
            if (method === 'POST') {
                body = this.json (query);
                auth += body;
            } else {
                auth += '/' + this.version + '/' + path;
                if (Object.keys (query).length) {
                    query = this.urlencode (query);
                    url += '?' + query;
                    auth += '?' + query;
                }
            }
            headers = {
                'Content-Type': 'application/json',
                'ACCESS-KEY': this.apiKey,
                'ACCESS-NONCE': nonce,
                'ACCESS-SIGNATURE': this.hmac (this.encode (auth), this.encode (this.secret)),
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return;
        }
        const success = this.safeInteger (response, 'success');
        const data = this.safeValue (response, 'data');
        if (!success || !data) {
            const errorMessages = {
                '10000': 'URL does not exist',
                '10001': 'A system error occurred. Please contact support',
                '10002': 'Invalid JSON format. Please check the contents of transmission',
                '10003': 'A system error occurred. Please contact support',
                '10005': 'A timeout error occurred. Please wait for a while and try again',
                '20001': 'API authentication failed',
                '20002': 'Illegal API key',
                '20003': 'API key does not exist',
                '20004': 'API Nonce does not exist',
                '20005': 'API signature does not exist',
                '20011': 'Two-step verification failed',
                '20014': 'SMS authentication failed',
                '30001': 'Please specify the order quantity',
                '30006': 'Please specify the order ID',
                '30007': 'Please specify the order ID array',
                '30009': 'Please specify the stock',
                '30012': 'Please specify the order price',
                '30013': 'Trade Please specify either',
                '30015': 'Please specify the order type',
                '30016': 'Please specify asset name',
                '30019': 'Please specify uuid',
                '30039': 'Please specify the amount to be withdrawn',
                '40001': 'The order quantity is invalid',
                '40006': 'Count value is invalid',
                '40007': 'End time is invalid',
                '40008': 'end_id Value is invalid',
                '40009': 'The from_id value is invalid',
                '40013': 'The order ID is invalid',
                '40014': 'The order ID array is invalid',
                '40015': 'Too many specified orders',
                '40017': 'Incorrect issue name',
                '40020': 'The order price is invalid',
                '40021': 'The trading classification is invalid',
                '40022': 'Start date is invalid',
                '40024': 'The order type is invalid',
                '40025': 'Incorrect asset name',
                '40028': 'uuid is invalid',
                '40048': 'The amount of withdrawal is illegal',
                '50003': 'Currently, this account is in a state where you can not perform the operation you specified. Please contact support',
                '50004': 'Currently, this account is temporarily registered. Please try again after registering your account',
                '50005': 'Currently, this account is locked. Please contact support',
                '50006': 'Currently, this account is locked. Please contact support',
                '50008': 'User identification has not been completed',
                '50009': 'Your order does not exist',
                '50010': 'Can not cancel specified order',
                '50011': 'API not found',
                '60001': 'The number of possessions is insufficient',
                '60002': 'It exceeds the quantity upper limit of the tender buying order',
                '60003': 'The specified quantity exceeds the limit',
                '60004': 'The specified quantity is below the threshold',
                '60005': 'The specified price is above the limit',
                '60006': 'The specified price is below the lower limit',
                '70001': 'A system error occurred. Please contact support',
                '70002': 'A system error occurred. Please contact support',
                '70003': 'A system error occurred. Please contact support',
                '70004': 'We are unable to accept orders as the transaction is currently suspended',
                '70005': 'Order can not be accepted because purchase order is currently suspended',
                '70006': 'We can not accept orders because we are currently unsubscribed ',
                '70009': 'We are currently temporarily restricting orders to be carried out. Please use the limit order.',
                '70010': 'We are temporarily raising the minimum order quantity as the system load is now rising.',
            };
            const errorClasses = this.exceptions;
            const code = this.safeString (data, 'code');
            const message = this.safeString (errorMessages, code, 'Error');
            const ErrorClass = this.safeValue (errorClasses, code);
            if (ErrorClass !== undefined) {
                throw new ErrorClass (message);
            } else {
                throw new ExchangeError (this.id + ' ' + this.json (response));
            }
        }
    }
};
