'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ExchangeNotAvailable, AuthenticationError, BadRequest, PermissionDenied, InvalidAddress, ArgumentsRequired, InvalidOrder } = require ('./base/errors');
const { DECIMAL_PLACES, SIGNIFICANT_DIGITS, TRUNCATE } = require ('./base/functions/number');
const Precise = require ('./base/Precise');

//  ---------------------------------------------------------------------------

module.exports = class bithumb extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bithumb',
            'name': 'Bithumb',
            'countries': [ 'KR' ], // South Korea
            'rateLimit': 500,
            'has': {
                'CORS': true,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'addMargin': false,
                'cancelOrder': true,
                'createMarketOrder': true,
                'createOrder': true,
                'createReduceOnlyOrder': false,
                'fetchBalance': true,
                'fetchBorrowRate': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchBorrowRates': false,
                'fetchBorrowRatesPerSymbol': false,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchLeverage': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchOHLCV': true,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchPosition': false,
                'fetchPositions': false,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
                'fetchTransfer': false,
                'fetchTransfers': false,
                'reduceMargin': false,
                'setLeverage': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'transfer': false,
                'withdraw': true,
            },
            'hostname': 'bithumb.com',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/30597177-ea800172-9d5e-11e7-804c-b9d4fa9b56b0.jpg',
                'api': {
                    'public': 'https://api.{hostname}/public',
                    'private': 'https://api.{hostname}',
                },
                'www': 'https://www.bithumb.com',
                'doc': 'https://apidocs.bithumb.com',
                'fees': 'https://en.bithumb.com/customer_support/info_fee',
            },
            'api': {
                'public': {
                    'get': [
                        'ticker/{currency}',
                        'ticker/all',
                        'ticker/ALL_BTC',
                        'ticker/ALL_KRW',
                        'orderbook/{currency}',
                        'orderbook/all',
                        'transaction_history/{currency}',
                        'transaction_history/all',
                        'candlestick/{currency}/{interval}',
                    ],
                },
                'private': {
                    'post': [
                        'info/account',
                        'info/balance',
                        'info/wallet_address',
                        'info/ticker',
                        'info/orders',
                        'info/user_transactions',
                        'info/order_detail',
                        'trade/place',
                        'trade/cancel',
                        'trade/btc_withdrawal',
                        'trade/krw_deposit',
                        'trade/krw_withdrawal',
                        'trade/market_buy',
                        'trade/market_sell',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'maker': this.parseNumber ('0.0025'),
                    'taker': this.parseNumber ('0.0025'),
                },
            },
            'precisionMode': SIGNIFICANT_DIGITS,
            'exceptions': {
                'Bad Request(SSL)': BadRequest,
                'Bad Request(Bad Method)': BadRequest,
                'Bad Request.(Auth Data)': AuthenticationError, // { "status": "5100", "message": "Bad Request.(Auth Data)" }
                'Not Member': AuthenticationError,
                'Invalid Apikey': AuthenticationError, // {"status":"5300","message":"Invalid Apikey"}
                'Method Not Allowed.(Access IP)': PermissionDenied,
                'Method Not Allowed.(BTC Adress)': InvalidAddress,
                'Method Not Allowed.(Access)': PermissionDenied,
                'Database Fail': ExchangeNotAvailable,
                'Invalid Parameter': BadRequest,
                '5600': ExchangeError,
                'Unknown Error': ExchangeError,
                'After May 23th, recent_transactions is no longer, hence users will not be able to connect to recent_transactions': ExchangeError, // {"status":"5100","message":"After May 23th, recent_transactions is no longer, hence users will not be able to connect to recent_transactions"}
            },
            'timeframes': {
                '1m': '1m',
                '3m': '3m',
                '5m': '5m',
                '10m': '10m',
                '30m': '30m',
                '1h': '1h',
                '6h': '6h',
                '12h': '12h',
                '1d': '24h',
            },
            'options': {
                'quoteCurrencies': {
                    'BTC': {
                        'limits': {
                            'cost': {
                                'min': 0.0002,
                                'max': 100,
                            },
                        },
                    },
                    'KRW': {
                        'limits': {
                            'cost': {
                                'min': 500,
                                'max': 5000000000,
                            },
                        },
                    },
                },
            },
            'commonCurrencies': {
                'FTC': 'FTC2',
                'SOC': 'Soda Coin',
            },
        });
    }

    safeMarket (marketId = undefined, market = undefined, delimiter = undefined, marketType = undefined) {
        // bithumb has a different type of conflict in markets, because
        // their ids are the base currency (BTC for instance), so we can have
        // multiple "BTC" ids representing the different markets (BTC/ETH, "BTC/DOGE", etc)
        // since they're the same we just need to return one
        return super.safeMarket (marketId, market, delimiter, 'spot');
    }

    amountToPrecision (symbol, amount) {
        return this.decimalToPrecision (amount, TRUNCATE, this.markets[symbol]['precision']['amount'], DECIMAL_PLACES);
    }

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name bithumb#fetchMarkets
         * @description retrieves data on all markets for bithumb
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {[object]} an array of objects representing market data
         */
        const result = [];
        const quoteCurrencies = this.safeValue (this.options, 'quoteCurrencies', {});
        const quotes = Object.keys (quoteCurrencies);
        for (let i = 0; i < quotes.length; i++) {
            const quote = quotes[i];
            const quoteId = quote;
            const extension = this.safeValue (quoteCurrencies, quote, {});
            const method = 'publicGetTickerALL' + quote;
            const response = await this[method] (params);
            const data = this.safeValue (response, 'data');
            const currencyIds = Object.keys (data);
            for (let j = 0; j < currencyIds.length; j++) {
                const currencyId = currencyIds[j];
                if (currencyId === 'date') {
                    continue;
                }
                const market = data[currencyId];
                const base = this.safeCurrencyCode (currencyId);
                let active = true;
                if (Array.isArray (market)) {
                    const numElements = market.length;
                    if (numElements === 0) {
                        active = false;
                    }
                }
                const entry = this.deepExtend ({
                    'id': currencyId,
                    'symbol': base + '/' + quote,
                    'base': base,
                    'quote': quote,
                    'settle': undefined,
                    'baseId': currencyId,
                    'quoteId': quoteId,
                    'settleId': undefined,
                    'type': 'spot',
                    'spot': true,
                    'margin': false,
                    'swap': false,
                    'future': false,
                    'option': false,
                    'active': active,
                    'contract': false,
                    'linear': undefined,
                    'inverse': undefined,
                    'contractSize': undefined,
                    'expiry': undefined,
                    'expiryDateTime': undefined,
                    'strike': undefined,
                    'optionType': undefined,
                    'precision': {
                        'amount': parseInt ('4'),
                        'price': parseInt ('4'),
                    },
                    'limits': {
                        'leverage': {
                            'min': undefined,
                            'max': undefined,
                        },
                        'amount': {
                            'min': undefined,
                            'max': undefined,
                        },
                        'price': {
                            'min': undefined,
                            'max': undefined,
                        },
                        'cost': {}, // set via options
                    },
                    'info': market,
                }, extension);
                result.push (entry);
            }
        }
        return result;
    }

    parseBalance (response) {
        const result = { 'info': response };
        const balances = this.safeValue (response, 'data');
        const codes = Object.keys (this.currencies);
        for (let i = 0; i < codes.length; i++) {
            const code = codes[i];
            const account = this.account ();
            const currency = this.currency (code);
            const lowerCurrencyId = this.safeStringLower (currency, 'id');
            account['total'] = this.safeString (balances, 'total_' + lowerCurrencyId);
            account['used'] = this.safeString (balances, 'in_use_' + lowerCurrencyId);
            account['free'] = this.safeString (balances, 'available_' + lowerCurrencyId);
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    async fetchBalance (params = {}) {
        /**
         * @method
         * @name bithumb#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} params extra parameters specific to the bithumb api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.loadMarkets ();
        const request = {
            'currency': 'ALL',
        };
        const response = await this.privatePostInfoBalance (this.extend (request, params));
        return this.parseBalance (response);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name bithumb#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the bithumb api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'currency': market['base'] + '_' + market['quote'],
        };
        if (limit !== undefined) {
            request['count'] = limit; // default 30, max 30
        }
        const response = await this.publicGetOrderbookCurrency (this.extend (request, params));
        //
        //     {
        //         "status":"0000",
        //         "data":{
        //             "timestamp":"1587621553942",
        //             "payment_currency":"KRW",
        //             "order_currency":"BTC",
        //             "bids":[
        //                 {"price":"8652000","quantity":"0.0043"},
        //                 {"price":"8651000","quantity":"0.0049"},
        //                 {"price":"8650000","quantity":"8.4791"},
        //             ],
        //             "asks":[
        //                 {"price":"8654000","quantity":"0.119"},
        //                 {"price":"8655000","quantity":"0.254"},
        //                 {"price":"8658000","quantity":"0.119"},
        //             ]
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const timestamp = this.safeInteger (data, 'timestamp');
        return this.parseOrderBook (data, symbol, timestamp, 'bids', 'asks', 'price', 'quantity');
    }

    parseTicker (ticker, market = undefined) {
        //
        // fetchTicker, fetchTickers
        //
        //     {
        //         "opening_price":"227100",
        //         "closing_price":"228400",
        //         "min_price":"222300",
        //         "max_price":"230000",
        //         "units_traded":"82618.56075337",
        //         "acc_trade_value":"18767376138.6031",
        //         "prev_closing_price":"227100",
        //         "units_traded_24H":"151871.13484676",
        //         "acc_trade_value_24H":"34247610416.8974",
        //         "fluctate_24H":"8700",
        //         "fluctate_rate_24H":"3.96",
        //         "date":"1587710327264", // fetchTickers inject this
        //     }
        //
        const timestamp = this.safeInteger (ticker, 'date');
        const symbol = this.safeSymbol (undefined, market);
        const open = this.safeString (ticker, 'opening_price');
        const close = this.safeString (ticker, 'closing_price');
        const baseVolume = this.safeString (ticker, 'units_traded_24H');
        const quoteVolume = this.safeString (ticker, 'acc_trade_value_24H');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'max_price'),
            'low': this.safeString (ticker, 'min_price'),
            'bid': this.safeString (ticker, 'buy_price'),
            'bidVolume': undefined,
            'ask': this.safeString (ticker, 'sell_price'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': open,
            'close': close,
            'last': close,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        }, market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        /**
         * @method
         * @name bithumb#fetchTickers
         * @description fetches price tickers for multiple markets, statistical calculations with the information calculated over the past 24 hours each market
         * @param {[string]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} params extra parameters specific to the bithumb api endpoint
         * @returns {object} an array of [ticker structures]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const response = await this.publicGetTickerAll (params);
        //
        //     {
        //         "status":"0000",
        //         "data":{
        //             "BTC":{
        //                 "opening_price":"9045000",
        //                 "closing_price":"9132000",
        //                 "min_price":"8938000",
        //                 "max_price":"9168000",
        //                 "units_traded":"4619.79967497",
        //                 "acc_trade_value":"42021363832.5187",
        //                 "prev_closing_price":"9041000",
        //                 "units_traded_24H":"8793.5045804",
        //                 "acc_trade_value_24H":"78933458515.4962",
        //                 "fluctate_24H":"530000",
        //                 "fluctate_rate_24H":"6.16"
        //             },
        //             "date":"1587710878669"
        //         }
        //     }
        //
        const result = {};
        const data = this.safeValue (response, 'data', {});
        const timestamp = this.safeInteger (data, 'date');
        const tickers = this.omit (data, 'date');
        const ids = Object.keys (tickers);
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const market = this.safeMarket (id);
            const symbol = market['symbol'];
            const ticker = tickers[id];
            const isArray = Array.isArray (ticker);
            if (!isArray) {
                ticker['date'] = timestamp;
                result[symbol] = this.parseTicker (ticker, market);
            }
        }
        return this.filterByArray (result, 'symbol', symbols);
    }

    async fetchTicker (symbol, params = {}) {
        /**
         * @method
         * @name bithumb#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the bithumb api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'currency': market['base'],
        };
        const response = await this.publicGetTickerCurrency (this.extend (request, params));
        //
        //     {
        //         "status":"0000",
        //         "data":{
        //             "opening_price":"227100",
        //             "closing_price":"228400",
        //             "min_price":"222300",
        //             "max_price":"230000",
        //             "units_traded":"82618.56075337",
        //             "acc_trade_value":"18767376138.6031",
        //             "prev_closing_price":"227100",
        //             "units_traded_24H":"151871.13484676",
        //             "acc_trade_value_24H":"34247610416.8974",
        //             "fluctate_24H":"8700",
        //             "fluctate_rate_24H":"3.96",
        //             "date":"1587710327264"
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        return this.parseTicker (data, market);
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        //     [
        //         1576823400000, // 기준 시간
        //         '8284000', // 시가
        //         '8286000', // 종가
        //         '8289000', // 고가
        //         '8276000', // 저가
        //         '15.41503692' // 거래량
        //     ]
        //
        return [
            this.safeInteger (ohlcv, 0),
            this.safeNumber (ohlcv, 1),
            this.safeNumber (ohlcv, 3),
            this.safeNumber (ohlcv, 4),
            this.safeNumber (ohlcv, 2),
            this.safeNumber (ohlcv, 5),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bithumb#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
         * @param {int|undefined} limit the maximum amount of candles to fetch
         * @param {object} params extra parameters specific to the bithumb api endpoint
         * @returns {[[int]]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'currency': market['base'],
            'interval': this.timeframes[timeframe],
        };
        const response = await this.publicGetCandlestickCurrencyInterval (this.extend (request, params));
        //
        //     {
        //         'status': '0000',
        //         'data': {
        //             [
        //                 1576823400000, // 기준 시간
        //                 '8284000', // 시가
        //                 '8286000', // 종가
        //                 '8289000', // 고가
        //                 '8276000', // 저가
        //                 '15.41503692' // 거래량
        //             ],
        //             [
        //                 1576824000000, // 기준 시간
        //                 '8284000', // 시가
        //                 '8281000', // 종가
        //                 '8289000', // 고가
        //                 '8275000', // 저가
        //                 '6.19584467' // 거래량
        //             ],
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseOHLCVs (data, market, timeframe, since, limit);
    }

    parseTrade (trade, market = undefined) {
        //
        // fetchTrades (public)
        //
        //     {
        //         "transaction_date":"2020-04-23 22:21:46",
        //         "type":"ask",
        //         "units_traded":"0.0125",
        //         "price":"8667000",
        //         "total":"108337"
        //     }
        //
        // fetchOrder (private)
        //
        //     {
        //         "transaction_date": "1572497603902030",
        //         "price": "8601000",
        //         "units": "0.005",
        //         "fee_currency": "KRW",
        //         "fee": "107.51",
        //         "total": "43005"
        //     }
        //
        // a workaround for their bug in date format, hours are not 0-padded
        let timestamp = undefined;
        const transactionDatetime = this.safeString (trade, 'transaction_date');
        if (transactionDatetime !== undefined) {
            const parts = transactionDatetime.split (' ');
            const numParts = parts.length;
            if (numParts > 1) {
                const transactionDate = parts[0];
                let transactionTime = parts[1];
                if (transactionTime.length < 8) {
                    transactionTime = '0' + transactionTime;
                }
                timestamp = this.parse8601 (transactionDate + ' ' + transactionTime);
            } else {
                timestamp = this.safeIntegerProduct (trade, 'transaction_date', 0.001);
            }
        }
        if (timestamp !== undefined) {
            timestamp -= 9 * 3600000; // they report UTC + 9 hours, server in Korean timezone
        }
        const type = undefined;
        let side = this.safeString (trade, 'type');
        side = (side === 'ask') ? 'sell' : 'buy';
        const id = this.safeString (trade, 'cont_no');
        market = this.safeMarket (undefined, market);
        const priceString = this.safeString (trade, 'price');
        const amountString = this.fixCommaNumber (this.safeString2 (trade, 'units_traded', 'units'));
        const costString = this.safeString (trade, 'total');
        let fee = undefined;
        const feeCostString = this.safeString (trade, 'fee');
        if (feeCostString !== undefined) {
            const feeCurrencyId = this.safeString (trade, 'fee_currency');
            const feeCurrencyCode = this.commonCurrencyCode (feeCurrencyId);
            fee = {
                'cost': feeCostString,
                'currency': feeCurrencyCode,
            };
        }
        return this.safeTrade ({
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'order': undefined,
            'type': type,
            'side': side,
            'takerOrMaker': undefined,
            'price': priceString,
            'amount': amountString,
            'cost': costString,
            'fee': fee,
        }, market);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bithumb#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the bithumb api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'currency': market['base'],
        };
        if (limit === undefined) {
            request['count'] = limit; // default 20, max 100
        }
        const response = await this.publicGetTransactionHistoryCurrency (this.extend (request, params));
        //
        //     {
        //         "status":"0000",
        //         "data":[
        //             {
        //                 "transaction_date":"2020-04-23 22:21:46",
        //                 "type":"ask",
        //                 "units_traded":"0.0125",
        //                 "price":"8667000",
        //                 "total":"108337"
        //             },
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseTrades (data, market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name bithumb#createOrder
         * @description create a trade order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float|undefined} price the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} params extra parameters specific to the bithumb api endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'order_currency': market['id'],
            'payment_currency': market['quote'],
            'units': amount,
        };
        let method = 'privatePostTradePlace';
        if (type === 'limit') {
            request['price'] = price;
            request['type'] = (side === 'buy') ? 'bid' : 'ask';
        } else {
            method = 'privatePostTradeMarket' + this.capitalize (side);
        }
        const response = await this[method] (this.extend (request, params));
        const id = this.safeString (response, 'order_id');
        if (id === undefined) {
            throw new InvalidOrder (this.id + ' createOrder() did not return an order id');
        }
        return {
            'info': response,
            'symbol': symbol,
            'type': type,
            'side': side,
            'id': id,
        };
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name bithumb#fetchOrder
         * @description fetches information on an order made by the user
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the bithumb api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'order_id': id,
            'count': 1,
            'order_currency': market['base'],
            'payment_currency': market['quote'],
        };
        const response = await this.privatePostInfoOrderDetail (this.extend (request, params));
        //
        //     {
        //         "status": "0000",
        //         "data": {
        //             order_date: '1603161798539254',
        //             type: 'ask',
        //             order_status: 'Cancel',
        //             order_currency: 'BTC',
        //             payment_currency: 'KRW',
        //             watch_price: '0',
        //             order_price: '13344000',
        //             order_qty: '0.0125',
        //             cancel_date: '1603161803809993',
        //             cancel_type: '사용자취소',
        //             contract: [
        //                 {
        //                     transaction_date: '1603161799976383',
        //                     price: '13344000',
        //                     units: '0.0015',
        //                     fee_currency: 'KRW',
        //                     fee: '0',
        //                     total: '20016'
        //                 }
        //             ],
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data');
        return this.parseOrder (this.extend (data, { 'order_id': id }), market);
    }

    parseOrderStatus (status) {
        const statuses = {
            'Pending': 'open',
            'Completed': 'closed',
            'Cancel': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        //
        //
        // fetchOrder
        //
        //     {
        //         "transaction_date": "1572497603668315",
        //         "type": "bid",
        //         "order_status": "Completed", // Completed, Cancel ...
        //         "order_currency": "BTC",
        //         "payment_currency": "KRW",
        //         "watch_price": '0', // present in Cancel order
        //         "order_price": "8601000",
        //         "order_qty": "0.007",
        //         "cancel_date": "", // filled in Cancel order
        //         "cancel_type": "", // filled in Cancel order, i.e. 사용자취소
        //         "contract": [
        //             {
        //                 "transaction_date": "1572497603902030",
        //                 "price": "8601000",
        //                 "units": "0.005",
        //                 "fee_currency": "KRW",
        //                 "fee": "107.51",
        //                 "total": "43005"
        //             },
        //         ]
        //     }
        //
        // fetchOpenOrders
        //
        //     {
        //         "order_currency": "BTC",
        //         "payment_currency": "KRW",
        //         "order_id": "C0101000007408440032",
        //         "order_date": "1571728739360570",
        //         "type": "bid",
        //         "units": "5.0",
        //         "units_remaining": "5.0",
        //         "price": "501000",
        //     }
        //
        const timestamp = this.safeIntegerProduct (order, 'order_date', 0.001);
        const sideProperty = this.safeValue2 (order, 'type', 'side');
        const side = (sideProperty === 'bid') ? 'buy' : 'sell';
        const status = this.parseOrderStatus (this.safeString (order, 'order_status'));
        const price = this.safeString2 (order, 'order_price', 'price');
        let type = 'limit';
        if (Precise.stringEquals (price, '0')) {
            type = 'market';
        }
        const amount = this.fixCommaNumber (this.safeString2 (order, 'order_qty', 'units'));
        let remaining = this.fixCommaNumber (this.safeString (order, 'units_remaining'));
        if (remaining === undefined) {
            if (status === 'closed') {
                remaining = '0';
            } else if (status !== 'canceled') {
                remaining = amount;
            }
        }
        let symbol = undefined;
        const baseId = this.safeString (order, 'order_currency');
        const quoteId = this.safeString (order, 'payment_currency');
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        if ((base !== undefined) && (quote !== undefined)) {
            symbol = base + '/' + quote;
        }
        if (symbol === undefined) {
            market = this.safeMarket (undefined, market);
            symbol = market['symbol'];
        }
        const id = this.safeString (order, 'order_id');
        const rawTrades = this.safeValue (order, 'contract', []);
        return this.safeOrder ({
            'info': order,
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
            'filled': undefined,
            'remaining': remaining,
            'status': status,
            'fee': undefined,
            'trades': rawTrades,
        }, market);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bithumb#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @param {string} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch open orders for
         * @param {int|undefined} limit the maximum number of  open orders structures to retrieve
         * @param {object} params extra parameters specific to the bithumb api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOpenOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (limit === undefined) {
            limit = 100;
        }
        const request = {
            'count': limit,
            'order_currency': market['base'],
            'payment_currency': market['quote'],
        };
        if (since !== undefined) {
            request['after'] = since;
        }
        const response = await this.privatePostInfoOrders (this.extend (request, params));
        //
        //     {
        //         "status": "0000",
        //         "data": [
        //             {
        //                 "order_currency": "BTC",
        //                 "payment_currency": "KRW",
        //                 "order_id": "C0101000007408440032",
        //                 "order_date": "1571728739360570",
        //                 "type": "bid",
        //                 "units": "5.0",
        //                 "units_remaining": "5.0",
        //                 "price": "501000",
        //             }
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseOrders (data, market, since, limit);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name bithumb#cancelOrder
         * @description cancels an open order
         * @param {string} id order id
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the bithumb api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        const side_in_params = ('side' in params);
        if (!side_in_params) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a `side` parameter (sell or buy)');
        }
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a `symbol` argument');
        }
        const market = this.market (symbol);
        const side = (params['side'] === 'buy') ? 'bid' : 'ask';
        params = this.omit (params, [ 'side', 'currency' ]);
        // https://github.com/ccxt/ccxt/issues/6771
        const request = {
            'order_id': id,
            'type': side,
            'order_currency': market['base'],
            'payment_currency': market['quote'],
        };
        return await this.privatePostTradeCancel (this.extend (request, params));
    }

    cancelUnifiedOrder (order, params = {}) {
        const request = {
            'side': order['side'],
        };
        return this.cancelOrder (order['id'], order['symbol'], this.extend (request, params));
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        /**
         * @method
         * @name bithumb#withdraw
         * @description make a withdrawal
         * @param {string} code unified currency code
         * @param {float} amount the amount to withdraw
         * @param {string} address the address to withdraw to
         * @param {string|undefined} tag
         * @param {object} params extra parameters specific to the bithumb api endpoint
         * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
        [ tag, params ] = this.handleWithdrawTagAndParams (tag, params);
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'units': amount,
            'address': address,
            'currency': currency['id'],
        };
        if (currency === 'XRP' || currency === 'XMR' || currency === 'EOS' || currency === 'STEEM') {
            const destination = this.safeString (params, 'destination');
            if ((tag === undefined) && (destination === undefined)) {
                throw new ArgumentsRequired (this.id + ' ' + code + ' withdraw() requires a tag argument or an extra destination param');
            } else if (tag !== undefined) {
                request['destination'] = tag;
            }
        }
        const response = await this.privatePostTradeBtcWithdrawal (this.extend (request, params));
        //
        // { "status" : "0000"}
        //
        return this.parseTransaction (response, currency);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        // withdraw
        //
        //     { "status" : "0000"}
        //
        currency = this.safeCurrency (undefined, currency);
        return {
            'id': undefined,
            'txid': undefined,
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

    fixCommaNumber (numberStr) {
        // some endpoints need this https://github.com/ccxt/ccxt/issues/11031
        if (numberStr === undefined) {
            return undefined;
        }
        let finalNumberStr = numberStr;
        while (finalNumberStr.indexOf (',') > -1) {
            finalNumberStr = finalNumberStr.replace (',', '');
        }
        return finalNumberStr;
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const endpoint = '/' + this.implodeParams (path, params);
        let url = this.implodeHostname (this.urls['api'][api]) + endpoint;
        const query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            this.checkRequiredCredentials ();
            body = this.urlencode (this.extend ({
                'endpoint': endpoint,
            }, query));
            const nonce = this.nonce ().toString ();
            const auth = endpoint + "\0" + body + "\0" + nonce; // eslint-disable-line quotes
            const signature = this.hmac (this.encode (auth), this.encode (this.secret), 'sha512');
            const signature64 = this.decode (this.stringToBase64 (signature));
            headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
                'Api-Key': this.apiKey,
                'Api-Sign': signature64,
                'Api-Nonce': nonce,
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return; // fallback to default error handler
        }
        if ('status' in response) {
            //
            //     {"status":"5100","message":"After May 23th, recent_transactions is no longer, hence users will not be able to connect to recent_transactions"}
            //
            const status = this.safeString (response, 'status');
            const message = this.safeString (response, 'message');
            if (status !== undefined) {
                if (status === '0000') {
                    return; // no error
                } else if (message === '거래 진행중인 내역이 존재하지 않습니다') {
                    // https://github.com/ccxt/ccxt/issues/9017
                    return; // no error
                }
                const feedback = this.id + ' ' + body;
                this.throwExactlyMatchedException (this.exceptions, status, feedback);
                this.throwExactlyMatchedException (this.exceptions, message, feedback);
                throw new ExchangeError (feedback);
            }
        }
    }
};
