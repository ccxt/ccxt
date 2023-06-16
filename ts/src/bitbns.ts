
//  ---------------------------------------------------------------------------

import Exchange from './abstract/bitbns.js';
import { ExchangeError, ArgumentsRequired, InsufficientFunds, OrderNotFound, BadRequest, BadSymbol } from './base/errors.js';
import { Precise } from './base/Precise.js';
import { TICK_SIZE } from './base/functions/number.js';
import { sha512 } from './static_dependencies/noble-hashes/sha512.js';
import { Int, OrderSide, OrderType } from './base/types.js';

//  ---------------------------------------------------------------------------

export default class bitbns extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitbns',
            'name': 'Bitbns',
            'countries': [ 'IN' ], // India
            'rateLimit': 1000,
            'certified': false,
            'pro': false,
            'version': 'v2',
            // new metainfo interface
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': undefined, // has but unimplemented
                'swap': false,
                'future': false,
                'option': undefined, // coming soon
                'cancelOrder': true,
                'createOrder': true,
                'fetchBalance': true,
                'fetchDepositAddress': true,
                'fetchDeposits': true,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchMarginMode': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOHLCV': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchPositionMode': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchStatus': true,
                'fetchTicker': 'emulated',
                'fetchTickers': true,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTransfer': false,
                'fetchTransfers': false,
                'fetchWithdrawal': false,
                'fetchWithdrawals': true,
                'transfer': false,
                'withdraw': false,
            },
            'hostname': 'bitbns.com',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/117201933-e7a6e780-adf5-11eb-9d80-98fc2a21c3d6.jpg',
                'api': {
                    'www': 'https://{hostname}',
                    'v1': 'https://api.{hostname}/api/trade/v1',
                    'v2': 'https://api.{hostname}/api/trade/v2',
                },
                'www': 'https://bitbns.com',
                'referral': 'https://ref.bitbns.com/1090961',
                'doc': [
                    'https://bitbns.com/trade/#/api-trading/',
                ],
                'fees': 'https://bitbns.com/fees',
            },
            'api': {
                'www': {
                    'get': [
                        'order/fetchMarkets',
                        'order/fetchTickers',
                        'order/fetchOrderbook',
                        'order/getTickerWithVolume',
                        'exchangeData/ohlc', // ?coin=${coin_name}&page=${page}
                        'exchangeData/orderBook',
                        'exchangeData/tradedetails',
                    ],
                },
                'v1': {
                    'get': [
                        'platform/status',
                        'tickers',
                        'orderbook/sell/{symbol}',
                        'orderbook/buy/{symbol}',
                    ],
                    'post': [
                        'currentCoinBalance/EVERYTHING',
                        'getApiUsageStatus/USAGE',
                        'getOrderSocketToken/USAGE',
                        'currentCoinBalance/{symbol}',
                        'orderStatus/{symbol}',
                        'depositHistory/{symbol}',
                        'withdrawHistory/{symbol}',
                        'withdrawHistoryAll/{symbol}',
                        'depositHistoryAll/{symbol}',
                        'listOpenOrders/{symbol}',
                        'listOpenStopOrders/{symbol}',
                        'getCoinAddress/{symbol}',
                        'placeSellOrder/{symbol}',
                        'placeBuyOrder/{symbol}',
                        'buyStopLoss/{symbol}',
                        'sellStopLoss/{symbol}',
                        'cancelOrder/{symbol}',
                        'cancelStopLossOrder/{symbol}',
                        'listExecutedOrders/{symbol}',
                        'placeMarketOrder/{symbol}',
                        'placeMarketOrderQnty/{symbol}',
                    ],
                },
                'v2': {
                    'post': [
                        'orders',
                        'cancel',
                        'getordersnew',
                        'marginOrders',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'feeSide': 'quote',
                    'tierBased': false,
                    'percentage': true,
                    'taker': this.parseNumber ('0.0025'),
                    'maker': this.parseNumber ('0.0025'),
                },
            },
            'precisionMode': TICK_SIZE,
            'exceptions': {
                'exact': {
                    '400': BadRequest, // {"msg":"Invalid Request","status":-1,"code":400}
                    '409': BadSymbol, // {"data":"","status":0,"error":"coin name not supplied or not yet supported","code":409}
                    '416': InsufficientFunds, // {"data":"Oops ! Not sufficient currency to sell","status":0,"error":null,"code":416}
                    '417': OrderNotFound, // {"data":[],"status":0,"error":"Nothing to show","code":417}
                },
                'broad': {},
            },
        });
    }

    async fetchStatus (params = {}) {
        /**
         * @method
         * @name bitbns#fetchStatus
         * @description the latest known information on the availability of the exchange API
         * @param {object} params extra parameters specific to the bitbns api endpoint
         * @returns {object} a [status structure]{@link https://docs.ccxt.com/#/?id=exchange-status-structure}
         */
        const response = await this.v1GetPlatformStatus (params);
        //
        //     {
        //         "data":{
        //             "BTC":{"status":1},
        //             "ETH":{"status":1},
        //             "XRP":{"status":1},
        //         },
        //         "status":1,
        //         "error":null,
        //         "code":200
        //     }
        //
        const statusRaw = this.safeString (response, 'status');
        return {
            'status': this.safeString ({ '1': 'ok' }, statusRaw, statusRaw),
            'updated': undefined,
            'eta': undefined,
            'url': undefined,
            'info': response,
        };
    }

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name bitbns#fetchMarkets
         * @description retrieves data on all markets for bitbns
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {[object]} an array of objects representing market data
         */
        const response = await this.wwwGetOrderFetchMarkets (params);
        //
        //     [
        //         {
        //             "id":"BTC",
        //             "symbol":"BTC/INR",
        //             "base":"BTC",
        //             "quote":"INR",
        //             "baseId":"BTC",
        //             "quoteId":"",
        //             "active":true,
        //             "limits":{
        //                 "amount":{"min":"0.00017376","max":20},
        //                 "price":{"min":2762353.2359999996,"max":6445490.883999999},
        //                 "cost":{"min":800,"max":128909817.67999998}
        //             },
        //             "precision":{
        //                 "amount":8,
        //                 "price":2
        //             },
        //             "info":{}
        //         },
        //     ]
        //
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const market = response[i];
            const id = this.safeString (market, 'id');
            const baseId = this.safeString (market, 'base');
            const quoteId = this.safeString (market, 'quote');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const marketPrecision = this.safeValue (market, 'precision', {});
            const marketLimits = this.safeValue (market, 'limits', {});
            const amountLimits = this.safeValue (marketLimits, 'amount', {});
            const priceLimits = this.safeValue (marketLimits, 'price', {});
            const costLimits = this.safeValue (marketLimits, 'cost', {});
            const usdt = (quoteId === 'USDT');
            // INR markets don't need a _INR prefix
            const uppercaseId = usdt ? (baseId + '_' + quoteId) : baseId;
            result.push ({
                'id': id,
                'uppercaseId': uppercaseId,
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
                'active': undefined,
                'contract': false,
                'linear': undefined,
                'inverse': undefined,
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': this.parseNumber (this.parsePrecision (this.safeString (marketPrecision, 'amount'))),
                    'price': this.parseNumber (this.parsePrecision (this.safeString (marketPrecision, 'price'))),
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': {
                        'min': this.safeNumber (amountLimits, 'min'),
                        'max': this.safeNumber (amountLimits, 'max'),
                    },
                    'price': {
                        'min': this.safeNumber (priceLimits, 'min'),
                        'max': this.safeNumber (priceLimits, 'max'),
                    },
                    'cost': {
                        'min': this.safeNumber (costLimits, 'min'),
                        'max': this.safeNumber (costLimits, 'max'),
                    },
                },
                'info': market,
            });
        }
        return result;
    }

    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name bitbns#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the bitbns api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit; // default 100, max 5000, see https://github.com/binance-exchange/binance-official-api-docs/blob/master/rest-api.md#order-book
        }
        const response = await this.wwwGetOrderFetchOrderbook (this.extend (request, params));
        //
        //     {
        //         "bids":[
        //             [49352.04,0.843948],
        //             [49352.03,0.742048],
        //             [49349.78,0.686239],
        //         ],
        //         "asks":[
        //             [49443.59,0.065137],
        //             [49444.63,0.098211],
        //             [49449.01,0.066309],
        //         ],
        //         "timestamp":1619172786577,
        //         "datetime":"2021-04-23T10:13:06.577Z",
        //         "nonce":""
        //     }
        //
        const timestamp = this.safeInteger (response, 'timestamp');
        return this.parseOrderBook (response, market['symbol'], timestamp);
    }

    parseTicker (ticker, market = undefined) {
        //
        //     {
        //         "symbol":"BTC/INR",
        //         "info":{
        //             "highest_buy_bid":4368494.31,
        //             "lowest_sell_bid":4374835.09,
        //             "last_traded_price":4374835.09,
        //             "yes_price":4531016.27,
        //             "volume":{"max":"4569119.23","min":"4254552.13","volume":62.17722344}
        //         },
        //         "timestamp":1619100020845,
        //         "datetime":1619100020845,
        //         "high":"4569119.23",
        //         "low":"4254552.13",
        //         "bid":4368494.31,
        //         "bidVolume":"",
        //         "ask":4374835.09,
        //         "askVolume":"",
        //         "vwap":"",
        //         "open":4531016.27,
        //         "close":4374835.09,
        //         "last":4374835.09,
        //         "baseVolume":62.17722344,
        //         "quoteVolume":"",
        //         "previousClose":"",
        //         "change":-156181.1799999997,
        //         "percentage":-3.446934874943623,
        //         "average":4452925.68
        //     }
        //
        const timestamp = this.safeInteger (ticker, 'timestamp');
        const marketId = this.safeString (ticker, 'symbol');
        const symbol = this.safeSymbol (marketId, market);
        const last = this.safeString (ticker, 'last');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'high'),
            'low': this.safeString (ticker, 'low'),
            'bid': this.safeString (ticker, 'bid'),
            'bidVolume': this.safeString (ticker, 'bidVolume'),
            'ask': this.safeString (ticker, 'ask'),
            'askVolume': this.safeString (ticker, 'askVolume'),
            'vwap': this.safeString (ticker, 'vwap'),
            'open': this.safeString (ticker, 'open'),
            'close': last,
            'last': last,
            'previousClose': this.safeString (ticker, 'previousClose'), // previous day close
            'change': this.safeString (ticker, 'change'),
            'percentage': this.safeString (ticker, 'percentage'),
            'average': this.safeString (ticker, 'average'),
            'baseVolume': this.safeString (ticker, 'baseVolume'),
            'quoteVolume': this.safeString (ticker, 'quoteVolume'),
            'info': ticker,
        }, market);
    }

    async fetchTickers (symbols: string[] = undefined, params = {}) {
        /**
         * @method
         * @name bitbns#fetchTickers
         * @description fetches price tickers for multiple markets, statistical calculations with the information calculated over the past 24 hours each market
         * @param {[string]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} params extra parameters specific to the bitbns api endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        const response = await this.wwwGetOrderFetchTickers (params);
        //
        //     {
        //         "BTC/INR":{
        //             "symbol":"BTC/INR",
        //             "info":{
        //                 "highest_buy_bid":4368494.31,
        //                 "lowest_sell_bid":4374835.09,
        //                 "last_traded_price":4374835.09,
        //                 "yes_price":4531016.27,
        //                 "volume":{"max":"4569119.23","min":"4254552.13","volume":62.17722344}
        //             },
        //             "timestamp":1619100020845,
        //             "datetime":1619100020845,
        //             "high":"4569119.23",
        //             "low":"4254552.13",
        //             "bid":4368494.31,
        //             "bidVolume":"",
        //             "ask":4374835.09,
        //             "askVolume":"",
        //             "vwap":"",
        //             "open":4531016.27,
        //             "close":4374835.09,
        //             "last":4374835.09,
        //             "baseVolume":62.17722344,
        //             "quoteVolume":"",
        //             "previousClose":"",
        //             "change":-156181.1799999997,
        //             "percentage":-3.446934874943623,
        //             "average":4452925.68
        //         }
        //     }
        //
        return this.parseTickers (response, symbols);
    }

    parseBalance (response) {
        const timestamp = undefined;
        const result = {
            'info': response,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        const data = this.safeValue (response, 'data', {});
        const keys = Object.keys (data);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const parts = key.split ('availableorder');
            const numParts = parts.length;
            if (numParts > 1) {
                let currencyId = this.safeString (parts, 1);
                // note that "Money" stands for INR - the only fiat in bitbns
                if (currencyId === 'Money') {
                    currencyId = 'INR';
                }
                const code = this.safeCurrencyCode (currencyId);
                const account = this.account ();
                account['free'] = this.safeString (data, key);
                account['used'] = this.safeString (data, 'inorder' + currencyId);
                result[code] = account;
            }
        }
        return this.safeBalance (result);
    }

    async fetchBalance (params = {}) {
        /**
         * @method
         * @name bitbns#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} params extra parameters specific to the bitbns api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.loadMarkets ();
        const response = await this.v1PostCurrentCoinBalanceEVERYTHING (params);
        //
        //     {
        //         "data":{
        //             "availableorderMoney":12.34, // INR
        //             "availableorderBTC":0,
        //             "availableorderXRP":0,
        //             "inorderMoney":0, // INR
        //             "inorderBTC":0,
        //             "inorderXRP":0,
        //             "inorderNEO":0,
        //         },
        //         "status":1,
        //         "error":null,
        //         "code":200
        //     }
        //
        // note that "Money" stands for INR - the only fiat in bitbns
        return this.parseBalance (response);
    }

    parseOrderStatus (status) {
        const statuses = {
            '0': 'open',
            // 'PARTIALLY_FILLED': 'open',
            // 'FILLED': 'closed',
            // 'CANCELED': 'canceled',
            // 'PENDING_CANCEL': 'canceling', // currently unused
            // 'REJECTED': 'rejected',
            // 'EXPIRED': 'expired',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        //
        // createOrder
        //
        //     {
        //         "data":"Successfully placed bid to purchase currency",
        //         "status":1,
        //         "error":null,
        //         "id":5424475,
        //         "code":200
        //     }
        //
        // fetchOrder
        //
        //     {
        //         "entry_id":5424475,
        //         "btc":0.01,
        //         "rate":2000,
        //         "time":"2021-04-25T17:05:42.000Z",
        //         "type":0,
        //         "status":0,
        //         "total":0.01,
        //         "avg_cost":null,
        //         "side":"BUY",
        //         "amount":0.01,
        //         "remaining":0.01,
        //         "filled":0,
        //         "cost":null,
        //         "fee":0.05
        //     }
        //
        // fetchOpenOrders
        //
        //     {
        //         "entry_id":5424475,
        //         "btc":0.01,
        //         "rate":2000,
        //         "time":"2021-04-25T17:05:42.000Z",
        //         "type":0,
        //         "status":0
        //     }
        //
        const id = this.safeString2 (order, 'id', 'entry_id');
        const marketId = this.safeString (order, 'symbol');
        const symbol = this.safeSymbol (marketId, market);
        const timestamp = this.parse8601 (this.safeString (order, 'time'));
        const price = this.safeString (order, 'rate');
        const amount = this.safeString2 (order, 'amount', 'btc');
        const filled = this.safeString (order, 'filled');
        const remaining = this.safeString (order, 'remaining');
        const average = this.safeString (order, 'avg_cost');
        const cost = this.safeString (order, 'cost');
        let type = this.safeStringLower (order, 'type');
        if (type === '0') {
            type = 'limit';
        }
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const side = this.safeStringLower (order, 'side');
        const feeCost = this.safeNumber (order, 'fee');
        let fee = undefined;
        if (feeCost !== undefined) {
            const feeCurrencyCode = undefined;
            fee = {
                'cost': feeCost,
                'currency': feeCurrencyCode,
            };
        }
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
            'triggerPrice': undefined,
            'amount': amount,
            'cost': cost,
            'average': average,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': fee,
            'trades': undefined,
        }, market);
    }

    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name bitbns#createOrder
         * @description create a trade order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float|undefined} price the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} params extra parameters specific to the bitbns api endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        if (type !== 'limit' && type !== 'market') {
            throw new ExchangeError (this.id + ' allows limit and market orders only');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'side': side.toUpperCase (),
            'symbol': market['uppercaseId'],
            'quantity': this.amountToPrecision (symbol, amount),
            // 'target_rate': this.priceToPrecision (symbol, targetRate),
            // 't_rate': this.priceToPrecision (symbol, stopPrice),
            // 'trail_rate': this.priceToPrecision (symbol, trailRate),
            // To Place Simple Buy or Sell Order use rate
            // To Place Stoploss Buy or Sell Order use rate & t_rate
            // To Place Bracket Buy or Sell Order use rate , t_rate, target_rate & trail_rate
        };
        let method = 'v2PostOrders';
        if (type === 'limit') {
            request['rate'] = this.priceToPrecision (symbol, price);
        } else if (type === 'market') {
            method = 'v1PostPlaceMarketOrderQntySymbol';
            request['market'] = market['quoteId'];
        } else {
            throw new ExchangeError (this.id + ' allows limit and market orders only');
        }
        const response = await this[method] (this.extend (request, params));
        //
        //     {
        //         "data":"Successfully placed bid to purchase currency",
        //         "status":1,
        //         "error":null,
        //         "id":5424475,
        //         "code":200
        //     }
        //
        return this.parseOrder (response, market);
    }

    async cancelOrder (id: string, symbol: string = undefined, params = {}) {
        /**
         * @method
         * @name bitbns#cancelOrder
         * @description cancels an open order
         * @param {string} id order id
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the bitbns api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const quoteSide = (market['quoteId'] === 'USDT') ? 'usdtcancelOrder' : 'cancelOrder';
        const request = {
            'entry_id': id,
            'symbol': market['uppercaseId'],
            'side': quoteSide,
        };
        const response = await this.v2PostCancel (this.extend (request, params));
        return this.parseOrder (response, market);
    }

    async fetchOrder (id: string, symbol: string = undefined, params = {}) {
        /**
         * @method
         * @name bitbns#fetchOrder
         * @description fetches information on an order made by the user
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the bitbns api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'entry_id': id,
        };
        const response = await this.v1PostOrderStatusSymbol (this.extend (request, params));
        //
        //     {
        //         "data":[
        //             {
        //                 "entry_id":5424475,
        //                 "btc":0.01,
        //                 "rate":2000,
        //                 "time":"2021-04-25T17:05:42.000Z",
        //                 "type":0,
        //                 "status":0,
        //                 "total":0.01,
        //                 "avg_cost":null,
        //                 "side":"BUY",
        //                 "amount":0.01,
        //                 "remaining":0.01,
        //                 "filled":0,
        //                 "cost":null,
        //                 "fee":0.05
        //             }
        //         ],
        //         "status":1,
        //         "error":null,
        //         "code":200
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        const first = this.safeValue (data, 0);
        return this.parseOrder (first, market);
    }

    async fetchOpenOrders (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name bitbns#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @param {string} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch open orders for
         * @param {int|undefined} limit the maximum number of  open orders structures to retrieve
         * @param {object} params extra parameters specific to the bitbns api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOpenOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const quoteSide = (market['quoteId'] === 'USDT') ? 'usdtListOpenOrders' : 'listOpenOrders';
        const request = {
            'symbol': market['uppercaseId'],
            'side': quoteSide,
            'page': 0,
        };
        const response = await this.v2PostGetordersnew (this.extend (request, params));
        //
        //     {
        //         "data":[
        //             {
        //                 "entry_id":5424475,
        //                 "btc":0.01,
        //                 "rate":2000,
        //                 "time":"2021-04-25T17:05:42.000Z",
        //                 "type":0,
        //                 "status":0
        //             }
        //         ],
        //         "status":1,
        //         "error":null,
        //         "code":200
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseOrders (data, market, since, limit);
    }

    parseTrade (trade, market = undefined) {
        //
        // fetchMyTrades
        //
        //     {
        //         "type": "BTC Sell order executed",
        //         "typeI": 6,
        //         "crypto": 5000,
        //         "amount": 35.4,
        //         "rate": 709800,
        //         "date": "2020-05-22T15:05:34.000Z",
        //         "unit": "INR",
        //         "factor": 100000000,
        //         "fee": 0.09,
        //         "delh_btc": -5000,
        //         "delh_inr": 0,
        //         "del_btc": 0,
        //         "del_inr": 35.4,
        //         "id": "2938823"
        //     }
        //
        // fetchTrades
        //
        //     {
        //         "tradeId":"1909151",
        //         "price":"61904.6300",
        //         "quote_volume":1618.05,
        //         "base_volume":0.02607254,
        //         "timestamp":1634548602000,
        //         "type":"buy"
        //     }
        //
        market = this.safeMarket (undefined, market);
        const orderId = this.safeString2 (trade, 'id', 'tradeId');
        let timestamp = this.parse8601 (this.safeString (trade, 'date'));
        timestamp = this.safeInteger (trade, 'timestamp', timestamp);
        const priceString = this.safeString2 (trade, 'rate', 'price');
        let amountString = this.safeString (trade, 'amount');
        let side = this.safeStringLower (trade, 'type');
        if (side !== undefined) {
            if (side.indexOf ('buy') >= 0) {
                side = 'buy';
            } else if (side.indexOf ('sell') >= 0) {
                side = 'sell';
            }
        }
        const factor = this.safeString (trade, 'factor');
        let costString = undefined;
        if (factor !== undefined) {
            amountString = Precise.stringDiv (amountString, factor);
        } else {
            amountString = this.safeString (trade, 'base_volume');
            costString = this.safeString (trade, 'quote_volume');
        }
        const symbol = market['symbol'];
        let fee = undefined;
        const feeCostString = this.safeString (trade, 'fee');
        if (feeCostString !== undefined) {
            const feeCurrencyCode = market['quote'];
            fee = {
                'cost': feeCostString,
                'currency': feeCurrencyCode,
            };
        }
        return this.safeTrade ({
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': orderId,
            'order': orderId,
            'type': undefined,
            'side': side,
            'takerOrMaker': undefined,
            'price': priceString,
            'amount': amountString,
            'cost': costString,
            'fee': fee,
        }, market);
    }

    async fetchMyTrades (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name bitbns#fetchMyTrades
         * @description fetch all trades made by the user
         * @param {string} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch trades for
         * @param {int|undefined} limit the maximum number of trades structures to retrieve
         * @param {object} params extra parameters specific to the bitbns api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'page': 0,
        };
        if (since !== undefined) {
            request['since'] = this.iso8601 (since);
        }
        const response = await this.v1PostListExecutedOrdersSymbol (this.extend (request, params));
        //
        //     {
        //         "data": [
        //             {
        //                 "type": "BTC Sell order executed",
        //                 "typeI": 6,
        //                 "crypto": 5000,
        //                 "amount": 35.4,
        //                 "rate": 709800,
        //                 "date": "2020-05-22T15:05:34.000Z",
        //                 "unit": "INR",
        //                 "factor": 100000000,
        //                 "fee": 0.09,
        //                 "delh_btc": -5000,
        //                 "delh_inr": 0,
        //                 "del_btc": 0,
        //                 "del_inr": 35.4,
        //                 "id": "2938823"
        //             },
        //             {
        //                 "type": "BTC Sell order executed",
        //                 "typeI": 6,
        //                 "crypto": 195000,
        //                 "amount": 1380.58,
        //                 "rate": 709765.5,
        //                 "date": "2020-05-22T15:05:34.000Z",
        //                 "unit": "INR",
        //                 "factor": 100000000,
        //                 "fee": 3.47,
        //                 "delh_btc": -195000,
        //                 "delh_inr": 0,
        //                 "del_btc": 0,
        //                 "del_inr": 1380.58,
        //                 "id": "2938823"
        //             }
        //         ],
        //         "status": 1,
        //         "error": null,
        //         "code": 200
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseTrades (data, market, since, limit);
    }

    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name bitbns#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the bitbns api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchTrades() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'coin': market['baseId'],
            'market': market['quoteId'],
        };
        const response = await this.wwwGetExchangeDataTradedetails (this.extend (request, params));
        //
        //     [
        //         {"tradeId":"1909151","price":"61904.6300","quote_volume":1618.05,"base_volume":0.02607254,"timestamp":1634548602000,"type":"buy"},
        //         {"tradeId":"1909153","price":"61893.9000","quote_volume":16384.42,"base_volume":0.26405767,"timestamp":1634548999000,"type":"sell"},
        //         {"tradeId":"1909155","price":"61853.1100","quote_volume":2304.37,"base_volume":0.03716263,"timestamp":1634549670000,"type":"sell"}
        //     }
        //
        return this.parseTrades (response, market, since, limit);
    }

    async fetchDeposits (code: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name bitbns#fetchDeposits
         * @description fetch all deposits made to an account
         * @param {string} code unified currency code
         * @param {int|undefined} since the earliest time in ms to fetch deposits for
         * @param {int|undefined} limit the maximum number of deposits structures to retrieve
         * @param {object} params extra parameters specific to the bitbns api endpoint
         * @returns {[object]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        if (code === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchDeposits() requires a currency code argument');
        }
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'symbol': currency['id'],
            'page': 0,
        };
        const response = await this.v1PostDepositHistorySymbol (this.extend (request, params));
        //
        //     {
        //         "data":[
        //             {
        //                 "type":"USDT deposited",
        //                 "typeI":1,
        //                 "amount":100,
        //                 "date":"2021-04-24T14:56:04.000Z",
        //                 "unit":"USDT",
        //                 "factor":100,
        //                 "fee":0,
        //                 "delh_btc":0,
        //                 "delh_inr":0,
        //                 "rate":0,
        //                 "del_btc":10000,
        //                 "del_inr":0
        //             }
        //         ],
        //         "status":1,
        //         "error":null,
        //         "code":200
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseTransactions (data, currency, since, limit);
    }

    async fetchWithdrawals (code: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name bitbns#fetchWithdrawals
         * @description fetch all withdrawals made from an account
         * @param {string} code unified currency code
         * @param {int|undefined} since the earliest time in ms to fetch withdrawals for
         * @param {int|undefined} limit the maximum number of withdrawals structures to retrieve
         * @param {object} params extra parameters specific to the bitbns api endpoint
         * @returns {[object]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        if (code === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchWithdrawals() requires a currency code argument');
        }
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'symbol': currency['id'],
            'page': 0,
        };
        const response = await this.v1PostWithdrawHistorySymbol (this.extend (request, params));
        //
        //     ...
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseTransactions (data, currency, since, limit);
    }

    parseTransactionStatusByType (status, type = undefined) {
        const statusesByType = {
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
        const statuses = this.safeValue (statusesByType, type, {});
        return this.safeString (statuses, status, status);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        // fetchDeposits
        //
        //     {
        //         "type":"USDT deposited",
        //         "typeI":1,
        //         "amount":100,
        //         "date":"2021-04-24T14:56:04.000Z",
        //         "unit":"USDT",
        //         "factor":100,
        //         "fee":0,
        //         "delh_btc":0,
        //         "delh_inr":0,
        //         "rate":0,
        //         "del_btc":10000,
        //         "del_inr":0
        //     }
        //
        // fetchWithdrawals
        //
        //     ...
        //
        const currencyId = this.safeString (transaction, 'unit');
        const code = this.safeCurrencyCode (currencyId, currency);
        const timestamp = this.parse8601 (this.safeString2 (transaction, 'date', 'timestamp'));
        let type = this.safeString (transaction, 'type');
        const expTime = this.safeString (transaction, 'expTime', '');
        let status = undefined;
        if (type !== undefined) {
            if (type.indexOf ('deposit') >= 0) {
                type = 'deposit';
                status = 'ok';
            } else if (type.indexOf ('withdraw') >= 0 || expTime.indexOf ('withdraw') >= 0) {
                type = 'withdrawal';
            }
        }
        // const status = this.parseTransactionStatusByType (this.safeString (transaction, 'status'), type);
        const amount = this.safeNumber (transaction, 'amount');
        const feeCost = this.safeNumber (transaction, 'fee');
        let fee = undefined;
        if (feeCost !== undefined) {
            fee = { 'currency': code, 'cost': feeCost };
        }
        return {
            'info': transaction,
            'id': undefined,
            'txid': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'network': undefined,
            'address': undefined,
            'addressTo': undefined,
            'addressFrom': undefined,
            'tag': undefined,
            'tagTo': undefined,
            'tagFrom': undefined,
            'type': type,
            'amount': amount,
            'currency': code,
            'status': status,
            'updated': undefined,
            'internal': undefined,
            'fee': fee,
        };
    }

    async fetchDepositAddress (code: string, params = {}) {
        /**
         * @method
         * @name bitbns#fetchDepositAddress
         * @description fetch the deposit address for a currency associated with this account
         * @param {string} code unified currency code
         * @param {object} params extra parameters specific to the bitbns api endpoint
         * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
         */
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'symbol': currency['id'],
        };
        const response = await this.v1PostGetCoinAddressSymbol (this.extend (request, params));
        //
        //     {
        //         "data":{
        //             "token":"0x680dee9edfff0c397736e10b017cf6a0aee4ba31",
        //             "expiry":"2022-04-24 22:30:11"
        //         },
        //         "status":1,
        //         "error":null
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const address = this.safeString (data, 'token');
        const tag = this.safeString (data, 'tag');
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'network': undefined,
            'info': response,
        };
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'www', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const urls = this.urls as any;
        if (!(api in urls['api'])) {
            throw new ExchangeError (this.id + ' does not have a testnet/sandbox URL for ' + api + ' endpoints');
        }
        if (api !== 'www') {
            this.checkRequiredCredentials ();
            headers = {
                'X-BITBNS-APIKEY': this.apiKey,
            };
        }
        const baseUrl = this.implodeHostname (this.urls['api'][api]);
        let url = baseUrl + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        const nonce = this.nonce ().toString ();
        if (method === 'GET') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else if (method === 'POST') {
            if (Object.keys (query).length) {
                body = this.json (query);
            } else {
                body = '{}';
            }
            const auth = {
                'timeStamp_nonce': nonce,
                'body': body,
            };
            const payload = this.stringToBase64 (this.json (auth));
            const signature = this.hmac (payload, this.encode (this.secret), sha512);
            headers['X-BITBNS-PAYLOAD'] = payload;
            headers['X-BITBNS-SIGNATURE'] = signature;
            headers['Content-Type'] = 'application/x-www-form-urlencoded';
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return undefined; // fallback to default error handler
        }
        //
        //     {"msg":"Invalid Request","status":-1,"code":400}
        //     {"data":[],"status":0,"error":"Nothing to show","code":417}
        //
        const code = this.safeString (response, 'code');
        const message = this.safeString (response, 'msg');
        const error = (code !== undefined) && (code !== '200') && (code !== '204');
        if (error || (message !== undefined)) {
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions['exact'], code, feedback);
            this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
            throw new ExchangeError (feedback); // unknown message
        }
        return undefined;
    }
}
