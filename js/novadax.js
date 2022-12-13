'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { AuthenticationError, ExchangeError, PermissionDenied, BadRequest, CancelPending, OrderNotFound, InsufficientFunds, RateLimitExceeded, InvalidOrder, AccountSuspended, BadSymbol, OnMaintenance, ArgumentsRequired, AccountNotEnabled } = require ('./base/errors');
const { TICK_SIZE } = require ('./base/functions/number');

//  ---------------------------------------------------------------------------

module.exports = class novadax extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'novadax',
            'name': 'NovaDAX',
            'countries': [ 'BR' ], // Brazil
            // 60 requests per second = 1000ms / 60 = 16.6667ms between requests (public endpoints, limited by IP address)
            // 20 requests per second => cost = 60 / 20 = 3 (private endpoints, limited by API Key)
            'rateLimit': 16.6667,
            'version': 'v1',
            // new metainfo interface
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
                'createStopLimitOrder': true,
                'createStopMarketOrder': true,
                'createStopOrder': true,
                'fetchAccounts': true,
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
                'fetchOHLCV': true,
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
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTransactions': true,
                'fetchWithdrawals': true,
                'reduceMargin': false,
                'setLeverage': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'transfer': true,
                'withdraw': true,
            },
            'timeframes': {
                '1m': 'ONE_MIN',
                '5m': 'FIVE_MIN',
                '15m': 'FIFTEEN_MIN',
                '30m': 'HALF_HOU',
                '1h': 'ONE_HOU',
                '1d': 'ONE_DAY',
                '1w': 'ONE_WEE',
                '1M': 'ONE_MON',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/92337550-2b085500-f0b3-11ea-98e7-5794fb07dd3b.jpg',
                'api': {
                    'public': 'https://api.novadax.com',
                    'private': 'https://api.novadax.com',
                },
                'www': 'https://www.novadax.com.br',
                'doc': [
                    'https://doc.novadax.com/pt-BR/',
                ],
                'fees': 'https://www.novadax.com.br/fees-and-limits',
                'referral': 'https://www.novadax.com.br/?s=ccxt',
            },
            'api': {
                'public': {
                    'get': {
                        'common/symbol': 1.2,
                        'common/symbols': 1.2,
                        'common/timestamp': 1.2,
                        'market/tickers': 1.2,
                        'market/ticker': 1.2,
                        'market/depth': 1.2,
                        'market/trades': 1.2,
                        'market/kline/history': 1.2,
                    },
                },
                'private': {
                    'get': {
                        'orders/get': 3,
                        'orders/list': 3,
                        'orders/fill': 3,
                        'orders/fills': 3,
                        'account/getBalance': 3,
                        'account/subs': 3,
                        'account/subs/balance': 3,
                        'account/subs/transfer/record': 3,
                        'wallet/query/deposit-withdraw': 3,
                    },
                    'post': {
                        'orders/create': 3,
                        'orders/cancel': 3,
                        'account/withdraw/coin': 3,
                        'account/subs/transfer': 3,
                    },
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'taker': this.parseNumber ('0.005'),
                    'maker': this.parseNumber ('0.0025'),
                },
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'precisionMode': TICK_SIZE,
            'exceptions': {
                'exact': {
                    'A99999': ExchangeError, // 500 Failed Internal error
                    // 'A10000': ExchangeError, // 200 Success Successful request
                    'A10001': BadRequest, // 400 Params error Parameter is invalid
                    'A10002': ExchangeError, // 404 Api not found API used is irrelevant
                    'A10003': AuthenticationError, // 403 Authentication failed Authentication is failed
                    'A10004': RateLimitExceeded, // 429 Too many requests Too many requests are made
                    'A10005': PermissionDenied, // 403 Kyc required Need to complete KYC firstly
                    'A10006': AccountSuspended, // 403 Customer canceled Account is canceled
                    'A10007': AccountNotEnabled, // 400 Account not exist Sub account does not exist
                    'A10011': BadSymbol, // 400 Symbol not exist Trading symbol does not exist
                    'A10012': BadSymbol, // 400 Symbol not trading Trading symbol is temporarily not available
                    'A10013': OnMaintenance, // 503 Symbol maintain Trading symbol is in maintain
                    'A30001': OrderNotFound, // 400 Order not found Queried order is not found
                    'A30002': InvalidOrder, // 400 Order amount is too small Order amount is too small
                    'A30003': InvalidOrder, // 400 Order amount is invalid Order amount is invalid
                    'A30004': InvalidOrder, // 400 Order value is too small Order value is too small
                    'A30005': InvalidOrder, // 400 Order value is invalid Order value is invalid
                    'A30006': InvalidOrder, // 400 Order price is invalid Order price is invalid
                    'A30007': InsufficientFunds, // 400 Insufficient balance The balance is insufficient
                    'A30008': InvalidOrder, // 400 Order was closed The order has been executed
                    'A30009': InvalidOrder, // 400 Order canceled The order has been cancelled
                    'A30010': CancelPending, // 400 Order cancelling The order is being cancelled
                    'A30011': InvalidOrder, // 400 Order price too high The order price is too high
                    'A30012': InvalidOrder, // 400 Order price too low The order price is too low
                    'A40004': InsufficientFunds, // {"code":"A40004","data":[],"message":"sub account balance Insufficient"}
                },
                'broad': {
                },
            },
            'options': {
                'fetchOHLCV': {
                    'volume': 'amount', // 'amount' for base volume or 'vol' for quote volume
                },
                'transfer': {
                    'fillResponseFromRequest': true,
                },
            },
        });
    }

    async fetchTime (params = {}) {
        /**
         * @method
         * @name novadax#fetchTime
         * @description fetches the current integer timestamp in milliseconds from the exchange server
         * @param {object} params extra parameters specific to the novadax api endpoint
         * @returns {int} the current integer timestamp in milliseconds from the exchange server
         */
        const response = await this.publicGetCommonTimestamp (params);
        //
        //     {
        //         "code":"A10000",
        //         "data":1599090512080,
        //         "message":"Success"
        //     }
        //
        return this.safeInteger (response, 'data');
    }

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name novadax#fetchMarkets
         * @description retrieves data on all markets for novadax
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {[object]} an array of objects representing market data
         */
        const response = await this.publicGetCommonSymbols (params);
        //
        //     {
        //         "code":"A10000",
        //         "data":[
        //             {
        //                 "amountPrecision":8,
        //                 "baseCurrency":"BTC",
        //                 "minOrderAmount":"0.001",
        //                 "minOrderValue":"25",
        //                 "pricePrecision":2,
        //                 "quoteCurrency":"BRL",
        //                 "status":"ONLINE",
        //                 "symbol":"BTC_BRL",
        //                 "valuePrecision":2
        //             },
        //         ],
        //         "message":"Success"
        //     }
        //
        const result = [];
        const data = this.safeValue (response, 'data', []);
        for (let i = 0; i < data.length; i++) {
            const market = data[i];
            const baseId = this.safeString (market, 'baseCurrency');
            const quoteId = this.safeString (market, 'quoteCurrency');
            const id = this.safeString (market, 'symbol');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const status = this.safeString (market, 'status');
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
                'active': (status === 'ONLINE'),
                'contract': false,
                'linear': undefined,
                'inverse': undefined,
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': this.parseNumber (this.parsePrecision (this.safeString (market, 'amountPrecision'))),
                    'price': this.parseNumber (this.parsePrecision (this.safeString (market, 'pricePrecision'))),
                    'cost': this.parseNumber (this.parsePrecision (this.safeString (market, 'valuePrecision'))),
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': {
                        'min': this.safeNumber (market, 'minOrderAmount'),
                        'max': undefined,
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'cost': {
                        'min': this.safeNumber (market, 'minOrderValue'),
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
        // fetchTicker, fetchTickers
        //
        //     {
        //         "ask":"61946.1",
        //         "baseVolume24h":"164.41930186",
        //         "bid":"61815",
        //         "high24h":"64930.72",
        //         "lastPrice":"61928.41",
        //         "low24h":"61156.32",
        //         "open24h":"64512.46",
        //         "quoteVolume24h":"10308157.95",
        //         "symbol":"BTC_BRL",
        //         "timestamp":1599091115090
        //     }
        //
        const timestamp = this.safeInteger (ticker, 'timestamp');
        const marketId = this.safeString (ticker, 'symbol');
        const symbol = this.safeSymbol (marketId, market, '_');
        const open = this.safeString (ticker, 'open24h');
        const last = this.safeString (ticker, 'lastPrice');
        const baseVolume = this.safeString (ticker, 'baseVolume24h');
        const quoteVolume = this.safeString (ticker, 'quoteVolume24h');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'high24h'),
            'low': this.safeString (ticker, 'low24h'),
            'bid': this.safeString (ticker, 'bid'),
            'bidVolume': undefined,
            'ask': this.safeString (ticker, 'ask'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': open,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        }, market);
    }

    async fetchTicker (symbol, params = {}) {
        /**
         * @method
         * @name novadax#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the novadax api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicGetMarketTicker (this.extend (request, params));
        //
        //     {
        //         "code":"A10000",
        //         "data":{
        //             "ask":"61946.1",
        //             "baseVolume24h":"164.41930186",
        //             "bid":"61815",
        //             "high24h":"64930.72",
        //             "lastPrice":"61928.41",
        //             "low24h":"61156.32",
        //             "open24h":"64512.46",
        //             "quoteVolume24h":"10308157.95",
        //             "symbol":"BTC_BRL",
        //             "timestamp":1599091115090
        //         },
        //         "message":"Success"
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        return this.parseTicker (data, market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        /**
         * @method
         * @name novadax#fetchTickers
         * @description fetches price tickers for multiple markets, statistical calculations with the information calculated over the past 24 hours each market
         * @param {[string]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} params extra parameters specific to the novadax api endpoint
         * @returns {object} an array of [ticker structures]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const response = await this.publicGetMarketTickers (params);
        //
        //     {
        //         "code":"A10000",
        //         "data":[
        //             {
        //                 "ask":"61879.36",
        //                 "baseVolume24h":"164.40955092",
        //                 "bid":"61815",
        //                 "high24h":"64930.72",
        //                 "lastPrice":"61820.04",
        //                 "low24h":"61156.32",
        //                 "open24h":"64624.19",
        //                 "quoteVolume24h":"10307493.92",
        //                 "symbol":"BTC_BRL",
        //                 "timestamp":1599091291083
        //             },
        //         ],
        //         "message":"Success"
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
         * @name novadax#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the novadax api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit; // default 10, max 20
        }
        const response = await this.publicGetMarketDepth (this.extend (request, params));
        //
        //     {
        //         "code":"A10000",
        //         "data":{
        //             "asks":[
        //                 ["0.037159","0.3741"],
        //                 ["0.037215","0.2706"],
        //                 ["0.037222","1.8459"],
        //             ],
        //             "bids":[
        //                 ["0.037053","0.3857"],
        //                 ["0.036969","0.8101"],
        //                 ["0.036953","1.5226"],
        //             ],
        //             "timestamp":1599280414448
        //         },
        //         "message":"Success"
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const timestamp = this.safeInteger (data, 'timestamp');
        return this.parseOrderBook (data, market['symbol'], timestamp, 'bids', 'asks');
    }

    parseTrade (trade, market = undefined) {
        //
        // public fetchTrades
        //
        //     {
        //         "amount":"0.0632",
        //         "price":"0.037288",
        //         "side":"BUY",
        //         "timestamp":1599279694576
        //     }
        //
        // private fetchOrderTrades
        //
        //      {
        //          "id": "608717046691139584",
        //          "orderId": "608716957545402368",
        //          "symbol": "BTC_BRL",
        //          "side": "BUY",
        //          "amount": "0.0988",
        //          "price": "45514.76",
        //          "fee": "0.0000988 BTC",
        //          "feeAmount": "0.0000988",
        //          "feeCurrency": "BTC",
        //          "role": "MAKER",
        //          "timestamp": 1565171053345
        //       }
        //
        // private fetchMyTrades (same endpoint as fetchOrderTrades)
        //
        //      {
        //          "id": "608717046691139584",
        //          "orderId": "608716957545402368",
        //          "symbol": "BTC_BRL",
        //          "side": "BUY",
        //          "amount": "0.0988",
        //          "price": "45514.76",
        //          "fee": "0.0000988 BTC",
        //          "feeAmount": "0.0000988",
        //          "feeCurrency": "BTC",
        //          "role": "MAKER",
        //          "timestamp": 1565171053345
        //       }
        //
        const id = this.safeString (trade, 'id');
        const orderId = this.safeString (trade, 'orderId');
        const timestamp = this.safeInteger (trade, 'timestamp');
        const side = this.safeStringLower (trade, 'side');
        const priceString = this.safeString (trade, 'price');
        const amountString = this.safeString (trade, 'amount');
        const marketId = this.safeString (trade, 'symbol');
        const symbol = this.safeSymbol (marketId, market, '_');
        const takerOrMaker = this.safeStringLower (trade, 'role');
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
            'id': id,
            'order': orderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': undefined,
            'side': side,
            'price': priceString,
            'amount': amountString,
            'cost': undefined,
            'takerOrMaker': takerOrMaker,
            'fee': fee,
            'info': trade,
        }, market);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name novadax#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the novadax api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit; // default 100
        }
        const response = await this.publicGetMarketTrades (this.extend (request, params));
        //
        //     {
        //         "code":"A10000",
        //         "data":[
        //             {"amount":"0.0632","price":"0.037288","side":"BUY","timestamp":1599279694576},
        //             {"amount":"0.0052","price":"0.03715","side":"SELL","timestamp":1599276606852},
        //             {"amount":"0.0058","price":"0.037188","side":"SELL","timestamp":1599275187812},
        //         ],
        //         "message":"Success"
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseTrades (data, market, since, limit);
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name novadax#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
         * @param {int|undefined} limit the maximum amount of candles to fetch
         * @param {object} params extra parameters specific to the novadax api endpoint
         * @returns {[[int]]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'unit': this.timeframes[timeframe],
        };
        const duration = this.parseTimeframe (timeframe);
        const now = this.seconds ();
        if (limit === undefined) {
            limit = 3000; // max
        }
        if (since === undefined) {
            request['from'] = now - limit * duration;
            request['to'] = now;
        } else {
            const startFrom = parseInt (since / 1000);
            request['from'] = startFrom;
            request['to'] = this.sum (startFrom, limit * duration);
        }
        const response = await this.publicGetMarketKlineHistory (this.extend (request, params));
        //
        //     {
        //         "code": "A10000",
        //         "data": [
        //             {
        //                 "amount": 8.25709100,
        //                 "closePrice": 62553.20,
        //                 "count": 29,
        //                 "highPrice": 62592.87,
        //                 "lowPrice": 62553.20,
        //                 "openPrice": 62554.23,
        //                 "score": 1602501480,
        //                 "symbol": "BTC_BRL",
        //                 "vol": 516784.2504067500
        //             }
        //         ],
        //         "message": "Success"
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseOHLCVs (data, market, timeframe, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        //     {
        //         "amount": 8.25709100,
        //         "closePrice": 62553.20,
        //         "count": 29,
        //         "highPrice": 62592.87,
        //         "lowPrice": 62553.20,
        //         "openPrice": 62554.23,
        //         "score": 1602501480,
        //         "symbol": "BTC_BRL",
        //         "vol": 516784.2504067500
        //     }
        //
        const options = this.safeValue (this.options, 'fetchOHLCV', {});
        const volumeField = this.safeString (options, 'volume', 'amount'); // or vol
        return [
            this.safeTimestamp (ohlcv, 'score'),
            this.safeNumber (ohlcv, 'openPrice'),
            this.safeNumber (ohlcv, 'highPrice'),
            this.safeNumber (ohlcv, 'lowPrice'),
            this.safeNumber (ohlcv, 'closePrice'),
            this.safeNumber (ohlcv, volumeField),
        ];
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
            const currencyId = this.safeString (balance, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['total'] = this.safeString (balance, 'balance');
            account['free'] = this.safeString (balance, 'available');
            account['used'] = this.safeString (balance, 'hold');
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    async fetchBalance (params = {}) {
        /**
         * @method
         * @name novadax#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} params extra parameters specific to the novadax api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.loadMarkets ();
        const response = await this.privateGetAccountGetBalance (params);
        //
        //     {
        //         "code": "A10000",
        //         "data": [
        //             {
        //                 "available": "1.23",
        //                 "balance": "0.23",
        //                 "currency": "BTC",
        //                 "hold": "1"
        //             }
        //         ],
        //         "message": "Success"
        //     }
        //
        return this.parseBalance (response);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name novadax#createOrder
         * @description create a trade order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float|undefined} price the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} params extra parameters specific to the novadax api endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        let uppercaseType = type.toUpperCase ();
        const uppercaseSide = side.toUpperCase ();
        const request = {
            'symbol': market['id'],
            'side': uppercaseSide, // or SELL
            // 'amount': this.amountToPrecision (symbol, amount),
            // "price": "1234.5678", // required for LIMIT and STOP orders
            // 'operator': '' // for stop orders, can be found in order introduction
            // 'stopPrice': this.priceToPrecision (symbol, stopPrice),
            // 'accountId': '...', // subaccount id, optional
        };
        const stopPrice = this.safeValue2 (params, 'triggerPrice', 'stopPrice');
        if (stopPrice === undefined) {
            if ((uppercaseType === 'STOP_LIMIT') || (uppercaseType === 'STOP_MARKET')) {
                throw new ArgumentsRequired (this.id + ' createOrder() requires a stopPrice parameter for ' + uppercaseType + ' orders');
            }
        } else {
            if (uppercaseType === 'LIMIT') {
                uppercaseType = 'STOP_LIMIT';
            } else if (uppercaseType === 'MARKET') {
                uppercaseType = 'STOP_MARKET';
            }
            const defaultOperator = (uppercaseSide === 'BUY') ? 'LTE' : 'GTE';
            request['operator'] = this.safeString (params, 'operator', defaultOperator);
            request['stopPrice'] = this.priceToPrecision (symbol, stopPrice);
            params = this.omit (params, [ 'triggerPrice', 'stopPrice' ]);
        }
        if ((uppercaseType === 'LIMIT') || (uppercaseType === 'STOP_LIMIT')) {
            request['price'] = this.priceToPrecision (symbol, price);
            request['amount'] = this.amountToPrecision (symbol, amount);
        } else if ((uppercaseType === 'MARKET') || (uppercaseType === 'STOP_MARKET')) {
            if (uppercaseSide === 'SELL') {
                request['amount'] = this.amountToPrecision (symbol, amount);
            } else if (uppercaseSide === 'BUY') {
                let value = this.safeNumber (params, 'value');
                const createMarketBuyOrderRequiresPrice = this.safeValue (this.options, 'createMarketBuyOrderRequiresPrice', true);
                if (createMarketBuyOrderRequiresPrice) {
                    if (price !== undefined) {
                        if (value === undefined) {
                            value = amount * price;
                        }
                    } else if (value === undefined) {
                        throw new InvalidOrder (this.id + " createOrder() requires the price argument with market buy orders to calculate total order cost (amount to spend), where cost = amount * price. Supply a price argument to createOrder() call if you want the cost to be calculated for you from price and amount, or, alternatively, add .options['createMarketBuyOrderRequiresPrice'] = false and supply the total cost value in the 'amount' argument or in the 'value' extra parameter (the exchange-specific behaviour)");
                    }
                } else {
                    value = (value === undefined) ? amount : value;
                }
                request['value'] = this.costToPrecision (symbol, value);
            }
        }
        request['type'] = uppercaseType;
        const response = await this.privatePostOrdersCreate (this.extend (request, params));
        //
        //     {
        //         "code": "A10000",
        //         "data": {
        //             "amount": "0.001",
        //             "averagePrice": null,
        //             "filledAmount": "0",
        //             "filledFee": "0",
        //             "filledValue": "0",
        //             "id": "870613508008464384",
        //             "operator": "GTE",
        //             "price": "210000",
        //             "side": "BUY",
        //             "status": "SUBMITTED",
        //             "stopPrice": "211000",
        //             "symbol": "BTC_BRL",
        //             "timestamp": 1627612035528,
        //             "type": "STOP_LIMIT",
        //             "value": "210"
        //         },
        //         "message": "Success"
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        return this.parseOrder (data, market);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name novadax#cancelOrder
         * @description cancels an open order
         * @param {string} id order id
         * @param {string|undefined} symbol not used by novadax cancelOrder ()
         * @param {object} params extra parameters specific to the novadax api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const request = {
            'id': id,
        };
        const response = await this.privatePostOrdersCancel (this.extend (request, params));
        //
        //     {
        //         "code": "A10000",
        //         "data": {
        //             "result": true
        //         },
        //         "message": "Success"
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        return this.parseOrder (data);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name novadax#fetchOrder
         * @description fetches information on an order made by the user
         * @param {string|undefined} symbol not used by novadax fetchOrder
         * @param {object} params extra parameters specific to the novadax api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const request = {
            'id': id,
        };
        const response = await this.privateGetOrdersGet (this.extend (request, params));
        //
        //     {
        //         "code": "A10000",
        //         "data": {
        //             "id": "608695623247466496",
        //             "symbol": "BTC_BRL",
        //             "type": "MARKET",
        //             "side": "SELL",
        //             "price": null,
        //             "averagePrice": "0",
        //             "amount": "0.123",
        //             "filledAmount": "0",
        //             "value": null,
        //             "filledValue": "0",
        //             "filledFee": "0",
        //             "status": "REJECTED",
        //             "timestamp": 1565165945588
        //         },
        //         "message": "Success"
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        return this.parseOrder (data);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name novadax#fetchOrders
         * @description fetches information on multiple orders made by the user
         * @param {string|undefined} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the novadax api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const request = {
            // 'symbol': market['id'],
            // 'status': 'SUBMITTED,PROCESSING', // SUBMITTED, PROCESSING, PARTIAL_FILLED, CANCELING, FILLED, CANCELED, REJECTED
            // 'fromId': '...', // order id to begin with
            // 'toId': '...', // order id to end up with
            // 'fromTimestamp': since,
            // 'toTimestamp': this.milliseconds (),
            // 'limit': limit, // default 100, max 100
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 100, max 100
        }
        if (since !== undefined) {
            request['fromTimestamp'] = since;
        }
        const response = await this.privateGetOrdersList (this.extend (request, params));
        //
        //     {
        //         "code": "A10000",
        //         "data": [
        //             {
        //                 "id": "608695678650028032",
        //                 "symbol": "BTC_BRL",
        //                 "type": "MARKET",
        //                 "side": "SELL",
        //                 "price": null,
        //                 "averagePrice": "0",
        //                 "amount": "0.123",
        //                 "filledAmount": "0",
        //                 "value": null,
        //                 "filledValue": "0",
        //                 "filledFee": "0",
        //                 "status": "REJECTED",
        //                 "timestamp": 1565165958796
        //             },
        //         ],
        //         "message": "Success"
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseOrders (data, market, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name novadax#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch open orders for
         * @param {int|undefined} limit the maximum number of  open orders structures to retrieve
         * @param {object} params extra parameters specific to the novadax api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        const request = {
            'status': 'SUBMITTED,PROCESSING,PARTIAL_FILLED,CANCELING',
        };
        return await this.fetchOrders (symbol, since, limit, this.extend (request, params));
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name novadax#fetchClosedOrders
         * @description fetches information on multiple closed orders made by the user
         * @param {string|undefined} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the novadax api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        const request = {
            'status': 'FILLED,CANCELED,REJECTED',
        };
        return await this.fetchOrders (symbol, since, limit, this.extend (request, params));
    }

    async fetchOrderTrades (id, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name novadax#fetchOrderTrades
         * @description fetch all the trades made from a single order
         * @param {string} id order id
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch trades for
         * @param {int|undefined} limit the maximum number of trades to retrieve
         * @param {object} params extra parameters specific to the novadax api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html#trade-structure}
         */
        await this.loadMarkets ();
        const request = {
            'id': id,
        };
        const response = await this.privateGetOrdersFill (this.extend (request, params));
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const data = this.safeValue (response, 'data', []);
        //
        //      {
        //          "code": "A10000",
        //          "data": [
        //              {
        //                  "id": "608717046691139584",
        //                  "orderId": "608716957545402368",
        //                  "symbol": "BTC_BRL",
        //                  "side": "BUY",
        //                  "amount": "0.0988",
        //                  "price": "45514.76",
        //                  "fee": "0.0000988 BTC",
        //                  "feeAmount": "0.0000988",
        //                  "feeCurrency": "BTC",
        //                  "role": "MAKER",
        //                  "timestamp": 1565171053345
        //              },
        //          ],
        //          "message": "Success"
        //      }
        //
        return this.parseTrades (data, market, since, limit);
    }

    parseOrderStatus (status) {
        const statuses = {
            'SUBMITTED': 'open',
            'PROCESSING': 'open',
            'PARTIAL_FILLED': 'open',
            'CANCELING': 'open',
            'FILLED': 'closed',
            'CANCELED': 'canceled',
            'REJECTED': 'rejected',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        //
        // createOrder, fetchOrders, fetchOrder
        //
        //     {
        //         "amount": "0.001",
        //         "averagePrice": null,
        //         "filledAmount": "0",
        //         "filledFee": "0",
        //         "filledValue": "0",
        //         "id": "870613508008464384",
        //         "operator": "GTE",
        //         "price": "210000",
        //         "side": "BUY",
        //         "status": "SUBMITTED",
        //         "stopPrice": "211000",
        //         "symbol": "BTC_BRL",
        //         "timestamp": 1627612035528,
        //         "type": "STOP_LIMIT",
        //         "value": "210"
        //     }
        //
        // cancelOrder
        //
        //     {
        //         "result": true
        //     }
        //
        const id = this.safeString (order, 'id');
        const amount = this.safeString (order, 'amount');
        const price = this.safeString (order, 'price');
        const cost = this.safeString2 (order, 'filledValue', 'value');
        const type = this.safeStringLower (order, 'type');
        const side = this.safeStringLower (order, 'side');
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const timestamp = this.safeInteger (order, 'timestamp');
        const average = this.safeString (order, 'averagePrice');
        const filled = this.safeString (order, 'filledAmount');
        let fee = undefined;
        const feeCost = this.safeNumber (order, 'filledFee');
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'currency': undefined,
            };
        }
        const marketId = this.safeString (order, 'symbol');
        const symbol = this.safeSymbol (marketId, market, '_');
        const stopPrice = this.safeNumber (order, 'stopPrice');
        return this.safeOrder ({
            'id': id,
            'clientOrderId': undefined,
            'info': order,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
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
            'average': average,
            'filled': filled,
            'remaining': undefined,
            'status': status,
            'fee': fee,
            'trades': undefined,
        }, market);
    }

    async transfer (code, amount, fromAccount, toAccount, params = {}) {
        /**
         * @method
         * @name novadax#transfer
         * @description transfer currency internally between wallets on the same account
         * @param {string} code unified currency code
         * @param {float} amount amount to transfer
         * @param {string} fromAccount account to transfer from
         * @param {string} toAccount account to transfer to
         * @param {object} params extra parameters specific to the novadax api endpoint
         * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/en/latest/manual.html#transfer-structure}
         */
        await this.loadMarkets ();
        const currency = this.currency (code);
        if (fromAccount !== 'main' && toAccount !== 'main') {
            throw new ExchangeError (this.id + ' transfer() supports transfers between main account and subaccounts only');
        }
        // master-transfer-in = from master account to subaccount
        // master-transfer-out = from subaccount to master account
        const type = (fromAccount === 'main') ? 'master-transfer-in' : 'master-transfer-out';
        const request = {
            'transferAmount': this.currencyToPrecision (code, amount),
            'currency': currency['id'],
            'subId': (type === 'master-transfer-in') ? toAccount : fromAccount,
            'transferType': type,
        };
        const response = await this.privatePostAccountSubsTransfer (this.extend (request, params));
        //
        //    {
        //        "code":"A10000",
        //        "message":"Success",
        //        "data":40
        //    }
        //
        const transfer = this.parseTransfer (response, currency);
        const transferOptions = this.safeValue (this.options, 'transfer', {});
        const fillResponseFromRequest = this.safeValue (transferOptions, 'fillResponseFromRequest', true);
        if (fillResponseFromRequest) {
            transfer['fromAccount'] = fromAccount;
            transfer['toAccount'] = toAccount;
            transfer['amount'] = amount;
        }
        return transfer;
    }

    parseTransfer (transfer, currency = undefined) {
        //
        //    {
        //        "code":"A10000",
        //        "message":"Success",
        //        "data":40
        //    }
        //
        const id = this.safeString (transfer, 'data');
        const status = this.safeString (transfer, 'message');
        const currencyCode = this.safeCurrencyCode (undefined, currency);
        return {
            'info': transfer,
            'id': id,
            'amount': undefined,
            'code': currencyCode, // kept here for backward-compatibility, but will be removed soon
            'currency': currencyCode,
            'fromAccount': undefined,
            'toAccount': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'status': status,
        };
    }

    parseTransferStatus (status) {
        const statuses = {
            'SUCCESS': 'pending',
        };
        return this.safeString (statuses, status, 'failed');
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        /**
         * @method
         * @name novadax#withdraw
         * @description make a withdrawal
         * @param {string} code unified currency code
         * @param {float} amount the amount to withdraw
         * @param {string} address the address to withdraw to
         * @param {string|undefined} tag
         * @param {object} params extra parameters specific to the novadax api endpoint
         * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
        [ tag, params ] = this.handleWithdrawTagAndParams (tag, params);
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'code': currency['id'],
            'amount': this.currencyToPrecision (code, amount),
            'wallet': address,
        };
        if (tag !== undefined) {
            request['tag'] = tag;
        }
        const response = await this.privatePostAccountWithdrawCoin (this.extend (request, params));
        //
        //     {
        //         "code":"A10000",
        //         "data": "DR123",
        //         "message":"Success"
        //     }
        //
        return this.parseTransaction (response, currency);
    }

    async fetchAccounts (params = {}) {
        /**
         * @method
         * @name novadax#fetchAccounts
         * @description fetch all the accounts associated with a profile
         * @param {object} params extra parameters specific to the novadax api endpoint
         * @returns {object} a dictionary of [account structures]{@link https://docs.ccxt.com/en/latest/manual.html#account-structure} indexed by the account type
         */
        const response = await this.privateGetAccountSubs (params);
        //
        //     {
        //         "code": "A10000",
        //         "data": [
        //             {
        //                 "subId": "CA648856083527372800",
        //                 "state": "Normal",
        //                 "subAccount": "003",
        //                 "subIdentify": "003"
        //             }
        //         ],
        //         "message": "Success"
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        const result = [];
        for (let i = 0; i < data.length; i++) {
            const account = data[i];
            const accountId = this.safeString (account, 'subId');
            const type = this.safeString (account, 'subAccount');
            result.push ({
                'id': accountId,
                'type': type,
                'currency': undefined,
                'info': account,
            });
        }
        return result;
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name novadax#fetchDeposits
         * @description fetch all deposits made to an account
         * @param {string|undefined} code unified currency code
         * @param {int|undefined} since the earliest time in ms to fetch deposits for
         * @param {int|undefined} limit the maximum number of deposits structures to retrieve
         * @param {object} params extra parameters specific to the novadax api endpoint
         * @returns {[object]} a list of [transaction structures]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
        const request = {
            'type': 'coin_in',
        };
        return await this.fetchTransactions (code, since, limit, this.extend (request, params));
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name novadax#fetchWithdrawals
         * @description fetch all withdrawals made from an account
         * @param {string|undefined} code unified currency code
         * @param {int|undefined} since the earliest time in ms to fetch withdrawals for
         * @param {int|undefined} limit the maximum number of withdrawals structures to retrieve
         * @param {object} params extra parameters specific to the novadax api endpoint
         * @returns {[object]} a list of [transaction structures]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
        const request = {
            'type': 'coin_out',
        };
        return await this.fetchTransactions (code, since, limit, this.extend (request, params));
    }

    async fetchTransactions (code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name novadax#fetchTransactions
         * @description fetch history of deposits and withdrawals
         * @param {string|undefined} code unified currency code for the currency of the transactions, default is undefined
         * @param {int|undefined} since timestamp in ms of the earliest transaction, default is undefined
         * @param {int|undefined} limit max number of transactions to return, default is undefined
         * @param {object} params extra parameters specific to the novadax api endpoint
         * @returns {object} a list of [transaction structure]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
        await this.loadMarkets ();
        const request = {
            // 'currency': currency['id'],
            // 'type': 'coin_in', // 'coin_out'
            // 'direct': 'asc', // 'desc'
            // 'size': limit, // default 100
            // 'start': id, // offset id
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['id'];
        }
        if (limit !== undefined) {
            request['size'] = limit;
        }
        const response = await this.privateGetWalletQueryDepositWithdraw (this.extend (request, params));
        //
        //     {
        //         "code": "A10000",
        //         "data": [
        //             {
        //                 "id": "DR562339304588709888",
        //                 "type": "COIN_IN",
        //                 "currency": "XLM",
        //                 "chain": "XLM",
        //                 "address": "GCUTK7KHPJC3ZQJ3OMWWFHAK2OXIBRD4LNZQRCCOVE7A2XOPP2K5PU5Q",
        //                 "addressTag": "1000009",
        //                 "amount": 1.0,
        //                 "state": "SUCCESS",
        //                 "txHash": "39210645748822f8d4ce673c7559aa6622e6e9cdd7073bc0fcae14b1edfda5f4",
        //                 "createdAt": 1554113737000,
        //                 "updatedAt": 1601371273000
        //             }
        //         ],
        //         "message": "Success"
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseTransactions (data, currency, since, limit);
    }

    parseTransactionStatus (status) {
        // Pending the record is wait broadcast to chain
        // x/M confirming the comfirming state of tx, the M is total confirmings needed
        // SUCCESS the record is success full
        // FAIL the record failed
        const parts = status.split (' ');
        status = this.safeString (parts, 1, status);
        const statuses = {
            'Pending': 'pending',
            'confirming': 'pending',
            'SUCCESS': 'ok',
            'FAIL': 'failed',
        };
        return this.safeString (statuses, status, status);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        // withdraw
        //
        //     {
        //         "code":"A10000",
        //         "data": "DR123",
        //         "message":"Success"
        //     }
        //
        // fetchTransactions
        //
        //     {
        //         "id": "DR562339304588709888",
        //         "type": "COIN_IN",
        //         "currency": "XLM",
        //         "chain": "XLM",
        //         "address": "GCUTK7KHPJC3ZQJ3OMWWFHAK2OXIBRD4LNZQRCCOVE7A2XOPP2K5PU5Q",
        //         "addressTag": "1000009",
        //         "amount": 1.0,
        //         "state": "SUCCESS",
        //         "txHash": "39210645748822f8d4ce673c7559aa6622e6e9cdd7073bc0fcae14b1edfda5f4",
        //         "createdAt": 1554113737000,
        //         "updatedAt": 1601371273000
        //     }
        //
        const id = this.safeString2 (transaction, 'id', 'data');
        let type = this.safeString (transaction, 'type');
        if (type === 'COIN_IN') {
            type = 'deposit';
        } else if (type === 'COIN_OUT') {
            type = 'withdraw';
        }
        const amount = this.safeNumber (transaction, 'amount');
        const address = this.safeString (transaction, 'address');
        const tag = this.safeString (transaction, 'addressTag');
        const txid = this.safeString (transaction, 'txHash');
        const timestamp = this.safeInteger (transaction, 'createdAt');
        const updated = this.safeInteger (transaction, 'updatedAt');
        const currencyId = this.safeString (transaction, 'currency');
        const code = this.safeCurrencyCode (currencyId, currency);
        const status = this.parseTransactionStatus (this.safeString (transaction, 'state'));
        const network = this.safeString (transaction, 'chain');
        return {
            'info': transaction,
            'id': id,
            'currency': code,
            'amount': amount,
            'network': network,
            'address': address,
            'addressTo': address,
            'addressFrom': undefined,
            'tag': tag,
            'tagTo': tag,
            'tagFrom': undefined,
            'status': status,
            'type': type,
            'updated': updated,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'fee': undefined,
        };
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name novadax#fetchMyTrades
         * @description fetch all trades made by the user
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch trades for
         * @param {int|undefined} limit the maximum number of trades structures to retrieve
         * @param {object} params extra parameters specific to the novadax api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html#trade-structure}
         */
        await this.loadMarkets ();
        const request = {
            //  'orderId': id, // Order ID, string
            //  'symbol': market['id'], // The trading symbol, like BTC_BRL, string
            //  'fromId': fromId, // Search fill id to begin with, string
            //  'toId': toId, // Search fill id to end up with, string
            //  'fromTimestamp': since, // Search order fill time to begin with, in milliseconds, string
            //  'toTimestamp': this.milliseconds (), // Search order fill time to end up with, in milliseconds, string
            //  'limit': limit, // The number of fills to return, default 100, max 100, string
            //  'accountId': subaccountId, // Sub account ID, if not informed, the fills will be return under master account, string
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (since !== undefined) {
            request['fromTimestamp'] = since;
        }
        const response = await this.privateGetOrdersFills (this.extend (request, params));
        //
        //      {
        //          "code": "A10000",
        //          "data": [
        //              {
        //                  "id": "608717046691139584",
        //                  "orderId": "608716957545402368",
        //                  "symbol": "BTC_BRL",
        //                  "side": "BUY",
        //                  "amount": "0.0988",
        //                  "price": "45514.76",
        //                  "fee": "0.0000988 BTC",
        //                  "feeAmount": "0.0000988",
        //                  "feeCurrency": "BTC",
        //                  "role": "MAKER",
        //                  "timestamp": 1565171053345
        //              },
        //          ],
        //          "message": "Success"
        //      }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseTrades (data, market, since, limit);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const request = '/' + this.version + '/' + this.implodeParams (path, params);
        let url = this.urls['api'][api] + request;
        const query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else if (api === 'private') {
            this.checkRequiredCredentials ();
            const timestamp = this.milliseconds ().toString ();
            headers = {
                'X-Nova-Access-Key': this.apiKey,
                'X-Nova-Timestamp': timestamp,
            };
            let queryString = undefined;
            if (method === 'POST') {
                body = this.json (query);
                queryString = this.hash (this.encode (body), 'md5');
                headers['Content-Type'] = 'application/json';
            } else {
                if (Object.keys (query).length) {
                    url += '?' + this.urlencode (query);
                }
                queryString = this.urlencode (this.keysort (query));
            }
            const auth = method + "\n" + request + "\n" + queryString + "\n" + timestamp; // eslint-disable-line quotes
            headers['X-Nova-Signature'] = this.hmac (this.encode (auth), this.encode (this.secret));
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return;
        }
        //
        //     {"code":"A10003","data":[],"message":"Authentication failed, Invalid accessKey."}
        //
        const errorCode = this.safeString (response, 'code');
        if (errorCode !== 'A10000') {
            const message = this.safeString (response, 'message');
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
            throw new ExchangeError (feedback); // unknown message
        }
    }
};
