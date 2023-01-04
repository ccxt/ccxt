'use strict';

// ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, BadRequest, ArgumentsRequired, InsufficientFunds, InvalidOrder } = require ('./base/errors');
const { TICK_SIZE } = require ('./base/functions/number');

// ---------------------------------------------------------------------------

module.exports = class bkex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bkex',
            'name': 'BKEX',
            'countries': [ 'BVI' ], // British Virgin Islands
            'rateLimit': 100,
            'version': 'v2',
            'certified': false,
            'has': {
                'CORS': undefined,
                'spot': undefined,
                'margin': undefined,
                'swap': undefined,
                'future': undefined,
                'option': undefined,
                'addMargin': undefined,
                'cancelAllOrders': undefined,
                'cancelOrder': true,
                'cancelOrders': true,
                'createDepositAddress': undefined,
                'createLimitOrder': undefined,
                'createMarketOrder': undefined,
                'createOrder': true,
                'editOrder': undefined,
                'fetchAccounts': undefined,
                'fetchBalance': true,
                'fetchBidsAsks': undefined,
                'fetchBorrowRate': undefined,
                'fetchBorrowRateHistory': undefined,
                'fetchBorrowRates': undefined,
                'fetchBorrowRatesPerSymbol': undefined,
                'fetchCanceledOrders': undefined,
                'fetchClosedOrder': undefined,
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchDeposit': false,
                'fetchDepositAddress': true,
                'fetchDepositAddresses': undefined,
                'fetchDepositAddressesByNetwork': undefined,
                'fetchDeposits': true,
                'fetchDepositWithdrawFee': 'emulated',
                'fetchDepositWithdrawFees': true,
                'fetchFundingHistory': undefined,
                'fetchFundingRate': undefined,
                'fetchFundingRateHistory': true,
                'fetchFundingRates': undefined,
                'fetchIndexOHLCV': undefined,
                'fetchL2OrderBook': undefined,
                'fetchLedger': undefined,
                'fetchLedgerEntry': undefined,
                'fetchLeverageTiers': undefined,
                'fetchMarginMode': false,
                'fetchMarketLeverageTiers': true,
                'fetchMarkets': true,
                'fetchMarkOHLCV': undefined,
                'fetchMyTrades': undefined,
                'fetchOHLCV': true,
                'fetchOpenOrder': true,
                'fetchOpenOrders': true,
                'fetchOrder': false,
                'fetchOrderBook': true,
                'fetchOrderBooks': undefined,
                'fetchOrders': undefined,
                'fetchOrderTrades': undefined,
                'fetchPosition': undefined,
                'fetchPositionMode': false,
                'fetchPositions': undefined,
                'fetchPositionsRisk': undefined,
                'fetchPremiumIndexOHLCV': undefined,
                'fetchStatus': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTradingLimits': undefined,
                'fetchTransactionFee': 'emulated',
                'fetchTransactionFees': true,
                'fetchTransactions': undefined,
                'fetchTransfer': false,
                'fetchTransfers': false,
                'fetchWithdrawal': false,
                'fetchWithdrawals': true,
                'privateAPI': true,
                'publicAPI': true,
                'reduceMargin': undefined,
                'setLeverage': undefined,
                'setMarginMode': undefined,
                'setPositionMode': undefined,
                'signIn': undefined,
                'transfer': false,
                'withdraw': false,
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '4h': '4h',
                '6h': '6h',
                '12h': '12h',
                '1d': '1d',
                '1w': '1w',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/158043180-bb079a65-69e8-45a2-b393-f094d334e610.jpg',
                'api': {
                    'spot': 'https://api.bkex.com',
                    'swap': 'https://fapi.bkex.com',
                },
                'www': 'https://www.bkex.com/',
                'doc': [
                    'https://bkexapi.github.io/docs/api_en.htm',
                ],
                'fees': [
                    'https://www.bkex.com/help/instruction/33',
                ],
            },
            'api': {
                'public': {
                    'spot': {
                        'get': {
                            '/common/symbols': 1,
                            '/common/currencys': 1,
                            '/common/timestamp': 1,
                            '/q/kline': 1,
                            '/q/tickers': 1,
                            '/q/ticker/price': 1,
                            '/q/depth': 1,
                            '/q/deals': 1,
                        },
                    },
                    'swap': {
                        'get': {
                            '/market/candle': 1,
                            '/market/deals': 1,
                            '/market/depth': 1,
                            '/market/fundingRate': 1,
                            '/market/index': 1,
                            '/market/riskLimit': 1,
                            '/market/symbols': 1,
                            '/market/ticker/price': 1,
                            '/market/tickers': 1,
                            '/server/ping': 1,
                        },
                    },
                },
                'private': {
                    'spot': {
                        'get': {
                            '/u/api/info': 1,
                            '/u/account/balance': 1,
                            '/u/wallet/address': 1,
                            '/u/wallet/depositRecord': 1,
                            '/u/wallet/withdrawRecord': 1,
                            '/u/order/openOrders': 1,
                            '/u/order/openOrder/detail': 1,
                            '/u/order/historyOrders': 1,
                        },
                        'post': {
                            '/u/account/transfer': 1,
                            '/u/wallet/withdraw': 1,
                            '/u/order/create': 1,
                            '/u/order/cancel': 1,
                            '/u/order/batchCreate': 1,
                            '/u/order/batchCancel': 1,
                        },
                    },
                    'swap': {
                        'get': {
                            '/account/balance': 1,
                            '/account/balanceRecord': 1,
                            '/account/order': 1,
                            '/account/orderForced': 1,
                            '/account/position': 1,
                            '/entrust/finished': 1,
                            '/entrust/unFinish': 1,
                            '/order/finished': 1,
                            '/order/finishedInfo': 1,
                            '/order/unFinish': 1,
                            '/position/info': 1,
                        },
                        'post': {
                            '/account/setLeverage': 1,
                            '/entrust/add': 1,
                            '/entrust/cancel': 1,
                            '/order/batchCancel': 1,
                            '/order/batchOpen': 1,
                            '/order/cancel': 1,
                            '/order/close': 1,
                            '/order/closeAll': 1,
                            '/order/open': 1,
                            '/position/setSpSl': 1,
                            '/position/update': 1,
                        },
                    },
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': this.parseNumber ('0.0015'),
                    'taker': this.parseNumber ('0.002'),
                },
            },
            'options': {
                'timeframes': {
                    'spot': {
                        '1m': '1m',
                        '5m': '5m',
                        '15m': '15m',
                        '30m': '30m',
                        '1h': '1h',
                        '4h': '4h',
                        '6h': '6h',
                        '12h': '12h',
                        '1d': '1d',
                        '1w': '1w',
                    },
                    'swap': {
                        '1m': 'M1',
                        '5m': 'M5',
                        '15m': 'M15',
                        '30m': 'M30',
                        '1h': 'H1',
                        '4h': 'H4',
                        '6h': 'H6',
                        '1d': 'D1',
                    },
                },
                'defaultType': 'spot', // spot, swap
                'networks': {
                    'TRX': 'TRC-20',
                    'TRC20': 'TRC-20',
                    'ETH': 'ERC-20',
                    'ERC20': 'ERC-20',
                    'BEP20': 'BEP-20(BSC)',
                },
            },
            'commonCurrencies': {
                'SHINJA': 'SHINJA(1M)',
            },
            'precisionMode': TICK_SIZE,
            'exceptions': {
                'exact': {
                    '1005': InsufficientFunds,
                },
                'broad': {
                    'Not Enough balance': InsufficientFunds,
                    'Order does not exist': InvalidOrder,
                    'System busy, please try again later': BadRequest, // in my tests, this was thrown mostly when request was bad, not the problem of exchange. It is easily reproduced in 'cancelOrders'
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name bkex#fetchMarkets
         * @description retrieves data on all markets for bkex
         * @see https://bkexapi.github.io/docs/api_en.htm?shell#basicInformation-1
         * @see https://bkexapi.github.io/docs/api_en.htm?shell#contract-market-symbols
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {[object]} an array of objects representing market data
         */
        let promises = [
            this.publicSpotGetCommonSymbols (params),
            this.publicSwapGetMarketSymbols (params),
        ];
        promises = await Promise.all (promises);
        const spotMarkets = promises[0];
        //
        //     {
        //         "code": "0",
        //         "data": [
        //             {
        //                 "minimumOrderSize": "0",
        //                 "minimumTradeVolume": "0E-18",
        //                 "pricePrecision": "11",
        //                 "supportTrade": true,
        //                 "symbol": "COMT_USDT",
        //                 "volumePrecision": 0
        //             },
        //         ],
        //         "msg": "success",
        //         "status": 0
        //     }
        //
        const swapMarkets = promises[1];
        //
        //     {
        //         "code": 0,
        //         "msg": "success",
        //         "data": [
        //             {
        //                 "symbol": "luna_usdt",
        //                 "supportTrade": false,
        //                 "volumePrecision": 0,
        //                 "pricePrecision": 3,
        //                 "marketMiniAmount": "1",
        //                 "limitMiniAmount": "1"
        //             },
        //         ]
        //     }
        //
        const spotData = this.safeValue (spotMarkets, 'data', []);
        const swapData = this.safeValue (swapMarkets, 'data', []);
        const data = this.arrayConcat (spotData, swapData);
        const result = [];
        for (let i = 0; i < data.length; i++) {
            const market = data[i];
            const marketId = this.safeString (market, 'symbol');
            const id = this.safeStringUpper (market, 'symbol');
            const [ baseId, quoteId ] = id.split ('_');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const minimumOrderSize = this.safeString (market, 'minimumOrderSize');
            const type = (minimumOrderSize !== undefined) ? 'spot' : 'swap';
            const swap = (type === 'swap');
            let symbol = base + '/' + quote;
            let settleId = undefined;
            let settle = undefined;
            if (swap) {
                settleId = quoteId;
                settle = quote;
                symbol = base + '/' + quote + ':' + settle;
            }
            const linear = swap ? true : undefined;
            result.push ({
                'id': marketId,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'settle': settle,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': settleId,
                'type': type,
                'spot': (type === 'spot'),
                'margin': false,
                'future': false,
                'swap': swap,
                'option': false,
                'active': this.safeValue (market, 'supportTrade'),
                'contract': swap,
                'linear': linear,
                'inverse': undefined,
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': this.parseNumber (this.parsePrecision (this.safeString (market, 'volumePrecision'))),
                    'price': this.parseNumber (this.parsePrecision (this.safeString (market, 'pricePrecision'))),
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': {
                        'min': this.safeNumberN (market, [ 'minimumOrderSize', 'marketMiniAmount', 'limitMiniAmount' ]),
                        'max': undefined,
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'cost': {
                        'min': this.safeNumber (market, 'minimumTradeVolume'),
                        'max': undefined,
                    },
                },
                'info': market,
            });
        }
        return result;
    }

    async fetchCurrencies (params = {}) {
        /**
         * @method
         * @name bkex#fetchCurrencies
         * @description fetches all available currencies on an exchange
         * @param {object} params extra parameters specific to the bkex api endpoint
         * @returns {object} an associative dictionary of currencies
         */
        const response = await this.publicSpotGetCommonCurrencys (params);
        //
        // {
        //     "code": "0",
        //     "data": [
        //        {
        //           "currency": "ETH",
        //           "maxWithdrawOneDay": "100.000000000000000000",
        //           "maxWithdrawSingle": "50.000000000000000000",
        //           "minWithdrawSingle": "0.005000000000000000",
        //           "supportDeposit": true,
        //           "supportTrade": true,
        //           "supportWithdraw": true,
        //           "withdrawFee": 0.01
        //        },
        //     ],
        //     "msg": "success",
        //     "status": 0
        // }
        //
        const data = this.safeValue (response, 'data', []);
        const result = {};
        for (let i = 0; i < data.length; i++) {
            const currency = data[i];
            const id = this.safeString (currency, 'currency');
            const code = this.safeCurrencyCode (id);
            const name = this.safeString (currency, 'name');
            const withdrawEnabled = this.safeValue (currency, 'supportWithdraw');
            const depositEnabled = this.safeValue (currency, 'supportDeposit');
            const tradeEnabled = this.safeValue (currency, 'supportTrade');
            const active = withdrawEnabled && depositEnabled && tradeEnabled;
            result[code] = {
                'id': id,
                'code': code,
                'name': name,
                'deposit': depositEnabled,
                'withdraw': withdrawEnabled,
                'active': active,
                'fee': this.safeNumber (currency, 'withdrawFee'),
                'precision': undefined,
                'limits': {
                    'amount': { 'min': undefined, 'max': undefined },
                    'price': { 'min': undefined, 'max': undefined },
                    'cost': { 'min': undefined, 'max': undefined },
                    'withdraw': { 'min': this.safeNumber (currency, 'minWithdrawSingle'), 'max': this.safeNumber (currency, 'maxWithdrawSingle') },
                },
                'info': currency,
            };
        }
        return result;
    }

    async fetchTime (params = {}) {
        /**
         * @method
         * @name bkex#fetchTime
         * @description fetches the current integer timestamp in milliseconds from the exchange server
         * @param {object} params extra parameters specific to the bkex api endpoint
         * @returns {int} the current integer timestamp in milliseconds from the exchange server
         */
        const response = await this.publicSpotGetCommonTimestamp (params);
        //
        // {
        //     "code": '0',
        //     "data": 1573542445411,
        //     "msg": "success",
        //     "status": 0
        // }
        //
        return this.safeInteger (response, 'data');
    }

    async fetchStatus (params = {}) {
        /**
         * @method
         * @name bkex#fetchStatus
         * @description the latest known information on the availability of the exchange API
         * @param {object} params extra parameters specific to the bkex api endpoint
         * @returns {object} a [status structure]{@link https://docs.ccxt.com/en/latest/manual.html#exchange-status-structure}
         */
        const response = await this.publicSpotGetCommonTimestamp (params);
        //
        //     {
        //         "code": '0',
        //         "data": 1573542445411,
        //         "msg": "success",
        //         "status": 0
        //     }
        //
        const statusRaw = this.safeInteger (response, 'status');
        const codeRaw = this.safeInteger (response, 'code');
        const updated = this.safeInteger (response, 'data');
        return {
            'status': (statusRaw === 0 && codeRaw === 0) ? 'ok' : statusRaw,
            'updated': updated,
            'eta': undefined,
            'url': undefined,
            'info': response,
        };
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bkex#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @see https://bkexapi.github.io/docs/api_en.htm?shell#quotationData-1
         * @see https://bkexapi.github.io/docs/api_en.htm?shell#contract-kline
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
         * @param {int|undefined} limit the maximum amount of candles to fetch
         * @param {object} params extra parameters specific to the bkex api endpoint
         * @returns {[[int]]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const swap = market['swap'];
        const request = {
            'symbol': market['id'],
        };
        let method = 'publicSpotGetQKline';
        const timeframes = this.safeValue (this.options, 'timeframes');
        if (swap) {
            const swapTimeframes = this.safeValue (timeframes, 'swap');
            method = 'publicSwapGetMarketCandle';
            request['period'] = swapTimeframes[timeframe];
            if (limit !== undefined) {
                request['count'] = limit;
            }
        } else {
            const spotTimeframes = this.safeValue (timeframes, 'spot');
            request['symbol'] = market['id'];
            request['period'] = spotTimeframes[timeframe];
        }
        if (limit !== undefined) {
            const limitRequest = swap ? 'count' : 'size';
            request[limitRequest] = limit;
        }
        // their docs says that 'from/to' arguments are mandatory, however that's not true in reality
        if (since !== undefined) {
            const sinceRequest = swap ? 'start' : 'from';
            request[sinceRequest] = since;
            // when 'since' [from] argument is set, then exchange also requires 'to' value to be set. So we have to set 'to' argument depending 'limit' amount (if limit was not provided, then exchange-default 500).
            if (limit === undefined) {
                limit = 500;
            }
            const duration = this.parseTimeframe (timeframe);
            const timerange = limit * duration * 1000;
            const toRequest = swap ? 'end' : 'to';
            request[toRequest] = this.sum (request[sinceRequest], timerange);
        }
        const response = await this[method] (request);
        //
        // spot
        //
        //     {
        //         "code": "0",
        //         "data": [
        //             {
        //                 "close": "43414.68",
        //                 "high": "43446.47",
        //                 "low": "43403.05",
        //                 "open": "43406.05",
        //                 "quoteVolume": "61500.40099",
        //                 "symbol": "BTC_USDT",
        //                 "ts": "1646152440000",
        //                 "volume": 1.41627
        //             },
        //         ],
        //         "msg": "success",
        //         "status": 0
        //     }
        //
        // swap
        //
        //     {
        //         "code": 0,
        //         "msg": "success",
        //         "data": [
        //             {
        //                 "symbol": "btc_usdt",
        //                 "amount": "10.26",
        //                 "volume": "172540.9433",
        //                 "open": "16817.29",
        //                 "close": "1670476440000",
        //                 "high": "16816.45",
        //                 "low": "16817.29",
        //                 "ts": 1670476440000
        //             },
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseOHLCVs (data, market, timeframe, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined) {
        const baseCurrencyVolume = market['swap'] ? 'amount' : 'volume';
        return [
            this.safeInteger (ohlcv, 'ts'),
            this.safeFloat (ohlcv, 'open'),
            this.safeFloat (ohlcv, 'high'),
            this.safeFloat (ohlcv, 'low'),
            this.safeFloat (ohlcv, 'close'),
            this.safeFloat (ohlcv, baseCurrencyVolume),
        ];
    }

    async fetchTicker (symbol, params = {}) {
        /**
         * @method
         * @name bkex#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @see https://bkexapi.github.io/docs/api_en.htm?shell#quotationData-2
         * @see https://bkexapi.github.io/docs/api_en.htm?shell#contract-ticker-data
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the bkex api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const [ marketType, query ] = this.handleMarketTypeAndParams ('fetchTicker', market, params);
        const method = (marketType === 'swap') ? 'publicSwapGetMarketTickers' : 'publicSpotGetQTickers';
        const response = await this[method] (this.extend (request, query));
        //
        // spot
        //
        //     {
        //         "code": "0",
        //         "data": [
        //             {
        //                 "change": "6.52",
        //                 "close": "43573.470000",
        //                 "high": "44940.540000",
        //                 "low": "40799.840000",
        //                 "open": "40905.780000",
        //                 "quoteVolume": "225621691.5991",
        //                 "symbol": "BTC_USDT",
        //                 "ts": "1646156490781",
        //                 "volume": 5210.349
        //             }
        //         ],
        //         "msg": "success",
        //         "status": 0
        //     }
        //
        // swap
        //
        //     {
        //         "code": 0,
        //         "msg": "success",
        //         "data": [
        //             {
        //                 "symbol": "btc_usdt",
        //                 "amount": "171035.45",
        //                 "volume": "2934757466.3859",
        //                 "open": "17111.43",
        //                 "close": "17135.74",
        //                 "high": "17225.99",
        //                 "low": "17105.77",
        //                 "lastPrice": "17135.74",
        //                 "lastAmount": "1.05",
        //                 "lastTime": 1670709364912,
        //                 "change": "0.14"
        //             }
        //         ]
        //     }
        //
        const tickers = this.safeValue (response, 'data', []);
        const ticker = this.safeValue (tickers, 0);
        return this.parseTicker (ticker, market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        /**
         * @method
         * @name bkex#fetchTickers
         * @description fetches price tickers for multiple markets, statistical calculations with the information calculated over the past 24 hours each market
         * @see https://bkexapi.github.io/docs/api_en.htm?shell#quotationData-2
         * @see https://bkexapi.github.io/docs/api_en.htm?shell#contract-ticker-data
         * @param {[string]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} params extra parameters specific to the bkex api endpoint
         * @returns {object} an array of [ticker structures]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        const request = {};
        if (symbols !== undefined) {
            if (!Array.isArray (symbols)) {
                throw new BadRequest (this.id + ' fetchTickers() symbols argument should be an array');
            }
        }
        let market = undefined;
        if (symbols !== undefined) {
            const marketIds = this.marketIds (symbols);
            const symbol = this.safeString (symbols, 0);
            market = this.market (symbol);
            if (market['swap']) {
                if (Array.isArray (symbols)) {
                    const symbolsLength = symbols.length;
                    if (symbolsLength > 1) {
                        throw new BadRequest (this.id + ' fetchTickers() symbols argument cannot contain more than 1 symbol for swap markets');
                    }
                }
                request['symbol'] = market['id'];
            } else {
                request['symbol'] = marketIds.join (',');
            }
        }
        const [ marketType, query ] = this.handleMarketTypeAndParams ('fetchTickers', market, params);
        const method = (marketType === 'swap') ? 'publicSwapGetMarketTickers' : 'publicSpotGetQTickers';
        const response = await this[method] (this.extend (request, query));
        //
        // spot
        //
        //     {
        //         "code": "0",
        //         "data": [
        //             {
        //                 "change": "6.52",
        //                 "close": "43573.470000",
        //                 "high": "44940.540000",
        //                 "low": "40799.840000",
        //                 "open": "40905.780000",
        //                 "quoteVolume": "225621691.5991",
        //                 "symbol": "BTC_USDT",
        //                 "ts": "1646156490781",
        //                 "volume": 5210.349
        //             }
        //         ],
        //         "msg": "success",
        //         "status": 0
        //     }
        //
        // swap
        //
        //     {
        //         "code": 0,
        //         "msg": "success",
        //         "data": [
        //             {
        //                 "symbol": "btc_usdt",
        //                 "amount": "171035.45",
        //                 "volume": "2934757466.3859",
        //                 "open": "17111.43",
        //                 "close": "17135.74",
        //                 "high": "17225.99",
        //                 "low": "17105.77",
        //                 "lastPrice": "17135.74",
        //                 "lastAmount": "1.05",
        //                 "lastTime": 1670709364912,
        //                 "change": "0.14"
        //             }
        //         ]
        //     }
        //
        const tickers = this.safeValue (response, 'data', []);
        return this.parseTickers (tickers, symbols, query);
    }

    parseTicker (ticker, market = undefined) {
        //
        // spot
        //
        //    {
        //          "change":-0.46,
        //          "close":29664.46,
        //          "high":30784.99,
        //          "low":29455.36,
        //          "open":29803.38,
        //          "quoteVolume":714653752.6991,
        //          "symbol":"BTC_USDT",
        //          "ts":1652812048118,
        //          "volume":23684.9416
        //    }
        //
        // swap
        //
        //     {
        //         "symbol": "btc_usdt",
        //         "amount": "171035.45",
        //         "volume": "2934757466.3859",
        //         "open": "17111.43",
        //         "close": "17135.74",
        //         "high": "17225.99",
        //         "low": "17105.77",
        //         "lastPrice": "17135.74",
        //         "lastAmount": "1.05",
        //         "lastTime": 1670709364912,
        //         "change": "0.14"
        //     }
        //
        const marketId = this.safeString (ticker, 'symbol');
        market = this.safeMarket (marketId, market);
        const symbol = this.safeSymbol (marketId, market);
        const timestamp = this.safeInteger2 (ticker, 'ts', 'lastTime');
        const baseCurrencyVolume = market['swap'] ? 'amount' : 'volume';
        const quoteCurrencyVolume = market['swap'] ? 'volume' : 'quoteVolume';
        const lastPrice = market['swap'] ? 'lastPrice' : 'close';
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'high'),
            'low': this.safeString (ticker, 'low'),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': this.safeString (ticker, 'open'),
            'close': this.safeString (ticker, 'close'),
            'last': this.safeString (ticker, lastPrice),
            'previousClose': undefined,
            'change': undefined,
            'percentage': this.safeString (ticker, 'change'), // 24h percentage change (close - open) / open * 100
            'average': undefined,
            'baseVolume': this.safeString (ticker, baseCurrencyVolume),
            'quoteVolume': this.safeString (ticker, quoteCurrencyVolume),
            'info': ticker,
        }, market);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name bkex#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @see https://bkexapi.github.io/docs/api_en.htm?shell#quotationData-4
         * @see https://bkexapi.github.io/docs/api_en.htm?shell#contract-deep-data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the bkex api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const swap = market['swap'];
        const request = {
            'symbol': market['id'],
        };
        let method = 'publicSpotGetQDepth';
        if (swap) {
            method = 'publicSwapGetMarketDepth';
        } else {
            if (limit !== undefined) {
                request['depth'] = Math.min (limit, 50);
            }
        }
        const response = await this[method] (this.extend (request, params));
        //
        // spot
        //
        //     {
        //         "code": "0",
        //         "data": {
        //             "ask": [
        //                 ["43820.07","0.86947"],
        //                 ["43820.25","0.07503"],
        //             ],
        //             "bid": [
        //                 ["43815.94","0.43743"],
        //                 ["43815.72","0.08901"],
        //             ],
        //             "symbol": "BTC_USDT",
        //             "timestamp": 1646161595841
        //         },
        //         "msg": "success",
        //         "status": 0
        //     }
        //
        // swap
        //
        //     {
        //         "code": 0,
        //         "msg": "success",
        //         "data": {
        //             "bid": [
        //                 ["16803.170000","4.96"],
        //                 ["16803.140000","11.07"],
        //             ],
        //             "ask": [
        //                 ["16803.690000","9.2"],
        //                 ["16804.180000","9.43"],
        //             ]
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data');
        const timestamp = this.safeInteger (data, 'timestamp');
        return this.parseOrderBook (data, market['symbol'], timestamp, 'bid', 'ask');
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bkex#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @see https://bkexapi.github.io/docs/api_en.htm?shell#quotationData-5
         * @see https://bkexapi.github.io/docs/api_en.htm?shell#contract-trades-history
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the bkex api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const swap = market['swap'];
        const request = {
            'symbol': market['id'],
        };
        let method = 'publicSpotGetQDeals';
        if (swap) {
            method = 'publicSwapGetMarketDeals';
        } else {
            if (limit !== undefined) {
                request['size'] = Math.min (limit, 50);
            }
        }
        const response = await this[method] (this.extend (request, params));
        //
        // spot
        //
        //     {
        //         "code": "0",
        //         "data": [
        //             {
        //                 "direction": "S",
        //                 "price": "43930.63",
        //                 "symbol": "BTC_USDT",
        //                 "ts": "1646224171992",
        //                 "volume": 0.030653
        //             }, // first item is most recent
        //         ],
        //         "msg": "success",
        //         "status": 0
        //     }
        //
        // swap
        //
        //     {
        //         "code": 0,
        //         "msg": "success",
        //         "data": [
        //             {
        //                 "symbol": "btc_usdt",
        //                 "amount": "0.06",
        //                 "price": "17134.66",
        //                 "side": "sell",
        //                 "time": 1670651851646
        //             },
        //         ]
        //     }
        //
        const trades = this.safeValue (response, 'data');
        return this.parseTrades (trades, market, since, limit);
    }

    parseTrade (trade, market = undefined) {
        const timestamp = this.safeInteger2 (trade, 'ts', 'time');
        const marketId = this.safeString (trade, 'symbol');
        market = this.safeMarket (marketId, market);
        const side = this.parseTradeSide (this.safeString2 (trade, 'direction', 'side'));
        const amount = this.safeNumber2 (trade, 'volume', 'amount');
        const price = this.safeNumber (trade, 'price');
        const type = undefined;
        let id = this.safeString (trade, 'tid');
        if (id === undefined) {
            id = this.syntheticTradeId (market, timestamp, side, amount, price, type);
        }
        return this.safeTrade ({
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'order': undefined,
            'type': type,
            'side': side,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'fee': undefined,
            'info': trade,
        }, market);
    }

    parseTradeSide (side) {
        const sides = {
            'B': 'buy',
            'S': 'sell',
            'buy': 'buy',
            'sell': 'sell',
        };
        return this.safeString (sides, side, side);
    }

    syntheticTradeId (market = undefined, timestamp = undefined, side = undefined, amount = undefined, price = undefined, orderType = undefined, takerOrMaker = undefined) {
        // TODO: can be unified method? this approach is being used by multiple exchanges (mexc, woo-coinsbit, dydx, ...)
        let id = '';
        if (timestamp !== undefined) {
            id = this.numberToString (timestamp) + '-' + this.safeString (market, 'id', '_');
            if (side !== undefined) {
                id += '-' + side;
            }
            if (orderType !== undefined) {
                id += '-' + orderType;
            }
            if (takerOrMaker !== undefined) {
                id += '-' + takerOrMaker;
            }
            if (amount !== undefined) {
                id += '-' + this.numberToString (amount);
            }
            if (price !== undefined) {
                id += '-' + this.numberToString (price);
            }
        }
        return id;
    }

    async fetchBalance (params = {}) {
        /**
         * @method
         * @name bkex#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} params extra parameters specific to the bkex api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.loadMarkets ();
        const query = this.omit (params, 'type');
        const response = await this.privateSpotGetUAccountBalance (query);
        //
        // {
        //     "code": "0",
        //     "data": {
        //       "WALLET": [
        //         {
        //           "available": "0.221212121000000000",
        //           "currency": "PHX",
        //           "frozen": "0E-18",
        //           "total": 0.221212121
        //         },
        //         {
        //           "available": "44.959577229600000000",
        //           "currency": "USDT",
        //           "frozen": "0E-18",
        //           "total": 44.9595772296
        //         }
        //       ]
        //     },
        //     "msg": "success",
        //     "status": 0
        // }
        //
        const balances = this.safeValue (response, 'data');
        const wallets = this.safeValue (balances, 'WALLET', []);
        const result = { 'info': wallets };
        for (let i = 0; i < wallets.length; i++) {
            const wallet = wallets[i];
            const currencyId = wallet['currency'];
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeNumber (wallet, 'available');
            account['used'] = this.safeNumber (wallet, 'frozen');
            account['total'] = this.safeNumber (wallet, 'total');
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    async fetchDepositAddress (code, params = {}) {
        /**
         * @method
         * @name bkex#fetchDepositAddress
         * @description fetch the deposit address for a currency associated with this account
         * @param {string} code unified currency code
         * @param {object} params extra parameters specific to the bkex api endpoint
         * @returns {object} an [address structure]{@link https://docs.ccxt.com/en/latest/manual.html#address-structure}
         */
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
        };
        const response = await this.privateSpotGetUWalletAddress (this.extend (request, params));
        // NOTE: You can only retrieve addresses of already generated wallets - so should already have generated that COIN deposit address in UI. Otherwise, it seems from API you can't create/obtain addresses for those coins.
        //
        // {
        //     "code": "0",
        //     "data": [
        //       {
        //         "currency": "BTC",
        //         "address": "1m4k2yUKTSrX6SM9FGgvwMyxQbYtRVi2N",
        //         "memo": ""
        //       }
        //     ],
        //     "msg": "success",
        //     "status": 0
        // }
        //
        const data = this.safeValue (response, 'data', {});
        return this.parseDepositAddress (data, currency);
    }

    parseDepositAddress (data, currency = undefined) {
        const depositObject = this.safeValue (data, 0);
        const address = this.safeString (depositObject, 'address');
        const tag = this.safeString (depositObject, 'memo');
        const currencyId = this.safeString (depositObject, 'currency');
        currency = this.safeCurrency (currencyId, currency);
        return {
            'currency': currency['code'],
            'address': address,
            'tag': tag,
            'network': undefined,
            'info': data,
        };
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bkex#fetchDeposits
         * @description fetch all deposits made to an account
         * @param {string} code unified currency code
         * @param {int|undefined} since the earliest time in ms to fetch deposits for
         * @param {int|undefined} limit the maximum number of deposits structures to retrieve
         * @param {object} params extra parameters specific to the bkex api endpoint
         * @returns {[object]} a list of [transaction structures]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
        if (code === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchDeposits() requires code argument');
        }
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
        };
        if (since !== undefined) {
            request['startTime'] = since;
            const endTime = this.milliseconds ();
            request['endTime'] = endTime;
        }
        if (limit !== undefined) {
            request['Size'] = limit; // Todo: id api-docs, 'size' is incorrectly required to be in Uppercase
        }
        const response = await this.privateSpotGetUWalletDepositRecord (this.extend (request, params));
        //
        // {
        //     "code": "0",
        //     "data": {
        //       "data": [
        //         {
        //           "createTime": "1622274255000",
        //           "currency": "BNB",
        //           "fromAddress": "bnb10af52w77pkehgxhnwgeca50q2t2354q4xexa5y",
        //           "hash": "97B982F497782C2777C0F6AD16CEAAC65A93A364B684A23A71CFBB8C010DEEA6",
        //           "id": "2021052923441510234383337",
        //           "status": "0",
        //           "toAddress": "bnb13w64gkc42c0l45m2p5me4qn35z0a3ej9ldks3j_82784659",
        //           "volume": 0.073
        //         }
        //       ],
        //       "total": 1
        //     },
        //     "msg": "success",
        //     "status": 0
        // }
        //
        const data = this.safeValue (response, 'data', {});
        const dataInner = this.safeValue (data, 'data', []);
        for (let i = 0; i < dataInner.length; i++) {
            dataInner[i]['transactType'] = 'deposit';
        }
        return this.parseTransactions (dataInner, currency, since, limit, params);
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bkex#fetchWithdrawals
         * @description fetch all withdrawals made from an account
         * @param {string} code unified currency code
         * @param {int|undefined} since the earliest time in ms to fetch withdrawals for
         * @param {int|undefined} limit the maximum number of withdrawals structures to retrieve
         * @param {object} params extra parameters specific to the bkex api endpoint
         * @returns {[object]} a list of [transaction structures]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
        if (code === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchWithdrawals() requires code argument');
        }
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
        };
        if (since !== undefined) {
            request['startTime'] = since;
            const endTime = this.milliseconds ();
            request['endTime'] = endTime;
        }
        if (limit !== undefined) {
            request['Size'] = limit; // Todo: id api-docs, 'size' is incorrectly required to be in Uppercase
        }
        const response = await this.privateSpotGetUWalletWithdrawRecord (this.extend (request, params));
        //
        // {
        //     "code": "0",
        //     "data": {
        //       "data": [
        //         {
        //           ...
        //         }
        //       ],
        //       "total": 1
        //     },
        //     "msg": "success",
        //     "status": 0
        // }
        //
        const data = this.safeValue (response, 'data', {});
        const dataInner = this.safeValue (data, 'data', []);
        for (let i = 0; i < dataInner.length; i++) {
            dataInner[i]['transactType'] = 'withdrawal';
        }
        return this.parseTransactions (dataInner, currency, since, limit, params);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        // fetchDeposits
        //
        // {
        //   "createTime": "1622274255000",
        //   "currency": "BNB",
        //   "fromAddress": "bnb10af52w77pkehgxhnwgeca50q2t2354q4xexa5y",
        //   "hash": "97B982F497782C2777C0F6AD16CEAAC65A93A364B684A23A71CFBB8C010DEEA6",
        //   "id": "2021052923441510234383337",
        //   "status": "0",
        //   "toAddress": "bnb13w64gkc42c0l45m2p5me4qn35z0a3ej9ldks3j_82784659",
        //   "volume": 0.073
        // }
        //
        const id = this.safeString (transaction, 'id');
        const amount = this.safeNumber (transaction, 'volume');
        const addressTo = this.safeValue (transaction, 'toAddress', {});
        const addressFrom = this.safeString (transaction, 'fromAddress');
        const txid = this.safeString (transaction, 'hash');
        const type = this.safeString (transaction, 'transactType');
        const timestamp = this.safeInteger (transaction, 'createTime');
        const currencyId = this.safeString (transaction, 'currency');
        const code = this.safeCurrencyCode (currencyId, currency);
        const status = this.parseTransactionStatus (this.safeString (transaction, 'status'));
        return {
            'id': id,
            'currency': code,
            'amount': amount,
            'network': undefined,
            'address': addressTo,
            'addressTo': addressTo,
            'addressFrom': addressFrom,
            'tag': undefined,
            'tagTo': undefined,
            'tagFrom': undefined,
            'status': status,
            'type': type,
            'updated': undefined,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'fee': {
                'currency': code,
                'cost': undefined,
            },
            'info': transaction,
        };
    }

    parseTransactionStatus (status) {
        const statuses = {
            '-1': 'failed',
            '0': 'ok',
            '3': 'pending',
            '5': 'pending',
        };
        return this.safeString (statuses, status, status);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name bkex#createOrder
         * @description create a trade order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float|undefined} price the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} params extra parameters specific to the bkex api endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const direction = (side === 'buy') ? 'BID' : 'ASK';
        const request = {
            'symbol': market['id'],
            'type': type.toUpperCase (),
            'volume': this.amountToPrecision (symbol, amount),
            'direction': direction,
        };
        if ((type !== 'market') && (price !== undefined)) {
            request['price'] = this.priceToPrecision (symbol, price);
        }
        const response = await this.privateSpotPostUOrderCreate (this.extend (request, params));
        //
        // {
        //     "code": "0",
        //     "data": "2022030302410146630023187",
        //     "msg": "Create Order Successfully",
        //     "status": 0
        // }
        //
        return this.parseOrder (response, market);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name bkex#cancelOrder
         * @description cancels an open order
         * @param {string} id order id
         * @param {string|undefined} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the bkex api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const market = (symbol !== undefined) ? this.market (symbol) : undefined;
        const request = {
            'orderId': id,
        };
        const response = await this.privateSpotPostUOrderCancel (this.extend (request, params));
        //
        // {
        //     "code": "0",
        //     "data": "2022030303032700030025325",
        //     "status": 0
        // }
        //
        return this.parseOrder (response, market);
    }

    async cancelOrders (ids, symbol = undefined, params = {}) {
        /**
         * @method
         * @name bkex#cancelOrders
         * @description cancel multiple orders
         * @param {[string]} ids order ids
         * @param {string|undefined} symbol unified market symbol, default is undefined
         * @param {object} params extra parameters specific to the bkex api endpoint
         * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        if (!Array.isArray (ids)) {
            throw new ArgumentsRequired (this.id + ' cancelOrders() ids argument should be an array');
        }
        await this.loadMarkets ();
        const request = {
            'orders': this.json (ids),
        };
        const response = await this.privateSpotPostUOrderBatchCancel (this.extend (request, params));
        // {
        //     "code": 0,
        //     "msg": "success",
        //     "data": {
        //        "success": 2,
        //        "fail": 0,
        //        "results": ["2019062312313131231"," 2019063123131312313"]
        //     }
        // }
        const data = this.safeValue (response, 'data');
        const results = this.safeValue (data, 'results');
        const market = (symbol !== undefined) ? this.market (symbol) : undefined;
        return this.parseOrders (results, market, undefined, undefined, params);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bkex#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @param {string} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch open orders for
         * @param {int|undefined} limit the maximum number of  open orders structures to retrieve
         * @param {object} params extra parameters specific to the bkex api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOpenOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['size'] = limit; // Todo: id api-docs, 'size' is incorrectly required to be in Uppercase
        }
        const response = await this.privateSpotGetUOrderOpenOrders (this.extend (request, params));
        //
        // {
        //     "code": "0",
        //     "data": {
        //       "data": [
        //         {
        //           "createdTime": "1646248301418",
        //           "dealVolume": "0E-18",
        //           "direction": "BID",
        //           "frozenVolumeByOrder": "2.421300000000000000",
        //           "id": "2022030303114141830007699",
        //           "price": "0.150000000000000000",
        //           "source": "WALLET",
        //           "status": "0",
        //           "symbol": "BKK_USDT",
        //           "totalVolume": "16.142000000000000000",
        //           "type": "LIMIT"
        //         }
        //       ],
        //       "pageRequest": {
        //         "asc": false,
        //         "orderBy": "id",
        //         "page": "1",
        //         "size": 10
        //       },
        //       "total": 1
        //     },
        //     "msg": "success",
        //     "status": 0
        // }
        //
        const result = this.safeValue (response, 'data');
        const innerData = this.safeValue (result, 'data');
        return this.parseOrders (innerData, market, since, limit, params);
    }

    async fetchOpenOrder (id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name bkex#fetchOpenOrder
         * @description fetch an open order by it's id
         * @param {string} id order id
         * @param {string|undefined} symbol unified market symbol, default is undefined
         * @param {object} params extra parameters specific to the bkex api endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        const request = {
            'orderId': id,
        };
        const response = await this.privateSpotGetUOrderOpenOrderDetail (this.extend (request, params));
        //
        // {
        //     "code": "0",
        //     "data": {
        //       "createdTime": "1646248301418",
        //       "dealAvgPrice": "0",
        //       "dealVolume": "0E-18",
        //       "direction": "BID",
        //       "frozenVolumeByOrder": "2.421300000000000000",
        //       "id": "2022030303114141830002452",
        //       "price": "0.150000000000000000",
        //       "source": "WALLET",
        //       "status": "0",
        //       "symbol": "BKK_USDT",
        //       "totalVolume": "16.142000000000000000",
        //       "type": "LIMIT",
        //       "updateTime": 1646248301418
        //     },
        //     "msg": "success",
        //     "status": 0
        // }
        //
        const data = this.safeValue (response, 'data');
        const market = (symbol !== undefined) ? this.market (symbol) : undefined;
        return this.parseOrder (data, market);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bkex#fetchClosedOrders
         * @description fetches information on multiple closed orders made by the user
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the bkex api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchClosedOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['size'] = limit; // Todo: id api-docs, 'size' is incorrectly required to be in Uppercase
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        const response = await this.privateSpotGetUOrderHistoryOrders (this.extend (request, params));
        //
        // {
        //     "code": "0",
        //     "data": {
        //       "data": [
        //         {
        //           "createdTime": "1646247807000",
        //           "dealAvgPrice": "0",
        //           "dealVolume": "0",
        //           "direction": "BID",
        //           "frozenVolumeByOrder": "1.65",
        //           "id": "2022030303032700030025943",
        //           "price": "0.15",
        //           "source": "WALLET",
        //           "status": "2",
        //           "symbol": "BKK_USDT",
        //           "totalVolume": "11",
        //           "type": "LIMIT",
        //           "updateTime": 1646247852558
        //         },
        //       ],
        //       "pageRequest": {
        //         "asc": false,
        //         "orderBy": "id",
        //         "page": "1",
        //         "size": 10
        //       },
        //       "total": 6
        //     },
        //     "msg": "success",
        //     "status": 0
        // }
        //
        const result = this.safeValue (response, 'data');
        const innerData = this.safeValue (result, 'data');
        return this.parseOrders (innerData, market, since, limit, params);
    }

    parseOrder (order, market = undefined) {
        //
        // fetchOpenOrders
        //
        //  {
        //       "createdTime": "1646248301418",
        //       "dealVolume": "0E-18",
        //       "direction": "BID",
        //       "frozenVolumeByOrder": "2.421300000000000000",
        //       "id": "2022030303114141830007699",
        //       "price": "0.150000000000000000",
        //       "source": "WALLET",
        //       "status": "0",
        //       "symbol": "BKK_USDT",
        //       "totalVolume": "16.142000000000000000",
        //       "type": "LIMIT"
        //       "stopPrice":  "0.14",            // present only for 'stop' order types
        //       "operator":  ">="                // present only for 'stop' order types
        //       "dealAvgPrice": "0",             // only present in 'fetchOrder' & 'fetchClosedOrders'
        //       "updateTime": 1646248301418      // only present in 'fetchOrder' & 'fetchClosedOrders'
        //  }
        //
        const timestamp = this.safeInteger (order, 'createdTime');
        const updateTime = this.safeInteger (order, 'updateTime');
        const filled = this.safeString (order, 'dealVolume');
        const side = this.parseOrderSide (this.safeString (order, 'direction'));
        const id = this.safeString2 (order, 'id', 'data');
        const price = this.safeString (order, 'price');
        const rawStatus = this.safeString (order, 'status');
        const rawType = this.safeString (order, 'type');
        const type = this.parseOrderType (rawType);
        let postOnly = false;
        if (rawType === 'LIMIT_MAKER') {
            postOnly = true;
        }
        let status = undefined;
        if (timestamp !== undefined) {
            // cancelOrder handling
            status = this.parseOrderStatus (rawStatus);
        }
        const marketId = this.safeString (order, 'symbol');
        market = this.safeMarket (marketId, market);
        const amount = this.safeString (order, 'totalVolume');
        const stopPrice = this.safeNumber (order, 'stopPrice');
        const average = this.safeString (order, 'dealAvgPrice');
        return this.safeOrder ({
            'id': id,
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': updateTime,
            'status': status,
            'symbol': market['symbol'],
            'type': type,
            'timeInForce': undefined,
            'postOnly': postOnly,
            'side': side,
            'price': price,
            'stopPrice': stopPrice,
            'triggerPrice': stopPrice,
            'average': average,
            'amount': amount,
            'filled': filled,
            'remaining': undefined,
            'cost': undefined,
            'trades': undefined,
            'fee': undefined,
            'info': order,
        }, market);
    }

    parseOrderSide (side) {
        const sides = {
            'BID': 'buy',
            'ASK': 'sell',
        };
        return this.safeString (sides, side, side);
    }

    parseOrderStatus (status) {
        const statuses = {
            '0': 'open',
            '1': 'closed',
            '2': 'canceled',
            '3': 'open',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrderType (status) {
        const statuses = {
            'MARKET': 'market',
            'LIMIT': 'limit',
            'LIMIT_MAKER': 'limit',
            'STOP_LIMIT': 'limit',
        };
        return this.safeString (statuses, status, status);
    }

    async fetchTransactionFees (codes = undefined, params = {}) {
        /**
         * @method
         * @name bkex#fetchTransactionFees
         * @description *DEPRECATED* please use fetchDepositWithdrawFees instead
         * @see https://bkexapi.github.io/docs/api_en.htm?shell#basicInformation-2
         * @param {[string]|undefined} codes list of unified currency codes
         * @param {object} params extra parameters specific to the bkex api endpoint
         * @returns {object} a list of [fee structures]{@link https://docs.ccxt.com/en/latest/manual.html#fee-structure}
         */
        await this.loadMarkets ();
        const response = await this.publicSpotGetCommonCurrencys (params);
        //
        //      {
        //          "msg": "success",
        //          "code": "0",
        //          "data": [
        //            {
        //              "currency": "ETH",
        //              "maxWithdrawOneDay": 2000,
        //              "maxWithdrawSingle": 2000,
        //              "minWithdrawSingle": 0.1,
        //              "supportDeposit": true,
        //              "supportTrade": true,
        //              "supportWithdraw": true,
        //              "withdrawFee": 0.008
        //            },
        //            {
        //              "currency": "BTC",
        //              "maxWithdrawOneDay": 100,
        //              "maxWithdrawSingle": 100,
        //              "minWithdrawSingle": 0.01,
        //              "supportDeposit": true,
        //              "supportTrade": true,
        //              "supportWithdraw": true,
        //              "withdrawFee": 0.008
        //            }
        //          ]
        //      }
        //
        return this.parseTransactionFees (response, codes);
    }

    parseTransactionFees (response, codes = undefined) {
        const data = this.safeValue (response, 'data');
        const result = {};
        for (let i = 0; i < data.length; i++) {
            const entry = data[i];
            const currencyId = this.safeString (entry, 'currency');
            const currency = this.safeCurrency (currencyId);
            const code = this.safeString (currency, 'code');
            if ((codes === undefined) || (this.inArray (code, codes))) {
                result[code] = {
                    'withdraw': this.parseTransactionFee (entry),
                    'deposit': undefined,
                    'info': entry,
                };
            }
        }
        return result;
    }

    parseTransactionFee (transaction, currency = undefined) {
        //
        //      {
        //          "currency": "ETH",
        //          "maxWithdrawOneDay": 2000,
        //          "maxWithdrawSingle": 2000,
        //          "minWithdrawSingle": 0.1,
        //          "supportDeposit": true,
        //          "supportTrade": true,
        //          "supportWithdraw": true,
        //          "withdrawFee": 0.008
        //      }
        //
        return this.safeNumber (transaction, 'withdrawFee');
    }

    async fetchDepositWithdrawFees (codes = undefined, params = {}) {
        /**
         * @method
         * @name bkex#fetchDepositWithdrawFees
         * @description fetch deposit and withdraw fees
         * @see https://bkexapi.github.io/docs/api_en.htm?shell#basicInformation-2
         * @param {[string]|undefined} codes list of unified currency codes
         * @param {object} params extra parameters specific to the bkex api endpoint
         * @returns {object} a list of [fee structures]{@link https://docs.ccxt.com/en/latest/manual.html#fee-structure}
         */
        await this.loadMarkets ();
        const response = await this.publicSpotGetCommonCurrencys (params);
        //
        //    {
        //        "msg": "success",
        //        "code": "0",
        //        "data": [
        //            {
        //                "currency": "ETH",
        //                "maxWithdrawOneDay": 2000,
        //                "maxWithdrawSingle": 2000,
        //                "minWithdrawSingle": 0.1,
        //                "supportDeposit": true,
        //                "supportTrade": true,
        //                "supportWithdraw": true,
        //                "withdrawFee": 0.008
        //            },
        //            {
        //                "currency": "BTC",
        //                "maxWithdrawOneDay": 100,
        //                "maxWithdrawSingle": 100,
        //                "minWithdrawSingle": 0.01,
        //                "supportDeposit": true,
        //                "supportTrade": true,
        //                "supportWithdraw": true,
        //                "withdrawFee": 0.008
        //            }
        //        ]
        //    }
        //
        const data = this.safeValue (response, 'data');
        return this.parseDepositWithdrawFees (data, codes, 'currency');
    }

    parseDepositWithdrawFee (fee, currency = undefined) {
        //
        //      {
        //          "currency": "ETH",
        //          "maxWithdrawOneDay": 2000,
        //          "maxWithdrawSingle": 2000,
        //          "minWithdrawSingle": 0.1,
        //          "supportDeposit": true,
        //          "supportTrade": true,
        //          "supportWithdraw": true,
        //          "withdrawFee": 0.008
        //      }
        //
        const result = this.depositWithdrawFee (fee);
        result['withdraw']['fee'] = this.safeNumber (fee, 'withdrawFee');
        return result;
    }

    async fetchFundingRateHistory (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bkex#fetchFundingRateHistory
         * @see https://bkexapi.github.io/docs/api_en.htm?shell#contract-fundingRate
         * @description fetches historical funding rate prices
         * @param {string|undefined} symbol unified symbol of the market to fetch the funding rate history for
         * @param {int|undefined} since timestamp in ms of the earliest funding rate to fetch
         * @param {int|undefined} limit the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/en/latest/manual.html?#funding-rate-history-structure} to fetch
         * @param {object} params extra parameters specific to the bkex api endpoint
         * @returns {[object]} a list of [funding rate structures]{@link https://docs.ccxt.com/en/latest/manual.html?#funding-rate-history-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchFundingRateHistory() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicSwapGetMarketFundingRate (this.extend (request, params));
        //
        //     {
        //         "code": 0,
        //         "msg": "success",
        //         "data": [
        //             {
        //                 "symbol": "btc_usdt",
        //                 "rate": "-0.00008654",
        //                 "time": 1670658302128
        //             },
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        const rates = [];
        for (let i = 0; i < data.length; i++) {
            const entry = data[i];
            const marketId = this.safeString (entry, 'symbol');
            const symbol = this.safeSymbol (marketId);
            const timestamp = this.safeInteger (entry, 'time');
            rates.push ({
                'info': entry,
                'symbol': symbol,
                'fundingRate': this.safeNumber (entry, 'rate'),
                'timestamp': timestamp,
                'datetime': this.iso8601 (timestamp),
            });
        }
        const sorted = this.sortBy (rates, 'timestamp');
        return this.filterBySymbolSinceLimit (sorted, market['symbol'], since, limit);
    }

    async fetchMarketLeverageTiers (symbol, params = {}) {
        /**
         * @method
         * @name bkex#fetchMarketLeverageTiers
         * @see https://bkexapi.github.io/docs/api_en.htm?shell#contract-riskLimit
         * @description retrieve information on the maximum leverage, for different trade sizes for a single market
         * @param {string} symbol unified market symbol
         * @param {object} params extra parameters specific to the bkex api endpoint
         * @returns {object} a [leverage tiers structure]{@link https://docs.ccxt.com/en/latest/manual.html#leverage-tiers-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (!market['swap']) {
            throw new BadRequest (this.id + ' fetchMarketLeverageTiers() supports swap markets only');
        }
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicSwapGetMarketRiskLimit (this.extend (request, params));
        //
        //     {
        //         "code": 0,
        //         "msg": "success",
        //         "data": [
        //             {
        //                 "symbol": "btc_usdt",
        //                 "minValue": "0",
        //                 "maxValue": "500000",
        //                 "maxLeverage": 100,
        //                 "maintenanceMarginRate": "0.005"
        //             },
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseMarketLeverageTiers (data, market);
    }

    parseMarketLeverageTiers (info, market) {
        //
        //     [
        //         {
        //             "symbol": "btc_usdt",
        //             "minValue": "0",
        //             "maxValue": "500000",
        //             "maxLeverage": 100,
        //             "maintenanceMarginRate": "0.005"
        //         },
        //     ]
        //
        const tiers = [];
        for (let i = 0; i < info.length; i++) {
            const tier = info[i];
            const marketId = this.safeString (info, 'symbol');
            market = this.safeMarket (marketId, market);
            tiers.push ({
                'tier': this.sum (i, 1),
                'currency': market['settle'],
                'minNotional': this.safeNumber (tier, 'minValue'),
                'maxNotional': this.safeNumber (tier, 'maxValue'),
                'maintenanceMarginRate': this.safeNumber (tier, 'maintenanceMarginRate'),
                'maxLeverage': this.safeNumber (tier, 'maxLeverage'),
                'info': tier,
            });
        }
        return tiers;
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const signed = api[0] === 'private';
        const endpoint = api[1];
        const pathPart = (endpoint === 'spot') ? this.version : 'fapi/' + this.version;
        let url = this.urls['api'][endpoint] + '/' + pathPart + this.implodeParams (path, params);
        params = this.omit (params, this.extractParams (path));
        let paramsSortedEncoded = '';
        if (Object.keys (params).length) {
            paramsSortedEncoded = this.rawencode (this.keysort (params));
            if (method === 'GET') {
                url += '?' + paramsSortedEncoded;
            }
        }
        if (signed) {
            this.checkRequiredCredentials ();
            const signature = this.hmac (this.encode (paramsSortedEncoded), this.encode (this.secret), 'sha256');
            headers = {
                'Cache-Control': 'no-cache',
                'Content-type': 'application/x-www-form-urlencoded',
                'X_ACCESS_KEY': this.apiKey,
                'X_SIGNATURE': signature,
            };
            if (method !== 'GET') {
                body = paramsSortedEncoded;
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return;
        }
        //
        // success
        //
        //   {
        //      "code": "0",
        //      "msg": "success",
        //      "status": 0,
        //      "data": [...],
        //   }
        //
        //
        // action error
        //
        //   {
        //     "code":1005,
        //     "msg":"BKK:Not Enough balance",
        //     "status":0
        //   }
        //
        //
        // HTTP error
        //
        //   {
        //      "timestamp": "1646041085490",
        //      "status": "403",
        //      "error": "Forbidden",
        //      "message": "签名错误",
        //      "path": "/whatever/incorrect/path"
        //   }
        //
        const message = this.safeValue (response, 'msg');
        if (message === 'success') {
            return;
        }
        const responseCode = this.safeString (response, 'code');
        if (responseCode !== '0') {
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions['exact'], responseCode, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], body, feedback);
            throw new ExchangeError (feedback);
        }
    }
};
