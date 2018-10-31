'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired, ExchangeNotAvailable, InsufficientFunds, OrderNotFound, InvalidOrder, DDoSProtection, InvalidNonce, AuthenticationError } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class crex24 extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'crex24',
            'name': 'CREX24',
            'countries': [ 'EE' ], // Estonia
            'rateLimit': 500,
            'certified': true,
            'version': 'v2',
            // new metainfo interface
            'has': {
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'CORS': false,
                'fetchBidsAsks': true,
                'fetchTickers': true,
                'fetchOHLCV': false,
                'fetchMyTrades': true,
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
                'withdraw': true,
                'fetchTradingFees': false, // actually, true, but will be implemented later
                'fetchFundingFees': false,
                'fetchDeposits': true,
                'fetchWithdrawals': true,
                'fetchTransactions': true,
                'fetchOrderTrades': true,
                'editOrder': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/29604020-d5483cdc-87ee-11e7-94c7-d1a8d9169293.jpg',
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
                    ],
                },
                'trading': {
                    'get': [
                        'orderStatus',
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
                'fetchTickersMethod': 'publicGetTicker24hr',
                'defaultTimeInForce': 'GTC', // 'GTC' = Good To Cancel (default), 'IOC' = Immediate Or Cancel
                'defaultLimitOrderType': 'limit', // or 'limit_maker'
                'hasAlreadyAuthenticatedSuccessfully': false,
                'warnOnFetchOpenOrdersWithoutSymbol': true,
                'parseOrderToPrecision': false, // force amounts and costs in parseOrder to precision
                'newOrderRespType': 'RESULT', // 'ACK' for order id, 'RESULT' for full order or 'FULL' for order with fills
            },
            'exceptions': {
                '-1000': ExchangeNotAvailable, // {"code":-1000,"msg":"An unknown error occured while processing the request."}
                '-1013': InvalidOrder, // createOrder -> 'invalid quantity'/'invalid price'/MIN_NOTIONAL
                '-1021': InvalidNonce, // 'your time is ahead of server'
                '-1022': AuthenticationError, // {"code":-1022,"msg":"Signature for this request is not valid."}
                '-1100': InvalidOrder, // createOrder(symbol, 1, asdf) -> 'Illegal characters found in parameter 'price'
                '-1104': ExchangeError, // Not all sent parameters were read, read 8 parameters but was sent 9
                '-1128': ExchangeError, // {"code":-1128,"msg":"Combination of optional parameters invalid."}
                '-2010': ExchangeError, // generic error code for createOrder -> 'Account has insufficient balance for requested action.', {"code":-2010,"msg":"Rest API trading is not enabled."}, etc...
                '-2011': OrderNotFound, // cancelOrder(1, 'BTC/USDT') -> 'UNKNOWN_ORDER'
                '-2013': OrderNotFound, // fetchOrder (1, 'BTC/USDT') -> 'Order does not exist'
                '-2014': AuthenticationError, // { "code":-2014, "msg": "API-key format invalid." }
                '-2015': AuthenticationError, // "Invalid API-key, IP, or permissions for action."
            },
        });
    }

    nonce () {
        return this.milliseconds ();
    }

    async fetchMarkets () {
        let response = await this.publicGetInstruments ();
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
        let result = [];
        for (let i = 0; i < response.length; i++) {
            let market = response[i];
            let id = market['symbol'];
            let baseId = market['baseCurrency'];
            let quoteId = market['quoteCurrency'];
            let base = this.commonCurrencyCode (baseId);
            let quote = this.commonCurrencyCode (quoteId);
            let symbol = base + '/' + quote;
            let precision = {
                'amount': this.precisionFromString (this.truncate_to_string (market['tickSize'], 8)),
                'price': this.precisionFromString (this.truncate_to_string (market['minPrice'], 8)),
            };
            let active = (market['state'] === 'active');
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
                        'min': this.safeFloat (market, 'minVolume'),
                        'max': undefined,
                    },
                    'price': {
                        'min': Math.pow (10, -precision['price']),
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
        let response = await this.publicGetCurrencies (params);
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
        let result = {};
        for (let i = 0; i < response.length; i++) {
            let currency = response[i];
            let id = currency['symbol'];
            let code = this.commonCurrencyCode (id);
            let precision = this.safeInteger (currency, 'withdrawalPrecision');
            let address = this.safeValue (currency, 'BaseAddress');
            let active = (currency['depositsAllowed'] && currency['withdrawalsAllowed'] && !currency['isDelisted']);
            let type = currency['isFiat'] ? 'fiat' : 'crypto';
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
        let request = {
            // 'currency': 'ETH', // comma-separated list of currency ids
            // 'nonZeroOnly': 'false', // true by default
        };
        let response = await this.accountGetBalance (this.extend (request, params));
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
        let result = { 'info': response };
        for (let i = 0; i < response.length; i++) {
            let balance = response[i];
            let currencyId = this.safeString (balance, 'currency');
            let code = currencyId;
            if (currencyId in this.currencies_by_id) {
                code = this.currencies_by_id[currencyId]['code'];
            } else {
                code = this.commonCurrencyCode (code);
            };
            let free = this.safeFloat (balance, 'available');
            let used = this.safeFloat (balance, 'reserved');
            let total = this.sum (free, used);
            result[code] = {
                'free': free,
                'used': used,
                'total': total,
            };
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'instrument': market['id'],
        };
        if (limit !== undefined)
            request['limit'] = limit; // default = maximum = 100
        let response = await this.publicGetOrderBook (this.extend (request, params));
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
        let timestamp = this.parse8601 (ticker['timestamp']);
        let symbol = undefined;
        let marketId = this.safeString (ticker, 'instrument');
        market = this.safeValue (this.markets_by_id, marketId, market);
        if (market !== undefined) {
            symbol = market['symbol'];
        } else if (marketId !== undefined) {
            let [ baseId, quoteId ] = marketId.split ('-');
            let base = this.commonCurrencyCode (baseId);
            let quote = this.commonCurrencyCode (quoteId);
            symbol = base + '/' + quote;
        }
        let last = this.safeFloat (ticker, 'last');
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
        let market = this.market (symbol);
        let request = {
            'instrument': market['id'],
        };
        let response = await this.publicGetTickers (this.extend (request, params));
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
        let numTickers = response.length;
        if (numTickers < 1) {
            throw new ExchangeError (this.id + ' fetchTicker could not load quotes for symbol ' + symbol);
        }
        return this.parseTicker (response[0], market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let request = {};
        if (symbols !== undefined) {
            let ids = this.marketIds (symbols);
            request['instrument'] = ids.join (',');
        }
        let response = await this.publicGetTickers (this.extend (request, params));
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
        let result = [];
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
        let timestamp = this.parse8601 (trade['timestamp']);
        let price = this.safeFloat (trade, 'price');
        let amount = this.safeFloat (trade, 'volume');
        let cost = undefined;
        if (price !== undefined) {
            if (amount !== undefined) {
                cost = amount * price;
            }
        }
        let id = undefined;
        let side = this.safeString (trade, 'side');
        let orderId = this.safeString (trade, 'orderId');
        let symbol = undefined;
        let marketId = this.safeString (trade, 'instrument');
        market = this.safeValue (this.markets_by_id, marketId, market);
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        let fee = undefined;
        let feeCurrencyId = this.safeString (trade, 'feeCurrency');
        let feeCurrency = this.safeValue (this.currencies_by_id, feeCurrencyId);
        let feeCode = undefined;
        if (feeCurrency !== undefined) {
            feeCode = feeCurrency['code'];
        } else if (market !== undefined) {
            feeCode = market['quote'];
        }
        let feeCost = this.safeFloat (trade, 'fee');
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'currency': feeCode,
            };
        }
        let takerOrMaker = undefined;
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
        let market = this.market (symbol);
        let request = {
            'instrument': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit; // min 1, max 1000, default 100
        }
        let response = await this.publicGetRecentTrades (this.extend (request, params));
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

    parseOrderStatus (status) {
        let statuses = {
            'submitting': 'open', // A newly created limit order has a status "submitting" until it has been processed.
            // This status changes during the lifetime of an order and can have different values depending on the value of the parameter Time In Force.
            'unfilledActive': 'open', // order is active, no trades have been made
            'partiallyFilledActive': 'open', // part of the order has been filled, the other part is active
            'filled': 'closed', // order has been filled entirely
            'partiallyFilledCancelled': 'canceled', // part of the order has been filled, the other part has been cancelled either by the trader or by the system (see the value of cancellationReason of an Order for more details on the reason of cancellation);
            'unfilledCancelled': 'canceled', // order has been cancelled, no trades have taken place (see the value of cancellationReason of an Order for more details on the reason of cancellation).
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
        let status = this.parseOrderStatus (this.safeString (order, 'status'));
        let symbol = this.findSymbol (this.safeString (order, 'symbol'), market);
        let timestamp = this.parse8601 (this.safeString (order, 'timestamp'));
        let price = this.safeFloat (order, 'price');
        let amount = this.safeFloat (order, 'volume');
        let remaining = this.safeFloat (order, 'remainingVolume');
        let filled = undefined;
        let lastTradeTimestamp = this.parse8601 (this.safeString (order, 'lastUpdate'));
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
        let id = this.safeString (order, 'id');
        let type = this.safeString (order, 'type');
        if (type === 'market') {
            if (price === 0.0) {
                if ((cost !== undefined) && (filled !== undefined)) {
                    if ((cost > 0) && (filled > 0)) {
                        price = cost / filled;
                    }
                }
            }
        }
        let side = this.safeString (order, 'side');
        let fee = undefined;
        let trades = undefined;
        let average = undefined;
        if (cost !== undefined) {
            if (filled) {
                average = cost / filled;
            }
            if (this.options['parseOrderToPrecision']) {
                cost = parseFloat (this.costToPrecision (symbol, cost));
            }
        }
        let result = {
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
        return result;
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'instrument': market['id'],
            'volume': this.amountToPrecision (symbol, amount),
            // The value must comply with the list of order types supported by the instrument (see the value of parameter supportedOrderTypes of the Instrument).
            // If the parameter is not specified, the default value "limit" is used.
            // More about order types in the corresponding section of documentation
            'type': type, // 'limit', 'market', 'stopLimit', in fact as of 2018-10-31, only 'limit' orders are supported for all markets
            'side': side, // 'buy' or 'sell'
            // "GTC" - Good-Til-Cancelled;
            // "IOC" - Immediate-Or-Cancel (currently not supported by the exchange API, reserved for future use);
            // "FOK" - Fill-Or-Kill (currently not supported by the exchange API, reserved for future use).
            // 'timeInForce': 'GTC', // IOC', 'FOK'
            // 'strictValidation': false, // false - prices will be rounded to meet the requirement, true - execution of the method will be aborted and an error message will be returned.
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
            let stopPrice = this.safeFloat (params, 'stopPrice');
            if (stopPrice === undefined) {
                throw new InvalidOrder (this.id + ' createOrder method requires a stopPrice extra param for a ' + type + ' order');
            } else {
                request['stopPrice'] = this.priceToPrecision (symbol, stopPrice);
            }
        }
        let response = await this.tradingPostPlaceOrder (this.extend (request, params));
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
        let request = {
            'id': id,
        };
        let response = await this.tradingGetOrderStatus (this.extend (request, params));
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
        let numOrders = response.length;
        if (numOrders < 1) {
            throw new OrderNotFound (this.id + ' fetchOrder could not fetch order id ' + id);
        }
        return this.parseOrder (response[0]);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        let id = this.safeValue2 (params, 'ids', 'id');
        let query = this.omit (params, [ 'ids', 'id' ]);
        if (id === undefined) {
            throw new ExchangeError (this.id + ' fetchOrders requires an extra ids or id param (a single order id or an array of order ids)');
        }
        if (this.isArray (id)) {
            id = id.join (',');
        }
        await this.loadMarkets ();
        let request = {
            'id': id,
        };
        let response = await this.tradingGetOrderStatus (this.extend (request, query));
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
        let request = {};
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['instrument'] = market['id'];
        }
        let response = await this.tradingGetActiveOrders (this.extend (request, params));
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
        let request = {};
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
        let response = await this.tradingGetActiveOrders (this.extend (request, params));
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
        let response = await this.tradingPostCancelOrdersById (this.extend ({
            'ids': [
                parseInt (id),
            ],
        }, params));
        //
        //     [
        //         465448358,
        //         468364313
        //     ]
        //
        return this.parseOrder (response);
    }

    async cancelAllOrders (symbols = undefined, params = {}) {
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
        let request = {};
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
        let response = await this.tradingGetTradeHistory (this.extend (request, params));
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

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let currency = undefined;
        const request = {};
        if (code !== undefined) {
            currency = this.currency (code);
            request['asset'] = currency['id'];
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        let response = await this.wapiGetDepositHistory (this.extend (request, params));
        //
        //     {     success:    true,
        //       depositList: [ { insertTime:  1517425007000,
        //                            amount:  0.3,
        //                           address: "0x0123456789abcdef",
        //                        addressTag: "",
        //                              txId: "0x0123456789abcdef",
        //                             asset: "ETH",
        //                            status:  1                                                                    } ] }
        //
        return this.parseTransactions (response['depositList'], currency, since, limit);
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let currency = undefined;
        const request = {};
        if (code !== undefined) {
            currency = this.currency (code);
            request['asset'] = currency['id'];
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        let response = await this.wapiGetWithdrawHistory (this.extend (request, params));
        //
        //     { withdrawList: [ {      amount:  14,
        //                             address: "0x0123456789abcdef...",
        //                         successTime:  1514489710000,
        //                          addressTag: "",
        //                                txId: "0x0123456789abcdef...",
        //                                  id: "0123456789abcdef...",
        //                               asset: "ETH",
        //                           applyTime:  1514488724000,
        //                              status:  6                       },
        //                       {      amount:  7600,
        //                             address: "0x0123456789abcdef...",
        //                         successTime:  1515323226000,
        //                          addressTag: "",
        //                                txId: "0x0123456789abcdef...",
        //                                  id: "0123456789abcdef...",
        //                               asset: "ICN",
        //                           applyTime:  1515322539000,
        //                              status:  6                       }  ],
        //            success:    true                                         }
        //
        return this.parseTransactions (response['withdrawList'], currency, since, limit);
    }

    parseTransactionStatusByType (status, type = undefined) {
        if (type === undefined) {
            return status;
        }
        let statuses = {
            'deposit': {
                '0': 'pending',
                '1': 'ok',
            },
            'withdrawal': {
                '0': 'pending', // Email Sent
                '1': 'canceled', // Cancelled (different from 1 = ok in deposits)
                '2': 'pending', // Awaiting Approval
                '3': 'failed', // Rejected
                '4': 'pending', // Processing
                '5': 'failed', // Failure
                '6': 'ok', // Completed
            },
        };
        return (status in statuses[type]) ? statuses[type][status] : status;
    }

    parseTransaction (transaction, currency = undefined) {
        //
        // fetchDeposits
        //      { insertTime:  1517425007000,
        //            amount:  0.3,
        //           address: "0x0123456789abcdef",
        //        addressTag: "",
        //              txId: "0x0123456789abcdef",
        //             asset: "ETH",
        //            status:  1                                                                    }
        //
        // fetchWithdrawals
        //
        //       {      amount:  14,
        //             address: "0x0123456789abcdef...",
        //         successTime:  1514489710000,
        //          addressTag: "",
        //                txId: "0x0123456789abcdef...",
        //                  id: "0123456789abcdef...",
        //               asset: "ETH",
        //           applyTime:  1514488724000,
        //              status:  6                       }
        //
        let id = this.safeString (transaction, 'id');
        let address = this.safeString (transaction, 'address');
        let tag = this.safeString (transaction, 'addressTag'); // set but unused
        if (tag !== undefined) {
            if (tag.length < 1) {
                tag = undefined;
            }
        }
        let txid = this.safeValue (transaction, 'txId');
        let code = undefined;
        let currencyId = this.safeString (transaction, 'asset');
        if (currencyId in this.currencies_by_id) {
            currency = this.currencies_by_id[currencyId];
        } else {
            code = this.commonCurrencyCode (currencyId);
        }
        if (currency !== undefined) {
            code = currency['code'];
        }
        let timestamp = undefined;
        let insertTime = this.safeInteger (transaction, 'insertTime');
        let applyTime = this.safeInteger (transaction, 'applyTime');
        let type = this.safeString (transaction, 'type');
        if (type === undefined) {
            if ((insertTime !== undefined) && (applyTime === undefined)) {
                type = 'deposit';
                timestamp = insertTime;
            } else if ((insertTime === undefined) && (applyTime !== undefined)) {
                type = 'withdrawal';
                timestamp = applyTime;
            }
        }
        let status = this.parseTransactionStatusByType (this.safeString (transaction, 'status'), type);
        let amount = this.safeFloat (transaction, 'amount');
        const feeCost = undefined;
        let fee = {
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
            'updated': undefined,
            'fee': fee,
        };
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        let currency = this.currency (code);
        let request = {
            'currency': currency['id'],
        };
        let response = await this.accountGetDepositAddress (this.extend (request, params));
        //
        //     {
        //         "currency": "BTS",
        //         "address": "crex24",
        //         "paymentId": "0fg4da4186741579"
        //     }
        //
        let address = this.safeString (response, 'address');
        let tag = this.safeString (response, 'paymentId');
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
        let currency = this.currency (code);
        let name = address.slice (0, 20);
        let request = {
            'asset': currency['id'],
            'address': address,
            'amount': parseFloat (amount),
            'name': name,
        };
        if (tag)
            request['addressTag'] = tag;
        let response = await this.wapiPostWithdraw (this.extend (request, params));
        return {
            'info': response,
            'id': this.safeString (response, 'id'),
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let request = '/' + this.version + '/' + api + '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (method === 'GET') {
            if (Object.keys (query).length) {
                request += '?' + this.urlencode (query);
            }
        }
        let url = this.urls['api'] + request;
        if ((api === 'trading') || (api === 'account')) {
            this.checkRequiredCredentials ();
            let nonce = this.nonce ().toString ();
            let secret = this.base64ToBinary (this.secret);
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
            let signature = this.stringToBase64 (this.hmac (this.encode (auth), secret, 'sha512', 'binary'));
            headers['X-CREX24-API-SIGN'] = signature;
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    // handleErrors (code, reason, url, method, headers, body) {
    // }
};
