'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, BadRequest, InvalidNonce, RequestTimeout, ExchangeNotAvailable, InsufficientFunds, OrderNotFound, InvalidOrder, DDoSProtection, AuthenticationError, BadSymbol } = require ('./base/errors');

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
                'CORS': false,
                'editOrder': true,
                'fetchBidsAsks': true,
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchDeposits': true,
                'fetchFundingFees': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchOrderTrades': true,
                'fetchTickers': true,
                'fetchTradingFee': false, // actually, true, but will be implemented later
                'fetchTradingFees': false, // actually, true, but will be implemented later
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
                    ],
                },
                'trading': {
                    'get': [
                        'orderStatus',
                        'orderTrades',
                        'activeOrders',
                        'orderHistory',
                        'tradeHistory',
                        'tradeFee',
                        // this is in trading API according to their docs, but most likely a typo in their docs
                        'moneyTransferStatus',
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
                        // this is in trading API according to their docs, but most likely a typo in their docs
                        'moneyTransferStatus',
                        'previewWithdrawal',
                    ],
                    'post': [
                        'withdraw',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'taker': 0.001,
                    'maker': -0.01,
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
                'YOYO': 'YOYOW',
                'BCC': 'BCH',
            },
            // exchange-specific options
            'options': {
                'fetchOrdersMethod': 'tradingGetOrderHistory', // or 'tradingGetActiveOrders'
                'fetchClosedOrdersMethod': 'tradingGetOrderHistory', // or 'tradingGetActiveOrders'
                'fetchTickersMethod': 'publicGetTicker24hr',
                'defaultTimeInForce': 'GTC', // 'GTC' = Good To Cancel (default), 'IOC' = Immediate Or Cancel
                'defaultLimitOrderType': 'limit', // or 'limit_maker'
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
                },
                'broad': {
                    'API Key': AuthenticationError, // "API Key '9edc48de-d5b0-4248-8e7e-f59ffcd1c7f1' doesn't exist."
                    'Insufficient funds': InsufficientFunds, // "Insufficient funds: new order requires 10 ETH which is more than the available balance."
                    'has been delisted.': BadSymbol, // {"errorDescription":"Instrument '$PAC-BTC' has been delisted."}
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
        //     [ {              symbol:   "$PAC-BTC",
        //                baseCurrency:   "$PAC",
        //               quoteCurrency:   "BTC",
        //                 feeCurrency:   "BTC",
        //                    tickSize:    1e-8,
        //                    minPrice:    1e-8,
        //                   minVolume:    1,
        //         supportedOrderTypes: ["limit"],
        //                       state:   "active"    },
        //       {              symbol:   "ZZC-USD",
        //                baseCurrency:   "ZZC",
        //               quoteCurrency:   "USD",
        //                 feeCurrency:   "USD",
        //                    tickSize:    0.0001,
        //                    minPrice:    0.0001,
        //                   minVolume:    1,
        //         supportedOrderTypes: ["limit"],
        //                       state:   "active"   }        ]
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
            const tickSize = this.safeValue (market, 'tickSize');
            const minPrice = this.safeValue (market, 'minPrice');
            const minAmount = this.safeFloat (market, 'minVolume');
            const precision = {
                'amount': this.precisionFromString (this.numberToString (minAmount)),
                'price': this.precisionFromString (this.numberToString (tickSize)),
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
                        'max': undefined,
                    },
                    'price': {
                        'min': minPrice,
                        'max': undefined,
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
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
            const precision = this.safeInteger (currency, 'withdrawalPrecision');
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
                'fee': this.safeFloat (currency, 'flatWithdrawalFee'), // todo: redesign
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': Math.pow (10, -precision),
                        'max': Math.pow (10, precision),
                    },
                    'price': {
                        'min': Math.pow (10, -precision),
                        'max': Math.pow (10, precision),
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'deposit': {
                        'min': this.safeFloat (currency, 'minDeposit'),
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': this.safeFloat (currency, 'minWithdrawal'),
                        'max': this.safeFloat (currency, 'maxWithdrawal'),
                    },
                },
            };
        }
        return result;
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
        // const log = require ('ololog').unlimited.green;
        // log (response);
        // process.exit ();
        const result = { 'info': response };
        for (let i = 0; i < response.length; i++) {
            const balance = response[i];
            const currencyId = this.safeString (balance, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeFloat (balance, 'available');
            account['used'] = this.safeFloat (balance, 'reserved');
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
        return this.parseOrderBook (response, undefined, 'buyLevels', 'sellLevels', 'price', 'volume');
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
        let symbol = undefined;
        const marketId = this.safeString (ticker, 'instrument');
        market = this.safeValue (this.markets_by_id, marketId, market);
        if (market !== undefined) {
            symbol = market['symbol'];
        } else if (marketId !== undefined) {
            const [ baseId, quoteId ] = marketId.split ('-');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            symbol = base + '/' + quote;
        }
        const last = this.safeFloat (ticker, 'last');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': this.safeFloat (ticker, 'bid'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'ask'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined, // previous day close
            'change': undefined,
            'percentage': this.safeFloat (ticker, 'percentChange'),
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'baseVolume'),
            'quoteVolume': this.safeFloat (ticker, 'quoteVolume'),
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

    parseTickers (tickers, symbols = undefined) {
        const result = [];
        for (let i = 0; i < tickers.length; i++) {
            result.push (this.parseTicker (tickers[i]));
        }
        return this.filterByArray (result, 'symbol', symbols);
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
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'volume');
        let cost = undefined;
        if (price !== undefined) {
            if (amount !== undefined) {
                cost = amount * price;
            }
        }
        const id = this.safeString (trade, 'id');
        const side = this.safeString (trade, 'side');
        const orderId = this.safeString (trade, 'orderId');
        let symbol = undefined;
        const marketId = this.safeString (trade, 'instrument');
        market = this.safeValue (this.markets_by_id, marketId, market);
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        let fee = undefined;
        const feeCurrencyId = this.safeString (trade, 'feeCurrency');
        const feeCode = this.safeCurrencyCode (feeCurrencyId);
        const feeCost = this.safeFloat (trade, 'fee');
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

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        // { timestamp: '2019-09-21T10:36:00Z',
        //     open: 0.02152,
        //     high: 0.02156,
        //     low: 0.02152,
        //     close: 0.02156,
        //     volume: 0.01741259 }
        const date = this.safeString (ohlcv, 'timestamp');
        const timestamp = this.parse8601 (date);
        return [
            timestamp,
            this.safeFloat (ohlcv, 'open'),
            this.safeFloat (ohlcv, 'high'),
            this.safeFloat (ohlcv, 'low'),
            this.safeFloat (ohlcv, 'close'),
            this.safeFloat (ohlcv, 'volume'),
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
        const symbol = this.findSymbol (this.safeString (order, 'instrument'), market);
        const timestamp = this.parse8601 (this.safeString (order, 'timestamp'));
        let price = this.safeFloat (order, 'price');
        const amount = this.safeFloat (order, 'volume');
        const remaining = this.safeFloat (order, 'remainingVolume');
        let filled = undefined;
        const lastTradeTimestamp = this.parse8601 (this.safeString (order, 'lastUpdate'));
        let cost = undefined;
        if (remaining !== undefined) {
            if (amount !== undefined) {
                filled = amount - remaining;
                if (this.options['parseOrderToPrecision']) {
                    filled = parseFloat (this.amountToPrecision (symbol, filled));
                }
                filled = Math.max (filled, 0.0);
                if (price !== undefined) {
                    cost = price * filled;
                }
            }
        }
        const id = this.safeString (order, 'id');
        const type = this.safeString (order, 'type');
        if (type === 'market') {
            if (price === 0.0) {
                if ((cost !== undefined) && (filled !== undefined)) {
                    if ((cost > 0) && (filled > 0)) {
                        price = cost / filled;
                    }
                }
            }
        }
        const side = this.safeString (order, 'side');
        const fee = undefined;
        const trades = undefined;
        let average = undefined;
        if (cost !== undefined) {
            if (filled) {
                average = cost / filled;
            }
            if (this.options['parseOrderToPrecision']) {
                cost = parseFloat (this.costToPrecision (symbol, cost));
            }
        }
        return {
            'info': order,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'average': average,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': fee,
            'trades': trades,
        };
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
                throw new InvalidOrder (this.id + ' createOrder method requires a price argument for a ' + type + ' order');
            }
            request['price'] = this.priceToPrecision (symbol, price);
        }
        if (stopPriceIsRequired) {
            const stopPrice = this.safeFloat (params, 'stopPrice');
            if (stopPrice === undefined) {
                throw new InvalidOrder (this.id + ' createOrder method requires a stopPrice extra param for a ' + type + ' order');
            } else {
                request['stopPrice'] = this.priceToPrecision (symbol, stopPrice);
            }
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
        const amount = this.safeFloat (transaction, 'amount');
        const feeCost = this.safeFloat (transaction, 'fee');
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
            const signature = this.stringToBase64 (this.hmac (this.encode (auth), secret, 'sha512', 'binary'));
            headers['X-CREX24-API-SIGN'] = this.decode (signature);
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
        const feedback = this.id + ' ' + this.json (response);
        const exact = this.exceptions['exact'];
        if (message in exact) {
            throw new exact[message] (feedback);
        }
        const broad = this.exceptions['broad'];
        const broadKey = this.findBroadlyMatchedKey (broad, message);
        if (broadKey !== undefined) {
            throw new broad[broadKey] (feedback);
        }
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
