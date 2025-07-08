
//  ---------------------------------------------------------------------------

import Exchange from './abstract/zebpayfutures.js';
import { TICK_SIZE } from './base/functions/number.js';
import { BadRequest, AuthenticationError, NotSupported, RateLimitExceeded, ExchangeNotAvailable, OrderNotFound, ArgumentsRequired, InvalidOrder, ExchangeError } from './base/errors.js';
import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
import type { Balances, Dict, Int, int, Leverage, Leverages, MarginModification, Market, Num, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, TradingFeeInterface, TradingFees } from './base/types.js';

//  ---------------------------------------------------------------------------

/**
 * @class zebpayfutures
 * @augments Exchange
 */
export default class zebpayfutures extends Exchange {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'zebpayfutures',
            'name': 'Zebpay Futures',
            'countries': [ 'IN' ],
            'rateLimit': 0,
            'version': 'v1',
            'certified': false,
            'pro': false,
            'has': {
                'CORS': undefined,
                'spot': false,
                'margin': false,
                'swap': false,
                'future': true,
                'option': undefined,
                'addMargin': true,
                'cancelOrder': true,
                'closePosition': true,
                'createOrder': true,
                'fetchBalance': true,
                'fetchLeverage': true,
                'fetchLeverages': true,
                'fetchOrderBook': true,
                'fetchPositions': true,
                'fetchStatus': true,
                'fetchTime': true,
                'fetchTradingFee': true,
                'fetchTradingFees': true,
                'reduceMargin': true,
                'setLeverage': true,
            },
            'timeframes': {
                '1m': 1,
                '5m': 5,
                '15m': 15,
                '30m': 30,
                '1h': 60,
                '2h': 120,
                '4h': 480,
                '12h': 720,
                '1d': 1440,
                '1w': 10080,
            },
            'urls': {
                'logo': '',
                'api': {
                    'public': 'https://futuresbe.zebpay.com',
                    'private': 'https://futuresbe.zebpay.com',
                },
                'www': 'https://www.zebpay.com',
                'doc': '',
                'fees': '',
            },
            'api': {
                'public': {
                    'get': {
                        'system/time': 10,
                        'system/status': 10,
                        'exchange/tradefee': 10,
                        'exchange/tradefees': 10,
                        'market/orderBook': 10,
                        'market/ticker24Hr': 10,
                        'market/markets': 10,
                    },
                },
                'private': {
                    'get': {
                        'wallet/balance': 10,
                        'trade/order': 10,
                        'trade/order/open-orders': 10,
                        'trade/userLeverages': 10,
                        'trade/userLeverage': 10,
                        'trade/positions': 10,
                    },
                    'post': {
                        'trade/order': 10,
                        'trade/order/addTPSL': 10,
                        'trade/addMargin': 10,
                        'trade/reduceMargin': 10,
                        'trade/position/close': 10,
                        'trade/update/userLeverage': 10,
                    },
                    'delete': {
                        'trade/order': 10,
                    },
                },
            },
            'precisionMode': TICK_SIZE,
            'fees': {},
            'commonCurrencies': {
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'options': {},
            'features': {},
            'exceptions': {
                'exact': {
                    '400': BadRequest, // Bad Request -- Invalid request format
                    '401': AuthenticationError, // Unauthorized -- Invalid API Key
                    '403': NotSupported, // Forbidden -- The request is forbidden
                    '404': NotSupported, // Not Found -- The specified resource could not be found
                    '429': RateLimitExceeded, // Too Many Requests -- Access limit breached
                    '500': ExchangeNotAvailable, // Internal Server Error -- We had a problem with our server. Try again later.
                    '503': ExchangeNotAvailable, // Service Unavailable -- We're temporarily offline for maintenance. Please try again later.
                },
                'broad': {
                    'Position does not exist': OrderNotFound, // { "code":"200000", "msg":"Position does not exist" }
                },
            },
        });
    }

    /**
     * @method
     * @name zebpayfutures#fetchStatus
     * @description the latest known information on the availability of the exchange API
     * @see https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/public-endpoints/system.md#get-system-status
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [status structure]{@link https://docs.ccxt.com/#/?id=exchange-status-structure}
     */
    async fetchStatus (params = {}) {
        const response = await this.publicGetSystemStatus (params);
        //
        // {
        //     "statusDescription": "OK",
        //     "data":
        //      {
        //        "systemStatus": "ok"
        //       }
        //     "statusCode": 200,
        //     "customMessage": ["OK"]
        // }
        //
        const data = this.safeDict (response, 'data', {});
        const status = this.safeString (data, 'systemStatus');
        return {
            'status': status,
            'updated': undefined,
            'eta': undefined,
            'url': undefined,
            'info': response,
        };
    }

    /**
     * @method
     * @name zebpayfutures#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the poloniexfutures server
     * @see https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/public-endpoints/system.md#get-system-time
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the poloniexfutures server
     */
    async fetchTime (params = {}): Promise<Int> {
        const response = await this.publicGetSystemTime (params);
        //
        // {
        //     "statusDescription": "OK",
        //     "data":
        //      {
        //        "timestamp": 1546837113087
        //      }
        //     "statusCode": 200,
        //     "customMessage": ["OK"]
        // }
        //
        const data = this.safeDict (response, 'data', {});
        const time = this.safeInteger (data, 'timestamp');
        return time;
    }

    /**
     * @method
     * @name zebpayfutures#fetchStatus
     * @description the latest known information on the availability of the exchange API
     * @see https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/public-endpoints/exchange.md#get-trade-fee-single-symbol
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [status structure]{@link https://docs.ccxt.com/#/?id=exchange-status-structure}
     */
    async fetchTradingFee (symbol: string, params = {}): Promise<TradingFeeInterface> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        const response = await this.publicGetExchangeTradefee (this.extend (request, params));
        //
        // {
        //     "statusDescription": "OK",
        //     "data":
        //     [
        //       {
        //         "symbol": "BTCINR",
        //         "takerFee": "0.01",
        //         "makerFee": "0.05"
        //       }
        //     ] ,
        //     "statusCode": 200,
        //     "customMessage": ["OK"]
        // }
        //
        const data = this.safeList (response, 'data', []);
        const first = this.safeDict (data, 0);
        return {
            'info': response,
            'symbol': symbol,
            'maker': this.safeNumber (first, 'makerFee'),
            'taker': this.safeNumber (first, 'takerFee'),
            'percentage': undefined,
            'tierBased': undefined,
        };
    }

    /**
     * @method
     * @name zebpayfutures#fetchTradingFees
     * @description the latest known information on the availability of the exchange API
     * @see https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/public-endpoints/exchange.md#get-trade-fees-all-symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [status structure]{@link https://docs.ccxt.com/#/?id=exchange-status-structure}
     */
    async fetchTradingFees (params = {}): Promise<TradingFees> {
        const response = await this.publicGetExchangeTradefees (params);
        //
        // {
        //     "statusDescription": "OK",
        //     "data": [
        //         {
        //             "symbol": "BTCINR",
        //             "takerFee": "0.01",
        //             "makerFee": "0.05"
        //         }
        //     ],
        //     "statusCode": 200,
        //     "customMessage": ["OK"]
        // }
        //
        const fees = this.safeList (response, 'data', []);
        const result: Dict = {};
        for (let i = 0; i < fees.length; i++) {
            const fee = this.parseTradingFee (fees[i]);
            const symbol = fee['symbol'];
            result[symbol] = fee;
        }
        return result;
    }

    /**
     * @method
     * @name zebpayfutures#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/public-endpoints/market.md#get-order-book
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        const response = await this.publicGetMarketOrderBook (this.extend (request, params));
        //
        // {
        //     "statusDescription": "OK",
        //     "data":
        //       {
        //         "symbol": "BTCINR",
        //         "asks": [
        //                 [5000, 1000],           //Price, quantity
        //                 [6000, 1983]            //Price, quantity
        //         ],
        //         "bids": [
        //                 [3200, 800],            //Price, quantity
        //                 [3100, 100]             //Price, quantity
        //         ],
        //         "timestamp": 1710156789123      // timestamp
        //         "datetime": null                // datetime
        //         "nonce": 1710156789123          // nonce
        //       }
        //     ] ,
        //     "statusCode": 200,
        //     "customMessage": ["OK"]
        // }
        const data = this.safeDict (response, 'data', {});
        const timestamp = this.parseToInt (this.safeInteger (data, 'timestamp') / 1000000);
        const orderbook = this.parseOrderBook (data, market['symbol'], timestamp, 'bids', 'asks', 0, 1);
        orderbook['nonce'] = this.safeInteger (data, 'nonce');
        return orderbook;
    }

    /**
     * @method
     * @name zebpayfutures#fetchMarkets
     * @description retrieves data on all markets for zebpayfutures
     * @see https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/public-endpoints/market.md#get-market-info
     * @param {object} [params] extra parameters specific to the exchange api endpoint
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets (params = {}): Promise<Market[]> {
        const response = await this.publicGetMarketMarkets (params);
        //
        //    {
        //        "data": {
        //            "symbol": "ETHUSDT",
        //            "status": "TRADING",
        //            "mainMarginPercent": "10",
        //            "baseAsset": "ETH",
        //            "quoteAsset": "USDT",
        //            "pricePrecision": 1,
        //            "quantityPrecision": 0.05,
        //            "baseAssetPrecision": 0,
        //            "quotePrecision": 0,
        //            "orderType": ["LIMIT", "MARKET" ]
        //            "timeInForce": ["GTC"],
        //            "makerFee": "0.01",
        //            "takerFee": "0.01",
        //            "minLeverage": "1",
        //            "maxLeverage": "20"
        //            "tickSz": "0.1",
        //            "lotSz": "0.1"
        //        }
        //    }
        //
        const result = [];
        const data = this.safeDict (response, 'data', {});
        const markets = this.safeList (data, 'symbols', []);
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString (market, 'symbol');
            const baseId = this.safeString (market, 'baseAsset');
            const quoteId = this.safeString (market, 'quoteAsset');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const status = this.safeString (market, 'status');
            const symbol = base + '/' + quote;
            result.push (this.safeMarketStructure ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'spot': false,
                'margin': false,
                'future': true,
                'option': false,
                'active': (status === 'Open'),
                'contract': true,
                'taker': this.safeNumber (market, 'takerFee'),
                'maker': this.safeNumber (market, 'makerFee'),
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': this.safeNumber (market, 'lotSz'),
                    'price': this.safeNumber (market, 'tickSz'),
                },
                'limits': {
                    'leverage': {
                        'min': this.safeNumber (market, 'minLeverage'),
                        'max': this.safeNumber (market, 'maxLeverage'),
                    },
                },
                'info': market,
            }));
        }
        return result;
    }

    /**
     * @method
     * @name zebpayfutures#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/public-endpoints/market.md#get-market-info
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        const response = await this.publicGetMarketTicker24Hr (this.extend (request, params));
        //
        //     {
        //         "statusDescription": "OK",
        //         "statusCode": 200,
        //             "data":
        //                 {
        //                     "symbol": "BTCUSD",
        //                     "timestamp": 1672387200000,
        //                     "high": 16598,
        //                     "low": 16596,
        //                     "vwap": 16464,
        //                     "open": 7510038,
        //                     "close": 7379567,
        //                     "last": 7379530,
        //                     "change": -100,
        //                     "percentage": 1.5,
        //                     "average": 7444748,
        //                     "baseVolume": 326630.508,
        //                     "quoteVolume": 26892164893,
        //                 }
        //         },
        //     }
        //
        return this.parseTicker (this.safeDict (response, 'data', {}), market);
    }

    /**
     * @method
     * @name zebpayfutures#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/private-endpoints/wallet.md#get-wallet-balance
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    async fetchBalance (params = {}): Promise<Balances> {
        await this.loadMarkets ();
        const request: Dict = {};
        const response = await this.privateGetWalletBalance (this.extend (request, params));
        //
        //     {
        //         "data": [
        //              {
        //                 "free": 200,
        //                 "used": 100,
        //                 "total": 300,
        //                 "currency": "INR"
        //              },
        //              {
        //                 "free": 0,
        //                 "used": 0,
        //                 "total": 0,
        //                 "currency": "USDT"
        //              }
        //         ]
        //     }
        //
        return this.parseBalance (response);
    }

    /**
     * @method
     * @name zebpayfutures#createOrder
     * @description Create an order on the exchange
     * @see https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/private-endpoints/trade.md#--create-order
     * @param {string} symbol Unified CCXT market symbol
     * @param {string} type 'limit' or 'market'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount the amount of currency to trade
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params]  extra parameters specific to the exchange API endpoint
     * @param {number} [params.leverage] Leverage size of the order
     * @param {string} [params.formType] The price at which a trigger order is triggered at
     * @param {string} [params.marginAsset] The asset the order creates.
     * @param {boolean} [params.takeProfit] Takeprofit flag for the order.
     * @param {boolean} [params.stopLoss] Stop loss flag for the order.
     * @param {string} [params.positionId] PositionId of the order.
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const marginAsset = this.safeString (params, 'marginAsset', 'INR');
        const leverage = this.safeString (params, 'leverage');
        if (leverage === undefined) {
            throw new ArgumentsRequired (this.id + ' createOrder() requires a leverage parameter argument');
        }
        const formType = this.safeString (params, 'formType', 'ORDER_FORM');
        const upperCaseFormType = formType.toUpperCase ();
        const upperCaseType = type.toUpperCase ();
        const takeProfitPrice = this.safeNumber (params, 'takeProfitPrice');
        const stopLossPrice = this.safeNumber (params, 'stopLossPrice');
        const orderType = this.safeString (params, 'orderType');
        const positionId = this.safeString (params, 'positionId', undefined);
        params = this.omit (params, [ 'marginAsset', 'leverage', 'formType', 'positionId', 'orderType', 'takeProfitPrice', 'stopLossPrice' ]);
        const request: Dict = {
            'formType': upperCaseFormType,
            'amount': parseFloat (this.amountToPrecision (market['symbol'], amount)),
            'side': side.toUpperCase (),
            'marginAsset': marginAsset,
            'leverage': leverage,
            'symbol': market['id'],
        };
        let response;
        const hasTP = takeProfitPrice !== undefined;
        const hasSL = stopLossPrice !== undefined;
        if (hasTP || hasSL) {
            if (hasTP) {
                request['takeProfitPrice'] = parseFloat (this.priceToPrecision (symbol, takeProfitPrice));
            }
            if (hasSL) {
                request['stopLossPrice'] = parseFloat (this.priceToPrecision (symbol, stopLossPrice));
            }
            request['positionId'] = positionId;
            request['orderType'] = orderType;
            response = await this.privatePostTradeOrderAddTPSL (this.extend (request, params));
        } else {
            request['type'] = upperCaseType;
            if (type === 'limit') {
                if (price === undefined) {
                    throw new ArgumentsRequired (this.id + ' createOrder() requires a price argument for limit orders');
                }
                request['price'] = parseFloat (this.priceToPrecision (symbol, price));
            }
            params = this.omit (params, [ 'price' ]);
            response = await this.privatePostTradeOrder (this.extend (request, params));
        }
        //
        //    {
        //        "data": {
        //            "clientOrderId": "619717484f1d010001510cde",
        //        },
        //    }
        //
        const data = this.safeDict (response, 'data', {});
        return this.parseOrder (data, market);
    }

    /**
     * @method
     * @name zebpayfutures#cancelOrder
     * @description cancels an open order
     * @see https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/private-endpoints/trade.md#-cancel-order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {object} [params.timestamp] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelOrder (id: string, symbol: Str = undefined, params = {}) {
        await this.loadMarkets ();
        const request: Dict = {
            'clientOrderId': id,
            'symbol': symbol,
        };
        const response = await this.privateDeleteTradeOrder (this.extend (request, params));
        //
        //    {
        //        "data": {
        //            "clientOrderId": "619714b8b6353000014c505a",
        //            "status": "canceled"
        //        },
        //    }
        //
        return this.safeDict (response, 'data');
    }

    /**
     * @method
     * @name zebpayfutures#addMargin
     * @description add margin
     * @see https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/private-endpoints/trade.md#-add-margin-to-position
     * @param {string} symbol unified market symbol
     * @param {float} amount amount of margin to add
     * @param {object} [params] extra parameters specific to the exchange API endpoint.
     * @param {string} [params.positionId] PositionId of the order to add margin.
     * @param {string} [params.timestamp] Tiemstamp.
     * @returns {object} a [margin structure]{@link https://docs.ccxt.com/#/?id=add-margin-structure}
     */
    async addMargin (symbol: string, amount: number, params = {}): Promise<MarginModification> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const positionId = this.safeString (params, 'positionId');
        if (positionId === undefined) {
            throw new ArgumentsRequired (this.id + ' addMargin() requires a positionId parameter argument');
        }
        params = this.omit (params, [ 'positionId' ]);
        const request: Dict = {
            'symbol': market['id'],
            'amount': amount,
            'positionId': positionId,
        };
        const response = await this.privatePostTradeAddMargin (this.extend (request, params));
        //
        //    {
        //        "code": "200000",
        //        "data": {
        //            "symbol": "BTCINR",
        //            "type": "add",
        //            "amount": 1000,
        //            "code": "INR",
        //            "status": "ok"
        //        }
        //    }
        //
        //
        //    {
        //        "code":"200000",
        //        "msg":"Position does not exist"
        //    }
        //
        const data = this.safeDict (response, 'data');
        return this.extend (this.parseMarginModification (data, market), {
            'amount': amount,
            'direction': 'in',
        });
    }

    /**
     * @method
     * @name zebpayfutures#reduceMargin
     * @description add margin
     * @see https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/private-endpoints/trade.md#-reduce-margin-from-position
     * @param {string} symbol unified market symbol.
     * @param {float} amount amount of margin to add.
     * @param {object} [params] extra parameters specific to the exchange API endpoint.
     * @param {string} [params.positionId] PositionId of the order to add margin.
     * @param {string} [params.timestamp] Tiemstamp.
     * @returns {object} a [margin structure]{@link https://docs.ccxt.com/#/?id=add-margin-structure}
     */
    async reduceMargin (symbol: string, amount: number, params = {}): Promise<MarginModification> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const positionId = this.safeString (params, 'positionId');
        if (positionId === undefined) {
            throw new ArgumentsRequired (this.id + ' reduceMargin() requires a positionId parameter argument');
        }
        params = this.omit (params, [ 'positionId' ]);
        const request: Dict = {
            'symbol': market['id'],
            'amount': amount,
            'positionId': positionId,
        };
        const response = await this.privatePostTradeReduceMargin (this.extend (request, params));
        if (response.statusCode !== 200 && response.statusCode !== '201') {
            throw new ExchangeError (JSON.stringify (response));
        }
        //
        //    {
        //        "code": "200000",
        //        "data": {
        //            "symbol": "BTCINR",
        //            "type": "reduce",
        //            "amount": 1000,
        //            "code": "INR",
        //            "status": "ok"
        //        }
        //    }
        //
        const data = this.safeDict (response, 'data');
        return this.extend (this.parseMarginModification (data, market), {
            'amount': amount,
            'direction': 'out',
        });
    }

    /**
     * @method
     * @name zebpayfutures#fetchOrdersByStatus
     * @description fetches a list of orders placed on the exchange
     * @see https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/private-endpoints/trade.md#-get-open-orders
     * @param {string} status opn orders
     * @param {string} symbol unified symbol for the market to retrieve orders from
     * @param {int} [since] timestamp in ms of the earliest order to retrieve
     * @param {int} [limit] The maximum number of orders to retrieve
     * @param {object} [params] exchange specific parameters
     * @returns An [array of order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrdersByStatus (status, symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        await this.loadMarkets ();
        const request: Dict = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (typeof since !== 'undefined') {
            request['since'] = since;
        } else {
            request['since'] = Date.now ();
        }
        if (typeof limit !== 'undefined') {
            request['limit'] = limit;
        } else {
            request['limit'] = 100;
        }
        const response = await this.privateGetTradeOrderOpenOrders (this.extend (request, params));
        //
        //     {
        //         "data": {
        //             "nextTimeStamp": null,
        //             "totalCount": 100,
        //             "data": [
        //                 {
        //                     "clientOrderId": "64507d02921f1c0001ff6892-123-zeb",
        //                     "datetime": "2025-03-14T14:34:34.4567",
        //                     "timestamp": 1741962557553,
        //                     "status": "open",
        //                     "symbol": "BTCINR",
        //                     "type": "market",
        //                     "timeInForce": "GTC",
        //                     "side": "buy",
        //                     "price": 700000,
        //                     "amount": 0.002,
        //                     "filled": null,
        //                     "remaining": 0.002,
        //                     "trades": []
        //                 }
        //             ]
        //         }
        //     }
        //
        const responseData = this.safeDict (response, 'data', {});
        const orders = this.safeList (responseData, 'data', []);
        return this.parseOrders (orders, market, since, limit);
    }

    /**
     * @method
     * @name zebpayfutures#fetchOpenOrders
     * @description fetches information on multiple open orders made by the user
     * @see https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/private-endpoints/trade.md#-get-open-orders
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        return await this.fetchOrdersByStatus ('open', symbol, since, limit, params);
    }

    /**
     * @method
     * @name zebpayfutures#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/private-endpoints/trade.md#-get-order-details
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] cancel order by client order id
     * @param {string} [params.timestamp] cancel order by client order id
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrder (id: Str, symbol: Str = undefined, params = {}) {
        await this.loadMarkets ();
        const request: Dict = {
            'id': id,
        };
        const response = await this.privateGetTradeOrder (this.extend (request, params));
        //
        //     {
        //         "data": {
        //             "nextTimeStamp": null,
        //             "totalCount": 100,
        //             "data": [
        //                 {
        //                     "clientOrderId": "64507d02921f1c0001ff6892-123-zeb",
        //                     "datetime": "2025-03-14T14:34:34.4567",
        //                     "timestamp": 1741962557553,
        //                     "status": "open",
        //                     "symbol": "BTCINR",
        //                     "type": "market",
        //                     "timeInForce": "GTC",
        //                     "side": "buy",
        //                     "price": 700000,
        //                     "amount": 0.002,
        //                     "filled": null,
        //                     "remaining": 0.002,
        //                     "trades": []
        //                 }
        //             ]
        //         }
        //     }
        //
        const market = (symbol !== undefined) ? this.market (symbol) : undefined;
        const responseData = this.safeDict (response, 'data');
        return this.parseOrder (responseData, market);
    }

    /**
     * @method
     * @name zebpayfutures#closePosition
     * @description closes open positions for a market
     * @see https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/private-endpoints/trade.md#-close-position
     * @param {string} symbol Unified CCXT market symbol
     * @param {string} side not used by kucoinfutures closePositions
     * @param {object} [params] extra parameters specific to the okx api endpoint
     * @param {string} [params.positionId] client order id of the order
     * @returns {object[]} [A list of position structures]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    async closePosition (symbol: string, side: OrderSide = undefined, params = {}): Promise<Order> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const positionId = this.safeString (params, 'positionId');
        params = this.omit (params, [ 'positionId' ]);
        if (positionId === undefined) {
            throw new InvalidOrder (this.id + ' closePosition() requires positionId');
        }
        const request: Dict = {
            'symbol': market['id'],
            'positionId': positionId,
        };
        const response = await this.privatePostTradePositionClose (this.extend (request, params));
        if (response.statusCode !== 200 && response.statusCode !== '201') {
            throw new ExchangeError (JSON.stringify (response));
        }
        const data = this.safeDict (response, 'data');
        return this.parseOrder (data, market);
    }

    /**
     * @method
     * @name zebpayfutures#fetchLeverages
     * @description fetch the set leverage for all contract and margin markets
     * @see https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/private-endpoints/trade.md#-get-all-user-leverages
     * @param {string[]} [symbols] a list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [leverage structures]{@link https://docs.ccxt.com/#/?id=leverage-structure}
     */
    async fetchLeverages (symbols: Strings = undefined, params = {}): Promise<Leverages> {
        await this.loadMarkets ();
        const request: Dict = {};
        const response = await this.privateGetTradeUserLeverages (this.extend (request, params));
        //
        //     {
        //         "leveragePreferences": [
        //             {
        //                 "symbol": "ETHINR",
        //                 "shortLeverage": 1,
        //                 "longLeverage": 10,
        //                 "marginMode": "isolated"
        //             },
        //         ]
        //     }
        //
        const leveragePreferences = this.safeList (response, 'data', []);
        return this.parseLeverages (leveragePreferences, symbols, 'symbol');
    }

    /**
     * @method
     * @name zebpayfutures#fetchLeverage
     * @description fetch the set leverage for a market
     * @see https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/private-endpoints/trade.md#get-user-leverage-single-symbol
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [leverage structure]{@link https://docs.ccxt.com/#/?id=leverage-structure}
     */
    async fetchLeverage (symbol: string, params = {}): Promise<Leverage> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': this.marketId (symbol).toUpperCase (),
        };
        const response = await this.privateGetTradeUserLeverage (this.extend (request, params));
        //
        //     {
        //         "data": { symbol: "ETHINR", longLeverage: 1, shortLeverage: 1, marginMode: "isolated" }
        //     }
        //
        const data = this.safeDict (response, 'data', {});
        return this.parseLeverage (data, market);
    }

    /**
     * @method
     * @name zebpayfutures#setLeverage
     * @description set the level of leverage for a market
     * @see https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/private-endpoints/trade.md#-update-user-leverage
     * @param {float} leverage the rate of leverage
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} response from the exchange
     */
    async setLeverage (leverage: Int, symbol: Str = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' setLeverage() requires a symbol argument');
        }
        await this.loadMarkets ();
        const request: Dict = {
            'leverage': leverage,
            'symbol': this.marketId (symbol).toUpperCase (),
        };
        //
        // { data: { "symbol", "longLeverage": 10, "shortLeverage": 1, "marginMode": "isolated" }
        //
        const response = await this.privatePostTradeUpdateUserLeverage (this.extend (request, params));
        return response;
    }

    /**
     * @method
     * @name zebpayfutures#fetchPositions
     * @see https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/private-endpoints/trade.md#--get-positions
     * @description Fetches current contract trading positions
     * @param {string[]} symbols List of unified symbols
     * @param {object} [params] Not used by krakenfutures
     * @returns Parsed exchange response for positions
     */
    async fetchPositions (symbols: Strings = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        const response = await this.privateGetTradePositions (this.extend (request, params));
        //
        //    {
        //        "data": [
        //            {
        //                "id": "31998678-6056-413f-9d0d-fc3678641650",
        //                "symbol": "ETHINR",
        //                "entryPrice": "0.7533",
        //                "datetime": "2022-03-03T22:51:16.566Z",
        //                "contractSize": "230"
        //            }
        //        ],
        //    }
        //
        const positions = this.safeList (response, 'data');
        const result = this.parsePositions (positions);
        return this.filterByArrayPositions (result, 'symbol', symbols, false);
    }

    parsePosition (position: Dict, market: Market = undefined) {
        //
        // isolated
        //    {
        //        "id":"long",
        //        "symbol":"pf_ftmusd",
        //        "entryPrice":"0.4921",
        //        "datetime":"2023-02-22T11:37:16.685Z",
        //        "contractSize":"1",
        //        "leverage":"1.0"
        //    }
        //
        const leverage = this.safeNumber (position, 'leverage');
        const datetime = this.safeString (position, 'datetime');
        const marketId = this.safeString (position, 'symbol');
        market = this.safeMarket (marketId, market);
        return {
            'info': position,
            'symbol': market['symbol'],
            'timestamp': this.parse8601 (datetime),
            'datetime': datetime,
            'initialMargin': undefined,
            'initialMarginPercentage': undefined,
            'maintenanceMargin': undefined,
            'maintenanceMarginPercentage': undefined,
            'entryPrice': this.safeNumber (position, 'entryPrice'),
            'notional': undefined,
            'leverage': leverage,
            'unrealizedPnl': undefined,
            'contracts': this.safeNumber (position, 'contracts'),
            'contractSize': this.safeNumber (market, 'contractSize'),
            'marginRatio': undefined,
            'liquidationPrice': undefined,
            'markPrice': undefined,
            'collateral': undefined,
            'marginType': 'isolated',
            'side': this.safeString (position, 'side'),
            'percentage': undefined,
        };
    }

    parseLeverage (leverage: Dict, market: Market = undefined): Leverage {
        const marketId = this.safeString (leverage, 'symbol');
        const info = this.safeDict (leverage, 'info');
        const leverageValue = this.safeInteger (leverage, 'longLeverage');
        const leverageValueShort = this.safeInteger (leverage, 'shortLeverage');
        const marginMode = this.safeString (leverage, 'marginMode');
        return {
            'info': info,
            'symbol': this.safeSymbol (marketId, market),
            'marginMode': marginMode,
            'longLeverage': leverageValue,
            'shortLeverage': leverageValueShort,
        } as Leverage;
    }

    parseOrder (order: Dict, market: Market = undefined): Order {
        //
        //      {
        //          "clientOrderId": "64507d02921f1c0001ff6892-123-zeb",
        //          "datetime": "2025-03-14T14:34:34.4567",
        //          "timestamp": 1741962557553,
        //          "status": "open",
        //          "symbol": "BTCINR",
        //          "type": "market",
        //          "timeInForce": "GTC",
        //          "side": "buy",
        //          "price": 700000,
        //          "amount": 0.002,
        //          "filled": null,
        //          "remaining": 0.002,
        //          "trades": []
        //      }
        //
        const marketId = this.safeString (order, 'symbol');
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        const type = this.safeString (order, 'type');
        const timestamp = this.safeInteger (order, 'timestamp');
        const datetime = this.iso8601 (timestamp);
        const price = this.safeString (order, 'price');
        const side = this.safeString (order, 'side');
        const amount = this.safeString (order, 'amount');
        const clientOrderId = this.safeString (order, 'clientOrderId');
        const timeInForce = this.safeString (order, 'timeInForce');
        const status = this.safeString (order, 'status');
        return this.safeOrder ({
            'id': undefined,
            'clientOrderId': clientOrderId,
            'symbol': symbol,
            'type': type,
            'timeInForce': timeInForce,
            'postOnly': undefined,
            'reduceOnly': undefined,
            'side': side,
            'amount': amount,
            'price': price,
            'triggerPrice': undefined,
            'cost': undefined,
            'filled': undefined,
            'remaining': undefined,
            'timestamp': timestamp,
            'datetime': datetime,
            'fee': undefined,
            'status': status,
            'info': order,
            'lastTradeTimestamp': undefined,
            'lastUpdateTimestamp': undefined,
            'average': undefined,
            'trades': undefined,
        }, market);
    }

    parseMarginModification (info, market: Market = undefined): MarginModification {
        //
        //    {
        //         "symbol": "BTCINR",
        //         "type": "reduce",
        //         "amount": 1000,
        //         "code": "INR",
        //         "status": "ok"
        //    }
        //
        const timestamp = Date.now ();
        return {
            'info': info,
            'symbol': this.safeString (info, 'symbol'),
            'type': undefined,
            'marginMode': undefined,
            'amount': this.safeNumber (info, 'amount'),
            'total': undefined,
            'code': this.safeString (info, 'code'),
            'status': this.safeString (info, 'status'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
    }

    parseBalance (response): Balances {
        const result: Dict = {
            'info': response,
            'timestamp': undefined,
            'datetime': undefined,
        };
        const currencyList = this.safeList (response, 'data');
        for (let i = 0; i < currencyList.length; i++) {
            const entry = currencyList[i];
            const account = this.account ();
            account['total'] = this.safeString (entry, 'total');
            account['free'] = this.safeString (entry, 'free');
            account['used'] = this.safeString (entry, 'used');
            const currencyId = this.safeString (entry, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    parseTradingFee (fee: Dict, market: Market = undefined): TradingFeeInterface {
        //
        //     {
        //         "symbol": "ETHUSDT",
        //         "makerFee": 0.001,
        //         "takerFee": 0.001
        //     }
        //
        const marketId = this.safeString (fee, 'symbol');
        const defaultType = (market !== undefined) ? market['type'] : 'contract';
        const symbol = this.safeSymbol (marketId, market, undefined, defaultType);
        return {
            'info': fee,
            'symbol': symbol,
            'maker': this.safeNumber (fee, 'makerFee'),
            'taker': this.safeNumber (fee, 'takerFee'),
            'percentage': undefined,
            'tierBased': undefined,
        };
    }

    parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        //
        //     {
        //          "symbol": "BTCUSD",
        //          "timestamp": 1672387200000,
        //          "high": 16598,
        //          "low": 16596,
        //          "vwap": 16464,
        //          "open": 7510038,
        //          "close": 7379567,
        //          "last": 7379530,
        //          "change": -100,
        //          "c": 1.5,
        //          "average": 7444748,
        //          "baseVolume": 326630.508,
        //          "quoteVolume": 26892164893
        //     }
        //
        const timestamp = this.safeInteger (ticker, 'timestamp');
        const marketType = 'contract';
        const marketId = this.safeString (ticker, 'symbol');
        const symbol = this.safeSymbol (marketId, market, undefined, marketType);
        const last = this.safeInteger (ticker, 'last');
        const avg = this.safeInteger (ticker, 'average');
        const baseVolume = this.safeInteger (ticker, 'baseVolume');
        const quoteVolume = this.safeInteger (ticker, 'quoteVolume');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeInteger (ticker, 'high'),
            'low': this.safeInteger (ticker, 'low'),
            'open': this.safeInteger (ticker, 'open'),
            'close': this.safeInteger (ticker, 'close'),
            'last': last,
            'previousClose': undefined, // previous day close
            'change': this.safeInteger (ticker, 'change'),
            'percentage': this.safeInteger (ticker, 'safeInteger'),
            'average': avg,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        }, market);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api];
        const tail = '/api/' + this.version + '/' + this.implodeParams (path, params);
        url += tail;
        const timestamp = this.milliseconds ().toString ();
        let signature = '';
        const query = this.omit (params, this.extractParams (path));
        const queryLength = Object.keys (query).length;
        if (api === 'public') {
            if (queryLength) {
                url += '?' + this.urlencode (query);
            }
        } else {
            this.checkRequiredCredentials ();
            if (method === 'GET') {
                // For GET/DELETE: Append params to URL and sign the query string || method === 'DELETE'
                params['timestamp'] = timestamp;
                const queryString = this.urlencode (params);
                signature = this.hmac (queryString, this.secret, sha256, 'hex');
                url += '?' + queryString;
            } else {
                // For POST/PUT: Convert body to JSON and sign the stringified payload
                params['timestamp'] = timestamp;
                body = JSON.stringify (params);
                signature = this.hmac (body, this.secret, sha256, 'hex');
            }
            headers = {
                'X-AUTH-APIKEY': this.apiKey,
                'X-AUTH-SIGNATURE': signature,
            };
            headers['Content-Type'] = 'application/json';
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code: int, reason: string, url: string, method: string, headers: Dict, body: string, response, requestHeaders, requestBody) {
        if (!response) {
            this.throwBroadlyMatchedException (this.exceptions['broad'], body, body);
            return undefined;
        }
        if ('statusDescription' in response && response['statusDescription'] !== 'OK') {
            throw new ExchangeError (`${this.id} API error: ${body}`);
        }
        // if ('error' in response) {
        //     throw new ExchangeError (`${this.id} API error: ${response.error}`);
        // }
        //
        // bad
        //     { "code": "400100", "msg": "validation.createOrder.clientOidIsRequired" }
        // good
        //     { code: "200000", data: { ... }}
        //
        const errorCode = this.safeString (response, 'code');
        const message = this.safeString (response, 'msg', '');
        const feedback = this.id + ' ' + message;
        this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
        this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
        this.throwBroadlyMatchedException (this.exceptions['broad'], body, feedback);
        return undefined;
    }
}
