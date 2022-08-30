'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { AuthenticationError, BadSymbol, ExchangeError, ExchangeNotAvailable, InsufficientFunds, InvalidOrder, OrderNotFound, PermissionDenied, BadRequest, RateLimitExceeded, OnMaintenance } = require ('./base/errors');
const { TICK_SIZE } = require ('./base/functions/number');

//  ---------------------------------------------------------------------------

module.exports = class bitcointrade extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitcointrade',
            'name': 'Bitcointrade',
            'countries': [ 'BR' ], // Brazil
            // 1 request/second for unverified customers.
            'rateLimit': 1000.0,
            'version': 'v3',
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
                'createStopLimitOrder': false,
                'createStopMarketOrder': false,
                'createStopOrder': false,
                'fetchAccounts': false,
                'fetchBalance': true,
                'fetchBorrowRate': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchBorrowRates': false,
                'fetchBorrowRatesPerSymbol': false,
                'fetchClosedOrders': true,
                'fetchDeposits': true,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchLeverage': false,
                'fetchLeverageTiers': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOHLCV': false,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchOrderTrades': true,
                'fetchPosition': false,
                'fetchPositions': false,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': false,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTransactions': false,
                'fetchWithdrawals': true,
                'reduceMargin': false,
                'setLeverage': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'transfer': false,
                'withdraw': true,
            },
            'urls': {
                'logo': 'https://cwstatic.nyc3.digitaloceanspaces.com/1996/bitcointrade.png',
                'api': {
                    'public': 'https://api.bitcointrade.com.br',
                    'private': 'https://api.bitcointrade.com.br',
                },
                'www': 'https://www.bitcointrade.com.br',
                'doc': [
                    'https://apidocs.bitcointrade.com.br',
                ],
                'fees': 'https://www.bitcointrade.com.br/rates/',
                'referral': 'https://www.bitcointrade.com.br/?s=ccxt',
            },
            'api': {
                'public': {
                    'get': {
                        // Public
                        'public/{pair}/ticker': 1,
                        'public/ticker': 1,
                        'public/{pair}/orders': 1,
                        'public/{pair}/trades': 1,
                        'public/currencies': 1,
                        'public/pairs': 1,
                    },
                },
                'private': {
                    'get': {
                        // Market
                        'market/user_orders/list': 1,
                        'market/user_orders/open': 1,
                        'market/user_orders/{code}': 1,
                        'market/trades': 1,
                        // Transfers
                        '{currency}/deposits': 1,
                        '{currency}/withdraw': 1,
                        // Wallets
                        'wallets/balance': 1,
                        'wallets/{date}/balance': 1,
                    },
                    'post': {
                        // Market
                        'market/create_order': 1,
                        // Transfers
                        '{currency}/withdraw': 1,
                    },
                    'delete': {
                        // Market
                        'market/user_orders': 1,
                    },
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'taker': this.parseNumber ('0.0050'),
                    'maker': this.parseNumber ('0.0025'),
                },
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': false, // Needed to override Exchange.js's default 'true'.
            },
            'precisionMode': TICK_SIZE,
            'exceptions': {
                'broad': {
                    'Saldo insuficiente': InsufficientFunds,
                    'Par de moedas inválido': BadSymbol,
                    'Ordem inválida': OrderNotFound,
                    'Quantidade de ordem inválida': InvalidOrder,
                },
            },
            'httpExceptions': {
                '400': BadRequest, // Invalid parameters.
                '401': AuthenticationError,
                '402': AuthenticationError, // Revoked token.
                '403': PermissionDenied,
                '404': BadRequest, // Check request address.
                '405': ExchangeNotAvailable, // Try again.
                '429': RateLimitExceeded,
                '500': ExchangeError, // Try again.
                '502': ExchangeNotAvailable,
                '503': OnMaintenance,
            },
            'options': {
            },
        });
    }

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name bitcointrade#fetchMarkets
         * @description retrieves data on all markets for bitcointrade
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {[object]} an array of objects representing market data
         */
        const response = await this.publicGetPublicPairs (params);
        //
        //     {
        //         "data":[
        //             {
        //                 "base":"BTC",
        //                 "base_name":"Bitcoin",
        //                 "enabled":true,
        //                 "min_amount":0.00009662,
        //                 "min_value":10,
        //                 "price_tick":1,
        //                 "quote":"BRL",
        //                 "quote_name":"Brazilian real",
        //                 "symbol":"BRLBTC"
        //             }
        //         ],
        //         "message":null
        //     }
        //
        const result = [];
        const data = this.safeValue (response, 'data', []);
        for (let i = 0; i < data.length; i++) {
            const market = data[i];
            const baseId = this.safeString (market, 'base');
            const quoteId = this.safeString (market, 'quote');
            const id = this.safeString (market, 'symbol');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const enabled = this.safeValue (market, 'enabled');
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
                'active': enabled,
                'contract': false,
                'linear': undefined,
                'inverse': undefined,
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': undefined,
                    'price': this.safeNumber (market, 'price_tick'),
                    'cost': undefined,
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': {
                        'min': this.safeNumber (market, 'min_amount'),
                        'max': undefined,
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'cost': {
                        'min': this.safeNumber (market, 'min_value'),
                        'max': undefined,
                    },
                },
                'info': market,
            });
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        //
        // Called by both fetchTicker and fetchTickers.
        //
        // {
        //     "buy":102500,
        //     "date":"2022-08-30T10:00:34.098Z",
        //     "high":103987,
        //     "last":103483,
        //     "low":100724,
        //     "pair": "BRLBTC", // only available when requesting multiple tickers.
        //     "sell":103483,
        //     "trades_quantity":807,
        //     "volume":8.27278407
        // }
        //
        const datetime = this.safeString (ticker, 'date');
        const timestamp = this.parse8601 (datetime);
        const marketId = this.safeString (ticker, 'pair');
        const symbol = this.safeSymbol (marketId, market);
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': datetime,
            'high': this.safeNumber (ticker, 'high'),
            'low': this.safeNumber (ticker, 'low'),
            'bid': this.safeString (ticker, 'buy'),
            'bidVolume': undefined,
            'ask': this.safeString (ticker, 'sell'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'last': this.safeNumber (ticker, 'last'),
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeNumber (ticker, 'volume'),
            'quoteVolume': undefined,
            'info': ticker,
        }, market);
    }

    async fetchTicker (symbol, params = {}) {
        /**
         * @method
         * @name bitcointrade#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the bitcointrade api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
        };
        const response = await this.publicGetPublicPairTicker (this.extend (request, params));
        //
        //     {
        //         "data": {
        //             "buy": 103478,
        //             "date": "2022-09-01T10:06:39.520Z",
        //             "high": 106400,
        //             "last": 103020,
        //             "low": 103000,
        //             "sell": 103999,
        //             "trades_quantity": 856,
        //             "volume": 12.08688889
        //         },
        //         "message": null
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        return this.parseTicker (data, market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        /**
         * @method
         * @name bitcointrade#fetchTickers
         * @description fetches price tickers for multiple markets, statistical calculations with the information calculated over the past 24 hours each market
         * @param {[string]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} params extra parameters specific to the bitcointrade api endpoint
         * @returns {object} an array of [ticker structures]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const response = await this.publicGetPublicTicker (params);
        //
        //     {
        //         "data": [
        //             {
        //                 "buy": 103478,
        //                 "date": "2022-09-01T10:06:39.520Z",
        //                 "high": 106400,
        //                 "last": 103020,
        //                 "low": 103000,
        //                 "pair": "BRLBTC",
        //                 "sell": 103999,
        //                 "trades_quantity": 856,
        //                 "volume": 12.08688889
        //             }
        //         ],
        //         "message": null
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        const result = {};
        for (let i = 0; i < data.length; i++) {
            const ticker = this.parseTicker (data[i]);
            const symbol = ticker['symbol'];
            result[symbol] = ticker;
        }
        return this.filterByArray (result, 'symbol', symbols);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitcointrade#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the bitcointrade api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
        };
        if (limit !== undefined) {
            params['limit'] = limit; // limit in [1, 200].
        }
        const response = await this.publicGetPublicPairOrders (this.extend (request, params));
        //
        //     {
        //         "data": {
        //             "asks": [
        //                 {"amount": 0.421323, "code": "kSR46XWXj", "unit_price": 102499},
        //                 {"amount": 0.030354, "code": "U22MCtoNa", "unit_price": 102500},
        //                 {"amount": 0.056582, "code": "uWc7LPB9C", "unit_price": 103255}
        //             ],
        //             "bids": [
        //                 {"amount": 0.019698, "code": "cFfAKFfit", "unit_price": 102000},
        //                 {"amount": 0.024509, "code": "eR7m5k4rd", "unit_price": 102000},
        //                 {"amount": 0.124996, "code": "O7gTiVyjp", "unit_price": 101867}
        //             ]
        //         },
        //         "message": null
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        return this.parseOrderBook (data, symbol, undefined, 'bids', 'asks', 'unit_price', 'amount');
    }

    parseTradeType (status) {
        const statuses = {
            'buy': 'buy',
            'sell': 'buy',
            'compra': 'compra',
            'venda': 'venda',
        };
        return this.safeString (statuses, status, status);
    }

    parseTrade (trade, market = undefined) {
        //
        // fetchTrades
        //
        //     {
        //         "active_order_code": "BL-Xiv4hZ",
        //         "amount": 0.006911,
        //         "date": "2022-08-30T10:56:17.010Z",
        //         "passive_order_code": "Lh766vBDT",
        //         "type": "sell",
        //         "unit_price": 102607
        //     }
        //
        // fetchOrderTrades
        //
        //      {
        //          "amount": 0.2,
        //          "create_date": "2020-02-21 20:49:37.450",
        //          "total_price": 1000,
        //          "unit_price": 5000
        //          "code": "SkvtQoOZf",
        //          "type": "buy",
        //          "subtype": "limited",
        //          "pair": "USDCBTC",
        //      }
        //
        // private fetchMyTrades
        //
        //      {
        //          "amount": 0.000992,
        //          "date": "2022-08-30T17:40:04.653Z",
        //          "fee": 0,
        //          "fee_currency": "BRL",
        //          "pair_code": "BRLBTC",
        //          "subtype": "mercado",
        //          "total_price": 99,
        //          "type": "venda",
        //          "unit_price": 100681
        //      }
        //
        const datetime = this.safeString (trade, 'date');
        const timestamp = this.parse8601 (datetime);
        const priceString = this.safeString (trade, 'unit_price');
        const orderId = this.safeString (trade, 'code');
        const side = this.safeStringLower (trade, 'side');
        const marketId = this.safeString2 (trade, 'pair', 'pair_code');
        const symbol = this.safeSymbol (marketId, market);
        const type = this.parseTradeType (this.safeString (trade, 'type'));
        const amountString = this.safeString (trade, 'amount');
        const costString = this.safeString (trade, 'total_price');
        const feeString = this.safeString (trade, 'fee');
        let fee = undefined;
        if (feeString !== undefined) {
            const feeCurrencyId = this.safeString (trade, 'feeCurrency');
            const feeCurrencyCode = this.safeCurrencyCode (feeCurrencyId);
            fee = {
                'cost': this.safeString (trade, 'feeAmount'),
                'currency': feeCurrencyCode,
            };
        }
        return this.safeTrade ({
            'id': undefined,
            'order': orderId,
            'timestamp': timestamp,
            'datetime': datetime,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': priceString,
            'amount': amountString,
            'cost': costString,
            'takerOrMaker': undefined,
            'fee': fee,
            'info': trade,
        }, market);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitcointrade#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the bitcointrade api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit; // default 100
        }
        const response = await this.publicGetPublicPairTrades (this.extend (request, params));
        //
        //    {
        //        "data": {
        //            "pagination": {
        //                "current_page": 1,
        //                "page_size": 20,
        //                "registers_count": 3181802,
        //                "total_pages": 159091
        //            },
        //            "trades": [
        //                {
        //                    "active_order_code": "BL-Xiv4hZ",
        //                    "amount": 0.006911,
        //                    "date": "2022-08-30T10:56:17.010Z",
        //                    "passive_order_code": "Lh766vBDT",
        //                    "type": "sell",
        //                    "unit_price": 102607
        //                }
        //            ]
        //        },
        //        "message": null
        //    }
        //
        const data = this.safeValue (response, 'data', {});
        const trades = this.safeValue (data, 'trades', []);
        return this.parseTrades (trades, market, since, limit);
    }

    parseBalance (response) {
        const data = this.safeValue (response, 'data', []);
        const result = {
            'info': response,
            'timestamp': undefined,
            'datetime': undefined,
        };
        for (let i = 0; i < data.length; i++) {
            const balance = data[i];
            const currencyId = this.safeString (balance, 'currency_code');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeNumber (balance, 'available_amount');
            account['used'] = this.safeNumber (balance, 'locked_amount');
            account['total'] = account['free'] + account['used'];
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    async fetchBalance (params = {}) {
        /**
         * @method
         * @name bitcointrade#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} params extra parameters specific to the bitcointrade api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.loadMarkets ();
        const response = await this.privateGetWalletsBalance (params);
        //
        //     {
        //         "data": [
        //             {
        //                 "address": null,
        //                 "available_amount": 1298.82,
        //                 "currency_code": "BRL",
        //                 "last_update": "2022-08-30T17:41:56.936Z",
        //                 "locked_amount": 239.54,
        //                 "memo": null,
        //                 "supported_networks_for_deposit": [],
        //                 "tag": null
        //             },
        //             {
        //                 "address": "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF",
        //                 "available_amount": 0,
        //                 "currency_code": "BTC",
        //                 "last_update": "2022-08-30T17:42:04.523Z",
        //                 "locked_amount": 0,
        //                 "memo": null,
        //                 "supported_networks_for_deposit": [
        //                     "bitcoin"
        //                 ],
        //                 "tag": null
        //             }
        //         ],
        //         "message": null
        //     }
        //
        return this.parseBalance (response);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name bitcointrade#createOrder
         * @description create a trade order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float|undefined} price the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} params extra parameters specific to the bitcointrade api endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        let orderSubType = 'limited';
        if (type === 'market') {
            orderSubType = 'market';
        }
        // amountToPrecision is not used as there's no amount precision
        // information in the markets. The base currency precision could be
        // be used instead, but Bitcointrade has lower precision on some pairs
        // than on their base currency.
        // Amounts with a higher precision than what is supported by a pair
        // is silently truncated by Bitcointrade.
        const request = {
            'amount': amount,
            'subtype': orderSubType,
            'type': side,
            'pair': market['id'],
        };
        // Even though the documentation states that 'unit_price' is always
        // required, Bitcointrade accepts market orders without a price.
        if (type === 'limit') {
            request['unit_price'] = this.priceToPrecision (symbol, price);
        }
        const response = await this.privatePostMarketCreateOrder (this.extend (request, params));
        //
        //     {
        //         "data": {
        //             "code": "F2ZJW7wqi",
        //         },
        //         "message": null
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        return this.parseOrder (data, market);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name bitcointrade#cancelOrder
         * @description cancels an open order
         * @param {string} id order id
         * @param {string|undefined} symbol not used by bitcointrade cancelOrder ()
         * @param {object} params extra parameters specific to the bitcointrade api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const request = {
            'code': id,
        };
        const response = await this.privateDeleteMarketUserOrders (this.extend (request, params));
        //
        //     {
        //         "data": {
        //             "code": "F2ZJW7wqi",
        //             "create_date": "2022-08-30T17:40:04.637Z",
        //             "executed_amount": 0.000992,
        //             "pair": "BRLBTC",
        //             "remaining_amount": 0,
        //             "remaining_price": 0,
        //             "requested_amount": 0.000992,
        //             "status": "executed_completely",
        //             "subtype": "market",
        //             "total_price": 99,
        //             "type": "sell",
        //             "unit_price": 99798.38709677,
        //             "update_date": "2022-08-30T17:40:04.657Z"
        //         },
        //         "message": null
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        return this.parseOrder (data);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name bitcointrade#fetchOrder
         * @description fetches information on an order made by the user
         * @param {string|undefined} symbol not used by bitcointrade fetchOrder
         * @param {object} params extra parameters specific to the bitcointrade api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const request = {
            'code': id,
        };
        const response = await this.privateGetMarketUserOrdersCode (this.extend (request, params));
        //
        //     {
        //         "data": {
        //             "code": "SkvtQoOZf",
        //             "type": "buy",
        //             "subtype": "limited",
        //             "requested_amount": 0.02347418,
        //             "remaining_amount": 0,
        //             "unit_price": 42600,
        //             "status": "executed_completely",
        //             "create_date": "2017-12-08T23:42:54.960Z",
        //             "update_date": "2017-12-13T21:48:48.817Z",
        //             "pair": "USDCBTC",
        //             "total_price": 1000,
        //             "executed_amount": 0.02347418,
        //             "remaining_price": 0,
        //             "transactions": [
        //                 {
        //                     "amount": 0.2,
        //                     "create_date": "2020-02-21 20:24:43.433",
        //                     "total_price": 1000,
        //                     "unit_price": 5000
        //                 },
        //                 {
        //                     "amount": 0.2,
        //                     "create_date": "2020-02-21 20:49:37.450",
        //                     "total_price": 1000,
        //                     "unit_price": 5000
        //                 }
        //             ]
        //         },
        //         "message": null
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        return this.parseOrder (data);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitcointrade#fetchOrders
         * @description fetches information on multiple orders made by the user
         * @param {string|undefined} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the bitcointrade api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['pair'] = market['id'];
        }
        if (since !== undefined) {
            request['start_date'] = since;
        }
        if (limit !== undefined) {
            request['page_size'] = limit;
        }
        const response = await this.privateGetMarketUserOrdersList (this.extend (request, params));
        //
        //     {
        //         "data": {
        //             "orders": [
        //                 {
        //                     "code": "F2ZJW7wqi",
        //                     "create_date": "2022-08-30T17:40:04.637Z",
        //                     "executed_amount": 0.000992,
        //                     "pair": "BRLBTC",
        //                     "remaining_amount": 0,
        //                     "remaining_price": 0,
        //                     "requested_amount": 0.000992,
        //                     "status": "executed_completely",
        //                     "subtype": "market",
        //                     "total_price": 99,
        //                     "type": "sell",
        //                     "unit_price": 99798.38709677,
        //                     "update_date": "2022-08-30T17:40:04.657Z"
        //                 }
        //             ],
        //             "pagination": {
        //                 "current_page": 1,
        //                 "page_size": 20,
        //                 "registers_count": 1,
        //                 "total_pages": 1
        //             }
        //         },
        //         "message": null
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const orders = this.safeValue (data, 'orders', []);
        return this.parseOrders (orders, market, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitcointrade#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch open orders for
         * @param {int|undefined} limit the maximum number of  open orders structures to retrieve
         * @param {object} params extra parameters specific to the bitcointrade api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['pair'] = market['id'];
        }
        if (since !== undefined) {
            request['start_date'] = since;
        }
        if (limit !== undefined) {
            request['page_size'] = limit;
        }
        const response = await this.privateGetMarketUserOrdersOpen (this.extend (request, params));
        //
        //     {
        //         "data": {
        //             "orders": [
        //                 {
        //                     "code": "F2ZJW7wqi",
        //                     "create_date": "2022-08-30T17:40:04.637Z",
        //                     "executed_amount": 0.000992,
        //                     "pair": "BRLBTC",
        //                     "remaining_amount": 0,
        //                     "remaining_price": 0,
        //                     "requested_amount": 0.000992,
        //                     "status": "executed_completely",
        //                     "subtype": "market",
        //                     "total_price": 99,
        //                     "type": "sell",
        //                     "unit_price": 99798.38709677,
        //                     "update_date": "2022-08-30T17:40:04.657Z"
        //                 }
        //             ],
        //             "pagination": {
        //                 "current_page": 1,
        //                 "page_size": 20,
        //                 "registers_count": 57,
        //                 "total_pages": 3
        //             }
        //         },
        //         "message": null
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const orders = this.safeValue (data, 'orders', []);
        return this.parseOrders (orders, market, since, limit);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitcointrade#fetchClosedOrders
         * @description fetches information on multiple closed orders made by the user
         * @param {string|undefined} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the bitcointrade api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        const request = {
            'status': [ 'executed_completely', 'canceled' ],
        };
        return await this.fetchOrders (symbol, since, limit, this.extend (request, params));
    }

    async fetchOrderTrades (id, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitcointrade#fetchOrderTrades
         * @description fetch all the trades made from a single order
         * @param {string} id order id
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch trades for
         * @param {int|undefined} limit the maximum number of trades to retrieve
         * @param {object} params extra parameters specific to the bitcointrade api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html#trade-structure}
         */
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const request = {
            'code': id,
        };
        const response = await this.privateGetOrdersFill (this.extend (request, params));
        //
        //     {
        //         "data": {
        //             "code": "SkvtQoOZf",
        //             "type": "buy",
        //             "subtype": "limited",
        //             "requested_amount": 0.02347418,
        //             "remaining_amount": 0,
        //             "unit_price": 42600,
        //             "status": "executed_completely",
        //             "create_date": "2017-12-08T23:42:54.960Z",
        //             "update_date": "2017-12-13T21:48:48.817Z",
        //             "pair": "USDCBTC",
        //             "total_price": 1000,
        //             "executed_amount": 0.02347418,
        //             "remaining_price": 0,
        //             "transactions": [
        //                 {
        //                     "amount": 0.2,
        //                     "create_date": "2020-02-21 20:24:43.433",
        //                     "total_price": 1000,
        //                     "unit_price": 5000
        //                 },
        //                 {
        //                     "amount": 0.2,
        //                     "create_date": "2020-02-21 20:49:37.450",
        //                     "total_price": 1000,
        //                     "unit_price": 5000
        //                 }
        //             ]
        //         },
        //         "message": null
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const transactions = this.safeValue (data, 'transactions', []);
        // Since a transaction, as returned, only has amount, price and time,
        // the other relevant fields are copied from the order.
        const baseTransaction = {
            'code': this.safeString (data, 'code'),
            'type': this.safeString (data, 'type'),
            'subtype': this.safeString (data, 'subtype'),
            'pair': this.safeString (data, 'pair'),
        };
        const extendedTransactions = [];
        for (let i = 0; i < transactions.length; i++) {
            extendedTransactions.push (this.extend (transactions[i], baseTransaction));
        }
        return this.parseTrades (extendedTransactions, market, since, limit);
    }

    parseOrderStatus (status) {
        const statuses = {
            'executed_completely': 'closed',
            'executed_partially': 'open',
            'waiting': 'open',
            'canceled': 'canceled',
            'pending_creation': 'open',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        //
        // cancelOrder, fetchOrders, fetchOrder
        //
        //     {
        //         "code": "F2ZJW7wqi",
        //         "create_date": "2022-08-30T17:40:04.637Z",
        //         "executed_amount": 0.000992,
        //         "pair": "BRLBTC",
        //         "remaining_amount": 0,
        //         "remaining_price": 0,
        //         "requested_amount": 0.000992,
        //         "status": "executed_completely",
        //         "subtype": "market",
        //         "total_price": 99,
        //         "type": "sell",
        //         "unit_price": 99798.38709677,
        //         "update_date": "2022-08-30T17:40:04.657Z"
        //     }
        //
        // createOrder
        //
        //     {
        //         "code": "F2ZJW7wqi",
        //     }
        //
        const id = this.safeString (order, 'code');
        const amount = this.safeString (order, 'requested_amount');
        const price = this.safeString (order, 'unit_price');
        const cost = this.safeNumber (order, 'total_price');
        const type = this.safeStringLower (order, 'subtype');
        const side = this.safeStringLower (order, 'type');
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const datetime = this.safeString (order, 'create_date');
        const timestamp = this.parse8601 (datetime);
        const filled = this.safeNumber (order, 'executed_amount');
        const marketId = this.safeString (order, 'pair');
        const symbol = this.safeSymbol (marketId, market);
        const stopPrice = this.safeNumber (order, 'stopPrice');
        return this.safeOrder ({
            'id': id,
            'clientOrderId': undefined,
            'info': order,
            'timestamp': timestamp,
            'datetime': datetime,
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': type,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': stopPrice,
            'amount': amount,
            'cost': cost,
            'average': undefined,
            'filled': filled,
            'remaining': undefined,
            'status': status,
            'fee': undefined,
            'trades': undefined,
        }, market);
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        /**
         * @method
         * @name bitcointrade#withdraw
         * @description make a withdrawal
         * @param {string} code unified currency code
         * @param {float} amount the amount to withdraw
         * @param {string} address the address to withdraw to
         * @param {string|undefined} tag
         * @param {object} params extra parameters specific to the bitcointrade api endpoint
         * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
        [ tag, params ] = this.handleWithdrawTagAndParams (tag, params);
        await this.loadMarkets ();
        const currency = this.currency (code);
        const feeType = this.safeString (params, 'fee_type', 'regular');
        const request = {
            'currency': currency['id'],
            'fee_type': feeType,
            'amount': this.currencyToPrecision (code, amount),
            'destination': address,
        };
        if (tag !== undefined) {
            request['tag'] = tag;
        }
        const memo = this.safeString (params, 'memo');
        if (memo !== undefined) {
            request['memo'] = memo;
        }
        const response = await this.privatePostCurrencyWithdraw (this.extend (request, params));
        //
        //     {
        //         "data": {
        //             "code": "B1qBrtEBN",
        //             "origin_address": "rJhgs18yEFLLSnPa3CwviTo2UDkesdPoSQ",
        //             "destination_address": "rw9nf3WgsagJiZnkAeZzXZuqeCQ6LHm2h1",
        //             "amount": 0.1,
        //             "miner_fee": 0.000012,
        //             "miner_fee_type": "regular",
        //             "tax_index": 0,
        //             "tax_index_calculated": 0,
        //             "tax_amount": 0,
        //             "status": "pending",
        //             "create_date": "2019-01-25T16:37:15.443Z",
        //             "update_date": "2019-01-25T16:37:15.017Z",
        //             "transaction_id": null,
        //             "link": null,
        //             "tag": "0100000020"
        //         },
        //         "message": null
        //     }
        //
        return this.parseTransaction (response, currency);
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitcointrade#fetchDeposits
         * @description fetch all deposits made to an account
         * @param {string|undefined} code unified currency code
         * @param {int|undefined} since the earliest time in ms to fetch deposits for
         * @param {int|undefined} limit the maximum number of deposits structures to retrieve
         * @param {object} params extra parameters specific to the bitcointrade api endpoint
         * @returns {[object]} a list of [transaction structures]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
        const request = {};
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['id'];
        }
        if (since !== undefined) {
            request['start_date'] = since;
        }
        if (limit !== undefined) {
            request['page_size'] = limit;
        }
        const response = await this.privateGetCurrencyDeposits (this.extend (request, params));
        //     {
        //         "data": {
        //             "deposits": [
        //                 {
        //                     "amount": 458.81,
        //                     "code": "Zet_q-K42",
        //                     "confirmation_date": "2022-08-02T11:25:32.457Z",
        //                     "create_date": "2022-08-02T11:24:28.332Z",
        //                     "currency_code": "CREAL",
        //                     "hash": "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
        //                     "is_internal": false,
        //                     "network": "celo",
        //                     "status": "confirmed"
        //                 }
        //             ],
        //             "pagination": {
        //                 "current_page": 1,
        //                 "page_size": 20,
        //                 "registers_count": 1,
        //                 "total_pages": 1
        //             }
        //         },
        //         "message": null
        //     }
        const data = this.safeValue (response, 'data');
        const deposits = this.safeValue (data, 'deposits');
        return this.parseTransactions (deposits, currency, since, limit, { 'type': 'deposit' });
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitcointrade#fetchWithdrawals
         * @description fetch all withdrawals made from an account
         * @param {string|undefined} code unified currency code
         * @param {int|undefined} since the earliest time in ms to fetch withdrawals for
         * @param {int|undefined} limit the maximum number of withdrawals structures to retrieve
         * @param {object} params extra parameters specific to the bitcointrade api endpoint
         * @returns {[object]} a list of [transaction structures]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
        const request = {};
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['id'];
        }
        if (since !== undefined) {
            request['start_date'] = since;
        }
        if (limit !== undefined) {
            request['page_size'] = limit;
        }
        const response = await this.privateGetCurrencyWithdraw (this.extend (request, params));
        //     {
        //         "data": {
        //             "pagination": {
        //                 "current_page": 1,
        //                 "page_size": 20,
        //                 "registers_count": 1,
        //                 "total_pages": 1
        //             },
        //             "withdrawals": [
        //                 {
        //                     "amount": 5000,
        //                     "code": "eY_ZNjWJ8",
        //                     "create_date": "2022-08-31T18:19:59.312Z",
        //                     "currency_code": "CREAL",
        //                     "destination_address": "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF",
        //                     "is_internal": false,
        //                     "link": null,
        //                     "miner_fee": 0.1,
        //                     "miner_fee_type": "regular",
        //                     "network": "celo",
        //                     "origin_address": "0x9e240434E845D7Bb2CE7218eD487687a6bC2E111",
        //                     "status": "confirmed",
        //                     "tax_amount": 0,
        //                     "tax_index": 0,
        //                     "tax_index_calculated": 0,
        //                     "transaction_id": "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
        //                     "update_date": "2022-08-31T19:01:01.420Z"
        //                 }
        //             ]
        //         },
        //         "message": null
        //     }
        const data = this.safeValue (response, 'data');
        const withdrawals = this.safeValue (data, 'withdrawals');
        return this.parseTransactions (withdrawals, currency, since, limit, { 'type': 'withdrawal' });
    }

    parseTransactionStatus (status) {
        const statuses = {
            'pending': 'pending',
            'confirmed': 'ok',
            'canceled': 'failed',
        };
        return this.safeString (statuses, status, status);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        // withdraw
        //
        //     {
        //         "code": "B1qBrtEBN",
        //         "origin_address": "rJhgs18yEFLLSnPa3CwviTo2UDkesdPoSQ",
        //         "destination_address": "rw9nf3WgsagJiZnkAeZzXZuqeCQ6LHm2h1",
        //         "amount": 0.1,
        //         "miner_fee": 0.000012,
        //         "miner_fee_type": "regular",
        //         "tax_index": 0,
        //         "tax_index_calculated": 0,
        //         "tax_amount": 0,
        //         "status": "pending",
        //         "create_date": "2019-01-25T16:37:15.443Z",
        //         "update_date": "2019-01-25T16:37:15.017Z",
        //         "transaction_id": null,
        //         "link": null,
        //         "tag": "0100000020"
        //     }
        //
        // fetchWithdrawals
        //
        //     {
        //         "amount": 5000,
        //         "code": "eY_ZNjWJ8",
        //         "create_date": "2022-08-31T18:19:59.312Z",
        //         "currency_code": "CREAL",
        //         "destination_address": "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF",
        //         "is_internal": false,
        //         "link": null,
        //         "miner_fee": 0.1,
        //         "miner_fee_type": "regular",
        //         "network": "celo",
        //         "origin_address": "0x9e240434E845D7Bb2CE7218eD487687a6bC2E111",
        //         "status": "confirmed",
        //         "tax_amount": 0,
        //         "tax_index": 0,
        //         "tax_index_calculated": 0,
        //         "transaction_id": "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
        //         "update_date": "2022-08-31T19:01:01.420Z"
        //     }
        //
        // fetchDeposits
        //
        //     {
        //         "amount": 458.81,
        //         "code": "Zet_q-K42",
        //         "confirmation_date": "2022-08-02T11:25:32.457Z",
        //         "create_date": "2022-08-02T11:24:28.332Z",
        //         "currency_code": "CREAL",
        //         "hash": "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
        //         "is_internal": false,
        //         "network": "celo",
        //         "status": "confirmed"
        //     }
        //
        const id = this.safeString (transaction, 'code');
        const amount = this.safeNumber (transaction, 'amount');
        const addressTo = this.safeString (transaction, 'origin_address');
        const addressFrom = this.safeString (transaction, 'destination_address');
        const txid = this.safeString (transaction, 'transaction_id', 'hash');
        const create_datetime = this.safeString (transaction, 'create_date');
        const update_datetime = this.safeString2 (transaction, 'update_date', 'confirmation_date');
        const currencyId = this.safeString (transaction, 'currency_code');
        const code = this.safeCurrencyCode (currencyId, currency);
        const status = this.parseTransactionStatus (this.safeString (transaction, 'status'));
        const network = this.safeString (transaction, 'network');
        const tag = this.safeString (transaction, 'tag');
        const feeCost = this.safeNumber (transaction, 'miner_fee');
        let fee = undefined;
        if (feeCost !== undefined) {
            fee = { 'currency': code, 'cost': feeCost };
        }
        return {
            'info': transaction,
            'id': id,
            'currency': code,
            'amount': amount,
            'network': network,
            'address': undefined,
            'addressTo': addressTo,
            'addressFrom': addressFrom,
            'tag': tag,
            'tagTo': undefined,
            'tagFrom': undefined,
            'status': status,
            'type': undefined,
            'updated': this.parse8601 (update_datetime),
            'txid': txid,
            'timestamp': this.parse8601 (create_datetime),
            'datetime': create_datetime,
            'fee': fee,
        };
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitcointrade#fetchMyTrades
         * @description fetch all trades made by the user
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch trades for
         * @param {int|undefined} limit the maximum number of trades structures to retrieve
         * @param {object} params extra parameters specific to the bitcointrade api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html#trade-structure}
         */
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['pair'] = market['id'];
        }
        if (since !== undefined) {
            request['start_date'] = since;
        }
        if (limit !== undefined) {
            request['page_size'] = limit;
        }
        const response = await this.privateGetMarketTrades (this.extend (request, params));
        //
        //     {
        //         "data": {
        //             "pagination": {
        //                 "current_page": 1,
        //                 "page_size": 20,
        //                 "registers_count": 79,
        //                 "total_pages": 4
        //             },
        //             "trades": [
        //                 {
        //                     "amount": 0.000992,
        //                     "date": "2022-08-30T17:40:04.653Z",
        //                     "fee": 0,
        //                     "fee_currency": "BRL",
        //                     "pair_code": "BRLBTC",
        //                     "subtype": "mercado",
        //                     "total_price": 99,
        //                     "type": "venda",
        //                     "unit_price": 100681
        //                 }
        //             ]
        //         },
        //         "message": null
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const trades = this.safeValue (data, 'trades', []);
        return this.parseTrades (trades, market, since, limit);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const request = '/' + this.version + '/' + this.implodeParams (path, params);
        let url = this.urls['api'][api] + request;
        const query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencodeWithArrayRepeat (query);
            }
        } else if (api === 'private') {
            this.checkRequiredCredentials ();
            headers = {
                'x-api-key': this.apiKey,
            };
            if ((method === 'POST') || (method === 'DELETE')) {
                body = this.json (query);
                headers['Content-Type'] = 'application/json';
            } else {
                if (Object.keys (query).length) {
                    url += '?' + this.urlencodeWithArrayRepeat (query);
                }
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return;
        }
        if (code !== 200) {
            const message = this.safeString (response, 'message');
            const feedback = this.id + ' ' + body;
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
            // No exceptions match, try to handle the HTTP status code.
            this.handleHttpStatusCode (code, reason, url, method, body);
            // No status code match either, raise generic exception.
            throw new ExchangeError (feedback);
        }
    }
};
