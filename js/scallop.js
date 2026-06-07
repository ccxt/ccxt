'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { AccountSuspended, ArgumentsRequired, ExchangeError, ExchangeNotAvailable, InsufficientFunds, OrderNotFound, InvalidOrder, InvalidNonce, AuthenticationError, RateLimitExceeded, PermissionDenied, BadRequest, BadSymbol, BadResponse, RequestTimeout } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class scallop extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'scallop',
            'name': 'Scallop',
            'countries': [ 'SG' ],
            'version': 'v1',
            // 100 requests in 2 seconds = 50 requests per second => ( 1000ms / 50 ) = 20 ms between requests on average
            'rateLimit': 20,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': true,
                'swap': undefined,
                'future': true,
                'option': false,
                'cancelOrder': true,
                'cancelOrders': true,
                'createOrder': true,
                'createOrders': true,
                'fetchBalance': true,
                'fetchCurrencies': false,
                'fetchDepositAddress': false,
                'fetchDeposits': false,
                'fetchFundingRate': true,
                'fetchFundingRates': false,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': false,
                'fetchStatus': true,
                'fetchTicker': true,
                'fetchTickers': false,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchWithdrawals': false,
                'transfer': false,
                'withdraw': false,
            },
            'timeframes': {
                '1m': '1min',
                '5m': '5min',
                '15m': '15min',
                '30m': '30min',
                '1h': '1h',
                '4h': '4h',
                '1d': '1day',
                '1w': '1week',
                '1M': '1month',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/51840849/87443315-01283a00-c5fe-11ea-8628-c2a0feaf07ac.jpg',
                'api': {
                    'public': 'https://openapi.scallop.exchange/sapi',
                    'private': 'https://openapi.scallop.exchange/sapi',
                    'futuresPublic': 'https://futuresopenapi.scallop.exchange/fapi',
                    'futuresPrivate': 'https://futuresopenapi.scallop.exchange/fapi',
                },
                'www': 'https://www.scallop.exchange',
                'doc': [
                    'https://www.scallop.exchange/en_US/cms/apidoc',
                ],
            },
            'api': {
                'public': {
                    'get': {
                        'ping': 1, // not documented
                        'time': 1, // not documented
                        'symbols': 1, // not documented
                        'depth': 1, // not documented
                        'ticker': 1, // not documented
                        'trades': 1, // not documented
                        'klines': 1, // not documented
                    },
                },
                'private': {
                    'get': {
                        'account': 5, // 20 requrests in 2 seconds = 10 requests per second
                        'order': 5, // 20 requrests in 2 seconds = 10 requests per second
                        'openOrders': 5, // 20 requrests in 2 seconds = 10 requests per second
                        'myTrades': 5, // 20 requrests in 2 seconds = 10 requests per second
                        'margin/order': 5, // 20 requrests in 2 seconds = 10 requests per second
                        'margin/openOrders': 5, // 20 requrests in 2 seconds = 10 requests per second
                        'margin/myTrades': 5, // 20 requrests in 2 seconds = 10 requests per second
                    },
                    'post': {
                        'order': 1, // 100 requests in 2 seconds = 50 requests per second
                        'order/test': 1, // 100 requests in 2 seconds = 50 requests per second
                        'batchOrders': 2, // 50 requests in 2 seconds = 25 requests per second
                        'cancel': 1, // 100 requests in 2 seconds = 50 requests per second
                        'batchCancel': 2, // 50 requests in 2 seconds = 25 requests per second
                        'margin/order': 1, // 100 requests in 2 seconds = 50 requests per second
                        'margin/cancel': 1, // 100 requests in 2 seconds = 50 requests per second
                    },
                },
                'futuresPublic': {
                    'get': {
                        'ping': 1, // not documented
                        'time': 1, // not documented
                        'contracts': 1, // not documented
                        'depth': 1, // not documented
                        'ticker': 1, // not documented
                        'index': 1, // not documented
                        'klines': 1, // not documented
                    },
                },
                'futuresPrivate': {
                    'get': {
                        'account': 5, // 20 requrests in 2 seconds = 10 requests per second
                        'order': 1, // not documented
                        'openOrders': 1, // not documented
                        'myTrades': 5, // 20 requrests in 2 seconds = 10 requests per second
                    },
                    'post': {
                        'order': 1, // not documented
                        'conditionOrder': 1, // not documented
                        'cancel': 5, // 20 requrests in 2 seconds = 10 requests per second
                        'orderHistorical': 1, // not documented
                        'profitHistorical': 1, // not documented
                    },
                },
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'maker': this.parseNumber ('0.001'),
                    'taker': this.parseNumber ('0.001'),
                    'tiers': {
                        'taker': [
                            [ this.parseNumber ('0'), this.parseNumber ('0.001') ],
                            [ this.parseNumber ('100000'), this.parseNumber ('0.0008') ],
                            [ this.parseNumber ('250000'), this.parseNumber ('0.0006') ],
                            [ this.parseNumber ('500000'), this.parseNumber ('0.0005') ],
                            [ this.parseNumber ('1000000'), this.parseNumber ('0.0003') ],
                        ],
                        'maker': [
                            [ this.parseNumber ('0'), this.parseNumber ('0.001') ],
                            [ this.parseNumber ('100000'), this.parseNumber ('0.0008') ],
                            [ this.parseNumber ('250000'), this.parseNumber ('0.0006') ],
                            [ this.parseNumber ('500000'), this.parseNumber ('0.0005') ],
                            [ this.parseNumber ('1000000'), this.parseNumber ('0.0003') ],
                        ],
                    },
                },
                'future': {
                    'trading': {
                        'tierBased': false,
                        'percentage': true,
                        'taker': this.parseNumber ('0.00075'),
                        'maker': this.parseNumber ('0.00025'),
                    },
                },
                'funding': {
                    'tierBased': false,
                    'percentage': false,
                    'withdraw': {},
                    'deposit': {},
                },
            },
            'exceptions': {
                'exact': {
                    '-1000': ExchangeNotAvailable, // {"code":-1000,"msg":"An unknown error occured while processing the request."}
                    '-1001': ExchangeNotAvailable, // {"code":-1001,"msg":"Internal error; unable to process your request. Please try again."}
                    '-1002': AuthenticationError, // {"code":-1002,"msg":"You are not authorized to execute this request. Request need API Key included in. We suggest that API Key be included in any request."}
                    '-1003': RateLimitExceeded, // {"code":-1003,"msg":"Requests exceed the limit too frequently."}
                    '-1004': PermissionDenied, // {"code":-1004,"msg":"You are not authorized to execute this request. User not exit Company"}
                    '-1006': BadResponse, // {"code":-1006,"msg":"An unexpected response was received from the message bus. Execution status unknown. OPEN API server find some exception in execute request .Please report to Customer service."}
                    '-1007': RequestTimeout, // {"code":-1007,"msg":"Timeout waiting for response from backend server. Send status unknown; execution status unknown."}
                    '-1014': InvalidOrder, // {"code":-1014,"msg":"Unsupported order combination."}
                    '-1015': RateLimitExceeded, // {"code":-1015,"msg":"Too many new orders."}
                    '-1016': ExchangeNotAvailable, // {"code":-1016,"msg":"This service is no longer available."}
                    '-1017': BadRequest, // {"code":-1017,"msg":"We recommend attaching Content-Type to all request headers and setting it to application/json."}
                    '-1020': BadRequest, // {"code":-1020,"msg":"This operation is not supported."}
                    '-1021': InvalidNonce, // {"code":-1021,"msg":"Invalid timestamp, time offset too large"}
                    '-1022': AuthenticationError, // {"code":-1022,"msg":"Signature for this request is not valid."}
                    '-1023': AuthenticationError, // {"code":-1023,"msg":"You are not authorized to execute this request, we recommend that you add X-CH-TS to all request headers."}
                    '-1024': AuthenticationError, // {"code":-1024,"msg":"You are not authorized to execute this request, we recommend that you add X-CH-SIGN to the request header."}
                    '-1100': BadRequest, // {"code":-1100,"msg":"Illegal characters found in a parameter."}
                    '-1101': BadRequest, // {"code":-1101,"msg":"Too many parameters sent for this endpoint."}
                    '-1102': BadRequest, // {"code":-1102,"msg":"Param '%s' or '%s' must be sent, but both were empty/null!"}
                    '-1103': BadRequest, // {"code":-1103,"msg":"An unknown parameter was sent."}
                    '-1104': BadRequest, // {"code":-1104,"msg":"Not all sent parameters were read."}
                    '-1105': BadRequest, // {"code":-1105,"msg":"Parameter %s was empty."}
                    '-1106': BadRequest, // {"code":-1106,"msg":"Parameter %s sent when not required."}
                    '-1111': BadRequest, // {"code":-1111,"msg":"Precision is over the maximum defined for this asset."}
                    '-1112': InvalidOrder, // {"code":-1112,"msg":"No orders on book for symbol."}
                    '-1116': InvalidOrder, // {"code":-1116,"msg":"Invalid orderType."}
                    '-1117': InvalidOrder, // {"code":-1117,"msg":"Invalid side."}
                    '-1118': InvalidOrder, // {"code":-1118,"msg":"New client order ID was empty."}
                    '-1121': BadSymbol, // {"code":-1121,"msg":"Invalid symbol."}
                    '-1136': InvalidOrder, // {"code":-1136,"msg":"Order volume lower than the minimum."}
                    '-1138': InvalidOrder, // {"code":-1138,"msg":"Order price exceeds permissible range."}
                    '-1139': ExchangeNotAvailable, // {"code":-1139,"msg":"This trading pair does not support market trading."}
                    '-1145': BadRequest, // {"code":-1145,"msg":"Invalid newOrderRespType"}
                    '-1160': AccountSuspended, // {"code":-1160,"msg":"This account is frozen for trading"}
                    '-2013': OrderNotFound, // {"code":-2013,"msg":"Order does not exist."}
                    '-2015': AuthenticationError, // {"code":-2015,"msg":"Invalid API-key, IP, or permissions for action."}
                    '-2016': ExchangeError, // {"code":-2016,"msg":"Transaction is frozen"}
                    '-2017': InsufficientFunds, // {"code":-2017,"msg":"Insufficient balance"}
                },
                'broad': {},
            },
            'options': {
                'defaultType': 'spot', // 'spot', 'margin', 'future'
                'recvWindow': 5 * 1000, // 5 sec, scallop default
            },
        });
    }

    async fetchTime (params = {}) {
        /**
         * @method
         * @name scallop#fetchTime
         * @description fetches the current integer timestamp in milliseconds from the exchange server
         * @param {dict} params extra parameters specific to the scallop api endpoint
         * @returns {int} the current integer timestamp in milliseconds from the exchange server
         */
        const [ marketType, query ] = this.handleMarketTypeAndParams ('fetchTime', undefined, params);
        const method = this.getSupportedMapping (marketType, {
            'spot': 'publicGetTime',
            'future': 'futuresPublicGetTime',
        });
        const response = await this[method] (query);
        //
        // { serverTime: 1657460082691, timezone: 'GMT+08:00' }
        //
        return this.safeInteger (response, 'serverTime');
    }

    async fetchStatus (params = {}) {
        /**
         * @method
         * @name scallop#fetchStatus
         * @description the latest known information on the availability of the exchange API
         * @param {dict} params extra parameters specific to the scallop api endpoint
         * @returns {dict} a [status structure]{@link https://docs.ccxt.com/en/latest/manual.html#exchange-status-structure}
         */
        const response = await this.publicGetPing (params);
        //
        // empty means working status.
        //
        //     {}
        //
        const keys = Object.keys (response);
        const keysLength = keys.length;
        const formattedStatus = keysLength ? 'maintenance' : 'ok';
        return {
            'status': formattedStatus,
            'updated': undefined,
            'eta': undefined,
            'url': undefined,
            'info': response,
        };
    }

    async fetchSpotMarkets (params = {}) {
        const response = await this.publicGetSymbols (params);
        //
        // spot
        //
        //     {
        //         "symbols": [
        //             {
        //                 "quantityPrecision": 6,
        //                 "symbol": "btcusdt",
        //                 "pricePrecision": 2,
        //                 "baseAsset": "BTC",
        //                 "quoteAsset": "USDT"
        //             },
        //         ]
        //     }
        //
        let markets = [];
        markets = this.safeValue (response, 'symbols', []);
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeStringUpper (market, 'symbol');
            const baseId = this.safeString (market, 'baseAsset');
            const quoteId = this.safeString (market, 'quoteAsset');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const status = this.safeInteger (market, 'status', 1);
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'settle': undefined,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': undefined,
                'type': 'spot',
                'spot': true,
                'margin': undefined,
                'swap': undefined,
                'future': false,
                'option': false,
                'active': status ? true : false,
                'contract': false,
                'linear': undefined,
                'inverse': undefined,
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': this.safeInteger (market, 'quantityPrecision'),
                    'price': this.safeInteger (market, 'pricePrecision'),
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

    async fetchFutureMarkets (params = {}) {
        const response = await this.futuresPublicGetContracts (params);
        //
        // futures
        //
        //     [
        //         {
        //              symbol: 'E-BTC-USDT',
        //              pricePrecision: 1,
        //              side: 1,
        //              maxMarketVolume: 5000000,
        //              multiplier: 0.0001,
        //              minOrderVolume: 1,
        //              maxMarketMoney: 5000000,
        //              type: 'E',
        //              maxLimitVolume: 20000000,
        //              maxValidOrder: 20,
        //              multiplierCoin: 'BTC',
        //              minOrderMoney: 11,
        //              maxLimitMoney: 20000000,
        //              status: 1
        //         },
        //         {
        //              symbol: 'S-BTC-USDT',
        //              pricePrecision: 1,
        //              side: 1,
        //              maxMarketVolume: 5000000,
        //              multiplier: 0.0001,
        //              minOrderVolume: 1,
        //              maxMarketMoney: 5000000,
        //              type: 'S',
        //              maxLimitVolume: 20000000,
        //              maxValidOrder: 20,
        //              multiplierCoin: 'BTC',
        //              minOrderMoney: 11,
        //              maxLimitMoney: 20000000,
        //              status: 1
        //          },
        //     ]
        //
        const markets = response;
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeStringUpper (market, 'symbol');
            let baseId = undefined;
            let quoteId = undefined;
            // eslint-disable-next-line no-unused-vars
            const [ contractType, baseAsset, quoteAsset ] = id.split ('-');
            baseId = baseAsset;
            quoteId = quoteAsset;
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            let symbol = undefined;
            if (contractType === 'E') {
                const settle = 'USDT';
                symbol = base + '/' + quote + ':' + settle;
            } else {
                symbol = id;
            }
            const status = this.safeInteger (market, 'status', 1);
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'settle': undefined,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': undefined,
                'type': 'future',
                'spot': false,
                'margin': undefined,
                'swap': true,
                'future': true,
                'option': false,
                'active': status ? true : false,
                'contract': true,
                'linear': undefined,
                'inverse': undefined,
                'contractSize': this.safeNumber (market, 'multiplier'),
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': undefined,
                    'price': this.safeInteger (market, 'pricePrecision'),
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': {
                        'min': this.safeNumber (market, 'minOrderVolume'),
                        'max': this.safeNumber (market, 'maxLimitVolume'),
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'cost': {
                        'min': this.safeNumber (market, 'minOrderMoney'),
                        'max': this.safeNumber (market, 'maxLimitMoney'),
                    },
                },
                'info': market,
            });
        }
        return result;
    }

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name scallop#fetchMarkets
         * @description retrieves data on all markets for binance
         * @param {dict} params extra parameters specific to the scallop api endpoint
         * @returns {[dict]} an array of objects representing market data
         */
        const marketType = this.safeString (params, 'type');
        const query = this.omit (params, 'type');
        const isSpot = marketType === 'spot';
        const isFuture = marketType === 'future';
        if ((marketType !== undefined) && (!isSpot) && (!isFuture)) {
            throw new ExchangeError (this.id + " fetchMarkets() does not support '" + marketType + "' type, set exchange.options['defaultType'] to 'spot' or 'future'"); // eslint-disable-line quotes
        }
        let result = [];
        if (marketType === undefined) {
            const spotMarkets = await this.fetchSpotMarkets (query);
            const futureMarkets = await this.fetchFutureMarkets (query);
            result = this.arrayConcat (spotMarkets, futureMarkets);
        } else if (isSpot) {
            result = await this.fetchSpotMarkets (query);
        } else if (isFuture) {
            result = await this.fetchFutureMarkets (query);
        }
        return result;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name scallop#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {str} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {dict} params extra parameters specific to the scallop api endpoint
         * @returns {dict} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const [ marketType, query ] = this.handleMarketTypeAndParams ('fetchOrderBook', market, params);
        const isSpot = marketType === 'spot';
        const isFuture = marketType === 'future';
        if ((!isSpot) && (!isFuture)) {
            throw new ExchangeError (this.id + " fetchOrderBook() does not support '" + marketType + "' type, set exchange.options['defaultType'] to 'spot' or 'future'"); // eslint-disable-line quotes
        }
        const request = {};
        if (isSpot) {
            request['symbol'] = market['id'];
        } else if (isFuture) {
            request['contractName'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 100, max 100
        }
        const method = this.getSupportedMapping (marketType, {
            'spot': 'publicGetDepth',
            'future': 'futuresPublicGetDepth',
        });
        const response = await this[method] (this.extend (request, query));
        //
        //     {
        //          asks: [
        //              [ 30254, 0.2 ],
        //              [ 30255.2, 0.28135 ],
        //              [ 30257.02, 1 ],
        //              [ 30259.06, 1 ],
        //              [ 30261.25, 0.264605 ]
        //          ],
        //          bids: [
        //              [ 30248, 0.587945 ],
        //              [ 30246.8, 0.565675 ],
        //              [ 30244.98, 0.491045 ],
        //              [ 30242.94, 1.47951 ],
        //              [ 30240.75, 1.444575 ]
        //          ],
        //          time: null
        //     }
        //
        const timestamp = this.safeTimestamp (response, 'time');
        return this.parseOrderBook (response, symbol, timestamp);
    }

    async fetchTicker (symbol, params = {}) {
        /**
         * @method
         * @name scallop#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {str} symbol unified symbol of the market to fetch the ticker for
         * @param {dict} params extra parameters specific to the scallop api endpoint
         * @returns {dict} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const [ marketType, query ] = this.handleMarketTypeAndParams ('fetchTicker', market, params);
        const isSpot = marketType === 'spot';
        const isFuture = marketType === 'future';
        if ((!isSpot) && (!isFuture)) {
            throw new ExchangeError (this.id + " fetchTicker() does not support '" + marketType + "' type, set exchange.options['defaultType'] to 'spot' or 'future'"); // eslint-disable-line quotes
        }
        const request = {};
        if (isSpot) {
            request['symbol'] = market['id'];
        } else if (isFuture) {
            request['contractName'] = market['id'];
        }
        const method = this.getSupportedMapping (marketType, {
            'spot': 'publicGetTicker',
            'future': 'futuresPublicGetTicker',
        });
        const response = await this[method] (this.extend (request, query));
        //
        //     {
        //         high: '21966.95',
        //         vol: '895.077854',
        //         last: '20924.53',
        //         low: '20843.42',
        //         buy: 20920.6,
        //         sell: 20930.4,
        //         rose: '-0.02908811',
        //         time: 1657465710000,
        //         open: '21551.42'
        //     }
        //
        return this.parseTicker (response, market);
    }

    parseTicker (ticker, market = undefined) {
        //
        // fetchTicker
        //
        //     {
        //          "high": "0.121032",
        //          "vol": "747275.3289",
        //          "last": "0.120181",
        //          "low": "0.111899",
        //          "buy": 0.1196,
        //          "sell": 0.12064,
        //          "rose": "0.05228089",
        //          "time": 1652790345000,
        //          "open": "0.11421"
        //     }
        //
        const symbol = this.safeSymbol (undefined, market);
        const timestamp = this.safeInteger (ticker, 'time');
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

    parseTrade (trade, market = undefined) {
        //
        // fetchTrades (public)
        //
        //    {
        //        symbol: 'BTCUSDT',
        //        side: 'SELL',
        //        price: '20784.47',
        //        qty: '0.023372',
        //        id: 1452078,
        //        time: 1657494111899
        //    }
        //
        // fetchMyTrades (private)
        //
        //     {
        //         symbol: 'TRXUSDT',
        //         side: 'SELL',
        //         fee: '0.000333105',
        //         isMaker: false,
        //         isBuyer: false,
        //         bidId: 1196380028155234000,
        //         bidUserId: 4204416,
        //         feeCoin: 'USDT',
        //         price: '0.066621',
        //         qty: '5',
        //         askId: 1196379976615594000,
        //         id: 44111327,
        //         time: 1657508641314,
        //         isSelf: false,
        //         askUserId: 24010641
        //     },
        //     {
        //         symbol: 'TRXUSDT',
        //         side: 'BUY',
        //         fee: '0.0233688388280092',
        //         isMaker: true,
        //         isBuyer: true,
        //         bidId: 1153934584354370300,
        //         bidUserId: 24010641,
        //         feeCoin: 'SCLP',
        //         price: '0.062667',
        //         qty: '562.6',
        //         askId: 1153937092615243300,
        //         id: 43648429,
        //         time: 1655110706725,
        //         isSelf: false,
        //         askUserId: 4204416
        //     }
        //
        const id = this.safeString (trade, 'id');
        const side = this.safeStringLower (trade, 'side');
        let orderId = undefined;
        if (side === 'buy') {
            orderId = this.safeString (trade, 'bidId');
        } else if (side === 'sell') {
            orderId = this.safeString (trade, 'askId');
        }
        const timestamp = this.safeInteger (trade, 'time');
        const priceString = this.safeString (trade, 'price');
        const amountString = this.safeString (trade, 'qty');
        const marketId = this.safeString (trade, 'symbol');
        const symbol = this.safeSymbol (marketId, market);
        const isMaker = this.safeValue (trade, 'isMaker');
        let takerOrMaker = undefined;
        if (isMaker !== undefined) {
            takerOrMaker = isMaker ? 'maker' : 'taker';
        }
        const feeCostString = this.safeString (trade, 'fee');
        let fee = undefined;
        if (feeCostString !== undefined) {
            const feeCurrencyId = this.safeString (trade, 'feeCoin');
            const feeCurrencyCode = this.safeCurrencyCode (feeCurrencyId);
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
            'symbol': symbol,
            'type': undefined,
            'order': orderId,
            'side': side,
            'price': priceString,
            'amount': amountString,
            'cost': undefined,
            'takerOrMaker': takerOrMaker,
            'fee': fee,
        }, market);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name scallop#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {str} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {dict} params extra parameters specific to the scallop api endpoint
         * @returns {[dict]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const [ marketType, query ] = this.handleMarketTypeAndParams ('fetchTrades', market, params);
        const isSpot = marketType === 'spot';
        if ((!isSpot)) {
            throw new ExchangeError (this.id + " fetchTrades() does not support '" + marketType + "' type, set exchange.options['defaultType'] to 'spot'"); // eslint-disable-line quotes
        }
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit; // default 100, max 1000
        }
        const response = await this.publicGetTrades (this.extend (request, query));
        //     {
        //         list: [
        //             {
        //                 symbol: 'BTCUSD',
        //                 side: 'BUY',
        //                 price: '20829.59',
        //                 qty: '0.047745',
        //                 id: 1451985,
        //                 time: 1657493647544
        //             },
        //             {
        //                 symbol: 'BTCUSD',
        //                 side: 'SELL',
        //                 price: '20826.48',
        //                 qty: '0.06678',
        //                 id: 1451984,
        //                 time: 1657493643440
        //             },
        //         ]
        //     }
        const data = this.safeValue (response, 'list', []);
        return this.parseTrades (data, market, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        // spot, future
        //
        //     {
        //         "high": "6228.77",
        //         "vol": "111",
        //         "low": "6228.77",
        //         "idx": "1657710000000",
        //         "close": "6228.77",
        //         "open": "6228.77"
        //     },
        //
        return [
            this.safeInteger (ohlcv, 'idx'),
            this.safeNumber (ohlcv, 'open'),
            this.safeNumber (ohlcv, 'high'),
            this.safeNumber (ohlcv, 'low'),
            this.safeNumber (ohlcv, 'close'),
            this.safeNumber (ohlcv, 'vol'),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name scallop#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {str} symbol unified symbol of the market to fetch OHLCV data for
         * @param {str} timeframe the length of time each candle represents
         * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
         * @param {int|undefined} limit the maximum amount of candles to fetch
         * @param {dict} params extra parameters specific to the scallop api endpoint
         * @returns {[[int]]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const [ marketType, query ] = this.handleMarketTypeAndParams ('fetchOHLCV', market, params);
        const isSpot = marketType === 'spot';
        const isFuture = marketType === 'future';
        if ((!isSpot) && (!isFuture)) {
            throw new ExchangeError (this.id + " fetchOHLCV() does not support '" + marketType + "' type, set exchange.options['defaultType'] to 'spot' or 'future'"); // eslint-disable-line quotes
        }
        const request = {
            'interval': this.timeframes[timeframe],
        };
        if (isSpot) {
            request['symbol'] = market['id'];
        } else if (isFuture) {
            request['contractName'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 100; Max 300
        }
        const method = this.getSupportedMapping (marketType, {
            'spot': 'publicGetKlines',
            'future': 'futuresPublicGetKlines',
        });
        const response = await this[method] (this.extend (request, query));
        //
        //     [
        //         {
        //             "high": "6228.77",
        //             "vol": "111",
        //             "low": "6228.77",
        //             "idx": "1657710000000",
        //             "close": "6228.77",
        //             "open": "6228.77"
        //         },
        //         {
        //             "high": "6228.77",
        //             "vol": "222",
        //             "low": "6228.77",
        //             "idx": "1657709940000",
        //             "close": "6228.77",
        //             "open": "6228.77"
        //         }
        //     ]
        //
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    parseBalance (balances) {
        //
        // spot
        //
        //     [
        //         { asset: 'BTC', free: '0.0000000000', locked: '0.0000000000' }
        //     ]
        //
        // futures
        //
        //     [
        //         {
        //             "marginCoin": "USDT",
        //             "accountNormal": 999.5606,
        //             "accountLock": 23799.5017,
        //             "partPositionNormal": 9110.7294,
        //             "totalPositionNormal": 0,
        //             "achievedAmount": 4156.5072,
        //             "unrealizedAmount": 650.6385,
        //             "totalMarginRate": 0,
        //             "totalEquity": 99964804.560,
        //             "partEquity": 13917.8753,
        //             "totalCost": 0,
        //             "sumMarginRate": 873.4608,
        //             "positionVos": [
        //                 {
        //                     "contractId": 1,
        //                     "contractName": "E-BTC-USDT",
        //                     "contractSymbol": "BTC-USDT",
        //                     "positions": [
        //                         {
        //                             "id": 13603,
        //                             "uid": 10023,
        //                             "contractId": 1,
        //                             "positionType": 2,
        //                             "side": "BUY",
        //                             "volume": 69642.0,
        //                             "openPrice": 11840.2394,
        //                             "avgPrice": 11840.3095,
        //                             "closePrice": 12155.3005,
        //                             "leverageLevel": 24,
        //                             "holdAmount": 7014.2111,
        //                             "closeVolume": 40502.0,
        //                             "pendingCloseVolume": 0,
        //                             "realizedAmount": 8115.9125,
        //                             "historyRealizedAmount": 1865.3985,
        //                             "tradeFee": -432.0072,
        //                             "capitalFee": 2891.2281,
        //                             "closeProfit": 8117.6903,
        //                             "shareAmount": 0.1112,
        //                             "freezeLock": 0,
        //                             "status": 1,
        //                             "ctime": "2020-12-11T17:42:10",
        //                             "mtime": "2020-12-18T20:35:43",
        //                             "brokerId": 21,
        //                             "marginRate": 0.2097,
        //                             "reducePrice": 9740.8083,
        //                             "returnRate": 0.3086,
        //                             "unRealizedAmount": 2164.5289,
        //                             "openRealizedAmount": 2165.0173,
        //                             "positionBalance": 82458.2839,
        //                             "settleProfit": 0.4883,
        //                             "indexPrice": 12151.1175,
        //                             "keepRate": 0.005,
        //                             "maxFeeRate": 0.0025
        //                         }
        //                     ]
        //                 }
        //             ]
        //         }
        //     ]
        // //
        const result = {
            'info': balances,
        };
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const currencyId = this.safeString2 (balance, 'asset', 'marginCoin');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['used'] = this.safeString2 (balance, 'locked', 'accountLock');
            account['free'] = this.safeString2 (balance, 'free', 'accountNormal');
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    async fetchBalance (params = {}) {
        /**
         * @method
         * @name scallop#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {dict} params extra parameters specific to the scallop api endpoint
         * @returns {dict} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.loadMarkets ();
        const [ marketType, query ] = this.handleMarketTypeAndParams ('fetchBalance', undefined, params);
        const isSpot = marketType === 'spot';
        const isFuture = marketType === 'future';
        if ((!isSpot) && (!isFuture)) {
            throw new ExchangeError (this.id + " fetchBalance() does not support '" + marketType + "' type, set exchange.options['defaultType'] to 'spot' or 'future'"); // eslint-disable-line quotes
        }
        const method = this.getSupportedMapping (marketType, {
            'spot': 'privateGetAccount',
            'future': 'futuresPrivateGetAccount',
        });
        const response = await this[method] (query);
        //
        // spot
        //
        //     {
        //         balances: [
        //             { asset: 'BTC', free: '0.0000000000', locked: '0.0000000000' },
        //         ]
        //     }
        //
        // futures
        //
        //     {
        //         "account": [
        //             {
        //                 "marginCoin": "USDT",
        //                 "accountNormal": 999.5606,
        //                 "accountLock": 23799.5017,
        //                 "partPositionNormal": 9110.7294,
        //                 "totalPositionNormal": 0,
        //                 "achievedAmount": 4156.5072,
        //                 "unrealizedAmount": 650.6385,
        //                 "totalMarginRate": 0,
        //                 "totalEquity": 99964804.560,
        //                 "partEquity": 13917.8753,
        //                 "totalCost": 0,
        //                 "sumMarginRate": 873.4608,
        //                 "positionVos": [
        //                     {
        //                         "contractId": 1,
        //                         "contractName": "E-BTC-USDT",
        //                         "contractSymbol": "BTC-USDT",
        //                         "positions": [
        //                             {
        //                                 "id": 13603,
        //                                 "uid": 10023,
        //                                 "contractId": 1,
        //                                 "positionType": 2,
        //                                 "side": "BUY",
        //                                 "volume": 69642.0,
        //                                 "openPrice": 11840.2394,
        //                                 "avgPrice": 11840.3095,
        //                                 "closePrice": 12155.3005,
        //                                 "leverageLevel": 24,
        //                                 "holdAmount": 7014.2111,
        //                                 "closeVolume": 40502.0,
        //                                 "pendingCloseVolume": 0,
        //                                 "realizedAmount": 8115.9125,
        //                                 "historyRealizedAmount": 1865.3985,
        //                                 "tradeFee": -432.0072,
        //                                 "capitalFee": 2891.2281,
        //                                 "closeProfit": 8117.6903,
        //                                 "shareAmount": 0.1112,
        //                                 "freezeLock": 0,
        //                                 "status": 1,
        //                                 "ctime": "2020-12-11T17:42:10",
        //                                 "mtime": "2020-12-18T20:35:43",
        //                                 "brokerId": 21,
        //                                 "marginRate": 0.2097,
        //                                 "reducePrice": 9740.8083,
        //                                 "returnRate": 0.3086,
        //                                 "unRealizedAmount": 2164.5289,
        //                                 "openRealizedAmount": 2165.0173,
        //                                 "positionBalance": 82458.2839,
        //                                 "settleProfit": 0.4883,
        //                                 "indexPrice": 12151.1175,
        //                                 "keepRate": 0.005,
        //                                 "maxFeeRate": 0.0025
        //                             }
        //                         ]
        //                     }
        //                 ]
        //             }
        //         ]
        //     }
        //
        const balances = this.safeValue2 (response, 'balances', 'account', []);
        return this.parseBalance (balances);
    }

    parseOrderStatus (status) {
        const statuses = {
            'NEW': 'open',
            'PARTIALLY_FILLED': 'open',
            'FILLED': 'closed',
            'CANCELED': 'canceled',
            'REJECTED': 'rejected',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        //
        // spot/margin createOrder, fetchOrder, fetchOpenOrders
        //     {
        //         'symbol': 'LXTUSDT',
        //         'orderId': '150695552109032492',
        //         'clientOrderId': '157371322565051',
        //         'transactTime': '1573713225668',
        //         'price': '0.005452',
        //         'origQty': '110',
        //         'executedQty': '0',
        //         'status': 'NEW',
        //         'type': 'LIMIT',
        //         'side': 'SELL'
        //     }
        //
        // spot/margin cancelOrder
        //
        //     {
        //         'symbol': 'BHTUSDT',
        //         'clientOrderId': '0',
        //         'orderId': '499890200602846976',
        //         'status': 'CANCELED'
        //     }
        //
        // future createOrder, cancelOrder
        //
        //     {
        //         "orderId": 256609229205684228
        //     }
        //
        // future fetchOrder, fetchOpenOrders
        //
        //     {
        //         "side": "BUY",
        //         "executedQty": 0,
        //         "orderId": 259396989397942275,
        //         "price": 10000.0000000000000000,
        //         "origQty": 1.0000000000000000,
        //         "avgPrice": 0E-8,
        //         "transactTime": "1607702400000",
        //         "action": "OPEN",
        //         "contractName": "E-BTC-USDT",
        //         "type": "LIMIT",
        //         "status": "NEW"
        //     }
        //
        //
        const id = this.safeString (order, 'orderId');
        const clientOrderId = this.safeString (order, 'clientOrderId');
        const timestamp = this.safeInteger (order, 'transactTime');
        const marketId = this.safeString2 (order, 'symbol', 'contractName');
        const symbol = this.safeSymbol (marketId, market);
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const amount = this.safeString (order, 'origQty');
        const filled = this.safeString (order, 'executedQty');
        const average = this.safeString2 (order, 'avgPrice');
        const type = this.safeStringLower (order, 'type');
        const side = this.safeStringLower (order, 'side');
        const price = this.safeString (order, 'price');
        return this.safeOrder ({
            'id': id,
            'clientOrderId': clientOrderId,
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
            'stopPrice': undefined,
            'amount': amount,
            'cost': undefined,
            'average': average,
            'filled': filled,
            'remaining': undefined,
            'status': status,
            'fee': undefined,
            'trades': undefined,
        }, market);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name scallop#createOrder
         * @description create a trade order
         * @param {str} symbol unified symbol of the market to create an order in
         * @param {str} type 'market' or 'limit'
         * @param {str} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float|undefined} price the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {dict} params extra parameters specific to the scallop api endpoint
         * @returns {dict} an [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const [ marketType, query ] = this.handleMarketTypeAndParams ('createOrder', market, params);
        let clientOrderId = this.safeString2 (params, 'newClientOrderId', 'clientOrderId');
        if (clientOrderId === undefined) {
            clientOrderId = this.uuid22 ();
        }
        const isSpot = (marketType === 'spot');
        const isMargin = (marketType === 'margin');
        const isFuture = (marketType === 'future');
        const isLimitOrder = (type === 'limit');
        const request = {
            'volume': this.amountToPrecision (symbol, amount),
            'side': side.toUpperCase (),
            'type': type.toUpperCase (),
        };
        if (isLimitOrder) {
            if (price === undefined) {
                throw new ArgumentsRequired (this.id + ' createOrder () requires a price argument for ' + type + ' orders');
            }
            request['price'] = this.priceToPrecision (symbol, price);
        }
        let method = this.getSupportedMapping (marketType, {
            'spot': 'privatePostOrder',
            'margin': 'privatePostMarginOrder',
            'future': 'futuresPrivatePostOrder',
        });
        if (isSpot || isMargin) {
            const recvWindow = this.safeInteger (params, 'recvWindow');
            request['symbol'] = market['id'];
            request['newClientOrderId'] = clientOrderId;
            request['recvWindow'] = recvWindow;
        } else if (isFuture) {
            const triggerPrice = this.safeValue (params, 'triggerPrice');
            const timeInForce = this.safeString (params, 'timeInForce');
            request['contractName'] = market['id'];
            request['open'] = this.safeStringUpper (params, 'open');
            request['positionType'] = this.safeNumber (params, 'positionType');
            if (timeInForce !== undefined) {
                request['timeInForce'] = timeInForce;
                request['clientOrderId'] = clientOrderId;
            }
            if (triggerPrice !== undefined) {
                request['triggerPrice'] = this.priceToPrecision (symbol, triggerPrice);
                request['triggerType'] = this.safeString (params, 'triggerType');
                method = 'futuresPrivatePostConditionOrder';
            }
        }
        const omitted = this.omit (query, [ 'newClientOrderId', 'clientOrderId', 'recvWindow', 'open', 'positionType', 'triggerPrice', 'triggerType', 'timeInForce' ]);
        const response = await this[method] (this.extend (request, omitted));
        //
        // spot/margin
        //     {
        //         'symbol': 'LXTUSDT',
        //         'orderId': '150695552109032492',
        //         'clientOrderId': '157371322565051',
        //         'transactTime': '1573713225668',
        //         'price': '0.005452',
        //         'origQty': '110',
        //         'executedQty': '0',
        //         'status': 'NEW',
        //         'type': 'LIMIT',
        //         'side': 'SELL'
        //     }
        //
        // future
        //
        //     {
        //         "orderId": 256609229205684228
        //     }
        //
        return this.parseOrder (response, market);
    }

    async createOrders (symbol, orders, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const [ marketType, query ] = this.handleMarketTypeAndParams ('createOrders', market, params);
        const isSpot = marketType === 'spot';
        if ((!isSpot)) {
            throw new ExchangeError (this.id + " createOrders() does not support '" + marketType + "' type, set exchange.options['defaultType'] to 'spot'"); // eslint-disable-line quotes
        }
        const request = {
            'symbol': market['id'],
            'orders': orders,
        };
        // orders: [{"side":"BUY", "volume":20.1, "price":1001, "batchType":"LIMIT"}, {"side":"SELL", "volume":20.1, "price":1001, "batchType":"MARKET"}]
        const response = await this.privatePostBatchOrders (this.extend (request, query));
        const data = this.safeValue (response, 'ids', []);
        const newOrders = [];
        for (let i = 0; i < data.length; i++) {
            const id = data[i];
            const order = {
                'orderId': id,
            };
            newOrders.push (this.parseOrder (order, market));
        }
        return newOrders;
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name scallop#cancelOrder
         * @description cancels an open order
         * @param {str} id order id
         * @param {str} symbol unified symbol of the market the order was made in
         * @param {dict} params extra parameters specific to the scallop api endpoint
         * @returns {dict} An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a symbol argument for spot orders');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const [ marketType, query ] = this.handleMarketTypeAndParams ('cancelOrder', market, params);
        const clientOrderId = this.safeString2 (params, 'newClientOrderId', 'clientOrderId');
        const isSpot = (marketType === 'spot');
        const isMargin = (marketType === 'margin');
        const isFuture = (marketType === 'future');
        const request = {
            'orderId': id,
        };
        if (isSpot || isMargin) {
            request['symbol'] = market['id'];
            if (clientOrderId !== undefined) {
                request['newClientOrderId'] = clientOrderId;
            }
        } else if (isFuture) {
            request['contractName'] = market['id'];
        }
        const method = this.getSupportedMapping (marketType, {
            'spot': 'privatePostCancel',
            'margin': 'privatePostMarginCancel',
            'future': 'futuresPrivatePostCancel',
        });
        const omitted = this.omit (query, [ 'newClientOrderId', 'clientOrderId' ]);
        const response = await this[method] (this.extend (request, omitted));
        //
        // spot, margin, future
        //
        //     {
        //         "orderId": 256609229205684228
        //     }
        //
        return this.parseOrder (response, market);
    }

    async cancelOrders (ids, symbol, params = {}) {
        /**
         * @method
         * @name scallop#cancelOrders
         * @description cancel multiple orders
         * @param {[str]} ids order ids
         * @param {str|undefined} symbol unified market symbol
         * @param {dict} params extra parameters specific to the scallop api endpoint
         * @returns {dict} an list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const [ marketType, query ] = this.handleMarketTypeAndParams ('cancelOrders', market, params);
        const isSpot = marketType === 'spot';
        if ((!isSpot)) {
            throw new ExchangeError (this.id + " cancelOrders() does not support '" + marketType + "' type, set exchange.options['defaultType'] to 'spot'"); // eslint-disable-line quotes
        }
        const request = {
            'symbol': market['id'],
            'orderIds': ids,
        };
        const response = await this.privatePostBatchCancel (this.extend (request, query));
        const data = this.safeValue (response, 'success', []);
        const canceledOrders = [];
        for (let i = 0; i < data.length; i++) {
            const id = data[i];
            const order = {
                'orderId': id,
            };
            canceledOrders.push (this.parseOrder (order, market));
        }
        return canceledOrders;
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name scallop#fetchOrder
         * @description fetches information on an order made by the user
         * @param {str} symbol unified symbol of the market the order was made in
         * @param {dict} params extra parameters specific to the scallop api endpoint
         * @returns {dict} An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder() requires a symbol argument for spot orders');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const [ marketType, query ] = this.handleMarketTypeAndParams ('fetchOrder', market, params);
        const clientOrderId = this.safeString2 (params, 'newClientOrderId', 'clientOrderId');
        const isSpot = (marketType === 'spot');
        const isMargin = (marketType === 'margin');
        const isFuture = (marketType === 'future');
        const request = {};
        if (isSpot || isMargin) {
            request['orderId'] = id;
            request['symbol'] = market['id'];
            if (clientOrderId !== undefined) {
                request['newClientOrderId'] = clientOrderId;
            }
        } else if (isFuture) {
            request['contractName'] = market['id'];
        }
        const method = this.getSupportedMapping (marketType, {
            'spot': 'privateGetOrder',
            'margin': 'privateGetMarginOrder',
            'future': 'futuresPrivateGetOrder',
        });
        const omitted = this.omit (query, [ 'newClientOrderId', 'clientOrderId' ]);
        const response = await this[method] (this.extend (request, omitted));
        //
        // spot/margin
        //     {
        //         'orderId': '499890200602846976',
        //         'clientOrderId': '157432755564968',
        //         'symbol': 'BHTUSDT',
        //         'price': '0.01',
        //         'origQty': '50',
        //         'executedQty': '0',
        //         'avgPrice': '0',
        //         'status': 'NEW',
        //         'type': 'LIMIT',
        //         'side': 'BUY',
        //         'transactTime': '1574327555669'
        //     }
        //
        return this.parseOrder (response, market);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name scallop#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @param {str} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch open orders for
         * @param {int|undefined} limit the maximum number of  open orders structures to retrieve
         * @param {dict} params extra parameters specific to the scallop api endpoint
         * @returns {[dict]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOpenOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const [ marketType, query ] = this.handleMarketTypeAndParams ('fetchOpenOrders', market, params);
        const isSpot = (marketType === 'spot');
        const isMargin = (marketType === 'margin');
        const isFuture = (marketType === 'future');
        const request = {};
        if (isSpot || isMargin) {
            request['symbol'] = market['id'];
        } else if (isFuture) {
            request['contractName'] = market['id'];
        }
        const method = this.getSupportedMapping (marketType, {
            'spot': 'privateGetOpenOrders',
            'margin': 'privateGetMarginOpenOrders',
            'future': 'futuresPrivateGetOpenOrders',
        });
        const response = await this[method] (this.extend (request, query));
        //
        // spot/margin
        //
        //     {
        //         list: [
        //             {
        //                 'orderId': '499902955766523648',
        //                 'symbol': 'BHTUSDT',
        //                 'price': '0.01',
        //                 'origQty': '50',
        //                 'executedQty': '0',
        //                 'avgPrice': '0',
        //                 'status': 'NEW',
        //                 'type': 'LIMIT'
        //                 'side': 'BUY',
        //                 'time': '1574329076202'
        //             }
        //         ]
        //     }
        //
        // future
        //
        //     {
        //         list:  [
        //             {
        //                 "side": "BUY",
        //                 "executedQty": 0,
        //                 "orderId": 259396989397942275,
        //                 "price": 10000.0000000000000000,
        //                 "origQty": 1.0000000000000000,
        //                 "avgPrice": 0E-8,
        //                 "transactTime": "1607702400000",
        //                 "action": "OPEN",
        //                 "contractName": "E-BTC-USDT",
        //                 "type": "LIMIT",
        //                 "status": "INIT"
        //             }
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'list', []);
        return this.parseOrders (data, market, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name scallop#fetchMyTrades
         * @description fetch all trades made by the user
         * @param {str} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch trades for
         * @param {int|undefined} limit the maximum number of trades structures to retrieve
         * @param {dict} params extra parameters specific to the scallop api endpoint
         * @returns {[dict]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html#trade-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const [ marketType, query ] = this.handleMarketTypeAndParams ('fetchMyTrades', market, params);
        const fromId = this.safeString (params, 'fromId');
        const isSpot = (marketType === 'spot');
        const isMargin = (marketType === 'margin');
        const isFuture = (marketType === 'future');
        const request = {};
        if (isSpot || isMargin) {
            request['symbol'] = market['id'];
        } else if (isFuture) {
            request['contractName'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 100, max 1000
        }
        if (fromId !== undefined) {
            request['fromId'] = fromId;
        }
        const method = this.getSupportedMapping (marketType, {
            'spot': 'privateGetMyTrades',
            'margin': 'privateGetMarginMyTrades',
            'future': 'futuresPrivateGetMyTrades',
        });
        const omitted = this.omit (query, 'fromId');
        const response = await this[method] (this.extend (request, omitted));
        //
        // spot
        //     {
        //         "list": [
        //             {
        //                 "symbol": "ETHBTC",
        //                 "id": 100211,
        //                 "bidId": 150695552109032492,
        //                 "askId": 150695552109032493,
        //                 "price": "4.00000100",
        //                 "qty": "12.00000000",
        //                 "time": 1499865549590,
        //                 "isBuyer": true,
        //                 "isMaker": false,
        //                 "feeCoin": "ETH",
        //                 "fee":"0.001"
        //             }
        //         ]
        //     }
        //
        // margin
        //
        //     {
        //         list: [
        //             {
        //                 symbol: 'TRXUSDT',
        //                 side: 'SELL',
        //                 price: '0.065681',
        //                 qty: '1261510.4',
        //                 id: '44146705',
        //                 time: '1657700581269'
        //             }
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'list', []);
        return this.parseTrades (data, market, since, limit);
    }

    parseFundingRate (contract, market = undefined) {
        //
        //     {
        //         currentFundRate: '-0.00026849',
        //         indexPrice: '19700.0966666666666667',
        //         tagPrice: '19679.3851153439414655',
        //         nextFundRate: '-0.0007349595333336'
        //     }
        //
        const marketId = this.safeString (contract, 'contractName');
        const symbol = this.safeSymbol (marketId, market);
        const currentTime = this.safeInteger (contract, 'time');
        const currentFundingRate = this.safeNumber (contract, 'currentFundRate');
        const nextFundingRate = this.safeNumber (contract, 'nextFundRate');
        const markPrice = this.safeNumber (contract, 'tagPrice');
        const indexPrice = this.safeNumber (contract, 'indexPrice');
        return {
            'info': contract,
            'symbol': symbol,
            'markPrice': markPrice,
            'indexPrice': indexPrice,
            'interestRate': undefined,
            'estimatedSettlePrice': undefined,
            'timestamp': currentTime,
            'datetime': this.iso8601 (currentTime),
            'fundingRate': currentFundingRate,
            'previousFundingRate': undefined,
            'nextFundingRate': nextFundingRate,
            'previousFundingTimestamp': undefined,
            'nextFundingTimestamp': undefined,
            'previousFundingDatetime': undefined,
            'nextFundingDatetime': undefined,
        };
    }

    async fetchFundingRate (symbol, params = {}) {
        /**
         * @method
         * @name scallop#fetchFundingRate
         * @description fetch the current funding rate
         * @param {str} symbol unified market symbol
         * @param {dict} params extra parameters specific to the scallop api endpoint
         * @returns {dict} a [funding rate structure]{@link https://docs.ccxt.com/en/latest/manual.html#funding-rate-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const [ marketType, query ] = this.handleMarketTypeAndParams ('fetchFundingRate', market, params);
        const isFuture = marketType === 'future';
        if ((!isFuture)) {
            throw new ExchangeError (this.id + " fetchFundingRate() does not support '" + marketType + "' type, set exchange.options['defaultType'] to 'future'"); // eslint-disable-line quotes
        }
        const request = {
            'contractName': market['id'],
        };
        const response = await this.futuresPublicGetIndex (this.extend (request, query));
        //
        //     {
        //         currentFundRate: '-0.00026849',
        //         indexPrice: '19700.0966666666666667',
        //         tagPrice: '19679.3851153439414655',
        //         nextFundRate: '-0.0007349595333336'
        //     }
        //
        return this.parseFundingRate (response);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = '/' + this.version + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        let urlencoded = undefined;
        if (Object.keys (query).length) {
            urlencoded = this.urlencode (query);
        }
        if (api === 'private' || api === 'futuresPrivate') {
            const timestamp = this.milliseconds ().toString ();
            let signatureBody = undefined;
            const requestPath = this.getSupportedMapping (api, {
                'private': '/sapi' + url,
                'futuresPrivate': '/fapi' + url,
            });
            if (method === 'GET') {
                if (urlencoded !== undefined) {
                    url += '?' + urlencoded;
                    signatureBody = timestamp + method + requestPath + '?' + urlencoded;
                } else {
                    signatureBody = timestamp + method + requestPath;
                }
            } else if (method === 'POST') {
                if (urlencoded !== undefined) {
                    body = this.json (query);
                }
                signatureBody = timestamp + method + requestPath + body;
            }
            const signature = this.hmac (this.encode (signatureBody), this.encode (this.secret), 'sha256');
            headers = {
                'X-CH-APIKEY': this.apiKey,
                'X-CH-SIGN': signature,
                'X-CH-TS': timestamp,
                'Content-Type': 'application/json',
            };
        } else {
            if (urlencoded !== undefined) {
                url += '?' + urlencoded;
            }
        }
        url = this.urls['api'][api] + url;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return; // fall back to default error handler
        }
        //
        //     {"code":"-1121","msg":"无效的合约","data":null}
        //
        const code = this.safeString (response, 'code');
        const message = this.safeString (response, 'msg');
        const error = (code !== undefined) && (code !== '0');
        if (error || (message !== undefined)) {
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions['exact'], code, feedback);
            this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
            throw new ExchangeError (feedback); // unknown message
        }
    }
};
