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
                'fetchFundingFees': true,
                'fetchDeposits': true,
                'fetchWithdrawals': true,
                'fetchTransactions': false,
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
        //                     { price: 0.0309, volume: 0.05261453 },
        //                     { price: 0.03089, volume: 0.68379217 },
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
        let orderId = undefined;
        // if ('orderId' in trade)
        //     order = this.safeString (trade, 'orderId');
        // if ('m' in trade) {
        //     side = trade['m'] ? 'sell' : 'buy'; // this is reversed intentionally
        // } else {
        //     if ('isBuyer' in trade)
        //         side = (trade['isBuyer']) ? 'buy' : 'sell'; // this is a true side
        // }
        let fee = undefined;
        // if ('commission' in trade) {
        //     fee = {
        //         'cost': this.safeFloat (trade, 'commission'),
        //         'currency': this.commonCurrencyCode (trade['commissionAsset']),
        //     };
        // }
        let takerOrMaker = undefined;
        // if ('isMaker' in trade)
        //     takerOrMaker = trade['isMaker'] ? 'maker' : 'taker';
        let symbol = undefined;
        // if (market === undefined) {
        //     let marketId = this.safeString (trade, 'symbol');
        //     market = this.safeValue (this.markets_by_id, marketId);
        // }
        if (market !== undefined) {
            symbol = market['symbol'];
        }
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
            'NEW': 'open',
            'PARTIALLY_FILLED': 'open',
            'FILLED': 'closed',
            'CANCELED': 'canceled',
        };
        return (status in statuses) ? statuses[status] : status;
    }

    parseOrder (order, market = undefined) {
        let status = this.parseOrderStatus (this.safeString (order, 'status'));
        let symbol = this.findSymbol (this.safeString (order, 'symbol'), market);
        let timestamp = undefined;
        if ('time' in order)
            timestamp = order['time'];
        else if ('transactTime' in order)
            timestamp = order['transactTime'];
        let price = this.safeFloat (order, 'price');
        let amount = this.safeFloat (order, 'origQty');
        let filled = this.safeFloat (order, 'executedQty');
        let remaining = undefined;
        let cost = this.safeFloat (order, 'cummulativeQuoteQty');
        if (filled !== undefined) {
            if (amount !== undefined) {
                remaining = amount - filled;
                if (this.options['parseOrderToPrecision']) {
                    remaining = parseFloat (this.amountToPrecision (symbol, remaining));
                }
                remaining = Math.max (remaining, 0.0);
            }
            if (price !== undefined) {
                if (cost === undefined) {
                    cost = price * filled;
                }
            }
        }
        let id = this.safeString (order, 'orderId');
        let type = this.safeString (order, 'type');
        if (type !== undefined) {
            type = type.toLowerCase ();
            if (type === 'market') {
                if (price === 0.0) {
                    if ((cost !== undefined) && (filled !== undefined)) {
                        if ((cost > 0) && (filled > 0)) {
                            price = cost / filled;
                        }
                    }
                }
            }
        }
        let side = this.safeString (order, 'side');
        if (side !== undefined)
            side = side.toLowerCase ();
        let fee = undefined;
        let trades = undefined;
        const fills = this.safeValue (order, 'fills');
        if (fills !== undefined) {
            trades = this.parseTrades (fills, market);
            let numTrades = trades.length;
            if (numTrades > 0) {
                cost = trades[0]['cost'];
                fee = {
                    'cost': trades[0]['fee']['cost'],
                    'currency': trades[0]['fee']['currency'],
                };
                for (let i = 1; i < trades.length; i++) {
                    cost = this.sum (cost, trades[i]['cost']);
                    fee['cost'] = this.sum (fee['cost'], trades[i]['fee']['cost']);
                }
            }
        }
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
            'lastTradeTimestamp': undefined,
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
        // the next 5 lines are added to support for testing orders
        let method = 'privatePostOrder';
        let test = this.safeValue (params, 'test', false);
        if (test) {
            method += 'Test';
            params = this.omit (params, 'test');
        }
        let uppercaseType = type.toUpperCase ();
        let order = {
            'symbol': market['id'],
            'quantity': this.amountToPrecision (symbol, amount),
            'type': uppercaseType,
            'side': side.toUpperCase (),
            'newOrderRespType': this.options['newOrderRespType'], // 'ACK' for order id, 'RESULT' for full order or 'FULL' for order with fills
        };
        let timeInForceIsRequired = false;
        let priceIsRequired = false;
        let stopPriceIsRequired = false;
        if (uppercaseType === 'LIMIT') {
            priceIsRequired = true;
            timeInForceIsRequired = true;
        } else if ((uppercaseType === 'STOP_LOSS') || (uppercaseType === 'TAKE_PROFIT')) {
            stopPriceIsRequired = true;
        } else if ((uppercaseType === 'STOP_LOSS_LIMIT') || (uppercaseType === 'TAKE_PROFIT_LIMIT')) {
            stopPriceIsRequired = true;
            priceIsRequired = true;
            timeInForceIsRequired = true;
        } else if (uppercaseType === 'LIMIT_MAKER') {
            priceIsRequired = true;
        }
        if (priceIsRequired) {
            if (price === undefined)
                throw new InvalidOrder (this.id + ' createOrder method requires a price argument for a ' + type + ' order');
            order['price'] = this.priceToPrecision (symbol, price);
        }
        if (timeInForceIsRequired) {
            order['timeInForce'] = this.options['defaultTimeInForce']; // 'GTC' = Good To Cancel (default), 'IOC' = Immediate Or Cancel
        }
        if (stopPriceIsRequired) {
            let stopPrice = this.safeFloat (params, 'stopPrice');
            if (stopPrice === undefined) {
                throw new InvalidOrder (this.id + ' createOrder method requires a stopPrice extra param for a ' + type + ' order');
            } else {
                order['stopPrice'] = this.priceToPrecision (symbol, stopPrice);
            }
        }
        let response = await this[method] (this.extend (order, params));
        return this.parseOrder (response, market);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined)
            throw new ArgumentsRequired (this.id + ' fetchOrder requires a symbol argument');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let origClientOrderId = this.safeValue (params, 'origClientOrderId');
        let request = {
            'symbol': market['id'],
        };
        if (origClientOrderId !== undefined)
            request['origClientOrderId'] = origClientOrderId;
        else
            request['orderId'] = parseInt (id);
        let response = await this.privateGetOrder (this.extend (request, params));
        return this.parseOrder (response, market);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined)
            throw new ArgumentsRequired (this.id + ' fetchOrders requires a symbol argument');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'symbol': market['id'],
        };
        if (limit !== undefined)
            request['limit'] = limit;
        let response = await this.privateGetAllOrders (this.extend (request, params));
        //
        //     [
        //         {
        //             "symbol": "LTCBTC",
        //             "orderId": 1,
        //             "clientOrderId": "myOrder1",
        //             "price": "0.1",
        //             "origQty": "1.0",
        //             "executedQty": "0.0",
        //             "cummulativeQuoteQty": "0.0",
        //             "status": "NEW",
        //             "timeInForce": "GTC",
        //             "type": "LIMIT",
        //             "side": "BUY",
        //             "stopPrice": "0.0",
        //             "icebergQty": "0.0",
        //             "time": 1499827319559,
        //             "updateTime": 1499827319559,
        //             "isWorking": true
        //         }
        //     ]
        //
        return this.parseOrders (response, market, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        let request = {};
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        } else if (this.options['warnOnFetchOpenOrdersWithoutSymbol']) {
            let symbols = this.symbols;
            let numSymbols = symbols.length;
            let fetchOpenOrdersRateLimit = parseInt (numSymbols / 2);
            throw new ExchangeError (this.id + ' fetchOpenOrders WARNING: fetching open orders without specifying a symbol is rate-limited to one call per ' + fetchOpenOrdersRateLimit.toString () + ' seconds. Do not call this method frequently to avoid ban. Set ' + this.id + '.options["warnOnFetchOpenOrdersWithoutSymbol"] = false to suppress this warning message.');
        }
        let response = await this.privateGetOpenOrders (this.extend (request, params));
        return this.parseOrders (response, market, since, limit);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        let orders = await this.fetchOrders (symbol, since, limit, params);
        return this.filterBy (orders, 'status', 'closed');
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined)
            throw new ArgumentsRequired (this.id + ' cancelOrder requires a symbol argument');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.privateDeleteOrder (this.extend ({
            'symbol': market['id'],
            'orderId': parseInt (id),
            // 'origClientOrderId': id,
        }, params));
        return this.parseOrder (response);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined)
            throw new ArgumentsRequired (this.id + ' fetchMyTrades requires a symbol argument');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'symbol': market['id'],
        };
        if (limit !== undefined)
            request['limit'] = limit;
        let response = await this.privateGetMyTrades (this.extend (request, params));
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
        let response = await this.wapiGetDepositAddress (this.extend ({
            'asset': currency['id'],
        }, params));
        if ('success' in response) {
            if (response['success']) {
                let address = this.safeString (response, 'address');
                let tag = this.safeString (response, 'addressTag');
                return {
                    'currency': code,
                    'address': this.checkAddress (address),
                    'tag': tag,
                    'info': response,
                };
            }
        }
    }

    async fetchFundingFees (codes = undefined, params = {}) {
        let response = await this.wapiGetAssetDetail ();
        //
        //     {
        //         "success": true,
        //         "assetDetail": {
        //             "CTR": {
        //                 "minWithdrawAmount": "70.00000000", //min withdraw amount
        //                 "depositStatus": false,//deposit status
        //                 "withdrawFee": 35, // withdraw fee
        //                 "withdrawStatus": true, //withdraw status
        //                 "depositTip": "Delisted, Deposit Suspended" //reason
        //             },
        //             "SKY": {
        //                 "minWithdrawAmount": "0.02000000",
        //                 "depositStatus": true,
        //                 "withdrawFee": 0.01,
        //                 "withdrawStatus": true
        //             }
        //         }
        //     }
        //
        let detail = this.safeValue (response, 'assetDetail');
        let ids = Object.keys (detail);
        let withdrawFees = {};
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i];
            let code = this.commonCurrencyCode (id);
            withdrawFees[code] = this.safeFloat (detail[id], 'withdrawFee');
        }
        return {
            'withdraw': withdrawFees,
            'deposit': {},
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
            // const crypto = require("crypto");
            // const request = require("request");
            // var baseUrl = "https://api.crex24.com";
            // var apiKey = "-- Your API key --";
            // var secret = "-- Your secret --";
            // var path = "/v2/trading/placeOrder";
            // var body = JSON.stringify({
            //     instrument: "ETH-BTC",
            //     side: "sell",
            //     volume: 1,
            //     price: 12345.67
            // });
            // var nonce = Date.now();
            // var key = Buffer(secret, "base64");
            // var message = path + nonce + body;
            // var hmac = crypto.createHmac("sha512", key);
            // var signature = hmac.update(message).digest('base64');
            // request({
            //         url: baseUrl + path,
            //         method: "POST",
            //         headers: {
            //             "X-CREX24-API-KEY": apiKey,
            //             "X-CREX24-API-NONCE": nonce,
            //             "X-CREX24-API-SIGN": signature
            //         },
            //         body: body
            //     },
            //     function (error, response, body) {
            //         console.log("error:", error);
            //         console.log("statusCode:", response && response.statusCode);
            //         console.log("body:", body);
            //     }
            // );
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    // handleErrors (code, reason, url, method, headers, body) {
    // }
};
