
//  ---------------------------------------------------------------------------

import krakenRest from '../kraken.js';
import { ExchangeError, BadSymbol, PermissionDenied, AccountSuspended, BadRequest, InsufficientFunds, InvalidOrder, OrderNotFound, NotSupported, RateLimitExceeded, ExchangeNotAvailable, ChecksumError, AuthenticationError, ArgumentsRequired } from '../base/errors.js';
import { ArrayCache, ArrayCacheByTimestamp, ArrayCacheBySymbolById } from '../base/ws/Cache.js';
import { Precise } from '../base/Precise.js';
import type { Int, Strings, OrderSide, OrderType, Str, OrderBook, Order, Trade, Ticker, Tickers, OHLCV, Num, Dict, Balances, Bool } from '../base/types.js';
import Client from '../base/ws/Client.js';
//  ---------------------------------------------------------------------------

export default class kraken extends krakenRest {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchBalance': true,
                'watchMyTrades': true,
                'watchOHLCV': true,
                'watchOrderBook': true,
                'watchOrderBookForSymbols': true,
                'watchOrders': true,
                'watchTicker': true,
                'watchTickers': true,
                'watchBidsAsks': true,
                'watchTrades': true,
                'watchTradesForSymbols': true,
                'createOrderWs': true,
                'editOrderWs': true,
                'cancelOrderWs': true,
                'cancelOrdersWs': true,
                'cancelAllOrdersWs': true,
                // 'watchHeartbeat': true,
                // 'watchStatus': true,
            },
            'urls': {
                'api': {
                    'ws': {
                        'public': 'wss://ws.kraken.com',
                        'private': 'wss://ws-auth.kraken.com',
                        'privateV2': 'wss://ws-auth.kraken.com/v2',
                        'publicV2': 'wss://ws.kraken.com/v2',
                        'beta': 'wss://beta-ws.kraken.com',
                        'beta-private': 'wss://beta-ws-auth.kraken.com',
                    },
                },
            },
            // 'versions': {
            //     'ws': '0.2.0',
            // },
            'options': {
                'tradesLimit': 1000,
                'OHLCVLimit': 1000,
                'ordersLimit': 1000,
                'symbolsByOrderId': {},
                'watchOrderBook': {
                    'checksum': false,
                },
            },
            'streaming': {
                'ping': this.ping,
                'keepAlive': 6000,
            },
            'exceptions': {
                'ws': {
                    'exact': {
                        'Event(s) not found': BadRequest,
                    },
                    'broad': {
                        'Already subscribed': BadRequest,
                        'Currency pair not in ISO 4217-A3 format': BadSymbol,
                        'Currency pair not supported': BadSymbol,
                        'Malformed request': BadRequest,
                        'Pair field must be an array': BadRequest,
                        'Pair field unsupported for this subscription type': BadRequest,
                        'Pair(s) not found': BadSymbol,
                        'Subscription book depth must be an integer': BadRequest,
                        'Subscription depth not supported': BadRequest,
                        'Subscription field must be an object': BadRequest,
                        'Subscription name invalid': BadRequest,
                        'Subscription object unsupported field': BadRequest,
                        'Subscription ohlc interval must be an integer': BadRequest,
                        'Subscription ohlc interval not supported': BadRequest,
                        'Subscription ohlc requires interval': BadRequest,
                        'EAccount:Invalid permissions': PermissionDenied,
                        'EAuth:Account temporary disabled': AccountSuspended,
                        'EAuth:Account unconfirmed': AuthenticationError,
                        'EAuth:Rate limit exceeded': RateLimitExceeded,
                        'EAuth:Too many requests': RateLimitExceeded,
                        'EDatabase: Internal error (to be deprecated)': ExchangeError,
                        'EGeneral:Internal error[:<code>]': ExchangeError,
                        'EGeneral:Invalid arguments': BadRequest,
                        'EOrder:Cannot open opposing position': InvalidOrder,
                        'EOrder:Cannot open position': InvalidOrder,
                        'EOrder:Insufficient funds (insufficient user funds)': InsufficientFunds,
                        'EOrder:Insufficient margin (exchange does not have sufficient funds to allow margin trading)': InsufficientFunds,
                        'EOrder:Invalid price': InvalidOrder,
                        'EOrder:Margin allowance exceeded': InvalidOrder,
                        'EOrder:Margin level too low': InvalidOrder,
                        'EOrder:Margin position size exceeded (client would exceed the maximum position size for this pair)': InvalidOrder,
                        'EOrder:Order minimum not met (volume too low)': InvalidOrder,
                        'EOrder:Orders limit exceeded': InvalidOrder,
                        'EOrder:Positions limit exceeded': InvalidOrder,
                        'EOrder:Rate limit exceeded': RateLimitExceeded,
                        'EOrder:Scheduled orders limit exceeded': InvalidOrder,
                        'EOrder:Unknown position': OrderNotFound,
                        'EOrder:Unknown order': OrderNotFound,
                        'EOrder:Invalid order': InvalidOrder,
                        'EService:Deadline elapsed': ExchangeNotAvailable,
                        'EService:Market in cancel_only mode': NotSupported,
                        'EService:Market in limit_only mode': NotSupported,
                        'EService:Market in post_only mode': NotSupported,
                        'EService:Unavailable': ExchangeNotAvailable,
                        'ETrade:Invalid request': BadRequest,
                        'ESession:Invalid session': AuthenticationError,
                    },
                },
            },
        });
    }

    orderRequestWs (method: string, symbol: string, type: string, request: Dict, amount: Num, price: Num = undefined, params = {}) {
        const isLimitOrder = type.endsWith ('limit'); // supporting limit, stop-loss-limit, take-profit-limit, etc
        if (isLimitOrder) {
            if (price === undefined) {
                throw new ArgumentsRequired (this.id + ' limit orders require a price argument');
            }
            request['params']['limit_price'] = this.parseToNumeric (this.priceToPrecision (symbol, price));
        }
        const isMarket = (type === 'market');
        let postOnly = undefined;
        [ postOnly, params ] = this.handlePostOnly (isMarket, false, params);
        if (postOnly) {
            request['params']['post_only'] = true;
        }
        const clientOrderId = this.safeString (params, 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['params']['cl_ord_id'] = clientOrderId;
        }
        const cost = this.safeString (params, 'cost');
        if (cost !== undefined) {
            request['params']['order_qty'] = this.parseToNumeric (this.costToPrecision (symbol, cost));
        }
        const stopLoss = this.safeDict (params, 'stopLoss', {});
        const takeProfit = this.safeDict (params, 'takeProfit', {});
        const presetStopLoss = this.safeString (stopLoss, 'triggerPrice');
        const presetTakeProfit = this.safeString (takeProfit, 'triggerPrice');
        const presetStopLossLimit = this.safeString (stopLoss, 'price');
        const presetTakeProfitLimit = this.safeString (takeProfit, 'price');
        const isPresetStopLoss = presetStopLoss !== undefined;
        const isPresetTakeProfit = presetTakeProfit !== undefined;
        const stopLossPrice = this.safeString (params, 'stopLossPrice');
        const takeProfitPrice = this.safeString (params, 'takeProfitPrice');
        const isStopLossPriceOrder = stopLossPrice !== undefined;
        const isTakeProfitPriceOrder = takeProfitPrice !== undefined;
        const trailingAmount = this.safeString (params, 'trailingAmount');
        const trailingPercent = this.safeString (params, 'trailingPercent');
        const trailingLimitAmount = this.safeString (params, 'trailingLimitAmount');
        const trailingLimitPercent = this.safeString (params, 'trailingLimitPercent');
        const isTrailingAmountOrder = trailingAmount !== undefined;
        const isTrailingPercentOrder = trailingPercent !== undefined;
        const isTrailingLimitAmountOrder = trailingLimitAmount !== undefined;
        const isTrailingLimitPercentOrder = trailingLimitPercent !== undefined;
        const offset = this.safeString (params, 'offset', ''); // can set this to - for minus
        const trailingAmountString = (trailingAmount !== undefined) ? offset + this.numberToString (trailingAmount) : undefined;
        const trailingPercentString = (trailingPercent !== undefined) ? offset + this.numberToString (trailingPercent) : undefined;
        const trailingLimitAmountString = (trailingLimitAmount !== undefined) ? offset + this.numberToString (trailingLimitAmount) : undefined;
        const trailingLimitPercentString = (trailingLimitPercent !== undefined) ? offset + this.numberToString (trailingLimitPercent) : undefined;
        const priceType = (isTrailingPercentOrder || isTrailingLimitPercentOrder) ? 'pct' : 'quote';
        if (method === 'createOrderWs') {
            const reduceOnly = this.safeBool (params, 'reduceOnly');
            if (reduceOnly) {
                request['params']['reduce_only'] = true;
            }
            const timeInForce = this.safeStringLower (params, 'timeInForce');
            if (timeInForce !== undefined) {
                request['params']['time_in_force'] = timeInForce;
            }
            params = this.omit (params, [ 'reduceOnly', 'timeInForce' ]);
            if (isStopLossPriceOrder || isTakeProfitPriceOrder || isTrailingAmountOrder || isTrailingPercentOrder || isTrailingLimitAmountOrder || isTrailingLimitPercentOrder) {
                request['params']['triggers'] = {};
            }
            if (isPresetStopLoss || isPresetTakeProfit) {
                request['params']['conditional'] = {};
                if (isPresetStopLoss) {
                    request['params']['conditional']['order_type'] = 'stop-loss';
                    request['params']['conditional']['trigger_price'] = this.parseToNumeric (this.priceToPrecision (symbol, presetStopLoss));
                } else if (isPresetTakeProfit) {
                    request['params']['conditional']['order_type'] = 'take-profit';
                    request['params']['conditional']['trigger_price'] = this.parseToNumeric (this.priceToPrecision (symbol, presetTakeProfit));
                }
                if (presetStopLossLimit !== undefined) {
                    request['params']['conditional']['order_type'] = 'stop-loss-limit';
                    request['params']['conditional']['limit_price'] = this.parseToNumeric (this.priceToPrecision (symbol, presetStopLossLimit));
                } else if (presetTakeProfitLimit !== undefined) {
                    request['params']['conditional']['order_type'] = 'take-profit-limit';
                    request['params']['conditional']['limit_price'] = this.parseToNumeric (this.priceToPrecision (symbol, presetTakeProfitLimit));
                }
                params = this.omit (params, [ 'stopLoss', 'takeProfit' ]);
            } else if (isStopLossPriceOrder || isTakeProfitPriceOrder) {
                if (isStopLossPriceOrder) {
                    request['params']['triggers']['price'] = this.parseToNumeric (this.priceToPrecision (symbol, stopLossPrice));
                    if (isLimitOrder) {
                        request['params']['order_type'] = 'stop-loss-limit';
                    } else {
                        request['params']['order_type'] = 'stop-loss';
                    }
                } else {
                    request['params']['triggers']['price'] = this.parseToNumeric (this.priceToPrecision (symbol, takeProfitPrice));
                    if (isLimitOrder) {
                        request['params']['order_type'] = 'take-profit-limit';
                    } else {
                        request['params']['order_type'] = 'take-profit';
                    }
                }
            } else if (isTrailingAmountOrder || isTrailingPercentOrder || isTrailingLimitAmountOrder || isTrailingLimitPercentOrder) {
                request['params']['triggers']['price_type'] = priceType;
                if (!isLimitOrder && (isTrailingAmountOrder || isTrailingPercentOrder)) {
                    request['params']['order_type'] = 'trailing-stop';
                    if (isTrailingAmountOrder) {
                        request['params']['triggers']['price'] = this.parseToNumeric (trailingAmountString);
                    } else {
                        request['params']['triggers']['price'] = this.parseToNumeric (trailingPercentString);
                    }
                } else {
                    // trailing limit orders are not conventionally supported because the static limit_price_type param is not available for trailing-stop-limit orders
                    request['params']['limit_price_type'] = priceType;
                    request['params']['order_type'] = 'trailing-stop-limit';
                    if (isTrailingLimitAmountOrder) {
                        request['params']['triggers']['price'] = this.parseToNumeric (trailingLimitAmountString);
                    } else {
                        request['params']['triggers']['price'] = this.parseToNumeric (trailingLimitPercentString);
                    }
                }
            }
        } else if (method === 'editOrderWs') {
            if (isPresetStopLoss || isPresetTakeProfit) {
                throw new NotSupported (this.id + ' editing the stopLoss and takeProfit on existing orders is currently not supported');
            }
            if (isStopLossPriceOrder || isTakeProfitPriceOrder) {
                if (isStopLossPriceOrder) {
                    request['params']['trigger_price'] = this.parseToNumeric (this.priceToPrecision (symbol, stopLossPrice));
                } else {
                    request['params']['trigger_price'] = this.parseToNumeric (this.priceToPrecision (symbol, takeProfitPrice));
                }
            } else if (isTrailingAmountOrder || isTrailingPercentOrder || isTrailingLimitAmountOrder || isTrailingLimitPercentOrder) {
                request['params']['trigger_price_type'] = priceType;
                if (!isLimitOrder && (isTrailingAmountOrder || isTrailingPercentOrder)) {
                    if (isTrailingAmountOrder) {
                        request['params']['trigger_price'] = this.parseToNumeric (trailingAmountString);
                    } else {
                        request['params']['trigger_price'] = this.parseToNumeric (trailingPercentString);
                    }
                } else {
                    request['params']['limit_price_type'] = priceType;
                    if (isTrailingLimitAmountOrder) {
                        request['params']['trigger_price'] = this.parseToNumeric (trailingLimitAmountString);
                    } else {
                        request['params']['trigger_price'] = this.parseToNumeric (trailingLimitPercentString);
                    }
                }
            }
        }
        params = this.omit (params, [ 'clientOrderId', 'cost', 'offset', 'stopLossPrice', 'takeProfitPrice', 'trailingAmount', 'trailingPercent', 'trailingLimitAmount', 'trailingLimitPercent' ]);
        return [ request, params ];
    }

    /**
     * @method
     * @name kraken#createOrderWs
     * @description create a trade order
     * @see https://docs.kraken.com/api/docs/websocket-v2/add_order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createOrderWs (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}): Promise<Order> {
        await this.loadMarkets ();
        const token = await this.authenticate ();
        const market = this.market (symbol);
        const url = this.urls['api']['ws']['privateV2'];
        const requestId = this.requestId ();
        const messageHash = this.numberToString (requestId);
        let request: Dict = {
            'method': 'add_order',
            'params': {
                'order_type': type,
                'side': side,
                'order_qty': this.parseToNumeric (this.amountToPrecision (symbol, amount)),
                'symbol': market['symbol'],
                'token': token,
            },
            'req_id': requestId,
        };
        [ request, params ] = this.orderRequestWs ('createOrderWs', symbol, type, request, amount, price, params);
        return await this.watch (url, messageHash, this.extend (request, params), messageHash);
    }

    handleCreateEditOrder (client, message) {
        //
        //  createOrder
        //     {
        //         "method": "add_order",
        //         "req_id": 1,
        //         "result": {
        //             "order_id": "OXM2QD-EALR2-YBAVEU"
        //         },
        //         "success": true,
        //         "time_in": "2025-05-13T10:12:13.876173Z",
        //         "time_out": "2025-05-13T10:12:13.890137Z"
        //     }
        //
        //  editOrder
        //     {
        //         "method": "amend_order",
        //         "req_id": 1,
        //         "result": {
        //             "amend_id": "TYDLSQ-OYNYU-3MNRER",
        //             "order_id": "OGL7HR-SWFO4-NRQTHO"
        //         },
        //         "success": true,
        //         "time_in": "2025-05-14T13:54:10.840342Z",
        //         "time_out": "2025-05-14T13:54:10.855046Z"
        //     }
        //
        const result = this.safeDict (message, 'result', {});
        const order = this.parseOrder (result);
        const messageHash = this.safeString2 (message, 'reqid', 'req_id');
        client.resolve (order, messageHash);
    }

    /**
     * @method
     * @name kraken#editOrderWs
     * @description edit a trade order
     * @see https://docs.kraken.com/api/docs/websocket-v2/amend_order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of the currency you want to trade in units of the base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async editOrderWs (id: string, symbol: string, type: OrderType, side: OrderSide, amount: Num = undefined, price: Num = undefined, params = {}): Promise<Order> {
        await this.loadMarkets ();
        const token = await this.authenticate ();
        const url = this.urls['api']['ws']['privateV2'];
        const requestId = this.requestId ();
        const messageHash = this.numberToString (requestId);
        let request: Dict = {
            'method': 'amend_order',
            'params': {
                'order_id': id,
                'order_qty': this.parseToNumeric (this.amountToPrecision (symbol, amount)),
                'token': token,
            },
            'req_id': requestId,
        };
        [ request, params ] = this.orderRequestWs ('editOrderWs', symbol, type, request, amount, price, params);
        return await this.watch (url, messageHash, this.extend (request, params), messageHash);
    }

    /**
     * @method
     * @name kraken#cancelOrdersWs
     * @description cancel multiple orders
     * @see https://docs.kraken.com/api/docs/websocket-v2/cancel_order
     * @param {string[]} ids order ids
     * @param {string} [symbol] unified market symbol, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelOrdersWs (ids: string[], symbol: Str = undefined, params = {}) {
        if (symbol !== undefined) {
            throw new NotSupported (this.id + ' cancelOrdersWs () does not support cancelling orders for a specific symbol.');
        }
        await this.loadMarkets ();
        const token = await this.authenticate ();
        const url = this.urls['api']['ws']['privateV2'];
        const requestId = this.requestId ();
        const messageHash = this.numberToString (requestId);
        const request: Dict = {
            'method': 'cancel_order',
            'params': {
                'order_id': ids,
                'token': token,
            },
            'req_id': requestId,
        };
        return await this.watch (url, messageHash, this.extend (request, params), messageHash) as Order[];
    }

    /**
     * @method
     * @name kraken#cancelOrderWs
     * @description cancels an open order
     * @see https://docs.kraken.com/api/docs/websocket-v2/cancel_order
     * @param {string} id order id
     * @param {string} [symbol] unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelOrderWs (id: string, symbol: Str = undefined, params = {}): Promise<Order> {
        if (symbol !== undefined) {
            throw new NotSupported (this.id + ' cancelOrderWs () does not support cancelling orders for a specific symbol.');
        }
        await this.loadMarkets ();
        const token = await this.authenticate ();
        const url = this.urls['api']['ws']['privateV2'];
        const requestId = this.requestId ();
        const messageHash = this.numberToString (requestId);
        const request: Dict = {
            'method': 'cancel_order',
            'params': {
                'order_id': [ id ],
                'token': token,
            },
            'req_id': requestId,
        };
        return await this.watch (url, messageHash, this.extend (request, params), messageHash);
    }

    handleCancelOrder (client, message) {
        //
        //     {
        //         "method": "cancel_order",
        //         "req_id": 123456789,
        //         "result": {
        //             "order_id": "OKAGJC-YHIWK-WIOZWG"
        //         },
        //         "success": true,
        //         "time_in": "2023-09-21T14:36:57.428972Z",
        //         "time_out": "2023-09-21T14:36:57.437952Z"
        //     }
        //
        const reqId = this.safeString (message, 'req_id');
        client.resolve (message, reqId);
    }

    /**
     * @method
     * @name kraken#cancelAllOrdersWs
     * @description cancel all open orders
     * @see https://docs.kraken.com/api/docs/websocket-v2/cancel_all
     * @param {string} [symbol] unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelAllOrdersWs (symbol: Str = undefined, params = {}): Promise<Order[]> {
        if (symbol !== undefined) {
            throw new NotSupported (this.id + ' cancelAllOrdersWs () does not support cancelling orders in a specific market.');
        }
        await this.loadMarkets ();
        const token = await this.authenticate ();
        const url = this.urls['api']['ws']['privateV2'];
        const requestId = this.requestId ();
        const messageHash = this.numberToString (requestId);
        const request: Dict = {
            'method': 'cancel_all',
            'params': {
                'token': token,
            },
            'req_id': requestId,
        };
        return await this.watch (url, messageHash, this.extend (request, params), messageHash);
    }

    handleCancelAllOrders (client, message) {
        //
        //     {
        //         "method": "cancel_all",
        //         "req_id": 123456789,
        //         "result": {
        //             "count": 1
        //         },
        //         "success": true,
        //         "time_in": "2023-09-21T14:36:57.428972Z",
        //         "time_out": "2023-09-21T14:36:57.437952Z"
        //     }
        //
        const reqId = this.safeString (message, 'req_id');
        client.resolve (message, reqId);
    }

    handleTicker (client, message) {
        //
        //     {
        //         "channel": "ticker",
        //         "type": "snapshot",
        //         "data": [
        //             {
        //                 "symbol": "BTC/USD",
        //                 "bid": 108359.8,
        //                 "bid_qty": 0.01362603,
        //                 "ask": 108359.9,
        //                 "ask_qty": 17.17988863,
        //                 "last": 108359.8,
        //                 "volume": 2158.32346723,
        //                 "vwap": 108894.5,
        //                 "low": 106824,
        //                 "high": 111300,
        //                 "change": -2679.9,
        //                 "change_pct": -2.41
        //             }
        //         ]
        //     }
        //
        const data = this.safeList (message, 'data', []);
        const ticker = data[0];
        const symbol = this.safeString (ticker, 'symbol');
        const messageHash = this.getMessageHash ('ticker', undefined, symbol);
        const vwap = this.safeString (ticker, 'vwap');
        let quoteVolume = undefined;
        const baseVolume = this.safeString (ticker, 'volume');
        if (baseVolume !== undefined && vwap !== undefined) {
            quoteVolume = Precise.stringMul (baseVolume, vwap);
        }
        const last = this.safeString (ticker, 'last');
        const result = this.safeTicker ({
            'symbol': symbol,
            'timestamp': undefined,
            'datetime': undefined,
            'high': this.safeString (ticker, 'high'),
            'low': this.safeString (ticker, 'low'),
            'bid': this.safeString (ticker, 'bid'),
            'bidVolume': this.safeString (ticker, 'bid_qty'),
            'ask': this.safeString (ticker, 'ask'),
            'askVolume': this.safeString (ticker, 'ask_qty'),
            'vwap': vwap,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': this.safeString (ticker, 'change'),
            'percentage': this.safeString (ticker, 'change_pct'),
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        });
        this.tickers[symbol] = result;
        client.resolve (result, messageHash);
    }

    handleTrades (client: Client, message) {
        //
        //     {
        //         "channel": "trade",
        //         "type": "update",
        //         "data": [
        //             {
        //                 "symbol": "MATIC/USD",
        //                 "side": "sell",
        //                 "price": 0.5117,
        //                 "qty": 40.0,
        //                 "ord_type": "market",
        //                 "trade_id": 4665906,
        //                 "timestamp": "2023-09-25T07:49:37.708706Z"
        //             }
        //         ]
        //     }
        //
        const data = this.safeList (message, 'data', []);
        const trade = data[0];
        const symbol = this.safeString (trade, 'symbol');
        const messageHash = this.getMessageHash ('trade', undefined, symbol);
        let stored = this.safeValue (this.trades, symbol);
        if (stored === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            stored = new ArrayCache (limit);
            this.trades[symbol] = stored;
        }
        const market = this.market (symbol);
        const parsed = this.parseTrades (data, market);
        for (let i = 0; i < parsed.length; i++) {
            stored.append (parsed[i]);
        }
        client.resolve (stored, messageHash);
    }

    handleOHLCV (client: Client, message, subscription) {
        //
        //     {
        //         "channel": "ohlc",
        //         "type": "update",
        //         "timestamp": "2023-10-04T16:26:30.524394914Z",
        //         "data": [
        //             {
        //                 "symbol": "MATIC/USD",
        //                 "open": 0.5624,
        //                 "high": 0.5628,
        //                 "low": 0.5622,
        //                 "close": 0.5627,
        //                 "trades": 12,
        //                 "volume": 30927.68066226,
        //                 "vwap": 0.5626,
        //                 "interval_begin": "2023-10-04T16:25:00.000000000Z",
        //                 "interval": 5,
        //                 "timestamp": "2023-10-04T16:30:00.000000Z"
        //             }
        //         ]
        //     }
        //
        const data = this.safeList (message, 'data', []);
        const first = data[0];
        const symbol = this.safeString (first, 'symbol');
        const interval = this.safeInteger (first, 'interval');
        const timeframe = this.findTimeframe (interval);
        const messageHash = this.getMessageHash ('ohlcv', undefined, symbol);
        let stored = this.safeValue (this.ohlcvs[symbol], timeframe);
        this.ohlcvs[symbol] = this.safeValue (this.ohlcvs, symbol, {});
        if (stored === undefined) {
            const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
            stored = new ArrayCacheByTimestamp (limit);
            this.ohlcvs[symbol][timeframe] = stored;
        }
        const ohlcvsLength = data.length;
        for (let i = 0; i < ohlcvsLength; i++) {
            const candle = data[ohlcvsLength - i - 1];
            const datetime = this.safeString (candle, 'timestamp');
            const timestamp = this.parse8601 (datetime);
            const parsed = [
                timestamp,
                this.safeString (candle, 'open'),
                this.safeString (candle, 'high'),
                this.safeString (candle, 'low'),
                this.safeString (candle, 'close'),
                this.safeString (candle, 'volume'),
            ];
            stored.append (parsed);
        }
        client.resolve (stored, messageHash);
    }

    requestId () {
        // their support said that reqid must be an int32, not documented
        const reqid = this.sum (this.safeInteger (this.options, 'reqid', 0), 1);
        this.options['reqid'] = reqid;
        return reqid;
    }

    /**
     * @method
     * @name kraken#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://docs.kraken.com/api/docs/websocket-v2/ticker
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchTicker (symbol: string, params = {}): Promise<Ticker> {
        await this.loadMarkets ();
        symbol = this.symbol (symbol);
        const tickers = await this.watchTickers ([ symbol ], params);
        return tickers[symbol];
    }

    /**
     * @method
     * @name kraken#watchTickers
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://docs.kraken.com/api/docs/websocket-v2/ticker
     * @param {string[]} symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols, undefined, false);
        const ticker = await this.watchMultiHelper ('ticker', 'ticker', symbols, undefined, params);
        if (this.newUpdates) {
            const result: Dict = {};
            result[ticker['symbol']] = ticker;
            return result;
        }
        return this.filterByArray (this.tickers, 'symbol', symbols);
    }

    /**
     * @method
     * @name kraken#watchBidsAsks
     * @description watches best bid & ask for symbols
     * @see https://docs.kraken.com/api/docs/websocket-v2/ticker
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchBidsAsks (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols, undefined, false);
        params['event_trigger'] = 'bbo';
        const ticker = await this.watchMultiHelper ('bidask', 'ticker', symbols, undefined, params);
        if (this.newUpdates) {
            const result: Dict = {};
            result[ticker['symbol']] = ticker;
            return result;
        }
        return this.filterByArray (this.bidsasks, 'symbol', symbols);
    }

    /**
     * @method
     * @name kraken#watchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://docs.kraken.com/api/docs/websocket-v2/trade
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        return await this.watchTradesForSymbols ([ symbol ], since, limit, params);
    }

    /**
     * @method
     * @name kraken#watchTradesForSymbols
     * @description get the list of most recent trades for a list of symbols
     * @see https://docs.kraken.com/api/docs/websocket-v2/trade
     * @param {string[]} symbols unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async watchTradesForSymbols (symbols: string[], since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        const trades = await this.watchMultiHelper ('trade', 'trade', symbols, undefined, params);
        if (this.newUpdates) {
            const first = this.safeList (trades, 0);
            const tradeSymbol = this.safeString (first, 'symbol');
            limit = trades.getLimit (tradeSymbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    /**
     * @method
     * @name kraken#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.kraken.com/api/docs/websocket-v2/book
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async watchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        return await this.watchOrderBookForSymbols ([ symbol ], limit, params);
    }

    /**
     * @method
     * @name kraken#watchOrderBookForSymbols
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.kraken.com/api/docs/websocket-v2/book
     * @param {string[]} symbols unified array of symbols
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async watchOrderBookForSymbols (symbols: string[], limit: Int = undefined, params = {}): Promise<OrderBook> {
        const requiredParams: Dict = {};
        if (limit !== undefined) {
            if (this.inArray (limit, [ 10, 25, 100, 500, 1000 ])) {
                requiredParams['depth'] = limit; // default 10, valid options 10, 25, 100, 500, 1000
            } else {
                throw new NotSupported (this.id + ' watchOrderBook accepts limit values of 10, 25, 100, 500 and 1000 only');
            }
        }
        const orderbook = await this.watchMultiHelper ('orderbook', 'book', symbols, { 'limit': limit }, this.extend (requiredParams, params));
        return orderbook.limit ();
    }

    /**
     * @method
     * @name kraken#watchOHLCV
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://docs.kraken.com/api/docs/websocket-v2/ohlc
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async watchOHLCV (symbol: string, timeframe: string = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        await this.loadMarkets ();
        const name = 'ohlc';
        const market = this.market (symbol);
        symbol = market['symbol'];
        const url = this.urls['api']['ws']['publicV2'];
        const requestId = this.requestId ();
        const messageHash = this.getMessageHash ('ohlcv', undefined, symbol);
        const subscribe: Dict = {
            'method': 'subscribe',
            'params': {
                'channel': name,
                'symbol': [ symbol ],
                'interval': this.safeValue (this.timeframes, timeframe, timeframe),
            },
            'req_id': requestId,
        };
        const request = this.deepExtend (subscribe, params);
        const ohlcv = await this.watch (url, messageHash, request, messageHash);
        if (this.newUpdates) {
            limit = ohlcv.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (ohlcv, since, limit, 'timestamp', true);
    }

    async loadMarkets (reload = false, params = {}) {
        const markets = await super.loadMarkets (reload, params);
        let marketsByWsName = this.safeValue (this.options, 'marketsByWsName');
        if ((marketsByWsName === undefined) || reload) {
            marketsByWsName = {};
            for (let i = 0; i < this.symbols.length; i++) {
                const symbol = this.symbols[i];
                const market = this.markets[symbol];
                const info = this.safeValue (market, 'info', {});
                const wsName = this.safeString (info, 'wsname');
                marketsByWsName[wsName] = market;
            }
            this.options['marketsByWsName'] = marketsByWsName;
        }
        return markets;
    }

    ping (client: Client) {
        const url = client.url;
        const request = {};
        if (url.indexOf ('v2') >= 0) {
            request['method'] = 'ping';
        } else {
            request['event'] = 'ping';
        }
        return request;
    }

    handlePong (client: Client, message) {
        client.lastPong = this.milliseconds ();
        return message;
    }

    async watchHeartbeat (params = {}) {
        await this.loadMarkets ();
        const event = 'heartbeat';
        const url = this.urls['api']['ws']['publicV2'];
        return await this.watch (url, event);
    }

    handleHeartbeat (client: Client, message) {
        //
        // every second (approx) if no other updates are sent
        //
        //     { "channel": "heartbeat" }
        //
        const event = this.safeString (message, 'channel');
        client.resolve (message, event);
    }

    handleOrderBook (client: Client, message) {
        //
        // first message (snapshot)
        //
        //     {
        //         "channel": "book",
        //         "type": "snapshot",
        //         "data": [
        //             {
        //                 "symbol": "MATIC/USD",
        //                 "bids": [
        //                     {
        //                         "price": 0.5666,
        //                         "qty": 4831.75496356
        //                     },
        //                     {
        //                         "price": 0.5665,
        //                         "qty": 6658.22734739
        //                     }
        //                 ],
        //                 "asks": [
        //                     {
        //                         "price": 0.5668,
        //                         "qty": 4410.79769741
        //                     },
        //                     {
        //                         "price": 0.5669,
        //                         "qty": 4655.40412487
        //                     }
        //                 ],
        //                 "checksum": 2439117997
        //             }
        //         ]
        //     }
        //
        // subsequent updates
        //
        //     {
        //         "channel": "book",
        //         "type": "update",
        //         "data": [
        //             {
        //                 "symbol": "MATIC/USD",
        //                 "bids": [
        //                     {
        //                         "price": 0.5657,
        //                         "qty": 1098.3947558
        //                     }
        //                 ],
        //                 "asks": [],
        //                 "checksum": 2114181697,
        //                 "timestamp": "2023-10-06T17:35:55.440295Z"
        //             }
        //         ]
        //     }
        //
        const type = this.safeString (message, 'type');
        const data = this.safeList (message, 'data', []);
        const first = this.safeDict (data, 0, {});
        const symbol = this.safeString (first, 'symbol');
        const a = this.safeValue (first, 'asks', []);
        const b = this.safeValue (first, 'bids', []);
        const c = this.safeInteger (first, 'checksum');
        const messageHash = this.getMessageHash ('orderbook', undefined, symbol);
        let orderbook = undefined;
        if (type === 'update') {
            orderbook = this.orderbooks[symbol];
            const storedAsks = orderbook['asks'];
            const storedBids = orderbook['bids'];
            if (a !== undefined) {
                this.customHandleDeltas (storedAsks, a);
            }
            if (b !== undefined) {
                this.customHandleDeltas (storedBids, b);
            }
            const datetime = this.safeString (first, 'timestamp');
            orderbook['symbol'] = symbol;
            orderbook['timestamp'] = this.parse8601 (datetime);
            orderbook['datetime'] = datetime;
        } else {
            // snapshot
            const depth = a.length;
            this.orderbooks[symbol] = this.orderBook ({}, depth);
            orderbook = this.orderbooks[symbol];
            const keys = [ 'asks', 'bids' ];
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                const bookside = orderbook[key];
                const deltas = this.safeValue (first, key, []);
                if (deltas.length > 0) {
                    this.customHandleDeltas (bookside, deltas);
                }
            }
            orderbook['symbol'] = symbol;
        }
        orderbook.limit ();
        // checksum temporarily disabled because the exchange checksum was not reliable
        const checksum = this.handleOption ('watchOrderBook', 'checksum', false);
        if (checksum) {
            const payloadArray = [];
            if (c !== undefined) {
                const checkAsks = orderbook['asks'];
                const checkBids = orderbook['bids'];
                // const checkAsks = asks.map ((elem) => [ elem['price'], elem['qty'] ]);
                // const checkBids = bids.map ((elem) => [ elem['price'], elem['qty'] ]);
                for (let i = 0; i < 10; i++) {
                    const currentAsk = this.safeValue (checkAsks, i, {});
                    const formattedAsk = this.formatNumber (currentAsk[0]) + this.formatNumber (currentAsk[1]);
                    payloadArray.push (formattedAsk);
                }
                for (let i = 0; i < 10; i++) {
                    const currentBid = this.safeValue (checkBids, i, {});
                    const formattedBid = this.formatNumber (currentBid[0]) + this.formatNumber (currentBid[1]);
                    payloadArray.push (formattedBid);
                }
            }
            const payload = payloadArray.join ('');
            const localChecksum = this.crc32 (payload, false);
            if (localChecksum !== c) {
                const error = new ChecksumError (this.id + ' ' + this.orderbookChecksumMessage (symbol));
                delete client.subscriptions[messageHash];
                delete this.orderbooks[symbol];
                client.reject (error, messageHash);
                return;
            }
        }
        client.resolve (orderbook, messageHash);
    }

    customHandleDeltas (bookside, deltas) {
        // const sortOrder = (key === 'bids') ? true : false;
        for (let j = 0; j < deltas.length; j++) {
            const delta = deltas[j];
            const price = this.safeNumber (delta, 'price');
            const amount = this.safeNumber (delta, 'qty');
            bookside.store (price, amount);
            // if (amount === 0) {
            //     const index = bookside.findIndex ((x: Int) => x[0] === price);
            //     bookside.splice (index, 1);
            // } else {
            //     bookside.store (price, amount);
            // }
            // bookside = this.sortBy (bookside, 0, sortOrder);
            // bookside.slice (0, 9);
        }
    }

    formatNumber (data) {
        const parts = data.split ('.');
        const integer = this.safeString (parts, 0);
        const decimals = this.safeString (parts, 1, '');
        let joinedResult = integer + decimals;
        let i = 0;
        while (joinedResult[i] === '0') {
            i += 1;
        }
        if (i > 0) {
            joinedResult = joinedResult.slice (i);
        }
        return joinedResult;
    }

    handleSystemStatus (client: Client, message) {
        //
        // todo: answer the question whether handleSystemStatus should be renamed
        // and unified as handleStatus for any usage pattern that
        // involves system status and maintenance updates
        //
        //     {
        //         "connectionID": 15527282728335292000,
        //         "event": "systemStatus",
        //         "status": "online", // online|maintenance|(custom status tbd)
        //         "version": "0.2.0"
        //     }
        //
        // v2
        //     {
        //         channel: 'status',
        //         type: 'update',
        //         data: [
        //             {
        //                 version: '2.0.10',
        //                 system: 'online',
        //                 api_version: 'v2',
        //                 connection_id: 6447481662169813000
        //             }
        //         ]
        //     }
        //
        return message;
    }

    async authenticate (params = {}) {
        const url = this.urls['api']['ws']['private'];
        const client = this.client (url);
        const authenticated = 'authenticated';
        let subscription = this.safeValue (client.subscriptions, authenticated);
        const now = this.seconds ();
        const start = this.safeInteger (subscription, 'start');
        const expires = this.safeInteger (subscription, 'expires');
        if ((subscription === undefined) || ((subscription !== undefined) && (start + expires) <= now)) {
            // https://docs.kraken.com/api/docs/rest-api/get-websockets-token
            const response = await this.privatePostGetWebSocketsToken (params);
            //
            //     {
            //         "error":[],
            //         "result":{
            //             "token":"xeAQ\/RCChBYNVh53sTv1yZ5H4wIbwDF20PiHtTF+4UI",
            //             "expires":900
            //         }
            //     }
            //
            subscription = this.safeDict (response, 'result');
            subscription['start'] = now;
            client.subscriptions[authenticated] = subscription;
        }
        return this.safeString (subscription, 'token');
    }

    async watchPrivate (name, symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        await this.loadMarkets ();
        const token = await this.authenticate ();
        const subscriptionHash = 'executions';
        let messageHash = name;
        if (symbol !== undefined) {
            symbol = this.symbol (symbol);
            messageHash += ':' + symbol;
        }
        const url = this.urls['api']['ws']['privateV2'];
        const requestId = this.requestId ();
        const subscribe: Dict = {
            'method': 'subscribe',
            'params': {
                'channel': 'executions',
                'token': token,
            },
            'req_id': requestId,
        };
        if (params !== undefined) {
            subscribe['params'] = this.deepExtend (subscribe['params'], params);
        }
        const result = await this.watch (url, messageHash, subscribe, subscriptionHash);
        if (this.newUpdates) {
            limit = result.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (result, symbol, since, limit);
    }

    /**
     * @method
     * @name kraken#watchMyTrades
     * @description watches information on multiple trades made by the user
     * @see https://docs.kraken.com/api/docs/websocket-v2/executions
     * @param {string} symbol unified market symbol of the market trades were made in
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async watchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        params['snap_trades'] = true;
        return await this.watchPrivate ('myTrades', symbol, since, limit, params);
    }

    handleMyTrades (client: Client, message, subscription = undefined) {
        //
        //     {
        //         "channel": "executions",
        //         "type": "update",
        //         "data": [
        //             {
        //                 "order_id": "O6NTZC-K6FRH-ATWBCK",
        //                 "exec_id": "T5DIUI-5N4KO-Z5BPXK",
        //                 "exec_type": "trade",
        //                 "trade_id": 8253473,
        //                 "symbol": "USDC/USD",
        //                 "side": "sell",
        //                 "last_qty": 15.44,
        //                 "last_price": 1.0002,
        //                 "liquidity_ind": "t",
        //                 "cost": 15.443088,
        //                 "order_userref": 0,
        //                 "order_status": "filled",
        //                 "order_type": "market",
        //                 "fee_usd_equiv": 0.03088618,
        //                 "fees": [
        //                     {
        //                         "asset": "USD",
        //                         "qty": 0.3458
        //                     }
        //                 ]
        //             }
        //         ],
        //         "sequence": 10
        //     }
        //
        const allTrades = this.safeList (message, 'data', []);
        const allTradesLength = allTrades.length;
        if (allTradesLength > 0) {
            if (this.myTrades === undefined) {
                const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
                this.myTrades = new ArrayCache (limit);
            }
            const stored = this.myTrades;
            const symbols: Dict = {};
            for (let i = 0; i < allTrades.length; i++) {
                const trade = this.safeDict (allTrades, i, {});
                const parsed = this.parseWsTrade (trade);
                stored.append (parsed);
                const symbol = parsed['symbol'];
                symbols[symbol] = true;
            }
            const name = 'myTrades';
            client.resolve (this.myTrades, name);
            const keys = Object.keys (symbols);
            for (let i = 0; i < keys.length; i++) {
                const messageHash = name + ':' + keys[i];
                client.resolve (this.myTrades, messageHash);
            }
        }
    }

    parseWsTrade (trade, market = undefined) {
        //
        //     {
        //         "order_id": "O6NTZC-K6FRH-ATWBCK",
        //         "exec_id": "T5DIUI-5N4KO-Z5BPXK",
        //         "exec_type": "trade",
        //         "trade_id": 8253473,
        //         "symbol": "USDC/USD",
        //         "side": "sell",
        //         "last_qty": 15.44,
        //         "last_price": 1.0002,
        //         "liquidity_ind": "t",
        //         "cost": 15.443088,
        //         "order_userref": 0,
        //         "order_status": "filled",
        //         "order_type": "market",
        //         "fee_usd_equiv": 0.03088618,
        //         "fees": [
        //             {
        //                 "asset": "USD",
        //                 "qty": 0.3458
        //             }
        //         ]
        //     }
        //
        let symbol = this.safeString (trade, 'symbol');
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        let fee = undefined;
        if ('fees' in trade) {
            const fees = this.safeList (trade, 'fees', []);
            const firstFee = this.safeDict (fees, 0, {});
            fee = {
                'cost': this.safeNumber (firstFee, 'qty'),
                'currency': this.safeString (firstFee, 'asset'),
            };
        }
        const datetime = this.safeString (trade, 'timestamp');
        const liquidityIndicator = this.safeString (trade, 'liquidity_ind');
        const takerOrMaker = (liquidityIndicator === 't') ? 'taker' : 'maker';
        return {
            'info': trade,
            'id': this.safeString (trade, 'exec_id'),
            'order': this.safeString (trade, 'order_id'),
            'timestamp': this.parse8601 (datetime),
            'datetime': datetime,
            'symbol': symbol,
            'type': this.safeString (trade, 'order_type'),
            'side': this.safeString (trade, 'side'),
            'takerOrMaker': takerOrMaker,
            'price': this.safeNumber (trade, 'last_price'),
            'amount': this.safeNumber (trade, 'last_qty'),
            'cost': this.safeNumber (trade, 'cost'),
            'fee': fee,
        };
    }

    /**
     * @method
     * @name kraken#watchOrders
     * @description watches information on multiple orders made by the user
     * @see https://docs.kraken.com/api/docs/websocket-v2/executions
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of  orde structures to retrieve
     * @param {object} [params] maximum number of orderic to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async watchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        params['snap_orders'] = true;
        return await this.watchPrivate ('orders', symbol, since, limit, params);
    }

    handleOrders (client: Client, message, subscription = undefined) {
        //
        //     {
        //         "channel": "executions",
        //         "type": "update",
        //         "data": [
        //             {
        //                 "order_id": "OK4GJX-KSTLS-7DZZO5",
        //                 "order_userref": 3,
        //                 "symbol": "BTC/USD",
        //                 "order_qty": 0.005,
        //                 "cum_cost": 0.0,
        //                 "time_in_force": "GTC",
        //                 "exec_type": "pending_new",
        //                 "side": "sell",
        //                 "order_type": "limit",
        //                 "limit_price_type": "static",
        //                 "limit_price": 26500.0,
        //                 "stop_price": 0.0,
        //                 "order_status": "pending_new",
        //                 "fee_usd_equiv": 0.0,
        //                 "fee_ccy_pref": "fciq",
        //                 "timestamp": "2023-09-22T10:33:05.709950Z"
        //             }
        //         ],
        //         "sequence": 8
        //     }
        //
        const allOrders = this.safeList (message, 'data', []);
        const allOrdersLength = allOrders.length;
        if (allOrdersLength > 0) {
            const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
            if (this.orders === undefined) {
                this.orders = new ArrayCacheBySymbolById (limit);
            }
            const stored = this.orders;
            const symbols: Dict = {};
            for (let i = 0; i < allOrders.length; i++) {
                const order = this.safeDict (allOrders, i, {});
                const id = this.safeString (order, 'order_id');
                const parsed = this.parseWsOrder (order);
                const symbol = this.safeString (order, 'symbol');
                const previousOrders = this.safeValue (stored.hashmap, symbol);
                const previousOrder = this.safeValue (previousOrders, id);
                let newOrder = parsed;
                if (previousOrder !== undefined) {
                    const newRawOrder = this.extend (previousOrder['info'], newOrder['info']);
                    newOrder = this.parseWsOrder (newRawOrder);
                }
                const length = stored.length;
                if (length === limit && (previousOrder === undefined)) {
                    const first = stored[0];
                    const symbolsByOrderId = this.safeValue (this.options, 'symbolsByOrderId', {});
                    if (first['id'] in symbolsByOrderId) {
                        delete symbolsByOrderId[first['id']];
                    }
                }
                stored.append (newOrder);
                symbols[symbol] = true;
            }
            const name = 'orders';
            client.resolve (this.orders, name);
            const keys = Object.keys (symbols);
            for (let i = 0; i < keys.length; i++) {
                const messageHash = name + ':' + keys[i];
                client.resolve (this.orders, messageHash);
            }
        }
    }

    parseWsOrder (order, market = undefined) {
        //
        // watchOrders
        //
        // open order
        //     {
        //         "order_id": "OK4GJX-KSTLS-7DZZO5",
        //         "order_userref": 3,
        //         "symbol": "BTC/USD",
        //         "order_qty": 0.005,
        //         "cum_cost": 0.0,
        //         "time_in_force": "GTC",
        //         "exec_type": "pending_new",
        //         "side": "sell",
        //         "order_type": "limit",
        //         "limit_price_type": "static",
        //         "limit_price": 26500.0,
        //         "stop_price": 0.0,
        //         "order_status": "pending_new",
        //         "fee_usd_equiv": 0.0,
        //         "fee_ccy_pref": "fciq",
        //         "timestamp": "2023-09-22T10:33:05.709950Z"
        //     }
        //
        // canceled order
        //
        //     {
        //         "timestamp": "2025-10-11T15:11:47.695226Z",
        //         "order_status": "canceled",
        //         "exec_type": "canceled",
        //         "order_userref": 0,
        //         "order_id": "OGAB7Y-BKX5F-PTK5RW",
        //         "cum_qty": 0,
        //         "cum_cost": 0,
        //         "fee_usd_equiv": 0,
        //         "avg_price": 0,
        //         "cancel_reason": "User requested",
        //         "reason": "User requested"
        //     }
        //
        const fee = {
            'cost': this.safeString (order, 'fee_usd_equiv'),
            'currency': 'USD',
        };
        const stopPrice = this.safeString (order, 'stop_price');
        const datetime = this.safeString (order, 'timestamp');
        return this.safeOrder ({
            'id': this.safeString (order, 'order_id'),
            'clientOrderId': this.safeString (order, 'order_userref'),
            'info': order,
            'timestamp': this.parse8601 (datetime),
            'datetime': datetime,
            'lastTradeTimestamp': undefined,
            'status': this.parseOrderStatus (this.safeString (order, 'order_status')),
            'symbol': this.safeString (order, 'symbol'),
            'type': this.safeString (order, 'order_type'),
            'timeInForce': this.safeString (order, 'time_in_force'),
            'postOnly': undefined,
            'side': this.safeString (order, 'side'),
            'price': this.safeString (order, 'limit_price'),
            'stopPrice': stopPrice,
            'triggerPrice': stopPrice,
            'cost': this.safeString (order, 'cum_cost'),
            'amount': this.safeString2 (order, 'order_qty', 'cum_qty'),
            'filled': undefined,
            'average': this.safeString (order, 'avg_price'),
            'remaining': undefined,
            'fee': fee,
            'trades': undefined,
        });
    }

    async watchMultiHelper (unifiedName: string, channelName: string, symbols: Strings = undefined, subscriptionArgs = undefined, params = {}) {
        await this.loadMarkets ();
        // symbols are required
        symbols = this.marketSymbols (symbols, undefined, false, true, false);
        const messageHashes = [];
        for (let i = 0; i < symbols.length; i++) {
            const eventTrigger = this.safeString (params, 'event_trigger');
            if (eventTrigger !== undefined) {
                messageHashes.push (this.getMessageHash (channelName, undefined, this.symbol (symbols[i])));
            } else {
                messageHashes.push (this.getMessageHash (unifiedName, undefined, this.symbol (symbols[i])));
            }
        }
        const request: Dict = {
            'method': 'subscribe',
            'params': {
                'channel': channelName,
                'symbol': symbols,
            },
            'req_id': this.requestId (),
        };
        request['params'] = this.deepExtend (request['params'], params);
        const url = this.urls['api']['ws']['publicV2'];
        return await this.watchMultiple (url, messageHashes, request, messageHashes, subscriptionArgs);
    }

    /**
     * @method
     * @name kraken#watchBalance
     * @description watch balance and get the amount of funds available for trading or funds locked in orders
     * @see https://docs.kraken.com/api/docs/websocket-v2/balances
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    async watchBalance (params = {}): Promise<Balances> {
        await this.loadMarkets ();
        const token = await this.authenticate ();
        const messageHash = 'balances';
        const url = this.urls['api']['ws']['privateV2'];
        const requestId = this.requestId ();
        const subscribe: Dict = {
            'method': 'subscribe',
            'req_id': requestId,
            'params': {
                'channel': 'balances',
                'token': token,
            },
        };
        const request = this.deepExtend (subscribe, params);
        return await this.watch (url, messageHash, request, messageHash);
    }

    handleBalance (client: Client, message) {
        //
        //     {
        //         "channel": "balances",
        //         "data": [
        //             {
        //                 "asset": "BTC",
        //                 "asset_class": "currency",
        //                 "balance": 1.2,
        //                 "wallets": [
        //                     {
        //                         "type": "spot",
        //                         "id": "main",
        //                         "balance": 1.2
        //                     }
        //                 ]
        //             }
        //         ],
        //         "type": "snapshot",
        //         "sequence": 1
        //     }
        //
        const data = this.safeList (message, 'data', []);
        const result: Dict = { 'info': message };
        for (let i = 0; i < data.length; i++) {
            const currencyId = this.safeString (data[i], 'asset');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            const eq = this.safeString (data[i], 'balance');
            account['total'] = eq;
            result[code] = account;
        }
        const type = 'spot';
        const balance = this.safeBalance (result);
        const oldBalance = this.safeValue (this.balance, type, {});
        const newBalance = this.deepExtend (oldBalance, balance);
        this.balance[type] = this.safeBalance (newBalance);
        const channel = this.safeString (message, 'channel');
        client.resolve (this.balance[type], channel);
    }

    getMessageHash (unifiedElementName: string, subChannelName: Str = undefined, symbol: Str = undefined) {
        // unifiedElementName can be : orderbook, trade, ticker, bidask ...
        // subChannelName only applies to channel that needs specific variation (i.e. depth_50, depth_100..) to be selected
        const withSymbol = symbol !== undefined;
        let messageHash = unifiedElementName;
        if (!withSymbol) {
            messageHash += 's';
        } else {
            messageHash += '@' + symbol;
        }
        if (subChannelName !== undefined) {
            messageHash += '#' + subChannelName;
        }
        return messageHash;
    }

    handleSubscriptionStatus (client: Client, message) {
        //
        // public
        //
        //     {
        //         "channelID": 210,
        //         "channelName": "book-10",
        //         "event": "subscriptionStatus",
        //         "reqid": 1574146735269,
        //         "pair": "ETH/XBT",
        //         "status": "subscribed",
        //         "subscription": { depth: 10, name: "book" }
        //     }
        //
        // private
        //
        //     {
        //         "channelName": "openOrders",
        //         "event": "subscriptionStatus",
        //         "reqid": 1,
        //         "status": "subscribed",
        //         "subscription": { maxratecount: 125, name: "openOrders" }
        //     }
        //
        const channelId = this.safeString (message, 'channelID');
        if (channelId !== undefined) {
            client.subscriptions[channelId] = message;
        }
        // const requestId = this.safeString (message, "reqid");
        // if (requestId in client.futures) {
        //     delete client.futures[requestId];
        // }
    }

    handleErrorMessage (client: Client, message): Bool {
        //
        //     {
        //         "errorMessage": "Currency pair not in ISO 4217-A3 format foobar",
        //         "event": "subscriptionStatus",
        //         "pair": "foobar",
        //         "reqid": 1574146735269,
        //         "status": "error",
        //         "subscription": { name: "ticker" }
        //     }
        //
        // v2
        //     {
        //         "error": "Unsupported field: 'price' for the given msg type: add order",
        //         "method": "add_order",
        //         "success": false,
        //         "time_in": "2025-05-13T08:59:44.803511Z",
        //         "time_out": "2025-05-13T08:59:44.803542Z'
        //     }
        //
        const errorMessage = this.safeString2 (message, 'errorMessage', 'error');
        if (errorMessage !== undefined) {
            const requestId = this.safeString2 (message, 'reqid', 'req_id');
            const broad = this.exceptions['ws']['broad'];
            const broadKey = this.findBroadlyMatchedKey (broad, errorMessage);
            let exception = undefined;
            if (broadKey === undefined) {
                exception = new ExchangeError ((errorMessage as string)); // c# requirement to convert the errorMessage to string
            } else {
                exception = new broad[broadKey] (errorMessage);
            }
            if (requestId !== undefined) {
                client.reject (exception, requestId);
            }
            return false;
        }
        return true;
    }

    handleMessage (client: Client, message) {
        let channel = this.safeString (message, 'channel');
        if (channel !== undefined) {
            if (channel === 'executions') {
                const data = this.safeList (message, 'data', []);
                const first = this.safeDict (data, 0, {});
                const execType = this.safeString (first, 'exec_type');
                channel = (execType === 'trade') ? 'myTrades' : 'orders';
            }
            const methods: Dict = {
                'balances': this.handleBalance,
                'book': this.handleOrderBook,
                'ohlc': this.handleOHLCV,
                'ticker': this.handleTicker,
                'trade': this.handleTrades,
                // private
                'myTrades': this.handleMyTrades,
                'orders': this.handleOrders,
            };
            const method = this.safeValue (methods, channel);
            if (method !== undefined) {
                method.call (this, client, message);
            }
        }
        if (this.handleErrorMessage (client, message)) {
            const event = this.safeString2 (message, 'event', 'method');
            const methods: Dict = {
                'heartbeat': this.handleHeartbeat,
                'systemStatus': this.handleSystemStatus,
                'subscriptionStatus': this.handleSubscriptionStatus,
                'add_order': this.handleCreateEditOrder,
                'amend_order': this.handleCreateEditOrder,
                'cancel_order': this.handleCancelOrder,
                'cancel_all': this.handleCancelAllOrders,
                'pong': this.handlePong,
            };
            const method = this.safeValue (methods, event);
            if (method !== undefined) {
                method.call (this, client, message);
            }
        }
    }
}
