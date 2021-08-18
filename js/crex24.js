'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, BadRequest, InvalidNonce, RequestTimeout, ExchangeNotAvailable, InsufficientFunds, OrderNotFound, InvalidOrder, DDoSProtection, AuthenticationError, BadSymbol } = require ('./base/errors');
const { TICK_SIZE } = require ('./base/functions/number');
const Precise = require ('./base/Precise');

//  ---------------------------------------------------------------------------

module.exports = class crex24 extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'crex24',
            'name': 'CREX24',
            'countries': [ 'EE' ], // Estonia
            'rateLimit': 500,
            'version': 'v2',
            // new metainfo interface
            'has': {
                'cancelAllOrders': true,
                'cancelOrder': true,
                'CORS': false,
                'createOrder': true,
                'editOrder': true,
                'fetchBalance': true,
                'fetchBidsAsks': true,
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchDeposits': true,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchOrderTrades': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
                'fetchTradingFee': false, // actually, true, but will be implemented later
                'fetchTradingFees': false, // actually, true, but will be implemented later
                'fetchFundingFees': true,
                'fetchTransactions': true,
                'fetchWithdrawals': true,
                'withdraw': true,
            },
            'timeframes': {
                '1m': '1m',
                '3m': '3m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '4h': '4h',
                '1d': '1d',
                '1w': '1w',
                '1M': '1mo',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/47813922-6f12cc00-dd5d-11e8-97c6-70f957712d47.jpg',
                'api': 'https://api.crex24.com',
                'www': 'https://crex24.com',
                'referral': 'https://crex24.com/?refid=slxsjsjtil8xexl9hksr',
                'doc': 'https://docs.crex24.com/trade-api/v2',
                'fees': 'https://crex24.com/fees',
            },
            'api': {
                'public': {
                    'get': [
                        'currencies',
                        'instruments',
                        'tickers',
                        'recentTrades',
                        'orderBook',
                        'ohlcv',
                        'tradingFeeSchedules',
                        'withdrawalFees',
                        'currencyTransport',
                        'currenciesWithdrawalFees',
                    ],
                },
                'trading': {
                    'get': [
                        'orderStatus',
                        'orderTrades',
                        'activeOrders',
                        'orderHistory',
                        'tradeHistory',
                        'tradingFee',
                        'tradeFee', // The support of this method has been dropped on February 18, 2020. Please, use tradingFee method instead. https://docs.crex24.com/trade-api/v2/#trade-fee-and-rebate-discontinued
                    ],
                    'post': [
                        'placeOrder',
                        'modifyOrder',
                        'cancelOrdersById',
                        'cancelOrdersByInstrument',
                        'cancelAllOrders',
                    ],
                },
                'account': {
                    'get': [
                        'balance',
                        'depositAddress',
                        'moneyTransfers',
                        'moneyTransferStatus',
                        'previewWithdrawal',
                    ],
                    'post': [
                        'withdraw',
                    ],
                },
            },
            'precisionMode': TICK_SIZE,
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'taker': 0.001,
                    'maker': -0.0001,
                },
                // should be deleted, these are outdated and inaccurate
                'funding': {
                    'tierBased': false,
                    'percentage': false,
                    'withdraw': {},
                    'deposit': {},
                },
            },
            'commonCurrencies': {
                'ACM': 'Actinium',
                'BCC': 'BCH',
                'BIT': 'BitMoney',
                'BULL': 'BuySell',
                'CREDIT': 'TerraCredit',
                'EPS': 'Epanus',  // conflict with EPS Ellipsis https://github.com/ccxt/ccxt/issues/8909
                'FUND': 'FUNDChains',
                'GHOST': 'GHOSTPRISM',
                'GTC': 'GastroCoin', // conflict with Gitcoin and Game.com
                'IQ': 'IQ.Cash',
                'PUT': 'PutinCoin',
                'SBTC': 'SBTCT', // SiamBitcoin
                'UNI': 'Universe',
                'YOYO': 'YOYOW',
            },
            // exchange-specific options
            'options': {
                'fetchOrdersMethod': 'tradingGetOrderHistory', // or 'tradingGetActiveOrders'
                'fetchClosedOrdersMethod': 'tradingGetOrderHistory', // or 'tradingGetActiveOrders'
                'fetchTickersMethod': 'publicGetTicker24hr',
                'defaultTimeInForce': 'GTC', // 'GTC' = Good To Cancel (default), 'IOC' = Immediate Or Cancel
                'hasAlreadyAuthenticatedSuccessfully': false,
                'warnOnFetchOpenOrdersWithoutSymbol': true,
                'parseOrderToPrecision': false, // force amounts and costs in parseOrder to precision
                'newOrderRespType': 'RESULT', // 'ACK' for order id, 'RESULT' for full order or 'FULL' for order with fills
            },
            'exceptions': {
                'exact': {
                    "Parameter 'filter' contains invalid value.": BadRequest, // eslint-disable-quotes
                    "Mandatory parameter 'instrument' is missing.": BadRequest, // eslint-disable-quotes
                    "The value of parameter 'till' must be greater than or equal to the value of parameter 'from'.": BadRequest, // eslint-disable-quotes
                    'Failed to verify request signature.': AuthenticationError, // eslint-disable-quotes
                    "Nonce error. Make sure that the value passed in the 'X-CREX24-API-NONCE' header is greater in each consecutive request than in the previous one for the corresponding API-Key provided in 'X-CREX24-API-KEY' header.": InvalidNonce,
                    'Market orders are not supported by the instrument currently.': InvalidOrder,
                    "Parameter 'instrument' contains invalid value.": BadSymbol,
                },
                'broad': {
                    'try again later': ExchangeNotAvailable, // {"errorDescription":"Failed to process the request. Please, try again later."}
                    'API Key': AuthenticationError, // "API Key '9edc48de-d5b0-4248-8e7e-f59ffcd1c7f1' doesn't exist."
                    'Insufficient funds': InsufficientFunds, // "Insufficient funds: new order requires 10 ETH which is more than the available balance."
                    'has been delisted.': BadSymbol, // {"errorDescription":"Instrument '$PAC-BTC' has been delisted."}
                    'is currently suspended.': BadSymbol, // {"errorDescription":"Trading in BITG-BTC is currently suspended."}
                    'Mandatory parameter': BadRequest, // {"errorDescription":"Mandatory parameter 'feeCurrency' is missing."}
                },
            },
        });
    }

    nonce () {
        return this.milliseconds ();
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetInstruments (params);
        //
        //         [ {
        //             "symbol": "$PAC-BTC",
        //             "baseCurrency": "$PAC",
        //             "quoteCurrency": "BTC",
        //             "feeCurrency": "BTC",
        //             "feeSchedule": "OriginalSchedule",
        //             "tickSize": 0.00000001,
        //             "minPrice": 0.00000001,
        //             "maxPrice": 10000000000.0,
        //             "volumeIncrement": 0.00000001,
        //             "minVolume": 1.0,
        //             "maxVolume": 1000000000.0,
        //             "minQuoteVolume": 0.000000000000001,
        //             "maxQuoteVolume": 100000000000.0,
        //             "supportedOrderTypes": [
        //               "limit"
        //             ],
        //             "state": "delisted"
        //           },
        //           {
        //             "symbol": "1INCH-USDT",
        //             "baseCurrency": "1INCH",
        //             "quoteCurrency": "USDT",
        //             "feeCurrency": "USDT",
        //             "feeSchedule": "FeeSchedule10",
        //             "tickSize": 0.0001,
        //             "minPrice": 0.0001,
        //             "maxPrice": 10000000000.0,
        //             "volumeIncrement": 0.00000001,
        //             "minVolume": 0.01,
        //             "maxVolume": 1000000000.0,
        //             "minQuoteVolume": 0.000000000000001,
        //             "maxQuoteVolume": 100000000000.0,
        //             "supportedOrderTypes": [
        //               "limit"
        //             ],
        //             "state": "active"
        //           }, ]
        //
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const market = response[i];
            const id = this.safeString (market, 'symbol');
            const baseId = this.safeString (market, 'baseCurrency');
            const quoteId = this.safeString (market, 'quoteCurrency');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const tickSize = this.safeNumber (market, 'tickSize');
            const minPrice = this.safeNumber (market, 'minPrice');
            const maxPrice = this.safeNumber (market, 'maxPrice');
            const minAmount = this.safeNumber (market, 'minVolume');
            const maxAmount = this.safeNumber (market, 'maxVolume');
            const minCost = this.safeNumber (market, 'minQuoteVolume');
            const maxCost = this.safeNumber (market, 'maxQuoteVolume');
            const precision = {
                'amount': minAmount,
                'price': tickSize,
            };
            const active = (market['state'] === 'active');
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'info': market,
                'active': active,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': minAmount,
                        'max': maxAmount,
                    },
                    'price': {
                        'min': minPrice,
                        'max': maxPrice,
                    },
                    'cost': {
                        'min': minCost,
                        'max': maxCost,
                    },
                },
            });
        }
        return result;
    }

    async fetchCurrencies (params = {}) {
        const response = await this.publicGetCurrencies (params);
        //
        //     [ {                   symbol: "$PAC",
        //                             name: "PACCoin",
        //                           isFiat:  false,
        //                  depositsAllowed:  true,
        //         depositConfirmationCount:  8,
        //                       minDeposit:  0,
        //               withdrawalsAllowed:  true,
        //              withdrawalPrecision:  8,
        //                    minWithdrawal:  4,
        //                    maxWithdrawal:  1000000000,
        //                flatWithdrawalFee:  2,
        //                       isDelisted:  false       },
        //       {                   symbol: "ZZC",
        //                             name: "Zozo",
        //                           isFiat:  false,
        //                  depositsAllowed:  false,
        //         depositConfirmationCount:  8,
        //                       minDeposit:  0,
        //               withdrawalsAllowed:  false,
        //              withdrawalPrecision:  8,
        //                    minWithdrawal:  0.2,
        //                    maxWithdrawal:  1000000000,
        //                flatWithdrawalFee:  0.1,
        //                       isDelisted:  false       } ]
        //
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const currency = response[i];
            const id = this.safeString (currency, 'symbol');
            const code = this.safeCurrencyCode (id);
            const withdrawalPrecision = this.safeInteger (currency, 'withdrawalPrecision');
            const precision = Math.pow (10, -withdrawalPrecision);
            const address = this.safeValue (currency, 'BaseAddress');
            const active = (currency['depositsAllowed'] && currency['withdrawalsAllowed'] && !currency['isDelisted']);
            const type = currency['isFiat'] ? 'fiat' : 'crypto';
            result[code] = {
                'id': id,
                'code': code,
                'address': address,
                'info': currency,
                'type': type,
                'name': this.safeString (currency, 'name'),
                'active': active,
                'fee': this.safeNumber (currency, 'flatWithdrawalFee'), // todo: redesign
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': Math.pow (10, -precision),
                        'max': Math.pow (10, precision),
                    },
                    'deposit': {
                        'min': this.safeNumber (currency, 'minDeposit'),
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': this.safeNumber (currency, 'minWithdrawal'),
                        'max': this.safeNumber (currency, 'maxWithdrawal'),
                    },
                },
            };
        }
        return result;
    }

    async fetchFundingFees (codes = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetCurrenciesWithdrawalFees (params);
        //
        //     [
        //         {
        //             currency: '1INCH',
        //             fees: [
        //                 { feeCurrency: 'BTC', amount: 0.00032 },
        //                 { feeCurrency: 'ETH', amount: 0.0054 },
        //                 { feeCurrency: 'DOGE', amount: 63.06669 },
        //                 { feeCurrency: 'LTC', amount: 0.0912 },
        //                 { feeCurrency: 'BCH', amount: 0.02364 },
        //                 { feeCurrency: 'USDT', amount: 12.717 },
        //                 { feeCurrency: 'USDC', amount: 12.7367 },
        //                 { feeCurrency: 'TRX', amount: 205.99108 },
        //                 { feeCurrency: 'EOS', amount: 3.30141 }
        //             ]
        //         }
        //     ]
        //
        const withdrawFees = {};
        for (let i = 0; i < response.length; i++) {
            const entry = response[i];
            const currencyId = this.safeString (entry, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const networkList = this.safeValue (entry, 'fees');
            withdrawFees[code] = {};
            for (let j = 0; j < networkList.length; j++) {
                const networkEntry = networkList[j];
                const networkId = this.safeString (networkEntry, 'feeCurrency');
                const networkCode = this.safeCurrencyCode (networkId);
                const fee = this.safeNumber (networkEntry, 'amount');
                withdrawFees[code][networkCode] = fee;
            }
        }
        return {
            'withdraw': withdrawFees,
            'deposit': {},
            'info': response,
        };
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const request = {
            // 'currency': 'ETH', // comma-separated list of currency ids
            // 'nonZeroOnly': 'false', // true by default
        };
        const response = await this.accountGetBalance (this.extend (request, params));
        //
        //     [
        //         {
        //           "currency": "ETH",
        //           "available": 0.0,
        //           "reserved": 0.0
        //         }
        //     ]
        //
        const result = { 'info': response };
        for (let i = 0; i < response.length; i++) {
            const balance = response[i];
            const currencyId = this.safeString (balance, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeString (balance, 'available');
            account['used'] = this.safeString (balance, 'reserved');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'instrument': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit; // default = maximum = 100
        }
        const response = await this.publicGetOrderBook (this.extend (request, params));
        //
        //     {  buyLevels: [ { price: 0.03099, volume: 0.00610063 },
        //                     { price: 0.03097, volume: 1.33455158 },
        //                     { price: 0.03096, volume: 0.0830889 },
        //                     { price: 0.03095, volume: 0.0820356 },
        //                     { price: 0.03093, volume: 0.5499419 },
        //                     { price: 0.03092, volume: 0.23317494 },
        //                     { price: 0.03091, volume: 0.62105322 },
        //                     { price: 0.00620041, volume: 0.003 }    ],
        //       sellLevels: [ { price: 0.03117, volume: 5.47492315 },
        //                     { price: 0.03118, volume: 1.97744139 },
        //                     { price: 0.03119, volume: 0.012 },
        //                     { price: 0.03121, volume: 0.741242 },
        //                     { price: 0.03122, volume: 0.96178089 },
        //                     { price: 0.03123, volume: 0.152326 },
        //                     { price: 0.03124, volume: 2.63462933 },
        //                     { price: 0.069, volume: 0.004 }            ] }
        //
        return this.parseOrderBook (response, symbol, undefined, 'buyLevels', 'sellLevels', 'price', 'volume');
    }

    parseTicker (ticker, market = undefined) {
        //
        //       {    instrument: "ZZC-USD",
        //                  last:  0.065,
        //         percentChange:  0,
        //                   low:  0.065,
        //                  high:  0.065,
        //            baseVolume:  0,
        //           quoteVolume:  0,
        //           volumeInBtc:  0,
        //           volumeInUsd:  0,
        //                   ask:  0.5,
        //                   bid:  0.0007,
        //             timestamp: "2018-10-31T09:21:25Z" }   ]
        //
        const timestamp = this.parse8601 (this.safeString (ticker, 'timestamp'));
        const marketId = this.safeString (ticker, 'instrument');
        const symbol = this.safeSymbol (marketId, market, '-');
        const last = this.safeNumber (ticker, 'last');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeNumber (ticker, 'high'),
            'low': this.safeNumber (ticker, 'low'),
            'bid': this.safeNumber (ticker, 'bid'),
            'bidVolume': undefined,
            'ask': this.safeNumber (ticker, 'ask'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined, // previous day close
            'change': undefined,
            'percentage': this.safeNumber (ticker, 'percentChange'),
            'average': undefined,
            'baseVolume': this.safeNumber (ticker, 'baseVolume'),
            'quoteVolume': this.safeNumber (ticker, 'quoteVolume'),
            'info': ticker,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'instrument': market['id'],
        };
        const response = await this.publicGetTickers (this.extend (request, params));
        //
        //     [ {    instrument: "$PAC-BTC",
        //                  last:  3.3e-7,
        //         percentChange:  3.125,
        //                   low:  2.7e-7,
        //                  high:  3.3e-7,
        //            baseVolume:  191700.79823187,
        //           quoteVolume:  0.0587930939346704,
        //           volumeInBtc:  0.0587930939346704,
        //           volumeInUsd:  376.2006339435353,
        //                   ask:  3.3e-7,
        //                   bid:  3.1e-7,
        //             timestamp: "2018-10-31T09:21:25Z" }   ]
        //
        const numTickers = response.length;
        if (numTickers < 1) {
            throw new ExchangeError (this.id + ' fetchTicker could not load quotes for symbol ' + symbol);
        }
        return this.parseTicker (response[0], market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        if (symbols !== undefined) {
            const ids = this.marketIds (symbols);
            request['instrument'] = ids.join (',');
        }
        const response = await this.publicGetTickers (this.extend (request, params));
        //
        //     [ {    instrument: "$PAC-BTC",
        //                  last:  3.3e-7,
        //         percentChange:  3.125,
        //                   low:  2.7e-7,
        //                  high:  3.3e-7,
        //            baseVolume:  191700.79823187,
        //           quoteVolume:  0.0587930939346704,
        //           volumeInBtc:  0.0587930939346704,
        //           volumeInUsd:  376.2006339435353,
        //                   ask:  3.3e-7,
        //                   bid:  3.1e-7,
        //             timestamp: "2018-10-31T09:21:25Z" },
        //       {    instrument: "ZZC-USD",
        //                  last:  0.065,
        //         percentChange:  0,
        //                   low:  0.065,
        //                  high:  0.065,
        //            baseVolume:  0,
        //           quoteVolume:  0,
        //           volumeInBtc:  0,
        //           volumeInUsd:  0,
        //                   ask:  0.5,
        //                   bid:  0.0007,
        //             timestamp: "2018-10-31T09:21:25Z" }   ]
        //
        return this.parseTickers (response, symbols);
    }

    parseTrade (trade, market = undefined) {
        //
        // public fetchTrades
        //
        //       {     price:  0.03105,
        //            volume:  0.11,
        //              side: "sell",
        //         timestamp: "2018-10-31T04:19:35Z" }  ]
        //
        // private fetchMyTrades
        //
        //     {
        //         "id": 3005866,
        //         "orderId": 468533093,
        //         "timestamp": "2018-06-02T16:26:27Z",
        //         "instrument": "BCH-ETH",
        //         "side": "buy",
        //         "price": 1.78882,
        //         "volume": 0.027,
        //         "fee": 0.0000483,
        //         "feeCurrency": "ETH"
        //     }
        //
        const timestamp = this.parse8601 (this.safeString (trade, 'timestamp'));
        const priceString = this.safeString (trade, 'price');
        const amountString = this.safeString (trade, 'volume');
        const price = this.parseNumber (priceString);
        const amount = this.parseNumber (amountString);
        const cost = this.parseNumber (Precise.stringMul (priceString, amountString));
        const id = this.safeString (trade, 'id');
        const side = this.safeString (trade, 'side');
        const orderId = this.safeString (trade, 'orderId');
        const marketId = this.safeString (trade, 'instrument');
        const symbol = this.safeSymbol (marketId, market, '-');
        let fee = undefined;
        const feeCurrencyId = this.safeString (trade, 'feeCurrency');
        const feeCode = this.safeCurrencyCode (feeCurrencyId);
        const feeCost = this.safeNumber (trade, 'fee');
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'currency': feeCode,
            };
        }
        const takerOrMaker = undefined;
        return {
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
            'cost': cost,
            'amount': amount,
            'fee': fee,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'instrument': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit; // min 1, max 1000, default 100
        }
        const response = await this.publicGetRecentTrades (this.extend (request, params));
        //
        //     [ {     price:  0.03117,
        //            volume:  0.02597403,
        //              side: "buy",
        //         timestamp: "2018-10-31T09:37:46Z" },
        //       {     price:  0.03105,
        //            volume:  0.11,
        //              side: "sell",
        //         timestamp: "2018-10-31T04:19:35Z" }  ]
        //
        return this.parseTrades (response, market, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        //     {
        //         timestamp: '2019-09-21T10:36:00Z',
        //         open: 0.02152,
        //         high: 0.02156,
        //         low: 0.02152,
        //         close: 0.02156,
        //         volume: 0.01741259
        //     }
        //
        return [
            this.parse8601 (this.safeString (ohlcv, 'timestamp')),
            this.safeNumber (ohlcv, 'open'),
            this.safeNumber (ohlcv, 'high'),
            this.safeNumber (ohlcv, 'low'),
            this.safeNumber (ohlcv, 'close'),
            this.safeNumber (ohlcv, 'volume'),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'granularity': this.timeframes[timeframe],
            'instrument': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit; // Accepted values: 1 - 1000. If the parameter is not specified, the number of results is limited to 100
        }
        const response = await this.publicGetOhlcv (this.extend (request, params));
        //
        //     [
        //         {
        //             "timestamp": "2020-06-06T17:36:00Z",
        //             "open": 0.025,
        //             "high": 0.025,
        //             "low": 0.02499,
        //             "close": 0.02499,
        //             "volume": 0.00643127
        //         }
        //     ]
        //
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    parseOrderStatus (status) {
        const statuses = {
            'submitting': 'open', // A newly created limit order has a status "submitting" until it has been processed.
            // This status changes during the lifetime of an order and can have different values depending on the value of the parameter Time In Force.
            'unfilledActive': 'open', // order is active, no trades have been made
            'partiallyFilledActive': 'open', // part of the order has been filled, the other part is active
            'filled': 'closed', // order has been filled entirely
            'partiallyFilledCancelled': 'canceled', // part of the order has been filled, the other part has been cancelled either by the trader or by the system (see the value of cancellationReason of an Order for more details on the reason of cancellation)
            'unfilledCancelled': 'canceled', // order has been cancelled, no trades have taken place (see the value of cancellationReason of an Order for more details on the reason of cancellation)
        };
        return (status in statuses) ? statuses[status] : status;
    }

    parseOrder (order, market = undefined) {
        //
        // createOrder
        //
        //     {
        //         "id": 469594855,
        //         "timestamp": "2018-06-08T16:59:44Z",
        //         "instrument": "BTS-BTC",
        //         "side": "buy",
        //         "type": "limit",
        //         "status": "submitting",
        //         "cancellationReason": null,
        //         "timeInForce": "GTC",
        //         "volume": 4.0,
        //         "price": 0.000025,
        //         "stopPrice": null,
        //         "remainingVolume": 4.0,
        //         "lastUpdate": null,
        //         "parentOrderId": null,
        //         "childOrderId": null
        //     }
        //
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const marketId = this.safeString (order, 'instrument');
        const symbol = this.safeSymbol (marketId, market, '-');
        const timestamp = this.parse8601 (this.safeString (order, 'timestamp'));
        const price = this.safeNumber (order, 'price');
        const amount = this.safeNumber (order, 'volume');
        const remaining = this.safeNumber (order, 'remainingVolume');
        const lastTradeTimestamp = this.parse8601 (this.safeString (order, 'lastUpdate'));
        const id = this.safeString (order, 'id');
        const type = this.safeString (order, 'type');
        const side = this.safeString (order, 'side');
        const fee = undefined;
        const trades = undefined;
        const average = undefined;
        const timeInForce = this.safeString (order, 'timeInForce');
        const stopPrice = this.safeNumber (order, 'stopPrice');
        return this.safeOrder ({
            'info': order,
            'id': id,
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'symbol': symbol,
            'type': type,
            'timeInForce': timeInForce,
            'side': side,
            'price': price,
            'stopPrice': stopPrice,
            'amount': amount,
            'cost': undefined,
            'average': average,
            'filled': undefined,
            'remaining': remaining,
            'status': status,
            'fee': fee,
            'trades': trades,
        });
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'instrument': market['id'],
            'volume': this.amountToPrecision (symbol, amount),
            // The value must comply with the list of order types supported by the instrument (see the value of parameter supportedOrderTypes of the Instrument)
            // If the parameter is not specified, the default value "limit" is used
            // More about order types in the corresponding section of documentation
            'type': type, // 'limit', 'market', 'stopLimit', in fact as of 2018-10-31, only 'limit' orders are supported for all markets
            'side': side, // 'buy' or 'sell'
            // "GTC" - Good-Til-Cancelled
            // "IOC" - Immediate-Or-Cancel (currently not supported by the exchange API, reserved for future use)
            // "FOK" - Fill-Or-Kill (currently not supported by the exchange API, reserved for future use)
            // 'timeInForce': 'GTC', // IOC', 'FOK'
            // 'strictValidation': false, // false - prices will be rounded to meet the requirement, true - execution of the method will be aborted and an error message will be returned
        };
        let priceIsRequired = false;
        let stopPriceIsRequired = false;
        if (type === 'limit') {
            priceIsRequired = true;
        } else if (type === 'stopLimit') {
            priceIsRequired = true;
            stopPriceIsRequired = true;
        }
        if (priceIsRequired) {
            if (price === undefined) {
                throw new InvalidOrder (this.id + ' createOrder() requires a price argument for a ' + type + ' order');
            }
            request['price'] = this.priceToPrecision (symbol, price);
        }
        if (stopPriceIsRequired) {
            const stopPrice = this.safeNumber (params, 'stopPrice');
            if (stopPrice === undefined) {
                throw new InvalidOrder (this.id + ' createOrder() requires a stopPrice extra param for a ' + type + ' order');
            } else {
                request['stopPrice'] = this.priceToPrecision (symbol, stopPrice);
            }
            params = this.omit (params, 'stopPrice');
        }
        const response = await this.tradingPostPlaceOrder (this.extend (request, params));
        //
        //     {
        //         "id": 469594855,
        //         "timestamp": "2018-06-08T16:59:44Z",
        //         "instrument": "BTS-BTC",
        //         "side": "buy",
        //         "type": "limit",
        //         "status": "submitting",
        //         "cancellationReason": null,
        //         "timeInForce": "GTC",
        //         "volume": 4.0,
        //         "price": 0.000025,
        //         "stopPrice": null,
        //         "remainingVolume": 4.0,
        //         "lastUpdate": null,
        //         "parentOrderId": null,
        //         "childOrderId": null
        //     }
        //
        return this.parseOrder (response, market);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'id': id,
        };
        const response = await this.tradingGetOrderStatus (this.extend (request, params));
        //
        //     [
        //         {
        //           "id": 466747915,
        //           "timestamp": "2018-05-26T06:43:49Z",
        //           "instrument": "UNI-BTC",
        //           "side": "sell",
        //           "type": "limit",
        //           "status": "partiallyFilledActive",
        //           "cancellationReason": null,
        //           "timeInForce": "GTC",
        //           "volume": 5700.0,
        //           "price": 0.000005,
        //           "stopPrice": null,
        //           "remainingVolume": 1.948051948052,
        //           "lastUpdate": null,
        //           "parentOrderId": null,
        //           "childOrderId": null
        //         }
        //     ]
        //
        const numOrders = response.length;
        if (numOrders < 1) {
            throw new OrderNotFound (this.id + ' fetchOrder could not fetch order id ' + id);
        }
        return this.parseOrder (response[0]);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        if (since !== undefined) {
            request['from'] = this.ymdhms (since, 'T');
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (symbol !== undefined) {
            const market = this.market (symbol);
            request['instrument'] = market['id'];
        }
        const method = this.safeString (this.options, 'fetchOrdersMethod', 'tradingGetOrderHistory');
        const response = await this[method] (this.extend (request, params));
        //
        //     [
        //         {
        //             "id": 468535711,
        //             "timestamp": "2018-06-02T16:42:40Z",
        //             "instrument": "BTC-EUR",
        //             "side": "sell",
        //             "type": "limit",
        //             "status": "submitting",
        //             "cancellationReason": null,
        //             "timeInForce": "GTC",
        //             "volume": 0.00770733,
        //             "price": 6724.9,
        //             "stopPrice": null,
        //             "remainingVolume": 0.00770733,
        //             "lastUpdate": "2018-06-02T16:42:40Z",
        //             "parentOrderId": null,
        //             "childOrderId": null
        //         }
        //     ]
        //
        return this.parseOrders (response);
    }

    async fetchOrdersByIds (ids = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'id': ids.join (','),
        };
        const response = await this.tradingGetOrderStatus (this.extend (request, params));
        //
        //     [
        //         {
        //           "id": 466747915,
        //           "timestamp": "2018-05-26T06:43:49Z",
        //           "instrument": "UNI-BTC",
        //           "side": "sell",
        //           "type": "limit",
        //           "status": "partiallyFilledActive",
        //           "cancellationReason": null,
        //           "timeInForce": "GTC",
        //           "volume": 5700.0,
        //           "price": 0.000005,
        //           "stopPrice": null,
        //           "remainingVolume": 1.948051948052,
        //           "lastUpdate": null,
        //           "parentOrderId": null,
        //           "childOrderId": null
        //         }
        //     ]
        //
        return this.parseOrders (response, undefined, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        const request = {};
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['instrument'] = market['id'];
        }
        const response = await this.tradingGetActiveOrders (this.extend (request, params));
        //
        //     [
        //         {
        //             "id": 466747915,
        //             "timestamp": "2018-05-26T06:43:49Z",
        //             "instrument": "UNI-BTC",
        //             "side": "sell",
        //             "type": "limit",
        //             "status": "partiallyFilledActive",
        //             "cancellationReason": null,
        //             "timeInForce": "GTC",
        //             "volume": 5700.0,
        //             "price": 0.000005,
        //             "stopPrice": null,
        //             "remainingVolume": 1.948051948052,
        //             "lastUpdate": null,
        //             "parentOrderId": null,
        //             "childOrderId": null
        //         },
        //         {
        //             "id": 466748077,
        //             "timestamp": "2018-05-26T06:45:29Z",
        //             "instrument": "PRJ-BTC",
        //             "side": "sell",
        //             "type": "limit",
        //             "status": "partiallyFilledActive",
        //             "cancellationReason": null,
        //             "timeInForce": "GTC",
        //             "volume": 10000.0,
        //             "price": 0.0000007,
        //             "stopPrice": null,
        //             "remainingVolume": 9975.0,
        //             "lastUpdate": null,
        //             "parentOrderId": null,
        //             "childOrderId": null
        //         },
        //         ...
        //     ]
        //
        return this.parseOrders (response, market, since, limit);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        const request = {};
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['instrument'] = market['id'];
        }
        if (since !== undefined) {
            request['from'] = this.ymdhms (since, 'T');
        }
        if (limit !== undefined) {
            request['limit'] = limit; // min 1, max 1000, default 100
        }
        const method = this.safeString (this.options, 'fetchClosedOrdersMethod', 'tradingGetOrderHistory');
        const response = await this[method] (this.extend (request, params));
        //     [
        //         {
        //             "id": 468535711,
        //             "timestamp": "2018-06-02T16:42:40Z",
        //             "instrument": "BTC-EUR",
        //             "side": "sell",
        //             "type": "limit",
        //             "status": "submitting",
        //             "cancellationReason": null,
        //             "timeInForce": "GTC",
        //             "volume": 0.00770733,
        //             "price": 6724.9,
        //             "stopPrice": null,
        //             "remainingVolume": 0.00770733,
        //             "lastUpdate": null,
        //             "parentOrderId": null,
        //             "childOrderId": null
        //         },
        //         {
        //             "id": 468535707,
        //             "timestamp": "2018-06-02T16:42:37Z",
        //             "instrument": "BTG-BTC",
        //             "side": "buy",
        //             "type": "limit",
        //             "status": "unfilledActive",
        //             "cancellationReason": null,
        //             "timeInForce": "GTC",
        //             "volume": 0.0173737,
        //             "price": 0.00589027,
        //             "stopPrice": null,
        //             "remainingVolume": 0.0173737,
        //             "lastUpdate": null,
        //             "parentOrderId": null,
        //             "childOrderId": null
        //         },
        //         ...
        //     ]
        //
        return this.parseOrders (response, market, since, limit);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'ids': [
                parseInt (id),
            ],
        };
        const response = await this.tradingPostCancelOrdersById (this.extend (request, params));
        //
        //     [
        //         465448358,
        //         468364313
        //     ]
        //
        return this.parseOrder (response);
    }

    async cancelAllOrders (symbol = undefined, params = {}) {
        const response = await this.tradingPostCancelAllOrders (params);
        //
        //     [
        //         465448358,
        //         468364313
        //     ]
        //
        return response;
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        const request = {};
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['instrument'] = market['id'];
        }
        if (since !== undefined) {
            request['from'] = this.ymdhms (since, 'T');
        }
        if (limit !== undefined) {
            request['limit'] = limit; // min 1, max 1000, default 100
        }
        const response = await this.tradingGetTradeHistory (this.extend (request, params));
        //
        //     [
        //         {
        //             "id": 3005866,
        //             "orderId": 468533093,
        //             "timestamp": "2018-06-02T16:26:27Z",
        //             "instrument": "BCH-ETH",
        //             "side": "buy",
        //             "price": 1.78882,
        //             "volume": 0.027,
        //             "fee": 0.0000483,
        //             "feeCurrency": "ETH"
        //         },
        //         {
        //             "id": 3005812,
        //             "orderId": 468515771,
        //             "timestamp": "2018-06-02T16:16:05Z",
        //             "instrument": "ETC-BTC",
        //             "side": "sell",
        //             "price": 0.00210958,
        //             "volume": 0.05994006,
        //             "fee": -0.000000063224,
        //             "feeCurrency": "BTC"
        //         },
        //         ...
        //     ]
        //
        return this.parseTrades (response, market, since, limit);
    }

    async fetchTransactions (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let currency = undefined;
        const request = {};
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['id'];
        }
        if (since !== undefined) {
            request['from'] = this.ymd (since, 'T');
        }
        const response = await this.accountGetMoneyTransfers (this.extend (request, params));
        //
        //     [
        //         {
        //           "id": 756446,
        //           "type": "deposit",
        //           "currency": "ETH",
        //           "address": "0x451d5a1b7519aa75164f440df78c74aac96023fe",
        //           "paymentId": null,
        //           "amount": 0.142,
        //           "fee": null,
        //           "txId": "0x2b49098749840a9482c4894be94f94864b498a1306b6874687a5640cc9871918",
        //           "createdAt": "2018-06-02T19:30:28Z",
        //           "processedAt": "2018-06-02T21:10:41Z",
        //           "confirmationsRequired": 12,
        //           "confirmationCount": 12,
        //           "status": "success",
        //           "errorDescription": null
        //         },
        //         {
        //           "id": 754618,
        //           "type": "deposit",
        //           "currency": "BTC",
        //           "address": "1IgNfmERVcier4IhfGEfutkLfu4AcmeiUC",
        //           "paymentId": null,
        //           "amount": 0.09,
        //           "fee": null,
        //           "txId": "6876541687a9187e987c9187654f7198b9718af974641687b19a87987f91874f",
        //           "createdAt": "2018-06-02T16:19:44Z",
        //           "processedAt": "2018-06-02T16:20:50Z",
        //           "confirmationsRequired": 1,
        //           "confirmationCount": 1,
        //           "status": "success",
        //           "errorDescription": null
        //         },
        //         ...
        //     ]
        //
        return this.parseTransactions (response, currency, since, limit);
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'type': 'deposit',
        };
        return this.fetchTransactions (code, since, limit, this.extend (request, params));
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'type': 'withdrawal',
        };
        return this.fetchTransactions (code, since, limit, this.extend (request, params));
    }

    parseTransactionStatus (status) {
        const statuses = {
            'pending': 'pending', // transfer is in progress
            'success': 'ok', // completed successfully
            'failed': 'failed', // aborted at some point (money will be credited back to the account of origin)
        };
        return this.safeString (statuses, status, status);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        //     {
        //         "id": 756446,
        //         "type": "deposit",
        //         "currency": "ETH",
        //         "address": "0x451d5a1b7519aa75164f440df78c74aac96023fe",
        //         "paymentId": null,
        //         "amount": 0.142,
        //         "fee": null,
        //         "txId": "0x2b49098749840a9482c4894be94f94864b498a1306b6874687a5640cc9871918",
        //         "createdAt": "2018-06-02T19:30:28Z",
        //         "processedAt": "2018-06-02T21:10:41Z",
        //         "confirmationsRequired": 12,
        //         "confirmationCount": 12,
        //         "status": "success",
        //         "errorDescription": null,
        //     }
        //
        const id = this.safeString (transaction, 'id');
        const address = this.safeString (transaction, 'address');
        const tag = this.safeString (transaction, 'paymentId');
        const txid = this.safeValue (transaction, 'txId');
        const currencyId = this.safeString (transaction, 'currency');
        const code = this.safeCurrencyCode (currencyId, currency);
        const type = this.safeString (transaction, 'type');
        const timestamp = this.parse8601 (this.safeString (transaction, 'createdAt'));
        const updated = this.parse8601 (this.safeString (transaction, 'processedAt'));
        const status = this.parseTransactionStatus (this.safeString (transaction, 'status'));
        const amount = this.safeNumber (transaction, 'amount');
        const feeCost = this.safeNumber (transaction, 'fee');
        const fee = {
            'cost': feeCost,
            'currency': code,
        };
        return {
            'info': transaction,
            'id': id,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'address': address,
            'tag': tag,
            'type': type,
            'amount': amount,
            'currency': code,
            'status': status,
            'updated': updated,
            'fee': fee,
        };
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
        };
        const response = await this.accountGetDepositAddress (this.extend (request, params));
        //
        //     {
        //         "currency": "BTS",
        //         "address": "crex24",
        //         "paymentId": "0fg4da4186741579"
        //     }
        //
        const address = this.safeString (response, 'address');
        const tag = this.safeString (response, 'paymentId');
        return {
            'currency': code,
            'address': this.checkAddress (address),
            'tag': tag,
            'info': response,
        };
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
            'address': address,
            'amount': parseFloat (this.currencyToPrecision (code, amount)),
            // sets whether the specified amount includes fee, can have either of the two values
            // true - balance will be decreased by amount, whereas [amount - fee] will be transferred to the specified address
            // false - amount will be deposited to the specified address, whereas the balance will be decreased by [amount + fee]
            // 'includeFee': false, // the default value is false
            'feeCurrency': currency['id'], // https://github.com/ccxt/ccxt/issues/7544
        };
        if (tag !== undefined) {
            request['paymentId'] = tag;
        }
        const response = await this.accountPostWithdraw (this.extend (request, params));
        return this.parseTransaction (response);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let request = '/' + this.version + '/' + api + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (method === 'GET') {
            if (Object.keys (query).length) {
                request += '?' + this.urlencode (query);
            }
        }
        const url = this.urls['api'] + request;
        if ((api === 'trading') || (api === 'account')) {
            this.checkRequiredCredentials ();
            const nonce = this.nonce ().toString ();
            const secret = this.base64ToBinary (this.secret);
            let auth = request + nonce;
            headers = {
                'X-CREX24-API-KEY': this.apiKey,
                'X-CREX24-API-NONCE': nonce,
            };
            if (method === 'POST') {
                headers['Content-Type'] = 'application/json';
                body = this.json (params);
                auth += body;
            }
            headers['X-CREX24-API-SIGN'] = this.hmac (this.encode (auth), secret, 'sha512', 'base64');
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (!this.isJsonEncodedObject (body)) {
            return; // fallback to default error handler
        }
        if ((code >= 200) && (code < 300)) {
            return; // no error
        }
        const message = this.safeString (response, 'errorDescription');
        const feedback = this.id + ' ' + body;
        this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
        this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
        if (code === 400) {
            throw new BadRequest (feedback);
        } else if (code === 401) {
            throw new AuthenticationError (feedback);
        } else if (code === 403) {
            throw new AuthenticationError (feedback);
        } else if (code === 429) {
            throw new DDoSProtection (feedback);
        } else if (code === 500) {
            throw new ExchangeError (feedback);
        } else if (code === 503) {
            throw new ExchangeNotAvailable (feedback);
        } else if (code === 504) {
            throw new RequestTimeout (feedback);
        }
        throw new ExchangeError (feedback); // unknown message
    }
};
